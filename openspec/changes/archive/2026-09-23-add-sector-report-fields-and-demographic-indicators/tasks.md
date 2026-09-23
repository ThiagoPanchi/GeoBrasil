## 1. Static Geodata Preparation

- [x] 1.1 Add required source paths for `data/Agregados_por_setores_demografia_BR.zip` and `data/Agregados_por_setores_cor_ou_raca_BR.zip`, and verify `npm run prepare:geodata` fails clearly if either file is missing.
- [x] 1.2 Generalize aggregate ZIP CSV loading by sector code and requested columns, and verify it loads `V01007`, `V01008`, `V01317`, `V01318`, `V01319`, `V01320`, and `V01321` from the expected source files.
- [x] 1.3 Add indicator metadata for men, women, white, black, yellow, brown, and indigenous counts, and verify `public/geodata/manifest.json` lists each with people/count units after regeneration.
- [x] 1.4 Join the new aggregate values into sector `indicators`, aggregate them by sum to municipalities, microregions, and UFs, and verify generated records contain numeric values at each territorial level.
- [x] 1.5 Preserve sector report-only attributes `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO` in generated sector assets without adding them to the indicator catalog, and verify a regenerated sector feature includes them outside selectable indicator metadata.

## 2. Frontend Data Model And Report Rendering

- [x] 2.1 Extend frontend types and feature normalization to carry report-only sector attributes separately from `indicators`, and verify existing non-report selected-feature display still shows name, code, UF/context, and selected indicator.
- [x] 2.2 Update fallback indicator normalization to include the new indicator IDs only when raw feature properties provide those fields, and verify assets with an `indicators` object still use that object as the source of truth.
- [x] 2.3 Update the map-click report popup to render report-only sector attributes for census sector records, and verify UF, microregion, and municipality reports do not show empty sector-only fields.
- [x] 2.4 Verify the new indicators appear in the indicator selector, map legend/style, chart, table, and report using regenerated static metadata.

## 3. Verification

- [x] 3.1 Run `npm run prepare:geodata` and verify it completes with the new aggregate row counts and regenerated assets.
- [x] 3.2 Run `npm run build` and verify the production build succeeds.
- [x] 3.3 Run `openspec validate "add-sector-report-fields-and-demographic-indicators" --strict` and verify the change passes.
