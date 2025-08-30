# 🔧 Modular Architecture Blueprint

**Plug-and-Play Infrastructure for Universal Trading System**

---

## 🎯 **Vision: Universal Trading Hub**

### **What We're Building:**
- **🔌 Modular Data Connectors** - Connect to ANY data source
- **🧠 Swappable ML Engines** - Hot-swap ML technologies
- **💾 Universal Data Storage** - Handle any data format
- **🌐 Multi-API Integration** - Connect to all trading venues
- **⚡ Real-Time Processing** - Live data and execution
- **🔄 Portable Components** - Move between environments

---

## 🏗️ **Core Architecture: Modular Plumbing**

### **1. Data Layer Architecture**
```
nexural-modular-system/
├── data_connectors/           # Universal data adapters
│   ├── base_connector.py      # Abstract base class
│   ├── market_data/           # Market data sources
│   │   ├── databento.py       # Databento connector
│   │   ├── alpaca.py          # Alpaca connector
│   │   ├── polygon.py         # Polygon connector
│   │   ├── yahoo_finance.py   # Yahoo Finance connector
│   │   └── custom_connector.py # Template for new sources
│   ├── fundamental_data/      # Fundamental data
│   │   ├── alpha_vantage.py   # Alpha Vantage
│   │   ├── quandl.py          # Quandl
│   │   └── sec_edgar.py       # SEC filings
│   └── alternative_data/      # Alternative data
│       ├── news_api.py        # News sentiment
│       ├── social_media.py    # Social sentiment
│       └── weather_api.py     # Weather data
├── data_storage/              # Universal storage layer
│   ├── time_series_db.py      # Time series storage
│   ├── document_db.py         # Document storage
│   ├── cache_layer.py         # High-speed cache
│   └── data_normalizer.py     # Universal data format
└── data_pipeline/             # Data processing
    ├── real_time_processor.py # Live data processing
    ├── batch_processor.py     # Historical data processing
    └── data_validator.py      # Data quality checks
```

### **2. ML Engine Architecture**
```
ml_engine/
├── base_ml_engine.py          # Abstract ML engine
├── engines/                   # Swappable ML engines
│   ├── sklearn_engine.py      # Scikit-learn engine
│   ├── tensorflow_engine.py   # TensorFlow engine
│   ├── pytorch_engine.py      # PyTorch engine
│   ├── xgboost_engine.py      # XGBoost engine
│   ├── custom_ml_engine.py    # Template for new engines
│   └── ensemble_engine.py     # Multi-engine ensemble
├── model_registry/            # Model management
│   ├── model_storage.py       # Model persistence
│   ├── version_control.py     # Model versioning
│   └── model_deployment.py    # Model deployment
└── ml_pipeline/               # ML workflow
    ├── feature_engineering.py # Feature processing
    ├── model_training.py      # Training pipeline
    ├── model_evaluation.py    # Model evaluation
    └── prediction_service.py  # Real-time predictions
```

### **3. Execution Layer Architecture**
```
execution_engine/
├── base_executor.py           # Abstract execution
├── executors/                 # Trading venue connectors
│   ├── paper_trading.py       # Paper trading
│   ├── alpaca_executor.py     # Alpaca trading
│   ├── interactive_brokers.py # IB trading
│   ├── binance_executor.py    # Crypto trading
│   └── custom_executor.py     # Template for new venues
├── order_management/          # Order handling
│   ├── order_router.py        # Route orders
│   ├── position_tracker.py    # Track positions
│   └── risk_manager.py        # Risk management
└── execution_analytics/       # Execution analysis
    ├── slippage_analyzer.py   # Slippage analysis
    ├── execution_optimizer.py # Optimize execution
    └── performance_tracker.py # Track performance
```

---

## 🔌 **Universal Data Connector System**

