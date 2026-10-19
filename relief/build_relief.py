"""Build relief.pmtiles: elevation tiles (Terrarium encoding) for MapLibre hillshading.

Source (--source):
- sonny: Sonny's LiDAR DTM of Europe, 1" HGT files in terrain/sonny/ (Git LFS) and
  data/sonny/ (https://sonny.4lima.de, CC BY 4.0). A terrain model without trees and
  buildings. Default when these folders have files.
- copernicus: Copernicus DEM GLO-30 (public AWS bucket, about 30 m), downloaded by
  this script.
  A surface model: forest edges and buildings show in the shading.

Steps:
1. Find or download DEM tiles (1 x 1 degree) for the area.
2. Reproject the mosaic to Web Mercator at the max zoom grid.
3. Keep only tiles near the area polygon (the OSM extract border).
4. Build lower zooms by 2 x 2 averaging.
5. Encode heights as Terrarium RGB, save as lossless WebP into PMTiles.

Heights are rounded to --step metres. A coarse step makes tiles much smaller,
because the low bits of the height are noise for hillshading.
"""

import argparse
import io
import math
import os
import sys
import time
import urllib.request
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from pmtiles.tile import Compression, TileType, zxy_to_tileid
from pmtiles.writer import Writer
from rasterio.features import rasterize
from rasterio.transform import from_origin
from rasterio.warp import Resampling, reproject
from scipy import ndimage

from dem_sources import find_sonny, tile_key

DEM_URL = (
    "https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/" "{name}/{name}.tif"
)
POLY_URL = "https://download.openstreetmap.fr/polygons/europe/czech_republic.poly"

TILE_SIZE = 256
WORLD = 20037508.342789244  # half of the Web Mercator world width in metres


def log(message):
    print(f"[relief] {message}", flush=True)


def download(url, path, attempts=4):
    if path.exists():
        return True
    tmp = path.with_suffix(path.suffix + ".part")
    for attempt in range(1, attempts + 1):
        try:
            with (
                urllib.request.urlopen(url, timeout=120) as resp,
                open(tmp, "wb") as out,
            ):
                while chunk := resp.read(1 << 20):
                    out.write(chunk)
            break
        except urllib.error.HTTPError as err:
            if err.code in (403, 404):
                return False
            raise
        except (urllib.error.URLError, OSError) as err:
            # Connection resets and timeouts: wait and try again.
            if attempt == attempts:
                raise
            log(f"download failed ({err}), retry {attempt}/{attempts - 1}")
            time.sleep(5 * attempt)
    tmp.rename(path)
    return True


def download_dem(dem_dir, lon_range, lat_range):
    dem_dir.mkdir(parents=True, exist_ok=True)
    files = []
    for lat in range(lat_range[0], lat_range[1] + 1):
        for lon in range(lon_range[0], lon_range[1] + 1):
            ns = "N" if lat >= 0 else "S"
            ew = "E" if lon >= 0 else "W"
            name = (
                f"Copernicus_DSM_COG_10_{ns}{abs(lat):02d}_00_{ew}{abs(lon):03d}_00_DEM"
            )
            path = dem_dir / f"{name}.tif"
            if download(DEM_URL.format(name=name), path):
                files.append(path)
            else:
                log(f"missing DEM tile {name} (sea or no data)")
    log(f"{len(files)} DEM tiles ready in {dem_dir}")
    return files


def read_poly(path):
    """Read an Osmosis .poly file. Returns a list of rings (lon, lat)."""
    rings, ring = [], None
    for line in path.read_text().splitlines()[1:]:
        line = line.strip()
        if not line:
            continue
        if line == "END":
            if ring is not None:
                rings.append(ring)
                ring = None
            continue
        if ring is None:
            ring = []
            continue
        lon, lat = map(float, line.split()[:2])
        ring.append((lon, lat))
    return rings


def lonlat_to_merc(lon, lat):
    x = lon * WORLD / 180
    y = math.log(math.tan((90 + lat) * math.pi / 360)) * WORLD / math.pi
    return x, y


def tile_range(bounds, zoom):
    """Tile x/y range covering (west, south, east, north) at zoom."""
    n = 2**zoom

    def tile(lon, lat):
        x = int((lon + 180) / 360 * n)
        lat_r = math.radians(lat)
        y = int((1 - math.asinh(math.tan(lat_r)) / math.pi) / 2 * n)
        return x, y

    west, south, east, north = bounds
    x0, y0 = tile(west, north)
    x1, y1 = tile(east, south)
    return x0, y0, x1, y1


