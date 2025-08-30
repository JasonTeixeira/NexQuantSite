"""
Unit tests for data validation module
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from core.validation import DataValidator, ValidationResult


class TestDataValidator:
    """Test DataValidator functionality"""
    
    def test_initialization(self):
        """Test DataValidator initialization"""
        validator = DataValidator(strict_mode=False)
        assert not validator.strict_mode
        assert 'price_data' in validator.validation_rules
        assert 'orderbook_data' in validator.validation_rules
        
        strict_validator = DataValidator(strict_mode=True)
        assert strict_validator.strict_mode
    
    def test_validate_price_data_valid(self, sample_price_data):
        """Test validation of valid price data"""
        validator = DataValidator()
        
        result = validator.validate_price_data(sample_price_data, 'ES')
        
        assert isinstance(result, ValidationResult)
        assert result.is_valid
        assert len(result.errors) == 0
        assert 'quality_score' in result.metrics
        assert result.metrics['quality_score'] > 8.0  # High quality score
    
    def test_validate_price_data_empty_dataframe(self):
        """Test validation of empty DataFrame"""
        validator = DataValidator()
        empty_df = pd.DataFrame()
        
        result = validator.validate_price_data(empty_df, 'ES')
        
        assert not result.is_valid
        assert 'DataFrame is empty' in result.errors
    
    def test_validate_price_data_missing_columns(self, sample_price_data):
        """Test validation with missing required columns"""
        validator = DataValidator()
        
        # Remove required column
        incomplete_data = sample_price_data.drop(columns=['close'])
        
        result = validator.validate_price_data(incomplete_data, 'ES')
        
        assert not result.is_valid
        assert any('Missing required columns' in error for error in result.errors)
    
    def test_validate_price_data_negative_prices(self, sample_price_data):
        """Test validation with negative prices"""
        validator = DataValidator()
        
        # Introduce negative prices
        bad_data = sample_price_data.copy()
        bad_data.loc[0:10, 'close'] = -100
        
        result = validator.validate_price_data(bad_data, 'ES')
        
        assert not result.is_valid
        assert any('negative or zero prices' in error for error in result.errors)
    
    def test_validate_price_data_extreme_prices(self, sample_price_data):
        """Test validation with extreme price values"""
        validator = DataValidator()
        
        # Introduce extreme prices
        bad_data = sample_price_data.copy()
        bad_data.loc[0:5, 'high'] = 1000000  # Unrealistically high
        
        result = validator.validate_price_data(bad_data, 'ES')
        
        assert not result.is_valid
        assert any('prices outside valid range' in error for error in result.errors)
    
    def test_validate_price_data_ohlc_inconsistency(self, sample_price_data):
        """Test validation of OHLC consistency"""
        validator = DataValidator()
        
        # Create OHLC inconsistency (high < low)
        bad_data = sample_price_data.copy()
        bad_data.loc[0:5, 'high'] = bad_data.loc[0:5, 'low'] - 1
        
        result = validator.validate_price_data(bad_data, 'ES')
        
        assert not result.is_valid
        assert any('OHLC consistency' in error for error in result.errors)
    
    def test_validate_price_data_with_nulls(self, sample_price_data):
        """Test validation with null values"""
        validator = DataValidator()
        
        # Introduce null values
        data_with_nulls = sample_price_data.copy()
        data_with_nulls.loc[0:50, 'close'] = np.nan  # 5% nulls
        
        result = validator.validate_price_data(data_with_nulls, 'ES')
        
        # Should still be valid but with warnings
        assert result.is_valid
        assert len(result.warnings) > 0
        assert any('null values' in warning for warning in result.warnings)
    
    def test_validate_price_data_excessive_nulls(self, sample_price_data):
        """Test validation with excessive null values"""
        validator = DataValidator()
        
        # Introduce excessive null values (>5%)
        data_with_nulls = sample_price_data.copy()
        data_with_nulls.loc[0:100, 'close'] = np.nan  # 10% nulls
        
        result = validator.validate_price_data(data_with_nulls, 'ES')
        
        assert not result.is_valid
        assert any('null values' in error for error in result.errors)
    
    def test_validate_orderbook_data_valid(self, sample_orderbook_data):
        """Test validation of valid order book data"""
        validator = DataValidator()
        
        result = validator.validate_orderbook_data(sample_orderbook_data, 'ES')
        
        assert isinstance(result, ValidationResult)
        assert result.is_valid
        assert len(result.errors) == 0
        assert 'quality_score' in result.metrics
    
    def test_validate_orderbook_data_crossed_book(self, sample_orderbook_data):
        """Test validation with crossed book (negative spreads)"""
        validator = DataValidator()
        
        # Create crossed book
        bad_data = sample_orderbook_data.copy()
        bad_data.loc[0:10, 'ask_price_0'] = bad_data.loc[0:10, 'bid_price_0'] - 1
        
        result = validator.validate_orderbook_data(bad_data, 'ES')
        
        assert not result.is_valid
        assert any('negative spreads' in error for error in result.errors)
    
    def test_validate_orderbook_data_excessive_spreads(self, sample_orderbook_data):
        """Test validation with excessive spreads"""
        validator = DataValidator()
        
        # Create excessive spreads
        bad_data = sample_orderbook_data.copy()
        bad_data.loc[0:10, 'ask_price_0'] = bad_data.loc[0:10, 'bid_price_0'] * 1.1  # 10% spread
        
        result = validator.validate_orderbook_data(bad_data, 'ES')
        
        # Should be valid but with warnings
        assert result.is_valid
        assert len(result.warnings) > 0
        assert any('spreads >' in warning for warning in result.warnings)
    
    def test_validate_time_series_unordered(self, sample_price_data):
        """Test validation with unordered timestamps"""
        validator = DataValidator()
        
        # Shuffle timestamps to break chronological order
        bad_data = sample_price_data.copy()
        bad_data = bad_data.sample(frac=1).reset_index(drop=True)
        
        result = validator.validate_price_data(bad_data, 'ES')
        
        assert not result.is_valid
        assert any('not in chronological order' in error for error in result.errors)
    
    def test_validate_time_series_large_gaps(self, sample_price_data):
        """Test validation with large time gaps"""
        validator = DataValidator()
        
        # Create large time gap
        bad_data = sample_price_data.copy()
        bad_data.loc[100:200, 'timestamp'] = bad_data.loc[100:200, 'timestamp'] + timedelta(hours=5)
        bad_data = bad_data.sort_values('timestamp').reset_index(drop=True)
        
        result = validator.validate_price_data(bad_data, 'ES')
        
        # Should be valid but with warnings about gaps
        assert result.is_valid
        assert len(result.warnings) > 0
        assert any('Maximum time gap' in warning for warning in result.warnings)
    
    def test_calculate_quality_score(self):
        """Test quality score calculation"""
        validator = DataValidator()
        
        # Test with no errors or warnings
        df = pd.DataFrame({'col1': [1, 2, 3], 'col2': [4, 5, 6]})
        score = validator._calculate_quality_score(df, [], [])
        assert score == 10.0
        
        # Test with errors
        score_with_errors = validator._calculate_quality_score(df, ['error1', 'error2'], [])
        assert score_with_errors == 6.0  # 10 - 2*2
        
        # Test with warnings
        score_with_warnings = validator._calculate_quality_score(df, [], ['warning1', 'warning2'])
        assert score_with_warnings == 9.0  # 10 - 2*0.5
        
        # Test with nulls
        df_with_nulls = pd.DataFrame({'col1': [1, np.nan, 3], 'col2': [4, 5, 6]})
        score_with_nulls = validator._calculate_quality_score(df_with_nulls, [], [])
        assert score_with_nulls < 10.0
    
    def test_auto_clean_data(self, sample_price_data):
        """Test automatic data cleaning"""
        validator = DataValidator()
        
        # Create data with issues
        dirty_data = sample_price_data.copy()
        
        # Add duplicate timestamps
        dirty_data = pd.concat([dirty_data, dirty_data.iloc[:5]], ignore_index=True)
        
        # Add null values
        dirty_data.loc[10:15, 'close'] = np.nan
        
        # Shuffle data
        dirty_data = dirty_data.sample(frac=1).reset_index(drop=True)
        
        # Validate to get issues
        validation_result = validator.validate_price_data(dirty_data, 'ES')
        
        # Clean the data
        cleaned_data = validator.auto_clean_data(dirty_data, validation_result)
        
        # Check improvements
        assert len(cleaned_data) <= len(dirty_data)  # Duplicates removed
        assert cleaned_data['timestamp'].is_monotonic_increasing  # Sorted
        assert cleaned_data['close'].isnull().sum() < dirty_data['close'].isnull().sum()  # Nulls filled
    
    def test_strict_mode_warnings_as_errors(self, sample_price_data):
        """Test strict mode treating warnings as errors"""
        strict_validator = DataValidator(strict_mode=True)
        
        # Create data that would normally generate warnings
        data_with_warnings = sample_price_data.copy()
        data_with_warnings.loc[0:20, 'volume'] = 0  # Zero volume (warning)
        
        result = strict_validator.validate_price_data(data_with_warnings, 'ES')
        
        # In strict mode, warnings should prevent validation from passing
        if result.warnings:
            assert not result.is_valid
    
    def test_validation_metrics_calculation(self, sample_price_data):
        """Test that validation metrics are properly calculated"""
        validator = DataValidator()
        
        result = validator.validate_price_data(sample_price_data, 'ES')
        
        # Check that metrics are calculated
        assert 'quality_score' in result.metrics
        assert 'start_date' in result.metrics
        assert 'end_date' in result.metrics
        assert 'total_records' in result.metrics
        
        # Check price metrics
        price_metrics = [key for key in result.metrics.keys() if '_mean' in key or '_std' in key]
        assert len(price_metrics) > 0
        
        # Verify metric values are reasonable
        assert isinstance(result.metrics['quality_score'], float)
        assert 0 <= result.metrics['quality_score'] <= 10
        assert result.metrics['total_records'] == len(sample_price_data)


class TestValidationIntegration:
    """Integration tests for validation components"""
    
    def test_end_to_end_validation_workflow(self, sample_price_data, sample_orderbook_data):
        """Test complete validation workflow"""
        validator = DataValidator()
        
        # Validate price data
        price_result = validator.validate_price_data(sample_price_data, 'ES')
        assert price_result.is_valid
        
        # Validate order book data
        book_result = validator.validate_orderbook_data(sample_orderbook_data, 'ES')
        assert book_result.is_valid
        
        # Both should have high quality scores
        assert price_result.metrics['quality_score'] > 8.0
        assert book_result.metrics['quality_score'] > 8.0
    
    def test_validation_with_real_world_issues(self, sample_price_data):
        """Test validation with realistic data quality issues"""
        validator = DataValidator()
        
        # Simulate real-world data issues
        problematic_data = sample_price_data.copy()
        
        # Missing data points
        problematic_data = problematic_data.drop(problematic_data.index[100:110])
        
        # Outlier prices
        problematic_data.loc[200, 'high'] = problematic_data.loc[200, 'close'] * 2
        
        # Zero volume
        problematic_data.loc[300:310, 'volume'] = 0
        
        # Validate
        result = validator.validate_price_data(problematic_data, 'ES')
        
        # Should still be mostly valid but with warnings
        assert result.is_valid or len(result.errors) <= 2  # Allow some errors
        assert len(result.warnings) > 0
        
        # Quality score should be lower but not terrible
        assert 5.0 <= result.metrics['quality_score'] <= 9.0