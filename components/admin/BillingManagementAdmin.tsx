"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  FunnelChart,
  Funnel
} from 'recharts'
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  FileText,
  Package,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Wallet,
  Receipt,
  Settings,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  Ban,
  Repeat,
  ExternalLink
} from "lucide-react"
import { 
  BillingManager, 
  SUBSCRIPTION_PLANS, 
  BILLING_CONFIG,
  mockSubscriptions,
  mockInvoices,
  mockPaymentMethods
} from "@/lib/billing/billing-utils"

// Mock billing analytics data
const mockBillingAnalytics = {
  mrr: 45750, // $457.50
  arr: 549000, // $5,490
  totalCustomers: 1247,
  newCustomers: 89,
  churnedCustomers: 23,
  totalRevenue: 89750,
  activeSubscriptions: 1156,
  trialSubscriptions: 91,
  pastDueSubscriptions: 12,
  churnRate: 2.3,
  ltv: 2850,
  conversionRate: 73.4,
  averageRevenuePerUser: 37.52
}

const mockRevenueData = [
  { date: '2024-01-08', mrr: 42300, newRevenue: 3200, churnedRevenue: 850, netRevenue: 2350 },
  { date: '2024-01-09', mrr: 43150, newRevenue: 4100, churnedRevenue: 600, netRevenue: 3500 },
  { date: '2024-01-10', mrr: 43950, newRevenue: 2800, churnedRevenue: 1200, netRevenue: 1600 },
  { date: '2024-01-11', mrr: 44650, newRevenue: 3900, churnedRevenue: 700, netRevenue: 3200 },
  { date: '2024-01-12', mrr: 45350, newRevenue: 4500, churnedRevenue: 950, netRevenue: 3550 },
  { date: '2024-01-13', mrr: 45850, newRevenue: 3200, churnedRevenue: 500, netRevenue: 2700 },
  { date: '2024-01-14', mrr: 46200, newRevenue: 2900, churnedRevenue: 650, netRevenue: 2250 },
  { date: '2024-01-15', mrr: 45750, newRevenue: 3100, churnedRevenue: 1450, netRevenue: 1650 }
]

const mockSubscriptionData = [
  { date: '2024-01-08', active: 1134, trial: 95, churned: 18, new: 42 },
  { date: '2024-01-09', active: 1149, trial: 89, churned: 15, new: 38 },
  { date: '2024-01-10', active: 1152, trial: 92, churned: 22, new: 35 },
  { date: '2024-01-11', active: 1167, trial: 87, churned: 19, new: 47 },
  { date: '2024-01-12', active: 1178, trial: 94, churned: 16, new: 43 },
  { date: '2024-01-13', active: 1171, trial: 91, churned: 25, new: 41 },
  { date: '2024-01-14', active: 1163, trial: 88, churned: 28, new: 39 },
  { date: '2024-01-15', active: 1156, trial: 91, churned: 23, new: 36 }
]

const mockPlanDistribution = [
  { plan: 'Free', customers: 347, revenue: 0, color: '#6B7280' },
  { plan: 'Pro', customers: 789, revenue: 78990, color: '#10B981' },
  { plan: 'Enterprise', customers: 111, revenue: 110889, color: '#3B82F6' }
]

const mockRecentSubscriptions = [
  {
    id: 'sub_001',
    customer: { name: 'Alice Johnson', email: 'alice@example.com', avatar: '/avatar1.jpg' },
    plan: 'Pro',
    status: 'active',
    billing: 'monthly',
    amount: 99,
    created: '2024-01-15T10:30:00Z',
    nextBilling: '2024-02-15T10:30:00Z'
  },
  {
    id: 'sub_002',
    customer: { name: 'Bob Smith', email: 'bob@example.com', avatar: '/avatar2.jpg' },
    plan: 'Enterprise',
    status: 'trial',
    billing: 'yearly',
    amount: 999,
    created: '2024-01-14T16:20:00Z',
    nextBilling: '2024-01-28T16:20:00Z'
  },
  {
    id: 'sub_003',
    customer: { name: 'Carol Williams', email: 'carol@example.com', avatar: '/avatar3.jpg' },
    plan: 'Pro',
    status: 'past_due',
    billing: 'monthly',
    amount: 99,
    created: '2024-01-13T09:45:00Z',
    nextBilling: '2024-01-13T09:45:00Z'
  }
]

