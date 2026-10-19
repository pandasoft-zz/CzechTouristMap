"""Find DEM tiles on disk: Sonny's LiDAR DTM (HGT, also inside zip files) or Copernicus DSM."""

import re
import zipfile
from pathlib import Path

NAME = re.compile(r"([NS])(\d{2})_?(?:00_)?([EW])(\d{3})", re.IGNORECASE)


def tile_key(name):
    """(lat, lon) of the south-west corner from a file name like N49E016 or N49_00_E016."""
    m = NAME.search(name)
    if not m:
        return None
    lat = int(m.group(2)) * (1 if m.group(1).upper() == "N" else -1)
    lon = int(m.group(4)) * (1 if m.group(3).upper() == "E" else -1)
    return lat, lon


def find_sonny(root):
    """Map (lat, lon) -> GDAL path for every HGT file in data/sonny (also inside zip files)."""
    files = {}
    for path in sorted(root.rglob("*")):
        if path.suffix.lower() == ".hgt":
            names = [(path.name, str(path))]
        elif path.suffix.lower() == ".zip":
            with zipfile.ZipFile(path) as z:
                names = [
                    (Path(n).name, f"/vsizip/{path.resolve().as_posix()}/{n}")
                    for n in z.namelist()
                    if n.lower().endswith(".hgt")
                ]
        else:
            continue
        for name, gdal_path in names:
            key = tile_key(name)
            if key and key not in files:
                files[key] = gdal_path
    return files


def find_copernicus(root):
    files = {}
    for path in sorted(root.glob("*.tif")):
        key = tile_key(path.name)
        if key:
            files[key] = str(path)
    return files
