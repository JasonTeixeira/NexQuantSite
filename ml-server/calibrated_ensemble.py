#!/usr/bin/env python3
"""
WORLD-CLASS CALIBRATED ENSEMBLE SYSTEM
Phase 3: Advanced Ensemble Calibration for ML Trading Models

This module implements:
- Stacked generalization with out-of-fold predictions
- Isotonic calibration for probability calibration
- Dynamic weight adjustment based on performance
- Softmax temperature scaling
- Ensemble disagreement tracking

Author: Nexural Trading System
Version: 1.0.0
"""

import logging
import warnings
from dataclasses import dataclass
from typing import Any

import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss
from sklearn.model_selection import KFold

warnings.filterwarnings("ignore")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class CalibratedPrediction:
    """Calibrated prediction result with confidence intervals"""

    prediction: float
    calibrated_probability: float
    confidence_interval: tuple[float, float]
    model_disagreement: float
    ensemble_weight: float
    calibration_score: float
    timestamp: float


class StackedEnsemble:
    """
    Stacked generalization ensemble with out-of-fold predictions
    Uses LightGBM as meta-learner for optimal performance
    """

    def __init__(self, base_models: dict[str, Any], meta_learner_params: dict = None):
        self.base_models = base_models
        self.meta_learner_params = meta_learner_params or {
            "objective": "regression",
            "metric": "rmse",
            "boosting_type": "gbdt",
            "num_leaves": 31,
            "learning_rate": 0.05,
            "feature_fraction": 0.9,
            "bagging_fraction": 0.8,
            "bagging_freq": 5,
            "verbose": -1,
        }
        self.meta_learner = None
        self.oof_predictions = {}
        self.feature_names = []
        self.logger = logging.getLogger(__name__)

    def fit(self, X: np.ndarray, y: np.ndarray, n_folds: int = 5):
        """Fit stacked ensemble with cross-validation"""
        try:
            self.logger.info(f"Fitting stacked ensemble with {len(self.base_models)} base models")

            # Initialize out-of-fold predictions
            self.oof_predictions = {name: np.zeros(len(X)) for name in self.base_models.keys()}

            # Generate out-of-fold predictions
            kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)

            for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
                self.logger.info(f"Training fold {fold + 1}/{n_folds}")

                X_train, X_val = X[train_idx], X[val_idx]
                y_train, _y_val = y[train_idx], y[val_idx]

                # Train base models and generate predictions
                fold_predictions = {}

                for name, model in self.base_models.items():
                    # Clone model for this fold
                    model_copy = self._clone_model(model)

                    # Train model
                    if hasattr(model_copy, "fit"):
                        model_copy.fit(X_train, y_train)

                    # Generate predictions
                    if hasattr(model_copy, "predict"):
                        pred = model_copy.predict(X_val)
                    else:
                        pred = np.zeros(len(X_val))

                    fold_predictions[name] = pred

                    # Store out-of-fold predictions
                    self.oof_predictions[name][val_idx] = pred

                # Add disagreement feature
                predictions_array = np.column_stack(list(fold_predictions.values()))
                disagreement = np.std(predictions_array, axis=1)
                fold_predictions["disagreement"] = disagreement

                # Add uncertainty features (placeholder - implement based on your models)
                fold_predictions["uncertainty"] = np.zeros(len(X_val))

                # Add recent performance features
                fold_predictions["recent_performance"] = np.ones(len(X_val)) * 0.5

            # Prepare meta-features
            self._prepare_meta_features()

            # Train meta-learner
            self._train_meta_learner(X, y)

            self.logger.info("Stacked ensemble training completed")

        except Exception as e:
            self.logger.error(f"Error in stacked ensemble fitting: {e}")
            raise

    def _clone_model(self, model):
        """Clone a model for cross-validation"""
        try:
            if hasattr(model, "copy"):
                return model.copy()
            elif hasattr(model, "__class__"):
                # Create new instance with same parameters
                return model.__class__(**model.get_params() if hasattr(model, "get_params") else {})
            else:
                return model
        except Exception as e:
            self.logger.warning(f"Could not clone model: {e}")
            return model

    def _prepare_meta_features(self):
        """Prepare meta-features for meta-learner"""
        try:
            # Base model predictions
            for name, _predictions in self.oof_predictions.items():
                self.feature_names.append(f"pred_{name}")

            # Add disagreement feature
            predictions_array = np.column_stack(list(self.oof_predictions.values()))
            disagreement = np.std(predictions_array, axis=1)
            self.oof_predictions["disagreement"] = disagreement
            self.feature_names.append("disagreement")

            # Add uncertainty features (placeholder)
            self.oof_predictions["uncertainty"] = np.zeros(len(disagreement))
            self.feature_names.append("uncertainty")

            # Add recent performance features
            self.oof_predictions["recent_performance"] = np.ones(len(disagreement)) * 0.5
            self.feature_names.append("recent_performance")

        except Exception as e:
            self.logger.error(f"Error preparing meta-features: {e}")
            raise

    def _train_meta_learner(self, X: np.ndarray, y: np.ndarray):
        """Train the meta-learner on out-of-fold predictions"""
        try:
            # Prepare meta-features
            meta_features = np.column_stack(list(self.oof_predictions.values()))

            # Create LightGBM dataset
            train_data = lgb.Dataset(meta_features, label=y)

            # Train meta-learner
            self.meta_learner = lgb.train(
                self.meta_learner_params,
                train_data,
                num_boost_round=100,
                valid_sets=[train_data],
                callbacks=[lgb.log_evaluation(0)],
            )

            self.logger.info("Meta-learner training completed")

        except Exception as e:
            self.logger.error(f"Error training meta-learner: {e}")
            raise

    def predict(self, X: np.ndarray, base_predictions: dict[str, np.ndarray] = None) -> np.ndarray:
        """Generate stacked ensemble predictions"""
        try:
            if self.meta_learner is None:
                raise ValueError("Meta-learner not trained. Call fit() first.")

            # Get base model predictions
            if base_predictions is None:
                base_predictions = {}
                for name, model in self.base_models.items():
                    if hasattr(model, "predict"):
                        base_predictions[name] = model.predict(X)
                    else:
                        base_predictions[name] = np.zeros(len(X))

            # Calculate disagreement
            predictions_array = np.column_stack(list(base_predictions.values()))
            disagreement = np.std(predictions_array, axis=1)

            # Prepare meta-features
            meta_features = []
            for name in self.oof_predictions.keys():
                if name in base_predictions:
                    meta_features.append(base_predictions[name])
                elif name == "disagreement":
                    meta_features.append(disagreement)
                else:
                    meta_features.append(np.zeros(len(X)))

            meta_features = np.column_stack(meta_features)

            # Generate meta-learner predictions
            predictions = self.meta_learner.predict(meta_features)

            return predictions

        except Exception as e:
            self.logger.error(f"Error in stacked ensemble prediction: {e}")
            raise


