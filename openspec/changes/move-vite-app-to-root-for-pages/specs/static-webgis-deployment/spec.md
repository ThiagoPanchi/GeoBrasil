## ADDED Requirements

### Requirement: Root Pages publication loads the WebGIS application
The system SHALL support GitHub Pages configured to publish from the repository root by placing the static WebGIS entrypoint and build configuration at the repository root.

#### Scenario: Open root-published GitHub Pages URL
- **WHEN** a user opens the GitHub Pages URL for the repository
- **THEN** the published page loads the WebGIS application entrypoint instead of rendering the repository README
- **AND** the map interface can start using the configured static asset base path

#### Scenario: Build static WebGIS from repository root
- **WHEN** a maintainer runs the documented static build command from the repository root
- **THEN** the build produces a deployable static output containing the Vite bundle and required geodata assets
- **AND** the build does not require a Python backend, PostgreSQL/PostGIS, or localhost API service

#### Scenario: Resolve assets after root layout migration
- **WHEN** the application is served from the GitHub Pages repository URL
- **THEN** static asset URLs resolve under the repository base path
- **AND** territorial assets can still be resolved from the generated static geodata manifest
