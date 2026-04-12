using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("StrategyRiskSettings")]
    public class StrategyRiskSettings
    {
        [Key]
        public int StrategyId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxPositionSize { get; set; } = 5.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal StopLoss { get; set; } = 2.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TakeProfit { get; set; } = 4.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AllocationPercentage { get; set; } = 25.00m; // Percentage of account

        [Required]
        public int MaxContracts { get; set; } = 10;

        [Required]
        public int MinContracts { get; set; } = 1;

        [Required]
        public bool IsEnabled { get; set; } = true;

        [Required]
        public bool UseDynamicSizing { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ConfidenceThreshold { get; set; } = 0.70m; // Minimum confidence for trades

        [StringLength(500)]
        public string? CustomParameters { get; set; } // JSON object for custom parameters

        public DateTime? LastUpdatedAt { get; set; }

        // Navigation properties
        public virtual Strategy Strategy { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsConservative => MaxPositionSize <= 3.00m && StopLoss <= 1.50m;

        [NotMapped]
        public bool IsAggressive => MaxPositionSize >= 8.00m && StopLoss >= 3.00m;

        [NotMapped]
        public bool IsModerate => !IsConservative && !IsAggressive;

        [NotMapped]
        public string RiskProfile => IsConservative ? "Conservative" : IsAggressive ? "Aggressive" : "Moderate";

        [NotMapped]
        public decimal RiskRewardRatio => StopLoss > 0 ? TakeProfit / StopLoss : 0;

        [NotMapped]
        public string DisplayMaxPositionSize => $"{MaxPositionSize:F1}%";

        [NotMapped]
        public string DisplayStopLoss => $"{StopLoss:F1}%";

        [NotMapped]
        public string DisplayTakeProfit => $"{TakeProfit:F1}%";

        [NotMapped]
        public string DisplayAllocation => $"{AllocationPercentage:F1}%";

        [NotMapped]
        public string DisplayRiskRewardRatio => $"{RiskRewardRatio:F2}:1";
    }
}
