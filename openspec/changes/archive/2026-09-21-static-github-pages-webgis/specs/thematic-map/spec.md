## ADDED Requirements

### Requirement: Simbologia calculada no cliente
The system SHALL calculate choropleth styling in the browser from the records currently loaded from static assets.

#### Scenario: Aplicar indicador em asset estatico
- **WHEN** the user selects an indicator for a territorial layer loaded from static assets
- **THEN** each displayed geometry receives a color corresponding to the class of its indicator value using client-side calculation

#### Scenario: Trocar indicador sem backend
- **WHEN** the user changes the selected indicator while static territorial records remain loaded
- **THEN** the system recalculates feature colors without requesting backend-computed styles

### Requirement: Metadados de extensao calculados no cliente
The system SHALL determine the map viewport bounds from the currently loaded static records when server-provided metadata is unavailable.

#### Scenario: Ajustar mapa com asset estatico
- **WHEN** a UF, microregion, municipality, or census sector layer is loaded from a static asset
- **THEN** the map fits to the extent of the displayed records
