## 1. Sector Report Data Partitioning

- [x] 1.1 Identify sector-only context values from `feature.reportAttributes` (`SITUACAO`, `NM_DIST`, `NM_BAIRRO`) and verify they are available for sector reports without changing generated geodata.
- [x] 1.2 Define the six core sector metrics from existing values (`population`, `AREA_KM2`, `density`, `income`, `households`, `responsible_persons`) and verify each metric can be formatted with the correct label and unit.
- [x] 1.3 Exclude promoted context fields and core metrics from the generic report rows/attribute section, and verify the report does not duplicate those values.

## 2. Sector Report Rendering

- [x] 2.1 Render `Situacao`, `Distrito`, and `Bairro` near the sector identification/header area in three columns when values exist, and verify non-sector reports do not show this sector context strip.
- [x] 2.2 Render the core sector metrics section in two columns with population/area/density in the first column and income/households/responsible persons in the second column, and verify the section appears before remaining row indicators.
- [x] 2.3 Preserve demographic pie charts and remaining non-demographic report rows, and verify sex/color-race charts continue to appear for records with positive demographic totals.

## 3. Styling And Responsiveness

- [x] 3.1 Add styles for the three-column sector context strip and verify labels and values remain readable inside the popup width.
- [x] 3.2 Add styles for the two-column core metrics section and verify the two metric groups stack or wrap cleanly on narrow viewports.
- [x] 3.3 Verify the report remains bounded within the popup with internal scrolling after the new sections are added.

## 4. Verification

- [x] 4.1 Run `npm run build` and verify the production build succeeds.
- [x] 4.2 Run `openspec validate "reorganize-sector-popup-report-layout" --strict` and verify the change passes.
