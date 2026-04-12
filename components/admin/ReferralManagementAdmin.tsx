"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Crown,
  Star,
  Award,
  BarChart3,
  Target,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Calendar,
  Percent,
  Activity,
  CreditCard,
  Link as LinkIcon,
  Share2,
  Globe,
  Smartphone,
  QrCode,
  Ban,
  UserX,
  Zap,
  Trophy,
  Flame,
  Shield,
  Bell,
  FileText,
  PieChart,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from "lucide-react"

// Mock referral data for admin
const mockReferralStats = {
  overview: {
    totalAffiliates: 5247,
    activeAffiliates: 3891,
    totalReferrals: 89234,
    totalCommissionsPaid: 2150670.50,
    pendingPayouts: 45890.25,
    monthlyGrowth: 23.5,
    conversionRate: 24.8,
    averageCommission: 67.30
  },
  topAffiliates: [
    {
      id: "1",
      name: "Sarah Martinez",
      username: "crypto_sarah",
      email: "sarah@example.com",
      tier: "Diamond",
      status: "active",
      totalReferrals: 234,
      totalEarnings: 89560.75,
      monthlyEarnings: 12450.30,
      conversionRate: 34.2,
      joinDate: "2023-01-15",
      lastActive: "2024-01-15T10:30:00Z",
      pendingPayout: 2450.75,
      isVerified: true
    },
    {
      id: "2", 
      name: "David Kim",
      username: "trading_david",
      email: "david@example.com",
      tier: "Platinum",
      status: "active",
      totalReferrals: 187,
      totalEarnings: 67890.30,
      monthlyEarnings: 8920.45,
      conversionRate: 28.7,
      joinDate: "2023-02-20",
      lastActive: "2024-01-14T15:20:00Z",
      pendingPayout: 1890.45,
      isVerified: true
    },
    {
      id: "3",
      name: "Emma Rodriguez", 
      username: "fintech_emma",
      email: "emma@example.com",
      tier: "Gold",
      status: "warning",
      totalReferrals: 156,
      totalEarnings: 52340.60,
      monthlyEarnings: 5670.80,
      conversionRate: 19.4,
      joinDate: "2023-03-10",
      lastActive: "2024-01-10T09:45:00Z",
      pendingPayout: 890.60,
      isVerified: false
    }
  ],
  recentActivity: [
    {
      id: "1",
      type: "new_affiliate",
      message: "New affiliate registered: @trading_mike",
      timestamp: "2024-01-15T12:30:00Z",
      priority: "normal"
    },
    {
      id: "2", 
      type: "payout_request",
      message: "Payout requested by @crypto_sarah for $2,450.75",
      timestamp: "2024-01-15T11:45:00Z",
      priority: "high"
    },
    {
      id: "3",
      type: "tier_upgrade",
      message: "@trading_david upgraded to Platinum tier",
      timestamp: "2024-01-15T10:20:00Z", 
      priority: "normal"
    },
    {
      id: "4",
      type: "fraud_alert",
      message: "Suspicious activity detected for @spam_user",
      timestamp: "2024-01-15T09:15:00Z",
      priority: "critical"
    }
  ],
  monthlyStats: [
    { month: "Jan", affiliates: 5247, referrals: 1234, commissions: 89560 },
    { month: "Dec", affiliates: 4891, referrals: 1098, commissions: 76340 },
    { month: "Nov", affiliates: 4567, referrals: 1456, commissions: 98230 },
    { month: "Oct", affiliates: 4234, referrals: 1123, commissions: 72450 },
    { month: "Sep", affiliates: 3998, referrals: 1345, commissions: 85670 },
    { month: "Aug", affiliates: 3756, referrals: 989, commissions: 67890 }
  ]
}

const tierConfig = {
  bronze: { minReferrals: 0, commission: 25, color: "text-amber-600", bgColor: "bg-amber-600" },
  silver: { minReferrals: 10, commission: 30, color: "text-gray-300", bgColor: "bg-gray-600" },
  gold: { minReferrals: 25, commission: 35, color: "text-amber-400", bgColor: "bg-amber-600" },
  platinum: { minReferrals: 50, commission: 40, color: "text-purple-400", bgColor: "bg-purple-600" },
  diamond: { minReferrals: 100, commission: 50, color: "text-cyan-400", bgColor: "bg-cyan-600" }
}

