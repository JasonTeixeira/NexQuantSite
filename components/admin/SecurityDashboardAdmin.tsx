"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Lock,
  Unlock,
  Ban,
  UserX,
  Zap,
  Globe,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  Download,
  Settings,
  Bell
} from "lucide-react"

// Mock security data
const mockSecurityOverview = {
  overallScore: 94,
  threatLevel: 'low',
  activeThreats: 1,
  blockedAttacks: 156,
  systemUptime: 99.9,
  lastScan: '2024-01-15T10:30:00Z',
  vulnerabilities: {
    critical: 0,
    high: 1,
    medium: 3,
    low: 7
  }
}

const mockThreatAnalytics = {
  last24Hours: {
    totalThreats: 89,
    rateLimits: 23,
    bruteForce: 5,
    xssAttempts: 12,
    sqlInjection: 3,
    csrfBlocked: 8,
    pathTraversal: 2,
    maliciousIPs: 15
  },
  topAttackerIPs: [
    { ip: '192.168.1.100', attempts: 45, location: 'Unknown', status: 'blocked' },
    { ip: '10.0.0.50', attempts: 23, location: 'Russia', status: 'monitoring' },
    { ip: '172.16.0.75', attempts: 18, location: 'China', status: 'blocked' },
    { ip: '203.0.113.42', attempts: 12, location: 'Brazil', status: 'monitoring' }
  ]
}

const mockSystemHealth = {
  components: [
    { name: 'API Gateway', status: 'healthy', uptime: 99.9, responseTime: 145 },
    { name: 'Database', status: 'healthy', uptime: 100.0, responseTime: 12 },
    { name: 'Auth Service', status: 'warning', uptime: 98.7, responseTime: 234 },
    { name: 'File Storage', status: 'healthy', uptime: 99.8, responseTime: 89 },
    { name: 'Real-time Service', status: 'healthy', uptime: 99.5, responseTime: 67 }
  ],
  resources: {
    cpu: { usage: 67, limit: 80, status: 'normal' },
    memory: { usage: 72, limit: 85, status: 'normal' },
    disk: { usage: 45, limit: 90, status: 'normal' },
    network: { usage: 23, limit: 100, status: 'normal' }
  }
}

const mockSecurityEvents = [
  {
    id: 'event1',
    type: 'brute_force',
    severity: 'high',
    timestamp: '2024-01-15T10:25:00Z',
    ip: '192.168.1.100',
    description: 'Multiple failed login attempts detected',
    action: 'IP blocked automatically',
    status: 'resolved'
  },
  {
    id: 'event2',
    type: 'xss_attempt',
    severity: 'medium',
    timestamp: '2024-01-15T09:15:00Z',
    ip: '10.0.0.50',
    description: 'XSS injection attempt in contact form',
    action: 'Request sanitized and logged',
    status: 'monitoring'
  },
  {
    id: 'event3',
    type: 'rate_limit',
    severity: 'low',
    timestamp: '2024-01-15T08:45:00Z',
    ip: '172.16.0.75',
    description: 'API rate limit exceeded',
    action: 'Temporary rate limiting applied',
    status: 'resolved'
  }
]

const mockThreatTrends = [
  { date: '2024-01-09', threats: 45, blocked: 43, critical: 2 },
  { date: '2024-01-10', threats: 52, blocked: 49, critical: 3 },
  { date: '2024-01-11', threats: 38, blocked: 37, critical: 1 },
  { date: '2024-01-12', threats: 67, blocked: 65, critical: 2 },
  { date: '2024-01-13', threats: 73, blocked: 71, critical: 2 },
  { date: '2024-01-14', threats: 89, blocked: 87, critical: 2 },
  { date: '2024-01-15', threats: 94, blocked: 93, critical: 1 }
]

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const getTimeAgo = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours > 0) return `${hours}h ago`
  return `${minutes}m ago`
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-900/20 border-red-700'
    case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-700'
    case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700'
    case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-400'
    case 'warning': return 'text-yellow-400'
    case 'critical': return 'text-red-400'
    case 'blocked': return 'text-red-400'
    case 'monitoring': return 'text-yellow-400'
    case 'resolved': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

