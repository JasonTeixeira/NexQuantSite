#!/usr/bin/env python3
"""
WORLD-CLASS ADVERSARIAL ROBUSTNESS SYSTEM
Phase 8: Adversarial Training and Market Manipulation Defense

This module implements:
- Adversarial training loop
- Market manipulation defense
- Robustness testing
- Input validation and sanitization
- Adversarial example generation

Author: Nexural Trading System
Version: 1.0.0
"""

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
class AdversarialPrediction:
    """Adversarial robust prediction result"""

    prediction: float
    confidence: float
    robustness_score: float
    attack_detected: bool
    attack_type: str
    defense_applied: bool
    original_prediction: float
    timestamp: float


class AdversarialExampleGenerator:
    """
    Generate adversarial examples for robustness testing
    """

    def __init__(self, epsilon: float = 0.01, max_iterations: int = 10):
        self.epsilon = epsilon
        self.max_iterations = max_iterations
        self.logger = logging.getLogger(__name__)

    def fgsm_attack(
        self, model: nn.Module, data: torch.Tensor, target: torch.Tensor
    ) -> torch.Tensor:
        """Fast Gradient Sign Method attack"""
        try:
            data.requires_grad_(True)

            # Forward pass
            output = model(data)
            loss = nn.MSELoss()(output, target)

            # Backward pass
            loss.backward()

            # Generate adversarial example
            perturbation = self.epsilon * torch.sign(data.grad)
            adversarial_data = data + perturbation

            # Clip to valid range
            adversarial_data = torch.clamp(adversarial_data, 0, 1)

            return adversarial_data.detach()

        except Exception as e:
            self.logger.error(f"Error in FGSM attack: {e}")
            return data

    def pgd_attack(
        self, model: nn.Module, data: torch.Tensor, target: torch.Tensor
    ) -> torch.Tensor:
        """Projected Gradient Descent attack"""
        try:
            adversarial_data = data.clone()

            for _ in range(self.max_iterations):
                adversarial_data.requires_grad_(True)

                # Forward pass
                output = model(adversarial_data)
                loss = nn.MSELoss()(output, target)

                # Backward pass
                loss.backward()

                # Update adversarial example
                perturbation = self.epsilon * torch.sign(adversarial_data.grad)
                adversarial_data = adversarial_data + perturbation

                # Project to epsilon ball
                delta = adversarial_data - data
                delta = torch.clamp(delta, -self.epsilon, self.epsilon)
                adversarial_data = data + delta

                # Clip to valid range
                adversarial_data = torch.clamp(adversarial_data, 0, 1)

            return adversarial_data.detach()

        except Exception as e:
            self.logger.error(f"Error in PGD attack: {e}")
            return data

    def generate_market_manipulation(
        self, data: torch.Tensor, manipulation_type: str = "spoofing"
    ) -> torch.Tensor:
        """Generate market manipulation patterns"""
        try:
            manipulated_data = data.clone()

            if manipulation_type == "spoofing":
                # Add fake orders to manipulate price
                noise = torch.randn_like(data) * 0.1
                manipulated_data = data + noise

            elif manipulation_type == "layering":
                # Add multiple fake orders at different levels
                for i in range(data.shape[1]):
                    if i % 3 == 0:  # Every third feature
                        manipulated_data[:, i] += torch.randn(data.shape[0]) * 0.05

            elif manipulation_type == "momentum_ignition":
                # Create artificial momentum
                trend = torch.linspace(0, 0.1, data.shape[0]).unsqueeze(1)
                manipulated_data = data + trend

            elif manipulation_type == "quote_stuffing":
                # Add high-frequency noise
                noise = torch.randn_like(data) * 0.2
                manipulated_data = data + noise

            return torch.clamp(manipulated_data, 0, 1)

        except Exception as e:
            self.logger.error(f"Error generating market manipulation: {e}")
            return data


