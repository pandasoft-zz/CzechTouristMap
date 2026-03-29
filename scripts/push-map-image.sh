#!/usr/bin/env bash
# Build and push the czech-republic.map Docker image to GHCR.
#
# Run this ONCE, or when you get an updated map file.
# After pushing, the CI pipeline and docker-compose both use this image —
# no manual map file management needed.
#
# Usage:
#   ./scripts/push-map-image.sh [GITHUB_USER_OR_ORG]
#
# Requirements:
#   - docker installed and running
#   - logged in to GHCR:
#       echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP_FILE="$REPO_ROOT/maps/czech-republic.map"
ORG="${1:-$(git -C "$REPO_ROOT" remote get-url origin \
  | sed 's|.*[:/]\([^/]*\)/.*|\1|' | tr '[:upper:]' '[:lower:]')}"
VERSION=$(tr -d '[:space:]' < "$REPO_ROOT/config/map-version.txt")
MAP_URL="https://ftp.gwdg.de/pub/misc/openstreetmap/openandromaps/maps${VERSION}/europe/Czech-Republic.zip"
IMAGE_LATEST="ghcr.io/${ORG}/czechtouristmap-mapdata:latest"
IMAGE_VERSIONED="ghcr.io/${ORG}/czechtouristmap-mapdata:${VERSION}"

# ── Download map if not present ────────────────────────────────────────────
if [ ! -f "$MAP_FILE" ]; then
    echo "==> map file not found — downloading from OpenAndroMaps (${VERSION})..."
    mkdir -p "$REPO_ROOT/maps"
    TMPZIP=$(mktemp /tmp/czech-republic.XXXXXX.zip)
    trap 'rm -f "$TMPZIP"' EXIT
    wget -q --show-progress \
        -O "$TMPZIP" \
        "$MAP_URL"
    echo "==> extracting..."
    unzip -p "$TMPZIP" "*.map" > "$MAP_FILE" || {
        # some archives use a flat layout
        unzip -j "$TMPZIP" "*.map" -d "$REPO_ROOT/maps/"
        # rename to expected filename if needed
        find "$REPO_ROOT/maps/" -name "*.map" ! -name "czech-republic.map" \
            -exec mv {} "$MAP_FILE" \;
    }
    rm -f "$TMPZIP"
    trap - EXIT
fi

echo "==> Building map image..."
echo "    Map file : $MAP_FILE ($(du -sh "$MAP_FILE" | cut -f1))"
echo "    Image    : $IMAGE_LATEST"
echo "    Version  : $VERSION"

# ── Build image ────────────────────────────────────────────────────────────
# Uses alpine so the image can serve as an init container in docker-compose:
# the CMD copies the map to a shared volume if not already present.
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cat > "$TMPDIR/Dockerfile" <<'DOCKERFILE'
FROM alpine:3
COPY czech-republic.map /data/maps/czech-republic.map
CMD ["sh", "-c", \
  "[ -f /export/czech-republic.map ] \
   && echo 'map-init: already present, skipping.' \
   || { echo 'map-init: copying map file...'; \
        cp /data/maps/czech-republic.map /export/czech-republic.map; \
        echo 'map-init: done.'; }"]
DOCKERFILE

cp "$MAP_FILE" "$TMPDIR/czech-republic.map"
docker build -t "$IMAGE_LATEST" -t "$IMAGE_VERSIONED" "$TMPDIR"

# ── Push ────────────────────────────────────────────────────────────────────
echo "==> Pushing..."
docker push "$IMAGE_LATEST"
docker push "$IMAGE_VERSIONED"

echo ""
echo "Done. Image pushed: $IMAGE_LATEST"
echo ""
echo "To update the map in future:"
echo "  1. Edit config/map-version.txt"
echo "  2. Commit and push — the push-map-image workflow runs automatically"
echo "  3. docker compose run --rm map-init   (on local machines)"
