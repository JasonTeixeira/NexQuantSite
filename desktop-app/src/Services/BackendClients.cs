using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
	public class BackendAccountService : IAccountService
	{
		private readonly HttpClient _httpClient;

		public BackendAccountService(HttpClient httpClient)
		{
			_httpClient = httpClient;
		}

		public async Task<IReadOnlyList<Account>> GetAccountsAsync()
		{
			var response = await _httpClient.GetAsync("/api/accounts");
			response.EnsureSuccessStatusCode();
			var json = await response.Content.ReadAsStringAsync();
			return JsonSerializer.Deserialize<List<Account>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<Account>();
		}

		public async Task<Account> SaveAccountAsync(Account account)
		{
			var json = JsonSerializer.Serialize(account);
			var content = new StringContent(json, Encoding.UTF8, "application/json");
			var response = await _httpClient.PostAsync("/api/accounts", content);
			response.EnsureSuccessStatusCode();
			var responseJson = await response.Content.ReadAsStringAsync();
			return JsonSerializer.Deserialize<Account>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? account;
		}

		public async Task DeleteAccountAsync(string accountId)
		{
			var response = await _httpClient.DeleteAsync($"/api/accounts/{accountId}");
			response.EnsureSuccessStatusCode();
		}
	}

	public class BackendStrategyService : IStrategyService
	{
		private readonly HttpClient _httpClient;

		public BackendStrategyService(HttpClient httpClient)
		{
			_httpClient = httpClient;
		}

		public async Task<IReadOnlyList<StrategyConfig>> GetStrategiesAsync()
		{
			var response = await _httpClient.GetAsync("/api/strategies");
			response.EnsureSuccessStatusCode();
			var json = await response.Content.ReadAsStringAsync();
			return JsonSerializer.Deserialize<List<StrategyConfig>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<StrategyConfig>();
		}
	}

	public class BackendAssignmentService : IAssignmentService
	{
		private readonly HttpClient _httpClient;

		public BackendAssignmentService(HttpClient httpClient)
		{
			_httpClient = httpClient;
		}

		public async Task<IReadOnlyList<AccountStrategy>> GetAssignmentsAsync(string accountId)
		{
			var response = await _httpClient.GetAsync($"/api/accounts/{accountId}/assignments");
			response.EnsureSuccessStatusCode();
			var json = await response.Content.ReadAsStringAsync();
			return JsonSerializer.Deserialize<List<AccountStrategy>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<AccountStrategy>();
		}

		public async Task SaveAssignmentsAsync(string accountId, IReadOnlyList<AccountStrategy> assignments)
		{
			var json = JsonSerializer.Serialize(assignments);
			var content = new StringContent(json, Encoding.UTF8, "application/json");
			var response = await _httpClient.PutAsync($"/api/accounts/{accountId}/assignments", content);
			response.EnsureSuccessStatusCode();
		}
	}
}


