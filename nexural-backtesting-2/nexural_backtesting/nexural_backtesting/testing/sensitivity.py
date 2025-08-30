"""
Sensitivity analysis implementation
"""

import pandas as pd
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class SensitivityAnalyzer:
    """
    Parameter sensitivity analysis
    """
    
    def __init__(self):
        """Initialize sensitivity analyzer"""
        self.parameter_ranges = {}
        
    def analyze_parameters(self, engine, strategy, data: pd.DataFrame) -> Dict:
        """
        Analyze parameter sensitivity
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            
        Returns:
            Dictionary with sensitivity analysis results
        """
        logger.info("Running parameter sensitivity analysis...")
        
        # Get strategy parameters
        base_params = strategy.get_default_parameters()
        
        results = {
            'base_performance': None,
            'parameter_sensitivity': {},
            'optimal_ranges': {},
            'interaction_effects': {}
        }
        
        # Run baseline
        base_results = engine.run_backtest(strategy, data)
        results['base_performance'] = base_results['metrics']
        
        # Analyze each parameter
        for param_name, base_value in base_params.items():
            if isinstance(base_value, (int, float)):
                logger.info(f"  Analyzing {param_name}...")
                param_results = self._analyze_single_parameter(
                    engine, strategy, data, param_name, base_value
                )
                results['parameter_sensitivity'][param_name] = param_results
        
        # Find optimal ranges
        results['optimal_ranges'] = self._find_optimal_ranges(results)
        
        # Analyze interactions
        results['interaction_effects'] = self._analyze_interactions(
            engine, strategy, data, base_params
        )
        
        logger.info("✅ Sensitivity analysis complete")
        
        return results
    
    def _analyze_single_parameter(self, engine, strategy, data: pd.DataFrame, 
                                 param_name: str, base_value: float) -> Dict:
        """
        Analyze sensitivity of a single parameter
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            param_name: Parameter name
            base_value: Base parameter value
            
        Returns:
            Dictionary with parameter sensitivity results
        """
        # Define test values (50%, 75%, 100%, 125%, 150% of base value)
        test_values = [base_value * x for x in [0.5, 0.75, 1.0, 1.25, 1.5]]
        
        results = {
            'test_values': test_values,
            'sharpe_ratios': [],
            'total_returns': [],
            'max_drawdowns': [],
            'win_rates': []
        }
        
        for test_value in test_values:
            # Update parameter
            strategy.update_parameters({param_name: test_value})
            
            # Run backtest
            backtest_results = engine.run_backtest(strategy, data)
            metrics = backtest_results['metrics']
            
            # Store results
            results['sharpe_ratios'].append(metrics.get('sharpe_ratio', 0))
            results['total_returns'].append(metrics.get('total_return', 0))
            results['max_drawdowns'].append(metrics.get('max_drawdown', 0))
            results['win_rates'].append(metrics.get('win_rate', 0))
        
        # Calculate sensitivity metrics
        results['sensitivity_score'] = self._calculate_sensitivity_score(results)
        results['optimal_value'] = test_values[np.argmax(results['sharpe_ratios'])]
        
        return results
    
    def _calculate_sensitivity_score(self, results: Dict) -> float:
        """
        Calculate parameter sensitivity score
        
        Args:
            results: Parameter test results
            
        Returns:
            Sensitivity score (0-100)
        """
        sharpes = np.array(results['sharpe_ratios'])
        
        if len(sharpes) < 2:
            return 0
        
        # Calculate coefficient of variation
        mean_sharpe = np.mean(sharpes)
        std_sharpe = np.std(sharpes)
        
        if mean_sharpe == 0:
            return 100  # Very sensitive if mean is 0
        
        cv = std_sharpe / abs(mean_sharpe)
        
        # Convert to sensitivity score (higher CV = higher sensitivity)
        sensitivity = min(100, cv * 100)
        
        return sensitivity
    
    def _find_optimal_ranges(self, results: Dict) -> Dict:
        """
        Find optimal parameter ranges
        
        Args:
            results: Sensitivity analysis results
            
        Returns:
            Dictionary with optimal ranges
        """
        optimal_ranges = {}
        
        for param_name, param_results in results['parameter_sensitivity'].items():
            sharpes = param_results['sharpe_ratios']
            values = param_results['test_values']
            
            # Find values that give >90% of max Sharpe
            max_sharpe = max(sharpes)
            threshold = max_sharpe * 0.9
            
            optimal_indices = [i for i, sharpe in enumerate(sharpes) if sharpe >= threshold]
            
            if optimal_indices:
                min_optimal = values[min(optimal_indices)]
                max_optimal = values[max(optimal_indices)]
                
                optimal_ranges[param_name] = {
                    'min': min_optimal,
                    'max': max_optimal,
                    'optimal': param_results['optimal_value'],
                    'sensitivity': param_results['sensitivity_score']
                }
        
        return optimal_ranges
    
    def _analyze_interactions(self, engine, strategy, data: pd.DataFrame, 
                             base_params: Dict) -> Dict:
        """
        Analyze parameter interactions
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            base_params: Base parameters
            
        Returns:
            Dictionary with interaction effects
        """
        interactions = {}
        
        # Get numeric parameters
        numeric_params = {k: v for k, v in base_params.items() 
                         if isinstance(v, (int, float))}
        
        if len(numeric_params) < 2:
            return interactions
        
        # Test parameter pairs
        param_names = list(numeric_params.keys())
        
        for i in range(len(param_names)):
            for j in range(i + 1, len(param_names)):
                param1, param2 = param_names[i], param_names[j]
                
                logger.info(f"  Analyzing interaction: {param1} vs {param2}")
                
                interaction_result = self._test_parameter_interaction(
                    engine, strategy, data, param1, param2, 
                    numeric_params[param1], numeric_params[param2]
                )
                
                interactions[f"{param1}_vs_{param2}"] = interaction_result
        
        return interactions
    
    def _test_parameter_interaction(self, engine, strategy, data: pd.DataFrame,
                                   param1: str, param2: str, 
                                   base_val1: float, base_val2: float) -> Dict:
        """
        Test interaction between two parameters
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            param1: First parameter name
            param2: Second parameter name
            base_val1: Base value for first parameter
            base_val2: Base value for second parameter
            
        Returns:
            Dictionary with interaction results
        """
        # Test combinations
        test_values1 = [base_val1 * x for x in [0.8, 1.0, 1.2]]
        test_values2 = [base_val2 * x for x in [0.8, 1.0, 1.2]]
        
        results_matrix = []
        
        for val1 in test_values1:
            row = []
            for val2 in test_values2:
                # Update both parameters
                strategy.update_parameters({param1: val1, param2: val2})
                
                # Run backtest
                backtest_results = engine.run_backtest(strategy, data)
                sharpe = backtest_results['metrics'].get('sharpe_ratio', 0)
                
                row.append(sharpe)
            
            results_matrix.append(row)
        
        # Calculate interaction effect
        interaction_effect = self._calculate_interaction_effect(results_matrix)
        
        return {
            'results_matrix': results_matrix,
            'test_values1': test_values1,
            'test_values2': test_values2,
            'interaction_effect': interaction_effect
        }
    
    def _calculate_interaction_effect(self, results_matrix: List[List[float]]) -> float:
        """
        Calculate interaction effect between parameters
        
        Args:
            results_matrix: Matrix of results for different parameter combinations
            
        Returns:
            Interaction effect score
        """
        if not results_matrix or not results_matrix[0]:
            return 0
        
        # Convert to numpy array
        matrix = np.array(results_matrix)
        
        # Calculate main effects
        row_means = np.mean(matrix, axis=1)
        col_means = np.mean(matrix, axis=0)
        grand_mean = np.mean(matrix)
        
        # Calculate interaction effect
        interaction_ss = 0
        for i in range(len(row_means)):
            for j in range(len(col_means)):
                expected = grand_mean + (row_means[i] - grand_mean) + (col_means[j] - grand_mean)
                actual = matrix[i, j]
                interaction_ss += (actual - expected) ** 2
        
        # Normalize by total variance
        total_ss = np.sum((matrix - grand_mean) ** 2)
        
        if total_ss == 0:
            return 0
        
        interaction_effect = interaction_ss / total_ss
        
        return interaction_effect
    
    def generate_sensitivity_report(self, results: Dict, strategy_name: str) -> str:
        """
        Generate sensitivity analysis report
        
        Args:
            results: Sensitivity analysis results
            strategy_name: Name of the strategy
            
        Returns:
            Report as string
        """
        report = f"""
        PARAMETER SENSITIVITY REPORT
        ============================
        
        Strategy: {strategy_name}
        
        BASE PERFORMANCE:
        - Sharpe Ratio: {results['base_performance'].get('sharpe_ratio', 0):.2f}
        - Total Return: {results['base_performance'].get('total_return', 0):.1f}%
        - Max Drawdown: {results['base_performance'].get('max_drawdown', 0):.1f}%
        
        PARAMETER SENSITIVITY:
        """
        
        for param_name, param_results in results['parameter_sensitivity'].items():
            sensitivity = param_results['sensitivity_score']
            optimal = param_results['optimal_value']
            
            report += f"""
        {param_name}:
        - Sensitivity Score: {sensitivity:.1f}/100
        - Optimal Value: {optimal:.3f}
        - Current Value: {optimal:.3f}  # Assuming current = optimal for now
        """
        
        report += f"""
        
        OPTIMAL PARAMETER RANGES:
        """
        
        for param_name, range_info in results['optimal_ranges'].items():
            report += f"""
        {param_name}:
        - Optimal Range: [{range_info['min']:.3f}, {range_info['max']:.3f}]
        - Optimal Value: {range_info['optimal']:.3f}
        - Sensitivity: {range_info['sensitivity']:.1f}/100
        """
        
        report += f"""
        
        INTERACTION EFFECTS:
        """
        
        for interaction_name, interaction_result in results['interaction_effects'].items():
            effect = interaction_result['interaction_effect']
            report += f"""
        {interaction_name}: {effect:.3f}
        """
        
        report += f"""
        
        RECOMMENDATIONS:
        """
        
        # Generate recommendations based on sensitivity
        high_sensitivity_params = []
        for param_name, param_results in results['parameter_sensitivity'].items():
            if param_results['sensitivity_score'] > 50:
                high_sensitivity_params.append(param_name)
        
        if high_sensitivity_params:
            report += f"- High sensitivity parameters: {', '.join(high_sensitivity_params)}\n"
            report += "- Consider more frequent re-optimization of these parameters\n"
        
        report += "- Use optimal parameter ranges for robust performance\n"
        report += "- Monitor parameter interactions for better optimization\n"
        
        return report 