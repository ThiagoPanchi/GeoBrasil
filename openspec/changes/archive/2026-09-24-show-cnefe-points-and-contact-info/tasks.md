## 1. CNEFE Asset Discovery

- [x] 1.1 Add a static aggregated CNEFE manifest that maps municipality codes to aggregated FlatGeoBuf asset paths and verify SC municipality `4200051` or another available SC municipality resolves to one or more `geodata/cnefe-aggregated/SC/...fgb` files.
- [x] 1.2 Update the CNEFE aggregation workflow or a dedicated manifest generation step so the aggregated CNEFE manifest can be regenerated deterministically and verify rerunning the chosen command produces stable municipality file lists.
- [x] 1.3 Update ignore rules if needed so the aggregated CNEFE manifest remains addable under the current SC-only geodata versioning rules and verify with `git check-ignore --quiet --no-index`.

## 2. Frontend Data Loading

- [x] 2.1 Add CNEFE frontend types for aggregated point properties including `COD_SETOR`, `ESPECIE_ENDERECO`, and `QUANTIDADE`, and verify TypeScript accepts the new types.
- [x] 2.2 Add API helpers that load aggregated CNEFE files for a selected municipality and filter records by selected sector `COD_SETOR`, and verify they return only matching sector records for an available SC sample.
- [x] 2.3 Add clear missing-asset handling for municipalities without aggregated CNEFE files and verify the error/status message does not break existing territorial loading.

## 3. Map Overlay Behavior

- [x] 3.1 Add a CNEFE toggle button next to the existing map color-scale and report buttons and verify its active/inactive state is accessible through label/title/pressed state.
- [x] 3.2 Add a dedicated CNEFE Leaflet layer group and verify toggling CNEFE off removes only CNEFE markers while preserving the territorial choropleth layer.
- [x] 3.3 Load and display CNEFE points only after the overlay is active and the user clicks a census sector, and verify no CNEFE points appear before a sector click.
- [x] 3.4 Clear displayed CNEFE points when the user changes UF, microregion, municipality, selected layer, or disables the overlay, and verify the next CNEFE display requires another sector click.

## 4. CNEFE Styling And Legend

- [x] 4.1 Implement deterministic icon/category styling for the eight requested `ESPECIE_ENDERECO` labels and verify each configured label appears in the legend.
- [x] 4.2 Implement 4 or 5 discrete icon size classes based on `QUANTIDADE` and verify larger quantities render larger icons than smaller quantities.
- [x] 4.3 Extend the map legend to include CNEFE species and quantity-size sections only while the CNEFE overlay is active, and verify the existing choropleth legend remains visible.

## 5. Contact And Source Information

- [x] 5.1 Add a lower-left information area naming Thiago Panchiniak as creator, linking to `https://www.linkedin.com/in/thiago-panchiniak-65b63055/`, and showing `panchiniak@gmail.com`, then verify the content is visible in the application.
- [x] 5.2 Add IBGE Censo 2022 as the displayed data source and verify it appears with the contact/source information.
- [x] 5.3 Add responsive styles so the contact/source information remains readable on mobile without blocking map tools, legend, or dashboard interaction, and verify with a narrow viewport.

## 6. Verification

- [x] 6.1 Run `npm run build` and verify the production frontend build succeeds.
- [x] 6.2 Run `openspec validate show-cnefe-points-and-contact-info --strict` and verify the change remains valid after implementation.

## 7. Sector Code Filtering Fix

- [x] 7.1 Update CNEFE sector filtering to compare the selected census sector code against the first 15 digits of `COD_SETOR` and verify a sector such as `420005105000001` matches CNEFE records such as `420005105000001P`.
- [x] 7.2 Run `npm run build` and verify the production frontend build succeeds after the filtering fix.
- [x] 7.3 Run `openspec validate show-cnefe-points-and-contact-info --strict` and verify the revised change remains valid.
