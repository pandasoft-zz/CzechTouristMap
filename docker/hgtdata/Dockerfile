# syntax=docker/dockerfile:1.4

# Stage 1: download Copernicus DEM GLO-30, convert to SRTM HGT
# --platform=$BUILDPLATFORM: always run on the build host, not the target arch
FROM --platform=$BUILDPLATFORM ubuntu:24.04 AS downloader
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget gdal-bin \
    && rm -rf /var/lib/apt/lists/*

RUN <<'EOF'
#!/bin/bash
set -euo pipefail
mkdir -p /hgt

# Czech Republic bounding box: lat 48-51 N, lon 12-18 E (1° tiles)
for lat in 48 49 50 51; do
    for lon in 12 13 14 15 16 17 18; do
        lat_s=$(printf "%02d" "$lat")
        lon_s=$(printf "%03d" "$lon")
        tile="Copernicus_DSM_COG_10_N${lat_s}_00_E${lon_s}_00_DEM"
        echo -n "  N${lat_s}E${lon_s}: "

        url="https://copernicus-dem-30m.s3.amazonaws.com/${tile}/${tile}.tif"
        if wget -q -O /tmp/src.tif "${url}" 2>/dev/null; then
            # Copernicus tiles are 3600x3600; SRTM HGT requires 3601x3601
            # (shared edge-pixel convention). gdalwarp resamples to exact extent.
            gdalwarp -q -r bilinear \
                -te "${lon}.0" "${lat}.0" "$((lon + 1)).0" "$((lat + 1)).0" \
                -ts 3601 3601 /tmp/src.tif /tmp/warped.tif
            gdal_translate -q -of SRTMHGT /tmp/warped.tif "/hgt/N${lat_s}E${lon_s}.hgt"
            rm -f /tmp/src.tif /tmp/warped.tif
            echo "ok"
        else
            echo "not found, skipping"
        fi
    done
done

[ "$(ls -A /hgt)" ] || { echo "ERROR: no HGT tiles downloaded" >&2; exit 1; }
EOF

# Stage 2: minimal data-only image
FROM scratch
COPY --from=downloader /hgt/ /
