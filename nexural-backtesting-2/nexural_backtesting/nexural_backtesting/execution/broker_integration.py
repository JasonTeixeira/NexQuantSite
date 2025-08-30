"""
Professional Broker Integration - Alpaca Markets
Real-world execution engine for live trading
"""

import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal
import pandas as pd
import numpy as np
from enum import Enum
import asyncio
import json
import os

# Alpaca SDK
try:
    from alpaca_trade_api import REST, Stream
    from alpaca_trade_api.entity import Order, Position, Account
    ALPACA_AVAILABLE = True
except ImportError:
    ALPACA_AVAILABLE = False
    logging.warning("Alpaca SDK not installed. Run: pip install alpaca-trade-api")

logger = logging.getLogger(__name__)

class OrderType(Enum):
    """Order types"""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"
    TRAILING_STOP = "trailing_stop"

class OrderSide(Enum):
    """Order sides"""
    BUY = "buy"
    SELL = "sell"

class OrderStatus(Enum):
    """Order status"""
    NEW = "new"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELED = "canceled"
    EXPIRED = "expired"
    REJECTED = "rejected"
    PENDING_NEW = "pending_new"
    PENDING_CANCEL = "pending_cancel"

class TimeInForce(Enum):
    """Time in force"""
    DAY = "day"
    GTC = "gtc"  # Good till canceled
    IOC = "ioc"  # Immediate or cancel
    FOK = "fok"  # Fill or kill
    OPG = "opg"  # At the open
    CLS = "cls"  # At the close

@dataclass
class ExecutionConfig:
    """Execution configuration"""
    # API Configuration
    api_key: str = ""
    api_secret: str = ""
    base_url: str = "https://paper-api.alpaca.markets"  # Paper trading by default
    
    # Risk Limits
    max_position_size: float = 10000  # Max $ per position
    max_portfolio_risk: float = 0.02  # Max 2% portfolio risk
    max_daily_loss: float = 0.05  # Max 5% daily loss
    max_order_value: float = 50000  # Max $ per order
    
    # Execution Settings
    default_time_in_force: str = "day"
    use_extended_hours: bool = False
    enable_shorting: bool = True
    
    # Safety Settings
    require_confirmation: bool = False  # Require manual confirmation
    paper_trading: bool = True  # Start with paper trading
    enable_kill_switch: bool = True
    
    # Slippage and Costs
    slippage_bps: float = 5  # 5 basis points slippage
    commission_per_share: float = 0.005  # $0.005 per share
    min_commission: float = 1.0  # $1 minimum

@dataclass
class TradeOrder:
    """Trade order representation"""
    symbol: str
    side: OrderSide
    quantity: int
    order_type: OrderType
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: TimeInForce = TimeInForce.DAY
    extended_hours: bool = False
    client_order_id: Optional[str] = None
    
    # Risk controls
    max_loss: Optional[float] = None
    take_profit: Optional[float] = None
    
    # Metadata
    strategy_name: str = ""
    signal_strength: float = 0.0
    expected_return: float = 0.0
    risk_score: float = 0.0
    
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ExecutionResult:
    """Execution result"""
    success: bool
    order_id: Optional[str] = None
    client_order_id: Optional[str] = None
    filled_quantity: int = 0
    average_price: float = 0.0
    status: Optional[OrderStatus] = None
    error_message: Optional[str] = None
    execution_time: float = 0.0
    slippage: float = 0.0
    commission: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

