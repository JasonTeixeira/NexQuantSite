#!/usr/bin/env python3
"""
REAL DATABENTO CONNECTION V3
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


class RealDatabentoConnectorV3:
    """Real Databento connector for NQ and YM data"""

    def __init__(self):
        self.api_key = "db-hmi8FuiKD9ARQjvJ3G3gCnmat86Hi"
        self.client = None
        self.connected = False

        # Data configuration - using raw_symbol format
        self.symbols = ["NQ", "YM"]  # Simplified symbols
        self.end_date = datetime.now().strftime("%Y-%m-%d")
        self.start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
        self.dataset = "GLBX.MDP3"
        self.schema = "mbp-10"

        logger.info("Real Databento Connector V3 initialized")
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

    async def test_symbol_availability(self):
        """Test if our symbols are available"""
        logger.info("TESTING SYMBOL AVAILABILITY...")

        available_symbols = []

        for symbol in self.symbols:
            try:
                logger.info(f"Testing {symbol}...")

                # Try to get a small sample of data with raw_symbol
                data = self.client.timeseries.get_range(
                    dataset=self.dataset,
                    symbols=symbol,
                    schema=self.schema,
                    start=self.start_date,
                    end=self.start_date,  # Just one day
                    stype_in="raw_symbol",
                    stype_out="raw_symbol",
                )

                df = data.to_df()
                if len(df) > 0:
                    available_symbols.append(symbol)
                    logger.info(f"SUCCESS: {symbol} is available ({len(df)} records)")
                else:
                    logger.warning(f"WARNING: {symbol} returned no data")

            except Exception as e:
                logger.error(f"ERROR: {symbol} not available - {e}")

        return available_symbols

    async def download_historical_data(self, symbol: str):
        """Download historical MBP-10 data for a symbol"""
        logger.info(f"DOWNLOADING HISTORICAL DATA FOR {symbol}...")

        try:
            # Download data in chunks to avoid memory issues
            chunk_size = 30  # days per chunk
            all_data = []

            start_date = datetime.strptime(self.start_date, "%Y-%m-%d")
            end_date = datetime.strptime(self.end_date, "%Y-%m-%d")

            current_date = start_date
            chunk_count = 0

            while current_date <= end_date:
                chunk_end = min(current_date + timedelta(days=chunk_size), end_date)

                logger.info(
                    f"Downloading chunk {chunk_count + 1}: {current_date.strftime('%Y-%m-%d')} to {chunk_end.strftime('%Y-%m-%d')}"
                )

                try:
                    data = self.client.timeseries.get_range(
                        dataset=self.dataset,
                        symbols=symbol,
                        schema=self.schema,
                        start=current_date.strftime("%Y-%m-%d"),
                        end=chunk_end.strftime("%Y-%m-%d"),
                        stype_in="raw_symbol",
                        stype_out="raw_symbol",
                    )

                    df_chunk = data.to_df()
                    if len(df_chunk) > 0:
                        all_data.append(df_chunk)
                        logger.info(f"Chunk {chunk_count + 1}: {len(df_chunk)} records")
                    else:
                        logger.info(f"Chunk {chunk_count + 1}: No data")

                except Exception as e:
                    logger.warning(f"Chunk {chunk_count + 1} failed: {e}")

                current_date = chunk_end + timedelta(days=1)
                chunk_count += 1

                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)

            # Combine all chunks
            if all_data:
                df = pd.concat(all_data, ignore_index=True)
                df = df.drop_duplicates()

                logger.info(f"SUCCESS: Downloaded {len(df)} total records for {symbol}")
                return df
            else:
                logger.error(f"ERROR: No data downloaded for {symbol}")
                return None

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
                "columns": list(df.columns),
            }

            logger.info(f"SUCCESS: Processed {symbol} data")
            logger.info(f"Records: {features['total_records']}")
            logger.info(
                f"Date range: {features['date_range']['start']} to {features['date_range']['end']}"
            )
            logger.info(f"Columns: {features['columns']}")

            return df, features

        except Exception as e:
            logger.error(f"ERROR: Failed to process data for {symbol}: {e}")
            return None, None

    async def save_data_to_file(self, df: pd.DataFrame, symbol: str):
        """Save data to file"""
        try:
            filename = f"ml-platform/data/{symbol}_mbp10_data.csv"

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
        logger.info("STARTING REAL DATABENTO DATA DOWNLOAD V3")
        logger.info("=" * 60)

        # Step 1: Connect to Databento
        connected = await self.connect_to_databento()
        if not connected:
            logger.error("FAILED: Cannot connect to Databento")
            return False

        # Step 2: Test symbol availability
        available_symbols = await self.test_symbol_availability()
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

        summary_file = "ml-platform/databento_download_summary_v3.json"
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
    logger.info("REAL DATABENTO CONNECTION V3 LAUNCHER")
    logger.info("=" * 60)

    # Initialize connector
    connector = RealDatabentoConnectorV3()

    # Run full download
    success = await connector.run_full_download()

    if success:
        logger.info("SUCCESS: Real data download completed!")
        logger.info("Ready to train models with real Databento data!")
    else:
        logger.error("FAILED: Data download failed!")


if __name__ == "__main__":
    asyncio.run(main())
