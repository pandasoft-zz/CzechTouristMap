#!/bin/bash
#######################################################
# Build Mapsforge map theme XML from XSLT templates
#
# Usage:
#   ./build-theme.sh [STYLE]
#   STYLE defaults to CzechTouristMap
#
# Output: themes/STYLE.xml
#
########################################################

set -e

STYLE=${1:-CzechTouristMap}
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
THEMES_DIR="$PROJECT_DIR/themes"
OUTPUT_FILE="$THEMES_DIR/$STYLE.xml"
IMAGE_NAME="czechtouristmap-style"

echo "==> Building Docker image..."
docker build -f "$PROJECT_DIR/src/Dockerfile.style" -t "$IMAGE_NAME" "$PROJECT_DIR/src/"

echo "==> Running XSLT transform for style: $STYLE"
# Container runs xsltproc and writes XML to stdout.
# We capture stdout here and write to the host themes/ directory.
# This avoids Docker volume write issues on Windows/WSL2.
docker run --rm \
  -e STYLE="$STYLE" \
  "$IMAGE_NAME" \
  > "$OUTPUT_FILE"

echo "==> Output: $OUTPUT_FILE ($(wc -c < "$OUTPUT_FILE") bytes)"