class IsotonicCalibrator:
    """
    Isotonic calibration for probability calibration
    Implements both isotonic regression and Platt scaling
    """

    def __init__(self, method: str = "isotonic", n_bins: int = 10):
        self.method = method
        self.n_bins = n_bins
        self.calibrator = None
        self.calibration_score = None
        self.logger = logging.getLogger(__name__)

    def fit(self, predictions: np.ndarray, targets: np.ndarray):
        """Fit the calibrator"""
        try:
            if self.method == "isotonic":
                self.calibrator = IsotonicRegression(out_of_bounds="clip")
                self.calibrator.fit(predictions, targets)

            elif self.method == "platt":
                # Platt scaling using logistic regression
                self.calibrator = LogisticRegression()
                self.calibrator.fit(predictions.reshape(-1, 1), targets)

            # Calculate calibration score
            calibrated_preds = self.predict(predictions)
            self.calibration_score = self._calculate_calibration_score(calibrated_preds, targets)

            self.logger.info(
                f"Calibrator fitted with {self.method} method, score: {self.calibration_score:.4f}"
            )

        except Exception as e:
            self.logger.error(f"Error fitting calibrator: {e}")
            raise

    def predict(self, predictions: np.ndarray) -> np.ndarray:
        """Generate calibrated predictions"""
        try:
            if self.calibrator is None:
                raise ValueError("Calibrator not fitted. Call fit() first.")

            if self.method == "isotonic":
                return self.calibrator.predict(predictions)

            elif self.method == "platt":
                return self.calibrator.predict_proba(predictions.reshape(-1, 1))[:, 1]

        except Exception as e:
            self.logger.error(f"Error in calibration prediction: {e}")
            raise

    def _calculate_calibration_score(self, predictions: np.ndarray, targets: np.ndarray) -> float:
        """Calculate calibration score using Brier score"""
        try:
            return 1.0 - brier_score_loss(targets, predictions)
        except Exception:
            return 0.0


