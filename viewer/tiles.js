// Tile routing for a map built in parts (dist/regions.json, see docs/adr/0004).
//
// Style sources use tile URLs like tiles://base/{z}/{x}/{y}. For each tile the protocol takes the
// parts whose bounds touch the tile and reads the tile from the first part file that has it.
// The build gives every tile to one part only, so the order of parts does not change the map.
//
// Needs the PMTiles library as the global "pmtiles" (pmtiles.js).

// Extra degrees around the part bounds: the relief has a margin of tiles outside the area.
const MARGIN = 0.3;

function tileBounds(z, x, y) {
  const n = 2 ** z;
  const lon = (i) => (i / n) * 360 - 180;
  const lat = (j) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * j) / n))) * 180) / Math.PI;
  return [lon(x), lat(y + 1), lon(x + 1), lat(y)];
}

function touches(a, b) {
  return a[0] - MARGIN <= b[2] && b[0] <= a[2] + MARGIN && a[1] - MARGIN <= b[3] && b[1] <= a[3] + MARGIN;
}

/**
 * Register the "tiles" protocol in MapLibre.
 * @param {object} maplibregl MapLibre module
 * @param {string} baseUrl    URL of the dist/ folder (with regions.json and <part>/<set>.pmtiles)
 * @returns {Promise<object>} the parsed regions.json
 */
export async function registerTiles(maplibregl, baseUrl) {
  const index = await fetch(`${baseUrl}/regions.json`).then((res) => {
    if (!res.ok) {
      throw new Error(`${baseUrl}/regions.json: ${res.status}. Run: node tools/czmap.mjs index`);
    }
    return res.json();
  });
  const archives = new Map();
  const archive = (part, set) => {
    const key = `${part.id}/${set}`;
    if (!archives.has(key)) {
      archives.set(key, new pmtiles.PMTiles(`${baseUrl}/${key}.pmtiles`));
    }
    return archives.get(key);
  };

  maplibregl.addProtocol('tiles', async (params, abort) => {
    const m = /^tiles:\/\/(\w+)\/(\d+)\/(\d+)\/(\d+)/.exec(params.url);
    if (!m) {
      throw new Error(`Invalid tile URL ${params.url}`);
    }
    const [set, z, x, y] = [m[1], Number(m[2]), Number(m[3]), Number(m[4])];
    const box = tileBounds(z, x, y);
    for (const part of index.parts) {
      if (!part.sets.includes(set) || !touches(part.bounds, box)) {
        continue;
      }
      const tile = await archive(part, set).getZxy(z, x, y, abort.signal);
      if (tile) {
        return { data: new Uint8Array(tile.data), cacheControl: tile.cacheControl, expires: tile.expires };
      }
    }
    // No part has the tile: an empty vector tile, or no raster tile.
    return { data: set === 'relief' ? null : new Uint8Array() };
  });
  return index;
}
