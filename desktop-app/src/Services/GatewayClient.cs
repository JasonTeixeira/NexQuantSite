using System;
using System.IO.Pipes;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace QuantumTrader.Services
{
    public interface IGatewayClient
    {
        Task<GatewayResponse> SendRequestAsync(GatewayRequest request, CancellationToken cancellationToken = default);
        Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default);
    }

    public class GatewayClient : IGatewayClient, IDisposable
    {
        private readonly ILogger<GatewayClient> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _pipeName = "QuantumTraderGateway";
        private readonly string _httpsUrl = "https://127.0.0.1:8443/";
        private readonly SemaphoreSlim _connectionSemaphore = new SemaphoreSlim(1, 1);
        private bool _useNamedPipes = true; // Start with Named Pipes, fallback to HTTPS

        public GatewayClient(ILogger<GatewayClient> logger)
        {
            _logger = logger;
            _httpClient = Http.Client; // central resilient client
        }

        public async Task<GatewayResponse> SendRequestAsync(GatewayRequest request, CancellationToken cancellationToken = default)
        {
            if (_useNamedPipes)
            {
                try
                {
                    return await SendRequestViaNamedPipesAsync(request, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Named Pipes failed, falling back to HTTPS");
                    _useNamedPipes = false;
                }
            }

            return await SendRequestViaHttpsAsync(request, cancellationToken);
        }

        private async Task<GatewayResponse> SendRequestViaNamedPipesAsync(GatewayRequest request, CancellationToken cancellationToken)
        {
            using var pipeClient = new NamedPipeClientStream(".", _pipeName, PipeDirection.InOut, PipeOptions.Asynchronous);

            await pipeClient.ConnectAsync(5000, cancellationToken); // 5 second timeout

            var requestJson = JsonSerializer.Serialize(request);
            var requestBytes = Encoding.UTF8.GetBytes(requestJson);

            await pipeClient.WriteAsync(requestBytes, 0, requestBytes.Length, cancellationToken);

            var buffer = new byte[4096];
            var bytesRead = await pipeClient.ReadAsync(buffer, 0, buffer.Length, cancellationToken);

            var responseJson = Encoding.UTF8.GetString(buffer, 0, bytesRead);
            return JsonSerializer.Deserialize<GatewayResponse>(responseJson);
        }

        private async Task<GatewayResponse> SendRequestViaHttpsAsync(GatewayRequest request, CancellationToken cancellationToken)
        {
            var requestJson = JsonSerializer.Serialize(request);
            var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_httpsUrl, content, cancellationToken);
            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);

            return JsonSerializer.Deserialize<GatewayResponse>(responseJson);
        }

        public async Task<bool> IsConnectedAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                if (_useNamedPipes)
                {
                    using var pipeClient = new NamedPipeClientStream(".", _pipeName, PipeDirection.InOut, PipeOptions.Asynchronous);
                    await pipeClient.ConnectAsync(1000, cancellationToken); // 1 second timeout
                    return true;
                }
                else
                {
                    var response = await _httpClient.GetAsync(_httpsUrl.Replace("/", "/health"), cancellationToken);
                    return response.IsSuccessStatusCode;
                }
            }
            catch
            {
                return false;
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
            _connectionSemaphore?.Dispose();
        }
    }
}
