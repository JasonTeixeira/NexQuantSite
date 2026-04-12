using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using QuantumTrader.Utils;

namespace QuantumTrader.Services
{
	public class NewsContext
	{
		public bool IsHighImpact { get; set; }
		public DateTime? EmbargoUntilUtc { get; set; }
		public string Severity { get; set; } = "low"; // low/medium/high
		public string? EventTitle { get; set; }
	}

	public interface INewsContextService
	{
		Task<NewsContext> GetSymbolContextAsync(string symbol);
	}

	public interface INewsPolicyService
	{
		// Returns true if the order should be blocked due to news embargo/policy
		Task<bool> ShouldBlockAsync(string accountId, string symbol, string action);
	}

	// Minimal stub: always allow for now, but provides a seam for real enforcement
	public class InMemoryNewsContextService : INewsContextService
	{
		public Task<NewsContext> GetSymbolContextAsync(string symbol)
		{
			// Placeholder: no embargo
			return Task.FromResult(new NewsContext
			{
				IsHighImpact = false,
				EmbargoUntilUtc = null,
				Severity = "low",
				EventTitle = null
			});
		}
	}

	public class InMemoryNewsPolicyService : INewsPolicyService
	{
		private readonly INewsContextService _contextService;
		private readonly IMLNewsService _mlNewsService;

		public InMemoryNewsPolicyService(INewsContextService contextService, IMLNewsService mlNewsService)
		{
			_contextService = contextService;
			_mlNewsService = mlNewsService;
		}

		public async Task<bool> ShouldBlockAsync(string accountId, string symbol, string action)
		{
			// Check local context first
			var ctx = await _contextService.GetSymbolContextAsync(symbol);
			if (ctx.IsHighImpact && ctx.EmbargoUntilUtc.HasValue && ctx.EmbargoUntilUtc.Value > DateTime.UtcNow)
			{
				AuditLogger.Write("NEWS_BLOCK", $"{accountId}\t{symbol}\t{ctx.Severity}\tuntil={ctx.EmbargoUntilUtc:O}");
				return true;
			}

			// Check ML API context as well
			try
			{
				var mlContext = await _mlNewsService.GetSymbolContextAsync(symbol, accountId);
				if (mlContext.IsHighImpact && mlContext.EmbargoUntil.HasValue && mlContext.EmbargoUntil.Value > DateTime.UtcNow)
				{
					AuditLogger.Write("ML_NEWS_BLOCK", $"{accountId}\t{symbol}\t{mlContext.Severity}\tuntil={mlContext.EmbargoUntil:O}");
					return true;
				}
			}
			catch (Exception ex)
			{
				// Log but don't block if ML service is unavailable
				System.Diagnostics.Debug.WriteLine($"ML News Service error: {ex.Message}");
			}

			return false;
		}
	}
}


