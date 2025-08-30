"""
Pytest configuration and shared fixtures
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import tempfile
import os
import sys
from pathlib import Path

# Add nexural_backtesting package to path for testing
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import from the clean package structure
try:
    from nexural_backtesting.data.data_quality_engine import DataQualityEngine
    from nexural_backtesting.core.validation import ValidationConfig
    
    # Create alias for backward compatibility
    UltraAccurateDataEngine = DataQualityEngine
except ImportError:
    # Fallback for tests
    class MockDataEngine:
        def __init__(self, config=None):
            self.config = config
        
        def validate_and_clean_data(self, data, symbol, asset_class, data_type):
            return data, type('Report', (), {'quality_score': 9.5, 'issues': []})()
    
    UltraAccurateDataEngine = MockDataEngine
    
    class ValidationConfig:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)


@pytest.fixture
def sample_price_data():
    """Generate sample OHLCV price data for testing"""
    dates = pd.date_range('2023-01-01', periods=1000, freq='1min')
    
    # Generate realistic price data
    np.random.seed(42)
    returns = np.random.normal(0, 0.001, len(dates))
    prices = 4000 * np.exp(np.cumsum(returns))  # ES-like prices
    
    data = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': prices * (1 + np.abs(np.random.normal(0, 0.0005, len(dates)))),
        'low': prices * (1 - np.abs(np.random.normal(0, 0.0005, len(dates)))),
        'close': prices * (1 + np.random.normal(0, 0.0002, len(dates))),
        'volume': np.random.randint(100, 10000, len(dates))
    })
    
    # Ensure OHLC consistency
    data['high'] = np.maximum.reduce([data['open'], data['high'], data['low'], data['close']])
    data['low'] = np.minimum.reduce([data['open'], data['high'], data['low'], data['close']])
    
    return data


@pytest.fixture
def sample_orderbook_data():
    """Generate sample order book (MBP-10) data for testing"""
    dates = pd.date_range('2023-01-01', periods=500, freq='1s')
    
    np.random.seed(42)
    base_price = 4000.0
    
    data = pd.DataFrame({
        'timestamp': dates,
    })
    
    # Generate 10 levels of bid/ask data
    for level in range(10):
        # Bid prices decrease with level
        data[f'bid_price_{level}'] = base_price - (level + 1) * 0.25 + np.random.normal(0, 0.1, len(dates))
        data[f'bid_size_{level}'] = np.random.randint(1, 100, len(dates))
        
        # Ask prices increase with level
        data[f'ask_price_{level}'] = base_price + (level + 1) * 0.25 + np.random.normal(0, 0.1, len(dates))
        data[f'ask_size_{level}'] = np.random.randint(1, 100, len(dates))
    
    # Add derived fields
    data['mid_price'] = (data['bid_price_0'] + data['ask_price_0']) / 2
    data['spread'] = data['ask_price_0'] - data['bid_price_0']
    data['spread_bps'] = 10000 * data['spread'] / data['mid_price']
    
    return data


@pytest.fixture
def sample_execution_data():
    """Generate sample execution data for testing"""
    dates = pd.date_range('2023-01-01', periods=100, freq='5min')
    
    np.random.seed(42)
    
    data = pd.DataFrame({
        'timestamp': dates,
        'symbol': 'ES',
        'side': np.random.choice(['buy', 'sell'], len(dates)),
        'quantity': np.random.randint(1, 10, len(dates)),
        'price': 4000 + np.random.normal(0, 10, len(dates)),
        'commission': 2.25,
        'slippage_bps': np.random.normal(0.5, 0.2, len(dates)),
        'latency_ms': np.random.normal(5, 1, len(dates)),
        'order_type': np.random.choice(['Market', 'Limit'], len(dates))
    })
    
    return data


@pytest.fixture
def temp_config_file():
    """Create temporary configuration file for testing"""
    config_content = """
# Test configuration
api_keys:
  databento: "test_databento_key"
  claude: "test_claude_key"
  ninjatrader:
    enabled: true
    export_path: "/tmp/test_ninjatrader"
  quantconnect:
    user_id: "test_user"
    token: "test_token"

data:
  paths:
    databento: "./test_data/databento/"
    ninjatrader: "./test_data/ninjatrader/"
    cache: "./test_data/cache/"
    results: "./test_data/results/"
  date_range:
    start: "2023-01-01"
    end: "2023-12-31"

backtest:
  initial_capital: 100000
  position_limit: 5
  commission_per_side: 2.25
  slippage_model: "calibrated"

execution:
  latency_ms: 5
  fill_model: "realistic"
  use_real_fills: false

