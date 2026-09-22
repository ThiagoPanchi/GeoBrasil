## MODIFIED Requirements

### Requirement: Graficos sincronizados
The system SHALL display chart content derived from the records currently represented on the map and allow users to control the chart record order.

#### Scenario: Graficos para municipios de UF
- **WHEN** the current layer is municipalities for a selected UF
- **THEN** the chart represents all municipalities currently displayed on the map and the selected indicator context

#### Scenario: Graficos para setores de municipio
- **WHEN** the current layer is census sectors for a selected municipality
- **THEN** the chart represents all census sectors currently displayed on the map and the selected indicator context

#### Scenario: Graficos para municipios de microrregiao
- **WHEN** the current layer is municipalities for a selected microregion
- **THEN** the chart represents all municipalities currently displayed on the map and the selected indicator context

#### Scenario: Grafico com painel fixo e rolagem horizontal
- **WHEN** the displayed map records exceed the width available in the chart panel
- **THEN** the chart remains in a fixed-height panel below the map
- **AND** the user can scroll horizontally to inspect every displayed record without hiding records from the dataset

#### Scenario: Selecionar registro pelo grafico
- **WHEN** the user clicks a chart bar for a displayed record
- **THEN** the corresponding map geometry is selected
- **AND** the map zooms or fits to that geometry extent
- **AND** the selected feature details use the clicked record and selected indicator context

#### Scenario: Ordenar grafico por maiores valores
- **WHEN** the chart/table panel displays records for the selected indicator
- **THEN** records are ordered by the selected indicator value with the largest values first by default
- **AND** the chart and table use the same ordered record sequence

#### Scenario: Inverter ordem por valor
- **WHEN** the user activates the order inversion control while value sorting is active
- **THEN** the chart and table invert between descending and ascending selected indicator value order
- **AND** the displayed map record set remains unchanged

#### Scenario: Ordenar alfabeticamente
- **WHEN** the user activates the alphabetical sort control
- **THEN** the chart and table order records alphabetically by record name
- **AND** chart/table selection and map zoom behavior continue to target the same displayed records
