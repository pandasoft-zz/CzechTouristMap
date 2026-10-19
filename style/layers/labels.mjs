// Text labels of the base map: places, peaks, water and road names.

import { fonts, linear, matchKind, shieldLayout, shieldPaint } from '../theme.mjs';

const SOURCE = 'base';
const group = { group: 'base' };

const city = (big, small) => ['match', ['get', 'kind'], 'city', big, small];

// The data has no capital flag; Praha is the only capital in the extract.
const isCapital = ['==', ['get', 'name'], 'Praha'];

const upper = (on) => (on ? 'uppercase' : 'none');

export function labelLayers(t) {
  const l = t.labels;
  const halo = {
    'text-color': l.color,
    'text-halo-color': l.halo,
    'text-halo-width': l.haloWidth,
  };
  const minor = { suburb: l.suburb, hamlet: l.hamlet, isolated_dwelling: l.isolated ?? l.hamlet, locality: l.locality };
  const refFont = fonts[l.refFont ?? 'bold'];
  const minorValue = (key, wrap = (v) => v) => matchKind(
    Object.fromEntries(Object.entries(minor).map(([kind, s]) => [kind, wrap(s[key])])),
    wrap(l.hamlet[key]),
  );
  const ref = l.roadRef;
  const refValue = (key) => matchKind(
    Object.fromEntries(Object.entries(ref.kinds).map(([kind, s]) => [kind, s[key]])),
    ref.default[key],
  );
  // Road numbers. ref.shields: true = all numbers in shields, a list = only these road kinds,
  // false = no shields. Numbers without a shield get a halo in the shield colour.
  const roadRefLayers = () => {
    const shieldKinds = Array.isArray(ref.shields) ? ['in', ['get', 'kind'], ['literal', ref.shields]] : ref.shields;
    const layer = (id, filter, withShield) => ({
      id,
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'roads',
      minzoom: 10,
      filter: ['all', ['has', 'ref'], filter],
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 500,
        'text-field': ['get', 'ref'],
        'text-font': refFont,
        'text-size': 10,
        'text-rotation-alignment': 'viewport',
        ...(withShield ? shieldLayout() : {}),
      },
      paint: withShield
        ? { 'text-color': refValue('text'), ...shieldPaint(refValue('shield')) }
        : { 'text-color': refValue('text'), 'text-halo-color': refValue('shield'), 'text-halo-width': ref.haloWidth },
      metadata: group,
    });
    if (shieldKinds === true) {
      return [layer('road-ref', true, true)];
    }
    if (shieldKinds === false) {
      return [layer('road-ref', true, false)];
    }
    return [layer('road-ref', ['!', shieldKinds], false), layer('road-ref-shield', shieldKinds, true)];
  };
  const cityUpper = { all: 'uppercase', capital: ['case', isCapital, 'uppercase', 'none'], none: 'none' };

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
        'text-font': fonts[l.water.font],
        'text-size': linear(12, 10, 16, 13),
        'text-max-angle': 30,
      },
      paint: { ...halo, 'text-color': t.water.label },
      metadata: group,
    },
    {
      id: 'water-label',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'water_labels',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': fonts[l.water.font],
        'text-size': linear(12, 10, 16, 13),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': t.water.areaLabel ?? t.water.label },
      metadata: group,
    },
    ...roadRefLayers(),
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
        'text-font': fonts[l.roadName.font],
        'text-size': linear(13, 9, 17, 12),
      },
      paint: { ...halo, 'text-color': l.roadName.color },
      metadata: group,
    },
    {
      id: 'peak',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'peaks',
      layout: {
        'text-field': ['case',
          ['has', 'ele'], ['format',
            ['get', 'name'], {},
            '\n', {},
            ['to-string', ['get', 'ele']], {
              'font-scale': 0.85,
              'text-color': l.peak.eleColor,
              ...(l.peak.eleFont ? { 'text-font': ['literal', fonts[l.peak.eleFont]] } : {}),
            }],
          ['get', 'name']],
        'text-font': fonts[l.peak.font],
        'text-size': linear(10, 10, 15, 12),
        'text-transform': upper(l.peak.uppercase),
        'text-anchor': 'top',
        'text-offset': [0, 0.3],
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': l.peak.color },
      metadata: group,
    },
    {
      id: 'peak-dot',
      type: 'circle',
      source: SOURCE,
      'source-layer': 'peaks',
      paint: {
        'circle-radius': linear(10, 1.5, 15, 2.5),
        'circle-color': l.peak.eleColor,
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
        'text-font': minorValue('font', (f) => ['literal', fonts[f]]),
        'text-size': minorValue('size'),
        'text-transform': minorValue('uppercase', (u) => upper(u)),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': minorValue('color') },
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
        'text-font': fonts[l.village.font],
        'text-size': linear(11, l.village.size[0], 15, l.village.size[1]),
        'text-max-width': 8,
      },
      paint: { ...halo, 'text-color': l.village.color, 'text-halo-width': l.haloWidth + 0.5 },
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
        'text-font': city(['literal', fonts[l.city.font]], ['literal', fonts[l.town.font]]),
        'text-size': linear(
          6, city(l.city.size[0], l.town.size[0]),
          9, city(l.city.size[1], l.town.size[1]),
          13, city(l.city.size[2], l.town.size[2]),
        ),
        'text-transform': city(cityUpper[l.city.uppercase], upper(l.town.uppercase)),
        'text-max-width': 8,
      },
      paint: {
        ...halo,
        'text-color': city(l.city.color, l.town.color),
        'text-halo-width': l.haloWidth + 0.5,
      },
      metadata: group,
    },
  ];
}
