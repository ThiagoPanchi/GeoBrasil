## MODIFIED Requirements

### Requirement: Usabilidade do contexto atual
The system SHALL make the selected territory, current territorial level, active indicator, color meaning, available back navigation, and map information affordances clear to the user.

#### Scenario: Inspecionar contexto atual
- **WHEN** the user views the dashboard after any selection change
- **THEN** the interface communicates the current territory, layer, selected indicator, legend meaning, and how to return to the previous level when applicable

#### Scenario: Inspecionar geometria selecionada
- **WHEN** the user selects a UF, microregion, municipality, or census sector on the map
- **THEN** the dashboard communicates the selected record name, code, and selected indicator value without conflicting with the current layer context
- **AND** normal map selection does not open a coordinate-anchored popup over the map

#### Scenario: Relatorio completo por clique no mapa
- **WHEN** map information mode is active and the user clicks a displayed UF, microregion, municipality, or census sector geometry
- **THEN** the map-side report panel opens for that clicked record
- **AND** the report panel includes the record name and territorial context
- **AND** the report panel lists all available non-demographic indicators for that record using the indicator catalog labels and units
- **AND** the report panel does not list sex or color/race indicators as individual row items when those values are represented in demographic charts
- **AND** the current selected indicator remains identifiable in the report panel when it is shown as a row or represented in a demographic chart
- **AND** the report content remains contained within the visible panel area, using internal scrolling or responsive layout as needed
- **AND** the report content uses the panel's available horizontal space rather than leaving unused width that compresses the report body
- **AND** the report panel does not require horizontal page or map scrolling to see the complete report width
- **AND** no coordinate-anchored Leaflet popup is opened for the report

#### Scenario: Relatorio de setor censitario com contexto na identificacao
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the report panel presents sector location/context fields next to the sector identification area rather than as generic attribute rows
- **AND** the sector context area includes `Situacao`, `Distrito`, and `Bairro` when present
- **AND** those three fields are arranged as three columns when width allows and remain readable when responsive wrapping is needed

#### Scenario: Relatorio de setor censitario com atributos principais em duas colunas
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the report panel presents a core sector metrics area separate from the general indicator rows
- **AND** the first column contains population, area, and demographic density values
- **AND** the second column contains income, households, and responsible-person count values
- **AND** the core metrics use the same labels, units, and formatting semantics as the indicator catalog or sector report attributes

#### Scenario: Relatorio com graficos demograficos
- **WHEN** map information mode is active and the clicked record has sex or color/race indicator values
- **THEN** the lower area of the report panel presents a pie chart for color/race using white, black, yellow, brown, and indigenous values when available
- **AND** the lower area presents a pie chart for sex using men and women values when available
- **AND** the two charts appear side by side when panel width allows and stack responsively when width is constrained
- **AND** each chart communicates category labels and values sufficiently for users to understand the distribution
- **AND** chart legends remain readable without horizontally squashing labels or values when the panel has sufficient width

#### Scenario: Relatorio com graficos demograficos zerados
- **WHEN** map information mode is active and the clicked census sector has sex or color/race indicator values whose group total is zero
- **THEN** the report panel presents the corresponding demographic chart card as a zero-data chart state instead of omitting it
- **AND** the sex or color/race indicators represented by that zero-data chart are not listed as individual generic indicator rows
- **AND** the zero-data chart communicates that the group total is zero while preserving the category labels and zero values
- **AND** demographic chart groups with positive totals continue to render as proportional pie charts

#### Scenario: Relatorio de setor censitario com atributos da fonte
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the report panel includes the sector attributes `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO` when present in `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`
- **AND** those attributes are presented as report-only context rather than selectable indicators

#### Scenario: Clique fora de geometria em modo de informacoes
- **WHEN** map information mode is active and the user clicks an area without a displayed geometry
- **THEN** no indicator report is shown for a non-existent record
- **AND** the existing displayed map record set remains unchanged

#### Scenario: Ocultar relatorio ao sair do modo de informacoes
- **WHEN** the user deactivates map information mode
- **THEN** the map-side report panel is hidden or cleared
- **AND** subsequent map geometry clicks return to normal selection behavior without reopening the report panel

#### Scenario: Limpar relatorio ao trocar contexto territorial
- **WHEN** the displayed territorial context changes because the user changes UF, microregion, municipality, territorial layer, or selected indicator dataset
- **THEN** any report panel content tied to the previous displayed records is cleared or hidden
- **AND** the report panel does not show stale information for a record that is no longer displayed
