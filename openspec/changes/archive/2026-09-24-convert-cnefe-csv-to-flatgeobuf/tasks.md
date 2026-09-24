## 1. Script Structure And Inputs

- [x] 1.1 Add a standalone CNEFE preparation script under `scripts/` and verify the file can be invoked with Node without syntax errors.
- [x] 1.2 Add a package command for the CNEFE preparation script and verify `package.json` exposes the command to maintainers.
- [x] 1.3 Implement input discovery for all `data/CNEFE/*.zip` files plus an optional single-ZIP argument, and verify the script can target `data/CNEFE/14_RR.zip` independently when present.

## 2. CSV And Geometry Conversion

- [x] 2.1 Implement ZIP CSV extraction and delimiter/quoted-field parsing, and verify required columns are detected with a clear error when missing.
- [x] 2.2 Convert valid `LONGITUDE` and `LATITUDE` rows into GeoJSON Point features, and verify invalid coordinate rows are skipped or reported without invalid output geometry.
- [x] 2.3 Partition converted features by `COD_MUNICIPIO`, and verify each output group contains only one municipality code.

## 3. Property Transformation

- [x] 3.1 Build `ENDERECO_COMPLETO` from the requested address source columns, and verify source address columns are absent from output properties.
- [x] 3.2 Preserve `COD_MUNICIPIO`, `COD_SETOR`, and `DSC_ESTABELECIMENTO`, and verify `COD_SETOR` is available in generated features for sector joins.
- [x] 3.3 Decode `COD_ESPECIE`, `COD_INDICADOR_ESTAB_ENDERECO`, `COD_INDICADOR_CONST_ENDERECO`, `COD_INDICADOR_FINALIDADE_CONST`, and `COD_TIPO_ESPECIE`, and verify mapped output labels match the spec.
- [x] 3.4 Exclude all unmentioned source columns, and verify generated feature properties contain only the approved output fields.

## 4. FlatGeoBuf Output

- [x] 4.1 Write municipality-partitioned FlatGeoBuf files below `public/geodata/cnefe/`, and verify output paths are created under that directory.
- [x] 4.2 Read back at least one generated FlatGeoBuf file with the existing `flatgeobuf` library, and verify feature geometry and properties are readable.

## 5. Verification And Instructions

- [x] 5.1 If `data/CNEFE/14_RR.zip` is available, run the CNEFE script against it and verify one or more municipality FlatGeoBuf outputs are generated.
- [x] 5.2 If `data/CNEFE/14_RR.zip` is not available, verify the script reports the missing input clearly and document that sample execution is blocked by the absent source file.
- [x] 5.3 Run `npm run build` and verify the production build succeeds after adding the script/package command.
- [x] 5.4 Run `openspec validate "convert-cnefe-csv-to-flatgeobuf" --strict` and verify the change passes.
- [x] 5.5 Provide maintainer instructions for running the script against all CNEFE ZIPs and against `data/CNEFE/14_RR.zip`, and verify the commands match `package.json`.

## 6. Large UF Streaming Fix

- [x] 6.1 Replace full CSV `TextDecoder.decode` usage with chunked or streaming CSV decoding, and verify the script no longer creates one JavaScript string for an entire CNEFE CSV.
- [x] 6.2 Preserve delimiter detection, quoted-field parsing, required-column validation, and row transformation under the chunked parser, and verify RR output still generates readable municipality FlatGeoBuf files.
- [x] 6.3 Run the script against the PA CNEFE ZIP that reproduced `Cannot create a string longer than 0x1fffffe8 characters`, and verify it completes or progresses past CSV decoding without that error.
- [x] 6.4 Re-run `npm run build` and `openspec validate "convert-cnefe-csv-to-flatgeobuf" --strict`, and verify both pass after the streaming fix.

## 7. Complete Run Memory Boundaries

- [x] 7.1 Refactor complete processing so each UF ZIP owns its own `featuresByMunicipality` map, and verify completed UF feature arrays are not retained while later ZIPs are processed.
- [x] 7.2 Write municipality FlatGeoBuf outputs immediately after each UF ZIP finishes, and verify logs make it clear which UF was written before the next UF starts.
- [x] 7.3 Change cleanup behavior so default all-ZIP runs still rebuild `public/geodata/cnefe/` from a clean directory, while explicit single-ZIP runs preserve unrelated existing UF outputs.
- [x] 7.4 Re-run syntax/build/OpenSpec validation after the per-UF flush change, and optionally run a targeted CNEFE ZIP to verify partial output preservation.

## 8. Bounded Streaming And Sharded Output

- [x] 8.1 Identify the current largest memory spikes in the CNEFE script, including ZIP entry inflation, active municipality feature arrays, and FlatGeoBuf serialization buffers, and choose concrete batch limits for output flushing.
- [x] 8.2 Refactor output accumulation so large municipalities can be written as deterministic part files without retaining all of their features in memory at once.
- [x] 8.3 Add or update a manifest/naming convention so every part for a municipality can be discovered after output sharding.
- [x] 8.4 Replace whole-entry ZIP/CSV inflation with streaming decompression/parsing if the inflated CSV buffer remains a peak-memory blocker after sharded output.
- [x] 8.5 Evaluate whether the bounded implementation should remain in Node.js or move to Python based on streaming library support, keeping the requirement that the pipeline must not accumulate whole CSVs or whole feature lists.
- [x] 8.6 Re-run syntax/build/OpenSpec validation and verify the UF that reproduced the latest `JavaScript heap out of memory` error completes or progresses past the previous failure point without unbounded heap growth.
