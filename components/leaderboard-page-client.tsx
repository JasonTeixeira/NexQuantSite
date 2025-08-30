"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus, Star, Users, Target, Zap, Award, Search, Filter, Calendar, BarChart3, DollarSign, Percent, Activity, Flag, Shield, ChevronUp, ChevronDown, Eye, Settings, Share2, Copy, ExternalLink } from 'lucide-react'
import { 
  LeaderboardUser, 
  LeaderboardStats, 
  Achievement,
  mockLeaderboardData, 
  mockLeaderboardStats, 
  mockAchievements,
  getRankChange,
  getLevelColor,
  getLevelBadgeColor
} from '@/lib/leaderboard-data'

interface LeaderboardFilters {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time'
  category: 'overall' | 'profit' | 'winrate' | 'volume'
  region: 'all' | 'us' | 'eu' | 'asia'
  level: 'all' | 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze'
}

export default function LeaderboardPageClient() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [stats, setStats] = useState<LeaderboardStats>(mockLeaderboardStats)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: 'all-time',
    category: 'overall',
    region: 'all',
    level: 'all'
  })

  // Mock current user data
  const currentUser = {
    id: 'current-user',
    rank: 156,
    previousRank: 189,
    points: 12450,
    level: 'Gold',
    username: 'your_username'
  }

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLeaderboardData(mockLeaderboardData)
      setIsLoading(false)
    }

    fetchLeaderboardData()
  }, [filters])

  const filteredData = leaderboardData.filter(user => {
    if (searchQuery && !user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filters.level !== 'all' && user.level.toLowerCase() !== filters.level) {
      return false
    }
    return true
  })

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>
  }

  const getRankChangeIcon = (user: LeaderboardUser) => {
    const change = getRankChange(user.rank, user.previousRank)
    switch (change) {
      case 'up':
        return <ChevronUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <ChevronDown className="w-4 h-4 text-red-400" />
      case 'new':
        return <Star className="w-4 h-4 text-blue-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const LeaderboardSkeleton = () => (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <Card key={i} className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Compete with the best traders worldwide. Climb the ranks and earn exclusive rewards.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/20 to-green-400/20 border-primary/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-1">
                {stats.totalParticipants.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Participants</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.averagePoints.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Average Points</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats.topPerformer}
              </div>
              <div className="text-gray-400 text-sm">Top Performer</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.mostImproved}
              </div>
              <div className="text-gray-400 text-sm">Most Improved</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current User Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-green-400/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border-2 border-primary">
                    <span className="text-2xl font-bold text-primary">#{currentUser.rank}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Your Current Rank</h3>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <span>{currentUser.points.toLocaleString()} points</span>
                      <span>•</span>
                      <Badge className={getLevelBadgeColor(currentUser.level)}>
                        {currentUser.level}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getRankChangeIcon({ 
                          rank: currentUser.rank, 
                          previousRank: currentUser.previousRank 
                        } as LeaderboardUser)}
                        <span className="text-sm">
                          {currentUser.previousRank && currentUser.previousRank > currentUser.rank 
                            ? `+${currentUser.previousRank - currentUser.rank}` 
                            : currentUser.previousRank && currentUser.previousRank < currentUser.rank
                            ? `-${currentUser.rank - currentUser.previousRank}`
                            : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">Next Level Progress</div>
                  <Progress value={65} className="w-32 h-2" />
                  <div className="text-xs text-gray-500 mt-1">2,550 points to Platinum</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  <Select 
                    value={filters.timeframe} 
                    onValueChange={(value: any) => setFilters({...filters, timeframe: value})}
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="all-time">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.category} 
                    onValueChange={(value: any) => setFilters({...filters, category: value})}
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="overall">Overall</SelectItem>
                      <SelectItem value="profit">Profit</SelectItem>
                      <SelectItem value="winrate">Win Rate</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.level} 
                    onValueChange={(value: any) => setFilters({...filters, level: value})}
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search traders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Top Traders - {filters.timeframe.charAt(0).toUpperCase() + filters.timeframe.slice(1).replace('-', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <LeaderboardSkeleton />
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredData.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                        user.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                      }`}
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserProfile(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div className="flex items-center space-x-2 min-w-[60px]">
                            {getRankIcon(user.rank)}
                            {getRankChangeIcon(user)}
                          </div>

                          {/* Avatar and Info */}
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12 border-2 border-primary/50">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black font-bold">
                                  {user.displayName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {user.verified && (
                                <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-400 bg-gray-900 rounded-full p-0.5" />
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-white">{user.displayName}</h3>
                                {user.badge && (
                                  <Badge className="bg-primary/20 text-primary text-xs">
                                    {user.badge}
                                  </Badge>
                                )}
                                <Badge className={`text-xs border ${getLevelBadgeColor(user.level)}`}>
                                  {user.level}
                                </Badge>
                                {user.country && user.privacy.showCountry && (
                                  <Flag className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>@{user.username}</span>
                                {user.privacy.showStats && (
                                  <>
                                    <span>•</span>
                                    <span>{user.winRate}% Win Rate</span>
                                    <span>•</span>
                                    <span>{user.profitFactor}x Profit Factor</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Points and Stats */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {user.points.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">points</div>
                          {user.streak > 0 && (
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-400">{user.streak} streak</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Achievement Badges */}
                      {user.achievements.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3 ml-20">
                          {user.achievements.slice(0, 3).map((achievementId) => {
                            const achievement = mockAchievements.find(a => a.id === achievementId)
                            if (!achievement) return null
                            return (
                              <div
                                key={achievementId}
                                className="flex items-center space-x-1 bg-gray-800/50 rounded-full px-2 py-1"
                                title={achievement.description}
                              >
                                <span className="text-xs">{achievement.icon}</span>
                                <span className="text-xs text-gray-400">{achievement.name}</span>
                              </div>
                            )
                          })}
                          {user.achievements.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{user.achievements.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Season Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Current Season: {stats.currentSeason}</h3>
                    <p className="text-gray-400">Season ends on {new Date(stats.seasonEnds).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">Season Progress</div>
                  <Progress value={75} className="w-32 h-2" />
                  <div className="text-xs text-gray-500 mt-1">25 days remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUserProfile && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-primary/50">
                        <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black font-bold text-2xl">
                          {selectedUser.displayName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.verified && (
                        <Shield className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-400 bg-gray-900 rounded-full p-1" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedUser.displayName}</h2>
                      <p className="text-gray-400">@{selectedUser.username}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`border ${getLevelBadgeColor(selectedUser.level)}`}>
                          {selectedUser.level}
                        </Badge>
                        {selectedUser.badge && (
                          <Badge className="bg-primary/20 text-primary">
                            {selectedUser.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserProfile(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                {/* Rank and Points */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">#{selectedUser.rank}</div>
                      <div className="text-sm text-gray-400">Global Rank</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {selectedUser.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Points</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trading Stats */}
                {selectedUser.privacy.showStats && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Trading Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{selectedUser.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{selectedUser.profitFactor}x</div>
                        <div className="text-xs text-gray-400">Profit Factor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">{selectedUser.monthlyReturn}%</div>
                        <div className="text-xs text-gray-400">Monthly Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{selectedUser.streak}</div>
                        <div className="text-xs text-gray-400">Current Streak</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedUser.achievements.map((achievementId) => {
                      const achievement = mockAchievements.find(a => a.id === achievementId)
                      if (!achievement) return null
                      return (
                        <div
                          key={achievementId}
                          className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <div className="font-medium text-white">{achievement.name}</div>
                            <div className="text-sm text-gray-400">{achievement.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Button className="bg-primary hover:bg-primary/90 text-black">
                    <Users className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-gray-300">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
