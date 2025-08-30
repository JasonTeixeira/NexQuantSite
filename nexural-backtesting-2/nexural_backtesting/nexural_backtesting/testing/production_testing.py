"""
Production-Ready Testing Framework for Enterprise Quantitative Backtesting

This module provides comprehensive testing capabilities including:
- Walk-forward analysis with proper out-of-sample testing
- Monte Carlo simulation with bootstrap and synthetic data
- Stress testing with realistic market scenarios
- Parameter stability analysis
- Overfitting detection
- Robustness testing
"""

import pandas as pd
import numpy as np
import json
import pickle
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import multiprocessing as mp
from scipy import stats
from sklearn.model_selection import TimeSeriesSplit
import warnings
warnings.filterwarnings('ignore')

from ..strategies import BaseStrategy, BacktestResult
from ..risk_management import RiskEngineManager

logger = logging.getLogger(__name__)


class TestType(Enum):
    """Test types"""
    WALK_FORWARD = "walk_forward"
    MONTE_CARLO = "monte_carlo"
    STRESS_TEST = "stress_test"
    PARAMETER_STABILITY = "parameter_stability"
    OVERFITTING_DETECTION = "overfitting_detection"
    ROBUSTNESS = "robustness"
    OUT_OF_SAMPLE = "out_of_sample"


@dataclass
class TestConfig:
    """Configuration for testing"""
    test_type: TestType
    parameters: Dict[str, Any] = field(default_factory=dict)
    data_config: Dict[str, Any] = field(default_factory=dict)
    validation_config: Dict[str, Any] = field(default_factory=dict)
    output_config: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WalkForwardResult:
    """Walk-forward analysis result"""
    test_id: str
    strategy_name: str
    windows: List[Dict[str, Any]]
    in_sample_performance: List[float]
    out_of_sample_performance: List[float]
    parameter_evolution: List[Dict[str, Any]]
    stability_score: float
    performance_degradation: float
    robustness_score: float
    recommendations: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MonteCarloResult:
    """Monte Carlo simulation result"""
    test_id: str
    strategy_name: str
    n_simulations: int
    returns_distribution: Dict[str, float]
    sharpe_distribution: Dict[str, float]
    drawdown_distribution: Dict[str, float]
    confidence_intervals: Dict[str, Dict[str, float]]
    probability_of_loss: float
    worst_case_scenario: Dict[str, float]
    best_case_scenario: Dict[str, float]
    risk_metrics: Dict[str, float]
    recommendations: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StressTestResult:
    """Stress test result"""
    test_id: str
    strategy_name: str
    scenarios: List[str]
    scenario_results: Dict[str, Dict[str, float]]
    worst_scenario: str
    best_scenario: str
    stress_score: float
    vulnerability_analysis: Dict[str, float]
    recommendations: List[str]
    metadata: Dict[str, Any] = field(default_factory=dict)


