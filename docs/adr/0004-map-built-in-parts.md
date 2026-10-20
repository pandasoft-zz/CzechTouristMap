# ADR 0004: The map is built in parts; the viewer routes tiles to the part files

- Status: Accepted
- Date: 2026-10-20

## Context

The map will grow beyond the Czech Republic. The tiles are hosted on Cloudflare R2 (free plan):

- R2 free storage is 10 GB in total and 10 million reads (Class B) per month.
- Cloudflare caches files up to 512 MB only. A larger file is not cached, so every tile request
  is an R2 read and counts against the monthly read limit.

So every PMTiles file must stay under 500 MB, and the sum of all files under 10 GB. A large
country (Germany) does not fit into one 500 MB file. MapLibre cannot read one source from
several PMTiles files.

Options checked:

1. One source per part, layers repeated per source: the style grows with every part
   (about 45 layers per part), tiles at part borders are drawn twice and labels repeat.
2. One source per tile set, a small protocol in the page picks the part file for each tile.
3. One file per tile set for the whole area: simplest for the page, but files over 500 MB are
   not cached.

## Decision

Option 2.

- A **country** (`regions/<country>/country.json`) has one or more **parts**. A part is one build
  unit: one OSM extract and one area polygon. Small countries have one part (`cz`); large ones
  are split, for example Germany by states (`de-by`, `de-sn`, ...), like the Geofabrik extracts.
- Every part has its own files: `dist/<part>/base.pmtiles`, `routes`, `relief`, `contours`.
- `dist/regions.json` lists the parts with their bounds and built sets. The build writes it.
- The style has the same four sources as before, with tile URLs `tiles://<set>/{z}/{x}/{y}`.
  `viewer/tiles.js` registers the `tiles` protocol: for a tile it takes the parts whose bounds
  touch the tile and returns the tile of the first part file that has it.
- `node tools/czmap.mjs info` checks both limits (500 MB per file, 10 GB in total).
- The name stays "Czech Tourist Map": the look is based on Czech topographic maps, other
  countries are an extension.

## Consequences

- The style and the number of layers do not depend on the number of parts.
- A page that shows the map must load `viewer/tiles.js` (and `pmtiles.js`) and call
  `registerTiles(maplibregl, <dist URL>)`. The dist URL is in the style metadata `tiles:url`.
- **Open for the second part:** neighbour parts overlap at their borders (each extract has a
  margin). The build must give every tile at a border to one part only, otherwise the first part
  hides the data of the other in that tile. This is not done yet, because there is one part.
- The terrain tiles (`terrain/sonny/`) stay shared by all parts, keyed by 1 x 1 degree.
