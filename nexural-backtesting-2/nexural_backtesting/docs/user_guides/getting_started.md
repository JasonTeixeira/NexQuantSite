# Getting Started Guide

## 🚀 **Welcome to Ultimate Backtesting Engine**

This guide will help you get up and running with the Ultimate Backtesting Engine in minutes.

---

## 📋 **Prerequisites**

### **System Requirements**
- **Python**: 3.8 or higher (3.11+ recommended)
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Memory**: 8GB RAM minimum (16GB+ recommended)
- **Storage**: 10GB free space (100GB+ for production data)

### **Required Skills**
- Basic Python programming
- Understanding of financial markets
- Familiarity with pandas/NumPy (helpful but not required)

---

## ⚡ **Quick Installation**

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/your-repo/ultimate-backtest-engine.git
cd ultimate-backtest-engine
```

### **Step 2: Create Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### **Step 3: Install Dependencies**

```bash
pip install -r requirements.txt
```

### **Step 4: Set Up Environment Variables**

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your API keys
# DATABENTO_API_KEY=your_databento_key_here
# CLAUDE_API_KEY=your_claude_key_here
# etc.
```

### **Step 5: Test Installation**

```bash
python main.py --test quick --symbol ES
```

If you see output like this, you're ready to go! 🎉

```
✅ Configuration loaded successfully
✅ Data loaded: 10,000 records
✅ Backtest completed
📊 Total Return: 15.30%
📊 Sharpe Ratio: 1.85
```

---

## 🎯 **Your First Backtest**

Let's run a simple backtest using the built-in microstructure strategy:

### **1. Basic Backtest**

```python
from core.backtest_engine import UltimateBacktestEngine
from strategies.example_strategies import MicrostructureStrategy

# Initialize the engine
engine = UltimateBacktestEngine('config/config.yaml')

# Load ES futures data for 2023
data = engine.load_and_prepare_data('ES', '2023-01-01', '2023-12-31')

# Create a microstructure strategy
strategy = MicrostructureStrategy()

# Run the backtest
results = engine.run_backtest(strategy, data)

# Display results
print(f"📊 Backtest Results:")
print(f"   Total Return: {results['metrics']['total_return']:.2%}")
print(f"   Sharpe Ratio: {results['metrics']['sharpe_ratio']:.2f}")
print(f"   Max Drawdown: {results['metrics']['max_drawdown']:.2%}")
print(f"   Win Rate: {results['metrics']['win_rate']:.1%}")
print(f"   Total Trades: {results['metrics']['num_trades']}")
```

### **2. Command Line Interface**

You can also run backtests from the command line:

```bash
# Quick backtest
python main.py --symbol ES --test quick

# Full test suite with all validations
python main.py --symbol ES --test full

# Walk-forward analysis
python main.py --symbol ES --test walk_forward

# Monte Carlo simulation
python main.py --symbol ES --test monte_carlo
```

---

## ⚙️ **Configuration**

### **Environment Setup**

The system supports three environments:

1. **Development** (`development.yaml`) - For testing and development
2. **Staging** (`staging.yaml`) - For pre-production validation  
3. **Production** (`production.yaml`) - For live trading preparation

Set your environment:

```bash
export ENVIRONMENT=development  # or staging, production
```

### **Configuration Files**

#### **Main Config** (`config/config.yaml`)
```yaml
# API Keys (use environment variables in production)
api_keys:
  databento: "YOUR_DATABENTO_KEY"
  claude: "YOUR_CLAUDE_KEY"
  
# Backtesting Settings
backtest:
  initial_capital: 100000
  position_limit: 5
  commission_per_side: 2.25
```

#### **Environment Variables** (`.env`)
```bash
# API Keys
DATABENTO_API_KEY=your_actual_databento_key
CLAUDE_API_KEY=your_actual_claude_key
QUANTCONNECT_USER_ID=your_qc_user_id
QUANTCONNECT_TOKEN=your_qc_token

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

## 📊 **Data Setup**

### **Data Sources**

The engine supports multiple data sources:

1. **Databento MBP-10** - High-frequency tick data with order book
2. **NinjaTrader** - Real execution data for calibration
3. **QuantConnect** - Alternative data sources
4. **Free APIs** - Market context (VIX, rates, economic events)

### **Data Directory Structure**

```
data/
├── databento/          # Databento parquet files
│   ├── ES_mbp10.parquet
│   ├── NQ_mbp10.parquet
│   └── RTY_mbp10.parquet
├── ninjatrader/        # NinjaTrader export files
│   └── executions.csv
├── cache/              # Processed data cache
└── results/            # Backtest results
```

### **Sample Data**

For testing without real data, the system includes mock data generators:

```python
# The system will automatically generate mock data if real data is not available
engine = UltimateBacktestEngine('config/config.yaml')
data = engine.load_and_prepare_data('ES', '2023-01-01', '2023-12-31')
# This will generate realistic mock data if no real data files are found
```

---

## 🧠 **Creating Your First Strategy**

### **Simple Moving Average Strategy**

```python
from strategies.base_strategy import BaseStrategy
import pandas as pd

class SimpleMAStrategy(BaseStrategy):
    """Simple Moving Average Crossover Strategy"""
    
    def get_default_parameters(self):
        return {
            'fast_period': 20,
            'slow_period': 50,
            'signal_threshold': 0.02
        }
    
    def generate_signal(self, features):
        """Generate trading signal based on MA crossover"""
        
        # Get current and previous prices
        current_price = features.get('close', 0)
        
        # Simple signal logic (you would implement proper MA calculation)
        if 'ma_fast' in features and 'ma_slow' in features:
            ma_fast = features['ma_fast']
            ma_slow = features['ma_slow']
            
            # Generate signal based on crossover
            if ma_fast > ma_slow * (1 + self.parameters['signal_threshold']):
                return 1.0  # Long signal
            elif ma_fast < ma_slow * (1 - self.parameters['signal_threshold']):
                return -1.0  # Short signal
        
        return 0.0  # No signal

