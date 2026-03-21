#!/usr/bin/env python3
"""Generate docs/SYMBOLS.md — visual overview of all theme icons.

Run from project root:
    python scripts/gen_symbols_md.py
"""
import os
import glob

THEMES_DIR = "../themes"
OUT_FILE = "docs/SYMBOLS.md"

ICON_NAMES = {
    # accomodation
    "camp_site": "Kemp", "camp_site_basic": "Kemp (základní)", "chalet": "Chata",
    "hostel": "Hostel", "hotel": "Hotel", "summer_camp": "Letní tábor",
    # barrier
    "border_control": "Hraniční přechod", "gate": "Brána", "gate_closed": "Brána (zavřená)",
    "gate_open": "Brána (otevřená)", "lift_gate": "Závora", "stile": "Přelaz",
    "toll_booth": "Mýtná brána",
    # culture
    "artwork": "Umělecké dílo", "casino": "Kasino", "cinema": "Kino",
    "cross": "Kříž / boží muka", "fountain": "Kašna / fontána", "gallery": "Galerie",
    "library": "Knihovna", "museum": "Muzeum", "obelisk": "Obelisk", "theatre": "Divadlo",
    # education
    "kindergarten": "Mateřská škola", "observatory": "Observatoř",
    "radio_telescope": "Radioteleskop", "school": "Škola", "university": "Univerzita",
    # financial
    "atm": "Bankomat", "bank": "Banka",
    # food
    "cafe": "Kavárna", "confectionery": "Cukrárna", "fast_food": "Rychlé občerstvení",
    "ice_cream": "Zmrzlina", "pub": "Hospoda / pivnice", "restaurant": "Restaurace",
    "winery": "Vinárna / vinný sklep",
    # healthcare
    "dentist": "Zubař", "doctors": "Lékař", "hospital": "Nemocnice", "pharmacy": "Lékárna",
    # hiking
    "alpine_hut": "Horská chata", "basic_hut": "Základní útulna", "bench": "Lavička",
    "board": "Informační tabule", "board_notice": "Vývěska", "checkpoint": "Kontrolní bod",
    "firepit": "Ohniště", "guidepost": "Rozcestník", "lookout_tower": "Rozhledna",
    "lookout_tower_closed": "Rozhledna (zavřená)", "mountain_rescue": "Horská záchranná služba",
    "obstacle": "Překážka", "obstacle_fallen_tree": "Spadlý strom",
    "obstacle_general": "Překážka (obecná)", "obstacle_incline": "Příkrý svah",
    "obstacle_vegetation": "Hustá vegetace", "picnic_shelter": "Přístřešek pro piknik",
    "picnic_site": "Piknikové místo", "shelter": "Přístřešek / závětrník",
    "viewpoint": "Vyhlídka", "wilderness_hut": "Útulna v divočině",
    # historic
    "archeological": "Archeologické naleziště", "castle": "Hrad / zámek",
    "city_gate": "Městská brána", "clock_tower": "Zvonice / hodinová věž",
    "crane_well": "Studna (rumpál)", "defensive_tower": "Obranná věž",
    "graveyard": "Hřbitov", "hillfort": "Hradiště", "kiln": "Milíř / pec",
    "lime_kiln": "Vápenka", "manor": "Tvrz / manský dvůr", "memorial": "Pomník / pamětní deska",
    "mine": "Důl (historický)", "palace": "Palác", "plaque": "Pamětní deska",
    "quarry": "Lom (historický)", "ruins": "Zřícenina", "ruins_castle": "Zřícenina hradu",
    "ruins_church": "Zřícenina kostela", "ruins_manor": "Zřícenina tvrze",
    "tumulus": "Mohyla / tumulus", "water_well": "Studna", "watermill": "Vodní mlýn",
    "windmill": "Větrný mlýn",
    # industrial
    "adit": "Štola", "chimney": "Tovární komín", "communication_tower": "Komunikační věž",
    "cooling_tower": "Chladící věž", "dam": "Přehrada / hráz",
    "excavation": "Těžba (povrchová)", "factory": "Továrna / závod",
    "hydro_plant": "Vodní elektrárna", "lighthouse": "Maják", "lock_gate": "Plavební komora",
    "mineshaft": "Důlní šachta", "nuclear_plant": "Jaderná elektrárna",
    "observation_tower": "Pozorovatelna", "petroleum_well": "Ropná sonda",
    "power_plant": "Elektrárna", "radar_tower": "Radarová věž", "tower_general": "Věž",
    "wastewater_plant": "Čistírna odpadních vod", "watchtower": "Strážní věž",
    "water_tower": "Vodárenská věž", "water_works": "Vodárna / úpravna vody",
    "weir": "Jez", "wind_turbine": "Větrná turbína",
    # leisure
    "attraction": "Turistická atrakce", "beach": "Pláž", "bird_hide": "Pozorovatelna ptáků",
    "botanical_garden": "Botanická zahrada", "climbing": "Horolezectví",
    "fitness_centre": "Fitness centrum", "fitness_station": "Fitness stanice (venkovní)",
    "golf": "Golf", "horse_riding": "Jezdectví", "ice_rink": "Kluziště",
    "motor": "Motoristický sport", "playground": "Hřiště", "public_bath": "Koupaliště",
    "public_bath_hot": "Termální koupaliště", "shooting": "Střelnice",
    "skiing": "Lyžování", "soccer": "Fotbal", "spa": "Lázně / spa",
    "swimming": "Plavání / bazén", "tennis": "Tenis", "water_ski": "Vodní lyžování",
    "zoo": "ZOO",
    # military
    "bunker": "Bunkr",
    # natural
    "bay": "Zátoka", "cave_entrance": "Jeskyně (vstup)", "cliff": "Skalní stěna / sráz",
    "columnar_jointing": "Sloupcová odlučnost", "doline": "Závrt / dolina",
    "geyser": "Gejzír", "hot_spring": "Horký pramen", "mineral_spring": "Minerální pramen",
    "mountain_pass": "Průsmyk / sedlo", "peak": "Vrchol", "rock": "Skála / skalní útvar",
    "saddle": "Sedlo", "sinkhole": "Propadliště", "spring": "Pramen",
    "spring_drinking": "Pitný pramen", "spring_non_drinking": "Neupitný pramen",
    "spring_seasonal": "Sezónní pramen", "stone": "Balvan / kámen",
    "summit_cross": "Vrcholový kříž", "tree": "Strom (solitér)",
    "volcanic_vent": "Sopečný průduch", "volcano": "Sopka",
    "volcano_dormant": "Spící sopka", "waterfall": "Vodopád",
    # patterns
    "bare_rock": "Holá skála", "cemetery": "Hřbitov (vzor)", "cemetery2": "Hřbitov (vzor alt.)",
    "contamination": "Kontaminovaná plocha", "lava_field": "Lávové pole",
    "military": "Vojenské pásmo (vzor)", "minefield": "Minové pole",
    "orchard": "Sad (vzor)", "park": "Park (vzor)", "prison": "Věznice (vzor)",
    "quarry": "Lom (vzor)", "reedbed": "Rákosí (vzor)", "sand": "Písčina (vzor)",
    "scree": "Suť (vzor)", "scrub": "Křoviny (vzor)", "shingle": "Štěrkový nános",
    "solar": "Solární panely", "swamp": "Bažina (vzor)", "tidalflat": "Přílivová plochina",
    "vineyard": "Vinice (vzor)", "wetland": "Mokřad (vzor)", "zoo": "ZOO (vzor)",
    # religion
    "campanile": "Zvonice (kampanila)", "cathedral": "Katedrála", "chapel": "Kaple",
    "christian_church": "Křesťanský kostel", "church": "Kostel", "minaret": "Minaret",
    "monastery": "Klášter", "mosque": "Mešita", "stupa": "Stupa",
    "synagogue": "Synagoga", "wayside_cross": "Kříž u cesty / boží muka",
    # services
    "ambulance_station": "Záchranná stanice", "community_centre": "Komunitní centrum",
    "courthouse": "Soud", "drinking_water": "Pitná voda", "fire_station": "Hasičská stanice",
    "marketplace": "Tržiště", "office": "Úřad", "police": "Policie",
    "post_office": "Pošta", "recycling": "Recyklační místo", "toilets": "WC / toalety",
    "townhall": "Radnice / obecní úřad",
    # shop
    "bakery": "Pekárna", "convenience": "Smíšené zboží", "greengrocer": "Zelinář",
    "kiosk": "Kiosek / stánek", "shop": "Obchod (obecný)",
    "shopping_center": "Obchodní centrum", "supermarket": "Supermarket",
    "tickets": "Pokladna / vstupenky",
    # signs
    "access_customers": "Přístup jen zákazníkům", "access_private": "Soukromý přístup",
    "cycleway": "Cyklotrasa", "drift": "Nebezpečí skluzu", "fixme": "Chyba v datech (fixme)",
    "no-entry": "Zákaz vstupu", "oneway": "Jednosměrný provoz",
    "oneway-back": "Jednosměrný provoz (zpět)",
    "sac_t2": "SAC T2 — turistická cesta",
    "sac_t3": "SAC T3 — náročná turistika",
    "sac_t4": "SAC T4 — alpská turistika",
    "sac_t5": "SAC T5 — náročná alpská turistika",
    "sac_t6": "SAC T6 — obtížná alpská turistika",
    # transportation
    "aerialway_station": "Lanovka (stanice)", "airport": "Letiště",
    "bus_stop": "Zastávka autobusu", "bus_stop_small": "Zastávka (malá)",
    "ferry_terminal": "Přístaviště / přívoz", "fuel": "Čerpací stanice",
    "funicular": "Pozemní lanovka", "helipad": "Heliport",
    "light_rail": "Lehká kolejová doprava (tram)", "parking": "Parkoviště",
    "railway_crossing": "Železniční přejezd", "subway_station": "Metro",
    "train_station": "Nádraží",
    # wilderness
    "feeding_place": "Přikrmiště zvěře", "ford": "Brod",
    "hunting_stand": "Posed / myslivecká věž", "watering_place": "Napajiště zvěře",
}

