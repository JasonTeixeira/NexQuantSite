using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("CreditTransactions")]
    public class CreditTransaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string TransactionId { get; set; } = string.Empty; // Unique transaction ID

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // PURCHASE, DEDUCTION, REFUND, BONUS

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAfter { get; set; } = 0.00m;

        [StringLength(100)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string? PaymentMethod { get; set; } // STRIPE, PAYPAL, etc.

        [StringLength(100)]
        public string? PaymentId { get; set; } // External payment ID

        [StringLength(20)]
        public string Status { get; set; } = "COMPLETED"; // PENDING, COMPLETED, FAILED, CANCELLED

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(500)]
        public string? ErrorMessage { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        // Foreign Keys
        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsPurchase => Type.Equals("PURCHASE", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsDeduction => Type.Equals("DEDUCTION", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsRefund => Type.Equals("REFUND", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsBonus => Type.Equals("BONUS", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsCompleted => Status.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsPending => Status.Equals("PENDING", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsFailed => Status.Equals("FAILED", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public string DisplayAmount => IsPurchase || IsBonus ? $"+${Amount:F2}" : $"-${Math.Abs(Amount):F2}";

        [NotMapped]
        public string DisplayName => $"{Type} - {Description} ({DisplayAmount})";
    }
}
