import argparse
import csv
import io
import os
import zipfile
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

import psycopg
from psycopg.rows import dict_row


DEFAULT_DATABASE_URL = "postgresql://postgres:123456@localhost:5434/geobrasil"
DATA_DIR = Path("data")
BATCH_SIZE = 5000

BASIC_ZIP = DATA_DIR / "Agregados_por_setores_basico_BR_20260520.zip"
DEMOGRAPHY_ZIP = DATA_DIR / "Agregados_por_setores_demografia_BR.zip"
LITERACY_ZIP = DATA_DIR / "Agregados_por_setores_alfabetizacao_BR.zip"
RACE_ZIP = DATA_DIR / "Agregados_por_setores_cor_ou_raca_BR.zip"
INCOME_ZIP = DATA_DIR / "Agregados_por_setores_renda_responsavel_BR_20260508_csv.zip"

MALE_LITERATE_COLUMNS = [f"V{value:05d}" for value in range(826, 839)]
FEMALE_LITERATE_COLUMNS = [f"V{value:05d}" for value in range(839, 852)]

INDICATORS = [
    ("population", "Total de Pessoas", "Pessoas", "V0001"),
    ("households", "Total de Domicilios", "Domicilios", "V0002"),
    ("density", "Densidade Demografica", "Pessoas/km2", "V0001 / AREA_KM2"),
    ("literacy", "Alfabetizacao", "Pessoas", "Indicador categorico de alfabetizacao"),
    ("race_ethnicity", "Etnia/Cor ou Raca", "Pessoas", "Indicador categorico de cor ou raca"),
    ("gender_sex", "Genero/Sexo", "Pessoas", "Indicador categorico de sexo"),
    ("age_group", "Faixa Etaria", "Pessoas", "Indicador categorico de faixa etaria"),
    ("age_children", "Criancas (0 a 14 anos)", "Pessoas", "V01031 + V01032 + V01033"),
    ("age_youth", "Jovens (15 a 19 anos)", "Pessoas", "V01034"),
    ("age_adults", "Adultos (20 a 59 anos)", "Pessoas", "V01035 + V01036 + V01037 + V01038 + V01039"),
    ("age_elderly", "Idosos (60 anos ou mais)", "Pessoas", "V01040 + V01041"),
    ("male_population", "Quantidade de Pessoas Sexo Masculino", "Pessoas", "V01007"),
    ("female_population", "Quantidade de Pessoas Sexo Feminino", "Pessoas", "V01008"),
    ("literate_male", "Homens Alfabetizados", "Pessoas", "V00826 a V00838"),
    ("literate_female", "Mulheres Alfabetizadas", "Pessoas", "V00839 a V00851"),
    ("literate_total", "Total de Alfabetizados", "Pessoas", "Homens + mulheres alfabetizadas"),
    ("illiterate_male", "Homens Analfabetos", "Pessoas", "Homens - homens alfabetizados"),
    ("illiterate_female", "Mulheres Analfabetas", "Pessoas", "Mulheres - mulheres alfabetizadas"),
    ("illiterate_total", "Total de Analfabetos", "Pessoas", "Total de pessoas - total alfabetizados"),
    ("race_white", "Cor ou raca branca", "Pessoas", "V01317"),
    ("race_black", "Cor ou raca preta", "Pessoas", "V01318"),
    ("race_yellow", "Cor ou raca amarela", "Pessoas", "V01319"),
    ("race_brown", "Cor ou raca parda", "Pessoas", "V01320"),
    ("race_indigenous", "Cor ou raca indigena", "Pessoas", "V01321"),
    ("income", "Rendimento Medio Mensal Por Domicilio Particular", "R$", "V06004"),
    ("income_avg_household", "Rendimento Medio Mensal Por Domicilio Particular", "R$", "V06004"),
]

