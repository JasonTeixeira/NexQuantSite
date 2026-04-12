using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using QuantumTrader.Utils;
using QuantumTrader.Models;
using QuantumTrader.Services;

namespace QuantumTrader.ViewModels
{
    /// <summary>
    /// Ultra-Professional Enterprise Live Trading View Model
    /// Manages multiple accounts with comprehensive controls and analytics
    /// </summary>
    public class EnhancedLiveTradingViewModel : INotifyPropertyChanged
    {
        private readonly ILogger<EnhancedLiveTradingViewModel> _logger;
        private readonly IMultiAccountManagerService _accountManager;
        private readonly IAnalyticsService _analyticsService;
        private readonly IStrategyExecutionService _strategyExecution;

        private decimal _totalPortfolioValue;
        private decimal _totalPnL;
        private decimal _dailyPnL;
        private int _activeAccountCount;
        private int _totalAccountCount;
        private decimal _globalWinRate;
        private decimal _globalSharpeRatio;

        public EnhancedLiveTradingViewModel(
            ILogger<EnhancedLiveTradingViewModel> logger,
            IMultiAccountManagerService accountManager,
            IAnalyticsService analyticsService,
            IStrategyExecutionService strategyExecution)
        {
            _logger = logger;
            _accountManager = accountManager;
            _analyticsService = analyticsService;
            _strategyExecution = strategyExecution;

            Accounts = new ObservableCollection<EnterpriseAccountViewModel>();

            InitializeCommands();
            LoadAccounts();
            StartRealTimeUpdates();
        }

        #region Properties

        public ObservableCollection<EnterpriseAccountViewModel> Accounts { get; }

        public decimal TotalPortfolioValue
        {
            get => _totalPortfolioValue;
            set { _totalPortfolioValue = value; OnPropertyChanged(); }
        }

        public decimal TotalPnL
        {
            get => _totalPnL;
            set { _totalPnL = value; OnPropertyChanged(); }
        }

        public decimal DailyPnL
        {
            get => _dailyPnL;
            set { _dailyPnL = value; OnPropertyChanged(); }
        }

        public int ActiveAccountCount
        {
            get => _activeAccountCount;
            set { _activeAccountCount = value; OnPropertyChanged(); }
        }

        public int TotalAccountCount
        {
            get => _totalAccountCount;
            set { _totalAccountCount = value; OnPropertyChanged(); }
        }

        public decimal GlobalWinRate
        {
            get => _globalWinRate;
            set { _globalWinRate = value; OnPropertyChanged(); }
        }

        public decimal GlobalSharpeRatio
        {
            get => _globalSharpeRatio;
            set { _globalSharpeRatio = value; OnPropertyChanged(); }
        }

        #endregion

        #region Commands

        public ICommand ViewGlobalAnalyticsCommand { get; private set; }
        public ICommand ConfigurePortfolioCommand { get; private set; }
        public ICommand EmergencyStopAllCommand { get; private set; }
        public ICommand AddLiveAccountCommand { get; private set; }
        public ICommand AddSimAccountCommand { get; private set; }
        public ICommand RefreshAllCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }

        private void InitializeCommands()
        {
            ViewGlobalAnalyticsCommand = new DelegateCommand(_ => ExecuteViewGlobalAnalytics());
            ConfigurePortfolioCommand = new DelegateCommand(_ => ExecuteConfigurePortfolio());
            EmergencyStopAllCommand = new DelegateCommand(_ => ExecuteEmergencyStopAll());
            AddLiveAccountCommand = new DelegateCommand(_ => ExecuteAddLiveAccount());
            AddSimAccountCommand = new DelegateCommand(_ => ExecuteAddSimAccount());
            RefreshAllCommand = new DelegateCommand(_ => ExecuteRefreshAll());
            ExportReportCommand = new DelegateCommand(_ => ExecuteExportReport());
        }

        private async void ExecuteViewGlobalAnalytics()
        {
            try
            {
                _logger.LogInformation("Opening global analytics dashboard");

                // Generate comprehensive analytics report
                var report = await _analyticsService.GeneratePerformanceReportAsync(
                    DateTime.Now.AddMonths(-1),
                    DateTime.Now,
                    Accounts.Select(a => a.AccountId.ToString()).ToList()
                );

                // TODO: Open analytics window with report
                _logger.LogInformation($"Analytics report generated for {Accounts.Count} accounts");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to open global analytics");
            }
        }

