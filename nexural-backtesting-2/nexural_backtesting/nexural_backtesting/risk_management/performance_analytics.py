"""
Performance Analytics Engine for Enterprise Quantitative Backtesting Engine
Handles performance measurement, attribution analysis, and risk-adjusted returns
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

logger = logging.getLogger(__name__)

class AttributionMethod(Enum):
    """Performance attribution methods"""
    BRINSON_HOOD_BEEBOWER = "brinson_hood_beebower"
    CARINO = "carino"
    MENCHERINI = "menchero"
    GEOMETRIC = "geometric"
    FACTOR_MODEL = "factor_model"

class RiskAdjustedMetric(Enum):
    """Risk-adjusted performance metrics"""
    SHARPE_RATIO = "sharpe_ratio"
    SORTINO_RATIO = "sortino_ratio"
    CALMAR_RATIO = "calmar_ratio"
    INFORMATION_RATIO = "information_ratio"
    TREYNOR_RATIO = "treynor_ratio"
    JENSEN_ALPHA = "jensen_alpha"
    MODIGLIANI_RATIO = "modigliani_ratio"
    OMEGA_RATIO = "omega_ratio"

@dataclass
class PerformanceMetrics:
    """Comprehensive performance metrics"""
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    information_ratio: float
    treynor_ratio: float
    jensen_alpha: float
    modigliani_ratio: float
    omega_ratio: float
    max_drawdown: float
    value_at_risk_95: float
    expected_shortfall_95: float
    beta: float
    tracking_error: float
    up_capture_ratio: float
    down_capture_ratio: float
    win_rate: float
    profit_factor: float
    average_win: float
    average_loss: float
    largest_win: float
    largest_loss: float
    consecutive_wins: int
    consecutive_losses: int
    calculation_period: str
    calculation_timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class AttributionAnalysis:
    """Performance attribution analysis results"""
    total_attribution: float
    asset_allocation_effect: float
    stock_selection_effect: float
    interaction_effect: float
    factor_attribution: Dict[str, float]
    sector_attribution: Dict[str, float]
    country_attribution: Dict[str, float]
    style_attribution: Dict[str, float]
    risk_factor_attribution: Dict[str, float]
    attribution_method: AttributionMethod
    calculation_timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class RiskAdjustedReturns:
    """Risk-adjusted return metrics"""
    risk_free_rate: float
    excess_return: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    information_ratio: float
    treynor_ratio: float
    jensen_alpha: float
    modigliani_ratio: float
    omega_ratio: float
    risk_metrics: Dict[str, float]
    calculation_timestamp: datetime = field(default_factory=datetime.now)

class PerformanceAnalytics:
    """
    Advanced performance analytics engine with comprehensive measurement and attribution
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize performance analytics engine
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.performance_history = []
        
        # Performance calculation parameters
        self.risk_free_rate = config.get('risk_free_rate', 0.02)
        self.benchmark_returns = None
        self.factor_models = config.get('factor_models', {})
        self.attribution_method = AttributionMethod(config.get('attribution_method', 'brinson_hood_beebower'))
        
        # Market data
        self.portfolio_returns = pd.Series(dtype=float)
        self.benchmark_returns = pd.Series(dtype=float)
        self.asset_returns = pd.DataFrame()
        self.portfolio_weights = pd.Series(dtype=float)
        self.benchmark_weights = pd.Series(dtype=float)
        
        logger.info("Performance analytics engine initialized")
    
    def update_data(self, portfolio_returns: pd.Series, benchmark_returns: pd.Series = None,
                   asset_returns: pd.DataFrame = None, portfolio_weights: pd.Series = None,
                   benchmark_weights: pd.Series = None):
        """
        Update data for performance analysis
        
        Args:
            portfolio_returns: Portfolio returns series
            benchmark_returns: Benchmark returns series
            asset_returns: Asset returns dataframe
            portfolio_weights: Portfolio weights series
            benchmark_weights: Benchmark weights series
        """
        try:
            self.portfolio_returns = portfolio_returns
            if benchmark_returns is not None:
                self.benchmark_returns = benchmark_returns
            if asset_returns is not None:
                self.asset_returns = asset_returns
            if portfolio_weights is not None:
                self.portfolio_weights = portfolio_weights
            if benchmark_weights is not None:
                self.benchmark_weights = benchmark_weights
            
            logger.info(f"Performance data updated: {len(portfolio_returns)} observations")
            
        except Exception as e:
            logger.error(f"Failed to update performance data: {e}")
            raise
    
    def calculate_performance_metrics(self, period: str = 'all') -> PerformanceMetrics:
        """
        Calculate comprehensive performance metrics
        
        Args:
            period: Analysis period ('1m', '3m', '6m', '1y', '3y', '5y', 'all')
            
        Returns:
            Performance metrics object
        """
        try:
            if self.portfolio_returns.empty:
                raise ValueError("No portfolio returns data available")
            
            # Filter returns by period
            returns = self._filter_returns_by_period(self.portfolio_returns, period)
            
            if len(returns) < 30:
                raise ValueError(f"Insufficient data for period {period}")
            
            # Calculate basic metrics
            total_return = self._calculate_total_return(returns)
            annualized_return = self._calculate_annualized_return(returns)
            volatility = self._calculate_volatility(returns)
            
            # Calculate risk-adjusted metrics
            sharpe_ratio = self._calculate_sharpe_ratio(returns)
            sortino_ratio = self._calculate_sortino_ratio(returns)
            calmar_ratio = self._calculate_calmar_ratio(returns)
            information_ratio = self._calculate_information_ratio(returns)
            treynor_ratio = self._calculate_treynor_ratio(returns)
            jensen_alpha = self._calculate_jensen_alpha(returns)
            modigliani_ratio = self._calculate_modigliani_ratio(returns)
            omega_ratio = self._calculate_omega_ratio(returns)
            
            # Calculate risk metrics
            max_drawdown = self._calculate_max_drawdown(returns)
            var_95 = self._calculate_var_95(returns)
            es_95 = self._calculate_expected_shortfall_95(returns)
            beta = self._calculate_beta(returns)
            tracking_error = self._calculate_tracking_error(returns)
            
            # Calculate capture ratios
            up_capture_ratio = self._calculate_up_capture_ratio(returns)
            down_capture_ratio = self._calculate_down_capture_ratio(returns)
            
            # Calculate trading statistics
            win_rate = self._calculate_win_rate(returns)
            profit_factor = self._calculate_profit_factor(returns)
            average_win = self._calculate_average_win(returns)
            average_loss = self._calculate_average_loss(returns)
            largest_win = self._calculate_largest_win(returns)
            largest_loss = self._calculate_largest_loss(returns)
            consecutive_wins = self._calculate_consecutive_wins(returns)
            consecutive_losses = self._calculate_consecutive_losses(returns)
            
            # Create performance metrics object
            metrics = PerformanceMetrics(
                total_return=total_return,
                annualized_return=annualized_return,
                volatility=volatility,
                sharpe_ratio=sharpe_ratio,
                sortino_ratio=sortino_ratio,
                calmar_ratio=calmar_ratio,
                information_ratio=information_ratio,
                treynor_ratio=treynor_ratio,
                jensen_alpha=jensen_alpha,
                modigliani_ratio=modigliani_ratio,
                omega_ratio=omega_ratio,
                max_drawdown=max_drawdown,
                value_at_risk_95=var_95,
                expected_shortfall_95=es_95,
                beta=beta,
                tracking_error=tracking_error,
                up_capture_ratio=up_capture_ratio,
                down_capture_ratio=down_capture_ratio,
                win_rate=win_rate,
                profit_factor=profit_factor,
                average_win=average_win,
                average_loss=average_loss,
                largest_win=largest_win,
                largest_loss=largest_loss,
                consecutive_wins=consecutive_wins,
                consecutive_losses=consecutive_losses,
                calculation_period=period
            )
            
            # Store in history
            self.performance_history.append(metrics)
            
            logger.info(f"Performance metrics calculated for {period}: "
                       f"Return={annualized_return:.2%}, Sharpe={sharpe_ratio:.2f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to calculate performance metrics: {e}")
            raise
    
    def calculate_attribution_analysis(self, method: AttributionMethod = None) -> AttributionAnalysis:
        """
        Calculate performance attribution analysis
        
        Args:
            method: Attribution method to use
            
        Returns:
            Attribution analysis object
        """
        try:
            if self.portfolio_returns.empty or self.benchmark_returns is None:
                raise ValueError("Portfolio and benchmark returns required for attribution")
            
            if method is None:
                method = self.attribution_method
            
            # Calculate attribution based on method
            if method == AttributionMethod.BRINSON_HOOD_BEEBOWER:
                attribution = self._calculate_bhb_attribution()
            elif method == AttributionMethod.CARINO:
                attribution = self._calculate_carino_attribution()
            elif method == AttributionMethod.MENCHERINI:
                attribution = self._calculate_menchero_attribution()
            elif method == AttributionMethod.GEOMETRIC:
                attribution = self._calculate_geometric_attribution()
            elif method == AttributionMethod.FACTOR_MODEL:
                attribution = self._calculate_factor_attribution()
            else:
                raise ValueError(f"Unsupported attribution method: {method}")
            
            logger.info(f"Attribution analysis completed using {method.value} method")
            return attribution
            
        except Exception as e:
            logger.error(f"Failed to calculate attribution analysis: {e}")
            raise
    
    def calculate_risk_adjusted_returns(self) -> RiskAdjustedReturns:
        """
        Calculate comprehensive risk-adjusted return metrics
        
        Returns:
            Risk-adjusted returns object
        """
        try:
            if self.portfolio_returns.empty:
                raise ValueError("No portfolio returns data available")
            
            # Calculate excess return
            excess_return = self.portfolio_returns.mean() * 252 - self.risk_free_rate
            
            # Calculate risk-adjusted metrics
            sharpe_ratio = self._calculate_sharpe_ratio(self.portfolio_returns)
            sortino_ratio = self._calculate_sortino_ratio(self.portfolio_returns)
            calmar_ratio = self._calculate_calmar_ratio(self.portfolio_returns)
            information_ratio = self._calculate_information_ratio(self.portfolio_returns)
            treynor_ratio = self._calculate_treynor_ratio(self.portfolio_returns)
            jensen_alpha = self._calculate_jensen_alpha(self.portfolio_returns)
            modigliani_ratio = self._calculate_modigliani_ratio(self.portfolio_returns)
            omega_ratio = self._calculate_omega_ratio(self.portfolio_returns)
            
            # Calculate additional risk metrics
            risk_metrics = {
                'volatility': self._calculate_volatility(self.portfolio_returns),
                'var_95': self._calculate_var_95(self.portfolio_returns),
                'es_95': self._calculate_expected_shortfall_95(self.portfolio_returns),
                'max_drawdown': self._calculate_max_drawdown(self.portfolio_returns),
                'beta': self._calculate_beta(self.portfolio_returns),
                'tracking_error': self._calculate_tracking_error(self.portfolio_returns)
            }
            
            risk_adjusted = RiskAdjustedReturns(
                risk_free_rate=self.risk_free_rate,
                excess_return=excess_return,
                sharpe_ratio=sharpe_ratio,
                sortino_ratio=sortino_ratio,
                calmar_ratio=calmar_ratio,
                information_ratio=information_ratio,
                treynor_ratio=treynor_ratio,
                jensen_alpha=jensen_alpha,
                modigliani_ratio=modigliani_ratio,
                omega_ratio=omega_ratio,
                risk_metrics=risk_metrics
            )
            
            logger.info(f"Risk-adjusted returns calculated: Sharpe={sharpe_ratio:.2f}, "
                       f"Information={information_ratio:.2f}")
            
            return risk_adjusted
            
        except Exception as e:
            logger.error(f"Failed to calculate risk-adjusted returns: {e}")
            raise
    
    def generate_performance_report(self, periods: List[str] = None) -> Dict[str, Any]:
        """
        Generate comprehensive performance report
        
        Args:
            periods: List of periods to analyze
            
        Returns:
            Performance report dictionary
        """
        try:
            if periods is None:
                periods = ['1m', '3m', '6m', '1y', '3y', 'all']
            
            report = {
                'report_date': datetime.now(),
                'periods_analyzed': periods,
                'metrics_by_period': {},
                'summary_statistics': {},
                'risk_analysis': {},
                'attribution_analysis': None,
                'risk_adjusted_returns': None
            }
            
            # Calculate metrics for each period
            for period in periods:
                try:
                    metrics = self.calculate_performance_metrics(period)
                    report['metrics_by_period'][period] = metrics
                except Exception as e:
                    logger.warning(f"Failed to calculate metrics for period {period}: {e}")
            
            # Calculate attribution analysis
            try:
                attribution = self.calculate_attribution_analysis()
                report['attribution_analysis'] = attribution
            except Exception as e:
                logger.warning(f"Failed to calculate attribution analysis: {e}")
            
            # Calculate risk-adjusted returns
            try:
                risk_adjusted = self.calculate_risk_adjusted_returns()
                report['risk_adjusted_returns'] = risk_adjusted
            except Exception as e:
                logger.warning(f"Failed to calculate risk-adjusted returns: {e}")
            
            # Generate summary statistics
            report['summary_statistics'] = self._generate_summary_statistics(report['metrics_by_period'])
            
            # Generate risk analysis
            report['risk_analysis'] = self._generate_risk_analysis(report['metrics_by_period'])
            
            logger.info(f"Performance report generated for {len(periods)} periods")
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            raise
    
    def _filter_returns_by_period(self, returns: pd.Series, period: str) -> pd.Series:
        """Filter returns by specified period"""
        try:
            if period == 'all':
                return returns
            
            # Calculate start date based on period
            end_date = returns.index[-1]
            
            if period == '1m':
                start_date = end_date - timedelta(days=30)
            elif period == '3m':
                start_date = end_date - timedelta(days=90)
            elif period == '6m':
                start_date = end_date - timedelta(days=180)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            elif period == '3y':
                start_date = end_date - timedelta(days=3*365)
            elif period == '5y':
                start_date = end_date - timedelta(days=5*365)
            else:
                raise ValueError(f"Unsupported period: {period}")
            
            return returns[returns.index >= start_date]
            
        except Exception as e:
            logger.error(f"Failed to filter returns by period: {e}")
            raise
    
    def _calculate_total_return(self, returns: pd.Series) -> float:
        """Calculate total return"""
        try:
            return (1 + returns).prod() - 1
        except Exception as e:
            logger.error(f"Failed to calculate total return: {e}")
            return 0.0
    
    def _calculate_annualized_return(self, returns: pd.Series) -> float:
        """Calculate annualized return"""
        try:
            total_return = self._calculate_total_return(returns)
            years = len(returns) / 252
            return (1 + total_return) ** (1 / years) - 1
        except Exception as e:
            logger.error(f"Failed to calculate annualized return: {e}")
            return 0.0
    
    def _calculate_volatility(self, returns: pd.Series) -> float:
        """Calculate annualized volatility"""
        try:
            return returns.std() * np.sqrt(252)
        except Exception as e:
            logger.error(f"Failed to calculate volatility: {e}")
            return 0.0
    
    def _calculate_sharpe_ratio(self, returns: pd.Series) -> float:
        """Calculate Sharpe ratio"""
        try:
            excess_returns = returns - self.risk_free_rate / 252
            return excess_returns.mean() / returns.std() * np.sqrt(252)
        except Exception as e:
            logger.error(f"Failed to calculate Sharpe ratio: {e}")
            return 0.0
    
    def _calculate_sortino_ratio(self, returns: pd.Series) -> float:
        """Calculate Sortino ratio"""
        try:
            excess_returns = returns - self.risk_free_rate / 252
            downside_returns = excess_returns[excess_returns < 0]
            
            if len(downside_returns) == 0:
                return np.inf
            
            downside_deviation = downside_returns.std()
            return excess_returns.mean() / downside_deviation * np.sqrt(252)
        except Exception as e:
            logger.error(f"Failed to calculate Sortino ratio: {e}")
            return 0.0
    
    def _calculate_calmar_ratio(self, returns: pd.Series) -> float:
        """Calculate Calmar ratio"""
        try:
            annualized_return = self._calculate_annualized_return(returns)
            max_drawdown = self._calculate_max_drawdown(returns)
            
            if max_drawdown == 0:
                return np.inf
            
            return annualized_return / max_drawdown
        except Exception as e:
            logger.error(f"Failed to calculate Calmar ratio: {e}")
            return 0.0
    
    def _calculate_information_ratio(self, returns: pd.Series) -> float:
        """Calculate information ratio"""
        try:
            if self.benchmark_returns is None:
                return 0.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 0.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            active_returns = portfolio_returns - benchmark_returns
            tracking_error = active_returns.std() * np.sqrt(252)
            
            if tracking_error == 0:
                return 0.0
            
            return active_returns.mean() / tracking_error * np.sqrt(252)
        except Exception as e:
            logger.error(f"Failed to calculate information ratio: {e}")
            return 0.0
    
    def _calculate_treynor_ratio(self, returns: pd.Series) -> float:
        """Calculate Treynor ratio"""
        try:
            beta = self._calculate_beta(returns)
            if beta == 0:
                return 0.0
            
            excess_return = returns.mean() * 252 - self.risk_free_rate
            return excess_return / beta
        except Exception as e:
            logger.error(f"Failed to calculate Treynor ratio: {e}")
            return 0.0
    
    def _calculate_jensen_alpha(self, returns: pd.Series) -> float:
        """Calculate Jensen's alpha"""
        try:
            if self.benchmark_returns is None:
                return 0.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 0.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            beta = self._calculate_beta(returns)
            portfolio_return = portfolio_returns.mean() * 252
            benchmark_return = benchmark_returns.mean() * 252
            
            return portfolio_return - (self.risk_free_rate + beta * (benchmark_return - self.risk_free_rate))
        except Exception as e:
            logger.error(f"Failed to calculate Jensen's alpha: {e}")
            return 0.0
    
    def _calculate_modigliani_ratio(self, returns: pd.Series) -> float:
        """Calculate Modigliani ratio"""
        try:
            if self.benchmark_returns is None:
                return 0.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 0.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            portfolio_vol = self._calculate_volatility(portfolio_returns)
            benchmark_vol = self._calculate_volatility(benchmark_returns)
            
            if benchmark_vol == 0:
                return 0.0
            
            portfolio_return = portfolio_returns.mean() * 252
            benchmark_return = benchmark_returns.mean() * 252
            
            return (portfolio_return - self.risk_free_rate) * (benchmark_vol / portfolio_vol) + self.risk_free_rate
        except Exception as e:
            logger.error(f"Failed to calculate Modigliani ratio: {e}")
            return 0.0
    
    def _calculate_omega_ratio(self, returns: pd.Series, threshold: float = 0.0) -> float:
        """Calculate Omega ratio"""
        try:
            excess_returns = returns - threshold / 252
            positive_returns = excess_returns[excess_returns > 0]
            negative_returns = excess_returns[excess_returns < 0]
            
            if len(negative_returns) == 0:
                return np.inf
            
            positive_sum = positive_returns.sum()
            negative_sum = abs(negative_returns.sum())
            
            return positive_sum / negative_sum
        except Exception as e:
            logger.error(f"Failed to calculate Omega ratio: {e}")
            return 0.0
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        try:
            cumulative_returns = (1 + returns).cumprod()
            running_max = cumulative_returns.expanding().max()
            drawdown = (cumulative_returns - running_max) / running_max
            return abs(drawdown.min())
        except Exception as e:
            logger.error(f"Failed to calculate max drawdown: {e}")
            return 0.0
    
    def _calculate_var_95(self, returns: pd.Series) -> float:
        """Calculate 95% Value at Risk"""
        try:
            return abs(np.percentile(returns, 5))
        except Exception as e:
            logger.error(f"Failed to calculate VaR: {e}")
            return 0.0
    
    def _calculate_expected_shortfall_95(self, returns: pd.Series) -> float:
        """Calculate 95% Expected Shortfall"""
        try:
            var_threshold = np.percentile(returns, 5)
            tail_returns = returns[returns <= var_threshold]
            return abs(tail_returns.mean())
        except Exception as e:
            logger.error(f"Failed to calculate Expected Shortfall: {e}")
            return 0.0
    
    def _calculate_beta(self, returns: pd.Series) -> float:
        """Calculate beta relative to benchmark"""
        try:
            if self.benchmark_returns is None:
                return 1.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 1.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            covariance = np.cov(portfolio_returns, benchmark_returns)[0, 1]
            benchmark_variance = np.var(benchmark_returns)
            
            if benchmark_variance == 0:
                return 1.0
            
            return covariance / benchmark_variance
        except Exception as e:
            logger.error(f"Failed to calculate beta: {e}")
            return 1.0
    
    def _calculate_tracking_error(self, returns: pd.Series) -> float:
        """Calculate tracking error"""
        try:
            if self.benchmark_returns is None:
                return 0.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 0.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            active_returns = portfolio_returns - benchmark_returns
            return active_returns.std() * np.sqrt(252)
        except Exception as e:
            logger.error(f"Failed to calculate tracking error: {e}")
            return 0.0
    
    def _calculate_up_capture_ratio(self, returns: pd.Series) -> float:
        """Calculate up capture ratio"""
        try:
            if self.benchmark_returns is None:
                return 1.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 1.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            # Find up periods
            up_periods = benchmark_returns > 0
            if not up_periods.any():
                return 1.0
            
            portfolio_up_return = portfolio_returns[up_periods].sum()
            benchmark_up_return = benchmark_returns[up_periods].sum()
            
            if benchmark_up_return == 0:
                return 1.0
            
            return portfolio_up_return / benchmark_up_return
        except Exception as e:
            logger.error(f"Failed to calculate up capture ratio: {e}")
            return 1.0
    
    def _calculate_down_capture_ratio(self, returns: pd.Series) -> float:
        """Calculate down capture ratio"""
        try:
            if self.benchmark_returns is None:
                return 1.0
            
            # Align returns with benchmark
            common_index = returns.index.intersection(self.benchmark_returns.index)
            if len(common_index) < 30:
                return 1.0
            
            portfolio_returns = returns[common_index]
            benchmark_returns = self.benchmark_returns[common_index]
            
            # Find down periods
            down_periods = benchmark_returns < 0
            if not down_periods.any():
                return 1.0
            
            portfolio_down_return = portfolio_returns[down_periods].sum()
            benchmark_down_return = benchmark_returns[down_periods].sum()
            
            if benchmark_down_return == 0:
                return 1.0
            
            return portfolio_down_return / benchmark_down_return
        except Exception as e:
            logger.error(f"Failed to calculate down capture ratio: {e}")
            return 1.0
    
    def _calculate_win_rate(self, returns: pd.Series) -> float:
        """Calculate win rate"""
        try:
            winning_periods = returns > 0
            return winning_periods.sum() / len(returns)
        except Exception as e:
            logger.error(f"Failed to calculate win rate: {e}")
            return 0.0
    
    def _calculate_profit_factor(self, returns: pd.Series) -> float:
        """Calculate profit factor"""
        try:
            positive_returns = returns[returns > 0]
            negative_returns = returns[returns < 0]
            
            if len(negative_returns) == 0:
                return np.inf
            
            gross_profit = positive_returns.sum()
            gross_loss = abs(negative_returns.sum())
            
            return gross_profit / gross_loss
        except Exception as e:
            logger.error(f"Failed to calculate profit factor: {e}")
            return 0.0
    
    def _calculate_average_win(self, returns: pd.Series) -> float:
        """Calculate average winning return"""
        try:
            positive_returns = returns[returns > 0]
            return positive_returns.mean() if len(positive_returns) > 0 else 0.0
        except Exception as e:
            logger.error(f"Failed to calculate average win: {e}")
            return 0.0
    
    def _calculate_average_loss(self, returns: pd.Series) -> float:
        """Calculate average losing return"""
        try:
            negative_returns = returns[returns < 0]
            return negative_returns.mean() if len(negative_returns) > 0 else 0.0
        except Exception as e:
            logger.error(f"Failed to calculate average loss: {e}")
            return 0.0
    
    def _calculate_largest_win(self, returns: pd.Series) -> float:
        """Calculate largest winning return"""
        try:
            return returns.max()
        except Exception as e:
            logger.error(f"Failed to calculate largest win: {e}")
            return 0.0
    
    def _calculate_largest_loss(self, returns: pd.Series) -> float:
        """Calculate largest losing return"""
        try:
            return returns.min()
        except Exception as e:
            logger.error(f"Failed to calculate largest loss: {e}")
            return 0.0
    
    def _calculate_consecutive_wins(self, returns: pd.Series) -> int:
        """Calculate maximum consecutive wins"""
        try:
            winning_periods = returns > 0
            max_consecutive = 0
            current_consecutive = 0
            
            for is_win in winning_periods:
                if is_win:
                    current_consecutive += 1
                    max_consecutive = max(max_consecutive, current_consecutive)
                else:
                    current_consecutive = 0
            
            return max_consecutive
        except Exception as e:
            logger.error(f"Failed to calculate consecutive wins: {e}")
            return 0
    
    def _calculate_consecutive_losses(self, returns: pd.Series) -> int:
        """Calculate maximum consecutive losses"""
        try:
            losing_periods = returns < 0
            max_consecutive = 0
            current_consecutive = 0
            
            for is_loss in losing_periods:
                if is_loss:
                    current_consecutive += 1
                    max_consecutive = max(max_consecutive, current_consecutive)
                else:
                    current_consecutive = 0
            
            return max_consecutive
        except Exception as e:
            logger.error(f"Failed to calculate consecutive losses: {e}")
            return 0
    
    def _calculate_bhb_attribution(self) -> AttributionAnalysis:
        """Calculate Brinson-Hood-Beebower attribution"""
        try:
            # Simplified BHB attribution
            # In practice, this would require detailed sector/asset allocation data
            
            total_attribution = 0.0
            asset_allocation_effect = 0.0
            stock_selection_effect = 0.0
            interaction_effect = 0.0
            
            # Placeholder calculations
            if self.benchmark_returns is not None:
                total_attribution = (self.portfolio_returns.mean() - self.benchmark_returns.mean()) * 252
                asset_allocation_effect = total_attribution * 0.4  # Simplified
                stock_selection_effect = total_attribution * 0.4   # Simplified
                interaction_effect = total_attribution * 0.2       # Simplified
            
            return AttributionAnalysis(
                total_attribution=total_attribution,
                asset_allocation_effect=asset_allocation_effect,
                stock_selection_effect=stock_selection_effect,
                interaction_effect=interaction_effect,
                factor_attribution={},
                sector_attribution={},
                country_attribution={},
                style_attribution={},
                risk_factor_attribution={},
                attribution_method=AttributionMethod.BRINSON_HOOD_BEEBOWER
            )
            
        except Exception as e:
            logger.error(f"Failed to calculate BHB attribution: {e}")
            raise
    
    def _calculate_carino_attribution(self) -> AttributionAnalysis:
        """Calculate Carino attribution"""
        try:
            # Simplified Carino attribution
            return self._calculate_bhb_attribution()
        except Exception as e:
            logger.error(f"Failed to calculate Carino attribution: {e}")
            raise
    
    def _calculate_menchero_attribution(self) -> AttributionAnalysis:
        """Calculate Menchero attribution"""
        try:
            # Simplified Menchero attribution
            return self._calculate_bhb_attribution()
        except Exception as e:
            logger.error(f"Failed to calculate Menchero attribution: {e}")
            raise
    
    def _calculate_geometric_attribution(self) -> AttributionAnalysis:
        """Calculate geometric attribution"""
        try:
            # Simplified geometric attribution
            return self._calculate_bhb_attribution()
        except Exception as e:
            logger.error(f"Failed to calculate geometric attribution: {e}")
            raise
    
    def _calculate_factor_attribution(self) -> AttributionAnalysis:
        """Calculate factor model attribution"""
        try:
            # Simplified factor attribution
            return self._calculate_bhb_attribution()
        except Exception as e:
            logger.error(f"Failed to calculate factor attribution: {e}")
            raise
    
    def _generate_summary_statistics(self, metrics_by_period: Dict[str, PerformanceMetrics]) -> Dict[str, Any]:
        """Generate summary statistics across periods"""
        try:
            summary = {
                'best_period': None,
                'worst_period': None,
                'most_volatile_period': None,
                'best_sharpe_period': None,
                'average_annualized_return': 0.0,
                'average_volatility': 0.0,
                'average_sharpe_ratio': 0.0
            }
            
            if not metrics_by_period:
                return summary
            
            # Calculate averages
            returns = [m.annualized_return for m in metrics_by_period.values()]
            volatilities = [m.volatility for m in metrics_by_period.values()]
            sharpe_ratios = [m.sharpe_ratio for m in metrics_by_period.values()]
            
            summary['average_annualized_return'] = np.mean(returns)
            summary['average_volatility'] = np.mean(volatilities)
            summary['average_sharpe_ratio'] = np.mean(sharpe_ratios)
            
            # Find best/worst periods
            if returns:
                best_period = max(metrics_by_period.items(), key=lambda x: x[1].annualized_return)
                worst_period = min(metrics_by_period.items(), key=lambda x: x[1].annualized_return)
                most_volatile = max(metrics_by_period.items(), key=lambda x: x[1].volatility)
                best_sharpe = max(metrics_by_period.items(), key=lambda x: x[1].sharpe_ratio)
                
                summary['best_period'] = best_period[0]
                summary['worst_period'] = worst_period[0]
                summary['most_volatile_period'] = most_volatile[0]
                summary['best_sharpe_period'] = best_sharpe[0]
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate summary statistics: {e}")
            return {}
    
    def _generate_risk_analysis(self, metrics_by_period: Dict[str, PerformanceMetrics]) -> Dict[str, Any]:
        """Generate risk analysis across periods"""
        try:
            risk_analysis = {
                'risk_trends': {},
                'drawdown_analysis': {},
                'var_analysis': {},
                'risk_decomposition': {}
            }
            
            if not metrics_by_period:
                return risk_analysis
            
            # Analyze risk trends
            periods = sorted(metrics_by_period.keys())
            volatilities = [metrics_by_period[p].volatility for p in periods]
            max_drawdowns = [metrics_by_period[p].max_drawdown for p in periods]
            var_95s = [metrics_by_period[p].value_at_risk_95 for p in periods]
            
            risk_analysis['risk_trends'] = {
                'volatility_trend': 'increasing' if volatilities[-1] > volatilities[0] else 'decreasing',
                'drawdown_trend': 'increasing' if max_drawdowns[-1] > max_drawdowns[0] else 'decreasing',
                'var_trend': 'increasing' if var_95s[-1] > var_95s[0] else 'decreasing'
            }
            
            # Drawdown analysis
            risk_analysis['drawdown_analysis'] = {
                'max_drawdown': max(max_drawdowns),
                'average_drawdown': np.mean(max_drawdowns),
                'drawdown_volatility': np.std(max_drawdowns)
            }
            
            # VaR analysis
            risk_analysis['var_analysis'] = {
                'max_var': max(var_95s),
                'average_var': np.mean(var_95s),
                'var_volatility': np.std(var_95s)
            }
            
            return risk_analysis
            
        except Exception as e:
            logger.error(f"Failed to generate risk analysis: {e}")
            return {}
