"""
Real Transaction Cost Model
============================
Production-grade cost modeling for accurate backtesting.

Includes:
- Dynamic slippage based on order size and volatility
- Market impact modeling (temporary and permanent)
- Bid-ask spread estimation
- Commission structures (tiered, per-share, percentage)
- Time-of-day effects
- Liquidity-based adjustments

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass
from datetime import datetime, time
import logging

logger = logging.getLogger(__name__)


@dataclass
class TransactionCost:
    """Complete transaction cost breakdown"""
    commission: float
    slippage: float
    market_impact: float
    spread_cost: float
    total_cost: float
    cost_basis_points: float  # Total cost in basis points
    
    def to_dict(self) -> Dict:
        return {
            'commission': round(self.commission, 4),
            'slippage': round(self.slippage, 4),
            'market_impact': round(self.market_impact, 4),
            'spread_cost': round(self.spread_cost, 4),
            'total_cost': round(self.total_cost, 4),
            'cost_bps': round(self.cost_basis_points, 2)
        }


class RealTransactionCostModel:
    """
    Realistic transaction cost model based on academic research and market data.
    
    This model will give you ACTUAL expected costs, not fantasy numbers.
    """
    
    def __init__(self, 
                 broker: str = 'alpaca',
                 account_type: str = 'retail',
                 average_spread_bps: float = 5.0):
        """
        Initialize cost model
        
        Args:
            broker: Broker name for commission structure
            account_type: 'retail', 'professional', or 'institutional'
            average_spread_bps: Average bid-ask spread in basis points
        """
        self.broker = broker
        self.account_type = account_type
        self.average_spread_bps = average_spread_bps
        
        # Commission structures by broker
        self.commission_models = {
            'alpaca': {'per_share': 0.0, 'minimum': 0.0},  # Free
            'interactive_brokers': {'per_share': 0.005, 'minimum': 1.0},
            'td_ameritrade': {'per_trade': 0.0, 'minimum': 0.0},  # Free
            'charles_schwab': {'per_trade': 0.0, 'minimum': 0.0},  # Free
            'traditional': {'per_share': 0.01, 'minimum': 5.0}  # Old school
        }
        
        # Market impact parameters (based on Almgren-Chriss model)
        self.impact_params = {
            'retail': {'temp_impact': 0.1, 'perm_impact': 0.05},
            'professional': {'temp_impact': 0.08, 'perm_impact': 0.04},
            'institutional': {'temp_impact': 0.06, 'perm_impact': 0.03}
        }
        
    def calculate_transaction_cost(self,
                                  order_size: float,
                                  price: float,
                                  avg_daily_volume: float,
                                  volatility: float,
                                  timestamp: Optional[datetime] = None,
                                  is_aggressive: bool = True) -> TransactionCost:
        """
        Calculate realistic transaction costs for an order.
        
        This is what you'll ACTUALLY pay in the market.
        
        Args:
            order_size: Number of shares (positive for buy, negative for sell)
            price: Current market price
            avg_daily_volume: Average daily volume of the security
            volatility: Daily volatility (standard deviation of returns)
            timestamp: Order timestamp for time-of-day effects
            is_aggressive: True for market orders, False for limit orders
            
        Returns:
            TransactionCost with detailed breakdown
        """
        
        # Get order value
        order_value = abs(order_size * price)
        abs_size = abs(order_size)
        
        # 1. Calculate Commission
        commission = self._calculate_commission(abs_size, price)
        
        # 2. Calculate Spread Cost
        spread_cost = self._calculate_spread_cost(
            abs_size, price, is_aggressive
        )
        
        # 3. Calculate Market Impact (most important for large orders)
        market_impact = self._calculate_market_impact(
            order_size, price, avg_daily_volume, volatility
        )
        
        # 4. Calculate Slippage (execution delay)
        slippage = self._calculate_slippage(
            abs_size, price, volatility, timestamp
        )
        
        # Total cost
        total_cost = commission + spread_cost + market_impact + slippage
        
        # Cost in basis points
        cost_bps = (total_cost / order_value) * 10000 if order_value > 0 else 0
        
        return TransactionCost(
            commission=commission,
            slippage=slippage,
            market_impact=market_impact,
            spread_cost=spread_cost,
            total_cost=total_cost,
            cost_basis_points=cost_bps
        )
    
    def _calculate_commission(self, shares: float, price: float) -> float:
        """Calculate broker commission"""
        model = self.commission_models.get(self.broker, self.commission_models['traditional'])
        
        if 'per_share' in model:
            commission = shares * model['per_share']
        elif 'per_trade' in model:
            commission = model['per_trade']
        else:
            commission = 0
            
        # Apply minimum
        commission = max(commission, model.get('minimum', 0))
        
        return commission
    
    def _calculate_spread_cost(self, shares: float, price: float, is_aggressive: bool) -> float:
        """
        Calculate bid-ask spread cost.
        Aggressive orders cross the spread, passive orders may get price improvement.
        """
        if is_aggressive:
            # Pay half the spread (crossing from mid to ask/bid)
            spread_cost = shares * price * (self.average_spread_bps / 10000) * 0.5
        else:
            # Limit orders might get price improvement
            spread_cost = shares * price * (self.average_spread_bps / 10000) * 0.25
            
        return spread_cost
    
    def _calculate_market_impact(self, 
                                order_size: float,
                                price: float,
                                avg_daily_volume: float,
                                volatility: float) -> float:
        """
        Calculate market impact using square-root model.
        Based on Almgren-Chriss and empirical studies.
        
        Market impact increases with:
        - Order size relative to ADV
        - Volatility
        - Speed of execution
        """
        
        if avg_daily_volume == 0:
            return 0
            
        # Calculate participation rate (what % of volume are we)
        participation_rate = abs(order_size) / avg_daily_volume
        
        # Get impact parameters
        params = self.impact_params[self.account_type]
        
        # Temporary impact (will revert)
        # Formula: temp_impact * volatility * sqrt(participation_rate)
        temp_impact = (
            params['temp_impact'] * 
            volatility * 
            np.sqrt(participation_rate) * 
            abs(order_size) * 
            price
        )
        
        # Permanent impact (information leakage)
        # Formula: perm_impact * participation_rate * order_value
        perm_impact = (
            params['perm_impact'] * 
            participation_rate * 
            abs(order_size) * 
            price
        )
        
        # Large order penalty (non-linear effects kick in)
        if participation_rate > 0.01:  # More than 1% of ADV
            large_order_multiplier = 1 + (participation_rate - 0.01) * 10
            temp_impact *= large_order_multiplier
            perm_impact *= large_order_multiplier
            
        return temp_impact + perm_impact
    
    def _calculate_slippage(self,
                           shares: float,
                           price: float,
                           volatility: float,
                           timestamp: Optional[datetime] = None) -> float:
        """
        Calculate slippage due to execution delay and market movement.
        
        Factors:
        - Volatility (market moves while order executes)
        - Time of day (higher at open/close)
        - Order size (larger orders take longer)
        """
        
        # Base slippage from volatility (assumes 1-minute execution)
        # Volatility is daily, so scale to minute: daily_vol / sqrt(390 minutes)
        minute_volatility = volatility / np.sqrt(390)
        base_slippage = shares * price * minute_volatility * 0.5  # Half a std move
        
        # Time of day adjustment
        time_multiplier = 1.0
        if timestamp:
            market_time = timestamp.time()
            
            # Higher slippage at open (9:30-10:00) and close (3:30-4:00)
            if time(9, 30) <= market_time <= time(10, 0):
                time_multiplier = 2.0  # Double slippage at open
            elif time(15, 30) <= market_time <= time(16, 0):
                time_multiplier = 1.5  # 50% more at close
            elif time(12, 0) <= market_time <= time(13, 0):
                time_multiplier = 0.8  # Lower during lunch
                
        return base_slippage * time_multiplier
    
    def estimate_total_cost_bps(self,
                               participation_rate: float,
                               volatility: float,
                               is_aggressive: bool = True) -> float:
        """
        Quick estimate of total cost in basis points.
        Useful for pre-trade analysis.
        
        Args:
            participation_rate: Order size / ADV
            volatility: Daily volatility
            is_aggressive: Market order vs limit order
            
        Returns:
            Estimated cost in basis points
        """
        
        # Commission (usually negligible for liquid stocks)
        commission_bps = 0.5  # Rough estimate
        
        # Spread cost
        spread_bps = self.average_spread_bps * (0.5 if is_aggressive else 0.25)
        
        # Market impact (main cost for large orders)
        # Rough formula: 10 * volatility * sqrt(participation_rate) * 100
        impact_bps = 1000 * volatility * np.sqrt(participation_rate)
        
        # Slippage
        slippage_bps = 100 * volatility * (2.0 if is_aggressive else 1.0)
        
        # Large order penalty
        if participation_rate > 0.01:
            penalty_multiplier = 1 + (participation_rate - 0.01) * 50
            impact_bps *= penalty_multiplier
            
        total_bps = commission_bps + spread_bps + impact_bps + slippage_bps
        
        return total_bps


class AdvancedCostAnalyzer:
    """
    Analyzes historical trading costs and provides optimization recommendations.
    """
    
    def __init__(self, cost_model: RealTransactionCostModel):
        self.cost_model = cost_model
        self.cost_history = []
        
    def analyze_strategy_costs(self,
                              trades: pd.DataFrame,
                              market_data: pd.DataFrame) -> Dict:
        """
        Analyze actual trading costs for a strategy.
        
        Args:
            trades: DataFrame with columns: timestamp, symbol, size, price
            market_data: DataFrame with volume and volatility data
            
        Returns:
            Dictionary with cost analysis and recommendations
        """
        
        total_costs = []
        cost_breakdown = {
            'commission': 0,
            'spread': 0,
            'impact': 0,
            'slippage': 0
        }
        
        for _, trade in trades.iterrows():
            # Get market conditions at trade time
            volatility = market_data.loc[trade['timestamp'], 'volatility']
            avg_volume = market_data.loc[trade['timestamp'], 'avg_volume']
            
            # Calculate costs
            cost = self.cost_model.calculate_transaction_cost(
                order_size=trade['size'],
                price=trade['price'],
                avg_daily_volume=avg_volume,
                volatility=volatility,
                timestamp=trade['timestamp']
            )
            
            total_costs.append(cost.total_cost)
            cost_breakdown['commission'] += cost.commission
            cost_breakdown['spread'] += cost.spread_cost
            cost_breakdown['impact'] += cost.market_impact
            cost_breakdown['slippage'] += cost.slippage
            
        # Analysis
        total_traded_value = (trades['size'].abs() * trades['price']).sum()
        total_cost = sum(total_costs)
        avg_cost_bps = (total_cost / total_traded_value) * 10000 if total_traded_value > 0 else 0
        
        analysis = {
            'total_cost': total_cost,
            'average_cost_bps': avg_cost_bps,
            'cost_breakdown': {
                k: round(v, 2) for k, v in cost_breakdown.items()
            },
            'cost_breakdown_pct': {
                k: round(100 * v / total_cost, 1) if total_cost > 0 else 0
                for k, v in cost_breakdown.items()
            },
            'recommendations': []
        }
        
        # Provide recommendations
        if avg_cost_bps > 20:
            analysis['recommendations'].append("High trading costs - consider reducing position sizes")
        if cost_breakdown['impact'] > total_cost * 0.5:
            analysis['recommendations'].append("Market impact dominates - trade more liquid securities")
        if cost_breakdown['slippage'] > total_cost * 0.3:
            analysis['recommendations'].append("High slippage - use limit orders or trade during calmer periods")
            
        return analysis
        
    def optimize_execution(self,
                          target_position: float,
                          current_price: float,
                          avg_daily_volume: float,
                          volatility: float,
                          max_cost_bps: float = 20) -> List[Dict]:
        """
        Optimize order execution to minimize costs.
        
        Returns:
            List of child orders to minimize market impact
        """
        
        # Calculate optimal order splitting (VWAP-style)
        participation_rate = abs(target_position) / avg_daily_volume
        
        if participation_rate < 0.001:
            # Small order - execute at once
            return [{
                'size': target_position,
                'type': 'LIMIT',
                'limit_price': current_price * (1.001 if target_position > 0 else 0.999)
            }]
            
        elif participation_rate < 0.01:
            # Medium order - split into 3
            chunk_size = target_position / 3
            return [
                {
                    'size': chunk_size,
                    'type': 'LIMIT',
                    'limit_price': current_price * (1.0005 if target_position > 0 else 0.9995),
                    'delay_seconds': i * 300  # 5 minutes apart
                }
                for i in range(3)
            ]
            
        else:
            # Large order - use TWAP over the day
            num_slices = min(20, int(participation_rate * 1000))
            chunk_size = target_position / num_slices
            
            return [
                {
                    'size': chunk_size,
                    'type': 'LIMIT',
                    'limit_price': current_price * (1.0002 if target_position > 0 else 0.9998),
                    'delay_seconds': i * (23400 / num_slices)  # Spread over 6.5 hours
                }
                for i in range(num_slices)
            ]


def create_realistic_backtest_costs() -> RealTransactionCostModel:
    """
    Create a cost model with realistic parameters for backtesting.
    
    This is what you should use for honest backtesting.
    """
    
    # Realistic retail parameters
    return RealTransactionCostModel(
        broker='alpaca',  # Free commissions but real spreads/impact
        account_type='retail',
        average_spread_bps=10.0  # 10 bps spread for liquid stocks
    )


if __name__ == "__main__":
    # Example: Calculate real costs for a trade
    cost_model = create_realistic_backtest_costs()
    
    # Example trade: Buy 1000 shares at $100, stock trades 1M shares/day
    cost = cost_model.calculate_transaction_cost(
        order_size=1000,
        price=100,
        avg_daily_volume=1_000_000,
        volatility=0.02,  # 2% daily volatility
        is_aggressive=True
    )
    
    print("REALISTIC TRANSACTION COST EXAMPLE")
    print("=" * 40)
    print(f"Order: Buy 1000 shares at $100")
    print(f"Total Cost: ${cost.total_cost:.2f}")
    print(f"Cost in bps: {cost.cost_basis_points:.1f}")
    print(f"Breakdown:")
    print(f"  Commission: ${cost.commission:.2f}")
    print(f"  Spread: ${cost.spread_cost:.2f}")
    print(f"  Market Impact: ${cost.market_impact:.2f}")
    print(f"  Slippage: ${cost.slippage:.2f}")



