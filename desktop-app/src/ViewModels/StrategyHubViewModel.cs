using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows.Input;
using QuantumTrader.Models;
using QuantumTrader.Services;
using QuantumTrader.Utils;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace QuantumTrader.ViewModels
{
    /// <summary>
    /// Ultra-Professional Strategy Hub ViewModel
    /// Institutional-grade strategy development interface
    /// </summary>
    public class StrategyHubViewModel : INotifyPropertyChanged
    {
        private readonly IStrategyHubService _strategyHubService;
        private readonly ILogger<StrategyHubViewModel> _logger;

        // UI State
        private string _selectedView = "Templates"; // Templates, Builder, Code, Backtest, Deploy
        private StrategyTemplate? _selectedTemplate;
        private StrategyWorkspace? _selectedWorkspace;
        private StrategyComponent? _selectedComponent;
        private bool _isBuilderMode = false;
        private bool _isCodeMode = false;
        private bool _isBacktesting = false;
        private string _searchFilter = string.Empty;
        private string _categoryFilter = "All";

        // Backtest Parameters
        private DateTime _backtestStartDate = DateTime.Now.AddMonths(-6);
        private DateTime _backtestEndDate = DateTime.Now;
        private decimal _backtestCapital = 100000m;

        public StrategyHubViewModel(IStrategyHubService strategyHubService, ILogger<StrategyHubViewModel> logger)
        {
            _strategyHubService = strategyHubService;
            _logger = logger;

            // Initialize commands
            CreateNewStrategyCommand = new DelegateCommand(param => ExecuteCreateNewStrategy(param as StrategyTemplate));
            OpenStrategyCommand = new DelegateCommand(_ => ExecuteOpenStrategy());
            SaveStrategyCommand = new DelegateCommand(_ => ExecuteSaveStrategy(), _ => CanExecuteSaveStrategy());
            CompileStrategyCommand = new DelegateCommand(_ => ExecuteCompileStrategy(), _ => CanExecuteCompileStrategy());
            RunBacktestCommand = new DelegateCommand(_ => ExecuteRunBacktest(), _ => CanExecuteRunBacktest());
            DeployStrategyCommand = new DelegateCommand(_ => ExecuteDeployStrategy(), _ => CanExecuteDeployStrategy());

            // View commands
            ShowTemplatesCommand = new DelegateCommand(_ => SelectedView = "Templates");
            ShowBuilderCommand = new DelegateCommand(_ => SelectedView = "Builder");
            ShowCodeEditorCommand = new DelegateCommand(_ => SelectedView = "Code");
            ShowBacktestCommand = new DelegateCommand(_ => SelectedView = "Backtest");
            ShowDeployCommand = new DelegateCommand(_ => SelectedView = "Deploy");

            // Component library commands
            AddComponentCommand = new DelegateCommand(param => ExecuteAddComponent(param as StrategyComponent));

            // Initialize filter categories
            FilterCategories = new ObservableCollection<string>
            {
                "All", "Scalping", "Day Trading", "Swing Trading", "Position Trading",
                "Mean Reversion", "Momentum", "Breakout", "Grid Trading", "Event Trading"
            };

            // Subscribe to service events
            _strategyHubService.PropertyChanged += OnStrategyHubServicePropertyChanged;
        }

        #region Properties

        public ObservableCollection<StrategyTemplate> StrategyTemplates => _strategyHubService.StrategyTemplates;
        public ObservableCollection<StrategyWorkspace> OpenWorkspaces => _strategyHubService.OpenWorkspaces;
        public ObservableCollection<StrategyComponent> ComponentLibrary => _strategyHubService.ComponentLibrary;
        public ObservableCollection<string> FilterCategories { get; }

        public StrategyWorkspace? ActiveWorkspace => _strategyHubService.ActiveWorkspace;

        public string SelectedView
        {
            get => _selectedView;
            set
            {
                _selectedView = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsTemplatesView));
                OnPropertyChanged(nameof(IsBuilderView));
                OnPropertyChanged(nameof(IsCodeView));
                OnPropertyChanged(nameof(IsBacktestView));
                OnPropertyChanged(nameof(IsDeployView));
            }
        }

        // View state properties
        public bool IsTemplatesView => SelectedView == "Templates";
        public bool IsBuilderView => SelectedView == "Builder";
        public bool IsCodeView => SelectedView == "Code";
        public bool IsBacktestView => SelectedView == "Backtest";
        public bool IsDeployView => SelectedView == "Deploy";

        public StrategyTemplate? SelectedTemplate
        {
            get => _selectedTemplate;
            set
            {
                _selectedTemplate = value;
                OnPropertyChanged();
            }
        }

        public StrategyWorkspace? SelectedWorkspace
        {
            get => _selectedWorkspace;
            set
            {
                _selectedWorkspace = value;
                OnPropertyChanged();
                if (value != null)
                {
                    _strategyHubService.ActiveWorkspace = value;
                }
            }
        }

        public StrategyComponent? SelectedComponent
        {
            get => _selectedComponent;
            set
            {
                _selectedComponent = value;
                OnPropertyChanged();
            }
        }

        public string SearchFilter
        {
            get => _searchFilter;
            set
            {
                _searchFilter = value;
                OnPropertyChanged();
                FilterTemplates();
            }
        }

        public string CategoryFilter
        {
            get => _categoryFilter;
            set
            {
                _categoryFilter = value;
                OnPropertyChanged();
                FilterTemplates();
            }
        }

        // Filtered collections
        private ObservableCollection<StrategyTemplate> _filteredTemplates = new();
        public ObservableCollection<StrategyTemplate> FilteredTemplates
        {
            get => _filteredTemplates;
            private set
            {
                _filteredTemplates = value;
                OnPropertyChanged();
            }
        }

        // Backtest properties
        public DateTime BacktestStartDate
        {
            get => _backtestStartDate;
            set
            {
                _backtestStartDate = value;
                OnPropertyChanged();
            }
        }

        public DateTime BacktestEndDate
        {
            get => _backtestEndDate;
            set
            {
                _backtestEndDate = value;
                OnPropertyChanged();
            }
        }

        public decimal BacktestCapital
        {
            get => _backtestCapital;
            set
            {
                _backtestCapital = value;
                OnPropertyChanged();
            }
        }

        public bool IsBacktesting => _strategyHubService.IsBacktesting;

        public BacktestResult? LastBacktestResult => ActiveWorkspace?.BacktestResult;

        #endregion

        #region Commands

        public ICommand CreateNewStrategyCommand { get; }
        public ICommand OpenStrategyCommand { get; }
        public ICommand SaveStrategyCommand { get; }
        public ICommand CompileStrategyCommand { get; }
        public ICommand RunBacktestCommand { get; }
        public ICommand DeployStrategyCommand { get; }

        public ICommand ShowTemplatesCommand { get; }
        public ICommand ShowBuilderCommand { get; }
        public ICommand ShowCodeEditorCommand { get; }
        public ICommand ShowBacktestCommand { get; }
        public ICommand ShowDeployCommand { get; }

        public ICommand AddComponentCommand { get; }

        #endregion

        #region Command Implementations

        private async void ExecuteCreateNewStrategy(StrategyTemplate? template)
        {
            try
            {
                var strategyName = template?.Name ?? "New Strategy";
                var workspace = await _strategyHubService.CreateNewStrategyAsync(strategyName, template);

                SelectedWorkspace = workspace;
                SelectedView = template != null ? "Builder" : "Templates";

                _logger.LogInformation($"Created new strategy: {strategyName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new strategy");
            }
        }

        private void ExecuteOpenStrategy()
        {
            try
            {
                // TODO: Implement file dialog for opening strategy files
                _logger.LogInformation("Open strategy dialog");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to open strategy");
            }
        }

        private async void ExecuteSaveStrategy()
        {
            if (ActiveWorkspace == null) return;

            try
            {
                await _strategyHubService.SaveStrategyAsync(ActiveWorkspace);
                _logger.LogInformation($"Saved strategy: {ActiveWorkspace.Name}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save strategy");
            }
        }

        private bool CanExecuteSaveStrategy()
        {
            return ActiveWorkspace != null && !ActiveWorkspace.IsSaved;
        }

        private async void ExecuteCompileStrategy()
        {
            if (ActiveWorkspace == null) return;

            try
            {
                // Generate code from visual components
                await _strategyHubService.GenerateCodeFromVisualAsync(ActiveWorkspace);

                // Compile the strategy
                var success = await _strategyHubService.CompileStrategyAsync(ActiveWorkspace);

                if (success)
                {
                    _logger.LogInformation($"Strategy compiled successfully: {ActiveWorkspace.Name}");
                }
                else
                {
                    _logger.LogWarning($"Strategy compilation failed: {ActiveWorkspace.Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to compile strategy");
            }
        }

        private bool CanExecuteCompileStrategy()
        {
            return ActiveWorkspace != null && !IsBacktesting;
        }

        private async void ExecuteRunBacktest()
        {
            if (ActiveWorkspace == null) return;

            try
            {
                _logger.LogInformation($"Starting backtest for {ActiveWorkspace.Name}");

                var result = await _strategyHubService.RunBacktestAsync(
                    ActiveWorkspace,
                    BacktestStartDate,
                    BacktestEndDate);

                OnPropertyChanged(nameof(LastBacktestResult));
                SelectedView = "Backtest";

                _logger.LogInformation($"Backtest completed: {result.TotalReturnPercent:F2}% return");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to run backtest");
            }
        }

        private bool CanExecuteRunBacktest()
        {
            return ActiveWorkspace != null && ActiveWorkspace.IsCompiled && !IsBacktesting;
        }

        private async void ExecuteDeployStrategy()
        {
            if (ActiveWorkspace == null) return;

            try
            {
                // TODO: Show account selection dialog
                var accountId = "demo_account_001";

                var success = await _strategyHubService.DeployStrategyAsync(ActiveWorkspace, accountId);

                if (success)
                {
                    _logger.LogInformation($"Strategy deployed successfully: {ActiveWorkspace.Name}");
                }
                else
                {
                    _logger.LogWarning($"Strategy deployment failed: {ActiveWorkspace.Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deploy strategy");
            }
        }

        private bool CanExecuteDeployStrategy()
        {
            return ActiveWorkspace != null &&
                   ActiveWorkspace.IsCompiled &&
                   LastBacktestResult != null &&
                   !IsBacktesting;
        }

        private void ExecuteAddComponent(StrategyComponent? component)
        {
            if (component == null || ActiveWorkspace == null) return;

            try
            {
                // Add component to center of canvas
                var random = new Random();
                var x = 200 + random.Next(-50, 50);
                var y = 200 + random.Next(-50, 50);

                _strategyHubService.AddComponentToWorkspace(component, x, y);

                _logger.LogDebug($"Added component {component.Name} to workspace");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add component");
            }
        }

        #endregion

        #region Helper Methods

        private void FilterTemplates()
        {
            var filtered = StrategyTemplates.AsEnumerable();

            // Apply category filter
            if (CategoryFilter != "All")
            {
                filtered = filtered.Where(t => t.Category.Equals(CategoryFilter, StringComparison.OrdinalIgnoreCase) ||
                                             t.TradingStyle.Equals(CategoryFilter, StringComparison.OrdinalIgnoreCase));
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(SearchFilter))
            {
                filtered = filtered.Where(t =>
                    t.Name.Contains(SearchFilter, StringComparison.OrdinalIgnoreCase) ||
                    t.Description.Contains(SearchFilter, StringComparison.OrdinalIgnoreCase) ||
                    t.Author.Contains(SearchFilter, StringComparison.OrdinalIgnoreCase));
            }

            FilteredTemplates = new ObservableCollection<StrategyTemplate>(filtered.OrderByDescending(t => t.Rating));
        }

        private void OnStrategyHubServicePropertyChanged(object? sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(IStrategyHubService.IsBacktesting))
            {
                OnPropertyChanged(nameof(IsBacktesting));

                // Update command can-execute states
                ((DelegateCommand)CompileStrategyCommand).RaiseCanExecuteChanged();
                ((DelegateCommand)RunBacktestCommand).RaiseCanExecuteChanged();
                ((DelegateCommand)DeployStrategyCommand).RaiseCanExecuteChanged();
            }
            else if (e.PropertyName == nameof(IStrategyHubService.ActiveWorkspace))
            {
                OnPropertyChanged(nameof(ActiveWorkspace));
                OnPropertyChanged(nameof(LastBacktestResult));
            }
        }

        #endregion

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
