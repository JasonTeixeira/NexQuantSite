"""
Stress Testing Engine for Enterprise Quantitative Backtesting Engine
Handles scenario analysis and stress testing
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
import json

logger = logging.getLogger(__name__)

class ScenarioType(Enum):
    """Types of stress scenarios"""
    MARKET_CRASH = "market_crash"
    INTEREST_RATE_SHOCK = "interest_rate_shock"
    CURRENCY_CRISIS = "currency_crisis"
    COMMODITY_SPIKE = "commodity_spike"
    SECTOR_DOWNTURN = "sector_downturn"
    LIQUIDITY_CRISIS = "liquidity_crisis"
    CORRELATION_BREAKDOWN = "correlation_breakdown"
    VOLATILITY_SPIKE = "volatility_spike"
    CUSTOM = "custom"

class StressSeverity(Enum):
    """Stress scenario severity levels"""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    EXTREME = "extreme"

@dataclass
class StressScenario:
    """Stress scenario definition"""
    name: str
    scenario_type: ScenarioType
    severity: StressSeverity
    description: str
    market_shocks: Dict[str, float]  # Asset/risk factor -> shock magnitude
    correlation_changes: Dict[str, float] = field(default_factory=dict)
    volatility_multipliers: Dict[str, float] = field(default_factory=dict)
    liquidity_impacts: Dict[str, float] = field(default_factory=dict)
    duration_days: int = 1
    probability: float = 0.01  # 1% probability
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ScenarioResult:
    """Stress test scenario result"""
    scenario: StressScenario
    portfolio_value_before: float
    portfolio_value_after: float
    portfolio_return: float
    var_before: float
    var_after: float
    var_change: float
    max_drawdown: float
    volatility_before: float
    volatility_after: float
    volatility_change: float
    sharpe_ratio_before: float
    sharpe_ratio_after: float
    asset_impacts: Dict[str, float]
    sector_impacts: Dict[str, float]
    risk_metrics_before: Dict[str, float]
    risk_metrics_after: Dict[str, float]
    execution_time: float
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class StressTestReport:
    """Comprehensive stress test report"""
    test_name: str
    test_date: datetime
    scenarios_tested: int
    total_execution_time: float
    scenario_results: List[ScenarioResult]
    summary_statistics: Dict[str, Any]
    worst_case_scenario: Optional[ScenarioResult]
    best_case_scenario: Optional[ScenarioResult]
    risk_ranking: List[Dict[str, Any]]
    recommendations: List[str]

class StressTestingEngine:
    """
    Advanced stress testing engine with comprehensive scenario analysis
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize stress testing engine
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.scenarios = {}
        self.test_results = []
        
        # Stress testing parameters
        self.default_scenarios = config.get('default_scenarios', True)
        self.custom_scenarios = config.get('custom_scenarios', {})
        self.risk_free_rate = config.get('risk_free_rate', 0.02)
        self.rebalancing_frequency = config.get('rebalancing_frequency', 'daily')
        
        # Market data
        self.returns_data = pd.DataFrame()
        self.portfolio_weights = pd.Series(dtype=float)
        self.portfolio_value = 1.0
        self.asset_metadata = {}
        
        # Initialize default scenarios
        if self.default_scenarios:
            self._initialize_default_scenarios()
        
        logger.info("Stress testing engine initialized")
    
    def update_data(self, returns_data: pd.DataFrame, portfolio_weights: pd.Series = None,
                   portfolio_value: float = 1.0, asset_metadata: Dict[str, Any] = None):
        """
        Update data for stress testing
        
        Args:
            returns_data: Asset returns dataframe
            portfolio_weights: Portfolio weights series
            portfolio_value: Current portfolio value
            asset_metadata: Asset metadata (sector, country, etc.)
        """
        try:
            self.returns_data = returns_data
            if portfolio_weights is not None:
                self.portfolio_weights = portfolio_weights
            self.portfolio_value = portfolio_value
            if asset_metadata is not None:
                self.asset_metadata = asset_metadata
            
            logger.info(f"Stress testing data updated: {len(returns_data)} observations, {len(returns_data.columns)} assets")
            
        except Exception as e:
            logger.error(f"Failed to update stress testing data: {e}")
            raise
    
    def add_scenario(self, scenario: StressScenario):
        """
        Add custom stress scenario
        
        Args:
            scenario: Stress scenario to add
        """
        try:
            self.scenarios[scenario.name] = scenario
            logger.info(f"Added stress scenario: {scenario.name} ({scenario.scenario_type.value})")
            
        except Exception as e:
            logger.error(f"Failed to add stress scenario: {e}")
            raise
    
    def run_stress_test(self, scenario_names: List[str] = None, 
                       include_defaults: bool = True) -> StressTestReport:
        """
        Run comprehensive stress test
        
        Args:
            scenario_names: List of specific scenarios to test
            include_defaults: Whether to include default scenarios
            
        Returns:
            Stress test report
        """
        try:
            start_time = datetime.now()
            
            # Determine scenarios to test
            scenarios_to_test = []
            
            if scenario_names:
                for name in scenario_names:
                    if name in self.scenarios:
                        scenarios_to_test.append(self.scenarios[name])
                    else:
                        logger.warning(f"Scenario '{name}' not found")
            
            elif include_defaults:
                scenarios_to_test = list(self.scenarios.values())
            
            if not scenarios_to_test:
                raise ValueError("No scenarios available for testing")
            
            # Run stress tests
            scenario_results = []
            
            for scenario in scenarios_to_test:
                try:
                    result = self._run_single_scenario(scenario)
                    scenario_results.append(result)
                    logger.info(f"Completed scenario: {scenario.name} - Portfolio return: {result.portfolio_return:.2%}")
                except Exception as e:
                    logger.error(f"Failed to run scenario {scenario.name}: {e}")
            
            # Generate comprehensive report
            report = self._generate_stress_test_report(scenario_results, start_time)
            
            # Store results
            self.test_results.append(report)
            
            logger.info(f"Stress test completed: {len(scenario_results)} scenarios tested in "
                       f"{(datetime.now() - start_time).total_seconds():.2f} seconds")
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to run stress test: {e}")
            raise
    
    def run_sensitivity_analysis(self, risk_factors: List[str], 
                               shock_sizes: List[float]) -> Dict[str, List[ScenarioResult]]:
        """
        Run sensitivity analysis for specific risk factors
        
        Args:
            risk_factors: List of risk factors to analyze
            shock_sizes: List of shock sizes to test
            
        Returns:
            Dictionary of results by risk factor
        """
        try:
            sensitivity_results = {}
            
            for factor in risk_factors:
                factor_results = []
                
                for shock_size in shock_sizes:
                    # Create scenario for this factor and shock size
                    scenario = StressScenario(
                        name=f"{factor}_shock_{shock_size:.1f}",
                        scenario_type=ScenarioType.CUSTOM,
                        severity=StressSeverity.MODERATE,
                        description=f"{shock_size:.1%} shock to {factor}",
                        market_shocks={factor: shock_size},
                        duration_days=1
                    )
                    
                    # Run scenario
                    result = self._run_single_scenario(scenario)
                    factor_results.append(result)
                
                sensitivity_results[factor] = factor_results
            
            return sensitivity_results
            
        except Exception as e:
            logger.error(f"Failed to run sensitivity analysis: {e}")
            raise
    
    def run_monte_carlo_stress_test(self, n_simulations: int = 1000,
                                  correlation_breakdown_prob: float = 0.1) -> List[ScenarioResult]:
        """
        Run Monte Carlo stress test with random scenarios
        
        Args:
            n_simulations: Number of Monte Carlo simulations
            correlation_breakdown_prob: Probability of correlation breakdown
            
        Returns:
            List of scenario results
        """
        try:
            mc_results = []
            
            for i in range(n_simulations):
                # Generate random scenario
                scenario = self._generate_random_scenario(i, correlation_breakdown_prob)
                
                # Run scenario
                result = self._run_single_scenario(scenario)
                mc_results.append(result)
            
            logger.info(f"Monte Carlo stress test completed: {n_simulations} simulations")
            return mc_results
            
        except Exception as e:
            logger.error(f"Failed to run Monte Carlo stress test: {e}")
            raise
    
    def _initialize_default_scenarios(self):
        """Initialize default stress scenarios"""
        try:
            # Market Crash Scenario
            market_crash = StressScenario(
                name="Market Crash 2008",
                scenario_type=ScenarioType.MARKET_CRASH,
                severity=StressSeverity.EXTREME,
                description="Simulation of 2008 financial crisis market conditions",
                market_shocks={
                    'equity_market': -0.40,  # 40% decline
                    'credit_spread': 0.05,   # 500 bps widening
                    'volatility': 0.80,      # 80% increase
                    'liquidity': -0.60       # 60% reduction
                },
                correlation_changes={
                    'equity_credit': 0.3,    # Increased correlation
                    'equity_volatility': 0.4
                },
                volatility_multipliers={
                    'equity': 2.5,
                    'credit': 3.0,
                    'commodity': 2.0
                },
                duration_days=30,
                probability=0.001
            )
            self.scenarios[market_crash.name] = market_crash
            
            # Interest Rate Shock
            rate_shock = StressScenario(
                name="Interest Rate Shock",
                scenario_type=ScenarioType.INTEREST_RATE_SHOCK,
                severity=StressSeverity.SEVERE,
                description="Sudden 200 bps increase in interest rates",
                market_shocks={
                    'interest_rates': 0.02,  # 200 bps increase
                    'bond_yields': 0.02,
                    'equity_market': -0.15,  # 15% decline
                    'currency': -0.10        # 10% depreciation
                },
                correlation_changes={
                    'rates_equity': -0.2,    # Negative correlation
                    'rates_currency': 0.3
                },
                volatility_multipliers={
                    'bonds': 2.0,
                    'equity': 1.5,
                    'currency': 1.8
                },
                duration_days=5,
                probability=0.01
            )
            self.scenarios[rate_shock.name] = rate_shock
            
            # Volatility Spike
            vol_spike = StressScenario(
                name="Volatility Spike",
                scenario_type=ScenarioType.VOLATILITY_SPIKE,
                severity=StressSeverity.MODERATE,
                description="Sudden increase in market volatility",
                market_shocks={
                    'volatility': 0.50,      # 50% increase
                    'equity_market': -0.10,  # 10% decline
                    'liquidity': -0.20       # 20% reduction
                },
                volatility_multipliers={
                    'equity': 2.0,
                    'credit': 1.8,
                    'commodity': 1.5
                },
                duration_days=10,
                probability=0.05
            )
            self.scenarios[vol_spike.name] = vol_spike
            
            # Sector Downturn
            sector_downturn = StressScenario(
                name="Technology Sector Downturn",
                scenario_type=ScenarioType.SECTOR_DOWNTURN,
                severity=StressSeverity.SEVERE,
                description="Technology sector specific downturn",
                market_shocks={
                    'technology_sector': -0.30,  # 30% decline
                    'equity_market': -0.08,      # 8% decline
                    'credit_spread': 0.02        # 200 bps widening
                },
                correlation_changes={
                    'tech_equity': 0.4,          # Increased correlation
                    'tech_credit': 0.3
                },
                volatility_multipliers={
                    'technology': 2.5,
                    'equity': 1.3
                },
                duration_days=15,
                probability=0.02
            )
            self.scenarios[sector_downturn.name] = sector_downturn
            
            logger.info(f"Initialized {len(self.scenarios)} default stress scenarios")
            
        except Exception as e:
            logger.error(f"Failed to initialize default scenarios: {e}")
            raise
    
    def _run_single_scenario(self, scenario: StressScenario) -> ScenarioResult:
        """Run a single stress scenario"""
        try:
            start_time = datetime.now()
            
            # Calculate baseline metrics
            baseline_metrics = self._calculate_baseline_metrics()
            
            # Apply scenario shocks
            stressed_returns = self._apply_scenario_shocks(scenario)
            
            # Calculate stressed metrics
            stressed_metrics = self._calculate_stressed_metrics(stressed_returns, scenario)
            
            # Calculate asset impacts
            asset_impacts = self._calculate_asset_impacts(scenario)
            sector_impacts = self._calculate_sector_impacts(scenario)
            
            # Create result
            result = ScenarioResult(
                scenario=scenario,
                portfolio_value_before=self.portfolio_value,
                portfolio_value_after=stressed_metrics['portfolio_value'],
                portfolio_return=stressed_metrics['portfolio_return'],
                var_before=baseline_metrics['var'],
                var_after=stressed_metrics['var'],
                var_change=stressed_metrics['var'] - baseline_metrics['var'],
                max_drawdown=stressed_metrics['max_drawdown'],
                volatility_before=baseline_metrics['volatility'],
                volatility_after=stressed_metrics['volatility'],
                volatility_change=stressed_metrics['volatility'] - baseline_metrics['volatility'],
                sharpe_ratio_before=baseline_metrics['sharpe_ratio'],
                sharpe_ratio_after=stressed_metrics['sharpe_ratio'],
                asset_impacts=asset_impacts,
                sector_impacts=sector_impacts,
                risk_metrics_before=baseline_metrics,
                risk_metrics_after=stressed_metrics,
                execution_time=(datetime.now() - start_time).total_seconds()
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to run scenario {scenario.name}: {e}")
            raise
    
    def _calculate_baseline_metrics(self) -> Dict[str, float]:
        """Calculate baseline portfolio metrics"""
        try:
            if self.returns_data.empty:
                return {}
            
            # Calculate portfolio returns
            if not self.portfolio_weights.empty:
                portfolio_returns = self._calculate_portfolio_returns()
            else:
                portfolio_returns = self.returns_data.mean(axis=1)
            
            # Calculate metrics
            volatility = portfolio_returns.std() * np.sqrt(252)
            var_95 = np.percentile(portfolio_returns, 5)
            sharpe_ratio = (portfolio_returns.mean() * 252 - self.risk_free_rate) / volatility
            
            # Calculate max drawdown
            cumulative_returns = (1 + portfolio_returns).cumprod()
            running_max = cumulative_returns.expanding().max()
            drawdown = (cumulative_returns - running_max) / running_max
            max_drawdown = abs(drawdown.min())
            
            return {
                'volatility': volatility,
                'var': abs(var_95),
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'portfolio_value': self.portfolio_value,
                'portfolio_return': 0.0  # Baseline return
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate baseline metrics: {e}")
            return {}
    
    def _apply_scenario_shocks(self, scenario: StressScenario) -> pd.DataFrame:
        """Apply scenario shocks to returns data"""
        try:
            stressed_returns = self.returns_data.copy()
            
            # Apply market shocks
            for asset, shock in scenario.market_shocks.items():
                if asset in stressed_returns.columns:
                    # Apply shock to returns
                    stressed_returns[asset] = stressed_returns[asset] + shock / scenario.duration_days
                elif asset == 'equity_market':
                    # Apply to all equity assets
                    equity_assets = [col for col in stressed_returns.columns if 'EQ' in col or 'STOCK' in col]
                    for eq_asset in equity_assets:
                        stressed_returns[eq_asset] = stressed_returns[eq_asset] + shock / scenario.duration_days
                elif asset == 'volatility':
                    # Apply volatility multiplier
                    for col in stressed_returns.columns:
                        if col in scenario.volatility_multipliers:
                            multiplier = scenario.volatility_multipliers[col]
                        else:
                            multiplier = 1.5  # Default multiplier
                        stressed_returns[col] = stressed_returns[col] * multiplier
            
            # Apply correlation changes (simplified)
            if scenario.correlation_changes:
                # This would require more sophisticated correlation modeling
                # For now, we'll apply a simplified approach
                pass
            
            return stressed_returns
            
        except Exception as e:
            logger.error(f"Failed to apply scenario shocks: {e}")
            raise
    
    def _calculate_stressed_metrics(self, stressed_returns: pd.DataFrame, 
                                  scenario: StressScenario) -> Dict[str, float]:
        """Calculate portfolio metrics under stress scenario"""
        try:
            # Calculate stressed portfolio returns
            if not self.portfolio_weights.empty:
                portfolio_returns = self._calculate_portfolio_returns_from_data(stressed_returns)
            else:
                portfolio_returns = stressed_returns.mean(axis=1)
            
            # Calculate metrics
            volatility = portfolio_returns.std() * np.sqrt(252)
            var_95 = np.percentile(portfolio_returns, 5)
            sharpe_ratio = (portfolio_returns.mean() * 252 - self.risk_free_rate) / volatility
            
            # Calculate stressed portfolio value
            cumulative_return = (1 + portfolio_returns).prod() - 1
            stressed_portfolio_value = self.portfolio_value * (1 + cumulative_return)
            
            # Calculate max drawdown
            cumulative_returns = (1 + portfolio_returns).cumprod()
            running_max = cumulative_returns.expanding().max()
            drawdown = (cumulative_returns - running_max) / running_max
            max_drawdown = abs(drawdown.min())
            
            return {
                'volatility': volatility,
                'var': abs(var_95),
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown,
                'portfolio_value': stressed_portfolio_value,
                'portfolio_return': cumulative_return
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate stressed metrics: {e}")
            return {}
    
    def _calculate_portfolio_returns(self) -> pd.Series:
        """Calculate portfolio returns from asset returns and weights"""
        try:
            if self.portfolio_weights.empty:
                return self.returns_data.mean(axis=1)
            
            # Align weights with returns data
            common_assets = self.portfolio_weights.index.intersection(self.returns_data.columns)
            if len(common_assets) == 0:
                raise ValueError("No common assets between weights and returns data")
            
            weights = self.portfolio_weights[common_assets]
            returns = self.returns_data[common_assets]
            
            # Calculate weighted portfolio returns
            portfolio_returns = (returns * weights).sum(axis=1)
            
            return portfolio_returns
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio returns: {e}")
            raise
    
    def _calculate_portfolio_returns_from_data(self, returns_data: pd.DataFrame) -> pd.Series:
        """Calculate portfolio returns from given returns data"""
        try:
            if self.portfolio_weights.empty:
                return returns_data.mean(axis=1)
            
            # Align weights with returns data
            common_assets = self.portfolio_weights.index.intersection(returns_data.columns)
            if len(common_assets) == 0:
                raise ValueError("No common assets between weights and returns data")
            
            weights = self.portfolio_weights[common_assets]
            returns = returns_data[common_assets]
            
            # Calculate weighted portfolio returns
            portfolio_returns = (returns * weights).sum(axis=1)
            
            return portfolio_returns
            
        except Exception as e:
            logger.error(f"Failed to calculate portfolio returns from data: {e}")
            raise
    
    def _calculate_asset_impacts(self, scenario: StressScenario) -> Dict[str, float]:
        """Calculate impact on individual assets"""
        try:
            asset_impacts = {}
            
            for asset in self.portfolio_weights.index:
                if asset in self.returns_data.columns:
                    # Calculate asset-specific impact
                    baseline_return = self.returns_data[asset].mean()
                    
                    # Apply scenario shocks to this asset
                    stressed_return = baseline_return
                    for shock_asset, shock in scenario.market_shocks.items():
                        if shock_asset == asset:
                            stressed_return += shock / scenario.duration_days
                        elif shock_asset in scenario.volatility_multipliers:
                            if asset in scenario.volatility_multipliers:
                                multiplier = scenario.volatility_multipliers[asset]
                            else:
                                multiplier = 1.0
                            stressed_return *= multiplier
                    
                    asset_impacts[asset] = stressed_return - baseline_return
            
            return asset_impacts
            
        except Exception as e:
            logger.error(f"Failed to calculate asset impacts: {e}")
            return {}
    
    def _calculate_sector_impacts(self, scenario: StressScenario) -> Dict[str, float]:
        """Calculate impact on sectors"""
        try:
            sector_impacts = {}
            
            # Simplified sector mapping
            sector_mapping = {
                'Technology': ['AAPL', 'GOOGL', 'MSFT', 'AMZN'],
                'Financial': ['JPM', 'BAC', 'WFC', 'GS'],
                'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV'],
                'Consumer': ['PG', 'KO', 'WMT', 'HD'],
                'Energy': ['XOM', 'CVX', 'COP', 'EOG']
            }
            
            for sector, assets in sector_mapping.items():
                sector_impact = 0.0
                sector_weight = 0.0
                
                for asset in assets:
                    if asset in self.portfolio_weights.index:
                        weight = self.portfolio_weights[asset]
                        sector_weight += weight
                        
                        if asset in self._calculate_asset_impacts(scenario):
                            sector_impact += weight * self._calculate_asset_impacts(scenario)[asset]
                
                if sector_weight > 0:
                    sector_impacts[sector] = sector_impact / sector_weight
            
            return sector_impacts
            
        except Exception as e:
            logger.error(f"Failed to calculate sector impacts: {e}")
            return {}
    
    def _generate_random_scenario(self, simulation_id: int, 
                                correlation_breakdown_prob: float) -> StressScenario:
        """Generate random stress scenario for Monte Carlo testing"""
        try:
            # Random scenario parameters
            scenario_types = list(ScenarioType)
            severities = list(StressSeverity)
            
            scenario_type = np.random.choice(scenario_types)
            severity = np.random.choice(severities)
            
            # Generate random market shocks
            market_shocks = {}
            assets = list(self.returns_data.columns)
            
            for asset in np.random.choice(assets, size=min(5, len(assets)), replace=False):
                # Random shock between -50% and +20%
                shock = np.random.uniform(-0.5, 0.2)
                market_shocks[asset] = shock
            
            # Generate random volatility multipliers
            volatility_multipliers = {}
            for asset in np.random.choice(assets, size=min(3, len(assets)), replace=False):
                multiplier = np.random.uniform(1.0, 3.0)
                volatility_multipliers[asset] = multiplier
            
            scenario = StressScenario(
                name=f"MC_Scenario_{simulation_id}",
                scenario_type=scenario_type,
                severity=severity,
                description=f"Random {scenario_type.value} scenario",
                market_shocks=market_shocks,
                volatility_multipliers=volatility_multipliers,
                duration_days=np.random.randint(1, 31),
                probability=0.001
            )
            
            return scenario
            
        except Exception as e:
            logger.error(f"Failed to generate random scenario: {e}")
            raise
    
    def _generate_stress_test_report(self, scenario_results: List[ScenarioResult], 
                                   start_time: datetime) -> StressTestReport:
        """Generate comprehensive stress test report"""
        try:
            if not scenario_results:
                return StressTestReport(
                    test_name="Stress Test",
                    test_date=start_time,
                    scenarios_tested=0,
                    total_execution_time=0.0,
                    scenario_results=[],
                    summary_statistics={},
                    worst_case_scenario=None,
                    best_case_scenario=None,
                    risk_ranking=[],
                    recommendations=[]
                )
            
            # Calculate summary statistics
            portfolio_returns = [r.portfolio_return for r in scenario_results]
            var_changes = [r.var_change for r in scenario_results]
            max_drawdowns = [r.max_drawdown for r in scenario_results]
            
            summary_stats = {
                'mean_portfolio_return': np.mean(portfolio_returns),
                'std_portfolio_return': np.std(portfolio_returns),
                'min_portfolio_return': np.min(portfolio_returns),
                'max_portfolio_return': np.max(portfolio_returns),
                'mean_var_change': np.mean(var_changes),
                'max_var_change': np.max(var_changes),
                'mean_max_drawdown': np.mean(max_drawdowns),
                'max_drawdown': np.max(max_drawdowns),
                'scenarios_with_losses': sum(1 for r in portfolio_returns if r < 0),
                'scenarios_with_gains': sum(1 for r in portfolio_returns if r > 0)
            }
            
            # Find worst and best case scenarios
            worst_case = min(scenario_results, key=lambda x: x.portfolio_return)
            best_case = max(scenario_results, key=lambda x: x.portfolio_return)
            
            # Create risk ranking
            risk_ranking = []
            for result in scenario_results:
                risk_score = (
                    abs(result.portfolio_return) * 0.4 +
                    abs(result.var_change) * 0.3 +
                    result.max_drawdown * 0.3
                )
                risk_ranking.append({
                    'scenario_name': result.scenario.name,
                    'risk_score': risk_score,
                    'portfolio_return': result.portfolio_return,
                    'var_change': result.var_change,
                    'max_drawdown': result.max_drawdown
                })
            
            # Sort by risk score
            risk_ranking.sort(key=lambda x: x['risk_score'], reverse=True)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(scenario_results, summary_stats)
            
            report = StressTestReport(
                test_name="Comprehensive Stress Test",
                test_date=start_time,
                scenarios_tested=len(scenario_results),
                total_execution_time=(datetime.now() - start_time).total_seconds(),
                scenario_results=scenario_results,
                summary_statistics=summary_stats,
                worst_case_scenario=worst_case,
                best_case_scenario=best_case,
                risk_ranking=risk_ranking,
                recommendations=recommendations
            )
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate stress test report: {e}")
            raise
    
    def _generate_recommendations(self, scenario_results: List[ScenarioResult], 
                                summary_stats: Dict[str, float]) -> List[str]:
        """Generate recommendations based on stress test results"""
        try:
            recommendations = []
            
            # Analyze worst-case scenarios
            worst_returns = [r.portfolio_return for r in scenario_results if r.portfolio_return < 0]
            if worst_returns:
                avg_loss = np.mean(worst_returns)
                if avg_loss < -0.20:  # Average loss > 20%
                    recommendations.append("Consider reducing portfolio risk exposure")
                    recommendations.append("Implement stop-loss mechanisms")
                
                if avg_loss < -0.30:  # Average loss > 30%
                    recommendations.append("Review portfolio diversification")
                    recommendations.append("Consider adding defensive positions")
            
            # Analyze VaR changes
            var_changes = [r.var_change for r in scenario_results]
            if var_changes:
                max_var_increase = max(var_changes)
                if max_var_increase > 0.05:  # VaR increase > 5%
                    recommendations.append("Review risk model assumptions")
                    recommendations.append("Consider stress testing more frequently")
            
            # Analyze drawdowns
            max_drawdowns = [r.max_drawdown for r in scenario_results]
            if max_drawdowns:
                avg_drawdown = np.mean(max_drawdowns)
                if avg_drawdown > 0.15:  # Average drawdown > 15%
                    recommendations.append("Implement drawdown limits")
                    recommendations.append("Consider dynamic risk management")
            
            # General recommendations
            if len(scenario_results) > 10:
                recommendations.append("Expand stress testing to include more scenarios")
                recommendations.append("Consider correlation breakdown scenarios")
            
            if not recommendations:
                recommendations.append("Portfolio appears well-positioned for stress scenarios")
                recommendations.append("Continue monitoring and regular stress testing")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            return ["Error generating recommendations"]
    
    def export_stress_test_results(self) -> pd.DataFrame:
        """Export stress test results as DataFrame"""
        try:
            if not self.test_results:
                return pd.DataFrame()
            
            export_data = []
            for report in self.test_results:
                for result in report.scenario_results:
                    export_data.append({
                        'test_date': report.test_date,
                        'scenario_name': result.scenario.name,
                        'scenario_type': result.scenario.scenario_type.value,
                        'severity': result.scenario.severity.value,
                        'portfolio_return': result.portfolio_return,
                        'var_change': result.var_change,
                        'max_drawdown': result.max_drawdown,
                        'volatility_change': result.volatility_change,
                        'execution_time': result.execution_time,
                        'timestamp': result.timestamp
                    })
            
            return pd.DataFrame(export_data)
            
        except Exception as e:
            logger.error(f"Failed to export stress test results: {e}")
            return pd.DataFrame()
