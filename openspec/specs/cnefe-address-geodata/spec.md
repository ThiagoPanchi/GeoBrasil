# cnefe-address-geodata Specification

## Purpose

Define how raw CNEFE address CSV data packaged in UF ZIP files is transformed into static FlatGeoBuf point assets partitioned by municipality for use by the GeoBrasil static geodata workflow.

## Requirements

### Requirement: Conversao de CNEFE zipado para pontos FlatGeoBuf
The system SHALL provide a maintainer-run preparation script that converts CNEFE CSV files inside ZIP archives from `data/CNEFE/` into FlatGeoBuf point assets under `public/geodata/cnefe/`.

#### Scenario: Ler arquivos de entrada CNEFE
- **WHEN** a maintainer runs the CNEFE preparation script with the default input directory
- **THEN** the script reads CNEFE ZIP files from `data/CNEFE/`
- **AND** it extracts CSV records from each ZIP without requiring a backend service or database

#### Scenario: Processar UFs grandes sem exceder limite de string
- **WHEN** a maintainer runs the CNEFE preparation script against a large UF ZIP such as PA
- **THEN** the script processes CSV content without decoding an entire CSV file into one JavaScript string
- **AND** it does not fail with Node's `Cannot create a string longer than 0x1fffffe8 characters` error
- **AND** it continues producing municipality-partitioned FlatGeoBuf outputs for valid rows

#### Scenario: Processar diretorio completo sem acumular UFs concluidas
- **WHEN** a maintainer runs the CNEFE preparation script with the default input directory containing multiple UF ZIP files
- **THEN** the script processes one UF ZIP as a bounded unit of work
- **AND** it writes municipality FlatGeoBuf outputs for that UF before starting the next UF ZIP
- **AND** it does not keep feature arrays from completed UFs in memory while processing later UFs

#### Scenario: Processar UF grande com memoria limitada
- **WHEN** a maintainer runs the CNEFE preparation script against a UF whose active CSV or municipality output is too large for a single in-memory feature collection
- **THEN** the script processes records in bounded batches
- **AND** it flushes generated output before the active batch can grow without limit
- **AND** it does not require all rows for the active UF or municipality to be retained in memory at once

#### Scenario: Gerar partes deterministicas para municipio grande
- **WHEN** a municipality has more valid CNEFE point features than the configured in-memory output batch can hold
- **THEN** the script writes multiple deterministic FlatGeoBuf part files for that municipality
- **AND** each part file contains only records for that municipality code
- **AND** the file naming or manifest allows maintainers and future consumers to discover all parts for the municipality

#### Scenario: Preservar saidas em execucao parcial
- **WHEN** a maintainer runs the CNEFE preparation script with an explicit single ZIP path
- **THEN** the script writes or replaces the municipality outputs generated from that ZIP
- **AND** it does not delete unrelated CNEFE outputs generated from other UF ZIP files

#### Scenario: Criar geometria de ponto
- **WHEN** a CNEFE CSV row has valid `LATITUDE` and `LONGITUDE` values
- **THEN** the output feature geometry is a GeoJSON Point using longitude as X and latitude as Y
- **AND** rows without valid coordinates are skipped or reported without creating invalid point features

#### Scenario: Particionar saida por municipio
- **WHEN** CNEFE records are converted
- **THEN** output FlatGeoBuf files are grouped by `COD_MUNICIPIO`
- **AND** each municipality output is written below `public/geodata/cnefe/`
- **AND** each output file contains only records for its municipality code

### Requirement: Propriedades CNEFE transformadas
The system SHALL keep only the required CNEFE output properties and SHALL transform coded fields into human-readable labels.

#### Scenario: Manter identificadores e campos textuais requeridos
- **WHEN** a CNEFE row is converted to an output feature
- **THEN** the feature properties include `COD_MUNICIPIO`, `COD_SETOR`, `ENDERECO_COMPLETO`, and `DSC_ESTABELECIMENTO`
- **AND** `COD_SETOR` remains available for joining with census sector data

#### Scenario: Construir endereco completo
- **WHEN** a CNEFE row is converted to an output feature
- **THEN** `ENDERECO_COMPLETO` is built by concatenating `CEP`, `DSC_LOCALIDADE`, `NOM_TIPO_SEGLOGR`, `NOM_TITULO_SEGLOGR`, `NOM_SEGLOGR`, and `NUM_ENDERECO`
- **AND** empty address parts do not create malformed repeated separators
- **AND** the source address columns used to create `ENDERECO_COMPLETO` are not present as separate output properties

