/**
 * 🔐 JWT TOKEN SERVICE
 * Enhanced JWT handling with token rotation, refresh tokens, and security features
 */

import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { redis, getAndParse, setWithExpiry, deleteKey } from '@/lib/database/redis-connection';
import { reportError } from '@/lib/monitoring';

// Constants
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'development_secret_do_not_use_in_production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || ACCESS_TOKEN_SECRET + '_refresh';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'; // Short-lived token
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; // Longer-lived token
const JWT_ISSUER = process.env.NEXT_PUBLIC_APP_URL || 'https://nexural.com';
const JWT_AUDIENCE = 'nexural-api';

// Redis prefixes for different token types
const VALID_TOKENS_PREFIX = 'auth:valid-tokens:';
const REFRESH_TOKENS_PREFIX = 'auth:refresh-tokens:';
const INVALID_TOKENS_PREFIX = 'auth:invalid-tokens:';

// Token types
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

// Token interfaces
export interface TokenPayload {
  userId: string;
  sessionId: string;
  email?: string;
  role?: string;
  subscriptionTier?: string;
  isRefresh?: boolean;
  jti?: string; // JWT ID for tracking
}

export interface TokenResult {
  token: string;
  expiresAt: Date;
  jti: string; // JWT ID for tracking
}

export interface TokenPair {
  accessToken: TokenResult;
  refreshToken: TokenResult;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

// ===========================================================================
// TOKEN GENERATION AND VALIDATION
// ===========================================================================

/**
 * Generate a secure JWT token with enhanced security features
 */
export async function generateToken(
  payload: TokenPayload,
  type: TokenType = TokenType.ACCESS
): Promise<TokenResult> {
  try {
    // Generate unique token ID
    const jti = randomBytes(16).toString('hex');
    const isRefresh = type === TokenType.REFRESH;

    // Set appropriate expiry
    const expiresIn = isRefresh ? REFRESH_TOKEN_EXPIRY : ACCESS_TOKEN_EXPIRY;
    
    // Calculate expiry date for return and storage
    const expirySeconds = parseDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    // Prepare enhanced payload with security features
    const tokenPayload = {
      ...payload,
      isRefresh,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
    };

    // Use appropriate secret based on token type
    const secret = isRefresh ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const secretBuffer = Buffer.from(secret, 'utf-8');

    // Generate token
    const token = jwt.sign(tokenPayload, secretBuffer);

    // Store token in Redis for tracking (different prefixes for different token types)
    const prefix = isRefresh ? REFRESH_TOKENS_PREFIX : VALID_TOKENS_PREFIX;
    await setWithExpiry(
      `${prefix}${jti}`,
      { userId: payload.userId, sessionId: payload.sessionId, expiresAt },
      expirySeconds
    );

    return { token, expiresAt, jti };
  } catch (error) {
    reportError({
      component: 'JWTService',
      action: 'generateToken',
      error,
      context: { userId: payload.userId },
      severity: 'high'
    });
    
    throw new Error('Failed to generate token');
  }
}

/**
 * Generate both access and refresh tokens for a user session
 */
export async function generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
  const accessToken = await generateToken(payload, TokenType.ACCESS);
  const refreshToken = await generateToken(payload, TokenType.REFRESH);
  
  return { accessToken, refreshToken };
}

/**
 * Validate a JWT token with enhanced security checks
 */
