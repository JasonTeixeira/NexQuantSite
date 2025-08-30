# 🎯 NinjaTrader Integration Guide

**Complete Integration with Your Modular Trading System**

---

## 🎯 **Why NinjaTrader?**

### **✅ Advantages:**
- **Advanced Charting** - Professional-grade charts
- **Strategy Development** - Built-in strategy builder
- **Futures Trading** - Access to futures markets
- **Options Trading** - Advanced options capabilities
- **Real-Time Data** - Live market data
- **Automation** - Strategy automation
- **Backtesting** - Built-in backtesting (but your system is better!)

### **❌ Limitations:**
- **Windows Only** - No Mac/Linux support
- **Learning Curve** - Complex interface
- **API Limitations** - Some restrictions on external connections

---

## 🔌 **Integration Architecture**

### **1. NinjaTrader Connector**
```python
# execution_engine/executors/ninjatrader_executor.py
import asyncio
from typing import Dict, Any, List
from ..base_executor import BaseExecutor, Order, Position

class NinjaTraderExecutor(BaseExecutor):
    """NinjaTrader execution connector"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.connection_string = config.get("connection_string")
        self.account_name = config.get("account_name")
        self.connection = None
        
    async def connect(self) -> bool:
        """Connect to NinjaTrader"""
        try:
            # Use NinjaTrader's API or COM interface
            # Implementation depends on NinjaTrader version
            self.connection = await self._establish_connection()
            self.connection_status = "connected"
            return True
        except Exception as e:
            print(f"NinjaTrader connection failed: {e}")
            return False
    
    async def place_order(self, order: Order) -> Dict[str, Any]:
        """Place order through NinjaTrader"""
        try:
            # Convert universal order to NinjaTrader format
            nt_order = self._convert_order_format(order)
            
            # Send order through NinjaTrader API
            result = await self._send_order(nt_order)
            
            return {
                "success": True,
                "order_id": result.get("order_id"),
                "status": result.get("status"),
                "filled_price": result.get("filled_price")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_positions(self) -> Dict[str, Position]:
        """Get current positions from NinjaTrader"""
        try:
            positions = await self._get_nt_positions()
            return self._convert_positions_format(positions)
        except Exception as e:
            print(f"Error getting positions: {e}")
            return {}
    
    async def get_account_info(self) -> Dict[str, Any]:
        """Get account information from NinjaTrader"""
        try:
            account_info = await self._get_nt_account_info()
            return self._convert_account_format(account_info)
        except Exception as e:
            print(f"Error getting account info: {e}")
            return {}
```

### **2. Configuration**
```yaml
# config/brokers.yaml
executors:
  ninjatrader:
    type: "ninjatrader"
    connection_string: "localhost:36973"  # Default NinjaTrader port
    account_name: "Sim101"  # Paper trading account
    supported_symbols: ["ES", "NQ", "YM", "RTY", "AAPL", "GOOGL"]
    paper_trading: true
    
  ninjatrader_live:
    type: "ninjatrader"
    connection_string: "localhost:36973"
    account_name: "LiveAccount"
    supported_symbols: ["ES", "NQ", "YM", "RTY"]
    paper_trading: false
```

---

## 🚀 **Implementation Steps**

### **Step 1: NinjaTrader Setup**
```bash
# 1. Install NinjaTrader
# Download from: https://ninjatrader.com/

# 2. Enable API connections
# Tools -> Options -> General -> Enable API connections

# 3. Create paper trading account
# File -> New -> Simulation Account

# 4. Test connection
# Tools -> Options -> General -> Test Connection
```

### **Step 2: Create Connector**
```python
# Create the NinjaTrader executor
# execution_engine/executors/ninjatrader_executor.py
# (Use the code above)
```

### **Step 3: Test Integration**
```python
# test_ninjatrader.py
import asyncio
from execution_engine.executors.ninjatrader_executor import NinjaTraderExecutor
from execution_engine.base_executor import Order

async def test_ninjatrader():
    config = {
        "connection_string": "localhost:36973",
        "account_name": "Sim101",
        "supported_symbols": ["ES", "NQ"]
    }
    
    executor = NinjaTraderExecutor(config)
    
    # Connect
    if await executor.connect():
        print("✅ Connected to NinjaTrader")
        
        # Get account info
        account_info = await executor.get_account_info()
        print(f"Account info: {account_info}")
        
        # Place test order (paper trading)
        test_order = Order(
            symbol="ES",
            side="buy",
            quantity=1,
            order_type="market"
        )
        
        result = await executor.place_order(test_order)
        print(f"Order result: {result}")
    else:
        print("❌ Failed to connect to NinjaTrader")

if __name__ == "__main__":
    asyncio.run(test_ninjatrader())
```

