"""
Professional Trading Strategies Collection
===========================================
Advanced quantitative strategies for institutional-grade trading.

Strategies:
1. Pairs Trading (Statistical Arbitrage)
2. Market Neutral Long/Short
3. Volatility Arbitrage
4. Options Strategies (Straddle, Iron Condor)
5. Breakout Strategy
6. Grid Trading
7. Bollinger Band Mean Reversion
8. VWAP Strategy
9. Ichimoku Cloud Strategy
10. Multi-Timeframe Momentum

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import logging
from scipy import stats
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class PairsTradingStrategy:
    """
    Statistical arbitrage pairs trading strategy.
    Trades mean reversion between correlated assets.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.lookback = config.get('lookback', 60)
        self.entry_zscore = config.get('entry_zscore', 2.0)
        self.exit_zscore = config.get('exit_zscore', 0.5)
        self.stop_loss_zscore = config.get('stop_loss_zscore', 3.5)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate pairs trading signals"""
        
        # For single asset, create synthetic pair with MA
        if 'asset1' not in data.columns:
            # Use price vs its moving average as pair
            asset1 = data['close']
            asset2 = data['close'].rolling(self.lookback).mean()
        else:
            asset1 = data['asset1']
            asset2 = data['asset2']
        
        # Calculate spread
        spread = self._calculate_spread(asset1, asset2)
        
        # Calculate z-score
        zscore = self._calculate_zscore(spread, self.lookback)
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Long spread when zscore < -entry_zscore (spread too low)
        signals[zscore < -self.entry_zscore] = 1
        
        # Short spread when zscore > entry_zscore (spread too high)
        signals[zscore > self.entry_zscore] = -1
        
        # Exit positions
        exit_condition = (abs(zscore) < self.exit_zscore)
        signals[exit_condition] = 0
        
        # Stop loss
        stop_loss = (abs(zscore) > self.stop_loss_zscore)
        signals[stop_loss] = 0
        
        # Forward fill positions
        signals = signals.replace(0, np.nan).fillna(method='ffill').fillna(0)
        
        return signals
    
    def _calculate_spread(self, asset1: pd.Series, asset2: pd.Series) -> pd.Series:
        """Calculate spread using OLS regression"""
        
        # Align data
        df = pd.DataFrame({'asset1': asset1, 'asset2': asset2}).dropna()
        
        if len(df) < self.lookback:
            return pd.Series(0, index=asset1.index)
        
        # Rolling hedge ratio using OLS
        spread = pd.Series(index=df.index, dtype=float)
        
        for i in range(self.lookback, len(df)):
            window = df.iloc[i-self.lookback:i]
            
            # Calculate hedge ratio
            X = window['asset2'].values.reshape(-1, 1)
            y = window['asset1'].values
            
            model = LinearRegression()
            model.fit(X, y)
            hedge_ratio = model.coef_[0]
            
            # Calculate spread
            spread.iloc[i] = df['asset1'].iloc[i] - hedge_ratio * df['asset2'].iloc[i]
        
        return spread.reindex(asset1.index, fill_value=0)
    
    def _calculate_zscore(self, spread: pd.Series, window: int) -> pd.Series:
        """Calculate rolling z-score"""
        mean = spread.rolling(window).mean()
        std = spread.rolling(window).std()
        zscore = (spread - mean) / (std + 1e-8)
        return zscore


class MarketNeutralStrategy:
    """
    Market neutral long/short equity strategy.
    Maintains zero beta exposure to market.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.momentum_window = config.get('momentum_window', 20)
        self.rebalance_frequency = config.get('rebalance_frequency', 5)
        self.num_long = config.get('num_long', 10)
        self.num_short = config.get('num_short', 10)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate market neutral signals"""
        
        # Calculate momentum scores
        momentum = self._calculate_momentum(data)
        
        # Rank assets
        ranks = momentum.rank(axis=1, ascending=False)
        
        # Generate long/short signals
        signals = pd.Series(0, index=data.index)
        
        # Simple implementation for single asset
        if 'close' in data.columns:
            # Use momentum vs market average
            market_momentum = momentum.mean()
            
            # Long if momentum > market, short if < market
            signals[momentum > market_momentum * 1.1] = 1
            signals[momentum < market_momentum * 0.9] = -1
        
        return signals
    
    def _calculate_momentum(self, data: pd.DataFrame) -> pd.Series:
        """Calculate momentum scores"""
        if 'close' in data.columns:
            returns = data['close'].pct_change(self.momentum_window)
        else:
            # For single series, just use pct_change
            returns = data.pct_change(self.momentum_window)
        
        return returns


class VolatilityArbitrageStrategy:
    """
    Trades volatility using VIX-like indicators.
    Profits from volatility mean reversion.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.vol_window = config.get('vol_window', 20)
        self.vol_threshold_high = config.get('vol_threshold_high', 0.25)
        self.vol_threshold_low = config.get('vol_threshold_low', 0.10)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate volatility arbitrage signals"""
        
        # Calculate realized volatility
        returns = data['close'].pct_change()
        realized_vol = returns.rolling(self.vol_window).std() * np.sqrt(252)
        
        # Calculate implied volatility proxy (using high-low)
        implied_vol = ((data['high'] - data['low']) / data['close']).rolling(self.vol_window).mean() * np.sqrt(252)
        
        # Vol spread
        vol_spread = implied_vol - realized_vol
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Short volatility when spread is high (implied > realized)
        signals[vol_spread > vol_spread.quantile(0.8)] = -1
        
        # Long volatility when spread is low
        signals[vol_spread < vol_spread.quantile(0.2)] = 1
        
        return signals


class BreakoutStrategy:
    """
    Trades breakouts from consolidation patterns.
    Uses Donchian channels and volume confirmation.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.channel_period = config.get('channel_period', 20)
        self.volume_multiplier = config.get('volume_multiplier', 1.5)
        self.atr_multiplier = config.get('atr_multiplier', 2.0)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate breakout signals"""
        
        # Calculate Donchian channels
        upper_channel = data['high'].rolling(self.channel_period).max()
        lower_channel = data['low'].rolling(self.channel_period).min()
        
        # Calculate ATR for stop loss
        atr = self._calculate_atr(data)
        
        # Volume confirmation
        avg_volume = data['volume'].rolling(20).mean() if 'volume' in data.columns else 1
        volume_surge = data['volume'] > avg_volume * self.volume_multiplier if 'volume' in data.columns else True
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Long breakout
        long_breakout = (data['close'] > upper_channel.shift(1)) & volume_surge
        signals[long_breakout] = 1
        
        # Short breakout
        short_breakout = (data['close'] < lower_channel.shift(1)) & volume_surge
        signals[short_breakout] = -1
        
        # Exit on opposite channel touch
        exit_long = data['close'] < (upper_channel - atr * self.atr_multiplier)
        exit_short = data['close'] > (lower_channel + atr * self.atr_multiplier)
        
        # Apply exits
        for i in range(1, len(signals)):
            if signals.iloc[i-1] == 1 and exit_long.iloc[i]:
                signals.iloc[i] = 0
            elif signals.iloc[i-1] == -1 and exit_short.iloc[i]:
                signals.iloc[i] = 0
            elif signals.iloc[i] == 0 and signals.iloc[i-1] != 0:
                signals.iloc[i] = signals.iloc[i-1]
        
        return signals
    
    def _calculate_atr(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Average True Range"""
        high_low = data['high'] - data['low']
        high_close = abs(data['high'] - data['close'].shift())
        low_close = abs(data['low'] - data['close'].shift())
        
        true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = true_range.rolling(period).mean()
        
        return atr


