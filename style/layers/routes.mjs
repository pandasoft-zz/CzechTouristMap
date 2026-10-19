// Hiking (KČT colours) and cycling route overlays.

import { colors, fonts, width, linear } from '../theme.mjs';

const SOURCE = 'routes';

// Width of one hiking colour stripe.
const STRIPE = { 9: 1.2, 12: 2.2, 14: 3, 17: 5 };

function stripeWidth(factor = 1, extra = 0) {
  const stops = Object.entries(STRIPE).flatMap(([z, w]) => [Number(z), w * factor + extra]);
  return ['interpolate', ['exponential', 1.4], ['zoom'], ...stops];
}

// Shift stripes so the group is centred on the way: (slot - (count - 1) / 2) * stripe.
function stripeOffset() {
  const centre = ['-', ['get', 'slot'], ['/', ['-', ['get', 'count'], 1], 2]];
  const stops = Object.entries(STRIPE).flatMap(([z, w]) => [Number(z), ['*', centre, w]]);
  return ['interpolate', ['exponential', 1.4], ['zoom'], ...stops];
}

// Casing width depends on the number of stripes, so it uses a data expression per stop.
function casingWidth() {
  const stops = Object.entries(STRIPE).flatMap(([z, w]) => [Number(z), ['+', ['*', ['get', 'count'], w], 2]]);
  return ['interpolate', ['exponential', 1.4], ['zoom'], ...stops];
}

export function hikingLayers() {
  const group = { group: 'hiking' };
  return [
    {
      id: 'hiking-casing',
      type: 'line',
      source: SOURCE,
      'source-layer': 'hiking',
      filter: ['==', ['get', 'slot'], 0],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': casingWidth(),
        'line-opacity': linear(9, 0.5, 12, 0.9),
      },
      metadata: group,
    },
    {
      id: 'hiking',
      type: 'line',
      source: SOURCE,
      'source-layer': 'hiking',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': ['match', ['get', 'color'],
          'red', colors.hiking.red,
          'blue', colors.hiking.blue,
          'green', colors.hiking.green,
          'yellow', colors.hiking.yellow,
          '#808080'],
        'line-width': stripeWidth(),
        'line-offset': stripeOffset(),
        'line-dasharray': ['match', ['get', 'kind'], 'learning', ['literal', [2, 1]], ['literal', [1, 0]]],
      },
      metadata: group,
    },
  ];
}

// Wider line for national and international cycle routes.
const national = (big, small) => ['match', ['get', 'network'], [0, 1], big, small];

export function cyclingLayers() {
  const group = { group: 'cycling' };
  return [
    {
      id: 'cycling',
      type: 'line',
      source: SOURCE,
      'source-layer': 'cycling',
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.cycling,
        'line-width': width(8, national(1.5, 0.8), 12, national(2.5, 2), 16, national(4, 3.5)),
        // Local routes (network 3) are dense in cities, so they are lighter.
        'line-opacity': ['match', ['get', 'network'], 3, 0.45, 0.8],
        'line-dasharray': ['case', ['has', 'mtb'], ['literal', [1, 1.5]], ['literal', [3, 1.5]]],
      },
      metadata: group,
    },
  ];
}

// Route numbers, drawn with the label layers.
export function cyclingLabelLayers() {
  const group = { group: 'cycling' };
  return [
    {
      id: 'cycling-refs',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'cycling',
      minzoom: 12,
      filter: ['all', ['has', 'refs'], ['any', ['<', ['get', 'network'], 3], ['>=', ['zoom'], 14]]],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 350,
        'text-field': ['get', 'refs'],
        'text-font': fonts.bold,
        'text-size': linear(12, 10, 16, 12),
        'text-rotation-alignment': 'viewport',
        'text-padding': 4,
      },
      paint: {
        'text-color': '#1A1A1A',
        'text-halo-color': colors.cyclingSign,
        'text-halo-width': 3,
      },
      metadata: group,
    },
  ];
}
