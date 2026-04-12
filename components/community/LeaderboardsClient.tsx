"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  Star,
  Flame,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Filter,
  Clock,
  Award,
  Activity,
  Percent,
  MessageSquare,
  UserPlus
} from "lucide-react"

interface LeaderboardEntry {
  rank: number
  previousRank: number
  userId: string
  username: string
  name: string
  avatar: string
  verified: boolean
  level: string
  value: number
  change: number
  streak: number
  badges: string[]
  isCurrentUser?: boolean
}

// Mock leaderboard data
const mockLeaderboards = {
  overall: [
    {
      rank: 1, previousRank: 1, userId: 'alex_trader', username: 'alex_trader', name: 'Alex Thompson',
      avatar: '', verified: true, level: 'Expert', value: 95.8, change: 0, streak: 23,
      badges: ['top_trader', 'consistent'], isCurrentUser: false
    },
    {
      rank: 2, previousRank: 3, userId: 'emma_algo', username: 'emma_algo', name: 'Emma Johnson',
      avatar: '', verified: true, level: 'Expert', value: 94.2, change: 1, streak: 18,
      badges: ['algo_expert', 'mentor'], isCurrentUser: false
    },
    {
      rank: 3, previousRank: 2, userId: 'sarah_crypto', username: 'sarah_crypto', name: 'Sarah Chen',
      avatar: '', verified: true, level: 'Advanced', value: 92.7, change: -1, streak: 15,
      badges: ['crypto_expert', 'defi_pioneer'], isCurrentUser: false
    },
    {
      rank: 4, previousRank: 5, userId: 'mike_quant', username: 'mike_quant', name: 'Michael Rodriguez',
      avatar: '', verified: false, level: 'Intermediate', value: 89.3, change: 1, streak: 12,
      badges: ['quant_researcher'], isCurrentUser: false
    },
    {
      rank: 5, previousRank: 4, userId: 'david_fx', username: 'david_fx', name: 'David Kim',
      avatar: '', verified: false, level: 'Beginner', value: 87.9, change: -1, streak: 8,
      badges: ['fx_trader'], isCurrentUser: true
    }
  ],
  pnl: [
    {
      rank: 1, previousRank: 1, userId: 'alex_trader', username: 'alex_trader', name: 'Alex Thompson',
      avatar: '', verified: true, level: 'Expert', value: 125670.50, change: 0, streak: 23,
      badges: ['top_trader'], isCurrentUser: false
    },
    {
      rank: 2, previousRank: 2, userId: 'emma_algo', username: 'emma_algo', name: 'Emma Johnson',
      avatar: '', verified: true, level: 'Expert', value: 98750.80, change: 0, streak: 18,
      badges: ['algo_expert'], isCurrentUser: false
    },
    {
      rank: 3, previousRank: 3, userId: 'sarah_crypto', username: 'sarah_crypto', name: 'Sarah Chen',
      avatar: '', verified: true, level: 'Advanced', value: 89340.75, change: 0, streak: 15,
      badges: ['crypto_expert'], isCurrentUser: false
    }
  ],
  winrate: [
    {
      rank: 1, previousRank: 1, userId: 'alex_trader', username: 'alex_trader', name: 'Alex Thompson',
      avatar: '', verified: true, level: 'Expert', value: 73.2, change: 0, streak: 23,
      badges: ['consistent'], isCurrentUser: false
    },
    {
      rank: 2, previousRank: 2, userId: 'emma_algo', username: 'emma_algo', name: 'Emma Johnson',
      avatar: '', verified: true, level: 'Expert', value: 71.8, change: 0, streak: 18,
      badges: ['algo_expert'], isCurrentUser: false
    }
  ],
  streak: [
    {
      rank: 1, previousRank: 1, userId: 'alex_trader', username: 'alex_trader', name: 'Alex Thompson',
      avatar: '', verified: true, level: 'Expert', value: 23, change: 0, streak: 23,
      badges: ['consistent'], isCurrentUser: false
    }
  ]
}

const timeframes = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'quarterly', label: 'This Quarter' },
  { value: 'yearly', label: 'This Year' },
  { value: 'alltime', label: 'All Time' }
]

