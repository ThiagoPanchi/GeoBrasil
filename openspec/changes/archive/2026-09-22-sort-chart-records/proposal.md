## Why

The chart currently follows the loaded record order, which makes comparison harder when users want to quickly identify the largest values or find a territory by name. Adding explicit sort controls makes the chart/table panel more useful without changing the underlying map dataset.

## What Changes

- Sort chart records by selected indicator value in descending order by default so the largest values appear first.
- Add a control to invert the value sort order between descending and ascending.
- Add a control to sort records alphabetically by name.
- Keep the chart and table synchronized to the same sorted order.
- Preserve the existing displayed map record set, selected indicator, horizontal chart scroll, and chart/table click behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard-synchronization`: Chart/table presentation gains explicit sort behavior while remaining synchronized with the displayed map records and selected indicator.

## Impact

- Affected areas: `DashboardPanel` chart/table rendering, sorting state, sort controls, and panel styling.
- No backend, geodata, indicator calculation, map styling, or asset schema changes are required.
- No breaking changes are expected.
