"""
High-Performance Backtesting Engine for MBP-10 Data
Optimized for order book strategies with vectorized operations
"""

import numpy as np
import polars as pl
import pandas as pd
from typing import Dict, List, Optional, Tuple, Callable, Any
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import vectorbt as vbt
from loguru import logger
from datetime import datetime
import json
from pathlib import Path


@dataclass
class BacktestConfig:
    """Backtesting configuration"""
    initial_capital: float = 1_000_000
    commission: float = 0.0002  # 2 bps
    slippage: float = 0.0001    # 1 bp
    position_size: float = 0.1   # 10% of capital per trade
    max_positions: int = 10
    stop_loss: float = 0.02      # 2% stop loss
    take_profit: float = 0.03    # 3% take profit
    use_leverage: bool = False
    leverage: float = 1.0
    rebalance_frequency: str = "daily"
    risk_free_rate: float = 0.04  # 4% annual


@dataclass
class TradeSignal:
    """Trade signal with metadata"""
    timestamp: datetime
    symbol: str
    side: str  # 'long' or 'short'
    confidence: float  # 0-1
    expected_return: float
    risk_score: float
    metadata: Dict[str, Any] = field(default_factory=dict)


class Strategy(ABC):
    """Base strategy class for MBP data"""
    
    def __init__(self, name: str, config: Optional[BacktestConfig] = None):
        self.name = name
        self.config = config or BacktestConfig()
        self.signals: List[TradeSignal] = []
        
    @abstractmethod
    def generate_signals(self, df: pl.DataFrame) -> pl.DataFrame:
        """Generate trading signals from MBP data"""
        pass
    
    @abstractmethod
    def calculate_position_size(self, signal: TradeSignal, portfolio_value: float) -> float:
        """Calculate position size for a signal"""
        pass


class BookPressureStrategy(Strategy):
    """
    Order book pressure-based strategy
    Trades based on bid/ask volume imbalances
    """
    
    def __init__(self, 
                 imbalance_threshold: float = 0.7,
                 lookback_period: int = 100):
        super().__init__("BookPressure")
        self.imbalance_threshold = imbalance_threshold
        self.lookback_period = lookback_period
        
    def generate_signals(self, df: pl.DataFrame) -> pl.DataFrame:
        """Generate signals based on book pressure"""
        
        # Calculate book pressure metrics
        df = df.with_columns([
            # Immediate pressure
            ((pl.col("total_bid_volume") - pl.col("total_ask_volume")) / 
             (pl.col("total_bid_volume") + pl.col("total_ask_volume"))).alias("book_pressure"),
            
            # Volume-weighted pressure (top 5 levels)
            ((pl.sum_horizontal([f"bid_size_{i}" for i in range(1, 6)]) - 
              pl.sum_horizontal([f"ask_size_{i}" for i in range(1, 6)])) /
             (pl.sum_horizontal([f"bid_size_{i}" for i in range(1, 6)]) + 
              pl.sum_horizontal([f"ask_size_{i}" for i in range(1, 6)]))).alias("weighted_pressure")
        ])
        
        # Rolling statistics
        df = df.with_columns([
            pl.col("book_pressure").rolling_mean(self.lookback_period).alias("pressure_ma"),
            pl.col("book_pressure").rolling_std(self.lookback_period).alias("pressure_std")
        ])
        
        # Z-score for pressure
        df = df.with_columns([
            ((pl.col("book_pressure") - pl.col("pressure_ma")) / 
             pl.col("pressure_std")).alias("pressure_zscore")
        ])
        
        # Generate signals
        df = df.with_columns([
            # Long signal: High bid pressure
            pl.when(pl.col("pressure_zscore") > self.imbalance_threshold)
            .then(1)
            .when(pl.col("pressure_zscore") < -self.imbalance_threshold)
            .then(-1)
            .otherwise(0)
            .alias("signal")
        ])
        
        # Signal confidence (based on z-score magnitude)
        df = df.with_columns([
            (pl.col("pressure_zscore").abs() / 3).clip(0, 1).alias("signal_confidence")
        ])
        
        return df
    
    def calculate_position_size(self, signal: TradeSignal, portfolio_value: float) -> float:
        """Kelly Criterion-based position sizing"""
        
        # Simplified Kelly: f = (p * b - q) / b
        # where p = win probability, q = loss probability, b = win/loss ratio
        
        win_prob = 0.45 + (signal.confidence * 0.1)  # 45-55% based on confidence
        loss_prob = 1 - win_prob
        win_loss_ratio = self.config.take_profit / self.config.stop_loss
        
        kelly_fraction = (win_prob * win_loss_ratio - loss_prob) / win_loss_ratio
        
        # Apply Kelly with safety factor (25% of full Kelly)
        position_fraction = max(0, min(kelly_fraction * 0.25, self.config.position_size))
        
        return portfolio_value * position_fraction


