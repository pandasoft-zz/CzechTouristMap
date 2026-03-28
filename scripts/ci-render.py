#!/usr/bin/env python3
"""
Render map screenshots for CI preview.

Reads config/locations.yaml, calls the tile server /api/render endpoint
for each location, saves PNGs, and writes a manifest + HTML index.

Environment variables:
  RENDER_URL   Base URL of tile server (default: http://localhost:8080)
  OUTPUT_DIR   Output directory for screenshots (default: screenshots)
  WIDTH        Image width in pixels (default: 900)
  HEIGHT       Image height in pixels (default: 500)
  PR_NUMBER    Pull request number (for page title)
  PR_BRANCH    Branch name (for page title)
  COMMIT_SHA   Commit SHA (for page title)
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

import yaml

RENDER_URL = os.getenv("RENDER_URL", "http://localhost:8080")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "screenshots")
WIDTH = int(os.getenv("WIDTH", "900"))
HEIGHT = int(os.getenv("HEIGHT", "500"))
PR_NUMBER = os.getenv("PR_NUMBER", "")
PR_BRANCH = os.getenv("PR_BRANCH", "")
COMMIT_SHA = os.getenv("COMMIT_SHA", "")[:7]


def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "_", name)
    return name.strip("_")


def render_location(lat: float, lng: float, zoom: int, output_path: str) -> bool:
    url = (
        f"{RENDER_URL}/api/render"
        f"?lat={lat}&lng={lng}&zoom={zoom}&width={WIDTH}&height={HEIGHT}"
    )
    try:
        urllib.request.urlretrieve(url, output_path)
        return True
    except urllib.error.URLError as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return False


def build_index_html(locations: list, pr_number: str, pr_branch: str, commit_sha: str) -> str:
    title = "CzechTouristMap — Map Preview"
    subtitle_parts = []
    if pr_branch:
        subtitle_parts.append(f"Branch: <code>{pr_branch}</code>")
    if commit_sha:
        subtitle_parts.append(f"Commit: <code>{commit_sha}</code>")
    if pr_number:
        subtitle_parts.append(f"PR #{pr_number}")
    subtitle = " · ".join(subtitle_parts)

    items_html = ""
    for loc in locations:
        note = loc.get("note", "")
        items_html += f"""
  <div class="item">
    <h2>{loc['name']} <span class="zoom">z{loc['zoom']}</span></h2>
    {f'<p class="note">{note}</p>' if note else ''}
    <img src="{loc['filename']}.png" alt="{loc['name']} z{loc['zoom']}" loading="lazy">
  </div>"""

    return f"""<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  body {{ background: #111; color: #eee; font-family: sans-serif; margin: 0; padding: 16px; }}
  h1 {{ font-size: 18px; margin: 0 0 4px; }}
  .meta {{ font-size: 12px; color: #888; margin-bottom: 24px; }}
  .meta code {{ background: #222; padding: 1px 5px; border-radius: 3px; }}
  .grid {{ display: flex; flex-direction: column; gap: 32px; }}
  .item h2 {{ font-size: 14px; margin: 0 0 4px; }}
  .zoom {{ font-size: 11px; color: #888; font-weight: normal; }}
  .note {{ font-size: 11px; color: #666; margin: 0 0 6px; }}
  img {{ display: block; border: 1px solid #333; max-width: 100%; height: auto; }}
</style>
</head>
<body>
<h1>{title}</h1>
<div class="meta">{subtitle}</div>
<div class="grid">{items_html}
</div>
</body>
</html>
"""


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open("config/locations.yaml") as f:
        data = yaml.safe_load(f)

    locations = data.get("locations", [])
    manifest = []
    errors = 0

    for loc in locations:
        name = loc["name"]
        lat = loc["lat"]
        lng = loc["lng"]
        zoom = loc["zoom"]
        filename = slugify(name)
        output_path = os.path.join(OUTPUT_DIR, f"{filename}.png")

        print(f"Rendering {name} (z{zoom})...", flush=True)
        ok = render_location(lat, lng, zoom, output_path)
        if ok:
            size = os.path.getsize(output_path)
            print(f"  → {output_path} ({size:,} bytes)")
            manifest.append({
                "name": name,
                "filename": filename,
                "lat": lat,
                "lng": lng,
                "zoom": zoom,
                "note": loc.get("note", ""),
            })
        else:
            errors += 1

    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\nManifest: {manifest_path}")

    index_path = os.path.join(OUTPUT_DIR, "index.html")
    with open(index_path, "w") as f:
        f.write(build_index_html(manifest, PR_NUMBER, PR_BRANCH, COMMIT_SHA))
    print(f"Index:    {index_path}")

    print(f"\nDone — {len(manifest)} screenshots, {errors} errors.")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
