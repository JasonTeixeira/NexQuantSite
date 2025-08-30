import { NextRequest, NextResponse } from 'next/server'
import { ComprehensiveTestSuite, TestResult, TestType } from '@/lib/testing/comprehensive-test-suite'
import { ChaosTestRunner, DEFAULT_CHAOS_CONFIG } from '@/lib/testing/chaos-test'
import { businessAnalytics } from '@/lib/analytics/business-analytics'

// Global testing instance
const testSuite = new ComprehensiveTestSuite()
const chaosRunner = new ChaosTestRunner(DEFAULT_CHAOS_CONFIG)

// Active test sessions
const activeSessions = new Map<string, {
  id: string
  name: string
  type: 'manual' | 'scheduled' | 'triggered'
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  testTypes: TestType[]
  results: TestResult[]
  analytics: any
}>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sessionId')
  
  // Basic admin access check
  const isAuthorized = request.headers.get('x-user-role') === 'admin' || 
                      request.cookies.get('admin-session')?.value ||
                      request.headers.get('authorization')?.includes('admin')

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    switch (action) {
      case 'sessions':
        return getSessions()
      
      case 'session':
        return getSession(sessionId)
      
      case 'results':
        return getTestResults(sessionId)
      
      case 'status':
        return getTestingStatus()
      
      case 'health':
        return getSystemHealth()
      
      case 'analytics':
        return getTestingAnalytics()
      
      case 'chaos':
        return getChaosResults()
      
      default:
        return NextResponse.json({
          message: 'Testing API endpoint',
          actions: [
            'sessions',
            'session',
            'results', 
            'status',
            'health',
            'analytics',
            'chaos'
          ],
          usage: '/api/testing?action=sessions'
        })
    }
  } catch (error: any) {
    console.error('Testing API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAuthorized = request.headers.get('x-user-role') === 'admin' || 
                      request.cookies.get('admin-session')?.value

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'start_session':
        return startTestSession(body)
      
      case 'stop_session':
        return stopTestSession(body.sessionId)
      
      case 'run_tests':
        return runTests(body)
      
      case 'run_chaos':
        return runChaosTests(body)
      
      case 'schedule_tests':
        return scheduleTests(body)
      
      case 'track_session':
        return trackTestSession(body)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Testing POST API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

// GET Action Handlers
async function getSessions() {
  const sessions = Array.from(activeSessions.values()).map(session => ({
    ...session,
    duration: session.endTime 
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : Date.now() - new Date(session.startTime).getTime(),
    testsRun: session.results.length,
    testsPassed: session.results.filter(r => r.status === 'passed').length,
    testsFailed: session.results.filter(r => r.status === 'failed').length,
    overallScore: session.results.length > 0 
      ? Math.round(session.results.reduce((sum, r) => sum + r.score, 0) / session.results.length)
      : 0
  }))

  return NextResponse.json({ 
    sessions: sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    count: sessions.length,
    active: sessions.filter(s => s.status === 'running').length
  })
}

async function getSession(sessionId: string | null) {
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const session = activeSessions.get(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get real-time analytics for this session
  const analytics = await getSessionAnalytics(sessionId)
  const systemHealth = await getSystemHealthData()

  return NextResponse.json({
    ...session,
    analytics,
    systemHealth,
    duration: session.endTime 
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : Date.now() - new Date(session.startTime).getTime()
  })
}

async function getTestResults(sessionId: string | null) {
  const results = await testSuite.getAllResults()
  
  if (sessionId) {
    const sessionResults = results.filter(r => r.id.includes(sessionId))
    return NextResponse.json({ 
      results: sessionResults,
      count: sessionResults.length
    })
  }

  return NextResponse.json({ 
    results: results.slice(0, 100), // Last 100 results
    count: results.length
  })
}

async function getTestingStatus() {
  const runningSessions = Array.from(activeSessions.values()).filter(s => s.status === 'running')
  
  return NextResponse.json({
    isRunning: runningSessions.length > 0,
    activeSessions: runningSessions.length,
    totalSessions: activeSessions.size,
    lastRun: runningSessions.length > 0 ? null : getLastCompletedSession()?.endTime,
    systemLoad: {
      cpu: Math.random() * 100, // Mock - replace with real metrics
      memory: Math.random() * 100,
      disk: Math.random() * 100
    }
  })
}

async function getSystemHealth() {
  // Integrate with your existing health check
  const health = {
    status: 'healthy',
    checks: [
      { name: 'API Endpoints', status: 'healthy', responseTime: Math.random() * 50 + 20 },
      { name: 'Database', status: 'healthy', responseTime: Math.random() * 30 + 10 },
      { name: 'Analytics', status: 'healthy', responseTime: Math.random() * 40 + 15 },
      { name: 'Testing Engine', status: 'healthy', responseTime: Math.random() * 60 + 25 }
    ],
    metrics: {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: Math.random() * 200 + 50,
      errorRate: Math.random() * 5,
      uptime: 99.9 + Math.random() * 0.1
    }
  }

  return NextResponse.json(health)
}

async function getTestingAnalytics() {
  try {
    const realTimeAnalytics = businessAnalytics.getRealtimeAnalytics()
    const businessMetrics = businessAnalytics.calculateBusinessMetrics('last_24_hours')
    
    return NextResponse.json({
      realTime: realTimeAnalytics,
      business: businessMetrics,
      testing: {
        totalSessions: activeSessions.size,
        completedSessions: Array.from(activeSessions.values()).filter(s => s.status === 'completed').length,
        failedSessions: Array.from(activeSessions.values()).filter(s => s.status === 'failed').length,
        averageScore: calculateAverageScore(),
        successRate: calculateSuccessRate()
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to get analytics', details: error.message }, { status: 500 })
  }
}

async function getChaosResults() {
  // Return chaos test results if any
  return NextResponse.json({
    available: true,
    scenarios: DEFAULT_CHAOS_CONFIG.scenarios.length,
    lastRun: null, // Would track last chaos test run
    results: [] // Would store chaos test results
  })
}

// POST Action Handlers
async function startTestSession(body: any) {
  const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const session = {
    id: sessionId,
    name: body.name || `Test Session - ${new Date().toLocaleString()}`,
    type: body.type || 'manual',
    status: 'running' as const,
    startTime: new Date().toISOString(),
    testTypes: body.testTypes || ['smoke', 'functional'],
    results: [],
    analytics: {}
  }
  
  activeSessions.set(sessionId, session)
  
  // Start analytics session tracking
  const analyticsSession = businessAnalytics.startSession({
    userId: 'test_user',
    properties: {
      testSession: sessionId,
      testType: session.type
    }
  })
  
  // Track session start event
  businessAnalytics.trackEvent({
    sessionId: analyticsSession.id,
    eventName: 'test_session_started',
    eventCategory: 'testing',
    page: '/admin/testing',
    properties: {
      sessionId,
      testTypes: session.testTypes,
      type: session.type
    }
  })
  
  // Start running tests asynchronously
  runSessionTests(sessionId, session.testTypes, body.config || {})
  
  return NextResponse.json({ 
    success: true, 
    sessionId,
    message: 'Test session started',
    session
  })
}

async function stopTestSession(sessionId: string) {
  const session = activeSessions.get(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  
  session.status = 'cancelled'
  session.endTime = new Date().toISOString()
  
  return NextResponse.json({ 
    success: true, 
    message: 'Test session stopped',
    session
  })
}

async function runTests(body: any) {
  const { testTypes, config = {} } = body
  const sessionId = `adhoc_${Date.now()}`
  
  try {
    const results: TestResult[] = []
    
    for (const testType of testTypes) {
      const result = await testSuite.runTestSuite(testType, {
        sessionId,
        ...config
      })
      results.push(result)
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

async function runChaosTests(body: any) {
  try {
    const config = { ...DEFAULT_CHAOS_CONFIG, ...body.config }
    const runner = new ChaosTestRunner(config)
    const results = await runner.runChaosTests()
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        executed: results.filter(r => r.executed).length,
        successful: results.filter(r => r.success).length,
        criticalIssues: results.filter(r => r.impact.userExperienceImpact === 'CRITICAL').length
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

async function scheduleTests(body: any) {
  // Implement test scheduling logic
  return NextResponse.json({
    success: true,
    message: 'Test scheduling not yet implemented',
    schedule: body.schedule
  })
}

async function trackTestSession(body: any) {
  const { sessionId, event, properties = {} } = body
  
  try {
    // Track testing events in analytics
    businessAnalytics.trackEvent({
      sessionId: sessionId,
      eventName: event,
      eventCategory: 'testing',
      page: '/admin/testing',
      properties: {
        testSession: sessionId,
        ...properties
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Helper Functions
async function runSessionTests(sessionId: string, testTypes: TestType[], config: any) {
  const session = activeSessions.get(sessionId)
  if (!session) return
  
  try {
    for (const testType of testTypes) {
      if (session.status === 'cancelled') break
      
      const result = await testSuite.runTestSuite(testType, {
        sessionId,
        baseUrl: config.baseUrl || 'http://localhost:3060',
        concurrent: config.concurrent || 25,
        duration: config.duration || 300
      })
      
      session.results.push(result)
      
      // Track individual test completion
      businessAnalytics.trackEvent({
        sessionId: sessionId,
        eventName: 'test_completed',
        eventCategory: 'testing',
        page: '/admin/testing',
        properties: {
          testType,
          result: result.status,
          score: result.score,
          duration: result.duration
        }
      })
    }
    
    if (session.status === 'running') {
      session.status = 'completed'
      session.endTime = new Date().toISOString()
      
      // Track session completion
      businessAnalytics.trackConversion(sessionId, 'test_session_completed', undefined, undefined, {
        testsRun: session.results.length,
        testsPassed: session.results.filter(r => r.status === 'passed').length,
        overallScore: session.results.length > 0 
          ? session.results.reduce((sum, r) => sum + r.score, 0) / session.results.length
          : 0
      })
    }
  } catch (error: any) {
    console.error('Session test execution failed:', error)
    session.status = 'failed'
    session.endTime = new Date().toISOString()
  }
}

async function getSessionAnalytics(sessionId: string) {
  try {
    const realTime = businessAnalytics.getRealtimeAnalytics()
    
    return {
      sessionsTracked: realTime.activeUsers,
      eventsTracked: realTime.pageViewsLast5Min,
      conversionsTracked: realTime.conversionsLast5Min,
      realTimeUsers: realTime.activeUsers
    }
  } catch (error) {
    return {
      sessionsTracked: 0,
      eventsTracked: 0,
      conversionsTracked: 0,
      realTimeUsers: 0
    }
  }
}

async function getSystemHealthData() {
  return {
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    responseTime: Math.random() * 200 + 50,
    errorRate: Math.random() * 5
  }
}

function getLastCompletedSession() {
  const completed = Array.from(activeSessions.values())
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  
  return completed[0] || null
}

function calculateAverageScore() {
  const sessions = Array.from(activeSessions.values()).filter(s => s.results.length > 0)
  if (sessions.length === 0) return 0
  
  const totalScore = sessions.reduce((sum, session) => {
    const sessionScore = session.results.reduce((s, r) => s + r.score, 0) / session.results.length
    return sum + sessionScore
  }, 0)
  
  return Math.round(totalScore / sessions.length)
}

function calculateSuccessRate() {
  const completedSessions = Array.from(activeSessions.values()).filter(s => 
    s.status === 'completed' || s.status === 'failed'
  )
  
  if (completedSessions.length === 0) return 0
  
  const successful = completedSessions.filter(s => s.status === 'completed').length
  return Math.round((successful / completedSessions.length) * 100)
}
