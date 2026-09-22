## MODIFIED Requirements

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
The system SHALL display a legend that matches the current indicator, quantile classes, selected color scale, and territorial context as an overlay on the map.

#### Scenario: Atualizar legenda
- **WHEN** the map styling is recalculated
- **THEN** the legend displays the selected indicator and the current quantile class ranges or categories
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
- **THEN** the user can choose between blue, red, green, and semaforica color scales
- **AND** the legend updates to show the selected scale colors for the current quantile ranges
