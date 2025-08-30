"""
Machine Learning Models for Quantitative Trading

This module provides a comprehensive ML model manager for various trading
strategies including classification, regression, and time series forecasting.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime, timedelta
import joblib
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
try:
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.linear_model import LogisticRegression, LinearRegression
    from sklearn.svm import SVC, SVR
    from sklearn.neural_network import MLPClassifier, MLPRegressor
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    import xgboost as xgb
    import lightgbm as lgb
    from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    logging.warning("⚠️ Scikit-learn not available. Install with: pip install scikit-learn xgboost lightgbm")

# Deep Learning
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    DL_AVAILABLE = True
except ImportError:
    DL_AVAILABLE = False
    logging.warning("⚠️ PyTorch not available. Install with: pip install torch")

logger = logging.getLogger(__name__)


class ModelType(Enum):
    """Machine learning model types"""
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    TIME_SERIES = "time_series"
    ENSEMBLE = "ensemble"
    DEEP_LEARNING = "deep_learning"


class ModelName(Enum):
    """Specific model implementations"""
    # Classification
    RANDOM_FOREST_CLASSIFIER = "random_forest_classifier"
    LOGISTIC_REGRESSION = "logistic_regression"
    SVM_CLASSIFIER = "svm_classifier"
    XGBOOST_CLASSIFIER = "xgboost_classifier"
    LIGHTGBM_CLASSIFIER = "lightgbm_classifier"
    GRADIENT_BOOSTING_CLASSIFIER = "gradient_boosting_classifier"
    
    # Regression
    RANDOM_FOREST_REGRESSOR = "random_forest_regressor"
    LINEAR_REGRESSION = "linear_regression"
    SVM_REGRESSOR = "svm_regressor"
    XGBOOST_REGRESSOR = "xgboost_regressor"
    LIGHTGBM_REGRESSOR = "lightgbm_regressor"
    GRADIENT_BOOSTING_REGRESSOR = "gradient_boosting_regressor"
    
    # Neural Networks
    MLP_CLASSIFIER = "mlp_classifier"
    MLP_REGRESSOR = "mlp_regressor"
    LSTM = "lstm"
    GRU = "gru"
    TRANSFORMER = "transformer"


@dataclass
class ModelConfig:
    """Model configuration"""
    model_type: ModelType
    model_name: ModelName
    parameters: Dict[str, Any] = field(default_factory=dict)
    feature_columns: List[str] = field(default_factory=list)
    target_column: str = ""
    test_size: float = 0.2
    random_state: int = 42
    scaler_type: str = "standard"  # "standard", "minmax", "none"
    cross_validation_folds: int = 5
    early_stopping: bool = True
    patience: int = 10


@dataclass
class PredictionResult:
    """Model prediction result"""
    predictions: np.ndarray
    probabilities: Optional[np.ndarray] = None
    confidence: float = 0.0
    model_score: float = 0.0
    feature_importance: Optional[Dict[str, float]] = None
    prediction_time: float = 0.0
    success: bool = True
    error_message: Optional[str] = None


class FeatureEngineer:
    """Feature engineering for trading data"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize feature engineer"""
        self.config = config or {}
        self.scaler = None
        self.feature_names = []
        
    def create_technical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create technical analysis features"""
        df = data.copy()
        
        # Price-based features
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['price_change'] = df['close'] - df['close'].shift(1)
        df['price_range'] = df['high'] - df['low']
        df['body_size'] = abs(df['close'] - df['open'])
        
        # Moving averages
        for period in [5, 10, 20, 50, 200]:
            df[f'sma_{period}'] = df['close'].rolling(period).mean()
            df[f'ema_{period}'] = df['close'].ewm(span=period).mean()
            df[f'price_vs_sma_{period}'] = df['close'] / df[f'sma_{period}'] - 1
        
        # Volatility features
        for period in [5, 10, 20]:
            df[f'volatility_{period}'] = df['returns'].rolling(period).std()
            df[f'atr_{period}'] = self._calculate_atr(df, period)
        
        # Volume features
        df['volume_ma_20'] = df['volume'].rolling(20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma_20']
        df['volume_price_trend'] = (df['volume'] * df['returns']).cumsum()
        
        # Momentum indicators
        df['rsi_14'] = self._calculate_rsi(df['close'], 14)
        df['macd'], df['macd_signal'] = self._calculate_macd(df['close'])
        df['bb_upper'], df['bb_lower'] = self._calculate_bollinger_bands(df['close'])
        
        # Time-based features
        df['day_of_week'] = df.index.dayofweek
        df['month'] = df.index.month
        df['quarter'] = df.index.quarter
        
        # Lag features
        for lag in [1, 2, 3, 5]:
            df[f'returns_lag_{lag}'] = df['returns'].shift(lag)
            df[f'volume_lag_{lag}'] = df['volume'].shift(lag)
        
        # Interaction features
        df['price_volume_interaction'] = df['returns'] * df['volume_ratio']
        df['volatility_volume_interaction'] = df['volatility_20'] * df['volume_ratio']
        
        return df
    
    def _calculate_atr(self, data: pd.DataFrame, period: int) -> pd.Series:
        """Calculate Average True Range"""
        high_low = data['high'] - data['low']
        high_close = np.abs(data['high'] - data['close'].shift())
        low_close = np.abs(data['low'] - data['close'].shift())
        
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        return true_range.rolling(period).mean()
    
    def _calculate_rsi(self, prices: pd.Series, period: int) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series]:
        """Calculate MACD"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        macd_signal = macd.ewm(span=signal).mean()
        return macd, macd_signal
    
    def _calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2) -> Tuple[pd.Series, pd.Series]:
        """Calculate Bollinger Bands"""
        sma = prices.rolling(period).mean()
        std = prices.rolling(period).std()
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        return upper_band, lower_band
    
    def scale_features(self, data: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Scale features"""
        if self.config.get('scaler_type') == 'none':
            return data
        
        if fit:
            if self.config.get('scaler_type') == 'minmax':
                self.scaler = MinMaxScaler()
            else:
                self.scaler = StandardScaler()
            
            self.scaler.fit(data)
            self.feature_names = data.columns.tolist()
        
        if self.scaler is not None:
            scaled_data = self.scaler.transform(data)
            return pd.DataFrame(scaled_data, columns=data.columns, index=data.index)
        
        return data


class MLModelManager:
    """Machine Learning Model Manager"""
    
    def __init__(self, config: ModelConfig):
        """Initialize ML model manager"""
        if not ML_AVAILABLE:
            raise ImportError("ML libraries not available. Install scikit-learn, xgboost, lightgbm")
        
        self.config = config
        self.model = None
        self.scaler = None
        self.feature_engineer = FeatureEngineer()
        self.is_trained = False
        self.training_history = []
        
    def create_model(self) -> Any:
        """Create model based on configuration"""
        model_name = self.config.model_name
        
        if model_name == ModelName.RANDOM_FOREST_CLASSIFIER:
            return RandomForestClassifier(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.RANDOM_FOREST_REGRESSOR:
            return RandomForestRegressor(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.LOGISTIC_REGRESSION:
            return LogisticRegression(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.LINEAR_REGRESSION:
            return LinearRegression(**self.config.parameters)
        elif model_name == ModelName.SVM_CLASSIFIER:
            return SVC(**self.config.parameters, random_state=self.config.random_state, probability=True)
        elif model_name == ModelName.SVM_REGRESSOR:
            return SVR(**self.config.parameters)
        elif model_name == ModelName.XGBOOST_CLASSIFIER:
            return xgb.XGBClassifier(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.XGBOOST_REGRESSOR:
            return xgb.XGBRegressor(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.LIGHTGBM_CLASSIFIER:
            return lgb.LGBMClassifier(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.LIGHTGBM_REGRESSOR:
            return lgb.LGBMRegressor(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.GRADIENT_BOOSTING_CLASSIFIER:
            return GradientBoostingClassifier(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.GRADIENT_BOOSTING_REGRESSOR:
            return GradientBoostingRegressor(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.MLP_CLASSIFIER:
            return MLPClassifier(**self.config.parameters, random_state=self.config.random_state)
        elif model_name == ModelName.MLP_REGRESSOR:
            return MLPRegressor(**self.config.parameters, random_state=self.config.random_state)
        else:
            raise ValueError(f"Unsupported model: {model_name}")
    
    def prepare_data(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare data for training/prediction"""
        # Create features
        if self.config.feature_columns:
            feature_data = data[self.config.feature_columns].copy()
        else:
            feature_data = self.feature_engineer.create_technical_features(data)
        
        # Remove NaN values
        feature_data = feature_data.dropna()
        target_data = data[self.config.target_column].loc[feature_data.index]
        
        return feature_data, target_data
    
    def train(self, data: pd.DataFrame) -> Dict[str, float]:
        """Train the model"""
        logger.info(f"Training {self.config.model_name.value} model...")
        
        # Prepare data
        feature_data, target_data = self.prepare_data(data)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            feature_data, target_data, 
            test_size=self.config.test_size, 
            random_state=self.config.random_state
        )
        
        # Scale features
        if self.config.scaler_type != 'none':
            X_train_scaled = self.feature_engineer.scale_features(X_train, fit=True)
            X_test_scaled = self.feature_engineer.scale_features(X_test, fit=False)
        else:
            X_train_scaled, X_test_scaled = X_train, X_test
        
        # Create and train model
        self.model = self.create_model()
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        metrics = self._calculate_metrics(y_test, y_pred)
        
        self.is_trained = True
        logger.info(f"Model training completed. Score: {metrics.get('score', 0):.4f}")
        
        return metrics
    
    def predict(self, data: pd.DataFrame) -> PredictionResult:
        """Make predictions"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        import time
        start_time = time.time()
        
        try:
            # Prepare data
            feature_data, _ = self.prepare_data(data)
            
            # Scale features
            if self.config.scaler_type != 'none':
                feature_data_scaled = self.feature_engineer.scale_features(feature_data, fit=False)
            else:
                feature_data_scaled = feature_data
            
            # Make predictions
            predictions = self.model.predict(feature_data_scaled)
            
            # Get probabilities for classification
            probabilities = None
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(feature_data_scaled)
            
            # Calculate confidence (for classification)
            confidence = 0.0
            if probabilities is not None:
                confidence = np.max(probabilities, axis=1).mean()
            
            # Get feature importance
            feature_importance = None
            if hasattr(self.model, 'feature_importances_'):
                feature_importance = dict(zip(feature_data.columns, self.model.feature_importances_))
            
            prediction_time = time.time() - start_time
            
            return PredictionResult(
                predictions=predictions,
                probabilities=probabilities,
                confidence=confidence,
                feature_importance=feature_importance,
                prediction_time=prediction_time,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return PredictionResult(
                predictions=np.array([]),
                success=False,
                error_message=str(e)
            )
    
    def _calculate_metrics(self, y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculate model performance metrics"""
        metrics = {}
        
        if self.config.model_type == ModelType.CLASSIFICATION:
            metrics['accuracy'] = accuracy_score(y_true, y_pred)
            metrics['precision'] = precision_score(y_true, y_pred, average='weighted')
            metrics['recall'] = recall_score(y_true, y_pred, average='weighted')
            metrics['f1_score'] = f1_score(y_true, y_pred, average='weighted')
            metrics['score'] = metrics['f1_score']
        else:
            metrics['mse'] = mean_squared_error(y_true, y_pred)
            metrics['mae'] = mean_absolute_error(y_true, y_pred)
            metrics['r2_score'] = r2_score(y_true, y_pred)
            metrics['score'] = metrics['r2_score']
        
        return metrics
    
    def save_model(self, filepath: str):
        """Save trained model"""
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'config': self.config,
            'feature_engineer': self.feature_engineer,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load trained model"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.config = model_data['config']
        self.feature_engineer = model_data['feature_engineer']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance"""
        if not self.is_trained or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        feature_data, _ = self.prepare_data(pd.DataFrame())
        return dict(zip(feature_data.columns, self.model.feature_importances_))
