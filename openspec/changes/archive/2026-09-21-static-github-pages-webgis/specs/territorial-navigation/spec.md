## MODIFIED Requirements

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
