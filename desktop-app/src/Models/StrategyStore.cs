using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;

namespace QuantumTrader.Models
{
    /// <summary>
    /// Professional Strategy Store Models
    /// Comprehensive marketplace for trading strategies
    /// </summary>
    public class StrategyStoreItem : INotifyPropertyChanged
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DetailedDescription { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
        public string Version { get; set; } = "1.0.0";

        // Pricing and Access
        public decimal Price { get; set; } = 0m;
        public bool IsFree { get; set; } = true;
        public bool IsPremium { get; set; } = false;
        public string LicenseType { get; set; } = "Standard"; // Standard, Premium, Enterprise, Lifetime
        public int MaxAccounts { get; set; } = 1;
        public bool HasTrial { get; set; } = false;
        public int TrialDays { get; set; } = 0;

        // Ratings and Reviews
        public decimal Rating { get; set; } = 0m;
        public int ReviewCount { get; set; } = 0;
        public int Downloads { get; set; } = 0;
        public int ActiveUsers { get; set; } = 0;

        // Strategy Classification
        public string Category { get; set; } = string.Empty;
        public string TradingStyle { get; set; } = string.Empty; // Scalping, Day Trading, Swing, Position
        public List<string> Markets { get; set; } = new(); // Stocks, Forex, Crypto, Futures, Options
        public string Complexity { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced, Expert
        public List<string> Tags { get; set; } = new();

        // Performance Metrics
        public decimal BacktestReturn { get; set; } = 0m;
        public decimal LiveReturn { get; set; } = 0m;
        public double SharpeRatio { get; set; } = 0;
        public double SortinoRatio { get; set; } = 0;
        public decimal MaxDrawdown { get; set; } = 0m;
        public double WinRate { get; set; } = 0;
        public double ProfitFactor { get; set; } = 0;
        public int TotalTrades { get; set; } = 0;
        public decimal MonthlyReturn { get; set; } = 0m;
        public double Volatility { get; set; } = 0;

        // Media and Documentation
        public string ThumbnailUrl { get; set; } = string.Empty;
        public List<string> ScreenshotUrls { get; set; } = new();
        public string VideoUrl { get; set; } = string.Empty;
        public string DocumentationUrl { get; set; } = string.Empty;

        // Status and Verification
        public string Status { get; set; } = "Active"; // Active, Inactive, Under Review, Suspended
        public bool IsVerified { get; set; } = false;
        public bool IsFeatured { get; set; } = false;
        public bool IsNew { get; set; } = false;
        public bool IsBestseller { get; set; } = false;

        // Purchase Information
        public bool IsPurchased { get; set; } = false;
        public DateTime? PurchaseDate { get; set; }
        public string? LicenseKey { get; set; }
        public DateTime? LicenseExpiry { get; set; }

        // Formatted properties for UI binding
        public string PriceFormatted => IsFree ? "FREE" : $"${Price:F0}";
        public string RatingFormatted => $"{Rating:F1} ⭐ ({ReviewCount:N0} reviews)";
        public string DownloadsFormatted => $"{Downloads:N0} downloads";
        public string ActiveUsersFormatted => $"{ActiveUsers:N0} active users";
        public string BacktestReturnFormatted => $"{BacktestReturn:F1}%";
        public string LiveReturnFormatted => $"{LiveReturn:F1}%";
        public string SharpeRatioFormatted => SharpeRatio.ToString("F2");
        public string WinRateFormatted => $"{WinRate:F1}%";
        public string ProfitFactorFormatted => ProfitFactor.ToString("F2");
        public string ComplexityColor => Complexity switch
        {
            "Beginner" => "Green",
            "Intermediate" => "Orange",
            "Advanced" => "Red",
            "Expert" => "Purple",
            _ => "White"
        };

        public event PropertyChangedEventHandler? PropertyChanged;
        protected virtual void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class StrategyReview
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string StrategyId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserAvatar { get; set; } = string.Empty;
        public decimal Rating { get; set; } = 0m;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public bool IsVerified { get; set; } = false;
        public int HelpfulVotes { get; set; } = 0;

        // Performance data from user's live trading
        public decimal? UserReturn { get; set; }
        public int? UserTrades { get; set; }
        public double? UserWinRate { get; set; }
        public string? UserAccountType { get; set; }
        public int UsageDays { get; set; } = 0;

        public string RatingStars
        {
            get
            {
                var stars = "";
                for (int i = 1; i <= 5; i++)
                {
                    stars += i <= Rating ? "⭐" : "☆";
                }
                return stars;
            }
        }

        public string FormattedDate => CreatedDate.ToString("MMM dd, yyyy");
        public string UserReturnFormatted => UserReturn?.ToString("F1") + "%" ?? "N/A";
        public string UserWinRateFormatted => UserWinRate?.ToString("F1") + "%" ?? "N/A";
    }

    public class StrategyPurchase
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string StrategyId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; } = DateTime.Now;
        public decimal PurchasePrice { get; set; }
        public string LicenseType { get; set; } = string.Empty;
        public string LicenseKey { get; set; } = string.Empty;
        public DateTime? LicenseExpiry { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = "Active"; // Active, Expired, Cancelled, Refunded
        public int MaxAccounts { get; set; } = 1;
        public List<string> AssignedAccounts { get; set; } = new();
    }

    public class StrategyStoreCategory
    {
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int StrategyCount { get; set; } = 0;
        public bool IsFeatured { get; set; } = false;
        public List<StrategyStoreItem> FeaturedStrategies { get; set; } = new();
    }

    public class StrategyStoreFilter
    {
        public List<string> Categories { get; set; } = new();
        public List<string> TradingStyles { get; set; } = new();
        public List<string> Markets { get; set; } = new();
        public List<string> Complexities { get; set; } = new();
        public decimal MinPrice { get; set; } = 0m;
        public decimal MaxPrice { get; set; } = 10000m;
        public decimal MinRating { get; set; } = 0m;
        public decimal MinReturn { get; set; } = 0m;
        public bool FreeOnly { get; set; } = false;
        public bool PremiumOnly { get; set; } = false;
        public bool VerifiedOnly { get; set; } = false;
        public string SortBy { get; set; } = "Featured"; // Featured, Newest, Price, Rating, Downloads, Performance
        public string SearchTerm { get; set; } = string.Empty;
    }

    public class UserSubscription
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public decimal MonthlyPrice { get; set; } = 0m;
        public DateTime StartDate { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public int MaxStrategies { get; set; } = 5;
        public int MaxAccounts { get; set; } = 3;
        public bool HasPremiumSupport { get; set; } = false;
        public bool HasBacktestingAccess { get; set; } = true;
        public bool HasAdvancedAnalytics { get; set; } = false;
        public List<string> IncludedFeatures { get; set; } = new();
    }
}
