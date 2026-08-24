from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GeoBrasil API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def polygon_feature(feature_id: str, name: str, coordinates: list[list[float]]):
    return {
        "type": "Feature",
        "properties": {"id": feature_id, "name": name},
        "geometry": {"type": "Polygon", "coordinates": [coordinates]},
    }


def municipality(
    municipality_id: str,
    name: str,
    uf: str,
    coordinates: list[list[float]],
    population: int,
    density: int,
    households: int,
):
    feature = polygon_feature(municipality_id, name, coordinates)
    feature["properties"].update(
        {
            "uf": uf,
            "indicators": {
                "population": population,
                "density": density,
                "households": households,
            },
        }
    )
    return feature


def feature_collection(features: list[dict]):
    return {"type": "FeatureCollection", "features": features}

COLOR_RAMP = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]

INDICATORS = [
    {"id": "population", "name": "Populacao total", "unit": "habitantes"},
    {"id": "density", "name": "Densidade demografica", "unit": "hab/km2"},
    {"id": "households", "name": "Domicilios", "unit": "domicilios"},
]

STATES = [
    {"code": "SP", "name": "Sao Paulo"},
    {"code": "RJ", "name": "Rio de Janeiro"},
    {"code": "MG", "name": "Minas Gerais"},
]

STATE_FEATURES = [
    polygon_feature("SP", "Sao Paulo", [[-53.1, -25.4], [-44.1, -25.4], [-44.1, -19.6], [-53.1, -19.6], [-53.1, -25.4]]),
    polygon_feature("RJ", "Rio de Janeiro", [[-44.9, -23.4], [-40.9, -23.4], [-40.9, -20.7], [-44.9, -20.7], [-44.9, -23.4]]),
    polygon_feature("MG", "Minas Gerais", [[-51.0, -22.9], [-39.8, -22.9], [-39.8, -14.1], [-51.0, -14.1], [-51.0, -22.9]]),
]

MUNICIPALITIES = {
    "SP": [
        municipality("3550308", "Sao Paulo", "SP", [[-47.1, -24.2], [-45.8, -24.2], [-45.8, -23.1], [-47.1, -23.1], [-47.1, -24.2]], 11451245, 7398, 4167900),
        municipality("3509502", "Campinas", "SP", [[-47.5, -23.1], [-46.7, -23.1], [-46.7, -22.5], [-47.5, -22.5], [-47.5, -23.1]], 1139047, 1359, 430200),
        municipality("3543402", "Ribeirao Preto", "SP", [[-48.3, -21.6], [-47.5, -21.6], [-47.5, -20.9], [-48.3, -20.9], [-48.3, -21.6]], 698642, 1076, 266900),
        municipality("3549904", "Sao Jose dos Campos", "SP", [[-46.3, -23.5], [-45.5, -23.5], [-45.5, -22.7], [-46.3, -22.7], [-46.3, -23.5]], 697054, 573, 260100),
    ],
    "RJ": [
        municipality("3304557", "Rio de Janeiro", "RJ", [[-43.8, -23.2], [-43.0, -23.2], [-43.0, -22.6], [-43.8, -22.6], [-43.8, -23.2]], 6211223, 5174, 2410700),
        municipality("3304904", "Sao Goncalo", "RJ", [[-43.1, -22.9], [-42.8, -22.9], [-42.8, -22.6], [-43.1, -22.6], [-43.1, -22.9]], 896744, 4088, 322500),
        municipality("3301702", "Duque de Caxias", "RJ", [[-43.5, -22.9], [-43.1, -22.9], [-43.1, -22.5], [-43.5, -22.5], [-43.5, -22.9]], 808152, 1828, 291700),
    ],
    "MG": [
        municipality("3106200", "Belo Horizonte", "MG", [[-44.2, -20.1], [-43.7, -20.1], [-43.7, -19.7], [-44.2, -19.7], [-44.2, -20.1]], 2315560, 6992, 958300),
        municipality("3170206", "Uberlandia", "MG", [[-49.6, -19.3], [-48.9, -19.3], [-48.9, -18.6], [-49.6, -18.6], [-49.6, -19.3]], 713224, 187, 267900),
        municipality("3136702", "Juiz de Fora", "MG", [[-43.7, -21.9], [-43.1, -21.9], [-43.1, -21.4], [-43.7, -21.4], [-43.7, -21.9]], 540756, 359, 220800),
    ],
}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/states")
def list_states():
    return STATES


@app.get("/states/geojson")
def states_geojson():
    return feature_collection(STATE_FEATURES)


@app.get("/indicators")
def list_indicators():
    return INDICATORS


@app.get("/states/{uf}/municipalities")
def municipalities_by_state(uf: str, indicator: str = Query(default="population")):
    uf = uf.upper()
    validate_indicator(indicator)

    if uf not in MUNICIPALITIES:
        raise HTTPException(status_code=404, detail="UF nao encontrada")

    features = MUNICIPALITIES[uf]
    breaks = build_breaks([feature["properties"]["indicators"][indicator] for feature in features])
    styled_features = [apply_choropleth_style(feature, indicator, breaks) for feature in features]

    result = feature_collection(styled_features)
    result["metadata"] = {
        "indicator": indicator,
        "breaks": breaks,
        "bbox": calculate_bbox(styled_features),
    }
    return result


@app.get("/municipalities/{municipality_id}")
def municipality_details(municipality_id: str):
    for features in MUNICIPALITIES.values():
        for feature in features:
            if feature["properties"]["id"] == municipality_id:
                return {
                    "id": feature["properties"]["id"],
                    "name": feature["properties"]["name"],
                    "uf": feature["properties"]["uf"],
                    "indicators": feature["properties"]["indicators"],
                }

    raise HTTPException(status_code=404, detail="Municipio nao encontrado")


def validate_indicator(indicator: str):
    if indicator not in {item["id"] for item in INDICATORS}:
        raise HTTPException(status_code=400, detail="Indicador invalido")


def build_breaks(values: list[int]):
    min_value = min(values)
    max_value = max(values)

    if min_value == max_value:
        return [{"min": min_value, "max": max_value, "color": COLOR_RAMP[-1]}]

    step = (max_value - min_value) / len(COLOR_RAMP)
    breaks = []

    for index, color in enumerate(COLOR_RAMP):
        range_min = round(min_value + step * index)
        range_max = round(min_value + step * (index + 1))
        breaks.append({"min": range_min, "max": range_max, "color": color})

    breaks[-1]["max"] = max_value
    return breaks


def apply_choropleth_style(feature: dict, indicator: str, breaks: list[dict]):
    value = feature["properties"]["indicators"][indicator]
    color = breaks[-1]["color"]

    for item in breaks:
        if item["min"] <= value <= item["max"]:
            color = item["color"]
            break

    return {
        **feature,
        "properties": {
            **feature["properties"],
            "indicatorValue": value,
            "fillColor": color,
        },
    }


def calculate_bbox(features: list[dict]):
    coordinates = [
        point
        for feature in features
        for ring in feature["geometry"]["coordinates"]
        for point in ring
    ]
    lng_values = [point[0] for point in coordinates]
    lat_values = [point[1] for point in coordinates]
    return [[min(lng_values), min(lat_values)], [max(lng_values), max(lat_values)]]