PROFILE_INDICATOR_COLUMNS = {
    "population": "total_pessoas",
    "households": "total_domicilios",
    "density": "densidade_demografica",
    "age_children": "criancas_0_14",
    "age_youth": "jovens_15_19",
    "age_adults": "adultos_20_59",
    "age_elderly": "idosos_60_mais",
    "male_population": "sexo_masculino",
    "female_population": "sexo_feminino",
    "literate_male": "homens_alfabetizados",
    "literate_female": "mulheres_alfabetizadas",
    "literate_total": "total_alfabetizados",
    "illiterate_male": "homens_analfabetos",
    "illiterate_female": "mulheres_analfabetas",
    "illiterate_total": "total_analfabetos",
    "race_white": "raca_branca",
    "race_black": "raca_preta",
    "race_yellow": "raca_amarela",
    "race_brown": "raca_parda",
    "race_indigenous": "raca_indigena",
    "income": "rendimento_medio_mensal_domicilio_particular",
    "income_avg_household": "rendimento_medio_mensal_domicilio_particular",
}

ADDITIVE_INDICATORS = [code for code in PROFILE_INDICATOR_COLUMNS if code not in {"density", "income", "income_avg_household"}]


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa agregados quantitativos do Censo por setor.")
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL))
    args = parser.parse_args()

    with psycopg.connect(args.database_url, row_factory=dict_row) as connection:
        ensure_schema(connection)
        upsert_indicators(connection)
        connection.commit()

        print("Importando basico...")
        print(import_basic(connection), "setores processados")
        connection.commit()

        print("Importando demografia...")
        print(import_demography(connection), "setores processados")
        connection.commit()

        print("Importando alfabetizacao...")
        print(import_literacy(connection), "setores processados")
        finalize_literacy(connection)
        connection.commit()

        print("Importando cor/raca...")
        print(import_race(connection), "setores processados")
        connection.commit()

        print("Importando renda...")
        print(import_income(connection), "setores processados")
        connection.commit()

        print("Vinculando setores e preenchendo indicadores...")
        link_sector_ids(connection)
        populate_sector_indicator_values(connection)
        populate_territorial_aggregates(connection)
        connection.commit()

        print_summary(connection)


