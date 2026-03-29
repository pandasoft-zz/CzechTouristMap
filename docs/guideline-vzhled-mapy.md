# Guideline: Vzhled turistické mapy České republiky

Dokument popisuje, jak má mapa vypadat. Vychází z českých kartografických standardů — zejména ČÚZK SM5, ZTM10, znakového klíče KČT a vizuálního stylu Klubu českých turistů.

---

## 1. Cíl a měřítko

Mapa je primárně turistická, odpovídající měřítku přibližně **1:25 000 – 1:50 000** (zoom 12–16). Základní referenční standard pro barvy a znaky je **ČÚZK SM5** (1:5 000), přizpůsobený pro turistické měřítko. Turistické stezky a jejich označení vychází ze systému **KČT**.

Mapa musí být čitelná jak na obrazovce, tak v tisku. Priorita je přehlednost terénu a turistických tras.

---

## 2. Podklad mapy (základní barvy polygonů)

### 2.1 Vegetace a využití půdy

| Typ | Výplň | Poznámka |
|-----|-------|----------|
| Les (lesní pozemek) | **#C8E8A0** — středně světlá zelená (styl mapy.cz) | Opakující se symbol stromů uvnitř polygonu |
| Listnatý les | #C8E8A0 | Symbol: kruh na tyčce |
| Jehličnatý les | #B0D890 — o stupeň tmavší/chladnější zelená | Symbol: trojúhelník na tyčce |
| Smíšený les | #C8E8A0 | Střídání obou symbolů |
| Trvalý travní porost (louka) | **#FFFFEA** — velmi světlá žlutá | Drobné trávy `ıı` uvnitř |
| Zahrada, park, zeleň | **#F5FFDB** — světlá žlutozelená | Symbol lístku |
| Ovocný sad | #F5FFDB | Symbol plodu na tyčce |
| Vinice | #F5FFDB | Symbol révového listu |
| Chmelnice | #F5FFDB | Stylizovaný chmel |
| Orná půda | **#FFFFFF** — bílá | Bez vnitřního symbolu |
| Mokřad, bažina | Bílá + modré čárky | Opakující se rákosové znaky |

### 2.2 Zástavba a infrastruktura

| Typ | Výplň |
|-----|-------|
| Zástavba obecně | **#FFFFFF** nebo velmi světlá šedá |
| Průmyslová plocha | **#F0F0F0** — světlá šedá |
| Železniční plocha | **#F2E6F3** — světlá levandulová |
| Komunikace (silniční plocha) | **#FFFF99** — světlá žlutá |
| Ostatní komunikace | **#F5F5F5** — téměř bílá šedá |
| Letiště, ostatní dopravní | **#F2E6F2** — světlá šeříková |
| Skládka | #F2E6F2 |
| Sportoviště | #FFFFFF |

### 2.3 Voda

| Typ | Výplň | Kontura |
|-----|-------|---------|
| Vodní plocha, rybník, nádrž | **#E0FFFF** — světlá azurová | #00FFFF nebo #4E4E4E |
| Vodní tok (koryto >2m) | #E0FFFF | #00FFFF |

---

## 3. Vrstevnice

| Typ | Barva | Tloušťka | Popis |
|-----|-------|----------|-------|
| Základní vrstevnice | **#C07030** — teplá hnědá | 0.4–0.5 px | Každá 10 m |
| Zdůrazněná vrstevnice | #C07030 | 0.7–0.9 px | Každá 50 m |
| Doplňková vrstevnice | #D09060 — světlejší hnědá | 0.3 px, přerušovaná | 5 m |
| Popis výšky | **#8B5818** — tmavá hnědá | — | Na zdůrazněných, sans-serif bold |

Vrstevnice jsou **teplé hnědé** (ne oranžové, ne žluté). SM5 definuje #F5BE40, pro turistické měřítko se použije tmavší tón pro kontrast.

---

## 4. Komunikace

Silnice se kreslí jako **dvojlinie** (casing + výplň), výrazně odlišené hierarchicky.

| Typ | Casing (obrys) | Výplň | Šířka (casing) |
|-----|---------------|-------|----------------|
| Dálnice | tmavě šedá #444 | **#FFFF99** žlutá | široký |
| Silnice I. třídy | #555 | **#FFCC66** oranžová žlutá | střední |
| Silnice II. třídy | #666 | **#FFEE99** světlá žlutá | střední |
| Silnice III. třídy | #777 | **#FFFFFF** bílá | úzký |
| Místní komunikace | #888 | #FFFFFF | úzký |
| Polní/lesní cesta (makadám) | šedá | šedá | přerušovaná čára |
| Stezka, pěšina | — | — | tečkovaná/přerušovaná |
| Cyklostezka | modrá | modrá | tenká čára |
| Via ferrata | — | — | speciální čárkování |

Tunelové úseky se kreslí jako **přerušovaná čára** stejné barvy jako silnice.

---

## 5. Hranice

Veškeré administrativní hranice mají barvu **#FF4CFF (purpurově růžová)**, odlišené stylem čáry:

