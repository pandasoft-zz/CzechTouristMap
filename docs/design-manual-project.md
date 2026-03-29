# Design Manual — CzechTouristMap (current project style)

Source: `src/styles/CzechTouristMap/` XSLT files.
Generated: 2026-03-27.

---

## 1. Land cover (polygons)

| Element | Fill hex | Stroke | Notes |
|---|---|---|---|
| Sea | `#8CC5FF` | — | |
| Land / nosea | `#FDFDF0` | — | Warm off-white base |
| Farmland | `#FFFFE6` | — | Very light warm yellow |
| Residential | `#F0D8B0` | `#C8B080` 0.2 | Warm beige |
| Forest broadleaf | `#C8E8A0` | — | |
| Forest needleleaf | `#A8D880` | — | Cooler/darker than broadleaf |
| Meadow / grassland | `#E4F5C0` | — | Light yellow-green |
| Orchard / vineyard | `#E8F8C0` | — | With SVG pattern overlay |
| Scrub | `#D8F0A8` | — | With SVG pattern overlay |
| Heath | `#EAF5A8` | — | |
| Fell / alpine meadow | `#E8F5E0` | — | Very light green |
| Beach / sand | `#F5F0A0` | — | |
| Scree | `#E8E4DC` | — | With SVG pattern overlay |
| Shingle / bare rock | `#E0DCD8` | — | |
| Farmyard | `#D8D4A8` | — | Warm tan |
| Quarry | `#E0E4E0` | — | |
| Mud | `#AEAE97` | — | |
| Glacier | `#E0F4FF` | — | Very pale blue-white |
| Allotments | `#80FFF8C5` | — | Semi-transparent |

## 2. Water (polygons + lines)

| Element | Color hex | Notes |
|---|---|---|
| Water body (lake, pond) | `#B8D8F0` | Soft medium blue |
| Reservoir / basin | `#B8D8F0` | |
| Riverbank | `#B8D8F0` | |
| Tidal water | `#C8ECF0` | Lighter blue |
| Wetland / reedbed | `#C0E8E0` | Blue-green |
| Swamp | `#B0D890` | Green-blue |
| Tidalflat | `#B8FCF8` | Very light cyan |
| River line | `#5080C0` | Medium blue |
| Stream / canal | `#5080C0` | |
| Drain | `#90C8E8` | Lighter blue |
| Water label | `#0050A0` | Italic font |

## 3. Roads (lines)

### Fill colors
| Road type | Fill hex | Notes |
|---|---|---|
| Motorway / trunk | `#D42020` | Red |
| Trunk link | `#E07030` | Orange-red |
| Primary | `#E07820` | Orange |
| Secondary | `#F0C000` | Yellow |
| Tertiary | `#F5E040` | Pale yellow |
| 4WD road | `#C8A060` | Warm brown |
| Unclassified | `#FFFFFF` | White |
| Residential | `#FFFFFF` | White |
| Living street | `#FFFFFF` | White |
| Service | `#FFFFFF` | White |
| Cycleway | `#FFFFFF` | White |
| Raceway | `#909090` | Grey |
| Macadam (unpaved) | `#FFFFFF` | White |
| Track / path | `#8C5A1E` | Warm brown |
| Bridleway | `#8C5A1E` | |
| Mountain path | `#6A4010` | Darker brown |
| Alpine path | `#404040` | Dark grey |
| Steps | `#A02030` | Dark red |
| Ferrata | `#C00000` | Red |
| Pedestrian | `#707070` | Grey |
| Footway | `#606060` | Dark grey |

### Outline (casing) colors
| Road type | Outline hex |
|---|---|
| Motorway / trunk | `#880000` |
| Primary | `#904400` |
| Secondary | `#907000` |
| Tertiary | `#909000` |
| Unclassified | `#606060` |
| Residential / living / service | `#707070` |
| Cycleway | `#0040A0` |

### Tunnel variants (desaturated/lighter)
| Road | Tunnel fill |
|---|---|
| Motorway / trunk | `#E87070` |
| Primary | `#F0B878` |
| Secondary | `#F8E080` |
| Tertiary | `#F8F090` |
| Local | `#E8E8E8` |

