using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using QuantumTrader.Models;
using QuantumTrader.Services;
using QuantumTrader.Utils;

namespace QuantumTrader.ViewModels
{
    public class MainViewModel : INotifyPropertyChanged
    {
        private const int MAX_ACCOUNTS = 5;

        private readonly IAccountService _accountService;
        private readonly IStrategyService _strategyService;
        private readonly IAssignmentService _assignmentService;
        private readonly IToastService _toastService;
        private readonly IRiskService _riskService;
        private readonly TradeHistoryService _tradeHistoryService;
        private readonly StrategyPurchaseService _purchaseService;
        private readonly StrategyStoreService _storeService;
        private readonly BacktestingService _backtestingService;

        private Account? _selectedAccount;
        private Account _editingAccount = new();
        private string _validationMessage = string.Empty;

        // Control Center properties
        private decimal _totalPnL = 0;
        private string _totalPnLFormatted = "$0.00";
        private int _activeAccountsCount = 0;
        private int _totalVolume = 0;
        private decimal _winRate = 0;
        private string _brokerHealthText = "Disconnected";
        private bool _isBrokerConnected = false;

        // Strategy Lab properties
        private decimal _availableCredits = 1245.00m;
        private string _selectedStrategyType = "Mean Reversion";
        private string _selectedTimeframe = "5 minutes";
        private string _strategyName = "My AI Strategy";
        private string _generatedCode = "";
        private bool _isGeneratingStrategy = false;

        public MainViewModel(
            IAccountService accountService,
            IStrategyService strategyService,
            IAssignmentService assignmentService,
            IToastService toastService,
            IRiskService riskService,
            TradeHistoryService tradeHistoryService,
            StrategyPurchaseService purchaseService,
            StrategyStoreService storeService,
            BacktestingService backtestingService)
        {
            _accountService = accountService;
            _strategyService = strategyService;
            _assignmentService = assignmentService;
            _toastService = toastService;
            _riskService = riskService;
            _tradeHistoryService = tradeHistoryService;
            _purchaseService = purchaseService;
            _storeService = storeService;
            _backtestingService = backtestingService;

            Accounts = new ObservableCollection<Account>();
            Strategies = new ObservableCollection<StrategyConfig>();
            Assignments = new ObservableCollection<AccountStrategy>();
            AccountSwitcher = new ObservableCollection<Account>();
            TradeHistory = new ObservableCollection<TradeHistory>();
            Purchases = new ObservableCollection<StrategyPurchase>();
            StrategyCatalog = new ObservableCollection<StrategyCatalog>();
            ShoppingCart = new ObservableCollection<CartItem>();
            Categories = new ObservableCollection<string>();
            BacktestResults = new ObservableCollection<BacktestResult>();
            StrategyVersions = new ObservableCollection<StrategyVersion>();

            // Control Center collections
            Positions = new ObservableCollection<Position>();
            Orders = new ObservableCollection<Order>();
            StrategyPerformances = new ObservableCollection<StrategyPerformance>();

            Risk = new RiskViewModel(_riskService, "default");

            // Commands
            AddAccountCommand = new DelegateCommand(_ => AddAccount(), _ => CanAddAccount);
            SaveAccountCommand = new DelegateCommand(async _ => await SaveAccountAsync());
            DeleteAccountCommand = new DelegateCommand(async _ => await DeleteAccountAsync());
            AssignSelectedCommand = new DelegateCommand(_ => AssignSelected());
            UnassignSelectedCommand = new DelegateCommand(_ => UnassignSelected());
            SaveAssignmentsCommand = new DelegateCommand(async _ => await SaveAssignmentsAsync());
            ApplyDefaultsCommand = new DelegateCommand(_ => ApplyDefaults());
            ToggleStrategyCommand = new DelegateCommand(param => ToggleStrategy(param as AccountStrategy));
            AddToCartCommand = new DelegateCommand(async param => await AddToCartAsync(param as string));
            RemoveFromCartCommand = new DelegateCommand(async param => await RemoveFromCartAsync(param as string));
            CheckoutCommand = new DelegateCommand(async _ => await CheckoutAsync());
            RunBacktestCommand = new DelegateCommand(async param => await RunBacktestAsync(param as BacktestRequest));
            SaveStrategyVersionCommand = new DelegateCommand(async param => await SaveStrategyVersionAsync(param as StrategyVersion));

            // Strategy Lab commands
            GenerateStrategyWithAICommand = new DelegateCommand(async _ => await GenerateStrategyWithAIAsync());
            SaveStrategyCommand = new DelegateCommand(async _ => await SaveStrategyAsync());
            OptimizeStrategyCommand = new DelegateCommand(async _ => await OptimizeStrategyAsync());
            AddCreditsCommand = new DelegateCommand(_ => AddCredits());

            // Load data on startup
            _ = LoadDataAsync();
        }

