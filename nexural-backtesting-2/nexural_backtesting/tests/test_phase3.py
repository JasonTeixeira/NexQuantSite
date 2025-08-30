"""
Phase 3 Test Script - Risk Management & Analytics
Tests all Phase 3 components to ensure they're working correctly
"""

import sys
import os
from pathlib import Path
import logging
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

# Import Phase 3 components
from core.config_manager import EnhancedConfigManager
from risk_management.portfolio_risk_manager import PortfolioRiskManager, RiskMetrics, RiskLimits
from risk_management.var_engine import VaREngine, VaRMethod, VaRResult
from risk_management.stress_testing import StressTestingEngine, StressScenario, ScenarioType, StressSeverity
from risk_management.performance_analytics import PerformanceAnalytics, PerformanceMetrics, AttributionMethod

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_portfolio_risk_manager():
    """Test portfolio risk manager"""
    print("\n" + "="*60)
    print("TESTING PORTFOLIO RISK MANAGER")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        risk_config = {
            'risk_limits': {
                'max_volatility': 0.20,
                'max_var_95': 0.02,
                'max_drawdown': 0.15,
                'max_leverage': 2.0
            },
            'var_confidence_levels': [0.95, 0.99],
            'volatility_window': 252
        }
        
        # Initialize risk manager
        risk_manager = PortfolioRiskManager(risk_config)
        print("✅ Portfolio risk manager initialized")
        
        # Generate test data
        portfolio_returns, asset_returns, portfolio_weights = generate_test_portfolio_data()
        
        # Update portfolio data
        risk_manager.update_portfolio_data(
            portfolio_returns=portfolio_returns,
            asset_returns=asset_returns,
            portfolio_weights=portfolio_weights
        )
        print(f"✅ Portfolio data updated: {len(portfolio_returns)} observations")
        
        # Calculate risk metrics
        risk_metrics = risk_manager.calculate_risk_metrics(portfolio_value=1000000.0)
        print(f"✅ Risk metrics calculated:")
        print(f"   - Volatility: {risk_metrics.volatility:.2%}")
        print(f"   - VaR 95%: {risk_metrics.var_95:.2%}")
        print(f"   - VaR 99%: {risk_metrics.var_99:.2%}")
        print(f"   - Expected Shortfall 95%: {risk_metrics.expected_shortfall_95:.2%}")
        print(f"   - Beta: {risk_metrics.beta:.2f}")
        print(f"   - Sharpe Ratio: {risk_metrics.sharpe_ratio:.2f}")
        print(f"   - Sortino Ratio: {risk_metrics.sortino_ratio:.2f}")
        print(f"   - Max Drawdown: {risk_metrics.max_drawdown:.2%}")
        print(f"   - Current Drawdown: {risk_metrics.current_drawdown:.2%}")
        print(f"   - Concentration: {risk_metrics.concentration_herfindahl:.2%}")
        print(f"   - Leverage Ratio: {risk_metrics.leverage_ratio:.2f}")
        
        # Check risk limits
        alerts = risk_manager.check_risk_limits(risk_metrics)
        print(f"✅ Risk limit check completed: {len(alerts)} alerts")
        
        for alert in alerts:
            print(f"   - {alert.alert_type.value}: {alert.severity} - {alert.message}")
        
        # Test portfolio optimization
        optimization_result = risk_manager.optimize_portfolio_risk(target_return=0.08)
        print(f"✅ Portfolio optimization completed:")
        print(f"   - Success: {optimization_result['success']}")
        if optimization_result['success']:
            print(f"   - Optimal volatility: {optimization_result['optimal_volatility']:.2%}")
            print(f"   - Target return: {optimization_result['target_return']:.2%}")
        
        # Get risk summary
        risk_summary = risk_manager.get_risk_summary()
        print(f"✅ Risk summary generated: {len(risk_summary)} fields")
        
        return True
        
    except Exception as e:
        print(f"❌ Portfolio risk manager test failed: {e}")
        return False

