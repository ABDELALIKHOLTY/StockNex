from sklearn.preprocessing import StandardScaler
from tensorflow import keras
import numpy as np
import warnings
warnings.filterwarnings('ignore')

"""
example of best_hyperparameters
best_hyperparameters = {
    "slicing_window": 40,
    "LSTM_units": 64,
    "dropout_rate": 0.2,
    "epochs": 20
}

"""


def train_final_model(data, best_hyperparameters):
    """
    Final training after hyperparameter tuning
    Uses 100% of available data for maximum learning
    """
    # Prepare data - use 100% for final model
    dataset = data.values

    # Use ALL data for final training (no split)
    training_data = dataset  # 100% of data

    # Reshape to 2D array (required by MinMaxScaler)
    training_data_2d = training_data.reshape(-1, 1)

    # Scale the training data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(training_data_2d)

    # SLICING WINDOW PART:
    X_train, y_train = [], []

    # Use best hyperparameter
    slicing_window = best_hyperparameters['slicing_window']

    # Create sequences from ENTIRE dataset
    for i in range(slicing_window, len(training_data)):
        # Get the past slicing_window days as features (X)
        X_train.append(scaled_data[i - slicing_window:i, 0]) 
        # Get the next day as target (y)
        y_train.append(scaled_data[i, 0])  

    X_train, y_train = np.array(X_train), np.array(y_train)
    X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

    # Build the model with best hyperparameters
    model = keras.models.Sequential()

    # First Layer - USE BEST HYPERPARAMETER
    model.add(keras.layers.LSTM(
        best_hyperparameters['LSTM_units'], 
        return_sequences=True, 
        input_shape=(X_train.shape[1], 1)
    ))

    # Second Layer - USE BEST HYPERPARAMETER
    model.add(keras.layers.LSTM(
        best_hyperparameters['LSTM_units'], 
        return_sequences=False
    ))
                                
    # 3rd Layer (Dense)
    model.add(keras.layers.Dense(128, activation="relu"))

    # 4th Layer (Dropout) - USE BEST HYPERPARAMETER
    model.add(keras.layers.Dropout(best_hyperparameters['dropout_rate']))

    # Final output layer
    model.add(keras.layers.Dense(1))

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="mae",
        metrics=[keras.metrics.RootMeanSquaredError()]
    )

    # FINAL TRAINING
    history = model.fit(
        X_train, y_train,
        epochs=best_hyperparameters['epochs'],
        batch_size=32,
        validation_split=0.1
    )

    # Return the final model trained on 100% data
    return model, history.history, scaler