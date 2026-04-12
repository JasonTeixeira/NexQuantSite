using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text.Json;

namespace QuantumTrader.Services
{
    public class MarketDataService
    {
        private readonly ILogger<MarketDataService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly Dictionary<string, decimal> _currentPrices;
        private readonly Dictionary<string, MarketDataPoint> _marketData;
        private readonly Timer _priceUpdateTimer;
        private readonly object _lockObject = new object();

        public event EventHandler<PriceUpdateEventArgs> PriceUpdated;
        public event EventHandler<MarketDataEventArgs> MarketDataUpdated;

        public MarketDataService(ILogger<MarketDataService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
            _currentPrices = new Dictionary<string, decimal>();
            _marketData = new Dictionary<string, MarketDataPoint>();

            // If Provider=ML, prefer WS; otherwise simulate/poll
            var provider = _configuration["MarketData:Provider"] ?? "Sim";
            if (string.Equals(provider, "ML", StringComparison.OrdinalIgnoreCase))
            {
                _ = TryStartWebSocketAsync();
                // fallback poll each 1s if WS not ready
                _priceUpdateTimer = new Timer(UpdatePricesFromRest, null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(1));
            }
            else
            {
                // Simulation timer (every 1 second during market hours)
                _priceUpdateTimer = new Timer(UpdatePrices, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
            }
        }

        // Market Data Management
        public async Task<MarketDataPoint> GetCurrentPriceAsync(string symbol)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_currentPrices.ContainsKey(symbol))
                    {
                        return new MarketDataPoint
                        {
                            Symbol = symbol,
                            Price = _currentPrices[symbol],
                            Timestamp = DateTime.UtcNow,
                            Volume = GetRandomVolume(),
                            Bid = _currentPrices[symbol] - GetRandomSpread(),
                            Ask = _currentPrices[symbol] + GetRandomSpread()
                        };
                    }
                }

