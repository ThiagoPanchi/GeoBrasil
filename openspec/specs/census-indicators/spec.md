# census-indicators Specification

## Purpose

Define como o GeoBrasil disponibiliza indicadores do Censo 2022 para visualizacao territorial filtrada no mapa, graficos e tabela.

## Requirements

### Requirement: Catalogo de indicadores do MVP
The system SHALL provide the MVP indicator catalog from static metadata with population, demographic density, households, literacy, ethnicity/race, gender/sex, age group, responsible-person count, and average monthly income of responsible persons.

#### Scenario: Listar indicadores
- **WHEN** the user opens the indicator selector
- **THEN** the system lists all MVP indicators from static metadata with display name and unit or category context when available

#### Scenario: Identificar renda media mensal dos responsaveis
- **WHEN** the user views the income indicator in the catalog
- **THEN** the indicator represents average monthly income of responsible persons sourced from `V06004`
- **AND** the indicator label and unit communicate monetary income rather than a count or index

#### Scenario: Identificar quantidade de responsaveis
- **WHEN** the user views the responsible-person count indicator in the catalog
- **THEN** the indicator represents the quantity of responsible persons in private households sourced from the previous count field
- **AND** the indicator is not labeled as income

### Requirement: Consulta de valores por contexto territorial
The system SHALL provide indicator values only for records in the currently displayed territorial context from static assets or static metadata available to the frontend.

#### Scenario: Valores para UFs
- **WHEN** the current layer is UFs and the user selects an indicator
- **THEN** the system provides one value per displayed UF for that indicator

#### Scenario: Valores para municipios de uma UF
- **WHEN** the current layer is municipalities and a UF is selected
- **THEN** the system provides indicator values only for municipalities in the selected UF

#### Scenario: Valores para setores de um municipio
- **WHEN** the current layer is census sectors and a municipality is selected
- **THEN** the system provides indicator values only for census sectors in the selected municipality

#### Scenario: Renda media mensal nas camadas territoriais
- **WHEN** the user selects the average monthly income indicator
- **THEN** sector records use the `V06004` value joined from `data/Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip`
- **AND** municipality, microregion, and UF records provide aggregated values derived from their displayed sector records

#### Scenario: Responsaveis em domicilios particulares nas camadas territoriais
- **WHEN** the user selects the responsible-person count indicator
- **THEN** sector, municipality, microregion, and UF records provide the count value separately from the income indicator

### Requirement: Troca de indicador sem recarregar geometria desnecessaria
The system SHALL avoid rereading heavy static geometry when only the selected indicator changes and the current territorial geometry remains valid.

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