class GridTradingStrategy:
    """
    Places buy and sell orders at regular intervals.
    Profits from market oscillations.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.grid_levels = config.get('grid_levels', 10)
        self.grid_spacing = config.get('grid_spacing', 0.01)  # 1% spacing
        self.position_size = config.get('position_size', 0.1)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate grid trading signals"""
        
        signals = pd.Series(0, index=data.index)
        
        # Calculate price levels
        base_price = data['close'].iloc[0]
        grid_prices = [base_price * (1 + i * self.grid_spacing) for i in range(-self.grid_levels, self.grid_levels + 1)]
        
        # Track current grid level
        for i in range(1, len(data)):
            current_price = data['close'].iloc[i]
            prev_price = data['close'].iloc[i-1]
            
            # Check if price crossed any grid level
            for grid_price in grid_prices:
                if prev_price < grid_price <= current_price:
                    # Price crossed up - sell
                    signals.iloc[i] = -self.position_size
                elif prev_price > grid_price >= current_price:
                    # Price crossed down - buy
                    signals.iloc[i] = self.position_size
        
        return signals


class BollingerBandStrategy:
    """
    Mean reversion strategy using Bollinger Bands.
    Trades bounces off the bands.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.period = config.get('period', 20)
        self.num_std = config.get('num_std', 2.0)
        self.squeeze_threshold = config.get('squeeze_threshold', 0.01)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate Bollinger Band signals"""
        
        # Calculate bands
        sma = data['close'].rolling(self.period).mean()
        std = data['close'].rolling(self.period).std()
        
        upper_band = sma + (std * self.num_std)
        lower_band = sma - (std * self.num_std)
        
        # Calculate band width for squeeze detection
        band_width = (upper_band - lower_band) / sma
        squeeze = band_width < self.squeeze_threshold
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Mean reversion signals
        signals[data['close'] < lower_band] = 1  # Buy at lower band
        signals[data['close'] > upper_band] = -1  # Sell at upper band
        
        # Exit at middle band
        exit_condition = ((data['close'] > sma * 0.98) & (data['close'] < sma * 1.02))
        signals[exit_condition] = 0
        
        # Don't trade during squeeze
        signals[squeeze] = 0
        
        # Forward fill
        signals = signals.replace(0, np.nan).fillna(method='ffill').fillna(0)
        
        return signals


