"""
Unit tests for backtest engine core functionality
"""

import pytest
import pandas as pd
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

from core.backtest_engine import UltimateBacktestEngine, BacktestConfig
from strategies.base_strategy import BaseStrategy


class MockStrategy(BaseStrategy):
    """Mock strategy for testing"""
    
    def get_default_parameters(self):
        return {'param1': 10, 'param2': 0.5}
    
    def generate_signal(self, features):
        # Simple mock signal based on price
        if 'close' in features:
            return 1.0 if features['close'] > 4000 else -1.0
        return 0.0


class TestBacktestConfig:
    """Test BacktestConfig functionality"""
    
    def test_backtest_config_creation(self):
        """Test BacktestConfig creation"""
        config = BacktestConfig(
            initial_capital=100000,
            position_limit=5,
            commission_per_side=2.25,
            slippage_model="calibrated"
        )
        
        assert config.initial_capital == 100000
        assert config.position_limit == 5
        assert config.commission_per_side == 2.25
        assert config.slippage_model == "calibrated"
    
    def test_backtest_config_from_yaml(self, temp_config_file):
        """Test loading BacktestConfig from YAML"""
        config = BacktestConfig.from_yaml(temp_config_file)
        
        assert config.initial_capital == 100000
        assert config.position_limit == 5
        assert config.commission_per_side == 2.25
        assert config.slippage_model == "calibrated"


