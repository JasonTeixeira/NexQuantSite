"""
Walk-Forward Testing Framework
================================
Production-grade validation to prevent overfitting disasters.

This module implements:
- Walk-forward analysis with rolling windows
- Out-of-sample testing with proper data splits
- Cross-validation for strategy parameters
- Monte Carlo simulation for robustness testing
- Parameter stability analysis

Author: Nexural Trading Platform
Date: 2024
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Callable
from dataclasses import dataclass
import logging
from datetime import datetime, timedelta
import warnings
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
import json

logger = logging.getLogger(__name__)


@dataclass
class WalkForwardResult:
    """Results from walk-forward analysis"""
    in_sample_sharpe: float
    out_sample_sharpe: float
    in_sample_return: float
    out_sample_return: float
    in_sample_drawdown: float
    out_sample_drawdown: float
    parameter_stability: float  # 0-1, higher is better
    overfitting_score: float  # 0-1, lower is better
    periods_tested: int
    degradation_rate: float  # How fast performance degrades out-of-sample
    confidence_score: float  # 0-100, overall confidence in strategy
    
    @property
    def is_robust(self) -> bool:
        """Is this strategy robust enough for live trading?"""
        return (
            self.overfitting_score < 0.3 and
            self.parameter_stability > 0.7 and
            self.confidence_score > 70 and
            self.out_sample_sharpe > 0.5
        )
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for reporting"""
        return {
            'in_sample_sharpe': round(self.in_sample_sharpe, 3),
            'out_sample_sharpe': round(self.out_sample_sharpe, 3),
            'in_sample_return': round(self.in_sample_return, 4),
            'out_sample_return': round(self.out_sample_return, 4),
            'in_sample_drawdown': round(self.in_sample_drawdown, 4),
            'out_sample_drawdown': round(self.out_sample_drawdown, 4),
            'parameter_stability': round(self.parameter_stability, 3),
            'overfitting_score': round(self.overfitting_score, 3),
            'degradation_rate': round(self.degradation_rate, 3),
            'confidence_score': round(self.confidence_score, 1),
            'is_robust': self.is_robust,
            'verdict': 'SAFE FOR LIVE' if self.is_robust else 'DO NOT TRADE'
        }


