#!/usr/bin/env python3
"""
Core Working Test Suite
Tests for components that we know actually work
"""

import pytest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

# Proper package imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import working components
from nexural_backtesting.core.unified_system import (
    UnifiedEngine, UnifiedConfig, UnifiedMovingAverageStrategy
)
from nexural_backtesting.risk_management.portfolio_risk_manager import (
    PortfolioRiskManager, RiskLimits
)
from nexural_backtesting.risk_management.var_engine import (
    VaREngine, VaRMethod
)
from nexural_backtesting.ai.working_ai import WorkingAI, AIAnalysisResult

def create_test_data(days=100):
    """Create realistic test data"""
    np.random.seed(42)
    dates = pd.date_range(end=pd.Timestamp.now(), periods=days, freq='D')
    
    returns = np.random.normal(0.0008, 0.02, days)
    prices = 150 * (1 + returns).cumprod()
    
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

class TestCoreBacktesting:
    """Test core backtesting functionality"""
    
    def test_unified_engine_initialization(self):
        """Test engine can be initialized"""
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        
        assert engine.config is not None
        assert engine.cash == config.initial_capital
        assert engine.position == 0.0
    
    def test_strategy_creation(self):
        """Test strategy can be created and configured"""
        strategy = UnifiedMovingAverageStrategy(short_window=10, long_window=20)
        
        assert strategy.short_window == 10
        assert strategy.long_window == 20
        assert strategy.name == "Moving Average"
    
    def test_signal_generation(self):
        """Test signal generation works"""
        data = create_test_data(100)
        strategy = UnifiedMovingAverageStrategy(short_window=10, long_window=20)
        
        signals = strategy.generate_signals(data)
        
        assert len(signals) == len(data)
        assert signals.dtype in [np.float64, np.int64, 'float64', 'int64']  # Allow both types
        assert set(signals.dropna().unique()).issubset({-1, 0, 1})
    
    def test_backtest_execution(self):
        """Test complete backtest execution"""
        data = create_test_data(252)  # 1 year
        strategy = UnifiedMovingAverageStrategy(short_window=20, long_window=50)
        signals = strategy.generate_signals(data)
        
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        result = engine.run_backtest(data, signals)
        
        # Validate result structure
        assert hasattr(result, 'total_return')
        assert hasattr(result, 'sharpe_ratio')
        assert hasattr(result, 'max_drawdown')
        assert hasattr(result, 'num_trades')
        
        # Validate result ranges
        assert -1.0 <= result.total_return <= 5.0  # Reasonable return range
        assert -5.0 <= result.sharpe_ratio <= 5.0   # Reasonable Sharpe range
        assert 0.0 <= result.max_drawdown <= 1.0    # Valid drawdown range
    
    def test_performance_benchmark(self):
        """Test performance meets minimum standards"""
        data = create_test_data(1000)
        strategy = UnifiedMovingAverageStrategy(short_window=20, long_window=50)
        signals = strategy.generate_signals(data)
        
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        
        start_time = pd.Timestamp.now()
        result = engine.run_backtest(data, signals)
        end_time = pd.Timestamp.now()
        
        execution_time = (end_time - start_time).total_seconds()
        throughput = len(data) / execution_time
        
        # Performance requirements
        assert execution_time < 1.0  # Should complete in under 1 second
        assert throughput > 1000     # Minimum 1K bars/second
        
        print(f"Performance: {throughput:,.0f} bars/second")

class TestRiskManagement:
    """Test risk management functionality"""
    
    def test_portfolio_risk_manager_initialization(self):
        """Test risk manager initialization"""
        risk_manager = PortfolioRiskManager()
        
        assert risk_manager.config is not None
        assert hasattr(risk_manager, 'risk_limits')
        assert hasattr(risk_manager, 'portfolio_returns')
    
    def test_risk_metrics_calculation(self):
        """Test risk metrics calculation"""
        # Create test returns
        np.random.seed(42)
        returns = pd.Series(np.random.normal(0.001, 0.02, 252))  # 1 year daily returns
        
        risk_manager = PortfolioRiskManager()
        risk_manager.update_portfolio_data(returns)
        
        metrics = risk_manager.calculate_risk_metrics(portfolio_value=1000000)
        
        # Validate metrics
        assert metrics.portfolio_value == 1000000
        assert 0.0 <= metrics.volatility <= 1.0
        assert 0.0 <= metrics.var_95 <= 1.0
        assert 0.0 <= metrics.max_drawdown <= 1.0
        assert isinstance(metrics.sharpe_ratio, float)
    
    def test_var_engine(self):
        """Test VaR engine functionality"""
        # Create test data
        np.random.seed(42)
        returns = pd.DataFrame({
            'portfolio': np.random.normal(0.001, 0.02, 252)
        })
        
        var_engine = VaREngine({'confidence_levels': [0.95, 0.99]})
        var_engine.update_data(returns, portfolio_value=1000000)
        
        var_result = var_engine.calculate_var(VaRMethod.HISTORICAL, 0.95)
        
        # Validate VaR result
        assert hasattr(var_result, 'var_value')
        assert hasattr(var_result, 'confidence_level')
        assert var_result.confidence_level == 0.95
        assert var_result.var_value >= 0

