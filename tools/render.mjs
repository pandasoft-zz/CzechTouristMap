// Render a map view to PNG with headless Chromium.
// It uses the same viewer and style as the browser, so the image matches what a user sees.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';

// Pre-installed Chromium in some environments (for example cloud sessions).
const KNOWN_CHROMIUM = ['/opt/pw-browsers/chromium'];

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) {
    return process.env.CHROMIUM_PATH;
  }
  return KNOWN_CHROMIUM.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
}

/**
 * Render one or more views.
 * @param {Array<{center: number[], zoom: number, out: string, variant?: string, compare?: boolean}>} views
 *   variant: style variant of the view; compare: render the side-by-side page (compare.html)
 * @param {object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.pixelRatio
 * @param {string[]} [options.layers]  visible layer groups
 * @param {number} [options.timeout]   ms to wait for one view
 */
export async function render(views, { width, height, pixelRatio, layers, timeout = 120000 }) {
  const { server, url } = await startServer({ port: 0, quiet: true });
  const browser = await chromium.launch({
    executablePath: chromiumPath(),
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: pixelRatio });
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    for (const view of views) {
      consoleErrors.length = 0;
      const query = new URLSearchParams({ render: '1' });
      if (layers) {
        query.set('layers', layers.join(','));
      }
      if (view.variant) {
        query.set(view.compare ? 'variants' : 'variant', view.variant);
      }
      const [lon, lat] = view.center;
      const file = view.compare ? 'compare.html' : '';
      const target = `${url}/${file}?${query}#${view.zoom}/${lat}/${lon}`;
      const started = Date.now();
      // A new document per view, so "idle" means this view is complete.
      await page.goto('about:blank');
      await page.goto(target);
      await page.waitForFunction(() => window.__mapIdle === true, null, { timeout });
      fs.mkdirSync(path.dirname(path.resolve(view.out)), { recursive: true });
      await page.locator(view.compare ? '#grid' : '#map').screenshot({ path: view.out });
      const mapErrors = await page.evaluate(() => window.__mapErrors);
      results.push({ ...view, ms: Date.now() - started, errors: [...new Set([...mapErrors, ...consoleErrors])] });
    }
  } finally {
    await browser.close();
    server.close();
  }
  return results;
}
