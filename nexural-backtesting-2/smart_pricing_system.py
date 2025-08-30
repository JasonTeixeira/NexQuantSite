#!/usr/bin/env python3
"""
SMART PRICING SYSTEM
====================

Automatically determines optimal pricing based on query complexity and value
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class AnalysisType(Enum):
    QUICK_INSIGHT = "quick_insight"
    PROFESSIONAL = "professional"
    INSTITUTIONAL = "institutional"
    CUSTOM_BACKTEST = "custom_backtest"

@dataclass
class PricingTier:
    name: str
    price: float
    description: str
    features: List[str]
    typical_tokens: int
    cost_estimate: float
    profit_margin: float

class SmartPricingSystem:
    """Intelligent pricing based on query complexity and value"""
    
    def __init__(self):
        # Define pricing tiers
        self.tiers = {
            AnalysisType.QUICK_INSIGHT: PricingTier(
                name="Quick Insight",
                price=0.99,
                description="Fast buy/sell/hold recommendation",
                features=[
                    "Single AI analysis",
                    "Basic price data",
                    "Simple recommendation",
                    "1-2 sentence reasoning"
                ],
                typical_tokens=300,
                cost_estimate=0.02,
                profit_margin=0.98
            ),
            
            AnalysisType.PROFESSIONAL: PricingTier(
                name="Professional Analysis",
                price=2.99,
                description="Comprehensive multi-AI analysis",
                features=[
                    "Triple AI consensus",
                    "Technical indicators",
                    "Risk assessment",
                    "Position sizing",
                    "Entry/exit targets",
                    "Time horizon"
                ],
                typical_tokens=800,
                cost_estimate=0.06,
                profit_margin=0.98
            ),
            
            AnalysisType.INSTITUTIONAL: PricingTier(
                name="Institutional Grade",
                price=9.99,
                description="Advanced analysis with MBP-10 data",
                features=[
                    "Everything in Professional",
                    "MBP-10 microstructure data",
                    "Order book analysis",
                    "Hidden liquidity detection",
                    "Cross-market correlations",
                    "Institutional insights"
                ],
                typical_tokens=1500,
                cost_estimate=0.20,
                profit_margin=0.98
            ),
            
            AnalysisType.CUSTOM_BACKTEST: PricingTier(
                name="Custom Backtesting",
                price=49.99,
                description="Full strategy backtesting with historical data",
                features=[
                    "Historical backtesting",
                    "MBP-10 data integration",
                    "Performance metrics",
                    "Risk analysis",
                    "Optimization suggestions",
                    "Detailed reports"
                ],
                typical_tokens=2500,
                cost_estimate=3.00,
                profit_margin=0.94
            )
        }
        
        # Keywords for complexity detection
        self.complexity_keywords = {
            'basic': [
                'buy', 'sell', 'hold', 'price', 'recommendation', 'opinion'
            ],
            'professional': [
                'analysis', 'detailed', 'comprehensive', 'complete', 'full',
                'technical', 'fundamental', 'indicators', 'rsi', 'macd',
                'moving average', 'bollinger', 'risk', 'position sizing'
            ],
            'institutional': [
                'mbp', 'mbp-10', 'microstructure', 'order book', 'futures',
                'institutional', 'professional grade', 'advanced',
                'cross-market', 'correlation', 'liquidity', 'market depth'
            ],
            'backtesting': [
                'backtest', 'backtesting', 'strategy', 'historical',
                'performance', 'sharpe', 'drawdown', 'optimization',
                'test strategy', 'validate', 'simulate'
            ]
        }
        
        # Symbol patterns
        self.symbol_patterns = [
            r'\b([A-Z]{1,5})\b',  # Stock symbols
            r'\$([A-Z]{1,5})\b',  # $SYMBOL format
            r'\b(ES|NQ|YM|RTY)\b',  # Futures
        ]
    
    def analyze_query_complexity(self, query: str) -> Dict[str, any]:
        """Analyze query to determine complexity and appropriate pricing"""
        
        query_lower = query.lower()
        complexity_score = 0
        detected_features = []
        
        # 1. Check for multiple symbols
        symbols = self._extract_symbols(query)
        if len(symbols) > 1:
            complexity_score += 2
            detected_features.append(f"Multiple symbols: {', '.join(symbols)}")
        elif len(symbols) == 1:
            detected_features.append(f"Symbol: {symbols[0]}")
        
        # 2. Check for keyword complexity
        keyword_scores = {
            'basic': 0,
            'professional': 0,
            'institutional': 0,
            'backtesting': 0
        }
        
        for category, keywords in self.complexity_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    keyword_scores[category] += 1
        
        # 3. Calculate complexity based on keywords
        if keyword_scores['backtesting'] > 0:
            complexity_score += 10
            detected_features.append("Backtesting requested")
        
        if keyword_scores['institutional'] > 0:
            complexity_score += 5
            detected_features.append("Institutional-grade analysis")
        
        if keyword_scores['professional'] >= 2:
            complexity_score += 3
            detected_features.append("Professional analysis requested")
        
        if keyword_scores['basic'] > 0 and complexity_score == 0:
            complexity_score += 1
            detected_features.append("Basic analysis")
        
        # 4. Check query length (longer = more complex)
        if len(query) > 100:
            complexity_score += 1
            detected_features.append("Detailed query")
        
        # 5. Check for specific analysis requests
        analysis_requests = [
            'technical indicators', 'fundamental analysis', 'risk assessment',
            'position sizing', 'entry points', 'exit points', 'stop loss',
            'price targets', 'market sentiment', 'volatility analysis'
        ]
        
        analysis_count = sum(1 for req in analysis_requests if req in query_lower)
        if analysis_count >= 3:
            complexity_score += 2
            detected_features.append(f"{analysis_count} analysis types requested")
        
        return {
            'complexity_score': complexity_score,
            'detected_features': detected_features,
            'symbols': symbols,
            'keyword_scores': keyword_scores,
            'query_length': len(query)
        }
    
    def determine_pricing_tier(self, query: str) -> Tuple[AnalysisType, PricingTier, Dict]:
        """Determine the appropriate pricing tier for a query"""
        
        analysis = self.analyze_query_complexity(query)
        complexity_score = analysis['complexity_score']
        
        # Determine tier based on complexity score
        if complexity_score >= 10:
            tier_type = AnalysisType.CUSTOM_BACKTEST
        elif complexity_score >= 5:
            tier_type = AnalysisType.INSTITUTIONAL
        elif complexity_score >= 3:
            tier_type = AnalysisType.PROFESSIONAL
        else:
            tier_type = AnalysisType.QUICK_INSIGHT
        
        tier = self.tiers[tier_type]
        
        return tier_type, tier, analysis
    
    def _extract_symbols(self, query: str) -> List[str]:
        """Extract trading symbols from query"""
        symbols = []
        
        for pattern in self.symbol_patterns:
            matches = re.findall(pattern, query.upper())
            for match in matches:
                if len(match) <= 5 and match.isalpha():
                    if match not in symbols:
                        symbols.append(match)
        
        return symbols
    
    def get_price_quote(self, query: str) -> Dict[str, any]:
        """Get a complete price quote for a query"""
        
        tier_type, tier, analysis = self.determine_pricing_tier(query)
        
        return {
            'query': query[:100] + "..." if len(query) > 100 else query,
            'analysis_type': tier_type.value,
            'tier_name': tier.name,
            'price': tier.price,
            'description': tier.description,
            'features': tier.features,
            'complexity_analysis': {
                'score': analysis['complexity_score'],
                'detected_features': analysis['detected_features'],
                'symbols': analysis['symbols']
            },
            'cost_breakdown': {
                'your_cost': tier.cost_estimate,
                'profit': tier.price - tier.cost_estimate,
                'profit_margin': f"{tier.profit_margin:.1%}"
            },
            'processing_estimate': self._estimate_processing_time(tier_type)
        }
    
    def _estimate_processing_time(self, tier_type: AnalysisType) -> str:
        """Estimate processing time for different tiers"""
        
        time_estimates = {
            AnalysisType.QUICK_INSIGHT: "2-5 seconds",
            AnalysisType.PROFESSIONAL: "5-15 seconds",
            AnalysisType.INSTITUTIONAL: "15-30 seconds",
            AnalysisType.CUSTOM_BACKTEST: "1-5 minutes"
        }
        
        return time_estimates[tier_type]
    
    def get_pricing_menu(self) -> Dict[str, any]:
        """Get the complete pricing menu"""
        
        menu = {
            'pricing_model': 'Value-based pricing',
            'tiers': {}
        }
        
        for tier_type, tier in self.tiers.items():
            menu['tiers'][tier_type.value] = {
                'name': tier.name,
                'price': f"${tier.price}",
                'description': tier.description,
                'features': tier.features,
                'typical_response_time': self._estimate_processing_time(tier_type)
            }
        
        return menu

# Demo function
def demo_smart_pricing():
    """Demo the smart pricing system"""
    
    print("💰 SMART PRICING SYSTEM DEMO")
    print("=" * 50)
    
    pricing_system = SmartPricingSystem()
    
    # Show pricing menu
    menu = pricing_system.get_pricing_menu()
    print("\n📋 PRICING MENU:")
    for tier_name, tier_info in menu['tiers'].items():
        print(f"\n🎯 {tier_info['name']} - {tier_info['price']}")
        print(f"   {tier_info['description']}")
        print(f"   Response time: {tier_info['typical_response_time']}")
    
    # Test queries
    test_queries = [
        "Should I buy AAPL?",
        "Give me a detailed technical analysis of NVDA including RSI, MACD, and risk assessment",
        "Analyze ES futures with MBP-10 order book data and institutional flow analysis",
        "Backtest my moving average crossover strategy on historical ES data with performance metrics"
    ]
    
    print("\n🧪 PRICING EXAMPLES:")
    print("=" * 50)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n--- Example {i} ---")
        print(f"Query: {query}")
        
        quote = pricing_system.get_price_quote(query)
        
        print(f"💰 Price: ${quote['price']}")
        print(f"📊 Tier: {quote['tier_name']}")
        print(f"⏱️ Time: {quote['processing_estimate']}")
        print(f"🎯 Features: {', '.join(quote['features'][:3])}...")
        print(f"💵 Your Cost: ${quote['cost_breakdown']['your_cost']}")
        print(f"📈 Profit: ${quote['cost_breakdown']['profit']:.2f} ({quote['cost_breakdown']['profit_margin']})")
        
        if quote['complexity_analysis']['detected_features']:
            print(f"🔍 Detected: {', '.join(quote['complexity_analysis']['detected_features'])}")
    
    print("\n" + "=" * 50)
    print("🏆 SMART PRICING READY!")
    print("   • Automatic tier detection ✅")
    print("   • Fair value-based pricing ✅")
    print("   • 94-98% profit margins ✅")
    print("   • Transparent cost breakdown ✅")
    print("=" * 50)

if __name__ == "__main__":
    demo_smart_pricing()
