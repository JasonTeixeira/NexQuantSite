"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, AlertTriangle, Brain, Target, Activity, TrendingUp,
  CheckCircle, XCircle, Eye, Flag, Users, BarChart3, 
  Calendar, Clock, DollarSign, Percent, Zap, Award,
  Search, Filter, RefreshCw, Download
} from "lucide-react"
import { toast } from "sonner"

interface LeaderboardFraudDetectionProps {
  className?: string
}

export default function LeaderboardFraudDetection({ className }: LeaderboardFraudDetectionProps) {
  const [selectedTab, setSelectedTab] = useState("suspicious")

  // Mock fraud detection data
  const mockSuspiciousUsers = [
    {
      id: 'fraud_001',
      username: 'impossible_trader',
      displayName: 'Perfect Trader',
      rank: 5,
      points: 98450,
      suspicionScore: 95, // 0-100, higher is more suspicious
      flags: [
        { type: 'performance', severity: 'high', description: '99.8% win rate over 1000+ trades' },
        { type: 'pattern', severity: 'high', description: 'Identical trade timing patterns' },
        { type: 'account', severity: 'medium', description: 'Account created recently' },
        { type: 'behavior', severity: 'medium', description: 'No losing streaks detected' }
      ],
      detectedIssues: {
        unrealisticWinRate: true,
        impossibleReturns: true,
        suspiciousPatterns: true,
        dataInconsistency: false,
        botBehavior: true
      },
      performance: {
        winRate: 99.8,
        profitFactor: 25.7,
        monthlyReturn: 8475.3,
        totalTrades: 1247,
        avgTradeTime: 0.02, // 2 seconds - suspicious
        consecutiveWins: 1190
      },
      riskMetrics: {
        sharpeRatio: 45.2,
        maxDrawdown: -0.001,
        volatility: 0.05,
        consistency: 99.9
      },
      timeline: {
        accountAge: 30, // days
        tradingStarted: '2024-01-01',
        suspicionFirstDetected: '2024-01-10',
        lastValidated: null
      },
      status: 'under_review'
    },
    {
      id: 'fraud_002', 
      username: 'copy_cat_trader',
      displayName: 'Mirror Master',
      rank: 12,
      points: 76830,
      suspicionScore: 78,
      flags: [
        { type: 'pattern', severity: 'high', description: 'Trades mirror another user exactly' },
        { type: 'timing', severity: 'medium', description: 'Suspicious trade timing correlation' },
        { type: 'performance', severity: 'low', description: 'Performance improvement too rapid' }
      ],
      detectedIssues: {
        unrealisticWinRate: false,
        impossibleReturns: false,
        suspiciousPatterns: true,
        dataInconsistency: true,
        botBehavior: false
      },
      performance: {
        winRate: 84.3,
        profitFactor: 3.8,
        monthlyReturn: 89.7,
        totalTrades: 892,
        avgTradeTime: 15.3,
        consecutiveWins: 23
      },
      riskMetrics: {
        sharpeRatio: 2.4,
        maxDrawdown: -5.7,
        volatility: 12.3,
        consistency: 87.2
      },
      timeline: {
        accountAge: 120,
        tradingStarted: '2023-10-15',
        suspicionFirstDetected: '2024-01-05',
        lastValidated: null
      },
      status: 'flagged'
    }
  ]

  const mockDetectionMetrics = {
    totalScanned: 47892,
    suspiciousUsers: 234,
    confirmedFraud: 89,
    falsePositives: 12,
    detectionAccuracy: 98.7,
    avgDetectionTime: 2.3, // hours
    automatedActions: 156,
    manualReviews: 78
  }

  const mockDetectionRules = [
    {
      id: 'win_rate_rule',
      name: 'Unrealistic Win Rate',
      description: 'Flags users with win rates above 95% over 100+ trades',
      severity: 'high',
      enabled: true,
      threshold: 95,
      triggers: 43,
      falsePositives: 2
    },
    {
      id: 'return_rule',
      name: 'Impossible Returns',
      description: 'Detects monthly returns exceeding 500%',
      severity: 'high',
      enabled: true,
      threshold: 500,
      triggers: 23,
      falsePositives: 0
    },
    {
      id: 'pattern_rule',
      name: 'Bot-like Patterns',
      description: 'Identifies mechanical trading patterns',
      severity: 'medium',
      enabled: true,
      threshold: 85,
      triggers: 67,
      falsePositives: 8
    },
    {
      id: 'timing_rule',
      name: 'Suspicious Timing',
      description: 'Flags identical trade timing across multiple accounts',
      severity: 'medium',
      enabled: true,
      threshold: 90,
      triggers: 34,
      falsePositives: 3
    }
  ]

  const handleInvestigateUser = (userId: string) => {
    console.log(`Starting investigation for user: ${userId}`)
    toast.success('Investigation initiated!')
  }

  const handleApproveUser = (userId: string) => {
    console.log(`Approving user: ${userId}`)
    toast.success('User approved and flags cleared!')
  }

  const handleSuspendUser = (userId: string) => {
    console.log(`Suspending user: ${userId}`)
    toast.success('User suspended from leaderboards!')
  }

  const handleUpdateRule = (ruleId: string, enabled: boolean) => {
    console.log(`Updating rule ${ruleId}: ${enabled}`)
    toast.success(`Detection rule ${enabled ? 'enabled' : 'disabled'}!`)
  }

  const getSuspicionColor = (score: number) => {
    if (score >= 90) return 'text-red-400'
    if (score >= 70) return 'text-orange-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 text-red-400'
      case 'medium': return 'border-yellow-500 text-yellow-400'
      case 'low': return 'border-green-500 text-green-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Leaderboard Fraud Detection
          </h1>
          <p className="text-gray-400">
            AI-powered fraud detection and performance validation system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-red-500 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {mockDetectionMetrics.suspiciousUsers} Flagged
          </Badge>
          <Button variant="outline" className="border-blue-500 text-blue-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Scan
          </Button>
        </div>
      </div>

      {/* Detection Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Suspicious Users</p>
                <p className="text-2xl font-bold text-red-400">{mockDetectionMetrics.suspiciousUsers}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Confirmed Fraud</p>
                <p className="text-2xl font-bold text-orange-400">{mockDetectionMetrics.confirmedFraud}</p>
              </div>
              <XCircle className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Detection Accuracy</p>
                <p className="text-2xl font-bold text-green-400">{mockDetectionMetrics.detectionAccuracy}%</p>
              </div>
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Auto Actions</p>
                <p className="text-2xl font-bold text-blue-400">{mockDetectionMetrics.automatedActions}</p>
              </div>
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900">
          <TabsTrigger value="suspicious" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Suspicious Users
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Detection Rules
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Patterns
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Suspicious Users */}
        <TabsContent value="suspicious" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Flagged Users Review</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search Users
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Risk
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockSuspiciousUsers.map((user) => (
              <Card key={user.id} className="bg-red-900/20 border-red-500/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* User Info & Suspicion Score */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-red-500">
                          <AvatarFallback className="bg-red-900 text-red-300">
                            {user.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-white">{user.displayName}</h4>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                          <div className="text-sm text-gray-400">Rank #{user.rank}</div>
                        </div>
                      </div>

                      {/* Suspicion Score */}
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Suspicion Score</span>
                          <span className={`text-lg font-bold ${getSuspicionColor(user.suspicionScore)}`}>
                            {user.suspicionScore}/100
                          </span>
                        </div>
                        <Progress value={user.suspicionScore} className="h-2" />
                        <Badge variant="destructive" className="mt-2 text-xs">
                          {user.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-red-400" />
                        Performance Flags
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className={`font-semibold ${
                            user.performance.winRate > 95 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {user.performance.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Return:</span>
                          <span className={`font-semibold ${
                            user.performance.monthlyReturn > 500 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            +{user.performance.monthlyReturn}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Factor:</span>
                          <span className={`font-semibold ${
                            user.performance.profitFactor > 10 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {user.performance.profitFactor}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Trade Time:</span>
                          <span className={`font-semibold ${
                            user.performance.avgTradeTime < 1 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {user.performance.avgTradeTime}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Drawdown:</span>
                          <span className={`font-semibold ${
                            Math.abs(user.riskMetrics.maxDrawdown) < 1 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {user.riskMetrics.maxDrawdown}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detection Flags */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-white flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-400" />
                        Detection Flags
                      </h5>
                      <div className="space-y-2">
                        {user.flags.map((flag, i) => (
                          <div key={i} className={`p-2 rounded border ${getSeverityColor(flag.severity)} bg-gray-800/30`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{flag.type}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSeverityColor(flag.severity)}`}
                              >
                                {flag.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-300">{flag.description}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detected Issues Summary */}
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                        <h6 className="text-red-400 font-semibold mb-2 text-sm">Issues Detected</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(user.detectedIssues).map(([issue, detected]) => (
                            <div key={issue} className="flex items-center gap-2">
                              {detected ? (
                                <XCircle className="w-3 h-3 text-red-400" />
                              ) : (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              )}
                              <span className={detected ? 'text-red-300' : 'text-green-300'}>
                                {issue.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleInvestigateUser(user.id)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Deep Investigation
                      </Button>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve User
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleSuspendUser(user.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Suspend User
                      </Button>

                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Data
                      </Button>

                      {/* Timeline Info */}
                      <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
                        <h6 className="text-white font-semibold mb-2">Timeline</h6>
                        <div className="space-y-1 text-gray-400">
                          <div>Account Age: {user.timeline.accountAge} days</div>
                          <div>First Detected: {new Date(user.timeline.suspicionFirstDetected).toLocaleDateString()}</div>
                          <div>Status: {user.timeline.lastValidated ? 'Validated' : 'Pending Review'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detection Rules */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Fraud Detection Rules</h3>
            <div className="flex gap-2">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Config
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockDetectionRules.map((rule) => (
              <Card key={rule.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Rule Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">{rule.name}</h4>
                          <p className="text-gray-300 text-sm mb-3">{rule.description}</p>
                        </div>
                        <Badge className={`${getSeverityColor(rule.severity)}`}>
                          {rule.severity} priority
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Threshold:</span>
                          <span className="text-white ml-2">{rule.threshold}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Triggers:</span>
                          <span className="text-blue-400 ml-2 font-semibold">{rule.triggers}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">False Positives:</span>
                          <span className="text-red-400 ml-2 font-semibold">{rule.falsePositives}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Accuracy:</span>
                          <span className="text-green-400 ml-2 font-semibold">
                            {Math.round(((rule.triggers - rule.falsePositives) / rule.triggers) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Performance</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Accuracy</span>
                            <span className="text-green-400">
                              {Math.round(((rule.triggers - rule.falsePositives) / rule.triggers) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.round(((rule.triggers - rule.falsePositives) / rule.triggers) * 100)} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-center">
                          <div>
                            <div className="text-blue-400 font-semibold">{rule.triggers}</div>
                            <div className="text-gray-400">Triggers</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-semibold">{rule.falsePositives}</div>
                            <div className="text-gray-400">False+</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Rule Status</span>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>

                      <Button 
                        size="sm" 
                        variant={rule.enabled ? "destructive" : "default"}
                        className="w-full"
                        onClick={() => handleUpdateRule(rule.id, !rule.enabled)}
                      >
                        {rule.enabled ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Disable Rule
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Enable Rule
                          </>
                        )}
                      </Button>

                      <Button size="sm" variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>

                      <Button size="sm" variant="outline" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Triggers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Pattern Analysis</h3>
            <p className="text-gray-400 mb-6">
              Advanced machine learning models for detecting sophisticated fraud patterns
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-purple-400">15</div>
                <div className="text-sm text-gray-400">ML Models</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-400">97.3%</div>
                <div className="text-sm text-gray-400">Pattern Accuracy</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-400">1,247</div>
                <div className="text-sm text-gray-400">Patterns Detected</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-yellow-400">23</div>
                <div className="text-sm text-gray-400">New This Week</div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Fraud Detection Reports</h3>
            <p className="text-gray-400 mb-6">
              Comprehensive reporting and analytics on fraud detection performance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <Calendar className="w-8 h-8 text-blue-400" />
                <span>Weekly Reports</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span>Trend Analysis</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <Download className="w-8 h-8 text-purple-400" />
                <span>Export Data</span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