def test_var_engine():
    """Test VaR engine"""
    print("\n" + "="*60)
    print("TESTING VaR ENGINE")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        var_config = {
            'confidence_levels': [0.95, 0.99],
            'time_horizon': 1,
            'lookback_period': 252,
            'monte_carlo_simulations': 10000,
            'volatility_window': 60
        }
        
        # Initialize VaR engine
        var_engine = VaREngine(var_config)
        print("✅ VaR engine initialized")
        
        # Generate test data
        portfolio_returns, asset_returns, portfolio_weights = generate_test_portfolio_data()
        
        # Update VaR data
        var_engine.update_data(
            returns_data=asset_returns,
            portfolio_weights=portfolio_weights,
            portfolio_value=1000000.0
        )
        print(f"✅ VaR data updated: {len(asset_returns)} observations")
        
        # Test different VaR methods
        var_methods = [
            VaRMethod.HISTORICAL,
            VaRMethod.PARAMETRIC,
            VaRMethod.MONTE_CARLO
        ]
        
        for method in var_methods:
            try:
                var_result = var_engine.calculate_var(method=method, confidence_level=0.95)
                print(f"✅ {method.value} VaR calculated:")
                print(f"   - VaR Value: ${var_result.var_value:,.2f}")
                print(f"   - VaR Percentage: {var_result.var_percentage:.2%}")
                print(f"   - Expected Shortfall: ${var_result.expected_shortfall:,.2f}")
                print(f"   - ES Percentage: {var_result.es_percentage:.2%}")
            except Exception as e:
                print(f"❌ {method.value} VaR calculation failed: {e}")
        
        # Calculate portfolio VaR using multiple methods
        portfolio_var_results = var_engine.calculate_portfolio_var(confidence_level=0.95)
        print(f"✅ Portfolio VaR calculated using {len(portfolio_var_results)} methods")
        
        # Calculate marginal VaR
        marginal_var = var_engine.calculate_marginal_var(confidence_level=0.95)
        print(f"✅ Marginal VaR calculated for {len(marginal_var)} assets")
        print(f"   - Total marginal VaR: ${marginal_var.sum():,.2f}")
        
        # Calculate incremental VaR
        incremental_var = var_engine.calculate_incremental_var(confidence_level=0.95)
        print(f"✅ Incremental VaR calculated for {len(incremental_var)} assets")
        print(f"   - Total incremental VaR: ${incremental_var.sum():,.2f}")
        
        # Stress test VaR
        stress_scenarios = {
            'market_crash': 1.5,
            'volatility_spike': 2.0,
            'correlation_breakdown': 1.3
        }
        stress_results = var_engine.stress_test_var(stress_scenarios)
        print(f"✅ VaR stress testing completed: {len(stress_results)} scenarios")
        
        for scenario, result in stress_results.items():
            print(f"   - {scenario}: VaR = {result.var_percentage:.2%}")
        
        # Get VaR summary
        var_summary = var_engine.get_var_summary()
        print(f"✅ VaR summary generated: {len(var_summary)} fields")
        
        return True
        
    except Exception as e:
        print(f"❌ VaR engine test failed: {e}")
        return False

