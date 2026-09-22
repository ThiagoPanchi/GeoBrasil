# thematic-map Specification

## Purpose

Define o comportamento do mapa tematico do GeoBrasil para transformar indicadores censitarios filtrados em simbologia, legenda e selecao visual.

## Requirements

### Requirement: Simbologia por indicador
The system SHALL update map geometry styling automatically when the selected indicator or color scale changes.

#### Scenario: Aplicar indicador ao mapa
- **WHEN** the user selects an indicator for the current territorial layer
- **THEN** each displayed geometry receives a color corresponding to the quantile class of its indicator value

#### Scenario: Trocar indicador mantendo camada
- **WHEN** the user changes the selected indicator while the same territorial layer remains displayed
- **THEN** the system recalculates feature colors for the displayed records
- **AND** the rows, charts, and selected feature values continue to use data for the displayed records

#### Scenario: Alterar escala de cores
- **WHEN** the user selects a different color scale
- **THEN** each displayed geometry keeps its current quantile class assignment
- **AND** receives the color from the newly selected scale for that class

### Requirement: Classificacao de valores exibidos
The system SHALL classify indicator values using quantiles calculated only from the records currently displayed on the map.

#### Scenario: Reclassificar ao mudar contexto
- **WHEN** the user changes indicator, territorial level, UF, microregion, or municipality
- **THEN** the system recalculates quantile classes for the new displayed dataset

#### Scenario: Ignorar registros fora do contexto
- **WHEN** the map is displaying municipalities for a UF, municipalities for a microregion, or sectors for a municipality
- **THEN** the choropleth classes are calculated without using records outside that displayed set

#### Scenario: Distribuir registros por quantis
- **WHEN** the displayed dataset has enough distinct indicator values for the configured class count
- **THEN** the choropleth class breaks divide the displayed records into quantile groups with approximately balanced record counts per class

#### Scenario: Tratar poucos valores distintos
- **WHEN** repeated indicator values or small displayed datasets prevent the configured class count from producing distinct quantile ranges
- **THEN** the choropleth uses only the distinct ranges that can be represented without duplicate or invalid legend intervals
- **AND** all displayed records still receive a class color when their indicator value is finite

### Requirement: Legenda dinamica
The system SHALL display a legend that matches the current indicator, quantile classes, selected color scale, and territorial context as an overlay on the map, with a clear title, indicator name, and value ranges.

#### Scenario: Atualizar legenda
- **WHEN** the map styling is recalculated
- **THEN** the legend displays the title "Legenda"
- **AND** the legend displays the selected indicator name below the title
- **AND** the legend displays the current quantile class ranges or categories below the indicator name
- **AND** the legend appears over the map in the bottom-right corner

#### Scenario: Limpar legenda sem dados
- **WHEN** the current layer has no class breaks or no indicator values
- **THEN** the map legend communicates that there is no choropleth classification for the current view

#### Scenario: Manter legenda dentro do mapa
- **WHEN** the user changes territory, layer, or indicator
- **THEN** the legend remains anchored to the map bottom-right overlay area
- **AND** the legend does not occupy the side controls or the lower chart/table panel

#### Scenario: Editar escala de cores no mapa
- **WHEN** the user opens the color scale edit control in the map top-right overlay area
- **THEN** the edit control is represented by a compact circular button
- **AND** the collapsed control occupies only the button footprint instead of a card-sized panel
- **AND** the user can choose between blue, red, green, and semaforica color scales from a single selector interface
- **AND** each selector option shows a visual preview of that color scale
- **AND** selector options are displayed one per row
- **AND** the expanded control area fits the palette options
- **AND** the legend updates to show the selected scale colors for the current quantile ranges

#### Scenario: Recolher seletor de escala de cores
- **WHEN** the color scale selector is not open
- **THEN** only the circular color scale button is visible in the map overlay
- **AND** the palette option area is hidden from view and does not cover map content

### Requirement: Destaque de geometria selecionada
The system SHALL visually distinguish the selected geometry from non-selected geometries.

#### Scenario: Selecionar geometria por clique
- **WHEN** the user clicks a displayed geometry
- **THEN** the clicked geometry is highlighted
- **AND** its basic information is exposed to the dashboard state

#### Scenario: Remover destaque anterior
- **WHEN** the user selects another geometry or the displayed layer changes
- **THEN** the previous geometry is no longer shown as the selected geometry

### Requirement: Mapa responde a carregamento territorial
The system SHALL adjust the map viewport to the selected territorial extent when drilling down or changing territory.

#### Scenario: Zoom para territorio selecionado
- **WHEN** the user selects a UF, microregion, or municipality for drill-down
- **THEN** the map zooms or fits to the selected territory extent

#### Scenario: Voltar de camada inferior
- **WHEN** the user returns from sectors to municipalities or from municipalities to microregions or UFs
- **THEN** the map viewport fits the records displayed after the transition

### Requirement: Simbologia calculada no cliente
The system SHALL calculate choropleth styling in the browser from the records currently loaded from static assets.

#### Scenario: Aplicar indicador em asset estatico
- **WHEN** the user selects an indicator for a territorial layer loaded from static assets
- **THEN** each displayed geometry receives a color corresponding to the class of its indicator value using client-side calculation

#### Scenario: Trocar indicador sem backend
- **WHEN** the user changes the selected indicator while static territorial records remain loaded
- **THEN** the system recalculates feature colors without requesting backend-computed styles

### Requirement: Metadados de extensao calculados no cliente
The system SHALL determine the map viewport bounds from the currently loaded static records when server-provided metadata is unavailable.

#### Scenario: Ajustar mapa com asset estatico
- **WHEN** a UF, microregion, municipality, or census sector layer is loaded from a static asset
- **THEN** the map fits to the extent of the displayed records
