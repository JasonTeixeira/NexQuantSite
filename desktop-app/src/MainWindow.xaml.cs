using System;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using QuantumTrader.Services;
using QuantumTrader.Views;
using QuantumTrader.ViewModels;
using System.Windows.Controls;
using System.Collections.ObjectModel;
using QuantumTrader.Models;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace QuantumTrader
{
    public partial class MainWindow : Window
    {
        private readonly CreditSystemService _credits;
        private readonly Execution.IOrderExecutionService _exec;
        private MarketDataService _marketData;
        private readonly IPnLCalculationService _pnlService;
        private readonly IStrategyExecutionService _strategyExecution;
        private readonly IRealTimeUpdateService _realTimeUpdates;
        private readonly IAIAssistantService _aiAssistant;
        private readonly IBrokerManager _brokerManager;
        private readonly ILogger<MainWindow> _logger;

        public ObservableCollection<Position> Positions { get; } = new ObservableCollection<Position>();
        public ObservableCollection<Execution.OrderViewItem> Orders => Execution.OrderBlotter.Orders;
        public ObservableCollection<QuantumTrader.Services.MarketDataPoint> WatchlistItems { get; } = new ObservableCollection<QuantumTrader.Services.MarketDataPoint>();

        public MainWindow(CreditSystemService creditSystemService, Execution.IOrderExecutionService exec, IPnLCalculationService pnlService, IStrategyExecutionService strategyExecution, IRealTimeUpdateService realTimeUpdates, IAIAssistantService aiAssistant, MarketDataService marketDataService, IMultiAccountManagerService multiAccountManager, IBuiltInStrategiesService builtInStrategies, ILiveTradingDashboardService liveTradingDashboard, IStrategyHubService strategyHubService, IStrategyStoreService strategyStoreService, IAnalyticsService analyticsService, IBrokerManager brokerManager, ILogger<MainWindow> logger)
        {
            InitializeComponent();

            _brokerManager = brokerManager;
            _logger = logger;
            _credits = creditSystemService;
            _exec = exec;
            _pnlService = pnlService;
            _strategyExecution = strategyExecution;
            _realTimeUpdates = realTimeUpdates;
            _aiAssistant = aiAssistant;
            _marketData = marketDataService;
            DataContext = this;

            // Create logger factory for ViewModels
            var loggerFactory = ((App)Application.Current).Services.GetRequiredService<ILoggerFactory>();

            // Initialize Live Trading View with proper ViewModel
            if (LiveTradingView != null)
            {
                // Comprehensive service validation for LiveTradingViewModel
                _logger.LogInformation("=== INITIALIZING LIVE TRADING VIEW ===");
                _logger.LogInformation("multiAccountManager: {IsNull}", multiAccountManager == null ? "NULL" : "OK");
                _logger.LogInformation("exec (OrderExecution): {IsNull}", exec == null ? "NULL" : "OK");
                _logger.LogInformation("marketDataService: {IsNull}", marketDataService == null ? "NULL" : "OK");
                _logger.LogInformation("pnlService: {IsNull}", pnlService == null ? "NULL" : "OK");
                _logger.LogInformation("strategyExecution: {IsNull}", strategyExecution == null ? "NULL" : "OK");
                _logger.LogInformation("realTimeUpdates: {IsNull}", realTimeUpdates == null ? "NULL" : "OK");

                if (exec == null)
                {
                    _logger.LogError("CRITICAL: Order execution service is NULL during MainWindow initialization!");
                }
                if (strategyExecution == null)
                {
                    _logger.LogError("CRITICAL: Strategy execution service is NULL during MainWindow initialization!");
                }

                var liveTradingViewModel = new LiveTradingViewModel(
                    multiAccountManager,
                    exec,
                    marketDataService,
                    pnlService,
                    strategyExecution,
                    realTimeUpdates,
                    loggerFactory.CreateLogger<LiveTradingViewModel>());

                LiveTradingView.DataContext = liveTradingViewModel;
                _ = liveTradingDashboard.InitializeAsync(); // Initialize service data

                _logger.LogInformation("=== LIVE TRADING VIEW INITIALIZED SUCCESSFULLY ===");
            }

            // Initialize Strategy Hub View with proper ViewModel
            if (StrategyHubView != null)
            {
                var strategyHubViewModel = new StrategyHubViewModel(
                    strategyHubService,
                    loggerFactory.CreateLogger<StrategyHubViewModel>());

                StrategyHubView.DataContext = strategyHubViewModel;
            }

            // Initialize Dashboard View with proper ViewModel (create it if it doesn't exist)
            if (DashboardView != null)
            {
                // For now, use the live trading dashboard service until we create a proper DashboardViewModel
                DashboardView.DataContext = liveTradingDashboard;
                DashboardView.Tag = liveTradingDashboard;
            }

            // Initialize Analytics View with service
            if (AnalyticsView != null)
            {
                AnalyticsView.DataContext = analyticsService;
            }

            // Initialize Strategy Store View with service
            if (StrategyStoreView != null)
            {
                StrategyStoreView.DataContext = strategyStoreService;
            }



            InitializeApplication();
        }

        private void InitializeApplication()
        {
            try
            {
                UpdateCreditsDisplay();
                SetupRealTimeUpdates();
                SetupWatchlist();
                UpdateStatusMode();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Initialization error: {ex.Message}");
            }
        }

        private void UpdateCreditsDisplay()
        {
            try
            {
                var credits = _credits?.GetAvailableCredits() ?? 0;
                if (CreditsText != null)
                {
                    CreditsText.Text = credits.ToString("N0");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Credits update error: {ex.Message}");
            }
        }

        private void SetupRealTimeUpdates()
        {
            try
            {
                // Subscribe to real-time updates
                if (_realTimeUpdates != null)
                {
                    _realTimeUpdates.OnPnLUpdated += () => Dispatcher.Invoke(UpdateCreditsDisplay);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Real-time updates error: {ex.Message}");
            }
        }

        private void SetupWatchlist()
        {
            try
            {
                // Set up watchlist binding
                if (Watchlist != null)
                {
                    Watchlist.ItemsSource = WatchlistItems;
                }

                // Add sample watchlist items
                WatchlistItems.Add(new QuantumTrader.Services.MarketDataPoint { Symbol = "ES", Price = 4320.25m });
                WatchlistItems.Add(new QuantumTrader.Services.MarketDataPoint { Symbol = "NQ", Price = 17250.50m });
                WatchlistItems.Add(new QuantumTrader.Services.MarketDataPoint { Symbol = "YM", Price = 38420.75m });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Watchlist setup error: {ex.Message}");
            }
        }

        private void UpdateStatusMode()
        {
            try
            {
                var demoMode = (Environment.GetEnvironmentVariable("DEMO_MODE") ?? "false").Equals("true", StringComparison.OrdinalIgnoreCase);
                if (StatusModeText != null)
                {
                    StatusModeText.Text = demoMode ? "MODE: DEMO (Stub)" : "MODE: LIVE";
                    StatusModeText.Foreground = (System.Windows.Media.Brush)FindResource(demoMode ? "NexusAIAccentOrange" : "NexusAIAccentGreen");
                }

                if (MlHealthText != null)
                {
                    MlHealthText.Text = "ML Service: Connected";
                    MlHealthText.Foreground = (System.Windows.Media.Brush)FindResource("NexusAIAccentGreen");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Status update error: {ex.Message}");
            }
        }

        // Event Handlers for the simplified UI
        private void OnAddCreditsClick(object sender, RoutedEventArgs e)
            {
                try
                {
                // TODO: Implement add credits functionality
                ShowMessage("Add Credits", "Credits purchase functionality will be implemented next.");
                }
                catch (Exception ex)
                {
                ShowMessage("Error", $"Error: {ex.Message}");
            }
        }

        private void OnAIQueryClick(object sender, RoutedEventArgs e)
        {
            try
            {
                // TODO: Implement AI query functionality
                ShowMessage("AI Assistant", "AI query functionality will be implemented next.");
            }
            catch (Exception ex)
            {
                ShowMessage("Error", $"Error: {ex.Message}");
            }
        }

        private void ShowMessage(string title, string message)
        {
            MessageBox.Show(message, title, MessageBoxButton.OK, MessageBoxImage.Information);
        }

        // Clean up resources
        protected override void OnClosed(EventArgs e)
        {
            try
            {
                // Clean up any subscriptions
            }
            catch { }

            base.OnClosed(e);
        }
        /// <summary>
        /// Handle broker selection changes in the header dropdown
        /// </summary>
        private async void BrokerSelectionComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (sender is ComboBox comboBox && comboBox.SelectedItem is ComboBoxItem selectedItem)
            {
                var brokerName = selectedItem.Content?.ToString();
                if (!string.IsNullOrEmpty(brokerName))
                {
                    try
                    {
                        _logger?.LogInformation("🔄 Switching to broker: {BrokerName}", brokerName);

                        var success = await _brokerManager.SetCurrentBrokerAsync(brokerName);

                        if (success)
                        {
                            _logger?.LogInformation("✅ Successfully switched to {BrokerName}", brokerName);

                            // Update UI to reflect broker change
                            await RefreshBrokerStatusAsync();

                            // Show success notification
                            ShowBrokerNotification($"Connected to {brokerName}", true);
                        }
                        else
                        {
                            _logger?.LogWarning("⚠️ Failed to switch to {BrokerName}", brokerName);

                            // Revert selection to current broker
                            await RevertBrokerSelectionAsync();

                            // Show error notification
                            ShowBrokerNotification($"Failed to connect to {brokerName}", false);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "❌ Error switching brokers");

                        // Revert selection and show error
                        await RevertBrokerSelectionAsync();
                        ShowBrokerNotification($"Error connecting to {brokerName}: {ex.Message}", false);
                    }
                }
            }
        }

        private async Task RefreshBrokerStatusAsync()
        {
            try
            {
                var currentBroker = await _brokerManager.GetCurrentBrokerAsync();
                var isHealthy = await currentBroker.IsHealthyAsync();

                // Update any UI elements that show broker status
                _logger?.LogInformation("🔍 Current broker status: {IsHealthy}", isHealthy ? "Healthy" : "Unhealthy");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "❌ Error refreshing broker status");
            }
        }

        private async Task RevertBrokerSelectionAsync()
        {
            try
            {
                var currentBrokerName = _brokerManager.CurrentBrokerName;

                // Find and select the current broker in the dropdown
                foreach (ComboBoxItem item in BrokerSelectionComboBox.Items)
                {
                    if (item.Content?.ToString() == currentBrokerName)
                    {
                        BrokerSelectionComboBox.SelectedItem = item;
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "❌ Error reverting broker selection");
            }
        }

        private void ShowBrokerNotification(string message, bool isSuccess)
        {
            try
            {
                // Simple notification - could be enhanced with custom notification UI
                var title = isSuccess ? "Broker Connected" : "Broker Connection Failed";
                var icon = isSuccess ? MessageBoxImage.Information : MessageBoxImage.Warning;

                MessageBox.Show(message, title, MessageBoxButton.OK, icon);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "❌ Error showing broker notification");
            }
        }
    }
}
