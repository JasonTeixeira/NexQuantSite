using System.Collections.Generic;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
	public interface IAccountService
	{
		Task<IReadOnlyList<Account>> GetAccountsAsync();
		Task<Account> SaveAccountAsync(Account account);
		Task DeleteAccountAsync(string accountId);
	}

	public interface IStrategyService
	{
		Task<IReadOnlyList<StrategyConfig>> GetStrategiesAsync();
	}

	public interface IRiskService
	{
		Task<RiskProfile> GetRiskProfileAsync(string accountId);
		Task<RiskProfile> SaveRiskProfileAsync(RiskProfile profile);
		int CalculateContracts(double confidence, int minContracts, int maxContracts, double gamma = 1.0);
		Task<RiskDecision> EvaluateAsync(RiskCheckInput input);
	}

	public interface ISchedulerService
	{
		Task<IReadOnlyList<AccountStrategy>> GetSchedulesAsync(string accountId);
		Task<AccountStrategy> SaveScheduleAsync(AccountStrategy schedule);
	}

	public interface IAssignmentService
	{
		Task<IReadOnlyList<AccountStrategy>> GetAssignmentsAsync(string accountId);
		Task SaveAssignmentsAsync(string accountId, IReadOnlyList<AccountStrategy> assignments);
	}

	public interface IExecutionService
	{
		Task<OrderItem> SubmitAsync(string accountId, string symbol, string side, int qty, string orderType, decimal price);
		Task CancelAsync(string orderId);
		Task FlattenAsync(string accountId);
		IReadOnlyList<OrderItem> Orders { get; }
		IReadOnlyList<PositionItem> Positions { get; }
	}

	public interface IAuditLogger
	{
		void Log(string action, string details);
	}

	public interface IToastService
	{
		void ShowInfo(string message);
		void ShowWarning(string message);
		void ShowError(string message);
	}
}


