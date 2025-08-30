"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Shield,
  Crown,
  Flag,
  Search,
  Filter,
  UserCheck,
  UserX,
  MessageCircle,
  TrendingUp,
  Activity,
  Clock,
  BarChart3
} from "lucide-react"
import { 
  FORUM_CATEGORIES, 
  CHAT_ROOMS, 
  getTimeAgo,
  type User,
  type ForumTopic,
  type ChatMessage
} from "@/lib/community/community-utils"

// Mock data for admin community management
const mockCommunityStats = {
  totalMembers: 12456,
  activeModerators: 8,
  onlineMembers: 234,
  postsLast24h: 127,
  reportsLast24h: 3,
  communityHealth: 92,
  engagementRate: 78.5,
  totalPosts: 45632,
  totalTopics: 8934,
  averageResponseTime: 2.4
}

const mockReportedContent = [
  {
    id: 'report_1',
    type: 'forum_post',
    contentId: 'post_123',
    reportedBy: 'user_456',
    reason: 'Spam',
    status: 'pending',
    timestamp: '2024-01-15T10:30:00Z',
    content: 'Check out this amazing trading bot that guarantees 500% returns...',
    reporterName: 'TradingExpert92',
    authorName: 'SpamBot123'
  },
  {
    id: 'report_2',
    type: 'chat_message',
    contentId: 'msg_789',
    reportedBy: 'user_321',
    reason: 'Harassment',
    status: 'pending',
    timestamp: '2024-01-15T09:15:00Z',
    content: 'You are terrible at trading and should quit...',
    reporterName: 'CommunityGuard',
    authorName: 'ToxicUser99'
  },
  {
    id: 'report_3',
    type: 'forum_post',
    contentId: 'post_456',
    reportedBy: 'user_789',
    reason: 'Misinformation',
    status: 'resolved',
    timestamp: '2024-01-14T16:45:00Z',
    content: 'The market will definitely crash tomorrow because...',
    reporterName: 'FactChecker',
    authorName: 'FakeNewsGuru'
  }
]

const mockTopContributors = [
  {
    user: {
      id: 'user1',
      username: 'trading_guru',
      displayName: 'Trading Guru',
      avatar: '/placeholder-avatar.jpg',
      role: 'premium',
      reputation: 5432,
      verified: true,
      isOnline: true
    } as User,
    stats: {
      posts: 456,
      helpful: 89,
      likes: 1234,
      reports: 0
    }
  },
  {
    user: {
      id: 'user2',
      username: 'market_wizard',
      displayName: 'Market Wizard',
      role: 'member',
      reputation: 4321,
      verified: false,
      isOnline: false
    } as User,
    stats: {
      posts: 389,
      helpful: 76,
      likes: 987,
      reports: 1
    }
  }
]

const mockModerators = [
  {
    id: 'mod1',
    username: 'super_mod',
    displayName: 'Super Moderator',
    avatar: '/placeholder-mod1.jpg',
    role: 'moderator',
    isOnline: true,
    stats: {
      actionsLast30d: 45,
      reportsHandled: 23,
      avgResponseTime: 1.2
    }
  },
  {
    id: 'mod2',
    username: 'community_guardian',
    displayName: 'Community Guardian',
    avatar: '/placeholder-mod2.jpg',
    role: 'moderator',
    isOnline: false,
    stats: {
      actionsLast30d: 32,
      reportsHandled: 18,
      avgResponseTime: 2.1
    }
  }
]

