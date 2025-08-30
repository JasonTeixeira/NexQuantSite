"""
Multi-Asset Data Processor for Enterprise Quantitative Backtesting Engine
Handles different asset classes with their specific characteristics and corporate actions
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, field
from enum import Enum
import warnings
from pathlib import Path
import json

from ..data_connectors.base_connector import AssetClass, DataType, DataRequest, DataResponse

logger = logging.getLogger(__name__)

class CorporateActionType(Enum):
    """Types of corporate actions"""
    SPLIT = "split"
    DIVIDEND = "dividend"
    MERGER = "merger"
    SPINOFF = "spinoff"
    DELISTING = "delisting"
    RIGHTS_OFFERING = "rights_offering"
    STOCK_DIVIDEND = "stock_dividend"
    REVERSE_SPLIT = "reverse_split"

@dataclass
class CorporateAction:
    """Corporate action information"""
    action_type: CorporateActionType
    effective_date: datetime
    record_date: datetime
    ex_date: datetime
    description: str
    ratio: Optional[float] = None  # For splits, mergers
    dividend_amount: Optional[float] = None  # For dividends
    currency: str = "USD"
    metadata: Dict[str, Any] = field(default_factory=dict)

class MultiAssetProcessor:
    """
    Advanced multi-asset data processor with corporate actions handling
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize multi-asset processor
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.corporate_actions_db = {}
        self.adjustment_factors = {}
        self.asset_specific_configs = self._load_asset_configs()
        
        logger.info("Multi-asset processor initialized")
    
    def _load_asset_configs(self) -> Dict[AssetClass, Dict[str, Any]]:
        """Load asset-specific configurations"""
        return {
            AssetClass.EQUITY: {
                'trading_hours': {'start': '09:30', 'end': '16:00', 'timezone': 'America/New_York'},
                'settlement_days': 2,
                'tick_size': 0.01,
                'supports_corporate_actions': True,
                'supports_short_selling': True,
                'margin_requirement': 0.5,
                'multiplier': 1.0
            },
            AssetClass.FUTURE: {
                'trading_hours': {'start': '00:00', 'end': '23:59', 'timezone': 'America/New_York'},
                'settlement_days': 0,
                'tick_size': 0.25,
                'supports_corporate_actions': False,
                'supports_short_selling': True,
                'margin_requirement': 0.05,
                'multiplier': 50.0  # ES multiplier
            },
            AssetClass.OPTION: {
                'trading_hours': {'start': '09:30', 'end': '16:00', 'timezone': 'America/New_York'},
                'settlement_days': 1,
                'tick_size': 0.01,
                'supports_corporate_actions': True,
                'supports_short_selling': True,
                'margin_requirement': 0.25,
                'multiplier': 100.0
            },
            AssetClass.CRYPTO: {
                'trading_hours': {'start': '00:00', 'end': '23:59', 'timezone': 'UTC'},
                'settlement_days': 0,
                'tick_size': 0.01,
                'supports_corporate_actions': False,
                'supports_short_selling': True,
                'margin_requirement': 0.1,
                'multiplier': 1.0
            },
            AssetClass.FOREX: {
                'trading_hours': {'start': '00:00', 'end': '23:59', 'timezone': 'UTC'},
                'settlement_days': 2,
                'tick_size': 0.0001,
                'supports_corporate_actions': False,
                'supports_short_selling': True,
                'margin_requirement': 0.02,
                'multiplier': 1.0
            }
        }
    
    def process_market_data(self, data: pd.DataFrame, symbol: str, 
                          asset_class: AssetClass, data_type: DataType) -> pd.DataFrame:
        """
        Process market data for specific asset class
        
        Args:
            data: Raw market data
            symbol: Symbol
            asset_class: Asset class
            data_type: Data type
            
        Returns:
            Processed market data
        """
        try:
            # Make a copy to avoid modifying original
            processed_data = data.copy()
            
            # Apply asset-specific processing
            processed_data = self._apply_asset_specific_processing(
                processed_data, symbol, asset_class, data_type
            )
            
            # Handle corporate actions if applicable
            if self.asset_specific_configs[asset_class]['supports_corporate_actions']:
                processed_data = self._apply_corporate_actions(
                    processed_data, symbol, asset_class
                )
            
            # Apply data quality checks
            processed_data = self._apply_data_quality_checks(
                processed_data, asset_class, data_type
            )
            
            # Add metadata
            processed_data = self._add_processing_metadata(
                processed_data, symbol, asset_class, data_type
            )
            
            logger.info(f"Processed {len(processed_data)} records for {symbol} ({asset_class.value})")
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to process market data for {symbol}: {e}")
            raise
    
    def _apply_asset_specific_processing(self, data: pd.DataFrame, symbol: str,
                                       asset_class: AssetClass, data_type: DataType) -> pd.DataFrame:
        """Apply asset-specific processing rules"""
        
        if asset_class == AssetClass.EQUITY:
            return self._process_equity_data(data, symbol, data_type)
        elif asset_class == AssetClass.FUTURE:
            return self._process_future_data(data, symbol, data_type)
        elif asset_class == AssetClass.OPTION:
            return self._process_option_data(data, symbol, data_type)
        elif asset_class == AssetClass.CRYPTO:
            return self._process_crypto_data(data, symbol, data_type)
        elif asset_class == AssetClass.FOREX:
            return self._process_forex_data(data, symbol, data_type)
        else:
            return data
    
    def _process_equity_data(self, data: pd.DataFrame, symbol: str, data_type: DataType) -> pd.DataFrame:
        """Process equity-specific data"""
        processed = data.copy()
        
        # Add equity-specific fields
        if 'volume' in processed.columns:
            # Calculate average volume
            processed['avg_volume'] = processed['volume'].rolling(window=20).mean()
            
            # Calculate volume-weighted average price (VWAP)
            if all(col in processed.columns for col in ['close', 'volume']):
                processed['vwap'] = (processed['close'] * processed['volume']).rolling(window=20).sum() / processed['volume'].rolling(window=20).sum()
        
        # Add market microstructure features
        if all(col in processed.columns for col in ['high', 'low', 'close']):
            processed['true_range'] = np.maximum(
                processed['high'] - processed['low'],
                np.maximum(
                    abs(processed['high'] - processed['close'].shift(1)),
                    abs(processed['low'] - processed['close'].shift(1))
                )
            )
            
            processed['atr'] = processed['true_range'].rolling(window=14).mean()
        
        # Add price momentum features
        if 'close' in processed.columns:
            processed['returns'] = processed['close'].pct_change()
            processed['log_returns'] = np.log(processed['close'] / processed['close'].shift(1))
            
            # Rolling volatility
            processed['volatility'] = processed['returns'].rolling(window=20).std() * np.sqrt(252)
        
        return processed
    
    def _process_future_data(self, data: pd.DataFrame, symbol: str, data_type: DataType) -> pd.DataFrame:
        """Process futures-specific data"""
        processed = data.copy()
        
        # Add futures-specific fields
        if 'close' in processed.columns:
            # Calculate basis (difference from spot)
            # This would require spot price data
            processed['basis'] = 0.0  # Placeholder
            
            # Add contract-specific multipliers
            multiplier = self.asset_specific_configs[AssetClass.FUTURE]['multiplier']
            processed['notional_value'] = processed['close'] * multiplier
        
        # Add open interest if available
        if 'open_interest' not in processed.columns:
            processed['open_interest'] = np.nan
        
        return processed
    
    def _process_option_data(self, data: pd.DataFrame, symbol: str, data_type: DataType) -> pd.DataFrame:
        """Process options-specific data"""
        processed = data.copy()
        
        # Add options-specific fields
        if 'close' in processed.columns:
            # Calculate implied volatility (simplified)
            # In practice, this would use Black-Scholes or other models
            processed['implied_volatility'] = processed['close'] * 0.3  # Placeholder
            
            # Add Greeks (simplified)
            processed['delta'] = 0.5  # Placeholder
            processed['gamma'] = 0.01  # Placeholder
            processed['theta'] = -0.001  # Placeholder
            processed['vega'] = 0.1  # Placeholder
        
        return processed
    
    def _process_crypto_data(self, data: pd.DataFrame, symbol: str, data_type: DataType) -> pd.DataFrame:
        """Process cryptocurrency-specific data"""
        processed = data.copy()
        
        # Add crypto-specific fields
        if 'volume' in processed.columns:
            # Calculate market cap (simplified)
            processed['market_cap'] = processed['close'] * processed['volume']
            
            # Add 24h change
            if 'close' in processed.columns:
                processed['change_24h'] = processed['close'].pct_change(periods=1440)  # Assuming 1-minute data
        
        return processed
    
    def _process_forex_data(self, data: pd.DataFrame, symbol: str, data_type: DataType) -> pd.DataFrame:
        """Process forex-specific data"""
        processed = data.copy()
        
        # Add forex-specific fields
        if 'close' in processed.columns:
            # Calculate pip value
            processed['pip_value'] = 0.0001
            
            # Add interest rate differential (simplified)
            processed['interest_diff'] = 0.0  # Placeholder
        
        return processed
    
    def _apply_corporate_actions(self, data: pd.DataFrame, symbol: str, 
                               asset_class: AssetClass) -> pd.DataFrame:
        """Apply corporate actions to historical data"""
        processed = data.copy()
        
        # Get corporate actions for symbol
        corporate_actions = self.corporate_actions_db.get(symbol, [])
        
        if not corporate_actions:
            return processed
        
        # Sort corporate actions by effective date
        corporate_actions.sort(key=lambda x: x.effective_date)
        
        # Apply adjustments in reverse chronological order
        for action in reversed(corporate_actions):
            if action.action_type == CorporateActionType.SPLIT:
                processed = self._apply_stock_split(processed, action)
            elif action.action_type == CorporateActionType.DIVIDEND:
                processed = self._apply_dividend(processed, action)
            elif action.action_type == CorporateActionType.MERGER:
                processed = self._apply_merger(processed, action)
        
        return processed
    
    def _apply_stock_split(self, data: pd.DataFrame, action: CorporateAction) -> pd.DataFrame:
        """Apply stock split adjustment"""
        if not action.ratio:
            return data
        
        # Find data before split
        split_mask = data.index < action.effective_date
        
        # Adjust prices
        price_columns = ['open', 'high', 'low', 'close']
        for col in price_columns:
            if col in data.columns:
                data.loc[split_mask, col] = data.loc[split_mask, col] / action.ratio
        
        # Adjust volume
        if 'volume' in data.columns:
            data.loc[split_mask, 'volume'] = data.loc[split_mask, 'volume'] * action.ratio
        
        logger.info(f"Applied {action.ratio}:1 stock split for {action.effective_date}")
        return data
    
    def _apply_dividend(self, data: pd.DataFrame, action: CorporateAction) -> pd.DataFrame:
        """Apply dividend adjustment"""
        if not action.dividend_amount:
            return data
        
        # Find data before ex-date
        dividend_mask = data.index < action.ex_date
        
        # Adjust prices
        price_columns = ['open', 'high', 'low', 'close']
        for col in price_columns:
            if col in data.columns:
                data.loc[dividend_mask, col] = data.loc[dividend_mask, col] - action.dividend_amount
        
        logger.info(f"Applied ${action.dividend_amount} dividend for {action.ex_date}")
        return data
    
    def _apply_merger(self, data: pd.DataFrame, action: CorporateAction) -> pd.DataFrame:
        """Apply merger adjustment"""
        if not action.ratio:
            return data
        
        # Find data before merger
        merger_mask = data.index < action.effective_date
        
        # Adjust prices and volume based on merger terms
        price_columns = ['open', 'high', 'low', 'close']
        for col in price_columns:
            if col in data.columns:
                data.loc[merger_mask, col] = data.loc[merger_mask, col] * action.ratio
        
        logger.info(f"Applied merger adjustment with ratio {action.ratio} for {action.effective_date}")
        return data
    
    def _apply_data_quality_checks(self, data: pd.DataFrame, asset_class: AssetClass,
                                 data_type: DataType) -> pd.DataFrame:
        """Apply data quality checks and corrections"""
        processed = data.copy()
        
        # Remove duplicate timestamps
        if 'timestamp' in processed.columns:
            processed = processed.drop_duplicates(subset=['timestamp'])
        
        # Handle missing values
        processed = self._handle_missing_values(processed, asset_class)
        
        # Remove outliers
        processed = self._remove_outliers(processed, asset_class)
        
        # Validate price relationships
        processed = self._validate_price_relationships(processed)
        
        return processed
    
    def _handle_missing_values(self, data: pd.DataFrame, asset_class: AssetClass) -> pd.DataFrame:
        """Handle missing values in data"""
        processed = data.copy()
        
        # Forward fill for OHLCV data
        ohlcv_columns = ['open', 'high', 'low', 'close', 'volume']
        for col in ohlcv_columns:
            if col in processed.columns:
                processed[col] = processed[col].fillna(method='ffill')
        
        # Interpolate for other numeric columns
        numeric_columns = processed.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if col not in ohlcv_columns:
                processed[col] = processed[col].interpolate(method='linear')
        
        return processed
    
    def _remove_outliers(self, data: pd.DataFrame, asset_class: AssetClass) -> pd.DataFrame:
        """Remove statistical outliers"""
        processed = data.copy()
        
        # Remove price outliers using IQR method
        price_columns = ['open', 'high', 'low', 'close']
        for col in price_columns:
            if col in processed.columns:
                Q1 = processed[col].quantile(0.25)
                Q3 = processed[col].quantile(0.75)
                IQR = Q3 - Q1
                
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                # Replace outliers with NaN
                outlier_mask = (processed[col] < lower_bound) | (processed[col] > upper_bound)
                processed.loc[outlier_mask, col] = np.nan
        
        # Forward fill outliers
        processed = self._handle_missing_values(processed, asset_class)
        
        return processed
    
    def _validate_price_relationships(self, data: pd.DataFrame) -> pd.DataFrame:
        """Validate and correct price relationships"""
        processed = data.copy()
        
        # Ensure high >= low
        if all(col in processed.columns for col in ['high', 'low']):
            invalid_mask = processed['high'] < processed['low']
            if invalid_mask.any():
                logger.warning(f"Found {invalid_mask.sum()} records with high < low")
                # Swap high and low for invalid records
                temp_high = processed.loc[invalid_mask, 'high'].copy()
                processed.loc[invalid_mask, 'high'] = processed.loc[invalid_mask, 'low']
                processed.loc[invalid_mask, 'low'] = temp_high
        
        # Ensure close is within high-low range
        if all(col in processed.columns for col in ['high', 'low', 'close']):
            invalid_close = (processed['close'] > processed['high']) | (processed['close'] < processed['low'])
            if invalid_close.any():
                logger.warning(f"Found {invalid_close.sum()} records with close outside high-low range")
                # Set close to mid-point for invalid records
                processed.loc[invalid_close, 'close'] = (
                    processed.loc[invalid_close, 'high'] + processed.loc[invalid_close, 'low']
                ) / 2
        
        return processed
    
    def _add_processing_metadata(self, data: pd.DataFrame, symbol: str, asset_class: AssetClass,
                               data_type: DataType) -> pd.DataFrame:
        """Add processing metadata to data"""
        processed = data.copy()
        
        # Add metadata columns
        processed['symbol'] = symbol
        processed['asset_class'] = asset_class.value
        processed['data_type'] = data_type.value
        processed['processed_at'] = datetime.now()
        processed['processor_version'] = '1.0.0'
        
        return processed
    
    def add_corporate_action(self, symbol: str, action: CorporateAction):
        """
        Add corporate action to database
        
        Args:
            symbol: Symbol
            action: Corporate action
        """
        if symbol not in self.corporate_actions_db:
            self.corporate_actions_db[symbol] = []
        
        self.corporate_actions_db[symbol].append(action)
        logger.info(f"Added corporate action for {symbol}: {action.action_type.value}")
    
    def get_corporate_actions(self, symbol: str, start_date: datetime = None,
                            end_date: datetime = None) -> List[CorporateAction]:
        """
        Get corporate actions for symbol
        
        Args:
            symbol: Symbol
            start_date: Start date filter
            end_date: End date filter
            
        Returns:
            List of corporate actions
        """
        actions = self.corporate_actions_db.get(symbol, [])
        
        if start_date:
            actions = [a for a in actions if a.effective_date >= start_date]
        
        if end_date:
            actions = [a for a in actions if a.effective_date <= end_date]
        
        return sorted(actions, key=lambda x: x.effective_date)
    
    def get_asset_config(self, asset_class: AssetClass) -> Dict[str, Any]:
        """
        Get configuration for asset class
        
        Args:
            asset_class: Asset class
            
        Returns:
            Asset configuration
        """
        return self.asset_specific_configs.get(asset_class, {})
    
    def calculate_adjustment_factors(self, symbol: str, reference_date: datetime) -> Dict[str, float]:
        """
        Calculate adjustment factors for symbol up to reference date
        
        Args:
            symbol: Symbol
            reference_date: Reference date
            
        Returns:
            Dictionary of adjustment factors
        """
        actions = self.get_corporate_actions(symbol, end_date=reference_date)
        
        split_factor = 1.0
        dividend_factor = 1.0
        
        for action in actions:
            if action.action_type == CorporateActionType.SPLIT and action.ratio:
                split_factor *= action.ratio
            elif action.action_type == CorporateActionType.DIVIDEND and action.dividend_amount:
                # Simplified dividend adjustment
                dividend_factor *= (1 - action.dividend_amount / 100)  # Assume 1% dividend impact
        
        return {
            'split_factor': split_factor,
            'dividend_factor': dividend_factor,
            'total_factor': split_factor * dividend_factor
        }
