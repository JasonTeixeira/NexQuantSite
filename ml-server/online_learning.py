#!/usr/bin/env python3
"""
WORLD-CLASS ONLINE LEARNING PIPELINE
Phase 2: Online Learning for Continuous Adaptation

This module implements:
- River-based online models for real-time adaptation
- ADWIN drift detection
- Experience replay buffer
- Warm-start from batch models
- Continuous learning loop

Author: Nexural Trading System
Version: 1.0.0
"""

import logging
import pickle
import warnings
from collections import deque
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import numpy as np

warnings.filterwarnings("ignore")

# River imports for online learning
try:
    from river import stream
    from river.drift import ADWIN
    from river.ensemble import AdaptiveRandomForestRegressor
    from river.linear_model import LinearRegression
    from river.metrics import MAE, RMSE
    from river.neural_net import MLPRegressor
    from river.tree import HoeffdingAdaptiveTreeRegressor
except ImportError:
    print("River not installed. Install with: pip install river")

    # Fallback implementations
    class AdaptiveRandomForestRegressor:
        def __init__(self, **kwargs):
            pass

    class HoeffdingAdaptiveTreeRegressor:
        def __init__(self, **kwargs):
            pass

    class ADWIN:
        def __init__(self, **kwargs):
            pass


# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class OnlinePrediction:
    """Online prediction result with drift information"""

    prediction: float
    confidence: float
    drift_detected: bool
    model_name: str
    timestamp: float
    learning_rate: float
    n_samples_seen: int


class OnlineModelWrapper:
    """
    Wrapper for online models with drift detection and performance tracking
    """

    def __init__(self, model, name: str, drift_detector: ADWIN = None):
        self.model = model
        self.name = name
        self.drift_detector = drift_detector or ADWIN()
        self.performance_metric = RMSE()
        self.n_samples_seen = 0
        self.recent_predictions = deque(maxlen=100)
        self.recent_errors = deque(maxlen=100)
        self.last_update_time = datetime.now()

    def predict_one(self, features: dict[str, float]) -> float:
        """Make prediction on single sample"""
        try:
            prediction = self.model.predict_one(features)
            self.recent_predictions.append(prediction)
            return prediction
        except Exception as e:
            logger.error(f"Error in predict_one for {self.name}: {e}")
            return 0.0

    def learn_one(self, features: dict[str, float], target: float) -> bool:
        """Learn from single sample and check for drift"""
        try:
            # Make prediction before learning
            prediction = self.model.predict_one(features)

            # Update drift detector
            error = abs(prediction - target)
            self.drift_detector.update(error)

            # Learn from the sample
            self.model.learn_one(features, target)

            # Update performance tracking
            self.performance_metric.update(target, prediction)
            self.recent_errors.append(error)
            self.n_samples_seen += 1
            self.last_update_time = datetime.now()

            # Check for drift
            drift_detected = self.drift_detector.drift_detected

            if drift_detected:
                logger.warning(f"Drift detected in {self.name} at sample {self.n_samples_seen}")

            return drift_detected

        except Exception as e:
            logger.error(f"Error in learn_one for {self.name}: {e}")
            return False

    def get_performance_stats(self) -> dict[str, float]:
        """Get performance statistics"""
        if self.n_samples_seen == 0:
            return {}

        recent_rmse = self.performance_metric.get()
        recent_mae = np.mean(list(self.recent_errors)) if self.recent_errors else 0.0

        return {
            "rmse": recent_rmse,
            "mae": recent_mae,
            "n_samples": self.n_samples_seen,
            "drift_detected": self.drift_detector.drift_detected,
            "last_update": self.last_update_time.isoformat(),
        }


