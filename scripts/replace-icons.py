"""
Download OSM Carto SVG icons and replace corresponding files in themes/.

Icons that have a direct OSM Carto equivalent are downloaded and replaced.
Icons without an equivalent are left unchanged.

Usage:
    python scripts/replace-icons.py [--dry-run]
"""

import argparse
import sys
import urllib.request
from pathlib import Path

BASE_URL = "https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/symbols/"

# Mapping: local themes/path -> OSM Carto symbols/path
MAPPING = {
    # food
    "food/cafe.svg":              "amenity/cafe.svg",
    "food/fast_food.svg":         "amenity/fast_food.svg",
    "food/ice_cream.svg":         "amenity/ice_cream.svg",
    "food/pub.svg":               "amenity/pub.svg",
    "food/restaurant.svg":        "amenity/restaurant.svg",
    # healthcare
    "healthcare/dentist.svg":     "amenity/dentist.svg",
    "healthcare/doctors.svg":     "amenity/doctors.svg",
    "healthcare/hospital.svg":    "amenity/hospital.svg",
    "healthcare/pharmacy.svg":    "amenity/pharmacy.svg",
    # financial
    "financial/atm.svg":          "amenity/atm.svg",
    "financial/bank.svg":         "amenity/bank.svg",
    # services
    "services/drinking_water.svg": "amenity/drinking_water.svg",
    "services/recycling.svg":     "amenity/recycling.svg",
    "services/toilets.svg":       "amenity/toilets.svg",
    "services/townhall.svg":      "amenity/town_hall.svg",
    "services/fire_station.svg":  "amenity/firestation.svg",
    "services/police.svg":        "amenity/police.svg",
    "services/post_office.svg":   "amenity/post_office.svg",
    "services/courthouse.svg":    "amenity/courthouse.svg",
    # culture
    "culture/cinema.svg":         "amenity/cinema.svg",
    "culture/library.svg":        "amenity/library.svg",
    "culture/theatre.svg":        "amenity/theatre.svg",
    "culture/casino.svg":         "amenity/casino.svg",
    "culture/fountain.svg":       "amenity/fountain.svg",
    # barrier
    "barrier/gate.svg":           "barrier/gate.svg",
    "barrier/gate_open.svg":      "barrier/gate.svg",
    "barrier/gate_closed.svg":    "barrier/gate.svg",
    "barrier/lift_gate.svg":      "barrier/lift_gate.svg",
    "barrier/stile.svg":          "barrier/stile.svg",
    "barrier/toll_booth.svg":     "barrier/toll_booth.svg",
    # transportation
    "transportation/fuel.svg":    "amenity/fuel.svg",
    "transportation/helipad.svg": "amenity/helipad.svg",
    "transportation/parking.svg": "amenity/parking.svg",
    "transportation/bus_stop.svg":      "highway/bus_stop.svg",
    "transportation/bus_stop_small.svg": "highway/bus_stop.svg",
    "transportation/ferry_terminal.svg": "amenity/ferry.svg",
    "transportation/railway_crossing.svg": "barrier/level_crossing.svg",
    # hiking / outdoor
    "hiking/bench.svg":           "amenity/bench.svg",
    "hiking/shelter.svg":         "amenity/shelter.svg",
    "hiking/firepit.svg":         "leisure/firepit.svg",
    "hiking/picnic_site.svg":     "amenity/bench.svg",
    # natural
    "natural/cave_entrance.svg":  "natural/cave.svg",
    "natural/peak.svg":           "natural/peak.svg",
    "natural/saddle.svg":         "natural/saddle.svg",
    "natural/spring.svg":         "natural/spring.svg",
    "natural/spring_drinking.svg": "natural/spring.svg",
    "natural/spring_non_drinking.svg": "natural/spring.svg",
    "natural/spring_seasonal.svg": "natural/spring.svg",
    "natural/waterfall.svg":      "natural/waterfall.svg",
    "natural/mountain_pass.svg":  "natural/saddle.svg",
    # historic
    "historic/archeological.svg": "historic/archaeological_site.svg",
    "historic/castle.svg":        "historic/castle.svg",
    "historic/city_gate.svg":     "historic/city_gate.svg",
    "historic/manor.svg":         "historic/manor.svg",
    "historic/memorial.svg":      "historic/memorial.svg",
    "historic/palace.svg":        "historic/palace.svg",
    "historic/plaque.svg":        "historic/plaque.svg",
    "historic/ruins.svg":         "historic/castle.svg",
    "historic/ruins_castle.svg":  "historic/castle.svg",
    "historic/graveyard.svg":     "historic/memorial.svg",
    "culture/obelisk.svg":        "historic/obelisk.svg",
    # religion
    "religion/church.svg":        "religion/christian.svg",
    "religion/christian_church.svg": "religion/christian.svg",
    "religion/cathedral.svg":     "religion/christian.svg",
    "religion/chapel.svg":        "religion/christian.svg",
    "religion/mosque.svg":        "religion/muslim.svg",
    "religion/synagogue.svg":     "religion/jewish.svg",
    "religion/stupa.svg":         "religion/buddhist.svg",
    # leisure
    "leisure/bird_hide.svg":      "leisure/bird_hide.svg",
    "leisure/playground.svg":     "leisure/playground.svg",
    "leisure/golf.svg":           "leisure/golf.svg",
    "leisure/fitness_centre.svg": "leisure/fitness.svg",
    "leisure/fitness_station.svg": "leisure/fitness.svg",
    "leisure/spa.svg":            "leisure/sauna.svg",
    # industrial / man_made
    "military/bunker.svg":                "man_made/bunker.svg",
    "industrial/chimney.svg":             "man_made/chimney.svg",
    "industrial/communication_tower.svg": "man_made/communications_tower.svg",
    "industrial/cooling_tower.svg":       "man_made/tower_cooling.svg",
    "industrial/lighthouse.svg":          "man_made/lighthouse.svg",
    "industrial/observation_tower.svg":   "man_made/tower_observation.svg",
    "industrial/tower_general.svg":       "man_made/tower_generic.svg",
    "industrial/water_tower.svg":         "man_made/water_tower.svg",
    "industrial/wind_turbine.svg":        "man_made/generator_wind.svg",
    "historic/windmill.svg":              "man_made/windmill.svg",
    "industrial/watchtower.svg":          "man_made/tower_observation.svg",
    "industrial/radar_tower.svg":         "man_made/mast_communications.svg",
    # wilderness
    "wilderness/hunting_stand.svg": "amenity/hunting_stand.svg",
    "wilderness/ford.svg":          "highway/ford.svg",
    # office
    "services/office.svg":         "office/embassy.svg",
    # accommodation - use OSM Carto tourism equivalents where available
    "accomodation/hotel.svg":      "amenity/shelter.svg",
    "accomodation/hostel.svg":     "amenity/shelter.svg",
}


def fetch_svg(osm_path: str) -> bytes | None:
    url = BASE_URL + osm_path
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return resp.read()
    except Exception as e:
        print(f"  WARN: failed to fetch {url}: {e}", file=sys.stderr)
        return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without writing files")
    args = parser.parse_args()

    themes_dir = Path(__file__).parent.parent / "themes"

    replaced = []
    skipped = []

    for local_rel, osm_rel in sorted(MAPPING.items()):
        local_path = themes_dir / local_rel
        if not local_path.exists():
            skipped.append((local_rel, "local file not found"))
            continue

        print(f"  {local_rel} <- {osm_rel}")
        if args.dry_run:
            replaced.append(local_rel)
            continue

        content = fetch_svg(osm_rel)
        if content is None:
            skipped.append((local_rel, f"download failed: {osm_rel}"))
            continue

        local_path.write_bytes(content)
        replaced.append(local_rel)

    print(f"\nReplaced: {len(replaced)}")
    if skipped:
        print(f"Skipped:  {len(skipped)}")
        for path, reason in skipped:
            print(f"  - {path}: {reason}")


if __name__ == "__main__":
    main()