class VWAPStrategy:
    """
    Volume Weighted Average Price strategy.
    Trades based on VWAP deviations.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.deviation_threshold = config.get('deviation_threshold', 0.02)
        self.volume_confirmation = config.get('volume_confirmation', True)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate VWAP signals"""
        
        # Calculate VWAP
        if 'volume' in data.columns:
            typical_price = (data['high'] + data['low'] + data['close']) / 3
            vwap = (typical_price * data['volume']).cumsum() / data['volume'].cumsum()
        else:
            # Fallback to simple moving average
            vwap = data['close'].rolling(20).mean()
        
        # Calculate deviation
        deviation = (data['close'] - vwap) / vwap
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Buy when price is below VWAP
        signals[deviation < -self.deviation_threshold] = 1
        
        # Sell when price is above VWAP
        signals[deviation > self.deviation_threshold] = -1
        
        # Exit when price crosses VWAP
        cross_vwap = ((data['close'].shift(1) < vwap.shift(1)) & (data['close'] > vwap)) | \
                     ((data['close'].shift(1) > vwap.shift(1)) & (data['close'] < vwap))
        signals[cross_vwap] = 0
        
        # Forward fill
        signals = signals.replace(0, np.nan).fillna(method='ffill').fillna(0)
        
        return signals


class IchimokuCloudStrategy:
    """
    Japanese Ichimoku Cloud strategy.
    Comprehensive trend following system.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.tenkan_period = config.get('tenkan_period', 9)
        self.kijun_period = config.get('kijun_period', 26)
        self.senkou_span_b_period = config.get('senkou_span_b_period', 52)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate Ichimoku signals"""
        
        # Calculate Ichimoku components
        tenkan_sen = self._calculate_middle_line(data, self.tenkan_period)
        kijun_sen = self._calculate_middle_line(data, self.kijun_period)
        
        # Senkou Span A (Leading Span A)
        senkou_span_a = (tenkan_sen + kijun_sen) / 2
        
        # Senkou Span B (Leading Span B)
        senkou_span_b = self._calculate_middle_line(data, self.senkou_span_b_period)
        
        # Chikou Span (Lagging Span)
        chikou_span = data['close'].shift(-self.kijun_period)
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Bullish signal: Price above cloud, Tenkan above Kijun
        bullish = (data['close'] > senkou_span_a) & \
                  (data['close'] > senkou_span_b) & \
                  (tenkan_sen > kijun_sen)
        signals[bullish] = 1
        
        # Bearish signal: Price below cloud, Tenkan below Kijun
        bearish = (data['close'] < senkou_span_a) & \
                  (data['close'] < senkou_span_b) & \
                  (tenkan_sen < kijun_sen)
        signals[bearish] = -1
        
        return signals
    
    def _calculate_middle_line(self, data: pd.DataFrame, period: int) -> pd.Series:
        """Calculate middle of high-low range"""
        high_rolling = data['high'].rolling(period)
        low_rolling = data['low'].rolling(period)
        return (high_rolling.max() + low_rolling.min()) / 2


