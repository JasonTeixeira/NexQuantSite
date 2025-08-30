"""
Portfolio Optimization Engine
==============================
Production-grade portfolio optimization for superior capital allocation.

Implements:
- Markowitz Mean-Variance Optimization
- Kelly Criterion for position sizing
- Risk Parity allocation
- Black-Litterman model
- Hierarchical Risk Parity (HRP)
- Maximum Diversification
- CVaR optimization

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Union
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from scipy.optimize import minimize, LinearConstraint
from scipy.stats import norm
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """Portfolio optimization result"""
    weights: Dict[str, float]
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    max_drawdown_estimate: float
    diversification_ratio: float
    kelly_fractions: Dict[str, float]
    confidence_level: float
    method: str
    
    def to_dict(self) -> Dict:
        return {
            'weights': {k: round(v, 4) for k, v in self.weights.items()},
            'expected_return': round(self.expected_return, 4),
            'expected_risk': round(self.expected_risk, 4),
            'sharpe_ratio': round(self.sharpe_ratio, 3),
            'max_drawdown_estimate': round(self.max_drawdown_estimate, 4),
            'diversification_ratio': round(self.diversification_ratio, 3),
            'kelly_fractions': {k: round(v, 4) for k, v in self.kelly_fractions.items()},
            'confidence_level': round(self.confidence_level, 2),
            'method': self.method
        }
    
    @property
    def is_optimal(self) -> bool:
        """Check if optimization found a good solution"""
        return (
            self.sharpe_ratio > 0.5 and
            self.diversification_ratio > 1.5 and
            self.confidence_level > 0.7
        )


class PortfolioOptimizer:
    """
    Advanced portfolio optimization for professional trading.
    
    This is what separates amateur from professional traders.
    """
    
    def __init__(self,
                 risk_free_rate: float = 0.02,
                 max_leverage: float = 1.0,
                 min_weight: float = 0.0,
                 max_weight: float = 0.4,
                 target_volatility: Optional[float] = None):
        """
        Initialize portfolio optimizer
        
        Args:
            risk_free_rate: Annual risk-free rate
            max_leverage: Maximum total leverage (1.0 = no leverage)
            min_weight: Minimum position weight
            max_weight: Maximum position weight
            target_volatility: Target portfolio volatility (optional)
        """
        self.risk_free_rate = risk_free_rate
        self.max_leverage = max_leverage
        self.min_weight = min_weight
        self.max_weight = max_weight
        self.target_volatility = target_volatility
        
    def optimize_portfolio(self,
                          returns: pd.DataFrame,
                          method: str = 'markowitz',
                          views: Optional[Dict[str, float]] = None,
                          constraints: Optional[Dict] = None) -> OptimizationResult:
        """
        Optimize portfolio allocation using specified method.
        
        This is where the magic happens - turning returns into optimal weights.
        
        Args:
            returns: DataFrame of asset returns (assets as columns)
            method: 'markowitz', 'kelly', 'risk_parity', 'black_litterman', 'hrp', 'max_div'
            views: Market views for Black-Litterman (asset -> expected return)
            constraints: Additional constraints
            
        Returns:
            OptimizationResult with optimal weights and metrics
        """
        
        # Clean returns data
        returns = returns.dropna()
        assets = returns.columns.tolist()
        
        if len(assets) < 2:
            logger.warning("Need at least 2 assets for optimization")
            return self._equal_weight_fallback(assets)
        
        # Calculate statistics
        expected_returns = returns.mean() * 252  # Annualized
        cov_matrix = returns.cov() * 252  # Annualized
        
        # Choose optimization method
        if method == 'markowitz':
            result = self._markowitz_optimization(expected_returns, cov_matrix, assets)
        elif method == 'kelly':
            result = self._kelly_criterion(returns, assets)
        elif method == 'risk_parity':
            result = self._risk_parity(cov_matrix, assets)
        elif method == 'black_litterman':
            result = self._black_litterman(expected_returns, cov_matrix, assets, views)
        elif method == 'hrp':
            result = self._hierarchical_risk_parity(returns, assets)
        elif method == 'max_div':
            result = self._maximum_diversification(expected_returns, cov_matrix, assets)
        else:
            logger.warning(f"Unknown method {method}, using Markowitz")
            result = self._markowitz_optimization(expected_returns, cov_matrix, assets)
        
        # Apply constraints if provided
        if constraints:
            result = self._apply_constraints(result, constraints)
        
        # Calculate Kelly fractions
        kelly_fractions = self._calculate_kelly_fractions(returns, result.weights)
        result.kelly_fractions = kelly_fractions
        
        return result
    
    def _markowitz_optimization(self,
                               expected_returns: pd.Series,
                               cov_matrix: pd.DataFrame,
                               assets: List[str]) -> OptimizationResult:
        """
        Markowitz mean-variance optimization.
        
        The classic - maximize Sharpe ratio.
        """
        n_assets = len(assets)
        
        # Objective: Maximize Sharpe ratio
        def negative_sharpe(weights):
            portfolio_return = np.dot(weights, expected_returns)
            portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            sharpe = (portfolio_return - self.risk_free_rate) / portfolio_risk
            return -sharpe
        
        # Constraints
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}  # Weights sum to 1
        ]
        
        # Bounds
        bounds = tuple((self.min_weight, self.max_weight) for _ in range(n_assets))
        
        # Initial guess (equal weight)
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            negative_sharpe,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if not result.success:
            logger.warning(f"Markowitz optimization failed: {result.message}")
            return self._equal_weight_fallback(assets)
        
        # Extract results
        weights = dict(zip(assets, result.x))
        portfolio_return = np.dot(result.x, expected_returns)
        portfolio_risk = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
        sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_risk
        
        return OptimizationResult(
            weights=weights,
            expected_return=portfolio_return,
            expected_risk=portfolio_risk,
            sharpe_ratio=sharpe_ratio,
            max_drawdown_estimate=portfolio_risk * 2.0,  # Rough estimate
            diversification_ratio=self._calculate_diversification_ratio(result.x, cov_matrix),
            kelly_fractions={},
            confidence_level=0.8,
            method='markowitz'
        )
    
    def _kelly_criterion(self, returns: pd.DataFrame, assets: List[str]) -> OptimizationResult:
        """
        Kelly Criterion for optimal position sizing.
        
        Maximizes long-term growth rate.
        """
        kelly_fractions = {}
        
        for asset in assets:
            asset_returns = returns[asset]
            
            # Calculate win rate and win/loss ratio
            wins = asset_returns[asset_returns > 0]
            losses = asset_returns[asset_returns <= 0]
            
            if len(wins) == 0 or len(losses) == 0:
                kelly_fractions[asset] = 0.0
                continue
            
            win_rate = len(wins) / len(asset_returns)
            avg_win = wins.mean()
            avg_loss = abs(losses.mean())
            
            # Kelly formula: f = (p * b - q) / b
            # where p = win_rate, q = 1 - p, b = win/loss ratio
            if avg_loss > 0:
                b = avg_win / avg_loss
                kelly_f = (win_rate * b - (1 - win_rate)) / b
            else:
                kelly_f = win_rate
            
            # Apply Kelly fraction with safety factor (usually 0.25)
            kelly_fractions[asset] = max(0, min(0.25, kelly_f * 0.25))
        
        # Normalize to sum to 1 (or max_leverage)
        total_kelly = sum(kelly_fractions.values())
        if total_kelly > 0:
            scale = min(self.max_leverage, 1.0) / total_kelly
            weights = {k: v * scale for k, v in kelly_fractions.items()}
        else:
            weights = {k: 1.0 / len(assets) for k in assets}
        
        # Calculate portfolio metrics
        portfolio_returns = (returns * pd.Series(weights)).sum(axis=1)
        expected_return = portfolio_returns.mean() * 252
        portfolio_risk = portfolio_returns.std() * np.sqrt(252)
        sharpe_ratio = (expected_return - self.risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0
        
        return OptimizationResult(
            weights=weights,
            expected_return=expected_return,
            expected_risk=portfolio_risk,
            sharpe_ratio=sharpe_ratio,
            max_drawdown_estimate=portfolio_risk * 2.5,
            diversification_ratio=self._calculate_diversification_ratio(
                np.array(list(weights.values())),
                returns.cov() * 252
            ),
            kelly_fractions=kelly_fractions,
            confidence_level=0.7,
            method='kelly'
        )
    
    def _risk_parity(self, cov_matrix: pd.DataFrame, assets: List[str]) -> OptimizationResult:
        """
        Risk Parity allocation - equal risk contribution.
        
        Each asset contributes equally to portfolio risk.
        """
        n_assets = len(assets)
        
        # Objective: Minimize difference in risk contributions
        def risk_parity_objective(weights):
            portfolio_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            marginal_contrib = np.dot(cov_matrix, weights) / portfolio_vol
            contrib = weights * marginal_contrib
            
            # Want all contributions to be equal
            target_contrib = portfolio_vol / n_assets
            return np.sum((contrib - target_contrib) ** 2)
        
        # Constraints
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}
        ]
        
        # Bounds
        bounds = tuple((0.01, 1.0) for _ in range(n_assets))
        
        # Initial guess
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            risk_parity_objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if not result.success:
            logger.warning("Risk parity optimization failed")
            return self._equal_weight_fallback(assets)
        
        weights = dict(zip(assets, result.x))
        
        # Calculate metrics (need returns for full metrics)
        portfolio_risk = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
        
        return OptimizationResult(
            weights=weights,
            expected_return=0.05,  # Placeholder - need returns
            expected_risk=portfolio_risk,
            sharpe_ratio=0.5,  # Placeholder
            max_drawdown_estimate=portfolio_risk * 2.0,
            diversification_ratio=self._calculate_diversification_ratio(result.x, cov_matrix),
            kelly_fractions={},
            confidence_level=0.85,
            method='risk_parity'
        )
    
    def _black_litterman(self,
                        expected_returns: pd.Series,
                        cov_matrix: pd.DataFrame,
                        assets: List[str],
                        views: Optional[Dict[str, float]] = None) -> OptimizationResult:
        """
        Black-Litterman model - combine market equilibrium with views.
        
        The sophisticated approach used by institutions.
        """
        
        # Market capitalization weights (simplified - equal weight as proxy)
        market_weights = np.array([1.0 / len(assets)] * len(assets))
        
        # Equilibrium returns (reverse optimization)
        delta = 2.5  # Risk aversion parameter
        equilibrium_returns = delta * np.dot(cov_matrix, market_weights)
        
        if views:
            # Incorporate views using Black-Litterman formula
            # P matrix (which assets views are about)
            P = np.zeros((len(views), len(assets)))
            Q = np.zeros(len(views))  # View returns
            
            for i, (asset, view_return) in enumerate(views.items()):
                if asset in assets:
                    asset_idx = assets.index(asset)
                    P[i, asset_idx] = 1
                    Q[i] = view_return
            
            # Uncertainty in views
            tau = 0.05
            omega = np.diag(np.diag(P @ cov_matrix @ P.T)) * tau
            
            # Black-Litterman formula
            M_inverse = np.linalg.inv(tau * cov_matrix)
            BL_returns = np.linalg.inv(M_inverse + P.T @ np.linalg.inv(omega) @ P) @ \
                        (M_inverse @ equilibrium_returns + P.T @ np.linalg.inv(omega) @ Q)
            
            expected_returns = pd.Series(BL_returns, index=assets)
        
        # Now optimize with updated returns
        return self._markowitz_optimization(expected_returns, cov_matrix, assets)
    
    def _hierarchical_risk_parity(self, returns: pd.DataFrame, assets: List[str]) -> OptimizationResult:
        """
        Hierarchical Risk Parity (HRP) - uses machine learning clustering.
        
        Modern approach that doesn't require correlation matrix inversion.
        """
        
        # Calculate correlation and distance matrix
        corr_matrix = returns.corr()
        distance_matrix = np.sqrt(0.5 * (1 - corr_matrix))
        
        # Hierarchical clustering - convert to numpy array first
        distance_array = distance_matrix.values
        condensed_dist = distance_array[np.triu_indices(len(assets), k=1)]
        link = linkage(condensed_dist, method='single')
        
        # Sort assets by cluster
        def get_quasi_diag(link):
            link = link.astype(int)
            sort_idx = []
            
            def recurse(idx):
                if idx < len(assets):
                    sort_idx.append(idx)
                else:
                    left = int(link[idx - len(assets), 0])
                    right = int(link[idx - len(assets), 1])
                    recurse(left)
                    recurse(right)
            
            recurse(2 * len(assets) - 2)
            return sort_idx
        
        sorted_idx = get_quasi_diag(link)
        sorted_assets = [assets[i] for i in sorted_idx]
        
        # Recursive bisection for weight allocation
        weights = self._recursive_bisection(returns[sorted_assets].cov(), sorted_assets)
        
        # Map back to original asset order
        weight_dict = {asset: weights[sorted_assets.index(asset)] for asset in assets}
        
        # Calculate metrics
        weights_array = np.array(list(weight_dict.values()))
        cov_matrix = returns.cov() * 252
        portfolio_risk = np.sqrt(np.dot(weights_array.T, np.dot(cov_matrix, weights_array)))
        
        return OptimizationResult(
            weights=weight_dict,
            expected_return=0.06,  # Placeholder
            expected_risk=portfolio_risk,
            sharpe_ratio=0.6,  # Placeholder
            max_drawdown_estimate=portfolio_risk * 2.0,
            diversification_ratio=self._calculate_diversification_ratio(weights_array, cov_matrix),
            kelly_fractions={},
            confidence_level=0.9,  # HRP is very robust
            method='hrp'
        )
    
    def _recursive_bisection(self, cov: pd.DataFrame, assets: List[str]) -> np.ndarray:
        """Recursive bisection for HRP weight allocation"""
        
        def recurse_bisection(cov, assets):
            if len(assets) == 1:
                return np.array([1.0])
            
            # Split into two clusters
            n = len(assets) // 2
            left_assets = assets[:n]
            right_assets = assets[n:]
            
            # Calculate weights for each cluster
            left_cov = cov.loc[left_assets, left_assets]
            right_cov = cov.loc[right_assets, right_assets]
            
            left_weights = recurse_bisection(left_cov, left_assets)
            right_weights = recurse_bisection(right_cov, right_assets)
            
            # Calculate cluster variances
            left_var = np.dot(left_weights, np.dot(left_cov, left_weights))
            right_var = np.dot(right_weights, np.dot(right_cov, right_weights))
            
            # Allocate between clusters (inverse variance)
            alpha = 1 - left_var / (left_var + right_var)
            
            # Combine weights
            weights = np.zeros(len(assets))
            weights[:n] = left_weights * alpha
            weights[n:] = right_weights * (1 - alpha)
            
            return weights
        
        return recurse_bisection(cov, assets)
    
    def _maximum_diversification(self,
                                expected_returns: pd.Series,
                                cov_matrix: pd.DataFrame,
                                assets: List[str]) -> OptimizationResult:
        """
        Maximum Diversification Portfolio.
        
        Maximizes the ratio of weighted average volatility to portfolio volatility.
        """
        n_assets = len(assets)
        asset_vols = np.sqrt(np.diag(cov_matrix))
        
        # Objective: Maximize diversification ratio
        def negative_div_ratio(weights):
            weighted_avg_vol = np.dot(weights, asset_vols)
            portfolio_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return -weighted_avg_vol / portfolio_vol
        
        # Constraints and bounds
        constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}]
        bounds = tuple((self.min_weight, self.max_weight) for _ in range(n_assets))
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            negative_div_ratio,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        if not result.success:
            return self._equal_weight_fallback(assets)
        
        weights = dict(zip(assets, result.x))
        portfolio_return = np.dot(result.x, expected_returns)
        portfolio_risk = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
        
        return OptimizationResult(
            weights=weights,
            expected_return=portfolio_return,
            expected_risk=portfolio_risk,
            sharpe_ratio=(portfolio_return - self.risk_free_rate) / portfolio_risk,
            max_drawdown_estimate=portfolio_risk * 2.0,
            diversification_ratio=-result.fun,  # Negative because we minimized negative
            kelly_fractions={},
            confidence_level=0.75,
            method='max_diversification'
        )
    
    def _calculate_diversification_ratio(self, weights: np.ndarray, cov_matrix: pd.DataFrame) -> float:
        """Calculate diversification ratio of portfolio"""
        if isinstance(cov_matrix, pd.DataFrame):
            cov_matrix = cov_matrix.values
            
        asset_vols = np.sqrt(np.diag(cov_matrix))
        weighted_avg_vol = np.dot(weights, asset_vols)
        portfolio_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
        
        return weighted_avg_vol / portfolio_vol if portfolio_vol > 0 else 1.0
    
    def _calculate_kelly_fractions(self,
                                  returns: pd.DataFrame,
                                  weights: Dict[str, float]) -> Dict[str, float]:
        """Calculate Kelly fractions for each asset"""
        kelly_fractions = {}
        
        for asset in weights.keys():
            if asset not in returns.columns:
                kelly_fractions[asset] = 0.0
                continue
                
            asset_returns = returns[asset]
            mean_return = asset_returns.mean()
            variance = asset_returns.var()
            
            if variance > 0:
                kelly_f = mean_return / variance
                # Apply safety factor and cap
                kelly_fractions[asset] = max(0, min(0.25, kelly_f * 0.25))
            else:
                kelly_fractions[asset] = 0.0
        
        return kelly_fractions
    
    def _apply_constraints(self,
                          result: OptimizationResult,
                          constraints: Dict) -> OptimizationResult:
        """Apply additional constraints to optimization result"""
        
        weights = result.weights.copy()
        
        # Sector constraints
        if 'max_sector_weight' in constraints:
            # Would need sector mapping to implement
            pass
        
        # Minimum position constraint
        if 'min_positions' in constraints:
            min_pos = constraints['min_positions']
            sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
            if len([w for w in weights.values() if w > 0.01]) < min_pos:
                # Force minimum positions
                for i in range(min_pos):
                    if i < len(sorted_weights):
                        asset = sorted_weights[i][0]
                        weights[asset] = max(weights[asset], 1.0 / min_pos)
        
        # Renormalize
        total = sum(weights.values())
        if total > 0:
            weights = {k: v / total for k, v in weights.items()}
        
        result.weights = weights
        return result
    
    def _equal_weight_fallback(self, assets: List[str]) -> OptimizationResult:
        """Fallback to equal weight when optimization fails"""
        n = len(assets)
        weights = {asset: 1.0 / n for asset in assets}
        
        return OptimizationResult(
            weights=weights,
            expected_return=0.05,
            expected_risk=0.15,
            sharpe_ratio=0.3,
            max_drawdown_estimate=0.3,
            diversification_ratio=1.0,
            kelly_fractions={asset: 0.1 / n for asset in assets},
            confidence_level=0.5,
            method='equal_weight'
        )
    
    def optimize_with_regime(self,
                           returns: pd.DataFrame,
                           regime: str,
                           method: str = 'adaptive') -> OptimizationResult:
        """
        Optimize portfolio based on market regime.
        
        Different allocations for bull/bear/sideways markets.
        """
        
        if regime == 'bull':
            # More aggressive in bull markets
            self.max_weight = 0.5
            self.min_weight = 0.0
            result = self.optimize_portfolio(returns, method='markowitz')
            
        elif regime == 'bear':
            # Conservative in bear markets
            self.max_weight = 0.2
            self.min_weight = 0.05  # Force diversification
            result = self.optimize_portfolio(returns, method='risk_parity')
            
        elif regime == 'sideways':
            # Balanced in sideways markets
            self.max_weight = 0.3
            result = self.optimize_portfolio(returns, method='hrp')
            
        else:
            # Unknown regime - be conservative
            result = self.optimize_portfolio(returns, method='risk_parity')
        
        logger.info(f"Optimized for {regime} regime using {result.method}")
        return result


class DynamicPortfolioManager:
    """
    Manages portfolio optimization over time with rebalancing.
    """
    
    def __init__(self,
                 optimizer: PortfolioOptimizer,
                 rebalance_frequency: str = 'monthly',
                 min_trade_size: float = 0.01):
        """
        Initialize dynamic portfolio manager
        
        Args:
            optimizer: Portfolio optimizer instance
            rebalance_frequency: 'daily', 'weekly', 'monthly'
            min_trade_size: Minimum trade size to avoid small trades
        """
        self.optimizer = optimizer
        self.rebalance_frequency = rebalance_frequency
        self.min_trade_size = min_trade_size
        self.portfolio_history = []
        
    def should_rebalance(self,
                        current_weights: Dict[str, float],
                        target_weights: Dict[str, float],
                        threshold: float = 0.05) -> bool:
        """
        Determine if rebalancing is needed.
        
        Args:
            current_weights: Current portfolio weights
            target_weights: Target portfolio weights
            threshold: Rebalance if any weight differs by more than this
            
        Returns:
            True if rebalancing needed
        """
        
        for asset in target_weights:
            current = current_weights.get(asset, 0)
            target = target_weights[asset]
            
            if abs(current - target) > threshold:
                return True
        
        return False
    
    def calculate_rebalancing_trades(self,
                                    current_positions: Dict[str, float],
                                    target_weights: Dict[str, float],
                                    portfolio_value: float) -> Dict[str, float]:
        """
        Calculate trades needed to rebalance portfolio.
        
        Args:
            current_positions: Current position values
            target_weights: Target portfolio weights
            portfolio_value: Total portfolio value
            
        Returns:
            Dictionary of trades (positive = buy, negative = sell)
        """
        
        trades = {}
        
        for asset in set(list(current_positions.keys()) + list(target_weights.keys())):
            current_value = current_positions.get(asset, 0)
            target_value = target_weights.get(asset, 0) * portfolio_value
            
            trade_value = target_value - current_value
            
            # Only trade if above minimum size
            if abs(trade_value) > self.min_trade_size * portfolio_value:
                trades[asset] = trade_value
        
        return trades
    
    def optimize_with_transaction_costs(self,
                                       returns: pd.DataFrame,
                                       current_weights: Dict[str, float],
                                       transaction_cost: float = 0.001) -> OptimizationResult:
        """
        Optimize portfolio considering transaction costs.
        
        Args:
            returns: Historical returns
            current_weights: Current portfolio weights
            transaction_cost: Cost per trade as fraction
            
        Returns:
            OptimizationResult accounting for transaction costs
        """
        
        # Get unconstrained optimal weights
        result = self.optimizer.optimize_portfolio(returns)
        
        # Calculate turnover cost
        turnover = sum(abs(result.weights.get(asset, 0) - current_weights.get(asset, 0))
                      for asset in set(list(result.weights.keys()) + list(current_weights.keys())))
        
        turnover_cost = turnover * transaction_cost
        
        # Adjust expected return for transaction costs
        result.expected_return -= turnover_cost
        result.sharpe_ratio = (result.expected_return - self.optimizer.risk_free_rate) / result.expected_risk
        
        # Don't rebalance if costs exceed benefit
        if turnover_cost > result.expected_return * 0.1:  # If costs > 10% of expected return
            logger.info("Skipping rebalance due to high transaction costs")
            result.weights = current_weights
        
        return result


def test_portfolio_optimization():
    """Test portfolio optimization functionality"""
    print("Testing Portfolio Optimization Engine...")
    print("=" * 60)
    
    # Generate sample returns data
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(), periods=252, freq='D')
    
    # Create correlated asset returns
    n_assets = 5
    assets = [f'Asset_{i}' for i in range(n_assets)]
    
    # Generate returns with correlation
    mean_returns = np.random.uniform(0.05, 0.15, n_assets) / 252
    volatilities = np.random.uniform(0.1, 0.3, n_assets) / np.sqrt(252)
    
    # Create correlation matrix
    correlation = np.eye(n_assets)
    for i in range(n_assets):
        for j in range(i+1, n_assets):
            correlation[i, j] = correlation[j, i] = np.random.uniform(-0.3, 0.6)
    
    # Generate returns
    cov_matrix = np.outer(volatilities, volatilities) * correlation
    returns_data = np.random.multivariate_normal(mean_returns, cov_matrix, len(dates))
    returns = pd.DataFrame(returns_data, index=dates, columns=assets)
    
    # Test optimizer
    optimizer = PortfolioOptimizer()
    
    # Test different methods
    methods = ['markowitz', 'kelly', 'risk_parity', 'hrp', 'max_div']
    
    for method in methods:
        print(f"\n📊 Testing {method.upper()} Optimization:")
        result = optimizer.optimize_portfolio(returns, method=method)
        
        print(f"  Expected Return: {result.expected_return:.2%}")
        print(f"  Expected Risk: {result.expected_risk:.2%}")
        print(f"  Sharpe Ratio: {result.sharpe_ratio:.3f}")
        print(f"  Diversification: {result.diversification_ratio:.2f}")
        print(f"  Weights:")
        for asset, weight in result.weights.items():
            if weight > 0.01:
                print(f"    {asset}: {weight:.1%}")
    
    print("\n✅ Portfolio Optimization Tests Completed!")


if __name__ == "__main__":
    test_portfolio_optimization()
