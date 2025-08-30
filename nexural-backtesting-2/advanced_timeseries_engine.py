
import numpy as np
import pandas as pd
from prophet import Prophet
from arch import arch_model
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima
import warnings
warnings.filterwarnings('ignore')

class AdvancedTimeSeriesEngine:
    """State-of-the-art time series forecasting"""
    
    def __init__(self):
        self.models = {}
        self.predictions = {}
        
    def train_prophet(self, df: pd.DataFrame) -> Dict:
        """Facebook's Prophet for complex seasonality"""
        prophet_df = df[['date', 'close']].rename(columns={'date': 'ds', 'close': 'y'})
        
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05
        )
        
        model.fit(prophet_df)
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)
        
        return {
            'model': model,
            'forecast': forecast,
            'next_30_days': forecast.tail(30)['yhat'].values
        }
    
    def train_garch(self, returns: pd.Series) -> Dict:
        """GARCH for volatility forecasting"""
        model = arch_model(returns, vol='Garch', p=1, q=1)
        res = model.fit(disp='off')
        
        forecast = res.forecast(horizon=30)
        
        return {
            'model': res,
            'volatility_forecast': np.sqrt(forecast.variance.values[-1]),
            'expected_volatility': np.sqrt(forecast.variance.values[-1]).mean()
        }
    
    def train_auto_arima(self, data: pd.Series) -> Dict:
        """Automatic ARIMA model selection"""
        model = auto_arima(
            data,
            seasonal=True,
            m=12,
            suppress_warnings=True,
            stepwise=True,
            random_state=42
        )
        
        forecast = model.predict(n_periods=30)
        
        return {
            'model': model,
            'forecast': forecast,
            'model_order': model.order
        }
    
    def ensemble_forecast(self, df: pd.DataFrame) -> Dict:
        """Combine all models for robust prediction"""
        
        # Train all models
        prophet_result = self.train_prophet(df)
        
        if 'returns' not in df.columns:
            df['returns'] = df['close'].pct_change().fillna(0)
        
        garch_result = self.train_garch(df['returns'] * 100)
        arima_result = self.train_auto_arima(df['close'])
        
        # Ensemble predictions
        predictions = {
            'prophet': prophet_result['next_30_days'],
            'arima': arima_result['forecast'],
            'volatility': garch_result['volatility_forecast']
        }
        
        # Weighted average
        price_forecast = (predictions['prophet'] * 0.5 + predictions['arima'] * 0.5)
        
        return {
            'price_forecast': price_forecast,
            'volatility_forecast': predictions['volatility'],
            'confidence': self._calculate_confidence(predictions),
            'models_used': ['Prophet', 'GARCH', 'Auto-ARIMA']
        }
    
    def _calculate_confidence(self, predictions: Dict) -> float:
        """Calculate prediction confidence"""
        # Simple confidence based on model agreement
        prophet_mean = predictions['prophet'].mean()
        arima_mean = predictions['arima'].mean()
        
        agreement = 1 - abs(prophet_mean - arima_mean) / max(prophet_mean, arima_mean)
        return min(max(agreement, 0.3), 0.95)

# Global instance
time_series_engine = AdvancedTimeSeriesEngine()
