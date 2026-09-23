## Context

See `proposal.md` for motivation. The current report mode in `MunicipalityPopup` renders sector attributes first and then maps every catalog indicator into `.popup-report-row` items inside `.popup-report-list`. The recently added sex indicators use IDs `men` and `women`; color/race indicators use `race_white`, `race_black`, `race_yellow`, `race_brown`, and `race_indigenous`. The popup report currently uses a narrow fixed width and max height, which can leave the Leaflet popup feeling cramped as indicator count grows.

## Goals / Non-Goals

**Goals:**
- Keep the report bounded within the popup on desktop and mobile.
- Use the popup's full useful width for report content so chart legends do not appear compressed while empty horizontal space remains available.
- Remove sex and color/race categories from the row list only in report mode.
- Render color/race and sex summaries as two compact pie charts at the bottom of the report.
- Keep the selected demographic indicator identifiable even when it is represented in a chart instead of a row.

**Non-Goals:**
- Change the global indicator catalog, selector, map styling, chart panel, or table columns.
- Regenerate static geodata or change indicator IDs.
- Add a charting library unless the CSS/SVG approach proves insufficient during implementation.

## Decisions

- Render pie charts directly in the popup component using existing indicator values.
  - Rationale: the charts are small, fixed-category summaries; a lightweight SVG or CSS conic-gradient implementation avoids adding a dependency.
  - Alternative considered: introduce a charting package. That would increase bundle size for a simple visual need.

- Define demographic groups by indicator IDs in `MunicipalityPopup`.
  - Rationale: the report already receives the full catalog and feature values. Grouping by known IDs keeps the behavior local to report rendering and avoids changing the data model.
  - Alternative considered: add metadata to `Indicator`. That could be useful later, but it requires broader manifest and preparation changes not needed for this layout change.

- Keep demographic indicators out of the row list only when a chart for their group can be shown.
  - Rationale: users should still see values if a record lacks enough non-zero values to render a meaningful chart. This avoids silently hiding data.
  - Alternative considered: always hide these rows. That risks losing visibility when all chart values are zero or missing.

- Use a bounded full-width report layout with an internal scroll area and responsive chart grid.
  - Rationale: Leaflet popups have limited viewport space, but the report should still consume the horizontal space the popup already provides. The heading should remain compact and the content should scroll inside the popup rather than visually escaping it.
  - Alternative considered: keep a narrow report body inside a wider popup. That leaves empty horizontal space and makes chart legends look crushed.

## Risks / Trade-offs

- Small categories may be hard to distinguish -> provide labels and values next to or below each pie chart, not only colored slices.
- Zero or missing values can produce empty charts -> only render a group chart when it has a positive total; otherwise keep the corresponding indicators visible as rows or omit an empty chart with no data loss.
- Wider bottom charts can overflow on mobile -> use the full available popup width first, then stack the chart grid to one column when constrained.
- Chart legends can look flattened if the report body is narrower than the popup -> ensure the report body, chart cards, and legend rows stretch to the popup content width before reducing typography or truncating labels.
- Selected indicator highlight is less direct for charted indicators -> mark the relevant legend/category or chart card when the selected indicator belongs to that demographic group.

## Migration Plan

1. Update report rendering to partition indicators into row indicators and demographic chart groups.
2. Add chart rendering helpers within the popup component or a small colocated component.
3. Update popup CSS for bounded width/height, full-width report content, internal scrolling, responsive bottom charts, and category legends.
4. Verify the report uses the popup's useful width and chart legends remain readable before running `npm run build` and `openspec validate "improve-popup-report-demographic-pie-charts" --strict`.
