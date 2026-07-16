const CONFIG = {
  tegola_url: 'http://localhost:8080',
  pmtiles_file: '/assets/CzechTouristMap.pmtiles',
  initial_center: [15.5, 49.8],
  initial_zoom: 7,
};

let map = null;
let currentMode = 'tegola';

async function detectMode() {
  try {
    const response = await fetch(CONFIG.pmtiles_file, { method: 'HEAD' });
    if (response.ok) return 'pmtiles';
  } catch (e) {}
  return 'tegola';
}

async function initPMTilesMode() {
  currentMode = 'pmtiles';
  let protocol = new PMTiles(CONFIG.pmtiles_file);
  maplibregl.addProtocol('pmtiles', protocol.tile);

  const style = {
    version: 8,
    sources: {
      pmtiles: {
        type: 'vector',
        url: 'pmtiles://' + CONFIG.pmtiles_file,
        minzoom: 0,
        maxzoom: 14
      }
    },
    layers: buildLayers('pmtiles')
  };

  map = new maplibregl.Map({
    container: 'map',
    style: style,
    center: CONFIG.initial_center,
    zoom: CONFIG.initial_zoom
  });

  setupUI();
}

async function initTegolaMode() {
  currentMode = 'tegola';
  const style = {
    version: 8,
    sources: {
      tegola: {
        type: 'vector',
        tiles: [CONFIG.tegola_url + '/data/CzechTouristMap/{z}/{x}/{y}.pbf'],
        minzoom: 0,
        maxzoom: 14
      }
    },
    layers: buildLayers('tegola')
  };

  map = new maplibregl.Map({
    container: 'map',
    style: style,
    center: CONFIG.initial_center,
    zoom: CONFIG.initial_zoom
  });

  setupUI();
}

function buildLayers(sourceId) {
  return [
    { id: 'background', type: 'background', paint: { 'background-color': '#fdfdf0' } },
    { id: 'water', type: 'fill', source: sourceId, 'source-layer': 'water', paint: { 'fill-color': '#a0c8f0' } },
    { id: 'landuse-forest', type: 'fill', source: sourceId, 'source-layer': 'landuse', filter: ['==', ['get', 'class'], 'forest'], paint: { 'fill-color': '#c8e6c9' } },
    { id: 'landuse-grass', type: 'fill', source: sourceId, 'source-layer': 'landuse', filter: ['==', ['get', 'class'], 'grass'], paint: { 'fill-color': '#e8f5e9' } },
    { id: 'highway-motorway', type: 'line', source: sourceId, 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'motorway'], paint: { 'line-color': '#f9c74f', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 14, 3] } },
    { id: 'highway-primary', type: 'line', source: sourceId, 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'primary'], paint: { 'line-color': '#ffb81a', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.3, 14, 2] } },
    { id: 'highway-secondary', type: 'line', source: sourceId, 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'secondary'], paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.2, 14, 1.5] } },
    { id: 'highway-path', type: 'line', source: sourceId, 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'path'], paint: { 'line-color': '#8b9e7d', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.2, 14, 0.8], 'line-dasharray': [2, 2] }, minzoom: 12 },
    { id: 'waterway', type: 'line', source: sourceId, 'source-layer': 'waterway', paint: { 'line-color': '#a0c8f0', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.2, 14, 1] } },
    { id: 'admin-border', type: 'line', source: sourceId, 'source-layer': 'boundary', paint: { 'line-color': '#8b7d7d', 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 14, 1], 'line-dasharray': [2, 1] } },
    { id: 'place-label', type: 'symbol', source: sourceId, 'source-layer': 'place', layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 14, 14], 'text-anchor': 'center' }, paint: { 'text-color': '#333333', 'text-halo-color': '#ffffff', 'text-halo-width': 1 }, minzoom: 7 }
  ];
}

function setupUI() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const modeText = document.getElementById('mode-text');

  modeText.textContent = currentMode === 'pmtiles' ? '📦 PMTiles' : '🌐 Tegola';

  map.on('load', () => {
    statusDot.className = 'dot dot-ok';
    statusText.textContent = 'Loaded';
  });

  const zoomInfo = document.getElementById('zoom-info');
  const coordsInfo = document.getElementById('coords-info');

  map.on('move', () => {
    const c = map.getCenter();
    zoomInfo.textContent = `zoom: ${map.getZoom().toFixed(1)}`;
    coordsInfo.textContent = `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
  });

  loadLocations();
}

async function loadLocations() {
  try {
    const res = await fetch('/config/locations.yaml');
    const yaml = await res.text();
    const select = document.getElementById('loc-select');
    const lines = yaml.split('\n');
    const locations = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('- name:')) {
        if (current) locations.push(current);
        current = { name: line.match(/- name: (.*)/)[1], lat: 0, lng: 0, zoom: 12 };
      }
      if (current) {
        if (line.includes('lat:')) current.lat = parseFloat(line.match(/lat: ([\d.-]+)/)[1]);
        if (line.includes('lng:')) current.lng = parseFloat(line.match(/lng: ([\d.-]+)/)[1]);
        if (line.includes('zoom:')) current.zoom = parseInt(line.match(/zoom: (\d+)/)[1]);
      }
    }
    if (current) locations.push(current);

    locations.forEach((loc, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = loc.name;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      if (e.target.value === '') return;
      const loc = locations[parseInt(e.target.value)];
      map.flyTo({ center: [loc.lng, loc.lat], zoom: loc.zoom, duration: 1000 });
    });
  } catch (e) {
    console.error('Locations failed:', e);
  }
}

async function init() {
  const mode = await detectMode();
  if (mode === 'pmtiles') await initPMTilesMode();
  else await initTegolaMode();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
