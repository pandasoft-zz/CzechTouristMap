// Topographic map ("Topografická"): inspired by the ČÚZK topographic map ZTM10.
// It takes over the ZTM10 colours, but it is not a faithful ZTM10 rendering:
// the data, the zoom levels and the tourist overlays differ (see docs/style-variants.md).
// Colour source: docs/standards/vysvetlivky_ZTM10.pdf. Hex values are read from the vector
// drawings in the PDF, not from screenshots.
// "no source" = ZTM10 has no matching symbol; the value is our own choice.

export default {
  id: 'topo',
  name: 'Topografická',
  description: 'Topographic map inspired by ČÚZK ZTM10',

  // ZTM10 "orná a ostatní půda": white.
  background: '#FFFFFF',

  landcover: {
    forest: '#CCE7D0',
    // ZTM10 shows tree type with symbols only; the fill is the same.
    forestNeedle: '#CCE7D0',
    grass: '#FFFBCC',
    orchard: '#F0F4D1',
    vineyard: '#F0F4D1',
    scrub: '#E5F0D1',
    // no source: closest ZTM10 class is "ostatní trvalá kultura".
    heath: '#F0F4D1',
    // ZTM10 uses blue hatching on white. A light water tint stands in for it.
    wetland: '#DEF3FD',
    // ZTM10 draws built-up land white; buildings carry the settlement shape.
    residential: '#FFFFFF',
    industrial: '#F4ECEA',
    farmyard: '#FFEACD',
    cemetery: '#F0F4D1',
    park: '#F0F4D1',
    allotments: '#F0F4D1',
    quarry: '#FFF7ED',
    // ZTM10 draws rocks and scree as brown symbols on white. A light tint stands in.
    rock: '#FBF1EA',
    scree: '#F7EEE8',
    // no source
    sand: '#FFF7ED',
    sport: '#F0F4D1',
    // ZTM10 "ulice nesjízdná" colour, also for squares.
    pedestrian: '#E6E7E8',
  },

  water: {
    fill: '#BEE7FB',
    line: '#00AEEF',
    lineSmall: '#00AEEF',
    outline: '#00AEEF',
    label: '#00AEEF',
  },

  building: { fill: '#D3D5D6', outline: '#86888A', minzoom: 13 },

  boundary: {
    country: { color: '#F172AC', width: [5, 1, 12, 2.2, 16, 3.5], dash: [5, 1.5, 1, 1.5], glow: 0 },
    region: { color: '#F172AC', width: [7, 0.8, 12, 1.8, 16, 2.8], dash: [4, 2] },
  },

  // ZTM10 "hranice chráněného území velkoplošného / maloplošného".
  protected: {
    national_park: { color: '#AB9544', opacity: 0.9, dash: [4, 2], fill: 0 },
    landscape: { color: '#AB9544', opacity: 0.9, dash: [4, 2], fill: 0 },
    reserve: { color: '#AB9544', opacity: 0.6, dash: [3, 1, 1, 1], fill: 0 },
  },

  road: {
    fill: {
      motorway: '#FDBD4D',
      trunk: '#FDBD4D',
      primary: '#FDBD4D',
      secondary: '#FFF33E',
      tertiary: '#FFF33E',
      minor: '#FFFFFF',
      service: '#FFFFFF',
      pedestrian: '#E6E7E8',
    },
    casing: {
      motorway: '#86888A',
      trunk: '#86888A',
      primary: '#86888A',
      secondary: '#86888A',
      tertiary: '#86888A',
      minor: '#86888A',
      service: '#86888A',
      // Same as the fill: pedestrian streets and squares form one surface (no source).
      pedestrian: '#E6E7E8',
    },
    casingExtra: 1.4,
    // ZTM10 bridge edges are dark grey #58595B.
    bridge: { color: '#58595B', opacity: 0.85, width: 3 },
    // Ratios of the ZTM10 line widths (motorway 3.55, I. 2.55, II. 2.27, III. 1.99, other 1.99).
    widthFactor: { motorway: 1.2, trunk: 1.3, minor: 1.3 },
    // Motorways are two carriageways with a grey line between them.
    centreLine: '#86888A',
    // "polní a lesní cesta udržovaná" solid, "neudržovaná" dashed.
    track: { color: '#86888A', dashGraded: [1, 0], dash: [6, 3] },
    path: { color: '#86888A', dash: [3, 3] },
    cycleway: { color: '#86888A', dash: [3, 3] },
    // no source
    steps: { color: '#86888A' },
  },

  // ZTM10 tram line: thin, same grey. Service track opacity: no source.
  rail: { color: '#58595B', ties: '#FFFFFF', tram: '#58595B', serviceOpacity: 0.55 },

  // no source: ZTM10 has no hiking routes. Colours follow the KČT marking.
  hiking: {
    red: '#DC0000',
    blue: '#0050C8',
    green: '#007820',
    yellow: '#F0BA00',
    casing: '#FFFFFF',
    minzoom: 0,
  },

  // no source: ZTM10 has no cycle routes. Same as the tourist map.
  cycling: {
    color: '#B0279E',
    casing: null,
    opacity: 0.8,
    localOpacity: 0.45,
    dash: [3, 1.5],
    localDash: [3, 1.5],
    mtbDash: [1, 1.5],
    signText: '#231F20',
    signBg: '#FFF33E',
  },

  // no source: ZTM10 shows terrain with contours (#E9BC9A), not with shading.
  // The data has no contours, so shading in a neutral brown stands in. It is a bit lighter than
  // in the tourist map, but stays strong at large zoom, so steep slopes read as steep.
  relief: {
    lights: [
      { direction: 315, altitude: 35, shadow: 'rgba(100, 85, 70, 0.6)', highlight: 'rgba(255, 255, 255, 0.4)' },
      { direction: 270, altitude: 40, shadow: 'rgba(100, 85, 70, 0.25)', highlight: 'rgba(255, 255, 255, 0.15)' },
    ],
    exaggeration: [6, 0.6, 12, 0.55, 16, 0.5],
  },

  // ZTM10: all contours #E9BC9A; index contours thicker (0.85 pt against 0.37 pt).
  // Labels: Arial Narrow, no halo. The colour is a bit darker than #E9BC9A, so the numbers stay readable
  // (no source).
  contours: {
    color: '#E9BC9A',
    indexColor: '#E9BC9A',
    width: 0.6,
    indexWidth: 1.2,
    opacity: 1,
    label: { color: '#D9A27A', font: 'narrow', halo: 'rgba(255, 255, 255, 0)', haloWidth: 0 },
  },

  labels: {
    color: '#231F20',
    halo: 'rgba(255, 255, 255, 0.9)',
    haloWidth: 1.5,
    // Fonts follow the ZTM10 legend. Arial and Arial Narrow are replaced by the metric-compatible
    // TopoSans / TopoSansNarrow (Liberation Sans); Barlow Condensed and Roboto are the original fonts.
    // "město": Arial Narrow Bold, upper case.
    city: { size: [13, 16, 23], font: 'narrowBold', color: '#231F20', uppercase: 'all' },
    town: { size: [10, 12, 18], font: 'narrowBold', color: '#231F20', uppercase: true },
    // "obec, městys": Arial Narrow Bold.
    village: { size: [12, 15], font: 'narrowBold', color: '#231F20' },
    // "část města": Barlow Condensed Medium, upper case.
    suburb: { size: 12, font: 'condensed', color: '#231F20', uppercase: true },
    // "část obce": Barlow Condensed Medium.
    hamlet: { size: 12, font: 'condensed', color: '#231F20' },
    // "místní část, samota": Arial Italic.
    isolated: { size: 10, font: 'sansItalic', color: '#231F20' },
    // "pozemková trať": Roboto Light.
    locality: { size: 11, font: 'light', color: '#231F20' },
    // "pohoří, kopec": Arial, upper case, red-brown. Spot heights: Arial Narrow, same colour.
    peak: { color: '#994739', font: 'sans', uppercase: true, eleColor: '#994739', eleFont: 'narrow' },
    // "vodní tok a plocha": Arial Italic, blue.
    water: { color: '#00AEEF', font: 'sansItalic' },
    roadName: { color: '#231F20', font: 'sans' },
    // Road numbers: Arial Bold.
    refFont: 'sansBold',
    // Road numbers are black bold text without a shield.
    // Motorway and expressway numbers: green shield as in the tourist map (no source).
    roadRef: {
      shields: ['motorway', 'trunk'],
      haloWidth: 2,
      kinds: {
        motorway: { text: '#FFFFFF', shield: '#2F7D32' },
        trunk: { text: '#FFFFFF', shield: '#2F7D32' },
      },
      default: { text: '#231F20', shield: '#FFFFFF' },
    },
  },
};