export default function SecurityDashboardAdmin() {
  const [isScanning, setIsScanning] = useState(false)

  const runSecurityScan = () => {
    setIsScanning(true)
    // Simulate security scan
    setTimeout(() => {
      setIsScanning(false)
    }, 3000)
  }

  const blockIP = (ip: string) => {
    console.log(`Blocking IP: ${ip}`)
    // In production, this would make an API call
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Security Command Center
          </h1>
          <p className="text-gray-400">
            Monitor threats, manage security policies, and maintain system integrity
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={runSecurityScan} disabled={isScanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Security Scan'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Security Status Alert */}
      {mockSecurityOverview.activeThreats > 0 && (
        <Card className="bg-orange-900/20 border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Active Security Threats</span>
            </div>
            <p className="text-sm text-gray-300">
              {mockSecurityOverview.activeThreats} active threat(s) detected and being monitored
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security Overview Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Security Score</p>
                <p className="text-xl font-bold text-cyan-400">{mockSecurityOverview.overallScore}/100</p>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Excellent
                </div>
              </div>
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Threats</p>
                <p className={`text-xl font-bold ${mockSecurityOverview.activeThreats > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {mockSecurityOverview.activeThreats}
                </p>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <Activity className="w-3 h-3 mr-1" />
                  Monitoring
                </div>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blocked Attacks</p>
                <p className="text-xl font-bold text-green-400">{mockSecurityOverview.blockedAttacks}</p>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <Ban className="w-3 h-3 mr-1" />
                  24h
                </div>
              </div>
              <Ban className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Uptime</p>
                <p className="text-xl font-bold text-blue-400">{mockSecurityOverview.systemUptime}%</p>
                <div className="flex items-center text-xs text-blue-400 mt-1">
                  <Server className="w-3 h-3 mr-1" />
                  Stable
                </div>
              </div>
              <Server className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vulnerabilities</p>
                <p className="text-xl font-bold text-amber-400">
                  {mockSecurityOverview.vulnerabilities.critical + mockSecurityOverview.vulnerabilities.high}
                </p>
                <div className="flex items-center text-xs text-amber-400 mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  High+
                </div>
              </div>
              <Eye className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Last Scan</p>
                <p className="text-sm font-medium">{getTimeAgo(mockSecurityOverview.lastScan)}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Auto
                </div>
              </div>
              <RefreshCw className="w-6 h-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Score Breakdown */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Security Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Access Control</span>
                    <span className="text-sm font-semibold">98/100</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Network Security</span>
                    <span className="text-sm font-semibold">95/100</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Data Protection</span>
                    <span className="text-sm font-semibold">92/100</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Application Security</span>
                    <span className="text-sm font-semibold">89/100</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Infrastructure</span>
                    <span className="text-sm font-semibold">96/100</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Threat Analytics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Threat Types (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Rate Limits', value: mockThreatAnalytics.last24Hours.rateLimits },
                          { name: 'XSS Attempts', value: mockThreatAnalytics.last24Hours.xssAttempts },
                          { name: 'CSRF Blocked', value: mockThreatAnalytics.last24Hours.csrfBlocked },
                          { name: 'Brute Force', value: mockThreatAnalytics.last24Hours.bruteForce },
                          { name: 'SQL Injection', value: mockThreatAnalytics.last24Hours.sqlInjection }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/30 border border-red-700">
              <Ban className="w-5 h-5 text-red-400" />
              <span>Block IPs</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700">
              <Eye className="w-5 h-5 text-blue-400" />
              <span>View Logs</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-green-900/20 hover:bg-green-900/30 border border-green-700">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Run Scan</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center gap-2 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Configure</span>
            </Button>
          </div>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats">
          <div className="space-y-6">
            {/* Top Attacker IPs */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-red-400" />
                  Top Attacker IPs
                </CardTitle>
                <CardDescription>
                  Most active attacking IP addresses in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockThreatAnalytics.topAttackerIPs.map((attacker, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm">{attacker.ip}</div>
                          <div className="text-xs text-gray-400">{attacker.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-semibold text-red-400">{attacker.attempts}</div>
                          <div className="text-xs text-gray-400">attempts</div>
                        </div>
                        <Badge className={attacker.status === 'blocked' ? 'bg-red-600' : 'bg-yellow-600'}>
                          {attacker.status}
                        </Badge>
                        {attacker.status !== 'blocked' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => blockIP(attacker.ip)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Block
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Threat Trends */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Threat Activity Trends</CardTitle>
                <CardDescription>7-day threat detection and blocking trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockThreatTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="threats"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name="Total Threats"
                      />
                      <Area
                        type="monotone"
                        dataKey="blocked"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Blocked"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            {/* System Components */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  System Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockSystemHealth.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(component.status)}`} />
                        <div>
                          <h4 className="font-semibold">{component.name}</h4>
                          <p className="text-sm text-gray-400">
                            Uptime: {component.uptime}% | Response: {component.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <Badge className={component.status === 'healthy' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {component.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-blue-400">{mockSystemHealth.resources.cpu.usage}%</div>
                  </div>
                  <Progress value={mockSystemHealth.resources.cpu.usage} className="h-2" />
                  <p className="text-xs text-gray-400 mt-2">Limit: {mockSystemHealth.resources.cpu.limit}%</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MemoryStick className="w-4 h-4" />
                    Memory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-green-400">{mockSystemHealth.resources.memory.usage}%</div>
                  </div>
                  <Progress value={mockSystemHealth.resources.memory.usage} className="h-2" />
                  <p className="text-xs text-gray-400 mt-2">Limit: {mockSystemHealth.resources.memory.limit}%</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Disk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-amber-400">{mockSystemHealth.resources.disk.usage}%</div>
                  </div>
                  <Progress value={mockSystemHealth.resources.disk.usage} className="h-2" />
                  <p className="text-xs text-gray-400 mt-2">Limit: {mockSystemHealth.resources.disk.limit}%</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-purple-400">{mockSystemHealth.resources.network.usage}%</div>
                  </div>
                  <Progress value={mockSystemHealth.resources.network.usage} className="h-2" />
                  <p className="text-xs text-gray-400 mt-2">Limit: {mockSystemHealth.resources.network.limit}%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security events and automated responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockSecurityEvents.map((event) => (
                    <div key={event.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-sm text-gray-400">{getTimeAgo(event.timestamp)}</span>
                        </div>
                        <Badge className={event.status === 'resolved' ? 'bg-green-600' : 'bg-yellow-600'}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-300">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-1">IP: {event.ip}</p>
                      </div>
                      
                      <div className="text-xs text-blue-400">
                        Action taken: {event.action}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="text-center py-12 text-gray-400">
            📊 Advanced security analytics will be integrated here
            <br />
            <small>Detailed threat patterns, vulnerability assessments, and security trends</small>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <div className="text-center py-12 text-gray-400">
            🔒 Security policies and configuration will be integrated here
            <br />
            <small>Rate limiting, firewall rules, access controls, and security settings</small>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


