"""
Polygon.io Professional Real-time Data Integration
Production-grade market data feeds for live trading
"""

import asyncio
import websockets
import json
import logging
import time
from typing import Dict, List, Optional, Any, Callable, AsyncGenerator
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import deque
import threading
import queue
import os

logger = logging.getLogger(__name__)

@dataclass
class MarketTick:
    """Real-time market tick data"""
    symbol: str
    timestamp: datetime
    price: float
    size: int
    exchange: str
    conditions: List[str] = field(default_factory=list)
    tape: str = ""
    
    @property
    def is_regular_hours(self) -> bool:
        """Check if tick is during regular trading hours"""
        hour = self.timestamp.hour
        minute = self.timestamp.minute
        
        # NYSE regular hours: 9:30 AM - 4:00 PM ET
        if hour == 9 and minute >= 30:
            return True
        elif 10 <= hour < 16:
            return True
        else:
            return False

@dataclass
class MarketQuote:
    """Real-time quote data"""
    symbol: str
    timestamp: datetime
    bid_price: float
    bid_size: int
    bid_exchange: str
    ask_price: float
    ask_size: int
    ask_exchange: str
    
    @property
    def spread(self) -> float:
        """Calculate bid-ask spread"""
        return self.ask_price - self.bid_price
    
    @property
    def spread_bps(self) -> float:
        """Spread in basis points"""
        mid = self.mid_price
        return (self.spread / mid * 10000) if mid > 0 else 0
    
    @property
    def mid_price(self) -> float:
        """Calculate mid price"""
        return (self.bid_price + self.ask_price) / 2

@dataclass
class MarketBar:
    """Real-time aggregated bar data"""
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    vwap: float
    trade_count: int
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            'timestamp': self.timestamp,
            'open': self.open,
            'high': self.high,
            'low': self.low,
            'close': self.close,
            'volume': self.volume,
            'vwap': self.vwap
        }

