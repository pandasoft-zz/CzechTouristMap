# Czech Tourist Map

Tourist map of the Czech Republic as [PMTiles](https://docs.protomaps.com/pmtiles/) with a
[MapLibre](https://maplibre.org/) style.

The map has no POIs. It has four layer groups:

| Group | Content | Data |
|---|---|---|
| Base map (`base`) | land cover, water, roads, railways, buildings, boundaries, names | `base.pmtiles` (OpenStreetMap) |
| Relief (`relief`) | multi-directional hillshading ("plastic" look) | `relief.pmtiles` (Copernicus DEM) |
| Hiking routes (`hiking`) | KČT marked trails in red, blue, green, yellow | `routes.pmtiles` (OpenStreetMap) |
| Cycling routes (`cycling`) | cycling routes with route numbers | `routes.pmtiles` (OpenStreetMap) |

Size goal: max 500 MB per PMTiles file (`czmap info` checks it).

## Requirements

- Node.js 20+
- Java 21+ and Maven (vector tiles, [Planetiler](https://github.com/onthegomap/planetiler))
- Python 3.11+ (relief; packages in `relief/requirements.txt`, installed into `.venv` automatically)
- About 10 GB free disk and 8 GB RAM for a full build

```
npm install
```

## Commands

All tasks use one CLI: `node tools/czmap.mjs <command>` (or `npx czmap <command>`).

| Command | What it does |
|---|---|
| `download` | Download the OSM extract of the Czech Republic to `data/` |
| `build all` | Build `dist/base.pmtiles`, `dist/routes.pmtiles`, `dist/relief.pmtiles` |
| `build base routes` | Build only some parts |
| `serve` | Start the viewer at http://localhost:8080 |
| `serve --host 0.0.0.0` | Viewer for other devices in the same network |
| `render --place snezka` | Render a PNG image of a preset place to `out/` |
| `render --center 14.42,50.09 --zoom 14` | Render any place |
| `render --place all --layers base,relief` | Render all presets with some layer groups |
| `places` | List render presets (`tools/places.json`) |
| `style --tiles https://example.com/map` | Write `dist/style.json` for production |
| `info` | Show file sizes against the 500 MB limit |

### Viewer

`czmap serve` opens a MapLibre map with switches for the four layer groups.

- The style is built from `style/*.mjs` on each load. Edit the style, then press **R** (or *Reload style*).
- *Inspect features* shows the source layer and attributes of features under the click.
- *Tile borders* shows tile boundaries.
- The URL keeps the position (`#zoom/lat/lon`), so you can share a view.

### Render

`czmap render` opens the same viewer in headless Chromium and saves a screenshot. It prints map errors
(for example invalid style expressions) and exits with code 1 if there are any.
Playwright needs Chromium: `npx playwright install chromium` (or set `CHROMIUM_PATH`).

## Project layout

```
tiles/      Planetiler profiles (Java): OSM -> base.pmtiles, routes.pmtiles
relief/     DEM -> relief.pmtiles (Python)
style/      Map style as JavaScript modules -> MapLibre style JSON
viewer/     Browser viewer (MapLibre GL JS + PMTiles)
tools/      czmap CLI, dev server, PNG renderer, render presets
fonts/      Glyph PBF files (Noto Sans)
docs/       Design manuals, tile schema, map standards
```

## Style

The style is JavaScript (`style/index.mjs`), not hand-written JSON. Colours and fonts are in `style/theme.mjs`.
Layers are in `style/layers/`. Each layer has `metadata.group` (`base`, `relief`, `hiking`, `cycling`), which
the viewer uses for the layer switches.

## Deploy

1. `node tools/czmap.mjs build all`
2. `node tools/czmap.mjs style --tiles https://example.com/map`
3. Upload `dist/*.pmtiles`, `dist/style.json` to `https://example.com/map/` and `fonts/` to `https://example.com/fonts/`.
   The server must support HTTP Range requests (most static hosts and S3-like storage do).
4. In the web page, register the PMTiles protocol for MapLibre (see `viewer/main.js`).

## Data and licenses

- Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL.
  Extract from [openstreetmap.fr](https://download.openstreetmap.fr/extracts/europe/).
- Elevation: Copernicus DEM GLO-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018,
  provided under COPERNICUS by the European Union and ESA.
- Font: Noto Sans, SIL Open Font License 1.1.

## Documentation

- [docs/tile-schema.md](docs/tile-schema.md) — layers and attributes in the PMTiles files
- [docs/adr/](docs/adr/) — architecture decisions (why Planetiler / Java)
- [docs/design-manual-project.md](docs/design-manual-project.md) — colours and line widths
- [docs/design-manual-mapycz.md](docs/design-manual-mapycz.md), [docs/design-manual-cuzk.md](docs/design-manual-cuzk.md) — reference styles
- [docs/design-manual-typography.md](docs/design-manual-typography.md) — labels
- [docs/standards/](docs/standards/) — official map symbol standards (PDF)