class AdversarialDefense:
    """
    Adversarial defense mechanisms for trading models
    """

    def __init__(self, defense_type: str = "ensemble"):
        self.defense_type = defense_type
        self.attack_detectors = {}
        self.robustness_threshold = 0.8
        self.logger = logging.getLogger(__name__)

        self._initialize_defense()

    def _initialize_defense(self):
        """Initialize defense mechanisms"""
        try:
            # Input validation
            self.attack_detectors["input_validation"] = self._validate_input

            # Statistical outlier detection
            self.attack_detectors["outlier_detection"] = self._detect_outliers

            # Gradient-based detection
            self.attack_detectors["gradient_detection"] = self._detect_gradient_anomalies

            # Ensemble disagreement
            self.attack_detectors["ensemble_disagreement"] = self._detect_ensemble_disagreement

            self.logger.info(f"Initialized {len(self.attack_detectors)} defense mechanisms")

        except Exception as e:
            self.logger.error(f"Error initializing defense: {e}")

    def _validate_input(self, data: torch.Tensor) -> tuple[bool, float]:
        """Validate input data for adversarial patterns"""
        try:
            # Check for extreme values
            extreme_ratio = torch.sum(torch.abs(data) > 3.0) / data.numel()

            # Check for unusual patterns
            if data.dim() > 1:
                correlation_matrix = torch.corrcoef(data.T)
                correlation_anomaly = torch.std(correlation_matrix)
            else:
                correlation_anomaly = torch.std(data)

            # Combined anomaly score
            anomaly_score = extreme_ratio + correlation_anomaly

            is_attack = anomaly_score > 0.1
            confidence = min(1.0, anomaly_score)

            return is_attack, confidence

        except Exception as e:
            self.logger.error(f"Error in input validation: {e}")
            return False, 0.0

    def _detect_outliers(self, data: torch.Tensor) -> tuple[bool, float]:
        """Detect statistical outliers"""
        try:
            # Calculate z-scores
            mean = torch.mean(data)
            std = torch.std(data)
            z_scores = torch.abs((data - mean) / (std + 1e-8))

            # Count outliers
            outlier_ratio = torch.sum(z_scores > 3.0) / data.numel()

            is_attack = outlier_ratio > 0.05
            confidence = min(1.0, outlier_ratio)

            return is_attack, confidence

        except Exception as e:
            self.logger.error(f"Error in outlier detection: {e}")
            return False, 0.0

    def _detect_gradient_anomalies(
        self, model: nn.Module, data: torch.Tensor
    ) -> tuple[bool, float]:
        """Detect gradient-based anomalies"""
        try:
            data.requires_grad_(True)

            # Forward pass
            output = model(data)
            loss = torch.mean(output)

            # Backward pass
            loss.backward()

            # Analyze gradients
            if data.grad is not None:
                gradient_norm = torch.norm(data.grad)
                gradient_anomaly = gradient_norm > 10.0
                confidence = min(1.0, gradient_norm / 20.0)
            else:
                gradient_anomaly = False
                confidence = 0.0

            return gradient_anomaly, confidence

        except Exception as e:
            self.logger.error(f"Error in gradient detection: {e}")
            return False, 0.0

    def _detect_ensemble_disagreement(self, predictions: list[float]) -> tuple[bool, float]:
        """Detect ensemble disagreement as attack indicator"""
        try:
            if len(predictions) < 2:
                return False, 0.0

            predictions_array = np.array(predictions)
            disagreement = np.std(predictions_array)

            is_attack = disagreement > 0.1
            confidence = min(1.0, disagreement)

            return is_attack, confidence

        except Exception as e:
            self.logger.error(f"Error in ensemble disagreement detection: {e}")
            return False, 0.0

    def detect_attack(
        self, model: nn.Module, data: torch.Tensor, ensemble_predictions: list[float] = None
    ) -> tuple[bool, str, float]:
        """Detect adversarial attacks using multiple methods"""
        try:
            attack_detected = False
            attack_type = "none"
            max_confidence = 0.0

            # Run all detection methods
            for detector_name, detector_func in self.attack_detectors.items():
                if detector_name == "gradient_detection":
                    is_attack, confidence = detector_func(model, data)
                elif detector_name == "ensemble_disagreement":
                    is_attack, confidence = detector_func(ensemble_predictions or [0.0])
                else:
                    is_attack, confidence = detector_func(data)

                if is_attack and confidence > max_confidence:
                    attack_detected = True
                    attack_type = detector_name
                    max_confidence = confidence

            return attack_detected, attack_type, max_confidence

        except Exception as e:
            self.logger.error(f"Error in attack detection: {e}")
            return False, "error", 0.0

    def apply_defense(
        self, model: nn.Module, data: torch.Tensor, attack_detected: bool
    ) -> torch.Tensor:
        """Apply defense mechanisms"""
        try:
            if not attack_detected:
                return data

            # Apply input sanitization
            sanitized_data = self._sanitize_input(data)

            # Apply noise injection
            if self.defense_type == "noise":
                noise = torch.randn_like(sanitized_data) * 0.01
                sanitized_data = sanitized_data + noise

            # Apply smoothing
            if self.defense_type == "smoothing":
                sanitized_data = self._smooth_data(sanitized_data)

            return torch.clamp(sanitized_data, 0, 1)

        except Exception as e:
            self.logger.error(f"Error applying defense: {e}")
            return data

    def _sanitize_input(self, data: torch.Tensor) -> torch.Tensor:
        """Sanitize input data"""
        try:
            # Remove extreme values
            sanitized = torch.clamp(data, -3.0, 3.0)

            # Normalize
            mean = torch.mean(sanitized)
            std = torch.std(sanitized)
            sanitized = (sanitized - mean) / (std + 1e-8)

            return sanitized

        except Exception as e:
            self.logger.error(f"Error sanitizing input: {e}")
            return data

    def _smooth_data(self, data: torch.Tensor) -> torch.Tensor:
        """Apply smoothing to data"""
        try:
            if data.dim() > 1:
                # Apply moving average
                kernel_size = 3
                padding = kernel_size // 2
                smoothed = F.avg_pool1d(data.unsqueeze(0), kernel_size, stride=1, padding=padding)
                return smoothed.squeeze(0)
            else:
                return data

        except Exception as e:
            self.logger.error(f"Error smoothing data: {e}")
            return data


