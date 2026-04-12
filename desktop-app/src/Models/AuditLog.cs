using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = string.Empty; // USER, ACCOUNT, STRATEGY, etc.

        [StringLength(100)]
        public string? EntityId { get; set; } // ID of the affected entity

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string? IpAddress { get; set; }

        [StringLength(500)]
        public string? UserAgent { get; set; }

        [StringLength(500)]
        public string? Details { get; set; } // JSON object with additional details

        [StringLength(20)]
        public string Severity { get; set; } = "INFO"; // INFO, WARNING, ERROR, CRITICAL

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool IsInfo => Severity.Equals("INFO", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsWarning => Severity.Equals("WARNING", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsError => Severity.Equals("ERROR", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public bool IsCritical => Severity.Equals("CRITICAL", StringComparison.OrdinalIgnoreCase);

        [NotMapped]
        public string DisplayName => $"{Action} {EntityType} - {Description}";
    }
}