        public ObservableCollection<Account> Accounts { get; }
        public ObservableCollection<StrategyConfig> Strategies { get; }
        public ObservableCollection<AccountStrategy> Assignments { get; }
        public ObservableCollection<Account> AccountSwitcher { get; }
        public ObservableCollection<TradeHistory> TradeHistory { get; }
        public ObservableCollection<StrategyPurchase> Purchases { get; }
        public ObservableCollection<StrategyCatalog> StrategyCatalog { get; }
        public ObservableCollection<CartItem> ShoppingCart { get; }
        public ObservableCollection<string> Categories { get; }
        public ObservableCollection<BacktestResult> BacktestResults { get; }
        public ObservableCollection<StrategyVersion> StrategyVersions { get; }

        // Control Center collections
        public ObservableCollection<Position> Positions { get; }
        public ObservableCollection<Order> Orders { get; }
        public ObservableCollection<StrategyPerformance> StrategyPerformances { get; }

        public Account? SelectedAccount
        {
            get => _selectedAccount;
            set
            {
                if (SetProperty(ref _selectedAccount, value) && value != null)
                {
                    _ = LoadAssignmentsForAccount(value.Id);
                    _ = LoadRiskProfileForAccount(value.Id);
                    _ = LoadTradeHistoryForAccount(value.Id);
                    _ = LoadPurchasesForAccount(value.Id);
                }
            }
        }

        public Account EditingAccount
        {
            get => _editingAccount;
            set => SetProperty(ref _editingAccount, value);
        }

        public string ValidationMessage
        {
            get => _validationMessage;
            set => SetProperty(ref _validationMessage, value);
        }

        public bool CanAddAccount => Accounts.Count < MAX_ACCOUNTS;
        public string AccountLimitMessage => $"Account Limit: {Accounts.Count}/{MAX_ACCOUNTS}";

        public RiskViewModel Risk { get; }

        // Control Center properties
        public decimal TotalPnL
        {
            get => _totalPnL;
            set
            {
                if (SetProperty(ref _totalPnL, value))
                {
                    TotalPnLFormatted = value >= 0 ? $"+${value:N2}" : $"-${Math.Abs(value):N2}";
                }
            }
        }

        public string TotalPnLFormatted
        {
            get => _totalPnLFormatted;
            set => SetProperty(ref _totalPnLFormatted, value);
        }

        public int ActiveAccountsCount
        {
            get => _activeAccountsCount;
            set => SetProperty(ref _activeAccountsCount, value);
        }

        public string ActiveAccountsDisplay => $"{ActiveAccountsCount}/{MAX_ACCOUNTS}";

        public int TotalVolume
        {
            get => _totalVolume;
            set => SetProperty(ref _totalVolume, value);
        }

        public decimal WinRate
        {
            get => _winRate;
            set => SetProperty(ref _winRate, value);
        }

        public string WinRateFormatted => $"{WinRate:F1}%";

