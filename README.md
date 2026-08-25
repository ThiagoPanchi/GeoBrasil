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
- Mapas: MapLibre GL JS
- Infraestrutura futura: Docker, Redis, Nginx e servicos em nuvem

## MVP inicial

A versao inicial permite:

- visualizar o mapa base do Brasil
- visualizar uma camada simplificada de estados
- selecionar uma UF antes de carregar municipios
- visualizar municipios da UF selecionada
- clicar em um municipio
- consultar indicadores censitarios mockados
- aplicar um indicador ao mapa
- gerar mapa coropletico por indicador
- visualizar informacoes em popup e painel lateral

Nesta etapa os dados sao simplificados e mockados no backend. A substituicao por malhas oficiais do IBGE e dados em PostgreSQL/PostGIS ficara para uma etapa posterior.

## Como executar localmente

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API local:

```text
http://localhost:8000
```

Endpoints iniciais:

- `GET /health`
- `GET /states`
- `GET /municipalities`
- `GET /municipalities?uf=SP`
- `GET /municipalities/{id}`
- `GET /indicators`
- `GET /indicators/{indicator_id}/municipalities`
- `GET /indicators/{indicator_id}/municipalities?uf=SP`

Endpoint auxiliar usado pelo mapa:

- `GET /states/{uf}/municipalities?indicator=population`

### Banco de dados

Scripts iniciais do PostgreSQL/PostGIS:

- `database/001_schema.sql`
- `database/002_seed_example.sql`

Execucao prevista:

```bash
createdb geobrasil
psql -d geobrasil -f database/001_schema.sql
psql -d geobrasil -f database/002_seed_example.sql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicacao local:

```text
http://localhost:5173
```
