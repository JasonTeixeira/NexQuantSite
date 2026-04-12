"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Users,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  UserPlus,
  CheckCircle,
  Crown,
  Trophy,
  Target,
  Zap,
  Filter,
  SortAsc,
  Eye,
  MessageSquare,
  BarChart3,
  Flame,
  Award,
  Activity
} from "lucide-react"

interface Member {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  bio: string
  location: string
  joinDate: string
  level: string
  rank: number
  followers: number
  following: number
  reputation: number
  stats: {
    totalTrades: number
    winRate: number
    totalPnL: number
    sharpeRatio: number
  }
  badges: Array<{
    id: string
    name: string
    icon: any
    color: string
    rare: boolean
  }>
  isOnline: boolean
  lastActive: string
}

// Mock member data
const mockMembers: Member[] = [
  {
    id: 'alex_trader',
    name: 'Alex Thompson',
    username: 'alex_trader',
    avatar: '',
    verified: true,
    bio: 'Full-time algorithmic trader specializing in crypto and forex markets.',
    location: 'New York, NY',
    joinDate: '2022-03-15',
    level: 'Expert',
    rank: 12,
    followers: 2847,
    following: 156,
    reputation: 4.8,
    stats: {
      totalTrades: 1247,
      winRate: 73.2,
      totalPnL: 125670.50,
      sharpeRatio: 1.67
    },
    badges: [
      { id: 'top_trader', name: 'Top 1% Trader', icon: Crown, color: 'text-amber-400', rare: true },
      { id: 'consistent', name: 'Consistent Performer', icon: Target, color: 'text-green-400', rare: false }
    ],
    isOnline: true,
    lastActive: '2024-01-15T10:30:00Z'
  },
  {
    id: 'sarah_crypto',
    name: 'Sarah Chen',
    username: 'sarah_crypto',
    avatar: '',
    verified: true,
    bio: 'Crypto specialist and DeFi researcher. Building the future of decentralized finance.',
    location: 'San Francisco, CA',
    joinDate: '2021-11-08',
    level: 'Advanced',
    rank: 27,
    followers: 1893,
    following: 243,
    reputation: 4.6,
    stats: {
      totalTrades: 892,
      winRate: 68.9,
      totalPnL: 89340.75,
      sharpeRatio: 1.45
    },
    badges: [
      { id: 'crypto_expert', name: 'Crypto Expert', icon: Star, color: 'text-amber-400', rare: true },
      { id: 'defi_pioneer', name: 'DeFi Pioneer', icon: Flame, color: 'text-orange-400', rare: true }
    ],
    isOnline: false,
    lastActive: '2024-01-14T18:45:00Z'
  },
  {
    id: 'mike_quant',
    name: 'Michael Rodriguez',
    username: 'mike_quant',
    avatar: '',
    verified: false,
    bio: 'Quantitative researcher with focus on statistical arbitrage and machine learning.',
    location: 'Chicago, IL',
    joinDate: '2023-01-20',
    level: 'Intermediate',
    rank: 89,
    followers: 567,
    following: 892,
    reputation: 4.2,
    stats: {
      totalTrades: 445,
      winRate: 65.4,
      totalPnL: 34590.25,
      sharpeRatio: 1.23
    },
    badges: [
      { id: 'quant_researcher', name: 'Quant Researcher', icon: BarChart3, color: 'text-blue-400', rare: false }
    ],
    isOnline: true,
    lastActive: '2024-01-15T09:15:00Z'
  },
  {
    id: 'emma_algo',
    name: 'Emma Johnson',
    username: 'emma_algo',
    avatar: '',
    verified: true,
    bio: 'Algorithmic trading specialist. 10+ years in systematic trading strategies.',
    location: 'London, UK',
    joinDate: '2021-08-12',
    level: 'Expert',
    rank: 34,
    followers: 1234,
    following: 198,
    reputation: 4.7,
    stats: {
      totalTrades: 923,
      winRate: 71.8,
      totalPnL: 98750.80,
      sharpeRatio: 1.56
    },
    badges: [
      { id: 'algo_expert', name: 'Algorithm Expert', icon: Zap, color: 'text-purple-400', rare: true },
      { id: 'mentor', name: 'Community Mentor', icon: Users, color: 'text-blue-400', rare: false }
    ],
    isOnline: false,
    lastActive: '2024-01-15T07:20:00Z'
  },
  {
    id: 'david_fx',
    name: 'David Kim',
    username: 'david_fx',
    avatar: '',
    verified: false,
    bio: 'Forex trader focusing on major currency pairs. Learning algorithmic strategies.',
    location: 'Seoul, South Korea',
    joinDate: '2023-06-03',
    level: 'Beginner',
    rank: 456,
    followers: 123,
    following: 567,
    reputation: 3.9,
    stats: {
      totalTrades: 178,
      winRate: 58.7,
      totalPnL: 12340.50,
      sharpeRatio: 0.89
    },
    badges: [
      { id: 'fx_trader', name: 'FX Trader', icon: TrendingUp, color: 'text-green-400', rare: false }
    ],
    isOnline: true,
    lastActive: '2024-01-15T11:45:00Z'
  }
]

