
import numpy as np
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict, List, Optional
import logging

class AdvancedSentimentAnalyzer:
    """
    Advanced sentiment analysis for financial markets
    Analyzes news, social media, and earnings calls
    """
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        self.financial_keywords = {
            'bullish': ['growth', 'profit', 'revenue', 'beat', 'strong', 'positive'],
            'bearish': ['loss', 'decline', 'weak', 'miss', 'negative', 'concern']
        }
    
    def analyze_financial_text(self, text: str) -> Dict[str, float]:
        """Analyze financial sentiment with market context"""
        
        # Basic sentiment
        scores = self.analyzer.polarity_scores(text)
        
        # Financial keyword weighting
        bullish_score = sum(1 for word in self.financial_keywords['bullish'] 
                           if word.lower() in text.lower()) / len(self.financial_keywords['bullish'])
        
        bearish_score = sum(1 for word in self.financial_keywords['bearish'] 
                           if word.lower() in text.lower()) / len(self.financial_keywords['bearish'])
        
        # Combined financial sentiment
        financial_sentiment = bullish_score - bearish_score
        
        # Final score (weighted combination)
        final_sentiment = (scores['compound'] * 0.7) + (financial_sentiment * 0.3)
        
        return {
            'sentiment_score': final_sentiment,
            'confidence': abs(final_sentiment),
            'bullish_keywords': bullish_score,
            'bearish_keywords': bearish_score,
            'raw_scores': scores
        }
    
    def analyze_news_batch(self, news_articles: List[str]) -> Dict[str, float]:
        """Analyze multiple news articles for market sentiment"""
        
        if not news_articles:
            return {'overall_sentiment': 0.0, 'confidence': 0.0, 'article_count': 0}
        
        sentiments = []
        confidences = []
        
        for article in news_articles:
            result = self.analyze_financial_text(article)
            sentiments.append(result['sentiment_score'])
            confidences.append(result['confidence'])
        
        # Weighted average by confidence
        if confidences and sum(confidences) > 0:
            weighted_sentiment = sum(s * c for s, c in zip(sentiments, confidences)) / sum(confidences)
        else:
            weighted_sentiment = np.mean(sentiments) if sentiments else 0.0
        
        return {
            'overall_sentiment': weighted_sentiment,
            'confidence': np.mean(confidences) if confidences else 0.0,
            'article_count': len(news_articles),
            'sentiment_distribution': {
                'positive': sum(1 for s in sentiments if s > 0.1),
                'neutral': sum(1 for s in sentiments if -0.1 <= s <= 0.1),
                'negative': sum(1 for s in sentiments if s < -0.1)
            }
        }

# Global instance for easy use
sentiment_analyzer = AdvancedSentimentAnalyzer()
