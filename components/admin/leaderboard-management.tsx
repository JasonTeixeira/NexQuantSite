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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { 
  Trophy, Crown, Medal, Users, Activity, BarChart3, TrendingUp, 
  Settings, Shield, AlertTriangle, CheckCircle, XCircle, Eye,
  Star, Award, Calendar, Clock, DollarSign, Target, Zap,
  Plus, Edit, Trash2, Flag, Brain, Filter, Search, 
  RefreshCw, Download, Upload, MessageSquare, UserMinus
} from "lucide-react"
import { toast } from "sonner"

interface LeaderboardManagementProps {
  className?: string
}

export default function LeaderboardManagement({ className }: LeaderboardManagementProps) {
  const [selectedTab, setSelectedTab] = useState("rankings")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Mock data for leaderboard management
  const mockLeaderboardUsers = [
    {
      id: 'user_001',
      username: 'cryptobull_alex',
      displayName: 'Alex Rodriguez',
      email: 'alex@example.com',
      rank: 1,
      points: 125750,
      level: 'Diamond',
      verified: true,
      joinedDate: '2023-01-15',
      lastActive: '2024-01-08T10:30:00Z',
      performance: {
        winRate: 87.5,
        profitFactor: 3.2,
        monthlyReturn: 24.8,
        totalTrades: 1247,
        streak: 12
      },
      flags: [],
      status: 'active',
      achievements: ['first_place', 'profit_master', 'consistency_king'],
      suspiciousActivity: false,
      performanceValidated: true
    },
    {
      id: 'user_002', 
      username: 'fake_trader_99',
      displayName: 'Suspicious Trader',
      email: 'fake@temp-email.com',
      rank: 15,
      points: 89430,
      level: 'Gold',
      verified: false,
      joinedDate: '2024-01-01',
      lastActive: '2024-01-08T09:15:00Z',
      performance: {
        winRate: 98.5, // Unrealistic
        profitFactor: 15.2, // Unrealistic
        monthlyReturn: 847.3, // Unrealistic
        totalTrades: 50, // Too few trades
        streak: 48 // Impossible streak
      },
      flags: ['Unrealistic Performance', 'New Account', 'Suspicious Trades'],
      status: 'flagged',
      achievements: [],
      suspiciousActivity: true,
      performanceValidated: false
    }
  ]

  const mockCompetitions = [
    {
      id: 'comp_001',
      name: 'Winter Championship 2024',
      type: 'tournament',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      status: 'active',
      participants: 15420,
      maxParticipants: 20000,
      prizePool: 500000,
      rules: 'Highest overall score wins',
      description: 'The ultimate trading competition with $500K prize pool',
      eligibility: ['Minimum 1000 points', 'Verified account', 'Active for 30+ days'],
      categories: ['Overall', 'Crypto', 'Forex', 'Stocks']
    },
    {
      id: 'comp_002',
      name: 'Daily Scalping Challenge',
      type: 'challenge',
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-01-22T23:59:59Z',
      status: 'upcoming',
      participants: 0,
      maxParticipants: 1000,
      prizePool: 25000,
      rules: 'Best daily performance wins',
      description: 'High-frequency trading challenge for scalpers',
      eligibility: ['Gold level or higher', 'Minimum 100 trades'],
      categories: ['Scalping']
    }
  ]

  const mockAchievements = [
    {
      id: 'first_place',
      name: 'Champion',
      description: 'Reached #1 on the leaderboard',
      icon: '👑',
      rarity: 'legendary',
      points: 5000,
      category: 'milestone',
      active: true,
      recipients: 1,
      criteria: 'Reach rank #1'
    },
    {
      id: 'profit_master',
      name: 'Profit Master',
      description: 'Achieved over 100% monthly return',
      icon: '💰',
      rarity: 'epic',
      points: 2500,
      category: 'trading',
      active: true,
      recipients: 23,
      criteria: 'Monthly return > 100%'
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintained positive returns for 6 months',
      icon: '📈',
      rarity: 'rare',
      points: 1500,
      category: 'trading',
      active: true,
      recipients: 87,
      criteria: 'Positive returns for 180+ days'
    }
  ]

  const mockLeaderboardAnalytics = {
    totalUsers: 47892,
    activeUsers: 15420,
    averagePoints: 12450,
    topUserPoints: 125750,
    flaggedUsers: 234,
    competitionParticipation: 76.3,
    achievementDistribution: {
      legendary: 12,
      epic: 156,
      rare: 1247,
      common: 8934
    },
    engagement: {
      dailyActive: 8934,
      weeklyActive: 15420,
      monthlyActive: 23456
    }
  }

  const handleSuspendUser = (userId: string) => {
    console.log(`Suspending user: ${userId}`)
    toast.success('User suspended from leaderboards!')
  }

  const handleValidatePerformance = (userId: string) => {
    console.log(`Validating performance for: ${userId}`)
    toast.success('Performance validation initiated!')
  }

  const handleAdjustRank = (userId: string, newRank: number) => {
    console.log(`Adjusting rank for ${userId} to ${newRank}`)
    toast.success('Rank adjusted successfully!')
  }

  const handleCreateCompetition = (competitionData: any) => {
    console.log('Creating competition:', competitionData)
    toast.success('Competition created successfully!')
    setShowCreateModal(false)
  }

  const handleResetLeaderboard = (category: string) => {
    console.log(`Resetting leaderboard: ${category}`)
    toast.success(`${category} leaderboard reset!`)
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Leaderboard Management
          </h1>
          <p className="text-gray-400">
            Complete control over rankings, competitions, achievements, and user performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            {mockLeaderboardAnalytics.activeUsers.toLocaleString()} Active Users
          </Badge>
          <Button variant="outline" className="border-yellow-500 text-yellow-400">
            <Trophy className="w-4 h-4 mr-2" />
            Competition Center
          </Button>
        </div>
      </div>

      {/* Leaderboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Total Users</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {mockLeaderboardAnalytics.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Users</p>
                <p className="text-2xl font-bold text-green-400">
                  {mockLeaderboardAnalytics.activeUsers.toLocaleString()}
                </p>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Avg Points</p>
                <p className="text-2xl font-bold text-blue-400">
                  {mockLeaderboardAnalytics.averagePoints.toLocaleString()}
                </p>
              </div>
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">Flagged Users</p>
                <p className="text-2xl font-bold text-red-400">
                  {mockLeaderboardAnalytics.flaggedUsers}
                </p>
              </div>
              <Flag className="w-6 h-6 text-red-400" />
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
                <p className="text-sm text-orange-300">Achievements</p>
                <p className="text-2xl font-bold text-orange-400">{mockAchievements.length}</p>
              </div>
              <Award className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Rankings
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Competitions
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Fraud Detection
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Rankings Management */}
        <TabsContent value="rankings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">User Rankings Management</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Rankings
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockLeaderboardUsers.map((user) => (
              <Card key={user.id} className={`${
                user.status === 'flagged' 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* User Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500">
                          <span className="text-lg font-bold text-yellow-400">#{user.rank}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{user.displayName}</h4>
                            {user.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">@{user.username}</div>
                          <Badge className={`text-xs ${
                            user.level === 'Diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                            user.level === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.level}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white ml-2">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Points:</span>
                          <span className="text-yellow-400 ml-2 font-semibold">
                            {user.points.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Joined:</span>
                          <span className="text-white ml-2">
                            {new Date(user.joinedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Performance Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className={`font-semibold ${
                            user.performance.winRate > 95 ? 'text-red-400' :
                            user.performance.winRate > 80 ? 'text-green-400' :
                            user.performance.winRate > 60 ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {user.performance.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Factor:</span>
                          <span className={`font-semibold ${
                            user.performance.profitFactor > 10 ? 'text-red-400' :
                            user.performance.profitFactor > 2 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {user.performance.profitFactor}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Return:</span>
                          <span className={`font-semibold ${
                            user.performance.monthlyReturn > 200 ? 'text-red-400' :
                            user.performance.monthlyReturn > 20 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            +{user.performance.monthlyReturn}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Trades:</span>
                          <span className={`font-semibold ${
                            user.performance.totalTrades < 100 && user.performance.winRate > 90 
                              ? 'text-red-400' : 'text-white'
                          }`}>
                            {user.performance.totalTrades}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flags & Status */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-white mb-3">Status & Flags</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Performance:</span>
                            <Badge variant={user.performanceValidated ? 'default' : 'destructive'}>
                              {user.performanceValidated ? 'Verified' : 'Unverified'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Suspicious:</span>
                            <Badge variant={user.suspiciousActivity ? 'destructive' : 'default'}>
                              {user.suspiciousActivity ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Security Flags */}
                      {user.flags.length > 0 && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                          <h6 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Security Flags
                          </h6>
                          <div className="space-y-1">
                            {user.flags.map((flag, i) => (
                              <Badge key={i} variant="destructive" className="text-xs mr-1">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      <div>
                        <h6 className="text-white font-semibold mb-2">Achievements</h6>
                        <div className="flex flex-wrap gap-1">
                          {user.achievements.length > 0 ? (
                            user.achievements.map((achievement, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {achievement}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No achievements</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Manual Rank Adjustment</label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="New rank"
                            className="bg-gray-800 border-gray-600 text-sm"
                          />
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleValidatePerformance(user.id)}
                          disabled={user.performanceValidated}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          {user.performanceValidated ? 'Performance Verified' : 'Validate Performance'}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Profile
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact User
                        </Button>
                        
                        {user.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Suspend User
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reinstate User
                          </Button>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-blue-400 font-semibold">{user.achievements.length}</div>
                            <div className="text-gray-400">Achievements</div>
                          </div>
                          <div>
                            <div className="text-green-400 font-semibold">{user.performance.streak}</div>
                            <div className="text-gray-400">Streak</div>
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

        {/* Competition Management */}
        <TabsContent value="competitions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Competition Management</h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Competition
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Competition Rules
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {mockCompetitions.map((comp) => (
              <Card key={comp.id} className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Competition Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-white mb-2">{comp.name}</h4>
                          <p className="text-gray-300 mb-3">{comp.description}</p>
                        </div>
                        <Badge variant={comp.status === 'active' ? 'default' : 'secondary'}>
                          {comp.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2 capitalize">{comp.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Prize Pool:</span>
                          <span className="text-green-400 ml-2 font-semibold">
                            ${comp.prizePool.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white ml-2">
                            {comp.participants.toLocaleString()} / {comp.maxParticipants.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white ml-2">
                            {new Date(comp.startDate).toLocaleDateString()} - {new Date(comp.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-semibold text-white mb-2">Eligibility Requirements</h5>
                        <div className="flex flex-wrap gap-2">
                          {comp.eligibility.map((req, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-semibold text-white mb-2">Categories</h5>
                        <div className="flex flex-wrap gap-2">
                          {comp.categories.map((category, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-purple-500 text-purple-400">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Leaderboard
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Competition
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Participants
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Manage Prizes
                      </Button>
                      
                      {comp.status === 'active' && (
                        <Button size="sm" variant="destructive" className="w-full">
                          <XCircle className="w-4 h-4 mr-2" />
                          End Competition
                        </Button>
                      )}

                      {/* Competition Stats */}
                      <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700">
                        <h6 className="text-purple-400 font-semibold mb-2">Quick Stats</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-white font-semibold">{comp.participants}</div>
                            <div className="text-gray-400">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-semibold">${comp.prizePool.toLocaleString()}</div>
                            <div className="text-gray-400">Prize Pool</div>
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

        {/* Achievement Management */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Achievement System Management</h3>
            <div className="flex gap-2">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Achievement
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Achievement Rules
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {mockAchievements.map((achievement) => (
              <Card key={achievement.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Achievement Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {achievement.name}
                          </h4>
                          <p className="text-gray-300 mb-3">{achievement.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <Badge className={`${
                              achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                              achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {achievement.rarity}
                            </Badge>
                            <Badge variant="outline" className="border-orange-500 text-orange-400">
                              {achievement.category}
                            </Badge>
                            <span className="text-gray-400">
                              {achievement.points.toLocaleString()} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3">Statistics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Recipients:</span>
                          <span className="text-white font-semibold">{achievement.recipients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge variant={achievement.active ? 'default' : 'secondary'}>
                            {achievement.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-gray-400 text-sm">Criteria:</span>
                        <p className="text-white text-sm mt-1">{achievement.criteria}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Achievement
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        View Recipients
                      </Button>
                      
                      <Button size="sm" variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Award Manually
                      </Button>
                      
                      <div className="flex items-center gap-2 p-2">
                        <Switch 
                          checked={achievement.active} 
                          id={`achievement-${achievement.id}`}
                        />
                        <label htmlFor={`achievement-${achievement.id}`} className="text-sm text-gray-400">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fraud Detection */}
        <TabsContent value="fraud" className="space-y-6">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Fraud Detection System</h3>
            <p className="text-gray-400 mb-6">
              AI-powered fraud detection and performance validation for leaderboard integrity
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-red-400">234</div>
                <div className="text-sm text-gray-400">Flagged Users</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-yellow-400">12</div>
                <div className="text-sm text-gray-400">Pending Reviews</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-400">98.7%</div>
                <div className="text-sm text-gray-400">Detection Accuracy</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-400">89</div>
                <div className="text-sm text-gray-400">Resolved Cases</div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Leaderboard Settings</h3>
            <p className="text-gray-400 mb-6">
              Configure point systems, ranking algorithms, and leaderboard rules
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span>Point System</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <Clock className="w-8 h-8 text-blue-400" />
                <span>Update Frequency</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                <Shield className="w-8 h-8 text-green-400" />
                <span>Security Rules</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Leaderboard Analytics</h3>
            <p className="text-gray-400 mb-6">
              Comprehensive insights into user engagement, competition performance, and system health
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-green-400">{mockLeaderboardAnalytics.engagement.dailyActive.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Daily Active</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-blue-400">{mockLeaderboardAnalytics.competitionParticipation}%</div>
                <div className="text-sm text-gray-400">Competition Rate</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-purple-400">{mockLeaderboardAnalytics.achievementDistribution.epic}</div>
                <div className="text-sm text-gray-400">Epic Achievements</div>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700 p-4">
                <div className="text-2xl font-bold text-yellow-400">{mockLeaderboardAnalytics.topUserPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Highest Score</div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Competition Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Competition</DialogTitle>
            <DialogDescription>
              Set up a new trading competition with custom rules and prizes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">Competition Name</label>
                <Input placeholder="e.g., Spring Trading Challenge" className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-white">Type</label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="season">Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white">Description</label>
              <Textarea placeholder="Describe the competition..." className="bg-gray-800 border-gray-600" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">Prize Pool ($)</label>
                <Input type="number" placeholder="25000" className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-white">Max Participants</label>
                <Input type="number" placeholder="1000" className="bg-gray-800 border-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white">Start Date</label>
                <Input type="datetime-local" className="bg-gray-800 border-gray-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-white">End Date</label>
                <Input type="datetime-local" className="bg-gray-800 border-gray-600" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateCompetition({})}>
                <Trophy className="w-4 h-4 mr-2" />
                Create Competition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
