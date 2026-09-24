## ADDED Requirements

### Requirement: Informacoes publicas de contato e fontes
The static WebGIS SHALL display creator contact information and data-source attribution in the application UI.

#### Scenario: Mostrar autoria e contato
- **WHEN** the application loads
- **THEN** a lower-left information area identifies the application creator as Thiago Panchiniak
- **AND** it includes a link to `https://www.linkedin.com/in/thiago-panchiniak-65b63055/`
- **AND** it includes the email address `panchiniak@gmail.com`

#### Scenario: Mostrar fontes dos dados
- **WHEN** the application loads
- **THEN** the lower-left information area identifies the data source as IBGE Censo 2022
- **AND** the information remains visible without blocking the main map controls or legend

#### Scenario: Responsividade das informacoes
- **WHEN** the application is viewed on a small screen
- **THEN** the contact/source information remains reachable and readable
- **AND** it does not prevent map interaction, layer selection, or dashboard viewing