class RiskManager:
    """Production risk management"""
    
    def __init__(self, config: ExecutionConfig):
        self.config = config
        self.daily_pnl = 0.0
        self.daily_trades = 0
        self.open_positions = {}
        self.max_drawdown_hit = False
        self.kill_switch_activated = False
        
    def check_pre_trade_risk(self, order: TradeOrder, account_value: float) -> Tuple[bool, str]:
        """Pre-trade risk checks"""
        
        # Kill switch check
        if self.kill_switch_activated:
            return False, "Kill switch activated - trading halted"
        
        # Daily loss limit
        if self.daily_pnl < -abs(account_value * self.config.max_daily_loss):
            self.kill_switch_activated = True
            return False, f"Daily loss limit exceeded: {self.daily_pnl:.2f}"
        
        # Position size check
        order_value = order.quantity * (order.limit_price or 0)
        if order_value > self.config.max_order_value:
            return False, f"Order value ${order_value:.2f} exceeds max ${self.config.max_order_value}"
        
        # Portfolio risk check
        position_risk = order_value / account_value
        if position_risk > self.config.max_portfolio_risk:
            return False, f"Position risk {position_risk:.1%} exceeds max {self.config.max_portfolio_risk:.1%}"
        
        # Concentration check (no more than 20% in one symbol)
        if order.symbol in self.open_positions:
            current_position = self.open_positions[order.symbol]
            new_position = current_position + (order_value if order.side == OrderSide.BUY else -order_value)
            concentration = abs(new_position) / account_value
            if concentration > 0.2:
                return False, f"Position concentration {concentration:.1%} exceeds 20% limit"
        
        return True, "Risk checks passed"
    
    def update_position(self, symbol: str, quantity: int, price: float, side: OrderSide):
        """Update position tracking"""
        if symbol not in self.open_positions:
            self.open_positions[symbol] = 0
        
        if side == OrderSide.BUY:
            self.open_positions[symbol] += quantity * price
        else:
            self.open_positions[symbol] -= quantity * price
        
        if abs(self.open_positions[symbol]) < 1:
            del self.open_positions[symbol]
    
    def calculate_position_size(self, signal_strength: float, account_value: float, 
                              volatility: float) -> int:
        """Calculate optimal position size using Kelly Criterion"""
        
        # Base position size (1% of account)
        base_size = account_value * 0.01
        
        # Adjust for signal strength (0.5 to 1.5x)
        signal_multiplier = 0.5 + signal_strength
        
        # Adjust for volatility (inverse relationship)
        vol_multiplier = min(1.5, max(0.5, 0.02 / volatility))
        
        # Final position size
        position_value = base_size * signal_multiplier * vol_multiplier
        
        # Apply maximum limits
        position_value = min(position_value, self.config.max_position_size)
        
        return position_value

