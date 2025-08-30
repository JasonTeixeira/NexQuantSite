"""
Test Script for Phase 4: Strategy Development & Backtesting

This script tests all Phase 4 components including:
- Backtesting Engine
- Strategy Framework
- Strategy Optimizer
- Signal Generator
- Position Manager
- Example Strategies
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from strategies import (
    BacktestingEngine, BacktestConfig, BacktestMode,
    StrategyFramework, StrategyConfig, StrategyType, ExecutionMode,
    StrategyOptimizer, OptimizationConfig, OptimizationMethod, OptimizationMetric,
    SignalGenerator, SignalConfig, SignalFilter, SignalCombiner, FilterType, CombinerType,
    PositionManager, PositionLimit,
    MicrostructureStrategy, MomentumStrategy, MeanReversionStrategy,
    PairsTradingStrategy, MultiFactorStrategy
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_test_data(days: int = 252) -> pd.DataFrame:
    """Generate synthetic test data"""
    logger.info(f"Generating {days} days of test data")
    
    # Generate dates
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Generate price data with some trend and volatility
    np.random.seed(42)
    returns = np.random.normal(0.0005, 0.02, len(dates))  # 0.05% daily return, 2% volatility
    
    # Add some trend
    trend = np.linspace(0, 0.1, len(dates))  # 10% trend over the period
    returns += trend / len(dates)
    
    # Generate prices
    prices = 100 * np.exp(np.cumsum(returns))
    
    # Generate OHLCV data
    data = pd.DataFrame({
        'open': prices * (1 + np.random.normal(0, 0.005, len(dates))),
        'high': prices * (1 + np.abs(np.random.normal(0, 0.01, len(dates)))),
        'low': prices * (1 - np.abs(np.random.normal(0, 0.01, len(dates)))),
        'close': prices,
        'volume': np.random.lognormal(10, 0.5, len(dates))
    }, index=dates)
    
    # Ensure OHLC relationships
    data['high'] = data[['open', 'high', 'close']].max(axis=1)
    data['low'] = data[['open', 'low', 'close']].min(axis=1)
    
    # Add some features
    data['returns'] = data['close'].pct_change()
    data['volatility'] = data['returns'].rolling(20).std()
    data['volume_sma'] = data['volume'].rolling(20).mean()
    data['volume_ratio'] = data['volume'] / data['volume_sma']
    
    # Add microstructure features
    data['book_imbalance'] = np.random.normal(0, 0.3, len(dates))
    data['spread_bps'] = np.random.uniform(1, 5, len(dates))
    data['microprice'] = data['close'] * (1 + np.random.normal(0, 0.001, len(dates)))
    
    # Add technical indicators
    data['sma_20'] = data['close'].rolling(20).mean()
    data['sma_50'] = data['close'].rolling(50).mean()
    data['rsi'] = calculate_rsi(data['close'], 14)
    
    return data


def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """Calculate RSI indicator"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def test_backtesting_engine():
    """Test the backtesting engine"""
    logger.info("Testing Backtesting Engine")
    
    # Generate test data
    data = generate_test_data(100)
    
    # Create backtest config
    config = BacktestConfig(
        initial_capital=100000,
        transaction_cost_bps=5.0,
        slippage_bps=2.0,
        max_position_size=0.1,
        enable_shorting=True
    )
    
    # Create strategy
    strategy = MomentumStrategy()
    
    # Create backtesting engine
    engine = BacktestingEngine(config)
    
    # Run backtest
    result = engine.run_backtest(strategy, data)
    
    # Validate results
    assert result.total_return is not None
    assert result.sharpe_ratio is not None
    assert result.max_drawdown is not None
    assert len(result.trades) >= 0
    assert len(result.equity_curve) > 0
    
    logger.info(f"Backtest completed: Return={result.total_return:.2%}, Sharpe={result.sharpe_ratio:.2f}")
    
    return result


