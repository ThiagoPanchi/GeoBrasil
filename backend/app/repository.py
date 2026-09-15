import json
from typing import Any

from fastapi import HTTPException
from psycopg import Connection, sql

from .geojson import apply_choropleth_style, build_breaks, calculate_bbox, feature_collection
from .mock_data import INDICATORS as DEFAULT_INDICATORS


def list_states_from_db(connection: Connection) -> list[dict[str, Any]]:
    return connection.execute(
        """
        SELECT uf AS code, name
        FROM states
        ORDER BY name
        """
    ).fetchall()


def states_geojson_from_db(connection: Connection, indicator: str = "population") -> dict[str, Any]:
    _ensure_indicator_exists(connection, indicator)
    rows = connection.execute(
        sql.SQL(
            """
        SELECT
            s.uf AS id,
            s.name,
            s.uf,
            {geometry},
            selected.value::float AS value,
            COALESCE(all_values.indicators, '{{}}'::jsonb) || jsonb_build_object('area_km2', area_values.value) AS indicators
        FROM states s
        LEFT JOIN census_indicators selected_indicator ON selected_indicator.code = %s
        LEFT JOIN states_indicator_values selected ON selected.state_id = s.id AND selected.indicator_id = selected_indicator.id
        LEFT JOIN LATERAL (
            SELECT jsonb_object_agg(ci.code, v.value::float) AS indicators
            FROM states_indicator_values v
            JOIN census_indicators ci ON ci.id = v.indicator_id
            WHERE v.state_id = s.id AND v.value IS NOT NULL
        ) all_values ON true
        LEFT JOIN LATERAL (
            SELECT SUM(COALESCE(p.area_km2, 0))::float AS value
            FROM municipalities m
            JOIN census_sector_profile p ON p.cd_mun = m.ibge_code
            WHERE m.state_id = s.id
        ) area_values ON true
        ORDER BY s.name
        """
        ).format(geometry=_geojson_expression(connection, "states", "s")),
        (indicator,),
    ).fetchall()
    features = [_feature(row, indicator) for row in rows]
    breaks = build_breaks([row["value"] for row in rows if row.get("value") is not None])
    styled_features = [
        apply_choropleth_style(feature, indicator, breaks)
        if breaks and indicator in feature["properties"].get("indicators", {})
        else feature
        for feature in features
    ]
    result = feature_collection(styled_features)
    result["metadata"] = {"indicator": indicator, "breaks": breaks, "bbox": _table_bbox(connection, "states")}
    return result


def list_indicators_from_db(connection: Connection) -> list[dict[str, Any]]:
    if not _table_exists(connection, "census_indicators"):
        return DEFAULT_INDICATORS

    rows = connection.execute(
        """
        SELECT code AS id, name, COALESCE(unit, '') AS unit, description
        FROM census_indicators
        ORDER BY id
        """
    ).fetchall()

    if rows:
        return rows

    return DEFAULT_INDICATORS


def municipalities_summary_by_state(connection: Connection, uf: str) -> list[dict[str, Any]]:
    _ensure_state_exists(connection, uf)
    return connection.execute(
        """
        SELECT m.ibge_code::text AS id, m.name, s.uf
        FROM municipalities m
        JOIN states s ON s.id = m.state_id
        WHERE s.uf = %s
        ORDER BY m.name
        """,
        (uf,),
    ).fetchall()


def microregions_geojson_by_state(connection: Connection, uf: str, indicator: str = "population") -> dict[str, Any]:
    _ensure_state_exists(connection, uf)
    _ensure_indicator_exists(connection, indicator)
    if not _table_exists(connection, "microregions"):
        return {"type": "FeatureCollection", "features": [], "metadata": {"bbox": None}}

    rows = connection.execute(
        sql.SQL(
            """
        SELECT
            mr.ibge_code::text AS id,
            mr.name,
            s.uf,
            {geometry},
            selected.value::float AS value,
            COALESCE(all_values.indicators, '{{}}'::jsonb) || jsonb_build_object('area_km2', area_values.value) AS indicators
        FROM microregions mr
        JOIN states s ON s.id = mr.state_id
        LEFT JOIN census_indicators selected_indicator ON selected_indicator.code = %s
        LEFT JOIN microregions_indicator_values selected ON selected.microregion_id = mr.id AND selected.indicator_id = selected_indicator.id
        LEFT JOIN LATERAL (
            SELECT jsonb_object_agg(ci.code, v.value::float) AS indicators
            FROM microregions_indicator_values v
            JOIN census_indicators ci ON ci.id = v.indicator_id
            WHERE v.microregion_id = mr.id AND v.value IS NOT NULL
        ) all_values ON true
        LEFT JOIN LATERAL (
            SELECT SUM(COALESCE(p.area_km2, 0))::float AS value
            FROM municipalities m
            JOIN census_sector_profile p ON p.cd_mun = m.ibge_code
            WHERE m.microregion_id = mr.id
        ) area_values ON true
        WHERE s.uf = %s
        ORDER BY mr.name
        """
        ).format(geometry=_geojson_expression(connection, "microregions", "mr")),
        (indicator, uf),
    ).fetchall()
    return _styled_collection(rows, indicator)


