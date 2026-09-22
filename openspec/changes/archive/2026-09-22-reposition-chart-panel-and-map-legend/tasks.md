## 1. Restructure Dashboard Layout

- [x] 1.1 Move the "Grafico e tabela" UI out of the side controls and render it below the map in the main content area.
- [x] 1.2 Keep sidebar controls and selected-feature information usable after removing chart/table and legend content from the sidebar.
- [x] 1.3 Add responsive CSS so the map and fixed-height lower panel load correctly on desktop and mobile widths.

## 2. Replace Chart Behavior

- [x] 2.1 Replace the truncated ranking chart with a vertical bar chart sourced from all rows currently represented on the map.
- [x] 2.2 Add horizontal scrolling for the chart area while preserving a fixed panel height and readable bar labels/values.
- [x] 2.3 Verify examples such as the UF layer show all 27 records through horizontal scrolling rather than a top-N subset.

## 3. Synchronize Chart Clicks With Map

- [x] 3.1 Add a chart click handler that identifies the clicked displayed record and updates the shared selected feature state.
- [x] 3.2 Add or reuse `MapView` behavior to fit/zoom the viewport to the clicked record's geometry.
- [x] 3.3 Verify selecting a different territory, layer, or indicator clears or updates chart-driven focus without stale selections.

## 4. Move Legend Into Map

- [x] 4.1 Render the dynamic choropleth legend inside the map container as a bottom-right overlay.
- [x] 4.2 Preserve legend updates for indicator, class breaks, and no-data states.
- [x] 4.3 Verify the overlay does not block essential map interactions or lower chart/table interactions on desktop and mobile.

## 5. Verification

- [x] 5.1 Run the frontend build or available test command and fix any regressions.
- [x] 5.2 Run OpenSpec validation for `reposition-chart-panel-and-map-legend` and resolve validation errors.
