import pandas as pd 
import numpy as np

def extract_time_features(
    df: pd.DataFrame,
    column: str,
    lags: list[int] = [1, 2, 3, 6, 24],
    group_col: str = 'unique_id'
) -> pd.DataFrame:
    """
    Extracts lag, rolling, and cumulative features for a given column.

    Args:
        df              : Input DataFrame
        column          : Column to extract features from
        lags            : List of lag periods
        group_col       : Column to group by (e.g. 'unique_id' or 'station')

    Returns:
        DataFrame with new feature columns appended
    """
    df = df.copy()
    grouped = df.groupby(group_col)[column]

    # ------------------------------------------------------------------ #
    # 1. LAG FEATURES
    # ------------------------------------------------------------------ #
    for lag in lags:
        df[f'{column}_lag_{lag}'] = grouped.shift(lag)

    return df

def get_features(df: pd.DataFrame) -> pd.DataFrame:
    columns_to_keep = [
        # Temperature
        'AirTC_Avg',  
        # Wind
        'WS_ms_Avg',       
        # Solar radiation
        'SlrMJ_Tot',
        'NR_Wm2_Avg',
        'CNR_Wm2_Avg',
        # Soil moisture — one per depth
        'VW_Avg',
        'VW_2_Avg',
        'VW_3_Avg',
        # Leaf wetness
        'LWmV_Avg',
        'LWMWet_Tot',
        # Target
        'Rain_mm_Tot',
    ]
    for column in columns_to_keep:
        df = extract_time_features(df, column=column, group_col='station', lags=np.arange(1, 24, 4))
    return df

