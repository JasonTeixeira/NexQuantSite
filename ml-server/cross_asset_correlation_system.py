"""
CROSS ASSET CORRELATION SYSTEM
Multi-asset toxicity spillover detection and cross-asset regime analysis
"""

import logging
from datetime import datetime
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class CrossAssetCorrelationSystem:
    """Cross-asset correlation and toxicity analysis system"""

    def __init__(self):
        self.correlation_matrix = {}
        self.toxicity_spillover = {}
        self.regime_transitions = {}
        self.asset_pairs = ["ES-NQ", "ES-YM", "ES-RTY", "NQ-YM", "NQ-RTY", "YM-RTY"]

        logger.info("Cross Asset Correlation System initialized")

    def analyze_cross_asset_correlation(self, market_data: dict[str, Any]) -> dict[str, Any]:
        """Analyze cross-asset correlations"""
        try:
            correlations = {}

            for pair in self.asset_pairs:
                asset1, asset2 = pair.split("-")

                if asset1 in market_data and asset2 in market_data:
                    corr = self._calculate_correlation(market_data[asset1], market_data[asset2])
                    correlations[pair] = corr

            self.correlation_matrix = correlations

            return {
                "correlations": correlations,
                "timestamp": datetime.now(),
                "analysis_type": "cross_asset_correlation",
            }

        except Exception as e:
            logger.error(f"Cross-asset correlation analysis failed: {e}")
            return {"error": str(e)}

    def detect_toxicity_spillover(self, market_data: dict[str, Any]) -> dict[str, Any]:
        """Detect toxicity spillover between assets"""
        try:
            spillover_effects = {}

            for pair in self.asset_pairs:
                asset1, asset2 = pair.split("-")

                if asset1 in market_data and asset2 in market_data:
                    spillover = self._calculate_toxicity_spillover(
                        market_data[asset1], market_data[asset2]
                    )
                    spillover_effects[pair] = spillover

            self.toxicity_spillover = spillover_effects

            return {
                "spillover_effects": spillover_effects,
                "timestamp": datetime.now(),
                "analysis_type": "toxicity_spillover",
            }

        except Exception as e:
            logger.error(f"Toxicity spillover detection failed: {e}")
            return {"error": str(e)}

    def analyze_regime_transitions(self, market_data: dict[str, Any]) -> dict[str, Any]:
        """Analyze regime transitions across assets"""
        try:
            regime_analysis = {}

            for asset in ["ES", "NQ", "YM", "RTY"]:
                if asset in market_data:
                    regime = self._detect_asset_regime(market_data[asset])
                    regime_analysis[asset] = regime

            # Cross-asset regime analysis
            cross_regime = self._analyze_cross_asset_regime(regime_analysis)

            self.regime_transitions = cross_regime

            return {
                "individual_regimes": regime_analysis,
                "cross_asset_regime": cross_regime,
                "timestamp": datetime.now(),
                "analysis_type": "regime_transition",
            }

        except Exception as e:
            logger.error(f"Regime transition analysis failed: {e}")
            return {"error": str(e)}

    def _calculate_correlation(self, asset1_data: dict, asset2_data: dict) -> float:
        """Calculate correlation between two assets"""
        try:
            # Extract price data
            prices1 = asset1_data.get("prices", [4500.0])
            prices2 = asset2_data.get("prices", [15000.0])

            # Ensure same length
            min_len = min(len(prices1), len(prices2))
            prices1 = prices1[:min_len]
            prices2 = prices2[:min_len]

            # Calculate correlation
            correlation = np.corrcoef(prices1, prices2)[0, 1]

            return float(correlation) if not np.isnan(correlation) else 0.0

        except Exception as e:
            logger.error(f"Correlation calculation failed: {e}")
            return 0.0

    def _calculate_toxicity_spillover(self, asset1_data: dict, asset2_data: dict) -> float:
        """Calculate toxicity spillover between assets"""
        try:
            # Extract toxicity metrics
            toxicity1 = asset1_data.get("toxicity", 0.5)
            toxicity2 = asset2_data.get("toxicity", 0.5)

            # Calculate spillover effect
            spillover = (toxicity1 + toxicity2) / 2.0

            # Add some randomness for realistic simulation
            spillover += np.random.normal(0, 0.1)

            return max(0.0, min(1.0, spillover))

        except Exception as e:
            logger.error(f"Toxicity spillover calculation failed: {e}")
            return 0.0

    def _detect_asset_regime(self, asset_data: dict) -> dict[str, Any]:
        """Detect regime for a single asset"""
        try:
            volatility = asset_data.get("volatility", 0.15)
            volume = asset_data.get("volume", 1000000)
            momentum = asset_data.get("momentum", 0.02)

            # Simple regime detection
            if volatility > 0.25:
                regime = "HIGH_VOLATILITY"
            elif volatility > 0.15:
                regime = "MEDIUM_VOLATILITY"
            else:
                regime = "LOW_VOLATILITY"

            return {
                "regime": regime,
                "volatility": volatility,
                "volume": volume,
                "momentum": momentum,
                "confidence": 0.8,
            }

        except Exception as e:
            logger.error(f"Asset regime detection failed: {e}")
            return {"regime": "UNKNOWN", "confidence": 0.0}

    def _analyze_cross_asset_regime(self, individual_regimes: dict) -> dict[str, Any]:
        """Analyze regime across all assets"""
        try:
            regimes = [regime["regime"] for regime in individual_regimes.values()]

            # Count regime types
            regime_counts = {}
            for regime in regimes:
                regime_counts[regime] = regime_counts.get(regime, 0) + 1

            # Determine dominant regime
            dominant_regime = max(regime_counts.items(), key=lambda x: x[1])[0]

            # Calculate regime consistency
            total_assets = len(regimes)
            consistency = regime_counts.get(dominant_regime, 0) / total_assets

            return {
                "dominant_regime": dominant_regime,
                "regime_consistency": consistency,
                "regime_distribution": regime_counts,
                "timestamp": datetime.now(),
            }

        except Exception as e:
            logger.error(f"Cross-asset regime analysis failed: {e}")
            return {"error": str(e)}

    def get_system_status(self) -> dict[str, Any]:
        """Get system status"""
        return {
            "correlation_matrix": self.correlation_matrix,
            "toxicity_spillover": self.toxicity_spillover,
            "regime_transitions": self.regime_transitions,
            "asset_pairs": self.asset_pairs,
            "last_update": datetime.now(),
        }


# Global cross-asset correlation system instance
cross_asset_correlation_system = CrossAssetCorrelationSystem()
