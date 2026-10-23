# MapLibre Native (Android, iOS)

The mobile app draws the map with MapLibre Native, the web with MapLibre GL JS. The style format is the
same, but Native does not support everything. A layer that Native cannot read is dropped without an error
on the map; the log only shows a line like `data expressions not supported`.

The styles are built so that both renderers draw the same map.

## Rules

| Problem in Native | How the style avoids it |
|---|---|
| `line-dasharray` from feature data (`case`, `match`) drops the layer | `style/native.mjs` splits such a layer: one layer per dash pattern, the condition goes into the filter. The fallback pattern keeps the layer id, the others get `-dash1`, `-dash2`, … |
| SDF images with stretch areas are drawn 10–15× too big | Shields are not SDF. The sprite has one ready-coloured image per shield colour: `shield-<rrggbb>` (`tools/sprite.mjs`) |
| `hillshade-method: multidirectional` needs Native 13.0+ | Not avoided. The app uses Native 13.7.1; older clients show no relief |

Write layers in `style/layers/` as usual. The split happens in `buildStyle` for all clients, so the web
draws the same layers as Native.

## Checks

- `czmap check` also runs `nativeProblems` from `style/native.mjs`: it fails when a property that Native
  supports only as a constant or by zoom depends on feature data.
- `czmap check-native` loads both styles in MapLibre Native (Node binding `@maplibre/maplibre-gl-native`)
  and fails on every warning or error. It renders a small and a large zoom with empty tiles, so it checks the
  style, not the data. It does not find rendering bugs like the big SDF shields.

`check-native` runs in Docker on every system (ADR 0006), also in CI. The image is in `tools/native/`.
The Node binding is version 6.4.1; its core is close to Native Android 13.x, but not the same. After a large
style change, also open the style in the app and look for `Mbgl` lines in `adb logcat`.

## Offline files

`latest.json` lists the fonts and the sprite under `assets` (see `publishing.md`), so the app does not have to
collect them from the styles.

## Parts

Native has no custom protocols, so the app rewrites the `tiles://<set>/…` sources to `pmtiles://` URLs of the
part files. With more than one part this needs one source per part (ADR 0004, option 1). Not solved yet.
