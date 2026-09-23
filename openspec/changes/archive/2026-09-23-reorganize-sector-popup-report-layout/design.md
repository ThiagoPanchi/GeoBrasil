## Context

See `proposal.md` for motivation. The current report popup already receives sector report attributes through `feature.reportAttributes`, all indicator values through `feature.indicators`, and the indicator catalog through props. Report mode currently renders report attributes in a section before row indicators, then demographic pie charts at the bottom. Sector context values use source keys `SITUACAO`, `NM_DIST`, `NM_BAIRRO`, and `AREA_KM2`; core indicator IDs include `population`, `density`, `income`, `households`, and `responsible_persons`.

## Goals / Non-Goals

**Goals:**
- Move sector location/context values into the identity heading area for census sector reports.
- Present `Situacao`, `Distrito`, and `Bairro` in a compact three-column strip when available.
- Present core sector metrics in a dedicated two-column section before remaining general rows.
- Avoid duplicating those same values in the generic report attribute section or general indicator rows.
- Preserve demographic pie charts and non-sector report behavior.

**Non-Goals:**
- Change indicator IDs, generated assets, or geodata preparation.
- Change map styling, selector options, dashboard chart/table behavior, or aggregation logic.
- Add new metrics beyond the requested six core sector fields.

## Decisions

- Derive the sector context strip from existing `reportAttributes` rather than adding new data fields.
  - Rationale: `SITUACAO`, `NM_DIST`, and `NM_BAIRRO` are already present in report attributes for sector records.
  - Alternative considered: add new typed top-level properties. That would broaden the data model for a presentation-only change.

- Derive the two-column core metric section from existing indicators plus `AREA_KM2`.
  - Rationale: population, density, income, households, and responsible-person values already live in `feature.indicators`; area lives in `reportAttributes.AREA_KM2`.
  - Alternative considered: keep all six as generic rows. That does not meet the requested scannable two-column grouping.

- Remove values from the generic row/attribute sections when they are promoted to the sector heading or core metrics section.
  - Rationale: duplicated values make the report longer and undermine the layout improvement.
  - Alternative considered: show them in both places. That preserves current content order but adds clutter.

- Apply the new layout only when `feature.layer === 'sectors'`.
  - Rationale: municipalities, microregions, and UFs do not have the same source context fields and should keep the existing report layout.
  - Alternative considered: use the two-column metrics section for all layers. That changes broader report behavior not requested here.

## Risks / Trade-offs

- Missing sector context fields -> hide empty cells or show a minimal placeholder only when needed so the heading does not display meaningless blanks.
- Requested metric labels differ from catalog labels -> reuse catalog labels where possible and use clear report-only labels for `Area` to keep formatting consistent.
- Two-column layout may be too narrow on mobile -> stack columns responsively while preserving the requested grouping order.
- Existing demographic chart layout could be pushed lower -> keep the core metrics compact and let the existing report scroll area handle longer content.

## Migration Plan

1. Partition sector report data into context fields, core metrics, remaining report attributes, remaining row indicators, and demographic chart groups.
2. Render sector context in the heading area as three columns when values exist.
3. Render core sector metrics in a two-column section before remaining report rows.
4. Update styles for the three-column context strip and responsive two-column metrics layout.
5. Verify with `npm run build` and `openspec validate "reorganize-sector-popup-report-layout" --strict`.
