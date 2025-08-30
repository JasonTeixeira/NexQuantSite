"""
Risk Management Module for Enterprise Quantitative Backtesting Engine

This module provides comprehensive risk management capabilities including:
- Portfolio risk modeling and measurement
- Value at Risk (VaR) and Expected Shortfall (ES) calculations
- Risk factor analysis and decomposition
- Stress testing and scenario analysis
- Risk limits and monitoring
- Performance attribution and analytics
"""

from .portfolio_risk_manager import (
    PortfolioRiskManager,
    RiskMetrics,
    RiskLimits,
    RiskAlert
)

from .var_engine import (
    VaREngine,
    VaRMethod,
    VaRResult,
    ExpectedShortfall
)

from .stress_testing import (
    StressTestingEngine,
    StressScenario,
    ScenarioResult,
    StressTestReport
)

from .performance_analytics import (
    PerformanceAnalytics,
    PerformanceMetrics,
    AttributionAnalysis,
    RiskAdjustedReturns
)

from .risk_engine_manager import (
    RiskEngineManager,
    RiskEngineConfig,
    RiskAlert,
    RiskReport
)

__all__ = [
    # Portfolio risk management
    'PortfolioRiskManager',
    'RiskMetrics',
    'RiskLimits',
    'RiskAlert',
    
    # VaR calculations
    'VaREngine',
    'VaRMethod',
    'VaRResult',
    'ExpectedShortfall',
    
    # Stress testing
    'StressTestingEngine',
    'StressScenario',
    'ScenarioResult',
    'StressTestReport',
    
    # Performance analytics
    'PerformanceAnalytics',
    'PerformanceMetrics',
    'AttributionAnalysis',
    'RiskAdjustedReturns',
    
    # Risk engine management
    'RiskEngineManager',
    'RiskEngineConfig',
    'RiskAlert',
    'RiskReport'
]

__version__ = "1.0.0"
__author__ = "Nexural Backtesting Team"
__description__ = "Comprehensive risk management and analytics for quantitative backtesting"
