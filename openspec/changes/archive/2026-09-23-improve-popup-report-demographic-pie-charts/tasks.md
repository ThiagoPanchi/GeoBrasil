## 1. Report Data Partitioning

- [x] 1.1 Define sex and color/race indicator groups by the existing IDs in `MunicipalityPopup`, and verify grouped IDs match `men`, `women`, `race_white`, `race_black`, `race_yellow`, `race_brown`, and `race_indigenous`.
- [x] 1.2 Split report-mode indicators into row indicators and demographic chart indicators, and verify sex/color-race values no longer appear as individual report rows when a positive-total chart can represent them.
- [x] 1.3 Preserve fallback row rendering for any demographic group with no positive total, and verify no demographic values are silently hidden when chart data is unavailable.

## 2. Pie Chart Rendering

- [x] 2.1 Implement compact pie chart rendering for color/race and sex groups without adding a new dependency, and verify each chart uses the current feature's indicator values.
- [x] 2.2 Add chart labels/legends with category names and formatted values, and verify users can read the distribution without relying only on slice color.
- [x] 2.3 Indicate when the currently selected indicator belongs to a demographic chart, and verify the selected indicator remains identifiable in report mode.

## 3. Popup Layout And Styling

- [x] 3.1 Constrain the Leaflet popup report width, height, and scroll behavior so report content stays within the visible popup on desktop and mobile, and verify the report no longer visually overflows.
- [x] 3.2 Place the demographic chart section at the bottom of the report with side-by-side charts where space allows, and verify the charts stack responsively in narrow viewports.
- [x] 3.3 Preserve existing sector attribute rows and non-demographic indicator rows, and verify they remain readable with the new scroll and chart layout.

## 4. Verification

- [x] 4.1 Run `npm run build` and verify the production build succeeds.
- [x] 4.2 Run `openspec validate "improve-popup-report-demographic-pie-charts" --strict` and verify the change passes.

## 5. Full-Width Popup Follow-Up

- [x] 5.1 Adjust the popup report layout so the report body uses the full useful popup width, and verify there is no large unused horizontal area beside the report content.
- [x] 5.2 Adjust demographic chart cards and legends so labels and values are not horizontally squeezed when popup width is available, and verify both color/race and gender legends remain readable.
- [x] 5.3 Re-run `npm run build` and verify the production build succeeds after the full-width popup adjustments.
- [x] 5.4 Re-run `openspec validate "improve-popup-report-demographic-pie-charts" --strict` and verify the revised change passes.
