/**
 * Service Worker for Nexural Backtesting Platform - Phase 2 PWA
 * Handles offline functionality, caching strategies, and push notifications
 */

const CACHE_NAME = 'nexural-v2.0.0'
const RUNTIME_CACHE = 'nexural-runtime-v2.0.0'
const API_CACHE = 'nexural-api-v2.0.0'
const IMAGE_CACHE = 'nexural-images-v2.0.0'

// Assets to cache on install
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add your critical CSS and JS files here
  '/_next/static/css/app.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js'
]

// API endpoints that can work offline
const OFFLINE_FALLBACK_PAGES = [
  '/offline.html'
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first for API calls
  networkFirst: [
    '/api/portfolio',
    '/api/trades',
    '/api/market-data',
    '/api/ai-analysis'
  ],
  
  // Cache first for static assets
  cacheFirst: [
    '/_next/static/',
    '/icons/',
    '/images/'
  ],
  
  // Stale while revalidate for dynamic content
  staleWhileRevalidate: [
    '/api/health',
    '/api/status'
  ]
}

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching core assets')
        return cache.addAll(CORE_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Static assets (images, icons, etc.)
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request))
    return
  }

  // JavaScript and CSS files
  if (url.pathname.includes('/_next/static/') || 
      url.pathname.includes('/icons/') || 
      url.pathname.includes('/images/')) {
    event.respondWith(handleStaticAssets(request))
    return
  }

  // HTML pages
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Default handling
  event.respondWith(handleGenericRequest(request))
})

// Network first strategy for API calls
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const cacheKey = request.url
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE)
      cache.put(cacheKey, networkResponse.clone())
      
      // Add timestamp for cache invalidation
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cache-timestamp': Date.now().toString()
        }
      })
      
      return responseWithTimestamp
    }
    
    throw new Error('Network response not ok')
    
  } catch (error) {
    console.log('📡 Network failed, trying cache for:', url.pathname)
    
    // Fallback to cache
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(cacheKey)
    
    if (cachedResponse) {
      // Check if cached data is too old (5 minutes)
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp')
      const isStale = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) > 5 * 60 * 1000
      
      if (isStale) {
        console.log('⚠️ Cached data is stale, returning with warning')
        return new Response(JSON.stringify({
          ...await cachedResponse.json(),
          _offline: true,
          _stale: true,
          _message: 'Data may be outdated (offline mode)'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify({
        ...await cachedResponse.clone().json(),
        _offline: true,
        _message: 'Offline mode - using cached data'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Return offline fallback
    return new Response(JSON.stringify({
      error: 'Offline - no cached data available',
      offline: true,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Cache first strategy for images
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return placeholder image if available
    return cache.match('/icons/placeholder-image.png') || 
           new Response('', { status: 404 })
  }
}

// Cache first for static assets
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME)
  
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return new Response('', { status: 404 })
  }
}

// Navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      return networkResponse
    }
    throw new Error('Network response not ok')
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return cache.match('/offline.html') || 
           new Response('Offline - Please check your connection', {
             status: 503,
             headers: { 'Content-Type': 'text/plain' }
           })
  }
}

// Generic request handler
async function handleGenericRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('', { status: 404 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'portfolio-sync') {
    event.waitUntil(syncPortfolioData())
  } else if (event.tag === 'trades-sync') {
    event.waitUntil(syncTradeData())
  }
})

// Sync portfolio data when online
async function syncPortfolioData() {
  try {
    console.log('📊 Syncing portfolio data...')
    
    // Get pending portfolio updates from IndexedDB or localStorage
    const pendingUpdates = await getPendingPortfolioUpdates()
    
    for (const update of pendingUpdates) {
      try {
        await fetch('/api/portfolio/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })
        
        // Remove from pending queue
        await removePendingUpdate(update.id)
      } catch (error) {
        console.error('Failed to sync update:', error)
      }
    }
    
    console.log('✅ Portfolio sync completed')
  } catch (error) {
    console.error('❌ Portfolio sync failed:', error)
  }
}

// Sync trade data when online
async function syncTradeData() {
  try {
    console.log('💼 Syncing trade data...')
    
    const pendingTrades = await getPendingTradeUpdates()
    
    for (const trade of pendingTrades) {
      try {
        await fetch('/api/trades/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade)
        })
        
        await removePendingTrade(trade.id)
      } catch (error) {
        console.error('Failed to sync trade:', error)
      }
    }
    
    console.log('✅ Trade sync completed')
  } catch (error) {
    console.error('❌ Trade sync failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received')
  
  const options = {
    title: 'Nexural Alert',
    body: 'You have new trading signals available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'nexural-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Signals',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/signals',
      timestamp: Date.now()
    }
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      options.title = payload.title || options.title
      options.body = payload.body || options.body
      options.data = { ...options.data, ...payload.data }
    } catch (error) {
      console.error('Error parsing push payload:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action)
  
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Focus existing tab if available
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus()
            }
          }
          
          // Open new tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// Helper functions (would typically use IndexedDB)
async function getPendingPortfolioUpdates() {
  // This would read from IndexedDB in a real implementation
  return JSON.parse(localStorage.getItem('pendingPortfolioUpdates') || '[]')
}

async function removePendingUpdate(id) {
  const pending = await getPendingPortfolioUpdates()
  const filtered = pending.filter(item => item.id !== id)
  localStorage.setItem('pendingPortfolioUpdates', JSON.stringify(filtered))
}

async function getPendingTradeUpdates() {
  return JSON.parse(localStorage.getItem('pendingTradeUpdates') || '[]')
}

async function removePendingTrade(id) {
  const pending = await getPendingTradeUpdates()
  const filtered = pending.filter(item => item.id !== id)
  localStorage.setItem('pendingTradeUpdates', JSON.stringify(filtered))
}

console.log('🚀 Nexural Service Worker loaded successfully')
