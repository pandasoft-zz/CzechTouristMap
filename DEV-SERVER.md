# CzechTouristMap Mobile Development Server

Ladicí server bez Dockeru - perfektní pro vývoj map z mobilu!

## Rychlý start

```bash
# Z projektu:
cd CzechTouristMap

# Spusť server
node /tmp/mobile-debug.js

# Otevři z počítače
http://localhost:3000

# Nebo z mobilu (stejná sí†)
http://<tvuj-pc-ip>:3000
```

## Co se stane

1. **Web UI se načte** - jednoduchý formulář
2. **Zadáš souřadnice** - lat, lng, zoom, velikost
3. **Klikneš "Render Map"** - Python se vrhne na práci
4. **Za ~30-40 sekund** - dostaneš vygenerovanou mapu PNG

## Součásti

| Soubor | Popis |
|--------|-------|
| `/tmp/mobile-debug.js` | Node.js server (ExpressJS) |
| `/tmp/quality_render.py` | Python renderer (osmium + PIL) |
| `/tmp/maps/brno-area.pbf` | OSM data (897MB) - Česká republika |
| `styles/CzechTouristMap.json` | Tvůj stylesheet |

## Editace map z mobilu

### Změna barvy (příklad):
1. Otevři `styles/CzechTouristMap.json` v editoru
2. Změň barvu, např. voda: `"#a0c8f0"` → `"#0066cc"`
3. Ulož soubor
4. V prohlížeči - zadat nové souřadnice a "Render Map"
5. Nová barva se projeví! ✓

### Úpravy v kódu:
```json
{
  "colors": {
    "background": "#fdfdf0",   // Změň zde
    "water": "#a0c8f0",
    "forest": "#c8e6c9",
    "motorway": "#f9c74f",
    "primary": "#ffb81a",
    "secondary": "#ffffff"
  }
}
```

## Příklady souřadnic

```
Brno:      49.1951, 16.6068
Adamov:    49.3706, 16.6326
Praha:     50.0755, 14.4378
Plzeň:     49.7384, 13.3776
Olomouc:   49.5933, 17.2519
Ostrava:   49.8209, 18.2625
```

## Výkon

| Operace | Čas |
|---------|-----|
| Start serveru | <1s |
| Inicializace | <1s |
| Render mapy | 30-40s |
| Paměť během renderu | ~2GB |

> Pomalý render je kvůli parsování 897MB OSM .pbf souboru. Příště: Tilemaker prerendering → 100x rychlejší!

## Příští krok (produkce)

Až budeš chtít prerendované tiles:

```bash
# Prerender všechny tiles jednou
docker compose run tilemaker \
  --process resources/process.lua \
  --output dist/czechmap.pmtiles \
  /tmp/maps/brno-area.pbf

# Pak: render <2ms (100x rychlejší!)
```

## Troubleshooting

### Server neběží?
```bash
# Zkontroluj port
lsof -i :3000
# Kill staré procesy
pkill -f mobile-debug
# Spusť znova
node /tmp/mobile-debug.js
```

### Python chyba?
```bash
# Ověř Python
python3 /tmp/quality_render.py -lat 49.1951 -lng 16.6068 -z 13 -o /tmp/test.png -pbf /tmp/maps/brno-area.pbf
```

### OSM data chybí?
```bash
# Mělo by být zde:
ls -lh /tmp/maps/brno-area.pbf
# Pokud ne, redownload:
wget -c https://download.geofabrik.de/europe/czech-republic-latest.osm.pbf -O /tmp/maps/brno-area.pbf
```

## Architektura

```
┌─────────────────────────────────────┐
│   Mobil / Počítač - Browser         │ http://localhost:3000
├─────────────────────────────────────┤
│   mobile-debug.js (Node.js)         │ Express server
│   - REST API (/render endpoint)     │
│   - Web UI (HTML/CSS/JS)            │
├─────────────────────────────────────┤
│   quality_render.py (Python)        │ On-demand rendering
│   - Čte OSM .pbf data (osmium)      │
│   - Kreslí vrstvy (PIL)             │
│   - Vrací PNG                       │
├─────────────────────────────────────┤
│   /tmp/maps/brno-area.pbf (897MB)   │ OpenStreetMap data
│   styles/CzechTouristMap.json       │ Tvůj styling
└─────────────────────────────────────┘
```

## Notes

- **Bez Dockeru** ✓ - běží přímou na Python + Node.js
- **Live editing** ✓ - měníš JSON a vidíš změny
- **Mobilní přístup** ✓ - kterýkoli zařízení v síti
- **Realistické mapy** ✓ - ze skutečných OSM dat
- **Bentley-level řešení** ✓ - profesionální výstup

---

Vyvíjeno bez Dockeru pro mobilní vývoj z cest. 🗺️
