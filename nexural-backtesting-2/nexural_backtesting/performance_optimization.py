#!/usr/bin/env python3
"""
Performance Optimization Suite
Push backtesting engine from 37K to 50K+ bars/second
"""

import pandas as pd
import numpy as np
import numba
from numba import jit, njit
import sys
from pathlib import Path
from datetime import datetime
import time

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def create_large_dataset(days=5000):
    """Create large dataset for performance testing"""
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    
    # Generate realistic price movement
    returns = np.random.normal(0.0008, 0.02, days)
    prices = 100 * (1 + returns).cumprod()
    
    data = pd.DataFrame({
        'open': np.roll(prices, 1),
        'high': prices * (1 + np.random.uniform(0, 0.02, days)),
        'low': prices * (1 - np.random.uniform(0, 0.02, days)),
        'close': prices,
        'volume': np.random.randint(1000000, 5000000, days)
    }, index=dates)
    
    # Fix OHLC relationships
    data['high'] = data[['open', 'high', 'close']].max(axis=1)
    data['low'] = data[['open', 'low', 'close']].min(axis=1)
    data.loc[data.index[0], 'open'] = data.loc[data.index[0], 'close']
    
    return data

@njit
def numba_moving_average(prices, window):
    """Numba-optimized moving average calculation"""
    n = len(prices)
    ma = np.empty(n)
    ma[:window-1] = np.nan
    
    for i in range(window-1, n):
        ma[i] = np.mean(prices[i-window+1:i+1])
    
    return ma

@njit
def numba_backtest_core(prices, short_ma, long_ma, initial_capital, commission):
    """Numba-optimized core backtesting logic"""
    n = len(prices)
    position = 0.0
    cash = initial_capital
    portfolio_values = np.empty(n)
    trades = 0
    
    for i in range(1, n):
        # Skip if MA values are NaN
        if np.isnan(short_ma[i]) or np.isnan(long_ma[i]):
            portfolio_values[i] = cash + position * prices[i]
            continue
        
        # Generate signals
        signal = 0
        if short_ma[i] > long_ma[i] and short_ma[i-1] <= long_ma[i-1]:
            signal = 1  # Buy
        elif short_ma[i] < long_ma[i] and short_ma[i-1] >= long_ma[i-1]:
            signal = -1  # Sell
        
        # Execute trades
        if signal == 1 and position <= 0:
            # Buy
            shares_to_buy = cash * 0.95 / prices[i]  # 95% of cash
            cost = shares_to_buy * prices[i] * (1 + commission)
            if cost <= cash:
                cash -= cost
                position = shares_to_buy
                trades += 1
        elif signal == -1 and position > 0:
            # Sell
            proceeds = position * prices[i] * (1 - commission)
            cash += proceeds
            position = 0.0
            trades += 1
        
        portfolio_values[i] = cash + position * prices[i]
    
    return portfolio_values, trades

class OptimizedBacktestEngine:
    """Ultra-high performance backtesting engine"""
    
    def __init__(self, initial_capital=100000, commission=0.001):
        self.initial_capital = initial_capital
        self.commission = commission
    
    def run_optimized_backtest(self, data, short_window=20, long_window=50):
        """Run optimized backtest with Numba acceleration"""
        prices = data['close'].values
        
        # Calculate moving averages with Numba
        short_ma = numba_moving_average(prices, short_window)
        long_ma = numba_moving_average(prices, long_window)
        
        # Run core backtest logic with Numba
        portfolio_values, trades = numba_backtest_core(
            prices, short_ma, long_ma, self.initial_capital, self.commission
        )
        
        # Calculate performance metrics
        total_return = (portfolio_values[-1] - self.initial_capital) / self.initial_capital
        
        # Calculate Sharpe ratio
        returns = np.diff(portfolio_values) / portfolio_values[:-1]
        returns = returns[~np.isnan(returns)]
        if len(returns) > 0 and np.std(returns) > 0:
            sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252)
        else:
            sharpe_ratio = 0.0
        
        # Calculate max drawdown
        running_max = np.maximum.accumulate(portfolio_values)
        drawdown = (portfolio_values - running_max) / running_max
        max_drawdown = np.min(drawdown)
        
        return {
            'total_return': total_return,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': abs(max_drawdown),
            'num_trades': trades,
            'final_value': portfolio_values[-1],
            'portfolio_values': portfolio_values
        }