class PolygonDataFeed:
    """
    Professional Polygon.io data feed integration
    Real-time WebSocket streaming for production trading
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('POLYGON_API_KEY')
        
        # WebSocket endpoints
        self.ws_stocks_url = "wss://socket.polygon.io/stocks"
        self.ws_forex_url = "wss://socket.polygon.io/forex"
        self.ws_crypto_url = "wss://socket.polygon.io/crypto"
        
        # REST API endpoint
        self.rest_url = "https://api.polygon.io"
        
        # Connection state
        self.is_connected = False
        self.websocket = None
        self.subscribed_symbols = set()
        
        # Data buffers
        self.tick_buffer = deque(maxlen=10000)
        self.quote_buffer = deque(maxlen=5000)
        self.bar_buffer = {}  # Symbol -> deque of bars
        
        # Callbacks
        self.tick_callbacks = []
        self.quote_callbacks = []
        self.bar_callbacks = []
        
        # Performance metrics
        self.message_count = 0
        self.error_count = 0
        self.last_message_time = None
        self.latency_ms = 0
        
        # Threading for async operations
        self.loop = None
        self.thread = None
        self.stop_event = threading.Event()
        
        logger.info("📊 Polygon.io data feed initialized")
    
    async def connect(self) -> bool:
        """Connect to Polygon WebSocket"""
        try:
            if not self.api_key:
                logger.error("❌ Polygon API key not provided")
                logger.info("   Get your key at: https://polygon.io")
                logger.info("   Set environment variable: POLYGON_API_KEY")
                return False
            
            # Connect to stocks WebSocket
            self.websocket = await websockets.connect(self.ws_stocks_url)
            
            # Authenticate
            auth_msg = {
                "action": "auth",
                "params": self.api_key
            }
            
            await self.websocket.send(json.dumps(auth_msg))
            
            # Wait for auth response
            response = await self.websocket.recv()
            auth_result = json.loads(response)
            
            if auth_result[0].get("status") == "auth_success":
                self.is_connected = True
                logger.info("✅ Connected to Polygon.io WebSocket")
                return True
            else:
                logger.error(f"❌ Authentication failed: {auth_result}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Connection failed: {e}")
            return False
    
    async def subscribe(self, symbols: List[str], data_types: List[str] = None) -> bool:
        """Subscribe to symbols for real-time data"""
        
        if not self.is_connected:
            logger.error("Not connected to Polygon")
            return False
        
        try:
            # Default to all data types
            if data_types is None:
                data_types = ["T", "Q", "A"]  # Trades, Quotes, Aggregates
            
            # Build subscription message
            subscriptions = []
            for data_type in data_types:
                for symbol in symbols:
                    subscriptions.append(f"{data_type}.{symbol}")
            
            sub_msg = {
                "action": "subscribe",
                "params": ",".join(subscriptions)
            }
            
            await self.websocket.send(json.dumps(sub_msg))
            
            # Track subscribed symbols
            self.subscribed_symbols.update(symbols)
            
            logger.info(f"✅ Subscribed to {len(symbols)} symbols: {symbols}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Subscription failed: {e}")
            return False
    
    async def stream_data(self):
        """Stream real-time data from WebSocket"""
        
        if not self.is_connected:
            logger.error("Not connected")
            return
        
        logger.info("🌊 Starting real-time data stream...")
        
        try:
            while not self.stop_event.is_set():
                try:
                    # Receive message with timeout
                    message = await asyncio.wait_for(
                        self.websocket.recv(), 
                        timeout=1.0
                    )
                    
                    # Parse message
                    data = json.loads(message)
                    
                    # Process each message in the batch
                    for msg in data:
                        await self._process_message(msg)
                    
                except asyncio.TimeoutError:
                    # Check if we should stop
                    continue
                    
                except websockets.exceptions.ConnectionClosed:
                    logger.warning("WebSocket connection closed")
                    await self._reconnect()
                    
                except Exception as e:
                    logger.error(f"Stream error: {e}")
                    self.error_count += 1
                    
        except Exception as e:
            logger.error(f"Fatal stream error: {e}")
        finally:
            self.is_connected = False
    
    async def _process_message(self, msg: Dict):
        """Process incoming WebSocket message"""
        
        try:
            msg_type = msg.get("ev")
            
            if msg_type == "T":  # Trade/Tick
                tick = self._parse_tick(msg)
                if tick:
                    self.tick_buffer.append(tick)
                    await self._notify_tick_callbacks(tick)
                    
            elif msg_type == "Q":  # Quote
                quote = self._parse_quote(msg)
                if quote:
                    self.quote_buffer.append(quote)
                    await self._notify_quote_callbacks(quote)
                    
            elif msg_type == "A":  # Aggregate/Bar
                bar = self._parse_bar(msg)
                if bar:
                    if bar.symbol not in self.bar_buffer:
                        self.bar_buffer[bar.symbol] = deque(maxlen=1000)
                    self.bar_buffer[bar.symbol].append(bar)
                    await self._notify_bar_callbacks(bar)
            
            # Update metrics
            self.message_count += 1
            self.last_message_time = datetime.now()
            
            # Calculate latency
            if "t" in msg:  # Timestamp in message
                msg_time = datetime.fromtimestamp(msg["t"] / 1000)
                self.latency_ms = (datetime.now() - msg_time).total_seconds() * 1000
                
        except Exception as e:
            logger.error(f"Message processing error: {e}")
            self.error_count += 1
    
    def _parse_tick(self, msg: Dict) -> Optional[MarketTick]:
        """Parse tick message"""
        try:
            return MarketTick(
                symbol=msg.get("sym", ""),
                timestamp=datetime.fromtimestamp(msg.get("t", 0) / 1000),
                price=msg.get("p", 0),
                size=msg.get("s", 0),
                exchange=msg.get("x", ""),
                conditions=msg.get("c", []),
                tape=msg.get("z", "")
            )
        except Exception as e:
            logger.error(f"Tick parsing error: {e}")
            return None
    
    def _parse_quote(self, msg: Dict) -> Optional[MarketQuote]:
        """Parse quote message"""
        try:
            return MarketQuote(
                symbol=msg.get("sym", ""),
                timestamp=datetime.fromtimestamp(msg.get("t", 0) / 1000),
                bid_price=msg.get("bp", 0),
                bid_size=msg.get("bs", 0),
                bid_exchange=msg.get("bx", ""),
                ask_price=msg.get("ap", 0),
                ask_size=msg.get("as", 0),
                ask_exchange=msg.get("ax", "")
            )
        except Exception as e:
            logger.error(f"Quote parsing error: {e}")
            return None
    
    def _parse_bar(self, msg: Dict) -> Optional[MarketBar]:
        """Parse bar/aggregate message"""
        try:
            return MarketBar(
                symbol=msg.get("sym", ""),
                timestamp=datetime.fromtimestamp(msg.get("s", 0) / 1000),
                open=msg.get("o", 0),
                high=msg.get("h", 0),
                low=msg.get("l", 0),
                close=msg.get("c", 0),
                volume=msg.get("v", 0),
                vwap=msg.get("vw", 0),
                trade_count=msg.get("n", 0)
            )
        except Exception as e:
            logger.error(f"Bar parsing error: {e}")
            return None
    
    async def _notify_tick_callbacks(self, tick: MarketTick):
        """Notify tick callbacks"""
        for callback in self.tick_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(tick)
                else:
                    callback(tick)
            except Exception as e:
                logger.error(f"Tick callback error: {e}")
    
    async def _notify_quote_callbacks(self, quote: MarketQuote):
        """Notify quote callbacks"""
        for callback in self.quote_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(quote)
                else:
                    callback(quote)
            except Exception as e:
                logger.error(f"Quote callback error: {e}")
    
    async def _notify_bar_callbacks(self, bar: MarketBar):
        """Notify bar callbacks"""
        for callback in self.bar_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(bar)
                else:
                    callback(bar)
            except Exception as e:
                logger.error(f"Bar callback error: {e}")
    
    async def _reconnect(self):
        """Reconnect to WebSocket"""
        logger.info("🔄 Attempting to reconnect...")
        
        self.is_connected = False
        
        # Wait before reconnecting
        await asyncio.sleep(5)
        
        # Try to reconnect
        if await self.connect():
            # Resubscribe to symbols
            if self.subscribed_symbols:
                await self.subscribe(list(self.subscribed_symbols))
            logger.info("✅ Reconnected successfully")
        else:
            logger.error("❌ Reconnection failed")
    
    def add_tick_callback(self, callback: Callable):
        """Add tick data callback"""
        self.tick_callbacks.append(callback)
    
    def add_quote_callback(self, callback: Callable):
        """Add quote data callback"""
        self.quote_callbacks.append(callback)
    
    def add_bar_callback(self, callback: Callable):
        """Add bar data callback"""
        self.bar_callbacks.append(callback)
    
    def get_latest_quote(self, symbol: str) -> Optional[MarketQuote]:
        """Get latest quote for symbol"""
        for quote in reversed(self.quote_buffer):
            if quote.symbol == symbol:
                return quote
        return None
    
    def get_latest_tick(self, symbol: str) -> Optional[MarketTick]:
        """Get latest tick for symbol"""
        for tick in reversed(self.tick_buffer):
            if tick.symbol == symbol:
                return tick
        return None
    
    def get_recent_bars(self, symbol: str, limit: int = 100) -> List[MarketBar]:
        """Get recent bars for symbol"""
        if symbol in self.bar_buffer:
            bars = list(self.bar_buffer[symbol])
            return bars[-limit:] if len(bars) > limit else bars
        return []
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get data feed metrics"""
        return {
            'connected': self.is_connected,
            'subscribed_symbols': len(self.subscribed_symbols),
            'message_count': self.message_count,
            'error_count': self.error_count,
            'tick_buffer_size': len(self.tick_buffer),
            'quote_buffer_size': len(self.quote_buffer),
            'latency_ms': self.latency_ms,
            'last_message': self.last_message_time.isoformat() if self.last_message_time else None
        }
    
    def start(self, symbols: List[str] = None):
        """Start data feed in background thread"""
        
        def run_loop():
            """Run event loop in thread"""
            self.loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.loop)
            
            # Connect and subscribe
            self.loop.run_until_complete(self.connect())
            
            if symbols and self.is_connected:
                self.loop.run_until_complete(self.subscribe(symbols))
            
            # Start streaming
            if self.is_connected:
                self.loop.run_until_complete(self.stream_data())
        
        # Start thread
        self.thread = threading.Thread(target=run_loop)
        self.thread.daemon = True
        self.thread.start()
        
        logger.info("📡 Data feed started in background")
    
    def stop(self):
        """Stop data feed"""
        logger.info("Stopping data feed...")
        
        self.stop_event.set()
        
        if self.websocket:
            asyncio.run(self.websocket.close())
        
        if self.thread:
            self.thread.join(timeout=5)
        
        logger.info("Data feed stopped")

