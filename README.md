# GeoBrasil

Projeto WebGIS para visualizacao e analise de dados do Censo Demografico do Brasil e malhas territoriais do IBGE.

## Estrutura inicial

```text
GeoBrasil/
├── backend/          # API em Python + FastAPI
├── frontend/         # Aplicacao web em React
├── database/         # Scripts e documentacao do PostgreSQL/PostGIS
├── data/             # Dados brutos e processados do IBGE
├── infrastructure/   # Configuracoes futuras de Docker, Nginx, Redis e nuvem
└── docs/             # Documentacao tecnica e decisoes de arquitetura
```

## Tecnologias previstas

- Frontend: React
- Backend: Python + FastAPI
- Banco de dados: PostgreSQL + PostGIS
- Dados: Censo Demografico e malhas territoriais do IBGE
- Mapas: Leaflet
- Infraestrutura futura: Docker, Redis, Nginx e servicos em nuvem

## MVP inicial

A versao inicial permite:

- visualizar o mapa base do Brasil
- visualizar uma camada simplificada de estados
- selecionar uma UF antes de carregar municipios
- visualizar municipios da UF selecionada
- carregar setores censitarios somente apos selecionar um municipio
- clicar em um municipio
- consultar indicadores censitarios mockados
- aplicar um indicador ao mapa
- gerar mapa coropletico por indicador
- visualizar informacoes em popup e painel lateral

O MVP usa a hierarquia territorial UF -> microrregiao opcional -> municipio -> setor censitario. Consultas nacionais de municipios e consultas de setores por Brasil, UF ou microrregiao sao rejeitadas. O backend consulta PostgreSQL/PostGIS via `DATABASE_URL`; as tabelas espaciais esperadas sao `states`, `municipalities`, `microregions` e `census_sectors`.

## Como executar localmente

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PYTHONPATH="."
pytest -q
uvicorn app.main:app --reload
```

Para usar um PostgreSQL/PostGIS local existente, inicie o backend com a variavel `DATABASE_URL` apontando para o banco `geobrasil`:

```powershell
$env:DATABASE_URL="postgresql://postgres:123456@localhost:5434/geobrasil"
uvicorn app.main:app --reload
```

Se o PostgreSQL 18 estiver em outra porta, usuario ou senha, ajuste a URL. Exemplo:

```powershell
$env:DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5433/geobrasil"
```

API local:

```text
http://localhost:8000
```

Endpoints finais do MVP:

- `GET /health`
- `GET /states`
- `GET /states/geojson`
- `GET /indicators`
- `GET /indicators/{indicator_id}/states`
- `GET /indicators/{indicator_id}/municipalities?uf=SP`
- `GET /states/{uf}/microregions`
- `GET /states/{uf}/municipalities?indicator=population`
- `GET /microregions/{microregion_id}/municipalities?indicator=population`
- `GET /municipalities/{municipality_id}`
- `GET /municipalities/{municipality_id}/sectors?indicator=population`
- `GET /indicators/{indicator_id}/municipalities/{municipality_id}/sectors`

Rotas propositalmente rejeitadas com HTTP 400:

- `GET /municipalities` sem `uf`
- `GET /municipalities/all`
- `GET /microregions` sem UF
- `GET /sectors` sem municipio
- `GET /states/{uf}/sectors`
- `GET /microregions/{microregion_id}/sectors`

Catalogo de indicadores do MVP:

- `population`
- `density`
- `households`
- `literacy`
- `race_ethnicity`
- `gender_sex`
- `age_group`
- `income`

### Banco de dados

Scripts PostgreSQL/PostGIS:

- `database/001_schema.sql`
- `database/002_seed_example.sql`
- `database/003_census_sectors.sql`
- `database/004_import_ibge_from_staging.sql`
- `database/005_validate_spatial_import.sql`
- `database/006_import_census_sectors_from_staging.sql`
- `database/007_microregions.sql`
- `database/008_indicator_value_categories.sql`
- `database/009_seed_mvp_examples.sql`
- `database/import_ibge_shapes.sh`
- `database/import_ibge_shapes.ps1`
- `database/import_census_sectors.ps1`
- `database/import_microregions_geojson.py`
- `database/import_census_quantitative_data.py`
- `database/fix_territorial_name_encoding.py`

Ordem de execucao local:

```bash
createdb geobrasil
psql -d geobrasil -f database/001_schema.sql
psql -d geobrasil -f database/002_seed_example.sql
psql -d geobrasil -f database/003_census_sectors.sql
psql -d geobrasil -f database/007_microregions.sql
psql -d geobrasil -f database/008_indicator_value_categories.sql
psql -d geobrasil -f database/009_seed_mvp_examples.sql
```

Os scripts `004`, `005` e `006` sao usados no fluxo de importacao IBGE via staging, apos `import_ibge_shapes.sh` ou `import_ibge_shapes.ps1`.

Organizacao dos dados IBGE:

- `docs/ibge-data-organization.md`

Importacao das malhas IBGE para PostGIS:

```bash
database/import_ibge_shapes.sh
```

No Windows, usando `shp2pgsql`:

```powershell
.\database\import_ibge_shapes.ps1 -Port 5434 -User postgres
```

Importacao incluindo setores censitarios:

```bash
IMPORT_SECTORS=true database/import_ibge_shapes.sh
```

No Windows, incluindo setores censitarios:

```powershell
.\database\import_ibge_shapes.ps1 -Port 5434 -User postgres -ImportSectors
```

Se UFs e municipios ja foram importados, importe somente os setores censitarios com:

```powershell
.\database\import_census_sectors.ps1 -Port 5434 -User postgres
```

Para importar microrregioes a partir de `data/BR_Microrregioes_2022.geojson`:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\import_microregions_geojson.py
```

Para importar os agregados quantitativos por setor censitario:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\import_census_quantitative_data.py
```

Para corrigir nomes territoriais com problema de encoding sem recarregar geometrias ou indicadores:

```powershell
$env:DATABASE_URL="postgresql://postgres:sua_senha@localhost:5434/geobrasil"
python .\database\fix_territorial_name_encoding.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

Aplicacao local:

```text
http://localhost:5173
```
