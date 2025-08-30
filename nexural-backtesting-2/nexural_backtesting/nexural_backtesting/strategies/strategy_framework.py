"""
Strategy Framework for Enterprise Quantitative Backtesting

This module provides a unified framework for strategy development, management,
and execution with support for multiple strategy types and execution modes.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple, Callable, Union
from enum import Enum
import logging
from datetime import datetime, timedelta
import json
import pickle
from pathlib import Path

from .base_strategy import BaseStrategy
from .backtesting_engine import BacktestingEngine, BacktestConfig, BacktestResult
from .strategy_optimizer import StrategyOptimizer, OptimizationConfig, OptimizationResult
from .signal_generator import SignalGenerator, SignalConfig, SignalFilter, SignalCombiner
from .position_manager import PositionManager

logger = logging.getLogger(__name__)


class StrategyType(Enum):
    """Strategy types"""
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    PAIRS_TRADING = "pairs_trading"
    STATISTICAL_ARBITRAGE = "statistical_arbitrage"
    MARKET_NEUTRAL = "market_neutral"
    TREND_FOLLOWING = "trend_following"
    CONTRARIAN = "contrarian"
    MULTI_FACTOR = "multi_factor"
    MACHINE_LEARNING = "machine_learning"
    CUSTOM = "custom"


class ExecutionMode(Enum):
    """Strategy execution modes"""
    BACKTEST = "backtest"
    PAPER_TRADING = "paper_trading"
    LIVE_TRADING = "live_trading"
    SIMULATION = "simulation"


@dataclass
class StrategyConfig:
    """Configuration for strategy framework"""
    strategy_type: StrategyType
    execution_mode: ExecutionMode = ExecutionMode.BACKTEST
    initial_capital: float = 1000000.0
    max_position_size: float = 0.1
    enable_shorting: bool = True
    transaction_costs: float = 0.001  # 0.1%
    slippage: float = 0.0005  # 0.05%
    rebalance_frequency: str = "daily"
    risk_management: bool = True
    position_sizing: bool = True
    signal_filtering: bool = True
    performance_tracking: bool = True
    data_quality_checks: bool = True


@dataclass
class StrategyMetadata:
    """Strategy metadata"""
    name: str
    description: str
    author: str
    version: str
    created_date: datetime
    last_modified: datetime
    tags: List[str] = field(default_factory=list)
    parameters: Dict[str, Any] = field(default_factory=dict)
    performance_summary: Dict[str, Any] = field(default_factory=dict)


class StrategyFramework:
    """
    Comprehensive strategy framework for quantitative trading
    """
    
    def __init__(self, config: StrategyConfig):
        """
        Initialize strategy framework
        
        Args:
            config: Strategy configuration
        """
        self.config = config
        self.strategies: Dict[str, BaseStrategy] = {}
        self.metadata: Dict[str, StrategyMetadata] = {}
        self.results: Dict[str, BacktestResult] = {}
        
        # Initialize components
        self.backtest_config = BacktestConfig(
            initial_capital=config.initial_capital,
            max_position_size=config.max_position_size,
            enable_shorting=config.enable_shorting,
            transaction_cost_bps=config.transaction_costs * 10000,
            slippage_bps=config.slippage * 10000,
            data_quality_checks=config.data_quality_checks,
            risk_monitoring=config.risk_management
        )
        
        self.signal_config = SignalConfig()
        self.signal_generator = SignalGenerator(self.signal_config)
        
        logger.info(f"Strategy framework initialized for {config.strategy_type.value}")
    
    def register_strategy(
        self,
        name: str,
        strategy: BaseStrategy,
        metadata: Optional[StrategyMetadata] = None
    ):
        """
        Register a strategy with the framework
        
        Args:
            name: Strategy name
            strategy: Strategy instance
            metadata: Optional strategy metadata
        """
        self.strategies[name] = strategy
        
        if metadata is None:
            metadata = StrategyMetadata(
                name=name,
                description=strategy.__doc__ or "No description",
                author="Unknown",
                version="1.0.0",
                created_date=datetime.now(),
                last_modified=datetime.now()
            )
        
        self.metadata[name] = metadata
        logger.info(f"Registered strategy: {name}")
    
    def run_strategy(
        self,
        strategy_name: str,
        data: pd.DataFrame,
        parameters: Optional[Dict[str, Any]] = None,
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> BacktestResult:
        """
        Run a single strategy
        
        Args:
            strategy_name: Name of the strategy to run
            data: Market data
            parameters: Optional parameters to override
            benchmark_data: Optional benchmark data
            
        Returns:
            Backtest results
        """
        if strategy_name not in self.strategies:
            raise ValueError(f"Strategy '{strategy_name}' not found")
        
        strategy = self.strategies[strategy_name]
        
        # Update parameters if provided
        if parameters:
            strategy.update_parameters(parameters)
            self.metadata[strategy_name].parameters.update(parameters)
            self.metadata[strategy_name].last_modified = datetime.now()
        
        # Run backtest
        engine = BacktestingEngine(self.backtest_config)
        result = engine.run_backtest(strategy, data, benchmark_data)
        
        # Store results
        self.results[strategy_name] = result
        
        # Update metadata
        self.metadata[strategy_name].performance_summary = result.to_dict()
        
        logger.info(f"Strategy '{strategy_name}' completed with return: {result.total_return:.2%}")
        
        return result
    
    def run_multiple_strategies(
        self,
        data: pd.DataFrame,
        strategy_names: Optional[List[str]] = None,
        parameters: Optional[Dict[str, Dict[str, Any]]] = None,
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> Dict[str, BacktestResult]:
        """
        Run multiple strategies
        
        Args:
            data: Market data
            strategy_names: List of strategy names (None for all)
            parameters: Parameters for each strategy
            benchmark_data: Optional benchmark data
            
        Returns:
            Dictionary of results by strategy name
        """
        if strategy_names is None:
            strategy_names = list(self.strategies.keys())
        
        if parameters is None:
            parameters = {}
        
        results = {}
        
        for name in strategy_names:
            try:
                strategy_params = parameters.get(name, {})
                result = self.run_strategy(name, data, strategy_params, benchmark_data)
                results[name] = result
            except Exception as e:
                logger.error(f"Error running strategy '{name}': {e}")
                continue
        
        return results
    
    def optimize_strategy(
        self,
        strategy_name: str,
        data: pd.DataFrame,
        optimization_config: Optional[OptimizationConfig] = None,
        parameter_grid: Optional[List[Dict[str, Any]]] = None
    ) -> OptimizationResult:
        """
        Optimize strategy parameters
        
        Args:
            strategy_name: Name of the strategy to optimize
            data: Market data
            optimization_config: Optimization configuration
            parameter_grid: Parameter grid for optimization
            
        Returns:
            Optimization results
        """
        if strategy_name not in self.strategies:
            raise ValueError(f"Strategy '{strategy_name}' not found")
        
        strategy_class = type(self.strategies[strategy_name])
        
        if optimization_config is None:
            optimization_config = OptimizationConfig()
        
        optimizer = StrategyOptimizer(optimization_config)
        result = optimizer.optimize_strategy(
            strategy_class, data, parameter_grid, self.backtest_config
        )
        
        # Update strategy with best parameters
        self.strategies[strategy_name].update_parameters(result.best_parameters)
        self.metadata[strategy_name].parameters.update(result.best_parameters)
        self.metadata[strategy_name].last_modified = datetime.now()
        
        logger.info(f"Strategy '{strategy_name}' optimized with score: {result.best_score:.4f}")
        
        return result
    
    def compare_strategies(
        self,
        data: pd.DataFrame,
        strategy_names: Optional[List[str]] = None,
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Compare multiple strategies
        
        Args:
            data: Market data
            strategy_names: List of strategy names (None for all)
            benchmark_data: Optional benchmark data
            
        Returns:
            Comparison DataFrame
        """
        if strategy_names is None:
            strategy_names = list(self.strategies.keys())
        
        # Run all strategies
        results = self.run_multiple_strategies(data, strategy_names, benchmark_data=benchmark_data)
        
        # Create comparison DataFrame
        comparison_data = []
        
        for name, result in results.items():
            comparison_data.append({
                'Strategy': name,
                'Total Return': result.total_return,
                'Annualized Return': result.annualized_return,
                'Volatility': result.volatility,
                'Sharpe Ratio': result.sharpe_ratio,
                'Sortino Ratio': result.sortino_ratio,
                'Max Drawdown': result.max_drawdown,
                'Calmar Ratio': result.calmar_ratio,
                'Win Rate': result.win_rate,
                'Profit Factor': result.profit_factor,
                'Total Trades': result.total_trades,
                'VaR (95%)': result.var_95,
                'Expected Shortfall': result.expected_shortfall
            })
        
        comparison_df = pd.DataFrame(comparison_data)
        comparison_df = comparison_df.sort_values('Sharpe Ratio', ascending=False)
        
        return comparison_df
    
    def generate_signal(
        self,
        data: pd.DataFrame,
        strategy_names: Optional[List[str]] = None,
        signal_filters: Optional[List[SignalFilter]] = None,
        signal_combiner: Optional[SignalCombiner] = None
    ) -> pd.Series:
        """
        Generate combined signal from multiple strategies
        
        Args:
            data: Market data
            strategy_names: List of strategy names (None for all)
            signal_filters: Optional signal filters
            signal_combiner: Optional signal combiner
            
        Returns:
            Combined signal series
        """
        if strategy_names is None:
            strategy_names = list(self.strategies.keys())
        
        # Add filters if provided
        if signal_filters:
            for filter_config in signal_filters:
                self.signal_generator.add_filter(filter_config)
        
        # Set combiner if provided
        if signal_combiner:
            self.signal_generator.set_combiner(signal_combiner)
        
        # Create strategy functions
        strategy_functions = []
        for name in strategy_names:
            if name in self.strategies:
                strategy = self.strategies[name]
                strategy_functions.append(strategy.generate_signal)
        
        # Generate combined signal
        combined_signal = self.signal_generator.generate_signal(
            data, strategy_functions, strategy_names
        )
        
        return combined_signal
    
    def save_strategy(
        self,
        strategy_name: str,
        filepath: str,
        include_results: bool = True
    ):
        """
        Save strategy to file
        
        Args:
            strategy_name: Name of the strategy to save
            filepath: File path to save to
            include_results: Whether to include backtest results
        """
        if strategy_name not in self.strategies:
            raise ValueError(f"Strategy '{strategy_name}' not found")
        
        save_data = {
            'strategy': self.strategies[strategy_name],
            'metadata': self.metadata[strategy_name],
            'config': self.config
        }
        
        if include_results and strategy_name in self.results:
            save_data['results'] = self.results[strategy_name]
        
        with open(filepath, 'wb') as f:
            pickle.dump(save_data, f)
        
        logger.info(f"Strategy '{strategy_name}' saved to {filepath}")
    
    def load_strategy(self, filepath: str) -> str:
        """
        Load strategy from file
        
        Args:
            filepath: File path to load from
            
        Returns:
            Strategy name
        """
        with open(filepath, 'rb') as f:
            load_data = pickle.load(f)
        
        strategy = load_data['strategy']
        metadata = load_data['metadata']
        config = load_data.get('config', self.config)
        
        # Register strategy
        self.register_strategy(metadata.name, strategy, metadata)
        
        # Load results if available
        if 'results' in load_data:
            self.results[metadata.name] = load_data['results']
        
        logger.info(f"Strategy '{metadata.name}' loaded from {filepath}")
        
        return metadata.name
    
    def export_results(
        self,
        strategy_name: str,
        filepath: str,
        format: str = "json"
    ):
        """
        Export strategy results
        
        Args:
            strategy_name: Name of the strategy
            filepath: File path to export to
            format: Export format (json, csv, excel)
        """
        if strategy_name not in self.results:
            raise ValueError(f"No results found for strategy '{strategy_name}'")
        
        result = self.results[strategy_name]
        
        if format.lower() == "json":
            with open(filepath, 'w') as f:
                json.dump(result.to_dict(), f, indent=2, default=str)
        elif format.lower() == "csv":
            # Export equity curve
            result.equity_curve.to_csv(filepath)
        elif format.lower() == "excel":
            with pd.ExcelWriter(filepath) as writer:
                # Summary sheet
                summary_df = pd.DataFrame([result.to_dict()])
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Equity curve sheet
                result.equity_curve.to_frame('Equity').to_excel(writer, sheet_name='Equity Curve')
                
                # Trades sheet
                if result.trades:
                    trades_df = pd.DataFrame([
                        {
                            'timestamp': t.timestamp,
                            'symbol': t.symbol,
                            'side': t.side,
                            'quantity': t.quantity,
                            'price': t.price,
                            'value': t.value,
                            'transaction_cost': t.transaction_cost
                        }
                        for t in result.trades
                    ])
                    trades_df.to_excel(writer, sheet_name='Trades', index=False)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        logger.info(f"Results for '{strategy_name}' exported to {filepath}")
    
    def get_strategy_summary(self) -> pd.DataFrame:
        """Get summary of all registered strategies"""
        summary_data = []
        
        for name, metadata in self.metadata.items():
            summary_data.append({
                'Name': name,
                'Type': self.config.strategy_type.value,
                'Description': metadata.description,
                'Author': metadata.author,
                'Version': metadata.version,
                'Created': metadata.created_date,
                'Modified': metadata.last_modified,
                'Parameters': len(metadata.parameters),
                'Has Results': name in self.results
            })
        
        return pd.DataFrame(summary_data)
    
    def get_performance_summary(self) -> pd.DataFrame:
        """Get performance summary of all strategies with results"""
        if not self.results:
            return pd.DataFrame()
        
        summary_data = []
        
        for name, result in self.results.items():
            summary_data.append({
                'Strategy': name,
                'Total Return': result.total_return,
                'Annualized Return': result.annualized_return,
                'Sharpe Ratio': result.sharpe_ratio,
                'Max Drawdown': result.max_drawdown,
                'Win Rate': result.win_rate,
                'Total Trades': result.total_trades,
                'Final Value': result.final_value
            })
        
        summary_df = pd.DataFrame(summary_data)
        return summary_df.sort_values('Sharpe Ratio', ascending=False)
    
    def validate_strategy(self, strategy_name: str) -> List[str]:
        """
        Validate strategy configuration
        
        Args:
            strategy_name: Name of the strategy to validate
            
        Returns:
            List of validation errors
        """
        errors = []
        
        if strategy_name not in self.strategies:
            errors.append(f"Strategy '{strategy_name}' not found")
            return errors
        
        strategy = self.strategies[strategy_name]
        metadata = self.metadata[strategy_name]
        
        # Validate strategy parameters
        if not strategy.validate_parameters(metadata.parameters):
            errors.append("Invalid strategy parameters")
        
        # Validate risk metrics
        risk_metrics = strategy.get_risk_metrics()
        if risk_metrics['max_position_size'] > self.config.max_position_size:
            errors.append("Strategy max position size exceeds framework limit")
        
        # Validate metadata
        if not metadata.name or not metadata.description:
            errors.append("Missing required metadata")
        
        return errors
    
    def clone_strategy(
        self,
        original_name: str,
        new_name: str,
        modifications: Optional[Dict[str, Any]] = None
    ):
        """
        Clone a strategy with optional modifications
        
        Args:
            original_name: Name of the original strategy
            new_name: Name for the cloned strategy
            modifications: Optional modifications to apply
        """
        if original_name not in self.strategies:
            raise ValueError(f"Strategy '{original_name}' not found")
        
        # Clone strategy
        original_strategy = self.strategies[original_name]
        original_metadata = self.metadata[original_name]
        
        # Create new strategy instance
        new_strategy = type(original_strategy)()
        
        # Apply modifications
        if modifications:
            new_strategy.update_parameters(modifications)
        
        # Create new metadata
        new_metadata = StrategyMetadata(
            name=new_name,
            description=f"Clone of {original_name}: {original_metadata.description}",
            author=original_metadata.author,
            version="1.0.0",
            created_date=datetime.now(),
            last_modified=datetime.now(),
            tags=original_metadata.tags + ["clone"],
            parameters=new_strategy.parameters
        )
        
        # Register new strategy
        self.register_strategy(new_name, new_strategy, new_metadata)
        
        logger.info(f"Strategy '{original_name}' cloned as '{new_name}'")
    
    def remove_strategy(self, strategy_name: str):
        """Remove a strategy from the framework"""
        if strategy_name in self.strategies:
            del self.strategies[strategy_name]
        
        if strategy_name in self.metadata:
            del self.metadata[strategy_name]
        
        if strategy_name in self.results:
            del self.results[strategy_name]
        
        logger.info(f"Strategy '{strategy_name}' removed from framework")
