## Why

The current `income` indicator is mapped from `v0007`, but that field represents the quantity of responsible persons in private households rather than monthly income. The WebGIS needs to expose the correct average monthly income of responsible persons from `V06004` in `data/Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip` across map layers.

## What Changes

- Correct the income indicator so it represents "Renda media mensal dos responsaveis" sourced from column `V06004`.
- Preserve the current `v0007` value under a separate indicator for "Pessoas responsaveis em domicilios particulares" instead of presenting it as income.
- Extend static geodata preparation to read the responsible-person income aggregate zip from `data/` and join `V06004` values to census sector records.
- Propagate the corrected income values through sector, municipality, microregion, and UF layers.
- Update the static indicator catalog metadata so map, legend, popup, chart, and table labels/units match the corrected meanings.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `census-indicators`: Correct the income indicator source/meaning and add the responsible-person count as a distinct indicator exposed from static metadata and assets.

## Impact

- Affected areas: static geodata preparation script, indicator catalog metadata, generated `public/geodata` assets, fallback indicator normalization, and any documentation that names the income indicator.
- Requires local source data file `data/Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip` during geodata preparation.
- No backend/API service changes are required because the published WebGIS uses static assets.
