/**
 * Analytics Integration System - Professional Grade
 * Handles Google Analytics, Tag Manager, Facebook Pixel, and other tracking
 */

export interface AnalyticsConfig {
  googleAnalytics?: {
    measurementId: string
    enabled: boolean
    anonymizeIp?: boolean
    cookieConsent?: boolean
  }
  googleTagManager?: {
    containerId: string
    enabled: boolean
    dataLayerName?: string
  }
  facebookPixel?: {
    pixelId: string
    enabled: boolean
  }
  hotjar?: {
    siteId: string
    version: number
    enabled: boolean
  }
  mixpanel?: {
    token: string
    enabled: boolean
  }
  customEvents?: {
    enabled: boolean
    debug?: boolean
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  customParameters?: Record<string, any>
}

export interface EcommerceItem {
  item_id: string
  item_name: string
  category: string
  quantity: number
  price: number
  currency?: string
  item_brand?: string
  item_variant?: string
}

export interface EcommerceEvent {
  transaction_id: string
  value: number
  currency: string
  items: EcommerceItem[]
  coupon?: string
  shipping?: number
  tax?: number
}

// Default configuration
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'GA-MEASUREMENT-ID',
    enabled: process.env.NODE_ENV === 'production',
    anonymizeIp: true,
    cookieConsent: true
  },
  googleTagManager: {
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-CONTAINER-ID',
    enabled: process.env.NODE_ENV === 'production',
    dataLayerName: 'dataLayer'
  },
  facebookPixel: {
    pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'FB-PIXEL-ID',
    enabled: process.env.NODE_ENV === 'production'
  },
  hotjar: {
    siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || 'HOTJAR-SITE-ID',
    version: 6,
    enabled: process.env.NODE_ENV === 'production'
  },
  customEvents: {
    enabled: true,
    debug: process.env.NODE_ENV === 'development'
  }
}

// Analytics manager class
export class AnalyticsManager {
  private config: AnalyticsConfig
  private initialized: boolean = false

  constructor(config: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config }
  }

  // Initialize all tracking services
  init(): void {
    if (this.initialized || typeof window === 'undefined') return

    this.initGoogleAnalytics()
    this.initGoogleTagManager()
    this.initFacebookPixel()
    this.initHotjar()
    
    this.initialized = true
    this.log('Analytics initialized')
  }

  // Google Analytics 4 setup
  private initGoogleAnalytics(): void {
    const { googleAnalytics } = this.config
    if (!googleAnalytics?.enabled || !googleAnalytics.measurementId) return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalytics.measurementId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', googleAnalytics.measurementId, {
      anonymize_ip: googleAnalytics.anonymizeIp,
      cookie_consent: googleAnalytics.cookieConsent
    })

    this.log('Google Analytics initialized')
  }

  // Google Tag Manager setup
  private initGoogleTagManager(): void {
    const { googleTagManager } = this.config
    if (!googleTagManager?.enabled || !googleTagManager.containerId) return

    // Initialize dataLayer
    const dataLayerName = googleTagManager.dataLayerName || 'dataLayer'
    window[dataLayerName] = window[dataLayerName] || []
    window[dataLayerName].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })

    // Load GTM script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${googleTagManager.containerId}`
    document.head.appendChild(script)

    // Add noscript fallback
    const noscript = document.createElement('noscript')
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManager.containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    document.body.appendChild(noscript)

    this.log('Google Tag Manager initialized')
  }

  // Facebook Pixel setup
  private initFacebookPixel(): void {
    const { facebookPixel } = this.config
    if (!facebookPixel?.enabled || !facebookPixel.pixelId) return

    // Facebook Pixel Code
    window.fbq = function() {
      if (window.fbq.callMethod) {
        window.fbq.callMethod.apply(window.fbq, arguments)
      } else {
        window.fbq.queue.push(arguments)
      }
    }

    if (!window._fbq) window._fbq = window.fbq
    window.fbq.push = window.fbq
    window.fbq.loaded = true
    window.fbq.version = '2.0'
    window.fbq.queue = []

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    window.fbq('init', facebookPixel.pixelId)
    window.fbq('track', 'PageView')

    this.log('Facebook Pixel initialized')
  }

  // Hotjar setup
  private initHotjar(): void {
    const { hotjar } = this.config
    if (!hotjar?.enabled || !hotjar.siteId) return

    window.hj = function() {
      (window.hj.q = window.hj.q || []).push(arguments)
    }
    window._hjSettings = { hjid: parseInt(hotjar.siteId), hjsv: hotjar.version }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://static.hotjar.com/c/hotjar-${hotjar.siteId}.js?sv=${hotjar.version}`
    document.head.appendChild(script)

    this.log('Hotjar initialized')
  }

  // Event tracking
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      this.log('Analytics not initialized, queuing event:', event)
      return
    }

    this.trackGoogleAnalyticsEvent(event)
    this.trackFacebookPixelEvent(event)
    this.trackCustomEvent(event)
  }

  private trackGoogleAnalyticsEvent(event: AnalyticsEvent): void {
    if (!this.config.googleAnalytics?.enabled || typeof window.gtag !== 'function') return

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters
    })

    this.log('GA Event tracked:', event)
  }

  private trackFacebookPixelEvent(event: AnalyticsEvent): void {
    if (!this.config.facebookPixel?.enabled || typeof window.fbq !== 'function') return

    // Map common events to Facebook standard events
    const fbEventMap: Record<string, string> = {
      'page_view': 'PageView',
      'sign_up': 'CompleteRegistration',
      'login': 'Login',
      'purchase': 'Purchase',
      'add_to_cart': 'AddToCart',
      'view_content': 'ViewContent'
    }

    const fbEvent = fbEventMap[event.action] || 'Custom'
    
    if (fbEvent === 'Custom') {
      window.fbq('trackCustom', event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.customParameters
      })
    } else {
      window.fbq('track', fbEvent, {
        value: event.value,
        ...event.customParameters
      })
    }

    this.log('Facebook Pixel Event tracked:', event)
  }

  private trackCustomEvent(event: AnalyticsEvent): void {
    if (!this.config.customEvents?.enabled) return

    // Dispatch custom analytics event for other integrations
    const customEvent = new CustomEvent('analytics_event', {
      detail: event
    })
    
    window.dispatchEvent(customEvent)
    this.log('Custom Event tracked:', event)
  }

  // E-commerce tracking
  trackPurchase(transaction: EcommerceEvent): void {
    if (!this.initialized) return

    // Google Analytics 4 Enhanced Ecommerce
    if (this.config.googleAnalytics?.enabled && typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: transaction.transaction_id,
        value: transaction.value,
        currency: transaction.currency,
        items: transaction.items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency
        })),
        coupon: transaction.coupon,
        shipping: transaction.shipping,
        tax: transaction.tax
      })
    }

    // Facebook Pixel Purchase
    if (this.config.facebookPixel?.enabled && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value: transaction.value,
        currency: transaction.currency,
        content_ids: transaction.items.map(item => item.item_id),
        content_type: 'product',
        num_items: transaction.items.reduce((sum, item) => sum + item.quantity, 0)
      })
    }

    this.log('Purchase tracked:', transaction)
  }

  // Page view tracking
  trackPageView(url: string, title?: string): void {
    if (!this.initialized) return

    // Google Analytics
    if (this.config.googleAnalytics?.enabled && typeof window.gtag === 'function') {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        page_location: url,
        page_title: title
      })
    }

    // Facebook Pixel
    if (this.config.facebookPixel?.enabled && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }

    this.log('Page view tracked:', { url, title })
  }

  // User identification
  identifyUser(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized) return

    // Google Analytics User ID
    if (this.config.googleAnalytics?.enabled && typeof window.gtag === 'function') {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        user_id: userId,
        custom_map: traits
      })
    }

    // Custom user identification event
    this.trackEvent({
      action: 'identify_user',
      category: 'user',
      customParameters: {
        user_id: userId,
        ...traits
      }
    })

    this.log('User identified:', { userId, traits })
  }

  // Consent management
  updateConsent(granted: boolean): void {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied'
      })
    }

    this.log('Consent updated:', granted)
  }

  // Debug logging
  private log(message: string, data?: any): void {
    if (this.config.customEvents?.debug) {
      console.log(`[Analytics] ${message}`, data || '')
    }
  }
}

