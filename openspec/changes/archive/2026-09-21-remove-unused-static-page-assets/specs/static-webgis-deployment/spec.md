## ADDED Requirements

### Requirement: Public static distribution is limited to required assets
The system SHALL keep the GitHub Pages publication path limited to the static frontend bundle and the static geodata assets required by the browser WebGIS.

#### Scenario: Build output for GitHub Pages
- **WHEN** the static publication build is prepared
- **THEN** the output intended for GitHub Pages contains the Vite application bundle and required geodata assets
- **AND** it excludes legacy backend code, database scripts, local virtual environments, caches, and raw datasets that are not consumed by the published browser application

#### Scenario: Repository guidance for static publication
- **WHEN** a maintainer follows the documented publication workflow
- **THEN** the instructions identify the static frontend and geodata preparation workflow as the supported path
- **AND** they do not require FastAPI, PostgreSQL/PostGIS, or localhost services for the published page
