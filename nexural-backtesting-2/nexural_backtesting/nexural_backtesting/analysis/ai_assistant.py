"""
AI Assistant using Claude for strategy analysis
"""

import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class AIAssistant:
    """
    AI-powered analysis using Claude
    """
    
    def __init__(self, api_key: str):
        """
        Initialize AI Assistant
        
        Args:
            api_key: Claude API key
        """
        self.api_key = api_key
        self.conversation_history = []
        
        logger.info("AI Assistant initialized")
    
    def analyze_backtest_results(self, results: Dict, strategy_params: Dict = None) -> str:
        """
        Analyze backtest results and provide insights
        
        Args:
            results: Backtest results dictionary
            strategy_params: Strategy parameters
            
        Returns:
            AI analysis as string
        """
        logger.info("Requesting AI analysis...")
        
        # Prepare prompt
        prompt = self._prepare_analysis_prompt(results, strategy_params)
        
        # Get AI response
        try:
            # Mock AI response for now (would use Claude API)
            analysis = self._generate_mock_analysis(results, strategy_params)
            
            # Store in history
            self.conversation_history.append({
                'type': 'backtest_analysis',
                'results': results['metrics'],
                'analysis': analysis
            })
            
            logger.info("✅ AI analysis complete")
            
            return analysis
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return "AI analysis unavailable"
    
    def _prepare_analysis_prompt(self, results: Dict, strategy_params: Dict) -> str:
        """Prepare prompt for AI analysis"""
        
        metrics = results.get('metrics', {})
        trades = results.get('trades', [])
        
        # Calculate additional statistics
        trade_stats = self._calculate_trade_statistics(trades)
        
        prompt = f"""
        Analyze these backtest results for a futures trading strategy:
        
        STRATEGY PARAMETERS:
        {json.dumps(strategy_params, indent=2) if strategy_params else 'Not provided'}
        
        PERFORMANCE METRICS:
        - Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.2f}
        - Total Return: {metrics.get('total_return', 0):.2f}%
        - Max Drawdown: {metrics.get('max_drawdown', 0):.2f}%
        - Win Rate: {metrics.get('win_rate', 0):.1f}%
        - Profit Factor: {metrics.get('profit_factor', 0):.2f}
        - Total Trades: {metrics.get('total_trades', 0)}
        
        EXECUTION QUALITY:
        - Average Slippage: {metrics.get('avg_slippage', 0):.2f} bps
        - Total Commission: ${metrics.get('total_commission', 0):.2f}
        
        TRADE STATISTICS:
        {json.dumps(trade_stats, indent=2)}
        
        Please provide:
        1. Overall assessment of the strategy
        2. Key strengths and weaknesses
        3. Specific parameter adjustments to improve performance
        4. Risk management recommendations
        5. Market conditions where this strategy would fail
        6. Whether this is ready for live trading
        
        Be specific and quantitative in your recommendations.
        """
        
        return prompt
    
    def _generate_mock_analysis(self, results: Dict, strategy_params: Dict) -> str:
        """Generate mock AI analysis for testing"""
        
        metrics = results.get('metrics', {})
        
        analysis = f"""
        🤖 AI ANALYSIS REPORT
        =====================
        
        OVERALL ASSESSMENT:
        The strategy shows {'strong' if metrics.get('sharpe_ratio', 0) > 1.0 else 'moderate'} performance 
        with a Sharpe ratio of {metrics.get('sharpe_ratio', 0):.2f}. 
        
        KEY STRENGTHS:
        - Win rate of {metrics.get('win_rate', 0):.1f}% indicates good signal quality
        - Profit factor of {metrics.get('profit_factor', 0):.2f} shows favorable risk/reward
        - Execution costs are reasonable at {metrics.get('avg_slippage', 0):.1f} bps average slippage
        
        AREAS FOR IMPROVEMENT:
        - Maximum drawdown of {metrics.get('max_drawdown', 0):.1f}% may be too high for some investors
        - Consider reducing position sizes during high volatility periods
        - Implement tighter stop-losses to reduce large losses
        
        PARAMETER OPTIMIZATION SUGGESTIONS:
        """
        
        if strategy_params:
            analysis += "\n"
            for param, value in strategy_params.items():
                if isinstance(value, (int, float)):
                    # Suggest parameter adjustments based on performance
                    if metrics.get('sharpe_ratio', 0) < 1.0:
                        analysis += f"- Consider reducing {param} from {value} to {value * 0.8:.2f}\n"
                    else:
                        analysis += f"- {param} = {value} appears well-tuned\n"
        
        analysis += f"""
        
        RISK MANAGEMENT RECOMMENDATIONS:
        - Set maximum position size to 2% of capital per trade
        - Implement daily loss limits of 1% of capital
        - Use dynamic position sizing based on volatility
        - Consider hedging during major economic events
        
        MARKET CONDITIONS ANALYSIS:
        - Strategy performs best in trending markets with moderate volatility
        - May struggle during high-frequency news events
        - Consider reducing exposure during FOMC meetings and earnings seasons
        
        LIVE TRADING READINESS:
        """
        
        if metrics.get('sharpe_ratio', 0) > 1.5 and metrics.get('max_drawdown', 0) < 10:
            analysis += "✅ Strategy appears ready for live trading with proper risk management"
        elif metrics.get('sharpe_ratio', 0) > 1.0 and metrics.get('max_drawdown', 0) < 15:
            analysis += "⚠️ Strategy shows promise but needs further optimization before live trading"
        else:
            analysis += "❌ Strategy needs significant improvement before live trading"
        
        return analysis
    
    def _calculate_trade_statistics(self, trades: List[Dict]) -> Dict:
        """Calculate additional trade statistics"""
        
        if not trades:
            return {}
        
        df = pd.DataFrame(trades)
        
        stats = {}
        
        # Time analysis
        if 'timestamp' in df.columns:
            df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
            hourly_performance = df.groupby('hour')['pnl'].mean()
            stats['best_hour'] = int(hourly_performance.idxmax()) if not hourly_performance.empty else None
            stats['worst_hour'] = int(hourly_performance.idxmin()) if not hourly_performance.empty else None
        
        # Consecutive wins/losses
        if 'pnl' in df.columns:
            df['win'] = df['pnl'] > 0
            stats['max_consecutive_wins'] = self._max_consecutive(df['win'].values, True)
            stats['max_consecutive_losses'] = self._max_consecutive(df['win'].values, False)
        
        # Trade duration
        stats['avg_trades_per_day'] = len(trades) / 252 if trades else 0
        
        return stats
    
    def _max_consecutive(self, arr: np.ndarray, value: bool) -> int:
        """Calculate maximum consecutive occurrences"""
        max_count = 0
        current_count = 0
        
        for item in arr:
            if item == value:
                current_count += 1
                max_count = max(max_count, current_count)
            else:
                current_count = 0
        
        return max_count
    
    def suggest_improvements(self, results: Dict, current_params: Dict) -> Dict:
        """
        Suggest parameter improvements based on results
        
        Args:
            results: Backtest results
            current_params: Current strategy parameters
            
        Returns:
            Dictionary with suggested improvements
        """
        logger.info("Generating parameter improvement suggestions...")
        
        # Mock suggestions based on performance
        suggestions = {}
        
        metrics = results.get('metrics', {})
        sharpe = metrics.get('sharpe_ratio', 0)
        drawdown = metrics.get('max_drawdown', 0)
        
        if current_params:
            for param, value in current_params.items():
                if isinstance(value, (int, float)):
                    # Suggest improvements based on performance
                    if sharpe < 1.0:
                        # Reduce parameters to be more conservative
                        suggestions[param] = value * 0.8
                    elif drawdown > 15:
                        # Reduce risk parameters
                        if 'threshold' in param.lower():
                            suggestions[param] = value * 1.2
                        elif 'size' in param.lower() or 'scale' in param.lower():
                            suggestions[param] = value * 0.7
                    else:
                        # Keep current values if performing well
                        suggestions[param] = value
        
        return suggestions
    
    def analyze_losing_trades(self, trades: List[Dict]) -> str:
        """
        Deep analysis of losing trades
        
        Args:
            trades: List of trade dictionaries
            
        Returns:
            Analysis of losing patterns
        """
        # Filter losing trades
        losing_trades = [t for t in trades if t.get('pnl', 0) < 0]
        
        if not losing_trades:
            return "No losing trades to analyze"
        
        analysis = f"""
        📊 LOSING TRADES ANALYSIS
        =========================
        
        Total losing trades: {len(losing_trades)}
        Average loss: ${np.mean([t['pnl'] for t in losing_trades]):.2f}
        Worst loss: ${min(t['pnl'] for t in losing_trades):.2f}
        
        COMMON PATTERNS IN LOSING TRADES:
        """
        
        # Analyze patterns
        if len(losing_trades) > 0:
            # Time of day analysis
            hours = [pd.to_datetime(t['timestamp']).hour for t in losing_trades if 'timestamp' in t]
            if hours:
                worst_hour = max(set(hours), key=hours.count)
                analysis += f"- Most losses occur around {worst_hour}:00\n"
            
            # Size analysis
            sizes = [t.get('size', 0) for t in losing_trades]
            if sizes:
                avg_size = np.mean(sizes)
                analysis += f"- Average losing trade size: {avg_size:.1f} contracts\n"
            
            # Slippage analysis
            slippages = [t.get('slippage_bps', 0) for t in losing_trades]
            if slippages:
                avg_slippage = np.mean(slippages)
                analysis += f"- Average slippage in losing trades: {avg_slippage:.2f} bps\n"
        
        analysis += """
        
        RECOMMENDATIONS:
        - Avoid trading during identified problematic hours
        - Reduce position sizes during high slippage periods
        - Implement tighter stop-losses for large positions
        - Consider market regime filters to avoid bad conditions
        """
        
        return analysis
    
    def get_strategy_optimization_advice(self, results: Dict, strategy_type: str) -> str:
        """
        Get strategy-specific optimization advice
        
        Args:
            results: Backtest results
            strategy_type: Type of strategy
            
        Returns:
            Optimization advice
        """
        metrics = results.get('metrics', {})
        
        advice = f"""
        🎯 STRATEGY OPTIMIZATION ADVICE
        ===============================
        
        Strategy Type: {strategy_type}
        Current Sharpe: {metrics.get('sharpe_ratio', 0):.2f}
        Current Drawdown: {metrics.get('max_drawdown', 0):.1f}%
        
        """
        
        if strategy_type.lower() == 'microstructure':
            advice += """
        MICROSTRUCTURE STRATEGY OPTIMIZATION:
        - Fine-tune imbalance threshold based on market conditions
        - Adjust spread filters for different volatility regimes
        - Consider time-of-day filters for better execution
        - Implement volume-weighted position sizing
        """
        elif strategy_type.lower() == 'momentum':
            advice += """
        MOMENTUM STRATEGY OPTIMIZATION:
        - Optimize lookback periods for different timeframes
        - Add volatility filters to avoid false signals
        - Consider regime detection for adaptive parameters
        - Implement trend strength indicators
        """
        else:
            advice += """
        GENERAL OPTIMIZATION:
        - Test parameter sensitivity across different market conditions
        - Implement dynamic position sizing based on volatility
        - Add market regime filters
        - Consider multi-timeframe analysis
        """
        
        return advice 