SECTIONS = [
    ("hiking",        "Turistická infrastruktura",   "Stezky, útulny, rozhledny, odpočívadla, rozcestníky"),
    ("natural",       "Přírodní prvky",              "Vrcholy, sedla, prameny, jeskyně, skály, vodopády"),
    ("patterns",      "Vzory ploch",                 "Výplňové vzory pro polygony (les, mokřad, vinice, suť…)"),
    ("historic",      "Historické objekty",          "Hrady, zříceniny, mlýny, pomníky, mohyly"),
    ("religion",      "Náboženské objekty",          "Kostely, kaple, kláštery, kříže"),
    ("industrial",    "Průmysl a technické stavby",  "Věže, elektrárny, přehrady, průmyslové objekty"),
    ("accomodation",  "Ubytování",                   "Hotely, horské chaty, kempy, útulny"),
    ("food",          "Stravování",                  "Restaurace, hospody, kavárny, rychlé občerstvení"),
    ("services",      "Veřejné služby",              "Pošta, policie, radnice, WC, záchranáři"),
    ("shop",          "Obchody",                     "Potraviny, supermarkety, tržiště, kiosky"),
    ("healthcare",    "Zdravotnictví",               "Nemocnice, lékárny, lékaři, zubaři"),
    ("education",     "Vzdělání",                    "Školy, university, observatoře"),
    ("financial",     "Finance",                     "Banky, bankomaty"),
    ("leisure",       "Sport a volný čas",           "Hřiště, bazény, kluziště, golf, zoo"),
    ("transportation","Doprava",                     "Nádraží, zastávky, parkoviště, letiště, přístaviště"),
    ("barrier",       "Zábrany a přechody",          "Brány, závory, přelazy, celnice, mýto"),
    ("wilderness",    "Divoká příroda a myslivost",  "Posed, brod, přikrmiště, napajiště"),
    ("military",      "Vojenské objekty",            "Bunkry, vojenská pásma"),
    ("culture",       "Kultura a umění",             "Muzea, divadla, galerie, kina, fontány"),
    ("signs",         "Značky a upozornění",         "Jednosměrky, SAC stupnice obtížnosti, přístupová omezení"),
]


