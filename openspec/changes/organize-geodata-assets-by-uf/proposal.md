## Why

The generated geodata directories now contain thousands of FlatGeoBuf files at a single directory level, making repository review and selective versioning difficult. Organizing assets by UF subfolders and ignoring non-SC generated assets will make the committed geodata set easier to manage while preserving local workflows for full-Brazil generation.

## What Changes

- Organize `public/geodata/sectors/`, `public/geodata/municipalities/`, and `public/geodata/cnefe-aggregated/` into UF subfolders.
- For `sectors` and `cnefe-aggregated`, derive the UF from the first two digits of each file name using the provided IBGE UF code mapping.
- For `municipalities`, derive the UF from the existing UF file stem such as `SC.fgb`.
- Update geodata generation/manifest paths so the frontend can still resolve municipality and sector assets after the folder reorganization.
- Update aggregation output behavior so CNEFE aggregated files are written under UF subfolders.
- Update `.gitignore` so generated geodata remains local by default while SC files under the reorganized folders can be versioned.
- Keep the national manifest behavior by user decision, even though non-SC assets may be ignored in git and absent from repository-only deployments.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `static-webgis-deployment`: static asset paths and repository versioning rules must support UF-subfolder geodata and SC-only committed generated assets.
- `territorial-navigation`: territorial asset resolution must continue to work when municipality and sector asset paths include UF subfolders.
- `cnefe-address-geodata`: aggregated CNEFE outputs must be organized by UF subfolder using IBGE code prefixes.

## Impact

- Affected generated assets under `public/geodata/municipalities/`, `public/geodata/sectors/`, and `public/geodata/cnefe-aggregated/`.
- `scripts/prepare-static-geodata.mjs` should write/update manifest paths for UF subfolders.
- `scripts/aggregate-cnefe-geodata.mjs` should write aggregated outputs into UF subfolders.
- `.gitignore` should ignore non-SC generated geodata while preserving SC subfolder assets and required manifests/top-level assets.
- Existing raw data inputs and frontend UI interactions are not expected to change.
