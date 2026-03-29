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
# Container runtime detection order:
#   1. xsltproc native (current shell or WSL)
#   2. podman
#   3. docker
#
########################################################

set -e

STYLE=${1:-CzechTouristMap}
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
THEMES_DIR="$PROJECT_DIR/themes"
OUTPUT_FILE="$THEMES_DIR/$STYLE.xml"
XSLT_FILE="$PROJECT_DIR/src/styles/$STYLE/$STYLE.xslt"
IMAGE_NAME="czechtouristmap-style"

# ── Detect container runtime ──────────────────────────────────────────────────

detect_runtime() {
    # 1. Native xsltproc in current shell
    if command -v xsltproc &>/dev/null; then
        echo "native"
        return
    fi

    # 2. xsltproc via WSL (only from Git Bash — wsl command not available inside WSL)
    if command -v wsl &>/dev/null && wsl which xsltproc &>/dev/null 2>&1; then
        echo "wsl"
        return
    fi

    # 3. Podman
    if command -v podman &>/dev/null; then
        echo "podman"
        return
    fi

    # 4. Docker
    if command -v docker &>/dev/null; then
        echo "docker"
        return
    fi

    echo "none"
}

# ── Build & run ───────────────────────────────────────────────────────────────

RUNTIME=$(detect_runtime)
echo "==> Building theme: $STYLE  (runtime: $RUNTIME)" >&2

# All status messages go to stderr so only the XSLT output reaches stdout/the output file.
# Docker BuildKit writes [+] Building... progress to stdout in non-TTY environments (e.g. VS Code
# task panel), so we redirect the build step explicitly: docker build ... >&2

case "$RUNTIME" in
    native)
        echo "==> Running xsltproc natively..." >&2
        xsltproc "$XSLT_FILE" > "$OUTPUT_FILE"
        ;;

    wsl)
        echo "==> Running xsltproc via WSL..." >&2
        WIN_XSLT=$(cygpath -w "$XSLT_FILE")
        WSL_XSLT=$(wsl wslpath -a "$WIN_XSLT" | tr -d '\r')
        wsl xsltproc "$WSL_XSLT" > "$OUTPUT_FILE"
        ;;

    podman)
        echo "==> Building image with podman..." >&2
        podman build -f "$PROJECT_DIR/src/Dockerfile.style" -t "$IMAGE_NAME" "$PROJECT_DIR/src/" >&2
        echo "==> Running XSLT transform (podman)..." >&2
        podman run --rm -e STYLE="$STYLE" "$IMAGE_NAME" > "$OUTPUT_FILE"
        ;;

    docker)
        echo "==> Building image with docker..." >&2
        docker build -f "$PROJECT_DIR/src/Dockerfile.style" -t "$IMAGE_NAME" "$PROJECT_DIR/src/" >&2
        echo "==> Running XSLT transform (docker)..." >&2
        docker run --rm -e STYLE="$STYLE" "$IMAGE_NAME" > "$OUTPUT_FILE"
        ;;

    none)
        echo "ERROR: No supported runtime found." >&2
        echo "Install one of: xsltproc, podman, docker" >&2
        exit 1
        ;;
esac

echo "==> Output: $OUTPUT_FILE ($(wc -c < "$OUTPUT_FILE") bytes)" >&2
