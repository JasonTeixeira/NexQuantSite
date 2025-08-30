"""
Monte Carlo simulation implementation
"""

import pandas as pd
import numpy as np
from typing import Dict, List
import logging
from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp

logger = logging.getLogger(__name__)

class MonteCarloSimulator:
    """
    Monte Carlo simulation for strategy robustness testing
    """
    
    def __init__(self):
        """Initialize Monte Carlo simulator"""
        self.simulation_results = []
        
    def run_simulation(self, engine, strategy, data: pd.DataFrame,
                      n_simulations: int = 1000,
                      confidence_level: float = 0.95) -> Dict:
        """
        Run Monte Carlo simulation
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            n_simulations: Number of simulations
            confidence_level: Confidence level for intervals
            
        Returns:
            Dictionary with simulation results
        """
        logger.info(f"Starting Monte Carlo simulation with {n_simulations} paths")
        
        results = {
            'simulations': [],
            'returns': [],
            'sharpe_ratios': [],
            'max_drawdowns': [],
            'final_equity': [],
            'statistics': {}
        }
        
        # Run simulations
        for sim in range(n_simulations):
            if sim % 100 == 0:
                logger.info(f"  Simulation {sim}/{n_simulations}")
            
            # Create random path
            simulated_data = self._create_simulated_path(data)
            
            # Run backtest
            sim_results = engine.run_backtest(strategy, simulated_data)
            
            # Store results
            results['simulations'].append(sim_results)
            results['returns'].append(sim_results['metrics']['total_return'])
            results['sharpe_ratios'].append(sim_results['metrics']['sharpe_ratio'])
            results['max_drawdowns'].append(sim_results['metrics']['max_drawdown'])
            results['final_equity'].append(sim_results['metrics']['final_capital'])
        
        # Calculate statistics
        results['statistics'] = self._calculate_statistics(
            results, confidence_level
        )
        
        logger.info(f"✅ Monte Carlo complete. Mean Sharpe: {results['statistics']['mean_sharpe']:.2f}")
        
        return results
    
    def _create_simulated_path(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Create simulated price path using various methods
        """
        method = np.random.choice(['bootstrap', 'block_bootstrap', 'synthetic'])
        
        if method == 'bootstrap':
            # Random sampling with replacement
            indices = np.random.choice(len(data), size=len(data), replace=True)
            simulated = data.iloc[indices].reset_index(drop=True)
            
        elif method == 'block_bootstrap':
            # Block bootstrap to preserve serial correlation
            block_size = 100
            n_blocks = len(data) // block_size
            
            blocks = []
            for _ in range(n_blocks):
                start_idx = np.random.randint(0, len(data) - block_size)
                blocks.append(data.iloc[start_idx:start_idx + block_size])
            
            simulated = pd.concat(blocks, ignore_index=True)
            
        else:  # synthetic
            # Generate synthetic data based on statistical properties
            simulated = self._generate_synthetic_data(data)
        
        return simulated
    
    def _generate_synthetic_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Generate synthetic data preserving statistical properties
        """
        synthetic = data.copy()
        
        # Calculate returns
        returns = data['mid_price'].pct_change().dropna()
        
        # Fit distribution (simplified - could use more sophisticated methods)
        mean_return = returns.mean()
        std_return = returns.std()
        
        # Generate synthetic returns
        synthetic_returns = np.random.normal(mean_return, std_return, len(data))
        
        # Apply to price series
        synthetic_prices = [data['mid_price'].iloc[0]]
        for ret in synthetic_returns[1:]:
            synthetic_prices.append(synthetic_prices[-1] * (1 + ret))
        
        synthetic['mid_price'] = synthetic_prices
        
        # Adjust bid/ask accordingly
        spread = data['spread'].mean()
        synthetic['bid_price_0'] = synthetic['mid_price'] - spread/2
        synthetic['ask_price_0'] = synthetic['mid_price'] + spread/2
        
        return synthetic
    
    def _calculate_statistics(self, results: Dict, confidence_level: float) -> Dict:
        """
        Calculate Monte Carlo statistics
        """
        returns = np.array(results['returns'])
        sharpes = np.array(results['sharpe_ratios'])
        drawdowns = np.array(results['max_drawdowns'])
        
        # Calculate percentiles
        lower_percentile = (1 - confidence_level) / 2 * 100
        upper_percentile = (1 + confidence_level) / 2 * 100
        
        statistics = {
            # Returns
            'mean_return': np.mean(returns),
            'std_return': np.std(returns),
            'return_ci_lower': np.percentile(returns, lower_percentile),
            'return_ci_upper': np.percentile(returns, upper_percentile),
            
            # Sharpe
            'mean_sharpe': np.mean(sharpes),
            'std_sharpe': np.std(sharpes),
            'sharpe_ci_lower': np.percentile(sharpes, lower_percentile),
            'sharpe_ci_upper': np.percentile(sharpes, upper_percentile),
            
            # Drawdown
            'mean_drawdown': np.mean(drawdowns),
            'worst_drawdown': np.max(drawdowns),
            'drawdown_95_percentile': np.percentile(drawdowns, 95),
            
            # Risk metrics
            'probability_of_loss': np.mean(returns < 0),
            'probability_of_large_drawdown': np.mean(drawdowns > 20),
            
            # Value at Risk
            'var_95': np.percentile(returns, 5),
            'cvar_95': np.mean(returns[returns <= np.percentile(returns, 5)])
        }
        
        return statistics
    
    def run_parallel_simulation(self, engine, strategy, data: pd.DataFrame,
                               n_simulations: int = 1000,
                               n_processes: int = None) -> Dict:
        """
        Run Monte Carlo simulation in parallel
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            n_simulations: Number of simulations
            n_processes: Number of processes to use
            
        Returns:
            Dictionary with simulation results
        """
        if n_processes is None:
            n_processes = min(mp.cpu_count(), 8)
        
        logger.info(f"Running parallel Monte Carlo with {n_processes} processes")
        
        # Split simulations across processes
        sims_per_process = n_simulations // n_processes
        
        with ProcessPoolExecutor(max_workers=n_processes) as executor:
            futures = []
            
            for i in range(n_processes):
                start_sim = i * sims_per_process
                end_sim = start_sim + sims_per_process if i < n_processes - 1 else n_simulations
                
                future = executor.submit(
                    self._run_simulation_batch,
                    engine, strategy, data, end_sim - start_sim
                )
                futures.append(future)
            
            # Collect results
            all_results = []
            for future in futures:
                all_results.extend(future.result())
        
        # Combine results
        results = {
            'simulations': all_results,
            'returns': [r['metrics']['total_return'] for r in all_results],
            'sharpe_ratios': [r['metrics']['sharpe_ratio'] for r in all_results],
            'max_drawdowns': [r['metrics']['max_drawdown'] for r in all_results],
            'final_equity': [r['metrics']['final_capital'] for r in all_results]
        }
        
        # Calculate statistics
        results['statistics'] = self._calculate_statistics(results, 0.95)
        
        return results
    
    def _run_simulation_batch(self, engine, strategy, data: pd.DataFrame, n_sims: int) -> List[Dict]:
        """Run a batch of simulations"""
        batch_results = []
        
        for sim in range(n_sims):
            simulated_data = self._create_simulated_path(data)
            sim_results = engine.run_backtest(strategy, simulated_data)
            batch_results.append(sim_results)
        
        return batch_results
    
    def plot_monte_carlo_results(self, results: Dict) -> None:
        """
        Plot Monte Carlo simulation results
        
        Args:
            results: Monte Carlo results
        """
        try:
            import matplotlib.pyplot as plt
            
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            
            # 1. Sharpe ratio distribution
            sharpes = results['sharpe_ratios']
            axes[0, 0].hist(sharpes, bins=30, alpha=0.7, edgecolor='black')
            axes[0, 0].axvline(np.mean(sharpes), color='red', linestyle='--', label='Mean')
            axes[0, 0].set_title('Sharpe Ratio Distribution')
            axes[0, 0].set_xlabel('Sharpe Ratio')
            axes[0, 0].legend()
            axes[0, 0].grid(True)
            
            # 2. Returns distribution
            returns = results['returns']
            axes[0, 1].hist(returns, bins=30, alpha=0.7, edgecolor='black')
            axes[0, 1].axvline(np.mean(returns), color='red', linestyle='--', label='Mean')
            axes[0, 1].set_title('Returns Distribution')
            axes[0, 1].set_xlabel('Total Return (%)')
            axes[0, 1].legend()
            axes[0, 1].grid(True)
            
            # 3. Drawdown distribution
            drawdowns = results['max_drawdowns']
            axes[1, 0].hist(drawdowns, bins=30, alpha=0.7, edgecolor='black')
            axes[1, 0].axvline(np.mean(drawdowns), color='red', linestyle='--', label='Mean')
            axes[1, 0].set_title('Maximum Drawdown Distribution')
            axes[1, 0].set_xlabel('Drawdown (%)')
            axes[1, 0].legend()
            axes[1, 0].grid(True)
            
            # 4. Risk-return scatter
            axes[1, 1].scatter(drawdowns, returns, alpha=0.6)
            axes[1, 1].set_xlabel('Maximum Drawdown (%)')
            axes[1, 1].set_ylabel('Total Return (%)')
            axes[1, 1].set_title('Risk-Return Scatter')
            axes[1, 1].grid(True)
            
            plt.tight_layout()
            plt.show()
            
        except ImportError:
            logger.warning("Matplotlib not available for plotting")
    
    def generate_monte_carlo_report(self, results: Dict, strategy_name: str) -> str:
        """
        Generate Monte Carlo simulation report
        
        Args:
            results: Monte Carlo results
            strategy_name: Name of the strategy
            
        Returns:
            Report as string
        """
        stats = results['statistics']
        
        report = f"""
        MONTE CARLO SIMULATION REPORT
        =============================
        
        Strategy: {strategy_name}
        Simulations: {len(results['returns'])}
        
        PERFORMANCE STATISTICS:
        - Mean Sharpe: {stats['mean_sharpe']:.2f} (±{stats['std_sharpe']:.2f})
        - 95% CI Sharpe: [{stats['sharpe_ci_lower']:.2f}, {stats['sharpe_ci_upper']:.2f}]
        - Mean Return: {stats['mean_return']:.1f}% (±{stats['std_return']:.1f}%)
        
        RISK METRICS:
        - Mean Drawdown: {stats['mean_drawdown']:.1f}%
        - Worst Drawdown: {stats['worst_drawdown']:.1f}%
        - 95th Percentile Drawdown: {stats['drawdown_95_percentile']:.1f}%
        - Probability of Loss: {stats['probability_of_loss']:.1%}
        - Probability of Large Drawdown (>20%): {stats['probability_of_large_drawdown']:.1%}
        
        VALUE AT RISK:
        - 95% VaR: {stats['var_95']:.1f}%
        - 95% CVaR: {stats['cvar_95']:.1f}%
        
        ROBUSTNESS ASSESSMENT:
        """
        
        # Assess robustness
        if stats['probability_of_loss'] < 0.3 and stats['mean_sharpe'] > 1.0:
            report += "✅ Strategy shows good robustness with low loss probability"
        elif stats['probability_of_loss'] < 0.5 and stats['mean_sharpe'] > 0.5:
            report += "⚠️ Strategy shows moderate robustness"
        else:
            report += "❌ Strategy shows poor robustness with high loss probability"
        
        return report 