#!/usr/bin/env bash
# Push the czech-republic.map file as a Docker image to GitHub Container Registry.
#
# Run this ONCE (or when you update the map file).
# The image is then pulled by the CI pipeline — no repeated 500 MB downloads.
#
# Usage:
#   ./scripts/push-map-image.sh [GITHUB_USER_OR_ORG]
#
# Requirements:
#   - maps/czech-republic.map must exist
#   - docker must be installed and running
#   - logged in to GHCR: echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP_FILE="$REPO_ROOT/maps/czech-republic.map"
ORG="${1:-$(git -C "$REPO_ROOT" remote get-url origin | sed 's|.*[:/]\([^/]*\)/.*|\1|')}"
IMAGE="ghcr.io/${ORG}/czechtouristmap-mapdata:latest"
VERSION=$(cat "$REPO_ROOT/config/map-version.txt")
IMAGE_VERSIONED="ghcr.io/${ORG}/czechtouristmap-mapdata:${VERSION}"

if [ ! -f "$MAP_FILE" ]; then
    echo "ERROR: $MAP_FILE not found." >&2
    exit 1
fi

echo "==> Building map image..."
echo "    Map file : $MAP_FILE ($(du -sh "$MAP_FILE" | cut -f1))"
echo "    Image    : $IMAGE"
echo "    Version  : $VERSION"

# Build a minimal image containing only the map file
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cat > "$TMPDIR/Dockerfile" <<'DOCKERFILE'
FROM scratch
COPY czech-republic.map /data/maps/czech-republic.map
DOCKERFILE

cp "$MAP_FILE" "$TMPDIR/czech-republic.map"

docker build -t "$IMAGE" -t "$IMAGE_VERSIONED" "$TMPDIR"

echo "==> Pushing..."
docker push "$IMAGE"
docker push "$IMAGE_VERSIONED"

echo ""
echo "Done. Set this secret in GitHub repo settings:"
echo "  Name : MAP_IMAGE"
echo "  Value: $IMAGE"
echo ""
echo "Update config/map-version.txt and re-run this script when you get a new map."
