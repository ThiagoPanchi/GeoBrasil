## 1. Banco de Dados e Dados Base

- [x] 1.1 [database] Revisar os scripts existentes de `states`, `municipalities`, `census_indicators`, `municipality_indicator_values` e `census_sectors`, e verificar com `psql -d geobrasil -f database/001_schema.sql` e `psql -d geobrasil -f database/003_census_sectors.sql` em banco local limpo.
- [x] 1.2 [database] Adicionar tabela e indices para microrregioes e relacionamento com municipios, e verificar com uma consulta que liste microrregioes por UF sem duplicidades.
- [x] 1.3 [database] Adicionar estrutura para valores de indicadores por setor censitario e, se necessario, valores categoricos/distribuicoes, e verificar constraints de FK para municipio, setor e indicador.
- [x] 1.4 [database] Criar ou ajustar seeds/importacoes minimas para UFs, municipios, setores e catalogo de indicadores do MVP, e verificar que os oito indicadores do PRD existem em `census_indicators`.
- [x] 1.5 [database] Mapear inicialmente populacao, densidade, domicilios e rendimento para municipios e setores usando dados disponiveis, e verificar com consultas agregadas por UF e municipio.
- [x] 1.6 [database] Mapear alfabetizacao, etnia/cor ou raca, genero/sexo e faixa etaria no formato definido para categorias/distribuicoes, e verificar que cada indicador retorna dados para pelo menos um municipio importado.

## 2. Backend FastAPI

- [x] 2.1 [backend] Introduzir configuracao de conexao com PostgreSQL/PostGIS sem remover a rota `/health`, e verificar que a API sobe com `uvicorn app.main:app --reload`.
- [x] 2.2 [backend] Separar rotas, modelos de resposta e acesso a dados hoje concentrados em `backend/app/main.py`, e verificar que os endpoints existentes cobertos por testes continuam respondendo durante a migracao.
- [x] 2.3 [backend] Implementar endpoint de listagem/GeoJSON de UFs para a visualizacao inicial, e verificar que retorna todas as UFs sem municipios, microrregioes ou setores embutidos.
- [x] 2.4 [backend] Implementar endpoint de municipios por UF, e verificar que uma requisicao sem UF para carregar todos os municipios e rejeitada.
- [x] 2.5 [backend] Implementar endpoint de setores censitarios por municipio, e verificar que chamadas por Brasil, UF ou microrregiao sao rejeitadas.
- [x] 2.6 [backend] Implementar catalogo de indicadores do MVP, e verificar que a resposta inclui populacao, densidade, domicilios, alfabetizacao, etnia/cor ou raca, genero/sexo, faixa etaria e rendimento.
- [x] 2.7 [backend] Implementar valores de indicadores por contexto territorial atual, e verificar respostas para UFs, municipios de uma UF e setores de um municipio.
- [x] 2.8 [backend] Implementar metadata de classificacao, cores e bbox para respostas geograficas ou de valores quando aplicavel, e verificar que classes sao calculadas somente sobre os registros retornados.
- [x] 2.9 [backend] Implementar endpoints de microrregioes por UF e municipios por microrregiao, e verificar que microrregioes sem UF e municipios nacionais sao rejeitados.
- [x] 2.10 [backend/testes] Adicionar testes de API para rotas permitidas, rotas proibidas, indicador invalido e territorio inexistente, e verificar com `pytest`.

## 3. Frontend: Estado, API e Navegacao Principal

