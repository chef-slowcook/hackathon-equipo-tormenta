import pandas as pd
from sklearn.linear_model import LinearRegression


def load_sample_data() -> pd.DataFrame:
    """Return a sample DataFrame of daily rain precipitation."""
    data = {
        "day": list(range(1, 11)),
        "precipitation_mm": [12.3, 0.0, 5.7, 18.1, 3.4, 9.2, 0.0, 22.5, 7.8, 14.0],
    }
    return pd.DataFrame(data)


def basic_stats(df: pd.DataFrame) -> None:
    print("=== Basic Statistics ===")
    print(df["precipitation_mm"].describe())
    print(f"\nTotal precipitation: {df['precipitation_mm'].sum():.2f} mm")
    print(f"Rainy days: {(df['precipitation_mm'] > 0).sum()} / {len(df)}")


def train_trend_model(df: pd.DataFrame) -> None:
    X = df[["day"]]
    y = df["precipitation_mm"]
    model = LinearRegression()
    model.fit(X, y)
    print("\n=== Trend Model ===")
    print(f"Slope: {model.coef_[0]:.4f} mm/day")
    print(f"Intercept: {model.intercept_:.4f}")
    next_day = pd.DataFrame({"day": [len(df) + 1]})
    print(f"Predicted precipitation for day {len(df) + 1}: {model.predict(next_day)[0]:.2f} mm")


if __name__ == "__main__":
    df = load_sample_data()
    basic_stats(df)
    train_trend_model(df)
