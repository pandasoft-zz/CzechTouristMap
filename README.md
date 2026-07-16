# CzechTouristMap

Open-source map style for Czech Republic — optimized for tourists, hikers, and offline use.

## Vision

Freely available map style that resembles Czech tourist maps (paper maps from KČT, SHOKart, mapy.cz).

- **Trail markings** — Czech hiking trail system (red, blue, green, yellow) with characteristic symbols
- **Cartographic symbols** — ČÚZK SM5 standard (Czech Office for Surveying, Mapping and Cadastre)
- **Visual style** — Czech topographic map conventions (terrain, roads, settlements, natural features)

## Modern Architecture

| Layer | Technology |
|-------|-----------|
| **Data** | OpenStreetMap `.pbf` (Geofabrik) |
| **Dev (live)** | Tegola (Go tile server) rendering `.pbf` → MapLibre GL |
| **Prod (offline)** | Tilemaker prerendering → PMTiles |
| **Frontend** | MapLibre GL (web) / native (Android, WearOS, etc.) |
| **Styling** | Mapbox GL JSON (simple, editable, tooling) |

## Quick Start

### Development (live preview)

```bash
# Start Tegola tile server + web UI
docker compose up

# Open http://localhost in browser
# Edit styles/CzechTouristMap.json
# Changes appear live
```

### Production (offline maps)

```bash
# Quick test (Blansko area, ~30 seconds)
make build-pmtiles-test

# Full Czech Republic (~2 hours)
make build-pmtiles

# Output: web/assets/CzechTouristMap.pmtiles (~45 MB)
# → Use offline everywhere (Android, web, WearOS, Amazfit)
```

## Styling

The map style is defined in **Mapbox GL JSON format** (`styles/CzechTouristMap.json`):
- Human-readable
- Edit with any text editor or Maputnik
- Used by both Tegola (dev) and Tilemaker (prod)

Legacy XSLT theme (`src/styles/`) is archived for reference but not actively used.

## Architecture Details

### Development Workflow

```
styles/CzechTouristMap.json
         ↓
    Tegola (live server)
         ↓
   MapLibre GL (browser)
         ↓
    Live preview (~1s per change)
```

### Production Workflow

```
styles/CzechTouristMap.json
         ↓
czech-republic.osm.pbf (Geofabrik)
         ↓
    Tilemaker (prerender)
         ↓
CzechTouristMap.pmtiles (~45 MB)
         ↓
   Offline everywhere
   - Web: MapLibre GL + PMTiles
   - Android: Malachite, OsmAnd
   - WearOS: Web fallback
   - Amazfit: Web fallback
```

## Files

- `styles/` — Mapbox GL style definition
- `tegola/` — Tegola configuration (tile server)
- `web/` — Frontend (MapLibre GL viewer)
- `scripts/build-pmtiles.sh` — PMTiles prerendering
- `config/locations.yaml` — Test areas + named locations
- `src/styles/` — Legacy XSLT (archived, for reference)

## Commands

```bash
make help          # Show all commands
make up            # Start development (Tegola + web)
make down          # Stop services
make build-pmtiles-test  # Quick PMTiles test build (30s)
make build-pmtiles # Full PMTiles build (2h)
```

## Requirements

- Docker
- `czech-republic.osm.pbf` (downloads automatically from Geofabrik on first use)

## License

Render theme: GPL-3.0

---

## Icon reference

[**docs/SYMBOLS.md**](docs/SYMBOLS.md) — visual table of all map symbols organized by category (hiking infrastructure, natural features, accommodation, transport, trail markers…).

## Sources

- [ČÚZK SM5 — map symbols (RGB colors)](https://geoportal.cuzk.cz/Dokumenty/ZNACKY_NOVA_SM5.pdf)
- [ČÚZK — comparative list ZM ČR](https://geoportal.cuzk.cz/Dokumenty/znacky_srovnavaci.pdf)
- [OpenHiking XSLT base](https://github.com/openhiking/openhiking-mapsforge)
- [OpenAndroMaps — maps for Czech Republic](https://www.openandromaps.org/en/downloads/europe)

## License

Render theme: GPL-3.0 (based on the OpenHiking project)