class AdversarialTrainingLoop:
    """
    Adversarial training loop for robust model training
    """

    def __init__(
        self,
        model: nn.Module,
        attack_generator: AdversarialExampleGenerator,
        defense: AdversarialDefense,
    ):
        self.model = model
        self.attack_generator = attack_generator
        self.defense = defense
        self.optimizer = optim.Adam(model.parameters(), lr=0.001)
        self.logger = logging.getLogger(__name__)

    def train_step(self, clean_data: torch.Tensor, clean_targets: torch.Tensor) -> dict[str, float]:
        """Single adversarial training step"""
        try:
            # Generate adversarial examples
            adversarial_data = self.attack_generator.pgd_attack(
                self.model, clean_data, clean_targets
            )

            # Detect attacks
            attack_detected, attack_type, confidence = self.defense.detect_attack(
                self.model, adversarial_data
            )

            # Apply defense if attack detected
            if attack_detected:
                defended_data = self.defense.apply_defense(
                    self.model, adversarial_data, attack_detected
                )
            else:
                defended_data = adversarial_data

            # Forward pass on clean data
            clean_output = self.model(clean_data)
            clean_loss = nn.MSELoss()(clean_output, clean_targets)

            # Forward pass on defended data
            defended_output = self.model(defended_data)
            defended_loss = nn.MSELoss()(defended_output, clean_targets)

            # Combined loss
            total_loss = clean_loss + 0.5 * defended_loss

            # Backward pass
            self.optimizer.zero_grad()
            total_loss.backward()
            self.optimizer.step()

            return {
                "clean_loss": clean_loss.item(),
                "defended_loss": defended_loss.item(),
                "total_loss": total_loss.item(),
                "attack_detected": attack_detected,
                "attack_confidence": confidence,
            }

        except Exception as e:
            self.logger.error(f"Error in adversarial training step: {e}")
            return {
                "clean_loss": 0.0,
                "defended_loss": 0.0,
                "total_loss": 0.0,
                "attack_detected": False,
                "attack_confidence": 0.0,
            }


