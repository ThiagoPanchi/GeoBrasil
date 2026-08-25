CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    ibge_code INTEGER NOT NULL UNIQUE,
    uf CHAR(2) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    geom geometry(MultiPolygon, 4674) NOT NULL
);

CREATE TABLE municipalities (
    id SERIAL PRIMARY KEY,
    ibge_code INTEGER NOT NULL UNIQUE,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    geom geometry(MultiPolygon, 4674) NOT NULL
);

CREATE TABLE census_indicators (
    id SERIAL PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    source VARCHAR(120) NOT NULL DEFAULT 'IBGE',
    census_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE municipality_indicator_values (
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
    value NUMERIC,
    PRIMARY KEY (municipality_id, indicator_id)
);

CREATE INDEX idx_states_geom ON states USING GIST (geom);
CREATE INDEX idx_municipalities_geom ON municipalities USING GIST (geom);
CREATE INDEX idx_municipalities_state_id ON municipalities (state_id);
CREATE INDEX idx_indicator_values_indicator_id ON municipality_indicator_values (indicator_id);
