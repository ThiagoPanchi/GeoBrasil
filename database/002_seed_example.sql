INSERT INTO states (ibge_code, uf, name, geom)
VALUES
    (
        35,
        'SP',
        'Sao Paulo',
        ST_Multi(ST_GeomFromText('POLYGON((-53.1 -25.4, -44.1 -25.4, -44.1 -19.6, -53.1 -19.6, -53.1 -25.4))', 4674))
    ),
    (
        33,
        'RJ',
        'Rio de Janeiro',
        ST_Multi(ST_GeomFromText('POLYGON((-44.9 -23.4, -40.9 -23.4, -40.9 -20.7, -44.9 -20.7, -44.9 -23.4))', 4674))
    ),
    (
        42,
        'SC',
        'Santa Catarina',
        ST_Multi(ST_GeomFromText('POLYGON((-54.0 -29.5, -48.0 -29.5, -48.0 -25.5, -54.0 -25.5, -54.0 -29.5))', 4674))
    )
ON CONFLICT (ibge_code) DO NOTHING;

INSERT INTO microregions (ibge_code, state_id, name, geom)
VALUES
    (
        35001,
        (SELECT id FROM states WHERE uf = 'SP'),
        'Sao Paulo',
        ST_Multi(ST_GeomFromText('POLYGON((-47.3 -24.4, -45.6 -24.4, -45.6 -22.9, -47.3 -22.9, -47.3 -24.4))', 4674))
    ),
    (
        33001,
        (SELECT id FROM states WHERE uf = 'RJ'),
        'Rio de Janeiro',
        ST_Multi(ST_GeomFromText('POLYGON((-44.0 -23.3, -42.8 -23.3, -42.8 -22.5, -44.0 -22.5, -44.0 -23.3))', 4674))
    ),
    (
        42001,
        (SELECT id FROM states WHERE uf = 'SC'),
        'Florianopolis',
        ST_Multi(ST_GeomFromText('POLYGON((-49.0 -28.0, -48.2 -28.0, -48.2 -27.3, -49.0 -27.3, -49.0 -28.0))', 4674))
    )
ON CONFLICT (ibge_code) DO NOTHING;

INSERT INTO municipalities (ibge_code, state_id, name, geom)
VALUES
    (
        3550308,
        (SELECT id FROM states WHERE uf = 'SP'),
        'Sao Paulo',
        ST_Multi(ST_GeomFromText('POLYGON((-47.1 -24.2, -45.8 -24.2, -45.8 -23.1, -47.1 -23.1, -47.1 -24.2))', 4674))
    ),
    (
        3304557,
        (SELECT id FROM states WHERE uf = 'RJ'),
        'Rio de Janeiro',
        ST_Multi(ST_GeomFromText('POLYGON((-43.8 -23.2, -43.0 -23.2, -43.0 -22.6, -43.8 -22.6, -43.8 -23.2))', 4674))
    )
ON CONFLICT (ibge_code) DO NOTHING;

UPDATE municipalities
SET microregion_id = microregions.id
FROM microregions
JOIN states ON states.id = microregions.state_id
WHERE municipalities.state_id = states.id
  AND municipalities.name = microregions.name
  AND municipalities.microregion_id IS NULL;

INSERT INTO census_indicators (code, name, description, unit, census_year)
VALUES
    ('population', 'Populacao total', 'Populacao residente total do municipio.', 'habitantes', 2022),
    ('density', 'Densidade demografica', 'Habitantes por quilometro quadrado.', 'hab/km2', 2022),
    ('households', 'Domicilios', 'Total de domicilios do municipio.', 'domicilios', 2022),
    ('literacy', 'Alfabetizacao', 'Populacao alfabetizada conforme categorias do Censo 2022.', 'pessoas', 2022),
    ('race_ethnicity', 'Etnia / Cor ou Raca', 'Distribuicao populacional por cor ou raca conforme Censo 2022.', 'pessoas', 2022),
    ('gender_sex', 'Genero / Sexo', 'Distribuicao populacional por sexo conforme fonte censitaria utilizada.', 'pessoas', 2022),
    ('age_group', 'Faixa Etaria', 'Distribuicao populacional por grupos de idade.', 'pessoas', 2022),
    ('income', 'Rendimento medio', 'Rendimento medio dos responsaveis pelos domicilios.', 'BRL', 2022)
ON CONFLICT (code) DO NOTHING;

INSERT INTO municipality_indicator_values (municipality_id, indicator_id, value)
VALUES
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicators WHERE code = 'population'), 11451245),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicators WHERE code = 'density'), 7398),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicators WHERE code = 'households'), 4167900),
    ((SELECT id FROM municipalities WHERE ibge_code = 3550308), (SELECT id FROM census_indicators WHERE code = 'income'), 3240),
    ((SELECT id FROM municipalities WHERE ibge_code = 3304557), (SELECT id FROM census_indicators WHERE code = 'population'), 6211223),
    ((SELECT id FROM municipalities WHERE ibge_code = 3304557), (SELECT id FROM census_indicators WHERE code = 'density'), 5174),
    ((SELECT id FROM municipalities WHERE ibge_code = 3304557), (SELECT id FROM census_indicators WHERE code = 'households'), 2410700),
    ((SELECT id FROM municipalities WHERE ibge_code = 3304557), (SELECT id FROM census_indicators WHERE code = 'income'), 2890)
ON CONFLICT (municipality_id, indicator_id) DO NOTHING;