class TestUltimateBacktestEngine:
    """Test UltimateBacktestEngine functionality"""
    
    @patch('core.backtest_engine.yaml.safe_load')
    @patch('builtins.open')
    def test_engine_initialization(self, mock_open, mock_yaml_load, mock_environment_vars):
        """Test engine initialization"""
        # Mock config loading
        mock_config = {
            'api_keys': {
                'databento': 'test_key',
                'ninjatrader': {'export_path': '/test/path'},
                'quantconnect': {'user_id': 'test', 'token': 'test'},
                'claude': 'test_key'
            },
            'data': {'paths': {'databento': './test_data'}},
            'execution': {'use_real_fills': False},
            'backtest': {
                'initial_capital': 100000,
                'position_limit': 5,
                'commission_per_side': 2.25,
                'slippage_model': 'calibrated'
            }
        }
        mock_yaml_load.return_value = mock_config
        
        engine = UltimateBacktestEngine('test_config.yaml')
        
        assert engine.config == mock_config
        assert engine.backtest_config.initial_capital == 100000
        assert not engine.use_real_fills
        assert hasattr(engine, 'results')
        assert hasattr(engine, 'metrics')
    
    @patch('core.backtest_engine.yaml.safe_load')
    @patch('builtins.open')
    def test_mock_connectors_creation(self, mock_open, mock_yaml_load):
        """Test creation of mock connectors when real ones fail"""
        mock_config = {
            'api_keys': {'databento': 'test'},
            'data': {'paths': {'databento': './test_data'}},
            'execution': {'use_real_fills': False},
            'backtest': {
                'initial_capital': 100000,
                'position_limit': 5,
                'commission_per_side': 2.25,
                'slippage_model': 'calibrated'
            }
        }
        mock_yaml_load.return_value = mock_config
        
        # This should create mock connectors since imports will fail
        engine = UltimateBacktestEngine('test_config.yaml')
        
        # Verify mock connectors were created
        assert hasattr(engine, 'databento')
        assert hasattr(engine, 'ninjatrader')
        assert hasattr(engine, 'quantconnect')
        assert hasattr(engine, 'free_apis')
    
    def test_calculate_position_size_normal(self, temp_config_file):
        """Test position size calculation under normal conditions"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        # Test normal position sizing
        signal = 1.0  # Long signal
        capital = 100000
        volatility = 0.02  # 2% volatility
        
        position = engine._calculate_position_size(signal, capital, volatility)
        
        assert isinstance(position, int)
        assert position > 0  # Long position
        assert position <= engine.backtest_config.position_limit
    
    def test_calculate_position_size_short(self, temp_config_file):
        """Test position size calculation for short signals"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        signal = -1.0  # Short signal
        capital = 100000
        volatility = 0.02
        
        position = engine._calculate_position_size(signal, capital, volatility)
        
        assert isinstance(position, int)
        assert position < 0  # Short position
        assert abs(position) <= engine.backtest_config.position_limit
    
    def test_calculate_position_size_zero_volatility(self, temp_config_file):
        """Test position size calculation with zero volatility"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        signal = 1.0
        capital = 100000
        volatility = 0.0  # Zero volatility
        
        position = engine._calculate_position_size(signal, capital, volatility)
        
        # Should handle zero volatility gracefully
        assert isinstance(position, int)
        assert position != 0  # Should still calculate some position
    
    def test_calculate_position_size_infinite_volatility(self, temp_config_file):
        """Test position size calculation with infinite volatility"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        signal = 1.0
        capital = 100000
        volatility = np.inf  # Infinite volatility
        
        position = engine._calculate_position_size(signal, capital, volatility)
        
        # Should handle infinite volatility gracefully
        assert isinstance(position, int)
        assert np.isfinite(position)
    
    def test_apply_risk_filters(self, temp_config_file):
        """Test risk filtering functionality"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        # Test normal conditions
        signal = 1.0
        features = {
            'realized_vol': 0.15,  # Normal volatility
            'time_to_close': 60,   # 1 hour to close
            'is_event_day': False
        }
        
        filtered_signal = engine._apply_risk_filters(signal, features)
        assert filtered_signal == signal  # Should pass through unchanged
        
        # Test high volatility filter
        features['realized_vol'] = 0.50  # Very high volatility
        filtered_signal = engine._apply_risk_filters(signal, features)
        assert abs(filtered_signal) < abs(signal)  # Should be reduced
        
        # Test near close filter
        features['realized_vol'] = 0.15  # Reset volatility
        features['time_to_close'] = 5  # 5 minutes to close
        filtered_signal = engine._apply_risk_filters(signal, features)
        assert filtered_signal == 0  # Should be zeroed out
    
    def test_execute_trade(self, temp_config_file):
        """Test trade execution"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        timestamp = datetime.now()
        row = pd.Series({
            'close': 4000.0,
            'volume': 1000,
            'spread_bps': 2.0
        })
        
        current_position = 0
        target_position = 2
        capital = 100000
        entry_prices = {}
        
        trade = engine._execute_trade(
            timestamp, row, current_position, target_position, capital, entry_prices
        )
        
        assert trade['timestamp'] == timestamp
        assert trade['side'] == 'buy'
        assert trade['quantity'] == 2
        assert trade['price'] == 4000.0
        assert 'commission' in trade
        assert 'slippage' in trade
    
    def test_execute_trade_close_position(self, temp_config_file):
        """Test closing a position"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        timestamp = datetime.now()
        row = pd.Series({'close': 4100.0, 'volume': 1000, 'spread_bps': 2.0})
        
        current_position = 2  # Long 2 contracts
        target_position = 0   # Close position
        capital = 100000
        entry_prices = {2: 4000.0}  # Entry at 4000
        
        trade = engine._execute_trade(
            timestamp, row, current_position, target_position, capital, entry_prices
        )
        
        assert trade['side'] == 'sell'
        assert trade['quantity'] == 2
        assert 'pnl' in trade
        assert trade['pnl'] > 0  # Profitable trade (4100 - 4000) * 2 * 50 - commission
    
    def test_calculate_metrics(self, temp_config_file):
        """Test metrics calculation"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        # Create sample trades
        trades = [
            {
                'timestamp': datetime.now() - timedelta(days=5),
                'side': 'buy',
                'quantity': 2,
                'price': 4000.0,
                'pnl': None,
                'commission': 4.50
            },
            {
                'timestamp': datetime.now() - timedelta(days=3),
                'side': 'sell',
                'quantity': 2,
                'price': 4100.0,
                'pnl': 9995.50,  # (4100-4000)*2*50 - 4.50 commission
                'commission': 4.50
            }
        ]
        
        equity_curve = [100000, 100000, 109995.50]
        
        metrics = engine._calculate_metrics(trades, equity_curve)
        
        assert 'total_return' in metrics
        assert 'sharpe_ratio' in metrics
        assert 'max_drawdown' in metrics
        assert 'win_rate' in metrics
        assert 'profit_factor' in metrics
        assert 'num_trades' in metrics
        
        assert metrics['total_return'] > 0  # Profitable
        assert metrics['num_trades'] == 1  # One round-trip trade
    
    def test_run_backtest_integration(self, temp_config_file, sample_price_data):
        """Test complete backtest run"""
        engine = UltimateBacktestEngine(temp_config_file)
        strategy = MockStrategy()
        
        # Run backtest
        results = engine.run_backtest(strategy, sample_price_data)
        
        assert 'trades' in results
        assert 'equity_curve' in results
        assert 'metrics' in results
        assert 'final_capital' in results
        
        # Check metrics are calculated
        metrics = results['metrics']
        assert 'total_return' in metrics
        assert 'sharpe_ratio' in metrics
        assert 'max_drawdown' in metrics
        
        # Check final capital is different from initial (trades occurred)
        assert results['final_capital'] != engine.backtest_config.initial_capital
    
    def test_add_microstructure_features(self, temp_config_file, sample_orderbook_data):
        """Test microstructure feature engineering"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        enhanced_data = engine._add_microstructure_features(sample_orderbook_data)
        
        # Check that new features were added
        expected_features = [
            'book_imbalance', 'weighted_mid', 'microprice',
            'book_pressure', 'effective_spread', 'price_impact'
        ]
        
        for feature in expected_features:
            assert feature in enhanced_data.columns
            assert not enhanced_data[feature].isnull().all()  # Should have values
    
    def test_calculate_realized_volatility(self, temp_config_file, sample_price_data):
        """Test realized volatility calculation"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        vol_data = engine._calculate_realized_volatility(sample_price_data)
        
        assert 'returns' in vol_data.columns
        assert 'realized_vol' in vol_data.columns
        
        # Check volatility is reasonable
        vol_values = vol_data['realized_vol'].dropna()
        assert (vol_values >= 0).all()  # Non-negative
        assert (vol_values < 1.0).all()  # Less than 100%
    
    def test_calculate_time_to_close(self, temp_config_file, sample_price_data):
        """Test time to close calculation"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        timestamps = sample_price_data['timestamp']
        time_to_close = engine._calculate_time_to_close(timestamps)
        
        assert len(time_to_close) == len(timestamps)
        assert (time_to_close >= 0).all()  # Non-negative
        assert (time_to_close <= 24 * 60).all()  # Less than 24 hours
    
    def test_error_handling_invalid_strategy(self, temp_config_file, sample_price_data):
        """Test error handling with invalid strategy"""
        engine = UltimateBacktestEngine(temp_config_file)
        
        # Create strategy that raises exception
        class BadStrategy(BaseStrategy):
            def get_default_parameters(self):
                return {}
            
            def generate_signal(self, features):
                raise ValueError("Strategy error")
        
        bad_strategy = BadStrategy()
        
        # Should handle strategy errors gracefully
        with pytest.raises(ValueError):
            engine.run_backtest(bad_strategy, sample_price_data)
    
    def test_empty_data_handling(self, temp_config_file):
        """Test handling of empty data"""
        engine = UltimateBacktestEngine(temp_config_file)
        strategy = MockStrategy()
        
        empty_data = pd.DataFrame()
        
        # Should handle empty data gracefully
        results = engine.run_backtest(strategy, empty_data)
        
        assert results['final_capital'] == engine.backtest_config.initial_capital
        assert len(results['trades']) == 0
        assert len(results['equity_curve']) == 1  # Just initial capital


class TestBacktestEngineIntegration:
    """Integration tests for backtest engine"""
    
    def test_full_backtest_workflow(self, temp_config_file, sample_price_data, sample_orderbook_data):
        """Test complete backtest workflow with all features"""
        engine = UltimateBacktestEngine(temp_config_file)
        strategy = MockStrategy()
        
        # Add microstructure features to price data
        enhanced_data = sample_price_data.copy()
        enhanced_data['bid_price_0'] = enhanced_data['close'] - 0.25
        enhanced_data['ask_price_0'] = enhanced_data['close'] + 0.25
        enhanced_data['bid_size_0'] = 100
        enhanced_data['ask_size_0'] = 100
        
        # Run complete backtest
        results = engine.run_backtest(strategy, enhanced_data)
        
        # Verify comprehensive results
        assert 'trades' in results
        assert 'equity_curve' in results
        assert 'metrics' in results
        assert 'final_capital' in results
        
        # Check that trades were executed
        if len(results['trades']) > 0:
            trade = results['trades'][0]
            assert 'timestamp' in trade
            assert 'side' in trade
            assert 'quantity' in trade
            assert 'price' in trade
            assert 'commission' in trade
        
        # Check metrics are comprehensive
        metrics = results['metrics']
        required_metrics = [
            'total_return', 'sharpe_ratio', 'max_drawdown',
            'win_rate', 'profit_factor', 'num_trades'
        ]
        
        for metric in required_metrics:
            assert metric in metrics
            assert isinstance(metrics[metric], (int, float))
    
    def test_performance_with_large_dataset(self, temp_config_file):
        """Test performance with larger dataset"""
        engine = UltimateBacktestEngine(temp_config_file)
        strategy = MockStrategy()
        
        # Create larger dataset (10,000 rows)
        dates = pd.date_range('2023-01-01', periods=10000, freq='1min')
        np.random.seed(42)
        returns = np.random.normal(0, 0.001, len(dates))
        prices = 4000 * np.exp(np.cumsum(returns))
        
        large_data = pd.DataFrame({
            'timestamp': dates,
            'open': prices,
            'high': prices * 1.001,
            'low': prices * 0.999,
            'close': prices,
            'volume': np.random.randint(100, 10000, len(dates))
        })
        
        # Measure execution time
        import time
        start_time = time.time()
        
        results = engine.run_backtest(strategy, large_data)
        
        execution_time = time.time() - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        assert execution_time < 30.0  # 30 seconds max
        
        # Should produce valid results
        assert 'metrics' in results
        assert results['final_capital'] != engine.backtest_config.initial_capital