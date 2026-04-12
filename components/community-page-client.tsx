"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Users,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Eye,
  BarChart3,
  ImageIcon,
  Code,
  FileText,
  Video,
  Calendar,
  VoteIcon as Poll,
  Star,
  Paperclip,
  Lock,
  Verified,
  Radio,
  Plus,
  Brain,
  Sparkles,
  MessageCircle,
  Shield,
  DollarSign,
  Gift,
  Phone,
  VideoIcon,
  UserPlus,
  Settings,
  Bell,
  Search,
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  ScreenShare,
  Crown,
  Globe,
  Zap,
} from "lucide-react"

// Enhanced post types
const postTypes = [
  { id: "text", label: "Text Post", icon: FileText },
  { id: "strategy", label: "Strategy", icon: BarChart3 },
  { id: "analysis", label: "Market Analysis", icon: TrendingUp },
  { id: "code", label: "Code Snippet", icon: Code },
  { id: "image", label: "Image/Chart", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "poll", label: "Poll", icon: Poll },
  { id: "event", label: "Event", icon: Calendar },
  { id: "question", label: "Question", icon: MessageSquare },
  { id: "live", label: "Live Stream", icon: Radio },
]

// Enhanced community posts with more variety
const communityPosts = [
  {
    id: 1,
    type: "strategy",
    author: {
      name: "Alex Chen",
      username: "@alextrader",
      avatar: "",
      verified: true,
      level: "Diamond",
      followers: 12500,
      reputation: 4.9,
      badges: ["Top Contributor", "Strategy Master", "Verified Trader"],
    },
    timestamp: "2 hours ago",
    content:
      "Just backtested my new momentum strategy on BTC/USDT. 73% win rate over 6 months with 2:1 Sharpe ratio. The key is combining RSI divergence with volume confirmation. What do you think about this approach?",
    strategy: {
      name: "BTC Momentum Pro",
      performance: "+127.3%",
      risk: "Medium Risk",
      winRate: "73%",
      sharpeRatio: "2.1",
      maxDrawdown: "-8.4%",
      backtestPeriod: "6 months",
      trades: 156,
      avgReturn: "2.3%",
    },
    media: {
      type: "chart",
      url: "/placeholder.svg?height=300&width=500&text=Strategy+Performance+Chart",
      thumbnail: "/placeholder.svg?height=150&width=250&text=Chart+Thumbnail",
    },
    tags: ["#BTC", "#Strategy", "#Momentum", "#Backtesting"],
    engagement: {
      likes: 156,
      comments: 23,
      shares: 12,
      bookmarks: 45,
      views: 1240,
    },
    comments: [
      {
        id: 1,
        author: "Sarah Kim",
        content: "Great strategy! Have you tested this on other timeframes?",
        timestamp: "1 hour ago",
        likes: 8,
      },
    ],
  },
]