class AlpacaBroker:
    """
    Professional Alpaca broker integration
    Handles real order execution and position management
    """
    
    def __init__(self, config: ExecutionConfig):
        self.config = config
        self.risk_manager = RiskManager(config)
        self.api = None
        self.stream = None
        self.account = None
        self.positions = {}
        self.pending_orders = {}
        self.filled_orders = {}
        self.is_connected = False
        
        # Performance tracking
        self.total_trades = 0
        self.winning_trades = 0
        self.total_pnl = 0.0
        self.total_commission = 0.0
        self.total_slippage = 0.0
        
        logger.info("🏦 Alpaca Broker Integration initialized")
        
        if not ALPACA_AVAILABLE:
            logger.error("❌ Alpaca SDK not available - install with: pip install alpaca-trade-api")
    
    def connect(self) -> bool:
        """Connect to Alpaca"""
        try:
            if not ALPACA_AVAILABLE:
                logger.error("Alpaca SDK not installed")
                return False
            
            # Initialize API connection
            self.api = REST(
                key_id=self.config.api_key or os.getenv('ALPACA_API_KEY'),
                secret_key=self.config.api_secret or os.getenv('ALPACA_SECRET_KEY'),
                base_url=self.config.base_url
            )
            
            # Test connection by getting account info
            self.account = self.api.get_account()
            self.is_connected = True
            
            # Log account status
            logger.info(f"✅ Connected to Alpaca ({'PAPER' if self.config.paper_trading else 'LIVE'} trading)")
            logger.info(f"   Account: {self.account.account_number}")
            logger.info(f"   Equity: ${float(self.account.equity):,.2f}")
            logger.info(f"   Buying Power: ${float(self.account.buying_power):,.2f}")
            logger.info(f"   Day Trade Count: {self.account.daytrade_count}")
            
            # Load existing positions
            self._load_positions()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Alpaca: {e}")
            self.is_connected = False
            return False
    
    def _load_positions(self):
        """Load current positions"""
        try:
            positions = self.api.list_positions()
            self.positions = {}
            
            for position in positions:
                self.positions[position.symbol] = {
                    'quantity': int(position.qty),
                    'avg_entry_price': float(position.avg_entry_price),
                    'current_price': float(position.current_price),
                    'market_value': float(position.market_value),
                    'unrealized_pnl': float(position.unrealized_pl),
                    'side': 'long' if int(position.qty) > 0 else 'short'
                }
            
            if self.positions:
                logger.info(f"📊 Loaded {len(self.positions)} existing positions")
                
        except Exception as e:
            logger.error(f"Failed to load positions: {e}")
    
    def execute_order(self, order: TradeOrder) -> ExecutionResult:
        """Execute a trade order"""
        start_time = time.time()
        
        try:
            if not self.is_connected:
                if not self.connect():
                    return ExecutionResult(
                        success=False,
                        error_message="Not connected to broker"
                    )
            
            # Pre-trade risk checks
            account_value = float(self.account.equity)
            risk_approved, risk_message = self.risk_manager.check_pre_trade_risk(order, account_value)
            
            if not risk_approved:
                logger.warning(f"⚠️ Order rejected by risk manager: {risk_message}")
                return ExecutionResult(
                    success=False,
                    error_message=risk_message
                )
            
            # Prepare order parameters
            order_params = {
                'symbol': order.symbol,
                'qty': order.quantity,
                'side': order.side.value,
                'type': order.order_type.value,
                'time_in_force': order.time_in_force.value,
                'extended_hours': order.extended_hours
            }
            
            # Add price parameters based on order type
            if order.order_type in [OrderType.LIMIT, OrderType.STOP_LIMIT]:
                order_params['limit_price'] = order.limit_price
            
            if order.order_type in [OrderType.STOP, OrderType.STOP_LIMIT]:
                order_params['stop_price'] = order.stop_price
            
            # Add client order ID for tracking
            if order.client_order_id:
                order_params['client_order_id'] = order.client_order_id
            
            # Manual confirmation if required
            if self.config.require_confirmation:
                logger.info(f"🔔 Order requires confirmation: {order}")
                # In production, this would send to UI for confirmation
                # For now, auto-approve in paper trading
                if not self.config.paper_trading:
                    return ExecutionResult(
                        success=False,
                        error_message="Manual confirmation required"
                    )
            
            # Submit order to Alpaca
            logger.info(f"📤 Submitting order: {order.side.value} {order.quantity} {order.symbol} @ {order.order_type.value}")
            alpaca_order = self.api.submit_order(**order_params)
            
            # Track order
            self.pending_orders[alpaca_order.id] = order
            
            # Wait for fill (with timeout)
            filled_order = self._wait_for_fill(alpaca_order.id, timeout=5)
            
            if filled_order:
                # Calculate execution metrics
                avg_fill_price = float(filled_order.filled_avg_price)
                filled_qty = int(filled_order.filled_qty)
                
                # Calculate slippage
                expected_price = order.limit_price or self._get_current_price(order.symbol)
                slippage = abs(avg_fill_price - expected_price) / expected_price * 10000  # in bps
                
                # Calculate commission
                commission = max(
                    self.config.min_commission,
                    filled_qty * self.config.commission_per_share
                )
                
                # Update risk manager
                self.risk_manager.update_position(
                    order.symbol, filled_qty, avg_fill_price, order.side
                )
                
                # Track performance
                self.total_trades += 1
                self.total_commission += commission
                self.total_slippage += slippage
                
                execution_time = time.time() - start_time
                
                logger.info(f"✅ Order filled: {filled_qty} @ ${avg_fill_price:.2f} (slippage: {slippage:.1f}bps)")
                
                return ExecutionResult(
                    success=True,
                    order_id=alpaca_order.id,
                    client_order_id=alpaca_order.client_order_id,
                    filled_quantity=filled_qty,
                    average_price=avg_fill_price,
                    status=OrderStatus.FILLED,
                    execution_time=execution_time,
                    slippage=slippage,
                    commission=commission
                )
            else:
                # Order not filled
                logger.warning(f"⚠️ Order not filled within timeout")
                
                # Cancel pending order
                self._cancel_order(alpaca_order.id)
                
                return ExecutionResult(
                    success=False,
                    order_id=alpaca_order.id,
                    status=OrderStatus.CANCELED,
                    error_message="Order not filled within timeout"
                )
                
        except Exception as e:
            logger.error(f"❌ Order execution failed: {e}")
            return ExecutionResult(
                success=False,
                error_message=str(e),
                execution_time=time.time() - start_time
            )
    
    def _wait_for_fill(self, order_id: str, timeout: float = 5) -> Optional[Any]:
        """Wait for order to fill"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                order = self.api.get_order(order_id)
                
                if order.status == 'filled':
                    return order
                elif order.status in ['canceled', 'rejected', 'expired']:
                    return None
                    
                time.sleep(0.1)  # Check every 100ms
                
            except Exception as e:
                logger.error(f"Error checking order status: {e}")
                return None
        
        return None
    
    def _cancel_order(self, order_id: str) -> bool:
        """Cancel an order"""
        try:
            self.api.cancel_order(order_id)
            logger.info(f"🚫 Order {order_id} canceled")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel order: {e}")
            return False
    
    def _get_current_price(self, symbol: str) -> float:
        """Get current market price"""
        try:
            quote = self.api.get_latest_quote(symbol)
            return float(quote.ask_price + quote.bid_price) / 2
        except:
            return 0.0
    
    def get_positions(self) -> Dict[str, Any]:
        """Get current positions"""
        if not self.is_connected:
            self.connect()
        
        self._load_positions()
        return self.positions
    
    def get_account_info(self) -> Dict[str, Any]:
        """Get account information"""
        if not self.is_connected:
            self.connect()
        
        try:
            self.account = self.api.get_account()
            
            return {
                'equity': float(self.account.equity),
                'cash': float(self.account.cash),
                'buying_power': float(self.account.buying_power),
                'positions_value': float(self.account.long_market_value) - float(self.account.short_market_value),
                'day_trades': self.account.daytrade_count,
                'pattern_day_trader': self.account.pattern_day_trader,
                'trading_blocked': self.account.trading_blocked,
                'daily_pnl': self.risk_manager.daily_pnl
            }
            
        except Exception as e:
            logger.error(f"Failed to get account info: {e}")
            return {}
    
    def close_position(self, symbol: str, qty: Optional[int] = None) -> ExecutionResult:
        """Close a position"""
        try:
            if symbol not in self.positions:
                return ExecutionResult(
                    success=False,
                    error_message=f"No position in {symbol}"
                )
            
            position = self.positions[symbol]
            close_qty = qty or position['quantity']
            
            # Create close order
            close_order = TradeOrder(
                symbol=symbol,
                side=OrderSide.SELL if position['side'] == 'long' else OrderSide.BUY,
                quantity=abs(close_qty),
                order_type=OrderType.MARKET,
                time_in_force=TimeInForce.DAY,
                strategy_name="position_close"
            )
            
            # Execute close order
            result = self.execute_order(close_order)
            
            if result.success:
                logger.info(f"✅ Closed position: {symbol}")
                
            return result
            
        except Exception as e:
            logger.error(f"Failed to close position: {e}")
            return ExecutionResult(
                success=False,
                error_message=str(e)
            )
    
    def close_all_positions(self) -> List[ExecutionResult]:
        """Close all positions"""
        results = []
        
        for symbol in list(self.positions.keys()):
            result = self.close_position(symbol)
            results.append(result)
            time.sleep(0.5)  # Avoid rate limiting
        
        return results
    
    def activate_kill_switch(self):
        """Emergency stop - close all positions and halt trading"""
        logger.warning("🚨 KILL SWITCH ACTIVATED - CLOSING ALL POSITIONS")
        
        self.risk_manager.kill_switch_activated = True
        
        # Close all positions
        results = self.close_all_positions()
        
        # Cancel all pending orders
        try:
            orders = self.api.list_orders(status='open')
            for order in orders:
                self._cancel_order(order.id)
        except Exception as e:
            logger.error(f"Failed to cancel orders: {e}")
        
        logger.warning(f"🛑 Trading halted - {len(results)} positions closed")
        
        return results

class ExecutionEngine:
    """
    Main execution engine orchestrating broker, risk, and order management
    """
    
    def __init__(self, config: ExecutionConfig = None):
        self.config = config or ExecutionConfig()
        self.broker = AlpacaBroker(self.config)
        self.is_running = False
        self.execution_history = []
        
        logger.info("⚡ Execution Engine initialized")
    
    def start(self) -> bool:
        """Start execution engine"""
        try:
            # Connect to broker
            if not self.broker.connect():
                logger.error("Failed to connect to broker")
                return False
            
            self.is_running = True
            
            # Get initial account state
            account_info = self.broker.get_account_info()
            logger.info(f"💰 Account Equity: ${account_info.get('equity', 0):,.2f}")
            logger.info(f"📊 Positions Value: ${account_info.get('positions_value', 0):,.2f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to start execution engine: {e}")
            return False
    
    def execute_signal(self, symbol: str, signal: float, strategy_name: str = "") -> ExecutionResult:
        """Execute trading signal"""
        
        if not self.is_running:
            if not self.start():
                return ExecutionResult(
                    success=False,
                    error_message="Execution engine not running"
                )
        
        try:
            # Get account info for position sizing
            account_info = self.broker.get_account_info()
            account_value = account_info.get('equity', 0)
            
            if account_value <= 0:
                return ExecutionResult(
                    success=False,
                    error_message="Invalid account value"
                )
            
            # Calculate position size
            volatility = 0.02  # Default 2% volatility
            position_value = self.broker.risk_manager.calculate_position_size(
                abs(signal), account_value, volatility
            )
            
            # Get current price for quantity calculation
            current_price = self.broker._get_current_price(symbol)
            
            if current_price <= 0:
                return ExecutionResult(
                    success=False,
                    error_message=f"Invalid price for {symbol}"
                )
            
            quantity = int(position_value / current_price)
            
            if quantity == 0:
                return ExecutionResult(
                    success=False,
                    error_message="Position size too small"
                )
            
            # Create order based on signal
            if signal > 0:  # Buy signal
                order = TradeOrder(
                    symbol=symbol,
                    side=OrderSide.BUY,
                    quantity=quantity,
                    order_type=OrderType.MARKET,
                    time_in_force=TimeInForce.DAY,
                    strategy_name=strategy_name,
                    signal_strength=abs(signal)
                )
            elif signal < 0:  # Sell signal
                order = TradeOrder(
                    symbol=symbol,
                    side=OrderSide.SELL,
                    quantity=quantity,
                    order_type=OrderType.MARKET,
                    time_in_force=TimeInForce.DAY,
                    strategy_name=strategy_name,
                    signal_strength=abs(signal)
                )
            else:  # Neutral signal
                return ExecutionResult(
                    success=False,
                    error_message="Neutral signal - no action"
                )
            
            # Execute order
            result = self.broker.execute_order(order)
            
            # Track execution
            self.execution_history.append({
                'timestamp': datetime.now(),
                'symbol': symbol,
                'signal': signal,
                'result': result
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Signal execution failed: {e}")
            return ExecutionResult(
                success=False,
                error_message=str(e)
            )
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get execution performance summary"""
        successful_trades = [e for e in self.execution_history if e['result'].success]
        
        if not successful_trades:
            return {
                'total_trades': 0,
                'success_rate': 0,
                'avg_slippage': 0,
                'total_commission': 0
            }
        
        return {
            'total_trades': len(self.execution_history),
            'successful_trades': len(successful_trades),
            'success_rate': len(successful_trades) / len(self.execution_history),
            'avg_slippage': np.mean([e['result'].slippage for e in successful_trades]),
            'total_commission': sum([e['result'].commission for e in successful_trades]),
            'avg_execution_time': np.mean([e['result'].execution_time for e in successful_trades])
        }
    
    def shutdown(self):
        """Shutdown execution engine"""
        logger.info("Shutting down execution engine...")
        
        # Get final performance
        performance = self.get_performance_summary()
        logger.info(f"📊 Final Performance: {performance}")
        
        self.is_running = False

