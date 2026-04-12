using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [StringLength(50)]
        public string TimeZone { get; set; } = "UTC";

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "Basic"; // Basic, Pro, Admin

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public bool EmailVerified { get; set; } = false;

        public bool TwoFactorEnabled { get; set; } = false;

        [StringLength(255)]
        public string? TwoFactorSecret { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<TradingAccount> TradingAccounts { get; set; } = new List<TradingAccount>();
        public virtual ICollection<Strategy> Strategies { get; set; } = new List<Strategy>();
        public virtual ICollection<CreditTransaction> CreditTransactions { get; set; } = new List<CreditTransaction>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
        public virtual UserCredits UserCredits { get; set; } = new UserCredits();

        // Computed properties
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();

        [NotMapped]
        public bool IsAdmin => Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsPro => Role.Equals("Pro", StringComparison.OrdinalIgnoreCase) || IsAdmin;
    }
}
