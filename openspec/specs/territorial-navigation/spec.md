# territorial-navigation Specification

## Purpose

Define a navegacao geografica hierarquica do GeoBrasil para que usuarios explorem o territorio sem carregar geometrias fora do contexto permitido.

## Requirements

### Requirement: Visualizacao inicial por UF
The system SHALL open the main map showing all Brazilian UFs and no lower-level territorial geometry by default.

#### Scenario: Abrir aplicacao
- **WHEN** the user opens GeoBrasil
- **THEN** the map displays the UF layer for Brazil
- **AND** no municipality, microregion, or census sector layer is loaded

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

### Requirement: Carregamento filtrado de microrregioes
The system SHALL load microregions from static UF-partitioned assets only after a UF is selected.

#### Scenario: Consultar microrregioes da UF
- **WHEN** the user selects a UF and requests microregions
- **THEN** the system loads and displays only microregions belonging to the selected UF from that UF's static asset

#### Scenario: Impedir consulta nacional de microrregioes
- **WHEN** a frontend action attempts to load all microregions without a UF selection
- **THEN** the system rejects the operation before requesting a national microregion asset for normal navigation

### Requirement: Carregamento filtrado de municipios
The system SHALL load municipalities only from static assets for a selected UF or selected microregion.

#### Scenario: Consultar municipios da UF
- **WHEN** the user selects a UF and requests municipalities
- **THEN** the system loads and displays only municipalities belonging to that UF from that UF's static municipality asset

#### Scenario: Consultar municipios da microrregiao
- **WHEN** the user selects a UF and a microregion and requests municipalities
- **THEN** the system displays only municipalities belonging to that microregion within the selected UF

#### Scenario: Impedir consulta nacional de municipios
- **WHEN** a frontend action attempts to load all Brazilian municipalities for normal navigation
- **THEN** the system rejects the operation before requesting a national municipality asset

#### Scenario: Trocar microrregiao selecionada
- **WHEN** the user changes the selected microregion within a UF
- **THEN** the selected municipality and census sector are cleared
- **AND** the map, table, and charts represent only municipalities in the newly selected microregion

### Requirement: Carregamento filtrado de setores censitarios
The system SHALL load census sectors only from municipality-partitioned static assets after a municipality is selected.

#### Scenario: Consultar setores do municipio
- **WHEN** the user selects a municipality and requests census sectors
- **THEN** the system loads and displays only census sectors belonging to the selected municipality from that municipality's static sector asset

#### Scenario: Impedir consulta ampla de setores
- **WHEN** a frontend action attempts to load census sectors for Brazil, a UF, or a microregion
- **THEN** the system rejects the operation before requesting broader census sector assets

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

### Requirement: Retorno ao nivel anterior
The system SHALL allow the user to return from a lower territorial level to the previous valid level.

#### Scenario: Voltar de setores para municipios
- **WHEN** the user is viewing census sectors for a municipality and chooses to go back
- **THEN** the system returns to the municipality layer for the current UF or microregion
- **AND** clears the selected census sector
