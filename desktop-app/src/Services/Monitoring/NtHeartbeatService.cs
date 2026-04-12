using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;

namespace QuantumTrader.Services
{
	public class NtHeartbeatService : BackgroundService
	{
		private readonly ILogger<NtHeartbeatService> _logger;
		private readonly IBrokerAdapter _adapter;
		private readonly IReconStatus _status;

		public NtHeartbeatService(ILogger<NtHeartbeatService> logger, IBrokerAdapter adapter, IReconStatus status)
		{
			_logger = logger;
			_adapter = adapter;
			_status = status;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					var ok = await _adapter.IsHealthyAsync(stoppingToken);
					if (!ok)
					{
						_status.MarkError("NT bridge health check failed");
					}
				}
				catch (Exception ex)
				{
					_logger.LogWarning(ex, "Heartbeat error");
				}
				await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
			}
		}
	}
}


