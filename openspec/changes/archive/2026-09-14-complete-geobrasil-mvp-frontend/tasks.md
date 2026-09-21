## 1. Navigation and Selection

- [x] 1.1 Verify the UF -> municipalities flow from both UF selector and UF map double-click, and make minimal frontend fixes if needed so only municipalities from the selected UF appear, the lower selections are cleared, the map fits the UF extent, and `npm run build` passes.
- [x] 1.2 Verify municipality click selection and make minimal frontend fixes if needed so the clicked municipality is highlighted, `selectedFeature` shows the municipality name/code/indicator value, the municipality selector reflects the selection, and `npm run build` passes.
- [x] 1.3 Verify municipality double-click drill-down and make minimal frontend fixes if needed so only sectors from that municipality load, current layer becomes sectors, the viewport fits the sector layer, charts/table update to sectors, and `npm run build` passes.
- [x] 1.4 Verify back navigation from sectors to municipalities and make minimal frontend fixes if needed so selected sector is cleared, the municipality layer returns for the current UF or microregion, dashboard rows match the map, and `npm run build` passes.

## 2. Microregion Flow

- [x] 2.1 Verify microregion selector behavior after UF selection and make minimal frontend fixes if needed so changing UF clears microregion/municipality/sector, microregion options belong only to the selected UF, and `npm run build` passes.
- [x] 2.2 Verify selecting a microregion from the selector and make minimal frontend fixes if needed so only municipalities in that microregion load, charts/table represent those municipalities, and `npm run build` passes.
- [x] 2.3 Verify double-clicking a microregion on the map and make minimal frontend fixes if needed so the microregion is selected, municipalities for that microregion load, selected lower territory is cleared, the viewport fits the resulting layer, and `npm run build` passes.

## 3. Thematic Map and Dashboard Synchronization

- [x] 3.1 Verify choropleth styling across UFs, municipalities, microregions, and sectors and make minimal frontend fixes if needed so colors change when the selected indicator changes and classes use only the records currently displayed; verify with `npm run build`.
- [x] 3.2 Verify dynamic legend updates and make minimal frontend fixes if needed so ranges/colors match the current indicator and displayed layer after indicator, UF, microregion, municipality, layer, and back-navigation changes; verify with `npm run build`.
- [x] 3.3 Verify dashboard charts and make minimal frontend fixes if needed so both charts are derived from the records currently displayed on the map for UF, microregion-filtered municipality, municipality, and sector contexts; verify with `npm run build`.
- [x] 3.4 Verify the data table and column selector and make minimal frontend fixes if needed so table rows always match displayed map records, selected columns persist across layer/context changes where available, and `npm run build` passes.
- [x] 3.5 Verify selected-context and loading feedback and make minimal frontend fixes if needed so current territory, layer, selected indicator, selected geometry, loading status, success status, failure status, and available back navigation are clear during all supported flows; verify with `npm run build`.

## 4. Integrated MVP Verification

- [x] 4.1 Complete manual browser verification for Abrir aplicacao -> visualizar UFs -> selecionar UF -> visualizar municipios -> selecionar indicador -> visualizar mapa tematico -> selecionar municipio -> visualizar setores -> visualizar mapa tematico dos setores -> visualizar graficos -> visualizar tabela, and record any fixes made before marking complete.
- [x] 4.2 Complete manual browser verification for UF -> Microrregiao -> Municipios without loading territorial records outside the hierarchy, and record any fixes made before marking complete.
- [x] 4.3 Run final verification with `npm run build` in `frontend/` and any relevant backend smoke checks needed for manually tested endpoints, then confirm all tasks in this change are complete.
