import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple rate limiting using in-memory store
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100

// Simple authentication check (basic token validation)
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in multiple places
  const authHeader = request.headers.get('authorization')
  const sessionCookie = request.cookies.get('auth_token')
  const sessionToken = request.cookies.get('session-token')
  
  // Basic token existence check (detailed verification happens in API routes)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    return token.length > 20 // Basic length check
  }
  
  if (sessionCookie?.value || sessionToken?.value) {
    return true
  }
  
  return false
}

// Simple admin authentication check
function isAdmin(request: NextRequest): boolean {
  // Check for admin token (detailed verification happens in API routes)
  const adminToken = request.cookies.get('admin_token')?.value
  if (!adminToken) return false
  
  // Basic token validation (full JWT verification in API routes)
  return adminToken.length > 20
}

// Simple rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = `${ip}:${Math.floor(now / RATE_LIMIT_WINDOW)}`
  
  const current = rateLimitMap.get(key) || 0
  if (current >= MAX_REQUESTS) {
    return false
  }
  
  rateLimitMap.set(key, current + 1)
  
  // Clean up old entries
  if (rateLimitMap.size > 10000) {
    const cutoff = Math.floor(now / RATE_LIMIT_WINDOW) - 2
    for (const [k] of rateLimitMap) {
      if (k.includes(':') && parseInt(k.split(':')[1]) < cutoff) {
        rateLimitMap.delete(k)
      }
    }
  }
  
  return true
}

// Basic input validation
function validateInput(input: string): boolean {
  // Basic security patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /\.\.\//,
    /union.*select/i,
    /drop.*table/i,
    /exec.*\(/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

// Enhanced Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Enhanced Content Security Policy
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://static.hotjar.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss: https://www.google-analytics.com https://vitals.vercel-analytics.com",
    "media-src 'self' data: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  response.headers.set('Content-Security-Policy', cspPolicy)
  
  // HSTS (Force HTTPS in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  
  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')
  
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  const method = request.method
  
  // Simple rate limiting check
  if (!checkRateLimit(ip)) {
    const response = NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString()
        }
      }
    )
    return addSecurityHeaders(response)
  }
  
  // Basic input validation
  const fullUrl = request.url
  const queryParams = request.nextUrl.searchParams.toString()
  
  if (!validateInput(fullUrl) || !validateInput(queryParams) || !validateInput(userAgent)) {
    const response = NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 400 }
    )
    return addSecurityHeaders(response)
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow admin login page
    if (pathname === '/admin/login' || pathname === '/admin') {
      const response = NextResponse.next()
      return addSecurityHeaders(response)
    }
    
    if (!isAdmin(request)) {
      // Redirect to admin login page
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      return addSecurityHeaders(response)
    }
  }
  
  // Protect API routes with basic access control
  if (pathname.startsWith('/api/')) {
    // Public API routes (no auth required)
    const publicApiPaths = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/logout',
      '/api/admin/auth/login',  // Allow admin login without auth
      '/api/admin/verify-session',  // Allow session verification
      '/api/seo',
      '/api/health',
      '/api/stream',
      '/api/community/messages'
    ]
    
    const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path))
    
    if (!isPublicApi) {
      // Check authentication for protected API routes
      if (pathname.startsWith('/api/admin') || 
          pathname.startsWith('/api/user') ||
          pathname.startsWith('/api/protected')) {
        
        if (!isAuthenticated(request)) {
          const response = NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
          return addSecurityHeaders(response)
        }
        
        // Admin API routes require admin privileges
        if (pathname.startsWith('/api/admin')) {
          // Allow admin auth endpoints
          if (pathname.startsWith('/api/admin/auth/login')) {
            // Let the login endpoint handle its own logic
          } else if (!isAdmin(request)) {
            const response = NextResponse.json(
              { error: 'Admin authentication required' },
              { status: 401 }
            )
            return addSecurityHeaders(response)
          }
        }
      }
    }
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}