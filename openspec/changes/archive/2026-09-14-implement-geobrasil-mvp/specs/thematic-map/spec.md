## Purpose

Define o comportamento do mapa tematico do GeoBrasil para transformar indicadores censitarios filtrados em simbologia, legenda e selecao visual.

## ADDED Requirements

### Requirement: Simbologia por indicador
The system SHALL update map geometry styling automatically when the selected indicator changes.

#### Scenario: Aplicar indicador ao mapa
- **WHEN** the user selects an indicator for the current territorial layer
- **THEN** each displayed geometry receives a color corresponding to the class of its indicator value

### Requirement: Classificacao de valores exibidos
The system SHALL classify indicator values using only the records currently displayed on the map.

#### Scenario: Reclassificar ao mudar contexto
- **WHEN** the user changes indicator, territorial level, UF, microregion, or municipality
- **THEN** the system recalculates classes for the new displayed dataset

### Requirement: Legenda dinamica
The system SHALL display a legend that matches the current indicator, classes, colors, and territorial context.

#### Scenario: Atualizar legenda
- **WHEN** the map styling is recalculated
- **THEN** the legend displays the selected indicator and the current class ranges or categories

### Requirement: Destaque de geometria selecionada
The system SHALL visually distinguish the selected geometry from non-selected geometries.

#### Scenario: Selecionar geometria por clique
- **WHEN** the user clicks a displayed geometry
- **THEN** the clicked geometry is highlighted
- **AND** its basic information is exposed to the dashboard state

### Requirement: Mapa responde a carregamento territorial
The system SHALL adjust the map viewport to the selected territorial extent when drilling down or changing territory.

#### Scenario: Zoom para territorio selecionado
- **WHEN** the user selects a UF, microregion, or municipality for drill-down
- **THEN** the map zooms or fits to the selected territory extent
