INSERT INTO census_sectors (ibge_code, municipality_id, name, geom)
VALUES
    (
        355030800000001,
        (SELECT id FROM municipalities WHERE ibge_code = 3550308),
        '355030800000001',
        ST_Multi(ST_GeomFromText('POLYGON((-46.9 -24.0, -46.4 -24.0, -46.4 -23.5, -46.9 -23.5, -46.9 -24.0))', 4674))
    ),
    (
        355030800000002,
        (SELECT id FROM municipalities WHERE ibge_code = 3550308),
        '355030800000002',
        ST_Multi(ST_GeomFromText('POLYGON((-46.4 -24.0, -46.0 -24.0, -46.0 -23.5, -46.4 -23.5, -46.4 -24.0))', 4674))
    ),
    (
        330455700000001,
        (SELECT id FROM municipalities WHERE ibge_code = 3304557),
        '330455700000001',
        ST_Multi(ST_GeomFromText('POLYGON((-43.7 -23.1, -43.4 -23.1, -43.4 -22.8, -43.7 -22.8, -43.7 -23.1))', 4674))
    )
ON CONFLICT (ibge_code) DO NOTHING;

INSERT INTO census_sector_indicator_values (census_sector_id, indicator_id, value)
VALUES
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicators WHERE code = 'population'), 5800),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicators WHERE code = 'density'), 8200),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicators WHERE code = 'households'), 2100),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicators WHERE code = 'income'), 3560),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000002), (SELECT id FROM census_indicators WHERE code = 'population'), 4300),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000002), (SELECT id FROM census_indicators WHERE code = 'density'), 7600),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000002), (SELECT id FROM census_indicators WHERE code = 'households'), 1680),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000002), (SELECT id FROM census_indicators WHERE code = 'income'), 3010),
    ((SELECT id FROM census_sectors WHERE ibge_code = 330455700000001), (SELECT id FROM census_indicators WHERE code = 'population'), 5100),
    ((SELECT id FROM census_sectors WHERE ibge_code = 330455700000001), (SELECT id FROM census_indicators WHERE code = 'density'), 6900),
    ((SELECT id FROM census_sectors WHERE ibge_code = 330455700000001), (SELECT id FROM census_indicators WHERE code = 'households'), 1900),
    ((SELECT id FROM census_sectors WHERE ibge_code = 330455700000001), (SELECT id FROM census_indicators WHERE code = 'income'), 2760)
ON CONFLICT (census_sector_id, indicator_id) DO NOTHING;

INSERT INTO census_indicator_categories (indicator_id, code, name, sort_order)
VALUES
    ((SELECT id FROM census_indicators WHERE code = 'literacy'), 'literate', 'Alfabetizada', 1),
    ((SELECT id FROM census_indicators WHERE code = 'literacy'), 'illiterate', 'Nao alfabetizada', 2),
    ((SELECT id FROM census_indicators WHERE code = 'race_ethnicity'), 'white', 'Branca', 1),
    ((SELECT id FROM census_indicators WHERE code = 'race_ethnicity'), 'black', 'Preta', 2),
    ((SELECT id FROM census_indicators WHERE code = 'race_ethnicity'), 'brown', 'Parda', 3),
    ((SELECT id FROM census_indicators WHERE code = 'race_ethnicity'), 'yellow', 'Amarela', 4),
    ((SELECT id FROM census_indicators WHERE code = 'race_ethnicity'), 'indigenous', 'Indigena', 5),
    ((SELECT id FROM census_indicators WHERE code = 'gender_sex'), 'female', 'Mulheres', 1),
    ((SELECT id FROM census_indicators WHERE code = 'gender_sex'), 'male', 'Homens', 2),
    ((SELECT id FROM census_indicators WHERE code = 'age_group'), '0_14', '0 a 14 anos', 1),
    ((SELECT id FROM census_indicators WHERE code = 'age_group'), '15_64', '15 a 64 anos', 2),
    ((SELECT id FROM census_indicators WHERE code = 'age_group'), '65_plus', '65 anos ou mais', 3)
ON CONFLICT (indicator_id, code) DO NOTHING;

INSERT INTO municipality_indicator_category_values (municipality_id, category_id, value)
VALUES
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'literate' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'literacy')), 10450000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'illiterate' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'literacy')), 390000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'white' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'race_ethnicity')), 5200000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'black' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'race_ethnicity')), 980000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'brown' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'race_ethnicity')), 4700000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'yellow' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'race_ethnicity')), 180000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'indigenous' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'race_ethnicity')), 25000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'female' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'gender_sex')), 6000000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = 'male' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'gender_sex')), 5451245),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = '0_14' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'age_group')), 2100000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = '15_64' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'age_group')), 7900000),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicator_categories WHERE code = '65_plus' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'age_group')), 1451245)
ON CONFLICT (municipality_id, category_id) DO NOTHING;

INSERT INTO census_sector_indicator_category_values (census_sector_id, category_id, value)
VALUES
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicator_categories WHERE code = 'literate' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'literacy')), 5250),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicator_categories WHERE code = 'illiterate' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'literacy')), 220),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicator_categories WHERE code = 'female' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'gender_sex')), 3050),
    ((SELECT id FROM census_sectors WHERE ibge_code = 355030800000001), (SELECT id FROM census_indicator_categories WHERE code = 'male' AND indicator_id = (SELECT id FROM census_indicators WHERE code = 'gender_sex')), 2750)
ON CONFLICT (census_sector_id, category_id) DO NOTHING;
