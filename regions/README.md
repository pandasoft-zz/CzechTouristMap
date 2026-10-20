# regions/

Countries and parts of the map (see `docs/adr/0004-map-built-in-parts.md`).

```
regions.json              countries in build order
<country>/country.json    name, start view, parts
<country>/places.json     render presets (czmap render --place NAME)
<country>/parts/<id>.json one file per part, only for countries with several parts
```

A **part** is one build unit: one OSM extract and one area polygon. Its files go to
`data/osm/<part>.osm.pbf`, `data/poly/<part>.poly`, `data/contours/<part>.gpkg` and
`dist/<part>/*.pmtiles`. Every PMTiles file must stay under 500 MB (Cloudflare cache limit).
Split a country into several parts when a file gets bigger.

## Part

```json
{
  "id": "de-sn",
  "name": "Sachsen",
  "osm": "https://download.geofabrik.de/europe/germany/sachsen-latest.osm.pbf",
  "poly": "https://download.geofabrik.de/europe/germany/sachsen.poly"
}
```

`country.json` lists parts inline (objects) or by id (strings, read from `parts/<id>.json`).

## Add a country

1. Create `regions/<country>/country.json` (and `parts/` for a large country).
2. Add the country to `regions.json`.
3. Add the terrain tiles of the area to `terrain/sonny/` (see `terrain/README.md`).
4. Build: `node tools/czmap.mjs build all --country <country>`.
5. Before the second part: finish the border handling from ADR 0004.
