// Tourist map ("Turistická"): the main style of the project.
// Sources: docs/design-manual-project.md (colours, widths, zooms)
// and docs/design-manual-typography.md (labels).
// "kept from the first style" = deliberate change against the manuals, taken over from the first
// MapLibre style, see docs/style-variants.md.
// "no source" = the manuals do not cover it; the value is our own choice.

export default {
  id: 'tourist',
  name: 'Turistická',
  description: 'Tourist map from the project design manuals',

  // The background is mostly farmland, so it uses the farmland colour.
  background: '#FFFFE6',

  landcover: {
    forest: '#C8E8A0',
    forestNeedle: '#A8D880',
    grass: '#E4F5C0',
    orchard: '#E8F8C0',
    vineyard: '#E8F8C0',
    scrub: '#D8F0A8',
    heath: '#EAF5A8',
    wetland: '#C0E8E0',
    residential: '#F0D8B0',
    // no source
    industrial: '#E6DDD6',
    farmyard: '#D8D4A8',
    // no source
    cemetery: '#D2E2C4',
    park: '#D7EDBA',
    // #80FFF8C5 (50 % alpha) over the background.
    allotments: '#FFFCD5',
    quarry: '#E0E4E0',
    rock: '#E0DCD8',
    scree: '#E8E4DC',
    sand: '#F5F0A0',
    // no source
    sport: '#DCEDD0',
    // Squares and pedestrian zones: light warm grey, the same as pedestrian streets (no source).
    pedestrian: '#F7F3EC',
  },

  // Kept from the first style: more saturated than the manual (#B8D8F0, #5080C0, #2060A0).
  water: {
    fill: '#A9D3F2',
    line: '#4D86C6',
    lineSmall: '#4D86C6',
    label: '#1B5FA8',
  },

  // Buildings from zoom 13 are kept from the first style (manual: 15), so settlements show their shape earlier.
  building: { fill: '#E0E0E0', outline: '#808080', minzoom: 13 },

  // no source
  boundary: {
    country: { color: '#9A3F9A', width: [5, 0.8, 12, 1.6, 16, 2.5], dash: [5, 1.5, 1, 1.5], glow: 0.18 },
    region: { color: '#A98AA9', width: [7, 0.6, 12, 1.2, 16, 2], dash: [6, 2, 1, 2] },
  },

  // Kept from the first style: thin dashed lines and a light national park wash.
  // The manual has solid lines with a glow (#588D42, #FF956A); the glow was too heavy around small reserves.
  protected: {
    national_park: { color: '#4F8A3A', opacity: 0.7, dash: [4, 2], fill: 0.06 },
    landscape: { color: '#4F8A3A', opacity: 0.7, dash: [4, 2], fill: 0 },
    reserve: { color: '#E07A4F', opacity: 0.35, dash: [4, 2], fill: 0 },
  },

  road: {
    fill: {
      // Motorways and expressways are green (manual: red #D42020); red was too loud in towns.
      motorway: '#6DB85A',
      trunk: '#6DB85A',
      primary: '#E07820',
      secondary: '#F0C000',
      tertiary: '#F5E040',
      minor: '#FFFFFF',
      service: '#FFFFFF',
      // Pedestrian streets: the colour of pedestrian areas, so streets and squares form one surface
      // (manual: dark grey #707070).
      pedestrian: '#F7F3EC',
    },
    casing: {
      motorway: '#2F6E2A',
      trunk: '#2F6E2A',
      primary: '#904400',
      secondary: '#907000',
      tertiary: '#909000',
      minor: '#606060',
      service: '#707070',
      // The casing has the fill colour: no outline between pedestrian streets and squares.
      pedestrian: '#F7F3EC',
    },
    // no source
    casingExtra: 1.2,
    // no source: thin grey bridge outline (extra width in px over the road).
    bridge: { color: '#404040', opacity: 0.85, width: 3.4 },
    // Ratios of the manual's base widths (motorway 2.8, primary 3.0, secondary 2.8,
    // tertiary 2.5, residential 2.0, unclassified 2.5, service 2.2).
    widthFactor: {
      motorway: 0.75, trunk: 0.8, primary: 0.95, minor: 1.2, service: 1.9,
      // Pedestrian streets wide, so they read as one surface with the squares (no source).
      pedestrian: 1.8,
    },
    centreLine: null,
    // Dash patterns: no source.
    track: { color: '#8C5A1E', dashGraded: [1, 0], dash: [5, 2] },
    path: { color: '#8C5A1E', dash: [3, 2] },
    cycleway: { color: '#0040A0', dash: [3, 2] },
    steps: { color: '#A02030' },
  },

  // Tram and service track values: no source.
  rail: { color: '#505050', ties: '#F8FCF8', tram: '#606060', serviceOpacity: 0.55 },

  // Kept from the first style: no minimum zoom, so main routes show from zoom 9 (manual: 11).
  hiking: {
    red: '#DC0000',
    blue: '#0050C8',
    green: '#007820',
    yellow: '#E8B400',
    casing: '#FFFFFF',
    minzoom: 0,
  },

  // no source: the manuals have no cycle routes.
  cycling: {
    color: '#B0279E',
    casing: null,
    opacity: 0.8,
    localOpacity: 0.45,
    dash: [3, 1.5],
    localDash: [3, 1.5],
    mtbDash: [1, 1.5],
    signText: '#1A1A1A',
    signBg: '#FFE04A',
  },

  // no source: the manuals have no hillshading.
  relief: {
    // Strong shading with soft brown-grey shadows and white highlights. Light from north-west is the
    // classic cartographic choice; a weaker light from the west keeps slopes readable on all sides.
    // The exaggeration stays high at large zoom, so steep valley sides still look steep there.
    lights: [
      { direction: 315, altitude: 30, shadow: 'rgba(70, 55, 40, 0.8)', highlight: 'rgba(255, 255, 255, 0.55)' },
      { direction: 270, altitude: 40, shadow: 'rgba(70, 55, 40, 0.35)', highlight: 'rgba(255, 255, 255, 0.2)' },
    ],
    // The elevation tiles end at zoom 12. MapLibre flattens the slopes of tiles below zoom 15, so
    // the overzoomed tiles need full exaggeration; otherwise small hills disappear at large zoom.
    exaggeration: [6, 0.6, 11, 0.65, 13, 0.85],
    // Hypsometric tint like OpenTopoMap: green lowlands, yellow uplands, brown mountains.
    // Elevations in metres (Czechia: 115–1603 m).
    tint: {
      colors: [
        150, '#9FCB8A',
        300, '#C5DD98',
        450, '#E8E6A6',
        600, '#EBD49A',
        800, '#DDB683',
        1100, '#C99A72',
        1400, '#B4876A',
        1700, '#C9B4A8',
      ],
      opacity: [6, 0.75, 9, 0.6, 11, 0.25, 12, 0],
      maxzoom: 12,
    },
  },

  // design-manual-project.md, section 5: major #C07030, medium #D09060.
  // Labels: design-manual-typography.md, section 4 (italic, #906010, no halo).
  contours: {
    color: '#D09060',
    indexColor: '#C07030',
    width: 0.6,
    indexWidth: 0.9,
    opacity: 0.85,
    label: { color: '#906010', font: 'italic', halo: 'rgba(255, 255, 255, 0)', haloWidth: 0 },
  },

  labels: {
    color: '#000000',
    halo: '#FFFFFF',
    haloWidth: 2,
    // Size stops are at zoom 6, 9 and 13. Capital in upper case. City 11-18, town 12-18.
    city: { size: [11, 14, 18], font: 'bold', color: '#000000', uppercase: 'capital' },
    town: { size: [12, 13, 18], font: 'bold', color: '#000000' },
    // Size stops are at zoom 11 and 15.
    village: { size: [11, 17], font: 'regular', color: '#666666' },
    suburb: { size: 13, font: 'regular', color: '#666666' },
    hamlet: { size: 11, font: 'regular', color: '#666666' },
    locality: { size: 12, font: 'italic', color: '#666666' },
    // Italic is kept from the first style (manual: bold), so peaks are less dominant.
    peak: { color: '#693600', font: 'italic', uppercase: false, eleColor: '#693600' },
    water: { color: '#1B5FA8', font: 'italic' },
    roadName: { color: '#000000', font: 'bold' },
    // Road numbers in shields: text colour and shield colour.
    // Motorway shields follow the green motorway colour. II. and III. class shields use the road colour
    // (manual: green #008700), so they do not look like motorway shields.
    // Only motorways and roads with one- or two-digit numbers (I. class, expressways).
    roadRef: {
      maxNumber: 100,
      shields: true,
      haloWidth: 0,
      kinds: {
        motorway: { text: '#FFFFFF', shield: '#2F7D32' },
        trunk: { text: '#FFFFFF', shield: '#2F7D32' },
        primary: { text: '#FFFFFF', shield: '#1040C8' },
        secondary: { text: '#000000', shield: '#F0C000' },
        tertiary: { text: '#000000', shield: '#F5E040' },
      },
      default: { text: '#FFFFFF', shield: '#6B4724' },
    },
  },
};
