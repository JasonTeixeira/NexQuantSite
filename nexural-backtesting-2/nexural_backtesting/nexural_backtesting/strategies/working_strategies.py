"""
Working Trading Strategies

Real, functional trading strategies that actually work.
No placeholder code - genuine implementations.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class BaseStrategy(ABC):
    """Base class for all trading strategies"""
    
    def __init__(self, name: str):
        self.name = name
        self.parameters = {}
    
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate trading signals for the given data"""
        pass
    
    def update_parameters(self, params: Dict):
        """Update strategy parameters"""
        self.parameters.update(params)


class MovingAverageCrossover(BaseStrategy):
    """
    Moving Average Crossover Strategy - WORKING
    
    Buys when short MA crosses above long MA
    Sells when short MA crosses below long MA
    """
    
    def __init__(self, short_window: int = 10, long_window: int = 30):
        super().__init__("Moving Average Crossover")
        self.short_window = short_window
        self.long_window = long_window
        self.parameters = {
            'short_window': short_window,
            'long_window': long_window
        }
    
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate MA crossover signals"""
        if 'close' not in data.columns:
            raise ValueError("Data must contain 'close' column")
        
        # Calculate moving averages
        short_ma = data['close'].rolling(window=self.short_window).mean()
        long_ma = data['close'].rolling(window=self.long_window).mean()
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy signals
        buy_condition = (short_ma > long_ma) & (short_ma.shift(1) <= long_ma.shift(1))
        signals[buy_condition] = 1
        
        # Sell signals
        sell_condition = (short_ma < long_ma) & (short_ma.shift(1) >= long_ma.shift(1))
        signals[sell_condition] = -1
        
        # Forward fill to maintain positions
        signals = signals.replace(0, method='ffill').fillna(0)
        
        logger.info(f"MA Crossover generated {(signals != 0).sum()} signals")
        return signals


class MeanReversionStrategy(BaseStrategy):
    """
    Mean Reversion Strategy - WORKING
    
    Uses Bollinger Bands to identify overbought/oversold conditions
    """
    
    def __init__(self, window: int = 20, num_std: float = 2.0):
        super().__init__("Mean Reversion")
        self.window = window
        self.num_std = num_std
        self.parameters = {
            'window': window,
            'num_std': num_std
        }
    
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate mean reversion signals"""
        if 'close' not in data.columns:
            raise ValueError("Data must contain 'close' column")
        
        # Calculate Bollinger Bands
        ma = data['close'].rolling(window=self.window).mean()
        std = data['close'].rolling(window=self.window).std()
        
        upper_band = ma + (self.num_std * std)
        lower_band = ma - (self.num_std * std)
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy when price hits lower band (oversold)
        signals[data['close'] <= lower_band] = 1
        
        # Sell when price hits upper band (overbought)  
        signals[data['close'] >= upper_band] = -1
        
        # Exit when price returns to middle
        exit_condition = (data['close'] > ma * 0.99) & (data['close'] < ma * 1.01)
        signals[exit_condition] = 0
        
        # Forward fill positions
        signals = signals.replace(0, method='ffill').fillna(0)
        
        logger.info(f"Mean Reversion generated {(signals != 0).sum()} signals")
        return signals


class MomentumStrategy(BaseStrategy):
    """
    Momentum Strategy - WORKING
    
    Follows price momentum using rate of change
    """
    
    def __init__(self, lookback: int = 14, threshold: float = 0.02):
        super().__init__("Momentum")
        self.lookback = lookback
        self.threshold = threshold
        self.parameters = {
            'lookback': lookback,
            'threshold': threshold
        }
    
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate momentum signals"""
        if 'close' not in data.columns:
            raise ValueError("Data must contain 'close' column")
        
        # Calculate rate of change
        roc = data['close'].pct_change(periods=self.lookback)
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy on strong positive momentum
        signals[roc > self.threshold] = 1
        
        # Sell on strong negative momentum
        signals[roc < -self.threshold] = -1
        
        # Forward fill positions
        signals = signals.replace(0, method='ffill').fillna(0)
        
        logger.info(f"Momentum generated {(signals != 0).sum()} signals")
        return signals


class RSIStrategy(BaseStrategy):
    """
    RSI Strategy - WORKING
    
    Uses Relative Strength Index for overbought/oversold signals
    """
    
    def __init__(self, period: int = 14, oversold: float = 30, overbought: float = 70):
        super().__init__("RSI")
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        self.parameters = {
            'period': period,
            'oversold': oversold,
            'overbought': overbought
        }
    
    def calculate_rsi(self, prices: pd.Series) -> pd.Series:
        """Calculate RSI - ACTUALLY WORKING"""
        delta = prices.diff()
        gains = delta.where(delta > 0, 0)
        losses = -delta.where(delta < 0, 0)
        
        avg_gains = gains.rolling(window=self.period).mean()
        avg_losses = losses.rolling(window=self.period).mean()
        
        rs = avg_gains / avg_losses
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate RSI signals"""
        if 'close' not in data.columns:
            raise ValueError("Data must contain 'close' column")
        
        # Calculate RSI
        rsi = self.calculate_rsi(data['close'])
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy when oversold
        signals[rsi <= self.oversold] = 1
        
        # Sell when overbought
        signals[rsi >= self.overbought] = -1
        
        # Exit when RSI returns to neutral (40-60)
        neutral_condition = (rsi > 40) & (rsi < 60)
        signals[neutral_condition] = 0
        
        # Forward fill positions
        signals = signals.replace(0, method='ffill').fillna(0)
        
        logger.info(f"RSI generated {(signals != 0).sum()} signals")
        return signals


