using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("StrategyBacktests")]
    public class StrategyBacktest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalReturn { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SharpeRatio { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDrawdown { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal WinRate { get; set; } = 0.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ProfitFactor { get; set; } = 0.00m;

        public int TotalTrades { get; set; } = 0;

        public int WinningTrades { get; set; } = 0;

        public int LosingTrades { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? AverageWin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? AverageLoss { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? LargestWin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? LargestLoss { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SortinoRatio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CalmarRatio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Volatility { get; set; } // Annualized volatility

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Beta { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Alpha { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "COMPLETED"; // PENDING, RUNNING, COMPLETED, FAILED

        [StringLength(500)]
        public string? ErrorMessage { get; set; }

        [Column(TypeName = "text")]
        public string? Parameters { get; set; } // JSON object of backtest parameters

        [Column(TypeName = "text")]
        public string? Results { get; set; } // JSON object of detailed results

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        public TimeSpan? ExecutionTime { get; set; }

        // Foreign Keys
        [Required]
        public int StrategyId { get; set; }

        // Navigation properties
        [ForeignKey("StrategyId")]
        public virtual Strategy Strategy { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsCompleted => Status.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsRunning => Status.Equals("RUNNING", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsFailed => Status.Equals("FAILED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsProfitable => TotalReturn > 0;

        [NotMapped]
        public decimal LossRate => TotalTrades > 0 ? (decimal)LosingTrades / TotalTrades * 100 : 0;

        [NotMapped]
        public decimal ExpectedValue => TotalTrades > 0 ? (AverageWin ?? 0) * (WinRate / 100) + (AverageLoss ?? 0) * (LossRate / 100) : 0;

        [NotMapped]
        public string DisplayTotalReturn => $"{TotalReturn:F2}%";

        [NotMapped]
        public string DisplaySharpeRatio => $"{SharpeRatio:F2}";

        [NotMapped]
        public string DisplayMaxDrawdown => $"{MaxDrawdown:F2}%";

        [NotMapped]
        public string DisplayWinRate => $"{WinRate:F1}%";

        [NotMapped]
        public string DisplayProfitFactor => $"{ProfitFactor:F2}";

        [NotMapped]
        public string DisplayName => $"{Name} ({StartDate:yyyy-MM-dd} to {EndDate:yyyy-MM-dd})";

        [NotMapped]
        public string PerformanceSummary => $"Return: {DisplayTotalReturn} | Sharpe: {DisplaySharpeRatio} | DD: {DisplayMaxDrawdown} | Win Rate: {DisplayWinRate}";
    }
}
