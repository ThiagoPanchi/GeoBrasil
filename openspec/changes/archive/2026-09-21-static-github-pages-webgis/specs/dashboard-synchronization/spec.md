## MODIFIED Requirements

### Requirement: Feedback de carregamento
The system SHALL provide visible loading feedback during static geographic asset reads and indicator metadata reads.

#### Scenario: Carregar setores censitarios
- **WHEN** the system is loading a municipality-partitioned census sector asset
- **THEN** the interface displays a loading message or indicator until the request finishes

#### Scenario: Carregar camada territorial
- **WHEN** the system is loading UFs, microregions, municipalities, sectors, or indicator-styled records from static assets
- **THEN** the interface displays the current loading context and replaces it with success or failure feedback when the request finishes

## ADDED Requirements

### Requirement: Estado sincronizado com assets estaticos
The system SHALL synchronize map, selectors, charts, table, legend, and selected feature from the same static records loaded for the current territorial context.

#### Scenario: Dados carregados de arquivo particionado
- **WHEN** the application finishes loading a UF- or municipality-partitioned asset
- **THEN** the map, charts, table, legend, current layer, and selected feature state represent only records from that loaded asset and any active territorial filter

#### Scenario: Troca de contexto durante carregamento
- **WHEN** the user changes UF, microregion, municipality, layer, or indicator while a previous static asset is still loading
- **THEN** the interface resolves to the latest selected context and does not display stale records from the previous context
