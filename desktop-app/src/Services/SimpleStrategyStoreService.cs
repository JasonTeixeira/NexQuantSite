using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Threading.Tasks;
using QuantumTrader.Models;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.Services
{
    /// <summary>
    /// Simple Strategy Store Service Implementation
    /// </summary>
    public class SimpleStrategyStoreService : IStrategyStoreService, INotifyPropertyChanged
    {
        private readonly ILogger<SimpleStrategyStoreService> _logger;
        private bool _isLoading;

        public SimpleStrategyStoreService(ILogger<SimpleStrategyStoreService> logger)
        {
            _logger = logger;
            FeaturedStrategies = new ObservableCollection<StrategyStoreItem>();
            Categories = new ObservableCollection<StrategyStoreCategory>();
            _ = InitializeAsync();
        }

        public ObservableCollection<StrategyStoreItem> FeaturedStrategies { get; }
        public ObservableCollection<StrategyStoreCategory> Categories { get; }

        public bool IsLoading
        {
            get => _isLoading;
            private set { _isLoading = value; OnPropertyChanged(); }
        }

        private async Task InitializeAsync()
        {
            await LoadCategoriesAsync();
            await LoadFeaturedStrategiesAsync();
        }

        public async Task LoadCategoriesAsync()
        {
            await Task.Run(() =>
            {
                Categories.Clear();
                Categories.Add(new StrategyStoreCategory { Name = "🔥 Featured", Description = "Top strategies", StrategyCount = 12 });
                Categories.Add(new StrategyStoreCategory { Name = "⚡ Scalping", Description = "Fast trading", StrategyCount = 23 });
                Categories.Add(new StrategyStoreCategory { Name = "📈 Day Trading", Description = "Intraday strategies", StrategyCount = 45 });
                Categories.Add(new StrategyStoreCategory { Name = "🤖 AI/ML", Description = "AI strategies", StrategyCount = 18 });
            });
        }

        public async Task LoadFeaturedStrategiesAsync()
        {
            IsLoading = true;
            try
            {
                await Task.Run(() =>
                {
                    FeaturedStrategies.Clear();
                    FeaturedStrategies.Add(new StrategyStoreItem
                    {
                        Name = "Quantum Momentum Pro",
                        Description = "AI-powered momentum strategy",
                        Author = "QuantumTrader Elite",
                        Price = 899.99m,
                        IsFree = false,
                        Rating = 4.9m,
                        ReviewCount = 247,
                        Downloads = 1834,
                        Category = "🤖 AI/ML",
                        Complexity = "Expert",
                        BacktestReturn = 67.8m,
                        LiveReturn = 52.3m,
                        SharpeRatio = 3.45,
                        WinRate = 74.5,
                        IsVerified = true,
                        IsFeatured = true,
                        IsBestseller = true
                    });
                    
                    FeaturedStrategies.Add(new StrategyStoreItem
                    {
                        Name = "Neural Scalper Elite",
                        Description = "Ultra-fast neural network scalping",
                        Author = "DeepTrading Labs",
                        Price = 1299.99m,
                        IsFree = false,
                        Rating = 4.8m,
                        ReviewCount = 189,
                        Downloads = 923,
                        Category = "⚡ Scalping",
                        Complexity = "Expert",
                        BacktestReturn = 125.4m,
                        LiveReturn = 89.6m,
                        SharpeRatio = 4.23,
                        WinRate = 82.3,
                        IsVerified = true,
                        IsFeatured = true
                    });
                    
                    FeaturedStrategies.Add(new StrategyStoreItem
                    {
                        Name = "Free Trend Follower",
                        Description = "Simple trend following strategy",
                        Author = "Community",
                        Price = 0m,
                        IsFree = true,
                        Rating = 4.2m,
                        ReviewCount = 89,
                        Downloads = 5623,
                        Category = "📈 Day Trading",
                        Complexity = "Beginner",
                        BacktestReturn = 18.7m,
                        LiveReturn = 15.3m,
                        SharpeRatio = 1.67,
                        WinRate = 61.2,
                        IsVerified = true,
                        IsNew = true
                    });
                });
            }
            finally
            {
                IsLoading = false;
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
