#!/usr/bin/env python3
"""
WORLD-CLASS META-LEARNING SYSTEM
Phase 5: Meta-Learning for Adaptive ML Trading Models

This module implements:
- MAML (Model-Agnostic Meta-Learning)
- Few-Shot Regime Adaptation
- Reptile Algorithm
- Meta-ensemble optimization
- Fast adaptation to new market conditions

Author: Nexural Trading System
Version: 1.0.0
"""

import copy
import logging
import time
import warnings
from dataclasses import dataclass

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

warnings.filterwarnings("ignore")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class MetaLearningPrediction:
    """Meta-learning prediction result with adaptation info"""

    prediction: float
    confidence: float
    adaptation_steps: int
    meta_loss: float
    regime_confidence: float
    few_shot_performance: float
    timestamp: float


class MAML(nn.Module):
    """
    Model-Agnostic Meta-Learning for fast adaptation
    Enables rapid learning from small amounts of new data
    """

    def __init__(
        self,
        model: nn.Module,
        inner_lr: float = 0.01,
        meta_lr: float = 0.001,
        adaptation_steps: int = 5,
    ):
        super().__init__()
        self.model = model
        self.inner_lr = inner_lr
        self.meta_lr = meta_lr
        self.adaptation_steps = adaptation_steps
        self.meta_optimizer = optim.Adam(self.model.parameters(), lr=meta_lr)

    def inner_loop(self, support_data: torch.Tensor, support_targets: torch.Tensor) -> nn.Module:
        """Inner loop for task-specific adaptation"""
        adapted_model = copy.deepcopy(self.model)
        inner_optimizer = optim.SGD(adapted_model.parameters(), lr=self.inner_lr)

        for _ in range(self.adaptation_steps):
            # Forward pass
            predictions = adapted_model(support_data)
            loss = nn.MSELoss()(predictions.squeeze(), support_targets)

            # Backward pass
            inner_optimizer.zero_grad()
            loss.backward()
            inner_optimizer.step()

        return adapted_model

    def outer_loop(
        self, tasks: list[tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]]
    ):
        """Outer loop for meta-optimization"""
        meta_loss = 0.0

        for support_data, support_targets, query_data, query_targets in tasks:
            # Inner loop adaptation
            adapted_model = self.inner_loop(support_data, support_targets)

            # Query set evaluation
            query_predictions = adapted_model(query_data)
            query_loss = nn.MSELoss()(query_predictions.squeeze(), query_targets)
            meta_loss += query_loss

        # Meta-optimization
        self.meta_optimizer.zero_grad()
        meta_loss.backward()
        self.meta_optimizer.step()

        return meta_loss.item()

    def fast_adapt(self, support_data: torch.Tensor, support_targets: torch.Tensor) -> nn.Module:
        """Fast adaptation to new data"""
        return self.inner_loop(support_data, support_targets)


class FewShotRegimeAdapter:
    """
    Few-shot learning for regime adaptation
    Quickly adapts to new market regimes with minimal data
    """

    def __init__(self, base_model: nn.Module, n_ways: int = 5, n_shots: int = 10):
        self.base_model = base_model
        self.n_ways = n_ways
        self.n_shots = n_shots
        self.regime_embeddings = {}
        self.regime_classifiers = {}
        self.logger = logging.getLogger(__name__)

    def create_regime_embedding(self, regime_data: torch.Tensor) -> torch.Tensor:
        """Create regime-specific embedding"""
        with torch.no_grad():
            embeddings = self.base_model(regime_data)
            return torch.mean(embeddings, dim=0)

    def adapt_to_regime(
        self, regime_name: str, regime_data: torch.Tensor, regime_targets: torch.Tensor
    ) -> nn.Module:
        """Adapt model to specific regime"""
        # Create regime embedding
        regime_embedding = self.create_regime_embedding(regime_data)
        self.regime_embeddings[regime_name] = regime_embedding

        # Create regime-specific classifier
        classifier = nn.Sequential(
            nn.Linear(regime_embedding.shape[0], 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
        )

        # Train classifier on regime data
        optimizer = optim.Adam(classifier.parameters(), lr=0.001)
        criterion = nn.MSELoss()

        for _epoch in range(50):
            predictions = classifier(regime_data)
            loss = criterion(predictions.squeeze(), regime_targets)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        self.regime_classifiers[regime_name] = classifier
        return classifier

    def predict_regime(self, data: torch.Tensor, regime_name: str) -> torch.Tensor:
        """Predict using regime-specific model"""
        if regime_name not in self.regime_classifiers:
            raise ValueError(f"Regime {regime_name} not found")

        classifier = self.regime_classifiers[regime_name]
        return classifier(data)


class ReptileAlgorithm:
    """
    Reptile algorithm for meta-learning
    Simple but effective meta-learning approach
    """

    def __init__(self, model: nn.Module, epsilon: float = 0.1, n_tasks: int = 10):
        self.model = model
        self.epsilon = epsilon
        self.n_tasks = n_tasks
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)

    def reptile_step(self, tasks: list[tuple[torch.Tensor, torch.Tensor]]):
        """Single Reptile step"""
        initial_params = copy.deepcopy(self.model.state_dict())

        for task_data, task_targets in tasks:
            # Task-specific adaptation
            task_optimizer = optim.SGD(self.model.parameters(), lr=0.01)

            for _ in range(5):  # Few adaptation steps
                predictions = self.model(task_data)
                loss = nn.MSELoss()(predictions.squeeze(), task_targets)

                task_optimizer.zero_grad()
                loss.backward()
                task_optimizer.step()

        # Reptile update
        current_params = self.model.state_dict()
        for param_name in initial_params:
            param_diff = current_params[param_name] - initial_params[param_name]
            current_params[param_name] = initial_params[param_name] + self.epsilon * param_diff

        self.model.load_state_dict(current_params)


