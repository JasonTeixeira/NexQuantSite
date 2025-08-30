# API Reference

## 📚 **Complete API Documentation**

Welcome to the Ultimate Backtesting Engine API reference. This documentation covers all public APIs, classes, and methods available in the system.

---

## 🏗️ **API Structure**

The API is organized into the following modules:

| Module | Description | Key Classes |
|--------|-------------|-------------|
| **[Core Engine](core_engine.md)** | Main backtesting functionality | `UltimateBacktestEngine`, `BacktestConfig` |
| **[Data Connectors](data_connectors.md)** | Data source integrations | `DatabentoConnector`, `NinjaTraderConnector` |
| **[Strategies](strategies.md)** | Strategy development framework | `BaseStrategy`, `MicrostructureStrategy` |
| **[Testing Framework](testing.md)** | Testing and validation tools | `WalkForwardAnalyzer`, `MonteCarloSimulator` |
| **[Analysis Tools](analysis.md)** | Metrics and reporting | `AIAssistant`, `ReportGenerator` |
| **[Security](security.md)** | Security and configuration | `SecurityManager`, `ConfigManager` |
| **[Monitoring](monitoring.md)** | System monitoring | `MetricsCollector`, `HealthChecker` |

---

## 🚀 **Quick Start Example**

```python
from core.backtest_engine import UltimateBacktestEngine
from strategies.example_strategies import MicrostructureStrategy

# Initialize the engine
engine = UltimateBacktestEngine('config/config.yaml')

# Load data
data = engine.load_and_prepare_data('ES', '2023-01-01', '2023-12-31')

# Create strategy
strategy = MicrostructureStrategy()

# Run backtest
results = engine.run_backtest(strategy, data)

# Print results
print(f"Total Return: {results['metrics']['total_return']:.2%}")
print(f"Sharpe Ratio: {results['metrics']['sharpe_ratio']:.2f}")
```

---

## 📖 **API Conventions**

### **Method Naming**
- **Public methods**: `snake_case` (e.g., `run_backtest`)
- **Private methods**: `_snake_case` (e.g., `_calculate_metrics`)
- **Class methods**: `@classmethod` for alternative constructors
- **Static methods**: `@staticmethod` for utility functions

### **Parameter Types**
- **Type hints**: All public methods use type hints
- **Optional parameters**: Use `Optional[Type]` or `Type = None`
- **Complex types**: Use `Union`, `Dict`, `List` from `typing`

### **Return Values**
- **Success**: Return expected data type
- **Errors**: Raise appropriate exceptions
- **Optional results**: Return `None` or `Optional[Type]`

### **Exception Handling**
- **Custom exceptions**: Use domain-specific exceptions
- **Error context**: Include relevant error information
- **Recovery**: Attempt automatic recovery when possible

---

## 🔍 **Core API Classes**

### **UltimateBacktestEngine**

The main backtesting engine class that orchestrates all operations.

```python
class UltimateBacktestEngine:
    """
    The complete backtesting engine with all integrations
    """
    
    def __init__(self, config_path: str = 'config/config.yaml'):
        """Initialize the backtesting engine"""
        
    def load_and_prepare_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Load and prepare market data for backtesting"""
        
    def run_backtest(self, strategy: BaseStrategy, data: pd.DataFrame) -> Dict:
        """Run a complete backtest with the given strategy"""
```

### **BaseStrategy**

Abstract base class for all trading strategies.

```python
class BaseStrategy(ABC):
    """Abstract base class for all strategies"""
    
    @abstractmethod
    def get_default_parameters(self) -> Dict:
        """Get default parameters for the strategy"""
        
    @abstractmethod
    def generate_signal(self, features: Dict) -> float:
        """Generate trading signal (-1 to 1)"""
        
    def update_parameters(self, params: Dict):
        """Update strategy parameters"""
```

### **DataValidator**

Comprehensive data validation and quality control.

```python
class DataValidator:
    """Comprehensive data validation and quality control"""
    
    def __init__(self, strict_mode: bool = False):
        """Initialize data validator"""
        
    def validate_price_data(self, df: pd.DataFrame, symbol: str = None) -> ValidationResult:
        """Validate OHLCV price data"""
        
    def validate_orderbook_data(self, df: pd.DataFrame, symbol: str = None) -> ValidationResult:
        """Validate order book (MBP-10) data"""
```

---

## 🛡️ **Security API**

### **SecurityManager**

Handles secure configuration and API key management.

```python
class SecurityManager:
    """Handles secure configuration, API key management, and encryption"""
    
    def get_api_key(self, service: str) -> Optional[str]:
        """Securely retrieve API key for a service"""
        
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
```

### **AuditLogger**

Comprehensive audit logging for compliance.

```python
class AuditLogger:
    """Audit logging for compliance and security monitoring"""
    
    def log_api_access(self, service: str, action: str, success: bool, details: str = None):
        """Log API access attempts"""
        
    def log_backtest_execution(self, strategy: str, symbol: str, parameters: Dict, results: Dict):
        """Log backtest execution for audit trail"""
```

---

## 📊 **Monitoring API**

### **MetricsCollector**

Collects and stores system and application metrics.

```python
class MetricsCollector:
    """Collects and stores system and application metrics"""
    
    def record_metric(self, name: str, value: float, timestamp: datetime = None, labels: Dict[str, str] = None):
        """Record a metric value"""
        
    def get_metric_summary(self, name: str, hours_back: int = 1) -> Dict[str, float]:
        """Get summary statistics for a metric"""
```

