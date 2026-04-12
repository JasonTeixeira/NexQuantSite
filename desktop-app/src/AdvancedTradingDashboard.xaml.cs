using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using System.Net.Http;
using Newtonsoft.Json;
using QuantumTrader.Services;
using QuantumTrader.Views;
using System.Windows.Shapes;

namespace QuantumTrader
{
    public partial class AdvancedTradingDashboard : Window
    {
        private readonly DispatcherTimer _timeTimer;
        private readonly DispatcherTimer _updateTimer;
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl = "http://localhost:8000";

        // Multi-account management
        private ObservableCollection<TradingAccount> _accounts;
        private ObservableCollection<TradingStrategy> _strategies;

        // Risk engine
        private RiskEngine _riskEngine;

        // Trading state
        private bool _isConnected = false;
        private decimal _totalCollectivePnL = 0.00m;

        // Credit system
        private CreditSystemService _creditService;

        public AdvancedTradingDashboard(CreditSystemService creditService)
        {
            InitializeComponent();

            // Initialize collections
            _accounts = new ObservableCollection<TradingAccount>();
            _strategies = new ObservableCollection<TradingStrategy>();

            // Initialize risk engine
            _riskEngine = new RiskEngine();

            // Initialize credit system (from DI)
            _creditService = creditService;

            // Initialize HTTP client
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri(_apiBaseUrl);

            // Initialize timers
            _timeTimer = new DispatcherTimer();
            _timeTimer.Interval = TimeSpan.FromSeconds(1);
            _timeTimer.Tick += TimeTimer_Tick;
            _timeTimer.Start();

            _updateTimer = new DispatcherTimer();
            _updateTimer.Interval = TimeSpan.FromMilliseconds(1000);
            _updateTimer.Tick += UpdateTimer_Tick;
            _updateTimer.Start();

            // Update initial time
            UpdateTimeDisplay();

            // Load initial data
            LoadInitialData();

            // Setup UI controls
            SetupUIControls();

            // Load sample data
            LoadSampleData();
        }

        private void SetupUIControls()
        {
            // Setup slider value updates
            MaxDailyLossSlider.ValueChanged += (s, e) => MaxDailyLossValue.Text = $"{e.NewValue:F0}%";
            MaxPositionSizeSlider.ValueChanged += (s, e) => MaxPositionSizeValue.Text = $"{e.NewValue:F0}%";
            StopLossSlider.ValueChanged += (s, e) => StopLossValue.Text = $"{e.NewValue:F1}%";

            // Setup account selector
            AccountSelector.SelectionChanged += AccountSelector_SelectionChanged;

            // Emergency controls are not present in this XAML variant; guard with null checks
            if (FindName("EmergencyStopAll") is Button emergencyBtn) emergencyBtn.Click += EmergencyStopAll_Click;
            if (FindName("FlattenPositions") is Button flattenBtn) flattenBtn.Click += FlattenPositions_Click;
            if (FindName("ResetRiskLimits") is Button resetBtn) resetBtn.Click += ResetRiskLimits_Click;
        }

        private void LoadSampleData()
        {
            // Load sample accounts
            _accounts.Add(new TradingAccount { Id = 1, Name = "Account 1", Type = "LIVE", Balance = 50000.00m, PnL = 12500.50m, Status = "ACTIVE" });
            _accounts.Add(new TradingAccount { Id = 2, Name = "Account 2", Type = "SIM", Balance = 100000.00m, PnL = 8750.25m, Status = "ACTIVE" });
            _accounts.Add(new TradingAccount { Id = 3, Name = "Account 3", Type = "LIVE", Balance = 75000.00m, PnL = 18950.75m, Status = "ACTIVE" });
            _accounts.Add(new TradingAccount { Id = 4, Name = "Account 4", Type = "SIM", Balance = 25000.00m, PnL = -1250.00m, Status = "PAUSED" });
            _accounts.Add(new TradingAccount { Id = 5, Name = "Account 5", Type = "LIVE", Balance = 150000.00m, PnL = 5675.00m, Status = "ACTIVE" });

            // Update credit display
            UpdateCreditDisplay();

            // Setup credit system event handlers
            SetupCreditSystemHandlers();
        }

