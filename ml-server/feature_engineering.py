"""
NEXURAL TRADING - FEATURE ENGINEERING PIPELINE
Creates technical indicators and ML features from market data
"""

import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import talib

warnings.filterwarnings("ignore")


class FeatureEngineer:
    """Creates features for ML models from market data"""

    def __init__(self):
        self.data_dir = Path("data/historical")
        self.features_dir = Path("data/features")
        self.features_dir.mkdir(parents=True, exist_ok=True)

    def create_technical_indicators(self, df):
        """Create technical indicators as features"""

        print("📊 Creating technical indicators...")

        # Price-based features
        df["returns"] = df["close"].pct_change()
        df["log_returns"] = np.log(df["close"] / df["close"].shift(1))
        df["price_range"] = (df["high"] - df["low"]) / df["close"]
        df["price_position"] = (df["close"] - df["low"]) / (df["high"] - df["low"])

        # Volume features
        df["volume_ratio"] = df["volume"] / df["volume"].rolling(20).mean()
        df["volume_trend"] = df["volume"].rolling(5).mean() / df["volume"].rolling(20).mean()

        # Moving averages
        for period in [5, 10, 20, 50, 100, 200]:
            df[f"sma_{period}"] = talib.SMA(df["close"], timeperiod=period)
            df[f"ema_{period}"] = talib.EMA(df["close"], timeperiod=period)
            df[f"price_to_sma_{period}"] = df["close"] / df[f"sma_{period}"]

        # RSI
        for period in [7, 14, 21]:
            df[f"rsi_{period}"] = talib.RSI(df["close"], timeperiod=period)

        # MACD
        macd, macd_signal, macd_hist = talib.MACD(df["close"])
        df["macd"] = macd
        df["macd_signal"] = macd_signal
        df["macd_histogram"] = macd_hist

        # Bollinger Bands
        upper, middle, lower = talib.BBANDS(df["close"], timeperiod=20)
        df["bb_upper"] = upper
        df["bb_middle"] = middle
        df["bb_lower"] = lower
        df["bb_position"] = (df["close"] - lower) / (upper - lower)
        df["bb_width"] = (upper - lower) / middle

        # Stochastic
        slowk, slowd = talib.STOCH(df["high"], df["low"], df["close"])
        df["stoch_k"] = slowk
        df["stoch_d"] = slowd

        # ATR (Average True Range)
        for period in [7, 14, 21]:
            df[f"atr_{period}"] = talib.ATR(df["high"], df["low"], df["close"], timeperiod=period)
            df[f"atr_ratio_{period}"] = df[f"atr_{period}"] / df["close"]

        # ADX (Average Directional Index)
        df["adx"] = talib.ADX(df["high"], df["low"], df["close"])
        df["plus_di"] = talib.PLUS_DI(df["high"], df["low"], df["close"])
        df["minus_di"] = talib.MINUS_DI(df["high"], df["low"], df["close"])

        # CCI (Commodity Channel Index)
        df["cci"] = talib.CCI(df["high"], df["low"], df["close"])

        # Williams %R
        df["willr"] = talib.WILLR(df["high"], df["low"], df["close"])

        # OBV (On Balance Volume)
        df["obv"] = talib.OBV(df["close"], df["volume"])
        df["obv_trend"] = df["obv"].pct_change(periods=5)

        # MFI (Money Flow Index)
        df["mfi"] = talib.MFI(df["high"], df["low"], df["close"], df["volume"])

        return df

    def create_market_microstructure_features(self, df):
        """Create market microstructure features"""

        print("🔬 Creating market microstructure features...")

        # Spread and liquidity
        df["spread"] = df["high"] - df["low"]
        df["spread_pct"] = df["spread"] / df["close"]
        df["spread_ma"] = df["spread"].rolling(20).mean()

        # Price efficiency
        df["price_efficiency"] = abs(df["close"] - df["open"]) / df["spread"]

        # Volume profile
        df["volume_profile"] = df["volume"] * df["close"]  # Dollar volume
        df["volume_imbalance"] = df["volume"].diff()

        # Volatility features
        df["volatility_5m"] = df["returns"].rolling(5).std()
        df["volatility_15m"] = df["returns"].rolling(15).std()
        df["volatility_60m"] = df["returns"].rolling(60).std()
        df["volatility_ratio"] = df["volatility_5m"] / df["volatility_60m"]

        # Price action patterns
        df["higher_high"] = (df["high"] > df["high"].shift(1)).astype(int)
        df["lower_low"] = (df["low"] < df["low"].shift(1)).astype(int)
        df["inside_bar"] = (
            (df["high"] <= df["high"].shift(1)) & (df["low"] >= df["low"].shift(1))
        ).astype(int)

        # Support/Resistance levels
        df["resistance_20"] = df["high"].rolling(20).max()
        df["support_20"] = df["low"].rolling(20).min()
        df["price_to_resistance"] = df["close"] / df["resistance_20"]
        df["price_to_support"] = df["close"] / df["support_20"]

        return df

    def create_time_features(self, df):
        """Create time-based features"""

        print("📅 Creating time features...")

        # Parse timestamp if string
        if df["timestamp"].dtype == "object":
            df["timestamp"] = pd.to_datetime(df["timestamp"])

        # Time features
        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["day_of_month"] = df["timestamp"].dt.day
        df["month"] = df["timestamp"].dt.month
        df["quarter"] = df["timestamp"].dt.quarter

        # Trading session features
        df["is_market_open"] = ((df["hour"] >= 9) & (df["hour"] < 16)).astype(int)
        df["is_pre_market"] = ((df["hour"] >= 4) & (df["hour"] < 9)).astype(int)
        df["is_after_hours"] = ((df["hour"] >= 16) & (df["hour"] < 20)).astype(int)

        # Session transitions
        df["session_start"] = ((df["hour"] == 9) & (df["timestamp"].dt.minute < 30)).astype(int)
        df["session_end"] = ((df["hour"] == 15) & (df["timestamp"].dt.minute >= 30)).astype(int)

        # Cyclical encoding for time
        df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
        df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
        df["day_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
        df["day_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)

        return df

    def create_target_variables(self, df):
        """Create target variables for ML training"""

        print("🎯 Creating target variables...")

        # Future returns (what we're trying to predict)
        for horizon in [1, 5, 15, 30, 60]:  # minutes
            df[f"future_return_{horizon}m"] = df["close"].shift(-horizon) / df["close"] - 1
            df[f"future_direction_{horizon}m"] = (df[f"future_return_{horizon}m"] > 0).astype(int)

        # Price targets
        df["future_high_5m"] = df["high"].rolling(5).max().shift(-5)
        df["future_low_5m"] = df["low"].rolling(5).min().shift(-5)

        # Risk/Reward ratios
        df["max_profit_5m"] = (df["future_high_5m"] - df["close"]) / df["close"]
        df["max_loss_5m"] = (df["close"] - df["future_low_5m"]) / df["close"]
        df["risk_reward_ratio"] = df["max_profit_5m"] / df["max_loss_5m"]

        # Trading signals
        df["signal_long"] = ((df["future_return_5m"] > 0.001) & (df["max_loss_5m"] < 0.002)).astype(
            int
        )
        df["signal_short"] = (
            (df["future_return_5m"] < -0.001) & (df["max_profit_5m"] < 0.002)
        ).astype(int)
        df["signal_hold"] = (abs(df["future_return_5m"]) < 0.0005).astype(int)

        return df

    def process_data(self):
        """Process all data files and create features"""

        print("=" * 60)
        print("🔧 FEATURE ENGINEERING PIPELINE")
        print("=" * 60)

        # Load combined training data
        input_file = self.data_dir / "training_data_combined.csv"

        if not input_file.exists():
            print("❌ No training data found! Run download_historical_data.py first.")
            return None

        print(f"📂 Loading data from: {input_file}")
        df = pd.read_csv(input_file)
        print(f"📊 Loaded {len(df):,} rows")

        # Create features for each symbol
        all_features = []

        for symbol in df["symbol"].unique():
            print(f"\n🎯 Processing {symbol}...")

            # Filter data for this symbol
            symbol_df = df[df["symbol"] == symbol].copy()

            # Sort by timestamp
            symbol_df = symbol_df.sort_values("timestamp")

            # Create all features
            symbol_df = self.create_technical_indicators(symbol_df)
            symbol_df = self.create_market_microstructure_features(symbol_df)
            symbol_df = self.create_time_features(symbol_df)
            symbol_df = self.create_target_variables(symbol_df)

            all_features.append(symbol_df)

            print(f"✅ Created {len(symbol_df.columns)} features for {symbol}")

        # Combine all processed data
        final_df = pd.concat(all_features, ignore_index=True)

        # Remove rows with NaN values (from indicators that need history)
        before_clean = len(final_df)
        final_df = final_df.dropna()
        after_clean = len(final_df)

        print(f"\n🧹 Cleaned data: {before_clean:,} -> {after_clean:,} rows")

        # Save processed features
        output_file = self.features_dir / "ml_features_complete.csv"
        final_df.to_csv(output_file, index=False)

        print(f"\n💾 Saved features to: {output_file}")

        # Feature summary
        print("\n📊 Feature Summary:")
        print(f"  - Total features: {len(final_df.columns)}")
        print(f"  - Total samples: {len(final_df):,}")
        print(f"  - Memory usage: {final_df.memory_usage().sum() / 1024**2:.2f} MB")

        # List feature categories
        feature_types = {
            "Price": [
                c for c in final_df.columns if "price" in c.lower() or "close" in c or "open" in c
            ],
            "Volume": [c for c in final_df.columns if "volume" in c.lower()],
            "Technical": [
                c
                for c in final_df.columns
                if any(ind in c for ind in ["rsi", "macd", "bb", "sma", "ema"])
            ],
            "Volatility": [c for c in final_df.columns if "volatility" in c or "atr" in c],
            "Time": [
                c
                for c in final_df.columns
                if any(t in c for t in ["hour", "day", "month", "session"])
            ],
            "Targets": [c for c in final_df.columns if "future" in c or "signal" in c],
        }

        print("\n📋 Feature Categories:")
        for category, features in feature_types.items():
            print(f"  - {category}: {len(features)} features")

        return final_df


def main():
    """Main entry point"""

    engineer = FeatureEngineer()
    features_df = engineer.process_data()

    if features_df is not None:
        print("\n=" * 60)
        print("✅ FEATURE ENGINEERING COMPLETE!")
        print("=" * 60)
        print("\nNext step: Run train_models.py to train ML models")
        return True

    return False


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)
