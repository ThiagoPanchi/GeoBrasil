CREATE TABLE IF NOT EXISTS microregions (
    id SERIAL PRIMARY KEY,
    ibge_code INTEGER NOT NULL UNIQUE,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    geom geometry(MultiPolygon, 4674) NOT NULL
);

ALTER TABLE municipalities
ADD COLUMN IF NOT EXISTS microregion_id INTEGER REFERENCES microregions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_microregions_geom ON microregions USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_microregions_state_id ON microregions (state_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_microregion_id ON municipalities (microregion_id);
