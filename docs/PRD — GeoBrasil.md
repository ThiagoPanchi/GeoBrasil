# Product Requirements Document — GeoBrasil

**Projeto:** GeoBrasil  
**Tipo:** WebGIS / Dashboard Geoespacial  
**Versão:** 1.0  
**Status:** Planejamento  
**Fonte principal de dados:** Censo Demográfico 2022 — IBGE

---

## 1. Visão Geral

O **GeoBrasil** será uma aplicação WebGIS para exploração e visualização interativa de indicadores do **Censo Demográfico 2022**.

A plataforma combinará:

- mapa interativo;
- camadas geográficas;
- mapas temáticos;
- indicadores censitários;
- gráficos;
- tabelas;
- navegação hierárquica pelo território brasileiro.

O usuário poderá explorar os dados em diferentes níveis territoriais:

**Brasil → Unidade da Federação → Microrregião → Município → Setor Censitário**

A aplicação deverá evitar o carregamento desnecessário de grandes volumes de geometrias, principalmente municípios e setores censitários. Por isso, a navegação geográfica será obrigatoriamente hierárquica.

---

# 2. Objetivo do Produto

Criar uma plataforma simples e interativa para consulta de informações básicas do Censo 2022, permitindo analisar visualmente diferenças territoriais por meio de mapas temáticos, gráficos e tabelas.

O sistema deverá permitir que um usuário responda perguntas como:

- Quais estados possuem maior população?
- Quais municípios de determinado estado apresentam maior densidade demográfica?
- Como determinado indicador varia dentro de um município?
- Quais setores censitários apresentam maior ou menor rendimento?
- Como características demográficas variam espacialmente?
- Qual é a distribuição de determinado indicador dentro de uma UF ou município?

---

# 3. Objetivos do Projeto

## 3.1 Objetivos principais

O GeoBrasil deverá:

1. Disponibilizar dados do Censo 2022 de forma georreferenciada.
2. Permitir navegação entre diferentes níveis territoriais.
3. Exibir indicadores censitários através de mapas coropléticos.
4. Permitir análise dos dados através de gráficos e tabelas.
5. Manter boa performance mesmo trabalhando com geometrias complexas.
6. Evitar consultas e carregamentos geográficos excessivamente grandes.
7. Criar uma experiência simples de exploração dos dados censitários.

---

# 4. Escopo Geográfico

O sistema trabalhará inicialmente com quatro níveis territoriais.

| Nível | Descrição |
|---|---|
| UF | Unidades da Federação |
| Microrregião | Divisão territorial intermediária utilizada pelo projeto |
| Município | Municípios pertencentes a uma UF |
| Setor Censitário | Menor unidade territorial disponibilizada no projeto |

A navegação entre esses níveis será hierárquica.

---

# 5. Hierarquia de Navegação

A aplicação deverá respeitar a seguinte estrutura:

```text
Brasil
│
├── UF
│   │
│   ├── Microrregião
│   │   │
│   │   └── Município
│   │
│   └── Município
│       │
│       └── Setor Censitário
```

Microrregião será uma forma adicional de navegação dentro de uma UF, mas não será obrigatória para chegar ao município.

Portanto, deverão ser possíveis os fluxos:

```text
UF → Município → Setor
```

e:

```text
UF → Microrregião → Município → Setor
```

---

# 6. Regras de Navegação Geográfica

Estas regras são obrigatórias para o funcionamento da aplicação.

## RN-01 — Visualização de UFs

A camada de UFs poderá apresentar todas as Unidades da Federação simultaneamente.

Esta será a visualização geográfica inicial da aplicação.

---

## RN-02 — Visualização de Microrregiões

Microrregiões somente poderão ser carregadas após a seleção de uma UF.

Não deverá existir uma operação no frontend que solicite todas as microrregiões do Brasil simultaneamente.

Fluxo:

```text
Selecionar UF
        ↓
Consultar microrregiões da UF
        ↓
Exibir microrregiões
```

---

## RN-03 — Visualização de Municípios

Municípios somente poderão ser carregados dentro de uma UF previamente selecionada.

O sistema nunca deverá carregar todos os municípios brasileiros simultaneamente.

Fluxo mínimo:

```text
Selecionar UF
        ↓
Consultar municípios da UF
        ↓
Exibir municípios
```

