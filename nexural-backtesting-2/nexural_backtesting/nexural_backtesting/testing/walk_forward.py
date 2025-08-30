"""
Walk-forward analysis implementation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class WalkForwardAnalyzer:
    """
    Walk-forward optimization and analysis
    """
    
    def __init__(self):
        """Initialize walk-forward analyzer"""
        self.results = []
        self.parameter_stability = {}
        
    def run_analysis(self, engine, strategy, data: pd.DataFrame,
                     window_months: int = 12, step_months: int = 3) -> Dict:
        """
        Run walk-forward analysis
        
        Args:
            engine: Backtest engine instance
            strategy: Strategy to test
            data: Complete dataset
            window_months: In-sample window size
            step_months: Step size for rolling window
            
        Returns:
            Dictionary with walk-forward results
        """
        logger.info(f"Starting walk-forward analysis (window={window_months}m, step={step_months}m)")
        
        results = {
            'windows': [],
            'in_sample_performance': [],
            'out_sample_performance': [],
            'parameter_evolution': [],
            'stability_score': 0
        }
        
        # Calculate window sizes in days
        window_days = window_months * 21  # Approximate trading days
        step_days = step_months * 21
        
        # Roll through data
        start_idx = 0
        
        while start_idx + window_days + step_days <= len(data):
            # Define windows
            in_sample_start = start_idx
            in_sample_end = start_idx + window_days
            out_sample_start = in_sample_end
            out_sample_end = out_sample_start + step_days
            
            # Get data slices
            in_sample_data = data.iloc[in_sample_start:in_sample_end]
            out_sample_data = data.iloc[out_sample_start:out_sample_end]
            
            logger.info(f"  Window {len(results['windows']) + 1}: "
                       f"IS={in_sample_start}-{in_sample_end}, "
                       f"OOS={out_sample_start}-{out_sample_end}")
            
            # Optimize on in-sample
            best_params = self._optimize_parameters(
                engine, strategy, in_sample_data
            )
            
            # Test on out-of-sample
            strategy.update_parameters(best_params)
            oos_results = engine.run_backtest(strategy, out_sample_data)
            
            # Store results
            results['windows'].append({
                'in_sample_period': (in_sample_start, in_sample_end),
                'out_sample_period': (out_sample_start, out_sample_end)
            })
            
            results['out_sample_performance'].append(oos_results['metrics'])
            results['parameter_evolution'].append(best_params)
            
            # Move to next window
            start_idx += step_days
        
        # Calculate stability metrics
        results['stability_score'] = self._calculate_stability(results)
        
        logger.info(f"✅ Walk-forward complete. Stability score: {results['stability_score']:.2f}")
        
        return results
    
    def _optimize_parameters(self, engine, strategy, data: pd.DataFrame) -> Dict:
        """
        Optimize strategy parameters on given data
        
        Returns:
            Dictionary with optimal parameters
        """
        # Define parameter grid
        param_grid = strategy.get_parameter_grid()
        
        best_sharpe = -np.inf
        best_params = {}
        
        # Grid search (you could use more sophisticated optimization)
        for params in param_grid:
            strategy.update_parameters(params)
            results = engine.run_backtest(strategy, data)
            
            if results['metrics']['sharpe_ratio'] > best_sharpe:
                best_sharpe = results['metrics']['sharpe_ratio']
                best_params = params.copy()
        
        return best_params
    
    def _calculate_stability(self, results: Dict) -> float:
        """
        Calculate parameter stability score
        
        Returns:
            Stability score (0-100)
        """
        if len(results['parameter_evolution']) < 2:
            return 100.0
        
        # Check how much parameters change over time
        param_changes = []
        
        for i in range(1, len(results['parameter_evolution'])):
            prev_params = results['parameter_evolution'][i-1]
            curr_params = results['parameter_evolution'][i]
            
            # Calculate relative change for each parameter
            for key in prev_params:
                if key in curr_params:
                    if isinstance(prev_params[key], (int, float)):
                        rel_change = abs(curr_params[key] - prev_params[key]) / (abs(prev_params[key]) + 1e-10)
                        param_changes.append(rel_change)
        
        # Convert to stability score (lower change = higher stability)
        avg_change = np.mean(param_changes) if param_changes else 0
        stability = max(0, 100 * (1 - avg_change))
        
        return stability
    
    def get_robustness_metrics(self, results: Dict) -> Dict:
        """
        Calculate robustness metrics from walk-forward results
        
        Args:
            results: Walk-forward results
            
        Returns:
            Dictionary with robustness metrics
        """
        if not results['out_sample_performance']:
            return {}
        
        # Extract key metrics
        sharpes = [m['sharpe_ratio'] for m in results['out_sample_performance']]
        returns = [m['total_return'] for m in results['out_sample_performance']]
        drawdowns = [m['max_drawdown'] for m in results['out_sample_performance']]
        
        robustness = {
            'avg_sharpe': np.mean(sharpes),
            'sharpe_std': np.std(sharpes),
            'sharpe_min': np.min(sharpes),
            'sharpe_max': np.max(sharpes),
            
            'avg_return': np.mean(returns),
            'return_std': np.std(returns),
            
            'avg_drawdown': np.mean(drawdowns),
            'max_drawdown': np.max(drawdowns),
            
            'consistency_score': self._calculate_consistency(sharpes),
            'stability_score': results['stability_score']
        }
        
        return robustness
    
    def _calculate_consistency(self, sharpes: List[float]) -> float:
        """
        Calculate consistency score based on Sharpe ratio stability
        
        Args:
            sharpes: List of Sharpe ratios
            
        Returns:
            Consistency score (0-100)
        """
        if len(sharpes) < 2:
            return 100.0
        
        # Calculate coefficient of variation
        mean_sharpe = np.mean(sharpes)
        std_sharpe = np.std(sharpes)
        
        if mean_sharpe == 0:
            return 0.0
        
        cv = std_sharpe / abs(mean_sharpe)
        
        # Convert to consistency score (lower CV = higher consistency)
        consistency = max(0, 100 * (1 - cv))
        
        return consistency
    
    def plot_walk_forward_results(self, results: Dict) -> None:
        """
        Plot walk-forward analysis results
        
        Args:
            results: Walk-forward results
        """
        try:
            import matplotlib.pyplot as plt
            
            # Create subplots
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            
            # 1. Out-of-sample Sharpe ratios
            sharpes = [m['sharpe_ratio'] for m in results['out_sample_performance']]
            axes[0, 0].plot(sharpes, 'b-o')
            axes[0, 0].set_title('Out-of-Sample Sharpe Ratios')
            axes[0, 0].set_ylabel('Sharpe Ratio')
            axes[0, 0].grid(True)
            
            # 2. Parameter evolution
            if results['parameter_evolution']:
                param_names = list(results['parameter_evolution'][0].keys())
                for param in param_names[:3]:  # Show first 3 parameters
                    values = [p.get(param, 0) for p in results['parameter_evolution']]
                    axes[0, 1].plot(values, label=param)
                axes[0, 1].set_title('Parameter Evolution')
                axes[0, 1].legend()
                axes[0, 1].grid(True)
            
            # 3. Returns distribution
            returns = [m['total_return'] for m in results['out_sample_performance']]
            axes[1, 0].hist(returns, bins=10, alpha=0.7)
            axes[1, 0].set_title('Returns Distribution')
            axes[1, 0].set_xlabel('Total Return (%)')
            axes[1, 0].grid(True)
            
            # 4. Drawdowns
            drawdowns = [m['max_drawdown'] for m in results['out_sample_performance']]
            axes[1, 1].plot(drawdowns, 'r-o')
            axes[1, 1].set_title('Maximum Drawdowns')
            axes[1, 1].set_ylabel('Drawdown (%)')
            axes[1, 1].grid(True)
            
            plt.tight_layout()
            plt.show()
            
        except ImportError:
            logger.warning("Matplotlib not available for plotting")
    
    def generate_walk_forward_report(self, results: Dict, strategy_name: str) -> str:
        """
        Generate walk-forward analysis report
        
        Args:
            results: Walk-forward results
            strategy_name: Name of the strategy
            
        Returns:
            Report as string
        """
        robustness = self.get_robustness_metrics(results)
        
        report = f"""
        WALK-FORWARD ANALYSIS REPORT
        ============================
        
        Strategy: {strategy_name}
        Windows tested: {len(results['windows'])}
        
        ROBUSTNESS METRICS:
        - Average Sharpe: {robustness.get('avg_sharpe', 0):.2f}
        - Sharpe Std Dev: {robustness.get('sharpe_std', 0):.2f}
        - Consistency Score: {robustness.get('consistency_score', 0):.1f}/100
        - Stability Score: {robustness.get('stability_score', 0):.1f}/100
        
        PERFORMANCE SUMMARY:
        - Best Sharpe: {robustness.get('sharpe_max', 0):.2f}
        - Worst Sharpe: {robustness.get('sharpe_min', 0):.2f}
        - Average Return: {robustness.get('avg_return', 0):.1f}%
        - Average Drawdown: {robustness.get('avg_drawdown', 0):.1f}%
        
        RECOMMENDATION:
        """
        
        if robustness.get('consistency_score', 0) > 80 and robustness.get('stability_score', 0) > 80:
            report += "✅ Strategy appears robust and suitable for live trading"
        elif robustness.get('consistency_score', 0) > 60 and robustness.get('stability_score', 0) > 60:
            report += "⚠️ Strategy shows moderate robustness - consider further optimization"
        else:
            report += "❌ Strategy lacks robustness - not recommended for live trading"
        
        return report 