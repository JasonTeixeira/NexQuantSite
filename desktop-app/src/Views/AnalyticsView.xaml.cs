using System.Windows.Controls;
using QuantumTrader.Services;

namespace QuantumTrader.Views
{
    /// <summary>
    /// Institutional-Grade Analytics View
    /// Advanced portfolio analytics, reporting, and performance attribution
    /// </summary>
    public partial class AnalyticsView : UserControl
    {
        public AnalyticsView()
        {
            InitializeComponent();

            Loaded += (s, e) =>
            {
                // Initialize with service when loaded
                if (Tag is IAnalyticsService service)
                {
                    DataContext = service;
                }
            };
        }
    }
}
