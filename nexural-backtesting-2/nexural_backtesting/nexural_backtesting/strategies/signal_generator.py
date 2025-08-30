"""
Signal Generator for Enterprise Quantitative Backtesting

This module provides signal generation, processing, filtering, and combination
capabilities for quantitative trading strategies.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple, Callable
from enum import Enum
import logging
from datetime import datetime
from scipy import signal as scipy_signal
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class SignalType(Enum):
    """Signal types"""
    CONTINUOUS = "continuous"  # -1 to 1 continuous signal
    BINARY = "binary"  # -1, 0, 1 discrete signal
    PROBABILITY = "probability"  # 0 to 1 probability signal
    RANKING = "ranking"  # Ranking-based signal


class FilterType(Enum):
    """Signal filter types"""
    MOVING_AVERAGE = "moving_average"
    KALMAN_FILTER = "kalman_filter"
    BUTTERWORTH = "butterworth"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
    MEDIAN_FILTER = "median_filter"
    WAVELET_DENOISING = "wavelet_denoising"


class CombinerType(Enum):
    """Signal combination methods"""
    EQUAL_WEIGHT = "equal_weight"
    VOLATILITY_WEIGHT = "volatility_weight"
    SHARPE_WEIGHT = "sharpe_weight"
    CORRELATION_WEIGHT = "correlation_weight"
    MACHINE_LEARNING = "machine_learning"
    ENSEMBLE = "ensemble"


@dataclass
class SignalConfig:
    """Configuration for signal generation"""
    signal_type: SignalType = SignalType.CONTINUOUS
    lookback_period: int = 20
    smoothing_period: int = 5
    threshold: float = 0.1
    decay_factor: float = 0.95
    volatility_lookback: int = 60
    correlation_lookback: int = 252
    min_signal_strength: float = 0.01
    max_signal_strength: float = 1.0


@dataclass
class SignalFilter:
    """Signal filter configuration"""
    filter_type: FilterType
    parameters: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    
    def apply(self, signal: pd.Series) -> pd.Series:
        """Apply filter to signal"""
        if not self.enabled:
            return signal
        
        if self.filter_type == FilterType.MOVING_AVERAGE:
            return self._apply_moving_average(signal)
        elif self.filter_type == FilterType.EXPONENTIAL_SMOOTHING:
            return self._apply_exponential_smoothing(signal)
        elif self.filter_type == FilterType.MEDIAN_FILTER:
            return self._apply_median_filter(signal)
        elif self.filter_type == FilterType.BUTTERWORTH:
            return self._apply_butterworth_filter(signal)
        else:
            logger.warning(f"Unsupported filter type: {self.filter_type}")
            return signal
    
    def _apply_moving_average(self, signal: pd.Series) -> pd.Series:
        """Apply moving average filter"""
        window = self.parameters.get('window', 5)
        return signal.rolling(window=window, min_periods=1).mean()
    
    def _apply_exponential_smoothing(self, signal: pd.Series) -> pd.Series:
        """Apply exponential smoothing filter"""
        alpha = self.parameters.get('alpha', 0.1)
        return signal.ewm(alpha=alpha).mean()
    
    def _apply_median_filter(self, signal: pd.Series) -> pd.Series:
        """Apply median filter"""
        window = self.parameters.get('window', 5)
        return signal.rolling(window=window, min_periods=1).median()
    
    def _apply_butterworth_filter(self, signal: pd.Series) -> pd.Series:
        """Apply Butterworth filter"""
        cutoff = self.parameters.get('cutoff', 0.1)
        order = self.parameters.get('order', 3)
        
        # Design filter
        nyquist = 0.5
        normal_cutoff = cutoff / nyquist
        b, a = scipy_signal.butter(order, normal_cutoff, btype='low')
        
        # Apply filter
        filtered = scipy_signal.filtfilt(b, a, signal.values)
        return pd.Series(filtered, index=signal.index)


@dataclass
class SignalCombiner:
    """Signal combination configuration"""
    combiner_type: CombinerType
    parameters: Dict[str, Any] = field(default_factory=dict)
    
    def combine(self, signals: Dict[str, pd.Series]) -> pd.Series:
        """Combine multiple signals"""
        if len(signals) == 1:
            return list(signals.values())[0]
        
        if self.combiner_type == CombinerType.EQUAL_WEIGHT:
            return self._equal_weight_combine(signals)
        elif self.combiner_type == CombinerType.VOLATILITY_WEIGHT:
            return self._volatility_weight_combine(signals)
        elif self.combiner_type == CombinerType.SHARPE_WEIGHT:
            return self._sharpe_weight_combine(signals)
        elif self.combiner_type == CombinerType.CORRELATION_WEIGHT:
            return self._correlation_weight_combine(signals)
        else:
            logger.warning(f"Unsupported combiner type: {self.combiner_type}")
            return self._equal_weight_combine(signals)
    
    def _equal_weight_combine(self, signals: Dict[str, pd.Series]) -> pd.Series:
        """Equal weight combination"""
        # Align signals
        aligned_signals = pd.DataFrame(signals).fillna(0)
        return aligned_signals.mean(axis=1)
    
    def _volatility_weight_combine(self, signals: Dict[str, pd.Series]) -> pd.Series:
        """Volatility-weighted combination"""
        lookback = self.parameters.get('volatility_lookback', 60)
        aligned_signals = pd.DataFrame(signals).fillna(0)
        
        # Calculate inverse volatility weights
        volatilities = aligned_signals.rolling(lookback).std()
        inv_volatilities = 1.0 / (volatilities + 1e-8)  # Avoid division by zero
        weights = inv_volatilities.div(inv_volatilities.sum(axis=1), axis=0)
        
        # Weighted combination
        return (aligned_signals * weights).sum(axis=1)
    
    def _sharpe_weight_combine(self, signals: Dict[str, pd.Series]) -> pd.Series:
        """Sharpe ratio weighted combination"""
        lookback = self.parameters.get('sharpe_lookback', 252)
        risk_free_rate = self.parameters.get('risk_free_rate', 0.02) / 252
        
        aligned_signals = pd.DataFrame(signals).fillna(0)
        
        # Calculate Sharpe ratios
        returns = aligned_signals.pct_change()
        excess_returns = returns - risk_free_rate
        sharpe_ratios = (excess_returns.rolling(lookback).mean() / 
                        returns.rolling(lookback).std())
        
        # Use absolute Sharpe ratios as weights
        weights = sharpe_ratios.abs()
        weights = weights.div(weights.sum(axis=1), axis=0)
        
        return (aligned_signals * weights).sum(axis=1)
    
    def _correlation_weight_combine(self, signals: Dict[str, pd.Series]) -> pd.Series:
        """Correlation-weighted combination"""
        lookback = self.parameters.get('correlation_lookback', 252)
        aligned_signals = pd.DataFrame(signals).fillna(0)
        
        # Calculate correlation matrix
        correlations = aligned_signals.rolling(lookback).corr()
        
        # Use inverse correlation as weights (diversification)
        weights = 1.0 / (correlations + 1e-8)
        weights = weights.div(weights.sum(axis=1), axis=0)
        
        return (aligned_signals * weights).sum(axis=1)


class SignalGenerator:
    """
    Comprehensive signal generator for quantitative trading strategies
    """
    
    def __init__(self, config: SignalConfig):
        """
        Initialize signal generator
        
        Args:
            config: Signal generation configuration
        """
        self.config = config
        self.filters: List[SignalFilter] = []
        self.combiner: Optional[SignalCombiner] = None
        self.scaler = StandardScaler()
        
        logger.info("Signal generator initialized")
    
    def add_filter(self, filter_config: SignalFilter):
        """Add signal filter"""
        self.filters.append(filter_config)
        logger.info(f"Added filter: {filter_config.filter_type.value}")
    
    def set_combiner(self, combiner_config: SignalCombiner):
        """Set signal combiner"""
        self.combiner = combiner_config
        logger.info(f"Set combiner: {combiner_config.combiner_type.value}")
    
    def generate_signal(
        self,
        data: pd.DataFrame,
        strategy_functions: List[Callable],
        strategy_names: Optional[List[str]] = None
    ) -> pd.Series:
        """
        Generate combined signal from multiple strategies
        
        Args:
            data: Market data
            strategy_functions: List of strategy functions
            strategy_names: Optional strategy names
            
        Returns:
            Combined signal series
        """
        if strategy_names is None:
            strategy_names = [f"strategy_{i}" for i in range(len(strategy_functions))]
        
        # Generate individual signals
        signals = {}
        for name, func in zip(strategy_names, strategy_functions):
            try:
                signal = self._generate_single_signal(data, func)
                signals[name] = signal
            except Exception as e:
                logger.error(f"Error generating signal for {name}: {e}")
                continue
        
        if not signals:
            logger.error("No valid signals generated")
            return pd.Series(0.0, index=data.index)
        
        # Apply filters to individual signals
        filtered_signals = {}
        for name, signal in signals.items():
            filtered_signal = signal.copy()
            for filter_config in self.filters:
                filtered_signal = filter_config.apply(filtered_signal)
            filtered_signals[name] = filtered_signal
        
        # Combine signals
        if self.combiner and len(filtered_signals) > 1:
            combined_signal = self.combiner.combine(filtered_signals)
        else:
            combined_signal = list(filtered_signals.values())[0]
        
        # Apply final processing
        final_signal = self._post_process_signal(combined_signal)
        
        return final_signal
    
    def _generate_single_signal(
        self,
        data: pd.DataFrame,
        strategy_function: Callable
    ) -> pd.Series:
        """Generate signal from single strategy"""
        signals = []
        
        for i in range(len(data)):
            if i < self.config.lookback_period:
                signals.append(0.0)
                continue
            
            # Get features for current timestep
            features = self._extract_features(data, i)
            
            # Generate signal
            try:
                signal = strategy_function(features)
                signals.append(signal)
            except Exception as e:
                logger.warning(f"Error in strategy function: {e}")
                signals.append(0.0)
        
        return pd.Series(signals, index=data.index)
    
    def _extract_features(self, data: pd.DataFrame, index: int) -> Dict[str, Any]:
        """Extract features for signal generation"""
        features = {}
        
        # Price features
        if 'close' in data.columns:
            features['close'] = data['close'].iloc[index]
            features['returns'] = data['close'].pct_change().iloc[index]
            
            # Moving averages
            for period in [5, 10, 20, 50]:
                features[f'sma_{period}'] = data['close'].rolling(period).mean().iloc[index]
                features[f'ema_{period}'] = data['close'].ewm(span=period).mean().iloc[index]
        
        # Volume features
        if 'volume' in data.columns:
            features['volume'] = data['volume'].iloc[index]
            features['volume_sma'] = data['volume'].rolling(20).mean().iloc[index]
            features['volume_ratio'] = (data['volume'].iloc[index] / 
                                      data['volume'].rolling(20).mean().iloc[index])
        
        # Volatility features
        if 'close' in data.columns:
            returns = data['close'].pct_change()
            features['volatility'] = returns.rolling(20).std().iloc[index]
            features['realized_vol'] = returns.rolling(60).std().iloc[index]
        
        # Technical indicators
        if 'close' in data.columns and 'volume' in data.columns:
            features.update(self._calculate_technical_indicators(data, index))
        
        return features
    
    def _calculate_technical_indicators(
        self,
        data: pd.DataFrame,
        index: int
    ) -> Dict[str, float]:
        """Calculate technical indicators"""
        indicators = {}
        
        # RSI
        if index >= 14:
            delta = data['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            indicators['rsi'] = 100 - (100 / (1 + rs.iloc[index]))
        
        # MACD
        if index >= 26:
            ema12 = data['close'].ewm(span=12).mean()
            ema26 = data['close'].ewm(span=26).mean()
            macd = ema12 - ema26
            signal = macd.ewm(span=9).mean()
            indicators['macd'] = macd.iloc[index]
            indicators['macd_signal'] = signal.iloc[index]
            indicators['macd_histogram'] = macd.iloc[index] - signal.iloc[index]
        
        # Bollinger Bands
        if index >= 20:
            sma20 = data['close'].rolling(20).mean()
            std20 = data['close'].rolling(20).std()
            indicators['bb_upper'] = sma20.iloc[index] + (2 * std20.iloc[index])
            indicators['bb_lower'] = sma20.iloc[index] - (2 * std20.iloc[index])
            indicators['bb_position'] = ((data['close'].iloc[index] - indicators['bb_lower']) / 
                                       (indicators['bb_upper'] - indicators['bb_lower']))
        
        return indicators
    
    def _post_process_signal(self, signal: pd.Series) -> pd.Series:
        """Post-process combined signal"""
        # Apply smoothing
        if self.config.smoothing_period > 1:
            signal = signal.rolling(
                window=self.config.smoothing_period,
                min_periods=1
            ).mean()
        
        # Apply threshold
        if self.config.threshold > 0:
            signal = signal.where(abs(signal) >= self.config.threshold, 0.0)
        
        # Apply decay
        if self.config.decay_factor < 1.0:
            signal = signal * self.config.decay_factor
        
        # Clip to bounds
        signal = signal.clip(
            lower=-self.config.max_signal_strength,
            upper=self.config.max_signal_strength
        )
        
        # Convert signal type
        if self.config.signal_type == SignalType.BINARY:
            signal = np.sign(signal)
        elif self.config.signal_type == SignalType.PROBABILITY:
            signal = (signal + 1) / 2  # Convert from [-1, 1] to [0, 1]
        
        return signal
    
    def calculate_signal_quality(
        self,
        signal: pd.Series,
        returns: pd.Series
    ) -> Dict[str, float]:
        """Calculate signal quality metrics"""
        if len(signal) != len(returns):
            raise ValueError("Signal and returns must have same length")
        
        # Align data
        aligned_data = pd.DataFrame({
            'signal': signal,
            'returns': returns
        }).dropna()
        
        if len(aligned_data) < 2:
            return {
                'signal_mean': float(signal.mean()),
                'signal_std': float(signal.std()),
                'signal_skew': float(signal.skew()) if hasattr(signal, 'skew') else 0.0,
                'signal_kurtosis': float(signal.kurtosis()) if hasattr(signal, 'kurtosis') else 0.0,
                'signal_autocorr': float(signal.autocorr()) if hasattr(signal, 'autocorr') else 0.0,
                'signal_turnover': float(signal.diff().abs().mean()),
                'signal_stability': 1.0,
                'information_coefficient': 0.0,
            }
        
        signal_series = aligned_data['signal']
        returns_series = aligned_data['returns']
        
        # Basic metrics
        metrics = {
            'signal_mean': signal_series.mean(),
            'signal_std': signal_series.std(),
            'signal_skew': signal_series.skew(),
            'signal_kurtosis': signal_series.kurtosis(),
            'signal_autocorr': signal_series.autocorr(),
            'signal_turnover': signal_series.diff().abs().mean()
        }
        
        # Predictive power
        if signal_series.std() > 0:
            # Information coefficient
            try:
                ic = signal_series.corr(returns_series.shift(-1))
            except Exception:
                ic = np.nan
            metrics['information_coefficient'] = ic if np.isfinite(ic) else 0.0
            
            # Hit rate
            positive_signals = signal_series > 0
            negative_signals = signal_series < 0
            
            if positive_signals.sum() > 0:
                positive_returns = returns_series.shift(-1)[positive_signals]
                metrics['positive_hit_rate'] = (positive_returns > 0).mean()
            
            if negative_signals.sum() > 0:
                negative_returns = returns_series.shift(-1)[negative_signals]
                metrics['negative_hit_rate'] = (negative_returns < 0).mean()
        
        # Ensure key exists even if predictive power could not be computed
        if 'information_coefficient' not in metrics:
            metrics['information_coefficient'] = 0.0

        # Signal stability
        signal_changes = signal_series.diff().abs()
        metrics['signal_stability'] = 1.0 / (1.0 + signal_changes.mean())
        
        return metrics
    
    def generate_signal_report(
        self,
        signal: pd.Series,
        returns: pd.Series,
        strategy_name: str = "Unknown"
    ) -> Dict[str, Any]:
        """Generate comprehensive signal report"""
        quality_metrics = self.calculate_signal_quality(signal, returns)
        
        report = {
            'strategy_name': strategy_name,
            'signal_length': len(signal),
            'signal_type': self.config.signal_type.value,
            'quality_metrics': quality_metrics,
            'signal_statistics': {
                'mean': signal.mean(),
                'std': signal.std(),
                'min': signal.min(),
                'max': signal.max(),
                'non_zero_ratio': (signal != 0).mean()
            },
            'configuration': {
                'lookback_period': self.config.lookback_period,
                'smoothing_period': self.config.smoothing_period,
                'threshold': self.config.threshold,
                'decay_factor': self.config.decay_factor
            }
        }
        
        return report
