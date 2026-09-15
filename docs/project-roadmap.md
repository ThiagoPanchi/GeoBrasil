# Roadmap do Projeto

Este documento sera usado para organizar as etapas de desenvolvimento e aprendizado do projeto.

## Etapa atual: MVP WebGIS

- Frontend React com Leaflet
- Backend FastAPI com endpoints mockados
- Mapa base do Brasil
- Camada simplificada de estados
- Carregamento de municipios somente apos selecao da UF
- Indicadores censitarios mockados
- Mapa coropletico por indicador
- Popup e painel lateral para municipio selecionado

## Proximas etapas previstas

- Substituir dados mockados por malhas oficiais do IBGE
- Criar banco PostgreSQL/PostGIS
- Importar geometrias de estados e municipios
- Importar setores censitarios com carregamento sob demanda por municipio
- Modelar tabelas de indicadores censitarios
- Conectar endpoints do FastAPI ao banco espacial
