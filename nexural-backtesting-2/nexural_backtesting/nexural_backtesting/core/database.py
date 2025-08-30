"""
Enhanced Database Layer for Enterprise Quantitative Backtesting Engine
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
import asyncio
from contextlib import contextmanager
import json
from pathlib import Path

# Database imports
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from psycopg2.pool import SimpleConnectionPool, ThreadedConnectionPool
import sqlalchemy as sa
from sqlalchemy import create_engine, text, MetaData, Table, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

logger = logging.getLogger(__name__)

# SQLAlchemy base
Base = declarative_base()

class DatabaseManager:
    """
    Enhanced database manager with TimescaleDB support
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize database manager
        
        Args:
            config: Database configuration
        """
        self.config = config
        self.engine = None
        self.pool = None
        self.metadata = MetaData()
        self.Session = None
        
        # Connection settings
        self.host = config.get('host', 'localhost')
        self.port = config.get('port', 5432)
        self.database = config.get('database', 'nexural_backtesting')
        self.username = config.get('username', 'nexural_user')
        self.password = config.get('password', '')
        self.pool_size = config.get('pool_size', 20)
        self.max_overflow = config.get('max_overflow', 30)
        
        # Initialize database
        self._initialize_database()
        self._create_tables()
        
        logger.info(f"Database manager initialized for {self.database}")
    
    def _initialize_database(self):
        """Initialize database connection and engine"""
        try:
            # Create SQLAlchemy engine
            connection_string = f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"
            self.engine = create_engine(
                connection_string,
                pool_size=self.pool_size,
                max_overflow=self.max_overflow,
                pool_pre_ping=True,
                pool_recycle=3600,
                echo=False
            )
            
            # Create session factory
            self.Session = sessionmaker(bind=self.engine)
            
            # Create connection pool
            self.pool = ThreadedConnectionPool(
                minconn=5,
                maxconn=self.pool_size + self.max_overflow,
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.username,
                password=self.password
            )
            
            logger.info("Database connections initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def _create_tables(self):
        """Create database tables if they don't exist"""
        try:
            # Create tables
            Base.metadata.create_all(self.engine)
            
            # Enable TimescaleDB extension
            self._enable_timescaledb()
            
            # Create hypertables
            self._create_hypertables()
            
            logger.info("Database tables created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")
            raise
    
    def _enable_timescaledb(self):
        """Enable TimescaleDB extension"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("CREATE EXTENSION IF NOT EXISTS timescaledb;")
                    conn.commit()
                    logger.info("TimescaleDB extension enabled")
        except Exception as e:
            logger.warning(f"Failed to enable TimescaleDB: {e}")
    
    def _create_hypertables(self):
        """Create TimescaleDB hypertables for time-series data"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Create market data hypertable
                    cursor.execute("""
                        SELECT create_hypertable('market_data', 'timestamp', 
                                               if_not_exists => TRUE,
                                               chunk_time_interval => INTERVAL '1 day');
                    """)
                    
                    # Create order book hypertable
                    cursor.execute("""
                        SELECT create_hypertable('order_book_data', 'timestamp', 
                                               if_not_exists => TRUE,
                                               chunk_time_interval => INTERVAL '1 hour');
                    """)
                    
                    # Create trade data hypertable
                    cursor.execute("""
                        SELECT create_hypertable('trade_data', 'timestamp', 
                                               if_not_exists => TRUE,
                                               chunk_time_interval => INTERVAL '1 hour');
                    """)
                    
                    conn.commit()
                    logger.info("TimescaleDB hypertables created")
                    
        except Exception as e:
            logger.warning(f"Failed to create hypertables: {e}")
    
    @contextmanager
    def get_connection(self):
        """Get database connection from pool"""
        conn = None
        try:
            conn = self.pool.getconn()
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                self.pool.putconn(conn)
    
    @contextmanager
    def get_session(self):
        """Get SQLAlchemy session"""
        session = self.Session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    def execute_query(self, query: str, params: Optional[Dict] = None) -> List[Dict]:
        """
        Execute a query and return results
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            List of result dictionaries
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or {})
                return cursor.fetchall()
    
    def execute_command(self, command: str, params: Optional[Dict] = None) -> int:
        """
        Execute a command and return affected rows
        
        Args:
            command: SQL command
            params: Command parameters
            
        Returns:
            Number of affected rows
        """
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(command, params or {})
                conn.commit()
                return cursor.rowcount
    
    def insert_dataframe(self, df: pd.DataFrame, table_name: str, 
                        if_exists: str = 'append', index: bool = False) -> int:
        """
        Insert DataFrame into database table
        
        Args:
            df: DataFrame to insert
            table_name: Target table name
            if_exists: How to behave if table exists ('fail', 'replace', 'append')
            index: Whether to include DataFrame index
            
        Returns:
            Number of rows inserted
        """
        try:
            df.to_sql(
                table_name,
                self.engine,
                if_exists=if_exists,
                index=index,
                method='multi',
                chunksize=10000
            )
            return len(df)
        except Exception as e:
            logger.error(f"Failed to insert DataFrame into {table_name}: {e}")
            raise
    
    def read_dataframe(self, query: str, params: Optional[Dict] = None) -> pd.DataFrame:
        """
        Read data into DataFrame
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            DataFrame with query results
        """
        try:
            return pd.read_sql_query(query, self.engine, params=params)
        except Exception as e:
            logger.error(f"Failed to read DataFrame: {e}")
            raise
    
    def store_market_data(self, df: pd.DataFrame, symbol: str, data_type: str) -> int:
        """
        Store market data in TimescaleDB
        
        Args:
            df: Market data DataFrame
            symbol: Symbol
            data_type: Type of data (tick, ohlcv, order_book)
            
        Returns:
            Number of rows stored
        """
        try:
            # Prepare data
            df_copy = df.copy()
            df_copy['symbol'] = symbol
            df_copy['data_type'] = data_type
            df_copy['created_at'] = datetime.now()
            
            # Ensure timestamp column exists
            if 'timestamp' not in df_copy.columns:
                df_copy['timestamp'] = df_copy.index
            
            # Store in appropriate table
            if data_type == 'order_book':
                table_name = 'order_book_data'
            elif data_type == 'trades':
                table_name = 'trade_data'
            else:
                table_name = 'market_data'
            
            return self.insert_dataframe(df_copy, table_name)
            
        except Exception as e:
            logger.error(f"Failed to store market data for {symbol}: {e}")
            raise
    
    def get_market_data(self, symbol: str, start_date: datetime, end_date: datetime,
                       data_type: str = 'ohlcv', limit: Optional[int] = None) -> pd.DataFrame:
        """
        Get market data from database
        
        Args:
            symbol: Symbol
            start_date: Start date
            end_date: End date
            data_type: Type of data
            limit: Maximum number of rows
            
        Returns:
            Market data DataFrame
        """
        try:
            # Determine table name
            if data_type == 'order_book':
                table_name = 'order_book_data'
            elif data_type == 'trades':
                table_name = 'trade_data'
            else:
                table_name = 'market_data'
            
            # Build query
            query = f"""
                SELECT * FROM {table_name}
                WHERE symbol = %(symbol)s
                AND timestamp BETWEEN %(start_date)s AND %(end_date)s
                AND data_type = %(data_type)s
                ORDER BY timestamp
            """
            
            params = {
                'symbol': symbol,
                'start_date': start_date,
                'end_date': end_date,
                'data_type': data_type
            }
            
            if limit:
                query += f" LIMIT {limit}"
            
            return self.read_dataframe(query, params)
            
        except Exception as e:
            logger.error(f"Failed to get market data for {symbol}: {e}")
            raise
    
    def get_latest_data(self, symbol: str, data_type: str = 'ohlcv', 
                       limit: int = 1000) -> pd.DataFrame:
        """
        Get latest market data
        
        Args:
            symbol: Symbol
            data_type: Type of data
            limit: Number of latest records
            
        Returns:
            Latest market data DataFrame
        """
        try:
            # Determine table name
            if data_type == 'order_book':
                table_name = 'order_book_data'
            elif data_type == 'trades':
                table_name = 'trade_data'
            else:
                table_name = 'market_data'
            
            query = f"""
                SELECT * FROM {table_name}
                WHERE symbol = %(symbol)s
                AND data_type = %(data_type)s
                ORDER BY timestamp DESC
                LIMIT %(limit)s
            """
            
            params = {
                'symbol': symbol,
                'data_type': data_type,
                'limit': limit
            }
            
            df = self.read_dataframe(query, params)
            return df.sort_values('timestamp').reset_index(drop=True)
            
        except Exception as e:
            logger.error(f"Failed to get latest data for {symbol}: {e}")
            raise
    
    def get_data_summary(self, symbol: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """
        Get data summary statistics
        
        Args:
            symbol: Symbol
            start_date: Start date
            end_date: End date
            
        Returns:
            Data summary dictionary
        """
        try:
            query = """
                SELECT 
                    data_type,
                    COUNT(*) as record_count,
                    MIN(timestamp) as first_record,
                    MAX(timestamp) as last_record,
                    AVG(EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))) as avg_interval_seconds
                FROM market_data
                WHERE symbol = %(symbol)s
                AND timestamp BETWEEN %(start_date)s AND %(end_date)s
                GROUP BY data_type
            """
            
            params = {
                'symbol': symbol,
                'start_date': start_date,
                'end_date': end_date
            }
            
            results = self.execute_query(query, params)
            
            summary = {
                'symbol': symbol,
                'start_date': start_date,
                'end_date': end_date,
                'data_types': {}
            }
            
            for row in results:
                summary['data_types'][row['data_type']] = {
                    'record_count': row['record_count'],
                    'first_record': row['first_record'],
                    'last_record': row['last_record'],
                    'avg_interval_seconds': row['avg_interval_seconds']
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get data summary for {symbol}: {e}")
            raise
    
    def cleanup_old_data(self, days_to_keep: int = 365) -> int:
        """
        Clean up old data
        
        Args:
            days_to_keep: Number of days to keep
            
        Returns:
            Number of rows deleted
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            tables = ['market_data', 'order_book_data', 'trade_data']
            total_deleted = 0
            
            for table in tables:
                query = f"DELETE FROM {table} WHERE timestamp < %(cutoff_date)s"
                params = {'cutoff_date': cutoff_date}
                
                deleted = self.execute_command(query, params)
                total_deleted += deleted
                
                logger.info(f"Deleted {deleted} rows from {table}")
            
            return total_deleted
            
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")
            raise
    
    def optimize_tables(self):
        """Optimize database tables"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # VACUUM tables
                    cursor.execute("VACUUM ANALYZE market_data;")
                    cursor.execute("VACUUM ANALYZE order_book_data;")
                    cursor.execute("VACUUM ANALYZE trade_data;")
                    
                    # Compress old chunks
                    cursor.execute("SELECT compress_chunk(chunk_name) FROM timescaledb_information.chunks WHERE hypertable_name = 'market_data' AND NOT is_compressed;")
                    
                    conn.commit()
                    logger.info("Database tables optimized")
                    
        except Exception as e:
            logger.warning(f"Failed to optimize tables: {e}")
    
    def get_database_stats(self) -> Dict[str, Any]:
        """
        Get database statistics
        
        Returns:
            Database statistics
        """
        try:
            stats = {}
            
            # Table sizes
            size_query = """
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY size_bytes DESC;
            """
            
            size_results = self.execute_query(size_query)
            stats['table_sizes'] = size_results
            
            # Row counts
            count_query = """
                SELECT 
                    'market_data' as table_name,
                    COUNT(*) as row_count
                FROM market_data
                UNION ALL
                SELECT 
                    'order_book_data' as table_name,
                    COUNT(*) as row_count
                FROM order_book_data
                UNION ALL
                SELECT 
                    'trade_data' as table_name,
                    COUNT(*) as row_count
                FROM trade_data;
            """
            
            count_results = self.execute_query(count_query)
            stats['row_counts'] = count_results
            
            # TimescaleDB stats
            timescale_query = """
                SELECT 
                    hypertable_name,
                    num_chunks,
                    compression_enabled,
                    is_compressed
                FROM timescaledb_information.hypertables;
            """
            
            timescale_results = self.execute_query(timescale_query)
            stats['timescale_stats'] = timescale_results
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {}
    
    def close(self):
        """Close database connections"""
        try:
            if self.pool:
                self.pool.closeall()
            if self.engine:
                self.engine.dispose()
            logger.info("Database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {e}")


# Database Models
class MarketData(Base):
    """Market data model"""
    __tablename__ = 'market_data'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    data_type = Column(String(20), nullable=False)
    price = Column(Float)
    volume = Column(Float)
    bid_price = Column(Float)
    ask_price = Column(Float)
    open_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    close_price = Column(Float)
    additional_data = Column(JSONB)
    created_at = Column(DateTime, default=datetime.now)


class OrderBookData(Base):
    """Order book data model"""
    __tablename__ = 'order_book_data'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    data_type = Column(String(20), nullable=False)
    mid_price = Column(Float)
    bid_prices = Column(ARRAY(Float))
    ask_prices = Column(ARRAY(Float))
    bid_sizes = Column(ARRAY(Float))
    ask_sizes = Column(ARRAY(Float))
    spread = Column(Float)
    book_imbalance = Column(Float)
    additional_data = Column(JSONB)
    created_at = Column(DateTime, default=datetime.now)


class TradeData(Base):
    """Trade data model"""
    __tablename__ = 'trade_data'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    data_type = Column(String(20), nullable=False)
    price = Column(Float)
    volume = Column(Float)
    side = Column(String(10))  # buy, sell
    trade_id = Column(String(50))
    additional_data = Column(JSONB)
    created_at = Column(DateTime, default=datetime.now)