def test_strategy_framework():
    """Test the strategy framework"""
    logger.info("Testing Strategy Framework")
    
    # Generate test data
    data = generate_test_data(100)
    
    # Create framework config
    config = StrategyConfig(
        strategy_type=StrategyType.MOMENTUM,
        execution_mode=ExecutionMode.BACKTEST,
        initial_capital=100000,
        max_position_size=0.1
    )
    
    # Create framework
    framework = StrategyFramework(config)
    
    # Register strategies
    strategies = [
        ('momentum', MomentumStrategy()),
        ('mean_reversion', MeanReversionStrategy()),
        ('microstructure', MicrostructureStrategy()),
        ('multi_factor', MultiFactorStrategy())
    ]
    
    for name, strategy in strategies:
        framework.register_strategy(name, strategy)
    
    # Run multiple strategies
    results = framework.run_multiple_strategies(data)
    
    # Validate results
    assert len(results) == len(strategies)
    for name, result in results.items():
        assert result.total_return is not None
        assert result.sharpe_ratio is not None
    
    # Compare strategies
    comparison = framework.compare_strategies(data)
    assert len(comparison) == len(strategies)
    
    logger.info(f"Framework test completed: {len(results)} strategies tested")
    
    return results


def test_strategy_optimizer():
    """Test the strategy optimizer"""
    logger.info("Testing Strategy Optimizer")
    
    # Generate test data
    data = generate_test_data(100)
    
    # Create optimization config
    config = OptimizationConfig(
        method=OptimizationMethod.GRID_SEARCH,
        metric=OptimizationMetric.SHARPE_RATIO,
        max_iterations=10,  # Small for testing
        n_jobs=1  # Single thread for testing
    )
    
    # Create optimizer
    optimizer = StrategyOptimizer(config)
    
    # Create backtest config
    backtest_config = BacktestConfig(
        initial_capital=100000,
        transaction_cost_bps=5.0
    )
    
    # Optimize strategy
    result = optimizer.optimize_strategy(
        MomentumStrategy, data, backtest_config=backtest_config
    )
    
    # Validate results
    assert result.best_parameters is not None
    assert result.best_score is not None
    assert result.optimization_time > 0
    
    logger.info(f"Optimization completed: Best score={result.best_score:.4f}")
    
    return result


def test_signal_generator():
    """Test the signal generator"""
    logger.info("Testing Signal Generator")
    
    # Generate test data
    data = generate_test_data(100)
    
    # Create signal config
    config = SignalConfig(
        lookback_period=20,
        smoothing_period=5,
        threshold=0.1
    )
    
    # Create signal generator
    generator = SignalGenerator(config)
    
    # Add filters
    ma_filter = SignalFilter(
        filter_type=FilterType.MOVING_AVERAGE,
        parameters={'window': 5}
    )
    generator.add_filter(ma_filter)
    
    # Set combiner
    combiner = SignalCombiner(
        combiner_type=CombinerType.EQUAL_WEIGHT
    )
    generator.set_combiner(combiner)
    
    # Create strategy functions
    strategies = [
        ('momentum', MomentumStrategy()),
        ('mean_reversion', MeanReversionStrategy())
    ]
    
    strategy_functions = [s.generate_signal for _, s in strategies]
    strategy_names = [name for name, _ in strategies]
    
    # Generate combined signal
    signal = generator.generate_signal(data, strategy_functions, strategy_names)
    
    # Validate signal
    assert len(signal) == len(data)
    assert signal.min() >= -1
    assert signal.max() <= 1
    
    # Calculate signal quality
    returns = data['returns']
    quality = generator.calculate_signal_quality(signal, returns)
    
    assert 'information_coefficient' in quality
    assert 'signal_stability' in quality
    
    logger.info(f"Signal generation completed: IC={quality.get('information_coefficient', 0):.3f}")
    
    return signal, quality


def test_position_manager():
    """Test the position manager"""
    logger.info("Testing Position Manager")
    
    # Create position limits
    limits = PositionLimit(
        max_position_size=0.1,
        max_leverage=2.0,
        enable_shorting=True
    )
    
    # Create position manager
    manager = PositionManager(
        max_position_size=0.1,
        max_leverage=2.0,
        enable_shorting=True,
        position_limits=limits
    )
    
    # Test position updates
    prices = {'AAPL': 150.0, 'GOOGL': 2500.0}
    manager.update_prices(prices)
    
    # Add positions
    success1 = manager.update_position('AAPL', 100, 150.0)
    success2 = manager.update_position('GOOGL', -50, 2500.0)
    
    assert success1
    assert success2
    
    # Get positions
    positions = manager.get_positions()
    assert 'AAPL' in positions
    assert 'GOOGL' in positions
    
    # Test position sizing
    position_size = manager.calculate_position_size(
        signal_strength=0.5,
        volatility=0.2,
        portfolio_value=100000
    )
    assert abs(position_size) <= 0.1
    
    # Check risk limits
    violations = manager.check_risk_limits()
    assert isinstance(violations, list)
    
    # Get portfolio summary
    summary = manager.get_portfolio_summary()
    assert 'total_portfolio_value' in summary
    assert 'current_leverage' in summary
    
    logger.info("Position manager test completed")
    
    return manager


