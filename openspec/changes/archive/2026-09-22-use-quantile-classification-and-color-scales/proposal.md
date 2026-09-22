## Why

The current choropleth uses equal-width numeric intervals, so outliers such as the municipality of Sao Paulo dominate the population scale and push most displayed records into the lightest class. Switching to quantile classification and allowing palette selection improves visual balance across territorial layers while keeping classes based on the records currently displayed on the map.

## What Changes

- Change the default choropleth classification method from equal-width intervals to quantiles.
- Keep classification calculated from only the records currently displayed on the map.
- Preserve the existing five-class choropleth behavior where enough distinct values exist, while handling repeated values or small datasets gracefully.
- Add an edit button as a map overlay in the top-right corner for color scale settings.
- Add selectable color scales: blue default, red, green, and traffic-light/semaforica (green, yellow, red).
- Recalculate geometry colors and legend entries when the user changes indicator, territory, layer, or color scale.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `thematic-map`: Change classification behavior to quantiles and add user-selectable color scales for map styling and legend display.

## Impact

- Affected areas: choropleth break calculation, color ramp selection, map styling metadata, legend rendering, and map overlay controls.
- No backend, geodata generation, static asset schema, or indicator calculation changes are required.
- No breaking changes are expected; existing map records, chart/table data, and territorial navigation remain unchanged.
