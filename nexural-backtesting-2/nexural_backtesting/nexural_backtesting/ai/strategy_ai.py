"""
AI-Powered Strategy Development and Optimization

This module provides AI-driven strategy development, signal generation,
optimization, and market regime detection capabilities.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime, timedelta
import json
from pathlib import Path

from .ml_models import MLModelManager, ModelConfig, ModelType, ModelName, PredictionResult
from .ai_ensemble import AIEnsemble, AIResponse

logger = logging.getLogger(__name__)


class RegimeType(Enum):
    """Market regime types"""
    TRENDING_UP = "trending_up"
    TRENDING_DOWN = "trending_down"
    SIDEWAYS = "sideways"
    VOLATILE = "volatile"
    LOW_VOLATILITY = "low_volatility"
    CRISIS = "crisis"
    RECOVERY = "recovery"


@dataclass
class MarketRegime:
    """Market regime information"""
    regime_type: RegimeType
    confidence: float
    start_date: datetime
    end_date: Optional[datetime] = None
    characteristics: Dict[str, float] = field(default_factory=dict)
    volatility: float = 0.0
    trend_strength: float = 0.0
    correlation: float = 0.0


@dataclass
class AISignal:
    """AI-generated trading signal"""
    signal_strength: float  # -1 to 1
    confidence: float  # 0 to 1
    direction: str  # "long", "short", "neutral"
    reasoning: str
    model_predictions: Dict[str, float] = field(default_factory=dict)
    regime_context: Optional[MarketRegime] = None
    timestamp: datetime = field(default_factory=datetime.now)


class StrategyAI:
    """AI-powered strategy development and analysis"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize Strategy AI"""
        self.config = config or {}
        self.ai_ensemble = AIEnsemble()
        self.models = {}
        self.regime_detector = MarketRegimeDetector()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.signal_generator = AISignalGenerator()
        self.optimizer = AIStrategyOptimizer()
        
    def analyze_strategy_performance(self, backtest_results: Dict[str, Any]) -> AIResponse:
        """Analyze strategy performance using AI"""
        prompt = self._create_performance_analysis_prompt(backtest_results)
        return self.ai_ensemble.get_ensemble_response(prompt)
    
    def suggest_strategy_improvements(self, strategy_config: Dict[str, Any], 
                                   performance_metrics: Dict[str, float]) -> AIResponse:
        """Get AI suggestions for strategy improvements"""
        prompt = self._create_improvement_suggestion_prompt(strategy_config, performance_metrics)
        return self.ai_ensemble.get_ensemble_response(prompt)
    
    def generate_adaptive_parameters(self, market_data: pd.DataFrame, 
                                  current_regime: MarketRegime) -> Dict[str, Any]:
        """Generate adaptive parameters based on market regime"""
        return self.optimizer.generate_adaptive_parameters(market_data, current_regime)
    
    def _create_performance_analysis_prompt(self, results: Dict[str, Any]) -> str:
        """Create prompt for performance analysis"""
        return f"""
        Analyze the following backtesting results and provide insights:
        
        Performance Metrics:
        - Total Return: {results.get('total_return', 0):.2%}
        - Sharpe Ratio: {results.get('sharpe_ratio', 0):.2f}
        - Max Drawdown: {results.get('max_drawdown', 0):.2%}
        - Win Rate: {results.get('win_rate', 0):.2%}
        - Profit Factor: {results.get('profit_factor', 0):.2f}
        
        Trading Statistics:
        - Total Trades: {results.get('total_trades', 0)}
        - Average Trade Duration: {results.get('avg_trade_duration', 0)} days
        - Largest Win: {results.get('largest_win', 0):.2%}
        - Largest Loss: {results.get('largest_loss', 0):.2%}
        
        Please provide:
        1. Overall strategy assessment
        2. Key strengths and weaknesses
        3. Risk analysis
        4. Specific improvement recommendations
        5. Market conditions suitability
        """
    
    def _create_improvement_suggestion_prompt(self, strategy_config: Dict[str, Any], 
                                           metrics: Dict[str, float]) -> str:
        """Create prompt for improvement suggestions"""
        return f"""
        Analyze this strategy configuration and performance metrics to suggest improvements:
        
        Strategy Configuration:
        {json.dumps(strategy_config, indent=2)}
        
        Current Performance:
        {json.dumps(metrics, indent=2)}
        
        Please provide:
        1. Parameter optimization suggestions
        2. Risk management improvements
        3. Entry/exit logic enhancements
        4. Market condition adaptations
        5. Specific actionable recommendations
        """


