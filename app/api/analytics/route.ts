import { NextRequest, NextResponse } from 'next/server'
import { businessAnalytics } from '@/lib/analytics/business-analytics'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const period = searchParams.get('period') || 'last_30_days'
  const page = searchParams.get('page')
  const funnelId = searchParams.get('funnelId')
  
  // Basic admin/analytics access check
  const isAuthorized = request.headers.get('x-user-role') === 'admin' || 
                      request.cookies.get('admin-session')?.value ||
                      request.headers.get('authorization')?.includes('analytics')

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Analytics access required' }, { status: 403 })
  }

  try {
    switch (action) {
      case 'business_metrics':
        return getBusinessMetrics(period)
      
      case 'funnel_analysis':
        return getFunnelAnalysis(funnelId, period)
      
      case 'cohort_analysis':
        return getCohortAnalysis(period)
      
      case 'page_analytics':
        return getPageAnalytics(page, period)
      
      case 'realtime':
        return getRealtimeAnalytics()
      
      case 'user_segments':
        return getUserSegments()
      
      case 'export':
        return exportAnalyticsData(searchParams)
      
      default:
        return NextResponse.json({
          message: 'Analytics API endpoint',
          actions: [
            'business_metrics',
            'funnel_analysis', 
            'cohort_analysis',
            'page_analytics',
            'realtime',
            'user_segments',
            'export'
          ],
          usage: '/api/analytics?action=business_metrics&period=last_30_days'
        })
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    // Check if this is a tracking request (no auth required for basic tracking)
    const isTrackingRequest = [
      'track_event',
      'track_page_view', 
      'track_conversion',
      'start_session'
    ].includes(action)

    if (!isTrackingRequest) {
      const isAuthorized = request.headers.get('x-user-role') === 'admin' || 
                          request.cookies.get('admin-session')?.value
      
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    switch (action) {
      case 'start_session':
        return startSession(body)
      
      case 'track_event':
        return trackEvent(body)
      
      case 'track_page_view':
        return trackPageView(body)
      
      case 'track_conversion':
        return trackConversion(body)
      
      case 'create_funnel':
        return createFunnel(body)
      
      case 'create_segment':
        return createSegment(body)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET Action Handlers
async function getBusinessMetrics(period: string) {
  const metrics = businessAnalytics.calculateBusinessMetrics(period)
  
  return NextResponse.json({
    success: true,
    data: metrics,
    generated_at: new Date().toISOString()
  })
}

async function getFunnelAnalysis(funnelId: string | null, period: string) {
  if (!funnelId) {
    return NextResponse.json({ error: 'Funnel ID required' }, { status: 400 })
  }

  try {
    const analysis = businessAnalytics.analyzeFunnel(funnelId, period)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
  }
}

async function getCohortAnalysis(period: string) {
  const cohortType = period.includes('day') ? 'daily' : 
                    period.includes('week') ? 'weekly' : 'monthly'
  
  const analysis = businessAnalytics.generateCohortAnalysis(cohortType, period)
  
  return NextResponse.json({
    success: true,
    data: analysis,
    generated_at: new Date().toISOString()
  })
}

async function getPageAnalytics(page: string | null, period: string) {
  if (!page) {
    return NextResponse.json({ error: 'Page parameter required' }, { status: 400 })
  }

  const analytics = businessAnalytics.analyzePagePerformance(page, period)
  
  return NextResponse.json({
    success: true,
    data: analytics,
    generated_at: new Date().toISOString()
  })
}

async function getRealtimeAnalytics() {
  const realtimeData = businessAnalytics.getRealtimeAnalytics()
  
  return NextResponse.json({
    success: true,
    data: realtimeData,
    generated_at: new Date().toISOString()
  })
}

async function getUserSegments() {
  // Mock user segments data - in production, this would come from the analytics manager
  const segments = [
    {
      id: 'high_value_users',
      name: 'High Value Users',
      description: 'Users with high lifetime value and engagement',
      userCount: 1247,
      avgSessionDuration: 450,
      avgPageViews: 12.3,
      conversionRate: 8.7,
      avgRevenue: 245
    },
    {
      id: 'trial_users',
      name: 'Trial Users',
      description: 'Users currently in trial period',
      userCount: 892,
      avgSessionDuration: 280,
      avgPageViews: 8.1,
      conversionRate: 34.2,
      avgRevenue: 0
    },
    {
      id: 'churned_users',
      name: 'Churned Users',
      description: 'Users who have cancelled subscriptions',
      userCount: 456,
      avgSessionDuration: 120,
      avgPageViews: 3.2,
      conversionRate: 0,
      avgRevenue: -89
    }
  ]

  return NextResponse.json({
    success: true,
    data: { segments },
    generated_at: new Date().toISOString()
  })
}

async function exportAnalyticsData(searchParams: URLSearchParams) {
  const dataType = searchParams.get('type') || 'sessions'
  const format = searchParams.get('format') || 'json'
  
  const exportData = businessAnalytics.exportData(
    dataType as 'sessions' | 'events' | 'users',
    format as 'json' | 'csv'
  )

  const contentType = format === 'csv' ? 'text/csv' : 'application/json'
  const filename = `analytics_${dataType}_${new Date().toISOString().split('T')[0]}.${format}`

  return new NextResponse(exportData, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}

// POST Action Handlers
async function startSession(body: any) {
  const session = businessAnalytics.startSession({
    userId: body.userId,
    anonymousId: body.anonymousId,
    device: body.device,
    location: body.location,
    referrer: body.referrer,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmTerm: body.utmTerm,
    utmContent: body.utmContent
  })

  return NextResponse.json({
    success: true,
    data: { sessionId: session.id },
    message: 'Session started successfully'
  })
}

async function trackEvent(body: any) {
  const { sessionId, eventName, eventCategory, properties, page, userId, value } = body

  if (!sessionId || !eventName || !eventCategory || !page) {
    return NextResponse.json({ 
      error: 'Missing required fields: sessionId, eventName, eventCategory, page' 
    }, { status: 400 })
  }

  const event = businessAnalytics.trackEvent({
    sessionId,
    userId,
    eventName,
    eventCategory,
    properties: properties || {},
    page,
    value
  })

  return NextResponse.json({
    success: true,
    data: { eventId: event.id },
    message: 'Event tracked successfully'
  })
}

async function trackPageView(body: any) {
  const { sessionId, page, referrer, userId } = body

  if (!sessionId || !page) {
    return NextResponse.json({ 
      error: 'Missing required fields: sessionId, page' 
    }, { status: 400 })
  }

  businessAnalytics.trackPageView(sessionId, page, referrer, userId)

  return NextResponse.json({
    success: true,
    message: 'Page view tracked successfully'
  })
}

async function trackConversion(body: any) {
  const { sessionId, conversionType, value, userId, properties } = body

  if (!sessionId || !conversionType) {
    return NextResponse.json({ 
      error: 'Missing required fields: sessionId, conversionType' 
    }, { status: 400 })
  }

  businessAnalytics.trackConversion(sessionId, conversionType, value, userId, properties)

  return NextResponse.json({
    success: true,
    message: 'Conversion tracked successfully'
  })
}

async function createFunnel(body: any) {
  const { name, steps } = body

  if (!name || !steps || !Array.isArray(steps)) {
    return NextResponse.json({ 
      error: 'Missing required fields: name, steps (array)' 
    }, { status: 400 })
  }

  const funnel = businessAnalytics.createFunnel(name, steps)

  return NextResponse.json({
    success: true,
    data: funnel,
    message: 'Funnel created successfully'
  })
}

async function createSegment(body: any) {
  const { name, description, conditions } = body

  if (!name || !conditions || !Array.isArray(conditions)) {
    return NextResponse.json({ 
      error: 'Missing required fields: name, conditions (array)' 
    }, { status: 400 })
  }

  // Mock segment creation - in production, this would create an actual segment
  const segment = {
    id: `segment_${Date.now()}`,
    name,
    description: description || '',
    conditions,
    createdAt: new Date().toISOString(),
    userCount: Math.floor(Math.random() * 1000) + 100 // Mock count
  }

  return NextResponse.json({
    success: true,
    data: segment,
    message: 'Segment created successfully'
  })
}

// Analytics Health Check
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
      'X-Analytics-Status': 'healthy'
    }
  })
}

// Analytics Summary Endpoint (GET /api/analytics/summary)
export async function OPTIONS() {
  return NextResponse.json({
    endpoints: {
      GET: {
        '/api/analytics?action=business_metrics': 'Get business metrics for a period',
        '/api/analytics?action=funnel_analysis&funnelId=xxx': 'Analyze conversion funnel',
        '/api/analytics?action=cohort_analysis': 'Generate cohort retention analysis',
        '/api/analytics?action=page_analytics&page=xxx': 'Get page performance analytics',
        '/api/analytics?action=realtime': 'Get real-time analytics data',
        '/api/analytics?action=user_segments': 'Get user segment data',
        '/api/analytics?action=export&type=sessions&format=csv': 'Export analytics data'
      },
      POST: {
        '/api/analytics (action: start_session)': 'Start a new user session',
        '/api/analytics (action: track_event)': 'Track a user event',
        '/api/analytics (action: track_page_view)': 'Track a page view',
        '/api/analytics (action: track_conversion)': 'Track a conversion event',
        '/api/analytics (action: create_funnel)': 'Create a new conversion funnel',
        '/api/analytics (action: create_segment)': 'Create a new user segment'
      }
    },
    parameters: {
      period: ['last_24_hours', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year'],
      format: ['json', 'csv'],
      type: ['sessions', 'events', 'users']
    },
    authentication: 'Admin role required for most endpoints, tracking endpoints are public',
    rate_limits: 'Standard rate limits apply'
  })
}


