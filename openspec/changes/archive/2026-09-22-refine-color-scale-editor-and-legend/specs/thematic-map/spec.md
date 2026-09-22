## MODIFIED Requirements

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
- **THEN** the edit control is represented by a compact pencil edit icon or emoji button
- **AND** the user can choose between blue, red, green, and semaforica color scales from a single selector interface
- **AND** each selector option shows a visual preview of that color scale
- **AND** selector options are displayed one per row
- **AND** the legend updates to show the selected scale colors for the current quantile ranges
