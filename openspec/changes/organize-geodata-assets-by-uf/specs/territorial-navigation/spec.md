## ADDED Requirements

### Requirement: Resolucao de assets territoriais em subpastas por UF
The system SHALL resolve territorial static assets from manifest paths even when those assets are organized under UF subdirectories.

#### Scenario: Resolver municipios em subpasta da UF
- **WHEN** the manifest references a municipality asset for a selected UF
- **THEN** the asset path may include a UF subdirectory below `geodata/municipalities/`
- **AND** the frontend loads the referenced asset without assuming municipalities are direct children of `geodata/municipalities/`

#### Scenario: Resolver setores em subpasta da UF
- **WHEN** the manifest references a sector asset for a selected municipality
- **THEN** the asset path may include a UF subdirectory below `geodata/sectors/`
- **AND** the frontend loads the referenced asset without assuming sectors are direct children of `geodata/sectors/`
