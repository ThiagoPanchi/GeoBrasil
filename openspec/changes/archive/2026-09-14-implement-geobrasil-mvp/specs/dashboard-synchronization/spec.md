## Purpose

Define a sincronizacao entre mapa, seletores, graficos, tabela e feedback operacional para que todos representem o mesmo estado territorial e analitico.

## ADDED Requirements

### Requirement: Estado compartilhado da aplicacao
The system SHALL maintain shared application state for selected UF, selected microregion, selected municipality, selected census sector, current layer, selected indicator, and selected feature.

#### Scenario: Atualizar estado por seletor
- **WHEN** the user changes a selector
- **THEN** the map, charts, table, legend, current layer, and selected feature are updated according to the new state

#### Scenario: Atualizar estado pelo mapa
- **WHEN** the user clicks or double-clicks a map geometry
- **THEN** the corresponding territorial selection and dependent dashboard components are updated

### Requirement: Graficos sincronizados
The system SHALL display two charts derived from the records currently represented on the map.

#### Scenario: Graficos para municipios de UF
- **WHEN** the current layer is municipalities for a selected UF
- **THEN** both charts represent only those municipalities and the selected indicator context

#### Scenario: Graficos para setores de municipio
- **WHEN** the current layer is census sectors for a selected municipality
- **THEN** both charts represent only those census sectors and the selected indicator context

### Requirement: Tabela sincronizada
The system SHALL display a data table containing the records currently represented on the map.

#### Scenario: Tabela acompanha mapa
- **WHEN** the current layer changes from municipalities to census sectors
- **THEN** the table rows change from municipalities to census sectors
- **AND** the visible indicator columns remain consistent with the MVP indicator catalog

### Requirement: Feedback de carregamento
The system SHALL provide visible loading feedback during geographic and indicator data requests.

#### Scenario: Carregar setores censitarios
- **WHEN** the system is loading census sectors for a selected municipality
- **THEN** the interface displays a loading message or indicator until the request finishes

### Requirement: Usabilidade do contexto atual
The system SHALL make the selected territory, current territorial level, active indicator, color meaning, and available back navigation clear to the user.

#### Scenario: Inspecionar contexto atual
- **WHEN** the user views the dashboard after any selection change
- **THEN** the interface communicates the current territory, layer, selected indicator, legend meaning, and how to return to the previous level when applicable