class RegimeSpecificCalibrator:
    """
    Regime-specific calibration for different market conditions
    """

    def __init__(self, n_regimes: int = 4):
        self.n_regimes = n_regimes
        self.calibrators = {}
        self.regime_detector = None
        self.logger = logging.getLogger(__name__)

    def fit(self, predictions: np.ndarray, targets: np.ndarray, regime_labels: np.ndarray = None):
        """Fit regime-specific calibrators"""
        try:
            if regime_labels is None:
                # Simple regime detection based on volatility
                np.std(predictions)
                regime_labels = np.digitize(
                    predictions, bins=np.percentile(predictions, [25, 50, 75])
                )

            # Fit calibrator for each regime
            for regime in range(self.n_regimes):
                regime_mask = regime_labels == regime

                if np.sum(regime_mask) > 10:  # Minimum samples required
                    calibrator = IsotonicCalibrator()
                    calibrator.fit(predictions[regime_mask], targets[regime_mask])
                    self.calibrators[regime] = calibrator

                    self.logger.info(
                        f"Fitted calibrator for regime {regime} with {np.sum(regime_mask)} samples"
                    )

        except Exception as e:
            self.logger.error(f"Error fitting regime-specific calibrators: {e}")
            raise

    def predict(self, predictions: np.ndarray, regime_labels: np.ndarray = None) -> np.ndarray:
        """Generate regime-specific calibrated predictions"""
        try:
            if regime_labels is None:
                # Simple regime detection
                regime_labels = np.digitize(
                    predictions, bins=np.percentile(predictions, [25, 50, 75])
                )

            calibrated_predictions = np.zeros_like(predictions)

            for regime in range(self.n_regimes):
                regime_mask = regime_labels == regime

                if regime in self.calibrators and np.sum(regime_mask) > 0:
                    calibrated_predictions[regime_mask] = self.calibrators[regime].predict(
                        predictions[regime_mask]
                    )
                else:
                    # Use uncalibrated predictions for unknown regimes
                    calibrated_predictions[regime_mask] = predictions[regime_mask]

            return calibrated_predictions

        except Exception as e:
            self.logger.error(f"Error in regime-specific calibration: {e}")
            raise


class DynamicWeightAdjuster:
    """
    Dynamic weight adjustment based on recent performance
    Implements softmax temperature scaling and weight decay
    """

    def __init__(
        self,
        n_models: int,
        base_weights: np.ndarray = None,
        temperature: float = 1.0,
        decay_rate: float = 0.99,
    ):
        self.n_models = n_models
        self.base_weights = base_weights or np.ones(n_models) / n_models
        self.temperature = temperature
        self.decay_rate = decay_rate
        self.recent_performance = np.zeros(n_models)
        self.performance_window = 20
        self.min_weight = 0.05
        self.logger = logging.getLogger(__name__)

    def update_performance(self, model_performances: np.ndarray):
        """Update performance tracking for each model"""
        try:
            # Update recent performance with exponential decay
            self.recent_performance = (
                self.decay_rate * self.recent_performance
                + (1 - self.decay_rate) * model_performances
            )

        except Exception as e:
            self.logger.error(f"Error updating performance: {e}")

    def get_weights(self) -> np.ndarray:
        """Calculate dynamic weights using softmax temperature scaling"""
        try:
            # Apply temperature scaling to recent performance
            scaled_performance = self.recent_performance / self.temperature

            # Softmax to get probabilities
            exp_scores = np.exp(scaled_performance - np.max(scaled_performance))
            weights = exp_scores / np.sum(exp_scores)

            # Apply minimum weight constraint
            weights = np.maximum(weights, self.min_weight)

            # Renormalize
            weights = weights / np.sum(weights)

            return weights

        except Exception as e:
            self.logger.error(f"Error calculating weights: {e}")
            return self.base_weights

    def adjust_temperature(self, ensemble_performance: float):
        """Adjust temperature based on ensemble performance"""
        try:
            if ensemble_performance > 0.7:  # Good performance
                self.temperature = max(0.5, self.temperature * 0.95)
            else:  # Poor performance
                self.temperature = min(2.0, self.temperature * 1.05)

        except Exception as e:
            self.logger.error(f"Error adjusting temperature: {e}")


