# dashboard-synchronization Specification

## Purpose

Define a sincronizacao entre mapa, seletores, graficos, tabela e feedback operacional para que todos representem o mesmo estado territorial e analitico.

## Requirements

### Requirement: Estado compartilhado da aplicacao
The system SHALL maintain shared application state for selected UF, selected microregion, selected municipality, selected census sector, current layer, selected indicator, and selected feature.

#### Scenario: Atualizar estado por seletor
- **WHEN** the user changes a selector
- **THEN** the map, charts, table, legend, current layer, and selected feature are updated according to the new state

#### Scenario: Atualizar estado pelo mapa
- **WHEN** the user clicks or double-clicks a map geometry
- **THEN** the corresponding territorial selection and dependent dashboard components are updated

#### Scenario: Limpar selecao ao trocar camada
- **WHEN** a layer transition invalidates the previously selected feature
- **THEN** the selected feature display is cleared or replaced with a feature from the newly displayed layer

### Requirement: Graficos sincronizados
The system SHALL display two charts derived from the records currently represented on the map.

#### Scenario: Graficos para municipios de UF
- **WHEN** the current layer is municipalities for a selected UF
- **THEN** both charts represent only those municipalities and the selected indicator context

#### Scenario: Graficos para setores de municipio
- **WHEN** the current layer is census sectors for a selected municipality
- **THEN** both charts represent only those census sectors and the selected indicator context

#### Scenario: Graficos para municipios de microrregiao
- **WHEN** the current layer is municipalities for a selected microregion
- **THEN** both charts represent only municipalities in that microregion and the selected indicator context

### Requirement: Tabela sincronizada
The system SHALL display a data table containing the records currently represented on the map.

#### Scenario: Tabela acompanha mapa
- **WHEN** the current layer changes from municipalities to census sectors
- **THEN** the table rows change from municipalities to census sectors
- **AND** the visible indicator columns remain consistent with the MVP indicator catalog

#### Scenario: Tabela acompanha microrregiao
- **WHEN** the displayed map records are filtered to a selected microregion
- **THEN** the table rows contain only records represented on the map for that microregion

#### Scenario: Colunas selecionaveis permanecem aplicadas
- **WHEN** the user chooses visible table columns and then changes territory, layer, or indicator
- **THEN** the table preserves the chosen columns where those indicators are available

### Requirement: Feedback de carregamento
The system SHALL provide visible loading feedback during static geographic asset reads and indicator metadata reads.

#### Scenario: Carregar setores censitarios
- **WHEN** the system is loading a municipality-partitioned census sector asset
- **THEN** the interface displays a loading message or indicator until the request finishes

#### Scenario: Carregar camada territorial
- **WHEN** the system is loading UFs, microregions, municipalities, sectors, or indicator-styled records from static assets
- **THEN** the interface displays the current loading context and replaces it with success or failure feedback when the request finishes

### Requirement: Estado sincronizado com assets estaticos
The system SHALL synchronize map, selectors, charts, table, legend, and selected feature from the same static records loaded for the current territorial context.

#### Scenario: Dados carregados de arquivo particionado
- **WHEN** the application finishes loading a UF- or municipality-partitioned asset
- **THEN** the map, charts, table, legend, current layer, and selected feature state represent only records from that loaded asset and any active territorial filter

#### Scenario: Troca de contexto durante carregamento
- **WHEN** the user changes UF, microregion, municipality, layer, or indicator while a previous static asset is still loading
- **THEN** the interface resolves to the latest selected context and does not display stale records from the previous context

### Requirement: Usabilidade do contexto atual
The system SHALL make the selected territory, current territorial level, active indicator, color meaning, and available back navigation clear to the user.

#### Scenario: Inspecionar contexto atual
- **WHEN** the user views the dashboard after any selection change
- **THEN** the interface communicates the current territory, layer, selected indicator, legend meaning, and how to return to the previous level when applicable

#### Scenario: Inspecionar geometria selecionada
- **WHEN** the user selects a UF, microregion, municipality, or census sector on the map
- **THEN** the dashboard communicates the selected record name, code, and selected indicator value without conflicting with the current layer context
