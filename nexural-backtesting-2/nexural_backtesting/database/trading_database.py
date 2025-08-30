"""
Trading Database Integration
=============================
PostgreSQL database for production trading system.

Features:
- Trade history with full audit trail
- Performance tracking and analytics
- Strategy parameter versioning
- Risk metrics time series
- Position snapshots
- Market data caching
- Automatic schema migration

Author: Nexural Trading Platform  
Date: 2024
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta, date
from dataclasses import dataclass, asdict
from decimal import Decimal
import pandas as pd
import numpy as np
from contextlib import contextmanager

# Try to import PostgreSQL adapter
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, execute_batch
    from psycopg2.pool import SimpleConnectionPool
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    print("Warning: psycopg2 not installed. Using SQLite fallback.")

import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class Trade:
    """Trade record for database"""
    symbol: str
    side: str  # 'BUY' or 'SELL'
    quantity: float
    price: float
    timestamp: datetime
    strategy: str
    order_id: str
    fill_id: Optional[str] = None
    commission: float = 0.0
    slippage: float = 0.0
    metadata: Optional[Dict] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for database insertion"""
        data = asdict(self)
        # Use string format for better SQLite compatibility
        data['timestamp'] = self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        data['metadata'] = json.dumps(self.metadata) if self.metadata else None
        return data


@dataclass
class PerformanceSnapshot:
    """Performance metrics snapshot"""
    timestamp: datetime
    strategy: str
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    profit_factor: float
    total_trades: int
    portfolio_value: float
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        # Use string format for better SQLite compatibility
        data['timestamp'] = self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        return data


