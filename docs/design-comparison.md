# Style Comparison — Project vs. ČÚZK vs. mapy.cz

Use this document to pick your preferred colors for each map element.
Each row shows the three approaches side by side with hex codes and a short note.

---

## How to read this document

- **Project** = current CzechTouristMap XSLT style
- **ČÚZK** = official SM5 / ZTM10 standard (technical/cadastral origin)
- **mapy.cz** = mapy.cz turistická mapa (visual reference, from observation)
- ★ = recommended if you want to match mapy.cz closely
- ☆ = recommended if you want a more paper-map / ČÚZK-faithful look

---

## 1. Land background

| Element | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Base land | `#FDFDF0` warm off-white | `#FFFFFF` pure white | `#F2EFE6` warm cream | mapy.cz most inviting; ČÚZK most neutral |
| Farmland / arable | `#FFFFE6` very pale yellow | `#FFFFFF` white | `#F5F0DC` warm beige | ČÚZK: fields disappear into background; mapy.cz: subtle warm tone |
| Residential area | `#F0D8B0` warm orange-beige | `#FFFFFF` white | `#E8DFD0` cool beige | Project most orange; mapy.cz more restrained |

---

## 2. Vegetation

| Element | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Forest (broadleaf) | `#C8E8A0` light green | `#EBFFB2` very pale green-yellow | `#A8D080` medium saturated green | ČÚZK: almost invisible; Project: light; mapy.cz: rich, clearly "forest" |
| Forest (needleleaf) | `#A8D880` slightly darker | `#EBFFB2` same as broadleaf | `#A8D080` same as broadleaf | mapy.cz makes no broadleaf/needleleaf color distinction |
| Grassland / meadow | `#E4F5C0` light yellow-green | `#FFFFEA` near-white yellow | `#D6EDA0` clear light green | mapy.cz most distinct from forest; ČÚZK: hard to read |
| Orchard / vineyard | `#E8F8C0` + pattern | `#F5FFDB` + hatching | `#CCEA90` + pattern | All similar; mapy.cz slightly more saturated |
| Scrub | `#D8F0A8` | — | `#C8DC88` olive-green | — |
| Heath | `#EAF5A8` | — | — | — |

---

## 3. Water

| Element | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Water body (lake, pond) | `#B8D8F0` soft blue | `#E0FFFF` cyan-white | `#9EC8E8` clear medium blue | ČÚZK: too cyan; Project: good; mapy.cz: most saturated, clearly "water" |
| River (large) | `#5080C0` medium blue | `#E0FFFF` fill | `#5090C8` blue | Project and mapy.cz nearly identical |
| Stream | `#5080C0` | — | `#6898C8` lighter | — |
| Drain | `#90C8E8` light blue | — | — | — |
| Wetland | `#C0E8E0` blue-green | `#FFFFFF` white | `#A8D0C0` blue-green | Project and mapy.cz similar |
| Water label color | `#0050A0` dark blue | — | `#2060A0` dark blue | Nearly identical |

---

## 4. Roads — fill colors

| Road type | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Motorway (dálnice) | `#D42020` red | `#FFFF99`* yellow | `#E8474A` bright red | *SM5 is parcel color, not line color; mapy.cz brighter red than project |
| Trunk (rychlostní) | `#D42020` red | `#FFFF99`* | `#E8474A` | Same |
| Primary (I. třída) | `#E07820` orange | `#FFFF99`* | `#F09030` orange | mapy.cz slightly brighter/warmer |
| Secondary (II. třída) | `#F0C000` yellow | `#FFFF99`* | `#F8D040` yellow | mapy.cz slightly lighter/brighter |
| Tertiary (III. třída) | `#F5E040` pale yellow | `#FFFF99`* | `#FAEEA0` pale yellow | Very similar; mapy.cz slightly paler |
| Unclassified | `#FFFFFF` white | `#F5F5F5` light grey | `#FFFFFF` white | All nearly white |
| Residential | `#FFFFFF` | `#F5F5F5` | `#FFFFFF` | — |
| Track (polní cesta) | `#8C5A1E` brown | — | brown dashed | Project: filled; mapy.cz: dashed outline only |
| Path (pěšina) | `#8C5A1E` brown | — | `#C09040` dashed | — |
| Cycleway | `#FFFFFF` white | — | blue dashed | mapy.cz: distinct blue dashed |
| Ferrata | `#C00000` red | — | red chain symbol | — |

---

## 5. Roads — outline / casing colors

| Road type | Project | mapy.cz | Notes |
|---|---|---|---|
| Motorway | `#880000` dark red | `#C02028` medium-dark red | mapy.cz slightly lighter |
| Primary | `#904400` dark orange | `#C06010` orange-brown | Similar |
| Secondary | `#907000` dark yellow | `#C0A000` gold | Similar |
| Tertiary | `#909000` dark olive | `#C8C060` olive | Similar |
| Local roads | `#606060`–`#707070` grey | `#B0A890` warm grey | mapy.cz casing warmer |

---

## 6. Contour lines

| Type | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Index (zdůrazněná) | `#C07030` warm brown | `#F5BE40` amber gold | `#C88820` amber-brown | ČÚZK: very golden/bright; Project: brown; mapy.cz: between them |
| Standard (základní) | `#D09060` tan | `#F5BE40` same | `#D4A040` warm amber | — |
| Supplementary | `#80E0B080` semi-transparent | `#F5BE40` same | `#E0B860` pale amber | — |
| Elevation label | `#8B5818` brown | `#000000` black | `#A06010` amber-brown | Project and mapy.cz very similar |

