"""
NinjaTrader Live Trading Integration for Enterprise Quantitative Backtesting

This module provides comprehensive integration with NinjaTrader for:
- Real-time data streaming and market data
- Paper trading simulation accounts
- Live trading with real accounts
- Order execution and management
- Risk management integration
- Performance tracking and analytics
"""

import pandas as pd
import numpy as np
import json
import time
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
import queue
import asyncio
from abc import ABC, abstractmethod
import warnings
warnings.filterwarnings('ignore')

from ..strategies import BaseStrategy
from ..risk_management import RiskEngineManager
from ..core.error_handling import ErrorHandler, BacktestException

logger = logging.getLogger(__name__)


class AccountType(Enum):
    """Account types"""
    SIMULATION = "simulation"
    PAPER = "paper"
    LIVE = "live"


class OrderType(Enum):
    """Order types"""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderSide(Enum):
    """Order sides"""
    BUY = "buy"
    SELL = "sell"


class OrderStatus(Enum):
    """Order status"""
    PENDING = "pending"
    SUBMITTED = "submitted"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


@dataclass
class MarketData:
    """Real-time market data"""
    symbol: str
    timestamp: datetime
    bid: float
    ask: float
    last: float
    volume: int
    bid_size: int
    ask_size: int
    high: float
    low: float
    open: float
    close: float
    spread: float
    spread_bps: float


@dataclass
class Order:
    """Trading order"""
    order_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: int
    price: Optional[float] = None
    stop_price: Optional[float] = None
    limit_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: int = 0
    filled_price: Optional[float] = None
    commission: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    strategy_id: str = ""
    notes: str = ""


@dataclass
class Position:
    """Trading position"""
    symbol: str
    quantity: int
    avg_price: float
    market_value: float
    unrealized_pnl: float
    realized_pnl: float
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class AccountInfo:
    """Account information"""
    account_id: str
    account_type: AccountType
    balance: float
    equity: float
    margin_used: float
    margin_available: float
    unrealized_pnl: float
    realized_pnl: float
    positions: Dict[str, Position] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


