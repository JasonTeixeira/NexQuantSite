export function getSecurityHeaders(): Record<string, string> {
  return {
    // Content Security Policy
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com wss://ws-feed.pro.coinbase.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),

    // HTTP Strict Transport Security
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // XSS Protection
    "X-XSS-Protection": "1; mode=block",

    // Clickjacking protection
    "X-Frame-Options": "DENY",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",

    // Remove server information
    "X-Powered-By": "",
  }
}

export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders()

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    } else {
      response.headers.delete(key)
    }
  })

  return response
}