class AISignalGenerator:
    """AI-powered signal generation"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize AI signal generator"""
        self.config = config or {}
        self.models = {}
        self.ensemble_weights = {}
        
    def generate_signal(self, market_data: pd.DataFrame, 
                       regime: Optional[MarketRegime] = None) -> AISignal:
        """Generate AI-powered trading signal"""
        # Prepare features
        features = self._extract_features(market_data)
        
        # Get predictions from multiple models
        predictions = {}
        for model_name, model in self.models.items():
            try:
                result = model.predict(market_data.tail(1))
                if result.success:
                    predictions[model_name] = result.predictions[0]
            except Exception as e:
                logger.warning(f"Model {model_name} prediction failed: {e}")
        
        # Combine predictions using ensemble weights
        if predictions:
            weighted_signal = sum(predictions[model] * self.ensemble_weights.get(model, 1.0) 
                                for model in predictions)
            signal_strength = np.clip(weighted_signal, -1, 1)
        else:
            signal_strength = 0.0
        
        # Determine direction
        if signal_strength > 0.1:
            direction = "long"
        elif signal_strength < -0.1:
            direction = "short"
        else:
            direction = "neutral"
        
        # Calculate confidence based on model agreement
        confidence = self._calculate_confidence(predictions, regime)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(predictions, regime, features)
        
        return AISignal(
            signal_strength=signal_strength,
            confidence=confidence,
            direction=direction,
            reasoning=reasoning,
            model_predictions=predictions,
            regime_context=regime
        )
    
    def add_model(self, name: str, model: MLModelManager, weight: float = 1.0):
        """Add model to ensemble"""
        self.models[name] = model
        self.ensemble_weights[name] = weight
    
    def _extract_features(self, data: pd.DataFrame) -> Dict[str, float]:
        """Extract key features for signal generation"""
        latest = data.iloc[-1]
        
        features = {
            'price_change': (latest['close'] - data['close'].iloc[-2]) / data['close'].iloc[-2],
            'volume_ratio': latest['volume'] / data['volume'].rolling(20).mean().iloc[-1],
            'rsi': self._calculate_rsi(data['close']).iloc[-1],
            'volatility': data['close'].pct_change().rolling(20).std().iloc[-1],
            'trend_strength': self._calculate_trend_strength(data['close'])
        }
        
        return features
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
    
    def _calculate_trend_strength(self, prices: pd.Series) -> float:
        """Calculate trend strength"""
        sma_20 = prices.rolling(20).mean()
        sma_50 = prices.rolling(50).mean()
        return (sma_20.iloc[-1] - sma_50.iloc[-1]) / sma_50.iloc[-1]
    
    def _calculate_confidence(self, predictions: Dict[str, float], 
                            regime: Optional[MarketRegime]) -> float:
        """Calculate signal confidence"""
        if not predictions:
            return 0.0
        
        # Base confidence from model agreement
        values = list(predictions.values())
        agreement = 1 - np.std(values)  # Higher agreement = higher confidence
        
        # Adjust for regime confidence
        regime_confidence = regime.confidence if regime else 0.5
        
        return min(agreement * regime_confidence, 1.0)
    
    def _generate_reasoning(self, predictions: Dict[str, float], 
                          regime: Optional[MarketRegime], 
                          features: Dict[str, float]) -> str:
        """Generate reasoning for signal"""
        reasons = []
        
        # Model predictions
        if predictions:
            avg_pred = np.mean(list(predictions.values()))
            if avg_pred > 0.2:
                reasons.append("Multiple models predict upward movement")
            elif avg_pred < -0.2:
                reasons.append("Multiple models predict downward movement")
        
        # Technical indicators
        if features['rsi'] < 30:
            reasons.append("RSI indicates oversold conditions")
        elif features['rsi'] > 70:
            reasons.append("RSI indicates overbought conditions")
        
        if features['volume_ratio'] > 1.5:
            reasons.append("High volume confirms signal strength")
        
        # Regime context
        if regime:
            reasons.append(f"Market in {regime.regime_type.value} regime")
        
        return "; ".join(reasons) if reasons else "Neutral market conditions"