### **1. Base Connector Interface**
```python
# data_connectors/base_connector.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio

class BaseDataConnector(ABC):
    """Universal data connector interface"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.connection_status = "disconnected"
        self.data_cache = {}
        
    @abstractmethod
    async def connect(self) -> bool:
        """Connect to data source"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from data source"""
        pass
    
    @abstractmethod
    async def get_historical_data(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime,
        interval: str = "1d"
    ) -> Dict[str, Any]:
        """Get historical data"""
        pass
    
    @abstractmethod
    async def get_real_time_data(
        self, 
        symbols: List[str]
    ) -> Dict[str, Any]:
        """Get real-time data"""
        pass
    
    @abstractmethod
    async def subscribe_to_stream(
        self, 
        symbols: List[str], 
        callback: callable
    ) -> bool:
        """Subscribe to real-time stream"""
        pass
    
    def get_connection_status(self) -> str:
        """Get connection status"""
        return self.connection_status
    
    def get_supported_symbols(self) -> List[str]:
        """Get supported symbols"""
        return self.config.get("supported_symbols", [])
    
    def get_data_quality_score(self) -> float:
        """Get data quality score"""
        return self.config.get("data_quality_score", 0.0)
```

### **2. Market Data Connector Example**
```python
# data_connectors/market_data/databento_connector.py
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Any
from ..base_connector import BaseDataConnector

class DatabentoConnector(BaseDataConnector):
    """Databento market data connector"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.base_url = "https://hist.databento.com"
        self.session = None
        
    async def connect(self) -> bool:
        """Connect to Databento"""
        try:
            self.session = aiohttp.ClientSession()
            # Test connection
            async with self.session.get(f"{self.base_url}/v0/metadata/list_datasets") as response:
                if response.status == 200:
                    self.connection_status = "connected"
                    return True
            return False
        except Exception as e:
            print(f"Databento connection failed: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from Databento"""
        try:
            if self.session:
                await self.session.close()
            self.connection_status = "disconnected"
            return True
        except Exception as e:
            print(f"Databento disconnect failed: {e}")
            return False
    
    async def get_historical_data(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime,
        interval: str = "1d"
    ) -> Dict[str, Any]:
        """Get historical data from Databento"""
        try:
            # Format request for Databento API
            params = {
                "dataset": "GLBX.MDP3",  # Example dataset
                "symbols": symbol,
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "stype_in": "symbol",
                "stype_out": "symbol"
            }
            
            async with self.session.get(f"{self.base_url}/v0/timeseries.get_range", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._normalize_data(data)
                else:
                    raise Exception(f"Databento API error: {response.status}")
                    
        except Exception as e:
            print(f"Error getting historical data: {e}")
            return {}
    
    async def get_real_time_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Get real-time data from Databento"""
        # Implementation for real-time data
        pass
    
    async def subscribe_to_stream(self, symbols: List[str], callback: callable) -> bool:
        """Subscribe to real-time stream"""
        # Implementation for streaming
        pass
    
    def _normalize_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize data to universal format"""
        # Convert Databento format to universal format
        normalized = {
            "symbol": raw_data.get("symbol"),
            "timestamp": raw_data.get("timestamp"),
            "open": raw_data.get("open"),
            "high": raw_data.get("high"),
            "low": raw_data.get("low"),
            "close": raw_data.get("close"),
            "volume": raw_data.get("volume"),
            "source": "databento"
        }
        return normalized
```

