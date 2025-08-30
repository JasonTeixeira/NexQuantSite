# 📊 Databento Data Integration Guide
## Nexural Testing Engine - Professional Data Setup

### 🎯 **Overview**

This guide will help you connect the Nexural Testing Engine to Databento for high-frequency market data (MBP-10). Databento provides institutional-grade tick data that will significantly enhance your backtesting accuracy.

---

## 🔑 **Getting Started with Databento**

### **Step 1: Sign Up for Databento**
1. Visit [databento.com](https://databento.com)
2. Create an account
3. Choose a subscription plan (they offer free tiers for testing)
4. Get your API key from the dashboard

### **Step 2: Install Databento Client**
```bash
pip install databento
```

### **Step 3: Configure Your API Key**
1. Edit your `.env` file in the project root
2. Update the Databento API key:
```env
DATABENTO_API_KEY=your_actual_databento_api_key_here
```

---

## 📈 **Data Types Available**

### **MBP-10 (Market by Price - 10 Levels)**
- **Description**: Top 10 bid/ask price levels with sizes
- **Update Frequency**: Every market data change
- **Use Case**: High-frequency strategy development
- **File Format**: Parquet files for fast loading

### **Supported Instruments**
- **ES**: E-mini S&P 500 Futures
- **NQ**: E-mini NASDAQ 100 Futures  
- **RTY**: E-mini Russell 2000 Futures
- **YM**: E-mini Dow Jones Futures

---

## 🗂️ **Data Organization**

### **Recommended Directory Structure**
```
data/
├── databento/
│   ├── ES/
│   │   ├── ES_2023_01.parquet
│   │   ├── ES_2023_02.parquet
│   │   └── ...
│   ├── NQ/
│   │   ├── NQ_2023_01.parquet
│   │   └── ...
│   └── README_data.txt
```

---

## 💾 **Downloading Historical Data**

### **Method 1: Using Databento Python Client**

```python
import databento as db
import os
from datetime import datetime, timedelta

# Initialize client
client = db.Historical(key=os.getenv('DATABENTO_API_KEY'))

# Download ES data for January 2023
data = client.timeseries.get_range(
    dataset='GLBX.MDP3',  # CME Globex
    symbols='ES.FUT',
    schema='mbp-10',
    start='2023-01-01',
    end='2023-02-01',
    encoding='csv'  # or 'json', 'dbn'
)

# Save to file
data.to_file('data/databento/ES_2023_01.csv')
```

### **Method 2: Web Portal Download**
1. Login to your Databento dashboard
2. Navigate to "Historical Data"
3. Select your parameters:
   - **Dataset**: GLBX.MDP3 (CME Globex)
   - **Schema**: mbp-10
   - **Symbols**: ES.FUT, NQ.FUT, etc.
   - **Date Range**: Your desired period
4. Download as Parquet files
5. Place in `data/databento/` directory

---

## ⚙️ **Configuration**

### **Update config.yaml**
```yaml
data:
  paths:
    databento: "./data/databento/"
  providers:
    databento:
      enabled: true
      api_key_env: "DATABENTO_API_KEY"
      datasets:
        - "GLBX.MDP3"  # CME Globex
      schemas:
        - "mbp-10"     # Market by Price 10 levels
```

---

## 🧪 **Testing Your Setup**

### **Quick Test Script**
```python
# test_databento.py
import sys
sys.path.append('src')

from data_connectors.databento_connector import DatabentoConnector
import os

# Test connection
api_key = os.getenv('DATABENTO_API_KEY')
connector = DatabentoConnector(api_key, 'data/databento/')

# Test data loading
try:
    data = connector.load_mbp10_data('ES', '2023-01-01', '2023-01-02')
    print(f"✅ Success! Loaded {len(data)} records")
    print(f"Columns: {list(data.columns)}")
    print(data.head())
except Exception as e:
    print(f"❌ Error: {e}")
```

Run the test:
```bash
python test_databento.py
```

---

## 📊 **Data Quality Checks**

The Nexural Testing Engine automatically validates Databento data:

### **Automatic Checks**
- ✅ **Data Continuity**: Checks for gaps in timestamps
- ✅ **Price Validation**: Ensures prices are reasonable
- ✅ **Volume Validation**: Checks for zero or negative volumes
- ✅ **Spread Analysis**: Validates bid-ask spreads
- ✅ **Market Hours**: Filters data to trading hours

### **Manual Verification**
```python
# Quick data inspection
import pandas as pd

# Load a sample file
df = pd.read_parquet('data/databento/ES_2023_01.parquet')

print("Data Summary:")
print(f"Records: {len(df):,}")
print(f"Date Range: {df.index.min()} to {df.index.max()}")
print(f"Avg Spread: {(df['ask_price_0'] - df['bid_price_0']).mean():.4f}")
print(f"Data Types: {df.dtypes}")
```

---

## 💰 **Cost Optimization**

### **Databento Pricing Tips**
1. **Start Small**: Download 1-2 months of data first
2. **Use Compression**: Parquet files save 60-80% space
3. **Selective Symbols**: Only download instruments you trade
4. **Cache Processed Data**: Avoid re-downloading

### **Storage Requirements**
- **ES MBP-10**: ~2-3 GB per month
- **All 4 Futures**: ~10-12 GB per month
- **1 Year All**: ~120-150 GB

---

## 🚀 **Integration with Nexural Engine**

### **Once Setup is Complete**

1. **Launch the App**:
   ```bash
   python launch_app.py
   ```

2. **Select Your Data**:
   - Symbol: ES (or NQ, RTY, YM)
   - Date Range: Within your downloaded data
   - The engine will automatically use Databento data

3. **Enhanced Features Available**:
   - ✅ **Tick-level backtesting**
   - ✅ **Market microstructure analysis**
   - ✅ **Order book imbalance signals**
   - ✅ **Real slippage modeling**
   - ✅ **Professional-grade results**

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **"API Key Invalid"**
- Verify your API key in the Databento dashboard
- Check that .env file contains the correct key
- Ensure no extra spaces or quotes around the key

#### **"No Data Files Found"**
- Check file paths in config.yaml
- Verify files are in correct directory structure
- Ensure files have correct naming convention

#### **"Data Loading Slow"**
- Use Parquet format instead of CSV
- Enable data caching in config
- Consider using SSD storage

#### **"Memory Errors"**
- Reduce date range for large datasets
- Enable batch processing
- Increase available RAM

---

## 📈 **Advanced Features**

### **With Professional Data Connected**

Your Nexural Testing Engine gains these capabilities:

#### **🎯 Precision Features**
- **Tick-perfect execution simulation**
- **Real market microstructure modeling**
- **Order book dynamics analysis**
- **Accurate slippage calculation**

#### **🧠 AI-Enhanced Analysis**
- **Market regime detection**
- **Liquidity analysis**
- **Pattern recognition in order flow**
- **Predictive modeling**

#### **📊 Professional Metrics**
- **Market impact modeling**
- **Implementation shortfall**
- **TWAP/VWAP benchmarking**
- **Transaction cost analysis**

---

## 🏆 **You're Now Ready for Institutional-Grade Backtesting!**

With Databento data connected, your Nexural Testing Engine operates at the same level as:

- **Investment Banks**: Goldman Sachs, Morgan Stanley
- **Hedge Funds**: Renaissance Technologies, Citadel
- **Prop Trading Firms**: Jump Trading, Virtu Financial

### **Professional Value**
- **Data Cost Alone**: $10,000-50,000/year at institutions
- **Your Setup**: Fraction of the cost
- **Same Quality**: Institutional-grade results
- **Full Control**: Your data, your analysis

---

*🚀 Ready to backtest like the pros with real institutional data!*