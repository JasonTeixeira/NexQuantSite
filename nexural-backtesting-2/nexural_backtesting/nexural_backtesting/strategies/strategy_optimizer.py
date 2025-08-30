"""
Strategy Optimizer for Enterprise Quantitative Backtesting

This module provides comprehensive strategy optimization capabilities including
parameter optimization, walk-forward analysis, and strategy selection.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple, Callable
from enum import Enum
import logging
from datetime import datetime, timedelta
from concurrent.futures import ProcessPoolExecutor, as_completed
import itertools
from scipy.optimize import minimize, differential_evolution
from sklearn.model_selection import TimeSeriesSplit

from .base_strategy import BaseStrategy
from .backtesting_engine import BacktestingEngine, BacktestConfig, BacktestResult

logger = logging.getLogger(__name__)


class OptimizationMethod(Enum):
    """Optimization methods"""
    GRID_SEARCH = "grid_search"
    RANDOM_SEARCH = "random_search"
    BAYESIAN_OPTIMIZATION = "bayesian_optimization"
    GENETIC_ALGORITHM = "genetic_algorithm"
    DIFFERENTIAL_EVOLUTION = "differential_evolution"
    PARTICLE_SWARM = "particle_swarm"


class OptimizationMetric(Enum):
    """Optimization metrics"""
    SHARPE_RATIO = "sharpe_ratio"
    SORTINO_RATIO = "sortino_ratio"
    CALMAR_RATIO = "calmar_ratio"
    TOTAL_RETURN = "total_return"
    MAX_DRAWDOWN = "max_drawdown"
    PROFIT_FACTOR = "profit_factor"
    CUSTOM = "custom"


@dataclass
class OptimizationConfig:
    """Configuration for strategy optimization"""
    method: OptimizationMethod = OptimizationMethod.GRID_SEARCH
    metric: OptimizationMetric = OptimizationMetric.SHARPE_RATIO
    custom_metric: Optional[Callable] = None
    max_iterations: int = 1000
    n_jobs: int = -1  # Use all available cores
    cv_folds: int = 5
    test_size: float = 0.2
    random_state: int = 42
    early_stopping: bool = True
    patience: int = 10
    min_trades: int = 10
    min_periods: int = 252  # Minimum 1 year of data
    walk_forward: bool = True
    walk_forward_windows: int = 12
    walk_forward_step: int = 1


@dataclass
class OptimizationResult:
    """Results from strategy optimization"""
    best_parameters: Dict[str, Any]
    best_score: float
    optimization_history: List[Dict[str, Any]]
    cv_scores: List[float]
    parameter_importance: Dict[str, float]
    optimization_time: float
    method: OptimizationMethod
    metric: OptimizationMetric
    config: OptimizationConfig
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'best_parameters': self.best_parameters,
            'best_score': self.best_score,
            'cv_scores': self.cv_scores,
            'parameter_importance': self.parameter_importance,
            'optimization_time': self.optimization_time,
            'method': self.method.value,
            'metric': self.metric.value
        }


@dataclass
class WalkForwardResult:
    """Results from walk-forward analysis"""
    periods: List[Dict[str, Any]]
    out_of_sample_returns: List[float]
    parameter_stability: Dict[str, List[float]]
    performance_degradation: float
    robustness_score: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'out_of_sample_returns': self.out_of_sample_returns,
            'parameter_stability': self.parameter_stability,
            'performance_degradation': self.performance_degradation,
            'robustness_score': self.robustness_score
        }


class StrategyOptimizer:
    """
    Comprehensive strategy optimizer for quantitative trading strategies
    """
    
    def __init__(self, config: OptimizationConfig):
        """
        Initialize strategy optimizer
        
        Args:
            config: Optimization configuration
        """
        self.config = config
        self.optimization_history = []
        self.best_result = None
        
        logger.info(f"Initialized strategy optimizer with method: {config.method.value}")
    
    def optimize_strategy(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameter_grid: Optional[List[Dict[str, Any]]] = None,
        backtest_config: Optional[BacktestConfig] = None
    ) -> OptimizationResult:
        """
        Optimize strategy parameters
        
        Args:
            strategy_class: Strategy class to optimize
            data: Market data for optimization
            parameter_grid: Parameter grid for optimization
            backtest_config: Backtesting configuration
            
        Returns:
            Optimization results
        """
        start_time = datetime.now()
        
        # Use default parameter grid if not provided
        if parameter_grid is None:
            strategy = strategy_class()
            parameter_grid = strategy.get_parameter_grid()
        
        # Use default backtest config if not provided
        if backtest_config is None:
            backtest_config = BacktestConfig()
        
        logger.info(f"Starting optimization for {strategy_class.__name__}")
        logger.info(f"Parameter grid size: {len(parameter_grid)}")
        
        # Run optimization based on method
        if self.config.method == OptimizationMethod.GRID_SEARCH:
            result = self._grid_search_optimization(
                strategy_class, data, parameter_grid, backtest_config
            )
        elif self.config.method == OptimizationMethod.RANDOM_SEARCH:
            result = self._random_search_optimization(
                strategy_class, data, parameter_grid, backtest_config
            )
        elif self.config.method == OptimizationMethod.DIFFERENTIAL_EVOLUTION:
            result = self._differential_evolution_optimization(
                strategy_class, data, parameter_grid, backtest_config
            )
        else:
            raise ValueError(f"Unsupported optimization method: {self.config.method}")
        
        # Calculate optimization time
        optimization_time = (datetime.now() - start_time).total_seconds()
        result.optimization_time = optimization_time
        
        # Calculate parameter importance
        result.parameter_importance = self._calculate_parameter_importance()
        
        logger.info(f"Optimization completed in {optimization_time:.2f} seconds")
        logger.info(f"Best score: {result.best_score:.4f}")
        
        return result
    
    def walk_forward_analysis(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        best_parameters: Dict[str, Any],
        backtest_config: Optional[BacktestConfig] = None
    ) -> WalkForwardResult:
        """
        Perform walk-forward analysis
        
        Args:
            strategy_class: Strategy class to analyze
            data: Market data for analysis
            best_parameters: Best parameters from optimization
            backtest_config: Backtesting configuration
            
        Returns:
            Walk-forward analysis results
        """
        if not self.config.walk_forward:
            logger.warning("Walk-forward analysis disabled in config")
            return None
        
        if backtest_config is None:
            backtest_config = BacktestConfig()
        
        logger.info("Starting walk-forward analysis")
        
        # Calculate window size
        total_periods = len(data)
        window_size = int(total_periods * (1 - self.config.test_size))
        step_size = max(1, int(window_size / self.config.walk_forward_windows))
        
        periods = []
        out_of_sample_returns = []
        parameter_stability = {param: [] for param in best_parameters.keys()}
        
        # Walk-forward windows
        for i in range(0, total_periods - window_size, step_size):
            train_end = i + window_size
            test_end = min(train_end + step_size, total_periods)
            
            if test_end - train_end < self.config.min_periods:
                break
            
            # Split data
            train_data = data.iloc[i:train_end]
            test_data = data.iloc[train_end:test_end]
            
            # Optimize on training data
            train_result = self.optimize_strategy(
                strategy_class, train_data, backtest_config=backtest_config
            )
            
            # Test on out-of-sample data
            strategy = strategy_class()
            strategy.update_parameters(train_result.best_parameters)
            
            engine = BacktestingEngine(backtest_config)
            test_result = engine.run_backtest(strategy, test_data)
            
            # Record results
            period_result = {
                'train_start': i,
                'train_end': train_end,
                'test_start': train_end,
                'test_end': test_end,
                'in_sample_score': train_result.best_score,
                'out_of_sample_return': test_result.total_return,
                'parameters': train_result.best_parameters
            }
            periods.append(period_result)
            out_of_sample_returns.append(test_result.total_return)
            
            # Track parameter stability
            for param, value in train_result.best_parameters.items():
                parameter_stability[param].append(value)
        
        # Calculate performance degradation
        in_sample_scores = [p['in_sample_score'] for p in periods]
        performance_degradation = np.mean(in_sample_scores) - np.mean(out_of_sample_returns)
        
        # Calculate robustness score
        robustness_score = self._calculate_robustness_score(out_of_sample_returns)
        
        result = WalkForwardResult(
            periods=periods,
            out_of_sample_returns=out_of_sample_returns,
            parameter_stability=parameter_stability,
            performance_degradation=performance_degradation,
            robustness_score=robustness_score
        )
        
        logger.info(f"Walk-forward analysis completed")
        logger.info(f"Performance degradation: {performance_degradation:.4f}")
        logger.info(f"Robustness score: {robustness_score:.4f}")
        
        return result
    
    def _grid_search_optimization(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameter_grid: List[Dict[str, Any]],
        backtest_config: BacktestConfig
    ) -> OptimizationResult:
        """Grid search optimization"""
        best_score = float('-inf')
        best_parameters = None
        optimization_history = []
        
        # Use parallel processing if specified
        if self.config.n_jobs != 1:
            results = self._parallel_evaluation(
                strategy_class, data, parameter_grid, backtest_config
            )
            
            for i, (params, score) in enumerate(results):
                optimization_history.append({
                    'iteration': i,
                    'parameters': params,
                    'score': score
                })
                
                if score > best_score:
                    best_score = score
                    best_parameters = params
        else:
            # Sequential evaluation
            for i, params in enumerate(parameter_grid):
                score = self._evaluate_parameters(
                    strategy_class, data, params, backtest_config
                )
                
                optimization_history.append({
                    'iteration': i,
                    'parameters': params,
                    'score': score
                })
                
                if score > best_score:
                    best_score = score
                    best_parameters = params
                
                if i % 100 == 0:
                    logger.info(f"Grid search progress: {i}/{len(parameter_grid)}")
        
        return OptimizationResult(
            best_parameters=best_parameters or {},
            best_score=best_score if best_score != float('-inf') else 0.0,
            optimization_history=optimization_history,
            cv_scores=[best_score if best_score != float('-inf') else 0.0],
            parameter_importance={},
            optimization_time=0.0,
            method=self.config.method,
            metric=self.config.metric,
            config=self.config
        )
    
    def _random_search_optimization(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameter_grid: List[Dict[str, Any]],
        backtest_config: BacktestConfig
    ) -> OptimizationResult:
        """Random search optimization"""
        best_score = float('-inf')
        best_parameters = None
        optimization_history = []
        
        np.random.seed(self.config.random_state)
        
        for i in range(self.config.max_iterations):
            # Randomly sample parameters
            params = np.random.choice(parameter_grid)
            
            score = self._evaluate_parameters(
                strategy_class, data, params, backtest_config
            )
            
            optimization_history.append({
                'iteration': i,
                'parameters': params,
                'score': score
            })
            
            if score > best_score:
                best_score = score
                best_parameters = params
            
            if i % 100 == 0:
                logger.info(f"Random search progress: {i}/{self.config.max_iterations}")
        
        return OptimizationResult(
            best_parameters=best_parameters or {},
            best_score=best_score if best_score != float('-inf') else 0.0,
            optimization_history=optimization_history,
            cv_scores=[best_score if best_score != float('-inf') else 0.0],
            parameter_importance={},
            optimization_time=0.0,
            method=self.config.method,
            metric=self.config.metric,
            config=self.config
        )
    
    def _differential_evolution_optimization(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameter_grid: List[Dict[str, Any]],
        backtest_config: BacktestConfig
    ) -> OptimizationResult:
        """Differential evolution optimization"""
        # Convert parameter grid to bounds for differential evolution
        param_names = list(parameter_grid[0].keys())
        bounds = []
        
        for param in param_names:
            values = [p[param] for p in parameter_grid if isinstance(p[param], (int, float))]
            if values:
                bounds.append((min(values), max(values)))
            else:
                bounds.append((0, 1))  # Default bounds
        
        def objective_function(x):
            # Convert continuous values to discrete parameters
            params = {}
            for i, param in enumerate(param_names):
                if i < len(x):
                    # Find closest discrete value
                    values = [p[param] for p in parameter_grid if isinstance(p[param], (int, float))]
                    if values:
                        closest_idx = np.argmin(np.abs(np.array(values) - x[i]))
                        params[param] = values[closest_idx]
                    else:
                        params[param] = x[i]
                else:
                    params[param] = parameter_grid[0][param]
            
            return -self._evaluate_parameters(strategy_class, data, params, backtest_config)
        
        # Run differential evolution
        result = differential_evolution(
            objective_function,
            bounds,
            maxiter=self.config.max_iterations,
            seed=self.config.random_state
        )
        
        # Convert best solution back to parameters
        best_parameters = {}
        for i, param in enumerate(param_names):
            if i < len(result.x):
                values = [p[param] for p in parameter_grid if isinstance(p[param], (int, float))]
                if values:
                    closest_idx = np.argmin(np.abs(np.array(values) - result.x[i]))
                    best_parameters[param] = values[closest_idx]
                else:
                    best_parameters[param] = result.x[i]
            else:
                best_parameters[param] = parameter_grid[0][param]
        
        return OptimizationResult(
            best_parameters=best_parameters,
            best_score=-result.fun,
            optimization_history=[],  # Differential evolution doesn't provide iteration history
            cv_scores=[-result.fun],
            parameter_importance={},
            optimization_time=0.0,
            method=self.config.method,
            metric=self.config.metric,
            config=self.config
        )
    
    def _parallel_evaluation(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameter_grid: List[Dict[str, Any]],
        backtest_config: BacktestConfig
    ) -> List[Tuple[Dict[str, Any], float]]:
        """Parallel parameter evaluation"""
        n_jobs = self.config.n_jobs if self.config.n_jobs > 0 else None
        
        with ProcessPoolExecutor(max_workers=n_jobs) as executor:
            futures = []
            for params in parameter_grid:
                future = executor.submit(
                    self._evaluate_parameters,
                    strategy_class, data, params, backtest_config
                )
                futures.append((params, future))
            
            results = []
            for params, future in futures:
                try:
                    score = future.result()
                    results.append((params, score))
                except Exception as e:
                    logger.error(f"Error evaluating parameters {params}: {e}")
                    results.append((params, float('-inf')))
        
        return results
    
    def _evaluate_parameters(
        self,
        strategy_class: type,
        data: pd.DataFrame,
        parameters: Dict[str, Any],
        backtest_config: BacktestConfig
    ) -> float:
        """Evaluate a single parameter set"""
        try:
            # Create strategy with parameters
            strategy = strategy_class()
            strategy.update_parameters(parameters)
            
            # Run backtest
            engine = BacktestingEngine(backtest_config)
            result = engine.run_backtest(strategy, data)
            
            # Return metric value
            return self._extract_metric(result)
            
        except Exception as e:
            logger.error(f"Error evaluating parameters {parameters}: {e}")
            return float('-inf')
    
    def _extract_metric(self, result: BacktestResult) -> float:
        """Extract optimization metric from backtest result"""
        if self.config.metric == OptimizationMetric.SHARPE_RATIO:
            return result.sharpe_ratio
        elif self.config.metric == OptimizationMetric.SORTINO_RATIO:
            return result.sortino_ratio
        elif self.config.metric == OptimizationMetric.CALMAR_RATIO:
            return result.calmar_ratio
        elif self.config.metric == OptimizationMetric.TOTAL_RETURN:
            return result.total_return
        elif self.config.metric == OptimizationMetric.MAX_DRAWDOWN:
            return -result.max_drawdown  # Negative because we maximize
        elif self.config.metric == OptimizationMetric.PROFIT_FACTOR:
            return result.profit_factor
        elif self.config.metric == OptimizationMetric.CUSTOM:
            if self.config.custom_metric:
                return self.config.custom_metric(result)
            else:
                raise ValueError("Custom metric function not provided")
        else:
            raise ValueError(f"Unknown optimization metric: {self.config.metric}")
    
    def _calculate_parameter_importance(self) -> Dict[str, float]:
        """Calculate parameter importance from optimization history"""
        if not self.optimization_history:
            return {}
        
        # Simple correlation-based importance
        importance = {}
        param_names = list(self.optimization_history[0]['parameters'].keys())
        
        for param in param_names:
            param_values = [h['parameters'][param] for h in self.optimization_history]
            scores = [h['score'] for h in self.optimization_history]
            
            # Calculate correlation
            if len(set(param_values)) > 1:
                correlation = np.corrcoef(param_values, scores)[0, 1]
                importance[param] = abs(correlation) if not np.isnan(correlation) else 0.0
            else:
                importance[param] = 0.0
        
        return importance
    
    def _calculate_robustness_score(self, out_of_sample_returns: List[float]) -> float:
        """Calculate robustness score from out-of-sample returns"""
        if not out_of_sample_returns:
            return 0.0
        
        # Calculate consistency of performance
        returns_array = np.array(out_of_sample_returns)
        positive_periods = np.sum(returns_array > 0)
        total_periods = len(returns_array)
        
        # Robustness based on consistency and stability
        consistency = positive_periods / total_periods
        stability = 1.0 / (1.0 + np.std(returns_array))
        
        return (consistency + stability) / 2.0
