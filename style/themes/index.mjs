// Style variants. Each variant is a theme object with the same shape as tourist.mjs.
// The first entry is the default.

import tourist from './tourist.mjs';
import topo from './topo.mjs';

export const THEMES = { tourist, topo };

export const DEFAULT_THEME = 'tourist';

export function getTheme(id = DEFAULT_THEME) {
  const theme = THEMES[id];
  if (!theme) {
    throw new Error(`Unknown style variant "${id}". Known: ${Object.keys(THEMES).join(', ')}`);
  }
  return theme;
}
