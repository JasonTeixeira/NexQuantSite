"use client"

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Copy,
  Share2,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Gift,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  CheckCircle,
  ExternalLink,
  Calendar,
  Clock,
  BarChart3,
  Target,
  Crown,
  Star,
  Zap,
  Download,
  Eye,
  Activity,
  Percent,
  RefreshCw,
  Plus,
  Send,
  QrCode,
  Smartphone,
  Globe,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  CreditCard,
  Wallet,
  Trophy
} from "lucide-react"
import { toast } from "sonner"

// Mock user referral data
const mockUserData = {
  userId: "current_user",
  referralCode: "TRADER2024",
  personalStats: {
    totalReferrals: 47,
    activeReferrals: 35,
    totalEarnings: 2847.50,
    monthlyEarnings: 485.25,
    pendingPayouts: 185.50,
    conversionRate: 23.8,
    averageCommission: 42.30,
    tier: "Gold",
    nextTier: "Platinum",
    progressToNextTier: 68
  },
  recentReferrals: [
    {
      id: "1",
      name: "Alex Thompson",
      username: "alex_new",
      joinDate: "2024-01-15T10:30:00Z",
      status: "active",
      totalDeposit: 5000,
      commission: 125.00,
      trades: 23,
      isPremium: true
    },
    {
      id: "2", 
      name: "Sarah Johnson",
      username: "sarah_j",
      joinDate: "2024-01-14T14:20:00Z",
      status: "active",
      totalDeposit: 2500,
      commission: 62.50,
      trades: 12,
      isPremium: false
    },
    {
      id: "3",
      name: "Mike Chen",
      username: "mike_c",
      joinDate: "2024-01-13T09:15:00Z",
      status: "pending",
      totalDeposit: 0,
      commission: 0,
      trades: 0,
      isPremium: false
    },
    {
      id: "4",
      name: "Lisa Davis",
      username: "lisa_trader",
      joinDate: "2024-01-12T16:45:00Z",
      status: "active",
      totalDeposit: 7500,
      commission: 187.50,
      trades: 45,
      isPremium: true
    }
  ],
  commissionHistory: [
    {
      id: "1",
      date: "2024-01-15",
      referralName: "Alex Thompson",
      type: "signup_bonus",
      amount: 25.00,
      status: "paid"
    },
    {
      id: "2",
      date: "2024-01-15",
      referralName: "Alex Thompson", 
      type: "trading_commission",
      amount: 100.00,
      status: "paid"
    },
    {
      id: "3",
      date: "2024-01-14",
      referralName: "Sarah Johnson",
      type: "signup_bonus", 
      amount: 25.00,
      status: "paid"
    },
    {
      id: "4",
      date: "2024-01-14",
      referralName: "Sarah Johnson",
      type: "trading_commission",
      amount: 37.50,
      status: "pending"
    }
  ],
  monthlyStats: [
    { month: "Jan", earnings: 485.25, referrals: 12 },
    { month: "Dec", earnings: 342.80, referrals: 8 },
    { month: "Nov", earnings: 567.45, referrals: 15 },
    { month: "Oct", earnings: 423.90, referrals: 11 },
    { month: "Sep", earnings: 678.20, referrals: 18 },
    { month: "Aug", earnings: 349.65, referrals: 9 }
  ]
}

const tierBenefits = {
  bronze: { minReferrals: 0, commission: 25, bonusRate: 1.0 },
  silver: { minReferrals: 10, commission: 30, bonusRate: 1.1 },
  gold: { minReferrals: 25, commission: 35, bonusRate: 1.25 },
  platinum: { minReferrals: 50, commission: 40, bonusRate: 1.5 },
  diamond: { minReferrals: 100, commission: 50, bonusRate: 2.0 }
}

