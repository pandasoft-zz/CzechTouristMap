// Base map layers: land cover, water, boundaries, buildings, roads and railways.
// Labels are in labels.mjs, so they stay on top of the route overlays.

import { width, linear, matchKind, cliffImage } from '../theme.mjs';

const SOURCE = 'base';
const group = { group: 'base' };

// Width per road kind at a few zoom stops.
// Each row: zoom -> { kind: width in px }.
const ROAD_WIDTH = {
  6: { motorway: 1.2, trunk: 1, primary: 0.8 },
  9: { motorway: 2, trunk: 1.8, primary: 1.5, secondary: 1.1, tertiary: 0.8 },
  12: { motorway: 3.5, trunk: 3.2, primary: 3, secondary: 2.6, tertiary: 2.2, minor: 1.4, pedestrian: 1, service: 0.8 },
  14: { motorway: 6, trunk: 5.5, primary: 5, secondary: 4.5, tertiary: 4, minor: 3, pedestrian: 2.5, service: 1.8 },
  17: { motorway: 18, trunk: 16, primary: 15, secondary: 13, tertiary: 12, minor: 10, pedestrian: 8, service: 6 },
};

function roadWidth(t, extra = 0, scale = 1) {
  const factor = t.road.widthFactor;
  const stops = [];
  for (const [zoom, widths] of Object.entries(ROAD_WIDTH)) {
    const scaled = Object.fromEntries(Object.entries(widths)
      .map(([k, w]) => [k, w * (factor[k] ?? 1) * scale + extra]));
    stops.push(Number(zoom), matchKind(scaled, 0));
  }
  return ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];
}

// Small helpers for "value by kind" inside zoom interpolations.
const river = (big, small) => ['match', ['get', 'kind'], 'river', big, small];
const steps = (value, other) => ['match', ['get', 'kind'], 'steps', value, other];

const PAVED = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'pedestrian', 'service'];

const widthByKind = (values) => Object.fromEntries(Object.entries(values).map(([kind, v]) => [kind, v.width]));

// Value per protected area kind from the theme, e.g. protectedValue(t, 'color').
function protectedValue(t, key, literal = false) {
  const wrap = (v) => (literal ? ['literal', v] : v);
  const values = Object.fromEntries(Object.entries(t.protected).map(([kind, p]) => [kind, wrap(p[key] ?? 0)]));
  return matchKind(values, wrap(t.protected.landscape[key] ?? 0));
}

