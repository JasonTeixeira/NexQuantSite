# API Reference

## Overview

The Nexural Backtesting API provides a comprehensive REST interface for quantitative trading operations, including backtesting, live trading, data management, and machine learning capabilities.

## Base URL

```
Development: http://localhost:8000
Production: https://api.nexural.com
```

## Authentication

All API endpoints require authentication using API keys or JWT tokens.

### API Key Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### JWT Token Authentication
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### 1. Backtesting

#### Run Backtest
```http
POST /api/v1/backtest/run
```

**Request Body:**
```json
{
  "strategy": {
    "name": "moving_average_crossover",
    "parameters": {
      "short_window": 10,
      "long_window": 30
    }
  },
  "data": {
    "symbol": "AAPL",
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "data_source": "yahoo_finance"
  },
  "backtest_config": {
    "initial_capital": 100000,
    "commission": 0.001,
    "slippage": 0.0005
  },
  "risk_management": {
    "max_position_size": 0.1,
    "stop_loss": 0.05,
    "take_profit": 0.15
  }
}
```

**Response:**
```json
{
  "backtest_id": "bt_123456789",
  "status": "completed",
  "results": {
    "total_return": 0.156,
    "annualized_return": 0.168,
    "sharpe_ratio": 1.45,
    "max_drawdown": -0.08,
    "win_rate": 0.62,
    "total_trades": 45,
    "profit_factor": 1.85
  },
  "equity_curve": [
    {"date": "2023-01-01", "equity": 100000},
    {"date": "2023-01-02", "equity": 100250}
  ],
  "trades": [
    {
      "date": "2023-01-15",
      "symbol": "AAPL",
      "side": "buy",
      "quantity": 100,
      "price": 150.25,
      "pnl": 0
    }
  ]
}
```

#### Get Backtest Results
```http
GET /api/v1/backtest/{backtest_id}
```

#### List Backtests
```http
GET /api/v1/backtest/list?page=1&limit=20&status=completed
```

### 2. Data Management

#### Get Market Data
```http
GET /api/v1/data/market/{symbol}?start_date=2023-01-01&end_date=2023-12-31&interval=1d
```

**Response:**
```json
{
  "symbol": "AAPL",
  "data": [
    {
      "date": "2023-01-01",
      "open": 150.25,
      "high": 152.10,
      "low": 149.80,
      "close": 151.50,
      "volume": 50000000
    }
  ],
  "metadata": {
    "data_source": "yahoo_finance",
    "last_updated": "2023-12-31T23:59:59Z"
  }
}
```

#### Upload Data
```http
POST /api/v1/data/upload
Content-Type: multipart/form-data

{
  "file": "market_data.csv",
  "symbol": "AAPL",
  "data_source": "custom"
}
```

#### Data Quality Check
```http
POST /api/v1/data/quality-check
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31"
}
```

**Response:**
```json
{
  "quality_score": 0.95,
  "issues": [
    {
      "type": "missing_data",
      "date": "2023-07-04",
      "severity": "low",
      "description": "Market holiday - expected"
    }
  ],
  "statistics": {
    "total_records": 252,
    "missing_records": 1,
    "duplicate_records": 0,
    "outliers": 3
  }
}
```

### 3. Strategy Management

#### Create Strategy
```http
POST /api/v1/strategies/create
```

**Request Body:**
```json
{
  "name": "my_custom_strategy",
  "description": "Custom momentum strategy",
  "code": "def generate_signals(data):\n    # Strategy logic\n    return signals",
  "parameters": {
    "lookback_period": {"type": "int", "default": 20, "min": 5, "max": 100},
    "threshold": {"type": "float", "default": 0.02, "min": 0.001, "max": 0.1}
  }
}
```

#### List Strategies
```http
GET /api/v1/strategies/list?category=momentum&page=1&limit=20
```

#### Get Strategy Details
```http
GET /api/v1/strategies/{strategy_id}
```

### 4. Machine Learning

#### Train Model
```http
POST /api/v1/ml/train
```

**Request Body:**
```json
{
  "model_type": "xgboost",
  "task": "classification",
  "features": ["rsi", "macd", "volume_ma"],
  "target": "price_direction",
  "data": {
    "symbol": "AAPL",
    "start_date": "2022-01-01",
    "end_date": "2023-12-31"
  },
  "hyperparameters": {
    "learning_rate": 0.1,
    "max_depth": 6,
    "n_estimators": 100
  }
}
```

