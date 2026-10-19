// Base map layers: land cover, water, boundaries, buildings, roads and railways.
// Labels are in labels.mjs, so they stay on top of the route overlays.

import { colors, width, linear } from '../theme.mjs';

const SOURCE = 'base';
const group = { group: 'base' };

// Build a ["match", ["get", key], ...] expression from an object.
function matchKind(values, fallback, key = 'kind') {
  const pairs = Object.entries(values).flat();
  return ['match', ['get', key], ...pairs, fallback];
}

// Width per road kind at a few zoom stops.
// Each row: zoom -> { kind: width in px }.
const ROAD_WIDTH = {
  6: { motorway: 1.2, trunk: 1, primary: 0.8 },
  9: { motorway: 2, trunk: 1.8, primary: 1.5, secondary: 1.1, tertiary: 0.8 },
  12: { motorway: 3.5, trunk: 3.2, primary: 3, secondary: 2.6, tertiary: 2.2, minor: 1.4, pedestrian: 1, service: 0.8 },
  14: { motorway: 6, trunk: 5.5, primary: 5, secondary: 4.5, tertiary: 4, minor: 3, pedestrian: 2.5, service: 1.8 },
  17: { motorway: 18, trunk: 16, primary: 15, secondary: 13, tertiary: 12, minor: 10, pedestrian: 8, service: 6 },
};

function roadWidth(extra = 0) {
  const stops = [];
  for (const [zoom, widths] of Object.entries(ROAD_WIDTH)) {
    const withExtra = Object.fromEntries(Object.entries(widths).map(([k, w]) => [k, w + extra]));
    stops.push(Number(zoom), matchKind(withExtra, 0));
  }
  return ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];
}

// Small helpers for "value by kind" inside zoom interpolations.
const river = (big, small) => ['match', ['get', 'kind'], 'river', big, small];
const steps = (value, other) => ['match', ['get', 'kind'], 'steps', value, other];
const rail = (main, other) => ['match', ['get', 'kind'], 'rail', main, other];

const PAVED = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'pedestrian', 'service'];
const MAJOR = ['motorway', 'trunk', 'primary', 'secondary'];

