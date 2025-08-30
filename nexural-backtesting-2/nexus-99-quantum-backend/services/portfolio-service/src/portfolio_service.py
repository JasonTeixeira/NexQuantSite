"""
Portfolio Service - Portfolio management with Alpaca paper trading integration
Handles positions, P&L tracking, and paper trading execution
"""

import asyncio
import logging
import sqlite3
import json
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Portfolio Service",
    version="1.0.0",
    description="Portfolio Management with Alpaca Paper Trading Integration"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3025"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Alpaca configuration
ALPACA_BASE_URL = "https://paper-api.alpaca.markets/v2"
ALPACA_DATA_URL = "https://data.alpaca.markets/v2"
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "your-alpaca-api-key")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "your-alpaca-secret-key")

# Database setup
DB_PATH = Path("portfolio.db")

def init_database():
    """Initialize SQLite database for portfolio management"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolios (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT DEFAULT 'Main Portfolio',
            cash REAL DEFAULT 100000.0,
            buying_power REAL DEFAULT 100000.0,
            total_value REAL DEFAULT 100000.0,
            day_change REAL DEFAULT 0.0,
            day_change_percent REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            alpaca_account_id TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS positions (
            id TEXT PRIMARY KEY,
            portfolio_id TEXT NOT NULL,
            symbol TEXT NOT NULL,
            quantity REAL NOT NULL,
            avg_price REAL NOT NULL,
            current_price REAL DEFAULT 0.0,
            market_value REAL DEFAULT 0.0,
            pnl REAL DEFAULT 0.0,
            pnl_percent REAL DEFAULT 0.0,
            weight REAL DEFAULT 0.0,
            side TEXT DEFAULT 'long',
            opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            portfolio_id TEXT NOT NULL,
            symbol TEXT NOT NULL,
            quantity REAL NOT NULL,
            side TEXT NOT NULL,
            type TEXT NOT NULL,
            limit_price REAL,
            stop_price REAL,
            status TEXT DEFAULT 'pending',
            filled_price REAL,
            filled_quantity REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            filled_at TIMESTAMP,
            alpaca_order_id TEXT,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS performance_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            portfolio_id TEXT NOT NULL,
            date DATE NOT NULL,
            portfolio_value REAL NOT NULL,
            cash REAL NOT NULL,
            day_change REAL DEFAULT 0.0,
            benchmark_value REAL DEFAULT 0.0,
            returns REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    """)
    
    conn.commit()
    conn.close()
    logger.info("Portfolio database initialized successfully")

# Initialize database
init_database()

# Pydantic models
class Portfolio(BaseModel):
    id: str
    user_id: str
    name: str
    cash: float
    buying_power: float
    total_value: float
    day_change: float
    day_change_percent: float
    positions: List[Dict[str, Any]] = []
    performance: List[Dict[str, Any]] = []

class Position(BaseModel):
    id: str
    symbol: str
    quantity: float
    avg_price: float
    current_price: float
    market_value: float
    pnl: float
    pnl_percent: float
    weight: float
    side: str = "long"

class OrderRequest(BaseModel):
    symbol: str
    quantity: float
    side: str  # 'buy' or 'sell'
    type: str = "market"  # 'market', 'limit', 'stop'
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None

class OrderResponse(BaseModel):
    id: str
    symbol: str
    quantity: float
    side: str
    type: str
    status: str
    filled_price: Optional[float] = None
    filled_quantity: float = 0.0
    created_at: str

# HTTP client for external APIs
client = httpx.AsyncClient(timeout=30.0)

async def get_alpaca_headers() -> Dict[str, str]:
    """Get Alpaca API headers"""
    return {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
        "Content-Type": "application/json"
    }

async def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user_id"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    token = credentials.credentials
    
    # For demo/testing, accept any token that looks like a JWT
    if token.startswith("test_"):
        return "test_user_123"
    elif token.startswith("demo_"):
        return "demo_user_456"
    elif "." in token and len(token) > 20:  # Looks like a JWT
        # Extract user ID from token (simplified)
        try:
            import jwt
            # For development, we'll decode without verification
            # In production, this should verify with the auth service
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except:
            pass
        
        # Fallback for any valid-looking token
        return "jwt_user_" + token[-8:]
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

def get_or_create_portfolio(user_id: str) -> str:
    """Get or create portfolio for user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if portfolio exists
    cursor.execute("SELECT id FROM portfolios WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()
    
    if result:
        portfolio_id = result[0]
    else:
        # Create new portfolio
        import secrets
        portfolio_id = f"portfolio_{secrets.token_urlsafe(8)}"
        cursor.execute("""
            INSERT INTO portfolios (id, user_id, name, cash, buying_power, total_value)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (portfolio_id, user_id, "Main Portfolio", 100000.0, 100000.0, 100000.0))
        conn.commit()
        logger.info(f"Created new portfolio for user {user_id}: {portfolio_id}")
    
    conn.close()
    return portfolio_id

