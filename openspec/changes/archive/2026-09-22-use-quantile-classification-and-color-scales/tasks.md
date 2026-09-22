## 1. Quantile Classification

- [x] 1.1 Replace equal-width break calculation with quantile break calculation over finite displayed indicator values and verify the map still produces class breaks for normal datasets.
- [x] 1.2 Handle repeated values and small datasets by collapsing duplicate quantile ranges, and verify the legend does not show duplicate or invalid intervals.
- [x] 1.3 Verify Sao Paulo municipalities with the population indicator no longer place nearly all non-capital municipalities in the lightest class when enough distinct values exist.

## 2. Color Scale Support

- [x] 2.1 Add named color scale definitions for blue, red, green, and semaforica ramps and verify each scale has colors for the configured class count.
- [x] 2.2 Pass the selected color scale through map styling so feature `fillColor` and break colors use the active ramp, and verify changing scale recolors the displayed geometries.
- [x] 2.3 Preserve the current displayed record set, selected indicator values, chart/table data, and selected feature details when the color scale changes.

## 3. Map Overlay Controls And Legend

- [x] 3.1 Add a top-right map overlay edit button for color scale settings and verify it does not replace the existing bottom-right legend.
- [x] 3.2 Add selectable controls for blue, red, green, and semaforica scales and verify the active selection is visibly indicated.
- [x] 3.3 Update or reuse legend rendering so it reflects the current quantile ranges and selected scale colors after indicator, territory, layer, or scale changes.
- [x] 3.4 Verify the top-right color-scale overlay and bottom-right legend remain usable on desktop and mobile widths without blocking essential map interactions.

## 4. Verification

- [x] 4.1 Run the frontend build or available test command and verify it passes.
- [x] 4.2 Run OpenSpec validation for `use-quantile-classification-and-color-scales` and verify it passes.
