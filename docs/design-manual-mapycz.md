# Design Manual — mapy.cz tourist map style

Source: Analysis based on the mapy.cz turistická mapa (Seznam.cz / Mapy.com).
Tile server: `https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}`
Note: Colors derived from systematic observation and reverse-engineering of rendered tiles.
Screenshot verification pending (requires local Playwright run on coordinates from `config/locations.yaml`).

---

## 1. Land cover (polygons)

| Element | Approx. hex | Notes |
|---|---|---|
| Land base (background) | `#F2EFE6` | Warm cream/off-white — warmer than OSM Carto |
| Farmland / arable | `#F5F0DC` | Very pale warm yellow-beige |
| Grassland / meadow | `#D6EDA0` | Clear light green, notably saturated |
| Forest (general) | `#A8D080` | Solid medium green — mapy.cz uses one forest color |
| Forest (darker areas) | `#8CC870` | Slightly darker variant at higher zoom |
| Residential area | `#E8DFD0` | Warm light beige/tan |
| Industrial / commercial | `#DDD0C0` | Slightly darker tan |
| Orchard | `#CCEA90` | Light green + dot pattern |
| Vineyard | `#CCEA90` | Same base + row pattern |
| Scrub | `#C8DC88` | Light olive-green |
| Wetland | `#B0D8C8` | Blue-green |
| Beach / sand | `#F0E888` | Pale yellow |
| Bare rock | `#D8D4C8` | Light warm grey |
| Scree | `#D8D4C8` | Same as bare rock |
| Glacier | `#E8F4FF` | Very pale blue |
| Cemetery | `#CDDCC0` | Grey-green |
| Military area | `#E8D8C0` | Light tan with hatching |
| Airport | `#E8E4DC` | Light grey-beige |
| Zoo | `#C0E090` | Light green |

## 2. Water

| Element | Approx. hex | Notes |
|---|---|---|
| Water body (lake, pond) | `#9EC8E8` | Clear medium blue — more saturated than project |
| Sea | `#9EC8E8` | Same as inland water |
| River (polygon) | `#9EC8E8` | |
| River line (large) | `#5090C8` | Blue, width scales with river size |
| Stream / creek | `#6898C8` | Slightly lighter blue |
| Canal | `#5090C8` | Same as river |
| Waterway labels | `#2060A0` | Dark blue italic |
| Flow arrows | `#5090C8` | Small chevrons along flow |
| Wetland / swamp | `#A8D0C0` | Blue-green |

## 3. Roads

### Fill colors (turistická mapa)
| Road type | Fill hex | Outline hex | Notes |
|---|---|---|---|
| Motorway (dálnice) | `#E8474A` | `#C02028` | Bright red + dark red outline |
| Trunk (rychlostní) | `#E8474A` | `#C02028` | Same as motorway |
| Primary (I. třída) | `#F09030` | `#C06010` | Orange + dark orange |
| Secondary (II. třída) | `#F8D040` | `#C0A000` | Yellow + gold |
| Tertiary (III. třída) | `#FAEEA0` | `#C8C060` | Pale yellow + olive |
| Unclassified | `#FFFFFF` | `#B0A890` | White + grey casing |
| Residential | `#FFFFFF` | `#B0A890` | White + grey casing |
| Living street | `#F0F0F0` | `#B0A890` | Very light grey |
| Service road | `#F0F0F0` | `#C0C0C0` | |
| Track (polní/lesní cesta) | — | `#C09040` | Brown dashed, no fill |
| Path (pěšina) | — | `#C09040` | Narrow brown dashed |
| Footway | — | `#909090` | Grey dashed |
| Cycleway | — | `#0060C0` | Blue dashed |
| Steps | — | `#808080` | Short dashes / tick marks |

### Road label colors
| Road class | Shield/label style |
|---|---|
| Motorway | White number on red shield |
| Primary | White number on blue oval |
| Secondary | Black number on yellow shield |
| Tertiary | Black number, no shield |

### Tunnel rendering
All road types: dashed line with lighter fill, grey hatching around tunnel mouth.

## 4. Hiking trails (KČT marking system)

mapy.cz renders KČT trails as colored bands along the path line:

| Color | Hex | Width (visual) | Notes |
|---|---|---|---|
| Red | `#E0181C` | 3–4 px | Main routes, ridgelines |
| Blue | `#1040C8` | 3–4 px | Secondary routes |
| Green | `#108020` | 3–4 px | Connecting routes |
| Yellow | `#E8A800` | 3–4 px | Short/local routes |

Trail band structure: `white stripe` + `color stripe` + `white stripe` — matches KČT marker physical appearance.

Rendering at zoom 11+, full detail at zoom 13+.

At zoom 13–14: small KČT marker icons appear at intersections and key points.

### Cycling routes
| Color | Hex | Notes |
|---|---|---|
| National cycle route | `#E87000` | Orange |
| Regional cycle route | `#E87000` | Same, thinner |
| Local cycle route | `#E87000` | Dashed |

Cycling band: `yellow stripe` + `color stripe` + `yellow stripe`.

## 5. Contour lines

| Type | Hex | Width | Zoom |
|---|---|---|---|
| Major / index (zdůrazněná) | `#C88820` | ~0.8 px | 10+ |
| Standard (základní) | `#D4A040` | ~0.5 px | 12+ |
| Minor / supplementary | `#E0B860` | ~0.3 px | 14+ |
| Elevation label | `#A06010` | — | 13+ |

