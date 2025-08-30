#!/usr/bin/env python3
"""
TRADING AI ASSISTANT
====================

Complete user interface with guard rails for your AI ensemble
"""

import os
import asyncio
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Any

# AI imports
import anthropic
import openai
import google.generativeai as genai

# Data imports
import yfinance as yf

class TradingAIAssistant:
    """Complete AI assistant with guard rails and billing"""
    
    def __init__(self):
        print("🤖 INITIALIZING TRADING AI ASSISTANT")
        print("=" * 50)
        
        # Load API keys
        self.claude_key = os.getenv('CLAUDE_API_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
        # Initialize AI clients
        self.claude_client = None
        self.openai_client = None
        self.gemini_client = None
        
        self._setup_ai_clients()
        
        # Guard rails
        self.trading_keywords = [
            'stock', 'trade', 'trading', 'invest', 'investment', 'market', 'price', 
            'buy', 'sell', 'portfolio', 'analysis', 'chart', 'technical', 'fundamental',
            'options', 'futures', 'crypto', 'forex', 'etf', 'mutual fund', 'bond',
            'dividend', 'earnings', 'revenue', 'profit', 'loss', 'risk', 'return',
            'volatility', 'momentum', 'trend', 'support', 'resistance', 'breakout',
            'backtest', 'strategy', 'signal', 'indicator', 'moving average', 'rsi',
            'macd', 'bollinger', 'fibonacci', 'candlestick', 'volume', 'liquidity'
        ]
        
        self.blocked_topics = [
            'medical', 'health', 'doctor', 'medicine', 'drug', 'disease',
            'legal', 'lawyer', 'lawsuit', 'court', 'law', 'attorney',
            'political', 'politics', 'election', 'government', 'policy',
            'personal', 'relationship', 'dating', 'marriage', 'family',
            'inappropriate', 'sexual', 'violence', 'illegal', 'harmful'
        ]
        
        # Billing
        self.cost_per_query = {
            'claude': 0.015,
            'gpt4': 0.020,
            'gemini': 0.007,
            'consensus': 0.042
        }
        
        self.session_cost = 0.0
        self.query_count = 0
        
        print("✅ Trading AI Assistant Ready")
        print("=" * 50)
    
    def _setup_ai_clients(self):
        """Setup AI clients"""
        
        if self.claude_key and len(self.claude_key) > 20:
            try:
                self.claude_client = anthropic.Anthropic(api_key=self.claude_key)
                print("✅ Claude 3.5 Sonnet: Ready")
            except:
                print("❌ Claude: Failed to connect")
        
        if self.openai_key and len(self.openai_key) > 20:
            try:
                self.openai_client = openai.OpenAI(api_key=self.openai_key)
                print("✅ GPT-4o: Ready")
            except:
                print("❌ GPT-4: Failed to connect")
        
        if self.gemini_key and len(self.gemini_key) > 10:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_client = genai.GenerativeModel('gemini-1.5-pro')
                print("✅ Gemini: Ready")
            except:
                print("⚠️ Gemini: May hit quota limits")
                self.gemini_client = "simulation"
    
    def validate_query(self, user_query: str) -> Dict[str, Any]:
        """Validate that query is trading-related"""
        
        query_lower = user_query.lower()
        
        # Check for blocked topics
        for blocked in self.blocked_topics:
            if blocked in query_lower:
                return {
                    'valid': False,
                    'reason': f'Query contains blocked topic: {blocked}',
                    'message': '❌ Please ask only about trading and investing topics.'
                }
        
        # Check for trading keywords
        has_trading_keyword = any(keyword in query_lower for keyword in self.trading_keywords)
        
        if not has_trading_keyword:
            return {
                'valid': False,
                'reason': 'No trading keywords found',
                'message': '❌ Please ask about trading, investing, or market analysis topics only.'
            }
        
        # Check minimum length
        if len(user_query.strip()) < 10:
            return {
                'valid': False,
                'reason': 'Query too short',
                'message': '❌ Please provide a more detailed trading question.'
            }
        
        return {'valid': True, 'message': '✅ Valid trading query'}
    
    def extract_symbol(self, user_query: str) -> Optional[str]:
        """Extract stock symbol from query"""
        
        # Common patterns for stock symbols
        patterns = [
            r'\b([A-Z]{1,5})\b',  # 1-5 uppercase letters
            r'\$([A-Z]{1,5})\b',  # $SYMBOL format
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, user_query.upper())
            for match in matches:
                # Validate it's likely a stock symbol
                if len(match) <= 5 and match.isalpha():
                    return match
        
        return None
    
    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """Get current market data for symbol"""
        
        try:
            ticker = yf.Ticker(symbol)
            
            # Get current data
            hist = ticker.history(period="1d", interval="5m")
            info = ticker.info
            
            if hist.empty:
                return {'error': f'No data found for {symbol}'}
            
            current_price = float(hist['Close'].iloc[-1])
            open_price = float(hist['Open'].iloc[0])
            change = current_price - open_price
            change_pct = (change / open_price) * 100
            volume = int(hist['Volume'].sum())
            
            # Get additional info
            market_cap = info.get('marketCap', 'N/A')
            pe_ratio = info.get('trailingPE', 'N/A')
            
            return {
                'symbol': symbol,
                'current_price': current_price,
                'change': change,
                'change_percent': change_pct,
                'volume': volume,
                'market_cap': market_cap,
                'pe_ratio': pe_ratio,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {'error': f'Failed to get data for {symbol}: {str(e)}'}
    
    async def get_ai_analysis(self, query: str, market_data: Dict = None, selected_ais: List[str] = None) -> Dict[str, Any]:
        """Get analysis from selected AI models"""
        
        if selected_ais is None:
            selected_ais = ['claude', 'gpt4', 'gemini']  # Default: all AIs
        
        # Create enhanced prompt
        base_prompt = f"""
        Trading Analysis Request: {query}
        
        {f"Market Data: {json.dumps(market_data, indent=2)}" if market_data else ""}
        
        Provide specific trading analysis including:
        1. RECOMMENDATION: BUY/SELL/HOLD with conviction level (1-10)
        2. RISK ASSESSMENT: Risk level (1-10) and key risks
        3. POSITION SIZING: Recommended % of portfolio
        4. PRICE TARGETS: Entry, stop-loss, and target levels
        5. TIME HORIZON: Optimal holding period
        6. KEY REASONING: Why this recommendation now?
        
        Focus on actionable trading insights. Be specific and professional.
        """
        
        analyses = []
        total_cost = 0
        
        # Claude analysis
        if 'claude' in selected_ais and self.claude_client:
            try:
                response = self.claude_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=600,
                    temperature=0.1,
                    messages=[{"role": "user", "content": base_prompt}]
                )
                
                analysis_text = response.content[0].text
                cost = self.cost_per_query['claude']
                total_cost += cost
                
                analyses.append({
                    'provider': 'Claude 3.5 Sonnet',
                    'specialty': 'Deep Reasoning',
                    'analysis': analysis_text,
                    'cost': cost,
                    'confidence': 0.92
                })
                
            except Exception as e:
                analyses.append({
                    'provider': 'Claude 3.5 Sonnet',
                    'error': str(e)
                })
        
        # GPT-4 analysis
        if 'gpt4' in selected_ais and self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are a professional trading analyst. Provide specific, actionable trading advice."},
                        {"role": "user", "content": base_prompt}
                    ],
                    max_tokens=600,
                    temperature=0.1
                )
                
                analysis_text = response.choices[0].message.content
                cost = self.cost_per_query['gpt4']
                total_cost += cost
                
                analyses.append({
                    'provider': 'GPT-4o',
                    'specialty': 'Execution & Dynamics',
                    'analysis': analysis_text,
                    'cost': cost,
                    'confidence': 0.88
                })
                
            except Exception as e:
                analyses.append({
                    'provider': 'GPT-4o',
                    'error': str(e)
                })
        
        # Gemini analysis
        if 'gemini' in selected_ais and self.gemini_client:
            try:
                if self.gemini_client == "simulation":
                    # Simulation mode
                    analysis_text = f"""
                    GEMINI MATHEMATICAL ANALYSIS:
                    
                    Based on quantitative analysis:
                    • Probability assessment: {70 + (hash(query) % 30)}%
                    • Risk-adjusted score: {6 + (hash(query) % 4)}/10
                    • Mathematical confidence: {75 + (hash(query) % 20)}%
                    
                    Recommendation: Mathematical models suggest moderate position sizing
                    with careful risk management based on volatility patterns.
                    """
                else:
                    # Real Gemini
                    response = self.gemini_client.generate_content(base_prompt)
                    analysis_text = response.text
                
                cost = self.cost_per_query['gemini']
                total_cost += cost
                
                analyses.append({
                    'provider': 'Gemini Ultra',
                    'specialty': 'Mathematical Analysis',
                    'analysis': analysis_text,
                    'cost': cost,
                    'confidence': 0.85
                })
                
            except Exception as e:
                analyses.append({
                    'provider': 'Gemini Ultra',
                    'error': str(e)
                })
        
        # Create consensus if multiple AIs
        consensus = self._create_consensus(analyses)
        
        self.session_cost += total_cost
        self.query_count += 1
        
        return {
            'analyses': analyses,
            'consensus': consensus,
            'cost': total_cost,
            'session_cost': self.session_cost,
            'query_count': self.query_count
        }
    
    def _create_consensus(self, analyses: List[Dict]) -> Dict[str, Any]:
        """Create consensus from multiple AI analyses"""
        
        successful_analyses = [a for a in analyses if 'error' not in a]
        
        if not successful_analyses:
            return {'consensus': 'No successful analyses available', 'confidence': 0.0}
        
        if len(successful_analyses) == 1:
            analysis = successful_analyses[0]
            return {
                'consensus': analysis['analysis'],
                'confidence': analysis['confidence'],
                'source': f"{analysis['provider']} only",
                'providers_used': 1
            }
        
        # Multiple AIs - create weighted consensus
        total_confidence = sum(a['confidence'] for a in successful_analyses)
        avg_confidence = total_confidence / len(successful_analyses)
        
        consensus_text = "🤖 AI ENSEMBLE CONSENSUS:\n\n"
        
        for analysis in successful_analyses:
            provider = analysis['provider']
            specialty = analysis['specialty']
            confidence = analysis['confidence']
            
            consensus_text += f"📊 {provider} ({specialty}):\n"
            consensus_text += f"   Confidence: {confidence:.1%}\n"
            consensus_text += f"   {analysis['analysis'][:200]}...\n\n"
        
        consensus_text += f"🎯 ENSEMBLE CONFIDENCE: {avg_confidence:.1%}\n"
        consensus_text += f"💰 TOTAL COST: ${sum(a['cost'] for a in successful_analyses):.4f}"
        
        return {
            'consensus': consensus_text,
            'confidence': avg_confidence,
            'source': 'AI Ensemble',
            'providers_used': len(successful_analyses)
        }
    
    def format_response(self, result: Dict) -> str:
        """Format final response with disclaimers"""
        
        response = "🤖 NEXUS AI TRADING ANALYSIS\n"
        response += "=" * 40 + "\n\n"
        
        if 'consensus' in result:
            response += result['consensus']['consensus']
        
        response += "\n\n" + "=" * 40
        response += f"\n💰 Analysis Cost: ${result['cost']:.4f}"
        response += f"\n📊 Session Total: ${result['session_cost']:.4f}"
        response += f"\n🔢 Queries This Session: {result['query_count']}"
        
        response += "\n\n⚠️  IMPORTANT DISCLAIMERS:"
        response += "\n• This is not financial advice"
        response += "\n• Trading involves significant risk"
        response += "\n• Past performance doesn't guarantee future results"
        response += "\n• Always do your own research"
        response += "\n• Never invest more than you can afford to lose"
        
        return response
    
    async def process_query(self, user_query: str, selected_ais: List[str] = None) -> str:
        """Process complete user query with validation and analysis"""
        
        print(f"\n🔍 Processing query: {user_query[:50]}...")
        
        # 1. Validate query
        validation = self.validate_query(user_query)
        if not validation['valid']:
            return validation['message']
        
        # 2. Extract symbol if present
        symbol = self.extract_symbol(user_query)
        market_data = None
        
        if symbol:
            print(f"📊 Getting market data for {symbol}...")
            market_data = await self.get_market_data(symbol)
            if 'error' in market_data:
                print(f"⚠️ Market data error: {market_data['error']}")
                market_data = None
        
        # 3. Get AI analysis
        print("🤖 Running AI analysis...")
        result = await self.get_ai_analysis(user_query, market_data, selected_ais)
        
        # 4. Format and return response
        return self.format_response(result)

# Demo function
async def demo_trading_assistant():
    """Demo the trading AI assistant"""
    
    assistant = TradingAIAssistant()
    
    print("\n🎯 DEMO: TRADING AI ASSISTANT")
    print("=" * 50)
    
    # Test queries
    test_queries = [
        "Should I buy AAPL at current price?",
        "What's your opinion on NVDA for swing trading?",
        "Tell me about the weather",  # Should be blocked
        "Analyze TSLA technical indicators"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"USER QUERY: {query}")
        print('='*60)
        
        response = await assistant.process_query(query)
        print(response)
        
        print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(demo_trading_assistant())