async def get_current_price(symbol: str) -> float:
    """Get current stock price from Alpaca or Yahoo Finance"""
    try:
        # Try Alpaca first
        headers = await get_alpaca_headers()
        response = await client.get(
            f"{ALPACA_DATA_URL}/stocks/{symbol}/quotes/latest",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            quote = data.get("quote", {})
            bid = quote.get("bidprice", 0)
            ask = quote.get("askprice", 0)
            if bid > 0 and ask > 0:
                return (bid + ask) / 2
        
        # Fallback to Yahoo Finance via data service
        data_service_response = await client.post(
            "http://localhost:3012/data/fetch",
            json={
                "symbol": symbol,
                "start_date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "interval": "1d"
            }
        )
        
        if data_service_response.status_code == 200:
            data = data_service_response.json()
            if data["data"]:
                return float(data["data"][-1]["close"])
        
        # Default fallback price
        return 100.0
        
    except Exception as e:
        logger.error(f"Failed to get price for {symbol}: {e}")
        return 100.0

async def update_position_prices(portfolio_id: str):
    """Update current prices for all positions"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, symbol, quantity, avg_price FROM positions WHERE portfolio_id = ?", (portfolio_id,))
    positions = cursor.fetchall()
    
    for pos_id, symbol, quantity, avg_price in positions:
        current_price = await get_current_price(symbol)
        market_value = quantity * current_price
        pnl = (current_price - avg_price) * quantity
        pnl_percent = ((current_price - avg_price) / avg_price) * 100 if avg_price > 0 else 0
        
        cursor.execute("""
            UPDATE positions 
            SET current_price = ?, market_value = ?, pnl = ?, pnl_percent = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (current_price, market_value, pnl, pnl_percent, pos_id))
    
    conn.commit()
    conn.close()

# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "portfolio-service",
        "timestamp": datetime.utcnow().isoformat(),
        "alpaca_configured": bool(ALPACA_API_KEY and ALPACA_API_KEY != "your-alpaca-api-key")
    }

