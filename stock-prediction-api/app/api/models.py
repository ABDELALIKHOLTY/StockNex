from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class TrainRequest(BaseModel):
    """Request model for training with immediate prediction"""
    company: str = Field(..., description="Stock ticker symbol (e.g., MSFT, AAPL)")
    lookback_period: str = Field("50mo", description="Lookback period for training data in months (e.g., '12mo', '24mo')")
    n_trials: int = Field(20, ge=1, le=50, description="Number of hyperparameter optimization trials (1-50)")
    days_ahead: int = Field(10, ge=1, le=30, description="Number of days to predict after training (1-30)")
    
    @field_validator('lookback_period')
    @classmethod
    def validate_lookback_period(cls, v: str) -> str:
        """Validate that lookback_period ends with 'mo' and has reasonable value"""
        if not v.endswith('mo'):
            raise ValueError('lookback_period must end with "mo" (e.g., "12mo", "24mo")')
        
        try:
            months = int(v.replace('mo', ''))
            if months < 1:
                raise ValueError('Lookback period must be at least 1 month')
            if months > 120:  # 10 years max
                raise ValueError('Lookback period cannot exceed 120 months (10 years)')
        except ValueError:
            raise ValueError('lookback_period must be a number followed by "mo" (e.g., "12mo")')
            
        return v

class TrainResponse(BaseModel):
    """Response model for train + predict operation"""
    company: str
    lookback_period: str
    training_date: str
    training_time_seconds: float
    hyperparameters: Dict[str, Any]
    performance: Dict[str, float]
    predictions: List[float]

class PredictRequest(BaseModel):
    """Request model for predictions only"""
    company: str = Field(..., description="Stock ticker symbol")
    days_ahead: int = Field(10, ge=1, le=30, description="Number of days to predict (1-30)")

class PredictResponse(BaseModel):
    """Response model for predictions"""
    company: str
    predictions: List[float]
    generated_at: datetime

class CompanyModelsResponse(BaseModel):
    """Response model for listing company models"""
    company: str
    available_models: List[Dict[str, Any]]
    count: int

class DeleteResponse(BaseModel):
    """Response model for delete operations"""
    status: str
    message: str
    deleted_files: List[str]

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime