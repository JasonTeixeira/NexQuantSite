using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuantumTrader.Models;
using QuantumTrader.Utils;

namespace QuantumTrader.Services
{
	public class SimExecutionService : IExecutionService
	{
		private readonly List<OrderItem> _orders = new();
		private readonly List<PositionItem> _positions = new();
		private readonly IEmergencyService _emergency;
		private readonly IDailyRiskGuard _dailyGuard;
		private readonly IPositionLimitService _posLimits;
		private readonly IToastService _toasts;
		private readonly IOrderRateLimiter _rateLimiter;
		private readonly IGatewayClient _gatewayClient;
		private readonly Dictionary<string, string> _accountProviders = new();

		public IReadOnlyList<OrderItem> Orders => _orders;
		public IReadOnlyList<PositionItem> Positions => _positions;

		public SimExecutionService()
		{
			_emergency = new EmergencyService();
			_dailyGuard = new DailyRiskGuard();
			_posLimits = new PositionLimitService(new InMemoryRiskService());
			_toasts = new InMemoryToastService();
			_rateLimiter = new OrderRateLimiter();
		}

		public SimExecutionService(IEmergencyService emergency, IDailyRiskGuard dailyGuard, IPositionLimitService posLimits, IToastService toasts, IGatewayClient gatewayClient)
		{
			_emergency = emergency;
			_dailyGuard = dailyGuard;
			_posLimits = posLimits;
			_toasts = toasts;
			_rateLimiter = new OrderRateLimiter();
			_gatewayClient = gatewayClient;
		}

		public async Task<OrderItem> SubmitAsync(string accountId, string symbol, string side, int qty, string orderType, decimal price)
		{
			if (_emergency.IsActive)
			{
				_toasts.ShowError("Emergency stop active. Orders are blocked.");
				AuditLogger.Write("ORDER_BLOCKED", $"{accountId}\tEMERGENCY\t{symbol}\t{qty}");
				throw new InvalidOperationException("Emergency stop active");
			}

			if (_dailyGuard.IsLocked(accountId))
			{
				_toasts.ShowError("Daily loss lock active. Trading disabled for this account.");
				AuditLogger.Write("ORDER_BLOCKED", $"{accountId}\tDAILY_LOCK\t{symbol}\t{qty}");
				throw new InvalidOperationException("Daily loss lock active");
			}

			if (!_posLimits.IsWithinLimit(accountId, symbol, qty, _positions))
			{
				_toasts.ShowWarning("Position size exceeds limit. Order rejected.");
				AuditLogger.Write("ORDER_REJECTED", $"{accountId}\tPOSITION_LIMIT\t{symbol}\t{qty}");
				throw new InvalidOperationException("Position size exceeds limit");
			}

			if (!_rateLimiter.Allow(accountId))
			{
				_toasts.ShowWarning("Order rate limit exceeded. Please slow down.");
				throw new InvalidOperationException("Rate limit exceeded");
			}

			// Get provider for this account
			var provider = _accountProviders.GetValueOrDefault(accountId, "Simulated");
			
			try
			{
				// Send order to gateway
				var request = new GatewayRequest
				{
					Action = "PLACE_ORDER",
					Provider = provider,
					Account = accountId,
					Symbol = symbol,
					Side = side,
					Quantity = qty,
					Price = price,
					OrderType = orderType,
					ClientOrderId = Guid.NewGuid().ToString()
				};

				var response = await _gatewayClient.SendRequestAsync(request);
				
				if (response.Success)
				{
					var order = new OrderItem 
					{ 
						Symbol = symbol, 
						Side = side, 
						Quantity = qty, 
						OrderType = orderType, 
						Price = price, 
						Status = "FILLED"
					};
					_orders.Add(order);
					AuditLogger.Write("ORDER", $"{accountId}\t{side}\t{qty}\t{symbol}\t{price}\t{provider}");
					
					// Update positions based on gateway response
					await UpdatePositionsFromGateway(accountId);
					
					return order;
				}
				else
				{
					_toasts.ShowError($"Order failed: {response.Error}");
					AuditLogger.Write("ORDER_FAILED", $"{accountId}\t{response.Error}\t{symbol}\t{qty}");
					throw new InvalidOperationException($"Gateway error: {response.Error}");
				}
			}
			catch (Exception ex)
			{
				_toasts.ShowError($"Gateway communication error: {ex.Message}");
				AuditLogger.Write("GATEWAY_ERROR", $"{accountId}\t{ex.Message}\t{symbol}\t{qty}");
				throw;
			}
		}

