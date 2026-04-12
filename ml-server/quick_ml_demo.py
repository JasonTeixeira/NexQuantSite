"""
NEXURAL TRADING - QUICK ML DEMO
Demonstrates ML training with simulated data
"""

import json
import warnings
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")


def create_simulated_data():
    """Create simulated market data with features"""

    print("📊 Creating simulated market data...")

    # Create directories
    data_dir = Path("data/historical")
    data_dir.mkdir(parents=True, exist_ok=True)

    features_dir = Path("data/features")
    features_dir.mkdir(parents=True, exist_ok=True)

    # Generate time series
    dates = pd.date_range(start="2024-01-01", end="2024-12-31", freq="5min")

    # Generate price data for ES
    np.random.seed(42)

    n_samples = min(50000, len(dates))  # Limit samples for demo

    # Base features
    data = {
        "timestamp": dates[:n_samples],
        "open": 4500 + np.cumsum(np.random.randn(n_samples) * 2),
        "volume": np.random.randint(1000, 10000, n_samples),
    }

    # Add more price data
    data["high"] = data["open"] + np.abs(np.random.randn(n_samples) * 3)
    data["low"] = data["open"] - np.abs(np.random.randn(n_samples) * 3)
    data["close"] = (data["high"] + data["low"]) / 2 + np.random.randn(n_samples)

    df = pd.DataFrame(data)

    # Create simple features
    print("🔧 Creating features...")

    # Price features
    df["returns"] = df["close"].pct_change()
    df["log_returns"] = np.log(df["close"] / df["close"].shift(1))
    df["price_range"] = (df["high"] - df["low"]) / df["close"]
    df["price_position"] = (df["close"] - df["low"]) / (df["high"] - df["low"])

    # Moving averages (simple)
    for period in [5, 10, 20, 50]:
        df[f"sma_{period}"] = df["close"].rolling(period).mean()
        df[f"price_to_sma_{period}"] = df["close"] / df[f"sma_{period}"]

    # Volatility
    df["volatility_5"] = df["returns"].rolling(5).std()
    df["volatility_20"] = df["returns"].rolling(20).std()

    # Volume features
    df["volume_ratio"] = df["volume"] / df["volume"].rolling(20).mean()

    # RSI (simplified)
    def calculate_rsi(prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    df["rsi_14"] = calculate_rsi(df["close"])

    # Time features
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek

    # Target variable (future price direction)
    df["future_return"] = df["close"].shift(-5) / df["close"] - 1
    df["target"] = (df["future_return"] > 0).astype(int)

    # Remove NaN values
    df = df.dropna()

    # Save data
    df.to_csv(features_dir / "demo_features.csv", index=False)

    print(f"✅ Created {len(df):,} samples with {len(df.columns)} features")

    return df


def train_model(df):
    """Train a simple ML model"""

    print("\n🚀 Training ML model...")

    # Select features
    feature_cols = [
        col for col in df.columns if col not in ["timestamp", "target", "future_return"]
    ]

    X = df[feature_cols]
    y = df["target"]

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=False
    )

    print(f"📊 Training samples: {len(X_train):,}")
    print(f"📊 Testing samples: {len(X_test):,}")

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest
    print("\n🌲 Training Random Forest...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)

    model.fit(X_train_scaled, y_train)

    # Evaluate
    train_pred = model.predict(X_train_scaled)
    test_pred = model.predict(X_test_scaled)

    train_accuracy = accuracy_score(y_train, train_pred)
    test_accuracy = accuracy_score(y_test, test_pred)

    print("\n📈 Results:")
    print(f"  Train Accuracy: {train_accuracy:.4f}")
    print(f"  Test Accuracy: {test_accuracy:.4f}")

    # Feature importance
    feature_importance = pd.DataFrame(
        {"feature": feature_cols, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)

    print("\n🎯 Top 10 Important Features:")
    for _i, row in feature_importance.head(10).iterrows():
        print(f"  {row['feature']}: {row['importance']:.4f}")

    # Save model
    models_dir = Path("models/trained")
    models_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, models_dir / "demo_model.pkl")
    joblib.dump(scaler, models_dir / "demo_scaler.pkl")

    # Save metadata
    metadata = {
        "training_date": datetime.now().isoformat(),
        "train_accuracy": float(train_accuracy),
        "test_accuracy": float(test_accuracy),
        "n_features": len(feature_cols),
        "n_samples": len(df),
        "features": feature_cols,
    }

    with open(models_dir / "demo_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n💾 Model saved to: {models_dir}")

    return model, scaler


def simulate_trading(model, scaler, df):
    """Simulate trading with the model"""

    print("\n💰 Simulating trading...")

    # Use last 1000 samples for simulation
    sim_df = df.tail(1000).copy()

    feature_cols = [
        col for col in df.columns if col not in ["timestamp", "target", "future_return"]
    ]

    X_sim = sim_df[feature_cols]
    X_sim_scaled = scaler.transform(X_sim)

    # Get predictions
    predictions = model.predict(X_sim_scaled)
    probabilities = model.predict_proba(X_sim_scaled)[:, 1]

    # Simulate trades
    capital = 100000  # Starting capital
    position = 0
    trades = []

    for i in range(len(sim_df)):
        signal = predictions[i]
        confidence = probabilities[i]

        # Only trade with high confidence
        if confidence > 0.6 and signal == 1 and position == 0:
            # Buy signal
            position = 1
            entry_price = sim_df.iloc[i]["close"]
            trades.append(
                {"type": "BUY", "price": entry_price, "time": sim_df.iloc[i]["timestamp"]}
            )
        elif confidence < 0.4 and position == 1:
            # Sell signal
            position = 0
            exit_price = sim_df.iloc[i]["close"]
            profit = exit_price - entry_price
            capital += profit * 10  # Assume 10 contracts
            trades.append(
                {
                    "type": "SELL",
                    "price": exit_price,
                    "profit": profit,
                    "time": sim_df.iloc[i]["timestamp"],
                }
            )

    # Calculate performance
    if trades:
        winning_trades = [t for t in trades if t.get("profit", 0) > 0]
        losing_trades = [t for t in trades if t.get("profit", 0) <= 0]

        win_rate = len(winning_trades) / (len(winning_trades) + len(losing_trades)) * 100
        total_profit = sum(t.get("profit", 0) * 10 for t in trades)

        print("\n📊 Trading Performance:")
        print(f"  Total Trades: {len(trades) // 2}")
        print(f"  Win Rate: {win_rate:.1f}%")
        print(f"  Total P&L: ${total_profit:,.2f}")
        print(f"  Final Capital: ${capital:,.2f}")
        print(f"  Return: {(capital - 100000) / 100000 * 100:.1f}%")


def main():
    """Run the complete demo"""

    print("=" * 60)
    print("🚀 NEXURAL TRADING - ML DEMO")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Step 1: Create data
    df = create_simulated_data()

    # Step 2: Train model
    model, scaler = train_model(df)

    # Step 3: Simulate trading
    simulate_trading(model, scaler, df)

    print("\n" + "=" * 60)
    print("✅ ML DEMO COMPLETE!")
    print("=" * 60)
    print("\n📊 What we accomplished:")
    print("  1. Created simulated market data")
    print("  2. Generated trading features")
    print("  3. Trained ML model")
    print("  4. Simulated trading strategy")
    print("\n🎯 Next steps for production:")
    print("  1. Connect to real Polygon.io data")
    print("  2. Add more sophisticated features")
    print("  3. Train ensemble models")
    print("  4. Implement risk management")
    print("  5. Deploy to live trading")


if __name__ == "__main__":
    main()
