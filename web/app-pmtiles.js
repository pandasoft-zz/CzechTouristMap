// PMTiles viewer using MapLibre GL
// Falls back to tile-server Leaflet if PMTiles not available

const API = '/api';
const PMTILES_FILE = '/assets/CzechTouristMap.pmtiles';

let map = null;
let currentMode = 'tile-server'; // 'pmtiles' or 'tile-server'

// ── Detect mode ───────────────────────────────────────────────────────────

async function detectMode() {
  try {
    const response = await fetch(PMTILES_FILE, { method: 'HEAD' });
    if (response.ok) {
      console.log('PMTiles file found, using MapLibre GL mode');
      return 'pmtiles';
    }
  } catch (e) {
    console.log('PMTiles file not found, falling back to tile-server');
  }
  return 'tile-server';
}

// ── Tile-server mode (Leaflet) ────────────────────────────────────────────

function initTileServerMode() {
  currentMode = 'tile-server';
  document.title = 'CzechTouristMap – Development (Live Tile Server)';

  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  map = L.map('map', {
    center: [49.8, 15.5],
    zoom: 7,
    zoomControl: true,
  });

  const cacheBuster = Date.now();
  const tileLayer = L.tileLayer(`${API}/tiles/{z}/{x}/{y}.png?t=${cacheBuster}`, {
    tileSize: 256,
    minZoom: 2,
    maxZoom: 18,
    attribution: '© OpenStreetMap | Mapsforge tile-server (dev)',
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=',
  });

  tileLayer.on('tileload', () => {
    statusDot.className = 'dot dot-ok';
    statusText.textContent = 'Tile-server (development)';
  });

  tileLayer.on('tileerror', () => {
    statusDot.className = 'dot dot-error';
    statusText.textContent = 'Tile-server error';
  });

  tileLayer.addTo(map);
  setupLocationSelector();
}

// ── PMTiles mode (MapLibre GL) ────────────────────────────────────────────

async function initPMTilesMode() {
  currentMode = 'pmtiles';
  document.title = 'CzechTouristMap – PMTiles';

  // Load MapLibre GL + PMTiles protocol
  const script1 = document.createElement('script');
  script1.src = 'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js';

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css';
  document.head.appendChild(link);

  await new Promise(r => { script1.onload = r; document.head.appendChild(script1); });

  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/pmtiles@latest/dist/pmtiles.js';
  await new Promise(r => { script2.onload = r; document.head.appendChild(script2); });

  // Initialize PMTiles
  const protocol = new PMTiles(PMTILES_FILE);
  maplibregl.addProtocol('pmtiles', protocol.tile);

  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        pmtiles: {
          type: 'vector',
          url: 'pmtiles://./CzechTouristMap.pmtiles'
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#e8e0d5' }
        },
        {
          id: 'water',
          type: 'fill',
          source: 'pmtiles',
          'source-layer': 'water',
          paint: { 'fill-color': '#a0c8f0' }
        },
        {
          id: 'forest',
          type: 'fill',
          source: 'pmtiles',
          'source-layer': 'landuse',
          filter: ['==', ['get', 'class'], 'forest'],
          paint: { 'fill-color': '#c8e6c9' }
        },
        {
          id: 'motorway',
          type: 'line',
          source: 'pmtiles',
          'source-layer': 'transportation',
          filter: ['==', ['get', 'class'], 'motorway'],
          paint: { 'line-color': '#f9c74f', 'line-width': 2.5 }
        },
        {
          id: 'primary',
          type: 'line',
          source: 'pmtiles',
          'source-layer': 'transportation',
          filter: ['==', ['get', 'class'], 'primary'],
          paint: { 'line-color': '#ffb81a', 'line-width': 2 }
        }
      ]
    },
    center: [15.5, 49.8],
    zoom: 7
  });

  map.on('load', () => {
    statusDot.className = 'dot dot-ok';
    statusText.textContent = 'PMTiles (offline-capable)';
  });

  map.on('error', () => {
    statusDot.className = 'dot dot-error';
    statusText.textContent = 'PMTiles error';
  });

  setupLocationSelector();
}

// ── Location selector ─────────────────────────────────────────────────────

async function setupLocationSelector() {
  try {
    const response = await fetch('/config/locations.yaml');
    const yaml = await response.text();

    // Simple YAML parser for locations
    const lines = yaml.split('\n');
    const locations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('- name:')) {
        const match = line.match(/- name: (.*)/);
        if (match) {
          const name = match[1];
          let lat, lng, zoom;

          for (let j = i + 1; j < i + 5; j++) {
            if (lines[j].includes('lat:')) {
              lat = parseFloat(lines[j].match(/lat: ([\d.-]+)/)[1]);
            }
            if (lines[j].includes('lng:')) {
              lng = parseFloat(lines[j].match(/lng: ([\d.-]+)/)[1]);
            }
            if (lines[j].includes('zoom:')) {
              zoom = parseInt(lines[j].match(/zoom: (\d+)/)[1]);
            }
          }

          if (lat && lng && zoom) {
            locations.push({ name, lat, lng, zoom });
          }
        }
      }
    }

    const select = document.getElementById('loc-select');
    locations.forEach((loc, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = loc.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      if (e.target.value === '') return;
      const loc = locations[parseInt(e.target.value)];
      map.flyTo({ center: [loc.lng, loc.lat], zoom: loc.zoom });
    });
  } catch (e) {
    console.error('Failed to load locations:', e);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function init() {
  const mode = await detectMode();

  if (mode === 'pmtiles') {
    await initPMTilesMode();
  } else {
    initTileServerMode();
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
