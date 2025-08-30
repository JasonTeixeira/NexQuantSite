"""
Example trading strategies
"""

import numpy as np
from typing import Dict, List
from .base_strategy import BaseStrategy

class MicrostructureStrategy(BaseStrategy):
    """
    Example microstructure-based strategy using order book imbalance
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'imbalance_threshold': 0.6,
            'lookback_period': 20,
            'max_spread_bps': 3.0,
            'volatility_filter': 0.30,
            'time_of_day_filter': True,
            'event_day_reduction': 0.5,
            'position_scale': 1.0
        }
    
    def generate_signal(self, features: Dict) -> float:
        """
        Generate signal based on order book imbalance and other factors
        
        Args:
            features: Market features
            
        Returns:
            Signal strength (-1 to 1)
        """
        signal = 0.0
        
        # 1. Book imbalance signal (primary)
        imbalance = features.get('book_imbalance', 0)
        
        if abs(imbalance) > self.parameters['imbalance_threshold']:
            signal = np.sign(imbalance) * min(abs(imbalance), 1.0)
        
        # 2. Spread filter (don't trade wide spreads)
        spread_bps = features.get('spread_bps', 0)
        if spread_bps > self.parameters['max_spread_bps']:
            signal *= 0.3  # Reduce but don't eliminate
        
        # 3. Volatility filter
        volatility = features.get('realized_vol', 0)
        if volatility > self.parameters['volatility_filter']:
            signal *= 0.5
        
        # 4. Time of day filter
        if self.parameters['time_of_day_filter']:
            hour = features.get('hour', 12)
            
            # Reduce during first and last 30 minutes
            if hour == 9 or (hour == 15 and features.get('minute', 0) >= 30):
                signal *= 0.7
            
            # Best hours (10am-2pm)
            elif 10 <= hour <= 14:
                signal *= 1.1
        
        # 5. Event day filter
        if features.get('is_fomc', False) or features.get('is_nfp', False):
            signal *= self.parameters['event_day_reduction']
        
        # 6. Microprice confirmation
        microprice = features.get('microprice', 0)
        mid_price = features.get('mid_price', 0)
        
        if mid_price > 0:
            microprice_signal = (microprice - mid_price) / mid_price
            
            # Only trade if microprice agrees with direction
            if np.sign(microprice_signal) != np.sign(signal):
                signal *= 0.5
        
        # 7. Scale final signal
        signal *= self.parameters['position_scale']
        
        # Clip to [-1, 1]
        return np.clip(signal, -1, 1)
    
    def get_parameter_grid(self) -> List[Dict]:
        """Get parameter grid for optimization"""
        grid = []
        
        # Define ranges to test
        for imbalance in [0.5, 0.6, 0.7]:
            for spread in [2.0, 3.0, 4.0]:
                for vol_filter in [0.25, 0.30, 0.35]:
                    params = self.get_default_parameters()
                    params['imbalance_threshold'] = imbalance
                    params['max_spread_bps'] = spread
                    params['volatility_filter'] = vol_filter
                    grid.append(params)
        
        return grid

class MomentumStrategy(BaseStrategy):
    """
    Momentum strategy based on price and volume momentum
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'price_momentum_period': 20,
            'volume_momentum_period': 10,
            'momentum_threshold': 0.02,
            'volume_threshold': 1.5,
            'max_position_hold': 10,
            'stop_loss': 0.05,
            'take_profit': 0.10
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate momentum signal"""
        signal = 0.0
        
        # Price momentum
        price_momentum = features.get('price_momentum', 0)
        if abs(price_momentum) > self.parameters['momentum_threshold']:
            signal += np.sign(price_momentum) * 0.6
        
        # Volume momentum
        volume_ratio = features.get('volume_ratio', 1.0)
        if volume_ratio > self.parameters['volume_threshold']:
            signal *= 1.2  # Amplify signal with high volume
        
        # Technical indicators
        rsi = features.get('rsi', 50)
        if rsi > 70:  # Overbought
            signal *= 0.8
        elif rsi < 30:  # Oversold
            signal *= 0.8
        
        return np.clip(signal, -1, 1)
    
    def get_parameter_grid(self) -> List[Dict]:
        """Get parameter grid for optimization"""
        grid = []
        
        for momentum_period in [10, 20, 30]:
            for momentum_threshold in [0.01, 0.02, 0.03]:
                for volume_threshold in [1.2, 1.5, 2.0]:
                    params = self.get_default_parameters()
                    params['price_momentum_period'] = momentum_period
                    params['momentum_threshold'] = momentum_threshold
                    params['volume_threshold'] = volume_threshold
                    grid.append(params)
        
        return grid

class MomentumReversalStrategy(BaseStrategy):
    """
    Strategy that trades momentum in trending markets and mean reversion in ranging markets
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'momentum_lookback': 50,
            'reversal_lookback': 20,
            'regime_lookback': 100,
            'momentum_threshold': 0.002,
            'reversal_threshold': 2.0,
            'volume_filter': True,
            'book_pressure_weight': 0.3
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate signal based on market regime"""
        
        # Determine market regime (trending vs ranging)
        regime = self._determine_regime(features)
        
        if regime == 'trending':
            signal = self._momentum_signal(features)
        else:
            signal = self._reversal_signal(features)
        
        # Add book pressure overlay
        book_pressure = features.get('book_pressure', 0)
        signal = signal * (1 - self.parameters['book_pressure_weight']) + \
                 book_pressure * self.parameters['book_pressure_weight']
        
        return np.clip(signal, -1, 1)
    
    def _determine_regime(self, features: Dict) -> str:
        """Determine if market is trending or ranging"""
        
        # Simple regime detection based on volatility
        vol = features.get('realized_vol', 0.15)
        vix = features.get('vix', 16)
        
        if vol > 0.20 or vix > 25:
            return 'ranging'
        else:
            return 'trending'
    
    def _momentum_signal(self, features: Dict) -> float:
        """Generate momentum signal"""
        
        # This would use price momentum indicators
        # Simplified for example
        return 0.0
    
    def _reversal_signal(self, features: Dict) -> float:
        """Generate mean reversion signal"""
        
        # This would use reversal indicators
        # Simplified for example
        return 0.0

class MeanReversionStrategy(BaseStrategy):
    """
    Mean reversion strategy based on Bollinger Bands and RSI
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'bb_period': 20,
            'bb_std': 2.0,
            'rsi_period': 14,
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'volume_threshold': 1.5,
            'max_hold_period': 5
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate mean reversion signal"""
        
        signal = 0.0
        
        # Get price data (simplified)
        mid_price = features.get('mid_price', 4500)
        
        # Mock Bollinger Bands calculation
        bb_upper = mid_price * 1.02  # Mock upper band
        bb_lower = mid_price * 0.98  # Mock lower band
        
        # Mock RSI
        rsi = np.random.uniform(0, 100)  # Mock RSI value
        
        # Generate signals
        if mid_price > bb_upper and rsi > self.parameters['rsi_overbought']:
            signal = -0.8  # Sell signal
        elif mid_price < bb_lower and rsi < self.parameters['rsi_oversold']:
            signal = 0.8  # Buy signal
        
        # Volume confirmation
        volume = features.get('volume', 1.0)
        if volume > self.parameters['volume_threshold']:
            signal *= 1.2  # Amplify signal
        
        return np.clip(signal, -1, 1)

class BreakoutStrategy(BaseStrategy):
    """
    Breakout strategy based on support/resistance levels
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'breakout_threshold': 0.005,
            'confirmation_period': 3,
            'volume_multiplier': 2.0,
            'stop_loss': 0.02,
            'take_profit': 0.05
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate breakout signal"""
        
        signal = 0.0
        
        # Mock breakout detection
        mid_price = features.get('mid_price', 4500)
        
        # Simulate breakout above resistance
        if np.random.random() < 0.1:  # 10% chance of breakout
            signal = 0.9  # Strong buy signal
        
        # Volume confirmation
        volume = features.get('volume', 1.0)
        if volume > self.parameters['volume_multiplier']:
            signal *= 1.1
        
        return np.clip(signal, -1, 1)

class PairsTradingStrategy(BaseStrategy):
    """
    Pairs trading strategy based on cointegration
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'lookback_period': 60,
            'entry_threshold': 2.0,
            'exit_threshold': 0.5,
            'max_position_duration': 20,
            'correlation_threshold': 0.8,
            'cointegration_threshold': 0.05
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate pairs trading signal"""
        
        signal = 0.0
        
        # Get spread between pairs
        spread = features.get('pair_spread', 0)
        spread_zscore = features.get('spread_zscore', 0)
        
        # Entry signals based on z-score
        if spread_zscore > self.parameters['entry_threshold']:
            signal = -0.8  # Short the expensive leg
        elif spread_zscore < -self.parameters['entry_threshold']:
            signal = 0.8  # Long the cheap leg
        
        # Exit signals
        if abs(spread_zscore) < self.parameters['exit_threshold']:
            signal = 0.0  # Close position
        
        # Correlation filter
        correlation = features.get('pair_correlation', 0.9)
        if correlation < self.parameters['correlation_threshold']:
            signal *= 0.5  # Reduce signal strength
        
        return np.clip(signal, -1, 1)
    
    def get_parameter_grid(self) -> List[Dict]:
        """Get parameter grid for optimization"""
        grid = []
        
        for lookback in [30, 60, 90]:
            for entry_threshold in [1.5, 2.0, 2.5]:
                for exit_threshold in [0.3, 0.5, 0.7]:
                    params = self.get_default_parameters()
                    params['lookback_period'] = lookback
                    params['entry_threshold'] = entry_threshold
                    params['exit_threshold'] = exit_threshold
                    grid.append(params)
        
        return grid

class StatisticalArbitrageStrategy(BaseStrategy):
    """
    Statistical arbitrage strategy based on mean reversion of spreads
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'lookback_period': 60,
            'entry_threshold': 2.0,
            'exit_threshold': 0.5,
            'max_position_duration': 10,
            'correlation_threshold': 0.8
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate statistical arbitrage signal"""
        
        signal = 0.0
        
        # Mock spread calculation
        spread = features.get('spread_bps', 2.0)
        
        # Mean reversion logic
        if spread > self.parameters['entry_threshold']:
            signal = -0.7  # Short signal
        elif spread < -self.parameters['entry_threshold']:
            signal = 0.7  # Long signal
        
        return np.clip(signal, -1, 1)

class MultiFactorStrategy(BaseStrategy):
    """
    Multi-factor strategy combining multiple signals
    """
    
    def get_default_parameters(self) -> Dict:
        """Get default parameters"""
        return {
            'microstructure_weight': 0.4,
            'momentum_weight': 0.3,
            'mean_reversion_weight': 0.2,
            'sentiment_weight': 0.1,
            'signal_threshold': 0.3
        }
    
    def generate_signal(self, features: Dict) -> float:
        """Generate multi-factor signal"""
        
        # Get individual signals
        microstructure_signal = self._get_microstructure_signal(features)
        momentum_signal = self._get_momentum_signal(features)
        mean_reversion_signal = self._get_mean_reversion_signal(features)
        sentiment_signal = self._get_sentiment_signal(features)
        
        # Combine signals with weights
        combined_signal = (
            microstructure_signal * self.parameters['microstructure_weight'] +
            momentum_signal * self.parameters['momentum_weight'] +
            mean_reversion_signal * self.parameters['mean_reversion_weight'] +
            sentiment_signal * self.parameters['sentiment_weight']
        )
        
        # Apply threshold
        if abs(combined_signal) < self.parameters['signal_threshold']:
            combined_signal = 0
        
        return np.clip(combined_signal, -1, 1)
    
    def _get_microstructure_signal(self, features: Dict) -> float:
        """Get microstructure signal"""
        imbalance = features.get('book_imbalance', 0)
        return np.clip(imbalance, -1, 1)
    
    def _get_momentum_signal(self, features: Dict) -> float:
        """Get momentum signal"""
        # Mock momentum calculation
        return np.random.normal(0, 0.3)
    
    def _get_mean_reversion_signal(self, features: Dict) -> float:
        """Get mean reversion signal"""
        # Mock mean reversion calculation
        return np.random.normal(0, 0.2)
    
    def _get_sentiment_signal(self, features: Dict) -> float:
        """Get sentiment signal"""
        sentiment = features.get('sentiment_score', 0)
        return np.clip(sentiment, -1, 1) 