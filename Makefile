STYLE ?= CzechTouristMap

.PHONY: all theme test lint lint-shell lint-yaml lint-python lint-xml lint-kotlin up down

## Run theme build + lint + tests
all: theme lint test

## Build theme XML from XSLT source (requires Docker)
theme:
	docker compose run --rm --no-deps theme-builder sh /app/build.sh

## Run all linters
lint: lint-shell lint-yaml lint-python lint-xml lint-kotlin

lint-shell:
	shellcheck scripts/push-map-image.sh theme-builder/build.sh

lint-yaml:
	yamllint -c .yamllint.yml config/locations.yaml .github/workflows/*.yml

lint-python:
	ruff check scripts/ tests/ theme-builder/server.py

lint-xml:
	xmllint --noout src/styles/$(STYLE)/*.xslt

lint-kotlin:
	ktlint "tile-server/src/**/*.kt"

## Run theme XML validation tests
test:
	pip install -q -r tests/requirements.txt
	pytest tests/

## Start the full stack
up:
	docker compose up --build -d

## Stop the full stack
down:
	docker compose down
