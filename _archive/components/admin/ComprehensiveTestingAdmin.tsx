"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Play,
  Pause,
  RotateCcw,
  Download,
  FileText,
  TestTube,
  Shield,
  Zap,
  Target,
  Bug,
  Cpu,
  Globe,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  PlayCircle,
  StopCircle,
  AlertCircle,
  Info,
  Layers,
  Database,
  Server,
  Network,
  Lock,
  Flame,
  Brain,
  Search
} from "lucide-react"

// Mock data - in production this would come from the comprehensive test suite
const mockTestData = {
  currentExecution: null,
  isRunning: false,
  recentExecutions: [
    {
      id: 'exec_1',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T10:45:30Z',
      duration: 2730,
      status: 'completed',
      summary: {
        total: 127,
        passed: 118,
        failed: 6,
        skipped: 3,
        score: 93
      }
    },
    {
      id: 'exec_2',
      startTime: '2024-01-14T14:30:00Z',
      endTime: '2024-01-14T15:12:45Z',
      duration: 2565,
      status: 'completed',
      summary: {
        total: 127,
        passed: 115,
        failed: 9,
        skipped: 3,
        score: 91
      }
    }
  ],
  testSuites: [
    {
      id: 'unit_tests',
      name: 'Unit Tests',
      description: 'Individual component and function testing',
      category: 'backend',
      testsCount: 45,
      enabled: true,
      avgDuration: 180,
      successRate: 96.5,
      lastRun: '2024-01-15T10:00:00Z'
    },
    {
      id: 'integration_tests',
      name: 'Integration Tests',
      description: 'Test component interactions and data flow',
      category: 'backend',
      testsCount: 28,
      enabled: true,
      avgDuration: 420,
      successRate: 94.2,
      lastRun: '2024-01-15T10:05:00Z'
    },
    {
      id: 'functional_tests',
      name: 'Functional Tests',
      description: 'End-to-end business functionality testing',
      category: 'frontend',
      testsCount: 18,
      enabled: true,
      avgDuration: 650,
      successRate: 88.9,
      lastRun: '2024-01-15T10:15:00Z'
    },
    {
      id: 'security_tests',
      name: 'Security Tests',
      description: 'Comprehensive security vulnerability testing',
      category: 'security',
      testsCount: 22,
      enabled: true,
      avgDuration: 380,
      successRate: 77.3,
      lastRun: '2024-01-15T10:25:00Z'
    },
    {
      id: 'performance_tests',
      name: 'Performance Tests',
      description: 'Load, stress, and performance testing',
      category: 'performance',
      testsCount: 12,
      enabled: true,
      avgDuration: 720,
      successRate: 91.7,
      lastRun: '2024-01-15T10:30:00Z'
    },
    {
      id: 'chaos_tests',
      name: 'Chaos Engineering Tests',
      description: 'Test system resilience and failure recovery',
      category: 'reliability',
      testsCount: 8,
      enabled: false,
      avgDuration: 480,
      successRate: 75.0,
      lastRun: '2024-01-14T14:45:00Z'
    },
    {
      id: 'vulnerability_tests',
      name: 'Vulnerability Assessment',
      description: 'Comprehensive vulnerability scanning',
      category: 'security',
      testsCount: 15,
      enabled: true,
      avgDuration: 540,
      successRate: 80.0,
      lastRun: '2024-01-15T10:35:00Z'
    }
  ],
  liveResults: [
    {
      id: 'unit_auth_service',
      name: 'Authentication Service Tests',
      suite: 'Unit Tests',
      type: 'unit',
      status: 'passed',
      duration: 23.5,
      score: 95,
      startTime: '2024-01-15T10:00:12Z'
    },
    {
      id: 'security_xss',
      name: 'XSS Protection Tests',
      suite: 'Security Tests',
      type: 'security',
      status: 'failed',
      duration: 45.2,
      score: 65,
      startTime: '2024-01-15T10:25:30Z',
      errors: ['XSS vulnerability in user input field']
    },
    {
      id: 'perf_load',
      name: 'Load Testing',
      suite: 'Performance Tests',
      type: 'performance',
      status: 'passed',
      duration: 125.8,
      score: 88,
      startTime: '2024-01-15T10:30:15Z'
    },
    {
      id: 'int_database',
      name: 'Database Integration Tests',
      suite: 'Integration Tests',
      type: 'integration',
      status: 'running',
      duration: 0,
      score: 0,
      startTime: '2024-01-15T10:45:00Z'
    }
  ]
}

