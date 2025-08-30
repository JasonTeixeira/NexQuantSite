"""
Data Processing Module for Enterprise Quantitative Backtesting Engine

This module provides advanced data processing capabilities including:
- Multi-asset data processing with corporate actions
- Market microstructure analysis
- Data quality validation and cleaning
- Order book reconstruction and trade classification
- Market impact modeling
"""

from .multi_asset_processor import (
    MultiAssetProcessor,
    CorporateAction,
    CorporateActionType
)

from .market_microstructure import (
    MarketMicrostructureAnalyzer,
    OrderBookSnapshot,
    OrderBookLevel,
    Trade,
    TradeClassification,
    OrderBookSide
)

from .data_quality_engine import (
    DataQualityEngine,
    DataQualityReport,
    OutlierMethod,
    InterpolationMethod
)

__all__ = [
    # Multi-asset processor
    'MultiAssetProcessor',
    'CorporateAction',
    'CorporateActionType',
    
    # Market microstructure
    'MarketMicrostructureAnalyzer',
    'OrderBookSnapshot',
    'OrderBookLevel',
    'Trade',
    'TradeClassification',
    'OrderBookSide',
    
    # Data quality
    'DataQualityEngine',
    'DataQualityReport',
    'OutlierMethod',
    'InterpolationMethod'
]

__version__ = "1.0.0"
__author__ = "Nexural Backtesting Team"
__description__ = "Advanced data processing for quantitative backtesting"
