import json
import os
import urllib.request
import gzip

import psycopg
from psycopg.rows import dict_row


DEFAULT_DATABASE_URL = "postgresql://postgres:123456@localhost:5434/geobrasil"
STATES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
MUNICIPALITIES_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"


def main() -> None:
    database_url = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
    states = fetch_json(STATES_URL)
    municipalities = fetch_json(MUNICIPALITIES_URL)

    with psycopg.connect(database_url, row_factory=dict_row) as connection:
        updated_states = update_states(connection, states)
        updated_municipalities = update_municipalities(connection, municipalities)
        updated_special_areas = update_special_operational_areas(connection)
        updated_profile_ufs = update_sector_profile_ufs(connection)
        updated_profile_municipalities = update_sector_profile_municipalities(connection)
        updated_profile_microregions = update_sector_profile_microregions(connection)
        connection.commit()

        print(f"Estados atualizados: {updated_states}")
        print(f"Municipios atualizados: {updated_municipalities}")
        print(f"Areas operacionais especiais atualizadas: {updated_special_areas}")
        print(f"Perfis setoriais com UF atualizada: {updated_profile_ufs}")
        print(f"Perfis setoriais com municipio atualizado: {updated_profile_municipalities}")
        print(f"Perfis setoriais com microrregiao atualizada: {updated_profile_microregions}")
        print_remaining_problems(connection)


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": "GeoBrasil/0.1", "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(request, timeout=120) as response:
        body = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            body = gzip.decompress(body)
        return json.loads(body.decode("utf-8"))


def update_states(connection: psycopg.Connection, states: list[dict]) -> int:
    before = connection.info.transaction_status
    with connection.cursor() as cursor:
        cursor.executemany(
            """
            UPDATE states
            SET name = %s, uf = %s
            WHERE ibge_code = %s
            """,
            [(state["nome"], state["sigla"], state["id"]) for state in states],
        )
        return cursor.rowcount if cursor.rowcount >= 0 else before


def update_municipalities(connection: psycopg.Connection, municipalities: list[dict]) -> int:
    with connection.cursor() as cursor:
        cursor.executemany(
            """
            UPDATE municipalities
            SET name = %s
            WHERE ibge_code = %s
            """,
            [(municipality["nome"], municipality["id"]) for municipality in municipalities],
        )
        return max(cursor.rowcount, 0)


def update_special_operational_areas(connection: psycopg.Connection) -> int:
    values = [
        ("\u00c1rea Operacional \"Lagoa Mirim\"", 4300001),
        ("\u00c1rea Operacional \"Lagoa dos Patos\"", 4300002),
    ]
    with connection.cursor() as cursor:
        cursor.executemany(
            """
            UPDATE municipalities
            SET name = %s
            WHERE ibge_code = %s
            """,
            values,
        )
        return max(cursor.rowcount, 0)


def update_sector_profile_ufs(connection: psycopg.Connection) -> int:
    result = connection.execute(
        """
        UPDATE census_sector_profile p
        SET nm_uf = s.name
        FROM states s
        WHERE p.cd_uf = s.ibge_code
          AND p.nm_uf IS DISTINCT FROM s.name
        """
    )
    return max(result.rowcount, 0)


def update_sector_profile_municipalities(connection: psycopg.Connection) -> int:
    result = connection.execute(
        """
        UPDATE census_sector_profile p
        SET nm_mun = m.name
        FROM municipalities m
        WHERE p.cd_mun = m.ibge_code
          AND p.nm_mun IS DISTINCT FROM m.name
        """
    )
    return max(result.rowcount, 0)


def update_sector_profile_microregions(connection: psycopg.Connection) -> int:
    result = connection.execute(
        """
        UPDATE census_sector_profile p
        SET nm_rgi = mr.name
        FROM microregions mr
        WHERE p.cd_rgi = mr.ibge_code
          AND p.nm_rgi IS DISTINCT FROM mr.name
        """
    )
    return max(result.rowcount, 0)


def print_remaining_problems(connection: psycopg.Connection) -> None:
    checks = [
        ("states", "name"),
        ("municipalities", "name"),
        ("microregions", "name"),
        ("census_sector_profile", "nm_uf"),
        ("census_sector_profile", "nm_mun"),
        ("census_sector_profile", "nm_rgi"),
    ]
    for table, column in checks:
        count = connection.execute(
            f"SELECT COUNT(*) AS count FROM {table} WHERE {column} LIKE '%%?%%' OR {column} LIKE '%%�%%'"
        ).fetchone()["count"]
        print(f"Possiveis problemas restantes em {table}.{column}: {count}")


if __name__ == "__main__":
    main()