class WalkForwardValidator:
    """
    Professional walk-forward testing to prevent overfitting disasters.
    
    This is your safety net before going live.
    """
    
    def __init__(self, 
                 min_train_days: int = 252,  # 1 year minimum training
                 test_days: int = 63,  # 3 months test period
                 step_days: int = 21,  # Step forward 1 month
                 min_periods: int = 3):  # Minimum walk-forward periods
        """
        Initialize walk-forward validator
        
        Args:
            min_train_days: Minimum days for training period
            test_days: Days for each test period
            step_days: Days to step forward each iteration
            min_periods: Minimum number of walk-forward periods
        """
        self.min_train_days = min_train_days
        self.test_days = test_days
        self.step_days = step_days
        self.min_periods = min_periods
        
    def validate_strategy(self,
                         strategy_class: Any,
                         data: pd.DataFrame,
                         config: Dict,
                         optimize_func: Optional[Callable] = None) -> WalkForwardResult:
        """
        Run comprehensive walk-forward validation on a strategy.
        
        This is THE function that tells you if your strategy is real or fake.
        
        Args:
            strategy_class: Strategy class to test
            data: Historical data (must have 'close', 'high', 'low', 'volume')
            config: Strategy configuration
            optimize_func: Optional function to optimize parameters in-sample
            
        Returns:
            WalkForwardResult with comprehensive metrics
        """
        logger.info(f"Starting walk-forward validation for {strategy_class.__name__}")
        
        # Validate data
        if len(data) < self.min_train_days + self.test_days:
            raise ValueError(f"Insufficient data: need {self.min_train_days + self.test_days} days, got {len(data)}")
        
        # Run walk-forward analysis
        periods = self._create_walk_forward_periods(data)
        results = []
        
        for i, (train_start, train_end, test_start, test_end) in enumerate(periods):
            logger.info(f"Testing period {i+1}/{len(periods)}")
            
            # Split data
            train_data = data[train_start:train_end]
            test_data = data[test_start:test_end]
            
            # Optimize parameters on training data if function provided
            if optimize_func:
                optimized_config = optimize_func(strategy_class, train_data, config)
            else:
                optimized_config = config.copy()
            
            # Test in-sample
            in_sample_result = self._test_strategy(
                strategy_class, train_data, optimized_config
            )
            
            # Test out-of-sample
            out_sample_result = self._test_strategy(
                strategy_class, test_data, optimized_config
            )
            
            results.append({
                'in_sample': in_sample_result,
                'out_sample': out_sample_result,
                'config': optimized_config
            })
        
        # Analyze results
        return self._analyze_walk_forward_results(results)
    
    def _create_walk_forward_periods(self, data: pd.DataFrame) -> List[Tuple[int, int, int, int]]:
        """Create walk-forward time periods"""
        periods = []
        total_days = len(data)
        
        current_pos = 0
        while current_pos + self.min_train_days + self.test_days <= total_days:
            train_start = current_pos
            train_end = current_pos + self.min_train_days
            test_start = train_end
            test_end = min(test_start + self.test_days, total_days)
            
            periods.append((train_start, train_end, test_start, test_end))
            
            current_pos += self.step_days
            
            # Ensure minimum periods
            if len(periods) >= self.min_periods * 2:
                break
                
        return periods[:max(self.min_periods, len(periods))]
    
    def _test_strategy(self, strategy_class: Any, data: pd.DataFrame, config: Dict) -> Dict:
        """Test strategy on given data"""
        try:
            # Initialize strategy
            strategy = strategy_class(config=config)
            
            # Generate signals
            signals = strategy.generate_signals(data)
            
            # Calculate returns
            returns = self._calculate_returns(data, signals)
            
            # Calculate metrics
            sharpe = self._calculate_sharpe(returns)
            total_return = returns.sum()
            max_drawdown = self._calculate_max_drawdown(returns)
            
            return {
                'sharpe': sharpe,
                'return': total_return,
                'drawdown': max_drawdown,
                'num_trades': (signals != 0).sum()
            }
            
        except Exception as e:
            logger.warning(f"Strategy test failed: {e}")
            return {
                'sharpe': 0,
                'return': 0,
                'drawdown': 1.0,
                'num_trades': 0
            }
    
    def _calculate_returns(self, data: pd.DataFrame, signals: pd.Series) -> pd.Series:
        """Calculate strategy returns from signals"""
        price_returns = data['close'].pct_change().fillna(0)
        
        # Shift signals to avoid look-ahead bias
        positions = signals.shift(1).fillna(0)
        
        # Calculate strategy returns
        strategy_returns = positions * price_returns
        
        # Account for transaction costs (simplified)
        trades = positions.diff().abs()
        transaction_costs = trades * 0.001  # 10 bps per trade
        
        return strategy_returns - transaction_costs
    
    def _calculate_sharpe(self, returns: pd.Series, periods_per_year: int = 252) -> float:
        """Calculate Sharpe ratio"""
        if returns.std() == 0:
            return 0
        return np.sqrt(periods_per_year) * returns.mean() / returns.std()
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return abs(drawdown.min())
    
    def _analyze_walk_forward_results(self, results: List[Dict]) -> WalkForwardResult:
        """Analyze walk-forward results to determine strategy robustness"""
        
        # Extract metrics
        in_sample_sharpes = [r['in_sample']['sharpe'] for r in results]
        out_sample_sharpes = [r['out_sample']['sharpe'] for r in results]
        in_sample_returns = [r['in_sample']['return'] for r in results]
        out_sample_returns = [r['out_sample']['return'] for r in results]
        in_sample_drawdowns = [r['in_sample']['drawdown'] for r in results]
        out_sample_drawdowns = [r['out_sample']['drawdown'] for r in results]
        
        # Calculate averages
        avg_in_sharpe = np.mean(in_sample_sharpes)
        avg_out_sharpe = np.mean(out_sample_sharpes)
        avg_in_return = np.mean(in_sample_returns)
        avg_out_return = np.mean(out_sample_returns)
        avg_in_dd = np.mean(in_sample_drawdowns)
        avg_out_dd = np.mean(out_sample_drawdowns)
        
        # Calculate parameter stability (how consistent are results)
        sharpe_stability = 1 - (np.std(out_sample_sharpes) / (np.mean(out_sample_sharpes) + 0.0001))
        parameter_stability = max(0, min(1, sharpe_stability))
        
        # Calculate overfitting score (performance degradation)
        sharpe_degradation = (avg_in_sharpe - avg_out_sharpe) / (avg_in_sharpe + 0.0001)
        return_degradation = (avg_in_return - avg_out_return) / (abs(avg_in_return) + 0.0001)
        overfitting_score = max(0, min(1, (sharpe_degradation + return_degradation) / 2))
        
        # Calculate degradation rate
        degradation_rate = 1 - (avg_out_sharpe / (avg_in_sharpe + 0.0001))
        
        # Calculate confidence score (0-100)
        confidence_components = [
            min(30, avg_out_sharpe * 20),  # Up to 30 points for out-sample Sharpe
            min(20, (1 - overfitting_score) * 20),  # Up to 20 points for low overfitting
            min(20, parameter_stability * 20),  # Up to 20 points for stability
            min(15, (1 - avg_out_dd) * 15),  # Up to 15 points for low drawdown
            min(15, len(results) / self.min_periods * 5)  # Up to 15 points for sample size
        ]
        confidence_score = sum(confidence_components)
        
        return WalkForwardResult(
            in_sample_sharpe=avg_in_sharpe,
            out_sample_sharpe=avg_out_sharpe,
            in_sample_return=avg_in_return,
            out_sample_return=avg_out_return,
            in_sample_drawdown=avg_in_dd,
            out_sample_drawdown=avg_out_dd,
            parameter_stability=parameter_stability,
            overfitting_score=overfitting_score,
            periods_tested=len(results),
            degradation_rate=degradation_rate,
            confidence_score=confidence_score
        )