### **3. Data Storage Layer**
```python
# data_storage/universal_storage.py
import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import sqlite3
import redis
import pandas as pd

class UniversalDataStorage:
    """Universal data storage layer"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.time_series_db = None
        self.cache_db = None
        self.document_db = None
        
    async def initialize(self):
        """Initialize storage systems"""
        # Initialize time series database
        self.time_series_db = await self._init_time_series_db()
        
        # Initialize cache
        self.cache_db = await self._init_cache()
        
        # Initialize document storage
        self.document_db = await self._init_document_db()
    
    async def store_market_data(self, data: Dict[str, Any]) -> bool:
        """Store market data in universal format"""
        try:
            # Store in time series database
            await self._store_time_series(data)
            
            # Cache recent data
            await self._cache_data(data)
            
            return True
        except Exception as e:
            print(f"Error storing market data: {e}")
            return False
    
    async def retrieve_market_data(
        self, 
        symbol: str, 
        start_date: datetime, 
        end_date: datetime,
        interval: str = "1d"
    ) -> Dict[str, Any]:
        """Retrieve market data"""
        try:
            # Check cache first
            cached_data = await self._get_cached_data(symbol, start_date, end_date)
            if cached_data:
                return cached_data
            
            # Get from time series database
            data = await self._get_time_series_data(symbol, start_date, end_date)
            
            # Cache the result
            await self._cache_data(data)
            
            return data
        except Exception as e:
            print(f"Error retrieving market data: {e}")
            return {}
    
    async def _init_time_series_db(self):
        """Initialize time series database"""
        # Use SQLite for time series data
        conn = sqlite3.connect("market_data.db")
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume INTEGER,
                source TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(symbol, timestamp)
            )
        """)
        
        conn.commit()
        return conn
    
    async def _init_cache(self):
        """Initialize cache"""
        # Use Redis for caching
        return redis.Redis(host='localhost', port=6379, db=0)
    
    async def _init_document_db(self):
        """Initialize document storage"""
        # Use SQLite for document storage
        conn = sqlite3.connect("documents.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_type TEXT NOT NULL,
                content TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        return conn
```

---

## 🧠 **Swappable ML Engine System**

### **1. Base ML Engine Interface**
```python
# ml_engine/base_ml_engine.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd

class BaseMLEngine(ABC):
    """Universal ML engine interface"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.feature_columns = []
        self.target_column = ""
        self.is_trained = False
        
    @abstractmethod
    async def train(
        self, 
        features: pd.DataFrame, 
        targets: pd.Series,
        hyperparameters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Train the model"""
        pass
    
    @abstractmethod
    async def predict(
        self, 
        features: pd.DataFrame
    ) -> np.ndarray:
        """Make predictions"""
        pass
    
    @abstractmethod
    async def evaluate(
        self, 
        features: pd.DataFrame, 
        targets: pd.Series
    ) -> Dict[str, float]:
        """Evaluate model performance"""
        pass
    
    @abstractmethod
    async def save_model(self, path: str) -> bool:
        """Save model to disk"""
        pass
    
    @abstractmethod
    async def load_model(self, path: str) -> bool:
        """Load model from disk"""
        pass
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "engine_type": self.__class__.__name__,
            "is_trained": self.is_trained,
            "feature_columns": self.feature_columns,
            "target_column": self.target_column,
            "config": self.config
        }
```

