from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import os
import sys
from datetime import datetime
import time

# Add the parent directory to path so we can import other app modules
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import existing functionality
from data_pipeline.data_loader import load_data
from hyperparameter_tuner.tuner import optimize_hyperparameters
from model_trainer.trainer import train_final_model
from model_ops.model_manager import save_model_package, load_model_package, get_company_models
from model_ops.model_predictor import predict_future
from model_ops.model_manager import get_company_models, delete_models, get_all_companies_with_models

# Import Pydantic models
from .models import (
    TrainRequest, TrainResponse, PredictRequest, PredictResponse,
    CompanyModelsResponse, DeleteResponse, HealthResponse
)

router = APIRouter()

@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Train a new model and return predictions immediately
    """
    print("API: Starting COMPLETE TRAINING PIPELINE")
    print("=" * 50)
    print(f"Company: {request.company}")
    print(f"Lookback: {request.lookback_period}")
    print(f"Trials: {request.n_trials}")
    print(f"Predict Days: {request.days_ahead}")
    print("=" * 50)
    
    start_time = time.time()
    
    try:
        # 1. DATA LOADING
        print("\nPHASE 1: Loading Data...")
        data_load_start = time.time()
        data = load_data(request.company, request.lookback_period)
        data_load_time = time.time() - data_load_start
        
        print(f"Loaded {len(data)} data points for {request.company}")
        print(f"Date range: {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")
        print(f"Price range: ${data.min():.2f} - ${data.max():.2f}")
        print(f"Data loading time: {data_load_time:.2f}s")
        
        # 2. HYPERPARAMETER OPTIMIZATION
        print("\nPHASE 2: Hyperparameter Optimization...")
        tuning_start = time.time()
        best_hyperparams = optimize_hyperparameters(data, n_trials=request.n_trials)
        tuning_time = time.time() - tuning_start
        
        print(f"Best hyperparameters found:")
        for param, value in best_hyperparams.items():
            print(f"   - {param}: {value}")
        print(f"Tuning time: {tuning_time:.2f}s")
        
        # 3. FINAL MODEL TRAINING
        print("\nPHASE 3: Final Model Training...")
        training_start = time.time()
        model, history, scaler = train_final_model(data, best_hyperparams)
        training_time = time.time() - training_start
        
        final_train_loss = history['loss'][-1] if history['loss'] else 'N/A'
        final_val_loss = history['val_loss'][-1] if history['val_loss'] else 'N/A'
        
        print(f"Model trained successfully")
        print(f"Final training loss: {final_train_loss:.4f}")
        print(f"Final validation loss: {final_val_loss:.4f}")
        print(f"Training time: {training_time:.2f}s")
        
        # 4. MODEL SAVING
        print("\nPHASE 4: Saving Model Package...")
        saving_start = time.time()
        save_paths = save_model_package(
            model=model, 
            scaler=scaler, 
            best_params=best_hyperparams, 
            training_history=history, 
            company=request.company, 
            lookback_period=request.lookback_period
        )
        saving_time = time.time() - saving_start
        
        print(f"Model package saved:")
        for key, path in save_paths.items():
            print(f"   - {key}: {os.path.basename(path)}")
        print(f"Saving time: {saving_time:.2f}s")
        
        # 5. VERIFICATION LOAD
        print("\nPHASE 5: Verifying Saved Model...")
        verify_start = time.time()
        loaded_package = load_model_package(request.company)
        verify_time = time.time() - verify_start
        
        print(f"Model loaded successfully for verification")
        print(f"Metadata: {loaded_package['metadata']['company']} trained on {loaded_package['metadata']['training_date']}")
        print(f"Verification time: {verify_time:.2f}s")
        
        # 6. GENERATE PREDICTIONS
        print("\nPHASE 6: Generating Predictions...")
        predict_start = time.time()
        
        predictions = predict_future(
            model_package=loaded_package,
            days_ahead=request.days_ahead
        )
        
        predict_time = time.time() - predict_start
        
        print(f"Generated {len(predictions)} predictions")
        print(f"Prediction range: ${predictions.min():.2f} - ${predictions.max():.2f}")
        print(f"Prediction time: {predict_time:.2f}s")
        
        # 7. FINAL SUMMARY
        total_time = time.time() - start_time
        print("\nAPI TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print(f"Total pipeline time: {total_time:.2f}s")
        print(f"Data points processed: {len(data)}")
        print(f"Hyperparameters optimized: {len(best_hyperparams)}")
        print(f"Predictions generated: {len(predictions)} days")
        print(f"Model saved to: {save_paths['model_path']}")
        print("=" * 50)
        
        # Format the response
        return TrainResponse(
            company=request.company,
            lookback_period=request.lookback_period,
            training_date=loaded_package['metadata']['training_date'],
            training_time_seconds=total_time,
            hyperparameters=best_hyperparams,
            performance={
                'final_train_loss': final_train_loss,
                'final_val_loss': final_val_loss
            },
            predictions=predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
        )
        
    except Exception as e:
        print(f"\nAPI TRAINING PIPELINE FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/predict", response_model=PredictResponse)
async def get_predictions(request: PredictRequest):
    """
    Get predictions from an existing trained model
    
    - Uses the latest model for the company
    """
    print("API: Starting prediction pipeline")
    print("=" * 40)
    print(f"Company: {request.company}")
    print(f"Days ahead: {request.days_ahead}")
    print("=" * 40)
    
    try:
        # Load the model package
        print("\nLoading model package...")
        model_package = load_model_package(request.company)
        
        print(f"Model loaded: {model_package['metadata']['company']}")
        print(f"Trained on: {model_package['metadata']['training_date']}")
        print(f"Slicing window: {model_package['metadata']['slicing_window']}")
        
        # Generate predictions using your predict_future function
        print(f"\nGenerating {request.days_ahead} predictions...")
        predict_start = time.time()
        
        predictions = predict_future(
            model_package=model_package,
            days_ahead=request.days_ahead
        )
        
        predict_time = time.time() - predict_start
        
        print(f"Generated {len(predictions)} predictions")
        print(f"Prediction range: ${predictions.min():.2f} - ${predictions.max():.2f}")
        print(f"Prediction time: {predict_time:.2f}s")
        print("\nPrediction pipeline completed successfully!")
        
        return PredictResponse(
            company=request.company,
            predictions=predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
            generated_at=datetime.now()
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"No trained model found for company: {request.company}. Please train a model first."
        )
    except Exception as e:
        print(f"Prediction pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/{company}", response_model=CompanyModelsResponse)
async def get_company_models_list(company: str):
    """
    Get all trained models for a specific company
    
    Returns metadata for all model versions with performance metrics
    """
    try:
        models = get_company_models(company)
        return CompanyModelsResponse(
            company=company,
            available_models=models,
            count=len(models)
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"No models found for company: {company}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/models/{company}", response_model=DeleteResponse)
async def delete_company_models(company: str):
    """
    Delete model for a company
    """
    try:
        result = delete_models(company)
        return DeleteResponse(
            status="success",
            message=result["message"],
            deleted_files=result["deleted_files"]
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No models found for company: {company}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/companies", response_model=List[str])
async def list_all_companies():
    """
    List all companies with trained models
    
    Useful for discovering which companies have available models
    """
    try:
        return get_all_companies_with_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now()
    )