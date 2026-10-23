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

function hex(color) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error(`Sprite colour must be #RRGGBB: ${color}`);
  }
  return color.slice(1).toLowerCase();
}

// Number shield: a rounded rectangle from the sprite, stretched around the text (see tools/sprite.mjs).
// There is one image per colour ("shield-2f7d32"): MapLibre Native draws SDF images with stretch areas
// far too big, so the shields are not coloured with icon-color.
export function shieldImage(color) {
  return `shield-${hex(color)}`;
}

// Shield colours of a style variant. The sprite has an image for each of them.
export function shieldColors(t) {
  const ref = t.labels.roadRef;
  return [...Object.values(ref.kinds), ref.default].map((s) => s.shield);
}

// Line pattern for cliffs and banks, one image per colour (see tools/sprite.mjs).
export function cliffImage(color) {
  return `cliff-${hex(color)}`;
}

export function cliffColors(t) {
  return Object.values(t.cliff).map((c) => c.color);
}

// The padding (top, right, bottom, left in px) gives the numbers room inside the shield.
export function shieldLayout(image) {
  return {
    'icon-image': image,
    'icon-text-fit': 'both',
    'icon-text-fit-padding': [2, 4, 2, 4],
    'icon-rotation-alignment': 'viewport',
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