# Use your strategy
strategy = SimpleMAStrategy()
results = engine.run_backtest(strategy, data)
```

### **Strategy Development Tips**

1. **Start Simple**: Begin with basic logic, then add complexity
2. **Use Parameters**: Make your strategy configurable
3. **Handle Missing Data**: Always check for data availability
4. **Return Proper Signals**: Use -1 to 1 range for signal strength
5. **Test Thoroughly**: Use the testing framework for validation

---

## 📈 **Understanding Results**

### **Key Metrics**

```python
metrics = results['metrics']

# Performance Metrics
total_return = metrics['total_return']        # Overall return %
sharpe_ratio = metrics['sharpe_ratio']        # Risk-adjusted return
max_drawdown = metrics['max_drawdown']        # Maximum loss %

# Trade Statistics
num_trades = metrics['num_trades']            # Total number of trades
win_rate = metrics['win_rate']                # Percentage of winning trades
profit_factor = metrics['profit_factor']     # Gross profit / Gross loss

# Risk Metrics
volatility = metrics['volatility']           # Strategy volatility
var_95 = metrics['var_95']                    # Value at Risk (95%)
```

### **Equity Curve**

```python
import matplotlib.pyplot as plt

equity_curve = results['equity_curve']
plt.figure(figsize=(12, 6))
plt.plot(equity_curve)
plt.title('Strategy Equity Curve')
plt.xlabel('Time')
plt.ylabel('Portfolio Value ($)')
plt.show()
```

### **Trade Analysis**

```python
trades = results['trades']
trades_df = pd.DataFrame(trades)

# Analyze trades
print(f"Average Trade PnL: ${trades_df['pnl'].mean():.2f}")
print(f"Best Trade: ${trades_df['pnl'].max():.2f}")
print(f"Worst Trade: ${trades_df['pnl'].min():.2f}")
```

---

## 🔍 **Testing & Validation**

### **Walk-Forward Analysis**

```python
from testing.walk_forward import WalkForwardAnalyzer

# Initialize analyzer
wf_analyzer = WalkForwardAnalyzer()

# Run walk-forward analysis
wf_results = wf_analyzer.run_analysis(engine, strategy, data)

# Check robustness
robustness_score = wf_results['robustness_score']
print(f"Strategy Robustness Score: {robustness_score:.2f}/10")
```

### **Monte Carlo Simulation**

```python
from testing.monte_carlo import MonteCarloSimulator

# Initialize simulator
mc_simulator = MonteCarloSimulator()

# Run simulation
mc_results = mc_simulator.run_simulation(engine, strategy, data)

# Check confidence intervals
ci_lower = mc_results['confidence_intervals']['return']['5%']
ci_upper = mc_results['confidence_intervals']['return']['95%']
print(f"95% Confidence Interval: {ci_lower:.2%} to {ci_upper:.2%}")
```

---

## 🤖 **AI-Powered Analysis**

### **Get AI Insights**

```python
from analysis.ai_assistant import AIAssistant

# Initialize AI assistant
ai_assistant = AIAssistant(api_key="your_claude_key")

# Get analysis of your backtest results
analysis = ai_assistant.analyze_backtest_results(results, strategy.parameters)
print("🤖 AI Analysis:")
print(analysis)

# Get optimization suggestions
optimization = ai_assistant.get_strategy_optimization_advice(results, strategy)
print("🎯 Optimization Suggestions:")
print(optimization)
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: "No data files found"**
**Solution**: The system will use mock data. For real data, place files in `data/databento/`

### **Issue: "API key not found"**
**Solution**: Set environment variables or update `.env` file

### **Issue: "Memory error during backtest"**
**Solution**: Reduce data size or enable batch processing:
```python
# Enable batch processing for large datasets
engine.config['performance']['batch_size'] = 5000
```

### **Issue: "Slow backtest performance"**
**Solution**: Enable performance optimizations:
```python
# Enable parallel processing
engine.config['performance']['enable_parallel'] = True
engine.config['performance']['max_workers'] = 4
```

---

## 📚 **Next Steps**

### **Learn More**
1. **[Strategy Development Guide](strategy_development.md)** - Create advanced strategies
2. **[Testing Framework](../api/testing.md)** - Comprehensive validation
3. **[Performance Optimization](performance_optimization.md)** - Speed up backtests
4. **[Production Deployment](production_deployment.md)** - Deploy to production

### **Advanced Features**
1. **Multi-Asset Backtesting** - Test across multiple instruments
2. **Portfolio Construction** - Build diversified portfolios
3. **Risk Management** - Advanced risk controls
4. **Live Trading Integration** - Connect to live markets

### **Community & Support**
- 💬 **Discord**: [Join our community](https://discord.gg/backtesting)
- 📧 **Email**: support@backtesting-engine.com
- 📚 **Documentation**: [docs.backtesting-engine.com](https://docs.backtesting-engine.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎉 **Congratulations!**

You've successfully set up the Ultimate Backtesting Engine and run your first backtest. You're now ready to develop and test sophisticated trading strategies with world-class accuracy and performance.

Happy backtesting! 🚀

---

*Need help? Check out our [FAQ](faq.md) or reach out to our support team.*