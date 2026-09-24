## ADDED Requirements

### Requirement: Versionamento seletivo de geodata por UF
The repository SHALL support keeping generated geodata assets organized by UF so maintainers can version only selected UF assets while retaining local full-Brazil generation workflows.

#### Scenario: Organizar assets gerados por UF
- **WHEN** generated geodata assets are prepared for municipality, sector, or CNEFE aggregated datasets
- **THEN** assets below `public/geodata/municipalities/`, `public/geodata/sectors/`, and `public/geodata/cnefe-aggregated/` are stored under UF subdirectories
- **AND** the UF subdirectory is derived deterministically from the asset name or metadata

#### Scenario: Versionar apenas Santa Catarina
- **WHEN** generated geodata assets are present for multiple UFs
- **THEN** repository ignore rules keep non-SC generated assets ignored by default
- **AND** generated SC assets under the reorganized UF subdirectories can be added to version control
- **AND** required top-level geodata files and manifests remain addable when needed for the static application

#### Scenario: Manter manifesto nacional por decisao do mantenedor
- **WHEN** non-SC generated assets are ignored by git
- **THEN** the static geodata manifest may still describe national geodata coverage
- **AND** maintainers understand that repository-only deployments may reference non-SC assets that are not committed
