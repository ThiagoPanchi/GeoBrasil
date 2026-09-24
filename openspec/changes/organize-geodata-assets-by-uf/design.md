## Context

See `proposal.md` for motivation. Current static geodata is generated under `public/geodata/`, with municipalities written as `municipalities/<UF>.fgb`, sectors written as `sectors/<CD_MUN>.fgb`, and aggregated CNEFE outputs written as `cnefe-aggregated/<COD_MUNICIPIO>-part-XXXX.fgb`. The frontend resolves territorial assets through `public/geodata/manifest.json`, so changing paths is safe only if the manifest remains coherent with the generated files.

## Goals / Non-Goals

**Goals:**
- Reorganize `municipalities`, `sectors`, and `cnefe-aggregated` assets under UF subfolders.
- Keep manifest-driven frontend loading working after path changes.
- Keep local full-Brazil generation possible.
- Configure git ignore rules so SC generated assets can be committed while non-SC generated assets remain ignored by default.

**Non-Goals:**
- Remove non-SC records from the generated manifest.
- Change the UI state model, selectors, or map navigation behavior.
- Change raw CNEFE ZIP input layout.
- Reorganize `microregions`, `ufs.fgb`, or `ufs.geojson` unless directly required by manifest consistency.

## Decisions

- Use UF acronym subdirectories for all three target folders.
  - Target examples: `public/geodata/municipalities/SC/SC.fgb`, `public/geodata/sectors/SC/4200051.fgb`, and `public/geodata/cnefe-aggregated/SC/4200051-part-0001.fgb`.
  - Rationale: acronym folders are readable and match existing UF identifiers in the manifest.
  - Alternative considered: numeric IBGE folders such as `42/`. That would align with file prefixes but be less readable for maintainers.

- Derive UF differently by dataset.
  - `municipalities`: use the UF acronym file stem, such as `SC.fgb` -> `SC/SC.fgb`.
  - `sectors`: use the first two digits of `CD_MUN` file names and map them through the IBGE UF code table.
  - `cnefe-aggregated`: use the first two digits of the municipality-code part file name and map them through the same table.
  - Rationale: sectors and CNEFE files are municipality-code based, while municipality assets are already UF-acronym based.

- Update `prepare-static-geodata.mjs` to generate the new path layout and matching manifest paths.
  - Rationale: `manifest.json` currently points municipality entries to `geodata/sectors/<CD_MUN>.fgb` and UF entries to `geodata/municipalities/<UF>.fgb`. These must change with the files.
  - Alternative considered: move files after generation without changing the script. That would be fragile because rerunning geodata prep would recreate the old structure.

- Update `aggregate-cnefe-geodata.mjs` to write aggregated outputs under UF subfolders.
  - Rationale: aggregated CNEFE outputs are generated separately from the static territorial manifest, so the aggregation script owns this layout.
  - Alternative considered: add a separate post-processing move script. That adds another step and can drift from aggregation output.

- Keep the manifest national by explicit user decision.
  - Rationale: the user chose to keep all Brazil in the manifest even if only SC assets are versioned.
  - Trade-off: repository-only deployments may expose manifest entries for non-SC assets that are ignored by git and therefore missing unless the environment generated them locally.

- Use `.gitignore` negation rules for SC assets.
  - Rationale: ignore broad generated geodata directories first, then unignore `SC/` subdirectories and required manifest/top-level assets.
  - Alternative considered: remove non-SC files from generation. That would limit local workflows and contradict the goal of preserving full-Brazil generation.

## Risks / Trade-offs

- National manifest with SC-only committed assets can produce missing asset errors for non-SC selections in repository-only deployments -> preserve the behavior by user decision and rely on existing static asset error feedback.
- Git ignore negation is order-sensitive -> add explicit parent-directory unignore rules before SC file unignore rules.
- Moving sectors changes thousands of manifest paths -> verify generated manifest contains `geodata/sectors/SC/42...fgb` for SC municipalities and analogous paths for other UFs.
- Existing generated files in old flat folders may remain locally -> implementation should move or regenerate target assets and avoid leaving ambiguous duplicates in the same directory.

## Migration Plan

1. Add a shared or local IBGE UF code mapping where needed by geodata scripts.
2. Update static geodata generation to write municipalities and sectors under UF subfolders and update manifest paths accordingly.
3. Update CNEFE aggregation output to write aggregated files under UF subfolders.
4. Move or regenerate existing generated files into the new layout.
5. Update `.gitignore` to ignore non-SC generated geodata while allowing SC assets and required manifests/top-level files.
6. Validate that `npm run build` still succeeds and that manifest paths resolve for SC assets.
