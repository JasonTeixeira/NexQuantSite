"""
Professional Position Management System
Real-time P&L tracking and portfolio management for live trading
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal
import pandas as pd
import numpy as np
from collections import defaultdict
import json

logger = logging.getLogger(__name__)

@dataclass
class Position:
    """Individual position representation"""
    symbol: str
    quantity: int  # Positive for long, negative for short
    entry_price: float
    current_price: float
    entry_time: datetime
    
    # P&L tracking
    realized_pnl: float = 0.0
    unrealized_pnl: float = 0.0
    total_commission: float = 0.0
    
    # Risk metrics
    max_price: float = 0.0
    min_price: float = 0.0
    max_unrealized_pnl: float = 0.0
    min_unrealized_pnl: float = 0.0
    
    # Strategy tracking
    strategy_name: str = ""
    entry_signal: float = 0.0
    tags: List[str] = field(default_factory=list)
    
    @property
    def is_long(self) -> bool:
        """Check if position is long"""
        return self.quantity > 0
    
    @property
    def is_short(self) -> bool:
        """Check if position is short"""
        return self.quantity < 0
    
    @property
    def market_value(self) -> float:
        """Current market value of position"""
        return abs(self.quantity) * self.current_price
    
    @property
    def cost_basis(self) -> float:
        """Total cost basis of position"""
        return abs(self.quantity) * self.entry_price
    
    @property
    def pnl_percent(self) -> float:
        """P&L as percentage"""
        if self.cost_basis == 0:
            return 0
        return (self.unrealized_pnl / self.cost_basis) * 100
    
    @property
    def holding_period(self) -> timedelta:
        """Time held"""
        return datetime.now() - self.entry_time
    
    def update_price(self, price: float):
        """Update current price and P&L"""
        self.current_price = price
        
        # Update price extremes
        if self.max_price == 0 or price > self.max_price:
            self.max_price = price
        if self.min_price == 0 or price < self.min_price:
            self.min_price = price
        
        # Calculate unrealized P&L
        if self.is_long:
            self.unrealized_pnl = (price - self.entry_price) * self.quantity
        else:  # Short
            self.unrealized_pnl = (self.entry_price - price) * abs(self.quantity)
        
        # Track P&L extremes
        if self.unrealized_pnl > self.max_unrealized_pnl:
            self.max_unrealized_pnl = self.unrealized_pnl
        if self.unrealized_pnl < self.min_unrealized_pnl:
            self.min_unrealized_pnl = self.unrealized_pnl
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'symbol': self.symbol,
            'quantity': self.quantity,
            'entry_price': self.entry_price,
            'current_price': self.current_price,
            'market_value': self.market_value,
            'unrealized_pnl': self.unrealized_pnl,
            'pnl_percent': self.pnl_percent,
            'realized_pnl': self.realized_pnl,
            'total_pnl': self.realized_pnl + self.unrealized_pnl,
            'holding_period_hours': self.holding_period.total_seconds() / 3600,
            'strategy': self.strategy_name
        }

@dataclass
class Portfolio:
    """Portfolio representation"""
    cash: float
    positions: Dict[str, Position] = field(default_factory=dict)
    
    @property
    def total_market_value(self) -> float:
        """Total market value of all positions"""
        return sum(p.market_value for p in self.positions.values())
    
    @property
    def total_equity(self) -> float:
        """Total portfolio equity (cash + positions)"""
        return self.cash + self.total_market_value
    
    @property
    def total_unrealized_pnl(self) -> float:
        """Total unrealized P&L across all positions"""
        return sum(p.unrealized_pnl for p in self.positions.values())
    
    @property
    def total_realized_pnl(self) -> float:
        """Total realized P&L across all positions"""
        return sum(p.realized_pnl for p in self.positions.values())
    
    @property
    def total_pnl(self) -> float:
        """Total P&L (realized + unrealized)"""
        return self.total_realized_pnl + self.total_unrealized_pnl
    
    @property
    def position_count(self) -> int:
        """Number of open positions"""
        return len(self.positions)
    
    @property
    def long_exposure(self) -> float:
        """Total long exposure"""
        return sum(p.market_value for p in self.positions.values() if p.is_long)
    
    @property
    def short_exposure(self) -> float:
        """Total short exposure"""
        return sum(p.market_value for p in self.positions.values() if p.is_short)
    
    @property
    def net_exposure(self) -> float:
        """Net market exposure"""
        return self.long_exposure - self.short_exposure
    
    @property
    def gross_exposure(self) -> float:
        """Gross market exposure"""
        return self.long_exposure + self.short_exposure
    
    @property
    def cash_percentage(self) -> float:
        """Cash as percentage of total equity"""
        if self.total_equity == 0:
            return 0
        return (self.cash / self.total_equity) * 100
    
    def get_allocation(self) -> Dict[str, float]:
        """Get portfolio allocation by symbol"""
        allocation = {}
        total_value = self.total_market_value
        
        if total_value == 0:
            return allocation
        
        for symbol, position in self.positions.items():
            allocation[symbol] = (position.market_value / total_value) * 100
        
        return allocation

class PositionManager:
    """
    Professional position management system
    Handles real-time P&L, portfolio tracking, and risk management
    """
    
    def __init__(self, initial_cash: float = 100000):
        self.portfolio = Portfolio(cash=initial_cash)
        self.initial_equity = initial_cash
        
        # Trade history
        self.trade_history = []
        self.closed_positions = []
        
        # Performance tracking
        self.equity_curve = []
        self.daily_pnl = defaultdict(float)
        self.strategy_pnl = defaultdict(float)
        
        # Risk tracking
        self.max_equity = initial_cash
        self.max_drawdown = 0.0
        self.current_drawdown = 0.0
        
        # Position limits
        self.max_positions = 20
        self.max_position_size = 0.1  # 10% of equity
        self.max_sector_exposure = 0.3  # 30% per sector
        
        # Sector mapping (simplified)
        self.sector_map = {
            'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
            'JPM': 'Financials', 'BAC': 'Financials', 'GS': 'Financials',
            'XOM': 'Energy', 'CVX': 'Energy',
            'JNJ': 'Healthcare', 'PFE': 'Healthcare'
        }
        
        logger.info(f"💼 Position Manager initialized with ${initial_cash:,.2f}")
    
    def open_position(self, symbol: str, quantity: int, price: float, 
                     commission: float = 0, strategy_name: str = "",
                     signal_strength: float = 0) -> Position:
        """Open a new position or add to existing"""
        
        if symbol in self.portfolio.positions:
            # Add to existing position (averaging)
            position = self.portfolio.positions[symbol]
            total_quantity = position.quantity + quantity
            
            if total_quantity == 0:
                # Position closed
                self.close_position(symbol, price, commission)
                return None
            
            # Calculate new average price
            if (position.quantity > 0 and quantity > 0) or (position.quantity < 0 and quantity < 0):
                # Adding to position
                total_cost = (position.quantity * position.entry_price) + (quantity * price)
                position.entry_price = total_cost / total_quantity
                position.quantity = total_quantity
            else:
                # Reducing position
                realized_pnl = self._calculate_realized_pnl(position, quantity, price)
                position.realized_pnl += realized_pnl
                position.quantity = total_quantity
            
            position.total_commission += commission
            
        else:
            # Create new position
            position = Position(
                symbol=symbol,
                quantity=quantity,
                entry_price=price,
                current_price=price,
                entry_time=datetime.now(),
                total_commission=commission,
                strategy_name=strategy_name,
                entry_signal=signal_strength
            )
            
            self.portfolio.positions[symbol] = position
        
        # Update cash
        self.portfolio.cash -= (quantity * price + commission)
        
        # Record trade
        self.trade_history.append({
            'timestamp': datetime.now(),
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'commission': commission,
            'strategy': strategy_name,
            'action': 'BUY' if quantity > 0 else 'SELL'
        })
        
        # Update tracking
        self._update_equity_curve()
        
        logger.info(f"📈 Opened position: {symbol} {quantity} @ ${price:.2f}")
        
        return position
    
    def close_position(self, symbol: str, price: float, commission: float = 0,
                       quantity: Optional[int] = None) -> Dict[str, Any]:
        """Close a position (fully or partially)"""
        
        if symbol not in self.portfolio.positions:
            logger.warning(f"No position to close for {symbol}")
            return None
        
        position = self.portfolio.positions[symbol]
        
        # Determine quantity to close
        close_quantity = quantity or position.quantity
        
        # Calculate realized P&L
        if position.is_long:
            realized_pnl = (price - position.entry_price) * close_quantity
        else:
            realized_pnl = (position.entry_price - price) * abs(close_quantity)
        
        realized_pnl -= commission
        
        # Update position
        if abs(close_quantity) >= abs(position.quantity):
            # Full close
            position.realized_pnl += realized_pnl
            position.total_commission += commission
            
            # Record closed position
            closed_record = {
                'symbol': symbol,
                'entry_price': position.entry_price,
                'exit_price': price,
                'quantity': position.quantity,
                'realized_pnl': position.realized_pnl,
                'total_commission': position.total_commission,
                'holding_period': position.holding_period.total_seconds() / 3600,
                'strategy': position.strategy_name,
                'close_time': datetime.now()
            }
            
            self.closed_positions.append(closed_record)
            
            # Update strategy P&L
            self.strategy_pnl[position.strategy_name] += position.realized_pnl
            
            # Remove from portfolio
            del self.portfolio.positions[symbol]
            
            logger.info(f"📉 Closed position: {symbol} P&L: ${realized_pnl:.2f}")
            
        else:
            # Partial close
            position.quantity -= close_quantity
            position.realized_pnl += realized_pnl
            position.total_commission += commission
            
            logger.info(f"📊 Partially closed: {symbol} {close_quantity} @ ${price:.2f}")
        
        # Update cash
        self.portfolio.cash += (close_quantity * price - commission)
        
        # Record trade
        self.trade_history.append({
            'timestamp': datetime.now(),
            'symbol': symbol,
            'quantity': -close_quantity,
            'price': price,
            'commission': commission,
            'action': 'SELL' if close_quantity > 0 else 'BUY'
        })
        
        # Update tracking
        self._update_equity_curve()
        
        return closed_record if abs(close_quantity) >= abs(position.quantity) else None
    
    def update_prices(self, prices: Dict[str, float]):
        """Update current prices for all positions"""
        
        for symbol, price in prices.items():
            if symbol in self.portfolio.positions:
                self.portfolio.positions[symbol].update_price(price)
        
        # Update tracking
        self._update_equity_curve()
    
    def _calculate_realized_pnl(self, position: Position, quantity: int, price: float) -> float:
        """Calculate realized P&L for partial close"""
        
        if position.is_long:
            return (price - position.entry_price) * min(quantity, position.quantity)
        else:
            return (position.entry_price - price) * min(abs(quantity), abs(position.quantity))
    
    def _update_equity_curve(self):
        """Update equity curve and drawdown"""
        
        current_equity = self.portfolio.total_equity
        
        # Record equity
        self.equity_curve.append({
            'timestamp': datetime.now(),
            'equity': current_equity,
            'cash': self.portfolio.cash,
            'positions_value': self.portfolio.total_market_value,
            'unrealized_pnl': self.portfolio.total_unrealized_pnl,
            'realized_pnl': self.portfolio.total_realized_pnl
        })
        
        # Update max equity and drawdown
        if current_equity > self.max_equity:
            self.max_equity = current_equity
        
        self.current_drawdown = (self.max_equity - current_equity) / self.max_equity
        
        if self.current_drawdown > self.max_drawdown:
            self.max_drawdown = self.current_drawdown
        
        # Update daily P&L
        today = datetime.now().date()
        if len(self.equity_curve) > 1:
            prev_equity = self.equity_curve[-2]['equity']
            self.daily_pnl[today] = current_equity - prev_equity
    
    def get_portfolio_summary(self) -> Dict[str, Any]:
        """Get comprehensive portfolio summary"""
        
        return {
            'equity': self.portfolio.total_equity,
            'cash': self.portfolio.cash,
            'cash_percentage': self.portfolio.cash_percentage,
            'positions_value': self.portfolio.total_market_value,
            'position_count': self.portfolio.position_count,
            
            'long_exposure': self.portfolio.long_exposure,
            'short_exposure': self.portfolio.short_exposure,
            'net_exposure': self.portfolio.net_exposure,
            'gross_exposure': self.portfolio.gross_exposure,
            
            'unrealized_pnl': self.portfolio.total_unrealized_pnl,
            'realized_pnl': self.portfolio.total_realized_pnl,
            'total_pnl': self.portfolio.total_pnl,
            'total_return': ((self.portfolio.total_equity - self.initial_equity) / self.initial_equity) * 100,
            
            'max_drawdown': self.max_drawdown * 100,
            'current_drawdown': self.current_drawdown * 100,
            
            'positions': [p.to_dict() for p in self.portfolio.positions.values()],
            'allocation': self.portfolio.get_allocation()
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get detailed performance metrics"""
        
        if not self.closed_positions:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'avg_win': 0,
                'avg_loss': 0,
                'profit_factor': 0,
                'sharpe_ratio': 0
            }
        
        # Analyze closed positions
        pnls = [p['realized_pnl'] for p in self.closed_positions]
        wins = [p for p in pnls if p > 0]
        losses = [p for p in pnls if p < 0]
        
        # Calculate metrics
        win_rate = len(wins) / len(pnls) if pnls else 0
        avg_win = np.mean(wins) if wins else 0
        avg_loss = np.mean(losses) if losses else 0
        
        total_wins = sum(wins)
        total_losses = abs(sum(losses))
        profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
        
        # Calculate Sharpe ratio from equity curve
        if len(self.equity_curve) > 2:
            returns = pd.Series([e['equity'] for e in self.equity_curve]).pct_change().dropna()
            sharpe = (returns.mean() / returns.std() * np.sqrt(252)) if returns.std() > 0 else 0
        else:
            sharpe = 0
        
        return {
            'total_trades': len(self.closed_positions),
            'winning_trades': len(wins),
            'losing_trades': len(losses),
            'win_rate': win_rate,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor,
            'sharpe_ratio': sharpe,
            'max_drawdown': self.max_drawdown,
            'total_pnl': self.portfolio.total_pnl,
            'strategy_pnl': dict(self.strategy_pnl)
        }
    
    def check_risk_limits(self) -> Dict[str, bool]:
        """Check if current portfolio meets risk limits"""
        
        checks = {
            'position_count_ok': self.portfolio.position_count <= self.max_positions,
            'position_sizing_ok': True,
            'sector_exposure_ok': True,
            'drawdown_ok': self.current_drawdown < 0.2  # 20% max drawdown
        }
        
        # Check position sizing
        for position in self.portfolio.positions.values():
            if position.market_value / self.portfolio.total_equity > self.max_position_size:
                checks['position_sizing_ok'] = False
                break
        
        # Check sector exposure
        sector_exposure = defaultdict(float)
        for symbol, position in self.portfolio.positions.items():
            sector = self.sector_map.get(symbol, 'Other')
            sector_exposure[sector] += position.market_value / self.portfolio.total_equity
        
        for sector, exposure in sector_exposure.items():
            if exposure > self.max_sector_exposure:
                checks['sector_exposure_ok'] = False
                break
        
        return checks
    
    def rebalance_portfolio(self, target_weights: Dict[str, float], prices: Dict[str, float]):
        """Rebalance portfolio to target weights"""
        
        current_equity = self.portfolio.total_equity
        trades = []
        
        for symbol, target_weight in target_weights.items():
            target_value = current_equity * target_weight
            current_value = self.portfolio.positions[symbol].market_value if symbol in self.portfolio.positions else 0
            
            diff_value = target_value - current_value
            
            if abs(diff_value) > 100:  # Minimum trade size
                price = prices.get(symbol, 0)
                if price > 0:
                    quantity = int(diff_value / price)
                    
                    if quantity != 0:
                        trades.append({
                            'symbol': symbol,
                            'quantity': quantity,
                            'price': price
                        })
        
        return trades
    
    def export_positions(self, filename: str):
        """Export current positions to file"""
        
        data = {
            'timestamp': datetime.now().isoformat(),
            'portfolio': self.get_portfolio_summary(),
            'performance': self.get_performance_metrics(),
            'positions': [p.to_dict() for p in self.portfolio.positions.values()],
            'closed_positions': self.closed_positions[-100:]  # Last 100 closed positions
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"📁 Exported positions to {filename}")