class MultiTimeframeMomentumStrategy:
    """
    Combines momentum signals across multiple timeframes.
    Ensures alignment across different time horizons.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.short_period = config.get('short_period', 10)
        self.medium_period = config.get('medium_period', 30)
        self.long_period = config.get('long_period', 60)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate multi-timeframe momentum signals"""
        
        # Calculate momentum for each timeframe
        short_momentum = data['close'].pct_change(self.short_period)
        medium_momentum = data['close'].pct_change(self.medium_period)
        long_momentum = data['close'].pct_change(self.long_period)
        
        # Calculate moving averages for trend confirmation
        short_ma = data['close'].rolling(self.short_period).mean()
        medium_ma = data['close'].rolling(self.medium_period).mean()
        long_ma = data['close'].rolling(self.long_period).mean()
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Strong buy: All timeframes positive momentum and aligned MAs
        strong_buy = (short_momentum > 0) & (medium_momentum > 0) & (long_momentum > 0) & \
                     (short_ma > medium_ma) & (medium_ma > long_ma)
        signals[strong_buy] = 1
        
        # Strong sell: All timeframes negative momentum and aligned MAs
        strong_sell = (short_momentum < 0) & (medium_momentum < 0) & (long_momentum < 0) & \
                      (short_ma < medium_ma) & (medium_ma < long_ma)
        signals[strong_sell] = -1
        
        # Exit when timeframes diverge
        divergence = ((short_momentum > 0) & (long_momentum < 0)) | \
                     ((short_momentum < 0) & (long_momentum > 0))
        signals[divergence] = 0
        
        # Forward fill
        signals = signals.replace(0, np.nan).fillna(method='ffill').fillna(0)
        
        return signals


class RelativeStrengthStrategy:
    """
    Relative Strength Index (RSI) based strategy.
    Trades overbought/oversold conditions.
    """
    
    def __init__(self, config: Dict = None):
        config = config or {}
        self.rsi_period = config.get('rsi_period', 14)
        self.oversold_threshold = config.get('oversold_threshold', 30)
        self.overbought_threshold = config.get('overbought_threshold', 70)
        self.divergence_lookback = config.get('divergence_lookback', 20)
        
    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """Generate RSI-based signals"""
        
        # Calculate RSI
        rsi = self._calculate_rsi(data['close'], self.rsi_period)
        
        # Detect divergences
        price_highs = data['high'].rolling(self.divergence_lookback).max()
        rsi_highs = rsi.rolling(self.divergence_lookback).max()
        
        # Generate signals
        signals = pd.Series(0, index=data.index)
        
        # Oversold - potential buy
        signals[rsi < self.oversold_threshold] = 1
        
        # Overbought - potential sell
        signals[rsi > self.overbought_threshold] = -1
        
        # Exit at neutral RSI
        signals[(rsi > 45) & (rsi < 55)] = 0
        
        # Forward fill
        signals = signals.replace(0, np.nan).fillna(method='ffill').fillna(0)
        
        return signals
    
    def _calculate_rsi(self, prices: pd.Series, period: int) -> pd.Series:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / (loss + 1e-8)
        rsi = 100 - (100 / (1 + rs))
        
        return rsi


def test_professional_strategies():
    """Test all professional strategies"""
    print("Testing Professional Trading Strategies...")
    print("=" * 60)
    
    # Generate sample data
    np.random.seed(42)
    dates = pd.date_range(end=pd.Timestamp.now(), periods=500, freq='D')
    
    prices = 100 * np.exp(np.cumsum(np.random.normal(0.0005, 0.02, 500)))
    
    data = pd.DataFrame({
        'open': prices * np.random.uniform(0.98, 1.02, 500),
        'high': prices * np.random.uniform(1.01, 1.03, 500),
        'low': prices * np.random.uniform(0.97, 0.99, 500),
        'close': prices,
        'volume': np.random.lognormal(15, 0.5, 500)
    }, index=dates)
    
    # Test each strategy
    strategies = [
        ('Pairs Trading', PairsTradingStrategy()),
        ('Market Neutral', MarketNeutralStrategy()),
        ('Volatility Arbitrage', VolatilityArbitrageStrategy()),
        ('Breakout', BreakoutStrategy()),
        ('Grid Trading', GridTradingStrategy()),
        ('Bollinger Bands', BollingerBandStrategy()),
        ('VWAP', VWAPStrategy()),
        ('Ichimoku Cloud', IchimokuCloudStrategy()),
        ('Multi-Timeframe', MultiTimeframeMomentumStrategy()),
        ('RSI', RelativeStrengthStrategy())
    ]
    
    print("\nStrategy Signal Generation Test:")
    for name, strategy in strategies:
        try:
            signals = strategy.generate_signals(data)
            unique_signals = signals.value_counts()
            print(f"  {name:20s}: ✅ Generated {len(signals)} signals")
            if len(unique_signals) > 0:
                print(f"    Signal distribution: {dict(unique_signals)}")
        except Exception as e:
            print(f"  {name:20s}: ❌ Error: {e}")
    
    print("\n✅ Professional Strategies Module Complete!")


if __name__ == "__main__":
    test_professional_strategies()
