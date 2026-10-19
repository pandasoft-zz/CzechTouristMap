// Contour lines (contours.pmtiles) and their height labels.
// Index contours (every 50 m) are thicker and carry the labels.

import { fonts, linear } from '../theme.mjs';

const SOURCE = 'contours';
const group = { group: 'contours' };

const isIndex = ['==', ['%', ['get', 'ele'], 50], 0];

export function contourLayers(t) {
  const c = t.contours;
  return [
    {
      id: 'contours',
      type: 'line',
      source: SOURCE,
      'source-layer': 'contours',
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ['case', isIndex, c.indexColor, c.color],
        'line-width': linear(
          11, ['case', isIndex, c.indexWidth * 0.6, c.width * 0.6],
          16, ['case', isIndex, c.indexWidth * 1.6, c.width * 1.6],
        ),
        'line-opacity': c.opacity,
      },
      metadata: group,
    },
  ];
}

// Height labels, drawn with the other labels.
export function contourLabelLayers(t) {
  const l = t.contours.label;
  return [
    {
      id: 'contour-label',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'contours',
      minzoom: 13,
      filter: isIndex,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 350,
        'text-field': ['to-string', ['get', 'ele']],
        'text-font': fonts[l.font],
        'text-size': linear(13, 9, 16, 11),
        'text-max-angle': 25,
        'text-padding': 10,
      },
      paint: {
        'text-color': l.color,
        'text-halo-color': l.halo,
        'text-halo-width': l.haloWidth,
      },
      metadata: group,
    },
  ];
}
