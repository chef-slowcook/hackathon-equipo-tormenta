import pandas as pd

def filter_useful_columns(df: pd.DataFrame) -> pd.DataFrame:
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
        # Date
        'ds',
        # Station
        'station'
    ]
    df = df[columns_to_keep]
    return df

def filter_columns_high_corr(df: pd.DataFrame) -> pd.DataFrame:
    high_corr_columns = [
        'Rain_mm_Tot', 'ds', 'station',
        'Rain_mm_Tot_lag_1', 'Rain_mm_Tot_lag_5',
        'Rain_mm_Tot_lag_9', 'Rain_mm_Tot_lag_13', 'Rain_mm_Tot_lag_21',
        'Rain_mm_Tot_lag_17', 'LWmV_Avg', 'LWmV_Avg_lag_1', 'VW_3_Avg',
        'VW_3_Avg_lag_1', 'AirTC_Avg_lag_17', 'VW_3_Avg_lag_5',
        'VW_3_Avg_lag_21', 'VW_3_Avg_lag_17', 'VW_3_Avg_lag_13',
        'VW_3_Avg_lag_9', 'SlrMJ_Tot_lag_17', 'AirTC_Avg_lag_13', 'AirTC_Avg',
       'AirTC_Avg_lag_9']
    return df[high_corr_columns]