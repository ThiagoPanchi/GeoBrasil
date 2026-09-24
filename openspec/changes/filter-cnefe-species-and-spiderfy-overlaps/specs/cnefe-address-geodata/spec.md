## ADDED Requirements

### Requirement: Coordenadas originais para renderizacao CNEFE deslocada
The frontend SHALL preserve each CNEFE point's original coordinate when applying visual displacement so filtering and popups can distinguish original data from display position.

#### Scenario: Preservar coordenada original
- **WHEN** a CNEFE point is loaded from an aggregated FlatGeoBuf asset
- **THEN** its original longitude and latitude remain available to the map overlay
- **AND** any visual displacement used to reduce overlap does not replace the original source geometry in the loaded record

#### Scenario: Filtrar por especie normalizada
- **WHEN** the user filters CNEFE points by `ESPECIE_ENDERECO`
- **THEN** filtering matches the same normalized species labels used by the CNEFE legend
- **AND** accent or casing differences do not prevent a valid category from matching
