# dashboard-synchronization Specification

## Purpose

Define a sincronizacao entre mapa, seletores, graficos, tabela e feedback operacional para que todos representem o mesmo estado territorial e analitico.

## Requirements

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

#### Scenario: Grafico usa registros carregados atuais
- **WHEN** static records for the current territorial context are loaded or filtered
- **THEN** the chart uses the same complete displayed record set as the map and table, including all visible UFs, municipalities, microregions, or census sectors for that context

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
- **AND** the report lists all available non-demographic indicators for that record using the indicator catalog labels and units
- **AND** the report does not list sex or color/race indicators as individual row items when those values are represented in demographic charts
- **AND** the current selected indicator remains identifiable in the report when it is shown as a row or represented in a demographic chart
- **AND** the report content remains contained within the visible popup area, using internal scrolling or responsive layout as needed
- **AND** the report content uses the popup's available horizontal space rather than leaving unused width that compresses the report body

#### Scenario: Relatorio de setor censitario com contexto na identificacao
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the popup report presents sector location/context fields next to the sector identification area rather than as generic attribute rows
- **AND** the sector context area includes `Situacao`, `Distrito`, and `Bairro` when present
- **AND** those three fields are arranged as three columns when width allows and remain readable when responsive wrapping is needed

#### Scenario: Relatorio de setor censitario com atributos principais em duas colunas
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the popup report presents a core sector metrics area separate from the general indicator rows
- **AND** the first column contains population, area, and demographic density values
- **AND** the second column contains income, households, and responsible-person count values
- **AND** the core metrics use the same labels, units, and formatting semantics as the indicator catalog or sector report attributes

#### Scenario: Relatorio com graficos demograficos
- **WHEN** map information mode is active and the clicked record has sex or color/race indicator values
- **THEN** the lower area of the popup report presents a pie chart for color/race using white, black, yellow, brown, and indigenous values when available
- **AND** the lower area presents a pie chart for sex using men and women values when available
- **AND** the two charts appear side by side when popup width allows and stack responsively when width is constrained
- **AND** each chart communicates category labels and values sufficiently for users to understand the distribution
- **AND** chart legends remain readable without horizontally squashing labels or values when the popup has sufficient width

#### Scenario: Relatorio com graficos demograficos zerados
- **WHEN** map information mode is active and the clicked census sector has sex or color/race indicator values whose group total is zero
- **THEN** the popup report presents the corresponding demographic chart card as a zero-data chart state instead of omitting it
- **AND** the sex or color/race indicators represented by that zero-data chart are not listed as individual generic indicator rows
- **AND** the zero-data chart communicates that the group total is zero while preserving the category labels and zero values
- **AND** demographic chart groups with positive totals continue to render as proportional pie charts

#### Scenario: Relatorio de setor censitario com atributos da fonte
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the popup report includes the sector attributes `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO` when present in `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`
- **AND** those attributes are presented as report-only context rather than selectable indicators

#### Scenario: Clique fora de geometria em modo de informacoes
- **WHEN** map information mode is active and the user clicks an area without a displayed geometry
- **THEN** no indicator report is shown for a non-existent record
- **AND** the existing displayed map record set remains unchanged
