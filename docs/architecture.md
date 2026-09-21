# Arquitetura

GeoBrasil opera como WebGIS estatico para portfolio. O frontend React/Vite fica na raiz do repositorio, e o GitHub Pages publica essa raiz para carregar dados territoriais FlatGeobuf diretamente do diretorio publico gerado em `public/geodata/`.

## Decisoes atuais

- O runtime publicado nao exige FastAPI, Python, PostgreSQL ou PostGIS.
- Os arquivos nacionais em `data/FlatGeoBuf/` sao fonte de preparacao local, nao assets lidos diretamente pela aplicacao publicada.
- `scripts/prepare-static-geodata.mjs` gera particoes por UF para municipios/microrregioes e por municipio para setores censitarios.
- `public/geodata/manifest.json` e a fonte de roteamento entre selecoes territoriais e arquivos `.fgb`.
- O frontend calcula bbox, classificacao coropletica, `indicatorValue` e `fillColor` no cliente para os registros carregados.

## Fluxo de publicacao

1. Atualizar os arquivos fonte em `data/FlatGeoBuf/` quando necessario.
2. Rodar `npm run prepare:geodata` na raiz do repositorio.
3. Rodar `npm run build:static`.
4. Publicar a branch `main` a partir da raiz no GitHub Pages.