- [x] 3.1 [frontend] Atualizar tipos em `frontend/src/types.ts` para UF, microrregiao, municipio, setor, camada atual, indicador, breaks, bbox e linhas de dashboard, e verificar com `npm run build`.
- [x] 3.2 [frontend] Atualizar `frontend/src/api.ts` para consumir endpoints hierarquicos e remover chamadas que dependem de carregar todos os municipios, e verificar com build TypeScript.
- [x] 3.3 [frontend] Centralizar em `MapPage` o estado de UF, microrregiao, municipio, setor, camada atual, indicador e feature selecionada, e verificar que alterar UF limpa selecoes inferiores.
- [x] 3.4 [frontend] Atualizar seletores hierarquicos para UF, microrregiao opcional, municipio e indicador, e verificar manualmente que seletores inferiores ficam indisponiveis ou vazios sem selecao superior.
- [x] 3.5 [frontend] Atualizar carregamento inicial do mapa para exibir UFs e nenhuma geometria inferior, e verificar visualmente no navegador local.
- [ ] 3.6 [frontend] Implementar fluxo UF -> Municipios com zoom para a UF e mapa tematico por indicador, e verificar que somente municipios da UF selecionada aparecem.
- [ ] 3.7 [frontend] Implementar clique em municipio para destacar geometria e atualizar informacoes basicas no estado compartilhado, e verificar visualmente o destaque e o painel.
- [ ] 3.8 [frontend] Implementar duplo clique em municipio para carregar setores censitarios do municipio, trocar a camada atual e ajustar o viewport, e verificar que setores de outros municipios nao aparecem.
- [x] 3.9 [frontend] Implementar acao de voltar de setores para municipios, e verificar que o setor selecionado e limpo e a camada de municipios retorna.

## 4. Frontend: Mapa Tematico, Dashboard e Feedback

- [ ] 4.1 [frontend] Atualizar estilo coropletico para aplicar cores conforme valor do indicador na camada atual, e verificar mudanca de cores ao trocar indicador.
- [ ] 4.2 [frontend] Atualizar legenda dinamica para refletir indicador, classes/categorias e cores atuais, e verificar recalcule ao mudar UF, municipio, camada ou indicador.
- [ ] 4.3 [frontend] Implementar dois graficos simples baseados nos registros atualmente exibidos no mapa, e verificar que eles mudam entre municipios da UF e setores do municipio.
- [ ] 4.4 [frontend] Implementar tabela sincronizada com os registros atualmente exibidos no mapa, e verificar que as linhas mudam de municipios para setores ao fazer drill-down.
- [ ] 4.5 [frontend] Adicionar feedback visual de carregamento para consultas de UFs, municipios, setores, microrregioes e indicadores, e verificar que a interface nao fica sem status durante requisicoes.
- [ ] 4.6 [frontend] Exibir claramente territorio selecionado, camada atual, indicador ativo, significado das cores e acao de voltar quando aplicavel, e verificar esses elementos na jornada do MVP.

## 5. Fluxo de Microrregiao

- [x] 5.1 [backend] Garantir que o endpoint de microrregioes por UF retorna geometria/listagem filtrada e bbox, e verificar com requisicao para uma UF importada.
- [ ] 5.2 [frontend] Implementar selecao de microrregiao apos UF e carregamento de municipios da microrregiao, e verificar que alterar UF limpa a microrregiao.
- [ ] 5.3 [frontend] Implementar duplo clique em microrregiao para selecionar, zoomar e carregar municipios, e verificar que a tabela e os graficos passam a representar esses municipios.

## 6. Verificacao Integrada do MVP

- [x] 6.1 [backend/testes] Executar todos os testes de backend e verificar que rotas proibidas nao retornam geometrias ou listas nacionais indevidas.
- [x] 6.2 [frontend/testes] Executar `npm run build` em `frontend/` e verificar que a aplicacao compila sem erros TypeScript.
- [ ] 6.3 [integracao] Completar manualmente o fluxo Abrir aplicacao -> visualizar UFs -> selecionar UF -> visualizar municipios -> selecionar indicador -> visualizar mapa tematico -> selecionar municipio -> visualizar setores -> visualizar mapa tematico dos setores -> visualizar graficos -> visualizar tabela.
- [ ] 6.4 [integracao] Completar manualmente o fluxo UF -> Microrregiao -> Municipios sem carregar dados territoriais fora da hierarquia definida.
- [x] 6.5 [documentacao] Atualizar README ou documento tecnico com endpoints finais, comandos locais e ordem de importacao de dados, e verificar que os comandos documentados refletem os arquivos existentes.