class MarketRegimeDetector:
    """Market regime detection using ML"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize regime detector"""
        self.config = config or {}
        self.model = None
        self.regime_history = []
        
    def detect_regime(self, market_data: pd.DataFrame) -> MarketRegime:
        """Detect current market regime"""
        # Calculate regime characteristics
        characteristics = self._calculate_regime_characteristics(market_data)
        
        # Determine regime type
        regime_type = self._classify_regime(characteristics)
        
        # Calculate confidence
        confidence = self._calculate_regime_confidence(characteristics, regime_type)
        
        regime = MarketRegime(
            regime_type=regime_type,
            confidence=confidence,
            start_date=market_data.index[-1],
            characteristics=characteristics,
            volatility=characteristics.get('volatility', 0.0),
            trend_strength=characteristics.get('trend_strength', 0.0),
            correlation=characteristics.get('correlation', 0.0)
        )
        
        self.regime_history.append(regime)
        return regime
    
    def _calculate_regime_characteristics(self, data: pd.DataFrame) -> Dict[str, float]:
        """Calculate market regime characteristics"""
        returns = data['close'].pct_change().dropna()
        
        characteristics = {
            'volatility': returns.rolling(20).std().iloc[-1],
            'trend_strength': self._calculate_trend_strength(data['close']),
            'correlation': self._calculate_correlation(data),
            'momentum': returns.rolling(10).mean().iloc[-1],
            'volume_trend': data['volume'].pct_change().rolling(10).mean().iloc[-1],
            'price_range': (data['high'] - data['low']).rolling(20).mean().iloc[-1] / data['close'].iloc[-1]
        }
        
        return characteristics
    
    def _calculate_trend_strength(self, prices: pd.Series) -> float:
        """Calculate trend strength"""
        sma_20 = prices.rolling(20).mean()
        sma_50 = prices.rolling(50).mean()
        return (sma_20.iloc[-1] - sma_50.iloc[-1]) / sma_50.iloc[-1]
    
    def _calculate_correlation(self, data: pd.DataFrame) -> float:
        """Calculate price-volume correlation"""
        returns = data['close'].pct_change()
        volume_changes = data['volume'].pct_change()
        return returns.corr(volume_changes)
    
    def _classify_regime(self, characteristics: Dict[str, float]) -> RegimeType:
        """Classify market regime based on characteristics"""
        volatility = characteristics.get('volatility', 0.0)
        trend_strength = characteristics.get('trend_strength', 0.0)
        momentum = characteristics.get('momentum', 0.0)
        
        # High volatility crisis
        if volatility > 0.03:
            return RegimeType.CRISIS
        
        # Strong trends
        if abs(trend_strength) > 0.05:
            if trend_strength > 0:
                return RegimeType.TRENDING_UP
            else:
                return RegimeType.TRENDING_DOWN
        
        # High volatility but not crisis
        if volatility > 0.02:
            return RegimeType.VOLATILE
        
        # Low volatility
        if volatility < 0.01:
            return RegimeType.LOW_VOLATILITY
        
        # Sideways market
        return RegimeType.SIDEWAYS
    
    def _calculate_regime_confidence(self, characteristics: Dict[str, float], 
                                   regime_type: RegimeType) -> float:
        """Calculate confidence in regime classification"""
        # Base confidence on how well characteristics match regime
        confidence = 0.5
        
        if regime_type == RegimeType.TRENDING_UP:
            trend_strength = characteristics.get('trend_strength', 0.0)
            confidence += min(trend_strength / 0.1, 0.5)
        elif regime_type == RegimeType.TRENDING_DOWN:
            trend_strength = abs(characteristics.get('trend_strength', 0.0))
            confidence += min(trend_strength / 0.1, 0.5)
        elif regime_type == RegimeType.VOLATILE:
            volatility = characteristics.get('volatility', 0.0)
            confidence += min(volatility / 0.03, 0.5)
        
        return min(confidence, 1.0)
    
    def get_regime_history(self, days: int = 30) -> List[MarketRegime]:
        """Get recent regime history"""
        cutoff_date = datetime.now() - timedelta(days=days)
        return [r for r in self.regime_history if r.start_date >= cutoff_date]