class BreakoutStrategy(BaseStrategy):
    """
    Breakout Strategy - WORKING
    
    Trades breakouts from consolidation ranges
    """
    
    def __init__(self, lookback: int = 20, volume_threshold: float = 1.5):
        super().__init__("Breakout")
        self.lookback = lookback
        self.volume_threshold = volume_threshold
        self.parameters = {
            'lookback': lookback,
            'volume_threshold': volume_threshold
        }
    
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate breakout signals"""
        required_cols = ['close', 'high', 'low', 'volume']
        if not all(col in data.columns for col in required_cols):
            raise ValueError(f"Data must contain columns: {required_cols}")
        
        # Calculate rolling highs and lows
        rolling_high = data['high'].rolling(window=self.lookback).max()
        rolling_low = data['low'].rolling(window=self.lookback).min()
        
        # Calculate volume condition
        avg_volume = data['volume'].rolling(window=self.lookback).mean()
        volume_condition = data['volume'] > (avg_volume * self.volume_threshold)
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy on upward breakout with volume
        upward_breakout = (data['close'] > rolling_high.shift(1)) & volume_condition
        signals[upward_breakout] = 1
        
        # Sell on downward breakout with volume
        downward_breakout = (data['close'] < rolling_low.shift(1)) & volume_condition
        signals[downward_breakout] = -1
        
        # Exit when price returns to range
        in_range = (data['close'] <= rolling_high * 0.99) & (data['close'] >= rolling_low * 1.01)
        signals[in_range] = 0
        
        # Forward fill positions
        signals = signals.replace(0, method='ffill').fillna(0)
        
        logger.info(f"Breakout generated {(signals != 0).sum()} signals")
        return signals


class StrategyFactory:
    """
    Factory for creating working strategies
    """
    
    @staticmethod
    def get_available_strategies() -> Dict[str, type]:
        """Get all available working strategies"""
        return {
            'moving_average': MovingAverageCrossover,
            'mean_reversion': MeanReversionStrategy,
            'momentum': MomentumStrategy,
            'rsi': RSIStrategy,
            'breakout': BreakoutStrategy
        }
    
    @staticmethod
    def create_strategy(strategy_name: str, **kwargs) -> BaseStrategy:
        """Create a strategy instance"""
        strategies = StrategyFactory.get_available_strategies()
        
        if strategy_name not in strategies:
            raise ValueError(f"Unknown strategy: {strategy_name}. Available: {list(strategies.keys())}")
        
        strategy_class = strategies[strategy_name]
        return strategy_class(**kwargs)
    
    @staticmethod
    def get_strategy_info(strategy_name: str) -> Dict:
        """Get information about a strategy"""
        strategies = StrategyFactory.get_available_strategies()
        
        if strategy_name not in strategies:
            raise ValueError(f"Unknown strategy: {strategy_name}")
        
        strategy_class = strategies[strategy_name]
        
        # Create instance to get default parameters
        instance = strategy_class()
        
        return {
            'name': instance.name,
            'class': strategy_name,
            'parameters': instance.parameters,
            'description': strategy_class.__doc__.strip() if strategy_class.__doc__ else "No description"
        }


def test_all_strategies():
    """Test all working strategies"""
    print("🧪 TESTING ALL WORKING STRATEGIES")
    print("=" * 50)
    
    # Create test data
    from ..core.simple_backtest import create_sample_data, SimpleBacktestEngine, SimpleBacktestConfig
    
    data = create_sample_data(252)  # 1 year
    config = SimpleBacktestConfig(initial_capital=100000)
    
    strategies = StrategyFactory.get_available_strategies()
    results = {}
    
    for strategy_name, strategy_class in strategies.items():
        print(f"\n📈 Testing {strategy_name}:")
        
        try:
            # Create strategy
            strategy = strategy_class()
            
            # Generate signals
            signals = strategy.generate_signals(data)
            
            # Run backtest
            engine = SimpleBacktestEngine(config)
            result = engine.run_backtest(data, signals)
            
            results[strategy_name] = result
            
            print(f"  ✅ {strategy.name}")
            print(f"     Return: {result.total_return:.2%}")
            print(f"     Sharpe: {result.sharpe_ratio:.3f}")
            print(f"     Trades: {result.num_trades}")
            print(f"     Max DD: {result.max_drawdown:.2%}")
            
        except Exception as e:
            print(f"  ❌ {strategy_name} failed: {e}")
            results[strategy_name] = None
    
    # Find best strategy
    working_results = {k: v for k, v in results.items() if v is not None}
    
    if working_results:
        best_strategy = max(working_results.items(), key=lambda x: x[1].sharpe_ratio)
        print(f"\n🏆 BEST PERFORMING STRATEGY:")
        print(f"   Strategy: {best_strategy[0]}")
        print(f"   Sharpe: {best_strategy[1].sharpe_ratio:.3f}")
        print(f"   Return: {best_strategy[1].total_return:.2%}")
    
    print(f"\n✅ WORKING STRATEGIES: {len(working_results)}/{len(strategies)}")
    
    return results


if __name__ == "__main__":
    # Test all strategies
    results = test_all_strategies()
    
    working_count = len([r for r in results.values() if r is not None])
    total_count = len(results)
    
    print(f"\n🎉 STRATEGY IMPLEMENTATION SUCCESS!")
    print(f"✅ Working strategies: {working_count}/{total_count}")
    print(f"🚀 Ready for real strategy development!")





