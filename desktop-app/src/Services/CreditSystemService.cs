using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.IO;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace QuantumTrader.Services
{
	/// <summary>
	/// Manages the pay-as-you-go credit system for AI strategy building
	/// </summary>
	public class CreditSystemService
	{
		private readonly string _creditsFilePath;
		private UserCredits _userCredits;
		private readonly CreditsDbContext _dbContext;
		private readonly bool _useDb;

		public CreditSystemService(CreditsDbContext dbContext = null)
		{
			_dbContext = dbContext;
			_useDb = _dbContext != null;
			_creditsFilePath = "user_credits.json";

			if (_useDb)
			{
				try
				{
					_dbContext.Database.EnsureCreated();
				}
				catch { _useDb = false; }
			}

			LoadCredits();
		}

		public decimal GetAvailableCredits()
		{
			return _userCredits?.AvailableCredits ?? 0.00m;
		}

		public async Task<bool> AddCreditsAsync(decimal amount, string paymentMethod = "stripe")
		{
			try
			{
				if (amount <= 0) return false;
				if (_userCredits == null) _userCredits = new UserCredits();

				_userCredits.AvailableCredits += amount;
				_userCredits.TotalCreditsPurchased += amount;
				_userCredits.LastUpdated = DateTime.UtcNow;

				_userCredits.Transactions.Add(new CreditTransaction
				{
					Id = Guid.NewGuid(),
					Type = TransactionType.Purchase,
					Amount = amount,
					BalanceAfter = _userCredits.AvailableCredits,
					PaymentMethod = paymentMethod,
					Timestamp = DateTime.UtcNow,
					Description = $"Added ${amount:F2} credits"
				});

				await PersistAsync();
				return true;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error adding credits: {ex.Message}");
				return false;
			}
		}

		public async Task<bool> DeductCreditsForStrategyGenerationAsync() => await DeductCreditsAsync(5.00m, "AI Strategy Generation");
		public async Task<bool> DeductCreditsForBacktestAsync() => await DeductCreditsAsync(2.50m, "Strategy Backtest");
		public async Task<bool> DeductCreditsForOptimizationAsync() => await DeductCreditsAsync(3.00m, "AI Strategy Optimization");
		public bool HasSufficientCredits(decimal requiredAmount) => GetAvailableCredits() >= requiredAmount;
		public List<CreditTransaction> GetTransactionHistory() => _userCredits?.Transactions ?? new List<CreditTransaction>();

		public CreditUsageStats GetUsageStats()
		{
			if (_userCredits == null) return new CreditUsageStats();
			var transactions = _userCredits.Transactions;
			var totalSpent = transactions.Where(t => t.Type == TransactionType.Deduction).Sum(t => t.Amount);
			var totalPurchased = transactions.Where(t => t.Type == TransactionType.Purchase).Sum(t => t.Amount);
			return new CreditUsageStats
			{
				TotalCreditsPurchased = totalPurchased,
				TotalCreditsSpent = totalSpent,
				CurrentBalance = _userCredits.AvailableCredits,
				StrategyGenerations = transactions.Count(t => t.Description.Contains("Strategy Generation")),
				Backtests = transactions.Count(t => t.Description.Contains("Backtest")),
				Optimizations = transactions.Count(t => t.Description.Contains("Optimization"))
			};
		}

		private async Task<bool> DeductCreditsAsync(decimal amount, string description)
		{
			try
			{
				if (_userCredits == null || _userCredits.AvailableCredits < amount) return false;
				_userCredits.AvailableCredits -= amount;
				_userCredits.TotalCreditsSpent += amount;
				_userCredits.LastUpdated = DateTime.UtcNow;

				_userCredits.Transactions.Add(new CreditTransaction
				{
					Id = Guid.NewGuid(),
					Type = TransactionType.Deduction,
					Amount = amount,
					BalanceAfter = _userCredits.AvailableCredits,
					Timestamp = DateTime.UtcNow,
					Description = description
				});

				await PersistAsync();
				return true;
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error deducting credits: {ex.Message}");
				return false;
			}
		}

		private void LoadCredits()
		{
			try
			{
				if (_useDb)
				{
					var entity = _dbContext.UserCredits.FirstOrDefault(e => e.UserId == "default");
					_userCredits = entity != null ? MapFromEntity(entity) : new UserCredits { AvailableCredits = 0 };
					if (entity == null)
					{
						PersistAsync().Wait();
					}
					return;
				}

				if (File.Exists(_creditsFilePath))
				{
					var json = File.ReadAllText(_creditsFilePath);
					_userCredits = JsonConvert.DeserializeObject<UserCredits>(json);
				}
				else
				{
					_userCredits = new UserCredits
					{
						AvailableCredits = 1245.00m,
						TotalCreditsPurchased = 1500.00m,
						TotalCreditsSpent = 255.00m,
						LastUpdated = DateTime.UtcNow,
						Transactions = new List<CreditTransaction>()
					};
					SaveCreditsAsync().Wait();
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error loading credits: {ex.Message}");
				_userCredits = new UserCredits();
			}
		}

		private async Task PersistAsync()
		{
			if (_useDb)
			{
				var entity = _dbContext.UserCredits.FirstOrDefault(e => e.UserId == "default");
				if (entity == null)
				{
					entity = new UserCreditsEntity { UserId = "default" };
					_dbContext.UserCredits.Add(entity);
				}
				entity.AvailableCredits = _userCredits.AvailableCredits;
				entity.TotalCreditsPurchased = _userCredits.TotalCreditsPurchased;
				entity.TotalCreditsSpent = _userCredits.TotalCreditsSpent;
				entity.LastUpdated = _userCredits.LastUpdated;
				await _dbContext.SaveChangesAsync();

				// For audit, write latest transaction row (optional simplification)
				var last = _userCredits.Transactions.LastOrDefault();
				if (last != null)
				{
					_dbContext.CreditTransactions.Add(new CreditTransactionEntity
					{
						UserCreditsId = entity.Id,
						Type = last.Type.ToString(),
						Amount = last.Amount,
						BalanceAfter = last.BalanceAfter,
						PaymentMethod = last.PaymentMethod,
						Timestamp = last.Timestamp,
						Description = last.Description
					});
					await _dbContext.SaveChangesAsync();
				}
			}
			else
			{
				await SaveCreditsAsync();
			}
		}

		private static UserCredits MapFromEntity(UserCreditsEntity entity)
		{
			return new UserCredits
			{
				AvailableCredits = entity.AvailableCredits,
				TotalCreditsPurchased = entity.TotalCreditsPurchased,
				TotalCreditsSpent = entity.TotalCreditsSpent,
				LastUpdated = entity.LastUpdated,
				Transactions = new List<CreditTransaction>()
			};
		}

		private async Task SaveCreditsAsync()
		{
			try
			{
				var json = JsonConvert.SerializeObject(_userCredits, Formatting.Indented);
				await File.WriteAllTextAsync(_creditsFilePath, json);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Error saving credits: {ex.Message}");
			}
		}
	}

	public class UserCredits
	{
		public decimal AvailableCredits { get; set; } = 0.00m;
		public decimal TotalCreditsPurchased { get; set; } = 0.00m;
		public decimal TotalCreditsSpent { get; set; } = 0.00m;
		public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
		public List<CreditTransaction> Transactions { get; set; } = new List<CreditTransaction>();
	}

	public class CreditTransaction
	{
		public Guid Id { get; set; }
		public TransactionType Type { get; set; }
		public decimal Amount { get; set; }
		public decimal BalanceAfter { get; set; }
		public string PaymentMethod { get; set; } = "";
		public DateTime Timestamp { get; set; }
		public string Description { get; set; } = "";
	}

	public enum TransactionType { Purchase, Deduction, Refund }

	public class CreditUsageStats
	{
		public decimal TotalCreditsPurchased { get; set; }
		public decimal TotalCreditsSpent { get; set; }
		public decimal CurrentBalance { get; set; }
		public int StrategyGenerations { get; set; }
		public int Backtests { get; set; }
		public int Optimizations { get; set; }
	}
}
