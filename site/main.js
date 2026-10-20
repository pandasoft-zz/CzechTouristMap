// Project page: comparison slider and the two live maps.
//
// The live maps use the loader of the map host. ?maps=URL uses another host (for local tests).

// Places of the slider. Images: site/img/<id>-tourist.webp and <id>-topo.webp (tools/site-images.mjs).
const PLACES = [
  { id: 'snezka', name: 'Sněžka', center: [15.7400, 50.7360], zoom: 13 },
  { id: 'moravsky-kras', name: 'Moravský kras', center: [16.7600, 49.2350], zoom: 14 },
  { id: 'cesky-raj', name: 'Český ráj', center: [15.1900, 50.5500], zoom: 14 },
  { id: 'brno', name: 'Brno, centrum', center: [16.6085, 49.1935], zoom: 16 },
  { id: 'praha', name: 'Praha', center: [14.4205, 50.0875], zoom: 13 },
  { id: 'krkonose', name: 'Krkonoše', center: [15.6500, 50.7200], zoom: 11 },
];

const MAPS_HOST = new URLSearchParams(location.search).get('maps') || 'https://maps.gotrasio.cz';

// ---------- Comparison slider ----------

const slider = document.getElementById('slider');
const range = document.getElementById('slider-range');
const tourist = document.getElementById('slider-tourist');
const topo = document.getElementById('slider-topo');
const places = document.getElementById('places');
let currentPlace = PLACES[0];

function setPosition(value) {
  slider.style.setProperty('--pos', `${value}%`);
}

range.addEventListener('input', () => setPosition(range.value));
setPosition(range.value);

function showPlace(place) {
  currentPlace = place;
  tourist.src = `img/${place.id}-tourist.webp`;
  topo.src = `img/${place.id}-topo.webp`;
  tourist.alt = `Turistická mapa: ${place.name}`;
  topo.alt = `Topografická mapa: ${place.name}`;
  for (const button of places.children) {
    button.setAttribute('aria-pressed', String(button.dataset.id === place.id));
  }
}

for (const place of PLACES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'place';
  button.textContent = place.name;
  button.dataset.id = place.id;
  button.addEventListener('click', () => {
    showPlace(place);
    flyLive(place);
  });
  places.append(button);
}
showPlace(PLACES[0]);

// ---------- Live maps ----------

const liveSection = document.getElementById('live');
const status = document.getElementById('live-status');
let liveMaps = [];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Cannot load ${src}`));
    document.head.append(script);
  });
}

function offline() {
  liveSection.classList.add('live-offline');
  status.textContent = 'Živou mapu se nepodařilo načíst: mapový server maps.gotrasio.cz neodpovídá. '
    + 'Ukázky výše jsou z téže mapy.';
}

// Keep both maps at the same view.
function syncMaps(maps) {
  let syncing = false;
  for (const map of maps) {
    map.on('move', () => {
      if (syncing) {
        return;
      }
      syncing = true;
      const view = { center: map.getCenter(), zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
      for (const other of maps) {
        if (other !== map) {
          other.jumpTo(view);
        }
      }
      syncing = false;
    });
  }
}

function flyLive(place) {
  liveMaps[0]?.jumpTo({ center: place.center, zoom: place.zoom });
}

async function startLive() {
  try {
    await loadScript(`${MAPS_HOST}/map.js`);
    const view = { center: currentPlace.center, zoom: currentPlace.zoom, cooperativeGestures: true };
    liveMaps = await Promise.all([
      window.CzechTouristMap.createMap('live-tourist', { ...view, style: 'tourist' }),
      window.CzechTouristMap.createMap('live-topo', { ...view, style: 'topo' }),
    ]);
    const { NavigationControl } = window.CzechTouristMap.maplibregl;
    liveMaps[1].addControl(new NavigationControl({ showCompass: false }), 'top-right');
    syncMaps(liveMaps);
  } catch (err) {
    console.error(err);
    offline();
  }
}

// Load the live maps only when the section comes near the screen.
const observer = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) {
    observer.disconnect();
    startLive();
  }
}, { rootMargin: '600px' });
observer.observe(liveSection);