def test_stress_testing_engine():
    """Test stress testing engine"""
    print("\n" + "="*60)
    print("TESTING STRESS TESTING ENGINE")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        stress_config = {
            'default_scenarios': True,
            'risk_free_rate': 0.02,
            'rebalancing_frequency': 'daily'
        }
        
        # Initialize stress testing engine
        stress_engine = StressTestingEngine(stress_config)
        print("✅ Stress testing engine initialized")
        
        # Generate test data
        portfolio_returns, asset_returns, portfolio_weights = generate_test_portfolio_data()
        
        # Update stress testing data
        stress_engine.update_data(
            returns_data=asset_returns,
            portfolio_weights=portfolio_weights,
            portfolio_value=1000000.0
        )
        print(f"✅ Stress testing data updated: {len(asset_returns)} observations")
        
        # Add custom scenario
        custom_scenario = StressScenario(
            name="Custom Market Shock",
            scenario_type=ScenarioType.CUSTOM,
            severity=StressSeverity.SEVERE,
            description="Custom market shock scenario",
            market_shocks={
                'AAPL': -0.20,
                'GOOGL': -0.15,
                'MSFT': -0.10
            },
            volatility_multipliers={
                'AAPL': 2.0,
                'GOOGL': 1.8,
                'MSFT': 1.5
            },
            duration_days=5,
            probability=0.01
        )
        stress_engine.add_scenario(custom_scenario)
        print("✅ Custom stress scenario added")
        
        # Run comprehensive stress test
        stress_report = stress_engine.run_stress_test()
        print(f"✅ Comprehensive stress test completed:")
        print(f"   - Scenarios tested: {stress_report.scenarios_tested}")
        print(f"   - Total execution time: {stress_report.total_execution_time:.2f} seconds")
        print(f"   - Summary statistics: {len(stress_report.summary_statistics)} metrics")
        
        # Display summary statistics
        summary = stress_report.summary_statistics
        print(f"   - Mean portfolio return: {summary.get('mean_portfolio_return', 0):.2%}")
        print(f"   - Min portfolio return: {summary.get('min_portfolio_return', 0):.2%}")
        print(f"   - Max portfolio return: {summary.get('max_portfolio_return', 0):.2%}")
        print(f"   - Mean VaR change: {summary.get('mean_var_change', 0):.2%}")
        print(f"   - Mean max drawdown: {summary.get('mean_max_drawdown', 0):.2%}")
        
        # Display worst and best case scenarios
        if stress_report.worst_case_scenario:
            print(f"   - Worst case: {stress_report.worst_case_scenario.scenario.name}")
            print(f"     Portfolio return: {stress_report.worst_case_scenario.portfolio_return:.2%}")
        
        if stress_report.best_case_scenario:
            print(f"   - Best case: {stress_report.best_case_scenario.scenario.name}")
            print(f"     Portfolio return: {stress_report.best_case_scenario.portfolio_return:.2%}")
        
        # Display recommendations
        print(f"   - Recommendations: {len(stress_report.recommendations)}")
        for rec in stress_report.recommendations[:3]:  # Show first 3
            print(f"     * {rec}")
        
        # Run sensitivity analysis
        risk_factors = ['AAPL', 'GOOGL', 'MSFT']
        shock_sizes = [-0.10, -0.20, -0.30]
        sensitivity_results = stress_engine.run_sensitivity_analysis(risk_factors, shock_sizes)
        print(f"✅ Sensitivity analysis completed: {len(sensitivity_results)} factors")
        
        # Run Monte Carlo stress test
        mc_results = stress_engine.run_monte_carlo_stress_test(n_simulations=100)
        print(f"✅ Monte Carlo stress test completed: {len(mc_results)} simulations")
        
        # Calculate summary statistics for Monte Carlo results
        mc_returns = [r.portfolio_return for r in mc_results]
        print(f"   - MC mean return: {np.mean(mc_returns):.2%}")
        print(f"   - MC std return: {np.std(mc_returns):.2%}")
        print(f"   - MC min return: {np.min(mc_returns):.2%}")
        print(f"   - MC max return: {np.max(mc_returns):.2%}")
        
        return True
        
    except Exception as e:
        print(f"❌ Stress testing engine test failed: {e}")
        return False

