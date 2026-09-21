## Context

See `proposal.md` for motivation. The current repo has the Vite app under `frontend/`, with `frontend/index.html`, `frontend/src/`, `frontend/public/geodata/`, `frontend/scripts/prepare-static-geodata.mjs`, and package/config files under `frontend/`. GitHub Pages is currently serving the repository root and rendering `README.md`; there is no root-level `index.html` and no `.github` deploy workflow. The user chose the root-layout option rather than adding a GitHub Actions deploy pipeline for `frontend/dist`.

## Goals / Non-Goals

**Goals:**

- Make the repository root itself the Vite application root.
- Keep GitHub Pages root publishing compatible with the public URL `/GeoBrasil/`.
- Preserve static geodata generation and browser-only asset loading.
- Keep root-level documentation accurate after the layout change.

**Non-Goals:**

- Add a GitHub Actions deployment workflow.
- Introduce a backend, database, or API service.
- Redesign the WebGIS UI or change territorial navigation behavior.
- Change the static geodata schema or indicator calculations.

## Decisions

- Move the Vite project files from `frontend/` to the repository root.
  - Rationale: GitHub Pages root publishing looks for the site entrypoint at the repo root; placing `index.html` and the root package there prevents GitHub/Jekyll from rendering `README.md` as the site.
  - Alternative considered: keep `frontend/` and publish `frontend/dist` through GitHub Actions. This was technically cleaner for separation, but the selected direction is to move the app to root.

- Preserve the Vite `base` default as `/GeoBrasil/`.
  - Rationale: the published repository URL is `https://thiagopanchi.github.io/GeoBrasil/`, and the current built `index.html` already expects assets under `/GeoBrasil/`.
  - Alternative considered: use relative `./` assets. This can work for some static hosting setups but is less explicit for the known GitHub Pages repository path.

- Update `prepare-static-geodata.mjs` paths for the new root layout.
  - Rationale: the script currently derives `root` by walking from `frontend/scripts` to the repository root and writes to `frontend/public/geodata`; after moving to root, it should read `data/FlatGeoBuf` from the repository root and write to `public/geodata`.
  - Alternative considered: keep scripts in a nested folder with compatibility path logic. That adds migration complexity without a current need.

- Keep generated build output ignored and regenerate it locally.
  - Rationale: Vite output remains a generated artifact even after the app moves to the root; source should be `index.html`, `src/`, `public/`, scripts, and package/config files.
  - Alternative considered: commit root `dist/` for GitHub Pages. That duplicates generated output and can drift from source.

## Risks / Trade-offs

- Moving many files may create confusing delete/add diffs -> Mitigate by verifying the final root layout and using build commands from the root.
- Existing documentation or commands may still mention `frontend/` -> Mitigate by searching docs and package scripts for stale paths.
- Root `README.md` and root `index.html` will coexist -> Mitigate by relying on GitHub Pages precedence for `index.html` and verifying the published URL no longer renders the README.
- Static geodata source files are local/ignored -> Mitigate by preserving `public/geodata` as the build input for normal `npm run build`, and documenting when `npm run prepare:geodata` requires local `data/FlatGeoBuf` files.

## Migration Plan

1. Move Vite source, public assets, scripts, package files, TypeScript config, Vite config, and environment example from `frontend/` to the repository root.
2. Update imports/config only where paths depend on the old `frontend/` location.
3. Adjust the geodata preparation script to read from root `data/FlatGeoBuf` and write to root `public/geodata`.
4. Update documentation to use root-level commands: `npm install`, `npm run prepare:geodata`, `npm run dev`, `npm run build:static`, and `npm run preview:pages`.
5. Run the static build and inspect the root `dist/` output for `index.html`, assets, and `geodata/`.
6. Confirm the GitHub Pages settings use branch/root publishing and, after deployment, verify the public URL loads the WebGIS instead of the README.
