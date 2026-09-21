# Organizacao Dos Dados IBGE

Os arquivos brutos do IBGE ficam em `data/` como insumos locais. Apenas os FlatGeobuf simplificados usados pelo gerador estatico devem ser preservados como fonte do fluxo atual.

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
├── FlatGeoBuf/
│   ├── BR_UF_2025_simp.fgb
│   ├── BR_Municipios_2025_simp.fgb
│   ├── BR_Microrregioes_2022_simp.fgb
│   └── BR_setores_CD2022_simp.fgb
├── BR_UF_2025.zip          # bruto local, nao publicado
├── BR_Municipios_2025.zip  # bruto local, nao publicado
└── BR_setores_CD2022.zip   # bruto local, nao publicado
```

Arquivos brutos e extracoes intermediarias continuam locais. O build publicado consome somente os assets gerados em `frontend/public/geodata/`.

## Assets estaticos gerados

- `frontend/public/geodata/ufs.fgb`: camada inicial de UFs.
- `frontend/public/geodata/municipalities/<UF>.fgb`: municipios particionados por UF.
- `frontend/public/geodata/microregions/<UF>.fgb`: microrregioes particionadas por UF.
- `frontend/public/geodata/sectors/<CD_MUN>.fgb`: setores particionados por municipio.
- `frontend/public/geodata/manifest.json`: catalogo usado pelo navegador para resolver os assets.

## Fluxo de preparacao

1. Atualizar os arquivos `data/FlatGeoBuf/*_simp.fgb` quando houver nova fonte tratada.
2. Rodar `npm run prepare:geodata` em `frontend/`.
3. Conferir `frontend/public/geodata/manifest.json` e os arquivos `.fgb` gerados.
4. Rodar `npm run build:static` para produzir `frontend/dist`.
