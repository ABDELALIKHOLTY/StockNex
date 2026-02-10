import pickle
import json
import os
from datetime import datetime
import tensorflow as tf

def save_model_package(company, model, scaler, best_params, training_history, lookback_period):
    """
    Save complete model package including model, scaler, and metadata
    
    Args:
        model: Trained Keras model
        scaler: Fitted MinMaxScaler
        best_params: Dictionary of best hyperparameters
        training_history: Training history from model.fit()
        company: Stock ticker (used as primary identifier)
        lookback_period: Training data period
    """
    
    # Get absolute path to company directory
    current_file_dir = os.path.dirname(__file__)
    project_root = os.path.dirname(os.path.dirname(current_file_dir))
    company_dir = os.path.join(project_root, "storage/models", company)
    
    # Create company directory
    os.makedirs(company_dir, exist_ok=True)
    
    # Delete existing models for this company
    existing_files = os.listdir(company_dir) if os.path.exists(company_dir) else []
    if existing_files:
        print(f"Replacing existing model for {company}")
        for filename in existing_files:
            file_path = os.path.join(company_dir, filename)
            try:
                os.remove(file_path)
                print(f"Deleted: {filename}")
            except Exception as e:
                print(f"Could not delete {filename}: {e}")
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_filename = f"{company}_{lookback_period}_{timestamp}"
    
    # 1. Save Keras model (native format - NOT pickle)
    model_path = os.path.join(company_dir, f"{base_filename}.keras")
    model.save(model_path)
    
    # 2. Save scaler with pickle
    scaler_path = os.path.join(company_dir, f"{base_filename}_scaler.pkl")
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    
    # 3. Save metadata as JSON
    metadata = {
        'company': company,
        'lookback_period': lookback_period,
        'training_date': timestamp,
        'best_hyperparameters': best_params,
        'final_training_loss': training_history['loss'][-1] if training_history['loss'] else None,
        'final_validation_loss': training_history['val_loss'][-1] if training_history['val_loss'] else None,
        'slicing_window': best_params['slicing_window'],
        'model_architecture': {
            'LSTM_units': best_params['LSTM_units'],
            'dropout_rate': best_params['dropout_rate'],
            'learning_rate': 0.001
        }
    }
    
    metadata_path = os.path.join(company_dir, f"{base_filename}_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    # 4. Save training history (optional, for analysis)
    history_path = os.path.join(company_dir, f"{base_filename}_history.pkl")
    with open(history_path, 'wb') as f:
        pickle.dump(training_history, f)
    
    return {
        'model_path': model_path,
        'scaler_path': scaler_path,
        'metadata_path': metadata_path,
        'history_path': history_path
    }

def load_model_package(company, model_filename=None):
    """
    Load complete model package for a company
    
    Args:
        company: Stock ticker (primary identifier)
        model_filename: Specific model to load (optional - loads latest if None)
    
    Returns:
        Dictionary with loaded model, scaler, and metadata
    """
    # Get absolute path to company directory
    current_file_dir = os.path.dirname(__file__)
    project_root = os.path.dirname(os.path.dirname(current_file_dir))
    company_dir = os.path.join(project_root, "storage/models", company)
    
    print(f"DEBUG: Loading model from: {company_dir}")
    
    if not os.path.exists(company_dir):
        raise FileNotFoundError(f"No models found for company {company}")
    
    # Find model to load
    if model_filename is None:
        # Load latest model
        model_files = [f for f in os.listdir(company_dir) if f.endswith('.keras')]
        if not model_files:
            raise FileNotFoundError(f"No models found for company {company}")
        model_files.sort(reverse=True)  # Most recent first
        base_filename = model_files[0].replace('.keras', '')
        print(f"DEBUG: Loading latest model: {base_filename}")
    else:
        base_filename = model_filename
        print(f"DEBUG: Loading specific model: {base_filename}")
    
    # Load components
    model_path = os.path.join(company_dir, f"{base_filename}.keras")
    scaler_path = os.path.join(company_dir, f"{base_filename}_scaler.pkl")
    metadata_path = os.path.join(company_dir, f"{base_filename}_metadata.json")
    
    # 1. Load Keras model with safe_mode=False to handle old model formats
    try:
        model = tf.keras.models.load_model(model_path, safe_mode=False)
    except TypeError:
        # Fallback for older TensorFlow versions that don't support safe_mode parameter
        model = tf.keras.models.load_model(model_path)
    
    # 2. Load scaler
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    
    # 3. Load metadata
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    print(f"DEBUG: Successfully loaded model for {company}")
    return {
        'model': model,
        'scaler': scaler,
        'metadata': metadata,
        'model_path': model_path
    }

def get_company_models(company):
    """Get list of all models for a company"""
    
    # Get the directory where THIS file (model_manager.py) is located
    current_file_dir = os.path.dirname(__file__)
    
    # Go up TWO levels to get to project root
    project_root = os.path.dirname(os.path.dirname(current_file_dir))
    
    # Now storage/models/COMPANY is the right path
    company_dir = os.path.join(project_root, "storage/models", company)
    
    print(f"Looking in: {company_dir}") 
    if not os.path.exists(company_dir):
        print(f"Company directory not found: {company_dir}")
        return []
    
    models = []
    for filename in os.listdir(company_dir):
        if filename.endswith('_metadata.json'):
            metadata_path = os.path.join(company_dir, filename)
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            models.append(metadata)
    
    print(f"Found {len(models)} models for {company}")
    return sorted(models, key=lambda x: x['training_date'], reverse=True)

def delete_models(company: str):
    """
    Delete model files for a company
    """
    # Get absolute path to company directory
    current_file_dir = os.path.dirname(__file__)
    project_root = os.path.dirname(os.path.dirname(current_file_dir))
    company_dir = os.path.join(project_root, "storage/models", company)
    
    print(f"DEBUG: Looking for company directory: {company_dir}")
    
    if not os.path.exists(company_dir):
        raise FileNotFoundError(f"No models found for company: {company}")
    
    deleted_files = []
    
    # Delete all files in the company directory
    for filename in os.listdir(company_dir):
        file_path = os.path.join(company_dir, filename)
        os.remove(file_path)
        deleted_files.append(filename)
        print(f"DEBUG: Deleted: {filename}")
    
    # Remove the now-empty directory
    os.rmdir(company_dir)
    print(f"DEBUG: Removed directory: {company_dir}")
    
    return {
        "message": f"Deleted {len(deleted_files)} files for {company}",
        "deleted_files": deleted_files
    }

def get_all_companies_with_models():
    """Get list of all companies that have trained models"""
    
    # Get the directory where THIS file (model_manager.py) is located
    current_file_dir = os.path.dirname(__file__)
    # current_file_dir = /stock-prediction-api/app/model_ops
    
    # Go up TWO levels to get to project root
    project_root = os.path.dirname(os.path.dirname(current_file_dir))
    # project_root = /stock-prediction-api
    
    # Now storage/models is in the right place
    models_dir = os.path.join(project_root, "storage/models")
    
    print(f"Looking in: {models_dir}") 
    
    if not os.path.exists(models_dir):
        print(f"Directory not found: {models_dir}")
        return []
    
    companies = []
    for item in os.listdir(models_dir):
        item_path = os.path.join(models_dir, item)
        if os.path.isdir(item_path):
            companies.append(item)
    
    print(f"Found companies: {companies}")  
    return sorted(companies)