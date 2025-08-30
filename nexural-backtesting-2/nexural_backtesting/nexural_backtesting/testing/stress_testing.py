"""
Stress testing implementation
"""

import pandas as pd
import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class StressTester:
    """
    Stress testing for strategy robustness
    """
    
    def __init__(self):
        """Initialize stress tester"""
        self.scenarios = {
            'flash_crash': self._flash_crash_scenario,
            'volatility_spike': self._volatility_spike_scenario,
            'liquidity_crisis': self._liquidity_crisis_scenario,
            'correlation_breakdown': self._correlation_breakdown_scenario
        }
    
    def run_all_scenarios(self, engine, strategy, data: pd.DataFrame) -> Dict:
        """
        Run all stress test scenarios
        
        Args:
            engine: Backtest engine
            strategy: Strategy to test
            data: Historical data
            
        Returns:
            Dictionary with stress test results
        """
        logger.info("Running stress test scenarios...")
        
        results = {}
        
        for scenario_name, scenario_func in self.scenarios.items():
            logger.info(f"  Running {scenario_name} scenario...")
            
            # Create stressed data
            stressed_data = scenario_func(data.copy())
            
            # Run backtest on stressed data
            scenario_results = engine.run_backtest(strategy, stressed_data)
            
            results[scenario_name] = {
                'metrics': scenario_results['metrics'],
                'data_modifications': self._get_modification_summary(data, stressed_data)
            }
        
        # Calculate overall stress score
        results['stress_score'] = self._calculate_stress_score(results)
        
        logger.info(f"✅ Stress testing complete. Score: {results['stress_score']:.1f}/100")
        
        return results
    
    def _flash_crash_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Simulate flash crash scenario"""
        stressed = data.copy()
        
        # Find a random point to start the crash
        crash_start = np.random.randint(len(data) // 4, len(data) // 2)
        crash_duration = 30  # 30 minutes
        
        # Create sharp price decline
        for i in range(crash_duration):
            if crash_start + i < len(stressed):
                # 5% decline over 30 minutes
                decline_factor = 1 - (0.05 * (i + 1) / crash_duration)
                stressed.iloc[crash_start + i, stressed.columns.get_loc('mid_price')] *= decline_factor
                
                # Widen spreads dramatically
                stressed.iloc[crash_start + i, stressed.columns.get_loc('spread_bps')] *= 5
                
                # Reduce liquidity
                for j in range(10):
                    if f'bid_size_{j}' in stressed.columns:
                        stressed.iloc[crash_start + i, stressed.columns.get_loc(f'bid_size_{j}')] *= 0.1
                    if f'ask_size_{j}' in stressed.columns:
                        stressed.iloc[crash_start + i, stressed.columns.get_loc(f'ask_size_{j}')] *= 0.1
        
        return stressed
    
    def _volatility_spike_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Simulate volatility spike scenario"""
        stressed = data.copy()
        
        # Increase volatility by 3x
        returns = stressed['mid_price'].pct_change()
        stressed['mid_price'] = stressed['mid_price'].iloc[0] * (1 + returns * 3).cumprod()
        
        # Widen spreads
        stressed['spread_bps'] *= 2
        
        return stressed
    
    def _liquidity_crisis_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Simulate liquidity crisis scenario"""
        stressed = data.copy()
        
        # Reduce order book depth by 90%
        for i in range(10):
            if f'bid_size_{i}' in stressed.columns:
                stressed[f'bid_size_{i}'] *= 0.1
            if f'ask_size_{i}' in stressed.columns:
                stressed[f'ask_size_{i}'] *= 0.1
        
        # Widen spreads significantly
        stressed['spread_bps'] *= 10
        
        return stressed
    
    def _correlation_breakdown_scenario(self, data: pd.DataFrame) -> pd.DataFrame:
        """Simulate correlation breakdown scenario"""
        stressed = data.copy()
        
        # Add random noise to break correlations
        noise = np.random.normal(0, 0.01, len(stressed))
        stressed['mid_price'] *= (1 + noise)
        
        # Randomize order book imbalances
        if 'book_imbalance' in stressed.columns:
            stressed['book_imbalance'] = np.random.uniform(-1, 1, len(stressed))
        
        return stressed
    
    def _get_modification_summary(self, original: pd.DataFrame, modified: pd.DataFrame) -> Dict:
        """Get summary of data modifications"""
        summary = {}
        
        # Price changes
        if 'mid_price' in original.columns and 'mid_price' in modified.columns:
            price_change = (modified['mid_price'].mean() - original['mid_price'].mean()) / original['mid_price'].mean()
            summary['price_change_pct'] = price_change * 100
        
        # Spread changes
        if 'spread_bps' in original.columns and 'spread_bps' in modified.columns:
            spread_change = (modified['spread_bps'].mean() - original['spread_bps'].mean()) / original['spread_bps'].mean()
            summary['spread_change_pct'] = spread_change * 100
        
        return summary
    
    def _calculate_stress_score(self, results: Dict) -> float:
        """
        Calculate overall stress test score
        
        Args:
            results: Stress test results
            
        Returns:
            Stress score (0-100)
        """
        scores = []
        
        for scenario_name, scenario_results in results.items():
            if scenario_name == 'stress_score':
                continue
            
            metrics = scenario_results['metrics']
            
            # Calculate scenario score based on performance degradation
            baseline_sharpe = 1.0  # Assume baseline Sharpe of 1.0
            scenario_sharpe = metrics.get('sharpe_ratio', 0)
            
            # Score based on Sharpe ratio preservation
            sharpe_preservation = max(0, scenario_sharpe / baseline_sharpe)
            
            # Score based on drawdown control
            max_drawdown = metrics.get('max_drawdown', 0)
            drawdown_score = max(0, 1 - max_drawdown / 50)  # Cap at 50%
            
            # Combined score
            scenario_score = (sharpe_preservation + drawdown_score) / 2 * 100
            scores.append(scenario_score)
        
        return np.mean(scores) if scores else 0
    
    def generate_stress_report(self, results: Dict, strategy_name: str) -> str:
        """
        Generate stress test report
        
        Args:
            results: Stress test results
            strategy_name: Name of the strategy
            
        Returns:
            Report as string
        """
        report = f"""
        STRESS TEST REPORT
        ==================
        
        Strategy: {strategy_name}
        Overall Stress Score: {results['stress_score']:.1f}/100
        
        SCENARIO RESULTS:
        """
        
        for scenario_name, scenario_results in results.items():
            if scenario_name == 'stress_score':
                continue
            
            metrics = scenario_results['metrics']
            modifications = scenario_results['data_modifications']
            
            report += f"""
        {scenario_name.upper().replace('_', ' ')}:
        - Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.2f}
        - Max Drawdown: {metrics.get('max_drawdown', 0):.1f}%
        - Total Return: {metrics.get('total_return', 0):.1f}%
        - Data Modifications: {modifications}
        """
        
        report += f"""
        
        STRESS TEST ASSESSMENT:
        """
        
        if results['stress_score'] > 80:
            report += "✅ Strategy shows excellent stress resistance"
        elif results['stress_score'] > 60:
            report += "⚠️ Strategy shows moderate stress resistance"
        else:
            report += "❌ Strategy shows poor stress resistance"
        
        return report 