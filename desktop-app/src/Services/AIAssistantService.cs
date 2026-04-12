using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.Services
{
    public interface IAIAssistantService
    {
        Task<string> GetStrategyRecommendationAsync(string query);
        Task<string> AnalyzePerformanceAsync();
        Task<string> GetRiskAssessmentAsync();
        Task<string> GetMarketInsightAsync();
        Task<string> ProcessQueryAsync(string query);
    }

    public class AIAssistantService : IAIAssistantService
    {
        private readonly ILogger<AIAssistantService> _logger;
        private readonly IPnLCalculationService _pnlService;
        private readonly IStrategyExecutionService _strategyExecution;
        private readonly Execution.IBrokerAdapter _brokerAdapter;

        public AIAssistantService(
            ILogger<AIAssistantService> logger,
            IPnLCalculationService pnlService,
            IStrategyExecutionService strategyExecution,
            Execution.IBrokerAdapter brokerAdapter)
        {
            _logger = logger;
            _pnlService = pnlService;
            _strategyExecution = strategyExecution;
            _brokerAdapter = brokerAdapter;
        }

        public async Task<string> ProcessQueryAsync(string query)
        {
            try
            {
                var lowerQuery = query.ToLower();

                // Route query to appropriate analysis
                if (lowerQuery.Contains("performance") || lowerQuery.Contains("pnl") || lowerQuery.Contains("profit"))
                {
                    return await AnalyzePerformanceAsync();
                }
                else if (lowerQuery.Contains("risk") || lowerQuery.Contains("drawdown") || lowerQuery.Contains("loss"))
                {
                    return await GetRiskAssessmentAsync();
                }
                else if (lowerQuery.Contains("strategy") || lowerQuery.Contains("recommend") || lowerQuery.Contains("improve"))
                {
                    return await GetStrategyRecommendationAsync(query);
                }
                else if (lowerQuery.Contains("market") || lowerQuery.Contains("trend") || lowerQuery.Contains("outlook"))
                {
                    return await GetMarketInsightAsync();
                }
                else
                {
                    return await GetGeneralResponseAsync(query);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing AI query: {Query}", query);
                return "I'm experiencing some technical difficulties. Please try again later.";
            }
        }

        public async Task<string> GetStrategyRecommendationAsync(string query)
        {
            try
            {
                var strategies = _strategyExecution.GetActiveStrategies();
                var totalPnL = await _pnlService.GetTotalPnLAsync();
                var activeCount = strategies.Count(s => s.IsActive);

                var recommendations = new List<string>();

                // Analyze current strategy performance
                if (totalPnL < 0)
                {
                    recommendations.Add("📉 **Current Performance Alert**: Your strategies are showing negative P&L. Consider:");
                    recommendations.Add("• Reducing position sizes to limit risk");
                    recommendations.Add("• Pausing underperforming strategies");
                    recommendations.Add("• Reviewing market conditions for regime changes");
                }
                else
                {
                    recommendations.Add("📈 **Strong Performance**: Your strategies are profitable! Consider:");
                    recommendations.Add("• Gradually increasing position sizes");
                    recommendations.Add("• Adding complementary strategies for diversification");
                }

                // Strategy-specific recommendations
                var bestStrategy = strategies.OrderByDescending(s => s.PnL).FirstOrDefault();
                var worstStrategy = strategies.OrderBy(s => s.PnL).FirstOrDefault();

                if (bestStrategy != null && worstStrategy != null)
                {
                    recommendations.Add($"🏆 **Top Performer**: {bestStrategy.Name} (P&L: ${bestStrategy.PnL:F2})");
                    recommendations.Add($"⚠️ **Needs Attention**: {worstStrategy.Name} (P&L: ${worstStrategy.PnL:F2})");
                }

                // Market regime recommendations
                recommendations.Add("🔄 **Optimization Suggestions**:");
                recommendations.Add("• Enable regime detection filters for better market adaptation");
                recommendations.Add("• Implement Kelly Criterion position sizing for optimal risk-adjusted returns");
                recommendations.Add("• Add correlation monitoring between strategies to avoid over-concentration");

                return string.Join("\n", recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating strategy recommendation");
                return "Unable to analyze strategies at this time. Please check your strategy status and try again.";
            }
        }

        public async Task<string> AnalyzePerformanceAsync()
        {
            try
            {
                var totalPnL = await _pnlService.GetTotalPnLAsync();
                var dailyPnL = await _pnlService.GetDailyPnLAsync();
                var unrealizedPnL = await _pnlService.GetUnrealizedPnLAsync();
                var realizedPnL = await _pnlService.GetRealizedPnLAsync();

                var analysis = new List<string>
                {
                    "📊 **Performance Analysis**",
                    $"• Total P&L: ${totalPnL:F2}",
                    $"• Today's P&L: ${dailyPnL:F2}",
                    $"• Realized P&L: ${realizedPnL:F2}",
                    $"• Unrealized P&L: ${unrealizedPnL:F2}",
                    "",
                    "📈 **Key Insights**:"
                };

                if (totalPnL > 0)
                {
                    analysis.Add("✅ Overall profitable performance");
                    var returnPct = (totalPnL / 100000m) * 100; // Assuming $100k capital
                    analysis.Add($"✅ Current return: {returnPct:F2}%");
                }
                else
                {
                    analysis.Add("⚠️ Currently in drawdown");
                    analysis.Add("⚠️ Consider risk management review");
                }

                if (Math.Abs(unrealizedPnL) > Math.Abs(realizedPnL))
                {
                    analysis.Add("💡 High unrealized P&L - consider profit-taking strategies");
                }

                analysis.Add("");
                analysis.Add("🎯 **Recommendations**:");
                analysis.Add("• Monitor daily P&L trends for consistency");
                analysis.Add("• Set profit targets and stop-losses");
                analysis.Add("• Review position sizing based on volatility");

                return string.Join("\n", analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing performance");
                return "Unable to analyze performance data at this time.";
            }
        }

        public async Task<string> GetRiskAssessmentAsync()
        {
            try
            {
                var positions = await _brokerAdapter.GetPositionsAsync();
                var totalPnL = await _pnlService.GetTotalPnLAsync();
                var strategies = _strategyExecution.GetActiveStrategies();

                var assessment = new List<string>
                {
                    "⚠️ **Risk Assessment**",
                    $"• Active Positions: {positions.Count}",
                    $"• Running Strategies: {strategies.Count(s => s.IsActive)}",
                    $"• Current Drawdown: {(totalPnL < 0 ? $"${Math.Abs(totalPnL):F2}" : "None")}",
                    "",
                    "🛡️ **Risk Factors**:"
                };

                // Position concentration risk
                if (positions.Count > 10)
                {
                    assessment.Add("⚠️ High position count - consider consolidation");
                }

                // Strategy concentration risk
                var activeStrategies = strategies.Count(s => s.IsActive);
                if (activeStrategies > 3)
                {
                    assessment.Add("⚠️ Multiple active strategies - monitor correlation");
                }
                else if (activeStrategies == 1)
                {
                    assessment.Add("⚠️ Single strategy risk - consider diversification");
                }

                // P&L risk
                if (totalPnL < -1000)
                {
                    assessment.Add("🚨 Significant drawdown detected");
                    assessment.Add("🚨 Consider reducing position sizes");
                }

                assessment.Add("");
                assessment.Add("📋 **Risk Management Actions**:");
                assessment.Add("• Implement position size limits per strategy");
                assessment.Add("• Set daily loss limits with automatic shutdown");
                assessment.Add("• Monitor strategy correlation to avoid clustering");
                assessment.Add("• Use the Emergency Stop button if needed");

                return string.Join("\n", assessment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assessing risk");
                return "Unable to assess risk at this time.";
            }
        }

        public async Task<string> GetMarketInsightAsync()
        {
            try
            {
                var insights = new List<string>
                {
                    "🌍 **Market Insights**",
                    "",
                    "📊 **Current Market Regime**:",
                    "• Futures markets showing mixed signals",
                    "• ES: Consolidation pattern observed",
                    "• NQ: Tech volatility elevated",
                    "• Energy (CL): Range-bound trading",
                    "",
                    "🔍 **Strategy Implications**:",
                    "• Mean reversion strategies may perform well in ranging markets",
                    "• Momentum strategies should wait for clear breakouts",
                    "• Microstructure strategies can capitalize on increased volatility",
                    "",
                    "⏰ **Timing Considerations**:",
                    "• Market open (9:30 AM ET): High volatility window",
                    "• Lunch period (12-2 PM ET): Reduced volume, range-bound",
                    "• Market close (3:30-4 PM ET): Increased activity",
                    "",
                    "💡 **Actionable Insights**:",
                    "• Consider reducing position sizes during low-volume periods",
                    "• Monitor for regime changes using multiple timeframes",
                    "• Adjust strategy parameters based on current volatility"
                };

                return string.Join("\n", insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating market insights");
                return "Market insight analysis is temporarily unavailable.";
            }
        }

        private async Task<string> GetGeneralResponseAsync(string query)
        {
            var responses = new[]
            {
                "I can help you with strategy analysis, performance review, risk assessment, and market insights. What would you like to know?",
                "Ask me about your trading performance, strategy recommendations, or risk management suggestions.",
                "I'm here to help optimize your trading strategies. Try asking about performance analysis or market conditions.",
                "Need help with your trading strategies? I can analyze performance, assess risk, or provide market insights."
            };

            var random = new Random();
            var baseResponse = responses[random.Next(responses.Length)];

            // Add current status
            try
            {
                var strategies = _strategyExecution.GetActiveStrategies();
                var activeCount = strategies.Count(s => s.IsActive);
                var totalPnL = await _pnlService.GetTotalPnLAsync();

                var status = $"\n\n📊 **Current Status**: {activeCount} strategies active, Total P&L: ${totalPnL:F2}";
                return baseResponse + status;
            }
            catch
            {
                return baseResponse;
            }
        }
    }
}