Caso uma microrregião esteja selecionada:

```text
UF
 ↓
Microrregião
 ↓
Municípios da Microrregião
```

---

## RN-04 — Visualização de Setores Censitários

Setores censitários somente poderão ser carregados após a seleção de um município.

É expressamente proibido carregar setores:

- de todo o Brasil;
- de toda uma UF;
- de toda uma microrregião.

Fluxo obrigatório:

```text
UF
 ↓
Município
 ↓
Setores Censitários
```

---

# 7. Navegação pelo Mapa

O mapa será um dos principais mecanismos de navegação da aplicação.

O usuário poderá navegar tanto pelos **seletores da interface** quanto através de interação direta com as geometrias.

## 7.1 Clique

Um clique simples poderá selecionar/destacar uma geometria e apresentar suas informações básicas.

Exemplo:

```text
Clique em Município
       ↓
Município destacado
       ↓
Dashboard apresenta informações do município
```

---

## 7.2 Duplo clique

O duplo clique deverá realizar o drill-down territorial.

### Microrregião

Quando a camada atual for Microrregião:

```text
Duplo clique
      ↓
Selecionar Microrregião
      ↓
Zoom para extensão da Microrregião
      ↓
Carregar municípios
```

### Município

Quando a camada atual for Município:

```text
Duplo clique
      ↓
Selecionar Município
      ↓
Zoom para extensão do Município
      ↓
Carregar Setores Censitários
```

---

# 8. Navegação por Seletores

Além do mapa, a interface deverá possuir seletores.

Exemplo:

```text
UF
[ Santa Catarina ▼ ]

Microrregião
[ Florianópolis ▼ ]

Município
[ Florianópolis ▼ ]
```

Os seletores deverão possuir dependência hierárquica.

Ao alterar uma seleção superior, todas as seleções inferiores deverão ser resetadas.

Exemplo:

```text
UF: Santa Catarina
Município: Florianópolis
Setor: 4205407...
```

Se o usuário alterar a UF para Paraná:

```text
UF: Paraná
Município: —
Setor: —
```

---

# 9. Indicadores

O usuário deverá selecionar qual indicador deseja visualizar.

A versão inicial deverá contemplar:

### População

Quantidade de habitantes da unidade territorial.

### Densidade Demográfica

População em relação à área territorial.

### Domicílios

Total de domicílios:

- particulares;
- coletivos.

### Alfabetização

Indicadores relacionados à população alfabetizada.

### Etnia / Cor ou Raça

Distribuição populacional segundo categorias disponibilizadas pelo Censo 2022.

### Gênero / Sexo

Distribuição da população segundo as categorias disponibilizadas pela fonte censitária utilizada.

### Faixa Etária

Distribuição da população segundo grupos de idade.

### Rendimento

Rendimento médio dos responsáveis pelos domicílios.

---

# 10. Mapa Temático

Ao selecionar um indicador, o estilo das geometrias deverá ser atualizado automaticamente.

Exemplo:

```text
Indicador:
População
     ↓
Obter valores das geometrias
     ↓
Classificar valores
     ↓
Gerar escala
     ↓
Aplicar cores
     ↓
Atualizar legenda
```

Cada geometria deverá receber uma cor correspondente à classe em que seu valor estiver inserido.

---

# 11. Legenda

O mapa deverá apresentar uma legenda dinâmica.

Exemplo:

```text
População

■ 0 – 10.000
■ 10.001 – 50.000
■ 50.001 – 100.000
■ 100.001 – 500.000
■ > 500.000
```

A legenda deverá ser recalculada sempre que houver alteração relevante de:

- indicador;
- nível territorial;
- UF;
- microrregião;
- município.

A estratégia exata de classificação — quantis, intervalos naturais, intervalos iguais etc. — poderá ser definida durante a implementação.

---

# 12. Dashboard

A tela principal será dividida em três componentes analíticos:

```text
┌──────────────────────────────────────────────────────────┐
│ Filtros / Seletores / Indicador                          │
├────────────────────────────────┬─────────────────────────┤
│                                │ Gráfico 1               │
│                                │                         │
│             MAPA               ├─────────────────────────┤
│                                │ Gráfico 2               │
│                                │                         │
├────────────────────────────────┴─────────────────────────┤
│                       TABELA                             │
└──────────────────────────────────────────────────────────┘
```

