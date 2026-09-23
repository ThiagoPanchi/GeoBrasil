## MODIFIED Requirements

### Requirement: Usabilidade do contexto atual
The system SHALL make the selected territory, current territorial level, active indicator, color meaning, available back navigation, and map information affordances clear to the user.

#### Scenario: Inspecionar contexto atual
- **WHEN** the user views the dashboard after any selection change
- **THEN** the interface communicates the current territory, layer, selected indicator, legend meaning, and how to return to the previous level when applicable

#### Scenario: Inspecionar geometria selecionada
- **WHEN** the user selects a UF, microregion, municipality, or census sector on the map
- **THEN** the dashboard communicates the selected record name, code, and selected indicator value without conflicting with the current layer context

#### Scenario: Relatorio completo por clique no mapa
- **WHEN** map information mode is active and the user clicks a displayed UF, microregion, municipality, or census sector geometry
- **THEN** the map opens a popup report for that clicked record
- **AND** the report includes the record name and territorial context
- **AND** the report lists all available indicators for that record using the indicator catalog labels and units
- **AND** the current selected indicator remains identifiable in the report

#### Scenario: Relatorio de setor censitario com atributos da fonte
- **WHEN** map information mode is active and the user clicks a displayed census sector geometry
- **THEN** the popup report includes the sector attributes `SITUACAO`, `AREA_KM2`, `NM_DIST`, and `NM_BAIRRO` when present in `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`
- **AND** those attributes are presented as report-only context rather than selectable indicators

#### Scenario: Clique fora de geometria em modo de informacoes
- **WHEN** map information mode is active and the user clicks an area without a displayed geometry
- **THEN** no indicator report is shown for a non-existent record
- **AND** the existing displayed map record set remains unchanged