def municipalities_geojson_by_state(connection: Connection, uf: str, indicator: str) -> dict[str, Any]:
    _ensure_state_exists(connection, uf)
    _ensure_indicator_exists(connection, indicator)
    if not _has_indicator_values(connection, "municipality_indicator_values"):
        rows = connection.execute(
            sql.SQL(
                """
            SELECT
                m.ibge_code::text AS id,
                m.name,
                s.uf,
                {geometry},
                NULL::float AS value
            FROM municipalities m
            JOIN states s ON s.id = m.state_id
            WHERE s.uf = %s
            ORDER BY m.name
            """,
            ).format(geometry=_geojson_expression(connection, "municipalities", "m")),
            (uf,),
        ).fetchall()
        return _styled_collection(rows, indicator)

    rows = connection.execute(
        sql.SQL(
            """
        SELECT
            m.ibge_code::text AS id,
            m.name,
            s.uf,
            {geometry},
            v.value::float AS value,
            COALESCE(all_values.indicators, '{{}}'::jsonb) || jsonb_build_object('area_km2', area_values.value) AS indicators
        FROM municipalities m
        JOIN states s ON s.id = m.state_id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN municipality_indicator_values v ON v.municipality_id = m.id AND v.indicator_id = ci.id
        LEFT JOIN LATERAL (
            SELECT jsonb_object_agg(all_ci.code, all_v.value::float) AS indicators
            FROM municipality_indicator_values all_v
            JOIN census_indicators all_ci ON all_ci.id = all_v.indicator_id
            WHERE all_v.municipality_id = m.id AND all_v.value IS NOT NULL
        ) all_values ON true
        LEFT JOIN LATERAL (
            SELECT SUM(COALESCE(p.area_km2, 0))::float AS value
            FROM census_sector_profile p
            WHERE p.cd_mun = m.ibge_code
        ) area_values ON true
        WHERE s.uf = %s
        ORDER BY m.name
        """
        ).format(geometry=_geojson_expression(connection, "municipalities", "m")),
        (indicator, uf),
    ).fetchall()
    return _styled_collection(rows, indicator)


def municipalities_geojson_by_microregion(connection: Connection, microregion_id: str, indicator: str) -> dict[str, Any]:
    _ensure_indicator_exists(connection, indicator)
    if not _table_exists(connection, "microregions"):
        raise HTTPException(status_code=404, detail="Microrregiao nao encontrada")

    if not _has_indicator_values(connection, "municipality_indicator_values"):
        rows = connection.execute(
            sql.SQL(
                """
            SELECT
                m.ibge_code::text AS id,
                m.name,
                s.uf,
                {geometry},
                NULL::float AS value
            FROM municipalities m
            JOIN states s ON s.id = m.state_id
            JOIN microregions mr ON mr.id = m.microregion_id
            WHERE mr.ibge_code::text = %s
            ORDER BY m.name
            """
            ).format(geometry=_geojson_expression(connection, "municipalities", "m")),
            (microregion_id,),
        ).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="Microrregiao nao encontrada")
        return _styled_collection(rows, indicator)

    rows = connection.execute(
        sql.SQL(
            """
        SELECT
            m.ibge_code::text AS id,
            m.name,
            s.uf,
            {geometry},
            v.value::float AS value,
            COALESCE(all_values.indicators, '{{}}'::jsonb) || jsonb_build_object('area_km2', area_values.value) AS indicators
        FROM municipalities m
        JOIN states s ON s.id = m.state_id
        JOIN microregions mr ON mr.id = m.microregion_id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN municipality_indicator_values v ON v.municipality_id = m.id AND v.indicator_id = ci.id
        LEFT JOIN LATERAL (
            SELECT jsonb_object_agg(all_ci.code, all_v.value::float) AS indicators
            FROM municipality_indicator_values all_v
            JOIN census_indicators all_ci ON all_ci.id = all_v.indicator_id
            WHERE all_v.municipality_id = m.id AND all_v.value IS NOT NULL
        ) all_values ON true
        LEFT JOIN LATERAL (
            SELECT SUM(COALESCE(p.area_km2, 0))::float AS value
            FROM census_sector_profile p
            WHERE p.cd_mun = m.ibge_code
        ) area_values ON true
        WHERE mr.ibge_code::text = %s
        ORDER BY m.name
        """
        ).format(geometry=_geojson_expression(connection, "municipalities", "m")),
        (indicator, microregion_id),
    ).fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="Microrregiao nao encontrada")
    return _styled_collection(rows, indicator)


