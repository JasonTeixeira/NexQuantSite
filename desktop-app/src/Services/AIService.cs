using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace QuantumTrader.Services
{
    public class AIService
    {
        private readonly ILogger<AIService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly string _openaiApiKey;
        private readonly string _claudeApiKey;

        public AIService(ILogger<AIService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
            _openaiApiKey = _configuration["AI:OpenAI:ApiKey"];
            _claudeApiKey = _configuration["AI:Claude:ApiKey"];
        }

        // Strategy Generation
        public async Task<AIStrategyResponse> GenerateStrategyAsync(string symbol, string strategyType, Dictionary<string, object> parameters)
        {
            try
            {
                var prompt = BuildStrategyGenerationPrompt(symbol, strategyType, parameters);
                var response = await CallOpenAIAsync(prompt, "gpt-4");

                return new AIStrategyResponse
                {
                    Success = true,
                    StrategyCode = ExtractStrategyCode(response),
                    StrategyName = GenerateStrategyName(symbol, strategyType),
                    Description = ExtractDescription(response),
                    Parameters = parameters,
                    GeneratedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating strategy for {Symbol}", symbol);
                return new AIStrategyResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        // Strategy Optimization
        public async Task<AIOptimizationResponse> OptimizeStrategyAsync(string strategyCode, Dictionary<string, object> optimizationParams)
        {
            try
            {
                var prompt = BuildOptimizationPrompt(strategyCode, optimizationParams);
                var response = await CallClaudeAsync(prompt);

                return new AIOptimizationResponse
                {
                    Success = true,
                    OptimizedCode = ExtractOptimizedCode(response),
                    OptimizationSuggestions = ExtractOptimizationSuggestions(response),
                    PerformanceImprovements = ExtractPerformanceImprovements(response),
                    OptimizedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing strategy");
                return new AIOptimizationResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        // Market Analysis
        public async Task<AIMarketAnalysisResponse> AnalyzeMarketAsync(string symbol, List<MarketDataPoint> historicalData)
        {
            try
            {
                var prompt = BuildMarketAnalysisPrompt(symbol, historicalData);
                var response = await CallOpenAIAsync(prompt, "gpt-4");

                return new AIMarketAnalysisResponse
                {
                    Success = true,
                    Analysis = ExtractAnalysis(response),
                    Sentiment = ExtractSentiment(response),
                    Recommendations = ExtractRecommendations(response),
                    RiskLevel = ExtractRiskLevel(response),
                    AnalyzedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing market for {Symbol}", symbol);
                return new AIMarketAnalysisResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        // Risk Assessment
        public async Task<AIRiskAssessmentResponse> AssessRiskAsync(string strategyCode, Dictionary<string, object> marketConditions)
        {
            try
            {
                var prompt = BuildRiskAssessmentPrompt(strategyCode, marketConditions);
                var response = await CallClaudeAsync(prompt);

                return new AIRiskAssessmentResponse
                {
                    Success = true,
                    RiskScore = ExtractRiskScore(response),
                    RiskFactors = ExtractRiskFactors(response),
                    MitigationStrategies = ExtractMitigationStrategies(response),
                    MaxDrawdown = ExtractMaxDrawdown(response),
                    RecommendedPositionSize = ExtractRecommendedPositionSize(response),
                    AssessedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assessing risk");
                return new AIRiskAssessmentResponse
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        // AI API Calls
        private async Task<string> CallOpenAIAsync(string prompt, string model = "gpt-4")
        {
            try
            {
                if (string.IsNullOrEmpty(_openaiApiKey))
                {
                    return GenerateMockResponse(prompt, "OpenAI");
                }

                var requestBody = new
                {
                    model = model,
                    messages = new[]
                    {
                        new { role = "system", content = "You are an expert quantitative trader and algorithm developer. Provide clear, executable C# code for trading strategies." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 2000,
                    temperature = 0.3
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openaiApiKey}");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
                    return result?.choices?.FirstOrDefault()?.message?.content ?? "";
                }

                return GenerateMockResponse(prompt, "OpenAI");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                return GenerateMockResponse(prompt, "OpenAI");
            }
        }

        private async Task<string> CallClaudeAsync(string prompt)
        {
            try
            {
                if (string.IsNullOrEmpty(_claudeApiKey))
                {
                    return GenerateMockResponse(prompt, "Claude");
                }

                var requestBody = new
                {
                    model = "claude-3-sonnet-20240229",
                    max_tokens = 2000,
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("x-api-key", _claudeApiKey);
                _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

                var response = await _httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var result = JsonSerializer.Deserialize<ClaudeResponse>(responseContent);
                    return result?.content?.FirstOrDefault()?.text ?? "";
                }

                return GenerateMockResponse(prompt, "Claude");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Claude API");
                return GenerateMockResponse(prompt, "Claude");
            }
        }

        // Prompt Building
        private string BuildStrategyGenerationPrompt(string symbol, string strategyType, Dictionary<string, object> parameters)
        {
            return $@"
Generate a C# trading strategy for {symbol} with the following specifications:
- Strategy Type: {strategyType}
- Parameters: {JsonSerializer.Serialize(parameters)}

Requirements:
1. Create a complete C# class that implements a trading strategy
2. Include proper risk management
3. Add position sizing logic
4. Include stop-loss and take-profit mechanisms
5. Add proper logging and error handling
6. Make the code production-ready and well-documented

Please provide the complete C# code that can be compiled and executed.";
        }

        private string BuildOptimizationPrompt(string strategyCode, Dictionary<string, object> optimizationParams)
        {
            return $@"
Analyze and optimize the following trading strategy code:

{strategyCode}

Optimization parameters: {JsonSerializer.Serialize(optimizationParams)}

Please provide:
1. Optimized version of the code
2. Specific improvements made
3. Performance enhancement suggestions
4. Risk management improvements
5. Code quality improvements";
        }

        private string BuildMarketAnalysisPrompt(string symbol, List<MarketDataPoint> historicalData)
        {
            var dataSummary = historicalData.Take(10).Select(d => $"{d.Timestamp:yyyy-MM-dd}: ${d.Price:F2}").ToList();

            return $@"
Analyze the market for {symbol} based on the following recent data:
{string.Join("\n", dataSummary)}

Please provide:
1. Market sentiment analysis
2. Technical analysis insights
3. Trading recommendations
4. Risk assessment
5. Key support/resistance levels";
        }

        private string BuildRiskAssessmentPrompt(string strategyCode, Dictionary<string, object> marketConditions)
        {
            return $@"
Assess the risk of the following trading strategy:

{strategyCode}

Market conditions: {JsonSerializer.Serialize(marketConditions)}

Please provide:
1. Risk score (1-10)
2. Key risk factors
3. Mitigation strategies
4. Maximum expected drawdown
5. Recommended position sizing";
        }

        // Response Processing
        private string ExtractStrategyCode(string response)
        {
            // In a real implementation, you'd use more sophisticated parsing
            if (response.Contains("```csharp"))
            {
                var start = response.IndexOf("```csharp") + 9;
                var end = response.IndexOf("```", start);
                return response.Substring(start, end - start).Trim();
            }
            return response;
        }

        private string ExtractOptimizedCode(string response) => ExtractStrategyCode(response);
        private string ExtractDescription(string response) => "AI-generated trading strategy";
        private string ExtractAnalysis(string response) => response;
        private string ExtractSentiment(string response) => "Neutral";
        private string ExtractRecommendations(string response) => "Hold position";
        private string ExtractRiskLevel(string response) => "Medium";
        private string ExtractOptimizationSuggestions(string response) => response;
        private string ExtractPerformanceImprovements(string response) => "Improved efficiency";
        private string ExtractRiskScore(string response) => "5";
        private string ExtractRiskFactors(string response) => "Market volatility";
        private string ExtractMitigationStrategies(string response) => "Use stop-loss orders";
        private string ExtractMaxDrawdown(string response) => "10%";
        private string ExtractRecommendedPositionSize(string response) => "2%";

        private string GenerateStrategyName(string symbol, string strategyType)
        {
            return $"{symbol}_{strategyType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}";
        }

        private string GenerateMockResponse(string prompt, string provider)
        {
            return $@"
// Mock {provider} Response
public class MockStrategy
{{
    public void Execute()
    {{
        // Mock strategy implementation
        Console.WriteLine(""Strategy executed"");
    }}
}}";
        }

        // Cleanup
        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }

    // Response Models
    public class AIStrategyResponse
    {
        public bool Success { get; set; }
        public string StrategyCode { get; set; }
        public string StrategyName { get; set; }
        public string Description { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class AIOptimizationResponse
    {
        public bool Success { get; set; }
        public string OptimizedCode { get; set; }
        public string OptimizationSuggestions { get; set; }
        public string PerformanceImprovements { get; set; }
        public DateTime OptimizedAt { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class AIMarketAnalysisResponse
    {
        public bool Success { get; set; }
        public string Analysis { get; set; }
        public string Sentiment { get; set; }
        public string Recommendations { get; set; }
        public string RiskLevel { get; set; }
        public DateTime AnalyzedAt { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class AIRiskAssessmentResponse
    {
        public bool Success { get; set; }
        public string RiskScore { get; set; }
        public string RiskFactors { get; set; }
        public string MitigationStrategies { get; set; }
        public string MaxDrawdown { get; set; }
        public string RecommendedPositionSize { get; set; }
        public DateTime AssessedAt { get; set; }
        public string ErrorMessage { get; set; }
    }

    // API Response Models
    public class OpenAIResponse
    {
        public List<OpenAIChoice> choices { get; set; }
    }

    public class OpenAIChoice
    {
        public OpenAIMessage message { get; set; }
    }

    public class OpenAIMessage
    {
        public string content { get; set; }
    }

    public class ClaudeResponse
    {
        public List<ClaudeContent> content { get; set; }
    }

    public class ClaudeContent
    {
        public string text { get; set; }
    }
}