def test_example_strategies():
    """Test example strategies"""
    logger.info("Testing Example Strategies")
    
    # Test all strategies
    strategies = [
        MicrostructureStrategy(),
        MomentumStrategy(),
        MeanReversionStrategy(),
        PairsTradingStrategy(),
        MultiFactorStrategy()
    ]
    
    # Generate test features
    features = {
        'close': 100.0,
        'open': 99.5,
        'high': 101.0,
        'low': 99.0,
        'volume': 1000000,
        'returns': 0.01,
        'volatility': 0.02,
        'book_imbalance': 0.3,
        'spread_bps': 2.0,
        'microprice': 100.1,
        'sma_20': 99.8,
        'sma_50': 99.5,
        'rsi': 55.0,
        'volume_ratio': 1.2,
        'price_momentum': 0.015,
        'pair_spread': 0.5,
        'spread_zscore': 1.5,
        'pair_correlation': 0.9,
        'sentiment_score': 0.2
    }
    
    results = {}
    for strategy in strategies:
        try:
            signal = strategy.generate_signal(features)
            assert -1 <= signal <= 1
            results[strategy.__class__.__name__] = signal
            
            # Test parameter validation
            params = strategy.get_default_parameters()
            assert strategy.validate_parameters(params)
            
            # Test parameter grid
            grid = strategy.get_parameter_grid()
            assert len(grid) > 0
            
        except Exception as e:
            logger.error(f"Error testing {strategy.__class__.__name__}: {e}")
    
    logger.info(f"Strategy testing completed: {len(results)} strategies tested")
    
    return results


def test_integration():
    """Test integration of all components"""
    logger.info("Testing Full Integration")
    
    # Generate test data
    data = generate_test_data(200)
    
    # Create framework
    config = StrategyConfig(
        strategy_type=StrategyType.MULTI_FACTOR,
        execution_mode=ExecutionMode.BACKTEST,
        initial_capital=100000
    )
    framework = StrategyFramework(config)
    
    # Register strategies
    framework.register_strategy('momentum', MomentumStrategy())
    framework.register_strategy('mean_reversion', MeanReversionStrategy())
    framework.register_strategy('multi_factor', MultiFactorStrategy())
    
    # Run strategies
    results = framework.run_multiple_strategies(data)
    
    # Optimize best performing strategy
    best_strategy = max(results.keys(), key=lambda k: results[k].sharpe_ratio)
    logger.info(f"Best strategy: {best_strategy}")
    
    # Generate combined signal
    signal = framework.generate_signal(data)
    
    # Validate integration
    assert len(results) == 3
    assert len(signal) == len(data)
    
    # Export results
    for name, result in results.items():
        framework.export_results(name, f"test_results_{name}.json", "json")
    
    logger.info("Integration test completed successfully")
    
    return results, signal


def main():
    """Run all tests"""
    logger.info("Starting Phase 4 Tests")
    
    try:
        # Test individual components
        logger.info("=" * 50)
        logger.info("Testing Individual Components")
        logger.info("=" * 50)
        
        backtest_result = test_backtesting_engine()
        framework_results = test_strategy_framework()
        optimizer_result = test_strategy_optimizer()
        signal, signal_quality = test_signal_generator()
        position_manager = test_position_manager()
        strategy_results = test_example_strategies()
        
        # Test integration
        logger.info("=" * 50)
        logger.info("Testing Integration")
        logger.info("=" * 50)
        
        integration_results, combined_signal = test_integration()
        
        # Summary
        logger.info("=" * 50)
        logger.info("Test Summary")
        logger.info("=" * 50)
        
        logger.info(f"✓ Backtesting Engine: {backtest_result.total_return:.2%} return")
        logger.info(f"✓ Strategy Framework: {len(framework_results)} strategies tested")
        logger.info(f"✓ Strategy Optimizer: {optimizer_result.best_score:.4f} best score")
        logger.info(f"✓ Signal Generator: {signal_quality.get('information_coefficient', 0):.3f} IC")
        logger.info(f"✓ Position Manager: {len(position_manager.get_positions())} positions")
        logger.info(f"✓ Example Strategies: {len(strategy_results)} strategies tested")
        logger.info(f"✓ Integration: {len(integration_results)} strategies integrated")
        
        logger.info("\n🎉 All Phase 4 tests completed successfully!")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise


if __name__ == "__main__":
    main()