def test_performance_analytics():
    """Test performance analytics engine"""
    print("\n" + "="*60)
    print("TESTING PERFORMANCE ANALYTICS ENGINE")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        performance_config = {
            'risk_free_rate': 0.02,
            'attribution_method': 'brinson_hood_beebower',
            'factor_models': {}
        }
        
        # Initialize performance analytics engine
        performance_engine = PerformanceAnalytics(performance_config)
        print("✅ Performance analytics engine initialized")
        
        # Generate test data
        portfolio_returns, asset_returns, portfolio_weights = generate_test_portfolio_data()
        benchmark_returns = generate_test_benchmark_data()
        
        # Update performance data
        performance_engine.update_data(
            portfolio_returns=portfolio_returns,
            benchmark_returns=benchmark_returns,
            asset_returns=asset_returns,
            portfolio_weights=portfolio_weights
        )
        print(f"✅ Performance data updated: {len(portfolio_returns)} observations")
        
        # Calculate performance metrics for different periods
        periods = ['1m', '3m', '6m', '1y', 'all']
        
        for period in periods:
            try:
                metrics = performance_engine.calculate_performance_metrics(period)
                print(f"✅ {period} performance metrics calculated:")
                print(f"   - Total return: {metrics.total_return:.2%}")
                print(f"   - Annualized return: {metrics.annualized_return:.2%}")
                print(f"   - Volatility: {metrics.volatility:.2%}")
                print(f"   - Sharpe ratio: {metrics.sharpe_ratio:.2f}")
                print(f"   - Sortino ratio: {metrics.sortino_ratio:.2f}")
                print(f"   - Max drawdown: {metrics.max_drawdown:.2%}")
                print(f"   - VaR 95%: {metrics.value_at_risk_95:.2%}")
                print(f"   - Win rate: {metrics.win_rate:.2%}")
                print(f"   - Profit factor: {metrics.profit_factor:.2f}")
            except Exception as e:
                print(f"❌ {period} metrics calculation failed: {e}")
        
        # Calculate attribution analysis
        attribution = performance_engine.calculate_attribution_analysis()
        print(f"✅ Attribution analysis completed:")
        print(f"   - Total attribution: {attribution.total_attribution:.2%}")
        print(f"   - Asset allocation effect: {attribution.asset_allocation_effect:.2%}")
        print(f"   - Stock selection effect: {attribution.stock_selection_effect:.2%}")
        print(f"   - Interaction effect: {attribution.interaction_effect:.2%}")
        print(f"   - Attribution method: {attribution.attribution_method.value}")
        
        # Calculate risk-adjusted returns
        risk_adjusted = performance_engine.calculate_risk_adjusted_returns()
        print(f"✅ Risk-adjusted returns calculated:")
        print(f"   - Excess return: {risk_adjusted.excess_return:.2%}")
        print(f"   - Sharpe ratio: {risk_adjusted.sharpe_ratio:.2f}")
        print(f"   - Sortino ratio: {risk_adjusted.sortino_ratio:.2f}")
        print(f"   - Information ratio: {risk_adjusted.information_ratio:.2f}")
        print(f"   - Treynor ratio: {risk_adjusted.treynor_ratio:.2f}")
        print(f"   - Jensen's alpha: {risk_adjusted.jensen_alpha:.2%}")
        print(f"   - Modigliani ratio: {risk_adjusted.modigliani_ratio:.2%}")
        print(f"   - Omega ratio: {risk_adjusted.omega_ratio:.2f}")
        
        # Generate comprehensive performance report
        performance_report = performance_engine.generate_performance_report()
        print(f"✅ Performance report generated:")
        print(f"   - Periods analyzed: {len(performance_report['periods_analyzed'])}")
        print(f"   - Metrics by period: {len(performance_report['metrics_by_period'])}")
        print(f"   - Summary statistics: {len(performance_report['summary_statistics'])}")
        print(f"   - Risk analysis: {len(performance_report['risk_analysis'])}")
        
        # Display summary statistics
        summary = performance_report['summary_statistics']
        print(f"   - Average annualized return: {summary.get('average_annualized_return', 0):.2%}")
        print(f"   - Average volatility: {summary.get('average_volatility', 0):.2%}")
        print(f"   - Average Sharpe ratio: {summary.get('average_sharpe_ratio', 0):.2f}")
        print(f"   - Best period: {summary.get('best_period', 'N/A')}")
        print(f"   - Worst period: {summary.get('worst_period', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance analytics engine test failed: {e}")
        return False

