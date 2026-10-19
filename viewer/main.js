// Map viewer for local testing.
//
// URL parameters:
//   ?render=1            hide UI; set window.__mapIdle when all tiles are drawn (used by "czmap render")
//   ?layers=base,relief  visible layer groups (default: all)
//   ?variant=topo        map: tourist or topo (default: last choice, else the server default)
//   #zoom/lat/lon        map position

import * as maplibregl from '/vendor/maplibre-gl/maplibre-gl.mjs';

const GROUPS = ['base', 'relief', 'contours', 'hiking', 'cycling'];
const STORAGE_KEY = 'czmap.layers';
const VARIANT_KEY = 'czmap.variant';

const params = new URLSearchParams(location.search);
const renderMode = params.has('render');
const panel = document.getElementById('panel');
const status = document.getElementById('status');

window.__mapErrors = [];
window.__mapIdle = false;

if (renderMode) {
  document.body.classList.add('render');
}

const protocol = new pmtiles.Protocol({ metadata: true });
maplibregl.addProtocol('pmtiles', protocol.tile);

function initialGroups() {
  if (params.has('layers')) {
    return new Set(params.get('layers').split(',').filter(Boolean));
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      return new Set(saved);
    }
  } catch {
    // Storage may be blocked; use defaults.
  }
  return new Set(GROUPS);
}

function initialVariant() {
  if (params.has('variant')) {
    return params.get('variant');
  }
  try {
    return localStorage.getItem(VARIANT_KEY);
  } catch {
    return null;
  }
}

let variant = initialVariant();
const styleUrl = () => `/style.json?${variant ? `variant=${encodeURIComponent(variant)}&` : ''}t=${Date.now()}`;

const visible = initialGroups();
for (const group of GROUPS) {
  panel.elements[group].checked = visible.has(group);
}

const map = new maplibregl.Map({
  container: 'map',
  style: styleUrl(),
  center: [15.5, 49.8],
  zoom: 7,
  hash: true,
  maxBounds: [[10.5, 47.8], [20.5, 51.8]],
  attributionControl: { compact: false },
  fadeDuration: renderMode ? 0 : 300,
  canvasContextAttributes: { preserveDrawingBuffer: renderMode },
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

function applyGroups() {
  const style = map.getStyle();
  if (!style) {
    return;
  }
  for (const layer of style.layers) {
    const group = layer.metadata?.group;
    if (group) {
      map.setLayoutProperty(layer.id, 'visibility', visible.has(group) ? 'visible' : 'none');
    }
  }
}

map.on('style.load', applyGroups);

map.on('error', (event) => {
  const message = event.error?.message || String(event.error);
  window.__mapErrors.push(message);
  console.error(message);
});

// In render mode wait until the style and all tiles are loaded and drawn.
if (renderMode) {
  map.once('load', () => {
    map.once('idle', () => {
      window.__mapIdle = true;
    });
  });
}

function updateStatus() {
  const c = map.getCenter();
  status.textContent = `z ${map.getZoom().toFixed(2)} | ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
}
map.on('move', updateStatus);
map.on('load', updateStatus);

panel.addEventListener('change', (event) => {
  const name = event.target.name;
  if (GROUPS.includes(name)) {
    if (event.target.checked) {
      visible.add(name);
    } else {
      visible.delete(name);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...visible]));
    } catch {
      // Storage may be blocked; ignore.
    }
    applyGroups();
  } else if (name === 'tiles') {
    map.showTileBoundaries = event.target.checked;
  }
});

function reloadStyle() {
  map.setStyle(styleUrl(), { diff: false });
}

// Without a variant the server sends its default map.
// Fill the variant list from the server. The first entry is the default.
fetch('/variants.json')
  .then((res) => res.json())
  .then((variants) => {
    const select = panel.elements.variant;
    // A saved variant may not exist any more (renamed or removed).
    if (variant && !variants.some((v) => v.id === variant)) {
      variant = null;
      reloadStyle();
    }
    variant ??= variants[0].id;
    for (const v of variants) {
      select.add(new Option(v.name, v.id, false, v.id === variant));
      select.lastElementChild.title = v.description;
    }
  })
  .catch((err) => console.error(err));

panel.elements.variant.addEventListener('change', (event) => {
  variant = event.target.value;
  try {
    localStorage.setItem(VARIANT_KEY, variant);
  } catch {
    // Storage may be blocked; ignore.
  }
  const query = new URLSearchParams(location.search);
  query.set('variant', variant);
  history.replaceState(null, '', `?${query}${location.hash}`);
  reloadStyle();
});

// Keep the map position when opening the comparison view.
document.getElementById('compare').addEventListener('click', (event) => {
  event.currentTarget.href = `compare.html${location.hash}`;
});
document.getElementById('reload').addEventListener('click', reloadStyle);
document.addEventListener('keydown', (event) => {
  if (event.key === 'r' && !event.ctrlKey && !event.metaKey && event.target === document.body) {
    reloadStyle();
  }
});

// Feature inspector: click on the map to see source layer and attributes.
map.on('click', (event) => {
  if (!panel.elements.inspect.checked) {
    return;
  }
  const features = map.queryRenderedFeatures(event.point);
  const seen = new Set();
  const rows = [];
  for (const f of features) {
    const key = `${f.sourceLayer}|${JSON.stringify(f.properties)}`;
    if (seen.has(key) || !f.sourceLayer) {
      continue;
    }
    seen.add(key);
    const props = Object.entries(f.properties).map(([k, v]) => `${k}=${v}`).join('<br>');
    rows.push(`<b>${f.source}/${f.sourceLayer}</b>${props || '(no attributes)'}`);
  }
  new maplibregl.Popup({ maxWidth: '280px' })
    .setLngLat(event.lngLat)
    .setHTML(`<div class="inspect">${rows.join('') || 'Nothing here'}</div>`)
    .addTo(map);
});

window.map = map;
