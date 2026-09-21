## Why

The project is now positioned as a static React/Vite WebGIS published through GitHub Pages, but the repository still contains legacy backend/database artifacts and generated outputs that are not part of that operational path. Removing unused pieces reduces maintenance noise, avoids confusion about runtime requirements, and keeps the published portfolio focused on static assets.

## What Changes

- Remove or exclude legacy runtime artifacts that are not required for the GitHub Pages static page, including FastAPI/PostGIS code paths and local generated caches/environments.
- Keep the static frontend workflow centered on `frontend/`, `frontend/public/geodata/`, and `frontend/scripts/prepare-static-geodata.mjs`.
- Keep source geodata inputs needed to regenerate static assets, especially `data/FlatGeoBuf/*_simp.fgb`, while avoiding publication of unrelated raw/local datasets.
- Update documentation and ignore rules so the supported path is unambiguous: prepare static geodata, build Vite, publish `frontend/dist`.
- Preserve the browser-only behavior: the published page must not require backend services, database services, or localhost API calls.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `static-webgis-deployment`: Clarify that the static GitHub Pages distribution must include only the assets and code required for the browser WebGIS and must exclude unused legacy runtime dependencies from the publication path.

## Impact

- Affected areas: repository structure, ignore rules, documentation, frontend static build workflow, generated/public geodata artifacts.
- No public API is introduced or required.
- No runtime dependency on FastAPI, PostgreSQL/PostGIS, or project-controlled servers should remain for the published GitHub Pages experience.
