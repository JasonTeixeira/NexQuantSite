using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;

namespace QuantumTrader.Services
{
	public class DailyPnlAggregator : BackgroundService
	{
		private readonly ILogger<DailyPnlAggregator> _logger;
		private readonly IBrokerAdapter _adapter;
		private readonly IRiskStateStore _riskState;

		public DailyPnlAggregator(ILogger<DailyPnlAggregator> logger, IBrokerAdapter adapter, IRiskStateStore riskState)
		{
			_logger = logger;
			_adapter = adapter;
			_riskState = riskState;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			var lastResetDate = DateTime.UtcNow.Date;
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					// Reset daily at UTC midnight
					if (DateTime.UtcNow.Date > lastResetDate)
					{
						// In a full implementation, reset per-account state here
						lastResetDate = DateTime.UtcNow.Date;
					}
					var positions = await _adapter.GetPositionsAsync(stoppingToken);
					// Approximate daily PnL as current unrealized while we wire realized fills
					var byAccount = positions.GroupBy(p => p.TradingAccountId).Select(g => new { AccountId = g.Key, Unreal = g.Sum(p => p.UnrealizedPnL) });
					foreach (var a in byAccount)
					{
						_riskState.SetDailyPnl(a.AccountId.ToString(), a.Unreal);
					}
				}
				catch (Exception ex)
				{
					_logger.LogWarning(ex, "Daily PnL aggregation error");
				}
				await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
			}
		}
	}
}


