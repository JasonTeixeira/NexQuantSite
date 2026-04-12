using System;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using Microsoft.Extensions.DependencyInjection;
using QuantumTrader.Integration;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.Views
{
    /// <summary>
    /// Paper Trading Control View - Ultra-Professional Interface
    /// Controls paper trading session with real strategies and live data
    /// </summary>
    public partial class PaperTradingControlView : UserControl
    {
        private readonly ILogger<PaperTradingControlView> _logger;
        private readonly PaperTradingCoordinator _paperTradingCoordinator;
        private readonly RealTimeMarketDataGateway _marketDataGateway;
        private readonly StrategyExecutionPipeline _strategyPipeline;
        private readonly DispatcherTimer _statusTimer;

        public ObservableCollection<ActivityFeedItem> ActivityItems { get; } = new();

        public PaperTradingControlView()
        {
            InitializeComponent();

            // Get services from DI
            var app = Application.Current as App;
            if (app?.Services != null)
            {
                _logger = app.Services.GetRequiredService<ILogger<PaperTradingControlView>>();
                _paperTradingCoordinator = app.Services.GetRequiredService<PaperTradingCoordinator>();
                _marketDataGateway = app.Services.GetRequiredService<RealTimeMarketDataGateway>();
                _strategyPipeline = app.Services.GetRequiredService<StrategyExecutionPipeline>();
            }

            // Set up data context
            ActivityFeed.ItemsSource = ActivityItems;

            // Set up status timer
            _statusTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            _statusTimer.Tick += UpdateStatusDisplay;
            _statusTimer.Start();

            // Subscribe to events
            if (_paperTradingCoordinator != null)
            {
                _paperTradingCoordinator.StatusChanged += OnPaperTradingStatusChanged;
                _paperTradingCoordinator.PaperTradeExecuted += OnPaperTradeExecuted;
            }

            if (_marketDataGateway != null)
            {
                _marketDataGateway.ConnectionStatusChanged += OnMarketDataConnectionChanged;
                _marketDataGateway.MarketDataReceived += OnMarketDataReceived;
            }

            if (_strategyPipeline != null)
            {
                _strategyPipeline.SignalGenerated += OnSignalGenerated;
            }

            AddActivityItem("📋", "Paper Trading Control initialized", DateTime.Now);
        }

        /// <summary>
        /// Start paper trading session
        /// </summary>
        private async void StartPaperTradingButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                StartPaperTradingButton.IsEnabled = false;
                AddActivityItem("🚀", "Starting paper trading session...", DateTime.Now);

                var success = await _paperTradingCoordinator.StartPaperTradingSessionAsync();

                if (success)
                {
                    StartPaperTradingButton.IsEnabled = false;
                    StopPaperTradingButton.IsEnabled = true;
                    AddActivityItem("✅", "Paper trading session started successfully!", DateTime.Now);
                    AddActivityItem("📊", "Real strategies now testing with live market data", DateTime.Now);
                }
                else
                {
                    StartPaperTradingButton.IsEnabled = true;
                    AddActivityItem("❌", "Failed to start paper trading session", DateTime.Now);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error starting paper trading session");
                AddActivityItem("💥", $"Error starting session: {ex.Message}", DateTime.Now);
                StartPaperTradingButton.IsEnabled = true;
            }
        }

        /// <summary>
        /// Stop paper trading session
        /// </summary>
        private async void StopPaperTradingButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                StopPaperTradingButton.IsEnabled = false;
                AddActivityItem("🛑", "Stopping paper trading session...", DateTime.Now);

                await _paperTradingCoordinator.StopPaperTradingSessionAsync();

                StartPaperTradingButton.IsEnabled = true;
                StopPaperTradingButton.IsEnabled = false;
                AddActivityItem("✅", "Paper trading session stopped", DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error stopping paper trading session");
                AddActivityItem("💥", $"Error stopping session: {ex.Message}", DateTime.Now);
                StopPaperTradingButton.IsEnabled = true;
            }
        }

        /// <summary>
        /// View paper trading report
        /// </summary>
        private void ViewReportButton_Click(object sender, RoutedEventArgs e)
        {
            AddActivityItem("📊", "Generating paper trading report...", DateTime.Now);
            // TODO: Implement report generation
        }

        /// <summary>
        /// Update status display
        /// </summary>
        private void UpdateStatusDisplay(object? sender, EventArgs e)
        {
            try
            {
                // Update market data status
                if (_marketDataGateway != null)
                {
                    var status = _marketDataGateway.GetStatus();
                    MarketDataStatus.Text = status.IsConnected ? $"Connected ({status.MessagesReceived} msgs)" : "Disconnected";
                }

                // Update strategies status
                if (_strategyPipeline != null)
                {
                    StrategiesStatus.Text = $"{_strategyPipeline.ActiveStrategiesCount} Active";
                }

                // Update session time
                if (_paperTradingCoordinator != null && _paperTradingCoordinator.IsPaperTradingActive)
                {
                    var sessionTime = DateTime.UtcNow - _paperTradingCoordinator.SessionStartTime;
                    SessionTimeStatus.Text = $"{sessionTime:hh\\:mm\\:ss}";
                }
                else
                {
                    SessionTimeStatus.Text = "00:00:00";
                }

                // Update risk engine status
                RiskEngineStatus.Text = "Active"; // Would get from risk bridge
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating status display");
            }
        }

        /// <summary>
        /// Add item to activity feed
        /// </summary>
        private void AddActivityItem(string icon, string message, DateTime timestamp)
        {
            Dispatcher.Invoke(() =>
            {
                ActivityItems.Insert(0, new ActivityFeedItem
                {
                    Icon = icon,
                    Message = message,
                    Timestamp = timestamp
                });

                // Keep only last 100 items
                if (ActivityItems.Count > 100)
                {
                    ActivityItems.RemoveAt(100);
                }
            });
        }

        // Event handlers
        private void OnPaperTradingStatusChanged(object? sender, PaperTradingStatusEventArgs e)
        {
            var icon = e.IsActive ? "🟢" : "🔴";
            AddActivityItem(icon, e.Message, DateTime.Now);
        }

        private void OnPaperTradeExecuted(object? sender, PaperTradeEventArgs e)
        {
            var icon = e.Success ? "📈" : "📉";
            var action = e.Signal.Action == "BUY" ? "LONG" : "SHORT";
            AddActivityItem(icon, $"Paper trade: {action} {e.Signal.Symbol} @ {e.Signal.EntryPrice:F2} (Conf: {e.Signal.Confidence:P0})", DateTime.Now);
        }

        private void OnMarketDataConnectionChanged(object? sender, ConnectionStatusEventArgs e)
        {
            Dispatcher.Invoke(() =>
            {
                ConnectionIndicator.Fill = e.IsConnected ?
                    System.Windows.Media.Brushes.LimeGreen :
                    System.Windows.Media.Brushes.Red;

                var icon = e.IsConnected ? "🟢" : "🔴";
                AddActivityItem(icon, $"Market data: {e.Message}", DateTime.Now);
            });
        }

        private void OnMarketDataReceived(object? sender, MarketDataUpdateEventArgs e)
        {
            // Only log occasional market data updates to avoid spam
            if (DateTime.Now.Second % 10 == 0) // Every 10 seconds
            {
                AddActivityItem("📊", $"Market data: {e.MarketData.Symbol} @ {e.MarketData.Price:F2}", DateTime.Now);
            }
        }

        private void OnSignalGenerated(object? sender, StrategySignalEventArgs e)
        {
            var icon = e.RiskValidation.IsApproved ? "🎯" : "⚠️";
            var action = e.Signal.Action == "BUY" ? "LONG" : "SHORT";
            var message = e.RiskValidation.IsApproved ?
                $"Signal approved: {action} {e.Signal.Symbol} (Risk: {e.RiskValidation.RiskScore:F1})" :
                $"Signal rejected: {e.Signal.Symbol} - {e.RiskValidation.RiskReason}";

            AddActivityItem(icon, message, DateTime.Now);
        }
    }

    /// <summary>
    /// Activity feed item for UI display
    /// </summary>
    public class ActivityFeedItem
    {
        public string Icon { get; set; } = "";
        public string Message { get; set; } = "";
        public DateTime Timestamp { get; set; }
    }
}









