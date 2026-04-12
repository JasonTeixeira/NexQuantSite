using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("TradingAccounts")]
    public class TradingAccount
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Type { get; set; } = "SIM"; // SIM, LIVE, DEMO

        [Required]
        [StringLength(100)]
        public string Broker { get; set; } = string.Empty;

        [StringLength(255)]
        public string? AccountNumber { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Equity { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PnL { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailyPnL { get; set; } = 0.00m;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, PAUSED, STOPPED, DISCONNECTED

        [Required]
        public bool IsEnabled { get; set; } = true;

        [StringLength(255)]
        public string? ConnectionString { get; set; }

        [StringLength(255)]
        public string? ApiKey { get; set; }

        [StringLength(255)]
        public string? SecretKey { get; set; }

        [StringLength(255)]
        public string? Passphrase { get; set; }

        public DateTime? LastSyncAt { get; set; }

        public DateTime? LastTradeAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Foreign Keys
        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Strategy> Strategies { get; set; } = new List<Strategy>();
        public virtual ICollection<Position> Positions { get; set; } = new List<Position>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Trade> Trades { get; set; } = new List<Trade>();
        public virtual AccountRiskSettings RiskSettings { get; set; } = new AccountRiskSettings();
        public virtual AccountScheduleSettings ScheduleSettings { get; set; } = new AccountScheduleSettings();

        // Computed properties
        [NotMapped]
        public decimal AvailableBalance => Balance + PnL;

        [NotMapped]
        public bool IsLive => Type.Equals("LIVE", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsConnected => Status.Equals("ACTIVE", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsProfitable => PnL > 0;

        [NotMapped]
        public string DisplayName => $"{Name} ({Type}) - {Broker}";
    }
}
