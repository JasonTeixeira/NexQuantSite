# NexQuantSite Authentication System

## 🔐 Overview

The NexQuantSite authentication system is a comprehensive, secure, and scalable solution for user authentication and authorization. It implements modern security best practices including:

- JWT token-based authentication with access and refresh tokens
- Secure token rotation to prevent token theft and replay attacks
- Rate limiting to prevent brute force attacks
- Comprehensive audit logging for security monitoring and compliance
- Role-based access control (RBAC)
- Session management with verification
- Secure cookie handling
- Input validation

## 🏗️ Architecture

The authentication system is built with a modular architecture that separates concerns and allows for easy maintenance and extension:

```
lib/auth/
├── jwt-service.ts         # JWT token generation, validation, and rotation
├── rate-limiter.ts        # Rate limiting for API endpoints
├── audit-logger.ts        # Security event logging and auditing
├── auth-middleware.ts     # Route protection middleware
└── production-auth.ts     # Core authentication business logic

app/api/auth/
└── tokens/                # Authentication API endpoints
    └── route.ts           # Login, logout, token refresh, validation
```

## 🧩 Components

### JWT Service

The JWT service (`lib/auth/jwt-service.ts`) handles token generation, validation, and rotation. It implements:

- Short-lived access tokens and longer-lived refresh tokens
- Secure token rotation to prevent token theft
- Redis-based token tracking for invalidation
- Token blacklisting for immediate revocation

### Rate Limiter

The rate limiter (`lib/auth/rate-limiter.ts`) protects authentication endpoints from abuse:

- IP-based and user-based rate limiting
- Configurable attempt limits, windows, and block durations
- Different rate limit policies for different actions (login, registration, etc.)
- Redis-based storage for distributed deployments

### Audit Logger

The audit logger (`lib/auth/audit-logger.ts`) records security events for monitoring and compliance:

- Detailed event categories and types for security analysis
- Severity levels for easy filtering
- Queryable event store for security investigations
- Integration with monitoring systems for alerts

### Authentication Middleware

The auth middleware (`lib/auth/auth-middleware.ts`) protects API routes:

- Token validation and verification
- Role-based access control
- Session verification
- Easy-to-use higher-order function for route protection

### Token Authentication API

The token API (`app/api/auth/tokens/route.ts`) provides endpoints for:

- Login and initial token generation
- Token refresh for extending sessions
- Logout and token invalidation
- Token validation and user information retrieval

## 🚀 Usage Examples

### Protecting an API Route

```typescript
import { withAuth, UserRole } from '@/lib/auth/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

// Regular users can access this endpoint
export const GET = withAuth(
  async (req: NextRequest) => {
    const userId = req.headers.get('x-user-id');
    // Implementation...
    return NextResponse.json({ success: true, data: {...} });
  },
  { requiredRole: UserRole.USER }
);

// Only admins can access this endpoint
export const POST = withAuth(
  async (req: NextRequest) => {
    // Implementation...
    return NextResponse.json({ success: true, message: 'Created' });
  },
  { requiredRole: UserRole.ADMIN }
);
```

### Custom Middleware Usage

```typescript
import { createAuthMiddleware, UserRole } from '@/lib/auth/auth-middleware';

// Create custom auth middleware for premium users
const premiumAuthMiddleware = createAuthMiddleware({
  requiredRole: UserRole.PREMIUM,
  verifySession: true
});

// Use in your route handler
export async function GET(req: NextRequest) {
  // Apply middleware
  const middlewareResult = await premiumAuthMiddleware(req);
  if (middlewareResult) {
    return middlewareResult; // Return error response if auth failed
  }
  
  // Continue with route handler if auth passed
  // ...implementation
}
```

### Login Flow

```typescript
// Client-side code
async function login(email, password) {
  const response = await fetch('/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    // Login successful, access token is stored in HTTP-only cookie
    // Store user data in client state
    return data.user;
  } else {
    // Handle login error
    throw new Error(data.message);
  }
}
```

### Token Refresh Flow

```typescript
// Client-side code
async function refreshToken() {
  const response = await fetch('/api/auth/tokens', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  if (data.success) {
    // Token refreshed successfully, new tokens in HTTP-only cookies
    return data.user;
  } else {
    // Handle refresh error, redirect to login
    throw new Error(data.message);
  }
}
```

## 🔒 Security Features

### JWT Security

- Short-lived access tokens (15 minutes by default)
- Longer-lived refresh tokens (7 days by default)
- Token rotation on refresh to prevent theft
- Immediate token invalidation on logout
- Token blacklisting for compromised tokens
- Redis-based token tracking

### Rate Limiting

- Protects authentication endpoints from brute force attacks
- IP-based and user-based rate limiting
- Progressive blocking for repeated failures
- Configurable attempt limits and time windows

### Audit Logging

- Comprehensive logging of authentication events
- Security event tracking for compliance
- Detailed context for security investigations
- Integration with monitoring systems

### Cookie Security

- HTTP-only cookies to prevent XSS attacks
- Secure flag for HTTPS-only transmission
- SameSite strict to prevent CSRF attacks
- Properly managed expirations

## ⚙️ Configuration

The authentication system can be configured through environment variables:

```
# JWT Configuration
JWT_SECRET=your_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Rate Limiting
ENABLE_RATE_LIMIT=true
RATE_LIMIT_LOGIN_MAX_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW_MS=300000
RATE_LIMIT_LOGIN_BLOCK_DURATION_MS=900000

# Redis Configuration (for token and rate limit storage)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Audit Logging
ENABLE_AUDIT_LOGGING=true
```

## 🔍 Debugging and Monitoring

The authentication system includes detailed logging for debugging and monitoring:

- Authentication failures with reasons
- Rate limit hits and blocks
- Token validation issues
- Suspicious activity detection

## 🧪 Testing

To test the authentication system:

1. Use the login endpoint to obtain tokens:
   ```
   POST /api/auth/tokens
   { "email": "user@example.com", "password": "password" }
   ```

2. Access a protected endpoint using the token in cookies:
   ```
   GET /api/user/profile
   ```

3. Refresh tokens when needed:
   ```
   PUT /api/auth/tokens
   ```

4. Logout to invalidate tokens:
   ```
   DELETE /api/auth/tokens
   ```

## 🛠️ Future Improvements

- Multi-factor authentication support
- OAuth/Social login integration
- Enhanced fraud detection
- Device fingerprinting
- Geographic access restrictions
- Permission-based access control (beyond roles)
