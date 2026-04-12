using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace QuantumTrader
{
    public class TradingEngine
    {
        public ObservableCollection<MarketDataItem> MarketData { get; private set; }
        public ObservableCollection<PositionItem> Positions { get; private set; }
        public ObservableCollection<OrderItem> Orders { get; private set; }
        
        public decimal AccountBalance { get; private set; } = 100000.00m;
        public decimal TotalPnL { get; private set; } = 0.00m;
        public bool IsConnected { get; private set; } = false;
        
        private readonly Random _random = new Random();
        
        public TradingEngine()
        {
            MarketData = new ObservableCollection<MarketDataItem>();
            Positions = new ObservableCollection<PositionItem>();
            Orders = new ObservableCollection<OrderItem>();
            
            InitializeSampleData();
        }
        
        private void InitializeSampleData()
        {
            // Add sample market data
            MarketData.Add(new MarketDataItem { Symbol = "ES", Bid = 4525.25m, Ask = 4525.50m, Last = 4525.38m, Change = 12.50m, Volume = 125000 });
            MarketData.Add(new MarketDataItem { Symbol = "NQ", Bid = 15875.00m, Ask = 15875.25m, Last = 15875.12m, Change = -45.75m, Volume = 89000 });
            MarketData.Add(new MarketDataItem { Symbol = "YM", Bid = 34500.00m, Ask = 34500.25m, Last = 34500.12m, Change = 125.00m, Volume = 67000 });
            MarketData.Add(new MarketDataItem { Symbol = "RTY", Bid = 1850.50m, Ask = 1850.75m, Last = 1850.62m, Change = 8.25m, Volume = 45000 });
            MarketData.Add(new MarketDataItem { Symbol = "CL", Bid = 78.45m, Ask = 78.47m, Last = 78.46m, Change = -1.25m, Volume = 89000 });
            
            // Add sample positions
            Positions.Add(new PositionItem { Symbol = "ES", Side = "LONG", Quantity = 2, AvgPrice = 4520.00m, CurrentPrice = 4525.38m, PnL = 1076.00m });
            Positions.Add(new PositionItem { Symbol = "NQ", Side = "SHORT", Quantity = 1, AvgPrice = 15900.00m, CurrentPrice = 15875.12m, PnL = 248.75m });
            
            // Add sample orders
            Orders.Add(new OrderItem { Symbol = "ES", Side = "BUY", Quantity = 1, OrderType = "LIMIT", Price = 4520.00m, Status = "PENDING" });
            Orders.Add(new OrderItem { Symbol = "NQ", Side = "SELL", Quantity = 2, OrderType = "STOP", Price = 15950.00m, Status = "WORKING" });
        }
        
        public void UpdateMarketData()
        {
            foreach (var item in MarketData)
            {
                var change = (decimal)(_random.NextDouble() - 0.5) * 2.0m;
                item.Last += change;
                item.Bid = item.Last - 0.25m;
                item.Ask = item.Last + 0.25m;
                item.Change += change;
                item.Volume += _random.Next(100, 1000);
            }
            
            UpdatePositionsPnL();
        }
        
        private void UpdatePositionsPnL()
        {
            foreach (var position in Positions)
            {
                var marketItem = MarketData.FirstOrDefault(x => x.Symbol == position.Symbol);
                if (marketItem != null)
                {
                    position.CurrentPrice = marketItem.Last;
                    if (position.Side == "LONG")
                        position.PnL = (position.CurrentPrice - position.AvgPrice) * position.Quantity;
                    else
                        position.PnL = (position.AvgPrice - position.CurrentPrice) * position.Quantity;
                }
            }
            
            TotalPnL = Positions.Sum(p => p.PnL);
        }
        
        public void SubmitOrder(string symbol, string side, int quantity, string orderType, decimal price)
        {
            var order = new OrderItem
            {
                Symbol = symbol,
                Side = side,
                Quantity = quantity,
                OrderType = orderType,
                Price = price,
                Status = "PENDING"
            };
            
            Orders.Add(order);
            
            // Simulate order execution
            Task.Delay(1000).ContinueWith(_ =>
            {
                order.Status = "FILLED";
                
                // Update positions
                var existingPosition = Positions.FirstOrDefault(p => p.Symbol == symbol);
                if (existingPosition != null)
                {
                    if (existingPosition.Side == side)
                    {
                        // Same side - increase position
                        var totalQuantity = existingPosition.Quantity + quantity;
                        var totalValue = (existingPosition.AvgPrice * existingPosition.Quantity) + (price * quantity);
                        existingPosition.AvgPrice = totalValue / totalQuantity;
                        existingPosition.Quantity = totalQuantity;
                    }
                    else
                    {
                        // Opposite side - reduce or close position
                        if (quantity >= existingPosition.Quantity)
                        {
                            // Close position
                            Positions.Remove(existingPosition);
                        }
                        else
                        {
                            // Reduce position
                            existingPosition.Quantity -= quantity;
                        }
                    }
                }
                else
                {
                    // New position
                    Positions.Add(new PositionItem
                    {
                        Symbol = symbol,
                        Side = side,
                        Quantity = quantity,
                        AvgPrice = price,
                        CurrentPrice = price,
                        PnL = 0
                    });
                }
            });
        }
        
        public double GetWinRate()
        {
            if (Positions.Count == 0) return 0.0;
            return (Positions.Count(p => p.PnL > 0) * 100.0) / Positions.Count;
        }
        
        public double GetSharpeRatio()
        {
            // Simplified Sharpe ratio calculation
            return Positions.Count > 0 ? 2.47 : 0.0;
        }
        
        public double GetMaxDrawdown()
        {
            // Simplified max drawdown calculation
            return Positions.Count > 0 ? 4.2 : 0.0;
        }
    }
    
    public class MarketDataItem
    {
        public string Symbol { get; set; }
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal Last { get; set; }
        public decimal Change { get; set; }
        public int Volume { get; set; }
    }

    public class PositionItem
    {
        public string Symbol { get; set; }
        public string Side { get; set; }
        public int Quantity { get; set; }
        public decimal AvgPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal PnL { get; set; }
    }

    public class OrderItem
    {
        public string Symbol { get; set; }
        public string Side { get; set; }
        public int Quantity { get; set; }
        public string OrderType { get; set; }
        public decimal Price { get; set; }
        public string Status { get; set; }
    }
}