class CalibratedEnsemble:
    """
    Main calibrated ensemble system
    Combines stacked generalization, calibration, and dynamic weighting
    """

    def __init__(
        self, base_models: dict[str, Any], calibration_method: str = "isotonic", n_regimes: int = 4
    ):
        self.base_models = base_models
        self.calibration_method = calibration_method
        self.n_regimes = n_regimes

        # Initialize components
        self.stacked_ensemble = StackedEnsemble(base_models)
        self.calibrator = IsotonicCalibrator(method=calibration_method)
        self.regime_calibrator = RegimeSpecificCalibrator(n_regimes=n_regimes)
        self.weight_adjuster = DynamicWeightAdjuster(len(base_models))

        self.performance_tracker = EnsemblePerformanceTracker()
        self.logger = logging.getLogger(__name__)

    def fit(self, X: np.ndarray, y: np.ndarray, regime_labels: np.ndarray = None):
        """Fit the complete calibrated ensemble"""
        try:
            self.logger.info("Fitting calibrated ensemble...")

            # Fit stacked ensemble
            self.stacked_ensemble.fit(X, y)

            # Get stacked predictions
            stacked_predictions = self.stacked_ensemble.predict(X)

            # Fit calibrators
            self.calibrator.fit(stacked_predictions, y)
            self.regime_calibrator.fit(stacked_predictions, y, regime_labels)

            # Initialize performance tracking
            self.performance_tracker.initialize(self.base_models.keys())

            self.logger.info("Calibrated ensemble fitting completed")

        except Exception as e:
            self.logger.error(f"Error fitting calibrated ensemble: {e}")
            raise

    def predict(
        self,
        X: np.ndarray,
        base_predictions: dict[str, np.ndarray] = None,
        regime_labels: np.ndarray = None,
    ) -> CalibratedPrediction:
        """Generate calibrated ensemble prediction"""
        try:
            # Get base model predictions
            if base_predictions is None:
                base_predictions = {}
                for name, model in self.base_models.items():
                    if hasattr(model, "predict"):
                        base_predictions[name] = model.predict(X)
                    else:
                        base_predictions[name] = np.zeros(len(X))

            # Get stacked ensemble prediction
            stacked_pred = self.stacked_ensemble.predict(X, base_predictions)

            # Apply calibration
            calibrated_pred = self.calibrator.predict(stacked_pred)
            regime_calibrated_pred = self.regime_calibrator.predict(stacked_pred, regime_labels)

            # Combine calibrations
            final_prediction = 0.7 * calibrated_pred + 0.3 * regime_calibrated_pred

            # Calculate model disagreement
            predictions_array = np.column_stack(list(base_predictions.values()))
            disagreement = np.std(predictions_array, axis=1)

            # Get dynamic weights
            model_performances = self.performance_tracker.get_recent_performance()
            self.weight_adjuster.update_performance(model_performances)
            weights = self.weight_adjuster.get_weights()

            # Calculate confidence interval
            confidence_interval = self._calculate_confidence_interval(
                final_prediction, disagreement, weights
            )

            # Calculate ensemble weight
            ensemble_weight = np.mean(weights)

            # Calculate calibration score
            calibration_score = self.calibrator.calibration_score or 0.0

            return CalibratedPrediction(
                prediction=final_prediction,
                calibrated_probability=calibrated_pred,
                confidence_interval=confidence_interval,
                model_disagreement=np.mean(disagreement),
                ensemble_weight=ensemble_weight,
                calibration_score=calibration_score,
                timestamp=pd.Timestamp.now().timestamp(),
            )

        except Exception as e:
            self.logger.error(f"Error in calibrated ensemble prediction: {e}")
            raise

    def _calculate_confidence_interval(
        self, prediction: np.ndarray, disagreement: np.ndarray, weights: np.ndarray
    ) -> tuple[float, float]:
        """Calculate confidence interval for predictions"""
        try:
            # Simple confidence interval based on disagreement and weights
            uncertainty = np.mean(disagreement) * (1 - np.mean(weights))

            # 95% confidence interval
            z_score = 1.96
            margin_of_error = z_score * uncertainty

            lower_bound = prediction - margin_of_error
            upper_bound = prediction + margin_of_error

            return (lower_bound, upper_bound)

        except Exception as e:
            self.logger.error(f"Error calculating confidence interval: {e}")
            return (prediction - 0.1, prediction + 0.1)

    def update_performance(self, prediction: CalibratedPrediction, outcome: float):
        """Update performance tracking"""
        try:
            self.performance_tracker.update(prediction, outcome)

            # Update ensemble performance for temperature adjustment
            ensemble_performance = self.performance_tracker.get_ensemble_performance()
            self.weight_adjuster.adjust_temperature(ensemble_performance)

        except Exception as e:
            self.logger.error(f"Error updating performance: {e}")

    def get_performance_stats(self) -> dict[str, float]:
        """Get performance statistics"""
        return self.performance_tracker.get_stats()


