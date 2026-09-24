## ADDED Requirements

### Requirement: Filtro CNEFE por especie do endereco
The CNEFE overlay SHALL allow users to filter displayed CNEFE points by `ESPECIE_ENDERECO` while preserving the existing sector-scoped overlay behavior.

#### Scenario: Exibir seletor de especie CNEFE
- **WHEN** the CNEFE overlay is active
- **THEN** the map interface displays a filter selector for `ESPECIE_ENDERECO`
- **AND** the selector includes an option to display all species
- **AND** the selector includes the CNEFE species categories used by the overlay legend

#### Scenario: Filtrar pontos por especie
- **WHEN** the user selects one `ESPECIE_ENDERECO` category in the CNEFE filter
- **THEN** only CNEFE points with that species are displayed for the selected sector
- **AND** CNEFE points from other species are hidden without changing the selected sector

#### Scenario: Atualizar legenda e status do filtro
- **WHEN** a CNEFE species filter is active
- **THEN** the CNEFE legend and status feedback communicate the active filter context
- **AND** the choropleth legend remains visible and unchanged

### Requirement: Espalhamento visual de pontos CNEFE sobrepostos
The CNEFE overlay SHALL de-overlap CNEFE points that share the same original coordinate by spreading them around the coordinate and drawing thin connector lines back to the original coordinate.

#### Scenario: Espalhar coordenadas repetidas
- **WHEN** multiple displayed CNEFE points share the same original coordinate
- **THEN** the map renders those markers around the original coordinate instead of directly on top of one another
- **AND** each displaced marker remains individually clickable

#### Scenario: Conectar pontos deslocados a coordenada original
- **WHEN** a CNEFE marker is displaced from its original coordinate
- **THEN** the map draws a thin connector line from the displaced marker to the original coordinate
- **AND** the connector lines are visually subordinate to the markers and do not obscure the territorial layer

#### Scenario: Manter pontos nao sobrepostos na coordenada original
- **WHEN** a displayed CNEFE point does not share its coordinate with another displayed CNEFE point
- **THEN** the marker is rendered at its original coordinate
- **AND** no connector line is drawn for that marker

#### Scenario: Recalcular espalhamento apos filtro
- **WHEN** the active CNEFE species filter changes
- **THEN** overlap detection and marker spreading are recalculated using only the currently displayed CNEFE points
- **AND** hidden points do not reserve spread positions or connector lines