class TestAIIntegration:
    """Test AI integration functionality"""
    
    def test_working_ai_initialization(self):
        """Test AI system initialization"""
        ai = WorkingAI()
        
        assert hasattr(ai, 'openai_available')
        assert hasattr(ai, 'claude_available')
        assert hasattr(ai, 'fallback_mode')
    
    def test_ai_analysis(self):
        """Test AI analysis functionality"""
        ai = WorkingAI()
        
        # Create mock result
        class MockResult:
            def __init__(self):
                self.total_return = 0.15
                self.sharpe_ratio = 1.2
                self.max_drawdown = 0.08
                self.win_rate = 0.58
                self.num_trades = 25
        
        result = ai.analyze_strategy_performance(MockResult(), "Test Strategy")
        
        assert isinstance(result, AIAnalysisResult)
        assert hasattr(result, 'performance_grade')
        assert hasattr(result, 'overall_score')
        assert hasattr(result, 'recommendations')
        assert result.confidence_score > 0

class TestDataProcessing:
    """Test data processing functionality"""
    
    def test_data_quality_engine(self):
        """Test data quality engine"""
        from nexural_backtesting.data_processing.data_quality_engine import DataQualityEngine
        
        config = {
            'outlier_method': 'iqr',
            'interpolation_method': 'linear',
            'zscore_threshold': 3.0
        }
        
        engine = DataQualityEngine(config)
        assert engine.config is not None
        assert hasattr(engine, 'quality_reports')

class TestIntegration:
    """Integration tests combining multiple components"""
    
    def test_complete_workflow(self):
        """Test complete backtesting workflow"""
        # Create data
        data = create_test_data(100)
        
        # Create strategy
        strategy = UnifiedMovingAverageStrategy(short_window=10, long_window=20)
        signals = strategy.generate_signals(data)
        
        # Run backtest
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        result = engine.run_backtest(data, signals)
        
        # Create risk analysis with synthetic returns (since portfolio_values not available)
        # Use the total return to create a realistic return series
        daily_return = (1 + result.total_return) ** (1/252) - 1  # Convert to daily
        returns = pd.Series(np.random.normal(daily_return, 0.02, 100))  # Synthetic daily returns
        
        risk_manager = PortfolioRiskManager()
        risk_manager.update_portfolio_data(returns)
        risk_metrics = risk_manager.calculate_risk_metrics()
        
        # Run AI analysis
        ai = WorkingAI()
        ai_result = ai.analyze_strategy_performance(result, "Integration Test")
        
        # Validate complete workflow
        assert result is not None
        assert risk_metrics is not None
        assert ai_result is not None
        
        print(f"Integration test complete:")
        print(f"  Return: {result.total_return:.2%}")
        print(f"  Risk (Vol): {risk_metrics.volatility:.2%}")
        print(f"  AI Score: {ai_result.overall_score:.1f}/10")

if __name__ == "__main__":
    # Run tests manually if called directly
    import traceback
    
    test_classes = [
        TestCoreBacktesting(),
        TestRiskManagement(), 
        TestAIIntegration(),
        TestDataProcessing(),
        TestIntegration()
    ]
    
    total_tests = 0
    passed_tests = 0
    
    print("🧪 RUNNING CORE WORKING TESTS")
    print("=" * 60)
    
    for test_class in test_classes:
        class_name = test_class.__class__.__name__
        print(f"\n📊 {class_name}")
        print("-" * 40)
        
        # Get all test methods
        test_methods = [method for method in dir(test_class) if method.startswith('test_')]
        
        for method_name in test_methods:
            total_tests += 1
            try:
                test_method = getattr(test_class, method_name)
                test_method()
                print(f"  ✅ {method_name}")
                passed_tests += 1
            except Exception as e:
                print(f"  ❌ {method_name}: {e}")
                traceback.print_exc()
    
    print(f"\n" + "=" * 60)
    print(f"TEST SUMMARY: {passed_tests}/{total_tests} passed ({passed_tests/total_tests*100:.1f}%)")
    
    if passed_tests == total_tests:
        print("🎉 ALL CORE TESTS PASS - Testing infrastructure working!")
    else:
        print("⚠️  Some tests failed - need to fix remaining issues")
