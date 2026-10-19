# Tile schema

The map uses three PMTiles files. The style (`style/`) reads them as three sources.

| File | Source | Type | Zoom | Built by |
|---|---|---|---|---|
| `base.pmtiles` | `base` | vector (MVT) | 0–14 | `tiles/` (Planetiler, profile `base`) |
| `routes.pmtiles` | `routes` | vector (MVT) | 0–14 | `tiles/` (Planetiler, profile `routes`) |
| `relief.pmtiles` | `relief` | raster-dem (Terrarium, WebP) | 6–12 | `relief/build_relief.py` |

MapLibre over-zooms all sources above their max zoom, so the map stays sharp up to zoom 18.

## base.pmtiles

No POIs. Only land cover, water, transport, buildings, boundaries and names.

| Layer | Geometry | Attributes | Min zoom |
|---|---|---|---|
| `landcover` | polygon | `kind`: forest, grass, orchard, vineyard, scrub, heath, wetland, residential, industrial, farmyard, cemetery, park, allotments, quarry, rock, scree, sand, sport; `leaf`: needle (z12+) | 7–13 by kind |
| `water` | polygon | – | 6 |
| `water_labels` | point | `name` | by area |
| `waterway` | line | `kind`: river, stream; `intermittent`, `tunnel` (1), `name` | river 8, stream 12, ditch 14 |
| `roads` | line | `kind`: motorway, trunk, primary, secondary, tertiary, minor, pedestrian, service, track, path, cycleway, steps; `link`, `bridge`, `tunnel` (1); `grade` (track, 1–5); `ref`; `name` | 5–14 by kind |
| `rail` | line | `kind`: rail, narrow, tram; `service`, `bridge`, `tunnel` (1) | 8–13 |
| `buildings` | polygon | – | 13 |
| `protected` | polygon | `kind`: national_park, landscape (CHKO), reserve; `name` | 7 / 11 |
| `boundaries` | line | `level`: 2 (state), 6 (region) | 0 / 7 |
| `places` | point | `kind`: city, town, village, suburb, hamlet, isolated_dwelling, locality; `name` | 5–14 |
| `peaks` | point | `name`, `ele` | 10 (≥ 1000 m), 12 |

Farmland is not stored. It is the map background colour.

## routes.pmtiles

Route relations are flattened to their member ways.

| Layer | Geometry | Attributes | Min zoom |
|---|---|---|---|
| `hiking` | line | `color`: red, blue, green, yellow; `kind`: major, local, learning, other; `slot`, `count` | 9 (major), 11 |
| `cycling` | line | `network`: 0 icn, 1 ncn, 2 rcn, 3 lcn; `mtb` (1); `refs` (z12+, e.g. "4, 24") | 8 / 10 |

One way can carry several hiking colours. Each colour is one feature. `count` is the number of colours on the way,
`slot` is the index (0 = first in order red, blue, green, yellow). The style shifts each stripe by
`(slot - (count - 1) / 2) * stripe width`, so the stripes lie side by side.

## relief.pmtiles

- Source: Copernicus DEM GLO-30 (30 m)
- Encoding: [Terrarium](https://github.com/tilezen/joerd/blob/master/docs/formats.md#terrarium):
  `height = R * 256 + G + B / 256 - 32768`
- Heights are rounded to 0.25 m (`--step`). This makes the tiles much smaller with no visible change in hillshading.
- Tile format: lossless WebP, 256 px
- Only tiles near the border of the OSM extract are stored.
