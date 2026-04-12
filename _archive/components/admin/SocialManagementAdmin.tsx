"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Users,
  MessageSquare,
  Trophy,
  Flag,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Heart,
  Share2,
  Crown,
  Shield,
  Activity,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  UserX,
  Mail,
  Settings,
  Award,
  Target,
  Zap,
  DollarSign,
  Star,
  BookOpen,
  RefreshCw,
  Download,
  Plus
} from "lucide-react"

interface MemberStats {
  id: string
  name: string
  username: string
  avatar: string
  verified: boolean
  status: 'active' | 'suspended' | 'banned'
  level: string
  joinDate: string
  lastActive: string
  followers: number
  following: number
  posts: number
  likes: number
  reports: number
  reputation: number
}

interface PostData {
  id: string
  type: 'trade' | 'strategy' | 'insight' | 'question'
  author: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  reports: number
  status: 'approved' | 'pending' | 'flagged' | 'removed'
}

interface ReportData {
  id: string
  reportedItem: string
  itemType: 'post' | 'comment' | 'user'
  reporter: string
  reason: string
  description: string
  timestamp: string
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Mock data
const mockMembers: MemberStats[] = [
  {
    id: 'alex_trader',
    name: 'Alex Thompson',
    username: 'alex_trader',
    avatar: '',
    verified: true,
    status: 'active',
    level: 'Expert',
    joinDate: '2022-03-15',
    lastActive: '2024-01-15T10:30:00Z',
    followers: 2847,
    following: 156,
    posts: 234,
    likes: 5670,
    reports: 0,
    reputation: 4.8
  },
  {
    id: 'sarah_crypto',
    name: 'Sarah Chen',
    username: 'sarah_crypto',
    avatar: '',
    verified: true,
    status: 'active',
    level: 'Advanced',
    joinDate: '2021-11-08',
    lastActive: '2024-01-14T18:45:00Z',
    followers: 1893,
    following: 243,
    posts: 187,
    likes: 4320,
    reports: 1,
    reputation: 4.6
  },
  {
    id: 'spam_user',
    name: 'Suspicious User',
    username: 'spam_user',
    avatar: '',
    verified: false,
    status: 'suspended',
    level: 'Beginner',
    joinDate: '2024-01-10',
    lastActive: '2024-01-12T14:20:00Z',
    followers: 12,
    following: 2340,
    posts: 45,
    likes: 23,
    reports: 15,
    reputation: 1.2
  }
]

const mockPosts: PostData[] = [
  {
    id: '1',
    type: 'trade',
    author: 'alex_trader',
    content: 'Just closed my BTC position with +12.3% return!',
    timestamp: '2024-01-15T10:30:00Z',
    likes: 47,
    comments: 12,
    shares: 8,
    reports: 0,
    status: 'approved'
  },
  {
    id: '2',
    type: 'strategy',
    author: 'sarah_crypto',
    content: 'New DeFi arbitrage strategy showing consistent returns...',
    timestamp: '2024-01-15T08:15:00Z',
    likes: 89,
    comments: 23,
    shares: 34,
    reports: 0,
    status: 'approved'
  },
  {
    id: '3',
    type: 'insight',
    author: 'spam_user',
    content: 'Buy my course for guaranteed profits! Link in bio! 🚀🚀🚀',
    timestamp: '2024-01-12T14:20:00Z',
    likes: 2,
    comments: 0,
    shares: 0,
    reports: 8,
    status: 'flagged'
  }
]

const mockReports: ReportData[] = [
  {
    id: '1',
    reportedItem: 'Post: Buy my course for guaranteed...',
    itemType: 'post',
    reporter: 'alex_trader',
    reason: 'Spam/Self-promotion',
    description: 'This user is promoting their course and making unrealistic promises about guaranteed profits.',
    timestamp: '2024-01-12T15:30:00Z',
    status: 'open',
    priority: 'high'
  },
  {
    id: '2',
    reportedItem: 'User: spam_user',
    itemType: 'user',
    reporter: 'sarah_crypto',
    reason: 'Suspicious behavior',
    description: 'Following thousands of users but very few followers, posting promotional content.',
    timestamp: '2024-01-12T16:45:00Z',
    status: 'reviewing',
    priority: 'medium'
  }
]

export default function SocialManagementAdmin() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getStatusBadge = (status: string, type: 'member' | 'post' | 'report' = 'member') => {
    const configs = {
      member: {
        active: 'bg-green-600',
        suspended: 'bg-amber-600',
        banned: 'bg-red-600'
      },
      post: {
        approved: 'bg-green-600',
        pending: 'bg-amber-600',
        flagged: 'bg-red-600',
        removed: 'bg-gray-600'
      },
      report: {
        open: 'bg-red-600',
        reviewing: 'bg-amber-600',
        resolved: 'bg-green-600',
        dismissed: 'bg-gray-600'
      }
    }
    
    return <Badge className={configs[type][status as keyof typeof configs[typeof type]]}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-600',
      medium: 'bg-blue-600',
      high: 'bg-amber-600',
      critical: 'bg-red-600'
    }
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Management</h1>
          <p className="text-gray-400">Manage community members, posts, reports, and social features</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">1,247</div>
                <div className="text-sm text-gray-400">Total Members</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">3,456</div>
                <div className="text-sm text-gray-400">Total Posts</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Flag className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">23</div>
                <div className="text-sm text-gray-400">Open Reports</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">347</div>
                <div className="text-sm text-gray-400">Daily Active</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">Post approved</div>
                      <div className="text-xs text-gray-400">alex_trader's trading strategy • 2 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Flag className="w-5 h-5 text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">Report received</div>
                      <div className="text-xs text-gray-400">spam_user reported for self-promotion • 5 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">Leaderboard updated</div>
                      <div className="text-xs text-gray-400">Monthly rankings recalculated • 10 min ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">New member joined</div>
                      <div className="text-xs text-gray-400">crypto_newbie registered • 15 min ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Community Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Engagement Rate</span>
                  <span className="text-green-400 font-semibold">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Report Resolution Time</span>
                  <span className="text-blue-400 font-semibold">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Member Satisfaction</span>
                  <span className="text-purple-400 font-semibold">4.6/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Moderators</span>
                  <span className="text-cyan-400 font-semibold">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>Manage community members, their status, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members by name, username, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                {mockMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-cyan-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{member.name}</span>
                          {member.verified && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                          {getStatusBadge(member.status, 'member')}
                        </div>
                        <div className="text-sm text-gray-400">
                          @{member.username} • Level: {member.level} • {member.followers} followers
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm text-gray-400">Reputation</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-white">{member.reputation}</span>
                        </div>
                      </div>
                      
                      {member.reports > 0 && (
                        <Badge className="bg-red-600 mr-2">{member.reports} reports</Badge>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Post Management</CardTitle>
              <CardDescription>Review, moderate, and manage community posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPosts.map((post) => (
                  <div key={post.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">{post.type}</Badge>
                        <span className="text-white font-semibold">@{post.author}</span>
                        <span className="text-gray-400 text-sm">{formatTime(post.timestamp)}</span>
                        {getStatusBadge(post.status, 'post')}
                      </div>
                      
                      {post.reports > 0 && (
                        <Badge className="bg-red-600">{post.reports} reports</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-3">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>Review and resolve community reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <div key={report.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Flag className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="font-semibold text-white">{report.reason}</div>
                          <div className="text-sm text-gray-400">
                            Reported by @{report.reporter} • {formatTime(report.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {getPriorityBadge(report.priority)}
                        {getStatusBadge(report.status, 'report')}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm text-gray-400 mb-1">Reported Item:</div>
                      <div className="text-white">{report.reportedItem}</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Description:</div>
                      <div className="text-gray-300">{report.description}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-2" />
                        Investigate
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Leaderboard Management</CardTitle>
              <CardDescription>Manage rankings, competitions, and leaderboard settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Overall Ranking</div>
                    <div className="text-xs text-gray-400">1,247 participants</div>
                    <Button size="sm" className="mt-2 w-full">Recalculate</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">P&L Leaderboard</div>
                    <div className="text-xs text-gray-400">Monthly competition</div>
                    <Button size="sm" className="mt-2 w-full">Update</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-white">Win Rate Rankings</div>
                    <div className="text-xs text-gray-400">All-time stats</div>
                    <Button size="sm" className="mt-2 w-full">Refresh</Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Competition Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto-update rankings</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show real-time changes</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Public leaderboards</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Active Competitions</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="font-semibold text-white">Monthly Masters</div>
                      <div className="text-sm text-gray-400">Ends in 12 days • 234 participants</div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="font-semibold text-white">Weekly Winners</div>
                      <div className="text-sm text-gray-400">Ends in 3 days • 89 participants</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Social Platform Settings</CardTitle>
              <CardDescription>Configure community features and moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Content Moderation</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto-approve verified users</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Require post approval</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">AI content filtering</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto-flag suspicious content</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">User Interactions</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Enable following system</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Allow private messaging</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Public user profiles</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show trading performance</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Notification Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Email new user reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Slack integration</Label>
                      <Switch />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Daily activity digest</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Weekly community report</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


