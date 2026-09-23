## MODIFIED Requirements

### Requirement: Catalogo de indicadores do MVP
The system SHALL provide the MVP indicator catalog from static metadata with population, demographic density, households, responsible-person count, average monthly income of responsible persons, sex counts, and color/race counts.

#### Scenario: Listar indicadores
- **WHEN** the user opens the indicator selector
- **THEN** the system lists only the supported MVP indicators from static metadata with display name and unit or category context when available
- **AND** the system includes men, women, white, black, yellow, brown, and indigenous count indicators
- **AND** the system does not list literacy, generic ethnicity/race, generic gender/sex, or age group as selectable indicators

#### Scenario: Identificar renda media mensal dos responsaveis
- **WHEN** the user views the income indicator in the catalog
- **THEN** the indicator represents average monthly income of responsible persons sourced from `V06004`
- **AND** the indicator label and unit communicate monetary income rather than a count or index

#### Scenario: Identificar quantidade de responsaveis
- **WHEN** the user views the responsible-person count indicator in the catalog
- **THEN** the indicator represents the quantity of responsible persons in private households sourced from the previous count field
- **AND** the indicator is not labeled as income

#### Scenario: Identificar indicadores por sexo
- **WHEN** the user views the sex count indicators in the catalog
- **THEN** the men indicator represents `V01007` from `data/Agregados_por_setores_demografia_BR.zip`
- **AND** the women indicator represents `V01008` from `data/Agregados_por_setores_demografia_BR.zip`
- **AND** both indicators are labeled and unitized as counts of people

#### Scenario: Identificar indicadores por cor ou raca
- **WHEN** the user views the color/race count indicators in the catalog
- **THEN** the white indicator represents `V01317` from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** the black indicator represents `V01318` from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** the yellow indicator represents `V01319` from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** the brown indicator represents `V01320` from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** the indigenous indicator represents `V01321` from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** all color/race indicators are labeled and unitized as counts of people

### Requirement: Consulta de valores por contexto territorial
The system SHALL provide indicator values only for supported catalog indicators and only for records in the currently displayed territorial context from static assets or static metadata available to the frontend.

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

#### Scenario: Sexo nas camadas territoriais
- **WHEN** the user selects the men or women indicator
- **THEN** sector records use the corresponding joined field from `data/Agregados_por_setores_demografia_BR.zip`
- **AND** municipality, microregion, and UF records provide summed counts derived from their sector records

#### Scenario: Cor ou raca nas camadas territoriais
- **WHEN** the user selects a white, black, yellow, brown, or indigenous indicator
- **THEN** sector records use the corresponding joined field from `data/Agregados_por_setores_cor_ou_raca_BR.zip`
- **AND** municipality, microregion, and UF records provide summed counts derived from their sector records

#### Scenario: Indicadores removidos nao retornam valores exibidos
- **WHEN** the system prepares or normalizes indicator values for displayed records
- **THEN** literacy, generic ethnicity/race, generic gender/sex, and age group are not exposed as displayed indicator values
