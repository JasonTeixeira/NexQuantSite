using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class StrategyStoreService
    {
        private readonly IRepository<StrategyCatalog> _catalogRepository;
        private readonly IRepository<ShoppingCart> _cartRepository;
        private readonly StrategyPurchaseService _purchaseService;

        public StrategyStoreService(StrategyPurchaseService purchaseService)
        {
            _catalogRepository = new JsonRepository<StrategyCatalog>("strategy_catalog.json");
            _cartRepository = new JsonRepository<ShoppingCart>("shopping_cart.json");
            _purchaseService = purchaseService;
            
            // Initialize sample catalog if empty
            _ = InitializeSampleCatalog();
        }

        public async Task<List<StrategyCatalog>> GetCatalogAsync(string? category = null, string? searchTerm = null)
        {
            var catalog = await _catalogRepository.GetAllAsync();
            var filtered = catalog.Where(s => s.IsActive);

            if (!string.IsNullOrEmpty(category))
                filtered = filtered.Where(s => s.Category.Equals(category, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(searchTerm))
                filtered = filtered.Where(s => 
                    s.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    s.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    s.Tags.Any(t => t.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));

            return filtered.OrderByDescending(s => s.Rating).ToList();
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            var catalog = await _catalogRepository.GetAllAsync();
            return catalog.Where(s => s.IsActive)
                         .Select(s => s.Category)
                         .Distinct()
                         .OrderBy(c => c)
                         .ToList();
        }

        public async Task<ShoppingCart> GetCartAsync(string accountId)
        {
            var carts = await _cartRepository.GetAllAsync();
            var cart = carts.FirstOrDefault(c => c.AccountId == accountId);
            
            if (cart == null)
            {
                cart = new ShoppingCart { AccountId = accountId };
                await _cartRepository.SaveAsync(cart);
            }
            
            return cart;
        }

        public async Task AddToCartAsync(string accountId, string strategyId)
        {
            var catalog = await _catalogRepository.GetAllAsync();
            var strategy = catalog.FirstOrDefault(s => s.Id == strategyId);
            
            if (strategy == null)
                throw new ArgumentException("Strategy not found");

            var cart = await GetCartAsync(accountId);
            
            // Check if already in cart
            if (cart.Items.Any(i => i.StrategyId == strategyId))
                return;

            cart.Items.Add(new CartItem
            {
                StrategyId = strategy.Id,
                StrategyName = strategy.Name,
                Price = strategy.Price
            });
            
            cart.UpdatedDate = DateTime.Now;
            await _cartRepository.SaveAsync(cart);
        }

        public async Task RemoveFromCartAsync(string accountId, string strategyId)
        {
            var cart = await GetCartAsync(accountId);
            var item = cart.Items.FirstOrDefault(i => i.StrategyId == strategyId);
            
            if (item != null)
            {
                cart.Items.Remove(item);
                cart.UpdatedDate = DateTime.Now;
                await _cartRepository.SaveAsync(cart);
            }
        }

        public async Task<decimal> GetCartTotalAsync(string accountId)
        {
            var cart = await GetCartAsync(accountId);
            return cart.Items.Sum(i => i.Price);
        }

        public async Task CheckoutAsync(string accountId)
        {
            var cart = await GetCartAsync(accountId);
            
            if (cart.Items.Count == 0)
                throw new InvalidOperationException("Cart is empty");

            // Process each item in cart
            foreach (var item in cart.Items)
            {
                var purchase = new StrategyPurchase
                {
                    StrategyId = item.StrategyId,
                    StrategyName = item.StrategyName,
                    AccountId = accountId,
                    Price = item.Price,
                    ExpiryDate = DateTime.Now.AddYears(1), // 1 year license
                    IsActive = true
                };
                
                await _purchaseService.SavePurchaseAsync(purchase);
            }

            // Clear cart
            cart.Items.Clear();
            cart.UpdatedDate = DateTime.Now;
            await _cartRepository.SaveAsync(cart);
        }

        private async Task InitializeSampleCatalog()
        {
            var catalog = await _catalogRepository.GetAllAsync();
            if (catalog.Count > 0) return; // Already initialized

            var sampleStrategies = new List<StrategyCatalog>
            {
                new StrategyCatalog
                {
                    Name = "Momentum Breakout Pro",
                    Description = "Advanced momentum-based breakout strategy with dynamic position sizing",
                    Category = "Momentum",
                    Author = "QuantMaster",
                    Price = 299.99m,
                    Rating = 4.8,
                    Downloads = 1247,
                    Tags = new List<string> { "momentum", "breakout", "scalping", "futures" },
                    Performance = new StrategyPerformance
                    {
                        SharpeRatio = 2.1,
                        MaxDrawdown = 8.5,
                        WinRate = 0.68,
                        ProfitFactor = 1.85,
                        TotalReturn = 156.7m,
                        TotalTrades = 1247
                    }
                },
                new StrategyCatalog
                {
                    Name = "Mean Reversion Gold",
                    Description = "Statistical arbitrage strategy for mean reversion opportunities",
                    Category = "Mean Reversion",
                    Author = "StatTrader",
                    Price = 199.99m,
                    Rating = 4.6,
                    Downloads = 892,
                    Tags = new List<string> { "mean-reversion", "statistical", "arbitrage", "equities" },
                    Performance = new StrategyPerformance
                    {
                        SharpeRatio = 1.9,
                        MaxDrawdown = 12.3,
                        WinRate = 0.72,
                        ProfitFactor = 1.65,
                        TotalReturn = 98.4m,
                        TotalTrades = 892
                    }
                },
                new StrategyCatalog
                {
                    Name = "Volatility Harvest",
                    Description = "Volatility-based strategy for capturing market inefficiencies",
                    Category = "Volatility",
                    Author = "VolTrader",
                    Price = 399.99m,
                    Rating = 4.9,
                    Downloads = 567,
                    Tags = new List<string> { "volatility", "options", "hedging", "advanced" },
                    Performance = new StrategyPerformance
                    {
                        SharpeRatio = 2.4,
                        MaxDrawdown = 6.8,
                        WinRate = 0.75,
                        ProfitFactor = 2.1,
                        TotalReturn = 234.1m,
                        TotalTrades = 567
                    }
                },
                new StrategyCatalog
                {
                    Name = "Trend Following Elite",
                    Description = "Multi-timeframe trend following strategy with risk management",
                    Category = "Trend Following",
                    Author = "TrendMaster",
                    Price = 249.99m,
                    Rating = 4.7,
                    Downloads = 1034,
                    Tags = new List<string> { "trend", "multi-timeframe", "futures", "forex" },
                    Performance = new StrategyPerformance
                    {
                        SharpeRatio = 1.8,
                        MaxDrawdown = 15.2,
                        WinRate = 0.65,
                        ProfitFactor = 1.45,
                        TotalReturn = 187.3m,
                        TotalTrades = 1034
                    }
                },
                new StrategyCatalog
                {
                    Name = "Scalping Lightning",
                    Description = "Ultra-fast scalping strategy for high-frequency trading",
                    Category = "Scalping",
                    Author = "SpeedTrader",
                    Price = 149.99m,
                    Rating = 4.5,
                    Downloads = 756,
                    Tags = new List<string> { "scalping", "high-frequency", "micro-trades", "futures" },
                    Performance = new StrategyPerformance
                    {
                        SharpeRatio = 1.6,
                        MaxDrawdown = 9.1,
                        WinRate = 0.58,
                        ProfitFactor = 1.35,
                        TotalReturn = 67.8m,
                        TotalTrades = 756
                    }
                }
            };

            foreach (var strategy in sampleStrategies)
            {
                await _catalogRepository.SaveAsync(strategy);
            }
        }
    }
}
