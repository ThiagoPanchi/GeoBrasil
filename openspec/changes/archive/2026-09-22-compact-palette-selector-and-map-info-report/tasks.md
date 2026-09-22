## 1. Compact Palette Control

- [x] 1.1 Update the map palette overlay markup/state so the collapsed control renders only a circular button, and verify the collapsed overlay does not retain the previous card-sized width.
- [x] 1.2 Render the palette option list only when the palette control is open, and verify blue, red, green, and semaforica options remain selectable with labels and color previews.
- [x] 1.3 Update palette overlay accessibility attributes and active state, and verify the button has a clear label/title and indicates expanded state.

## 2. Map Information Mode

- [x] 2.1 Add a map information toggle button near the palette control, and verify the UI visibly distinguishes active and inactive information mode.
- [x] 2.2 Update map feature click handling so normal mode preserves existing selected-feature popup behavior, and verify clicking a geometry still selects it when information mode is inactive.
- [x] 2.3 Update information-mode click behavior to open a report popup for the clicked displayed geometry, and verify clicking outside displayed geometry does not change the displayed record set.
- [x] 2.4 Preserve double-click drill-down behavior outside information mode, and verify UF, microregion, and municipality drill-down still works.

## 3. Full Indicator Report Popup

- [x] 3.1 Extend the map popup rendering to support a report mode listing all catalog indicators for the clicked record, and verify every available indicator label, value, and unit is shown.
- [x] 3.2 Highlight or otherwise identify the currently selected indicator inside the report, and verify it remains distinguishable from the other indicators.
- [x] 3.3 Keep the existing compact selected-indicator popup for normal map clicks, and verify existing popup content remains unchanged outside information mode.

## 4. Styling And Verification

- [x] 4.1 Update CSS for compact overlay buttons, expanded palette sizing, active information mode, and scrollable report content, and verify controls remain usable on desktop widths.
- [x] 4.2 Verify the palette and information controls remain usable on mobile widths without covering the legend or preventing map interaction.
- [x] 4.3 Run the frontend build or available test command and verify it passes.
- [x] 4.4 Run OpenSpec validation for `compact-palette-selector-and-map-info-report` and verify it passes.
