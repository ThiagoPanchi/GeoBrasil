## ADDED Requirements

### Requirement: Consumo frontend de CNEFE agregado
The frontend SHALL load aggregated CNEFE FlatGeoBuf assets for the selected municipality and filter them to the selected census sector using CNEFE properties.

#### Scenario: Carregar CNEFE agregado do municipio selecionado
- **WHEN** the user requests CNEFE points for a selected census sector
- **THEN** the frontend resolves the aggregated CNEFE asset files for the selected municipality
- **AND** it reads the files from static assets without requiring a backend service or database

#### Scenario: Filtrar CNEFE por setor
- **WHEN** aggregated CNEFE records are loaded for a municipality
- **THEN** only records whose first 15 digits of `COD_SETOR` match the selected census sector code are displayed
- **AND** records from other sectors in the same municipality are not displayed

#### Scenario: Usar propriedades agregadas para simbologia
- **WHEN** a CNEFE point is displayed
- **THEN** `ESPECIE_ENDERECO` determines its icon category
- **AND** `QUANTIDADE` determines its icon size class
- **AND** missing or invalid `QUANTIDADE` values are treated as `1` for display sizing

#### Scenario: Asset CNEFE ausente
- **WHEN** the selected municipality has no available aggregated CNEFE static asset
- **THEN** the interface displays a clear status message instead of failing silently
- **AND** the territorial choropleth layer remains usable
