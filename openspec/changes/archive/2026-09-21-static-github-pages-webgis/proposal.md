## Why

GeoBrasil precisa deixar de depender de FastAPI, Python e PostgreSQL/PostGIS para poder ser publicado como portfolio em GitHub Pages. A aplicacao deve carregar no navegador apenas os arquivos territoriais necessarios ao contexto selecionado, evitando transferir malhas nacionais pesadas durante a navegacao normal.

## What Changes

- **BREAKING**: remover a dependencia operacional do backend Python/FastAPI e do banco PostgreSQL/PostGIS para a experiencia WebGIS publicada.
- Publicar o frontend Vite/React como aplicacao estatica compativel com GitHub Pages.
- Adicionar um catalogo estatico de UFs, microrregioes, municipios, indicadores e caminhos de assets para substituir endpoints REST em tempo de execucao.
- Preparar assets FlatGeobuf derivados de `data/FlatGeoBuf/BR_Municipios_2025_simp.fgb` e `data/FlatGeoBuf/BR_Microrregioes_2022_simp.fgb`, particionados por UF.
- Preparar assets FlatGeobuf derivados de `data/FlatGeoBuf/BR_setores_CD2022_simp.fgb`, particionados por municipio.
- Atualizar a navegacao do mapa para carregar UFs inicialmente, municipios e microrregioes por UF, e setores apenas por municipio selecionado, lendo arquivos estaticos conforme a selecao do usuario.
- Atualizar a simbologia, legenda, painel, tabela e graficos para derivarem de dados carregados no cliente em vez de respostas enriquecidas pelo backend.
- Manter fora do escopo desta mudanca autenticacao, edicao de dados, upload, comparacao temporal, relatorios, infraestrutura de servidor e uso operacional de PostGIS.

## Capabilities

### New Capabilities
- `static-webgis-deployment`: Contrato para execucao do GeoBrasil como WebGIS estatico em GitHub Pages, incluindo carregamento client-side de assets e ausencia de backend obrigatorio.

### Modified Capabilities
- `territorial-navigation`: A origem e granularidade dos carregamentos territoriais mudam de API filtrada para arquivos FlatGeobuf estaticos particionados por UF ou municipio.
- `thematic-map`: A classificacao e o estilo passam a ser calculados no cliente a partir dos registros carregados dos assets estaticos.
- `census-indicators`: O catalogo e os valores de indicadores deixam de ser obtidos por endpoints em tempo de execucao e passam a vir de metadados/assets estaticos disponiveis ao frontend.
- `dashboard-synchronization`: O estado compartilhado, feedback de carregamento e componentes sincronizados passam a refletir leituras assicronas de arquivos estaticos no navegador.

## Impact

- Frontend `frontend/`: configuracao Vite para GitHub Pages, substituicao de `frontend/src/api.ts`, ajustes em `MapPage`, `MapView`, componentes de painel/seletores e tipos de dados.
- Assets `data/FlatGeoBuf/`: arquivos fonte de UFs, municipios, microrregioes e setores usados para gerar arquivos particionados e manifestos estaticos publicados com o frontend.
- Scripts de preparacao de dados: novo fluxo local para particionar FlatGeobuf por UF e municipio antes do build/publicacao.
- Dependencias frontend: leitor FlatGeobuf/GeoJSON no navegador e possiveis utilitarios de processamento geoespacial client-side.
- Backend `backend/` e banco `database/`: deixam de ser necessarios para a publicacao do portfolio; podem permanecer no repositorio apenas como legado/documentacao, mas nao podem ser exigidos pela aplicacao publicada.
- Documentacao `README.md` e `docs/`: devem refletir o modo estatico, o preparo dos assets e o deploy no GitHub Pages.