export default function ReferralManagementAdmin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTier, setFilterTier] = useState('all')

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      active: 'bg-green-600',
      warning: 'bg-amber-600',
      suspended: 'bg-red-600',
      inactive: 'bg-gray-600'
    }
    return <Badge className={configs[status as keyof typeof configs]}>{status}</Badge>
  }

  const getTierBadge = (tier: string) => {
    const config = tierConfig[tier.toLowerCase() as keyof typeof tierConfig]
    return <Badge className={config?.bgColor}>{tier}</Badge>
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'high': return <ArrowUp className="w-4 h-4 text-amber-400" />
      case 'normal': return <Activity className="w-4 h-4 text-blue-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Referral Management</h1>
          <p className="text-gray-400">Manage affiliate program, track performance, and oversee payouts</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {mockReferralStats.overview.totalAffiliates.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Affiliates</div>
                <div className="text-xs text-blue-400 mt-1">
                  {mockReferralStats.overview.activeAffiliates.toLocaleString()} active
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {mockReferralStats.overview.totalReferrals.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Referrals</div>
                <div className="text-xs text-purple-400 mt-1">
                  {mockReferralStats.overview.conversionRate}% conversion rate
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  ${(mockReferralStats.overview.totalCommissionsPaid / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-400">Commissions Paid</div>
                <div className="text-xs text-green-400 mt-1">
                  +{mockReferralStats.overview.monthlyGrowth}% this month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  ${(mockReferralStats.overview.pendingPayouts / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-400">Pending Payouts</div>
                <div className="text-xs text-amber-400 mt-1">
                  Awaiting processing
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReferralStats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                      {getPriorityIcon(activity.priority)}
                      <div className="flex-1">
                        <div className="text-sm text-white mb-1">{activity.message}</div>
                        <div className="text-xs text-gray-400">{formatTime(activity.timestamp)}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReferralStats.topAffiliates.slice(0, 3).map((affiliate, index) => (
                    <div key={affiliate.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-black font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-cyan-600">
                          {affiliate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{affiliate.name}</div>
                        <div className="text-sm text-gray-400">{affiliate.totalReferrals} referrals</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-400">
                          ${affiliate.totalEarnings.toLocaleString()}
                        </div>
                        {getTierBadge(affiliate.tier)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-4 p-4">
                {mockReferralStats.monthlyStats.map((stat, index) => (
                  <div key={stat.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-cyan-600 to-blue-600 rounded-t-lg mb-2"
                      style={{ height: `${(stat.commissions / 100000) * 100}%` }}
                    />
                    <div className="text-xs text-gray-400">{stat.month}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Affiliate Management</CardTitle>
              <CardDescription>Manage all affiliate accounts and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search affiliates by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <Crown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affiliates List */}
              <div className="space-y-4">
                {mockReferralStats.topAffiliates.map((affiliate) => (
                  <div key={affiliate.id} className="flex items-center justify-between p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-cyan-600 text-lg">
                          {affiliate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white text-lg">{affiliate.name}</h3>
                          {affiliate.isVerified && (
                            <CheckCircle className="w-5 h-5 text-cyan-400" />
                          )}
                          {getStatusBadge(affiliate.status)}
                          {getTierBadge(affiliate.tier)}
                        </div>
                        <div className="text-gray-400">@{affiliate.username} • {affiliate.email}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Joined {new Date(affiliate.joinDate).toLocaleDateString()} • 
                          Last active {formatTime(affiliate.lastActive)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-6 text-center mb-4">
                        <div>
                          <div className="text-lg font-bold text-blue-400">{affiliate.totalReferrals}</div>
                          <div className="text-xs text-gray-400">Referrals</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            ${affiliate.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Total Earnings</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-400">{affiliate.conversionRate}%</div>
                          <div className="text-xs text-gray-400">Conversion</div>
                        </div>
                      </div>
                      
                      {affiliate.pendingPayout > 0 && (
                        <div className="text-sm text-amber-400 mb-2">
                          ${affiliate.pendingPayout} pending payout
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payout Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  Payout Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    ${mockReferralStats.overview.pendingPayouts.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Pending Payouts</div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-semibold">$89,560</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="text-green-400 font-semibold">
                    ${(mockReferralStats.overview.totalCommissionsPaid / 1000000).toFixed(1)}M
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Payout</span>
                  <span className="text-blue-400 font-semibold">
                    ${mockReferralStats.overview.averageCommission.toFixed(2)}
                  </span>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Process All Payouts
                </Button>
              </CardContent>
            </Card>

            {/* Pending Payouts */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Pending Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReferralStats.topAffiliates
                      .filter(a => a.pendingPayout > 0)
                      .map((affiliate) => (
                        <div key={affiliate.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-cyan-600">
                                {affiliate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-white">{affiliate.name}</div>
                              <div className="text-sm text-gray-400">@{affiliate.username}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-amber-400">
                                ${affiliate.pendingPayout.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-400">
                                {affiliate.tier} tier
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Percent className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{mockReferralStats.overview.conversionRate}%</div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">+{mockReferralStats.overview.monthlyGrowth}%</div>
                <div className="text-sm text-gray-400">Monthly Growth</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">${mockReferralStats.overview.averageCommission.toFixed(0)}</div>
                <div className="text-sm text-gray-400">Avg Commission</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Activity className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{Math.round((mockReferralStats.overview.activeAffiliates / mockReferralStats.overview.totalAffiliates) * 100)}%</div>
                <div className="text-sm text-gray-400">Active Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
                <p className="text-gray-400">Detailed performance charts and insights will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Manage referral campaigns and promotional materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Campaign Management</h3>
                <p className="text-gray-400">Create and manage referral campaigns here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure referral program parameters and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Commission Structure</h4>
                  <div className="space-y-4">
                    {Object.entries(tierConfig).map(([tier, config]) => (
                      <div key={tier} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Crown className={`w-5 h-5 ${config.color}`} />
                          <span className="capitalize text-white">{tier}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{config.minReferrals}+ referrals</div>
                          <div className="font-semibold text-white">{config.commission}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Program Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto-approve affiliates</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Enable tier upgrades</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Instant payouts</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Email notifications</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}