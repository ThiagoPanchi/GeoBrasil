## Why

GeoBrasil precisa transformar o PRD do MVP em um contrato verificavel para evoluir o WebGIS atual de dados simplificados/mockados para uma aplicacao funcional de exploracao hierarquica do Censo 2022. O problema central e permitir analise territorial por mapas tematicos, graficos e tabela sem carregar geometrias nacionais excessivas, especialmente municipios e setores censitarios.

## What Changes

- Definir a navegacao geografica hierarquica Brasil/UF/Microrregiao/Municipio/Setor Censitario, com UF como visualizacao inicial e carregamento filtrado para niveis inferiores.
- Exigir validacoes no frontend e na API para impedir consultas proibidas, incluindo todos os municipios do Brasil e setores fora do contexto de municipio selecionado.
- Disponibilizar indicadores iniciais do Censo 2022: populacao, densidade demografica, domicilios, alfabetizacao, etnia/cor ou raca, genero/sexo, faixa etaria e rendimento.
- Atualizar o mapa para aplicar simbologia coropletica e legenda dinamica conforme indicador, nivel territorial e filtros selecionados.
- Sincronizar mapa, seletores, graficos, tabela, destaque de geometria selecionada e retorno ao nivel territorial anterior em um estado compartilhado da aplicacao.
- Priorizar primeiro o fluxo minimo funcional UF -> Municipio -> Setor Censitario, seguido por UF -> Microrregiao -> Municipios conforme definido no PRD.
- Manter fora do MVP autenticacao, contas, edicao/upload de geometrias, mapas personalizados, comparacao entre censos, Censo 2010, exportacoes, relatorios automaticos, analise temporal, impressao e indicadores personalizados.

## Capabilities

### New Capabilities
- `territorial-navigation`: Contrato para navegacao hierarquica, seletores dependentes, drill-down/retorno e restricoes de carregamento territorial.
- `census-indicators`: Contrato para catalogo e consulta de indicadores censitarios por nivel territorial e filtros permitidos.
- `thematic-map`: Contrato para mapa coropletico, classificacao de valores, cores, legenda dinamica e destaque de geometrias.
- `dashboard-synchronization`: Contrato para sincronizacao entre estado da aplicacao, mapa, graficos, tabela e feedback de carregamento.

### Modified Capabilities
- Nenhuma. O diretorio `openspec/specs` ainda nao possui capabilities existentes.

## Impact

- Backend FastAPI: novos/ajustados endpoints territoriais filtrados para UFs, microrregioes, municipios, setores e valores de indicadores, com validacoes contra acessos fora da hierarquia.
- Frontend React/Vite/MapLibre: evolucao da tela de mapa, estado de selecao, seletores, carregamento de GeoJSON, legenda, graficos, tabela, feedback de carregamento e interacoes de clique/duplo clique.
- Banco PostgreSQL/PostGIS: consolidacao do modelo espacial existente de UFs, municipios, setores e indicadores, com extensao para microrregioes e valores de indicadores por setor quando necessario para o MVP.
- Dados IBGE: uso das malhas e agregados do Censo 2022 ja presentes em `data/`, com importacao incremental para evitar custo de carregar setores sem municipio selecionado.