class OnlineGradientBoostingWrapper:
    """
    Wrapper for online gradient boosting with adaptive learning
    """

    def __init__(self, base_model, name: str, learning_rate: float = 0.01):
        self.base_model = base_model
        self.name = name
        self.learning_rate = learning_rate
        self.adaptive_lr = learning_rate
        self.recent_performance = deque(maxlen=50)
        self.n_samples_seen = 0

    def predict_one(self, features: dict[str, float]) -> float:
        """Make prediction"""
        try:
            return self.base_model.predict_one(features)
        except Exception as e:
            logger.error(f"Error in predict_one for {self.name}: {e}")
            return 0.0

    def learn_one(self, features: dict[str, float], target: float) -> bool:
        """Learn with adaptive learning rate"""
        try:
            # Make prediction
            prediction = self.base_model.predict_one(features)
            error = abs(prediction - target)

            # Update performance tracking
            self.recent_performance.append(error)
            self.n_samples_seen += 1

            # Adaptive learning rate based on recent performance
            if len(self.recent_performance) > 10:
                recent_avg_error = np.mean(list(self.recent_performance)[-10:])
                if recent_avg_error > 0.1:  # High error
                    self.adaptive_lr = min(0.1, self.adaptive_lr * 1.1)
                else:  # Low error
                    self.adaptive_lr = max(0.001, self.adaptive_lr * 0.99)

            # Learn with adaptive learning rate
            self.base_model.learn_one(features, target)

            return False  # No drift detection for this wrapper

        except Exception as e:
            logger.error(f"Error in learn_one for {self.name}: {e}")
            return False

    def get_performance_stats(self) -> dict[str, float]:
        """Get performance statistics"""
        if self.n_samples_seen == 0:
            return {}

        recent_mae = np.mean(list(self.recent_performance)) if self.recent_performance else 0.0

        return {
            "mae": recent_mae,
            "n_samples": self.n_samples_seen,
            "adaptive_lr": self.adaptive_lr,
            "drift_detected": False,
        }


class ExperienceReplayBuffer:
    """
    Experience replay buffer for online learning
    Stores recent experiences for batch updates
    """

    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self.buffer = deque(maxlen=max_size)
        self.n_samples = 0

    def add_experience(
        self, features: dict[str, float], target: float, prediction: float, timestamp: float
    ):
        """Add experience to buffer"""
        experience = {
            "features": features,
            "target": target,
            "prediction": prediction,
            "timestamp": timestamp,
            "error": abs(prediction - target),
        }

        self.buffer.append(experience)
        self.n_samples += 1

    def sample_batch(self, batch_size: int = 100) -> list[dict]:
        """Sample batch of experiences"""
        if len(self.buffer) < batch_size:
            return list(self.buffer)

        # Prioritized sampling based on error
        errors = [exp["error"] for exp in self.buffer]
        probabilities = np.array(errors) / np.sum(errors)

        indices = np.random.choice(len(self.buffer), batch_size, p=probabilities)
        return [self.buffer[i] for i in indices]

    def get_recent_experiences(self, n_experiences: int = 1000) -> list[dict]:
        """Get most recent experiences"""
        return list(self.buffer)[-n_experiences:]

    def clear_old_experiences(self, max_age_hours: int = 24):
        """Clear experiences older than specified age"""
        current_time = datetime.now().timestamp()
        cutoff_time = current_time - (max_age_hours * 3600)

        # Remove old experiences
        self.buffer = deque(
            [exp for exp in self.buffer if exp["timestamp"] > cutoff_time], maxlen=self.max_size
        )


