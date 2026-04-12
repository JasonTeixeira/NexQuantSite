"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Shield, AlertTriangle,
  CheckCircle, XCircle, Eye, Download, Upload, BarChart3, Star,
  Search, Filter, Crown, Award, Flag, MessageSquare, Calendar,
  Activity, Clock, Percent, Target, Zap, Brain, FileText,
  CreditCard, PieChart, LineChart, Settings, Mail, Phone,
  Globe, Lock, Unlock, ChevronDown, MoreHorizontal, Copy
} from "lucide-react"
import { toast } from "sonner"

interface MarketplaceManagementProps {
  className?: string
}

export default function MarketplaceManagement({ className }: MarketplaceManagementProps) {
  const [selectedTab, setSelectedTab] = useState("pending")
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)

  // Mock data for marketplace management
  const mockPendingStrategies = [
    {
      id: 'str_001',
      title: 'Bitcoin Momentum Master Pro',
      author: {
        name: 'Alex Chen',
        id: 'user_123',
        email: 'alex@example.com',
        verified: true,
        level: 'Diamond',
        strategies: 11,
        totalSales: 12400
      },
      submittedDate: '2024-01-15T10:30:00Z',
      price: 299,
      category: 'Cryptocurrency',
      complexity: 'Advanced',
      performance: {
        winRate: 73.2,
        sharpeRatio: 2.4,
        maxDrawdown: -8.5,
        totalReturn: 284.7,
        backtestPeriod: '2 years'
      },
      status: 'pending',
      flags: [],
      filesUploaded: ['code.py', 'documentation.pdf', 'charts.png'],
      reviewNotes: '',
      riskScore: 15, // 0-100, lower is better
      verificationStatus: {
        performanceVerified: false,
        codeReviewed: false,
        documentsChecked: false,
        fraudCheck: 'pending'
      }
    },
    {
      id: 'str_002',
      title: 'High-Frequency Scalping Bot',
      author: {
        name: 'Unknown Trader',
        id: 'user_999',
        email: 'suspicious@temp-mail.com',
        verified: false,
        level: 'Bronze',
        strategies: 0,
        totalSales: 0
      },
      submittedDate: '2024-01-15T08:15:00Z',
      price: 1999,
      category: 'Cryptocurrency',
      complexity: 'Expert',
      performance: {
        winRate: 98.5,
        sharpeRatio: 8.9,
        maxDrawdown: -0.5,
        totalReturn: 2847.3,
        backtestPeriod: '6 months'
      },
      status: 'flagged',
      flags: ['Unrealistic Performance', 'New Seller', 'Suspicious Claims'],
      filesUploaded: [],
      reviewNotes: 'Performance claims seem unrealistic. Requires thorough verification.',
      riskScore: 85,
      verificationStatus: {
        performanceVerified: false,
        codeReviewed: false,
        documentsChecked: false,
        fraudCheck: 'failed'
      }
    }
  ]

  const mockActiveStrategies = [
    {
      id: 'str_live_001',
      title: 'ETH Scalping Pro',
      author: 'Sarah Johnson',
      price: 199,
      sales: 634,
      revenue: 89460, // Total revenue generated
      rating: 4.6,
      reviews: 89,
      status: 'active',
      featured: false,
      publishedDate: '2024-01-10T00:00:00Z',
      lastUpdate: '2024-01-18T12:00:00Z',
      monthlyEarnings: 18950,
      refundRequests: 2,
      supportTickets: 5
    },
    {
      id: 'str_live_002',
      title: 'S&P 500 Mean Reversion',
      author: 'Michael Rodriguez',
      price: 149,
      sales: 423,
      revenue: 63027,
      rating: 4.4,
      reviews: 67,
      status: 'active',
      featured: true,
      publishedDate: '2024-01-05T00:00:00Z',
      lastUpdate: '2024-01-15T10:30:00Z',
      monthlyEarnings: 8950,
      refundRequests: 0,
      supportTickets: 1
    }
  ]

  const mockSellers = [
    {
      id: 'seller_001',
      name: 'Alex Chen',
      email: 'alex@example.com',
      verified: true,
      level: 'Diamond',
      joinDate: '2023-06-15',
      totalStrategies: 12,
      activeStrategies: 11,
      totalSales: 1247,
      totalRevenue: 156890,
      monthlyRevenue: 24500,
      averageRating: 4.8,
      refundRate: 2.1,
      supportScore: 9.2,
      payoutStatus: 'current',
      lastPayout: '2024-01-01',
      pendingEarnings: 3420,
      verificationLevel: 'professional',
      riskScore: 8
    },
    {
      id: 'seller_002',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      verified: true,
      level: 'Gold',
      joinDate: '2023-08-20',
      totalStrategies: 8,
      activeStrategies: 7,
      totalSales: 634,
      totalRevenue: 89460,
      monthlyRevenue: 15800,
      averageRating: 4.6,
      refundRate: 3.2,
      supportScore: 8.7,
      payoutStatus: 'current',
      lastPayout: '2024-01-01',
      pendingEarnings: 2890,
      verificationLevel: 'basic',
      riskScore: 12
    }
  ]

  const mockDisputes = [
    {
      id: 'dispute_001',
      strategyId: 'str_live_001',
      strategyTitle: 'ETH Scalping Pro',
      buyerName: 'TradingNewbie',
      sellerName: 'Sarah Johnson',
      type: 'refund_request',
      reason: 'Strategy not performing as advertised',
      amount: 199,
      status: 'open',
      priority: 'medium',
      submittedDate: '2024-01-14T16:20:00Z',
      description: 'The strategy has been losing money consistently. The performance metrics shown do not match real results.',
      evidence: ['screenshots.zip', 'trading_log.csv'],
      assignedTo: 'support_001'
    },
    {
      id: 'dispute_002',
      strategyId: 'str_live_003',
      strategyTitle: 'Forex Carry Elite',
      buyerName: 'ProTrader92',
      sellerName: 'Emma Thompson',
      type: 'code_issue',
      reason: 'Strategy code contains errors',
      amount: 399,
      status: 'resolved',
      priority: 'high',
      submittedDate: '2024-01-12T09:15:00Z',
      description: 'Code provided has syntax errors and will not run properly. Need working version or refund.',
      evidence: ['error_log.txt'],
      assignedTo: 'support_002',
      resolution: 'Seller provided corrected code. Issue resolved.',
      resolvedDate: '2024-01-13T14:30:00Z'
    }
  ]

  const mockPayouts = [
    {
      id: 'payout_001',
      sellerId: 'seller_001',
      sellerName: 'Alex Chen',
      period: '2024-01',
      grossEarnings: 4890,
      fees: 489,
      netAmount: 4401,
      status: 'paid',
      payoutDate: '2024-01-01T00:00:00Z',
      paymentMethod: 'bank_transfer',
      currency: 'USD'
    },
    {
      id: 'payout_002',
      sellerId: 'seller_002',
      sellerName: 'Sarah Johnson', 
      period: '2024-01',
      grossEarnings: 2760,
      fees: 276,
      netAmount: 2484,
      status: 'processing',
      payoutDate: null,
      paymentMethod: 'paypal',
      currency: 'USD'
    }
  ]

  const handleApproveStrategy = (strategyId: string) => {
    console.log(`Approving strategy: ${strategyId}`)
    toast.success('Strategy approved and published!')
  }

  const handleRejectStrategy = (strategyId: string, reason: string) => {
    console.log(`Rejecting strategy: ${strategyId}, reason: ${reason}`)
    toast.success('Strategy rejected!')
  }

  const handleFeatureStrategy = (strategyId: string) => {
    console.log(`Featuring strategy: ${strategyId}`)
    toast.success('Strategy featured!')
  }

  const handleSuspendSeller = (sellerId: string) => {
    console.log(`Suspending seller: ${sellerId}`)
    toast.success('Seller account suspended!')
  }

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    console.log(`Resolving dispute: ${disputeId}, resolution: ${resolution}`)
    toast.success('Dispute resolved!')
  }

  const handleProcessPayout = (payoutId: string) => {
    console.log(`Processing payout: ${payoutId}`)
    toast.success('Payout processed!')
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Marketplace Management
          </h1>
          <p className="text-gray-400">
            Complete control over strategy listings, sellers, payouts, and marketplace operations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            $89,430 Revenue (30d)
          </Badge>
          <Button variant="outline" className="border-blue-500 text-blue-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Revenue Dashboard
          </Button>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">$342K</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Active Strategies</p>
                <p className="text-2xl font-bold text-blue-400">2,847</p>
              </div>
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Active Sellers</p>
                <p className="text-2xl font-bold text-purple-400">1,234</p>
              </div>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-400">{mockPendingStrategies.length}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Open Disputes</p>
                <p className="text-2xl font-bold text-red-400">{mockDisputes.filter(d => d.status === 'open').length}</p>
              </div>
              <Flag className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300">Avg Rating</p>
                <p className="text-2xl font-bold text-cyan-400">4.7★</p>
              </div>
              <Star className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({mockPendingStrategies.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sellers
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pending Strategies Review */}
        <TabsContent value="pending" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Strategy Review Queue</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Fraud Detection
              </Button>
              <Button size="sm" variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                AI Review
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockPendingStrategies.map((strategy) => (
              <Card key={strategy.id} className={`${
                strategy.status === 'flagged' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Strategy Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white">{strategy.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={strategy.status === 'flagged' ? 'destructive' : 'secondary'}>
                              {strategy.status}
                            </Badge>
                            {strategy.flags.length > 0 && (
                              <Badge variant="destructive">
                                {strategy.flags.length} Flags
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Author:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {strategy.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{strategy.author.name}</span>
                              {strategy.author.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Price:</span>
                            <span className="text-green-400 ml-2 font-semibold">${strategy.price}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <Badge variant="outline" className="ml-2 border-blue-500 text-blue-400 text-xs">
                              {strategy.category}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Risk Score:</span>
                            <span className={`ml-2 font-semibold ${
                              strategy.riskScore > 70 ? 'text-red-400' :
                              strategy.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {strategy.riskScore}/100
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-3">Performance Claims</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Win Rate:</span>
                            <span className="text-green-400 ml-2 font-semibold">{strategy.performance.winRate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Total Return:</span>
                            <span className="text-blue-400 ml-2 font-semibold">+{strategy.performance.totalReturn}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Sharpe Ratio:</span>
                            <span className="text-purple-400 ml-2 font-semibold">{strategy.performance.sharpeRatio}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Max Drawdown:</span>
                            <span className="text-red-400 ml-2 font-semibold">{strategy.performance.maxDrawdown}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Flags */}
                      {strategy.flags.length > 0 && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                          <h5 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Security Flags
                          </h5>
                          <div className="space-y-1">
                            {strategy.flags.map((flag, i) => (
                              <Badge key={i} variant="destructive" className="text-xs mr-1">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-3">Verification Status</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Performance:</span>
                            <span className={strategy.verificationStatus.performanceVerified ? 'text-green-400' : 'text-red-400'}>
                              {strategy.verificationStatus.performanceVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Code Review:</span>
                            <span className={strategy.verificationStatus.codeReviewed ? 'text-green-400' : 'text-red-400'}>
                              {strategy.verificationStatus.codeReviewed ? 'Passed' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Documents:</span>
                            <span className={strategy.verificationStatus.documentsChecked ? 'text-green-400' : 'text-red-400'}>
                              {strategy.verificationStatus.documentsChecked ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fraud Check:</span>
                            <span className={
                              strategy.verificationStatus.fraudCheck === 'passed' ? 'text-green-400' :
                              strategy.verificationStatus.fraudCheck === 'failed' ? 'text-red-400' : 'text-yellow-400'
                            }>
                              {strategy.verificationStatus.fraudCheck}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Files */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-3">Uploaded Files</h5>
                        {strategy.filesUploaded.length > 0 ? (
                          <div className="space-y-2">
                            {strategy.filesUploaded.map((file, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">{file}</span>
                                <Button size="sm" variant="ghost" className="h-6 px-2">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No files uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveStrategy(strategy.id)}
                        disabled={strategy.riskScore > 50}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Strategy
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {
                          setSelectedStrategy(strategy)
                          setShowApprovalModal(true)
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Strategy
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Brain className="w-4 h-4 mr-2" />
                        Run AI Analysis
                      </Button>

                      {/* Admin Notes */}
                      <div>
                        <label className="text-sm font-medium text-white">Admin Notes:</label>
                        <Textarea
                          placeholder="Add review notes..."
                          className="mt-1 bg-gray-800 border-gray-600 text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Strategies */}
        <TabsContent value="active" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Active Marketplace Strategies</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Crown className="w-4 h-4 mr-2" />
                Manage Featured
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter & Sort
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockActiveStrategies.map((strategy) => (
              <Card key={strategy.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Strategy Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-white">{strategy.title}</h4>
                        <div className="flex gap-2">
                          {strategy.featured && (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              <Crown className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Author:</span>
                          <span className="text-white ml-2">{strategy.author}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Price:</span>
                          <span className="text-green-400 ml-2 font-semibold">${strategy.price}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Published:</span>
                          <span className="text-white ml-2">
                            {new Date(strategy.publishedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Performance</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sales:</span>
                          <span className="text-blue-400 font-semibold">{strategy.sales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-green-400 font-semibold">${strategy.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-yellow-400">{strategy.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reviews:</span>
                          <span className="text-white">{strategy.reviews}</span>
                        </div>
                      </div>
                    </div>

                    {/* Support Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Support</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Refund Requests:</span>
                          <span className={`font-semibold ${
                            strategy.refundRequests > 5 ? 'text-red-400' :
                            strategy.refundRequests > 0 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {strategy.refundRequests}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Support Tickets:</span>
                          <span className={`font-semibold ${
                            strategy.supportTickets > 10 ? 'text-red-400' :
                            strategy.supportTickets > 0 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {strategy.supportTickets}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Earnings:</span>
                          <span className="text-green-400 font-semibold">
                            ${strategy.monthlyEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleFeatureStrategy(strategy.id)}
                        variant={strategy.featured ? "secondary" : "default"}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {strategy.featured ? 'Remove Featured' : 'Feature Strategy'}
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full text-red-400 border-red-600">
                        <Lock className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Seller Management */}
        <TabsContent value="sellers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Seller Management</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Verification Queue
              </Button>
              <Button size="sm" variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Payout Management
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockSellers.map((seller) => (
              <Card key={seller.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Seller Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-12 h-12 border-2 border-blue-500/50">
                          <AvatarFallback className="bg-gradient-to-r from-blue-400 to-cyan-400 text-black font-semibold">
                            {seller.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{seller.name}</h4>
                            {seller.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <Badge className={`text-xs ${
                            seller.level === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                            seller.level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {seller.level} Seller
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-400">{seller.email}</div>
                        <div className="text-gray-400">
                          Joined: {new Date(seller.joinDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          Verification: <span className={`${
                            seller.verificationLevel === 'professional' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {seller.verificationLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Performance</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Sales:</span>
                          <span className="text-blue-400 font-semibold">{seller.totalSales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-green-400 font-semibold">
                            ${seller.totalRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Revenue:</span>
                          <span className="text-green-400 font-semibold">
                            ${seller.monthlyRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-yellow-400">{seller.averageRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk & Quality Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Quality Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Score:</span>
                          <span className={`font-semibold ${
                            seller.riskScore > 50 ? 'text-red-400' :
                            seller.riskScore > 25 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {seller.riskScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Refund Rate:</span>
                          <span className={`font-semibold ${
                            seller.refundRate > 10 ? 'text-red-400' :
                            seller.refundRate > 5 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {seller.refundRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Support Score:</span>
                          <span className={`font-semibold ${
                            seller.supportScore > 8 ? 'text-green-400' :
                            seller.supportScore > 6 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {seller.supportScore}/10
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Strategies:</span>
                          <span className="text-white">{seller.activeStrategies}/{seller.totalStrategies}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Payout */}
                    <div className="space-y-3">
                      <div className="bg-green-900/20 rounded-lg p-3 border border-green-700">
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400">Pending Earnings:</span>
                            <span className="text-green-400 font-semibold">
                              ${seller.pendingEarnings.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge variant="default" className="bg-green-600 text-xs">
                              {seller.payoutStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Process Payout
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-red-400 border-red-600"
                        onClick={() => handleSuspendSeller(seller.id)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Suspend Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Dispute Management */}
        <TabsContent value="disputes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Dispute Resolution</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Center
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Escalation Rules
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockDisputes.map((dispute) => (
              <Card key={dispute.id} className={`${
                dispute.status === 'open' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Dispute Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {dispute.strategyTitle}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant={dispute.status === 'open' ? 'destructive' : 'secondary'}>
                              {dispute.status}
                            </Badge>
                            <Badge variant="outline" className={`${
                              dispute.priority === 'high' ? 'border-red-500 text-red-400' :
                              dispute.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-green-500 text-green-400'
                            }`}>
                              {dispute.priority} priority
                            </Badge>
                            <span className="text-gray-400">
                              Type: <span className="text-white">{dispute.type.replace('_', ' ')}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">${dispute.amount}</div>
                          <div className="text-sm text-gray-400">Dispute Amount</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Buyer:</span>
                          <span className="text-white ml-2">{dispute.buyerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Seller:</span>
                          <span className="text-white ml-2">{dispute.sellerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Submitted:</span>
                          <span className="text-white ml-2">
                            {new Date(dispute.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Assigned to:</span>
                          <span className="text-blue-400 ml-2">{dispute.assignedTo}</span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-2">Description</h5>
                        <p className="text-gray-300 text-sm mb-3">{dispute.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Evidence:</span>
                          {dispute.evidence.map((file, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {dispute.status === 'resolved' && (
                        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                          <h5 className="text-green-400 font-semibold mb-2">Resolution</h5>
                          <p className="text-green-300 text-sm mb-2">{dispute.resolution}</p>
                          <div className="text-xs text-green-400">
                            Resolved: {new Date(dispute.resolvedDate!).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {dispute.status === 'open' && (
                        <>
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleResolveDispute(dispute.id, 'favor_buyer')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Favor Buyer
                          </Button>
                          
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleResolveDispute(dispute.id, 'favor_seller')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Favor Seller
                          </Button>
                          
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Request More Info
                          </Button>
                        </>
                      )}
                      
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Strategy
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Case History
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Parties
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payout Management */}
        <TabsContent value="payouts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Payout Management</h3>
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Process All Payouts
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockPayouts.map((payout) => (
              <Card key={payout.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Payout Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{payout.sellerName}</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-400">Period:</span>
                          <span className="text-white ml-2">{payout.period}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Method:</span>
                          <span className="text-white ml-2 capitalize">{payout.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Currency:</span>
                          <span className="text-white ml-2">{payout.currency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Financial Breakdown</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gross Earnings:</span>
                          <span className="text-green-400 font-semibold">${payout.grossEarnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform Fees:</span>
                          <span className="text-red-400 font-semibold">-${payout.fees}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-700 pt-2">
                          <span className="text-gray-400">Net Amount:</span>
                          <span className="text-blue-400 font-semibold text-lg">${payout.netAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Timing */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Status & Timing</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>
                            {payout.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payout Date:</span>
                          <span className="text-white">
                            {payout.payoutDate 
                              ? new Date(payout.payoutDate).toLocaleDateString()
                              : 'Pending'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {payout.status === 'processing' && (
                        <Button 
                          size="sm" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleProcessPayout(payout.id)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payout
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Receipt
                      </Button>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Notify Seller
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Marketplace Analytics Dashboard</h3>
            <p className="text-gray-400 mb-6">
              Comprehensive analytics for marketplace performance, revenue trends, and seller insights
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-400">$342K</div>
                <div className="text-sm text-gray-400">Total Revenue</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-400">2,847</div>
                <div className="text-sm text-gray-400">Active Strategies</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-purple-400">1,234</div>
                <div className="text-sm text-gray-400">Active Sellers</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-yellow-400">4.7★</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Strategy Review Decision</DialogTitle>
            <DialogDescription>
              Provide feedback for the strategy rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Rejection Reason</label>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="performance">Performance Claims Unverified</SelectItem>
                  <SelectItem value="documentation">Insufficient Documentation</SelectItem>
                  <SelectItem value="code_quality">Code Quality Issues</SelectItem>
                  <SelectItem value="fraud">Suspicious/Fraudulent Activity</SelectItem>
                  <SelectItem value="guidelines">Violates Marketplace Guidelines</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-white">Detailed Feedback</label>
              <Textarea
                placeholder="Provide specific feedback to help the seller improve..."
                className="bg-gray-800 border-gray-600"
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notify-seller" className="rounded" />
                <label htmlFor="notify-seller" className="text-sm text-white">
                  Send notification to seller
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ban-seller" className="rounded" />
                <label htmlFor="ban-seller" className="text-sm text-red-400">
                  Suspend seller account
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowApprovalModal(false)
                  toast.success('Strategy rejected and seller notified!')
                }}
              >
                Reject Strategy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
