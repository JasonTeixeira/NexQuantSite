using System.Threading.Tasks;
using QuantumTrader.Models;
using QuantumTrader.Services;
using QuantumTrader.Utils;

namespace QuantumTrader.ViewModels
{
	public class RiskViewModel
	{
		private readonly IRiskService _riskService;
		public RiskProfile Profile { get; set; } = new();
		public RiskDecision? LastDecision { get; private set; }

		// Inputs for testing/simulation
		public double InputConfidence { get; set; } = 0.7; // 70%
		public double InputProposedRiskPct { get; set; } = 0.005; // 0.5%
		public double InputSessionPnLPct { get; set; } = 0.0;

		public DelegateCommand SaveProfileCommand { get; }
		public DelegateCommand TestSizingCommand { get; }
		public DelegateCommand SimulateOrderCommand { get; }

		public string AccountId { get; private set; }

		public RiskViewModel(IRiskService riskService, string accountId)
		{
			_riskService = riskService;
			AccountId = accountId;
			SaveProfileCommand = new DelegateCommand(async _ => await SaveAsync());
			TestSizingCommand = new DelegateCommand(_ => { /* UI can call CalculateContracts via binding */ });
			SimulateOrderCommand = new DelegateCommand(async _ => await SimulateAsync());
		}

		public async Task LoadAsync()
		{
			Profile = await _riskService.GetRiskProfileAsync(AccountId);
		}

		public int ContractsForConfidence(double confidence) => _riskService.CalculateContracts(confidence, Profile.MinContracts, Profile.MaxContracts, Profile.ConfidenceGamma);
		public int RecommendedContracts => ContractsForConfidence(InputConfidence);

		private async Task SaveAsync()
		{
			Profile = await _riskService.SaveRiskProfileAsync(Profile);
		}

		private async Task SimulateAsync()
		{
			var input = new RiskCheckInput { AccountId = AccountId, Confidence = InputConfidence, ProposedRiskPct = InputProposedRiskPct, SessionPnLPct = InputSessionPnLPct };
			LastDecision = await _riskService.EvaluateAsync(input);
		}

		public async Task SetAccountAsync(string accountId)
		{
			AccountId = accountId;
			await LoadAsync();
		}
	}
}


