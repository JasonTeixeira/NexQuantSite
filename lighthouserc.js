module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3060/',
        'http://localhost:3060/admin/dashboard'
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Security assertions
        'is-on-https': 'off', // We're testing on localhost
        'uses-http2': 'off', // Development server might not use HTTP/2
        'redirects-http': 'off', // Not applicable for localhost
        
        // Accessibility thresholds
        'color-contrast': ['error', { minScore: 0.9 }],
        'image-alt': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        
        // Best practices
        'errors-in-console': ['warn', { maxLength: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
        'charset': ['error', { minScore: 1 }],
        'doctype': ['error', { minScore: 1 }],
        
        // SEO
        'meta-description': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'robots-txt': 'off', // We'll handle this separately
        
        // PWA (optional, but good to have)
        'viewport': ['error', { minScore: 1 }],
        'without-javascript': 'off', // Our app requires JavaScript
        
        // Custom security-focused assertions
        'csp-xss': 'warn', // Content Security Policy
        'external-anchors-use-rel-noopener': ['error', { minScore: 1 }],
        'uses-text-compression': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports'
    }
  }
}
