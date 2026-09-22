## Why

The current indicator catalog exposes literacy, ethnicity/race, gender/sex, and age group as single numeric indices, but those values do not make sense as standalone choropleth indicators in the current UI. Removing them reduces misleading map, chart, table, and popup choices.

## What Changes

- Remove the following indicators from the public MVP indicator catalog: `literacy`, `ethnicity_race`, `gender_sex`, and `age_group`.
- Stop publishing those indicators in regenerated static geodata assets and the manifest.
- Update frontend fallback indicator normalization so legacy/raw feature properties no longer expose those removed indicators as selectable values.
- Keep the remaining indicators available: population, demographic density, households, responsible-person count, and average monthly income of responsible persons.
- Preserve source geometry properties where they already exist; this change removes them from the user-facing indicator model rather than deleting raw source data fields.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `census-indicators`: Removes nonsensical categorical/single-value indicators from the MVP catalog and displayed indicator values.

## Impact

- Affected areas: static geodata preparation indicator list, generated `public/geodata` assets and manifest, frontend fallback indicator normalization, and indicator-related specs.
- No backend/API service changes are required because the published WebGIS uses static assets.
- Existing URLs or browser state that reference removed indicator ids should fall back through existing selected-indicator handling rather than continuing to display those indicators.
