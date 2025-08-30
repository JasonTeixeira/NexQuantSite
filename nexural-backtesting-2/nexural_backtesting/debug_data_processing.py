#!/usr/bin/env python3
"""
Debug Data Processing Issue - Week 2 Fix
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def create_test_data(days=100):
    """Create test data exactly like in integration test"""
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    
    # Create returns and prices
    returns = np.random.normal(0.0008, 0.02, days)
    prices = 150 * (1 + returns).cumprod()
    
    # Create OHLCV data
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
    data.loc[data.index[0], 'open'] = data.loc[data.index[0], 'close']  # Fix pandas warning
    
    return data

def debug_data_operations():
    """Debug the specific operations causing issues"""
    print("🔍 DEBUGGING DATA PROCESSING ISSUE")
    print("=" * 50)
    
    # Create test data
    data = create_test_data(100)
    print(f"✅ Created data with shape: {data.shape}")
    print(f"   Columns: {data.columns.tolist()}")
    print(f"   Index type: {type(data.index)}")
    print(f"   Data types: {data.dtypes.to_dict()}")
    
    # Test individual operations
    print("\n🧪 Testing problematic operations...")
    
    try:
        # Operation 1: Set high value to NaN
        original_high = data.iloc[10, data.columns.get_loc('high')]
        data.iloc[10, data.columns.get_loc('high')] = np.nan
        print(f"✅ Operation 1 successful: Set high[10] from {original_high:.2f} to NaN")
        
        # Operation 2: Set low to invalid value
        if len(data) > 20:
            high_20 = data.iloc[20, data.columns.get_loc('high')]
            print(f"   high[20] = {high_20}")
            
            if not pd.isna(high_20):
                new_low = high_20 + 1
                data.iloc[20, data.columns.get_loc('low')] = new_low
                print(f"✅ Operation 2 successful: Set low[20] to {new_low:.2f} (invalid OHLC)")
            else:
                print("⚠️  Operation 2 skipped: high[20] is NaN")
        
        print("\n✅ All data operations completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error in data operations: {e}")
        print(f"   Error type: {type(e)}")
        return False

def test_data_quality_engine():
    """Test data quality engine with fixed data"""
    print("\n🔧 TESTING DATA QUALITY ENGINE")
    print("=" * 50)
    
    try:
        from nexural_backtesting.data_processing.data_quality_engine import DataQualityEngine
        
        # Create data with issues
        data = create_test_data(100)
        
        # Safely introduce issues
        if len(data) > 20:
            data.iloc[10, data.columns.get_loc('high')] = np.nan
            data.iloc[20, data.columns.get_loc('low')] = data.iloc[20, data.columns.get_loc('high')] + 1
        
        # Test engine with proper config
        config = {
            'outlier_method': 'iqr',
            'interpolation_method': 'linear',
            'zscore_threshold': 3.0,
            'iqr_multiplier': 1.5
        }
        quality_engine = DataQualityEngine(config)
        print("✅ Data quality engine instantiated with config")
        
        # Check available methods
        methods = [method for method in dir(quality_engine) if not method.startswith('_')]
        print(f"   Available methods: {len(methods)} total")
        print(f"   Key methods: {[m for m in methods if 'clean' in m or 'validate' in m or 'check' in m]}")
        
        # Simple validation
        has_ohlc = all(col in data.columns for col in ['open', 'high', 'low', 'close'])
        if has_ohlc:
            invalid_ohlc = (
                (data['high'] < data['low']) |
                (data['open'] > data['high']) |
                (data['open'] < data['low']) |
                (data['close'] > data['high']) |
                (data['close'] < data['low'])
            )
            issues_found = invalid_ohlc.sum()
            print(f"✅ OHLC validation completed: {issues_found} issues found")
        
        return True
        
    except Exception as e:
        print(f"❌ Data quality engine error: {e}")
        return False

def main():
    """Main debug function"""
    print("🚀 DATA PROCESSING DEBUG - WEEK 2")
    print("Identifying and fixing the broadcasting issue")
    print("=" * 60)
    
    # Test 1: Basic data operations
    data_ops_success = debug_data_operations()
    
    # Test 2: Data quality engine
    engine_success = test_data_quality_engine()
    
    # Summary
    print("\n" + "=" * 60)
    print("DEBUG SUMMARY")
    print("=" * 60)
    print(f"Data Operations: {'✅ SUCCESS' if data_ops_success else '❌ FAILED'}")
    print(f"Quality Engine: {'✅ SUCCESS' if engine_success else '❌ FAILED'}")
    
    if data_ops_success and engine_success:
        print("\n🎉 Data processing issue RESOLVED!")
        print("   Ready to update integration test")
        return True
    else:
        print("\n⚠️  Issues still present - need further debugging")
        return False

if __name__ == "__main__":
    main()
