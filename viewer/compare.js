// Side-by-side comparison of the maps. All maps share one position.
//
// URL parameters:
//   ?variants=tourist,topo  maps to show (default: all)
//   ?render=1               hide UI; set window.__mapIdle when all maps are drawn
//   #zoom/lat/lon           map position

import * as maplibregl from '/vendor/maplibre-gl/maplibre-gl.mjs';

const params = new URLSearchParams(location.search);
const renderMode = params.has('render');
const grid = document.getElementById('grid');
const status = document.getElementById('status');

window.__mapErrors = [];
window.__mapIdle = false;

if (renderMode) {
  document.body.classList.add('render');
}

const protocol = new pmtiles.Protocol({ metadata: true });
maplibregl.addProtocol('pmtiles', protocol.tile);

function parseHash() {
  const [zoom, lat, lon] = location.hash.slice(1).split('/').map(Number);
  if ([zoom, lat, lon].some(Number.isNaN)) {
    return { zoom: 7, center: [15.5, 49.8] };
  }
  return { zoom, center: [lon, lat] };
}

const all = await fetch('/variants.json').then((res) => res.json());
const wanted = params.get('variants')?.split(',').filter(Boolean);
const variants = wanted ? all.filter((v) => wanted.includes(v.id)) : all;
const start = parseHash();
const maps = [];

for (const v of variants) {
  const cell = document.createElement('section');
  cell.className = 'cell';
  const name = document.createElement('a');
  name.className = 'name';
  name.textContent = v.name;
  const small = document.createElement('small');
  small.textContent = v.description;
  name.append(small);
  name.addEventListener('click', () => {
    name.href = `index.html?variant=${v.id}${location.hash}`;
  });
  name.href = `index.html?variant=${v.id}`;
  const container = document.createElement('div');
  container.className = 'map';
  cell.append(name, container);
  grid.append(cell);

  const map = new maplibregl.Map({
    container,
    style: `/style.json?variant=${encodeURIComponent(v.id)}`,
    center: start.center,
    zoom: start.zoom,
    maxBounds: [[10.5, 47.8], [20.5, 51.8]],
    attributionControl: false,
    fadeDuration: renderMode ? 0 : 300,
    canvasContextAttributes: { preserveDrawingBuffer: renderMode },
  });
  map.on('error', (event) => {
    const message = `${v.id}: ${event.error?.message || String(event.error)}`;
    window.__mapErrors.push(message);
    console.error(message);
  });
  maps.push(map);
}

maps[0]?.addControl(new maplibregl.NavigationControl(), 'top-right');
maps[0]?.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

// Copy the camera of the map the user moves to all other maps.
let syncing = false;
for (const map of maps) {
  map.on('move', () => {
    if (syncing) {
      return;
    }
    syncing = true;
    const camera = { center: map.getCenter(), zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
    for (const other of maps) {
      if (other !== map) {
        other.jumpTo(camera);
      }
    }
    syncing = false;
  });
  map.on('moveend', () => {
    const c = map.getCenter();
    const hash = `#${map.getZoom().toFixed(2)}/${c.lat.toFixed(5)}/${c.lng.toFixed(5)}`;
    history.replaceState(null, '', `${location.search}${hash}`);
    status.textContent = `z ${map.getZoom().toFixed(2)} | ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
  });
}

// In render mode wait until every map is loaded and drawn.
if (renderMode) {
  Promise.all(maps.map((map) => new Promise((resolve) => {
    map.once('load', () => map.once('idle', resolve));
  }))).then(() => {
    window.__mapIdle = true;
  });
}

window.maps = maps;
