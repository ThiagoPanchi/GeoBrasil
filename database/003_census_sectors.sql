CREATE TABLE IF NOT EXISTS census_sectors (
    id SERIAL PRIMARY KEY,
    ibge_code BIGINT NOT NULL UNIQUE,
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    name VARCHAR(150),
    geom geometry(MultiPolygon, 4674) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_census_sectors_municipality_id ON census_sectors (municipality_id);
CREATE INDEX IF NOT EXISTS idx_census_sectors_geom ON census_sectors USING GIST (geom);