def encode_terrarium(height, step):
    """Height array (metres) -> RGB uint8 array in Terrarium encoding."""
    h = np.round(height / step) * step + 32768.0
    r = np.floor(h / 256)
    g = np.floor(h - r * 256)
    b = np.floor((h - np.floor(h)) * 256)
    rgb = np.stack([r, g, b], axis=-1)
    return np.clip(rgb, 0, 255).astype(np.uint8)


def encode_tile(args):
    tile_id, height, step, fmt = args
    if np.isnan(height).any():
        height = fill_nan(height)
    img = Image.fromarray(encode_terrarium(height, step), "RGB")
    buf = io.BytesIO()
    if fmt == "webp":
        # Effort 50 / method 4: about 50x faster than max effort, files ~15 % larger.
        img.save(buf, "WEBP", lossless=True, quality=50, method=4)
    else:
        img.save(buf, "PNG", optimize=True)
    return tile_id, buf.getvalue()


def fill_nan(array):
    """Fill NaN cells with the nearest valid value."""
    mask = np.isnan(array)
    if not mask.any():
        return array
    if mask.all():
        return np.zeros_like(array)
    idx = ndimage.distance_transform_edt(
        mask, return_distances=False, return_indices=True
    )
    return array[tuple(idx)]


def build(args):
    root = Path(args.data_dir)
    lon0, lat0, lon1, lat1 = args.dem_bbox
    source = args.source
    if source == "auto":
        source = "sonny" if find_sonny(root) else "copernicus"
    if source == "sonny":
        tiles = find_sonny(root)
        dem_files = [
            path
            for (lat, lon), path in sorted(tiles.items())
            if lat0 <= lat <= lat1 and lon0 <= lon <= lon1
        ]
        if not dem_files:
            sys.exit(
                "No HGT files in terrain/sonny/ or data/sonny/ (see build_contours.py)"
            )
        log(f"{len(dem_files)} DEM tiles from Sonny's LiDAR DTM")
        # Tiles in the margin without Sonny data: Copernicus underneath. The mosaic is
        # filled in list order, so the Sonny tiles come last and win where both exist.
        fallback = [
            path
            for path in download_dem(root / "dem", (lon0, lon1), (lat0, lat1))
            if tile_key(path.name) not in tiles
        ]
        log(f"{len(fallback)} Copernicus tiles fill the rest of the margin")
        dem_files = fallback + dem_files
    else:
        dem_files = download_dem(root / "dem", (lon0, lon1), (lat0, lat1))
    poly_path = root / "area.poly"
    if not download(args.poly_url, poly_path):
        sys.exit(f"Cannot download {args.poly_url}")
    rings = read_poly(poly_path)
    lons = [p[0] for r in rings for p in r]
    lats = [p[1] for r in rings for p in r]
    area_bounds = (min(lons), min(lats), max(lons), max(lats))

    maxz, minz = args.maxzoom, args.minzoom
    align = 2 ** (maxz - minz)
    x0, y0, x1, y1 = tile_range(area_bounds, maxz)
    # Align the grid to whole tiles at min zoom, so 2 x 2 averaging works.
    x0, y0 = x0 // align * align, y0 // align * align
    x1, y1 = (x1 // align + 1) * align - 1, (y1 // align + 1) * align - 1
    nx, ny = x1 - x0 + 1, y1 - y0 + 1
    tile_m = 2 * WORLD / 2**maxz
    res = tile_m / TILE_SIZE
    transform = from_origin(-WORLD + x0 * tile_m, WORLD - y0 * tile_m, res, res)
    log(f"grid z{maxz}: {nx} x {ny} tiles ({nx * TILE_SIZE} x {ny * TILE_SIZE} px)")

    started = time.time()
    mosaic = np.full((ny * TILE_SIZE, nx * TILE_SIZE), np.nan, dtype=np.float32)
    for i, path in enumerate(dem_files, 1):
        with rasterio.open(path) as src:
            reproject(
                source=rasterio.band(src, 1),
                destination=mosaic,
                dst_transform=transform,
                dst_crs="EPSG:3857",
                dst_nodata=np.nan,
                init_dest_nodata=False,
                resampling=Resampling.bilinear,
            )
        if i % 8 == 0:
            log(f"reprojected {i}/{len(dem_files)} DEM tiles")
    log(f"mosaic ready in {time.time() - started:.0f} s")

    # Mask of max zoom tiles that touch the area polygon, grown by --margin tiles.
    merc_rings = [[lonlat_to_merc(lon, lat) for lon, lat in r] for r in rings]
    tile_transform = from_origin(
        -WORLD + x0 * tile_m, WORLD - y0 * tile_m, tile_m, tile_m
    )
    keep = rasterize(
        [{"type": "Polygon", "coordinates": [r]} for r in merc_rings],
        out_shape=(ny, nx),
        transform=tile_transform,
        all_touched=True,
        dtype=np.uint8,
    ).astype(bool)
    if args.margin > 0:
        keep = ndimage.binary_dilation(keep, iterations=args.margin)
    log(f"z{maxz}: {int(keep.sum())} tiles inside the area")

    jobs = []
    level, level_keep = mosaic, keep
    for z in range(maxz, minz - 1, -1):
        scale = 2 ** (maxz - z)
        ox, oy = x0 // scale, y0 // scale
        if z < maxz:
            h, w = level.shape
            with np.errstate(invalid="ignore"):
                level = np.nanmean(
                    level.reshape(h // 2, 2, w // 2, 2), axis=(1, 3)
                ).astype(np.float32)
            kh, kw = level_keep.shape
            level_keep = level_keep.reshape(kh // 2, 2, kw // 2, 2).any(axis=(1, 3))
            level = fill_nan(level)
        count = 0
        for ty, tx in zip(*np.nonzero(level_keep)):
            tile = level[
                ty * TILE_SIZE : (ty + 1) * TILE_SIZE,
                tx * TILE_SIZE : (tx + 1) * TILE_SIZE,
            ]
            if np.isnan(tile).all():
                continue
            tile_id = zxy_to_tileid(z, int(ox + tx), int(oy + ty))
            jobs.append((tile_id, tile.copy(), args.step, args.format))
            count += 1
        log(f"z{z}: {count} tiles")
    del mosaic

    jobs.sort(key=lambda j: j[0])
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(".pmtiles.part")
    started = time.time()
    total = 0
    with open(tmp, "wb") as f, ProcessPoolExecutor(args.workers) as pool:
        writer = Writer(f)
        for i, (tile_id, data) in enumerate(
            pool.map(encode_tile, jobs, chunksize=16), 1
        ):
            writer.write_tile(tile_id, data)
            total += len(data)
            if i % 2000 == 0:
                log(f"encoded {i}/{len(jobs)} tiles")
        west, south, east, north = area_bounds
        writer.finalize(
            {
                "tile_type": TileType.WEBP if args.format == "webp" else TileType.PNG,
                "tile_compression": Compression.NONE,
                "min_lon_e7": int(west * 1e7),
                "min_lat_e7": int(south * 1e7),
                "max_lon_e7": int(east * 1e7),
                "max_lat_e7": int(north * 1e7),
                "center_zoom": 8,
                "center_lon_e7": int((west + east) / 2 * 1e7),
                "center_lat_e7": int((south + north) / 2 * 1e7),
            },
            {
                "name": "Czech Tourist Map - relief",
                "description": "Elevation in Terrarium encoding for hillshading",
                "attribution": "© Copernicus DEM GLO-30, ESA",
                "encoding": "terrarium",
                "step": args.step,
            },
        )
    os.replace(tmp, out)
    log(
        f"wrote {out}: {len(jobs)} tiles, {out.stat().st_size / 1e6:.1f} MB "
        f"(avg {total / max(len(jobs), 1) / 1e3:.1f} kB/tile) in {time.time() - started:.0f} s"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--data-dir", default="data")
    parser.add_argument("--output", default="dist/relief.pmtiles")
    parser.add_argument(
        "--source", choices=["auto", "sonny", "copernicus"], default="auto"
    )
    parser.add_argument("--poly-url", default=POLY_URL)
    parser.add_argument(
        "--dem-bbox",
        type=lambda s: [int(v) for v in s.split(",")],
        default=[11, 48, 18, 51],
        help="whole-degree DEM tiles to download: lon0,lat0,lon1,lat1",
    )
    parser.add_argument("--minzoom", type=int, default=6)
    parser.add_argument("--maxzoom", type=int, default=12)
    parser.add_argument("--margin", type=int, default=2, help="extra tiles around area")
    parser.add_argument(
        "--step", type=float, default=0.25, help="height step in metres"
    )
    parser.add_argument("--format", choices=["webp", "png"], default="webp")
    parser.add_argument("--workers", type=int, default=os.cpu_count())
    build(parser.parse_args())


if __name__ == "__main__":
    main()
