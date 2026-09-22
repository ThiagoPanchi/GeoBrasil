## 1. Indicator Catalog Cleanup

- [x] 1.1 Remove `literacy`, `ethnicity_race`, `gender_sex`, and `age_group` from the static geodata indicator catalog in `scripts/prepare-static-geodata.mjs`, and verify the remaining catalog contains population, density, households, responsible-person count, and income.
- [x] 1.2 Remove the four deleted indicator ids from sector indicator creation and aggregate defaults, and verify generated `properties.indicators` objects no longer include those keys.
- [x] 1.3 Remove the four deleted indicator ids from frontend fallback normalization in `src/api.ts`, and verify raw-property fallback exposes only supported indicators.

## 2. Static Asset Regeneration

- [x] 2.1 Run `npm run prepare:geodata` and verify it completes successfully with the existing local source data.
- [x] 2.2 Verify `public/geodata/manifest.json` no longer lists `literacy`, `ethnicity_race`, `gender_sex`, or `age_group` in `indicators`.
- [x] 2.3 Inspect representative generated UF, municipality, microregion, and sector records and verify `properties.indicators` omit the removed indicator ids while retaining supported indicators.

## 3. UI Behavior Verification

- [x] 3.1 Verify the indicator selector, map legend, chart/table labels, and popup/report labels only use the reduced indicator catalog.
- [x] 3.2 Verify selecting each remaining indicator still styles the map and updates chart/table values.
- [x] 3.3 Verify stale or missing removed indicator values do not appear as selectable/reportable indicators.

## 4. Final Verification

- [x] 4.1 Run the frontend build or available test command and verify it passes.
- [x] 4.2 Run OpenSpec validation for `remove-nonsensical-census-indicators` and verify it passes.
