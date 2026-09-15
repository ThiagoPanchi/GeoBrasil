SELECT 'states' AS table_name, count(*) AS total FROM states;

SELECT 'municipalities' AS table_name, count(*) AS total FROM municipalities;

SELECT 'census_sectors' AS table_name, count(*) AS total FROM census_sectors;

SELECT
    states.uf,
    count(municipalities.id) AS municipalities_total
FROM states
LEFT JOIN municipalities ON municipalities.state_id = states.id
GROUP BY states.uf
ORDER BY states.uf;

SELECT
    municipalities.ibge_code,
    municipalities.name,
    count(census_sectors.id) AS sectors_total
FROM municipalities
LEFT JOIN census_sectors ON census_sectors.municipality_id = municipalities.id
GROUP BY municipalities.id
ORDER BY sectors_total DESC, municipalities.name
LIMIT 20;
