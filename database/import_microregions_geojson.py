import argparse
import json
import os
from pathlib import Path
from typing import Any

import psycopg
from psycopg import Connection, sql
from psycopg.rows import dict_row


DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/geobrasil"
DEFAULT_GEOJSON = Path("data/BR_Microrregioes_2022.geojson")


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa microrregioes 2022 para PostGIS.")
    parser.add_argument("geojson", nargs="?", default=str(DEFAULT_GEOJSON))
    parser.add_argument("--database-url", default=os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL))
    args = parser.parse_args()

    geojson_path = Path(args.geojson)
    data = json.loads(geojson_path.read_text(encoding="utf-8"))
    features = data.get("features", [])

    with psycopg.connect(args.database_url, row_factory=dict_row) as connection:
        ensure_schema(connection)
        geometry_column = geometry_column_for(connection, "microregions")
        imported = import_microregions(connection, features, geometry_column)
        linked = link_municipalities(connection, geometry_column)
        connection.commit()

    print(f"Microrregioes importadas/atualizadas: {imported}")
    print(f"Municipios vinculados a microrregioes: {linked}")


def ensure_schema(connection: Connection) -> None:
    connection.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS microregions (
            id SERIAL PRIMARY KEY,
            ibge_code INTEGER NOT NULL UNIQUE,
            state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
            name VARCHAR(150) NOT NULL,
            geometry geometry(MultiPolygon, 4674) NOT NULL
        )
        """
    )
    connection.execute(
        """
        ALTER TABLE municipalities
        ADD COLUMN IF NOT EXISTS microregion_id INTEGER REFERENCES microregions(id) ON DELETE SET NULL
        """
    )
    geometry_column = geometry_column_for(connection, "microregions")
    connection.execute(
        sql.SQL("CREATE INDEX IF NOT EXISTS idx_microregions_geometry ON microregions USING GIST ({})").format(
            sql.Identifier(geometry_column)
        )
    )
    connection.execute("CREATE INDEX IF NOT EXISTS idx_microregions_state_id ON microregions (state_id)")
    connection.execute("CREATE INDEX IF NOT EXISTS idx_municipalities_microregion_id ON municipalities (microregion_id)")


def import_microregions(connection: Connection, features: list[dict[str, Any]], geometry_column: str) -> int:
    imported = 0
    statement = sql.SQL(
        """
        INSERT INTO microregions (ibge_code, state_id, name, {geometry_column})
        SELECT
            %s,
            s.id,
            %s,
            ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4674)), 3))
        FROM states s
        WHERE s.uf = %s
        ON CONFLICT (ibge_code) DO UPDATE SET
            state_id = EXCLUDED.state_id,
            name = EXCLUDED.name,
            {geometry_column} = EXCLUDED.{geometry_column}
        """
    ).format(geometry_column=sql.Identifier(geometry_column))

    for feature in features:
        properties = feature.get("properties", {})
        code = properties.get("CD_RGI")
        name = properties.get("NM_RGI")
        uf = properties.get("SIGLA_UF")
        geometry = feature.get("geometry")
        if not code or not name or not uf or not geometry:
            continue

        result = connection.execute(statement, (int(code), name, json.dumps(geometry), uf)).rowcount
        imported += max(result, 0)

    return imported


def link_municipalities(connection: Connection, microregion_geometry_column: str) -> int:
    municipality_geometry_column = geometry_column_for(connection, "municipalities")
    statement = sql.SQL(
        """
        UPDATE municipalities m
        SET microregion_id = mr.id
        FROM microregions mr
        WHERE m.state_id = mr.state_id
          AND ST_Intersects(
            ST_PointOnSurface({municipality_geometry}),
            {microregion_geometry}
          )
        """
    ).format(
        municipality_geometry=sql.SQL("{}.{}").format(sql.Identifier("m"), sql.Identifier(municipality_geometry_column)),
        microregion_geometry=sql.SQL("{}.{}").format(sql.Identifier("mr"), sql.Identifier(microregion_geometry_column)),
    )
    return max(connection.execute(statement).rowcount, 0)


def geometry_column_for(connection: Connection, table_name: str) -> str:
    row = connection.execute(
        """
        SELECT f_geometry_column AS column_name
        FROM geometry_columns
        WHERE f_table_schema = current_schema() AND f_table_name = %s
        ORDER BY CASE f_geometry_column WHEN 'geometry' THEN 0 WHEN 'geom' THEN 1 ELSE 2 END
        LIMIT 1
        """,
        (table_name,),
    ).fetchone()
    if row:
        return row["column_name"]

    row = connection.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = %s
          AND column_name IN ('geometry', 'geom')
        ORDER BY CASE column_name WHEN 'geometry' THEN 0 WHEN 'geom' THEN 1 ELSE 2 END
        LIMIT 1
        """,
        (table_name,),
    ).fetchone()
    if row:
        return row["column_name"]

    raise RuntimeError(f"Tabela {table_name} nao possui coluna espacial geometry ou geom")


if __name__ == "__main__":
    main()
