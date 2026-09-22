## MODIFIED Requirements

### Requirement: Legenda dinamica
The system SHALL display a legend that matches the current indicator, classes, colors, and territorial context as an overlay on the map.

#### Scenario: Atualizar legenda
- **WHEN** the map styling is recalculated
- **THEN** the legend displays the selected indicator and the current class ranges or categories
- **AND** the legend appears over the map in the bottom-right corner

#### Scenario: Limpar legenda sem dados
- **WHEN** the current layer has no class breaks or no indicator values
- **THEN** the map legend communicates that there is no choropleth classification for the current view

#### Scenario: Manter legenda dentro do mapa
- **WHEN** the user changes territory, layer, or indicator
- **THEN** the legend remains anchored to the map bottom-right overlay area
- **AND** the legend does not occupy the side controls or the lower chart/table panel