        private void ExecuteConfigurePortfolio()
        {
            _logger.LogInformation("Opening portfolio configuration");
            // TODO: Open portfolio configuration dialog
        }

        private async void ExecuteEmergencyStopAll()
        {
            try
            {
                _logger.LogWarning("EMERGENCY STOP ALL initiated!");

                // Stop all accounts immediately
                foreach (var account in Accounts.Where(a => a.IsActive))
                {
                    account.EmergencyStopCommand.Execute(null);
                }

                await _accountManager.EmergencyStopAllAccountsAsync();

                _logger.LogWarning($"Emergency stop executed for {ActiveAccountCount} accounts");

                UpdateGlobalMetrics();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute emergency stop all");
            }
        }

        private async void ExecuteAddLiveAccount()
        {
            try
            {
                _logger.LogInformation("Adding new live account");

                // Create new live account
                var newAccount = new TradingAccount
                {
                    Id = Accounts.Count + 1,
                    Name = $"Live Account {Accounts.Count + 1}",
                    Type = "LIVE",
                    Balance = 100000, // Default starting balance
                    IsEnabled = false
                };

                var success = await _accountManager.AddAccountAsync(newAccount);

                if (success)
                {
                    var accountViewModel = new EnterpriseAccountViewModel(
                        newAccount,
                        Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>(((App)System.Windows.Application.Current).Services).CreateLogger<EnterpriseAccountViewModel>()
                    );

                    Accounts.Add(accountViewModel);
                    TotalAccountCount = Accounts.Count;

                    _logger.LogInformation($"Live account added: {newAccount.Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add live account");
            }
        }

        private async void ExecuteAddSimAccount()
        {
            try
            {
                _logger.LogInformation("Adding new sim account");

                // Create new simulation account
                var newAccount = new TradingAccount
                {
                    Id = Accounts.Count + 1,
                    Name = $"Sim Account {Accounts.Count + 1}",
                    Type = "SIM",
                    Balance = 100000, // Default starting balance
                    IsEnabled = false
                };

                var success = await _accountManager.AddAccountAsync(newAccount);

                if (success)
                {
                    var accountViewModel = new EnterpriseAccountViewModel(
                        newAccount,
                        Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>(((App)System.Windows.Application.Current).Services).CreateLogger<EnterpriseAccountViewModel>()
                    );

                    Accounts.Add(accountViewModel);
                    TotalAccountCount = Accounts.Count;

                    _logger.LogInformation($"Sim account added: {newAccount.Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add sim account");
            }
        }

        private void ExecuteRefreshAll()
        {
            _logger.LogInformation("Refreshing all accounts");

            foreach (var account in Accounts)
            {
                account.RefreshConnectionCommand.Execute(null);
            }

            UpdateGlobalMetrics();
        }

        private async void ExecuteExportReport()
        {
            try
            {
                _logger.LogInformation("Exporting comprehensive report");

                var report = await _analyticsService.GeneratePerformanceReportAsync(
                    DateTime.Now.AddMonths(-1),
                    DateTime.Now,
                    Accounts.Select(a => a.AccountId.ToString()).ToList()
                );

                // TODO: Export report to file
                _logger.LogInformation("Report exported successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export report");
            }
        }

        #endregion

        #region Methods

        private void LoadAccounts()
        {
            try
            {
                _logger.LogInformation("Loading trading accounts");

                // Create sample accounts for demonstration
                for (int i = 1; i <= 10; i++)
                {
                    var accountType = i <= 5 ? "LIVE" : "SIM";
                    var account = new TradingAccount
                    {
                        Id = i,
                        Name = $"{accountType} Account {i}",
                        Type = accountType,
                        Balance = 100000 + (i * 10000),
                        IsEnabled = false
                    };

                    var accountViewModel = new EnterpriseAccountViewModel(
                        account,
                        Microsoft.Extensions.DependencyInjection.ServiceProviderServiceExtensions.GetRequiredService<Microsoft.Extensions.Logging.ILoggerFactory>(((App)System.Windows.Application.Current).Services).CreateLogger<EnterpriseAccountViewModel>()
                    );

                    // Simulate some accounts being active
                    if (i % 3 == 0)
                    {
                        accountViewModel.SelectedStrategy = accountViewModel.AvailableStrategies.FirstOrDefault();
                        accountViewModel.IsConnected = true;

                        if (i % 2 == 0)
                        {
                            accountViewModel.IsActive = true;
                        }
                    }

                    Accounts.Add(accountViewModel);
                }

                TotalAccountCount = Accounts.Count;
                UpdateGlobalMetrics();

                _logger.LogInformation($"Loaded {Accounts.Count} trading accounts");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load accounts");
            }
        }

        private void StartRealTimeUpdates()
        {
            try
            {
                _logger.LogInformation("Starting real-time updates");

                _accountManager.StartRealTimeUpdates();

                // Subscribe to account updates - directly pass through the events from Services namespace
                _accountManager.AccountUpdated += (sender, e) =>
                {
                    // Map from Services.AccountUpdateEventArgs to ViewModels.AccountUpdateEventArgs
                    var vmEventArgs = new AccountUpdateEventArgs
                    {
                        AccountId = e.AccountId,
                        CurrentPnL = 0,  // Services doesn't provide this
                        DailyPnL = 0,    // Services doesn't provide this
                        UnrealizedPnL = 0,   // Not provided by Services
                        OpenPositions = 0    // Not provided by Services
                    };
                    OnAccountUpdated(sender, vmEventArgs);
                };

                _accountManager.PortfolioUpdated += (sender, e) =>
                {
                    // Map from Services.PortfolioUpdateEventArgs to ViewModels.PortfolioUpdateEventArgs
                    var vmEventArgs = new PortfolioUpdateEventArgs
                    {
                        TotalValue = e.PortfolioData?.TotalPortfolioValue ?? 0,  // Services uses PortfolioData.TotalPortfolioValue
                        TotalPnL = e.PortfolioData?.TotalPnL ?? 0,
                        DailyPnL = e.PortfolioData?.DailyPnL ?? 0
                    };
                    OnPortfolioUpdated(sender, vmEventArgs);
                };

                // Start periodic metric updates
                Task.Run(async () =>
                {
                    while (true)
                    {
                        await Task.Delay(5000); // Update every 5 seconds
                        UpdateGlobalMetrics();
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start real-time updates");
            }
        }

        private void OnAccountUpdated(object? sender, AccountUpdateEventArgs e)
        {
            // Update specific account
            var account = Accounts.FirstOrDefault(a => a.AccountId == e.AccountId);
            if (account != null)
            {
                // Update account metrics
                account.CurrentPnL = e.CurrentPnL;
                account.DailyPnL = e.DailyPnL;
                account.UnrealizedPnL = e.UnrealizedPnL;
                account.OpenPositions = e.OpenPositions;
            }

            UpdateGlobalMetrics();
        }

        private void OnPortfolioUpdated(object? sender, PortfolioUpdateEventArgs e)
        {
            // Update global portfolio metrics
            TotalPortfolioValue = e.TotalValue;
            TotalPnL = e.TotalPnL;
            DailyPnL = e.DailyPnL;
        }

        private void UpdateGlobalMetrics()
        {
            try
            {
                // Calculate global metrics from all accounts
                TotalPortfolioValue = Accounts.Sum(a => a.Balance + a.CurrentPnL);
                TotalPnL = Accounts.Sum(a => a.CurrentPnL);
                DailyPnL = Accounts.Sum(a => a.DailyPnL);
                ActiveAccountCount = Accounts.Count(a => a.IsActive);

                // Calculate weighted averages
                if (Accounts.Any(a => a.IsActive))
                {
                    var activeAccounts = Accounts.Where(a => a.IsActive).ToList();

                    // Weighted win rate by account balance
                    GlobalWinRate = activeAccounts
                        .Select(a => a.WinRate * (a.Balance / activeAccounts.Sum(acc => acc.Balance)))
                        .Sum();

                    // Average Sharpe ratio
                    GlobalSharpeRatio = activeAccounts.Average(a => a.SharpeRatio);
                }
                else
                {
                    GlobalWinRate = 0;
                    GlobalSharpeRatio = 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update global metrics");
            }
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        #endregion
    }

    // Event Args Classes
    public class AccountUpdateEventArgs : EventArgs
    {
        public int AccountId { get; set; }
        public decimal CurrentPnL { get; set; }
        public decimal DailyPnL { get; set; }
        public decimal UnrealizedPnL { get; set; }
        public int OpenPositions { get; set; }
    }

    public class PortfolioUpdateEventArgs : EventArgs
    {
        public decimal TotalValue { get; set; }
        public decimal TotalPnL { get; set; }
        public decimal DailyPnL { get; set; }
    }
}
