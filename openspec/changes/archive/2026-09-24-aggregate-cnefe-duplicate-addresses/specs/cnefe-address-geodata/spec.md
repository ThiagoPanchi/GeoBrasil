## ADDED Requirements

### Requirement: Agregacao de registros CNEFE identicos
The system SHALL provide a maintainer-run aggregation script that creates derived CNEFE point assets where identical CNEFE records are collapsed and counted.

#### Scenario: Agrupar registros identicos
- **WHEN** the aggregation script processes CNEFE FlatGeoBuf input features
- **THEN** features are grouped only when their point geometry and all existing properties are identical
- **AND** the aggregated output contains one feature for each identical group
- **AND** the aggregated feature includes `QUANTIDADE` with the number of original features in that group

#### Scenario: Preservar registros diferentes
- **WHEN** two CNEFE features differ in any geometry coordinate or property value
- **THEN** the aggregation script keeps them in separate output groups
- **AND** each separate output group has its own `QUANTIDADE`

#### Scenario: Escrever saida agregada separada
- **WHEN** the aggregation script writes output assets
- **THEN** aggregated FlatGeoBuf files are written under a separate CNEFE aggregation output directory
- **AND** existing unaggregated CNEFE FlatGeoBuf files are not overwritten

#### Scenario: Validar com um arquivo de entrada
- **WHEN** a maintainer runs the aggregation script with one explicit CNEFE FlatGeoBuf input file
- **THEN** the script completes without requiring all CNEFE files
- **AND** it writes an aggregated output for that input
- **AND** maintainers can inspect the output to verify `QUANTIDADE` values are present

#### Scenario: Agregar pasta CNEFE arquivo por arquivo
- **WHEN** a maintainer runs the aggregation script with a CNEFE directory input
- **THEN** the script discovers FlatGeoBuf `.fgb` files directly inside that directory
- **AND** it processes the discovered files one at a time instead of loading all files together
- **AND** it writes one aggregated output file for each discovered input file
- **AND** the script reports which file is being processed if an error occurs