class DataAggregator:
    """
    Aggregates real-time data into usable formats
    """
    
    def __init__(self):
        self.bars = {}  # Symbol -> DataFrame
        self.quotes = {}  # Symbol -> latest quote
        self.trades = {}  # Symbol -> recent trades
        
    def update_from_tick(self, tick: MarketTick):
        """Update from tick data"""
        symbol = tick.symbol
        
        if symbol not in self.trades:
            self.trades[symbol] = deque(maxlen=1000)
        
        self.trades[symbol].append({
            'timestamp': tick.timestamp,
            'price': tick.price,
            'size': tick.size
        })
    
    def update_from_quote(self, quote: MarketQuote):
        """Update from quote data"""
        self.quotes[quote.symbol] = quote
    
    def update_from_bar(self, bar: MarketBar):
        """Update from bar data"""
        symbol = bar.symbol
        
        if symbol not in self.bars:
            self.bars[symbol] = pd.DataFrame()
        
        # Append bar to DataFrame
        new_row = pd.DataFrame([bar.to_dict()])
        self.bars[symbol] = pd.concat([self.bars[symbol], new_row], ignore_index=True)
        
        # Keep only recent bars (e.g., last 1000)
        if len(self.bars[symbol]) > 1000:
            self.bars[symbol] = self.bars[symbol].tail(1000)
    
    def get_latest_data(self, symbol: str) -> Dict[str, Any]:
        """Get latest consolidated data for symbol"""
        return {
            'quote': self.quotes.get(symbol),
            'recent_trades': list(self.trades.get(symbol, []))[-10:],
            'bars': self.bars.get(symbol)
        }

