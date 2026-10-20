#!/usr/bin/env node
// czmap - command line tool for the Czech Tourist Map.
// Run "node tools/czmap.mjs help" for usage.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { ROOT, DATA, DIST } from './paths.mjs';
import { loadCountries, selectParts, partFiles, loadPlaces, polyBounds } from './regions.mjs';

const TILES_JAR = path.join(ROOT, 'tiles/target/czmap-tiles.jar');
const VENV_PYTHON = process.platform === 'win32'
  ? path.join(ROOT, '.venv/Scripts/python.exe')
  : path.join(ROOT, '.venv/bin/python');
// Cloudflare caches files up to 512 MB (free plan); R2 free storage is 10 GB.
const SIZE_LIMIT = 500 * 1000 * 1000;
const TOTAL_LIMIT = 10 * 1000 * 1000 * 1000;
const SETS = ['base', 'routes', 'relief', 'contours'];

const HELP = `czmap - build, view and check the Czech Tourist Map

Usage: node tools/czmap.mjs <command> [options]

The map is built in parts (regions/): one part = one OSM extract, files in dist/<part>/.
--country LIST and --part LIST select parts for download, build and info (default: all).

Commands:
  download                Download the OSM extracts and area polygons to data/
  build <set...>          Build PMTiles into dist/<part>/. Sets: base, routes, relief, contours, all
                          Writes dist/regions.json (tile index for the viewer)
  index                   Write dist/regions.json only
  style [--tiles URL]     Write dist/style-tourist.json and dist/style-topo.json (production styles)
        [--variant NAME]  Only this map: tourist or topo
        [--stdout]        Print one style instead of writing it (default map: tourist)
  serve [--port 8080]     Start the viewer at http://localhost:8080
        [--host 0.0.0.0]  Listen on all interfaces (for phones in the same network)
  render                  Render PNG images of the map (headless Chromium)
        --place NAME      Preset from regions/*/places.json ("all" = every preset)
        --center LON,LAT  Map centre (instead of --place)
        --zoom Z          Zoom level (default: preset zoom or 12)
        --size WxH        Image size in CSS px (default 1024x768)
        --ratio N         Pixel ratio (default 1)
        --layers LIST     Visible groups, e.g. base,relief (default: all)
        --variant LIST    Maps to render: tourist, topo, or "all" (default: tourist)
        --compare         One image with the maps side by side (all, or --variant LIST)
        --out FILE|DIR    Output file, or directory for --place all (default: out/)
  release --base-url URL  Prepare a release in dist/: dist/latest.json (catalog) and styles with
          [--version ID]  absolute URLs into v/<version>/ (default version: UTC time, 20261020-0315)
  check                   Validate the styles (both maps) against the MapLibre style spec
  sprite                  Generate the style sprite into sprite/ (after changing tools/sprite.mjs)
  info                    Show PMTiles sizes: 500 MB per file (cache limit), 10 GB in total (R2)
  places                  List render presets (regions/<country>/places.json)
`;

function run(cmd, args, options = {}) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...options });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function mtime(file) {
  return fs.existsSync(file) ? fs.statSync(file).mtimeMs : 0;
}

// Newest modification time of all files in a directory tree.
function newestMtime(dir, skip = []) {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.includes(entry.name)) {
      continue;
    }
    const file = path.join(dir, entry.name);
    newest = Math.max(newest, entry.isDirectory() ? newestMtime(file) : mtime(file));
  }
  return newest;
}

function curl(url, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  run('curl', ['-fSL', '--retry', '3', '-C', '-', '-o', file, url]);
}

function download(parts) {
  for (const part of parts) {
    const files = partFiles(part);
    curl(part.osm, files.osm);
    curl(part.poly, files.poly);
  }
}

// Download what a part needs and is missing.
function ensureInputs(part, { osm = true } = {}) {
  const files = partFiles(part);
  if (!fs.existsSync(files.poly)) {
    curl(part.poly, files.poly);
  }
  if (osm && !fs.existsSync(files.osm)) {
    curl(part.osm, files.osm);
  }
  return files;
}

