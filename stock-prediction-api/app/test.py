import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import time
import sys
from datetime import datetime

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from data_pipeline.data_loader import load_data
from hyperparameter_tuner.tuner import optimize_hyperparameters
from model_trainer.trainer import train_final_model
from app.model_ops.model_manager import save_model_package, load_model_package, get_company_models
from app.model_ops.model_predictor import predict_future

def run_complete_pipeline(company='MSFT', lookback_period="50mo", n_trials=5):
    """
    Complete pipeline from data loading to model saving with enhanced logging
    """
    
    print("🚀 STARTING COMPLETE MODEL TRAINING PIPELINE")
    print("=" * 50)
    print(f"📈 Company: {company}")
    print(f"⏰ Lookback: {lookback_period}")
    print(f"🔬 Trials: {n_trials}")
    print("=" * 50)
    
    # Track timing
    start_time = time.time()
    
    try:
        # 1. Data Loading
        print("\n📊 PHASE 1: Loading Data...")
        data_load_start = time.time()
        data = load_data(company, lookback_period)
        data_load_time = time.time() - data_load_start
        
        print(f"✅ Loaded {len(data)} data points for {company}")
        print(f"📅 Date range: {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")
        print(f"💰 Price range: ${data.min():.2f} - ${data.max():.2f}")
        print(f"⏱️  Data loading time: {data_load_time:.2f}s")
        
        # 2. Hyperparameter Optimization
        print("\n⚙️  PHASE 2: Hyperparameter Optimization...")
        tuning_start = time.time()
        best_hyperparams = optimize_hyperparameters(data, n_trials=n_trials)
        tuning_time = time.time() - tuning_start
        
        print(f"✅ Best hyperparameters found:")
        for param, value in best_hyperparams.items():
            print(f"   - {param}: {value}")
        print(f"⏱️  Tuning time: {tuning_time:.2f}s")
        
        # 3. Final Model Training
        print("\n🎯 PHASE 3: Final Model Training...")
        training_start = time.time()
        model, history, scaler = train_final_model(data, best_hyperparams)
        training_time = time.time() - training_start
        
        final_train_loss = history['loss'][-1] if history['loss'] else 'N/A'
        final_val_loss = history['val_loss'][-1] if history['val_loss'] else 'N/A'
        
        print(f"✅ Model trained successfully")
        print(f"📉 Final training loss: {final_train_loss:.4f}")
        print(f"📊 Final validation loss: {final_val_loss:.4f}")
        print(f"⏱️  Training time: {training_time:.2f}s")
        
        # 4. Model Saving
        print("\n💾 PHASE 4: Saving Model Package...")
        saving_start = time.time()
        save_paths = save_model_package(
            model=model, 
            scaler=scaler, 
            best_params=best_hyperparams, 
            training_history=history, 
            company=company, 
            lookback_period=lookback_period
        )
        saving_time = time.time() - saving_start
        
        print(f"✅ Model package saved:")
        for key, path in save_paths.items():
            print(f"   - {key}: {os.path.basename(path)}")
        print(f"⏱️  Saving time: {saving_time:.2f}s")
        
        # 5. Verification Load
        print("\n🔍 PHASE 5: Verifying Saved Model...")
        verify_start = time.time()
        loaded_package = load_model_package(company)
        verify_time = time.time() - verify_start
        
        print(f"✅ Model loaded successfully for verification")
        print(f"📋 Metadata: {loaded_package['metadata']['company']} trained on {loaded_package['metadata']['training_date']}")
        print(f"⏱️  Verification time: {verify_time:.2f}s")
        
        # 6. Summary
        total_time = time.time() - start_time
        print("\n🎉 PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print(f"⏱️  Total pipeline time: {total_time:.2f}s")
        print(f"📊 Data points processed: {len(data)}")
        print(f"🔬 Hyperparameters optimized: {len(best_hyperparams)}")
        print(f"💾 Model saved to: {save_paths['model_path']}")
        print("=" * 50)
        
        return {
            'success': True,
            'model_package': loaded_package,
            'save_paths': save_paths,
            'timing': {
                'total': total_time,
                'data_loading': data_load_time,
                'tuning': tuning_time,
                'training': training_time,
                'saving': saving_time,
                'verification': verify_time
            },
            'performance': {
                'final_train_loss': final_train_loss,
                'final_val_loss': final_val_loss
            }
        }
        
    except Exception as e:
        print(f"\n❌ PIPELINE FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

def list_models(company):
    """List all models for a company"""
    print(f"\n📂 Models for {company}:")
    models = get_company_models(company)
    
    if not models:
        print("   No models found")
        return
    
    for i, model_info in enumerate(models, 1):
        print(f"{i}. {model_info['company']} - {model_info['lookback_period']}")
        print(f"   Trained: {model_info['training_date']}")
        print(f"   Val Loss: {model_info.get('final_validation_loss', 'N/A')}")
        print()

def predict_with_model(company='MSFT', days_ahead=20, model_filename=None):
    """
    Simple function to load model and return predictions
    """
    # Load the model
    model_package = load_model_package(company, model_filename)
    
    # Make predictions
    predictions = predict_future(model_package, days_ahead=days_ahead)
    
    return predictions

# Usage
if __name__ == "__main__":
    # Train a new model
    result = run_complete_pipeline(
        company='TSLA', 
        lookback_period="40mo",
        n_trials=30
    )
    
    if result['success']:
        # Predict with the model
        predictions = predict_with_model(company='TSLA', days_ahead=30)
        print(f"Predictions: {predictions}")   