### **HealthChecker**

System health monitoring and checks.

```python
class HealthChecker:
    """System health monitoring and checks"""
    
    def run_all_checks(self) -> Dict[str, bool]:
        """Run all health checks"""
        
    def is_healthy(self) -> bool:
        """Check if system is overall healthy"""
```

---

## 🚀 **Performance API**

### **PerformanceOptimizer**

Performance optimization utilities and vectorized operations.

```python
class PerformanceOptimizer:
    """Performance optimization utilities and vectorized operations"""
    
    def optimize_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Optimize DataFrame memory usage"""
        
    def check_system_resources(self) -> Dict[str, Any]:
        """Check current system resource usage"""
```

### **ParallelBacktester**

Parallel backtesting engine for multiple strategies or parameter sets.

```python
class ParallelBacktester:
    """Parallel backtesting engine for multiple strategies or parameter sets"""
    
    def run_parallel_backtests(self, backtest_func: Callable, parameter_sets: List[Dict],
                             data: pd.DataFrame, strategy_class: type) -> List[Dict]:
        """Run multiple backtests in parallel"""
```

---

## 🔧 **Configuration API**

### **ConfigManager**

Environment-specific configuration management.

```python
class ConfigManager:
    """Comprehensive configuration management with environment support"""
    
    def load_config(self, base_config: str = "config.yaml", validate: bool = True) -> Dict[str, Any]:
        """Load configuration with environment-specific overrides"""
        
    def get_value(self, key_path: str, default: Any = None) -> Any:
        """Get configuration value using dot notation"""
```

---

## 🎯 **Testing API**

### **WalkForwardAnalyzer**

Walk-forward analysis for strategy optimization and robustness testing.

```python
class WalkForwardAnalyzer:
    """Walk-forward analysis for strategy optimization and robustness testing"""
    
    def run_analysis(self, engine: 'UltimateBacktestEngine', strategy: BaseStrategy, 
                    data: pd.DataFrame) -> Dict[str, Any]:
        """Run complete walk-forward analysis"""
```

### **MonteCarloSimulator**

Monte Carlo simulation capabilities to assess strategy robustness.

```python
class MonteCarloSimulator:
    """Monte Carlo simulation capabilities to assess strategy robustness"""
    
    def run_simulation(self, engine: 'UltimateBacktestEngine', strategy: BaseStrategy,
                      data: pd.DataFrame) -> Dict[str, Any]:
        """Run Monte Carlo simulation"""
```

---

## 🤖 **AI Integration API**

### **AIAssistant**

AI-powered analysis using Claude.

```python
class AIAssistant:
    """AI-powered analysis using Claude"""
    
    def analyze_backtest_results(self, results: Dict, strategy_params: Dict = None) -> str:
        """Analyze backtest results and provide insights"""
        
    def get_strategy_optimization_advice(self, results: Dict, strategy: BaseStrategy) -> str:
        """Get optimization advice for strategy parameters"""
```

---

## 📈 **Data Connector APIs**

### **DatabentoConnector**

Databento MBP-10 data integration.

```python
class DatabentoConnector:
    """Connect to Databento and load MBP-10 data"""
    
    def load_mbp10_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Load MBP-10 data for a symbol"""
```

### **NinjaTraderConnector**

NinjaTrader execution data integration.

```python
class NinjaTraderConnector:
    """Connect to NinjaTrader for real execution data"""
    
    def get_calibration_data(self, start_date: str, end_date: str) -> Dict:
        """Get execution calibration data from NinjaTrader"""
```

---

## ⚡ **Vectorized Functions**

High-performance vectorized calculations using Numba.

```python
@njit
def calculate_returns_vectorized(prices: np.ndarray) -> np.ndarray:
    """Calculate returns using vectorized operations"""

@njit
def calculate_sharpe_ratio_vectorized(returns: np.ndarray, risk_free_rate: float = 0.02) -> float:
    """Calculate Sharpe ratio using vectorized operations"""

@njit
def calculate_max_drawdown_vectorized(equity_curve: np.ndarray) -> Tuple[float, int, int]:
    """Calculate maximum drawdown using vectorized operations"""
```

---

## 🔍 **Error Handling**

### **Custom Exceptions**

Domain-specific exceptions for better error handling.

```python
class BacktestException(Exception):
    """Base exception for backtesting system"""

class DataQualityException(BacktestException):
    """Exception for data quality issues"""

class APIException(BacktestException):
    """Exception for API-related errors"""

class CalculationException(BacktestException):
    """Exception for calculation errors"""
```

### **Error Handler**

Centralized error handling and logging system.

```python
class ErrorHandler:
    """Centralized error handling and logging system"""
    
    def handle_exception(self, exception: Exception, context: ErrorContext = None,
                        attempt_recovery: bool = True) -> Optional[ErrorReport]:
        """Handle and log exceptions with comprehensive error reporting"""
```

---

## 📝 **Usage Examples**

For detailed usage examples and tutorials, see:
- [Getting Started Guide](../user_guides/getting_started.md)
- [Strategy Development](../user_guides/strategy_development.md)
- [Code Examples](../user_guides/examples.md)

---

## 🆘 **Support**

For API support and questions:
- 📧 Email: api-support@backtesting-engine.com
- 📚 Documentation: [docs.backtesting-engine.com](https://docs.backtesting-engine.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

*API Reference last updated: January 2024*