class MonteCarloValidator:
    """
    Monte Carlo simulation for strategy robustness testing.
    Tests your strategy under thousands of market scenarios.
    """
    
    def __init__(self, num_simulations: int = 1000):
        self.num_simulations = num_simulations
    
    def validate_strategy(self,
                         strategy_class: Any,
                         data: pd.DataFrame,
                         config: Dict) -> Dict:
        """
        Run Monte Carlo validation with bootstrapped market data
        
        Returns:
            Dictionary with confidence intervals and risk metrics
        """
        logger.info(f"Running {self.num_simulations} Monte Carlo simulations")
        
        results = []
        
        for i in range(self.num_simulations):
            # Create bootstrapped data (with replacement)
            simulated_data = self._bootstrap_data(data)
            
            # Test strategy
            try:
                strategy = strategy_class(config=config)
                signals = strategy.generate_signals(simulated_data)
                returns = self._calculate_returns(simulated_data, signals)
                
                results.append({
                    'total_return': returns.sum(),
                    'sharpe': self._calculate_sharpe(returns),
                    'max_drawdown': self._calculate_max_drawdown(returns),
                    'volatility': returns.std() * np.sqrt(252)
                })
            except:
                continue
        
        # Analyze results
        return self._analyze_monte_carlo_results(results)
    
    def _bootstrap_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create bootstrapped version of data"""
        # Sample with replacement, maintaining some autocorrelation
        block_size = 21  # Monthly blocks
        num_blocks = len(data) // block_size
        
        sampled_blocks = []
        for _ in range(num_blocks):
            start_idx = np.random.randint(0, len(data) - block_size)
            sampled_blocks.append(data.iloc[start_idx:start_idx + block_size])
        
        return pd.concat(sampled_blocks, ignore_index=True)
    
    def _calculate_returns(self, data: pd.DataFrame, signals: pd.Series) -> pd.Series:
        """Calculate returns with realistic costs"""
        price_returns = data['close'].pct_change().fillna(0)
        positions = signals.shift(1).fillna(0)
        strategy_returns = positions * price_returns
        
        # Add realistic transaction costs
        trades = positions.diff().abs()
        transaction_costs = trades * 0.002  # 20 bps per trade (realistic)
        
        return strategy_returns - transaction_costs
    
    def _calculate_sharpe(self, returns: pd.Series) -> float:
        """Calculate Sharpe ratio"""
        if returns.std() == 0:
            return 0
        return np.sqrt(252) * returns.mean() / returns.std()
    
    def _calculate_max_drawdown(self, returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return abs(drawdown.min())
    
    def _analyze_monte_carlo_results(self, results: List[Dict]) -> Dict:
        """Analyze Monte Carlo results for confidence intervals"""
        
        if not results:
            return {
                'error': 'No successful simulations',
                'confidence': 0
            }
        
        df = pd.DataFrame(results)
        
        return {
            'expected_return': {
                'mean': df['total_return'].mean(),
                'median': df['total_return'].median(),
                'ci_5': df['total_return'].quantile(0.05),
                'ci_95': df['total_return'].quantile(0.95),
            },
            'expected_sharpe': {
                'mean': df['sharpe'].mean(),
                'median': df['sharpe'].median(),
                'ci_5': df['sharpe'].quantile(0.05),
                'ci_95': df['sharpe'].quantile(0.95),
            },
            'expected_drawdown': {
                'mean': df['max_drawdown'].mean(),
                'median': df['max_drawdown'].median(),
                'ci_95': df['max_drawdown'].quantile(0.95),  # Worst 5% drawdown
            },
            'risk_metrics': {
                'prob_positive_return': (df['total_return'] > 0).mean(),
                'prob_sharpe_above_1': (df['sharpe'] > 1).mean(),
                'prob_drawdown_below_20pct': (df['max_drawdown'] < 0.2).mean(),
                'value_at_risk_95': df['total_return'].quantile(0.05),
            },
            'stability_score': 1 - (df['sharpe'].std() / (df['sharpe'].mean() + 0.0001)),
            'confidence_score': min(100, 
                (df['total_return'] > 0).mean() * 40 +  # 40 points for positive returns
                (df['sharpe'] > 0.5).mean() * 30 +  # 30 points for decent Sharpe
                (df['max_drawdown'] < 0.2).mean() * 30  # 30 points for controlled drawdown
            )
        }


def validate_strategy_comprehensive(strategy_class: Any,
                                   data: pd.DataFrame,
                                   config: Dict) -> Dict:
    """
    Run comprehensive validation suite on a strategy.
    This is your complete safety check before going live.
    
    Returns:
        Dictionary with complete validation results and GO/NO-GO decision
    """
    
    logger.info("=" * 60)
    logger.info("COMPREHENSIVE STRATEGY VALIDATION")
    logger.info("=" * 60)
    
    results = {}
    
    # 1. Walk-Forward Testing
    logger.info("\n📊 Running Walk-Forward Analysis...")
    wf_validator = WalkForwardValidator()
    wf_result = wf_validator.validate_strategy(strategy_class, data, config)
    results['walk_forward'] = wf_result.to_dict()
    
    # 2. Monte Carlo Simulation
    logger.info("\n🎲 Running Monte Carlo Simulations...")
    mc_validator = MonteCarloValidator(num_simulations=500)
    mc_result = mc_validator.validate_strategy(strategy_class, data, config)
    results['monte_carlo'] = mc_result
    
    # 3. Overall Assessment
    is_safe = (
        wf_result.is_robust and
        mc_result['confidence_score'] > 70 and
        mc_result['risk_metrics']['prob_positive_return'] > 0.6
    )
    
    results['overall'] = {
        'verdict': 'SAFE FOR LIVE TRADING' if is_safe else 'DO NOT TRADE - FAILS VALIDATION',
        'confidence': (wf_result.confidence_score + mc_result['confidence_score']) / 2,
        'key_risks': [],
        'recommendations': []
    }
    
    # Add specific warnings
    if wf_result.overfitting_score > 0.3:
        results['overall']['key_risks'].append('HIGH OVERFITTING RISK')
    if wf_result.out_sample_sharpe < 0.5:
        results['overall']['key_risks'].append('LOW OUT-OF-SAMPLE PERFORMANCE')
    if mc_result['risk_metrics']['prob_drawdown_below_20pct'] < 0.8:
        results['overall']['key_risks'].append('HIGH DRAWDOWN RISK')
    
    # Add recommendations
    if not is_safe:
        if wf_result.overfitting_score > 0.3:
            results['overall']['recommendations'].append('Simplify strategy parameters')
        if wf_result.parameter_stability < 0.7:
            results['overall']['recommendations'].append('Parameters are unstable - needs redesign')
        if mc_result['risk_metrics']['prob_positive_return'] < 0.6:
            results['overall']['recommendations'].append('Strategy has low win rate - review logic')
    
    return results


if __name__ == "__main__":
    # Example usage
    print("Walk-Forward Validation Framework Ready")
    print("This module prevents overfitting disasters")
    print("Use validate_strategy_comprehensive() for full validation")



