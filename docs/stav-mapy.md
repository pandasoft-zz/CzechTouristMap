# Aktuální stav: Vzhled mapy CzechTouristMap

Dokument popisuje, jak mapa vypadá v současném stavu (duben 2026). Vychází z analýzy XSLT souborů v `src/styles/CzechTouristMap/`.

Tema je postaveno na základě **OpenHikingMap** (GPL-3.0), průběžně upravovaném pro české podmínky.

---

## 1. Podklad mapy (polygony)

### 1.1 Vegetace a využití půdy

| Typ | Aktuální výplň | Stav |
|-----|---------------|------|
| Les | #C8E8A0 nebo #A8D880 — zelená, poměrně sytá | Příliš sytá, tmavá zelená |
| Listnatý les | #C8E8A0 | — |
| Jehličnatý les | #A8D880 | — |
| Louka, trvalý travní porost | #F5F0A0 — žlutá | Blízko správné (SM5: #FFFFEA) |
| Orná půda | #FDFDF0 nebo #FFFFE6 | Správně — téměř bílá |
| Park, zeleň | #E8F8C0 | Přijatelné |
| Mokřad | proměnná `$wetland-color` | Definováno, blíže nespecifikováno |
| Vinice, sad, zahrada | #EAF5A8, #E8F5E0 | Přijatelné |

**Vnitřní symboly vegetace (opakující se znaky)** nejsou implementovány — polygony jsou jen jednobarevné výplně bez textury.

### 1.2 Zástavba

| Typ | Aktuální | Stav |
|-----|----------|------|
| Zástavěné území | #E8E4DC, #E0DCD8 | Světlá šedá — přijatelné |
| Průmyslová plocha | #E0E4E0 — šedozelená | Drobná odchylka |
| Letiště | #D8D4A8 — béžová | Odchylka od standardu (#F2E6F2) |

### 1.3 Voda

| Typ | Aktuální | Stav |
|-----|----------|------|
| Vodní plocha | #8CC5FF — středně modrá | Příliš sytá modrá, SM5 je #E0FFFF světle azurová |
| Vodní toky | #B8D8F0 nebo #C8ECF0 | Příliš tmavá modrá |
| Řeky (linie) | světle modrá čára | Přijatelné |

---

## 2. Vrstevnice

| Typ | Aktuální barva | Tloušťka | Stav |
|-----|---------------|----------|------|
| Základní (elevation_major) | **#C07030** — teplá hnědá | 0.45 / 0.7 px | Správně |
| Střední (elevation_medium) | **#D09060** — světlejší hnědá | 0.3 / 0.5 px | Správně |
| Doplňková (elevation_minor) | **#80E0B080** — poloprůhledná | 0.3 px | Přijatelné |
| Výškový popis | **#8B5818** — tmavá hnědá | 8–10 pt bold | Správně |

Vrstevnice jsou **nejlépe implementovanou částí** — barvy i hierarchie odpovídají standardu.

---

## 3. Komunikace

Silnice jsou implementovány jako **dvojlinka** (casing + výplň) pomocí proměnných z `config-lines.xslt`.

| Typ | Casing (bc-*) | Výplň (lc-*) | Stav |
|-----|--------------|-------------|------|
| Motorway/dálnice | tmavší barva | žlutá skupina | Přijatelné |
| Primary silnice | tmavší | oranžovožlutá | Přijatelné |
| Secondary | tmavší | světlá žlutá | Přijatelné |
| Tertiary | tmavší | světlá | Přijatelné |
| Residential | tmavší | bílá/světlá | Přijatelné |
| Makadám | #bc-macadam | #lc-macadam | Přijatelné |
| Track/polní cesta | přerušovaná | #lc-track | Přijatelné |
| Cyklostezka | #bc-cycleway | #lc-cycleway | Implementováno |
| Pěšina, footway | #lc-footway | — | Implementováno |
| Via ferrata | speciální dash | | Implementováno |

