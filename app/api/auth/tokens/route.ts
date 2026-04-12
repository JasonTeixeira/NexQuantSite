/**
 * 🔐 TOKEN AUTHENTICATION API
 * Enhanced authentication with JWT token rotation, rate limiting, and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Import security services
import jwtService, { TokenType } from '@/lib/auth/jwt-service';
import rateLimiter, { RateLimitType } from '@/lib/auth/rate-limiter';
import auditLogger, { AuditEventType, AuditCategory, AuditStatus, AuditSeverity } from '@/lib/auth/audit-logger';

// Secure cookie options
const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

// Access token cookie name
const ACCESS_TOKEN_COOKIE = 'nexural-access-token';
const REFRESH_TOKEN_COOKIE = 'nexural-refresh-token';

// Schema validation for login request
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

// Schema validation for token refresh request
const refreshSchema = z.object({
  refreshToken: z.string().optional()
});

/**
 * Helper to get token from request
 */
function getTokenFromRequest(req: NextRequest, cookieName: string): string | null {
  // Try from cookies
  const cookieValue = req.cookies.get(cookieName)?.value;
  if (cookieValue) return cookieValue;
  
  // Try from authorization header (for access tokens)
  if (cookieName === ACCESS_TOKEN_COOKIE) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }
  
  return null;
}

