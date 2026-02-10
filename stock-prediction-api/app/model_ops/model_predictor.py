import pickle
import json
import os
import numpy as np
from datetime import datetime, timedelta
import tensorflow as tf
from data_pipeline.data_loader import load_data


def predict_future(model_package, days_ahead=1):
    """
    Predict future stock prices using saved model
    """
    model = model_package['model']
    scaler = model_package['scaler'] 
    metadata = model_package['metadata']
    
    company = metadata['company']
    slicing_window = metadata['slicing_window']
    
    try:
        # Load more data than needed to ensure we have enough
        # Add buffer for weekends/holidays (50% extra)
        buffer_days = int(slicing_window * 1.5)
        latest_data = load_data(company, f"{buffer_days}d")
        latest_prices = latest_data.values
        
        # Take exactly the last slicing_window days
        if len(latest_prices) >= slicing_window:
            latest_prices = latest_prices[-slicing_window:]
        else:
            # If we still don't have enough data, use what we have
            print(f"⚠️ Warning: Only {len(latest_prices)} days available, need {slicing_window}")
            # Pad with the last available value if needed
            if len(latest_prices) < slicing_window:
                padding = np.full(slicing_window - len(latest_prices), latest_prices[-1])
                latest_prices = np.concatenate([padding, latest_prices])
                
    except Exception as e:
        raise ValueError(f"Could not fetch latest data: {str(e)}")
    
    # Scale the data
    scaled_data = scaler.transform(latest_prices.reshape(-1, 1))
    
    # Get the sequence (should be exactly slicing_window days)
    last_sequence = scaled_data.flatten()
    
    predictions = []
    current_sequence = last_sequence.copy()
    
    for day in range(days_ahead):
        X = current_sequence.reshape(1, slicing_window, 1)
        next_pred_scaled = model.predict(X, verbose=0)[0, 0]
        predictions.append(next_pred_scaled)
        current_sequence = np.append(current_sequence[1:], next_pred_scaled)
    
    actual_predictions = scaler.inverse_transform(
        np.array(predictions).reshape(-1, 1)
    ).flatten()
    
    return actual_predictions