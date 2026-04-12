using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using QuantumTrader.Utils;
using QuantumTrader.Models;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.ViewModels
{
    /// <summary>
    /// Ultra-Professional Enterprise Account View Model
    /// Handles individual account management with granular controls
    /// </summary>
    public class EnterpriseAccountViewModel : INotifyPropertyChanged
    {
        private readonly ILogger<EnterpriseAccountViewModel> _logger;
        private TradingAccount _account;
        private Strategy? _selectedStrategy;
        private decimal _minContracts = 1;
        private decimal _maxContracts = 10;
        private decimal _riskPercentage = 2.0m;
        private decimal _stopLoss = 2.0m;
        private decimal _takeProfit = 4.0m;
        private bool _isActive;
        private bool _isConnected;
        private string _connectionStatus = "Disconnected";
        private decimal _currentPnL;
        private decimal _dailyPnL;
        private decimal _unrealizedPnL;
        private int _openPositions;
        private decimal _winRate;
        private decimal _sharpeRatio;
        private decimal _maxDrawdown;
        private string _riskLevel = "Moderate";
        private bool _isDynamicSizingEnabled;
        private string _positionSizingMethod = "Fixed";

        public EnterpriseAccountViewModel(TradingAccount account, ILogger<EnterpriseAccountViewModel> logger)
        {
            _account = account;
            _logger = logger;

            InitializeCommands();
            InitializeStrategies();
            LoadAccountSettings();
        }

        #region Properties

        public TradingAccount Account
        {
            get => _account;
            set { _account = value; OnPropertyChanged(); }
        }

        public int AccountId => _account.Id;
        public string AccountName => _account.Name;
        public string AccountType => _account.Type;
        public decimal Balance => _account.Balance;

        public ObservableCollection<Strategy> AvailableStrategies { get; } = new();

        public Strategy? SelectedStrategy
        {
            get => _selectedStrategy;
            set
            {
                if (_selectedStrategy != value)
                {
                    _selectedStrategy = value;
                    OnPropertyChanged();
                    OnPropertyChanged(nameof(HasStrategy));
                    OnStrategyChanged();
                }
            }
        }

        public bool HasStrategy => _selectedStrategy != null;

        public decimal MinContracts
        {
            get => _minContracts;
            set
            {
                if (_minContracts != value && value >= 1 && value <= _maxContracts)
                {
                    _minContracts = value;
                    OnPropertyChanged();
                    UpdateRiskParameters();
                }
            }
        }

        public decimal MaxContracts
        {
            get => _maxContracts;
            set
            {
                if (_maxContracts != value && value >= _minContracts && value <= 100)
                {
                    _maxContracts = value;
                    OnPropertyChanged();
                    UpdateRiskParameters();
                }
            }
        }

        public decimal RiskPercentage
        {
            get => _riskPercentage;
            set
            {
                if (_riskPercentage != value && value >= 0.5m && value <= 10.0m)
                {
                    _riskPercentage = value;
                    OnPropertyChanged();
                    OnPropertyChanged(nameof(RiskLevel));
                    UpdateRiskParameters();
                }
            }
        }

        public decimal StopLoss
        {
            get => _stopLoss;
            set
            {
                if (_stopLoss != value && value >= 0.5m && value <= 5.0m)
                {
                    _stopLoss = value;
                    OnPropertyChanged();
                    UpdateRiskParameters();
                }
            }
        }

        public decimal TakeProfit
        {
            get => _takeProfit;
            set
            {
                if (_takeProfit != value && value >= 1.0m && value <= 10.0m)
                {
                    _takeProfit = value;
                    OnPropertyChanged();
                    UpdateRiskParameters();
                }
            }
        }

        public bool IsActive
        {
            get => _isActive;
            set { _isActive = value; OnPropertyChanged(); OnPropertyChanged(nameof(StatusText)); }
        }

        public bool IsConnected
        {
            get => _isConnected;
            set
            {
                _isConnected = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(ConnectionStatus));
                OnPropertyChanged(nameof(ConnectionStatusIcon));
            }
        }

        public string ConnectionStatus
        {
            get => _connectionStatus;
            set { _connectionStatus = value; OnPropertyChanged(); }
        }

        public string ConnectionStatusIcon => IsConnected ? "🟢" : "🔴";

        public string StatusText => IsActive ? "Active" : "Inactive";
        public string StatusIcon => IsActive ? "✅" : "⏸️";

        public decimal CurrentPnL
        {
            get => _currentPnL;
            set { _currentPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(CurrentPnLFormatted)); }
        }

        public decimal DailyPnL
        {
            get => _dailyPnL;
            set { _dailyPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(DailyPnLFormatted)); }
        }

        public decimal UnrealizedPnL
        {
            get => _unrealizedPnL;
            set { _unrealizedPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(UnrealizedPnLFormatted)); }
        }

        public string CurrentPnLFormatted => FormatPnL(CurrentPnL);
        public string DailyPnLFormatted => FormatPnL(DailyPnL);
        public string UnrealizedPnLFormatted => FormatPnL(UnrealizedPnL);

        public int OpenPositions
        {
            get => _openPositions;
            set { _openPositions = value; OnPropertyChanged(); }
        }

        public decimal WinRate
        {
            get => _winRate;
            set { _winRate = value; OnPropertyChanged(); OnPropertyChanged(nameof(WinRateFormatted)); }
        }

        public string WinRateFormatted => $"{WinRate:F1}%";

        public decimal SharpeRatio
        {
            get => _sharpeRatio;
            set { _sharpeRatio = value; OnPropertyChanged(); OnPropertyChanged(nameof(SharpeRatioFormatted)); }
        }

        public string SharpeRatioFormatted => $"{SharpeRatio:F2}";

        public decimal MaxDrawdown
        {
            get => _maxDrawdown;
            set { _maxDrawdown = value; OnPropertyChanged(); OnPropertyChanged(nameof(MaxDrawdownFormatted)); }
        }

        public string MaxDrawdownFormatted => $"{MaxDrawdown:F1}%";

        public string RiskLevel
        {
            get
            {
                if (RiskPercentage <= 1.5m) return "Conservative";
                if (RiskPercentage <= 3.0m) return "Moderate";
                if (RiskPercentage <= 5.0m) return "Aggressive";
                return "Very Aggressive";
            }
        }

        public bool IsDynamicSizingEnabled
        {
            get => _isDynamicSizingEnabled;
            set
            {
                _isDynamicSizingEnabled = value;
                OnPropertyChanged();
                UpdatePositionSizingMethod();
            }
        }

        public string PositionSizingMethod
        {
            get => _positionSizingMethod;
            set
            {
                _positionSizingMethod = value;
                OnPropertyChanged();
                UpdateRiskParameters();
            }
        }

        public ObservableCollection<string> PositionSizingMethods { get; } = new()
        {
            "Fixed",
            "Kelly Criterion",
            "Risk Parity",
            "Volatility Based",
            "ATR Based",
            "Optimal F"
        };

        #endregion

        #region Commands

        public ICommand StartAccountCommand { get; private set; }
        public ICommand StopAccountCommand { get; private set; }
        public ICommand PauseAccountCommand { get; private set; }
        public ICommand EmergencyStopCommand { get; private set; }
        public ICommand ConfigureAccountCommand { get; private set; }
        public ICommand ViewDetailsCommand { get; private set; }
        public ICommand RefreshConnectionCommand { get; private set; }
        public ICommand ApplyRiskSettingsCommand { get; private set; }

        private void InitializeCommands()
        {
            StartAccountCommand = new DelegateCommand(_ => ExecuteStartAccount(), _ => CanExecuteStartAccount());
            StopAccountCommand = new DelegateCommand(_ => ExecuteStopAccount(), _ => CanExecuteStopAccount());
            PauseAccountCommand = new DelegateCommand(_ => ExecutePauseAccount(), _ => CanExecutePauseAccount());
            EmergencyStopCommand = new DelegateCommand(_ => ExecuteEmergencyStop(), _ => CanExecuteEmergencyStop());
            ConfigureAccountCommand = new DelegateCommand(_ => ExecuteConfigureAccount());
            ViewDetailsCommand = new DelegateCommand(_ => ExecuteViewDetails());
            RefreshConnectionCommand = new DelegateCommand(_ => ExecuteRefreshConnection());
            ApplyRiskSettingsCommand = new DelegateCommand(_ => ExecuteApplyRiskSettings());
        }

        private void ExecuteStartAccount()
        {
            try
            {
                _logger.LogInformation($"Starting account {AccountName} with strategy {SelectedStrategy?.Name}");
                IsActive = true;

                // TODO: Connect to actual trading engine
                SimulateAccountStart();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to start account {AccountName}");
            }
        }

        private bool CanExecuteStartAccount() => !IsActive && HasStrategy && IsConnected;

        private void ExecuteStopAccount()
        {
            try
            {
                _logger.LogInformation($"Stopping account {AccountName}");
                IsActive = false;

                // TODO: Disconnect from trading engine
                SimulateAccountStop();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to stop account {AccountName}");
            }
        }

        private bool CanExecuteStopAccount() => IsActive;

        private void ExecutePauseAccount()
        {
            try
            {
                _logger.LogInformation($"Pausing account {AccountName}");
                IsActive = false;

                // Keep positions open but stop new trades
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to pause account {AccountName}");
            }
        }

        private bool CanExecutePauseAccount() => IsActive;

        private void ExecuteEmergencyStop()
        {
            try
            {
                _logger.LogWarning($"EMERGENCY STOP initiated for account {AccountName}");
                IsActive = false;

                // Close all positions immediately
                // TODO: Implement emergency liquidation
                OpenPositions = 0;
                UnrealizedPnL = 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to execute emergency stop for account {AccountName}");
            }
        }

        private bool CanExecuteEmergencyStop() => IsActive || OpenPositions > 0;

        private void ExecuteConfigureAccount()
        {
            _logger.LogInformation($"Opening configuration for account {AccountName}");
            // TODO: Open configuration dialog
        }

        private void ExecuteViewDetails()
        {
            _logger.LogInformation($"Opening details view for account {AccountName}");
            // TODO: Open detailed analytics view
        }

        private void ExecuteRefreshConnection()
        {
            _logger.LogInformation($"Refreshing broker connection for account {AccountName}");
            // TODO: Reconnect to broker
            SimulateBrokerConnection();
        }

        private void ExecuteApplyRiskSettings()
        {
            _logger.LogInformation($"Applying risk settings for account {AccountName}");
            UpdateRiskParameters();
            SaveAccountSettings();
        }

        #endregion

        #region Methods

        private void InitializeStrategies()
        {
            // Initialize with 5 built-in professional strategies
            AvailableStrategies.Add(new Strategy { Id = 1, Name = "AI Scalper Pro", Category = "Scalping" });
            AvailableStrategies.Add(new Strategy { Id = 2, Name = "Mean Reversion Elite", Category = "Mean Reversion" });
            AvailableStrategies.Add(new Strategy { Id = 3, Name = "Breakout Hunter Pro", Category = "Breakout" });
            AvailableStrategies.Add(new Strategy { Id = 4, Name = "Momentum Master", Category = "Momentum" });
            AvailableStrategies.Add(new Strategy { Id = 5, Name = "Arbitrage Hunter", Category = "Arbitrage" });

            // Add custom strategies if available
            // TODO: Load custom strategies from database

            // Add store strategies if purchased
            // TODO: Load purchased strategies from store
        }

        private void LoadAccountSettings()
        {
            // TODO: Load from database
            _logger.LogInformation($"Loading settings for account {AccountName}");

            // Simulate broker connection check
            SimulateBrokerConnection();
        }

        private void SaveAccountSettings()
        {
            // TODO: Save to database
            _logger.LogInformation($"Saving settings for account {AccountName}");
        }

        private void OnStrategyChanged()
        {
            if (_selectedStrategy != null)
            {
                _logger.LogInformation($"Strategy changed to {_selectedStrategy.Name} for account {AccountName}");

                // Load strategy-specific risk settings
                LoadStrategyRiskSettings();
            }
        }

        private void LoadStrategyRiskSettings()
        {
            // TODO: Load strategy-specific risk parameters
            if (_selectedStrategy?.Category == "Scalping")
            {
                MinContracts = 1;
                MaxContracts = 5;
                StopLoss = 1.0m;
                TakeProfit = 2.0m;
            }
            else if (_selectedStrategy?.Category == "Momentum")
            {
                MinContracts = 2;
                MaxContracts = 10;
                StopLoss = 2.0m;
                TakeProfit = 4.0m;
            }
        }

        private void UpdateRiskParameters()
        {
            // TODO: Send updated risk parameters to trading engine
            _logger.LogInformation($"Risk parameters updated for account {AccountName}");
        }

        private void UpdatePositionSizingMethod()
        {
            if (IsDynamicSizingEnabled)
            {
                PositionSizingMethod = "Kelly Criterion";
            }
            else
            {
                PositionSizingMethod = "Fixed";
            }
        }

        private string FormatPnL(decimal value)
        {
            var sign = value >= 0 ? "+" : "";
            return $"{sign}${Math.Abs(value):N2}";
        }

        private void SimulateAccountStart()
        {
            // Simulate account activity
            Random rand = new Random();
            CurrentPnL = (decimal)(rand.NextDouble() * 2000 - 500);
            DailyPnL = (decimal)(rand.NextDouble() * 1000 - 200);
            UnrealizedPnL = (decimal)(rand.NextDouble() * 500 - 100);
            OpenPositions = rand.Next(0, 5);
            WinRate = (decimal)(rand.NextDouble() * 30 + 40);
            SharpeRatio = (decimal)(rand.NextDouble() * 2 + 0.5);
            MaxDrawdown = (decimal)(rand.NextDouble() * 10 + 2);
        }

        private void SimulateAccountStop()
        {
            OpenPositions = 0;
            UnrealizedPnL = 0;
        }

        private void SimulateBrokerConnection()
        {
            // Simulate broker connection
            Random rand = new Random();
            IsConnected = rand.Next(100) > 20; // 80% chance of connection
            ConnectionStatus = IsConnected ? "Connected" : "Disconnected";

            if (IsConnected)
            {
                _logger.LogInformation($"Broker connected for account {AccountName}");
            }
            else
            {
                _logger.LogWarning($"Broker connection failed for account {AccountName}");
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
}
