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

const statusDot   = document.getElementById('status-dot');
const statusText  = document.getElementById('status-text');

let currentThemeName = '';

function setStatus(state, text) {
  statusDot.className = 'dot dot-' + state;
  statusText.textContent = text;
}

/**
 * Recreates the Leaflet tile layer so all tiles are re-fetched
 * (needed after theme reload because tile URLs use a cache-buster).
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

  tileLayer.on('tileload', () => setStatus('ok', `Téma: ${currentThemeName}`));
  tileLayer.on('tileerror', (e) => {
    // 204 = tile outside map bounds – not a real error
    if (e.tile.src.includes('data:')) return;
    setStatus('error', 'Chyba načítání dlaždic');
  });

  tileLayer.addTo(map);
}

/**
 * Asks the server to drop its in-memory theme cache so the XML is
 * reloaded from disk on the next tile request, then reloads map tiles.
 */
async function refreshTheme() {
  setStatus('loading', 'Obnova tématu…');
  try {
    const res = await fetch(`${API}/themes/refresh`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    reloadTileLayer();
    setStatus('ok', `Téma: ${currentThemeName}`);
  } catch (err) {
    setStatus('error', 'Chyba obnovy tématu: ' + err.message);
  }
}

document.getElementById('theme-refresh-btn').addEventListener('click', refreshTheme);

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

  // 2. Store current theme name for status display
  currentThemeName = health.currentTheme || '';

  // 3. Start rendering tiles
  if (health.mapLoaded) {
    reloadTileLayer();
    setStatus('ok', `Téma: ${currentThemeName}`);
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

// ── Locations ──────────────────────────────────────────────────────────────────

const locSelect       = document.getElementById('loc-select');
const locEditBtn      = document.getElementById('loc-edit-btn');
const locEditControls = document.getElementById('loc-edit-controls');
const locRemoveBtn    = document.getElementById('loc-remove-btn');
const locAddBtn       = document.getElementById('loc-add-btn');
const locOverlay      = document.getElementById('loc-overlay');
const locFormCoords   = document.getElementById('loc-form-coords');
const locFormMsg      = document.getElementById('loc-form-msg');

let locations = [];

async function loadLocations() {
  try {
    const res = await fetch(`${API}/locations`);
    locations = await res.json();
    const prev = locSelect.value;
    locSelect.innerHTML = locations.map((l, i) => `<option value="${i}">${l.name}</option>`).join('');
    const prevIdx = prev !== '' ? parseInt(prev, 10) : -1;
    if (prevIdx >= 0 && locations[prevIdx]) {
      locSelect.value = prevIdx;
    } else if (locations.length > 0) {
      locSelect.value = '0';
      map.setView([locations[0].lat, locations[0].lng], locations[0].zoom);
    }
  } catch (e) {
    console.warn('Could not load locations', e);
  }
}

locSelect.addEventListener('change', () => {
  const idx = parseInt(locSelect.value, 10);
  if (isNaN(idx)) return;
  const loc = locations[idx];
  if (loc) map.setView([loc.lat, loc.lng], loc.zoom);
});

locEditBtn.addEventListener('click', () => {
  const open = locEditControls.classList.toggle('open');
  locEditBtn.classList.toggle('tb-btn-active', open);
});

locRemoveBtn.addEventListener('click', async () => {
  const idx = parseInt(locSelect.value, 10);
  if (isNaN(idx)) { alert('Select a location first.'); return; }
  const loc = locations[idx];
  if (!confirm(`Remove "${loc.name}"?`)) return;
  const res = await fetch(`${API}/locations?name=${encodeURIComponent(loc.name)}`, { method: 'DELETE' });
  if (res.ok) await loadLocations();
  else alert('Delete failed: ' + res.statusText);
});

locAddBtn.addEventListener('click', () => {
  const center = map.getCenter();
  locFormCoords.textContent =
    `lat ${center.lat.toFixed(5)}, lng ${center.lng.toFixed(5)}, zoom ${map.getZoom()}`;
  locFormMsg.textContent = '';
  document.getElementById('lf-name').value = '';
  document.getElementById('lf-note').value = '';
  locOverlay.style.display = 'flex';
  document.getElementById('lf-name').focus();
});

document.getElementById('lf-cancel').addEventListener('click', () => {
  locOverlay.style.display = 'none';
});

document.getElementById('lf-save').addEventListener('click', async () => {
  const name = document.getElementById('lf-name').value.trim();
  if (!name) { locFormMsg.textContent = 'Name is required.'; locFormMsg.style.color = '#f88'; return; }

  const center = map.getCenter();
  const body = new URLSearchParams({
    name,
    lat:  center.lat.toFixed(6),
    lng:  center.lng.toFixed(6),
    zoom: map.getZoom(),
    note: document.getElementById('lf-note').value.trim(),
  }).toString();

  const res  = await fetch(`${API}/locations`, {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const data = await res.json();
  if (res.ok && data.success) {
    locOverlay.style.display = 'none';
    await loadLocations();
    const newIdx = locations.findIndex(l => l.name === name);
    if (newIdx >= 0) locSelect.value = newIdx;
  } else {
    locFormMsg.textContent = data.error || 'Save failed.';
    locFormMsg.style.color = '#f88';
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
init();
loadLocations();
