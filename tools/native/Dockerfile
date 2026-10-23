# MapLibre Native (Node binding) for "czmap check-native" (docs/native.md).
# The prebuilt binary needs Ubuntu 24.04 (glibc 2.38, ICU 74). Node comes from the official image.
FROM ubuntu:24.04

COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates libcurl4t64 libicu74 libjpeg-turbo8 libpng16-16t64 libuv1t64 libwebp7 \
        libx11-6 libxext6 libopengl0 libglx0 libgl1-mesa-dri xvfb xauth \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/native
RUN npm init -y >/dev/null && npm install --no-audit --no-fund @maplibre/maplibre-gl-native@6.4.1
ENV NODE_PATH=/opt/native/node_modules
