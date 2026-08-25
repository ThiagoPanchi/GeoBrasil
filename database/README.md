# Banco De Dados

Scripts iniciais para configurar o PostgreSQL com PostGIS.

## Arquivos

- `001_schema.sql`: cria a extensao PostGIS, tabelas, relacionamentos e indices.
- `002_seed_example.sql`: insere dados simplificados de exemplo para testes locais.

## Ordem de execucao

```bash
psql -d geobrasil -f database/001_schema.sql
psql -d geobrasil -f database/002_seed_example.sql
```

## Modelo inicial

- `states`: estados brasileiros com geometria `MultiPolygon` em SIRGAS 2000, SRID 4674.
- `municipalities`: municipios relacionados a estados, tambem com geometria `MultiPolygon` em SRID 4674.
- `census_indicators`: catalogo de indicadores censitarios.
- `municipality_indicator_values`: valores dos indicadores por municipio.

Os dados de `002_seed_example.sql` sao apenas exemplos. As malhas oficiais e os dados reais do Censo serao importados em etapa posterior.
