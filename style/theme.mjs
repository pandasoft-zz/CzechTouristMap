// Shared colours, fonts and size helpers for the map style.
// Colours follow docs/design-manual-project.md.

export const fonts = {
  regular: ['NotoSans-Regular'],
  bold: ['NotoSans-Bold'],
  italic: ['NotoSans-Italic'],
};

export const colors = {
  background: '#FBFAF0',
  label: '#1E1E1E',
  labelHalo: 'rgba(255, 255, 255, 0.85)',

  landcover: {
    forest: '#C3E2A0',
    forestNeedle: '#B0D88C',
    grass: '#E2F2C2',
    orchard: '#E4F2BE',
    vineyard: '#ECEBC0',
    scrub: '#D3EBA9',
    heath: '#E7F1B0',
    wetland: '#CDE8DE',
    residential: '#EFE3CF',
    industrial: '#E6DDD6',
    farmyard: '#ECE4C2',
    cemetery: '#D2E2C4',
    park: '#D7EDBA',
    allotments: '#EEF0CC',
    quarry: '#E2E2DE',
    rock: '#E3DFD9',
    scree: '#E8E4DC',
    sand: '#F3EDC0',
    sport: '#DCEDD0',
  },

  water: '#A9D3F2',
  waterLine: '#4D86C6',
  waterLabel: '#1B5FA8',

  building: '#D8D3CC',
  buildingOutline: '#B5ADA3',

  boundaryCountry: '#9A3F9A',
  boundaryRegion: '#A98AA9',
  protected: '#4F8A3A',
  protectedReserve: '#E07A4F',

  road: {
    motorway: '#E05050',
    trunk: '#EA7A45',
    primary: '#F2A24A',
    secondary: '#F7D15E',
    tertiary: '#FBEFA0',
    minor: '#FFFFFF',
    service: '#FFFFFF',
    pedestrian: '#F2EEE8',
    casing: '#8C8478',
    casingMajor: '#9A5A3A',
    track: '#9A6A2E',
    path: '#6E5A48',
    steps: '#A02030',
  },

  rail: '#5A5A5A',
  railLight: '#FFFFFF',

  hiking: {
    red: '#DC0000',
    blue: '#0050C8',
    green: '#007820',
    yellow: '#F0BA00',
  },

  cycling: '#B0279E',
  cyclingSign: '#FFE04A',

  peak: '#5A3A1A',
};

// Exponential width interpolation by zoom: stops = [zoom, width, zoom, width, ...].
export function width(...stops) {
  return ['interpolate', ['exponential', 1.6], ['zoom'], ...stops];
}

// Linear interpolation by zoom.
export function linear(...stops) {
  return ['interpolate', ['linear'], ['zoom'], ...stops];
}
