# ADR 0007: Renovate updates dependencies and merges minor and patch updates

- Status: Accepted
- Date: 2026-11-11

## Context

The repository has npm packages, Maven dependencies (Planetiler), Python tools and GitHub Actions.
Nobody updated them on a schedule. The account is on GitHub Pro, so private repositories can have rulesets
with required checks, and GitHub auto-merge works.

## Decision

- The Mend Renovate App reads `renovate.json` (`config:recommended`).
- Minor and patch updates merge themselves (`platformAutomerge`): GitHub merges the pull request when the
  required checks pass.
- Majors and 0.x versions wait for a human.
- A ruleset on `main` requires the check `check` (`check.yml`). "Allow auto-merge" is on in the settings.

## Consequences

- `check.yml` is the only gate before a merge. An update that breaks the map but passes `check` can land.
  `maps.yml` builds from `main` once a month, so a bad update is found there at the latest.
- Do not add a `paths` filter to `check.yml`: a required check that is skipped stays pending, and the pull
  request never merges.
