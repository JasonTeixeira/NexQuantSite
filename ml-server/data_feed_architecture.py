"""
NEXURAL TRADING - UNIFIED DATA FEED ARCHITECTURE
Handles all market data sources: Databento, CBOE, Polygon, OPRA
"""

import logging
import os
from datetime import datetime
from pathlib import Path

import databento as db
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataFeedManager:
    """Unified manager for all data feeds"""

    def __init__(self):
        self.feeds = {}
        self.data_dir = Path("data")
        self.historical_dir = self.data_dir / "historical"
        self.live_dir = self.data_dir / "live"
        self.processed_dir = self.data_dir / "processed"

        # Create directories
        for dir in [self.historical_dir, self.live_dir, self.processed_dir]:
            dir.mkdir(parents=True, exist_ok=True)

        # Load API keys
        self.api_keys = self._load_api_keys()

        # Initialize feeds
        self._initialize_feeds()

    def _load_api_keys(self):
        """Load API keys from environment"""
        keys = {}

        # Try to load from api_keys.env
        env_file = Path("api_keys.env")
        if env_file.exists():
            with open(env_file, encoding="utf-8") as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        key, value = line.strip().split("=", 1)
                        keys[key] = value.strip('"').strip("'")

        # Override with environment variables
        keys["DATABENTO_API_KEY"] = os.getenv(
            "DATABENTO_API_KEY", keys.get("DATABENTO_API_KEY", "")
        )
        keys["POLYGON_API_KEY"] = os.getenv("POLYGON_API_KEY", keys.get("POLYGON_API_KEY", ""))
        keys["CBOE_API_KEY"] = os.getenv("CBOE_API_KEY", keys.get("CBOE_API_KEY", ""))

        return keys

    def _initialize_feeds(self):
        """Initialize all data feed connections"""

        # Databento feed
        if self.api_keys.get("DATABENTO_API_KEY"):
            self.feeds["databento"] = DatabentFeed(self.api_keys["DATABENTO_API_KEY"])

        # Polygon feed (for later)
        if self.api_keys.get("POLYGON_API_KEY"):
            self.feeds["polygon"] = PolygonFeed(self.api_keys["POLYGON_API_KEY"])

        # CBOE feed (placeholder)
        if self.api_keys.get("CBOE_API_KEY"):
            self.feeds["cboe"] = CBOEFeed(self.api_keys["CBOE_API_KEY"])

    def get_feed(self, feed_name: str):
        """Get a specific data feed"""
        return self.feeds.get(feed_name)

    def list_feeds(self):
        """List all available feeds"""
        return list(self.feeds.keys())


