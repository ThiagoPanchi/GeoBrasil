## 1. Demographic Chart Data Flow

- [x] 1.1 Change census sector report chart derivation so sex and color/race chart groups are retained even when their total is zero, and verify zero-total groups produce chart data.
- [x] 1.2 Change generic report row filtering so demographic indicator IDs are excluded from row indicators based on demographic group membership, and verify zero-valued sex/color-race indicators no longer appear as individual rows.
- [x] 1.3 Preserve selected-indicator chart feedback for demographic indicators in zero-total chart groups, and verify the selected demographic indicator remains identifiable in the report.

## 2. Zero-Total Chart Rendering

- [x] 2.1 Render zero-total demographic chart cards with a neutral empty pie state and total zero, and verify category labels and zero values remain visible.
- [x] 2.2 Preserve proportional conic-gradient pie rendering for demographic chart groups with positive totals, and verify existing positive sex/color-race charts still render correctly.
- [x] 2.3 Keep the change scoped to census sector reports, and verify non-sector report behavior is not unexpectedly changed.

## 3. Styling And Layout

- [x] 3.1 Add or adjust styles for the zero-data chart state, and verify the visual state is distinguishable from a positive proportional pie.
- [x] 3.2 Verify zero-total chart cards continue to fit inside the existing responsive popup chart grid and scrollable report area.

## 4. Verification

- [x] 4.1 Run `npm run build` and verify the production build succeeds.
- [x] 4.2 Run `openspec validate "show-zero-demographic-pie-charts" --strict` and verify the change passes.
