// Shared fonts and size helpers for the map style.
// Colours live in the style variants in style/themes/.

// Font stacks are folder names in fonts/. Each stack has one font: the server has no combined stacks.
export const fonts = {
  regular: ['NotoSans-Regular'],
  bold: ['NotoSans-Bold'],
  italic: ['NotoSans-Italic'],
  // Fonts of the topographic map, as close as possible to the ZTM10 fonts (see fonts/README.md).
  sans: ['TopoSans-Regular'],
  sansItalic: ['TopoSans-Italic'],
  sansBold: ['TopoSans-Bold'],
  narrow: ['TopoSansNarrow-Regular'],
  narrowBold: ['TopoSansNarrow-Bold'],
  condensed: ['BarlowCondensed-Medium'],
  light: ['Roboto-Light'],
};

// Exponential width interpolation by zoom: stops = [zoom, width, zoom, width, ...].
export function width(...stops) {
  return ['interpolate', ['exponential', 1.6], ['zoom'], ...stops];
}

// Linear interpolation by zoom.
export function linear(...stops) {
  return ['interpolate', ['linear'], ['zoom'], ...stops];
}

// Number shield: the "shield" sprite image stretched around the text (see tools/sprite.mjs).
// The padding (top, right, bottom, left in px) gives the numbers room inside the shield.
export function shieldLayout() {
  return {
    'icon-image': 'shield',
    'icon-text-fit': 'both',
    'icon-text-fit-padding': [2, 4, 2, 4],
    'icon-rotation-alignment': 'viewport',
  };
}

// Shield fill colour and a thin white outline, so a shield is visible on a road of the same colour.
export function shieldPaint(color) {
  return {
    'icon-color': color,
    'icon-halo-color': '#FFFFFF',
    'icon-halo-width': 1,
  };
}

// Build a ["match", ["get", key], ...] expression from an object.
export function matchKind(values, fallback, key = 'kind') {
  const pairs = Object.entries(values).flat();
  if (pairs.length === 0) {
    return fallback;
  }
  return ['match', ['get', key], ...pairs, fallback];
}
