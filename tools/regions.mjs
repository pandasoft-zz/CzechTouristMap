// Countries and parts of the map (regions/).
//
// A country (regions/<country>/country.json) has one or more parts. A part is one build unit:
// one OSM extract and one area polygon. Every part has its own PMTiles files in dist/<part>/,
// each below the 500 MB cache limit. Large countries are split into several parts.
//
// "parts" in country.json lists inline objects or ids of files in regions/<country>/parts/<id>.json.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DATA, DIST } from './paths.mjs';

const REGIONS = path.join(ROOT, 'regions');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** All countries in build order, each with its parts. */
export function loadCountries() {
  const { countries } = readJson(path.join(REGIONS, 'regions.json'));
  return countries.map((id) => {
    const dir = path.join(REGIONS, id);
    const country = readJson(path.join(dir, 'country.json'));
    const parts = country.parts.map((p) => (typeof p === 'string'
      ? readJson(path.join(dir, 'parts', `${p}.json`))
      : p));
    return { ...country, parts: parts.map((p) => ({ ...p, country: country.id })) };
  });
}

/** Parts selected by --country LIST and --part LIST (default: all parts). */
export function selectParts({ country, part } = {}) {
  const all = loadCountries().flatMap((c) => c.parts);
  let parts = all;
  if (country) {
    const ids = country.split(',');
    parts = parts.filter((p) => ids.includes(p.country));
  }
  if (part) {
    const ids = part.split(',');
    parts = parts.filter((p) => ids.includes(p.id));
  }
  if (parts.length === 0) {
    const known = all.map((p) => `${p.id} (${p.country})`).join(', ');
    throw new Error(`No part matches --country ${country ?? '-'} --part ${part ?? '-'}. Known: ${known}`);
  }
  return parts;
}

/** Files of one part on disk. */
export function partFiles(part) {
  const out = path.join(DIST, part.id);
  return {
    osm: path.join(DATA, 'osm', `${part.id}.osm.pbf`),
    poly: path.join(DATA, 'poly', `${part.id}.poly`),
    contours: path.join(DATA, 'contours', `${part.id}.gpkg`),
    dist: out,
    pmtiles: (set) => path.join(out, `${set}.pmtiles`),
  };
}

/** Render presets of all countries: { name: { center, zoom, note } }. */
export function loadPlaces() {
  const places = {};
  for (const country of loadCountries()) {
    const file = path.join(REGIONS, country.id, 'places.json');
    if (fs.existsSync(file)) {
      Object.assign(places, readJson(file));
    }
  }
  return places;
}

/** Bounding box [west, south, east, north] of an Osmosis .poly file. */
export function polyBounds(file) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s+(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)\s*$/.exec(line);
    if (m) {
      const lon = Number(m[1]);
      const lat = Number(m[2]);
      west = Math.min(west, lon);
      east = Math.max(east, lon);
      south = Math.min(south, lat);
      north = Math.max(north, lat);
    }
  }
  return [west, south, east, north].map((v) => Math.round(v * 1e4) / 1e4);
}
