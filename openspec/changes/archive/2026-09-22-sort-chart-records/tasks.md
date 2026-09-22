## 1. Sorting State And Controls

- [x] 1.1 Add chart/table sort state to `DashboardPanel` and verify the default mode orders records by selected indicator value descending.
- [x] 1.2 Add an order inversion control for value sorting and verify it toggles chart/table records between descending and ascending selected indicator value order.
- [x] 1.3 Add an alphabetical sort control and verify it orders chart/table records A-to-Z by displayed record name.

## 2. Sorted Rendering

- [x] 2.1 Derive one sorted row sequence from the current `rows`, `selectedIndicator`, and sort mode, and verify both chart bars and table rows render from that same sequence.
- [x] 2.2 Preserve chart/table click behavior after sorting and verify clicking any sorted bar or table row still selects and zooms the matching map geometry.
- [x] 2.3 Preserve the complete displayed map record set and horizontal chart scroll, and verify sorting does not drop records from the chart/table panel.

## 3. Responsive Styling

- [x] 3.1 Style the sort controls in the panel header and verify they remain usable without overlapping chart/table content on desktop widths.
- [x] 3.2 Verify the sort controls wrap or stack cleanly on mobile widths while the fixed-height panel and horizontal chart scroll remain usable.

## 4. Verification

- [x] 4.1 Run the frontend build or available test command and verify it passes.
- [x] 4.2 Run OpenSpec validation for `sort-chart-records` and verify it passes.
