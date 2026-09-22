## MODIFIED Requirements

### Requirement: Estado compartilhado da aplicacao
The system SHALL maintain shared application state for selected UF, selected microregion, selected municipality, selected census sector, current layer, selected indicator, selected feature, and map information mode.

#### Scenario: Atualizar estado por seletor
- **WHEN** the user changes a selector
- **THEN** the map, charts, table, legend, current layer, and selected feature are updated according to the new state

#### Scenario: Atualizar estado pelo mapa
- **WHEN** the user clicks or double-clicks a map geometry outside information mode
- **THEN** the corresponding territorial selection and dependent dashboard components are updated

#### Scenario: Limpar selecao ao trocar camada
- **WHEN** a layer transition invalidates the previously selected feature
- **THEN** the selected feature display is cleared or replaced with a feature from the newly displayed layer

#### Scenario: Ativar modo de informacoes no mapa
- **WHEN** the user activates the map information button
- **THEN** the interface indicates that map information mode is active
- **AND** the next geometry clicks are interpreted as information requests for the displayed records

#### Scenario: Desativar modo de informacoes no mapa
- **WHEN** the user deactivates the map information button
- **THEN** map geometry clicks return to the normal selection behavior

### Requirement: Usabilidade do contexto atual
The system SHALL make the selected territory, current territorial level, active indicator, color meaning, available back navigation, and map information affordances clear to the user.

#### Scenario: Inspecionar contexto atual
- **WHEN** the user views the dashboard after any selection change
- **THEN** the interface communicates the current territory, layer, selected indicator, legend meaning, and how to return to the previous level when applicable

#### Scenario: Inspecionar geometria selecionada
- **WHEN** the user selects a UF, microregion, municipality, or census sector on the map
- **THEN** the dashboard communicates the selected record name, code, and selected indicator value without conflicting with the current layer context

#### Scenario: Relatorio completo por clique no mapa
- **WHEN** map information mode is active and the user clicks a displayed UF, microregion, municipality, or census sector geometry
- **THEN** the map opens a popup report for that clicked record
- **AND** the report includes the record name and territorial context
- **AND** the report lists all available indicators for that record using the indicator catalog labels and units
- **AND** the current selected indicator remains identifiable in the report

#### Scenario: Clique fora de geometria em modo de informacoes
- **WHEN** map information mode is active and the user clicks an area without a displayed geometry
- **THEN** no indicator report is shown for a non-existent record
- **AND** the existing displayed map record set remains unchanged
