using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using QuantumTrader.Models;
using QuantumTrader.Services;
using QuantumTrader.Utils;
using QuantumTrader.Execution;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.ViewModels
{
    public class LiveTradingViewModel : INotifyPropertyChanged
    {
        private readonly IMultiAccountManagerService _accountManager;
        private readonly IOrderExecutionService _orderExecution;
        private readonly MarketDataService _marketData;
        private readonly IPnLCalculationService _pnlService;
        private readonly IStrategyExecutionService _strategyExecution;
        private readonly IRealTimeUpdateService _realTimeUpdates;
        private readonly ILogger<LiveTradingViewModel> _logger;

        // Global Portfolio Metrics
        private decimal _totalPortfolioValue = 287450m;
        private decimal _totalPnL = 2340m;
        private decimal _dailyPnL = 456m;
        private decimal _unrealizedPnL = 125m;
        private decimal _portfolioRiskScore = 34;
        private decimal _totalExposure = 127000m;
        private string _brokerStatus = "Connected";
        private int _brokerLatency = 12;

        // Account Management
        private int _maxAccounts = 10;
        private TradingAccountViewModel? _selectedAccount;

        public LiveTradingViewModel(
            IMultiAccountManagerService accountManager,
            IOrderExecutionService orderExecution,
            MarketDataService marketData,
            IPnLCalculationService pnlService,
            IStrategyExecutionService strategyExecution,
            IRealTimeUpdateService realTimeUpdates,
            ILogger<LiveTradingViewModel> logger)
        {
            _accountManager = accountManager;
            _orderExecution = orderExecution;
            _marketData = marketData;
            _pnlService = pnlService;
            _strategyExecution = strategyExecution;
            _realTimeUpdates = realTimeUpdates;
            _logger = logger;

            // Initialize collections
            TradingAccounts = new ObservableCollection<TradingAccountViewModel>();
            LiveOrders = new ObservableCollection<LiveOrderViewModel>();
            AvailableStrategies = new ObservableCollection<StrategyInfo>();

            // Initialize with sample data and built-in strategies
            InitializeSampleAccounts();
            InitializeBuiltInStrategies();

            // Initialize commands
            InitializeCommands();

            // Start real-time updates
            _ = StartRealTimeUpdatesAsync();
        }

        #region Properties

        public ObservableCollection<TradingAccountViewModel> TradingAccounts { get; }
        public ObservableCollection<LiveOrderViewModel> LiveOrders { get; }
        public ObservableCollection<StrategyInfo> AvailableStrategies { get; }

        // Global Portfolio Properties
        public decimal TotalPortfolioValue
        {
            get => _totalPortfolioValue;
            set { _totalPortfolioValue = value; OnPropertyChanged(); OnPropertyChanged(nameof(TotalPortfolioValueFormatted)); }
        }

        public string TotalPortfolioValueFormatted => $"${TotalPortfolioValue:N2}";

        public decimal TotalPnL
        {
            get => _totalPnL;
            set { _totalPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(TotalPnLFormatted)); }
        }

        public string TotalPnLFormatted => $"{(TotalPnL >= 0 ? "+" : "")}{TotalPnL:C}";

        public decimal DailyPnL
        {
            get => _dailyPnL;
            set { _dailyPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(DailyPnLFormatted)); }
        }

        public string DailyPnLFormatted => $"{(DailyPnL >= 0 ? "+" : "")}{DailyPnL:C}";

        public decimal UnrealizedPnL
        {
            get => _unrealizedPnL;
            set { _unrealizedPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(UnrealizedPnLFormatted)); }
        }

        public string UnrealizedPnLFormatted => $"{(UnrealizedPnL >= 0 ? "+" : "")}{UnrealizedPnL:C}";

        public decimal PortfolioRiskScore
        {
            get => _portfolioRiskScore;
            set { _portfolioRiskScore = value; OnPropertyChanged(); OnPropertyChanged(nameof(PortfolioRiskScoreFormatted)); }
        }

        public string PortfolioRiskScoreFormatted => $"{PortfolioRiskScore:F0}/100";

        public decimal TotalExposure
        {
            get => _totalExposure;
            set { _totalExposure = value; OnPropertyChanged(); OnPropertyChanged(nameof(TotalExposureFormatted)); }
        }

        public string TotalExposureFormatted => $"${TotalExposure:N0}";

        public string BrokerStatus
        {
            get => _brokerStatus;
            set { _brokerStatus = value; OnPropertyChanged(); OnPropertyChanged(nameof(BrokerStatusFormatted)); }
        }

        public string BrokerStatusFormatted => $"🟢 NT Connected ({BrokerLatency}ms)";

        public int BrokerLatency
        {
            get => _brokerLatency;
            set { _brokerLatency = value; OnPropertyChanged(); OnPropertyChanged(nameof(BrokerStatusFormatted)); }
        }

        public TradingAccountViewModel? SelectedAccount
        {
            get => _selectedAccount;
            set { _selectedAccount = value; OnPropertyChanged(); }
        }

        public int ActiveAccountsCount => TradingAccounts.Count(a => a.IsActive);
        public decimal CombinedWinRate => TradingAccounts.Any() ? TradingAccounts.Average(a => a.WinRate) : 0;

        #endregion

        #region Commands

        public ICommand AddLiveAccountCommand { get; private set; }
        public ICommand AddSimAccountCommand { get; private set; }
        public ICommand RemoveAccountCommand { get; private set; }
        public ICommand StartAllAccountsCommand { get; private set; }
        public ICommand PauseAllAccountsCommand { get; private set; }
        public ICommand StopAllAccountsCommand { get; private set; }
        public ICommand EmergencyStopCommand { get; private set; }
        public ICommand BulkConfigureCommand { get; private set; }

        private void InitializeCommands()
        {
            AddLiveAccountCommand = new DelegateCommand(async _ => await AddLiveAccountAsync(), _ => CanAddAccount());
            AddSimAccountCommand = new DelegateCommand(async _ => await AddSimAccountAsync(), _ => CanAddAccount());
            RemoveAccountCommand = new DelegateCommand(async param => await RemoveAccountAsync(param as TradingAccountViewModel));
            StartAllAccountsCommand = new DelegateCommand(async _ => await StartAllAccountsAsync());
            PauseAllAccountsCommand = new DelegateCommand(async _ => await PauseAllAccountsAsync());
            StopAllAccountsCommand = new DelegateCommand(async _ => await StopAllAccountsAsync());
            EmergencyStopCommand = new DelegateCommand(async _ => await EmergencyStopAllAsync());
            BulkConfigureCommand = new DelegateCommand(async _ => await BulkConfigureAsync());
        }

        #endregion

        #region Private Methods

        private void InitializeSampleAccounts()
        {
            // Sample Live Accounts
            TradingAccounts.Add(new TradingAccountViewModel("LIVE-01", AccountType.Live, 25234m, _orderExecution, _strategyExecution)
            {
                DailyPnL = 456m,
                UnrealizedPnL = 45.50m,
                WinRate = 73m,
                SharpeRatio = 2.1m,
                CurrentStrategy = "AI Scalper Pro",
                IsActive = true,
                Positions = "ES +2, NQ -1",
                RiskPerTrade = 2.0m,
                DailyLossLimit = 500m
            });

            TradingAccounts.Add(new TradingAccountViewModel("LIVE-02", AccountType.Live, 52890m, _orderExecution, _strategyExecution)
            {
                DailyPnL = 234m,
                UnrealizedPnL = 18.75m,
                WinRate = 68m,
                SharpeRatio = 1.8m,
                CurrentStrategy = "Mean Reversion",
                IsActive = true,
                Positions = "YM +1",
                RiskPerTrade = 1.5m,
                DailyLossLimit = 1000m
            });

            // Sample Sim Account
            TradingAccounts.Add(new TradingAccountViewModel("SIM-01", AccountType.Simulation, 100456m, _orderExecution, _strategyExecution)
            {
                DailyPnL = 123m,
                UnrealizedPnL = 234.50m,
                WinRate = 71m,
                SharpeRatio = 1.9m,
                CurrentStrategy = "AI Scalper Pro",
                IsActive = true,
                Positions = "ES +5, NQ +2",
                RiskPerTrade = 5.0m,
                DailyLossLimit = 10000m
            });
        }

        private void InitializeBuiltInStrategies()
        {
            AvailableStrategies.Add(new StrategyInfo
            {
                Name = "AI Scalper Pro",
                Description = "AI-powered scalping strategy for 1-5min timeframes",
                WinRate = 73.4m,
                SharpeRatio = 2.1m,
                YTDReturn = 234m,
                IsBuiltIn = true,
                Category = "Scalping"
            });

            AvailableStrategies.Add(new StrategyInfo
            {
                Name = "Mean Reversion Master",
                Description = "RSI + Bollinger Bands mean reversion strategy",
                WinRate = 68.2m,
                SharpeRatio = 1.8m,
                YTDReturn = 156m,
                IsBuiltIn = true,
                Category = "Mean Reversion"
            });

            AvailableStrategies.Add(new StrategyInfo
            {
                Name = "Breakout Pro",
                Description = "Support/Resistance breakout strategy",
                WinRate = 62.1m,
                SharpeRatio = 2.4m,
                YTDReturn = 289m,
                IsBuiltIn = true,
                Category = "Breakout"
            });

            AvailableStrategies.Add(new StrategyInfo
            {
                Name = "Momentum Master",
                Description = "Trend following momentum strategy",
                WinRate = 65.3m,
                SharpeRatio = 1.9m,
                YTDReturn = 198m,
                IsBuiltIn = true,
                Category = "Momentum"
            });

            AvailableStrategies.Add(new StrategyInfo
            {
                Name = "Arbitrage Hunter",
                Description = "Price discrepancy arbitrage strategy",
                WinRate = 89.1m,
                SharpeRatio = 3.2m,
                YTDReturn = 445m,
                IsBuiltIn = true,
                Category = "Arbitrage"
            });
        }

        private bool CanAddAccount()
        {
            return TradingAccounts.Count < _maxAccounts;
        }

        private async Task AddLiveAccountAsync()
        {
            try
            {
                _logger.LogInformation("Starting to add new live account...");

                if (!CanAddAccount())
                {
                    _logger.LogWarning("Cannot add account - maximum accounts reached");
                    return;
                }

                // Comprehensive service validation with detailed logging
                if (_orderExecution == null)
                {
                    _logger.LogError("Order execution service is NULL during account creation");
                    throw new InvalidOperationException("Order execution service is not configured. Please check system configuration.");
                }
                _logger.LogDebug("Order execution service validated successfully");

                if (_strategyExecution == null)
                {
                    _logger.LogError("Strategy execution service is NULL during account creation");
                    throw new InvalidOperationException("Strategy execution service is not configured. Please check system configuration.");
                }
                _logger.LogDebug("Strategy execution service validated successfully");

                // Generate account ID with null safety
                var liveAccountCount = TradingAccounts?.Count(a => a != null && a.AccountType == AccountType.Live) ?? 0;
                var accountId = $"LIVE-{liveAccountCount + 1:00}";
                _logger.LogInformation($"Generated account ID: {accountId}");

                // Create new account with comprehensive null checking
                if (string.IsNullOrEmpty(accountId))
                {
                    throw new ArgumentException("Account ID cannot be null or empty");
                }

                _logger.LogInformation("Creating TradingAccountViewModel...");
                var newAccount = new TradingAccountViewModel(accountId, AccountType.Live, 25000m, _orderExecution, _strategyExecution);

                if (newAccount == null)
                {
                    throw new InvalidOperationException("Failed to create TradingAccountViewModel");
                }

                _logger.LogInformation("Adding account to collection...");
                TradingAccounts.Add(newAccount);
                OnPropertyChanged(nameof(ActiveAccountsCount));

                _logger.LogInformation($"Successfully added new live account: {accountId}");

                // TODO: Connect to actual NT account
                await Task.Delay(100); // Simulate connection delay
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogError(ex, "ArgumentNullException in AddLiveAccountAsync - Parameter: {ParamName}, Details: {Message}", ex.ParamName, ex.Message);
                throw new InvalidOperationException($"Failed to create live account due to missing configuration: {ex.ParamName}. Please restart the application.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add live account - Exception Type: {ExceptionType}", ex.GetType().Name);
                throw; // Re-throw for error handler to display user-friendly message
            }
        }

        private async Task AddSimAccountAsync()
        {
            try
            {
                if (!CanAddAccount()) return;

                // Validate required services
                if (_orderExecution == null)
                {
                    _logger.LogError("Order execution service is not available");
                    throw new InvalidOperationException("Order execution service is not configured. Please check system configuration.");
                }

                if (_strategyExecution == null)
                {
                    _logger.LogError("Strategy execution service is not available");
                    throw new InvalidOperationException("Strategy execution service is not configured. Please check system configuration.");
                }

                var accountId = $"SIM-{TradingAccounts.Count(a => a.AccountType == AccountType.Simulation) + 1:00}";
                var newAccount = new TradingAccountViewModel(accountId, AccountType.Simulation, 100000m, _orderExecution, _strategyExecution);

                TradingAccounts.Add(newAccount);
                OnPropertyChanged(nameof(ActiveAccountsCount));

                _logger.LogInformation($"Added new sim account: {accountId}");

                await Task.Delay(100); // Simulate setup delay
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add sim account");
                throw; // Re-throw for error handler to display user-friendly message
            }
        }

        private async Task RemoveAccountAsync(TradingAccountViewModel? account)
        {
            if (account == null) return;

            // Stop account first
            await account.StopAccountAsync();

            TradingAccounts.Remove(account);
            OnPropertyChanged(nameof(ActiveAccountsCount));
        }

        private async Task StartAllAccountsAsync()
        {
            var tasks = TradingAccounts.Select(account => account.StartAccountAsync());
            await Task.WhenAll(tasks);
            OnPropertyChanged(nameof(ActiveAccountsCount));
        }

        private async Task PauseAllAccountsAsync()
        {
            var tasks = TradingAccounts.Select(account => account.PauseAccountAsync());
            await Task.WhenAll(tasks);
            OnPropertyChanged(nameof(ActiveAccountsCount));
        }

        private async Task StopAllAccountsAsync()
        {
            var tasks = TradingAccounts.Select(account => account.StopAccountAsync());
            await Task.WhenAll(tasks);
            OnPropertyChanged(nameof(ActiveAccountsCount));
        }

        private async Task EmergencyStopAllAsync()
        {
            // Emergency stop all accounts and close all positions
            var tasks = TradingAccounts.Select(account => account.EmergencyStopAsync());
            await Task.WhenAll(tasks);
            OnPropertyChanged(nameof(ActiveAccountsCount));
        }

        private async Task BulkConfigureAsync()
        {
            // TODO: Implement bulk configuration dialog
            await Task.Delay(100);
        }

        private async Task StartRealTimeUpdatesAsync()
        {
            // TODO: Implement real-time updates from market data and execution services
            await Task.Delay(100);
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }

    // Supporting classes
    public class TradingAccountViewModel : INotifyPropertyChanged
    {
        private readonly IOrderExecutionService _orderExecution;
        private readonly IStrategyExecutionService _strategyExecution;

        public string AccountId { get; }
        public AccountType AccountType { get; }
        public decimal Balance { get; set; }
        public decimal DailyPnL { get; set; }
        public decimal UnrealizedPnL { get; set; }
        public decimal WinRate { get; set; }
        public decimal SharpeRatio { get; set; }
        public string CurrentStrategy { get; set; } = "";
        public bool IsActive { get; set; }
        public string Positions { get; set; } = "";
        public decimal RiskPerTrade { get; set; }
        public decimal DailyLossLimit { get; set; }

        public TradingAccountViewModel(string accountId, AccountType type, decimal balance,
            IOrderExecutionService orderExecution, IStrategyExecutionService strategyExecution)
        {
            AccountId = accountId;
            AccountType = type;
            Balance = balance;
            _orderExecution = orderExecution;
            _strategyExecution = strategyExecution;

            InitializeCommands();
        }

        public string AccountDisplayName => $"{AccountId} [${Balance:N0}]";
        public string AccountTypeIcon => AccountType == AccountType.Live ? "🟢" : "🟡";
        public string DailyPnLFormatted => $"{(DailyPnL >= 0 ? "+" : "")}{DailyPnL:C}";
        public string WinRateFormatted => $"{WinRate:F0}%";
        public string SharpeRatioFormatted => $"{SharpeRatio:F1}";
        public string StatusIcon => IsActive ? "🟢" : "🔴";

        public ICommand StartAccountCommand { get; private set; }
        public ICommand PauseAccountCommand { get; private set; }
        public ICommand StopAccountCommand { get; private set; }
        public ICommand ConfigureAccountCommand { get; private set; }
        public ICommand EmergencyStopCommand { get; private set; }

        private void InitializeCommands()
        {
            StartAccountCommand = new DelegateCommand(async _ => await StartAccountAsync());
            PauseAccountCommand = new DelegateCommand(async _ => await PauseAccountAsync());
            StopAccountCommand = new DelegateCommand(async _ => await StopAccountAsync());
            ConfigureAccountCommand = new DelegateCommand(async _ => await ConfigureAccountAsync());
            EmergencyStopCommand = new DelegateCommand(async _ => await EmergencyStopAsync());
        }

        public async Task StartAccountAsync()
        {
            IsActive = true;
            OnPropertyChanged(nameof(IsActive));
            OnPropertyChanged(nameof(StatusIcon));
            // TODO: Start strategy execution for this account
            await Task.Delay(100);
        }

        public async Task PauseAccountAsync()
        {
            IsActive = false;
            OnPropertyChanged(nameof(IsActive));
            OnPropertyChanged(nameof(StatusIcon));
            // TODO: Pause strategy execution for this account
            await Task.Delay(100);
        }

        public async Task StopAccountAsync()
        {
            IsActive = false;
            OnPropertyChanged(nameof(IsActive));
            OnPropertyChanged(nameof(StatusIcon));
            // TODO: Stop strategy execution and close positions
            await Task.Delay(100);
        }

        public async Task ConfigureAccountAsync()
        {
            // TODO: Open configuration dialog for this account
            await Task.Delay(100);
        }

        public async Task EmergencyStopAsync()
        {
            IsActive = false;
            OnPropertyChanged(nameof(IsActive));
            OnPropertyChanged(nameof(StatusIcon));
            // TODO: Emergency stop and flatten all positions
            await Task.Delay(100);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class LiveOrderViewModel
    {
        public DateTime Timestamp { get; set; }
        public string AccountId { get; set; } = "";
        public string Symbol { get; set; } = "";
        public string Side { get; set; } = "";
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal PnL { get; set; }
        public string Status { get; set; } = "";
        public string Strategy { get; set; } = "";

        public string OrderDescription => $"{Timestamp:HH:mm:ss} {AccountId} {Symbol} {Side} {Quantity} @ {Price:F2}";
        public string PnLFormatted => $"{(PnL >= 0 ? "+" : "")}{PnL:C}";
    }

    public class StrategyInfo
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal WinRate { get; set; }
        public decimal SharpeRatio { get; set; }
        public decimal YTDReturn { get; set; }
        public bool IsBuiltIn { get; set; }
        public string Category { get; set; } = "";
        public bool IsOwned { get; set; }
        public bool IsSubscribed { get; set; }
        public decimal Cost { get; set; }

        public string WinRateFormatted => $"{WinRate:F1}%";
        public string SharpeRatioFormatted => $"{SharpeRatio:F1}";
        public string YTDReturnFormatted => $"+{YTDReturn:F0}%";
        public string StrategyIcon => IsBuiltIn ? "🏗️" : IsOwned ? "📁" : "🛒";
    }

    public enum AccountType
    {
        Live,
        Simulation
    }
}
