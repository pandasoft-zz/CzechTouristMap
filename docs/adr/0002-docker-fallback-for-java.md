# ADR 0002: Run Java and Maven in Docker when native Java is missing

- Status: Accepted
- Date: 2026-10-19

## Context

The vector tile build (ADR 0001) needs Java 21+ and Maven. Many developer machines have
neither, or have an older Java. `node tools/czmap.mjs build` then fails.

## Decision

`tools/czmap.mjs` checks `java -version`.

- Java 21+ found: run Java natively. Maven runs natively if `mvn` exists, otherwise in Docker.
- Otherwise: run Maven in `maven:3.9-eclipse-temurin-21` and Planetiler in `eclipse-temurin:21-jre`.
- `CZMAP_DOCKER=1` forces Docker.

The project root is mounted at `/work`. All paths passed to Java are relative to the root,
so the same arguments work natively and in Docker. The Maven repository is kept in `data/m2`
so dependencies are downloaded only once. On Linux and macOS the container runs with the
host user ID, so built files are not owned by root.

## Consequences

- A build works with only Node.js, Python and Docker installed.
- Docker must have enough memory for `-Xmx6g` (about 8 GB for the Docker VM).
- Relief (Python) still runs natively.