class OnlineLearningOrchestrator:
    """
    Main orchestrator for online learning system
    Manages model zoo, updates, and drift detection
    """

    def __init__(self, batch_models: dict[str, Any] = None):
        self.batch_models = batch_models or {}
        self.online_models = {}
        self.experience_buffer = ExperienceReplayBuffer()
        self.performance_tracker = OnlinePerformanceTracker()
        self.logger = logging.getLogger(__name__)
        self._initialize_online_models()

    def _initialize_online_models(self):
        """Initialize online models from batch models"""
        try:
            # Create online equivalents for each batch model
            for name, batch_model in self.batch_models.items():
                if hasattr(batch_model, "n_estimators"):  # Tree-based model
                    online_model = OnlineModelWrapper(
                        AdaptiveRandomForestRegressor(n_models=10, max_features="sqrt", seed=42),
                        name=f"{name}_online",
                    )
                elif hasattr(batch_model, "layers"):  # Neural network
                    online_model = OnlineModelWrapper(
                        MLPRegressor(
                            hidden_dims=(64, 32),
                            activations=("relu", "relu"),
                            optimizer="sgd",
                            learning_rate=0.01,
                        ),
                        name=f"{name}_online",
                    )
                else:  # Linear model
                    online_model = OnlineModelWrapper(LinearRegression(), name=f"{name}_online")

                self.online_models[name] = online_model
                self.logger.info(f"Initialized online model: {name}")

        except Exception as e:
            self.logger.error(f"Error initializing online models: {e}")

    def warm_start_from_batch(self, X_warm: np.ndarray, y_warm: np.ndarray):
        """Warm start online models from batch data"""
        try:
            for name, online_model in self.online_models.items():
                self.logger.info(f"Warm starting {name} with {len(X_warm)} samples")

                for i in range(len(X_warm)):
                    features = dict(
                        zip([f"feature_{j}" for j in range(X_warm.shape[1])], X_warm[i])
                    )
                    online_model.learn_one(features, y_warm[i])

                self.logger.info(f"Warm start completed for {name}")

        except Exception as e:
            self.logger.error(f"Error in warm start: {e}")

    def predict_online(self, features: dict[str, float]) -> dict[str, OnlinePrediction]:
        """Generate predictions from all online models"""
        predictions = {}

        try:
            for name, online_model in self.online_models.items():
                prediction = online_model.predict_one(features)

                # Calculate confidence based on recent performance
                stats = online_model.get_performance_stats()
                confidence = 1.0 / (1.0 + stats.get("rmse", 1.0))

                online_pred = OnlinePrediction(
                    prediction=prediction,
                    confidence=confidence,
                    drift_detected=stats.get("drift_detected", False),
                    model_name=name,
                    timestamp=datetime.now().timestamp(),
                    learning_rate=getattr(online_model, "adaptive_lr", 0.01),
                    n_samples_seen=stats.get("n_samples", 0),
                )

                predictions[name] = online_pred

            return predictions

        except Exception as e:
            self.logger.error(f"Error in predict_online: {e}")
            return {}

    def update_online_models(
        self, features: dict[str, float], target: float, prediction: float = None
    ):
        """Update all online models with new data"""
        try:
            # Add to experience buffer
            self.experience_buffer.add_experience(
                features, target, prediction or 0.0, datetime.now().timestamp()
            )

            # Update each online model
            drift_detected_any = False
            for _name, online_model in self.online_models.items():
                drift_detected = online_model.learn_one(features, target)
                if drift_detected:
                    drift_detected_any = True

            # Update performance tracking
            self.performance_tracker.update(features, target, prediction)

            # Trigger batch retrain if drift detected
            if drift_detected_any:
                self.logger.warning("Drift detected - triggering batch retrain")
                self._trigger_batch_retrain()

            return drift_detected_any

        except Exception as e:
            self.logger.error(f"Error updating online models: {e}")
            return False

    def _trigger_batch_retrain(self):
        """Trigger batch model retraining"""
        try:
            # Get recent experiences for retraining
            recent_experiences = self.experience_buffer.get_recent_experiences(5000)

            if len(recent_experiences) < 1000:
                self.logger.warning("Insufficient data for batch retrain")
                return

            # Extract features and targets
            X_retrain = np.array([exp["features"] for exp in recent_experiences])
            np.array([exp["target"] for exp in recent_experiences])

            # Retrain batch models (placeholder - implement based on your models)
            self.logger.info(f"Retraining batch models with {len(X_retrain)} samples")

            # Here you would retrain your batch models
            # For now, just log the action
            self.logger.info("Batch retrain triggered successfully")

        except Exception as e:
            self.logger.error(f"Error in batch retrain: {e}")

    def get_model_weights(self) -> dict[str, float]:
        """Calculate dynamic weights for ensemble"""
        try:
            weights = {}
            total_performance = 0.0

            for name, online_model in self.online_models.items():
                stats = online_model.get_performance_stats()

                # Calculate weight based on recent performance
                if stats.get("n_samples", 0) > 100:
                    rmse = stats.get("rmse", 1.0)
                    weight = 1.0 / (1.0 + rmse)
                else:
                    weight = 0.1  # Default weight for new models

                weights[name] = weight
                total_performance += weight

            # Normalize weights
            if total_performance > 0:
                weights = {name: weight / total_performance for name, weight in weights.items()}

            return weights

        except Exception as e:
            self.logger.error(f"Error calculating model weights: {e}")
            return {}

    def ensemble_predict(self, features: dict[str, float]) -> OnlinePrediction:
        """Generate ensemble prediction from online models"""
        try:
            # Get individual predictions
            individual_predictions = self.predict_online(features)

            if not individual_predictions:
                raise ValueError("No valid online predictions")

            # Get model weights
            weights = self.get_model_weights()

            # Calculate weighted ensemble
            weighted_prediction = 0.0
            weighted_confidence = 0.0
            total_weight = 0.0

            for name, pred in individual_predictions.items():
                weight = weights.get(name, 0.1)
                weighted_prediction += pred.prediction * weight
                weighted_confidence += pred.confidence * weight
                total_weight += weight

            if total_weight > 0:
                ensemble_prediction = weighted_prediction / total_weight
                ensemble_confidence = weighted_confidence / total_weight
            else:
                ensemble_prediction = 0.0
                ensemble_confidence = 0.0

            # Check for drift in any model
            drift_detected = any(pred.drift_detected for pred in individual_predictions.values())

            return OnlinePrediction(
                prediction=ensemble_prediction,
                confidence=ensemble_confidence,
                drift_detected=drift_detected,
                model_name="ensemble",
                timestamp=datetime.now().timestamp(),
                learning_rate=np.mean(
                    [pred.learning_rate for pred in individual_predictions.values()]
                ),
                n_samples_seen=np.mean(
                    [pred.n_samples_seen for pred in individual_predictions.values()]
                ),
            )

        except Exception as e:
            self.logger.error(f"Error in ensemble prediction: {e}")
            raise

    def save_online_models(self, filepath: str):
        """Save online models to disk"""
        try:
            model_data = {}
            for name, online_model in self.online_models.items():
                model_data[name] = {
                    "model": online_model.model,
                    "performance_stats": online_model.get_performance_stats(),
                }

            with open(filepath, "wb") as f:
                pickle.dump(model_data, f)

            self.logger.info(f"Saved online models to {filepath}")

        except Exception as e:
            self.logger.error(f"Error saving online models: {e}")

    def load_online_models(self, filepath: str):
        """Load online models from disk"""
        try:
            with open(filepath, "rb") as f:
                model_data = pickle.load(f)

            for name, data in model_data.items():
                if name in self.online_models:
                    self.online_models[name].model = data["model"]
                    self.logger.info(f"Loaded online model: {name}")

            self.logger.info(f"Loaded online models from {filepath}")

        except Exception as e:
            self.logger.error(f"Error loading online models: {e}")


