using System;

namespace QuantumTrader.Models
{
	public class BrokerOrder
	{
		public string Id { get; set; } = string.Empty;
		public string ClientOrderId { get; set; } = string.Empty;
		public string AccountId { get; set; } = string.Empty;
		public string Symbol { get; set; } = string.Empty;
		public string Side { get; set; } = string.Empty;
		public int Quantity { get; set; }
		public string Status { get; set; } = string.Empty;
		public DateTime SubmittedAtUtc { get; set; }
	}
}


