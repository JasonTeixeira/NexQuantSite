using System;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Extensions.Logging;
using QuantumTrader.Execution;

namespace QuantumTrader.Services
{
    public interface IRealTimeUpdateService
    {
        event Action OnPositionsUpdated;
        event Action OnOrdersUpdated;
        event Action OnPnLUpdated;
        event Action<string> OnStrategyStatusUpdated;

        void NotifyPositionsUpdated();
        void NotifyOrdersUpdated();
        void NotifyPnLUpdated();
        void NotifyStrategyStatusUpdated(string strategyName);

        Task StartAsync();
        Task StopAsync();
    }

    public class RealTimeUpdateService : IRealTimeUpdateService
    {
        private readonly ILogger<RealTimeUpdateService> _logger;
        private readonly IBrokerAdapter _brokerAdapter;
        private readonly IPnLCalculationService _pnlService;
        private readonly IStrategyExecutionService _strategyExecution;
        private System.Threading.Timer _updateTimer;
        private bool _isRunning;

        public event Action OnPositionsUpdated;
        public event Action OnOrdersUpdated;
        public event Action OnPnLUpdated;
        public event Action<string> OnStrategyStatusUpdated;

        public RealTimeUpdateService(
            ILogger<RealTimeUpdateService> logger,
            IBrokerAdapter brokerAdapter,
            IPnLCalculationService pnlService,
            IStrategyExecutionService strategyExecution)
        {
            _logger = logger;
            _brokerAdapter = brokerAdapter;
            _pnlService = pnlService;
            _strategyExecution = strategyExecution;
        }

        public Task StartAsync()
        {
            if (_isRunning) return Task.CompletedTask;

            _logger.LogInformation("Starting real-time update service");
            _isRunning = true;

            // Update every 2 seconds
            _updateTimer = new System.Threading.Timer(async _ => await UpdateAllData(),
                null, TimeSpan.Zero, TimeSpan.FromSeconds(2));

            return Task.CompletedTask;
        }

        public Task StopAsync()
        {
            if (!_isRunning) return Task.CompletedTask;

            _logger.LogInformation("Stopping real-time update service");
            _isRunning = false;
            _updateTimer?.Dispose();
            _updateTimer = null;

            return Task.CompletedTask;
        }

        private async Task UpdateAllData()
        {
            if (!_isRunning) return;

            try
            {
                // Update positions
                await UpdatePositions();

                // Update P&L
                await UpdatePnL();

                // Update strategy statuses
                UpdateStrategyStatuses();

                // Orders are updated via WebSocket events, but we can trigger a refresh
                NotifyOrdersUpdated();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during real-time update");
            }
        }

        private async Task UpdatePositions()
        {
            try
            {
                // Trigger position update notification
                NotifyPositionsUpdated();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error updating positions");
            }
        }

        private async Task UpdatePnL()
        {
            try
            {
                // Trigger P&L update notification
                NotifyPnLUpdated();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error updating P&L");
            }
        }

        private void UpdateStrategyStatuses()
        {
            try
            {
                var strategies = _strategyExecution.GetActiveStrategies();
                foreach (var strategy in strategies)
                {
                    NotifyStrategyStatusUpdated(strategy.Name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error updating strategy statuses");
            }
        }

        public void NotifyPositionsUpdated()
        {
            try
            {
                // Ensure we're on the UI thread
                if (Application.Current?.Dispatcher != null)
                {
                    Application.Current.Dispatcher.BeginInvoke(() => OnPositionsUpdated?.Invoke());
                }
                else
                {
                    OnPositionsUpdated?.Invoke();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error notifying positions updated");
            }
        }

        public void NotifyOrdersUpdated()
        {
            try
            {
                if (Application.Current?.Dispatcher != null)
                {
                    Application.Current.Dispatcher.BeginInvoke(() => OnOrdersUpdated?.Invoke());
                }
                else
                {
                    OnOrdersUpdated?.Invoke();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error notifying orders updated");
            }
        }

        public void NotifyPnLUpdated()
        {
            try
            {
                if (Application.Current?.Dispatcher != null)
                {
                    Application.Current.Dispatcher.BeginInvoke(() => OnPnLUpdated?.Invoke());
                }
                else
                {
                    OnPnLUpdated?.Invoke();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error notifying P&L updated");
            }
        }

        public void NotifyStrategyStatusUpdated(string strategyName)
        {
            try
            {
                if (Application.Current?.Dispatcher != null)
                {
                    Application.Current.Dispatcher.BeginInvoke(() => OnStrategyStatusUpdated?.Invoke(strategyName));
                }
                else
                {
                    OnStrategyStatusUpdated?.Invoke(strategyName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error notifying strategy status updated for {StrategyName}", strategyName);
            }
        }
    }
}
