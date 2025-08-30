"""
Data Quality Engine for Enterprise Quantitative Backtesting Engine
Handles outlier detection, missing data interpolation, and data validation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, field
from enum import Enum
import warnings
from scipy import stats
from scipy.interpolate import interp1d
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
import talib

from ..data_connectors.base_connector import AssetClass, DataType

logger = logging.getLogger(__name__)

class OutlierMethod(Enum):
    """Outlier detection methods"""
    IQR = "iqr"
    ZSCORE = "zscore"
    HAMPEL = "hampel"
    ISOLATION_FOREST = "isolation_forest"
    LOCAL_OUTLIER_FACTOR = "local_outlier_factor"
    COMBINED = "combined"

class InterpolationMethod(Enum):
    """Interpolation methods"""
    FORWARD_FILL = "forward_fill"
    BACKWARD_FILL = "backward_fill"
    LINEAR = "linear"
    SPLINE = "spline"
    POLYNOMIAL = "polynomial"
    NEAREST = "nearest"
    TIME_WEIGHTED = "time_weighted"

@dataclass
class DataQualityReport:
    """Data quality report"""
    symbol: str
    asset_class: AssetClass
    data_type: DataType
    total_records: int
    missing_records: int
    outlier_records: int
    invalid_records: int
    quality_score: float
    completeness_score: float
    accuracy_score: float
    consistency_score: float
    timeliness_score: float
    issues: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    processing_timestamp: datetime = field(default_factory=datetime.now)

class DataQualityEngine:
    """
    Advanced data quality engine with comprehensive validation and cleaning
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize data quality engine
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.quality_reports = {}
        
        # Configuration parameters
        self.outlier_method = OutlierMethod(config.get('outlier_method', 'combined'))
        self.interpolation_method = InterpolationMethod(config.get('interpolation_method', 'linear'))
        self.zscore_threshold = config.get('zscore_threshold', 3.0)
        self.iqr_multiplier = config.get('iqr_multiplier', 1.5)
        self.hampel_window = config.get('hampel_window', 5)
        self.min_quality_score = config.get('min_quality_score', 0.8)
        
        logger.info("Data quality engine initialized")
    
    def validate_and_clean_data(self, data: pd.DataFrame, symbol: str, 
                              asset_class: AssetClass, data_type: DataType) -> Tuple[pd.DataFrame, DataQualityReport]:
        """
        Validate and clean market data
        
        Args:
            data: Raw market data
            symbol: Symbol
            asset_class: Asset class
            data_type: Data type
            
        Returns:
            Tuple of (cleaned_data, quality_report)
        """
        try:
            # Make a copy to avoid modifying original
            cleaned_data = data.copy()
            
            # Generate quality report
            quality_report = self._generate_quality_report(cleaned_data, symbol, asset_class, data_type)
            
            # Apply data cleaning based on quality issues
            if quality_report.quality_score < self.min_quality_score:
                cleaned_data = self._apply_data_cleaning(cleaned_data, quality_report)
                
                # Regenerate quality report after cleaning
                quality_report = self._generate_quality_report(cleaned_data, symbol, asset_class, data_type)
            
            # Store quality report
            self.quality_reports[symbol] = quality_report
            
            logger.info(f"Data quality validation completed for {symbol}: Score = {quality_report.quality_score:.2f}")
            return cleaned_data, quality_report
            
        except Exception as e:
            logger.error(f"Failed to validate and clean data for {symbol}: {e}")
            raise
    
    def _generate_quality_report(self, data: pd.DataFrame, symbol: str, 
                               asset_class: AssetClass, data_type: DataType) -> DataQualityReport:
        """Generate comprehensive data quality report"""
        try:
            total_records = len(data)
            issues = []
            recommendations = []
            
            # Check completeness
            missing_records, completeness_score = self._check_completeness(data)
            
            # Check accuracy
            invalid_records, accuracy_score = self._check_accuracy(data, asset_class)
            
            # Check consistency
            consistency_score = self._check_consistency(data)
            
            # Check timeliness
            timeliness_score = self._check_timeliness(data)
            
            # Detect outliers
            outlier_records = self._detect_outliers(data)
            
            # Calculate overall quality score
            quality_score = (completeness_score + accuracy_score + consistency_score + timeliness_score) / 4
            
            # Generate issues and recommendations
            if completeness_score < 0.9:
                issues.append(f"Low completeness: {completeness_score:.2f}")
                recommendations.append("Consider data source reliability")
            
            if accuracy_score < 0.9:
                issues.append(f"Low accuracy: {accuracy_score:.2f}")
                recommendations.append("Review data validation rules")
            
            if consistency_score < 0.9:
                issues.append(f"Low consistency: {consistency_score:.2f}")
                recommendations.append("Check for data source inconsistencies")
            
            if timeliness_score < 0.9:
                issues.append(f"Low timeliness: {timeliness_score:.2f}")
                recommendations.append("Verify data freshness")
            
            if outlier_records > total_records * 0.1:
                issues.append(f"High outlier rate: {outlier_records/total_records:.2%}")
                recommendations.append("Review outlier detection parameters")
            
            return DataQualityReport(
                symbol=symbol,
                asset_class=asset_class,
                data_type=data_type,
                total_records=total_records,
                missing_records=missing_records,
                outlier_records=outlier_records,
                invalid_records=invalid_records,
                quality_score=quality_score,
                completeness_score=completeness_score,
                accuracy_score=accuracy_score,
                consistency_score=consistency_score,
                timeliness_score=timeliness_score,
                issues=issues,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Failed to generate quality report for {symbol}: {e}")
            raise
    
    def _check_completeness(self, data: pd.DataFrame) -> Tuple[int, float]:
        """Check data completeness"""
        try:
            # Count missing values
            missing_counts = data.isnull().sum()
            total_missing = missing_counts.sum()
            total_elements = data.size
            
            # Calculate completeness score
            completeness_score = 1.0 - (total_missing / total_elements)
            
            return total_missing, completeness_score
            
        except Exception as e:
            logger.warning(f"Completeness check failed: {e}")
            return 0, 1.0
    
    def _check_accuracy(self, data: pd.DataFrame, asset_class: AssetClass) -> Tuple[int, float]:
        """Check data accuracy"""
        try:
            invalid_count = 0
            total_checks = 0
            
            # Check for negative prices
            if 'close' in data.columns:
                negative_prices = (data['close'] < 0).sum()
                invalid_count += negative_prices
                total_checks += len(data)
            
            # Check for negative volumes
            if 'volume' in data.columns:
                negative_volumes = (data['volume'] < 0).sum()
                invalid_count += negative_volumes
                total_checks += len(data)
            
            # Check OHLC relationships
            if all(col in data.columns for col in ['open', 'high', 'low', 'close']):
                invalid_ohlc = (
                    (data['high'] < data['low']) |
                    (data['open'] > data['high']) |
                    (data['open'] < data['low']) |
                    (data['close'] > data['high']) |
                    (data['close'] < data['low'])
                ).sum()
                invalid_count += invalid_ohlc
                total_checks += len(data)
            
            # Check for extreme price movements
            if 'close' in data.columns:
                returns = data['close'].pct_change().abs()
                extreme_moves = (returns > 0.5).sum()  # 50% moves
                invalid_count += extreme_moves
                total_checks += len(data)
            
            # Calculate accuracy score
            accuracy_score = 1.0 - (invalid_count / total_checks) if total_checks > 0 else 1.0
            
            return invalid_count, accuracy_score
            
        except Exception as e:
            logger.warning(f"Accuracy check failed: {e}")
            return 0, 1.0
    
    def _check_consistency(self, data: pd.DataFrame) -> float:
        """Check data consistency"""
        try:
            consistency_score = 1.0
            
            # Check for duplicate timestamps
            if 'timestamp' in data.columns:
                duplicates = data['timestamp'].duplicated().sum()
                consistency_score *= (1.0 - duplicates / len(data))
            
            # Check for data gaps
            if 'timestamp' in data.columns:
                data_sorted = data.sort_values('timestamp')
                time_diffs = data_sorted['timestamp'].diff()
                
                # Calculate expected time intervals
                if len(time_diffs) > 1:
                    median_interval = time_diffs.median()
                    large_gaps = (time_diffs > median_interval * 10).sum()
                    consistency_score *= (1.0 - large_gaps / len(data))
            
            # Check for price reversals
            if 'close' in data.columns:
                price_changes = data['close'].diff()
                reversals = ((price_changes > 0) & (price_changes.shift(1) < 0)).sum()
                consistency_score *= (1.0 - reversals / len(data))
            
            return consistency_score
            
        except Exception as e:
            logger.warning(f"Consistency check failed: {e}")
            return 1.0
    
    def _check_timeliness(self, data: pd.DataFrame) -> float:
        """Check data timeliness"""
        try:
            if 'timestamp' not in data.columns:
                return 1.0
            
            # Check if data is recent
            latest_timestamp = data['timestamp'].max()
            current_time = datetime.now()
            
            # Calculate time difference
            time_diff = current_time - latest_timestamp
            
            # Score based on recency (higher score for more recent data)
            if time_diff.total_seconds() < 3600:  # Less than 1 hour
                timeliness_score = 1.0
            elif time_diff.total_seconds() < 86400:  # Less than 1 day
                timeliness_score = 0.9
            elif time_diff.total_seconds() < 604800:  # Less than 1 week
                timeliness_score = 0.8
            else:
                timeliness_score = 0.5
            
            return timeliness_score
            
        except Exception as e:
            logger.warning(f"Timeliness check failed: {e}")
            return 1.0
    
    def _detect_outliers(self, data: pd.DataFrame) -> int:
        """Detect outliers in data"""
        try:
            outlier_mask = pd.Series([False] * len(data), index=data.index)
            
            if self.outlier_method == OutlierMethod.IQR:
                outlier_mask |= self._detect_outliers_iqr(data)
            elif self.outlier_method == OutlierMethod.ZSCORE:
                outlier_mask |= self._detect_outliers_zscore(data)
            elif self.outlier_method == OutlierMethod.HAMPEL:
                outlier_mask |= self._detect_outliers_hampel(data)
            elif self.outlier_method == OutlierMethod.ISOLATION_FOREST:
                outlier_mask |= self._detect_outliers_isolation_forest(data)
            elif self.outlier_method == OutlierMethod.LOCAL_OUTLIER_FACTOR:
                outlier_mask |= self._detect_outliers_lof(data)
            elif self.outlier_method == OutlierMethod.COMBINED:
                outlier_mask |= self._detect_outliers_combined(data)
            
            return outlier_mask.sum()
            
        except Exception as e:
            logger.warning(f"Outlier detection failed: {e}")
            return 0
    
    def _detect_outliers_iqr(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using IQR method"""
        try:
            outlier_mask = pd.Series([False] * len(data), index=data.index)
            
            # Apply to price columns
            price_columns = ['open', 'high', 'low', 'close']
            for col in price_columns:
                if col in data.columns:
                    Q1 = data[col].quantile(0.25)
                    Q3 = data[col].quantile(0.75)
                    IQR = Q3 - Q1
                    
                    lower_bound = Q1 - self.iqr_multiplier * IQR
                    upper_bound = Q3 + self.iqr_multiplier * IQR
                    
                    outlier_mask |= (data[col] < lower_bound) | (data[col] > upper_bound)
            
            return outlier_mask
            
        except Exception as e:
            logger.warning(f"IQR outlier detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _detect_outliers_zscore(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using Z-score method"""
        try:
            outlier_mask = pd.Series([False] * len(data), index=data.index)
            
            # Apply to price columns
            price_columns = ['open', 'high', 'low', 'close']
            for col in price_columns:
                if col in data.columns:
                    z_scores = np.abs(stats.zscore(data[col].dropna()))
                    outlier_mask |= (z_scores > self.zscore_threshold)
            
            return outlier_mask
            
        except Exception as e:
            logger.warning(f"Z-score outlier detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _detect_outliers_hampel(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using Hampel filter"""
        try:
            outlier_mask = pd.Series([False] * len(data), index=data.index)
            
            # Apply to price columns
            price_columns = ['open', 'high', 'low', 'close']
            for col in price_columns:
                if col in data.columns:
                    hampel_outliers = self._hampel_filter(data[col], self.hampel_window)
                    outlier_mask |= hampel_outliers
            
            return outlier_mask
            
        except Exception as e:
            logger.warning(f"Hampel outlier detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _hampel_filter(self, series: pd.Series, window: int) -> pd.Series:
        """Apply Hampel filter to detect outliers"""
        try:
            outliers = pd.Series([False] * len(series), index=series.index)
            
            for i in range(window, len(series) - window):
                window_data = series.iloc[i-window:i+window+1]
                median = window_data.median()
                mad = np.median(np.abs(window_data - median))
                
                if abs(series.iloc[i] - median) > 3.5 * mad:
                    outliers.iloc[i] = True
            
            return outliers
            
        except Exception as e:
            logger.warning(f"Hampel filter failed: {e}")
            return pd.Series([False] * len(series), index=series.index)
    
    def _detect_outliers_isolation_forest(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using Isolation Forest"""
        try:
            # Prepare features for outlier detection
            features = []
            feature_names = []
            
            if 'close' in data.columns:
                features.append(data['close'].values.reshape(-1, 1))
                feature_names.append('close')
            
            if 'volume' in data.columns:
                features.append(data['volume'].values.reshape(-1, 1))
                feature_names.append('volume')
            
            if len(features) == 0:
                return pd.Series([False] * len(data), index=data.index)
            
            # Combine features
            X = np.hstack(features)
            
            # Apply Isolation Forest
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            outlier_labels = iso_forest.fit_predict(X)
            
            # Convert to boolean mask
            outlier_mask = outlier_labels == -1
            
            return pd.Series(outlier_mask, index=data.index)
            
        except Exception as e:
            logger.warning(f"Isolation Forest outlier detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _detect_outliers_lof(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using Local Outlier Factor"""
        try:
            # Prepare features for outlier detection
            features = []
            
            if 'close' in data.columns:
                features.append(data['close'].values.reshape(-1, 1))
            
            if 'volume' in data.columns:
                features.append(data['volume'].values.reshape(-1, 1))
            
            if len(features) == 0:
                return pd.Series([False] * len(data), index=data.index)
            
            # Combine features
            X = np.hstack(features)
            
            # Apply Local Outlier Factor
            lof = LocalOutlierFactor(contamination=0.1)
            outlier_labels = lof.fit_predict(X)
            
            # Convert to boolean mask
            outlier_mask = outlier_labels == -1
            
            return pd.Series(outlier_mask, index=data.index)
            
        except Exception as e:
            logger.warning(f"Local Outlier Factor detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _detect_outliers_combined(self, data: pd.DataFrame) -> pd.Series:
        """Detect outliers using combined methods"""
        try:
            # Apply multiple methods
            iqr_outliers = self._detect_outliers_iqr(data)
            zscore_outliers = self._detect_outliers_zscore(data)
            hampel_outliers = self._detect_outliers_hampel(data)
            
            # Combine results (outlier if detected by at least 2 methods)
            combined_outliers = (iqr_outliers.astype(int) + 
                               zscore_outliers.astype(int) + 
                               hampel_outliers.astype(int)) >= 2
            
            return combined_outliers
            
        except Exception as e:
            logger.warning(f"Combined outlier detection failed: {e}")
            return pd.Series([False] * len(data), index=data.index)
    
    def _apply_data_cleaning(self, data: pd.DataFrame, quality_report: DataQualityReport) -> pd.DataFrame:
        """Apply data cleaning based on quality issues"""
        try:
            cleaned_data = data.copy()
            
            # Handle missing values
            if quality_report.completeness_score < 0.9:
                cleaned_data = self._interpolate_missing_values(cleaned_data)
            
            # Handle outliers
            if quality_report.outlier_records > 0:
                cleaned_data = self._handle_outliers(cleaned_data)
            
            # Fix invalid data
            if quality_report.accuracy_score < 0.9:
                cleaned_data = self._fix_invalid_data(cleaned_data)
            
            # Remove duplicates
            if 'timestamp' in cleaned_data.columns:
                cleaned_data = cleaned_data.drop_duplicates(subset=['timestamp'])
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Data cleaning failed: {e}")
            return data
    
    def _interpolate_missing_values(self, data: pd.DataFrame) -> pd.DataFrame:
        """Interpolate missing values"""
        try:
            cleaned_data = data.copy()
            
            if self.interpolation_method == InterpolationMethod.FORWARD_FILL:
                cleaned_data = cleaned_data.fillna(method='ffill')
            elif self.interpolation_method == InterpolationMethod.BACKWARD_FILL:
                cleaned_data = cleaned_data.fillna(method='bfill')
            elif self.interpolation_method == InterpolationMethod.LINEAR:
                cleaned_data = cleaned_data.interpolate(method='linear')
            elif self.interpolation_method == InterpolationMethod.SPLINE:
                cleaned_data = cleaned_data.interpolate(method='spline', order=3)
            elif self.interpolation_method == InterpolationMethod.POLYNOMIAL:
                cleaned_data = cleaned_data.interpolate(method='polynomial', order=2)
            elif self.interpolation_method == InterpolationMethod.NEAREST:
                cleaned_data = cleaned_data.interpolate(method='nearest')
            elif self.interpolation_method == InterpolationMethod.TIME_WEIGHTED:
                cleaned_data = self._time_weighted_interpolation(cleaned_data)
            
            return cleaned_data
            
        except Exception as e:
            logger.warning(f"Missing value interpolation failed: {e}")
            return data
    
    def _time_weighted_interpolation(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply time-weighted interpolation"""
        try:
            cleaned_data = data.copy()
            
            if 'timestamp' not in cleaned_data.columns:
                return cleaned_data
            
            # Sort by timestamp
            cleaned_data = cleaned_data.sort_values('timestamp')
            
            # Apply time-weighted interpolation to numeric columns
            numeric_columns = cleaned_data.select_dtypes(include=[np.number]).columns
            
            for col in numeric_columns:
                if col != 'timestamp':
                    # Create time index
                    time_index = pd.to_datetime(cleaned_data['timestamp'])
                    
                    # Interpolate with time weights
                    cleaned_data[col] = cleaned_data[col].interpolate(
                        method='time', 
                        limit_direction='both'
                    )
            
            return cleaned_data
            
        except Exception as e:
            logger.warning(f"Time-weighted interpolation failed: {e}")
            return data
    
    def _handle_outliers(self, data: pd.DataFrame) -> pd.DataFrame:
        """Handle outliers in data"""
        try:
            cleaned_data = data.copy()
            
            # Detect outliers
            outlier_mask = self._detect_outliers(cleaned_data)
            
            # Replace outliers with interpolated values
            for col in cleaned_data.columns:
                if col in ['open', 'high', 'low', 'close', 'volume']:
                    outlier_indices = outlier_mask[outlier_mask].index
                    if len(outlier_indices) > 0:
                        # Replace outliers with NaN for interpolation
                        cleaned_data.loc[outlier_indices, col] = np.nan
                        
                        # Interpolate outliers
                        cleaned_data[col] = cleaned_data[col].interpolate(method='linear')
            
            return cleaned_data
            
        except Exception as e:
            logger.warning(f"Outlier handling failed: {e}")
            return data
    
    def _fix_invalid_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Fix invalid data relationships"""
        try:
            cleaned_data = data.copy()
            
            # Fix OHLC relationships
            if all(col in cleaned_data.columns for col in ['open', 'high', 'low', 'close']):
                # Ensure high >= low
                invalid_hl = cleaned_data['high'] < cleaned_data['low']
                if invalid_hl.any():
                    temp_high = cleaned_data.loc[invalid_hl, 'high'].copy()
                    cleaned_data.loc[invalid_hl, 'high'] = cleaned_data.loc[invalid_hl, 'low']
                    cleaned_data.loc[invalid_hl, 'low'] = temp_high
                
                # Ensure close is within high-low range
                invalid_close = (
                    (cleaned_data['close'] > cleaned_data['high']) | 
                    (cleaned_data['close'] < cleaned_data['low'])
                )
                if invalid_close.any():
                    cleaned_data.loc[invalid_close, 'close'] = (
                        cleaned_data.loc[invalid_close, 'high'] + 
                        cleaned_data.loc[invalid_close, 'low']
                    ) / 2
            
            # Fix negative values
            for col in ['open', 'high', 'low', 'close', 'volume']:
                if col in cleaned_data.columns:
                    negative_mask = cleaned_data[col] < 0
                    if negative_mask.any():
                        cleaned_data.loc[negative_mask, col] = np.nan
                        cleaned_data[col] = cleaned_data[col].interpolate(method='linear')
            
            return cleaned_data
            
        except Exception as e:
            logger.warning(f"Invalid data fixing failed: {e}")
            return data
    
    def get_quality_report(self, symbol: str) -> Optional[DataQualityReport]:
        """Get quality report for symbol"""
        return self.quality_reports.get(symbol)
    
    def get_all_quality_reports(self) -> Dict[str, DataQualityReport]:
        """Get all quality reports"""
        return self.quality_reports.copy()
    
    def export_quality_summary(self) -> pd.DataFrame:
        """Export quality summary as DataFrame"""
        try:
            summary_data = []
            
            for symbol, report in self.quality_reports.items():
                summary_data.append({
                    'symbol': symbol,
                    'asset_class': report.asset_class.value,
                    'data_type': report.data_type.value,
                    'total_records': report.total_records,
                    'missing_records': report.missing_records,
                    'outlier_records': report.outlier_records,
                    'invalid_records': report.invalid_records,
                    'quality_score': report.quality_score,
                    'completeness_score': report.completeness_score,
                    'accuracy_score': report.accuracy_score,
                    'consistency_score': report.consistency_score,
                    'timeliness_score': report.timeliness_score,
                    'issues_count': len(report.issues),
                    'recommendations_count': len(report.recommendations),
                    'processing_timestamp': report.processing_timestamp
                })
            
            return pd.DataFrame(summary_data)
            
        except Exception as e:
            logger.error(f"Failed to export quality summary: {e}")
            return pd.DataFrame()
