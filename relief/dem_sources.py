"""Find DEM tiles on disk: Sonny's LiDAR DTM (HGT, also in zip files) or Copernicus."""

import re
import zipfile
from pathlib import Path

# Sonny's tiles in the repository (Git LFS). They win over downloads in data/sonny/.
REPO_SONNY = Path(__file__).resolve().parent.parent / "terrain" / "sonny"

NAME = re.compile(r"([NS])(\d{2})_?(?:00_)?([EW])(\d{3})", re.IGNORECASE)


def tile_key(name):
    """(lat, lon) of the south-west corner from a name like N49E016 or N49_00_E016."""
    m = NAME.search(name)
    if not m:
        return None
    lat = int(m.group(2)) * (1 if m.group(1).upper() == "N" else -1)
    lon = int(m.group(4)) * (1 if m.group(3).upper() == "E" else -1)
    return lat, lon


def find_sonny(data_dir):
    """Map (lat, lon) -> GDAL path for every HGT file (also inside zip files).

    Searches terrain/sonny/ (in the repository) first, then <data_dir>/sonny/.
    """
    files = {}
    paths = [
        p
        for root in (REPO_SONNY, Path(data_dir) / "sonny")
        for p in sorted(root.rglob("*"))
    ]
    for path in paths:
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
