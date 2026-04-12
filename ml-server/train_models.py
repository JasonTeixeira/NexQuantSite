"""
NEXURAL TRADING - ML MODEL TRAINING
Trains multiple ML models for trading signal generation
"""

import json
import warnings
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import RobustScaler

warnings.filterwarnings("ignore")


class ModelTrainer:
    """Trains and evaluates ML models for trading"""

    def __init__(self):
        self.features_dir = Path("data/features")
        self.models_dir = Path("models/trained")
        self.models_dir.mkdir(parents=True, exist_ok=True)

        self.models = {}
        self.scalers = {}
        self.results = {}

    def load_features(self):
        """Load feature data"""

        feature_file = self.features_dir / "ml_features_complete.csv"

        if not feature_file.exists():
            print("❌ No features found! Run feature_engineering.py first.")
            return None

        print(f"📂 Loading features from: {feature_file}")
        df = pd.read_csv(feature_file)
        print(f"📊 Loaded {len(df):,} samples with {len(df.columns)} features")

        return df

    def prepare_data(self, df, target_col="future_direction_5m"):
        """Prepare data for training"""

        print(f"\n🎯 Preparing data for target: {target_col}")

        # Select feature columns (exclude identifiers and targets)
        exclude_cols = ["timestamp", "symbol", "timeframe"] + [
            c for c in df.columns if "future" in c or "signal" in c
        ]

        feature_cols = [c for c in df.columns if c not in exclude_cols]

        # Separate features and target
        X = df[feature_cols].fillna(0)
        y = df[target_col].fillna(0)

        # Remove infinite values
        X = X.replace([np.inf, -np.inf], 0)

        print(f"📊 Features shape: {X.shape}")
        print(f"📊 Target distribution: {y.value_counts().to_dict()}")

        return X, y, feature_cols

    def train_random_forest(self, X_train, y_train, X_val, y_val):
        """Train Random Forest model"""

        print("\n🌲 Training Random Forest...")

        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=50,
            min_samples_leaf=20,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        )

        model.fit(X_train, y_train)

        # Evaluate
        train_pred = model.predict(X_train)
        val_pred = model.predict(X_val)
        val_pred_proba = model.predict_proba(X_val)[:, 1]

        metrics = {
            "train_accuracy": accuracy_score(y_train, train_pred),
            "val_accuracy": accuracy_score(y_val, val_pred),
            "val_precision": precision_score(y_val, val_pred, zero_division=0),
            "val_recall": recall_score(y_val, val_pred, zero_division=0),
            "val_f1": f1_score(y_val, val_pred, zero_division=0),
            "val_auc": roc_auc_score(y_val, val_pred_proba) if len(np.unique(y_val)) > 1 else 0,
        }

        print(f"  Train Accuracy: {metrics['train_accuracy']:.4f}")
        print(f"  Val Accuracy: {metrics['val_accuracy']:.4f}")
        print(f"  Val Precision: {metrics['val_precision']:.4f}")
        print(f"  Val Recall: {metrics['val_recall']:.4f}")
        print(f"  Val F1: {metrics['val_f1']:.4f}")
        print(f"  Val AUC: {metrics['val_auc']:.4f}")

        return model, metrics

    def train_xgboost(self, X_train, y_train, X_val, y_val):
        """Train XGBoost model"""

        print("\n🚀 Training XGBoost...")

        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            use_label_encoder=False,
            eval_metric="logloss",
        )

        model.fit(
            X_train, y_train, eval_set=[(X_val, y_val)], early_stopping_rounds=10, verbose=False
        )

        # Evaluate
        train_pred = model.predict(X_train)
        val_pred = model.predict(X_val)
        val_pred_proba = model.predict_proba(X_val)[:, 1]

        metrics = {
            "train_accuracy": accuracy_score(y_train, train_pred),
            "val_accuracy": accuracy_score(y_val, val_pred),
            "val_precision": precision_score(y_val, val_pred, zero_division=0),
            "val_recall": recall_score(y_val, val_pred, zero_division=0),
            "val_f1": f1_score(y_val, val_pred, zero_division=0),
            "val_auc": roc_auc_score(y_val, val_pred_proba) if len(np.unique(y_val)) > 1 else 0,
        }

        print(f"  Train Accuracy: {metrics['train_accuracy']:.4f}")
        print(f"  Val Accuracy: {metrics['val_accuracy']:.4f}")
        print(f"  Val Precision: {metrics['val_precision']:.4f}")
        print(f"  Val Recall: {metrics['val_recall']:.4f}")
        print(f"  Val F1: {metrics['val_f1']:.4f}")
        print(f"  Val AUC: {metrics['val_auc']:.4f}")

        return model, metrics

    def train_neural_network(self, X_train, y_train, X_val, y_val):
        """Train Neural Network model"""

        print("\n🧠 Training Neural Network...")

        model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation="relu",
            solver="adam",
            learning_rate_init=0.001,
            max_iter=100,
            early_stopping=True,
            validation_fraction=0.1,
            random_state=42,
        )

        model.fit(X_train, y_train)

        # Evaluate
        train_pred = model.predict(X_train)
        val_pred = model.predict(X_val)
        val_pred_proba = model.predict_proba(X_val)[:, 1]

        metrics = {
            "train_accuracy": accuracy_score(y_train, train_pred),
            "val_accuracy": accuracy_score(y_val, val_pred),
            "val_precision": precision_score(y_val, val_pred, zero_division=0),
            "val_recall": recall_score(y_val, val_pred, zero_division=0),
            "val_f1": f1_score(y_val, val_pred, zero_division=0),
            "val_auc": roc_auc_score(y_val, val_pred_proba) if len(np.unique(y_val)) > 1 else 0,
        }

        print(f"  Train Accuracy: {metrics['train_accuracy']:.4f}")
        print(f"  Val Accuracy: {metrics['val_accuracy']:.4f}")
        print(f"  Val Precision: {metrics['val_precision']:.4f}")
        print(f"  Val Recall: {metrics['val_recall']:.4f}")
        print(f"  Val F1: {metrics['val_f1']:.4f}")
        print(f"  Val AUC: {metrics['val_auc']:.4f}")

        return model, metrics

    def train_ensemble(self, models, X_val, y_val):
        """Create ensemble predictions"""

        print("\n🎭 Creating Ensemble Model...")

        # Get predictions from all models
        predictions = []
        for _name, model in models.items():
            pred_proba = model.predict_proba(X_val)[:, 1]
            predictions.append(pred_proba)

        # Average predictions
        ensemble_pred_proba = np.mean(predictions, axis=0)
        ensemble_pred = (ensemble_pred_proba > 0.5).astype(int)

        # Evaluate ensemble
        metrics = {
            "val_accuracy": accuracy_score(y_val, ensemble_pred),
            "val_precision": precision_score(y_val, ensemble_pred, zero_division=0),
            "val_recall": recall_score(y_val, ensemble_pred, zero_division=0),
            "val_f1": f1_score(y_val, ensemble_pred, zero_division=0),
            "val_auc": (
                roc_auc_score(y_val, ensemble_pred_proba) if len(np.unique(y_val)) > 1 else 0
            ),
        }

        print(f"  Ensemble Accuracy: {metrics['val_accuracy']:.4f}")
        print(f"  Ensemble Precision: {metrics['val_precision']:.4f}")
        print(f"  Ensemble Recall: {metrics['val_recall']:.4f}")
        print(f"  Ensemble F1: {metrics['val_f1']:.4f}")
        print(f"  Ensemble AUC: {metrics['val_auc']:.4f}")

        return metrics

    def save_models(self):
        """Save trained models and metadata"""

        print("\n💾 Saving models...")

        # Save each model
        for name, model in self.models.items():
            model_file = self.models_dir / f"{name}_model.pkl"
            joblib.dump(model, model_file)
            print(f"  ✅ Saved {name} to {model_file}")

        # Save scalers
        for name, scaler in self.scalers.items():
            scaler_file = self.models_dir / f"{name}_scaler.pkl"
            joblib.dump(scaler, scaler_file)
            print(f"  ✅ Saved {name} scaler to {scaler_file}")

        # Save metadata
        metadata = {
            "training_date": datetime.now().isoformat(),
            "models": list(self.models.keys()),
            "results": self.results,
            "features": self.feature_cols,
        }

        metadata_file = self.models_dir / "model_metadata.json"
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2, default=str)

        print(f"  ✅ Saved metadata to {metadata_file}")

    def train_all_models(self):
        """Train all models"""

        print("=" * 60)
        print("🚀 TRAINING ML MODELS")
        print("=" * 60)

        # Load features
        df = self.load_features()
        if df is None:
            return False

        # Prepare data for different prediction horizons
        targets = ["future_direction_5m", "future_direction_15m", "future_direction_30m"]

        for target in targets:
            if target not in df.columns:
                print(f"⚠️  Target {target} not found, skipping...")
                continue

            print(f"\n{'='*60}")
            print(f"📊 Training for target: {target}")
            print(f"{'='*60}")

            # Prepare data
            X, y, self.feature_cols = self.prepare_data(df, target)

            # Split data (time-based for financial data)
            split_idx = int(len(X) * 0.8)
            X_train = X[:split_idx]
            y_train = y[:split_idx]
            X_val = X[split_idx:]
            y_val = y[split_idx:]

            print(f"\n📊 Train samples: {len(X_train):,}")
            print(f"📊 Validation samples: {len(X_val):,}")

            # Scale features
            scaler = RobustScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_val_scaled = scaler.transform(X_val)

            # Store scaler
            self.scalers[target] = scaler

            # Train models
            models_for_target = {}
            results_for_target = {}

            # Random Forest
            rf_model, rf_metrics = self.train_random_forest(
                X_train_scaled, y_train, X_val_scaled, y_val
            )
            models_for_target["random_forest"] = rf_model
            results_for_target["random_forest"] = rf_metrics

            # XGBoost
            xgb_model, xgb_metrics = self.train_xgboost(
                X_train_scaled, y_train, X_val_scaled, y_val
            )
            models_for_target["xgboost"] = xgb_model
            results_for_target["xgboost"] = xgb_metrics

            # Neural Network
            nn_model, nn_metrics = self.train_neural_network(
                X_train_scaled, y_train, X_val_scaled, y_val
            )
            models_for_target["neural_network"] = nn_model
            results_for_target["neural_network"] = nn_metrics

            # Ensemble
            ensemble_metrics = self.train_ensemble(models_for_target, X_val_scaled, y_val)
            results_for_target["ensemble"] = ensemble_metrics

            # Store models and results
            for model_name, model in models_for_target.items():
                self.models[f"{target}_{model_name}"] = model

            self.results[target] = results_for_target

        # Save all models
        self.save_models()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TRAINING SUMMARY")
        print("=" * 60)

        for target, results in self.results.items():
            print(f"\n📈 {target}:")
            best_model = max(results.items(), key=lambda x: x[1].get("val_f1", 0))
            print(f"  Best Model: {best_model[0]}")
            print(f"  Best F1 Score: {best_model[1].get('val_f1', 0):.4f}")

        print("\n" + "=" * 60)
        print("✅ MODEL TRAINING COMPLETE!")
        print("=" * 60)
        print(f"\n📁 Models saved to: {self.models_dir}")
        print("\nNext steps:")
        print("1. Run backtest_strategies.py to test performance")
        print("2. Run deploy_models.py to deploy to production")

        return True


def main():
    """Main entry point"""

    trainer = ModelTrainer()
    success = trainer.train_all_models()

    return success


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)
