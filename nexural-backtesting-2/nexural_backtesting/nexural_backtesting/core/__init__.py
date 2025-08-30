"""
Nexural Backtesting - Core Module

Core backtesting engines and optimization components.
"""

from .simple_backtest import SimpleBacktestEngine, SimpleBacktestConfig, SimpleBacktestResult
from .advanced_backtest_engine import AdvancedBacktestEngine, AdvancedBacktestConfig, AdvancedBacktestResult

__all__ = [
    "SimpleBacktestEngine",
    "SimpleBacktestConfig", 
    "SimpleBacktestResult",
    "AdvancedBacktestEngine",
    "AdvancedBacktestConfig",
    "AdvancedBacktestResult"
]