def benchmark_performance():
    """Benchmark current vs optimized performance"""
    print("🚀 PERFORMANCE OPTIMIZATION BENCHMARK")
    print("=" * 60)
    
    # Create large dataset for testing
    print("Creating large dataset for benchmarking...")
    data = create_large_dataset(10000)  # 10K bars
    print(f"✅ Created dataset: {len(data):,} bars")
    
    # Test original unified engine
    print("\n📊 Testing Current Unified Engine...")
    try:
        from nexural_backtesting.core.unified_system import (
            UnifiedEngine, UnifiedConfig, UnifiedMovingAverageStrategy
        )
        
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        strategy = UnifiedMovingAverageStrategy(short_window=20, long_window=50)
        signals = strategy.generate_signals(data)
        
        start_time = time.time()
        result_original = engine.run_backtest(data, signals)
        end_time = time.time()
        
        original_time = end_time - start_time
        original_throughput = len(data) / original_time
        
        print(f"✅ Original Engine:")
        print(f"   Time: {original_time:.3f} seconds")
        print(f"   Throughput: {original_throughput:,.0f} bars/second")
        print(f"   Total Return: {result_original.total_return:.2%}")
        
    except Exception as e:
        print(f"❌ Original engine test failed: {e}")
        return
    
    # Test optimized engine
    print("\n⚡ Testing Optimized Engine...")
    try:
        optimized_engine = OptimizedBacktestEngine()
        
        start_time = time.time()
        result_optimized = optimized_engine.run_optimized_backtest(data)
        end_time = time.time()
        
        optimized_time = end_time - start_time
        optimized_throughput = len(data) / optimized_time
        
        print(f"✅ Optimized Engine:")
        print(f"   Time: {optimized_time:.3f} seconds")
        print(f"   Throughput: {optimized_throughput:,.0f} bars/second")
        print(f"   Total Return: {result_optimized['total_return']:.2%}")
        
        # Calculate improvement
        speedup = optimized_throughput / original_throughput
        
        print(f"\n🏆 PERFORMANCE IMPROVEMENT:")
        print(f"   Speedup: {speedup:.1f}x faster")
        print(f"   Original: {original_throughput:,.0f} bars/sec")
        print(f"   Optimized: {optimized_throughput:,.0f} bars/sec")
        
        if optimized_throughput > 50000:
            print(f"   🎉 TARGET ACHIEVED: 50K+ bars/second!")
        else:
            print(f"   🎯 Progress toward 50K target: {optimized_throughput/50000:.1%}")
        
        return {
            'original_throughput': original_throughput,
            'optimized_throughput': optimized_throughput,
            'speedup': speedup,
            'target_achieved': optimized_throughput > 50000
        }
        
    except Exception as e:
        print(f"❌ Optimized engine test failed: {e}")
        return None

def test_multiple_datasets():
    """Test performance across different dataset sizes"""
    print("\n📊 MULTI-SIZE PERFORMANCE TEST")
    print("=" * 60)
    
    sizes = [1000, 2000, 5000, 10000]
    optimized_engine = OptimizedBacktestEngine()
    
    results = []
    
    for size in sizes:
        print(f"\nTesting {size:,} bars...")
        data = create_large_dataset(size)
        
        start_time = time.time()
        result = optimized_engine.run_optimized_backtest(data)
        end_time = time.time()
        
        execution_time = end_time - start_time
        throughput = size / execution_time
        
        results.append({
            'size': size,
            'time': execution_time,
            'throughput': throughput
        })
        
        print(f"   Time: {execution_time:.3f}s, Throughput: {throughput:,.0f} bars/sec")
    
    # Calculate average throughput
    avg_throughput = sum(r['throughput'] for r in results) / len(results)
    print(f"\n🏆 AVERAGE THROUGHPUT: {avg_throughput:,.0f} bars/second")
    
    if avg_throughput > 50000:
        print("   🎉 CONSISTENT 50K+ PERFORMANCE ACHIEVED!")
    
    return results

def main():
    """Main optimization testing"""
    print("⚡ PERFORMANCE OPTIMIZATION SUITE")
    print("Push from 37K to 50K+ bars/second")
    print("=" * 70)
    
    # Single large dataset benchmark
    benchmark_results = benchmark_performance()
    
    if benchmark_results:
        # Multi-size testing
        multi_results = test_multiple_datasets()
        
        print("\n" + "=" * 70)
        print("PERFORMANCE OPTIMIZATION SUMMARY")
        print("=" * 70)
        print(f"Target: 50,000+ bars/second")
        print(f"Achieved: {benchmark_results['optimized_throughput']:,.0f} bars/second")
        print(f"Speedup: {benchmark_results['speedup']:.1f}x improvement")
        
        if benchmark_results['target_achieved']:
            print("🏆 SUCCESS: 50K+ bars/second target ACHIEVED!")
        else:
            print("🎯 Progress made toward 50K target")
        
    else:
        print("❌ Performance optimization testing failed")

if __name__ == "__main__":
    main()



