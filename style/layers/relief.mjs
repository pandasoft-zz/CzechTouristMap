// Hillshading from the elevation model (raster-dem source).
// The light sources come from the style variant (theme.relief).

import { linear } from '../theme.mjs';

const group = { group: 'relief' };

export function reliefLayers(t) {
  const { lights, exaggeration } = t.relief;
  return [
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
