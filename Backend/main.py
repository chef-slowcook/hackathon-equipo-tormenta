import os
import sys
from collections import deque
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

ML_SRC = os.path.join(os.path.dirname(__file__), "..", "ML", "src")
sys.path.insert(0, ML_SRC)

from pipeline import model_inference
from model_inference import get_predictions

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

SENSOR_BUFFER: deque[dict] = deque(maxlen=30)

LABEL_MAP = {0: "no_rain", 1: "light_rain", 2: "heavy_rain"}


class SensorReading(BaseModel):
    station: str = "Santa Cruz"
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


@app.get("/")
def index():
    return {"message": "Rain Precipitation API – Galapagos Islands"}


@app.get("/data")
def get_data():
    return list(SENSOR_BUFFER)


@app.get("/summary")
def get_summary():
    if not SENSOR_BUFFER:
        return {"records": 0}
    df = pd.DataFrame(SENSOR_BUFFER)
    return {
        "total_precipitation_mm": df["Rain_mm_Tot"].sum(),
        "mean_precipitation_mm": df["Rain_mm_Tot"].mean(),
        "max_precipitation_mm": df["Rain_mm_Tot"].max(),
        "records": len(df),
    }


@app.post("/sensor-data")
def receive_sensor_data(reading: SensorReading):
    row = reading.model_dump()
    row["ds"] = datetime.now(timezone.utc).isoformat()
    SENSOR_BUFFER.append(row)
    return {"status": "ok", "buffer_size": len(SENSOR_BUFFER)}


@app.get("/predict")
def predict_rain():
    if len(SENSOR_BUFFER) < 22:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough data: {len(SENSOR_BUFFER)}/22 rows. "
            "Keep sending sensor data until the buffer fills up.",
        )

    df = pd.DataFrame(list(SENSOR_BUFFER))
    df["ds"] = pd.to_datetime(df["ds"])

    predictions = model_inference(df)
    result = predictions.iloc[-1].to_dict()

    for key in ("label", "label_2h", "label_3h", "label_4h", "label_5h", "label_6h"):
        if key in result:
            val = result[key]
            result[key] = LABEL_MAP.get(val, val)

    result["ds"] = str(result.get("ds", ""))
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
