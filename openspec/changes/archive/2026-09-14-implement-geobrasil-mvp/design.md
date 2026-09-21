## Context

O repositorio ja possui a estrutura alvo do produto: `frontend/` com React, Vite, TypeScript e MapLibre GL JS; `backend/` com FastAPI; `database/` com scripts iniciais de PostgreSQL/PostGIS; `data/` com malhas e agregados do IBGE. A implementacao atual ainda usa dados mockados no backend, expostos diretamente em `backend/app/main.py`, e o frontend ja renderiza UFs/municipios com MapLibre, seletor de UF, seletor de indicador, popup, painel lateral e legenda.

O modelo SQL existente cobre `states`, `municipalities`, `census_indicators`, `municipality_indicator_values` e `census_sectors`. Ainda nao ha persistencia para microrregioes nem valores de indicadores por setor. Tambem existem endpoints que permitem consultas nacionais de municipios/indicadores por municipio, comportamento que conflita com as restricoes do PRD e deve ser substituido ou bloqueado para o fluxo normal do MVP.

## Goals / Non-Goals

**Goals:**
- Evoluir a arquitetura existente sem trocar React/Vite, MapLibre, FastAPI ou PostgreSQL/PostGIS.
- Separar API, acesso a dados, regras territoriais e apresentacao para permitir testes isolados.
- Priorizar uma entrega incremental: primeiro UF -> Municipio -> Setor Censitario, depois UF -> Microrregiao -> Municipio.
- Consultar geometrias sempre com filtro territorial obrigatorio nos niveis inferiores.
- Permitir troca de indicador sem recarregar geometrias pesadas quando o contexto territorial nao muda.

**Non-Goals:**
- Nao introduzir autenticacao, contas, upload, exportacao, relatorios, mapas personalizados, Censo 2010 ou comparacao temporal.
- Nao substituir MapLibre por outro motor de mapa.
- Nao criar infraestrutura de producao completa antes do MVP local funcionar.
- Nao exigir que a primeira iteracao importe todos os indicadores complexos antes de validar o fluxo principal.

## Decisions

### Manter FastAPI e adicionar camadas internas simples

Usar FastAPI existente como API independente, mas mover gradualmente dados mockados de `main.py` para modulos de dominio/acesso a dados. A estrutura planejada deve separar rotas, modelos de resposta, repositorios PostGIS e regras de validacao territorial.

Alternativas consideradas:
- Reescrever o backend em outro framework: rejeitado porque FastAPI ja esta no repositorio e atende ao MVP.
- Manter tudo em `main.py`: rejeitado porque dificultaria validar regras como bloqueio de setores por UF/microrregiao e testes dos filtros.

### Usar PostgreSQL/PostGIS como fonte operacional do MVP

O backend deve consultar PostGIS para UFs, municipios, setores e indicadores, aproveitando os scripts existentes de schema/importacao. As respostas geograficas devem usar GeoJSON gerado no banco ou serializado pela API a partir das geometrias filtradas.

Alternativas consideradas:
- Carregar arquivos nacionais no frontend: rejeitado pelo PRD e por performance.
- Continuar com mocks para todo o MVP: rejeitado porque os criterios de aceite dependem de Censo 2022 e setores censitarios reais ou importados.

### Estender o schema para microrregioes e indicadores por setor

Adicionar tabelas para microrregioes e relacionamento com municipios, alem de valores de indicadores por setor censitario. Para indicadores categoricos ou distribuicoes, usar estrutura que represente categorias da fonte sem forcar tudo em um unico numero escalar.

Alternativas consideradas:
- Ignorar microrregioes no modelo: rejeitado porque o PRD exige o fluxo UF -> Microrregiao -> Municipios como criterio de aceite complementar.
- Criar colunas fixas para cada indicador: rejeitado por aumentar acoplamento e dificultar categorias como faixa etaria, sexo e cor/raca.

### API territorial explicita e restritiva

Definir endpoints filtrados por hierarquia, mantendo a forma conceitual do PRD: UFs, microrregioes por UF, municipios por UF ou microrregiao, setores por municipio e valores de indicadores por contexto. Endpoints legados que retornam todos os municipios para navegacao normal devem ser removidos ou passar a exigir filtro.

Alternativas consideradas:
- Um endpoint generico com parametros opcionais: rejeitado por facilitar chamadas proibidas e tornar validacoes menos claras.
- Endpoints explicitos por nivel: escolhido porque torna as restricoes verificaveis e reduz risco de carregar dados indevidos.