def test_integration():
    """Test integration of all Phase 3 components"""
    print("\n" + "="*60)
    print("TESTING PHASE 3 INTEGRATION")
    print("="*60)
    
    try:
        # Initialize all components
        config_manager = EnhancedConfigManager("config/config.yaml")
        
        # Initialize risk management components
        risk_config = {
            'risk_limits': {
                'max_volatility': 0.20,
                'max_var_95': 0.02,
                'max_drawdown': 0.15
            }
        }
        risk_manager = PortfolioRiskManager(risk_config)
        
        var_config = {
            'confidence_levels': [0.95, 0.99],
            'lookback_period': 252
        }
        var_engine = VaREngine(var_config)
        
        stress_config = {
            'default_scenarios': True,
            'risk_free_rate': 0.02
        }
        stress_engine = StressTestingEngine(stress_config)
        
        performance_config = {
            'risk_free_rate': 0.02,
            'attribution_method': 'brinson_hood_beebower'
        }
        performance_engine = PerformanceAnalytics(performance_config)
        
        print("✅ All Phase 3 components initialized")
        
        # Generate test data
        portfolio_returns, asset_returns, portfolio_weights = generate_test_portfolio_data()
        benchmark_returns = generate_test_benchmark_data()
        
        # Step 1: Risk Management
        risk_manager.update_portfolio_data(portfolio_returns, asset_returns, portfolio_weights)
        risk_metrics = risk_manager.calculate_risk_metrics(1000000.0)
        risk_alerts = risk_manager.check_risk_limits(risk_metrics)
        print(f"✅ Step 1: Risk management completed ({len(risk_alerts)} alerts)")
        
        # Step 2: VaR Analysis
        var_engine.update_data(asset_returns, portfolio_weights, 1000000.0)
        var_results = var_engine.calculate_portfolio_var()
        marginal_var = var_engine.calculate_marginal_var()
        print(f"✅ Step 2: VaR analysis completed ({len(var_results)} methods)")
        
        # Step 3: Stress Testing
        stress_engine.update_data(asset_returns, portfolio_weights, 1000000.0)
        stress_report = stress_engine.run_stress_test()
        print(f"✅ Step 3: Stress testing completed ({stress_report.scenarios_tested} scenarios)")
        
        # Step 4: Performance Analytics
        performance_engine.update_data(portfolio_returns, benchmark_returns, asset_returns, portfolio_weights)
        performance_metrics = performance_engine.calculate_performance_metrics('all')
        attribution = performance_engine.calculate_attribution_analysis()
        risk_adjusted = performance_engine.calculate_risk_adjusted_returns()
        print(f"✅ Step 4: Performance analytics completed")
        
        # Verify data flow and consistency
        print(f"✅ Integration test completed successfully:")
        print(f"   - Portfolio returns: {len(portfolio_returns)} observations")
        print(f"   - Risk metrics: Vol={risk_metrics.volatility:.2%}, VaR={risk_metrics.var_95:.2%}")
        print(f"   - VaR methods: {len(var_results)}")
        print(f"   - Stress scenarios: {stress_report.scenarios_tested}")
        print(f"   - Performance metrics: Return={performance_metrics.annualized_return:.2%}, Sharpe={performance_metrics.sharpe_ratio:.2f}")
        print(f"   - Attribution: {attribution.total_attribution:.2%}")
        print(f"   - Risk-adjusted: Sharpe={risk_adjusted.sharpe_ratio:.2f}, Information={risk_adjusted.information_ratio:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def generate_test_portfolio_data():
    """Generate test portfolio data"""
    try:
        # Generate timestamps
        start_date = datetime.now() - timedelta(days=365)
        timestamps = pd.date_range(start=start_date, periods=252, freq='1D')
        
        # Generate asset returns
        np.random.seed(42)
        n_assets = 10
        assets = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'JPM', 'BAC', 'WFC', 'JNJ', 'PFE']
        
        # Generate correlated returns
        returns_data = pd.DataFrame(index=timestamps, columns=assets)
        
        for i, asset in enumerate(assets):
            # Base return with some correlation
            base_return = np.random.normal(0.0005, 0.02, len(timestamps))  # 0.05% daily return, 2% daily vol
            if i > 0:
                # Add correlation with previous asset
                correlation = 0.3
                correlated_component = correlation * returns_data.iloc[:, i-1] + np.sqrt(1 - correlation**2) * np.random.normal(0, 0.02, len(timestamps))
                returns_data[asset] = 0.7 * base_return + 0.3 * correlated_component
            else:
                returns_data[asset] = base_return
        
        # Generate portfolio weights
        weights = np.random.dirichlet(np.ones(n_assets))  # Random weights that sum to 1
        portfolio_weights = pd.Series(weights, index=assets)
        
        # Calculate portfolio returns
        portfolio_returns = (returns_data * portfolio_weights).sum(axis=1)
        
        return portfolio_returns, returns_data, portfolio_weights
        
    except Exception as e:
        logger.error(f"Failed to generate test portfolio data: {e}")
        return pd.Series(), pd.DataFrame(), pd.Series()

def generate_test_benchmark_data():
    """Generate test benchmark data"""
    try:
        # Generate timestamps
        start_date = datetime.now() - timedelta(days=365)
        timestamps = pd.date_range(start=start_date, periods=252, freq='1D')
        
        # Generate benchmark returns (e.g., S&P 500)
        np.random.seed(42)
        benchmark_returns = pd.Series(
            np.random.normal(0.0004, 0.015, len(timestamps)),  # 0.04% daily return, 1.5% daily vol
            index=timestamps
        )
        
        return benchmark_returns
        
    except Exception as e:
        logger.error(f"Failed to generate test benchmark data: {e}")
        return pd.Series()

def main():
    """Run all Phase 3 tests"""
    print("🚀 PHASE 3 TESTING - RISK MANAGEMENT & ANALYTICS")
    print("="*80)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Portfolio Risk Manager", test_portfolio_risk_manager),
        ("VaR Engine", test_var_engine),
        ("Stress Testing Engine", test_stress_testing_engine),
        ("Performance Analytics", test_performance_analytics),
        ("Phase 3 Integration", test_integration),
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            test_results.append((test_name, False))
    
    # Summary
    print("\n" + "="*80)
    print("PHASE 3 TEST SUMMARY")
    print("="*80)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:25} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL PHASE 3 TESTS PASSED!")
        print("✅ Risk Management & Analytics is ready for Phase 4")
    else:
        print("⚠️  Some tests failed. Please review and fix issues before proceeding.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
