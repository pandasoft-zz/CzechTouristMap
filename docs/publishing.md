# Publishing

The map is hosted on Cloudflare R2 at `https://maps.gotrasio.cz` (see ADR 0005).
GitHub Actions (`.github/workflows/maps.yml`) builds and uploads it once a month and on demand.

## Layout in the bucket

```
latest.json                      catalog of the live version (short cache: 5 min)
v/<version>/                     one folder per release, never changed after upload
  catalog.json                   copy of latest.json of this release
  regions.json                   tile index for viewer/tiles.js
  style-tourist.json             styles with absolute URLs into this folder
  style-topo.json
  <part>/base.pmtiles            routes, relief, contours: one set of files per part
  fonts/<font>/<range>.pbf
  sprite/sprite.json, .png, @2x
```

`<version>` is the build time in UTC, for example `20261020-0315`. Versions sort by time.

## Release flow

R2 has no symlinks. The switch is the upload of one small file:

1. `czmap build all`: all PMTiles in `dist/<part>/`, and `dist/regions.json`.
2. `czmap info`: fails when a file is over 500 MB or all files are over 10 GB.
3. `czmap release --base-url https://maps.gotrasio.cz`: writes `dist/latest.json` and the styles
   with URLs into `v/<version>/`.
4. `tools/publish-r2.sh`:
   1. uploads everything to `v/<version>/` (the live map still uses the old version),
   2. checks that every file is in the bucket,
   3. uploads `latest.json` — from now on clients use the new version,
   4. deletes old versions and keeps the newest two (`R2_KEEP_VERSIONS`).

If any step fails, `latest.json` is not changed and the old version stays live.

Files in `v/` get `Cache-Control: public, max-age=31536000, immutable`; `latest.json` gets
`max-age=300`. A client sees a new version at most 5 minutes after the switch.

## latest.json (for the web and the mobile app)

```json
{
  "schema": 1,
  "version": "20261020-0315",
  "published": "2026-10-20T03:15:00Z",
  "baseUrl": "https://maps.gotrasio.cz/v/20261020-0315",
  "regions": "https://maps.gotrasio.cz/v/20261020-0315/regions.json",
  "styles": {
    "tourist": { "name": "Turistická", "url": ".../style-tourist.json" },
    "topo": { "name": "Topografická", "url": ".../style-topo.json" }
  },
  "countries": [
    {
      "id": "cz",
      "name": "Česko",
      "view": { "center": [15.5, 49.8], "zoom": 7 },
      "parts": [
        {
          "id": "cz",
          "name": "Česko",
          "bounds": [12.07, 48.53, 18.88, 51.075],
          "files": {
            "base": {
              "url": ".../cz/base.pmtiles",
              "size": 408800000,
              "sha256": "…",
              "updated": "2026-10-20T03:15:00Z"
            },
            "routes": {}, "relief": {}, "contours": {}
          }
        }
      ]
    }
  ]
}
```

- `schema` changes only when the format changes in a way old apps cannot read.
- `updated` is the time the content of the file last changed. If a file is the same as in the live
  version (same `sha256`), it keeps the old date. Relief and contours rarely change, so apps do not
  download them again every month.
- Countries and parts are the offline download units. A large country has several parts.

### Mobile app

1. Read `latest.json` (on start, at most once a day).
2. For each downloaded part and file: if `sha256` differs from the local copy, offer an update.
   `updated` is for display ("Mapa z 20. 10. 2026").
3. Download from `url` and check `sha256` before replacing the local file.
4. URLs belong to one version. Old versions are deleted after two newer releases (about two months),
   so always take the URLs from the current `latest.json`.

### Web page

```js
const catalog = await fetch('https://maps.gotrasio.cz/latest.json').then((r) => r.json());
await registerTiles(maplibregl, catalog.baseUrl);            // viewer/tiles.js
new maplibregl.Map({ container: 'map', style: catalog.styles.tourist.url });
```

## Cloudflare setup (once, by hand)

1. **R2 bucket**, for example `maps`.
2. **Custom domain** on the bucket: `maps.gotrasio.cz` (the zone `gotrasio.cz` must be on Cloudflare).
   Do not use the `r2.dev` URL in production: it is rate limited and not cached.
3. **Cache rule** for `maps.gotrasio.cz`: *Eligible for cache*, *Use cache-control header from origin*.
   Cloudflare does not cache `.pmtiles` and `.json` by default. Without the rule every tile request is
   an R2 read (free plan: 10 million per month).
4. **CORS** on the bucket (the viewer reads byte ranges from other origins):
   ```json
   [{
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "HEAD"],
     "AllowedHeaders": ["Range", "If-Match"],
     "ExposeHeaders": ["ETag", "Content-Length", "Content-Range", "Accept-Ranges"],
     "MaxAgeSeconds": 86400
   }]
   ```
5. **R2 API token** with *Object Read & Write* for the bucket.
6. **GitHub** (Settings → Secrets and variables → Actions):
   - secrets `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
   - variables (optional) `MAPS_BASE_URL` (default `https://maps.gotrasio.cz`),
     `R2_KEEP_VERSIONS` (default `2`)

Without the secrets the workflow builds and checks the map but does not upload.

## Limits

- 500 MB per file: Cloudflare caches files up to 512 MB (free plan).
- 10 GB in the bucket (R2 free). Two versions are kept, so one release may use up to 5 GB.
- Git LFS: each build downloads the terrain tiles (about 200 MB of the 10 GB monthly LFS quota).

## Manual release

```
node tools/czmap.mjs build all
node tools/czmap.mjs release --base-url https://maps.gotrasio.cz
R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… R2_BUCKET=maps bash tools/publish-r2.sh
```

`DRY_RUN=1` prints the upload commands without running them. The script needs the AWS CLI.
