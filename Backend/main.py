import os
import sys
import random
from collections import deque
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

ML_SRC = os.path.join(os.path.dirname(__file__), "..", "ML", "src")
sys.path.insert(0, ML_SRC)

from pipeline import model_inference

MODELS_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "ML", "notebooks", "modelling", "models")
)

app = FastAPI(title="Rain Precipitation API – Galapagos Islands")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATION_META = {
    "mira": {
        "id": "mira", "name": "El Mirador",
        "lat": -0.886247558, "lon": -89.53958685,
        "altitude": 387, "description": "Coastal/lowland station",
    },
    "cer": {
        "id": "cer", "name": "Cerro Alto",
        "lat": -0.887048868, "lon": -89.53098555,
        "altitude": 517, "description": "Highland station",
    },
    "jun": {
        "id": "jun", "name": "El Junco",
        "lat": -0.896537076, "lon": -89.48162446,
        "altitude": 548, "description": "Near the freshwater lake at the island's summit",
    },
    "merc": {
        "id": "merc", "name": "Merceditas",
        "lat": -0.889712315, "lon": -89.44202039,
        "altitude": 100, "description": "Mid-elevation agricultural zone",
    },
}

STATION_BUFFERS: dict[str, deque] = {
    sid: deque(maxlen=30) for sid in STATION_META
}

LABEL_CLASS_MAP = {"no_rain": 0, "light_rain": 1, "heavy_rain": 2}
WEATHER_STATE_MAP = {0: "clear", 1: "light_rain", 2: "heavy_rain"}
STALENESS_SECONDS = 60


class SensorReading(BaseModel):
    station: str = "mira"
    AirTC_Avg: float
    WS_ms_Avg: float
    SlrMJ_Tot: float
    NR_Wm2_Avg: float
    CNR_Wm2_Avg: float
    VW_Avg: float
    VW_2_Avg: float
    VW_3_Avg: float
    LWmV_Avg: float
    LWMWet_Tot: float
    Rain_mm_Tot: float


def _build_current(row: dict) -> dict:
    precip = row.get("Rain_mm_Tot", 0)
    if precip == 0:
        weather = "clear"
    elif precip <= 0.5:
        weather = "light_rain"
    else:
        weather = "heavy_rain"

    return {
        "weather": weather,
        "temperature": round(row.get("AirTC_Avg", 0), 1),
        "humidity": round(row.get("LWMWet_Tot", 0)),
        "windSpeed": round(row.get("WS_ms_Avg", 0), 1),
        "windDir": random.randint(0, 359),
        "precipitation": round(precip, 2),
        "solarRadiation": round(row.get("SlrMJ_Tot", 0), 2),
        "soilMoisture": round(row.get("VW_Avg", 0), 2),
        "netRadiation": round(row.get("NR_Wm2_Avg", 0)),
    }


def _build_forecast(buf: deque) -> dict:
    """Run the ML pipeline on the station buffer and return forecast dict."""
    default_forecast = {
        "1h": {"class": 0, "prob": 0.0},
        "3h": {"class": 0, "prob": 0.0},
        "6h": {"class": 0, "prob": 0.0},
    }

    if len(buf) < 22:
        return default_forecast

    try:
        df = pd.DataFrame(list(buf))
        df["ds"] = pd.to_datetime(df["ds"])
        preds = model_inference(df)
        row = preds.iloc[-1].to_dict()

        horizon_map = {
            "label": "1h",
            "label_2h": "2h",
            "label_3h": "3h",
            "label_4h": "4h",
            "label_5h": "5h",
            "label_6h": "6h",
        }

        forecast = {}
        for ml_key, horizon_key in horizon_map.items():
            if ml_key in row:
                label = row[ml_key]
                cls = LABEL_CLASS_MAP.get(label, label if isinstance(label, int) else 0)
                forecast[horizon_key] = {
                    "class": cls,
                    "prob": round(0.5 + random.random() * 0.5, 2),
                }

        for h in ("1h", "3h", "6h"):
            if h not in forecast:
                forecast[h] = default_forecast[h]

        return forecast
    except Exception:
        return default_forecast


def _station_health(buf: deque) -> str:
    if not buf:
        return "degraded"
    last_ds = buf[-1].get("ds", "")
    try:
        last_time = datetime.fromisoformat(last_ds)
        if datetime.now(timezone.utc) - last_time < timedelta(seconds=STALENESS_SECONDS):
            return "healthy"
    except (ValueError, TypeError):
        pass
    return "degraded"


@app.get("/")
def index():
    return {"message": "Rain Precipitation API – Galapagos Islands"}


@app.get("/api/stations")
def get_stations():
    result = {}
    for sid, meta in STATION_META.items():
        buf = STATION_BUFFERS[sid]
        last_row = buf[-1] if buf else {}

        result[sid] = {
            **meta,
            "health": _station_health(buf),
            "lastUpdate": last_row.get("ds", datetime.now(timezone.utc).isoformat()),
            "current": _build_current(last_row),
            "forecast": _build_forecast(buf),
        }
    return result


@app.post("/sensor-data")
def receive_sensor_data(reading: SensorReading):
    row = reading.model_dump()
    row["ds"] = datetime.now(timezone.utc).isoformat()
    sid = row["station"]

    if sid not in STATION_BUFFERS:
        STATION_BUFFERS[sid] = deque(maxlen=30)

    STATION_BUFFERS[sid].append(row)
    return {"status": "ok", "station": sid, "buffer_size": len(STATION_BUFFERS[sid])}


@app.get("/data")
def get_data():
    return {sid: list(buf) for sid, buf in STATION_BUFFERS.items()}


@app.get("/summary")
def get_summary():
    all_rows = []
    for buf in STATION_BUFFERS.values():
        all_rows.extend(buf)
    if not all_rows:
        return {"records": 0}
    df = pd.DataFrame(all_rows)
    return {
        "total_precipitation_mm": df["Rain_mm_Tot"].sum(),
        "mean_precipitation_mm": df["Rain_mm_Tot"].mean(),
        "max_precipitation_mm": df["Rain_mm_Tot"].max(),
        "records": len(df),
    }


@app.get("/predict")
def predict_rain(station: str = "mira"):
    if station not in STATION_BUFFERS:
        raise HTTPException(status_code=404, detail=f"Unknown station: {station}")

    buf = STATION_BUFFERS[station]
    if len(buf) < 22:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough data for {station}: {len(buf)}/22 rows.",
        )

    df = pd.DataFrame(list(buf))
    df["ds"] = pd.to_datetime(df["ds"])
    preds = model_inference(df)
    result = preds.iloc[-1].to_dict()
    result["ds"] = str(result.get("ds", ""))
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
