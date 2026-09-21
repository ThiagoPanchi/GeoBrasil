## Why

GitHub Pages is currently serving source files from the repository root, so the published page can load an unbundled Vite `index.html` and stay blank instead of running the built React application. Publishing the Vite `dist` directory through GitHub Actions ensures GitHub Pages receives production HTML, JavaScript, CSS, and static geodata assets.

## What Changes

- Add a GitHub Actions workflow that builds the static Vite application and publishes the generated `dist` artifact to GitHub Pages.
- Configure the workflow for free GitHub Pages hosting using the official Pages artifact/deploy actions and required Pages permissions.
- Keep the Vite base path compatible with the repository URL `/GeoBrasil/` during CI builds.
- Update documentation so GitHub Pages source is `GitHub Actions`, not branch/root source serving.
- Document that source files such as `index.html` and `src/main.tsx` are not served directly as the production site; `dist/` is the deployed artifact.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `static-webgis-deployment`: Change the publication contract so GitHub Pages serves a CI-built `dist` artifact instead of repository source files.

## Impact

- Affected areas: `.github/workflows/`, GitHub Pages deployment configuration, documentation, and static build verification.
- No backend, database, or runtime API is introduced.
- The public URL remains `https://thiagopanchi.github.io/GeoBrasil/`.
- This supersedes branch/root source publishing for production Pages deployment.
