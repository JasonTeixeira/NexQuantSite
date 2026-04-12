"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  Flame,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3,
  Percent,
  Timer,
  Gift,
  Sparkles,
  Eye,
  ExternalLink,
  Share2,
  Copy,
  MessageSquare,
  Heart,
  ThumbsUp
} from "lucide-react"

// Mock leaderboard data
const mockLeaderboardData = {
  allTime: [
    {
      rank: 1,
      previousRank: 1,
      name: "Sarah Martinez",
      username: "crypto_sarah",
      avatar: "",
      tier: "Diamond",
      totalReferrals: 234,
      totalEarnings: 89560.75,
      monthlyGrowth: 23.5,
      joinDate: "2023-01-15",
      isVerified: true,
      badges: ["Top Performer", "Diamond Elite", "Growth Champion"]
    },
    {
      rank: 2,
      previousRank: 3,
      name: "David Kim",
      username: "trading_david", 
      avatar: "",
      tier: "Platinum",
      totalReferrals: 187,
      totalEarnings: 67890.30,
      monthlyGrowth: 34.2,
      joinDate: "2023-02-20",
      isVerified: true,
      badges: ["Fast Riser", "Platinum Pro"]
    },
    {
      rank: 3,
      previousRank: 2,
      name: "Emma Rodriguez",
      username: "fintech_emma",
      avatar: "",
      tier: "Gold",
      totalReferrals: 156,
      totalEarnings: 52340.60,
      monthlyGrowth: 15.8,
      joinDate: "2023-03-10",
      isVerified: true,
      badges: ["Consistent Growth", "Gold Member"]
    },
    {
      rank: 4,
      previousRank: 5,
      name: "Alex Chen",
      username: "alex_affiliate",
      avatar: "",
      tier: "Gold",
      totalReferrals: 143,
      totalEarnings: 48920.45,
      monthlyGrowth: 28.1,
      joinDate: "2023-04-05",
      isVerified: false,
      badges: ["Rising Star"]
    },
    {
      rank: 5,
      previousRank: 4,
      name: "Maria Silva",
      username: "maria_crypto",
      avatar: "",
      tier: "Silver",
      totalReferrals: 128,
      totalEarnings: 42150.80,
      monthlyGrowth: 19.7,
      joinDate: "2023-05-12",
      isVerified: true,
      badges: ["Community Leader"]
    },
    {
      rank: 6,
      previousRank: 7,
      name: "James Wilson",
      username: "james_trader",
      avatar: "",
      tier: "Silver",
      totalReferrals: 115,
      totalEarnings: 38760.25,
      monthlyGrowth: 31.4,
      joinDate: "2023-06-18",
      isVerified: false,
      badges: ["Fast Growth"]
    },
    {
      rank: 7,
      previousRank: 6,
      name: "Lisa Zhang",
      username: "lisa_quant",
      avatar: "",
      tier: "Silver",
      totalReferrals: 102,
      totalEarnings: 34590.15,
      monthlyGrowth: 12.3,
      joinDate: "2023-07-25",
      isVerified: true,
      badges: ["Silver Elite"]
    },
    {
      rank: 8,
      previousRank: 9,
      name: "Ryan Thompson",
      username: "ryan_ref",
      avatar: "",
      tier: "Bronze",
      totalReferrals: 89,
      totalEarnings: 29340.90,
      monthlyGrowth: 42.1,
      joinDate: "2023-08-30",
      isVerified: false,
      badges: ["Newcomer Champion"]
    },
    {
      rank: 9,
      previousRank: 8,
      name: "Sophie Martin",
      username: "sophie_trades",
      avatar: "",
      tier: "Bronze",
      totalReferrals: 76,
      totalEarnings: 25780.50,
      monthlyGrowth: 18.9,
      joinDate: "2023-09-14",
      isVerified: true,
      badges: ["Steady Growth"]
    },
    {
      rank: 10,
      previousRank: 10,
      name: "Michael Brown",
      username: "mike_affiliate",
      avatar: "",
      tier: "Bronze",
      totalReferrals: 67,
      totalEarnings: 22150.35,
      monthlyGrowth: 26.7,
      joinDate: "2023-10-08",
      isVerified: false,
      badges: ["Rising Talent"]
    }
  ],
  monthly: [
    {
      rank: 1,
      name: "Ryan Thompson",
      username: "ryan_ref",
      monthlyReferrals: 23,
      monthlyEarnings: 5670.25,
      growth: 42.1
    },
    {
      rank: 2,
      name: "David Kim", 
      username: "trading_david",
      monthlyReferrals: 19,
      monthlyEarnings: 4890.80,
      growth: 34.2
    },
    {
      rank: 3,
      name: "James Wilson",
      username: "james_trader", 
      monthlyReferrals: 15,
      monthlyEarnings: 3920.45,
      growth: 31.4
    }
  ]
}

