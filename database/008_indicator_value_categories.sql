CREATE TABLE IF NOT EXISTS census_indicator_categories (
    id SERIAL PRIMARY KEY,
    indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(200) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (indicator_id, code)
);

CREATE TABLE IF NOT EXISTS census_sector_indicator_values (
    census_sector_id INTEGER NOT NULL REFERENCES census_sectors(id) ON DELETE CASCADE,
    indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
    value NUMERIC,
    PRIMARY KEY (census_sector_id, indicator_id)
);

CREATE TABLE IF NOT EXISTS municipality_indicator_category_values (
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES census_indicator_categories(id) ON DELETE CASCADE,
    value NUMERIC,
    PRIMARY KEY (municipality_id, category_id)
);

CREATE TABLE IF NOT EXISTS census_sector_indicator_category_values (
    census_sector_id INTEGER NOT NULL REFERENCES census_sectors(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES census_indicator_categories(id) ON DELETE CASCADE,
    value NUMERIC,
    PRIMARY KEY (census_sector_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_indicator_categories_indicator_id ON census_indicator_categories (indicator_id);
CREATE INDEX IF NOT EXISTS idx_sector_indicator_values_indicator_id ON census_sector_indicator_values (indicator_id);
CREATE INDEX IF NOT EXISTS idx_municipality_category_values_category_id ON municipality_indicator_category_values (category_id);
CREATE INDEX IF NOT EXISTS idx_sector_category_values_category_id ON census_sector_indicator_category_values (category_id);
