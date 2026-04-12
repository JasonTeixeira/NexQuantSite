using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;

namespace QuantumTrader.Models
{
    /// <summary>
    /// Institutional-Grade Analytics Models
    /// Advanced reporting and performance analysis data structures
    /// </summary>
    public class PerformanceReport : INotifyPropertyChanged
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime GeneratedDate { get; set; } = DateTime.Now;
        public string ReportType { get; set; } = "Portfolio"; // Portfolio, Strategy, Account, Risk
        public List<string> IncludedAccounts { get; set; } = new();
        public List<string> IncludedStrategies { get; set; } = new();

        // Performance Metrics
        public decimal TotalReturn { get; set; }
        public decimal TotalReturnPercent { get; set; }
        public decimal AnnualizedReturn { get; set; }
        public double SharpeRatio { get; set; }
        public double SortinoRatio { get; set; }
        public double CalmarRatio { get; set; }
        public decimal MaxDrawdown { get; set; }
        public decimal MaxDrawdownPercent { get; set; }
        public double Volatility { get; set; }
        public double Beta { get; set; }
        public double Alpha { get; set; }
        public double InformationRatio { get; set; }
        public double TrackingError { get; set; }

        // Trade Statistics
        public int TotalTrades { get; set; }
        public int WinningTrades { get; set; }
        public int LosingTrades { get; set; }
        public double WinRate { get; set; }
        public double ProfitFactor { get; set; }
        public decimal AverageWin { get; set; }
        public decimal AverageLoss { get; set; }
        public decimal LargestWin { get; set; }
        public decimal LargestLoss { get; set; }
        public double AverageHoldingPeriod { get; set; }

        // Risk Metrics
        public decimal ValueAtRisk95 { get; set; }
        public decimal ValueAtRisk99 { get; set; }
        public decimal ConditionalVaR { get; set; }
        public double DownsideDeviation { get; set; }
        public double UpsideDeviation { get; set; }
        public double SkewnessFactor { get; set; }
        public double KurtosisValue { get; set; }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class PerformanceAttribution
    {
        public string StrategyName { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal ContributionAmount { get; set; }
        public double ContributionPercent { get; set; }
        public decimal AlphaContribution { get; set; }
        public decimal BetaContribution { get; set; }
        public decimal SpecificReturn { get; set; }
        public double RiskContribution { get; set; }
        public int TradeCount { get; set; }
        public string PerformanceGrade { get; set; } = string.Empty; // A+, A, B+, B, C+, C, D

        public string ContributionFormatted => ContributionAmount >= 0 ?
            $"+${ContributionAmount:F2}" : $"-${Math.Abs(ContributionAmount):F2}";
        public string ContributionPercentFormatted => $"{ContributionPercent:F2}%";
        public string GradeColor => PerformanceGrade switch
        {
            "A+" or "A" => "Green",
            "B+" or "B" => "Orange",
            "C+" or "C" => "Yellow",
            _ => "Red"
        };
    }

    public class RiskScenario
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ScenarioType { get; set; } = string.Empty; // Market Crash, Volatility Spike, Interest Rate Change
        public Dictionary<string, decimal> MarketShocks { get; set; } = new();
        public decimal PortfolioImpact { get; set; }
        public decimal PortfolioImpactPercent { get; set; }
        public decimal WorstCaseScenario { get; set; }
        public decimal BestCaseScenario { get; set; }
        public double ProbabilityOfLoss { get; set; }
        public decimal ExpectedShortfall { get; set; }
        public List<string> AffectedStrategies { get; set; } = new();
        public string RiskLevel { get; set; } = string.Empty; // Low, Medium, High, Extreme

        public string ImpactFormatted => PortfolioImpact >= 0 ?
            $"+${PortfolioImpact:F2}" : $"-${Math.Abs(PortfolioImpact):F2}";
        public string RiskLevelColor => RiskLevel switch
        {
            "Low" => "Green",
            "Medium" => "Orange",
            "High" => "Red",
            "Extreme" => "Purple",
            _ => "White"
        };
    }