function roadLayers(t, structure) {
  const filterStructure = structure === 'surface'
    ? ['all', ['!', ['has', 'tunnel']], ['!', ['has', 'bridge']]]
    : ['has', structure];
  const id = (name) => `${structure}-${name}`;
  const isTunnel = structure === 'tunnel';
  // Surface pedestrian streets are drawn under the buildings (pedestrian-street), not here.
  const kinds = structure === 'surface' ? PAVED.filter((k) => k !== 'pedestrian') : PAVED;
  const paved = ['all', filterStructure, ['in', ['get', 'kind'], ['literal', kinds]]];
  const isBridge = structure === 'bridge';
  // Bridges get their own thin outline instead of the road casing. Butt caps keep it off the road
  // that continues past the bridge ends.
  const casingExtra = isBridge ? t.road.bridge.width : t.road.casingExtra;
  const { track, path, cycleway } = t.road;

  const layers = [
    {
      id: id('road-casing'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: paved,
      layout: { 'line-cap': isTunnel || isBridge ? 'butt' : 'round', 'line-join': 'round' },
      paint: {
        'line-color': isBridge ? t.road.bridge.color : matchKind(t.road.casing, '#808080'),
        'line-width': roadWidth(t, casingExtra),
        'line-opacity': ['step', ['zoom'], 0, 9, isTunnel ? 0.4 : (isBridge ? t.road.bridge.opacity : 1)],
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
        'line-color': track.color,
        'line-width': width(12, 0.7, 14, 1.3, 17, 2.5),
        'line-dasharray': ['match', ['get', 'grade'], [1, 2], ['literal', track.dashGraded], ['literal', track.dash]],
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
        'line-color': matchKind({ steps: t.road.steps.color, cycleway: cycleway.color }, path.color),
        'line-width': width(13, 0.6, 15, steps(3, 1), 17, steps(5, 1.6)),
        'line-dasharray': ['match', ['get', 'kind'],
          'steps', ['literal', [0.4, 0.4]],
          'cycleway', ['literal', cycleway.dash],
          ['literal', path.dash]],
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
        'line-color': matchKind(t.road.fill, '#FFFFFF'),
        'line-width': roadWidth(t),
        'line-opacity': isTunnel ? 0.6 : 1,
      },
      metadata: group,
    },
  ];

  if (t.road.centreLine) {
    layers.push({
      id: id('road-centre'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: ['all', filterStructure, ['in', ['get', 'kind'], ['literal', ['motorway', 'trunk']]],
        ['!', ['has', 'link']]],
      minzoom: 12,
      paint: {
        'line-color': t.road.centreLine,
        'line-width': linear(12, 0.5, 17, 1.2),
        'line-opacity': isTunnel ? 0.5 : 1,
      },
      metadata: group,
    });
  }

  const isService = ['has', 'service'];
  const kindIs = (kind) => ['==', ['get', 'kind'], kind];
  // Main lines: thin dark line with light dashes. Sidings and yard tracks (service): thinner and
  // lighter, so large stations do not become a dark block. Narrow gauge: thin line.
  const railWidth = ['case', isService, 0.6, kindIs('narrow'), 0.7, 1];
  layers.push(
    {
      id: id('rail'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: ['all', filterStructure, ['!=', ['get', 'kind'], 'tram']],
      paint: {
        'line-color': t.rail.color,
        'line-width': width(8, ['*', railWidth, 0.6], 12, ['*', railWidth, 1.2], 16, ['*', railWidth, 2.4]),
        'line-opacity': isTunnel ? 0.35 : ['case', isService, t.rail.serviceOpacity, 1],
        ...(isTunnel ? { 'line-dasharray': [2, 2] } : {}),
      },
      metadata: group,
    },
    {
      id: id('rail-dash'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: ['all', filterStructure, kindIs('rail'), ['!', isService]],
      minzoom: 13,
      paint: {
        'line-color': t.rail.ties,
        'line-width': width(13, 0.5, 16, 1.2),
        'line-dasharray': [4, 4],
        'line-opacity': isTunnel ? 0 : 1,
      },
      metadata: group,
    },
    // Tram: a thin line with small cross ties. The ties are short dashes on a wider line.
    {
      id: id('tram'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: ['all', filterStructure, kindIs('tram')],
      paint: {
        'line-color': t.rail.tram,
        'line-width': width(13, 0.5, 17, 1.2),
        'line-opacity': isTunnel ? 0.35 : 0.9,
      },
      metadata: group,
    },
    {
      id: id('tram-ties'),
      type: 'line',
      source: SOURCE,
      'source-layer': 'rail',
      filter: ['all', filterStructure, kindIs('tram')],
      minzoom: 15,
      paint: {
        'line-color': t.rail.tram,
        'line-width': width(15, 3, 17, 5),
        'line-dasharray': [0.15, 4],
        'line-opacity': isTunnel ? 0 : 0.8,
      },
      metadata: group,
    },
  );
  return layers;
}

export function baseLayers(t) {
  return [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': t.background },
      metadata: group,
    },
    {
      id: 'landcover',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'landcover',
      // Pedestrian areas are drawn above the relief (pedestrian-area), with the pedestrian streets.
      filter: ['!=', ['get', 'kind'], 'pedestrian'],
      paint: {
        'fill-color': ['case',
          ['==', ['get', 'leaf'], 'needle'], t.landcover.forestNeedle,
          matchKind(t.landcover, t.background)],
        'fill-antialias': false,
      },
      metadata: group,
    },
    {
      id: 'protected-fill',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'protected',
      paint: {
        'fill-color': protectedValue(t, 'color'),
        'fill-opacity': protectedValue(t, 'fill'),
      },
      metadata: group,
    },
  ];
}

// Water, boundaries, buildings and roads. They are drawn above the relief.
export function baseOverlayLayers(t) {
  const hasGlow = Object.values(t.protected).some((p) => p.glow);
  return [
    // Waterways are drawn under the water areas: where a river has an area, the centre line is hidden.
    {
      id: 'waterway',
      type: 'line',
      source: SOURCE,
      'source-layer': 'waterway',
      filter: ['!', ['has', 'tunnel']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': river(t.water.line, t.water.lineSmall),
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
      id: 'water',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'water',
      paint: {
        'fill-color': t.water.fill,
        // The outline is only drawn from zoom 12; at low zoom it makes small lakes look jagged.
        ...(t.water.outline ? { 'fill-outline-color': ['step', ['zoom'], t.water.fill, 12, t.water.outline] } : {}),
      },
      metadata: group,
    },
    // Cliffs and banks (line pattern from the sprite). The ticks point to the lower side.
    {
      id: 'cliffs',
      type: 'line',
      source: SOURCE,
      'source-layer': 'cliffs',
      minzoom: 13,
      layout: { 'line-join': 'round' },
      paint: {
        'line-pattern': matchKind(
          Object.fromEntries(Object.entries(t.cliff).map(([kind, c]) => [kind, cliffImage(c.color)])),
          cliffImage(t.cliff.bank.color),
        ),
        // The pattern is 10 px high; the line width scales it.
        'line-width': ['interpolate', ['linear'], ['zoom'],
          13, ['*', 6, matchKind(widthByKind(t.cliff), 1)],
          16, ['*', 10, matchKind(widthByKind(t.cliff), 1)],
          18, ['*', 14, matchKind(widthByKind(t.cliff), 1)]],
      },
      metadata: group,
    },
    ...(hasGlow ? [{
      id: 'protected-glow',
      type: 'line',
      source: SOURCE,
      'source-layer': 'protected',
      filter: ['any', ['!=', ['get', 'kind'], 'reserve'], ['>=', ['zoom'], 12]],
      paint: {
        'line-color': protectedValue(t, 'color'),
        'line-width': width(7, 2, 12, 4, 16, 7),
        'line-opacity': protectedValue(t, 'glow'),
      },
      metadata: group,
    }] : []),
    {
      id: 'protected-line',
      type: 'line',
      source: SOURCE,
      'source-layer': 'protected',
      // Small reserves only from zoom 12, so they do not look like tracks.
      filter: ['any', ['!=', ['get', 'kind'], 'reserve'], ['>=', ['zoom'], 12]],
      paint: {
        'line-color': protectedValue(t, 'color'),
        'line-width': width(7, 0.8, 12, 1.5, 16, 3),
        'line-opacity': protectedValue(t, 'opacity'),
        'line-dasharray': protectedValue(t, 'dash', true),
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
        'line-color': t.boundary.region.color,
        'line-width': width(...t.boundary.region.width),
        'line-dasharray': t.boundary.region.dash,
      },
      metadata: group,
    },
    ...(t.boundary.country.glow ? [{
      id: 'boundary-country-glow',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundaries',
      filter: ['==', ['get', 'level'], 2],
      paint: {
        'line-color': t.boundary.country.color,
        'line-width': width(5, 3, 12, 8, 16, 14),
        'line-opacity': t.boundary.country.glow,
      },
      metadata: group,
    }] : []),
    {
      id: 'boundary-country',
      type: 'line',
      source: SOURCE,
      'source-layer': 'boundaries',
      filter: ['==', ['get', 'level'], 2],
      paint: {
        'line-color': t.boundary.country.color,
        'line-width': width(...t.boundary.country.width),
        'line-dasharray': t.boundary.country.dash,
      },
      metadata: group,
    },
    {
      id: 'pedestrian-area',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'landcover',
      filter: ['==', ['get', 'kind'], 'pedestrian'],
      paint: { 'fill-color': t.landcover.pedestrian },
      metadata: group,
    },
    // Pedestrian streets on the surface: under the buildings, so building outlines stay sharp.
    {
      id: 'pedestrian-street',
      type: 'line',
      source: SOURCE,
      'source-layer': 'roads',
      filter: ['all', ['==', ['get', 'kind'], 'pedestrian'], ['!', ['has', 'tunnel']], ['!', ['has', 'bridge']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': t.road.fill.pedestrian,
        'line-width': roadWidth(t),
      },
      metadata: group,
    },
    {
      id: 'buildings',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'buildings',
      minzoom: t.building.minzoom,
      paint: {
        'fill-color': t.building.fill,
        'fill-outline-color': t.building.outline,
        'fill-opacity': linear(t.building.minzoom, 0.6, t.building.minzoom + 2, 1),
      },
      metadata: group,
    },
    ...roadLayers(t, 'tunnel'),
    ...roadLayers(t, 'surface'),
    ...roadLayers(t, 'bridge'),
  ];
}