const mockRecentInvoices = [
  {
    id: 'inv_001',
    number: 'INV-202401-001',
    customer: { name: 'Alice Johnson', email: 'alice@example.com' },
    amount: 107.92,
    status: 'paid',
    dueDate: '2024-02-14T00:00:00Z',
    paidAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'inv_002',
    number: 'INV-202401-002',
    customer: { name: 'Bob Smith', email: 'bob@example.com' },
    amount: 1078.92,
    status: 'open',
    dueDate: '2024-01-28T00:00:00Z'
  },
  {
    id: 'inv_003',
    number: 'INV-202401-003',
    customer: { name: 'Carol Williams', email: 'carol@example.com' },
    amount: 107.92,
    status: 'overdue',
    dueDate: '2024-01-13T00:00:00Z'
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Assuming amounts are in cents
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'trial': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'past_due': return 'text-amber-400 bg-amber-900/20 border-amber-700'
    case 'cancelled': return 'text-gray-400 bg-gray-900/20 border-gray-700'
    case 'paid': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'open': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'overdue': return 'text-red-400 bg-red-900/20 border-red-700'
    case 'void': return 'text-gray-400 bg-gray-900/20 border-gray-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

const getPlanColor = (plan: string) => {
  switch (plan.toLowerCase()) {
    case 'free': return '#6B7280'
    case 'pro': return '#10B981'
    case 'enterprise': return '#3B82F6'
    default: return '#8B5CF6'
  }
}

export default function BillingManagementAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)

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
            Billing & Revenue Management
          </h1>
          <p className="text-gray-400">
            Monitor subscriptions, revenue, and payment operations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
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
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">MRR</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(mockBillingAnalytics.mrr)}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +8.2% vs last month
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">ARR</p>
                <p className="text-xl font-bold text-blue-400">
                  {formatCurrency(mockBillingAnalytics.arr)}
                </p>
                <p className="text-xs text-blue-400 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12.5% vs last year
                </p>
              </div>
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Customers</p>
                <p className="text-xl font-bold text-purple-400">{mockBillingAnalytics.totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  +{mockBillingAnalytics.newCustomers} this month
                </p>
              </div>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Churn Rate</p>
                <p className="text-xl font-bold text-amber-400">{mockBillingAnalytics.churnRate}%</p>
                <p className="text-xs text-amber-400 flex items-center mt-1">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -0.5% improvement
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">ARPU</p>
                <p className="text-xl font-bold text-cyan-400">
                  {formatCurrency(mockBillingAnalytics.averageRevenuePerUser * 100)}
                </p>
                <p className="text-xs text-cyan-400 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +3.1% vs last month
                </p>
              </div>
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Past Due</p>
                <p className="text-xl font-bold text-red-400">{mockBillingAnalytics.pastDueSubscriptions}</p>
                <p className="text-xs text-red-400 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Billing Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [formatCurrency(value as number), name]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="#10B981" 
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="MRR"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newRevenue" 
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.4}
                        name="New Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Health */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Subscription Health</CardTitle>
                <CardDescription>Active subscriptions and churn tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSubscriptionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                        dataKey="active" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Active"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="trial" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Trial"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="churned" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Churned"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Revenue and customers by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPlanDistribution.map((plan) => (
                    <div key={plan.plan} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: plan.color }}
                          />
                          <span className="font-medium">{plan.plan}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {formatCurrency(plan.revenue)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {plan.customers} customers
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(plan.customers / mockBillingAnalytics.totalCustomers) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest billing events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Payment Received</div>
                      <div className="text-sm text-gray-400">
                        Alice Johnson paid $107.92 for Pro subscription
                      </div>
                      <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">New Subscription</div>
                      <div className="text-sm text-gray-400">
                        Bob Smith started Enterprise trial
                      </div>
                      <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Payment Overdue</div>
                      <div className="text-sm text-gray-400">
                        Carol Williams invoice is 2 days overdue
                      </div>
                      <div className="text-xs text-gray-500 mt-1">2 days ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs bg-gray-900 border-gray-700"
              />
            </div>

            {/* Subscriptions List */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>Manage customer subscriptions and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {mockRecentSubscriptions
                      .filter(sub => selectedFilter === 'all' || sub.status === selectedFilter)
                      .filter(sub => searchQuery === '' || 
                        sub.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sub.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((subscription) => (
                      <div key={subscription.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={subscription.customer.avatar} />
                              <AvatarFallback>{subscription.customer.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{subscription.customer.name}</div>
                              <div className="text-sm text-gray-400">{subscription.customer.email}</div>
                              <div className="text-xs text-gray-500">{subscription.id}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                            <div className="text-sm font-semibold mt-1">
                              {formatCurrency(subscription.amount * 100)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {subscription.billing}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-400">Plan</div>
                            <div className="font-semibold" style={{ color: getPlanColor(subscription.plan) }}>
                              {subscription.plan}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Created</div>
                            <div className="font-semibold text-sm">
                              {formatDate(subscription.created)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Next Billing</div>
                            <div className="font-semibold text-sm">
                              {formatDate(subscription.nextBilling)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Actions</div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Ban className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {subscription.status === 'past_due' && (
                          <div className="p-2 bg-amber-900/20 border border-amber-700 rounded text-sm text-amber-400">
                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                            Payment failed. Next retry scheduled for tomorrow.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Invoice Management</CardTitle>
                <Button onClick={() => setShowInvoiceDetails(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
              <CardDescription>Track and manage all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{invoice.number}</div>
                        <div className="text-sm text-gray-400">{invoice.customer.name}</div>
                        <div className="text-xs text-gray-500">{invoice.customer.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {formatCurrency(invoice.amount * 100)}
                        </div>
                        <div className="text-xs text-gray-400">Amount</div>
                      </div>
                      
                      <div className="text-center">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          Due: {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Subscription Plans</h3>
              <Button onClick={() => setShowCreatePlan(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card key={plan.id} className={`bg-gray-900/50 border-gray-800 ${plan.isPopular ? 'ring-2 ring-cyan-600' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.isPopular && (
                            <Badge className="bg-cyan-600">Popular</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold" style={{ color: getPlanColor(plan.name) }}>
                          {plan.pricing.monthly === 0 ? 'Free' : formatCurrency(plan.pricing.monthly * 100)}
                        </div>
                        <div className="text-sm text-gray-400">per month</div>
                        {plan.pricing.yearly > 0 && (
                          <div className="text-sm text-gray-400">
                            {formatCurrency(plan.pricing.yearly * 100)} yearly 
                            {plan.pricing.yearlyDiscount && (
                              <span className="text-green-400 ml-1">
                                (-{plan.pricing.yearlyDiscount.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold">Features:</div>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span>Active Subscribers</span>
                          <span className="font-bold">
                            {mockPlanDistribution.find(p => p.plan.toLowerCase() === plan.type)?.customers || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Monthly Revenue</span>
                          <span className="font-bold text-green-400">
                            {formatCurrency(mockPlanDistribution.find(p => p.plan.toLowerCase() === plan.type)?.revenue || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [formatCurrency(value as number), name]}
                      />
                      <Bar dataKey="newRevenue" fill="#10B981" name="New Revenue" />
                      <Bar dataKey="churnedRevenue" fill="#EF4444" name="Churned Revenue" />
                      <Bar dataKey="netRevenue" fill="#3B82F6" name="Net Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Key Business Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {formatCurrency(mockBillingAnalytics.ltv * 100)}
                    </div>
                    <div className="text-sm text-gray-400">Customer LTV</div>
                    <div className="text-xs text-green-400">+15% vs last quarter</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {mockBillingAnalytics.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-400">Trial Conversion</div>
                    <div className="text-xs text-blue-400">+5.2% vs last month</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {formatCurrency(250 * 100)}
                    </div>
                    <div className="text-sm text-gray-400">CAC</div>
                    <div className="text-xs text-purple-400">-8% vs last quarter</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">
                      11.4x
                    </div>
                    <div className="text-sm text-gray-400">LTV/CAC Ratio</div>
                    <div className="text-xs text-amber-400">Excellent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="text-center py-12 text-gray-400">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Billing Settings</h3>
            <p>Payment gateways, tax configuration, and billing automation settings will be implemented here</p>
            <Button className="mt-4">
              <Settings className="w-4 h-4 mr-2" />
              Configure Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Subscription Plan</DialogTitle>
            <DialogDescription>
              Define a new subscription plan with pricing and features
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-gray-400">
            📋 Plan creation form will be implemented here
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


