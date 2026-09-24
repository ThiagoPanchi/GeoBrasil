## 1. Static Territorial Geodata

- [x] 1.1 Add deterministic IBGE UF-code-to-acronym mapping for static geodata generation and verify all required codes `11,12,13,14,15,16,17,21,22,23,24,25,26,27,28,29,31,32,33,35,41,42,43,50,51,52,53` are covered.
- [x] 1.2 Update municipality FlatGeoBuf output paths to `public/geodata/municipalities/<UF>/<UF>.fgb` and verify a generated SC file exists at `public/geodata/municipalities/SC/SC.fgb`.
- [x] 1.3 Update sector FlatGeoBuf output paths to `public/geodata/sectors/<UF>/<CD_MUN>.fgb` and verify at least one SC sector file exists under `public/geodata/sectors/SC/` with a `42` prefix.
- [x] 1.4 Update `public/geodata/manifest.json` generation so municipality and sector paths include UF subfolders and verify SC manifest entries reference `geodata/municipalities/SC/SC.fgb` and `geodata/sectors/SC/42...fgb`.

## 2. CNEFE Aggregated Geodata

- [x] 2.1 Update aggregated CNEFE output paths to `public/geodata/cnefe-aggregated/<UF>/<file>.fgb` using the IBGE UF-code mapping and verify a `42...fgb` input writes under `public/geodata/cnefe-aggregated/SC/`.
- [x] 2.2 Add explicit handling for unknown municipality-code prefixes in CNEFE aggregation and verify an invalid prefix produces a clear error or warning instead of an incorrect output folder.

## 3. Repository Versioning

- [x] 3.1 Update `.gitignore` to ignore generated non-SC geodata under `municipalities`, `sectors`, and `cnefe-aggregated` while unignoring SC subfolders and verify `git check-ignore -v` reports non-SC assets ignored and SC assets not ignored.
- [x] 3.2 Ensure required geodata manifests and top-level base assets remain addable and verify `git check-ignore -v public/geodata/manifest.json` does not report the file ignored.

## 4. Migration And Verification

- [x] 4.1 Move or regenerate existing generated files into UF subfolders and verify no old flat `municipalities/<UF>.fgb`, `sectors/<CD_MUN>.fgb`, or `cnefe-aggregated/<CD_MUN>-part-XXXX.fgb` files remain locally.
- [x] 4.2 Run script syntax checks for modified Node scripts and verify they pass.
- [x] 4.3 Run `npm run build` and verify the frontend build succeeds with the reorganized manifest.
- [x] 4.4 Run `openspec validate organize-geodata-assets-by-uf --strict` and verify the change remains valid after implementation.