---

# 13. Gráficos

A interface deverá possuir **dois gráficos principais** relacionados ao conteúdo atualmente apresentado no mapa.

Os gráficos deverão reagir aos filtros e seleções realizados pelo usuário.

Exemplo:

```text
UF = Santa Catarina
Indicador = População
Camada = Municípios
```

Os gráficos deverão apresentar informações relacionadas aos municípios de Santa Catarina.

Ao entrar em:

```text
Município = Florianópolis
Camada = Setores Censitários
```

os gráficos passam a representar os setores censitários de Florianópolis.

O tipo exato de cada gráfico poderá variar de acordo com o indicador.

Exemplos possíveis:

- barras;
- ranking;
- histograma;
- distribuição por categorias;
- pirâmide etária;
- proporções.

---

# 14. Tabela de Dados

A parte inferior da aplicação deverá possuir uma tabela contendo os registros atualmente apresentados no mapa.

Exemplo:

```text
Camada atual = Municípios
UF = Santa Catarina
```

Tabela:

| Município | População | Densidade | Domicílios | Alfabetização | Rendimento |
|---|---:|---:|---:|---:|---:|
| Florianópolis | ... | ... | ... | ... | ... |
| São José | ... | ... | ... | ... | ... |
| Palhoça | ... | ... | ... | ... | ... |

A tabela deverá estar sincronizada com o mapa.

Quando a camada atual for Setor Censitário, cada linha deverá representar um setor.

---

# 15. Sincronização Mapa ↔ Dashboard

Mapa, gráficos e tabela deverão compartilhar o mesmo estado de seleção.

Conceitualmente:

```text
                ESTADO DA APLICAÇÃO
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
      MAPA           GRÁFICOS         TABELA
```

Alterações como:

```text
UF
Microrregião
Município
Camada
Indicador
Geometria selecionada
```

deverão atualizar os componentes dependentes.

---

# 16. Estado da Aplicação

O frontend deverá manter pelo menos as seguintes informações:

```text
selectedUF
selectedMicroregion
selectedMunicipality
selectedCensusSector

currentLayer

selectedIndicator

selectedFeature
```

Estados territoriais inferiores deverão depender dos superiores.

Por exemplo:

```text
selectedUF = null
```

implica obrigatoriamente:

```text
selectedMicroregion = null
selectedMunicipality = null
selectedCensusSector = null
```

---

# 17. Requisitos Funcionais

### RF-01
O sistema deverá apresentar o mapa do Brasil dividido por UF.

### RF-02
O usuário deverá poder selecionar uma UF.

### RF-03
O sistema deverá carregar microrregiões apenas para uma UF selecionada.

### RF-04
O sistema deverá carregar municípios apenas para uma UF selecionada.

### RF-05
O sistema deverá permitir selecionar uma microrregião e visualizar seus municípios.

### RF-06
O sistema deverá carregar setores censitários apenas para um município selecionado.

### RF-07
O usuário deverá poder realizar drill-down através de duplo clique no mapa.

### RF-08
O usuário deverá poder navegar através de seletores.

### RF-09
O usuário deverá poder selecionar um indicador censitário.

### RF-10
O mapa deverá alterar sua simbologia de acordo com o indicador selecionado.

### RF-11
O sistema deverá gerar uma legenda correspondente à simbologia atual.

### RF-12
O sistema deverá apresentar dois gráficos relacionados aos dados atualmente visualizados.

### RF-13
O sistema deverá apresentar uma tabela com os registros atualmente representados no mapa.

### RF-14
Mapa, gráficos e tabela deverão reagir às alterações de filtros e seleções.

### RF-15
O usuário deverá conseguir retornar ao nível territorial anterior.

### RF-16
A aplicação deverá destacar visualmente uma geometria selecionada.

---

# 18. Requisitos Não Funcionais

## RNF-01 — Performance

O sistema deverá evitar transferências excessivas de geometrias.

Particularmente, nunca deverão ser carregados simultaneamente:

- todos os setores censitários brasileiros;
- todos os setores de uma UF;
- todos os setores de uma microrregião;
- todos os municípios brasileiros para navegação normal.

---

## RNF-02 — Consultas Geográficas