// Predefined event tracking functions for common actions
export const trackSignup = (method: string = 'email') => {
  analytics.trackEvent({
    action: 'sign_up',
    category: 'user',
    label: method,
    customParameters: { method }
  })
}

export const trackLogin = (method: string = 'email') => {
  analytics.trackEvent({
    action: 'login',
    category: 'user',
    label: method,
    customParameters: { method }
  })
}

export const trackSubscription = (plan: string, value: number) => {
  analytics.trackEvent({
    action: 'subscribe',
    category: 'conversion',
    label: plan,
    value: value,
    customParameters: { plan, subscription_value: value }
  })
}

export const trackTradingAction = (action: string, symbol?: string) => {
  analytics.trackEvent({
    action: action,
    category: 'trading',
    label: symbol,
    customParameters: { symbol, trading_action: action }
  })
}

export const trackContentEngagement = (contentType: string, contentId: string, engagement: string) => {
  analytics.trackEvent({
    action: engagement,
    category: 'content',
    label: `${contentType}:${contentId}`,
    customParameters: { content_type: contentType, content_id: contentId }
  })
}

export const trackSearch = (query: string, results: number) => {
  analytics.trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    customParameters: { search_query: query, results_count: results }
  })
}

// Global analytics instance
export const analytics = new AnalyticsManager()

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: (event: AnalyticsEvent) => analytics.trackEvent(event),
    trackPageView: (url: string, title?: string) => analytics.trackPageView(url, title),
    trackPurchase: (transaction: EcommerceEvent) => analytics.trackPurchase(transaction),
    identifyUser: (userId: string, traits?: Record<string, any>) => analytics.identifyUser(userId, traits),
    updateConsent: (granted: boolean) => analytics.updateConsent(granted)
  }
}

// Analytics scripts for head injection
export const getAnalyticsScripts = (config: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG): string[] => {
  const scripts: string[] = []

  // Google Analytics
  if (config.googleAnalytics?.enabled) {
    scripts.push(`
      <script async src="https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.measurementId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.googleAnalytics.measurementId}', {
          anonymize_ip: ${config.googleAnalytics.anonymizeIp},
          cookie_consent: ${config.googleAnalytics.cookieConsent}
        });
      </script>
    `)
  }

  // Google Tag Manager
  if (config.googleTagManager?.enabled) {
    scripts.push(`
      <script>
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','${config.googleTagManager.dataLayerName || 'dataLayer'}','${config.googleTagManager.containerId}');
      </script>
    `)
  }

  return scripts
}

// Type augmentations for global objects
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    fbq: any
    _fbq: any
    hj: any
    _hjSettings: any
  }
}

// Export for testing
export const __testing__ = {
  AnalyticsManager,
  DEFAULT_ANALYTICS_CONFIG
}