### **2. Scikit-Learn Engine Example**
```python
# ml_engine/engines/sklearn_engine.py
import asyncio
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from ..base_ml_engine import BaseMLEngine

class SklearnEngine(BaseMLEngine):
    """Scikit-learn ML engine"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.model_type = config.get("model_type", "random_forest")
        self.model = self._create_model()
    
    def _create_model(self):
        """Create model based on configuration"""
        if self.model_type == "random_forest":
            return RandomForestRegressor(
                n_estimators=self.config.get("n_estimators", 100),
                max_depth=self.config.get("max_depth", None),
                random_state=self.config.get("random_state", 42)
            )
        # Add other model types as needed
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    async def train(
        self, 
        features: pd.DataFrame, 
        targets: pd.Series,
        hyperparameters: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Train the scikit-learn model"""
        try:
            # Update hyperparameters if provided
            if hyperparameters:
                self.model.set_params(**hyperparameters)
            
            # Store feature and target column names
            self.feature_columns = features.columns.tolist()
            self.target_column = targets.name if hasattr(targets, 'name') else "target"
            
            # Train the model
            self.model.fit(features, targets)
            self.is_trained = True
            
            # Calculate training metrics
            train_predictions = self.model.predict(features)
            train_mse = mean_squared_error(targets, train_predictions)
            train_r2 = r2_score(targets, train_predictions)
            
            return {
                "success": True,
                "train_mse": train_mse,
                "train_r2": train_r2,
                "feature_importance": dict(zip(self.feature_columns, self.model.feature_importances_))
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def predict(self, features: pd.DataFrame) -> np.ndarray:
        """Make predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        return self.model.predict(features)
    
    async def evaluate(
        self, 
        features: pd.DataFrame, 
        targets: pd.Series
    ) -> Dict[str, float]:
        """Evaluate model performance"""
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
        
        predictions = await self.predict(features)
        
        return {
            "mse": mean_squared_error(targets, predictions),
            "rmse": np.sqrt(mean_squared_error(targets, predictions)),
            "r2": r2_score(targets, predictions),
            "mae": np.mean(np.abs(targets - predictions))
        }
    
    async def save_model(self, path: str) -> bool:
        """Save model to disk"""
        try:
            model_data = {
                "model": self.model,
                "feature_columns": self.feature_columns,
                "target_column": self.target_column,
                "is_trained": self.is_trained,
                "config": self.config
            }
            joblib.dump(model_data, path)
            return True
        except Exception as e:
            print(f"Error saving model: {e}")
            return False
    
    async def load_model(self, path: str) -> bool:
        """Load model from disk"""
        try:
            model_data = joblib.load(path)
            self.model = model_data["model"]
            self.feature_columns = model_data["feature_columns"]
            self.target_column = model_data["target_column"]
            self.is_trained = model_data["is_trained"]
            self.config = model_data["config"]
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
```

---

## ⚡ **Execution Engine System**

### **1. Base Execution Interface**
```python
# execution_engine/base_executor.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

@dataclass
class Order:
    """Universal order format"""
    symbol: str
    side: str  # "buy" or "sell"
    quantity: float
    order_type: str  # "market", "limit", "stop"
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "day"
    order_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime = None

@dataclass
class Position:
    """Universal position format"""
    symbol: str
    quantity: float
    average_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float
    last_updated: datetime

class BaseExecutor(ABC):
    """Universal execution interface"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.connection_status = "disconnected"
        self.positions = {}
        self.orders = {}
        
    @abstractmethod
    async def connect(self) -> bool:
        """Connect to trading venue"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from trading venue"""
        pass
    
    @abstractmethod
    async def place_order(self, order: Order) -> Dict[str, Any]:
        """Place an order"""
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order"""
        pass
    
    @abstractmethod
    async def get_positions(self) -> Dict[str, Position]:
        """Get current positions"""
        pass
    
    @abstractmethod
    async def get_account_info(self) -> Dict[str, Any]:
        """Get account information"""
        pass
    
    def get_connection_status(self) -> str:
        """Get connection status"""
        return self.connection_status
    
    def get_supported_symbols(self) -> List[str]:
        """Get supported symbols"""
        return self.config.get("supported_symbols", [])
```

