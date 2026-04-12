using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
	public class InMemoryAccountService : IAccountService
	{
		private readonly List<Account> _accounts = new();

		public InMemoryAccountService()
		{
			// Add some sample accounts
			_accounts.Add(new Account { Id = "1", Name = "Main Trading", Type = AccountType.Live, Broker = "Interactive Brokers", Balance = 250000, IsActive = true });
			_accounts.Add(new Account { Id = "2", Name = "Demo Account", Type = AccountType.Sim, Broker = "Paper Trading", Balance = 100000, IsActive = true });
		}

		public Task<IReadOnlyList<Account>> GetAccountsAsync()
		{
			return Task.FromResult<IReadOnlyList<Account>>(_accounts.ToList());
		}

		public Task<Account> SaveAccountAsync(Account account)
		{
			var existing = _accounts.FirstOrDefault(a => a.Id == account.Id);
			if (existing != null)
			{
				_accounts.Remove(existing);
			}
			_accounts.Add(account);
			return Task.FromResult(account);
		}

		public Task DeleteAccountAsync(string accountId)
		{
			var account = _accounts.FirstOrDefault(a => a.Id == accountId);
			if (account != null)
			{
				_accounts.Remove(account);
			}
			return Task.CompletedTask;
		}
	}

	public class InMemoryStrategyService : IStrategyService
	{
		private readonly List<StrategyConfig> _strategies = new();

		public InMemoryStrategyService()
		{
			_strategies.Add(new StrategyConfig { Id = "1", Name = "Momentum Breakout", Version = "1.0", Enabled = true });
			_strategies.Add(new StrategyConfig { Id = "2", Name = "Mean Reversion", Version = "1.0", Enabled = true });
			_strategies.Add(new StrategyConfig { Id = "3", Name = "Scalping", Version = "1.0", Enabled = true });
		}

		public Task<IReadOnlyList<StrategyConfig>> GetStrategiesAsync()
		{
			return Task.FromResult<IReadOnlyList<StrategyConfig>>(_strategies.ToList());
		}
	}

	public class InMemoryRiskService : IRiskService
	{
		private readonly Dictionary<string, RiskProfile> _profiles = new();

		public InMemoryRiskService()
		{
			_profiles["default"] = new RiskProfile
			{
				Id = "default",
				Name = "Default",
				MinContracts = 1,
				MaxContracts = 10,
				MaxDailyLossPct = 5.0,
				MaxPositionRiskPct = 2.0,
				ConfidenceGamma = 1.0
			};
		}

		public Task<RiskProfile> GetRiskProfileAsync(string accountId)
		{
			return Task.FromResult(_profiles.GetValueOrDefault("default", _profiles["default"]));
		}

		public Task<RiskProfile> SaveRiskProfileAsync(RiskProfile profile)
		{
			_profiles[profile.Id] = profile;
			return Task.FromResult(profile);
		}

		public int CalculateContracts(double confidence, int minContracts, int maxContracts, double gamma = 1.0)
		{
			var scaledConfidence = Math.Pow(confidence / 100.0, gamma);
			var contracts = (int)Math.Round(minContracts + (maxContracts - minContracts) * scaledConfidence);
			return Math.Max(minContracts, Math.Min(maxContracts, contracts));
		}

		public Task<RiskDecision> EvaluateAsync(RiskCheckInput input)
		{
			var contracts = CalculateContracts(input.Confidence, input.MinContracts, input.MaxContracts, input.ConfidenceGamma);
			
			// Basic risk checks
			if (input.SessionPnLPct <= -input.MaxDailyLossPct)
			{
				return Task.FromResult(new RiskDecision
				{
					Status = RiskDecisionStatus.Blocked,
					Reason = "Daily loss limit exceeded",
					Contracts = 0
				});
			}

			if (input.ProposedRiskPct > input.MaxPositionRiskPct)
			{
				return Task.FromResult(new RiskDecision
				{
					Status = RiskDecisionStatus.Blocked,
					Reason = "Position risk exceeds limit",
					Contracts = 0
				});
			}

			return Task.FromResult(new RiskDecision
			{
				Status = RiskDecisionStatus.Approved,
				Reason = "Risk check passed",
				Contracts = contracts
			});
		}
	}

	public class InMemorySchedulerService : ISchedulerService
	{
		private readonly Dictionary<string, List<AccountStrategy>> _schedules = new();

		public Task<IReadOnlyList<AccountStrategy>> GetSchedulesAsync(string accountId)
		{
			var schedules = _schedules.GetValueOrDefault(accountId, new List<AccountStrategy>());
			return Task.FromResult<IReadOnlyList<AccountStrategy>>(schedules);
		}

		public Task<AccountStrategy> SaveScheduleAsync(AccountStrategy schedule)
		{
			if (!_schedules.ContainsKey(schedule.AccountId))
			{
				_schedules[schedule.AccountId] = new List<AccountStrategy>();
			}

			var existing = _schedules[schedule.AccountId].FirstOrDefault(s => s.Id == schedule.Id);
			if (existing != null)
			{
				_schedules[schedule.AccountId].Remove(existing);
			}

			_schedules[schedule.AccountId].Add(schedule);
			return Task.FromResult(schedule);
		}
	}

	public class InMemoryAssignmentService : IAssignmentService
	{
		private readonly Dictionary<string, List<AccountStrategy>> _assignments = new();

		public Task<IReadOnlyList<AccountStrategy>> GetAssignmentsAsync(string accountId)
		{
			var assignments = _assignments.GetValueOrDefault(accountId, new List<AccountStrategy>());
			return Task.FromResult<IReadOnlyList<AccountStrategy>>(assignments);
		}

		public Task SaveAssignmentsAsync(string accountId, IReadOnlyList<AccountStrategy> assignments)
		{
			_assignments[accountId] = assignments.ToList();
			return Task.CompletedTask;
		}
	}

	public class InMemoryExecutionService : IExecutionService
	{
		private readonly List<OrderItem> _orders = new();
		private readonly List<PositionItem> _positions = new();

		public IReadOnlyList<OrderItem> Orders => _orders;
		public IReadOnlyList<PositionItem> Positions => _positions;

		public Task<OrderItem> SubmitAsync(string accountId, string symbol, string side, int qty, string orderType, decimal price)
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

			// Simulate position update
			var position = _positions.FirstOrDefault(p => p.Symbol == symbol);
			if (position == null)
			{
				position = new PositionItem
				{
					Symbol = symbol,
					Side = side,
					Quantity = qty,
					AvgPrice = price,
					CurrentPrice = price,
					PnL = 0
				};
				_positions.Add(position);
			}
			else
			{
				position.Quantity += side == "BUY" ? qty : -qty;
				position.AvgPrice = price; // simplistic
			}

			return Task.FromResult(order);
		}

		public Task CancelAsync(string orderId)
		{
			var order = _orders.FirstOrDefault(o => o.Symbol == orderId || o.OrderType == orderId);
			if (order != null)
			{
				order.Status = "CANCELED";
			}
			return Task.CompletedTask;
		}

		public Task FlattenAsync(string accountId)
		{
			_positions.Clear();
			return Task.CompletedTask;
		}
	}
}

namespace QuantumTrader.Services
{
	public class InMemoryToastService : IToastService
	{
		public void ShowInfo(string message)
		{
			Serilog.Log.Information($"Toast Info: {message}");
			Console.WriteLine($"[INFO] {message}");
		}

		public void ShowWarning(string message)
		{
			Serilog.Log.Warning($"Toast Warning: {message}");
			Console.WriteLine($"[WARNING] {message}");
		}

		public void ShowError(string message)
		{
			Serilog.Log.Error($"Toast Error: {message}");
			Console.WriteLine($"[ERROR] {message}");
			
			// Show error dialog for critical errors
			Application.Current.Dispatcher.Invoke(() =>
			{
				MessageBox.Show(message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
			});
		}
	}

	public class InMemoryAuditLogger : IAuditLogger
	{
		public void Log(string action, string details)
		{
			var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
			var logEntry = $"[{timestamp}] {action}: {details}";
			Console.WriteLine(logEntry);
		}
	}
}