def ensure_schema(connection: psycopg.Connection) -> None:
    connection.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS census_sector_profile (
            cd_setor BIGINT PRIMARY KEY,
            census_sector_id INTEGER REFERENCES census_sectors(id) ON DELETE SET NULL,
            situacao TEXT,
            cd_sit INTEGER,
            area_km2 NUMERIC,
            cd_dist BIGINT,
            nm_dist TEXT,
            cd_mun INTEGER,
            nm_mun TEXT,
            cd_rgi INTEGER,
            nm_rgi TEXT,
            cd_uf INTEGER,
            nm_uf TEXT,
            total_pessoas NUMERIC,
            total_domicilios NUMERIC,
            densidade_demografica NUMERIC,
            criancas_0_14 NUMERIC,
            jovens_15_19 NUMERIC,
            adultos_20_59 NUMERIC,
            idosos_60_mais NUMERIC,
            sexo_masculino NUMERIC,
            sexo_feminino NUMERIC,
            homens_alfabetizados NUMERIC,
            mulheres_alfabetizadas NUMERIC,
            homens_analfabetos NUMERIC,
            mulheres_analfabetas NUMERIC,
            total_alfabetizados NUMERIC,
            total_analfabetos NUMERIC,
            raca_branca NUMERIC,
            raca_preta NUMERIC,
            raca_amarela NUMERIC,
            raca_parda NUMERIC,
            raca_indigena NUMERIC,
            rendimento_medio_mensal_domicilio_particular NUMERIC,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    connection.execute("CREATE INDEX IF NOT EXISTS idx_sector_profile_census_sector_id ON census_sector_profile (census_sector_id)")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_sector_profile_cd_mun ON census_sector_profile (cd_mun)")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_sector_profile_cd_rgi ON census_sector_profile (cd_rgi)")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_sector_profile_cd_uf ON census_sector_profile (cd_uf)")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS census_sector_indicator_values (
            census_sector_id INTEGER NOT NULL REFERENCES census_sectors(id) ON DELETE CASCADE,
            indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
            value NUMERIC,
            PRIMARY KEY (census_sector_id, indicator_id)
        )
        """
    )
    connection.execute("CREATE INDEX IF NOT EXISTS idx_sector_indicator_values_indicator_id ON census_sector_indicator_values (indicator_id)")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS states_indicator_values (
            state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
            indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
            value NUMERIC,
            PRIMARY KEY (state_id, indicator_id)
        )
        """
    )
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS microregions_indicator_values (
            microregion_id INTEGER NOT NULL REFERENCES microregions(id) ON DELETE CASCADE,
            indicator_id INTEGER NOT NULL REFERENCES census_indicators(id) ON DELETE CASCADE,
            value NUMERIC,
            PRIMARY KEY (microregion_id, indicator_id)
        )
        """
    )
    connection.execute("CREATE INDEX IF NOT EXISTS idx_state_indicator_values_indicator_id ON states_indicator_values (indicator_id)")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_microregion_indicator_values_indicator_id ON microregions_indicator_values (indicator_id)")


def upsert_indicators(connection: psycopg.Connection) -> None:
    with connection.cursor() as cursor:
        cursor.executemany(
            """
            INSERT INTO census_indicators (code, name, description, unit, source, census_year)
            VALUES (%s, %s, %s, %s, 'IBGE Censo 2022', 2022)
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                unit = EXCLUDED.unit,
                source = EXCLUDED.source,
                census_year = EXCLUDED.census_year
            """,
            [(code, name, description, unit) for code, name, unit, description in INDICATORS],
        )


def import_basic(connection: psycopg.Connection) -> int:
    statement = """
        INSERT INTO census_sector_profile (
            cd_setor, situacao, cd_sit, area_km2, cd_dist, nm_dist, cd_mun, nm_mun,
            cd_rgi, nm_rgi, cd_uf, nm_uf, total_pessoas, total_domicilios, densidade_demografica, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
        ON CONFLICT (cd_setor) DO UPDATE SET
            situacao = EXCLUDED.situacao,
            cd_sit = EXCLUDED.cd_sit,
            area_km2 = EXCLUDED.area_km2,
            cd_dist = EXCLUDED.cd_dist,
            nm_dist = EXCLUDED.nm_dist,
            cd_mun = EXCLUDED.cd_mun,
            nm_mun = EXCLUDED.nm_mun,
            cd_rgi = EXCLUDED.cd_rgi,
            nm_rgi = EXCLUDED.nm_rgi,
            cd_uf = EXCLUDED.cd_uf,
            nm_uf = EXCLUDED.nm_uf,
            total_pessoas = EXCLUDED.total_pessoas,
            total_domicilios = EXCLUDED.total_domicilios,
            densidade_demografica = EXCLUDED.densidade_demografica,
            updated_at = now()
    """
    return run_batches(connection, statement, basic_rows())


def import_demography(connection: psycopg.Connection) -> int:
    statement = """
        UPDATE census_sector_profile SET
            sexo_masculino = %s,
            sexo_feminino = %s,
            criancas_0_14 = %s,
            jovens_15_19 = %s,
            adultos_20_59 = %s,
            idosos_60_mais = %s,
            updated_at = now()
        WHERE cd_setor = %s
    """
    return run_batches(connection, statement, demography_rows())


def import_literacy(connection: psycopg.Connection) -> int:
    statement = """
        UPDATE census_sector_profile SET
            homens_alfabetizados = %s,
            mulheres_alfabetizadas = %s,
            total_alfabetizados = %s,
            updated_at = now()
        WHERE cd_setor = %s
    """
    return run_batches(connection, statement, literacy_rows())


def finalize_literacy(connection: psycopg.Connection) -> None:
    connection.execute(
        """
        UPDATE census_sector_profile SET
            homens_analfabetos = GREATEST(COALESCE(sexo_masculino, 0) - COALESCE(homens_alfabetizados, 0), 0),
            mulheres_analfabetas = GREATEST(COALESCE(sexo_feminino, 0) - COALESCE(mulheres_alfabetizadas, 0), 0),
            total_analfabetos = GREATEST(COALESCE(total_pessoas, 0) - COALESCE(total_alfabetizados, 0), 0),
            updated_at = now()
        WHERE homens_alfabetizados IS NOT NULL OR mulheres_alfabetizadas IS NOT NULL
        """
    )


def import_race(connection: psycopg.Connection) -> int:
    statement = """
        UPDATE census_sector_profile SET
            raca_branca = %s,
            raca_preta = %s,
            raca_amarela = %s,
            raca_parda = %s,
            raca_indigena = %s,
            updated_at = now()
        WHERE cd_setor = %s
    """
    return run_batches(connection, statement, race_rows())


def import_income(connection: psycopg.Connection) -> int:
    statement = """
        UPDATE census_sector_profile SET
            rendimento_medio_mensal_domicilio_particular = %s,
            updated_at = now()
        WHERE cd_setor = %s
    """
    return run_batches(connection, statement, income_rows())


def link_sector_ids(connection: psycopg.Connection) -> None:
    connection.execute(
        """
        UPDATE census_sector_profile p
        SET census_sector_id = cs.id
        FROM census_sectors cs
        WHERE cs.ibge_code = p.cd_setor
        """
    )


def populate_sector_indicator_values(connection: psycopg.Connection) -> None:
    for indicator_code, profile_column in PROFILE_INDICATOR_COLUMNS.items():
        connection.execute(
            f"""
            INSERT INTO census_sector_indicator_values (census_sector_id, indicator_id, value)
            SELECT p.census_sector_id, ci.id, p.{profile_column}
            FROM census_sector_profile p
            JOIN census_indicators ci ON ci.code = %s
            WHERE p.census_sector_id IS NOT NULL AND p.{profile_column} IS NOT NULL
            ON CONFLICT (census_sector_id, indicator_id) DO UPDATE SET value = EXCLUDED.value
            """,
            (indicator_code,),
        )


def populate_territorial_aggregates(connection: psycopg.Connection) -> None:
    connection.execute("DELETE FROM municipality_indicator_values WHERE indicator_id IN (SELECT id FROM census_indicators WHERE code = ANY(%s))", ([code for code, *_ in INDICATORS],))
    connection.execute("DELETE FROM states_indicator_values WHERE indicator_id IN (SELECT id FROM census_indicators WHERE code = ANY(%s))", ([code for code, *_ in INDICATORS],))
    connection.execute("DELETE FROM microregions_indicator_values WHERE indicator_id IN (SELECT id FROM census_indicators WHERE code = ANY(%s))", ([code for code, *_ in INDICATORS],))

    for indicator_code in ADDITIVE_INDICATORS:
        profile_column = PROFILE_INDICATOR_COLUMNS[indicator_code]
        insert_municipality_sum(connection, indicator_code, f"SUM(COALESCE(p.{profile_column}, 0))")
        insert_state_sum(connection, indicator_code, f"SUM(COALESCE(p.{profile_column}, 0))")
        insert_microregion_sum(connection, indicator_code, f"SUM(COALESCE(p.{profile_column}, 0))")

    insert_municipality_sum(
        connection,
        "density",
        "CASE WHEN SUM(COALESCE(p.area_km2, 0)) > 0 THEN SUM(COALESCE(p.total_pessoas, 0)) / SUM(COALESCE(p.area_km2, 0)) END",
    )
    insert_state_sum(
        connection,
        "density",
        "CASE WHEN SUM(COALESCE(p.area_km2, 0)) > 0 THEN SUM(COALESCE(p.total_pessoas, 0)) / SUM(COALESCE(p.area_km2, 0)) END",
    )
    insert_microregion_sum(
        connection,
        "density",
        "CASE WHEN SUM(COALESCE(p.area_km2, 0)) > 0 THEN SUM(COALESCE(p.total_pessoas, 0)) / SUM(COALESCE(p.area_km2, 0)) END",
    )

    income_expression = """
        CASE
            WHEN SUM(COALESCE(p.total_domicilios, 0)) > 0
                THEN SUM(COALESCE(p.rendimento_medio_mensal_domicilio_particular, 0) * COALESCE(p.total_domicilios, 0)) / SUM(COALESCE(p.total_domicilios, 0))
        END
    """
    for indicator_code in ("income", "income_avg_household"):
        insert_municipality_sum(connection, indicator_code, income_expression)
        insert_state_sum(connection, indicator_code, income_expression)
        insert_microregion_sum(connection, indicator_code, income_expression)


def insert_municipality_sum(connection: psycopg.Connection, indicator_code: str, expression: str) -> None:
    connection.execute(
        f"""
        INSERT INTO municipality_indicator_values (municipality_id, indicator_id, value)
        SELECT m.id, ci.id, {expression}
        FROM municipalities m
        JOIN census_sector_profile p ON p.cd_mun = m.ibge_code
        JOIN census_indicators ci ON ci.code = %s
        GROUP BY m.id, ci.id
        ON CONFLICT (municipality_id, indicator_id) DO UPDATE SET value = EXCLUDED.value
        """,
        (indicator_code,),
    )


def insert_state_sum(connection: psycopg.Connection, indicator_code: str, expression: str) -> None:
    connection.execute(
        f"""
        INSERT INTO states_indicator_values (state_id, indicator_id, value)
        SELECT s.id, ci.id, {expression}
        FROM states s
        JOIN census_sector_profile p ON p.cd_uf = s.ibge_code
        JOIN census_indicators ci ON ci.code = %s
        GROUP BY s.id, ci.id
        ON CONFLICT (state_id, indicator_id) DO UPDATE SET value = EXCLUDED.value
        """,
        (indicator_code,),
    )


def insert_microregion_sum(connection: psycopg.Connection, indicator_code: str, expression: str) -> None:
    connection.execute(
        f"""
        INSERT INTO microregions_indicator_values (microregion_id, indicator_id, value)
        SELECT mr.id, ci.id, {expression}
        FROM microregions mr
        JOIN census_sector_profile p ON p.cd_rgi = mr.ibge_code
        JOIN census_indicators ci ON ci.code = %s
        GROUP BY mr.id, ci.id
        ON CONFLICT (microregion_id, indicator_id) DO UPDATE SET value = EXCLUDED.value
        """,
        (indicator_code,),
    )


def basic_rows() -> Iterable[tuple[Any, ...]]:
    for row in csv_rows(BASIC_ZIP):
        area = numeric(row.get("AREA_KM2"))
        population = numeric(row.get("v0001"))
        density = population / area if population is not None and area and area > 0 else None
        yield (
            integer(row.get("CD_SETOR")),
            row.get("SITUACAO"),
            integer(row.get("CD_SIT")),
            area,
            integer(row.get("CD_DIST")),
            row.get("NM_DIST"),
            integer(row.get("CD_MUN")),
            row.get("NM_MUN"),
            integer(row.get("CD_RGI")),
            row.get("NM_RGI"),
            integer(row.get("CD_UF")),
            row.get("NM_UF"),
            population,
            numeric(row.get("v0002")),
            density,
        )


def demography_rows() -> Iterable[tuple[Any, ...]]:
    for row in csv_rows(DEMOGRAPHY_ZIP):
        yield (
            numeric(row.get("V01007")),
            numeric(row.get("V01008")),
            sum_values(row, ["V01031", "V01032", "V01033"]),
            numeric(row.get("V01034")),
            sum_values(row, ["V01035", "V01036", "V01037", "V01038", "V01039"]),
            sum_values(row, ["V01040", "V01041"]),
            integer(row.get("CD_setor")),
        )


def literacy_rows() -> Iterable[tuple[Any, ...]]:
    for row in csv_rows(LITERACY_ZIP):
        male_literate = sum_values(row, MALE_LITERATE_COLUMNS)
        female_literate = sum_values(row, FEMALE_LITERATE_COLUMNS)
        total_literate = (male_literate or Decimal(0)) + (female_literate or Decimal(0))
        yield (male_literate, female_literate, total_literate, integer(row.get("CD_setor")))


def race_rows() -> Iterable[tuple[Any, ...]]:
    for row in csv_rows(RACE_ZIP):
        yield (
            numeric(row.get("V01317")),
            numeric(row.get("V01318")),
            numeric(row.get("V01319")),
            numeric(row.get("V01320")),
            numeric(row.get("V01321")),
            integer(row.get("CD_SETOR")),
        )


def income_rows() -> Iterable[tuple[Any, ...]]:
    for row in csv_rows(INCOME_ZIP):
        yield (numeric(row.get("V06004")), integer(row.get("CD_SETOR")))


def csv_rows(zip_path: Path) -> Iterable[dict[str, str]]:
    with zipfile.ZipFile(zip_path) as archive:
        names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
        if not names:
            raise RuntimeError(f"Nenhum CSV encontrado em {zip_path}")
        with archive.open(names[0]) as stream:
            text = io.TextIOWrapper(stream, encoding="utf-8", errors="replace", newline="")
            yield from csv.DictReader(text, delimiter=";")


def run_batches(connection: psycopg.Connection, statement: str, rows: Iterable[tuple[Any, ...]]) -> int:
    count = 0
    batch = []
    with connection.cursor() as cursor:
        for row in rows:
            if row[-1] is None and "WHERE cd_setor" in statement:
                continue
            batch.append(row)
            if len(batch) >= BATCH_SIZE:
                cursor.executemany(statement, batch)
                count += len(batch)
                batch.clear()
        if batch:
            cursor.executemany(statement, batch)
            count += len(batch)
    return count


def numeric(value: str | None) -> Decimal | None:
    if value is None:
        return None
    cleaned = value.strip().strip('"')
    if cleaned in {"", ".", "X", "x"}:
        return None
    cleaned = cleaned.replace(".", "") if "," in cleaned else cleaned
    cleaned = cleaned.replace(",", ".")
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def integer(value: str | None) -> int | None:
    number = numeric(value)
    return int(number) if number is not None else None


def sum_values(row: dict[str, str], columns: list[str]) -> Decimal | None:
    values = [numeric(row.get(column)) for column in columns]
    values = [value for value in values if value is not None]
    if not values:
        return None
    return sum(values, Decimal(0))


def print_summary(connection: psycopg.Connection) -> None:
    queries = [
        ("Perfis por setor", "SELECT COUNT(*) AS count FROM census_sector_profile"),
        ("Perfis vinculados a census_sectors", "SELECT COUNT(*) AS count FROM census_sector_profile WHERE census_sector_id IS NOT NULL"),
        ("Indicadores", "SELECT COUNT(*) AS count FROM census_indicators"),
        ("Valores por setor", "SELECT COUNT(*) AS count FROM census_sector_indicator_values"),
        ("Valores por municipio", "SELECT COUNT(*) AS count FROM municipality_indicator_values"),
        ("Valores por UF", "SELECT COUNT(*) AS count FROM states_indicator_values"),
        ("Valores por microrregiao", "SELECT COUNT(*) AS count FROM microregions_indicator_values"),
    ]
    for label, query in queries:
        print(f"{label}: {connection.execute(query).fetchone()['count']}")


if __name__ == "__main__":
    main()
