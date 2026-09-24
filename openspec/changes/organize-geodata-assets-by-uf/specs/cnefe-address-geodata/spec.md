## ADDED Requirements

### Requirement: Organizacao de CNEFE agregado por UF
The system SHALL organize aggregated CNEFE FlatGeoBuf outputs under UF subdirectories so generated address assets can be selectively versioned by UF.

#### Scenario: Derivar UF de arquivo CNEFE agregado
- **WHEN** a CNEFE aggregated FlatGeoBuf file name starts with a two-digit IBGE UF code
- **THEN** the aggregation output is written under the corresponding UF acronym subdirectory below `public/geodata/cnefe-aggregated/`
- **AND** code `42` maps to `SC` for Santa Catarina

#### Scenario: Processar somente codigos de UF conhecidos
- **WHEN** a CNEFE aggregated file name does not start with a known two-digit IBGE UF code
- **THEN** the preparation workflow reports a clear error or skips the file with an explicit warning
- **AND** it does not silently place the file in an incorrect UF subdirectory
