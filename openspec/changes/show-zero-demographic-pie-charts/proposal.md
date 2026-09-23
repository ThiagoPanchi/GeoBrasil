## Why

Census sector reports currently hide demographic pie charts when sex or color/race totals are zero, causing those demographic indicators to reappear as a list of zero-valued rows. This makes zero-data sectors harder to interpret and breaks the report's visual consistency.

## What Changes

- Show demographic chart cards for census sector reports even when sex or color/race totals are zero.
- Render zero-total demographic charts as an explicit zero/empty state rather than omitting the chart.
- Keep sex and color/race indicators out of the generic indicator row list when they belong to demographic chart groups, including when all values are zero.
- Preserve existing proportional pie behavior when demographic totals are positive.
- Preserve non-demographic rows, sector context, sector core metrics, and non-sector report behavior.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-synchronization`: refine demographic chart behavior in map information popup reports for zero-valued census sector demographic groups.

## Impact

- `src/components/MunicipalityPopup.tsx` will need to decouple demographic indicator row suppression from positive chart totals and render zero-total chart states.
- `src/styles.css` may need small visual-state styling for zero-total demographic chart cards.
- No generated geodata, indicator IDs, data preparation scripts, or map selection behavior should change.
