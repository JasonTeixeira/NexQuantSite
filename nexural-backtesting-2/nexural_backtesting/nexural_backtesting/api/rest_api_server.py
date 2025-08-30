"""
REST API Server for Nexural Backtesting Platform
Professional API with FastAPI, authentication, and comprehensive endpoints
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import pandas as pd

# Add project root to path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from database.database_manager import (
    DatabaseManager, DatabaseConfig, DatabaseType,
    BacktestResult, MarketDataPoint, RiskMetrics
)
from nexural_backtesting.strategies.backtesting_engine import BacktestingEngine as AdvancedBacktestEngine, BacktestMode, BacktestConfig
from nexural_backtesting.risk.portfolio_risk_manager import PortfolioRiskManager as AdvancedRiskManager, RiskMetrics as RiskConfig
from src.live_trading.ninjatrader_integration import NinjaTraderConnector
from modular_system.real_time.websocket_data_stream import RealTimeDataStream, WebSocketConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# Pydantic models for API requests/responses
class BacktestRequest(BaseModel):
    strategy_name: str = Field(..., description="Name of the strategy")
    symbols: List[str] = Field(..., description="List of symbols to backtest")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    initial_capital: float = Field(100000.0, description="Initial capital")
    mode: str = Field("simple", description="Backtest mode: simple, walk_forward, monte_carlo, stress_test, optimization")
    config: Dict[str, Any] = Field(default_factory=dict, description="Strategy configuration")

class BacktestResponse(BaseModel):
    id: str
    strategy_name: str
    status: str
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    execution_time: float
    created_at: datetime

class StrategyRequest(BaseModel):
    name: str = Field(..., description="Strategy name")
    description: str = Field("", description="Strategy description")
    code: str = Field(..., description="Strategy code")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Strategy parameters")

class MarketDataRequest(BaseModel):
    symbol: str = Field(..., description="Symbol to fetch data for")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    interval: str = Field("1d", description="Data interval")

class RiskMetricsRequest(BaseModel):
    portfolio_id: str = Field(..., description="Portfolio ID")
    positions: Dict[str, float] = Field(..., description="Current positions")
    prices: Dict[str, List[float]] = Field(..., description="Current prices")

class OrderRequest(BaseModel):
    symbol: str = Field(..., description="Symbol to trade")
    quantity: int = Field(..., description="Quantity to trade")
    side: str = Field(..., description="Buy or Sell")
    order_type: str = Field("market", description="Order type")
    price: Optional[float] = Field(None, description="Limit price")
    stop_price: Optional[float] = Field(None, description="Stop price")

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

class APIServer:
    """Professional REST API Server for Nexural Backtesting"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.app = FastAPI(
            title="Nexural Backtesting API",
            description="Professional backtesting and trading API",
            version="1.0.0",
            docs_url="/docs",
            redoc_url="/redoc"
        )
        
        # Initialize components
        self.db_manager = None
        self.backtest_engine = None
        self.risk_manager = None
        self.ninja_connector = None
        self.websocket_server = None
        
        # Background tasks
        self.background_tasks = {}
        
        # Setup middleware and routes
        self._setup_middleware()
        self._setup_routes()
        self._setup_websocket()
    
    def _setup_middleware(self):
        """Setup CORS and other middleware"""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    def _setup_routes(self):
        """Setup API routes"""
        
        # Health check
        @self.app.get("/health", response_model=APIResponse)
        async def health_check():
            """Health check endpoint"""
            return APIResponse(
                success=True,
                message="API is healthy",
                data={
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat(),
                    "version": "1.0.0"
                }
            )
        
        # Authentication
        async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
            """Verify API token"""
            token = credentials.credentials
            # In production, implement proper JWT validation
            if token != self.config.get("api_key", "test_key"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key"
                )
            return token
        
        # Backtesting endpoints
        @self.app.post("/backtest", response_model=APIResponse)
        async def create_backtest(
            request: BacktestRequest,
            background_tasks: BackgroundTasks,
            token: str = Depends(verify_token)
        ):
            """Create a new backtest"""
            try:
                backtest_id = str(uuid.uuid4())
                
                # Add to background tasks
                background_tasks.add_task(
                    self._run_backtest_async,
                    backtest_id,
                    request
                )
                
                return APIResponse(
                    success=True,
                    message="Backtest started",
                    data={
                        "backtest_id": backtest_id,
                        "status": "running"
                    }
                )
                
            except Exception as e:
                logger.error(f"Failed to create backtest: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        @self.app.get("/backtest/{backtest_id}", response_model=APIResponse)
        async def get_backtest(
            backtest_id: str,
            token: str = Depends(verify_token)
        ):
            """Get backtest results"""
            try:
                result = await self.db_manager.get_backtest_result(backtest_id)
                if not result:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Backtest not found"
                    )
                
                return APIResponse(
                    success=True,
                    message="Backtest retrieved",
                    data={
                        "id": result.id,
                        "strategy_name": result.strategy_name,
                        "total_return": result.total_return,
                        "sharpe_ratio": result.sharpe_ratio,
                        "max_drawdown": result.max_drawdown,
                        "win_rate": result.win_rate,
                        "total_trades": result.total_trades,
                        "execution_time": result.execution_time,
                        "created_at": result.created_at.isoformat()
                    }
                )
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Failed to get backtest: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        @self.app.get("/backtests", response_model=APIResponse)
        async def list_backtests(
            strategy_name: Optional[str] = None,
            limit: int = 100,
            token: str = Depends(verify_token)
        ):
            """List backtest results"""
            try:
                results = await self.db_manager.get_backtest_results(
                    strategy_name=strategy_name,
                    limit=limit
                )
                
                data = []
                for result in results:
                    data.append({
                        "id": result.id,
                        "strategy_name": result.strategy_name,
                        "total_return": result.total_return,
                        "sharpe_ratio": result.sharpe_ratio,
                        "max_drawdown": result.max_drawdown,
                        "win_rate": result.win_rate,
                        "total_trades": result.total_trades,
                        "created_at": result.created_at.isoformat()
                    })
                
                return APIResponse(
                    success=True,
                    message=f"Retrieved {len(data)} backtests",
                    data=data
                )
                
            except Exception as e:
                logger.error(f"Failed to list backtests: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        # Market data endpoints
        @self.app.get("/market-data/{symbol}", response_model=APIResponse)
        async def get_market_data(
            symbol: str,
            start_date: str,
            end_date: str,
            limit: int = 1000,
            token: str = Depends(verify_token)
        ):
            """Get market data for a symbol"""
            try:
                start_dt = datetime.fromisoformat(start_date)
                end_dt = datetime.fromisoformat(end_date)
                
                data_points = await self.db_manager.get_market_data(
                    symbol=symbol,
                    start_date=start_dt,
                    end_date=end_dt,
                    limit=limit
                )
                
                data = []
                for dp in data_points:
                    data.append({
                        "symbol": dp.symbol,
                        "timestamp": dp.timestamp.isoformat(),
                        "open": dp.open,
                        "high": dp.high,
                        "low": dp.low,
                        "close": dp.close,
                        "volume": dp.volume,
                        "source": dp.source
                    })
                
                return APIResponse(
                    success=True,
                    message=f"Retrieved {len(data)} data points for {symbol}",
                    data=data
                )
                
            except Exception as e:
                logger.error(f"Failed to get market data: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        # Risk management endpoints
        @self.app.post("/risk/calculate", response_model=APIResponse)
        async def calculate_risk_metrics(
            request: RiskMetricsRequest,
            token: str = Depends(verify_token)
        ):
            """Calculate risk metrics for a portfolio"""
            try:
                # Convert prices to pandas Series
                prices_dict = {}
                for symbol, price_list in request.prices.items():
                    if symbol in request.positions:
                        # Create a simple price series for demonstration
                        dates = pd.date_range(
                            start=datetime.now() - timedelta(days=30),
                            end=datetime.now(),
                            freq='D'
                        )
                        prices_dict[symbol] = pd.Series(price_list, index=dates)
                
                # Calculate risk metrics
                risk_metrics = await self.risk_manager.calculate_portfolio_risk(
                    positions=request.positions,
                    prices=prices_dict,
                    portfolio_value=sum(request.positions.values())
                )
                
                return APIResponse(
                    success=True,
                    message="Risk metrics calculated",
                    data={
                        "portfolio_var": risk_metrics.portfolio_var,
                        "portfolio_cvar": risk_metrics.portfolio_cvar,
                        "portfolio_volatility": risk_metrics.portfolio_volatility,
                        "portfolio_beta": risk_metrics.portfolio_beta,
                        "portfolio_sharpe": risk_metrics.portfolio_sharpe,
                        "position_weights": risk_metrics.position_weights,
                        "limit_breaches": risk_metrics.limit_breaches
                    }
                )
                
            except Exception as e:
                logger.error(f"Failed to calculate risk metrics: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        # Trading endpoints
        @self.app.post("/trading/order", response_model=APIResponse)
        async def place_order(
            request: OrderRequest,
            token: str = Depends(verify_token)
        ):
            """Place a trading order"""
            try:
                if not self.ninja_connector:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Trading service not available"
                    )
                
                order_id = await self.ninja_connector.place_order(
                    symbol=request.symbol,
                    quantity=request.quantity,
                    side=request.side,
                    order_type=request.order_type,
                    price=request.price,
                    stop_price=request.stop_price
                )
                
                return APIResponse(
                    success=True,
                    message="Order placed successfully",
                    data={"order_id": order_id}
                )
                
            except Exception as e:
                logger.error(f"Failed to place order: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        @self.app.get("/trading/positions", response_model=APIResponse)
        async def get_positions(token: str = Depends(verify_token)):
            """Get current positions"""
            try:
                if not self.ninja_connector:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Trading service not available"
                    )
                
                positions = await self.ninja_connector.get_positions()
                
                data = []
                for pos in positions.values():
                    data.append({
                        "symbol": pos.symbol,
                        "quantity": pos.quantity,
                        "avg_price": pos.avg_price,
                        "unrealized_pnl": pos.unrealized_pnl,
                        "timestamp": pos.timestamp.isoformat()
                    })
                
                return APIResponse(
                    success=True,
                    message=f"Retrieved {len(data)} positions",
                    data=data
                )
                
            except Exception as e:
                logger.error(f"Failed to get positions: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        # System endpoints
        @self.app.get("/system/status", response_model=APIResponse)
        async def get_system_status(token: str = Depends(verify_token)):
            """Get system status"""
            try:
                status_data = {
                    "database": {
                        "connected": self.db_manager is not None,
                        "performance": self.db_manager.get_performance_stats() if self.db_manager else None
                    },
                    "trading": {
                        "connected": self.ninja_connector is not None,
                        "status": self.ninja_connector.connection_status if self.ninja_connector else "disconnected"
                    },
                    "websocket": {
                        "running": self.websocket_server is not None and self.websocket_server.is_running,
                        "clients": len(self.websocket_server.clients) if self.websocket_server else 0
                    },
                    "timestamp": datetime.now().isoformat()
                }
                
                return APIResponse(
                    success=True,
                    message="System status retrieved",
                    data=status_data
                )
                
            except Exception as e:
                logger.error(f"Failed to get system status: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
        
        @self.app.get("/alerts", response_model=APIResponse)
        async def get_alerts(
            severity: Optional[str] = None,
            acknowledged: Optional[bool] = None,
            limit: int = 100,
            token: str = Depends(verify_token)
        ):
            """Get system alerts"""
            try:
                alerts = await self.db_manager.get_alerts(
                    severity=severity,
                    acknowledged=acknowledged,
                    limit=limit
                )
                
                return APIResponse(
                    success=True,
                    message=f"Retrieved {len(alerts)} alerts",
                    data=alerts
                )
                
            except Exception as e:
                logger.error(f"Failed to get alerts: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
    
    def _setup_websocket(self):
        """Setup WebSocket endpoints"""
        from fastapi import WebSocket, WebSocketDisconnect
        
        @self.app.websocket("/ws/market-data")
        async def websocket_market_data(websocket: WebSocket):
            """WebSocket endpoint for real-time market data"""
            await websocket.accept()
            
            try:
                # Add client to WebSocket server
                if self.websocket_server:
                    self.websocket_server.clients.add(websocket)
                
                while True:
                    # Keep connection alive
                    await websocket.receive_text()
                    
            except WebSocketDisconnect:
                if self.websocket_server:
                    self.websocket_server.clients.discard(websocket)
    
    async def _run_backtest_async(self, backtest_id: str, request: BacktestRequest):
        """Run backtest asynchronously"""
        try:
            logger.info(f"Starting backtest {backtest_id}")
            
            # Parse dates
            start_date = datetime.fromisoformat(request.start_date)
            end_date = datetime.fromisoformat(request.end_date)
            
            # Create backtest config
            backtest_config = BacktestConfig(
                initial_capital=request.initial_capital,
                commission=0.001,
                slippage=0.0005,
                position_sizing="kelly"
            )
            
            # Initialize backtest engine
            self.backtest_engine = AdvancedBacktestEngine(backtest_config)
            
            # Get market data (simplified - in production, fetch from data source)
            # For now, create dummy data
            dates = pd.date_range(start=start_date, end=end_date, freq='D')
            data = pd.DataFrame({
                'timestamp': dates,
                'open': 100 + np.random.randn(len(dates)) * 2,
                'high': 100 + np.random.randn(len(dates)) * 2 + 1,
                'low': 100 + np.random.randn(len(dates)) * 2 - 1,
                'close': 100 + np.random.randn(len(dates)) * 2,
                'volume': np.random.randint(1000000, 5000000, len(dates))
            })
            
            # Simple strategy function
            def simple_strategy(df: pd.DataFrame) -> pd.DataFrame:
                df['signal'] = 0
                df.loc[df['close'] > df['close'].rolling(20).mean(), 'signal'] = 1
                df.loc[df['close'] < df['close'].rolling(20).mean(), 'signal'] = -1
                return df
            
            # Run backtest
            start_time = datetime.now()
            result = await self.backtest_engine.run_backtest(
                strategy_func=simple_strategy,
                data=data,
                mode=BacktestMode.SIMPLE
            )
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Save result to database
            backtest_result = BacktestResult(
                id=backtest_id,
                strategy_name=request.strategy_name,
                start_date=start_date,
                end_date=end_date,
                initial_capital=request.initial_capital,
                final_capital=result.final_capital,
                total_return=result.total_return,
                sharpe_ratio=result.sharpe_ratio,
                max_drawdown=result.max_drawdown,
                win_rate=result.win_rate,
                total_trades=result.total_trades,
                profit_factor=result.profit_factor,
                calmar_ratio=result.calmar_ratio,
                sortino_ratio=result.sortino_ratio,
                config=request.config,
                results_data=result.results_data,
                created_at=datetime.now(),
                execution_time=execution_time
            )
            
            await self.db_manager.save_backtest_result(backtest_result)
            logger.info(f"Completed backtest {backtest_id}")
            
        except Exception as e:
            logger.error(f"Backtest {backtest_id} failed: {e}")
            # Create error alert
            await self.db_manager.create_alert(
                "BACKTEST_ERROR",
                f"Backtest {backtest_id} failed: {str(e)}",
                "ERROR"
            )
    
    async def initialize(self):
        """Initialize API server components"""
        try:
            # Initialize database
            db_config = DatabaseConfig(
                db_type=DatabaseType.SQLITE,
                db_path=self.config.get("db_path", "nexural_backtesting.db"),
                enable_caching=True
            )
            self.db_manager = DatabaseManager(db_config)
            
            # Initialize risk manager
            risk_config = RiskConfig(
                var_confidence=0.95,
                max_position_size=0.1,
                max_portfolio_var=0.02,
                max_drawdown_limit=0.15
            )
            self.risk_manager = AdvancedRiskManager(risk_config)
            
            # Initialize WebSocket server
            ws_config = WebSocketConfig(
                host="localhost",
                port=8765,
                max_connections=100
            )
            self.websocket_server = RealTimeDataStream(ws_config)
            await self.websocket_server.start_server()
            
            logger.info("✅ API server initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize API server: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown API server"""
        try:
            if self.websocket_server:
                await self.websocket_server.stop_server()
            
            if self.db_manager:
                await self.db_manager.close()
            
            logger.info("✅ API server shutdown complete")
            
        except Exception as e:
            logger.error(f"❌ Error during API server shutdown: {e}")
    
    def run(self, host: str = "0.0.0.0", port: int = 8000):
        """Run the API server"""
        uvicorn.run(
            self.app,
            host=host,
            port=port,
            log_level="info"
        )

# Create global app instance for deployment
config = {
    "api_key": "your_api_key_here",
    "db_path": "nexural_backtesting.db"
}

# Create API server instance
api_server = APIServer(config)
app = api_server.app  # Export the FastAPI app for ASGI servers

# Example usage
if __name__ == "__main__":
    config = {
        "api_key": "your_api_key_here",
        "db_path": "nexural_backtesting.db"
    }
    
    server = APIServer(config)
    server.run()