def icon_row(folder, fname):
    name = os.path.splitext(fname)[0]
    label = ICON_NAMES.get(name, name.replace("_", " ").title())
    img = f'<img src="{THEMES_DIR}/{folder}/{fname}" width="32" height="32" alt="{name}">'
    return f"| {img} | {label} | `{folder}/{fname}` |"


def generate():
    lines = []
    lines.append("# Czech Tourist Map — Přehled symbolů\n")
    lines.append("> Tento soubor je generován skriptem `scripts/gen_symbols_md.py`. Ruční úpravy budou přepsány.\n")
    lines.append("> Zdroj ikon: [openhiking-mapsforge](https://github.com/openhiking/openhiking-mapsforge) (GPL-3.0)\n")
    lines.append("")

    # TOC
    lines.append("## Obsah\n")
    for folder, title, _ in SECTIONS:
        anchor = title.lower().replace(" ", "-").replace("/", "").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ě","e").replace("š","s").replace("č","c").replace("ř","r").replace("ž","z").replace("ý","y")
        lines.append(f"- [{title}](#{anchor})")
    lines.append("- [Turistické značení KČT](#turisticke-znaceni-kct)")
    lines.append("- [OSMC symboly](#osmc-symboly)")
    lines.append("")
    lines.append("---\n")

    # Main sections
    for folder, title, subtitle in SECTIONS:
        folder_path = os.path.join("themes", folder)
        if not os.path.isdir(folder_path):
            continue
        files = sorted(f for f in os.listdir(folder_path)
                       if f.endswith(".svg") or f.endswith(".png"))
        if not files:
            continue

        lines.append(f"\n## {title}\n")
        lines.append(f"_{subtitle}_\n")
        lines.append("| Ikona | Název | Soubor |")
        lines.append("|:-----:|-------|--------|")
        for fname in files:
            lines.append(icon_row(folder, fname))

    # KCT trail markers
    lines.append("\n---\n")
    lines.append("\n## Turistické značení KČT\n")
    lines.append("_Systém KČT — barevné 3-proužkové turistické značky (červená / modrá / zelená / žlutá)_\n")

    variants = [
        ("major",       "Dálková trasa"),
        ("local",       "Místní trasa"),
        ("learning",    "Naučná stezka"),
        ("interesting", "Zajímavé místo"),
        ("peak",        "Vrchol"),
        ("spring",      "Pramen"),
        ("ruin",        "Zřícenina"),
    ]
    colors = [("red", "Červená"), ("green", "Zelená"), ("blue", "Modrá"), ("yellow", "Žlutá")]

    lines.append("| Varianta | Červená | Zelená | Modrá | Žlutá |")
    lines.append("|----------|:-------:|:------:|:-----:|:-----:|")
    for v_key, v_name in variants:
        row = [f"**{v_name}**"]
        for c_key, _ in colors:
            fname = f"czsk-{c_key}-{v_key}.svg"
            fpath = os.path.join(THEMES_DIR, "symbols", fname)
            if os.path.exists(fpath):
                row.append(f'<img src="{THEMES_DIR}/symbols/{fname}" width="32">')
            else:
                row.append("—")
        lines.append("| " + " | ".join(row) + " |")

    lines.append("\n### Velikostní varianty\n")
    lines.append("Každá značka existuje ve třech velikostech pro různé úrovně přiblížení:\n")
    lines.append("| Soubor | Ukázka |")
    lines.append("|--------|:------:|")
    for suffix in ["", "-2", "-3"]:
        fname = f"czsk-red-major{suffix}.svg"
        label = f"`czsk-red-major{suffix}.svg`"
        lines.append(f"| {label} | <img src=\"{THEMES_DIR}/symbols/{fname}\" width=\"32\"> |")

    # OSMC symbols
    lines.append("\n---\n")
    lines.append("\n## OSMC symboly\n")
    lines.append("_Mezinárodní standard pro turistické značení — [osmc:symbol](https://wiki.openstreetmap.org/wiki/Key:osmc:symbol)_\n")

    sym_dir = os.path.join("themes", "symbols")
    osmc_files = sorted(f for f in os.listdir(sym_dir) if f.startswith("osmc-"))

    lines.append("| Ikona | Soubor |")
    lines.append("|:-----:|--------|")
    for fname in osmc_files:
        img = f'<img src="{THEMES_DIR}/symbols/{fname}" width="32" alt="{fname}">'
        lines.append(f"| {img} | `{fname}` |")

    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    content = generate()
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {OUT_FILE}")
