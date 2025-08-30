#!/usr/bin/env python3
"""
AI-Powered Strategy Analysis Example

This example demonstrates how to use AI capabilities to analyze
and improve trading strategies using the Nexural platform.
"""

import pandas as pd
import numpy as np
from datetime import datetime

from nexural_backtesting.ai import StrategyAI, MLModelManager
from nexural_backtesting.strategies import BacktestingEngine, BacktestConfig
from nexural_backtesting.data import DataQualityEngine


def run_ai_strategy_analysis():
    """Run AI-powered strategy analysis and optimization."""
    
    print("🤖 Nexural AI Strategy Analysis")
    print("=" * 50)
    
    # 1. Create sample data with multiple assets
    print("📊 Generating multi-asset market data...")
    
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY']
    market_data = {}
    
    for symbol in symbols:
        dates = pd.date_range(start='2022-01-01', end='2023-12-31', freq='D')
        np.random.seed(hash(symbol) % 1000)  # Different seed per symbol
        
        # Generate correlated price series
        prices = 100 * (1 + np.random.randn(len(dates)).cumsum() * 0.015)
        
        data = pd.DataFrame({
            'open': prices * (1 + np.random.randn(len(dates)) * 0.005),
            'high': prices * (1 + abs(np.random.randn(len(dates))) * 0.01),
            'low': prices * (1 - abs(np.random.randn(len(dates))) * 0.01),
            'close': prices,
            'volume': np.random.randint(1000000, 10000000, len(dates)),
        }, index=dates)
        
        market_data[symbol] = data
    
    print(f"   Generated data for {len(symbols)} symbols")
    print(f"   Date range: {dates[0]} to {dates[-1]}")
    
    # 2. Initialize AI components
    print("\n🤖 Initializing AI components...")
    
    strategy_ai = StrategyAI()
    ml_manager = MLModelManager()
    
    # 3. Run backtests on multiple strategies
    strategies_to_test = [
        ('momentum', create_momentum_strategy),
        ('mean_reversion', create_mean_reversion_strategy),
        ('breakout', create_breakout_strategy),
    ]
    
    strategy_results = {}
    
    for strategy_name, strategy_func in strategies_to_test:
        print(f"\n📈 Testing {strategy_name.title()} Strategy...")
        
        # Configure backtest
        config = BacktestConfig(
            initial_capital=100000,
            commission=0.001,
            slippage=0.0005,
            start_date=dates[0],
            end_date=dates[-1]
        )
        
        engine = BacktestingEngine(config)
        
        # Run backtest on primary symbol (AAPL)
        signals = strategy_func(market_data['AAPL'])
        results = engine.run_backtest(market_data['AAPL'], signals)
        
        strategy_results[strategy_name] = results
        
        print(f"   {strategy_name.title()}: Sharpe={results.sharpe_ratio:.3f}, "
              f"Return={results.total_return:.2%}")
    
    # 4. AI Analysis of Strategy Performance
    print("\n🧠 AI Analysis of Strategy Performance...")
    
    for strategy_name, results in strategy_results.items():
        print(f"\n--- {strategy_name.title()} Strategy Analysis ---")
        
        # Get AI analysis
        ai_analysis = strategy_ai.analyze_strategy_performance(
            results, 
            market_data['AAPL'],
            strategy_name=strategy_name
        )
        
        print(f"📊 Performance Grade: {ai_analysis['performance_grade']}")
        print(f"🎯 Risk Assessment: {ai_analysis['risk_assessment']}")
        
        print("\n💡 AI Recommendations:")
        for i, recommendation in enumerate(ai_analysis['recommendations'], 1):
            print(f"   {i}. {recommendation}")
        
        print(f"\n⚠️  Risk Warnings:")
        for warning in ai_analysis['risk_warnings']:
            print(f"   • {warning}")
    
    # 5. ML Model for Market Regime Detection
    print("\n🔮 ML Market Regime Detection...")
    
    # Prepare features for regime detection
    features_data = prepare_regime_features(market_data['AAPL'])
    
    # Train regime detection model
    regime_model = ml_manager.train_regime_detection_model(features_data)
    
    # Predict current market regime
    current_regime = regime_model.predict_current_regime(
        features_data.iloc[-30:]  # Last 30 days
    )
    
    regime_names = {0: "Bull Market", 1: "Bear Market", 2: "Sideways Market"}
    print(f"   Current Market Regime: {regime_names.get(current_regime, 'Unknown')}")
    
    # 6. Strategy Optimization using AI
    print("\n⚙️ AI-Powered Strategy Optimization...")
    
    # Find best performing strategy
    best_strategy = max(strategy_results.items(), key=lambda x: x[1].sharpe_ratio)
    best_name, best_results = best_strategy
    
    print(f"   Best Strategy: {best_name.title()}")
    print(f"   Current Sharpe: {best_results.sharpe_ratio:.3f}")
    
    # Get AI optimization suggestions
    optimization_suggestions = strategy_ai.suggest_optimizations(
        best_results,
        market_data['AAPL'],
        strategy_name=best_name
    )
    
    print("\n🚀 AI Optimization Suggestions:")
    for suggestion in optimization_suggestions:
        print(f"   • {suggestion}")
    
    # 7. Multi-Asset Portfolio Optimization
    print("\n📊 Multi-Asset Portfolio Optimization...")
    
    portfolio_optimizer = ml_manager.get_portfolio_optimizer()
    
    # Calculate returns for all assets
    returns_data = {}
    for symbol, data in market_data.items():
        returns_data[symbol] = data['close'].pct_change().dropna()
    
    returns_df = pd.DataFrame(returns_data)
    
    # Optimize portfolio weights
    optimal_weights = portfolio_optimizer.optimize_portfolio(
        returns_df,
        risk_tolerance=0.15,
        target_return=0.12
    )
    
    print("   Optimal Portfolio Weights:")
    for symbol, weight in optimal_weights.items():
        print(f"   {symbol}: {weight:.2%}")
    
    # 8. AI Market Insights
    print("\n🔍 AI Market Insights...")
    
    market_insights = strategy_ai.generate_market_insights(
        market_data,
        current_regime=current_regime
    )
    
    print(f"📈 Market Trend: {market_insights['trend_analysis']}")
    print(f"⚠️  Risk Level: {market_insights['risk_level']}")
    print(f"🎯 Opportunities: {market_insights['opportunities']}")
    
    print("\n🔮 AI Predictions for Next Month:")
    for prediction in market_insights['predictions']:
        print(f"   • {prediction}")
    
    # 9. Summary and Recommendations
    print("\n" + "=" * 50)
    print("🎯 FINAL AI RECOMMENDATIONS")
    print("=" * 50)
    
    print(f"🏆 Best Strategy: {best_name.title()}")
    print(f"📊 Expected Sharpe: {best_results.sharpe_ratio:.3f}")
    print(f"💰 Projected Annual Return: {best_results.annualized_return:.2%}")
    
    print(f"\n🔄 Recommended Actions:")
    final_recommendations = strategy_ai.get_final_recommendations(
        strategy_results, 
        optimal_weights,
        market_insights
    )
    
    for i, rec in enumerate(final_recommendations, 1):
        print(f"   {i}. {rec}")
    
    print("\n🎉 AI Strategy Analysis completed!")
    
    return {
        'strategy_results': strategy_results,
        'ai_analysis': ai_analysis,
        'optimal_weights': optimal_weights,
        'market_insights': market_insights,
        'recommendations': final_recommendations
    }


