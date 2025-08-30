/**
 * Advanced Business Analytics System
 * Comprehensive tracking and analysis of user behavior, business metrics, and conversions
 */

export interface UserSession {
  id: string
  userId?: string
  anonymousId: string
  startTime: string
  endTime?: string
  duration?: number
  pageViews: number
  events: AnalyticsEvent[]
  device: DeviceInfo
  location: LocationInfo
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  isConverted: boolean
  conversionValue?: number
  exitPage?: string
}

export interface AnalyticsEvent {
  id: string
  sessionId: string
  userId?: string
  eventName: string
  eventCategory: 'page_view' | 'user_interaction' | 'conversion' | 'trading' | 'subscription' | 'community' | 'error' | 'performance'
  properties: Record<string, any>
  timestamp: string
  page: string
  referrer?: string
  duration?: number
  value?: number
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  os: string
  browser: string
  browserVersion: string
  screenResolution: string
  viewportSize: string
  userAgent: string
  language: string
  timezone: string
}

export interface LocationInfo {
  country?: string
  region?: string
  city?: string
  timezone: string
  ip?: string
}

export interface ConversionFunnel {
  id: string
  name: string
  steps: FunnelStep[]
  timeWindow: number // days
  createdAt: string
  updatedAt: string
}

export interface FunnelStep {
  id: string
  name: string
  eventName: string
  conditions?: Record<string, any>
  order: number
}

export interface FunnelAnalysis {
  funnelId: string
  period: string
  totalSessions: number
  steps: Array<{
    stepId: string
    stepName: string
    sessions: number
    conversionRate: number
    dropOffRate: number
    avgTimeToNext?: number
  }>
  conversionRate: number
  topDropOffPoints: Array<{
    fromStep: string
    toStep: string
    dropOffRate: number
    sessionsDropped: number
  }>
}

export interface CohortAnalysis {
  cohortType: 'daily' | 'weekly' | 'monthly'
  period: string
  cohorts: Array<{
    cohortDate: string
    size: number
    retention: number[]
    revenue?: number[]
    averageValue?: number
  }>
  averageRetention: number[]
  retentionRates: {
    day1?: number
    day7?: number
    day30?: number
    day90?: number
  }
}

export interface UserBehaviorSegment {
  id: string
  name: string
  description: string
  conditions: SegmentCondition[]
  userCount: number
  avgSessionDuration: number
  avgPageViews: number
  conversionRate: number
  avgRevenue: number
  createdAt: string
  updatedAt: string
}

export interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface BusinessMetrics {
  period: string
  totalRevenue: number
  recurringRevenue: number
  newRevenue: number
  churnedRevenue: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  averageRevenuePerUser: number
  customerLifetimeValue: number
  customerAcquisitionCost: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  churnRate: number
  retentionRate: number
  netPromoterScore?: number
  conversionRates: {
    signup: number
    trial: number
    paid: number
    premium: number
  }
}

export interface PageAnalytics {
  page: string
  period: string
  pageViews: number
  uniquePageViews: number
  avgTimeOnPage: number
  bounceRate: number
  exitRate: number
  conversions: number
  conversionRate: number
  topReferrers: Array<{
    referrer: string
    sessions: number
    conversionRate: number
  }>
  userFlow: Array<{
    fromPage: string
    toPage: string
    sessions: number
    percentage: number
  }>
}

export interface RealtimeAnalytics {
  timestamp: string
  activeUsers: number
  pageViewsLast5Min: number
  conversionsLast5Min: number
  topPages: Array<{
    page: string
    activeUsers: number
  }>
  topCountries: Array<{
    country: string
    activeUsers: number
  }>
  recentEvents: AnalyticsEvent[]
  systemHealth: {
    averageResponseTime: number
    errorRate: number
    uptime: number
  }
}

// Analytics Manager Class
export class BusinessAnalyticsManager {
  private sessions: Map<string, UserSession> = new Map()
  private events: AnalyticsEvent[] = []
  private funnels: Map<string, ConversionFunnel> = new Map()
  private segments: Map<string, UserBehaviorSegment> = new Map()
  
  constructor() {
    this.initializeDefaultFunnels()
    this.initializeDefaultSegments()
  }

