# tests/

Playwright visual regression tests for CzechTouristMap render theme.

## Structure

```
tests/
  *.spec.ts       # Test files
  snapshots/      # Reference screenshots committed to git (visual baseline)
```

## How it works

Each test renders a specific map area via the tile server and compares the result against a reference screenshot stored in `snapshots/`. A diff is generated if the visual output changes.

## Usage

```bash
npx playwright test
```

To update reference snapshots after an intentional style change:

```bash
npx playwright test --update-snapshots
```

## Requirements

- Tile server running locally (`docker-compose up`)
- Node.js + Playwright (`npm install`)
