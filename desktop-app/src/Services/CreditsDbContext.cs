using Microsoft.EntityFrameworkCore;
using System;

namespace QuantumTrader.Services
{
	public class CreditsDbContext : DbContext
	{
		public CreditsDbContext(DbContextOptions<CreditsDbContext> options) : base(options) { }

		public DbSet<UserCreditsEntity> UserCredits { get; set; }
		public DbSet<CreditTransactionEntity> CreditTransactions { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<UserCreditsEntity>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.AvailableCredits).HasPrecision(18, 2);
				entity.Property(e => e.TotalCreditsPurchased).HasPrecision(18, 2);
				entity.Property(e => e.TotalCreditsSpent).HasPrecision(18, 2);
				entity.HasMany<CreditTransactionEntity>()
					.WithOne()
					.HasForeignKey(t => t.UserCreditsId)
					.OnDelete(DeleteBehavior.Cascade);
			});

			modelBuilder.Entity<CreditTransactionEntity>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Amount).HasPrecision(18, 2);
				entity.Property(e => e.BalanceAfter).HasPrecision(18, 2);
			});
		}
	}

	public class UserCreditsEntity
	{
		public int Id { get; set; }
		public string UserId { get; set; } = "default";
		public decimal AvailableCredits { get; set; }
		public decimal TotalCreditsPurchased { get; set; }
		public decimal TotalCreditsSpent { get; set; }
		public DateTime LastUpdated { get; set; }
	}

	public class CreditTransactionEntity
	{
		public int Id { get; set; }
		public int UserCreditsId { get; set; }
		public string Type { get; set; } = ""; // Purchase, Deduction, Refund
		public decimal Amount { get; set; }
		public decimal BalanceAfter { get; set; }
		public string PaymentMethod { get; set; } = "";
		public DateTime Timestamp { get; set; }
		public string Description { get; set; } = "";
	}
}
