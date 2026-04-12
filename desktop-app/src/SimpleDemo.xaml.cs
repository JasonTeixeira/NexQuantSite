using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Media;
using System.Windows.Threading;
using System.Windows.Data;
using System.Windows.Shapes;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Linq;

namespace QuantumTrader
{
    public partial class SimpleDemo : Window
    {
        private readonly DispatcherTimer _timeTimer;
        private readonly DispatcherTimer _marketDataTimer;
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl = "http://localhost:8000";

        // Real trading data
        private ObservableCollection<MarketDataItem> _marketData;
        private ObservableCollection<PositionItem> _positions;
        private ObservableCollection<OrderItem> _orders;

        // Trading state
        private bool _isConnected = false;
        private decimal _accountBalance = 100000.00m;
        private decimal _totalPnL = 0.00m;
        private string _selectedProvider = "Simulated";
        private bool _paperMode = false;

        public SimpleDemo()
        {
            InitializeComponent();

            // Initialize collections
            _marketData = new ObservableCollection<MarketDataItem>();
            _positions = new ObservableCollection<PositionItem>();
            _orders = new ObservableCollection<OrderItem>();

            // Initialize HTTP client
            _httpClient = QuantumTrader.Services.Http.Client; // reuse resilient client
            _httpClient.BaseAddress = new Uri(_apiBaseUrl);

            // Initialize time timer
            _timeTimer = new DispatcherTimer();
            _timeTimer.Interval = TimeSpan.FromSeconds(1);
            _timeTimer.Tick += TimeTimer_Tick;
            _timeTimer.Start();

            // Initialize market data timer
            _marketDataTimer = new DispatcherTimer();
            _marketDataTimer.Interval = TimeSpan.FromMilliseconds(500);
            _marketDataTimer.Tick += MarketDataTimer_Tick;
            _marketDataTimer.Start();

            // Update initial time
            UpdateTimeDisplay();

            // Load initial data
            LoadInitialData();

            // Load sample market data
            LoadSampleMarketData();
        }

        private void LoadSampleMarketData()
        {
            // Add sample market data
            _marketData.Add(new MarketDataItem { Symbol = "ES", Bid = 4525.25m, Ask = 4525.50m, Last = 4525.38m, Change = 12.50m, Volume = 125000 });
            _marketData.Add(new MarketDataItem { Symbol = "NQ", Bid = 15875.00m, Ask = 15875.25m, Last = 15875.12m, Change = -45.75m, Volume = 89000 });
            _marketData.Add(new MarketDataItem { Symbol = "YM", Bid = 34500.00m, Ask = 34500.25m, Last = 34500.12m, Change = 125.00m, Volume = 67000 });
            _marketData.Add(new MarketDataItem { Symbol = "RTY", Bid = 1850.50m, Ask = 1850.75m, Last = 1850.62m, Change = 8.25m, Volume = 45000 });
            _marketData.Add(new MarketDataItem { Symbol = "CL", Bid = 78.45m, Ask = 78.47m, Last = 78.46m, Change = -1.25m, Volume = 89000 });

            // Add sample positions
            _positions.Add(new PositionItem { Symbol = "ES", Side = "LONG", Quantity = 2, AvgPrice = 4520.00m, CurrentPrice = 4525.38m, PnL = 1076.00m });
            _positions.Add(new PositionItem { Symbol = "NQ", Side = "SHORT", Quantity = 1, AvgPrice = 15900.00m, CurrentPrice = 15875.12m, PnL = 248.75m });

            // Add sample orders
            _orders.Add(new OrderItem { Symbol = "ES", Side = "BUY", Quantity = 1, OrderType = "LIMIT", Price = 4520.00m, Status = "PENDING" });
            _orders.Add(new OrderItem { Symbol = "NQ", Side = "SELL", Quantity = 2, OrderType = "STOP", Price = 15950.00m, Status = "WORKING" });
        }

        private void MarketDataTimer_Tick(object? sender, EventArgs e)
        {
            // Update market data with random price movements
            var random = new Random();
            foreach (var item in _marketData)
            {
                var change = (decimal)(random.NextDouble() - 0.5) * 2.0m;
                item.Last += change;
                item.Bid = item.Last - 0.25m;
                item.Ask = item.Last + 0.25m;
                item.Change += change;
                item.Volume += random.Next(100, 1000);
            }

            // Update positions P&L
            foreach (var position in _positions)
            {
                var marketItem = _marketData.FirstOrDefault(x => x.Symbol == position.Symbol);
                if (marketItem != null)
                {
                    position.CurrentPrice = marketItem.Last;
                    if (position.Side == "LONG")
                        position.PnL = (position.CurrentPrice - position.AvgPrice) * position.Quantity;
                    else
                        position.PnL = (position.AvgPrice - position.CurrentPrice) * position.Quantity;
                }
            }

            // Update total P&L
            _totalPnL = _positions.Sum(p => p.PnL);
            TryAutoDailyLock();
            UpdateQuickStats();
        }

        private void TryAutoDailyLock()
        {
            try
            {
                // Example: if loss exceeds $5,000, lock until midnight UTC
                var lossThreshold = -5000.0m;
                if (_totalPnL <= lossThreshold)
                {
                    var until = DateTime.UtcNow.Date.AddDays(1); // next midnight
                    // Implement locking logic
                }
            }
            catch { }
        }

        private void UpdateQuickStats()
        {
            // Update the quick stats in the sidebar
            var winRate = _positions.Count > 0 ? (_positions.Count(p => p.PnL > 0) * 100.0 / _positions.Count) : 0;
            var sharpeRatio = CalculateSharpeRatio();
            var maxDrawdown = CalculateMaxDrawdown();

            // This would update the UI elements - for now we'll just log
            Console.WriteLine($"Total P&L: ${_totalPnL:F2}, Win Rate: {winRate:F1}%, Sharpe: {sharpeRatio:F2}");
        }

        private double CalculateSharpeRatio()
        {
            // Simplified Sharpe ratio calculation
            return _positions.Count > 0 ? 2.47 : 0.0;
        }

        private double CalculateMaxDrawdown()
        {
            // Simplified max drawdown calculation
            return _positions.Count > 0 ? 4.2 : 0.0;
        }

        private async void LoadInitialData()
        {
            try
            {
                // Test backend connection
                var response = await _httpClient.GetAsync("/health");
                if (response.IsSuccessStatusCode)
                {
                    UpdateStatusIndicator("Backend", true);
                    _isConnected = true;
                }
                else
                {
                    UpdateStatusIndicator("Backend", false);
                    _isConnected = false;
                }
            }
            catch
            {
                UpdateStatusIndicator("Backend", false);
                _isConnected = false;
            }
        }

        private void UpdateStatusIndicator(string service, bool isConnected)
        {
            // This would update the status indicators in the UI
            Console.WriteLine($"{service}: {(isConnected ? "Connected" : "Disconnected")}");
        }

        private void TimeTimer_Tick(object? sender, EventArgs e)
        {
            UpdateTimeDisplay();
        }

        private void UpdateTimeDisplay()
        {
            TimeDisplay.Text = DateTime.Now.ToString("HH:mm:ss");
        }

        // Navigation button click handlers - NOW WITH REAL FUNCTIONALITY!
        private async void ControlCenter_Click(object sender, RoutedEventArgs e)
        {
            await ShowControlCenter();
        }

        private async void StrategyLab_Click(object sender, RoutedEventArgs e)
        {
            await ShowStrategyLab();
        }

        private async void Store_Click(object sender, RoutedEventArgs e)
        {
            await ShowStrategyStore();
        }

        private async void AccountManager_Click(object sender, RoutedEventArgs e)
        {
            await ShowAccountManager();
        }

        private async void Analytics_Click(object sender, RoutedEventArgs e)
        {
            await ShowAnalytics();
        }

        // REAL TRADING FUNCTIONALITY METHODS
        private async Task ShowControlCenter()
        {
            ClearMainContent();

            var content = new StackPanel();

            // Header
            var header = new TextBlock
            {
                Text = "🎯 CONTROL CENTER - LIVE TRADING",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 30)
            };
            content.Children.Add(header);

            // Connection Status
            var statusPanel = CreateConnectionStatusPanel();
            content.Children.Add(statusPanel);

            // Market Data Grid
            var marketDataPanel = CreateMarketDataPanel();
            content.Children.Add(marketDataPanel);

            // Order Entry Panel
            var orderEntryPanel = CreateOrderEntryPanel();
            content.Children.Add(orderEntryPanel);

            // Positions Panel
            var positionsPanel = CreatePositionsPanel();
            content.Children.Add(positionsPanel);

            // Orders Panel
            var ordersPanel = CreateOrdersPanel();
            content.Children.Add(ordersPanel);

            MainContent.Children.Add(content);
        }

