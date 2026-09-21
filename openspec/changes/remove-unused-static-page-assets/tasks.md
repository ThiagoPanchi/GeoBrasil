## 1. Audit Current Static Path

- [ ] 1.1 List tracked files related to `backend/`, `database/`, `frontend/dist`, Python caches, virtual environments, raw datasets, and `frontend/public/geodata`, and verify each candidate is classified as required source, generated output, local-only artifact, or legacy unused material.
- [ ] 1.2 Search the frontend build and source files for references to backend services, database scripts, localhost API endpoints, and legacy paths, and verify no required static workflow depends on the removal candidates.

## 2. Clean Repository Contents

- [ ] 2.1 Remove legacy backend/database files that are not referenced by the static GitHub Pages workflow, and verify the remaining source tree still contains the React/Vite app and geodata preparation script.
- [ ] 2.2 Remove generated or machine-local artifacts such as `frontend/dist`, Python `__pycache__`, `.pytest_cache`, and virtual environment contents from the repository, and verify they are no longer present in tracked changes.
- [ ] 2.3 Keep required static geodata generation inputs, especially `data/FlatGeoBuf/*_simp.fgb`, and verify `frontend/scripts/prepare-static-geodata.mjs` can still resolve its configured source paths.

## 3. Update Guardrails and Documentation

- [ ] 3.1 Update `.gitignore` to prevent re-adding local/generated artifacts while preserving any required source geodata exceptions, and verify `git status --ignored` shows expected ignored outputs.
- [ ] 3.2 Update README or publication notes so the supported workflow is `npm run prepare:geodata`, `npm run build:static`, and publishing `frontend/dist`, and verify the docs no longer imply FastAPI/PostGIS are required for GitHub Pages.

## 4. Verify Static Publication Behavior

- [ ] 4.1 Run the frontend static build workflow from `frontend/` and verify it succeeds without starting FastAPI, PostgreSQL/PostGIS, or any localhost API service.
- [ ] 4.2 Inspect the generated `frontend/dist` output and verify it contains the Vite application bundle plus required `geodata` assets, and excludes legacy backend/database files, virtual environments, caches, and unrelated raw datasets.
- [ ] 4.3 Run OpenSpec validation for `remove-unused-static-page-assets` and verify the change artifacts pass validation.