export default function LeaderboardsClient() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly')
  const [selectedCategory, setSelectedCategory] = useState('overall')

  const getCurrentLeaderboard = () => {
    return mockLeaderboards[selectedCategory as keyof typeof mockLeaderboards] || []
  }

  const formatValue = (value: number, category: string) => {
    switch (category) {
      case 'pnl':
        return `$${value.toLocaleString()}`
      case 'winrate':
        return `${value}%`
      case 'streak':
        return `${value} wins`
      case 'overall':
        return `${value}/100`
      default:
        return value.toString()
    }
  }

  const getValueLabel = (category: string) => {
    switch (category) {
      case 'pnl': return 'Total P&L'
      case 'winrate': return 'Win Rate'
      case 'streak': return 'Current Streak'
      case 'overall': return 'Overall Score'
      default: return 'Value'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-amber-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const leaderboard = getCurrentLeaderboard()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-amber-600">Competition</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Trading <span className="text-amber-400">Leaderboards</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Compete with the best traders worldwide. Track performance, climb the ranks, and showcase your trading skills.
          </p>
        </motion.div>

        {/* Competition Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1,247</div>
              <div className="text-sm text-gray-400">Competitors</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-gray-400">Active Streaks</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">$2.1M</div>
              <div className="text-sm text-gray-400">Total Profits</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">347</div>
              <div className="text-sm text-gray-400">Active Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>
              
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      {timeframe.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-400">
                Last updated: 2 minutes ago
              </div>

              <div className="ml-auto">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Trophy className="w-4 h-4 mr-2" />
                  Join Competition
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overall" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Overall
            </TabsTrigger>
            <TabsTrigger value="pnl" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Profit & Loss
            </TabsTrigger>
            <TabsTrigger value="winrate" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Win Rate
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Win Streak
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Leaderboard
                  </div>
                  <Badge>{timeframes.find(t => t.value === selectedTimeframe)?.label}</Badge>
                </CardTitle>
                <CardDescription>
                  Top performers ranked by {getValueLabel(selectedCategory).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-cyan-600 ${
                        entry.isCurrentUser 
                          ? 'bg-cyan-900/20 border-cyan-700' 
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Rank Change */}
                      <div className="flex items-center gap-1">
                        {getChangeIcon(entry.change)}
                        <span className={`text-sm ${getChangeColor(entry.change)}`}>
                          {Math.abs(entry.change) || '-'}
                        </span>
                      </div>

                      {/* Avatar & Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={entry.avatar} alt={entry.name} />
                          <AvatarFallback className="bg-cyan-600">
                            {entry.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/member/${entry.username}`}
                              className="font-semibold text-white hover:text-cyan-400 transition-colors"
                            >
                              {entry.name}
                            </Link>
                            {entry.verified && (
                              <CheckCircle className="w-4 h-4 text-cyan-400" />
                            )}
                            {entry.isCurrentUser && (
                              <Badge className="bg-cyan-600 text-xs">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">@{entry.username}</span>
                            <Badge variant="outline" className="text-xs">
                              {entry.level}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {formatValue(entry.value, selectedCategory)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getValueLabel(selectedCategory)}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span className="font-bold">{entry.streak}</span>
                        </div>
                        <div className="text-xs text-gray-400">streak</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/member/${entry.username}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {!entry.isCurrentUser && (
                          <>
                            <Button size="sm" variant="outline">
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-6">
                  <Button variant="outline">
                    Load More Rankings
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Showing top {leaderboard.length} of 1,247 traders
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Competition Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Current Competitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-amber-400">Monthly Masters</h4>
                    <Badge className="bg-amber-600">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Compete for the highest monthly returns. Winner gets $10,000 prize!
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Ends in 12 days</span>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      Join Now
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Consistency Challenge</h4>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    30-day challenge focusing on consistent daily profits.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Starts in 5 days</span>
                    <Button size="sm" variant="outline">
                      Get Notified
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Hall of Fame
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <div>
                    <div className="font-semibold text-white">Alex Thompson</div>
                    <div className="text-sm text-gray-400">2023 Overall Champion</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-amber-400">+847%</div>
                    <div className="text-xs text-gray-400">Annual Return</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <Medal className="w-8 h-8 text-gray-300" />
                  <div>
                    <div className="font-semibold text-white">Sarah Chen</div>
                    <div className="text-sm text-gray-400">Q4 2023 Crypto Leader</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-green-400">+234%</div>
                    <div className="text-xs text-gray-400">Quarterly Return</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <Medal className="w-8 h-8 text-amber-600" />
                  <div>
                    <div className="font-semibold text-white">Emma Johnson</div>
                    <div className="text-sm text-gray-400">Consistency Record Holder</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-blue-400">127 days</div>
                    <div className="text-xs text-gray-400">Win Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