class DatabentFeed:
    """Databento data feed handler"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = None
        self.live_client = None

        # Futures symbols mapping
        self.symbols = {
            "ES": "ES.FUT",  # E-mini S&P 500
            "NQ": "NQ.FUT",  # E-mini Nasdaq
            "YM": "YM.FUT",  # E-mini Dow
            "RTY": "RTY.FUT",  # E-mini Russell 2000
            "MES": "MES.FUT",  # Micro E-mini S&P 500
            "MNQ": "MNQ.FUT",  # Micro E-mini Nasdaq
            "MYM": "MYM.FUT",  # Micro E-mini Dow
            "M2K": "M2K.FUT",  # Micro E-mini Russell
        }

        if api_key and api_key != "your_databento_api_key_here":
            self._initialize_client()

    def _initialize_client(self):
        """Initialize Databento client"""
        try:
            self.client = db.Historical(key=self.api_key)
            logger.info("✅ Databento Historical client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Databento: {e}")

    def test_connection(self):
        """Test Databento connection"""
        try:
            if not self.client:
                return False, "No API key configured"

            # Try to get metadata
            metadata = self.client.metadata.list_datasets()

            if metadata:
                return True, f"Connected! Available datasets: {len(metadata)}"
            else:
                return False, "Connection failed - no datasets available"

        except Exception as e:
            return False, f"Connection error: {str(e)}"

    def import_historical_files(self, desktop_path: str = None):
        """Import historical MBP-10 data files from desktop"""

        logger.info("📂 Importing historical Databento files...")

        # Default Windows desktop path
        if not desktop_path:
            desktop_path = Path.home() / "Desktop"
        else:
            desktop_path = Path(desktop_path)

        # Look for Databento files
        patterns = [
            "*.csv",
            "*.parquet",
            "*.json",
            "*YM*.csv",
            "*YM*.parquet",
            "*RTY*.csv",
            "*RTY*.parquet",
            "*NQ*.csv",
            "*NQ*.parquet",
            "*ES*.csv",
            "*ES*.parquet",
        ]

        imported_files = []

        for pattern in patterns:
            files = list(desktop_path.glob(pattern))
            for file in files:
                # Check if it's likely a Databento file
                if any(symbol in file.name.upper() for symbol in ["YM", "RTY", "NQ", "ES", "MBP"]):
                    logger.info(f"  Found: {file.name}")
                    imported_files.append(file)

        if not imported_files:
            logger.warning("⚠️  No Databento files found on desktop!")
            logger.info(f"  Searched in: {desktop_path}")
            return []

        logger.info(f"\n✅ Found {len(imported_files)} Databento files")
        return imported_files

    def process_mbp10_file(self, file_path: Path):
        """Process a single MBP-10 data file"""

        logger.info(f"🔧 Processing: {file_path.name}")

        try:
            # Detect file type and load
            if file_path.suffix == ".parquet":
                df = pd.read_parquet(file_path)
            elif file_path.suffix == ".csv":
                df = pd.read_csv(file_path)
            else:
                logger.warning(f"  Unsupported file type: {file_path.suffix}")
                return None

            logger.info(f"  Loaded {len(df):,} rows")

            # Process MBP-10 data structure
            if "ts_event" in df.columns:
                # Databento format detected
                df["timestamp"] = pd.to_datetime(df["ts_event"], unit="ns")
            elif "timestamp" in df.columns:
                df["timestamp"] = pd.to_datetime(df["timestamp"])

            # Extract symbol from filename
            symbol = None
            for sym in ["ES", "NQ", "YM", "RTY"]:
                if sym in file_path.name.upper():
                    symbol = sym
                    break

            if symbol:
                df["symbol"] = symbol

            # Standard columns for MBP-10

            # Save processed data
            output_path = Path("data/processed") / f"{file_path.stem}_processed.parquet"
            df.to_parquet(output_path, index=False)

            logger.info(f"  ✅ Saved to: {output_path}")

            return df

        except Exception as e:
            logger.error(f"  ❌ Error processing {file_path.name}: {e}")
            return None

    async def connect_live_feed(self):
        """Connect to Databento live feed"""

        logger.info("🔴 Connecting to Databento live feed...")

        try:
            self.live_client = db.Live(key=self.api_key)

            # Subscribe to futures
            await self.live_client.subscribe(
                dataset="GLBX.MDP3",
                schema="mbp-10",
                symbols=["ES.FUT", "NQ.FUT", "YM.FUT", "RTY.FUT"],
            )

            logger.info("✅ Live feed connected!")
            return True

        except Exception as e:
            logger.error(f"❌ Live feed connection failed: {e}")
            return False

    async def stream_live_data(self, callback):
        """Stream live market data"""

        if not self.live_client:
            await self.connect_live_feed()

        async for record in self.live_client:
            # Process each record
            processed = self._process_live_record(record)
            if processed:
                await callback(processed)

    def _process_live_record(self, record):
        """Process a single live data record"""

        try:
            # Extract relevant fields
            data = {
                "timestamp": datetime.now(),
                "symbol": record.symbol,
                "bid_price": record.levels[0].bid_px if hasattr(record, "levels") else None,
                "ask_price": record.levels[0].ask_px if hasattr(record, "levels") else None,
                "bid_size": record.levels[0].bid_sz if hasattr(record, "levels") else None,
                "ask_size": record.levels[0].ask_sz if hasattr(record, "levels") else None,
            }

            return data

        except Exception as e:
            logger.error(f"Error processing live record: {e}")
            return None


class PolygonFeed:
    """Polygon data feed handler (placeholder for future)"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        logger.info("📊 Polygon feed initialized (placeholder)")

    def test_connection(self):
        """Test Polygon connection"""
        if self.api_key and self.api_key != "your_polygon_api_key_here":
            return True, "Polygon ready (not yet implemented)"
        return False, "No Polygon API key"


class CBOEFeed:
    """CBOE data feed handler (placeholder for future)"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        logger.info("📊 CBOE feed initialized (placeholder)")

    def test_connection(self):
        """Test CBOE connection"""
        return False, "CBOE feed not yet implemented"


def test_all_feeds():
    """Test all data feed connections"""

    print("=" * 60)
    print("🔌 TESTING DATA FEED CONNECTIONS")
    print("=" * 60)

    manager = DataFeedManager()

    # Test each feed
    results = {}

    for feed_name in ["databento", "polygon", "cboe"]:
        feed = manager.get_feed(feed_name)
        if feed:
            success, message = feed.test_connection()
            results[feed_name] = {"success": success, "message": message}

            if success:
                print(f"✅ {feed_name.upper()}: {message}")
            else:
                print(f"❌ {feed_name.upper()}: {message}")
        else:
            print(f"⚠️  {feed_name.upper()}: Not configured")

    return results


def import_desktop_data():
    """Import historical data from desktop"""

    print("=" * 60)
    print("📂 IMPORTING HISTORICAL DATA FROM DESKTOP")
    print("=" * 60)

    manager = DataFeedManager()
    databento = manager.get_feed("databento")

    if not databento:
        print("❌ Databento feed not initialized!")
        print("Please add DATABENTO_API_KEY to api_keys.env")
        return

    # Import files
    files = databento.import_historical_files()

    if files:
        print(f"\n🔧 Processing {len(files)} files...")

        processed_data = []
        for file in files:
            df = databento.process_mbp10_file(file)
            if df is not None:
                processed_data.append(df)

        if processed_data:
            # Combine all data
            combined = pd.concat(processed_data, ignore_index=True)

            # Save master file
            master_file = Path("data/processed/master_training_data.parquet")
            combined.to_parquet(master_file, index=False)

            print("\n✅ IMPORT COMPLETE!")
            print(f"  Total rows: {len(combined):,}")
            print(f"  Date range: {combined['timestamp'].min()} to {combined['timestamp'].max()}")
            print(f"  Saved to: {master_file}")

            return combined

    return None


if __name__ == "__main__":
    # Test connections
    test_all_feeds()

    # Import desktop data
    print()
    data = import_desktop_data()
