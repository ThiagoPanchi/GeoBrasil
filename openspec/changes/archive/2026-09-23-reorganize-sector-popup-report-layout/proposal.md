## Why

The census sector indicator report currently separates sector context from the sector identity area and mixes core sector metrics with the general indicator list. Reorganizing these values makes the report easier to scan by putting location context near the sector code and grouping the main sector indicators into two balanced columns.

## What Changes

- Move census sector context fields `SITUACAO`, `NM_DIST`, and `NM_BAIRRO` into the report heading/identity area near the sector code.
- Present those context fields as three columns: `Situacao | Distrito | Bairro`.
- Present the main sector metrics in a dedicated two-column section:
- first column: population, area, and demographic density;
- second column: income, households, and responsible-person count.
- Preserve demographic pie charts for sex and color/race in the report.
- Preserve existing behavior for non-sector reports and the map/chart/table indicator catalog.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-synchronization`: refine the census sector popup report layout by moving sector context into the identity area and grouping core sector metrics into two columns.

## Impact

- `src/components/MunicipalityPopup.tsx` will need to distinguish sector identity fields, core sector metric indicators, remaining row indicators, and demographic chart groups in report mode.
- `src/styles.css` will need layout styles for the three-column sector context strip and the two-column core metric section, with responsive fallback on narrow popups.
- Existing generated geodata and indicator IDs remain valid; no geodata regeneration is expected.