| Typ | Styl |
|-----|------|
| Státní hranice | silná plná čára + tečkování |
| Hranice kraje | střední, delší pomlčky |
| Hranice okresu | středně přerušovaná |
| Hranice obce | krátce přerušovaná |
| Katastrální hranice | jemně přerušovaná |
| Chráněné území (CHKO, NP) | **#00FF00** zelená, jemně přerušovaná |

---

## 6. Železnice

Hlavní trať: **dvojlinka s příčnými pražci** (klasický symbol kolejí). Barva osy #333333.
Tramvaj, trolejbus: tenčí dvojlinka, bez pražců nebo s lehčím vzorem.
Visutá lanovka: přerušovaná čára s kroužky podpěr.

---

## 7. Turistické stezky (KČT)

Turistické stezky jsou **klíčovým prvkem** mapy. Vykreslují se jako barevný přejet přes silniční linii.

| Barva | Hex | Typ tras |
|-------|-----|---------|
| Červená | **#E8000C** | Hlavní turistické trasy, dálkové pochody |
| Modrá | **#0066FF** | Regionální trasy |
| Zelená | **#00AA00** | Lokální trasy |
| Žlutá | **#DDBB00** | Místní propojovací trasy |

Značení KČT na mapě:
- Jako **barevný highlight** podél silniční osy (pruh 1,5–2 px)
- Na turistických vrcholech a uzlech: **ikonka rozcestníku**
- Popis trasy volitelně

Stezky se zobrazují od **zoom 11** výše.

---

## 8. Budovy

| Typ | Výplň | Kontura |
|-----|-------|---------|
| Běžná budova | **#E3E3E3** světlá šedá | #000000 černá, 0.5 px |
| Kostel | #E3E3E3 | černá + symbol kříže uvnitř nebo vedle |
| Průmyslová budova | #E0DCD8 | šedá |
| Zřícenina | šrafování / přerušená kontura | |

---

## 9. POI symboly

Symboly POI jsou ve stylu **ČÚZK/topografickém** — tmavě šedé (#4E4E4E), střídmé, vektorové.

| Kategorie | Příklady symbolů |
|-----------|-----------------|
| Náboženské objekty | Kříž (kostel), Davidova hvězda (synagoga), půlměsíc (mešita) |
| Turistická infrastruktura | Přístřešek, chata, kemp, rozhledna, informační centrum |
| Přírodní zajímavosti | Pramen, jeskynní vstup, vrchol, průsmyk, vodopád |
| Historické objekty | Hrad, zřícenina, monument, boží muka |
| Záchranné body | Záchranná stanice, defibrilátor |

Zobrazení od **zoom 13** výše, plně od zoom 15. Ubytování (camp_site, hotel…) od zoom 13.

---

## 10. Vodní toky

| Typ | Styl |
|-----|------|
| Velký tok (>2 m) | Vyplněný polygon #E0FFFF, kontura #00FFFF |
| Malý tok (<2 m) | Tenká čára #00FFFF nebo #5599CC, šířka 0.5–1 px |
| Směrová šipka | Na malých tocích volitelně |

---

## 11. Typografie (popisky)

| Typ popisku | Styl | Barva | Halo |
|-------------|------|-------|------|
| Velká města (city, capital) | bold_italic, sans-serif | #000000 | bílý, stroke-width **5** |
| Města (town) | bold, sans-serif | #000000 | bílý, stroke-width **4** |
| Obce, vesnice | Regular nebo bold, sans-serif | #000000 | bílý, stroke-width 3 |
| Vodní toky a plochy | Italic, sans-serif | **#3366CC** modrá | bílý, stroke-width 1.5 |
| Vodní plochy (pond, rybník) | Italic, font-size 9–12 dle zoomu | #3366CC | stroke-width 1.5 — ne bold, ne velké písmo |
| Výška bodu | Regular, malé písmo | **#8B5818** hnědá |
| Vrstevnicový popis | Bold, malé písmo, kopíruje linii | #8B5818 |
| Lesy, louky (plošné popisky) | Italic, rozptýlené | #336600 tmavě zelená |
| Silniční číslo (E50, D1) | Štítek s barevným pozadím | dle typu silnice |

Všechny popisky mají **bílý haló (stroke)** pro čitelnost na barevném pozadí (stroke-width 1.5–2 px).

---

## 12. Zobrazení dle zoom úrovně

| Zoom | Co se zobrazuje |
|------|----------------|
| 7–9 | Stát, kraje, velká města, dálnice, hlavní silnice |
| 10–11 | Okresy, střední města, silnice II. třídy, železnice, lesy/voda |
| 12–13 | Obce, silnice III. třídy, turistické trasy, makadamy, vrstevnice základní |
| 14–15 | Vše výše + pěšiny, detailní zástavba, POI, doplňkové vrstevnice |
| 16+ | Budovy jednotlivě, detailní cesty, plné POI, všechny vrstevnice |

---

## 13. Obecné zásady

- Mapa musí být **čitelná bez turistických tras** i s nimi
- Turistické stezky **nesmějí zakrývat** popis silnic a obcí
- Barevná paleta odpovídá **českému kartografickému standardu** — teplé hnědé vrstevnice, světlá žlutozelená vegetace, purpurové hranice
- Ikony POI jsou **vektorové SVG**, ne rastrové PNG
- Mapa respektuje **českou terminologii** v popisech (ne anglické OSM tagy)
