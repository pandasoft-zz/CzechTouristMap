# Gap analýza: Co je potřeba změnit

Porovnání aktuálního stavu (`stav-mapy.md`) s požadavky (`guideline-vzhled-mapy.md`). Problémy jsou seřazeny podle dopadu na celkový vzhled mapy.

---

## Priorita 1 — Zásadní odchylky (největší vizuální dopad)

### 1.1 Barva vodních ploch — KRITICKÉ

| | Guideline | Aktuální stav |
|-|-----------|--------------|
| Vodní plochy | #E0FFFF — světlá azurová | #8CC5FF — sytá modrá |
| Vodní toky | #E0FFFF / #00FFFF | #B8D8F0 — tmavá modrá |

Voda je aktuálně příliš **tmavá a sytá modrá**. Na tisknuté i digitální mapě působí dominantně a potlačuje ostatní prvky. SM5 standard jasně definuje velmi světlou azurovou (#E0FFFF).

**Změna:** `poly-water.xslt` — opravit fill vodních ploch na `#E0FFFF`, kontura `#00FFFF` nebo `#4E4E4E`.

---

### 1.2 Barva lesů — KRITICKÉ

| | Guideline | Aktuální stav |
|-|-----------|--------------|
| Lesní plochy | #EBFFB2 — velmi světlá žlutozelená | #C8E8A0, #A8D880 — středně sytá zelená |

Les je aktuálně příliš **tmavý a sytý**. Standardní česká topografická mapa používá velmi světlou, téměř průhlednou žlutozelenou — les je indikátor, ne dominanta.

**Změna:** `poly-landuse.xslt` a `poly-top.xslt` — nahradit zelené výplně lesů hodnotou `#EBFFB2`.

---

### 1.3 Chybějící vnitřní symboly vegetace — VÝRAZNÁ ODCHYLKA

Aktuálně jsou všechny vegetační polygony jen jednobarevné výplně. Česká topografická mapa má uvnitř polygonů **opakující se znaky** (stromy, tráva, réva…).

| Typ | Požadovaný symbol |
|-----|------------------|
| Les listnatý | Kruh na tyčce (opakující se) |
| Les jehličnatý | Trojúhelník na tyčce |
| Louka | Dvojice krátkých svislých čárek `ıı` |
| Zahrada | Stylizovaný lístek |
| Sad | Puntík na tyčce |

**Změna:** Vytvořit SVG patterny nebo použít mapsforge `symbol` v pravidlech polygonů. Tato funkce v mapsforge existuje, ale není využita.

---

### 1.4 Barvy turistických stezek — NEOVĚŘENO

Hex kódy proměnných `$lc-trail-red`, `$lc-trail-blue` atd. nebyly dohledány ve zdrojovém kódu. Pokud se neshodují s KČT standardem, jde o vizuální odchylku.

| Barva KČT | Správný hex |
|-----------|------------|
| Červená | **#E8000C** |
| Modrá | **#0066FF** |
| Zelená | **#00AA00** |
| Žlutá | **#DDBB00** |

**Akce:** Dohledat proměnné v `config-hiking.xslt` nebo `config-lines.xslt` a ověřit/opravit hex kódy.

---

## Priorita 2 — Střední odchylky (znatelné, ale nezásadní)

### 2.1 Administrativní hranice — chybějící nižší úrovně

Aktuálně jsou implementovány pouze:
- Státní hranice (admin_level=2) ✅
- Krajská hranice (admin_level=3) ✅

Chybí:
- Hranice okresu (admin_level=6) ❌
- Hranice obce (admin_level=8) ❌
- Hranice katastrálního území ❌

Všechny by měly mít barvu #FF4CFF, lišit se vzorem přerušení.

**Změna:** Rozšířit `lines-admin.xslt` o chybějící admin_level.

---

### 2.2 Vizuální styl POI ikon — neodpovídá české kartografii

Stávající OpenHiking ikony jsou funkční, ale mají jiný vizuální jazyk než tradiční česká mapa. Klíčové kategorie, které by měly mít české/ČÚZK-kompatibilní symboly:

| POI | Požadovaný symbol |
|-----|------------------|
| Kostel/kaple | Latinský kříž `†` (vertikální delší) |
| Synagoga | Davidova hvězda `✡` |
| Hrad, zřícenina | Silueta hradu, věže |
| Boží muka, křížek | Malý diagonální křížek `×` |
| Rozhledna | Věžový symbol |
| Pramen | Stylizovaná fontána / kapka |
| Jeskynní vstup | Oblouk otevřený dolů `∪` |
| Kótovaný bod | Tečka + číslice vpravo |

Všechny v barvě **#4E4E4E** (tmavě šedá), jednoduché geometrické tvary.

**Akce:** Navrhnout a vytvořit novou sadu klíčových ikon v českém kartografickém stylu (prioritně náboženské objekty, příroda, turistická infrastruktura).

---

### 2.3 Budovy — drobné odchylky

Aktuální barva budov (#E0E0E0) je přijatelná, ale kontura by měla být konzistentně **#000000 černá** (0.5 px), ne šedá.

**Změna:** Zkontrolovat `poly-buildings.xslt`, sjednotit stroke na `#000000`.

---

### 2.4 Silniční barvy — ověřit a sladit

Konkrétní hodnoty proměnných (`$lc-primary`, `$bc-primary` atd.) nebyly dohledány. Je třeba ověřit, zda odpovídají:

| Typ | Výplň dle guidelinu |
|-----|---------------------|
| Dálnice | #FFFF99 |
| Silnice I. tř. | #FFCC66 |
| Silnice II. tř. | #FFEE99 |
| Silnice III. tř. | #FFFFFF |

**Akce:** Prostudovat zbývající části `config-lines.xslt` a porovnat s guidelinem.

---

## Priorita 3 — Drobnosti a vylepšení

### 3.1 Louka — barva přijatelná, ale odchylka

Aktuální `#F5F0A0` vs. standard `#FFFFEA`. Mírně žlutější než standard, ale funkčně podobné.

**Změna:** Upravit na `#FFFFEA` pro soulad se SM5.

---

### 3.2 Letiště, dopravní plochy

Aktuální barva `#D8D4A8` (béžová) vs. standard `#F2E6F2` (světlá šeříková).

**Změna:** `poly-top.xslt` — opravit barvu letišť a ostatní dopravní plochy.

---

### 3.3 Popisky vodních toků

Popisky vodních toků by měly mít barvu `#3366CC` (tmavší modrá). Aktuální stav neověřen.

**Akce:** Ověřit `poly-naming.xslt` a `lines-waterways.xslt`.

---

### 3.4 Silniční čísla — štítky (shields)

Aktuálně není ověřeno, zda jsou implementovány silniční štítky (E55, D1, č. 50…). Pro turistické měřítko jsou důležité.

**Akce:** Zkontrolovat `lines-highways-labels.xslt`.

---

### 3.5 Zoom-level triggery

Zkontrolovat, zda se POI zobrazují od správného zoom levelu:
- Základní POI: zoom ≥ 13
- Detailní POI: zoom ≥ 15
- Budovy jednotlivě: zoom ≥ 15

---

## Shrnutí priorit

| # | Problém | Soubor | Dopad |
|---|---------|--------|-------|
| 1 | Barva vodních ploch (příliš sytá modrá) | `poly-water.xslt` | ⚠️ Kritický |
| 2 | Barva lesů (příliš sytá zelená) | `poly-landuse.xslt`, `poly-top.xslt` | ⚠️ Kritický |
| 3 | Chybějící vnitřní symboly vegetace | `poly-landuse.xslt` + nové SVG | ⚠️ Kritický |
| 4 | Ověřit barvy turistických stezek | `config-hiking.xslt` | ⚠️ Střední |
| 5 | Chybějící hranice okresu a obce | `lines-admin.xslt` | ⚠️ Střední |
| 6 | POI ikony — neodpovídají české kartografii | nová sada SVG ikon | ⚠️ Střední |
| 7 | Kontura budov | `poly-buildings.xslt` | 🔹 Drobnost |
| 8 | Barva louky | `poly-landuse.xslt` | 🔹 Drobnost |
| 9 | Barva letišť | `poly-top.xslt` | 🔹 Drobnost |
| 10 | Silniční barvy — ověřit | `config-lines.xslt` | 🔹 Drobnost |

---

## Doporučený postup

1. **Fáze 1 — Barvy:** Opravit vodu a lesy (body 1 a 2). Rychlá změna, velký vizuální efekt.
2. **Fáze 2 — Hranice:** Doplnit chybějící administrativní úrovně (bod 5).
3. **Fáze 3 — Ikony:** Navrhnout klíčové POI symboly v českém stylu (bod 6). Dlouhodobější práce.
4. **Fáze 4 — Textury:** Implementovat vnitřní symboly vegetace (bod 3). Nejnáročnější technicky.