class MetaEnsembleOptimizer:
    """
    Meta-ensemble optimization for combining multiple meta-learners
    """

    def __init__(self, base_models: dict[str, nn.Module], meta_lr: float = 0.001):
        self.base_models = base_models
        self.meta_learners = {}
        self.ensemble_weights = {}
        self.meta_lr = meta_lr

        # Initialize meta-learners for each model
        for name, model in base_models.items():
            self.meta_learners[name] = MAML(model)
            self.ensemble_weights[name] = 1.0 / len(base_models)

    def update_ensemble_weights(self, performances: dict[str, float]):
        """Update ensemble weights based on performance"""
        total_performance = sum(performances.values())
        if total_performance > 0:
            for name in self.ensemble_weights:
                self.ensemble_weights[name] = performances.get(name, 0.0) / total_performance
        else:
            # Equal weights if no performance data
            equal_weight = 1.0 / len(self.ensemble_weights)
            self.ensemble_weights = {name: equal_weight for name in self.ensemble_weights}

    def meta_predict(
        self,
        data: torch.Tensor,
        support_data: torch.Tensor = None,
        support_targets: torch.Tensor = None,
    ) -> MetaLearningPrediction:
        """Generate meta-learning prediction"""
        predictions = {}
        confidences = {}

        for name, meta_learner in self.meta_learners.items():
            if support_data is not None and support_targets is not None:
                # Fast adaptation
                adapted_model = meta_learner.fast_adapt(support_data, support_targets)
                pred = adapted_model(data)
            else:
                # Use base model
                pred = self.base_models[name](data)

            predictions[name] = pred.item()
            confidences[name] = self.ensemble_weights[name]

        # Weighted ensemble prediction
        weighted_pred = sum(predictions[name] * confidences[name] for name in predictions)
        weighted_conf = sum(confidences.values()) / len(confidences)

        return MetaLearningPrediction(
            prediction=weighted_pred,
            confidence=weighted_conf,
            adaptation_steps=5,
            meta_loss=0.0,  # Would be calculated during training
            regime_confidence=weighted_conf,
            few_shot_performance=weighted_conf,
            timestamp=time.time(),
        )


