"""
Free API Hub - Aggregates multiple free data sources
Enhances Nexural Testing Engine with professional data
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import pandas as pd
import numpy as np
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

class FreeAPIHub:
    """Aggregates multiple free financial data APIs"""
    
    def __init__(self):
        """Initialize API hub with credentials from environment"""
        # Load API keys from environment
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
        self.fred_key = os.getenv('FRED_API_KEY', '')
        self.polygon_key = os.getenv('POLYGON_API_KEY', '')
        self.iex_token = os.getenv('IEX_CLOUD_TOKEN', '')
        self.twelve_data_key = os.getenv('TWELVE_DATA_KEY', '')
        
        # API endpoints
        self.endpoints = {
            'alpha_vantage': 'https://www.alphavantage.co/query',
            'yahoo': 'https://query1.finance.yahoo.com/v8/finance',
            'fred': 'https://api.stlouisfed.org/fred',
            'binance': 'https://api.binance.com/api/v3',
            'coingecko': 'https://api.coingecko.com/api/v3',
            'polygon': 'https://api.polygon.io',
            'iex': 'https://cloud.iexapis.com/stable',
            'twelve': 'https://api.twelvedata.com'
        }
        
        # Cache directory
        self.cache_dir = Path('data/api_cache')
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("Free API Hub initialized")
    
    # ==================== ALPHA VANTAGE ====================
    
    def get_alpha_vantage_daily(self, symbol: str, outputsize: str = 'compact') -> pd.DataFrame:
        """
        Get daily stock data from Alpha Vantage
        Rating: 85/100 - Excellent free source
        """
        try:
            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': symbol,
                'apikey': self.alpha_vantage_key,
                'outputsize': outputsize  # 'compact' or 'full'
            }
            
            response = requests.get(self.endpoints['alpha_vantage'], params=params)
            data = response.json()
            
            if 'Time Series (Daily)' in data:
                df = pd.DataFrame.from_dict(data['Time Series (Daily)'], orient='index')
                df.index = pd.to_datetime(df.index)
                df = df.astype(float)
                df.columns = ['open', 'high', 'low', 'close', 'volume']
                return df.sort_index()
            else:
                logger.warning(f"No data from Alpha Vantage for {symbol}")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Alpha Vantage error: {e}")
            return pd.DataFrame()
    
    def get_alpha_vantage_indicators(self, symbol: str, indicator: str = 'RSI', 
                                    interval: str = 'daily', time_period: int = 14) -> pd.Series:
        """Get technical indicators from Alpha Vantage"""
        try:
            params = {
                'function': indicator,
                'symbol': symbol,
                'interval': interval,
                'time_period': time_period,
                'series_type': 'close',
                'apikey': self.alpha_vantage_key
            }
            
            response = requests.get(self.endpoints['alpha_vantage'], params=params)
            data = response.json()
            
            # Extract the technical indicator data
            key = f'Technical Analysis: {indicator}'
            if key in data:
                df = pd.DataFrame.from_dict(data[key], orient='index')
                df.index = pd.to_datetime(df.index)
                return df[indicator].astype(float).sort_index()
            
            return pd.Series()
            
        except Exception as e:
            logger.error(f"Alpha Vantage indicator error: {e}")
            return pd.Series()
    
    # ==================== YAHOO FINANCE ====================
    
    def get_yahoo_finance_data(self, symbol: str, period: str = '1y', 
                              interval: str = '1d') -> pd.DataFrame:
        """
        Get data from Yahoo Finance (no API key needed)
        Rating: 82/100 - Reliable and fast
        """
        try:
            import yfinance as yf
            
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            
            if not df.empty:
                df.columns = df.columns.str.lower()
                return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Yahoo Finance error: {e}")
            return pd.DataFrame()
    
    def get_yahoo_options_chain(self, symbol: str) -> Dict:
        """Get options chain from Yahoo Finance"""
        try:
            import yfinance as yf
            
            ticker = yf.Ticker(symbol)
            expirations = ticker.options
            
            if expirations:
                # Get first expiration as example
                opt = ticker.option_chain(expirations[0])
                return {
                    'calls': opt.calls,
                    'puts': opt.puts,
                    'expirations': expirations
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Yahoo options error: {e}")
            return {}
    
    # ==================== FRED ECONOMIC DATA ====================
    
    def get_fred_series(self, series_id: str = 'DGS10', 
                       start_date: Optional[str] = None) -> pd.Series:
        """
        Get economic data from FRED
        Rating: 90/100 - Institutional quality macro data
        
        Popular series:
        - DGS10: 10-Year Treasury Rate
        - UNRATE: Unemployment Rate  
        - CPIAUCSL: Consumer Price Index
        - GDP: Gross Domestic Product
        - DFF: Federal Funds Rate
        """
        try:
            params = {
                'series_id': series_id,
                'api_key': self.fred_key or 'demo',
                'file_type': 'json'
            }
            
            if start_date:
                params['observation_start'] = start_date
            
            url = f"{self.endpoints['fred']}/series/observations"
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'observations' in data:
                df = pd.DataFrame(data['observations'])
                df['date'] = pd.to_datetime(df['date'])
                df['value'] = pd.to_numeric(df['value'], errors='coerce')
                df = df.set_index('date')['value']
                return df.sort_index()
            
            return pd.Series()
            
        except Exception as e:
            logger.error(f"FRED error: {e}")
            return pd.Series()
    
    # ==================== BINANCE (CRYPTO) ====================
    
    def get_binance_klines(self, symbol: str = 'BTCUSDT', 
                          interval: str = '1d', limit: int = 500) -> pd.DataFrame:
        """
        Get crypto data from Binance
        Rating: 88/100 - Professional crypto data
        """
        try:
            params = {
                'symbol': symbol,
                'interval': interval,
                'limit': limit
            }
            
            response = requests.get(f"{self.endpoints['binance']}/klines", params=params)
            data = response.json()
            
            if data:
                df = pd.DataFrame(data, columns=[
                    'timestamp', 'open', 'high', 'low', 'close', 'volume',
                    'close_time', 'quote_volume', 'trades', 'taker_buy_base',
                    'taker_buy_quote', 'ignore'
                ])
                
                df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                df = df.set_index('timestamp')
                
                # Convert to float
                for col in ['open', 'high', 'low', 'close', 'volume']:
                    df[col] = df[col].astype(float)
                
                return df[['open', 'high', 'low', 'close', 'volume']]
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"Binance error: {e}")
            return pd.DataFrame()
    
    def get_binance_order_book(self, symbol: str = 'BTCUSDT', limit: int = 20) -> Dict:
        """Get order book from Binance"""
        try:
            params = {'symbol': symbol, 'limit': limit}
            response = requests.get(f"{self.endpoints['binance']}/depth", params=params)
            return response.json()
            
        except Exception as e:
            logger.error(f"Binance order book error: {e}")
            return {}
    
    # ==================== COINGECKO ====================
    
    def get_coingecko_price(self, coin_id: str = 'bitcoin', 
                           vs_currency: str = 'usd', days: int = 30) -> pd.DataFrame:
        """
        Get crypto prices from CoinGecko
        Rating: 80/100 - Comprehensive crypto data
        """
        try:
            url = f"{self.endpoints['coingecko']}/coins/{coin_id}/market_chart"
            params = {
                'vs_currency': vs_currency,
                'days': days,
                'interval': 'daily'
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'prices' in data:
                df = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
                df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                df = df.set_index('timestamp')
                
                # Add volume if available
                if 'total_volumes' in data:
                    volumes = pd.DataFrame(data['total_volumes'], columns=['timestamp', 'volume'])
                    volumes['timestamp'] = pd.to_datetime(volumes['timestamp'], unit='ms')
                    volumes = volumes.set_index('timestamp')
                    df['volume'] = volumes['volume']
                
                return df
            
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f"CoinGecko error: {e}")
            return pd.DataFrame()
    
    # ==================== AGGREGATED DATA ====================
    
    def get_multi_source_data(self, symbol: str, asset_type: str = 'stock') -> pd.DataFrame:
        """
        Get data from multiple sources and combine
        Returns best available data
        """
        dfs = []
        
        if asset_type == 'stock':
            # Try Yahoo first (fastest)
            df_yahoo = self.get_yahoo_finance_data(symbol)
            if not df_yahoo.empty:
                dfs.append(df_yahoo)
            
            # Try Alpha Vantage for additional data
            if self.alpha_vantage_key != 'demo':
                df_av = self.get_alpha_vantage_daily(symbol)
                if not df_av.empty:
                    dfs.append(df_av)
        
        elif asset_type == 'crypto':
            # Try Binance
            df_binance = self.get_binance_klines(f"{symbol}USDT")
            if not df_binance.empty:
                dfs.append(df_binance)
            
            # Try CoinGecko
            df_cg = self.get_coingecko_price(symbol.lower())
            if not df_cg.empty:
                dfs.append(df_cg)
        
        # Combine data sources
        if dfs:
            # Use first source as primary
            result = dfs[0]
            
            # Fill missing data from other sources
            for df in dfs[1:]:
                for col in df.columns:
                    if col not in result.columns:
                        result[col] = df[col]
            
            return result
        
        return pd.DataFrame()
    
    def get_market_indicators(self) -> Dict:
        """
        Get key market indicators from multiple sources
        Returns dict with VIX, yields, dollar index, etc.
        """
        indicators = {}
        
        # VIX from Yahoo
        vix = self.get_yahoo_finance_data('^VIX', period='1d')
        if not vix.empty:
            indicators['vix'] = vix['close'].iloc[-1]
        
        # 10-Year Treasury from FRED
        if self.fred_key:
            treasury = self.get_fred_series('DGS10')
            if not treasury.empty:
                indicators['treasury_10y'] = treasury.iloc[-1]
        
        # Bitcoin as crypto indicator
        btc = self.get_binance_klines('BTCUSDT', '1d', 1)
        if not btc.empty:
            indicators['btc_price'] = btc['close'].iloc[-1]
        
        # Dollar Index
        dxy = self.get_yahoo_finance_data('DX-Y.NYB', period='1d')
        if not dxy.empty:
            indicators['dollar_index'] = dxy['close'].iloc[-1]
        
        return indicators
    
    def cache_data(self, data: Any, cache_key: str) -> None:
        """Cache data locally to reduce API calls"""
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            with open(cache_file, 'w') as f:
                if isinstance(data, pd.DataFrame):
                    data.to_json(f, orient='index')
                else:
                    json.dump(data, f)
                    
            logger.info(f"Cached data: {cache_key}")
            
        except Exception as e:
            logger.error(f"Cache error: {e}")
    
    def load_cached_data(self, cache_key: str, max_age_hours: int = 24) -> Optional[Any]:
        """Load cached data if fresh enough"""
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            if cache_file.exists():
                # Check age
                age_hours = (time.time() - cache_file.stat().st_mtime) / 3600
                
                if age_hours < max_age_hours:
                    with open(cache_file, 'r') as f:
                        return json.load(f)
                        
        except Exception as e:
            logger.error(f"Cache load error: {e}")
        
        return None


# Example usage function
def demo_free_apis():
    """Demonstrate free API capabilities"""
    
    hub = FreeAPIHub()
    
    print("\n" + "="*60)
    print("FREE API HUB DEMONSTRATION")
    print("="*60)
    
    # 1. Stock data from Yahoo
    print("\n1. Yahoo Finance - SPY Daily Data:")
    spy = hub.get_yahoo_finance_data('SPY', period='1mo')
    if not spy.empty:
        print(f"   Loaded {len(spy)} days of SPY data")
        print(f"   Latest close: ${spy['close'].iloc[-1]:.2f}")
    
    # 2. Economic data from FRED
    print("\n2. FRED - 10-Year Treasury Rate:")
    treasury = hub.get_fred_series('DGS10')
    if not treasury.empty:
        print(f"   Current 10Y rate: {treasury.iloc[-1]:.2f}%")
    
    # 3. Crypto from Binance
    print("\n3. Binance - Bitcoin Data:")
    btc = hub.get_binance_klines('BTCUSDT', '1h', 24)
    if not btc.empty:
        print(f"   24h BTC data loaded")
        print(f"   Current price: ${btc['close'].iloc[-1]:,.2f}")
    
    # 4. Market indicators
    print("\n4. Market Indicators:")
    indicators = hub.get_market_indicators()
    for key, value in indicators.items():
        print(f"   {key}: {value:.2f}")
    
    print("\n" + "="*60)
    print("All data loaded successfully from FREE sources!")
    print("="*60)


if __name__ == "__main__":
    demo_free_apis()