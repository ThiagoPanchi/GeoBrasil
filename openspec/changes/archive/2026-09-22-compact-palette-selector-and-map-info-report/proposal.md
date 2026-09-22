## Why

The current color palette editor occupies a card-sized map overlay even when collapsed, which competes with the map and legend. Users also need a direct way to inspect all indicator values for a clicked map record, rather than seeing only the currently selected indicator.

## What Changes

- Make the map color palette control collapsed by default as only a circular button, expanding to fit the palette options only after the user clicks it.
- Keep the palette options usable and visible when expanded, including labels and color previews for each available scale.
- Add a map information button that lets the user enter an information/inspection mode.
- When information mode is active and the user clicks a displayed map geometry, show a popup report containing all available indicators for that clicked record.
- Preserve existing map selection, chart/table synchronization, legend behavior, and drill-down behavior outside information mode.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `thematic-map`: Changes the color scale editor overlay behavior from a persistent card to a compact circular button that expands only when opened.
- `dashboard-synchronization`: Adds an information-mode map interaction that reports all indicator values for the clicked displayed record.

## Impact

- Affected areas: map overlay controls, color scale selector styling/state, map click handling, popup content, and selected feature synchronization behavior.
- No backend, data pipeline, API, or static asset schema changes are expected.
- Assumption: "ponto" means the displayed territorial geometry under the map click; if no geometry is clicked, no report is shown.
