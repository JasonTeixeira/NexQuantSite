# 🌐 API Integration Guide for Nexural Testing Engine

## 🎯 Quick Setup for Best Free APIs

### 1️⃣ **Alpha Vantage** (85/100) - FREE
```bash
# Get your free key in 30 seconds:
https://www.alphavantage.co/support/#api-key

# Add to .env:
ALPHA_VANTAGE_API_KEY=your_key_here
```
**You Get**: Stock data, forex, crypto, 50+ technical indicators

---

### 2️⃣ **FRED** (90/100) - FREE
```bash
# Get key instantly:
https://fred.stlouisfed.org/docs/api/api_key.html

# Add to .env:
FRED_API_KEY=your_key_here
```
**You Get**: All economic data - GDP, inflation, unemployment, rates

---

### 3️⃣ **Polygon.io** (78/100) - FREE TIER
```bash
# Sign up for free:
https://polygon.io/dashboard/signup

# Add to .env:
POLYGON_API_KEY=your_key_here
```
**You Get**: Stocks, options, forex, crypto (limited)

---

### 4️⃣ **IEX Cloud** (75/100) - FREE TIER
```bash
# Get free account:
https://iexcloud.io/console/tokens

# Add to .env:
IEX_CLOUD_TOKEN=your_token_here
```
**You Get**: 50,000 messages/month free

---

### 5️⃣ **Twelve Data** (76/100) - FREE TIER
```bash
# Sign up:
https://twelvedata.com/apikey

# Add to .env:
TWELVE_DATA_KEY=your_key_here
```
**You Get**: 800 API calls/day

---

## 🚀 **No API Key Required** (Use Immediately!)

### **Yahoo Finance** (82/100)
```python
# Already integrated! Just use:
import yfinance as yf
data = yf.download('SPY')
```

### **Binance** (88/100)
```python
# Public endpoints work without key:
# Already integrated in free_api_hub.py
```

### **CoinGecko** (80/100)
```python
# Public API - no key needed for basic:
# Already integrated!
```

---

## 💎 **Premium APIs Worth Paying For**

### **QuantConnect** (92/100) - $8/month
```bash
# Best value for comprehensive data
https://www.quantconnect.com/pricing

What you get:
- US Equities tick data (1998-present)
- Options, futures, forex, crypto
- Fundamental data
- Alternative data sets
```

### **Alpaca** (89/100) - FREE + Paid data
```bash
# Free account with paper trading
https://alpaca.markets/

What you get:
- Real-time data subscription ($9/month)
- Historical data
- Live trading execution
```

### **Databento** (95/100) - $200+/month
```bash
# Professional tick data
https://databento.com/

What you get:
- Full order book (L3)
- Nanosecond timestamps
- Historical tick data
```

---

## 📊 **Data Quality Comparison**

| API | Free Tier | Quality | Coverage | Speed | Rating |
|-----|-----------|---------|----------|-------|--------|
| **Yahoo Finance** | ✅ Unlimited | Good | Global | Fast | 82/100 |
| **Alpha Vantage** | ✅ 500/day | Excellent | US Focus | Slow | 85/100 |
| **FRED** | ✅ Unlimited | Perfect | Macro | Fast | 90/100 |
| **Binance** | ✅ Unlimited | Perfect | Crypto | Fast | 88/100 |
| **IEX Cloud** | ✅ 50k/mo | Good | US Stocks | Fast | 75/100 |
| **Polygon** | ✅ Limited | Good | Multi | Fast | 78/100 |
| **QuantConnect** | ❌ $8+ | Excellent | Everything | Fast | 92/100 |
| **Databento** | ❌ $200+ | Perfect | Futures | Instant | 95/100 |

---

## 🔧 **Quick Integration Code**

### **Step 1: Update your .env file**
```env
# Free APIs (Get these keys in 5 minutes)
ALPHA_VANTAGE_API_KEY=your_key
FRED_API_KEY=your_key
POLYGON_API_KEY=your_key
IEX_CLOUD_TOKEN=your_token
TWELVE_DATA_KEY=your_key

# Premium (when ready)
QUANTCONNECT_USER_ID=your_id
QUANTCONNECT_TOKEN=your_token
ALPACA_KEY_ID=your_key
ALPACA_SECRET_KEY=your_secret
```

### **Step 2: Use the Free API Hub**
```python
from data_connectors.free_api_hub import FreeAPIHub

hub = FreeAPIHub()

# Get stock data
spy_data = hub.get_yahoo_finance_data('SPY')
aapl_data = hub.get_alpha_vantage_daily('AAPL')

# Get economic indicators
vix = hub.get_yahoo_finance_data('^VIX')
treasury_rate = hub.get_fred_series('DGS10')
unemployment = hub.get_fred_series('UNRATE')

# Get crypto data
btc_data = hub.get_binance_klines('BTCUSDT')
eth_data = hub.get_coingecko_price('ethereum')

# Get market overview
indicators = hub.get_market_indicators()
```

---

## 📈 **What Each API Gives You**

### **For Backtesting Stocks:**
1. **Yahoo Finance** - Historical prices, dividends, splits
2. **Alpha Vantage** - Technical indicators, intraday data
3. **IEX Cloud** - Real-time quotes, company data
4. **Polygon** - Options chains, aggregates

### **For Economic Context:**
1. **FRED** - Every economic indicator imaginable
2. **Alpha Vantage** - Sector performance
3. **Yahoo Finance** - Market indices

### **For Crypto:**
1. **Binance** - Best free crypto data
2. **CoinGecko** - Market cap, volume metrics
3. **Polygon** - Crypto aggregates

### **For Alternative Data:**
1. **QuantConnect** - Sentiment, fundamentals
2. **IEX Cloud** - Social sentiment
3. **Polygon** - News feeds

---

## 🎯 **Recommended Setup for Nexural**

### **Immediate (Free):**
```python
# These work right now without any payment:
1. Yahoo Finance ✅ (no key needed)
2. Binance ✅ (no key needed)
3. CoinGecko ✅ (no key needed)
4. Alpha Vantage ✅ (free key in 30 seconds)
5. FRED ✅ (free key in 30 seconds)
```

### **Next Level ($10-50/month):**
```python
1. QuantConnect - $8/month (best value)
2. Alpaca - $9/month (real-time data)
3. Tiingo - $10/month (clean EOD)
```

### **Professional ($200+/month):**
```python
1. Databento - $200+ (tick data)
2. Interactive Brokers - $10 + data fees
3. Refinitiv - $1800+ (institutional)
```

---

## 🚀 **Action Items**

1. **Right Now** (5 minutes):
   - Get Alpha Vantage key ✅
   - Get FRED key ✅
   - Test with free_api_hub.py ✅

2. **This Week**:
   - Sign up for Polygon free tier
   - Test IEX Cloud free tier
   - Evaluate data quality

3. **When Ready**:
   - Consider QuantConnect for $8/month
   - Add Alpaca for live trading
   - Upgrade to Databento when profitable

---

## 💡 **Pro Tips**

1. **Cache Everything**: Store API responses locally
2. **Rate Limits**: Respect them or get banned
3. **Fallbacks**: Use multiple sources for redundancy
4. **Data Quality**: Always validate and clean
5. **Cost Control**: Monitor your API usage

---

**Your Nexural Testing Engine can now access professional-grade data from multiple sources!** 🎉