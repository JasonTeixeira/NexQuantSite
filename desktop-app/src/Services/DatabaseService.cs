using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuantumTrader.Data;
using QuantumTrader.Models;
using BCrypt.Net;

namespace QuantumTrader.Services
{
    public class DatabaseService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly ILogger<DatabaseService> _logger;

        public DatabaseService(QuantumTraderDbContext context, ILogger<DatabaseService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task InitializeDatabaseAsync()
        {
            try
            {
                _logger.LogInformation("Initializing database...");

                // Ensure database is created
                await _context.Database.EnsureCreatedAsync();

                // Apply any pending migrations
                if (_context.Database.GetPendingMigrations().Any())
                {
                    _logger.LogInformation("Applying database migrations...");
                    await _context.Database.MigrateAsync();
                }

                // Seed initial data if database is empty
                if (!await _context.Users.AnyAsync())
                {
                    _logger.LogInformation("Seeding initial data...");
                    await SeedInitialDataAsync();
                }

                _logger.LogInformation("Database initialization completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing database");
                throw;
            }
        }

        private async Task SeedInitialDataAsync()
        {
            try
            {
                // Create default admin user
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@elitetradingml.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    FirstName = "System",
                    LastName = "Administrator",
                    Role = "Admin",
                    IsActive = true,
                    EmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(adminUser);
                await _context.SaveChangesAsync();

                // Create user credits for admin
                var adminCredits = new UserCredits
                {
                    UserId = adminUser.Id,
                    Balance = 1000.00m, // Give admin some initial credits
                    TotalSpent = 0.00m,
                    TotalEarned = 1000.00m,
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.UserCredits.Add(adminCredits);

                // Create demo trading account
                var demoAccount = new TradingAccount
                {
                    UserId = adminUser.Id,
                    Name = "Demo Account",
                    Type = "DEMO",
                    Broker = "NinjaTrader",
                    Balance = 100000.00m,
                    Equity = 100000.00m,
                    PnL = 0.00m,
                    DailyPnL = 0.00m,
                    Status = "ACTIVE",
                    IsEnabled = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TradingAccounts.Add(demoAccount);
                await _context.SaveChangesAsync();

                // Create account risk settings
                var accountRiskSettings = new AccountRiskSettings
                {
                    TradingAccountId = demoAccount.Id,
                    MaxDailyLoss = 5.00m,
                    MaxPositionSize = 10.00m,
                    StopLoss = 2.00m,
                    TakeProfit = 4.00m,
                    MaxOpenPositions = 5.00m,
                    CorrelationLimit = 0.70m,
                    AutoScaling = true,
                    DynamicStopLoss = false,
                    TrailingStop = false,
                    EmergencyStopEnabled = true,
                    EmergencyStopThreshold = 10.00m,
                    RiskCalculationMethod = "FIXED_PERCENTAGE",
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.AccountRiskSettings.Add(accountRiskSettings);

                // Create account schedule settings
                var accountScheduleSettings = new AccountScheduleSettings
                {
                    TradingAccountId = demoAccount.Id,
                    IsEnabled = true,
                    StartTime = new TimeSpan(9, 30, 0),
                    EndTime = new TimeSpan(16, 0, 0),
                    Monday = true,
                    Tuesday = true,
                    Wednesday = true,
                    Thursday = true,
                    Friday = true,
                    Saturday = false,
                    Sunday = false,
                    RespectMarketHolidays = true,
                    AutoStartTrading = false,
                    AutoStopTrading = false,
                    TimeZone = "Eastern Standard Time",
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.AccountScheduleSettings.Add(accountScheduleSettings);

                // Create demo strategy
                var demoStrategy = new Strategy
                {
                    UserId = adminUser.Id,
                    Name = "Demo Mean Reversion Strategy",
                    Description = "A simple mean reversion strategy for demonstration purposes",
                    Type = "CUSTOM",
                    Category = "MEAN_REVERSION",
                    RiskLevel = "MEDIUM",
                    Status = "ACTIVE",
                    IsEnabled = true,
                    IsEncrypted = false,
                    MonthlyFee = 0.00m,
                    TotalReturn = 15.50m,
                    SharpeRatio = 1.85m,
                    MaxDrawdown = 8.30m,
                    WinRate = 65.20m,
                    TotalTrades = 150,
                    WinningTrades = 98,
                    LosingTrades = 52,
                    Timeframe = "5min",
                    Instruments = "[\"ES\", \"NQ\"]",
                    Code = "# Demo Mean Reversion Strategy\n# This is a placeholder for the actual strategy code",
                    Parameters = "{\"rsi_period\": 14, \"overbought\": 70, \"oversold\": 30}",
                    Version = "1.0.0",
                    Author = "System",
                    Rating = 4.5m,
                    RatingCount = 1,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Strategies.Add(demoStrategy);
                await _context.SaveChangesAsync();

                // Create strategy risk settings
                var strategyRiskSettings = new StrategyRiskSettings
                {
                    StrategyId = demoStrategy.Id,
                    MaxPositionSize = 5.00m,
                    StopLoss = 2.00m,
                    TakeProfit = 4.00m,
                    AllocationPercentage = 25.00m,
                    MaxContracts = 10,
                    MinContracts = 1,
                    IsEnabled = true,
                    UseDynamicSizing = false,
                    ConfidenceThreshold = 0.70m,
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.StrategyRiskSettings.Add(strategyRiskSettings);

                // Create demo backtest
                var demoBacktest = new StrategyBacktest
                {
                    StrategyId = demoStrategy.Id,
                    Name = "Initial Backtest",
                    Description = "Initial backtest for demo strategy",
                    StartDate = DateTime.Today.AddDays(-30),
                    EndDate = DateTime.Today,
                    TotalReturn = 15.50m,
                    SharpeRatio = 1.85m,
                    MaxDrawdown = 8.30m,
                    WinRate = 65.20m,
                    ProfitFactor = 1.45m,
                    TotalTrades = 150,
                    WinningTrades = 98,
                    LosingTrades = 52,
                    AverageWin = 125.50m,
                    AverageLoss = 85.30m,
                    LargestWin = 450.00m,
                    LargestLoss = 200.00m,
                    SortinoRatio = 2.10m,
                    CalmarRatio = 1.87m,
                    Volatility = 12.50m,
                    Beta = 0.85m,
                    Alpha = 2.30m,
                    Status = "COMPLETED",
                    Parameters = "{\"start_date\": \"2024-01-01\", \"end_date\": \"2024-01-31\", \"initial_capital\": 100000}",
                    Results = "{\"equity_curve\": [], \"trade_log\": []}",
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    ExecutionTime = TimeSpan.FromSeconds(45)
                };

                _context.StrategyBacktests.Add(demoBacktest);

                // Create demo performance records
                for (int i = 0; i < 30; i++)
                {
                    var random = new Random(i);
                    var dailyReturn = (decimal)(random.NextDouble() * 2 - 1) * 2; // -2% to +2%
                    var cumulativeReturn = 15.50m * (i + 1) / 30;
                    var drawdown = Math.Max(0, (decimal)(random.NextDouble() * 8.30m));

                    var performance = new StrategyPerformance
                    {
                        StrategyId = demoStrategy.Id,
                        Date = DateTime.Today.AddDays(-29 + i),
                        DailyReturn = dailyReturn,
                        CumulativeReturn = cumulativeReturn,
                        Drawdown = drawdown,
                        Volatility = 12.50m,
                        TradesCount = random.Next(3, 8),
                        WinningTrades = random.Next(2, 6),
                        LosingTrades = random.Next(1, 4),
                        SharpeRatio = 1.85m,
                        SortinoRatio = 2.10m,
                        CalmarRatio = 1.87m
                    };

                    _context.StrategyPerformance.Add(performance);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Initial data seeded successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding initial data");
                throw;
            }
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                await _context.Database.CanConnectAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection test failed");
                return false;
            }
        }

        public async Task<string> GetDatabaseInfoAsync()
        {
            try
            {
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();
                var connectionString = _context.Database.GetConnectionString();

                return $"Database: {_context.Database.ProviderName}\n" +
                       $"Connection: {connectionString}\n" +
                       $"Applied Migrations: {appliedMigrations.Count()}\n" +
                       $"Pending Migrations: {pendingMigrations.Count()}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting database info");
                return $"Error: {ex.Message}";
            }
        }
    }
}
