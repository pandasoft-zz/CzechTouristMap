# ADR 0006: Check the styles in MapLibre Native, in Docker

- Status: Accepted
- Date: 2026-10-23

## Context

The mobile app draws the map with MapLibre Native. Native drops layers it cannot read and only logs a
warning (docs/native.md). The style spec validator in `czmap check` does not find these problems. Until now
they were only found by hand in the Android emulator.

The Node binding of Native (`@maplibre/maplibre-gl-native`) logs the same warnings. Its prebuilt binary
needs Linux with glibc 2.38 and ICU 74 (Ubuntu 24.04), and an X server for OpenGL.

## Decision

`czmap check-native` runs the check in Docker on every system, also on Linux and in CI:

- Image `czmap-native` from `tools/native/Dockerfile`: Ubuntu 24.04, Node 22 from the official image,
  the binding 6.4.1, Xvfb. `docker build` caches it, so only the first run is slow.
- `tools/native/check.mjs` builds both styles from `style/`, loads them, renders two views with empty tiles
  and fails on every warning or error.
- The project root is mounted read-only. `docker run --init`: without it, `xvfb-run` as process 1 waits
  forever after the check.
- CI (`check.yml`) runs the same command.

The binding is not a dependency in `package.json`: it has no binary for Windows and is only needed here.

## Consequences

- One command, the same result on Windows, macOS, Linux and CI. A run takes about 3 s after the first build.
- Docker is needed for this check (as for the Java build without Java, ADR 0002).
- The binding's Native core is not exactly the one in the app. A manual check in the app is still useful
  after large style changes.
