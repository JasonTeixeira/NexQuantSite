#!/usr/bin/env python3
"""
Basic Backtesting Example
========================

Demonstrates basic usage of the Nexural Backtesting System.
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from nexural_backtesting import ReliableBacktestEngine, BacktestConfig


def basic_moving_average_strategy():
    """
    Example: Moving Average Crossover Strategy
    
    This demonstrates the basic usage of the backtesting engine
    with a simple moving average crossover strategy.
    """
    
    print("🚀 Nexural Backtesting System - Basic Example")
    print("=" * 50)
    
    # Generate sample market data
    dates = pd.date_range('2023-01-01', periods=252, freq='D')
    np.random.seed(42)  # For reproducible results
    
    # Realistic price simulation
    returns = np.random.normal(0.0005, 0.02, 252)
    prices = 100 * np.exp(np.cumsum(returns))
    
    market_data = pd.DataFrame({
        'close': prices,
        'volume': np.random.lognormal(10, 0.5, 252)
    }, index=dates)
    
    print(f"📊 Generated {len(market_data)} days of market data")
    print(f"   Price range: ${prices.min():.2f} - ${prices.max():.2f}")
    
    # Create moving average signals
    short_ma = market_data['close'].rolling(20).mean()
    long_ma = market_data['close'].rolling(50).mean()
    
    # Generate buy/sell signals
    signals = pd.Series(0, index=dates)
    signals[short_ma > long_ma] = 1   # Buy signal
    signals[short_ma <= long_ma] = -1  # Sell signal
    
    signal_count = len(signals[signals != 0])
    print(f"📈 Generated {signal_count} trading signals")
    
    # Configure backtesting engine
    config = BacktestConfig(
        initial_capital=1_000_000,
        commission=0.001,  # 0.1%
        slippage=0.0005,   # 0.05%
        max_position_size=0.25  # 25% max position
    )
    
    # Initialize and run backtest
    engine = ReliableBacktestEngine(config)
    
    print("\n⚡ Running backtest with institutional-grade engine...")
    results = engine.backtest_strategy(
        market_data, 
        signals, 
        market_data['close']
    )
    
    # Display results
    print("\n🏆 BACKTEST RESULTS")
    print("=" * 30)
    print(f"Total Return:     {results['total_return']:8.2%}")
    print(f"Sharpe Ratio:     {results.get('sharpe_ratio', 0):8.2f}")
    print(f"Max Drawdown:     {results['max_drawdown']:8.2%}")
    print(f"Total Trades:     {results['total_trades']:8.0f}")
    print(f"Win Rate:         {results.get('win_rate', 0):8.2%}")
    print(f"Final Value:      ${results.get('final_value', 0):8,.2f}")
    
    print(f"\n✅ Backtest completed successfully!")
    print(f"💰 Profit/Loss: ${results.get('final_value', 0) - config.initial_capital:,.2f}")
    
    return results


if __name__ == "__main__":
    # Run the example
    results = basic_moving_average_strategy()
    
    print("\n" + "="*50)
    print("🎉 Basic backtesting example completed!")
    print("   Try modifying the strategy parameters or time periods.")
    print("   Check out advanced_features.py for more sophisticated examples.")
