from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)


def load_sample_data() -> pd.DataFrame:
    """Return a small sample DataFrame of rain precipitation data."""
    data = {
        "date": pd.date_range(start="2024-01-01", periods=5, freq="D"),
        "location": ["Santa Cruz"] * 5,
        "precipitation_mm": [12.3, 0.0, 5.7, 18.1, 3.4],
    }
    return pd.DataFrame(data)


@app.route("/")
def index():
    return jsonify({"message": "Rain Precipitation API – Galapagos Islands"})


@app.route("/data")
def get_data():
    df = load_sample_data()
    return jsonify(df.to_dict(orient="records"))


@app.route("/summary")
def get_summary():
    df = load_sample_data()
    summary = {
        "total_precipitation_mm": df["precipitation_mm"].sum(),
        "mean_precipitation_mm": df["precipitation_mm"].mean(),
        "max_precipitation_mm": df["precipitation_mm"].max(),
        "records": len(df),
    }
    return jsonify(summary)


if __name__ == "__main__":
    app.run(debug=False)
