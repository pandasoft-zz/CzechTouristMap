#!/usr/bin/env bash
# Upload a release from dist/ to Cloudflare R2 and switch latest.json to it.
# Run "node tools/czmap.mjs release --base-url URL" first. See docs/publishing.md.
#
# Order (the live map stays complete the whole time):
#   1. upload all files to v/<version>/   (new folder, not used by anyone yet)
#   2. check that every file is there
#   3. upload latest.json                 (switch: clients now use the new version) and map.js
#   4. delete old versions, keep the newest R2_KEEP_VERSIONS (default 2)
#
# Environment:
#   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET   (required)
#   R2_KEEP_VERSIONS                                                   (optional, default 2)
#   R2_ENDPOINT                                                        (optional, for tests)
#   DRY_RUN=1                                                          (print, do not upload)
set -euo pipefail

: "${R2_ACCOUNT_ID:?R2_ACCOUNT_ID is not set}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is not set}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is not set}"
: "${R2_BUCKET:?R2_BUCKET is not set}"
KEEP="${R2_KEEP_VERSIONS:-2}"

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION=auto
# R2 does not accept the default CRC checksums of new AWS CLI versions.
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
# R2_ENDPOINT overrides the endpoint (for tests against a local S3 server).
ENDPOINT="${R2_ENDPOINT:-https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com}"

cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./dist/latest.json').version")
DEST="s3://${R2_BUCKET}/v/${VERSION}"
IMMUTABLE="public, max-age=31536000, immutable"
SHORT="public, max-age=300"

s3() {
  if [ "${DRY_RUN:-}" = "1" ]; then
    echo "aws s3 $*"
  else
    aws s3 --endpoint-url "$ENDPOINT" --only-show-errors "$@"
  fi
}

# Files of the version folder: the PMTiles files of the catalog (cz/base.pmtiles, ...) and the
# small JSON files. The check below uses the same list.
KEYS=$(node -e "
  const c = require('./dist/latest.json');
  const urls = c.countries.flatMap((x) => x.parts).flatMap((p) => Object.values(p.files)).map((f) => f.url);
  const keys = urls.map((u) => u.slice(c.baseUrl.length + 1));
  keys.push('regions.json', 'catalog.json', ...Object.keys(c.styles).map((id) => 'style-' + id + '.json'));
  console.log(keys.join('\n'));")

echo "== upload version ${VERSION}"
for key in $KEYS; do
  case "$key" in
    *.pmtiles)
      s3 cp "dist/${key}" "${DEST}/${key}" --cache-control "$IMMUTABLE" --content-type application/octet-stream ;;
  esac
done
for file in dist/regions.json dist/style-*.json; do
  s3 cp "$file" "${DEST}/$(basename "$file")" --cache-control "$IMMUTABLE" --content-type application/json
done
s3 cp dist/latest.json "${DEST}/catalog.json" --cache-control "$IMMUTABLE" --content-type application/json
s3 cp fonts "${DEST}/fonts" --recursive --exclude "*" --include "*.pbf" \
  --cache-control "$IMMUTABLE" --content-type application/x-protobuf
s3 cp sprite "${DEST}/sprite" --recursive --cache-control "$IMMUTABLE"

echo "== check"
if [ "${DRY_RUN:-}" != "1" ]; then
  listed=$(aws s3 ls "${DEST}/" --recursive --endpoint-url "$ENDPOINT" | awk '{print $4}' | sed "s|^v/${VERSION}/||")
  for key in $KEYS; do
    if ! grep -qx "$key" <<<"$listed"; then
      echo "Missing after upload: $key" >&2
      exit 1
    fi
  done
fi

# Libraries of the loader: folders named by version, so they never change.
# Browsers load ES modules only with a JavaScript MIME type, so the types are set here.
s3 cp dist/lib "s3://${R2_BUCKET}/lib" --recursive --exclude "*" --include "*.mjs" --include "*.js" \
  --cache-control "$IMMUTABLE" --content-type text/javascript
s3 cp dist/lib "s3://${R2_BUCKET}/lib" --recursive --exclude "*" --include "*.css" \
  --cache-control "$IMMUTABLE" --content-type text/css
s3 cp dist/lib "s3://${R2_BUCKET}/lib" --recursive --exclude "*" --include "*.txt" \
  --cache-control "$IMMUTABLE" --content-type text/plain

echo "== switch latest.json to ${VERSION}"
s3 cp dist/latest.json "s3://${R2_BUCKET}/latest.json" --cache-control "$SHORT" --content-type application/json
# The loader reads latest.json, so it works with any version; upload it after the switch.
s3 cp dist/map.js "s3://${R2_BUCKET}/map.js" --cache-control "$SHORT" --content-type text/javascript

echo "== delete old versions (keep ${KEEP})"
if [ "${DRY_RUN:-}" != "1" ]; then
  versions=$(aws s3 ls "s3://${R2_BUCKET}/v/" --endpoint-url "$ENDPOINT" | awk '/PRE/ {print $2}' | tr -d '/' | sort)
  old=$(head -n "-${KEEP}" <<<"$versions" || true)
  for v in $old; do
    if [ "$v" != "$VERSION" ]; then
      echo "delete v/${v}"
      s3 rm "s3://${R2_BUCKET}/v/${v}" --recursive
    fi
  done
fi
echo "Published ${VERSION}"
