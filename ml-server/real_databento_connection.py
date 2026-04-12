#!/usr/bin/env python3
"""
REAL DATABENTO CONNECTION
Connect to Databento and pull real NQ and YM MBP-10 data
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta

import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class RealDatabentoConnector:
    """Real Databento connector for NQ and YM data"""

    def __init__(self):
        self.api_key = "db-hmi8FuiKD9ARQjvJ3G3gCnmat86Hi"
        self.client = None
        self.connected = False

        # Data configuration
        self.symbols = ["NQ.FUT", "YM.FUT"]
        self.end_date = datetime.now().strftime("%Y-%m-%d")
        self.start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        self.dataset = "GLBX.MDP3"
        self.schema = "mbp-10"

        logger.info("Real Databento Connector initialized")
        logger.info(f"API Key: {self.api_key[:10]}...")
        logger.info(f"Symbols: {self.symbols}")
        logger.info(f"Date Range: {self.start_date} to {self.end_date}")

    async def connect_to_databento(self):
        """Connect to Databento API"""
        logger.info("CONNECTING TO DATABENTO...")

        try:
            # Import databento
            import databento as db

            # Initialize client
            self.client = db.Historical(self.api_key)
            self.connected = True

            logger.info("SUCCESS: Connected to Databento API")
            return True

        except ImportError:
            logger.error("ERROR: databento package not installed")
            logger.info("Install with: pip install databento")
            return False
        except Exception as e:
            logger.error(f"ERROR: Failed to connect to Databento: {e}")
            return False

    async def get_available_symbols(self):
        """Get available symbols from Databento"""
        logger.info("GETTING AVAILABLE SYMBOLS...")

        try:
            # Get dataset metadata
            metadata = self.client.metadata.get_dataset_conditions(dataset=self.dataset)
            logger.info(f"Dataset: {self.dataset}")
            logger.info(f"Available symbols: {len(metadata.symbols)} symbols")

            # Check if our symbols are available
            available_symbols = []
            for symbol in self.symbols:
                if symbol in metadata.symbols:
                    available_symbols.append(symbol)
                    logger.info(f"SUCCESS: {symbol} is available")
                else:
                    logger.warning(f"WARNING: {symbol} not found in available symbols")

            return available_symbols

        except Exception as e:
            logger.error(f"ERROR: Failed to get symbols: {e}")
            return []

    async def download_historical_data(self, symbol: str):
        """Download historical MBP-10 data for a symbol"""
        logger.info(f"DOWNLOADING HISTORICAL DATA FOR {symbol}...")

        try:
            # Download data
            data = self.client.timeseries.get_range(
                dataset=self.dataset,
                symbols=symbol,
                schema=self.schema,
                start=self.start_date,
                end=self.end_date,
                stype_in="symbol",
                stype_out="symbol",
            )

            # Convert to DataFrame
            df = data.to_df()

            logger.info(f"SUCCESS: Downloaded {len(df)} records for {symbol}")
            logger.info(f"Columns: {list(df.columns)}")
            logger.info(f"Date range: {df['ts_event'].min()} to {df['ts_event'].max()}")

            return df

        except Exception as e:
            logger.error(f"ERROR: Failed to download data for {symbol}: {e}")
            return None

    async def process_mbp10_data(self, df: pd.DataFrame, symbol: str):
        """Process MBP-10 data and extract features"""
        logger.info(f"PROCESSING MBP-10 DATA FOR {symbol}...")

        try:
            # Basic data processing
            df["symbol"] = symbol
            df["ts_event"] = pd.to_datetime(df["ts_event"])
            df = df.sort_values("ts_event")

            # Extract basic features
            features = {
                "symbol": symbol,
                "total_records": len(df),
                "date_range": {
                    "start": df["ts_event"].min().strftime("%Y-%m-%d"),
                    "end": df["ts_event"].max().strftime("%Y-%m-%d"),
                },
                "unique_dates": df["ts_event"].dt.date.nunique(),
                "data_quality": {
                    "missing_values": df.isnull().sum().sum(),
                    "duplicate_records": df.duplicated().sum(),
                },
            }

            logger.info(f"SUCCESS: Processed {symbol} data")
            logger.info(f"Records: {features['total_records']}")
            logger.info(
                f"Date range: {features['date_range']['start']} to {features['date_range']['end']}"
            )

            return df, features

        except Exception as e:
            logger.error(f"ERROR: Failed to process data for {symbol}: {e}")
            return None, None

    async def save_data_to_file(self, df: pd.DataFrame, symbol: str):
        """Save data to file"""
        try:
            filename = f"ml-platform/data/{symbol.replace('.', '_')}_mbp10_data.csv"

            # Create directory if it doesn't exist
            os.makedirs("ml-platform/data", exist_ok=True)

            # Save to CSV
            df.to_csv(filename, index=False)

            logger.info(f"SUCCESS: Saved {symbol} data to {filename}")
            return filename

        except Exception as e:
            logger.error(f"ERROR: Failed to save data for {symbol}: {e}")
            return None

    async def run_full_download(self):
        """Run full download process"""
        logger.info("STARTING REAL DATABENTO DATA DOWNLOAD")
        logger.info("=" * 60)

        # Step 1: Connect to Databento
        connected = await self.connect_to_databento()
        if not connected:
            logger.error("FAILED: Cannot connect to Databento")
            return False

        # Step 2: Get available symbols
        available_symbols = await self.get_available_symbols()
        if not available_symbols:
            logger.error("FAILED: No symbols available")
            return False

        # Step 3: Download data for each symbol
        download_results = {}

        for symbol in available_symbols:
            logger.info(f"PROCESSING {symbol}...")

            # Download data
            df = await self.download_historical_data(symbol)
            if df is None:
                continue

            # Process data
            processed_df, features = await self.process_mbp10_data(df, symbol)
            if processed_df is None:
                continue

            # Save data
            filename = await self.save_data_to_file(processed_df, symbol)

            download_results[symbol] = {
                "filename": filename,
                "features": features,
                "records": len(processed_df),
            }

        # Step 4: Save download summary
        summary = {
            "download_date": datetime.now().isoformat(),
            "api_key": self.api_key[:10] + "...",
            "symbols_requested": self.symbols,
            "symbols_available": available_symbols,
            "download_results": download_results,
            "total_records": sum(result["records"] for result in download_results.values()),
        }

        summary_file = "ml-platform/databento_download_summary.json"
        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2)

        logger.info("=" * 60)
        logger.info("DOWNLOAD SUMMARY:")
        logger.info(f"Symbols requested: {len(self.symbols)}")
        logger.info(f"Symbols available: {len(available_symbols)}")
        logger.info(f"Total records downloaded: {summary['total_records']}")
        logger.info(f"Summary saved to: {summary_file}")
        logger.info("=" * 60)

        return len(download_results) > 0


async def main():
    """Main function"""
    logger.info("REAL DATABENTO CONNECTION LAUNCHER")
    logger.info("=" * 60)

    # Initialize connector
    connector = RealDatabentoConnector()

    # Run full download
    success = await connector.run_full_download()

    if success:
        logger.info("SUCCESS: Real data download completed!")
        logger.info("Ready to train models with real Databento data!")
    else:
        logger.error("FAILED: Data download failed!")


if __name__ == "__main__":
    asyncio.run(main())
