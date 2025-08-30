#!/usr/bin/env python3
"""
Advanced Testing Framework Test Suite
Comprehensive testing of institutional-grade strategy validation
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add the testing directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'testing'))

from advanced_testing_framework import (
    AdvancedTestingFramework,
    TestingMode,
    OptimizationMetric,
    WalkForwardConfig,
    MonteCarloConfig,
    StressTestConfig,
    OptimizationConfig
)
from sample_strategies import SampleStrategies

async def test_advanced_testing_framework():
    """Main test function for advanced testing framework"""
    
    print("🚀 Testing Advanced Testing Framework")
    print("=" * 60)
    
    # Initialize the framework
    config = {
        'walk_forward': {
            'initial_train_size': 0.6,
            'test_size': 0.2,
            'step_size': 0.05,
            'min_train_periods': 252,
            'max_test_periods': 63
        },
        'monte_carlo': {
            'n_simulations': 1000,  # Reduced for faster testing
            'simulation_length': 252,
            'confidence_levels': [0.95, 0.99],
            'distribution_type': 'normal'
        },
        'stress_test': {
            'scenarios': [
                {"name": "market_crash", "shock": -0.20, "volatility_multiplier": 3.0},
                {"name": "flash_crash", "shock": -0.10, "volatility_multiplier": 5.0},
                {"name": "liquidity_crisis", "shock": -0.15, "volatility_multiplier": 2.5}
            ]
        },
        'optimization': {
            'objective_metric': OptimizationMetric.SHARPE_RATIO,
            'parameter_bounds': {
                'short_window': (10, 50),
                'long_window': (30, 100),
                'position_size': (0.5, 2.0)
            },
            'n_trials': 100,  # Reduced for faster testing
            'optimization_algorithm': 'tpe',
            'cross_validation_folds': 3
        }
    }
    
    framework = AdvancedTestingFramework(config)
    
    # Generate sample data
    print("\n📊 Generating sample market data...")
    data = generate_sample_market_data()
    
    # Define strategies to test
    strategies = {
        'Moving Average Crossover': SampleStrategies.moving_average_crossover,
        'RSI Mean Reversion': SampleStrategies.mean_reversion_rsi,
        'Momentum Strategy': SampleStrategies.momentum_strategy,
        'Buy and Hold': SampleStrategies.buy_and_hold
    }
    
    test_results = []
    
    # Test each strategy
    for strategy_name, strategy_func in strategies.items():
        print(f"\n🔬 Testing {strategy_name}...")
        
        try:
            # Run comprehensive testing
            result = await framework.run_comprehensive_test(
                strategy_func=strategy_func,
                data=data,
                strategy_name=strategy_name,
                parameters=None,
                modes=[TestingMode.WALK_FORWARD, TestingMode.MONTE_CARLO, 
                      TestingMode.STRESS_TEST, TestingMode.OPTIMIZATION]
            )
            
            test_results.append((strategy_name, result))
            print(f"✅ {strategy_name} testing complete")
            
        except Exception as e:
            print(f"❌ {strategy_name} testing failed: {e}")
            test_results.append((strategy_name, None))
    
    # Print comprehensive results
    print("\n" + "=" * 60)
    print("📈 COMPREHENSIVE TESTING RESULTS")
    print("=" * 60)
    
    for strategy_name, result in test_results:
        if result:
            print(f"\n📊 {strategy_name}")
            print(f"   Total Return: {result.total_return:.2%}")
            print(f"   Sharpe Ratio: {result.sharpe_ratio:.3f}")
            print(f"   Calmar Ratio: {result.calmar_ratio:.3f}")
            print(f"   Max Drawdown: {result.max_drawdown:.2%}")
            print(f"   Volatility: {result.volatility:.2%}")
            print(f"   VaR (95%): {result.var_95:.2%}")
            print(f"   CVaR (95%): {result.cvar_95:.2%}")
            print(f"   Execution Time: {result.execution_time:.2f}s")
            print(f"   Trades Count: {result.trades_count}")
            print(f"   Success Rate: {result.success_rate:.2%}")
            
            # Walk-forward results
            if result.walk_forward_results:
                print(f"   Walk-Forward Periods: {len(result.walk_forward_results)}")
                avg_test_return = np.mean([
                    r['test_metrics']['total_return'] 
                    for r in result.walk_forward_results
                ])
                print(f"   Avg Out-of-Sample Return: {avg_test_return:.2%}")
            
            # Monte Carlo results
            if result.monte_carlo_results:
                confidence_intervals = result.monte_carlo_results.get('confidence_intervals', {})
                if 'total_return' in confidence_intervals:
                    ci_95 = confidence_intervals['total_return'].get('95%', [0, 0])
                    print(f"   95% CI Return: [{ci_95[0]:.2%}, {ci_95[1]:.2%}]")
            
            # Stress test results
            if result.stress_test_results:
                worst_scenario = min(
                    result.stress_test_results.values(),
                    key=lambda x: x.get('metrics', {}).get('total_return', 0)
                )
                worst_return = worst_scenario.get('metrics', {}).get('total_return', 0)
                print(f"   Worst Stress Scenario: {worst_return:.2%}")
            
            # Optimization results
            if result.optimization_results:
                best_value = result.optimization_results.get('best_value', 0)
                best_params = result.optimization_results.get('best_parameters', {})
                print(f"   Best Optimized Sharpe: {best_value:.3f}")
                print(f"   Best Parameters: {best_params}")
            
            # Recommendations and warnings
            if result.recommendations:
                print(f"   Recommendations: {len(result.recommendations)}")
                for rec in result.recommendations[:2]:  # Show first 2
                    print(f"     - {rec}")
            
            if result.risk_warnings:
                print(f"   Risk Warnings: {len(result.risk_warnings)}")
                for warning in result.risk_warnings[:2]:  # Show first 2
                    print(f"     ⚠️ {warning}")
        else:
            print(f"\n❌ {strategy_name}: Testing failed")
    
    # Get framework summary
    summary = framework.get_testing_summary()
    if summary:
        print(f"\n📊 Framework Summary:")
        print(f"   Total Tests: {summary.get('total_tests', 0)}")
        print(f"   Strategies Tested: {len(summary.get('strategies_tested', []))}")
        print(f"   Average Execution Time: {summary.get('average_execution_time', 0):.2f}s")
        print(f"   Best Strategy: {summary.get('best_performing_strategy', 'N/A')}")
        print(f"   Optimization Studies: {summary.get('optimization_studies', 0)}")
    
    # Save results
    framework.save_results('advanced_testing_results.pkl')
    print(f"\n💾 Results saved to advanced_testing_results.pkl")
    
    return len([r for _, r in test_results if r is not None]) == len(test_results)

def generate_sample_market_data() -> pd.DataFrame:
    """Generate realistic sample market data"""
    
    # Generate 5 years of daily data
    dates = pd.date_range(start='2019-01-01', end='2023-12-31', freq='D')
    
    # Remove weekends
    dates = dates[dates.dayofweek < 5]
    
    # Generate realistic price movements
    np.random.seed(42)  # For reproducible results
    
    # Start with $100
    initial_price = 100.0
    
    # Generate returns with realistic parameters
    daily_return = 0.0005  # 0.05% daily return (12.5% annual)
    daily_volatility = 0.015  # 1.5% daily volatility (24% annual)
    
    # Generate random returns
    returns = np.random.normal(daily_return, daily_volatility, len(dates))
    
    # Add some market cycles and trends
    for i in range(len(returns)):
        # Add trend component
        trend = 0.0001 * (i / len(dates))  # Gradual upward trend
        returns[i] += trend
        
        # Add cyclical component
        cycle = 0.002 * np.sin(2 * np.pi * i / 252)  # Annual cycle
        returns[i] += cycle
    
    # Add some market events
    # Market crash in 2020
    crash_start = np.where(dates >= '2020-03-01')[0][0]
    crash_end = np.where(dates >= '2020-03-31')[0][0]
    for i in range(crash_start, min(crash_end, len(returns))):
        returns[i] += np.random.normal(-0.02, 0.03)  # Negative bias during crash
    
    # Recovery period
    recovery_start = crash_end
    recovery_end = min(recovery_start + 63, len(returns))  # 3 months recovery
    for i in range(recovery_start, recovery_end):
        returns[i] += np.random.normal(0.01, 0.02)  # Positive bias during recovery
    
    # Generate price series
    prices = [initial_price]
    for ret in returns:
        new_price = prices[-1] * (1 + ret)
        prices.append(max(new_price, 1.0))  # Don't go below $1
    
    prices = prices[1:]  # Remove initial price
    
    # Ensure we have exactly len(dates) prices
    if len(prices) != len(dates):
        # Trim or extend to match
        if len(prices) > len(dates):
            prices = prices[:len(dates)]
        else:
            # Extend with last price if needed
            while len(prices) < len(dates):
                prices.append(prices[-1])
    
    # Generate OHLC data
    data = pd.DataFrame({
        'close': prices,
        'open': [p * (1 + np.random.normal(0, 0.005)) for p in prices],
        'high': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
        'volume': np.random.randint(1000000, 10000000, len(prices))
    }, index=dates)
    
    # Ensure OHLC consistency
    data['high'] = data[['open', 'high', 'close']].max(axis=1)
    data['low'] = data[['open', 'low', 'close']].min(axis=1)
    
    return data

async def test_individual_components():
    """Test individual components of the framework"""
    
    print("\n🔧 Testing Individual Components...")
    
    # Test walk-forward analysis
    print("   Testing Walk-Forward Analysis...")
    config = {'walk_forward': {'initial_train_size': 0.6, 'test_size': 0.2}}
    framework = AdvancedTestingFramework(config)
    
    data = generate_sample_market_data()
    walk_forward_result = await framework._run_walk_forward_analysis(
        SampleStrategies.moving_average_crossover, data
    )
    print(f"   ✅ Walk-Forward: {len(walk_forward_result)} periods")
    
    # Test Monte Carlo simulation
    print("   Testing Monte Carlo Simulation...")
    config = {'monte_carlo': {'n_simulations': 100, 'simulation_length': 252}}
    framework = AdvancedTestingFramework(config)
    
    monte_carlo_result = await framework._run_monte_carlo_simulation(
        SampleStrategies.moving_average_crossover, data
    )
    print(f"   ✅ Monte Carlo: {len(monte_carlo_result['simulation_results'])} simulations")
    
    # Test stress testing
    print("   Testing Stress Testing...")
    config = {'stress_test': {'scenarios': [{"name": "test", "shock": -0.10}]}}
    framework = AdvancedTestingFramework(config)
    
    stress_result = await framework._run_stress_testing(
        SampleStrategies.moving_average_crossover, data
    )
    print(f"   ✅ Stress Testing: {len(stress_result)} scenarios")
    
    # Test optimization
    print("   Testing Optimization...")
    config = {
        'optimization': {
            'objective_metric': OptimizationMetric.SHARPE_RATIO,
            'parameter_bounds': {'short_window': (10, 30), 'long_window': (40, 80)},
            'n_trials': 50
        }
    }
    framework = AdvancedTestingFramework(config)
    
    optimization_result = await framework._run_optimization(
        SampleStrategies.moving_average_crossover, data
    )
    print(f"   ✅ Optimization: Best Sharpe = {optimization_result['best_value']:.3f}")

if __name__ == "__main__":
    # Run the comprehensive test suite
    success = asyncio.run(test_advanced_testing_framework())
    
    # Run individual component tests
    asyncio.run(test_individual_components())
    
    if success:
        print("\n🎯 Phase 2 Complete: Advanced Testing Framework")
        print("   Status: State-of-the-art strategy validation achieved!")
        print("   Next: Phase 3 - Robust Deployment & Monitoring")
    else:
        print("\n⚠️  Some tests failed. Review and fix issues before proceeding.")
    
    sys.exit(0 if success else 1)
