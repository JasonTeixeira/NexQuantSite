"""
Strategy Correlation Analysis
==============================
Detect and prevent hidden risk concentration from correlated strategies.

Features:
- Real-time correlation monitoring
- Signal correlation analysis
- Position overlap detection
- Risk decomposition by factor
- Clustering of similar strategies
- Correlation-based position limits
- Early warning system for concentration risk

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from scipy.stats import pearsonr, spearmanr
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


@dataclass
class CorrelationAlert:
    """Alert for dangerous correlation levels"""
    timestamp: str
    severity: str  # 'warning', 'critical'
    strategies: List[str]
    correlation: float
    risk_factor: float
    message: str
    recommended_action: str


@dataclass 
class CorrelationAnalysis:
    """Complete correlation analysis results"""
    correlation_matrix: pd.DataFrame
    signal_overlap: Dict[str, float]
    risk_concentration: float  # 0-1, higher is worse
    strategy_clusters: Dict[int, List[str]]
    alerts: List[CorrelationAlert]
    max_safe_positions: Dict[str, float]
    risk_decomposition: Dict[str, float]
    
    @property
    def is_safe(self) -> bool:
        """Are correlations within safe limits?"""
        return self.risk_concentration < 0.3 and len([a for a in self.alerts if a.severity == 'critical']) == 0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for reporting"""
        return {
            'risk_concentration': round(self.risk_concentration, 3),
            'is_safe': self.is_safe,
            'num_alerts': len(self.alerts),
            'critical_alerts': len([a for a in self.alerts if a.severity == 'critical']),
            'max_correlation': round(self.correlation_matrix.max().max(), 3),
            'strategy_clusters': self.strategy_clusters,
            'top_risks': self._get_top_risks()
        }
    
    def _get_top_risks(self) -> List[str]:
        """Get top risk factors"""
        sorted_risks = sorted(self.risk_decomposition.items(), key=lambda x: x[1], reverse=True)
        return [f"{k}: {v:.1%}" for k, v in sorted_risks[:3]]


