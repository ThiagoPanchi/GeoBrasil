## Purpose

Define a navegacao geografica hierarquica do GeoBrasil para que usuarios explorem o territorio sem carregar geometrias fora do contexto permitido.

## ADDED Requirements

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

### Requirement: Carregamento filtrado de microrregioes
The system SHALL load microregions only after a UF is selected.

#### Scenario: Consultar microrregioes da UF
- **WHEN** the user selects a UF and requests microregions
- **THEN** the system requests and displays only microregions belonging to the selected UF

#### Scenario: Impedir consulta nacional de microrregioes
- **WHEN** a frontend action or direct API request attempts to load all microregions without a UF filter
- **THEN** the system rejects the operation

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

### Requirement: Carregamento filtrado de setores censitarios
The system SHALL load census sectors only after a municipality is selected.

#### Scenario: Consultar setores do municipio
- **WHEN** the user selects a municipality and requests census sectors
- **THEN** the system requests and displays only census sectors belonging to that municipality

#### Scenario: Impedir consulta ampla de setores
- **WHEN** a frontend action or direct API request attempts to load census sectors for Brazil, a UF, or a microregion
- **THEN** the system rejects the operation

### Requirement: Drill-down pelo mapa
The system SHALL support double-click drill-down from microregion to municipalities and from municipality to census sectors.

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
