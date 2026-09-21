## 1. Static Build And Deployment Setup

- [x] 1.1 Configure `frontend/vite.config.ts` for GitHub Pages base-path support and verify `npm run build` succeeds from `frontend/`.
- [x] 1.2 Add or update frontend package scripts for static build/preview/deploy preparation and verify the documented build command produces `frontend/dist`.
- [x] 1.3 Ensure published asset URLs are relative to the Vite base path and verify a local production preview can load bundled CSS, JS, and public assets.

## 2. Geodata Preparation Pipeline

- [x] 2.1 Add a local data preparation script that checks for the required source files in `data/FlatGeoBuf/` and verifies missing files produce a clear failure message.
- [x] 2.2 Implement UF partition generation for `BR_Municipios_2025_simp.fgb` and verify one municipality `.fgb` output exists per UF with deterministic filenames.
- [x] 2.3 Implement UF partition generation for `BR_Microrregioes_2022_simp.fgb` and verify one microregion `.fgb` output exists per UF with deterministic filenames.
- [x] 2.4 Implement municipality partition generation for `BR_setores_CD2022_simp.fgb` and verify sector `.fgb` outputs exist for municipalities present in the manifest.
- [x] 2.5 Generate the static territorial manifest with UF metadata, municipality metadata, microregion metadata, asset URLs, and indicator metadata; verify the manifest is valid JSON and references existing generated files.
- [x] 2.6 Document data preparation prerequisites such as GDAL/`ogr2ogr` and verify a contributor can identify the command needed before `npm run build`.

## 3. Static Frontend Data Services

- [x] 3.1 Add a browser-compatible FlatGeobuf reader dependency or implementation and verify the frontend build resolves it without backend packages.
- [x] 3.2 Replace backend endpoint wrappers in `frontend/src/api.ts` with static manifest and asset readers and verify existing callers can load UFs and indicators without `VITE_API_URL`.
- [x] 3.3 Add feature normalization for UF, microregion, municipality, and sector records and verify normalized records expose stable ids, names, hierarchy fields, geometry, and indicators.
- [x] 3.4 Implement client-side bbox calculation and verify a loaded static FeatureCollection includes bounds usable by the map viewport.
- [x] 3.5 Implement client-side choropleth break calculation and feature styling and verify changing an indicator updates `indicatorValue`, `fillColor`, and legend data without rereading unchanged geometry.
- [x] 3.6 Add stale-load protection using abortable requests or request tokens and verify rapid selection changes cannot display records from an older context.

## 4. Map And Dashboard Behavior

- [x] 4.1 Update initial map loading to use static UF assets and verify the application opens with the UF layer and no lower-level layer loaded.
- [x] 4.2 Update UF selection to load only that UF's municipality and microregion assets and verify the map, table, charts, legend, and status represent the selected UF.
- [x] 4.3 Update microregion selection to filter/display municipalities within the selected UF and verify dependent municipality and sector selections are cleared.
- [x] 4.4 Update municipality drill-down to load only that municipality's sector asset and verify the map, table, charts, legend, and status represent only sectors for that municipality.
- [x] 4.5 Update error and loading states for missing or unreadable static assets and verify the previous valid map state remains visible when a later asset load fails.
- [x] 4.6 Verify map click and double-click flows update selected feature, popup or side panel details, current layer, and back navigation consistently across UF, microregion, municipality, and sector contexts.

## 5. Backend/PostGIS Runtime Removal

- [x] 5.1 Remove frontend runtime dependence on `VITE_API_URL` and verify the built application does not issue requests to `localhost:8000` or project API endpoints.
- [x] 5.2 Keep or mark backend/database files as legacy documentation only and verify README instructions no longer require FastAPI or PostgreSQL/PostGIS for the portfolio path.
- [x] 5.3 Update project documentation to describe the static GitHub Pages workflow and verify it includes build, data preparation, preview, and deployment steps.

## 6. Verification

- [x] 6.1 Run the geodata preparation command and verify generated assets and manifest exist under the frontend public asset directory.
- [x] 6.2 Run `npm run build` in `frontend/` and verify it completes successfully.
- [x] 6.3 Run a production preview and manually verify the GitHub Pages-style base path loads the app, UF layer, UF municipality/microregion assets, municipality sector assets, indicators, legend, table, charts, loading states, and error feedback.
- [x] 6.4 Run `openspec validate --change static-github-pages-webgis --strict` and verify the change artifacts pass validation.
