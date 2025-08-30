import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import warnings
warnings.filterwarnings('ignore')

try:
    import lightgbm as lgb
    import xgboost as xgb
    import catboost as cb
    ADVANCED_MODELS_AVAILABLE = True
except ImportError:
    ADVANCED_MODELS_AVAILABLE = False
    logging.warning("Advanced models not available")

class AdvancedEnsemblePredictor:
    """Advanced ML ensemble for price prediction using cutting-edge algorithms"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_weights = {}
        self.is_trained = False
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize all available models"""
        
        # Standard models
        self.models['random_forest'] = RandomForestRegressor(
            n_estimators=100, max_depth=10, random_state=42
        )
        
        self.models['gradient_boosting'] = GradientBoostingRegressor(
            n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
        )
        
        # Advanced models if available
        if ADVANCED_MODELS_AVAILABLE:
            self.models['lightgbm'] = lgb.LGBMRegressor(
                n_estimators=100, max_depth=6, learning_rate=0.1, 
                random_state=42, verbose=-1
            )
            
            self.models['xgboost'] = xgb.XGBRegressor(
                n_estimators=100, max_depth=6, learning_rate=0.1,
                random_state=42, verbosity=0
            )
            
            self.models['catboost'] = cb.CatBoostRegressor(
                iterations=100, depth=6, learning_rate=0.1,
                random_seed=42, verbose=False
            )
        
        # Initialize scalers
        for model_name in self.models.keys():
            self.scalers[model_name] = StandardScaler()
            self.model_weights[model_name] = 1.0
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare advanced features for prediction"""
        
        features_df = df.copy()
        
        # Technical indicators
        features_df['sma_5'] = df['close'].rolling(5).mean()
        features_df['sma_20'] = df['close'].rolling(20).mean()
        features_df['sma_50'] = df['close'].rolling(50).mean()
        
        # Volatility features
        features_df['volatility_5'] = df['close'].rolling(5).std()
        features_df['volatility_20'] = df['close'].rolling(20).std()
        
        # Momentum features
        features_df['momentum_5'] = df['close'].pct_change(5)
        features_df['momentum_20'] = df['close'].pct_change(20)
        
        # Price relative features
        features_df['price_to_sma5'] = df['close'] / features_df['sma_5']
        features_df['price_to_sma20'] = df['close'] / features_df['sma_20']
        
        # Advanced features
        features_df['daily_return'] = df['close'].pct_change()
        features_df['cumulative_return'] = (1 + features_df['daily_return']).cumprod()
        
        # Remove NaN values
        features_df = features_df.fillna(method='bfill').fillna(0)
        
        return features_df
    
    def train_ensemble(self, df: pd.DataFrame, target_column: str = 'future_return') -> Dict[str, float]:
        """Train the ensemble on historical data"""
        
        logging.info("Training Advanced ML Ensemble...")
        
        # Prepare features
        features_df = self.prepare_features(df)
        
        # Create target
        if target_column not in features_df.columns:
            features_df['future_return'] = features_df['close'].pct_change().shift(-1)
        
        # Select feature columns (exclude datetime and target columns)
        feature_columns = [col for col in features_df.columns 
                          if col not in ['future_return', 'close', 'open', 'high', 'low', 'date', 'timestamp'] 
                          and not pd.api.types.is_datetime64_any_dtype(features_df[col])]
        
        X = features_df[feature_columns].dropna()
        y = features_df['future_return'].loc[X.index]
        
        # Remove NaN values
        mask = ~(np.isnan(X).any(axis=1) | np.isnan(y))
        X = X[mask]
        y = y[mask]
        
        if len(X) < 50:
            return {'status': 'failed', 'reason': 'insufficient_data'}
        
        # Train each model
        model_scores = {}
        
        for model_name, model in self.models.items():
            try:
                # Scale features
                X_scaled = self.scalers[model_name].fit_transform(X)
                
                # Train model
                model.fit(X_scaled, y)
                
                # Cross-validation score
                cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='r2')
                model_scores[model_name] = np.mean(cv_scores)
                
                logging.info(f"   {model_name}: R² = {model_scores[model_name]:.3f}")
                
            except Exception as e:
                logging.warning(f"   {model_name} training failed: {e}")
                model_scores[model_name] = 0.0
        
        # Update model weights based on performance
        total_score = sum(max(score, 0) for score in model_scores.values())
        if total_score > 0:
            self.model_weights = {name: max(score, 0) / total_score 
                                for name, score in model_scores.items()}
        
        self.is_trained = True
        
        ensemble_score = sum(score * weight for score, weight 
                           in zip(model_scores.values(), self.model_weights.values()))
        
        return {
            'status': 'success',
            'ensemble_score': ensemble_score,
            'model_scores': model_scores,
            'model_weights': self.model_weights,
            'training_samples': len(X)
        }
    
    def predict(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Make ensemble prediction"""
        
        if not self.is_trained:
            return {'error': 'Model not trained. Call train_ensemble() first.'}
        
        # Prepare features
        features_df = self.prepare_features(df)
        
        # Select feature columns (exclude datetime and target columns)
        feature_columns = [col for col in features_df.columns 
                          if col not in ['future_return', 'close', 'open', 'high', 'low', 'date', 'timestamp']
                          and not pd.api.types.is_datetime64_any_dtype(features_df[col])]
        
        X = features_df[feature_columns].tail(1)
        
        if X.empty or np.isnan(X).any().any():
            return {'error': 'Invalid input data for prediction'}
        
        # Get predictions from each model
        predictions = {}
        
        for model_name, model in self.models.items():
            try:
                X_scaled = self.scalers[model_name].transform(X)
                pred = model.predict(X_scaled)[0]
                predictions[model_name] = pred
                
            except Exception as e:
                predictions[model_name] = 0.0
        
        # Ensemble prediction
        ensemble_prediction = sum(pred * self.model_weights.get(name, 0) 
                                for name, pred in predictions.items())
        
        # Generate trading signal
        if ensemble_prediction > 0.01:  # > 1% predicted return
            signal = "BUY"
            strength = min(ensemble_prediction * 100, 100)
        elif ensemble_prediction < -0.01:  # < -1% predicted return
            signal = "SELL"
            strength = min(abs(ensemble_prediction) * 100, 100)
        else:
            signal = "HOLD"
            strength = 0
        
        return {
            'ensemble_prediction': ensemble_prediction,
            'individual_predictions': predictions,
            'trading_signal': signal,
            'signal_strength': strength,
            'model_weights': self.model_weights,
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy use
ensemble_predictor = AdvancedEnsemblePredictor()