def sectors_geojson_by_municipality(connection: Connection, municipality_id: str, indicator: str) -> dict[str, Any]:
    _ensure_indicator_exists(connection, indicator)
    if not _has_indicator_values(connection, "census_sector_indicator_values"):
        rows = connection.execute(
            sql.SQL(
                """
            SELECT
                cs.ibge_code::text AS id,
                COALESCE(cs.name, cs.ibge_code::text) AS name,
                s.uf,
                {geometry},
                NULL::float AS value
            FROM census_sectors cs
            JOIN municipalities m ON m.id = cs.municipality_id
            JOIN states s ON s.id = m.state_id
            WHERE m.ibge_code::text = %s
            ORDER BY cs.ibge_code
            """
            ).format(geometry=_geojson_expression(connection, "census_sectors", "cs")),
            (municipality_id,),
        ).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="Setores do municipio nao encontrados")
        return _styled_collection(rows, indicator)

    rows = connection.execute(
        sql.SQL(
            """
        SELECT
            cs.ibge_code::text AS id,
            COALESCE(cs.name, cs.ibge_code::text) AS name,
            s.uf,
            {geometry},
            v.value::float AS value,
            COALESCE(all_values.indicators, '{{}}'::jsonb) || jsonb_build_object('area_km2', area_values.value) AS indicators
        FROM census_sectors cs
        JOIN municipalities m ON m.id = cs.municipality_id
        JOIN states s ON s.id = m.state_id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN census_sector_indicator_values v ON v.census_sector_id = cs.id AND v.indicator_id = ci.id
        LEFT JOIN LATERAL (
            SELECT jsonb_object_agg(all_ci.code, all_v.value::float) AS indicators
            FROM census_sector_indicator_values all_v
            JOIN census_indicators all_ci ON all_ci.id = all_v.indicator_id
            WHERE all_v.census_sector_id = cs.id AND all_v.value IS NOT NULL
        ) all_values ON true
        LEFT JOIN LATERAL (
            SELECT p.area_km2::float AS value
            FROM census_sector_profile p
            WHERE p.census_sector_id = cs.id
            LIMIT 1
        ) area_values ON true
        WHERE m.ibge_code::text = %s
        ORDER BY cs.ibge_code
        """
        ).format(geometry=_geojson_expression(connection, "census_sectors", "cs")),
        (indicator, municipality_id),
    ).fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="Setores do municipio nao encontrados")
    return _styled_collection(rows, indicator)


