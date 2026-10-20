// Prepare a release in dist/ for upload (see docs/publishing.md).
//
// A release is a new version folder v/<version>/ on the server. Nothing in it changes after the
// upload. latest.json at the root points to the current version and lists all PMTiles files;
// the web page and the mobile app read it first. Uploading latest.json last switches the version,
// so the map is never half uploaded.
//
// Writes:
//   dist/style-<map>.json  styles with absolute URLs into the version folder
//   dist/latest.json       catalog: version, styles, countries, parts, files (size, sha256, updated)
//   dist/map.js            loader for web pages (viewer/map.js with viewer/tiles.js inside)
//   dist/lib/              MapLibre and PMTiles for the loader, in folders named by version

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DIST } from './paths.mjs';
import { loadCountries, partFiles } from './regions.mjs';

const SCHEMA = 1;

// Library files for the loader: [package, file in the package]. They go to lib/<package>@<version>/.
const LIB_FILES = [
  ['maplibre-gl', 'dist/maplibre-gl.mjs'],
  ['maplibre-gl', 'dist/maplibre-gl-worker.mjs'],
  ['maplibre-gl', 'dist/maplibre-gl.css'],
  ['maplibre-gl', 'LICENSE.txt'],
  ['pmtiles', 'dist/pmtiles.js'],
];

const packageVersion = (name) => JSON.parse(
  fs.readFileSync(path.join(ROOT, 'node_modules', name, 'package.json'), 'utf8')).version;

// dist/lib/<package>@<version>/: the libraries for the loader.
function copyLibs() {
  for (const [name, file] of LIB_FILES) {
    const dir = path.join(DIST, 'lib', `${name}@${packageVersion(name)}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'node_modules', name, file), path.join(dir, path.basename(file)));
  }
}

// dist/map.js: the loader template with the host, the library versions and viewer/tiles.js.
function writeLoader(baseUrl) {
  const tiles = fs.readFileSync(path.join(ROOT, 'viewer/tiles.js'), 'utf8').replace(/^export /m, '');
  const loader = fs.readFileSync(path.join(ROOT, 'viewer/map.js'), 'utf8')
    .replaceAll('__HOST__', baseUrl)
    .replaceAll('__MAPLIBRE__', packageVersion('maplibre-gl'))
    .replaceAll('__PMTILES__', packageVersion('pmtiles'))
    .replace('/* __TILES_JS__ */', tiles.trim().split('\n').join('\n  '));
  fs.writeFileSync(path.join(DIST, 'map.js'), loader);
}

/** Version id from the time (UTC), sorts by time: 20261020-0315. */
export function versionId(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(file)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
}

// The catalog that is live now, to keep the "updated" date of files that did not change.
async function previousCatalog(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/latest.json`, { signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function previousFiles(catalog) {
  const files = new Map();
  for (const country of catalog?.countries ?? []) {
    for (const part of country.parts) {
      for (const [set, file] of Object.entries(part.files)) {
        files.set(`${part.id}/${set}`, file);
      }
    }
  }
  return files;
}

/**
 * @param {object} options
 * @param {string} options.baseUrl  public URL of the bucket, e.g. https://maps.gotrasio.cz
 * @param {string} [options.version]
 */
export async function release({ baseUrl, version = versionId() }) {
  baseUrl = baseUrl.replace(/\/+$/, '');
  const index = JSON.parse(fs.readFileSync(path.join(DIST, 'regions.json'), 'utf8'));
  if (index.parts.length === 0) {
    throw new Error('dist/regions.json has no parts. Run: node tools/czmap.mjs build all');
  }
  const versionUrl = `${baseUrl}/v/${version}`;
  const published = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  // Styles: everything they need (tiles, fonts, sprite) is in the version folder.
  const { buildStyle, THEMES } = await import('../style/index.mjs');
  const styles = {};
  for (const id of Object.keys(THEMES)) {
    const style = buildStyle({
      tiles: versionUrl,
      glyphs: `${versionUrl}/fonts/{fontstack}/{range}.pbf`,
      sprite: `${versionUrl}/sprite/sprite`,
      variant: id,
    });
    fs.writeFileSync(path.join(DIST, `style-${id}.json`), `${JSON.stringify(style, null, 2)}\n`);
    styles[id] = { name: THEMES[id].name, url: `${versionUrl}/style-${id}.json` };
  }

  const previous = previousFiles(await previousCatalog(baseUrl));
  const countries = [];
  for (const country of loadCountries()) {
    const parts = [];
    for (const part of index.parts.filter((p) => p.country === country.id)) {
      const files = {};
      for (const set of part.sets) {
        const file = partFiles(part).pmtiles(set);
        const hash = await sha256(file);
        const old = previous.get(`${part.id}/${set}`);
        files[set] = {
          url: `${versionUrl}/${part.id}/${set}.pmtiles`,
          size: fs.statSync(file).size,
          sha256: hash,
          // Same content as in the live version: keep its date, so apps do not download it again.
          updated: old?.sha256 === hash ? old.updated : published,
        };
      }
      parts.push({ id: part.id, name: part.name, bounds: part.bounds, files });
    }
    if (parts.length > 0) {
      countries.push({ id: country.id, name: country.name, view: country.view, parts });
    }
  }

  const catalog = {
    schema: SCHEMA,
    version,
    published,
    baseUrl: versionUrl,
    regions: `${versionUrl}/regions.json`,
    styles,
    countries,
  };
  fs.writeFileSync(path.join(DIST, 'latest.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  copyLibs();
  writeLoader(baseUrl);
  const changed = countries.flatMap((c) => c.parts).flatMap((p) => Object.values(p.files))
    .filter((f) => f.updated === published).length;
  console.log(`Release ${version}: ${Object.keys(styles).length} styles, ${changed} changed files`);
  console.log('Wrote dist/latest.json, dist/style-*.json, dist/map.js and dist/lib/');
  return catalog;
}
