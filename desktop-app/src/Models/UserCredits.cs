using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuantumTrader.Models
{
    [Table("UserCredits")]
    public class UserCredits
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalSpent { get; set; } = 0.00m;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalEarned { get; set; } = 0.00m;

        public DateTime? LastUpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;

        // Computed properties
        [NotMapped]
        public bool HasCredits => Balance > 0;

        [NotMapped]
        public bool IsLowBalance => Balance < 10.00m;

        [NotMapped]
        public string DisplayBalance => $"${Balance:F2}";

        [NotMapped]
        public string DisplayTotalSpent => $"${TotalSpent:F2}";

        [NotMapped]
        public string DisplayTotalEarned => $"${TotalEarned:F2}";
    }
}
