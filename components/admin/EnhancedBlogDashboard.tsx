"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Check,
  X,
  Star,
  Calendar,
  BarChart3,
  Upload,
  Download,
  Shield,
  Crown,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Tag,
  FileText,
  Image,
  Code,
  Archive,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  authorId: string
  authorName: string
  authorType: 'master' | 'guest'
  category: string
  tags: string[]
  status: 'draft' | 'pending' | 'published' | 'archived'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  revenue: number
  featured: boolean
  seoTitle?: string
  seoDescription?: string
}

interface BlogSettings {
  autoApprove: boolean
  revenueShareEnabled: boolean
  guestAuthorRevenueShare: number
  allowGuestTagCreation: boolean
  allowGuestFileUploads: boolean
  moderationRequired: boolean
}

interface GuestAuthor {
  id: string
  name: string
  email: string
  status: 'pending' | 'approved' | 'suspended' | 'banned'
  stats: {
    totalPosts: number
    publishedPosts: number
    totalViews: number
    totalRevenue: number
  }
  joinedAt: string
}

export default function EnhancedBlogDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [authors, setAuthors] = useState<GuestAuthor[]>([])
  const [settings, setSettings] = useState<BlogSettings>({
    autoApprove: false,
    revenueShareEnabled: true,
    guestAuthorRevenueShare: 60,
    allowGuestTagCreation: true,
    allowGuestFileUploads: true,
    moderationRequired: true
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadBlogData()
  }, [])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      
      // Load blog posts with revenue data (admin access)
      const postsResponse = await fetch('/api/blog?includeRevenue=true')
      const postsData = await postsResponse.json()
      
      // Load guest authors
      const authorsResponse = await fetch('/api/blog/authors?includeStats=true&includeRevenue=true')
      const authorsData = await authorsResponse.json()
      
      // Load settings
      const settingsResponse = await fetch('/api/blog/settings', {
        headers: { 'Authorization': 'Bearer admin_token' } // In production, use real admin JWT
      })
      const settingsData = await settingsResponse.json()
      
      if (postsData.success) setPosts(postsData.posts || [])
      if (authorsData.success) setAuthors(authorsData.authors || [])
      if (settingsData.success) setSettings(settingsData.settings || settings)
    } catch (error) {
      console.error('Failed to load blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesAuthor = authorFilter === "all" || post.authorType === authorFilter
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesAuthor && matchesCategory
  })

  // Handle post actions
  const handlePostAction = async (postId: number, action: string) => {
    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action })
      })

      const data = await response.json()
      if (data.success) {
        await loadBlogData() // Reload data
      }
    } catch (error) {
      console.error('Failed to perform action:', error)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/blog?id=${postId}`, {
          method: 'DELETE'
        })

        const data = await response.json()
        if (data.success) {
          await loadBlogData()
        }
      } catch (error) {
        console.error('Failed to delete post:', error)
      }
    }
  }

  // Handle author actions
  const handleAuthorAction = async (authorId: string, action: string) => {
    try {
      const response = await fetch('/api/blog/authors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId, action })
      })

      const data = await response.json()
      if (data.success) {
        await loadBlogData()
      }
    } catch (error) {
      console.error('Failed to perform author action:', error)
    }
  }

  // Handle settings updates
  const handleSettingsUpdate = async (setting: string, value: any) => {
    try {
      const response = await fetch('/api/blog/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin_token'
        },
        body: JSON.stringify({ setting, value })
      })

      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  // Calculate stats
  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    pendingPosts: posts.filter(p => p.status === 'pending').length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0),
    totalRevenue: posts.reduce((sum, post) => sum + post.revenue, 0),
    guestPosts: posts.filter(p => p.authorType === 'guest').length,
    masterPosts: posts.filter(p => p.authorType === 'master').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getAuthorTypeColor = (type: string) => {
    return type === 'master' 
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400">Loading comprehensive blog dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              Master Blog Control
            </h1>
            <p className="text-gray-400 mt-2">Complete control over all blog content and authors</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettingsDialog(true)}
              variant="outline"
              className="border-primary/30 text-primary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Blog Settings
            </Button>
            <Button className="bg-primary text-black hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-green-400">{stats.publishedPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Your Posts</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.masterPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">Guest Posts</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.guestPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Settings Bar */}
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.autoApprove}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoApprove', checked)}
                  />
                  <Label className="text-sm text-gray-300">Auto-approve guest posts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.revenueShareEnabled}
                    onCheckedChange={(checked) => handleSettingsUpdate('revenueShareEnabled', checked)}
                  />
                  <Label className="text-sm text-gray-300">Revenue sharing ({settings.guestAuthorRevenueShare}%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.allowGuestFileUploads}
                    onCheckedChange={(checked) => handleSettingsUpdate('allowGuestFileUploads', checked)}
                  />
                  <Label className="text-sm text-gray-300">Allow file uploads</Label>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Master Control Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              All Posts ({stats.totalPosts})
            </TabsTrigger>
            <TabsTrigger value="authors" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Guest Authors ({authors.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Analytics & Revenue
            </TabsTrigger>
          </TabsList>

          {/* Posts Management Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Filters and Search */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts or authors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={authorFilter} onValueChange={setAuthorFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Author Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      <SelectItem value="master">Your Posts</SelectItem>
                      <SelectItem value="guest">Guest Authors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Trading Strategies">Trading Strategies</SelectItem>
                      <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                      <SelectItem value="Bot Development">Bot Development</SelectItem>
                      <SelectItem value="Risk Management">Risk Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-primary/30 text-primary">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Table */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  All Blog Posts - Master Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{post.title}</h3>
                              {post.featured && <Star className="h-4 w-4 text-yellow-400" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span>{post.category}</span>
                              <span>•</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-1">
                              {post.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getAuthorTypeColor(post.authorType)}>
                              {post.authorType === 'master' ? (
                                <Crown className="h-3 w-3 mr-1" />
                              ) : (
                                <Users className="h-3 w-3 mr-1" />
                              )}
                              {post.authorName}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {post.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {post.status === 'draft' && <Edit className="h-3 w-3 mr-1" />}
                            {post.status === 'archived' && <Archive className="h-3 w-3 mr-1" />}
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="h-3 w-3 text-gray-400" />
                              <span>{post.views.toLocaleString()}</span>
                              <ThumbsUp className="h-3 w-3 text-gray-400" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-400 font-medium">
                              ${post.revenue.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuLabel>Master Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Post
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Post
                              </DropdownMenuItem>
                              {post.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handlePostAction(post.id, 'approve')}>
                                    <Check className="mr-2 h-4 w-4 text-green-400" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePostAction(post.id, 'reject')}>
                                    <X className="mr-2 h-4 w-4 text-red-400" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handlePostAction(post.id, post.featured ? 'unfeature' : 'feature')}>
                                <Star className="mr-2 h-4 w-4 text-yellow-400" />
                                {post.featured ? 'Unfeature' : 'Feature'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-600" />
                              <DropdownMenuItem 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guest Authors Tab */}
          <TabsContent value="authors" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Guest Author Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{author.name}</p>
                            <p className="text-sm text-gray-400">{author.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(author.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            author.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            author.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {author.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>{author.stats.totalPosts} total</div>
                            <div className="text-green-400">{author.stats.publishedPosts} published</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {author.stats.totalViews.toLocaleString()} views
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-green-400 font-medium">
                            ${author.stats.totalRevenue.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuLabel>Author Actions</DropdownMenuLabel>
                              {author.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleAuthorAction(author.id, 'approve')}>
                                  <Check className="mr-2 h-4 w-4 text-green-400" />
                                  Approve Author
                                </DropdownMenuItem>
                              )}
                              {author.status === 'approved' && (
                                <DropdownMenuItem onClick={() => handleAuthorAction(author.id, 'suspend')}>
                                  <AlertTriangle className="mr-2 h-4 w-4 text-yellow-400" />
                                  Suspend Author
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Revenue Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-600" />
                              <DropdownMenuItem 
                                onClick={() => handleAuthorAction(author.id, 'ban')}
                                className="text-red-400"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Ban Author
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Blog Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Published Posts</span>
                      <span>{stats.publishedPosts}</span>
                    </div>
                    <Progress value={(stats.publishedPosts / stats.totalPosts) * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Guest Contribution</span>
                      <span>{Math.round((stats.guestPosts / stats.totalPosts) * 100)}%</span>
                    </div>
                    <Progress value={(stats.guestPosts / stats.totalPosts) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Revenue</span>
                    <span className="text-green-400 font-bold text-xl">
                      ${stats.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Your Share (40%)</span>
                    <span className="text-purple-400 font-medium">
                      ${(stats.totalRevenue * 0.4).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Guest Author Share (60%)</span>
                    <span className="text-orange-400 font-medium">
                      ${(stats.totalRevenue * 0.6).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Master Blog Settings
              </DialogTitle>
              <DialogDescription>
                Configure blog behavior and guest author permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Guest Author Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve guest posts</Label>
                    <p className="text-sm text-gray-400">Automatically publish guest posts without review</p>
                  </div>
                  <Switch
                    checked={settings.autoApprove}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoApprove', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Guest Author Revenue Share (%)</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.guestAuthorRevenueShare}
                      onChange={(e) => handleSettingsUpdate('guestAuthorRevenueShare', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700 w-20"
                    />
                    <span className="text-sm text-gray-400">
                      You get {100 - settings.guestAuthorRevenueShare}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow file uploads</Label>
                    <p className="text-sm text-gray-400">Let guest authors upload images, code, and documents</p>
                  </div>
                  <Switch
                    checked={settings.allowGuestFileUploads}
                    onCheckedChange={(checked) => handleSettingsUpdate('allowGuestFileUploads', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow tag creation</Label>
                    <p className="text-sm text-gray-400">Let guest authors create new content tags</p>
                  </div>
                  <Switch
                    checked={settings.allowGuestTagCreation}
                    onCheckedChange={(checked) => handleSettingsUpdate('allowGuestTagCreation', checked)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


