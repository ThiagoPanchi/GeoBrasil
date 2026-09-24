## Why

The generated CNEFE address assets can contain repeated records that describe the same address and establishment characteristics. A maintainer-run aggregation step should collapse identical records and expose a `QUANTIDADE` count so downstream analysis can distinguish one unique address record from many identical occurrences.

## What Changes

- Add a standalone CNEFE aggregation script that reads existing CNEFE FlatGeoBuf outputs and writes aggregated outputs separately from the raw converted assets.
- Group records only when all existing feature properties and point geometry are identical, then add `QUANTIDADE` with the number of records in that identical group.
- Preserve the existing CNEFE source outputs, manifest, and conversion script behavior.
- Support running the aggregation against a single input file for lightweight validation.
- Support running the aggregation against a CNEFE output directory, processing each `.fgb` file one at a time and writing one aggregated output per input file.
- Provide a package command and maintainer-facing command examples for running the script.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `cnefe-address-geodata`: adds a derived aggregation preparation step that collapses identical CNEFE point records and records their count.

## Impact

- A new script is expected under `scripts/`, reusing the existing `flatgeobuf` package and accepting either one `.fgb` input file or a directory of `.fgb` files.
- `package.json` may add a convenience command for aggregation.
- Aggregated assets should be written under a separate output directory such as `public/geodata/cnefe-aggregated/` to avoid replacing the unaggregated CNEFE outputs.
- No frontend UI behavior is expected to change in this scope.
