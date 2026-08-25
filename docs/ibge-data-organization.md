# Organizacao Dos Dados IBGE

Os arquivos brutos do IBGE ficam em `data/`, que nao deve ser versionada no Git.

## Malhas territoriais iniciais

- `data/BR_UF_2025.zip`: malha territorial das UFs do Brasil.
- `data/BR_Municipios_2025.zip`: malha territorial dos municipios do Brasil.
- `data/BR_setores_CD2022.zip`: malha territorial dos setores censitarios do Censo 2022.

## Regra de carregamento no WebGIS

- A camada de UFs pode ser carregada inicialmente para mostrar o Brasil.
- A camada de municipios so deve ser carregada depois que o usuario selecionar uma UF.
- A camada de setores censitarios so deve ser carregada depois que o usuario selecionar um municipio.

Essa regra evita carregar geometrias muito pesadas no navegador e mantem a aplicacao responsiva.

## Organizacao logica dos dados

```text
data/
├── BR_UF_2025.zip
├── BR_Municipios_2025.zip
├── BR_setores_CD2022.zip
├── agregados-censo/        # arquivos tabulares do Censo, quando forem extraidos
├── extracted/              # arquivos extraidos localmente
└── processed/              # dados tratados para importacao no banco
```

As subpastas acima sao uma convencao local. Como `data/` esta no `.gitignore`, elas nao precisam ser versionadas.

## Modelo espacial esperado

- `states`: recebe a malha `BR_UF_2025.zip`.
- `municipalities`: recebe a malha `BR_Municipios_2025.zip` e se relaciona com `states`.
- `census_sectors`: recebe a malha `BR_setores_CD2022.zip` e se relaciona com `municipalities`.

## Fluxo futuro de importacao

1. Extrair os arquivos `.zip` em `data/extracted/`.
2. Conferir os nomes dos campos de codigo IBGE em cada malha.
3. Importar UFs para `states`.
4. Importar municipios para `municipalities`.
5. Importar setores censitarios para `census_sectors`.
6. Criar endpoints para consultar setores por municipio.

## Endpoints futuros para setores

Quando o backend estiver conectado ao PostGIS, o carregamento dos setores deve seguir este padrao:

```text
GET /municipalities/{municipality_id}/sectors
```

Esse endpoint deve retornar apenas os setores censitarios do municipio selecionado, preferencialmente em GeoJSON ou em tiles vetoriais em uma etapa posterior.