// Major Java version of the native "java" command, or 0 if it is missing.
function nativeJavaVersion() {
  const result = spawnSync('java', ['-version'], { encoding: 'utf8' });
  const match = /version "(\d+)(?:\.(\d+))?/.exec(`${result.stderr}${result.stdout}`);
  if (result.error || !match) {
    return 0;
  }
  // Java 8 and older report "1.8.0".
  return match[1] === '1' ? Number(match[2]) : Number(match[1]);
}

function hasCommand(cmd) {
  // shell: true resolves .cmd wrappers (mvn.cmd) on Windows.
  const result = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: true });
  return !result.error && result.status === 0;
}

// Native Java 21+ is used when available. Otherwise Java and Maven run in Docker.
// Set CZMAP_DOCKER=1 to force Docker.
function useDocker() {
  if (useDocker.value === undefined) {
    useDocker.value = process.env.CZMAP_DOCKER === '1' || nativeJavaVersion() < 21;
    if (useDocker.value) {
      if (!hasCommand('docker')) {
        console.error('Java 21+ or Docker is required to build vector tiles.');
        process.exit(1);
      }
      console.log('Java 21+ not found, using Docker.');
    }
  }
  return useDocker.value;
}

// Path relative to the project root with forward slashes (valid in the container and on the host).
function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function runInDocker(image, args) {
  const user = process.getuid ? ['--user', `${process.getuid()}:${process.getgid()}`] : [];
  run('docker', ['run', '--rm', ...user, '-v', `${ROOT}:/work`, '-w', '/work', image, ...args]);
}

function runMaven(args) {
  if (useDocker() || !hasCommand('mvn')) {
    // Keep the Maven repository in data/ so downloads are cached between runs.
    runInDocker('maven:3.9-eclipse-temurin-21', ['mvn', '-Dmaven.repo.local=data/m2', ...args]);
  } else {
    run('mvn', args, { shell: process.platform === 'win32' });
  }
}

function runJava(args) {
  if (useDocker()) {
    runInDocker('eclipse-temurin:21-jre', ['java', ...args]);
  } else {
    run('java', args);
  }
}

function buildVector(part, profile, extra) {
  const files = ensureInputs(part, { osm: profile !== 'contours' });
  if (newestMtime(path.join(ROOT, 'tiles'), ['target']) > mtime(TILES_JAR)) {
    runMaven(['-q', '-B', '-f', 'tiles/pom.xml', 'package']);
  }
  // Write to a temp file first, so the old file stays usable in the viewer during the build.
  // Paths are relative to the project root, so they work both natively and in Docker.
  fs.mkdirSync(files.dist, { recursive: true });
  const output = files.pmtiles(profile);
  const tmp = path.join(files.dist, `${profile}.tmp.pmtiles`);
  runJava(['-Xmx6g', '-jar', rel(TILES_JAR),
    `--profile=${profile}`,
    `--osm_path=${rel(files.osm)}`,
    `--contours_path=${rel(files.contours)}`,
    `--output=${rel(tmp)}`,
    `--tmpdir=${rel(path.join(DATA, 'tmp'))}`,
    ...extra]);
  fs.renameSync(tmp, output);
}

function ensureVenv() {
  if (!fs.existsSync(VENV_PYTHON)) {
    run(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'venv', '.venv']);
  }
  run(VENV_PYTHON, ['-m', 'pip', 'install', '-q', '-r', 'relief/requirements.txt']);
}

function buildRelief(part, extra) {
  const files = ensureInputs(part, { osm: false });
  ensureVenv();
  // --source is shared with the contours; other contour options are not for the relief.
  const reliefExtra = extra.filter((a) => a.startsWith('--source') || !isContourOption(a));
  fs.mkdirSync(files.dist, { recursive: true });
  run(VENV_PYTHON, ['relief/build_relief.py', `--poly=${files.poly}`, `--output=${files.pmtiles('relief')}`,
    ...reliefExtra]);
}

