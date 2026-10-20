// Generate the style sprite (sprite/sprite.json + .png, and @2x).
//
// All images are SDF images: the style colours them with icon-color and can draw an outline
// with icon-halo-color. Run "node tools/czmap.mjs sprite" after changing this file.
//
//   shield  rounded rectangle for road and route numbers; it stretches to the text (icon-text-fit)

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT } from './paths.mjs';

const SPRITE_DIR = path.join(ROOT, 'sprite');

// SDF encoding as in MapLibre: the edge is at alpha 0.75, one CSS pixel of distance is 1/8.
const EDGE = 0.75;
const SDF_PX = 8;

// Signed distance from (x, y) to a rounded rectangle; negative inside.
function roundedRectDistance(x, y, rect) {
  const cx = (rect.x0 + rect.x1) / 2;
  const cy = (rect.y0 + rect.y1) / 2;
  const hx = (rect.x1 - rect.x0) / 2 - rect.r;
  const hy = (rect.y1 - rect.y0) / 2 - rect.r;
  const qx = Math.abs(x - cx) - hx;
  const qy = Math.abs(y - cy) - hy;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - rect.r;
}

// Image definitions in CSS pixels. "buffer" leaves room for the SDF halo.
const IMAGES = {
  shield: (() => {
    const width = 22;
    const height = 20;
    const buffer = 4;
    const r = 3;
    const rect = { x0: buffer, y0: buffer, x1: width - buffer, y1: height - buffer, r };
    return {
      width,
      height,
      distance: (x, y) => roundedRectDistance(x, y, rect),
      stretchX: [[buffer + r, width - buffer - r]],
      stretchY: [[buffer + r, height - buffer - r]],
      content: [buffer, buffer, width - buffer, height - buffer],
    };
  })(),
};

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Lay out all images in one row and draw them at the given pixel ratio.
function buildSprite(ratio) {
  const entries = Object.entries(IMAGES);
  const width = entries.reduce((sum, [, img]) => sum + img.width * ratio, 0);
  const height = Math.max(...entries.map(([, img]) => img.height * ratio));
  const rgba = Buffer.alloc(width * height * 4);
  const index = {};
  let left = 0;
  for (const [name, img] of entries) {
    const w = img.width * ratio;
    const h = img.height * ratio;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = img.distance((x + 0.5) / ratio, (y + 0.5) / ratio);
        const alpha = Math.min(1, Math.max(0, EDGE - d / SDF_PX));
        const i = (y * width + left + x) * 4;
        rgba[i] = 255;
        rgba[i + 1] = 255;
        rgba[i + 2] = 255;
        rgba[i + 3] = Math.round(alpha * 255);
      }
    }
    const scale = (pairs) => pairs.map((pair) => pair.map((v) => v * ratio));
    index[name] = {
      x: left,
      y: 0,
      width: w,
      height: h,
      pixelRatio: ratio,
      sdf: true,
      stretchX: scale(img.stretchX),
      stretchY: scale(img.stretchY),
      content: img.content.map((v) => v * ratio),
    };
    left += w;
  }
  return { png: encodePng(width, height, rgba), json: index };
}

export function writeSprite() {
  fs.mkdirSync(SPRITE_DIR, { recursive: true });
  for (const [ratio, suffix] of [[1, ''], [2, '@2x']]) {
    const { png, json } = buildSprite(ratio);
    fs.writeFileSync(path.join(SPRITE_DIR, `sprite${suffix}.png`), png);
    fs.writeFileSync(path.join(SPRITE_DIR, `sprite${suffix}.json`), `${JSON.stringify(json, null, 2)}\n`);
    console.log(`Wrote sprite/sprite${suffix}.png, sprite/sprite${suffix}.json`);
  }
}