const AIContentRecommendations = ({ userId }: { userId: string }) => {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI recommendation engine
    setTimeout(() => {
      setRecommendations([
        {
          id: 1,
          type: "strategy",
          title: "Momentum Trading Strategy Discussion",
          reason: "Based on your interest in technical analysis",
          confidence: 0.92,
          engagement: "High",
          author: "Alex Chen",
          likes: 234,
          comments: 45,
        },
        {
          id: 2,
          type: "post",
          title: "Market Analysis: BTC Breakout Pattern",
          reason: "Similar traders found this valuable",
          confidence: 0.87,
          engagement: "Medium",
          author: "Sarah Kim",
          likes: 156,
          comments: 28,
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [userId])

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">AI Recommendations</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">AI Recommendations</h3>
          <Badge className="bg-primary/20 text-primary text-xs">Powered by AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-white text-sm">{rec.title}</h4>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary">{Math.round(rec.confidence * 100)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-2">{rec.reason}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>by {rec.author}</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{rec.likes}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{rec.comments}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const TrendingTopics = () => {
  const [trends, setTrends] = useState([
    { topic: "Bitcoin ETF", mentions: 234, sentiment: 0.82, growth: "+45%" },
    { topic: "AI Trading Bots", mentions: 189, sentiment: 0.76, growth: "+32%" },
    { topic: "Options Strategy", mentions: 156, sentiment: 0.71, growth: "+28%" },
    { topic: "Market Volatility", mentions: 134, sentiment: 0.45, growth: "+15%" },
  ])

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Trending Topics</h3>
          <Badge className="bg-primary/20 text-primary text-xs">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {trends.map((trend, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-white text-sm">#{trend.topic}</span>
                <Badge
                  className={`text-xs ${trend.sentiment > 0.6 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {trend.sentiment > 0.6 ? "Positive" : "Negative"}
                </Badge>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                <span>{trend.mentions} mentions</span>
                <span className="text-green-400">{trend.growth}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">#{index + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const ProfessionalNetworking = ({ userId }: { userId: string }) => {
  const [connections, setConnections] = useState<any[]>([])
  const [networkingEvents, setNetworkingEvents] = useState<any[]>([])
  const [mentorshipOpportunities, setMentorshipOpportunities] = useState<any[]>([])

  useEffect(() => {
    // Simulate professional networking data
    setConnections([
      {
        id: 1,
        name: "Michael Rodriguez",
        title: "Senior Quantitative Analyst",
        company: "Goldman Sachs",
        expertise: ["Algorithmic Trading", "Risk Management"],
        mutualConnections: 12,
        verified: true,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 2,
        name: "Lisa Chen",
        title: "Portfolio Manager",
        company: "BlackRock",
        expertise: ["ESG Investing", "Fixed Income"],
        mutualConnections: 8,
        verified: true,
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ])

    setNetworkingEvents([
      {
        id: 1,
        title: "Institutional Trading Strategies Summit",
        date: "2024-02-15",
        type: "Virtual",
        attendees: 250,
        speakers: ["John Smith - JP Morgan", "Sarah Kim - Citadel"],
        premium: true,
      },
      {
        id: 2,
        title: "AI in Finance Roundtable",
        date: "2024-02-20",
        type: "In-Person",
        location: "New York",
        attendees: 50,
        premium: true,
      },
    ])

    setMentorshipOpportunities([
      {
        id: 1,
        mentor: "David Park",
        title: "Former Head of Trading - Morgan Stanley",
        specialization: "Options Strategies",
        rating: 4.9,
        sessions: 156,
        price: "$200/hour",
        availability: "Limited",
      },
    ])
  }, [userId])

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Professional Network</h3>
          <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Suggestions */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Suggested Connections</h4>
          <div className="space-y-3">
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={connection.avatar || "/placeholder.svg"}
                    alt={connection.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-sm">{connection.name}</span>
                      {connection.verified && <Shield className="w-3 h-3 text-blue-400" />}
                    </div>
                    <p className="text-xs text-gray-400">
                      {connection.title} at {connection.company}
                    </p>
                    <p className="text-xs text-gray-500">{connection.mutualConnections} mutual connections</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Networking Events */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Exclusive Events</h4>
          <div className="space-y-3">
            {networkingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gradient-to-r from-primary/10 to-gold-500/10 border border-primary/30 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-white text-sm">{event.title}</h5>
                  <Badge className="bg-gold-500/20 text-gold-400 text-xs">Premium</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    📅 {event.date} • {event.type}
                  </p>
                  <p>👥 {event.attendees} attendees</p>
                  {event.speakers && <p>🎤 {event.speakers.join(", ")}</p>}
                </div>
                <Button size="sm" className="mt-2 bg-primary hover:bg-primary/90 text-black">
                  Register
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorship */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Expert Mentorship</h4>
          {mentorshipOpportunities.map((mentor) => (
            <div key={mentor.id} className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-medium text-white text-sm">{mentor.mentor}</h5>
                  <p className="text-xs text-gray-400">{mentor.title}</p>
                  <p className="text-xs text-primary">{mentor.specialization}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-white">{mentor.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400">{mentor.sessions} sessions</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{mentor.price}</span>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                  Book Session
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const CommunityAnalyticsDashboard = ({ userId }: { userId: string }) => {
  const [analytics, setAnalytics] = useState({
    profileViews: 1247,
    postEngagement: 89.3,
    networkGrowth: 23.5,
    influenceScore: 742,
    topPerformingPost: "Market Analysis: Q4 Outlook",
    followerGrowth: [
      { month: "Jan", followers: 120 },
      { month: "Feb", followers: 145 },
      { month: "Mar", followers: 189 },
      { month: "Apr", followers: 234 },
    ],
    engagementMetrics: {
      likes: 2341,
      comments: 567,
      shares: 123,
      saves: 89,
    },
    audienceInsights: {
      topCountries: ["United States", "United Kingdom", "Canada"],
      ageGroups: { "25-34": 45, "35-44": 32, "45-54": 23 },
      interests: ["Technical Analysis", "Options Trading", "Crypto"],
    },
  })

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Analytics Dashboard</h3>
          <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-primary">{analytics.profileViews.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Profile Views</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{analytics.postEngagement}%</div>
            <div className="text-xs text-gray-400">Engagement Rate</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{analytics.influenceScore}</div>
            <div className="text-xs text-gray-400">Influence Score</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">+{analytics.networkGrowth}%</div>
            <div className="text-xs text-gray-400">Network Growth</div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Engagement Breakdown</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(analytics.engagementMetrics).map(([key, value]) => (
              <div key={key} className="text-center p-2 bg-gray-800/50 rounded">
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="p-3 bg-gradient-to-r from-gold-500/10 to-yellow-500/10 border border-gold-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gold-400" />
            <span className="font-medium text-gold-400 text-sm">Top Performing Post</span>
          </div>
          <p className="text-sm text-white">{analytics.topPerformingPost}</p>
          <p className="text-xs text-gray-400 mt-1">2.3K views • 89% engagement rate</p>
        </div>
      </CardContent>
    </Card>
  )
}

const CreatorMonetization = ({ userId }: { userId: string }) => {
  const [monetizationData, setMonetizationData] = useState({
    totalEarnings: 2847.5,
    monthlyRevenue: 892.3,
    subscribers: 1247,
    premiumContent: 23,
    tipJar: 156.8,
    courseRevenue: 1890.4,
    consultingRevenue: 800.3,
    revenueStreams: [
      { name: "Premium Content", amount: 1890.4, percentage: 66.4 },
      { name: "Consulting", amount: 800.3, percentage: 28.1 },
      { name: "Tips", amount: 156.8, percentage: 5.5 },
    ],
  })

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Creator Monetization</h3>
          <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">${monetizationData.totalEarnings.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Total Earnings</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">${monetizationData.monthlyRevenue.toFixed(2)}</div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Revenue Streams</h4>
          <div className="space-y-3">
            {monetizationData.revenueStreams.map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <span className="font-medium text-white text-sm">{stream.name}</span>
                  <div className="text-xs text-gray-400">{stream.percentage}% of total</div>
                </div>
                <span className="font-bold text-green-400">${stream.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Tools */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <MessageSquare className="w-4 h-4 mr-2" />
            Offer Consulting
          </Button>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Lock className="w-4 h-4 mr-2" />
            Premium Posts
          </Button>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Gift className="w-4 h-4 mr-2" />
            Enable Tips
          </Button>
        </div>

        {/* Payout Information */}
        <div className="p-3 bg-gradient-to-r from-gold-500/10 to-yellow-500/10 border border-gold-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gold-400 text-sm">Next Payout</span>
            <span className="text-sm text-white">Feb 1, 2024</span>
          </div>
          <div className="text-lg font-bold text-white">${monetizationData.monthlyRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-400">Pending earnings will be paid out monthly</p>
        </div>
      </CardContent>
    </Card>
  )
}

const DirectMessagingSystem = ({ userId }: { userId: string }) => {
  const [conversations, setConversations] = useState<any[]>([
    {
      id: 1,
      participant: {
        name: "Alex Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "online",
        lastSeen: "now",
      },
      lastMessage: {
        content: "Great analysis on the BTC breakout!",
        timestamp: "2 min ago",
        unread: true,
      },
      unreadCount: 2,
    },
    {
      id: 2,
      participant: {
        name: "Sarah Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "away",
        lastSeen: "5 min ago",
      },
      lastMessage: {
        content: "Can you share that strategy backtest?",
        timestamp: "1 hour ago",
        unread: false,
      },
      unreadCount: 0,
    },
  ])

  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Messages</h3>
            <Badge className="bg-primary/20 text-primary text-xs">
              {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} new
            </Badge>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                activeConversation?.id === conversation.id ? "bg-gray-800/50" : ""
              }`}
              onClick={() => setActiveConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={conversation.participant.avatar || "/placeholder.svg"}
                    alt={conversation.participant.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      conversation.participant.status === "online"
                        ? "bg-green-400"
                        : conversation.participant.status === "away"
                          ? "bg-yellow-400"
                          : "bg-gray-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm truncate">{conversation.participant.name}</span>
                    <span className="text-xs text-gray-400">{conversation.lastMessage.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">{conversation.lastMessage.content}</p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-black text-xs ml-2">{conversation.unreadCount}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Conversation */}
        {activeConversation && (
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">{activeConversation.participant.name}</span>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeConversation.participant.status === "online" ? "bg-green-400" : "bg-gray-500"
                    }`}
                  />
                  <span className="text-xs text-gray-400">
                    {activeConversation.participant.status === "online" ? "Online" : "Away"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <VideoIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
              />
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const GroupCreationSystem = ({ userId }: { userId: string }) => {
  const [userGroups, setUserGroups] = useState([
    {
      id: 1,
      name: "Options Strategies Elite",
      description: "Advanced options trading strategies and analysis",
      members: 234,
      privacy: "private",
      category: "Options Trading",
      role: "admin",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActivity: "2 hours ago",
      unreadMessages: 5,
    },
    {
      id: 2,
      name: "Crypto Technical Analysis",
      description: "Daily crypto TA and market insights",
      members: 1247,
      privacy: "public",
      category: "Cryptocurrency",
      role: "member",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActivity: "30 min ago",
      unreadMessages: 12,
    },
  ])

  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    rules: "",
  })

  const groupCategories = [
    "Options Trading",
    "Cryptocurrency",
    "Forex",
    "Stock Analysis",
    "Algorithmic Trading",
    "Risk Management",
    "Market Psychology",
    "Educational",
  ]

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Trading Groups</h3>
            <Badge className="bg-primary/20 text-primary text-xs">
              {userGroups.reduce((sum, group) => sum + group.unreadMessages, 0)} new
            </Badge>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-black"
            onClick={() => setShowCreateGroup(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's Groups */}
        <div className="space-y-3">
          {userGroups.map((group) => (
            <div
              key={group.id}
              className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <img src={group.avatar || "/placeholder.svg"} alt={group.name} className="w-10 h-10 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-sm truncate">{group.name}</span>
                      {group.privacy === "private" && <Lock className="w-3 h-3 text-gray-400" />}
                      {group.role === "admin" && <Crown className="w-3 h-3 text-gold-400" />}
                    </div>
                    {group.unreadMessages > 0 && (
                      <Badge className="bg-primary text-black text-xs">{group.unreadMessages}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2 truncate">{group.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>{group.members} members</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {group.category}
                      </Badge>
                    </div>
                    <span>{group.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Create Trading Group</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateGroup(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Group Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g., Advanced Options Strategies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none"
                    rows={3}
                    placeholder="Describe what your group is about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <Select
                    value={newGroup.category}
                    onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {groupCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Privacy</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="public"
                        checked={newGroup.privacy === "public"}
                        onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                        className="text-primary"
                      />
                      <span className="text-sm text-white">Public</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="private"
                        checked={newGroup.privacy === "private"}
                        onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                        className="text-primary"
                      />
                      <span className="text-sm text-white">Private</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    onClick={() => setShowCreateGroup(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-black">Create Group</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Groups */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="font-medium text-white text-sm mb-3">Suggested Groups</h4>
          <div className="space-y-2">
            {[
              { name: "Day Trading Masters", members: 3421, category: "Day Trading" },
              { name: "Swing Trading Pros", members: 1876, category: "Swing Trading" },
            ].map((group, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <div>
                  <span className="font-medium text-white text-sm">{group.name}</span>
                  <div className="text-xs text-gray-400">
                    {group.members} members • {group.category}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Join
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const VideoCallingSystem = ({ userId }: { userId: string }) => {
  const [activeCall, setActiveCall] = useState<any>(null)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true,
    screenShare: false,
  })

  const [scheduledCalls, setScheduledCalls] = useState([
    {
      id: 1,
      title: "1-on-1 Mentorship Session",
      participant: "David Park",
      type: "mentorship",
      scheduledTime: "2024-02-15T14:00:00",
      duration: 60,
      status: "upcoming",
    },
    {
      id: 2,
      title: "Strategy Review Call",
      participant: "Alex Chen",
      type: "collaboration",
      scheduledTime: "2024-02-16T10:30:00",
      duration: 30,
      status: "upcoming",
    },
  ])

  const startCall = (participant: any) => {
    setActiveCall({
      participant,
      startTime: new Date(),
      duration: 0,
      type: "video",
    })
  }

  const endCall = () => {
    setActiveCall(null)
    setCallSettings({ video: true, audio: true, screenShare: false })
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <VideoIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Video Calls</h3>
          <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Call Interface */}
        {activeCall && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <img
                    src="/placeholder.svg?height=120&width=120"
                    alt={activeCall.participant.name}
                    className="w-30 h-30 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">{activeCall.participant.name}</h3>
                  <p className="text-gray-400">Connected • 00:45</p>
                </div>
              </div>

              {/* Self Video */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">You</span>
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="bg-gray-900/95 p-6 border-t border-gray-800">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-full w-12 h-12 ${callSettings.audio ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
                  onClick={() => setCallSettings({ ...callSettings, audio: !callSettings.audio })}
                >
                  {callSettings.audio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-full w-12 h-12 ${callSettings.video ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
                  onClick={() => setCallSettings({ ...callSettings, video: !callSettings.video })}
                >
                  {callSettings.video ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-full w-12 h-12 ${callSettings.screenShare ? "bg-primary text-black" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setCallSettings({ ...callSettings, screenShare: !callSettings.screenShare })}
                >
                  <ScreenShare className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
                  onClick={endCall}
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Calls */}
        <div>
          <h4 className="font-medium text-white text-sm mb-3">Upcoming Calls</h4>
          <div className="space-y-3">
            {scheduledCalls.map((call) => (
              <div key={call.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-white text-sm">{call.title}</h5>
                    <p className="text-xs text-gray-400">with {call.participant}</p>
                  </div>
                  <Badge
                    className={`text-xs ${
                      call.type === "mentorship" ? "bg-gold-500/20 text-gold-400" : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {call.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">📅 Feb 15, 2:00 PM • {call.duration} min</div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-black"
                    onClick={() => startCall({ name: call.participant })}
                  >
                    <VideoIcon className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-black">
            <VideoIcon className="w-4 h-4 mr-2" />
            Start Call
          </Button>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const MobileAppFeatures = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "message",
      title: "New message from Alex Chen",
      content: "Great analysis on the BTC breakout!",
      timestamp: "2 min ago",
      read: false,
      priority: "normal",
    },
    {
      id: 2,
      type: "mention",
      title: "You were mentioned in a post",
      content: "@you What do you think about this strategy?",
      timestamp: "15 min ago",
      read: false,
      priority: "high",
    },
    {
      id: 3,
      type: "group",
      title: "New post in Options Strategies Elite",
      content: "Weekly market outlook discussion started",
      timestamp: "1 hour ago",
      read: true,
      priority: "normal",
    },
  ])

  const [pushSettings, setPushSettings] = useState({
    messages: true,
    mentions: true,
    groupActivity: true,
    marketAlerts: true,
    tradingSignals: true,
    socialUpdates: false,
  })

  const markAsRead = (notificationId: any) => {
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>}
          </div>
          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                notification.read
                  ? "bg-gray-800/30 border-gray-800"
                  : "bg-gray-800/50 border-gray-700 hover:border-primary/50"
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-gray-600" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-sm ${notification.read ? "text-gray-400" : "text-white"}`}>
                      {notification.title}
                    </span>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                  <p className={`text-sm ${notification.read ? "text-gray-500" : "text-gray-300"}`}>
                    {notification.content}
                  </p>
                  {notification.priority === "high" && (
                    <Badge className="bg-red-500/20 text-red-400 text-xs mt-1">High Priority</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Push Notification Settings */}
        <div className="pt-4 border-t border-gray-800">
          <h4 className="font-medium text-white text-sm mb-3">Push Notification Settings</h4>
          <div className="space-y-3">
            {Object.entries(pushSettings).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <button
                  onClick={() => setPushSettings({ ...pushSettings, [key]: !enabled })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabled ? "bg-primary" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
          <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Zap className="w-3 h-3 mr-1" />
            Quick Post
          </Button>
          <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Search className="w-3 h-3 mr-1" />
            Search
          </Button>
          <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
            <Globe className="w-3 h-3 mr-1" />
            Explore
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CommunityPageClient() {
  const [activeTab, setActiveTab] = useState("feed")
  const [newPost, setNewPost] = useState("")
  const [selectedPostType, setSelectedPostType] = useState("text")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Trading Community
          </h1>
          <p className="text-gray-400">
            Connect with traders, share strategies, and learn from the best in the industry
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <MessageSquare className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <VideoIcon className="w-4 h-4 mr-2" />
              Video Calls
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Radio className="w-4 h-4 mr-2" />
              Live Rooms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-3 space-y-6">
                {/* Create Post */}
                <Card className="bg-gray-900/80 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-4">
                        <Textarea
                          placeholder="Share your trading insights, strategies, or market analysis..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Select value={selectedPostType} onValueChange={setSelectedPostType}>
                              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {postTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id} className="text-white">
                                    <div className="flex items-center space-x-2">
                                      <type.icon className="w-4 h-4" />
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Paperclip className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button disabled={!newPost.trim()} className="bg-primary hover:bg-primary/90 text-black">
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {communityPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="bg-gray-900/80 border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">{post.author.name}</span>
                                {post.author.verified && <Verified className="w-4 h-4 text-blue-400" />}
                                <Badge className="bg-primary/20 text-primary text-xs">{post.author.level}</Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>{post.author.username}</span>
                                <span>•</span>
                                <span>{post.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="text-gray-300 leading-relaxed">{post.content}</p>
                        </div>

                        {/* Strategy Performance (if strategy post) */}
                        {post.type === "strategy" && post.strategy && (
                          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white">{post.strategy.name}</h4>
                              <Badge className="bg-green-500/20 text-green-400">{post.strategy.performance}</Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-sm font-bold text-white">{post.strategy.winRate}</div>
                                <div className="text-xs text-gray-400">Win Rate</div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{post.strategy.sharpeRatio}</div>
                                <div className="text-xs text-gray-400">Sharpe Ratio</div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{post.strategy.maxDrawdown}</div>
                                <div className="text-xs text-gray-400">Max Drawdown</div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{post.strategy.trades}</div>
                                <div className="text-xs text-gray-400">Trades</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Media */}
                        {post.media && (
                          <div className="mb-4">
                            <img
                              src={post.media.url || "/placeholder.svg"}
                              alt="Post media"
                              className="w-full rounded-lg border border-gray-700"
                            />
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-primary border-primary/30 hover:bg-primary/10"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Engagement */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                          <div className="flex items-center space-x-6">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.engagement.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.engagement.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                              <Share2 className="w-4 h-4 mr-1" />
                              {post.engagement.shares}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400">
                              <Bookmark className="w-4 h-4 mr-1" />
                              {post.engagement.bookmarks}
                            </Button>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Eye className="w-4 h-4" />
                            <span>{post.engagement.views}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                <MobileAppFeatures userId="current-user" />
                <AIContentRecommendations userId="current-user" />
                <TrendingTopics />
                <ProfessionalNetworking userId="current-user" />
                <CommunityAnalyticsDashboard userId="current-user" />
                <CreatorMonetization userId="current-user" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DirectMessagingSystem userId="current-user" />
              </div>
              <div>
                <MobileAppFeatures userId="current-user" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GroupCreationSystem userId="current-user" />
              </div>
              <div>
                <TrendingTopics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VideoCallingSystem userId="current-user" />
              </div>
              <div>
                <ProfessionalNetworking userId="current-user" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="text-center py-12">
              <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">Live Trading Rooms</h3>
              <p className="text-gray-400">Join live trading sessions and learn from experienced traders</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