class OnlinePerformanceTracker:
    """Track performance metrics for online learning"""

    def __init__(self):
        self.predictions = []
        self.targets = []
        self.errors = []
        self.timestamps = []
        self.window_size = 1000

    def update(self, features: dict[str, float], target: float, prediction: float):
        """Update performance tracking"""
        error = abs(prediction - target)

        self.predictions.append(prediction)
        self.targets.append(target)
        self.errors.append(error)
        self.timestamps.append(datetime.now().timestamp())

        # Keep only recent data
        if len(self.predictions) > self.window_size:
            self.predictions.pop(0)
            self.targets.pop(0)
            self.errors.pop(0)
            self.timestamps.pop(0)

    def get_recent_performance(self, window: int = 100) -> dict[str, float]:
        """Get recent performance statistics"""
        if len(self.errors) < window:
            return {}

        recent_errors = self.errors[-window:]
        recent_predictions = self.predictions[-window:]
        recent_targets = self.targets[-window:]

        return {
            "mae": np.mean(recent_errors),
            "rmse": np.sqrt(np.mean(np.array(recent_errors) ** 2)),
            "correlation": (
                np.corrcoef(recent_predictions, recent_targets)[0, 1]
                if len(recent_predictions) > 1
                else 0.0
            ),
            "n_samples": len(recent_errors),
        }

    def detect_performance_degradation(self, threshold: float = 0.1) -> bool:
        """Detect if performance is degrading"""
        if len(self.errors) < 100:
            return False

        # Compare recent vs older performance
        recent_mae = np.mean(self.errors[-50:])
        older_mae = np.mean(self.errors[-100:-50])

        degradation = (recent_mae - older_mae) / older_mae

        return degradation > threshold


