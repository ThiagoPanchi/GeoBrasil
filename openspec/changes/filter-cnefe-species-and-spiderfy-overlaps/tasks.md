## 1. CNEFE Species Filter

- [x] 1.1 Add CNEFE species filter state with an "all species" default and verify enabling/disabling the CNEFE overlay resets or preserves the filter consistently with the selected sector behavior.
- [x] 1.2 Add a visible `ESPECIE_ENDERECO` selector while the CNEFE overlay is active and verify it includes all configured species categories plus an all-species option.
- [x] 1.3 Apply normalized `ESPECIE_ENDERECO` filtering to the loaded active-sector CNEFE points and verify selecting `Estabelecimento de saúde` hides other species without changing the selected sector.
- [x] 1.4 Update CNEFE status or helper text to report the active species filter and verify an empty filtered result communicates that no points match the filter.

## 2. Overlap Layout

- [x] 2.1 Add a deterministic helper that groups displayed CNEFE points by exact original coordinate and verify groups with one point keep the original coordinate.
- [x] 2.2 Implement circular spiderfy placement for coordinate groups with multiple displayed points and verify markers in a repeated-coordinate group render at distinct display positions.
- [x] 2.3 Preserve each point's original coordinate separately from its display coordinate and verify CNEFE popup data still refers to the original loaded record.
- [x] 2.4 Recalculate overlap layout after the species filter changes and verify hidden points do not reserve spread positions.

## 3. Connector Rendering

- [x] 3.1 Render thin connector lines from displaced CNEFE markers to their original coordinate and verify each displaced marker has one connector.
- [x] 3.2 Ensure non-overlapping CNEFE points do not render connector lines and verify singleton coordinate groups remain unchanged.
- [x] 3.3 Style connector lines as visually subordinate to CNEFE markers and verify they do not obscure the territorial choropleth layer.

## 4. Integration And Verification

- [x] 4.1 Verify CNEFE species legend entries remain consistent with selector labels and marker styling.
- [x] 4.2 Verify sector-click loading, CNEFE toggle off, and territorial context changes still clear/re-render the CNEFE layer correctly.
- [x] 4.3 Run `npm run build` and verify the production frontend build succeeds.
- [x] 4.4 Run `openspec validate filter-cnefe-species-and-spiderfy-overlaps --strict` and verify the change remains valid after implementation.
