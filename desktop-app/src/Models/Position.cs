using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("Positions")]
    public class Position
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string Symbol { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Side { get; set; } = string.Empty; // LONG, SHORT

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 0.0000m;

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal AveragePrice { get; set; } = 0.0000m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MarketValue { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnrealizedPnL { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal RealizedPnL { get; set; } = 0.00m;

        [Column(TypeName = "decimal(18,4)")]
        public decimal? CurrentPrice { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Foreign Keys
        [Required]
        public int TradingAccountId { get; set; }

        // Navigation properties
        [ForeignKey("TradingAccountId")]
        public virtual TradingAccount TradingAccount { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsLong => Side.Equals("LONG", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsShort => Side.Equals("SHORT", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsProfitable => UnrealizedPnL > 0;

        [NotMapped]
        public decimal UnrealizedPnLPercentage => AveragePrice > 0 ? (UnrealizedPnL / (AveragePrice * Quantity)) * 100 : 0;
    }
}
