# static-webgis-deployment Specification

## Purpose

Define como o GeoBrasil deve funcionar como WebGIS estatico publicado em GitHub Pages, sem exigir backend, banco de dados ou servicos privados em tempo de execucao.

## Requirements

### Requirement: Execucao estatica publicada
The system SHALL run the public WebGIS experience from static files served by GitHub Pages.

#### Scenario: Abrir portfolio publicado
- **WHEN** a user opens the published GitHub Pages URL
- **THEN** the application loads the WebGIS interface without requiring a Python backend, PostgreSQL/PostGIS database, or runtime server controlled by the project
- **AND** the map can start with the available static assets

#### Scenario: Recarregar rota publicada
- **WHEN** a user refreshes the published application URL
- **THEN** the application remains loadable from GitHub Pages static hosting

### Requirement: Manifesto de assets territoriais
The system SHALL expose a static manifest that maps each selectable territorial context to the static assets needed to render it.

#### Scenario: Resolver assets de UF
- **WHEN** a user selects a UF
- **THEN** the system can resolve the UF-specific municipality and microregion assets without querying a backend API

#### Scenario: Resolver assets de municipio
- **WHEN** a user selects a municipality
- **THEN** the system can resolve the municipality-specific census sector asset without querying a backend API

### Requirement: Falha compreensivel de asset estatico
The system SHALL present clear user feedback when a required static asset cannot be loaded.

#### Scenario: Asset ausente ou inacessivel
- **WHEN** the selected territorial context references an asset that is missing, inaccessible, or unreadable
- **THEN** the interface displays an error state naming the affected context
- **AND** the application keeps the previous valid map state when one exists
