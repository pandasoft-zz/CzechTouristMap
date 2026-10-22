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

// Coordinates are rounded to 4 decimals (about 10 m), like the .poly files of the extracts.
const round = (v) => Math.round(v * 1e4) / 1e4;

/**
 * Rings of an Osmosis .poly file: [{ hole, ring: [[lon, lat], ...] }].
 * A section whose name starts with "!" is a hole. The ring is closed (last point = first point).
 */
export function polyRings(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const rings = [];
  let current = null;
  // Line 0 is the file name. Then sections: a name line, coordinate lines, END. The last END
  // closes the file.
  for (const line of lines.slice(1)) {
    const text = line.trim();
    if (text === '') {
      continue;
    }
    if (current === null) {
      if (text === 'END') {
        break;
      }
      current = { hole: text.startsWith('!'), ring: [] };
      continue;
    }
    if (text === 'END') {
      const { ring } = current;
      if (ring.length >= 3) {
        const [first, last] = [ring[0], ring[ring.length - 1]];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          ring.push([...first]);
        }
        rings.push(current);
      }
      current = null;
      continue;
    }
    const [lon, lat] = text.split(/\s+/).map(Number);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      throw new Error(`${file}: invalid coordinate line "${text}"`);
    }
    current.ring.push([round(lon), round(lat)]);
  }
  return rings;
}

/**
 * Area of an Osmosis .poly file as a GeoJSON MultiPolygon geometry.
 * A hole belongs to the outer ring before it.
 */
export function polyArea(file) {
  const polygons = [];
  for (const { hole, ring } of polyRings(file)) {
    if (hole) {
      if (polygons.length === 0) {
        throw new Error(`${file}: a hole comes before any outer ring`);
      }
      polygons[polygons.length - 1].push(ring);
    } else {
      polygons.push([ring]);
    }
  }
  return { type: 'MultiPolygon', coordinates: polygons };
}

/** Bounding box [west, south, east, north] of an Osmosis .poly file. */
export function polyBounds(file) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const { hole, ring } of polyRings(file)) {
    if (hole) {
      continue;
    }
    for (const [lon, lat] of ring) {
      west = Math.min(west, lon);
      east = Math.max(east, lon);
      south = Math.min(south, lat);
      north = Math.max(north, lat);
    }
  }
  return [west, south, east, north];
}