### **2. Paper Trading Executor Example**
```python
# execution_engine/executors/paper_trading.py
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any
from ..base_executor import BaseExecutor, Order, Position

class PaperTradingExecutor(BaseExecutor):
    """Paper trading executor for simulation"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.account_balance = config.get("initial_balance", 100000.0)
        self.positions = {}
        self.order_history = []
        self.current_prices = {}
        
    async def connect(self) -> bool:
        """Connect to paper trading system"""
        self.connection_status = "connected"
        return True
    
    async def disconnect(self) -> bool:
        """Disconnect from paper trading system"""
        self.connection_status = "disconnected"
        return True
    
    async def place_order(self, order: Order) -> Dict[str, Any]:
        """Place a paper trading order"""
        try:
            # Generate order ID
            order.order_id = str(uuid.uuid4())
            order.created_at = datetime.now()
            
            # Simulate order execution
            if order.order_type == "market":
                # Execute immediately at current price
                execution_price = self.current_prices.get(order.symbol, 100.0)  # Default price
                order.status = "filled"
                
                # Update positions
                await self._update_position(order.symbol, order.side, order.quantity, execution_price)
                
            elif order.order_type == "limit":
                # Check if limit order can be filled
                current_price = self.current_prices.get(order.symbol, 100.0)
                if (order.side == "buy" and current_price <= order.price) or \
                   (order.side == "sell" and current_price >= order.price):
                    order.status = "filled"
                    await self._update_position(order.symbol, order.side, order.quantity, order.price)
                else:
                    order.status = "pending"
            
            # Store order
            self.orders[order.order_id] = order
            self.order_history.append(order)
            
            return {
                "success": True,
                "order_id": order.order_id,
                "status": order.status,
                "filled_price": execution_price if order.status == "filled" else None
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel a paper trading order"""
        if order_id in self.orders:
            self.orders[order_id].status = "cancelled"
            return True
        return False
    
    async def get_positions(self) -> Dict[str, Position]:
        """Get current paper trading positions"""
        return self.positions
    
    async def get_account_info(self) -> Dict[str, Any]:
        """Get paper trading account information"""
        total_value = self.account_balance
        
        # Calculate total position value
        for symbol, position in self.positions.items():
            total_value += position.quantity * position.current_price
        
        return {
            "account_balance": self.account_balance,
            "total_value": total_value,
            "unrealized_pnl": sum(pos.unrealized_pnl for pos in self.positions.values()),
            "realized_pnl": sum(pos.realized_pnl for pos in self.positions.values()),
            "positions_count": len(self.positions)
        }
    
    async def _update_position(self, symbol: str, side: str, quantity: float, price: float):
        """Update position after order execution"""
        if symbol not in self.positions:
            self.positions[symbol] = Position(
                symbol=symbol,
                quantity=0,
                average_price=0,
                current_price=price,
                unrealized_pnl=0,
                realized_pnl=0,
                last_updated=datetime.now()
            )
        
        position = self.positions[symbol]
        
        if side == "buy":
            # Calculate new average price
            total_cost = position.quantity * position.average_price + quantity * price
            position.quantity += quantity
            position.average_price = total_cost / position.quantity if position.quantity > 0 else 0
            
            # Update account balance
            self.account_balance -= quantity * price
            
        elif side == "sell":
            # Calculate realized P&L
            if position.quantity > 0:
                realized_pnl = (price - position.average_price) * min(quantity, position.quantity)
                position.realized_pnl += realized_pnl
                self.account_balance += realized_pnl
            
            position.quantity -= quantity
            if position.quantity <= 0:
                position.quantity = 0
                position.average_price = 0
            
            # Update account balance
            self.account_balance += quantity * price
        
        position.current_price = price
        position.last_updated = datetime.now()
        position.unrealized_pnl = (position.current_price - position.average_price) * position.quantity
```

---

## 🔄 **Modular System Integration**

