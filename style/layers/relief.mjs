// Hillshading from the elevation model (raster-dem source).
// Several light sources give the map a soft "plastic" look.

import { linear } from '../theme.mjs';

const group = { group: 'relief' };

// Light from north-west is the classic cartographic choice.
// Extra weaker lights from west and north keep slopes readable on all sides.
const LIGHTS = [
  { direction: 315, altitude: 35, shadow: 'rgba(40, 45, 70, 0.55)', highlight: 'rgba(255, 252, 235, 0.45)' },
  { direction: 270, altitude: 40, shadow: 'rgba(40, 45, 70, 0.25)', highlight: 'rgba(255, 252, 235, 0.15)' },
  { direction: 0, altitude: 40, shadow: 'rgba(40, 45, 70, 0.25)', highlight: 'rgba(255, 252, 235, 0.15)' },
  { direction: 350, altitude: 60, shadow: 'rgba(40, 45, 70, 0.15)', highlight: 'rgba(255, 255, 255, 0)' },
];

export function reliefLayers() {
  return [
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'relief',
      paint: {
        'hillshade-method': 'multidirectional',
        'hillshade-illumination-anchor': 'map',
        'hillshade-illumination-direction': LIGHTS.map((l) => l.direction),
        'hillshade-illumination-altitude': LIGHTS.map((l) => l.altitude),
        'hillshade-shadow-color': LIGHTS.map((l) => l.shadow),
        'hillshade-highlight-color': LIGHTS.map((l) => l.highlight),
        'hillshade-exaggeration': linear(6, 0.6, 12, 0.45, 16, 0.3),
      },
      metadata: group,
    },
  ];
}
