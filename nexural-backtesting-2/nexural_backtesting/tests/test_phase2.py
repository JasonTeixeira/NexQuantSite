"""
Phase 2 Test Script - Advanced Data Processing
Tests all Phase 2 components to ensure they're working correctly
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

# Import Phase 2 components
from core.config_manager import EnhancedConfigManager
from data_connectors.base_connector import AssetClass, DataType, DataRequest
from data_connectors.databento_connector import DatabentoConnector
from data_processing.multi_asset_processor import MultiAssetProcessor, CorporateAction, CorporateActionType
from data_processing.market_microstructure import MarketMicrostructureAnalyzer, OrderBookSnapshot, Trade, TradeClassification
from data_processing.data_quality_engine import DataQualityEngine, DataQualityReport

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_multi_asset_processor():
    """Test multi-asset data processor"""
    print("\n" + "="*60)
    print("TESTING MULTI-ASSET PROCESSOR")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        processor_config = config_manager.get_section('data').get('processing', {})
        
        # Initialize processor
        processor = MultiAssetProcessor(processor_config)
        print("✅ Multi-asset processor initialized")
        
        # Test asset configurations
        equity_config = processor.get_asset_config(AssetClass.EQUITY)
        future_config = processor.get_asset_config(AssetClass.FUTURE)
        crypto_config = processor.get_asset_config(AssetClass.CRYPTO)
        
        print(f"✅ Asset configurations loaded:")
        print(f"   - Equity: {len(equity_config)} settings")
        print(f"   - Future: {len(future_config)} settings")
        print(f"   - Crypto: {len(crypto_config)} settings")
        
        # Test corporate actions
        test_action = CorporateAction(
            action_type=CorporateActionType.SPLIT,
            effective_date=datetime.now() - timedelta(days=30),
            record_date=datetime.now() - timedelta(days=32),
            ex_date=datetime.now() - timedelta(days=31),
            description="2:1 Stock Split",
            ratio=2.0
        )
        
        processor.add_corporate_action("AAPL", test_action)
        actions = processor.get_corporate_actions("AAPL")
        print(f"✅ Corporate actions: {len(actions)} actions added")
        
        # Test data processing for different asset classes
        test_cases = [
            ('AAPL', AssetClass.EQUITY, DataType.OHLCV),
            ('ES', AssetClass.FUTURE, DataType.TICK),
            ('BTC', AssetClass.CRYPTO, DataType.OHLCV),
        ]
        
        for symbol, asset_class, data_type in test_cases:
            # Generate test data
            test_data = generate_test_data(symbol, asset_class, data_type)
            
            # Process data
            processed_data = processor.process_market_data(test_data, symbol, asset_class, data_type)
            
            print(f"✅ {symbol} ({asset_class.value}): {len(processed_data)} records processed")
            print(f"   - Original columns: {list(test_data.columns)}")
            print(f"   - Processed columns: {list(processed_data.columns)}")
            
            # Check for asset-specific features
            if asset_class == AssetClass.EQUITY:
                if 'vwap' in processed_data.columns:
                    print(f"   - VWAP calculated: {processed_data['vwap'].mean():.2f}")
                if 'atr' in processed_data.columns:
                    print(f"   - ATR calculated: {processed_data['atr'].mean():.2f}")
            
            elif asset_class == AssetClass.FUTURE:
                if 'notional_value' in processed_data.columns:
                    print(f"   - Notional value calculated: {processed_data['notional_value'].mean():.2f}")
            
            elif asset_class == AssetClass.CRYPTO:
                if 'market_cap' in processed_data.columns:
                    print(f"   - Market cap calculated: {processed_data['market_cap'].mean():.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Multi-asset processor test failed: {e}")
        return False

def test_market_microstructure():
    """Test market microstructure analyzer"""
    print("\n" + "="*60)
    print("TESTING MARKET MICROSTRUCTURE ANALYZER")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        microstructure_config = {
            'max_order_book_levels': 5,
            'trade_classification_method': 'lee_ready',
            'market_impact_model': 'square_root'
        }
        
        # Initialize analyzer
        analyzer = MarketMicrostructureAnalyzer(microstructure_config)
        print("✅ Market microstructure analyzer initialized")
        
        # Generate test order book data
        order_book_data = generate_test_order_book_data("AAPL")
        print(f"✅ Order book data generated: {len(order_book_data)} records")
        
        # Reconstruct order book
        snapshots = analyzer.reconstruct_order_book(order_book_data, "AAPL")
        print(f"✅ Order book reconstructed: {len(snapshots)} snapshots")
        
        if snapshots:
            latest_snapshot = snapshots[-1]
            print(f"   - Latest snapshot: {latest_snapshot.timestamp}")
            print(f"   - Mid price: ${latest_snapshot.mid_price:.2f}")
            print(f"   - Spread: ${latest_snapshot.spread:.4f} ({latest_snapshot.spread_bps:.1f} bps)")
            print(f"   - Book imbalance: {latest_snapshot.book_imbalance:.3f}")
            print(f"   - Bid levels: {len(latest_snapshot.bid_levels)}")
            print(f"   - Ask levels: {len(latest_snapshot.ask_levels)}")
        
        # Generate test trade data
        trade_data = generate_test_trade_data("AAPL")
        print(f"✅ Trade data generated: {len(trade_data)} records")
        
        # Classify trades
        trades = analyzer.classify_trades(trade_data, order_book_data)
        print(f"✅ Trades classified: {len(trades)} trades")
        
        if trades:
            buy_trades = [t for t in trades if t.side == TradeClassification.BUY_INITIATED]
            sell_trades = [t for t in trades if t.side == TradeClassification.SELL_INITIATED]
            print(f"   - Buy initiated: {len(buy_trades)} ({len(buy_trades)/len(trades):.1%})")
            print(f"   - Sell initiated: {len(sell_trades)} ({len(sell_trades)/len(trades):.1%})")
        
        # Calculate market impact
        if snapshots and trades:
            test_trade_size = 1000
            impact = analyzer.calculate_market_impact(test_trade_size, snapshots[-1])
            print(f"✅ Market impact calculated for {test_trade_size} shares:")
            print(f"   - Total impact: ${impact['total_impact']:.4f}")
            print(f"   - Permanent impact: ${impact['permanent_impact']:.4f}")
            print(f"   - Temporary impact: ${impact['temporary_impact']:.4f}")
            print(f"   - Impact in bps: {impact.get('impact_bps', 0):.2f}")
        
        # Calculate microstructure metrics
        metrics = analyzer.calculate_microstructure_metrics(snapshots, trades)
        print(f"✅ Microstructure metrics calculated: {len(metrics)} metrics")
        
        if metrics:
            print(f"   - Avg spread: {metrics.get('avg_spread_bps', 0):.1f} bps")
            print(f"   - Book imbalance: {metrics.get('avg_book_imbalance', 0):.3f}")
            print(f"   - Kyle's lambda: {metrics.get('kyles_lambda', 0):.6f}")
            print(f"   - VPIN: {metrics.get('vpin', 0):.3f}")
        
        # Get summary
        summary = analyzer.get_microstructure_summary("AAPL")
        print(f"✅ Microstructure summary generated: {len(summary)} fields")
        
        return True
        
    except Exception as e:
        print(f"❌ Market microstructure test failed: {e}")
        return False

def test_data_quality_engine():
    """Test data quality engine"""
    print("\n" + "="*60)
    print("TESTING DATA QUALITY ENGINE")
    print("="*60)
    
    try:
        # Initialize config
        config_manager = EnhancedConfigManager("config/config.yaml")
        quality_config = {
            'outlier_method': 'combined',
            'interpolation_method': 'linear',
            'zscore_threshold': 3.0,
            'iqr_multiplier': 1.5,
            'hampel_window': 5,
            'min_quality_score': 0.8
        }
        
        # Initialize quality engine
        quality_engine = DataQualityEngine(quality_config)
        print("✅ Data quality engine initialized")
        
        # Generate test data with quality issues
        test_data = generate_test_data_with_issues("AAPL", AssetClass.EQUITY, DataType.OHLCV)
        print(f"✅ Test data with issues generated: {len(test_data)} records")
        
        # Validate and clean data
        cleaned_data, quality_report = quality_engine.validate_and_clean_data(
            test_data, "AAPL", AssetClass.EQUITY, DataType.OHLCV
        )
        
        print(f"✅ Data validation completed:")
        print(f"   - Original records: {quality_report.total_records}")
        print(f"   - Missing records: {quality_report.missing_records}")
        print(f"   - Outlier records: {quality_report.outlier_records}")
        print(f"   - Invalid records: {quality_report.invalid_records}")
        print(f"   - Quality score: {quality_report.quality_score:.3f}")
        print(f"   - Completeness: {quality_report.completeness_score:.3f}")
        print(f"   - Accuracy: {quality_report.accuracy_score:.3f}")
        print(f"   - Consistency: {quality_report.consistency_score:.3f}")
        print(f"   - Timeliness: {quality_report.timeliness_score:.3f}")
        
        if quality_report.issues:
            print(f"   - Issues found: {len(quality_report.issues)}")
            for issue in quality_report.issues[:3]:  # Show first 3 issues
                print(f"     * {issue}")
        
        if quality_report.recommendations:
            print(f"   - Recommendations: {len(quality_report.recommendations)}")
            for rec in quality_report.recommendations[:3]:  # Show first 3 recommendations
                print(f"     * {rec}")
        
        # Test multiple symbols
        test_symbols = ['AAPL', 'GOOGL', 'MSFT']
        for symbol in test_symbols:
            test_data = generate_test_data_with_issues(symbol, AssetClass.EQUITY, DataType.OHLCV)
            cleaned_data, report = quality_engine.validate_and_clean_data(
                test_data, symbol, AssetClass.EQUITY, DataType.OHLCV
            )
            print(f"✅ {symbol}: Quality score = {report.quality_score:.3f}")
        
        # Export quality summary
        summary_df = quality_engine.export_quality_summary()
        print(f"✅ Quality summary exported: {len(summary_df)} symbols")
        
        if not summary_df.empty:
            print(f"   - Average quality score: {summary_df['quality_score'].mean():.3f}")
            print(f"   - Best quality: {summary_df.loc[summary_df['quality_score'].idxmax(), 'symbol']}")
            print(f"   - Worst quality: {summary_df.loc[summary_df['quality_score'].idxmin(), 'symbol']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Data quality engine test failed: {e}")
        return False

def test_integration():
    """Test integration of all Phase 2 components"""
    print("\n" + "="*60)
    print("TESTING PHASE 2 INTEGRATION")
    print("="*60)
    
    try:
        # Initialize all components
        config_manager = EnhancedConfigManager("config/config.yaml")
        
        # Initialize processors
        processor_config = config_manager.get_section('data').get('processing', {})
        processor = MultiAssetProcessor(processor_config)
        
        microstructure_config = {
            'max_order_book_levels': 5,
            'trade_classification_method': 'lee_ready',
            'market_impact_model': 'square_root'
        }
        analyzer = MarketMicrostructureAnalyzer(microstructure_config)
        
        quality_config = {
            'outlier_method': 'combined',
            'interpolation_method': 'linear',
            'min_quality_score': 0.8
        }
        quality_engine = DataQualityEngine(quality_config)
        
        print("✅ All Phase 2 components initialized")
        
        # Test end-to-end processing
        symbol = "AAPL"
        asset_class = AssetClass.EQUITY
        data_type = DataType.OHLCV
        
        # Step 1: Generate raw data
        raw_data = generate_test_data_with_issues(symbol, asset_class, data_type)
        print(f"✅ Step 1: Raw data generated ({len(raw_data)} records)")
        
        # Step 2: Quality validation and cleaning
        cleaned_data, quality_report = quality_engine.validate_and_clean_data(
            raw_data, symbol, asset_class, data_type
        )
        print(f"✅ Step 2: Data quality validation completed (Score: {quality_report.quality_score:.3f})")
        
        # Step 3: Multi-asset processing
        processed_data = processor.process_market_data(cleaned_data, symbol, asset_class, data_type)
        print(f"✅ Step 3: Multi-asset processing completed ({len(processed_data.columns)} columns)")
        
        # Step 4: Market microstructure analysis
        order_book_data = generate_test_order_book_data(symbol)
        trade_data = generate_test_trade_data(symbol)
        
        snapshots = analyzer.reconstruct_order_book(order_book_data, symbol)
        trades = analyzer.classify_trades(trade_data, order_book_data)
        metrics = analyzer.calculate_microstructure_metrics(snapshots, trades)
        
        print(f"✅ Step 4: Market microstructure analysis completed ({len(metrics)} metrics)")
        
        # Verify data flow
        print(f"✅ Integration test completed successfully:")
        print(f"   - Raw data: {len(raw_data)} records")
        print(f"   - Cleaned data: {len(cleaned_data)} records")
        print(f"   - Processed data: {len(processed_data)} records")
        print(f"   - Order book snapshots: {len(snapshots)}")
        print(f"   - Classified trades: {len(trades)}")
        print(f"   - Quality score: {quality_report.quality_score:.3f}")
        print(f"   - Microstructure metrics: {len(metrics)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def generate_test_data(symbol: str, asset_class: AssetClass, data_type: DataType) -> pd.DataFrame:
    """Generate test market data"""
    try:
        # Generate timestamps
        start_date = datetime.now() - timedelta(days=30)
        timestamps = pd.date_range(start=start_date, periods=1000, freq='1min')
        
        # Generate price data
        np.random.seed(42)
        base_price = 150.0 if asset_class == AssetClass.EQUITY else 4000.0 if asset_class == AssetClass.FUTURE else 50000.0
        
        returns = np.random.normal(0, 0.001, len(timestamps))
        prices = base_price * np.exp(np.cumsum(returns))
        
        # Generate OHLCV data
        data = pd.DataFrame({
            'timestamp': timestamps,
            'open': prices * (1 + np.random.normal(0, 0.0005, len(timestamps))),
            'high': prices * (1 + np.abs(np.random.normal(0, 0.001, len(timestamps)))),
            'low': prices * (1 - np.abs(np.random.normal(0, 0.001, len(timestamps)))),
            'close': prices,
            'volume': np.random.lognormal(10, 1, len(timestamps))
        })
        
        # Ensure OHLC relationships
        data['high'] = np.maximum(data['high'], data[['open', 'close']].max(axis=1))
        data['low'] = np.minimum(data['low'], data[['open', 'close']].min(axis=1))
        
        return data
        
    except Exception as e:
        logger.error(f"Failed to generate test data: {e}")
        return pd.DataFrame()

def generate_test_data_with_issues(symbol: str, asset_class: AssetClass, data_type: DataType) -> pd.DataFrame:
    """Generate test data with quality issues"""
    try:
        # Generate base data
        data = generate_test_data(symbol, asset_class, data_type)
        
        if data.empty:
            return data
        
        # Add missing values
        missing_indices = np.random.choice(data.index, size=50, replace=False)
        data.loc[missing_indices, 'volume'] = np.nan
        
        # Add outliers
        outlier_indices = np.random.choice(data.index, size=20, replace=False)
        data.loc[outlier_indices, 'close'] = data.loc[outlier_indices, 'close'] * 2  # Double price
        
        # Add invalid data
        invalid_indices = np.random.choice(data.index, size=10, replace=False)
        data.loc[invalid_indices, 'high'] = data.loc[invalid_indices, 'low'] - 1  # High < Low
        
        # Add negative values
        negative_indices = np.random.choice(data.index, size=5, replace=False)
        data.loc[negative_indices, 'volume'] = -1000
        
        return data
        
    except Exception as e:
        logger.error(f"Failed to generate test data with issues: {e}")
        return pd.DataFrame()

def generate_test_order_book_data(symbol: str) -> pd.DataFrame:
    """Generate test order book data"""
    try:
        # Generate timestamps
        start_date = datetime.now() - timedelta(hours=1)
        timestamps = pd.date_range(start=start_date, periods=100, freq='1min')
        
        data = []
        base_price = 150.0
        
        for i, timestamp in enumerate(timestamps):
            # Generate bid levels
            for level in range(5):
                bid_price = base_price - (level + 1) * 0.01
                bid_size = np.random.lognormal(3, 1)
                data.append({
                    'timestamp': timestamp,
                    f'bid_price_{level}': bid_price,
                    f'bid_size_{level}': bid_size
                })
            
            # Generate ask levels
            for level in range(5):
                ask_price = base_price + (level + 1) * 0.01
                ask_size = np.random.lognormal(3, 1)
                data.append({
                    'timestamp': timestamp,
                    f'ask_price_{level}': ask_price,
                    f'ask_size_{level}': ask_size
                })
            
            # Update base price
            base_price += np.random.normal(0, 0.001)
        
        return pd.DataFrame(data)
        
    except Exception as e:
        logger.error(f"Failed to generate order book data: {e}")
        return pd.DataFrame()

def generate_test_trade_data(symbol: str) -> pd.DataFrame:
    """Generate test trade data"""
    try:
        # Generate timestamps
        start_date = datetime.now() - timedelta(hours=1)
        timestamps = pd.date_range(start=start_date, periods=200, freq='30s')
        
        data = []
        base_price = 150.0
        
        for timestamp in timestamps:
            # Generate trade
            price = base_price + np.random.normal(0, 0.01)
            size = np.random.lognormal(4, 1)
            trade_id = f"T{len(data):06d}"
            
            data.append({
                'timestamp': timestamp,
                'price': price,
                'size': size,
                'trade_id': trade_id,
                'order_id': f"O{len(data):06d}",
                'aggressor': np.random.choice(['buy', 'sell'])
            })
            
            # Update base price
            base_price += np.random.normal(0, 0.001)
        
        return pd.DataFrame(data)
        
    except Exception as e:
        logger.error(f"Failed to generate trade data: {e}")
        return pd.DataFrame()

def main():
    """Run all Phase 2 tests"""
    print("🚀 PHASE 2 TESTING - ADVANCED DATA PROCESSING")
    print("="*80)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Multi-Asset Processor", test_multi_asset_processor),
        ("Market Microstructure", test_market_microstructure),
        ("Data Quality Engine", test_data_quality_engine),
        ("Phase 2 Integration", test_integration),
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
    print("PHASE 2 TEST SUMMARY")
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
        print("🎉 ALL PHASE 2 TESTS PASSED!")
        print("✅ Advanced Data Processing is ready for Phase 3")
    else:
        print("⚠️  Some tests failed. Please review and fix issues before proceeding.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