export default function CommunityManagementAdmin() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const handleResolveReport = (reportId: string, action: 'approve' | 'reject' | 'ban') => {
    console.log(`Resolving report ${reportId} with action: ${action}`)
    // In production, this would make an API call
  }

  const handlePromoteUser = (userId: string, role: 'moderator' | 'admin') => {
    console.log(`Promoting user ${userId} to ${role}`)
    // In production, this would make an API call
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Community Management Center
          </h1>
          <p className="text-gray-400">
            Monitor and manage community activity, moderation, and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Moderate Chat
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Community Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Members</p>
                <p className="text-xl font-bold text-blue-400">{mockCommunityStats.totalMembers.toLocaleString()}</p>
              </div>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Online Now</p>
                <p className="text-xl font-bold text-green-400">{mockCommunityStats.onlineMembers}</p>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Posts (24h)</p>
                <p className="text-xl font-bold text-purple-400">{mockCommunityStats.postsLast24h}</p>
              </div>
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reports</p>
                <p className={`text-xl font-bold ${mockCommunityStats.reportsLast24h > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {mockCommunityStats.reportsLast24h}
                </p>
              </div>
              <Flag className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Health Score</p>
                <p className="text-xl font-bold text-cyan-400">{mockCommunityStats.communityHealth}%</p>
              </div>
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {mockCommunityStats.reportsLast24h > 0 && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Moderation Required</span>
            </div>
            <p className="text-sm text-gray-300">
              {mockCommunityStats.reportsLast24h} new reports require your attention
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
          <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports List */}
            <div className="grid gap-4">
              {mockReportedContent
                .filter(report => selectedFilter === 'all' || report.status === selectedFilter || report.reason.toLowerCase() === selectedFilter)
                .map((report) => (
                <Card key={report.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">{report.reason}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <span className="text-sm text-gray-400">
                        {getTimeAgo(report.timestamp)}
                      </span>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-300 italic">
                        "{report.content}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Author: <span className="text-white">{report.authorName}</span></span>
                        <span>Reporter: <span className="text-white">{report.reporterName}</span></span>
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolveReport(report.id, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolveReport(report.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleResolveReport(report.id, 'ban')}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Ban User
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Moderators Tab */}
        <TabsContent value="moderators">
          <div className="grid gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Active Moderators
                </CardTitle>
                <CardDescription>
                  Team performance and activity monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockModerators.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={mod.avatar} alt={mod.displayName} />
                            <AvatarFallback>{mod.displayName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {mod.isOnline && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{mod.displayName}</h4>
                          <p className="text-sm text-gray-400">@{mod.username}</p>
                        </div>
                        <Badge className="bg-cyan-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Moderator
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{mod.stats.actionsLast30d}</div>
                          <div className="text-gray-400">Actions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{mod.stats.reportsHandled}</div>
                          <div className="text-gray-400">Reports</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{mod.stats.avgResponseTime}h</div>
                          <div className="text-gray-400">Response</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Contributors Tab */}
        <TabsContent value="contributors">
          <div className="grid gap-4">
            {mockTopContributors.map((contributor, index) => (
              <Card key={contributor.user.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contributor.user.avatar} />
                        <AvatarFallback>{contributor.user.displayName?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{contributor.user.displayName}</h4>
                        <p className="text-sm text-gray-400">@{contributor.user.username}</p>
                      </div>
                      {contributor.user.verified && (
                        <Badge className="bg-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-purple-400">{contributor.stats.posts}</div>
                        <div className="text-gray-400">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-400">{contributor.stats.helpful}</div>
                        <div className="text-gray-400">Helpful</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-400">{contributor.stats.likes}</div>
                        <div className="text-gray-400">Likes</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handlePromoteUser(contributor.user.id, 'moderator')}>
                          <Crown className="w-4 h-4 mr-1" />
                          Promote
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid gap-4">
            {FORUM_CATEGORIES.map((category) => (
              <Card key={category.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{category.name}</h3>
                        <p className="text-gray-400">{category.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{category.stats.topics.toLocaleString()} topics</span>
                          <span>{category.stats.posts.toLocaleString()} posts</span>
                          <span>{category.stats.activeMembers.toLocaleString()} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="w-4 h-4 mr-1" />
                        Moderate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="text-center py-12 text-gray-400">
            💬 Live chat moderation interface will be integrated here
            <br />
            <small>Real-time chat monitoring, user management, and moderation tools</small>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="text-center py-12 text-gray-400">
            📊 Community analytics dashboard will be integrated here
            <br />
            <small>Engagement metrics, growth trends, and community health indicators</small>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


