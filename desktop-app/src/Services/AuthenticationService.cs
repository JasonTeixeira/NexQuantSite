using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using QuantumTrader.Data;
using QuantumTrader.Models;
using BCrypt.Net;

namespace QuantumTrader.Services
{
    public class AuthenticationService
    {
        private readonly QuantumTraderDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ISecretsProvider _secrets;
        private readonly ILogger<AuthenticationService> _logger;

        public AuthenticationService(QuantumTraderDbContext context, IConfiguration configuration, ILogger<AuthenticationService> logger, ISecretsProvider secrets)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _secrets = secrets;
        }

        public async Task<AuthenticationResult> AuthenticateAsync(string username, string password)
        {
            try
            {
                _logger.LogInformation("Authenticating user: {Username}", username);

                // Find user by username or email
                var user = await _context.Users
                    .Include(u => u.UserCredits)
                    .FirstOrDefaultAsync(u => u.Username == username || u.Email == username);

                if (user == null)
                {
                    _logger.LogWarning("User not found: {Username}", username);
                    return new AuthenticationResult { Success = false, Message = "Invalid username or password" };
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("User account is inactive: {Username}", username);
                    return new AuthenticationResult { Success = false, Message = "Account is inactive" };
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    _logger.LogWarning("Invalid password for user: {Username}", username);
                    return new AuthenticationResult { Success = false, Message = "Invalid username or password" };
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);

                _logger.LogInformation("User authenticated successfully: {Username}", username);

                return new AuthenticationResult
                {
                    Success = true,
                    User = user,
                    Token = token,
                    Message = "Authentication successful"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for user: {Username}", username);
                return new AuthenticationResult { Success = false, Message = "Authentication failed" };
            }
        }

        public async Task<AuthenticationResult> RegisterAsync(string username, string email, string password, string firstName, string lastName)
        {
            try
            {
                _logger.LogInformation("Registering new user: {Username}", username);

                // Check if username or email already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == username || u.Email == email);

                if (existingUser != null)
                {
                    var message = existingUser.Username == username ? "Username already exists" : "Email already exists";
                    _logger.LogWarning("Registration failed - {Message}: {Username}", message, username);
                    return new AuthenticationResult { Success = false, Message = message };
                }

                // Validate password
                if (!ValidatePassword(password))
                {
                    return new AuthenticationResult { Success = false, Message = "Password does not meet requirements" };
                }

                // Create new user
                var user = new User
                {
                    Username = username,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    FirstName = firstName,
                    LastName = lastName,
                    Role = "Basic",
                    IsActive = true,
                    EmailVerified = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Create user credits
                var userCredits = new UserCredits
                {
                    UserId = user.Id,
                    Balance = _configuration.GetValue<decimal>("Credits:DefaultBalance", 100.00m),
                    TotalSpent = 0.00m,
                    TotalEarned = _configuration.GetValue<decimal>("Credits:DefaultBalance", 100.00m),
                    LastUpdatedAt = DateTime.UtcNow
                };

                _context.UserCredits.Add(userCredits);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = GenerateJwtToken(user);

                _logger.LogInformation("User registered successfully: {Username}", username);

                return new AuthenticationResult
                {
                    Success = true,
                    User = user,
                    Token = token,
                    Message = "Registration successful"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user: {Username}", username);
                return new AuthenticationResult { Success = false, Message = "Registration failed" };
            }
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            try
            {
                return await _context.Users
                    .Include(u => u.UserCredits)
                    .FirstOrDefaultAsync(u => u.Id == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {UserId}", userId);
                return null;
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return false;
                }

                // Verify current password
                if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
                {
                    return false;
                }

                // Validate new password
                if (!ValidatePassword(newPassword))
                {
                    return false;
                }

                // Update password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Password changed successfully for user: {Username}", user.Username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user ID: {UserId}", userId);
                return false;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _secrets.Get("Security:JwtSecret", _configuration["Security:JwtSecret"]);
            if (string.IsNullOrWhiteSpace(jwtSecret))
            {
                _logger.LogError("Missing Security:JwtSecret configuration.");
                throw new InvalidOperationException("JWT secret not configured");
            }
            var jwtExpirationHours = _configuration.GetValue<int>("Security:JwtExpirationHours", 24);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(jwtExpirationHours),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private bool ValidatePassword(string password)
        {
            var minLength = _configuration.GetValue<int>("Security:PasswordMinLength", 8);
            var requireSpecialChars = _configuration.GetValue<bool>("Security:RequireSpecialCharacters", true);

            if (password.Length < minLength)
                return false;

            if (requireSpecialChars && !password.Any(c => !char.IsLetterOrDigit(c)))
                return false;

            return true;
        }
    }

    public class AuthenticationResult
    {
        public bool Success { get; set; }
        public User? User { get; set; }
        public string? Token { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
