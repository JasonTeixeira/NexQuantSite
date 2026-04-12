/**
 * 🔐 MIDDLEWARE (SIMPLIFIED)
 * Simplified middleware to avoid Edge runtime issues
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    // Only apply to admin routes for now
    '/admin/:path*',
  ],
};

/**
 * Simplified middleware function
 * Removes dependencies on libraries that use Node.js native modules
 * which are incompatible with Edge runtime
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Common security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });
  
  // Add Content-Security-Policy to HTML responses only (not for API/assets)
  if (!pathname.startsWith('/api/') && !pathname.includes('.')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
  }
  
  return response;
}