# Demo function
def demo_execution():
    """Demonstrate execution capabilities"""
    print("🚀 PROFESSIONAL EXECUTION ENGINE DEMO")
    print("=" * 60)
    
    # Create execution config (paper trading)
    config = ExecutionConfig(
        paper_trading=True,
        max_position_size=5000,
        max_daily_loss=0.02
    )
    
    # Create execution engine
    engine = ExecutionEngine(config)
    
    print("📡 Starting execution engine...")
    if engine.start():
        print("✅ Execution engine running")
        
        # Demo signal execution
        print("\n📊 Executing demo signal...")
        result = engine.execute_signal(
            symbol="AAPL",
            signal=0.8,  # Strong buy signal
            strategy_name="demo_strategy"
        )
        
        if result.success:
            print(f"✅ Order executed successfully")
            print(f"   Filled: {result.filled_quantity} @ ${result.average_price:.2f}")
            print(f"   Slippage: {result.slippage:.1f}bps")
            print(f"   Commission: ${result.commission:.2f}")
        else:
            print(f"❌ Execution failed: {result.error_message}")
        
        # Get performance
        performance = engine.get_performance_summary()
        print(f"\n📈 Performance Summary:")
        print(f"   Total trades: {performance.get('total_trades', 0)}")
        print(f"   Success rate: {performance.get('success_rate', 0):.1%}")
        
        engine.shutdown()
    else:
        print("❌ Failed to start execution engine")
        print("   Make sure to set ALPACA_API_KEY and ALPACA_SECRET_KEY environment variables")

if __name__ == "__main__":
    demo_execution()



