#!/usr/bin/env python3
"""
WORLD-CLASS MONITORING & DRIFT DETECTION SYSTEM
Phase 6: Comprehensive Monitoring and Drift Detection

This module implements:
- Comprehensive drift detection algorithms
- Performance monitoring dashboard
- A/B testing framework
- Statistical process control
- Real-time alerting system

Author: Nexural Trading System
Version: 1.0.0
"""

import logging
import time
import warnings
from collections import deque
from dataclasses import dataclass
from typing import Any

import numpy as np
from scipy import stats

warnings.filterwarnings("ignore")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class DriftDetectionResult:
    """Drift detection result with detailed information"""

    drift_detected: bool
    drift_score: float
    drift_type: str
    confidence: float
    affected_features: list[str]
    timestamp: float
    severity: str


@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics"""

    accuracy: float
    precision: float
    recall: float
    f1_score: float
    mse: float
    mae: float
    sharpe_ratio: float
    win_rate: float
    profit_factor: float
    max_drawdown: float
    timestamp: float


class StatisticalProcessControl:
    """
    Statistical Process Control for drift detection
    Uses control charts and statistical tests
    """

    def __init__(self, window_size: int = 100, alpha: float = 0.05):
        self.window_size = window_size
        self.alpha = alpha
        self.control_limits = {}
        self.baseline_stats = {}
        self.recent_data = deque(maxlen=window_size)
        self.logger = logging.getLogger(__name__)

    def update_baseline(self, baseline_data: np.ndarray):
        """Update baseline statistics"""
        try:
            self.baseline_stats = {
                "mean": np.mean(baseline_data),
                "std": np.std(baseline_data),
                "median": np.median(baseline_data),
                "q25": np.percentile(baseline_data, 25),
                "q75": np.percentile(baseline_data, 75),
            }

            # Calculate control limits
            self.control_limits = {
                "ucl": self.baseline_stats["mean"] + 3 * self.baseline_stats["std"],
                "lcl": self.baseline_stats["mean"] - 3 * self.baseline_stats["std"],
                "ucl_2": self.baseline_stats["mean"] + 2 * self.baseline_stats["std"],
                "lcl_2": self.baseline_stats["mean"] - 2 * self.baseline_stats["std"],
            }

            self.logger.info("Baseline statistics updated")

        except Exception as e:
            self.logger.error(f"Error updating baseline: {e}")

    def detect_drift(self, new_data: np.ndarray) -> DriftDetectionResult:
        """Detect drift using statistical process control"""
        try:
            if not self.baseline_stats:
                return DriftDetectionResult(
                    drift_detected=False,
                    drift_score=0.0,
                    drift_type="no_baseline",
                    confidence=0.0,
                    affected_features=[],
                    timestamp=time.time(),
                    severity="low",
                )

            # Calculate current statistics
            current_mean = np.mean(new_data)
            current_std = np.std(new_data)

            # Check for mean shift
            mean_shift = abs(current_mean - self.baseline_stats["mean"])
            mean_shift_normalized = mean_shift / self.baseline_stats["std"]

            # Check for variance change
            variance_ratio = current_std / self.baseline_stats["std"]

            # Statistical tests
            t_stat, p_value = stats.ttest_1samp(new_data, self.baseline_stats["mean"])
            ks_stat, ks_p_value = stats.ks_2samp(
                np.random.normal(self.baseline_stats["mean"], self.baseline_stats["std"], 1000),
                new_data,
            )

            # Determine drift
            drift_detected = False
            drift_score = 0.0
            drift_type = "none"
            severity = "low"

            if mean_shift_normalized > 2.0 or p_value < self.alpha:
                drift_detected = True
                drift_score = mean_shift_normalized
                drift_type = "mean_shift"
                severity = "high" if mean_shift_normalized > 3.0 else "medium"

            elif abs(variance_ratio - 1.0) > 0.5:
                drift_detected = True
                drift_score = abs(variance_ratio - 1.0)
                drift_type = "variance_change"
                severity = "medium"

            elif ks_p_value < self.alpha:
                drift_detected = True
                drift_score = 1.0 - ks_p_value
                drift_type = "distribution_change"
                severity = "medium"

            # Calculate confidence
            confidence = min(1.0, max(0.0, 1.0 - p_value))

            return DriftDetectionResult(
                drift_detected=drift_detected,
                drift_score=drift_score,
                drift_type=drift_type,
                confidence=confidence,
                affected_features=["all"],
                timestamp=time.time(),
                severity=severity,
            )

        except Exception as e:
            self.logger.error(f"Error in drift detection: {e}")
            return DriftDetectionResult(
                drift_detected=False,
                drift_score=0.0,
                drift_type="error",
                confidence=0.0,
                affected_features=[],
                timestamp=time.time(),
                severity="low",
            )


class ConceptDriftDetector:
    """
    Advanced concept drift detection using multiple algorithms
    """

    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.recent_predictions = deque(maxlen=window_size)
        self.recent_targets = deque(maxlen=window_size)
        self.recent_features = deque(maxlen=window_size)
        self.drift_history = []
        self.logger = logging.getLogger(__name__)

    def update(self, prediction: float, target: float, features: np.ndarray):
        """Update detector with new data"""
        try:
            self.recent_predictions.append(prediction)
            self.recent_targets.append(target)
            self.recent_features.append(features)

        except Exception as e:
            self.logger.error(f"Error updating drift detector: {e}")

    def detect_concept_drift(self) -> DriftDetectionResult:
        """Detect concept drift using multiple methods"""
        try:
            if len(self.recent_predictions) < 20:
                return DriftDetectionResult(
                    drift_detected=False,
                    drift_score=0.0,
                    drift_type="insufficient_data",
                    confidence=0.0,
                    affected_features=[],
                    timestamp=time.time(),
                    severity="low",
                )

            predictions = np.array(self.recent_predictions)
            targets = np.array(self.recent_targets)
            features = np.array(self.recent_features)

            # Calculate performance metrics
            errors = np.abs(predictions - targets)
            recent_errors = errors[-20:]
            older_errors = errors[:-20] if len(errors) > 20 else errors

            # Statistical test for performance degradation
            if len(older_errors) > 10 and len(recent_errors) > 10:
                t_stat, p_value = stats.ttest_ind(older_errors, recent_errors)
                performance_degradation = np.mean(recent_errors) > np.mean(older_errors)

                if performance_degradation and p_value < 0.05:
                    drift_score = 1.0 - p_value
                    return DriftDetectionResult(
                        drift_detected=True,
                        drift_score=drift_score,
                        drift_type="performance_degradation",
                        confidence=1.0 - p_value,
                        affected_features=["performance"],
                        timestamp=time.time(),
                        severity="high" if drift_score > 0.8 else "medium",
                    )

            # Feature distribution drift
            if features.shape[1] > 0:
                feature_drift_scores = []
                for i in range(features.shape[1]):
                    recent_feature = features[-20:, i]
                    older_feature = features[:-20, i] if features.shape[0] > 20 else features[:, i]

                    if len(older_feature) > 10 and len(recent_feature) > 10:
                        _, p_value = stats.ks_2samp(older_feature, recent_feature)
                        feature_drift_scores.append(1.0 - p_value)

                if feature_drift_scores:
                    max_drift_score = max(feature_drift_scores)
                    if max_drift_score > 0.8:
                        return DriftDetectionResult(
                            drift_detected=True,
                            drift_score=max_drift_score,
                            drift_type="feature_distribution_drift",
                            confidence=max_drift_score,
                            affected_features=[
                                f"feature_{i}"
                                for i, score in enumerate(feature_drift_scores)
                                if score > 0.8
                            ],
                            timestamp=time.time(),
                            severity="medium",
                        )

            return DriftDetectionResult(
                drift_detected=False,
                drift_score=0.0,
                drift_type="no_drift",
                confidence=0.8,
                affected_features=[],
                timestamp=time.time(),
                severity="low",
            )

        except Exception as e:
            self.logger.error(f"Error in concept drift detection: {e}")
            return DriftDetectionResult(
                drift_detected=False,
                drift_score=0.0,
                drift_type="error",
                confidence=0.0,
                affected_features=[],
                timestamp=time.time(),
                severity="low",
            )


class PerformanceMonitor:
    """
    Comprehensive performance monitoring dashboard
    """

    def __init__(self, metrics_window: int = 1000):
        self.metrics_window = metrics_window
        self.performance_history = deque(maxlen=metrics_window)
        self.drift_detector = ConceptDriftDetector()
        self.spc = StatisticalProcessControl()
        self.alert_thresholds = {
            "accuracy_threshold": 0.7,
            "sharpe_threshold": 1.5,
            "drawdown_threshold": -0.1,
            "drift_threshold": 0.8,
        }
        self.logger = logging.getLogger(__name__)

    def update_performance(
        self, prediction: float, target: float, features: np.ndarray, trade_outcome: float = None
    ):
        """Update performance metrics"""
        try:
            # Update drift detector
            self.drift_detector.update(prediction, target, features)

            # Calculate metrics
            error = abs(prediction - target)
            accuracy = 1.0 if error < 0.1 else 0.0  # Simplified accuracy

            # Calculate trading metrics if available
            sharpe_ratio = 0.0
            win_rate = 0.0
            profit_factor = 0.0
            max_drawdown = 0.0

            if trade_outcome is not None:
                # Simplified trading metrics calculation
                sharpe_ratio = trade_outcome / max(0.01, abs(trade_outcome))
                win_rate = 1.0 if trade_outcome > 0 else 0.0
                profit_factor = max(0.01, trade_outcome) if trade_outcome > 0 else 0.01
                max_drawdown = min(0.0, trade_outcome)

            metrics = PerformanceMetrics(
                accuracy=accuracy,
                precision=accuracy,  # Simplified
                recall=accuracy,  # Simplified
                f1_score=accuracy,  # Simplified
                mse=error**2,
                mae=error,
                sharpe_ratio=sharpe_ratio,
                win_rate=win_rate,
                profit_factor=profit_factor,
                max_drawdown=max_drawdown,
                timestamp=time.time(),
            )

            self.performance_history.append(metrics)

        except Exception as e:
            self.logger.error(f"Error updating performance: {e}")

    def get_performance_summary(self) -> dict[str, Any]:
        """Get comprehensive performance summary"""
        try:
            if not self.performance_history:
                return {}

            recent_metrics = list(self.performance_history)[-100:]

            summary = {
                "total_predictions": len(self.performance_history),
                "recent_predictions": len(recent_metrics),
                "avg_accuracy": np.mean([m.accuracy for m in recent_metrics]),
                "avg_mse": np.mean([m.mse for m in recent_metrics]),
                "avg_mae": np.mean([m.mae for m in recent_metrics]),
                "avg_sharpe": np.mean([m.sharpe_ratio for m in recent_metrics]),
                "avg_win_rate": np.mean([m.win_rate for m in recent_metrics]),
                "avg_profit_factor": np.mean([m.profit_factor for m in recent_metrics]),
                "max_drawdown": min([m.max_drawdown for m in recent_metrics]),
                "performance_trend": self._calculate_trend(recent_metrics),
                "alerts": self._check_alerts(recent_metrics),
            }

            return summary

        except Exception as e:
            self.logger.error(f"Error getting performance summary: {e}")
            return {}

    def _calculate_trend(self, metrics: list[PerformanceMetrics]) -> str:
        """Calculate performance trend"""
        try:
            if len(metrics) < 10:
                return "insufficient_data"

            recent_accuracy = np.mean([m.accuracy for m in metrics[-10:]])
            older_accuracy = np.mean([m.accuracy for m in metrics[:-10]])

            if recent_accuracy > older_accuracy + 0.05:
                return "improving"
            elif recent_accuracy < older_accuracy - 0.05:
                return "declining"
            else:
                return "stable"

        except Exception:
            return "unknown"

    def _check_alerts(self, metrics: list[PerformanceMetrics]) -> list[dict[str, Any]]:
        """Check for performance alerts"""
        alerts = []

        try:
            recent_accuracy = np.mean([m.accuracy for m in metrics])
            recent_sharpe = np.mean([m.sharpe_ratio for m in metrics])
            recent_drawdown = min([m.max_drawdown for m in metrics])

            if recent_accuracy < self.alert_thresholds["accuracy_threshold"]:
                alerts.append(
                    {
                        "type": "low_accuracy",
                        "severity": "high",
                        "message": f'Accuracy {recent_accuracy:.3f} below threshold {self.alert_thresholds["accuracy_threshold"]}',
                    }
                )

            if recent_sharpe < self.alert_thresholds["sharpe_threshold"]:
                alerts.append(
                    {
                        "type": "low_sharpe",
                        "severity": "medium",
                        "message": f'Sharpe ratio {recent_sharpe:.3f} below threshold {self.alert_thresholds["sharpe_threshold"]}',
                    }
                )

            if recent_drawdown < self.alert_thresholds["drawdown_threshold"]:
                alerts.append(
                    {
                        "type": "high_drawdown",
                        "severity": "high",
                        "message": f'Max drawdown {recent_drawdown:.3f} below threshold {self.alert_thresholds["drawdown_threshold"]}',
                    }
                )

        except Exception as e:
            self.logger.error(f"Error checking alerts: {e}")

        return alerts


class ABTestingFramework:
    """
    A/B testing framework for model comparison
    """

    def __init__(self, test_duration: int = 1000, confidence_level: float = 0.95):
        self.test_duration = test_duration
        self.confidence_level = confidence_level
        self.test_groups = {}
        self.test_results = {}
        self.active_tests = {}
        self.logger = logging.getLogger(__name__)

    def start_test(
        self, test_name: str, model_a: str, model_b: str, traffic_split: float = 0.5
    ) -> str:
        """Start A/B test"""
        try:
            test_id = f"{test_name}_{int(time.time())}"

            self.active_tests[test_id] = {
                "test_name": test_name,
                "model_a": model_a,
                "model_b": model_b,
                "traffic_split": traffic_split,
                "start_time": time.time(),
                "group_a_results": [],
                "group_b_results": [],
                "status": "active",
            }

            self.logger.info(f"Started A/B test: {test_id}")
            return test_id

        except Exception as e:
            self.logger.error(f"Error starting A/B test: {e}")
            return ""

    def record_result(
        self, test_id: str, model_name: str, prediction: float, target: float, outcome: float = None
    ):
        """Record test result"""
        try:
            if test_id not in self.active_tests:
                return

            test = self.active_tests[test_id]
            error = abs(prediction - target)

            result = {
                "prediction": prediction,
                "target": target,
                "error": error,
                "outcome": outcome,
                "timestamp": time.time(),
            }

            if model_name == test["model_a"]:
                test["group_a_results"].append(result)
            elif model_name == test["model_b"]:
                test["group_b_results"].append(result)

            # Check if test is complete
            total_results = len(test["group_a_results"]) + len(test["group_b_results"])
            if total_results >= self.test_duration:
                self._complete_test(test_id)

        except Exception as e:
            self.logger.error(f"Error recording A/B test result: {e}")

    def _complete_test(self, test_id: str):
        """Complete A/B test and calculate results"""
        try:
            test = self.active_tests[test_id]

            if len(test["group_a_results"]) < 10 or len(test["group_b_results"]) < 10:
                test["status"] = "insufficient_data"
                return

            # Calculate metrics for each group
            group_a_errors = [r["error"] for r in test["group_a_results"]]
            group_b_errors = [r["error"] for r in test["group_b_results"]]

            # Statistical test
            t_stat, p_value = stats.ttest_ind(group_a_errors, group_b_errors)

            # Determine winner
            mean_a = np.mean(group_a_errors)
            mean_b = np.mean(group_b_errors)

            if p_value < (1.0 - self.confidence_level):
                if mean_a < mean_b:
                    winner = test["model_a"]
                    improvement = (mean_b - mean_a) / mean_b
                else:
                    winner = test["model_b"]
                    improvement = (mean_a - mean_b) / mean_a
            else:
                winner = "no_significant_difference"
                improvement = 0.0

            test["status"] = "completed"
            test["results"] = {
                "winner": winner,
                "p_value": p_value,
                "improvement": improvement,
                "mean_error_a": mean_a,
                "mean_error_b": mean_b,
                "sample_size_a": len(group_a_errors),
                "sample_size_b": len(group_b_errors),
            }

            self.test_results[test_id] = test
            self.logger.info(f"A/B test {test_id} completed. Winner: {winner}")

        except Exception as e:
            self.logger.error(f"Error completing A/B test: {e}")

    def get_test_status(self, test_id: str) -> dict[str, Any]:
        """Get A/B test status"""
        try:
            if test_id in self.active_tests:
                test = self.active_tests[test_id]
                return {
                    "status": test["status"],
                    "progress": len(test["group_a_results"]) + len(test["group_b_results"]),
                    "total_required": self.test_duration,
                    "group_a_size": len(test["group_a_results"]),
                    "group_b_size": len(test["group_b_results"]),
                }
            elif test_id in self.test_results:
                return {"status": "completed", "results": self.test_results[test_id]["results"]}
            else:
                return {"status": "not_found"}

        except Exception as e:
            self.logger.error(f"Error getting test status: {e}")
            return {"status": "error"}


class MonitoringSystem:
    """
    Complete monitoring and drift detection system
    """

    def __init__(self, models: dict[str, Any] = None):
        self.models = models or {}
        self.performance_monitor = PerformanceMonitor()
        self.ab_testing = ABTestingFramework()
        self.drift_detectors = {}
        self.alert_history = []
        self.logger = logging.getLogger(__name__)

        self._initialize_drift_detectors()

    def _initialize_drift_detectors(self):
        """Initialize drift detectors for each model"""
        try:
            for name in self.models:
                self.drift_detectors[name] = {
                    "concept_drift": ConceptDriftDetector(),
                    "statistical_control": StatisticalProcessControl(),
                }

            self.logger.info(f"Initialized drift detectors for {len(self.models)} models")

        except Exception as e:
            self.logger.error(f"Error initializing drift detectors: {e}")

    def update_monitoring(
        self,
        model_name: str,
        prediction: float,
        target: float,
        features: np.ndarray,
        trade_outcome: float = None,
    ):
        """Update all monitoring systems"""
        try:
            # Update performance monitor
            self.performance_monitor.update_performance(prediction, target, features, trade_outcome)

            # Update drift detectors
            if model_name in self.drift_detectors:
                drift_detector = self.drift_detectors[model_name]["concept_drift"]
                drift_detector.update(prediction, target, features)

                # Check for drift
                drift_result = drift_detector.detect_concept_drift()
                if drift_result.drift_detected:
                    self._handle_drift_alert(model_name, drift_result)

        except Exception as e:
            self.logger.error(f"Error updating monitoring: {e}")

    def _handle_drift_alert(self, model_name: str, drift_result: DriftDetectionResult):
        """Handle drift detection alert"""
        try:
            alert = {
                "model_name": model_name,
                "drift_type": drift_result.drift_type,
                "drift_score": drift_result.drift_score,
                "severity": drift_result.severity,
                "timestamp": drift_result.timestamp,
                "message": f"Drift detected in {model_name}: {drift_result.drift_type}",
            }

            self.alert_history.append(alert)
            self.logger.warning(f"DRIFT ALERT: {alert['message']}")

        except Exception as e:
            self.logger.error(f"Error handling drift alert: {e}")

    def get_system_status(self) -> dict[str, Any]:
        """Get comprehensive system status"""
        try:
            performance_summary = self.performance_monitor.get_performance_summary()

            # Get drift status
            drift_status = {}
            for model_name, detectors in self.drift_detectors.items():
                concept_drift = detectors["concept_drift"].detect_concept_drift()
                drift_status[model_name] = {
                    "drift_detected": concept_drift.drift_detected,
                    "drift_score": concept_drift.drift_score,
                    "drift_type": concept_drift.drift_type,
                    "severity": concept_drift.severity,
                }

            return {
                "performance": performance_summary,
                "drift_status": drift_status,
                "active_alerts": len(
                    [a for a in self.alert_history if a["timestamp"] > time.time() - 3600]
                ),
                "total_alerts": len(self.alert_history),
                "system_health": (
                    "healthy" if len(performance_summary.get("alerts", [])) == 0 else "warning"
                ),
            }

        except Exception as e:
            self.logger.error(f"Error getting system status: {e}")
            return {"system_health": "error"}


# Example usage
if __name__ == "__main__":
    # Initialize monitoring system
    models = {"model1": None, "model2": None}
    monitoring = MonitoringSystem(models)

    # Simulate some data
    for _i in range(100):
        prediction = 0.5 + np.random.normal(0, 0.1)
        target = 0.5 + np.random.normal(0, 0.05)
        features = np.random.normal(0, 1, 10)

        monitoring.update_monitoring("model1", prediction, target, features)

    # Get system status
    status = monitoring.get_system_status()
    print(f"System Health: {status['system_health']}")
    print(f"Active Alerts: {status['active_alerts']}")
    print(f"Performance: {status['performance']}")
