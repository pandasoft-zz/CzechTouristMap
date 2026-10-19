"""Build data/contours.gpkg: contour lines from a digital terrain model (DTM).

The vector tiles are made from this file by Planetiler (profile "contours").

Source (--source):
- sonny: Sonny's LiDAR DTM of Europe, 1" HGT files (https://sonny.4lima.de, CC BY 4.0).
  It is a terrain model (no trees, no buildings). The files cannot be downloaded by a
  script; put the downloaded *.zip or *.hgt files into data/sonny/ (subfolders are fine).
- copernicus: the Copernicus DSM in data/dem/ (from build_relief.py). It is a surface
  model with trees and buildings, so contours bend around forest edges. Use it only
  for tests.

Steps per 1 x 1 degree DEM tile (in parallel):
1. Read the tile with a small border from its neighbours, so lines meet at tile edges.
2. Smooth the heights (Gaussian filter): it removes the 1 m steps of the HGT values.
3. Trace contours every --interval metres (contourpy).
4. Clip the lines to the tile and to the area polygon (with --margin), simplify them
   and drop very short closed loops.
"""

import argparse
import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import contourpy
import numpy as np
import pyogrio.raw
import rasterio
import shapely
from rasterio.merge import merge
from scipy import ndimage

from build_relief import fill_nan, read_poly
from dem_sources import find_copernicus, find_sonny

ARCSEC = 1 / 3600


def log(message):
    print(f"[contours] {message}", flush=True)


def read_tile(files, lat, lon, border):
    """Heights of one tile plus a border from the neighbours, on a 1" grid."""
    sources = []
    for dlat in (-1, 0, 1):
        for dlon in (-1, 0, 1):
            path = files.get((lat + dlat, lon + dlon))
            if path:
                sources.append(rasterio.open(path))
    b = border * ARCSEC
    bounds = (lon - b, lat - b, lon + 1 + b, lat + 1 + b)
    try:
        heights, transform = merge(
            sources,
            bounds=bounds,
            res=ARCSEC,
            nodata=-32768,
            dtype="float32",
            resampling=rasterio.enums.Resampling.bilinear,
        )
    finally:
        for src in sources:
            src.close()
    heights = heights[0]
    heights[heights <= -1000] = np.nan
    return heights, transform


def contour_tile(job):
    """Contour lines of one tile as (WKB list, height list)."""
    files, lat, lon, area_wkb, args = job
    area = shapely.from_wkb(area_wkb)
    cell = shapely.box(lon, lat, lon + 1, lat + 1)
    if not area.intersects(cell):
        return [], []
    clip = shapely.intersection(area, cell)
    shapely.prepare(clip)

    heights, transform = read_tile(files, lat, lon, args.border)
    if np.isnan(heights).all():
        return [], []
    heights = fill_nan(heights)
    if args.sigma > 0:
        heights = ndimage.gaussian_filter(heights, args.sigma)

    rows, cols = heights.shape
    xs = transform.c + (np.arange(cols) + 0.5) * transform.a
    ys = transform.f + (np.arange(rows) + 0.5) * transform.e
    gen = contourpy.contour_generator(x=xs, y=ys, z=heights, line_type="Separate")

    lo = np.floor(np.nanmin(heights) / args.interval) * args.interval
    hi = np.ceil(np.nanmax(heights) / args.interval) * args.interval
    geoms, eles = [], []
    for level in np.arange(lo, hi + args.interval, args.interval):
        lines = [shapely.LineString(c) for c in gen.lines(level) if len(c) > 1]
        if not lines:
            continue
        lines = shapely.simplify(np.array(lines), args.simplify * ARCSEC)
        for line in lines:
            # Small closed loops are noise (pits and bumps of a few pixels).
            if line.is_closed and line.length < args.min_loop * ARCSEC:
                continue
            if not clip.contains(line):
                line = shapely.intersection(line, clip)
            if line.is_empty:
                continue
            for part in getattr(line, "geoms", [line]):
                if part.geom_type == "LineString" and part.length > 0:
                    geoms.append(shapely.to_wkb(part))
                    eles.append(int(round(level)))
    return geoms, eles


def build(args):
    root = Path(args.data_dir)
    if args.source == "sonny":
        files = find_sonny(root / "sonny")
        if not files:
            sys.exit(
                "No HGT files in data/sonny/. Download Sonny's 1\" DTM "
                "(https://sonny.4lima.de) and put the zip files there."
            )
    else:
        files = find_copernicus(root / "dem")
        log("WARNING: Copernicus is a surface model; use it only for tests")
    log(f"{len(files)} DEM tiles from {args.source}")

    rings = read_poly(root / "area.poly")
    area = shapely.unary_union([shapely.Polygon(r) for r in rings]).buffer(args.margin)
    west, south, east, north = area.bounds
    tiles = [
        (lat, lon)
        for lat in range(int(np.floor(south)), int(np.ceil(north)))
        for lon in range(int(np.floor(west)), int(np.ceil(east)))
        if (lat, lon) in files
    ]
    if args.only:
        only = {tuple(int(v) for v in t.split(",")) for t in args.only}
        tiles = [t for t in tiles if t in only]
    log(f"{len(tiles)} tiles touch the area")

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    tmp = output.with_suffix(".tmp.gpkg")
    tmp.unlink(missing_ok=True)

    started = time.time()
    count = 0
    jobs = [(files, lat, lon, shapely.to_wkb(area), args) for lat, lon in tiles]
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        for i, (geoms, eles) in enumerate(pool.map(contour_tile, jobs), 1):
            if geoms:
                pyogrio.raw.write(
                    tmp,
                    geometry=np.array(geoms, dtype=object),
                    field_data=[np.array(eles, dtype=np.int32)],
                    fields=["ele"],
                    layer="contours",
                    driver="GPKG",
                    geometry_type="LineString",
                    crs="EPSG:4326",
                    append=tmp.exists(),
                )
                count += len(geoms)
            log(f"tile {i}/{len(tiles)}: {len(geoms)} lines ({time.time() - started:.0f} s)")
    tmp.replace(output)
    size = output.stat().st_size / 1e6
    log(f"wrote {output} ({count} lines, {size:.0f} MB) in {time.time() - started:.0f} s")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--data-dir", default="data")
    parser.add_argument("--output", default="data/contours.gpkg")
    parser.add_argument("--source", choices=["sonny", "copernicus"], default="sonny")
    parser.add_argument("--interval", type=float, default=10, help="metres")
    parser.add_argument("--sigma", type=float, default=1.5, help="smoothing in pixels")
    parser.add_argument("--simplify", type=float, default=0.25, help="tolerance in pixels")
    parser.add_argument("--min-loop", type=float, default=12, help="pixels; shorter loops go")
    parser.add_argument("--border", type=int, default=8, help="pixels from neighbour tiles")
    parser.add_argument("--margin", type=float, default=0.03, help="degrees around area")
    parser.add_argument("--only", nargs="*", help="only these tiles, e.g. 49,16 (tests)")
    parser.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) // 2))
    build(parser.parse_args())


if __name__ == "__main__":
    main()
