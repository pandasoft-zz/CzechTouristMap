// Load both styles in MapLibre Native and report every warning and error (docs/native.md).
// Runs in the Docker image from tools/native/Dockerfile; start it with "node tools/czmap.mjs check-native".
//
// Native drops a layer it cannot read and only writes a log line, for example
// "layer doesn't support this property". This script turns such lines into a failed check.
// Tiles are empty: the check is about the style, not the data. Glyphs and sprite come from the repository.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { buildStyle, THEMES } from '../../style/index.mjs';

const require = createRequire(import.meta.url);
const mbgl = require('@maplibre/maplibre-gl-native');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Views to render: the overview and a large zoom, so layers of all zoom ranges are evaluated.
const VIEWS = [
  { center: [15.5, 49.8], zoom: 7 },
  { center: [16.68, 49.19], zoom: 15 },
];

// Glyph and sprite URLs point to files in the repository; everything else (tiles) is empty.
function request(req, callback) {
  const url = new URL(req.url);
  if (url.protocol !== 'local:') {
    callback();
    return;
  }
  const file = path.join(ROOT, decodeURIComponent(url.hostname + url.pathname));
  fs.readFile(file, (err, data) => (err ? callback() : callback(null, { data })));
}

const messages = [];
mbgl.on('message', (msg) => {
  if (msg.severity === 'WARNING' || msg.severity === 'ERROR') {
    messages.push(msg);
  }
});

function render(map, view) {
  return new Promise((resolve, reject) => {
    map.render({ ...view, width: 256, height: 256 }, (err) => (err ? reject(err) : resolve()));
  });
}

let failed = false;
for (const id of Object.keys(THEMES)) {
  messages.length = 0;
  const style = buildStyle({
    tiles: 'local://dist',
    glyphs: 'local://fonts/{fontstack}/{range}.pbf',
    sprite: 'local://sprite/sprite',
    variant: id,
  });
  const map = new mbgl.Map({ request, ratio: 1 });
  try {
    map.load(style);
    for (const view of VIEWS) {
      await render(map, view);
    }
  } catch (err) {
    messages.push({ severity: 'ERROR', class: 'Render', text: err.message });
  } finally {
    map.release();
  }
  console.log(`style ${id} (MapLibre Native): ${messages.length === 0 ? 'ok' : `${messages.length} problems`}`);
  for (const m of messages) {
    console.log(`  ${m.severity} [${m.class}] ${m.text}`);
  }
  failed ||= messages.length > 0;
}
// The Native binding keeps the event loop alive, so exit explicitly.
process.exit(failed ? 1 : 0);