Přesné hex kódy casing/výplně nejsou v XSLT přímo viditelné — jsou v proměnných (`config-lines.xslt`), které nebyly plně prostudovány.

---

## 4. Administrativní hranice

| Typ | Aktuální | Stav |
|-----|----------|------|
| Státní hranice | #E040C0 / #C030A0 — fialová-růžová | Blízko SM5 (#FF4CFF), ale tmavší |
| Hranice kraje | #C030A050 — poloprůhledná | Implementováno |
| Nižší hranice (okres, obec) | **Neimplementovány** | Chybí |

Implementovány jsou pouze **státní** a **krajská** hranice (admin_level 2 a 3).

---

## 5. Železnice

Implementovány v `lines-railways.xslt`. Symbol **dvojlinky s pražci** — konkrétní vizuál neověřen v renderu (závisí na dostupnosti mapových dat). Implementace existuje.

---

## 6. Turistické stezky (KČT)

Implementovány v `lines-hiking-trails.xslt` a `points-hiking-symbols-czsk.xslt`.

| Barva | Implementováno | Stav |
|-------|---------------|------|
| Červená | ✅ | `$lc-trail-red` |
| Modrá | ✅ | `$lc-trail-blue` |
| Zelená | ✅ | `$lc-trail-green` |
| Žlutá | ✅ | `$lc-trail-yellow` |
| Fialová | ✅ | `$lc-trail-purple` |
| Oranžová | ✅ | `$lc-trail-orange` |
| Černá | ✅ | `$lc-trail-black` |

Přesné hex kódy barev tras jsou v proměnných — nebyly ověřeny oproti KČT standardu.
Zobrazení od **zoom 11**, odpovídá guidelinu.

Ikonky tras (značky rozcestníků) odkazují na SVG soubory z OpenHiking sady — **nejsou to české KČT značky** (odlišný vizuál).

---

## 7. POI ikony

Sada **524 SVG ikon** z OpenHikingMap projektu, zkopírována do `themes/` v kategoriích.

| Stav |
|------|
| Ikony jsou technicky funkční (mapsforge je načítá ze složky) |
| Vizuální styl je **Evropský outdoor/turistický**, ne český kartografický styl |
| Nejsou to ikonky dle ČÚZK nebo KČT grafiky |
| Chybí české specifické ikonky: boží muka, kaple, rozhledna v českém stylu |
| Ikonky nejsou přizpůsobeny barvě #4E4E4E (SM5 standard) — mají různé barvy |

---

## 8. Budovy

Implementovány v `poly-buildings.xslt`.

| Typ | Aktuální výplň | Stav |
|-----|---------------|------|
| Budova obecně | #E0E0E0 nebo #D0D0D0 | Blízko SM5 (#E3E3E3) |
| Kontury | šedá nebo černá | Přijatelné |

---

## 9. Typografie

| Typ | Implementace | Stav |
|-----|-------------|------|
| Města | font-style bold/regular, sans-serif | Funkční |
| Vodní toky | italic, modrá | Implementováno |
| Vrstevnicový popis | bold, hnědá #8B5818 | Správně |
| Haló (bílý obrys) | stroke-width 1.7 px typicky | Implementováno |
| Česká diakritika | UTF-8 | Funguje |

---

## 10. Ikony — chybějící reference

Při auditu XSLT souborů bylo nalezeno **5 aktivních odkazů na neexistující ikonky**. Tyto byly opraveny nebo doplněny (alpine_hut, saddle, beach, obstacle, tree.svg). Aktuálně by všechny aktivní reference měly mít fyzické soubory.

---

## 11. Celkový dojem

Mapa v aktuálním stavu vypadá jako **středoevropská outdoor mapa** (styl OpenHikingMap/OpenTopoMap), ne jako **česká turistická mapa KČT**. Základní funkce jsou implementovány — vrstevnice, cesty, hranice, turistické trasy. Chybí správná barevnost (zejména voda, vegetace) a české kartografické symboly.
