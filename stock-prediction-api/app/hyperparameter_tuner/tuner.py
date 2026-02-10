import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import optuna
from tensorflow import keras
import numpy as np
from sklearn.preprocessing import StandardScaler
import warnings


def optimize_hyperparameters(data, n_trials=5):
    """Find best hyperparameters using Bayesian optimization with early pruning"""
    
    def objective(trial):
        # Suggest hyperparameters
        params = {
            'slicing_window': trial.suggest_int('slicing_window', 20, 60),
            'LSTM_units': trial.suggest_categorical('LSTM_units', [32, 48, 64, 96, 128]),
            'dropout_rate': trial.suggest_float('dropout_rate', 0.1, 0.4),
            'epochs': 80  # Fixed high value for early stopping
        }
        # REJECT trials where slicing_window is too large
        if params['slicing_window'] > len(data) * 0.2:  # Max 20% of data
            return float('inf')
        # Evaluate with multi-fidelity (early stopping)
        score = evaluate_with_early_stopping(data, params, trial)
        return score
    
    # Optimize with pruning
    study = optuna.create_study(direction='minimize', 
                               pruner=optuna.pruners.HyperbandPruner())
    study.optimize(objective, n_trials=n_trials)
    
    best_params = study.best_params
    best_params['epochs'] = 80 
    
    return best_params

def evaluate_with_early_stopping(data, params, trial):
    """Train model with early stopping and report intermediate values"""
    
    # Prepare data (temporal split)
    dataset = data.values
    split_idx = int(len(dataset) * 0.8)
    train_data = dataset[:split_idx]
    val_data = dataset[split_idx:]
    
    # Scale data
    scaler = StandardScaler()
    scaled_train = scaler.fit_transform(train_data.reshape(-1, 1))
    scaled_val = scaler.transform(val_data.reshape(-1, 1))
    
    # Create sequences
    X_train, y_train = create_sequences(scaled_train, params['slicing_window'])
    X_val, y_val = create_sequences(scaled_val, params['slicing_window'])
    
    # Build model
    model = build_model(params, X_train.shape[1])
    
    # Early stopping callback
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss', patience=5, restore_best_weights=True
    )
    
    # Train with intermediate reporting
    history = model.fit(
        X_train, y_train,
        epochs=80, #params['epochs']
        batch_size=32,
        validation_data=(X_val, y_val),
        callbacks=[early_stopping],
        verbose=0
    )
    
    # Report intermediate values for pruning
    for epoch, (train_loss, val_loss) in enumerate(zip(history.history['loss'], 
                                                       history.history['val_loss'])):
        trial.report(val_loss, epoch)
        if trial.should_prune():
            raise optuna.TrialPruned()
    
    return min(history.history['val_loss'])

def create_sequences(data, slicing_window):
    """Create input sequences for LSTM"""
    X, y = [], []
    for i in range(slicing_window, len(data)):
        X.append(data[i-slicing_window:i, 0])
        y.append(data[i, 0])
    
    X = np.array(X)
    y = np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)
    return X, y

def build_model(params, input_shape):
    """Build LSTM model with given parameters"""
    model = keras.models.Sequential()
    model.add(keras.layers.Input(shape=(input_shape, 1)))
    model.add(keras.layers.LSTM(
        params['LSTM_units'], 
        return_sequences=True, 
    ))
    
    model.add(keras.layers.LSTM(
        params['LSTM_units'], 
        return_sequences=False
    ))
    
    model.add(keras.layers.Dense(128, activation="relu"))
    model.add(keras.layers.Dropout(params['dropout_rate']))
    model.add(keras.layers.Dense(1))
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="mae",
        metrics=[keras.metrics.RootMeanSquaredError()]
    )
    
    return model