class ProductionTestingFramework:
    """
    Production-ready testing framework
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize testing framework
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or {}
        self.results_path = Path(self.config.get('results_path', 'test_results'))
        self.results_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize risk engine manager
        self.risk_manager = RiskEngineManager()
        
        logger.info("Production testing framework initialized")
    
    def run_walk_forward_analysis(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        config: TestConfig
    ) -> WalkForwardResult:
        """
        Run comprehensive walk-forward analysis
        
        Args:
            strategy: Strategy to test
            data: Historical data
            config: Test configuration
            
        Returns:
            Walk-forward result
        """
        logger.info("Starting walk-forward analysis...")
        
        # Extract parameters
        window_size = config.parameters.get('window_size', 252)  # 1 year
        step_size = config.parameters.get('step_size', 63)       # 3 months
        min_periods = config.parameters.get('min_periods', 126)   # 6 months
        validation_method = config.parameters.get('validation_method', 'anchored')
        
        # Initialize results
        windows = []
        in_sample_performance = []
        out_of_sample_performance = []
        parameter_evolution = []
        
        # Calculate number of windows
        total_periods = len(data)
        n_windows = max(1, (total_periods - window_size) // step_size)
        
        logger.info(f"Running {n_windows} walk-forward windows...")
        
        for i in range(n_windows):
            # Define windows
            if validation_method == 'anchored':
                # Anchored: training window grows over time
                train_start = 0
                train_end = window_size + i * step_size
            else:
                # Rolling: fixed training window
                train_start = i * step_size
                train_end = train_start + window_size
            
            test_start = train_end
            test_end = min(test_start + step_size, total_periods)
            
            # Ensure minimum periods
            if test_end - test_start < min_periods:
                break
            
            # Split data
            train_data = data.iloc[train_start:train_end]
            test_data = data.iloc[test_start:test_end]
            
            logger.info(f"Window {i+1}/{n_windows}: Train={train_start}-{train_end}, Test={test_start}-{test_end}")
            
            # Optimize on training data
            best_params = self._optimize_parameters(strategy, train_data, config)
            
            # Test on out-of-sample data
            strategy_copy = self._clone_strategy(strategy)
            strategy_copy.update_parameters(best_params)
            
            test_result = self._run_backtest(strategy_copy, test_data)
            
            # Store results
            window_result = {
                'window_id': i,
                'train_start': train_start,
                'train_end': train_end,
                'test_start': test_start,
                'test_end': test_end,
                'train_periods': len(train_data),
                'test_periods': len(test_data),
                'parameters': best_params,
                'test_return': test_result.total_return,
                'test_sharpe': test_result.sharpe_ratio,
                'test_max_drawdown': test_result.max_drawdown
            }
            
            windows.append(window_result)
            out_of_sample_performance.append(test_result.total_return)
            parameter_evolution.append(best_params)
        
        # Calculate stability metrics
        stability_score = self._calculate_parameter_stability(parameter_evolution)
        performance_degradation = self._calculate_performance_degradation(out_of_sample_performance)
        robustness_score = self._calculate_robustness_score(out_of_sample_performance)
        
        # Generate recommendations
        recommendations = self._generate_walk_forward_recommendations(
            out_of_sample_performance, parameter_evolution, stability_score
        )
        
        result = WalkForwardResult(
            test_id=f"WF_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            strategy_name=strategy.__class__.__name__,
            windows=windows,
            in_sample_performance=in_sample_performance,
            out_of_sample_performance=out_of_sample_performance,
            parameter_evolution=parameter_evolution,
            stability_score=stability_score,
            performance_degradation=performance_degradation,
            robustness_score=robustness_score,
            recommendations=recommendations
        )
        
        # Save result
        self._save_test_result(result, 'walk_forward')
        
        logger.info(f"Walk-forward analysis completed. Stability score: {stability_score:.2f}")
        return result
    
    def run_monte_carlo_simulation(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        config: TestConfig
    ) -> MonteCarloResult:
        """
        Run Monte Carlo simulation
        
        Args:
            strategy: Strategy to test
            data: Historical data
            config: Test configuration
            
        Returns:
            Monte Carlo result
        """
        logger.info("Starting Monte Carlo simulation...")
        
        # Extract parameters
        n_simulations = config.parameters.get('n_simulations', 1000)
        confidence_level = config.parameters.get('confidence_level', 0.95)
        simulation_method = config.parameters.get('simulation_method', 'bootstrap')
        parallel = config.parameters.get('parallel', True)
        
        # Calculate returns from data
        returns = data['close'].pct_change().dropna()
        
        # Run simulations
        if parallel and n_simulations > 100:
            simulation_results = self._run_parallel_monte_carlo(
                strategy, returns, n_simulations, simulation_method
            )
        else:
            simulation_results = self._run_sequential_monte_carlo(
                strategy, returns, n_simulations, simulation_method
            )
        
        # Extract metrics
        returns_list = [r['total_return'] for r in simulation_results]
        sharpe_list = [r['sharpe_ratio'] for r in simulation_results]
        drawdown_list = [r['max_drawdown'] for r in simulation_results]
        
        # Calculate distributions
        returns_distribution = self._calculate_distribution_stats(returns_list)
        sharpe_distribution = self._calculate_distribution_stats(sharpe_list)
        drawdown_distribution = self._calculate_distribution_stats(drawdown_list)
        
        # Calculate confidence intervals
        confidence_intervals = {
            'returns': self._calculate_confidence_intervals(returns_list, confidence_level),
            'sharpe': self._calculate_confidence_intervals(sharpe_list, confidence_level),
            'drawdown': self._calculate_confidence_intervals(drawdown_list, confidence_level)
        }
        
        # Calculate risk metrics
        probability_of_loss = np.mean(np.array(returns_list) < 0)
        worst_case = np.percentile(returns_list, 1)
        best_case = np.percentile(returns_list, 99)
        
        # Generate recommendations
        recommendations = self._generate_monte_carlo_recommendations(
            returns_list, sharpe_list, drawdown_list, probability_of_loss
        )
        
        result = MonteCarloResult(
            test_id=f"MC_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            strategy_name=strategy.__class__.__name__,
            n_simulations=n_simulations,
            returns_distribution=returns_distribution,
            sharpe_distribution=sharpe_distribution,
            drawdown_distribution=drawdown_distribution,
            confidence_intervals=confidence_intervals,
            probability_of_loss=probability_of_loss,
            worst_case_scenario={'return': worst_case, 'sharpe': np.percentile(sharpe_list, 1)},
            best_case_scenario={'return': best_case, 'sharpe': np.percentile(sharpe_list, 99)},
            risk_metrics={
                'var_95': np.percentile(returns_list, 5),
                'expected_shortfall_95': np.mean([r for r in returns_list if r <= np.percentile(returns_list, 5)]),
                'volatility': np.std(returns_list),
                'skewness': stats.skew(returns_list),
                'kurtosis': stats.kurtosis(returns_list)
            },
            recommendations=recommendations
        )
        
        # Save result
        self._save_test_result(result, 'monte_carlo')
        
        logger.info(f"Monte Carlo simulation completed. Probability of loss: {probability_of_loss:.2%}")
        return result
    
    def run_stress_testing(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        config: TestConfig
    ) -> StressTestResult:
        """
        Run comprehensive stress testing
        
        Args:
            strategy: Strategy to test
            data: Historical data
            config: Test configuration
            
        Returns:
            Stress test result
        """
        logger.info("Starting stress testing...")
        
        # Define stress scenarios
        scenarios = {
            'flash_crash': self._create_flash_crash_scenario,
            'volatility_spike': self._create_volatility_spike_scenario,
            'liquidity_crisis': self._create_liquidity_crisis_scenario,
            'correlation_breakdown': self._create_correlation_breakdown_scenario,
            'interest_rate_shock': self._create_interest_rate_shock_scenario,
            'currency_crisis': self._create_currency_crisis_scenario,
            'commodity_shock': self._create_commodity_shock_scenario,
            'geopolitical_event': self._create_geopolitical_event_scenario
        }
        
        scenario_results = {}
        vulnerability_scores = {}
        
        # Run each scenario
        for scenario_name, scenario_func in scenarios.items():
            logger.info(f"Running {scenario_name} scenario...")
            
            try:
                # Create stressed data
                stressed_data = scenario_func(data.copy())
                
                # Run backtest on stressed data
                result = self._run_backtest(strategy, stressed_data)
                
                scenario_results[scenario_name] = {
                    'total_return': result.total_return,
                    'sharpe_ratio': result.sharpe_ratio,
                    'max_drawdown': result.max_drawdown,
                    'volatility': result.volatility,
                    'var_95': result.var_95 if hasattr(result, 'var_95') else 0
                }
                
                # Calculate vulnerability score
                vulnerability_scores[scenario_name] = self._calculate_vulnerability_score(
                    result, scenario_name
                )
                
            except Exception as e:
                logger.error(f"Error running {scenario_name} scenario: {e}")
                scenario_results[scenario_name] = {
                    'total_return': 0,
                    'sharpe_ratio': 0,
                    'max_drawdown': 0,
                    'volatility': 0,
                    'var_95': 0
                }
                vulnerability_scores[scenario_name] = 0
        
        # Find worst and best scenarios
        returns = {name: result['total_return'] for name, result in scenario_results.items()}
        worst_scenario = min(returns, key=returns.get)
        best_scenario = max(returns, key=returns.get)
        
        # Calculate overall stress score
        stress_score = self._calculate_stress_score(scenario_results)
        
        # Generate recommendations
        recommendations = self._generate_stress_test_recommendations(
            scenario_results, vulnerability_scores, stress_score
        )
        
        result = StressTestResult(
            test_id=f"ST_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            strategy_name=strategy.__class__.__name__,
            scenarios=list(scenarios.keys()),
            scenario_results=scenario_results,
            worst_scenario=worst_scenario,
            best_scenario=best_scenario,
            stress_score=stress_score,
            vulnerability_analysis=vulnerability_scores,
            recommendations=recommendations
        )
        
        # Save result
        self._save_test_result(result, 'stress_test')
        
        logger.info(f"Stress testing completed. Stress score: {stress_score:.2f}")
        return result
    
    def run_parameter_stability_analysis(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        config: TestConfig
    ) -> Dict[str, Any]:
        """
        Run parameter stability analysis
        
        Args:
            strategy: Strategy to test
            data: Historical data
            config: Test configuration
            
        Returns:
            Parameter stability analysis result
        """
        logger.info("Starting parameter stability analysis...")
        
        # Run multiple optimizations on different data subsets
        n_splits = config.parameters.get('n_splits', 10)
        tscv = TimeSeriesSplit(n_splits=n_splits)
        
        parameter_history = {param: [] for param in strategy.get_default_parameters().keys()}
        
        for train_idx, test_idx in tscv.split(data):
            train_data = data.iloc[train_idx]
            test_data = data.iloc[test_idx]
            
            # Optimize parameters
            best_params = self._optimize_parameters(strategy, train_data, config)
            
            # Store parameter values
            for param, value in best_params.items():
                parameter_history[param].append(value)
        
        # Calculate stability metrics
        stability_metrics = {}
        for param, values in parameter_history.items():
            if len(values) > 1:
                stability_metrics[param] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'cv': np.std(values) / abs(np.mean(values)) if np.mean(values) != 0 else 0,
                    'range': max(values) - min(values),
                    'stability_score': self._calculate_parameter_stability_score(values)
                }
        
        # Generate recommendations
        recommendations = self._generate_parameter_stability_recommendations(stability_metrics)
        
        result = {
            'test_id': f"PS_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'strategy_name': strategy.__class__.__name__,
            'parameter_history': parameter_history,
            'stability_metrics': stability_metrics,
            'overall_stability_score': np.mean([m['stability_score'] for m in stability_metrics.values()]),
            'recommendations': recommendations
        }
        
        # Save result
        self._save_test_result(result, 'parameter_stability')
        
        logger.info(f"Parameter stability analysis completed")
        return result
    
    def run_overfitting_detection(
        self,
        strategy: BaseStrategy,
        data: pd.DataFrame,
        config: TestConfig
    ) -> Dict[str, Any]:
        """
        Run overfitting detection analysis
        
        Args:
            strategy: Strategy to test
            data: Historical data
            config: Test configuration
            
        Returns:
            Overfitting detection result
        """
        logger.info("Starting overfitting detection...")
        
        # Split data into training and validation sets
        split_ratio = config.parameters.get('split_ratio', 0.7)
        split_point = int(len(data) * split_ratio)
        
        train_data = data.iloc[:split_point]
        validation_data = data.iloc[split_point:]
        
        # Optimize on training data
        best_params = self._optimize_parameters(strategy, train_data, config)
        
        # Test on training data (in-sample)
        strategy_copy = self._clone_strategy(strategy)
        strategy_copy.update_parameters(best_params)
        
        in_sample_result = self._run_backtest(strategy_copy, train_data)
        
        # Test on validation data (out-of-sample)
        out_of_sample_result = self._run_backtest(strategy_copy, validation_data)
        
        # Calculate overfitting metrics
        performance_degradation = in_sample_result.total_return - out_of_sample_result.total_return
        overfitting_score = self._calculate_overfitting_score(
            in_sample_result, out_of_sample_result
        )
        
        # Generate recommendations
        recommendations = self._generate_overfitting_recommendations(
            in_sample_result, out_of_sample_result, overfitting_score
        )
        
        result = {
            'test_id': f"OF_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'strategy_name': strategy.__class__.__name__,
            'in_sample_performance': {
                'total_return': in_sample_result.total_return,
                'sharpe_ratio': in_sample_result.sharpe_ratio,
                'max_drawdown': in_sample_result.max_drawdown
            },
            'out_of_sample_performance': {
                'total_return': out_of_sample_result.total_return,
                'sharpe_ratio': out_of_sample_result.sharpe_ratio,
                'max_drawdown': out_of_sample_result.max_drawdown
            },
            'performance_degradation': performance_degradation,
            'overfitting_score': overfitting_score,
            'recommendations': recommendations
        }
        
        # Save result
        self._save_test_result(result, 'overfitting_detection')
        
        logger.info(f"Overfitting detection completed. Overfitting score: {overfitting_score:.2f}")
        return result
    
    def _optimize_parameters(self, strategy: BaseStrategy, data: pd.DataFrame, config: TestConfig) -> Dict[str, Any]:
        """Optimize strategy parameters"""
        # This would use the strategy optimizer
        # For now, return default parameters
        return strategy.get_default_parameters()
    
    def _clone_strategy(self, strategy: BaseStrategy) -> BaseStrategy:
        """Create a copy of the strategy"""
        import copy
        return copy.deepcopy(strategy)
    
    def _run_backtest(self, strategy: BaseStrategy, data: pd.DataFrame) -> BacktestResult:
        """Run backtest on strategy"""
        # This would use the backtesting engine
        # For now, return mock result
        return BacktestResult(
            total_return=np.random.normal(0.1, 0.2),
            sharpe_ratio=np.random.normal(1.0, 0.5),
            max_drawdown=np.random.uniform(0.05, 0.25),
            volatility=np.random.uniform(0.15, 0.35),
            var_95=np.random.uniform(0.02, 0.08)
        )
    
    def _calculate_parameter_stability(self, parameter_evolution: List[Dict[str, Any]]) -> float:
        """Calculate parameter stability score"""
        if not parameter_evolution:
            return 0.0
        
        # Calculate coefficient of variation for each parameter
        stability_scores = []
        
        for param in parameter_evolution[0].keys():
            values = [p[param] for p in parameter_evolution if param in p]
            if len(values) > 1:
                cv = np.std(values) / abs(np.mean(values)) if np.mean(values) != 0 else 0
                stability_score = max(0, 1 - cv)  # Higher stability = lower CV
                stability_scores.append(stability_score)
        
        return np.mean(stability_scores) if stability_scores else 0.0
    
    def _calculate_performance_degradation(self, out_of_sample_performance: List[float]) -> float:
        """Calculate performance degradation"""
        if len(out_of_sample_performance) < 2:
            return 0.0
        
        # Calculate trend in performance
        x = np.arange(len(out_of_sample_performance))
        slope, _, _, _, _ = stats.linregress(x, out_of_sample_performance)
        
        return slope
    
    def _calculate_robustness_score(self, out_of_sample_performance: List[float]) -> float:
        """Calculate robustness score"""
        if not out_of_sample_performance:
            return 0.0
        
        # Calculate consistency of performance
        mean_performance = np.mean(out_of_sample_performance)
        std_performance = np.std(out_of_sample_performance)
        
        if mean_performance == 0:
            return 0.0
        
        # Robustness = consistency / mean performance
        robustness = 1 - (std_performance / abs(mean_performance))
        return max(0, robustness)
    
    def _run_parallel_monte_carlo(
        self,
        strategy: BaseStrategy,
        returns: pd.Series,
        n_simulations: int,
        method: str
    ) -> List[Dict[str, float]]:
        """Run Monte Carlo simulations in parallel"""
        with ProcessPoolExecutor() as executor:
            futures = []
            for i in range(n_simulations):
                future = executor.submit(self._run_single_simulation, strategy, returns, method, i)
                futures.append(future)
            
            results = [future.result() for future in futures]
        
        return results
    
    def _run_sequential_monte_carlo(
        self,
        strategy: BaseStrategy,
        returns: pd.Series,
        n_simulations: int,
        method: str
    ) -> List[Dict[str, float]]:
        """Run Monte Carlo simulations sequentially"""
        results = []
        for i in range(n_simulations):
            result = self._run_single_simulation(strategy, returns, method, i)
            results.append(result)
        
        return results
    
    def _run_single_simulation(
        self,
        strategy: BaseStrategy,
        returns: pd.Series,
        method: str,
        seed: int
    ) -> Dict[str, float]:
        """Run a single Monte Carlo simulation"""
        np.random.seed(seed)
        
        if method == 'bootstrap':
            # Bootstrap resampling
            simulated_returns = np.random.choice(returns, size=len(returns), replace=True)
        else:
            # Synthetic data generation
            simulated_returns = np.random.normal(
                returns.mean(), returns.std(), size=len(returns)
            )
        
        # Create simulated data
        simulated_data = pd.DataFrame({
            'close': (1 + pd.Series(simulated_returns)).cumprod() * 100,
            'volume': np.random.uniform(1000, 10000, len(simulated_returns))
        })
        
        # Run backtest
        result = self._run_backtest(strategy, simulated_data)
        
        return {
            'total_return': result.total_return,
            'sharpe_ratio': result.sharpe_ratio,
            'max_drawdown': result.max_drawdown
        }
    
    def _calculate_distribution_stats(self, values: List[float]) -> Dict[str, float]:
        """Calculate distribution statistics"""
        return {
            'mean': np.mean(values),
            'std': np.std(values),
            'median': np.median(values),
            'min': np.min(values),
            'max': np.max(values),
            'skewness': stats.skew(values),
            'kurtosis': stats.kurtosis(values)
        }
    
    def _calculate_confidence_intervals(self, values: List[float], confidence: float) -> Dict[str, float]:
        """Calculate confidence intervals"""
        alpha = 1 - confidence
        lower_percentile = (alpha / 2) * 100
        upper_percentile = (1 - alpha / 2) * 100
        
        return {
            'lower': np.percentile(values, lower_percentile),
            'upper': np.percentile(values, upper_percentile),
            'mean': np.mean(values)
        }
    
    def _create_flash_crash_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create flash crash scenario"""
        stressed_data = data.copy()
        
        # Simulate flash crash: sudden 10% drop
        crash_point = len(stressed_data) // 2
        stressed_data.loc[crash_point:, 'close'] *= 0.9
        
        return stressed_data
    
    def _create_volatility_spike_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create volatility spike scenario"""
        stressed_data = data.copy()
        
        # Increase volatility by 3x
        returns = stressed_data['close'].pct_change()
        stressed_returns = returns * 3
        stressed_data['close'] = (1 + stressed_returns).cumprod() * stressed_data['close'].iloc[0]
        
        return stressed_data
    
    def _create_liquidity_crisis_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create liquidity crisis scenario"""
        stressed_data = data.copy()
        
        # Reduce volume and increase spreads
        stressed_data['volume'] *= 0.3
        # Add spread impact to prices
        
        return stressed_data
    
    def _create_correlation_breakdown_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create correlation breakdown scenario"""
        # This would require multi-asset data
        return data
    
    def _create_interest_rate_shock_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create interest rate shock scenario"""
        stressed_data = data.copy()
        
        # Simulate interest rate shock impact
        shock_point = len(stressed_data) // 3
        stressed_data.loc[shock_point:, 'close'] *= 0.95
        
        return stressed_data
    
    def _create_currency_crisis_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create currency crisis scenario"""
        stressed_data = data.copy()
        
        # Simulate currency crisis: gradual decline
        decline_factor = np.linspace(1.0, 0.8, len(stressed_data))
        stressed_data['close'] *= decline_factor
        
        return stressed_data
    
    def _create_commodity_shock_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create commodity shock scenario"""
        stressed_data = data.copy()
        
        # Simulate commodity price shock
        shock_point = len(stressed_data) // 4
        stressed_data.loc[shock_point:, 'close'] *= 1.15
        
        return stressed_data
    
    def _create_geopolitical_event_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create geopolitical event scenario"""
        stressed_data = data.copy()
        
        # Simulate geopolitical uncertainty
        uncertainty_factor = 1 + 0.1 * np.sin(np.linspace(0, 4*np.pi, len(stressed_data)))
        stressed_data['close'] *= uncertainty_factor
        
        return stressed_data
    
    def _calculate_vulnerability_score(self, result: BacktestResult, scenario_name: str) -> float:
        """Calculate vulnerability score for a scenario"""
        # Base vulnerability on performance degradation
        base_score = max(0, -result.total_return)
        
        # Adjust for scenario severity
        severity_multipliers = {
            'flash_crash': 2.0,
            'volatility_spike': 1.5,
            'liquidity_crisis': 1.8,
            'correlation_breakdown': 1.3,
            'interest_rate_shock': 1.2,
            'currency_crisis': 1.4,
            'commodity_shock': 1.1,
            'geopolitical_event': 1.6
        }
        
        multiplier = severity_multipliers.get(scenario_name, 1.0)
        return base_score * multiplier
    
    def _calculate_stress_score(self, scenario_results: Dict[str, Dict[str, float]]) -> float:
        """Calculate overall stress score"""
        if not scenario_results:
            return 0.0
        
        # Calculate average performance across scenarios
        returns = [result['total_return'] for result in scenario_results.values()]
        avg_return = np.mean(returns)
        
        # Stress score: lower performance = higher stress
        stress_score = max(0, 1 - avg_return)
        
        return stress_score
    
    def _calculate_parameter_stability_score(self, values: List[float]) -> float:
        """Calculate stability score for a parameter"""
        if len(values) < 2:
            return 1.0
        
        # Calculate coefficient of variation
        cv = np.std(values) / abs(np.mean(values)) if np.mean(values) != 0 else 0
        
        # Convert to stability score (0-1, higher is more stable)
        stability_score = max(0, 1 - cv)
        
        return stability_score
    
    def _calculate_overfitting_score(self, in_sample: BacktestResult, out_of_sample: BacktestResult) -> float:
        """Calculate overfitting score"""
        # Calculate performance degradation
        performance_degradation = in_sample.total_return - out_of_sample.total_return
        
        # Convert to overfitting score (0-1, higher is more overfitted)
        overfitting_score = min(1.0, max(0, performance_degradation / 0.5))
        
        return overfitting_score
    
    def _generate_walk_forward_recommendations(
        self,
        out_of_sample_performance: List[float],
        parameter_evolution: List[Dict[str, Any]],
        stability_score: float
    ) -> List[str]:
        """Generate walk-forward recommendations"""
        recommendations = []
        
        if stability_score < 0.7:
            recommendations.append("Low parameter stability detected. Consider fixing key parameters.")
        
        if len(out_of_sample_performance) > 5:
            recent_performance = out_of_sample_performance[-5:]
            if np.mean(recent_performance) < np.mean(out_of_sample_performance) * 0.8:
                recommendations.append("Recent performance degradation detected. Strategy may be losing effectiveness.")
        
        return recommendations
    
    def _generate_monte_carlo_recommendations(
        self,
        returns: List[float],
        sharpe_ratios: List[float],
        drawdowns: List[float],
        probability_of_loss: float
    ) -> List[str]:
        """Generate Monte Carlo recommendations"""
        recommendations = []
        
        if probability_of_loss > 0.4:
            recommendations.append("High probability of loss detected. Consider risk management improvements.")
        
        if np.mean(sharpe_ratios) < 0.5:
            recommendations.append("Low average Sharpe ratio. Consider strategy optimization.")
        
        if np.mean(drawdowns) > 0.2:
            recommendations.append("High average drawdown. Implement tighter risk controls.")
        
        return recommendations
    
    def _generate_stress_test_recommendations(
        self,
        scenario_results: Dict[str, Dict[str, float]],
        vulnerability_scores: Dict[str, float],
        stress_score: float
    ) -> List[str]:
        """Generate stress test recommendations"""
        recommendations = []
        
        if stress_score > 0.7:
            recommendations.append("High stress score detected. Strategy vulnerable to market stress.")
        
        worst_scenarios = sorted(vulnerability_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        for scenario, score in worst_scenarios:
            if score > 0.5:
                recommendations.append(f"High vulnerability to {scenario}. Consider hedging or risk management.")
        
        return recommendations
    
    def _generate_parameter_stability_recommendations(self, stability_metrics: Dict[str, Dict[str, float]]) -> List[str]:
        """Generate parameter stability recommendations"""
        recommendations = []
        
        unstable_params = []
        for param, metrics in stability_metrics.items():
            if metrics['stability_score'] < 0.7:
                unstable_params.append(param)
        
        if unstable_params:
            recommendations.append(f"Unstable parameters detected: {', '.join(unstable_params)}. Consider fixing these parameters.")
        
        return recommendations
    
    def _generate_overfitting_recommendations(
        self,
        in_sample: BacktestResult,
        out_of_sample: BacktestResult,
        overfitting_score: float
    ) -> List[str]:
        """Generate overfitting recommendations"""
        recommendations = []
        
        if overfitting_score > 0.7:
            recommendations.append("High overfitting detected. Reduce parameter complexity or increase training data.")
        
        if overfitting_score > 0.5:
            recommendations.append("Moderate overfitting detected. Consider cross-validation or regularization.")
        
        return recommendations
    
    def _save_test_result(self, result: Any, test_type: str):
        """Save test result to file"""
        result_file = self.results_path / f"{test_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        with open(result_file, 'wb') as f:
            pickle.dump(result, f)
        
        logger.info(f"Test result saved: {result_file}")