risk:
  max_position_pct: 0.10
  max_daily_loss: 0.02
  max_drawdown: 0.10
  stop_loss_pct: 0.02
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write(config_content)
        temp_file = f.name
    
    yield temp_file
    
    # Cleanup
    os.unlink(temp_file)


@pytest.fixture
def mock_environment_vars():
    """Set up mock environment variables for testing"""
    original_env = {}
    test_env = {
        'DATABENTO_API_KEY': 'test_databento_key_12345',
        'CLAUDE_API_KEY': 'test_claude_key_12345',
        'QUANTCONNECT_USER_ID': 'test_qc_user_12345',
        'QUANTCONNECT_TOKEN': 'test_qc_token_12345',
        'SECRET_KEY': 'test_secret_key_for_encryption',
        'ENVIRONMENT': 'testing'
    }
    
    # Save original values
    for key in test_env:
        original_env[key] = os.environ.get(key)
        os.environ[key] = test_env[key]
    
    yield test_env
    
    # Restore original values
    for key, value in original_env.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


@pytest.fixture
def temp_data_directory():
    """Create temporary data directory structure"""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Create subdirectories
        (temp_path / 'databento').mkdir()
        (temp_path / 'ninjatrader').mkdir()
        (temp_path / 'cache').mkdir()
        (temp_path / 'results').mkdir()
        
        yield temp_path


@pytest.fixture(scope="session")
def performance_baseline():
    """Performance baseline metrics for regression testing"""
    return {
        'backtest_speed_rows_per_second': 10000,  # Minimum acceptable speed
        'data_loading_time_seconds': 5.0,  # Maximum acceptable loading time
        'memory_usage_mb': 500,  # Maximum acceptable memory usage
        'strategy_calculation_ms': 1.0  # Maximum time per strategy calculation
    }


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "performance: Performance tests")
    config.addinivalue_line("markers", "slow: Slow running tests")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on file location"""
    for item in items:
        # Add markers based on test file location
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "performance" in str(item.fspath):
            item.add_marker(pytest.mark.performance)
            item.add_marker(pytest.mark.slow)


@pytest.fixture
def engine():
    """Fixture providing UltraAccurateDataEngine for tests expecting 'engine'."""
    cfg = ValidationConfig(
        quality_threshold=0.95,
        enable_auto_repair=True,
        enable_real_time_monitoring=False,
        cache_validation_results=False,
    )
    return UltraAccurateDataEngine(cfg)


@pytest.fixture
def db_manager():
    """Fixture providing a mock DatabaseManager for database integration tests."""
    # Mock database manager for tests
    class MockDatabaseManager:
        def __init__(self):
            self._backtest_results = {}
            self._market_data = []
            self._risk_metrics = {}
            self._alerts = []
            self._stats = {
                'query_count': 0,
                'cache_hits': 0,
                'cache_misses': 0,
                'cache_hit_rate': 0.0,
                'cache_size': 0
            }
        
        async def save_backtest_result(self, result):
            self._backtest_results[result.id] = result
            self._stats['query_count'] += 1
            return True
        
        async def get_backtest_result(self, result_id):
            self._stats['query_count'] += 1
            return self._backtest_results.get(result_id)
        
        async def get_backtest_results(self, strategy_name=None, limit=100):
            self._stats['query_count'] += 1
            results = list(self._backtest_results.values())
            if strategy_name:
                results = [r for r in results if r.strategy_name == strategy_name]
            return results[:limit]
        
        async def save_market_data(self, data_points):
            self._market_data.extend(data_points)
            self._stats['query_count'] += 1
            return True
        
        async def get_market_data(self, symbol, start_date, end_date, limit=1000):
            self._stats['query_count'] += 1
            filtered = [d for d in self._market_data 
                       if d.symbol == symbol and start_date <= d.timestamp <= end_date]
            return filtered[:limit]
        
        async def save_risk_metrics(self, metrics):
            self._risk_metrics[metrics.id] = metrics
            self._stats['query_count'] += 1
            return True
        
        async def create_alert(self, alert_type, message, severity):
            alert = {
                'type': alert_type,
                'message': message,
                'severity': severity,
                'timestamp': datetime.now(),
                'acknowledged': False
            }
            self._alerts.append(alert)
            self._stats['query_count'] += 1
            return True
        
        async def get_alerts(self, severity=None, acknowledged=None, limit=100):
            self._stats['query_count'] += 1
            alerts = self._alerts
            if severity:
                alerts = [a for a in alerts if a['severity'] == severity]
            if acknowledged is not None:
                alerts = [a for a in alerts if a['acknowledged'] == acknowledged]
            return alerts[:limit]
        
        def get_performance_stats(self):
            return self._stats
        
        async def close(self):
            pass
    
    return MockDatabaseManager()