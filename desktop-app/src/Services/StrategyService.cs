using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuantumTrader.Data;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class StrategyService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly ILogger<StrategyService> _logger;

        public StrategyService(QuantumTraderDbContext context, ILogger<StrategyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Strategy Management
        public async Task<Strategy> CreateStrategyAsync(int userId, string name, string description, string code, StrategyType type, Dictionary<string, object> parameters = null)
        {
            try
            {
                var strategy = new Strategy
                {
                    UserId = userId,
                    Name = name,
                    Description = description,
                    Code = code,
                    Type = type,
                    Parameters = parameters != null ? System.Text.Json.JsonSerializer.Serialize(parameters) : null,
                    Status = StrategyStatus.Draft,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.Strategies.Add(strategy);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new strategy {StrategyName} for user {UserId}", name, userId);
                return strategy;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating strategy for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Strategy> GetStrategyAsync(int strategyId)
        {
            return await _context.Strategies
                .Include(s => s.PerformanceHistory)
                .Include(s => s.Backtests)
                .Include(s => s.RiskSettings)
                .FirstOrDefaultAsync(s => s.Id == strategyId);
        }

        public async Task<List<Strategy>> GetUserStrategiesAsync(int userId, StrategyStatus? status = null)
        {
            var query = _context.Strategies.Where(s => s.UserId == userId);
            if (status.HasValue)
                query = query.Where(s => s.Status == status.Value);

            return await query
                .OrderByDescending(s => s.LastUpdated)
                .ToListAsync();
        }

        public async Task UpdateStrategyAsync(int strategyId, string name = null, string description = null, string code = null, Dictionary<string, object> parameters = null)
        {
            var strategy = await _context.Strategies.FindAsync(strategyId);
            if (strategy != null)
            {
                if (name != null) strategy.Name = name;
                if (description != null) strategy.Description = description;
                if (code != null) strategy.Code = code;
                if (parameters != null) strategy.Parameters = System.Text.Json.JsonSerializer.Serialize(parameters);

                strategy.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateStrategyStatusAsync(int strategyId, StrategyStatus status)
        {
            var strategy = await _context.Strategies.FindAsync(strategyId);
            if (strategy != null)
            {
                strategy.Status = status;
                strategy.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Strategy Performance
        public async Task<StrategyPerformance> AddPerformanceRecordAsync(int strategyId, DateTime date, decimal returnValue, decimal drawdown, decimal volatility, decimal sharpeRatio)
        {
            try
            {
                var performance = new StrategyPerformance
                {
                    StrategyId = strategyId,
                    Date = date,
                    Return = returnValue,
                    Drawdown = drawdown,
                    Volatility = volatility,
                    SharpeRatio = sharpeRatio,
                    CreatedAt = DateTime.UtcNow
                };

                _context.StrategyPerformances.Add(performance);
                await _context.SaveChangesAsync();

                // Update strategy summary metrics
                await UpdateStrategyMetricsAsync(strategyId);

                return performance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding performance record for strategy {StrategyId}", strategyId);
                throw;
            }
        }

        public async Task<List<StrategyPerformance>> GetStrategyPerformanceAsync(int strategyId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.StrategyPerformances.Where(p => p.StrategyId == strategyId);

            if (fromDate.HasValue)
                query = query.Where(p => p.Date >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(p => p.Date <= toDate.Value);

            return await query.OrderBy(p => p.Date).ToListAsync();
        }

        private async Task UpdateStrategyMetricsAsync(int strategyId)
        {
            var strategy = await _context.Strategies.FindAsync(strategyId);
            if (strategy == null) return;

            var performances = await _context.StrategyPerformances
                .Where(p => p.StrategyId == strategyId)
                .OrderByDescending(p => p.Date)
                .Take(30) // Last 30 days
                .ToListAsync();

            if (performances.Any())
            {
                strategy.TotalReturn = performances.Sum(p => p.Return);
                strategy.MaxDrawdown = performances.Min(p => p.Drawdown);
                strategy.Volatility = performances.Average(p => p.Volatility);
                strategy.SharpeRatio = performances.Average(p => p.SharpeRatio);
                strategy.WinRate = CalculateWinRate(performances);
                strategy.LastUpdated = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
        }

        private decimal CalculateWinRate(List<StrategyPerformance> performances)
        {
            var winningDays = performances.Count(p => p.Return > 0);
            return performances.Count > 0 ? (decimal)winningDays / performances.Count * 100 : 0;
        }

        // Backtesting
        public async Task<StrategyBacktest> CreateBacktestAsync(int strategyId, DateTime startDate, DateTime endDate, decimal initialCapital, Dictionary<string, object> parameters = null)
        {
            try
            {
                var backtest = new StrategyBacktest
                {
                    StrategyId = strategyId,
                    StartDate = startDate,
                    EndDate = endDate,
                    InitialCapital = initialCapital,
                    Parameters = parameters != null ? System.Text.Json.JsonSerializer.Serialize(parameters) : null,
                    Status = BacktestStatus.Running,
                    CreatedAt = DateTime.UtcNow
                };

                _context.StrategyBacktests.Add(backtest);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created backtest for strategy {StrategyId} from {StartDate} to {EndDate}", strategyId, startDate, endDate);
                return backtest;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating backtest for strategy {StrategyId}", strategyId);
                throw;
            }
        }

        public async Task<StrategyBacktest> GetBacktestAsync(int backtestId)
        {
            return await _context.StrategyBacktests
                .Include(b => b.Strategy)
                .FirstOrDefaultAsync(b => b.Id == backtestId);
        }

        public async Task<List<StrategyBacktest>> GetStrategyBacktestsAsync(int strategyId)
        {
            return await _context.StrategyBacktests
                .Where(b => b.StrategyId == strategyId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateBacktestResultsAsync(int backtestId, decimal finalCapital, decimal totalReturn, decimal maxDrawdown, decimal sharpeRatio, int totalTrades, decimal winRate, string equityCurve = null)
        {
            var backtest = await _context.StrategyBacktests.FindAsync(backtestId);
            if (backtest != null)
            {
                backtest.FinalCapital = finalCapital;
                backtest.TotalReturn = totalReturn;
                backtest.MaxDrawdown = maxDrawdown;
                backtest.SharpeRatio = sharpeRatio;
                backtest.TotalTrades = totalTrades;
                backtest.WinRate = winRate;
                backtest.EquityCurve = equityCurve;
                backtest.Status = BacktestStatus.Completed;
                backtest.CompletedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated backtest results for backtest {BacktestId}", backtestId);
            }
        }

        // Strategy Risk Settings
        public async Task<StrategyRiskSettings> GetOrCreateRiskSettingsAsync(int strategyId)
        {
            var settings = await _context.StrategyRiskSettings
                .FirstOrDefaultAsync(s => s.StrategyId == strategyId);

            if (settings == null)
            {
                settings = new StrategyRiskSettings
                {
                    StrategyId = strategyId,
                    MaxPositionSize = 0.02m, // 2% of account
                    MaxDailyLoss = 0.05m, // 5% of account
                    MaxDrawdown = 0.20m, // 20% of account
                    StopLossPercentage = 0.02m, // 2% per trade
                    TakeProfitPercentage = 0.04m, // 4% per trade
                    MaxOpenPositions = 5,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.StrategyRiskSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        public async Task UpdateRiskSettingsAsync(int strategyId, decimal? maxPositionSize = null, decimal? maxDailyLoss = null, decimal? maxDrawdown = null, decimal? stopLossPercentage = null, decimal? takeProfitPercentage = null, int? maxOpenPositions = null)
        {
            var settings = await GetOrCreateRiskSettingsAsync(strategyId);

            if (maxPositionSize.HasValue) settings.MaxPositionSize = maxPositionSize.Value;
            if (maxDailyLoss.HasValue) settings.MaxDailyLoss = maxDailyLoss.Value;
            if (maxDrawdown.HasValue) settings.MaxDrawdown = maxDrawdown.Value;
            if (stopLossPercentage.HasValue) settings.StopLossPercentage = stopLossPercentage.Value;
            if (takeProfitPercentage.HasValue) settings.TakeProfitPercentage = takeProfitPercentage.Value;
            if (maxOpenPositions.HasValue) settings.MaxOpenPositions = maxOpenPositions.Value;

            settings.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // Strategy Validation
        public async Task<bool> ValidateStrategyCodeAsync(string code)
        {
            try
            {
                // Basic syntax validation - in a real implementation, you'd use a proper C# compiler
                if (string.IsNullOrWhiteSpace(code))
                    return false;

                // Check for basic C# syntax elements
                if (!code.Contains("class") && !code.Contains("public") && !code.Contains("private"))
                    return false;

                // Check for required trading method signatures
                if (!code.Contains("Execute") && !code.Contains("OnTick") && !code.Contains("OnBar"))
                    return false;

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating strategy code");
                return false;
            }
        }

        // Strategy Statistics
        public async Task<Dictionary<string, object>> GetStrategyStatisticsAsync(int strategyId)
        {
            var strategy = await GetStrategyAsync(strategyId);
            if (strategy == null) return null;

            var performances = await GetStrategyPerformanceAsync(strategyId, DateTime.UtcNow.AddDays(-30));
            var backtests = await GetStrategyBacktestsAsync(strategyId);

            return new Dictionary<string, object>
            {
                ["TotalReturn"] = strategy.TotalReturn,
                ["MaxDrawdown"] = strategy.MaxDrawdown,
                ["Volatility"] = strategy.Volatility,
                ["SharpeRatio"] = strategy.SharpeRatio,
                ["WinRate"] = strategy.WinRate,
                ["TotalTrades"] = strategy.TotalTrades,
                ["PerformanceHistoryCount"] = performances.Count,
                ["BacktestCount"] = backtests.Count,
                ["LastBacktest"] = backtests.FirstOrDefault()?.CreatedAt,
                ["Status"] = strategy.Status
            };
        }
    }
}
