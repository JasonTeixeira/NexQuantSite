/**
 * 👤 USER PROFILE API
 * Authenticated endpoints for user profile management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database/database';
import { withAuth, UserRole } from '@/lib/auth/auth-middleware';
import auditLogger, { AuditCategory, AuditEventType, AuditStatus, AuditSeverity } from '@/lib/auth/audit-logger';
import rateLimiter, { RateLimitType } from '@/lib/auth/rate-limiter';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  websiteUrl: z.string().url().max(200).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  preferences: z.record(z.any()).optional()
});

/**
 * GET /api/user/profile - Get authenticated user's profile
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Get user ID from request headers (set by auth middleware)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch user profile data
    const result = await db.query(
      `
      SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, 
        u.display_name, u.bio, u.location, u.website_url, u.avatar_url,
        u.email_verified, u.created_at, u.updated_at, u.last_login_at,
        u.role, u.subscription_tier, u.preferences
      FROM users u
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Audit log the profile access
    await auditLogger.logAuditEvent({
      userId,
      category: AuditCategory.DATA_ACCESS,
      eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.INFO,
      details: { action: 'profile_view' }
    });
    
    // Format user data for response
    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        bio: user.bio,
        location: user.location,
        websiteUrl: user.website_url,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
        role: user.role,
        subscriptionTier: user.subscription_tier,
        preferences: user.preferences || {}
      }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}, {
  // Only the user themselves can access their profile
  requiredRole: UserRole.USER,
  verifySession: true
});

/**
 * PATCH /api/user/profile - Update authenticated user's profile
 */
export const PATCH = withAuth(async (req: NextRequest) => {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter.createRateLimitMiddleware(
      RateLimitType.API_GENERAL,
      { maxAttempts: 10, windowMs: 60 * 1000 } // 10 attempts per minute
    )(req);
    
    if (rateLimitResult) {
      await auditLogger.logRateLimitExceeded(req, req.headers.get('x-user-id') || undefined);
      return rateLimitResult;
    }
    
    // Get user ID from request headers (set by auth middleware)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input data
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid profile data',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }
    
    const updateData = validationResult.data;
    
    // Create update SQL
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;
    
    // Map validated fields to database columns
    const fieldMappings: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      displayName: 'display_name',
      bio: 'bio',
      location: 'location',
      websiteUrl: 'website_url',
      avatarUrl: 'avatar_url',
      preferences: 'preferences'
    };
    
    // Build dynamic SQL update based on provided fields
    Object.entries(updateData).forEach(([key, value]) => {
      const dbField = fieldMappings[key];
      if (dbField) {
        updateFields.push(`${dbField} = $${paramIndex}`);
        
        // Handle JSON fields
        if (key === 'preferences') {
          updateValues.push(JSON.stringify(value));
        } else {
          updateValues.push(value);
        }
        
        paramIndex++;
      }
    });
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;
    
    // Add WHERE condition
    updateValues.push(userId);
    
    // If no fields to update, return success
    if (updateFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes to update'
      });
    }
    
    // Execute update query
    const result = await db.query(
      `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, username, first_name, last_name, display_name, 
                bio, location, website_url, avatar_url, updated_at, preferences
      `,
      updateValues
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const updatedUser = result.rows[0];
    
    // Audit log the profile update
    await auditLogger.logAuditEvent({
      userId,
      category: AuditCategory.USER_MANAGEMENT,
      eventType: AuditEventType.PROFILE_UPDATED,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.INFO,
      details: {
        action: 'profile_update',
        updatedFields: Object.keys(updateData)
      }
    });
    
    // Format user data for response
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        username: updatedUser.username,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        displayName: updatedUser.display_name || `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || updatedUser.username,
        bio: updatedUser.bio,
        location: updatedUser.location,
        websiteUrl: updatedUser.website_url,
        avatarUrl: updatedUser.avatar_url,
        updatedAt: updatedUser.updated_at,
        preferences: updatedUser.preferences || {}
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Audit log the failed update
    const userId = req.headers.get('x-user-id');
    if (userId) {
      await auditLogger.logAuditEvent({
        userId,
        category: AuditCategory.USER_MANAGEMENT,
        eventType: AuditEventType.PROFILE_UPDATED,
        status: AuditStatus.FAILURE,
        severity: AuditSeverity.WARNING,
        details: {
          action: 'profile_update',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}, {
  // Only the user themselves can update their profile
  requiredRole: UserRole.USER,
  verifySession: true
});
