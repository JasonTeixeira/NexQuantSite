using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class PersistentAccountService : IAccountService
    {
        private readonly IRepository<Account> _repository;

        public PersistentAccountService()
        {
            _repository = new JsonRepository<Account>("accounts.json");
        }

        public async Task<IReadOnlyList<Account>> GetAccountsAsync()
        {
            var accounts = await _repository.GetAllAsync();
            return accounts.AsReadOnly();
        }

        public async Task<Account> SaveAccountAsync(Account account)
        {
            await _repository.SaveAsync(account);
            return account;
        }

        public async Task DeleteAccountAsync(string id)
        {
            await _repository.DeleteAsync(id);
        }
    }

    public class PersistentStrategyService : IStrategyService
    {
        private readonly IRepository<StrategyConfig> _repository;

        public PersistentStrategyService()
        {
            _repository = new JsonRepository<StrategyConfig>("strategies.json");
        }

        public async Task<IReadOnlyList<StrategyConfig>> GetStrategiesAsync()
        {
            var strategies = await _repository.GetAllAsync();
            return strategies.AsReadOnly();
        }
    }

    public class PersistentAssignmentService : IAssignmentService
    {
        private readonly IRepository<AccountStrategy> _repository;

        public PersistentAssignmentService()
        {
            _repository = new JsonRepository<AccountStrategy>("assignments.json");
        }

        public async Task<IReadOnlyList<AccountStrategy>> GetAssignmentsAsync(string accountId)
        {
            var all = await _repository.GetAllAsync();
            var assignments = all.Where(a => a.AccountId == accountId).ToList();
            return assignments.AsReadOnly();
        }

        public async Task SaveAssignmentsAsync(string accountId, IReadOnlyList<AccountStrategy> assignments)
        {
            var all = await _repository.GetAllAsync();
            var filtered = all.Where(a => a.AccountId != accountId).ToList();
            filtered.AddRange(assignments);
            await _repository.SaveAllAsync(filtered);
        }
    }

    public class PersistentRiskService : IRiskService
    {
        private readonly IRepository<RiskProfile> _repository;

        public PersistentRiskService()
        {
            _repository = new JsonRepository<RiskProfile>("risk_profiles.json");
        }

        public async Task<RiskProfile> GetRiskProfileAsync(string accountId)
        {
            var profiles = await _repository.GetAllAsync();
            return profiles.FirstOrDefault(p => p.Id == accountId) ?? new RiskProfile { Id = accountId };
        }

        public async Task<RiskProfile> SaveRiskProfileAsync(RiskProfile profile)
        {
            await _repository.SaveAsync(profile);
            return profile;
        }

        public async Task<RiskDecision> EvaluateAsync(RiskCheckInput input)
        {
            // Simplified risk evaluation logic
            var contracts = Math.Max(input.MinContracts, Math.Min(input.MaxContracts, 
                (int)(input.Confidence * input.MaxContracts)));
            
            return await Task.FromResult(new RiskDecision
            {
                Status = RiskDecisionStatus.Approved,
                Reason = "Risk check passed",
                Contracts = contracts
            });
        }

        public int CalculateContracts(double confidence, int minContracts, int maxContracts, double gamma = 1.0)
        {
            return Math.Max(minContracts, Math.Min(maxContracts, (int)(confidence * maxContracts * gamma)));
        }
    }

    public class TradeHistoryService
    {
        private readonly IRepository<TradeHistory> _repository;

        public TradeHistoryService()
        {
            _repository = new JsonRepository<TradeHistory>("trade_history.json");
        }

        public async Task<List<TradeHistory>> GetTradeHistoryAsync(string accountId)
        {
            var all = await _repository.GetAllAsync();
            return all.Where(t => t.AccountId == accountId).OrderByDescending(t => t.Timestamp).ToList();
        }

        public async Task SaveTradeAsync(TradeHistory trade)
        {
            await _repository.SaveAsync(trade);
        }
    }

    public class StrategyPurchaseService
    {
        private readonly IRepository<StrategyPurchase> _repository;

        public StrategyPurchaseService()
        {
            _repository = new JsonRepository<StrategyPurchase>("purchases.json");
        }

        public async Task<List<StrategyPurchase>> GetPurchasesAsync(string accountId)
        {
            var all = await _repository.GetAllAsync();
            return all.Where(p => p.AccountId == accountId && p.IsActive).ToList();
        }

        public async Task SavePurchaseAsync(StrategyPurchase purchase)
        {
            await _repository.SaveAsync(purchase);
        }
    }
}