@app.get("/portfolio")
async def get_portfolio(user_id: str = Depends(verify_user_token)):
    """Get user's portfolio with current positions"""
    try:
        portfolio_id = get_or_create_portfolio(user_id)
        
        # Update position prices
        await update_position_prices(portfolio_id)
        
        # Get portfolio data
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM portfolios WHERE id = ?", (portfolio_id,))
        portfolio_row = cursor.fetchone()
        
        cursor.execute("SELECT * FROM positions WHERE portfolio_id = ?", (portfolio_id,))
        positions_rows = cursor.fetchall()
        
        # Calculate total portfolio value
        total_market_value = sum(row[7] for row in positions_rows)  # market_value column
        cash = portfolio_row[3] if portfolio_row else 100000.0
        total_value = cash + total_market_value
        
        # Update portfolio totals
        cursor.execute("""
            UPDATE portfolios 
            SET total_value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (total_value, portfolio_id))
        conn.commit()
        
        # Format positions
        positions = []
        for row in positions_rows:
            positions.append({
                "id": row[0],
                "symbol": row[2],
                "quantity": row[3],
                "avg_price": row[4],
                "current_price": row[5],
                "market_value": row[6],
                "pnl": row[7],
                "pnl_percent": row[8],
                "weight": (row[6] / total_value * 100) if total_value > 0 else 0,
                "side": row[10],
                "opened_at": row[11]
            })
        
        conn.close()
        
        return {
            "id": portfolio_id,
            "user_id": user_id,
            "name": portfolio_row[2] if portfolio_row else "Main Portfolio",
            "cash": cash,
            "buying_power": portfolio_row[4] if portfolio_row else cash,
            "total_value": total_value,
            "total_pnl": total_market_value - sum(pos["avg_price"] * pos["quantity"] for pos in positions),
            "total_pnl_percent": ((total_value - 100000.0) / 100000.0 * 100) if total_value > 0 else 0,
            "positions": positions,
            "day_change": portfolio_row[6] if portfolio_row else 0.0,
            "day_change_percent": portfolio_row[7] if portfolio_row else 0.0
        }
        
    except Exception as e:
        logger.error(f"Failed to get portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio: {str(e)}"
        )

@app.post("/orders", response_model=OrderResponse)
async def place_order(
    order: OrderRequest, 
    user_id: str = Depends(verify_user_token)
):
    """Place a paper trading order"""
    try:
        portfolio_id = get_or_create_portfolio(user_id)
        
        # Get current price for market orders
        current_price = await get_current_price(order.symbol)
        execution_price = current_price
        
        if order.type == "limit" and order.limit_price:
            execution_price = order.limit_price
        
        # Generate order ID
        import secrets
        order_id = f"order_{secrets.token_urlsafe(8)}"
        
        # For demo purposes, we'll immediately "fill" market orders
        status = "filled" if order.type == "market" else "pending"
        filled_price = execution_price if status == "filled" else None
        filled_quantity = order.quantity if status == "filled" else 0.0
        
        # Store order in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO orders (
                id, portfolio_id, symbol, quantity, side, type, 
                limit_price, stop_price, status, filled_price, filled_quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id, portfolio_id, order.symbol, order.quantity, order.side,
            order.type, order.limit_price, order.stop_price, status,
            filled_price, filled_quantity
        ))
        
        # If order is filled, update positions
        if status == "filled":
            await update_positions_after_fill(portfolio_id, order, execution_price)
        
        conn.commit()
        conn.close()
        
        logger.info(f"Order placed: {order_id} - {order.side} {order.quantity} {order.symbol} @ {execution_price}")
        
        return OrderResponse(
            id=order_id,
            symbol=order.symbol,
            quantity=order.quantity,
            side=order.side,
            type=order.type,
            status=status,
            filled_price=filled_price,
            filled_quantity=filled_quantity,
            created_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Failed to place order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to place order: {str(e)}"
        )

async def update_positions_after_fill(portfolio_id: str, order: OrderRequest, fill_price: float):
    """Update positions after order fill"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if position exists
    cursor.execute(
        "SELECT id, quantity, avg_price FROM positions WHERE portfolio_id = ? AND symbol = ?",
        (portfolio_id, order.symbol)
    )
    existing_position = cursor.fetchone()
    
    if existing_position:
        pos_id, current_qty, current_avg = existing_position
        
        if order.side == "buy":
            new_quantity = current_qty + order.quantity
            new_avg_price = ((current_qty * current_avg) + (order.quantity * fill_price)) / new_quantity
        else:  # sell
            new_quantity = current_qty - order.quantity
            new_avg_price = current_avg
        
        if new_quantity <= 0:
            # Close position
            cursor.execute("DELETE FROM positions WHERE id = ?", (pos_id,))
        else:
            # Update position
            cursor.execute("""
                UPDATE positions 
                SET quantity = ?, avg_price = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (new_quantity, new_avg_price, pos_id))
    else:
        # Create new position (only for buy orders)
        if order.side == "buy":
            import secrets
            pos_id = f"pos_{secrets.token_urlsafe(8)}"
            cursor.execute("""
                INSERT INTO positions (
                    id, portfolio_id, symbol, quantity, avg_price, current_price,
                    market_value, side
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pos_id, portfolio_id, order.symbol, order.quantity, fill_price,
                fill_price, order.quantity * fill_price, "long"
            ))
    
    # Update portfolio cash
    cash_change = -order.quantity * fill_price if order.side == "buy" else order.quantity * fill_price
    cursor.execute("""
        UPDATE portfolios 
        SET cash = cash + ?, buying_power = buying_power + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (cash_change, cash_change, portfolio_id))
    
    conn.commit()
    conn.close()

@app.get("/orders")
async def get_orders(user_id: str = Depends(verify_user_token)):
    """Get user's order history"""
    try:
        portfolio_id = get_or_create_portfolio(user_id)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM orders WHERE portfolio_id = ? 
            ORDER BY created_at DESC LIMIT 100
        """, (portfolio_id,))
        
        orders = []
        for row in cursor.fetchall():
            orders.append({
                "id": row[0],
                "symbol": row[2],
                "quantity": row[3],
                "side": row[4],
                "type": row[5],
                "limit_price": row[6],
                "stop_price": row[7],
                "status": row[8],
                "filled_price": row[9],
                "filled_quantity": row[10],
                "created_at": row[11],
                "filled_at": row[12]
            })
        
        conn.close()
        return {"orders": orders}
        
    except Exception as e:
        logger.error(f"Failed to get orders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}"
        )

@app.get("/performance")
async def get_performance(
    days: int = 30,
    user_id: str = Depends(verify_user_token)
):
    """Get portfolio performance history"""
    try:
        portfolio_id = get_or_create_portfolio(user_id)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT date, portfolio_value, cash, day_change, returns
            FROM performance_history 
            WHERE portfolio_id = ? AND date >= date('now', '-{} days')
            ORDER BY date ASC
        """.format(days), (portfolio_id,))
        
        performance = []
        for row in cursor.fetchall():
            performance.append({
                "date": row[0],
                "portfolio_value": row[1],
                "cash": row[2],
                "day_change": row[3],
                "returns": row[4]
            })
        
        conn.close()
        
        # If no performance history, generate basic data
        if not performance:
            base_value = 100000.0
            for i in range(days):
                date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
                performance.append({
                    "date": date,
                    "portfolio_value": base_value,
                    "cash": base_value,
                    "day_change": 0.0,
                    "returns": 0.0
                })
        
        return {"performance": performance}
        
    except Exception as e:
        logger.error(f"Failed to get performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Install required packages
    try:
        import httpx
    except ImportError:
        print("Installing httpx...")
        import subprocess
        subprocess.run(["pip", "install", "httpx"])
    
    uvicorn.run(app, host="0.0.0.0", port=3014)
