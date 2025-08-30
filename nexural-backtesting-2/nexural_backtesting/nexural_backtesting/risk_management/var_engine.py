"""
VaR Engine for Enterprise Quantitative Backtesting Engine
Handles Value at Risk (VaR) and Expected Shortfall calculations
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass, field
from enum import Enum
import warnings
from scipy import stats
from scipy.optimize import minimize
import cvxpy as cp

logger = logging.getLogger(__name__)

class VaRMethod(Enum):
    """VaR calculation methods"""
    HISTORICAL = "historical"
    PARAMETRIC = "parametric"
    MONTE_CARLO = "monte_carlo"
    CONDITIONAL = "conditional"
    FILTERED = "filtered"
    EXTREME_VALUE = "extreme_value"

@dataclass
class VaRResult:
    """VaR calculation result"""
    var_value: float
    confidence_level: float
    method: VaRMethod
    time_horizon: int
    portfolio_value: float
    var_percentage: float
    expected_shortfall: float
    es_percentage: float
    calculation_timestamp: datetime = field(default_factory=datetime.now)
    additional_metrics: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ExpectedShortfall:
    """Expected Shortfall (Conditional VaR) result"""
    es_value: float
    confidence_level: float
    var_threshold: float
    tail_observations: int
    tail_mean: float
    tail_volatility: float
    calculation_timestamp: datetime = field(default_factory=datetime.now)

class VaREngine:
    """
    Advanced VaR engine with multiple calculation methods
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize VaR engine
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.var_results = []
        
        # VaR calculation parameters
        self.confidence_levels = config.get('confidence_levels', [0.95, 0.99])
        self.time_horizon = config.get('time_horizon', 1)
        self.lookback_period = config.get('lookback_period', 252)
        self.monte_carlo_simulations = config.get('monte_carlo_simulations', 10000)
        self.volatility_window = config.get('volatility_window', 60)
        
        # Market data
        self.returns_data = pd.DataFrame()
        self.portfolio_weights = pd.Series(dtype=float)
        self.portfolio_value = 1.0
        
        logger.info("VaR engine initialized")
    
    def update_data(self, returns_data: pd.DataFrame, portfolio_weights: pd.Series = None,
                   portfolio_value: float = 1.0):
        """
        Update data for VaR calculations
        
        Args:
            returns_data: Asset returns dataframe
            portfolio_weights: Portfolio weights series
            portfolio_value: Current portfolio value
        """
        try:
            self.returns_data = returns_data
            if portfolio_weights is not None:
                self.portfolio_weights = portfolio_weights
            self.portfolio_value = portfolio_value
            
            logger.info(f"VaR data updated: {len(returns_data)} observations, {len(returns_data.columns)} assets")
            
        except Exception as e:
            logger.error(f"Failed to update VaR data: {e}")
            raise
    
    def calculate_var(self, method: VaRMethod = VaRMethod.HISTORICAL,
                     confidence_level: float = 0.95) -> VaRResult:
        """
        Calculate VaR using specified method
        
        Args:
            method: VaR calculation method
            confidence_level: Confidence level for VaR
            
        Returns:
            VaR result object
        """
        try:
            if self.returns_data.empty:
                raise ValueError("No returns data available for VaR calculation")
            
            # Calculate portfolio returns if weights are available
            if not self.portfolio_weights.empty:
                portfolio_returns = self._calculate_portfolio_returns()
            else:
                # Assume equal weights if no weights provided
                portfolio_returns = self.returns_data.mean(axis=1)
            
            # Calculate VaR based on method
            if method == VaRMethod.HISTORICAL:
                var_value = self._calculate_historical_var(portfolio_returns, confidence_level)
            elif method == VaRMethod.PARAMETRIC:
                var_value = self._calculate_parametric_var(portfolio_returns, confidence_level)
            elif method == VaRMethod.MONTE_CARLO:
                var_value = self._calculate_monte_carlo_var(portfolio_returns, confidence_level)
            elif method == VaRMethod.CONDITIONAL:
                var_value = self._calculate_conditional_var(portfolio_returns, confidence_level)
            elif method == VaRMethod.FILTERED:
                var_value = self._calculate_filtered_var(portfolio_returns, confidence_level)
            elif method == VaRMethod.EXTREME_VALUE:
                var_value = self._calculate_extreme_value_var(portfolio_returns, confidence_level)
            else:
                raise ValueError(f"Unsupported VaR method: {method}")
            
            # Calculate Expected Shortfall
            expected_shortfall = self._calculate_expected_shortfall(portfolio_returns, confidence_level, var_value)
            
            # Create result object
            var_result = VaRResult(
                var_value=abs(var_value),
                confidence_level=confidence_level,
                method=method,
                time_horizon=self.time_horizon,
                portfolio_value=self.portfolio_value,
                var_percentage=abs(var_value) / self.portfolio_value,
                expected_shortfall=expected_shortfall.es_value,
                es_percentage=expected_shortfall.es_value / self.portfolio_value,
                additional_metrics={
                    'tail_observations': expected_shortfall.tail_observations,
                    'tail_mean': expected_shortfall.tail_mean,
                    'tail_volatility': expected_shortfall.tail_volatility
                }
            )
            
            # Store result
            self.var_results.append(var_result)
            
            logger.info(f"VaR calculated: {method.value} method, {confidence_level:.0%} confidence, "
                       f"VaR = {var_result.var_percentage:.2%}, ES = {var_result.es_percentage:.2%}")
            
            return var_result
            
        except Exception as e:
            logger.error(f"Failed to calculate VaR: {e}")
            raise
    
    def calculate_portfolio_var(self, method: VaRMethod = VaRMethod.HISTORICAL,
                              confidence_level: float = 0.95) -> Dict[str, VaRResult]:
        """
        Calculate VaR for entire portfolio using multiple methods
        
        Args:
            method: Primary VaR method
            confidence_level: Confidence level
            
        Returns:
            Dictionary of VaR results by method
        """
        try:
            results = {}
            
            # Calculate VaR using different methods
            methods_to_try = [
                VaRMethod.HISTORICAL,
                VaRMethod.PARAMETRIC,
                VaRMethod.MONTE_CARLO
            ]
            
            for var_method in methods_to_try:
                try:
                    result = self.calculate_var(var_method, confidence_level)
                    results[var_method.value] = result
                except Exception as e:
                    logger.warning(f"Failed to calculate VaR using {var_method.value}: {e}")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio VaR: {e}")
            raise
    
    def calculate_marginal_var(self, confidence_level: float = 0.95) -> pd.Series:
        """
        Calculate marginal VaR for each asset
        
        Args:
            confidence_level: Confidence level
            
        Returns:
            Series of marginal VaR values
        """
        try:
            if self.portfolio_weights.empty:
                raise ValueError("Portfolio weights required for marginal VaR calculation")
            
            # Calculate portfolio VaR
            portfolio_var = self.calculate_var(VaRMethod.HISTORICAL, confidence_level)
            
            # Calculate marginal VaR for each asset
            marginal_var = pd.Series(index=self.portfolio_weights.index, dtype=float)
            
            for asset in self.portfolio_weights.index:
                if asset in self.returns_data.columns:
                    # Calculate VaR contribution
                    asset_returns = self.returns_data[asset].dropna()
                    asset_weight = self.portfolio_weights[asset]
                    
                    # Marginal VaR = weight * asset VaR
                    asset_var = np.percentile(asset_returns, (1 - confidence_level) * 100)
                    marginal_var[asset] = abs(asset_weight * asset_var)
            
            return marginal_var
            
        except Exception as e:
            logger.error(f"Failed to calculate marginal VaR: {e}")
            raise
    
    def calculate_incremental_var(self, confidence_level: float = 0.95) -> pd.Series:
        """
        Calculate incremental VaR for each asset
        
        Args:
            confidence_level: Confidence level
            
        Returns:
            Series of incremental VaR values
        """
        try:
            if self.portfolio_weights.empty:
                raise ValueError("Portfolio weights required for incremental VaR calculation")
            
            # Calculate base portfolio VaR
            base_var = self.calculate_var(VaRMethod.HISTORICAL, confidence_level)
            
            incremental_var = pd.Series(index=self.portfolio_weights.index, dtype=float)
            
            for asset in self.portfolio_weights.index:
                if asset in self.returns_data.columns:
                    # Create portfolio without this asset
                    temp_weights = self.portfolio_weights.drop(asset)
                    if not temp_weights.empty:
                        temp_weights = temp_weights / temp_weights.sum()  # Renormalize
                        
                        # Calculate VaR without asset
                        temp_returns = self.returns_data[temp_weights.index]
                        temp_portfolio_returns = (temp_returns * temp_weights).sum(axis=1)
                        temp_var = np.percentile(temp_portfolio_returns, (1 - confidence_level) * 100)
                        
                        # Incremental VaR = base VaR - VaR without asset
                        incremental_var[asset] = abs(base_var.var_value) - abs(temp_var)
            
            return incremental_var
            
        except Exception as e:
            logger.error(f"Failed to calculate incremental VaR: {e}")
            raise
    
    def stress_test_var(self, stress_scenarios: Dict[str, float]) -> Dict[str, VaRResult]:
        """
        Stress test VaR under different scenarios
        
        Args:
            stress_scenarios: Dictionary of scenario names and stress factors
            
        Returns:
            Dictionary of VaR results under stress scenarios
        """
        try:
            stress_results = {}
            
            for scenario_name, stress_factor in stress_scenarios.items():
                # Apply stress factor to returns
                stressed_returns = self.returns_data * stress_factor
                
                # Calculate VaR under stress
                temp_engine = VaREngine(self.config)
                temp_engine.update_data(stressed_returns, self.portfolio_weights, self.portfolio_value)
                
                var_result = temp_engine.calculate_var(VaRMethod.HISTORICAL, 0.95)
                stress_results[scenario_name] = var_result
            
            return stress_results
            
        except Exception as e:
            logger.error(f"Failed to stress test VaR: {e}")
            raise
    
    def _calculate_portfolio_returns(self) -> pd.Series:
        """Calculate portfolio returns from asset returns and weights"""
        try:
            if self.portfolio_weights.empty:
                return self.returns_data.mean(axis=1)
            
            # Align weights with returns data
            common_assets = self.portfolio_weights.index.intersection(self.returns_data.columns)
            if len(common_assets) == 0:
                raise ValueError("No common assets between weights and returns data")
            
            weights = self.portfolio_weights[common_assets]
            returns = self.returns_data[common_assets]
            
            # Calculate weighted portfolio returns
            portfolio_returns = (returns * weights).sum(axis=1)
            
            return portfolio_returns
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio returns: {e}")
            raise
    
    def _calculate_historical_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate historical VaR"""
        try:
            # Use lookback period
            if len(returns) > self.lookback_period:
                returns = returns.tail(self.lookback_period)
            
            var = np.percentile(returns, (1 - confidence_level) * 100)
            return var
            
        except Exception as e:
            logger.error(f"Historical VaR calculation failed: {e}")
            raise
    
    def _calculate_parametric_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate parametric VaR assuming normal distribution"""
        try:
            # Calculate mean and standard deviation
            mean_return = returns.mean()
            std_return = returns.std()
            
            # Parametric VaR using normal distribution
            z_score = stats.norm.ppf(confidence_level)
            var = mean_return - z_score * std_return
            
            return var
            
        except Exception as e:
            logger.error(f"Parametric VaR calculation failed: {e}")
            raise
    
    def _calculate_monte_carlo_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate VaR using Monte Carlo simulation"""
        try:
            # Estimate parameters from historical data
            mean_return = returns.mean()
            std_return = returns.std()
            
            # Generate Monte Carlo simulations
            np.random.seed(42)  # For reproducibility
            simulations = np.random.normal(mean_return, std_return, self.monte_carlo_simulations)
            
            # Calculate VaR from simulations
            var = np.percentile(simulations, (1 - confidence_level) * 100)
            
            return var
            
        except Exception as e:
            logger.error(f"Monte Carlo VaR calculation failed: {e}")
            raise
    
    def _calculate_conditional_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate conditional VaR (Expected Shortfall)"""
        try:
            # Calculate VaR threshold
            var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
            
            # Calculate expected value of returns below VaR threshold
            tail_returns = returns[returns <= var_threshold]
            conditional_var = tail_returns.mean()
            
            return conditional_var
            
        except Exception as e:
            logger.error(f"Conditional VaR calculation failed: {e}")
            raise
    
    def _calculate_filtered_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate filtered VaR using GARCH-like approach"""
        try:
            # Calculate rolling volatility
            rolling_vol = returns.rolling(window=self.volatility_window).std()
            
            # Use most recent volatility for VaR calculation
            current_vol = rolling_vol.iloc[-1]
            mean_return = returns.mean()
            
            # Filtered VaR
            z_score = stats.norm.ppf(confidence_level)
            var = mean_return - z_score * current_vol
            
            return var
            
        except Exception as e:
            logger.error(f"Filtered VaR calculation failed: {e}")
            raise
    
    def _calculate_extreme_value_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Calculate VaR using extreme value theory"""
        try:
            # Focus on tail observations (worst 10% of returns)
            tail_percentile = 10
            tail_returns = returns[returns <= np.percentile(returns, tail_percentile)]
            
            if len(tail_returns) < 10:
                # Fall back to historical VaR if insufficient tail data
                return self._calculate_historical_var(returns, confidence_level)
            
            # Fit generalized Pareto distribution to tail
            try:
                # Use absolute values for fitting
                tail_abs = np.abs(tail_returns)
                shape, loc, scale = stats.genpareto.fit(tail_abs)
                
                # Calculate VaR using fitted distribution
                var_percentile = (1 - confidence_level) * tail_percentile / 100
                var = stats.genpareto.ppf(var_percentile, shape, loc, scale)
                
                return -var  # Return negative value for loss
                
            except Exception:
                # Fall back to historical VaR if fitting fails
                return self._calculate_historical_var(returns, confidence_level)
            
        except Exception as e:
            logger.error(f"Extreme value VaR calculation failed: {e}")
            raise
    
    def _calculate_expected_shortfall(self, returns: pd.Series, confidence_level: float, 
                                    var_threshold: float) -> ExpectedShortfall:
        """Calculate Expected Shortfall (Conditional VaR)"""
        try:
            # Find returns below VaR threshold
            tail_returns = returns[returns <= var_threshold]
            
            if len(tail_returns) == 0:
                # If no tail observations, use VaR as ES
                return ExpectedShortfall(
                    es_value=abs(var_threshold),
                    confidence_level=confidence_level,
                    var_threshold=var_threshold,
                    tail_observations=0,
                    tail_mean=var_threshold,
                    tail_volatility=0.0
                )
            
            # Calculate Expected Shortfall
            es_value = abs(tail_returns.mean())
            tail_volatility = tail_returns.std()
            
            return ExpectedShortfall(
                es_value=es_value,
                confidence_level=confidence_level,
                var_threshold=var_threshold,
                tail_observations=len(tail_returns),
                tail_mean=tail_returns.mean(),
                tail_volatility=tail_volatility
            )
            
        except Exception as e:
            logger.error(f"Expected Shortfall calculation failed: {e}")
            raise
    
    def get_var_summary(self) -> Dict[str, Any]:
        """Get comprehensive VaR summary"""
        try:
            if not self.var_results:
                return {}
            
            # Group results by method
            results_by_method = {}
            for result in self.var_results:
                method = result.method.value
                if method not in results_by_method:
                    results_by_method[method] = []
                results_by_method[method].append(result)
            
            # Calculate summary statistics
            summary = {
                'total_calculations': len(self.var_results),
                'methods_used': list(results_by_method.keys()),
                'latest_results': {},
                'var_comparison': {}
            }
            
            # Latest results by method
            for method, results in results_by_method.items():
                latest = max(results, key=lambda x: x.calculation_timestamp)
                summary['latest_results'][method] = {
                    'var_percentage': latest.var_percentage,
                    'es_percentage': latest.es_percentage,
                    'confidence_level': latest.confidence_level,
                    'timestamp': latest.calculation_timestamp
                }
            
            # VaR comparison across methods
            if len(results_by_method) > 1:
                comparison_data = []
                for method, results in results_by_method.items():
                    latest = max(results, key=lambda x: x.calculation_timestamp)
                    comparison_data.append({
                        'method': method,
                        'var_percentage': latest.var_percentage,
                        'es_percentage': latest.es_percentage
                    })
                
                summary['var_comparison'] = comparison_data
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get VaR summary: {e}")
            return {}
    
    def export_var_report(self) -> pd.DataFrame:
        """Export VaR results as DataFrame"""
        try:
            if not self.var_results:
                return pd.DataFrame()
            
            report_data = []
            for result in self.var_results:
                report_data.append({
                    'method': result.method.value,
                    'confidence_level': result.confidence_level,
                    'var_value': result.var_value,
                    'var_percentage': result.var_percentage,
                    'expected_shortfall': result.expected_shortfall,
                    'es_percentage': result.es_percentage,
                    'time_horizon': result.time_horizon,
                    'portfolio_value': result.portfolio_value,
                    'calculation_timestamp': result.calculation_timestamp
                })
            
            return pd.DataFrame(report_data)
            
        except Exception as e:
            logger.error(f"Failed to export VaR report: {e}")
            return pd.DataFrame()