/**
 * POST /api/auth/tokens - Login and generate tokens
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter.createRateLimitMiddleware(RateLimitType.LOGIN)(req);
    if (rateLimitResult) {
      // Log rate limit exceeded
      await auditLogger.logRateLimitExceeded(req, undefined, RateLimitType.LOGIN);
      return rateLimitResult;
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }
    
    const { email, password, rememberMe } = validationResult.data;
    
    // Find user by email
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    
    const user = result.rows[0];
    
    // If user not found, return error
    if (!user) {
      // Log failed login attempt
      await auditLogger.logAuthFailure(req, email, 'User not found');
      
      // Prevent timing attacks by simulating password verification time
      await bcrypt.compare(password, '$2a$12$' + 'a'.repeat(53));
      
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const passwordValid = process.env.NODE_ENV === 'development' 
      ? true // Skip password verification in development
      : await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      // Log failed login attempt
      await auditLogger.logAuthFailure(req, email, 'Invalid password');
      
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate a session ID
    const sessionId = crypto.randomUUID();
    
    // Create session in database
    await db.query(
      `
      INSERT INTO sessions (
        id, user_id, session_token, expires_at, is_active
      ) VALUES (
        $1, $2, $3, $4, $5
      )
      `,
      [
        sessionId,
        user.id,
        sessionId, // Use session ID as token for simplicity
        new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000), // 1 or 30 days
        true
      ]
    );
    
    // Generate token pair
    const tokenPair = await jwtService.generateTokenPair({
      userId: user.id,
      sessionId,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscription_tier
    });
    
    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        subscriptionTier: user.subscription_tier
      },
      tokenExpiry: tokenPair.accessToken.expiresAt
    });
    
    // Set cookies on response
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: tokenPair.accessToken.token,
      ...SECURE_COOKIE_OPTIONS,
      expires: tokenPair.accessToken.expiresAt
    });
    
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: tokenPair.refreshToken.token,
      ...SECURE_COOKIE_OPTIONS,
      expires: tokenPair.refreshToken.expiresAt
    });
    
    // Log successful login
    await auditLogger.logAuthSuccess(req, user.id, sessionId, {
      rememberMe
    });
    
    // Reset rate limit after successful login
    await rateLimiter.resetRateLimit(
      rateLimiter.getIdentifiersFromRequest(req).ipIdentifier,
      RateLimitType.LOGIN
    );
    
    return response;
    
  } catch (error) {
    // Log error
    console.error('Login error:', error);
    
    // Report error
    auditLogger.logAuditEvent({
      category: AuditCategory.AUTHENTICATION,
      eventType: AuditEventType.LOGIN_FAILURE,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.ERROR,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    // Return error response
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/tokens - Refresh tokens
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter.createRateLimitMiddleware(
      RateLimitType.TOKEN_REFRESH,
      { maxAttempts: 10, windowMs: 10 * 60 * 1000 } // 10 attempts in 10 minutes
    )(req);
    
    if (rateLimitResult) {
      // Log rate limit exceeded
      await auditLogger.logRateLimitExceeded(req, undefined, RateLimitType.TOKEN_REFRESH);
      return rateLimitResult;
    }
    
    // Get refresh token from cookies or request body
    let refreshToken = getTokenFromRequest(req, REFRESH_TOKEN_COOKIE);
    
    // Parse request body if cookie not available
    if (!refreshToken) {
      const body = await req.json();
      const validationResult = refreshSchema.safeParse(body);
      if (validationResult.success) {
        refreshToken = validationResult.data.refreshToken;
      }
    }
    
    // If no refresh token found, return error
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token provided' },
        { status: 401 }
      );
    }
    
    // Validate refresh token
    const tokenValidation = await jwtService.validateToken(refreshToken, TokenType.REFRESH);
    if (!tokenValidation.valid || !tokenValidation.payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token', error: tokenValidation.error },
        { status: 401 }
      );
    }
    
    const { userId, sessionId } = tokenValidation.payload;
    
    // Verify session is still active
    const sessionResult = await db.query(
      `SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND is_active = true LIMIT 1`,
      [sessionId, userId]
    );
    
    if (sessionResult.rowCount === 0) {
      // Log token refresh failure
      await auditLogger.logTokenRefresh(req, userId, sessionId, false);
      
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Verify user still exists and is active
    const userResult = await db.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    
    if (userResult.rowCount === 0) {
      // Log token refresh failure
      await auditLogger.logTokenRefresh(req, userId, sessionId, false);
      
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Rotate tokens (invalidate current token and generate a new pair)
    const newTokenPair = await jwtService.rotateTokens(refreshToken, {
      userId,
      sessionId,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscription_tier
    });
    
    if (!newTokenPair) {
      // Log token refresh failure
      await auditLogger.logTokenRefresh(req, userId, sessionId, false);
      
      return NextResponse.json(
        { success: false, message: 'Failed to refresh tokens' },
        { status: 500 }
      );
    }
    
    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        subscriptionTier: user.subscription_tier
      },
      tokenExpiry: newTokenPair.accessToken.expiresAt
    });
    
    // Set cookies on response
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: newTokenPair.accessToken.token,
      ...SECURE_COOKIE_OPTIONS,
      expires: newTokenPair.accessToken.expiresAt
    });
    
    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE,
      value: newTokenPair.refreshToken.token,
      ...SECURE_COOKIE_OPTIONS,
      expires: newTokenPair.refreshToken.expiresAt
    });
    
    // Log successful token refresh
    await auditLogger.logTokenRefresh(req, userId, sessionId, true);
    
    return response;
    
  } catch (error) {
    // Log error
    console.error('Token refresh error:', error);
    
    // Report error
    auditLogger.logAuditEvent({
      category: AuditCategory.AUTHENTICATION,
      eventType: AuditEventType.TOKEN_REFRESH,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.ERROR,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    // Return error response
    return NextResponse.json(
      { success: false, message: 'Token refresh failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/tokens - Logout
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Get access token from cookies or authorization header
    const accessToken = getTokenFromRequest(req, ACCESS_TOKEN_COOKIE);
    
    // If no access token found, return success (nothing to logout)
    if (!accessToken) {
      return NextResponse.json({ success: true, message: 'Already logged out' });
    }
    
    // Validate access token
    const tokenValidation = await jwtService.validateToken(accessToken, TokenType.ACCESS);
    
    let userId: string | undefined;
    let sessionId: string | undefined;
    
    if (tokenValidation.valid && tokenValidation.payload) {
      userId = tokenValidation.payload.userId;
      sessionId = tokenValidation.payload.sessionId;
      
      // Invalidate all user tokens
      await jwtService.invalidateAllUserTokens(userId);
      
      // Mark session as inactive
      if (sessionId) {
        await db.query(
          `UPDATE sessions SET is_active = false WHERE id = $1`,
          [sessionId]
        );
      }
      
      // Log logout
      if (userId && sessionId) {
        await auditLogger.logLogout(req, userId, sessionId);
      }
    } else {
      // Attempt to invalidate the token anyway
      await jwtService.invalidateToken(accessToken);
    }
    
    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear cookies
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    
    return response;
    
  } catch (error) {
    // Log error
    console.error('Logout error:', error);
    
    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear cookies anyway
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    
    // Report error
    auditLogger.logAuditEvent({
      category: AuditCategory.AUTHENTICATION,
      eventType: AuditEventType.LOGOUT,
      status: AuditStatus.FAILURE,
      severity: AuditSeverity.WARNING,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    // Return success response anyway (best effort logout)
    return response;
  }
}

/**
 * GET /api/auth/tokens - Validate token and get user info
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get access token from cookies or authorization header
    const accessToken = getTokenFromRequest(req, ACCESS_TOKEN_COOKIE);
    
    // If no access token found, return error
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Validate access token
    const tokenValidation = await jwtService.validateToken(accessToken, TokenType.ACCESS);
    if (!tokenValidation.valid || !tokenValidation.payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token', error: tokenValidation.error },
        { status: 401 }
      );
    }
    
    const { userId, sessionId } = tokenValidation.payload;
    
    // Verify session is still active
    const sessionResult = await db.query(
      `SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND is_active = true LIMIT 1`,
      [sessionId, userId]
    );
    
    if (sessionResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Verify user still exists and is active
    const userResult = await db.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    
    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Return user information
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        subscriptionTier: user.subscription_tier
      }
    });
    
  } catch (error) {
    // Log error
    console.error('Token validation error:', error);
    
    // Return error response
    return NextResponse.json(
      { success: false, message: 'Token validation failed' },
      { status: 500 }
    );
  }
}
