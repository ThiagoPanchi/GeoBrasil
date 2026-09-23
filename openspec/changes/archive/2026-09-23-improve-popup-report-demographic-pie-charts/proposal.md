## Why

The map information popup report can overflow its available area now that it lists every indicator as rows. Sex and color/race values are categorical distributions, so presenting them as compact pie charts improves readability and reduces vertical pressure in the report.

## What Changes

- Constrain the popup report so its content remains inside the popup area on desktop and mobile.
- Make the report content use the popup's full useful width so chart legends and labels are not squeezed into only part of the available horizontal space.
- Remove sex and color/race indicators from the report's row-style indicator list.
- Add a bottom report section with two side-by-side pie charts when the underlying values are available:
- one pie chart for color/race using white, black, yellow, brown, and indigenous counts;
- one pie chart for sex using men and women counts.
- Preserve the same indicator catalog and map/chart/table behavior outside the popup report.
- Preserve existing report content for non-demographic indicators and sector-only source attributes.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-synchronization`: change the map information report layout so demographic category indicators are summarized as pie charts and the report does not overflow its popup bounds.

## Impact

- `src/components/MunicipalityPopup.tsx` will need to split row indicators from demographic chart groups and render compact pie charts in report mode.
- `src/styles.css` will need popup sizing, full-width report content, scrolling, responsive layout, and pie-chart legend styling updates.
- Existing indicator values from generated static assets remain the data source; no geodata regeneration is expected.
- No new runtime dependency is required unless implementation determines the existing CSS/React approach cannot meet the visual requirements.
