using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;
using QuantumTrader.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuantumTrader.Services
{
    public interface IPnLCalculationService
    {
        Task<decimal> GetTotalPnLAsync();
        Task<decimal> GetDailyPnLAsync();
        Task<decimal> GetUnrealizedPnLAsync();
        Task<decimal> GetRealizedPnLAsync();
        Task<Dictionary<string, decimal>> GetPnLBySymbolAsync();
        Task<List<DailyPnLRecord>> GetDailyPnLHistoryAsync(int days = 30);
    }

    public class DailyPnLRecord
    {
        public DateTime Date { get; set; }
        public decimal RealizedPnL { get; set; }
        public decimal UnrealizedPnL { get; set; }
        public decimal TotalPnL => RealizedPnL + UnrealizedPnL;
    }

    public class PnLCalculationService : IPnLCalculationService
    {
        private readonly IBrokerAdapter _brokerAdapter;
        private readonly ILogger<PnLCalculationService> _logger;

        public PnLCalculationService(IBrokerAdapter brokerAdapter, ILogger<PnLCalculationService> logger)
        {
            _brokerAdapter = brokerAdapter;
            _logger = logger;
        }

        public async Task<decimal> GetTotalPnLAsync()
        {
            try
            {
                var realized = await GetRealizedPnLAsync();
                var unrealized = await GetUnrealizedPnLAsync();
                return realized + unrealized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate total P&L");
                return 0m;
            }
        }

        public async Task<decimal> GetDailyPnLAsync()
        {
            try
            {
                var today = DateTime.Today;
                var fills = await _brokerAdapter.GetRecentFillsAsync(100);

                var todaysFills = fills.Where(f => f.FilledAtUtc.Date == today).ToList();

                decimal dailyRealized = 0m;
                foreach (var fill in todaysFills)
                {
                    // Calculate realized P&L from fills
                    // For simplicity, assuming each fill contributes to P&L
                    // In reality, you'd need to track entry/exit prices
                    dailyRealized += CalculateFillPnL(fill);
                }

                return dailyRealized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate daily P&L");
                return 0m;
            }
        }

        public async Task<decimal> GetUnrealizedPnLAsync()
        {
            try
            {
                var positions = await _brokerAdapter.GetPositionsAsync();
                decimal totalUnrealized = 0m;

                foreach (var position in positions)
                {
                    if (position.Quantity != 0)
                    {
                        // Get current market price (simplified - using last price)
                        var currentPrice = await GetCurrentPrice(position.Symbol);
                        var unrealizedPnL = (currentPrice - position.AveragePrice) * position.Quantity;
                        totalUnrealized += unrealizedPnL;
                    }
                }

                return totalUnrealized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate unrealized P&L");
                return 0m;
            }
        }

        public async Task<decimal> GetRealizedPnLAsync()
        {
            try
            {
                var fills = await _brokerAdapter.GetRecentFillsAsync(1000); // Get more history

                decimal totalRealized = 0m;
                var positionTracker = new Dictionary<string, List<BrokerFill>>();

                // Group fills by symbol
                foreach (var fill in fills.OrderBy(f => f.FilledAtUtc))
                {
                    if (!positionTracker.ContainsKey(fill.Symbol))
                        positionTracker[fill.Symbol] = new List<BrokerFill>();

                    positionTracker[fill.Symbol].Add(fill);
                }

                // Calculate realized P&L for each symbol
                foreach (var symbolFills in positionTracker)
                {
                    totalRealized += CalculateSymbolRealizedPnL(symbolFills.Value);
                }

                return totalRealized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate realized P&L");
                return 0m;
            }
        }

        public async Task<Dictionary<string, decimal>> GetPnLBySymbolAsync()
        {
            try
            {
                var positions = await _brokerAdapter.GetPositionsAsync();
                var pnlBySymbol = new Dictionary<string, decimal>();

                foreach (var position in positions)
                {
                    var currentPrice = await GetCurrentPrice(position.Symbol);
                    var unrealizedPnL = (currentPrice - position.AveragePrice) * position.Quantity;
                    pnlBySymbol[position.Symbol] = unrealizedPnL;
                }

                return pnlBySymbol;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate P&L by symbol");
                return new Dictionary<string, decimal>();
            }
        }

        public async Task<List<DailyPnLRecord>> GetDailyPnLHistoryAsync(int days = 30)
        {
            try
            {
                var history = new List<DailyPnLRecord>();
                var fills = await _brokerAdapter.GetRecentFillsAsync(10000); // Get extensive history

                var startDate = DateTime.Today.AddDays(-days);

                for (int i = 0; i < days; i++)
                {
                    var date = startDate.AddDays(i);
                    var dayFills = fills.Where(f => f.FilledAtUtc.Date == date).ToList();

                    var dailyRealized = dayFills.Sum(f => CalculateFillPnL(f));

                    history.Add(new DailyPnLRecord
                    {
                        Date = date,
                        RealizedPnL = dailyRealized,
                        UnrealizedPnL = 0m // Would need end-of-day positions for this
                    });
                }

                return history;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get daily P&L history");
                return new List<DailyPnLRecord>();
            }
        }

        private decimal CalculateFillPnL(BrokerFill fill)
        {
            // Simplified P&L calculation
            // In reality, you'd need to match buys/sells and calculate based on entry/exit
            // For now, assume each fill has some P&L impact
            return fill.Side.ToLower() == "buy" ? -Math.Abs(fill.Price * fill.Quantity * 0.001m) : Math.Abs(fill.Price * fill.Quantity * 0.001m);
        }

        private decimal CalculateSymbolRealizedPnL(List<BrokerFill> fills)
        {
            // FIFO P&L calculation
            var buyQueue = new Queue<BrokerFill>();
            decimal realizedPnL = 0m;

            foreach (var fill in fills)
            {
                if (fill.Side.ToLower() == "buy")
                {
                    buyQueue.Enqueue(fill);
                }
                else if (fill.Side.ToLower() == "sell")
                {
                    var remainingQty = fill.Quantity;

                    while (remainingQty > 0 && buyQueue.Count > 0)
                    {
                        var buyFill = buyQueue.Peek();
                        var matchQty = Math.Min(remainingQty, buyFill.Quantity);

                        // Calculate P&L for this match
                        realizedPnL += (fill.Price - buyFill.Price) * matchQty;

                        remainingQty -= matchQty;
                        buyFill.Quantity -= matchQty;

                        if (buyFill.Quantity == 0)
                            buyQueue.Dequeue();
                    }
                }
            }

            return realizedPnL;
        }

        private async Task<decimal> GetCurrentPrice(string symbol)
        {
            try
            {
                // For now, use a mock price
                // In reality, you'd get this from market data feed
                var random = new Random();
                return 100m + (decimal)(random.NextDouble() * 20 - 10); // Random price around 100
            }
            catch
            {
                return 100m; // Fallback price
            }
        }
    }
}
