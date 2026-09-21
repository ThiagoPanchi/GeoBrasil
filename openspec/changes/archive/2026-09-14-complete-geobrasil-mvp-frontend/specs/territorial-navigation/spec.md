## MODIFIED Requirements

### Requirement: Selecao hierarquica de territorio
The system SHALL maintain hierarchical territorial selections for UF, microregion, municipality, and census sector.

#### Scenario: Alterar selecao superior
- **WHEN** the user changes the selected UF
- **THEN** the selected microregion, municipality, and census sector are cleared
- **AND** the current lower-level map data is cleared before loading data for the new UF

#### Scenario: Selecionar UF pelo mapa
- **WHEN** the current layer is UFs and the user double-clicks a UF geometry
- **THEN** the system selects that UF
- **AND** clears any lower-level selection
- **AND** loads municipalities only for the selected UF

### Requirement: Carregamento filtrado de municipios
The system SHALL load municipalities only within a selected UF or selected microregion.

#### Scenario: Consultar municipios da UF
- **WHEN** the user selects a UF and requests municipalities
- **THEN** the system requests and displays only municipalities belonging to that UF

#### Scenario: Consultar municipios da microrregiao
- **WHEN** the user selects a UF and a microregion and requests municipalities
- **THEN** the system requests and displays only municipalities belonging to that microregion within the selected UF

#### Scenario: Impedir consulta nacional de municipios
- **WHEN** a frontend action or direct API request attempts to load all Brazilian municipalities for normal navigation
- **THEN** the system rejects the operation

#### Scenario: Trocar microrregiao selecionada
- **WHEN** the user changes the selected microregion within a UF
- **THEN** the selected municipality and census sector are cleared
- **AND** the map, table, and charts represent only municipalities in the newly selected microregion

### Requirement: Drill-down pelo mapa
The system SHALL support double-click drill-down from UF to municipalities, from microregion to municipalities, and from municipality to census sectors.

#### Scenario: Duplo clique em UF
- **WHEN** the current layer is UFs and the user double-clicks a UF
- **THEN** the system selects the UF, fits the map to its extent, and loads its municipalities

#### Scenario: Duplo clique em microrregiao
- **WHEN** the current layer is microregions and the user double-clicks a microregion
- **THEN** the system selects the microregion, zooms to its extent, and loads its municipalities

#### Scenario: Duplo clique em municipio
- **WHEN** the current layer is municipalities and the user double-clicks a municipality
- **THEN** the system selects the municipality, zooms to its extent, and loads its census sectors
