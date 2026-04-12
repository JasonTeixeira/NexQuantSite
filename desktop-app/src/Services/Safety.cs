using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuantumTrader.Models;
using QuantumTrader.Utils;

namespace QuantumTrader.Services
{
	public interface IEmergencyService
	{
		bool IsActive { get; }
		string? ActiveReason { get; }
		Task ActivateAsync(string reason);
		Task DeactivateAsync();
	}

	public interface IDailyRiskGuard
	{
		bool IsLocked(string accountId);
		DateTime? LockedUntil(string accountId);
		Task LockUntilAsync(string accountId, DateTime untilUtc, string reason);
		Task ClearLockAsync(string accountId);
	}

	public interface IPositionLimitService
	{
		int GetMaxContracts(string accountId);
		bool IsWithinLimit(string accountId, string symbol, int newOrderQty, IReadOnlyList<PositionItem> currentPositions);
	}

	public class EmergencyService : IEmergencyService
	{
		private volatile bool _active;
		private string? _reason;

		public bool IsActive => _active;
		public string? ActiveReason => _reason;

		public Task ActivateAsync(string reason)
		{
			_active = true;
			_reason = reason;
			AuditLogger.Write("EMERGENCY", $"activated reason={reason}");
			return Task.CompletedTask;
		}

		public Task DeactivateAsync()
		{
			_active = false;
			AuditLogger.Write("EMERGENCY", "deactivated");
			_reason = null;
			return Task.CompletedTask;
		}
	}

	public class DailyRiskGuard : IDailyRiskGuard
	{
		private readonly ConcurrentDictionary<string, DateTime> _locks = new();

		public bool IsLocked(string accountId)
		{
			return _locks.TryGetValue(accountId, out var until) && until > DateTime.UtcNow;
		}

		public DateTime? LockedUntil(string accountId)
		{
			return _locks.TryGetValue(accountId, out var until) ? until : null;
		}

		public Task LockUntilAsync(string accountId, DateTime untilUtc, string reason)
		{
			_locks[accountId] = untilUtc;
			AuditLogger.Write("RISK_LIMIT", $"lock accountId={accountId} until={untilUtc:O} reason={reason}");
			return Task.CompletedTask;
		}

		public Task ClearLockAsync(string accountId)
		{
			_locks.TryRemove(accountId, out _);
			AuditLogger.Write("RISK_LIMIT", $"unlock accountId={accountId}");
			return Task.CompletedTask;
		}
	}

	public class PositionLimitService : IPositionLimitService
	{
		private readonly IRiskService _riskService;

		public PositionLimitService(IRiskService riskService)
		{
			_riskService = riskService;
		}

		public int GetMaxContracts(string accountId)
		{
			// Use risk profile's MaxContracts
			var profile = _riskService.GetRiskProfileAsync(accountId).GetAwaiter().GetResult();
			return Math.Max(1, profile.MaxContracts);
		}

		public bool IsWithinLimit(string accountId, string symbol, int newOrderQty, IReadOnlyList<PositionItem> currentPositions)
		{
			var maxContracts = GetMaxContracts(accountId);
			var existingQty = currentPositions.Where(p => p.Symbol == symbol).Sum(p => Math.Abs(p.Quantity));
			var projected = existingQty + Math.Abs(newOrderQty);
			return projected <= maxContracts;
		}
	}


}


