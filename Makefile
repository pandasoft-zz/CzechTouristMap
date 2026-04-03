STYLE ?= CzechTouristMap

DEV_RUN = docker compose run --rm --no-deps --build dev

.PHONY: all theme test lint lint-shell lint-yaml lint-python lint-xml lint-kotlin up down

## Run theme build + lint + tests
all: theme lint test

## Run dev full stack
dev: up

## Build theme XML from XSLT source (requires Docker)
theme:
	docker compose run --rm --no-deps --build theme-builder sh /app/build.sh

## Run all linters (requires Docker)
lint: lint-shell lint-yaml lint-python lint-xml lint-kotlin

lint-shell:
	$(DEV_RUN) shellcheck scripts/push-map-image.sh theme-builder/build.sh

lint-yaml:
	$(DEV_RUN) yamllint -c .yamllint.yml config/locations.yaml .github/workflows/*.yml

lint-python:
	$(DEV_RUN) ruff check scripts/ tests/ theme-builder/server.py

lint-xml:
	$(DEV_RUN) xmllint --noout src/styles/$(STYLE)/*.xslt

lint-kotlin:
	$(DEV_RUN) ktlint "tile-server/src/**/*.kt"

## Run theme XML validation tests (requires Docker)
test:
	$(DEV_RUN) pytest tests/

## Start the full stack
up:
	docker compose up --build -d

## Stop the full stack
down:
	docker compose down
