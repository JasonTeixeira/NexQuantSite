"""
Market Microstructure Analyzer for Enterprise Quantitative Backtesting Engine
Handles order book reconstruction, trade classification, and market impact modeling
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, field
from enum import Enum
import warnings
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class TradeClassification(Enum):
    """Trade classification types"""
    BUY_INITIATED = "buy_initiated"
    SELL_INITIATED = "sell_initiated"
    UNKNOWN = "unknown"

class OrderBookSide(Enum):
    """Order book side"""
    BID = "bid"
    ASK = "ask"

@dataclass
class OrderBookLevel:
    """Order book level information"""
    price: float
    size: float
    side: OrderBookSide
    timestamp: datetime
    level: int = 0

@dataclass
class OrderBookSnapshot:
    """Order book snapshot"""
    timestamp: datetime
    symbol: str
    bid_levels: List[OrderBookLevel]
    ask_levels: List[OrderBookLevel]
    mid_price: float
    spread: float
    spread_bps: float
    book_imbalance: float
    total_bid_size: float
    total_ask_size: float

@dataclass
class Trade:
    """Trade information"""
    timestamp: datetime
    price: float
    size: float
    side: TradeClassification
    trade_id: str
    order_id: Optional[str] = None
    aggressor: Optional[str] = None

class MarketMicrostructureAnalyzer:
    """
    Advanced market microstructure analyzer
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize market microstructure analyzer
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.order_book_history = {}
        self.trade_history = {}
        self.microstructure_metrics = {}
        
        # Configuration parameters
        self.max_order_book_levels = config.get('max_order_book_levels', 10)
        self.trade_classification_method = config.get('trade_classification_method', 'lee_ready')
        self.market_impact_model = config.get('market_impact_model', 'square_root')
        
        logger.info("Market microstructure analyzer initialized")
    
    def reconstruct_order_book(self, order_book_data: pd.DataFrame, symbol: str) -> List[OrderBookSnapshot]:
        """
        Reconstruct order book from tick data
        
        Args:
            order_book_data: Order book tick data
            symbol: Symbol
            
        Returns:
            List of order book snapshots
        """
        try:
            snapshots = []
            
            # Group by timestamp to get snapshots
            for timestamp, group in order_book_data.groupby('timestamp'):
                bid_levels = []
                ask_levels = []
                
                # Process bid levels
                for i in range(self.max_order_book_levels):
                    bid_price_col = f'bid_price_{i}'
                    bid_size_col = f'bid_size_{i}'
                    
                    if bid_price_col in group.columns and bid_size_col in group.columns:
                        price = group[bid_price_col].iloc[0]
                        size = group[bid_size_col].iloc[0]
                        
                        if pd.notna(price) and pd.notna(size) and size > 0:
                            bid_levels.append(OrderBookLevel(
                                price=price,
                                size=size,
                                side=OrderBookSide.BID,
                                timestamp=timestamp,
                                level=i
                            ))
                
                # Process ask levels
                for i in range(self.max_order_book_levels):
                    ask_price_col = f'ask_price_{i}'
                    ask_size_col = f'ask_size_{i}'
                    
                    if ask_price_col in group.columns and ask_size_col in group.columns:
                        price = group[ask_price_col].iloc[0]
                        size = group[ask_size_col].iloc[0]
                        
                        if pd.notna(price) and pd.notna(size) and size > 0:
                            ask_levels.append(OrderBookLevel(
                                price=price,
                                size=size,
                                side=OrderBookSide.ASK,
                                timestamp=timestamp,
                                level=i
                            ))
                
                # Calculate order book metrics
                if bid_levels and ask_levels:
                    best_bid = max(bid_levels, key=lambda x: x.price)
                    best_ask = min(ask_levels, key=lambda x: x.price)
                    
                    mid_price = (best_bid.price + best_ask.price) / 2
                    spread = best_ask.price - best_bid.price
                    spread_bps = (spread / mid_price) * 10000
                    
                    total_bid_size = sum(level.size for level in bid_levels)
                    total_ask_size = sum(level.size for level in ask_levels)
                    
                    book_imbalance = (total_bid_size - total_ask_size) / (total_bid_size + total_ask_size)
                    
                    snapshot = OrderBookSnapshot(
                        timestamp=timestamp,
                        symbol=symbol,
                        bid_levels=bid_levels,
                        ask_levels=ask_levels,
                        mid_price=mid_price,
                        spread=spread,
                        spread_bps=spread_bps,
                        book_imbalance=book_imbalance,
                        total_bid_size=total_bid_size,
                        total_ask_size=total_ask_size
                    )
                    
                    snapshots.append(snapshot)
            
            # Store in history
            self.order_book_history[symbol] = snapshots
            
            logger.info(f"Reconstructed {len(snapshots)} order book snapshots for {symbol}")
            return snapshots
            
        except Exception as e:
            logger.error(f"Failed to reconstruct order book for {symbol}: {e}")
            raise
    
    def classify_trades(self, trade_data: pd.DataFrame, order_book_data: pd.DataFrame = None) -> List[Trade]:
        """
        Classify trades using various methods
        
        Args:
            trade_data: Trade data
            order_book_data: Optional order book data for classification
            
        Returns:
            List of classified trades
        """
        try:
            trades = []
            
            for _, row in trade_data.iterrows():
                # Basic trade information
                trade = Trade(
                    timestamp=row['timestamp'],
                    price=row['price'],
                    size=row['size'],
                    side=TradeClassification.UNKNOWN,
                    trade_id=str(row.get('trade_id', '')),
                    order_id=row.get('order_id'),
                    aggressor=row.get('aggressor')
                )
                
                # Classify trade based on method
                if self.trade_classification_method == 'lee_ready':
                    trade.side = self._classify_lee_ready(row, order_book_data)
                elif self.trade_classification_method == 'tick_test':
                    trade.side = self._classify_tick_test(row, trade_data)
                elif self.trade_classification_method == 'quote_based':
                    trade.side = self._classify_quote_based(row, order_book_data)
                
                trades.append(trade)
            
            # Store in history
            self.trade_history = trades
            
            logger.info(f"Classified {len(trades)} trades using {self.trade_classification_method} method")
            return trades
            
        except Exception as e:
            logger.error(f"Failed to classify trades: {e}")
            raise
    
    def _classify_lee_ready(self, trade_row: pd.Series, order_book_data: pd.DataFrame) -> TradeClassification:
        """Classify trade using Lee-Ready algorithm"""
        try:
            # Get quote at trade time
            trade_time = trade_row['timestamp']
            
            if order_book_data is not None:
                # Find closest quote before trade
                quotes_before = order_book_data[order_book_data['timestamp'] < trade_time]
                
                if not quotes_before.empty:
                    closest_quote = quotes_before.iloc[-1]
                    mid_price = (closest_quote['bid_price_0'] + closest_quote['ask_price_0']) / 2
                    
                    # Lee-Ready classification
                    trade_price = trade_row['price']
                    
                    if trade_price > mid_price:
                        return TradeClassification.BUY_INITIATED
                    elif trade_price < mid_price:
                        return TradeClassification.SELL_INITIATED
                    else:
                        # Use tick test for trades at mid-price
                        return self._classify_tick_test(trade_row, None)
            
            return TradeClassification.UNKNOWN
            
        except Exception as e:
            logger.warning(f"Lee-Ready classification failed: {e}")
            return TradeClassification.UNKNOWN
    
    def _classify_tick_test(self, trade_row: pd.Series, trade_data: pd.DataFrame) -> TradeClassification:
        """Classify trade using tick test"""
        try:
            trade_time = trade_row['timestamp']
            trade_price = trade_row['price']
            
            if trade_data is not None:
                # Find previous trade
                previous_trades = trade_data[trade_data['timestamp'] < trade_time]
                
                if not previous_trades.empty:
                    prev_price = previous_trades.iloc[-1]['price']
                    
                    if trade_price > prev_price:
                        return TradeClassification.BUY_INITIATED
                    elif trade_price < prev_price:
                        return TradeClassification.SELL_INITIATED
                    else:
                        # Same price - use previous classification
                        prev_trade = previous_trades.iloc[-1]
                        if 'side' in prev_trade:
                            return prev_trade['side']
            
            return TradeClassification.UNKNOWN
            
        except Exception as e:
            logger.warning(f"Tick test classification failed: {e}")
            return TradeClassification.UNKNOWN
    
    def _classify_quote_based(self, trade_row: pd.Series, order_book_data: pd.DataFrame) -> TradeClassification:
        """Classify trade using quote-based method"""
        try:
            trade_time = trade_row['timestamp']
            trade_price = trade_row['price']
            
            if order_book_data is not None:
                # Find quote at trade time
                quotes_at_time = order_book_data[order_book_data['timestamp'] == trade_time]
                
                if not quotes_at_time.empty:
                    quote = quotes_at_time.iloc[0]
                    bid_price = quote['bid_price_0']
                    ask_price = quote['ask_price_0']
                    
                    if trade_price >= ask_price:
                        return TradeClassification.BUY_INITIATED
                    elif trade_price <= bid_price:
                        return TradeClassification.SELL_INITIATED
            
            return TradeClassification.UNKNOWN
            
        except Exception as e:
            logger.warning(f"Quote-based classification failed: {e}")
            return TradeClassification.UNKNOWN
    
    def calculate_market_impact(self, trade_size: float, order_book_snapshot: OrderBookSnapshot,
                              model: str = None) -> Dict[str, float]:
        """
        Calculate market impact of trade
        
        Args:
            trade_size: Size of trade
            order_book_snapshot: Current order book snapshot
            model: Impact model to use
            
        Returns:
            Market impact metrics
        """
        try:
            model = model or self.market_impact_model
            
            if model == 'square_root':
                return self._calculate_square_root_impact(trade_size, order_book_snapshot)
            elif model == 'linear':
                return self._calculate_linear_impact(trade_size, order_book_snapshot)
            elif model == 'almgren_chriss':
                return self._calculate_almgren_chriss_impact(trade_size, order_book_snapshot)
            else:
                return self._calculate_square_root_impact(trade_size, order_book_snapshot)
                
        except Exception as e:
            logger.error(f"Failed to calculate market impact: {e}")
            return {'permanent_impact': 0.0, 'temporary_impact': 0.0, 'total_impact': 0.0}
    
    def _calculate_square_root_impact(self, trade_size: float, 
                                    order_book_snapshot: OrderBookSnapshot) -> Dict[str, float]:
        """Calculate market impact using square root model"""
        try:
            # Square root model: impact = η * sqrt(Q/V)
            # where η is market impact parameter, Q is trade size, V is average volume
            
            # Estimate average volume from order book
            total_liquidity = order_book_snapshot.total_bid_size + order_book_snapshot.total_ask_size
            avg_volume = total_liquidity / 2  # Simplified estimate
            
            # Market impact parameter (calibrated)
            eta = 0.1  # 10 basis points per sqrt(volume)
            
            # Calculate impact
            impact_bps = eta * np.sqrt(trade_size / avg_volume) if avg_volume > 0 else 0
            
            # Convert to price impact
            mid_price = order_book_snapshot.mid_price
            price_impact = mid_price * impact_bps / 10000
            
            return {
                'permanent_impact': price_impact * 0.7,  # 70% permanent
                'temporary_impact': price_impact * 0.3,  # 30% temporary
                'total_impact': price_impact,
                'impact_bps': impact_bps
            }
            
        except Exception as e:
            logger.warning(f"Square root impact calculation failed: {e}")
            return {'permanent_impact': 0.0, 'temporary_impact': 0.0, 'total_impact': 0.0}
    
    def _calculate_linear_impact(self, trade_size: float, 
                               order_book_snapshot: OrderBookSnapshot) -> Dict[str, float]:
        """Calculate market impact using linear model"""
        try:
            # Linear model: impact = γ * Q
            # where γ is linear impact parameter, Q is trade size
            
            # Linear impact parameter (calibrated)
            gamma = 0.0001  # 1 basis point per unit
            
            # Calculate impact
            impact_bps = gamma * trade_size
            
            # Convert to price impact
            mid_price = order_book_snapshot.mid_price
            price_impact = mid_price * impact_bps / 10000
            
            return {
                'permanent_impact': price_impact * 0.5,  # 50% permanent
                'temporary_impact': price_impact * 0.5,  # 50% temporary
                'total_impact': price_impact,
                'impact_bps': impact_bps
            }
            
        except Exception as e:
            logger.warning(f"Linear impact calculation failed: {e}")
            return {'permanent_impact': 0.0, 'temporary_impact': 0.0, 'total_impact': 0.0}
    
    def _calculate_almgren_chriss_impact(self, trade_size: float, 
                                       order_book_snapshot: OrderBookSnapshot) -> Dict[str, float]:
        """Calculate market impact using Almgren-Chriss model"""
        try:
            # Almgren-Chriss model: impact = η * Q + γ * Q^2
            # where η is temporary impact, γ is permanent impact
            
            # Impact parameters (calibrated)
            eta = 0.05  # Temporary impact parameter
            gamma = 0.0001  # Permanent impact parameter
            
            # Calculate impacts
            temporary_impact_bps = eta * trade_size
            permanent_impact_bps = gamma * trade_size ** 2
            
            # Convert to price impact
            mid_price = order_book_snapshot.mid_price
            temporary_impact = mid_price * temporary_impact_bps / 10000
            permanent_impact = mid_price * permanent_impact_bps / 10000
            
            return {
                'permanent_impact': permanent_impact,
                'temporary_impact': temporary_impact,
                'total_impact': permanent_impact + temporary_impact,
                'permanent_impact_bps': permanent_impact_bps,
                'temporary_impact_bps': temporary_impact_bps
            }
            
        except Exception as e:
            logger.warning(f"Almgren-Chriss impact calculation failed: {e}")
            return {'permanent_impact': 0.0, 'temporary_impact': 0.0, 'total_impact': 0.0}
    
    def calculate_microstructure_metrics(self, order_book_snapshots: List[OrderBookSnapshot],
                                       trades: List[Trade]) -> Dict[str, Any]:
        """
        Calculate comprehensive microstructure metrics
        
        Args:
            order_book_snapshots: Order book snapshots
            trades: Classified trades
            
        Returns:
            Microstructure metrics
        """
        try:
            metrics = {}
            
            # Order book metrics
            if order_book_snapshots:
                metrics.update(self._calculate_order_book_metrics(order_book_snapshots))
            
            # Trade metrics
            if trades:
                metrics.update(self._calculate_trade_metrics(trades))
            
            # Combined metrics
            if order_book_snapshots and trades:
                metrics.update(self._calculate_combined_metrics(order_book_snapshots, trades))
            
            # Store metrics
            self.microstructure_metrics = metrics
            
            logger.info(f"Calculated {len(metrics)} microstructure metrics")
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to calculate microstructure metrics: {e}")
            return {}
    
    def _calculate_order_book_metrics(self, snapshots: List[OrderBookSnapshot]) -> Dict[str, float]:
        """Calculate order book-based metrics"""
        try:
            spreads = [s.spread_bps for s in snapshots]
            imbalances = [s.book_imbalance for s in snapshots]
            mid_prices = [s.mid_price for s in snapshots]
            
            return {
                'avg_spread_bps': np.mean(spreads),
                'spread_volatility': np.std(spreads),
                'avg_book_imbalance': np.mean(imbalances),
                'book_imbalance_volatility': np.std(imbalances),
                'price_volatility': np.std(np.diff(mid_prices)),
                'order_book_depth': np.mean([len(s.bid_levels) + len(s.ask_levels) for s in snapshots]),
                'total_liquidity': np.mean([s.total_bid_size + s.total_ask_size for s in snapshots])
            }
            
        except Exception as e:
            logger.warning(f"Order book metrics calculation failed: {e}")
            return {}
    
    def _calculate_trade_metrics(self, trades: List[Trade]) -> Dict[str, float]:
        """Calculate trade-based metrics"""
        try:
            prices = [t.price for t in trades]
            sizes = [t.size for t in trades]
            buy_trades = [t for t in trades if t.side == TradeClassification.BUY_INITIATED]
            sell_trades = [t for t in trades if t.side == TradeClassification.SELL_INITIATED]
            
            return {
                'avg_trade_size': np.mean(sizes),
                'trade_size_volatility': np.std(sizes),
                'buy_ratio': len(buy_trades) / len(trades) if trades else 0,
                'sell_ratio': len(sell_trades) / len(trades) if trades else 0,
                'price_impact': np.std(np.diff(prices)),
                'trade_frequency': len(trades) / (trades[-1].timestamp - trades[0].timestamp).total_seconds() if len(trades) > 1 else 0
            }
            
        except Exception as e:
            logger.warning(f"Trade metrics calculation failed: {e}")
            return {}
    
    def _calculate_combined_metrics(self, snapshots: List[OrderBookSnapshot], 
                                  trades: List[Trade]) -> Dict[str, float]:
        """Calculate combined order book and trade metrics"""
        try:
            # Kyle's lambda (price impact parameter)
            price_changes = []
            signed_volumes = []
            
            for i in range(1, len(trades)):
                price_change = trades[i].price - trades[i-1].price
                signed_volume = trades[i].size if trades[i].side == TradeClassification.BUY_INITIATED else -trades[i].size
                
                price_changes.append(price_change)
                signed_volumes.append(signed_volume)
            
            if price_changes and signed_volumes:
                # Calculate Kyle's lambda using linear regression
                X = np.array(signed_volumes).reshape(-1, 1)
                y = np.array(price_changes)
                
                reg = LinearRegression()
                reg.fit(X, y)
                kyles_lambda = reg.coef_[0]
            else:
                kyles_lambda = 0.0
            
            # VPIN (Volume-synchronized Probability of Informed Trading)
            if len(trades) >= 50:
                vpin = self._calculate_vpin(trades)
            else:
                vpin = 0.0
            
            return {
                'kyles_lambda': kyles_lambda,
                'vpin': vpin,
                'order_flow_imbalance': np.mean([s.book_imbalance for s in snapshots]),
                'price_efficiency': 1.0 / (1.0 + np.std([s.spread_bps for s in snapshots]))
            }
            
        except Exception as e:
            logger.warning(f"Combined metrics calculation failed: {e}")
            return {}
    
    def _calculate_vpin(self, trades: List[Trade], n_buckets: int = 50) -> float:
        """Calculate VPIN (Volume-synchronized Probability of Informed Trading)"""
        try:
            if len(trades) < n_buckets:
                return 0.0
            
            # Calculate total volume
            total_volume = sum(t.size for t in trades)
            bucket_volume = total_volume / n_buckets
            
            # Create volume buckets
            buckets = []
            current_bucket = []
            current_volume = 0
            
            for trade in trades:
                current_bucket.append(trade)
                current_volume += trade.size
                
                if current_volume >= bucket_volume:
                    buckets.append(current_bucket)
                    current_bucket = []
                    current_volume = 0
            
            # Calculate VPIN
            bucket_imbalances = []
            
            for bucket in buckets:
                buy_volume = sum(t.size for t in bucket if t.side == TradeClassification.BUY_INITIATED)
                sell_volume = sum(t.size for t in bucket if t.side == TradeClassification.SELL_INITIATED)
                total_bucket_volume = buy_volume + sell_volume
                
                if total_bucket_volume > 0:
                    imbalance = abs(buy_volume - sell_volume) / total_bucket_volume
                    bucket_imbalances.append(imbalance)
            
            return np.mean(bucket_imbalances) if bucket_imbalances else 0.0
            
        except Exception as e:
            logger.warning(f"VPIN calculation failed: {e}")
            return 0.0
    
    def get_microstructure_summary(self, symbol: str) -> Dict[str, Any]:
        """
        Get microstructure summary for symbol
        
        Args:
            symbol: Symbol
            
        Returns:
            Microstructure summary
        """
        try:
            summary = {
                'symbol': symbol,
                'order_book_snapshots': len(self.order_book_history.get(symbol, [])),
                'trades': len(self.trade_history),
                'metrics': self.microstructure_metrics.copy(),
                'analysis_timestamp': datetime.now()
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get microstructure summary for {symbol}: {e}")
            return {}
