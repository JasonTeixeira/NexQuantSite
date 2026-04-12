using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;

namespace QuantumTrader.Services
{
    /// <summary>
    /// Nexural Trading Broker Connection Tester
    /// Tests all broker integrations and provides health status
    /// </summary>
    public interface IBrokerConnectionTester
    {
        Task<BrokerTestResults> TestAllBrokersAsync();
        Task<BrokerTestResult> TestSpecificBrokerAsync(string brokerName);
    }

    public class BrokerConnectionTester : IBrokerConnectionTester
    {
        private readonly IBrokerManager _brokerManager;
        private readonly ILogger<BrokerConnectionTester> _logger;

        public BrokerConnectionTester(IBrokerManager brokerManager, ILogger<BrokerConnectionTester> logger)
        {
            _brokerManager = brokerManager;
            _logger = logger;
        }

        public async Task<BrokerTestResults> TestAllBrokersAsync()
        {
            _logger.LogInformation("🧪 Starting comprehensive broker connection tests...");

            var results = new BrokerTestResults();
            var brokers = await _brokerManager.GetAvailableBrokersAsync();

            foreach (var broker in brokers)
            {
                try
                {
                    var testResult = await TestSpecificBrokerAsync(broker.Name);
                    results.BrokerResults.Add(testResult);

                    if (testResult.IsHealthy)
                        results.HealthyCount++;
                    else
                        results.UnhealthyCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error testing broker {BrokerName}", broker.Name);
                    results.BrokerResults.Add(new BrokerTestResult
                    {
                        BrokerName = broker.Name,
                        IsHealthy = false,
                        ErrorMessage = ex.Message,
                        TestDurationMs = 0,
                        TestedFeatures = new List<string>()
                    });
                    results.UnhealthyCount++;
                }
            }

            results.TotalBrokers = results.BrokerResults.Count;

            _logger.LogInformation("✅ Broker tests completed: {Healthy}/{Total} healthy",
                results.HealthyCount, results.TotalBrokers);

            return results;
        }

        public async Task<BrokerTestResult> TestSpecificBrokerAsync(string brokerName)
        {
            var startTime = DateTime.UtcNow;
            var result = new BrokerTestResult { BrokerName = brokerName };

            try
            {
                _logger.LogInformation("🔍 Testing broker: {BrokerName}", brokerName);

                // Switch to the specific broker
                var switchSuccess = await _brokerManager.SetCurrentBrokerAsync(brokerName);
                if (!switchSuccess)
                {
                    result.ErrorMessage = "Failed to switch to broker";
                    return result;
                }

                var broker = await _brokerManager.GetCurrentBrokerAsync();

                // Test 1: Health Check
                result.TestedFeatures.Add("Health Check");
                var isHealthy = await broker.IsHealthyAsync();
                if (!isHealthy)
                {
                    result.ErrorMessage = "Health check failed";
                    return result;
                }

                // Test 2: Get Positions
                result.TestedFeatures.Add("Get Positions");
                var positions = await broker.GetPositionsAsync();
                _logger.LogInformation("📊 {BrokerName} returned {Count} positions", brokerName, positions.Count);

                // Test 3: Get Recent Orders
                result.TestedFeatures.Add("Get Recent Orders");
                var orders = await broker.GetRecentOrdersAsync(10);
                _logger.LogInformation("📋 {BrokerName} returned {Count} recent orders", brokerName, orders.Count);

                // Test 4: Get Recent Fills
                result.TestedFeatures.Add("Get Recent Fills");
                var fills = await broker.GetRecentFillsAsync(10);
                _logger.LogInformation("💰 {BrokerName} returned {Count} recent fills", brokerName, fills.Count);

                result.IsHealthy = true;
                result.TestDurationMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _logger.LogInformation("✅ {BrokerName} test passed in {Duration}ms", brokerName, result.TestDurationMs);
            }
            catch (Exception ex)
            {
                result.ErrorMessage = ex.Message;
                result.TestDurationMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogError(ex, "❌ {BrokerName} test failed", brokerName);
            }

            return result;
        }
    }

    /// <summary>
    /// Results from testing all brokers
    /// </summary>
    public class BrokerTestResults
    {
        public List<BrokerTestResult> BrokerResults { get; } = new();
        public int TotalBrokers { get; set; }
        public int HealthyCount { get; set; }
        public int UnhealthyCount { get; set; }
        public double HealthPercentage => TotalBrokers > 0 ? (double)HealthyCount / TotalBrokers * 100 : 0;
    }

    /// <summary>
    /// Result from testing a specific broker
    /// </summary>
    public class BrokerTestResult
    {
        public string BrokerName { get; set; } = string.Empty;
        public bool IsHealthy { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public int TestDurationMs { get; set; }
        public List<string> TestedFeatures { get; set; } = new();
    }
}







