from fastapi.testclient import TestClient
import psycopg
import pytest

from app.config import DATABASE_URL
from app.main import app


client = TestClient(app)


def require_database():
    try:
        with psycopg.connect(DATABASE_URL):
            return
    except psycopg.OperationalError as error:
        pytest.skip(f"PostgreSQL/PostGIS indisponivel para testes de integracao: {error}")


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_states_geojson_has_only_states():
    require_database()
    response = client.get("/states/geojson")

    data = response.json()

    assert response.status_code == 200
    assert data["type"] == "FeatureCollection"
    assert data["features"]
    assert all("municipalities" not in feature["properties"] for feature in data["features"])
    assert all("sectors" not in feature["properties"] for feature in data["features"])


def test_municipalities_require_state_filter():
    require_database()
    assert client.get("/municipalities").status_code == 400

    response = client.get("/municipalities?uf=SP")

    assert response.status_code == 200
    assert all(item["uf"] == "SP" for item in response.json())


def test_sectors_require_municipality():
    require_database()
    assert client.get("/sectors").status_code == 400
    assert client.get("/states/SP/sectors").status_code == 400
    assert client.get("/microregions/35001/sectors").status_code == 400

    response = client.get("/municipalities/3550308/sectors")

    assert response.status_code == 200
    assert response.json()["features"]


def test_microregions_require_state_filter():
    require_database()
    assert client.get("/microregions").status_code == 400

    response = client.get("/states/SP/microregions")

    assert response.status_code == 200
    assert response.json()["features"]


def test_indicator_catalog_contains_mvp_indicators():
    require_database()
    response = client.get("/indicators")
    indicators = {item["id"] for item in response.json()}

    assert response.status_code == 200
    assert {
        "population",
        "density",
        "households",
        "literacy",
        "race_ethnicity",
        "gender_sex",
        "age_group",
        "income",
    } <= indicators


def test_indicator_values_by_context():
    require_database()
    assert client.get("/indicators/population/states").status_code == 200
    assert client.get("/indicators/population/municipalities?uf=SP").status_code == 200
    assert client.get("/indicators/population/municipalities/3550308/sectors").status_code == 200


def test_invalid_indicator_and_unknown_territory():
    require_database()
    assert client.get("/states/SP/municipalities?indicator=invalid").status_code == 400
    assert client.get("/states/XX/municipalities").status_code == 404
    assert client.get("/municipalities/0000000").status_code == 404
