## Context

See `proposal.md` for motivation. The user-facing indicator catalog is defined in `scripts/prepare-static-geodata.mjs`, published in `public/geodata/manifest.json`, and consumed by the frontend through `getIndicators`. The same preparation script currently embeds the removed indicator values into each feature's `properties.indicators`, and `src/api.ts` has a fallback path that still exposes those ids when reading raw feature properties without embedded indicators.

## Goals / Non-Goals

**Goals:**

- Remove `literacy`, `ethnicity_race`, `gender_sex`, and `age_group` from the public indicator catalog.
- Stop generating those ids inside published `properties.indicators` values.
- Remove those ids from frontend fallback indicator normalization.
- Regenerate static geodata so the manifest and FlatGeobuf/GeoJSON assets match the reduced catalog.
- Preserve the remaining indicators and existing map/chart/table behavior for those indicators.

**Non-Goals:**

- Delete raw source properties such as `v0003`, `v0004`, `v0005`, or `v0006` from source geometries if they are present.
- Add new categorical distribution UI or redesign choropleth classification.
- Change income, responsible-person count, density, population, or household calculations.
- Add compatibility aliases for the removed indicator ids.

## Decisions

- Remove the ids at the catalog source rather than only hiding them in the selector.
  - Rationale: the catalog drives selector options, report popup labels, chart/table labels, and published manifest metadata; removing them at the source keeps all user-facing surfaces consistent.
  - Alternative considered: filter the options in the UI only. Rejected because removed indicator values would still be present in generated assets and could leak into popups or future UI.

- Remove generated indicator values from normalized assets while leaving raw properties untouched.
  - Rationale: static FlatGeobuf features preserve original source attributes, but `properties.indicators` is the public indicator model consumed by the app.
  - Alternative considered: strip raw source properties from every feature. Rejected because it would be broader, riskier, and unnecessary for removing user-facing indicators.

- Do not add fallback support for removed indicator ids.
  - Rationale: if a stale local state references a removed id, the app should resolve via existing selected-indicator/default behavior instead of continuing to support removed indicators.
  - Alternative considered: keep fallback values for compatibility. Rejected because it would contradict the removal from displayed indicator values.

## Risks / Trade-offs

- Existing generated assets may still contain removed indicators until regenerated -> Mitigate by running `npm run prepare:geodata` as part of implementation and verifying `manifest.json` and representative assets.
- Stale browser state may reference a removed selected indicator -> Mitigate by verifying the app handles the reduced manifest and defaults to an available indicator path where applicable.
- Removing values from `properties.indicators` may reduce report popup rows -> Expected outcome; verify reports list only remaining supported indicators.
- Static asset regeneration may be time-consuming and touches many generated files -> Mitigate by using the existing `prepare:geodata` command and verifying build afterward.

## Migration Plan

1. Remove the four indicator definitions from `scripts/prepare-static-geodata.mjs`.
2. Remove the four ids from sector indicator creation, aggregate defaults, and frontend fallback normalization.
3. Run `npm run prepare:geodata` to regenerate manifest and static assets.
4. Verify `public/geodata/manifest.json` lists only supported indicators.
5. Inspect representative generated feature `properties.indicators` values to confirm removed ids are absent.
6. Run the frontend build and OpenSpec validation.
