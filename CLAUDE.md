# CLAUDE.md — Project instructions for Claude

## Language

All documentation, code, and comments must be written in **plain technical English**.
- Keep sentences short and direct
- Avoid unnecessary filler words
- Czech is only used in user-facing strings that are intentionally Czech (e.g. map layer names in the viewer)

## Architecture

- `tiles/` — Planetiler profiles (Java 21, Maven). `BaseProfile` → `base.pmtiles`, `RoutesProfile` → `routes.pmtiles`.
- `relief/build_relief.py` — Copernicus DEM → `relief.pmtiles` (Terrarium WebP).
- `style/` — MapLibre style as JS modules. `style/index.mjs` exports `buildStyle()`.
- `viewer/` — browser viewer. `tools/server.mjs` serves it and builds `/style.json` on every request.
- `tools/czmap.mjs` — the only entry point for build, serve, render.

The tile schema is in `docs/tile-schema.md`. Update it when you change a profile.

## Map rules

- No POIs in the map. Only land cover, water, transport, buildings, boundaries, names, routes and relief.
- Every PMTiles file must stay under 500 MB. Check with `node tools/czmap.mjs info` after a build.
- Every style layer needs `metadata.group`: `base`, `relief`, `hiking` or `cycling`.

## Workflow for style changes

1. Edit `style/` (colours in `style/theme.mjs`).
2. Render and look at the result:
   ```
   node tools/czmap.mjs render --place all --out out/
   node tools/czmap.mjs render --center 15.74,50.736 --zoom 14
   ```
   The command fails if the map reports errors (for example an invalid expression).
3. Compare with `docs/design-manual-*.md`.

Rebuild tiles only when the data schema changes: `node tools/czmap.mjs build base` (about 5–10 min).

## Code Style

Follow the rules defined in `.editorconfig` for all files you create or modify:
- Java: 4-space indent, max line length 120
- Python: 4-space indent, max line length 88 (black-compatible)
- JavaScript/CSS/HTML: 2-space indent
- XML: 4-space indent
- All files: UTF-8, LF line endings, final newline