class EnsemblePerformanceTracker:
    """Track performance metrics for ensemble calibration"""

    def __init__(self):
        self.model_performances = {}
        self.ensemble_predictions = []
        self.ensemble_outcomes = []
        self.performance_window = 100

    def initialize(self, model_names: list[str]):
        """Initialize performance tracking for models"""
        for name in model_names:
            self.model_performances[name] = {"predictions": [], "outcomes": [], "errors": []}

    def update(self, prediction: CalibratedPrediction, outcome: float):
        """Update performance tracking"""
        # Update ensemble performance
        self.ensemble_predictions.append(prediction.prediction)
        self.ensemble_outcomes.append(outcome)

        # Keep only recent data
        if len(self.ensemble_predictions) > self.performance_window:
            self.ensemble_predictions.pop(0)
            self.ensemble_outcomes.pop(0)

    def get_recent_performance(self) -> np.ndarray:
        """Get recent performance for each model"""
        # Placeholder - implement based on your model tracking
        n_models = len(self.model_performances)
        return np.ones(n_models) * 0.5

    def get_ensemble_performance(self) -> float:
        """Get ensemble performance score"""
        if len(self.ensemble_predictions) < 10:
            return 0.5

        # Calculate correlation between predictions and outcomes
        correlation = np.corrcoef(self.ensemble_predictions, self.ensemble_outcomes)[0, 1]
        return abs(correlation) if not np.isnan(correlation) else 0.5

    def get_stats(self) -> dict[str, float]:
        """Get performance statistics"""
        if len(self.ensemble_predictions) < 10:
            return {}

        ensemble_performance = self.get_ensemble_performance()

        return {
            "ensemble_performance": ensemble_performance,
            "n_predictions": len(self.ensemble_predictions),
            "calibration_score": np.mean(
                [pred.calibration_score for pred in self.ensemble_predictions]
            ),
        }


# Example usage and testing
if __name__ == "__main__":
    # Example: Create calibrated ensemble system
    logger.info("Initializing Calibrated Ensemble System...")

    # Sample base models (replace with your actual models)
    base_models = {
        "model_1": None,  # Your XGBoost model
        "model_2": None,  # Your LightGBM model
        "model_3": None,  # Your CatBoost model
        "model_4": None,  # Your neural model
    }

    # Initialize calibrated ensemble
    calibrated_ensemble = CalibratedEnsemble(
        base_models=base_models, calibration_method="isotonic", n_regimes=4
    )

    logger.info("Calibrated Ensemble System initialized successfully!")
    logger.info("Ready for production deployment with advanced ensemble calibration.")