**Key choice:** ČÚZK gold `#F5BE40` is brighter and more golden. Project brown `#C07030` is more muted. mapy.cz `#C88820` is a good middle ground.

---

## 7. Buildings

| Type | Project | ČÚZK SM5 | mapy.cz | Notes |
|---|---|---|---|---|
| Generic building | `#E0E0E0` neutral grey | `#E3E3E3` neutral grey | `#C8C0B8` warm medium grey | Project/ČÚZK: light and neutral; mapy.cz: darker, warmer — more visible |
| Religious building | `#D4A870` golden tan | — | `#C8A870` golden tan | Very similar |
| Historic building | `#D4A890` rust-tan | — | `#D4A870` golden | Similar |
| Sports facility | `#C8D8E0` cool blue-grey | — | `#C8D8E0` | Identical |

---

## 8. Hiking trails (KČT)

| Color | Project | mapy.cz | Notes |
|---|---|---|---|
| Red | `#DC0000` | `#E0181C` | Nearly identical — both correct |
| Blue | `#0050C8` | `#1040C8` | Very similar |
| Green | `#007820` | `#108020` | Very similar |
| Yellow | `#E8B400` | `#E8A800` | Nearly identical |

**Conclusion:** Trail colors are well-calibrated in the current project. No significant changes needed.

---

## 9. Protected areas

| Type | Project | mapy.cz | Notes |
|---|---|---|---|
| National park border | `#588d42` dark green | `#40A000` brighter green | mapy.cz more vivid |
| NP glow/fill | `#40588d42` semi-transparent | subtle green wash | Similar approach |
| Strict zone border | `#FF956A` salmon-orange | `#E06000` orange | Project: pinkish; mapy.cz: pure orange |
| NP name label | `#588d42` bold-italic serif | `#008000` bold | mapy.cz darker/purer green |

---

## 10. Typography

| Element | Project | mapy.cz | Notes |
|---|---|---|---|
| Font family | Android default sans-serif | Rounded proprietary sans | mapy.cz more polished; project depends on device |
| City label | `#000000` bold-italic | `#000000` bold | Project uses italic; mapy.cz uses upright bold |
| Town label | `#000000` bold | `#000000` bold | Identical |
| Village label | `#000000` normal/bold | `#000000` regular | Identical |
| Locality | `#666666` italic | `#555555` italic | Nearly identical |
| Water label | `#0050A0` italic | `#2060A0` italic | mapy.cz very slightly lighter blue |
| Forest/area label | not styled separately | `#407020` italic green | mapy.cz has distinct green for area names |
| Contour label | `#8B5818` bold | `#A06010` bold | Similar warm brown |

---

## 11. Features present in mapy.cz but missing from project

| Feature | mapy.cz | Project | Impact |
|---|---|---|---|
| **Hillshading** | Yes — semi-transparent relief layer | No | Very high — gives mapy.cz its characteristic 3D feel |
| Needleleaf/broadleaf distinction | No (same color) | Yes (two greens) | Low |
| Cycling route bands | Yellow-color-yellow stripes | Limited | Medium |
| Road shield labels | Yes (motorway/primary) | Not visible in XSLT checked | Low |
| Hillshade on water | Subtle | No | Low |
| Building 3D (zoom 17+) | Slight extrusion hint | No | Low |

---

## 12. Summary — quick decision guide

| I want to look like… | Key changes to make |
|---|---|
| **mapy.cz** (★ popular Czech standard) | Darken forest to `#A8D080`, saturate water to `#9EC8E8`, warm buildings to `#C8C0B8`, brighten motorway to `#E8474A`, add hillshading |
| **ČÚZK SM5** (☆ official/technical) | Pale forest `#EBFFB2`, near-white grassland `#FFFFEA`, cyan water `#E0FFFF`, amber contours `#F5BE40` |
| **Keep project style** | Already a good middle ground between SM5 pale and mapy.cz saturated |

---

## 13. Color palette overview

### Land cover
```
                Project         ČÚZK            mapy.cz
Base land:      #FDFDF0 ░░      #FFFFFF □□      #F2EFE6 ▒▒
Forest:         #C8E8A0 ▓▓      #EBFFB2 ░░      #A8D080 ██
Grassland:      #E4F5C0 ░░      #FFFFEA ░░      #D6EDA0 ▒▒
Water:          #B8D8F0 ▒▒      #E0FFFF ░░      #9EC8E8 ▓▓
Residential:    #F0D8B0 ▒▒      #FFFFFF □□      #E8DFD0 ░░
```

### Roads
```
                Project         mapy.cz
Motorway:       #D42020 ██      #E8474A ██
Primary:        #E07820 ██      #F09030 ██
Secondary:      #F0C000 ██      #F8D040 ██
Tertiary:       #F5E040 ▒▒      #FAEEA0 ░░
Track:          #8C5A1E ▓▓      brown dashed
```

### Contours
```
                Project         ČÚZK            mapy.cz
Index:          #C07030         #F5BE40         #C88820
Standard:       #D09060         #F5BE40         #D4A040
Label:          #8B5818         #000000         #A06010
```
