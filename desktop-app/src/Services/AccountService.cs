using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuantumTrader.Data;
using QuantumTrader.Models;

namespace QuantumTrader.Services
{
    public class AccountService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly ILogger<AccountService> _logger;

        public AccountService(QuantumTraderDbContext context, ILogger<AccountService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Account Management
        public async Task<TradingAccount> CreateAccountAsync(int userId, string accountName, decimal initialBalance, string brokerType = "Demo")
        {
            try
            {
                var account = new TradingAccount
                {
                    UserId = userId,
                    AccountName = accountName,
                    Balance = initialBalance,
                    AvailableBalance = initialBalance,
                    BrokerType = brokerType,
                    Status = AccountStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.TradingAccounts.Add(account);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new trading account {AccountName} for user {UserId}", accountName, userId);
                return account;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating trading account for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TradingAccount> GetAccountAsync(int accountId)
        {
            return await _context.TradingAccounts
                .Include(a => a.Positions)
                .Include(a => a.Orders)
                .Include(a => a.Trades)
                .FirstOrDefaultAsync(a => a.Id == accountId);
        }

        public async Task<List<TradingAccount>> GetUserAccountsAsync(int userId)
        {
            return await _context.TradingAccounts
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.LastUpdated)
                .ToListAsync();
        }

        public async Task UpdateAccountBalanceAsync(int accountId, decimal newBalance, decimal newAvailableBalance)
        {
            var account = await _context.TradingAccounts.FindAsync(accountId);
            if (account != null)
            {
                account.Balance = newBalance;
                account.AvailableBalance = newAvailableBalance;
                account.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Position Management
        public async Task<Position> OpenPositionAsync(int accountId, string symbol, decimal quantity, decimal price, OrderSide side)
        {
            try
            {
                var position = new Position
                {
                    AccountId = accountId,
                    Symbol = symbol,
                    Quantity = quantity,
                    EntryPrice = price,
                    CurrentPrice = price,
                    Side = side,
                    Status = PositionStatus.Open,
                    OpenedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.Positions.Add(position);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Opened position for {Symbol} on account {AccountId}", symbol, accountId);
                return position;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error opening position for account {AccountId}", accountId);
                throw;
            }
        }

        public async Task<Position> GetPositionAsync(int positionId)
        {
            return await _context.Positions
                .Include(p => p.Account)
                .FirstOrDefaultAsync(p => p.Id == positionId);
        }

        public async Task<List<Position>> GetAccountPositionsAsync(int accountId)
        {
            return await _context.Positions
                .Where(p => p.AccountId == accountId && p.Status == PositionStatus.Open)
                .OrderByDescending(p => p.OpenedAt)
                .ToListAsync();
        }

        public async Task UpdatePositionPriceAsync(int positionId, decimal newPrice)
        {
            var position = await _context.Positions.FindAsync(positionId);
            if (position != null)
            {
                position.CurrentPrice = newPrice;
                position.UnrealizedPnL = CalculateUnrealizedPnL(position);
                position.LastUpdated = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClosePositionAsync(int positionId, decimal exitPrice, decimal commission = 0)
        {
            var position = await _context.Positions.FindAsync(positionId);
            if (position != null)
            {
                position.ExitPrice = exitPrice;
                position.RealizedPnL = CalculateRealizedPnL(position, commission);
                position.Status = PositionStatus.Closed;
                position.ClosedAt = DateTime.UtcNow;
                position.LastUpdated = DateTime.UtcNow;

                // Create trade record
                var trade = new Trade
                {
                    AccountId = position.AccountId,
                    Symbol = position.Symbol,
                    Quantity = position.Quantity,
                    EntryPrice = position.EntryPrice,
                    ExitPrice = exitPrice,
                    Commission = commission,
                    RealizedPnL = position.RealizedPnL,
                    Side = position.Side,
                    ExecutedAt = DateTime.UtcNow
                };

                _context.Trades.Add(trade);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Closed position {PositionId} for {Symbol}", positionId, position.Symbol);
            }
        }

        // Order Management
        public async Task<Order> PlaceOrderAsync(int accountId, string symbol, OrderSide side, OrderType type, decimal quantity, decimal? price = null)
        {
            try
            {
                var order = new Order
                {
                    AccountId = accountId,
                    Symbol = symbol,
                    Side = side,
                    Type = type,
                    Quantity = quantity,
                    Price = price,
                    Status = OrderStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Placed {Type} order for {Symbol} on account {AccountId}", type, symbol, accountId);
                return order;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error placing order for account {AccountId}", accountId);
                throw;
            }
        }

        public async Task<Order> GetOrderAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.Account)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<List<Order>> GetAccountOrdersAsync(int accountId, OrderStatus? status = null)
        {
            var query = _context.Orders.Where(o => o.AccountId == accountId);
            if (status.HasValue)
                query = query.Where(o => o.Status == status.Value);

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        public async Task UpdateOrderStatusAsync(int orderId, OrderStatus status, decimal? filledPrice = null, decimal? filledQuantity = null)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order != null)
            {
                order.Status = status;
                if (filledPrice.HasValue) order.FilledPrice = filledPrice.Value;
                if (filledQuantity.HasValue) order.FilledQuantity = filledQuantity.Value;
                order.LastUpdated = DateTime.UtcNow;

                if (status == OrderStatus.Filled)
                    order.FilledAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }
        }

        // Trade History
        public async Task<List<Trade>> GetAccountTradesAsync(int accountId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Trades.Where(t => t.AccountId == accountId);

            if (fromDate.HasValue)
                query = query.Where(t => t.ExecutedAt >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(t => t.ExecutedAt <= toDate.Value);

            return await query.OrderByDescending(t => t.ExecutedAt).ToListAsync();
        }

        public async Task<decimal> GetAccountTotalPnLAsync(int accountId)
        {
            return await _context.Trades
                .Where(t => t.AccountId == accountId)
                .SumAsync(t => t.RealizedPnL);
        }

        // Helper Methods
        private decimal CalculateUnrealizedPnL(Position position)
        {
            if (position.Side == OrderSide.Buy)
                return (position.CurrentPrice - position.EntryPrice) * position.Quantity;
            else
                return (position.EntryPrice - position.CurrentPrice) * position.Quantity;
        }

        private decimal CalculateRealizedPnL(Position position, decimal commission)
        {
            if (position.Side == OrderSide.Buy)
                return (position.ExitPrice.Value - position.EntryPrice) * position.Quantity - commission;
            else
                return (position.EntryPrice - position.ExitPrice.Value) * position.Quantity - commission;
        }
    }
}
