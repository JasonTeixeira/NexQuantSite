"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy,
  Crown,
  Star,
  Target,
  Zap,
  Users,
  BarChart3,
  DollarSign,
  MessageSquare,
  BookOpen,
  Calendar,
  Heart,
  Award,
  Lock,
  CheckCircle,
  TrendingUp,
  Gift,
  Sparkles,
  ArrowUp,
  Activity,
  Medal,
  Flame
} from "lucide-react"
import { ACHIEVEMENTS, getRarityColor, getRarityBadgeColor } from "@/lib/gamification/achievement-system"

interface UserAchievementData {
  unlockedAchievements: string[]
  points: number
  level: number
  stats: {
    trades: number
    winrate: number
    pnl: number
    streak: number
    followers: number
    posts: number
    likes: number
    days_active: number
    referrals: number
  }
  progress: Record<string, {
    current: number
    target: number
    percentage: number
  }>
}

// Mock user data
const mockUserData: UserAchievementData = {
  unlockedAchievements: ['first_trade', 'hundred_trades', 'first_post', 'popular_post', 'knowledge_seeker'],
  points: 2150,
  level: 8,
  stats: {
    trades: 247,
    winrate: 68.4,
    pnl: 45670.50,
    streak: 12,
    followers: 387,
    posts: 23,
    likes: 456,
    days_active: 89,
    referrals: 5
  },
  progress: {
    'profitable_month': { current: 0, target: 1, percentage: 75 },
    'high_winrate': { current: 68.4, target: 75, percentage: 91.2 },
    'influencer': { current: 387, target: 1000, percentage: 38.7 },
    'one_year': { current: 89, target: 365, percentage: 24.4 }
  }
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    'BarChart3': BarChart3,
    'Target': Target,
    'DollarSign': DollarSign,
    'Crown': Crown,
    'Trophy': Trophy,
    'MessageSquare': MessageSquare,
    'Heart': Heart,
    'Users': Users,
    'BookOpen': BookOpen,
    'Calendar': Calendar,
    'Star': Star
  }
  return icons[iconName] || Award
}

