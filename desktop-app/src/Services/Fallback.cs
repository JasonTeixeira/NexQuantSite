using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
	public class FallbackAccountService : IAccountService
	{
		private readonly BackendAccountService _primary;
		private readonly InMemoryAccountService _fallback;

		public FallbackAccountService(BackendAccountService primary, InMemoryAccountService fallback)
		{
			_primary = primary;
			_fallback = fallback;
		}

		public async Task<IReadOnlyList<Account>> GetAccountsAsync()
		{
			try
			{
				return await _primary.GetAccountsAsync();
			}
			catch
			{
				return await _fallback.GetAccountsAsync();
			}
		}

		public async Task<Account> SaveAccountAsync(Account account)
		{
			try
			{
				return await _primary.SaveAccountAsync(account);
			}
			catch
			{
				return await _fallback.SaveAccountAsync(account);
			}
		}

		public async Task DeleteAccountAsync(string accountId)
		{
			try
			{
				await _primary.DeleteAccountAsync(accountId);
			}
			catch
			{
				await _fallback.DeleteAccountAsync(accountId);
			}
		}
	}

	public class FallbackStrategyService : IStrategyService
	{
		private readonly BackendStrategyService _primary;
		private readonly InMemoryStrategyService _fallback;

		public FallbackStrategyService(BackendStrategyService primary, InMemoryStrategyService fallback)
		{
			_primary = primary;
			_fallback = fallback;
		}

		public async Task<IReadOnlyList<StrategyConfig>> GetStrategiesAsync()
		{
			try
			{
				return await _primary.GetStrategiesAsync();
			}
			catch
			{
				return await _fallback.GetStrategiesAsync();
			}
		}
	}

	public class FallbackAssignmentService : IAssignmentService
	{
		private readonly BackendAssignmentService _primary;
		private readonly InMemoryAssignmentService _fallback;

		public FallbackAssignmentService(BackendAssignmentService primary, InMemoryAssignmentService fallback)
		{
			_primary = primary;
			_fallback = fallback;
		}

		public async Task<IReadOnlyList<AccountStrategy>> GetAssignmentsAsync(string accountId)
		{
			try
			{
				return await _primary.GetAssignmentsAsync(accountId);
			}
			catch
			{
				return await _fallback.GetAssignmentsAsync(accountId);
			}
		}

		public async Task SaveAssignmentsAsync(string accountId, IReadOnlyList<AccountStrategy> assignments)
		{
			try
			{
				await _primary.SaveAssignmentsAsync(accountId, assignments);
			}
			catch
			{
				await _fallback.SaveAssignmentsAsync(accountId, assignments);
			}
		}
	}

	public class FallbackRiskService : IRiskService
	{
		private readonly InMemoryRiskService _fallback;

		public FallbackRiskService(InMemoryRiskService fallback)
		{
			_fallback = fallback;
		}

		public Task<RiskProfile> GetRiskProfileAsync(string accountId) => _fallback.GetRiskProfileAsync(accountId);
		public Task<RiskProfile> SaveRiskProfileAsync(RiskProfile profile) => _fallback.SaveRiskProfileAsync(profile);
		public int CalculateContracts(double confidence, int minContracts, int maxContracts, double gamma = 1.0) => _fallback.CalculateContracts(confidence, minContracts, maxContracts, gamma);
		public Task<RiskDecision> EvaluateAsync(RiskCheckInput input) => _fallback.EvaluateAsync(input);
	}

	public class FallbackExecutionService : IExecutionService
	{
		private readonly InMemoryExecutionService _fallback;

		public FallbackExecutionService(InMemoryExecutionService fallback)
		{
			_fallback = fallback;
		}

		public Task<OrderItem> SubmitAsync(string accountId, string symbol, string side, int qty, string orderType, decimal price) => _fallback.SubmitAsync(accountId, symbol, side, qty, orderType, price);
		public Task CancelAsync(string orderId) => _fallback.CancelAsync(orderId);
		public Task FlattenAsync(string accountId) => _fallback.FlattenAsync(accountId);
		public IReadOnlyList<OrderItem> Orders => _fallback.Orders;
		public IReadOnlyList<PositionItem> Positions => _fallback.Positions;
	}
}