def create_momentum_strategy(data: pd.DataFrame) -> pd.Series:
    """Create momentum strategy signals."""
    short_ma = data['close'].rolling(window=10).mean()
    long_ma = data['close'].rolling(window=30).mean()
    
    signals = pd.Series(0, index=data.index)
    signals[short_ma > long_ma] = 1
    signals[short_ma < long_ma] = -1
    
    return signals


def create_mean_reversion_strategy(data: pd.DataFrame) -> pd.Series:
    """Create mean reversion strategy signals."""
    price = data['close']
    ma = price.rolling(window=20).mean()
    std = price.rolling(window=20).std()
    
    upper_band = ma + 2 * std
    lower_band = ma - 2 * std
    
    signals = pd.Series(0, index=data.index)
    signals[price < lower_band] = 1   # Buy when oversold
    signals[price > upper_band] = -1  # Sell when overbought
    
    return signals


def create_breakout_strategy(data: pd.DataFrame) -> pd.Series:
    """Create breakout strategy signals."""
    high_20 = data['high'].rolling(window=20).max()
    low_20 = data['low'].rolling(window=20).min()
    
    signals = pd.Series(0, index=data.index)
    signals[data['close'] > high_20.shift(1)] = 1   # Buy on upward breakout
    signals[data['close'] < low_20.shift(1)] = -1   # Sell on downward breakout
    
    return signals


def prepare_regime_features(data: pd.DataFrame) -> pd.DataFrame:
    """Prepare features for market regime detection."""
    features = pd.DataFrame(index=data.index)
    
    # Price-based features
    features['returns'] = data['close'].pct_change()
    features['volatility'] = features['returns'].rolling(window=20).std()
    features['rsi'] = calculate_rsi(data['close'])
    
    # Volume features
    features['volume_ma'] = data['volume'].rolling(window=20).mean()
    features['volume_ratio'] = data['volume'] / features['volume_ma']
    
    # Trend features
    features['ma_10'] = data['close'].rolling(window=10).mean()
    features['ma_50'] = data['close'].rolling(window=50).mean()
    features['trend'] = (features['ma_10'] > features['ma_50']).astype(int)
    
    return features.dropna()


def calculate_rsi(prices: pd.Series, window: int = 14) -> pd.Series:
    """Calculate Relative Strength Index."""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


if __name__ == "__main__":
    try:
        results = run_ai_strategy_analysis()
        
        # Save results
        import json
        with open('ai_analysis_results.json', 'w') as f:
            # Convert results to JSON-serializable format
            json_results = {
                'strategy_results': {k: v.to_dict() for k, v in results['strategy_results'].items()},
                'optimal_weights': results['optimal_weights'],
                'market_insights': results['market_insights'],
                'recommendations': results['recommendations']
            }
            json.dump(json_results, f, indent=2, default=str)
        
        print("\n💾 Results saved to 'ai_analysis_results.json'")
        
    except Exception as e:
        print(f"\n❌ Error in AI analysis: {e}")
        raise
