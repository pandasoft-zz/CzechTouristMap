# Maps

The project has two maps. Both use the same PMTiles data and the same layers (`style/layers/`).
They differ only in the theme file in `style/themes/`: colours, widths, zoom levels and labels.

| Id | Name in the viewer | Basis | Theme file | Production style |
|---|---|---|---|---|
| `tourist` | Turistická | project design manuals; default map | `style/themes/tourist.mjs` | `dist/style-tourist.json` |
| `topo` | Topografická | inspired by the ČÚZK topographic map ZTM10 | `style/themes/topo.mjs` | `dist/style-topo.json` |

Use the id everywhere: in the code, in file names and in render output (`out/praha-z13-topo.png`).

## Use

- Viewer: pick the map in the *Mapa* list, or open `?variant=topo`.
- Side by side: open *Porovnat mapy* (`/compare.html`). Both maps move together.
- Render: `node tools/czmap.mjs render --place snezka --variant all` (one image per map)
- Render side by side: `node tools/czmap.mjs render --place praha --compare --size 1600x800`
- Production styles: `node tools/czmap.mjs style --tiles https://example.com/map` writes both files.

## Turistická (`tourist`)

Sources: [design-manual-project.md](design-manual-project.md) (colours, widths, zooms) and
[design-manual-typography.md](design-manual-typography.md) (labels).

These values differ from the manuals on purpose. They come from the first MapLibre style of the project:

| Element | Manual | Map | Why |
|---|---|---|---|
| Buildings | from z15 | from z13 | Settlements show their shape earlier |
| Protected areas | solid line with glow, `#588D42` / `#FF956A` | thin dashed line, light national park wash | The glow was too heavy around small reserves |
| Water | `#B8D8F0`, labels `#2060A0` / `#4040FF` | `#A9D3F2`, labels `#1B5FA8` | Water stands out better |
| Hiking routes | from z11 | from z9 (main routes) | Main routes are visible in the overview |
| Peak names | bold | italic | Peaks are less dominant |
| Pedestrian streets and squares | dark grey `#707070` lines, half width; squares not drawn | one light surface `#F7F3EC`: squares as areas, streets in the same colour without outline | Dark streets looked heavy in town centres |
| Motorways, expressways | red `#D42020`, casing `#880000` | green `#6DB85A`, casing `#2F6E2A` | Red was too loud in towns |
| Road numbers | all road classes | only motorways and roads with one- or two-digit numbers | II. and III. class numbers are not useful for hiking |
| Road number shields | halo around text; II./III. class green `#008700` | real shields with padding; motorway green, II./III. class in road colour | More room around numbers; II./III. shields do not look like motorway shields |

The manuals do not cover boundaries, hillshading and cycle routes. These values are our own choice.
The hillshading is strong and stays strong at large zoom, so steep valley sides read as steep.

## Topografická (`topo`)

The map is **inspired** by the ČÚZK topographic map ZTM10. It uses the ZTM10 colours and label rules, but it
does not follow the ZTM10 standard: the data, the zoom levels and the tourist overlays are different.
The colours are read from [standards/vysvetlivky_ZTM10.pdf](standards/vysvetlivky_ZTM10.pdf), see
section 10 of [design-manual-cuzk.md](design-manual-cuzk.md).

Taken from ZTM10: white background, pale forest `#CCE7D0`, cyan water `#BEE7FB` / `#00AEEF`,
orange and yellow roads with grey casings, grey tracks and paths, pink boundaries, olive protected area
boundaries, town and hill names in upper case, red-brown hill names and spot heights,
the label fonts of the ZTM10 legend (see [fonts/README.md](../fonts/README.md)).

Not like ZTM10:

- ZTM10 shows terrain with contours. The data has no contours, so the map uses hillshading instead.
- ZTM10 has no hiking and cycle routes. The map draws them like the tourist map (KČT colours).
- ZTM10 is a 1:10 000 map. Here, buildings and details appear by web zoom levels.
- Patterns and symbols (wetland hatching, rocks, tree symbols) are not drawn; light tints stand in.
- Arial and Arial Narrow are commercial fonts. The metric-compatible Liberation Sans and Liberation Sans Narrow
  (folders `TopoSans*`) stand in for them. Barlow Condensed and Roboto Light are the ZTM10 fonts.

## Shared rules

- Contours (group `contours`): every 10 m from z13, 50 m from z12, 100 m from z11; 50 m lines are thicker
  and carry the height. Tourist map: `#C07030` / `#D09060` (project manual), topographic map: `#E9BC9A` (ZTM10).
- Waterways are drawn under water areas. A river with an area shows no centre line.
- Bridges have a thin grey outline instead of the road casing. It ends at the bridge and does not cover the road.
- Railways are thin. Sidings and yard tracks (`service`) are thinner and lighter, so large stations stay readable.
  Tram lines are a thin line with small cross ties (from z15).
- Number shields use the `shield` image from the sprite: all road numbers in the tourist map, only motorway
  and expressway numbers (green) in the topographic map. Cycle route numbers have a yellow halo, no shield.

## Shared limits

- The tourist map uses Noto Sans Regular, Bold and Italic. Bold italic and serif labels from the manuals are
  drawn in italic or bold.
- The sprite has only the shield image so far, so area patterns and peak triangles are not drawn.
- The data has no capital flag. The capital rule matches the name "Praha".
