# Trading Model API

A FastAPI-based REST API for training and predicting stock prices using LSTM neural networks with hyperparameter optimization.

## 🚀 Quick Start

### Prerequisites
- Docker

### Running with Docker

**Build and Run:**
```bash
docker build -t trading-api .
docker run -p 8000:8000 trading-api
```

The API will be available at: `http://localhost:8000`

### API Documentation
- **Interactive Docs**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

## 📊 API Endpoints

### Health Check
**GET** `http://localhost:8000/api/health`

Check if the API is running properly.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T14:30:22.123456"
}
```

### List Available Companies
**GET** `http://localhost:8000/api/companies`

Get a list of all companies that have trained models.

**Response:**
```json
["MSFT", "AAPL", "TSLA"]
```

### Train Model with Predictions
**POST** `http://localhost:8000/api/train`

Train a new LSTM model for a company and immediately get predictions.

**Request Body:**
```json
{
  "company": "MSFT",
  "lookback_period": "50mo",
  "n_trials": 20,
  "days_ahead": 10
}
```

**Parameters:**
- `company` (required): Stock ticker symbol (e.g., "MSFT", "AAPL")
- `lookback_period` (optional, default: "50mo"): Training data period in months (1-120 months, must end with "mo")
- `n_trials` (optional, default: 20): Hyperparameter optimization trials (1-50)
- `days_ahead` (optional, default: 10): Number of days to predict after training (1-30)

**Response:**
```json
{
  "company": "MSFT",
  "lookback_period": "50mo",
  "training_date": "20231201_143022",
  "training_time_seconds": 169.14,
  "hyperparameters": {
    "slicing_window": 45,
    "LSTM_units": 64,
    "dropout_rate": 0.2
  },
  "performance": {
    "final_train_loss": 0.0156,
    "final_val_loss": 0.0189
  },
  "predictions": [350.1, 352.4, 349.8, 355.2, 358.6]
}
```

### Get Predictions
**POST** `http://localhost:8000/api/predict`

Get predictions from an existing trained model

**Request Body:**
```json
{
  "company": "MSFT",
  "days_ahead": 10
}
```

**Response:**
```json
{
  "company": "MSFT",
  "predictions": [350.1, 352.4, 349.8, 355.2, 358.6],
  "generated_at": "2023-12-01T14:30:22.123456"
}
```

### Get Company Models
**GET** `http://localhost:8000/api/models/{company}`

Get metadata for all trained models of a specific company.

**Example:** `http://localhost:8000/api/models/MSFT`

**Response:**
```json
{
  "company": "MSFT",
  "available_models": [
    {
      "company": "MSFT",
      "lookback_period": "50mo",
      "training_date": "20231201_143022",
      "best_hyperparameters": {
        "slicing_window": 45,
        "LSTM_units": 64,
        "dropout_rate": 0.2
      },
      "final_training_loss": 0.0156,
      "final_validation_loss": 0.0189,
      "slicing_window": 45,
      "model_architecture": {
        "LSTM_units": 64,
        "dropout_rate": 0.2,
        "learning_rate": 0.001
      }
    }
  ],
  "count": 1
}
```

### Delete Company Models
**DELETE** `http://localhost:8000/api/models/{company}`

Delete all trained models for a specific company.

**Example:** `http://localhost:8000/api/models/MSFT`

**Response:**
```json
{
  "status": "success",
  "message": "Deleted 4 files for MSFT",
  "deleted_files": [
    "MSFT_50mo_20231201_143022.keras",
    "MSFT_50mo_20231201_143022_scaler.pkl",
    "MSFT_50mo_20231201_143022_metadata.json",
    "MSFT_50mo_20231201_143022_history.pkl"
  ]
}
```

## 🐳 Docker Management

### Build Image
```bash
docker build -t trading-api .
```

### Run Container
```bash
docker run -p 8000:8000 trading-api
```

### Run in Background
```bash
docker run -d -p 8000:8000 --name trading-api trading-api
```

### View Logs
```bash
docker logs -f trading-api
```

### Stop Container
```bash
docker stop trading-api
```

### Remove Container
```bash
docker rm trading-api
```

### List Containers
```bash
docker ps
```

## 🏗️ Architecture

### Core Components
- **LSTM Neural Networks** for time series forecasting
- **Bayesian Optimization** with Optuna for hyperparameter tuning
- **Real-time data** from Yahoo Finance
- **Single model per company** strategy

### Container Features
- **Optimized Python 3.12** base image
- **Persistent storage** for models
- **Health check** ready
- **Production-ready** configuration

## 📁 Project Structure
```
stock-prediction-api/
├── app/                    # Application code
├── main.py                # FastAPI entry point
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── storage/              # Persistent model storage
```

## 🔧 Testing the API

### Using curl
```bash
# Health check
curl http://localhost:8000/api/health

# List companies
curl http://localhost:8000/api/companies

# Train a model
curl -X POST http://localhost:8000/api/train \
  -H "Content-Type: application/json" \
  -d '{"company": "MSFT", "days_ahead": 10}'

# Get predictions
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"company": "MSFT", "days_ahead": 10}'
```

### Using Web Browser
- Open `http://localhost:8000/docs` for interactive testing
- Open `http://localhost:8000/redoc` for alternative documentation

## ⚡ Performance Notes

- **Training Time**: minutes per model
- **Prediction Time**: seconds
- **Memory**: Optimized for single company models
- **Storage**: Models persist in container volume