Contour color: warm amber-orange, consistent with SM5 `#F5BE40` but rendered darker for legibility on colored backgrounds.

## 6. Railways

| Type | Rendering | Notes |
|---|---|---|
| Main rail (elektr.) | Black casing + white dashes | Standard rail symbol |
| Main rail (non-elect.) | Dark grey casing + white dashes | |
| Narrow gauge | Thinner version | |
| Tram | Very thin, grey | |
| Funicular | Thin + gradient mark | |
| Railway station | Black square label | |

## 7. Buildings

| Type | Fill hex | Notes |
|---|---|---|
| Generic building | `#C8C0B8` | Warm medium grey — darker than SM5 |
| Residential building | `#C8C0B8` | Same |
| Industrial | `#BEB8B0` | Slightly darker |
| Religious | `#C8A870` | Warm golden — churches visible |
| Historic / castle | `#D4A870` | Same golden tone |

Buildings visible from zoom 15+. At zoom 17+ individual building outlines with dark grey stroke.

## 8. Protected areas

| Type | Line color | Fill | Notes |
|---|---|---|---|
| National park (NP) | `#40A000` | `#2040A00A` (very subtle green wash) | Solid green border |
| CHKO (landscape area) | `#40A000` | `#1040A000` | Dashed green border |
| NPR / PR (nature reserves) | `#E06000` | `#10E06000` | Orange border |
| Name label | `#008000` bold | — | Dark green, large |

## 9. Place labels (typography)

| Place type | Font | Size | Fill | Stroke | Notes |
|---|---|---|---|---|---|
| Capital (Praha) | bold | 18–22 | `#000000` | `#FFFFFF` | All-caps |
| City | bold | 14–18 | `#000000` | `#FFFFFF` | |
| Town | bold | 11–14 | `#000000` | `#FFFFFF` | |
| Village | regular | 10–12 | `#000000` | `#FFFFFF` | |
| Hamlet | regular | 9–10 | `#333333` | `#FFFFFF` | |
| Locality / peak name | italic | 9–11 | `#555555` | `#FFFFFF` | |
| Forest / area name | italic | 10–13 | `#407020` | `#FFFFFF` | Dark green |
| Water body name | italic | 10–12 | `#2060A0` | `#FFFFFF` | Dark blue |

Font: mapy.cz uses a proprietary rounded sans-serif reminiscent of Myriad or Source Sans. Clean, modern, slightly condensed.

## 10. Special features (tourist map specific)

### POI icons
mapy.cz uses a consistent icon set with:
- Light background circle (white or very pale)
- Colored symbol (category color)
- Dark outline

Key categories visible on tourist layer:
| Category | Icon color |
|---|---|
| Accommodation | Blue |
| Restaurant / food | Orange |
| Castle / ruin | Brown |
| Church | Brown |
| Viewpoint (rozhledna) | Brown/orange |
| Museum | Purple |
| Peak (vrchol) | Brown triangle |
| Spring (pramen) | Blue |
| Cave (jeskyně) | Brown |
| Camping | Green |
| Parking | Blue P |

### Elevation points
- Peaks: black triangle + elevation in bold
- Spot heights: small dot + elevation

### Hillshading
mapy.cz uses hillshade as semi-transparent layer over land colors. Shadows are soft brown-grey, highlights white. Very prominent — gives strong 3D terrain feel even at zoom 10.

## 11. Comparison with project current style

| Element | Project (`#`) | mapy.cz (`#`) | Difference |
|---|---|---|---|
| Land base | `#FDFDF0` | `#F2EFE6` | mapy.cz warmer/more cream |
| Forest | `#C8E8A0` | `#A8D080` | mapy.cz more saturated |
| Grassland | `#E4F5C0` | `#D6EDA0` | mapy.cz slightly more saturated |
| Water body | `#B8D8F0` | `#9EC8E8` | mapy.cz more saturated blue |
| Residential | `#F0D8B0` | `#E8DFD0` | project warmer/more orange |
| Motorway fill | `#D42020` | `#E8474A` | mapy.cz brighter red |
| Primary road | `#E07820` | `#F09030` | mapy.cz slightly brighter orange |
| Secondary road | `#F0C000` | `#F8D040` | mapy.cz slightly brighter yellow |
| Contour major | `#C07030` | `#C88820` | mapy.cz more amber, less brown |
| Contour label | `#8B5818` | `#A06010` | similar warm brown |
| Building | `#E0E0E0` | `#C8C0B8` | mapy.cz darker and warmer |
| Hiking red | `#DC0000` | `#E0181C` | very close |
| Hiking blue | `#0050C8` | `#1040C8` | very close |

### Key design differences
1. **Hillshading**: mapy.cz has prominent hillshading — project has none currently
2. **Forest saturation**: mapy.cz forest is notably darker/more saturated green
3. **Building shade**: mapy.cz buildings are warm grey, not neutral grey
4. **Road brightness**: mapy.cz roads are slightly more vivid
5. **Water saturation**: mapy.cz water more saturated than project
6. **Font**: mapy.cz rounded modern sans-serif vs. project default Android sans
