"""
Nexural Backtesting - Professional Quantitative Finance Platform

A comprehensive, enterprise-grade quantitative backtesting engine with AI/ML integration.
"""

__version__ = "1.0.0"
__author__ = "Nexural Team"
__description__ = "Professional Quantitative Finance Backtesting Platform"

# Core imports for easy access
try:
    from .strategies.backtesting_engine import BacktestingEngine, BacktestConfig, BacktestResult
    from .strategies.strategy_framework import StrategyFramework
    from .data.data_quality_engine import DataQualityEngine
    from .risk.portfolio_risk_manager import PortfolioRiskManager
    from .core.config_manager import ConfigManager
    from .ai.strategy_ai import StrategyAI
except ImportError:
    # Handle import errors gracefully during development
    pass

__all__ = [
    "__version__",
    "__author__", 
    "__description__",
    "BacktestingEngine",
    "BacktestConfig", 
    "BacktestResult",
    "StrategyFramework",
    "DataQualityEngine",
    "PortfolioRiskManager",
    "ConfigManager",
    "StrategyAI",
]