  // Session Management
  startSession(sessionData: Partial<UserSession>): UserSession {
    const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const session: UserSession = {
      id: sessionId,
      userId: sessionData.userId,
      anonymousId: sessionData.anonymousId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      pageViews: 0,
      events: [],
      device: sessionData.device || this.getDefaultDeviceInfo(),
      location: sessionData.location || this.getDefaultLocationInfo(),
      referrer: sessionData.referrer,
      utmSource: sessionData.utmSource,
      utmMedium: sessionData.utmMedium,
      utmCampaign: sessionData.utmCampaign,
      utmTerm: sessionData.utmTerm,
      utmContent: sessionData.utmContent,
      isConverted: false
    }

    this.sessions.set(sessionId, session)
    return session
  }

  endSession(sessionId: string, exitPage?: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.endTime = new Date().toISOString()
    session.duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    session.exitPage = exitPage
  }

  // Event Tracking
  trackEvent(eventData: Partial<AnalyticsEvent>): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: eventData.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: eventData.sessionId!,
      userId: eventData.userId,
      eventName: eventData.eventName!,
      eventCategory: eventData.eventCategory!,
      properties: eventData.properties || {},
      timestamp: new Date().toISOString(),
      page: eventData.page!,
      referrer: eventData.referrer,
      duration: eventData.duration,
      value: eventData.value
    }

    this.events.push(event)
    
    // Add to session
    const session = this.sessions.get(event.sessionId)
    if (session) {
      session.events.push(event)
      
      // Track page views
      if (event.eventCategory === 'page_view') {
        session.pageViews++
      }
      
      // Track conversions
      if (event.eventCategory === 'conversion') {
        session.isConverted = true
        session.conversionValue = (session.conversionValue || 0) + (event.value || 0)
      }
    }

    return event
  }

  // Page View Tracking
  trackPageView(sessionId: string, page: string, referrer?: string, userId?: string): void {
    this.trackEvent({
      sessionId,
      userId,
      eventName: 'page_view',
      eventCategory: 'page_view',
      page,
      referrer,
      properties: {
        page,
        referrer,
        timestamp: Date.now()
      }
    })
  }

  // Conversion Tracking
  trackConversion(sessionId: string, conversionType: string, value?: number, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent({
      sessionId,
      userId,
      eventName: conversionType,
      eventCategory: 'conversion',
      page: properties?.page || window?.location?.pathname || '/',
      value,
      properties: {
        conversionType,
        value,
        ...properties
      }
    })
  }

  // Trading Event Tracking
  trackTradingEvent(sessionId: string, eventType: string, tradingData: Record<string, any>, userId?: string): void {
    this.trackEvent({
      sessionId,
      userId,
      eventName: eventType,
      eventCategory: 'trading',
      page: tradingData.page || '/dashboard',
      value: tradingData.value,
      properties: {
        eventType,
        ...tradingData
      }
    })
  }

  // User Interaction Tracking
  trackUserInteraction(sessionId: string, elementType: string, elementId: string, action: string, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent({
      sessionId,
      userId,
      eventName: `${elementType}_${action}`,
      eventCategory: 'user_interaction',
      page: properties?.page || window?.location?.pathname || '/',
      properties: {
        elementType,
        elementId,
        action,
        ...properties
      }
    })
  }

  // Funnel Analysis
  createFunnel(name: string, steps: Array<{name: string, eventName: string, conditions?: Record<string, any>}>): ConversionFunnel {
    const funnel: ConversionFunnel = {
      id: `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      steps: steps.map((step, index) => ({
        id: `step_${index}`,
        name: step.name,
        eventName: step.eventName,
        conditions: step.conditions,
        order: index
      })),
      timeWindow: 30, // 30 days default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.funnels.set(funnel.id, funnel)
    return funnel
  }

  analyzeFunnel(funnelId: string, period: string = 'last_30_days'): FunnelAnalysis {
    const funnel = this.funnels.get(funnelId)
    if (!funnel) throw new Error('Funnel not found')

    // Get period date range
    const { startDate, endDate } = this.parsePeriod(period)
    
    // Get sessions in period
    const periodSessions = Array.from(this.sessions.values())
      .filter(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= startDate && sessionDate <= endDate
      })

    const totalSessions = periodSessions.length
    const stepAnalysis = []
    
    let previousStepSessions = periodSessions

    for (const step of funnel.steps) {
      // Find sessions that completed this step
      const stepSessions = previousStepSessions.filter(session => 
        session.events.some(event => 
          event.eventName === step.eventName && 
          this.matchesConditions(event, step.conditions)
        )
      )

      const conversionRate = previousStepSessions.length > 0 
        ? (stepSessions.length / previousStepSessions.length) * 100 
        : 0
      
      const dropOffRate = 100 - conversionRate

      stepAnalysis.push({
        stepId: step.id,
        stepName: step.name,
        sessions: stepSessions.length,
        conversionRate,
        dropOffRate
      })

      previousStepSessions = stepSessions
    }

    const overallConversionRate = totalSessions > 0 
      ? (previousStepSessions.length / totalSessions) * 100 
      : 0

    // Calculate top drop-off points
    const topDropOffPoints = []
    for (let i = 0; i < stepAnalysis.length - 1; i++) {
      const fromStep = stepAnalysis[i]
      const toStep = stepAnalysis[i + 1]
      const dropOffRate = fromStep.conversionRate - toStep.conversionRate
      const sessionsDropped = fromStep.sessions - toStep.sessions

      if (dropOffRate > 0) {
        topDropOffPoints.push({
          fromStep: fromStep.stepName,
          toStep: toStep.stepName,
          dropOffRate,
          sessionsDropped
        })
      }
    }

    return {
      funnelId,
      period,
      totalSessions,
      steps: stepAnalysis,
      conversionRate: overallConversionRate,
      topDropOffPoints: topDropOffPoints.sort((a, b) => b.dropOffRate - a.dropOffRate).slice(0, 5)
    }
  }

  // Cohort Analysis
  generateCohortAnalysis(cohortType: 'daily' | 'weekly' | 'monthly', period: string = 'last_12_weeks'): CohortAnalysis {
    const { startDate, endDate } = this.parsePeriod(period)
    
    // Group users by cohort (first session date)
    const userCohorts = new Map<string, string[]>()
    
    Array.from(this.sessions.values()).forEach(session => {
      if (!session.userId) return
      
      const sessionDate = new Date(session.startTime)
      if (sessionDate < startDate || sessionDate > endDate) return
      
      const cohortKey = this.getCohortKey(sessionDate, cohortType)
      if (!userCohorts.has(cohortKey)) {
        userCohorts.set(cohortKey, [])
      }
      
      if (!userCohorts.get(cohortKey)!.includes(session.userId)) {
        userCohorts.get(cohortKey)!.push(session.userId)
      }
    })

    // Calculate retention for each cohort
    const cohorts = []
    const maxPeriods = cohortType === 'daily' ? 30 : cohortType === 'weekly' ? 12 : 12

    for (const [cohortDate, userIds] of userCohorts.entries()) {
      const cohortStartDate = new Date(cohortDate)
      const retention = []
      const revenue = []

      for (let period = 0; period < maxPeriods; period++) {
        const periodStart = new Date(cohortStartDate)
        const periodEnd = new Date(cohortStartDate)

        if (cohortType === 'daily') {
          periodStart.setDate(periodStart.getDate() + period)
          periodEnd.setDate(periodEnd.getDate() + period + 1)
        } else if (cohortType === 'weekly') {
          periodStart.setDate(periodStart.getDate() + (period * 7))
          periodEnd.setDate(periodEnd.getDate() + ((period + 1) * 7))
        } else {
          periodStart.setMonth(periodStart.getMonth() + period)
          periodEnd.setMonth(periodEnd.getMonth() + period + 1)
        }

        // Count active users in this period
        const activeSessions = Array.from(this.sessions.values()).filter(session => 
          session.userId && 
          userIds.includes(session.userId) &&
          new Date(session.startTime) >= periodStart && 
          new Date(session.startTime) < periodEnd
        )

        const activeUsers = new Set(activeSessions.map(s => s.userId)).size
        const retentionRate = (activeUsers / userIds.length) * 100

        retention.push(retentionRate)

        // Calculate revenue for this period
        const periodRevenue = activeSessions
          .filter(s => s.conversionValue)
          .reduce((sum, s) => sum + (s.conversionValue || 0), 0)
        revenue.push(periodRevenue)
      }

      cohorts.push({
        cohortDate,
        size: userIds.length,
        retention,
        revenue,
        averageValue: revenue.reduce((a, b) => a + b, 0) / userIds.length
      })
    }

    // Calculate average retention across all cohorts
    const averageRetention = []
    for (let period = 0; period < maxPeriods; period++) {
      const totalRetention = cohorts.reduce((sum, cohort) => sum + (cohort.retention[period] || 0), 0)
      const avgRetention = cohorts.length > 0 ? totalRetention / cohorts.length : 0
      averageRetention.push(avgRetention)
    }

    return {
      cohortType,
      period,
      cohorts: cohorts.sort((a, b) => new Date(b.cohortDate).getTime() - new Date(a.cohortDate).getTime()),
      averageRetention,
      retentionRates: {
        day1: averageRetention[1],
        day7: averageRetention[7],
        day30: averageRetention[30],
        day90: averageRetention[90]
      }
    }
  }

  // Business Metrics
  calculateBusinessMetrics(period: string = 'last_30_days'): BusinessMetrics {
    const { startDate, endDate } = this.parsePeriod(period)
    
    const periodSessions = Array.from(this.sessions.values())
      .filter(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= startDate && sessionDate <= endDate
      })

    const conversionEvents = this.events.filter(event => 
      event.eventCategory === 'conversion' &&
      new Date(event.timestamp) >= startDate &&
      new Date(event.timestamp) <= endDate
    )

    // Revenue calculations
    const totalRevenue = conversionEvents.reduce((sum, event) => sum + (event.value || 0), 0)
    
    // User calculations
    const totalUsers = new Set(periodSessions.filter(s => s.userId).map(s => s.userId)).size
    const newUsers = periodSessions.filter(session => {
      // Check if this is user's first session
      const userSessions = Array.from(this.sessions.values())
        .filter(s => s.userId === session.userId)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      return userSessions[0]?.id === session.id
    }).length

    const activeUsers = new Set(
      periodSessions
        .filter(s => s.userId && s.events.length > 0)
        .map(s => s.userId)
    ).size

    // Conversion rates
    const signupEvents = conversionEvents.filter(e => e.eventName === 'signup')
    const trialEvents = conversionEvents.filter(e => e.eventName === 'trial_start')
    const paidEvents = conversionEvents.filter(e => e.eventName === 'subscription_created')
    const premiumEvents = conversionEvents.filter(e => e.eventName === 'premium_upgrade')

    const totalSessions = periodSessions.length
    
    return {
      period,
      totalRevenue,
      recurringRevenue: paidEvents.reduce((sum, event) => sum + (event.value || 0), 0),
      newRevenue: totalRevenue, // Simplified
      churnedRevenue: 0, // Would need churn tracking
      totalUsers,
      activeUsers,
      newUsers,
      churnedUsers: 0, // Would need churn tracking
      averageRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      customerLifetimeValue: 150, // Mock calculation - would need historical data
      customerAcquisitionCost: 25, // Mock - would calculate from marketing spend
      monthlyRecurringRevenue: paidEvents.reduce((sum, event) => sum + (event.value || 0), 0),
      annualRecurringRevenue: paidEvents.reduce((sum, event) => sum + (event.value || 0), 0) * 12,
      churnRate: 0.05, // Mock - 5% monthly churn
      retentionRate: 0.95, // Mock - 95% retention
      netPromoterScore: 72, // Mock NPS score
      conversionRates: {
        signup: totalSessions > 0 ? (signupEvents.length / totalSessions) * 100 : 0,
        trial: signupEvents.length > 0 ? (trialEvents.length / signupEvents.length) * 100 : 0,
        paid: trialEvents.length > 0 ? (paidEvents.length / trialEvents.length) * 100 : 0,
        premium: paidEvents.length > 0 ? (premiumEvents.length / paidEvents.length) * 100 : 0
      }
    }
  }

  // Page Analytics
  analyzePagePerformance(page: string, period: string = 'last_7_days'): PageAnalytics {
    const { startDate, endDate } = this.parsePeriod(period)
    
    const pageEvents = this.events.filter(event => 
      event.page === page &&
      new Date(event.timestamp) >= startDate &&
      new Date(event.timestamp) <= endDate
    )

    const pageViewEvents = pageEvents.filter(e => e.eventCategory === 'page_view')
    const conversionEvents = pageEvents.filter(e => e.eventCategory === 'conversion')
    
    const uniqueSessions = new Set(pageEvents.map(e => e.sessionId))
    const sessionsWithBounce = Array.from(uniqueSessions).filter(sessionId => {
      const session = this.sessions.get(sessionId)
      return session && session.pageViews === 1
    })

    // Calculate time on page
    const pageDurations = pageEvents
      .filter(e => e.duration)
      .map(e => e.duration!)
    const avgTimeOnPage = pageDurations.length > 0 
      ? pageDurations.reduce((a, b) => a + b, 0) / pageDurations.length 
      : 0

    // Top referrers
    const referrerCounts = new Map<string, number>()
    pageEvents.forEach(event => {
      if (event.referrer) {
        referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) || 0) + 1)
      }
    })

    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, sessions]) => ({
        referrer,
        sessions,
        conversionRate: 0 // Would need to calculate from referrer sessions
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10)

    return {
      page,
      period,
      pageViews: pageViewEvents.length,
      uniquePageViews: uniqueSessions.size,
      avgTimeOnPage,
      bounceRate: uniqueSessions.size > 0 ? (sessionsWithBounce.length / uniqueSessions.size) * 100 : 0,
      exitRate: 0, // Would need exit tracking
      conversions: conversionEvents.length,
      conversionRate: pageViewEvents.length > 0 ? (conversionEvents.length / pageViewEvents.length) * 100 : 0,
      topReferrers,
      userFlow: [] // Would need flow analysis
    }
  }

  // Real-time Analytics
  getRealtimeAnalytics(): RealtimeAnalytics {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => {
        const lastActivity = new Date(Math.max(
          new Date(session.startTime).getTime(),
          ...(session.events.map(e => new Date(e.timestamp).getTime()))
        ))
        return lastActivity > fiveMinutesAgo && !session.endTime
      })

    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) > fiveMinutesAgo
    ).slice(-50)

    const activeUsers = new Set(activeSessions.map(s => s.userId || s.anonymousId)).size
    const pageViewsLast5Min = recentEvents.filter(e => e.eventCategory === 'page_view').length
    const conversionsLast5Min = recentEvents.filter(e => e.eventCategory === 'conversion').length

    // Top pages by active users
    const pageUsers = new Map<string, Set<string>>()
    activeSessions.forEach(session => {
      const lastPageEvent = session.events
        .filter(e => e.eventCategory === 'page_view')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      
      if (lastPageEvent) {
        if (!pageUsers.has(lastPageEvent.page)) {
          pageUsers.set(lastPageEvent.page, new Set())
        }
        pageUsers.get(lastPageEvent.page)!.add(session.userId || session.anonymousId)
      }
    })

    const topPages = Array.from(pageUsers.entries())
      .map(([page, users]) => ({ page, activeUsers: users.size }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 10)

    return {
      timestamp: new Date().toISOString(),
      activeUsers,
      pageViewsLast5Min,
      conversionsLast5Min,
      topPages,
      topCountries: [
        { country: 'United States', activeUsers: Math.floor(activeUsers * 0.4) },
        { country: 'United Kingdom', activeUsers: Math.floor(activeUsers * 0.2) },
        { country: 'Canada', activeUsers: Math.floor(activeUsers * 0.15) },
        { country: 'Germany', activeUsers: Math.floor(activeUsers * 0.1) },
        { country: 'Australia', activeUsers: Math.floor(activeUsers * 0.08) }
      ],
      recentEvents: recentEvents.slice(-10),
      systemHealth: {
        averageResponseTime: 150 + Math.random() * 50, // Mock
        errorRate: Math.random() * 2, // Mock 0-2% error rate
        uptime: 99.9 // Mock 99.9% uptime
      }
    }
  }

  // Utility Methods
  private parsePeriod(period: string): { startDate: Date, endDate: Date } {
    const now = new Date()
    const endDate = new Date(now)
    let startDate = new Date(now)

    switch (period) {
      case 'last_24_hours':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'last_7_days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'last_90_days':
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'last_12_weeks':
        startDate.setDate(startDate.getDate() - 84)
        break
      case 'last_6_months':
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case 'last_year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    return { startDate, endDate }
  }

  private getCohortKey(date: Date, cohortType: 'daily' | 'weekly' | 'monthly'): string {
    if (cohortType === 'daily') {
      return date.toISOString().split('T')[0]
    } else if (cohortType === 'weekly') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toISOString().split('T')[0]
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
  }

  private matchesConditions(event: AnalyticsEvent, conditions?: Record<string, any>): boolean {
    if (!conditions) return true
    
    for (const [key, value] of Object.entries(conditions)) {
      if (event.properties[key] !== value) {
        return false
      }
    }
    
    return true
  }

  private getDefaultDeviceInfo(): DeviceInfo {
    return {
      type: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      browserVersion: '0.0',
      screenResolution: '1920x1080',
      viewportSize: '1920x1080',
      userAgent: 'Unknown',
      language: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  private getDefaultLocationInfo(): LocationInfo {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  private initializeDefaultFunnels(): void {
    this.createFunnel('User Onboarding', [
      { name: 'Landing Page Visit', eventName: 'page_view', conditions: { page: '/' } },
      { name: 'Sign Up Started', eventName: 'signup_started' },
      { name: 'Account Created', eventName: 'signup' },
      { name: 'Email Verified', eventName: 'email_verified' },
      { name: 'Profile Completed', eventName: 'profile_completed' }
    ])

    this.createFunnel('Subscription Conversion', [
      { name: 'Pricing Page Visit', eventName: 'page_view', conditions: { page: '/pricing' } },
      { name: 'Plan Selected', eventName: 'plan_selected' },
      { name: 'Checkout Started', eventName: 'checkout_started' },
      { name: 'Payment Info Added', eventName: 'payment_info_added' },
      { name: 'Subscription Created', eventName: 'subscription_created' }
    ])
  }

  private initializeDefaultSegments(): void {
    // Implementation for default user segments
  }

  // Data Export
  exportData(type: 'sessions' | 'events' | 'users', format: 'json' | 'csv' = 'json'): string {
    let data: any[] = []

    switch (type) {
      case 'sessions':
        data = Array.from(this.sessions.values())
        break
      case 'events':
        data = this.events
        break
      case 'users':
        data = this.getUserProfiles()
        break
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      return this.convertToCSV(data)
    }
  }

  private getUserProfiles(): any[] {
    const users = new Map<string, any>()
    
    Array.from(this.sessions.values()).forEach(session => {
      if (!session.userId) return
      
      if (!users.has(session.userId)) {
        users.set(session.userId, {
          userId: session.userId,
          firstSeen: session.startTime,
          totalSessions: 0,
          totalPageViews: 0,
          totalEvents: 0,
          totalRevenue: 0,
          isConverted: false
        })
      }

      const user = users.get(session.userId)
      user.totalSessions++
      user.totalPageViews += session.pageViews
      user.totalEvents += session.events.length
      user.totalRevenue += session.conversionValue || 0
      if (session.isConverted) user.isConverted = true
    })

    return Array.from(users.values())
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }
}

// Global analytics instance
export const businessAnalytics = new BusinessAnalyticsManager()

// Predefined event tracking functions
export const trackPageView = (page: string, sessionId: string, userId?: string, referrer?: string) => {
  return businessAnalytics.trackPageView(sessionId, page, referrer, userId)
}

export const trackSignup = (sessionId: string, userId?: string, properties?: Record<string, any>) => {
  return businessAnalytics.trackConversion(sessionId, 'signup', undefined, userId, properties)
}

export const trackSubscription = (sessionId: string, planType: string, value: number, userId?: string) => {
  return businessAnalytics.trackConversion(sessionId, 'subscription_created', value, userId, { planType })
}

export const trackTrade = (sessionId: string, tradeData: Record<string, any>, userId?: string) => {
  return businessAnalytics.trackTradingEvent(sessionId, 'trade_executed', tradeData, userId)
}

export const trackButtonClick = (sessionId: string, buttonId: string, userId?: string, properties?: Record<string, any>) => {
  return businessAnalytics.trackUserInteraction(sessionId, 'button', buttonId, 'click', userId, properties)
}

// Export for testing
export const __testing__ = {
  BusinessAnalyticsManager
}