def municipality_details_from_db(connection: Connection, municipality_id: str) -> dict[str, Any]:
    row = connection.execute(
        """
        SELECT m.ibge_code::text AS id, m.name, s.uf
        FROM municipalities m
        JOIN states s ON s.id = m.state_id
        WHERE m.ibge_code::text = %s
        """,
        (municipality_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Municipio nao encontrado")

    if not _has_indicator_values(connection, "municipality_indicator_values"):
        return {**row, "indicators": {}}

    values = connection.execute(
        """
        SELECT ci.code, v.value::float AS value
        FROM municipality_indicator_values v
        JOIN census_indicators ci ON ci.id = v.indicator_id
        JOIN municipalities m ON m.id = v.municipality_id
        WHERE m.ibge_code::text = %s
        """,
        (municipality_id,),
    ).fetchall()
    return {**row, "indicators": {item["code"]: item["value"] for item in values}}


def states_indicator_values(connection: Connection, indicator: str) -> list[dict[str, Any]]:
    _ensure_indicator_exists(connection, indicator)
    if _table_exists(connection, "states_indicator_values"):
        return connection.execute(
            """
            SELECT s.uf AS id, s.name, %s AS indicator_id, v.value::float AS value
            FROM states_indicator_values v
            JOIN states s ON s.id = v.state_id
            JOIN census_indicators ci ON ci.id = v.indicator_id
            WHERE ci.code = %s
            ORDER BY s.name
            """,
            (indicator, indicator),
        ).fetchall()

    if not _has_indicator_values(connection, "municipality_indicator_values"):
        return connection.execute(
            """
            SELECT s.uf AS id, s.name, %s AS indicator_id, NULL::float AS value
            FROM states s
            ORDER BY s.name
            """,
            (indicator,),
        ).fetchall()

    return connection.execute(
        """
        SELECT s.uf AS id, s.name, %s AS indicator_id, COALESCE(SUM(v.value), 0)::float AS value
        FROM states s
        LEFT JOIN municipalities m ON m.state_id = s.id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN municipality_indicator_values v ON v.municipality_id = m.id AND v.indicator_id = ci.id
        GROUP BY s.uf, s.name
        ORDER BY s.name
        """,
        (indicator, indicator),
    ).fetchall()


def municipalities_indicator_values(connection: Connection, indicator: str, uf: str) -> list[dict[str, Any]]:
    _ensure_state_exists(connection, uf)
    _ensure_indicator_exists(connection, indicator)
    if not _has_indicator_values(connection, "municipality_indicator_values"):
        return connection.execute(
            """
            SELECT m.ibge_code::text AS id, m.name, s.uf, %s AS indicator_id, NULL::float AS value
            FROM municipalities m
            JOIN states s ON s.id = m.state_id
            WHERE s.uf = %s
            ORDER BY m.name
            """,
            (indicator, uf),
        ).fetchall()

    return connection.execute(
        """
        SELECT m.ibge_code::text AS id, m.name, s.uf, %s AS indicator_id, v.value::float AS value
        FROM municipalities m
        JOIN states s ON s.id = m.state_id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN municipality_indicator_values v ON v.municipality_id = m.id AND v.indicator_id = ci.id
        WHERE s.uf = %s
        ORDER BY m.name
        """,
        (indicator, indicator, uf),
    ).fetchall()


def sectors_indicator_values(connection: Connection, indicator: str, municipality_id: str) -> list[dict[str, Any]]:
    _ensure_indicator_exists(connection, indicator)
    if not _has_indicator_values(connection, "census_sector_indicator_values"):
        rows = connection.execute(
            """
            SELECT
                cs.ibge_code::text AS id,
                COALESCE(cs.name, cs.ibge_code::text) AS name,
                %s AS municipality_id,
                %s AS indicator_id,
                NULL::float AS value
            FROM census_sectors cs
            JOIN municipalities m ON m.id = cs.municipality_id
            WHERE m.ibge_code::text = %s
            ORDER BY cs.ibge_code
            """,
            (municipality_id, indicator, municipality_id),
        ).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="Setores do municipio nao encontrados")
        return rows

    rows = connection.execute(
        """
        SELECT
            cs.ibge_code::text AS id,
            COALESCE(cs.name, cs.ibge_code::text) AS name,
            %s AS municipality_id,
            %s AS indicator_id,
            v.value::float AS value
        FROM census_sectors cs
        JOIN municipalities m ON m.id = cs.municipality_id
        LEFT JOIN census_indicators ci ON ci.code = %s
        LEFT JOIN census_sector_indicator_values v ON v.census_sector_id = cs.id AND v.indicator_id = ci.id
        WHERE m.ibge_code::text = %s
        ORDER BY cs.ibge_code
        """,
        (municipality_id, indicator, indicator, municipality_id),
    ).fetchall()
    if not rows:
        raise HTTPException(status_code=404, detail="Setores do municipio nao encontrados")
    return rows


def _ensure_state_exists(connection: Connection, uf: str) -> None:
    exists = connection.execute("SELECT 1 FROM states WHERE uf = %s", (uf,)).fetchone()
    if not exists:
        raise HTTPException(status_code=404, detail="UF nao encontrada")


def _ensure_indicator_exists(connection: Connection, indicator: str) -> None:
    if not _table_exists(connection, "census_indicators"):
        if indicator in {item["id"] for item in DEFAULT_INDICATORS}:
            return
        raise HTTPException(status_code=400, detail="Indicador invalido")

    exists = connection.execute("SELECT 1 FROM census_indicators WHERE code = %s", (indicator,)).fetchone()
    if exists:
        return
    if indicator in {item["id"] for item in DEFAULT_INDICATORS}:
        return
    raise HTTPException(status_code=400, detail="Indicador invalido")


def _has_indicator_values(connection: Connection, table_name: str) -> bool:
    return _table_exists(connection, "census_indicators") and _table_exists(connection, table_name)


def _table_exists(connection: Connection, table_name: str) -> bool:
    return bool(connection.execute("SELECT to_regclass(%s) IS NOT NULL AS exists", (table_name,)).fetchone()["exists"])


def _geojson_expression(connection: Connection, table_name: str, table_alias: str) -> sql.Composed:
    geometry_column = _geometry_column(connection, table_name)
    geometry_ref = sql.SQL("{}.{}").format(sql.Identifier(table_alias), sql.Identifier(geometry_column))
    return sql.SQL(
        """
        ST_AsGeoJSON(
            CASE
                WHEN ST_SRID(CASE WHEN ST_IsValid({0}) THEN {0} ELSE ST_MakeValid({0}) END) = 4326
                    THEN CASE WHEN ST_IsValid({0}) THEN {0} ELSE ST_MakeValid({0}) END
                WHEN ST_SRID(CASE WHEN ST_IsValid({0}) THEN {0} ELSE ST_MakeValid({0}) END) = 0
                    THEN ST_SetSRID(CASE WHEN ST_IsValid({0}) THEN {0} ELSE ST_MakeValid({0}) END, 4326)
                ELSE ST_Transform(CASE WHEN ST_IsValid({0}) THEN {0} ELSE ST_MakeValid({0}) END, 4326)
            END
        )::json AS geometry
        """
    ).format(geometry_ref)


def _geometry_column(connection: Connection, table_name: str) -> str:
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

    raise HTTPException(status_code=500, detail=f"Tabela {table_name} nao possui coluna espacial geometry ou geom")


def _table_bbox(connection: Connection, table_name: str) -> list[list[float]] | None:
    geometry_column = _geometry_column(connection, table_name)
    query = sql.SQL(
        """
        SELECT
            ST_XMin(extent)::float AS xmin,
            ST_YMin(extent)::float AS ymin,
            ST_XMax(extent)::float AS xmax,
            ST_YMax(extent)::float AS ymax
        FROM (
            SELECT ST_Extent({geometry}) AS extent
            FROM {table}
        ) bounds
        """
    ).format(geometry=sql.Identifier(geometry_column), table=sql.Identifier(table_name))
    row = connection.execute(query).fetchone()
    if not row or row["xmin"] is None:
        return None
    return [[row["xmin"], row["ymin"]], [row["xmax"], row["ymax"]]]


def _styled_collection(rows: list[dict[str, Any]], indicator: str) -> dict[str, Any]:
    features = [_feature(row, indicator) for row in rows]
    values = [row["value"] for row in rows if row.get("value") is not None]
    breaks = build_breaks(values) if values else []
    styled_features = [
        apply_choropleth_style(feature, indicator, breaks)
        if breaks and indicator in feature["properties"].get("indicators", {})
        else feature
        for feature in features
    ]
    result = feature_collection(styled_features)
    result["metadata"] = {
        "indicator": indicator,
        "breaks": breaks,
        "bbox": calculate_bbox(styled_features),
    }
    return result


def _feature(row: dict[str, Any], indicator: str | None = None) -> dict[str, Any]:
    geometry = row["geometry"]
    if isinstance(geometry, str):
        geometry = json.loads(geometry)

    properties = {
        "id": row["id"],
        "name": row["name"],
    }
    if row.get("uf"):
        properties["uf"] = row["uf"]
    if row.get("indicators") is not None:
        properties["indicators"] = dict(row["indicators"])
    elif indicator and row.get("value") is not None:
        properties["indicators"] = {indicator: row["value"]}
    elif indicator:
        properties["indicators"] = {}

    return {"type": "Feature", "geometry": geometry, "properties": properties}
