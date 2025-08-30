/**
 * Automated Test Scheduler
 * Handles scheduled test execution and monitoring
 */

import { ComprehensiveTestSuite, TestType, TestResult } from './comprehensive-test-suite'
import { ChaosTestRunner, DEFAULT_CHAOS_CONFIG } from './chaos-test'
import { businessAnalytics } from '@/lib/analytics/business-analytics'

export interface ScheduledTest {
  id: string
  name: string
  description: string
  schedule: string // cron format
  testTypes: TestType[]
  config: TestConfig
  enabled: boolean
  lastRun?: string
  nextRun?: string
  results: ScheduledTestResult[]
  createdAt: string
  updatedAt: string
}

export interface TestConfig {
  baseUrl: string
  concurrent: number
  duration: number
  timeout: number
  retries: number
  environment: 'development' | 'staging' | 'production'
  notifications: {
    onFailure: boolean
    onSuccess: boolean
    emails: string[]
    webhook?: string
  }
}

export interface ScheduledTestResult {
  id: string
  scheduledTestId: string
  startTime: string
  endTime: string
  status: 'passed' | 'failed' | 'partial' | 'cancelled'
  overallScore: number
  testsRun: number
  testsPassed: number
  testsFailed: number
  results: TestResult[]
  errors?: string[]
  systemHealth: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
  }
}

export interface TestAlert {
  id: string
  scheduledTestId: string
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  data?: Record<string, any>
}

export class TestScheduler {
  private scheduledTests: Map<string, ScheduledTest> = new Map()
  private activeJobs: Map<string, NodeJS.Timeout> = new Map()
  private testResults: Map<string, ScheduledTestResult> = new Map()
  private alerts: TestAlert[] = []
  private testSuite: ComprehensiveTestSuite
  private isRunning = false

  constructor() {
    this.testSuite = new ComprehensiveTestSuite()
    this.initializeDefaultSchedules()
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('⏰ Test scheduler is already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting test scheduler...')

    // Schedule all enabled tests
    for (const [id, scheduledTest] of this.scheduledTests) {
      if (scheduledTest.enabled) {
        this.scheduleTest(id, scheduledTest)
      }
    }

    // Start health monitoring
    this.startHealthMonitoring()

    console.log(`✅ Test scheduler started with ${this.scheduledTests.size} scheduled tests`)
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏰ Test scheduler is not running')
      return
    }

    this.isRunning = false
    console.log('🛑 Stopping test scheduler...')

    // Clear all active jobs
    for (const [id, timeout] of this.activeJobs) {
      clearTimeout(timeout)
      console.log(`⏹️  Cancelled scheduled test: ${id}`)
    }
    this.activeJobs.clear()