### **1. System Orchestrator**
```python
# system_orchestrator.py
import asyncio
from typing import Dict, List, Any
from data_connectors.base_connector import BaseDataConnector
from ml_engine.base_ml_engine import BaseMLEngine
from execution_engine.base_executor import BaseExecutor
from data_storage.universal_storage import UniversalDataStorage

class ModularSystemOrchestrator:
    """Orchestrates the entire modular system"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.data_connectors = {}
        self.ml_engines = {}
        self.executors = {}
        self.data_storage = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize the entire system"""
        print("🚀 Initializing Modular Trading System...")
        
        # Initialize data storage
        self.data_storage = UniversalDataStorage(self.config.get("storage", {}))
        await self.data_storage.initialize()
        
        # Initialize data connectors
        await self._initialize_data_connectors()
        
        # Initialize ML engines
        await self._initialize_ml_engines()
        
        # Initialize executors
        await self._initialize_executors()
        
        print("✅ Modular Trading System initialized!")
    
    async def _initialize_data_connectors(self):
        """Initialize all data connectors"""
        connector_configs = self.config.get("data_connectors", {})
        
        for name, config in connector_configs.items():
            try:
                # Dynamically import connector class
                connector_class = self._import_connector_class(config["type"])
                connector = connector_class(config)
                
                # Connect to data source
                if await connector.connect():
                    self.data_connectors[name] = connector
                    print(f"✅ Connected to {name}")
                else:
                    print(f"❌ Failed to connect to {name}")
                    
            except Exception as e:
                print(f"❌ Error initializing {name}: {e}")
    
    async def _initialize_ml_engines(self):
        """Initialize all ML engines"""
        engine_configs = self.config.get("ml_engines", {})
        
        for name, config in engine_configs.items():
            try:
                # Dynamically import ML engine class
                engine_class = self._import_ml_engine_class(config["type"])
                engine = engine_class(config)
                
                self.ml_engines[name] = engine
                print(f"✅ Initialized ML engine: {name}")
                
            except Exception as e:
                print(f"❌ Error initializing ML engine {name}: {e}")
    
    async def _initialize_executors(self):
        """Initialize all executors"""
        executor_configs = self.config.get("executors", {})
        
        for name, config in executor_configs.items():
            try:
                # Dynamically import executor class
                executor_class = self._import_executor_class(config["type"])
                executor = executor_class(config)
                
                # Connect to trading venue
                if await executor.connect():
                    self.executors[name] = executor
                    print(f"✅ Connected to {name}")
                else:
                    print(f"❌ Failed to connect to {name}")
                    
            except Exception as e:
                print(f"❌ Error initializing {name}: {e}")
    
    def _import_connector_class(self, connector_type: str):
        """Dynamically import connector class"""
        if connector_type == "databento":
            from data_connectors.market_data.databento_connector import DatabentoConnector
            return DatabentoConnector
        elif connector_type == "alpaca":
            from data_connectors.market_data.alpaca_connector import AlpacaConnector
            return AlpacaConnector
        # Add more connector types
        else:
            raise ValueError(f"Unknown connector type: {connector_type}")
    
    def _import_ml_engine_class(self, engine_type: str):
        """Dynamically import ML engine class"""
        if engine_type == "sklearn":
            from ml_engine.engines.sklearn_engine import SklearnEngine
            return SklearnEngine
        elif engine_type == "tensorflow":
            from ml_engine.engines.tensorflow_engine import TensorFlowEngine
            return TensorFlowEngine
        # Add more engine types
        else:
            raise ValueError(f"Unknown ML engine type: {engine_type}")
    
    def _import_executor_class(self, executor_type: str):
        """Dynamically import executor class"""
        if executor_type == "paper_trading":
            from execution_engine.executors.paper_trading import PaperTradingExecutor
            return PaperTradingExecutor
        elif executor_type == "alpaca":
            from execution_engine.executors.alpaca_executor import AlpacaExecutor
            return AlpacaExecutor
        # Add more executor types
        else:
            raise ValueError(f"Unknown executor type: {executor_type}")
    
    async def run_trading_system(self):
        """Run the complete trading system"""
        self.is_running = True
        print("🚀 Starting Modular Trading System...")
        
        try:
            # Start real-time data collection
            await self._start_data_collection()
            
            # Start ML prediction service
            await self._start_ml_predictions()
            
            # Start execution service
            await self._start_execution_service()
            
            # Keep system running
            while self.is_running:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Modular Trading System...")
            await self.shutdown()
    
    async def shutdown(self):
        """Shutdown the system"""
        self.is_running = False
        
        # Disconnect all connectors
        for name, connector in self.data_connectors.items():
            await connector.disconnect()
        
        # Disconnect all executors
        for name, executor in self.executors.items():
            await executor.disconnect()
        
        print("✅ Modular Trading System shutdown complete!")
```

---

## 🎯 **Configuration System**

