// Render the images of the project page (site/img/*.webp) from the local tiles in dist/.
// Run: node tools/site-images.mjs   (needs a full build and the Python venv with Pillow)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './paths.mjs';
import { render } from './render.mjs';

// Places of the comparison slider on the page. Keep in sync with PLACES in site/main.js.
const PLACES = [
  { id: 'snezka', center: [15.7400, 50.7360], zoom: 13 },
  { id: 'moravsky-kras', center: [16.7600, 49.2350], zoom: 14 },
  { id: 'cesky-raj', center: [15.1900, 50.5500], zoom: 14 },
  { id: 'brno', center: [16.6085, 49.1935], zoom: 16 },
  { id: 'praha', center: [14.4205, 50.0875], zoom: 13 },
  { id: 'krkonose', center: [15.6500, 50.7200], zoom: 11 },
];
const MAPS = ['tourist', 'topo'];

const OUT = path.join(ROOT, 'out/site');
const IMG = path.join(ROOT, 'site/img');
const VENV_PYTHON = process.platform === 'win32'
  ? path.join(ROOT, '.venv/Scripts/python.exe')
  : path.join(ROOT, '.venv/bin/python');

const views = PLACES.flatMap((p) => MAPS.map((variant) => ({
  ...p, variant, out: path.join(OUT, `${p.id}-${variant}.png`),
})));
// Wide picture for the top of the page.
views.push({ id: 'hero', center: [15.6900, 50.7250], zoom: 12.4, variant: 'tourist', out: path.join(OUT, 'hero.png') });

fs.mkdirSync(IMG, { recursive: true });
const results = await render(views.filter((v) => v.id !== 'hero'), { width: 1200, height: 800, pixelRatio: 1.5 });
results.push(...await render(views.filter((v) => v.id === 'hero'), { width: 1800, height: 900, pixelRatio: 1.5 }));
for (const r of results) {
  console.log(`${path.relative(ROOT, r.out)} ${r.ms} ms${r.errors.length ? ` errors: ${r.errors.join('; ')}` : ''}`);
}

// PNG -> WebP. Only the map, no browser UI, so lossy compression is fine.
const convert = `
import sys
from pathlib import Path
from PIL import Image
for png in sorted(Path(sys.argv[1]).glob("*.png")):
    out = Path(sys.argv[2]) / (png.stem + ".webp")
    Image.open(png).convert("RGB").save(out, "WEBP", quality=80, method=6)
    print(out.name, out.stat().st_size // 1024, "kB")
`;
const result = spawnSync(VENV_PYTHON, ['-c', convert, OUT, IMG], { stdio: 'inherit' });
process.exit(result.status ?? 1);
