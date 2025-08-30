"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  Cell
} from 'recharts'
import { 
  Gift, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Share2, 
  Copy, 
  Plus, 
  Eye,
  Download,
  Settings,
  Star,
  Award,
  Target,
  Zap,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  CreditCard,
  Link,
  QrCode,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react"
import { ReferralManager, REFERRAL_TIERS, mockReferralActivities } from "@/lib/referrals/referral-utils"

// Mock user referral data
const mockUserReferralData = {
  userId: 'user_001',
  personalCode: 'ALEX2024',
  stats: ReferralManager.generateUserStats('user_001', mockReferralActivities),
  codes: [
    {
      id: 'code_001',
      code: 'ALEX2024',
      type: 'personal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      currentUsage: 15,
      description: 'My main referral code'
    },
    {
      id: 'code_002',
      code: 'HOLIDAY50',
      type: 'campaign',
      isActive: true,
      createdAt: '2024-12-01T00:00:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      usageLimit: 100,
      currentUsage: 23,
      description: 'Holiday special campaign'
    }
  ],
  recentReferrals: [
    {
      id: 'ref_001',
      referredUser: { name: 'John Smith', email: 'john@example.com', avatar: '/avatar1.jpg' },
      status: 'completed',
      conversionType: 'subscription',
      commission: 25.00,
      date: '2024-01-15T10:30:00Z'
    },
    {
      id: 'ref_002',
      referredUser: { name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '/avatar2.jpg' },
      status: 'pending',
      conversionType: 'signup',
      commission: 5.00,
      date: '2024-01-14T16:15:00Z'
    },
    {
      id: 'ref_003',
      referredUser: { name: 'Mike Wilson', email: 'mike@example.com', avatar: '/avatar3.jpg' },
      status: 'completed',
      conversionType: 'activation',
      commission: 7.50,
      date: '2024-01-13T09:45:00Z'
    }
  ],
  earningsHistory: [
    { date: '2024-01-08', earnings: 45.50, referrals: 3 },
    { date: '2024-01-09', earnings: 67.25, referrals: 5 },
    { date: '2024-01-10', earnings: 23.75, referrals: 2 },
    { date: '2024-01-11', earnings: 89.00, referrals: 7 },
    { date: '2024-01-12', earnings: 156.50, referrals: 12 },
    { date: '2024-01-13', earnings: 78.25, referrals: 6 },
    { date: '2024-01-14', earnings: 92.75, referrals: 8 },
    { date: '2024-01-15', earnings: 134.25, referrals: 10 }
  ]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTierColor = (tierId: string) => {
  const tier = REFERRAL_TIERS.find(t => t.id === tierId)
  return tier?.color || '#6B7280'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'pending': return 'text-amber-400 bg-amber-900/20 border-amber-700'
    case 'cancelled': return 'text-red-400 bg-red-900/20 border-red-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

export default function UserReferralDashboard() {
  const [selectedCode, setSelectedCode] = useState(mockUserReferralData.codes[0])
  const [showCreateCode, setShowCreateCode] = useState(false)
  const [shareMethod, setShareMethod] = useState('link')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)

  const currentTier = REFERRAL_TIERS.find(t => t.id === mockUserReferralData.stats.currentTier)
  const nextTier = REFERRAL_TIERS[REFERRAL_TIERS.findIndex(t => t.id === currentTier?.id) + 1]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show success message
  }

  const shareReferralLink = (method: string) => {
    const baseUrl = window.location.origin
    const referralUrl = `${baseUrl}/register?ref=${selectedCode.code}`
    
    const shareText = `Join me on Nexural Trading and start your automated trading journey! Use my referral code: ${selectedCode.code}`
    
    switch (method) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}&quote=${encodeURIComponent(shareText)}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralUrl)}`)
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`)
        break
      case 'email':
        window.open(`mailto:?subject=Join me on Nexural Trading&body=${encodeURIComponent(shareText + '\n\n' + referralUrl)}`)
        break
      default:
        copyToClipboard(referralUrl)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Referral Dashboard</h1>
            <p className="text-gray-400">Track your referrals and earn commissions</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowPayoutDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
            <Button onClick={() => setShowCreateCode(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Code
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(mockUserReferralData.stats.totalCommissions)}
                  </p>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +12.5% this month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {mockUserReferralData.stats.totalReferrals}
                  </p>
                  <p className="text-xs text-blue-400 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +{mockUserReferralData.stats.monthlyStats.referrals} this month
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {mockUserReferralData.stats.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-purple-400 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +2.3% vs last month
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Payout</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {formatCurrency(mockUserReferralData.stats.pendingCommissions)}
                  </p>
                  <p className="text-xs text-amber-400 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Ready for withdrawal
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card className="mb-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getTierColor(currentTier?.id || 'bronze') + '20', border: `2px solid ${getTierColor(currentTier?.id || 'bronze')}` }}
                >
                  <Award className="w-6 h-6" style={{ color: getTierColor(currentTier?.id || 'bronze') }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: getTierColor(currentTier?.id || 'bronze') }}>
                    {currentTier?.name} Tier
                  </h3>
                  <p className="text-gray-400">{currentTier?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{currentTier?.commissionRate}%</p>
                <p className="text-sm text-gray-400">Commission Rate</p>
              </div>
            </div>

            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Progress to {nextTier.name} ({nextTier.minReferrals} referrals needed)
                  </span>
                  <span className="text-sm font-semibold">
                    {mockUserReferralData.stats.totalReferrals}/{nextTier.minReferrals}
                  </span>
                </div>
                <Progress 
                  value={mockUserReferralData.stats.nextTierProgress} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{mockUserReferralData.stats.nextTierProgress.toFixed(1)}% complete</span>
                  <span>{nextTier.minReferrals - mockUserReferralData.stats.totalReferrals} more needed</span>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold mb-2">Current Tier Benefits:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentTier?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="codes">Referral Codes</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="share">Share & Promote</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Chart */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Earnings Trend</CardTitle>
                  <CardDescription>Your referral earnings over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockUserReferralData.earningsHistory}>
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
                          formatter={(value, name) => [
                            name === 'earnings' ? formatCurrency(value as number) : value,
                            name === 'earnings' ? 'Earnings' : 'Referrals'
                          ]}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Codes */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Top Performing Codes</CardTitle>
                  <CardDescription>Your best referral codes by earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUserReferralData.stats.topPerformingCodes.map((codeData, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-amber-600' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                          }`}>
                            <span className="text-white font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-cyan-400">{codeData.code}</div>
                            <div className="text-xs text-gray-400">
                              {codeData.conversions} conversions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {formatCurrency(codeData.commission)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Referral Activity</CardTitle>
                  <CardDescription>Latest referrals and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUserReferralData.recentReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={referral.referredUser.avatar} alt={referral.referredUser.name} />
                            <AvatarFallback>{referral.referredUser.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{referral.referredUser.name}</div>
                            <div className="text-sm text-gray-400">{referral.referredUser.email}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(referral.status)}>
                                {referral.status}
                              </Badge>
                              <span className="text-xs text-gray-500">{referral.conversionType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {formatCurrency(referral.commission)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(referral.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Referral Codes Tab */}
          <TabsContent value="codes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Code Management */}
              <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Your Referral Codes</CardTitle>
                  <CardDescription>Manage and track your referral codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUserReferralData.codes.map((code) => (
                      <div key={code.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-cyan-400">{code.code}</div>
                            <Badge variant={code.isActive ? 'default' : 'secondary'}>
                              {code.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{code.type}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(code.code)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-3">{code.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Uses</div>
                            <div className="font-semibold">
                              {code.currentUsage}
                              {code.usageLimit && `/${code.usageLimit}`}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Created</div>
                            <div className="font-semibold">
                              {new Date(code.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {code.expiresAt && (
                            <div>
                              <div className="text-gray-400">Expires</div>
                              <div className="font-semibold">
                                {new Date(code.expiresAt).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-gray-400">Status</div>
                            <div className={`font-semibold ${code.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                              {code.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                        
                        {code.usageLimit && (
                          <div className="mt-3">
                            <Progress 
                              value={(code.currentUsage / code.usageLimit) * 100} 
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{((code.currentUsage / code.usageLimit) * 100).toFixed(1)}% used</span>
                              <span>{code.usageLimit - code.currentUsage} remaining</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Share */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Quick Share</CardTitle>
                  <CardDescription>Share your referral code instantly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-select">Select Code</Label>
                    <Select 
                      value={selectedCode.id} 
                      onValueChange={(value) => {
                        const code = mockUserReferralData.codes.find(c => c.id === value)
                        if (code) setSelectedCode(code)
                      }}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {mockUserReferralData.codes.map((code) => (
                          <SelectItem key={code.id} value={code.id}>
                            {code.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Referral Link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}/register?ref=${selectedCode.code}`}
                        readOnly
                        className="bg-gray-800 border-gray-700"
                      />
                      <Button size="sm" onClick={() => copyToClipboard(`${window.location.origin}/register?ref=${selectedCode.code}`)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Share Via</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareReferralLink('facebook')}
                        className="flex items-center gap-2"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareReferralLink('twitter')}
                        className="flex items-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareReferralLink('linkedin')}
                        className="flex items-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareReferralLink('email')}
                        className="flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs would be implemented here */}
          <TabsContent value="referrals">
            <div className="text-center py-12 text-gray-400">
              👥 Detailed referral list will be implemented here
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="text-center py-12 text-gray-400">
              💰 Detailed earnings analytics will be implemented here
            </div>
          </TabsContent>

          <TabsContent value="share">
            <div className="text-center py-12 text-gray-400">
              📢 Marketing materials and sharing tools will be implemented here
            </div>
          </TabsContent>
        </Tabs>

        {/* Payout Request Dialog */}
        <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Request a payout of your pending commissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Available for payout:</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(mockUserReferralData.stats.pendingCommissions)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payout-amount">Payout Amount</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="credit">Platform Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowPayoutDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Request Payout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


