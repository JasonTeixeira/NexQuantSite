"""
NEXURAL TRADING - TRAIN ML ON DATABENTO DATA
Import 3 years of MBP-10 data and train production models
"""

import json
import logging
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class DatabentModelTrainer:
    """Train ML models on real Databento MBP-10 data"""

    def __init__(self):
        self.desktop_path = Path.home() / "Desktop"
        self.data_dir = Path("data/databento")
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.symbols = ["ES", "NQ", "YM", "RTY"]
        self.found_files = {}

    def find_databento_files(self):
        """Find Databento files on desktop"""

        logger.info("🔍 Searching for Databento files on desktop...")
        logger.info(f"   Looking in: {self.desktop_path}")

        # Search patterns
        patterns = [
            # Common Databento naming patterns
            "*mbp-10*.csv",
            "*mbp-10*.parquet",
            "*MBP10*.csv",
            "*MBP10*.parquet",
            "*mbp_10*.csv",
            "*mbp_10*.parquet",
            # Symbol specific
            "*ES*.csv",
            "*ES*.parquet",
            "*NQ*.csv",
            "*NQ*.parquet",
            "*YM*.csv",
            "*YM*.parquet",
            "*RTY*.csv",
            "*RTY*.parquet",
            # Generic
            "*.csv",
            "*.parquet",
        ]

        all_files = []
        for pattern in patterns:
            files = list(self.desktop_path.glob(pattern))
            all_files.extend(files)

        # Remove duplicates
        all_files = list(set(all_files))

        # Categorize by symbol
        for file in all_files:
            file_upper = file.name.upper()

            # Check if it's a market data file
            if any(term in file_upper for term in ["MBP", "ORDERBOOK", "TRADES", "OHLC"]):
                # Find which symbol
                for symbol in self.symbols:
                    if symbol in file_upper:
                        if symbol not in self.found_files:
                            self.found_files[symbol] = []
                        self.found_files[symbol].append(file)
                        logger.info(f"   ✅ Found {symbol}: {file.name}")
                        break

        # Summary
        if self.found_files:
            logger.info(f"\n📊 Found data for symbols: {list(self.found_files.keys())}")
            for symbol, files in self.found_files.items():
                logger.info(f"   {symbol}: {len(files)} files")
        else:
            logger.warning("⚠️  No Databento files found!")
            logger.info("\n📝 Expected file patterns:")
            logger.info("   - YM_mbp-10_2022-2024.csv")
            logger.info("   - ES_MBP10_data.parquet")
            logger.info("   - NQ-orderbook-mbp10.csv")
            logger.info("   - RTY_market_data.parquet")

        return self.found_files

    def load_mbp10_data(self, file_path: Path):
        """Load and parse MBP-10 data file"""

        logger.info(f"📂 Loading: {file_path.name}")

        try:
            # Load based on file type
            if file_path.suffix == ".parquet":
                df = pd.read_parquet(file_path)
            elif file_path.suffix == ".csv":
                # Try different delimiters
                try:
                    df = pd.read_csv(file_path)
                except:
                    df = pd.read_csv(file_path, delimiter="\t")
            else:
                logger.warning(f"   Unsupported format: {file_path.suffix}")
                return None

            logger.info(f"   Loaded {len(df):,} rows, {len(df.columns)} columns")

            # Show column names for debugging
            logger.info(f"   Columns: {list(df.columns[:10])}...")

            return df

        except Exception as e:
            logger.error(f"   ❌ Error loading {file_path.name}: {e}")
            return None

    def process_mbp10_to_features(self, df, symbol):
        """Convert MBP-10 data to ML features"""

        logger.info(f"🔧 Processing {symbol} MBP-10 data...")

        # Identify timestamp column
        timestamp_cols = ["ts_event", "timestamp", "time", "datetime", "ts_recv"]
        ts_col = None

        for col in timestamp_cols:
            if col in df.columns:
                ts_col = col
                break

        if ts_col:
            # Convert timestamp
            if df[ts_col].dtype == "int64":
                # Likely nanoseconds
                df["timestamp"] = pd.to_datetime(df[ts_col], unit="ns")
            else:
                df["timestamp"] = pd.to_datetime(df[ts_col])
        else:
            # Create index-based timestamp
            logger.warning("   No timestamp found, using index")
            df["timestamp"] = pd.date_range(start="2022-01-01", periods=len(df), freq="1min")

        # Add symbol
        df["symbol"] = symbol

        # Extract MBP-10 features (10 levels of order book)
        features = pd.DataFrame()
        features["timestamp"] = df["timestamp"]
        features["symbol"] = df["symbol"]

        # Look for bid/ask columns
        for level in range(10):
            # Different naming conventions
            bid_cols = [
                f"bid_px_{level}",
                f"bid_price_{level}",
                f"bid{level}_price",
                f"levels[{level}].bid_px",
            ]
            ask_cols = [
                f"ask_px_{level}",
                f"ask_price_{level}",
                f"ask{level}_price",
                f"levels[{level}].ask_px",
            ]
            bid_sz_cols = [
                f"bid_sz_{level}",
                f"bid_size_{level}",
                f"bid{level}_size",
                f"levels[{level}].bid_sz",
            ]
            ask_sz_cols = [
                f"ask_sz_{level}",
                f"ask_size_{level}",
                f"ask{level}_size",
                f"levels[{level}].ask_sz",
            ]

            # Find columns
            for col in bid_cols:
                if col in df.columns:
                    features[f"bid_price_{level}"] = df[col]
                    break

            for col in ask_cols:
                if col in df.columns:
                    features[f"ask_price_{level}"] = df[col]
                    break

            for col in bid_sz_cols:
                if col in df.columns:
                    features[f"bid_size_{level}"] = df[col]
                    break

            for col in ask_sz_cols:
                if col in df.columns:
                    features[f"ask_size_{level}"] = df[col]
                    break

        # Calculate derived features
        if "bid_price_0" in features.columns and "ask_price_0" in features.columns:
            # Mid price
            features["mid_price"] = (features["bid_price_0"] + features["ask_price_0"]) / 2

            # Spread
            features["spread"] = features["ask_price_0"] - features["bid_price_0"]
            features["spread_pct"] = features["spread"] / features["mid_price"]

            # Micro-price (size-weighted)
            if "bid_size_0" in features.columns and "ask_size_0" in features.columns:
                features["micro_price"] = (
                    features["bid_price_0"] * features["ask_size_0"]
                    + features["ask_price_0"] * features["bid_size_0"]
                ) / (features["bid_size_0"] + features["ask_size_0"])

            # Order book imbalance
            if "bid_size_0" in features.columns and "ask_size_0" in features.columns:
                total_size = features["bid_size_0"] + features["ask_size_0"]
                features["book_imbalance"] = (
                    features["bid_size_0"] - features["ask_size_0"]
                ) / total_size

            # Price changes
            features["price_change"] = features["mid_price"].diff()
            features["returns"] = features["mid_price"].pct_change()

            # Volatility
            features["volatility_10"] = features["returns"].rolling(10).std()
            features["volatility_50"] = features["returns"].rolling(50).std()

            # Book depth
            for side in ["bid", "ask"]:
                size_cols = [
                    f"{side}_size_{i}" for i in range(10) if f"{side}_size_{i}" in features.columns
                ]
                if size_cols:
                    features[f"{side}_depth"] = features[size_cols].sum(axis=1)

            # Target variables (for supervised learning)
            features["future_return_1m"] = (
                features["mid_price"].shift(-1) / features["mid_price"] - 1
            )
            features["future_return_5m"] = (
                features["mid_price"].shift(-5) / features["mid_price"] - 1
            )
            features["future_direction"] = (features["future_return_1m"] > 0).astype(int)

            logger.info(f"   ✅ Created {len(features.columns)} features")
        else:
            logger.warning("   ⚠️  Could not find bid/ask prices in data")

        return features

    def combine_all_data(self):
        """Combine all symbol data into training dataset"""

        logger.info("\n📊 Combining all data for training...")

        all_data = []

        for symbol, files in self.found_files.items():
            for file in files[:1]:  # Process first file for each symbol (for demo)
                df = self.load_mbp10_data(file)
                if df is not None:
                    features = self.process_mbp10_to_features(df, symbol)
                    all_data.append(features)

        if all_data:
            combined = pd.concat(all_data, ignore_index=True)

            # Remove NaN values
            combined = combined.dropna()

            # Save
            output_file = self.data_dir / "databento_training_data.parquet"
            combined.to_parquet(output_file, index=False)

            logger.info("\n✅ Training data ready!")
            logger.info(f"   Total samples: {len(combined):,}")
            logger.info(f"   Features: {len(combined.columns)}")
            logger.info(f"   Saved to: {output_file}")

            return combined

        return None

    def train_models(self, data):
        """Train ML models on Databento data"""

        logger.info("\n🚀 Training ML models on real data...")

        import joblib
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        from xgboost import XGBClassifier

        # Select features
        feature_cols = [
            col
            for col in data.columns
            if col
            not in [
                "timestamp",
                "symbol",
                "future_return_1m",
                "future_return_5m",
                "future_direction",
            ]
        ]

        X = data[feature_cols]
        y = data["future_direction"]

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, shuffle=False
        )

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train models
        models = {}

        # Random Forest
        logger.info("\n🌲 Training Random Forest...")
        rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        rf.fit(X_train_scaled, y_train)

        rf_pred = rf.predict(X_test_scaled)
        rf_acc = accuracy_score(y_test, rf_pred)
        logger.info(f"   Accuracy: {rf_acc:.4f}")

        models["random_forest"] = rf

        # XGBoost
        logger.info("\n🚀 Training XGBoost...")
        xgb = XGBClassifier(n_estimators=100, max_depth=6, random_state=42)
        xgb.fit(X_train_scaled, y_train)

        xgb_pred = xgb.predict(X_test_scaled)
        xgb_acc = accuracy_score(y_test, xgb_pred)
        logger.info(f"   Accuracy: {xgb_acc:.4f}")

        models["xgboost"] = xgb

        # Save models
        models_dir = Path("models/databento")
        models_dir.mkdir(parents=True, exist_ok=True)

        for name, model in models.items():
            model_file = models_dir / f"{name}_databento.pkl"
            joblib.dump(model, model_file)
            logger.info(f"   Saved {name} to {model_file}")

        # Save scaler
        joblib.dump(scaler, models_dir / "scaler_databento.pkl")

        # Save metadata
        metadata = {
            "training_date": datetime.now().isoformat(),
            "data_samples": len(data),
            "features": feature_cols,
            "rf_accuracy": float(rf_acc),
            "xgb_accuracy": float(xgb_acc),
        }

        with open(models_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        logger.info("\n✅ Models trained and saved!")

        return models


def main():
    """Main training pipeline"""

    print("=" * 70)
    print("🚀 NEXURAL TRADING - DATABENTO ML TRAINING")
    print("=" * 70)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    trainer = DatabentModelTrainer()

    # Step 1: Find files
    files = trainer.find_databento_files()

    if not files:
        print("\n⚠️  No Databento files found on desktop!")
        print("Please ensure your MBP-10 files are on the desktop")
        print(f"Desktop path: {trainer.desktop_path}")
        return False

    # Step 2: Process and combine data
    data = trainer.combine_all_data()

    if data is None:
        print("\n❌ Could not process data files!")
        return False

    # Step 3: Train models
    models = trainer.train_models(data)

    print("\n" + "=" * 70)
    print("✅ DATABENTO TRAINING COMPLETE!")
    print("=" * 70)
    print("\n📊 Summary:")
    print(f"  - Processed {len(files)} symbols")
    print(f"  - Training samples: {len(data):,}")
    print(f"  - Models trained: {len(models)}")
    print("\n🎯 Next steps:")
    print("  1. Connect live Databento feed")
    print("  2. Run backtesting")
    print("  3. Deploy to production")

    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
