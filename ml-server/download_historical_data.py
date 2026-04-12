"""
NEXURAL TRADING - HISTORICAL DATA DOWNLOADER
Downloads market data from Polygon.io for ML training
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

import aiohttp
import pandas as pd

# Configure paths
DATA_DIR = Path("data/historical")
DATA_DIR.mkdir(parents=True, exist_ok=True)


class PolygonDataDownloader:
    """Downloads and processes historical market data from Polygon.io"""

    def __init__(self):
        # Load API key from environment
        self.api_key = self._get_api_key()
        self.base_url = "https://api.polygon.io"
        self.session = None

        # Trading symbols we need data for
        self.symbols = {
            "ES": "ES",  # E-mini S&P 500
            "NQ": "NQ",  # E-mini Nasdaq
            "YM": "YM",  # E-mini Dow
            "RTY": "M2K",  # Micro Russell (RTY in some systems)
            "GC": "GC",  # Gold
            "SI": "SI",  # Silver
            "CL": "CL",  # Crude Oil
            "NG": "NG",  # Natural Gas
        }

        self.timeframes = ["1min", "5min", "15min", "60min", "day"]

    def _get_api_key(self):
        """Get Polygon API key from environment"""
        # Try multiple env files
        env_files = ["api_keys.env", ".env", "config/production.env"]

        for env_file in env_files:
            if Path(env_file).exists():
                with open(env_file, encoding="utf-8") as f:
                    for line in f:
                        if "POLYGON_API_KEY" in line and "=" in line:
                            key = line.split("=")[1].strip().strip('"').strip("'")
                            if key and key != "your_polygon_api_key_here":
                                return key

        # Check environment variable
        key = os.getenv("POLYGON_API_KEY")
        if key:
            return key

        print("⚠️  WARNING: No valid Polygon API key found!")
        print("Please add POLYGON_API_KEY to api_keys.env")
        return "demo"  # Use demo key for limited testing

    async def download_bars(self, symbol: str, timeframe: str, from_date: str, to_date: str):
        """Download bar data for a symbol"""

        # Convert symbol to Polygon format
        polygon_symbol = f"C:{symbol}USD" if symbol in ["BTC", "ETH"] else f"I:{symbol}"

        # Map timeframe to Polygon format
        timeframe_map = {
            "1min": "1/minute",
            "5min": "5/minute",
            "15min": "15/minute",
            "60min": "1/hour",
            "day": "1/day",
        }

        multiplier, timespan = timeframe_map[timeframe].split("/")

        url = f"{self.base_url}/v2/aggs/ticker/{polygon_symbol}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        params = {"apiKey": self.api_key, "sort": "asc", "limit": 50000}

        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()

                    if "results" in data and data["results"]:
                        df = pd.DataFrame(data["results"])
                        df["timestamp"] = pd.to_datetime(df["t"], unit="ms")
                        df.columns = [
                            "volume",
                            "volume_weighted",
                            "open",
                            "close",
                            "high",
                            "low",
                            "time_ms",
                            "n_trades",
                            "timestamp",
                        ]

                        # Save to file
                        filename = DATA_DIR / f"{symbol}_{timeframe}_{from_date}_{to_date}.csv"
                        df.to_csv(filename, index=False)

                        print(f"✅ Downloaded {symbol} {timeframe}: {len(df)} bars")
                        return df
                    else:
                        print(f"⚠️  No data for {symbol} {timeframe}")
                        return None

                elif response.status == 403:
                    print(f"❌ API Key invalid or no access to {symbol}")
                    return None
                else:
                    print(f"❌ Error {response.status} for {symbol}")
                    return None

        except Exception as e:
            print(f"❌ Error downloading {symbol}: {str(e)}")
            return None

    async def download_all_symbols(self, days_back: int = 365):
        """Download data for all symbols"""

        print("=" * 60)
        print("🚀 DOWNLOADING HISTORICAL MARKET DATA")
        print("=" * 60)

        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        from_str = start_date.strftime("%Y-%m-%d")
        to_str = end_date.strftime("%Y-%m-%d")

        print(f"📅 Date Range: {from_str} to {to_str}")
        print(f"📊 Symbols: {', '.join(self.symbols.keys())}")
        print(f"⏱️  Timeframes: {', '.join(self.timeframes)}")
        print()

        # Create session
        self.session = aiohttp.ClientSession()

        try:
            # Download data for each symbol and timeframe
            tasks = []
            for _symbol_key, symbol_code in self.symbols.items():
                for timeframe in self.timeframes:
                    task = self.download_bars(symbol_code, timeframe, from_str, to_str)
                    tasks.append(task)

                    # Rate limit: 5 requests per second for free tier
                    if self.api_key == "demo":
                        await asyncio.sleep(0.2)

            # Wait for all downloads
            results = await asyncio.gather(*tasks)

            # Count successful downloads
            successful = sum(1 for r in results if r is not None)

            print()
            print("=" * 60)
            print(f"📊 Downloaded {successful}/{len(tasks)} datasets")

            if successful > 0:
                print("✅ Data saved to: data/historical/")
                return True
            else:
                print("❌ No data downloaded. Check your API key.")
                return False

        finally:
            await self.session.close()

    def create_training_dataset(self):
        """Combine downloaded data into training dataset"""

        print()
        print("=" * 60)
        print("🔧 CREATING TRAINING DATASET")
        print("=" * 60)

        # Find all CSV files
        csv_files = list(DATA_DIR.glob("*.csv"))

        if not csv_files:
            print("❌ No data files found!")
            return None

        print(f"📁 Found {len(csv_files)} data files")

        # Combine data
        all_data = []

        for file in csv_files:
            # Parse filename to get metadata
            parts = file.stem.split("_")
            if len(parts) >= 2:
                symbol = parts[0]
                timeframe = parts[1]

                # Load data
                df = pd.read_csv(file)
                df["symbol"] = symbol
                df["timeframe"] = timeframe

                all_data.append(df)

        if all_data:
            # Combine all dataframes
            combined_df = pd.concat(all_data, ignore_index=True)

            # Save combined dataset
            output_file = DATA_DIR / "training_data_combined.csv"
            combined_df.to_csv(output_file, index=False)

            print(f"✅ Combined dataset: {len(combined_df):,} rows")
            print(f"💾 Saved to: {output_file}")

            # Show summary
            print()
            print("📊 Dataset Summary:")
            print(f"  - Total rows: {len(combined_df):,}")
            print(
                f"  - Date range: {combined_df['timestamp'].min()} to {combined_df['timestamp'].max()}"
            )
            print(f"  - Symbols: {combined_df['symbol'].unique()}")
            print(f"  - Timeframes: {combined_df['timeframe'].unique()}")

            return combined_df
        else:
            print("❌ No data to combine!")
            return None


async def main():
    """Main entry point"""

    print("🚀 NEXURAL TRADING - ML DATA PIPELINE")
    print("=" * 60)

    # Check for API key
    downloader = PolygonDataDownloader()

    if downloader.api_key == "demo":
        print("⚠️  WARNING: Using demo mode - limited data only")
        print("Add your Polygon API key to api_keys.env for full data")
        print()

    # Download historical data
    success = await downloader.download_all_symbols(days_back=30)  # Start with 30 days

    if success:
        # Create training dataset
        dataset = downloader.create_training_dataset()

        if dataset is not None:
            print()
            print("=" * 60)
            print("✅ DATA DOWNLOAD COMPLETE!")
            print("=" * 60)
            print()
            print("Next steps:")
            print("1. Run feature_engineering.py to create features")
            print("2. Run train_models.py to train ML models")
            print("3. Run backtest_strategies.py to test performance")

            return True

    return False


if __name__ == "__main__":
    # Run the async main function
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