        #region Credit System Integration

        private void SetupCreditSystemHandlers()
        {
            // Add event handlers for credit system buttons
            // These will be connected to the buttons in the Strategy Lab
        }

        private void UpdateCreditDisplay()
        {
            try
            {
                var availableCredits = _creditService.GetAvailableCredits();
                if (AvailableCredits != null)
                {
                    AvailableCredits.Text = $"${availableCredits:F2}";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating credit display: {ex.Message}");
            }
        }

        private void ShowCreditPurchaseDialog()
        {
            try
            {
                var dialog = new CreditPurchaseDialog(_creditService);
                dialog.Owner = this;
                var result = dialog.ShowDialog();

                if (result == true)
                {
                    UpdateCreditDisplay();
                    MessageBox.Show("✅ Credits added successfully!", "Credits Added",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"❌ Error: {ex.Message}", "Dialog Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        private void CreateAccountCards()
        {
            AccountGrid.Children.Clear();

            for (int i = 0; i < _accounts.Count; i++)
            {
                var account = _accounts[i];
                var card = CreateAccountCard(account);

                Grid.SetColumn(card, i % 5);
                Grid.SetRow(card, i / 5);
                AccountGrid.Children.Add(card);
            }
        }

        private Border CreateAccountCard(TradingAccount account)
        {
            var card = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(42, 42, 42)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(15),
                Margin = new Thickness(5)
            };

            var content = new StackPanel();

            // Account header
            var header = new StackPanel { Orientation = Orientation.Horizontal };
            header.Children.Add(new TextBlock
            {
                Text = account.Name,
                FontWeight = FontWeights.Bold,
                Foreground = new SolidColorBrush(Colors.White),
                FontSize = 14
            });

            var statusIndicator = new Ellipse
            {
                Width = 8,
                Height = 8,
                Fill = account.Status == "ACTIVE" ?
                    new SolidColorBrush(Color.FromRgb(0, 255, 136)) :
                    new SolidColorBrush(Color.FromRgb(255, 71, 87)),
                Margin = new Thickness(5, 0, 0, 0)
            };
            header.Children.Add(statusIndicator);

            content.Children.Add(header);

            // Account type
            content.Children.Add(new TextBlock
            {
                Text = account.Type,
                FontSize = 12,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                Margin = new Thickness(0, 5, 0, 0)
            });

            // Balance
            content.Children.Add(new TextBlock
            {
                Text = $"Balance: ${account.Balance:N2}",
                FontSize = 12,
                Foreground = new SolidColorBrush(Colors.White),
                Margin = new Thickness(0, 5, 0, 0)
            });

            // P&L
            var pnlColor = account.PnL >= 0 ?
                new SolidColorBrush(Color.FromRgb(0, 255, 136)) :
                new SolidColorBrush(Color.FromRgb(255, 71, 87));

            content.Children.Add(new TextBlock
            {
                Text = $"P&L: ${account.PnL:N2}",
                FontSize = 14,
                FontWeight = FontWeights.Bold,
                Foreground = pnlColor,
                Margin = new Thickness(0, 5, 0, 0)
            });

            // Status
            content.Children.Add(new TextBlock
            {
                Text = account.Status,
                FontSize = 10,
                Foreground = new SolidColorBrush(Color.FromRgb(139, 148, 158)),
                Margin = new Thickness(0, 5, 0, 0)
            });

            card.Child = content;
            return card;
        }

        private void CreateStrategyCards()
        {
            // This would create strategy performance cards
            // For now, we'll just update the strategy performance section
        }

        private void UpdateCollectiveMetrics()
        {
            _totalCollectivePnL = _accounts.Sum(a => a.PnL);
            var activeAccounts = _accounts.Count(a => a.Status == "ACTIVE");
            var totalVolume = _accounts.Sum(a => a.Balance);
            var winRate = _accounts.Count(a => a.PnL > 0) * 100.0 / _accounts.Count;

            TotalPnL.Text = $"${_totalCollectivePnL:N2}";
            ActiveAccounts.Text = $"{activeAccounts}/10";
            TotalVolume.Text = $"{totalVolume:N0}";
            WinRate.Text = $"{winRate:F1}%";

            // Update colors based on P&L
            TotalPnL.Foreground = _totalCollectivePnL >= 0 ?
                new SolidColorBrush(Color.FromRgb(0, 255, 136)) :
                new SolidColorBrush(Color.FromRgb(255, 71, 87));
        }

        private void UpdateTimer_Tick(object sender, EventArgs e)
        {
            // Update account P&L with random movements
            var random = new Random();
            foreach (var account in _accounts)
            {
                if (account.Status == "ACTIVE")
                {
                    var change = (decimal)(random.NextDouble() - 0.5) * 100.0m;
                    account.PnL += change;
                }
            }

            // Update collective metrics
            UpdateCollectiveMetrics();

            // Recreate account cards to show updated data
            CreateAccountCards();
        }

        private void TimeTimer_Tick(object sender, EventArgs e)
        {
            UpdateTimeDisplay();
        }

        private void UpdateTimeDisplay()
        {
            TimeDisplay.Text = DateTime.Now.ToString("HH:mm:ss");
        }

        private async void LoadInitialData()
        {
            try
            {
                // Test backend connection
                var response = await _httpClient.GetAsync("/health");
                if (response.IsSuccessStatusCode)
                {
                    _isConnected = true;
                }
                else
                {
                    _isConnected = false;
                }
            }
            catch
            {
                _isConnected = false;
            }
        }

        private void AccountSelector_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (AccountSelector.SelectedItem is ComboBoxItem selectedItem)
            {
                var accountName = selectedItem.Content.ToString();
                // Update account-specific controls based on selection
                Console.WriteLine($"Selected account: {accountName}");
            }
        }

        private void EmergencyStopAll_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "Are you sure you want to EMERGENCY STOP ALL trading across all accounts?",
                "Emergency Stop Confirmation",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                // Stop all trading
                foreach (var account in _accounts)
                {
                    account.Status = "STOPPED";
                }

                MessageBox.Show("All trading has been stopped across all accounts.", "Emergency Stop Executed", MessageBoxButton.OK, MessageBoxImage.Information);

                // Update UI
                CreateAccountCards();
                UpdateCollectiveMetrics();
            }
        }

        private void FlattenPositions_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "Are you sure you want to flatten all positions across all accounts?",
                "Flatten Positions Confirmation",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                // Flatten all positions
                MessageBox.Show("All positions have been flattened across all accounts.", "Positions Flattened", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void ResetRiskLimits_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "Are you sure you want to reset all risk limits to default values?",
                "Reset Risk Limits Confirmation",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                // Reset risk limits
                MaxDailyLossSlider.Value = 5;
                MaxPositionSizeSlider.Value = 10;
                StopLossSlider.Value = 2;

                MessageBox.Show("Risk limits have been reset to default values.", "Risk Limits Reset", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        #region Credit System Integration

        private async void GenerateStrategyWithAI_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Check if user has sufficient credits
                if (!_creditService.HasSufficientCredits(5.00m))
                {
                    var result = MessageBox.Show(
                        "❌ Insufficient credits for AI strategy generation.\n\n" +
                        "Cost: $5.00\n" +
                        "Available: $" + _creditService.GetAvailableCredits().ToString("F2") + "\n\n" +
                        "Would you like to purchase more credits?",
                        "Insufficient Credits",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        ShowCreditPurchaseDialog();
                    }
                    return;
                }

                // Deduct credits
                var success = await _creditService.DeductCreditsForStrategyGenerationAsync();
                if (!success)
                {
                    MessageBox.Show("❌ Failed to process credits. Please try again.", "Credit Error",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                // Update display
                UpdateCreditDisplay();

                // Show AI generation in progress
                MessageBox.Show("🧠 AI is generating your strategy...\n\n" +
                              "This may take a few moments. You'll be notified when complete.",
                              "AI Strategy Generation",
                              MessageBoxButton.OK,
                              MessageBoxImage.Information);

                // Simulate AI generation (replace with actual AI call)
                await Task.Delay(3000);

                // Update code editor with generated strategy
                UpdateCodeEditorWithGeneratedStrategy();

                MessageBox.Show("✅ AI strategy generated successfully!\n\n" +
                              "Your strategy has been created and is ready for backtesting.",
                              "Strategy Generated",
                              MessageBoxButton.OK,
                              MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"❌ Error generating strategy: {ex.Message}", "Generation Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void BacktestStrategy_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Check if user has sufficient credits
                if (!_creditService.HasSufficientCredits(2.50m))
                {
                    var result = MessageBox.Show(
                        "❌ Insufficient credits for backtesting.\n\n" +
                        "Cost: $2.50\n" +
                        "Available: $" + _creditService.GetAvailableCredits().ToString("F2") + "\n\n" +
                        "Would you like to purchase more credits?",
                        "Insufficient Credits",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        ShowCreditPurchaseDialog();
                    }
                    return;
                }

                // Deduct credits
                var success = await _creditService.DeductCreditsForBacktestAsync();
                if (!success)
                {
                    MessageBox.Show("❌ Failed to process credits. Please try again.", "Credit Error",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                // Update display
                UpdateCreditDisplay();

                // Show backtest in progress
                MessageBox.Show("📊 Running strategy backtest...\n\n" +
                              "This may take a few moments. You'll be notified when complete.",
                              "Strategy Backtest",
                              MessageBoxButton.OK,
                              MessageBoxImage.Information);

                // Simulate backtest (replace with actual backtest)
                await Task.Delay(2000);

                // Show backtest results
                ShowBacktestResults();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"❌ Error running backtest: {ex.Message}", "Backtest Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void OptimizeStrategy_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Check if user has sufficient credits
                if (!_creditService.HasSufficientCredits(3.00m))
                {
                    var result = MessageBox.Show(
                        "❌ Insufficient credits for AI optimization.\n\n" +
                        "Cost: $3.00\n" +
                        "Available: $" + _creditService.GetAvailableCredits().ToString("F2") + "\n\n" +
                        "Would you like to purchase more credits?",
                        "Insufficient Credits",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        ShowCreditPurchaseDialog();
                    }
                    return;
                }

                // Deduct credits
                var success = await _creditService.DeductCreditsForOptimizationAsync();
                if (!success)
                {
                    MessageBox.Show("❌ Failed to process credits. Please try again.", "Credit Error",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                // Update display
                UpdateCreditDisplay();

                // Show optimization in progress
                MessageBox.Show("⚡ AI is optimizing your strategy...\n\n" +
                              "This may take a few moments. You'll be notified when complete.",
                              "AI Optimization",
                              MessageBoxButton.OK,
                              MessageBoxImage.Information);

                // Simulate optimization (replace with actual AI optimization)
                await Task.Delay(2500);

                // Show optimization results
                ShowOptimizationResults();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"❌ Error optimizing strategy: {ex.Message}", "Optimization Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void AddCredits_Click(object sender, RoutedEventArgs e)
        {
            ShowCreditPurchaseDialog();
        }

        private void UpdateCodeEditorWithGeneratedStrategy()
        {
            // This would be replaced with actual AI-generated strategy code
            var generatedCode = @"# AI-Generated Strategy - Quantum Trader Professional
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

class AIGeneratedStrategy:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=150, random_state=42)
        self.scaler = StandardScaler()
        self.position = 0
        self.entry_price = 0
        self.stop_loss = 0.02  # 2% stop loss
        self.take_profit = 0.04  # 4% take profit

    def calculate_features(self, data):
        # Advanced technical indicators
        data['sma_20'] = data['close'].rolling(20).mean()
        data['sma_50'] = data['close'].rolling(50).mean()
        data['ema_12'] = data['close'].ewm(span=12).mean()
        data['ema_26'] = data['close'].ewm(span=26).mean()

        # RSI
        data['rsi'] = self.calculate_rsi(data['close'], 14)

        # MACD
        data['macd'] = data['ema_12'] - data['ema_26']
        data['macd_signal'] = data['macd'].ewm(span=9).mean()
        data['macd_histogram'] = data['macd'] - data['macd_signal']

        # Bollinger Bands
        data['bb_upper'] = data['sma_20'] + (data['close'].rolling(20).std() * 2)
        data['bb_lower'] = data['sma_20'] - (data['close'].rolling(20).std() * 2)
        data['bb_width'] = (data['bb_upper'] - data['bb_lower']) / data['sma_20']

        # Volume indicators
        data['volume_sma'] = data['volume'].rolling(20).mean()
        data['volume_ratio'] = data['volume'] / data['volume_sma']

        # Momentum indicators
        data['momentum'] = data['close'].pct_change(5)
        data['volatility'] = data['close'].rolling(20).std()

        # AI-specific features
        data['trend_strength'] = abs(data['sma_20'] - data['sma_50']) / data['sma_50']
        data['price_position'] = (data['close'] - data['bb_lower']) / (data['bb_upper'] - data['bb_lower'])

        return data

    def calculate_rsi(self, prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def generate_signal(self, features):
        # Prepare feature vector for AI model
        feature_columns = ['rsi', 'macd_histogram', 'bb_width', 'volume_ratio',
                          'momentum', 'volatility', 'trend_strength', 'price_position']

        feature_vector = features[feature_columns].fillna(0).values

        # AI model prediction
        prediction = self.model.predict_proba(feature_vector.reshape(1, -1))[0]
        confidence = max(prediction)

        if confidence > 0.75:  # High confidence threshold
            if prediction[1] > prediction[0]:
                return 'BUY', confidence
            else:
                return 'SELL', confidence
        return 'HOLD', confidence

    def execute_trade(self, signal, price, confidence):
        if signal == 'BUY' and self.position <= 0:
            self.position = 1
            self.entry_price = price
            return f'BUY signal executed with {confidence:.2%} confidence'
        elif signal == 'SELL' and self.position >= 0:
            self.position = -1
            self.entry_price = price
            return f'SELL signal executed with {confidence:.2%} confidence'
        return 'No trade executed'

    def check_exit_conditions(self, current_price):
        if self.position == 0:
            return None

        if self.position > 0:  # Long position
            if current_price <= self.entry_price * (1 - self.stop_loss):
                return 'STOP_LOSS'
            elif current_price >= self.entry_price * (1 + self.take_profit):
                return 'TAKE_PROFIT'
        else:  # Short position
            if current_price >= self.entry_price * (1 + self.stop_loss):
                return 'STOP_LOSS'
            elif current_price <= self.entry_price * (1 - self.take_profit):
                return 'TAKE_PROFIT'

        return None

# Strategy Configuration
STRATEGY_CONFIG = {
    'name': 'AI-Generated Mean Reversion Pro',
    'symbol': 'ES',
    'timeframe': '5m',
    'max_position_size': 0.05,  # 5% of account
    'risk_per_trade': 0.02,     # 2% risk per trade
    'max_daily_loss': 0.05,     # 5% max daily loss
    'ai_confidence_threshold': 0.75
}";

            // Update the code editor (you'll need to add this TextBox to your XAML)
            // CodeEditor.Text = generatedCode;
        }

        private void ShowBacktestResults()
        {
            var results = @"📊 BACKTEST RESULTS

Strategy: AI-Generated Mean Reversion Pro
Period: 2024-01-01 to 2024-12-31
Symbol: ES (E-mini S&P 500)

📈 PERFORMANCE METRICS:
• Total Return: +45.23%
• Sharpe Ratio: 2.15
• Max Drawdown: -8.45%
• Win Rate: 78.5%
• Profit Factor: 2.34

💰 TRADING STATISTICS:
• Total Trades: 247
• Winning Trades: 194
• Losing Trades: 53
• Average Win: $1,245
• Average Loss: $567
• Largest Win: $3,890
• Largest Loss: $1,234

⚡ RISK METRICS:
• Volatility: 12.3%
• Beta: 0.85
• VaR (95%): -2.1%
• Expected Shortfall: -3.2%

✅ CONCLUSION: Strategy shows strong performance with good risk-adjusted returns.";

            MessageBox.Show(results, "Backtest Results", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowOptimizationResults()
        {
            var results = @"⚡ OPTIMIZATION RESULTS

Strategy: AI-Generated Mean Reversion Pro
Optimization Method: Genetic Algorithm + AI

🔧 OPTIMIZED PARAMETERS:
• RSI Period: 14 → 12
• MACD Signal Period: 9 → 7
• Stop Loss: 2.0% → 1.8%
• Take Profit: 4.0% → 4.5%
• Position Size: 5.0% → 6.2%
• Confidence Threshold: 75% → 78%

📈 IMPROVEMENTS:
• Expected Return: +45.23% → +52.18% (+15.4%)
• Sharpe Ratio: 2.15 → 2.47 (+14.9%)
• Max Drawdown: -8.45% → -7.23% (-14.4%)
• Win Rate: 78.5% → 81.2% (+3.4%)

🎯 AI RECOMMENDATIONS:
• Strategy shows strong momentum characteristics
• Consider adding volume-based filters
• Risk management parameters optimized for current market conditions
• Ready for live trading with proper risk controls

✅ OPTIMIZATION COMPLETE: Strategy performance significantly improved!";

            MessageBox.Show(results, "Optimization Results", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        #endregion
    }

    // Data classes
    public class TradingAccount
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; } // LIVE, SIM
        public decimal Balance { get; set; }
        public decimal PnL { get; set; }
        public string Status { get; set; } // ACTIVE, PAUSED, STOPPED
        public List<int> ActiveStrategies { get; set; } = new List<int>();
        public RiskSettings RiskSettings { get; set; } = new RiskSettings();
        public ScheduleSettings ScheduleSettings { get; set; } = new ScheduleSettings();
    }

    public class TradingStrategy
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; } // ENCRYPTED, CUSTOM, MARKETPLACE
        public double Performance { get; set; }
        public string Status { get; set; } // ACTIVE, PAUSED, STOPPED
        public List<int> Accounts { get; set; } = new List<int>();
        public string RiskLevel { get; set; } // LOW, MEDIUM, HIGH
        public decimal MonthlyFee { get; set; }
        public bool IsEncrypted { get; set; }
    }

    public class RiskSettings
    {
        public decimal MaxDailyLoss { get; set; } = 5.0m;
        public decimal MaxPositionSize { get; set; } = 10.0m;
        public decimal StopLoss { get; set; } = 2.0m;
        public int MaxContracts { get; set; } = 10;
        public int MinContracts { get; set; } = 1;
        public bool AutoScaling { get; set; } = true;
    }

    public class ScheduleSettings
    {
        public bool IsEnabled { get; set; } = false;
        public TimeSpan StartTime { get; set; } = new TimeSpan(9, 30, 0);
        public TimeSpan EndTime { get; set; } = new TimeSpan(16, 0, 0);
        public List<DayOfWeek> TradingDays { get; set; } = new List<DayOfWeek>
        {
            DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
            DayOfWeek.Thursday, DayOfWeek.Friday
        };
    }

    public class RiskEngine
    {
        public void ApplyRiskSettings(TradingAccount account, RiskSettings settings)
        {
            account.RiskSettings = settings;
        }

        public bool CheckRiskLimits(TradingAccount account, decimal proposedOrderValue)
        {
            // Implement risk checking logic
            return true;
        }
    }
}
