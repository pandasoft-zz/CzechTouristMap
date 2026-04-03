"""
Post-process replaced OSM Carto SVG icons:
  - Add white outline (stroke) to all shape elements
  - Scale down icon size by SCALE_FACTOR

Usage:
    python scripts/process-icons.py [--scale 0.75] [--stroke-width 1.5] [--dry-run]

The script processes all SVG files listed in the MAPPING in replace-icons.py.
"""

import argparse
import importlib.util
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SHAPE_TAGS = {
    "path", "circle", "rect", "polygon", "polyline", "ellipse", "line",
}

SVG_NS = "http://www.w3.org/2000/svg"

ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")


def add_outline(root: ET.Element, stroke_width: float) -> None:
    """Add white stroke with paint-order so outline renders behind the fill."""
    for elem in root.iter():
        tag = elem.tag.removeprefix(f"{{{SVG_NS}}}")
        if tag not in SHAPE_TAGS:
            continue
        # Only set stroke if element has fill (or no fill attr = default black)
        existing_stroke = elem.get("stroke", "").strip()
        if existing_stroke and existing_stroke != "none":
            continue  # already has a coloured stroke, leave it
        elem.set("stroke", "white")
        elem.set("stroke-width", str(stroke_width))
        elem.set("stroke-linejoin", "round")
        elem.set("stroke-linecap", "round")
        elem.set("paint-order", "stroke fill")


def scale_svg(root: ET.Element, factor: float) -> None:
    """Scale width/height attributes; keep viewBox unchanged."""
    for attr in ("width", "height"):
        val = root.get(attr)
        if val is None:
            continue
        try:
            root.set(attr, str(round(float(val) * factor, 4)))
        except ValueError:
            pass  # percentage or other unit — skip


def process_file(path: Path, scale: float, stroke_width: float, dry_run: bool) -> bool:
    try:
        tree = ET.parse(path)
    except ET.ParseError as e:
        print(f"  WARN: parse error in {path}: {e}", file=sys.stderr)
        return False

    root = tree.getroot()
    add_outline(root, stroke_width)
    scale_svg(root, scale)

    if not dry_run:
        tree.write(path, encoding="unicode", xml_declaration=False)
    return True


def load_mapping() -> dict[str, str]:
    spec = importlib.util.spec_from_file_location(
        "replace_icons",
        Path(__file__).parent / "replace-icons.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.MAPPING


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scale", type=float, default=0.75,
                        help="Scale factor for icon size (default: 0.75)")
    parser.add_argument("--stroke-width", type=float, default=1.5,
                        help="White stroke width in SVG units (default: 1.5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Parse and validate but do not write files")
    args = parser.parse_args()

    themes_dir = Path(__file__).parent.parent / "themes"
    mapping = load_mapping()

    ok = 0
    fail = 0
    seen = set()

    for local_rel in sorted(mapping):
        if local_rel in seen:
            continue
        seen.add(local_rel)
        path = themes_dir / local_rel
        if not path.exists():
            continue
        label = "DRY " if args.dry_run else ""
        print(f"  {label}{local_rel}")
        if process_file(path, args.scale, args.stroke_width, args.dry_run):
            ok += 1
        else:
            fail += 1

    print(f"\nProcessed: {ok}" + (f"  Failed: {fail}" if fail else ""))


if __name__ == "__main__":
    main()
