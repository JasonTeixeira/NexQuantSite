"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  FunnelChart,
  Funnel
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  XCircle,
  Target,
  User,
  Shield,
  Settings,
  Star,
  AlertTriangle,
  Eye,
  Edit,
  Filter,
  Download,
  RefreshCw,
  Rocket,
  BarChart3,
  Zap,
  Calendar
} from "lucide-react"

// Mock data for onboarding analytics
const mockOnboardingStats = {
  totalUsers: 12456,
  completedOnboarding: 9234,
  inProgress: 1892,
  abandoned: 1330,
  completionRate: 74.1,
  averageCompletionTime: 8.5, // minutes
  dropoffRate: 10.7,
  conversionToActivation: 68.3
}

const mockStepStats = [
  { step: 'Welcome', started: 12456, completed: 12234, completionRate: 98.2, avgTime: 0.8 },
  { step: 'Profile', started: 12234, completed: 11567, completionRate: 94.5, avgTime: 2.1 },
  { step: 'Verification', started: 11567, completed: 10234, completionRate: 88.5, avgTime: 3.2 },
  { step: 'Experience', started: 10234, completed: 9845, completionRate: 96.2, avgTime: 1.9 },
  { step: 'Preferences', started: 9845, completed: 9456, completionRate: 96.0, avgTime: 1.7 },
  { step: 'Features', started: 9456, completed: 9234, completionRate: 97.7, avgTime: 1.2 },
  { step: 'Complete', started: 9234, completed: 9234, completionRate: 100.0, avgTime: 0.5 }
]

const mockRecentUsers = [
  {
    id: 'user001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: '/placeholder-avatar1.jpg',
    status: 'completed',
    currentStep: 'Complete',
    completionTime: 6.2,
    signupDate: '2024-01-15T10:30:00Z',
    experienceLevel: 'beginner',
    tradingGoals: ['passive-income', 'learn-trading'],
    preferredMarkets: ['stocks', 'crypto']
  },
  {
    id: 'user002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: '/placeholder-avatar2.jpg',
    status: 'in-progress',
    currentStep: 'Verification',
    completionTime: null,
    signupDate: '2024-01-15T09:15:00Z',
    experienceLevel: 'intermediate',
    tradingGoals: ['wealth-building'],
    preferredMarkets: ['forex']
  },
  {
    id: 'user003',
    name: 'Carol Williams',
    email: 'carol@example.com',
    avatar: '/placeholder-avatar3.jpg',
    status: 'abandoned',
    currentStep: 'Profile',
    completionTime: null,
    signupDate: '2024-01-14T16:45:00Z',
    experienceLevel: 'beginner',
    tradingGoals: [],
    preferredMarkets: []
  }
]

const mockTrendsData = [
  { date: '2024-01-08', completions: 145, dropoffs: 23, newSignups: 189 },
  { date: '2024-01-09', completions: 167, dropoffs: 19, newSignups: 201 },
  { date: '2024-01-10', completions: 134, dropoffs: 31, newSignups: 178 },
  { date: '2024-01-11', completions: 189, dropoffs: 15, newSignups: 223 },
  { date: '2024-01-12', completions: 201, dropoffs: 27, newSignups: 245 },
  { date: '2024-01-13', completions: 178, dropoffs: 22, newSignups: 212 },
  { date: '2024-01-14', completions: 156, dropoffs: 34, newSignups: 198 },
  { date: '2024-01-15', completions: 167, dropoffs: 18, newSignups: 201 }
]

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8']

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