    console.log('✅ Test scheduler stopped')
  }

  /**
   * Add a new scheduled test
   */
  addScheduledTest(test: Omit<ScheduledTest, 'id' | 'createdAt' | 'updatedAt' | 'results'>): string {
    const id = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const scheduledTest: ScheduledTest = {
      id,
      ...test,
      results: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.scheduledTests.set(id, scheduledTest)

    if (scheduledTest.enabled && this.isRunning) {
      this.scheduleTest(id, scheduledTest)
    }

    console.log(`📅 Added scheduled test: ${scheduledTest.name} (${id})`)
    return id
  }

  /**
   * Update a scheduled test
   */
  updateScheduledTest(id: string, updates: Partial<ScheduledTest>): boolean {
    const existing = this.scheduledTests.get(id)
    if (!existing) return false

    // Cancel existing schedule if it exists
    const activeJob = this.activeJobs.get(id)
    if (activeJob) {
      clearTimeout(activeJob)
      this.activeJobs.delete(id)
    }

    const updated: ScheduledTest = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.scheduledTests.set(id, updated)

    // Reschedule if enabled and scheduler is running
    if (updated.enabled && this.isRunning) {
      this.scheduleTest(id, updated)
    }

    console.log(`📝 Updated scheduled test: ${updated.name} (${id})`)
    return true
  }

  /**
   * Remove a scheduled test
   */
  removeScheduledTest(id: string): boolean {
    const existing = this.scheduledTests.get(id)
    if (!existing) return false

    // Cancel active job
    const activeJob = this.activeJobs.get(id)
    if (activeJob) {
      clearTimeout(activeJob)
      this.activeJobs.delete(id)
    }

    this.scheduledTests.delete(id)
    console.log(`🗑️  Removed scheduled test: ${existing.name} (${id})`)
    return true
  }

  /**
   * Run a scheduled test immediately
   */
  async runTestNow(id: string): Promise<ScheduledTestResult | null> {
    const scheduledTest = this.scheduledTests.get(id)
    if (!scheduledTest) return null

    console.log(`🚀 Running scheduled test immediately: ${scheduledTest.name}`)
    return this.executeTest(scheduledTest)
  }

  /**
   * Get all scheduled tests
   */
  getScheduledTests(): ScheduledTest[] {
    return Array.from(this.scheduledTests.values())
  }

  /**
   * Get test results
   */
  getTestResults(scheduledTestId?: string, limit = 50): ScheduledTestResult[] {
    const results = Array.from(this.testResults.values())
    
    let filteredResults = scheduledTestId 
      ? results.filter(r => r.scheduledTestId === scheduledTestId)
      : results

    return filteredResults
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit)
  }

  /**
   * Get alerts
   */
  getAlerts(acknowledged = false, limit = 100): TestAlert[] {
    return this.alerts
      .filter(alert => acknowledged || !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.acknowledged = true
    console.log(`✅ Alert acknowledged: ${alertId}`)
    return true
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean
    scheduledTests: number
    enabledTests: number
    activeJobs: number
    totalResults: number
    unacknowledgedAlerts: number
  } {
    return {
      isRunning: this.isRunning,
      scheduledTests: this.scheduledTests.size,
      enabledTests: Array.from(this.scheduledTests.values()).filter(t => t.enabled).length,
      activeJobs: this.activeJobs.size,
      totalResults: this.testResults.size,
      unacknowledgedAlerts: this.alerts.filter(a => !a.acknowledged).length
    }
  }

  /**
   * Private Methods
   */
  private scheduleTest(id: string, scheduledTest: ScheduledTest): void {
    // Calculate next run time based on cron schedule
    const nextRun = this.calculateNextRun(scheduledTest.schedule)
    const delay = nextRun.getTime() - Date.now()

    if (delay > 0) {
      const timeout = setTimeout(async () => {
        await this.executeTest(scheduledTest)
        // Reschedule for next occurrence
        this.scheduleTest(id, scheduledTest)
      }, delay)

      this.activeJobs.set(id, timeout)
      
      // Update next run time
      scheduledTest.nextRun = nextRun.toISOString()
      
      console.log(`⏰ Scheduled test '${scheduledTest.name}' for ${nextRun.toISOString()}`)
    }
  }

  private async executeTest(scheduledTest: ScheduledTest): Promise<ScheduledTestResult> {
    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = new Date().toISOString()

    console.log(`🧪 Executing scheduled test: ${scheduledTest.name}`)

    // Create analytics session for this test run
    const analyticsSession = businessAnalytics.startSession({
      userId: 'scheduler',
      properties: {
        scheduledTestId: scheduledTest.id,
        testName: scheduledTest.name,
        testTypes: scheduledTest.testTypes
      }
    })

    const result: ScheduledTestResult = {
      id: resultId,
      scheduledTestId: scheduledTest.id,
      startTime,
      endTime: '',
      status: 'failed',
      overallScore: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      results: [],
      systemHealth: {
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 0
      }
    }

    try {
      const testResults: TestResult[] = []

      // Execute each test type
      for (const testType of scheduledTest.testTypes) {
        try {
          const testResult = await this.testSuite.runTestSuite(testType, {
            sessionId: resultId,
            ...scheduledTest.config
          })

          testResults.push(testResult)

          // Track individual test in analytics
          businessAnalytics.trackEvent({
            sessionId: analyticsSession.id,
            eventName: 'scheduled_test_completed',
            eventCategory: 'testing',
            properties: {
              testType,
              status: testResult.status,
              score: testResult.score,
              duration: testResult.duration
            }
          })

        } catch (error: any) {
          console.error(`❌ Test ${testType} failed:`, error.message)
          
          // Create failed test result
          const failedResult: TestResult = {
            id: `failed_${Date.now()}`,
            name: `${testType} (Failed)`,
            category: 'scheduled',
            type: testType,
            status: 'failed',
            duration: 0,
            startTime: new Date().toISOString(),
            score: 0,
            details: error.message,
            errors: [{ level: 'error', message: error.message, code: 'EXECUTION_ERROR', timestamp: new Date().toISOString() }]
          }
          
          testResults.push(failedResult)
        }
      }

      // Calculate final results
      result.endTime = new Date().toISOString()
      result.results = testResults
      result.testsRun = testResults.length
      result.testsPassed = testResults.filter(r => r.status === 'passed').length
      result.testsFailed = testResults.filter(r => r.status === 'failed').length
      result.overallScore = testResults.length > 0 
        ? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length)
        : 0

      // Determine overall status
      if (result.testsPassed === result.testsRun) {
        result.status = 'passed'
      } else if (result.testsPassed > 0) {
        result.status = 'partial'
      } else {
        result.status = 'failed'
      }

      // Get system health
      result.systemHealth = await this.getSystemHealth()

      // Update scheduled test
      scheduledTest.lastRun = startTime
      scheduledTest.results.unshift(result)
      
      // Keep only last 50 results per test
      if (scheduledTest.results.length > 50) {
        scheduledTest.results = scheduledTest.results.slice(0, 50)
      }

      console.log(`✅ Scheduled test completed: ${scheduledTest.name} (Score: ${result.overallScore}/100)`)

      // Track test completion in analytics
      businessAnalytics.trackConversion(analyticsSession.id, 'scheduled_test_session_completed', undefined, undefined, {
        testId: scheduledTest.id,
        testName: scheduledTest.name,
        status: result.status,
        score: result.overallScore,
        testsRun: result.testsRun
      })

      // Send notifications if configured
      if (scheduledTest.config.notifications.onSuccess && result.status === 'passed') {
        await this.sendNotification(scheduledTest, result, 'success')
      } else if (scheduledTest.config.notifications.onFailure && result.status !== 'passed') {
        await this.sendNotification(scheduledTest, result, 'failure')
        
        // Create alert for failures
        this.createAlert({
          scheduledTestId: scheduledTest.id,
          level: result.status === 'failed' ? 'error' : 'warning',
          title: `Scheduled Test ${result.status === 'failed' ? 'Failed' : 'Partially Failed'}`,
          message: `${scheduledTest.name}: ${result.testsPassed}/${result.testsRun} tests passed (Score: ${result.overallScore}/100)`,
          data: { resultId: result.id, testId: scheduledTest.id }
        })
      }

    } catch (error: any) {
      console.error(`❌ Scheduled test execution failed: ${scheduledTest.name}`, error)
      
      result.endTime = new Date().toISOString()
      result.status = 'failed'
      result.errors = [error.message]

      // Create critical alert
      this.createAlert({
        scheduledTestId: scheduledTest.id,
        level: 'critical',
        title: 'Scheduled Test Execution Failed',
        message: `${scheduledTest.name}: Test execution completely failed - ${error.message}`,
        data: { error: error.message, testId: scheduledTest.id }
      })

      // Send failure notification
      if (scheduledTest.config.notifications.onFailure) {
        await this.sendNotification(scheduledTest, result, 'error')
      }
    }

    // Store result
    this.testResults.set(resultId, result)

    return result
  }

  private calculateNextRun(cronSchedule: string): Date {
    // Simple cron parser - in production, use a proper cron library
    const now = new Date()
    
    // Default to 1 hour from now for unsupported schedules
    const nextRun = new Date(now.getTime() + 60 * 60 * 1000)
    
    // Basic parsing for common patterns
    if (cronSchedule === '0 */6 * * *') { // Every 6 hours
      const hours = Math.ceil(now.getHours() / 6) * 6
      nextRun.setHours(hours, 0, 0, 0)
      if (nextRun <= now) {
        nextRun.setHours(nextRun.getHours() + 6)
      }
    } else if (cronSchedule === '0 0 * * *') { // Daily at midnight
      nextRun.setHours(24, 0, 0, 0)
    } else if (cronSchedule === '0 */1 * * *') { // Every hour
      nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0)
    }
    
    return nextRun
  }

  private async getSystemHealth(): Promise<ScheduledTestResult['systemHealth']> {
    // Mock system health - replace with real metrics
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      responseTime: Math.random() * 200 + 50,
      errorRate: Math.random() * 5
    }
  }

  private createAlert(alert: Omit<TestAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const newAlert: TestAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      ...alert
    }

    this.alerts.unshift(newAlert)
    
    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(0, 500)
    }

    console.log(`🚨 Alert created: ${newAlert.title}`)
  }

  private async sendNotification(scheduledTest: ScheduledTest, result: ScheduledTestResult, type: 'success' | 'failure' | 'error'): Promise<void> {
    // Mock notification sending - implement email/webhook logic
    const emoji = type === 'success' ? '✅' : type === 'failure' ? '⚠️' : '❌'
    const subject = `${emoji} ${scheduledTest.name} - ${type.toUpperCase()}`
    const message = `Test completed with status: ${result.status}\nScore: ${result.overallScore}/100\nTests: ${result.testsPassed}/${result.testsRun} passed`
    
    console.log(`📧 Notification sent: ${subject}`)
    console.log(`   To: ${scheduledTest.config.notifications.emails.join(', ')}`)
    console.log(`   Message: ${message}`)
    
    // In production, implement actual email/webhook sending
    // await emailService.send(scheduledTest.config.notifications.emails, subject, message)
    // if (scheduledTest.config.notifications.webhook) {
    //   await webhook.send(scheduledTest.config.notifications.webhook, { subject, message, result })
    // }
  }

  private startHealthMonitoring(): void {
    // Monitor scheduler health every 5 minutes
    setInterval(() => {
      if (!this.isRunning) return

      const status = this.getStatus()
      console.log(`💓 Scheduler health check: ${status.enabledTests} enabled tests, ${status.activeJobs} active jobs`)
      
      // Create alert if no tests are scheduled but scheduler is running
      if (status.enabledTests === 0 && status.isRunning) {
        this.createAlert({
          scheduledTestId: 'scheduler',
          level: 'warning',
          title: 'No Scheduled Tests',
          message: 'Test scheduler is running but no tests are enabled'
        })
      }
    }, 5 * 60 * 1000)
  }

  private initializeDefaultSchedules(): void {
    // System Health Check - Every 6 hours
    this.addScheduledTest({
      name: 'System Health Check',
      description: 'Comprehensive system health and performance monitoring',
      schedule: '0 */6 * * *',
      testTypes: ['smoke', 'functional', 'performance'],
      enabled: true,
      config: {
        baseUrl: 'http://localhost:3060',
        concurrent: 10,
        duration: 300,
        timeout: 60000,
        retries: 2,
        environment: 'production',
        notifications: {
          onFailure: true,
          onSuccess: false,
          emails: ['admin@nexuraltrading.com']
        }
      }
    })

    // Security Audit - Daily
    this.addScheduledTest({
      name: 'Daily Security Audit',
      description: 'Daily security and vulnerability assessment',
      schedule: '0 2 * * *',
      testTypes: ['security', 'vulnerability'],
      enabled: true,
      config: {
        baseUrl: 'http://localhost:3060',
        concurrent: 5,
        duration: 600,
        timeout: 120000,
        retries: 1,
        environment: 'production',
        notifications: {
          onFailure: true,
          onSuccess: false,
          emails: ['security@nexuraltrading.com', 'admin@nexuraltrading.com']
        }
      }
    })

    // Chaos Engineering - Weekly
    this.addScheduledTest({
      name: 'Weekly Chaos Test',
      description: 'Weekly resilience and chaos engineering tests',
      schedule: '0 3 * * 0',
      testTypes: ['chaos'],
      enabled: false, // Disabled by default
      config: {
        baseUrl: 'http://localhost:3060',
        concurrent: 15,
        duration: 900,
        timeout: 180000,
        retries: 0,
        environment: 'staging',
        notifications: {
          onFailure: true,
          onSuccess: true,
          emails: ['sre@nexuraltrading.com']
        }
      }
    })

    console.log('📋 Initialized default test schedules')
  }
}

// Global scheduler instance
export const testScheduler = new TestScheduler()