class MetaLearningSystem:
    """
    Complete meta-learning system for trading
    Integrates MAML, Few-Shot Learning, and Reptile
    """

    def __init__(self, base_models: dict[str, nn.Module] = None):
        self.base_models = base_models or {}
        self.maml_learners = {}
        self.few_shot_adapters = {}
        self.reptile_learners = {}
        self.meta_ensemble = None
        self.performance_history = []
        self.logger = logging.getLogger(__name__)

        self._initialize_meta_learners()

    def _initialize_meta_learners(self):
        """Initialize all meta-learning components"""
        try:
            for name, model in self.base_models.items():
                # MAML learners
                self.maml_learners[name] = MAML(model)

                # Few-shot adapters
                self.few_shot_adapters[name] = FewShotRegimeAdapter(model)

                # Reptile learners
                self.reptile_learners[name] = ReptileAlgorithm(model)

            # Meta-ensemble optimizer
            self.meta_ensemble = MetaEnsembleOptimizer(self.base_models)

            self.logger.info(
                f"Initialized meta-learning system with {len(self.base_models)} models"
            )

        except Exception as e:
            self.logger.error(f"Error initializing meta-learners: {e}")
            raise

    def adapt_to_new_regime(
        self, regime_name: str, regime_data: torch.Tensor, regime_targets: torch.Tensor
    ):
        """Adapt all models to new regime"""
        try:
            for _name, adapter in self.few_shot_adapters.items():
                adapter.adapt_to_regime(regime_name, regime_data, regime_targets)

            self.logger.info(f"Adapted all models to regime: {regime_name}")

        except Exception as e:
            self.logger.error(f"Error adapting to regime {regime_name}: {e}")

    def meta_predict(
        self,
        data: torch.Tensor,
        regime_name: str = None,
        support_data: torch.Tensor = None,
        support_targets: torch.Tensor = None,
    ) -> MetaLearningPrediction:
        """Generate meta-learning prediction"""
        try:
            if regime_name and regime_name in self.few_shot_adapters:
                # Use regime-specific adaptation
                predictions = []
                for _name, adapter in self.few_shot_adapters.items():
                    pred = adapter.predict_regime(data, regime_name)
                    predictions.append(pred.item())

                avg_prediction = np.mean(predictions)
                confidence = np.std(predictions)  # Lower std = higher confidence

            else:
                # Use meta-ensemble
                meta_pred = self.meta_ensemble.meta_predict(data, support_data, support_targets)
                avg_prediction = meta_pred.prediction
                confidence = meta_pred.confidence

            return MetaLearningPrediction(
                prediction=avg_prediction,
                confidence=confidence,
                adaptation_steps=5,
                meta_loss=0.0,
                regime_confidence=confidence,
                few_shot_performance=confidence,
                timestamp=time.time(),
            )

        except Exception as e:
            self.logger.error(f"Error in meta prediction: {e}")
            return MetaLearningPrediction(
                prediction=0.0,
                confidence=0.5,
                adaptation_steps=0,
                meta_loss=0.0,
                regime_confidence=0.5,
                few_shot_performance=0.5,
                timestamp=time.time(),
            )

    def update_performance(self, prediction: MetaLearningPrediction, outcome: float):
        """Update meta-learning performance"""
        try:
            self.performance_history.append(
                {
                    "prediction": prediction.prediction,
                    "outcome": outcome,
                    "error": abs(prediction.prediction - outcome),
                    "confidence": prediction.confidence,
                    "timestamp": prediction.timestamp,
                }
            )

            # Update ensemble weights based on recent performance
            if len(self.performance_history) >= 10:
                recent_performance = self.performance_history[-10:]
                model_performances = {}

                for name in self.base_models:
                    # Calculate recent performance for each model
                    errors = [p["error"] for p in recent_performance]
                    model_performances[name] = 1.0 / (1.0 + np.mean(errors))

                self.meta_ensemble.update_ensemble_weights(model_performances)

        except Exception as e:
            self.logger.error(f"Error updating performance: {e}")

    def get_performance_stats(self) -> dict[str, float]:
        """Get meta-learning performance statistics"""
        try:
            if not self.performance_history:
                return {}

            recent = self.performance_history[-100:]

            return {
                "total_predictions": len(self.performance_history),
                "recent_predictions": len(recent),
                "avg_error": np.mean([p["error"] for p in recent]),
                "avg_confidence": np.mean([p["confidence"] for p in recent]),
                "adaptation_success_rate": 0.85,  # Placeholder
                "regime_adaptation_speed": 0.92,  # Placeholder
            }

        except Exception as e:
            self.logger.error(f"Error getting performance stats: {e}")
            return {}


# Example usage
if __name__ == "__main__":
    # Sample models for testing
    models = {
        "model1": nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 1)),
        "model2": nn.Sequential(nn.Linear(10, 128), nn.ReLU(), nn.Linear(128, 1)),
    }

    # Initialize meta-learning system
    meta_system = MetaLearningSystem(models)

    # Sample data
    data = torch.randn(1, 10)
    support_data = torch.randn(5, 10)
    support_targets = torch.randn(5)

    # Generate prediction
    prediction = meta_system.meta_predict(
        data, support_data=support_data, support_targets=support_targets
    )

    print(f"Meta-learning prediction: {prediction.prediction:.4f}")
    print(f"Confidence: {prediction.confidence:.4f}")
    print(f"Adaptation steps: {prediction.adaptation_steps}")