    public class CustomChart
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string ChartType { get; set; } = "Line"; // Line, Bar, Pie, Scatter, Heatmap, Candlestick
        public string DataSource { get; set; } = string.Empty; // Portfolio, Strategy, Account, Market
        public List<string> Metrics { get; set; } = new(); // Return, Drawdown, Sharpe, etc.
        public DateTime StartDate { get; set; } = DateTime.Now.AddMonths(-6);
        public DateTime EndDate { get; set; } = DateTime.Now;
        public string TimeFrame { get; set; } = "Daily"; // Minute, Hourly, Daily, Weekly, Monthly
        public bool IsRealTime { get; set; } = false;
        public string Layout { get; set; } = "Single"; // Single, Dual, Quad
        public Dictionary<string, object> ChartSettings { get; set; } = new();
    }

    public class AnalyticsDashboard
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<CustomChart> Charts { get; set; } = new();
        public List<string> KPIs { get; set; } = new(); // Key Performance Indicators to display
        public string Layout { get; set; } = "Grid"; // Grid, Vertical, Horizontal
        public bool IsDefault { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime LastModified { get; set; } = DateTime.Now;
    }

    public class ReportTemplate
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Performance, Risk, Attribution, Compliance
        public List<string> Sections { get; set; } = new();
        public List<string> RequiredMetrics { get; set; } = new();
        public string OutputFormat { get; set; } = "PDF"; // PDF, Excel, HTML, JSON
        public bool IsStandard { get; set; } = true;
        public string Frequency { get; set; } = "Monthly"; // Daily, Weekly, Monthly, Quarterly, Annual
        public bool AutoGenerate { get; set; } = false;
        public DateTime? NextScheduledRun { get; set; }
    }

    public class AlertRule
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty; // Performance, Risk, Drawdown, PnL
        public string Metric { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty; // Greater than, Less than, Equals, Change
        public decimal Threshold { get; set; }
        public string Severity { get; set; } = "Medium"; // Low, Medium, High, Critical
        public bool IsEnabled { get; set; } = true;
        public List<string> NotificationMethods { get; set; } = new(); // Email, SMS, Push, Dashboard
        public List<string> Recipients { get; set; } = new();
        public DateTime LastTriggered { get; set; }
        public int TriggerCount { get; set; } = 0;

        public string SeverityColor => Severity switch
        {
            "Low" => "Green",
            "Medium" => "Orange",
            "High" => "Red",
            "Critical" => "Purple",
            _ => "White"
        };
    }

    public class AnalyticsKPI
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CurrentValue { get; set; }
        public decimal PreviousValue { get; set; }
        public decimal Change { get; set; }
        public double ChangePercent { get; set; }
        public string Unit { get; set; } = string.Empty; // $, %, ratio, count
        public string Trend { get; set; } = "Neutral"; // Up, Down, Neutral
        public string Status { get; set; } = "Normal"; // Normal, Warning, Critical
        public decimal? Target { get; set; }
        public string Icon { get; set; } = string.Empty;

        public string CurrentValueFormatted => Unit switch
        {
            "$" => $"${CurrentValue:N2}",
            "%" => $"{CurrentValue:F2}%",
            "ratio" => CurrentValue.ToString("F2"),
            _ => CurrentValue.ToString("N0")
        };

        public string ChangeFormatted => Change >= 0 ? $"+{Change:F2}" : $"{Change:F2}";

        public string TrendColor => Trend switch
        {
            "Up" => "Green",
            "Down" => "Red",
            _ => "White"
        };

        public string StatusColor => Status switch
        {
            "Normal" => "Green",
            "Warning" => "Orange",
            "Critical" => "Red",
            _ => "White"
        };
    }

    public class MarketDataPoint
    {
        public DateTime Timestamp { get; set; }
        public decimal Value { get; set; }
        public decimal Volume { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty; // Price, Return, Volume, Volatility
    }

    public class AnalyticsTimeframe
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCustom { get; set; } = false;
    }
}