class NinjaTraderConnector:
    """
    NinjaTrader integration connector
    """
    
    def __init__(
        self,
        account_type: AccountType = AccountType.SIMULATION,
        symbols: List[str] = None,
        risk_limits: Dict[str, Any] = None,
        config: Dict[str, Any] = None
    ):
        """
        Initialize NinjaTrader connector
        
        Args:
            account_type: Type of account (simulation/paper/live)
            symbols: List of symbols to trade
            risk_limits: Risk management limits
            config: Additional configuration
        """
        self.account_type = account_type
        self.symbols = symbols or ["ES", "NQ", "RTY"]
        self.risk_limits = risk_limits or {}
        self.config = config or {}
        
        # Initialize components
        self.error_handler = ErrorHandler()
        self.risk_manager = RiskEngineManager()
        
        # Data and order queues
        self.market_data_queue = queue.Queue()
        self.order_queue = queue.Queue()
        self.execution_queue = queue.Queue()
        
        # State management
        self.is_connected = False
        self.is_trading = False
        self.emergency_stop_active = False
        self.emergency_stop_threshold = self.risk_limits.get('emergency_stop', 0.20)
        
        # Callbacks
        self.on_tick_callbacks: List[Callable] = []
        self.on_order_fill_callbacks: List[Callable] = []
        self.on_risk_alert_callbacks: List[Callable] = []
        
        # Performance tracking
        self.performance_tracker = LivePerformanceTracker()
        
        # Initialize NinjaTrader connection
        self._initialize_ninjatrader()
        
        logger.info(f"NinjaTrader connector initialized for {account_type.value} account")
    
    def _initialize_ninjatrader(self):
        """Initialize NinjaTrader connection"""
        try:
            # This would be the actual NinjaTrader API initialization
            # For now, we'll create a mock implementation
            
            if self.account_type == AccountType.LIVE:
                logger.warning("LIVE TRADING MODE - Real money will be at risk!")
                self._setup_live_trading_safeguards()
            
            # Initialize market data streams
            self._setup_market_data_streams()
            
            # Initialize order management
            self._setup_order_management()
            
            # Initialize risk monitoring
            self._setup_risk_monitoring()
            
            self.is_connected = True
            logger.info("NinjaTrader connection established")
            
        except Exception as e:
            self.error_handler.handle_exception(e, "NinjaTrader initialization failed")
            raise
    
    def _setup_live_trading_safeguards(self):
        """Setup safeguards for live trading"""
        # Additional safety checks for live trading
        if not self.config.get('live_trading_confirmed', False):
            raise BacktestException("Live trading not confirmed. Set live_trading_confirmed=True")
        
        # Verify account balance
        min_balance = self.config.get('min_account_balance', 10000)
        if self.get_account_info().balance < min_balance:
            raise BacktestException(f"Account balance below minimum: {min_balance}")
        
        # Setup emergency stop
        self.emergency_stop_threshold = self.risk_limits.get('emergency_stop', 0.15)
        logger.info(f"Emergency stop set at {self.emergency_stop_threshold:.1%} drawdown")
    
    def _setup_market_data_streams(self):
        """Setup real-time market data streams"""
        # Start market data threads for each symbol
        for symbol in self.symbols:
            thread = threading.Thread(
                target=self._market_data_stream,
                args=(symbol,),
                daemon=True
            )
            thread.start()
        
        logger.info(f"Market data streams started for {len(self.symbols)} symbols")
    
    def _setup_order_management(self):
        """Setup order management system"""
        # Start order processing thread
        self.order_thread = threading.Thread(
            target=self._process_orders,
            daemon=True
        )
        self.order_thread.start()
        
        logger.info("Order management system initialized")
    
    def _setup_risk_monitoring(self):
        """Setup real-time risk monitoring"""
        # Start risk monitoring thread
        self.risk_thread = threading.Thread(
            target=self._monitor_risk,
            daemon=True
        )
        self.risk_thread.start()
        
        logger.info("Risk monitoring system initialized")
    
    def _market_data_stream(self, symbol: str):
        """Real-time market data stream for a symbol"""
        while self.is_connected:
            try:
                # Get real-time market data from NinjaTrader
                market_data = self._get_ninjatrader_market_data(symbol)
                
                # Put data in queue
                self.market_data_queue.put(market_data)
                
                # Trigger callbacks
                for callback in self.on_tick_callbacks:
                    try:
                        callback(market_data)
                    except Exception as e:
                        self.error_handler.handle_exception(e, f"Tick callback error for {symbol}")
                
                time.sleep(0.001)  # 1ms delay
                
            except Exception as e:
                self.error_handler.handle_exception(e, f"Market data stream error for {symbol}")
                time.sleep(1)
    
    def _get_ninjatrader_market_data(self, symbol: str) -> MarketData:
        """Get real-time market data from NinjaTrader"""
        # This would be the actual NinjaTrader API call
        # For now, generate realistic mock data
        
        # Simulate realistic market data
        base_price = 4500 if symbol == "ES" else 15000 if symbol == "NQ" else 2000
        
        # Add some realistic price movement
        price_change = np.random.normal(0, 0.001)  # 0.1% volatility
        current_price = base_price * (1 + price_change)
        
        # Calculate bid/ask spread
        spread_bps = np.random.uniform(0.5, 2.0)  # 0.5-2.0 bps spread
        spread = current_price * spread_bps / 10000
        
        bid = current_price - spread / 2
        ask = current_price + spread / 2
        
        return MarketData(
            symbol=symbol,
            timestamp=datetime.now(),
            bid=bid,
            ask=ask,
            last=current_price,
            volume=np.random.randint(100, 1000),
            bid_size=np.random.randint(1, 50),
            ask_size=np.random.randint(1, 50),
            high=current_price * 1.001,
            low=current_price * 0.999,
            open=current_price * 0.9995,
            close=current_price,
            spread=spread,
            spread_bps=spread_bps
        )
    
    def _process_orders(self):
        """Process order queue"""
        while self.is_connected:
            try:
                if not self.order_queue.empty():
                    order = self.order_queue.get()
                    
                    # Execute order through NinjaTrader
                    execution = self._execute_order(order)
                    
                    # Put execution in queue
                    self.execution_queue.put(execution)
                    
                    # Trigger callbacks
                    for callback in self.on_order_fill_callbacks:
                        try:
                            callback(execution)
                        except Exception as e:
                            self.error_handler.handle_exception(e, "Order fill callback error")
                
                time.sleep(0.001)  # 1ms delay
                
            except Exception as e:
                self.error_handler.handle_exception(e, "Order processing error")
                time.sleep(1)
    
    def _execute_order(self, order: Order) -> Dict[str, Any]:
        """Execute order through NinjaTrader"""
        # This would be the actual NinjaTrader order execution
        # For now, simulate order execution
        
        # Simulate execution delay
        time.sleep(0.01)  # 10ms execution delay
        
        # Simulate fill
        fill_price = order.price or (order.bid_price if order.side == OrderSide.BUY else order.ask_price)
        
        # Update order status
        order.status = OrderStatus.FILLED
        order.filled_quantity = order.quantity
        order.filled_price = fill_price
        order.commission = self._calculate_commission(order)
        
        execution = {
            'order_id': order.order_id,
            'symbol': order.symbol,
            'side': order.side.value,
            'quantity': order.quantity,
            'fill_price': fill_price,
            'commission': order.commission,
            'timestamp': datetime.now(),
            'strategy_id': order.strategy_id
        }
        
        logger.info(f"Order executed: {order.symbol} {order.side.value} {order.quantity} @ {fill_price}")
        
        return execution
    
    def _calculate_commission(self, order: Order) -> float:
        """Calculate commission for order"""
        # Simulate realistic commission structure
        base_commission = 2.50  # Base commission per contract
        per_contract = 0.50    # Additional per contract
        
        return base_commission + (order.quantity * per_contract)
    
    def _monitor_risk(self):
        """Monitor risk in real-time"""
        while self.is_connected:
            try:
                # Get current account info
                account_info = self.get_account_info()
                
                # Check risk limits
                risk_alerts = self._check_risk_limits(account_info)
                
                # Handle risk alerts
                for alert in risk_alerts:
                    self._handle_risk_alert(alert)
                
                # Check emergency stop
                if self._check_emergency_stop(account_info):
                    self._activate_emergency_stop()
                
                time.sleep(1)  # Check every second
                
            except Exception as e:
                self.error_handler.handle_exception(e, "Risk monitoring error")
                time.sleep(5)
    
    def _check_risk_limits(self, account_info: AccountInfo) -> List[Dict[str, Any]]:
        """Check risk limits and generate alerts"""
        alerts = []
        
        # Check drawdown limit
        drawdown_limit = self.risk_limits.get('max_drawdown', 0.10)
        current_drawdown = -account_info.unrealized_pnl / account_info.balance
        
        if current_drawdown > drawdown_limit:
            alerts.append({
                'type': 'drawdown_limit',
                'severity': 'high',
                'message': f"Drawdown {current_drawdown:.2%} exceeds limit {drawdown_limit:.2%}",
                'value': current_drawdown,
                'limit': drawdown_limit
            })
        
        # Check daily loss limit
        daily_loss_limit = self.risk_limits.get('max_daily_loss', 1000)
        daily_pnl = self.performance_tracker.get_daily_pnl()
        
        if daily_pnl < -daily_loss_limit:
            alerts.append({
                'type': 'daily_loss_limit',
                'severity': 'critical',
                'message': f"Daily loss ${abs(daily_pnl):.2f} exceeds limit ${daily_loss_limit}",
                'value': daily_pnl,
                'limit': -daily_loss_limit
            })
        
        # Check position size limits
        for symbol, position in account_info.positions.items():
            position_limit = self.risk_limits.get('max_position_size', {}).get(symbol, 10)
            
            if abs(position.quantity) > position_limit:
                alerts.append({
                    'type': 'position_size_limit',
                    'severity': 'medium',
                    'message': f"Position size {position.quantity} exceeds limit {position_limit} for {symbol}",
                    'value': position.quantity,
                    'limit': position_limit,
                    'symbol': symbol
                })
        
        return alerts
    
    def _handle_risk_alert(self, alert: Dict[str, Any]):
        """Handle risk alert"""
        logger.warning(f"RISK ALERT: {alert['message']}")
        
        # Trigger callbacks
        for callback in self.on_risk_alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                self.error_handler.handle_exception(e, "Risk alert callback error")
        
        # Take action based on severity
        if alert['severity'] == 'critical':
            self._activate_emergency_stop()
        elif alert['severity'] == 'high':
            self._reduce_position_sizes()
    
    def _check_emergency_stop(self, account_info: AccountInfo) -> bool:
        """Check if emergency stop should be activated"""
        if self.emergency_stop_active:
            return False
        
        current_drawdown = -account_info.unrealized_pnl / account_info.balance
        return current_drawdown > self.emergency_stop_threshold
    
    def _activate_emergency_stop(self):
        """Activate emergency stop"""
        logger.critical("EMERGENCY STOP ACTIVATED - Closing all positions!")
        
        self.emergency_stop_active = True
        
        # Close all positions
        account_info = self.get_account_info()
        for symbol, position in account_info.positions.items():
            if position.quantity != 0:
                side = OrderSide.SELL if position.quantity > 0 else OrderSide.BUY
                self.place_order(
                    symbol=symbol,
                    side=side,
                    order_type=OrderType.MARKET,
                    quantity=abs(position.quantity),
                    strategy_id="emergency_stop"
                )
        
        # Stop trading
        self.stop_trading()
    
    def _reduce_position_sizes(self):
        """Reduce position sizes due to risk alert"""
        logger.warning("Reducing position sizes due to risk alert")
        
        # Reduce position size limits by 50%
        for symbol in self.symbols:
            current_limit = self.risk_limits.get('max_position_size', {}).get(symbol, 10)
            new_limit = max(1, current_limit // 2)
            self.risk_limits.setdefault('max_position_size', {})[symbol] = new_limit
    
    def enable_paper_trading(self):
        """Enable paper trading mode"""
        self.account_type = AccountType.PAPER
        logger.info("Paper trading mode enabled")
    
    def enable_live_trading(self):
        """Enable live trading mode"""
        if not self.config.get('live_trading_confirmed', False):
            raise BacktestException("Live trading not confirmed. Set live_trading_confirmed=True")
        
        self.account_type = AccountType.LIVE
        logger.warning("LIVE TRADING MODE ENABLED - Real money will be at risk!")
    
    def set_emergency_stop(self, threshold: float):
        """Set emergency stop threshold"""
        self.emergency_stop_threshold = threshold
        logger.info(f"Emergency stop threshold set to {threshold:.1%}")
    
    def start_trading(self):
        """Start live trading"""
        if not self.is_connected:
            raise BacktestException("Not connected to NinjaTrader")
        
        self.is_trading = True
        logger.info("Live trading started")
    
    def stop_trading(self):
        """Stop live trading"""
        self.is_trading = False
        logger.info("Live trading stopped")
    
    def place_order(
        self,
        symbol: str,
        side: OrderSide,
        order_type: OrderType,
        quantity: int,
        price: Optional[float] = None,
        stop_price: Optional[float] = None,
        strategy_id: str = "",
        notes: str = ""
    ) -> str:
        """
        Place a trading order
        
        Args:
            symbol: Trading symbol
            side: Buy or sell
            order_type: Type of order
            quantity: Number of contracts
            price: Limit price (for limit orders)
            stop_price: Stop price (for stop orders)
            strategy_id: Strategy identifier
            notes: Order notes
            
        Returns:
            Order ID
        """
        if not self.is_trading:
            raise BacktestException("Trading not active")
        
        # Generate order ID
        order_id = f"ORD_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Create order
        order = Order(
            order_id=order_id,
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price,
            stop_price=stop_price,
            strategy_id=strategy_id,
            notes=notes
        )
        
        # Add to order queue
        self.order_queue.put(order)
        
        logger.info(f"Order placed: {symbol} {side.value} {quantity} {order_type.value}")
        
        return order_id
    
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an order"""
        # This would cancel the order in NinjaTrader
        # For now, just log it
        logger.info(f"Order cancelled: {order_id}")
        return True
    
    def get_account_info(self) -> AccountInfo:
        """Get current account information"""
        # This would get real account info from NinjaTrader
        # For now, return mock data
        
        # Simulate account balance changes
        base_balance = 100000
        pnl_change = np.random.normal(0, 100)  # Random PnL change
        
        return AccountInfo(
            account_id=f"NT_{self.account_type.value}",
            account_type=self.account_type,
            balance=base_balance,
            equity=base_balance + pnl_change,
            margin_used=0,
            margin_available=base_balance,
            unrealized_pnl=pnl_change,
            realized_pnl=0,
            positions={},  # Would get real positions
            timestamp=datetime.now()
        )
    
    def get_positions(self) -> Dict[str, Position]:
        """Get current positions"""
        # This would get real positions from NinjaTrader
        # For now, return empty dict
        return {}
    
    def get_market_data(self, symbol: str) -> Optional[MarketData]:
        """Get latest market data for symbol"""
        # Get from queue if available
        try:
            while not self.market_data_queue.empty():
                data = self.market_data_queue.get_nowait()
                if data.symbol == symbol:
                    return data
        except queue.Empty:
            pass
        
        return None
    
    def on_tick(self, callback: Callable):
        """Register tick callback"""
        self.on_tick_callbacks.append(callback)
    
    def on_order_fill(self, callback: Callable):
        """Register order fill callback"""
        self.on_order_fill_callbacks.append(callback)
    
    def on_risk_alert(self, callback: Callable):
        """Register risk alert callback"""
        self.on_risk_alert_callbacks.append(callback)
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        return self.performance_tracker.get_summary()
    
    def disconnect(self):
        """Disconnect from NinjaTrader"""
        self.is_connected = False
        self.is_trading = False
        logger.info("Disconnected from NinjaTrader")


class LivePerformanceTracker:
    """Track live trading performance"""
    
    def __init__(self):
        self.trades = []
        self.daily_pnl = {}
        self.start_time = datetime.now()
    
    def record_trade(self, execution: Dict[str, Any]):
        """Record a trade execution"""
        self.trades.append(execution)
        
        # Update daily PnL
        date = execution['timestamp'].date()
        if date not in self.daily_pnl:
            self.daily_pnl[date] = 0
        
        # Calculate trade PnL (simplified)
        pnl = execution.get('pnl', 0)
        self.daily_pnl[date] += pnl
    
    def get_daily_pnl(self) -> float:
        """Get today's PnL"""
        today = datetime.now().date()
        return self.daily_pnl.get(today, 0)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        if not self.trades:
            return {}
        
        total_trades = len(self.trades)
        winning_trades = len([t for t in self.trades if t.get('pnl', 0) > 0])
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        total_pnl = sum(t.get('pnl', 0) for t in self.trades)
        total_commission = sum(t.get('commission', 0) for t in self.trades)
        net_pnl = total_pnl - total_commission
        
        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'total_commission': total_commission,
            'net_pnl': net_pnl,
            'trading_duration': datetime.now() - self.start_time
        }


