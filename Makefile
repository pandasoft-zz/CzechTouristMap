STYLE ?= CzechTouristMap

.PHONY: theme up down

## Build theme XML from XSLT source (requires Docker)
theme:
	docker compose run --rm theme-builder

## Start the full stack
up:
	docker compose up --build -d

## Stop the full stack
down:
	docker compose down
