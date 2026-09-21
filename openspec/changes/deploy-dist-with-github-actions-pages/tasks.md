## 1. Add GitHub Pages Workflow

- [x] 1.1 Create `.github/workflows/deploy-pages.yml` using official GitHub Pages actions, and verify the workflow defines `contents: read`, `pages: write`, and `id-token: write` permissions.
- [x] 1.2 Configure the workflow to run on pushes to `main` and manual dispatch, and verify it uses a Pages concurrency group to avoid overlapping deploys.
- [x] 1.3 Configure the workflow to check out the repo, set up Node, run `npm ci`, run `npm run build` with `VITE_BASE_PATH=/GeoBrasil/`, upload `dist`, and deploy the uploaded Pages artifact.

## 2. Align Documentation

- [x] 2.1 Update `README.md` so GitHub Pages instructions tell maintainers to select `GitHub Actions` as the Pages source, and verify it no longer says branch/root source is the production publishing path.
- [x] 2.2 Update `docs/architecture.md` or related active docs to describe GitHub Actions publishing the `dist` artifact, and verify they distinguish source files from deployed build output.

## 3. Verify Local Build Artifact

- [x] 3.1 Run `npm install` if root dependencies are absent, then run `npm run build` from the repository root and verify the command succeeds without backend, database, or localhost API services.
- [x] 3.2 Inspect root `dist/index.html` and verify it references bundled `/GeoBrasil/assets/...` files and does not reference `/src/main.tsx`.
- [x] 3.3 Inspect root `dist/geodata/manifest.json` and verify the build artifact includes static geodata assets required by the WebGIS.

## 4. Verify Deployment Readiness

- [x] 4.1 Verify `.github/workflows/deploy-pages.yml` does not depend on ignored local `data/FlatGeoBuf` files or the old `frontend/node_modules` directory.
- [ ] 4.2 After pushing, verify the GitHub Actions run completes successfully and the repository Pages settings use `GitHub Actions` as the source.
- [ ] 4.3 After deployment, verify `https://thiagopanchi.github.io/GeoBrasil/` loads bundled assets from `/GeoBrasil/assets/` and no longer requests `/src/main.tsx`.
- [x] 4.4 Run OpenSpec validation for `deploy-dist-with-github-actions-pages` and verify the change artifacts pass validation.
