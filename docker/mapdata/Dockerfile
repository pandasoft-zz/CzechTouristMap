# Stage 1: download and extract the map file
# --platform=$BUILDPLATFORM: always run on the build host, not the target arch
FROM --platform=$BUILDPLATFORM alpine:3 AS downloader
ARG MAP_VERSION
RUN apk add --no-cache wget unzip && \
    wget -q \
        "https://ftp.gwdg.de/pub/misc/openstreetmap/openandromaps/maps${MAP_VERSION}/europe/Czech-Republic.zip" \
        -O /tmp/map.zip && \
    unzip -j /tmp/map.zip "*.map" -d /tmp/maps/ && \
    mv /tmp/maps/*.map /czech-republic.map

# Stage 2: minimal data-only image
FROM scratch
COPY --from=downloader /czech-republic.map /czech-republic.map
