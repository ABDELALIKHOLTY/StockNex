import yfinance as yf
import pandas as pd  

def load_data(company, lookback_period):
    """
    Fetch the historical price data for a given company over a specified lookback window.
    """
    try:
        ticker = yf.Ticker(company)
        data = ticker.history(period=lookback_period)
        data = data['Close']
        return data
    except Exception as e:
        raise e
    