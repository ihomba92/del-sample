from math import asin, cos, radians, sin, sqrt

import requests
from flask import current_app

from ..utils.errors import ApiError

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json"
REQUEST_TIMEOUT = 8
ROAD_FACTOR = 1.32
AVERAGE_SPEED_KMH = 27


def _api_key():
    return current_app.config.get("GOOGLE_MAPS_API_KEY", "")


def haversine_km(origin, destination):
    lat1, lng1 = radians(origin[0]), radians(origin[1])
    lat2, lng2 = radians(destination[0]), radians(destination[1])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    h = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    return round(2 * 6371 * asin(sqrt(h)), 2)


def geocode(address):
    key = _api_key()
    if not key:
        raise ApiError("Address lookup is unavailable until GOOGLE_MAPS_API_KEY is set", 503)

    response = requests.get(
        GEOCODE_URL,
        params={"address": address, "key": key, "region": "ke"},
        timeout=REQUEST_TIMEOUT,
    )
    payload = response.json()
    if payload.get("status") != "OK" or not payload.get("results"):
        raise ApiError(f"Could not resolve the address '{address}'", 422)

    top = payload["results"][0]
    location = top["geometry"]["location"]
    return {
        "address": top["formatted_address"],
        "lat": location["lat"],
        "lng": location["lng"],
    }


def estimate_route(origin, destination):
    key = _api_key()
    if not key:
        return _offline_estimate(origin, destination)

    try:
        response = requests.get(
            DIRECTIONS_URL,
            params={
                "origin": f"{origin[0]},{origin[1]}",
                "destination": f"{destination[0]},{destination[1]}",
                "mode": "driving",
                "key": key,
            },
            timeout=REQUEST_TIMEOUT,
        )
        payload = response.json()
    except requests.RequestException:
        return _offline_estimate(origin, destination)

    if payload.get("status") != "OK" or not payload.get("routes"):
        return _offline_estimate(origin, destination)

    route = payload["routes"][0]
    leg = route["legs"][0]
    return {
        "distance_km": round(leg["distance"]["value"] / 1000, 2),
        "duration_min": int(round(leg["duration"]["value"] / 60)),
        "polyline": route.get("overview_polyline", {}).get("points"),
        "source": "google_directions",
    }


def _offline_estimate(origin, destination):
    straight = haversine_km(origin, destination)
    distance = round(straight * ROAD_FACTOR, 2)
    return {
        "distance_km": distance,
        "duration_min": max(5, int(round(distance / AVERAGE_SPEED_KMH * 60))),
        "polyline": None,
        "source": "haversine_estimate",
    }
