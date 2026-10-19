#!/usr/bin/env node
// czmap - command line tool for the Czech Tourist Map.
// Run "node tools/czmap.mjs help" for usage.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { ROOT, DATA, DIST } from './paths.mjs';

const OSM_URL = 'https://download.openstreetmap.fr/extracts/europe/czech_republic-latest.osm.pbf';
const OSM_FILE = path.join(DATA, 'czech-republic.osm.pbf');
const TILES_JAR = path.join(ROOT, 'tiles/target/czmap-tiles.jar');
const VENV_PYTHON = path.join(ROOT, '.venv/bin/python');
const SIZE_LIMIT = 500 * 1000 * 1000;

const HELP = `czmap - build, view and check the Czech Tourist Map

Usage: node tools/czmap.mjs <command> [options]

Commands:
  download                Download the OSM extract to data/
  build <part...>         Build PMTiles into dist/. Parts: base, routes, relief, all
  style [--tiles URL]     Write dist/style.json (production style)
        [--stdout]        Print the style instead of writing it
  serve [--port 8080]     Start the viewer at http://localhost:8080
        [--host 0.0.0.0]  Listen on all interfaces (for phones in the same network)
  render                  Render PNG images of the map (headless Chromium)
        --place NAME      Preset from tools/places.json ("all" = every preset)
        --center LON,LAT  Map centre (instead of --place)
        --zoom Z          Zoom level (default: preset zoom or 12)
        --size WxH        Image size in CSS px (default 1024x768)
        --ratio N         Pixel ratio (default 1)
        --layers LIST     Visible groups, e.g. base,relief (default: all)
        --out FILE|DIR    Output file, or directory for --place all (default: out/)
  info                    Show sizes of the PMTiles files against the 500 MB limit
  places                  List render presets
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

function download() {
  fs.mkdirSync(DATA, { recursive: true });
  run('curl', ['-fSL', '--retry', '3', '-C', '-', '-o', OSM_FILE, OSM_URL]);
}

function buildVector(profile, extra) {
  if (!fs.existsSync(OSM_FILE)) {
    download();
  }
  if (newestMtime(path.join(ROOT, 'tiles'), ['target']) > mtime(TILES_JAR)) {
    run('mvn', ['-q', '-B', '-f', 'tiles/pom.xml', 'package']);
  }
  // Write to a temp file first, so the old file stays usable in the viewer during the build.
  const output = path.join(DIST, `${profile}.pmtiles`);
  const tmp = path.join(DIST, `${profile}.tmp.pmtiles`);
  run('java', ['-Xmx6g', '-jar', TILES_JAR,
    `--profile=${profile}`,
    `--osm_path=${OSM_FILE}`,
    `--output=${tmp}`,
    `--tmpdir=${path.join(DATA, 'tmp')}`,
    ...extra]);
  fs.renameSync(tmp, output);
}

function buildRelief(extra) {
  if (!fs.existsSync(VENV_PYTHON)) {
    run('python3', ['-m', 'venv', '.venv']);
    run(VENV_PYTHON, ['-m', 'pip', 'install', '-r', 'relief/requirements.txt']);
  }
  run(VENV_PYTHON, ['relief/build_relief.py', ...extra]);
}

function build(parts, extra) {
  if (parts.length === 0 || parts.includes('all')) {
    parts = ['base', 'routes', 'relief'];
  }
  fs.mkdirSync(DIST, { recursive: true });
  for (const part of parts) {
    if (part === 'base' || part === 'routes') {
      buildVector(part, extra);
    } else if (part === 'relief') {
      buildRelief(extra);
    } else {
      console.error(`Unknown part: ${part}`);
      process.exit(2);
    }
  }
  info();
}

async function style({ tiles, stdout, out }) {
  const { buildStyle } = await import('../style/index.mjs');
  const tilesUrl = tiles || '.';
  const glyphs = tiles
    ? `${new URL('../fonts', `${tiles}/`).href}/{fontstack}/{range}.pbf`
    : './fonts/{fontstack}/{range}.pbf';
  const json = JSON.stringify(buildStyle({ tiles: tilesUrl, glyphs }), null, 2);
  if (stdout) {
    process.stdout.write(json);
    return;
  }
  const file = out || path.join(DIST, 'style.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${json}\n`);
  console.log(`Wrote ${path.relative(ROOT, file)}`);
}

async function serve({ port, host }) {
  const { startServer } = await import('./server.mjs');
  const { url } = await startServer({ port: Number(port || 8080), host: host || '127.0.0.1' });
  console.log(`Viewer: ${url}`);
  for (const name of ['base', 'routes', 'relief']) {
    if (!fs.existsSync(path.join(DIST, `${name}.pmtiles`))) {
      console.log(`Warning: dist/${name}.pmtiles is missing. Run: node tools/czmap.mjs build ${name}`);
    }
  }
}

function loadPlaces() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/places.json'), 'utf8'));
}

async function renderCommand(opts) {
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
  const results = await render(views, {
    width, height, pixelRatio: Number(opts.ratio || 1), layers,
  });
  let failed = false;
  for (const r of results) {
    console.log(`${r.out}  (${r.center.join(',')} z${r.zoom}, ${r.ms} ms)`);
    for (const e of r.errors) {
      failed = true;
      console.log(`  error: ${e}`);
    }
  }
  if (failed) {
    process.exitCode = 1;
  }
}

function info() {
  console.log('PMTiles files (limit 500 MB each):');
  for (const name of ['base', 'routes', 'relief']) {
    const file = path.join(DIST, `${name}.pmtiles`);
    if (!fs.existsSync(file)) {
      console.log(`  ${name.padEnd(8)} missing`);
      continue;
    }
    const size = fs.statSync(file).size;
    const mark = size > SIZE_LIMIT ? 'OVER LIMIT' : 'ok';
    console.log(`  ${name.padEnd(8)} ${(size / 1e6).toFixed(1).padStart(8)} MB  ${mark}`);
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
    },
  });
  // Unknown --options of "build" go to the tile builders.
  const extra = rest.filter((a) => a.startsWith('--'));

  switch (command) {
    case 'download':
      return download();
    case 'build':
      return build(positionals, extra);
    case 'style':
      return style(values);
    case 'serve':
      return serve(values);
    case 'render':
      return renderCommand(values);
    case 'info':
      return info();
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
