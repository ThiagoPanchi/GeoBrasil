## 1. Source Data Ingestion

- [x] 1.1 Add a required-source check for `data/Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip` in the static geodata preparation flow and verify a clear error is shown when the file is missing.
- [x] 1.2 Parse the income aggregate zip during `npm run prepare:geodata` and verify the parser can read the sector identifier column and `V06004` values.
- [x] 1.3 Normalize Brazilian numeric formatting in `V06004` values and verify parsed values are finite numbers for representative rows.

## 2. Indicator Mapping

- [x] 2.1 Remap the existing `income` indicator to `V06004` and verify the catalog labels it as average monthly income of responsible persons with a monetary unit.
- [x] 2.2 Add a separate responsible-person count indicator for the previous `v0007` value and verify the catalog no longer labels that count as income.
- [x] 2.3 Update frontend fallback indicator normalization to expose both corrected income and responsible-person count values when reading feature properties.

## 3. Layer Values And Aggregation

- [x] 3.1 Join `V06004` values to normalized census sector features by sector code and verify sector assets contain the corrected `income` value.
- [x] 3.2 Aggregate corrected income to municipalities using a responsible-person weighted mean and verify municipality assets contain non-summed income values.
- [x] 3.3 Aggregate corrected income to microregions and UFs using the same weighted approach and verify those assets contain non-summed income values.
- [x] 3.4 Preserve responsible-person count aggregation as counts across sector, municipality, microregion, and UF layers and verify values remain separate from income.

## 4. Static Asset Regeneration And Verification

- [x] 4.1 Run `npm run prepare:geodata` with the required zip present and verify `public/geodata/manifest.json` lists both corrected income and responsible-person count indicators.
- [x] 4.2 Inspect representative generated sector, municipality, microregion, and UF records and verify both indicators are present in `properties.indicators`.
- [x] 4.3 Run the frontend build or available test command and verify it passes.
- [x] 4.4 Run OpenSpec validation for `fix-income-indicator-from-v06004` and verify it passes.
