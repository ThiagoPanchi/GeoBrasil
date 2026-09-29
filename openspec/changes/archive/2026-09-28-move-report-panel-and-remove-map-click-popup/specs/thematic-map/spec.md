## ADDED Requirements

### Requirement: Painel lateral de relatorio no mapa
The map SHALL present indicator reports as a fixed map-side panel that remains within the visible map interface instead of using a coordinate-anchored map popup, while contact and source information SHALL be presented in the sidebar footer instead of as a map overlay.

#### Scenario: Posicionar painel de relatorio
- **WHEN** an indicator report is open from map information mode
- **THEN** the report appears on the left side of the map
- **AND** the report remains within the visible map area on desktop layouts
- **AND** the report width is constrained so the entire report fits inside the visible window without horizontal overflow

#### Scenario: Evitar conflito com overlays do mapa
- **WHEN** the report panel is visible
- **THEN** it does not cover the top-right map tools
- **AND** it does not cover the bottom-right map legend
- **AND** it does not depend on the contact and source information occupying map space

#### Scenario: Conter conteudo longo do relatorio
- **WHEN** report content exceeds the available panel height
- **THEN** the report panel keeps its heading visible within the panel area
- **AND** the report content can be inspected by scrolling inside the panel without moving the map viewport

#### Scenario: Comportamento responsivo do painel
- **WHEN** the map is displayed on a narrow screen
- **THEN** the report panel remains readable and accessible without extending outside the viewport
- **AND** the report content can be read without horizontal scrolling of the page or map area

#### Scenario: Posicionar contatos e fontes na sidebar
- **WHEN** the dashboard is displayed
- **THEN** the contact and source information appears at the bottom of the sidebar
- **AND** the contact and source information remains fixed to the sidebar footer area while the map is used
- **AND** the contact and source information is not rendered as a map overlay
