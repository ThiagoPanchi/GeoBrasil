## Context

The current UI groups controls, selected-feature details, legend, and a compact ranking in the sidebar. The map component already emits the complete displayed rows for the active context, and the dashboard keeps selected feature state shared between map and sidebar. The requested change is a layout and interaction update: move "Grafico e tabela" below the map, show every displayed record as vertical bars, allow horizontal inspection, and let chart clicks drive map selection/zoom.

## Goals / Non-Goals

**Goals:**

- Place the synchronized chart/table area below the map in a fixed-height panel.
- Render a vertical bar chart with all records currently displayed on the map, not a truncated ranking.
- Support horizontal scrolling when the complete record set is wider than the panel.
- Let clicking a chart bar select the corresponding geometry and fit/zoom the map to it.
- Move the dynamic legend to a bottom-right overlay inside the map.

**Non-Goals:**

- Change indicator calculations, choropleth class calculations, static geodata generation, or asset schemas.
- Add server-side behavior or API calls.
- Redesign territorial selectors or drill-down rules.
- Add persistence for chart scroll position or selected table columns beyond current behavior.

## Decisions

- Use the existing displayed `rows` dataset as the source for the chart/table panel.
  - Rationale: it is already synchronized with loaded static assets, active territorial filters, and selected indicator context.

- Replace the top-N ranking presentation with a complete vertical bar chart in a horizontally scrollable container.
  - Rationale: the user needs examples like 27 UF records to be visible through scrolling rather than hidden by truncation.

- Keep the chart/table panel below the map as part of the main content column rather than the sidebar.
  - Rationale: the panel compares displayed geographies and benefits from horizontal space; controls remain separate from analytical output.

- Add a map focus path from chart rows/bars to `MapView`.
  - Rationale: map clicks already update selected feature state, but chart clicks also need to select and zoom to a geometry. The implementation can use a selected/focused record id prop, an imperative ref, or a callback pattern, as long as the shared selected feature stays authoritative.

- Render the legend within the map container as an overlay anchored bottom-right.
  - Rationale: legend meaning belongs to the visual map and should not consume sidebar or chart/table space.

## Risks / Trade-offs

- Large record counts can create very wide chart content. Mitigate with fixed panel height, horizontal overflow, readable minimum bar width, and stable labels/tooltips.
- Chart-to-map selection needs reliable record-to-feature matching. Mitigate by using the same ids/codes already used for map feature selection and displayed rows.
- The legend overlay can cover map geometry or Leaflet controls. Mitigate with compact styling, bottom-right anchoring, and responsive sizing.
- Mobile layout may have limited vertical space. Mitigate by keeping the panel fixed/scrollable and ensuring the map remains usable above it.

## Migration Plan

1. Separate sidebar controls/selected-feature content from the synchronized chart/table presentation.
2. Move the chart/table rendering below `MapView` in the main page layout.
3. Change chart rendering to vertical bars for every displayed row with horizontal overflow.
4. Wire chart bar clicks to shared selected-feature state and map viewport focus.
5. Move legend rendering into the map container as a bottom-right overlay.
6. Update responsive CSS and verify the dashboard on desktop and mobile widths.