const testTypeIcons = {
  unit: TestTube,
  integration: Layers,
  functional: Target,
  smoke: Flame,
  security: Shield,
  performance: Zap,
  stress: Cpu,
  chaos: Brain,
  vulnerability: Bug,
  api: Globe,
  ui: Smartphone
}

const categoryIcons = {
  infrastructure: Server,
  backend: Database,
  frontend: Smartphone,
  api: Globe,
  security: Shield,
  performance: Zap,
  reliability: Activity,
  compliance: Lock
}

export default function ComprehensiveTestingAdmin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSuites, setSelectedSuites] = useState<string[]>([])
  const [testProgress, setTestProgress] = useState(0)
  const [liveResults, setLiveResults] = useState(mockTestData.liveResults)
  const [currentExecution, setCurrentExecution] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': case 'completed': return 'text-green-400 bg-green-600'
      case 'failed': return 'text-red-400 bg-red-600'
      case 'running': return 'text-blue-400 bg-blue-600'
      case 'skipped': return 'text-gray-400 bg-gray-600'
      case 'pending': return 'text-amber-400 bg-amber-600'
      default: return 'text-gray-400 bg-gray-600'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleRunTests = async () => {
    if (selectedSuites.length === 0) {
      alert('Please select at least one test suite to run')
      return
    }

    setIsRunning(true)
    setTestProgress(0)
    setCurrentExecution(`exec_${Date.now()}`)

    // Simulate test execution
    const totalDuration = 60000 // 1 minute simulation
    const interval = 1000
    let elapsed = 0

    const progressInterval = setInterval(() => {
      elapsed += interval
      const progress = Math.min((elapsed / totalDuration) * 100, 100)
      setTestProgress(progress)

      if (progress >= 100) {
        clearInterval(progressInterval)
        setIsRunning(false)
        setCurrentExecution(null)
        console.log('✅ Test execution completed!')
      }
    }, interval)
  }

  const handleStopTests = () => {
    setIsRunning(false)
    setTestProgress(0)
    setCurrentExecution(null)
  }

  const handleSuiteToggle = (suiteId: string) => {
    setSelectedSuites(prev => 
      prev.includes(suiteId)
        ? prev.filter(id => id !== suiteId)
        : [...prev, suiteId]
    )
  }

  const calculateOverallStats = () => {
    const enabled = mockTestData.testSuites.filter(s => s.enabled)
    const totalTests = enabled.reduce((sum, s) => sum + s.testsCount, 0)
    const avgSuccessRate = enabled.reduce((sum, s) => sum + s.successRate, 0) / enabled.length
    const totalSuites = enabled.length

    return {
      totalTests,
      totalSuites,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      enabledSuites: enabled.length
    }
  }

  const stats = calculateOverallStats()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comprehensive Testing Suite</h1>
          <p className="text-gray-400">Enterprise-grade testing infrastructure for all testing types</p>
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <Button 
              onClick={handleRunTests}
              disabled={selectedSuites.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Selected Tests
            </Button>
          ) : (
            <Button 
              onClick={handleStopTests}
              className="bg-red-600 hover:bg-red-700"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Tests
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Test Execution Progress */}
      {isRunning && (
        <Card className="mb-6 bg-blue-900/20 border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Test Execution in Progress</h3>
                  <p className="text-blue-400">Running {selectedSuites.length} test suites</p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-blue-100">
                {testProgress.toFixed(0)}% Complete
              </Badge>
            </div>
            <Progress value={testProgress} className="h-3 mb-2" />
            <div className="text-sm text-gray-400">
              Execution ID: {currentExecution}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Live Results</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <TestTube className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">{stats.totalTests}</div>
                <div className="text-sm text-gray-400">Total Tests</div>
                <div className="text-xs text-blue-400 mt-1">{stats.totalSuites} suites</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">{stats.avgSuccessRate}%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
                <div className="text-xs text-green-400 mt-1">Average across all suites</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">{stats.enabledSuites}</div>
                <div className="text-sm text-gray-400">Active Suites</div>
                <div className="text-xs text-purple-400 mt-1">Currently enabled</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">
                  {mockTestData.recentExecutions.length > 0 ? 
                    formatDuration(mockTestData.recentExecutions[0].duration) : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Last Duration</div>
                <div className="text-xs text-amber-400 mt-1">Most recent run</div>
              </CardContent>
            </Card>
          </div>

          {/* Test Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-cyan-400" />
                  Test Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    mockTestData.testSuites.reduce((acc, suite) => {
                      acc[suite.category] = (acc[suite.category] || 0) + suite.testsCount
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => {
                    const Icon = categoryIcons[category as keyof typeof categoryIcons] || Settings
                    const percentage = ((count / stats.totalTests) * 100).toFixed(1)
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-white capitalize">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{count} tests</span>
                          <Badge variant="outline">{percentage}%</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Executions */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTestData.recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Execution {execution.id.split('_')[1]}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(execution.startTime).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <div className="text-sm text-gray-400 mt-1">
                          Score: {execution.summary.score}% • {formatDuration(execution.duration)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {execution.summary.passed}/{execution.summary.total} passed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Suites Tab */}
        <TabsContent value="suites" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Test Suites Configuration</h3>
            <div className="flex gap-4">
              <Button 
                onClick={() => setSelectedSuites(mockTestData.testSuites.filter(s => s.enabled).map(s => s.id))}
                variant="outline"
              >
                Select All Active
              </Button>
              <Button 
                onClick={() => setSelectedSuites([])}
                variant="outline"
              >
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {mockTestData.testSuites.map((suite) => {
              const Icon = categoryIcons[suite.category as keyof typeof categoryIcons] || Settings
              const isSelected = selectedSuites.includes(suite.id)
              
              return (
                <Card 
                  key={suite.id} 
                  className={`bg-gray-900 border-gray-800 transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-900/20' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSuiteToggle(suite.id)}
                          disabled={!suite.enabled}
                          className="mt-1"
                        />
                        
                        <Icon className="w-6 h-6 text-gray-400 mt-1" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{suite.name}</h4>
                            <Badge className={suite.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                              {suite.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {suite.category}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 mb-4">{suite.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-400">Tests</div>
                              <div className="text-white font-medium">{suite.testsCount}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Success Rate</div>
                              <div className="text-green-400 font-medium">{suite.successRate}%</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Avg Duration</div>
                              <div className="text-white font-medium">{formatDuration(suite.avgDuration)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Last Run</div>
                              <div className="text-white font-medium">
                                {new Date(suite.lastRun).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSuiteToggle(suite.id)}
                        >
                          <PlayCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Live Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Live Test Results</h3>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {liveResults.map((result) => {
              const Icon = testTypeIcons[result.type as keyof typeof testTypeIcons] || TestTube
              
              return (
                <Card key={result.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(result.status).split(' ')[1]} ${
                          result.status === 'running' ? 'animate-pulse' : ''
                        }`} />
                        
                        <Icon className="w-5 h-5 text-gray-400" />
                        
                        <div>
                          <h4 className="font-semibold text-white">{result.name}</h4>
                          <div className="text-sm text-gray-400">
                            {result.suite} • {result.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          {result.status !== 'running' && (
                            <div className="text-sm text-gray-400 mt-1">
                              Score: {result.score}% • {formatDuration(result.duration)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {result.status === 'failed' && (
                            <Button size="sm" variant="outline">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Errors</span>
                        </div>
                        <ul className="mt-2 text-sm text-red-300">
                          {result.errors.map((error, index) => (
                            <li key={index} className="list-disc list-inside">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Test Reports</h3>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Generate New Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTestData.recentExecutions.map((execution) => (
              <Card key={execution.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white">Test Report</h4>
                      <div className="text-sm text-gray-400">
                        {new Date(execution.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Overall Score</span>
                      <span className="text-white font-medium">{execution.summary.score}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tests Passed</span>
                      <span className="text-green-400">{execution.summary.passed}/{execution.summary.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{formatDuration(execution.duration)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Test Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">+5.2%</div>
                <div className="text-sm text-gray-400">Success Rate Trend</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">-12s</div>
                <div className="text-sm text-gray-400">Avg Duration Change</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">98.2%</div>
                <div className="text-sm text-gray-400">Reliability Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Activity className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">847</div>
                <div className="text-sm text-gray-400">Tests Run (30d)</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Test Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-400">Advanced test analytics and performance trends would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Testing Configuration</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Execution Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Parallel execution</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Fail fast on errors</Label>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Generate detailed reports</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Email notifications</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Retry failed tests</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Notification Recipients</Label>
                  <div className="text-sm text-gray-400 mt-1 mb-2">
                    Email addresses to notify on test completion
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white bg-gray-800 p-2 rounded">
                      admin@nexural.com
                    </div>
                    <div className="text-sm text-white bg-gray-800 p-2 rounded">
                      qa@nexural.com
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-white">Notification Triggers</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <span className="text-sm text-white">Test execution completion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <span className="text-sm text-white">Critical test failures</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <span className="text-sm text-white">Performance threshold breaches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <span className="text-sm text-white">Security vulnerabilities found</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Configure timeouts, retries, and resource limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Settings</h3>
                <p className="text-gray-400">Advanced configuration options would be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


