using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;

namespace QuantumTrader.Models
{
    /// <summary>
    /// Professional Strategy Hub Data Models
    /// Institutional-grade strategy development and management
    /// </summary>
    public class StrategyComponent : INotifyPropertyChanged
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Indicator, Signal, Filter, Entry, Exit, Risk
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public List<string> InputConnectors { get; set; } = new();
        public List<string> OutputConnectors { get; set; } = new();
        public double X { get; set; }
        public double Y { get; set; }
        public bool IsValid { get; set; } = true;
        public string ValidationMessage { get; set; } = string.Empty;

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class StrategyConnection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FromComponentId { get; set; } = string.Empty;
        public string FromConnector { get; set; } = string.Empty;
        public string ToComponentId { get; set; } = string.Empty;
        public string ToConnector { get; set; } = string.Empty;
        public string DataType { get; set; } = "double"; // double, bool, signal, order
    }

    public class StrategyTemplate : INotifyPropertyChanged
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string Version { get; set; } = "1.0.0";
        public decimal Rating { get; set; } = 0m;
        public int Downloads { get; set; } = 0;
        public string Complexity { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced, Expert
        public string TradingStyle { get; set; } = string.Empty; // Scalping, Day Trading, Swing, Position
        public List<string> Markets { get; set; } = new(); // Stocks, Forex, Crypto, Futures
        public string ThumbnailPath { get; set; } = string.Empty;
        public bool IsPremium { get; set; } = false;
        public decimal Price { get; set; } = 0m;

        public List<StrategyComponent> Components { get; set; } = new();
        public List<StrategyConnection> Connections { get; set; } = new();
        public string SourceCode { get; set; } = string.Empty;

        // Performance Metrics (from backtesting)
        public decimal BacktestReturn { get; set; } = 0m;
        public double SharpeRatio { get; set; } = 0;
        public decimal MaxDrawdown { get; set; } = 0m;
        public double WinRate { get; set; } = 0;
        public int TotalTrades { get; set; } = 0;

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class StrategyWorkspace : INotifyPropertyChanged
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = "New Strategy";
        public string Description { get; set; } = string.Empty;
        public DateTime LastModified { get; set; } = DateTime.Now;
        public bool IsSaved { get; set; } = true;
        public string FilePath { get; set; } = string.Empty;

        public ObservableCollection<StrategyComponent> Components { get; set; } = new();
        public ObservableCollection<StrategyConnection> Connections { get; set; } = new();
        public string SourceCode { get; set; } = string.Empty;
        public string CompiledCode { get; set; } = string.Empty;
        public bool IsCompiled { get; set; } = false;
        public List<string> CompilationErrors { get; set; } = new();

        // Backtesting Results
        public BacktestResult? BacktestResult { get; set; }
        public bool IsBacktesting { get; set; } = false;
        public DateTime? LastBacktestRun { get; set; }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class BacktestResult
    {
        public string StrategyId { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal InitialCapital { get; set; } = 100000m;
        public decimal FinalCapital { get; set; }
        public decimal TotalReturn { get; set; }
        public decimal TotalReturnPercent { get; set; }
        public double SharpeRatio { get; set; }
        public double SortinoRatio { get; set; }
        public decimal MaxDrawdown { get; set; }
        public decimal MaxDrawdownPercent { get; set; }
        public double Volatility { get; set; }
        public double WinRate { get; set; }
        public double ProfitFactor { get; set; }
        public int TotalTrades { get; set; }
        public int WinningTrades { get; set; }
        public int LosingTrades { get; set; }
        public decimal AverageWin { get; set; }
        public decimal AverageLoss { get; set; }
        public decimal LargestWin { get; set; }
        public decimal LargestLoss { get; set; }
        public List<BacktestTrade> Trades { get; set; } = new();
        public List<BacktestEquityCurve> EquityCurve { get; set; } = new();
        public TimeSpan ExecutionTime { get; set; }
    }

    public class BacktestTrade
    {
        public DateTime EntryTime { get; set; }
        public DateTime ExitTime { get; set; }
        public decimal EntryPrice { get; set; }
        public decimal ExitPrice { get; set; }
        public int Quantity { get; set; }
        public string Side { get; set; } = "Long"; // Long, Short
        public decimal PnL { get; set; }
        public double HoldingPeriodHours { get; set; }
        public string ExitReason { get; set; } = string.Empty;
    }

    public class BacktestEquityCurve
    {
        public DateTime Date { get; set; }
        public decimal Equity { get; set; }
        public decimal Drawdown { get; set; }
    }

    public class StrategyComponentLibrary
    {
        public static List<StrategyComponent> GetIndicatorComponents()
        {
            return new List<StrategyComponent>
            {
                new() { Name = "Simple Moving Average", Type = "Indicator", Category = "Trend", Icon = "📈", Description = "Simple Moving Average with configurable period" },
                new() { Name = "Exponential Moving Average", Type = "Indicator", Category = "Trend", Icon = "📊", Description = "Exponential Moving Average for trend following" },
                new() { Name = "RSI", Type = "Indicator", Category = "Oscillator", Icon = "📉", Description = "Relative Strength Index for momentum analysis" },
                new() { Name = "MACD", Type = "Indicator", Category = "Momentum", Icon = "🌊", Description = "Moving Average Convergence Divergence" },
                new() { Name = "Bollinger Bands", Type = "Indicator", Category = "Volatility", Icon = "📏", Description = "Bollinger Bands for volatility analysis" },
                new() { Name = "Stochastic", Type = "Indicator", Category = "Oscillator", Icon = "🎯", Description = "Stochastic oscillator for overbought/oversold" },
                new() { Name = "ATR", Type = "Indicator", Category = "Volatility", Icon = "📐", Description = "Average True Range for volatility measurement" },
                new() { Name = "Volume Profile", Type = "Indicator", Category = "Volume", Icon = "📶", Description = "Volume Profile analysis" },
            };
        }

        public static List<StrategyComponent> GetSignalComponents()
        {
            return new List<StrategyComponent>
            {
                new() { Name = "Crossover Signal", Type = "Signal", Category = "Entry", Icon = "✂️", Description = "Generate signal when two lines cross" },
                new() { Name = "Threshold Signal", Type = "Signal", Category = "Entry", Icon = "🚦", Description = "Generate signal when indicator crosses threshold" },
                new() { Name = "Divergence Signal", Type = "Signal", Category = "Entry", Icon = "🔄", Description = "Detect price/indicator divergence" },
                new() { Name = "Pattern Signal", Type = "Signal", Category = "Entry", Icon = "🎨", Description = "Detect chart patterns" },
                new() { Name = "Breakout Signal", Type = "Signal", Category = "Entry", Icon = "💥", Description = "Detect support/resistance breakouts" },
                new() { Name = "Mean Reversion Signal", Type = "Signal", Category = "Entry", Icon = "🔄", Description = "Detect mean reversion opportunities" },
            };
        }

        public static List<StrategyComponent> GetRiskComponents()
        {
            return new List<StrategyComponent>
            {
                new() { Name = "Stop Loss", Type = "Risk", Category = "Exit", Icon = "🛑", Description = "Fixed or trailing stop loss" },
                new() { Name = "Take Profit", Type = "Risk", Category = "Exit", Icon = "🎯", Description = "Take profit at target level" },
                new() { Name = "Position Sizer", Type = "Risk", Category = "Money Management", Icon = "💰", Description = "Calculate optimal position size" },
                new() { Name = "Risk Per Trade", Type = "Risk", Category = "Money Management", Icon = "⚖️", Description = "Limit risk per trade" },
                new() { Name = "Maximum Exposure", Type = "Risk", Category = "Portfolio", Icon = "🏦", Description = "Limit maximum portfolio exposure" },
                new() { Name = "Time Exit", Type = "Risk", Category = "Exit", Icon = "⏰", Description = "Exit after specified time" },
            };
        }
    }
}
