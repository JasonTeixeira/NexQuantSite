using System.Windows.Controls;
using QuantumTrader.Services;

namespace QuantumTrader.Views
{
    /// <summary>
    /// Professional Strategy Store View
    /// Marketplace for purchasing and downloading trading strategies
    /// </summary>
    public partial class StrategyStoreView : UserControl
    {
        public StrategyStoreView()
        {
            InitializeComponent();

            Loaded += (s, e) =>
            {
                // Initialize with service when loaded
                if (Tag is IStrategyStoreService service)
                {
                    DataContext = service;
                }
            };
        }
    }
}
