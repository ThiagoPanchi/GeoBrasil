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
    income: int = 2800,
):
    feature = polygon_feature(municipality_id, name, coordinates)
    feature["properties"].update(
        {
            "uf": uf,
            "indicators": {
                "population": population,
                "density": density,
                "households": households,
                "literacy": round(population * 0.93),
                "race_ethnicity": round(population * 0.52),
                "gender_sex": round(population * 0.51),
                "age_group": round(population * 0.69),
                "income": income,
            },
        }
    )
    return feature


COLOR_RAMP = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"]

INDICATORS = [
    {"id": "population", "name": "Populacao total", "unit": "habitantes"},
    {"id": "density", "name": "Densidade demografica", "unit": "hab/km2"},
    {"id": "households", "name": "Domicilios", "unit": "domicilios"},
    {"id": "literacy", "name": "Alfabetizacao", "unit": "pessoas"},
    {"id": "race_ethnicity", "name": "Etnia / Cor ou Raca", "unit": "pessoas"},
    {"id": "gender_sex", "name": "Genero / Sexo", "unit": "pessoas"},
    {"id": "age_group", "name": "Faixa Etaria", "unit": "pessoas"},
    {"id": "income", "name": "Rendimento medio", "unit": "BRL"},
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

MICROREGIONS = {
    "SP": [
        {
            **polygon_feature("35001", "Sao Paulo", [[-47.3, -24.4], [-45.6, -24.4], [-45.6, -22.9], [-47.3, -22.9], [-47.3, -24.4]]),
            "properties": {"id": "35001", "name": "Sao Paulo", "uf": "SP"},
        }
    ],
    "RJ": [
        {
            **polygon_feature("33001", "Rio de Janeiro", [[-44.0, -23.3], [-42.8, -23.3], [-42.8, -22.5], [-44.0, -22.5], [-44.0, -23.3]]),
            "properties": {"id": "33001", "name": "Rio de Janeiro", "uf": "RJ"},
        }
    ],
    "MG": [
        {
            **polygon_feature("31001", "Belo Horizonte", [[-44.4, -20.3], [-43.5, -20.3], [-43.5, -19.5], [-44.4, -19.5], [-44.4, -20.3]]),
            "properties": {"id": "31001", "name": "Belo Horizonte", "uf": "MG"},
        }
    ],
}

MICROREGION_MUNICIPALITIES = {
    "35001": ["3550308", "3509502", "3549904"],
    "33001": ["3304557", "3304904", "3301702"],
    "31001": ["3106200"],
}

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

CENSUS_SECTORS = {
    "3550308": [
        municipality("355030800000001", "Setor 355030800000001", "SP", [[-46.9, -24.0], [-46.4, -24.0], [-46.4, -23.5], [-46.9, -23.5], [-46.9, -24.0]], 5800, 8200, 2100),
        municipality("355030800000002", "Setor 355030800000002", "SP", [[-46.4, -24.0], [-46.0, -24.0], [-46.0, -23.5], [-46.4, -23.5], [-46.4, -24.0]], 4300, 7600, 1680),
    ],
    "3304557": [
        municipality("330455700000001", "Setor 330455700000001", "RJ", [[-43.7, -23.1], [-43.4, -23.1], [-43.4, -22.8], [-43.7, -22.8], [-43.7, -23.1]], 5100, 6900, 1900),
    ],
}


def all_municipality_features():
    return [feature for features in MUNICIPALITIES.values() for feature in features]


def municipality_by_id(municipality_id: str):
    for features in MUNICIPALITIES.values():
        for feature in features:
            if feature["properties"]["id"] == municipality_id:
                return feature
    return None
