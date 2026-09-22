## Context

See `proposal.md` for motivation. The current `DashboardPanel` receives the complete displayed `rows` dataset and maps it directly into the vertical bar chart and table. Selection and map zoom already use the original row object, so sorting only needs to change presentation order, not the dataset emitted by the map or the selection contract.

## Goals / Non-Goals

**Goals:**

- Keep sorting local to the chart/table panel presentation.
- Use one sorted sequence for both chart bars and table rows.
- Default to selected-indicator value descending so the largest values appear first.
- Provide explicit controls for inverted value order and alphabetical order.
- Preserve chart/table click selection and map zoom behavior after sorting.

**Non-Goals:**

- Change map feature order, choropleth styling, class breaks, or loaded static records.
- Persist sort preferences across page reloads.
- Add backend/API support for sorting.
- Add multi-column table sorting beyond the requested chart/table order controls.

## Decisions

- Store sort mode in `DashboardPanel`.
  - Rationale: sorting affects only chart/table presentation and does not need to become global application state.
  - Alternative considered: lift sort state into `MapPage`; rejected because map loading and selectors do not need to know about presentation order.

- Derive `sortedRows` from `rows`, `selectedIndicator`, and sort mode before rendering chart and table.
  - Rationale: one derived sequence prevents chart/table order drift.
  - Alternative considered: sort separately inside each render loop; rejected because it duplicates comparison logic and increases mismatch risk.

- Treat the invert control as value-order toggle between descending and ascending.
  - Rationale: the user specifically asked to invert the quantity order, and default descending makes the largest records first.
  - Alternative considered: a generic reverse-current-order button; rejected because reversing alphabetical order would be less clear and was not requested.

- Treat alphabetical sorting as ascending by record name.
  - Rationale: "ordenar alfabeticamente" normally means A-to-Z and keeps the UI simple.
  - Alternative considered: add alphabetical A-Z/Z-A toggle; rejected as extra scope unless requested later.

## Risks / Trade-offs

- Records with missing indicator values may sort unpredictably -> Mitigate by treating missing values as zero for comparison, matching current chart value fallback.
- Locale-sensitive names may sort differently from user expectations -> Mitigate with browser locale comparison using the displayed names.
- Sort controls can crowd the fixed panel header on mobile -> Mitigate with wrapping controls and compact button styling.
- Recomputing sorted rows on every render may be unnecessary for large datasets -> Mitigate only if measured; current datasets are already rendered fully in the chart/table panel.

## Migration Plan

1. Add sort state and sort controls to the chart/table panel header.
2. Derive a sorted row list from the currently displayed rows and selected indicator.
3. Render chart bars and table rows from the sorted list.
4. Ensure chart/table clicks still pass the original row object to the existing selection handler.
5. Update styling for the control group, including mobile wrapping.
6. Run the frontend build and OpenSpec validation.