# Demo function
def demo_polygon_feed():
    """Demonstrate Polygon data feed"""
    print("🌊 POLYGON.IO REAL-TIME DATA DEMO")
    print("=" * 60)
    
    # Create data feed
    feed = PolygonDataFeed()
    
    # Create aggregator
    aggregator = DataAggregator()
    
    # Add callbacks
    def on_quote(quote: MarketQuote):
        print(f"📊 Quote: {quote.symbol} Bid: ${quote.bid_price:.2f} Ask: ${quote.ask_price:.2f} Spread: {quote.spread_bps:.1f}bps")
        aggregator.update_from_quote(quote)
    
    def on_tick(tick: MarketTick):
        print(f"💹 Trade: {tick.symbol} ${tick.price:.2f} x {tick.size}")
        aggregator.update_from_tick(tick)
    
    def on_bar(bar: MarketBar):
        print(f"📈 Bar: {bar.symbol} OHLC: {bar.open:.2f}/{bar.high:.2f}/{bar.low:.2f}/{bar.close:.2f} Vol: {bar.volume:,}")
        aggregator.update_from_bar(bar)
    
    feed.add_quote_callback(on_quote)
    feed.add_tick_callback(on_tick)
    feed.add_bar_callback(on_bar)
    
    # Start feed
    symbols = ["AAPL", "MSFT", "GOOGL"]
    print(f"Starting feed for: {symbols}")
    
    feed.start(symbols)
    
    # Run for demo duration
    try:
        time.sleep(30)  # Run for 30 seconds
    except KeyboardInterrupt:
        print("\nStopping...")
    
    # Get metrics
    metrics = feed.get_metrics()
    print(f"\n📊 Data Feed Metrics:")
    print(f"   Messages processed: {metrics.get('message_count', 0):,}")
    print(f"   Errors: {metrics.get('error_count', 0)}")
    print(f"   Latency: {metrics.get('latency_ms', 0):.1f}ms")
    
    # Stop feed
    feed.stop()
    
    print("\n✅ Demo completed")
    
    if not feed.api_key:
        print("\n⚠️  Note: To use real data, set your POLYGON_API_KEY environment variable")
        print("   Get your API key at: https://polygon.io")

if __name__ == "__main__":
    demo_polygon_feed()



