using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Threading;
using QuantumTrader.Models;
using QuantumTrader.Services;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace QuantumTrader.ViewModels
{
    /// <summary>
    /// Professional Dashboard ViewModel providing advanced portfolio analytics
    /// This drives the 📊 Dashboard Tab with institutional-grade metrics
    /// </summary>
    public class DashboardViewModel : INotifyPropertyChanged
    {
        private readonly ILiveTradingDashboardService _liveTradingService;
        private readonly ILogger<DashboardViewModel> _logger;
        private readonly DispatcherTimer _analyticsTimer;

        // Portfolio Analytics Properties
        private decimal _totalPortfolioValue;
        private decimal _totalPnL;
        private decimal _dailyPnL;
        private decimal _weeklyPnL;
        private decimal _monthlyPnL;
        private double _sharpeRatio;
        private decimal _maxDrawdown;
        private double _winRate;
        private double _profitFactor;
        private int _totalTrades;
        private decimal _averageWin;
        private decimal _averageLoss;
        private double _volatility;

        // Risk Analytics
        private double _portfolioRiskScore;
        private decimal _valueAtRisk;
        private double _portfolioBeta;
        private decimal _exposureByStrategy;

        public DashboardViewModel(ILiveTradingDashboardService liveTradingService, ILogger<DashboardViewModel> logger)
        {
            _liveTradingService = liveTradingService;
            _logger = logger;

            // Initialize collections
            PerformanceMetrics = new ObservableCollection<PerformanceMetric>();
            StrategyPerformance = new ObservableCollection<StrategyPerformanceMetric>();
            RiskMetrics = new ObservableCollection<RiskMetric>();
            AccountHealthData = new ObservableCollection<AccountHealthMetric>();

            // Set up analytics timer (update every 1 second for smooth experience)
            _analyticsTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            _analyticsTimer.Tick += UpdateAnalytics;

            Initialize();
        }

        #region Properties

        public ObservableCollection<PerformanceMetric> PerformanceMetrics { get; }
        public ObservableCollection<StrategyPerformanceMetric> StrategyPerformance { get; }
        public ObservableCollection<RiskMetric> RiskMetrics { get; }
        public ObservableCollection<AccountHealthMetric> AccountHealthData { get; }

        // Portfolio Value Properties
        public decimal TotalPortfolioValue
        {
            get => _totalPortfolioValue;
            set { _totalPortfolioValue = value; OnPropertyChanged(); OnPropertyChanged(nameof(TotalPortfolioValueFormatted)); }
        }

        public string TotalPortfolioValueFormatted => $"${TotalPortfolioValue:N0}";

        public decimal TotalPnL
        {
            get => _totalPnL;
            set { _totalPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(TotalPnLFormatted)); OnPropertyChanged(nameof(TotalPnLColor)); }
        }

        public string TotalPnLFormatted => TotalPnL >= 0 ? $"+${TotalPnL:F2}" : $"-${Math.Abs(TotalPnL):F2}";
        public string TotalPnLColor => TotalPnL >= 0 ? "Green" : "Red";

        public decimal DailyPnL
        {
            get => _dailyPnL;
            set { _dailyPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(DailyPnLFormatted)); OnPropertyChanged(nameof(DailyPnLColor)); }
        }

        public string DailyPnLFormatted => DailyPnL >= 0 ? $"+${DailyPnL:F2}" : $"-${Math.Abs(DailyPnL):F2}";
        public string DailyPnLColor => DailyPnL >= 0 ? "Green" : "Red";

        public decimal WeeklyPnL
        {
            get => _weeklyPnL;
            set { _weeklyPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(WeeklyPnLFormatted)); OnPropertyChanged(nameof(WeeklyPnLColor)); }
        }

        public string WeeklyPnLFormatted => WeeklyPnL >= 0 ? $"+${WeeklyPnL:F2}" : $"-${Math.Abs(WeeklyPnL):F2}";
        public string WeeklyPnLColor => WeeklyPnL >= 0 ? "Green" : "Red";

        public decimal MonthlyPnL
        {
            get => _monthlyPnL;
            set { _monthlyPnL = value; OnPropertyChanged(); OnPropertyChanged(nameof(MonthlyPnLFormatted)); OnPropertyChanged(nameof(MonthlyPnLColor)); }
        }

        public string MonthlyPnLFormatted => MonthlyPnL >= 0 ? $"+${MonthlyPnL:F2}" : $"-${Math.Abs(MonthlyPnL):F2}";
        public string MonthlyPnLColor => MonthlyPnL >= 0 ? "Green" : "Red";

        // Performance Metrics
        public double SharpeRatio
        {
            get => _sharpeRatio;
            set { _sharpeRatio = value; OnPropertyChanged(); OnPropertyChanged(nameof(SharpeRatioFormatted)); OnPropertyChanged(nameof(SharpeRatioColor)); }
        }

        public string SharpeRatioFormatted => SharpeRatio.ToString("F2");
        public string SharpeRatioColor => SharpeRatio >= 2.0 ? "Green" : SharpeRatio >= 1.0 ? "Orange" : "Red";

        public decimal MaxDrawdown
        {
            get => _maxDrawdown;
            set { _maxDrawdown = value; OnPropertyChanged(); OnPropertyChanged(nameof(MaxDrawdownFormatted)); }
        }

        public string MaxDrawdownFormatted => $"{MaxDrawdown:F1}%";

        public double WinRate
        {
            get => _winRate;
            set { _winRate = value; OnPropertyChanged(); OnPropertyChanged(nameof(WinRateFormatted)); OnPropertyChanged(nameof(WinRateColor)); }
        }

        public string WinRateFormatted => $"{WinRate:F1}%";
        public string WinRateColor => WinRate >= 70 ? "Green" : WinRate >= 50 ? "Orange" : "Red";

        public double ProfitFactor
        {
            get => _profitFactor;
            set { _profitFactor = value; OnPropertyChanged(); OnPropertyChanged(nameof(ProfitFactorFormatted)); OnPropertyChanged(nameof(ProfitFactorColor)); }
        }

        public string ProfitFactorFormatted => ProfitFactor.ToString("F2");
        public string ProfitFactorColor => ProfitFactor >= 2.0 ? "Green" : ProfitFactor >= 1.5 ? "Orange" : "Red";

        // Risk Properties
        public double PortfolioRiskScore
        {
            get => _portfolioRiskScore;
            set { _portfolioRiskScore = value; OnPropertyChanged(); OnPropertyChanged(nameof(PortfolioRiskScoreFormatted)); OnPropertyChanged(nameof(RiskScoreColor)); }
        }

        public string PortfolioRiskScoreFormatted => $"{PortfolioRiskScore:F0}/100";
        public string RiskScoreColor => PortfolioRiskScore <= 30 ? "Green" : PortfolioRiskScore <= 70 ? "Orange" : "Red";

        public decimal ValueAtRisk
        {
            get => _valueAtRisk;
            set { _valueAtRisk = value; OnPropertyChanged(); OnPropertyChanged(nameof(ValueAtRiskFormatted)); }
        }

        public string ValueAtRiskFormatted => $"${ValueAtRisk:F0}";

        // Account Summary Properties
        public int ActiveAccountsCount => _liveTradingService?.Accounts?.Count(a => a.IsActive) ?? 0;
        public int TotalAccountsCount => _liveTradingService?.Accounts?.Count ?? 0;
        public string AccountSummary => $"{ActiveAccountsCount}/{TotalAccountsCount} Active";

        #endregion

        #region Methods

        private async void Initialize()
        {
            try
            {
                _logger.LogInformation("Initializing Dashboard with advanced portfolio analytics");

                // Initialize demo analytics data
                InitializePerformanceMetrics();
                InitializeStrategyPerformance();
                InitializeRiskMetrics();
                InitializeAccountHealth();

                // Start analytics updates
                _analyticsTimer.Start();

                // Subscribe to live trading updates
                if (_liveTradingService != null)
                {
                    _liveTradingService.AccountUpdated += OnLiveTradingUpdated;
                }

                _logger.LogInformation("Dashboard analytics initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Dashboard");
            }
        }

        private void InitializePerformanceMetrics()
        {
            PerformanceMetrics.Clear();
            PerformanceMetrics.Add(new PerformanceMetric { Period = "Today", Value = 2340.75m, Percentage = 1.32, Color = "Green" });
            PerformanceMetrics.Add(new PerformanceMetric { Period = "Week", Value = 8750.25m, Percentage = 4.89, Color = "Green" });
            PerformanceMetrics.Add(new PerformanceMetric { Period = "Month", Value = 12450.80m, Percentage = 6.97, Color = "Green" });
            PerformanceMetrics.Add(new PerformanceMetric { Period = "Quarter", Value = 34200.15m, Percentage = 19.12, Color = "Green" });
            PerformanceMetrics.Add(new PerformanceMetric { Period = "Year", Value = 67890.50m, Percentage = 37.95, Color = "Green" });
        }

        private void InitializeStrategyPerformance()
        {
            StrategyPerformance.Clear();
            StrategyPerformance.Add(new StrategyPerformanceMetric {
                Name = "Momentum Scalper",
                Return = 34.5m,
                SharpeRatio = 2.8,
                MaxDD = 12.3m,
                WinRate = 68.5,
                Trades = 1247,
                Status = "🟢 Active"
            });
            StrategyPerformance.Add(new StrategyPerformanceMetric {
                Name = "Mean Reversion Pro",
                Return = 28.7m,
                SharpeRatio = 2.1,
                MaxDD = 8.9m,
                WinRate = 72.3,
                Trades = 892,
                Status = "🟢 Active"
            });
            StrategyPerformance.Add(new StrategyPerformanceMetric {
                Name = "Breakout Hunter",
                Return = 45.2m,
                SharpeRatio = 1.9,
                MaxDD = 18.7m,
                WinRate = 58.9,
                Trades = 567,
                Status = "🟢 Active"
            });
            StrategyPerformance.Add(new StrategyPerformanceMetric {
                Name = "Smart Grid Pro",
                Return = 19.8m,
                SharpeRatio = 3.2,
                MaxDD = 6.1m,
                WinRate = 89.1,
                Trades = 2341,
                Status = "🟢 Active"
            });
            StrategyPerformance.Add(new StrategyPerformanceMetric {
                Name = "Event Catalyst",
                Return = 52.3m,
                SharpeRatio = 2.4,
                MaxDD = 22.1m,
                WinRate = 61.4,
                Trades = 234,
                Status = "🟡 Paused"
            });
        }

        private void InitializeRiskMetrics()
        {
            RiskMetrics.Clear();
            RiskMetrics.Add(new RiskMetric { Name = "Portfolio VaR (95%)", Value = "12,450", Status = "Low", Color = "Green" });
            RiskMetrics.Add(new RiskMetric { Name = "Maximum Drawdown", Value = "8.7%", Status = "Acceptable", Color = "Orange" });
            RiskMetrics.Add(new RiskMetric { Name = "Concentration Risk", Value = "23%", Status = "Medium", Color = "Orange" });
            RiskMetrics.Add(new RiskMetric { Name = "Strategy Correlation", Value = "0.34", Status = "Low", Color = "Green" });
            RiskMetrics.Add(new RiskMetric { Name = "Volatility (30D)", Value = "18.2%", Status = "Medium", Color = "Orange" });
        }

        private void InitializeAccountHealth()
        {
            AccountHealthData.Clear();
            if (_liveTradingService?.Accounts != null)
            {
                foreach (var account in _liveTradingService.Accounts)
                {
                    AccountHealthData.Add(new AccountHealthMetric
                    {
                        AccountName = account.Name,
                        AccountType = account.Type,
                        HealthScore = CalculateAccountHealth(account),
                        Balance = account.Balance,
                        PnL = account.PnL,
                        RiskUtilization = CalculateRiskUtilization(account),
                        Status = account.IsActive ? "🟢 Active" : "🔴 Stopped",
                        Strategy = account.AssignedStrategy
                    });
                }
            }
        }

        private void UpdateAnalytics(object? sender, EventArgs e)
        {
            try
            {
                // Update portfolio-level metrics from live trading service
                if (_liveTradingService?.PortfolioSummary != null)
                {
                    TotalPortfolioValue = _liveTradingService.PortfolioSummary.TotalBalance;
                    TotalPnL = _liveTradingService.PortfolioSummary.TotalPnL;
                    DailyPnL = _liveTradingService.PortfolioSummary.DailyPnL;

                    // Calculate advanced metrics
                    CalculateAdvancedMetrics();
                    UpdateAccountHealth();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dashboard analytics");
            }
        }

        private void CalculateAdvancedMetrics()
        {
            // Simulate realistic trading metrics calculations
            WeeklyPnL = DailyPnL * 5.2m; // Approximate weekly from daily
            MonthlyPnL = WeeklyPnL * 4.3m; // Approximate monthly from weekly

            // Professional performance metrics
            SharpeRatio = CalculateSharpeRatio();
            MaxDrawdown = CalculateMaxDrawdown();
            WinRate = CalculateWinRate();
            ProfitFactor = CalculateProfitFactor();

            // Risk metrics
            PortfolioRiskScore = CalculateRiskScore();
            ValueAtRisk = CalculateValueAtRisk();
            Volatility = CalculateVolatility();
        }

        private double CalculateSharpeRatio()
        {
            // Simplified Sharpe ratio calculation for demo
            var returnRate = (double)(TotalPnL / TotalPortfolioValue * 100);
            var riskFreeRate = 5.0; // Assume 5% risk-free rate
            var volatility = Math.Max(Volatility, 0.1); // Prevent division by zero
            return (returnRate - riskFreeRate) / volatility;
        }

        private decimal CalculateMaxDrawdown()
        {
            // Simplified max drawdown calculation
            var accountDrawdowns = _liveTradingService?.Accounts?
                .Where(a => a.PnL < 0)
                .Select(a => Math.Abs(a.PnL / a.Balance * 100))
                .DefaultIfEmpty(0) ?? new[] { 0m };

            return accountDrawdowns.Max();
        }

        private double CalculateWinRate()
        {
            var totalAccounts = _liveTradingService?.Accounts?.Count ?? 1;
            var profitableAccounts = _liveTradingService?.Accounts?.Count(a => a.PnL > 0) ?? 0;
            return totalAccounts > 0 ? (double)profitableAccounts / totalAccounts * 100 : 0;
        }

        private double CalculateProfitFactor()
        {
            var totalProfit = (double)(_liveTradingService?.Accounts?
                .Where(a => a.PnL > 0)
                .Sum(a => a.PnL) ?? 0);

            var totalLoss = Math.Abs((double)(_liveTradingService?.Accounts?
                .Where(a => a.PnL < 0)
                .Sum(a => a.PnL) ?? -1));

            return totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 99.9 : 0;
        }

        private double CalculateRiskScore()
        {
            // Risk score based on portfolio composition and volatility
            var riskFactors = new[]
            {
                Math.Min((double)(Math.Abs(TotalPnL) / TotalPortfolioValue * 100), 50), // P&L volatility
                Math.Min(Volatility * 2, 30), // Volatility factor
                Math.Min((double)MaxDrawdown, 20) // Drawdown factor
            };

            return riskFactors.Sum();
        }

        private decimal CalculateValueAtRisk()
        {
            // Simplified VaR calculation (95% confidence)
            return TotalPortfolioValue * 0.05m * (decimal)Math.Max(Volatility / 100, 0.01);
        }

        private double CalculateVolatility()
        {
            // Simplified volatility calculation based on active strategies
            var activeStrategies = _liveTradingService?.Accounts?
                .Where(a => a.IsActive)
                .Select(a => a.AssignedStrategy)
                .Distinct()
                .Count() ?? 1;

            return Math.Min(activeStrategies * 5.5 + 10, 35); // 15-35% range
        }

        private void UpdateAccountHealth()
        {
            AccountHealthData.Clear();
            if (_liveTradingService?.Accounts != null)
            {
                foreach (var account in _liveTradingService.Accounts)
                {
                    var existingHealth = AccountHealthData.FirstOrDefault(h => h.AccountName == account.Name);
                    if (existingHealth != null)
                    {
                        existingHealth.HealthScore = CalculateAccountHealth(account);
                        existingHealth.PnL = account.PnL;
                        existingHealth.RiskUtilization = CalculateRiskUtilization(account);
                        existingHealth.Status = account.IsActive ? "🟢 Active" : "🔴 Stopped";
                    }
                    else
                    {
                        AccountHealthData.Add(new AccountHealthMetric
                        {
                            AccountName = account.Name,
                            AccountType = account.Type,
                            HealthScore = CalculateAccountHealth(account),
                            Balance = account.Balance,
                            PnL = account.PnL,
                            RiskUtilization = CalculateRiskUtilization(account),
                            Status = account.IsActive ? "🟢 Active" : "🔴 Stopped",
                            Strategy = account.AssignedStrategy
                        });
                    }
                }
            }
        }

        private int CalculateAccountHealth(TradingAccountDisplayModel account)
        {
            var healthFactors = new[]
            {
                account.PnL >= 0 ? 30 : Math.Max(0, 30 - (double)(Math.Abs(account.PnL) / account.Balance * 100) * 3), // P&L health
                account.IsActive ? 25 : 10, // Activity bonus
                account.AssignedStrategy != "No Strategy" ? 20 : 0, // Strategy assignment
                25 // Base health score
            };

            return Math.Min((int)healthFactors.Sum(), 100);
        }

        private double CalculateRiskUtilization(TradingAccountDisplayModel account)
        {
            var riskUsed = Math.Abs(account.PnL);
            var maxRisk = account.MaxDailyLoss;
            return maxRisk > 0 ? (double)(riskUsed / maxRisk * 100) : 0;
        }

        private void OnLiveTradingUpdated(object? sender, AccountUpdatedEventArgs e)
        {
            // Update analytics when live trading data changes
            UpdateAccountHealth();
        }

        public void StartAnalytics()
        {
            _analyticsTimer.Start();
            _logger.LogInformation("Dashboard analytics started");
        }

        public void StopAnalytics()
        {
            _analyticsTimer.Stop();
            _logger.LogInformation("Dashboard analytics stopped");
        }

        #endregion

        public event PropertyChangedEventHandler? PropertyChanged;

        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    // Supporting Data Models for Dashboard
    public class PerformanceMetric
    {
        public string Period { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = "White";
        public string FormattedValue => Value >= 0 ? $"+${Value:F2}" : $"-${Math.Abs(Value):F2}";
        public string FormattedPercentage => $"{(Percentage >= 0 ? "+" : "")}{Percentage:F2}%";
    }

    public class StrategyPerformanceMetric
    {
        public string Name { get; set; } = string.Empty;
        public decimal Return { get; set; }
        public double SharpeRatio { get; set; }
        public decimal MaxDD { get; set; }
        public double WinRate { get; set; }
        public int Trades { get; set; }
        public string Status { get; set; } = string.Empty;

        public string ReturnFormatted => $"{Return:F1}%";
        public string SharpeFormatted => SharpeRatio.ToString("F2");
        public string MaxDDFormatted => $"{MaxDD:F1}%";
        public string WinRateFormatted => $"{WinRate:F1}%";
        public string TradesFormatted => Trades.ToString("N0");
        public string StatusColor => Status.Contains("🟢") ? "Green" : Status.Contains("🟡") ? "Orange" : "Red";
    }

    public class RiskMetric
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Color { get; set; } = "White";
    }

    public class AccountHealthMetric
    {
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public int HealthScore { get; set; }
        public decimal Balance { get; set; }
        public decimal PnL { get; set; }
        public double RiskUtilization { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Strategy { get; set; } = string.Empty;

        public string HealthScoreFormatted => $"{HealthScore}/100";
        public string HealthColor => HealthScore >= 80 ? "Green" : HealthScore >= 60 ? "Orange" : "Red";
        public string PnLFormatted => PnL >= 0 ? $"+${PnL:F2}" : $"-${Math.Abs(PnL):F2}";
        public string PnLColor => PnL >= 0 ? "Green" : "Red";
        public string RiskUtilizationFormatted => $"{RiskUtilization:F1}%";
        public string RiskColor => RiskUtilization <= 50 ? "Green" : RiskUtilization <= 80 ? "Orange" : "Red";
    }
}
