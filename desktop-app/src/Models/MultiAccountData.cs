using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace QuantumTrader.Models
{
    /// <summary>
    /// Represents a trading account with enhanced multi-account dashboard functionality
    /// Extends the base TradingAccount for the Live Trading Dashboard
    /// </summary>
    public class LiveTradingAccountViewModel : INotifyPropertyChanged
    {
        private TradingAccount _account;
        private Strategy? _assignedStrategy;
        private bool _isActive;
        private decimal _realTimePnL;
        private string _statusMessage = string.Empty;

        public LiveTradingAccountViewModel(TradingAccount account)
        {
            _account = account;
            _isActive = account.IsEnabled && account.IsConnected;
            _realTimePnL = account.PnL;
        }

        // Account Properties
        public int Id => _account.Id;
        public string Name => _account.Name;
        public string Type => _account.Type;
        public string Broker => _account.Broker;
        public decimal Balance => _account.Balance;
        public decimal Equity => _account.Equity;
        public bool IsLive => _account.IsLive;
        public string DisplayName => _account.DisplayName;

        // Live Trading Properties
        public Strategy? AssignedStrategy
        {
            get => _assignedStrategy;
            set
            {
                _assignedStrategy = value;
                OnPropertyChanged(nameof(AssignedStrategy));
                OnPropertyChanged(nameof(StrategyName));
                OnPropertyChanged(nameof(HasStrategy));
            }
        }

        public string StrategyName => AssignedStrategy?.Name ?? "No Strategy";
        public bool HasStrategy => AssignedStrategy != null;

        public bool IsActive
        {
            get => _isActive;
            set
            {
                _isActive = value;
                OnPropertyChanged(nameof(IsActive));
                OnPropertyChanged(nameof(StatusText));
                OnPropertyChanged(nameof(StatusColor));
            }
        }

        public decimal RealTimePnL
        {
            get => _realTimePnL;
            set
            {
                _realTimePnL = value;
                OnPropertyChanged(nameof(RealTimePnL));
                OnPropertyChanged(nameof(PnLText));
                OnPropertyChanged(nameof(PnLColor));
                OnPropertyChanged(nameof(IsProfitable));
            }
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set
            {
                _statusMessage = value;
                OnPropertyChanged(nameof(StatusMessage));
            }
        }

        // Computed Properties for UI
        public string StatusText => IsActive ? "🟢 Active" : "🔴 Stopped";
        public string StatusColor => IsActive ? "Green" : "Red";
        public string PnLText => RealTimePnL >= 0 ? $"+${RealTimePnL:F2}" : $"-${Math.Abs(RealTimePnL):F2}";
        public string PnLColor => RealTimePnL >= 0 ? "Green" : "Red";
        public bool IsProfitable => RealTimePnL > 0;
        public string AccountTypeDisplay => IsLive ? "🔴 LIVE" : "🟡 SIM";

        // Risk Management Properties
        public decimal MaxDailyLoss { get; set; } = 1000m;
        public decimal MaxPositionSize { get; set; } = 10000m;
        public bool RiskControlsEnabled { get; set; } = true;

        // Commands for Live Trading Dashboard
        public Action? StartTradingCommand { get; set; }
        public Action? StopTradingCommand { get; set; }
        public Action? EmergencyStopCommand { get; set; }
        public Action? ConfigureRiskCommand { get; set; }

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        // Methods for Live Trading Operations
        public void UpdateRealTimeData(decimal newPnL, string status)
        {
            RealTimePnL = newPnL;
            StatusMessage = status;
        }

        public void AssignStrategy(Strategy strategy)
        {
            AssignedStrategy = strategy;
            StatusMessage = $"Strategy '{strategy.Name}' assigned";
        }

        public void StartTrading()
        {
            IsActive = true;
            StatusMessage = "Trading started";
            StartTradingCommand?.Invoke();
        }

        public void StopTrading()
        {
            IsActive = false;
            StatusMessage = "Trading stopped";
            StopTradingCommand?.Invoke();
        }

        public void EmergencyStop()
        {
            IsActive = false;
            StatusMessage = "🚨 EMERGENCY STOP - All positions closed";
            EmergencyStopCommand?.Invoke();
        }
    }

    /// <summary>
    /// Represents the global portfolio data for the Live Trading Dashboard
    /// </summary>
    public class LiveTradingPortfolioData : INotifyPropertyChanged
    {
        private decimal _totalPortfolioValue = 0m;
        private decimal _totalPnL = 0m;
        private decimal _dailyPnL = 0m;
        private decimal _unrealizedPnL = 0m;
        private double _winRate = 0.0;
        private int _activeAccounts = 0;
        private int _totalAccounts = 0;

        public decimal TotalPortfolioValue
        {
            get => _totalPortfolioValue;
            set
            {
                _totalPortfolioValue = value;
                OnPropertyChanged(nameof(TotalPortfolioValue));
                OnPropertyChanged(nameof(PortfolioValueText));
            }
        }

        public decimal TotalPnL
        {
            get => _totalPnL;
            set
            {
                _totalPnL = value;
                OnPropertyChanged(nameof(TotalPnL));
                OnPropertyChanged(nameof(TotalPnLText));
                OnPropertyChanged(nameof(TotalPnLColor));
            }
        }

        public decimal DailyPnL
        {
            get => _dailyPnL;
            set
            {
                _dailyPnL = value;
                OnPropertyChanged(nameof(DailyPnL));
                OnPropertyChanged(nameof(DailyPnLText));
                OnPropertyChanged(nameof(DailyPnLColor));
            }
        }

        public decimal UnrealizedPnL
        {
            get => _unrealizedPnL;
            set
            {
                _unrealizedPnL = value;
                OnPropertyChanged(nameof(UnrealizedPnL));
                OnPropertyChanged(nameof(UnrealizedPnLText));
                OnPropertyChanged(nameof(UnrealizedPnLColor));
            }
        }

        public double WinRate
        {
            get => _winRate;
            set
            {
                _winRate = value;
                OnPropertyChanged(nameof(WinRate));
                OnPropertyChanged(nameof(WinRateText));
                OnPropertyChanged(nameof(WinRateColor));
            }
        }

        public int ActiveAccounts
        {
            get => _activeAccounts;
            set
            {
                _activeAccounts = value;
                OnPropertyChanged(nameof(ActiveAccounts));
                OnPropertyChanged(nameof(AccountStatusText));
            }
        }

        public int TotalAccounts
        {
            get => _totalAccounts;
            set
            {
                _totalAccounts = value;
                OnPropertyChanged(nameof(TotalAccounts));
                OnPropertyChanged(nameof(AccountStatusText));
            }
        }

        // UI Display Properties
        public string PortfolioValueText => $"${TotalPortfolioValue:N0}";
        public string TotalPnLText => TotalPnL >= 0 ? $"+${TotalPnL:F2}" : $"-${Math.Abs(TotalPnL):F2}";
        public string TotalPnLColor => TotalPnL >= 0 ? "Green" : "Red";
        public string DailyPnLText => DailyPnL >= 0 ? $"+${DailyPnL:F2}" : $"-${Math.Abs(DailyPnL):F2}";
        public string DailyPnLColor => DailyPnL >= 0 ? "Green" : "Red";
        public string UnrealizedPnLText => UnrealizedPnL >= 0 ? $"+${UnrealizedPnL:F2}" : $"-${Math.Abs(UnrealizedPnL):F2}";
        public string UnrealizedPnLColor => UnrealizedPnL >= 0 ? "Green" : "Red";
        public string WinRateText => $"{WinRate:F1}%";
        public string WinRateColor => WinRate >= 60 ? "Green" : WinRate >= 40 ? "Orange" : "Red";
        public string AccountStatusText => $"{ActiveAccounts}/{TotalAccounts} Active";

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public void UpdateFromAccounts(IEnumerable<LiveTradingAccountViewModel> accounts)
        {
            var accountList = accounts.ToList();

            TotalPortfolioValue = accountList.Sum(a => a.Balance);
            TotalPnL = accountList.Sum(a => a.RealTimePnL);
            DailyPnL = accountList.Sum(a => a.RealTimePnL); // TODO: Calculate actual daily P&L
            UnrealizedPnL = accountList.Sum(a => a.RealTimePnL); // TODO: Calculate unrealized P&L
            ActiveAccounts = accountList.Count(a => a.IsActive);
            TotalAccounts = accountList.Count;

            // TODO: Calculate actual win rate from trades
            WinRate = accountList.Any() ? accountList.Average(a => a.IsProfitable ? 100.0 : 0.0) : 0.0;
        }
    }
}
