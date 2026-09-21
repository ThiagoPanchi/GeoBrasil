# Roadmap do Projeto

Este documento sera usado para organizar as etapas de desenvolvimento e aprendizado do projeto.

## Etapa atual: portfolio WebGIS estatico

- Frontend React/Vite publicado em GitHub Pages
- Mapa Leaflet com assets FlatGeobuf carregados pelo navegador
- Manifesto estatico em `frontend/public/geodata/manifest.json`
- Carregamento de municipios e microrregioes somente apos selecao da UF
- Carregamento de setores censitarios somente apos selecao do municipio
- Indicadores censitarios calculados e estilizados no cliente
- Popup, legenda, painel lateral e tabela/ranking para o contexto carregado

## Proximas etapas previstas

- Refinar os indicadores derivados dos agregados censitarios disponiveis
- Reduzir o tamanho dos assets estaticos quando necessario para melhorar carregamento
- Automatizar a publicacao do conteudo de `frontend/dist` no GitHub Pages
- Documentar atualizacoes dos arquivos fonte em `data/FlatGeoBuf/`
