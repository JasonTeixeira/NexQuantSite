"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Users,
  CheckCircle,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Flag,
  Bookmark,
  Copy,
  ExternalLink,
  Clock,
  Eye,
  Filter,
  Crown,
  Star,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Reply,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Calendar,
  Activity,
  Percent
} from "lucide-react"

interface Post {
  id: string
  type: 'trade' | 'strategy' | 'insight' | 'question' | 'news'
  author: {
    id: string
    name: string
    username: string
    avatar: string
    verified: boolean
    level: string
    followers: number
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
  tags: string[]
  media?: {
    type: 'image' | 'chart' | 'video'
    url: string
    thumbnail?: string
  }
  tradingData?: {
    symbol: string
    action: 'BUY' | 'SELL'
    price: number
    quantity: number
    pnl?: number
    pnlPercent?: number
  }
  poll?: {
    question: string
    options: Array<{
      text: string
      votes: number
    }>
    totalVotes: number
    userVoted?: number
  }
}

// Mock posts data
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'trade',
    author: {
      id: 'alex_trader',
      name: 'Alex Thompson',
      username: 'alex_trader',
      avatar: '',
      verified: true,
      level: 'Expert',
      followers: 2847
    },
    content: 'Just closed my BTC position with a solid +12.3% return! The breakout above $45K was exactly what I was waiting for. My RSI divergence strategy is working perfectly in this market. \n\nKey levels to watch: Support at $44.5K, resistance at $46.8K. Still bullish on the weekly timeframe.',
    timestamp: '2024-01-15T10:30:00Z',
    likes: 47,
    comments: 12,
    shares: 8,
    views: 234,
    isLiked: false,
    isBookmarked: false,
    tags: ['BTC', 'crypto', 'breakout', 'RSI'],
    tradingData: {
      symbol: 'BTC/USD',
      action: 'SELL',
      price: 45234.67,
      quantity: 0.5,
      pnl: 2500.30,
      pnlPercent: 12.3
    }
  },
  {
    id: '2',
    type: 'strategy',
    author: {
      id: 'sarah_crypto',
      name: 'Sarah Chen',
      username: 'sarah_crypto',
      avatar: '',
      verified: true,
      level: 'Advanced',
      followers: 1893
    },
    content: 'New DeFi arbitrage strategy I\'ve been testing 📈\n\nFound consistent 0.3-0.8% opportunities across DEX protocols. Here\'s my framework:\n\n1. Monitor price differences between Uniswap, SushiSwap, and PancakeSwap\n2. Execute when spread > 0.5% (accounting for gas)\n3. Use flash loans to maximize capital efficiency\n\nBacktested over 3 months: 23% net return, 0.12% max drawdown.\n\nWho else is exploring DeFi arbitrage?',
    timestamp: '2024-01-15T08:15:00Z',
    likes: 89,
    comments: 23,
    shares: 34,
    views: 567,
    isLiked: true,
    isBookmarked: true,
    tags: ['DeFi', 'arbitrage', 'strategy', 'yield'],
    poll: {
      question: 'What\'s your biggest DeFi challenge?',
      options: [
        { text: 'Gas fees too high', votes: 45 },
        { text: 'Finding profitable opportunities', votes: 67 },
        { text: 'Smart contract risks', votes: 23 },
        { text: 'Complexity of protocols', votes: 31 }
      ],
      totalVotes: 166,
      userVoted: 1
    }
  },
  {
    id: '3',
    type: 'insight',
    author: {
      id: 'mike_quant',
      name: 'Michael Rodriguez',
      username: 'mike_quant',
      avatar: '',
      verified: false,
      level: 'Intermediate',
      followers: 567
    },
    content: 'Market microstructure observation 🧠\n\nNoticing increased correlation between VIX and crypto volatility over the past 2 weeks. Traditional finance fear metrics are bleeding into crypto markets more than usual.\n\nThis could signal:\n• Institutional adoption reaching critical mass\n• Crypto becoming part of broader risk-on/risk-off sentiment\n• Traditional portfolio managers treating crypto as another risk asset\n\nKeeping a close eye on this development. Could change how we model crypto volatility going forward.',
    timestamp: '2024-01-15T06:45:00Z',
    likes: 34,
    comments: 8,
    shares: 12,
    views: 178,
    isLiked: false,
    isBookmarked: false,
    tags: ['VIX', 'correlation', 'institutional', 'analysis']
  },
  {
    id: '4',
    type: 'question',
    author: {
      id: 'emma_algo',
      name: 'Emma Johnson',
      username: 'emma_algo',
      avatar: '',
      verified: true,
      level: 'Expert',
      followers: 1234
    },
    content: 'Quick question for the algo trading community: What\'s your preferred method for handling overnight gap risk in equity strategies?\n\nI\'ve been using:\n• Position sizing based on average gap size\n• Stop-loss orders with gap protection\n• After-hours sentiment analysis\n\nBut still getting caught by surprise moves. Any advanced techniques you\'d recommend?',
    timestamp: '2024-01-14T22:30:00Z',
    likes: 28,
    comments: 15,
    shares: 5,
    views: 145,
    isLiked: false,
    isBookmarked: true,
    tags: ['algo-trading', 'risk-management', 'gaps', 'equities']
  }
]