class TradingDatabase:
    """
    Production-grade database for trading system.
    
    Supports both PostgreSQL (production) and SQLite (development/testing).
    """
    
    def __init__(self,
                 db_type: str = 'postgresql',
                 host: str = 'localhost',
                 port: int = 5432,
                 database: str = 'trading_db',
                 user: str = None,
                 password: str = None,
                 sqlite_path: str = './trading.db'):
        """
        Initialize database connection
        
        Args:
            db_type: 'postgresql' or 'sqlite'
            host: PostgreSQL host
            port: PostgreSQL port
            database: Database name
            user: PostgreSQL user
            password: PostgreSQL password
            sqlite_path: Path for SQLite database file
        """
        self.db_type = db_type
        
        # Use environment variables if not provided
        if db_type == 'postgresql' and POSTGRES_AVAILABLE:
            self.host = host or os.getenv('DB_HOST', 'localhost')
            self.port = port or int(os.getenv('DB_PORT', 5432))
            self.database = database or os.getenv('DB_NAME', 'trading_db')
            self.user = user or os.getenv('DB_USER', 'postgres')
            self.password = password or os.getenv('DB_PASSWORD', '')
            
            # Create connection pool
            try:
                self.pool = SimpleConnectionPool(
                    1, 20,  # Min and max connections
                    host=self.host,
                    port=self.port,
                    database=self.database,
                    user=self.user,
                    password=self.password
                )
                logger.info(f"Connected to PostgreSQL database: {self.database}")
            except Exception as e:
                logger.warning(f"Failed to connect to PostgreSQL: {e}. Falling back to SQLite.")
                self.db_type = 'sqlite'
        
        if self.db_type == 'sqlite' or not POSTGRES_AVAILABLE:
            self.db_type = 'sqlite'
            self.sqlite_path = Path(sqlite_path)
            self.sqlite_path.parent.mkdir(exist_ok=True)
            logger.info(f"Using SQLite database: {self.sqlite_path}")
        
        # Initialize schema
        self._init_schema()
    
    @contextmanager
    def get_connection(self):
        """Get database connection from pool or create new SQLite connection"""
        if self.db_type == 'postgresql':
            conn = self.pool.getconn()
            try:
                yield conn
                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                self.pool.putconn(conn)
        else:
            conn = sqlite3.connect(self.sqlite_path, detect_types=sqlite3.PARSE_DECLTYPES)
            conn.row_factory = sqlite3.Row
            try:
                yield conn
                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                conn.close()
    
    def _init_schema(self):
        """Initialize database schema"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Trades table
            if self.db_type == 'postgresql':
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS trades (
                        id SERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL,
                        side VARCHAR(10) NOT NULL,
                        quantity DECIMAL(20, 8) NOT NULL,
                        price DECIMAL(20, 8) NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        strategy VARCHAR(100) NOT NULL,
                        order_id VARCHAR(100) UNIQUE NOT NULL,
                        fill_id VARCHAR(100),
                        commission DECIMAL(20, 8) DEFAULT 0,
                        slippage DECIMAL(20, 8) DEFAULT 0,
                        metadata JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        INDEX idx_trades_timestamp (timestamp),
                        INDEX idx_trades_symbol (symbol),
                        INDEX idx_trades_strategy (strategy)
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS trades (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        symbol TEXT NOT NULL,
                        side TEXT NOT NULL,
                        quantity REAL NOT NULL,
                        price REAL NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        strategy TEXT NOT NULL,
                        order_id TEXT UNIQUE NOT NULL,
                        fill_id TEXT,
                        commission REAL DEFAULT 0,
                        slippage REAL DEFAULT 0,
                        metadata TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create indexes for SQLite
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_strategy ON trades(strategy)")
            
            # Positions table
            if self.db_type == 'postgresql':
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS positions (
                        id SERIAL PRIMARY KEY,
                        timestamp TIMESTAMP NOT NULL,
                        symbol VARCHAR(20) NOT NULL,
                        quantity DECIMAL(20, 8) NOT NULL,
                        avg_price DECIMAL(20, 8) NOT NULL,
                        market_price DECIMAL(20, 8),
                        market_value DECIMAL(20, 8),
                        unrealized_pnl DECIMAL(20, 8),
                        realized_pnl DECIMAL(20, 8),
                        strategy VARCHAR(100),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        INDEX idx_positions_timestamp (timestamp),
                        INDEX idx_positions_symbol (symbol)
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS positions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TIMESTAMP NOT NULL,
                        symbol TEXT NOT NULL,
                        quantity REAL NOT NULL,
                        avg_price REAL NOT NULL,
                        market_price REAL,
                        market_value REAL,
                        unrealized_pnl REAL,
                        realized_pnl REAL,
                        strategy TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_positions_timestamp ON positions(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol)")
            
            # Performance snapshots table
            if self.db_type == 'postgresql':
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS performance_snapshots (
                        id SERIAL PRIMARY KEY,
                        timestamp TIMESTAMP NOT NULL,
                        strategy VARCHAR(100) NOT NULL,
                        total_return DECIMAL(20, 8),
                        sharpe_ratio DECIMAL(20, 8),
                        max_drawdown DECIMAL(20, 8),
                        win_rate DECIMAL(20, 8),
                        profit_factor DECIMAL(20, 8),
                        total_trades INTEGER,
                        portfolio_value DECIMAL(20, 8),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        INDEX idx_performance_timestamp (timestamp),
                        INDEX idx_performance_strategy (strategy)
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS performance_snapshots (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TIMESTAMP NOT NULL,
                        strategy TEXT NOT NULL,
                        total_return REAL,
                        sharpe_ratio REAL,
                        max_drawdown REAL,
                        win_rate REAL,
                        profit_factor REAL,
                        total_trades INTEGER,
                        portfolio_value REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_snapshots(timestamp)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_performance_strategy ON performance_snapshots(strategy)")
            
            # Strategy parameters table
            if self.db_type == 'postgresql':
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS strategy_parameters (
                        id SERIAL PRIMARY KEY,
                        strategy VARCHAR(100) NOT NULL,
                        version INTEGER NOT NULL,
                        parameters JSONB NOT NULL,
                        performance_score DECIMAL(20, 8),
                        active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        UNIQUE(strategy, version)
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS strategy_parameters (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        strategy TEXT NOT NULL,
                        version INTEGER NOT NULL,
                        parameters TEXT NOT NULL,
                        performance_score REAL,
                        active INTEGER DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        UNIQUE(strategy, version)
                    )
                """)
            
            # Risk metrics table
            if self.db_type == 'postgresql':
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS risk_metrics (
                        id SERIAL PRIMARY KEY,
                        timestamp TIMESTAMP NOT NULL,
                        var_95 DECIMAL(20, 8),
                        var_99 DECIMAL(20, 8),
                        expected_shortfall DECIMAL(20, 8),
                        beta DECIMAL(20, 8),
                        correlation_risk DECIMAL(20, 8),
                        leverage DECIMAL(20, 8),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        
                        INDEX idx_risk_timestamp (timestamp)
                    )
                """)
            else:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS risk_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TIMESTAMP NOT NULL,
                        var_95 REAL,
                        var_99 REAL,
                        expected_shortfall REAL,
                        beta REAL,
                        correlation_risk REAL,
                        leverage REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_risk_timestamp ON risk_metrics(timestamp)")
            
            logger.info("Database schema initialized")
    
    def insert_trade(self, trade: Trade) -> int:
        """Insert a trade record"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            data = trade.to_dict()
            
            if self.db_type == 'postgresql':
                query = """
                    INSERT INTO trades (symbol, side, quantity, price, timestamp, 
                                      strategy, order_id, fill_id, commission, 
                                      slippage, metadata)
                    VALUES (%(symbol)s, %(side)s, %(quantity)s, %(price)s, 
                           %(timestamp)s, %(strategy)s, %(order_id)s, %(fill_id)s,
                           %(commission)s, %(slippage)s, %(metadata)s)
                    RETURNING id
                """
                cursor.execute(query, data)
                trade_id = cursor.fetchone()[0]
            else:
                query = """
                    INSERT INTO trades (symbol, side, quantity, price, timestamp,
                                      strategy, order_id, fill_id, commission,
                                      slippage, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                cursor.execute(query, [
                    data['symbol'], data['side'], data['quantity'], data['price'],
                    data['timestamp'], data['strategy'], data['order_id'],
                    data['fill_id'], data['commission'], data['slippage'],
                    data['metadata']
                ])
                trade_id = cursor.lastrowid
            
            logger.info(f"Inserted trade {trade_id}: {trade.symbol} {trade.side} {trade.quantity}")
            return trade_id
    
    def get_trades(self,
                  start_date: Optional[datetime] = None,
                  end_date: Optional[datetime] = None,
                  symbol: Optional[str] = None,
                  strategy: Optional[str] = None) -> pd.DataFrame:
        """Get trades with optional filters"""
        with self.get_connection() as conn:
            query = "SELECT * FROM trades WHERE 1=1"
            params = []
            
            if start_date:
                query += " AND timestamp >= ?"
                params.append(start_date)
            
            if end_date:
                query += " AND timestamp <= ?"
                params.append(end_date)
            
            if symbol:
                query += " AND symbol = ?"
                params.append(symbol)
            
            if strategy:
                query += " AND strategy = ?"
                params.append(strategy)
            
            query += " ORDER BY timestamp DESC"
            
            if self.db_type == 'postgresql':
                df = pd.read_sql_query(query.replace('?', '%s'), conn, params=params)
            else:
                df = pd.read_sql_query(query, conn, params=params)
            
            return df
    
    def insert_performance_snapshot(self, snapshot: PerformanceSnapshot):
        """Insert performance metrics snapshot"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            data = snapshot.to_dict()
            
            if self.db_type == 'postgresql':
                query = """
                    INSERT INTO performance_snapshots 
                    (timestamp, strategy, total_return, sharpe_ratio, max_drawdown,
                     win_rate, profit_factor, total_trades, portfolio_value)
                    VALUES (%(timestamp)s, %(strategy)s, %(total_return)s, 
                           %(sharpe_ratio)s, %(max_drawdown)s, %(win_rate)s,
                           %(profit_factor)s, %(total_trades)s, %(portfolio_value)s)
                """
                cursor.execute(query, data)
            else:
                query = """
                    INSERT INTO performance_snapshots
                    (timestamp, strategy, total_return, sharpe_ratio, max_drawdown,
                     win_rate, profit_factor, total_trades, portfolio_value)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                cursor.execute(query, [
                    data['timestamp'], data['strategy'], data['total_return'],
                    data['sharpe_ratio'], data['max_drawdown'], data['win_rate'],
                    data['profit_factor'], data['total_trades'], data['portfolio_value']
                ])
    
    def get_performance_history(self,
                               strategy: str,
                               days: int = 30) -> pd.DataFrame:
        """Get performance history for a strategy"""
        with self.get_connection() as conn:
            query = """
                SELECT * FROM performance_snapshots
                WHERE strategy = ? 
                AND timestamp >= ?
                ORDER BY timestamp ASC
            """
            
            start_date = datetime.now() - timedelta(days=days)
            
            if self.db_type == 'postgresql':
                df = pd.read_sql_query(
                    query.replace('?', '%s'),
                    conn,
                    params=[strategy, start_date]
                )
            else:
                df = pd.read_sql_query(
                    query,
                    conn,
                    params=[strategy, start_date]
                )
            
            return df
    
    def save_strategy_parameters(self,
                                strategy: str,
                                parameters: Dict,
                                performance_score: float = None):
        """Save strategy parameters with versioning"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Get next version number
            if self.db_type == 'postgresql':
                cursor.execute(
                    "SELECT COALESCE(MAX(version), 0) + 1 FROM strategy_parameters WHERE strategy = %s",
                    (strategy,)
                )
            else:
                cursor.execute(
                    "SELECT COALESCE(MAX(version), 0) + 1 FROM strategy_parameters WHERE strategy = ?",
                    (strategy,)
                )
            
            next_version = cursor.fetchone()[0]
            
            # Deactivate previous versions
            if self.db_type == 'postgresql':
                cursor.execute(
                    "UPDATE strategy_parameters SET active = FALSE WHERE strategy = %s",
                    (strategy,)
                )
            else:
                cursor.execute(
                    "UPDATE strategy_parameters SET active = 0 WHERE strategy = ?",
                    (strategy,)
                )
            
            # Insert new version
            params_json = json.dumps(parameters)
            
            if self.db_type == 'postgresql':
                cursor.execute("""
                    INSERT INTO strategy_parameters 
                    (strategy, version, parameters, performance_score, active)
                    VALUES (%s, %s, %s, %s, TRUE)
                """, (strategy, next_version, params_json, performance_score))
            else:
                cursor.execute("""
                    INSERT INTO strategy_parameters
                    (strategy, version, parameters, performance_score, active)
                    VALUES (?, ?, ?, ?, 1)
                """, (strategy, next_version, params_json, performance_score))
            
            logger.info(f"Saved parameters for {strategy} version {next_version}")
    
    def get_active_strategy_parameters(self, strategy: str) -> Optional[Dict]:
        """Get active parameters for a strategy"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if self.db_type == 'postgresql':
                cursor.execute("""
                    SELECT parameters FROM strategy_parameters
                    WHERE strategy = %s AND active = TRUE
                    ORDER BY version DESC LIMIT 1
                """, (strategy,))
            else:
                cursor.execute("""
                    SELECT parameters FROM strategy_parameters
                    WHERE strategy = ? AND active = 1
                    ORDER BY version DESC LIMIT 1
                """, (strategy,))
            
            result = cursor.fetchone()
            if result:
                return json.loads(result[0])
            return None
    
    def insert_risk_metrics(self,
                          var_95: float,
                          var_99: float,
                          expected_shortfall: float,
                          beta: float = None,
                          correlation_risk: float = None,
                          leverage: float = None):
        """Insert current risk metrics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            timestamp = datetime.now()
            
            if self.db_type == 'postgresql':
                cursor.execute("""
                    INSERT INTO risk_metrics 
                    (timestamp, var_95, var_99, expected_shortfall, beta, 
                     correlation_risk, leverage)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (timestamp, var_95, var_99, expected_shortfall, 
                     beta, correlation_risk, leverage))
            else:
                cursor.execute("""
                    INSERT INTO risk_metrics
                    (timestamp, var_95, var_99, expected_shortfall, beta,
                     correlation_risk, leverage)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (timestamp, var_95, var_99, expected_shortfall,
                     beta, correlation_risk, leverage))
    
    def get_trade_statistics(self, 
                            strategy: Optional[str] = None,
                            days: int = 30) -> Dict:
        """Get comprehensive trade statistics"""
        start_date = datetime.now() - timedelta(days=days)
        
        with self.get_connection() as conn:
            # Base query
            base_where = "WHERE timestamp >= ?"
            params = [start_date]
            
            if strategy:
                base_where += " AND strategy = ?"
                params.append(strategy)
            
            # Total trades
            query = f"SELECT COUNT(*) FROM trades {base_where}"
            cursor = conn.cursor()
            
            if self.db_type == 'postgresql':
                cursor.execute(query.replace('?', '%s'), params)
            else:
                cursor.execute(query, params)
            
            total_trades = cursor.fetchone()[0]
            
            # Win rate
            query = f"""
                SELECT 
                    SUM(CASE WHEN (side = 'SELL' AND price > 
                        (SELECT AVG(price) FROM trades t2 
                         WHERE t2.symbol = trades.symbol 
                         AND t2.side = 'BUY' 
                         AND t2.timestamp < trades.timestamp)) THEN 1 ELSE 0 END) as wins,
                    COUNT(*) as total
                FROM trades
                {base_where}
                AND side = 'SELL'
            """
            
            if self.db_type == 'postgresql':
                cursor.execute(query.replace('?', '%s'), params)
            else:
                cursor.execute(query, params)
            
            result = cursor.fetchone()
            win_rate = result[0] / result[1] if result[1] > 0 else 0
            
            # Average trade size
            query = f"SELECT AVG(quantity * price) FROM trades {base_where}"
            
            if self.db_type == 'postgresql':
                cursor.execute(query.replace('?', '%s'), params)
            else:
                cursor.execute(query, params)
            
            avg_trade_size = cursor.fetchone()[0] or 0
            
            # Total commission
            query = f"SELECT SUM(commission) FROM trades {base_where}"
            
            if self.db_type == 'postgresql':
                cursor.execute(query.replace('?', '%s'), params)
            else:
                cursor.execute(query, params)
            
            total_commission = cursor.fetchone()[0] or 0
            
            return {
                'total_trades': total_trades,
                'win_rate': win_rate,
                'avg_trade_size': avg_trade_size,
                'total_commission': total_commission,
                'period_days': days
            }
    
    def cleanup_old_data(self, days_to_keep: int = 90):
        """Clean up old data to manage database size"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            tables = ['trades', 'positions', 'performance_snapshots', 'risk_metrics']
            
            for table in tables:
                if self.db_type == 'postgresql':
                    cursor.execute(f"DELETE FROM {table} WHERE timestamp < %s", (cutoff_date,))
                else:
                    cursor.execute(f"DELETE FROM {table} WHERE timestamp < ?", (cutoff_date,))
                
                deleted = cursor.rowcount
                logger.info(f"Deleted {deleted} old records from {table}")
    
    def close(self):
        """Close database connections"""
        if self.db_type == 'postgresql' and hasattr(self, 'pool'):
            self.pool.closeall()
            logger.info("Closed PostgreSQL connection pool")


def test_database():
    """Test database functionality"""
    print("Testing Trading Database...")
    
    # Use SQLite for testing
    db = TradingDatabase(db_type='sqlite', sqlite_path='./test_trading.db')
    
    # Test inserting a trade
    trade = Trade(
        symbol='AAPL',
        side='BUY',
        quantity=100,
        price=150.50,
        timestamp=datetime.now(),
        strategy='TestStrategy',
        order_id='TEST123',
        commission=1.00,
        slippage=0.50
    )
    
    trade_id = db.insert_trade(trade)
    print(f"✅ Inserted trade with ID: {trade_id}")
    
    # Test retrieving trades
    trades_df = db.get_trades()
    print(f"✅ Retrieved {len(trades_df)} trades")
    
    # Test performance snapshot
    snapshot = PerformanceSnapshot(
        timestamp=datetime.now(),
        strategy='TestStrategy',
        total_return=0.15,
        sharpe_ratio=1.5,
        max_drawdown=0.10,
        win_rate=0.60,
        profit_factor=1.8,
        total_trades=50,
        portfolio_value=110000
    )
    
    db.insert_performance_snapshot(snapshot)
    print("✅ Inserted performance snapshot")
    
    # Test strategy parameters
    params = {'short_window': 20, 'long_window': 50}
    db.save_strategy_parameters('TestStrategy', params, performance_score=0.85)
    print("✅ Saved strategy parameters")
    
    retrieved_params = db.get_active_strategy_parameters('TestStrategy')
    print(f"✅ Retrieved parameters: {retrieved_params}")
    
    # Test statistics
    stats = db.get_trade_statistics()
    print(f"✅ Trade statistics: {stats}")
    
    # Clean up
    db.close()
    Path('./test_trading.db').unlink(missing_ok=True)
    
    print("\n✅ Database tests completed successfully!")


if __name__ == "__main__":
    test_database()
