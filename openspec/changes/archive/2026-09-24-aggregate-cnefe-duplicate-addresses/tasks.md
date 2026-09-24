## 1. Script And Command

- [x] 1.1 Add a standalone CNEFE aggregation script under `scripts/` and verify `node --check` passes for the new file.
- [x] 1.2 Add a package command such as `aggregate:cnefe` and verify `package.json` exposes the command.
- [x] 1.3 Implement CLI handling for one explicit FlatGeoBuf input path and verify a missing input path reports a clear error.

## 2. Aggregation Behavior

- [x] 2.1 Read CNEFE FlatGeoBuf input features with the existing `flatgeobuf` dependency and verify the script can iterate features from one generated `.fgb` file.
- [x] 2.2 Build deterministic grouping keys from point geometry coordinates plus all existing feature properties except `QUANTIDADE`, and verify property key order does not affect grouping.
- [x] 2.3 Collapse identical groups into one output feature with `QUANTIDADE`, and verify non-identical geometry or property values remain separate groups.
- [x] 2.4 Recompute `QUANTIDADE` when input already contains that property, and verify existing `QUANTIDADE` does not participate in grouping.

## 3. Output Assets

- [x] 3.1 Write aggregated FlatGeoBuf output under `public/geodata/cnefe-aggregated/`, and verify the source file under `public/geodata/cnefe/` is not overwritten.
- [x] 3.2 Preserve original geometry and existing properties on aggregated features, and verify only the additional `QUANTIDADE` property is added.
- [x] 3.3 Log source path, output path, input feature count, output feature count, and collapsed duplicate count so maintainers can inspect the result.

## 4. Verification And Instructions

- [x] 4.1 Run the aggregation script against one generated CNEFE FlatGeoBuf file, preferably a small `public/geodata/cnefe/*-part-*.fgb`, and verify an aggregated output file is created.
- [x] 4.2 Read back the aggregated FlatGeoBuf output and verify at least one feature includes numeric `QUANTIDADE`.
- [x] 4.3 Run `npm run build` and `openspec validate "aggregate-cnefe-duplicate-addresses" --strict`, and verify both pass.
- [x] 4.4 Provide the maintainer command for running the aggregation against one file, and verify the command matches `package.json`.

## 5. Folder Input Aggregation

- [x] 5.1 Extend CLI handling so the aggregation command accepts either one `.fgb` file or one directory, and verify invalid paths still report clear errors.
- [x] 5.2 For directory input, discover direct child `.fgb` files in deterministic sorted order, and verify non-`.fgb` files are ignored.
- [x] 5.3 Process directory inputs one file at a time without retaining prior file features or groups, and verify logs identify each source and output file.
- [x] 5.4 Preserve the existing single-file command behavior while adding directory mode, and verify both modes create outputs under `public/geodata/cnefe-aggregated/`.
- [x] 5.5 Run the aggregation command against `public/geodata/cnefe/` or a small CNEFE directory fixture, and verify one aggregated output file is created for each discovered input `.fgb`.
- [x] 5.6 Re-run `npm run build` and `openspec validate "aggregate-cnefe-duplicate-addresses" --strict`, and provide the maintainer command for aggregating the whole CNEFE folder.
