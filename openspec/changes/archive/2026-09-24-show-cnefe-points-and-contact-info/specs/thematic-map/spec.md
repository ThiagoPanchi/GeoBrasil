## ADDED Requirements

### Requirement: Overlay CNEFE com simbologia por especie e quantidade
The system SHALL provide an optional CNEFE point overlay on the map that uses icon category to represent `ESPECIE_ENDERECO` and icon size to represent `QUANTIDADE`.

#### Scenario: Alternar camada CNEFE pelo mapa
- **WHEN** the user views the map tools
- **THEN** a CNEFE toggle button is available next to the existing color-scale and report controls
- **AND** the button communicates whether the CNEFE overlay is active

#### Scenario: Simbolizar especie do endereco
- **WHEN** CNEFE points are displayed
- **THEN** each point uses a distinct icon style for its `ESPECIE_ENDERECO`
- **AND** the supported species are `Domicílio particular`, `Domicílio coletivo`, `Estabelecimento agropecuário`, `Estabelecimento de ensino`, `Estabelecimento de saúde`, `Estabelecimento de outras finalidades`, `Edificação em construção ou reforma`, and `Estabelecimento religioso`

#### Scenario: Dimensionar pontos por quantidade
- **WHEN** CNEFE points are displayed
- **THEN** each point icon size is assigned from 4 or 5 discrete classes based on `QUANTIDADE`
- **AND** larger `QUANTIDADE` values render with larger icons than smaller `QUANTIDADE` values

#### Scenario: Legenda CNEFE ativa
- **WHEN** the CNEFE overlay is active
- **THEN** the map legend includes the CNEFE species icon categories
- **AND** the map legend includes the CNEFE size classes for `QUANTIDADE`
- **AND** the existing choropleth indicator legend remains visible for the territorial layer

#### Scenario: Legenda CNEFE inativa
- **WHEN** the CNEFE overlay is not active
- **THEN** the map legend does not show CNEFE icon or size entries
