using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("StrategyPerformance")]
    public class StrategyPerformance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; } = DateTime.Today;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailyReturn { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CumulativeReturn { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Drawdown { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Volatility { get; set; } = 0.00m; // Percentage

        public int TradesCount { get; set; } = 0;

        public int WinningTrades { get; set; } = 0;

        public int LosingTrades { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SharpeRatio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SortinoRatio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CalmarRatio { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        // Foreign Keys
        [Required]
        public int StrategyId { get; set; }

        // Navigation properties
        [ForeignKey("StrategyId")]
        public virtual Strategy Strategy { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsProfitable => DailyReturn > 0;

        [NotMapped]
        public decimal WinRate => TradesCount > 0 ? (decimal)WinningTrades / TradesCount * 100 : 0;

        [NotMapped]
        public decimal LossRate => TradesCount > 0 ? (decimal)LosingTrades / TradesCount * 100 : 0;

        [NotMapped]
        public string DisplayDailyReturn => $"{DailyReturn:F2}%";

        [NotMapped]
        public string DisplayCumulativeReturn => $"{CumulativeReturn:F2}%";

        [NotMapped]
        public string DisplayDrawdown => $"{Drawdown:F2}%";

        [NotMapped]
        public string DisplayWinRate => $"{WinRate:F1}%";

        [NotMapped]
        public string DisplayName => $"{Date:yyyy-MM-dd} - {DisplayDailyReturn} ({TradesCount} trades)";
    }
}
