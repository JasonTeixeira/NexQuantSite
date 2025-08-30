"""
Smart Weighted Data Ensemble for Nexural Testing Engine
Intelligently combines multiple data sources with quality weighting
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class DataQuality(Enum):
    """Data source quality ratings"""
    INSTITUTIONAL = 1.0  # Bloomberg, Refinitiv
    PROFESSIONAL = 0.9   # Databento, QuantConnect
    EXCELLENT = 0.8      # Alpha Vantage, FRED
    GOOD = 0.7          # Yahoo Finance
    ACCEPTABLE = 0.6    # Free limited APIs
    POOR = 0.3          # Unreliable sources

@dataclass
class DataSource:
    """Data source configuration"""
    name: str
    quality: DataQuality
    latency_ms: int
    cost_per_month: float
    rate_limit: Optional[int]  # calls per minute
    data_types: List[str]
    reliability: float  # 0-1 uptime

class SmartDataEnsemble:
    """
    Intelligent ensemble that combines multiple data sources
    with quality weighting and automatic fallback
    """
    
    def __init__(self):
        """Initialize the smart ensemble"""
        self.sources = self._configure_sources()
        self.weights = self._calculate_weights()
        self.cache = {}
        
    def _configure_sources(self) -> Dict[str, DataSource]:
        """Configure all available data sources with their characteristics"""
        
        sources = {
            # FREE TIER (Recommended)
            'yahoo': DataSource(
                name='Yahoo Finance',
                quality=DataQuality.GOOD,
                latency_ms=200,
                cost_per_month=0,
                rate_limit=None,  # No official limit
                data_types=['stocks', 'options', 'indices', 'forex'],
                reliability=0.95
            ),
            'alpha_vantage': DataSource(
                name='Alpha Vantage',
                quality=DataQuality.EXCELLENT,
                latency_ms=500,
                cost_per_month=0,
                rate_limit=5,  # 5 per minute
                data_types=['stocks', 'forex', 'crypto', 'indicators'],
                reliability=0.98
            ),
            'fred': DataSource(
                name='FRED',
                quality=DataQuality.EXCELLENT,
                latency_ms=100,
                cost_per_month=0,
                rate_limit=120,  # 120 per minute
                data_types=['economic', 'rates', 'macro'],
                reliability=0.99
            ),
            'binance': DataSource(
                name='Binance',
                quality=DataQuality.EXCELLENT,
                latency_ms=50,
                cost_per_month=0,
                rate_limit=1200,  # Weight-based
                data_types=['crypto', 'futures'],
                reliability=0.99
            ),
            
            # PAID TIER (When Ready)
            'quantconnect': DataSource(
                name='QuantConnect',
                quality=DataQuality.PROFESSIONAL,
                latency_ms=100,
                cost_per_month=8,
                rate_limit=None,
                data_types=['stocks', 'options', 'futures', 'forex', 'crypto'],
                reliability=0.99
            ),
            'databento': DataSource(
                name='Databento',
                quality=DataQuality.PROFESSIONAL,
                latency_ms=10,
                cost_per_month=200,
                rate_limit=None,
                data_types=['futures', 'options', 'tick_data'],
                reliability=0.999
            ),
            'alpaca': DataSource(
                name='Alpaca',
                quality=DataQuality.GOOD,
                latency_ms=50,
                cost_per_month=9,
                rate_limit=200,
                data_types=['stocks', 'crypto'],
                reliability=0.98
            )
        }
        
        return sources
    
    def _calculate_weights(self) -> Dict[str, float]:
        """
        Calculate intelligent weights for each data source
        based on quality, cost, and reliability
        """
        weights = {}
        
        for name, source in self.sources.items():
            # Base weight from quality
            weight = source.quality.value
            
            # Adjust for reliability
            weight *= source.reliability
            
            # Bonus for free sources
            if source.cost_per_month == 0:
                weight *= 1.2
            
            # Penalty for rate limits
            if source.rate_limit and source.rate_limit < 10:
                weight *= 0.7
            
            # Penalty for high latency
            if source.latency_ms > 500:
                weight *= 0.8
            
            weights[name] = weight
        
        # Normalize weights
        total = sum(weights.values())
        weights = {k: v/total for k, v in weights.items()}
        
        return weights
    
    def get_ensemble_recommendation(self, budget: float = 0) -> Dict:
        """
        Get recommended ensemble based on budget
        
        Args:
            budget: Monthly budget in USD
            
        Returns:
            Recommended data source configuration
        """
        
        recommendations = {
            'immediate': [],  # Use right now
            'essential': [],  # Add ASAP
            'nice_to_have': [],  # When profitable
            'skip': []  # Not worth it
        }
        
        # Free tier analysis
        if budget == 0:
            recommendations['immediate'] = [
                ('yahoo', 'Primary stock data - unlimited, fast'),
                ('binance', 'Best crypto data - professional grade'),
                ('fred', 'Economic indicators - institutional quality')
            ]
            recommendations['essential'] = [
                ('alpha_vantage', 'Technical indicators - get free key')
            ]
            recommendations['nice_to_have'] = [
                ('quantconnect', '$8/month - massive upgrade when ready')
            ]
            recommendations['skip'] = [
                ('polygon_free', 'Too limited - 5 calls/min'),
                ('iex_free', 'Burns through 50k/month quickly'),
                ('twelve_free', 'Only 800 calls/day')
            ]
        
        # Budget tier ($10-50/month)
        elif budget <= 50:
            recommendations['immediate'] = [
                ('quantconnect', '$8 - Best value, comprehensive data'),
                ('alpaca', '$9 - Real-time stock data')
            ]
            recommendations['essential'] = [
                ('yahoo', 'Keep as backup - free'),
                ('fred', 'Macro context - free'),
                ('binance', 'Crypto - free')
            ]
            recommendations['nice_to_have'] = [
                ('databento', 'Save for when profitable - $200+')
            ]
        
        # Professional tier ($200+/month)
        elif budget >= 200:
            recommendations['immediate'] = [
                ('databento', '$200+ - Tick data, institutional grade'),
                ('quantconnect', '$8-40 - Comprehensive platform')
            ]
            recommendations['essential'] = [
                ('yahoo', 'Fast backup - free'),
                ('fred', 'Macro data - free')
            ]
        
        return recommendations
    
    def create_weighted_ensemble(self, symbol: str, 
                                data_type: str = 'price') -> pd.DataFrame:
        """
        Create weighted ensemble data from multiple sources
        
        This is the KEY FUNCTION that combines data intelligently
        """
        
        ensemble_data = []
        weights_used = []
        sources_used = []
        
        # Determine which sources can provide this data type
        valid_sources = [
            name for name, source in self.sources.items()
            if any(data_type in dt for dt in source.data_types)
        ]
        
        # Collect data from each valid source
        for source_name in valid_sources:
            try:
                # Get data from source (implement actual API calls)
                data = self._fetch_from_source(source_name, symbol, data_type)
                
                if data is not None and not data.empty:
                    ensemble_data.append(data)
                    weights_used.append(self.weights[source_name])
                    sources_used.append(source_name)
                    
            except Exception as e:
                logger.warning(f"Failed to get data from {source_name}: {e}")
                continue
        
        if not ensemble_data:
            logger.error(f"No data available for {symbol}")
            return pd.DataFrame()
        
        # Weighted ensemble combination
        if len(ensemble_data) == 1:
            # Single source
            result = ensemble_data[0]
            result['data_source'] = sources_used[0]
            result['confidence'] = weights_used[0]
            
        else:
            # Multiple sources - intelligent combination
            result = self._combine_weighted_data(
                ensemble_data, 
                weights_used, 
                sources_used
            )
        
        return result
    
    def _combine_weighted_data(self, data_list: List[pd.DataFrame], 
                              weights: List[float], 
                              sources: List[str]) -> pd.DataFrame:
        """
        Intelligently combine data from multiple sources
        
        Strategy:
        1. Use highest quality source as primary
        2. Fill gaps with secondary sources
        3. Validate with tertiary sources
        4. Flag discrepancies
        """
        
        # Sort by weight (quality)
        sorted_indices = sorted(range(len(weights)), 
                              key=lambda i: weights[i], 
                              reverse=True)
        
        # Start with highest quality source
        primary_idx = sorted_indices[0]
        result = data_list[primary_idx].copy()
        result['primary_source'] = sources[primary_idx]
        
        # Fill missing data from other sources
        for idx in sorted_indices[1:]:
            secondary_data = data_list[idx]
            
            # Fill NaN values
            for col in ['open', 'high', 'low', 'close', 'volume']:
                if col in result.columns and col in secondary_data.columns:
                    result[col].fillna(secondary_data[col], inplace=True)
        
        # Calculate confidence score
        result['confidence'] = self._calculate_confidence(
            data_list, weights, result
        )
        
        # Flag discrepancies
        result['discrepancy_flag'] = self._check_discrepancies(
            data_list, result
        )
        
        return result
    
    def _calculate_confidence(self, data_list: List[pd.DataFrame], 
                             weights: List[float], 
                             combined: pd.DataFrame) -> pd.Series:
        """
        Calculate confidence score for each data point
        
        Higher score = more sources agree
        """
        confidence = pd.Series(index=combined.index, dtype=float)
        
        for idx in combined.index:
            if 'close' in combined.columns:
                close_val = combined.loc[idx, 'close']
                
                # Count how many sources agree (within 0.1%)
                agreements = 0
                total_weight = 0
                
                for i, df in enumerate(data_list):
                    if idx in df.index and 'close' in df.columns:
                        other_val = df.loc[idx, 'close']
                        if abs(close_val - other_val) / close_val < 0.001:
                            agreements += weights[i]
                        total_weight += weights[i]
                
                confidence[idx] = agreements / total_weight if total_weight > 0 else 0
        
        return confidence
    
    def _check_discrepancies(self, data_list: List[pd.DataFrame], 
                            combined: pd.DataFrame) -> pd.Series:
        """
        Flag data points with significant discrepancies between sources
        """
        flags = pd.Series(index=combined.index, dtype=bool)
        
        for idx in combined.index:
            if 'close' in combined.columns:
                values = []
                
                for df in data_list:
                    if idx in df.index and 'close' in df.columns:
                        values.append(df.loc[idx, 'close'])
                
                if len(values) > 1:
                    # Check if variation is > 1%
                    mean_val = np.mean(values)
                    max_deviation = max(abs(v - mean_val) / mean_val 
                                      for v in values)
                    flags[idx] = max_deviation > 0.01
                else:
                    flags[idx] = False
        
        return flags
    
    def _fetch_from_source(self, source_name: str, 
                          symbol: str, 
                          data_type: str) -> Optional[pd.DataFrame]:
        """
        Fetch data from specific source
        (This would call actual API connectors)
        """
        # This is where you'd integrate with actual API calls
        # For now, returning None to show structure
        return None
    
    def get_ensemble_metrics(self) -> Dict:
        """
        Get metrics about ensemble performance
        """
        active_sources = [s for s, w in self.weights.items() if w > 0]
        
        metrics = {
            'total_sources': len(self.sources),
            'active_sources': len(active_sources),
            'avg_quality': np.mean([s.quality.value for s in self.sources.values()]),
            'total_cost': sum(s.cost_per_month for s in self.sources.values()),
            'free_sources': sum(1 for s in self.sources.values() if s.cost_per_month == 0),
            'weights': self.weights,
            'recommended_budget': self._get_optimal_budget()
        }
        
        return metrics
    
    def _get_optimal_budget(self) -> float:
        """Calculate optimal budget for data sources"""
        # QuantConnect at $8/month provides best value
        # Databento at $200+ for professional needs
        
        if any(s.quality == DataQuality.PROFESSIONAL 
               for s in self.sources.values()):
            return 200  # Professional setup
        else:
            return 8  # Best value setup


def demonstrate_ensemble_strategy():
    """Show the optimal ensemble strategy"""
    
    ensemble = SmartDataEnsemble()
    
    print("\n" + "="*70)
    print("NEXURAL SMART DATA ENSEMBLE STRATEGY")
    print("="*70)
    
    # Show weights
    print("\n📊 CALCULATED SOURCE WEIGHTS:")
    for source, weight in sorted(ensemble.weights.items(), 
                                key=lambda x: x[1], reverse=True):
        print(f"   {source:15} : {weight:.1%}")
    
    # Recommendations for different budgets
    for budget in [0, 10, 50, 200]:
        print(f"\n💰 BUDGET: ${budget}/month")
        recs = ensemble.get_ensemble_recommendation(budget)
        
        print("   IMMEDIATE:")
        for source, reason in recs['immediate']:
            print(f"      ✅ {source}: {reason}")
        
        if recs['essential']:
            print("   ESSENTIAL:")
            for item in recs['essential']:
                if isinstance(item, tuple):
                    print(f"      🎯 {item[0]}: {item[1]}")
                else:
                    print(f"      🎯 {item}")
        
        if recs['skip']:
            print("   SKIP:")
            for item in recs['skip']:
                if isinstance(item, tuple):
                    print(f"      ❌ {item[0]}: {item[1]}")
                else:
                    print(f"      ❌ {item}")
    
    # Show metrics
    metrics = ensemble.get_ensemble_metrics()
    print(f"\n📈 ENSEMBLE METRICS:")
    print(f"   Average Quality Score: {metrics['avg_quality']:.1%}")
    print(f"   Free Sources Available: {metrics['free_sources']}")
    print(f"   Optimal Budget: ${metrics['recommended_budget']}/month")
    
    print("\n" + "="*70)
    print("RECOMMENDATION: Start with FREE, add QuantConnect at $8/month")
    print("="*70)


if __name__ == "__main__":
    demonstrate_ensemble_strategy()