#### Scenario: Decodificar especie do endereco
- **WHEN** `COD_ESPECIE` is present in a CNEFE row
- **THEN** the output feature includes `ESPECIE_ENDERECO` using these mappings: `1` = `Domicilio particular`, `2` = `Domicilio coletivo`, `3` = `Estabelecimento agropecuario`, `4` = `Estabelecimento de ensino`, `5` = `Estabelecimento de saude`, `6` = `Estabelecimento de outras finalidades`, `7` = `Edificacao em construcao ou reforma`, `8` = `Estabelecimento religioso`

#### Scenario: Decodificar indicador de estabelecimento
- **WHEN** `COD_INDICADOR_ESTAB_ENDERECO` is present in a CNEFE row
- **THEN** the output feature includes `INDICADOR_ESTABELECIMENTO` using these mappings: `1` = `Unico`, `2` = `Multiplo, com ate 10 estabelecimentos no endereco`, `3` = `Multiplo, com mais de 10 estabelecimentos no endereco`, `4` = `Multiplo, com quantidade de estabelecimentos desconhecida no endereco`

#### Scenario: Decodificar indicador de construcao ou reforma
- **WHEN** `COD_INDICADOR_CONST_ENDERECO` is present in a CNEFE row
- **THEN** the output feature includes `INDICADOR_CONSTRUCAO_REFORMA` using these mappings: `1` = `Unico`, `2` = `Multiplo, com ate 10 unidades no endereco`, `3` = `Multiplo, com mais de 10 unidades no endereco`, `4` = `Multiplo, com quantidade de unidades desconhecida no endereco`

#### Scenario: Decodificar finalidade de construcao
- **WHEN** `COD_INDICADOR_FINALIDADE_CONST` is present in a CNEFE row
- **THEN** the output feature includes `INDICADOR_FINALIDADE_CONSTRUCAO` using these mappings: `1` = `Residencial`, `2` = `Nao residencial`, `3` = `Misto`, `4` = `Indeterminado`

#### Scenario: Decodificar tipo de edificacao dos domicilios
- **WHEN** `COD_TIPO_ESPECIE` is present in a CNEFE row
- **THEN** the output feature includes `TIPO_EDIFICACAO_DOMICILIOS` using these mappings: `101` = `Casa`, `102` = `Casa de vila ou em condominio`, `103` = `Apartamento`, `104` = `Outros`

#### Scenario: Excluir colunas nao mencionadas
- **WHEN** a CNEFE row is converted to an output feature
- **THEN** source columns not named or transformed by this requirement are excluded from the output properties

### Requirement: Verificacao de conversao CNEFE
The system SHALL make the CNEFE conversion script verifiable with the smallest available requested sample input.

#### Scenario: Testar com arquivo de Roraima
- **WHEN** `data/CNEFE/14_RR.zip` exists and the maintainer runs the CNEFE preparation script against that input
- **THEN** the script completes without requiring other UF ZIP files
- **AND** it writes one or more municipality-partitioned FlatGeoBuf files under `public/geodata/cnefe/`

#### Scenario: Informar como executar o script
- **WHEN** implementation is complete
- **THEN** maintainer-facing instructions identify the command to run the CNEFE preparation script
- **AND** the instructions identify `data/CNEFE/14_RR.zip` as the lightweight validation input when present

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

### Requirement: Consumo frontend de CNEFE agregado
The frontend SHALL load aggregated CNEFE FlatGeoBuf assets for the selected municipality and filter them to the selected census sector using CNEFE properties.

#### Scenario: Carregar CNEFE agregado do municipio selecionado
- **WHEN** the user requests CNEFE points for a selected census sector
- **THEN** the frontend resolves the aggregated CNEFE asset files for the selected municipality
- **AND** it reads the files from static assets without requiring a backend service or database

#### Scenario: Filtrar CNEFE por setor
- **WHEN** aggregated CNEFE records are loaded for a municipality
- **THEN** only records whose first 15 digits of `COD_SETOR` match the selected census sector code are displayed
- **AND** records from other sectors in the same municipality are not displayed

#### Scenario: Usar propriedades agregadas para simbologia
- **WHEN** a CNEFE point is displayed
- **THEN** `ESPECIE_ENDERECO` determines its icon category
- **AND** `QUANTIDADE` determines its icon size class
- **AND** missing or invalid `QUANTIDADE` values are treated as `1` for display sizing

#### Scenario: Asset CNEFE ausente
- **WHEN** the selected municipality has no available aggregated CNEFE static asset
- **THEN** the interface displays a clear status message instead of failing silently
- **AND** the territorial choropleth layer remains usable
