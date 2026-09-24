## ADDED Requirements

### Requirement: Exibicao CNEFE condicionada ao setor selecionado
The system SHALL display CNEFE points only for a census sector selected by the user in the sector layer.

#### Scenario: Clicar setor com CNEFE ativo
- **WHEN** the CNEFE overlay is active and the user clicks a census sector
- **THEN** the map loads CNEFE points for the selected sector only
- **AND** points outside the selected sector are not displayed

#### Scenario: CNEFE sem setor selecionado
- **WHEN** the CNEFE overlay is active but no census sector is selected
- **THEN** no CNEFE points are displayed
- **AND** the interface communicates that a sector must be selected to show CNEFE points

#### Scenario: Limpar CNEFE ao mudar contexto territorial
- **WHEN** the user changes UF, microregion, municipality, or leaves the census sector layer
- **THEN** any displayed CNEFE points are cleared from the map
- **AND** the user must select a sector again before CNEFE points are displayed

#### Scenario: Desativar CNEFE
- **WHEN** the user disables the CNEFE overlay
- **THEN** CNEFE points are removed from the map
- **AND** territorial selection and choropleth styling remain unchanged
