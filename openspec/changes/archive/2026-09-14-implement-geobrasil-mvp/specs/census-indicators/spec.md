## Purpose

Define como o GeoBrasil disponibiliza indicadores do Censo 2022 para visualizacao territorial filtrada no mapa, graficos e tabela.

## ADDED Requirements

### Requirement: Catalogo de indicadores do MVP
The system SHALL provide the MVP indicator catalog with population, demographic density, households, literacy, ethnicity/race, gender/sex, age group, and income.

#### Scenario: Listar indicadores
- **WHEN** the user opens the indicator selector
- **THEN** the system lists all MVP indicators with display name and unit or category context when available

### Requirement: Consulta de valores por contexto territorial
The system SHALL return indicator values only for records in the currently displayed territorial context.

#### Scenario: Valores para UFs
- **WHEN** the current layer is UFs and the user selects an indicator
- **THEN** the system provides one value per displayed UF for that indicator

#### Scenario: Valores para municipios de uma UF
- **WHEN** the current layer is municipalities and a UF is selected
- **THEN** the system provides indicator values only for municipalities in the selected UF

#### Scenario: Valores para setores de um municipio
- **WHEN** the current layer is census sectors and a municipality is selected
- **THEN** the system provides indicator values only for census sectors in the selected municipality

### Requirement: Troca de indicador sem recarregar geometria desnecessaria
The system SHALL avoid retransmitting heavy geometry when only the selected indicator changes and the current territorial geometry remains valid.

#### Scenario: Alterar indicador na mesma camada
- **WHEN** the user changes the selected indicator without changing territory or layer
- **THEN** the system updates the indicator values for the displayed records
- **AND** does not require reloading the same heavy geometries when values can be updated separately

### Requirement: Densidade demografica calculavel
The system SHALL provide demographic density as population relative to territorial area for each displayed record.

#### Scenario: Exibir densidade
- **WHEN** the user selects the demographic density indicator
- **THEN** each displayed territorial record includes a density value compatible with its population and area

### Requirement: Categorias de indicadores agregados
The system SHALL represent categorical or distribution indicators using the categories available in the Censo 2022 source data.

#### Scenario: Exibir indicador categorico
- **WHEN** the user selects ethnicity/race, gender/sex, or age group
- **THEN** the system exposes values by source category for the displayed territorial records
