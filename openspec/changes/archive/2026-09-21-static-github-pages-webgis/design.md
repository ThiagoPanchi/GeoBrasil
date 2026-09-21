## Context

See `proposal.md` for motivation. The current repository has a Vite/React frontend in `frontend/`, a FastAPI mock backend in `backend/app/main.py`, initial PostGIS scripts in `database/`, and existing OpenSpec contracts for territorial navigation, thematic map, census indicators, and dashboard synchronization. The frontend currently calls `VITE_API_URL` endpoints from `frontend/src/api.ts`; `MapView` expects GeoJSON FeatureCollections enriched by the backend with `metadata.breaks`, `metadata.bbox`, `fillColor`, and `indicatorValue`.

The source static geodata already exists under `data/FlatGeoBuf/`: UFs, municipalities, microregions, and census sectors. The published portfolio must not require a server-side API or database, so the apply work needs both a data preparation path and a runtime frontend path.

## Goals / Non-Goals

**Goals:**
- Serve the public WebGIS from `frontend/dist` on GitHub Pages with a base path that works under the repository URL.
- Replace runtime API calls with static asset and metadata reads from the frontend's public assets.
- Generate partitioned FlatGeobuf files for municipalities and microregions by UF and census sectors by municipality.
- Keep the interactive behavior consistent with the existing specs: initial UF layer, filtered lower layers, client-side choropleth, synchronized map/dashboard state, and visible loading/error feedback.
- Keep backend/PostGIS code out of the published runtime path.

**Non-Goals:**
- Deleting historical backend or database files from the repository solely for cleanup.
- Building a hosted API, tile server, vector tile pipeline, authentication, upload, editing, reports, or custom map authoring.
- Solving full national-sector rendering in one request; sectors remain municipality-scoped.
- Replacing MapLibre unless implementation proves the current renderer cannot consume the planned client-side data efficiently.

## Decisions

### Publish static assets under the frontend public directory

Prepare generated assets into a frontend-served directory such as `frontend/public/geodata/`, with a small JSON manifest referenced by relative URLs. Vite copies `public/` into `dist`, making the same paths work locally and on GitHub Pages when `base` is configured.

Alternative considered: read directly from `data/FlatGeoBuf/` at runtime. Rejected because files outside the frontend build output are not served by GitHub Pages and would make local/dev paths differ from production.

### Use partitioned FlatGeobuf as the primary geometry format

Keep the user's requested `.fgb` format for generated municipality, microregion, and sector partitions. The frontend should use a browser-compatible FlatGeobuf reader and convert the selected partition to GeoJSON features for MapLibre sources.

Alternative considered: convert everything to GeoJSON. Rejected as the primary path because GeoJSON files are typically larger and the request explicitly calls out the existing FlatGeobuf assets. GeoJSON can still be used for tiny metadata fixtures if useful.

### Generate partitions offline, not in the browser

Create a local preparation script that reads the source FlatGeobuf files and writes derived assets before build/deploy. The browser only loads already-partitioned files based on the manifest.

Alternative considered: load national FlatGeobuf files in the browser and filter there. Rejected because it defeats the main performance requirement and makes GitHub Pages users download national municipality, microregion, or sector datasets unnecessarily.

### Prefer GDAL/ogr2ogr for writing FlatGeobuf partitions

Use GDAL/`ogr2ogr` or an equivalent local geospatial CLI for the partition step because browser-focused FlatGeobuf libraries are primarily optimized for reading. The script should fail with a clear message if the local partitioning tool is unavailable.

Alternative considered: implement FlatGeobuf writing directly in project code. Rejected because it adds avoidable complexity and risk for a preparation-only step.

### Static manifest owns routing between selections and files

Generate or maintain a manifest that contains at least UF codes/names, asset URLs for UF-level municipalities and microregions, municipality codes/names/UF membership, municipality-to-sector asset URLs, and indicator metadata. The runtime state should resolve file paths from this manifest instead of constructing unchecked paths in components.

Alternative considered: hardcode file paths inside React components. Rejected because it would scatter data contracts across UI code and make validation of missing partitions harder.

### Move backend response enrichment to frontend data services

Replace `api.ts` endpoint wrappers with static data services that load manifest/assets, compute feature extents, compute choropleth breaks, set `indicatorValue` and `fillColor`, and expose typed records to the map/dashboard. This preserves component-level behavior while changing the source of truth.

Alternative considered: keep the same REST-like function names but fetch JSON files that mimic backend responses exactly. Partially acceptable for migration, but the chosen design should make static assets and client-side enrichment explicit so future code does not depend on nonexistent backend behavior.

### Configure Vite for GitHub Pages explicitly

Set Vite `base` to the repository pages path or an environment-driven value so assets resolve after deployment. Keep local development working with `npm run dev`.

Alternative considered: rely on root-relative URLs. Rejected because repository GitHub Pages deployments commonly serve under `/<repo>/`, where root-relative asset paths point to the wrong location.

## Risks / Trade-offs

- [Generated sector assets can be numerous] -> Mitigate with a manifest, deterministic filenames by municipality code, and documentation that generated files are build assets rather than hand-edited source.
- [GitHub Pages repository or bandwidth limits may be stressed by all municipality sector partitions] -> Mitigate by checking generated size before committing/deploying and, if needed, narrowing portfolio data scope or using release assets/CDN in a later change.
- [FlatGeobuf property names may not match existing frontend types] -> Mitigate by normalizing features in one data service layer and documenting required source columns during implementation.
- [GDAL may not be installed on every contributor machine] -> Mitigate with a clear prerequisite check and documented install instructions; runtime users are unaffected.
- [Async asset loads can race during rapid selection changes] -> Mitigate with request tokens or abortable fetches so only the latest selected context updates state.
- [Client-side classification for large municipality sector files can block the UI] -> Mitigate by loading only one municipality's sectors, showing loading feedback, and considering worker-based processing only if profiling shows a problem.

## Migration Plan

1. Add the static data preparation script and generated asset directory conventions.
2. Generate UF-partitioned municipality and microregion FlatGeobuf files plus municipality-partitioned sector FlatGeobuf files from `data/FlatGeoBuf/`.
3. Generate or update the static manifest and indicator metadata consumed by the frontend.
4. Replace runtime API reads in the frontend with static data service reads and client-side enrichment.
5. Configure Vite for GitHub Pages and verify local `npm run build` output resolves static assets with the configured base path.
6. Update documentation to describe static execution, data preparation, and deployment.

Rollback is to keep the existing FastAPI-backed flow on a branch or revert the frontend data-service/configuration changes; generated assets can be removed from the published build without affecting the original source FlatGeobuf files.
