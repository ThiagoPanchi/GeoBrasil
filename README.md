# GeoBrasil

Projeto WebGIS para visualizacao e analise de dados do Censo Demografico do Brasil e malhas territoriais do IBGE.

## Arquitetura atual

O modo principal do portfolio e uma aplicacao estatica em React/Vite publicada em GitHub Pages. O WebGIS carrega assets FlatGeobuf pelo navegador, usando um manifesto estatico em `frontend/public/geodata/manifest.json`.

```text
GeoBrasil/
├── frontend/         # Aplicacao web React/Vite e assets publicados
├── data/             # Dados fonte do IBGE, incluindo FlatGeoBuf nacionais
├── scripts/          # Scripts auxiliares historicos ou futuros
├── backend/          # Legado FastAPI, nao exigido no portfolio estatico
├── database/         # Legado PostgreSQL/PostGIS, nao exigido no portfolio estatico
├── infrastructure/   # Configuracoes futuras
└── docs/             # Documentacao tecnica
```

## Tecnologias

- Frontend: React, TypeScript e Vite
- Mapas: MapLibre GL JS
- Dados vetoriais: FlatGeobuf lido no navegador
- Publicacao: GitHub Pages a partir de `frontend/dist`
- Legado: FastAPI e PostgreSQL/PostGIS permanecem no repositorio, mas nao sao necessarios para executar o portfolio estatico

## Funcionalidades do portfolio

- visualizar UFs do Brasil a partir de asset estatico
- selecionar uma UF e carregar apenas municipios e microrregioes dessa UF
- filtrar municipios por microrregiao
- carregar setores censitarios somente apos selecionar um municipio
- aplicar indicadores no cliente e gerar mapa coropletico
- visualizar legenda, popup, painel lateral e ranking/tabela dos registros carregados
- executar sem backend Python, PostGIS ou endpoint REST em tempo de publicacao

## Dados estaticos

Arquivos fonte esperados:

- `data/FlatGeoBuf/BR_UF_2025_simp.fgb`
- `data/FlatGeoBuf/BR_Municipios_2025_simp.fgb`
- `data/FlatGeoBuf/BR_Microrregioes_2022_simp.fgb`
- `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`

Gerar assets particionados para o frontend:

```bash
cd frontend
npm install
npm run prepare:geodata
```

O particionamento usa Node.js e a dependencia npm `flatgeobuf`; GDAL/`ogr2ogr` nao e necessario para este fluxo.

O comando gera:

- `frontend/public/geodata/ufs.fgb`
- `frontend/public/geodata/municipalities/<UF>.fgb`
- `frontend/public/geodata/microregions/<UF>.fgb`
- `frontend/public/geodata/sectors/<CD_MUN>.fgb`
- `frontend/public/geodata/manifest.json`

## Execucao local

```bash
cd frontend
npm install
npm run prepare:geodata
npm run dev
```

Aplicacao local:

```text
http://localhost:5173/GeoBrasil/
```

## Build e preview estatico

```bash
cd frontend
npm run build:static
npm run preview:pages
```

O build final fica em `frontend/dist` e inclui os assets copiados de `frontend/public/geodata/`.

## GitHub Pages

O Vite usa `base` com valor padrao `/GeoBrasil/`. Para outro nome de repositorio ou dominio, defina `VITE_BASE_PATH` antes do build.

Exemplo:

```bash
cd frontend
$env:VITE_BASE_PATH = "/GeoBrasil/"
npm run build:static
```

Publique o conteudo de `frontend/dist` no GitHub Pages. A aplicacao publicada nao deve chamar `localhost:8000` nem depender de FastAPI/PostGIS.

## Legado backend e banco

`backend/` e `database/` documentam a fase anterior do MVP com API mockada e scripts PostGIS. Eles nao fazem parte do caminho operacional do portfolio estatico.

Organizacao dos dados IBGE:

- `docs/ibge-data-organization.md`