class RobustnessTester:
    """
    Comprehensive robustness testing for trading models
    """

    def __init__(self, attack_generator: AdversarialExampleGenerator, defense: AdversarialDefense):
        self.attack_generator = attack_generator
        self.defense = defense
        self.test_results = []
        self.logger = logging.getLogger(__name__)

    def test_robustness(
        self, model: nn.Module, test_data: torch.Tensor, test_targets: torch.Tensor
    ) -> dict[str, float]:
        """Test model robustness against various attacks"""
        try:
            results = {
                "fgsm_robustness": 0.0,
                "pgd_robustness": 0.0,
                "spoofing_robustness": 0.0,
                "layering_robustness": 0.0,
                "momentum_robustness": 0.0,
                "quote_stuffing_robustness": 0.0,
                "overall_robustness": 0.0,
            }

            # Test FGSM robustness
            fgsm_data = self.attack_generator.fgsm_attack(model, test_data, test_targets)
            fgsm_output = model(fgsm_data)
            fgsm_error = torch.mean(torch.abs(fgsm_output - test_targets))
            results["fgsm_robustness"] = max(0.0, 1.0 - fgsm_error.item())

            # Test PGD robustness
            pgd_data = self.attack_generator.pgd_attack(model, test_data, test_targets)
            pgd_output = model(pgd_data)
            pgd_error = torch.mean(torch.abs(pgd_output - test_targets))
            results["pgd_robustness"] = max(0.0, 1.0 - pgd_error.item())

            # Test market manipulation robustness
            manipulation_types = ["spoofing", "layering", "momentum_ignition", "quote_stuffing"]
            manipulation_scores = []

            for manipulation_type in manipulation_types:
                manipulated_data = self.attack_generator.generate_market_manipulation(
                    test_data, manipulation_type
                )
                manipulated_output = model(manipulated_data)
                manipulation_error = torch.mean(torch.abs(manipulated_output - test_targets))
                manipulation_score = max(0.0, 1.0 - manipulation_error.item())
                manipulation_scores.append(manipulation_score)

                results[f"{manipulation_type}_robustness"] = manipulation_score

            # Calculate overall robustness
            results["overall_robustness"] = np.mean(list(results.values())[:-1])

            self.test_results.append(results)

            return results

        except Exception as e:
            self.logger.error(f"Error in robustness testing: {e}")
            return {"overall_robustness": 0.0}