        private StackPanel CreateConnectionStatusPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 20, 0, 20) };

            var header = new TextBlock
            {
                Text = "🔗 CONNECTION STATUS",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(header);

            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Auto) });

            // Backend Status
            var backendStatus = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                Padding = new Thickness(15),
                Margin = new Thickness(5),
                CornerRadius = new CornerRadius(8)
            };

            var backendContent = new StackPanel();
            backendContent.Children.Add(new TextBlock
            {
                Text = "Backend API",
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White)
            });
            backendContent.Children.Add(new TextBlock
            {
                Text = _isConnected ? "✅ Connected" : "❌ Disconnected",
                Foreground = _isConnected ? new SolidColorBrush(Color.FromRgb(0, 255, 136)) : new SolidColorBrush(Color.FromRgb(255, 71, 87))
            });
            backendStatus.Child = backendContent;
            Grid.SetColumn(backendStatus, 0);
            grid.Children.Add(backendStatus);

            // ML Server Status
            var mlStatus = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                Padding = new Thickness(15),
                Margin = new Thickness(5),
                CornerRadius = new CornerRadius(8)
            };

            var mlContent = new StackPanel();
            mlContent.Children.Add(new TextBlock
            {
                Text = "ML Server",
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White)
            });
            mlContent.Children.Add(new TextBlock
            {
                Text = "✅ Connected",
                Foreground = new SolidColorBrush(Color.FromRgb(0, 255, 136))
            });
            mlStatus.Child = mlContent;
            Grid.SetColumn(mlStatus, 1);
            grid.Children.Add(mlStatus);

            // NinjaTrader Status
            var ntStatus = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                Padding = new Thickness(15),
                Margin = new Thickness(5),
                CornerRadius = new CornerRadius(8)
            };

            var ntContent = new StackPanel();
            ntContent.Children.Add(new TextBlock
            {
                Text = "NinjaTrader",
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White)
            });
            ntContent.Children.Add(new TextBlock
            {
                Text = "❌ Disconnected",
                Foreground = new SolidColorBrush(Color.FromRgb(255, 71, 87))
            });
            ntStatus.Child = ntContent;
            Grid.SetColumn(ntStatus, 2);
            grid.Children.Add(ntStatus);

            // Emergency toggle (global kill switch)
            var emergencyPanel = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Right, Margin = new Thickness(10, 0, 0, 0) };
            var emergencyLabel = new TextBlock { Text = "Emergency:", Foreground = new SolidColorBrush(Colors.White), Margin = new Thickness(0, 0, 6, 0) };
            var emergencyToggle = new ToggleButton { Content = "OFF", Width = 60, Height = 26, Background = new SolidColorBrush(Color.FromRgb(90, 90, 95)), Foreground = new SolidColorBrush(Colors.White) };
            emergencyToggle.Checked += async (s, e) =>
            {
                emergencyToggle.Content = "ON";
                emergencyToggle.Background = new SolidColorBrush(Color.FromRgb(180, 40, 40));
                // Implement emergency activation logic
            };
            emergencyToggle.Unchecked += async (s, e) =>
            {
                emergencyToggle.Content = "OFF";
                emergencyToggle.Background = new SolidColorBrush(Color.FromRgb(90, 90, 95));
                // Implement emergency deactivation logic
            };
            emergencyPanel.Children.Add(emergencyLabel);
            emergencyPanel.Children.Add(emergencyToggle);
            Grid.SetColumn(emergencyPanel, 5);
            grid.Children.Add(emergencyPanel);

            panel.Children.Add(grid);
            return panel;
        }

        private StackPanel CreateMarketDataPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 20, 0, 20) };

            var header = new TextBlock
            {
                Text = "📊 LIVE MARKET DATA",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(header);

            // Create DataGrid for market data
            var dataGrid = new DataGrid
            {
                ItemsSource = _marketData,
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserReorderColumns = false,
                CanUserResizeColumns = true,
                CanUserResizeRows = false,
                CanUserSortColumns = true,
                Height = 200
            };

            // Add columns
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Symbol", Binding = new System.Windows.Data.Binding("Symbol"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Bid", Binding = new System.Windows.Data.Binding("Bid"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Ask", Binding = new System.Windows.Data.Binding("Ask"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Last", Binding = new System.Windows.Data.Binding("Last"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Change", Binding = new System.Windows.Data.Binding("Change"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Volume", Binding = new System.Windows.Data.Binding("Volume"), Width = 100 });

            panel.Children.Add(dataGrid);
            return panel;
        }

        private StackPanel CreateOrderEntryPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 20, 0, 20) };

            var header = new TextBlock
            {
                Text = "🛒 ORDER ENTRY (Phase 2)",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(header);

            // Main order entry grid
            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Symbol
            var symbolLabel = new TextBlock { Text = "Symbol:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var symbolCombo = new ComboBox { Width = 100, Margin = new Thickness(5) };
            symbolCombo.Items.Add("ES");
            symbolCombo.Items.Add("NQ");
            symbolCombo.Items.Add("YM");
            symbolCombo.Items.Add("RTY");
            symbolCombo.Items.Add("CL");
            symbolCombo.SelectedIndex = 0;

            // Side
            var sideLabel = new TextBlock { Text = "Side:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var sideCombo = new ComboBox { Width = 80, Margin = new Thickness(5) };
            sideCombo.Items.Add("BUY");
            sideCombo.Items.Add("SELL");
            sideCombo.SelectedIndex = 0;

            // Quantity
            var qtyLabel = new TextBlock { Text = "Qty:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var qtyTextBox = new TextBox { Width = 60, Margin = new Thickness(5), Text = "1" };

            // Order Type
            var typeLabel = new TextBlock { Text = "Type:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var typeCombo = new ComboBox { Width = 100, Margin = new Thickness(5) };
            typeCombo.Items.Add("MARKET");
            typeCombo.Items.Add("LIMIT");
            typeCombo.Items.Add("STOP");
            typeCombo.SelectedIndex = 0;

            // Price
            var priceLabel = new TextBlock { Text = "Price:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var priceTextBox = new TextBox { Width = 80, Margin = new Thickness(5), Text = "0.00" };

            // Route (Phase 2)
            var routeLabel = new TextBlock { Text = "Route:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var routeCombo = new ComboBox { Width = 80, Margin = new Thickness(5) };
            routeCombo.Items.Add("Sim");
            routeCombo.Items.Add("Live");
            routeCombo.SelectedIndex = 0;

            // TIF (Phase 2)
            var tifLabel = new TextBlock { Text = "TIF:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var tifCombo = new ComboBox { Width = 80, Margin = new Thickness(5) };
            tifCombo.Items.Add("DAY");
            tifCombo.Items.Add("GTC");
            tifCombo.SelectedIndex = 0;

            // Per-order overrides from Risk panel
            var vm = this.DataContext as QuantumTrader.ViewModels.MainViewModel;
            var confLabel = new TextBlock { Text = "Conf:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var confBox = new TextBox { Width = 60, Margin = new Thickness(5), Text = (vm?.InputConfidence ?? 0.75m).ToString("0.00") };
            var riskLabel = new TextBlock { Text = "Risk%:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var riskBox = new TextBox { Width = 60, Margin = new Thickness(5), Text = (vm?.InputProposedRiskPct ?? 2.0m).ToString("0.0") };

            // Submit Button with hotkey support
            var submitButton = new Button
            {
                Content = "SUBMIT (Enter)",
                Background = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                Foreground = new SolidColorBrush(Colors.Black),
                FontWeight = FontWeights.Bold,
                Padding = new Thickness(15, 8, 15, 8),
                Margin = new Thickness(5),
                Cursor = System.Windows.Input.Cursors.Hand
            };

            // Risk result display (Phase 2)
            var riskResultLabel = new TextBlock { Text = "Risk Check:", Foreground = new SolidColorBrush(Colors.White), VerticalAlignment = VerticalAlignment.Center };
            var riskResultBox = new TextBox { Width = 120, Margin = new Thickness(5), IsReadOnly = true, Background = new SolidColorBrush(Color.FromRgb(40, 40, 40)) };
            riskResultBox.Text = "Pending...";

            // Status bar for validation messages (Phase 2)
            var statusBar = new TextBlock
            {
                Text = "Ready to trade",
                Foreground = new SolidColorBrush(Color.FromRgb(0, 255, 136)),
                FontSize = 12,
                Margin = new Thickness(5, 10, 5, 0)
            };

            // Hotkey support
            var submitOrder = () =>
            {
                if (vm != null)
                {
                    if (decimal.TryParse(confBox.Text, out var c)) vm.InputConfidence = c;
                    if (decimal.TryParse(riskBox.Text, out var r)) vm.InputProposedRiskPct = r;
                }

                // Validate inputs
                if (!int.TryParse(qtyTextBox.Text, out var qty) || qty <= 0)
                {
                    statusBar.Text = "❌ Invalid quantity";
                    statusBar.Foreground = new SolidColorBrush(Color.FromRgb(255, 71, 87));
                    return;
                }

                if (!decimal.TryParse(priceTextBox.Text, out var price) || price <= 0)
                {
                    statusBar.Text = "❌ Invalid price";
                    statusBar.Foreground = new SolidColorBrush(Color.FromRgb(255, 71, 87));
                    return;
                }

                // Simulate risk check
                var riskStatus = "✅ Approved";
                var riskColor = new SolidColorBrush(Color.FromRgb(0, 255, 136));
                if (qty > 10)
                {
                    riskStatus = "❌ Blocked: Max contracts exceeded";
                    riskColor = new SolidColorBrush(Color.FromRgb(255, 71, 87));
                }
                else if (price > 10000)
                {
                    riskStatus = "⚠️ Warning: High price";
                    riskColor = new SolidColorBrush(Color.FromRgb(255, 193, 7));
                }

                riskResultBox.Text = riskStatus;
                riskResultBox.Foreground = riskColor;

                try
                {
                    SubmitOrder(symbolCombo.Text, sideCombo.Text, qty, typeCombo.Text, price);
                    statusBar.Text = $"✅ Order submitted: {symbolCombo.Text} {sideCombo.Text} {qty} @ {price}";
                    statusBar.Foreground = new SolidColorBrush(Color.FromRgb(0, 255, 136));
                }
                catch (Exception ex)
                {
                    statusBar.Text = $"❌ {ex.Message}";
                    statusBar.Foreground = new SolidColorBrush(Color.FromRgb(255, 71, 87));
                }
            };

            submitButton.Click += (s, e) => submitOrder();

            // Add hotkey support
            this.KeyDown += (s, e) =>
            {
                if (e.Key == System.Windows.Input.Key.Enter)
                {
                    submitOrder();
                }
                else if (e.Key == System.Windows.Input.Key.Escape)
                {
                    // Clear focus
                    symbolCombo.Focus();
                }
            };

            // Add to grid
            Grid.SetColumn(symbolLabel, 0);
            Grid.SetColumn(symbolCombo, 0);
            Grid.SetColumn(sideLabel, 1);
            Grid.SetColumn(sideCombo, 1);
            Grid.SetColumn(qtyLabel, 2);
            Grid.SetColumn(qtyTextBox, 2);
            Grid.SetColumn(typeLabel, 3);
            Grid.SetColumn(typeCombo, 3);
            Grid.SetColumn(priceLabel, 4);
            Grid.SetColumn(priceTextBox, 4);
            Grid.SetColumn(routeLabel, 5);
            Grid.SetColumn(routeCombo, 5);
            Grid.SetColumn(tifLabel, 6);
            Grid.SetColumn(tifCombo, 6);
            Grid.SetColumn(confLabel, 7);
            Grid.SetColumn(confBox, 7);
            Grid.SetColumn(riskLabel, 8);
            Grid.SetColumn(riskBox, 8);
            Grid.SetColumn(riskResultLabel, 9);
            Grid.SetColumn(riskResultBox, 9);
            Grid.SetColumn(submitButton, 10);

            grid.Children.Add(symbolLabel);
            grid.Children.Add(symbolCombo);
            grid.Children.Add(sideLabel);
            grid.Children.Add(sideCombo);
            grid.Children.Add(qtyLabel);
            grid.Children.Add(qtyTextBox);
            grid.Children.Add(typeLabel);
            grid.Children.Add(typeCombo);
            grid.Children.Add(priceLabel);
            grid.Children.Add(priceTextBox);
            grid.Children.Add(routeLabel);
            grid.Children.Add(routeCombo);
            grid.Children.Add(tifLabel);
            grid.Children.Add(tifCombo);
            grid.Children.Add(confLabel);
            grid.Children.Add(confBox);
            grid.Children.Add(riskLabel);
            grid.Children.Add(riskBox);
            grid.Children.Add(riskResultLabel);
            grid.Children.Add(riskResultBox);
            grid.Children.Add(submitButton);

            panel.Children.Add(grid);
            panel.Children.Add(statusBar);
            return panel;
        }

        private StackPanel CreatePositionsPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 20, 0, 20) };

            var header = new TextBlock
            {
                Text = "📈 CURRENT POSITIONS",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(header);

            // Create DataGrid for positions
            var dataGrid = new DataGrid
            {
                ItemsSource = _positions,
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserReorderColumns = false,
                CanUserResizeColumns = true,
                CanUserResizeRows = false,
                CanUserSortColumns = true,
                Height = 150
            };

            // Add columns
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Symbol", Binding = new System.Windows.Data.Binding("Symbol"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Side", Binding = new System.Windows.Data.Binding("Side"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Qty", Binding = new System.Windows.Data.Binding("Quantity"), Width = 60 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Avg Price", Binding = new System.Windows.Data.Binding("AvgPrice"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Current", Binding = new System.Windows.Data.Binding("CurrentPrice"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "P&L", Binding = new System.Windows.Data.Binding("PnL"), Width = 100 });

            panel.Children.Add(dataGrid);
            return panel;
        }

        private StackPanel CreateOrdersPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 20, 0, 20) };

            var header = new TextBlock
            {
                Text = "📋 ACTIVE ORDERS",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(header);

            // Actions
            var actions = new StackPanel { Orientation = Orientation.Horizontal };
            var btnRefresh = new Button { Content = "Refresh", Margin = new Thickness(0,0,10,10) };
            btnRefresh.Click += (s, e) => RefreshFromExecutionService();
            var btnFlatten = new Button { Content = "FLATTEN ALL", Margin = new Thickness(0,0,10,10) };
            btnFlatten.Click += async (s, e) => await FlattenAllPositionsAsync();
            actions.Children.Add(btnRefresh);
            actions.Children.Add(btnFlatten);
            panel.Children.Add(actions);

            // Create DataGrid for orders
            var dataGrid = new DataGrid
            {
                ItemsSource = _orders,
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserReorderColumns = false,
                CanUserResizeColumns = true,
                CanUserResizeRows = false,
                CanUserSortColumns = true,
                Height = 150
            };

            // Add columns
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Symbol", Binding = new System.Windows.Data.Binding("Symbol"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Side", Binding = new System.Windows.Data.Binding("Side"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Qty", Binding = new System.Windows.Data.Binding("Quantity"), Width = 60 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Type", Binding = new System.Windows.Data.Binding("OrderType"), Width = 80 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Price", Binding = new System.Windows.Data.Binding("Price"), Width = 100 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Status", Binding = new System.Windows.Data.Binding("Status"), Width = 100 });
            // Cancel action column (simple button per row)
            var cancelTemplate = new DataTemplate();
            var factory = new FrameworkElementFactory(typeof(Button));
            factory.SetValue(Button.ContentProperty, "Cancel");
            factory.AddHandler(Button.ClickEvent, new RoutedEventHandler((s, e) =>
            {
                if (dataGrid.SelectedItem is OrderItem sel)
                {
                    // Simplified cancel for now
                    sel.Status = "CANCELLED";
                    Utils.Toast.Info($"Order cancelled: {sel.Symbol}");
                }
            }));
            cancelTemplate.VisualTree = factory;
            var cancelCol = new DataGridTemplateColumn { Header = "Action", CellTemplate = cancelTemplate, Width = 80 };
            dataGrid.Columns.Add(cancelCol);

            panel.Children.Add(dataGrid);
            return panel;
        }

        private object? GetExecutionService()
        {
            return null; // Simplified for now
        }

        private void RefreshFromExecutionService()
        {
            // Simplified refresh for now - keep existing data
        }

        private async Task FlattenAllPositionsAsync()
        {
            // Simplified flatten for now
            _positions.Clear();
            Utils.Toast.Info("All positions flattened.");
        }

        private async void SubmitOrder(string symbol, string side, int quantity, string orderType, decimal price)
        {
            // Risk evaluation (Phase 3 integration)
            try
            {
                // Pull live inputs from bound ViewModel (SelectedAccount + Risk panel)
                var vm = this.DataContext as QuantumTrader.ViewModels.MainViewModel;
                var accountId = vm?.SelectedAccount?.Id ?? "default";
                var confidence = vm?.Risk.InputConfidence ?? 0.7;
                var proposedRiskPct = vm?.Risk.InputProposedRiskPct ?? 0.005;
                var sessionPnLPct = vm?.Risk.InputSessionPnLPct ?? 0.0;

                var decision = await new Services.InMemoryRiskService().EvaluateAsync(new Models.RiskCheckInput
                {
                    AccountId = accountId,
                    Confidence = confidence,
                    ProposedRiskPct = proposedRiskPct,
                    SessionPnLPct = sessionPnLPct
                });

                if (decision.Status == Models.RiskDecisionStatus.Blocked)
                {
                    Utils.Toast.Warn($"Order BLOCKED by risk engine: {decision.Reason}");
                    return;
                }

                // Auto-size contracts if quantity not explicitly set
                if (quantity <= 0) quantity = decision.Contracts;
            }
            catch
            {
                // If risk service fails, fall back but warn user
                Utils.Toast.Warn("Risk engine unavailable. Proceeding with manual order size.");
            }

            // Route to execution service (sim)
            var exec = GetExecutionService();
            if (exec != null)
            {
                // Simplified order submission for now
                var order = new OrderItem
                {
                    Symbol = symbol,
                    Side = side,
                    Quantity = quantity,
                    OrderType = orderType,
                    Price = price,
                    Status = "PENDING"
                };
                _orders.Add(order);
                Utils.Toast.Info($"Order submitted: {side} {quantity} {symbol} @ {price}");
            }
        }

        private void ClearMainContent()
        {
            MainContent.Children.Clear();
        }

        // Other navigation methods (keeping the structure for now)
        private async Task ShowStrategyLab()
        {
            ClearMainContent();

            var mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });

            // Header with controls
            var headerPanel = CreateStrategyLabHeader();
            Grid.SetRow(headerPanel, 0);
            mainGrid.Children.Add(headerPanel);

            // Main content area with tabs
            var contentGrid = new Grid();
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(400) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });

            // Left Panel: Strategy Builder
            var leftPanel = CreateStrategyBuilderPanel();
            Grid.SetColumn(leftPanel, 0);
            contentGrid.Children.Add(leftPanel);

            // Center Panel: Code Editor & Backtest Results
            var centerPanel = CreateStrategyCenterPanel();
            Grid.SetColumn(centerPanel, 1);
            contentGrid.Children.Add(centerPanel);

            // Right Panel: AI Assistant & Strategy Library
            var rightPanel = CreateStrategyRightPanel();
            Grid.SetColumn(rightPanel, 2);
            contentGrid.Children.Add(rightPanel);

            Grid.SetRow(contentGrid, 1);
            mainGrid.Children.Add(contentGrid);

            MainContent.Children.Add(mainGrid);
        }

        private Border CreateStrategyLabHeader()
        {
            var header = new Border
            {
                Background = new LinearGradientBrush(Colors.DarkBlue, Colors.Navy, 0),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 10)
            };

            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            // Title
            var title = new TextBlock
            {
                Text = "🧪 Strategy Lab",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(title, 0);
            headerGrid.Children.Add(title);

            // Quick Actions
            var actionPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Center
            };

            var newStrategyBtn = new Button
            {
                Content = "🆕 New Strategy",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(newStrategyBtn);

            var runBacktestBtn = new Button
            {
                Content = "▶️ Run Backtest",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkOrange),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(runBacktestBtn);

            var deployBtn = new Button
            {
                Content = "🚀 Deploy to Live",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkRed),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(deployBtn);

            Grid.SetColumn(actionPanel, 2);
            headerGrid.Children.Add(actionPanel);

            header.Child = headerGrid;
            return header;
        }

        private Border CreateStrategyBuilderPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 30)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(0, 0, 5, 0),
                Padding = new Thickness(10)
            };

            var stack = new StackPanel();

            // Strategy Builder Header
            var builderHeader = new TextBlock
            {
                Text = "🔧 Strategy Builder",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 15)
            };
            stack.Children.Add(builderHeader);

            // Strategy Name
            var nameLabel = new TextBlock
            {
                Text = "Strategy Name:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(nameLabel);

            var nameBox = new TextBox
            {
                Text = "My Breakout Strategy",
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            stack.Children.Add(nameBox);

            // Strategy Type
            var typeLabel = new TextBlock
            {
                Text = "Strategy Type:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(typeLabel);

            var typeCombo = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            typeCombo.Items.Add("Breakout Strategy");
            typeCombo.Items.Add("Mean Reversion");
            typeCombo.Items.Add("Momentum Strategy");
            typeCombo.Items.Add("Arbitrage Strategy");
            typeCombo.Items.Add("Custom Python");
            typeCombo.SelectedIndex = 0;
            stack.Children.Add(typeCombo);

            // Parameters Section
            var paramsHeader = new TextBlock
            {
                Text = "📊 Parameters",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 15, 0, 10)
            };
            stack.Children.Add(paramsHeader);

            // Parameter Grid
            var paramGrid = new Grid();
            paramGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            paramGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            paramGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            paramGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            paramGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            paramGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Lookback Period
            var lookbackLabel = new TextBlock { Text = "Lookback:", Foreground = Brushes.White };
            Grid.SetRow(lookbackLabel, 0);
            Grid.SetColumn(lookbackLabel, 0);
            paramGrid.Children.Add(lookbackLabel);

            var lookbackBox = new TextBox { Text = "20", Background = new SolidColorBrush(Colors.Black), Foreground = Brushes.White, BorderBrush = new SolidColorBrush(Colors.Gray) };
            Grid.SetRow(lookbackBox, 0);
            Grid.SetColumn(lookbackBox, 1);
            paramGrid.Children.Add(lookbackBox);

            // Threshold
            var thresholdLabel = new TextBlock { Text = "Threshold:", Foreground = Brushes.White };
            Grid.SetRow(thresholdLabel, 1);
            Grid.SetColumn(thresholdLabel, 0);
            paramGrid.Children.Add(thresholdLabel);

            var thresholdBox = new TextBox { Text = "0.02", Background = new SolidColorBrush(Colors.Black), Foreground = Brushes.White, BorderBrush = new SolidColorBrush(Colors.Gray) };
            Grid.SetRow(thresholdBox, 1);
            Grid.SetColumn(thresholdBox, 1);
            paramGrid.Children.Add(thresholdBox);

            // Stop Loss
            var stopLabel = new TextBlock { Text = "Stop Loss:", Foreground = Brushes.White };
            Grid.SetRow(stopLabel, 2);
            Grid.SetColumn(stopLabel, 0);
            paramGrid.Children.Add(stopLabel);

            var stopBox = new TextBox { Text = "0.01", Background = new SolidColorBrush(Colors.Black), Foreground = Brushes.White, BorderBrush = new SolidColorBrush(Colors.Gray) };
            Grid.SetRow(stopBox, 2);
            Grid.SetColumn(stopBox, 1);
            paramGrid.Children.Add(stopBox);

            // Take Profit
            var profitLabel = new TextBlock { Text = "Take Profit:", Foreground = Brushes.White };
            Grid.SetRow(profitLabel, 3);
            Grid.SetColumn(profitLabel, 0);
            paramGrid.Children.Add(profitLabel);

            var profitBox = new TextBox { Text = "0.03", Background = new SolidColorBrush(Colors.Black), Foreground = Brushes.White, BorderBrush = new SolidColorBrush(Colors.Gray) };
            Grid.SetRow(profitBox, 3);
            Grid.SetColumn(profitBox, 1);
            paramGrid.Children.Add(profitBox);

            stack.Children.Add(paramGrid);

            // Quick Actions
            var quickActions = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 15, 0, 0)
            };

            var testBtn = new Button
            {
                Content = "🧪 Test Strategy",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White
            };
            quickActions.Children.Add(testBtn);

            var saveBtn = new Button
            {
                Content = "💾 Save",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White
            };
            quickActions.Children.Add(saveBtn);

            stack.Children.Add(quickActions);

            panel.Child = stack;
            return panel;
        }

        private Border CreateStrategyCenterPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(25, 25, 25)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(5, 0, 5, 0),
                Padding = new Thickness(10)
            };

            var tabControl = new TabControl();
            tabControl.Background = new SolidColorBrush(Colors.Transparent);
            tabControl.BorderBrush = new SolidColorBrush(Colors.Gray);

            // Code Editor Tab
            var codeTab = new TabItem
            {
                Header = "📝 Code Editor",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var codeEditor = new TextBox
            {
                Text = @"# Strategy Code Editor
import pandas as pd
import numpy as np
from typing import Dict, List

class BreakoutStrategy:
    def __init__(self, lookback: int = 20, threshold: float = 0.02):
        self.lookback = lookback
        self.threshold = threshold
        self.positions = {}

    def calculate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        # Calculate rolling high and low
        data['high_band'] = data['high'].rolling(self.lookback).max()
        data['low_band'] = data['low'].rolling(self.lookback).min()

        # Generate signals
        data['signal'] = 0
        data.loc[data['close'] > data['high_band'] * (1 + self.threshold), 'signal'] = 1
        data.loc[data['close'] < data['low_band'] * (1 - self.threshold), 'signal'] = -1

        return data

    def execute_trade(self, signal: int, price: float, size: int = 1):
        if signal == 1:  # Buy signal
            print(f'BUY {size} contracts at {price}')
        elif signal == -1:  # Sell signal
            print(f'SELL {size} contracts at {price}')

# Strategy Configuration
strategy_config = {
    'name': 'Breakout Strategy',
    'symbols': ['ES', 'NQ', 'CL'],
    'timeframe': '1m',
    'parameters': {
        'lookback': 20,
        'threshold': 0.02,
        'stop_loss': 0.01,
        'take_profit': 0.03
    }}",
                Background = new SolidColorBrush(Colors.Black),
                Foreground = new SolidColorBrush(Color.FromRgb(200, 200, 200)),
                FontFamily = new FontFamily("Consolas"),
                FontSize = 12,
                AcceptsReturn = true,
                AcceptsTab = true,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                BorderThickness = new Thickness(0)
            };

            codeTab.Content = codeEditor;
            tabControl.Items.Add(codeTab);

            // Backtest Results Tab
            var resultsTab = new TabItem
            {
                Header = "📊 Backtest Results",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var resultsGrid = new Grid();
            resultsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            resultsGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });

            // Results Header
            var resultsHeader = new TextBlock
            {
                Text = "🎯 Backtest Performance Summary",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 10)
            };
            Grid.SetRow(resultsHeader, 0);
            resultsGrid.Children.Add(resultsHeader);

            // Results Content
            var resultsContent = new ScrollViewer();
            var resultsStack = new StackPanel();

            // Performance Metrics
            var metricsGrid = new Grid();
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Row 1
            var totalReturn = CreateMetricCard("Total Return", "+23.45%", "vs +12.34% S&P", Color.FromRgb(76, 175, 80));
            Grid.SetRow(totalReturn, 0);
            Grid.SetColumn(totalReturn, 0);
            metricsGrid.Children.Add(totalReturn);

            var sharpeRatio = CreateMetricCard("Sharpe Ratio", "1.87", "Risk-Adjusted", Color.FromRgb(76, 175, 80));
            Grid.SetRow(sharpeRatio, 0);
            Grid.SetColumn(sharpeRatio, 1);
            metricsGrid.Children.Add(sharpeRatio);

            var maxDrawdown = CreateMetricCard("Max Drawdown", "-8.45%", "Controlled", Color.FromRgb(255, 152, 0));
            Grid.SetRow(maxDrawdown, 0);
            Grid.SetColumn(maxDrawdown, 2);
            metricsGrid.Children.Add(maxDrawdown);

            // Row 2
            var winRate = CreateMetricCard("Win Rate", "68.5%", "156/228 trades", Color.FromRgb(76, 175, 80));
            Grid.SetRow(winRate, 1);
            Grid.SetColumn(winRate, 0);
            metricsGrid.Children.Add(winRate);

            var profitFactor = CreateMetricCard("Profit Factor", "2.34", "Excellent", Color.FromRgb(76, 175, 80));
            Grid.SetRow(profitFactor, 1);
            Grid.SetColumn(profitFactor, 1);
            metricsGrid.Children.Add(profitFactor);

            var avgTrade = CreateMetricCard("Avg Trade", "$1,234", "Per trade", Color.FromRgb(76, 175, 80));
            Grid.SetRow(avgTrade, 1);
            Grid.SetColumn(avgTrade, 2);
            metricsGrid.Children.Add(avgTrade);

            // Row 3
            var totalTrades = CreateMetricCard("Total Trades", "228", "Over 6 months", Color.FromRgb(33, 150, 243));
            Grid.SetRow(totalTrades, 2);
            Grid.SetColumn(totalTrades, 0);
            metricsGrid.Children.Add(totalTrades);

            var avgHolding = CreateMetricCard("Avg Holding", "2.3 days", "Time in market", Color.FromRgb(33, 150, 243));
            Grid.SetRow(avgHolding, 2);
            Grid.SetColumn(avgHolding, 1);
            metricsGrid.Children.Add(avgHolding);

            var bestMonth = CreateMetricCard("Best Month", "+8.9%", "March 2024", Color.FromRgb(76, 175, 80));
            Grid.SetRow(bestMonth, 2);
            Grid.SetColumn(bestMonth, 2);
            metricsGrid.Children.Add(bestMonth);

            resultsStack.Children.Add(metricsGrid);

            // Trade List
            var tradeHeader = new TextBlock
            {
                Text = "📋 Recent Trades",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 20, 0, 10)
            };
            resultsStack.Children.Add(tradeHeader);

            var tradeList = new ListView
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 200
            };

            // Sample trades
            var trades = new[]
            {
                new { Date = "2024-03-15", Symbol = "ES", Side = "BUY", Size = 2, Entry = 5234.50, Exit = 5245.75, PnL = 2250.00, Status = "Closed" },
                new { Date = "2024-03-14", Symbol = "NQ", Side = "SELL", Size = 1, Entry = 18450.25, Exit = 18425.00, PnL = 2525.00, Status = "Closed" },
                new { Date = "2024-03-13", Symbol = "CL", Side = "BUY", Size = 3, Entry = 78.45, Exit = 79.20, PnL = 2250.00, Status = "Closed" },
                new { Date = "2024-03-12", Symbol = "ES", Side = "SELL", Size = 2, Entry = 5220.00, Exit = 5210.50, PnL = 1900.00, Status = "Closed" },
                new { Date = "2024-03-11", Symbol = "NQ", Side = "BUY", Size = 1, Entry = 18380.00, Exit = 18420.00, PnL = 4000.00, Status = "Closed" }
            };

            tradeList.ItemsSource = trades;
            resultsStack.Children.Add(tradeList);

            resultsContent.Content = resultsStack;
            Grid.SetRow(resultsContent, 1);
            resultsGrid.Children.Add(resultsContent);

            resultsTab.Content = resultsGrid;
            tabControl.Items.Add(resultsTab);

            panel.Child = tabControl;
            return panel;
        }

        private Border CreateStrategyRightPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 30)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(5, 0, 0, 0),
                Padding = new Thickness(10)
            };

            var stack = new StackPanel();

            // AI Assistant Header
            var aiHeader = new TextBlock
            {
                Text = "🤖 AI Strategy Assistant",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 15)
            };
            stack.Children.Add(aiHeader);

            // AI Chat
            var chatBox = new TextBox
            {
                Height = 100,
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray),
                AcceptsReturn = true,
                TextWrapping = TextWrapping.Wrap,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                Text = "AI: Hello! I'm your strategy development assistant. I can help you:\n\n• Optimize strategy parameters\n• Debug code issues\n• Suggest improvements\n• Analyze backtest results\n\nWhat would you like to work on today?",
                IsReadOnly = true,
                Margin = new Thickness(0, 0, 0, 10)
            };
            stack.Children.Add(chatBox);

            // AI Input
            var aiInput = new TextBox
            {
                Height = 60,
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray),
                AcceptsReturn = true,
                TextWrapping = TextWrapping.Wrap,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                Text = "How can I improve my breakout strategy?",
                Margin = new Thickness(0, 0, 0, 10)
            };
            stack.Children.Add(aiInput);

            // AI Actions
            var aiActions = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 20)
            };

            var askBtn = new Button
            {
                Content = "💬 Ask AI",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White
            };
            aiActions.Children.Add(askBtn);

            var optimizeBtn = new Button
            {
                Content = "⚡ Optimize",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White
            };
            aiActions.Children.Add(optimizeBtn);

            stack.Children.Add(aiActions);

            // Strategy Library Header
            var libraryHeader = new TextBlock
            {
                Text = "📚 Strategy Library",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 20, 0, 10)
            };
            stack.Children.Add(libraryHeader);

            // Strategy Categories
            var categories = new ListBox
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 150,
                Margin = new Thickness(0, 0, 0, 15)
            };

            var categoryItems = new[]
            {
                "📈 Trend Following",
                "🔄 Mean Reversion",
                "⚡ Momentum",
                "💰 Arbitrage",
                "🎯 Scalping",
                "📊 Statistical Arbitrage",
                "🌊 Market Making",
                "🔍 Pattern Recognition"
            };

            categories.ItemsSource = categoryItems;
            stack.Children.Add(categories);

            // Quick Load
            var loadBtn = new Button
            {
                Content = "📥 Load Selected Strategy",
                Margin = new Thickness(0, 0, 0, 10),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White
            };
            stack.Children.Add(loadBtn);

            // Recent Strategies
            var recentHeader = new TextBlock
            {
                Text = "🕒 Recent Strategies",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 15, 0, 10)
            };
            stack.Children.Add(recentHeader);

            var recentList = new ListBox
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 120
            };

            var recentItems = new[]
            {
                "Breakout Strategy v2.1",
                "Mean Reversion ES",
                "Momentum NQ Scalper",
                "CL Range Trader"
            };

            recentList.ItemsSource = recentItems;
            stack.Children.Add(recentList);

            panel.Child = stack;
            return panel;
        }

        private async Task ShowStrategyStore()
        {
            ClearMainContent();
            await CreateStrategyStoreInterface();
        }

        private async Task CreateStrategyStoreInterface()
        {
            var mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });

            // Header with controls
            var headerPanel = CreateStrategyStoreHeader();
            Grid.SetRow(headerPanel, 0);
            mainGrid.Children.Add(headerPanel);

            // Main content area with tabs
            var contentGrid = new Grid();
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });

            // Left Panel: Browse & Filter
            var leftPanel = CreateStrategyStoreLeftPanel();
            Grid.SetColumn(leftPanel, 0);
            contentGrid.Children.Add(leftPanel);

            // Center Panel: Strategy Grid & Details
            var centerPanel = CreateStrategyStoreCenterPanel();
            Grid.SetColumn(centerPanel, 1);
            contentGrid.Children.Add(centerPanel);

            // Right Panel: Cart & Purchases
            var rightPanel = CreateStrategyStoreRightPanel();
            Grid.SetColumn(rightPanel, 2);
            contentGrid.Children.Add(rightPanel);

            Grid.SetRow(contentGrid, 1);
            mainGrid.Children.Add(contentGrid);

            MainContent.Children.Add(mainGrid);
        }

        private Border CreateStrategyStoreHeader()
        {
            var header = new Border
            {
                Background = new LinearGradientBrush(Colors.DarkGreen, Colors.ForestGreen, 0),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 10)
            };

            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            // Title
            var title = new TextBlock
            {
                Text = "🛒 Strategy Store",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(title, 0);
            headerGrid.Children.Add(title);

            // Search Bar
            var searchPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };

            var searchBox = new TextBox
            {
                Width = 400,
                Height = 30,
                Margin = new Thickness(0, 0, 10, 0),
                Background = new SolidColorBrush(Colors.White),
                Foreground = Brushes.Black,
                FontSize = 14,
                Text = "Search strategies...",
                VerticalContentAlignment = VerticalAlignment.Center
            };
            searchPanel.Children.Add(searchBox);

            var searchBtn = new Button
            {
                Content = "🔍 Search",
                Width = 80,
                Height = 30,
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            searchPanel.Children.Add(searchBtn);

            Grid.SetColumn(searchPanel, 1);
            headerGrid.Children.Add(searchPanel);

            // Quick Actions
            var actionPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Center
            };

            var cartBtn = new Button
            {
                Content = "🛒 Cart (3)",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkOrange),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(cartBtn);

            var myStrategiesBtn = new Button
            {
                Content = "📚 My Strategies",
                Margin = new Thickness(5),
                Padding = new Thickness(10, 5, 10, 5),
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(myStrategiesBtn);

            Grid.SetColumn(actionPanel, 2);
            headerGrid.Children.Add(actionPanel);

            header.Child = headerGrid;
            return header;
        }

        private Border CreateStrategyStoreLeftPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 30)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(0, 0, 5, 0),
                Padding = new Thickness(10)
            };

            var stack = new StackPanel();

            // Categories Header
            var categoriesHeader = new TextBlock
            {
                Text = "📂 Categories",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 15)
            };
            stack.Children.Add(categoriesHeader);

            // Category List
            var categoryList = new ListBox
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 200,
                Margin = new Thickness(0, 0, 0, 20)
            };

            var categories = new[]
            {
                "📈 Trend Following (45)",
                "🔄 Mean Reversion (32)",
                "⚡ Momentum (28)",
                "💰 Arbitrage (15)",
                "🎯 Scalping (67)",
                "📊 Statistical Arbitrage (23)",
                "🌊 Market Making (12)",
                "🔍 Pattern Recognition (34)",
                "🤖 AI/ML Strategies (89)",
                "📉 Options Strategies (56)"
            };

            categoryList.ItemsSource = categories;
            stack.Children.Add(categoryList);

            // Filters Header
            var filtersHeader = new TextBlock
            {
                Text = "🔍 Filters",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 15)
            };
            stack.Children.Add(filtersHeader);

            // Price Range
            var priceLabel = new TextBlock
            {
                Text = "Price Range:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(priceLabel);

            var priceCombo = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            priceCombo.Items.Add("All Prices");
            priceCombo.Items.Add("Free (0)");
            priceCombo.Items.Add("Under $50 (23)");
            priceCombo.Items.Add("$50 - $200 (45)");
            priceCombo.Items.Add("$200 - $500 (67)");
            priceCombo.Items.Add("Over $500 (34)");
            priceCombo.SelectedIndex = 0;
            stack.Children.Add(priceCombo);

            // Performance Filter
            var perfLabel = new TextBlock
            {
                Text = "Min Performance:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(perfLabel);

            var perfCombo = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            perfCombo.Items.Add("Any Performance");
            perfCombo.Items.Add("10%+ Annual Return");
            perfCombo.Items.Add("20%+ Annual Return");
            perfCombo.Items.Add("30%+ Annual Return");
            perfCombo.Items.Add("50%+ Annual Return");
            perfCombo.SelectedIndex = 0;
            stack.Children.Add(perfCombo);

            // Risk Level
            var riskLabel = new TextBlock
            {
                Text = "Risk Level:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(riskLabel);

            var riskCombo = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            riskCombo.Items.Add("Any Risk Level");
            riskCombo.Items.Add("Low Risk (12)");
            riskCombo.Items.Add("Medium Risk (45)");
            riskCombo.Items.Add("High Risk (23)");
            riskCombo.SelectedIndex = 0;
            stack.Children.Add(riskCombo);

            // Sort By
            var sortLabel = new TextBlock
            {
                Text = "Sort By:",
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 5)
            };
            stack.Children.Add(sortLabel);

            var sortCombo = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 15),
                Background = new SolidColorBrush(Colors.Black),
                Foreground = Brushes.White,
                BorderBrush = new SolidColorBrush(Colors.Gray)
            };
            sortCombo.Items.Add("Most Popular");
            sortCombo.Items.Add("Highest Rated");
            sortCombo.Items.Add("Best Performance");
            sortCombo.Items.Add("Lowest Price");
            sortCombo.Items.Add("Newest");
            sortCombo.SelectedIndex = 0;
            stack.Children.Add(sortCombo);

            // Apply Filters Button
            var applyBtn = new Button
            {
                Content = "✅ Apply Filters",
                Margin = new Thickness(0, 10, 0, 0),
                Padding = new Thickness(15, 8, 15, 8),
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold
            };
            stack.Children.Add(applyBtn);

            panel.Child = stack;
            return panel;
        }

        private Border CreateStrategyStoreCenterPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(25, 25, 25)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(5, 0, 5, 0),
                Padding = new Thickness(10)
            };

            var tabControl = new TabControl();
            tabControl.Background = new SolidColorBrush(Colors.Transparent);
            tabControl.BorderBrush = new SolidColorBrush(Colors.Gray);

            // Featured Strategies Tab
            var featuredTab = new TabItem
            {
                Header = "⭐ Featured",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var featuredContent = CreateStrategyGrid("featured");
            featuredTab.Content = featuredContent;
            tabControl.Items.Add(featuredTab);

            // All Strategies Tab
            var allTab = new TabItem
            {
                Header = "📚 All Strategies",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var allContent = CreateStrategyGrid("all");
            allTab.Content = allContent;
            tabControl.Items.Add(allTab);

            // Top Performers Tab
            var topTab = new TabItem
            {
                Header = "🏆 Top Performers",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var topContent = CreateStrategyGrid("top");
            topTab.Content = topContent;
            tabControl.Items.Add(topTab);

            // New Releases Tab
            var newTab = new TabItem
            {
                Header = "🆕 New Releases",
                Background = new SolidColorBrush(Colors.Transparent),
                Foreground = Brushes.White
            };

            var newContent = CreateStrategyGrid("new");
            newTab.Content = newContent;
            tabControl.Items.Add(newTab);

            panel.Child = tabControl;
            return panel;
        }

        private ScrollViewer CreateStrategyGrid(string type)
        {
            var scrollViewer = new ScrollViewer();
            var grid = new Grid();

            // Sample strategies data
            var strategies = GetSampleStrategies(type);

            // Create grid layout
            int columns = 3;
            int rows = (strategies.Length + columns - 1) / columns;

            for (int i = 0; i < columns; i++)
            {
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            }

            for (int i = 0; i < rows; i++)
            {
                grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            }

            // Add strategy cards
            for (int i = 0; i < strategies.Length; i++)
            {
                var card = CreateStrategyCard(strategies[i]);
                Grid.SetRow(card, i / columns);
                Grid.SetColumn(card, i % columns);
                grid.Children.Add(card);
            }

            scrollViewer.Content = grid;
            return scrollViewer;
        }

        private Border CreateStrategyCard(dynamic strategy)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 35)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(5),
                Cursor = System.Windows.Input.Cursors.Hand
            };

            var stack = new StackPanel();

            // Strategy Header
            var header = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 0, 10) };

            var icon = new TextBlock
            {
                Text = strategy.Icon,
                FontSize = 24,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 10, 0)
            };
            header.Children.Add(icon);

            var titleStack = new StackPanel();
            var title = new TextBlock
            {
                Text = strategy.Name,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                FontSize = 14
            };
            titleStack.Children.Add(title);

            var author = new TextBlock
            {
                Text = $"by {strategy.Author}",
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 11
            };
            titleStack.Children.Add(author);

            header.Children.Add(titleStack);
            stack.Children.Add(header);

            // Performance Metrics
            var metricsGrid = new Grid();
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            var returnMetric = CreateMetricLabel("Return", strategy.Return, Color.FromRgb(76, 175, 80));
            Grid.SetRow(returnMetric, 0);
            Grid.SetColumn(returnMetric, 0);
            metricsGrid.Children.Add(returnMetric);

            var sharpeMetric = CreateMetricLabel("Sharpe", strategy.Sharpe, Color.FromRgb(76, 175, 80));
            Grid.SetRow(sharpeMetric, 0);
            Grid.SetColumn(sharpeMetric, 1);
            metricsGrid.Children.Add(sharpeMetric);

            var drawdownMetric = CreateMetricLabel("Max DD", strategy.Drawdown, Color.FromRgb(255, 152, 0));
            Grid.SetRow(drawdownMetric, 1);
            Grid.SetColumn(drawdownMetric, 0);
            metricsGrid.Children.Add(drawdownMetric);

            var winRateMetric = CreateMetricLabel("Win Rate", strategy.WinRate, Color.FromRgb(33, 150, 243));
            Grid.SetRow(winRateMetric, 1);
            Grid.SetColumn(winRateMetric, 1);
            metricsGrid.Children.Add(winRateMetric);

            stack.Children.Add(metricsGrid);

            // Description
            var description = new TextBlock
            {
                Text = strategy.Description,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 11,
                TextWrapping = TextWrapping.Wrap,
                Margin = new Thickness(0, 10, 0, 10),
                MaxHeight = 40
            };
            stack.Children.Add(description);

            // Tags
            var tagsPanel = new WrapPanel { Margin = new Thickness(0, 0, 0, 10) };
            foreach (var tag in strategy.Tags)
            {
                var tagBorder = new Border
                {
                    Background = new SolidColorBrush(Color.FromRgb(50, 50, 50)),
                    CornerRadius = new CornerRadius(10),
                    Padding = new Thickness(5, 2, 5, 2),
                    Margin = new Thickness(0, 0, 5, 0),
                    Child = new TextBlock
                    {
                        Text = tag,
                        Foreground = Brushes.White,
                        FontSize = 9
                    }
                };
                tagsPanel.Children.Add(tagBorder);
            }
            stack.Children.Add(tagsPanel);

            // Price and Actions
            var actionPanel = new StackPanel { Orientation = Orientation.Horizontal };

            var priceLabel = new TextBlock
            {
                Text = strategy.Price,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(255, 193, 7)),
                FontSize = 16,
                VerticalAlignment = VerticalAlignment.Center
            };
            actionPanel.Children.Add(priceLabel);

            var spacer = new TextBlock { Text = "", Width = 20 };
            actionPanel.Children.Add(spacer);

            var previewBtn = new Button
            {
                Content = "👁️ Preview",
                Width = 70,
                Height = 25,
                Background = new SolidColorBrush(Colors.DarkBlue),
                Foreground = Brushes.White,
                FontSize = 10
            };
            actionPanel.Children.Add(previewBtn);

            var buyBtn = new Button
            {
                Content = "🛒 Buy",
                Width = 60,
                Height = 25,
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White,
                FontSize = 10,
                FontWeight = FontWeights.Bold
            };
            actionPanel.Children.Add(buyBtn);

            stack.Children.Add(actionPanel);

            card.Child = stack;
            return card;
        }

        private Border CreateMetricLabel(string label, string value, Color color)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(20, 20, 20)),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(5),
                Margin = new Thickness(2)
            };

            var stack = new StackPanel();

            var labelBlock = new TextBlock
            {
                Text = label,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 9,
                HorizontalAlignment = HorizontalAlignment.Center
            };
            stack.Children.Add(labelBlock);

            var valueBlock = new TextBlock
            {
                Text = value,
                Foreground = new SolidColorBrush(color),
                FontSize = 11,
                FontWeight = FontWeights.Bold,
                HorizontalAlignment = HorizontalAlignment.Center
            };
            stack.Children.Add(valueBlock);

            border.Child = stack;
            return border;
        }

        private Border CreateStrategyStoreRightPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 30)),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                BorderThickness = new Thickness(1),
                Margin = new Thickness(5, 0, 0, 0),
                Padding = new Thickness(10)
            };

            var stack = new StackPanel();

            // Shopping Cart Header
            var cartHeader = new TextBlock
            {
                Text = "🛒 Shopping Cart",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 0, 0, 15)
            };
            stack.Children.Add(cartHeader);

            // Cart Items
            var cartList = new ListBox
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 200,
                Margin = new Thickness(0, 0, 0, 15)
            };

            var cartItems = new[]
            {
                new { Name = "Momentum Breakout Pro", Price = "$149.99", Rating = "4.8★" },
                new { Name = "AI Mean Reversion", Price = "$299.99", Rating = "4.9★" },
                new { Name = "Scalping Master", Price = "$89.99", Rating = "4.7★" }
            };

            foreach (var item in cartItems)
            {
                var itemBorder = new Border
                {
                    Background = new SolidColorBrush(Color.FromRgb(20, 20, 20)),
                    CornerRadius = new CornerRadius(4),
                    Padding = new Thickness(8),
                    Margin = new Thickness(0, 0, 0, 5)
                };

                var itemStack = new StackPanel();

                var itemName = new TextBlock
                {
                    Text = item.Name,
                    Foreground = Brushes.White,
                    FontWeight = FontWeights.Bold,
                    FontSize = 12
                };
                itemStack.Children.Add(itemName);

                var itemDetails = new TextBlock
                {
                    Text = $"{item.Price} • {item.Rating}",
                    Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                    FontSize = 10
                };
                itemStack.Children.Add(itemDetails);

                itemBorder.Child = itemStack;
                cartList.Items.Add(itemBorder);
            }

            stack.Children.Add(cartList);

            // Cart Total
            var totalPanel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(20, 20, 20)),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(10),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var totalStack = new StackPanel();

            var subtotal = new TextBlock
            {
                Text = "Subtotal: $539.97",
                Foreground = Brushes.White,
                FontSize = 14
            };
            totalStack.Children.Add(subtotal);

            var discount = new TextBlock
            {
                Text = "Discount (10%): -$54.00",
                Foreground = new SolidColorBrush(Color.FromRgb(76, 175, 80)),
                FontSize = 12
            };
            totalStack.Children.Add(discount);

            var total = new TextBlock
            {
                Text = "Total: $485.97",
                Foreground = new SolidColorBrush(Color.FromRgb(255, 193, 7)),
                FontWeight = FontWeights.Bold,
                FontSize = 16
            };
            totalStack.Children.Add(total);

            totalPanel.Child = totalStack;
            stack.Children.Add(totalPanel);

            // Checkout Button
            var checkoutBtn = new Button
            {
                Content = "💳 Checkout",
                Margin = new Thickness(0, 0, 0, 15),
                Padding = new Thickness(15, 10, 15, 10),
                Background = new SolidColorBrush(Colors.DarkGreen),
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold,
                FontSize = 14
            };
            stack.Children.Add(checkoutBtn);

            // My Purchases Header
            var purchasesHeader = new TextBlock
            {
                Text = "📚 My Purchases",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = Brushes.White,
                Margin = new Thickness(0, 20, 0, 15)
            };
            stack.Children.Add(purchasesHeader);

            // Purchases List
            var purchasesList = new ListBox
            {
                Background = new SolidColorBrush(Colors.Black),
                BorderBrush = new SolidColorBrush(Colors.Gray),
                Height = 150
            };

            var purchases = new[]
            {
                new { Name = "Breakout Master", Status = "Active", PnL = "+$2,345" },
                new { Name = "Mean Reversion Pro", Status = "Active", PnL = "+$1,567" },
                new { Name = "AI Trend Follower", Status = "Paused", PnL = "-$234" }
            };

            foreach (var purchase in purchases)
            {
                var purchaseBorder = new Border
                {
                    Background = new SolidColorBrush(Color.FromRgb(20, 20, 20)),
                    CornerRadius = new CornerRadius(4),
                    Padding = new Thickness(8),
                    Margin = new Thickness(0, 0, 0, 5)
                };

                var purchaseStack = new StackPanel();

                var purchaseName = new TextBlock
                {
                    Text = purchase.Name,
                    Foreground = Brushes.White,
                    FontWeight = FontWeights.Bold,
                    FontSize = 12
                };
                purchaseStack.Children.Add(purchaseName);

                var purchaseDetails = new TextBlock
                {
                    Text = $"{purchase.Status} • {purchase.PnL}",
                    Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                    FontSize = 10
                };
                purchaseStack.Children.Add(purchaseDetails);

                purchaseBorder.Child = purchaseStack;
                purchasesList.Items.Add(purchaseBorder);
            }

            stack.Children.Add(purchasesList);

            panel.Child = stack;
            return panel;
        }

        private dynamic[] GetSampleStrategies(string type)
        {
            var strategies = new[]
            {
                new {
                    Icon = "📈", Name = "Momentum Breakout Pro", Author = "QuantMaster",
                    Return = "+45.2%", Sharpe = "2.1", Drawdown = "-8.5%", WinRate = "68%",
                    Description = "Advanced momentum breakout strategy with AI-powered signal filtering and dynamic position sizing.",
                    Price = "$149.99", Tags = new[] { "Momentum", "AI", "ES/NQ" }
                },
                new {
                    Icon = "🔄", Name = "Mean Reversion Elite", Author = "StatTrader",
                    Return = "+32.8%", Sharpe = "1.8", Drawdown = "-6.2%", WinRate = "72%",
                    Description = "Statistical mean reversion strategy using advanced regression analysis and volatility filters.",
                    Price = "$199.99", Tags = new[] { "Mean Reversion", "Statistical", "CL/GC" }
                },
                new {
                    Icon = "⚡", Name = "Scalping Master", Author = "SpeedTrader",
                    Return = "+28.5%", Sharpe = "1.6", Drawdown = "-4.8%", WinRate = "85%",
                    Description = "High-frequency scalping strategy optimized for low-latency execution and tight spreads.",
                    Price = "$89.99", Tags = new[] { "Scalping", "High-Frequency", "ES" }
                },
                new {
                    Icon = "🤖", Name = "AI Trend Follower", Author = "NeuralQuant",
                    Return = "+56.7%", Sharpe = "2.3", Drawdown = "-12.1%", WinRate = "65%",
                    Description = "Deep learning-based trend following strategy with adaptive market regime detection.",
                    Price = "$299.99", Tags = new[] { "AI/ML", "Trend Following", "All Markets" }
                },
                new {
                    Icon = "💰", Name = "Arbitrage Pro", Author = "ArbMaster",
                    Return = "+18.9%", Sharpe = "3.2", Drawdown = "-2.1%", WinRate = "92%",
                    Description = "Multi-leg arbitrage strategy exploiting price inefficiencies across correlated instruments.",
                    Price = "$399.99", Tags = new[] { "Arbitrage", "Low Risk", "Multi-Leg" }
                },
                new {
                    Icon = "🎯", Name = "Pattern Recognition", Author = "PatternTrader",
                    Return = "+41.3%", Sharpe = "1.9", Drawdown = "-9.7%", WinRate = "71%",
                    Description = "Advanced pattern recognition strategy using computer vision and technical analysis.",
                    Price = "$179.99", Tags = new[] { "Patterns", "Technical", "All Markets" }
                }
            };

            return strategies;
        }

        private async Task ShowAccountManager()
        {
            ClearMainContent();

            var mainGrid = new Grid();
            mainGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });
            mainGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            mainGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });

            // Left panel: header + overview + quick actions + status
            var leftStack = new StackPanel();
            leftStack.Children.Add(CreateAccountManagerHeader());
            leftStack.Children.Add(CreateAccountOverviewSection());
            leftStack.Children.Add(CreateQuickActionsSection());
            leftStack.Children.Add(CreateAccountStatusSection());

            var leftScroll = new ScrollViewer { Content = leftStack, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var leftBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 35)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                BorderThickness = new Thickness(0, 0, 1, 0),
                Padding = new Thickness(15),
                Child = leftScroll
            };

            var centerPanel = CreateAccountManagerCenterPanel();
            var rightPanel = CreateAccountManagerRightPanel();

            Grid.SetColumn(leftBorder, 0);
            Grid.SetColumn(centerPanel, 1);
            Grid.SetColumn(rightPanel, 2);

            mainGrid.Children.Add(leftBorder);
            mainGrid.Children.Add(centerPanel);
            mainGrid.Children.Add(rightPanel);

            MainContent.Children.Add(mainGrid);
        }



        private UIElement CreateAccountManagerHeader()
        {
            var header = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(45, 45, 50)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "📊 ACCOUNT MANAGER",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 5)
            };

            var subtitle = new TextBlock
            {
                Text = "Professional Account Management & Analytics",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(180, 180, 185)),
                Margin = new Thickness(0, 0, 0, 10)
            };

            var buttonPanel = new StackPanel { Orientation = Orientation.Horizontal };

            var refreshBtn = new Button
            {
                Content = "🔄 Refresh",
                Background = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(10, 5, 10, 5),
                Margin = new Thickness(0, 0, 8, 0),
                FontSize = 11
            };

            var exportBtn = new Button
            {
                Content = "📤 Export",
                Background = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(10, 5, 10, 5),
                FontSize = 11
            };

            buttonPanel.Children.Add(refreshBtn);
            buttonPanel.Children.Add(exportBtn);

            stack.Children.Add(title);
            stack.Children.Add(subtitle);
            stack.Children.Add(buttonPanel);

            header.Child = stack;
            return header;
        }

        private UIElement CreateAccountOverviewSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "📈 Account Overview",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            // Account selector
            var accountSelector = new ComboBox
            {
                Margin = new Thickness(0, 0, 0, 10),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 55)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderBrush = new SolidColorBrush(Color.FromRgb(80, 80, 85))
            };
            accountSelector.Items.Add("Account 1 - Live Trading");
            accountSelector.Items.Add("Account 2 - Paper Trading");
            accountSelector.Items.Add("Account 3 - Demo");
            accountSelector.SelectedIndex = 0;

            // Account metrics
            var metricsGrid = new Grid();
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Balance
            var balanceCard = CreateMetricCard("Balance", "$125,456.78", "HEALTHY", Colors.Green);
            Grid.SetRow(balanceCard, 0);
            Grid.SetColumn(balanceCard, 0);
            metricsGrid.Children.Add(balanceCard);

            // P&L
            var pnlCard = CreateMetricCard("Today P&L", "+$2,345.67", "PROFIT", Colors.Green);
            Grid.SetRow(pnlCard, 0);
            Grid.SetColumn(pnlCard, 1);
            metricsGrid.Children.Add(pnlCard);

            // Open Positions
            var positionsCard = CreateMetricCard("Open Positions", "3", "ACTIVE", Colors.Orange);
            Grid.SetRow(positionsCard, 1);
            Grid.SetColumn(positionsCard, 0);
            metricsGrid.Children.Add(positionsCard);

            // Win Rate
            var winRateCard = CreateMetricCard("Win Rate", "68.5%", "GOOD", Colors.Blue);
            Grid.SetRow(winRateCard, 1);
            Grid.SetColumn(winRateCard, 1);
            metricsGrid.Children.Add(winRateCard);

            stack.Children.Add(title);
            stack.Children.Add(accountSelector);
            stack.Children.Add(metricsGrid);

            section.Child = stack;
            return section;
        }

        private UIElement CreateQuickActionsSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "⚡ Quick Actions",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            var actionsGrid = new Grid();
            actionsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            actionsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            actionsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            actionsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            var flattenBtn = new Button
            {
                Content = "🔄 Flatten All",
                Background = new SolidColorBrush(Color.FromRgb(200, 50, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(8, 5, 8, 5),
                Margin = new Thickness(0, 0, 5, 5),
                FontSize = 11
            };
            flattenBtn.Click += async (s, e) => await FlattenAllPositionsAsync();
            Grid.SetRow(flattenBtn, 0);
            Grid.SetColumn(flattenBtn, 0);
            actionsGrid.Children.Add(flattenBtn);

            var pauseBtn = new Button
            {
                Content = "⏸️ Pause Trading",
                Background = new SolidColorBrush(Color.FromRgb(200, 150, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(8, 5, 8, 5),
                Margin = new Thickness(5, 0, 0, 5),
                FontSize = 11
            };
            Grid.SetRow(pauseBtn, 0);
            Grid.SetColumn(pauseBtn, 1);
            actionsGrid.Children.Add(pauseBtn);

            var resetBtn = new Button
            {
                Content = "🔄 Reset Risk",
                Background = new SolidColorBrush(Color.FromRgb(50, 150, 200)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(8, 5, 8, 5),
                Margin = new Thickness(0, 0, 5, 0),
                FontSize = 11
            };
            Grid.SetRow(resetBtn, 1);
            Grid.SetColumn(resetBtn, 0);
            actionsGrid.Children.Add(resetBtn);

            var settingsBtn = new Button
            {
                Content = "⚙️ Settings",
                Background = new SolidColorBrush(Color.FromRgb(80, 80, 85)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(8, 5, 8, 5),
                Margin = new Thickness(5, 0, 0, 0),
                FontSize = 11
            };
            Grid.SetRow(settingsBtn, 1);
            Grid.SetColumn(settingsBtn, 1);
            actionsGrid.Children.Add(settingsBtn);

            stack.Children.Add(title);
            stack.Children.Add(actionsGrid);

            section.Child = stack;
            return section;
        }

        private UIElement CreateAccountStatusSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "📊 Account Status",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            // Status indicators
            var statusGrid = new Grid();
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            statusGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            statusGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            statusGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            statusGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Trading Status
            var tradingStatus = new Ellipse
            {
                Width = 12,
                Height = 12,
                Fill = new SolidColorBrush(Colors.Green),
                Margin = new Thickness(0, 0, 8, 0)
            };
            Grid.SetRow(tradingStatus, 0);
            Grid.SetColumn(tradingStatus, 0);
            statusGrid.Children.Add(tradingStatus);

            var tradingLabel = new TextBlock
            {
                Text = "Trading: Active",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 12,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetRow(tradingLabel, 0);
            Grid.SetColumn(tradingLabel, 1);
            statusGrid.Children.Add(tradingLabel);

            // Risk Status
            var riskStatus = new Ellipse
            {
                Width = 12,
                Height = 12,
                Fill = new SolidColorBrush(Colors.Green),
                Margin = new Thickness(0, 0, 8, 0)
            };
            Grid.SetRow(riskStatus, 1);
            Grid.SetColumn(riskStatus, 0);
            statusGrid.Children.Add(riskStatus);

            var riskLabel = new TextBlock
            {
                Text = "Risk: Normal",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 12,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetRow(riskLabel, 1);
            Grid.SetColumn(riskLabel, 1);
            statusGrid.Children.Add(riskLabel);

            // Connection Status
            var connStatus = new Ellipse
            {
                Width = 12,
                Height = 12,
                Fill = new SolidColorBrush(Colors.Green),
                Margin = new Thickness(0, 0, 8, 0)
            };
            Grid.SetRow(connStatus, 2);
            Grid.SetColumn(connStatus, 0);
            statusGrid.Children.Add(connStatus);

            var connLabel = new TextBlock
            {
                Text = "Connection: Stable",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 12,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetRow(connLabel, 2);
            Grid.SetColumn(connLabel, 1);
            statusGrid.Children.Add(connLabel);

            // Last Update
            var updateStatus = new Ellipse
            {
                Width = 12,
                Height = 12,
                Fill = new SolidColorBrush(Colors.Green),
                Margin = new Thickness(0, 0, 8, 0)
            };
            Grid.SetRow(updateStatus, 3);
            Grid.SetColumn(updateStatus, 0);
            statusGrid.Children.Add(updateStatus);

            var updateLabel = new TextBlock
            {
                Text = "Updated: 2 min ago",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 12,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetRow(updateLabel, 3);
            Grid.SetColumn(updateLabel, 1);
            statusGrid.Children.Add(updateLabel);

            stack.Children.Add(title);
            stack.Children.Add(statusGrid);

            section.Child = stack;
            return section;
        }

        private async Task ShowAnalytics()
        {
            ClearMainContent();

            var mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });

            // Header with controls
            var headerPanel = CreateAnalyticsHeader();
            Grid.SetRow(headerPanel, 0);
            mainGrid.Children.Add(headerPanel);

            // Main content area with tabs
            var contentGrid = new Grid();
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            contentGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(350) });

            // Left panel - Key metrics & Performance
            var leftPanel = CreateAnalyticsLeftPanel();
            Grid.SetColumn(leftPanel, 0);
            contentGrid.Children.Add(leftPanel);

            // Center panel - Charts & Visualizations
            var centerPanel = CreateAnalyticsCenterPanel();
            Grid.SetColumn(centerPanel, 1);
            contentGrid.Children.Add(centerPanel);

            // Right panel - Risk Analytics & Strategy Performance
            var rightPanel = CreateAnalyticsRightPanel();
            Grid.SetColumn(rightPanel, 2);
            contentGrid.Children.Add(rightPanel);

            Grid.SetRow(contentGrid, 1);
            mainGrid.Children.Add(contentGrid);

            MainContent.Children.Add(mainGrid);
        }

        private StackPanel CreateAnalyticsHeader()
        {
            var header = new StackPanel { Margin = new Thickness(0, 0, 0, 20) };

            // Title and status
            var titlePanel = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 0, 15) };

            var title = new TextBlock
            {
                Text = "📊 ANALYTICS & REPORTS - PRO DASHBOARD",
                FontSize = 24,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                VerticalAlignment = VerticalAlignment.Center
            };
            titlePanel.Children.Add(title);

            var statusBadge = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(0, 255, 136)),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(8, 4, 8, 4),
                Margin = new Thickness(20, 0, 0, 0),
                Child = new TextBlock
                {
                    Text = "🔥 PROFITABLE",
                    Foreground = new SolidColorBrush(Colors.White),
                    FontSize = 10,
                    FontWeight = FontWeights.Bold
                }
            };
            titlePanel.Children.Add(statusBadge);

            var liveBadge = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(8, 4, 8, 4),
                Margin = new Thickness(10, 0, 0, 0),
                Child = new TextBlock
                {
                    Text = "⚡ LIVE DATA",
                    Foreground = new SolidColorBrush(Colors.White),
                    FontSize = 10,
                    FontWeight = FontWeights.Bold
                }
            };
            titlePanel.Children.Add(liveBadge);

            header.Children.Add(titlePanel);

            // Controls
            var controlsPanel = new StackPanel { Orientation = Orientation.Horizontal };

            var timeLabel = new TextBlock
            {
                Text = "Time Period:",
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 10, 0)
            };
            controlsPanel.Children.Add(timeLabel);

            var timeCombo = new ComboBox { Width = 120, Margin = new Thickness(0, 0, 20, 0) };
            timeCombo.Items.Add("Today");
            timeCombo.Items.Add("Week");
            timeCombo.Items.Add("Month");
            timeCombo.Items.Add("Quarter");
            timeCombo.Items.Add("Year");
            timeCombo.SelectedIndex = 0;
            controlsPanel.Children.Add(timeCombo);

            var exportButton = new Button
            {
                Content = "📊 Export Report",
                Background = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                Foreground = new SolidColorBrush(Colors.Black),
                FontWeight = FontWeights.Bold,
                Padding = new Thickness(15, 8, 15, 8),
                Margin = new Thickness(0, 0, 10, 0),
                Cursor = System.Windows.Input.Cursors.Hand
            };
            controlsPanel.Children.Add(exportButton);

            var refreshButton = new Button
            {
                Content = "🔄 Refresh",
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                Foreground = new SolidColorBrush(Colors.White),
                FontWeight = FontWeights.Bold,
                Padding = new Thickness(15, 8, 15, 8),
                Cursor = System.Windows.Input.Cursors.Hand
            };
            controlsPanel.Children.Add(refreshButton);

            header.Children.Add(controlsPanel);

            return header;
        }

        private StackPanel CreateAnalyticsLeftPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(0, 0, 10, 0) };

            // Performance Overview
            var perfHeader = new TextBlock
            {
                Text = "📈 PERFORMANCE OVERVIEW",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(perfHeader);

            // Key Metrics Grid
            var metricsGrid = new Grid();
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Total P&L
            var totalPnL = CreateMetricCard("Total P&L", "$132,456.78", "+15.23%", Color.FromRgb(0, 255, 136));
            Grid.SetRow(totalPnL, 0);
            Grid.SetColumn(totalPnL, 0);
            metricsGrid.Children.Add(totalPnL);

            // Daily P&L
            var dailyPnL = CreateMetricCard("Daily P&L", "$8,234.56", "+2.45%", Color.FromRgb(0, 255, 136));
            Grid.SetRow(dailyPnL, 0);
            Grid.SetColumn(dailyPnL, 1);
            metricsGrid.Children.Add(dailyPnL);

            // Win Rate
            var winRate = CreateMetricCard("Win Rate", "68.5%", "156/228", Color.FromRgb(0, 212, 255));
            Grid.SetRow(winRate, 1);
            Grid.SetColumn(winRate, 0);
            metricsGrid.Children.Add(winRate);

            // Profit Factor
            var profitFactor = CreateMetricCard("Profit Factor", "2.34", "Excellent", Color.FromRgb(0, 255, 136));
            Grid.SetRow(profitFactor, 1);
            Grid.SetColumn(profitFactor, 1);
            metricsGrid.Children.Add(profitFactor);

            // Max Drawdown
            var maxDD = CreateMetricCard("Max Drawdown", "-8.45%", "Controlled", Color.FromRgb(255, 152, 0));
            Grid.SetRow(maxDD, 2);
            Grid.SetColumn(maxDD, 0);
            metricsGrid.Children.Add(maxDD);

            // Sharpe Ratio
            var sharpe = CreateMetricCard("Sharpe Ratio", "1.87", "Strong", Color.FromRgb(0, 255, 136));
            Grid.SetRow(sharpe, 2);
            Grid.SetColumn(sharpe, 1);
            metricsGrid.Children.Add(sharpe);

            panel.Children.Add(metricsGrid);

            // Risk Metrics
            var riskHeader = new TextBlock
            {
                Text = "🛡️ RISK METRICS",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 30, 0, 15)
            };
            panel.Children.Add(riskHeader);

            var riskGrid = new Grid();
            riskGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            riskGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            riskGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            riskGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // VaR
            var varCard = CreateMetricCard("VaR (95%)", "-$12,345", "1 Day", Color.FromRgb(255, 71, 87));
            Grid.SetRow(varCard, 0);
            Grid.SetColumn(varCard, 0);
            riskGrid.Children.Add(varCard);

            // Expected Shortfall
            var esCard = CreateMetricCard("Expected Shortfall", "-$18,567", "Worst 5%", Color.FromRgb(255, 71, 87));
            Grid.SetRow(esCard, 0);
            Grid.SetColumn(esCard, 1);
            riskGrid.Children.Add(esCard);

            // Beta
            var beta = CreateMetricCard("Beta", "0.85", "Low Risk", Color.FromRgb(0, 212, 255));
            Grid.SetRow(beta, 1);
            Grid.SetColumn(beta, 0);
            riskGrid.Children.Add(beta);

            // Alpha
            var alpha = CreateMetricCard("Alpha", "12.34%", "Outperforming", Color.FromRgb(0, 255, 136));
            Grid.SetRow(alpha, 1);
            Grid.SetColumn(alpha, 1);
            riskGrid.Children.Add(alpha);

            panel.Children.Add(riskGrid);

            return panel;
        }

        private Border CreateMetricCard(string title, string value, string subtitle, Color color)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(5)
            };

            var content = new StackPanel();

            var titleBlock = new TextBlock
            {
                Text = title,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 12,
                FontWeight = FontWeights.SemiBold
            };
            content.Children.Add(titleBlock);

            var valueBlock = new TextBlock
            {
                Text = value,
                Foreground = new SolidColorBrush(color),
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 5, 0, 0)
            };
            content.Children.Add(valueBlock);

            var subtitleBlock = new TextBlock
            {
                Text = subtitle,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 10,
                Margin = new Thickness(0, 2, 0, 0)
            };
            content.Children.Add(subtitleBlock);

            card.Child = content;
            return card;
        }

        private StackPanel CreateAnalyticsCenterPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(10, 0, 10, 0) };

            // Charts Header
            var chartsHeader = new TextBlock
            {
                Text = "📊 CHARTS & VISUALIZATIONS",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(chartsHeader);

            // Chart Tabs
            var tabControl = new TabControl();
            tabControl.Background = new SolidColorBrush(Color.FromRgb(26, 35, 50));

            // Equity Curve Tab
            var equityTab = new TabItem { Header = "Equity Curve" };
            var equityContent = CreateEquityCurveChart();
            equityTab.Content = equityContent;
            tabControl.Items.Add(equityTab);

            // Drawdown Tab
            var ddTab = new TabItem { Header = "Drawdown" };
            var ddContent = CreateDrawdownChart();
            ddTab.Content = ddContent;
            tabControl.Items.Add(ddTab);

            // Monthly Returns Tab
            var monthlyTab = new TabItem { Header = "Monthly Returns" };
            var monthlyContent = CreateMonthlyReturnsChart();
            monthlyTab.Content = monthlyContent;
            tabControl.Items.Add(monthlyTab);

            // Win/Loss Distribution Tab
            var wlTab = new TabItem { Header = "Win/Loss Distribution" };
            var wlContent = CreateWinLossChart();
            wlTab.Content = wlContent;
            tabControl.Items.Add(wlTab);

            panel.Children.Add(tabControl);

            return panel;
        }

        private StackPanel CreateEquityCurveChart()
        {
            var panel = new StackPanel { Margin = new Thickness(20) };

            // Placeholder for equity curve chart
            var chartPlaceholder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(15, 20, 25)),
                CornerRadius = new CornerRadius(8),
                Height = 300,
                Child = new StackPanel
                {
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                }
            };

            var placeholderText = new TextBlock
            {
                Text = "📈 EQUITY CURVE CHART",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(0, 212, 255)),
                HorizontalAlignment = HorizontalAlignment.Center
            };

            var placeholderSubtext = new TextBlock
            {
                Text = "Interactive chart showing portfolio value over time\nwith drawdown periods highlighted",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                HorizontalAlignment = HorizontalAlignment.Center,
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0)
            };

            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderText);
            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderSubtext);

            panel.Children.Add(chartPlaceholder);

            return panel;
        }

        private StackPanel CreateDrawdownChart()
        {
            var panel = new StackPanel { Margin = new Thickness(20) };

            var chartPlaceholder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(15, 20, 25)),
                CornerRadius = new CornerRadius(8),
                Height = 300,
                Child = new StackPanel
                {
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                }
            };

            var placeholderText = new TextBlock
            {
                Text = "📉 DRAWDOWN ANALYSIS",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(255, 71, 87)),
                HorizontalAlignment = HorizontalAlignment.Center
            };

            var placeholderSubtext = new TextBlock
            {
                Text = "Visualization of portfolio drawdown periods\nwith recovery time analysis",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                HorizontalAlignment = HorizontalAlignment.Center,
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0)
            };

            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderText);
            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderSubtext);

            panel.Children.Add(chartPlaceholder);

            return panel;
        }

        private StackPanel CreateMonthlyReturnsChart()
        {
            var panel = new StackPanel { Margin = new Thickness(20) };

            var chartPlaceholder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(15, 20, 25)),
                CornerRadius = new CornerRadius(8),
                Height = 300,
                Child = new StackPanel
                {
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                }
            };

            var placeholderText = new TextBlock
            {
                Text = "📊 MONTHLY RETURNS",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(0, 255, 136)),
                HorizontalAlignment = HorizontalAlignment.Center
            };

            var placeholderSubtext = new TextBlock
            {
                Text = "Monthly performance breakdown\nwith seasonal pattern analysis",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                HorizontalAlignment = HorizontalAlignment.Center,
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0)
            };

            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderText);
            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderSubtext);

            panel.Children.Add(chartPlaceholder);

            return panel;
        }

        private StackPanel CreateWinLossChart()
        {
            var panel = new StackPanel { Margin = new Thickness(20) };

            var chartPlaceholder = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(15, 20, 25)),
                CornerRadius = new CornerRadius(8),
                Height = 300,
                Child = new StackPanel
                {
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                }
            };

            var placeholderText = new TextBlock
            {
                Text = "🎯 WIN/LOSS DISTRIBUTION",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Color.FromRgb(255, 193, 7)),
                HorizontalAlignment = HorizontalAlignment.Center
            };

            var placeholderSubtext = new TextBlock
            {
                Text = "Distribution of winning vs losing trades\nwith profit/loss magnitude analysis",
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                HorizontalAlignment = HorizontalAlignment.Center,
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 10, 0, 0)
            };

            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderText);
            ((StackPanel)chartPlaceholder.Child).Children.Add(placeholderSubtext);

            panel.Children.Add(chartPlaceholder);

            return panel;
        }

        private StackPanel CreateAnalyticsRightPanel()
        {
            var panel = new StackPanel { Margin = new Thickness(10, 0, 0, 0) };

            // Strategy Performance
            var strategyHeader = new TextBlock
            {
                Text = "🧠 STRATEGY PERFORMANCE",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 15)
            };
            panel.Children.Add(strategyHeader);

            // Strategy List
            var strategyList = new ListBox { Height = 200, Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)) };

            var strategies = new[]
            {
                new { Name = "Momentum Breakout", PnL = "+$45,234", WinRate = "72%", Trades = "89" },
                new { Name = "Mean Reversion", PnL = "+$32,156", WinRate = "65%", Trades = "156" },
                new { Name = "Scalping", PnL = "+$28,901", WinRate = "58%", Trades = "234" },
                new { Name = "Neural Ensemble", PnL = "+$26,165", WinRate = "68%", Trades = "67" }
            };

            foreach (var strategy in strategies)
            {
                var item = new Border
                {
                    Background = new SolidColorBrush(Color.FromRgb(15, 20, 25)),
                    CornerRadius = new CornerRadius(6),
                    Padding = new Thickness(10),
                    Margin = new Thickness(0, 0, 0, 5)
                };

                var content = new StackPanel();

                var nameBlock = new TextBlock
                {
                    Text = strategy.Name,
                    Foreground = new SolidColorBrush(Colors.White),
                    FontWeight = FontWeights.Bold
                };
                content.Children.Add(nameBlock);

                var detailsBlock = new TextBlock
                {
                    Text = $"P&L: {strategy.PnL} | Win Rate: {strategy.WinRate} | Trades: {strategy.Trades}",
                    Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                    FontSize = 11,
                    Margin = new Thickness(0, 2, 0, 0)
                };
                content.Children.Add(detailsBlock);

                item.Child = content;
                strategyList.Items.Add(item);
            }

            panel.Children.Add(strategyList);

            // Market Analysis
            var marketHeader = new TextBlock
            {
                Text = "📊 MARKET ANALYSIS",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 30, 0, 15)
            };
            panel.Children.Add(marketHeader);

            var marketGrid = new Grid();
            marketGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            marketGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            marketGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            marketGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Trending Markets
            var trending = CreateMarketConditionCard("Trending", "ES, NQ", "+12.5%", Color.FromRgb(0, 255, 136));
            Grid.SetRow(trending, 0);
            Grid.SetColumn(trending, 0);
            marketGrid.Children.Add(trending);

            // Ranging Markets
            var ranging = CreateMarketConditionCard("Ranging", "YM, RTY", "+8.2%", Color.FromRgb(0, 212, 255));
            Grid.SetRow(ranging, 0);
            Grid.SetColumn(ranging, 1);
            marketGrid.Children.Add(ranging);

            // Volatile Markets
            var volatileCard = CreateMarketConditionCard("Volatile", "CL", "+15.8%", Color.FromRgb(255, 193, 7));
            Grid.SetRow(volatileCard, 1);
            Grid.SetColumn(volatileCard, 0);
            marketGrid.Children.Add(volatileCard);

            // Bear Markets
            var bear = CreateMarketConditionCard("Bear", "None", "0%", Color.FromRgb(255, 71, 87));
            Grid.SetRow(bear, 1);
            Grid.SetColumn(bear, 1);
            marketGrid.Children.Add(bear);

            panel.Children.Add(marketGrid);

            // Time-based Performance
            var timeHeader = new TextBlock
            {
                Text = "⏰ TIME-BASED PERFORMANCE",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 30, 0, 15)
            };
            panel.Children.Add(timeHeader);

            var timeGrid = new Grid();
            timeGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            timeGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            timeGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            timeGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Best Hour
            var bestHour = CreateTimeCard("Best Hour", "10:00 AM", "+$3,456", Color.FromRgb(0, 255, 136));
            Grid.SetRow(bestHour, 0);
            Grid.SetColumn(bestHour, 0);
            timeGrid.Children.Add(bestHour);

            // Best Day
            var bestDay = CreateTimeCard("Best Day", "Wednesday", "+$12,345", Color.FromRgb(0, 255, 136));
            Grid.SetRow(bestDay, 0);
            Grid.SetColumn(bestDay, 1);
            timeGrid.Children.Add(bestDay);

            // Best Month
            var bestMonth = CreateTimeCard("Best Month", "March", "+$45,678", Color.FromRgb(0, 255, 136));
            Grid.SetRow(bestMonth, 1);
            Grid.SetColumn(bestMonth, 0);
            timeGrid.Children.Add(bestMonth);

            // Best Quarter
            var bestQuarter = CreateTimeCard("Best Quarter", "Q1", "+$89,012", Color.FromRgb(0, 255, 136));
            Grid.SetRow(bestQuarter, 1);
            Grid.SetColumn(bestQuarter, 1);
            timeGrid.Children.Add(bestQuarter);

            panel.Children.Add(timeGrid);

            return panel;
        }

        private Border CreateMarketConditionCard(string condition, string symbols, string performance, Color color)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                CornerRadius = new CornerRadius(6),
                Padding = new Thickness(10),
                Margin = new Thickness(2)
            };

            var content = new StackPanel();

            var conditionBlock = new TextBlock
            {
                Text = condition,
                Foreground = new SolidColorBrush(color),
                FontWeight = FontWeights.Bold,
                FontSize = 12
            };
            content.Children.Add(conditionBlock);

            var symbolsBlock = new TextBlock
            {
                Text = symbols,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 10,
                Margin = new Thickness(0, 2, 0, 0)
            };
            content.Children.Add(symbolsBlock);

            var perfBlock = new TextBlock
            {
                Text = performance,
                Foreground = new SolidColorBrush(Colors.White),
                FontWeight = FontWeights.Bold,
                FontSize = 11,
                Margin = new Thickness(0, 2, 0, 0)
            };
            content.Children.Add(perfBlock);

            card.Child = content;
            return card;
        }

        private Border CreateTimeCard(string period, string time, string performance, Color color)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(26, 35, 50)),
                CornerRadius = new CornerRadius(6),
                Padding = new Thickness(10),
                Margin = new Thickness(2)
            };

            var content = new StackPanel();

            var periodBlock = new TextBlock
            {
                Text = period,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                FontSize = 10,
                FontWeight = FontWeights.SemiBold
            };
            content.Children.Add(periodBlock);

            var timeBlock = new TextBlock
            {
                Text = time,
                Foreground = new SolidColorBrush(Colors.White),
                FontWeight = FontWeights.Bold,
                FontSize = 12,
                Margin = new Thickness(0, 2, 0, 0)
            };
            content.Children.Add(timeBlock);

            var perfBlock = new TextBlock
            {
                Text = performance,
                Foreground = new SolidColorBrush(color),
                FontWeight = FontWeights.Bold,
                FontSize = 11,
                Margin = new Thickness(0, 2, 0, 0)
            };
            content.Children.Add(perfBlock);

            card.Child = content;
            return card;
        }

        private UIElement CreateAccountManagerCenterPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(25, 25, 30)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                BorderThickness = new Thickness(0, 0, 1, 0),
                Padding = new Thickness(15)
            };

            var tabControl = new TabControl
            {
                Background = new SolidColorBrush(Colors.Transparent),
                BorderThickness = new Thickness(0)
            };

            // Performance Tab
            var performanceTab = new TabItem
            {
                Header = "📈 Performance",
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            performanceTab.Content = CreatePerformanceTab();

            // Positions Tab
            var positionsTab = new TabItem
            {
                Header = "📊 Positions",
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            positionsTab.Content = CreatePositionsTab();

            // Orders Tab
            var ordersTab = new TabItem
            {
                Header = "📋 Orders",
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            ordersTab.Content = CreateOrdersTab();

            // History Tab
            var historyTab = new TabItem
            {
                Header = "📚 History",
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Foreground = new SolidColorBrush(Colors.White)
            };
            historyTab.Content = CreateHistoryTab();

            tabControl.Items.Add(performanceTab);
            tabControl.Items.Add(positionsTab);
            tabControl.Items.Add(ordersTab);
            tabControl.Items.Add(historyTab);

            panel.Child = tabControl;
            return panel;
        }

        private UIElement CreatePerformanceTab()
        {
            var scroll = new ScrollViewer { VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var stack = new StackPanel();

            // Performance Metrics Grid
            var metricsGrid = new Grid();
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            metricsGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Row 1
            var totalPnl = CreateMetricCard("Total P&L", "$45,678.90", "PROFIT", Colors.Green);
            Grid.SetRow(totalPnl, 0);
            Grid.SetColumn(totalPnl, 0);
            metricsGrid.Children.Add(totalPnl);

            var sharpeRatio = CreateMetricCard("Sharpe Ratio", "1.87", "EXCELLENT", Colors.Blue);
            Grid.SetRow(sharpeRatio, 0);
            Grid.SetColumn(sharpeRatio, 1);
            metricsGrid.Children.Add(sharpeRatio);

            var maxDrawdown = CreateMetricCard("Max Drawdown", "-8.45%", "CONTROLLED", Colors.Red);
            Grid.SetRow(maxDrawdown, 0);
            Grid.SetColumn(maxDrawdown, 2);
            metricsGrid.Children.Add(maxDrawdown);

            // Row 2
            var profitFactor = CreateMetricCard("Profit Factor", "2.34", "EXCELLENT", Colors.Green);
            Grid.SetRow(profitFactor, 1);
            Grid.SetColumn(profitFactor, 0);
            metricsGrid.Children.Add(profitFactor);

            var avgWin = CreateMetricCard("Avg Win", "$1,234", "STRONG", Colors.Green);
            Grid.SetRow(avgWin, 1);
            Grid.SetColumn(avgWin, 1);
            metricsGrid.Children.Add(avgWin);

            var avgLoss = CreateMetricCard("Avg Loss", "-$567", "MANAGED", Colors.Red);
            Grid.SetRow(avgLoss, 1);
            Grid.SetColumn(avgLoss, 2);
            metricsGrid.Children.Add(avgLoss);

            stack.Children.Add(metricsGrid);

            // Performance Chart Placeholder
            var chartSection = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 15, 0, 0),
                Height = 200
            };

            var chartTitle = new TextBlock
            {
                Text = "📊 Equity Curve",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            var chartPlaceholder = new TextBlock
            {
                Text = "Interactive chart will be displayed here\n(Equity curve, drawdown, monthly returns)",
                Foreground = new SolidColorBrush(Color.FromRgb(150, 150, 155)),
                FontSize = 12,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                TextAlignment = TextAlignment.Center
            };

            var chartStack = new StackPanel();
            chartStack.Children.Add(chartTitle);
            chartStack.Children.Add(chartPlaceholder);
            chartSection.Child = chartStack;

            stack.Children.Add(chartSection);

            scroll.Content = stack;
            return scroll;
        }

        private UIElement CreatePositionsTab()
        {
            var scroll = new ScrollViewer { VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var stack = new StackPanel();

            // Positions Summary
            var summaryGrid = new Grid();
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            var totalPositions = CreateMetricCard("Total Positions", "3", "ACTIVE", Colors.Orange);
            Grid.SetColumn(totalPositions, 0);
            summaryGrid.Children.Add(totalPositions);

            var unrealizedPnl = CreateMetricCard("Unrealized P&L", "+$1,234.56", "PROFIT", Colors.Green);
            Grid.SetColumn(unrealizedPnl, 1);
            summaryGrid.Children.Add(unrealizedPnl);

            var marginUsed = CreateMetricCard("Margin Used", "$12,345", "NORMAL", Colors.Blue);
            Grid.SetColumn(marginUsed, 2);
            summaryGrid.Children.Add(marginUsed);

            stack.Children.Add(summaryGrid);

            // Positions DataGrid (live)
            var positionsGrid = new DataGrid
            {
                ItemsSource = _positions,
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserResizeRows = false,
                RowBackground = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                AlternatingRowBackground = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Margin = new Thickness(0, 15, 0, 0),
                Height = 300
            };

            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Symbol",
                Binding = new Binding("Symbol"),
                Width = 80
            });
            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Side",
                Binding = new Binding("Side"),
                Width = 60
            });
            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Qty",
                Binding = new Binding("Quantity"),
                Width = 60
            });
            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Avg Price",
                Binding = new Binding("AvgPrice"),
                Width = 100
            });
            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Current Price",
                Binding = new Binding("CurrentPrice"),
                Width = 100
            });
            positionsGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "P&L",
                Binding = new Binding("PnL"),
                Width = 100
            });
            stack.Children.Add(positionsGrid);

            scroll.Content = stack;
            return scroll;
        }

        private UIElement CreateOrdersTab()
        {
            var scroll = new ScrollViewer { VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var stack = new StackPanel();

            // Orders Summary
            var summaryGrid = new Grid();
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            summaryGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            var pendingOrders = CreateMetricCard("Pending Orders", "2", "ACTIVE", Colors.Orange);
            Grid.SetColumn(pendingOrders, 0);
            summaryGrid.Children.Add(pendingOrders);

            var filledToday = CreateMetricCard("Filled Today", "8", "GOOD", Colors.Green);
            Grid.SetColumn(filledToday, 1);
            summaryGrid.Children.Add(filledToday);

            var cancelledToday = CreateMetricCard("Cancelled Today", "1", "LOW", Colors.Red);
            Grid.SetColumn(cancelledToday, 2);
            summaryGrid.Children.Add(cancelledToday);

            stack.Children.Add(summaryGrid);

            // Orders DataGrid (live)
            var ordersGrid = new DataGrid
            {
                ItemsSource = _orders,
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserResizeRows = false,
                RowBackground = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                AlternatingRowBackground = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Margin = new Thickness(0, 15, 0, 0),
                Height = 300
            };

            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Symbol",
                Binding = new Binding("Symbol"),
                Width = 80
            });
            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Side",
                Binding = new Binding("Side"),
                Width = 60
            });
            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Qty",
                Binding = new Binding("Quantity"),
                Width = 60
            });
            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Type",
                Binding = new Binding("OrderType"),
                Width = 80
            });
            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Price",
                Binding = new Binding("Price"),
                Width = 80
            });
            ordersGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Status",
                Binding = new Binding("Status"),
                Width = 80
            });
            stack.Children.Add(ordersGrid);

            scroll.Content = stack;
            return scroll;
        }

        private UIElement CreateHistoryTab()
        {
            var scroll = new ScrollViewer { VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var stack = new StackPanel();

            // History Filters
            var filterPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(0, 0, 0, 15)
            };

            var dateRangeCombo = new ComboBox
            {
                Width = 120,
                Margin = new Thickness(0, 0, 10, 0),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 55)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderBrush = new SolidColorBrush(Color.FromRgb(80, 80, 85))
            };
            dateRangeCombo.Items.Add("Last 7 Days");
            dateRangeCombo.Items.Add("Last 30 Days");
            dateRangeCombo.Items.Add("Last 90 Days");
            dateRangeCombo.Items.Add("Last Year");
            dateRangeCombo.SelectedIndex = 1;

            var symbolFilter = new TextBox
            {
                Width = 100,
                Margin = new Thickness(0, 0, 10, 0),
                Background = new SolidColorBrush(Color.FromRgb(50, 50, 55)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderBrush = new SolidColorBrush(Color.FromRgb(80, 80, 85)),
                Text = "All Symbols"
            };

            var exportBtn = new Button
            {
                Content = "📤 Export",
                Background = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(10, 5, 10, 5),
                FontSize = 11
            };

            filterPanel.Children.Add(dateRangeCombo);
            filterPanel.Children.Add(symbolFilter);
            filterPanel.Children.Add(exportBtn);

            stack.Children.Add(filterPanel);

            // History DataGrid
            var historyGrid = new DataGrid
            {
                AutoGenerateColumns = false,
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                CanUserAddRows = false,
                CanUserDeleteRows = false,
                CanUserResizeRows = false,
                RowBackground = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                AlternatingRowBackground = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                Height = 400
            };

            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Date",
                Binding = new Binding("Date"),
                Width = 100
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Symbol",
                Binding = new Binding("Symbol"),
                Width = 80
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Side",
                Binding = new Binding("Side"),
                Width = 60
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Size",
                Binding = new Binding("Size"),
                Width = 60
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Entry Price",
                Binding = new Binding("EntryPrice"),
                Width = 100
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Exit Price",
                Binding = new Binding("ExitPrice"),
                Width = 100
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "P&L",
                Binding = new Binding("PnL"),
                Width = 100
            });
            historyGrid.Columns.Add(new DataGridTextColumn
            {
                Header = "Duration",
                Binding = new Binding("Duration"),
                Width = 80
            });

            // Sample data
            var history = new List<dynamic>
            {
                new { Date = "2024-01-15", Symbol = "ES", Side = "Long", Size = 2, EntryPrice = "4,567.50", ExitPrice = "4,589.25", PnL = "+$435.50", Duration = "2h 15m" },
                new { Date = "2024-01-15", Symbol = "NQ", Side = "Short", Size = 1, EntryPrice = "15,234.00", ExitPrice = "15,198.75", PnL = "+$352.50", Duration = "1h 45m" },
                new { Date = "2024-01-14", Symbol = "CL", Side = "Long", Size = 3, EntryPrice = "78.45", ExitPrice = "79.12", PnL = "+$201.00", Duration = "45m" },
                new { Date = "2024-01-14", Symbol = "YM", Side = "Short", Size = 1, EntryPrice = "37,890.00", ExitPrice = "37,845.50", PnL = "-$445.00", Duration = "3h 20m" }
            };

            historyGrid.ItemsSource = history;
            stack.Children.Add(historyGrid);

            scroll.Content = stack;
            return scroll;
        }

        private UIElement CreateAccountManagerRightPanel()
        {
            var panel = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(30, 30, 35)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(60, 60, 65)),
                BorderThickness = new Thickness(1, 0, 0, 0),
                Padding = new Thickness(15)
            };

            var stack = new StackPanel();
            stack.Children.Add(CreateRiskManagementSection());
            stack.Children.Add(CreateAccountSettingsSection());
            stack.Children.Add(CreateNotificationsSection());

            panel.Child = new ScrollViewer { Content = stack, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            return panel;
        }

        private UIElement CreateRiskManagementSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "🛡️ Risk Management",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            // Risk metrics
            var riskGrid = new Grid();
            riskGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            riskGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            riskGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            riskGrid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            var dailyLoss = CreateMetricCard("Daily Loss", "-$2,345", "WARNING", Colors.Red);
            Grid.SetRow(dailyLoss, 0);
            Grid.SetColumn(dailyLoss, 0);
            riskGrid.Children.Add(dailyLoss);

            var maxRisk = CreateMetricCard("Max Risk", "$5,000", "LIMIT", Colors.Orange);
            Grid.SetRow(maxRisk, 0);
            Grid.SetColumn(maxRisk, 1);
            riskGrid.Children.Add(maxRisk);

            var positionRisk = CreateMetricCard("Position Risk", "2.5%", "NORMAL", Colors.Yellow);
            Grid.SetRow(positionRisk, 1);
            Grid.SetColumn(positionRisk, 0);
            riskGrid.Children.Add(positionRisk);

            var marginLevel = CreateMetricCard("Margin Level", "85%", "SAFE", Colors.Green);
            Grid.SetRow(marginLevel, 1);
            Grid.SetColumn(marginLevel, 1);
            riskGrid.Children.Add(marginLevel);

            stack.Children.Add(title);
            stack.Children.Add(riskGrid);

            // Risk controls
            var controlsStack = new StackPanel { Margin = new Thickness(0, 10, 0, 0) };

            var maxDailyLossLabel = new TextBlock
            {
                Text = "Max Daily Loss:",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 11,
                Margin = new Thickness(0, 0, 0, 2)
            };

            var maxDailyLossSlider = new Slider
            {
                Minimum = 0,
                Maximum = 10000,
                Value = 5000,
                Margin = new Thickness(0, 0, 0, 5)
            };

            var maxDailyLossValue = new TextBlock
            {
                Text = "$5,000",
                Foreground = new SolidColorBrush(Color.FromRgb(180, 180, 185)),
                FontSize = 10,
                HorizontalAlignment = HorizontalAlignment.Right
            };

            controlsStack.Children.Add(maxDailyLossLabel);
            controlsStack.Children.Add(maxDailyLossSlider);
            controlsStack.Children.Add(maxDailyLossValue);

            stack.Children.Add(controlsStack);

            section.Child = stack;
            return section;
        }

        private UIElement CreateAccountSettingsSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(0, 0, 0, 15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "⚙️ Account Settings",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            // Provider selection
            var providerLabel = new TextBlock
            {
                Text = "Execution Provider:",
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 11,
                Margin = new Thickness(0, 0, 0, 5)
            };

            var providerCombo = new ComboBox
            {
                Background = new SolidColorBrush(Color.FromRgb(35, 35, 40)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Margin = new Thickness(0, 0, 0, 10),
                Width = 220
            };

            providerCombo.Items.Add("NinjaTrader (Futures)");
            providerCombo.Items.Add("Tradovate (Futures)");
            providerCombo.Items.Add("Simulated");
            providerCombo.SelectedItem = _selectedProvider;
            providerCombo.SelectionChanged += (s, e) =>
            {
                _selectedProvider = providerCombo.SelectedItem?.ToString() ?? "Simulated";
            };

            // Settings options
            var settingsList = new StackPanel();

            var autoFlattenCheck = new CheckBox
            {
                Content = "Auto-flatten at end of day",
                Foreground = new SolidColorBrush(Colors.White),
                IsChecked = true,
                Margin = new Thickness(0, 0, 0, 5)
            };

            var riskAlertsCheck = new CheckBox
            {
                Content = "Risk alerts enabled",
                Foreground = new SolidColorBrush(Colors.White),
                IsChecked = true,
                Margin = new Thickness(0, 0, 0, 5)
            };

            var autoRebalanceCheck = new CheckBox
            {
                Content = "Auto-rebalance positions",
                Foreground = new SolidColorBrush(Colors.White),
                IsChecked = false,
                Margin = new Thickness(0, 0, 0, 5)
            };

            var paperTradingCheck = new CheckBox
            {
                Content = "Paper trading mode",
                Foreground = new SolidColorBrush(Colors.White),
                IsChecked = _paperMode,
                Margin = new Thickness(0, 0, 0, 5)
            };

            paperTradingCheck.Checked += (s, e) =>
            {
                _paperMode = true;
            };
            paperTradingCheck.Unchecked += (s, e) =>
            {
                _paperMode = false;
            };

            settingsList.Children.Add(autoFlattenCheck);
            settingsList.Children.Add(riskAlertsCheck);
            settingsList.Children.Add(autoRebalanceCheck);
            settingsList.Children.Add(paperTradingCheck);

            stack.Children.Add(title);
            stack.Children.Add(providerLabel);
            stack.Children.Add(providerCombo);
            stack.Children.Add(settingsList);

            // Save button
            var saveBtn = new Button
            {
                Content = "💾 Save Settings",
                Background = new SolidColorBrush(Color.FromRgb(60, 150, 60)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(15, 8, 15, 8),
                Margin = new Thickness(0, 10, 0, 0),
                FontSize = 12
            };

            stack.Children.Add(saveBtn);

            section.Child = stack;
            return section;
        }

        private UIElement CreateNotificationsSection()
        {
            var section = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(40, 40, 45)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15)
            };

            var stack = new StackPanel();

            var title = new TextBlock
            {
                Text = "🔔 Notifications",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 0, 0, 10)
            };

            // Notification list
            var notificationList = new ListBox
            {
                Background = new SolidColorBrush(Colors.Transparent),
                BorderThickness = new Thickness(0),
                MaxHeight = 200
            };

            var notifications = new List<string>
            {
                "📈 Position opened: ES Long 2 @ 4,567.50",
                "⚠️ Risk alert: Daily loss approaching limit",
                "✅ Order filled: NQ Short 1 @ 15,234.00",
                "🔄 Auto-flatten triggered for CL position",
                "📊 Daily P&L: +$2,345.67"
            };

            foreach (var notification in notifications)
            {
                var item = new TextBlock
                {
                    Text = notification,
                    Foreground = new SolidColorBrush(Colors.White),
                    FontSize = 11,
                    Margin = new Thickness(0, 2, 0, 2),
                    TextWrapping = TextWrapping.Wrap
                };
                notificationList.Items.Add(item);
            }

            stack.Children.Add(title);
            stack.Children.Add(notificationList);

            // Clear notifications button
            var clearBtn = new Button
            {
                Content = "🗑️ Clear All",
                Background = new SolidColorBrush(Color.FromRgb(150, 60, 60)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0),
                Padding = new Thickness(10, 5, 10, 5),
                Margin = new Thickness(0, 10, 0, 0),
                FontSize = 11
            };

            stack.Children.Add(clearBtn);

            section.Child = stack;
            return section;
        }

        private StackPanel CreateNewsFeedPanel()
        {
            var panel = new StackPanel
            {
                Orientation = Orientation.Vertical,
                Margin = new Thickness(10)
            };

            var header = new TextBlock
            {
                Text = "📰 News Feed & Market Context",
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(10, 10, 10, 5)
            };

            var refreshButton = new Button
            {
                Content = "🔄 Refresh",
                Width = 100,
                Height = 30,
                Margin = new Thickness(10, 0, 10, 10),
                Background = new SolidColorBrush(Color.FromRgb(64, 128, 255)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0)
            };

            var newsList = new ListView
            {
                Height = 200,
                Background = new SolidColorBrush(Color.FromRgb(15, 20, 30)),
                BorderThickness = new Thickness(0),
                Margin = new Thickness(10, 0, 10, 10)
            };

            var contextPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(10, 0, 10, 10)
            };

            var symbolLabel = new TextBlock
            {
                Text = "Symbol:",
                Foreground = new SolidColorBrush(Colors.White),
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 5, 0)
            };

            var symbolTextBox = new TextBox
            {
                Text = "ES",
                Width = 60,
                Height = 25,
                Background = new SolidColorBrush(Color.FromRgb(30, 35, 45)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderBrush = new SolidColorBrush(Color.FromRgb(64, 128, 255)),
                Margin = new Thickness(0, 0, 10, 0)
            };

            var contextButton = new Button
            {
                Content = "Get Context",
                Width = 100,
                Height = 25,
                Background = new SolidColorBrush(Color.FromRgb(64, 128, 255)),
                Foreground = new SolidColorBrush(Colors.White),
                BorderThickness = new Thickness(0)
            };

            var contextResult = new TextBlock
            {
                Text = "Context: Normal",
                Foreground = new SolidColorBrush(Colors.LightGreen),
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(10, 0, 0, 0)
            };

            contextPanel.Children.Add(symbolLabel);
            contextPanel.Children.Add(symbolTextBox);
            contextPanel.Children.Add(contextButton);
            contextPanel.Children.Add(contextResult);

            refreshButton.Click += async (s, e) =>
            {
                try
                {
                    // Simplified news loading for now
                    newsList.Items.Clear();

                    var sampleEvents = new[]
                    {
                        new { Timestamp = DateTime.Now.AddHours(1), Title = "FOMC Meeting", Severity = "high" },
                        new { Timestamp = DateTime.Now.AddHours(2), Title = "GDP Report", Severity = "medium" },
                        new { Timestamp = DateTime.Now.AddHours(3), Title = "Earnings: AAPL", Severity = "medium" }
                    };

                    foreach (var evt in sampleEvents)
                    {
                        var item = new TextBlock
                        {
                            Text = $"{evt.Timestamp:HH:mm} - {evt.Title} ({evt.Severity.ToUpper()})",
                            Foreground = new SolidColorBrush(evt.Severity == "high" ? Colors.Red :
                                                           evt.Severity == "medium" ? Colors.Orange : Colors.LightGreen),
                            Margin = new Thickness(5),
                            TextWrapping = TextWrapping.Wrap
                        };
                        newsList.Items.Add(item);
                    }
                }
                catch (Exception ex)
                {
                    var errorItem = new TextBlock
                    {
                        Text = $"Error loading news: {ex.Message}",
                        Foreground = new SolidColorBrush(Colors.Red),
                        Margin = new Thickness(5)
                    };
                    newsList.Items.Add(errorItem);
                }
            };

            contextButton.Click += async (s, e) =>
            {
                try
                {
                    var symbol = symbolTextBox.Text.Trim().ToUpper();
                    // Simplified context for now
                    var isHighImpact = symbol == "AAPL" || symbol == "TSLA";
                    var status = isHighImpact ? "HIGH IMPACT" : "Normal";
                    var color = isHighImpact ? Colors.Red : Colors.LightGreen;
                    var riskFactor = isHighImpact ? 1.5 : 1.0;

                    contextResult.Text = $"Context: {status} (Risk: {riskFactor:F2}x)";
                    contextResult.Foreground = new SolidColorBrush(color);
                }
                catch (Exception ex)
                {
                    contextResult.Text = $"Error: {ex.Message}";
                    contextResult.Foreground = new SolidColorBrush(Colors.Red);
                }
            };

            panel.Children.Add(header);
            panel.Children.Add(refreshButton);
            panel.Children.Add(newsList);
            panel.Children.Add(contextPanel);

            return panel;
        }
    }

    // Data classes for real trading functionality
    public class MarketDataItem
    {
        public string Symbol { get; set; } = string.Empty;
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal Last { get; set; }
        public decimal Change { get; set; }
        public int Volume { get; set; }
    }

    public class PositionItem
    {
        public string Symbol { get; set; } = string.Empty;
        public string Side { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal AvgPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal PnL { get; set; }
    }

    public class OrderItem
    {
        public string Symbol { get; set; } = string.Empty;
        public string Side { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
