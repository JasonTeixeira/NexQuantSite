using System.Windows.Controls;
using QuantumTrader.Services;

namespace QuantumTrader.Views
{
    /// <summary>
    /// Ultra-Professional Strategy Hub View
    /// Advanced strategy development and backtesting interface
    /// </summary>
    public partial class StrategyHubView : UserControl
    {
        public StrategyHubView()
        {
            InitializeComponent();

            Loaded += (s, e) =>
            {
                // Initialize with service when loaded
                if (Tag is IStrategyHubService service)
                {
                    // Use service directly for now - simple and reliable
                    DataContext = service;
                }
            };
        }
    }
}