function roadLayers(structure) {
  const filterStructure = structure === 'surface'
    ? ['all', ['!', ['has', 'tunnel']], ['!', ['has', 'bridge']]]
    : ['has', structure];
  const id = (name) => `${structure}-${name}`;
  const isTunnel = structure === 'tunnel';
  const paved = ['all', filterStructure, ['in', ['get', 'kind'], ['literal', PAVED]]];
  const casingExtra = structure === 'bridge' ? 2.5 : 1.2;

  return [
    {
      id: id('road-casing'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: paved,
      layout: { 'line-cap': isTunnel ? 'butt' : 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['case', ['in', ['get', 'kind'], ['literal', MAJOR]], colors.road.casingMajor, colors.road.casing],
        'line-width': roadWidth(casingExtra),
        'line-opacity': ['step', ['zoom'], 0, 9, isTunnel ? 0.4 : 1],
        ...(isTunnel ? { 'line-dasharray': [1, 0.6] } : {}),
      },
      metadata: group,
    },
    {
      id: id('track'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: ['all', filterStructure, ['==', ['get', 'kind'], 'track']],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.road.track,
        'line-width': width(12, 0.7, 14, 1.3, 17, 2.5),
        'line-dasharray': ['match', ['get', 'grade'], [1, 2], ['literal', [1, 0]], ['literal', [5, 2]]],
        'line-opacity': isTunnel ? 0.5 : 1,
      },
      metadata: group,
    },
    {
      id: id('path'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: ['all', filterStructure, ['in', ['get', 'kind'], ['literal', ['path', 'cycleway', 'steps']]]],
      paint: {
        'line-color': matchKind({ steps: colors.road.steps }, colors.road.path),
        'line-width': width(13, 0.6, 15, steps(3, 1), 17, steps(5, 1.6)),
        'line-dasharray': ['match', ['get', 'kind'], 'steps', ['literal', [0.4, 0.4]], ['literal', [3, 2]]],
        'line-opacity': isTunnel ? 0.5 : 1,
      },
      metadata: group,
    },
    {
      id: id('road'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: paved,
      layout: { 'line-cap': isTunnel ? 'butt' : 'round', 'line-join': 'round' },
      paint: {
        'line-color': matchKind(colors.road, '#FFFFFF'),
        'line-width': roadWidth(),
        'line-opacity': isTunnel ? 0.6 : 1,
      },
      metadata: group,
    },
    {
      id: id('rail'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: filterStructure,
      paint: {
        'line-color': colors.rail,
        'line-width': width(8, 0.8, 12, rail(2, 1), 16, rail(4, 2.5)),
        'line-opacity': isTunnel ? 0.4 : 1,
        ...(isTunnel ? { 'line-dasharray': [2, 2] } : {}),
      },
      metadata: group,
    },
    {
      id: id('rail-dash'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: ['all', filterStructure, ['==', ['get', 'kind'], 'rail'], ['!', ['has', 'service']]],
      minzoom: 12,
      paint: {
        'line-color': colors.railLight,
        'line-width': width(12, 0.8, 16, 2),
        'line-dasharray': [4, 4],
        'line-opacity': isTunnel ? 0 : 1,
      },
      metadata: group,
    },
  ];
}

export function baseLayers() {
  return [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.background },
      metadata: group,
    },
    {
      id: 'landcover',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'landcover',
      paint: {
        'fill-color': ['case',
          ['==', ['get', 'leaf'], 'needle'], colors.landcover.forestNeedle,
          matchKind(colors.landcover, colors.background)],
        'fill-antialias': false,
      },
      metadata: group,
    },
    {
      id: 'protected-fill',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'protected',
      filter: ['==', ['get', 'kind'], 'national_park'],
      paint: { 'fill-color': colors.protected, 'fill-opacity': 0.06 },
      metadata: group,
    },
  ];
}

// Water, boundaries, buildings and roads. They are drawn above the relief.
export function baseOverlayLayers() {
  return [
    {
      id: 'water',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'water',
      paint: { 'fill-color': colors.water },
      metadata: group,
    },
    {
      id: 'waterway',
      type: 'line',
      source: SOURCE,
      'source-layer': 'waterway',
      filter: ['!', ['has', 'tunnel']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': colors.waterLine,
        'line-width': width(
          8, river(0.8, 0),
          12, river(1.8, 0.5),
          14, river(2.6, 0.9),
          17, river(5, 2),
        ),
        'line-dasharray': ['case', ['has', 'intermittent'], ['literal', [3, 2]], ['literal', [1, 0]]],
      },
      metadata: group,
    },
    {
      id: 'protected-line',
      type: 'line',
      source: SOURCE,
      'source-layer': 'protected',
      // Small reserves only from zoom 12 and lighter, so they do not look like tracks.
      filter: ['any', ['!=', ['get', 'kind'], 'reserve'], ['>=', ['zoom'], 12]],
      paint: {
        'line-color': matchKind({ reserve: colors.protectedReserve }, colors.protected),
        'line-width': width(7, 0.8, 12, 1.5, 16, 3),
        'line-opacity': ['match', ['get', 'kind'], 'reserve', 0.35, 0.7],
        'line-dasharray': [4, 2],
      },
      metadata: group,
    },
    {
      id: 'boundary-region',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundaries',
      filter: ['==', ['get', 'level'], 6],
      paint: {
        'line-color': colors.boundaryRegion,
        'line-width': width(7, 0.6, 12, 1.2, 16, 2),
        'line-dasharray': [6, 2, 1, 2],
      },
      metadata: group,
    },
    {
      id: 'boundary-country-glow',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundaries',
      filter: ['==', ['get', 'level'], 2],
      paint: {
        'line-color': colors.boundaryCountry,
        'line-width': width(5, 3, 12, 8, 16, 14),
        'line-opacity': 0.18,
      },
      metadata: group,
    },
    {
      id: 'boundary-country',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundaries',
      filter: ['==', ['get', 'level'], 2],
      paint: {
        'line-color': colors.boundaryCountry,
        'line-width': width(5, 0.8, 12, 1.6, 16, 2.5),
        'line-dasharray': [5, 1.5, 1, 1.5],
      },
      metadata: group,
    },
    {
      id: 'buildings',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'buildings',
      minzoom: 13,
      paint: {
        'fill-color': colors.building,
        'fill-outline-color': colors.buildingOutline,
        'fill-opacity': linear(13, 0.6, 15, 1),
      },
      metadata: group,
    },
    ...roadLayers('tunnel'),
    ...roadLayers('surface'),
    ...roadLayers('bridge'),
  ];
}