As APIs deverão permitir consultas territorialmente filtradas.

Exemplos conceituais:

```text
/ufs

/ufs/{uf}/microregioes

/ufs/{uf}/municipios

/microregioes/{id}/municipios

/municipios/{id}/setores
```

A definição final das rotas pertence ao projeto técnico da API.

---

## RNF-03 — Responsividade

A aplicação deverá funcionar adequadamente em diferentes resoluções de desktop.

A versão inicial poderá priorizar desktop devido à quantidade de informações apresentadas simultaneamente.

---

## RNF-04 — Usabilidade

O usuário deverá compreender claramente:

- qual território está selecionado;
- qual nível territorial está sendo exibido;
- qual indicador está ativo;
- o significado das cores;
- como retornar ao nível anterior.

---

## RNF-05 — Feedback de carregamento

Consultas geográficas deverão possuir indicadores visuais de carregamento.

Exemplo:

```text
Carregando setores censitários...
```

A interface não deverá parecer travada durante consultas ou renderização de geometrias.

---

# 19. Restrições de Negócio

As seguintes operações deverão ser impossíveis pela interface:

```text
❌ carregar todos os setores censitários do Brasil

❌ carregar todos os setores de uma UF

❌ carregar setores de uma microrregião inteira

❌ acessar setores sem selecionar município

❌ carregar todos os municípios brasileiros simultaneamente
```

Essas restrições não deverão existir somente no frontend.

A API também deverá validar essas regras, evitando que chamadas diretas aos endpoints contornem as restrições.

---

# 20. Fluxo Principal do Usuário

### Entrada

```text
Abrir GeoBrasil
      ↓
Mapa apresenta UFs
      ↓
Selecionar indicador
      ↓
Mapa temático por UF
```

### Explorar uma UF

```text
Selecionar UF
      ↓
Zoom para UF
      ↓
Selecionar:
Microrregiões ou Municípios
```

### Caminho via Microrregião

```text
UF
 ↓
Microrregião
 ↓
Duplo clique
 ↓
Municípios
```

### Caminho direto

```text
UF
 ↓
Municípios
```

### Explorar Município

```text
Municípios
 ↓
Selecionar Município
 ↓
Duplo clique
 ↓
Setores Censitários
```

### Resultado

```text
Mapa temático
+
Gráfico 1
+
Gráfico 2
+
Tabela
```

---

# 21. Exemplo de Jornada

Um usuário deseja analisar o rendimento em Florianópolis.

### Etapa 1

Acessa o GeoBrasil.

O mapa apresenta todas as UFs.

### Etapa 2

Seleciona:

```text
UF = Santa Catarina
```

O mapa realiza zoom para Santa Catarina.

### Etapa 3

Seleciona:

```text
Camada = Municípios
```

A aplicação consulta e apresenta apenas os municípios de Santa Catarina.

### Etapa 4

Seleciona:

```text
Indicador = Rendimento médio
```

Os municípios recebem cores de acordo com seus respectivos valores.

### Etapa 5

O usuário dá duplo clique em Florianópolis.

### Etapa 6

A aplicação:

1. seleciona Florianópolis;
2. realiza zoom para o município;
3. consulta os setores censitários de Florianópolis;
4. substitui a camada de municípios pela camada de setores;
5. recalcula as classes do indicador;
6. atualiza a legenda;
7. atualiza os gráficos;
8. atualiza a tabela.

O usuário agora consegue visualizar espacialmente a variação do rendimento dentro do município.

---

# 22. Critérios de Aceite do MVP

O MVP será considerado funcional quando for possível completar o seguinte fluxo:

```text
Abrir aplicação
        ↓
Visualizar UFs
        ↓
Selecionar UF
        ↓
Visualizar municípios
        ↓
Selecionar indicador
        ↓
Visualizar mapa temático
        ↓
Selecionar município
        ↓
Visualizar setores censitários
        ↓
Visualizar mapa temático dos setores
        ↓
Visualizar gráficos
        ↓
Visualizar tabela
```

Também deverá ser possível executar:

```text
UF → Microrregião → Municípios
```

sem carregar dados territoriais fora da hierarquia definida.

---

# 23. Fora do Escopo Inicial

Para evitar aumento excessivo do escopo, não fazem parte obrigatória do MVP:

