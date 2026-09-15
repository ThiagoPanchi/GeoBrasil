from .mock_data import COLOR_RAMP


def feature_collection(features: list[dict]):
    return {"type": "FeatureCollection", "features": features}


def build_breaks(values: list[int | float]):
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
    coordinates = [point for feature in features for point in _coordinate_points(feature["geometry"]["coordinates"])]
    if not coordinates:
        return None
    lng_values = [point[0] for point in coordinates]
    lat_values = [point[1] for point in coordinates]
    return [[min(lng_values), min(lat_values)], [max(lng_values), max(lat_values)]]


def _coordinate_points(coordinates):
    if not coordinates:
        return []
    if isinstance(coordinates[0], (int, float)):
        return [coordinates]
    return [point for item in coordinates for point in _coordinate_points(item)]
