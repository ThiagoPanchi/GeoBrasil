## Why

The current color-scale editor uses a text button and separate text buttons for each palette, which consumes map space and makes the palette choice harder to preview visually. The legend also needs clearer hierarchy by showing the legend title, the active indicator name, and then the value ranges.

## What Changes

- Replace the "Editar cores" text button with a compact pencil edit icon/emoji button in the map top-right overlay.
- Replace separate palette text buttons with a single color-scale selector UI.
- Show each color-scale option with its label and a visual preview of the scale colors.
- Display selector options stacked vertically, one option per row.
- Update the legend structure so it shows "Legenda" at the top, the active indicator name below it, and the quantile value ranges below the indicator name.
- Preserve existing quantile classification, supported color scales, map overlay placement, and legend placement.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `thematic-map`: Refine the color-scale edit control and legend presentation for the existing thematic map styling behavior.

## Impact

- Affected areas: `MapView` overlay markup, legend content, color-scale selection UI, and CSS for map overlays.
- No backend, geodata, classification algorithm, indicator calculation, or asset schema changes are required.
- No breaking changes are expected.