# Demo function
def demo_position_management():
    """Demonstrate position management"""
    print("💼 POSITION MANAGEMENT DEMO")
    print("=" * 60)
    
    # Create position manager
    manager = PositionManager(initial_cash=100000)
    
    print(f"Initial Portfolio:")
    print(f"  Cash: ${manager.portfolio.cash:,.2f}")
    print(f"  Equity: ${manager.portfolio.total_equity:,.2f}")
    
    # Open some positions
    print(f"\n📈 Opening positions...")
    
    manager.open_position("AAPL", 100, 150.00, commission=1.00, strategy_name="momentum")
    manager.open_position("GOOGL", 50, 2800.00, commission=1.00, strategy_name="momentum")
    manager.open_position("MSFT", -30, 350.00, commission=1.00, strategy_name="mean_reversion")  # Short
    
    # Update prices
    print(f"\n💹 Updating prices...")
    manager.update_prices({
        "AAPL": 155.00,
        "GOOGL": 2850.00,
        "MSFT": 345.00
    })
    
    # Get portfolio summary
    summary = manager.get_portfolio_summary()
    
    print(f"\nPortfolio Summary:")
    print(f"  Equity: ${summary['equity']:,.2f}")
    print(f"  Cash: ${summary['cash']:,.2f} ({summary['cash_percentage']:.1f}%)")
    print(f"  Positions Value: ${summary['positions_value']:,.2f}")
    print(f"  Unrealized P&L: ${summary['unrealized_pnl']:,.2f}")
    print(f"  Total Return: {summary['total_return']:.2f}%")
    
    print(f"\nPositions:")
    for pos in summary['positions']:
        print(f"  {pos['symbol']}: {pos['quantity']} @ ${pos['current_price']:.2f} | P&L: ${pos['unrealized_pnl']:.2f} ({pos['pnl_percent']:.1f}%)")
    
    # Close a position
    print(f"\n📉 Closing AAPL position...")
    manager.close_position("AAPL", 156.00, commission=1.00)
    
    # Get performance metrics
    metrics = manager.get_performance_metrics()
    
    print(f"\nPerformance Metrics:")
    print(f"  Total Trades: {metrics['total_trades']}")
    print(f"  Win Rate: {metrics['win_rate']:.1%}")
    print(f"  Total P&L: ${metrics['total_pnl']:,.2f}")
    
    # Check risk limits
    risk_checks = manager.check_risk_limits()
    
    print(f"\nRisk Checks:")
    for check, passed in risk_checks.items():
        status = "✅" if passed else "❌"
        print(f"  {check}: {status}")
    
    print(f"\n✅ Position management demo completed")

if __name__ == "__main__":
    demo_position_management()



