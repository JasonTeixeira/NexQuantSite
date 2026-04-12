using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace QuantumTrader.Services
{
    public interface IMLNewsService
    {
        Task<List<NewsEvent>> GetCalendarEventsAsync(string? fromDate = null, string? toDate = null, List<string>? symbols = null);
        Task<MLNewsContext> GetSymbolContextAsync(string symbol, string? accountId = null);
        Task<bool> IsHighImpactPeriodAsync(string symbol);
        Task<decimal> GetRecommendedRiskFactorAsync(string symbol);
    }

    public class NewsEvent
    {
        public string Id { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Severity { get; set; } = "low";
        public List<string> Symbols { get; set; } = new();
        public string? Source { get; set; }
        public decimal? Expected { get; set; }
        public decimal? Actual { get; set; }
        public decimal? Surprise { get; set; }
        public DateTime? EmbargoStart { get; set; }
        public DateTime? EmbargoEnd { get; set; }
    }

    public class MLNewsContext
    {
        public string Symbol { get; set; } = string.Empty;
        public bool IsHighImpact { get; set; }
        public string Severity { get; set; } = "low";
        public DateTime? EmbargoUntil { get; set; }
        public decimal? Sentiment { get; set; }
        public decimal RecommendedRiskFactor { get; set; } = 1.0m;
        public List<NewsEvent> TopEvents { get; set; } = new();
        public double FreshnessMs { get; set; }
    }

    public class MLNewsService : IMLNewsService
    {
        private readonly ILogger<MLNewsService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _mlApiBaseUrl;
        private readonly string _apiKey;
        private readonly Dictionary<string, MLNewsContext> _contextCache = new();
        private readonly Dictionary<string, List<NewsEvent>> _calendarCache = new();

        public MLNewsService(ILogger<MLNewsService> logger, HttpClient httpClient)
        {
            _logger = logger;
            _httpClient = httpClient;
            
            _mlApiBaseUrl = Environment.GetEnvironmentVariable("ML_API_BASE_URL") ?? "https://localhost:8443";
            _apiKey = Environment.GetEnvironmentVariable("ML_API_KEY") ?? "demo-key";
            
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<List<NewsEvent>> GetCalendarEventsAsync(string? fromDate = null, string? toDate = null, List<string>? symbols = null)
        {
            try
            {
                var cacheKey = $"calendar_{fromDate}_{toDate}_{string.Join(",", symbols ?? new List<string>())}";
                
                if (_calendarCache.TryGetValue(cacheKey, out var cached))
                {
                    return cached;
                }

                var queryParams = new List<string>();
                if (!string.IsNullOrEmpty(fromDate)) queryParams.Add($"from_ts={Uri.EscapeDataString(fromDate)}");
                if (!string.IsNullOrEmpty(toDate)) queryParams.Add($"to_ts={Uri.EscapeDataString(toDate)}");
                if (symbols?.Any() == true) queryParams.Add($"symbols={Uri.EscapeDataString(string.Join(",", symbols))}");

                var url = $"{_mlApiBaseUrl}/api/v1/ml/events/calendar";
                if (queryParams.Any()) url += "?" + string.Join("&", queryParams);

                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<JsonElement>(json);
                    
                    var events = new List<NewsEvent>();
                    if (result.TryGetProperty("events", out var eventsArray))
                    {
                        foreach (var eventElement in eventsArray.EnumerateArray())
                        {
                            var newsEvent = new NewsEvent
                            {
                                Id = eventElement.GetProperty("id").GetString() ?? "",
                                Timestamp = DateTime.Parse(eventElement.GetProperty("ts").GetString() ?? DateTime.UtcNow.ToString()),
                                Title = eventElement.GetProperty("title").GetString() ?? "",
                                Severity = eventElement.GetProperty("severity").GetString() ?? "low",
                                Source = eventElement.TryGetProperty("source", out var source) ? source.GetString() : null,
                                Expected = eventElement.TryGetProperty("expected", out var expected) ? expected.GetDecimal() : null,
                                Actual = eventElement.TryGetProperty("actual", out var actual) ? actual.GetDecimal() : null,
                                Surprise = eventElement.TryGetProperty("surprise", out var surprise) ? surprise.GetDecimal() : null
                            };

                            if (eventElement.TryGetProperty("symbols", out var symbolsArray))
                            {
                                foreach (var symbol in symbolsArray.EnumerateArray())
                                {
                                    newsEvent.Symbols.Add(symbol.GetString() ?? "");
                                }
                            }

                            events.Add(newsEvent);
                        }
                    }

                    _calendarCache[cacheKey] = events;
                    _logger.LogInformation("Retrieved {Count} calendar events from ML API", events.Count);
                    return events;
                }
                else
                {
                    _logger.LogWarning("Failed to get calendar events: {StatusCode}", response.StatusCode);
                    return new List<NewsEvent>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting calendar events from ML API");
                return new List<NewsEvent>();
            }
        }

        public async Task<MLNewsContext> GetSymbolContextAsync(string symbol, string? accountId = null)
        {
            try
            {
                var cacheKey = $"context_{symbol.ToUpper()}";
                
                if (_contextCache.TryGetValue(cacheKey, out var cached))
                {
                    return cached;
                }

                var queryParams = new List<string> { $"symbol={Uri.EscapeDataString(symbol)}" };
                if (!string.IsNullOrEmpty(accountId)) queryParams.Add($"account={Uri.EscapeDataString(accountId)}");

                var url = $"{_mlApiBaseUrl}/api/v1/ml/context?{string.Join("&", queryParams)}";
                var response = await _httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<JsonElement>(json);
                    
                    var context = new MLNewsContext
                    {
                        Symbol = result.GetProperty("symbol").GetString() ?? symbol,
                        IsHighImpact = result.GetProperty("is_high_impact").GetBoolean(),
                        Severity = result.GetProperty("severity").GetString() ?? "low",
                        Sentiment = result.TryGetProperty("sentiment", out var sentiment) ? sentiment.GetDecimal() : null,
                        RecommendedRiskFactor = result.GetProperty("recommended_risk_factor").GetDecimal(),
                        FreshnessMs = result.GetProperty("freshness_ms").GetDouble()
                    };

                    if (result.TryGetProperty("top_events", out var topEventsArray))
                    {
                        foreach (var eventElement in topEventsArray.EnumerateArray())
                        {
                            var newsEvent = new NewsEvent
                            {
                                Id = eventElement.GetProperty("id").GetString() ?? "",
                                Title = eventElement.GetProperty("title").GetString() ?? "",
                                Severity = eventElement.GetProperty("severity").GetString() ?? "low"
                            };
                            context.TopEvents.Add(newsEvent);
                        }
                    }

                    _contextCache[cacheKey] = context;
                    _logger.LogInformation("Retrieved context for {Symbol}: HighImpact={HighImpact}, RiskFactor={RiskFactor}", 
                        symbol, context.IsHighImpact, context.RecommendedRiskFactor);
                    return context;
                }
                else
                {
                    _logger.LogWarning("Failed to get context for {Symbol}: {StatusCode}", symbol, response.StatusCode);
                    return new MLNewsContext { Symbol = symbol, RecommendedRiskFactor = 1.0m };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting context for {Symbol} from ML API", symbol);
                return new MLNewsContext { Symbol = symbol, RecommendedRiskFactor = 1.0m };
            }
        }

        public async Task<bool> IsHighImpactPeriodAsync(string symbol)
        {
            var context = await GetSymbolContextAsync(symbol);
            return context.IsHighImpact;
        }

        public async Task<decimal> GetRecommendedRiskFactorAsync(string symbol)
        {
            var context = await GetSymbolContextAsync(symbol);
            return context.RecommendedRiskFactor;
        }

        public void ClearCache()
        {
            _contextCache.Clear();
            _calendarCache.Clear();
            _logger.LogInformation("ML News Service cache cleared");
        }
    }
}
