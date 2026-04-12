using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using QuantumTrader.Data;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class RiskManagementService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly ILogger<RiskManagementService> _logger;
        private readonly IConfiguration _configuration;

        public RiskManagementService(QuantumTraderDbContext context, ILogger<RiskManagementService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        // Position Risk Assessment
        public async Task<RiskAssessmentResult> AssessPositionRiskAsync(int accountId, string symbol, decimal quantity, decimal price, OrderSide side)
        {
            try
            {
                var account = await _context.TradingAccounts
                    .Include(a => a.RiskSettings)
                    .FirstOrDefaultAsync(a => a.Id == accountId);

                if (account == null)
                    return new RiskAssessmentResult { IsApproved = false, Reason = "Account not found" };

                var positionValue = quantity * price;
                var accountBalance = account.Balance;

                // Get risk settings
                var riskSettings = account.RiskSettings ?? await GetOrCreateAccountRiskSettingsAsync(accountId);

                // Check position size limits
                var maxPositionSize = accountBalance * riskSettings.MaxPositionSize;
                if (positionValue > maxPositionSize)
                {
                    return new RiskAssessmentResult
                    {
                        IsApproved = false,
                        Reason = $"Position size ${positionValue:F2} exceeds maximum allowed ${maxPositionSize:F2}",
                        RiskLevel = RiskLevel.High
                    };
                }

                // Check daily loss limits
                var dailyPnL = await GetDailyPnLAsync(accountId);
                var maxDailyLoss = accountBalance * riskSettings.MaxDailyLoss;
                if (dailyPnL < -maxDailyLoss)
                {
                    return new RiskAssessmentResult
                    {
                        IsApproved = false,
                        Reason = $"Daily loss limit exceeded. Current: ${dailyPnL:F2}, Max: ${maxDailyLoss:F2}",
                        RiskLevel = RiskLevel.High
                    };
                }

                // Check drawdown limits
                var currentDrawdown = await CalculateCurrentDrawdownAsync(accountId);
                var maxDrawdown = accountBalance * riskSettings.MaxDrawdown;
                if (currentDrawdown > maxDrawdown)
                {
                    return new RiskAssessmentResult
                    {
                        IsApproved = false,
                        Reason = $"Maximum drawdown exceeded. Current: ${currentDrawdown:F2}, Max: ${maxDrawdown:F2}",
                        RiskLevel = RiskLevel.High
                    };
                }

                // Check open positions limit
                var openPositions = await _context.Positions
                    .CountAsync(p => p.AccountId == accountId && p.Status == PositionStatus.Open);

                if (openPositions >= riskSettings.MaxOpenPositions)
                {
                    return new RiskAssessmentResult
                    {
                        IsApproved = false,
                        Reason = $"Maximum open positions limit reached ({openPositions}/{riskSettings.MaxOpenPositions})",
                        RiskLevel = RiskLevel.Medium
                    };
                }

                // Check concentration risk
                var concentrationRisk = await AssessConcentrationRiskAsync(accountId, symbol, positionValue);
                if (concentrationRisk > riskSettings.MaxConcentration)
                {
                    return new RiskAssessmentResult
                    {
                        IsApproved = false,
                        Reason = $"Concentration risk too high: {concentrationRisk:P2}",
                        RiskLevel = RiskLevel.Medium
                    };
                }

                return new RiskAssessmentResult
                {
                    IsApproved = true,
                    RiskLevel = RiskLevel.Low,
                    Reason = "Position approved",
                    SuggestedStopLoss = price * (1 - riskSettings.StopLossPercentage),
                    SuggestedTakeProfit = price * (1 + riskSettings.TakeProfitPercentage)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assessing position risk for account {AccountId}", accountId);
                return new RiskAssessmentResult { IsApproved = false, Reason = "Risk assessment error" };
            }
        }

        // Portfolio Risk Monitoring
        public async Task<PortfolioRiskReport> GeneratePortfolioRiskReportAsync(int accountId)
        {
            try
            {
                var account = await _context.TradingAccounts
                    .Include(a => a.Positions)
                    .Include(a => a.Trades)
                    .FirstOrDefaultAsync(a => a.Id == accountId);

                if (account == null) return null;

                var positions = account.Positions.Where(p => p.Status == PositionStatus.Open).ToList();
                var trades = account.Trades.ToList();

                var report = new PortfolioRiskReport
                {
                    AccountId = accountId,
                    TotalPositions = positions.Count,
                    TotalValue = positions.Sum(p => p.Quantity * p.CurrentPrice),
                    UnrealizedPnL = positions.Sum(p => p.UnrealizedPnL ?? 0),
                    RealizedPnL = trades.Sum(t => t.RealizedPnL),
                    CurrentDrawdown = await CalculateCurrentDrawdownAsync(accountId),
                    DailyPnL = await GetDailyPnLAsync(accountId),
                    Volatility = CalculatePortfolioVolatility(positions, trades),
                    SharpeRatio = CalculateSharpeRatio(account.Balance, trades),
                    MaxDrawdown = CalculateMaxDrawdown(trades),
                    RiskMetrics = await CalculateRiskMetricsAsync(accountId),
                    GeneratedAt = DateTime.UtcNow
                };

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating portfolio risk report for account {AccountId}", accountId);
                return null;
            }
        }

        // Stop Loss and Take Profit Management
        public async Task<bool> CheckStopLossAsync(int positionId, decimal currentPrice)
        {
            try
            {
                var position = await _context.Positions
                    .Include(p => p.Account)
                    .ThenInclude(a => a.RiskSettings)
                    .FirstOrDefaultAsync(p => p.Id == positionId);

                if (position == null || position.Status != PositionStatus.Open) return false;

                var riskSettings = position.Account.RiskSettings;
                var stopLossPrice = position.EntryPrice * (1 - riskSettings.StopLossPercentage);

                if (position.Side == OrderSide.Buy && currentPrice <= stopLossPrice)
                {
                    await ClosePositionForStopLossAsync(position, currentPrice);
                    return true;
                }
                else if (position.Side == OrderSide.Sell && currentPrice >= stopLossPrice)
                {
                    await ClosePositionForStopLossAsync(position, currentPrice);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stop loss for position {PositionId}", positionId);
                return false;
            }
        }

        public async Task<bool> CheckTakeProfitAsync(int positionId, decimal currentPrice)
        {
            try
            {
                var position = await _context.Positions
                    .Include(p => p.Account)
                    .ThenInclude(a => a.RiskSettings)
                    .FirstOrDefaultAsync(p => p.Id == positionId);

                if (position == null || position.Status != PositionStatus.Open) return false;

                var riskSettings = position.Account.RiskSettings;
                var takeProfitPrice = position.EntryPrice * (1 + riskSettings.TakeProfitPercentage);

                if (position.Side == OrderSide.Buy && currentPrice >= takeProfitPrice)
                {
                    await ClosePositionForTakeProfitAsync(position, currentPrice);
                    return true;
                }
                else if (position.Side == OrderSide.Sell && currentPrice <= takeProfitPrice)
                {
                    await ClosePositionForTakeProfitAsync(position, currentPrice);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking take profit for position {PositionId}", positionId);
                return false;
            }
        }

        // Risk Settings Management
        public async Task<AccountRiskSettings> GetOrCreateAccountRiskSettingsAsync(int accountId)
        {
            var settings = await _context.AccountRiskSettings
                .FirstOrDefaultAsync(s => s.AccountId == accountId);

            if (settings == null)
            {
                settings = new AccountRiskSettings
                {
                    AccountId = accountId,
                    MaxPositionSize = 0.02m, // 2% of account
                    MaxDailyLoss = 0.05m, // 5% of account
                    MaxDrawdown = 0.20m, // 20% of account
                    StopLossPercentage = 0.02m, // 2% per trade
                    TakeProfitPercentage = 0.04m, // 4% per trade
                    MaxOpenPositions = 10,
                    MaxConcentration = 0.25m, // 25% in single position
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.AccountRiskSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        public async Task UpdateRiskSettingsAsync(int accountId, Dictionary<string, object> newSettings)
        {
            var settings = await GetOrCreateAccountRiskSettingsAsync(accountId);

            if (newSettings.ContainsKey("MaxPositionSize"))
                settings.MaxPositionSize = Convert.ToDecimal(newSettings["MaxPositionSize"]);
            if (newSettings.ContainsKey("MaxDailyLoss"))
                settings.MaxDailyLoss = Convert.ToDecimal(newSettings["MaxDailyLoss"]);
            if (newSettings.ContainsKey("MaxDrawdown"))
                settings.MaxDrawdown = Convert.ToDecimal(newSettings["MaxDrawdown"]);
            if (newSettings.ContainsKey("StopLossPercentage"))
                settings.StopLossPercentage = Convert.ToDecimal(newSettings["StopLossPercentage"]);
            if (newSettings.ContainsKey("TakeProfitPercentage"))
                settings.TakeProfitPercentage = Convert.ToDecimal(newSettings["TakeProfitPercentage"]);
            if (newSettings.ContainsKey("MaxOpenPositions"))
                settings.MaxOpenPositions = Convert.ToInt32(newSettings["MaxOpenPositions"]);
            if (newSettings.ContainsKey("MaxConcentration"))
                settings.MaxConcentration = Convert.ToDecimal(newSettings["MaxConcentration"]);

            settings.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // Helper Methods
        private async Task<decimal> GetDailyPnLAsync(int accountId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Trades
                .Where(t => t.AccountId == accountId && t.ExecutedAt.Date == today)
                .SumAsync(t => t.RealizedPnL);
        }

        private async Task<decimal> CalculateCurrentDrawdownAsync(int accountId)
        {
            var account = await _context.TradingAccounts.FindAsync(accountId);
            if (account == null) return 0;

            var peakBalance = await _context.Trades
                .Where(t => t.AccountId == accountId)
                .GroupBy(t => 1)
                .Select(g => g.Sum(t => t.RealizedPnL))
                .FirstOrDefaultAsync();

            var currentBalance = account.Balance;
            return Math.Max(0, peakBalance - currentBalance);
        }

        private async Task<decimal> AssessConcentrationRiskAsync(int accountId, string symbol, decimal newPositionValue)
        {
            var totalPositionValue = await _context.Positions
                .Where(p => p.AccountId == accountId && p.Status == PositionStatus.Open)
                .SumAsync(p => p.Quantity * p.CurrentPrice);

            var symbolPositionValue = await _context.Positions
                .Where(p => p.AccountId == accountId && p.Symbol == symbol && p.Status == PositionStatus.Open)
                .SumAsync(p => p.Quantity * p.CurrentPrice);

            var totalValue = totalPositionValue + newPositionValue;
            return totalValue > 0 ? (symbolPositionValue + newPositionValue) / totalValue : 0;
        }

        private decimal CalculatePortfolioVolatility(List<Position> positions, List<Trade> trades)
        {
            if (!trades.Any()) return 0;

            var returns = trades.Select(t => t.RealizedPnL).ToList();
            var mean = returns.Average();
            var variance = returns.Sum(r => Math.Pow((double)(r - mean), 2)) / returns.Count;
            return (decimal)Math.Sqrt(variance);
        }

        private decimal CalculateSharpeRatio(decimal currentBalance, List<Trade> trades)
        {
            if (!trades.Any()) return 0;

            var returns = trades.Select(t => t.RealizedPnL).ToList();
            var mean = returns.Average();
            var volatility = CalculatePortfolioVolatility(new List<Position>(), trades);

            return volatility > 0 ? mean / volatility : 0;
        }

        private decimal CalculateMaxDrawdown(List<Trade> trades)
        {
            if (!trades.Any()) return 0;

            var cumulativePnL = 0m;
            var peak = 0m;
            var maxDrawdown = 0m;

            foreach (var trade in trades.OrderBy(t => t.ExecutedAt))
            {
                cumulativePnL += trade.RealizedPnL;
                if (cumulativePnL > peak)
                    peak = cumulativePnL;

                var drawdown = peak - cumulativePnL;
                if (drawdown > maxDrawdown)
                    maxDrawdown = drawdown;
            }

            return maxDrawdown;
        }

        private async Task<Dictionary<string, object>> CalculateRiskMetricsAsync(int accountId)
        {
            var metrics = new Dictionary<string, object>();

            // VaR (Value at Risk) - 95% confidence
            var trades = await _context.Trades
                .Where(t => t.AccountId == accountId)
                .OrderByDescending(t => t.ExecutedAt)
                .Take(100)
                .ToListAsync();

            if (trades.Any())
            {
                var returns = trades.Select(t => t.RealizedPnL).ToList();
                returns.Sort();
                var varIndex = (int)(returns.Count * 0.05);
                metrics["VaR_95"] = returns[varIndex];
            }

            // Beta calculation (simplified)
            metrics["Beta"] = 1.0m; // Placeholder

            // Correlation matrix (simplified)
            metrics["Correlation"] = 0.5m; // Placeholder

            return metrics;
        }

        private async Task ClosePositionForStopLossAsync(Position position, decimal exitPrice)
        {
            position.ExitPrice = exitPrice;
            position.RealizedPnL = CalculateRealizedPnL(position, 0);
            position.Status = PositionStatus.Closed;
            position.ClosedAt = DateTime.UtcNow;
            position.LastUpdated = DateTime.UtcNow;

            // Create trade record
            var trade = new Trade
            {
                AccountId = position.AccountId,
                Symbol = position.Symbol,
                Quantity = position.Quantity,
                EntryPrice = position.EntryPrice,
                ExitPrice = exitPrice,
                Commission = 0,
                RealizedPnL = position.RealizedPnL,
                Side = position.Side,
                ExecutedAt = DateTime.UtcNow
            };

            _context.Trades.Add(trade);
            await _context.SaveChangesAsync();

            _logger.LogWarning("Position {PositionId} closed due to stop loss at {ExitPrice}", position.Id, exitPrice);
        }

        private async Task ClosePositionForTakeProfitAsync(Position position, decimal exitPrice)
        {
            position.ExitPrice = exitPrice;
            position.RealizedPnL = CalculateRealizedPnL(position, 0);
            position.Status = PositionStatus.Closed;
            position.ClosedAt = DateTime.UtcNow;
            position.LastUpdated = DateTime.UtcNow;

            // Create trade record
            var trade = new Trade
            {
                AccountId = position.AccountId,
                Symbol = position.Symbol,
                Quantity = position.Quantity,
                EntryPrice = position.EntryPrice,
                ExitPrice = exitPrice,
                Commission = 0,
                RealizedPnL = position.RealizedPnL,
                Side = position.Side,
                ExecutedAt = DateTime.UtcNow
            };

            _context.Trades.Add(trade);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Position {PositionId} closed due to take profit at {ExitPrice}", position.Id, exitPrice);
        }

        private decimal CalculateRealizedPnL(Position position, decimal commission)
        {
            if (position.Side == OrderSide.Buy)
                return (position.ExitPrice.Value - position.EntryPrice) * position.Quantity - commission;
            else
                return (position.EntryPrice - position.ExitPrice.Value) * position.Quantity - commission;
        }
    }

    // Data Models
    public class RiskAssessmentResult
    {
        public bool IsApproved { get; set; }
        public string Reason { get; set; }
        public RiskLevel RiskLevel { get; set; }
        public decimal? SuggestedStopLoss { get; set; }
        public decimal? SuggestedTakeProfit { get; set; }
    }

    public class PortfolioRiskReport
    {
        public int AccountId { get; set; }
        public int TotalPositions { get; set; }
        public decimal TotalValue { get; set; }
        public decimal UnrealizedPnL { get; set; }
        public decimal RealizedPnL { get; set; }
        public decimal CurrentDrawdown { get; set; }
        public decimal DailyPnL { get; set; }
        public decimal Volatility { get; set; }
        public decimal SharpeRatio { get; set; }
        public decimal MaxDrawdown { get; set; }
        public Dictionary<string, object> RiskMetrics { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    public enum RiskLevel
    {
        Low,
        Medium,
        High,
        Critical
    }
}