export default function MemberDirectoryClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('rank')
  const [filterOnline, setFilterOnline] = useState(false)

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = mockMembers.filter(member => {
      const matchesSearch = searchQuery === '' || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesLevel = selectedLevel === 'all' || member.level.toLowerCase() === selectedLevel.toLowerCase()
      const matchesOnline = !filterOnline || member.isOnline
      
      return matchesSearch && matchesLevel && matchesOnline
    })

    // Sort members
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank - b.rank
        case 'followers':
          return b.followers - a.followers
        case 'reputation':
          return b.reputation - a.reputation
        case 'pnl':
          return b.stats.totalPnL - a.stats.totalPnL
        case 'winrate':
          return b.stats.winRate - a.stats.winRate
        case 'joined':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedLevel, sortBy, filterOnline])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Active now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-purple-600'
      case 'advanced': return 'bg-blue-600'
      case 'intermediate': return 'bg-green-600'
      case 'beginner': return 'bg-amber-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-cyan-600">Community</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Member <span className="text-cyan-400">Directory</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with traders, share strategies, and learn from our global community of quantitative finance professionals.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatNumber(mockMembers.length * 234)}</div>
              <div className="text-sm text-gray-400">Total Members</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{mockMembers.filter(m => m.isOnline).length * 47}</div>
              <div className="text-sm text-gray-400">Online Now</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-gray-400">Top Traders</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{mockMembers.filter(m => m.verified).length * 12}</div>
              <div className="text-sm text-gray-400">Verified</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members by name, username, location, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
              
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="rank">By Rank</SelectItem>
                  <SelectItem value="followers">By Followers</SelectItem>
                  <SelectItem value="reputation">By Reputation</SelectItem>
                  <SelectItem value="pnl">By P&L</SelectItem>
                  <SelectItem value="winrate">By Win Rate</SelectItem>
                  <SelectItem value="joined">By Join Date</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filterOnline ? "default" : "outline"}
                onClick={() => setFilterOnline(!filterOnline)}
                className={filterOnline ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Activity className="w-4 h-4 mr-2" />
                Online Only
              </Button>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">
                Showing {filteredAndSortedMembers.length} members
              </span>
              <div className="text-sm text-gray-400">
                Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace(/([A-Z])/g, ' $1')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-cyan-600 transition-colors group">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-cyan-600">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {member.name}
                          </h3>
                          {member.verified && (
                            <CheckCircle className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">@{member.username}</p>
                      </div>
                    </div>
                    <Badge className={getLevelColor(member.level)}>
                      {member.level}
                    </Badge>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{member.bio}</p>

                  {/* Location and Online Status */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{getTimeAgo(member.lastActive)}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {member.badges.slice(0, 2).map((badge) => {
                      const Icon = badge.icon
                      return (
                        <div
                          key={badge.id}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            badge.rare ? 'bg-amber-900/20 border border-amber-700' : 'bg-gray-800'
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${badge.color}`} />
                          <span className={badge.rare ? 'text-amber-400' : 'text-gray-300'}>
                            {badge.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">#{member.rank}</div>
                      <div className="text-xs text-gray-400">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">{member.stats.winRate}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>

                  {/* Social Stats */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400">
                        <strong className="text-white">{formatNumber(member.followers)}</strong> followers
                      </span>
                      <span className="text-gray-400">
                        <strong className="text-white">{formatNumber(member.following)}</strong> following
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-white">{member.reputation}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                      <Link href={`/member/${member.username}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-gray-600">
            Load More Members
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            Showing {filteredAndSortedMembers.length} of {mockMembers.length * 234} members
          </p>
        </div>
      </div>
    </div>
  )
}