export async function validateToken(
  token: string,
  type: TokenType = TokenType.ACCESS
): Promise<TokenValidationResult> {
  try {
    // Use appropriate secret based on token type
    const secret = type === TokenType.REFRESH ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const secretBuffer = Buffer.from(secret, 'utf-8');

    // Verify token
    const decoded = jwt.verify(token, secretBuffer, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload & { jti: string; exp: number };

    // Ensure token type matches
    if (type === TokenType.REFRESH && !decoded.isRefresh) {
      return { valid: false, error: 'Invalid token type' };
    }

    if (type === TokenType.ACCESS && decoded.isRefresh) {
      return { valid: false, error: 'Invalid token type' };
    }

    // Check if token is in blacklist
    const isBlacklisted = await redis.exists(`${INVALID_TOKENS_PREFIX}${decoded.jti}`);
    if (isBlacklisted) {
      return { valid: false, error: 'Token has been invalidated' };
    }

    // Check if token is in valid list
    const prefix = type === TokenType.REFRESH ? REFRESH_TOKENS_PREFIX : VALID_TOKENS_PREFIX;
    const isValid = await redis.exists(`${prefix}${decoded.jti}`);
    if (!isValid) {
      return { valid: false, error: 'Token not found in valid tokens' };
    }

    return { valid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: error.message };
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    }
    
    reportError({
      component: 'JWTService',
      action: 'validateToken',
      error,
      severity: 'medium'
    });
    
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Rotate tokens - invalidate current access token and issue new token pair
 */
export async function rotateTokens(
  refreshToken: string,
  payload: Omit<TokenPayload, 'jti' | 'isRefresh'>
): Promise<TokenPair | null> {
  // Validate refresh token
  const validation = await validateToken(refreshToken, TokenType.REFRESH);
  if (!validation.valid || !validation.payload) {
    return null;
  }

  try {
    // Invalidate old refresh token to prevent reuse
    await invalidateToken(refreshToken, TokenType.REFRESH);
    
    // Generate new token pair
    return await generateTokenPair(payload);
  } catch (error) {
    reportError({
      component: 'JWTService',
      action: 'rotateTokens',
      error,
      context: { userId: payload.userId },
      severity: 'high'
    });
    
    return null;
  }
}

/**
 * Invalidate a token (add to blacklist)
 */
export async function invalidateToken(token: string, type: TokenType = TokenType.ACCESS): Promise<boolean> {
  try {
    // Use appropriate secret based on token type
    const secret = type === TokenType.REFRESH ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const secretBuffer = Buffer.from(secret, 'utf-8');

    // Decode token without verification to get jti and expiration
    const decoded = jwt.decode(token) as { jti: string; exp: number } | null;
    if (!decoded || !decoded.jti) {
      return false;
    }

    // Calculate remaining time until token expiration
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeToExpiry = Math.max(0, expiryTime - currentTime) / 1000;

    // If token is already expired, no need to add to blacklist
    if (timeToExpiry <= 0) {
      return true;
    }

    // Add token to blacklist with the same expiry as the original token
    await setWithExpiry(
      `${INVALID_TOKENS_PREFIX}${decoded.jti}`,
      { invalidatedAt: new Date() },
      Math.ceil(timeToExpiry)
    );

    // Remove from valid tokens list
    const prefix = type === TokenType.REFRESH ? REFRESH_TOKENS_PREFIX : VALID_TOKENS_PREFIX;
    await deleteKey(`${prefix}${decoded.jti}`);

    return true;
  } catch (error) {
    reportError({
      component: 'JWTService',
      action: 'invalidateToken',
      error,
      severity: 'medium'
    });
    
    return false;
  }
}

/**
 * Invalidate all tokens for a user (for logout or security breach)
 */
export async function invalidateAllUserTokens(userId: string): Promise<boolean> {
  try {
    // Find all active tokens for user
    const accessTokenPattern = `${VALID_TOKENS_PREFIX}*`;
    const refreshTokenPattern = `${REFRESH_TOKENS_PREFIX}*`;
    
    // Invalidate access tokens
    const accessKeys = await redis.keys(accessTokenPattern);
    for (const key of accessKeys) {
      const tokenData = await getAndParse<{ userId: string; expiresAt: string }>(key);
      if (tokenData && tokenData.userId === userId) {
        // Move to invalid tokens
        const jti = key.replace(VALID_TOKENS_PREFIX, '');
        const expiryDate = new Date(tokenData.expiresAt);
        const timeToExpiry = Math.max(0, expiryDate.getTime() - Date.now()) / 1000;
        
        if (timeToExpiry > 0) {
          await setWithExpiry(
            `${INVALID_TOKENS_PREFIX}${jti}`,
            { invalidatedAt: new Date() },
            Math.ceil(timeToExpiry)
          );
        }
        
        // Remove from valid tokens
        await deleteKey(key);
      }
    }
    
    // Invalidate refresh tokens
    const refreshKeys = await redis.keys(refreshTokenPattern);
    for (const key of refreshKeys) {
      const tokenData = await getAndParse<{ userId: string; expiresAt: string }>(key);
      if (tokenData && tokenData.userId === userId) {
        await deleteKey(key);
      }
    }
    
    return true;
  } catch (error) {
    reportError({
      component: 'JWTService',
      action: 'invalidateAllUserTokens',
      error,
      context: { userId },
      severity: 'high'
    });
    
    return false;
  }
}

// ===========================================================================
// UTILITY FUNCTIONS
// ===========================================================================

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhdw])$/);
  if (!match) {
    return 24 * 60 * 60; // Default to 24 hours
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    case 'w': return value * 7 * 24 * 60 * 60;
    default: return 24 * 60 * 60;
  }
}

/**
 * Extract token from various request sources
 */
export function extractTokenFromRequest(req: any): { token: string | null; type: TokenType } {
  // Check Authorization header
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { token: authHeader.substring(7), type: TokenType.ACCESS };
  }
  
  // Check refresh token header
  const refreshHeader = req.headers?.['x-refresh-token'];
  if (refreshHeader) {
    return { token: refreshHeader, type: TokenType.REFRESH };
  }
  
  // Check cookies for access token
  const accessToken = req.cookies?.['nexural-access-token'];
  if (accessToken) {
    return { token: accessToken, type: TokenType.ACCESS };
  }
  
  // Check cookies for refresh token
  const refreshToken = req.cookies?.['nexural-refresh-token'];
  if (refreshToken) {
    return { token: refreshToken, type: TokenType.REFRESH };
  }
  
  return { token: null, type: TokenType.ACCESS };
}

/**
 * Clean expired tokens from Redis (should be run periodically)
 */
export async function cleanExpiredTokens(): Promise<void> {
  // Redis TTL feature should automatically handle expiration
  // This function is kept for compatibility and additional cleanup if needed
  
  // Additional cleanup operations could be added here
  console.log('🧹 Token cleanup complete');
}

export default {
  generateToken,
  generateTokenPair,
  validateToken,
  rotateTokens,
  invalidateToken,
  invalidateAllUserTokens,
  extractTokenFromRequest,
  cleanExpiredTokens,
  TokenType
};
