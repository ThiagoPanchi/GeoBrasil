## Why

The project needs a repeatable static-data preparation step that converts raw CNEFE address CSV files inside UF ZIP archives into browser-consumable FlatGeoBuf point assets. Preparing these assets by municipality makes the address points align with the existing static WebGIS pattern and allows later joining or filtering by census sector through `COD_SETOR`.

## What Changes

- Add a script that reads CNEFE ZIP files from `data/CNEFE/` and extracts CSV rows with `LATITUDE` and `LONGITUDE` point coordinates.
- Partition output FlatGeoBuf point assets by `COD_MUNICIPIO` under `public/geodata/cnefe/`.
- Preserve only the required output properties: `COD_SETOR`, `ENDERECO_COMPLETO`, `DSC_ESTABELECIMENTO`, decoded species/indicator fields, and any minimal municipality identifier needed for partitioning.
- Build `ENDERECO_COMPLETO` by concatenating `CEP`, `DSC_LOCALIDADE`, `NOM_TIPO_SEGLOGR`, `NOM_TITULO_SEGLOGR`, `NOM_SEGLOGR`, and `NUM_ENDERECO`, then omit those source columns from the output feature properties.
- Decode the requested CNEFE code columns into human-readable output fields and omit other unmentioned source columns.
- Support validating the script with the lightweight sample input `data/CNEFE/14_RR.zip` when that file exists.
- Process large UF inputs, including PA, without decoding an entire CSV into one JavaScript string or hitting Node's maximum string length.
- Process complete CNEFE runs one UF at a time, writing each UF's municipality outputs before moving to the next ZIP so previously processed UFs are not retained in memory.
- Keep memory bounded even when one UF or municipality is too large to fit in Node's heap by streaming decompression/parsing and writing partitioned output parts instead of one giant in-memory feature collection.
- Preserve existing outputs when a maintainer targets one ZIP explicitly, replacing only the municipality files generated from that ZIP instead of deleting the entire CNEFE output directory.
- Provide clear execution instructions for running the script.

## Capabilities

### New Capabilities
- `cnefe-address-geodata`: preparation of CNEFE address point FlatGeoBuf assets from zipped CSV sources.

### Modified Capabilities
- None.

## Impact

- A new script is expected under `scripts/`, using streaming decompression/parsing, bounded batches, and partitioned output flushing for large CNEFE ZIPs while reusing existing geodata conventions where practical.
- `package.json` may add a convenience script command for CNEFE preparation.
- Generated assets will be written under `public/geodata/cnefe/` but raw `data/CNEFE/*.zip` inputs remain outside the published bundle unless explicitly consumed.
- No frontend UI behavior, existing census sector assets, indicator catalog, or territorial manifest behavior is expected to change in this scope.