#### Get Predictions
```http
POST /api/v1/ml/predict
```

**Request Body:**
```json
{
  "model_id": "ml_123456789",
  "data": {
    "rsi": [65.2, 70.1, 45.8],
    "macd": [0.02, -0.01, 0.05],
    "volume_ma": [50000000, 52000000, 48000000]
  }
}
```

#### Model Performance
```http
GET /api/v1/ml/{model_id}/performance
```

### 5. Live Trading

#### Place Order
```http
POST /api/v1/trading/orders
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "quantity": 100,
  "order_type": "market",
  "time_in_force": "day",
  "strategy_id": "strategy_123"
}
```

#### Get Positions
```http
GET /api/v1/trading/positions
```

#### Get Account Info
```http
GET /api/v1/trading/account
```

### 6. Risk Management

#### Set Risk Limits
```http
POST /api/v1/risk/limits
```

**Request Body:**
```json
{
  "max_position_size": 0.1,
  "max_daily_loss": 0.02,
  "max_drawdown": 0.15,
  "position_limits": {
    "AAPL": 1000,
    "GOOGL": 500
  }
}
```

#### Get Risk Metrics
```http
GET /api/v1/risk/metrics
```

### 7. Monitoring

#### System Status
```http
GET /api/v1/monitoring/status
```

**Response:**
```json
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "data_feeds": "healthy",
    "trading_engine": "healthy"
  },
  "metrics": {
    "cpu_usage": 0.25,
    "memory_usage": 0.45,
    "active_connections": 15
  }
}
```

#### Performance Metrics
```http
GET /api/v1/monitoring/performance?timeframe=1h
```

### 8. Configuration

#### Get Configuration
```http
GET /api/v1/config
```

#### Update Configuration
```http
PUT /api/v1/config
```

**Request Body:**
```json
{
  "data_sources": {
    "yahoo_finance": {"enabled": true},
    "alpha_vantage": {"enabled": false}
  },
  "trading": {
    "paper_trading": true,
    "default_commission": 0.001
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameter value",
    "details": {
      "field": "start_date",
      "issue": "Date must be in YYYY-MM-DD format"
    }
  },
  "timestamp": "2023-12-31T23:59:59Z",
  "request_id": "req_123456789"
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Standard Plan**: 100 requests per minute
- **Professional Plan**: 1000 requests per minute
- **Enterprise Plan**: Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Configure Webhook
```http
POST /api/v1/webhooks/configure
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["backtest_completed", "order_executed", "risk_alert"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events
- `backtest_completed`: Backtest execution finished
- `order_executed`: Order executed in live trading
- `risk_alert`: Risk limit exceeded
- `data_updated`: New market data available

## SDKs and Libraries

### Python SDK
```python
from nexural import NexuralClient

client = NexuralClient(api_key="your_api_key")

# Run backtest
result = client.backtest.run(
    strategy="moving_average_crossover",
    symbol="AAPL",
    start_date="2023-01-01",
    end_date="2023-12-31"
)

# Get market data
data = client.data.get_market_data("AAPL", "2023-01-01", "2023-12-31")
```

### JavaScript SDK
```javascript
const NexuralClient = require('nexural-js');

const client = new NexuralClient('your_api_key');

// Run backtest
const result = await client.backtest.run({
  strategy: 'moving_average_crossover',
  symbol: 'AAPL',
  startDate: '2023-01-01',
  endDate: '2023-12-31'
});
```

## Examples

### Complete Backtesting Workflow
```python
import requests

# 1. Get market data
data_response = requests.get(
    "https://api.nexural.com/api/v1/data/market/AAPL",
    params={
        "start_date": "2023-01-01",
        "end_date": "2023-12-31"
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

# 2. Run backtest
backtest_response = requests.post(
    "https://api.nexural.com/api/v1/backtest/run",
    json={
        "strategy": {
            "name": "momentum_strategy",
            "parameters": {"lookback": 20}
        },
        "data": {
            "symbol": "AAPL",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31"
        }
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

# 3. Get results
results = backtest_response.json()
print(f"Total Return: {results['results']['total_return']:.2%}")
```

### Real-time Data Streaming
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Price update: {data['symbol']} = ${data['price']}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed")

# Connect to real-time data stream
ws = websocket.WebSocketApp(
    "wss://api.nexural.com/ws/market-data",
    on_message=on_message,
    on_error=on_error,
    on_close=on_close
)

ws.run_forever()
```
