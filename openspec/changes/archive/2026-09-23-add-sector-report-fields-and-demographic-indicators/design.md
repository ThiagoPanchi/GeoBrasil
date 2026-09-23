## Context

See `proposal.md` for motivation. Static geodata preparation currently reads sector geometries from `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`, joins income by `CD_SETOR`, derives sector indicators, aggregates counts to municipality/microregion/UF, and writes a manifest plus partitioned FlatGeobuf assets. The frontend reads indicator metadata from `public/geodata/manifest.json`, normalizes feature properties into `MunicipalityDetails`, and renders map-click reports from the indicator catalog.

The requested fields split into two groups: selectable numeric indicators and report-only sector context. `data/Agregados_por_setores_demografia_BR.zip` contains `V01007` and `V01008`. `data/Agregados_por_setores_cor_ou_raca_BR.zip` contains `V01317` through `V01321` in the CSV header. The sector FlatGeobuf source already carries `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO`.

## Goals / Non-Goals

**Goals:**
- Add the requested sex and color/race counts as first-class selectable indicators across map styling, chart/table rows, and reports.
- Aggregate the new count indicators from sectors to municipality, microregion, and UF by summing sector values.
- Preserve report-only sector attributes separately from numeric indicator values so they do not appear in the indicator selector.
- Regenerate static assets so frontend behavior is fully data-driven from the manifest and feature properties.

**Non-Goals:**
- Reintroduce generic `gender_sex` or `ethnicity_race` indicators removed by the previous cleanup.
- Add percentages, rates, or shares for sex/color-race indicators; this change covers counts only.
- Show sector-only source attributes in charts, tables, legends, or the indicator selector.

## Decisions

- Use a generic aggregate ZIP reader for sector-count joins.
  - Rationale: income loading already has ZIP and delimited CSV parsing logic. Extending that pattern avoids new runtime dependencies and keeps preparation self-contained.
  - Alternative considered: hard-code separate readers per file. That would duplicate parsing and make future aggregate joins harder to maintain.

- Store new selectable fields inside each feature's `indicators` object.
  - Rationale: existing map styling, chart/table, and report components already consume indicator values through this object and manifest metadata.
  - Alternative considered: add top-level properties for each new indicator. That would require special cases in multiple frontend components and bypass existing catalog behavior.

- Keep `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO` in a separate report context structure on normalized details.
  - Rationale: these fields are descriptive attributes, not comparable indicators. Separating them prevents accidental selection, styling, or chart/table inclusion.
  - Alternative considered: include them in the indicator catalog. That would incorrectly treat textual fields and area context as thematic indicators.

- Sum sex and color/race indicators for higher territorial levels.
  - Rationale: requested fields are counts of people, so summing sector counts preserves the measure across municipality, microregion, and UF.
  - Alternative considered: expose them only on sectors. That would make the indicators unavailable at the default/higher map layers and inconsistent with existing catalog indicators.

## Risks / Trade-offs

- Missing sector IDs in aggregate CSVs -> affected sector values should default to zero or blank-equivalent numeric values during preparation, with preparation logs making loaded row counts visible.
- Larger static assets -> adding several numeric fields increases generated FlatGeobuf size; mitigation is to keep report-only attributes limited to the four requested fields and avoid duplicating unused aggregate columns.
- Ambiguous color/race labels -> use explicit labels tied to source fields (`V01317` white, `V01318` black, `V01319` yellow, `V01320` brown, `V01321` indigenous) so selectors and reports communicate category meaning.
- Existing fallback normalization -> update fallback paths to recognize the new indicator IDs only when generated assets do not already provide an `indicators` object, avoiding double parsing or conflicting values.

## Migration Plan

1. Update geodata preparation to require/read the demographic and color/race ZIPs, join the requested fields by sector code, and emit updated indicator metadata and sector report context.
2. Regenerate `public/geodata/` with `npm run prepare:geodata`.
3. Update frontend types and report rendering to display sector report-only attributes when present.
4. Verify with `npm run build` and OpenSpec validation.

Rollback is to revert the preparation/frontend changes and regenerate `public/geodata/` from the previous indicator catalog.