class AdversarialRobustnessSystem:
    """
    Complete adversarial robustness system for trading models
    """

    def __init__(self, models: dict[str, nn.Module] = None):
        self.models = models or {}
        self.attack_generator = AdversarialExampleGenerator()
        self.defense = AdversarialDefense()
        self.robustness_tester = RobustnessTester(self.attack_generator, self.defense)
        self.training_loops = {}
        self.performance_history = []
        self.logger = logging.getLogger(__name__)

        self._initialize_training_loops()

    def _initialize_training_loops(self):
        """Initialize adversarial training loops for each model"""
        try:
            for name, model in self.models.items():
                self.training_loops[name] = AdversarialTrainingLoop(
                    model, self.attack_generator, self.defense
                )

            self.logger.info(f"Initialized adversarial training for {len(self.models)} models")

        except Exception as e:
            self.logger.error(f"Error initializing training loops: {e}")

    def predict_robust(
        self, model_name: str, data: torch.Tensor, ensemble_predictions: list[float] = None
    ) -> AdversarialPrediction:
        """Generate robust prediction with adversarial defense"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not found")

            model = self.models[model_name]

            # Detect attacks
            attack_detected, attack_type, confidence = self.defense.detect_attack(
                model, data, ensemble_predictions
            )

            # Apply defense if attack detected
            if attack_detected:
                defended_data = self.defense.apply_defense(model, data, attack_detected)
                self.logger.warning(
                    f"Attack detected: {attack_type} (confidence: {confidence:.3f})"
                )
            else:
                defended_data = data

            # Generate prediction
            original_output = model(data)
            robust_output = model(defended_data)

            # Calculate robustness score
            robustness_score = 1.0 - torch.abs(original_output - robust_output).item()

            return AdversarialPrediction(
                prediction=robust_output.item(),
                confidence=1.0 - confidence if attack_detected else 0.9,
                robustness_score=robustness_score,
                attack_detected=attack_detected,
                attack_type=attack_type,
                defense_applied=attack_detected,
                original_prediction=original_output.item(),
                timestamp=time.time(),
            )

        except Exception as e:
            self.logger.error(f"Error in robust prediction: {e}")
            return AdversarialPrediction(
                prediction=0.0,
                confidence=0.5,
                robustness_score=0.5,
                attack_detected=False,
                attack_type="error",
                defense_applied=False,
                original_prediction=0.0,
                timestamp=time.time(),
            )

    def train_robust(
        self, model_name: str, clean_data: torch.Tensor, clean_targets: torch.Tensor
    ) -> dict[str, float]:
        """Train model with adversarial training"""
        try:
            if model_name not in self.training_loops:
                raise ValueError(f"Training loop for {model_name} not found")

            training_loop = self.training_loops[model_name]
            results = training_loop.train_step(clean_data, clean_targets)

            self.logger.info(f"Adversarial training step for {model_name}: {results}")

            return results

        except Exception as e:
            self.logger.error(f"Error in robust training: {e}")
            return {
                "clean_loss": 0.0,
                "defended_loss": 0.0,
                "total_loss": 0.0,
                "attack_detected": False,
                "attack_confidence": 0.0,
            }

    def test_model_robustness(
        self, model_name: str, test_data: torch.Tensor, test_targets: torch.Tensor
    ) -> dict[str, float]:
        """Test model robustness"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not found")

            model = self.models[model_name]
            results = self.robustness_tester.test_robustness(model, test_data, test_targets)

            self.logger.info(f"Robustness test results for {model_name}: {results}")

            return results

        except Exception as e:
            self.logger.error(f"Error in robustness testing: {e}")
            return {"overall_robustness": 0.0}

    def get_performance_stats(self) -> dict[str, float]:
        """Get adversarial robustness performance statistics"""
        try:
            if not self.performance_history:
                return {}

            recent_predictions = self.performance_history[-100:]

            stats = {
                "total_predictions": len(self.performance_history),
                "recent_predictions": len(recent_predictions),
                "avg_robustness_score": np.mean([p.robustness_score for p in recent_predictions]),
                "attack_detection_rate": np.mean([p.attack_detected for p in recent_predictions]),
                "avg_defense_confidence": np.mean([p.confidence for p in recent_predictions]),
                "common_attack_types": self._get_common_attack_types(recent_predictions),
            }

            return stats

        except Exception as e:
            self.logger.error(f"Error getting robustness performance stats: {e}")
            return {}

    def _get_common_attack_types(self, predictions: list[AdversarialPrediction]) -> list[str]:
        """Get most common attack types"""
        try:
            attack_types = [p.attack_type for p in predictions if p.attack_detected]

            if not attack_types:
                return []

            # Count attack type frequencies
            attack_counts = {}
            for attack_type in attack_types:
                attack_counts[attack_type] = attack_counts.get(attack_type, 0) + 1

            # Return top attack types
            sorted_attacks = sorted(attack_counts.items(), key=lambda x: x[1], reverse=True)
            return [attack for attack, count in sorted_attacks[:3]]

        except Exception:
            return []


# Example usage
if __name__ == "__main__":
    # Initialize adversarial robustness system
    models = {
        "model1": nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 1)),
        "model2": nn.Sequential(nn.Linear(10, 128), nn.ReLU(), nn.Linear(128, 1)),
    }

    robustness_system = AdversarialRobustnessSystem(models)

    # Sample data
    data = torch.randn(1, 10)
    targets = torch.randn(1, 1)

    # Generate robust prediction
    prediction = robustness_system.predict_robust("model1", data)

    print(f"Robust prediction: {prediction.prediction:.4f}")
    print(f"Robustness score: {prediction.robustness_score:.4f}")
    print(f"Attack detected: {prediction.attack_detected}")
    print(f"Attack type: {prediction.attack_type}")
    print(f"Defense applied: {prediction.defense_applied}")
