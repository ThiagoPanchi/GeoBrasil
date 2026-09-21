## Why

GitHub Pages is currently serving the repository root and rendering `README.md` instead of the WebGIS, because the Vite entrypoint and build output live under `frontend/`. Moving the Vite application to the repository root aligns the source layout with the selected GitHub Pages root publishing mode so the published URL can load the map application directly.

## What Changes

- **BREAKING**: Move the Vite/React application structure from `frontend/` to the repository root so root-level GitHub Pages publishing finds `index.html` and builds from the root package.
- Move root-relevant frontend files and folders, including `index.html`, `src/`, `public/`, `scripts/`, `package.json`, package lockfile, TypeScript config, Vite config, and frontend environment example.
- Update package scripts and data-preparation paths so `npm run build:static` works from the repository root and still generates/copies static geodata assets.
- Preserve the GitHub Pages base path `/GeoBrasil/` and the browser-only FlatGeobuf loading behavior.
- Update documentation so local development, static build, preview, and GitHub Pages instructions no longer require `cd frontend` or publishing `frontend/dist`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `static-webgis-deployment`: Change the supported GitHub Pages publication layout so the static WebGIS can be served from the repository root rather than from `frontend/dist` instructions.

## Impact

- Affected areas: repository layout, Vite config, npm scripts, static geodata preparation script paths, documentation, GitHub Pages publishing expectations.
- The public URL remains `https://thiagopanchi.github.io/GeoBrasil/` and the Vite base path remains `/GeoBrasil/` unless explicitly overridden.
- No backend, database, or runtime API is introduced.
