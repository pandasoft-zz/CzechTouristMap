// Czech Tourist Map loader, published as https://maps.gotrasio.cz/map.js (docs/publishing.md).
//
//   <div id="map" style="height: 500px"></div>
//   <script src="https://maps.gotrasio.cz/map.js"></script>
//   <script>
//     CzechTouristMap.createMap('map', { style: 'topo', center: [16.6, 49.2], zoom: 12 });
//   </script>
//
// The loader reads latest.json, loads MapLibre and PMTiles from the same host, registers the
// tiles:// protocol for the live version and creates a maplibregl.Map.
//
// This file is a template: "czmap release" replaces the __NAMES__ and inserts viewer/tiles.js.
(function () {
  const HOST = '__HOST__';
  const LIBS = {
    maplibre: `${HOST}/lib/maplibre-gl@__MAPLIBRE__/maplibre-gl.mjs`,
    maplibreCss: `${HOST}/lib/maplibre-gl@__MAPLIBRE__/maplibre-gl.css`,
    pmtiles: `${HOST}/lib/pmtiles@__PMTILES__/pmtiles.js`,
  };

  /* __TILES_JS__ */

  let catalogPromise;
  let libsPromise;
  let tilesPromise;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Cannot load ${src}`));
      document.head.append(script);
    });
  }

  function loadCss(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.append(link);
    }
  }

  /** Catalog of the live version (latest.json), loaded once per page. */
  function getCatalog() {
    catalogPromise ??= fetch(`${HOST}/latest.json`).then((res) => {
      if (!res.ok) {
        throw new Error(`${HOST}/latest.json: ${res.status}`);
      }
      return res.json();
    });
    return catalogPromise;
  }

  /** MapLibre module: the one passed in, or the copy on the map host. */
  function loadLibs(own) {
    libsPromise ??= (async () => {
      const pmtilesReady = window.pmtiles ? Promise.resolve() : loadScript(LIBS.pmtiles);
      let maplibregl = own;
      if (!maplibregl) {
        loadCss(LIBS.maplibreCss);
        maplibregl = await import(LIBS.maplibre);
      }
      await pmtilesReady;
      return maplibregl;
    })();
    return libsPromise;
  }

  /**
   * Create the map.
   * @param {string|HTMLElement} container element or its id
   * @param {object} [options] style: 'tourist' (default) or 'topo'; maplibregl: own MapLibre module;
   *                           all other options go to new maplibregl.Map (center, zoom, ...)
   * @returns {Promise<object>} the maplibregl.Map
   */
  async function createMap(container, options = {}) {
    const { style = 'tourist', maplibregl: own, ...mapOptions } = options;
    const [catalog, maplibregl] = await Promise.all([getCatalog(), loadLibs(own)]);
    api.maplibregl = maplibregl;
    // The protocol is global in MapLibre: register it once, for the version of this page.
    tilesPromise ??= registerTiles(maplibregl, catalog.baseUrl);
    const regions = await tilesPromise;

    const styleInfo = catalog.styles[style];
    if (!styleInfo) {
      throw new Error(`Unknown style "${style}". Styles: ${Object.keys(catalog.styles).join(', ')}`);
    }
    const view = catalog.countries[0]?.view ?? {};
    const [west, south, east, north] = regions.bounds;
    return new maplibregl.Map({
      container,
      style: styleInfo.url,
      center: view.center,
      zoom: view.zoom,
      maxBounds: [[west - 2, south - 2], [east + 2, north + 1]],
      ...mapOptions,
    });
  }

  // registerTiles is for pages that create the map themselves (see docs/publishing.md).
  const api = { createMap, getCatalog, registerTiles, maplibregl: null };
  window.CzechTouristMap = api;
})();
