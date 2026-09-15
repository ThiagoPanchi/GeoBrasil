# Banco De Dados

Scripts iniciais para configurar o PostgreSQL com PostGIS.

## Arquivos

- `001_schema.sql`: cria a extensao PostGIS, tabelas, relacionamentos e indices.
- `002_seed_example.sql`: insere dados simplificados de exemplo para testes locais.
- `003_census_sectors.sql`: cria a tabela espacial de setores censitarios relacionada aos municipios.
- `004_import_ibge_from_staging.sql`: transforma as tabelas staging de UFs e municipios no modelo final.
- `005_validate_spatial_import.sql`: executa consultas de validacao da importacao.
- `006_import_census_sectors_from_staging.sql`: transforma a tabela staging de setores censitarios no modelo final.
- `import_ibge_shapes.sh`: extrai os Shapefiles do IBGE e importa para o PostGIS usando `ogr2ogr`.
- `import_ibge_shapes.ps1`: alternativa para Windows usando `shp2pgsql`.
- `import_census_sectors.ps1`: importa apenas a malha de setores censitarios no Windows.
- `import_microregions_geojson.py`: importa `data/BR_Microrregioes_2022.geojson` para `microregions` e vincula municipios por intersecao espacial.
- `import_census_quantitative_data.py`: importa agregados quantitativos do Censo por setor, calcula indicadores e popula agregados por setor, municipio, UF e microrregiao.
- `fix_territorial_name_encoding.py`: corrige nomes territoriais por codigo IBGE usando a API oficial do IBGE e propaga nomes para `census_sector_profile`.

## Ordem de execucao

```bash
psql -d geobrasil -f database/001_schema.sql
psql -d geobrasil -f database/002_seed_example.sql
psql -d geobrasil -f database/003_census_sectors.sql
```

## Importacao das malhas IBGE

Pre-requisitos locais:

- PostgreSQL com PostGIS
- `psql`
- GDAL/OGR com o comando `ogr2ogr`
- `unzip`
- No Windows, 7-Zip e recomendado para ZIPs grandes do IBGE compactados com Deflate64

Importar UFs e municipios:

```bash
database/import_ibge_shapes.sh
```

Importar UFs, municipios e setores censitarios:

```bash
IMPORT_SECTORS=true database/import_ibge_shapes.sh
```

Variaveis aceitas pelo script:

- `PG_CONNECTION`: conexao usada pelo `ogr2ogr`. Padrao: `PG:dbname=geobrasil`.
- `PSQL_DATABASE`: banco usado pelo `psql`. Padrao: `geobrasil`.
- `DATA_DIR`: pasta dos arquivos `.zip`. Padrao: `data`.
- `EXTRACT_DIR`: pasta local de extracao. Padrao: `data/extracted/ibge`.
- `IMPORT_SECTORS`: define se importa setores censitarios. Padrao: `false`.

Exemplo com conexao customizada:

```bash
PG_CONNECTION="PG:host=localhost port=5432 dbname=geobrasil user=postgres password=postgres" PSQL_DATABASE=geobrasil database/import_ibge_shapes.sh
```

### Importacao no Windows

Se o `ogr2ogr` instalado nao tiver o driver `PostgreSQL`, use o script PowerShell com `shp2pgsql`:

```powershell
.\database\import_ibge_shapes.ps1 -Port 5434 -User postgres
```

Para importar tambem setores censitarios:

```powershell
.\database\import_ibge_shapes.ps1 -Port 5434 -User postgres -ImportSectors
```

Para importar somente setores censitarios, depois de UFs e municipios ja estarem carregados:

```powershell
.\database\import_census_sectors.ps1 -Port 5434 -User postgres
```

Para importar microrregioes a partir do GeoJSON:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\import_microregions_geojson.py
```

Para importar os agregados quantitativos por setor censitario:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\import_census_quantitative_data.py
```

Esse script le os ZIPs `Agregados_por_setores_basico_BR_20260520.zip`, `Agregados_por_setores_demografia_BR.zip`, `Agregados_por_setores_alfabetizacao_BR.zip`, `Agregados_por_setores_cor_ou_raca_BR.zip` e `Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip` diretamente da pasta `data/`.

Para corrigir nomes territoriais com problema de encoding sem recarregar geometrias ou indicadores:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\fix_territorial_name_encoding.py
```

O arquivo `BR_setores_CD2022.zip` pode falhar com `Expand-Archive` e `tar.exe` por usar Deflate64. Os scripts PowerShell usam 7-Zip automaticamente quando ele estiver disponivel no Windows.

Para malhas grandes, como setores censitarios, os scripts PowerShell usam `cmd.exe` para executar o pipeline entre `shp2pgsql` e `psql`. Isso evita erro de memoria do PowerShell ao processar uma saida SQL muito grande. A opcao `-D` do `shp2pgsql` tambem e usada para gerar um dump mais eficiente.

## Modelo inicial

- `states`: estados brasileiros com geometria `MultiPolygon` em SIRGAS 2000, SRID 4674.
- `municipalities`: municipios relacionados a estados, tambem com geometria `MultiPolygon` em SRID 4674.
- `census_indicators`: catalogo de indicadores censitarios.
- `municipality_indicator_values`: valores dos indicadores por municipio.
- `census_sectors`: setores censitarios relacionados aos municipios.

Os dados de `002_seed_example.sql` sao apenas exemplos. As malhas oficiais e os dados reais do Censo serao importados em etapa posterior.

## Observacao sobre setores censitarios

`data/BR_setores_CD2022.zip` e grande. A importacao fica separada para evitar custo desnecessario durante os testes iniciais. No WebGIS, essa camada deve ser consultada apenas depois da selecao de um municipio.
