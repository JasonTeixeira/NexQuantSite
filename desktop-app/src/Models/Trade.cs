using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("Trades")]
    public class Trade
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string TradeId { get; set; } = string.Empty; // External trade ID from broker

        [Required]
        [StringLength(20)]
        public string Symbol { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Side { get; set; } = string.Empty; // BUY, SELL

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 0.0000m;

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal Price { get; set; } = 0.0000m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Commission { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal RealizedPnL { get; set; } = 0.00m;

        [StringLength(50)]
        public string? OrderId { get; set; } // Reference to the parent order

        [StringLength(500)]
        public string? Notes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

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
        public bool IsProfitable => RealizedPnL > 0;

        [NotMapped]
        public decimal TotalValue => Quantity * Price;

        [NotMapped]
        public decimal NetPnL => RealizedPnL - Commission;

        [NotMapped]
        public string DisplayName => $"{Side} {Quantity} {Symbol} @ {Price:F2}";
    }
}
