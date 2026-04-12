using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("Strategies")]
    public class Strategy
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = "CUSTOM"; // CUSTOM, MARKETPLACE, AI_GENERATED

        [Required]
        [StringLength(20)]
        public string Category { get; set; } = "MEAN_REVERSION"; // MEAN_REVERSION, MOMENTUM, SCALPING, etc.

        [Required]
        [StringLength(20)]
        public string RiskLevel { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "DRAFT"; // DRAFT, ACTIVE, PAUSED, STOPPED, ARCHIVED

        [Required]
        public bool IsEnabled { get; set; } = false;

        [Required]
        public bool IsEncrypted { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyFee { get; set; } = 0.00m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalReturn { get; set; } = 0.00m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SharpeRatio { get; set; } = 0.00m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDrawdown { get; set; } = 0.00m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal WinRate { get; set; } = 0.00m;

        public int TotalTrades { get; set; } = 0;

        public int WinningTrades { get; set; } = 0;

        public int LosingTrades { get; set; } = 0;

        [StringLength(20)]
        public string Timeframe { get; set; } = "5min";

        [StringLength(500)]
        public string Instruments { get; set; } = string.Empty; // JSON array of instruments

        [Column(TypeName = "text")]
        public string Code { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string Parameters { get; set; } = string.Empty; // JSON object of parameters

        [Column(TypeName = "text")]
        public string BacktestResults { get; set; } = string.Empty; // JSON object of backtest results

        [StringLength(100)]
        public string? AiModel { get; set; } // GPT-4, Claude, etc.

        [StringLength(255)]
        public string? Version { get; set; } = "1.0.0";

        [StringLength(255)]
        public string? Author { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Rating { get; set; }

        public int? RatingCount { get; set; } = 0;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastBacktestAt { get; set; }

        public DateTime? LastDeployedAt { get; set; }

        // Foreign Keys
        [Required]
        public int UserId { get; set; }

        public int? TradingAccountId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("TradingAccountId")]
        public virtual TradingAccount? TradingAccount { get; set; }

        public virtual ICollection<TradingAccount> AssignedAccounts { get; set; } = new List<TradingAccount>();
        public virtual ICollection<StrategyPerformance> PerformanceHistory { get; set; } = new List<StrategyPerformance>();
        public virtual ICollection<StrategyBacktest> Backtests { get; set; } = new List<StrategyBacktest>();
        public virtual StrategyRiskSettings RiskSettings { get; set; } = new StrategyRiskSettings();

        // Computed properties
        [NotMapped]
        public bool IsActive => Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase) && IsEnabled;

        [NotMapped]
        public bool IsProfitable => TotalReturn > 0;

        [NotMapped]
        public decimal ProfitFactor => LosingTrades > 0 ? (decimal)WinningTrades / LosingTrades : 0;

        [NotMapped]
        public string DisplayName => $"{Name} v{Version} ({Category})";

        [NotMapped]
        public string PerformanceSummary => $"Return: {TotalReturn:F2}% | Sharpe: {SharpeRatio:F2} | DD: {MaxDrawdown:F2}% | Win Rate: {WinRate:F1}%";
    }
}


