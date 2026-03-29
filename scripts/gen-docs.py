#!/usr/bin/env python3
"""
Generate release documentation page.

Renders map screenshots for all locations and combines them with the
project design manual into a static HTML page for GitHub Pages.

Environment variables:
  OUTPUT_DIR   Output directory (default: site)
  VERSION      Release version string (e.g. 2026.03.29)
  RENDER_URL   Base URL of tile server (default: http://localhost:8080)
  WIDTH        Render width in pixels (default: 900)
  HEIGHT       Render height in pixels (default: 500)
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request

import markdown
import yaml

RENDER_URL = os.getenv("RENDER_URL", "http://localhost:8080")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "site")
VERSION = os.getenv("VERSION", "")
WIDTH = int(os.getenv("WIDTH", "900"))
HEIGHT = int(os.getenv("HEIGHT", "500"))

DESIGN_MANUAL = "docs/design-manual-project.md"


def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "_", name)
    return name.strip("_")


def render_location(lat: float, lng: float, zoom: int, output_path: str) -> bool:
    url = (
        f"{RENDER_URL}/render"
        f"?lat={lat}&lng={lng}&zoom={zoom}&width={WIDTH}&height={HEIGHT}"
    )
    try:
        urllib.request.urlretrieve(url, output_path)
        return True
    except urllib.error.URLError as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return False


def render_all_locations(locations: list) -> list:
    manifest = []
    errors = 0
    for loc in locations:
        name = loc["name"]
        filename = slugify(name)
        output_path = os.path.join(OUTPUT_DIR, f"{filename}.png")

        print(f"Rendering {name} (z{loc['zoom']})...", flush=True)
        ok = render_location(loc["lat"], loc["lng"], loc["zoom"], output_path)
        if ok:
            size = os.path.getsize(output_path)
            print(f"  -> {output_path} ({size:,} bytes)")
            manifest.append(
                {
                    "name": name,
                    "filename": filename,
                    "lat": loc["lat"],
                    "lng": loc["lng"],
                    "zoom": loc["zoom"],
                    "note": loc.get("note", ""),
                }
            )
        else:
            errors += 1

    if errors:
        print(f"\n{errors} render(s) failed.", file=sys.stderr)
        sys.exit(1)

    return manifest


def load_design_manual() -> str:
    if not os.path.exists(DESIGN_MANUAL):
        return ""
    with open(DESIGN_MANUAL, encoding="utf-8") as f:
        md = f.read()
    return markdown.markdown(md, extensions=["tables", "fenced_code"])


def render_map_section(manifest: list) -> str:
    items = ""
    for loc in manifest:
        note = loc.get("note", "")
        items += f"""
    <div class="render-item">
      <h3>{loc['name']} <span class="zoom">z{loc['zoom']}</span></h3>
      {f'<p class="note">{note}</p>' if note else ''}
      <img src="{loc['filename']}.png" alt="{loc['name']} z{loc['zoom']}" loading="lazy">
    </div>"""
    return items


def build_page(manifest: list, design_manual_html: str, version: str) -> str:
    map_section = render_map_section(manifest)
    title = f"CzechTouristMap {version}" if version else "CzechTouristMap"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  :root {{
    --bg: #f8f7f4;
    --surface: #ffffff;
    --text: #1a1a1a;
    --muted: #666;
    --border: #e0ddd8;
    --accent: #2c6e49;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ background: var(--bg); color: var(--text); font-family: system-ui, sans-serif;
          line-height: 1.6; }}
  .header {{ background: var(--accent); color: #fff; padding: 24px 32px; }}
  .header h1 {{ font-size: 22px; font-weight: 600; }}
  .header .version {{ font-size: 13px; opacity: 0.75; margin-top: 2px; }}
  nav {{ background: var(--surface); border-bottom: 1px solid var(--border);
         padding: 0 32px; display: flex; gap: 24px; }}
  nav a {{ display: block; padding: 12px 0; font-size: 14px; color: var(--accent);
           text-decoration: none; border-bottom: 2px solid transparent; }}
  nav a:hover {{ border-bottom-color: var(--accent); }}
  .content {{ max-width: 960px; margin: 0 auto; padding: 32px; }}
  section {{ margin-bottom: 48px; }}
  section h2 {{ font-size: 18px; font-weight: 600; margin-bottom: 20px;
                padding-bottom: 8px; border-bottom: 1px solid var(--border); }}

  /* Design manual */
  .design-manual h2 {{ font-size: 16px; margin: 24px 0 8px; border: none; padding: 0; }}
  .design-manual h3 {{ font-size: 14px; margin: 16px 0 6px; color: var(--muted); }}
  .design-manual p {{ margin-bottom: 10px; font-size: 14px; }}
  .design-manual table {{ border-collapse: collapse; width: 100%; font-size: 13px;
                           margin-bottom: 16px; }}
  .design-manual th {{ background: var(--bg); padding: 6px 10px; text-align: left;
                        border: 1px solid var(--border); font-weight: 600; }}
  .design-manual td {{ padding: 5px 10px; border: 1px solid var(--border); }}
  .design-manual td code, .design-manual th code {{
    background: var(--bg); padding: 1px 5px; border-radius: 3px;
    font-size: 12px; font-family: monospace; }}
  .design-manual hr {{ border: none; border-top: 1px solid var(--border); margin: 20px 0; }}

  /* Map renders */
  .render-grid {{ display: flex; flex-direction: column; gap: 28px; }}
  .render-item h3 {{ font-size: 14px; font-weight: 600; margin-bottom: 4px; }}
  .zoom {{ font-size: 11px; color: var(--muted); font-weight: normal; }}
  .note {{ font-size: 11px; color: var(--muted); margin-bottom: 6px; }}
  .render-item img {{ display: block; border: 1px solid var(--border); max-width: 100%;
                      height: auto; }}
  footer {{ text-align: center; font-size: 12px; color: var(--muted);
            padding: 24px; border-top: 1px solid var(--border); }}
</style>
</head>
<body>

<div class="header">
  <h1>CzechTouristMap</h1>
  {f'<div class="version">Release {version}</div>' if version else ''}
</div>

<nav>
  <a href="#renders">Map renders</a>
  <a href="#design">Design manual</a>
</nav>

<div class="content">

  <section id="renders">
    <h2>Map renders</h2>
    <div class="render-grid">{map_section}
    </div>
  </section>

  <section id="design">
    <h2>Design manual</h2>
    <div class="design-manual">
      {design_manual_html}
    </div>
  </section>

</div>

<footer>CzechTouristMap {version} &mdash; GPL-3.0</footer>

</body>
</html>
"""


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open("config/locations.yaml", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    locations = data.get("locations", [])

    manifest = render_all_locations(locations)

    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"Manifest: {manifest_path}")

    design_manual_html = load_design_manual()
    page = build_page(manifest, design_manual_html, VERSION)

    index_path = os.path.join(OUTPUT_DIR, "index.html")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"Index:    {index_path}")

    print(f"\nDone — {len(manifest)} screenshots.")


if __name__ == "__main__":
    main()
