"""
CzechTouristMap render theme validation tests.

Run:
    pytest tests/
    pytest tests/ -v
"""

from pathlib import Path
import urllib.request
import pytest
from lxml import etree

# ── Paths ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
THEMES_DIR = ROOT / "themes"
TESTS_DIR = ROOT / "tests"

STYLE = "CzechTouristMap"
THEME_FILE = THEMES_DIR / f"{STYLE}.xml"
XSD_FILE = TESTS_DIR / "renderTheme.xsd"
XSD_URL = (
    "https://raw.githubusercontent.com/mapsforge/mapsforge"
    "/master/resources/renderTheme.xsd"
)

# ── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def xsd() -> etree.XMLSchema:
    """Load the Mapsforge render theme XSD (download if not cached)."""
    if not XSD_FILE.exists():
        urllib.request.urlretrieve(XSD_URL, XSD_FILE)
    return etree.XMLSchema(etree.parse(str(XSD_FILE)))


@pytest.fixture(scope="session")
def theme() -> etree._ElementTree:
    """Parse the generated theme XML."""
    if not THEME_FILE.exists():
        pytest.skip(f"{THEME_FILE} not found — run ./build-theme.sh first")
    return etree.parse(str(THEME_FILE))


@pytest.fixture(scope="session")
def ns() -> dict:
    return {"rt": "http://mapsforge.org/renderTheme"}


# ── Tests: structure ─────────────────────────────────────────────────────────


def test_theme_file_exists():
    assert THEME_FILE.exists(), f"Theme not built: {THEME_FILE}"


def test_xml_well_formed(theme):
    """XML must be parseable without errors."""
    assert theme is not None


def test_schema_valid(theme, xsd):
    """Theme must conform to the Mapsforge renderTheme XSD.

    Known pre-existing OpenHiking extensions that are ignored by Mapsforge
    at runtime (symbol-scaling, align-center) are excluded from the check.
    """
    xsd.validate(theme)
    errors = [
        e.message
        for e in xsd.error_log
        if "symbol-scaling" not in e.message and "align-center" not in e.message
    ]
    assert errors == [], "Schema errors:\n" + "\n".join(f"  {e}" for e in errors)


def test_has_rendertheme_root(theme, ns):
    root = theme.getroot()
    assert root.tag == "{http://mapsforge.org/renderTheme}rendertheme"
    assert root.get("version") == "5"


def test_has_stylemenu(theme, ns):
    menus = theme.findall(".//rt:stylemenu", ns)
    assert len(menus) == 1, "Expected exactly one <stylemenu>"


def test_no_invalid_font_family(theme):
    """font-family must use Mapsforge enum values (sans_serif, not sans-serif)."""
    valid = {"default", "monospace", "sans_serif", "serif"}
    bad = []
    for el in theme.iter():
        val = el.get("font-family")
        if val and val not in valid:
            bad.append(f"<{el.tag}> font-family='{val}'")
    assert bad == [], "Invalid font-family values:\n" + "\n".join(bad)


def test_no_openhiking_branding(theme):
    """Theme must not contain OpenHiking brand name."""
    xml_str = THEME_FILE.read_text(encoding="utf-8")
    assert "OpenHiking" not in xml_str, "OpenHiking branding found in output XML"


def test_theme_size_reasonable():
    """Generated XML must be at least 500 KB (sanity check for incomplete builds)."""
    size = THEME_FILE.stat().st_size
    assert size > 500_000, f"Theme file suspiciously small: {size} bytes"