const timeframes = [
  { value: 'allTime', label: 'All Time' },
  { value: 'yearly', label: 'This Year' },
  { value: 'monthly', label: 'This Month' },
  { value: 'weekly', label: 'This Week' }
]

export default function ReferralLeaderboardClient() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('allTime')
  const [selectedCategory, setSelectedCategory] = useState('earnings')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-amber-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  const getChangeIcon = (current: number, previous: number) => {
    if (current < previous) return <ArrowUp className="w-4 h-4 text-green-400" />
    if (current > previous) return <ArrowDown className="w-4 h-4 text-red-400" />
    return <div className="w-4 h-4" />
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return 'text-cyan-400'
      case 'platinum': return 'text-purple-400'
      case 'gold': return 'text-amber-400'
      case 'silver': return 'text-gray-300'
      case 'bronze': return 'text-amber-600'
      default: return 'text-gray-400'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return 'bg-cyan-600'
      case 'platinum': return 'bg-purple-600'
      case 'gold': return 'bg-amber-600'
      case 'silver': return 'bg-gray-600'
      case 'bronze': return 'bg-amber-700'
      default: return 'bg-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const leaderboardData = mockLeaderboardData[selectedTimeframe as keyof typeof mockLeaderboardData] || mockLeaderboardData.allTime

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
            Referral <span className="text-amber-400">Champions</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Celebrate our top-performing affiliates and see how you rank among the community's best referrers.
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Second Place */}
            <div className="order-1 md:order-1">
              <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-gray-600 text-center transform md:translate-y-8">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-gray-300">
                      <AvatarFallback className="bg-gray-600 text-xl">
                        {leaderboardData[1]?.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="w-8 h-8 text-gray-300" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{leaderboardData[1]?.name}</div>
                  <div className="text-gray-400 mb-3">@{leaderboardData[1]?.username}</div>
                  {'tier' in leaderboardData[1] && leaderboardData[1]?.tier && (
                    <Badge className={getTierBadgeColor(leaderboardData[1]?.tier)}>
                      {leaderboardData[1]?.tier}
                    </Badge>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="text-lg font-bold text-green-400">
                      ${('totalEarnings' in leaderboardData[1] 
                        ? leaderboardData[1]?.totalEarnings 
                        : leaderboardData[1]?.monthlyEarnings)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {('totalReferrals' in leaderboardData[1] 
                        ? leaderboardData[1]?.totalReferrals 
                        : leaderboardData[1]?.monthlyReferrals)} referrals
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* First Place */}
            <div className="order-2 md:order-2">
              <Card className="bg-gradient-to-b from-amber-900/30 to-orange-900/30 border-amber-600 text-center transform scale-110">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-amber-400">
                      <AvatarFallback className="bg-amber-600 text-2xl">
                        {leaderboardData[0]?.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-3 -right-3">
                      <Crown className="w-10 h-10 text-amber-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{leaderboardData[0]?.name}</div>
                  <div className="text-amber-400 mb-3">@{leaderboardData[0]?.username}</div>
                  <Badge className="bg-amber-600 text-black font-bold">👑 CHAMPION</Badge>
                  <div className="mt-4 space-y-2">
                    <div className="text-2xl font-bold text-green-400">
                      ${('totalEarnings' in leaderboardData[0] 
                        ? leaderboardData[0]?.totalEarnings 
                        : leaderboardData[0]?.monthlyEarnings)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-amber-400">
                      {('totalReferrals' in leaderboardData[0] 
                        ? leaderboardData[0]?.totalReferrals 
                        : leaderboardData[0]?.monthlyReferrals)} referrals
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Third Place */}
            <div className="order-3 md:order-3">
              <Card className="bg-gradient-to-b from-amber-900/20 to-orange-900/20 border-amber-700 text-center transform md:translate-y-8">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-amber-600">
                      <AvatarFallback className="bg-amber-700 text-xl">
                        {leaderboardData[2]?.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{leaderboardData[2]?.name}</div>
                  <div className="text-gray-400 mb-3">@{leaderboardData[2]?.username}</div>
                  {'tier' in leaderboardData[2] && leaderboardData[2]?.tier && (
                    <Badge className={getTierBadgeColor(leaderboardData[2]?.tier)}>
                      {leaderboardData[2]?.tier}
                    </Badge>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="text-lg font-bold text-green-400">
                      ${('totalEarnings' in leaderboardData[2] 
                        ? leaderboardData[2]?.totalEarnings 
                        : leaderboardData[2]?.monthlyEarnings)?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {('totalReferrals' in leaderboardData[2] 
                        ? leaderboardData[2]?.totalReferrals 
                        : leaderboardData[2]?.monthlyReferrals)} referrals
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Filters and Tabs */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-gray-800">
                <TabsTrigger value="earnings">Top Earners</TabsTrigger>
                <TabsTrigger value="referrals">Most Referrals</TabsTrigger>
                <TabsTrigger value="growth">Fastest Growth</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-4 items-center">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <Timer className="w-4 h-4 mr-2" />
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
              
              <Button className="bg-amber-600 hover:bg-amber-700 text-black font-bold">
                <Trophy className="w-4 h-4 mr-2" />
                Join Competition
              </Button>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Full Rankings
              </CardTitle>
              <CardDescription>
                Complete leaderboard showing all top performers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.slice(0, 10).map((user: any, index: number) => (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-6 p-6 rounded-lg transition-all hover:bg-gray-800 ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-amber-900/10 to-orange-900/10 border border-amber-800' : 'bg-gray-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Rank Change */}
                    <div className="flex items-center gap-2 w-12">
                      {getChangeIcon(user.rank, user.previousRank)}
                      <span className="text-xs text-gray-400">
                        {user.previousRank !== user.rank ? Math.abs(user.previousRank - user.rank) : ''}
                      </span>
                    </div>

                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-cyan-600 text-lg">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white text-lg">{user.name}</h3>
                          {user.isVerified && (
                            <CheckCircle className="w-5 h-5 text-cyan-400" />
                          )}
                          <Badge className={getTierBadgeColor(user.tier)}>
                            {user.tier}
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-sm">@{user.username}</div>
                        
                        {/* Badges */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {user.badges?.map((badge: string, badgeIndex: number) => (
                            <Badge key={badgeIndex} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-xl font-bold text-green-400">
                          ${user.totalEarnings.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Earnings</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-400">
                          {user.totalReferrals}
                        </div>
                        <div className="text-sm text-gray-400">Referrals</div>
                      </div>
                      <div>
                        <div className={`text-xl font-bold ${user.monthlyGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          +{user.monthlyGrowth}%
                        </div>
                        <div className="text-sm text-gray-400">Monthly Growth</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button variant="outline">
                  Load More Rankings
                </Button>
                <p className="text-sm text-gray-400 mt-4">
                  Showing top 10 of 5,000+ active affiliates
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">$2.1M+</div>
              <div className="text-sm text-gray-400">Total Paid Out</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">5,000+</div>
              <div className="text-sm text-gray-400">Active Affiliates</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">89,000+</div>
              <div className="text-sm text-gray-400">Total Referrals</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">$89K</div>
              <div className="text-sm text-gray-400">Top Monthly Earner</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-600">
            <CardContent className="p-8">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Climb the Leaderboard?
              </h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Join our referral program and start competing with the best affiliates. 
                Earn generous commissions and work your way up the rankings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-black font-bold">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Referring
                </Button>
                <Button size="lg" variant="outline">
                  <Eye className="w-5 h-5 mr-2" />
                  View Program Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function Rocket(props: any) {
  return <Zap {...props} />
}
