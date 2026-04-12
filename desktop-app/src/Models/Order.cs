using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("Orders")]
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderId { get; set; } = string.Empty; // External order ID from broker

        [Required]
        [StringLength(20)]
        public string Symbol { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Side { get; set; } = string.Empty; // BUY, SELL

        [Required]
        [StringLength(20)]
        public string Type { get; set; } = string.Empty; // MARKET, LIMIT, STOP, STOP_LIMIT

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 0.0000m;

        [Column(TypeName = "decimal(18,4)")]
        public decimal? Price { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? StopPrice { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty; // PENDING, PARTIAL, FILLED, CANCELLED, REJECTED

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal FilledQuantity { get; set; } = 0.0000m;

        [Column(TypeName = "decimal(18,4)")]
        public decimal? AverageFillPrice { get; set; }

        [StringLength(20)]
        public string TimeInForce { get; set; } = "DAY"; // DAY, GTC, IOC, FOK

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(500)]
        public string? RejectionReason { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? FilledAt { get; set; }

        public DateTime? CancelledAt { get; set; }

        // Foreign Keys
        [Required]
        public int TradingAccountId { get; set; }

        public int? StrategyId { get; set; }

        // Navigation properties
        [ForeignKey("TradingAccountId")]
        public virtual TradingAccount TradingAccount { get; set; } = null!;

        [ForeignKey("StrategyId")]
        public virtual Strategy? Strategy { get; set; }

        // Computed properties
        [NotMapped]
        public bool IsBuy => Side.Equals("BUY", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsSell => Side.Equals("SELL", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsFilled => Status.Equals("FILLED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsPending => Status.Equals("PENDING", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsCancelled => Status.Equals("CANCELLED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsRejected => Status.Equals("REJECTED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public decimal RemainingQuantity => Quantity - FilledQuantity;

        [NotMapped]
        public decimal FillPercentage => Quantity > 0 ? (FilledQuantity / Quantity) * 100 : 0;

        [NotMapped]
        public string DisplayName => $"{Side} {Quantity} {Symbol} @ {Price?.ToString("F2") ?? "MKT"}";
    }
}
