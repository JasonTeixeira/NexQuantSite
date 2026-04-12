using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    /// <summary>
    /// Strategy Store Service Interface
    /// </summary>
    public interface IStrategyStoreService : INotifyPropertyChanged
    {
        ObservableCollection<StrategyStoreItem> FeaturedStrategies { get; }
        ObservableCollection<StrategyStoreCategory> Categories { get; }
        bool IsLoading { get; }

        Task LoadFeaturedStrategiesAsync();
        Task LoadCategoriesAsync();
    }
}
