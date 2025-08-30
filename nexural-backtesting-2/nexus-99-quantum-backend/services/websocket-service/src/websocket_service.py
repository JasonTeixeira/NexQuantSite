"""
WebSocket Service - Real-time market data streaming
Provides WebSocket connections for live market data, portfolio updates, and AI streaming
"""

import asyncio
import logging
import json
import httpx
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WebSocket Service",
    version="1.0.0",
    description="Real-time WebSocket streaming for market data and portfolio updates"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3025"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}  # user_id -> set of symbols
        self.symbol_subscribers: Dict[str, Set[str]] = {}  # symbol -> set of user_ids
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_subscriptions[user_id] = set()
        logger.info(f"User {user_id} connected via WebSocket")
        
    def disconnect(self, user_id: str):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
        # Remove user from all symbol subscriptions
        if user_id in self.user_subscriptions:
            for symbol in self.user_subscriptions[user_id]:
                if symbol in self.symbol_subscribers:
                    self.symbol_subscribers[symbol].discard(user_id)
                    if not self.symbol_subscribers[symbol]:
                        del self.symbol_subscribers[symbol]
            del self.user_subscriptions[user_id]
            
        logger.info(f"User {user_id} disconnected from WebSocket")
        
    def subscribe_to_symbol(self, user_id: str, symbol: str):
        """Subscribe user to symbol updates"""
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].add(symbol)
            
        if symbol not in self.symbol_subscribers:
            self.symbol_subscribers[symbol] = set()
        self.symbol_subscribers[symbol].add(user_id)
        
        logger.info(f"User {user_id} subscribed to {symbol}")
        
    def unsubscribe_from_symbol(self, user_id: str, symbol: str):
        """Unsubscribe user from symbol updates"""
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(symbol)
            
        if symbol in self.symbol_subscribers:
            self.symbol_subscribers[symbol].discard(user_id)
            if not self.symbol_subscribers[symbol]:
                del self.symbol_subscribers[symbol]
                
        logger.info(f"User {user_id} unsubscribed from {symbol}")
        
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                
    async def broadcast_to_symbol_subscribers(self, symbol: str, message: dict):
        """Broadcast message to all users subscribed to a symbol"""
        if symbol in self.symbol_subscribers:
            for user_id in self.symbol_subscribers[symbol].copy():
                await self.send_personal_message(user_id, message)

# Global connection manager
manager = ConnectionManager()

# HTTP client for external services
client = httpx.AsyncClient(timeout=30.0)

