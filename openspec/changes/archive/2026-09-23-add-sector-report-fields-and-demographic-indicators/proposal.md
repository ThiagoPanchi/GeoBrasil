## Why

The map report currently lists only indicator values, so census sector clicks omit useful sector attributes already present in the sector geometry source. The indicator catalog also lacks requested 2022 census sex and color/race count indicators that should be selectable on the map and included in the report.

## What Changes

- Add sector-only report fields sourced from `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`: `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO`.
- Add selectable count indicators for men and women from `data/Agregados_por_setores_demografia_BR.zip`: `V01007` and `V01008`.
- Add selectable count indicators for color/race from `data/Agregados_por_setores_cor_ou_raca_BR.zip`: `V01317`, `V01318`, `V01319`, `V01320`, and `V01321`.
- Include the new indicators in map styling, chart/table values, and map-click report output wherever indicator values are available.
- Keep the extra sector attributes out of the general indicator catalog; they appear only in the map information report for census sector records.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `census-indicators`: expand the supported indicator catalog and territorial values with sex and color/race count indicators.
- `dashboard-synchronization`: extend the map information report for census sector clicks with source sector attributes that are not selectable indicators.

## Impact

- `scripts/prepare-static-geodata.mjs` will need to read and join the two additional aggregate ZIP files by sector code, add indicator metadata, and aggregate count indicators to municipality, microregion, and UF levels.
- Static assets under `public/geodata/` will need regeneration so the manifest and partitioned features include the new indicators and sector report attributes.
- Frontend data types and popup/report rendering will need to carry report-only attributes separately from indicator values.
- Existing selectable indicators and report behavior remain supported; this is additive and not a breaking change.
