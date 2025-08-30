#!/usr/bin/env python3
"""
Claude + Backtesting Integration
===============================

Integrate Claude's real AI analysis with your backtesting engine
"""

import anthropic
import pandas as pd
import yfinance as yf
from datetime import datetime
import json
import os

# Your Claude API key - set in environment variable
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY', 'your-claude-api-key-here')

class ClaudeBacktestingAnalyzer:
    """Integrate Claude AI with backtesting results"""
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
        self.total_cost = 0.0
        
    def analyze_backtest_results(self, ticker: str, backtest_results: dict, market_data: pd.DataFrame = None):
        """Get Claude's analysis of backtest results"""
        
        print(f"🤖 Getting Claude's analysis of {ticker} backtest...")
        
        # Prepare comprehensive prompt
        prompt = f"""
        You are an expert quantitative analyst reviewing a backtesting result. Provide professional analysis.
        
        BACKTEST RESULTS FOR {ticker}:
        
        Performance Metrics:
        - Total Return: {backtest_results.get('total_return', 0):.2%}
        - Sharpe Ratio: {backtest_results.get('sharpe_ratio', 0):.2f}
        - Maximum Drawdown: {backtest_results.get('max_drawdown', 0):.2%}
        - Win Rate: {backtest_results.get('win_rate', 0):.1%}
        - Total Trades: {backtest_results.get('total_trades', 0)}
        - Average Trade: {backtest_results.get('avg_trade_return', 0):.2%}
        - Volatility: {backtest_results.get('volatility', 0):.2%}
        
        Strategy Details:
        - Strategy Type: {backtest_results.get('strategy_name', 'Unknown')}
        - Time Period: {backtest_results.get('start_date', 'N/A')} to {backtest_results.get('end_date', 'N/A')}
        - Market Conditions: {backtest_results.get('market_regime', 'Mixed')}
        
        Please provide:
        
        1. OVERALL ASSESSMENT (Grade A-F):
           - Is this strategy ready for live trading?
           - Key strengths and weaknesses
        
        2. RISK ANALYSIS:
           - Risk-adjusted performance evaluation
           - Drawdown analysis and recovery patterns
           - Position sizing recommendations
        
        3. DEPLOYMENT RECOMMENDATIONS:
           - Should this strategy go live? (Yes/No/Conditional)
           - Recommended capital allocation (% of portfolio)
           - Risk management parameters
           - Market conditions to avoid
        
        4. IMPROVEMENT SUGGESTIONS:
           - Specific modifications to enhance performance
           - Additional filters or conditions
           - Portfolio diversification recommendations
        
        5. CONFIDENCE SCORE (1-100):
           - Your confidence in this strategy's future performance
           - Key factors affecting confidence
        
        Be specific, actionable, and honest about limitations.
        """
        
        try:
            # Make API call to Claude
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1500,
                temperature=0.2,  # Lower temperature for more consistent analysis
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            analysis = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            cost = tokens_used * 0.000015
            self.total_cost += cost
            
            print(f"✅ Analysis complete! Cost: ${cost:.4f}")
            
            return {
                'analysis': analysis,
                'tokens_used': tokens_used,
                'cost': cost,
                'timestamp': datetime.now().isoformat(),
                'ticker': ticker,
                'claude_model': 'claude-3-5-sonnet'
            }
            
        except Exception as e:
            print(f"❌ Claude analysis failed: {e}")
            return {
                'analysis': f"Error: {str(e)}",
                'tokens_used': 0,
                'cost': 0,
                'error': str(e)
            }
    
    def analyze_strategy_portfolio(self, strategies: list):
        """Analyze multiple strategies as a portfolio"""
        
        print("🤖 Getting Claude's portfolio analysis...")
        
        # Prepare portfolio summary
        portfolio_summary = []
        total_return = 0
        total_sharpe = 0
        
        for strategy in strategies:
            portfolio_summary.append({
                'name': strategy.get('strategy_name', 'Unknown'),
                'return': strategy.get('total_return', 0),
                'sharpe': strategy.get('sharpe_ratio', 0),
                'drawdown': strategy.get('max_drawdown', 0),
                'win_rate': strategy.get('win_rate', 0)
            })
            total_return += strategy.get('total_return', 0)
            total_sharpe += strategy.get('sharpe_ratio', 0)
        
        avg_sharpe = total_sharpe / len(strategies) if strategies else 0
        
        prompt = f"""
        You are a portfolio manager reviewing a collection of trading strategies for deployment.
        
        STRATEGY PORTFOLIO SUMMARY:
        
        {json.dumps(portfolio_summary, indent=2)}
        
        PORTFOLIO METRICS:
        - Combined Return: {total_return:.2%}
        - Average Sharpe: {avg_sharpe:.2f}
        - Number of Strategies: {len(strategies)}
        
        Please provide:
        
        1. PORTFOLIO ASSESSMENT:
           - Overall portfolio grade (A-F)
           - Diversification analysis
           - Risk concentration concerns
        
        2. ALLOCATION RECOMMENDATIONS:
           - Suggested capital allocation per strategy
           - Which strategies to prioritize
           - Which strategies to avoid or modify
        
        3. RISK MANAGEMENT:
           - Portfolio-level risk controls
           - Correlation concerns
           - Maximum drawdown expectations
        
        4. DEPLOYMENT STRATEGY:
           - Phased rollout recommendations
           - Monitoring requirements
           - Exit criteria for underperforming strategies
        
        5. EXPECTED PERFORMANCE:
           - Realistic return expectations
           - Risk-adjusted performance projections
           - Confidence level in portfolio success
        
        Be professional and specific with actionable recommendations.
        """
        
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1500,
                temperature=0.2,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            analysis = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            cost = tokens_used * 0.000015
            self.total_cost += cost
            
            return {
                'portfolio_analysis': analysis,
                'tokens_used': tokens_used,
                'cost': cost,
                'total_session_cost': self.total_cost,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'portfolio_analysis': f"Error: {str(e)}",
                'error': str(e)
            }

def demo_claude_backtesting():
    """Demo Claude analyzing backtest results"""
    
    print("🚀 DEMO: CLAUDE ANALYZING BACKTEST RESULTS")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = ClaudeBacktestingAnalyzer()
    
    # Mock backtest results (replace with your real results)
    mock_backtest = {
        'strategy_name': 'Moving Average Crossover',
        'total_return': 0.234,  # 23.4%
        'sharpe_ratio': 1.67,
        'max_drawdown': -0.089,  # -8.9%
        'win_rate': 0.623,  # 62.3%
        'total_trades': 47,
        'avg_trade_return': 0.0049,  # 0.49%
        'volatility': 0.156,  # 15.6%
        'start_date': '2023-01-01',
        'end_date': '2024-08-23',
        'market_regime': 'Mixed Bull/Bear'
    }
    
    # Get Claude's analysis
    result = analyzer.analyze_backtest_results('AAPL', mock_backtest)
    
    if 'error' not in result:
        print("🎯 CLAUDE'S BACKTEST ANALYSIS:")
        print("-" * 60)
        print(result['analysis'])
        print("-" * 60)
        print(f"💰 Analysis cost: ${result['cost']:.4f}")
        print(f"📊 Tokens used: {result['tokens_used']}")
    else:
        print(f"❌ Error: {result['error']}")

if __name__ == "__main__":
    demo_claude_backtesting()
