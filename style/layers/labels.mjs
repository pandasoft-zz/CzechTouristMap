// Text labels of the base map: places, peaks, water and road names.

import { colors, fonts, linear } from '../theme.mjs';

const SOURCE = 'base';
const group = { group: 'base' };

const halo = {
  'text-color': colors.label,
  'text-halo-color': colors.labelHalo,
  'text-halo-width': 1.5,
};

const city = (big, small) => ['match', ['get', 'kind'], 'city', big, small];

export function labelLayers() {
  return [
    {
      id: 'waterway-label',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'waterway',
      filter: ['has', 'name'],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 400,
        'text-field': ['get', 'name'],
        'text-font': fonts.italic,
        'text-size': linear(12, 10, 16, 13),
        'text-max-angle': 30,
      },
      paint: { ...halo, 'text-color': colors.waterLabel },
      metadata: group,
    },
    {
      id: 'water-label',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'water_labels',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': fonts.italic,
        'text-size': linear(12, 10, 16, 13),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': colors.waterLabel },
      metadata: group,
    },
    {
      id: 'road-ref',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'roads',
      minzoom: 10,
      filter: ['has', 'ref'],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 500,
        'text-field': ['get', 'ref'],
        'text-font': fonts.bold,
        'text-size': 10,
        'text-rotation-alignment': 'viewport',
      },
      paint: { 'text-color': '#5A2A10', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 },
      metadata: group,
    },
    {
      id: 'road-name',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'roads',
      minzoom: 13,
      filter: ['has', 'name'],
      layout: {
        'symbol-placement': 'line',
        'text-field': ['get', 'name'],
        'text-font': fonts.regular,
        'text-size': linear(13, 9, 17, 12),
      },
      paint: halo,
      metadata: group,
    },
    {
      id: 'peak',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'peaks',
      layout: {
        'text-field': ['case',
          ['has', 'ele'], ['format', ['get', 'name'], {}, '\n', {}, ['to-string', ['get', 'ele']], { 'font-scale': 0.85 }],
          ['get', 'name']],
        'text-font': fonts.italic,
        'text-size': linear(10, 10, 15, 12),
        'text-anchor': 'top',
        'text-offset': [0, 0.3],
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': colors.peak },
      metadata: group,
    },
    {
      id: 'peak-dot',
      type: 'circle',
      source: SOURCE,
      'source-layer': 'peaks',
      paint: {
        'circle-radius': linear(10, 1.5, 15, 2.5),
        'circle-color': colors.peak,
      },
      metadata: group,
    },
    {
      id: 'place-minor',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'places',
      filter: ['in', ['get', 'kind'], ['literal', ['hamlet', 'isolated_dwelling', 'locality', 'suburb']]],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['match', ['get', 'kind'], 'locality', ['literal', fonts.italic], ['literal', fonts.regular]],
        'text-size': ['match', ['get', 'kind'], 'suburb', 12, 11],
        'text-max-width': 8,
      },
      paint: {
        ...halo,
        'text-color': ['match', ['get', 'kind'], 'locality', '#555555', colors.label],
      },
      metadata: group,
    },
    {
      id: 'place-village',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'places',
      filter: ['==', ['get', 'kind'], 'village'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': fonts.regular,
        'text-size': linear(11, 11, 15, 14),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-halo-width': 2 },
      metadata: group,
    },
    {
      id: 'place-town',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'places',
      filter: ['in', ['get', 'kind'], ['literal', ['town', 'city']]],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': fonts.bold,
        'text-size': linear(6, city(12, 9), 9, city(15, 11), 13, city(20, 16)),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-halo-width': 2 },
      metadata: group,
    },
  ];
}
