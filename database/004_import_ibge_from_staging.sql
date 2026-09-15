INSERT INTO states (ibge_code, uf, name, geom)
SELECT
    cd_uf::INTEGER AS ibge_code,
    sigla_uf AS uf,
    nm_uf AS name,
    ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))::geometry(MultiPolygon, 4674) AS geom
FROM staging_ibge_states
ON CONFLICT (ibge_code) DO UPDATE
SET
    uf = EXCLUDED.uf,
    name = EXCLUDED.name,
    geom = EXCLUDED.geom;

INSERT INTO municipalities (ibge_code, state_id, name, geom)
SELECT
    municipalities_staging.cd_mun::INTEGER AS ibge_code,
    states.id AS state_id,
    municipalities_staging.nm_mun AS name,
    ST_Multi(ST_CollectionExtract(ST_MakeValid(municipalities_staging.geom), 3))::geometry(MultiPolygon, 4674) AS geom
FROM staging_ibge_municipalities AS municipalities_staging
JOIN states ON states.ibge_code = municipalities_staging.cd_uf::INTEGER
ON CONFLICT (ibge_code) DO UPDATE
SET
    state_id = EXCLUDED.state_id,
    name = EXCLUDED.name,
    geom = EXCLUDED.geom;
