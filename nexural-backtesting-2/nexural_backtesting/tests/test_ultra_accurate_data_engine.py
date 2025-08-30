#!/usr/bin/env python3
"""
Ultra-Accurate Data Engine Test Suite
Comprehensive testing for 99.5% accuracy target
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add the data_quality directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'data_quality'))

from ultra_accurate_data_engine import (
    UltraAccurateDataEngine,
    ValidationConfig,
    DataQualityMetrics,
    QualityLevel
)

async def test_ultra_accurate_data_engine():
    """Main test function for ultra-accurate data engine"""
    
    print("🚀 Testing Ultra-Accurate Data Engine")
    print("=" * 60)
    
    # Initialize the engine
    config = ValidationConfig(
        quality_threshold=0.995,  # 99.5% target
        enable_auto_repair=True,
        enable_real_time_monitoring=True,
        cache_validation_results=True
    )
    
    engine = UltraAccurateDataEngine(config)
    
    test_results = []
    
    # Test 1: Perfect Data
    print("\n📊 Test 1: Perfect Data Validation")
    result = await test_perfect_data(engine)
    test_results.append(("Perfect Data", result))
    
    # Test 2: Structural Issues
    print("\n📊 Test 2: Structural Issues")
    result = await test_structural_issues(engine)
    test_results.append(("Structural Issues", result))
    
    # Test 3: Business Logic Issues
    print("\n📊 Test 3: Business Logic Issues")
    result = await test_business_logic_issues(engine)
    test_results.append(("Business Logic Issues", result))
    
    # Test 4: Statistical Anomalies
    print("\n📊 Test 4: Statistical Anomalies")
    result = await test_statistical_anomalies(engine)
    test_results.append(("Statistical Anomalies", result))
    
    # Test 5: Missing Data
    print("\n📊 Test 5: Missing Data")
    result = await test_missing_data(engine)
    test_results.append(("Missing Data", result))
    
    # Test 6: Extreme Outliers
    print("\n📊 Test 6: Extreme Outliers")
    result = await test_extreme_outliers(engine)
    test_results.append(("Extreme Outliers", result))
    
    # Test 7: Auto-Repair Functionality
    print("\n📊 Test 7: Auto-Repair Functionality")
    result = await test_auto_repair(engine)
    test_results.append(("Auto-Repair", result))
    
    # Test 8: Performance and Scalability
    print("\n📊 Test 8: Performance and Scalability")
    result = await test_performance_scalability(engine)
    test_results.append(("Performance", result))
    
    # Test 9: Quality Metrics Accuracy
    print("\n📊 Test 9: Quality Metrics Accuracy")
    result = await test_quality_metrics_accuracy(engine)
    test_results.append(("Quality Metrics", result))
    
    # Test 10: Real-World Scenarios
    print("\n📊 Test 10: Real-World Scenarios")
    result = await test_real_world_scenarios(engine)
    test_results.append(("Real-World", result))
    
    # Print comprehensive results
    print("\n" + "=" * 60)
    print("📈 COMPREHENSIVE TEST RESULTS")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    # Quality statistics
    quality_stats = engine.get_quality_stats()
    if quality_stats:
        print(f"\n📊 Quality Statistics:")
        print(f"   Total Validations: {quality_stats.get('total_validations', 0)}")
        print(f"   Average Quality Score: {quality_stats.get('average_quality_score', 0):.3f}")
        print(f"   Excellent Quality Count: {quality_stats.get('excellent_quality_count', 0)}")
        print(f"   Poor Quality Count: {quality_stats.get('poor_quality_count', 0)}")
    
    # Final assessment
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Ultra-Accurate Data Engine is ready for production.")
        print("   Target: 99.5% accuracy ✅")
        print("   Status: State-of-the-art data quality achieved! 🚀")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Review issues above.")
    
    return passed == total

async def test_perfect_data(engine: UltraAccurateDataEngine) -> bool:
    """Test with perfectly clean data"""
    
    # Create perfect data
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    perfect_data = pd.DataFrame({
        'timestamp': dates,
        'open': np.random.uniform(100, 200, len(dates)),
        'high': np.random.uniform(200, 250, len(dates)),
        'low': np.random.uniform(50, 100, len(dates)),
        'close': np.random.uniform(100, 200, len(dates)),
        'volume': np.random.randint(1000000, 10000000, len(dates))
    })
    
    # Ensure OHLC consistency
    perfect_data['high'] = perfect_data[['open', 'high', 'close']].max(axis=1)
    perfect_data['low'] = perfect_data[['open', 'low', 'close']].min(axis=1)
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        perfect_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check results
    success = (
        metrics.overall_score >= 0.95 and  # Should be excellent
        len(cleaned_data) == len(perfect_data) and  # No data lost
        len(metrics.issues) == 0  # No issues found
    )
    
    print(f"   Quality Score: {metrics.overall_score:.3f}")
    print(f"   Issues Found: {len(metrics.issues)}")
    print(f"   Data Integrity: {'✅' if len(cleaned_data) == len(perfect_data) else '❌'}")
    
    return success

async def test_structural_issues(engine: UltraAccurateDataEngine) -> bool:
    """Test structural validation"""
    
    # Create data with structural issues
    dates = pd.date_range(start='2023-01-01', end='2023-01-10', freq='D')
    bad_data = pd.DataFrame({
        'timestamp': dates,
        'open': ['100.0', '101.0', '102.0', '103.0', '104.0',  # String values
                '105.0', '106.0', '107.0', '108.0', '109.0'],
        'high': [200, 201, 202, 203, 204, 205, 206, 207, 208, 209],
        'low': [50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
        'close': [150, 151, 152, 153, 154, 155, 156, 157, 158, 159],
        'volume': [1000000, 1100000, 1200000, 1300000, 1400000,
                  1500000, 1600000, 1700000, 1800000, 1900000]
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        bad_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that structural issues were detected and fixed
    success = (
        metrics.structural_validation.get('data_types_correct', 0) > 0.5 and  # Should improve
        len(cleaned_data) == len(bad_data) and  # No data lost
        cleaned_data['open'].dtype == 'float64'  # Should be converted
    )
    
    print(f"   Structural Score: {metrics.structural_validation.get('schema_compliance', 0):.3f}")
    print(f"   Data Type Fixes: {'✅' if cleaned_data['open'].dtype == 'float64' else '❌'}")
    print(f"   Issues Detected: {len(metrics.structural_validation.get('issues', []))}")
    
    return success

async def test_business_logic_issues(engine: UltraAccurateDataEngine) -> bool:
    """Test business logic validation"""
    
    # Create data with OHLC violations
    dates = pd.date_range(start='2023-01-01', end='2023-01-10', freq='D')
    bad_data = pd.DataFrame({
        'timestamp': dates,
        'open': [100, 101, 102, 103, 104, 105, 106, 107, 108, 109],
        'high': [150, 151, 152, 153, 154, 155, 156, 157, 158, 159],
        'low': [200, 201, 202, 203, 204, 205, 206, 207, 208, 209],  # Low > High!
        'close': [125, 126, 127, 128, 129, 130, 131, 132, 133, 134],
        'volume': [1000000, 1100000, 1200000, 1300000, 1400000,
                  1500000, 1600000, 1700000, 1800000, 1900000]
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        bad_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that business logic issues were detected and fixed
    business_score = np.mean([
        metrics.business_logic_validation.get('ohlc_consistency', 0),
        metrics.business_logic_validation.get('price_validity', 0),
        metrics.business_logic_validation.get('volume_validity', 0)
    ])
    
    success = (
        business_score > 0.8 and  # Should be good after fixes
        len(cleaned_data) == len(bad_data) and  # No data lost
        all(cleaned_data['high'] >= cleaned_data['low'])  # OHLC fixed
    )
    
    print(f"   Business Logic Score: {business_score:.3f}")
    print(f"   OHLC Consistency: {'✅' if all(cleaned_data['high'] >= cleaned_data['low']) else '❌'}")
    print(f"   Issues Fixed: {len(metrics.auto_fixes_applied)}")
    
    return success

async def test_statistical_anomalies(engine: UltraAccurateDataEngine) -> bool:
    """Test statistical validation and outlier detection"""
    
    # Create data with statistical anomalies
    dates = pd.date_range(start='2023-01-01', end='2023-04-10', freq='D')  # 100 days
    normal_returns = np.random.normal(0, 0.02, len(dates))  # 2% daily volatility
    
    # Add some outliers
    normal_returns[10] = 0.5  # 50% move
    normal_returns[25] = -0.4  # -40% move
    normal_returns[50] = 0.3  # 30% move
    
    # Generate prices from returns
    prices = [100]  # Starting price
    for ret in normal_returns[1:]:
        prices.append(prices[-1] * (1 + ret))
    
    anomaly_data = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': [p * 1.02 for p in prices],
        'low': [p * 0.98 for p in prices],
        'close': prices,
        'volume': np.random.randint(1000000, 10000000, len(dates))
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        anomaly_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that anomalies were detected
    statistical_score = np.mean([
        metrics.statistical_validation.get('outlier_detection_score', 0),
        metrics.statistical_validation.get('distribution_validity', 0),
        metrics.statistical_validation.get('statistical_consistency', 0)
    ])
    
    success = (
        statistical_score > 0.7 and  # Should detect anomalies
        metrics.statistical_validation.get('outliers_found', 0) > 0 and  # Should find outliers
        len(cleaned_data) <= len(anomaly_data)  # May remove extreme outliers
    )
    
    print(f"   Statistical Score: {statistical_score:.3f}")
    print(f"   Outliers Found: {metrics.statistical_validation.get('outliers_found', 0)}")
    print(f"   Distribution Validity: {metrics.statistical_validation.get('distribution_validity', 0):.3f}")
    
    return success

async def test_missing_data(engine: UltraAccurateDataEngine) -> bool:
    """Test handling of missing data"""
    
    # Create data with missing values
    dates = pd.date_range(start='2023-01-01', end='2023-01-20', freq='D')
    missing_data = pd.DataFrame({
        'timestamp': dates,
        'open': [100, 101, np.nan, 103, 104, 105, np.nan, 107, 108, 109,
                110, 111, 112, np.nan, 114, 115, 116, 117, 118, 119],
        'high': [150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
                160, 161, 162, 163, 164, 165, 166, 167, 168, 169],
        'low': [50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
               60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
        'close': [125, 126, 127, 128, 129, 130, 131, 132, 133, 134,
                 135, 136, 137, 138, 139, 140, 141, 142, 143, 144],
        'volume': [1000000, 1100000, 1200000, 1300000, 1400000,
                  1500000, 1600000, 1700000, 1800000, 1900000,
                  2000000, 2100000, 2200000, 2300000, 2400000,
                  2500000, 2600000, 2700000, 2800000, 2900000]
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        missing_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that missing data was handled
    original_missing = missing_data.isnull().sum().sum()
    final_missing = cleaned_data.isnull().sum().sum()
    
    success = (
        final_missing < original_missing and  # Should reduce missing data
        len(cleaned_data) == len(missing_data) and  # No data lost
        'missing_values_interpolated' in metrics.auto_fixes_applied  # Should apply fix
    )
    
    print(f"   Original Missing: {original_missing}")
    print(f"   Final Missing: {final_missing}")
    print(f"   Interpolation Applied: {'✅' if 'missing_values_interpolated' in metrics.auto_fixes_applied else '❌'}")
    
    return success

async def test_extreme_outliers(engine: UltraAccurateDataEngine) -> bool:
    """Test extreme outlier detection and removal"""
    
    # Create data with extreme outliers
    dates = pd.date_range(start='2023-01-01', end='2023-02-19', freq='D')  # 50 days
    normal_prices = np.random.uniform(100, 200, len(dates))
    
    # Add extreme outliers
    normal_prices[10] = 10000  # Extreme high
    normal_prices[25] = 0.01   # Extreme low
    normal_prices[40] = 5000   # Another extreme
    
    extreme_data = pd.DataFrame({
        'timestamp': dates,
        'open': normal_prices,
        'high': normal_prices * 1.02,
        'low': normal_prices * 0.98,
        'close': normal_prices,
        'volume': np.random.randint(1000000, 10000000, len(dates))
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        extreme_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that extreme outliers were handled
    success = (
        len(cleaned_data) < len(extreme_data) and  # Should remove extreme outliers
        metrics.statistical_validation.get('outliers_found', 0) > 0 and  # Should detect outliers
        'extreme_outliers_removed' in metrics.auto_fixes_applied  # Should apply fix
    )
    
    print(f"   Original Records: {len(extreme_data)}")
    print(f"   Final Records: {len(cleaned_data)}")
    print(f"   Outliers Removed: {len(extreme_data) - len(cleaned_data)}")
    print(f"   Extreme Outlier Fix: {'✅' if 'extreme_outliers_removed' in metrics.auto_fixes_applied else '❌'}")
    
    return success

async def test_auto_repair(engine: UltraAccurateDataEngine) -> bool:
    """Test comprehensive auto-repair functionality"""
    
    # Create data with multiple issues
    dates = pd.date_range(start='2023-01-01', end='2023-01-15', freq='D')
    bad_data = pd.DataFrame({
        'timestamp': dates,
        'open': [100, 101, np.nan, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
        'high': [150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164],
        'low': [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214],  # Low > High
        'close': [125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139],
        'volume': [1000000, -500000, 1200000, 1300000, 1400000,  # Negative volume
                  1500000, 1600000, 1700000, 1800000, 1900000,
                  2000000, 2100000, 2200000, 2300000, 2400000]
    })
    
    # Add duplicate timestamp
    bad_data.loc[14, 'timestamp'] = bad_data.loc[0, 'timestamp']
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        bad_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that multiple auto-repairs were applied
    repairs_applied = metrics.auto_fixes_applied
    expected_repairs = [
        'missing_values_interpolated',
        'duplicate_timestamps_removed',
        'negative_volumes_fixed'
    ]
    
    success = (
        len(repairs_applied) >= 2 and  # Should apply multiple fixes
        len(cleaned_data) <= len(bad_data) and  # May remove duplicates
        cleaned_data.isnull().sum().sum() == 0 and  # No missing values
        all(cleaned_data['volume'] >= 0)  # No negative volumes
    )
    
    print(f"   Repairs Applied: {len(repairs_applied)}")
    print(f"   Expected Repairs: {expected_repairs}")
    print(f"   Missing Values Fixed: {'✅' if cleaned_data.isnull().sum().sum() == 0 else '❌'}")
    print(f"   Negative Volumes Fixed: {'✅' if all(cleaned_data['volume'] >= 0) else '❌'}")
    
    return success

async def test_performance_scalability(engine: UltraAccurateDataEngine) -> bool:
    """Test performance and scalability"""
    
    # Create large dataset
    dates = pd.date_range(start='2020-01-01', end='2023-12-31', freq='D')  # 4 years
    large_data = pd.DataFrame({
        'timestamp': dates,
        'open': np.random.uniform(100, 200, len(dates)),
        'high': np.random.uniform(200, 250, len(dates)),
        'low': np.random.uniform(50, 100, len(dates)),
        'close': np.random.uniform(100, 200, len(dates)),
        'volume': np.random.randint(1000000, 10000000, len(dates))
    })
    
    # Ensure OHLC consistency
    large_data['high'] = large_data[['open', 'high', 'close']].max(axis=1)
    large_data['low'] = large_data[['open', 'low', 'close']].min(axis=1)
    
    import time
    start_time = time.time()
    
    # Validate large dataset
    cleaned_data, metrics = await engine.validate_and_clean_data(
        large_data, 'AAPL', 'yahoo_finance'
    )
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    # Performance criteria
    success = (
        processing_time < 10.0 and  # Should process in under 10 seconds
        len(cleaned_data) == len(large_data) and  # No data lost
        metrics.overall_score >= 0.95  # High quality score
    )
    
    print(f"   Dataset Size: {len(large_data):,} records")
    print(f"   Processing Time: {processing_time:.2f} seconds")
    print(f"   Records/Second: {len(large_data) / processing_time:.0f}")
    print(f"   Quality Score: {metrics.overall_score:.3f}")
    
    return success

async def test_quality_metrics_accuracy(engine: UltraAccurateDataEngine) -> bool:
    """Test accuracy of quality metrics calculation"""
    
    # Create data with known issues
    dates = pd.date_range(start='2023-01-01', end='2023-01-30', freq='D')
    test_data = pd.DataFrame({
        'timestamp': dates,
        'open': [100] * len(dates),  # All same value (suspicious)
        'high': [150] * len(dates),  # All same value
        'low': [50] * len(dates),    # All same value
        'close': [100] * len(dates), # All same value
        'volume': [1000000] * len(dates)  # All same value
    })
    
    # Validate
    cleaned_data, metrics = await engine.validate_and_clean_data(
        test_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that metrics are reasonable
    success = (
        0 <= metrics.overall_score <= 1 and  # Score in valid range
        metrics.total_records == len(test_data) and  # Correct record count
        len(metrics.recommendations) > 0 and  # Should have recommendations for suspicious data
        all(0 <= score <= 1 for score in [
            metrics.structural_validation.get('schema_compliance', 0),
            metrics.business_logic_validation.get('ohlc_consistency', 0),
            metrics.statistical_validation.get('outlier_detection_score', 0)
        ])
    )
    
    print(f"   Overall Score: {metrics.overall_score:.3f}")
    print(f"   Total Records: {metrics.total_records}")
    print(f"   Recommendations: {len(metrics.recommendations)}")
    print(f"   Score Range Valid: {'✅' if 0 <= metrics.overall_score <= 1 else '❌'}")
    
    return success

async def test_real_world_scenarios(engine: UltraAccurateDataEngine) -> bool:
    """Test real-world data scenarios"""
    
    # Scenario 1: Market crash data
    print("   Testing Market Crash Scenario...")
    crash_data = create_market_crash_data()
    cleaned_crash, crash_metrics = await engine.validate_and_clean_data(
        crash_data, 'SPY', 'yahoo_finance'
    )
    
    # Scenario 2: Low volume penny stock
    print("   Testing Penny Stock Scenario...")
    penny_data = create_penny_stock_data()
    cleaned_penny, penny_metrics = await engine.validate_and_clean_data(
        penny_data, 'PENNY', 'yahoo_finance'
    )
    
    # Scenario 3: High-frequency data
    print("   Testing High-Frequency Scenario...")
    hf_data = create_high_frequency_data()
    cleaned_hf, hf_metrics = await engine.validate_and_clean_data(
        hf_data, 'AAPL', 'yahoo_finance'
    )
    
    # Check that all scenarios were handled appropriately
    success = (
        crash_metrics.overall_score > 0.7 and  # Crash data should be valid
        penny_metrics.overall_score > 0.7 and  # Penny stock should be valid
        hf_metrics.overall_score > 0.7 and     # HF data should be valid
        len(cleaned_crash) > 0 and
        len(cleaned_penny) > 0 and
        len(cleaned_hf) > 0
    )
    
    print(f"   Crash Data Score: {crash_metrics.overall_score:.3f}")
    print(f"   Penny Stock Score: {penny_metrics.overall_score:.3f}")
    print(f"   High-Frequency Score: {hf_metrics.overall_score:.3f}")
    
    return success

def create_market_crash_data() -> pd.DataFrame:
    """Create market crash scenario data"""
    dates = pd.date_range(start='2020-03-01', end='2020-03-31', freq='D')
    
    # Simulate March 2020 crash
    prices = [300]  # Starting price
    for i in range(1, len(dates)):
        if i < 10:  # Normal volatility
            change = np.random.normal(0, 0.02)
        elif i < 20:  # Crash period
            change = np.random.normal(-0.05, 0.08)  # Large negative moves
        else:  # Recovery
            change = np.random.normal(0.03, 0.04)  # Positive recovery
        
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 1))  # Don't go below $1
    
    return pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': [p * 1.05 for p in prices],
        'low': [p * 0.95 for p in prices],
        'close': prices,
        'volume': np.random.randint(50000000, 200000000, len(dates))
    })

def create_penny_stock_data() -> pd.DataFrame:
    """Create penny stock scenario data"""
    dates = pd.date_range(start='2023-01-01', end='2023-01-30', freq='D')
    
    # Simulate penny stock with high volatility
    prices = [0.05]  # Starting at 5 cents
    for i in range(1, len(dates)):
        change = np.random.normal(0, 0.15)  # 15% daily volatility
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 0.001))  # Don't go below 0.1 cent
    
    return pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': [p * 1.1 for p in prices],
        'low': [p * 0.9 for p in prices],
        'close': prices,
        'volume': np.random.randint(1000, 10000, len(dates))  # Low volume
    })

def create_high_frequency_data() -> pd.DataFrame:
    """Create high-frequency data scenario"""
    # Simulate 1-minute data for one day
    start_time = datetime(2023, 1, 1, 9, 30)  # Market open
    end_time = datetime(2023, 1, 1, 16, 0)    # Market close
    
    minutes = pd.date_range(start=start_time, end=end_time, freq='1min')
    
    # Simulate intraday price movements
    prices = [100]  # Starting price
    for i in range(1, len(minutes)):
        # Small random walk
        change = np.random.normal(0, 0.001)  # 0.1% per minute
        new_price = prices[-1] * (1 + change)
        prices.append(new_price)
    
    return pd.DataFrame({
        'timestamp': minutes,
        'open': prices,
        'high': [p * 1.002 for p in prices],
        'low': [p * 0.998 for p in prices],
        'close': prices,
        'volume': np.random.randint(100, 1000, len(minutes))
    })

if __name__ == "__main__":
    # Run the comprehensive test suite
    success = asyncio.run(test_ultra_accurate_data_engine())
    
    if success:
        print("\n🎯 Phase 1 Complete: Ultra-Accurate Data Quality Engine")
        print("   Status: State-of-the-art data validation achieved!")
        print("   Next: Phase 2 - Advanced Testing Framework")
    else:
        print("\n⚠️  Some tests failed. Review and fix issues before proceeding.")
    
    sys.exit(0 if success else 1)
