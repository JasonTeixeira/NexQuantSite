"""
Data Service - Real Market Data Integration
Provides market data from multiple sources with caching
"""

import asyncio
import logging
import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Data Service", version="1.0.0")

class DataRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    interval: str = "1d"  # 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    source: str = "yahoo"

class DataResponse(BaseModel):
    symbol: str
    data: List[Dict[str, Any]]
    source: str
    retrieved_at: str
    record_count: int

# Data cache directory
CACHE_DIR = Path("data_cache")
CACHE_DIR.mkdir(exist_ok=True)

def get_cache_path(symbol: str, start_date: str, end_date: str, interval: str) -> Path:
    """Get cache file path for data request"""
    filename = f"{symbol}_{start_date}_{end_date}_{interval}.parquet"
    return CACHE_DIR / filename

def is_cache_valid(cache_path: Path, max_age_hours: int = 1) -> bool:
    """Check if cached data is still valid"""
    if not cache_path.exists():
        return False
    
    file_age = datetime.now() - datetime.fromtimestamp(cache_path.stat().st_mtime)
    return file_age < timedelta(hours=max_age_hours)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "data-service",
        "cache_dir": str(CACHE_DIR.absolute()),
        "cached_files": len(list(CACHE_DIR.glob("*.parquet")))
    }

@app.post("/data/fetch", response_model=DataResponse)
async def fetch_market_data(request: DataRequest):
    """
    Fetch market data from specified source with caching
    """
    try:
        # Check cache first
        cache_path = get_cache_path(request.symbol, request.start_date, request.end_date, request.interval)
        
        if is_cache_valid(cache_path):
            logger.info(f"Using cached data for {request.symbol}")
            df = pd.read_parquet(cache_path)
        else:
            logger.info(f"Fetching fresh data for {request.symbol} from {request.source}")
            
            if request.source == "yahoo":
                df = await fetch_yahoo_data(request)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported data source: {request.source}")
            
            # Cache the data
            df.to_parquet(cache_path)
            logger.info(f"Cached data to {cache_path}")
        
        # Convert to response format
        data_records = []
        for index, row in df.iterrows():
            record = {
                "timestamp": index.isoformat() if hasattr(index, 'isoformat') else str(index),
                "open": float(row.get('Open', 0)),
                "high": float(row.get('High', 0)),
                "low": float(row.get('Low', 0)),
                "close": float(row.get('Close', 0)),
                "volume": int(row.get('Volume', 0)),
                "adj_close": float(row.get('Adj Close', row.get('Close', 0)))
            }
            data_records.append(record)
        
        return DataResponse(
            symbol=request.symbol,
            data=data_records,
            source=request.source,
            retrieved_at=datetime.utcnow().isoformat(),
            record_count=len(data_records)
        )
        
    except Exception as e:
        logger.error(f"Data fetch failed for {request.symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Data fetch failed: {str(e)}")

async def fetch_yahoo_data(request: DataRequest) -> pd.DataFrame:
    """Fetch data from Yahoo Finance"""
    try:
        ticker = yf.Ticker(request.symbol)
        
        # Fetch data
        df = ticker.history(
            start=request.start_date,
            end=request.end_date,
            interval=request.interval,
            auto_adjust=True,
            prepost=True
        )
        
        if df.empty:
            raise ValueError(f"No data found for symbol {request.symbol}")
        
        return df
        
    except Exception as e:
        logger.error(f"Yahoo Finance fetch failed: {e}")
        raise

@app.get("/data/symbols")
async def list_available_symbols():
    """List symbols with cached data"""
    cached_files = list(CACHE_DIR.glob("*.parquet"))
    symbols = set()
    
    for file in cached_files:
        symbol = file.stem.split('_')[0]  # Extract symbol from filename
        symbols.add(symbol)
    
    return {
        "cached_symbols": sorted(list(symbols)),
        "total_cache_files": len(cached_files)
    }

@app.delete("/data/cache")
async def clear_cache():
    """Clear all cached data"""
    try:
        deleted_count = 0
        for file in CACHE_DIR.glob("*.parquet"):
            file.unlink()
            deleted_count += 1
        
        return {
            "status": "success",
            "deleted_files": deleted_count,
            "message": "Cache cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Cache clear failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache clear failed: {str(e)}")

@app.get("/data/validate/{symbol}")
async def validate_data_quality(symbol: str):
    """Validate data quality for a symbol"""
    try:
        # Get recent data
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        request = DataRequest(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            interval="1d"
        )
        
        df = await fetch_yahoo_data(request)
        
        # Basic data quality checks
        quality_metrics = {
            "symbol": symbol,
            "record_count": len(df),
            "date_range": {
                "start": df.index.min().isoformat() if not df.empty else None,
                "end": df.index.max().isoformat() if not df.empty else None
            },
            "missing_values": {
                "open": df['Open'].isna().sum(),
                "high": df['High'].isna().sum(),
                "low": df['Low'].isna().sum(),
                "close": df['Close'].isna().sum(),
                "volume": df['Volume'].isna().sum()
            },
            "price_consistency": {
                "high_gte_low": (df['High'] >= df['Low']).all(),
                "high_gte_open": (df['High'] >= df['Open']).all(),
                "high_gte_close": (df['High'] >= df['Close']).all(),
                "low_lte_open": (df['Low'] <= df['Open']).all(),
                "low_lte_close": (df['Low'] <= df['Close']).all()
            },
            "volume_check": {
                "zero_volume_days": (df['Volume'] == 0).sum(),
                "negative_volume": (df['Volume'] < 0).sum()
            }
        }
        
        # Overall quality score
        consistency_score = sum(quality_metrics["price_consistency"].values()) / len(quality_metrics["price_consistency"])
        missing_score = 1.0 - (sum(quality_metrics["missing_values"].values()) / (len(df) * 5))
        volume_score = 1.0 - (quality_metrics["volume_check"]["negative_volume"] / max(len(df), 1))
        
        quality_metrics["overall_quality_score"] = (consistency_score + missing_score + volume_score) / 3
        
        return quality_metrics
        
    except Exception as e:
        logger.error(f"Data validation failed for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

if __name__ == "__main__":
    # Install required dependency
    try:
        import yfinance
    except ImportError:
        print("Installing yfinance...")
        os.system("pip install yfinance")
        import yfinance
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3012)