        public string BrokerHealthText
        {
            get => _brokerHealthText;
            set => SetProperty(ref _brokerHealthText, value);
        }

        public bool IsBrokerConnected
        {
            get => _isBrokerConnected;
            set => SetProperty(ref _isBrokerConnected, value);
        }

        // Strategy Lab properties
        public decimal AvailableCredits
        {
            get => _availableCredits;
            set => SetProperty(ref _availableCredits, value);
        }

        public string AvailableCreditsFormatted => $"${AvailableCredits:N2}";

        public string SelectedStrategyType
        {
            get => _selectedStrategyType;
            set => SetProperty(ref _selectedStrategyType, value);
        }

        public string SelectedTimeframe
        {
            get => _selectedTimeframe;
            set => SetProperty(ref _selectedTimeframe, value);
        }

        public string StrategyName
        {
            get => _strategyName;
            set => SetProperty(ref _strategyName, value);
        }

        public string GeneratedCode
        {
            get => _generatedCode;
            set => SetProperty(ref _generatedCode, value);
        }

        public bool IsGeneratingStrategy
        {
            get => _isGeneratingStrategy;
            set => SetProperty(ref _isGeneratingStrategy, value);
        }

        // Order entry inputs
        public decimal InputConfidence { get; set; } = 0.75m;
        public decimal InputProposedRiskPct { get; set; } = 2.0m;
        public decimal InputSessionPnLPct { get; set; } = 0.0m;

        // Commands
        public ICommand AddAccountCommand { get; }
        public ICommand SaveAccountCommand { get; }
        public ICommand DeleteAccountCommand { get; }
        public ICommand AssignSelectedCommand { get; }
        public ICommand UnassignSelectedCommand { get; }
        public ICommand SaveAssignmentsCommand { get; }
        public ICommand ApplyDefaultsCommand { get; }
        public ICommand ToggleStrategyCommand { get; }
        public ICommand AddToCartCommand { get; }
        public ICommand RemoveFromCartCommand { get; }
        public ICommand CheckoutCommand { get; }
        public ICommand RunBacktestCommand { get; }
        public ICommand SaveStrategyVersionCommand { get; }

        // Strategy Lab commands
        public ICommand GenerateStrategyWithAICommand { get; }
        public ICommand SaveStrategyCommand { get; }
        public ICommand OptimizeStrategyCommand { get; }
        public ICommand AddCreditsCommand { get; }

        public event PropertyChangedEventHandler? PropertyChanged;

        private async Task LoadDataAsync()
        {
            try
            {
                var accounts = await _accountService.GetAccountsAsync();
                var strategies = await _strategyService.GetStrategiesAsync();
                var catalog = await _storeService.GetCatalogAsync();
                var categories = await _storeService.GetCategoriesAsync();

                Accounts.Clear();
                AccountSwitcher.Clear();
                Strategies.Clear();
                StrategyCatalog.Clear();
                Categories.Clear();

                foreach (var account in accounts)
                {
                    Accounts.Add(account);
                    AccountSwitcher.Add(account);
                }

                foreach (var strategy in strategies)
                {
                    Strategies.Add(strategy);
                }

                foreach (var item in catalog)
                {
                    StrategyCatalog.Add(item);
                }

                foreach (var category in categories)
                {
                    Categories.Add(category);
                }

                // Select first account if available
                if (Accounts.Count > 0)
                {
                    SelectedAccount = Accounts.First();
                }

                // Update Control Center data
                await UpdateControlCenterDataAsync();
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load data: {ex.Message}");
            }
        }

        private void AddAccount()
        {
            if (Accounts.Count >= MAX_ACCOUNTS)
            {
                _toastService.ShowWarning($"Subscription limit reached: maximum {MAX_ACCOUNTS} accounts.");
                return;
            }

            EditingAccount = new Account
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"Account {Accounts.Count + 1}",
                Type = AccountType.Live,
                Broker = "Interactive Brokers",
                Balance = 100000,
                IsActive = true
            };