export default function UserReferralDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedLink, setCopiedLink] = useState(false)
  const linkInputRef = useRef<HTMLInputElement>(null)

  const referralLink = `https://nexural.com/ref/${mockUserData.referralCode}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(true)
      toast.success("Referral link copied to clipboard!")
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const shareToSocial = (platform: string) => {
    const message = "Join me on Nexural Trading - the AI-powered trading platform! Get a $50 welcome bonus with my exclusive invite link:"
    const url = referralLink
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${message} ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`
    }
    
    const shareUrl = shareUrls[platform as keyof typeof shareUrls]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-600',
      pending: 'bg-amber-600',
      inactive: 'bg-gray-600'
    }
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'text-amber-600',
      silver: 'text-gray-400', 
      gold: 'text-amber-400',
      platinum: 'text-purple-400',
      diamond: 'text-cyan-400'
    }
    return colors[tier.toLowerCase() as keyof typeof colors] || 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-amber-600">Referral Program</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Your <span className="text-amber-400">Referral Dashboard</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Earn commissions by referring new traders. Track your earnings, manage referrals, and grow your network.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                ${mockUserData.personalStats.totalEarnings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Earnings</div>
              <div className="text-xs text-green-400 mt-1">
                +${mockUserData.personalStats.monthlyEarnings} this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-700">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {mockUserData.personalStats.totalReferrals}
              </div>
              <div className="text-sm text-gray-400">Total Referrals</div>
              <div className="text-xs text-blue-400 mt-1">
                {mockUserData.personalStats.activeReferrals} active
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {mockUserData.personalStats.conversionRate}%
              </div>
              <div className="text-sm text-gray-400">Conversion Rate</div>
              <div className="text-xs text-purple-400 mt-1">
                Above average
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700">
            <CardContent className="p-6 text-center">
              <Crown className={`w-8 h-8 mx-auto mb-3 ${getTierColor(mockUserData.personalStats.tier)}`} />
              <div className={`text-3xl font-bold mb-2 ${getTierColor(mockUserData.personalStats.tier)}`}>
                {mockUserData.personalStats.tier}
              </div>
              <div className="text-sm text-gray-400">Current Tier</div>
              <div className="text-xs text-amber-400 mt-1">
                {mockUserData.personalStats.progressToNextTier}% to {mockUserData.personalStats.nextTier}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="share">Share & Invite</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Share */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-cyan-400" />
                    Quick Share
                  </CardTitle>
                  <CardDescription>Share your referral link and start earning</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      ref={linkInputRef}
                      value={referralLink}
                      readOnly
                      className="bg-gray-800 border-gray-700"
                    />
                    <Button
                      onClick={() => copyToClipboard(referralLink)}
                      className={`${copiedLink ? 'bg-green-600' : 'bg-cyan-600'} hover:bg-cyan-700`}
                    >
                      {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial('twitter')}
                      className="flex-1"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial('linkedin')}
                      className="flex-1"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToSocial('whatsapp')}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Progress */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Tier Progress
                  </CardTitle>
                  <CardDescription>Advance to higher tiers for better commissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getTierColor(mockUserData.personalStats.tier)}`}>
                      {mockUserData.personalStats.tier} Member
                    </div>
                    <div className="text-sm text-gray-400">
                      {tierBenefits[mockUserData.personalStats.tier.toLowerCase() as keyof typeof tierBenefits]?.commission}% commission rate
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress to {mockUserData.personalStats.nextTier}</span>
                      <span className="text-white">{mockUserData.personalStats.progressToNextTier}%</span>
                    </div>
                    <Progress value={mockUserData.personalStats.progressToNextTier} className="h-3" />
                    <div className="text-xs text-gray-500">
                      {50 - mockUserData.personalStats.totalReferrals} more referrals needed
                    </div>
                  </div>

                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Tiers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest referrals and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUserData.recentReferrals.slice(0, 4).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-cyan-600">
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white">{referral.name}</div>
                          <div className="text-sm text-gray-400">
                            @{referral.username} • Joined {formatTime(referral.joinDate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {getStatusBadge(referral.status)}
                        <div className="text-right">
                          <div className="font-semibold text-green-400">+${referral.commission}</div>
                          <div className="text-sm text-gray-400">{referral.trades} trades</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share & Invite Tab */}
          <TabsContent value="share" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Referral Link */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-cyan-400" />
                    Your Referral Link
                  </CardTitle>
                  <CardDescription>Share this link to earn commissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Personal Referral URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={referralLink}
                        readOnly
                        className="bg-gray-800 border-gray-700 font-mono text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(referralLink)}
                        className={`${copiedLink ? 'bg-green-600' : 'bg-cyan-600'} hover:bg-cyan-700`}
                      >
                        {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Custom Referral Code</label>
                    <div className="flex gap-2">
                      <Input
                        value={mockUserData.referralCode}
                        readOnly
                        className="bg-gray-800 border-gray-700 font-mono text-lg font-bold"
                      />
                      <Button
                        onClick={() => copyToClipboard(mockUserData.referralCode)}
                        variant="outline"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button variant="outline">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Sharing */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-green-400" />
                    Social Media Sharing
                  </CardTitle>
                  <CardDescription>Share on your favorite platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial('linkedin')}
                      className="bg-blue-800 hover:bg-blue-900"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      className="bg-blue-700 hover:bg-blue-800"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => shareToSocial('whatsapp')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      WhatsApp
                    </Button>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Email Template</h4>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm text-gray-300">
                        "Hi! I've been using Nexural Trading for algorithmic trading and wanted to share it with you. 
                        You can get a $50 welcome bonus when you sign up with my link: {referralLink}
                        
                        It's a great platform for both beginners and experienced traders!"
                      </p>
                    </div>
                    <Button className="mt-3 w-full" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Copy Email Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Statistics */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Your Referral Performance
                </CardTitle>
                <CardDescription>Track how your referrals are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">156</div>
                    <div className="text-sm text-gray-400">Links Shared</div>
                    <div className="text-xs text-cyan-400 mt-1">+12 this week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">89</div>
                    <div className="text-sm text-gray-400">Clicks</div>
                    <div className="text-xs text-blue-400 mt-1">57% click rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">47</div>
                    <div className="text-sm text-gray-400">Sign-ups</div>
                    <div className="text-xs text-green-400 mt-1">52% conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">35</div>
                    <div className="text-sm text-gray-400">Active</div>
                    <div className="text-xs text-amber-400 mt-1">74% retention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">My Referrals</h3>
                <p className="text-gray-400">Manage and track your referred users</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="space-y-4 p-6">
                  {mockUserData.recentReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-cyan-600">
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white">{referral.name}</div>
                          <div className="text-sm text-gray-400">@{referral.username}</div>
                          <div className="flex items-center gap-3 mt-1">
                            {getStatusBadge(referral.status)}
                            {referral.isPremium && (
                              <Badge className="bg-purple-600">Premium</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-green-400 text-lg">
                          ${referral.commission.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Total Commission</div>
                        <div className="text-xs text-blue-400 mt-1">
                          {referral.trades} trades • ${referral.totalDeposit.toLocaleString()} deposited
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {formatTime(referral.joinDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earnings Summary */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-400" />
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      ${mockUserData.personalStats.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total Earnings</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-semibold">
                      ${mockUserData.personalStats.monthlyEarnings}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pending Payout</span>
                    <span className="text-amber-400 font-semibold">
                      ${mockUserData.personalStats.pendingPayouts}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Commission</span>
                    <span className="text-blue-400 font-semibold">
                      ${mockUserData.personalStats.averageCommission}
                    </span>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                </CardContent>
              </Card>

              {/* Commission History */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Commission History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUserData.commissionHistory.map((commission) => (
                        <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-semibold text-white">
                              {commission.type === 'signup_bonus' ? 'Sign-up Bonus' : 'Trading Commission'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {commission.referralName} • {commission.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">
                              +${commission.amount.toFixed(2)}
                            </div>
                            <Badge className={commission.status === 'paid' ? 'bg-green-600' : 'bg-amber-600'}>
                              {commission.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Referral Leaderboard
                </CardTitle>
                <CardDescription>See how you rank among other referrers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Sarah Martinez", referrals: 127, earnings: 4250.80 },
                    { rank: 2, name: "David Kim", referrals: 98, earnings: 3890.45 },
                    { rank: 3, name: "Your Position", referrals: 47, earnings: 2847.50, isCurrentUser: true },
                    { rank: 4, name: "Alex Johnson", referrals: 43, earnings: 2650.30 },
                    { rank: 5, name: "Emma Chen", referrals: 38, earnings: 2455.75 }
                  ].map((user) => (
                    <div 
                      key={user.rank} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        user.isCurrentUser 
                          ? 'bg-cyan-900/30 border border-cyan-600' 
                          : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          user.rank === 1 ? 'bg-amber-600' : 
                          user.rank === 2 ? 'bg-gray-400' :
                          user.rank === 3 ? 'bg-amber-700' :
                          'bg-gray-600'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <div className={`font-semibold ${user.isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                            {user.name}
                          </div>
                          {user.isCurrentUser && (
                            <Badge className="bg-cyan-600 text-xs mt-1">You</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">
                          ${user.earnings.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.referrals} referrals
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
