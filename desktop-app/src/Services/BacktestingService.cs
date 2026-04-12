using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class BacktestingService
    {
        private readonly IRepository<BacktestResult> _resultsRepository;
        private readonly IRepository<StrategyVersion> _versionsRepository;

        public BacktestingService()
        {
            _resultsRepository = new JsonRepository<BacktestResult>("backtest_results.json");
            _versionsRepository = new JsonRepository<StrategyVersion>("strategy_versions.json");
        }

        public async Task<BacktestResult> RunBacktestAsync(BacktestRequest request)
        {
            // Simulate backtesting process
            var result = new BacktestResult
            {
                StrategyId = request.StrategyId,
                StrategyName = request.StrategyName,
                AccountId = request.AccountId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Parameters = request.Parameters,
                Status = "Running"
            };

            // Simulate processing time
            await Task.Delay(2000);

            // Generate sample performance data
            result.Performance = GenerateSamplePerformance();
            result.Trades = GenerateSampleTrades(request.StartDate, request.EndDate);
            result.Status = "Completed";

            // Save result
            await _resultsRepository.SaveAsync(result);
            return result;
        }

        public async Task<List<BacktestResult>> GetBacktestResultsAsync(string accountId, string? strategyId = null)
        {
            var results = await _resultsRepository.GetAllAsync();
            var filtered = results.Where(r => r.AccountId == accountId);
            
            if (!string.IsNullOrEmpty(strategyId))
                filtered = filtered.Where(r => r.StrategyId == strategyId);

            return filtered.OrderByDescending(r => r.CreatedDate).ToList();
        }

        public async Task<BacktestResult?> GetBacktestResultAsync(string resultId)
        {
            var results = await _resultsRepository.GetAllAsync();
            return results.FirstOrDefault(r => r.Id == resultId);
        }

        public async Task<StrategyVersion> SaveStrategyVersionAsync(StrategyVersion version)
        {
            await _versionsRepository.SaveAsync(version);
            return version;
        }

        public async Task<List<StrategyVersion>> GetStrategyVersionsAsync(string strategyId)
        {
            var versions = await _versionsRepository.GetAllAsync();
            return versions.Where(v => v.StrategyId == strategyId && v.IsActive)
                          .OrderByDescending(v => v.CreatedDate)
                          .ToList();
        }

        public async Task<StrategyVersion?> GetStrategyVersionAsync(string versionId)
        {
            var versions = await _versionsRepository.GetAllAsync();
            return versions.FirstOrDefault(v => v.Id == versionId);
        }

        private BacktestPerformance GenerateSamplePerformance()
        {
            var random = new Random();
            var totalReturn = (decimal)(random.NextDouble() * 100 - 20); // -20% to +80%
            var totalTrades = random.Next(50, 500);
            var winningTrades = (int)(totalTrades * (0.4 + random.NextDouble() * 0.3)); // 40-70% win rate

            return new BacktestPerformance
            {
                TotalReturn = totalReturn,
                AnnualizedReturn = totalReturn * 1.2m, // Assume 1 year period
                SharpeRatio = 0.5 + random.NextDouble() * 2.5, // 0.5 to 3.0
                MaxDrawdown = random.NextDouble() * 25, // 0 to 25%
                WinRate = (double)winningTrades / totalTrades,
                ProfitFactor = 0.8 + random.NextDouble() * 2.2, // 0.8 to 3.0
                CalmarRatio = 0.2 + random.NextDouble() * 3.8, // 0.2 to 4.0
                SortinoRatio = 0.3 + random.NextDouble() * 2.7, // 0.3 to 3.0
                TotalTrades = totalTrades,
                WinningTrades = winningTrades,
                LosingTrades = totalTrades - winningTrades,
                AverageWin = (decimal)(random.NextDouble() * 1000 + 100),
                AverageLoss = (decimal)(random.NextDouble() * 800 + 50),
                LargestWin = (decimal)(random.NextDouble() * 5000 + 500),
                LargestLoss = (decimal)(random.NextDouble() * 3000 + 200),
                TotalPnL = totalReturn * 10000, // Assume $10k starting capital
                TotalFees = (decimal)(totalTrades * (random.NextDouble() * 5 + 1)) // $1-6 per trade
            };
        }

        private List<BacktestTrade> GenerateSampleTrades(DateTime startDate, DateTime endDate)
        {
            var trades = new List<BacktestTrade>();
            var random = new Random();
            var symbols = new[] { "ES", "NQ", "YM", "CL", "GC", "SI", "ZB", "ZN" };
            var sides = new[] { "Buy", "Sell" };
            var exitReasons = new[] { "Take Profit", "Stop Loss", "Signal", "Time Exit" };

            var currentDate = startDate;
            var tradeCount = random.Next(20, 100);

            for (int i = 0; i < tradeCount; i++)
            {
                var entryTime = currentDate.AddDays(random.Next(0, (int)(endDate - startDate).TotalDays));
                var exitTime = entryTime.AddHours(random.Next(1, 48));
                var symbol = symbols[random.Next(symbols.Length)];
                var side = sides[random.Next(sides.Length)];
                var quantity = random.Next(1, 10);
                var entryPrice = (decimal)(random.NextDouble() * 5000 + 100);
                var exitPrice = entryPrice + (decimal)((random.NextDouble() - 0.5) * 200);
                var pnl = side == "Buy" ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
                var fees = (decimal)(random.NextDouble() * 5 + 1);

                trades.Add(new BacktestTrade
                {
                    EntryTime = entryTime,
                    ExitTime = exitTime,
                    Symbol = symbol,
                    Side = side,
                    Quantity = quantity,
                    EntryPrice = entryPrice,
                    ExitPrice = exitPrice,
                    PnL = pnl,
                    Fees = fees,
                    ExitReason = exitReasons[random.Next(exitReasons.Length)],
                    IsOpen = false
                });

                currentDate = exitTime;
            }

            return trades.OrderBy(t => t.EntryTime).ToList();
        }
    }

    public class BacktestRequest
    {
        public string StrategyId { get; set; } = string.Empty;
        public string StrategyName { get; set; } = string.Empty;
        public string AccountId { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
    }
}
