#!/usr/bin/env bash
# Build PMTiles from OpenStreetMap data using Tilemaker.
#
# Usage:
#   ./scripts/build-pmtiles.sh [LOCATION|--bbox W,S,E,N] [--zoom-min N] [--zoom-max N] [--output FILE]
#
# Examples:
#   ./scripts/build-pmtiles.sh Blansko
#   ./scripts/build-pmtiles.sh "Brno — Stará osada"
#   ./scripts/build-pmtiles.sh --bbox 15.6,50.2,16.1,50.8 --zoom-max 14
#   ./scripts/build-pmtiles.sh --bbox 13.0,48.5,14.0,49.5 --output Sumava.pmtiles
#
# Predefined locations come from config/locations.yaml

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAPS_DIR="$REPO_ROOT/maps"
OUTPUT_DIR="$REPO_ROOT/web/assets"
PBF_FILE="$MAPS_DIR/czech-republic.osm.pbf"
TILEMAKER_CONFIG="$REPO_ROOT/tile-server/tilemaker"
STYLE_FILE="$TILEMAKER_CONFIG/style.json"

# Defaults
BBOX=""
ZOOM_MIN=0
ZOOM_MAX=14
OUTPUT_FILE="CzechTouristMap.pmtiles"
LOCATION="${1:-}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --bbox)
            BBOX="$2"
            shift 2
            ;;
        --zoom-min)
            ZOOM_MIN="$2"
            shift 2
            ;;
        --zoom-max)
            ZOOM_MAX="$2"
            shift 2
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            LOCATION="$1"
            shift
            ;;
    esac
done

# Resolve location to bbox if provided
if [ -n "$LOCATION" ] && [ -z "$BBOX" ]; then
    echo "==> Resolving location: $LOCATION"
    # Extract bbox from locations.yaml using Python
    BBOX=$(python3 << 'PYTHON'
import yaml
import sys

location_name = "$LOCATION"
with open("$REPO_ROOT/config/locations.yaml") as f:
    config = yaml.safe_load(f)

for loc in config.get("locations", []):
    if loc["name"].lower() == location_name.lower():
        lat = loc["lat"]
        lng = loc["lng"]
        # Create a 5km radius bbox (approximate)
        delta_lat = 0.045  # ~5km
        delta_lng = 0.06   # ~5km at ~50°N
        west = lng - delta_lng
        south = lat - delta_lat
        east = lng + delta_lng
        north = lat + delta_lat
        print(f"{west},{south},{east},{north}")
        sys.exit(0)

print(f"Location '{location_name}' not found", file=sys.stderr)
sys.exit(1)
PYTHON
)
    if [ -z "$BBOX" ]; then
        exit 1
    fi
    echo "   Bbox: $BBOX"
fi

# ── Download PBF if not present ────────────────────────────────────────────
if [ ! -f "$PBF_FILE" ]; then
    echo "==> Downloading Czech Republic OSM data from Geofabrik..."
    mkdir -p "$MAPS_DIR"
    TMPFILE=$(mktemp "$MAPS_DIR/czech-republic.XXXXXX.pbf")
    trap 'rm -f "$TMPFILE"' EXIT

    wget -q --show-progress \
        -O "$TMPFILE" \
        "https://download.geofabrik.de/europe/czech-republic-latest.osm.pbf"

    mv "$TMPFILE" "$PBF_FILE"
    trap - EXIT
    echo "   Downloaded: $(du -sh "$PBF_FILE" | cut -f1)"
fi

# ── Build output directory ─────────────────────────────────────────────────
mkdir -p "$OUTPUT_DIR"

# ── Run Tilemaker ─────────────────────────────────────────────────────────
echo "==> Building PMTiles..."
echo "   Input: $PBF_FILE"
echo "   Output: $OUTPUT_DIR/$OUTPUT_FILE"
echo "   Zoom: $ZOOM_MIN–$ZOOM_MAX"
[ -n "$BBOX" ] && echo "   Bbox: $BBOX"

# Build Tilemaker command
CMD="tilemaker"
CMD="$CMD --input $PBF_FILE"
CMD="$CMD --output $OUTPUT_DIR/$OUTPUT_FILE"
CMD="$CMD --style $STYLE_FILE"
CMD="$CMD --zoom-min $ZOOM_MIN"
CMD="$CMD --zoom-max $ZOOM_MAX"
[ -n "$BBOX" ] && CMD="$CMD --bbox $BBOX"

# Run in Docker if Tilemaker not available locally
if ! command -v tilemaker &> /dev/null; then
    echo "   (Running in Docker container)"
    docker run --rm \
        -v "$MAPS_DIR:/data:ro" \
        -v "$OUTPUT_DIR:/output:rw" \
        -v "$TILEMAKER_CONFIG:/config:ro" \
        ghcr.io/systemed/tilemaker:latest \
        --input /data/czech-republic.osm.pbf \
        --output /output/$OUTPUT_FILE \
        --style /config/style.json \
        --zoom-min $ZOOM_MIN \
        --zoom-max $ZOOM_MAX \
        ${BBOX:+--bbox $BBOX}
else
    eval "$CMD"
fi

# ── Report ─────────────────────────────────────────────────────────────────
SIZE=$(du -sh "$OUTPUT_DIR/$OUTPUT_FILE" | cut -f1)
echo ""
echo "✓ PMTiles built successfully"
echo "  File: $OUTPUT_DIR/$OUTPUT_FILE ($SIZE)"
echo ""
echo "To view:"
echo "  - Open web/index.html in a browser"
echo "  - Or: make dev (then http://localhost)"
