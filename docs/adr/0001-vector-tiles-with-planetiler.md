# ADR 0001: Build vector tiles with Planetiler (Java)

- Status: Accepted
- Date: 2026-10-19

## Context

The map is a set of PMTiles files built from an OpenStreetMap extract of the Czech Republic.
We need a tool that turns OSM data into vector tiles. Requirements:

- Output PMTiles directly.
- Read route relations (hiking, cycling) and copy their tags to member ways.
  The style needs this to draw KČT colours as parallel stripes.
- Merge and simplify geometry per zoom level. Each PMTiles file must stay under 500 MB (see ADR 0004).
- Fast build on one machine (4 cores, 8 GB RAM).
- Open source license with no use limits.

The question was if Java is a good choice, or if Go, Rust or C++ is better.

## Options

| Language | Tool | Notes |
|---|---|---|
| Java | [Planetiler](https://github.com/onthegomap/planetiler) | Profile in Java. PMTiles output. Relation API. `FeatureMerge` for line and polygon merging. Apache 2.0. |
| C++ | [tilemaker](https://github.com/systemed/tilemaker) | Profile in Lua. PMTiles output. Relation support. Fewer post-processing options for merging. FTWPL. |
| Go | none | `go-pmtiles` only reads, converts and serves archives. No OSM to vector tiles generator. |
| Rust | none | No mature OSM to vector tiles generator. |

For Go and Rust we would have to write our own generator: PBF reading, multipolygon building,
clipping and simplification. This is weeks of work with no better result.

## Decision

Use Planetiler with a Java profile (`tiles/`).

The language choice follows from the tool choice. Java is only used at build time.
The map in the browser and the PMTiles files do not depend on Java.

## Consequences

Good:

- `FeatureMerge` (line merge, polygon union) keeps the files small.
  First full build: `base` 408 MB, `routes` 23 MB.
- Route relations are handled in `RoutesProfile` with `preprocessOsmRelation()`.
- Full build of `base.pmtiles` takes about 10 minutes on 4 cores.

Bad:

- The build machine needs JDK 21 and Maven.
- A profile change needs a compile step (`czmap build` does it automatically).
- A shaded (fat) jar breaks the log4j plugin cache, so `tiles/pom.xml` copies dependencies
  to `target/lib` instead.

## When to revisit

- If Planetiler stops being maintained.
- If we want to remove the JVM from the build. Then try tilemaker and compare file size
  and build time on the same data.
