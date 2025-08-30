# Development Guide

## Getting Started

### Prerequisites
- Python 3.9+
- Git
- Docker (optional)
- Make (optional, for using Makefile commands)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nexural/backtesting.git
   cd backtesting
   ```

2. **Install development dependencies**
   ```bash
   make install-dev
   # or manually:
   pip install -e ".[dev,test,docs]"
   pre-commit install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run initial tests**
   ```bash
   make test
   ```

## Development Workflow

### 1. Code Quality Standards

#### Code Formatting
- **Black**: Automatic code formatting
- **isort**: Import sorting
- **Line length**: 88 characters

```bash
make format  # Format all code
make quick-lint  # Check formatting without changing files
```

#### Type Checking
- **MyPy**: Static type checking
- **Strict mode**: Enabled for all new code

```bash
make type-check
```

#### Linting
- **Flake8**: Style guide enforcement
- **Bandit**: Security linting

```bash
make lint
make security-check
```

### 2. Testing Strategy

#### Test Categories
- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test component interactions
- **Performance Tests**: Test system performance
- **End-to-End Tests**: Test complete workflows

#### Running Tests
```bash
make test                    # Run all tests
make unit-test              # Run unit tests only
make integration-test       # Run integration tests only
make perf-test              # Run performance tests only
make test-coverage          # Run tests with coverage report
```

#### Test Markers
```python
import pytest

@pytest.mark.unit
def test_unit_function():
    pass

@pytest.mark.integration
def test_integration():
    pass

@pytest.mark.performance
def test_performance():
    pass

@pytest.mark.slow
def test_slow_operation():
    pass
```

### 3. Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

```bash
pre-commit install  # Install hooks
pre-commit run --all-files  # Run all hooks
```

Hooks include:
- Code formatting (Black, isort)
- Linting (Flake8, Bandit)
- Type checking (MyPy)
- Security scanning (Safety)
- Test execution

### 4. Git Workflow

#### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

#### Commit Messages
Follow conventional commits:
```
type(scope): description

feat(api): add new trading endpoint
fix(data): resolve data validation issue
docs(readme): update installation instructions
refactor(engine): simplify backtest logic
test(ml): add unit tests for ML models
```

#### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Run quality checks: `make ci-check`
4. Create pull request
5. Address review comments
6. Merge after approval

## Architecture Guidelines

### 1. Modular Design

#### Component Interfaces
All components should implement universal interfaces:

```python
from abc import ABC, abstractmethod
from typing import Protocol

class DataConnector(Protocol):
    @abstractmethod
    def get_data(self, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        pass

class MLEngine(Protocol):
    @abstractmethod
    def train(self, data: pd.DataFrame) -> None:
        pass
    
    @abstractmethod
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        pass

class ExecutionEngine(Protocol):
    @abstractmethod
    def execute_order(self, order: Order) -> OrderResult:
        pass
```

#### Configuration Management
Use centralized configuration:

```python
from pydantic import BaseSettings

class Config(BaseSettings):
    database_url: str
    redis_url: str
    api_key: str
    
    class Config:
        env_file = ".env"
```

### 2. Error Handling

#### Exception Hierarchy
```python
class NexuralError(Exception):
    """Base exception for all Nexural errors."""
    pass

class DataError(NexuralError):
    """Data-related errors."""
    pass

class ValidationError(NexuralError):
    """Validation errors."""
    pass

class ExecutionError(NexuralError):
    """Execution errors."""
    pass
```

#### Error Handling Patterns
```python
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def safe_operation(func):
    """Decorator for safe operations with proper error handling."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {e}")
            raise
    return wrapper
```

### 3. Logging

#### Structured Logging
```python
import structlog

logger = structlog.get_logger()

def process_data(data: pd.DataFrame) -> pd.DataFrame:
    logger.info("Processing data", 
                rows=len(data), 
                columns=list(data.columns))
    
    try:
        result = data.copy()
        # Processing logic
        logger.info("Data processing completed", 
                    processed_rows=len(result))
        return result
    except Exception as e:
        logger.error("Data processing failed", 
                     error=str(e), 
                     data_shape=data.shape)
        raise
```

