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

- Use Sonny's 1" DTM for contours and relief. Zip files are read directly.
- The tiles of the map area are stored in the repository in `terrain/sonny/` with Git LFS, so CI
  can build without the manual download (Google Drive does not allow script downloads).
  Only the map area is stored: GitHub's free LFS quota is 10 GiB storage and 10 GiB download per
  month, and all of Europe is about 4.8 GB. More tiles can be put into `data/sonny/` locally.
- Contours are precomputed, not computed in the browser:
  `relief/build_contours.py` (smoothing, contourpy, clipping) writes `data/contours.gpkg`,
  Planetiler (profile `contours`) builds `dist/contours.pmtiles`.
- Copernicus stays as a fallback (`--source=copernicus`) for tests and areas without Sonny data.

## Consequences

- Contours and hillshading come from the same terrain model.
- `git lfs pull` after cloning; CI checks out with `lfs: true`. A new region needs a manual
  download once, then its tiles are committed to `terrain/sonny/`.
- Every CI run that checks out the LFS files uses about 160 MB of the download quota.
- Attribution: "© Sonny's LiDAR DTM, © ČÚZK" (and the other national sources outside Czechia).
- The pipeline works for any 1 x 1 degree tiles, so new regions only need more HGT files.
