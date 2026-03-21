// All API calls go through nginx proxy → tile-server
const API = '/api';

// ── Map init ──────────────────────────────────────────────────────────────────

const map = L.map('map', {
  center: [49.8, 15.5],   // Střed České republiky
  zoom: 7,
  zoomControl: true,
});

let tileLayer = null;

// ── Theme management ──────────────────────────────────────────────────────────

const themeSelect = document.getElementById('theme-select');
const statusDot   = document.getElementById('status-dot');
const statusText  = document.getElementById('status-text');

function setStatus(state, text) {
  statusDot.className = 'dot dot-' + state;
  statusText.textContent = text;
}

/**
 * Recreates the Leaflet tile layer so all tiles are re-fetched
 * (needed after theme switch because tile URLs use a cache-buster).
 */
function reloadTileLayer() {
  if (tileLayer) {
    map.removeLayer(tileLayer);
  }
  const cacheBuster = Date.now();
  tileLayer = L.tileLayer(`${API}/tiles/{z}/{x}/{y}.png?t=${cacheBuster}`, {
    tileSize: 256,
    minZoom: 2,
    maxZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Rendered with <a href="https://mapsforge.org">Mapsforge</a>',
    errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=', // 1px transparent
  });

  tileLayer.on('tileload', () => setStatus('ok', `Téma: ${themeSelect.value}`));
  tileLayer.on('tileerror', (e) => {
    // 204 = tile outside map bounds – not a real error
    if (e.tile.src.includes('data:')) return;
    setStatus('error', 'Chyba načítání dlaždic');
  });

  tileLayer.addTo(map);
}

/**
 * Tells the server to switch theme, then reloads tiles.
 */
async function selectTheme(themeName) {
  if (!themeName) return;
  setStatus('loading', `Přepínám na ${themeName}…`);
  try {
    const res = await fetch(`${API}/themes/select/${encodeURIComponent(themeName)}`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    reloadTileLayer();
    setStatus('ok', `Téma: ${themeName}`);
  } catch (err) {
    setStatus('error', 'Chyba přepnutí tématu: ' + err.message);
  }
}

themeSelect.addEventListener('change', () => selectTheme(themeSelect.value));

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function init() {
  setStatus('loading', 'Připojování k serveru…');

  // 1. Check server health
  let health;
  try {
    const res = await fetch(`${API}/health`);
    health = await res.json();
  } catch {
    setStatus('error', 'Server nedostupný – je spuštěn Docker?');
    return;
  }

  if (!health.mapLoaded) {
    setStatus('nomap', 'Map soubor nenalezen – viz maps/README.md');
  }

  // 2. Fetch available themes
  let themes = [];
  try {
    const res = await fetch(`${API}/themes`);
    themes = await res.json();
  } catch {
    setStatus('error', 'Nelze načíst seznam témat');
  }

  // 3. Populate theme dropdown
  themeSelect.innerHTML = '';
  if (themes.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- žádná témata --';
    themeSelect.appendChild(opt);
  } else {
    themes.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      // Strip .xml extension for display
      opt.textContent = name.replace(/\.xml$/i, '');
      themeSelect.appendChild(opt);
    });

    // Pre-select the server's current theme
    if (health.currentTheme) {
      themeSelect.value = health.currentTheme;
    }
  }

  // 4. Start rendering tiles
  if (health.mapLoaded) {
    reloadTileLayer();
    setStatus('ok', `Téma: ${themeSelect.value}`);
  } else {
    setStatus('nomap', 'Stáhněte .map soubor – viz README');
  }
}

// ── Info box (zoom + coords) ──────────────────────────────────────────────────

const zoomInfo  = document.getElementById('zoom-info');
const coordInfo = document.getElementById('coords-info');

map.on('zoomend', () => {
  zoomInfo.textContent = `zoom: ${map.getZoom()}`;
});
map.on('mousemove', (e) => {
  const { lat, lng } = e.latlng;
  coordInfo.textContent = `lat: ${lat.toFixed(5)}  lng: ${lng.toFixed(5)}`;
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();
