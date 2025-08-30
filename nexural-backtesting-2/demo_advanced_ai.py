#!/usr/bin/env python3
"""
Advanced AI Demo - Test Your Upgraded System
============================================
Demonstrates your enhanced institutional-grade AI capabilities
"""

import pandas as pd
import numpy as np
import yfinance as yf
from advanced_sentiment_analyzer import sentiment_analyzer
from advanced_ensemble_predictor import ensemble_predictor
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def demo_advanced_ai():
    """Demonstrate advanced AI capabilities"""
    
    logger.info("🧠 ADVANCED AI DEMONSTRATION")
    logger.info("=" * 50)
    
    # 1. Get market data
    logger.info("📈 Fetching market data...")
    ticker = "AAPL"
    data = yf.download(ticker, period="1y", interval="1d")
    
    if data.empty:
        logger.error("Failed to fetch data")
        return
    
    logger.info(f"✅ Downloaded {len(data)} days of {ticker} data")
    
    # 2. Advanced Sentiment Analysis Demo
    logger.info("\\n🎭 ADVANCED SENTIMENT ANALYSIS")
    logger.info("-" * 35)
    
    sample_news = [
        f"{ticker} reports strong quarterly earnings beat expectations",
        f"{ticker} stock rises on positive analyst upgrade",
        f"Market concerns over {ticker} supply chain issues",
        f"{ticker} announces major product launch next quarter"
    ]
    
    sentiment_result = sentiment_analyzer.analyze_news_batch(sample_news)
    
    logger.info(f"📰 Analyzed {sentiment_result['article_count']} news articles")
    logger.info(f"🎯 Overall Sentiment: {sentiment_result['overall_sentiment']:.3f}")
    logger.info(f"🎪 Confidence Level: {sentiment_result['confidence']:.3f}")
    logger.info(f"📊 Distribution: {sentiment_result['sentiment_distribution']}")
    
    # 3. Advanced ML Ensemble Demo
    logger.info("\\n🤖 ADVANCED ML ENSEMBLE PREDICTION")
    logger.info("-" * 40)
    
    # Prepare data for training  
    data_clean = data.copy()
    
    # Handle MultiIndex columns from yfinance
    if isinstance(data_clean.columns, pd.MultiIndex):
        data_clean.columns = [col[0] if isinstance(col, tuple) else col for col in data_clean.columns]
    
    data_clean.columns = [col.lower() for col in data_clean.columns]
    data_clean = data_clean.reset_index()
    
    # Train the ensemble
    training_result = ensemble_predictor.train_ensemble(data_clean)
    
    if training_result['status'] == 'success':
        logger.info(f"🏆 Training completed successfully!")
        logger.info(f"📊 Ensemble R² Score: {training_result['ensemble_score']:.3f}")
        logger.info(f"🎯 Training samples: {training_result['training_samples']}")
        
        # Show individual model performance
        logger.info("\\n📈 INDIVIDUAL MODEL PERFORMANCE:")
        for model_name, score in training_result['model_scores'].items():
            weight = training_result['model_weights'][model_name]
            logger.info(f"   {model_name}: R² = {score:.3f}, Weight = {weight:.3f}")
        
        # Make prediction
        prediction_result = ensemble_predictor.predict(data_clean)
        
        logger.info("\\n🔮 LATEST PREDICTION:")
        logger.info(f"📈 Expected Return: {prediction_result['ensemble_prediction']:.4f} ({prediction_result['ensemble_prediction']*100:.2f}%)")
        logger.info(f"🚦 Trading Signal: {prediction_result['trading_signal']}")
        logger.info(f"💪 Signal Strength: {prediction_result['signal_strength']:.1f}%")
        
        # 4. Combined AI Analysis
        logger.info("\\n🧠 COMBINED AI ANALYSIS")
        logger.info("-" * 30)
        
        # Combine sentiment and ML prediction
        sentiment_score = sentiment_result['overall_sentiment']
        price_prediction = prediction_result['ensemble_prediction']
        
        # Enhanced signal combining both
        if sentiment_score > 0.1 and price_prediction > 0.01:
            combined_signal = "STRONG BUY"
            confidence = (sentiment_result['confidence'] + abs(prediction_result['ensemble_prediction'])) / 2
        elif sentiment_score < -0.1 and price_prediction < -0.01:
            combined_signal = "STRONG SELL"  
            confidence = (sentiment_result['confidence'] + abs(prediction_result['ensemble_prediction'])) / 2
        elif abs(sentiment_score) < 0.1 and abs(price_prediction) < 0.01:
            combined_signal = "NEUTRAL"
            confidence = 0.5
        else:
            combined_signal = "MIXED SIGNALS"
            confidence = 0.3
        
        logger.info(f"🎯 FINAL RECOMMENDATION: {combined_signal}")
        logger.info(f"🎪 Overall Confidence: {confidence:.3f}")
        logger.info(f"📊 Sentiment Score: {sentiment_score:.3f}")
        logger.info(f"📈 Price Prediction: {price_prediction:.4f}")
        
        # 5. Performance Summary
        logger.info("\\n🏆 AI SYSTEM PERFORMANCE SUMMARY")
        logger.info("-" * 40)
        
        # Calculate overall AI score
        model_quality = min(training_result['ensemble_score'] * 10, 10)  # 0-10 scale
        sentiment_quality = sentiment_result['confidence'] * 10  # 0-10 scale
        data_quality = min(len(data) / 100, 10)  # 0-10 scale based on data points
        
        overall_ai_score = (model_quality + sentiment_quality + data_quality) / 3
        
        logger.info(f"📊 Model Quality Score: {model_quality:.1f}/10")
        logger.info(f"🎭 Sentiment Analysis Score: {sentiment_quality:.1f}/10")  
        logger.info(f"📈 Data Quality Score: {data_quality:.1f}/10")
        logger.info(f"🏆 OVERALL AI SCORE: {overall_ai_score:.1f}/10")
        
        # Grade the system
        if overall_ai_score >= 8.5:
            grade = "A+ (Institutional Grade)"
            pricing = "$1000-5000/month"
        elif overall_ai_score >= 7.5:
            grade = "A (Professional Grade)"
            pricing = "$500-1000/month"
        elif overall_ai_score >= 6.5:
            grade = "B+ (Advanced Retail)"
            pricing = "$200-500/month"
        elif overall_ai_score >= 5.5:
            grade = "B (Standard)"
            pricing = "$50-200/month"
        else:
            grade = "C (Basic)"
            pricing = "$20-50/month"
        
        logger.info(f"🎓 AI SYSTEM GRADE: {grade}")
        logger.info(f"💰 SUGGESTED PRICING: {pricing}")
        
    else:
        logger.error("Training failed")
        return
    
    logger.info("\\n" + "=" * 50)
    logger.info("🎉 ADVANCED AI DEMONSTRATION COMPLETE")
    logger.info("Your system now has cutting-edge AI capabilities!")
    logger.info("=" * 50)
    
    return {
        'ai_score': overall_ai_score,
        'grade': grade,
        'pricing': pricing,
        'sentiment_result': sentiment_result,
        'prediction_result': prediction_result,
        'training_result': training_result
    }

if __name__ == "__main__":
    results = demo_advanced_ai()
