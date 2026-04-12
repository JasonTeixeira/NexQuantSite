using System;

namespace QuantumTrader.Models
{
    /// <summary>
    /// Represents a trade fill/execution from a broker
    /// </summary>
    public class BrokerFill
    {
        public string Id { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string ClientOrderId { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public string Side { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateTime ExecutedAtUtc { get; set; }
        public DateTime FilledAtUtc { get; set; }
        public string AccountId { get; set; } = string.Empty;
        public decimal Commission { get; set; } = 0;
        public string FillId { get; set; } = string.Empty;
    }
}
