"""
Professional Strategy Evaluation Framework
Comprehensive scoring system for MBP10 strategies
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')


@dataclass
class StrategyResults:
    """Container for strategy backtest results"""
    returns: np.ndarray
    trades: pd.DataFrame
    equity_curve: np.ndarray
    timestamps: pd.DatetimeIndex
    positions: Optional[np.ndarray] = None
    signals: Optional[np.ndarray] = None
    

class StrategyEvaluator:
    """
    Professional strategy evaluation with 0-100 scoring system
    """
    
    def __init__(self, results: StrategyResults):
        self.results = results
        self.metrics = {}
        
    def calculate_sharpe_ratio(self, risk_free_rate: float = 0.04) -> float:
        """Calculate annualized Sharpe ratio"""
        returns = self.results.returns
        excess_returns = returns - risk_free_rate/252  # Daily risk-free rate
        
        if len(excess_returns) == 0 or np.std(excess_returns) == 0:
            return 0.0
            
        sharpe = np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)
        return sharpe
    
    def calculate_sortino_ratio(self, risk_free_rate: float = 0.04) -> float:
        """Calculate Sortino ratio (downside deviation)"""
        returns = self.results.returns
        excess_returns = returns - risk_free_rate/252
        
        downside_returns = excess_returns[excess_returns < 0]
        if len(downside_returns) == 0:
            return 10.0  # No downside risk
            
        downside_std = np.std(downside_returns)
        if downside_std == 0:
            return 10.0
            
        sortino = np.mean(excess_returns) / downside_std * np.sqrt(252)
        return sortino
    
    def calculate_calmar_ratio(self) -> float:
        """Calculate Calmar ratio (return / max drawdown)"""
        annual_return = self.calculate_annual_return()
        max_dd = self.calculate_max_drawdown()
        
        if max_dd == 0:
            return 10.0
            
        calmar = annual_return / abs(max_dd)
        return calmar
    
    def calculate_annual_return(self) -> float:
        """Calculate annualized return"""
        equity = self.results.equity_curve
        if len(equity) < 2:
            return 0.0
            
        total_return = (equity[-1] / equity[0]) - 1
        
        # Calculate time period in years
        time_diff = self.results.timestamps[-1] - self.results.timestamps[0]
        years = time_diff.days / 365.25
        
        if years == 0:
            return total_return
            
        annual_return = (1 + total_return) ** (1/years) - 1
        return annual_return
    
    def calculate_max_drawdown(self) -> float:
        """Calculate maximum drawdown"""
        equity = self.results.equity_curve
        
        if len(equity) < 2:
            return 0.0
            
        # Calculate running maximum
        running_max = np.maximum.accumulate(equity)
        
        # Calculate drawdown
        drawdown = (equity - running_max) / running_max
        
        return np.min(drawdown)
    
    def calculate_win_rate(self) -> float:
        """Calculate win rate of trades"""
        trades = self.results.trades
        
        if len(trades) == 0:
            return 0.0
            
        if 'pnl' in trades.columns:
            wins = len(trades[trades['pnl'] > 0])
        elif 'return' in trades.columns:
            wins = len(trades[trades['return'] > 0])
        else:
            return 0.5  # Default
            
        win_rate = wins / len(trades)
        return win_rate
    
    def calculate_profit_factor(self) -> float:
        """Calculate profit factor (gross profit / gross loss)"""
        trades = self.results.trades
        
        if len(trades) == 0:
            return 1.0
            
        if 'pnl' in trades.columns:
            gross_profit = trades[trades['pnl'] > 0]['pnl'].sum()
            gross_loss = abs(trades[trades['pnl'] < 0]['pnl'].sum())
        elif 'return' in trades.columns:
            gross_profit = trades[trades['return'] > 0]['return'].sum()
            gross_loss = abs(trades[trades['return'] < 0]['return'].sum())
        else:
            return 1.0
            
        if gross_loss == 0:
            return 10.0  # No losses
            
        profit_factor = gross_profit / gross_loss
        return profit_factor
    
    def calculate_recovery_factor(self) -> float:
        """Calculate recovery factor (total return / max drawdown)"""
        equity = self.results.equity_curve
        
        if len(equity) < 2:
            return 0.0
            
        total_return = equity[-1] - equity[0]
        max_dd_value = abs(self.calculate_max_drawdown() * equity[0])
        
        if max_dd_value == 0:
            return 10.0
            
        recovery = total_return / max_dd_value
        return recovery
    
    def calculate_expectancy(self) -> float:
        """Calculate trade expectancy"""
        trades = self.results.trades
        
        if len(trades) == 0:
            return 0.0
            
        if 'pnl' in trades.columns:
            expectancy = trades['pnl'].mean()
        elif 'return' in trades.columns:
            expectancy = trades['return'].mean()
        else:
            expectancy = 0.0
            
        return expectancy
    
    def calculate_tail_ratio(self) -> float:
        """Calculate tail ratio (95th percentile gain / 95th percentile loss)"""
        returns = self.results.returns
        
        if len(returns) < 100:
            return 1.0
            
        gains = returns[returns > 0]
        losses = abs(returns[returns < 0])
        
        if len(gains) < 10 or len(losses) < 10:
            return 1.0
            
        tail_gain = np.percentile(gains, 95)
        tail_loss = np.percentile(losses, 95)
        
        if tail_loss == 0:
            return 10.0
            
        tail_ratio = tail_gain / tail_loss
        return tail_ratio
    
    def calculate_stability(self) -> float:
        """Calculate strategy stability (R-squared of equity curve)"""
        equity = self.results.equity_curve
        
        if len(equity) < 10:
            return 0.0
            
        # Fit linear regression
        x = np.arange(len(equity))
        
        # Calculate R-squared
        correlation = np.corrcoef(x, equity)[0, 1]
        r_squared = correlation ** 2
        
        return r_squared
    
    def calculate_score(self) -> float:
        """
        Calculate comprehensive strategy score (0-100)
        Based on multiple weighted factors
        """
        
        # Calculate all metrics
        metrics = {
            'sharpe_ratio': self.calculate_sharpe_ratio(),
            'sortino_ratio': self.calculate_sortino_ratio(),
            'calmar_ratio': self.calculate_calmar_ratio(),
            'annual_return': self.calculate_annual_return(),
            'max_drawdown': self.calculate_max_drawdown(),
            'win_rate': self.calculate_win_rate(),
            'profit_factor': self.calculate_profit_factor(),
            'recovery_factor': self.calculate_recovery_factor(),
            'expectancy': self.calculate_expectancy(),
            'tail_ratio': self.calculate_tail_ratio(),
            'stability': self.calculate_stability(),
            'total_trades': len(self.results.trades)
        }
        
        self.metrics = metrics
        
        # Scoring weights
        weights = {
            'sharpe_ratio': 0.20,
            'sortino_ratio': 0.10,
            'calmar_ratio': 0.10,
            'annual_return': 0.15,
            'max_drawdown': 0.15,
            'win_rate': 0.05,
            'profit_factor': 0.05,
            'recovery_factor': 0.05,
            'stability': 0.10,
            'trade_frequency': 0.05
        }
        
        score = 0.0
        
        # Sharpe ratio scoring (0-20 points)
        if metrics['sharpe_ratio'] >= 3:
            score += weights['sharpe_ratio'] * 100
        elif metrics['sharpe_ratio'] >= 2:
            score += weights['sharpe_ratio'] * 85
        elif metrics['sharpe_ratio'] >= 1.5:
            score += weights['sharpe_ratio'] * 70
        elif metrics['sharpe_ratio'] >= 1:
            score += weights['sharpe_ratio'] * 55
        elif metrics['sharpe_ratio'] >= 0.5:
            score += weights['sharpe_ratio'] * 40
        else:
            score += weights['sharpe_ratio'] * max(0, metrics['sharpe_ratio'] * 40)
        
        # Sortino ratio scoring (0-10 points)
        if metrics['sortino_ratio'] >= 4:
            score += weights['sortino_ratio'] * 100
        elif metrics['sortino_ratio'] >= 2.5:
            score += weights['sortino_ratio'] * 80
        elif metrics['sortino_ratio'] >= 1.5:
            score += weights['sortino_ratio'] * 60
        else:
            score += weights['sortino_ratio'] * max(0, metrics['sortino_ratio'] * 30)
        
        # Calmar ratio scoring (0-10 points)
        if metrics['calmar_ratio'] >= 3:
            score += weights['calmar_ratio'] * 100
        elif metrics['calmar_ratio'] >= 2:
            score += weights['calmar_ratio'] * 80
        elif metrics['calmar_ratio'] >= 1:
            score += weights['calmar_ratio'] * 60
        else:
            score += weights['calmar_ratio'] * max(0, metrics['calmar_ratio'] * 40)
        
        # Annual return scoring (0-15 points)
        if metrics['annual_return'] >= 0.50:  # 50%+
            score += weights['annual_return'] * 100
        elif metrics['annual_return'] >= 0.30:  # 30%+
            score += weights['annual_return'] * 80
        elif metrics['annual_return'] >= 0.15:  # 15%+
            score += weights['annual_return'] * 60
        elif metrics['annual_return'] >= 0.05:  # 5%+
            score += weights['annual_return'] * 40
        else:
            score += weights['annual_return'] * max(0, metrics['annual_return'] * 200)
        
        # Max drawdown scoring (0-15 points)
        if metrics['max_drawdown'] >= -0.10:  # Less than 10%
            score += weights['max_drawdown'] * 100
        elif metrics['max_drawdown'] >= -0.20:  # Less than 20%
            score += weights['max_drawdown'] * 70
        elif metrics['max_drawdown'] >= -0.30:  # Less than 30%
            score += weights['max_drawdown'] * 40
        else:
            score += weights['max_drawdown'] * max(0, (1 + metrics['max_drawdown']) * 40)
        
        # Win rate scoring (0-5 points)
        if metrics['win_rate'] >= 0.60:
            score += weights['win_rate'] * 100
        elif metrics['win_rate'] >= 0.50:
            score += weights['win_rate'] * 70
        else:
            score += weights['win_rate'] * (metrics['win_rate'] * 100)
        
        # Profit factor scoring (0-5 points)
        if metrics['profit_factor'] >= 2:
            score += weights['profit_factor'] * 100
        elif metrics['profit_factor'] >= 1.5:
            score += weights['profit_factor'] * 70
        elif metrics['profit_factor'] >= 1.2:
            score += weights['profit_factor'] * 50
        else:
            score += weights['profit_factor'] * max(0, (metrics['profit_factor'] - 1) * 100)
        
        # Recovery factor scoring (0-5 points)
        if metrics['recovery_factor'] >= 5:
            score += weights['recovery_factor'] * 100
        elif metrics['recovery_factor'] >= 3:
            score += weights['recovery_factor'] * 70
        elif metrics['recovery_factor'] >= 1:
            score += weights['recovery_factor'] * 40
        else:
            score += weights['recovery_factor'] * max(0, metrics['recovery_factor'] * 20)
        
        # Stability scoring (0-10 points)
        score += weights['stability'] * (metrics['stability'] * 100)
        
        # Trade frequency scoring (0-5 points)
        if 50 <= metrics['total_trades'] <= 500:
            score += weights['trade_frequency'] * 100
        elif 20 <= metrics['total_trades'] < 50:
            score += weights['trade_frequency'] * 70
        elif metrics['total_trades'] > 500:
            score += weights['trade_frequency'] * 60
        else:
            score += weights['trade_frequency'] * 30
        
        return min(100, max(0, score))
    
    def evaluate_complete(self) -> Dict[str, Any]:
        """
        Run complete evaluation and return all metrics
        """
        score = self.calculate_score()
        
        evaluation = {
            'score': score,
            'metrics': self.metrics,
            'summary': {
                'score': score,
                'sharpe_ratio': self.metrics['sharpe_ratio'],
                'annual_return': self.metrics['annual_return'],
                'max_drawdown': self.metrics['max_drawdown'],
                'win_rate': self.metrics['win_rate'],
                'profit_factor': self.metrics['profit_factor'],
                'total_trades': self.metrics['total_trades'],
                'expectancy': self.metrics['expectancy'],
                'stability': self.metrics['stability']
            },
            'grade': self._get_grade(score),
            'recommendation': self._get_recommendation(score)
        }
        
        return evaluation
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'A-'
        elif score >= 75:
            return 'B+'
        elif score >= 70:
            return 'B'
        elif score >= 65:
            return 'B-'
        elif score >= 60:
            return 'C+'
        elif score >= 55:
            return 'C'
        elif score >= 50:
            return 'C-'
        elif score >= 45:
            return 'D'
        else:
            return 'F'
    
    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on score"""
        if score >= 80:
            return "HIGHLY RECOMMENDED - This strategy shows excellent performance and stability."
        elif score >= 70:
            return "RECOMMENDED - This strategy shows good potential with acceptable risk."
        elif score >= 60:
            return "CONDITIONAL - This strategy may work with proper risk management."
        elif score >= 50:
            return "CAUTION - This strategy needs significant improvement."
        else:
            return "NOT RECOMMENDED - This strategy shows poor risk-adjusted returns."
    
    def generate_report(self, output_path: str):
        """Generate HTML report"""
        evaluation = self.evaluate_complete()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Strategy Evaluation Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; }}
                h1 {{ color: #2c3e50; text-align: center; }}
                .score-box {{ 
                    text-align: center; 
                    font-size: 48px; 
                    font-weight: bold; 
                    padding: 20px; 
                    margin: 20px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                }}
                .grade {{ font-size: 24px; }}
                .metrics-grid {{ 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 10px;
                    margin: 20px 0;
                }}
                .metric {{ 
                    padding: 10px; 
                    background: #f8f9fa; 
                    border-radius: 5px;
                }}
                .recommendation {{
                    padding: 20px;
                    margin: 20px 0;
                    border-left: 4px solid #3498db;
                    background: #ecf0f1;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Strategy Evaluation Report</h1>
                
                <div class="score-box">
                    Score: {evaluation['score']:.1f}/100
                    <div class="grade">Grade: {evaluation['grade']}</div>
                </div>
                
                <div class="recommendation">
                    <strong>Recommendation:</strong><br>
                    {evaluation['recommendation']}
                </div>
                
                <h2>Key Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric">
                        <strong>Sharpe Ratio:</strong> {evaluation['metrics']['sharpe_ratio']:.2f}
                    </div>
                    <div class="metric">
                        <strong>Annual Return:</strong> {evaluation['metrics']['annual_return']*100:.2f}%
                    </div>
                    <div class="metric">
                        <strong>Max Drawdown:</strong> {evaluation['metrics']['max_drawdown']*100:.2f}%
                    </div>
                    <div class="metric">
                        <strong>Win Rate:</strong> {evaluation['metrics']['win_rate']*100:.1f}%
                    </div>
                    <div class="metric">
                        <strong>Profit Factor:</strong> {evaluation['metrics']['profit_factor']:.2f}
                    </div>
                    <div class="metric">
                        <strong>Total Trades:</strong> {evaluation['metrics']['total_trades']}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        with open(output_path, 'w') as f:
            f.write(html)
        
        print(f"Report saved to {output_path}")