async def get_current_price(symbol: str) -> Optional[float]:
    """Get current price from data service"""
    try:
        response = await client.post(
            "http://localhost:3012/data/fetch",
            json={
                "symbol": symbol,
                "start_date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "interval": "1d"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if data["data"]:
                return float(data["data"][-1]["close"])
    except Exception as e:
        logger.error(f"Failed to get price for {symbol}: {e}")
    
    return None

async def generate_mock_price_update(symbol: str, base_price: float) -> dict:
    """Generate mock price update with realistic fluctuation"""
    import random
    
    # Simulate realistic price movement (±1% typical fluctuation)
    change_percent = random.uniform(-0.01, 0.01)
    new_price = base_price * (1 + change_percent)
    
    # Generate mock volume
    volume = random.randint(100000, 1000000)
    
    return {
        "type": "price_update",
        "symbol": symbol,
        "price": round(new_price, 2),
        "change": round(new_price - base_price, 2),
        "change_percent": round(change_percent * 100, 2),
        "volume": volume,
        "timestamp": datetime.utcnow().isoformat(),
        "bid": round(new_price - 0.01, 2),
        "ask": round(new_price + 0.01, 2)
    }

async def market_data_broadcaster():
    """Background task to broadcast market data updates"""
    symbol_prices = {}  # Cache current prices
    
    while True:
        try:
            # Get all symbols that have subscribers
            active_symbols = list(manager.symbol_subscribers.keys())
            
            for symbol in active_symbols:
                # Get or initialize base price
                if symbol not in symbol_prices:
                    price = await get_current_price(symbol)
                    symbol_prices[symbol] = price or 100.0
                
                # Generate price update
                price_update = await generate_mock_price_update(symbol, symbol_prices[symbol])
                
                # Update cached price
                symbol_prices[symbol] = price_update["price"]
                
                # Broadcast to subscribers
                await manager.broadcast_to_symbol_subscribers(symbol, price_update)
            
            # Wait 1-5 seconds between updates (simulate real market data frequency)
            import random
            await asyncio.sleep(random.uniform(1.0, 5.0))
            
        except Exception as e:
            logger.error(f"Market data broadcaster error: {e}")
            await asyncio.sleep(5.0)

# Start background task
@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(market_data_broadcaster())
    logger.info("WebSocket service started with market data broadcaster")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "websocket-service",
        "timestamp": datetime.utcnow().isoformat(),
        "active_connections": len(manager.active_connections),
        "active_subscriptions": len(manager.symbol_subscribers)
    }

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket, user_id)
    
    # Send welcome message
    await manager.send_personal_message(user_id, {
        "type": "connection",
        "status": "connected",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "WebSocket connection established"
    })
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "subscribe":
                # Subscribe to symbol updates
                symbols = message.get("symbols", [])
                for symbol in symbols:
                    manager.subscribe_to_symbol(user_id, symbol.upper())
                
                await manager.send_personal_message(user_id, {
                    "type": "subscription",
                    "status": "subscribed",
                    "symbols": symbols,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
            elif message_type == "unsubscribe":
                # Unsubscribe from symbol updates
                symbols = message.get("symbols", [])
                for symbol in symbols:
                    manager.unsubscribe_from_symbol(user_id, symbol.upper())
                
                await manager.send_personal_message(user_id, {
                    "type": "subscription",
                    "status": "unsubscribed",
                    "symbols": symbols,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
            elif message_type == "ping":
                # Respond to ping with pong
                await manager.send_personal_message(user_id, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
            elif message_type == "get_portfolio":
                # Get portfolio data and send via WebSocket
                try:
                    portfolio_response = await client.get(
                        "http://localhost:3014/portfolio",
                        headers={"Authorization": f"Bearer test_{user_id}"}
                    )
                    
                    if portfolio_response.status_code == 200:
                        portfolio_data = portfolio_response.json()
                        await manager.send_personal_message(user_id, {
                            "type": "portfolio_update",
                            "data": portfolio_data,
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    else:
                        await manager.send_personal_message(user_id, {
                            "type": "error",
                            "message": "Failed to fetch portfolio",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                        
                except Exception as e:
                    logger.error(f"Portfolio fetch error: {e}")
                    await manager.send_personal_message(user_id, {
                        "type": "error",
                        "message": "Portfolio service unavailable",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            elif message_type == "ai_query":
                # Handle AI query via WebSocket
                try:
                    ai_request = {
                        "query": message.get("query", ""),
                        "context": message.get("context", {}),
                        "model": message.get("model", "gpt-4-turbo"),
                        "stream_response": False
                    }
                    
                    ai_response = await client.post(
                        "http://localhost:3015/ai/analyze",
                        json=ai_request,
                        headers={"Authorization": f"Bearer test_{user_id}"}
                    )
                    
                    if ai_response.status_code == 200:
                        ai_data = ai_response.json()
                        await manager.send_personal_message(user_id, {
                            "type": "ai_response",
                            "data": ai_data,
                            "query_id": message.get("query_id"),
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    else:
                        await manager.send_personal_message(user_id, {
                            "type": "ai_error",
                            "message": "AI service error",
                            "query_id": message.get("query_id"),
                            "timestamp": datetime.utcnow().isoformat()
                        })
                        
                except Exception as e:
                    logger.error(f"AI query error: {e}")
                    await manager.send_personal_message(user_id, {
                        "type": "ai_error",
                        "message": "AI service unavailable",
                        "query_id": message.get("query_id"),
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            else:
                # Unknown message type
                await manager.send_personal_message(user_id, {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

@app.get("/ws/status")
async def websocket_status():
    """Get WebSocket service status"""
    return {
        "active_connections": len(manager.active_connections),
        "user_subscriptions": {
            user_id: list(symbols) 
            for user_id, symbols in manager.user_subscriptions.items()
        },
        "symbol_subscribers": {
            symbol: len(subscribers) 
            for symbol, subscribers in manager.symbol_subscribers.items()
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/ws/broadcast")
async def broadcast_message(message: dict):
    """Broadcast message to all connected users (admin endpoint)"""
    try:
        broadcast_data = {
            "type": "broadcast",
            "data": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for user_id in list(manager.active_connections.keys()):
            await manager.send_personal_message(user_id, broadcast_data)
        
        return {
            "status": "success",
            "message": "Message broadcasted to all users",
            "recipients": len(manager.active_connections)
        }
        
    except Exception as e:
        logger.error(f"Broadcast failed: {e}")
        raise HTTPException(status_code=500, detail="Broadcast failed")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3016)
