// Hypsometric tint and hillshading from the elevation model (raster-dem source).
// The colours and light sources come from the style variant (theme.relief).

import { linear } from '../theme.mjs';

const group = { group: 'relief' };

export function reliefLayers(t) {
  const { lights, exaggeration, tint } = t.relief;
  return [
    // Elevation colours at small zoom, so the overview shows lowlands and mountains.
    // They fade out at large zoom, where land cover gives the colour.
    {
      id: 'hypsometric-tint',
      type: 'color-relief',
      source: 'relief',
      maxzoom: tint.maxzoom,
      paint: {
        'color-relief-color': ['interpolate', ['linear'], ['elevation'], ...tint.colors],
        'color-relief-opacity': linear(...tint.opacity),
      },
      metadata: group,
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'relief',
      paint: {
        'hillshade-method': 'multidirectional',
        'hillshade-illumination-anchor': 'map',
        'hillshade-illumination-direction': lights.map((l) => l.direction),
        'hillshade-illumination-altitude': lights.map((l) => l.altitude),
        'hillshade-shadow-color': lights.map((l) => l.shadow),
        'hillshade-highlight-color': lights.map((l) => l.highlight),
        'hillshade-exaggeration': linear(...exaggeration),
      },
      metadata: group,
    },
  ];
}