### Separar geometrias de valores de indicadores quando util

Para municipios e setores, a API deve permitir carregar geometrias do contexto uma vez e atualizar valores/metadata do indicador separadamente quando somente o indicador mudar. Para datasets pequenos, a resposta pode incluir valor e estilo juntos como simplificacao inicial, desde que nao viole as restricoes de carregamento.

Alternativas consideradas:
- Sempre reenviar GeoJSON completo a cada troca de indicador: simples, mas arriscado para setores e contrario ao principio tecnico do PRD.
- Sempre separar geometria e valores em todos os niveis desde o inicio: mais robusto, mas pode atrasar a entrega inicial de UFs/municipios. A abordagem incremental permite separar primeiro onde o custo e maior.

### Estado unico no frontend para mapa e dashboard

Centralizar em `MapPage` ou modulo equivalente o estado minimo definido no PRD: UF, microrregiao, municipio, setor, camada atual, indicador e feature selecionada. Componentes de seletores, mapa, legenda, graficos e tabela recebem esse estado e disparam eventos para altera-lo.

Alternativas consideradas:
- Estado local disperso nos componentes: rejeitado porque mapa, graficos e tabela precisam permanecer sincronizados.
- Adicionar biblioteca de estado global agora: adiado porque o escopo atual pode ser atendido com estado React local/composicao antes de crescer.

### Graficos e tabela sem nova biblioteca obrigatoria no primeiro passo

Como o PRD nao exige uma biblioteca especifica de graficos, a primeira entrega pode usar componentes React/SVG/CSS simples para barras, ranking ou distribuicoes. Uma dependencia de graficos so deve ser adicionada se a implementacao manual impedir atender os dois graficos do MVP com qualidade suficiente.

Alternativas consideradas:
- Adicionar biblioteca de graficos imediatamente: adiado para evitar dependencia desnecessaria.
- Entregar graficos como placeholders: rejeitado porque o criterio de aceite exige graficos funcionais relacionados aos dados exibidos.

## Risks / Trade-offs

- [Importacao e dicionarios do IBGE podem demandar mapeamento manual de colunas] -> Mitigar iniciando pelos indicadores necessarios ao fluxo MVP e documentando cada mapeamento em scripts versionados.
- [Setores censitarios podem gerar respostas GeoJSON grandes mesmo filtrados por municipio] -> Mitigar com indices PostGIS, simplificacao de geometria por zoom quando necessario e separacao entre geometria e valores de indicador.
- [Microrregiao usada pelo projeto pode nao corresponder diretamente a uma malha pronta no repositorio] -> Mitigar definindo a origem de microrregioes na etapa de banco antes de implementar o fluxo complementar.
- [Endpoints atuais permissivos podem mascarar violacoes do PRD] -> Mitigar com testes de API para chamadas proibidas antes de ligar o frontend aos novos endpoints.
- [Indicadores categoricos exigem visualizacoes diferentes de indicadores numericos] -> Mitigar com contrato de dados comum que permita valor principal para coropletico e distribuicoes/categorias para graficos e tabela.

## Migration Plan

1. Preservar a aplicacao atual funcionando enquanto novos modulos e endpoints sao adicionados em paralelo.
2. Criar/ajustar scripts de banco para microrregioes e valores de indicadores por setor, mantendo os scripts existentes de UFs, municipios e setores.
3. Conectar o backend ao PostGIS e migrar endpoints de leitura para dados persistidos.
4. Bloquear ou substituir endpoints que permitem consultas nacionais proibidas.
5. Atualizar o frontend para consumir os endpoints hierarquicos, primeiro no fluxo UF -> Municipio -> Setor.
6. Adicionar microrregioes ao fluxo depois que municipio/setor estiver estavel.
7. Rollback local: manter os scripts e commits separados por camada para permitir voltar temporariamente ao backend mockado durante desenvolvimento, sem preservar endpoints proibidos como comportamento final.

## Open Questions

- A origem exata das microrregioes deve ser confirmada durante a implementacao de banco caso nao exista arquivo pronto em `data/`; isso nao altera o contrato de produto, apenas o script de importacao.
- A estrategia final de classificacao do coropletico pode ser intervalos iguais inicialmente e evoluir para quantis ou outro metodo, pois o PRD deixa essa escolha para a implementacao.
