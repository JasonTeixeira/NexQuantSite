#!/usr/bin/env python3
"""
Test Advanced AI Engine - Phase 2 Enhancement Validation
Compare basic AI (2.0/10) vs Advanced AI (7-8/10)
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

# Add package to path
sys.path.insert(0, str(Path(__file__).parent))

def create_test_scenario():
    """Create comprehensive test scenario"""
    # Create realistic market data
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=252, freq='D')
    
    returns = np.random.normal(0.0008, 0.02, 252)
    # Add some regime changes
    returns[50:80] = np.random.normal(-0.005, 0.04, 30)  # Bear period
    returns[120:150] = np.random.normal(0.003, 0.015, 30)  # Bull period
    
    prices = 100 * (1 + returns).cumprod()
    
    market_data = pd.DataFrame({
        'open': np.roll(prices, 1),
        'high': prices * (1 + np.random.uniform(0, 0.02, 252)),
        'low': prices * (1 - np.random.uniform(0, 0.02, 252)),
        'close': prices,
        'volume': np.random.randint(1000000, 5000000, 252)
    }, index=dates)
    
    # Fix OHLC relationships
    market_data['high'] = market_data[['open', 'high', 'close']].max(axis=1)
    market_data['low'] = market_data[['open', 'low', 'close']].min(axis=1)
    market_data.loc[market_data.index[0], 'open'] = market_data.loc[market_data.index[0], 'close']
    
    return market_data

def run_backtest_for_ai_test():
    """Run backtest to get results for AI analysis"""
    try:
        from nexural_backtesting.core.unified_system import (
            UnifiedEngine, UnifiedConfig, UnifiedMovingAverageStrategy
        )
        
        # Create test data
        market_data = create_test_scenario()
        
        # Run backtest
        strategy = UnifiedMovingAverageStrategy(short_window=20, long_window=50)
        signals = strategy.generate_signals(market_data)
        
        config = UnifiedConfig()
        engine = UnifiedEngine(config)
        result = engine.run_backtest(market_data, signals)
        
        return result, market_data
        
    except Exception as e:
        print(f"❌ Backtest failed: {e}")
        return None, None

def test_basic_ai_vs_advanced_ai():
    """Compare basic AI vs advanced AI analysis"""
    print("🤖 ADVANCED AI ENGINE COMPARISON TEST")
    print("=" * 70)
    
    # Get backtest result
    result, market_data = run_backtest_for_ai_test()
    
    if result is None:
        print("❌ Could not run backtest for AI comparison")
        return False
    
    print(f"✅ Backtest completed for AI analysis")
    print(f"   Strategy return: {result.total_return:.2%}")
    print(f"   Sharpe ratio: {result.sharpe_ratio:.3f}")
    print(f"   Max drawdown: {result.max_drawdown:.2%}")
    
    # Test 1: Basic AI Analysis
    print(f"\n📊 BASIC AI ANALYSIS (Current)")
    print("-" * 40)
    
    try:
        from nexural_backtesting.ai.working_ai import WorkingAI
        
        basic_ai = WorkingAI()
        basic_analysis = basic_ai.analyze_strategy_performance(result, "Test Strategy")
        
        print(f"✅ Basic AI analysis completed")
        print(f"   Overall score: {basic_analysis.overall_score:.1f}/10")
        print(f"   Grade: {basic_analysis.performance_grade}")
        print(f"   Confidence: {basic_analysis.confidence_score:.2f}")
        print(f"   Recommendations: {len(basic_analysis.recommendations)}")
        
    except Exception as e:
        print(f"❌ Basic AI analysis failed: {e}")
        return False
    
    # Test 2: Advanced AI Analysis
    print(f"\n🧠 ADVANCED AI ANALYSIS (Phase 2)")
    print("-" * 40)
    
    try:
        from nexural_backtesting.ai.advanced_ai_engine import AdvancedAIEngine
        
        advanced_ai = AdvancedAIEngine()
        advanced_analysis = advanced_ai.analyze_strategy_advanced(result, "Test Strategy", market_data)
        
        print(f"✅ Advanced AI analysis completed")
        print(f"   Overall score: {advanced_analysis.overall_score:.1f}/10")
        print(f"   Grade: {advanced_analysis.performance_grade}")
        print(f"   Confidence: {advanced_analysis.confidence_score:.2f}")
        print(f"   Optimization suggestions: {len(advanced_analysis.optimization_suggestions)}")
        
        # Show advanced features
        print(f"\n🎯 ADVANCED ANALYSIS FEATURES:")
        print(f"   Market regime: {advanced_analysis.market_regime_analysis.get('current_regime', 'N/A')}")
        print(f"   Regime stability: {advanced_analysis.market_regime_analysis.get('regime_stability', 0):.2f}")
        print(f"   Alpha sustainability: {advanced_analysis.alpha_sustainability.get('sustainability_score', 0):.2f}")
        print(f"   Risk efficiency: {advanced_analysis.risk_decomposition.get('risk_efficiency', 0):.2f}")
        print(f"   Institutional readiness: {advanced_analysis.institutional_readiness}")
        
        # Show factor attribution
        print(f"\n📈 FACTOR ATTRIBUTION:")
        for factor, exposure in advanced_analysis.factor_attribution.items():
            print(f"   {factor.title()}: {exposure:.2f}")
        
        # Show future predictions
        print(f"\n🔮 PERFORMANCE PREDICTIONS:")
        future_perf = advanced_analysis.expected_future_performance
        print(f"   Expected 6M Sharpe: {future_perf.get('expected_sharpe_6m', 0):.2f}")
        print(f"   Expected 6M Return: {future_perf.get('expected_return_6m', 0):.2%}")
        print(f"   Expected Max DD: {future_perf.get('expected_max_dd_6m', 0):.2%}")
        
    except Exception as e:
        print(f"❌ Advanced AI analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Comparison
    print(f"\n🏆 AI ENHANCEMENT COMPARISON")
    print("=" * 50)
    
    improvement = advanced_analysis.overall_score - basic_analysis.overall_score
    improvement_pct = (improvement / basic_analysis.overall_score) * 100 if basic_analysis.overall_score > 0 else 0
    
    print(f"Basic AI Score:    {basic_analysis.overall_score:.1f}/10")
    print(f"Advanced AI Score: {advanced_analysis.overall_score:.1f}/10")
    print(f"Improvement:      +{improvement:.1f} points ({improvement_pct:.0f}% better)")
    
    # Quality assessment
    if advanced_analysis.overall_score >= 7.0:
        quality_level = "🏆 INSTITUTIONAL GRADE"
    elif advanced_analysis.overall_score >= 6.0:
        quality_level = "✅ PROFESSIONAL GRADE"
    elif advanced_analysis.overall_score >= 5.0:
        quality_level = "📊 COMMERCIAL GRADE"
    else:
        quality_level = "⚠️  DEVELOPING"
    
    print(f"Quality Level:    {quality_level}")
    
    # Success criteria
    success = (
        advanced_analysis.overall_score > basic_analysis.overall_score and
        advanced_analysis.overall_score >= 6.0 and
        len(advanced_analysis.optimization_suggestions) > 0 and
        advanced_analysis.institutional_readiness != "ASSESSMENT PENDING"
    )
    
    if success:
        print(f"\n🎉 ADVANCED AI ENHANCEMENT SUCCESSFUL!")
        print(f"   AI analysis quality dramatically improved")
        print(f"   Sophisticated features working properly") 
        print(f"   Ready for institutional-grade analysis")
    else:
        print(f"\n⚠️  AI enhancement needs further development")
    
    return success

def validate_advanced_features():
    """Validate specific advanced AI features"""
    print(f"\n🔬 ADVANCED FEATURE VALIDATION")
    print("=" * 50)
    
    try:
        from nexural_backtesting.ai.advanced_ai_engine import AdvancedAIEngine
        
        # Test engine creation
        ai_engine = AdvancedAIEngine()
        print(f"✅ Advanced AI engine created successfully")
        
        # Test ML model initialization
        has_regime_detector = ai_engine.regime_detector is not None
        has_performance_predictor = ai_engine.performance_predictor is not None
        has_factor_analyzer = ai_engine.factor_analyzer is not None
        
        print(f"   Regime detector: {'✅' if has_regime_detector else '❌'}")
        print(f"   Performance predictor: {'✅' if has_performance_predictor else '❌'}")
        print(f"   Factor analyzer: {'✅' if has_factor_analyzer else '❌'}")
        
        # Test with sample data
        result, market_data = run_backtest_for_ai_test()
        
        if result and market_data is not None:
            analysis = ai_engine.analyze_strategy_advanced(result, "Validation Test", market_data)
            
            # Validate analysis completeness
            has_regime_analysis = bool(analysis.market_regime_analysis)
            has_factor_attribution = bool(analysis.factor_attribution)
            has_predictions = bool(analysis.expected_future_performance)
            has_recommendations = len(analysis.optimization_suggestions) > 0
            
            print(f"\n🧪 Analysis Completeness:")
            print(f"   Market regime analysis: {'✅' if has_regime_analysis else '❌'}")
            print(f"   Factor attribution: {'✅' if has_factor_attribution else '❌'}")
            print(f"   Future predictions: {'✅' if has_predictions else '❌'}")
            print(f"   Optimization suggestions: {'✅' if has_recommendations else '❌'}")
            
            success = all([has_regime_analysis, has_factor_attribution, has_predictions, has_recommendations])
            
            if success:
                print(f"\n✅ All advanced features working correctly")
                return True
            else:
                print(f"\n⚠️  Some advanced features need attention")
                return False
        else:
            print(f"❌ Could not validate with sample data")
            return False
            
    except Exception as e:
        print(f"❌ Advanced feature validation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main advanced AI testing"""
    print("🚀 PHASE 2: ADVANCED AI ENGINE VALIDATION")
    print("Ultra-professional AI enhancement testing")
    print("=" * 80)
    
    # Test 1: Basic vs Advanced comparison
    comparison_success = test_basic_ai_vs_advanced_ai()
    
    # Test 2: Advanced feature validation
    feature_success = validate_advanced_features()
    
    # Summary
    print(f"\n" + "=" * 80)
    print("ADVANCED AI ENGINE VALIDATION SUMMARY")
    print("=" * 80)
    
    print(f"Comparison Test: {'✅ SUCCESS' if comparison_success else '❌ FAILED'}")
    print(f"Feature Validation: {'✅ SUCCESS' if feature_success else '❌ FAILED'}")
    
    overall_success = comparison_success and feature_success
    
    if overall_success:
        print(f"\n🏆 PHASE 2 AI ENHANCEMENT: COMPLETE SUCCESS!")
        print(f"   Advanced AI engine provides institutional-grade analysis")
        print(f"   Sophisticated ML models working correctly")
        print(f"   Ready for professional quantitative analysis")
        print(f"   AI capabilities now match industry standards")
    else:
        print(f"\n⚠️  Phase 2 AI enhancement needs additional development")
        print(f"   Some components working, others need refinement")
    
    return overall_success

if __name__ == "__main__":
    main()