            ValidationMessage = string.Empty;
        }

        private async Task SaveAccountAsync()
        {
            if (string.IsNullOrWhiteSpace(EditingAccount.Name))
            {
                ValidationMessage = "Account name is required";
                return;
            }

            try
            {
                await _accountService.SaveAccountAsync(EditingAccount);

                var existingAccount = Accounts.FirstOrDefault(a => a.Id == EditingAccount.Id);
                if (existingAccount != null)
                {
                    var index = Accounts.IndexOf(existingAccount);
                    Accounts[index] = EditingAccount;

                    var switcherIndex = AccountSwitcher.IndexOf(existingAccount);
                    if (switcherIndex >= 0)
                        AccountSwitcher[switcherIndex] = EditingAccount;
                }
                else
                {
                    Accounts.Add(EditingAccount);
                    AccountSwitcher.Add(EditingAccount);
                }

                _toastService.ShowInfo("Account saved successfully");
                ValidationMessage = string.Empty;
                OnPropertyChanged(nameof(CanAddAccount));
                OnPropertyChanged(nameof(AccountLimitMessage));
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to save account: {ex.Message}");
            }
        }

        private async Task DeleteAccountAsync()
        {
            if (SelectedAccount == null) return;

            try
            {
                await _accountService.DeleteAccountAsync(SelectedAccount.Id);
                Accounts.Remove(SelectedAccount);
                AccountSwitcher.Remove(SelectedAccount);

                if (Accounts.Count > 0)
                    SelectedAccount = Accounts.First();
                else
                    SelectedAccount = null;

                _toastService.ShowInfo("Account deleted successfully");
                OnPropertyChanged(nameof(CanAddAccount));
                OnPropertyChanged(nameof(AccountLimitMessage));
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to delete account: {ex.Message}");
            }
        }

        private void AssignSelected()
        {
            if (SelectedAccount == null || Strategies.Count == 0) return;

            var strategy = Strategies.First();
            var assignment = new AccountStrategy
            {
                Id = Guid.NewGuid().ToString(),
                AccountId = SelectedAccount.Id,
                StrategyId = strategy.Id,
                StrategyName = strategy.Name,
                Enabled = true,
                MinContracts = 1,
                MaxContracts = 10,
                AllocationPct = 100
            };

            Assignments.Add(assignment);
        }

        private void UnassignSelected()
        {
            // Simplified - remove first assignment
            if (Assignments.Count > 0)
                Assignments.RemoveAt(0);
        }

        private async Task SaveAssignmentsAsync()
        {
            try
            {
                await _assignmentService.SaveAssignmentsAsync(SelectedAccount?.Id ?? "", Assignments.ToList());
                _toastService.ShowInfo("Assignments saved successfully");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to save assignments: {ex.Message}");
            }
        }

        private void ApplyDefaults()
        {
            foreach (var assignment in Assignments)
            {
                assignment.MinContracts = 1;
                assignment.MaxContracts = 10;
                assignment.AllocationPct = 100 / Assignments.Count;
            }
        }

        private void ToggleStrategy(AccountStrategy? assignment)
        {
            if (assignment != null)
            {
                assignment.Enabled = !assignment.Enabled;
            }
        }

