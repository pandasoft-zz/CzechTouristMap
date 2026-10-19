// Entry point of the map style. It returns a MapLibre style object.
//
// Layer groups (used by the viewer to switch layers on and off):
//   base    - own base map (land cover, water, roads, labels)
//   relief  - hillshading from the elevation model
//   contours - contour lines
//   hiking  - KČT hiking routes
//   cycling - cycling routes
//
// Style variants (colours, widths, labels) are in style/themes/.

import { baseLayers, baseOverlayLayers } from './layers/base.mjs';
import { reliefLayers } from './layers/relief.mjs';
import { hikingLayers, cyclingLayers, cyclingLabelLayers } from './layers/routes.mjs';
import { labelLayers } from './layers/labels.mjs';
import { contourLayers, contourLabelLayers } from './layers/contours.mjs';
import { getTheme, THEMES, DEFAULT_THEME } from './themes/index.mjs';

export const GROUPS = ['base', 'relief', 'contours', 'hiking', 'cycling'];

export { THEMES, DEFAULT_THEME };

const ATTRIBUTION = [
  '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
  '<a href="https://spacedata.copernicus.eu/">© Copernicus DEM</a>',
].join(' ');

const CONTOUR_ATTRIBUTION = [
  '<a href="https://sonny.4lima.de/">© Sonny’s LiDAR DTM</a>',
  '<a href="https://geoportal.cuzk.gov.cz/">© ČÚZK</a>',
].join(' ');

/**
 * Build the style.
 * @param {object} options
 * @param {string} options.tiles  Base URL of the PMTiles files, e.g. "https://example.com/tiles".
 * @param {string} options.glyphs Glyph URL template with {fontstack} and {range}.
 * @param {string} options.sprite Sprite base URL (without .json / .png), see tools/sprite.mjs.
 * @param {string} [options.variant] Style variant id from style/themes/ (default: "tourist").
 */
export function buildStyle({ tiles, glyphs, sprite, variant = DEFAULT_THEME }) {
  const t = getTheme(variant);
  return {
    version: 8,
    name: `Czech Tourist Map – ${t.name}`,
    metadata: { variant: t.id },
    glyphs,
    sprite,
    sources: {
      base: {
        type: 'vector',
        url: `pmtiles://${tiles}/base.pmtiles`,
        attribution: ATTRIBUTION,
      },
      routes: {
        type: 'vector',
        url: `pmtiles://${tiles}/routes.pmtiles`,
      },
      contours: {
        type: 'vector',
        url: `pmtiles://${tiles}/contours.pmtiles`,
        attribution: CONTOUR_ATTRIBUTION,
      },
      relief: {
        type: 'raster-dem',
        url: `pmtiles://${tiles}/relief.pmtiles`,
        encoding: 'terrarium',
        tileSize: 256,
      },
    },
    layers: [
      ...baseLayers(t),
      ...reliefLayers(t),
      ...contourLayers(t),
      ...baseOverlayLayers(t),
      ...cyclingLayers(t),
      ...hikingLayers(t),
      ...contourLabelLayers(t),
      ...labelLayers(t),
      ...cyclingLabelLayers(t),
    ],
  };
}
