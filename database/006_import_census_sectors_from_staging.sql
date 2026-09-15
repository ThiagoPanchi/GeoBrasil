INSERT INTO census_sectors (ibge_code, municipality_id, name, geom)
SELECT
    sectors_staging.cd_setor::BIGINT AS ibge_code,
    municipalities.id AS municipality_id,
    sectors_staging.cd_setor AS name,
    ST_Multi(ST_CollectionExtract(ST_MakeValid(sectors_staging.geom), 3))::geometry(MultiPolygon, 4674) AS geom
FROM staging_ibge_census_sectors AS sectors_staging
JOIN municipalities ON municipalities.ibge_code = sectors_staging.cd_mun::INTEGER
ON CONFLICT (ibge_code) DO UPDATE
SET
    municipality_id = EXCLUDED.municipality_id,
    name = EXCLUDED.name,
    geom = EXCLUDED.geom;