### 4. Testing Patterns

#### Fixtures
```python
import pytest
import pandas as pd

@pytest.fixture
def sample_market_data():
    """Provide sample market data for testing."""
    dates = pd.date_range('2023-01-01', '2023-12-31', freq='D')
    data = pd.DataFrame({
        'open': np.random.randn(len(dates)) + 100,
        'high': np.random.randn(len(dates)) + 102,
        'low': np.random.randn(len(dates)) + 98,
        'close': np.random.randn(len(dates)) + 100,
        'volume': np.random.randint(1000, 10000, len(dates))
    }, index=dates)
    return data

@pytest.fixture
def mock_data_connector():
    """Mock data connector for testing."""
    class MockConnector:
        def get_data(self, symbol, start_date, end_date):
            return sample_market_data()
    return MockConnector()
```

#### Test Organization
```python
class TestBacktestEngine:
    """Test suite for backtest engine."""
    
    def test_simple_backtest(self, sample_market_data):
        """Test simple backtest execution."""
        engine = BacktestEngine()
        result = engine.run(sample_market_data)
        assert result is not None
        assert hasattr(result, 'returns')
    
    def test_backtest_with_risk_management(self, sample_market_data):
        """Test backtest with risk management."""
        engine = BacktestEngine()
        risk_manager = RiskManager(max_drawdown=0.1)
        result = engine.run(sample_market_data, risk_manager=risk_manager)
        assert result.max_drawdown <= 0.1
```

## Performance Guidelines

### 1. Data Processing
- Use vectorized operations with NumPy/Pandas
- Implement lazy loading for large datasets
- Use appropriate data types (float32 vs float64)

### 2. Caching
- Cache expensive computations
- Use Redis for distributed caching
- Implement cache invalidation strategies

### 3. Memory Management
- Use generators for large datasets
- Implement proper cleanup in destructors
- Monitor memory usage in production

## Security Guidelines

### 1. Input Validation
- Validate all external inputs
- Use Pydantic for data validation
- Sanitize user inputs

### 2. Authentication & Authorization
- Implement proper authentication
- Use role-based access control
- Secure API endpoints

### 3. Data Protection
- Encrypt sensitive data
- Use secure communication protocols
- Implement audit logging

## Documentation Standards

### 1. Code Documentation
```python
def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """
    Calculate the Sharpe ratio for a series of returns.
    
    Args:
        returns: Series of returns
        risk_free_rate: Risk-free rate (default: 0.02)
    
    Returns:
        Sharpe ratio as float
    
    Raises:
        ValueError: If returns is empty or contains invalid values
    
    Example:
        >>> returns = pd.Series([0.01, -0.02, 0.03])
        >>> sharpe = calculate_sharpe_ratio(returns)
        >>> print(f"Sharpe ratio: {sharpe:.2f}")
    """
    if returns.empty:
        raise ValueError("Returns series cannot be empty")
    
    excess_returns = returns - risk_free_rate
    return excess_returns.mean() / excess_returns.std()
```

### 2. API Documentation
- Use FastAPI automatic documentation
- Include examples for all endpoints
- Document error responses

### 3. Architecture Documentation
- Document design decisions
- Include sequence diagrams
- Maintain up-to-date README files

## Deployment Guidelines

### 1. Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN pip install -e .

EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Environment Configuration
- Use environment variables for configuration
- Separate development/production configs
- Use secrets management for sensitive data

### 3. Monitoring
- Implement health checks
- Add performance metrics
- Set up alerting

## Troubleshooting

### Common Issues

#### Import Errors
```bash
# Check if package is installed in development mode
pip list | grep nexural

# Reinstall in development mode
pip install -e .
```

#### Test Failures
```bash
# Run tests with verbose output
pytest tests/ -v -s

# Run specific test file
pytest tests/test_specific.py -v

# Run tests with coverage
pytest tests/ --cov=. --cov-report=html
```

#### Pre-commit Failures
```bash
# Run specific hook
pre-commit run black

# Skip hooks for this commit
git commit -m "message" --no-verify
```

### Getting Help
- Check existing documentation
- Search existing issues
- Create detailed bug reports
- Ask in team discussions