const getTimeAgo = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${minutes}m ago`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'in-progress': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'abandoned': return 'text-red-400 bg-red-900/20 border-red-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

export default function UserOnboardingAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_7_days')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            User Onboarding Management
          </h1>
          <p className="text-gray-400">
            Monitor onboarding flows, completion rates, and user experience
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-xl font-bold text-blue-400">{formatNumber(mockOnboardingStats.totalUsers)}</p>
              </div>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-xl font-bold text-green-400">{formatNumber(mockOnboardingStats.completedOnboarding)}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">In Progress</p>
                <p className="text-xl font-bold text-amber-400">{formatNumber(mockOnboardingStats.inProgress)}</p>
              </div>
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Abandoned</p>
                <p className="text-xl font-bold text-red-400">{formatNumber(mockOnboardingStats.abandoned)}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completion Rate</p>
                <p className="text-xl font-bold text-cyan-400">{formatPercentage(mockOnboardingStats.completionRate)}</p>
              </div>
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Time</p>
                <p className="text-xl font-bold text-purple-400">{mockOnboardingStats.averageCompletionTime}m</p>
              </div>
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="users">User Progress</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step Completion Rates */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Step Completion Rates</CardTitle>
                <CardDescription>Performance of each onboarding step</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStepStats.map((step, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{step.step}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {formatNumber(step.completed)}/{formatNumber(step.started)}
                          </span>
                          <Badge variant={step.completionRate > 90 ? 'default' : step.completionRate > 80 ? 'secondary' : 'destructive'}>
                            {formatPercentage(step.completionRate)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={step.completionRate} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Avg time: {step.avgTime}m</span>
                        <span>Drop rate: {formatPercentage(100 - step.completionRate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completion Status Distribution */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Onboarding Status Distribution</CardTitle>
                <CardDescription>Current status of all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: mockOnboardingStats.completedOnboarding, color: '#10B981' },
                          { name: 'In Progress', value: mockOnboardingStats.inProgress, color: '#F59E0B' },
                          { name: 'Abandoned', value: mockOnboardingStats.abandoned, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Completed', value: mockOnboardingStats.completedOnboarding, color: '#10B981' },
                          { name: 'In Progress', value: mockOnboardingStats.inProgress, color: '#F59E0B' },
                          { name: 'Abandoned', value: mockOnboardingStats.abandoned, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-sm text-gray-400">Conversion Rate</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatPercentage(mockOnboardingStats.conversionToActivation)}
                    </div>
                    <div className="text-xs text-green-400">+5.2% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-400">Avg Completion Time</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {mockOnboardingStats.averageCompletionTime}m
                    </div>
                    <div className="text-xs text-blue-400">-1.2m vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatPercentage(mockOnboardingStats.completionRate)}
                    </div>
                    <div className="text-xs text-purple-400">+2.8% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <div>
                    <div className="text-sm text-gray-400">Drop-off Rate</div>
                    <div className="text-2xl font-bold text-amber-400">
                      {formatPercentage(mockOnboardingStats.dropoffRate)}
                    </div>
                    <div className="text-xs text-amber-400">-1.5% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnel">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Onboarding Funnel Analysis</CardTitle>
              <CardDescription>User progression through onboarding steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStepStats} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="step" type="category" stroke="#9CA3AF" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [
                        name === 'started' ? `${formatNumber(typeof value === 'number' ? value : parseFloat(value as string) || 0)} started` : `${formatNumber(typeof value === 'number' ? value : parseFloat(value as string) || 0)} completed`,
                        ''
                      ]}
                    />
                    <Bar dataKey="started" fill="#6B7280" name="started" />
                    <Bar dataKey="completed" fill="#10B981" name="completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Progress Tab */}
        <TabsContent value="users">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search users..."
                className="max-w-xs bg-gray-900 border-gray-700"
              />
            </div>

            {/* User List */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Onboarding Activity</CardTitle>
                <CardDescription>Latest user progress through onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {mockRecentUsers
                      .filter(user => selectedFilter === 'all' || user.status === selectedFilter)
                      .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Current: {user.currentStep}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{user.experienceLevel}</div>
                            <div className="text-gray-400">Experience</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{user.tradingGoals.length}</div>
                            <div className="text-gray-400">Goals</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">
                              {user.completionTime ? `${user.completionTime}m` : '-'}
                            </div>
                            <div className="text-gray-400">Time</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{getTimeAgo(user.signupDate)}</div>
                            <div className="text-gray-400">Signed up</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Onboarding Trends</CardTitle>
              <CardDescription>Daily onboarding metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Completions"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newSignups" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="New Signups"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dropoffs" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Drop-offs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="space-y-6">
            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-green-900/20 border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="w-8 h-8 text-green-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-400 mb-2">Positive Trend</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Completion rate increased by 5.2% this week, primarily due to improved verification step
                      </p>
                      <Badge className="bg-green-600">+5.2% improvement</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-900/20 border-amber-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-amber-400 mb-2">Attention Needed</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        Verification step has highest drop-off rate (11.5%). Consider simplifying this step
                      </p>
                      <Badge className="bg-amber-600">11.5% drop-off</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
                <CardDescription>Data-driven suggestions to improve onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-1">Optimize Verification Step</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          The verification step has the highest abandonment rate. Consider:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Adding progress indicators within the step</li>
                          <li>• Providing clearer instructions</li>
                          <li>• Offering alternative verification methods</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-1">A/B Test Welcome Screen</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          Test different welcome messages to improve initial engagement:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Personalized welcome based on signup source</li>
                          <li>• Video introduction vs. text-based</li>
                          <li>• Different value propositions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-900/20 border border-cyan-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-cyan-400 mb-1">Gamify Experience</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          Add gamification elements to increase engagement:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Progress badges for completed steps</li>
                          <li>• Completion rewards (demo credits, free trials)</li>
                          <li>• Leaderboard for fastest completions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="text-center py-12 text-gray-400">
            ⚙️ Onboarding flow configuration will be integrated here
            <br />
            <small>Step customization, A/B testing setup, and flow optimization tools</small>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