---

## 🔧 **Advanced Features**

### **1. Real-Time Data Integration**
```python
# data_connectors/market_data/ninjatrader_connector.py
class NinjaTraderDataConnector(BaseDataConnector):
    """NinjaTrader real-time data connector"""
    
    async def subscribe_to_stream(self, symbols: List[str], callback: callable) -> bool:
        """Subscribe to real-time data from NinjaTrader"""
        try:
            # Subscribe to NinjaTrader data feed
            for symbol in symbols:
                await self._subscribe_symbol(symbol, callback)
            return True
        except Exception as e:
            print(f"Error subscribing to data: {e}")
            return False
```

### **2. Strategy Integration**
```python
# strategies/ninjatrader_strategy.py
class NinjaTraderStrategy(BaseStrategy):
    """Strategy that runs on NinjaTrader"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.ninjatrader_executor = None
        
    async def initialize(self):
        """Initialize NinjaTrader connection"""
        self.ninjatrader_executor = NinjaTraderExecutor(self.config)
        await self.ninjatrader_executor.connect()
    
    async def execute_signal(self, signal: Dict[str, Any]):
        """Execute trading signal through NinjaTrader"""
        order = self._create_order_from_signal(signal)
        result = await self.ninjatrader_executor.place_order(order)
        return result
```

---

## 🎯 **Other Broker Integrations**

### **Easy to Add (Similar Pattern):**

#### **Alpaca (Recommended for Start)**
```python
# execution_engine/executors/alpaca_executor.py
class AlpacaExecutor(BaseExecutor):
    """Alpaca execution connector"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.secret_key = config.get("secret_key")
        self.api = None
```

#### **Interactive Brokers**
```python
# execution_engine/executors/interactive_brokers.py
class InteractiveBrokersExecutor(BaseExecutor):
    """Interactive Brokers execution connector"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.port = config.get("port", 7497)  # TWS port
        self.client_id = config.get("client_id", 1)
```

#### **Binance (Crypto)**
```python
# execution_engine/executors/binance_executor.py
class BinanceExecutor(BaseExecutor):
    """Binance execution connector"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.secret_key = config.get("secret_key")
        self.testnet = config.get("testnet", True)
```

---

## 🚀 **Quick Start Commands**

### **1. Test NinjaTrader Connection:**
```bash
# Test basic connection
python test_ninjatrader.py

# Test with your existing system
python -m pytest tests/test_ninjatrader.py -v
```

### **2. Add Other Brokers:**
```bash
# Add Alpaca (easiest)
python execution_engine/executors/alpaca_executor.py

# Add Interactive Brokers
python execution_engine/executors/interactive_brokers.py

# Add Binance
python execution_engine/executors/binance_executor.py
```

### **3. Run Multi-Broker System:**
```python
# main.py
async def main():
    # Initialize multiple brokers
    brokers = {
        "ninjatrader": NinjaTraderExecutor(ninjatrader_config),
        "alpaca": AlpacaExecutor(alpaca_config),
        "binance": BinanceExecutor(binance_config)
    }
    
    # Connect to all brokers
    for name, broker in brokers.items():
        if await broker.connect():
            print(f"✅ Connected to {name}")
        else:
            print(f"❌ Failed to connect to {name}")
```

---

## 🎉 **Result: Unlimited Broker Connectivity**

**With your modular system, you can connect to:**

### **✅ Immediate (Easy to Add):**
1. **NinjaTrader** ⭐ (Your priority)
2. **Alpaca** (Free, easy)
3. **Interactive Brokers** (Professional)
4. **TD Ameritrade** (Popular)
5. **Binance** (Crypto)

### **✅ Medium Effort:**
6. **E*TRADE**
7. **Fidelity**
8. **Charles Schwab**
9. **Robinhood**
10. **Webull**

### **✅ Advanced (Any Broker with API):**
- **Any broker with REST API**
- **Any broker with WebSocket API**
- **Any broker with FIX protocol**
- **Any exchange worldwide**
- **Any crypto exchange**

**Your system is designed to be the ultimate broker hub!** 🚀

**Start with NinjaTrader (your priority), then add others as needed. The modular architecture makes it easy to add new brokers without changing your core system.**
