"""
AI Ensemble System for Nexural Testing Engine
Multi-AI integration with OpenAI GPT and Claude for enhanced strategy analysis
"""

import os
import logging
from typing import Dict, List, Optional, Any
import json
import asyncio
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    # Load .env file from project root
    env_path = Path(__file__).parent.parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    logger = logging.getLogger(__name__)
    logger.info(f"✅ Environment variables loaded from {env_path}")
except ImportError:
    logger = logging.getLogger(__name__)
    logger.warning("⚠️ python-dotenv not installed. Install with: pip install python-dotenv")

logger = logging.getLogger(__name__)

class AIProvider(Enum):
    """AI Provider types"""
    OPENAI = "openai"
    CLAUDE = "claude"
    ENSEMBLE = "ensemble"

@dataclass
class AIResponse:
    """AI Response structure"""
    provider: str
    content: str
    confidence: float
    tokens_used: int
    processing_time: float
    success: bool
    error_message: Optional[str] = None

class OpenAIClient:
    """OpenAI GPT Client"""
    
    def __init__(self, api_key: str):
        """Initialize OpenAI client"""
        self.api_key = api_key
        self.model = "gpt-4-turbo-preview"
        
        try:
            import openai
            self.client = openai.OpenAI(api_key=api_key)
            logger.info("✅ OpenAI client initialized")
        except ImportError:
            logger.error("❌ OpenAI package not installed. Run: pip install openai")
            self.client = None
        except Exception as e:
            logger.error(f"❌ OpenAI client initialization failed: {e}")
            self.client = None
    
    async def analyze_strategy(self, prompt: str, data_context: Dict = None) -> AIResponse:
        """Analyze strategy using OpenAI GPT"""
        if not self.client:
            return AIResponse(
                provider="openai",
                content="OpenAI client not available",
                confidence=0.0,
                tokens_used=0,
                processing_time=0.0,
                success=False,
                error_message="Client not initialized"
            )
        
        try:
            import time
            start_time = time.time()
            
            # Enhance prompt with data context
            enhanced_prompt = self._enhance_prompt(prompt, data_context)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert quantitative analyst and algorithmic trading specialist. 
                        You help analyze trading strategies, market data, and provide actionable insights for 
                        the Nexural Testing Engine. Focus on practical, data-driven recommendations."""
                    },
                    {
                        "role": "user",
                        "content": enhanced_prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            processing_time = time.time() - start_time
            
            return AIResponse(
                provider="openai",
                content=response.choices[0].message.content,
                confidence=0.85,  # GPT-4 generally high confidence
                tokens_used=response.usage.total_tokens,
                processing_time=processing_time,
                success=True
            )
            
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {e}")
            return AIResponse(
                provider="openai",
                content=f"Analysis failed: {str(e)}",
                confidence=0.0,
                tokens_used=0,
                processing_time=0.0,
                success=False,
                error_message=str(e)
            )
    
    def _enhance_prompt(self, prompt: str, data_context: Dict = None) -> str:
        """Enhance prompt with data context"""
        enhanced = f"""
NEXURAL TESTING ENGINE - STRATEGY ANALYSIS REQUEST

User Query: {prompt}

"""
        
        if data_context:
            enhanced += "MARKET DATA CONTEXT:\n"
            if 'symbol' in data_context:
                enhanced += f"Symbol: {data_context['symbol']}\n"
            if 'date_range' in data_context:
                enhanced += f"Date Range: {data_context['date_range']}\n"
            if 'metrics' in data_context:
                metrics = data_context['metrics']
                enhanced += f"Current Performance:\n"
                enhanced += f"- Total Return: {metrics.get('total_return', 0):.2%}\n"
                enhanced += f"- Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.2f}\n"
                enhanced += f"- Max Drawdown: {metrics.get('max_drawdown', 0):.2%}\n"
                enhanced += f"- Win Rate: {metrics.get('win_rate', 0):.1%}\n"
            enhanced += "\n"
        
        enhanced += """
Please provide:
1. Analysis of the current situation
2. Specific actionable recommendations
3. Risk considerations
4. Implementation suggestions
5. Expected outcomes