### **1. Modular Configuration**
```python
# config/modular_config.yaml
system:
  name: "Nexural Modular Trading System"
  version: "1.0.0"
  environment: "development"

data_connectors:
  databento:
    type: "databento"
    api_key: "${DATABENTO_API_KEY}"
    supported_symbols: ["ES", "NQ", "YM", "RTY"]
    data_quality_score: 0.95
    
  alpaca:
    type: "alpaca"
    api_key: "${ALPACA_API_KEY}"
    secret_key: "${ALPACA_SECRET_KEY}"
    supported_symbols: ["AAPL", "GOOGL", "MSFT", "TSLA"]
    data_quality_score: 0.90
    
  yahoo_finance:
    type: "yahoo_finance"
    supported_symbols: ["^GSPC", "^VIX", "^TNX"]
    data_quality_score: 0.85

ml_engines:
  sklearn_engine:
    type: "sklearn"
    model_type: "random_forest"
    n_estimators: 100
    max_depth: 10
    
  tensorflow_engine:
    type: "tensorflow"
    model_type: "lstm"
    layers: [64, 32, 16]
    dropout: 0.2
    
  ensemble_engine:
    type: "ensemble"
    engines: ["sklearn_engine", "tensorflow_engine"]
    weights: [0.6, 0.4]

executors:
  paper_trading:
    type: "paper_trading"
    initial_balance: 100000.0
    supported_symbols: ["ES", "NQ", "AAPL", "GOOGL"]
    
  alpaca_trading:
    type: "alpaca"
    api_key: "${ALPACA_API_KEY}"
    secret_key: "${ALPACA_SECRET_KEY}"
    paper_trading: true
    supported_symbols: ["AAPL", "GOOGL", "MSFT"]

storage:
  time_series_db: "sqlite:///market_data.db"
  cache_db: "redis://localhost:6379/0"
  document_db: "sqlite:///documents.db"

trading_strategy:
  name: "modular_strategy"
  symbols: ["ES", "NQ"]
  timeframe: "1h"
  ml_engine: "ensemble_engine"
  executor: "paper_trading"
  risk_management:
    max_position_size: 0.1
    stop_loss: 0.02
    take_profit: 0.04
```

---

## 🚀 **What You're Missing (Complete the System)**

### **1. Real-Time Data Pipeline**
- **WebSocket connections** for live data
- **Data normalization** across sources
- **Quality checks** and validation
- **Latency monitoring**

### **2. Advanced ML Pipeline**
- **Feature engineering** pipeline
- **Model versioning** and A/B testing
- **Hyperparameter optimization**
- **Model performance monitoring**

### **3. Risk Management System**
- **Position sizing** algorithms
- **Portfolio risk** calculations
- **Drawdown protection**
- **Correlation analysis**

### **4. Backtesting Framework**
- **Historical simulation** engine
- **Performance analytics**
- **Strategy comparison**
- **Walk-forward analysis**

### **5. Monitoring & Alerting**
- **System health** monitoring
- **Performance metrics** tracking
- **Error handling** and recovery
- **Real-time alerts**

### **6. API Gateway**
- **REST API** for external access
- **WebSocket API** for real-time data
- **Authentication** and authorization
- **Rate limiting**

### **7. Deployment System**
- **Docker containers** for portability
- **Kubernetes** orchestration
- **CI/CD pipeline**
- **Environment management**

---

## 🎉 **Result: Universal Trading Hub**

**With this modular architecture, you get:**
- **🔌 Plug-and-Play Components** - Connect any data source, ML engine, or trading venue
- **🔄 Hot-Swappable Systems** - Change ML engines or data sources without downtime
- **💾 Universal Data Format** - Handle any data type from any source
- **🌐 Multi-Venue Execution** - Trade on any exchange or broker
- **⚡ Real-Time Processing** - Live data and execution
- **🛡️ Risk Management** - Built-in protection and monitoring
- **📊 Complete Analytics** - Performance tracking and optimization

**This becomes your central hub for connecting everything and testing everything!** 🚀

The system is designed to be completely modular and portable, so you can easily add new data sources, ML technologies, or trading venues by simply creating new connector modules.
