# ADR 0005: Versioned releases on R2, switched by latest.json

- Status: Accepted
- Date: 2026-10-20

## Context

The map is hosted on Cloudflare R2 (free plan) at `maps.gotrasio.cz` and rebuilt about once a month
by GitHub Actions. An upload of several hundred MB takes minutes. During that time the map must stay
complete: a client must never get a style of the new version with tiles of the old one, or a file
that is half uploaded.

R2 has no symlinks or aliases. A Cloudflare Worker or a rewrite rule could map a stable path to the
current version, but that needs more setup and, for a Worker, counts against its request limit.

The mobile app needs a list of the offline packages (countries, parts, files) and must see which
files changed.

## Decision

- Every release is uploaded to a new folder `v/<version>/` and never changed after that.
  `<version>` is the UTC build time (`20261020-0315`). The styles in the folder use absolute URLs
  into the same folder, so a version is self-contained.
- `latest.json` at the root points to the live version and lists all PMTiles files with URL, size,
  `sha256` and `updated`. Uploading it is the switch. It is uploaded last, after a check that all
  files of the version are in the bucket.
- Files in `v/` are cached for a year (`immutable`), `latest.json` for 5 minutes.
- The two newest versions are kept, older ones are deleted after the switch. Clients that still use
  the previous version keep working.
- `updated` keeps the date of the live version when the `sha256` is the same, so apps only download
  files that really changed.
- Upload with the AWS CLI against the R2 S3 API (multipart for large files), not with wrangler.

## Consequences

- No Cloudflare setup is needed for the switch itself; only bucket, domain, cache rule and CORS.
- Clients (web and app) read `latest.json` first. A page cannot use a fixed style URL.
- With two versions kept, one release may use at most half of the 10 GB R2 storage.
- A failed build or upload leaves the live version untouched.
