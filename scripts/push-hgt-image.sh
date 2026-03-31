#!/usr/bin/env bash
# Build and push the Copernicus DEM GLO-30 HGT Docker image to GHCR.
#
# Downloads Copernicus DEM GLO-30 tiles for Czech Republic from the public
# AWS S3 bucket (no authentication required), converts each tile from
# GeoTIFF to SRTM HGT format using GDAL, and packages the result into a
# Docker image.
#
# Triggered automatically by CI when config/hgt-version.txt changes.
# Can also be run locally:
#   ./scripts/push-hgt-image.sh [GITHUB_USER_OR_ORG]
#
# Requirements:
#   - docker, aws (CLI), gdal-bin installed
#   - logged in to GHCR:
#       echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORG="${1:-$(git -C "$REPO_ROOT" remote get-url origin \
  | sed 's|.*[:/]\([^/]*\)/.*|\1|' | tr '[:upper:]' '[:lower:]')}"
VERSION=$(cat "$REPO_ROOT/config/hgt-version.txt")
IMAGE_LATEST="ghcr.io/${ORG}/czechtouristmap-hgtdata:latest"
IMAGE_VERSIONED="ghcr.io/${ORG}/czechtouristmap-hgtdata:${VERSION}"

# Czech Republic bounding box: lat 48–51 N, lon 12–18 E (1° tiles)
LATS=(48 49 50 51)
LONS=(12 13 14 15 16 17 18)

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT
mkdir -p "$WORKDIR/hgt"

echo "==> Downloading Copernicus DEM GLO-30 tiles..."
for lat in "${LATS[@]}"; do
    for lon in "${LONS[@]}"; do
        lat_s=$(printf "%02d" "$lat")
        lon_s=$(printf "%03d" "$lon")
        tile="Copernicus_DSM_COG_10_N${lat_s}_00_E${lon_s}_00_DEM"
        s3_path="s3://copernicus-dem-30m/${tile}/${tile}.tif"
        hgt_out="$WORKDIR/hgt/N${lat_s}E${lon_s}.hgt"
        tif_tmp="$WORKDIR/tmp_${lat_s}_${lon_s}.tif"

        echo -n "  N${lat_s}E${lon_s}: downloading... "
        if aws s3 cp "$s3_path" "$tif_tmp" --no-sign-request --quiet 2>/dev/null; then
            echo -n "resampling... "
            # Copernicus tiles are 3600x3600; SRTM HGT requires 3601x3601
            # (edge pixels are shared between adjacent tiles).
            # gdalwarp resamples to the exact 1°x1° extent at 3601x3601.
            warped_tmp="$WORKDIR/warped_${lat_s}_${lon_s}.tif"
            gdalwarp -q -r bilinear \
                -te "${lon}.0" "${lat}.0" "$((lon + 1)).0" "$((lat + 1)).0" \
                -ts 3601 3601 \
                "$tif_tmp" "$warped_tmp"
            rm -f "$tif_tmp"
            echo -n "converting... "
            gdal_translate -q -of SRTMHGT "$warped_tmp" "$hgt_out"
            rm -f "$warped_tmp"
            echo "ok"
        else
            echo "not found, skipping"
        fi
    done
done

HGT_COUNT=$(find "$WORKDIR/hgt" -name "*.hgt" | wc -l)
if [ "$HGT_COUNT" -eq 0 ]; then
    echo "ERROR: no HGT tiles downloaded — aborting" >&2
    exit 1
fi
echo "==> $HGT_COUNT tiles ready"

# ── Build image ────────────────────────────────────────────────────────────
echo "==> Building image..."
echo "    Image  : $IMAGE_LATEST"
echo "    Version: $VERSION"

cat > "$WORKDIR/Dockerfile" <<'DOCKERFILE'
FROM alpine:3
COPY hgt/ /data/hgt/
DOCKERFILE

docker build -t "$IMAGE_LATEST" -t "$IMAGE_VERSIONED" "$WORKDIR"

# ── Push ────────────────────────────────────────────────────────────────────
echo "==> Pushing..."
docker push "$IMAGE_LATEST"
docker push "$IMAGE_VERSIONED"

echo ""
echo "Done. Image pushed: $IMAGE_LATEST"
echo ""
echo "To update HGT data in future:"
echo "  1. Edit config/hgt-version.txt"
echo "  2. Commit and push — the push-hgt-image workflow runs automatically"
