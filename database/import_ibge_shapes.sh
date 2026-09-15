#!/usr/bin/env bash
set -euo pipefail

PG_CONNECTION=${PG_CONNECTION:-"PG:dbname=geobrasil"}
PSQL_DATABASE=${PSQL_DATABASE:-"geobrasil"}
DATA_DIR=${DATA_DIR:-"data"}
EXTRACT_DIR=${EXTRACT_DIR:-"data/extracted/ibge"}
IMPORT_SECTORS=${IMPORT_SECTORS:-"false"}

mkdir -p "$EXTRACT_DIR"

unzip -o "$DATA_DIR/BR_UF_2025.zip" -d "$EXTRACT_DIR"
unzip -o "$DATA_DIR/BR_Municipios_2025.zip" -d "$EXTRACT_DIR"

ogr2ogr \
  -f PostgreSQL "$PG_CONNECTION" "$EXTRACT_DIR/BR_UF_2025.shp" \
  -nln staging_ibge_states \
  -overwrite \
  -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4674 \
  -lco GEOMETRY_NAME=geom

ogr2ogr \
  -f PostgreSQL "$PG_CONNECTION" "$EXTRACT_DIR/BR_Municipios_2025.shp" \
  -nln staging_ibge_municipalities \
  -overwrite \
  -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4674 \
  -lco GEOMETRY_NAME=geom

if [ "$IMPORT_SECTORS" = "true" ]; then
  unzip -o "$DATA_DIR/BR_setores_CD2022.zip" -d "$EXTRACT_DIR"

  ogr2ogr \
    -f PostgreSQL "$PG_CONNECTION" "$EXTRACT_DIR/BR_setores_CD2022.shp" \
    -nln staging_ibge_census_sectors \
    -overwrite \
    -nlt PROMOTE_TO_MULTI \
    -t_srs EPSG:4674 \
    -lco GEOMETRY_NAME=geom
fi

psql -d "$PSQL_DATABASE" -f database/004_import_ibge_from_staging.sql

if [ "$IMPORT_SECTORS" = "true" ]; then
  psql -d "$PSQL_DATABASE" -f database/006_import_census_sectors_from_staging.sql
fi

psql -d "$PSQL_DATABASE" -f database/005_validate_spatial_import.sql
