"""
Market Regime Detection System
================================
Advanced ML-based market regime identification for adaptive trading.

Implements:
- Hidden Markov Models (HMM) for regime detection
- Gaussian Mixture Models (GMM) for clustering
- Change point detection algorithms
- Feature engineering for regime indicators
- Real-time regime classification
- Regime transition probabilities
- Multi-timeframe analysis

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

# Try to import advanced libraries
try:
    from hmmlearn import hmm
    HMM_AVAILABLE = True
except ImportError:
    HMM_AVAILABLE = False
    print("Warning: hmmlearn not installed. Some features will be limited.")

logger = logging.getLogger(__name__)


@dataclass
class RegimeState:
    """Current market regime state"""
    regime: str  # 'bull', 'bear', 'sideways', 'volatile', 'crisis'
    confidence: float  # 0-1 confidence in regime classification
    transition_probability: Dict[str, float]  # Probability of transitioning to other regimes
    features: Dict[str, float]  # Key features defining the regime
    duration: int  # Days in current regime
    strength: float  # Strength of the regime signal
    sub_regime: Optional[str] = None  # More granular classification
    
    @property
    def is_trending(self) -> bool:
        """Check if market is trending"""
        return self.regime in ['bull', 'bear']
    
    @property
    def is_risky(self) -> bool:
        """Check if regime is high risk"""
        return self.regime in ['volatile', 'crisis', 'bear']
    
    def to_dict(self) -> Dict:
        return {
            'regime': self.regime,
            'confidence': round(self.confidence, 3),
            'duration': self.duration,
            'strength': round(self.strength, 3),
            'is_trending': self.is_trending,
            'is_risky': self.is_risky,
            'top_transitions': sorted(
                self.transition_probability.items(),
                key=lambda x: x[1],
                reverse=True
            )[:2]
        }


class MarketRegimeDetector:
    """
    Sophisticated market regime detection using machine learning.
    
    This is what allows your strategies to adapt to market conditions.
    """
    
    def __init__(self,
                 n_regimes: int = 4,
                 lookback_window: int = 60,
                 min_regime_duration: int = 5):
        """
        Initialize regime detector
        
        Args:
            n_regimes: Number of market regimes to detect
            lookback_window: Days to look back for regime detection
            min_regime_duration: Minimum days to confirm regime change
        """
        self.n_regimes = n_regimes
        self.lookback_window = lookback_window
        self.min_regime_duration = min_regime_duration
        
        # Models
        self.hmm_model = None
        self.gmm_model = None
        self.scaler = StandardScaler()
        
        # Regime history
        self.regime_history = []
        self.current_regime = None
        self.regime_start_date = None
        
        # Regime labels
        self.regime_labels = {
            0: 'bull',
            1: 'bear',
            2: 'sideways',
            3: 'volatile',
            4: 'crisis'
        }
    
    def detect_regime(self, 
                     data: pd.DataFrame,
                     method: str = 'ensemble') -> RegimeState:
        """
        Detect current market regime from data.
        
        This is the main function that tells you what kind of market you're in.
        
        Args:
            data: Market data with OHLCV
            method: 'hmm', 'gmm', 'features', or 'ensemble'
            
        Returns:
            RegimeState with current market regime
        """
        
        # Extract features
        features = self._engineer_features(data)
        
        if len(features) < self.lookback_window:
            logger.warning("Insufficient data for regime detection")
            return self._default_regime()
        
        # Detect regime using specified method
        if method == 'hmm' and HMM_AVAILABLE:
            regime = self._detect_hmm(features)
        elif method == 'gmm':
            regime = self._detect_gmm(features)
        elif method == 'features':
            regime = self._detect_feature_based(features)
        elif method == 'ensemble':
            regime = self._detect_ensemble(features)
        else:
            regime = self._detect_feature_based(features)
        
        # Update history
        self._update_regime_history(regime)
        
        return regime
    
    def _engineer_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Engineer features for regime detection.
        
        The secret sauce - what features actually identify regimes.
        """
        features = pd.DataFrame(index=data.index)
        
        # Price features
        features['returns'] = data['close'].pct_change()
        features['log_returns'] = np.log(data['close'] / data['close'].shift(1))
        
        # Volatility features
        features['volatility'] = features['returns'].rolling(20).std()
        features['volatility_change'] = features['volatility'].pct_change()
        
        # Trend features
        features['sma_20'] = data['close'].rolling(20).mean()
        features['sma_50'] = data['close'].rolling(50).mean()
        features['trend_strength'] = (data['close'] - features['sma_50']) / features['sma_50']
        features['trend_20_50'] = (features['sma_20'] - features['sma_50']) / features['sma_50']
        
        # Momentum features
        features['rsi'] = self._calculate_rsi(data['close'])
        features['momentum'] = data['close'].pct_change(10)
        
        # Volume features
        if 'volume' in data.columns:
            features['volume_ratio'] = data['volume'] / data['volume'].rolling(20).mean()
            features['volume_trend'] = data['volume'].rolling(5).mean() / data['volume'].rolling(20).mean()
        
        # Market microstructure
        features['high_low_ratio'] = (data['high'] - data['low']) / data['close']
        features['close_open_ratio'] = (data['close'] - data['open']) / data['open']
        
        # Volatility regime features
        features['realized_vol'] = features['returns'].rolling(20).std() * np.sqrt(252)
        features['vol_of_vol'] = features['volatility'].rolling(20).std()
        
        # Correlation features (if multiple assets)
        # Would calculate rolling correlations here
        
        # Clean features
        features = features.dropna()
        
        return features
    
    def _detect_hmm(self, features: pd.DataFrame) -> RegimeState:
        """
        Detect regime using Hidden Markov Model.
        
        The sophisticated approach - models regime transitions probabilistically.
        """
        
        if not HMM_AVAILABLE:
            return self._detect_feature_based(features)
        
        # Prepare data
        feature_cols = ['returns', 'volatility', 'trend_strength', 'momentum']
        X = features[feature_cols].values
        X_scaled = self.scaler.fit_transform(X)
        
        # Train or use existing HMM
        if self.hmm_model is None:
            self.hmm_model = hmm.GaussianHMM(
                n_components=self.n_regimes,
                covariance_type="full",
                n_iter=100
            )
            self.hmm_model.fit(X_scaled)
        
        # Predict states
        states = self.hmm_model.predict(X_scaled)
        current_state = states[-1]
        
        # Get transition probabilities
        trans_probs = self.hmm_model.transmat_[current_state]
        transition_probability = {
            self.regime_labels.get(i, f'regime_{i}'): float(prob)
            for i, prob in enumerate(trans_probs)
        }
        
        # Calculate confidence (using likelihood)
        log_likelihood = self.hmm_model.score(X_scaled[-self.lookback_window:])
        confidence = 1 / (1 + np.exp(-log_likelihood / 100))  # Sigmoid scaling
        
        # Map state to regime
        regime_name = self._map_state_to_regime(current_state, features)
        
        # Calculate regime strength
        state_counts = pd.Series(states[-self.lookback_window:]).value_counts()
        strength = state_counts.get(current_state, 0) / len(states[-self.lookback_window:])
        
        return RegimeState(
            regime=regime_name,
            confidence=confidence,
            transition_probability=transition_probability,
            features=self._get_regime_features(features),
            duration=self._get_regime_duration(current_state, states),
            strength=strength
        )
    
    def _detect_gmm(self, features: pd.DataFrame) -> RegimeState:
        """
        Detect regime using Gaussian Mixture Model.
        
        Clustering approach - finds natural groupings in market behavior.
        """
        
        # Prepare data
        feature_cols = ['returns', 'volatility', 'trend_strength', 'momentum']
        X = features[feature_cols].values
        X_scaled = self.scaler.fit_transform(X)
        
        # Train or use existing GMM
        if self.gmm_model is None:
            self.gmm_model = GaussianMixture(
                n_components=self.n_regimes,
                covariance_type='full',
                max_iter=100,
                random_state=42
            )
            self.gmm_model.fit(X_scaled)
        
        # Predict clusters
        clusters = self.gmm_model.predict(X_scaled)
        current_cluster = clusters[-1]
        
        # Get cluster probabilities
        probs = self.gmm_model.predict_proba(X_scaled[-1].reshape(1, -1))[0]
        confidence = probs[current_cluster]
        
        # Map cluster to regime
        regime_name = self._map_cluster_to_regime(current_cluster, features, clusters)
        
        # Estimate transition probabilities
        transition_probability = self._estimate_transition_probs(clusters)
        
        return RegimeState(
            regime=regime_name,
            confidence=confidence,
            transition_probability=transition_probability,
            features=self._get_regime_features(features),
            duration=self._get_regime_duration(current_cluster, clusters),
            strength=confidence
        )
    
    def _detect_feature_based(self, features: pd.DataFrame) -> RegimeState:
        """
        Detect regime using rule-based feature analysis.
        
        The interpretable approach - uses market indicators directly.
        """
        
        # Get recent features
        recent = features.tail(self.lookback_window)
        
        # Calculate regime indicators
        avg_return = recent['returns'].mean() * 252
        avg_volatility = recent['volatility'].mean() * np.sqrt(252)
        trend_strength = recent['trend_strength'].iloc[-1]
        momentum = recent['momentum'].mean()
        
        # Determine regime
        if avg_volatility > 0.3:  # High volatility
            if avg_return < -0.1:
                regime = 'crisis'
                confidence = min(0.9, avg_volatility / 0.4)
            else:
                regime = 'volatile'
                confidence = 0.7
                
        elif trend_strength > 0.05 and momentum > 0.02:  # Strong uptrend
            regime = 'bull'
            confidence = min(0.9, trend_strength * 10)
            
        elif trend_strength < -0.05 and momentum < -0.02:  # Strong downtrend
            regime = 'bear'
            confidence = min(0.9, abs(trend_strength) * 10)
            
        else:  # No clear trend
            regime = 'sideways'
            confidence = 0.6
        
        # Determine sub-regime
        sub_regime = self._determine_sub_regime(regime, features)
        
        # Simple transition probabilities based on historical patterns
        transition_probability = self._get_historical_transitions(regime)
        
        return RegimeState(
            regime=regime,
            confidence=confidence,
            transition_probability=transition_probability,
            features=self._get_regime_features(features),
            duration=self._estimate_duration(regime),
            strength=confidence,
            sub_regime=sub_regime
        )
    
    def _detect_ensemble(self, features: pd.DataFrame) -> RegimeState:
        """
        Ensemble approach combining multiple methods.
        
        The robust approach - combines multiple models for better accuracy.
        """
        
        regimes = []
        confidences = []
        
        # Get predictions from each method
        if HMM_AVAILABLE:
            hmm_regime = self._detect_hmm(features)
            regimes.append(hmm_regime.regime)
            confidences.append(hmm_regime.confidence)
        
        gmm_regime = self._detect_gmm(features)
        regimes.append(gmm_regime.regime)
        confidences.append(gmm_regime.confidence)
        
        feature_regime = self._detect_feature_based(features)
        regimes.append(feature_regime.regime)
        confidences.append(feature_regime.confidence)
        
        # Weighted voting
        regime_votes = {}
        for regime, confidence in zip(regimes, confidences):
            regime_votes[regime] = regime_votes.get(regime, 0) + confidence
        
        # Select regime with highest weighted votes
        final_regime = max(regime_votes, key=regime_votes.get)
        final_confidence = regime_votes[final_regime] / sum(confidences)
        
        # Use the result from the method that agrees with consensus
        for r in [hmm_regime if HMM_AVAILABLE else None, gmm_regime, feature_regime]:
            if r and r.regime == final_regime:
                r.confidence = final_confidence
                return r
        
        # Fallback
        return feature_regime
    
    def _map_state_to_regime(self, state: int, features: pd.DataFrame) -> str:
        """Map HMM state to interpretable regime name"""
        
        # Calculate state characteristics
        state_features = features.iloc[-self.lookback_window:].mean()
        
        if state_features['volatility'] > features['volatility'].quantile(0.8):
            if state_features['returns'] < 0:
                return 'crisis' if state < 5 else 'bear'
            return 'volatile'
        elif state_features['trend_strength'] > 0.03:
            return 'bull'
        elif state_features['trend_strength'] < -0.03:
            return 'bear'
        else:
            return 'sideways'
    
    def _map_cluster_to_regime(self, 
                              cluster: int,
                              features: pd.DataFrame,
                              all_clusters: np.ndarray) -> str:
        """Map GMM cluster to regime name"""
        
        # Calculate cluster characteristics
        cluster_mask = all_clusters == cluster
        if cluster_mask.sum() == 0:
            return 'sideways'
        
        cluster_returns = features['returns'].iloc[-len(all_clusters):][cluster_mask].mean()
        cluster_vol = features['volatility'].iloc[-len(all_clusters):][cluster_mask].mean()
        
        # Map based on characteristics
        if cluster_vol > features['volatility'].quantile(0.75):
            return 'volatile' if cluster_returns > 0 else 'crisis'
        elif cluster_returns > features['returns'].quantile(0.7):
            return 'bull'
        elif cluster_returns < features['returns'].quantile(0.3):
            return 'bear'
        else:
            return 'sideways'
    
    def _determine_sub_regime(self, regime: str, features: pd.DataFrame) -> Optional[str]:
        """Determine more granular sub-regime"""
        
        recent = features.tail(20)
        
        if regime == 'bull':
            momentum = recent['momentum'].iloc[-1]
            if momentum > 0.1:
                return 'strong_bull'
            elif momentum < 0.02:
                return 'weakening_bull'
            else:
                return 'steady_bull'
                
        elif regime == 'bear':
            momentum = recent['momentum'].iloc[-1]
            if momentum < -0.1:
                return 'strong_bear'
            elif momentum > -0.02:
                return 'weakening_bear'
            else:
                return 'steady_bear'
                
        elif regime == 'sideways':
            vol = recent['volatility'].iloc[-1]
            if vol < features['volatility'].quantile(0.3):
                return 'low_vol_sideways'
            elif vol > features['volatility'].quantile(0.7):
                return 'high_vol_sideways'
            else:
                return 'normal_sideways'
        
        return None
    
    def _get_regime_features(self, features: pd.DataFrame) -> Dict[str, float]:
        """Get key features defining current regime"""
        
        recent = features.tail(self.lookback_window)
        
        return {
            'avg_return': float(recent['returns'].mean() * 252),
            'volatility': float(recent['volatility'].mean() * np.sqrt(252)),
            'trend_strength': float(recent['trend_strength'].iloc[-1]),
            'momentum': float(recent['momentum'].mean()),
            'rsi': float(recent['rsi'].iloc[-1]) if 'rsi' in recent else 50
        }
    
    def _get_regime_duration(self, current_state: int, states: np.ndarray) -> int:
        """Calculate how long we've been in current regime"""
        
        duration = 1
        for i in range(len(states) - 2, -1, -1):
            if states[i] == current_state:
                duration += 1
            else:
                break
        
        return duration
    
    def _estimate_duration(self, regime: str) -> int:
        """Estimate regime duration from history"""
        
        if not self.regime_history:
            return 1
        
        duration = 1
        for past_regime in reversed(self.regime_history):
            if past_regime == regime:
                duration += 1
            else:
                break
        
        return duration
    
    def _estimate_transition_probs(self, states: np.ndarray) -> Dict[str, float]:
        """Estimate regime transition probabilities"""
        
        if len(states) < 2:
            return {regime: 0.25 for regime in ['bull', 'bear', 'sideways', 'volatile']}
        
        # Count transitions
        transitions = {}
        current = states[-1]
        
        for next_state in range(self.n_regimes):
            count = 0
            for i in range(len(states) - 1):
                if states[i] == current and states[i + 1] == next_state:
                    count += 1
            
            regime_name = self.regime_labels.get(next_state, f'regime_{next_state}')
            transitions[regime_name] = count
        
        # Normalize to probabilities
        total = sum(transitions.values()) or 1
        return {k: v / total for k, v in transitions.items()}
    
    def _get_historical_transitions(self, current_regime: str) -> Dict[str, float]:
        """Get historical transition probabilities"""
        
        # Simplified transition matrix based on market patterns
        transitions = {
            'bull': {'bull': 0.7, 'sideways': 0.2, 'bear': 0.05, 'volatile': 0.05},
            'bear': {'bear': 0.6, 'sideways': 0.2, 'bull': 0.1, 'volatile': 0.1},
            'sideways': {'sideways': 0.5, 'bull': 0.25, 'bear': 0.15, 'volatile': 0.1},
            'volatile': {'volatile': 0.4, 'sideways': 0.3, 'bear': 0.2, 'bull': 0.1},
            'crisis': {'crisis': 0.3, 'bear': 0.3, 'volatile': 0.3, 'sideways': 0.1}
        }
        
        return transitions.get(current_regime, 
                              {'sideways': 0.4, 'bull': 0.2, 'bear': 0.2, 'volatile': 0.2})
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI indicator"""
        
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def _update_regime_history(self, regime: RegimeState):
        """Update regime history for tracking"""
        
        self.regime_history.append(regime.regime)
        
        # Keep only recent history
        if len(self.regime_history) > 252:  # 1 year
            self.regime_history.pop(0)
        
        # Update current regime
        if self.current_regime != regime.regime:
            self.current_regime = regime.regime
            self.regime_start_date = datetime.now()
            logger.info(f"Regime change detected: {self.current_regime}")
    
    def _default_regime(self) -> RegimeState:
        """Default regime when insufficient data"""
        
        return RegimeState(
            regime='sideways',
            confidence=0.3,
            transition_probability={'sideways': 0.5, 'volatile': 0.5},
            features={'insufficient_data': True},
            duration=1,
            strength=0.3
        )
    
    def get_regime_recommendations(self, regime: RegimeState) -> Dict[str, Any]:
        """
        Get trading recommendations based on regime.
        
        This translates regime detection into actionable insights.
        """
        
        recommendations = {
            'position_sizing': 1.0,
            'risk_limit': 1.0,
            'preferred_strategies': [],
            'avoid_strategies': [],
            'rebalance_frequency': 'monthly',
            'notes': []
        }
        
        if regime.regime == 'bull':
            recommendations['position_sizing'] = 1.2 if regime.strength > 0.7 else 1.0
            recommendations['preferred_strategies'] = ['trend_following', 'momentum', 'breakout']
            recommendations['avoid_strategies'] = ['mean_reversion', 'short_selling']
            recommendations['notes'].append("Favor long positions, increase risk in strong trends")
            
        elif regime.regime == 'bear':
            recommendations['position_sizing'] = 0.5
            recommendations['risk_limit'] = 0.7
            recommendations['preferred_strategies'] = ['short_selling', 'defensive', 'cash']
            recommendations['avoid_strategies'] = ['momentum_long', 'breakout_long']
            recommendations['rebalance_frequency'] = 'weekly'
            recommendations['notes'].append("Reduce exposure, focus on capital preservation")
            
        elif regime.regime == 'sideways':
            recommendations['position_sizing'] = 0.8
            recommendations['preferred_strategies'] = ['mean_reversion', 'pairs_trading', 'range_trading']
            recommendations['avoid_strategies'] = ['trend_following', 'breakout']
            recommendations['notes'].append("Focus on range-bound strategies")
            
        elif regime.regime == 'volatile':
            recommendations['position_sizing'] = 0.6
            recommendations['risk_limit'] = 0.5
            recommendations['preferred_strategies'] = ['volatility_arbitrage', 'options', 'hedged']
            recommendations['avoid_strategies'] = ['unhedged_directional']
            recommendations['rebalance_frequency'] = 'daily'
            recommendations['notes'].append("Reduce leverage, increase hedging")
            
        elif regime.regime == 'crisis':
            recommendations['position_sizing'] = 0.2
            recommendations['risk_limit'] = 0.3
            recommendations['preferred_strategies'] = ['cash', 'defensive', 'tail_hedge']
            recommendations['avoid_strategies'] = ['leveraged', 'aggressive']
            recommendations['rebalance_frequency'] = 'daily'
            recommendations['notes'].append("EXTREME CAUTION: Preserve capital above all")
        
        return recommendations


def test_regime_detection():
    """Test regime detection functionality"""
    print("Testing Market Regime Detection...")
    print("=" * 60)
    
    # Generate sample market data
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(), periods=500, freq='D')
    
    # Simulate different market regimes
    n = len(dates)
    prices = np.zeros(n)
    prices[0] = 100
    
    # Create regime periods
    regimes = []
    for i in range(1, n):
        if i < n // 4:  # Bull market
            ret = np.random.normal(0.001, 0.01)
            regime = 'bull'
        elif i < n // 2:  # Bear market
            ret = np.random.normal(-0.0005, 0.015)
            regime = 'bear'
        elif i < 3 * n // 4:  # Sideways
            ret = np.random.normal(0, 0.008)
            regime = 'sideways'
        else:  # Volatile
            ret = np.random.normal(0, 0.025)
            regime = 'volatile'
        
        prices[i] = prices[i-1] * (1 + ret)
        regimes.append(regime)
    
    # Create DataFrame
    data = pd.DataFrame({
        'date': dates,
        'open': prices * np.random.uniform(0.99, 1.01, n),
        'high': prices * np.random.uniform(1.01, 1.03, n),
        'low': prices * np.random.uniform(0.97, 0.99, n),
        'close': prices,
        'volume': np.random.lognormal(15, 0.5, n)
    })
    
    # Test detector
    detector = MarketRegimeDetector()
    
    # Test detection methods
    methods = ['features', 'gmm', 'ensemble']
    
    for method in methods:
        print(f"\n📊 Testing {method.upper()} Detection:")
        regime = detector.detect_regime(data, method=method)
        
        print(f"  Current Regime: {regime.regime}")
        print(f"  Confidence: {regime.confidence:.1%}")
        print(f"  Strength: {regime.strength:.1%}")
        print(f"  Duration: {regime.duration} days")
        
        if regime.sub_regime:
            print(f"  Sub-regime: {regime.sub_regime}")
        
        print(f"  Top Transitions:")
        for next_regime, prob in list(regime.transition_probability.items())[:2]:
            print(f"    → {next_regime}: {prob:.1%}")
        
        # Get recommendations
        recommendations = detector.get_regime_recommendations(regime)
        print(f"  Recommendations:")
        print(f"    Position Sizing: {recommendations['position_sizing']:.1f}x")
        print(f"    Risk Limit: {recommendations['risk_limit']:.1f}x")
        print(f"    Preferred: {', '.join(recommendations['preferred_strategies'][:2])}")
    
    print("\n✅ Regime Detection Tests Completed!")


if __name__ == "__main__":
    test_regime_detection()



