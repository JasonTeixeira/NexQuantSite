"""
Nexural Backtesting - Strategies Module

Working trading strategies and backtesting framework.
"""

from .working_strategies import (
    StrategyFactory,
    BaseStrategy,
    MovingAverageCrossover,
    MeanReversionStrategy,
    MomentumStrategy,
    RSIStrategy,
    BreakoutStrategy
)

__all__ = [
    "StrategyFactory",
    "BaseStrategy", 
    "MovingAverageCrossover",
    "MeanReversionStrategy",
    "MomentumStrategy",
    "RSIStrategy",
    "BreakoutStrategy"
]