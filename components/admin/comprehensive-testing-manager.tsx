"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Download,
  Eye,
  Zap,
  Shield,
  Gauge,
  TestTube,
  Brain,
  Target,
  Users,
  Server,
  Database,
  Wifi,
  Bell,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

// Import types only (no server-side modules)
export interface TestResult {
  id: string
  name: string
  category: string
  type: TestType
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration: number
  startTime: string
  endTime?: string
  error?: string
  details?: any
  coverage?: number
  performance?: {
    memory: number
    cpu: number
    responseTime: number
  }
}

export type TestType = 
  | 'unit' 
  | 'integration' 
  | 'e2e' 
  | 'performance' 
  | 'security' 
  | 'accessibility' 
  | 'chaos' 
  | 'load' 
  | 'stress' 
  | 'smoke' 
  | 'regression' 
  | 'api' 
  | 'database' 
  | 'ui' 
  | 'mobile'

export interface TestSuite {
  id: string
  name: string
  description: string
  category: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: string
  endTime?: string
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  coverage?: number
}

interface TestSession {
  id: string
  name: string
  type: 'manual' | 'scheduled' | 'triggered'
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration: number
  testsRun: number
  testsPassed: number
  testsFailed: number
  overallScore: number
  results: TestResult[]
  analytics: {
    sessionsTracked: number
    eventsTracked: number
    conversionsTracked: number
    realTimeUsers: number
  }
  systemHealth: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
  }
}

interface TestAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  testSession?: string
  acknowledged: boolean
}

// Use API calls instead of direct class instantiation