		public async Task CancelAsync(string orderId)
		{
			var order = _orders.FirstOrDefault(o => o.Symbol == orderId || o.OrderType == orderId);
			if (order == null)
			{
				_toasts.ShowWarning("Order not found for cancellation");
				return;
			}

			var provider = _accountProviders.GetValueOrDefault("", "Simulated");
			
			try
			{
				var request = new GatewayRequest
				{
					Action = "CANCEL_ORDER",
					Provider = provider,
					OrderId = orderId
				};

				var response = await _gatewayClient.SendRequestAsync(request);
				
				if (response.Success)
				{
					order.Status = "CANCELED";
					AuditLogger.Write("CANCEL", $"{orderId}\t{provider}");
				}
				else
				{
					_toasts.ShowError($"Cancel failed: {response.Error}");
					AuditLogger.Write("CANCEL_FAILED", $"{orderId}\t{response.Error}");
				}
			}
			catch (Exception ex)
			{
				_toasts.ShowError($"Cancel communication error: {ex.Message}");
				AuditLogger.Write("CANCEL_ERROR", $"{orderId}\t{ex.Message}");
			}
		}

		public async Task FlattenAsync(string accountId)
		{
			var provider = _accountProviders.GetValueOrDefault(accountId, "Simulated");
			
			try
			{
				var request = new GatewayRequest
				{
					Action = "FLATTEN_ALL",
					Provider = provider,
					Account = accountId
				};

				var response = await _gatewayClient.SendRequestAsync(request);
				
				if (response.Success)
				{
					_positions.Clear();
					AuditLogger.Write("FLATTEN", $"{accountId}\t{provider}");
					_toasts.ShowInfo("All positions flattened");
				}
				else
				{
					_toasts.ShowError($"Flatten failed: {response.Error}");
					AuditLogger.Write("FLATTEN_FAILED", $"{accountId}\t{response.Error}");
				}
			}
			catch (Exception ex)
			{
				_toasts.ShowError($"Flatten communication error: {ex.Message}");
				AuditLogger.Write("FLATTEN_ERROR", $"{accountId}\t{ex.Message}");
			}
		}

		public void SetAccountProvider(string accountId, string provider)
		{
			_accountProviders[accountId] = provider;
		}

		private async Task UpdatePositionsFromGateway(string accountId)
		{
			try
			{
				var provider = _accountProviders.GetValueOrDefault(accountId, "Simulated");
				var request = new GatewayRequest
				{
					Action = "GET_POSITIONS",
					Provider = provider,
					Account = accountId
				};

				var response = await _gatewayClient.SendRequestAsync(request);
				
				if (response.Success && response.Positions != null)
				{
					// Update local positions from gateway
					_positions.Clear();
					foreach (var gatewayPos in response.Positions)
					{
						_positions.Add(new PositionItem
						{
							Symbol = gatewayPos.Symbol,
							Quantity = gatewayPos.Quantity,
							AvgPrice = gatewayPos.AveragePrice,
							CurrentPrice = gatewayPos.AveragePrice, // Use avg price as current for now
							PnL = gatewayPos.UnrealizedPnL
						});
					}
				}
			}
			catch (Exception ex)
			{
				// Log but don't fail the order
				AuditLogger.Write("POSITION_SYNC_ERROR", $"{accountId}\t{ex.Message}");
			}
		}

		// Simulate price drift and recompute PnL
		public void Tick()
		{
			var rnd = new Random();
			foreach (var p in _positions)
			{
				var drift = (decimal)((rnd.NextDouble() - 0.5) * 0.5); // small drift
				p.CurrentPrice = Math.Max(0.01m, p.CurrentPrice + drift);
				var dir = p.Side?.ToUpperInvariant() == "SELL" ? -1 : 1;
				p.PnL = (p.CurrentPrice - p.AvgPrice) * p.Quantity * dir;
			}
		}
	}
}


