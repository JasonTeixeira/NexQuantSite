using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("AccountRiskSettings")]
    public class AccountRiskSettings
    {
        [Key]
        public int TradingAccountId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDailyLoss { get; set; } = 5.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxPositionSize { get; set; } = 10.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal StopLoss { get; set; } = 2.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TakeProfit { get; set; } = 4.00m; // Percentage

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxOpenPositions { get; set; } = 5.00m; // Number of positions

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CorrelationLimit { get; set; } = 0.70m; // Correlation coefficient

        [Required]
        public bool AutoScaling { get; set; } = true;

        [Required]
        public bool DynamicStopLoss { get; set; } = false;

        [Required]
        public bool TrailingStop { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TrailingStopDistance { get; set; } = 1.00m; // Percentage

        [Required]
        public bool EmergencyStopEnabled { get; set; } = true;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EmergencyStopThreshold { get; set; } = 10.00m; // Percentage

        [StringLength(20)]
        public string RiskCalculationMethod { get; set; } = "FIXED_PERCENTAGE"; // FIXED_PERCENTAGE, KELLY, RISK_PARITY

        [StringLength(500)]
        public string? CustomRiskFormula { get; set; } // JSON object for custom formulas

        public DateTime? LastUpdatedAt { get; set; }

        // Navigation properties
        public virtual TradingAccount TradingAccount { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsConservative => MaxDailyLoss <= 2.00m && MaxPositionSize <= 5.00m;

        [NotMapped]
        public bool IsAggressive => MaxDailyLoss >= 8.00m && MaxPositionSize >= 15.00m;

        [NotMapped]
        public bool IsModerate => !IsConservative && !IsAggressive;

        [NotMapped]
        public string RiskProfile => IsConservative ? "Conservative" : IsAggressive ? "Aggressive" : "Moderate";

        [NotMapped]
        public string DisplayMaxDailyLoss => $"{MaxDailyLoss:F1}%";

        [NotMapped]
        public string DisplayMaxPositionSize => $"{MaxPositionSize:F1}%";

        [NotMapped]
        public string DisplayStopLoss => $"{StopLoss:F1}%";

        [NotMapped]
        public string DisplayTakeProfit => $"{TakeProfit:F1}%";
    }
}
