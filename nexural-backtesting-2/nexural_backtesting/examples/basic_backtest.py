#!/usr/bin/env python3
"""
Basic Backtesting Example

This example demonstrates how to perform a simple momentum strategy backtest
using the Nexural Backtesting Platform.
"""

import pandas as pd
from datetime import datetime, timedelta

from nexural_backtesting.strategies import BacktestingEngine, BacktestConfig
from nexural_backtesting.data import DataQualityEngine
from nexural_backtesting.risk import PortfolioRiskManager
from nexural_backtesting.core import ConfigManager


def create_sample_data() -> pd.DataFrame:
    """Create sample market data for demonstration."""
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    
    # Generate synthetic OHLCV data
    np.random.seed(42)  # For reproducible results
    prices = 100 * (1 + np.random.randn(len(dates)).cumsum() * 0.01)
    
    data = pd.DataFrame({
        'timestamp': dates,
        'open': prices * (1 + np.random.randn(len(dates)) * 0.005),
        'high': prices * (1 + abs(np.random.randn(len(dates))) * 0.01),
        'low': prices * (1 - abs(np.random.randn(len(dates))) * 0.01),
        'close': prices,
        'volume': np.random.randint(100000, 1000000, len(dates)),
    })
    
    return data.set_index('timestamp')


def run_basic_backtest():
    """Run a basic momentum strategy backtest."""
    
    print("🚀 Nexural Backtesting - Basic Example")
    print("=" * 50)
    
    # 1. Load configuration
    config = ConfigManager()
    
    # 2. Create sample data
    print("📊 Creating sample market data...")
    market_data = create_sample_data()
    print(f"   Data range: {market_data.index[0]} to {market_data.index[-1]}")
    print(f"   Total observations: {len(market_data)}")
    
    # 3. Initialize data quality engine
    print("\n🔍 Validating data quality...")
    quality_engine = DataQualityEngine()
    
    # Validate and clean the data
    cleaned_data, quality_report = quality_engine.validate_and_clean_data(
        market_data,
        symbol="SAMPLE",
        asset_class="EQUITY",
        data_type="OHLCV"
    )
    
    print(f"   Quality Score: {quality_report.quality_score:.2f}/10")
    print(f"   Issues Found: {len(quality_report.issues)}")
    
    # 4. Configure backtest
    backtest_config = BacktestConfig(
        initial_capital=100000,
        commission=0.001,
        slippage=0.0005,
        start_date=cleaned_data.index[0],
        end_date=cleaned_data.index[-1],
        benchmark="SPY"
    )
    
    # 5. Initialize backtesting engine
    print("\n⚙️ Initializing backtesting engine...")
    engine = BacktestingEngine(backtest_config)
    
    # 6. Create a simple momentum strategy
    def momentum_strategy(data: pd.DataFrame) -> pd.Series:
        """Simple momentum strategy based on moving averages."""
        short_ma = data['close'].rolling(window=10).mean()
        long_ma = data['close'].rolling(window=30).mean()
        
        # Generate signals: 1 for buy, -1 for sell, 0 for hold
        signals = pd.Series(0, index=data.index)
        signals[short_ma > long_ma] = 1
        signals[short_ma < long_ma] = -1
        
        return signals
    
    # 7. Run the backtest
    print("\n🔄 Running backtest...")
    signals = momentum_strategy(cleaned_data)
    results = engine.run_backtest(cleaned_data, signals)
    
    # 8. Initialize risk manager for analysis
    print("\n📈 Analyzing results...")
    risk_manager = PortfolioRiskManager()
    
    # Calculate additional risk metrics
    risk_metrics = risk_manager.calculate_risk_metrics(
        portfolio_value=results.final_capital
    )
    
    # 9. Display results
    print("\n" + "=" * 50)
    print("📊 BACKTEST RESULTS")
    print("=" * 50)
    
    print(f"Initial Capital:     ${results.initial_capital:,.2f}")
    print(f"Final Capital:       ${results.final_capital:,.2f}")
    print(f"Total Return:        {results.total_return:.2%}")
    print(f"Annualized Return:   {results.annualized_return:.2%}")
    print(f"Sharpe Ratio:        {results.sharpe_ratio:.3f}")
    print(f"Maximum Drawdown:    {results.max_drawdown:.2%}")
    print(f"Win Rate:            {results.win_rate:.2%}")
    print(f"Total Trades:        {results.total_trades}")
    
    print(f"\n🎯 Risk Metrics:")
    print(f"Value at Risk (95%): ${risk_metrics.var_95:.2f}")
    print(f"Expected Shortfall:  ${risk_metrics.expected_shortfall:.2f}")
    print(f"Beta:                {risk_metrics.beta:.3f}")
    print(f"Volatility:          {risk_metrics.volatility:.2%}")
    
    # 10. Performance summary
    if results.sharpe_ratio > 1.0:
        print("\n✅ Strategy Performance: GOOD (Sharpe > 1.0)")
    elif results.sharpe_ratio > 0.5:
        print("\n⚠️  Strategy Performance: MODERATE (Sharpe > 0.5)")
    else:
        print("\n❌ Strategy Performance: POOR (Sharpe < 0.5)")
    
    print("\n🎉 Backtest completed successfully!")
    
    return results


if __name__ == "__main__":
    import numpy as np
    
    try:
        results = run_basic_backtest()
        
        # Optional: Save results to file
        results.to_json("basic_backtest_results.json")
        print("\n💾 Results saved to 'basic_backtest_results.json'")
        
    except Exception as e:
        print(f"\n❌ Error running backtest: {e}")
        raise