class LiveTradingManager:
    """
    High-level live trading manager
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.connectors: Dict[str, NinjaTraderConnector] = {}
        self.strategies: Dict[str, BaseStrategy] = {}
        self.risk_manager = RiskEngineManager()
    
    def add_connector(
        self,
        name: str,
        account_type: AccountType,
        symbols: List[str],
        risk_limits: Dict[str, Any]
    ) -> NinjaTraderConnector:
        """Add a trading connector"""
        connector = NinjaTraderConnector(
            account_type=account_type,
            symbols=symbols,
            risk_limits=risk_limits,
            config=self.config
        )
        
        self.connectors[name] = connector
        return connector
    
    def add_strategy(self, name: str, strategy: BaseStrategy):
        """Add a trading strategy"""
        self.strategies[name] = strategy
    
    def start_strategy(
        self,
        strategy_name: str,
        connector_name: str,
        symbols: List[str]
    ):
        """Start a strategy on a connector"""
        if strategy_name not in self.strategies:
            raise ValueError(f"Strategy {strategy_name} not found")
        
        if connector_name not in self.connectors:
            raise ValueError(f"Connector {connector_name} not found")
        
        strategy = self.strategies[strategy_name]
        connector = self.connectors[connector_name]
        
        # Setup strategy callbacks
        def on_tick(market_data: MarketData):
            if market_data.symbol in symbols:
                # Generate signal
                signal = strategy.generate_signal(market_data)
                
                # Execute if signal exists
                if signal != 0:
                    side = OrderSide.BUY if signal > 0 else OrderSide.SELL
                    quantity = abs(signal)
                    
                    connector.place_order(
                        symbol=market_data.symbol,
                        side=side,
                        order_type=OrderType.MARKET,
                        quantity=quantity,
                        strategy_id=strategy_name
                    )
        
        connector.on_tick(on_tick)
        
        logger.info(f"Strategy {strategy_name} started on {connector_name}")
    
    def stop_strategy(self, strategy_name: str, connector_name: str):
        """Stop a strategy"""
        if connector_name in self.connectors:
            self.connectors[connector_name].stop_trading()
            logger.info(f"Strategy {strategy_name} stopped on {connector_name}")
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for all connectors"""
        summary = {}
        
        for name, connector in self.connectors.items():
            summary[name] = connector.get_performance_summary()
        
        return summary
    
    def shutdown(self):
        """Shutdown all connectors"""
        for name, connector in self.connectors.items():
            connector.disconnect()
        
        logger.info("Live trading manager shutdown complete")
