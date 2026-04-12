"""
NEXURAL TRADING - COMPLETE ML PIPELINE RUNNER
Runs the entire ML training pipeline from data download to model deployment
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path


def print_header(title):
    """Print formatted header"""
    print("\n" + "=" * 70)
    print(f"🚀 {title}")
    print("=" * 70)


async def run_data_download():
    """Step 1: Download historical data"""
    print_header("STEP 1: DOWNLOADING HISTORICAL DATA")

    try:
        # Import and run the downloader
        from download_historical_data import PolygonDataDownloader

        downloader = PolygonDataDownloader()

        # Check API key
        if downloader.api_key == "demo" or not downloader.api_key:
            print("⚠️  WARNING: No valid Polygon API key found!")
            print("📝 Please add POLYGON_API_KEY to api_keys.env")
            print("🔗 Get your free API key at: https://polygon.io/")
            print("\n⏸️  Using simulated data for demo...")

            # Create simulated data for demo
            create_simulated_data()
            return True

        # Download real data
        success = await downloader.download_all_symbols(days_back=30)

        if success:
            # Create training dataset
            dataset = downloader.create_training_dataset()
            if dataset is not None:
                print("✅ Data download complete!")
                return True

        print("❌ Data download failed!")
        return False

    except Exception as e:
        print(f"❌ Error in data download: {str(e)}")
        return False


def create_simulated_data():
    """Create simulated data for demo/testing"""
    import numpy as np
    import pandas as pd

    print("\n📊 Creating simulated data for testing...")

    data_dir = Path("data/historical")
    data_dir.mkdir(parents=True, exist_ok=True)

    # Create simulated data
    dates = pd.date_range(start="2024-01-01", end="2024-12-31", freq="5min")

    all_data = []

    for symbol in ["ES", "NQ", "YM", "RTY"]:
        # Generate random price data
        base_price = {"ES": 4500, "NQ": 15000, "YM": 35000, "RTY": 2000}[symbol]

        prices = []
        current_price = base_price

        for _ in range(len(dates)):
            # Random walk
            change = np.random.randn() * base_price * 0.001
            current_price += change

            # OHLC data
            open_price = current_price + np.random.randn() * base_price * 0.0002
            high = max(current_price, open_price) + abs(np.random.randn() * base_price * 0.0003)
            low = min(current_price, open_price) - abs(np.random.randn() * base_price * 0.0003)
            close = current_price

            prices.append(
                {
                    "timestamp": _,
                    "open": open_price,
                    "high": high,
                    "low": low,
                    "close": close,
                    "volume": np.random.randint(1000, 10000),
                    "symbol": symbol,
                    "timeframe": "5min",
                }
            )

        symbol_df = pd.DataFrame(prices)
        symbol_df["timestamp"] = dates[: len(symbol_df)]
        all_data.append(symbol_df)

    # Combine and save
    combined_df = pd.concat(all_data, ignore_index=True)
    output_file = data_dir / "training_data_combined.csv"
    combined_df.to_csv(output_file, index=False)

    print(f"✅ Created simulated data: {len(combined_df):,} rows")
    print(f"💾 Saved to: {output_file}")


def run_feature_engineering():
    """Step 2: Feature engineering"""
    print_header("STEP 2: FEATURE ENGINEERING")

    try:
        from feature_engineering import FeatureEngineer

        engineer = FeatureEngineer()
        features_df = engineer.process_data()

        if features_df is not None:
            print("✅ Feature engineering complete!")
            return True

        print("❌ Feature engineering failed!")
        return False

    except ImportError as e:
        print(f"⚠️  Missing dependency: {str(e)}")
        print("📦 Installing required packages...")

        # Install missing packages
        os.system("pip install talib-binary pandas numpy scikit-learn")

        # Try again
        try:
            from feature_engineering import FeatureEngineer

            engineer = FeatureEngineer()
            features_df = engineer.process_data()

            if features_df is not None:
                print("✅ Feature engineering complete!")
                return True
        except:
            pass

        print("❌ Feature engineering failed!")
        return False

    except Exception as e:
        print(f"❌ Error in feature engineering: {str(e)}")
        return False


def run_model_training():
    """Step 3: Train ML models"""
    print_header("STEP 3: TRAINING ML MODELS")

    try:
        from train_models import ModelTrainer

        trainer = ModelTrainer()
        success = trainer.train_all_models()

        if success:
            print("✅ Model training complete!")
            return True

        print("❌ Model training failed!")
        return False

    except ImportError as e:
        print(f"⚠️  Missing dependency: {str(e)}")
        print("📦 Installing required packages...")

        # Install missing packages
        os.system("pip install xgboost scikit-learn joblib")

        # Try again
        try:
            from train_models import ModelTrainer

            trainer = ModelTrainer()
            success = trainer.train_all_models()

            if success:
                print("✅ Model training complete!")
                return True
        except:
            pass

        print("❌ Model training failed!")
        return False

    except Exception as e:
        print(f"❌ Error in model training: {str(e)}")
        return False


def check_ml_status():
    """Check the status of ML models"""
    print_header("ML SYSTEM STATUS CHECK")

    status = {
        "data_downloaded": False,
        "features_created": False,
        "models_trained": False,
        "models_deployed": False,
    }

    # Check data
    data_file = Path("data/historical/training_data_combined.csv")
    if data_file.exists():
        status["data_downloaded"] = True
        print(f"✅ Training data found: {data_file}")
    else:
        print("❌ No training data found")

    # Check features
    features_file = Path("data/features/ml_features_complete.csv")
    if features_file.exists():
        status["features_created"] = True
        print(f"✅ Features found: {features_file}")
    else:
        print("❌ No features found")

    # Check models
    models_dir = Path("models/trained")
    if models_dir.exists() and list(models_dir.glob("*.pkl")):
        status["models_trained"] = True
        model_count = len(list(models_dir.glob("*.pkl")))
        print(f"✅ Models found: {model_count} models in {models_dir}")
    else:
        print("❌ No trained models found")

    # Check deployment
    if Path("models/production").exists():
        status["models_deployed"] = True
        print("✅ Models deployed to production")
    else:
        print("❌ Models not deployed")

    # Calculate completion
    completion = sum(status.values()) / len(status) * 100

    print(f"\n🎯 ML System Completion: {completion:.0f}%")

    return status


async def main():
    """Main pipeline runner"""

    print("=" * 70)
    print("🚀 NEXURAL TRADING - ML TRAINING PIPELINE")
    print("=" * 70)
    print(f"📅 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Check current status
    initial_status = check_ml_status()

    # Step 1: Download data (if needed)
    if not initial_status["data_downloaded"]:
        success = await run_data_download()
        if not success:
            print("\n⚠️  Continuing with simulated data...")
    else:
        print("\n✅ Data already downloaded, skipping...")

    # Step 2: Feature engineering (if needed)
    if not initial_status["features_created"]:
        success = run_feature_engineering()
        if not success:
            print("\n❌ Cannot continue without features!")
            return False
    else:
        print("\n✅ Features already created, skipping...")

    # Step 3: Train models (if needed)
    if not initial_status["models_trained"]:
        success = run_model_training()
        if not success:
            print("\n❌ Model training failed!")
            return False
    else:
        print("\n✅ Models already trained, skipping...")

    # Final status check
    print_header("FINAL STATUS")
    final_status = check_ml_status()

    if all(final_status.values()):
        print("\n" + "=" * 70)
        print("🎉 ML PIPELINE COMPLETE!")
        print("=" * 70)
        print("\n✅ Your ML models are trained and ready!")
        print("📊 Next steps:")
        print("  1. Run backtest to validate performance")
        print("  2. Connect to live data feed")
        print("  3. Deploy to production")
        return True
    else:
        print("\n⚠️  ML pipeline partially complete")
        print("Run this script again to complete remaining steps")
        return False


if __name__ == "__main__":
    # Run the async main function
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
