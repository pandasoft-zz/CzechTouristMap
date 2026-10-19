# ADR 0003: Terrain data from Sonny's LiDAR DTM; contours as vector tiles

- Status: Accepted
- Date: 2026-10-19

## Context

The map needs contour lines. The relief used the Copernicus GLO-30 DEM. Copernicus is a surface
model (DSM): trees and buildings are part of the heights. Contours from it bend around forest
edges and towns, even after smoothing.

Options checked:

- Copernicus GLO-30: surface model, see above.
- ČÚZK DMR 4G / DMR 5G and ZABAGED contours: exact terrain, CC BY 4.0, but only the Czech Republic
  and thousands of map sheet downloads in S-JTSK.
- FABDEM (Copernicus without forests and buildings): non-commercial licence only.
- GEDTM30: marked "for testing purposes only", licence of the data unclear.
- Sonny's LiDAR DTM of Europe (https://sonny.4lima.de): terrain model compiled from national LiDAR
  data (for Czechia: ČÚZK DMR 4G), 1" grid (about 20 x 30 m), HGT files of 1 x 1 degree,
  CC BY 4.0. It covers the neighbour countries and most of Europe.

## Decision

- Use Sonny's 1" DTM for contours and relief. The files are put into `data/sonny/` by hand
  (Google Drive does not allow script downloads). Zip files are read directly.
- Contours are precomputed, not computed in the browser:
  `relief/build_contours.py` (smoothing, contourpy, clipping) writes `data/contours.gpkg`,
  Planetiler (profile `contours`) builds `dist/contours.pmtiles`.
- Copernicus stays as a fallback (`--source=copernicus`) for tests and areas without Sonny data.

## Consequences

- Contours and hillshading come from the same terrain model.
- One manual download step before a full build.
- Attribution: "© Sonny's LiDAR DTM, © ČÚZK" (and the other national sources outside Czechia).
- The pipeline works for any 1 x 1 degree tiles, so new regions only need more HGT files.
