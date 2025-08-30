#!/usr/bin/env python3
"""
REAL AI API Integration - Claude + ChatGPT + Google
===================================================

This is the ACTUAL code to connect your system to real AI APIs.
No hype, no BS - just working integration.
"""

import os
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    """Standardized AI response"""
    provider: str
    content: str
    confidence: float
    tokens_used: int
    cost_usd: float
    timestamp: str
    error: Optional[str] = None

class RealAIIntegration:
    """
    ACTUAL AI integration with real APIs
    
    Connects to ChatGPT, Claude, and Google AI
    """
    
    def __init__(self):
        self.openai_client = None
        self.claude_client = None
        self.google_client = None
        
        # Check what's actually available
        self.setup_clients()
        
        logger.info("🤖 Real AI Integration Status:")
        logger.info(f"   OpenAI (ChatGPT): {'✅' if self.openai_client else '❌'}")
        logger.info(f"   Claude: {'✅' if self.claude_client else '❌'}")
        logger.info(f"   Google AI: {'✅' if self.google_client else '❌'}")
    
    def setup_clients(self):
        """Setup all available AI clients"""
        
        # OpenAI (ChatGPT)
        try:
            openai_key = os.getenv('OPENAI_API_KEY')
            if openai_key and not openai_key.startswith('your-') and len(openai_key) > 20:
                import openai
                self.openai_client = openai.OpenAI(api_key=openai_key)
                logger.info("✅ OpenAI client initialized")
            else:
                logger.warning("❌ OpenAI API key not found or invalid")
        except ImportError:
            logger.warning("❌ OpenAI package not installed. Run: pip install openai")
        except Exception as e:
            logger.error(f"❌ OpenAI setup failed: {e}")
        
        # Claude (Anthropic)
        try:
            claude_key = os.getenv('CLAUDE_API_KEY')
            if claude_key and not claude_key.startswith('your-') and len(claude_key) > 20:
                import anthropic
                self.claude_client = anthropic.Anthropic(api_key=claude_key)
                logger.info("✅ Claude client initialized")
            else:
                logger.warning("❌ Claude API key not found or invalid")
        except ImportError:
            logger.warning("❌ Anthropic package not installed. Run: pip install anthropic")
        except Exception as e:
            logger.error(f"❌ Claude setup failed: {e}")
        
        # Google AI
        try:
            google_key = os.getenv('GOOGLE_AI_KEY')
            if google_key and not google_key.startswith('your-') and len(google_key) > 10:
                import google.generativeai as genai
                genai.configure(api_key=google_key)
                self.google_client = genai.GenerativeModel('gemini-pro')
                logger.info("✅ Google AI client initialized")
            else:
                logger.warning("❌ Google AI key not found or invalid")
        except ImportError:
            logger.warning("❌ Google AI package not installed. Run: pip install google-generativeai")
        except Exception as e:
            logger.error(f"❌ Google AI setup failed: {e}")
    
    async def analyze_with_chatgpt(self, prompt: str, data: Dict = None) -> AIResponse:
        """Analyze using ChatGPT (OpenAI)"""
        
        if not self.openai_client:
            return AIResponse(
                provider="openai",
                content="OpenAI not available - check API key",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error="No API key"
            )
        
        try:
            # Enhance prompt with data context
            if data:
                enhanced_prompt = f"""
                Trading Analysis Request:
                {prompt}
                
                Market Data Context:
                {json.dumps(data, indent=2, default=str)}
                
                Please provide:
                1. Analysis of the trading opportunity
                2. Risk assessment
                3. Specific recommendations
                4. Confidence level (0-100%)
                """
            else:
                enhanced_prompt = prompt
            
            # Make API call
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert quantitative analyst and trading strategist."},
                    {"role": "user", "content": enhanced_prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            cost_usd = tokens_used * 0.00003  # Approximate GPT-4 cost
            
            return AIResponse(
                provider="openai",
                content=content,
                confidence=0.85,  # GPT-4 is generally reliable
                tokens_used=tokens_used,
                cost_usd=cost_usd,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return AIResponse(
                provider="openai",
                content=f"Error: {str(e)}",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    async def analyze_with_claude(self, prompt: str, data: Dict = None) -> AIResponse:
        """Analyze using Claude (Anthropic)"""
        
        if not self.claude_client:
            return AIResponse(
                provider="claude",
                content="Claude not available - check API key",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error="No API key"
            )
        
        try:
            # Enhance prompt with data context
            if data:
                enhanced_prompt = f"""
                <trading_analysis>
                {prompt}
                
                <market_data>
                {json.dumps(data, indent=2, default=str)}
                </market_data>
                
                Please analyze this trading opportunity and provide:
                1. Detailed market analysis
                2. Risk/reward assessment  
                3. Specific trading recommendations
                4. Your confidence level
                </trading_analysis>
                """
            else:
                enhanced_prompt = prompt
            
            # Make API call
            response = self.claude_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                temperature=0.3,
                messages=[
                    {"role": "user", "content": enhanced_prompt}
                ]
            )
            
            content = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            cost_usd = tokens_used * 0.000015  # Approximate Claude cost
            
            return AIResponse(
                provider="claude",
                content=content,
                confidence=0.90,  # Claude is very reliable
                tokens_used=tokens_used,
                cost_usd=cost_usd,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return AIResponse(
                provider="claude",
                content=f"Error: {str(e)}",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    async def analyze_with_google(self, prompt: str, data: Dict = None) -> AIResponse:
        """Analyze using Google AI (Gemini)"""
        
        if not self.google_client:
            return AIResponse(
                provider="google",
                content="Google AI not available - check API key",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error="No API key"
            )
        
        try:
            # Enhance prompt with data context
            if data:
                enhanced_prompt = f"""
                Trading Analysis Request:
                {prompt}
                
                Market Data:
                {json.dumps(data, indent=2, default=str)}
                
                Provide comprehensive trading analysis including risks and recommendations.
                """
            else:
                enhanced_prompt = prompt
            
            # Make API call
            response = self.google_client.generate_content(enhanced_prompt)
            
            content = response.text
            tokens_used = len(enhanced_prompt.split()) + len(content.split())  # Rough estimate
            cost_usd = tokens_used * 0.000001  # Google AI is very cheap
            
            return AIResponse(
                provider="google",
                content=content,
                confidence=0.80,  # Gemini is good but newer
                tokens_used=tokens_used,
                cost_usd=cost_usd,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Google AI error: {e}")
            return AIResponse(
                provider="google",
                content=f"Error: {str(e)}",
                confidence=0.0,
                tokens_used=0,
                cost_usd=0.0,
                timestamp=datetime.now().isoformat(),
                error=str(e)
            )
    
    async def ensemble_analysis(self, prompt: str, data: Dict = None) -> Dict[str, AIResponse]:
        """Run analysis with all available AI providers"""
        
        logger.info("🤖 Running AI Ensemble Analysis...")
        
        # Run all providers in parallel
        tasks = []
        
        if self.openai_client:
            tasks.append(("openai", self.analyze_with_chatgpt(prompt, data)))
        
        if self.claude_client:
            tasks.append(("claude", self.analyze_with_claude(prompt, data)))
        
        if self.google_client:
            tasks.append(("google", self.analyze_with_google(prompt, data)))
        
        if not tasks:
            logger.error("❌ No AI providers available!")
            return {}
        
        # Execute all tasks
        results = {}
        for provider, task in tasks:
            try:
                result = await task
                results[provider] = result
                logger.info(f"   ✅ {provider}: {len(result.content)} chars, ${result.cost_usd:.4f}")
            except Exception as e:
                logger.error(f"   ❌ {provider} failed: {e}")
        
        return results
    
    def create_consensus_analysis(self, ensemble_results: Dict[str, AIResponse]) -> Dict[str, Any]:
        """Create consensus from multiple AI responses"""
        
        if not ensemble_results:
            return {
                'consensus': 'No AI providers available',
                'confidence': 0.0,
                'total_cost': 0.0,
                'providers_used': 0
            }
        
        # Calculate metrics
        total_cost = sum(r.cost_usd for r in ensemble_results.values() if not r.error)
        avg_confidence = sum(r.confidence for r in ensemble_results.values() if not r.error) / len(ensemble_results)
        providers_used = len([r for r in ensemble_results.values() if not r.error])
        
        # Combine responses
        all_content = []
        for provider, response in ensemble_results.items():
            if not response.error:
                all_content.append(f"**{provider.upper()} Analysis:**\\n{response.content}")
        
        consensus = "\\n\\n".join(all_content)
        
        return {
            'consensus': consensus,
            'confidence': avg_confidence,
            'total_cost': total_cost,
            'providers_used': providers_used,
            'individual_responses': ensemble_results,
            'timestamp': datetime.now().isoformat()
        }

# Global instance
ai_integration = RealAIIntegration()

async def demo_ai_integration():
    """Demo the AI integration"""
    
    print("🤖 TESTING REAL AI INTEGRATION")
    print("=" * 50)
    
    # Test prompt
    prompt = "Analyze AAPL stock. Current price $227.76. Should I buy, sell, or hold?"
    
    # Sample market data
    data = {
        'ticker': 'AAPL',
        'current_price': 227.76,
        'daily_return': 0.002,
        'volatility': 0.017,
        'volume': 45000000,
        'market_cap': '3.5T'
    }
    
    # Run ensemble analysis
    results = await ai_integration.ensemble_analysis(prompt, data)
    
    # Create consensus
    consensus = ai_integration.create_consensus_analysis(results)
    
    print(f"\\n📊 RESULTS:")
    print(f"   Providers used: {consensus['providers_used']}")
    print(f"   Average confidence: {consensus['confidence']:.1%}")
    print(f"   Total cost: ${consensus['total_cost']:.4f}")
    
    print(f"\\n🎯 CONSENSUS ANALYSIS:")
    print(consensus['consensus'][:500] + "..." if len(consensus['consensus']) > 500 else consensus['consensus'])
    
    return consensus

if __name__ == "__main__":
    # Test the integration
    asyncio.run(demo_ai_integration())