### Line widths (base units, scaleable)
| Type | Width |
|---|---|
| Motorway / trunk | 2.8 |
| Primary | 3.0 |
| Secondary | 2.8 |
| Tertiary | 2.5 |
| Residential | 2.0 |
| Unclassified | 2.5 |
| Service | 2.2 |
| Track | 0.65 |
| Path | 0.65 |
| Footway | 0.2 |

## 4. Hiking trails

| Color | Hex | KČT meaning |
|---|---|---|
| Blue | `#0050C8` | Secondary route |
| Red | `#DC0000` | Main / summit route |
| Green | `#007820` | Connecting route |
| Yellow | `#E8B400` | Short / connecting |
| Purple | `#8020A0` | Special |
| Orange | `#E06000` | Special |
| Black | `#303030` | |

Dash patterns for highlight overlay: `6,9` (L0) → `22,33` (L4)

## 5. Contour lines

| Type | Color hex | Width (base) | Zoom |
|---|---|---|---|
| Major (index) | `#C07030` | 0.45–0.7 | 10+ |
| Medium | `#D09060` | 0.3–0.5 | 11+ |
| Minor (auxiliary) | `#80E0B080` | 0.3 | 14+ |
| Elevation label | `#8B5818` | — | 13+ |

## 6. Railways

| Type | Colors |
|---|---|
| Active rail | `#404040` (dark casing) + `#F8FCF8` (light fill) + dashed overlay |
| Disused rail | `#949494` grey |
| Tunnel rail | dashed `#404040` / `#949494` |

## 7. Protected areas

| Type | Line color | Notes |
|---|---|---|
| National park | `#588d42` (solid) + `#40588d42` (glow) | Green |
| Protected area (major) | Same as NP | |
| Strictly protected (class 1) | `#FF956A` (solid) + `#40FF956A` (glow) | Orange |
| Name label NP | `#588d42` bold-italic serif | |
| Name label strict | `#ff7f5a` bold-italic serif | |

## 8. Buildings

| Type | Fill | Stroke |
|---|---|---|
| Generic | `#E0E0E0` | `#808080` 0.6 |
| Supermarket | `#D8C0CC` | `#808080` 0.6 |
| Religious | `#D4A870` | `#806040` 1.6 |
| Museum | `#C8A0A0` | `#808080` 0.6 |
| Sports | `#C8D8E0` | `#4080A0` 1.0 |
| Swimming | `#A8D8E8` | `#4080A0` 0.6 |
| Historic | `#D4A890` | `#804030` 0.6 |

Visible from zoom 15+.

## 9. Place labels (typography)

| Place type | Font style | Size range | Fill | Stroke |
|---|---|---|---|---|
| Capital | bold_italic | 12–20 | `#000000` | `#FFFFFF` 3 |
| City | bold_italic | 11–18 | `#000000` | `#FFFFFF` 3 |
| Town | bold | 12–18 | `#000000` | `#FFFFFF` 3 |
| Village | normal/bold | 11–18 | `#000000` | `#FFFFFF` 2–3 |
| Suburb | normal | 12–16 | `#000000` | `#FFFFFF` 3 |
| Hamlet / farm | normal | 11 | `#000000` | `#FFFFFF` 2 |
| Locality | italic | 12 | `#666666` | `#FFFFFF` 1.2 |
| Waterway label | italic | 10–12 | `#0050A0` | `#FFFFFF` 2 |

Font families: `sans_serif` (default), `serif` (NP names), bold/italic variants.

## 10. Zoom level thresholds (key values)

| Feature | Appears at zoom |
|---|---|
| Motorway / trunk / primary | 8 |
| Secondary | 9 |
| Tertiary | 10 |
| Unclassified / residential | 11 |
| Hiking trails | 11 |
| Service roads | 13 |
| Contours major | 10 |
| Contours minor | 14 |
| Buildings | 15 |
| Footways | 14 |