export default function ComprehensiveTestingManager() {
  const [activeTab, setActiveTab] = useState("overview")
  const [testSessions, setTestSessions] = useState<TestSession[]>([])
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [alerts, setAlerts] = useState<TestAlert[]>([])
  const [selectedTestTypes, setSelectedTestTypes] = useState<TestType[]>(['smoke', 'functional', 'security'])
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)
  const [testSettings, setTestSettings] = useState({
    concurrent: 25,
    duration: 300,
    baseUrl: 'http://localhost:3060',
    schedule: '0 */6 * * *' // Every 6 hours
  })

  // Real-time updates
  useEffect(() => {
    if (!realTimeMonitoring) return

    const interval = setInterval(async () => {
      await Promise.all([
        updateCurrentSession(),
        updateAnalytics(),
        checkSystemHealth(),
        checkForAlerts()
      ])
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [realTimeMonitoring, currentSession?.id])

  const updateCurrentSession = async () => {
    if (!currentSession || currentSession.status !== 'running') return
    
    // Get latest results from API
    const response = await fetch('/api/testing/results')
    const results = await response.json()
    const sessionResults = results.filter((r: TestResult) => r.id.startsWith(currentSession.id))
    
    const updatedSession: TestSession = {
      ...currentSession,
      testsRun: sessionResults.length,
      testsPassed: sessionResults.filter(r => r.status === 'passed').length,
      testsFailed: sessionResults.filter(r => r.status === 'failed').length,
      results: sessionResults,
      overallScore: sessionResults.length > 0 
        ? Math.round(sessionResults.reduce((sum, r) => sum + r.score, 0) / sessionResults.length)
        : 0
    }
    
    setCurrentSession(updatedSession)
    
    // Update sessions list
    setTestSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))
  }

  const updateAnalytics = async () => {
    try {
      const analytics = await fetch('/api/analytics?action=realtime')
      const data = await analytics.json()
      
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          analytics: {
            sessionsTracked: data.activeUsers || 0,
            eventsTracked: data.pageViewsLast5Min || 0,
            conversionsTracked: data.conversionsLast5Min || 0,
            realTimeUsers: data.activeUsers || 0
          }
        } : null)
      }
    } catch (error) {
      console.error('Failed to update analytics:', error)
    }
  }

  const checkSystemHealth = async () => {
    try {
      const health = await fetch('/api/health')
      const data = await health.json()
      
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          systemHealth: {
            cpuUsage: Math.random() * 100, // Mock - replace with real data
            memoryUsage: Math.random() * 100,
            responseTime: data.responseTime || Math.random() * 200,
            errorRate: Math.random() * 5
          }
        } : null)
      }
    } catch (error) {
      console.error('Failed to check system health:', error)
    }
  }

  const checkForAlerts = async () => {
    // Check for test failures, performance issues, etc.
    if (!currentSession) return
    
    const newAlerts: TestAlert[] = []
    
    // Check test failures
    const failedTests = currentSession.results.filter(r => r.status === 'failed')
    if (failedTests.length > 0) {
      newAlerts.push({
        id: `alert_${Date.now()}_failures`,
        level: 'error',
        message: `${failedTests.length} test(s) failed in session ${currentSession.name}`,
        timestamp: new Date().toISOString(),
        testSession: currentSession.id,
        acknowledged: false
      })
    }
    
    // Check system health
    if (currentSession.systemHealth.errorRate > 5) {
      newAlerts.push({
        id: `alert_${Date.now()}_errors`,
        level: 'warning',
        message: `High error rate detected: ${currentSession.systemHealth.errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        testSession: currentSession.id,
        acknowledged: false
      })
    }
    
    // Add new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)) // Keep last 50 alerts
    }
  }

  const startTestSession = async (type: 'manual' | 'scheduled' | 'triggered', name?: string) => {
    const sessionId = `test_${Date.now()}`
    const session: TestSession = {
      id: sessionId,
      name: name || `${type} Test Session - ${new Date().toLocaleString()}`,
      type,
      status: 'running',
      startTime: new Date().toISOString(),
      duration: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      overallScore: 0,
      results: [],
      analytics: {
        sessionsTracked: 0,
        eventsTracked: 0,
        conversionsTracked: 0,
        realTimeUsers: 0
      },
      systemHealth: {
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 0
      }
    }
    
    setCurrentSession(session)
    setTestSessions(prev => [session, ...prev])
    setIsRunning(true)
    
    toast.success(`Started ${type} test session`)
    
    try {
      // Start analytics session tracking
      const analyticsSession = {
        id: sessionId,
        userId: 'test_user',
        properties: {
          testSession: sessionId,
          testType: type
        }
      }
      
      // Run selected tests via API
      const testPromises = selectedTestTypes.map(async (testType) => {
        const response = await fetch('/api/testing/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testType,
            sessionId,
            baseUrl: testSettings.baseUrl,
            concurrent: testSettings.concurrent,
            duration: testSettings.duration
          })
        })
        
        const result = await response.json()
        return result
        
        // Track test completion (placeholder for analytics)
        console.log('Test completed:', {
          sessionId: analyticsSession.id,
          eventName: 'test_completed',
          eventCategory: 'testing',
          properties: {
            testType,
            result: result.status,
            score: result.score,
            duration: result.duration
          }
        })
        
        return result
      })
      
      // Wait for all tests to complete
      const results = await Promise.all(testPromises)
      
      // Update final session
      const completedSession: TestSession = {
        ...session,
        status: 'completed',
        endTime: new Date().toISOString(),
        duration: Date.now() - new Date(session.startTime).getTime(),
        results,
        testsRun: results.length,
        testsPassed: results.filter(r => r.status === 'passed').length,
        testsFailed: results.filter(r => r.status === 'failed').length,
        overallScore: results.length > 0 
          ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
          : 0
      }
      
      setCurrentSession(completedSession)
      setTestSessions(prev => prev.map(s => s.id === sessionId ? completedSession : s))
      setIsRunning(false)
      
      toast.success(`Test session completed with score ${completedSession.overallScore}/100`)
      
    } catch (error: any) {
      console.error('Test session failed:', error)
      
      const failedSession: TestSession = {
        ...session,
        status: 'failed',
        endTime: new Date().toISOString(),
        duration: Date.now() - new Date(session.startTime).getTime()
      }
      
      setCurrentSession(failedSession)
      setTestSessions(prev => prev.map(s => s.id === sessionId ? failedSession : s))
      setIsRunning(false)
      
      toast.error(`Test session failed: ${error.message}`)
    }
  }

  const stopCurrentSession = () => {
    if (!currentSession) return
    
    const stoppedSession: TestSession = {
      ...currentSession,
      status: 'cancelled',
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(currentSession.startTime).getTime()
    }
    
    setCurrentSession(stoppedSession)
    setTestSessions(prev => prev.map(s => s.id === stoppedSession.id ? stoppedSession : s))
    setIsRunning(false)
    
    toast.info('Test session stopped')
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const exportSessionData = (session: TestSession) => {
    const data = {
      session,
      analyticsData: [], // Placeholder for analytics data
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-session-${session.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Session data exported')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'cancelled': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Testing Engine Manager</h1>
          <p className="text-gray-400">Comprehensive testing and monitoring system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={realTimeMonitoring ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {realTimeMonitoring ? <Wifi className="w-3 h-3 mr-1" /> : null}
            {realTimeMonitoring ? 'Live' : 'Offline'}
          </Badge>
          <Switch
            checked={realTimeMonitoring}
            onCheckedChange={setRealTimeMonitoring}
          />
        </div>
      </div>

      {/* Control Panel */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Test Control Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Test Types</label>
              <div className="flex flex-wrap gap-2">
                {(['smoke', 'functional', 'security', 'performance', 'chaos'] as TestType[]).map(type => (
                  <Badge 
                    key={type}
                    variant={selectedTestTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTestTypes.includes(type)) {
                        setSelectedTestTypes(prev => prev.filter(t => t !== type))
                      } else {
                        setSelectedTestTypes(prev => [...prev, type])
                      }
                    }}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Concurrent Users</label>
              <Input
                type="number"
                value={testSettings.concurrent}
                onChange={(e) => setTestSettings(prev => ({...prev, concurrent: parseInt(e.target.value) || 25}))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Duration (seconds)</label>
              <Input
                type="number"
                value={testSettings.duration}
                onChange={(e) => setTestSettings(prev => ({...prev, duration: parseInt(e.target.value) || 300}))}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => startTestSession('manual')}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Test Session</span>
            </Button>
            
            {isRunning && (
              <Button
                onClick={stopCurrentSession}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoScheduleEnabled}
                onCheckedChange={setAutoScheduleEnabled}
              />
              <span className="text-sm text-gray-400">Auto Schedule</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Test Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Alerts ({alerts.filter(a => !a.acknowledged).length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Session Status */}
          {currentSession && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    {getStatusIcon(currentSession.status)}
                    <span>Current Session: {currentSession.name}</span>
                  </CardTitle>
                  <Badge className={getStatusColor(currentSession.status)}>
                    {currentSession.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {currentSession.testsPassed}
                    </div>
                    <div className="text-sm text-gray-400">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {currentSession.testsFailed}
                    </div>
                    <div className="text-sm text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {currentSession.overallScore}%
                    </div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {currentSession.analytics.realTimeUsers}
                    </div>
                    <div className="text-sm text-gray-400">Active Users</div>
                  </div>
                </div>
                
                {currentSession.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentSession.testsRun} / {selectedTestTypes.length} tests</span>
                    </div>
                    <Progress 
                      value={(currentSession.testsRun / selectedTestTypes.length) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {/* System Health Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">CPU</div>
                      <div className="text-sm font-semibold text-white">
                        {currentSession.systemHealth.cpuUsage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Memory</div>
                      <div className="text-sm font-semibold text-white">
                        {currentSession.systemHealth.memoryUsage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Response</div>
                      <div className="text-sm font-semibold text-white">
                        {currentSession.systemHealth.responseTime.toFixed(0)}ms
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Errors</div>
                      <div className="text-sm font-semibold text-white">
                        {currentSession.systemHealth.errorRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Sessions</p>
                    <p className="text-2xl font-bold text-white">{testSessions.length}</p>
                  </div>
                  <TestTube className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {testSessions.length > 0 
                        ? Math.round(testSessions.filter(s => s.status === 'completed').length / testSessions.length * 100)
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Score</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {testSessions.length > 0 
                        ? Math.round(testSessions.reduce((sum, s) => sum + s.overallScore, 0) / testSessions.length)
                        : 0}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-400">
                      {alerts.filter(a => !a.acknowledged).length}
                    </p>
                  </div>
                  <Bell className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-4">
            {testSessions.map((session) => (
              <Card key={session.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(session.status)}
                      <div>
                        <h3 className="font-semibold text-white">{session.name}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(session.startTime).toLocaleString()}
                          {session.endTime && ` - ${Math.round(session.duration / 1000)}s`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Score</div>
                        <div className="text-lg font-semibold text-white">
                          {session.overallScore}/100
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Tests</div>
                        <div className="text-lg font-semibold text-white">
                          {session.testsPassed}/{session.testsRun}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportSessionData(session)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentSession(session)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Session Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Sessions</span>
                    <span className="text-white font-semibold">
                      {currentSession?.analytics.sessionsTracked || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events Tracked</span>
                    <span className="text-white font-semibold">
                      {currentSession?.analytics.eventsTracked || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions</span>
                    <span className="text-white font-semibold">
                      {currentSession?.analytics.conversionsTracked || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentSession && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">CPU Usage</span>
                          <span className="text-white">
                            {currentSession.systemHealth.cpuUsage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentSession.systemHealth.cpuUsage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Memory Usage</span>
                          <span className="text-white">
                            {currentSession.systemHealth.memoryUsage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={currentSession.systemHealth.memoryUsage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-white">
                            {currentSession.systemHealth.responseTime.toFixed(0)}ms
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(currentSession.systemHealth.responseTime / 10, 100)} 
                          className="h-2" 
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-400">No alerts at this time</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`bg-gray-900/50 border-gray-800 ${
                    !alert.acknowledged ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {alert.level === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        {alert.level === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                        {alert.level === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        {alert.level === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                        <div>
                          <p className="text-white font-medium">{alert.message}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
