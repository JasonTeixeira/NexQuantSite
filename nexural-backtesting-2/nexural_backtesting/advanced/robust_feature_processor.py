#!/usr/bin/env python3
"""
Robust Feature Processor
Handles various MBP data formats gracefully
"""

import pandas as pd
import polars as pl
import numpy as np
from typing import Dict, List, Optional, Any
import warnings
warnings.filterwarnings('ignore')

class RobustFeatureProcessor:
    """
    Robust feature processor that works with any MBP data format
    Automatically detects available columns and calculates appropriate features
    """
    
    def __init__(self):
        self.available_levels = []
        self.feature_cache = {}
        
    def detect_data_format(self, df: pl.DataFrame) -> Dict[str, Any]:
        """Detect the format and available levels in MBP data"""
        
        columns = df.columns
        
        # Find available bid/ask levels
        bid_levels = []
        ask_levels = []
        
        for col in columns:
            if col.startswith('bid_price_'):
                try:
                    level = int(col.split('_')[-1])
                    bid_levels.append(level)
                except ValueError:
                    pass
            elif col.startswith('ask_price_'):
                try:
                    level = int(col.split('_')[-1])
                    ask_levels.append(level)
                except ValueError:
                    pass
        
        # Find common levels between bid and ask
        common_levels = sorted(set(bid_levels) & set(ask_levels))
        
        # Check for size columns
        has_sizes = any(col.startswith('bid_size_') or col.startswith('ask_size_') for col in columns)
        
        format_info = {
            'available_levels': common_levels,
            'max_level': max(common_levels) if common_levels else 0,
            'has_sizes': has_sizes,
            'total_columns': len(columns)
        }
        
        print(f"Data format detected:")
        print(f"  Available levels: {common_levels}")
        print(f"  Max level: {format_info['max_level']}")
        print(f"  Has size data: {has_sizes}")
        
        return format_info
    
    def calculate_basic_features(self, df: pl.DataFrame, format_info: Dict[str, Any]) -> pl.DataFrame:
        """Calculate basic microstructure features"""
        
        levels = format_info['available_levels']
        if not levels:
            print("⚠️ No valid price levels found")
            return df
        
        print(f"Calculating basic features for {len(levels)} levels...")
        
        features = df
        
        # Level 1 features (always available if we have any levels)
        if 1 in levels:
            features = features.with_columns([
                # Mid price
                ((pl.col('ask_price_1') + pl.col('bid_price_1')) / 2).alias('mid_price'),
                
                # Spread
                (pl.col('ask_price_1') - pl.col('bid_price_1')).alias('spread'),
                
                # Spread in basis points
                ((pl.col('ask_price_1') - pl.col('bid_price_1')) / 
                 ((pl.col('ask_price_1') + pl.col('bid_price_1')) / 2) * 10000).alias('spread_bps')
            ])
            
            # Size-based features if available
            if format_info['has_sizes']:
                features = features.with_columns([
                    # Basic imbalance
                    ((pl.col('bid_size_1') - pl.col('ask_size_1')) / 
                     (pl.col('bid_size_1') + pl.col('ask_size_1'))).alias('imbalance_l1')
                ])
        
        return features
    
    def calculate_multi_level_features(self, df: pl.DataFrame, format_info: Dict[str, Any]) -> pl.DataFrame:
        """Calculate features using multiple levels"""
        
        levels = format_info['available_levels']
        max_levels = min(len(levels), 5)  # Use up to 5 levels
        
        if max_levels < 2:
            print("⚠️ Not enough levels for multi-level features")
            return df
        
        print(f"Calculating multi-level features using {max_levels} levels...")
        
        features = df
        
        # Book imbalance at different depths
        for depth in [2, 3, min(max_levels, 5)]:
            if depth <= max_levels and format_info['has_sizes']:
                
                bid_cols = [f'bid_size_{i}' for i in range(1, depth + 1)]
                ask_cols = [f'ask_size_{i}' for i in range(1, depth + 1)]
                
                # Check if all columns exist
                available_bid = [col for col in bid_cols if col in df.columns]
                available_ask = [col for col in ask_cols if col in df.columns]
                
                if len(available_bid) == len(available_ask) == depth:
                    features = features.with_columns([
                        ((pl.sum_horizontal(available_bid) - pl.sum_horizontal(available_ask)) /
                         (pl.sum_horizontal(available_bid) + pl.sum_horizontal(available_ask))).alias(f'imbalance_l{depth}')
                    ])
        
        # VWAP calculation if we have enough levels
        if max_levels >= 3 and format_info['has_sizes']:
            
            vwap_levels = min(max_levels, 5)
            bid_vwap_terms = []
            ask_vwap_terms = []
            bid_sizes = []
            ask_sizes = []
            
            for i in range(1, vwap_levels + 1):
                if f'bid_price_{i}' in df.columns and f'bid_size_{i}' in df.columns:
                    bid_vwap_terms.append(pl.col(f'bid_price_{i}') * pl.col(f'bid_size_{i}'))
                    bid_sizes.append(f'bid_size_{i}')
                    
                if f'ask_price_{i}' in df.columns and f'ask_size_{i}' in df.columns:
                    ask_vwap_terms.append(pl.col(f'ask_price_{i}') * pl.col(f'ask_size_{i}'))
                    ask_sizes.append(f'ask_size_{i}')
            
            if bid_vwap_terms and ask_vwap_terms:
                features = features.with_columns([
                    (pl.sum_horizontal(bid_vwap_terms) / pl.sum_horizontal(bid_sizes)).alias('bid_vwap'),
                    (pl.sum_horizontal(ask_vwap_terms) / pl.sum_horizontal(ask_sizes)).alias('ask_vwap')
                ])
        
        return features
    
    def calculate_advanced_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Calculate advanced microstructure features with robust error handling"""
        
        print("🧠 Calculating robust advanced features...")
        
        # Detect data format
        format_info = self.detect_data_format(df)
        
        if not format_info['available_levels']:
            print("❌ No valid MBP levels detected")
            return df
        
        # Start with basic features
        features = self.calculate_basic_features(df, format_info)
        
        # Add multi-level features
        features = self.calculate_multi_level_features(features, format_info)
        
        # Add time-based features if we have mid_price
        if 'mid_price' in features.columns:
            features = features.with_columns([
                # Returns
                pl.col('mid_price').pct_change().alias('returns'),
                
                # Rolling statistics
                pl.col('mid_price').rolling_mean(window_size=20).alias('mid_price_ma20'),
                pl.col('spread_bps').rolling_mean(window_size=20).alias('spread_ma20')
            ])
            
            # Volatility features
            features = features.with_columns([
                pl.col('returns').rolling_std(window_size=20).alias('volatility_20'),
                pl.col('returns').rolling_std(window_size=100).alias('volatility_100')
            ])
            
            # Z-scores for key features
            if 'imbalance_l1' in features.columns:
                features = features.with_columns([
                    ((pl.col('imbalance_l1') - pl.col('imbalance_l1').rolling_mean(window_size=100)) /
                     pl.col('imbalance_l1').rolling_std(window_size=100)).alias('imbalance_zscore')
                ])
        
        original_cols = len(df.columns)
        final_cols = len(features.columns)
        features_added = final_cols - original_cols
        
        print(f"✅ Robust feature calculation complete!")
        print(f"   Original columns: {original_cols}")
        print(f"   Final columns: {final_cols}")
        print(f"   Features added: {features_added}")
        
        return features
    
    def generate_signals(self, df: pl.DataFrame) -> pl.DataFrame:
        """Generate trading signals from features"""
        
        if 'imbalance_zscore' not in df.columns:
            print("⚠️ No imbalance z-score available for signal generation")
            # Simple spread-based signals
            if 'spread_bps' in df.columns:
                signals = df.with_columns([
                    pl.when(pl.col('spread_bps') < pl.col('spread_ma20'))
                    .then(1)
                    .when(pl.col('spread_bps') > pl.col('spread_ma20') * 1.5)
                    .then(-1)
                    .otherwise(0)
                    .alias('signal')
                ])
            else:
                # No signals possible
                signals = df.with_columns([
                    pl.lit(0).alias('signal')
                ])
        else:
            # Imbalance-based signals
            signals = df.with_columns([
                pl.when(pl.col('imbalance_zscore') > 1.5)
                .then(1)
                .when(pl.col('imbalance_zscore') < -1.5)
                .then(-1)
                .otherwise(0)
                .alias('signal')
            ])
        
        return signals

def test_robust_processor():
    """Test the robust feature processor"""
    
    print("\n🧪 Testing Robust Feature Processor")
    print("-" * 40)
    
    # Test with different data formats
    test_cases = [
        {"name": "3-Level MBP", "levels": 3},
        {"name": "5-Level MBP", "levels": 5}, 
        {"name": "10-Level MBP", "levels": 10}
    ]
    
    processor = RobustFeatureProcessor()
    
    for test_case in test_cases:
        print(f"\nTesting {test_case['name']}...")
        
        # Create test data
        n_rows = 500
        dates = pd.date_range('2024-01-01', periods=n_rows, freq='1min')
        
        data_dict = {'timestamp': dates}
        
        base_price = 100.0
        for level in range(1, test_case['levels'] + 1):
            bid_price = base_price - (level * 0.01) + np.random.normal(0, 0.001, n_rows)
            ask_price = base_price + (level * 0.01) + np.random.normal(0, 0.001, n_rows)
            bid_size = np.random.exponential(100, n_rows)
            ask_size = np.random.exponential(100, n_rows)
            
            data_dict[f'bid_price_{level}'] = bid_price
            data_dict[f'ask_price_{level}'] = ask_price
            data_dict[f'bid_size_{level}'] = bid_size
            data_dict[f'ask_size_{level}'] = ask_size
        
        df = pl.from_pandas(pd.DataFrame(data_dict))
        
        # Process features
        enhanced = processor.calculate_advanced_features(df)
        
        # Generate signals
        signals = processor.generate_signals(enhanced)
        
        features_added = enhanced.shape[1] - df.shape[1]
        
        print(f"  ✅ {test_case['name']}: {features_added} features added")
        
        if 'signal' in signals.columns:
            signal_dist = signals.select('signal').to_pandas()['signal'].value_counts()
            print(f"  📊 Signals: {signal_dist.to_dict()}")
        
    print("\n✅ Robust processor working across all test cases!")
    return True

if __name__ == "__main__":
    test_robust_processor()