class SpreadMeanReversion(Strategy):
    """
    Mean reversion strategy based on spread dynamics
    """
    
    def __init__(self,
                 spread_lookback: int = 500,
                 entry_zscore: float = 2.0,
                 exit_zscore: float = 0.5):
        super().__init__("SpreadMeanReversion")
        self.spread_lookback = spread_lookback
        self.entry_zscore = entry_zscore
        self.exit_zscore = exit_zscore
        
    def generate_signals(self, df: pl.DataFrame) -> pl.DataFrame:
        """Generate mean reversion signals from spread"""
        
        # Calculate spread metrics
        df = df.with_columns([
            pl.col("spread_pct").rolling_mean(self.spread_lookback).alias("spread_ma"),
            pl.col("spread_pct").rolling_std(self.spread_lookback).alias("spread_std")
        ])
        
        # Z-score
        df = df.with_columns([
            ((pl.col("spread_pct") - pl.col("spread_ma")) / 
             pl.col("spread_std")).alias("spread_zscore")
        ])
        
        # Signals: Trade when spread is extreme
        df = df.with_columns([
            pl.when(pl.col("spread_zscore") > self.entry_zscore)
            .then(-1)  # Short when spread is too wide
            .when(pl.col("spread_zscore") < -self.entry_zscore)
            .then(1)   # Long when spread is too tight
            .when(pl.col("spread_zscore").abs() < self.exit_zscore)
            .then(0)   # Exit near mean
            .otherwise(pl.col("signal").fill_null(strategy="forward").fill_null(0))
            .alias("signal")
        ])
        
        return df
    
    def calculate_position_size(self, signal: TradeSignal, portfolio_value: float) -> float:
        """Fixed fractional position sizing"""
        return portfolio_value * self.config.position_size


