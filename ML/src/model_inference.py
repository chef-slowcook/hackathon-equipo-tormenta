import os
import joblib
import pandas as pd

def get_predictions(
    df: pd.DataFrame,
    forecast_window: int = 6,
    models_path: str = 'models/',
) -> pd.DataFrame:
    last_row = df.iloc[[-1]]
    max_date = last_row['ds'].values[0]
    station  = last_row['station'].values[0]

    X = last_row.drop(columns=['ds', 'station', 'Rain_mm_Tot'], errors='ignore')

    row = {
        'station': station,
        'ds':      max_date,
    }

    for h in range(1, forecast_window + 1):
        folder    = 'label' if h == 1 else f'label_{h}h'
        model_dir = f'{models_path}/{folder}'

        pipeline = joblib.load(f'{model_dir}/pipeline.pkl')
        encoder  = joblib.load(f'{model_dir}/encoder.pkl')

        col_name      = 'label' if h == 1 else f'label_{h}h'
        row[col_name] = encoder.inverse_transform(pipeline.predict(X))[0]

    return pd.DataFrame([row])