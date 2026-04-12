using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace QuantumTrader.Services
{
	internal sealed class ResilientHandler : DelegatingHandler
	{
		private readonly int _maxRetries;
		private readonly TimeSpan _baseDelay;

		public ResilientHandler(HttpMessageHandler innerHandler, int maxRetries = 2, TimeSpan? baseDelay = null)
			: base(innerHandler)
		{
			_maxRetries = Math.Max(0, maxRetries);
			_baseDelay = baseDelay ?? TimeSpan.FromMilliseconds(150);
		}

		protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
		{
			int attempt = 0;
			while (true)
			{
				try
				{
					var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
					if (!ShouldRetry(response.StatusCode) || attempt >= _maxRetries)
					{
						return response;
					}
				}
				catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested && attempt < _maxRetries)
				{
					// timeout -> retry
				}
				catch (HttpRequestException) when (attempt < _maxRetries)
				{
					// network error -> retry
				}

				attempt++;
				var delay = JitterDelay(attempt);
				await Task.Delay(delay, cancellationToken).ConfigureAwait(false);
			}
		}

		private bool ShouldRetry(HttpStatusCode status)
		{
			int code = (int)status;
			return status == HttpStatusCode.RequestTimeout || // 408
					status == (HttpStatusCode)429 ||           // Too Many Requests
					(code >= 500 && code <= 599);              // 5xx
		}

		private TimeSpan JitterDelay(int attempt)
		{
			double backoff = Math.Pow(2, attempt - 1);
			var max = _baseDelay.TotalMilliseconds * backoff;
			var jitterMs = Math.Min(max, 1000); // cap to 1s per try
			var rnd = new Random(unchecked(Environment.TickCount * 31 + attempt));
			return TimeSpan.FromMilliseconds(rnd.Next(50, (int)jitterMs + 1));
		}
	}

	public static class Http
	{
		public static readonly HttpClient Client = CreateClient();

		private static HttpClient CreateClient()
		{
			var sockets = new SocketsHttpHandler
			{
				PooledConnectionLifetime = TimeSpan.FromMinutes(2),
				EnableMultipleHttp2Connections = true,
				AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
				MaxConnectionsPerServer = 20
			};

			var handler = new ResilientHandler(sockets, maxRetries: 2, baseDelay: TimeSpan.FromMilliseconds(150));
			var client = new HttpClient(handler, disposeHandler: true)
			{
				Timeout = TimeSpan.FromSeconds(12),
				DefaultRequestVersion = HttpVersion.Version20
			};
			client.DefaultRequestHeaders.ConnectionClose = false;
			client.DefaultRequestHeaders.AcceptEncoding.ParseAdd("gzip, deflate");
			return client;
		}
	}
}