class BacktestEngine:
    """
    Main backtesting engine with performance analytics
    """
    
    def __init__(self, config: Optional[BacktestConfig] = None):
        self.config = config or BacktestConfig()
        self.results = {}
        
    def run_backtest(self,
                    df: pl.DataFrame,
                    strategy: Strategy,
                    verbose: bool = True) -> Dict[str, Any]:
        """
        Run backtest on MBP data with given strategy
        
        Args:
            df: MBP data with calculated features
            strategy: Strategy instance
            verbose: Print progress
            
        Returns:
            Dictionary with performance metrics
        """
        logger.info(f"Running backtest for {strategy.name}")
        
        # Generate signals
        df_signals = strategy.generate_signals(df)
        
        # Convert to pandas for vectorbt
        df_pd = df_signals.to_pandas()
        df_pd.set_index('timestamp', inplace=True)
        
        # Extract prices and signals
        prices = df_pd['mid_price'].values
        signals = df_pd['signal'].values
        
        # Run vectorized backtest
        portfolio = vbt.Portfolio.from_signals(
            prices,
            entries=signals == 1,
            exits=signals == -1,
            init_cash=self.config.initial_capital,
            fees=self.config.commission,
            slippage=self.config.slippage,
            freq='1min'  # Adjust based on your data frequency
        )
        
        # Calculate metrics
        metrics = {
            'strategy': strategy.name,
            'total_return': portfolio.total_return(),
            'annual_return': portfolio.annualized_return(),
            'sharpe_ratio': portfolio.sharpe_ratio(),
            'sortino_ratio': portfolio.sortino_ratio(),
            'calmar_ratio': portfolio.calmar_ratio(),
            'max_drawdown': portfolio.max_drawdown(),
            'win_rate': portfolio.win_rate(),
            'profit_factor': portfolio.profit_factor(),
            'expectancy': portfolio.expectancy(),
            'total_trades': portfolio.count(),
            'avg_win': portfolio.avg_winning_trade(),
            'avg_loss': portfolio.avg_losing_trade(),
            'best_trade': portfolio.best_trade(),
            'worst_trade': portfolio.worst_trade(),
            'recovery_factor': portfolio.recovery_factor(),
            'risk_return_ratio': portfolio.risk_return_ratio()
        }
        
        # Store detailed results
        self.results[strategy.name] = {
            'metrics': metrics,
            'portfolio': portfolio,
            'signals': df_signals,
            'equity_curve': portfolio.value()
        }
        
        if verbose:
            self._print_metrics(metrics)
            
        return metrics
    
    def _print_metrics(self, metrics: Dict[str, Any]):
        """Pretty print backtest metrics"""
        
        print("\n" + "="*60)
        print(f"Strategy: {metrics['strategy']}")
        print("="*60)
        
        print(f"\n📊 Returns:")
        print(f"  Total Return: {metrics['total_return']:.2%}")
        print(f"  Annual Return: {metrics['annual_return']:.2%}")
        
        print(f"\n📈 Risk Metrics:")
        print(f"  Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
        print(f"  Sortino Ratio: {metrics['sortino_ratio']:.2f}")
        print(f"  Calmar Ratio: {metrics['calmar_ratio']:.2f}")
        print(f"  Max Drawdown: {metrics['max_drawdown']:.2%}")
        
        print(f"\n🎯 Trade Statistics:")
        print(f"  Total Trades: {metrics['total_trades']}")
        print(f"  Win Rate: {metrics['win_rate']:.2%}")
        print(f"  Profit Factor: {metrics['profit_factor']:.2f}")
        print(f"  Expectancy: ${metrics['expectancy']:.2f}")
        
        print(f"\n💰 Trade Performance:")
        print(f"  Average Win: ${metrics['avg_win']:.2f}")
        print(f"  Average Loss: ${metrics['avg_loss']:.2f}")
        print(f"  Best Trade: ${metrics['best_trade']:.2f}")
        print(f"  Worst Trade: ${metrics['worst_trade']:.2f}")
        
        print("="*60 + "\n")
    
    def compare_strategies(self, 
                          df: pl.DataFrame,
                          strategies: List[Strategy]) -> pd.DataFrame:
        """
        Compare multiple strategies
        
        Args:
            df: MBP data
            strategies: List of strategy instances
            
        Returns:
            DataFrame with comparison metrics
        """
        logger.info(f"Comparing {len(strategies)} strategies")
        
        results = []
        for strategy in strategies:
            metrics = self.run_backtest(df, strategy, verbose=False)
            results.append(metrics)
        
        # Create comparison DataFrame
        comparison_df = pd.DataFrame(results)
        comparison_df = comparison_df.sort_values('sharpe_ratio', ascending=False)
        
        # Print comparison
        print("\n" + "="*80)
        print("STRATEGY COMPARISON")
        print("="*80)
        print(comparison_df.to_string())
        print("="*80 + "\n")
        
        return comparison_df
    
    def optimize_strategy(self,
                         df: pl.DataFrame,
                         strategy_class: type,
                         param_grid: Dict[str, List[Any]]) -> Dict[str, Any]:
        """
        Optimize strategy parameters using grid search
        
        Args:
            df: MBP data
            strategy_class: Strategy class to optimize
            param_grid: Parameter grid for optimization
            
        Returns:
            Best parameters and performance
        """
        logger.info("Starting strategy optimization")
        
        best_sharpe = -np.inf
        best_params = {}
        best_metrics = {}
        
        # Grid search
        from itertools import product
        
        param_names = list(param_grid.keys())
        param_values = list(param_grid.values())
        
        for params in product(*param_values):
            param_dict = dict(zip(param_names, params))
            
            # Create strategy with parameters
            strategy = strategy_class(**param_dict)
            
            # Run backtest
            metrics = self.run_backtest(df, strategy, verbose=False)
            
            # Check if better
            if metrics['sharpe_ratio'] > best_sharpe:
                best_sharpe = metrics['sharpe_ratio']
                best_params = param_dict
                best_metrics = metrics
                
                logger.info(f"New best Sharpe: {best_sharpe:.3f} with params: {best_params}")
        
        logger.success(f"Optimization complete. Best Sharpe: {best_sharpe:.3f}")
        
        return {
            'best_params': best_params,
            'best_metrics': best_metrics
        }
    
    def export_results(self, output_dir: str = "./results"):
        """Export backtest results to files"""
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        for strategy_name, results in self.results.items():
            # Save metrics
            metrics_path = output_path / f"{strategy_name}_metrics.json"
            with open(metrics_path, 'w') as f:
                json.dump(results['metrics'], f, indent=2, default=str)
            
            # Save signals
            signals_path = output_path / f"{strategy_name}_signals.parquet"
            results['signals'].write_parquet(signals_path)
            
            # Save equity curve
            equity_path = output_path / f"{strategy_name}_equity.csv"
            pd.DataFrame(results['equity_curve']).to_csv(equity_path)
            
        logger.success(f"Results exported to {output_path}")


# Example usage
def run_example_backtest():
    """Example of running a backtest"""
    
    # Load your MBP data
    from mbp_processor import process_mbp_file
    
    # Process data (replace with your actual file)
    # df = process_mbp_file("data/your_mbp_data.parquet")
    
    # Initialize strategies
    strategies = [
        BookPressureStrategy(imbalance_threshold=0.7),
        SpreadMeanReversion(entry_zscore=2.0),
    ]
    
    # Run backtests
    engine = BacktestEngine()
    
    # Compare strategies
    # comparison = engine.compare_strategies(df, strategies)
    
    # Optimize a strategy
    # param_grid = {
    #     'imbalance_threshold': [0.5, 0.6, 0.7, 0.8],
    #     'lookback_period': [50, 100, 200]
    # }
    # best = engine.optimize_strategy(df, BookPressureStrategy, param_grid)
    
    logger.info("Backtest engine ready to use!")
    

if __name__ == "__main__":
    run_example_backtest()
