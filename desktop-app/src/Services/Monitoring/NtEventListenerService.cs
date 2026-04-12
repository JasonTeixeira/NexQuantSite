using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;

namespace QuantumTrader.Services
{
	public class NtEventListenerService : BackgroundService
	{
		private readonly ILogger<NtEventListenerService> _logger;
		private readonly IConfiguration _config;
		private readonly IAuditLogger _audit;

		public NtEventListenerService(ILogger<NtEventListenerService> logger, IConfiguration config, IAuditLogger audit)
		{
			_logger = logger;
			_config = config;
			_audit = audit;
		}

		protected override async Task ExecuteAsync(CancellationToken stoppingToken)
		{
			var bridge = (_config["NinjaTrader:BridgeUrl"] ?? "http://127.0.0.1:8123/").TrimEnd('/');
			var wsUrl = bridge.Replace("http://", "ws://").Replace("https://", "wss://") + "/events";
			while (!stoppingToken.IsCancellationRequested)
			{
				try
				{
					using var ws = new ClientWebSocket();
					var token = _config["NinjaTrader:Token"] ?? string.Empty;
					if (!string.IsNullOrWhiteSpace(token)) ws.Options.SetRequestHeader("Authorization", $"Bearer {token}");
					await ws.ConnectAsync(new Uri(wsUrl), stoppingToken);
					var buffer = new byte[8192];
					var sb = new StringBuilder();
					while (ws.State == WebSocketState.Open && !stoppingToken.IsCancellationRequested)
					{
						var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), stoppingToken);
						if (result.MessageType == WebSocketMessageType.Close) break;
						sb.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));
						if (result.EndOfMessage)
						{
							var msg = sb.ToString();
							sb.Clear();
							HandleEvent(msg);
						}
					}
				}
				catch (Exception ex)
				{
					_logger.LogWarning(ex, "NT event listener error; reconnecting in 3s");
					await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);
				}
			}
		}

		private void HandleEvent(string json)
		{
			try
			{
				using var doc = JsonDocument.Parse(json);
				var root = doc.RootElement;
				var type = root.GetProperty("type").GetString();
				switch (type)
				{
					case "order_update":
					{
						// Bridge wraps payload as { type, timestamp, order: { ... } }
						var node = root.TryGetProperty("order", out var ord) ? ord : root;
						var id = node.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? string.Empty : string.Empty;
						var clientId = node.TryGetProperty("client_order_id", out var co) ? co.GetString() ?? string.Empty : string.Empty;
						var status = node.TryGetProperty("status", out var st) ? st.GetString() ?? string.Empty : string.Empty;
						foreach (var o in OrderBlotter.Orders)
						{
							if ((!string.IsNullOrEmpty(clientId) && o.ClientOrderId == clientId) || (!string.IsNullOrEmpty(id) && o.BrokerOrderId == id))
							{
								o.BrokerOrderId = string.IsNullOrEmpty(o.BrokerOrderId) ? id : o.BrokerOrderId;
								o.Status = status.ToUpperInvariant();
								break;
							}
						}
						_audit.Log(new { type = "nt_order_update", id, clientId, status, ts = DateTime.UtcNow });
						break;
					}
					case "fill":
					{
						var node = root.TryGetProperty("fill", out var fill) ? fill : root;
						var id = node.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? string.Empty : string.Empty;
						var clientId = node.TryGetProperty("client_order_id", out var co) ? co.GetString() ?? string.Empty : string.Empty;
						var symbol = node.TryGetProperty("symbol", out var sy) ? sy.GetString() ?? string.Empty : string.Empty;
						var qty = node.TryGetProperty("qty", out var q) ? q.GetInt32() : 0;
						var price = node.TryGetProperty("price", out var pr) ? pr.GetDecimal() : 0m;
						_audit.Log(new { type = "nt_fill", id, clientId, symbol, qty, price, ts = DateTime.UtcNow });
						break;
					}
					case "heartbeat":
						_audit.Log(new { type = "nt_heartbeat", ts = DateTime.UtcNow });
						break;
				}
			}
			catch (Exception ex)
			{
				_logger.LogWarning(ex, "Failed to handle NT event: {Json}", json);
			}
		}
	}
}