Format your response professionally for a trading system interface.
"""
        
        return enhanced

class ClaudeClient:
    """Claude AI Client"""
    
    def __init__(self, api_key: str):
        """Initialize Claude client"""
        self.api_key = api_key
        self.model = "claude-3-opus-20240229"
        
        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=api_key)
            logger.info("✅ Claude client initialized")
        except ImportError:
            logger.error("❌ Anthropic package not installed. Run: pip install anthropic")
            self.client = None
        except Exception as e:
            logger.error(f"❌ Claude client initialization failed: {e}")
            self.client = None
    
    async def analyze_strategy(self, prompt: str, data_context: Dict = None) -> AIResponse:
        """Analyze strategy using Claude"""
        if not self.client:
            return AIResponse(
                provider="claude",
                content="Claude client not available",
                confidence=0.0,
                tokens_used=0,
                processing_time=0.0,
                success=False,
                error_message="Client not initialized"
            )
        
        try:
            import time
            start_time = time.time()
            
            # Enhance prompt with data context
            enhanced_prompt = self._enhance_prompt(prompt, data_context)
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.7,
                system="""You are an expert quantitative analyst specializing in algorithmic trading 
                and risk management. You work with the Nexural Testing Engine to provide deep insights 
                into trading strategies, market dynamics, and risk optimization. Your analysis should be 
                precise, actionable, and focused on improving trading performance.""",
                messages=[
                    {
                        "role": "user",
                        "content": enhanced_prompt
                    }
                ]
            )
            
            processing_time = time.time() - start_time
            
            return AIResponse(
                provider="claude",
                content=response.content[0].text,
                confidence=0.90,  # Claude generally very high confidence
                tokens_used=response.usage.input_tokens + response.usage.output_tokens,
                processing_time=processing_time,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Claude analysis failed: {e}")
            return AIResponse(
                provider="claude",
                content=f"Analysis failed: {str(e)}",
                confidence=0.0,
                tokens_used=0,
                processing_time=0.0,
                success=False,
                error_message=str(e)
            )
    
    def _enhance_prompt(self, prompt: str, data_context: Dict = None) -> str:
        """Enhance prompt with data context"""
        enhanced = f"""
NEXURAL TESTING ENGINE - ADVANCED STRATEGY ANALYSIS

User Request: {prompt}

"""
        
        if data_context:
            enhanced += "TRADING CONTEXT:\n"
            if 'symbol' in data_context:
                enhanced += f"Instrument: {data_context['symbol']}\n"
            if 'date_range' in data_context:
                enhanced += f"Analysis Period: {data_context['date_range']}\n"
            if 'strategy_type' in data_context:
                enhanced += f"Strategy Type: {data_context['strategy_type']}\n"
            if 'metrics' in data_context:
                metrics = data_context['metrics']
                enhanced += f"\nCurrent Performance Metrics:\n"
                enhanced += f"• Total Return: {metrics.get('total_return', 0):.2%}\n"
                enhanced += f"• Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.2f}\n"
                enhanced += f"• Maximum Drawdown: {metrics.get('max_drawdown', 0):.2%}\n"
                enhanced += f"• Win Rate: {metrics.get('win_rate', 0):.1%}\n"
                enhanced += f"• Profit Factor: {metrics.get('profit_factor', 0):.2f}\n"
            enhanced += "\n"
        
        enhanced += """
Please provide comprehensive analysis including:

📊 PERFORMANCE ANALYSIS:
- Strengths and weaknesses of current approach
- Statistical significance of results
- Risk-adjusted performance evaluation

🎯 OPTIMIZATION RECOMMENDATIONS:
- Specific parameter adjustments
- Strategy enhancement suggestions
- Risk management improvements

⚠️ RISK ASSESSMENT:
- Potential failure modes
- Market condition sensitivities
- Downside protection strategies

🚀 IMPLEMENTATION GUIDANCE:
- Step-by-step improvement plan
- Expected impact quantification
- Monitoring recommendations

