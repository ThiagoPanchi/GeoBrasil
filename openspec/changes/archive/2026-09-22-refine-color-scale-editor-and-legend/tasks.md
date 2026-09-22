## 1. Color Scale Editor Trigger

- [x] 1.1 Replace the "Editar cores" text trigger with a compact pencil edit icon or emoji button and verify the button remains accessible with a clear label/title.
- [x] 1.2 Verify the compact edit button remains in the map top-right overlay area without replacing or moving the bottom-right legend.

## 2. Single Selector With Color Previews

- [x] 2.1 Replace the separate color-scale text buttons with one selector-style panel and verify only one color scale can be active at a time.
- [x] 2.2 Render blue, red, green, and semaforica options as vertically stacked rows and verify each option appears one above the next.
- [x] 2.3 Add a visual swatch preview beside each color-scale option and verify each preview uses that option's actual scale colors.
- [x] 2.4 Preserve active scale indication and verify selecting any option still recolors the map and legend.

## 3. Legend Hierarchy

- [x] 3.1 Render the active indicator name below the "Legenda" title and verify it updates when the selected indicator changes.
- [x] 3.2 Render quantile value ranges below the indicator name and verify existing color swatches remain aligned with their ranges.
- [x] 3.3 Verify the no-data legend state remains understandable after the legend layout change.

## 4. Responsive Styling And Verification

- [x] 4.1 Update CSS for the compact edit button, selector rows, palette previews, and legend indicator label, and verify desktop layout does not block essential map interactions.
- [x] 4.2 Verify the color selector and legend remain usable on mobile widths.
- [x] 4.3 Run the frontend build or available test command and verify it passes.
- [x] 4.4 Run OpenSpec validation for `refine-color-scale-editor-and-legend` and verify it passes.
