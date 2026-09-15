from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg import Connection

from .db import get_connection
from .repository import (
    list_indicators_from_db,
    list_states_from_db,
    microregions_geojson_by_state,
    municipalities_geojson_by_microregion,
    municipalities_geojson_by_state,
    municipalities_indicator_values,
    municipalities_summary_by_state,
    municipality_details_from_db,
    sectors_geojson_by_municipality,
    sectors_indicator_values,
    states_geojson_from_db,
    states_indicator_values,
)

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/states")
def list_states(connection: Connection = Depends(get_connection)):
    return list_states_from_db(connection)


@router.get("/states/geojson")
def states_geojson(indicator: str = Query(default="population"), connection: Connection = Depends(get_connection)):
    return states_geojson_from_db(connection, indicator)


@router.get("/indicators")
def list_indicators(connection: Connection = Depends(get_connection)):
    return list_indicators_from_db(connection)


@router.get("/municipalities")
def list_municipalities(uf: str | None = None, connection: Connection = Depends(get_connection)):
    if not uf:
        raise HTTPException(status_code=400, detail="Informe uma UF para consultar municipios")
    return municipalities_summary_by_state(connection, uf.upper())


@router.get("/municipalities/all")
def list_all_municipalities_disabled():
    raise HTTPException(status_code=400, detail="Consulta nacional de municipios nao permitida")


@router.get("/indicators/{indicator_id}/municipalities")
def municipalities_by_indicator(
    indicator_id: str,
    uf: str | None = None,
    connection: Connection = Depends(get_connection),
):
    if not uf:
        raise HTTPException(status_code=400, detail="Informe uma UF para consultar indicadores municipais")
    return municipalities_indicator_values(connection, indicator_id, uf.upper())


@router.get("/indicators/{indicator_id}/states")
def states_by_indicator(indicator_id: str, connection: Connection = Depends(get_connection)):
    return states_indicator_values(connection, indicator_id)


@router.get("/microregions")
def microregions_without_state():
    raise HTTPException(status_code=400, detail="Informe uma UF para consultar microrregioes")


@router.get("/states/{uf}/microregions")
def microregions_by_state(
    uf: str,
    indicator: str = Query(default="population"),
    connection: Connection = Depends(get_connection),
):
    return microregions_geojson_by_state(connection, uf.upper(), indicator)


@router.get("/microregions/{microregion_id}/municipalities")
def municipalities_by_microregion(
    microregion_id: str,
    indicator: str = Query(default="population"),
    connection: Connection = Depends(get_connection),
):
    return municipalities_geojson_by_microregion(connection, microregion_id, indicator)


@router.get("/states/{uf}/municipalities")
def municipalities_by_state(
    uf: str,
    indicator: str = Query(default="population"),
    connection: Connection = Depends(get_connection),
):
    return municipalities_geojson_by_state(connection, uf.upper(), indicator)


@router.get("/sectors")
def sectors_without_municipality():
    raise HTTPException(status_code=400, detail="Informe um municipio para consultar setores censitarios")


@router.get("/states/{uf}/sectors")
def sectors_by_state_disabled(uf: str):
    raise HTTPException(status_code=400, detail="Consulta de setores por UF nao permitida")


@router.get("/microregions/{microregion_id}/sectors")
def sectors_by_microregion_disabled(microregion_id: str):
    raise HTTPException(status_code=400, detail="Consulta de setores por microrregiao nao permitida")


@router.get("/municipalities/{municipality_id}/sectors")
def sectors_by_municipality(
    municipality_id: str,
    indicator: str = Query(default="population"),
    connection: Connection = Depends(get_connection),
):
    return sectors_geojson_by_municipality(connection, municipality_id, indicator)


@router.get("/indicators/{indicator_id}/municipalities/{municipality_id}/sectors")
def sectors_by_indicator(
    indicator_id: str,
    municipality_id: str,
    connection: Connection = Depends(get_connection),
):
    return sectors_indicator_values(connection, indicator_id, municipality_id)


@router.get("/municipalities/{municipality_id}")
def municipality_details(municipality_id: str, connection: Connection = Depends(get_connection)):
    return municipality_details_from_db(connection, municipality_id)