export default function AchievementsClient() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity
    return categoryMatch && rarityMatch
  })

  const unlockedAchievements = filteredAchievements.filter(a => 
    mockUserData.unlockedAchievements.includes(a.id)
  )

  const lockedAchievements = filteredAchievements.filter(a => 
    !mockUserData.unlockedAchievements.includes(a.id) && !a.isHidden
  )

  const nextLevelPoints = (mockUserData.level + 1) * 100
  const currentLevelPoints = mockUserData.level * 100
  const progressToNextLevel = ((mockUserData.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100

  const rarityStats = {
    common: unlockedAchievements.filter(a => a.rarity === 'common').length,
    uncommon: unlockedAchievements.filter(a => a.rarity === 'uncommon').length,
    rare: unlockedAchievements.filter(a => a.rarity === 'rare').length,
    epic: unlockedAchievements.filter(a => a.rarity === 'epic').length,
    legendary: unlockedAchievements.filter(a => a.rarity === 'legendary').length
  }

  const completionRate = (unlockedAchievements.length / ACHIEVEMENTS.filter(a => !a.isHidden).length) * 100

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-amber-600">Gamification</Badge>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-amber-400">Achievements</span> & Rewards
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Track your trading journey, unlock exclusive badges, and compete with fellow traders. Every milestone counts!
          </p>
        </motion.div>

        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Level & Progress */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">Level {mockUserData.level}</div>
                      <div className="text-amber-400">Trading Champion</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress to Level {mockUserData.level + 1}</span>
                      <span className="text-white">{Math.round(progressToNextLevel)}%</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                    <div className="text-xs text-gray-500">
                      {mockUserData.points - currentLevelPoints} / {nextLevelPoints - currentLevelPoints} XP
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">{mockUserData.points.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Points</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{unlockedAchievements.length}</div>
                    <div className="text-sm text-gray-400">Achievements</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{Math.round(completionRate)}%</div>
                    <div className="text-sm text-gray-400">Completion</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">#{Math.floor(Math.random() * 50) + 1}</div>
                    <div className="text-sm text-gray-400">Rank</div>
                  </div>
                </div>

                {/* Rarity Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Achievement Rarity</h3>
                  <div className="space-y-3">
                    {Object.entries(rarityStats).map(([rarity, count]) => (
                      <div key={rarity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getRarityBadgeColor(rarity).replace('bg-', 'bg-')}`} />
                          <span className={`capitalize ${getRarityColor(rarity)}`}>{rarity}</span>
                        </div>
                        <Badge className={getRarityBadgeColor(rarity)}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <TabsList className="grid grid-cols-5 bg-gray-800 flex-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>
            
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <TabsContent value={selectedCategory}>
            <div className="space-y-8">
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-white">Unlocked Achievements</h2>
                    <Badge className="bg-green-600">{unlockedAchievements.length}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unlockedAchievements.map((achievement, index) => {
                      const Icon = getIconComponent(achievement.icon)
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`bg-gradient-to-br ${achievement.rarity === 'legendary' ? 'from-amber-900/30 to-orange-900/30 border-amber-600' : achievement.rarity === 'epic' ? 'from-purple-900/30 to-pink-900/30 border-purple-600' : 'from-gray-900/50 to-gray-800/50 border-green-700'} hover:scale-105 transition-transform`}>
                            <CardContent className="p-6 text-center">
                              <div className="relative mb-4">
                                <div className={`w-16 h-16 ${achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-green-500 to-blue-500'} rounded-full flex items-center justify-center mx-auto`}>
                                  <Icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  <CheckCircle className="w-6 h-6 text-green-400 bg-black rounded-full" />
                                </div>
                              </div>
                              
                              <h3 className="text-lg font-bold text-white mb-2">{achievement.name}</h3>
                              <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
                              
                              <div className="flex justify-center gap-2 mb-4">
                                <Badge className={getRarityBadgeColor(achievement.rarity)}>
                                  {achievement.rarity}
                                </Badge>
                                <Badge className="bg-green-600">
                                  +{achievement.rewards?.points || 0} XP
                                </Badge>
                              </div>

                              {achievement.rewards?.title && (
                                <div className="text-sm text-amber-400 font-semibold">
                                  Title: "{achievement.rewards.title}"
                                </div>
                              )}

                              {achievement.rewards?.perks && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-500 mb-1">Perks:</div>
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {achievement.rewards.perks.map((perk, perkIndex) => (
                                      <Badge key={perkIndex} variant="outline" className="text-xs">
                                        {perk}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* In Progress Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">In Progress</h2>
                  <Badge className="bg-blue-600">{Object.keys(mockUserData.progress).length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(mockUserData.progress).map(([achievementId, progress]) => {
                    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
                    if (!achievement) return null
                    
                    const Icon = getIconComponent(achievement.icon)
                    return (
                      <Card key={achievementId} className="bg-gray-900/50 border-blue-700">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-2">{achievement.name}</h3>
                              <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Progress</span>
                                  <span className="text-white">{Math.round(progress.percentage)}%</span>
                                </div>
                                <Progress value={progress.percentage} className="h-2" />
                                <div className="text-xs text-gray-500">
                                  {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-4">
                                <Badge className={getRarityBadgeColor(achievement.rarity)}>
                                  {achievement.rarity}
                                </Badge>
                                <div className="text-sm text-gray-400">
                                  +{achievement.rewards?.points || 0} XP
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white">Locked Achievements</h2>
                    <Badge className="bg-gray-600">{lockedAchievements.length}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lockedAchievements.map((achievement, index) => {
                      const Icon = getIconComponent(achievement.icon)
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="bg-gray-900/30 border-gray-700 hover:border-gray-600 transition-colors">
                            <CardContent className="p-6 text-center">
                              <div className="relative mb-4">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                                  <Icon className="w-8 h-8 text-gray-500" />
                                </div>
                                <div className="absolute -bottom-1 -right-1">
                                  <Lock className="w-5 h-5 text-gray-400 bg-black rounded-full p-1" />
                                </div>
                              </div>
                              
                              <h3 className="text-lg font-bold text-gray-300 mb-2">{achievement.name}</h3>
                              <p className="text-sm text-gray-500 mb-4">{achievement.description}</p>
                              
                              <div className="flex justify-center gap-2 mb-4">
                                <Badge className={`${getRarityBadgeColor(achievement.rarity)} opacity-60`}>
                                  {achievement.rarity}
                                </Badge>
                                <Badge className="bg-gray-700">
                                  +{achievement.rewards?.points || 0} XP
                                </Badge>
                              </div>

                              <div className="text-xs text-gray-600">
                                Complete the requirements to unlock
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unlockedAchievements.slice(0, 3).map((achievement) => {
                  const Icon = getIconComponent(achievement.icon)
                  return (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{achievement.name}</div>
                        <div className="text-sm text-gray-400">Unlocked recently</div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRarityBadgeColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <div className="text-sm text-green-400 mt-1">
                          +{achievement.rewards?.points || 0} XP
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