// Options of relief/build_contours.py; all other options go to Planetiler.
const CONTOUR_OPTIONS = ['--source', '--interval', '--sigma', '--simplify', '--min-loop', '--border', '--margin',
  '--only', '--workers'];

const isContourOption = (a) => CONTOUR_OPTIONS.some((o) => a === o || a.startsWith(`${o}=`));

// Contours: DTM -> data/contours/<part>.gpkg (Python) -> dist/<part>/contours.pmtiles (Planetiler).
function buildContours(part, extra) {
  const files = ensureInputs(part, { osm: false });
  ensureVenv();
  run(VENV_PYTHON, ['relief/build_contours.py', `--poly=${files.poly}`, `--output=${files.contours}`,
    ...extra.filter(isContourOption)]);
  buildVector(part, 'contours', extra.filter((a) => !isContourOption(a)));
}

function build(sets, extra, parts) {
  if (sets.length === 0 || sets.includes('all')) {
    sets = SETS;
  }
  const unknown = sets.filter((s) => !SETS.includes(s));
  if (unknown.length > 0) {
    console.error(`Unknown set: ${unknown.join(', ')}. Sets: ${SETS.join(', ')}`);
    process.exit(2);
  }
  for (const part of parts) {
    console.log(`== part ${part.id} (${part.name})`);
    for (const set of sets) {
      if (set === 'relief') {
        buildRelief(part, extra);
      } else if (set === 'contours') {
        buildContours(part, extra);
      } else {
        buildVector(part, set, extra);
      }
    }
  }
  writeIndex();
  info(selectParts());
}

// dist/regions.json: parts with their bounds and built sets. The viewer reads it to know which
// file holds a tile (viewer/tiles.js) and where the map is.
function writeIndex() {
  const countries = loadCountries();
  const parts = [];
  for (const country of countries) {
    for (const part of country.parts) {
      const files = partFiles(part);
      const sets = SETS.filter((s) => fs.existsSync(files.pmtiles(s)));
      if (sets.length === 0 || !fs.existsSync(files.poly)) {
        continue;
      }
      parts.push({ id: part.id, country: country.id, name: part.name, bounds: polyBounds(files.poly), sets });
    }
  }
  const bounds = parts.length === 0 ? [-180, -85, 180, 85] : [
    Math.min(...parts.map((p) => p.bounds[0])), Math.min(...parts.map((p) => p.bounds[1])),
    Math.max(...parts.map((p) => p.bounds[2])), Math.max(...parts.map((p) => p.bounds[3])),
  ];
  const index = { view: countries[0]?.view, bounds, parts };
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'regions.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Wrote dist/regions.json (${parts.length} parts)`);
}

async function style({ tiles, stdout, out, variant }) {
  const { buildStyle, THEMES, DEFAULT_THEME } = await import('../style/index.mjs');
  const tilesUrl = tiles || '.';
  const glyphs = tiles
    ? `${new URL('../fonts', `${tiles}/`).href}/{fontstack}/{range}.pbf`
    : './fonts/{fontstack}/{range}.pbf';
  const sprite = tiles ? new URL('../sprite/sprite', `${tiles}/`).href : './sprite/sprite';
  const toJson = (id) => JSON.stringify(buildStyle({ tiles: tilesUrl, glyphs, sprite, variant: id }), null, 2);
  if (stdout) {
    process.stdout.write(toJson(variant || DEFAULT_THEME));
    return;
  }
  // One file per map: dist/style-<id>.json.
  const ids = variant ? [variant] : Object.keys(THEMES);
  if (out && ids.length > 1) {
    console.error('--out needs --variant.');
    process.exit(2);
  }
  for (const id of ids) {
    const file = out || path.join(DIST, `style-${id}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${toJson(id)}\n`);
    console.log(`Wrote ${path.relative(ROOT, file)}`);
  }
}

