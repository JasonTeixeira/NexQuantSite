"""
Report generation module
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
from pathlib import Path
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class ReportGenerator:
    """
    Generate comprehensive HTML reports
    """
    
    def __init__(self):
        """Initialize report generator"""
        self.report_dir = Path('data/results')
        self.report_dir.mkdir(exist_ok=True)
        
    def generate_full_report(self, results: Dict, strategy) -> str:
        """
        Generate comprehensive HTML report
        
        Args:
            results: Dictionary with all test results
            strategy: Strategy object
            
        Returns:
            Path to generated report
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_name = f"backtest_report_{timestamp}.html"
        report_path = self.report_dir / report_name
        
        # Generate HTML content
        html = self._generate_html_content(results, strategy)
        
        # Save report
        with open(report_path, 'w') as f:
            f.write(html)
        
        logger.info(f"✅ Report saved to {report_path}")
        
        return str(report_path)
    
    def _generate_html_content(self, results: Dict, strategy) -> str:
        """Generate complete HTML report content"""
        
        # Extract metrics
        metrics = results.get('standard', {}).get('metrics', {})
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ultimate Backtest Report</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f5f5f5;
                }}
                h1 {{
                    color: #333;
                    border-bottom: 2px solid #4CAF50;
                    padding-bottom: 10px;
                }}
                .metrics-grid {{
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin: 20px 0;
                }}
                .metric-card {{
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .metric-value {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                }}
                .metric-label {{
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                }}
                .section {{
                    background: white;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .test-result {{
                    background: #f9f9f9;
                    padding: 15px;
                    margin: 10px 0;
                    border-left: 4px solid #4CAF50;
                }}
                .warning {{
                    border-left-color: #ff9800;
                }}
                .error {{
                    border-left-color: #f44336;
                }}
            </style>
        </head>
        <body>
            <h1>Ultimate Backtest Report</h1>
            
            <div class="section">
                <h2>Strategy: {strategy.__class__.__name__}</h2>
                <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            <div class="section">
                <h2>Key Performance Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('sharpe_ratio', 0):.2f}</div>
                        <div class="metric-label">Sharpe Ratio</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('total_return', 0):.1f}%</div>
                        <div class="metric-label">Total Return</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('max_drawdown', 0):.1f}%</div>
                        <div class="metric-label">Max Drawdown</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('win_rate', 0):.1f}%</div>
                        <div class="metric-label">Win Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('profit_factor', 0):.2f}</div>
                        <div class="metric-label">Profit Factor</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('total_trades', 0)}</div>
                        <div class="metric-label">Total Trades</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.get('total_pnl', 0):,.0f}</div>
                        <div class="metric-label">Total PnL</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{metrics.get('avg_slippage', 0):.1f} bps</div>
                        <div class="metric-label">Avg Slippage</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Test Suite Results</h2>
                {self._format_test_results(results)}
            </div>
            
            <div class="section">
                <h2>Risk Analysis</h2>
                <ul>
                    <li>Sortino Ratio: {metrics.get('sortino_ratio', 0):.2f}</li>
                    <li>Calmar Ratio: {metrics.get('calmar_ratio', 0):.2f}</li>
                    <li>Best Trade: ${metrics.get('best_trade', 0):,.0f}</li>
                    <li>Worst Trade: ${metrics.get('worst_trade', 0):,.0f}</li>
                    <li>Average Win: ${metrics.get('avg_win', 0):,.0f}</li>
                    <li>Average Loss: ${metrics.get('avg_loss', 0):,.0f}</li>
                </ul>
            </div>
            
            <div class="section">
                <h2>Strategy Parameters</h2>
                <pre>{json.dumps(strategy.parameters, indent=2)}</pre>
            </div>
            
        </body>
        </html>
        """
        
        return html
    
    def _format_test_results(self, results: Dict) -> str:
        """Format test suite results as HTML"""
        
        html = ""
        
        # Walk-forward results
        if 'walk_forward' in results:
            wf = results['walk_forward']
            html += f"""
            <div class="test-result">
                <h3>Walk-Forward Analysis</h3>
                <p><strong>Stability Score:</strong> {wf.get('stability_score', 0):.1f}/100</p>
                <p><strong>Windows Tested:</strong> {len(wf.get('windows', []))}</p>
            </div>
            """
        
        # Monte Carlo results
        if 'monte_carlo' in results:
            mc = results['monte_carlo']['statistics']
            html += f"""
            <div class="test-result">
                <h3>Monte Carlo Simulation</h3>
                <p><strong>Mean Sharpe:</strong> {mc.get('mean_sharpe', 0):.2f} (±{mc.get('std_sharpe', 0):.2f})</p>
                <p><strong>95% CI Sharpe:</strong> [{mc.get('sharpe_ci_lower', 0):.2f}, {mc.get('sharpe_ci_upper', 0):.2f}]</p>
                <p><strong>Probability of Loss:</strong> {mc.get('probability_of_loss', 0):.1%}</p>
            </div>
            """
        
        # Stress test results
        if 'stress_test' in results:
            stress = results['stress_test']
            html += f"""
            <div class="test-result">
                <h3>Stress Testing</h3>
                <p><strong>Stress Score:</strong> {stress.get('stress_score', 0):.1f}/100</p>
            </div>
            """
        
        # Sensitivity results
        if 'sensitivity' in results:
            sens = results['sensitivity']
            html += f"""
            <div class="test-result">
                <h3>Parameter Sensitivity</h3>
                <p><strong>Parameters Analyzed:</strong> {len(sens.get('parameter_sensitivity', {}))}</p>
            </div>
            """
        
        return html
    
    def generate_summary_report(self, results: Dict, strategy_name: str) -> str:
        """
        Generate summary report
        
        Args:
            results: Test results
            strategy_name: Strategy name
            
        Returns:
            Summary report as string
        """
        summary = f"""
        BACKTEST SUMMARY REPORT
        =======================
        
        Strategy: {strategy_name}
        Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        PERFORMANCE SUMMARY:
        """
        
        if 'standard' in results:
            metrics = results['standard']['metrics']
            summary += f"""
        - Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.2f}
        - Total Return: {metrics.get('total_return', 0):.1f}%
        - Max Drawdown: {metrics.get('max_drawdown', 0):.1f}%
        - Win Rate: {metrics.get('win_rate', 0):.1f}%
        - Total Trades: {metrics.get('total_trades', 0)}
        """
        
        summary += f"""
        
        TEST SUITE RESULTS:
        """
        
        if 'walk_forward' in results:
            wf = results['walk_forward']
            summary += f"- Walk-Forward Stability: {wf.get('stability_score', 0):.1f}/100\n"
        
        if 'monte_carlo' in results:
            mc = results['monte_carlo']['statistics']
            summary += f"- Monte Carlo Mean Sharpe: {mc.get('mean_sharpe', 0):.2f}\n"
            summary += f"- Probability of Loss: {mc.get('probability_of_loss', 0):.1%}\n"
        
        if 'stress_test' in results:
            stress = results['stress_test']
            summary += f"- Stress Test Score: {stress.get('stress_score', 0):.1f}/100\n"
        
        summary += f"""
        
        RECOMMENDATION:
        """
        
        # Generate recommendation based on results
        if 'standard' in results:
            sharpe = results['standard']['metrics'].get('sharpe_ratio', 0)
            drawdown = results['standard']['metrics'].get('max_drawdown', 0)
            
            if sharpe > 1.5 and drawdown < 10:
                summary += "✅ Strategy appears ready for live trading"
            elif sharpe > 1.0 and drawdown < 15:
                summary += "⚠️ Strategy shows promise but needs optimization"
            else:
                summary += "❌ Strategy needs significant improvement"
        
        return summary 