        private async Task LoadAssignmentsForAccount(string accountId)
        {
            try
            {
                var assignments = await _assignmentService.GetAssignmentsAsync(accountId);
                Assignments.Clear();
                foreach (var assignment in assignments)
                {
                    Assignments.Add(assignment);
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load assignments: {ex.Message}");
            }
        }

        private async Task LoadRiskProfileForAccount(string accountId)
        {
            try
            {
                var profile = await _riskService.GetRiskProfileAsync(accountId);
                Risk.Profile = profile;
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load risk profile: {ex.Message}");
            }
        }

        private async Task LoadTradeHistoryForAccount(string accountId)
        {
            try
            {
                var history = await _tradeHistoryService.GetTradeHistoryAsync(accountId);
                TradeHistory.Clear();
                foreach (var trade in history)
                {
                    TradeHistory.Add(trade);
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load trade history: {ex.Message}");
            }
        }

        private async Task LoadPurchasesForAccount(string accountId)
        {
            try
            {
                var purchases = await _purchaseService.GetPurchasesAsync(accountId);
                Purchases.Clear();
                foreach (var purchase in purchases)
                {
                    Purchases.Add(purchase);
                }

                // Also load shopping cart and backtest results
                await LoadShoppingCartForAccount(accountId);
                await LoadBacktestResultsForAccount(accountId);
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load purchases: {ex.Message}");
            }
        }

        private async Task LoadShoppingCartForAccount(string accountId)
        {
            try
            {
                var cart = await _storeService.GetCartAsync(accountId);
                ShoppingCart.Clear();
                foreach (var item in cart.Items)
                {
                    ShoppingCart.Add(item);
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load shopping cart: {ex.Message}");
            }
        }

        private async Task AddToCartAsync(string? strategyId)
        {
            if (string.IsNullOrEmpty(strategyId) || SelectedAccount == null) return;

            try
            {
                await _storeService.AddToCartAsync(SelectedAccount.Id, strategyId);
                await LoadShoppingCartForAccount(SelectedAccount.Id);
                _toastService.ShowInfo("Strategy added to cart");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to add to cart: {ex.Message}");
            }
        }

        private async Task RemoveFromCartAsync(string? strategyId)
        {
            if (string.IsNullOrEmpty(strategyId) || SelectedAccount == null) return;

            try
            {
                await _storeService.RemoveFromCartAsync(SelectedAccount.Id, strategyId);
                await LoadShoppingCartForAccount(SelectedAccount.Id);
                _toastService.ShowInfo("Strategy removed from cart");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to remove from cart: {ex.Message}");
            }
        }

        private async Task CheckoutAsync()
        {
            if (SelectedAccount == null) return;

            try
            {
                var total = await _storeService.GetCartTotalAsync(SelectedAccount.Id);
                if (total <= 0)
                {
                    _toastService.ShowWarning("Cart is empty");
                    return;
                }

                await _storeService.CheckoutAsync(SelectedAccount.Id);
                await LoadPurchasesForAccount(SelectedAccount.Id);
                _toastService.ShowInfo($"Checkout successful! Total: ${total:F2}");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Checkout failed: {ex.Message}");
            }
        }

        private async Task LoadBacktestResultsForAccount(string accountId)
        {
            try
            {
                var results = await _backtestingService.GetBacktestResultsAsync(accountId);
                BacktestResults.Clear();
                foreach (var result in results)
                {
                    BacktestResults.Add(result);
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to load backtest results: {ex.Message}");
            }
        }

        private async Task RunBacktestAsync(BacktestRequest? request)
        {
            if (request == null || SelectedAccount == null) return;

            try
            {
                request.AccountId = SelectedAccount.Id;
                var result = await _backtestingService.RunBacktestAsync(request);

                // Add to results collection
                BacktestResults.Insert(0, result);
                _toastService.ShowInfo($"Backtest completed: {result.StrategyName}");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Backtest failed: {ex.Message}");
            }
        }

        private async Task SaveStrategyVersionAsync(StrategyVersion? version)
        {
            if (version == null) return;

            try
            {
                await _backtestingService.SaveStrategyVersionAsync(version);
                StrategyVersions.Insert(0, version);
                _toastService.ShowInfo($"Strategy version saved: {version.Name}");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to save strategy version: {ex.Message}");
            }
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private bool SetProperty<T>(ref T field, T value, string? propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName ?? nameof(value));
            return true;
        }

        private async Task UpdateControlCenterDataAsync()
        {
            try
            {
                // Update active accounts count
                ActiveAccountsCount = Accounts.Count(a => a.IsActive);
                OnPropertyChanged(nameof(ActiveAccountsDisplay));

                // Calculate total P&L across all accounts
                decimal totalPnL = 0;
                int totalVolume = 0;
                int totalTrades = 0;
                int winningTrades = 0;

                foreach (var account in Accounts.Where(a => a.IsActive))
                {
                    try
                    {
                        // Load positions for P&L calculation
                        var positions = await LoadPositionsForAccount(account.Id);
                        var accountPnL = positions.Sum(p => p.UnrealizedPnL + p.RealizedPnL);
                        totalPnL += accountPnL;

                        // Load trade history for volume and win rate
                        var trades = await _tradeHistoryService.GetTradeHistoryAsync(account.Id);
                        totalVolume += trades.Sum(t => t.Quantity);
                        totalTrades += trades.Count;
                        winningTrades += trades.Count(t => t.PnL > 0);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail the entire update
                        System.Diagnostics.Debug.WriteLine($"Failed to load data for account {account.Name}: {ex.Message}");
                    }
                }

                TotalPnL = totalPnL;
                TotalVolume = totalVolume;
                WinRate = totalTrades > 0 ? (decimal)winningTrades / totalTrades * 100 : 0;
                OnPropertyChanged(nameof(WinRateFormatted));

                // Update broker connection status
                await UpdateBrokerHealthAsync();
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to update Control Center data: {ex.Message}");
            }
        }

        private async Task<List<Position>> LoadPositionsForAccount(string accountId)
        {
            try
            {
                // This would typically call a position service
                // For now, return empty list - will be implemented with actual broker integration
                return new List<Position>();
            }
            catch
            {
                return new List<Position>();
            }
        }

        private async Task UpdateBrokerHealthAsync()
        {
            try
            {
                // Check broker connection status
                // This would typically ping the broker API or check connection status
                IsBrokerConnected = true; // Placeholder - implement actual check
                BrokerHealthText = IsBrokerConnected ? "Connected • Live Data Active" : "Disconnected";
            }
            catch
            {
                IsBrokerConnected = false;
                BrokerHealthText = "Connection Error";
            }
        }

        // Strategy Lab command implementations
        private async Task GenerateStrategyWithAIAsync()
        {
            if (AvailableCredits < 5.00m)
            {
                _toastService.ShowWarning("Insufficient credits. Add more credits to generate AI strategies.");
                return;
            }

            try
            {
                IsGeneratingStrategy = true;
                _toastService.ShowInfo("🤖 AI is generating your strategy...");

                // Deduct credits
                AvailableCredits -= 5.00m;
                OnPropertyChanged(nameof(AvailableCreditsFormatted));

                // Simulate AI generation (replace with actual AI service call)
                await Task.Delay(3000);

                GeneratedCode = GenerateAIStrategyCode();
                _toastService.ShowSuccess("✅ AI strategy generated successfully!");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to generate AI strategy: {ex.Message}");
                // Refund credits on error
                AvailableCredits += 5.00m;
                OnPropertyChanged(nameof(AvailableCreditsFormatted));
            }
            finally
            {
                IsGeneratingStrategy = false;
            }
        }

        private async Task SaveStrategyAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(StrategyName))
                {
                    _toastService.ShowWarning("Please enter a strategy name.");
                    return;
                }

                var strategy = new StrategyConfig
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = StrategyName,
                    Type = SelectedStrategyType,
                    Timeframe = SelectedTimeframe,
                    Code = GeneratedCode,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _strategyService.SaveStrategyAsync(strategy);
                Strategies.Add(strategy);

                _toastService.ShowSuccess($"Strategy '{StrategyName}' saved successfully!");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to save strategy: {ex.Message}");
            }
        }

        private async Task OptimizeStrategyAsync()
        {
            if (AvailableCredits < 2.50m)
            {
                _toastService.ShowWarning("Insufficient credits. Add more credits to optimize strategies.");
                return;
            }

            try
            {
                _toastService.ShowInfo("⚡ AI is optimizing your strategy...");

                // Deduct credits
                AvailableCredits -= 2.50m;
                OnPropertyChanged(nameof(AvailableCreditsFormatted));

                // Simulate optimization (replace with actual AI service call)
                await Task.Delay(2000);

                _toastService.ShowSuccess("✅ Strategy optimized successfully!");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Failed to optimize strategy: {ex.Message}");
                // Refund credits on error
                AvailableCredits += 2.50m;
                OnPropertyChanged(nameof(AvailableCreditsFormatted));
            }
        }

        private void AddCredits()
        {
            // This would typically open a credit purchase dialog
            _toastService.ShowInfo("Opening credit purchase dialog...");
            // For now, just add some credits for demo
            AvailableCredits += 100.00m;
            OnPropertyChanged(nameof(AvailableCreditsFormatted));
            _toastService.ShowSuccess("$100.00 in credits added!");
        }

        private string GenerateAIStrategyCode()
        {
            return $@"# Elite Trading ML - AI Generated Strategy
# Strategy: {StrategyName}
# Type: {SelectedStrategyType}
# Timeframe: {SelectedTimeframe}
# Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

class {StrategyName.Replace(" ", "")}Strategy:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.position = 0
        self.entry_price = 0
        self.stop_loss = 0.02  # 2%
        self.take_profit = 0.04  # 4%

    def calculate_features(self, data):
        # AI-generated technical indicators
        data['sma_20'] = data['close'].rolling(20).mean()
        data['sma_50'] = data['close'].rolling(50).mean()
        data['rsi'] = self.calculate_rsi(data['close'], 14)
        data['macd'] = self.calculate_macd(data['close'])
        data['bollinger_upper'] = data['sma_20'] + (data['close'].rolling(20).std() * 2)
        data['bollinger_lower'] = data['sma_20'] - (data['close'].rolling(20).std() * 2)

        # Advanced AI features for {SelectedStrategyType}
        data['price_momentum'] = data['close'].pct_change(5)
        data['volume_momentum'] = data['volume'].pct_change(5)
        data['volatility'] = data['close'].rolling(20).std()
        data['trend_strength'] = abs(data['sma_20'] - data['sma_50']) / data['sma_50']

        return data

    def generate_signal(self, features):
        # AI model prediction with high confidence threshold
        prediction = self.model.predict_proba(features.reshape(1, -1))[0]
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
            return f'BUY signal executed with {{confidence:.2%}} confidence'
        elif signal == 'SELL' and self.position >= 0:
            self.position = -1
            self.entry_price = price
            return f'SELL signal executed with {{confidence:.2%}} confidence'
        return 'No trade executed'

    def calculate_rsi(self, prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def calculate_macd(self, prices, fast=12, slow=26, signal=9):
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal).mean()
        return macd_line - signal_line

# AI Strategy Configuration
strategy_config = {{
    'name': '{StrategyName}',
    'type': '{SelectedStrategyType}',
    'timeframe': '{SelectedTimeframe}',
    'risk_level': 'MEDIUM',
    'max_position_size': 0.05,
    'stop_loss': 0.02,
    'take_profit': 0.04,
    'ai_model': 'GPT-4 Turbo',
    'confidence_threshold': 0.75,
    'generated_at': '{DateTime.Now:yyyy-MM-dd HH:mm:ss}'
}}

print('AI Strategy Generated Successfully!')
print(f'Strategy: {StrategyName}')
print(f'Type: {SelectedStrategyType}')
print(f'Timeframe: {SelectedTimeframe}')
print('Ready for backtesting and deployment!')";
        }
    }
}