export default function SocialTradingFeedClient() {
  const [posts, setPosts] = useState(mockPosts)
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedPostType, setSelectedPostType] = useState('insight')
  const [filter, setFilter] = useState('all')

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    )
  }

  const handleBookmark = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    )
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return BarChart3
      case 'strategy': return Target
      case 'insight': return MessageSquare
      case 'question': return MessageSquare
      case 'news': return ExternalLink
      default: return MessageSquare
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'text-green-400'
      case 'strategy': return 'text-blue-400'
      case 'insight': return 'text-purple-400'
      case 'question': return 'text-amber-400'
      case 'news': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    if (filter === 'following') return post.author.id === 'alex_trader' // Mock: show posts from followed users
    if (filter === 'trades') return post.type === 'trade'
    if (filter === 'strategies') return post.type === 'strategy'
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-cyan-600">Community</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Trading <span className="text-cyan-400">Community</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Share strategies, discuss market insights, and learn from fellow traders in our vibrant community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Members</span>
                  <span className="font-semibold text-white">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts Today</span>
                  <span className="font-semibold text-white">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strategies Shared</span>
                  <span className="font-semibold text-white">234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Engagement</span>
                  <span className="font-semibold text-white">12.3K</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['BTC', 'DeFi', 'AI-Trading', 'Options', 'Forex', 'ETF', 'Technical-Analysis', 'Risk-Management'].map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-cyan-600">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockPosts.slice(0, 3).map((post, index) => (
                  <div key={post.author.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-xs font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback className="bg-cyan-600 text-xs">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link 
                        href={`/member/${post.author.username}`}
                        className="text-sm font-semibold text-white hover:text-cyan-400"
                      >
                        {post.author.name}
                      </Link>
                      <div className="text-xs text-gray-400">{post.likes + post.comments + post.shares} interactions</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Share with the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-cyan-600">YU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share a trading insight, strategy, or ask a question..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="bg-gray-800 border-gray-700 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Chart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      Poll
                    </Button>
                  </div>
                  
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Filters */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                    <TabsTrigger value="all">All Posts</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                    <TabsTrigger value="trades">Trades</TabsTrigger>
                    <TabsTrigger value="strategies">Strategies</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => {
                const PostTypeIcon = getPostTypeIcon(post.type)
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="bg-cyan-600">
                              {post.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                href={`/member/${post.author.username}`}
                                className="font-semibold text-white hover:text-cyan-400 transition-colors"
                              >
                                {post.author.name}
                              </Link>
                              {post.author.verified && (
                                <CheckCircle className="w-4 h-4 text-cyan-400" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {post.author.level}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <PostTypeIcon className={`w-4 h-4 ${getPostTypeColor(post.type)}`} />
                                <span className={`text-xs capitalize ${getPostTypeColor(post.type)}`}>
                                  {post.type}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>@{post.author.username}</span>
                              <span>•</span>
                              <span>{formatTime(post.timestamp)}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Trading Data */}
                        {post.tradingData && (
                          <div className="mb-4 p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={post.tradingData.action === 'BUY' ? 'bg-green-600' : 'bg-red-600'}>
                                  {post.tradingData.action}
                                </Badge>
                                <span className="font-bold text-white">{post.tradingData.symbol}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-400">
                                  +${post.tradingData.pnl?.toLocaleString()}
                                </div>
                                <div className="text-sm text-green-400">
                                  +{post.tradingData.pnlPercent}%
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                              <span>Price: ${post.tradingData.price.toLocaleString()}</span>
                              <span>Quantity: {post.tradingData.quantity}</span>
                            </div>
                          </div>
                        )}

                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                        </div>

                        {/* Poll */}
                        {post.poll && (
                          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">{post.poll.question}</h4>
                            <div className="space-y-2">
                              {post.poll.options.map((option, index) => {
                                const percentage = (option.votes / post.poll!.totalVotes * 100).toFixed(1)
                                const isVoted = post.poll!.userVoted === index
                                return (
                                  <div
                                    key={index}
                                    className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                                      isVoted 
                                        ? 'border-cyan-600 bg-cyan-900/20' 
                                        : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-white">{option.text}</span>
                                      <span className="text-sm text-gray-400">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all ${
                                          isVoted ? 'bg-cyan-600' : 'bg-gray-600'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="text-sm text-gray-400 mt-2">
                              {post.poll.totalVotes} votes
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex gap-2 flex-wrap">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-cyan-600">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Engagement Bar */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <div className="flex items-center gap-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={`${post.isLiked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-red-400'}`}
                            >
                              <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {post.comments}
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                              <Share2 className="w-4 h-4 mr-2" />
                              {post.shares}
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBookmark(post.id)}
                              className={`${post.isBookmarked ? 'text-amber-400' : 'text-gray-400'}`}
                            >
                              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                              <Flag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="border-gray-600">
                Load More Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
