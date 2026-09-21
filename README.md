# GeoBrasil

Projeto WebGIS para visualizacao e analise de dados do Censo Demografico do Brasil e malhas territoriais do IBGE.

## Arquitetura atual

O modo principal do portfolio e uma aplicacao estatica em React/Vite publicada em GitHub Pages. O WebGIS carrega assets FlatGeobuf pelo navegador, usando um manifesto estatico em `public/geodata/manifest.json`.

```text
GeoBrasil/
├── src/              # Aplicacao web React/Vite
├── public/           # Assets estaticos publicados, incluindo geodata
├── scripts/          # Scripts de preparacao dos assets estaticos
├── data/             # Dados fonte locais do IBGE para gerar assets estaticos
├── infrastructure/   # Configuracoes futuras
└── docs/             # Documentacao tecnica
```

## Tecnologias

- Frontend: React, TypeScript e Vite
- Mapas: Leaflet
- Dados vetoriais: FlatGeobuf lido no navegador
- Publicacao: GitHub Pages a partir da raiz do repositorio

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
npm install
npm run prepare:geodata
```

O particionamento usa Node.js e a dependencia npm `flatgeobuf`; GDAL/`ogr2ogr` nao e necessario para este fluxo.

O comando gera:

- `public/geodata/ufs.fgb`
- `public/geodata/municipalities/<UF>.fgb`
- `public/geodata/microregions/<UF>.fgb`
- `public/geodata/sectors/<CD_MUN>.fgb`
- `public/geodata/manifest.json`

## Execucao local

```bash
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
npm run build:static
npm run preview:pages
```

O build final fica em `dist` e inclui somente o bundle Vite e os assets copiados de `public/geodata/`.

## GitHub Pages

O Vite usa `base` com valor padrao `/GeoBrasil/`. Para outro nome de repositorio ou dominio, defina `VITE_BASE_PATH` antes do build.

Exemplo:

```bash
$env:VITE_BASE_PATH = "/GeoBrasil/"
npm run build:static
```

Configure o GitHub Pages para publicar a branch `main` a partir da raiz do repositorio. O `index.html` da aplicacao fica na raiz, e a aplicacao publicada nao deve chamar `localhost:8000` nem depender de FastAPI/PostGIS.

Organizacao dos dados IBGE:

- `docs/ibge-data-organization.md`