async function serve({ port, host }) {
  // The viewer loads MapLibre and PMTiles from node_modules. Without them the page stays blank.
  for (const dep of ['maplibre-gl', 'pmtiles']) {
    if (!fs.existsSync(path.join(ROOT, 'node_modules', dep))) {
      console.error(`node_modules/${dep} is missing. Run: npm install`);
      process.exit(1);
    }
  }
  const { startServer } = await import('./server.mjs');
  const { url } = await startServer({ port: Number(port || 8080), host: host || '127.0.0.1' });
  console.log(`Viewer: ${url}`);
  if (!fs.existsSync(path.join(DIST, 'regions.json'))) {
    console.log('Warning: dist/regions.json is missing. Run: node tools/czmap.mjs build (or index)');
  }
}

// One view per style variant, or one comparison view per place.
// Every image name ends with the map id (out/praha-z13-tourist.png) or with "compare".
function expandVariants(views, opts, themes, defaultTheme) {
  const withSuffix = (file, suffix) => file.replace(/\.png$/, `-${suffix}.png`);
  if (opts.compare) {
    const variant = opts.variant && opts.variant !== 'all' ? opts.variant : undefined;
    return views.map((v) => ({ ...v, compare: true, variant, out: withSuffix(v.out, 'compare') }));
  }
  const variant = opts.variant || defaultTheme;
  const ids = variant === 'all' ? Object.keys(themes) : variant.split(',');
  for (const id of ids) {
    if (!themes[id]) {
      console.error(`Unknown variant: ${id}. Known: ${Object.keys(themes).join(', ')}`);
      process.exit(2);
    }
  }
  return views.flatMap((v) => ids.map((id) => ({ ...v, variant: id, out: withSuffix(v.out, id) })));
}

async function renderCommand(opts) {
  const { THEMES, DEFAULT_THEME } = await import('../style/themes/index.mjs');
  const { render } = await import('./render.mjs');
  const places = loadPlaces();
  const [width, height] = (opts.size || '1024x768').split('x').map(Number);
  const layers = opts.layers ? opts.layers.split(',') : undefined;
  const suffix = layers ? `-${layers.join('+')}` : '';
  let views;
  if (opts.place === 'all') {
    const dir = opts.out || 'out';
    views = Object.entries(places).map(([name, p]) => ({
      name,
      center: p.center,
      zoom: Number(opts.zoom ?? p.zoom),
      out: path.join(dir, `${name}-z${opts.zoom ?? p.zoom}${suffix}.png`),
    }));
  } else {
    let center;
    let zoom = opts.zoom;
    let name = 'view';
    if (opts.place) {
      const p = places[opts.place];
      if (!p) {
        console.error(`Unknown place: ${opts.place}. Run "czmap places".`);
        process.exit(2);
      }
      center = p.center;
      zoom ??= p.zoom;
      name = opts.place;
    } else if (opts.center) {
      center = opts.center.split(',').map(Number);
    } else {
      console.error('Use --place or --center.');
      process.exit(2);
    }
    zoom = Number(zoom ?? 12);
    const out = opts.out || path.join('out', `${name}-z${zoom}${suffix}.png`);
    views = [{ name, center, zoom, out }];
  }
  views = expandVariants(views, opts, THEMES, DEFAULT_THEME);
  const results = await render(views, {
    width, height, pixelRatio: Number(opts.ratio || 1), layers,
  });
  let failed = false;
  for (const r of results) {
    console.log(`${r.out}  (${r.center.join(',')} z${r.zoom}${r.variant ? ` ${r.variant}` : ''}, ${r.ms} ms)`);
    for (const e of r.errors) {
      failed = true;
      console.log(`  error: ${e}`);
    }
  }
  if (failed) {
    process.exitCode = 1;
  }
}

