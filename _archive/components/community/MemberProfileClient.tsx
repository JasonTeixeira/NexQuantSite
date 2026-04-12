"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  User,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Share2,
  MessageSquare,
  Trophy,
  Target,
  Zap,
  BarChart3,
  Clock,
  Star,
  Award,
  Crown,
  Shield,
  Flame,
  CheckCircle,
  UserPlus,
  UserMinus,
  ExternalLink,
  Copy,
  Flag,
  MoreHorizontal,
  Activity,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Eye,
  ThumbsUp,
  Send
} from "lucide-react"

interface MemberProfileClientProps {
  username: string
}

// Mock data - in real app, this would come from your API
const mockMemberData = {
  alex_trader: {
    id: 'alex_trader',
    name: 'Alex Thompson',
    username: 'alex_trader',
    avatar: '',
    verified: true,
    bio: 'Full-time algorithmic trader specializing in crypto and forex markets. 8+ years experience in quantitative finance. Always learning, always sharing.',
    location: 'New York, NY',
    joinDate: '2022-03-15',
    website: 'https://alextrading.com',
    followers: 2847,
    following: 156,
    rank: 12,
    level: 'Expert',
    reputation: 4.8,
    stats: {
      totalTrades: 1247,
      winRate: 73.2,
      totalPnL: 125670.50,
      bestStreak: 23,
      avgReturn: 2.4,
      sharpeRatio: 1.67,
      maxDrawdown: -8.5,
      activeStrategies: 7
    },
    achievements: [
      { id: 'top_trader', name: 'Top 1% Trader', icon: Crown, color: 'text-amber-400', rare: true },
      { id: 'consistent', name: 'Consistent Performer', icon: Target, color: 'text-green-400', rare: false },
      { id: 'mentor', name: 'Community Mentor', icon: Users, color: 'text-blue-400', rare: false },
      { id: 'innovator', name: 'Strategy Innovator', icon: Zap, color: 'text-purple-400', rare: true },
      { id: 'verified', name: 'Verified Trader', icon: CheckCircle, color: 'text-cyan-400', rare: false }
    ],
    recentActivity: [
      {
        id: 1,
        type: 'trade',
        content: 'Closed BTC/USD position with +12.3% return',
        timestamp: '2024-01-15T10:30:00Z',
        likes: 24,
        comments: 8,
        performance: '+12.3%'
      },
      {
        id: 2,
        type: 'strategy',
        content: 'Shared new RSI divergence strategy for altcoins',
        timestamp: '2024-01-14T15:45:00Z',
        likes: 67,
        comments: 23,
        shares: 12
      },
      {
        id: 3,
        type: 'insight',
        content: 'Market analysis: Strong bullish momentum in tech stocks this week',
        timestamp: '2024-01-13T09:15:00Z',
        likes: 89,
        comments: 34,
        shares: 28
      },
      {
        id: 4,
        type: 'achievement',
        content: 'Earned "Consistent Performer" badge for 90-day winning streak',
        timestamp: '2024-01-12T14:20:00Z',
        likes: 156,
        comments: 42
      }
    ],
    portfolioPerformance: {
      daily: [2.1, 1.8, -0.5, 3.2, 1.9, 2.7, -1.2],
      monthly: [12.4, 8.9, 15.2, 9.7, 11.3, 7.8, 13.9, 10.1, 9.6, 14.2, 8.7, 11.5],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  },
  sarah_crypto: {
    id: 'sarah_crypto',
    name: 'Sarah Chen',
    username: 'sarah_crypto',
    avatar: '',
    verified: true,
    bio: 'Crypto specialist and DeFi researcher. Building the future of decentralized finance.',
    location: 'San Francisco, CA',
    joinDate: '2021-11-08',
    website: 'https://sarahcrypto.io',
    followers: 1893,
    following: 243,
    rank: 27,
    level: 'Advanced',
    reputation: 4.6,
    stats: {
      totalTrades: 892,
      winRate: 68.9,
      totalPnL: 89340.75,
      bestStreak: 18,
      avgReturn: 3.1,
      sharpeRatio: 1.45,
      maxDrawdown: -12.1,
      activeStrategies: 5
    },
    achievements: [
      { id: 'crypto_expert', name: 'Crypto Expert', icon: Star, color: 'text-amber-400', rare: true },
      { id: 'defi_pioneer', name: 'DeFi Pioneer', icon: Flame, color: 'text-orange-400', rare: true },
      { id: 'educator', name: 'Community Educator', icon: Users, color: 'text-blue-400', rare: false }
    ],
    recentActivity: [],
    portfolioPerformance: {
      daily: [],
      monthly: [],
      labels: []
    }
  }
}

export default function MemberProfileClient({ username }: MemberProfileClientProps) {
  const [member, setMember] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const memberData = mockMemberData[username as keyof typeof mockMemberData]
      setMember(memberData || null)
      setLoading(false)
    }, 500)
  }, [username])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // In real app, make API call to follow/unfollow
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return BarChart3
      case 'strategy': return Target
      case 'insight': return MessageSquare
      case 'achievement': return Trophy
      default: return Activity
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Member Not Found</h1>
          <p className="text-gray-400 mb-6">This member profile doesn't exist or has been removed.</p>
          <Button asChild>
            <a href="/members">Browse Members</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-2xl bg-cyan-600">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{member.name}</span>
                    {member.verified && (
                      <CheckCircle className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  
                  <div className="text-gray-400 text-lg mb-4">@{member.username}</div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Badge className="bg-amber-600">{member.level}</Badge>
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-300">Rank #{member.rank}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-300">{member.reputation}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full lg:w-auto">
                    <Button
                      onClick={handleFollow}
                      className={`flex-1 lg:flex-none ${
                        isFollowing 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-cyan-600 hover:bg-cyan-700'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <p className="text-gray-300 text-lg mb-6">{member.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{member.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Joined {formatDate(member.joinDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a href={member.website} className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        {member.website.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Last active: 2h ago</span>
                    </div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatNumber(member.followers)}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatNumber(member.following)}</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{formatNumber(member.stats.totalTrades)}</div>
                      <div className="text-sm text-gray-400">Total Trades</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-green-400">
                        {member.stats.winRate}%
                      </div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-cyan-400">
                        ${formatNumber(member.stats.totalPnL)}
                      </div>
                      <div className="text-xs text-gray-400">Total P&L</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-blue-400">
                        {member.stats.bestStreak}
                      </div>
                      <div className="text-xs text-gray-400">Best Streak</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-purple-400">
                        {member.stats.sharpeRatio}
                      </div>
                      <div className="text-xs text-gray-400">Sharpe Ratio</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {member.achievements.map((achievement: any) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${
                        achievement.rare 
                          ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700' 
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${achievement.color}`} />
                      <div>
                        <div className={`font-semibold ${achievement.rare ? 'text-amber-400' : 'text-white'}`}>
                          {achievement.name}
                        </div>
                        {achievement.rare && (
                          <Badge className="bg-amber-600 text-xs mt-1">Rare</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest trades, insights, and community interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {member.recentActivity.map((activity: any) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white mb-2">{activity.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{getTimeAgo(activity.timestamp)}</span>
                              {activity.performance && (
                                <Badge className="bg-green-600 text-xs">
                                  {activity.performance}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-2 text-gray-400 hover:text-red-400 cursor-pointer">
                                <Heart className="w-4 h-4" />
                                <span>{activity.likes}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 hover:text-blue-400 cursor-pointer">
                                <MessageSquare className="w-4 h-4" />
                                <span>{activity.comments}</span>
                              </div>
                              {activity.shares && (
                                <div className="flex items-center gap-2 text-gray-400 hover:text-green-400 cursor-pointer">
                                  <Share2 className="w-4 h-4" />
                                  <span>{activity.shares}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total P&L</span>
                      <span className="text-xl font-bold text-green-400">
                        ${member.stats.totalPnL.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-xl font-bold text-cyan-400">{member.stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Return</span>
                      <span className="text-xl font-bold text-blue-400">{member.stats.avgReturn}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Drawdown</span>
                      <span className="text-xl font-bold text-red-400">{member.stats.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Sharpe Ratio</span>
                      <span className="text-xl font-bold text-purple-400">{member.stats.sharpeRatio}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Trading Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Trades</span>
                      <span className="text-xl font-bold text-white">{member.stats.totalTrades}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Best Streak</span>
                      <span className="text-xl font-bold text-green-400">{member.stats.bestStreak}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Active Strategies</span>
                      <span className="text-xl font-bold text-cyan-400">{member.stats.activeStrategies}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Risk Level</span>
                      <Badge className="bg-amber-600">Moderate</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Shared Strategies</CardTitle>
                  <CardDescription>Trading strategies shared by this member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Public Strategies</h3>
                    <p className="text-gray-400">This member hasn't shared any strategies yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Detailed Statistics</CardTitle>
                  <CardDescription>Comprehensive trading performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{member.stats.totalTrades}</div>
                      <div className="text-sm text-gray-400">Total Trades</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{member.stats.winRate}%</div>
                      <div className="text-sm text-gray-400">Win Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">${formatNumber(member.stats.totalPnL)}</div>
                      <div className="text-sm text-gray-400">Total P&L</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{member.stats.bestStreak}</div>
                      <div className="text-sm text-gray-400">Best Streak</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Percent className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{member.stats.avgReturn}%</div>
                      <div className="text-sm text-gray-400">Avg Return</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800 rounded-lg">
                      <Activity className="w-8 h-8 text-red-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{member.stats.sharpeRatio}</div>
                      <div className="text-sm text-gray-400">Sharpe Ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}


