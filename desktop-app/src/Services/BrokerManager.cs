using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;
using System.Linq;

namespace QuantumTrader.Services
{
    /// <summary>
    /// Nexural Trading Broker Manager
    /// Manages multiple broker connections and provides dynamic switching
    /// </summary>
    public interface IBrokerManager
    {
        Task<IBrokerAdapter> GetCurrentBrokerAsync();
        Task<bool> SetCurrentBrokerAsync(string brokerName);
        Task<IReadOnlyList<BrokerInfo>> GetAvailableBrokersAsync();
        Task<Dictionary<string, bool>> CheckBrokerHealthAsync();
        string CurrentBrokerName { get; }
    }

    public class BrokerManager : IBrokerManager
    {
        private readonly ILogger<BrokerManager> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _config;
        
        private string _currentBrokerName;
        private IBrokerAdapter? _currentBroker;

        private readonly Dictionary<string, Type> _availableBrokers = new()
        {
            { "Alpaca", typeof(AlpacaAdapter) },
            { "NinjaTrader", typeof(NinjaTraderAdapter) },
            { "InteractiveBrokers", typeof(InteractiveBrokersAdapter) },
            { "Tradovate", typeof(TradovateAdapter) }
        };

        public string CurrentBrokerName => _currentBrokerName;

        public BrokerManager(ILogger<BrokerManager> logger, IServiceProvider serviceProvider, IConfiguration config)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _config = config;
            
            // Initialize with default broker from configuration
            _currentBrokerName = _config["Brokers:DefaultBroker"] ?? "NinjaTrader";
        }

        public async Task<IBrokerAdapter> GetCurrentBrokerAsync()
        {
            if (_currentBroker == null)
            {
                await SetCurrentBrokerAsync(_currentBrokerName);
            }

            return _currentBroker ?? throw new InvalidOperationException("No broker adapter available");
        }

        public async Task<bool> SetCurrentBrokerAsync(string brokerName)
        {
            try
            {
                if (!_availableBrokers.ContainsKey(brokerName))
                {
                    _logger.LogError("❌ Unknown broker: {BrokerName}", brokerName);
                    return false;
                }

                _logger.LogInformation("🔄 Switching to broker: {BrokerName}", brokerName);

                // Create new broker adapter instance
                var brokerType = _availableBrokers[brokerName];
                var newBroker = (IBrokerAdapter)_serviceProvider.GetRequiredService(brokerType);

                // Test connection before switching
                if (await newBroker.IsHealthyAsync())
                {
                    _currentBroker = newBroker;
                    _currentBrokerName = brokerName;
                    
                    _logger.LogInformation("✅ Successfully switched to {BrokerName}", brokerName);
                    return true;
                }
                else
                {
                    _logger.LogWarning("⚠️ Broker {BrokerName} is not healthy, switch cancelled", brokerName);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to switch to broker: {BrokerName}", brokerName);
                return false;
            }
        }

        public async Task<IReadOnlyList<BrokerInfo>> GetAvailableBrokersAsync()
        {
            var brokerInfos = new List<BrokerInfo>();

            foreach (var kvp in _availableBrokers)
            {
                try
                {
                    var brokerType = kvp.Value;
                    var broker = (IBrokerAdapter)_serviceProvider.GetRequiredService(brokerType);
                    var isHealthy = await broker.IsHealthyAsync();

                    brokerInfos.Add(new BrokerInfo
                    {
                        Name = kvp.Key,
                        DisplayName = GetDisplayName(kvp.Key),
                        IsHealthy = isHealthy,
                        IsCurrent = kvp.Key == _currentBrokerName,
                        Description = GetDescription(kvp.Key),
                        SupportedAssets = GetSupportedAssets(kvp.Key)
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error checking broker {BrokerName}", kvp.Key);
                    brokerInfos.Add(new BrokerInfo
                    {
                        Name = kvp.Key,
                        DisplayName = GetDisplayName(kvp.Key),
                        IsHealthy = false,
                        IsCurrent = false,
                        Description = $"Error: {ex.Message}",
                        SupportedAssets = new List<string>()
                    });
                }
            }

            return brokerInfos.OrderBy(b => b.DisplayName).ToList();
        }

        public async Task<Dictionary<string, bool>> CheckBrokerHealthAsync()
        {
            var healthStatus = new Dictionary<string, bool>();

            foreach (var kvp in _availableBrokers)
            {
                try
                {
                    var brokerType = kvp.Value;
                    var broker = (IBrokerAdapter)_serviceProvider.GetRequiredService(brokerType);
                    var isHealthy = await broker.IsHealthyAsync();
                    healthStatus[kvp.Key] = isHealthy;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Health check failed for {BrokerName}", kvp.Key);
                    healthStatus[kvp.Key] = false;
                }
            }

            return healthStatus;
        }

        private string GetDisplayName(string brokerName) => brokerName switch
        {
            "Alpaca" => "Alpaca Markets",
            "NinjaTrader" => "NinjaTrader 8",
            "InteractiveBrokers" => "Interactive Brokers",
            "Tradovate" => "Tradovate",
            _ => brokerName
        };

        private string GetDescription(string brokerName) => brokerName switch
        {
            "Alpaca" => "Commission-free stock & crypto trading",
            "NinjaTrader" => "Professional futures & forex trading",
            "InteractiveBrokers" => "Global multi-asset trading platform",
            "Tradovate" => "Cloud-based futures trading",
            _ => "Professional trading broker"
        };

        private IReadOnlyList<string> GetSupportedAssets(string brokerName) => brokerName switch
        {
            "Alpaca" => new List<string> { "Stocks", "Crypto", "Options" },
            "NinjaTrader" => new List<string> { "Futures", "Forex", "CFDs" },
            "InteractiveBrokers" => new List<string> { "Stocks", "Options", "Futures", "Forex", "Bonds" },
            "Tradovate" => new List<string> { "Futures" },
            _ => new List<string>()
        };
    }

    /// <summary>
    /// Information about an available broker
    /// </summary>
    public class BrokerInfo
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool IsHealthy { get; set; }
        public bool IsCurrent { get; set; }
        public string Description { get; set; } = string.Empty;
        public IReadOnlyList<string> SupportedAssets { get; set; } = new List<string>();
    }
}







