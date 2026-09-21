## Context

See `proposal.md` for motivation. The current Pages URL no longer renders the README, but it serves the repository source `index.html`, which points to `/src/main.tsx`; GitHub Pages does not run Vite or transpile TypeScript at request time. Local production builds already produce the correct `dist/index.html` with bundled assets under `/GeoBrasil/assets/...`, and `dist/geodata/` contains the static geodata assets needed by the WebGIS.

There is currently no `.github` workflow for Pages deployment. The active `move-vite-app-to-root-for-pages` change has moved the Vite app toward the repository root but is not complete because the old ignored `frontend/node_modules` directory is locked by Windows; this deploy change should not depend on that ignored directory being removed.

## Goals / Non-Goals

**Goals:**

- Publish the production Vite build output to GitHub Pages using GitHub Actions.
- Configure the workflow for free GitHub Pages hosting with official Pages actions.
- Keep `/GeoBrasil/` as the build base path for the repository Pages URL.
- Make documentation clear that GitHub Pages must use the Actions source and the `dist` artifact.

**Non-Goals:**

- Add a backend, database, or runtime API service.
- Commit generated `dist/` files as source.
- Redesign the WebGIS UI or geodata model.
- Resolve the Windows file lock on ignored `frontend/node_modules`; that remains part of the root-layout cleanup.

## Decisions

- Add a GitHub Actions Pages workflow instead of serving branch/root source files.
  - Rationale: Pages root source serves Vite development HTML, which references TypeScript source instead of bundled production assets.
  - Alternative considered: commit `dist` contents to the repository root. This can work but mixes generated output with source and risks drift.

- Build from the repository root using the current package scripts.
  - Rationale: the current package files, Vite config, source, scripts, and public assets are at the repository root after the root-layout migration work.
  - Alternative considered: rebuild from `frontend/`. That no longer matches the current working layout and would reintroduce stale paths.

- Use `npm run build` in CI, not `npm run build:static`, unless geodata sources are later committed or downloaded in CI.
  - Rationale: `npm run build` copies committed `public/geodata` into `dist`, while `npm run build:static` requires local ignored `data/FlatGeoBuf/*_simp.fgb` files that may not exist in GitHub Actions.
  - Alternative considered: use `build:static` in CI and fetch/generate source data. That is heavier and unnecessary if `public/geodata` is already versioned.

- Set `VITE_BASE_PATH=/GeoBrasil/` in the workflow.
  - Rationale: the repository Pages URL uses `/GeoBrasil/`, and the built HTML must reference assets under that base path.
  - Alternative considered: rely only on the default in `vite.config.ts`. Explicit CI env makes the deployment intent visible and resilient if defaults change.

## Risks / Trade-offs

- GitHub Pages remains configured to branch/root source -> Mitigate by documenting and requiring Pages source `GitHub Actions`.
- CI build cannot find dependencies or cache paths -> Mitigate with root `package-lock.json`, `npm ci`, and `cache-dependency-path: package-lock.json`.
- CI build omits geodata if `public/geodata` is not committed -> Mitigate by verifying `public/geodata/manifest.json` is present before upload.
- Active root-layout change is not fully complete -> Mitigate by making this workflow target the current root layout and not depend on deleting ignored old `frontend/node_modules`.

## Migration Plan

1. Add a Pages workflow under `.github/workflows/` that checks out the repo, sets up Node, installs dependencies with `npm ci`, builds with `npm run build`, uploads `dist`, and deploys with the official Pages action.
2. Configure workflow permissions for GitHub Pages: `contents: read`, `pages: write`, and `id-token: write`.
3. Ensure the workflow sets `VITE_BASE_PATH=/GeoBrasil/` and uses root `package-lock.json` for npm caching.
4. Update documentation to instruct maintainers to set GitHub Pages source to `GitHub Actions` and not branch/root.
5. Verify locally that `npm run build` produces `dist/index.html`, `dist/assets/`, and `dist/geodata/`.
6. After pushing, verify the GitHub Actions run succeeds and the public URL loads bundled assets instead of `/src/main.tsx`.
