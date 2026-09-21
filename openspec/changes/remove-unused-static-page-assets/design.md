## Context

See `proposal.md` for motivation. The current static path is centered on `frontend/` with Vite, React, `flatgeobuf`, `frontend/scripts/prepare-static-geodata.mjs`, and assets under `frontend/public/geodata/`. The README already states that `backend/` and `database/` are legacy and not required for the static portfolio, while the current repository still contains backend Python files, database SQL/scripts, Python caches, a backend virtual environment, and generated `frontend/dist` output.

## Goals / Non-Goals

**Goals:**

- Make the repository and publication workflow reflect the static GitHub Pages runtime.
- Remove or ignore local/generated artifacts that are not needed for source control or publication.
- Preserve the ability to regenerate static geodata from the simplified FlatGeobuf sources.
- Verify the static frontend can still build after cleanup.

**Non-Goals:**

- Redesign the WebGIS UI or map interaction model.
- Change the geodata schema, indicator definitions, or territorial navigation behavior.
- Add backend replacement services or new hosting infrastructure.
- Delete required source data inputs under `data/FlatGeoBuf`.

## Decisions

- Treat `frontend/` as the only runtime application for GitHub Pages.
  - Rationale: `frontend/src/api.ts` reads `geodata/manifest.json` and FlatGeobuf/GeoJSON files through browser `fetch`, and no frontend source references a localhost backend endpoint.
  - Alternative considered: keep backend/database code documented as legacy. This preserves ambiguity and does not satisfy the cleanup goal.

- Remove legacy backend/database source only if no current static workflow imports or invokes it.
  - Rationale: the static build path is `npm run build:static`, which runs the geodata preparation script and Vite build inside `frontend/`; the inspected frontend code does not call Python or SQL assets.
  - Alternative considered: move legacy code to an archive directory. That keeps unused material in the repository and still invites confusion unless a concrete historical retention need exists.

- Keep generated and local artifacts out of source control.
  - Rationale: `frontend/dist`, Python `__pycache__`, `.pytest_cache`, and `.venv` content are reproducible or machine-local and should not be part of the static source package.
  - Alternative considered: publish committed `frontend/dist`. The README describes `frontend/dist` as build output; GitHub Pages can consume it from a build/deploy workflow without treating it as source.

- Keep static geodata publication assets separate from raw data inputs.
  - Rationale: `frontend/public/geodata` is the browser-consumed asset tree, while `data/FlatGeoBuf/*_simp.fgb` is the source for regeneration. Large unrelated raw datasets should remain local unless directly required by the static page.
  - Alternative considered: include all `data/` files in the repository. This increases size and exposes inputs not used by the GitHub Pages page.

## Risks / Trade-offs

- Removing legacy backend/database code may discard useful historical examples -> Mitigate by relying on version control history and only removing files after confirming they are not referenced by static workflows.
- Over-broad ignore rules could hide required geodata inputs -> Mitigate with explicit exceptions for required `data/FlatGeoBuf/*_simp.fgb` inputs if those files should be versioned.
- Static build may require large geodata sources that are absent in a fresh clone -> Mitigate by documenting required inputs and validating `npm run build:static` with the local data present.
- Generated `frontend/public/geodata` may be large but required for local preview -> Mitigate by documenting when to regenerate it and deciding whether the deployed assets are produced by build automation or committed intentionally.

## Migration Plan

1. Audit tracked files and references for backend/database, generated caches, virtual environments, `frontend/dist`, raw datasets, and static geodata assets.
2. Remove unused legacy source and generated artifacts that are not needed by the static GitHub Pages workflow.
3. Update `.gitignore` and documentation to distinguish required static inputs, generated outputs, and unsupported legacy paths.
4. Run the static build workflow from `frontend/` and verify it does not require FastAPI, PostgreSQL/PostGIS, or localhost endpoints.
5. If rollback is needed, restore removed legacy files from version control and keep the updated static workflow isolated.
