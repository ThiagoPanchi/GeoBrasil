## Context

See `proposal.md` for motivation. The current static geodata pipeline in `scripts/prepare-static-geodata.mjs` builds the indicator catalog and embeds indicator values into sector, municipality, microregion, and UF FlatGeobuf assets. It currently maps `income` from `v0007`, and aggregates all numeric indicators by summing sector values. The requested income source zip was not present in the current workspace during planning, so implementation should treat it as a required local input for geodata preparation.

## Goals / Non-Goals

**Goals:**

- Correct the `income` indicator to use `V06004` as average monthly income of responsible persons.
- Preserve the existing count value currently represented by `v0007` as a distinct responsible-person count indicator.
- Join `V06004` values from `data/Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip` to sector records before static assets are written.
- Propagate income and responsible-person count values to all map layers.
- Keep the published app static and browser-only after assets are generated.

**Non-Goals:**

- Add a backend service or runtime CSV/ZIP parsing in the browser.
- Change choropleth classification, color scales, territorial navigation, or chart/table layout.
- Import arbitrary future income tables beyond the named zip and `V06004` column.

## Decisions

- Keep the existing `income` indicator id for true average monthly income.
  - Rationale: users already look for income under the existing indicator; correcting its source minimizes UI churn.
  - Alternative considered: add a new `average_income` id and deprecate `income`. Rejected because it would leave the misleading existing id in place unless additional migration logic were added.

- Add a separate responsible-person count indicator for the current `v0007` value.
  - Rationale: the value is not wrong as data, only mislabeled; preserving it avoids losing an available census count.
  - Alternative considered: remove `v0007` entirely. Rejected because the user identified its correct meaning and it can remain useful with an accurate label.

- Join the income aggregate table during `npm run prepare:geodata`, not at runtime.
  - Rationale: the application is a static WebGIS and already publishes prebuilt FlatGeobuf assets and a manifest.
  - Alternative considered: load the zip in the browser. Rejected because it would increase runtime payload and complexity and conflict with the existing static-asset preparation pattern.

- Aggregate `V06004` to municipality, microregion, and UF as a weighted mean using responsible-person count when available.
  - Rationale: average monthly income should not be summed across sectors; a weighted mean by responsible persons is the most defensible aggregation when the count is available.
  - Alternative considered: arithmetic mean of sector averages. Rejected because it gives very small sectors the same weight as large sectors.

## Risks / Trade-offs

- The zip file is absent from the current workspace -> Mitigate by adding a clear required-source check and documenting the expected path.
- The CSV column used for sector code may differ from existing geometry property names -> Mitigate by inspecting the zip headers during implementation and mapping to `CD_SETOR` or equivalent before joining.
- `V06004` may use Brazilian numeric formatting -> Mitigate by normalizing decimal separators and thousands separators during parsing.
- Missing income rows for some sectors can produce incomplete income coverage -> Mitigate by defaulting missing sector income to zero/null-equivalent behavior already used by numeric indicators, and report counts during preparation.
- Weighted aggregation depends on a responsible-person denominator -> Mitigate by using the corrected responsible-person count indicator as the weight and returning zero when total weight is zero.

## Migration Plan

1. Inspect the income zip headers and identify sector code, `V06004`, and responsible-person count columns.
2. Extend `prepare-static-geodata.mjs` to require and parse the income zip during static geodata preparation.
3. Join `V06004` values to normalized sector features by sector code.
4. Rename/remap the current `v0007` indicator to a responsible-person count indicator.
5. Aggregate income to municipality, microregion, and UF using weighted means.
6. Update static indicator metadata and frontend fallback normalization to match the corrected indicator ids and labels.
7. Regenerate static geodata and verify the manifest and representative map layers contain both indicators.
8. Run the frontend build and OpenSpec validation.