Format your response for professional trading system interface.
"""
        
        return enhanced

class AIEnsemble:
    """AI Ensemble System combining multiple AI providers"""
    
    def __init__(self):
        """Initialize AI Ensemble"""
        self.openai_client = None
        self.claude_client = None
        
        # Initialize clients based on available API keys
        openai_key = os.getenv('OPENAI_API_KEY')
        claude_key = os.getenv('CLAUDE_API_KEY')
        
        if openai_key and not openai_key.startswith('your_'):
            self.openai_client = OpenAIClient(openai_key)
        
        if claude_key and not claude_key.startswith('your_'):
            self.claude_client = ClaudeClient(claude_key)
        
        self.available_providers = []
        if self.openai_client and self.openai_client.client:
            self.available_providers.append(AIProvider.OPENAI)
        if self.claude_client and self.claude_client.client:
            self.available_providers.append(AIProvider.CLAUDE)
        
        logger.info(f"✅ AI Ensemble initialized with providers: {[p.value for p in self.available_providers]}")
    
    async def analyze_with_ensemble(self, prompt: str, data_context: Dict = None, 
                                   provider: AIProvider = AIProvider.ENSEMBLE) -> List[AIResponse]:
        """Analyze using ensemble of AI providers"""
        
        if provider == AIProvider.OPENAI and AIProvider.OPENAI in self.available_providers:
            response = await self.openai_client.analyze_strategy(prompt, data_context)
            return [response]
        
        elif provider == AIProvider.CLAUDE and AIProvider.CLAUDE in self.available_providers:
            response = await self.claude_client.analyze_strategy(prompt, data_context)
            return [response]
        
        elif provider == AIProvider.ENSEMBLE:
            # Run both providers in parallel
            tasks = []
            
            if AIProvider.OPENAI in self.available_providers:
                tasks.append(self.openai_client.analyze_strategy(prompt, data_context))
            
            if AIProvider.CLAUDE in self.available_providers:
                tasks.append(self.claude_client.analyze_strategy(prompt, data_context))
            
            if not tasks:
                return [AIResponse(
                    provider="ensemble",
                    content="No AI providers available. Please check API keys.",
                    confidence=0.0,
                    tokens_used=0,
                    processing_time=0.0,
                    success=False,
                    error_message="No providers configured"
                )]
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return valid responses
            valid_responses = []
            for response in responses:
                if isinstance(response, AIResponse):
                    valid_responses.append(response)
                elif isinstance(response, Exception):
                    logger.error(f"AI provider error: {response}")
            
            return valid_responses
        
        else:
            return [AIResponse(
                provider="unknown",
                content="Invalid provider specified",
                confidence=0.0,
                tokens_used=0,
                processing_time=0.0,
                success=False,
                error_message="Invalid provider"
            )]
    
    def get_consensus_analysis(self, responses: List[AIResponse]) -> str:
        """Generate consensus analysis from multiple AI responses"""
        if not responses:
            return "No AI responses available for consensus analysis."
        
        successful_responses = [r for r in responses if r.success]
        
        if not successful_responses:
            return "All AI providers failed to generate analysis."
        
        if len(successful_responses) == 1:
            return successful_responses[0].content
        
        # Generate consensus from multiple responses
        consensus = f"""
🤖 NEXURAL AI ENSEMBLE ANALYSIS
{'='*60}

📊 MULTI-AI CONSENSUS REPORT
Providers: {', '.join([r.provider.upper() for r in successful_responses])}
Average Confidence: {sum(r.confidence for r in successful_responses) / len(successful_responses):.1%}
Total Tokens Used: {sum(r.tokens_used for r in successful_responses)}

"""
        
        for i, response in enumerate(successful_responses, 1):
            consensus += f"""
🔍 ANALYSIS {i} - {response.provider.upper()}
Confidence: {response.confidence:.1%} | Tokens: {response.tokens_used} | Time: {response.processing_time:.2f}s
{'-' * 50}
{response.content}

"""
        
        consensus += f"""
{'='*60}
✅ Multi-AI analysis complete. Review all perspectives above for comprehensive insights.
        """
        
        return consensus
    
    def is_available(self) -> bool:
        """Check if any AI providers are available"""
        return len(self.available_providers) > 0
    
    def get_available_providers(self) -> List[str]:
        """Get list of available AI providers"""
        return [provider.value for provider in self.available_providers]

# Global AI ensemble instance
ai_ensemble = AIEnsemble()