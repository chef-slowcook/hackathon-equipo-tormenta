import pandas as pd 
from utils import filter_useful_columns, filter_columns_high_corr
from feature_engineering import get_features
from model_inference import get_predictions

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # Convert date column to datetime
    df['ds'] = pd.to_datetime(df['ds'])
    # Filter useful columns
    df = filter_useful_columns(df)
    # Extract the features
    df = get_features(df)
    # Filter high correlation columns
    df = filter_columns_high_corr(df)
    return df

def model_inference(df: pd.DataFrame) -> pd.DataFrame:
    df = preprocess_data(df)
    return get_predictions(df)