class StrategyCorrelationAnalyzer:
    """
    Analyzes correlation between trading strategies to prevent hidden risks.
    
    This is what saves you from blow-ups when all strategies bet the same way.
    """
    
    def __init__(self,
                 max_correlation: float = 0.7,
                 critical_correlation: float = 0.85,
                 lookback_periods: int = 60):
        """
        Initialize correlation analyzer
        
        Args:
            max_correlation: Warning threshold for correlation
            critical_correlation: Critical threshold requiring intervention
            lookback_periods: Periods to look back for correlation calculation
        """
        self.max_correlation = max_correlation
        self.critical_correlation = critical_correlation
        self.lookback_periods = lookback_periods
        
        # Historical data storage
        self.signal_history = {}
        self.return_history = {}
        self.position_history = {}
        
    def analyze_strategies(self,
                          strategy_signals: Dict[str, pd.Series],
                          strategy_returns: Optional[Dict[str, pd.Series]] = None) -> CorrelationAnalysis:
        """
        Perform comprehensive correlation analysis on strategies.
        
        This tells you if your strategies are dangerously correlated.
        
        Args:
            strategy_signals: Dict of strategy_name -> signal series (-1, 0, 1)
            strategy_returns: Optional dict of strategy_name -> return series
            
        Returns:
            CorrelationAnalysis with all metrics and alerts
        """
        logger.info(f"Analyzing correlation for {len(strategy_signals)} strategies")
        
        # Update history
        self._update_history(strategy_signals, strategy_returns)
        
        # Calculate correlation matrix
        correlation_matrix = self._calculate_correlation_matrix(strategy_signals)
        
        # Detect signal overlap
        signal_overlap = self._calculate_signal_overlap(strategy_signals)
        
        # Calculate risk concentration
        risk_concentration = self._calculate_risk_concentration(correlation_matrix)
        
        # Cluster similar strategies
        strategy_clusters = self._cluster_strategies(correlation_matrix)
        
        # Generate alerts
        alerts = self._generate_correlation_alerts(correlation_matrix, signal_overlap)
        
        # Calculate safe position limits
        max_safe_positions = self._calculate_safe_position_limits(correlation_matrix)
        
        # Decompose risk by factor
        risk_decomposition = self._decompose_risk_factors(strategy_signals, strategy_returns)
        
        return CorrelationAnalysis(
            correlation_matrix=correlation_matrix,
            signal_overlap=signal_overlap,
            risk_concentration=risk_concentration,
            strategy_clusters=strategy_clusters,
            alerts=alerts,
            max_safe_positions=max_safe_positions,
            risk_decomposition=risk_decomposition
        )
    
    def _update_history(self, 
                       signals: Dict[str, pd.Series],
                       returns: Optional[Dict[str, pd.Series]]):
        """Update historical data"""
        for strategy, signal_series in signals.items():
            if strategy not in self.signal_history:
                self.signal_history[strategy] = []
            self.signal_history[strategy].append(signal_series)
            
            # Keep only lookback periods
            if len(self.signal_history[strategy]) > self.lookback_periods:
                self.signal_history[strategy].pop(0)
        
        if returns:
            for strategy, return_series in returns.items():
                if strategy not in self.return_history:
                    self.return_history[strategy] = []
                self.return_history[strategy].append(return_series)
                
                if len(self.return_history[strategy]) > self.lookback_periods:
                    self.return_history[strategy].pop(0)
    
    def _calculate_correlation_matrix(self, signals: Dict[str, pd.Series]) -> pd.DataFrame:
        """Calculate correlation matrix between strategy signals"""
        
        # Create DataFrame from signals
        df = pd.DataFrame(signals)
        
        # Calculate both Pearson and Spearman correlations
        pearson_corr = df.corr(method='pearson')
        spearman_corr = df.corr(method='spearman')
        
        # Use maximum of both (more conservative)
        correlation_matrix = pd.DataFrame(
            np.maximum(pearson_corr.values, spearman_corr.values),
            index=pearson_corr.index,
            columns=pearson_corr.columns
        )
        
        # Set diagonal to 1 (self-correlation)
        np.fill_diagonal(correlation_matrix.values, 1.0)
        
        return correlation_matrix
    
    def _calculate_signal_overlap(self, signals: Dict[str, pd.Series]) -> Dict[str, float]:
        """
        Calculate how often strategies give the same signal.
        
        High overlap = hidden concentration risk.
        """
        overlap_scores = {}
        strategy_names = list(signals.keys())
        
        for i, strat1 in enumerate(strategy_names):
            for j, strat2 in enumerate(strategy_names[i+1:], i+1):
                # Calculate percentage of time signals match
                s1 = signals[strat1]
                s2 = signals[strat2]
                
                # Align indices
                common_idx = s1.index.intersection(s2.index)
                if len(common_idx) == 0:
                    continue
                    
                s1_aligned = s1.loc[common_idx]
                s2_aligned = s2.loc[common_idx]
                
                # Calculate overlap (both non-zero and same direction)
                both_active = (s1_aligned != 0) & (s2_aligned != 0)
                same_direction = s1_aligned == s2_aligned
                
                overlap = (both_active & same_direction).sum() / len(common_idx)
                
                pair_name = f"{strat1}_{strat2}"
                overlap_scores[pair_name] = overlap
        
        return overlap_scores
    
    def _calculate_risk_concentration(self, correlation_matrix: pd.DataFrame) -> float:
        """
        Calculate overall risk concentration score.
        
        0 = perfectly diversified, 1 = all strategies identical
        """
        # Get upper triangle of correlation matrix (excluding diagonal)
        upper_triangle = np.triu(correlation_matrix.values, k=1)
        correlations = upper_triangle[upper_triangle != 0]
        
        if len(correlations) == 0:
            return 0.0
        
        # Calculate concentration metrics
        avg_correlation = np.mean(np.abs(correlations))
        max_correlation = np.max(np.abs(correlations))
        high_corr_ratio = np.mean(np.abs(correlations) > self.max_correlation)
        
        # Weighted concentration score
        concentration = (
            0.3 * avg_correlation +  # Average correlation
            0.4 * max_correlation +   # Maximum correlation
            0.3 * high_corr_ratio     # Ratio of high correlations
        )
        
        return min(1.0, concentration)
    
    def _cluster_strategies(self, correlation_matrix: pd.DataFrame) -> Dict[int, List[str]]:
        """
        Cluster strategies based on correlation.
        
        Identifies groups of strategies that behave similarly.
        """
        if len(correlation_matrix) < 2:
            return {0: list(correlation_matrix.index)}
        
        # Convert correlation to distance
        distance_matrix = 1 - np.abs(correlation_matrix.values)
        
        # Hierarchical clustering
        linkage_matrix = linkage(distance_matrix, method='ward')
        
        # Cut tree to get clusters (threshold based on max correlation)
        clusters = fcluster(linkage_matrix, 1 - self.max_correlation, criterion='distance')
        
        # Group strategies by cluster
        cluster_dict = {}
        for idx, cluster_id in enumerate(clusters):
            if cluster_id not in cluster_dict:
                cluster_dict[cluster_id] = []
            cluster_dict[cluster_id].append(correlation_matrix.index[idx])
        
        return cluster_dict
    
    def _generate_correlation_alerts(self,
                                    correlation_matrix: pd.DataFrame,
                                    signal_overlap: Dict[str, float]) -> List[CorrelationAlert]:
        """Generate alerts for dangerous correlations"""
        alerts = []
        
        # Check correlation matrix
        for i in range(len(correlation_matrix)):
            for j in range(i+1, len(correlation_matrix)):
                corr = correlation_matrix.iloc[i, j]
                strat1 = correlation_matrix.index[i]
                strat2 = correlation_matrix.columns[j]
                
                if abs(corr) >= self.critical_correlation:
                    alert = CorrelationAlert(
                        timestamp=datetime.now().isoformat(),
                        severity='critical',
                        strategies=[strat1, strat2],
                        correlation=corr,
                        risk_factor=abs(corr),
                        message=f"CRITICAL: {strat1} and {strat2} correlation = {corr:.2f}",
                        recommended_action="Reduce position sizes or disable one strategy"
                    )
                    alerts.append(alert)
                    
                elif abs(corr) >= self.max_correlation:
                    alert = CorrelationAlert(
                        timestamp=datetime.now().isoformat(),
                        severity='warning',
                        strategies=[strat1, strat2],
                        correlation=corr,
                        risk_factor=abs(corr),
                        message=f"Warning: {strat1} and {strat2} correlation = {corr:.2f}",
                        recommended_action="Monitor closely and consider reducing exposure"
                    )
                    alerts.append(alert)
        
        # Check signal overlap
        for pair, overlap in signal_overlap.items():
            if overlap > 0.7:  # 70% overlap is dangerous
                strategies = pair.split('_')
                alert = CorrelationAlert(
                    timestamp=datetime.now().isoformat(),
                    severity='warning',
                    strategies=strategies,
                    correlation=overlap,
                    risk_factor=overlap,
                    message=f"High signal overlap: {pair} = {overlap:.1%}",
                    recommended_action="Diversify strategy parameters or logic"
                )
                alerts.append(alert)
        
        return alerts
    
    def _calculate_safe_position_limits(self, correlation_matrix: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate safe position limits based on correlations.
        
        Reduces position size for highly correlated strategies.
        """
        safe_limits = {}
        
        for strategy in correlation_matrix.index:
            # Get correlations with other strategies
            correlations = correlation_matrix[strategy].drop(strategy)
            
            # Calculate risk factor based on correlations
            max_corr = correlations.abs().max()
            avg_corr = correlations.abs().mean()
            
            # Position limit formula (1.0 = full size, 0.0 = no position)
            if max_corr >= self.critical_correlation:
                limit = 0.3  # Severely reduce position
            elif max_corr >= self.max_correlation:
                limit = 0.5 + 0.5 * (1 - (max_corr - self.max_correlation) / 
                                    (self.critical_correlation - self.max_correlation))
            else:
                limit = 1.0 - 0.3 * avg_corr  # Slight reduction based on average
            
            safe_limits[strategy] = round(max(0.2, min(1.0, limit)), 2)
        
        return safe_limits
    
    def _decompose_risk_factors(self,
                               signals: Dict[str, pd.Series],
                               returns: Optional[Dict[str, pd.Series]]) -> Dict[str, float]:
        """
        Decompose risk into underlying factors using PCA.
        
        Identifies what's driving correlation.
        """
        df = pd.DataFrame(signals)
        
        if len(df.columns) < 2:
            return {'single_strategy': 1.0}
        
        # Perform PCA
        pca = PCA()
        pca.fit(df.fillna(0))
        
        # Get explained variance ratios
        explained_variance = pca.explained_variance_ratio_
        
        # Create risk decomposition
        risk_factors = {}
        for i, variance in enumerate(explained_variance[:5]):  # Top 5 factors
            if variance > 0.01:  # Only include significant factors
                risk_factors[f'factor_{i+1}'] = variance
        
        # Add interpretation
        if explained_variance[0] > 0.5:
            risk_factors['concentration_risk'] = explained_variance[0]
            risk_factors['interpretation'] = 'High concentration in single factor'
        elif explained_variance[0] > 0.3:
            risk_factors['interpretation'] = 'Moderate factor concentration'
        else:
            risk_factors['interpretation'] = 'Well diversified across factors'
        
        return risk_factors
    
    def get_real_time_correlation(self,
                                 strategy1: str,
                                 strategy2: str,
                                 window: int = 20) -> float:
        """
        Get real-time correlation between two strategies.
        
        For live monitoring.
        """
        if strategy1 not in self.signal_history or strategy2 not in self.signal_history:
            return 0.0
        
        # Get recent signals
        signals1 = self.signal_history[strategy1][-window:]
        signals2 = self.signal_history[strategy2][-window:]
        
        if not signals1 or not signals2:
            return 0.0
        
        # Concatenate recent signals
        s1 = pd.concat(signals1)
        s2 = pd.concat(signals2)
        
        # Align indices
        common_idx = s1.index.intersection(s2.index)
        if len(common_idx) < 10:  # Need minimum data
            return 0.0
        
        # Calculate correlation
        return s1.loc[common_idx].corr(s2.loc[common_idx])
    
    def suggest_portfolio_adjustment(self, analysis: CorrelationAnalysis) -> Dict[str, Any]:
        """
        Suggest portfolio adjustments based on correlation analysis.
        
        Returns specific recommendations to reduce risk.
        """
        suggestions = {
            'adjustments': [],
            'estimated_risk_reduction': 0,
            'priority': 'normal'
        }
        
        # Check for critical alerts
        critical_alerts = [a for a in analysis.alerts if a.severity == 'critical']
        
        if critical_alerts:
            suggestions['priority'] = 'urgent'
            
            for alert in critical_alerts:
                suggestions['adjustments'].append({
                    'action': 'reduce_position',
                    'strategies': alert.strategies,
                    'reduction': 0.5,  # Cut position in half
                    'reason': f"Critical correlation: {alert.correlation:.2f}"
                })
        
        # Check risk concentration
        if analysis.risk_concentration > 0.5:
            suggestions['priority'] = 'high'
            suggestions['adjustments'].append({
                'action': 'diversify',
                'reason': f"High risk concentration: {analysis.risk_concentration:.2f}",
                'recommendation': "Add uncorrelated strategies or adjust parameters"
            })
        
        # Check clusters
        large_clusters = [c for c in analysis.strategy_clusters.values() if len(c) > 2]
        if large_clusters:
            for cluster in large_clusters:
                suggestions['adjustments'].append({
                    'action': 'reduce_cluster_exposure',
                    'strategies': cluster,
                    'reason': f"Large cluster of {len(cluster)} similar strategies",
                    'recommendation': f"Keep only best performing or reduce all by {1/len(cluster):.1%}"
                })
        
        # Estimate risk reduction
        if suggestions['adjustments']:
            # Rough estimate based on adjustments
            suggestions['estimated_risk_reduction'] = min(0.5, len(suggestions['adjustments']) * 0.15)
        
        return suggestions


class CorrelationMonitor:
    """
    Real-time correlation monitoring with alerts.
    
    Watches for developing correlation risks.
    """
    
    def __init__(self, analyzer: StrategyCorrelationAnalyzer):
        self.analyzer = analyzer
        self.alert_history = []
        self.last_analysis = None
        
    def monitor_tick(self,
                     current_signals: Dict[str, float],
                     current_positions: Dict[str, float]) -> Optional[CorrelationAlert]:
        """
        Monitor correlation on each tick.
        
        Returns alert if dangerous correlation detected.
        """
        # Check for position concentration
        total_position = sum(abs(p) for p in current_positions.values())
        
        if total_position > 0:
            position_concentration = {
                k: abs(v) / total_position 
                for k, v in current_positions.items()
            }
            
            # Check if any strategy has > 40% of total position
            max_concentration = max(position_concentration.values())
            if max_concentration > 0.4:
                max_strategy = max(position_concentration, key=position_concentration.get)
                
                alert = CorrelationAlert(
                    timestamp=datetime.now().isoformat(),
                    severity='warning',
                    strategies=[max_strategy],
                    correlation=0,
                    risk_factor=max_concentration,
                    message=f"Position concentration: {max_strategy} = {max_concentration:.1%}",
                    recommended_action="Reduce position or increase diversification"
                )
                
                self.alert_history.append(alert)
                return alert
        
        # Check signal agreement
        active_signals = {k: v for k, v in current_signals.items() if v != 0}
        
        if len(active_signals) > 1:
            # Check if all signals point same direction
            signal_values = list(active_signals.values())
            if all(s > 0 for s in signal_values) or all(s < 0 for s in signal_values):
                alert = CorrelationAlert(
                    timestamp=datetime.now().isoformat(),
                    severity='warning',
                    strategies=list(active_signals.keys()),
                    correlation=1.0,
                    risk_factor=1.0,
                    message=f"All {len(active_signals)} strategies agree on direction",
                    recommended_action="Consider reducing overall position size"
                )
                
                self.alert_history.append(alert)
                return alert
        
        return None


if __name__ == "__main__":
    print("Strategy Correlation Analysis System")
    print("=" * 50)
    print("This system prevents hidden risk concentration")
    print("Key features:")
    print("  ✅ Real-time correlation monitoring")
    print("  ✅ Signal overlap detection")
    print("  ✅ Risk factor decomposition")
    print("  ✅ Automatic position limits")
    print("  ✅ Clustering of similar strategies")



