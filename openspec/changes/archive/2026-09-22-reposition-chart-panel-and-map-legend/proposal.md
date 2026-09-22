## Why

The current dashboard places legend, selected geometry details, and a small top-six ranking together in the sidebar, which limits comparison and does not use the map area effectively. Moving the chart/table below the map, showing every visible record, and placing the legend over the map improves spatial analysis while keeping the map as the primary interaction surface.

## What Changes

- Move the "Grafico e tabela" area out of the sidebar and place it below the map in a fixed-height panel.
- Replace the current top-six horizontal ranking with a vertical bar chart that includes every record currently displayed on the map.
- Add horizontal scrolling to the fixed chart panel so all records can be inspected without increasing panel height.
- Make chart bars interactive: clicking a bar selects the corresponding displayed geometry and zooms/fits the map to that geometry.
- Move the choropleth legend from the sidebar to an overlay on top of the map in the bottom-right corner.
- Preserve synchronization with the selected indicator, current territorial layer, selected feature, table/chart records, and static asset loading state.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard-synchronization`: Change chart/table behavior and layout so the chart represents all displayed map records and can select/zoom map features.
- `thematic-map`: Change legend placement so the dynamic legend appears as a map overlay in the bottom-right corner.

## Impact

- Affected areas: `MapPage`, `MapView`, `SidePanel` or replacement chart components, CSS layout, selected-feature/map viewport coordination.
- No backend, database, API, geodata schema, or indicator calculation changes are required.
- The interaction model adds a chart-to-map selection path in addition to the existing map click path.