                // If not in cache, fetch from external API
                return await FetchPriceFromAPIAsync(symbol);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current price for {Symbol}", symbol);
                return null;
            }
        }

        public async Task<List<MarketDataPoint>> GetHistoricalDataAsync(string symbol, DateTime startDate, DateTime endDate, string interval = "1d")
        {
            try
            {
                var data = new List<MarketDataPoint>();
                var currentDate = startDate;

                while (currentDate <= endDate)
                {
                    var price = await GetCurrentPriceAsync(symbol);
                    if (price != null)
                    {
                        data.Add(new MarketDataPoint
                        {
                            Symbol = symbol,
                            Price = price.Price,
                            Timestamp = currentDate,
                            Volume = GetRandomVolume(),
                            Bid = price.Bid,
                            Ask = price.Ask
                        });
                    }

                    currentDate = currentDate.AddDays(1);
                }

                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting historical data for {Symbol}", symbol);
                return new List<MarketDataPoint>();
            }
        }

        public async Task<Dictionary<string, decimal>> GetMultiplePricesAsync(List<string> symbols)
        {
            var prices = new Dictionary<string, decimal>();

            foreach (var symbol in symbols)
            {
                var price = await GetCurrentPriceAsync(symbol);
                if (price != null)
                {
                    prices[symbol] = price.Price;
                }
            }

            return prices;
        }

        // Real-time Price Updates (Simulation)
        private void UpdatePrices(object state)
        {
            try
            {
                if (!IsMarketOpen())
                    return;

                var updatedPrices = new Dictionary<string, decimal>();

                lock (_lockObject)
                {
                    foreach (var symbol in _currentPrices.Keys.ToList())
                    {
                        var currentPrice = _currentPrices[symbol];
                        var newPrice = SimulatePriceMovement(currentPrice);
                        _currentPrices[symbol] = newPrice;
                        updatedPrices[symbol] = newPrice;
                    }
                }

                // Trigger price update events
                foreach (var kvp in updatedPrices)
                {
                    PriceUpdated?.Invoke(this, new PriceUpdateEventArgs
                    {
                        Symbol = kvp.Key,
                        Price = kvp.Value,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating prices");
            }
        }

        // REST poll fallback when using ML provider
        private async void UpdatePricesFromRest(object state)
        {
            try
            {
                var baseUrl = _configuration["MarketData:BaseUrl"]?.TrimEnd('/') ?? "http://127.0.0.1:8000";
                var symbols = _configuration["MarketData:Symbols"] ?? "ES,NQ,YM,RTY,GC,SI,CL";
                var url = $"{baseUrl}/api/market/live?symbol={Uri.EscapeDataString(symbols)}";
                using var req = new HttpRequestMessage(HttpMethod.Get, url);
                var token = _configuration["MarketData:Token"] ?? string.Empty;
                if (!string.IsNullOrWhiteSpace(token)) req.Headers.Add("Authorization", $"Bearer {token}");
                var res = await _httpClient.SendAsync(req);
                if (!res.IsSuccessStatusCode) return;
                var json = await res.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(json).RootElement;
                if (doc.TryGetProperty("data", out var data))
                {
                    foreach (var el in data.EnumerateArray())
                    {
                        var sym = el.GetProperty("symbol").GetString() ?? string.Empty;
                        var price = el.TryGetProperty("last", out var last) ? last.GetDecimal() : (el.TryGetProperty("price", out var pr) ? pr.GetDecimal() : 0m);
                        var bid = el.TryGetProperty("bid", out var bd) ? (bd.ValueKind == JsonValueKind.Number ? bd.GetDecimal() : 0m) : 0m;
                        var ask = el.TryGetProperty("ask", out var ak) ? (ak.ValueKind == JsonValueKind.Number ? ak.GetDecimal() : 0m) : 0m;
                        var vol = el.TryGetProperty("volume", out var vl) ? (vl.ValueKind == JsonValueKind.Number ? vl.GetDecimal() : 0m) : 0m;
                        lock (_lockObject)
                        {
                            _currentPrices[sym] = price;
                            _marketData[sym] = new MarketDataPoint { Symbol = sym, Price = price, Bid = bid, Ask = ask, Volume = vol, Timestamp = DateTime.UtcNow };
                        }
                        PriceUpdated?.Invoke(this, new PriceUpdateEventArgs
                        {
                            Symbol = sym,
                            Price = price,
                            Timestamp = DateTime.UtcNow
                        });
                        MarketDataUpdated?.Invoke(this, new MarketDataEventArgs
                        {
                            Symbol = sym,
                            Data = _marketData[sym]
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "REST poll failed");
            }
        }

        // WebSocket live connect
        private async Task TryStartWebSocketAsync()
        {
            try
            {
                var wsUrl = _configuration["MarketData:WsUrl"] ?? "ws://127.0.0.1:8000/ws/market";
                using var client = new System.Net.WebSockets.ClientWebSocket();
                var token = _configuration["MarketData:Token"] ?? string.Empty;
                if (!string.IsNullOrWhiteSpace(token))
                {
                    client.Options.SetRequestHeader("Authorization", $"Bearer {token}");
                }
                await client.ConnectAsync(new Uri(wsUrl), CancellationToken.None);
                _ = Task.Run(async () =>
                {
                    var buffer = new ArraySegment<byte>(new byte[8192]);
                    while (client.State == System.Net.WebSockets.WebSocketState.Open)
                    {
                        var result = await client.ReceiveAsync(buffer, CancellationToken.None);
                        if (result.MessageType == System.Net.WebSockets.WebSocketMessageType.Close) break;
                        var msg = System.Text.Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
                        try
                        {
                            var el = JsonDocument.Parse(msg).RootElement; // expect {symbol, last, bid, ask, volume}
                            var sym = el.GetProperty("symbol").GetString() ?? string.Empty;
                            var price = el.TryGetProperty("last", out var last) ? last.GetDecimal() : (el.TryGetProperty("price", out var pr) ? pr.GetDecimal() : 0m);
                            var bid = el.TryGetProperty("bid", out var bd) ? (bd.ValueKind == JsonValueKind.Number ? bd.GetDecimal() : 0m) : 0m;
                            var ask = el.TryGetProperty("ask", out var ak) ? (ak.ValueKind == JsonValueKind.Number ? ak.GetDecimal() : 0m) : 0m;
                            var vol = el.TryGetProperty("volume", out var vl) ? (vl.ValueKind == JsonValueKind.Number ? vl.GetDecimal() : 0m) : 0m;
                            lock (_lockObject)
                            {
                                _currentPrices[sym] = price;
                                _marketData[sym] = new MarketDataPoint { Symbol = sym, Price = price, Bid = bid, Ask = ask, Volume = vol, Timestamp = DateTime.UtcNow };
                            }
                            PriceUpdated?.Invoke(this, new PriceUpdateEventArgs { Symbol = sym, Price = price, Timestamp = DateTime.UtcNow });
                            MarketDataUpdated?.Invoke(this, new MarketDataEventArgs { Symbol = sym, Data = _marketData[sym] });
                        }
                        catch { }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "WS connect failed, will use REST fallback");
            }
        }

        // Market Information
        public async Task<MarketInfo> GetMarketInfoAsync(string symbol)
        {
            try
            {
                var price = await GetCurrentPriceAsync(symbol);
                if (price == null) return null;

                return new MarketInfo
                {
                    Symbol = symbol,
                    CurrentPrice = price.Price,
                    Bid = price.Bid,
                    Ask = price.Ask,
                    Spread = price.Ask - price.Bid,
                    Volume = price.Volume,
                    LastUpdated = DateTime.UtcNow,
                    MarketStatus = IsMarketOpen() ? "Open" : "Closed",
                    TradingHours = GetTradingHours(symbol)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting market info for {Symbol}", symbol);
                return null;
            }
        }

        public async Task<List<string>> GetAvailableSymbolsAsync()
        {
            // In a real implementation, this would fetch from a broker API
            return new List<string>
            {
                "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX",
                "SPY", "QQQ", "IWM", "GLD", "SLV", "USO", "TLT", "VXX",
                "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD",
                "BTC/USD", "ETH/USD", "XRP/USD", "ADA/USD", "DOT/USD", "LINK/USD"
            };
        }

        // Price Simulation (for demo purposes)
        private decimal SimulatePriceMovement(decimal currentPrice)
        {
            var random = new Random();
            var volatility = 0.001m; // 0.1% volatility
            var change = (decimal)(random.NextDouble() - 0.5) * 2 * volatility * currentPrice;
            return Math.Max(currentPrice + change, 0.01m); // Ensure price doesn't go below 0.01
        }

        private decimal GetRandomVolume()
        {
            var random = new Random();
            return random.Next(1000, 100000);
        }

        private decimal GetRandomSpread()
        {
            var random = new Random();
            return (decimal)(random.NextDouble() * 0.01); // 0-1 cent spread
        }

        // Market Hours
        private bool IsMarketOpen()
        {
            var now = DateTime.UtcNow;
            var easternTime = TimeZoneInfo.ConvertTimeFromUtc(now, TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time"));

            // Simple market hours check (9:30 AM - 4:00 PM ET, Monday-Friday)
            if (easternTime.DayOfWeek == DayOfWeek.Saturday || easternTime.DayOfWeek == DayOfWeek.Sunday)
                return false;

            var marketOpen = new TimeSpan(9, 30, 0);
            var marketClose = new TimeSpan(16, 0, 0);

            return easternTime.TimeOfDay >= marketOpen && easternTime.TimeOfDay <= marketClose;
        }

        private string GetTradingHours(string symbol)
        {
            if (symbol.Contains("/"))
                return "24/5"; // Forex
            else if (symbol.Contains("BTC") || symbol.Contains("ETH"))
                return "24/7"; // Crypto
            else
                return "9:30 AM - 4:00 PM ET"; // Stocks
        }

        // External API Integration
        private async Task<MarketDataPoint> FetchPriceFromAPIAsync(string symbol)
        {
            try
            {
                // In a real implementation, this would call actual market data APIs
                // For now, we'll simulate with random prices
                var random = new Random();
                var basePrice = symbol switch
                {
                    "AAPL" => 150.0m,
                    "MSFT" => 300.0m,
                    "GOOGL" => 2500.0m,
                    "AMZN" => 3000.0m,
                    "TSLA" => 800.0m,
                    "BTC/USD" => 45000.0m,
                    "ETH/USD" => 3000.0m,
                    _ => 100.0m
                };

                var price = basePrice + (decimal)(random.NextDouble() - 0.5) * basePrice * 0.1m;

                lock (_lockObject)
                {
                    _currentPrices[symbol] = price;
                }

                return new MarketDataPoint
                {
                    Symbol = symbol,
                    Price = price,
                    Timestamp = DateTime.UtcNow,
                    Volume = GetRandomVolume(),
                    Bid = price - GetRandomSpread(),
                    Ask = price + GetRandomSpread()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching price from API for {Symbol}", symbol);
                return null;
            }
        }

        // Cleanup
        public void Dispose()
        {
            _priceUpdateTimer?.Dispose();
            _httpClient?.Dispose();
        }
    }

    // Event Args
    public class PriceUpdateEventArgs : EventArgs
    {
        public string Symbol { get; set; }
        public decimal Price { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class MarketDataEventArgs : EventArgs
    {
        public string Symbol { get; set; }
        public MarketDataPoint Data { get; set; }
    }

    // Data Models
    public class MarketDataPoint
    {
        public string Symbol { get; set; }
        public decimal Price { get; set; }
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal Volume { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class MarketInfo
    {
        public string Symbol { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal Bid { get; set; }
        public decimal Ask { get; set; }
        public decimal Spread { get; set; }
        public decimal Volume { get; set; }
        public DateTime LastUpdated { get; set; }
        public string MarketStatus { get; set; }
        public string TradingHours { get; set; }
    }
}