- autenticação de usuários;
- criação de contas;
- edição de geometrias;
- upload de dados pelo usuário;
- criação de mapas personalizados;
- comparação entre diferentes censos;
- Censo 2010;
- exportação de mapas;
- geração automática de relatórios;
- análise temporal;
- impressão de mapas;
- criação de indicadores personalizados.

Essas funcionalidades poderão ser consideradas posteriormente.

---

# 24. Evoluções Futuras

Após o MVP, poderão ser consideradas funcionalidades como:

### Comparação temporal

```text
Censo 2010 × Censo 2022
```

### Comparação territorial

Comparar dois municípios ou regiões lado a lado.

### Exportação

Permitir download dos dados filtrados em formatos como:

```text
CSV
GeoJSON
PNG
PDF
```

### URL compartilhável

Persistir filtros na URL:

```text
/SC/florianopolis?indicador=rendimento
```

permitindo compartilhar diretamente determinada visualização.

### Busca

Busca textual por:

- UF;
- município;
- microrregião.

### Dashboard avançado

Inclusão de:

- cards de indicadores;
- rankings;
- estatísticas descritivas;
- histogramas;
- distribuições;
- comparações territoriais.

---

# 25. Princípios Técnicos do Produto

Embora a arquitetura definitiva deva ser definida separadamente, o desenvolvimento deverá seguir alguns princípios.

### Backend responsável pelos dados

O frontend não deverá carregar grandes arquivos nacionais e realizar todos os filtros localmente.

O backend deverá entregar apenas os dados necessários para o estado atual da aplicação.

### Navegação hierárquica

A hierarquia territorial deverá fazer parte da regra de negócio da aplicação.

### API independente

O backend deverá ser desenvolvido de maneira suficientemente desacoplada para que os dados possam futuramente ser consumidos por outros clientes além do WebGIS.

### Separação entre geometria e indicador

Sempre que possível, a arquitetura deverá evitar retransmitir geometrias pesadas quando somente os valores de um indicador forem alterados.

Por exemplo:

```text
Municípios SC
      ↓
Geometrias carregadas
      ↓
Usuário troca:
População → Rendimento
      ↓
Atualizar valores/estilos
sem necessariamente baixar
novamente todas as geometrias
```

Esse princípio será especialmente importante para setores censitários.

---

# 26. Métricas de Sucesso

As principais métricas técnicas e de produto serão:

- tempo para carregamento inicial;
- tempo para troca de nível territorial;
- tempo para carregar setores de um município;
- tempo para atualização de indicador;
- quantidade de dados transferidos;
- estabilidade da renderização do mapa;
- ausência de consultas territoriais proibidas;
- capacidade do usuário de chegar de UF até Setor Censitário sem recarregar a aplicação.

---

# 27. Definição do MVP

A primeira versão deverá priorizar o seguinte núcleo:

**Mapa**

```text
UF → Município → Setor Censitário
```

**Indicadores**

```text
População
Densidade
Domicílios
Alfabetização
Etnia/Cor ou Raça
Gênero/Sexo
Faixa Etária
Rendimento
```

**Dashboard**

```text
Mapa
+
Legenda
+
2 gráficos
+
Tabela
```

**Navegação**

```text
Seletores
+
Clique
+
Duplo clique
+
Voltar nível
```

A navegação por microrregião poderá ser implementada imediatamente após o fluxo principal UF → Município → Setor estar estável, sem alterar o modelo conceitual definido neste PRD.

---

# 28. Resumo do Produto

O **GeoBrasil** será um WebGIS para exploração hierárquica dos dados do Censo 2022, combinando mapas temáticos, gráficos e tabelas.

O princípio central da aplicação será:

> **Mostrar somente o nível de detalhe necessário para o território que o usuário está explorando.**

A navegação seguirá a hierarquia territorial e evitará o carregamento indiscriminado de grandes volumes de geometrias.

A experiência principal será:

```text
Selecionar território
        ↓
Selecionar indicador
        ↓
Visualizar distribuição espacial
        ↓
Explorar mapa
        ↓
Analisar gráficos
        ↓
Consultar tabela
        ↓
Aprofundar nível territorial
```

Esse fluxo deverá orientar tanto o design da interface quanto a arquitetura do backend e do banco de dados.