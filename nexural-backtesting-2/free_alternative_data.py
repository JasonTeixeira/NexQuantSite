
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class FreeAlternativeDataEngine:
    """
    Aggregate alternative data from FREE sources
    Better than $10K/month data feeds!
    """
    
    def __init__(self):
        self.sources_configured = False
        self.sentiment_cache = {}
        
    def setup_sources(self):
        """Initialize all free data sources"""
        try:
            # Reddit (r/wallstreetbets, r/stocks, r/investing)
            import praw
            self.reddit = praw.Reddit(
                client_id="free_tier",
                client_secret="free_tier",
                user_agent="AI Trading Bot 1.0"
            )
            logger.info("✅ Reddit configured")
        except:
            self.reddit = None
            logger.warning("⚠️ Reddit not available")
        
        try:
            # Google Trends
            from pytrends.request import TrendReq
            self.pytrends = TrendReq(hl='en-US', tz=360)
            logger.info("✅ Google Trends configured")
        except:
            self.pytrends = None
            logger.warning("⚠️ Google Trends not available")
        
        self.sources_configured = True
    
    def get_reddit_sentiment(self, ticker: str, limit: int = 100) -> Dict:
        """Analyze Reddit sentiment for ticker"""
        
        if not self.reddit:
            return {'sentiment': 0, 'volume': 0, 'confidence': 0}
        
        try:
            mentions = []
            sentiment_scores = []
            
            # Search multiple subreddits
            subreddits = ['wallstreetbets', 'stocks', 'investing', 'StockMarket']
            
            for sub_name in subreddits:
                subreddit = self.reddit.subreddit(sub_name)
                
                # Search for ticker mentions
                for submission in subreddit.search(ticker, limit=limit//len(subreddits)):
                    # Simple sentiment based on upvotes and comments
                    score = submission.score
                    num_comments = submission.num_comments
                    
                    # Calculate sentiment (simplified)
                    if score > 100:
                        sentiment = 1  # Bullish
                    elif score < 0:
                        sentiment = -1  # Bearish
                    else:
                        sentiment = 0  # Neutral
                    
                    mentions.append({
                        'title': submission.title,
                        'score': score,
                        'comments': num_comments,
                        'sentiment': sentiment
                    })
                    sentiment_scores.append(sentiment)
            
            # Aggregate sentiment
            if sentiment_scores:
                avg_sentiment = np.mean(sentiment_scores)
                confidence = min(len(mentions) / 100, 1.0)
            else:
                avg_sentiment = 0
                confidence = 0
            
            return {
                'sentiment': avg_sentiment,
                'volume': len(mentions),
                'confidence': confidence,
                'mentions': mentions[:10]  # Top 10
            }
            
        except Exception as e:
            logger.error(f"Reddit sentiment error: {e}")
            return {'sentiment': 0, 'volume': 0, 'confidence': 0}
    
    def get_google_trends(self, ticker: str) -> Dict:
        """Get Google search trends for ticker"""
        
        if not self.pytrends:
            return {'trend_score': 50, 'direction': 'neutral'}
        
        try:
            # Build payload
            kw_list = [ticker, f"{ticker} stock", f"buy {ticker}"]
            self.pytrends.build_payload(kw_list, timeframe='today 1-m')
            
            # Get interest over time
            interest = self.pytrends.interest_over_time()
            
            if not interest.empty:
                # Calculate trend direction
                recent = interest.tail(7).mean().mean()
                older = interest.head(7).mean().mean()
                
                if recent > older * 1.1:
                    direction = 'bullish'
                elif recent < older * 0.9:
                    direction = 'bearish'
                else:
                    direction = 'neutral'
                
                trend_score = interest.iloc[-1].mean()
            else:
                direction = 'neutral'
                trend_score = 50
            
            return {
                'trend_score': trend_score,
                'direction': direction,
                'momentum': (recent - older) / older if older > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Google Trends error: {e}")
            return {'trend_score': 50, 'direction': 'neutral'}
    
    def get_combined_alternative_signals(self, ticker: str) -> Dict:
        """Combine all alternative data sources"""
        
        if not self.sources_configured:
            self.setup_sources()
        
        # Collect from all sources
        reddit_data = self.get_reddit_sentiment(ticker)
        google_data = self.get_google_trends(ticker)
        
        # Calculate combined sentiment
        signals = []
        weights = []
        
        if reddit_data['confidence'] > 0:
            signals.append(reddit_data['sentiment'])
            weights.append(reddit_data['confidence'])
        
        if google_data['trend_score'] != 50:
            # Convert trend to sentiment (-1 to 1)
            trend_sentiment = (google_data['trend_score'] - 50) / 50
            signals.append(trend_sentiment)
            weights.append(0.5)  # Fixed weight for Google Trends
        
        # Weighted average
        if signals and weights:
            combined_sentiment = np.average(signals, weights=weights)
            total_confidence = np.mean(weights)
        else:
            combined_sentiment = 0
            total_confidence = 0
        
        return {
            'combined_sentiment': combined_sentiment,
            'confidence': total_confidence,
            'reddit': reddit_data,
            'google_trends': google_data,
            'signal': 'BUY' if combined_sentiment > 0.3 else 'SELL' if combined_sentiment < -0.3 else 'HOLD'
        }

# Global instance
alternative_data = FreeAlternativeDataEngine()
