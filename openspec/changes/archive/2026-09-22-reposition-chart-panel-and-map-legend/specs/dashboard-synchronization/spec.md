## MODIFIED Requirements

### Requirement: Graficos sincronizados
The system SHALL display chart content derived from the records currently represented on the map.

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

#### Scenario: Tabela no painel inferior
- **WHEN** the dashboard displays the synchronized table and chart
- **THEN** both are presented in the "Grafico e tabela" area below the map rather than inside the side controls

### Requirement: Estado sincronizado com assets estaticos
The system SHALL synchronize map, selectors, charts, table, legend, and selected feature from the same static records loaded for the current territorial context.

#### Scenario: Dados carregados de arquivo particionado
- **WHEN** the application finishes loading a UF- or municipality-partitioned asset
- **THEN** the map, charts, table, legend, current layer, and selected feature state represent only records from that loaded asset and any active territorial filter

#### Scenario: Troca de contexto durante carregamento
- **WHEN** the user changes UF, microregion, municipality, layer, or indicator while a previous static asset is still loading
- **THEN** the interface resolves to the latest selected context and does not display stale records from the previous context

#### Scenario: Grafico usa registros carregados atuais
- **WHEN** static records for the current territorial context are loaded or filtered
- **THEN** the chart uses the same complete displayed record set as the map and table, including all visible UFs, municipalities, microregions, or census sectors for that context
