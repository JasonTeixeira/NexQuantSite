// 🚀 NEXURAL TRADING PLATFORM - SERVICE WORKER
// Advanced PWA functionality with offline support, caching, and push notifications

const CACHE_NAME = 'nexural-trading-v1.0.0'
const STATIC_CACHE = 'nexural-static-v1.0.0'
const DYNAMIC_CACHE = 'nexural-dynamic-v1.0.0'
const API_CACHE = 'nexural-api-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/community',
  '/marketplace',
  '/learning',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-152x152.svg',
  '/icons/icon-32x32.svg'
]

// API endpoints to cache
const CACHE_API_PATTERNS = [
  '/api/community/posts',
  '/api/marketplace/strategies',
  '/api/auth/session',
  '/api/market-data'
]

// Files to never cache
const NEVER_CACHE = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/payment',
  '/api/admin'
]

// ============================================================================
// INSTALL EVENT - Cache static files
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static files...')
        return cache.addAll(STATIC_FILES)
      }),
      self.skipWaiting()
    ])
  )
})

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// ============================================================================
// FETCH EVENT - Network-first with fallback strategies
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip requests to never cache
  if (NEVER_CACHE.some(pattern => url.pathname.includes(pattern))) {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    event.respondWith(handleStaticAsset(request))
  } else {
    event.respondWith(handlePageRequest(request))
  }
})

// ============================================================================
// REQUEST HANDLERS
// ============================================================================

// Handle API requests - Network first with cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const response = await fetch(request)
    
    // Cache successful responses for API endpoints we care about
    if (response.ok && CACHE_API_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('🌐 Network failed for API request, checking cache:', url.pathname)
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline API response for critical endpoints
    if (url.pathname.includes('/api/community/posts')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Offline',
        message: 'You are currently offline. Some content may not be up to date.',
        posts: [],
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Handle static assets - Cache first
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('❌ Failed to fetch static asset:', request.url)
    throw error
  }
}

// Handle page requests - Network first with offline fallback
async function handlePageRequest(request) {
  try {
    const response = await fetch(request)
    
    // Cache successful page responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('🌐 Network failed for page request, checking cache:', request.url)
    
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page as last resort
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Minimal offline HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nexural Trading - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; text-align: center; background: #000; color: #fff; }
            h1 { color: #0066cc; }
            .icon { font-size: 64px; margin: 20px 0; }
            .retry { background: #0066cc; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="icon">📱</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button class="retry" onclick="window.location.reload()">Retry</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received:', event)
  
  const options = {
    body: 'You have new activity on Nexural Trading',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: false,
    silent: false
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data.url = payload.url || options.data.url
      
      if (payload.type === 'trade_alert') {
        options.body = `Trade Alert: ${payload.message}`
        options.icon = '/icons/icon-192x192.svg'
        options.requireInteraction = true
      } else if (payload.type === 'community') {
        options.body = `Community: ${payload.message}`
        options.data.url = '/community'
      } else if (payload.type === 'strategy') {
        options.body = `Strategy Update: ${payload.message}`
        options.data.url = '/marketplace'
      }
    } catch (error) {
      console.error('Error parsing push payload:', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Nexural Trading', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.notification)
  
  event.notification.close()
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// ============================================================================
// BACKGROUND SYNC (for offline actions)
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts())
  } else if (event.tag === 'sync-user-actions') {
    event.waitUntil(syncUserActions())
  }
})

async function syncPosts() {
  try {
    // Get cached posts that need syncing
    const cache = await caches.open(API_CACHE)
    const cachedPosts = await cache.match('/api/community/posts?sync=pending')
    
    if (cachedPosts) {
      const posts = await cachedPosts.json()
      // Sync posts to server
      console.log('📤 Syncing posts to server...', posts.length)
    }
  } catch (error) {
    console.error('❌ Error syncing posts:', error)
  }
}

async function syncUserActions() {
  try {
    // Sync any cached user actions (likes, comments, etc.)
    console.log('🔄 Syncing user actions...')
  } catch (error) {
    console.error('❌ Error syncing user actions:', error)
  }
}

// ============================================================================
// PERIODIC BACKGROUND SYNC (refresh data in background)
// ============================================================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-content') {
    event.waitUntil(refreshContent())
  }
})

async function refreshContent() {
  try {
    console.log('🔄 Refreshing content in background...')
    
    // Refresh critical content
    const endpoints = [
      '/api/community/posts?limit=20',
      '/api/marketplace/strategies?featured=true',
      '/api/market-data/trending'
    ]
    
    const cache = await caches.open(API_CACHE)
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          await cache.put(endpoint, response.clone())
        }
      } catch (error) {
        console.log(`Failed to refresh ${endpoint}:`, error)
      }
    }
    
    console.log('✅ Content refresh completed')
  } catch (error) {
    console.error('❌ Error refreshing content:', error)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Clean old cache entries (runs periodically)
async function cleanOldCache() {
  const caches = await caches.keys()
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  for (const cacheName of caches) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    for (const request of keys) {
      const response = await cache.match(request)
      const cacheTime = response.headers.get('sw-cache-time')
      
      if (cacheTime && (now - parseInt(cacheTime)) > maxAge) {
        await cache.delete(request)
      }
    }
  }
}

// Run cleanup periodically
setInterval(cleanOldCache, 60 * 60 * 1000) // Every hour