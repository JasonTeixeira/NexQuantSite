using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using QuantumTrader.Data;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class NotificationService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly IConfiguration _configuration;

        public NotificationService(QuantumTraderDbContext context, ILogger<NotificationService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        // Notification Management
        public async Task<Notification> CreateNotificationAsync(int userId, string title, string message, NotificationType type, NotificationPriority priority = NotificationPriority.Normal)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    Priority = priority,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created notification for user {UserId}: {Title}", userId, title);
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(int userId, NotificationStatus? status = null, int? limit = null)
        {
            try
            {
                var query = _context.Notifications.Where(n => n.UserId == userId);

                if (status.HasValue)
                    query = query.Where(n => n.Status == status.Value);

                query = query.OrderByDescending(n => n.CreatedAt);

                if (limit.HasValue)
                    query = query.Take(limit.Value);

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                return new List<Notification>();
            }
        }

        public async Task MarkNotificationAsReadAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification != null)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
            }
        }

        public async Task MarkAllNotificationsAsReadAsync(int userId)
        {
            try
            {
                var unreadNotifications = await _context.Notifications
                    .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
                    .ToListAsync();

                foreach (var notification in unreadNotifications)
                {
                    notification.Status = NotificationStatus.Read;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Marked all notifications as read for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
            }
        }

        public async Task<int> GetUnreadNotificationCountAsync(int userId)
        {
            try
            {
                return await _context.Notifications
                    .CountAsync(n => n.UserId == userId && n.Status == NotificationStatus.Unread);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread notification count for user {UserId}", userId);
                return 0;
            }
        }

        // Trading Alerts
        public async Task CreateTradeAlertAsync(int userId, string symbol, decimal price, OrderSide side, decimal quantity, decimal pnl = 0)
        {
            var title = $"Trade Executed - {symbol}";
            var message = $"Your {side} order for {quantity} {symbol} at ${price:F2} has been executed. P&L: ${pnl:F2}";

            await CreateNotificationAsync(userId, title, message, NotificationType.Trade,
                pnl >= 0 ? NotificationPriority.Normal : NotificationPriority.High);
        }

        public async Task CreateRiskAlertAsync(int userId, string alertType, string message)
        {
            var title = $"Risk Alert - {alertType}";
            await CreateNotificationAsync(userId, title, message, NotificationType.Risk, NotificationPriority.High);
        }

        public async Task CreateStrategyAlertAsync(int userId, string strategyName, string alertType, string message)
        {
            var title = $"Strategy Alert - {strategyName}";
            var fullMessage = $"{alertType}: {message}";
            await CreateNotificationAsync(userId, title, fullMessage, NotificationType.Strategy, NotificationPriority.Medium);
        }

        public async Task CreateSystemAlertAsync(int userId, string alertType, string message)
        {
            var title = $"System Alert - {alertType}";
            await CreateNotificationAsync(userId, title, message, NotificationType.System, NotificationPriority.High);
        }

        // Position Alerts
        public async Task CreatePositionAlertAsync(int userId, string symbol, decimal currentPrice, decimal entryPrice, decimal unrealizedPnL)
        {
            var pnlPercentage = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
            var title = $"Position Update - {symbol}";
            var message = $"Current price: ${currentPrice:F2} | Entry: ${entryPrice:F2} | P&L: ${unrealizedPnL:F2} ({pnlPercentage:F2}%)";

            var priority = Math.Abs(pnlPercentage) > 10 ? NotificationPriority.High : NotificationPriority.Normal;
            await CreateNotificationAsync(userId, title, message, NotificationType.Position, priority);
        }

        // Stop Loss and Take Profit Alerts
        public async Task CreateStopLossAlertAsync(int userId, string symbol, decimal exitPrice, decimal entryPrice, decimal realizedPnL)
        {
            var title = $"Stop Loss Triggered - {symbol}";
            var message = $"Position closed at ${exitPrice:F2}. Entry: ${entryPrice:F2}. Realized P&L: ${realizedPnL:F2}";
            await CreateNotificationAsync(userId, title, message, NotificationType.Risk, NotificationPriority.High);
        }

        public async Task CreateTakeProfitAlertAsync(int userId, string symbol, decimal exitPrice, decimal entryPrice, decimal realizedPnL)
        {
            var title = $"Take Profit Triggered - {symbol}";
            var message = $"Position closed at ${exitPrice:F2}. Entry: ${entryPrice:F2}. Realized P&L: ${realizedPnL:F2}";
            await CreateNotificationAsync(userId, title, message, NotificationType.Trade, NotificationPriority.Normal);
        }

        // Account Alerts
        public async Task CreateAccountAlertAsync(int userId, string alertType, string message)
        {
            var title = $"Account Alert - {alertType}";
            await CreateNotificationAsync(userId, title, message, NotificationType.Account, NotificationPriority.Medium);
        }

        public async Task CreateBalanceAlertAsync(int userId, decimal currentBalance, decimal previousBalance)
        {
            var change = currentBalance - previousBalance;
            var changePercentage = previousBalance > 0 ? (change / previousBalance) * 100 : 0;

            var title = "Account Balance Update";
            var message = $"Current balance: ${currentBalance:F2} | Change: ${change:F2} ({changePercentage:F2}%)";

            var priority = Math.Abs(changePercentage) > 5 ? NotificationPriority.High : NotificationPriority.Normal;
            await CreateNotificationAsync(userId, title, message, NotificationType.Account, priority);
        }

        // Strategy Performance Alerts
        public async Task CreateStrategyPerformanceAlertAsync(int userId, string strategyName, decimal dailyReturn, decimal totalReturn)
        {
            var title = $"Strategy Performance - {strategyName}";
            var message = $"Daily return: {dailyReturn:F2}% | Total return: {totalReturn:F2}%";

            var priority = dailyReturn < -5 || dailyReturn > 10 ? NotificationPriority.High : NotificationPriority.Normal;
            await CreateNotificationAsync(userId, title, message, NotificationType.Strategy, priority);
        }

        // Market Alerts
        public async Task CreateMarketAlertAsync(int userId, string symbol, decimal price, string alertType, string message)
        {
            var title = $"Market Alert - {symbol}";
            var fullMessage = $"{alertType}: ${price:F2} - {message}";
            await CreateNotificationAsync(userId, title, fullMessage, NotificationType.Market, NotificationPriority.Medium);
        }

        // Credit System Alerts
        public async Task CreateCreditAlertAsync(int userId, decimal creditsUsed, decimal remainingCredits, string operation)
        {
            var title = "Credit Usage Alert";
            var message = $"Used {creditsUsed} credits for {operation}. Remaining: {remainingCredits} credits";

            var priority = remainingCredits < 10 ? NotificationPriority.High : NotificationPriority.Normal;
            await CreateNotificationAsync(userId, title, message, NotificationType.System, priority);
        }

        // Bulk Notifications
        public async Task CreateBulkNotificationAsync(List<int> userIds, string title, string message, NotificationType type, NotificationPriority priority = NotificationPriority.Normal)
        {
            try
            {
                var notifications = userIds.Select(userId => new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    Priority = priority,
                    Status = NotificationStatus.Unread,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created bulk notification for {UserCount} users: {Title}", userIds.Count, title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bulk notification for {UserCount} users", userIds.Count);
            }
        }

        // Notification Cleanup
        public async Task CleanupOldNotificationsAsync(int daysToKeep = 30)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
                var oldNotifications = await _context.Notifications
                    .Where(n => n.CreatedAt < cutoffDate && n.Status == NotificationStatus.Read)
                    .ToListAsync();

                _context.Notifications.RemoveRange(oldNotifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleaned up {Count} old notifications", oldNotifications.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old notifications");
            }
        }

        // Notification Statistics
        public async Task<NotificationStatistics> GetNotificationStatisticsAsync(int userId, DateTime? fromDate = null)
        {
            try
            {
                var query = _context.Notifications.Where(n => n.UserId == userId);

                if (fromDate.HasValue)
                    query = query.Where(n => n.CreatedAt >= fromDate.Value);

                var notifications = await query.ToListAsync();

                return new NotificationStatistics
                {
                    TotalNotifications = notifications.Count,
                    UnreadCount = notifications.Count(n => n.Status == NotificationStatus.Unread),
                    ReadCount = notifications.Count(n => n.Status == NotificationStatus.Read),
                    HighPriorityCount = notifications.Count(n => n.Priority == NotificationPriority.High),
                    TradeNotifications = notifications.Count(n => n.Type == NotificationType.Trade),
                    RiskNotifications = notifications.Count(n => n.Type == NotificationType.Risk),
                    StrategyNotifications = notifications.Count(n => n.Type == NotificationType.Strategy),
                    SystemNotifications = notifications.Count(n => n.Type == NotificationType.System)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification statistics for user {UserId}", userId);
                return new NotificationStatistics();
            }
        }
    }

    // Data Models
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public NotificationPriority Priority { get; set; }
        public NotificationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public User User { get; set; }
    }

    public class NotificationStatistics
    {
        public int TotalNotifications { get; set; }
        public int UnreadCount { get; set; }
        public int ReadCount { get; set; }
        public int HighPriorityCount { get; set; }
        public int TradeNotifications { get; set; }
        public int RiskNotifications { get; set; }
        public int StrategyNotifications { get; set; }
        public int SystemNotifications { get; set; }
    }

    public enum NotificationType
    {
        Trade,
        Risk,
        Strategy,
        System,
        Account,
        Position,
        Market
    }

    public enum NotificationPriority
    {
        Low,
        Normal,
        High,
        Critical
    }

    public enum NotificationStatus
    {
        Unread,
        Read
    }
}