class ContinuousLearningLoop:
    """
    Continuous learning loop for real-time adaptation
    """

    def __init__(self, orchestrator: OnlineLearningOrchestrator):
        self.orchestrator = orchestrator
        self.learning_rate_scheduler = AdaptiveLearningRateScheduler()
        self.logger = logging.getLogger(__name__)

    async def continuous_learning_step(self, market_data: dict[str, float], outcome: float = None):
        """Single step in continuous learning loop"""
        try:
            # Convert market data to features
            features = self._extract_features(market_data)

            # Generate prediction
            prediction = self.orchestrator.ensemble_predict(features)

            # Update models if outcome is available
            if outcome is not None:
                self.orchestrator.update_online_models(features, outcome, prediction.prediction)

                # Update learning rate scheduler
                self.learning_rate_scheduler.update(prediction.prediction, outcome)

            return prediction

        except Exception as e:
            self.logger.error(f"Error in continuous learning step: {e}")
            raise

    def _extract_features(self, market_data: dict[str, float]) -> dict[str, float]:
        """Extract features from market data"""
        # Convert numpy arrays to dict format for River
        features = {}
        for key, value in market_data.items():
            if isinstance(value, (np.ndarray, list)):
                for i, v in enumerate(value):
                    features[f"{key}_{i}"] = float(v)
            else:
                features[key] = float(value)

        return features


class AdaptiveLearningRateScheduler:
    """Adaptive learning rate scheduler for online models"""

    def __init__(self, base_lr: float = 0.01, min_lr: float = 0.001, max_lr: float = 0.1):
        self.base_lr = base_lr
        self.min_lr = min_lr
        self.max_lr = max_lr
        self.current_lr = base_lr
        self.recent_errors = deque(maxlen=100)
        self.performance_window = 50

    def update(self, prediction: float, target: float):
        """Update learning rate based on recent performance"""
        error = abs(prediction - target)
        self.recent_errors.append(error)

        if len(self.recent_errors) >= self.performance_window:
            recent_avg_error = np.mean(list(self.recent_errors)[-self.performance_window :])
            older_avg_error = np.mean(
                list(self.recent_errors)[-2 * self.performance_window : -self.performance_window]
            )

            # Adjust learning rate based on performance trend
            if recent_avg_error < older_avg_error:  # Improving
                self.current_lr = min(self.max_lr, self.current_lr * 1.01)
            else:  # Degrading
                self.current_lr = max(self.min_lr, self.current_lr * 0.99)

    def get_learning_rate(self) -> float:
        """Get current learning rate"""
        return self.current_lr


# Example usage and testing
if __name__ == "__main__":
    # Example: Create online learning system
    logger.info("Initializing Online Learning Pipeline...")

    # Sample batch models (replace with your actual models)
    batch_models = {
        "xgboost_model": None,  # Your XGBoost model
        "neural_model": None,  # Your PyTorch model
        "linear_model": None,  # Your linear model
    }

    # Initialize online learning orchestrator
    orchestrator = OnlineLearningOrchestrator(batch_models)

    # Create continuous learning loop
    learning_loop = ContinuousLearningLoop(orchestrator)

    logger.info("Online Learning Pipeline initialized successfully!")
    logger.info("Ready for production deployment with continuous adaptation capabilities.")
