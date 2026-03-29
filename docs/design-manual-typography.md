# Design Manual — Typography

Custom style choices made via interactive quiz (2026-03-28).
Applied to: `points-places.xslt`, `points-natural.xslt`,
`lines-highways-labels.xslt`, `lines-contours.xslt`, `poly-naming.xslt`.

---

## 1. Place labels

| Place type | Font style | Size | Fill | Halo | Transform | Zoom |
|---|---|---|---|---|---|---|
| Capital (Praha) | bold | 12–20 | `#000000` | white 2 px | **uppercase** | 6+ |
| City | bold | 11–18 | `#000000` | white 2 px | none | 7+ |
| Town | bold | 12–18 | `#000000` | white 2 px | none | 8+ |
| Suburb | normal | 12–16 | `#666666` | white 2 px | none | 12+ |
| Village | normal | 11–17 | `#666666` | white 2 px | none | 10+ |
| Hamlet / farm | normal | 11 | `#666666` | white 2 px | none | 13–18 |
| Locality | italic | 12 | `#666666` | white 1.2 px | none | 14+ |

### Design rationale
- Capitals use `text-transform="uppercase"` — classical paper map convention
- Cities/towns use upright bold, not italic (mapy.cz approach)
- Villages and smaller settlements use grey `#666666` to reduce visual weight
- Halo reduced from 3 px → 2 px for a cleaner, less "bloated" look

---

## 2. Natural features

| Feature | Font style | Size | Fill | Halo |
|---|---|---|---|---|
| Peak name | bold | 11–12 | `#693600` warm brown | white 2 px |
| Peak elevation | bold | 9–11 | `#693600` warm brown | white 2 px |
| Saddle | italic | 11 | `#000000` | white 2 px |
| Cave | bold | 11–12 | `#7b0000` dark red | white 1.5 px |
| Cliff / rock | bold | 10 | `#7b0000` dark red | white 2 px |
| Spring | bold | 11 | `#0000f8` blue | white 2 px |
| Waterfall | bold | 10 | `#4040ff` blue | white 2 px |

### Design rationale
- Peak name changed from bold_italic → **bold** (less decorative, cleaner)
- Halo increased from 1.5 px → 2 px (better legibility over terrain)

---

## 3. Road labels and reference numbers

| Road type | Ref style | Ref fill | Ref stroke (shield) | Name style |
|---|---|---|---|---|
| Motorway (D1) | bold 10 | `#FFFFFF` white | `#A82020` red, 5 px | — |
| Trunk | bold 9 | `#FFFFFF` white | `#A82020` red, 5 px | — |
| Primary (I. tř.) | bold 10 | `#FFFFFF` white | `#1040C8` blue, 4 px | bold 11, halo 2 px |
| Secondary (II. tř.) | bold 10 | `#FFFFFF` white | `#008700` green, 3 px | bold 11, halo 3 px |
| Tertiary (III. tř.) | bold 10 | `#FFFFFF` white | `#008700` green, 4 px | bold 11, halo 3 px |
| Local / residential | — | — | — | bold 11, halo 3 px |
| Track (grade 1–2) | bold 10 | `#FFFFFF` | brown `#6b4724`, 3 px | bold 11, halo 3 px |

### Design rationale
- Motorway/trunk: blue shield → **red shield** (matches D-road red fill color)
- Primary: green shield → **blue shield** (matches mapy.cz blue oval convention)
- Stroke-width 5 px on motorway gives a wider, more visible shield effect

---

## 4. Contour elevation labels

| Type | Font style | Size | Fill | Halo |
|---|---|---|---|---|
| All contour labels | **italic** | 8–10 | `#906010` amber | **none** |

### Design rationale
- Changed from bold → **italic** (classic paper map convention for contour heights)
- Removed white halo entirely — clean minimalist look on terrain background
- Amber color `#906010` matches the contour line color

---

## 5. Area / polygon labels

| Area type | Font style | Family | Size | Fill | Halo |
|---|---|---|---|---|---|
| Forest / wood | bold italic | serif | 12 | `#407020` dark green | white 2 px |
| Meadow / grassland | bold italic | serif | 12 | `#407020` dark green | white 2 px |
| Orchard / vineyard | bold italic | serif | 12 | `#407020` dark green | white 2 px |
| Farmland | bold italic | serif | 12 | `#407020` dark green | white 2 px |
| Quarry / landfill | italic | serif | 12 | `#202020` dark grey | white 1 px |
| Water body | bold italic | sans | 12–14 | `#4040ff` blue | white 2–3 px |
| Bay | bold italic | sans | 9–14 | `#4040ff` blue | white 2–3 px |
| Industrial / military | italic | serif | 14 | `#202020` dark grey | white 2 px |

### Design rationale
- Forest/vegetation labels changed from dark grey → **green `#407020`**
  (matches the forest fill color family, clearly signals "natural area")
- Bold italic distinguishes area names from point labels at the same scale
- Quarry/industrial kept dark grey — they are not natural/green areas

---

## 6. Waterway labels

| Feature | Font style | Size | Fill | Halo | Zoom |
|---|---|---|---|---|---|
| River | italic | 10–12 | `#2060A0` dark blue | white 2 px | 11+ |
| Stream / canal | italic | 10–12 | `#2060A0` dark blue | white 2 px | 15+ |

---

## Summary of key changes from previous style

| Element | Before | After | Why |
|---|---|---|---|
| Capital city | bold italic | **BOLD UPPERCASE** | Paper map convention |
| City / town | bold italic | bold upright | Cleaner, modern |
| Village fill | `#000000` black | `#666666` grey | Reduces visual weight |
| Village halo | 2–3 px | 2 px | Consistent |
| Suburb fill | `#000000` black | `#666666` grey | Same as village |
| Motorway shield | blue `#1076BA` 4 px | **red `#A82020` 5 px** | Matches road color |
| Primary shield | green `#008700` 3 px | **blue `#1040C8` 4 px** | mapy.cz convention |
| Peak name style | bold italic | **bold upright** | Cleaner |
| Peak halo | 1.5 px | 2 px | Better legibility |
| Contour label style | bold | **italic** | Paper map convention |
| Contour halo | 1–1.3 px | **none** | Minimalist |
| Forest label color | `#202020` dark grey | **`#407020` green** | Matches vegetation |
| Forest label weight | italic | **bold italic** | More visible |
| Forest label halo | 0.1 px | **2 px** | Legible |
