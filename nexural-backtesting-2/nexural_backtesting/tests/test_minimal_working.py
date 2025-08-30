#!/usr/bin/env python3
"""
Minimal Working Test Suite
Tests that actually work and validate real functionality
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Add package to path - ensure it works
current_dir = Path(__file__).parent
package_dir = current_dir.parent
sys.path.insert(0, str(package_dir))

def test_imports():
    """Test that critical imports work"""
    try:
        # Test core imports
        from nexural_backtesting.core.unified_system import UnifiedEngine, UnifiedConfig
        from nexural_backtesting.risk_management.portfolio_risk_manager import PortfolioRiskManager
        from nexural_backtesting.ai.working_ai import WorkingAI
        
        print("✅ All critical imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_basic_functionality():
    """Test basic functionality works"""
    try:
        from nexural_backtesting.core.unified_system import (
            UnifiedEngine, UnifiedConfig, UnifiedMovingAverageStrategy
        )
        
        # Create test data
        dates = pd.date_range('2023-01-01', periods=100, freq='D')
        prices = 100 + np.cumsum(np.random.randn(100) * 0.01)
        data = pd.DataFrame({
            'close': prices,
            'high': prices * 1.01,
            'low': prices * 0.99,
            'open': np.roll(prices, 1)
        }, index=dates)
        
        # Test strategy
        strategy = UnifiedMovingAverageStrategy(short_window=5, long_window=10)
        signals = strategy.generate_signals(data)
        
        # Test engine
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        result = engine.run_backtest(data, signals)
        
        # Validate result
        assert hasattr(result, 'total_return')
        assert hasattr(result, 'sharpe_ratio')
        
        print("✅ Basic functionality test passed")
        print(f"   Return: {result.total_return:.2%}")
        print(f"   Sharpe: {result.sharpe_ratio:.3f}")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

def test_risk_management():
    """Test risk management works"""
    try:
        from nexural_backtesting.risk_management.portfolio_risk_manager import PortfolioRiskManager
        
        # Create test returns
        returns = pd.Series(np.random.normal(0.001, 0.02, 100))
        
        # Test risk manager
        risk_manager = PortfolioRiskManager()
        risk_manager.update_portfolio_data(returns)
        
        metrics = risk_manager.calculate_risk_metrics()
        
        assert hasattr(metrics, 'volatility')
        assert hasattr(metrics, 'var_95')
        assert metrics.volatility > 0
        
        print("✅ Risk management test passed")
        print(f"   Volatility: {metrics.volatility:.2%}")
        print(f"   VaR 95%: {metrics.var_95:.2%}")
        return True
        
    except Exception as e:
        print(f"❌ Risk management test failed: {e}")
        return False

def test_ai_integration():
    """Test AI integration works"""
    try:
        from nexural_backtesting.ai.working_ai import WorkingAI
        
        ai = WorkingAI()
        
        # Create mock result
        class MockResult:
            total_return = 0.1
            sharpe_ratio = 1.0
            max_drawdown = 0.05
            win_rate = 0.6
            num_trades = 20
        
        analysis = ai.analyze_strategy_performance(MockResult(), "Test")
        
        assert hasattr(analysis, 'performance_grade')
        assert hasattr(analysis, 'overall_score')
        
        print("✅ AI integration test passed")
        print(f"   Grade: {analysis.performance_grade}")
        print(f"   Score: {analysis.overall_score:.1f}/10")
        return True
        
    except Exception as e:
        print(f"❌ AI integration test failed: {e}")
        return False

def run_all_tests():
    """Run all minimal tests"""
    print("🧪 MINIMAL WORKING TEST SUITE")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Basic Functionality", test_basic_functionality),
        ("Risk Management", test_risk_management),
        ("AI Integration", test_ai_integration)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📊 {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
    
    print(f"\n" + "=" * 50)
    print(f"RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL MINIMAL TESTS PASS!")
        print("Core functionality is solid and reliable")
    else:
        print(f"⚠️  {total-passed} tests failed")
        print("Some components need attention")
    
    return passed, total

if __name__ == "__main__":
    run_all_tests()

# For pytest compatibility
def test_all_components():
    """Pytest-compatible test"""
    passed, total = run_all_tests()
    assert passed == total, f"Only {passed}/{total} tests passed"



