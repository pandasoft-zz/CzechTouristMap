# Design Manual — ČÚZK standards

Sources:
- `docs/standards/ZNACKY_NOVA_SM5.pdf` — Mapové značky katastrální složky SM5
- `docs/standards/CUZK_znackovy_klic.pdf` — Značkový klíč pro katastrální mapy
- `docs/standards/znacky10.pdf` — Značky pro mapy 1:10 000 (ZTM10)
- `docs/standards/vysvetlivky_ZTM10.pdf` — Vysvětlivky ZTM10

Colors are specified as RGB triplets (R,G,B 0–255) in the source documents.
Hex conversions are added for direct use in the project.

---

## 1. Land cover — pozemky a jejich využití (SM5 / ZTM10)

| SM5 code | Element | RGB | Hex | Notes |
|---|---|---|---|---|
| 3.11 | Orná půda (arable land) | 255,255,255 | `#FFFFFF` | White fill |
| 3.12–3.15 | Chmelnice / vinice / zahrada / sad | 245,255,219 | `#F5FFDB` | + hatching 78,78,78 |
| 3.2 | Trvalý travní porost (grassland) | 255,255,234 | `#FFFFEA` | |
| 3.2 | Lesní pozemek (forest) | 235,255,178 | `#EBFFB2` | |
| 3.31 | Koryto vodního toku (waterway bed) | 224,255,255 | `#E0FFFF` | Water >2 m wide |
| 3.32 | Vodní nádrž / rybník (reservoir/pond) | 224,255,255 | `#E0FFFF` | |
| 3.33 | Zamokřená plocha (wetland) | 255,255,255 | `#FFFFFF` | |
| 3.4 | Zastavěná plocha / nádvoří (built-up) | 255,255,255 | `#FFFFFF` | |
| 3.501 | Dráha (railway land) | 242,230,243 | `#F2E6F3` | Pinkish-purple |
| 3.502 | Dálnice, silnice (road land parcel) | 255,255,153 | `#FFFF99` | Yellow |
| 3.505 | Ostatní komunikace (other roads) | 245,245,245 | `#F5F5F5` | Light grey |
| 3.507 | Zeleň (urban green) | 245,255,219 | `#F5FFDB` | Same as orchard |
| 3.508 | Ostatní dopravní plocha | 242,230,242 | `#F2E6F2` | |
| 3.6 | Povrchová těžba (quarry) | 255,255,255 | `#FFFFFF` | |
| 4.1 | Budova (building) | 227,227,227 | `#E3E3E3` | Standard grey |
| 5.1–5.6 | Ochranná pásma (protection zones) | 255,76,255 | `#FF4CFF` | Magenta |
| 6.1–6.2 | Chráněná území (protected areas) | 0,255,0 | `#00FF00` | Pure green |

## 2. Terrain — terénní tvary (SM5 / ZTM10)

| Code | Element | RGB | Hex | Notes |
|---|---|---|---|---|
| 9.1 | Vrstevnice základní (contour basic) | 245,190,64 | `#F5BE40` | Warm amber/gold |
| 9.2 | Vrstevnice zdůrazněná (index contour) | 245,190,64 | `#F5BE40` | Thicker line, same color |
| 9.3 | Vrstevnice doplňková (supplementary) | 245,190,64 | `#F5BE40` | Thinner/dashed |
| 9.4–9.10 | Terénní hrany, rokle, srázy | 240,147,50 | `#F09332` | Orange-brown |

ZTM10 also uses `245,190,64` for all contour variants with width differentiation only.

## 3. Hydrography — vodní plochy a toky

| Element | RGB | Hex | Notes |
|---|---|---|---|
| Water area fill | 224,255,255 | `#E0FFFF` | SM5 standard cyan-white |
| Water body outline | 0,255,255 | `#00FFFF` | Pure cyan |
| Waterway line (general) | 78,78,78 | `#4E4E4E` | Dark grey line |

## 4. Transport — komunikace

### SM5 road hierarchy (land parcel colors — katastrální mapa)
These are land-parcel fill colors, not actual road rendering colors:

| Type | RGB | Hex |
|---|---|---|
| Dálnice + silnice I–III (highway parcels) | 255,255,153 | `#FFFF99` |
| Ostatní komunikace (local roads) | 245,245,245 | `#F5F5F5` |
| Ostatní dopravní plocha | 242,230,242 | `#F2E6F2` |

### ZTM10 road line colors (topographic map rendering)
The ZTM10 standard uses symbolic line colors for road hierarchy:

| Road class | Typical rendering | Notes |
|---|---|---|
| Dálnice (motorway) | Red casing + yellow fill | D1 label in red |
| Silnice I. třídy (primary) | Orange/red | Number label |
| Silnice II. třídy (secondary) | Yellow | Number label |
| Silnice III. třídy (tertiary) | Light yellow | Number label |
| Místní komunikace (local) | White / light grey | |
| Polní / lesní cesta (track) | Brown dashed | |

### ZTM10 road rendering specifics (from vysvetlivky_ZTM10):
- Průtah silnice sídlem (road through settlement): shown with black outline
- Tunel na silnici (road tunnel): dashed line
- Polní a lesní cesta udržovaná (maintained track): thin brown line

## 5. Railways — železnice

| Type | RGB | Hex | Notes |
|---|---|---|---|
| Railway land (SM5 parcel) | 242,230,243 | `#F2E6F3` | Pinkish |
| Railway line (ZTM10) | 156,156,156 | `#9C9C9C` | Grey, with black dashes |
| Non-electrified single track | Black + white ties | Standard symbol |
| Electrified single track | Black + white ties + overhead symbol | |

## 6. Buildings — budovy

| Type | RGB | Hex | Notes |
|---|---|---|---|
| Generic building | 227,227,227 | `#E3E3E3` | Standard SM5 |
| Building outline | 78,78,78 | `#4E4E4E` | Dark grey |
| Underground structure | — | — | Dashed outline |

## 7. Boundaries — hranice

| Type | RGB | Hex |
|---|---|---|
| State boundary | 0,0,0 | `#000000` |
| Region boundary | 0,0,0 | `#000000` |
| District boundary | 0,0,0 | `#000000` |
| Municipality boundary | 51,51,51 | `#333333` |
| Cadastral territory boundary | 51,51,51 | `#333333` |
| Parcel boundary | 51,51,51 | `#333333` |
| Protected area boundary | 0,255,0 | `#00FF00` |
| Protection zone boundary | 255,76,255 | `#FF4CFF` |

## 8. Typography (ZTM10 / SM5)

The standards do not specify font families explicitly but use:
- Roman (upright) for most labels
- Italic for water names, natural features
- Bold for settlements, roads
- Size hierarchy follows map scale (1:10 000 uses 8–14pt equivalent)

## 9. Key differences: SM5 vs. tourist map conventions

| Aspect | SM5 (cadastral) | Tourist map |
|---|---|---|
| Forest color | `#EBFFB2` (very pale green-yellow) | Saturated green |
| Grassland | `#FFFFEA` (near-white yellow) | Light yellow-green |
| Water | `#E0FFFF` (cyan-white) | Medium blue |
| Building | `#E3E3E3` (neutral grey) | Same or warmer |
| Road parcels | `#FFFF99` (yellow) | Not shown as parcels |
| Contours | `#F5BE40` (amber gold) | Darker warm brown |
| Scale | 1:2 880 → 1:5 000 (cadastral) | 1:50 000+ (tourist) |

SM5 is a **cadastral/technical** standard with very pale, low-contrast fills designed for precision cadastral work. Tourist maps use more saturated colors for readability at hiking scale.
