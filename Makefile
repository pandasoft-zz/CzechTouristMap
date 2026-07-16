STYLE ?= CzechTouristMap

.PHONY: help up down build-pmtiles build-pmtiles-test lint

help:
	@echo "CzechTouristMap — Tegola + MapLibre GL + PMTiles"
	@echo ""
	@echo "Development (live preview):"
	@echo "  make up              Start Tegola tile server + web UI (http://localhost)"
	@echo "  make down            Stop all services"
	@echo ""
	@echo "Production (PMTiles prerendering):"
	@echo "  make build-pmtiles   Build entire Czech Republic (2h)"
	@echo "  make build-pmtiles-test  Build Blansko area only (30s)"
	@echo ""
	@echo "Styling:"
	@echo "  make edit-style      Open Mapbox GL style editor (Maputnik)"
	@echo "  make validate-style  Validate styles/CzechTouristMap.json"
	@echo ""

## Start live development stack (Tegola + web)
up:
	docker compose up --build

## Stop all services
down:
	docker compose down

## Build PMTiles for entire Czech Republic
build-pmtiles:
	chmod +x scripts/build-pmtiles.sh
	./scripts/build-pmtiles.sh --zoom-max 14

## Build PMTiles test area (Blansko, ~30 seconds)
build-pmtiles-test:
	chmod +x scripts/build-pmtiles.sh
	./scripts/build-pmtiles.sh Blansko --zoom-max 14

## Edit Mapbox GL style (requires npm + maputnik)
edit-style:
	@echo "Opening Mapbox GL style editor..."
	@echo "Install: npm install -g @mapbox/mapbox-gl-style-spec"
	npx @mapbox/mapbox-gl-style-spec styles/CzechTouristMap.json

## Validate Mapbox GL style
validate-style:
	@echo "Validating Mapbox GL style..."
	npx mapbox-gl-style-spec validate styles/CzechTouristMap.json || true
