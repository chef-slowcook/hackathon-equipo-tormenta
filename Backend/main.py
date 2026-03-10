from fastapi import FastAPI
import pandas as pd

app = FastAPI(title="Rain Precipitation API – Galapagos Islands")


def load_sample_data() -> pd.DataFrame:
    """Return a small sample DataFrame of rain precipitation data."""
    data = {
        "date": pd.date_range(start="2024-01-01", periods=5, freq="D"),
        "location": ["Santa Cruz"] * 5,
        "precipitation_mm": [12.3, 0.0, 5.7, 18.1, 3.4],
    }
    return pd.DataFrame(data)


@app.get("/")
def index():
    return {"message": "Rain Precipitation API – Galapagos Islands"}


@app.get("/data")
def get_data():
    df = load_sample_data()
    return df.to_dict(orient="records")


@app.get("/summary")
def get_summary():
    df = load_sample_data()
    return {
        "total_precipitation_mm": df["precipitation_mm"].sum(),
        "mean_precipitation_mm": df["precipitation_mm"].mean(),
        "max_precipitation_mm": df["precipitation_mm"].max(),
        "records": len(df),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
