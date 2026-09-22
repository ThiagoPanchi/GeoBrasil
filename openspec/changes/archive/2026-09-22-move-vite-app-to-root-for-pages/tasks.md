## 1. Move Vite App To Repository Root

- [x] 1.1 Move `frontend/index.html`, `frontend/src/`, `frontend/public/`, `frontend/scripts/`, `frontend/package.json`, package lockfile, `frontend/tsconfig.json`, `frontend/vite.config.ts`, and `frontend/.env.example` to equivalent root-level paths, and verify the root contains `index.html`, `src/main.tsx`, `public/geodata/manifest.json`, and `package.json`.
- [x] 1.2 Remove the now-empty or obsolete `frontend/` directory structure, and verify no required source, static asset, or config file remains only under `frontend/`.

## 2. Update Root Build Configuration

- [x] 2.1 Update `scripts/prepare-static-geodata.mjs` path resolution for the root layout, and verify it reads `data/FlatGeoBuf/*_simp.fgb` and writes generated files to `public/geodata/`.
- [x] 2.2 Verify Vite config still uses `/GeoBrasil/` as the default base path and root package scripts run from the repository root with `npm run build` and `npm run build:static`.
- [x] 2.3 Update `.gitignore` if needed so root `node_modules/`, root `dist/`, and local data remain ignored, and verify `git status --ignored` shows generated outputs as ignored.

## 3. Update Documentation

- [x] 3.1 Update `README.md` to describe the root-level app layout and root-level commands, and verify it no longer instructs maintainers to `cd frontend` or publish `frontend/dist`.
- [x] 3.2 Update `docs/architecture.md` and any other active docs that reference `frontend/` as the application root, and verify documentation consistently describes root GitHub Pages publishing.

## 4. Verify GitHub Pages Behavior

- [x] 4.1 Run `npm install` if dependencies are not present at the root, then run `npm run build:static` from the repository root and verify the command succeeds without backend, database, or localhost API services.
- [x] 4.2 Inspect root `dist/` and verify it contains `index.html`, Vite `assets/`, and `geodata/`, with no backend/database files or unrelated raw datasets.
- [x] 4.3 Verify root `index.html` and built `dist/index.html` reference the WebGIS application rather than README/Jekyll content, and verify built asset URLs use the `/GeoBrasil/` base path.
- [x] 4.4 Run OpenSpec validation for `move-vite-app-to-root-for-pages` and verify the change artifacts pass validation.
