#!/usr/bin/env python3
"""
PAY-PER-USE PRICING SYSTEM
==========================

Simple pay-per-use model - users pay exactly for what they get
No subscriptions, no tiers, just fair usage-based pricing
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class UsagePrice:
    base_price: float
    description: str
    what_user_gets: List[str]
    your_cost: float
    profit: float
    profit_margin: float

class PayPerUsePricing:
    """Simple pay-per-use pricing - no tiers, just fair usage pricing"""
    
    def __init__(self):
        # Base pricing structure
        self.base_prices = {
            'ai_analysis': 0.25,      # Per AI analysis
            'consensus': 0.50,        # Triple AI consensus  
            'mbp10_data': 1.00,       # MBP-10 data analysis
            'backtesting': 5.00,      # Strategy backtesting
            'symbol_multiplier': 0.10 # Per additional symbol
        }
        
        # Your actual costs
        self.your_costs = {
            'claude': 0.015,
            'gpt4': 0.020,
            'gemini': 0.007,
            'mbp10_processing': 0.05,
            'backtesting': 0.50
        }
        
        # Keywords for feature detection
        self.feature_keywords = {
            'consensus': ['detailed', 'comprehensive', 'complete', 'full analysis', 'all ais'],
            'mbp10': ['mbp', 'mbp-10', 'microstructure', 'order book', 'futures', 'es', 'nq', 'ym', 'rty'],
            'backtesting': ['backtest', 'backtesting', 'strategy', 'historical', 'performance', 'test strategy'],
            'technical': ['rsi', 'macd', 'moving average', 'bollinger', 'technical indicators'],
            'fundamental': ['earnings', 'revenue', 'pe ratio', 'fundamental', 'financials'],
            'risk': ['risk', 'volatility', 'drawdown', 'position sizing']
        }
    
    def calculate_price(self, query: str) -> Dict[str, any]:
        """Calculate exact price based on what user is asking for"""
        
        query_lower = query.lower()
        total_price = 0.0
        total_cost = 0.0
        features_used = []
        price_breakdown = []
        
        # 1. Base AI analysis (always included)
        symbols = self._extract_symbols(query)
        num_symbols = max(1, len(symbols))  # At least 1 symbol
        
        # 2. Determine if user wants consensus (multiple AIs)
        wants_consensus = self._wants_consensus(query_lower)
        
        if wants_consensus:
            # Triple AI consensus
            base_price = self.base_prices['consensus']
            base_cost = self.your_costs['claude'] + self.your_costs['gpt4'] + self.your_costs['gemini']
            features_used.append("Triple AI Consensus")
            price_breakdown.append(f"Triple AI Analysis: ${base_price}")
        else:
            # Single AI analysis
            base_price = self.base_prices['ai_analysis']
            base_cost = self.your_costs['claude']  # Use Claude as default
            features_used.append("AI Analysis")
            price_breakdown.append(f"AI Analysis: ${base_price}")
        
        total_price += base_price
        total_cost += base_cost
        
        # 3. Multiple symbols cost extra
        if num_symbols > 1:
            extra_symbol_cost = (num_symbols - 1) * self.base_prices['symbol_multiplier']
            total_price += extra_symbol_cost
            features_used.append(f"{num_symbols} symbols analyzed")
            price_breakdown.append(f"Additional symbols ({num_symbols-1}): ${extra_symbol_cost}")
        
        # 4. MBP-10 data analysis
        if self._wants_mbp10(query_lower):
            mbp10_price = self.base_prices['mbp10_data']
            mbp10_cost = self.your_costs['mbp10_processing']
            total_price += mbp10_price
            total_cost += mbp10_cost
            features_used.append("MBP-10 Market Data")
            price_breakdown.append(f"MBP-10 Data Analysis: ${mbp10_price}")
        
        # 5. Backtesting
        if self._wants_backtesting(query_lower):
            backtest_price = self.base_prices['backtesting']
            backtest_cost = self.your_costs['backtesting']
            total_price += backtest_price
            total_cost += backtest_cost
            features_used.append("Strategy Backtesting")
            price_breakdown.append(f"Strategy Backtesting: ${backtest_price}")
        
        # Calculate profit
        profit = total_price - total_cost
        profit_margin = (profit / total_price) if total_price > 0 else 0
        
        return {
            'total_price': round(total_price, 2),
            'price_breakdown': price_breakdown,
            'features_used': features_used,
            'symbols_analyzed': symbols,
            'cost_breakdown': {
                'your_cost': round(total_cost, 2),
                'profit': round(profit, 2),
                'profit_margin': f"{profit_margin:.1%}"
            },
            'what_user_gets': self._describe_deliverables(features_used),
            'estimated_time': self._estimate_time(features_used)
        }
    
    def _extract_symbols(self, query: str) -> List[str]:
        """Extract trading symbols from query"""
        symbols = []
        patterns = [
            r'\b([A-Z]{1,5})\b',  # Stock symbols
            r'\$([A-Z]{1,5})\b',  # $SYMBOL format
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, query.upper())
            for match in matches:
                if len(match) <= 5 and match.isalpha():
                    # Filter out common English words
                    if match not in ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'UP', 'DO', 'NO', 'IF', 'MY', 'HE', 'AS', 'TO', 'IN', 'A', 'IS', 'IT', 'ON', 'BE', 'AT', 'OR', 'AN', 'HAS', 'HIS', 'THAT', 'HAVE', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'HOW', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE']:
                        if match not in symbols:
                            symbols.append(match)
        
        return symbols
    
    def _wants_consensus(self, query_lower: str) -> bool:
        """Check if user wants multiple AI analysis"""
        consensus_indicators = [
            'detailed', 'comprehensive', 'complete', 'full analysis',
            'thorough', 'in-depth', 'extensive', 'all ais',
            'multiple', 'consensus', 'best analysis'
        ]
        
        return any(indicator in query_lower for indicator in consensus_indicators)
    
    def _wants_mbp10(self, query_lower: str) -> bool:
        """Check if user wants MBP-10 data analysis"""
        return any(keyword in query_lower for keyword in self.feature_keywords['mbp10'])
    
    def _wants_backtesting(self, query_lower: str) -> bool:
        """Check if user wants backtesting"""
        return any(keyword in query_lower for keyword in self.feature_keywords['backtesting'])
    
    def _describe_deliverables(self, features_used: List[str]) -> List[str]:
        """Describe what the user will get"""
        deliverables = []
        
        if "AI Analysis" in features_used:
            deliverables.extend([
                "Professional AI analysis",
                "Buy/Sell/Hold recommendation",
                "Key reasoning and insights"
            ])
        
        if "Triple AI Consensus" in features_used:
            deliverables.extend([
                "Claude + GPT-4 + Gemini analysis",
                "Consensus recommendation",
                "Multiple AI perspectives",
                "Higher confidence insights"
            ])
        
        if "MBP-10 Market Data" in features_used:
            deliverables.extend([
                "Institutional-grade market data",
                "Order book analysis",
                "Microstructure insights",
                "Hidden liquidity detection"
            ])
        
        if "Strategy Backtesting" in features_used:
            deliverables.extend([
                "Historical performance analysis",
                "Risk metrics (Sharpe, drawdown)",
                "Optimization suggestions",
                "Detailed performance report"
            ])
        
        return deliverables
    
    def _estimate_time(self, features_used: List[str]) -> str:
        """Estimate processing time"""
        if "Strategy Backtesting" in features_used:
            return "1-3 minutes"
        elif "MBP-10 Market Data" in features_used:
            return "15-30 seconds"
        elif "Triple AI Consensus" in features_used:
            return "10-20 seconds"
        else:
            return "3-8 seconds"
    
    def get_pricing_examples(self) -> Dict[str, any]:
        """Get pricing examples for different query types"""
        
        examples = [
            "Should I buy AAPL?",
            "Give me a detailed analysis of NVDA",
            "Comprehensive analysis of TSLA and MSFT",
            "Analyze ES futures with MBP-10 data",
            "Backtest my moving average strategy on SPY"
        ]
        
        results = {}
        for example in examples:
            results[example] = self.calculate_price(example)
        
        return results

# Demo function
def demo_pay_per_use():
    """Demo the pay-per-use pricing system"""
    
    print("💰 PAY-PER-USE PRICING SYSTEM")
    print("=" * 50)
    print("Simple rule: You pay exactly for what you get!")
    print("No subscriptions, no tiers, just fair usage pricing")
    
    pricing = PayPerUsePricing()
    
    # Show base pricing
    print("\n📋 BASE PRICING:")
    print(f"   AI Analysis: ${pricing.base_prices['ai_analysis']}")
    print(f"   Triple AI Consensus: ${pricing.base_prices['consensus']}")
    print(f"   MBP-10 Data Analysis: ${pricing.base_prices['mbp10_data']}")
    print(f"   Strategy Backtesting: ${pricing.base_prices['backtesting']}")
    print(f"   Additional Symbol: ${pricing.base_prices['symbol_multiplier']}")
    
    # Show examples
    examples = pricing.get_pricing_examples()
    
    print("\n🧪 PRICING EXAMPLES:")
    print("=" * 50)
    
    for i, (query, result) in enumerate(examples.items(), 1):
        print(f"\n--- Example {i} ---")
        print(f"Query: \"{query}\"")
        print(f"💰 Total Price: ${result['total_price']}")
        print(f"📊 Breakdown: {' + '.join(result['price_breakdown'])}")
        print(f"🎯 You Get: {', '.join(result['what_user_gets'][:3])}...")
        print(f"⏱️ Time: {result['estimated_time']}")
        print(f"💵 Your Cost: ${result['cost_breakdown']['your_cost']}")
        print(f"📈 Your Profit: ${result['cost_breakdown']['profit']} ({result['cost_breakdown']['profit_margin']})")
        
        if result['symbols_analyzed']:
            print(f"📈 Symbols: {', '.join(result['symbols_analyzed'])}")
    
    print("\n" + "=" * 50)
    print("🏆 PAY-PER-USE PRICING READY!")
    print("   • No subscriptions ✅")
    print("   • No confusing tiers ✅")
    print("   • Pay exactly for what you get ✅")
    print("   • 85-95% profit margins ✅")
    print("   • Transparent pricing ✅")
    print("=" * 50)
    
    # Show revenue potential
    print("\n💰 REVENUE POTENTIAL:")
    print("If 1,000 users make 5 queries/day each:")
    print("   Average price per query: $1.25")
    print("   Daily revenue: $6,250")
    print("   Monthly revenue: $187,500")
    print("   Your costs: ~$25,000/month")
    print("   Net profit: $162,500/month (87% margin)")
    print("   Annual revenue: $2.25M")

if __name__ == "__main__":
    demo_pay_per_use()
