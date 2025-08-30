"""
Backtesting Engine for Enterprise Quantitative Backtesting

This module provides a comprehensive backtesting engine that handles strategy execution,
position management, performance tracking, and transaction costs.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import logging
from datetime import datetime, timedelta

from .base_strategy import BaseStrategy
from .position_manager import PositionManager, PositionType, PositionState
from ..risk_management.portfolio_risk_manager import PortfolioRiskManager, RiskMetrics
from ..data_processing.data_quality_engine import DataQualityEngine
from ..data_connectors.base_connector import AssetClass, DataType

logger = logging.getLogger(__name__)


class BacktestMode(Enum):
    """Backtesting modes"""
    SIMPLE = "simple"  # Basic backtesting without transaction costs
    REALISTIC = "realistic"  # Realistic backtesting with transaction costs
    STRESS = "stress"  # Stress testing with extreme conditions


@dataclass
class BacktestConfig:
    """Configuration for backtesting"""
    initial_capital: float = 1000000.0
    transaction_cost_bps: float = 5.0  # 5 basis points
    slippage_bps: float = 2.0  # 2 basis points
    max_position_size: float = 0.1  # 10% of portfolio
    rebalance_frequency: str = "daily"  # daily, weekly, monthly
    benchmark_symbol: Optional[str] = None
    risk_free_rate: float = 0.02  # 2% annual
    mode: BacktestMode = BacktestMode.REALISTIC
    enable_shorting: bool = True
    max_leverage: float = 2.0
    stop_loss_pct: Optional[float] = None
    take_profit_pct: Optional[float] = None
    data_quality_checks: bool = True
    risk_monitoring: bool = True


@dataclass
class Trade:
    """Individual trade record"""
    timestamp: datetime
    symbol: str
    side: str  # 'buy' or 'sell'
    quantity: float
    price: float
    value: float
    transaction_cost: float
    slippage: float
    strategy_name: str
    signal_strength: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BacktestResult:
    """Results from backtesting"""
    # Performance metrics
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    calmar_ratio: float
    
    # Trading statistics
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    avg_win: float
    avg_loss: float
    profit_factor: float
    
    # Portfolio metrics
    final_value: float
    peak_value: float
    final_positions: Dict[str, float]
    
    # Risk metrics
    var_95: float
    expected_shortfall: float
    beta: float
    
    # Detailed data
    equity_curve: pd.Series
    trades: List[Trade]
    positions_history: pd.DataFrame
    risk_metrics_history: pd.DataFrame
    
    # Configuration
    config: BacktestConfig
    strategy_name: str
    start_date: datetime
    end_date: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'total_return': self.total_return,
            'annualized_return': self.annualized_return,
            'volatility': self.volatility,
            'sharpe_ratio': self.sharpe_ratio,
            'sortino_ratio': self.sortino_ratio,
            'max_drawdown': self.max_drawdown,
            'calmar_ratio': self.calmar_ratio,
            'total_trades': self.total_trades,
            'winning_trades': self.winning_trades,
            'losing_trades': self.losing_trades,
            'win_rate': self.win_rate,
            'avg_win': self.avg_win,
            'avg_loss': self.avg_loss,
            'profit_factor': self.profit_factor,
            'final_value': self.final_value,
            'peak_value': self.peak_value,
            'var_95': self.var_95,
            'expected_shortfall': self.expected_shortfall,
            'beta': self.beta,
            'strategy_name': self.strategy_name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat()
        }


class BacktestingEngine:
    """
    Comprehensive backtesting engine for quantitative strategies
    """
    
    def __init__(self, config: BacktestConfig):
        """
        Initialize backtesting engine
        
        Args:
            config: Backtesting configuration
        """
        self.config = config
        self.position_manager = PositionManager(
            max_position_size=config.max_position_size,
            max_leverage=config.max_leverage,
            enable_shorting=config.enable_shorting
        )
        
        # Initialize risk manager with a minimal config to satisfy constructor
        self.risk_manager = PortfolioRiskManager({'risk_limits': {}}) if config.risk_monitoring else None
        # Initialize data quality engine with a minimal default config
        self.data_quality_engine = DataQualityEngine({'outlier_method': 'combined'}) if config.data_quality_checks else None
        
        # State variables
        self.current_capital = config.initial_capital
        self.peak_capital = config.initial_capital
        self.equity_curve = []
        self.trades = []
        self.positions_history = []
        self.risk_metrics_history = []
        
        # Performance tracking
        self.daily_returns = []
        self.daily_values = []
        self.daily_dates = []
        
        logger.info(f"Initialized backtesting engine with capital: ${config.initial_capital:,.2f}")
    
    def run_backtest(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> BacktestResult:
        """
        Run backtest for a strategy
        
        Args:
            strategy: Trading strategy to test
            data: Market data (OHLCV + features)
            benchmark_data: Optional benchmark data
            
        Returns:
            Backtest results
        """
        logger.info(f"Starting backtest for strategy: {strategy.__class__.__name__}")
        
        # Reset state
        self._reset_state()
        
        # Data quality checks
        if self.data_quality_engine:
            data = self._apply_data_quality_checks(data)
        
        # Prepare data
        data = self._prepare_data(data)
        
        # Main backtesting loop
        for i, (timestamp, row) in enumerate(data.iterrows()):
            try:
                self._process_timestep(strategy, timestamp, row, benchmark_data)
            except Exception as e:
                logger.error(f"Error processing timestep {timestamp}: {e}")
                continue
        
        # Calculate final results
        result = self._calculate_results(strategy, data.index[0], data.index[-1])
        
        logger.info(f"Backtest completed. Final return: {result.total_return:.2%}")
        return result
    
    def _reset_state(self):
        """Reset engine state for new backtest"""
        self.current_capital = self.config.initial_capital
        self.peak_capital = self.config.initial_capital
        self.equity_curve = []
        self.trades = []
        self.positions_history = []
        self.risk_metrics_history = []
        self.daily_returns = []
        self.daily_values = []
        self.daily_dates = []
        
        self.position_manager.reset()
        if self.risk_manager:
            self.risk_manager.reset()
    
    def _apply_data_quality_checks(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply data quality checks"""
        try:
            cleaned, report = self.data_quality_engine.validate_and_clean_data(
                data,
                symbol='MAIN',
                asset_class=AssetClass.EQUITY,
                data_type=DataType.OHLCV,
            )
            return cleaned
        except Exception as e:
            logger.warning(f"Data quality engine failed, proceeding with raw data: {e}")
            return data
    
    def _prepare_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare data for backtesting"""
        # Ensure required columns exist
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Required column '{col}' not found in data")
        
        # Sort by timestamp
        data = data.sort_index()
        
        # Add derived features
        data['returns'] = data['close'].pct_change()
        data['volatility'] = data['returns'].rolling(20).std()
        
        return data
    
    def _process_timestep(
        self,
        strategy: BaseStrategy,
        timestamp: datetime,
        row: pd.Series,
        benchmark_data: Optional[pd.DataFrame]
    ):
        """Process a single timestep"""
        # Update position manager with current prices
        current_prices = {col: row[col] for col in ['open', 'high', 'low', 'close']}
        self.position_manager.update_prices(current_prices)
        
        # Generate strategy signal
        features = self._extract_features(row)
        signal = strategy.generate_signal(features)
        
        # Execute trades based on signal
        if abs(signal) > 0.01:  # Minimum signal threshold
            self._execute_trades(strategy, timestamp, row, signal)
        
        # Update risk metrics
        if self.risk_manager:
            self._update_risk_metrics(timestamp, row, benchmark_data)
        
        # Record daily metrics
        self._record_daily_metrics(timestamp)
    
    def _extract_features(self, row: pd.Series) -> Dict[str, Any]:
        """Extract features for strategy signal generation"""
        features = {}
        
        # Price features
        features['close'] = row['close']
        features['open'] = row['open']
        features['high'] = row['high']
        features['low'] = row['low']
        features['volume'] = row['volume']
        
        # Derived features
        if 'returns' in row:
            features['returns'] = row['returns']
        if 'volatility' in row:
            features['volatility'] = row['volatility']
        
        # Add any other features present in the data
        for col in row.index:
            if col not in ['open', 'high', 'low', 'close', 'volume', 'returns', 'volatility']:
                features[col] = row[col]
        
        return features
    
    def _execute_trades(
        self,
        strategy: BaseStrategy,
        timestamp: datetime,
        row: pd.Series,
        signal: float
    ):
        """Execute trades based on signal"""
        current_price = row['close']
        
        # Calculate position size based on signal strength
        target_position = signal * self.config.max_position_size * self.current_capital
        
        # Get current positions
        current_positions = self.position_manager.get_positions()
        
        # Calculate required trades
        for symbol, current_pos in current_positions.items():
            target_pos = target_position if symbol == 'main' else 0
            
            if abs(target_pos - current_pos) > 0.01 * self.current_capital:  # Minimum trade size
                # Determine trade side
                if target_pos > current_pos:
                    side = 'buy'
                    quantity = (target_pos - current_pos) / current_price
                else:
                    side = 'sell'
                    quantity = (current_pos - target_pos) / current_price
                
                # Execute trade
                trade = self._execute_trade(
                    strategy, timestamp, symbol, side, quantity, current_price
                )
                
                if trade:
                    self.trades.append(trade)
    
    def _execute_trade(
        self,
        strategy: BaseStrategy,
        timestamp: datetime,
        symbol: str,
        side: str,
        quantity: float,
        price: float
    ) -> Optional[Trade]:
        """Execute a single trade"""
        # Calculate transaction costs
        transaction_cost_bps = self.config.transaction_cost_bps / 10000
        slippage_bps = self.config.slippage_bps / 10000
        
        # Apply slippage
        if side == 'buy':
            execution_price = price * (1 + slippage_bps)
        else:
            execution_price = price * (1 - slippage_bps)
        
        # Calculate costs
        trade_value = quantity * execution_price
        transaction_cost = trade_value * transaction_cost_bps
        
        # Check if we have enough capital
        if side == 'buy' and trade_value + transaction_cost > self.current_capital:
            logger.warning(f"Insufficient capital for trade: {trade_value + transaction_cost}")
            return None
        
        # Update capital
        if side == 'buy':
            self.current_capital -= (trade_value + transaction_cost)
        else:
            self.current_capital += (trade_value - transaction_cost)
        
        # Update position manager
        self.position_manager.update_position(symbol, quantity if side == 'buy' else -quantity)
        
        # Create trade record
        trade = Trade(
            timestamp=timestamp,
            symbol=symbol,
            side=side,
            quantity=quantity,
            price=execution_price,
            value=trade_value,
            transaction_cost=transaction_cost,
            slippage=abs(execution_price - price),
            strategy_name=strategy.__class__.__name__,
            signal_strength=1.0 if side == 'buy' else -1.0
        )
        
        return trade
    
    def _update_risk_metrics(
        self,
        timestamp: datetime,
        row: pd.Series,
        benchmark_data: Optional[pd.DataFrame]
    ):
        """Update risk metrics"""
        # Get current portfolio state
        positions = self.position_manager.get_positions()
        portfolio_value = self.current_capital + sum(positions.values())

        # Build a trivial returns series for risk calculations
        if len(self.daily_values) >= 2:
            returns_series = pd.Series(self.daily_returns, index=self.daily_dates)
        else:
            returns_series = pd.Series([0.0, 0.0])

        # Update risk manager with minimal required data
        self.risk_manager.update_portfolio_data(portfolio_returns=returns_series)

        # Calculate risk metrics
        risk_metrics = self.risk_manager.calculate_risk_metrics(portfolio_value=portfolio_value)
        
        # Store risk metrics
        self.risk_metrics_history.append({
            'timestamp': timestamp,
            **risk_metrics.__dict__
        })
    
    def _record_daily_metrics(self, timestamp: datetime):
        """Record daily performance metrics"""
        # Calculate current portfolio value
        positions = self.position_manager.get_positions()
        portfolio_value = self.current_capital + sum(positions.values())
        
        # Update peak capital
        self.peak_capital = max(self.peak_capital, portfolio_value)
        
        # Store daily metrics
        self.daily_values.append(portfolio_value)
        self.daily_dates.append(timestamp)
        
        # Calculate daily return
        if len(self.daily_values) > 1:
            daily_return = (portfolio_value - self.daily_values[-2]) / self.daily_values[-2]
            self.daily_returns.append(daily_return)
        else:
            self.daily_returns.append(0.0)
        
        # Store equity curve
        self.equity_curve.append(portfolio_value)
    
    def _calculate_results(
        self,
        strategy: BaseStrategy,
        start_date: datetime,
        end_date: datetime
    ) -> BacktestResult:
        """Calculate final backtest results"""
        # Convert lists to pandas Series
        equity_series = pd.Series(self.equity_curve, index=self.daily_dates)
        # Align returns with dates; include the first 0.0 return for consistency
        returns_series = pd.Series(self.daily_returns, index=self.daily_dates)
        
        # Calculate performance metrics
        total_return = (equity_series.iloc[-1] - self.config.initial_capital) / self.config.initial_capital
        annualized_return = self._calculate_annualized_return(equity_series)
        volatility = returns_series.std() * np.sqrt(252) if len(returns_series) > 0 else 0
        
        # Risk-adjusted ratios
        sharpe_ratio = self._calculate_sharpe_ratio(returns_series)
        sortino_ratio = self._calculate_sortino_ratio(returns_series)
        max_drawdown = self._calculate_max_drawdown(equity_series)
        calmar_ratio = annualized_return / max_drawdown if max_drawdown > 0 else 0
        
        # Trading statistics
        winning_trades = [t for t in self.trades if t.value > 0]
        losing_trades = [t for t in self.trades if t.value < 0]
        
        total_trades = len(self.trades)
        win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
        
        avg_win = np.mean([t.value for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t.value for t in losing_trades]) if losing_trades else 0
        profit_factor = abs(avg_win / avg_loss) if avg_loss != 0 else 0
        
        # Risk metrics
        var_95 = np.percentile(returns_series, 5) if len(returns_series) > 0 else 0
        expected_shortfall = returns_series[returns_series <= var_95].mean() if len(returns_series) > 0 else 0
        beta = 1.0  # Placeholder - would need benchmark data
        
        # Create positions history DataFrame
        positions_df = pd.DataFrame(self.positions_history) if self.positions_history else pd.DataFrame()
        risk_metrics_df = pd.DataFrame(self.risk_metrics_history) if self.risk_metrics_history else pd.DataFrame()
        
        return BacktestResult(
            total_return=total_return,
            annualized_return=annualized_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            max_drawdown=max_drawdown,
            calmar_ratio=calmar_ratio,
            total_trades=total_trades,
            winning_trades=len(winning_trades),
            losing_trades=len(losing_trades),
            win_rate=win_rate,
            avg_win=avg_win,
            avg_loss=avg_loss,
            profit_factor=profit_factor,
            final_value=equity_series.iloc[-1],
            peak_value=self.peak_capital,
            final_positions=self.position_manager.get_positions(),
            var_95=var_95,
            expected_shortfall=expected_shortfall,
            beta=beta,
            equity_curve=equity_series,
            trades=self.trades,
            positions_history=positions_df,
            risk_metrics_history=risk_metrics_df,
            config=self.config,
            strategy_name=strategy.__class__.__name__,
            start_date=start_date,
            end_date=end_date
        )
    
    def _calculate_annualized_return(self, equity_series: pd.Series) -> float:
        """Calculate annualized return"""
        if len(equity_series) < 2:
            return 0.0
        
        total_days = (equity_series.index[-1] - equity_series.index[0]).days
        if total_days == 0:
            return 0.0
        
        total_return = (equity_series.iloc[-1] - equity_series.iloc[0]) / equity_series.iloc[0]
        return (1 + total_return) ** (365 / total_days) - 1
    
    def _calculate_sharpe_ratio(self, returns_series: pd.Series) -> float:
        """Calculate Sharpe ratio"""
        if len(returns_series) == 0:
            return 0.0
        
        excess_returns = returns_series - self.config.risk_free_rate / 252
        return excess_returns.mean() / returns_series.std() if returns_series.std() > 0 else 0
    
    def _calculate_sortino_ratio(self, returns_series: pd.Series) -> float:
        """Calculate Sortino ratio"""
        if len(returns_series) == 0:
            return 0.0
        
        excess_returns = returns_series - self.config.risk_free_rate / 252
        downside_returns = excess_returns[excess_returns < 0]
        
        if len(downside_returns) == 0:
            return float('inf') if excess_returns.mean() > 0 else 0
        
        downside_deviation = downside_returns.std()
        return excess_returns.mean() / downside_deviation if downside_deviation > 0 else 0
    
    def _calculate_max_drawdown(self, equity_series: pd.Series) -> float:
        """Calculate maximum drawdown"""
        if len(equity_series) == 0:
            return 0.0
        
        peak = equity_series.expanding().max()
        drawdown = (equity_series - peak) / peak
        return abs(drawdown.min())
