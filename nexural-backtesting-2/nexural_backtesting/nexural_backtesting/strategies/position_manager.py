"""
Position Manager for Enterprise Quantitative Backtesting

This module provides position management functionality including position tracking,
risk limits, position sizing, and portfolio management.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class PositionType(Enum):
    """Position types"""
    LONG = "long"
    SHORT = "short"
    FLAT = "flat"


class PositionState(Enum):
    """Position states"""
    OPEN = "open"
    CLOSED = "closed"
    PENDING = "pending"
    PARTIALLY_FILLED = "partially_filled"


@dataclass
class Position:
    """Individual position record"""
    symbol: str
    quantity: float
    entry_price: float
    current_price: float
    entry_time: datetime
    position_type: PositionType
    state: PositionState
    unrealized_pnl: float = 0.0
    realized_pnl: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def update_price(self, price: float):
        """Update position with new price"""
        self.current_price = price
        if self.position_type == PositionType.LONG:
            self.unrealized_pnl = (price - self.entry_price) * self.quantity
        else:  # SHORT
            self.unrealized_pnl = (self.entry_price - price) * self.quantity
    
    def get_market_value(self) -> float:
        """Get current market value of position"""
        return abs(self.quantity * self.current_price)
    
    def get_notional_value(self) -> float:
        """Get notional value of position"""
        return self.quantity * self.current_price


@dataclass
class PositionLimit:
    """Position limits configuration"""
    max_position_size: float = 0.1  # 10% of portfolio
    max_leverage: float = 2.0
    max_concentration: float = 0.25  # 25% in single position
    max_sector_exposure: float = 0.4  # 40% in single sector
    max_country_exposure: float = 0.5  # 50% in single country
    min_position_size: float = 0.001  # 0.1% minimum position
    enable_shorting: bool = True
    max_short_exposure: float = 0.3  # 30% short exposure


class PositionManager:
    """
    Comprehensive position manager for quantitative trading strategies
    """
    
    def __init__(
        self,
        max_position_size: float = 0.1,
        max_leverage: float = 2.0,
        enable_shorting: bool = True,
        position_limits: Optional[PositionLimit] = None
    ):
        """
        Initialize position manager
        
        Args:
            max_position_size: Maximum position size as fraction of portfolio
            max_leverage: Maximum leverage allowed
            enable_shorting: Whether short positions are allowed
            position_limits: Custom position limits
        """
        self.position_limits = position_limits or PositionLimit(
            max_position_size=max_position_size,
            max_leverage=max_leverage,
            enable_shorting=enable_shorting
        )
        
        # Position tracking
        self.positions: Dict[str, Position] = {}
        self.position_history: List[Dict[str, Any]] = []
        
        # Portfolio state
        self.total_portfolio_value = 0.0
        self.cash = 0.0
        self.margin_used = 0.0
        
        # Risk metrics
        self.current_leverage = 0.0
        self.total_exposure = 0.0
        self.long_exposure = 0.0
        self.short_exposure = 0.0
        
        logger.info("Position manager initialized")
    
    def reset(self):
        """Reset position manager state"""
        self.positions.clear()
        self.position_history.clear()
        self.total_portfolio_value = 0.0
        self.cash = 0.0
        self.margin_used = 0.0
        self.current_leverage = 0.0
        self.total_exposure = 0.0
        self.long_exposure = 0.0
        self.short_exposure = 0.0
    
    def update_prices(self, prices: Dict[str, float]):
        """
        Update position prices
        
        Args:
            prices: Dictionary of symbol -> price mappings
        """
        for symbol, price in prices.items():
            if symbol in self.positions:
                self.positions[symbol].update_price(price)
        
        self._update_portfolio_metrics()
    
    def update_position(
        self,
        symbol: str,
        quantity_change: float,
        price: float,
        timestamp: Optional[datetime] = None
    ) -> bool:
        """
        Update position with new trade
        
        Args:
            symbol: Trading symbol
            quantity_change: Change in quantity (positive for buy, negative for sell)
            price: Execution price
            timestamp: Trade timestamp
            
        Returns:
            True if position update was successful
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        # Check position limits
        if not self._check_position_limits(symbol, quantity_change, price):
            logger.warning(f"Position limit violation for {symbol}")
            return False
        
        # Update or create position
        if symbol in self.positions:
            position = self.positions[symbol]
            old_quantity = position.quantity
            new_quantity = old_quantity + quantity_change
            
            # Handle position closure
            if abs(new_quantity) < 1e-6:  # Close position
                self._close_position(symbol, timestamp)
            else:
                # Update existing position
                if new_quantity > 0:
                    position.position_type = PositionType.LONG
                else:
                    position.position_type = PositionType.SHORT
                
                position.quantity = new_quantity
                position.state = PositionState.OPEN
                
                # Update entry price (volume-weighted average)
                if abs(quantity_change) > 1e-6:
                    total_cost = (old_quantity * position.entry_price + 
                                quantity_change * price)
                    position.entry_price = total_cost / new_quantity
        else:
            # Create new position
            if abs(quantity_change) > 1e-6:
                position_type = PositionType.LONG if quantity_change > 0 else PositionType.SHORT
                
                self.positions[symbol] = Position(
                    symbol=symbol,
                    quantity=quantity_change,
                    entry_price=price,
                    current_price=price,
                    entry_time=timestamp,
                    position_type=position_type,
                    state=PositionState.OPEN
                )
        
        # Update portfolio metrics
        self._update_portfolio_metrics()
        
        # Record position history
        self._record_position_history(symbol, timestamp)
        
        return True
    
    def get_positions(self) -> Dict[str, float]:
        """Get current positions as symbol -> quantity mapping"""
        return {symbol: pos.quantity for symbol, pos in self.positions.items()}
    
    def get_position_details(self, symbol: str) -> Optional[Position]:
        """Get detailed position information"""
        return self.positions.get(symbol)
    
    def get_portfolio_summary(self) -> Dict[str, Any]:
        """Get portfolio summary"""
        total_pnl = sum(pos.unrealized_pnl + pos.realized_pnl for pos in self.positions.values())
        
        return {
            'total_portfolio_value': self.total_portfolio_value,
            'cash': self.cash,
            'margin_used': self.margin_used,
            'total_exposure': self.total_exposure,
            'long_exposure': self.long_exposure,
            'short_exposure': self.short_exposure,
            'current_leverage': self.current_leverage,
            'total_pnl': total_pnl,
            'position_count': len(self.positions)
        }
    
    def calculate_position_size(
        self,
        signal_strength: float,
        volatility: float,
        portfolio_value: float,
        risk_per_trade: float = 0.02
    ) -> float:
        """
        Calculate optimal position size based on signal and risk
        
        Args:
            signal_strength: Signal strength (-1 to 1)
            volatility: Asset volatility
            portfolio_value: Current portfolio value
            risk_per_trade: Maximum risk per trade (default 2%)
            
        Returns:
            Position size as fraction of portfolio
        """
        # Kelly criterion inspired position sizing
        if abs(signal_strength) < 0.01:
            return 0.0
        
        # Base position size from signal strength
        base_size = abs(signal_strength) * self.position_limits.max_position_size
        
        # Volatility adjustment
        vol_adjustment = 1.0 / (1.0 + volatility)
        adjusted_size = base_size * vol_adjustment
        
        # Risk-based sizing
        risk_based_size = risk_per_trade / volatility if volatility > 0 else 0
        
        # Take minimum of approaches
        position_size = min(adjusted_size, risk_based_size, self.position_limits.max_position_size)
        
        # Apply minimum position size
        if position_size < self.position_limits.min_position_size:
            position_size = 0.0
        
        return position_size * np.sign(signal_strength)
    
    def check_risk_limits(self) -> List[str]:
        """
        Check if current positions violate risk limits
        
        Returns:
            List of violation messages
        """
        violations = []
        
        # Leverage check
        if self.current_leverage > self.position_limits.max_leverage:
            violations.append(f"Leverage {self.current_leverage:.2f} exceeds limit {self.position_limits.max_leverage}")
        
        # Short exposure check
        if not self.position_limits.enable_shorting and self.short_exposure > 0:
            violations.append("Short positions not allowed")
        elif self.short_exposure > self.position_limits.max_short_exposure:
            violations.append(f"Short exposure {self.short_exposure:.2%} exceeds limit {self.position_limits.max_short_exposure:.2%}")
        
        # Individual position size check
        for symbol, position in self.positions.items():
            if self.total_portfolio_value <= 0:
                position_size = 0.0
            else:
                position_size = position.get_market_value() / self.total_portfolio_value
            if position_size > self.position_limits.max_position_size:
                violations.append(f"Position {symbol} size {position_size:.2%} exceeds limit {self.position_limits.max_position_size:.2%}")
        
        return violations
    
    def _check_position_limits(
        self,
        symbol: str,
        quantity_change: float,
        price: float
    ) -> bool:
        """Check if position update would violate limits"""
        # Calculate new position value
        current_value = 0.0
        if symbol in self.positions:
            current_value = self.positions[symbol].get_market_value()
        
        new_value = abs((self.positions.get(symbol, None) and self.positions[symbol].quantity or 0) + quantity_change) * price
        
        # Check position size limit (avoid division by zero)
        if self.total_portfolio_value <= 0:
            return True
        if new_value / self.total_portfolio_value > self.position_limits.max_position_size:
            return False
        
        # Check shorting restrictions
        if not self.position_limits.enable_shorting and quantity_change < 0:
            return False
        
        return True
    
    def _close_position(self, symbol: str, timestamp: datetime):
        """Close a position"""
        if symbol in self.positions:
            position = self.positions[symbol]
            position.state = PositionState.CLOSED
            position.realized_pnl = position.unrealized_pnl
            position.unrealized_pnl = 0.0
            
            # Record closure in history
            self._record_position_history(symbol, timestamp, is_closure=True)
            
            # Remove from active positions
            del self.positions[symbol]
    
    def _update_portfolio_metrics(self):
        """Update portfolio-level metrics"""
        self.total_exposure = 0.0
        self.long_exposure = 0.0
        self.short_exposure = 0.0
        
        for position in self.positions.values():
            market_value = position.get_market_value()
            self.total_exposure += market_value
            
            if position.position_type == PositionType.LONG:
                self.long_exposure += market_value
            else:
                self.short_exposure += market_value
        
        # Calculate leverage
        if self.total_portfolio_value > 0:
            self.current_leverage = self.total_exposure / self.total_portfolio_value
        else:
            self.current_leverage = 0.0
    
    def _record_position_history(self, symbol: str, timestamp: datetime, is_closure: bool = False):
        """Record position history"""
        position = self.positions.get(symbol)
        if position:
            self.position_history.append({
                'timestamp': timestamp,
                'symbol': symbol,
                'quantity': position.quantity,
                'entry_price': position.entry_price,
                'current_price': position.current_price,
                'position_type': position.position_type.value,
                'state': position.state.value,
                'unrealized_pnl': position.unrealized_pnl,
                'realized_pnl': position.realized_pnl,
                'market_value': position.get_market_value(),
                'is_closure': is_closure
            })
    
    def get_position_history(self) -> pd.DataFrame:
        """Get position history as DataFrame"""
        if not self.position_history:
            return pd.DataFrame()
        
        return pd.DataFrame(self.position_history)
    
    def calculate_portfolio_risk_metrics(self) -> Dict[str, float]:
        """Calculate portfolio risk metrics"""
        if not self.positions:
            return {
                'total_risk': 0.0,
                'concentration_risk': 0.0,
                'leverage_risk': 0.0,
                'short_risk': 0.0
            }
        
        # Concentration risk (Herfindahl index)
        weights = [pos.get_market_value() / self.total_exposure for pos in self.positions.values()]
        concentration_risk = sum(w**2 for w in weights)
        
        # Leverage risk
        leverage_risk = min(self.current_leverage / self.position_limits.max_leverage, 1.0)
        
        # Short risk
        short_risk = self.short_exposure / self.total_portfolio_value if self.total_portfolio_value > 0 else 0
        
        # Total risk (weighted combination)
        total_risk = (0.4 * concentration_risk + 
                     0.3 * leverage_risk + 
                     0.3 * short_risk)
        
        return {
            'total_risk': total_risk,
            'concentration_risk': concentration_risk,
            'leverage_risk': leverage_risk,
            'short_risk': short_risk
        }