class SentimentAnalyzer:
    """Market sentiment analysis"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize sentiment analyzer"""
        self.config = config or {}
        
    def analyze_sentiment(self, text_data: List[str]) -> Dict[str, float]:
        """Analyze sentiment from text data"""
        # Placeholder for sentiment analysis
        # In production, this would use NLP models like VADER, BERT, etc.
        
        sentiment_scores = {
            'positive': 0.0,
            'negative': 0.0,
            'neutral': 0.0,
            'compound': 0.0
        }
        
        # Simple keyword-based sentiment (replace with proper NLP)
        positive_words = ['bullish', 'rally', 'gain', 'up', 'positive', 'strong']
        negative_words = ['bearish', 'crash', 'loss', 'down', 'negative', 'weak']
        
        for text in text_data:
            text_lower = text.lower()
            pos_count = sum(1 for word in positive_words if word in text_lower)
            neg_count = sum(1 for word in negative_words if word in text_lower)
            
            if pos_count > neg_count:
                sentiment_scores['positive'] += 1
            elif neg_count > pos_count:
                sentiment_scores['negative'] += 1
            else:
                sentiment_scores['neutral'] += 1
        
        total = len(text_data) if text_data else 1
        for key in sentiment_scores:
            sentiment_scores[key] /= total
        
        sentiment_scores['compound'] = sentiment_scores['positive'] - sentiment_scores['negative']
        
        return sentiment_scores


class AIStrategyOptimizer:
    """AI-powered strategy optimization"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize AI strategy optimizer"""
        self.config = config or {}
        
    def generate_adaptive_parameters(self, market_data: pd.DataFrame, 
                                   regime: MarketRegime) -> Dict[str, Any]:
        """Generate adaptive parameters based on market regime"""
        base_params = self.config.get('base_parameters', {})
        
        # Adjust parameters based on regime
        if regime.regime_type == RegimeType.TRENDING_UP:
            return self._adjust_for_trending_up(base_params, regime)
        elif regime.regime_type == RegimeType.TRENDING_DOWN:
            return self._adjust_for_trending_down(base_params, regime)
        elif regime.regime_type == RegimeType.VOLATILE:
            return self._adjust_for_volatile(base_params, regime)
        elif regime.regime_type == RegimeType.LOW_VOLATILITY:
            return self._adjust_for_low_volatility(base_params, regime)
        else:
            return base_params
    
    def _adjust_for_trending_up(self, params: Dict[str, Any], regime: MarketRegime) -> Dict[str, Any]:
        """Adjust parameters for trending up market"""
        adjusted = params.copy()
        
        # Increase trend-following parameters
        if 'momentum_period' in adjusted:
            adjusted['momentum_period'] = max(5, adjusted['momentum_period'] - 5)
        
        if 'stop_loss' in adjusted:
            adjusted['stop_loss'] *= 1.2  # Wider stops in trending markets
        
        if 'take_profit' in adjusted:
            adjusted['take_profit'] *= 1.3  # Higher profit targets
        
        return adjusted
    
    def _adjust_for_trending_down(self, params: Dict[str, Any], regime: MarketRegime) -> Dict[str, Any]:
        """Adjust parameters for trending down market"""
        adjusted = params.copy()
        
        # Similar to trending up but for short positions
        if 'momentum_period' in adjusted:
            adjusted['momentum_period'] = max(5, adjusted['momentum_period'] - 5)
        
        if 'stop_loss' in adjusted:
            adjusted['stop_loss'] *= 1.2
        
        if 'take_profit' in adjusted:
            adjusted['take_profit'] *= 1.3
        
        return adjusted
    
    def _adjust_for_volatile(self, params: Dict[str, Any], regime: MarketRegime) -> Dict[str, Any]:
        """Adjust parameters for volatile market"""
        adjusted = params.copy()
        
        # Wider stops and shorter holding periods
        if 'stop_loss' in adjusted:
            adjusted['stop_loss'] *= 1.5
        
        if 'max_hold_period' in adjusted:
            adjusted['max_hold_period'] = max(1, adjusted['max_hold_period'] // 2)
        
        # Reduce position sizes
        if 'position_size' in adjusted:
            adjusted['position_size'] *= 0.7
        
        return adjusted
    
    def _adjust_for_low_volatility(self, params: Dict[str, Any], regime: MarketRegime) -> Dict[str, Any]:
        """Adjust parameters for low volatility market"""
        adjusted = params.copy()
        
        # Tighter stops and longer holding periods
        if 'stop_loss' in adjusted:
            adjusted['stop_loss'] *= 0.8
        
        if 'max_hold_period' in adjusted:
            adjusted['max_hold_period'] *= 1.5
        
        # Increase position sizes
        if 'position_size' in adjusted:
            adjusted['position_size'] *= 1.2
        
        return adjusted