// Validate the styles of all maps. Exit code 1 on errors.
async function check() {
  const { validateStyleMin } = await import('@maplibre/maplibre-gl-style-spec');
  const { buildStyle, THEMES } = await import('../style/index.mjs');
  let failed = false;
  for (const id of Object.keys(THEMES)) {
    const style = buildStyle({ tiles: 'https://example.com/v/1', glyphs: 'https://example.com/{fontstack}/{range}.pbf',
      sprite: 'https://example.com/sprite', variant: id });
    const errors = validateStyleMin(style);
    console.log(`style ${id}: ${errors.length === 0 ? 'ok' : `${errors.length} errors`}`);
    for (const e of errors) {
      console.log(`  ${e.message}`);
    }
    failed ||= errors.length > 0;
  }
  if (failed) {
    process.exitCode = 1;
  }
}

function info(parts) {
  const mb = (bytes) => `${(bytes / 1e6).toFixed(1).padStart(8)} MB`;
  console.log('PMTiles files (limit 500 MB each, 10 GB in total):');
  let total = 0;
  let over = false;
  for (const part of parts) {
    for (const set of SETS) {
      const file = partFiles(part).pmtiles(set);
      const label = `  ${part.id}/${set}`.padEnd(22);
      if (!fs.existsSync(file)) {
        console.log(`${label} missing`);
        continue;
      }
      const size = fs.statSync(file).size;
      total += size;
      over ||= size > SIZE_LIMIT;
      console.log(`${label}${mb(size)}  ${size > SIZE_LIMIT ? 'OVER LIMIT' : 'ok'}`);
    }
  }
  console.log(`  ${'total'.padEnd(20)}${mb(total)}  ${total > TOTAL_LIMIT ? 'OVER LIMIT' : 'ok'}`);
  if (over || total > TOTAL_LIMIT) {
    process.exitCode = 1;
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    strict: false,
    options: {
      tiles: { type: 'string' },
      stdout: { type: 'boolean' },
      out: { type: 'string' },
      port: { type: 'string' },
      host: { type: 'string' },
      place: { type: 'string' },
      center: { type: 'string' },
      zoom: { type: 'string' },
      size: { type: 'string' },
      ratio: { type: 'string' },
      layers: { type: 'string' },
      variant: { type: 'string' },
      compare: { type: 'boolean' },
      country: { type: 'string' },
      'base-url': { type: 'string' },
      version: { type: 'string' },
      part: { type: 'string' },
    },
  });
  // Unknown --options of "build" go to the tile builders (--country and --part are ours).
  const own = (a) => ['--country', '--part'].some((o) => a === o || a.startsWith(`${o}=`));
  const extra = rest.filter((a) => a.startsWith('--') && !own(a));
  const parts = () => {
    try {
      return selectParts(values);
    } catch (err) {
      console.error(err.message);
      return process.exit(2);
    }
  };

  switch (command) {
    case 'download':
      return download(parts());
    case 'build':
      return build(positionals, extra, parts());
    case 'index':
      return writeIndex();
    case 'release': {
      if (!values['base-url']) {
        console.error('release needs --base-url, e.g. https://maps.gotrasio.cz');
        process.exit(2);
      }
      const { release } = await import('./release.mjs');
      return release({ baseUrl: values['base-url'], version: values.version });
    }
    case 'check':
      return check();
    case 'style':
      return style(values);
    case 'serve':
      return serve(values);
    case 'render':
      return renderCommand(values);
    case 'sprite': {
      const { writeSprite } = await import('./sprite.mjs');
      return writeSprite();
    }
    case 'info':
      return info(parts());
    case 'places':
      for (const [name, p] of Object.entries(loadPlaces())) {
        console.log(`${name.padEnd(16)} z${p.zoom}  ${p.center.join(',')}  ${p.note || ''}`);
      }
      return undefined;
    default:
      console.log(HELP);
      return undefined;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
