# terrain/

Terrain model for the relief and the contours, kept in the repository so CI can build without a manual
download.

- `sonny/` — [Sonny's LiDAR DTM of Europe](https://sonny.4lima.de), 1" HGT tiles (1 x 1 degree) as zip
  files. Licence: CC BY 4.0, attribution "Sonny (sonny.4lima.de)". For Czechia the source is ČÚZK DMR 4G
  (CC BY 4.0). `_Readme-Czechia.txt` and `_Datasources.txt` are Sonny's notes on the sources.
- The zip files are stored with **Git LFS** (`.gitattributes`). After cloning run `git lfs pull`.
  In GitHub Actions use `actions/checkout` with `lfs: true`.

## Which tiles

Only the tiles of the map area: 48–51° N, 11–18° E (the relief area of `relief/build_relief.py`).
GitHub's free LFS quota is 10 GiB storage and 10 GiB download per month, so the whole of Europe (about
4.8 GB) is not stored here.

Missing in this set (the Europe download was incomplete): N48E011, N48E012, N48E018, N49E011, N51E011,
N51E013, N51E017. The relief fills them from Copernicus; the contours do not need them.

## Add tiles

1. Download the zip files from Sonny's site (Google Drive, in a browser) into `data/sonny/`.
2. Copy the needed `NxxEyyy.zip` files into `terrain/sonny/` and commit them.

The builders read `terrain/sonny/` first, then `data/sonny/`.
