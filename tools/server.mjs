// Small HTTP server for local development.
//
//   /                 viewer (viewer/index.html)
//   /style.json       style built fresh from style/*.mjs on every request (?variant=topo)
//   /variants.json    list of style variants
//   /tiles/NAME       PMTiles files from dist/ (with HTTP Range support)
//   /fonts/...        glyph PBF files
//   /sprite/...       style sprite (images for road number shields)
//   /vendor/...       browser libraries from node_modules

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT, DIST } from './paths.mjs';

const execFileAsync = promisify(execFile);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.pbf': 'application/x-protobuf',
  '.pmtiles': 'application/octet-stream',
  '.png': 'image/png',
};

// URL prefix -> directory on disk.
const STATIC = [
  ['/vendor/maplibre-gl/', path.join(ROOT, 'node_modules/maplibre-gl/dist')],
  ['/vendor/pmtiles/', path.join(ROOT, 'node_modules/pmtiles/dist')],
  ['/tiles/', DIST],
  ['/fonts/', path.join(ROOT, 'fonts')],
  ['/sprite/', path.join(ROOT, 'sprite')],
  ['/', path.join(ROOT, 'viewer')],
];

// Build the style in a child process, so changes in style/*.mjs are always picked up.
async function buildStyleJson(origin, variant) {
  const args = [path.join(ROOT, 'tools/czmap.mjs'), 'style', '--stdout', '--tiles', `${origin}/tiles`];
  if (variant) {
    args.push('--variant', variant);
  }
  const { stdout } = await execFileAsync(process.execPath, args, { maxBuffer: 16 * 1024 * 1024 });
  return stdout;
}

async function variantsJson() {
  const { THEMES } = await import('../style/themes/index.mjs');
  return JSON.stringify(Object.values(THEMES).map(({ id, name, description }) => ({ id, name, description })));
}

function resolveStatic(urlPath) {
  for (const [prefix, dir] of STATIC) {
    if (urlPath.startsWith(prefix)) {
      const file = path.normalize(path.join(dir, urlPath.slice(prefix.length)));
      if (file !== dir && !file.startsWith(dir + path.sep)) {
        return null;
      }
      return file;
    }
  }
  return null;
}

function sendFile(req, res, file) {
  let stat;
  try {
    stat = fs.statSync(file);
    if (stat.isDirectory()) {
      file = path.join(file, 'index.html');
      stat = fs.statSync(file);
    }
  } catch {
    // Missing glyph ranges are fine: send an empty PBF, the map shows no glyphs for them.
    if (file.endsWith('.pbf') && file.includes(`${path.sep}fonts${path.sep}`)) {
      res.writeHead(200, { 'Content-Type': MIME['.pbf'], 'Content-Length': 0 });
      res.end();
      return;
    }
    res.writeHead(404).end('Not found');
    return;
  }

  const headers = {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    let start = range[1] === '' ? stat.size - Number(range[2]) : Number(range[1]);
    let end = range[1] === '' || range[2] === '' ? stat.size - 1 : Number(range[2]);
    end = Math.min(end, stat.size - 1);
    if (start > end || start < 0) {
      res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end();
      return;
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Content-Length': end - start + 1 });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  fs.createReadStream(file).pipe(res);
}

/**
 * Start the server.
 * @returns {Promise<{server: http.Server, url: string}>}
 */
export function startServer({ port = 8080, host = '127.0.0.1', quiet = false } = {}) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/style.json') {
        const origin = `http://${req.headers.host}`;
        const variant = url.searchParams.get('variant');
        if (variant && !/^[a-z0-9-]+$/.test(variant)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad variant');
          return;
        }
        const body = await buildStyleJson(origin, variant);
        res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-cache' });
        res.end(body);
        return;
      }
      if (url.pathname === '/variants.json') {
        res.writeHead(200, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-cache' });
        res.end(await variantsJson());
        return;
      }
      const file = resolveStatic(decodeURIComponent(url.pathname));
      if (!file) {
        res.writeHead(404).end('Not found');
        return;
      }
      sendFile(req, res, file);
    } catch (err) {
      if (!quiet) {
        console.error(err.stderr || err.message);
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' }).end(String(err.stderr || err.message));
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      const shownHost = host === '0.0.0.0' ? 'localhost' : host;
      resolve({ server, url: `http://${shownHost}:${address.port}` });
    });
  });
}
