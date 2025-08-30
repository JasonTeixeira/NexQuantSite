#!/usr/bin/env python3
"""
SECURE AI Integration - API Keys Protected
==========================================

This version loads API keys from .env file (NOT hardcoded)
"""

import os
import anthropic
import pandas as pd
import yfinance as yf
from datetime import datetime
import json

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Environment variables loaded from .env file")
except ImportError:
    print("⚠️ python-dotenv not installed. Using system environment variables.")

class SecureAISystem:
    """Secure AI system that loads API keys from environment"""
    
    def __init__(self):
        # Load API key from environment (NOT hardcoded)
        self.claude_api_key = os.getenv('CLAUDE_API_KEY')
        
        if not self.claude_api_key or self.claude_api_key.startswith('your-'):
            print("❌ CLAUDE_API_KEY not found in environment variables")
            print("   Please set it in .env file or environment")
            self.claude_client = None
        else:
            try:
                self.claude_client = anthropic.Anthropic(api_key=self.claude_api_key)
                print("✅ Claude client initialized securely")
                # Don't print the actual key!
                print(f"   Key loaded: {self.claude_api_key[:10]}...{self.claude_api_key[-4:]}")
            except Exception as e:
                print(f"❌ Claude initialization failed: {e}")
                self.claude_client = None
        
        self.total_cost = 0.0
        self.analysis_count = 0
    
    def analyze_trading_opportunity(self, ticker: str) -> dict:
        """Secure trading analysis"""
        
        if not self.claude_client:
            return {
                'error': 'Claude not available - check API key configuration',
                'ticker': ticker
            }
        
        print(f"🔍 Analyzing {ticker} (using secure API key)...")
        
        # Get market data
        try:
            stock_data = yf.download(ticker, period="3mo", interval="1d", progress=False)
            if stock_data.empty:
                return {'error': f'No data available for {ticker}'}
            
            current_price = stock_data['Close'].iloc[-1]
            daily_return = stock_data['Close'].pct_change().iloc[-1]
            volatility = stock_data['Close'].pct_change().std() * (252**0.5)
            
            market_data = {
                'current_price': float(current_price),
                'daily_return': float(daily_return),
                'volatility': float(volatility),
                'data_points': len(stock_data)
            }
        except Exception as e:
            return {'error': f'Failed to fetch data: {str(e)}'}
        
        # Create analysis prompt
        prompt = f"""
        Analyze {ticker} trading opportunity:
        
        Current Price: ${market_data['current_price']:.2f}
        Daily Return: {market_data['daily_return']:.2%}
        Volatility: {market_data['volatility']:.1%}
        
        Provide:
        1. BUY/SELL/HOLD recommendation
        2. Risk level (1-10)
        3. Position size suggestion
        4. Key price levels
        5. Time horizon
        
        Be specific and actionable.
        """
        
        try:
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=800,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            analysis = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            cost = tokens_used * 0.000015
            self.total_cost += cost
            self.analysis_count += 1
            
            return {
                'ticker': ticker,
                'analysis': analysis,
                'market_data': market_data,
                'tokens_used': tokens_used,
                'cost': cost,
                'timestamp': datetime.now().isoformat(),
                'security_status': 'API key loaded securely from environment'
            }
            
        except Exception as e:
            return {
                'ticker': ticker,
                'error': f'Claude API error: {str(e)}',
                'cost': 0
            }
    
    def get_security_status(self) -> dict:
        """Check security configuration"""
        
        status = {
            'api_key_source': 'Environment variable (.env file)',
            'api_key_exposed_in_code': False,
            'claude_available': self.claude_client is not None,
            'total_analyses': self.analysis_count,
            'total_cost': self.total_cost,
            'security_score': '9/10' if self.claude_client else '10/10 (no keys loaded)'
        }
        
        if self.claude_api_key:
            status['api_key_preview'] = f"{self.claude_api_key[:10]}...{self.claude_api_key[-4:]}"
        
        return status

def demo_secure_ai():
    """Demo the secure AI system"""
    
    print("🔒 SECURE AI SYSTEM DEMO")
    print("=" * 50)
    
    # Initialize secure system
    ai = SecureAISystem()
    
    # Check security status
    print("\\n🛡️ SECURITY STATUS:")
    security = ai.get_security_status()
    for key, value in security.items():
        print(f"   {key}: {value}")
    
    if ai.claude_client:
        print("\\n📊 TESTING SECURE ANALYSIS:")
        result = ai.analyze_trading_opportunity("AAPL")
        
        if 'error' not in result:
            print(f"✅ Analysis complete - Cost: ${result['cost']:.4f}")
            print("🎯 RECOMMENDATION:")
            print("-" * 40)
            print(result['analysis'][:300] + "...")
        else:
            print(f"❌ Error: {result['error']}")
    else:
        print("\\n❌ Claude not available - check API key configuration")

if __name__ == "__main__":
    demo_secure_ai()
