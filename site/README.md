# site/

Project page, published to GitHub Pages by `.github/workflows/pages.yml` (push to `main` that
changes `site/`). Plain HTML, CSS and JS, no build step.

- `index.html`, `style.css`, `main.js` — the page. Text is in Czech.
- `img/*.webp` — map images, rendered from the local tiles: `node tools/site-images.mjs`.
  The places are listed in `tools/site-images.mjs` and in `PLACES` in `main.js`; keep both lists equal.
- The live maps load `https://maps.gotrasio.cz/map.js`. While the map host is not running, the page
  shows a short note instead. `?maps=http://127.0.0.1:8771` loads the loader from another host
  (for local tests with a release made by `czmap release --base-url` of that host).

Open the page locally with any static server, for example `npx http-server site`.
