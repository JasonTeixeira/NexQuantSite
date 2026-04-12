using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.Services
{
    public interface ILicenseService
    {
        Task<bool> ValidateAsync(CancellationToken ct = default);
        bool IsLicensed { get; }
        DateTimeOffset? ExpiresAt { get; }
    }

    public class LicenseService : ILicenseService
    {
        private readonly ILogger<LicenseService> _logger;
        private readonly IConfiguration _config;
        private readonly HttpClient _http;
        private bool _isLicensed;
        private DateTimeOffset? _expiresAt;

        public LicenseService(ILogger<LicenseService> logger, IConfiguration config)
        {
            _logger = logger;
            _config = config;
            _http = new HttpClient();
        }

        public bool IsLicensed => _isLicensed;
        public DateTimeOffset? ExpiresAt => _expiresAt;

        public async Task<bool> ValidateAsync(CancellationToken ct = default)
        {
            try
            {
                if (bool.TryParse(_config["License:UseMock"], out var mock) && mock)
                {
                    _isLicensed = true;
                    _expiresAt = DateTimeOffset.UtcNow.AddDays(7);
                    return true;
                }

                var baseUrl = _config["License:BaseUrl"]?.TrimEnd('/') ?? "http://127.0.0.1:8000";
                var token = _config["License:Token"] ?? string.Empty;
                using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/v1/license/verify");
                if (!string.IsNullOrWhiteSpace(token)) req.Headers.Add("Authorization", $"Bearer {token}");
                req.Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
                var res = await _http.SendAsync(req, ct);
                if (!res.IsSuccessStatusCode)
                {
                    _isLicensed = false;
                    return false;
                }
                var json = await res.Content.ReadAsStringAsync(ct);
                var el = JsonDocument.Parse(json).RootElement;
                _isLicensed = el.TryGetProperty("valid", out var v) && v.GetBoolean();
                if (el.TryGetProperty("expires_at", out var exp) && exp.ValueKind == JsonValueKind.String && DateTimeOffset.TryParse(exp.GetString(), out var dto))
                {
                    _expiresAt = dto;
                }
                return _isLicensed;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "License validation failed");
                _isLicensed = false;
                return false;
            }
        }
    }
}


