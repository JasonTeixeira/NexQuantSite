"""
Base Data Connector for Enterprise Quantitative Backtesting Engine
"""

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import aiohttp
from pathlib import Path
import json
import hashlib
from concurrent.futures import ThreadPoolExecutor
import time

logger = logging.getLogger(__name__)

class DataType(Enum):
    """Supported data types"""
    TICK = "tick"
    OHLCV = "ohlcv"
    ORDER_BOOK = "order_book"
    TRADES = "trades"
    FUNDAMENTAL = "fundamental"
    SENTIMENT = "sentiment"
    ECONOMIC = "economic"
    ALTERNATIVE = "alternative"

class AssetClass(Enum):
    """Supported asset classes"""
    EQUITY = "equity"
    OPTION = "option"
    FUTURE = "future"
    FOREX = "forex"
    CRYPTO = "crypto"
    FIXED_INCOME = "fixed_income"
    COMMODITY = "commodity"
    ETF = "etf"

class DataQuality(Enum):
    """Data quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"

@dataclass
class DataRequest:
    """Data request specification"""
    symbol: str
    start_date: datetime
    end_date: datetime
    data_type: DataType
    asset_class: AssetClass
    frequency: str = "1min"  # 1min, 5min, 1hour, 1day, etc.
    fields: List[str] = field(default_factory=list)
    limit: Optional[int] = None
    include_metadata: bool = True

@dataclass
class DataResponse:
    """Data response container"""
    data: pd.DataFrame
    metadata: Dict[str, Any] = field(default_factory=dict)
    quality_score: float = 1.0
    quality_level: DataQuality = DataQuality.UNKNOWN
    source: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    request_id: str = ""

@dataclass
class ConnectorStatus:
    """Connector status information"""
    is_connected: bool
    last_heartbeat: datetime
    error_count: int = 0
    success_count: int = 0
    avg_response_time: float = 0.0
    data_quality_score: float = 1.0
    api_rate_limit_remaining: Optional[int] = None
    api_rate_limit_reset: Optional[datetime] = None

class BaseDataConnector(ABC):
    """
    Base class for all data connectors with enterprise-grade features
    """
    
    def __init__(self, 
                 name: str,
                 config: Dict[str, Any],
                 cache_enabled: bool = True,
                 retry_attempts: int = 3,
                 timeout: int = 30):
        """
        Initialize base connector
        
        Args:
            name: Connector name
            config: Configuration dictionary
            cache_enabled: Enable caching
            retry_attempts: Number of retry attempts
            timeout: Request timeout in seconds
        """
        self.name = name
        self.config = config
        self.cache_enabled = cache_enabled
        self.retry_attempts = retry_attempts
        self.timeout = timeout
        
        # Connection state
        self.is_connected = False
        self.session = None
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Statistics
        self.stats = {
            'requests_made': 0,
            'requests_successful': 0,
            'requests_failed': 0,
            'total_data_points': 0,
            'total_bytes_transferred': 0,
            'avg_response_time': 0.0,
            'last_request_time': None,
            'error_history': []
        }
        
        # Cache
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour default
        
        # Rate limiting
        self.rate_limit_remaining = None
        self.rate_limit_reset = None
        self.rate_limit_window = 60  # 1 minute default
        
        # Data quality tracking
        self.quality_metrics = {
            'completeness': 1.0,
            'accuracy': 1.0,
            'timeliness': 1.0,
            'consistency': 1.0
        }
        
        logger.info(f"Initialized {self.name} connector")
    
    @abstractmethod
    def connect(self) -> bool:
        """
        Connect to data source
        
        Returns:
            True if connection successful
        """
        pass
    
    @abstractmethod
    def disconnect(self) -> bool:
        """
        Disconnect from data source
        
        Returns:
            True if disconnection successful
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if data source is available
        
        Returns:
            True if available
        """
        pass
    
    @abstractmethod
    def get_supported_asset_classes(self) -> List[AssetClass]:
        """
        Get supported asset classes
        
        Returns:
            List of supported asset classes
        """
        pass
    
    @abstractmethod
    def get_supported_data_types(self) -> List[DataType]:
        """
        Get supported data types
        
        Returns:
            List of supported data types
        """
        pass
    
    @abstractmethod
    def get_data(self, request: DataRequest) -> DataResponse:
        """
        Get data from source
        
        Args:
            request: Data request specification
            
        Returns:
            Data response
        """
        pass
    
    def get_data_async(self, request: DataRequest) -> asyncio.Future:
        """
        Get data asynchronously
        
        Args:
            request: Data request specification
            
        Returns:
            Future containing data response
        """
        loop = asyncio.get_event_loop()
        return loop.run_in_executor(self.executor, self.get_data, request)
    
    def get_batch_data(self, requests: List[DataRequest]) -> List[DataResponse]:
        """
        Get multiple data requests in batch
        
        Args:
            requests: List of data requests
            
        Returns:
            List of data responses
        """
        responses = []
        
        # Check cache first
        for request in requests:
            cached_response = self._get_cached_data(request)
            if cached_response is not None:
                responses.append(cached_response)
            else:
                # Get fresh data
                response = self.get_data(request)
                self._cache_data(request, response)
                responses.append(response)
        
        return responses
    
    def get_batch_data_async(self, requests: List[DataRequest]) -> List[asyncio.Future]:
        """
        Get multiple data requests asynchronously
        
        Args:
            requests: List of data requests
            
        Returns:
            List of futures containing data responses
        """
        futures = []
        for request in requests:
            future = self.get_data_async(request)
            futures.append(future)
        
        return futures
    
    def validate_request(self, request: DataRequest) -> Tuple[bool, List[str]]:
        """
        Validate data request
        
        Args:
            request: Data request to validate
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Check required fields
        if not request.symbol:
            errors.append("Symbol is required")
        
        if not request.start_date or not request.end_date:
            errors.append("Start and end dates are required")
        
        if request.start_date >= request.end_date:
            errors.append("Start date must be before end date")
        
        # Check date range
        max_days = self.config.get('max_date_range_days', 365)
        date_diff = (request.end_date - request.start_date).days
        if date_diff > max_days:
            errors.append(f"Date range exceeds maximum of {max_days} days")
        
        # Check supported asset class
        if request.asset_class not in self.get_supported_asset_classes():
            errors.append(f"Asset class {request.asset_class} not supported")
        
        # Check supported data type
        if request.data_type not in self.get_supported_data_types():
            errors.append(f"Data type {request.data_type} not supported")
        
        return len(errors) == 0, errors
    
    def _get_cached_data(self, request: DataRequest) -> Optional[DataResponse]:
        """
        Get data from cache
        
        Args:
            request: Data request
            
        Returns:
            Cached data response or None
        """
        if not self.cache_enabled:
            return None
        
        cache_key = self._generate_cache_key(request)
        cached_item = self.cache.get(cache_key)
        
        if cached_item is None:
            return None
        
        # Check if cache is still valid
        if time.time() - cached_item['timestamp'] > self.cache_ttl:
            del self.cache[cache_key]
            return None
        
        logger.debug(f"Cache hit for {request.symbol}")
        return cached_item['data']
    
    def _cache_data(self, request: DataRequest, response: DataResponse):
        """
        Cache data response
        
        Args:
            request: Data request
            response: Data response
        """
        if not self.cache_enabled:
            return
        
        cache_key = self._generate_cache_key(request)
        self.cache[cache_key] = {
            'data': response,
            'timestamp': time.time()
        }
        
        # Limit cache size
        if len(self.cache) > 1000:
            # Remove oldest entries
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
    
    def _generate_cache_key(self, request: DataRequest) -> str:
        """
        Generate cache key for request
        
        Args:
            request: Data request
            
        Returns:
            Cache key string
        """
        key_data = {
            'symbol': request.symbol,
            'start_date': request.start_date.isoformat(),
            'end_date': request.end_date.isoformat(),
            'data_type': request.data_type.value,
            'asset_class': request.asset_class.value,
            'frequency': request.frequency,
            'fields': sorted(request.fields)
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _update_stats(self, response_time: float, success: bool, data_points: int = 0, bytes_transferred: int = 0):
        """
        Update connector statistics
        
        Args:
            response_time: Response time in seconds
            success: Whether request was successful
            data_points: Number of data points received
            bytes_transferred: Bytes transferred
        """
        self.stats['requests_made'] += 1
        self.stats['last_request_time'] = datetime.now()
        
        if success:
            self.stats['requests_successful'] += 1
        else:
            self.stats['requests_failed'] += 1
            self.stats['error_history'].append({
                'timestamp': datetime.now(),
                'response_time': response_time
            })
        
        # Update average response time
        if self.stats['requests_made'] == 1:
            self.stats['avg_response_time'] = response_time
        else:
            self.stats['avg_response_time'] = (
                (self.stats['avg_response_time'] * (self.stats['requests_made'] - 1) + response_time) / 
                self.stats['requests_made']
            )
        
        self.stats['total_data_points'] += data_points
        self.stats['total_bytes_transferred'] += bytes_transferred
    
    def _calculate_data_quality(self, data: pd.DataFrame, request: DataRequest) -> Tuple[float, DataQuality]:
        """
        Calculate data quality score
        
        Args:
            data: Data DataFrame
            request: Original request
            
        Returns:
            Tuple of (quality_score, quality_level)
        """
        if data.empty:
            return 0.0, DataQuality.POOR
        
        # Completeness
        total_expected = self._calculate_expected_data_points(request)
        actual_points = len(data)
        completeness = actual_points / total_expected if total_expected > 0 else 1.0
        
        # Accuracy (check for obvious errors)
        accuracy = 1.0
        if 'price' in data.columns:
            # Check for negative prices
            negative_prices = (data['price'] < 0).sum()
            accuracy = 1.0 - (negative_prices / len(data))
        
        # Timeliness
        if 'timestamp' in data.columns:
            max_delay = timedelta(minutes=5)  # 5 minutes tolerance
            current_time = datetime.now()
            delays = [(current_time - ts).total_seconds() for ts in data['timestamp'] if ts <= current_time]
            avg_delay = np.mean(delays) if delays else 0
            timeliness = max(0, 1.0 - (avg_delay / max_delay.total_seconds()))
        else:
            timeliness = 1.0
        
        # Consistency
        consistency = 1.0
        if len(data) > 1:
            # Check for duplicate timestamps
            if 'timestamp' in data.columns:
                duplicates = data['timestamp'].duplicated().sum()
                consistency = 1.0 - (duplicates / len(data))
        
        # Overall quality score
        quality_score = (completeness + accuracy + timeliness + consistency) / 4
        
        # Determine quality level
        if quality_score >= 0.95:
            quality_level = DataQuality.EXCELLENT
        elif quality_score >= 0.85:
            quality_level = DataQuality.GOOD
        elif quality_score >= 0.70:
            quality_level = DataQuality.FAIR
        else:
            quality_level = DataQuality.POOR
        
        return quality_score, quality_level
    
    def _calculate_expected_data_points(self, request: DataRequest) -> int:
        """
        Calculate expected number of data points for request
        
        Args:
            request: Data request
            
        Returns:
            Expected number of data points
        """
        # Convert frequency to timedelta
        freq_map = {
            '1min': timedelta(minutes=1),
            '5min': timedelta(minutes=5),
            '15min': timedelta(minutes=15),
            '30min': timedelta(minutes=30),
            '1hour': timedelta(hours=1),
            '1day': timedelta(days=1)
        }
        
        freq_delta = freq_map.get(request.frequency, timedelta(minutes=1))
        total_duration = request.end_date - request.start_date
        
        # Account for market hours (rough estimate)
        if request.asset_class in [AssetClass.EQUITY, AssetClass.ETF]:
            # 6.5 hours per day, 5 days per week
            market_hours_per_day = 6.5
            trading_days = total_duration.days * 5 / 7  # Approximate
            market_hours = trading_days * market_hours_per_day
            total_minutes = market_hours * 60
        else:
            # 24/7 for crypto, forex, etc.
            total_minutes = total_duration.total_seconds() / 60
        
        return int(total_minutes / freq_delta.total_seconds() * 60)
    
    def get_status(self) -> ConnectorStatus:
        """
        Get connector status
        
        Returns:
            Connector status information
        """
        return ConnectorStatus(
            is_connected=self.is_connected,
            last_heartbeat=self.stats.get('last_request_time'),
            error_count=self.stats['requests_failed'],
            success_count=self.stats['requests_successful'],
            avg_response_time=self.stats['avg_response_time'],
            data_quality_score=np.mean(list(self.quality_metrics.values())),
            api_rate_limit_remaining=self.rate_limit_remaining,
            api_rate_limit_reset=self.rate_limit_reset
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get detailed statistics
        
        Returns:
            Statistics dictionary
        """
        return self.stats.copy()
    
    def reset_stats(self):
        """Reset all statistics"""
        self.stats = {
            'requests_made': 0,
            'requests_successful': 0,
            'requests_failed': 0,
            'total_data_points': 0,
            'total_bytes_transferred': 0,
            'avg_response_time': 0.0,
            'last_request_time': None,
            'error_history': []
        }
    
    def clear_cache(self):
        """Clear all cached data"""
        self.cache.clear()
        logger.info(f"Cache cleared for {self.name}")
    
    def set_cache_ttl(self, ttl_seconds: int):
        """
        Set cache TTL
        
        Args:
            ttl_seconds: Time to live in seconds
        """
        self.cache_ttl = ttl_seconds
        logger.info(f"Cache TTL set to {ttl_seconds} seconds for {self.name}")
    
    def _handle_rate_limit(self, headers: Dict[str, str]):
        """
        Handle rate limiting from API response headers
        
        Args:
            headers: Response headers
        """
        # Common rate limit header patterns
        rate_limit_headers = {
            'X-RateLimit-Remaining': 'rate_limit_remaining',
            'X-RateLimit-Reset': 'rate_limit_reset',
            'RateLimit-Remaining': 'rate_limit_remaining',
            'RateLimit-Reset': 'rate_limit_reset'
        }
        
        for header_name, attr_name in rate_limit_headers.items():
            if header_name in headers:
                value = headers[header_name]
                if attr_name == 'rate_limit_remaining':
                    try:
                        self.rate_limit_remaining = int(value)
                    except ValueError:
                        pass
                elif attr_name == 'rate_limit_reset':
                    try:
                        # Convert Unix timestamp to datetime
                        reset_time = int(value)
                        self.rate_limit_reset = datetime.fromtimestamp(reset_time)
                    except ValueError:
                        pass
    
    def _wait_for_rate_limit(self):
        """Wait if rate limit is exceeded"""
        if self.rate_limit_remaining == 0 and self.rate_limit_reset:
            wait_time = (self.rate_limit_reset - datetime.now()).total_seconds()
            if wait_time > 0:
                logger.warning(f"Rate limit exceeded, waiting {wait_time:.1f} seconds")
                time.sleep(wait_time)
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
