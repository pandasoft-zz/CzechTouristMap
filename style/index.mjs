// Entry point of the map style. It returns a MapLibre style object.
//
// Layer groups (used by the viewer to switch layers on and off):
//   base    - own base map (land cover, water, roads, labels)
//   relief  - hillshading from the elevation model
//   hiking  - KČT hiking routes
//   cycling - cycling routes

import { baseLayers, baseOverlayLayers } from './layers/base.mjs';
import { reliefLayers } from './layers/relief.mjs';
import { hikingLayers, cyclingLayers, cyclingLabelLayers } from './layers/routes.mjs';
import { labelLayers } from './layers/labels.mjs';

export const GROUPS = ['base', 'relief', 'hiking', 'cycling'];

const ATTRIBUTION = [
  '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
  '<a href="https://spacedata.copernicus.eu/">© Copernicus DEM</a>',
].join(' ');

/**
 * Build the style.
 * @param {object} options
 * @param {string} options.tiles  Base URL of the PMTiles files, e.g. "https://example.com/tiles".
 * @param {string} options.glyphs Glyph URL template with {fontstack} and {range}.
 */
export function buildStyle({ tiles, glyphs }) {
  return {
    version: 8,
    name: 'Czech Tourist Map',
    glyphs,
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
      relief: {
        type: 'raster-dem',
        url: `pmtiles://${tiles}/relief.pmtiles`,
        encoding: 'terrarium',
        tileSize: 256,
      },
    },
    layers: [
      ...baseLayers(),
      ...reliefLayers(),
      ...baseOverlayLayers(),
      ...cyclingLayers(),
      ...hikingLayers(),
      ...labelLayers(),
      ...cyclingLabelLayers(),
    ],
  };
}
