"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useIsMobile, MobileCard, MobileButton, MobileInput, MobileTextarea } from "@/components/ui/mobile-responsive-wrapper"
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Heart, 
  Bookmark,
  Eye,
  Reply,
  Pin,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
  CheckCircle,
  Star,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Users,
  Award,
  Flame,
  ThumbsUp,
  Send,
  Hash,
  Calendar,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Discussion {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    avatar: string
    reputation: number
    badges: string[]
    role?: string
  }
  courseId: string | null
  course?: {
    id: string
    title: string
  }
  categoryId: string
  category: {
    id: string
    name: string
    color: string
    icon: string
  }
  tags: string[]
  isPinned: boolean
  views: number
  likes: number
  replies: number
  hasUserLiked: boolean
  hasUserBookmarked: boolean
  lastReply?: {
    id: string
    author: {
      id: string
      name: string
      avatar: string
      role: string
      badges: string[]
    }
    content: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
  isAnswered?: boolean
  bestAnswerId?: string | null
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description: string
  count: number
}

interface DiscussionForumsProps {
  courseId?: string
}

export default function DiscussionForums({ courseId }: DiscussionForumsProps) {
  const { isMobile, isTablet } = useIsMobile()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showSidebar, setShowSidebar] = useState(!isMobile)

  // Create Discussion Form State
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: ''
  })

  // Load discussions
  useEffect(() => {
    loadDiscussions()
  }, [activeTab, selectedCategory, searchQuery, sortBy, currentPage, courseId])

  const loadDiscussions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy
      })

      if (courseId) params.set('courseId', courseId)
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/discussions?${params}`)
      const data = await response.json()

      if (data.success) {
        setDiscussions(data.discussions)
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter discussions based on active tab
  const filteredDiscussions = useMemo(() => {
    let filtered = discussions

    switch (activeTab) {
      case 'pinned':
        filtered = discussions.filter(d => d.isPinned)
        break
      case 'answered':
        filtered = discussions.filter(d => d.isAnswered)
        break
      case 'unanswered':
        filtered = discussions.filter(d => !d.isAnswered)
        break
      case 'my-posts':
        // In a real app, filter by current user's posts
        filtered = discussions.filter(d => d.author.id === 'current-user')
        break
      case 'bookmarked':
        filtered = discussions.filter(d => d.hasUserBookmarked)
        break
      default:
        filtered = discussions
    }

    return filtered
  }, [discussions, activeTab])

  // Handle discussion creation
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newDiscussion.title,
          content: newDiscussion.content,
          categoryId: newDiscussion.categoryId,
          courseId,
          tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateModal(false)
        setNewDiscussion({ title: '', content: '', categoryId: '', tags: '' })
        loadDiscussions() // Reload discussions
      }
    } catch (error) {
      console.error('Error creating discussion:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle className="w-4 h-4" />
      case 'BookOpen': return <BookOpen className="w-4 h-4" />
      case 'MessageCircle': return <MessageCircle className="w-4 h-4" />
      case 'MessageSquare': return <MessageSquare className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className={`${isMobile ? '' : 'max-w-7xl mx-auto'}`}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`font-bold text-white mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Community Forums
            </h1>
            <p className={`text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
              Connect with fellow learners, ask questions, and share knowledge
            </p>
          </div>

          {!isMobile && (
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          )}
        </div>

        {/* Mobile-first search and controls */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <MobileInput
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={`bg-gray-800/50 border-gray-700 text-white ${isMobile ? 'flex-1' : 'w-40'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Latest Activity</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>

            {isMobile && (
              <Button 
                onClick={() => setShowSidebar(!showSidebar)}
                variant="outline" 
                size="sm"
                className="border-gray-600"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Start a new conversation with the community
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What would you like to discuss?"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newDiscussion.categoryId} 
                    onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.icon)}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts, ask questions, or start a discussion..."
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., trading, beginner, question"
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                    <Send className="w-4 h-4 mr-2" />
                    Create Discussion
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className={`grid gap-4 lg:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        {/* Sidebar */}
        {(showSidebar || !isMobile) && (
          <div className={`lg:col-span-1 space-y-4 ${isMobile ? 'fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm p-4 overflow-y-auto' : ''}`}>
          {/* Categories */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === '' ? 'secondary' : 'ghost'}
                onClick={() => setSelectedCategory('')}
                className="w-full justify-start text-gray-300 hover:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="w-full justify-between text-gray-300 hover:text-white group"
                >
                  <div className="flex items-center gap-2">
                    <div style={{ color: category.color }}>
                      {getCategoryIcon(category.icon)}
                    </div>
                    <span>{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-auto group-hover:bg-gray-600">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Discussions</span>
                <span className="text-white font-semibold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Members</span>
                <span className="text-white font-semibold">892</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Answered Questions</span>
                <span className="text-green-400 font-semibold">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="text-cyan-400 font-semibold">2.4h</span>
              </div>
            </CardContent>
          </Card>

          {/* Mobile close button */}
          {isMobile && (
            <div className="flex justify-center pt-4">
              <MobileButton 
                variant="secondary" 
                onClick={() => setShowSidebar(false)}
                className="px-8"
              >
                Close
              </MobileButton>
            </div>
          )}
        </div>
        )}

        {/* Mobile overlay */}
        {isMobile && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setShowSidebar(false)} 
          />
        )}

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-800/50 border-gray-700 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="text-gray-300 data-[state=active]:text-white">
                All Discussions
              </TabsTrigger>
              <TabsTrigger value="pinned" className="text-gray-300 data-[state=active]:text-white">
                <Pin className="w-4 h-4 mr-1" />
                Pinned
              </TabsTrigger>
              <TabsTrigger value="answered" className="text-gray-300 data-[state=active]:text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Answered
              </TabsTrigger>
              <TabsTrigger value="unanswered" className="text-gray-300 data-[state=active]:text-white">
                <HelpCircle className="w-4 h-4 mr-1" />
                Unanswered
              </TabsTrigger>
              <TabsTrigger value="bookmarked" className="text-gray-300 data-[state=active]:text-white">
                <Bookmark className="w-4 h-4 mr-1" />
                Bookmarked
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-700 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-700 rounded w-1/2" />
                            <div className="h-3 bg-gray-700 rounded w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredDiscussions.map((discussion) => (
                      <motion.div
                        key={discussion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors group cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Author Avatar */}
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={discussion.author.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                  {discussion.author.name[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {discussion.isPinned && (
                                        <Pin className="w-4 h-4 text-yellow-500" />
                                      )}
                                      <Badge 
                                        style={{ backgroundColor: discussion.category.color + '20', color: discussion.category.color }}
                                        className="text-xs"
                                      >
                                        {getCategoryIcon(discussion.category.icon)}
                                        <span className="ml-1">{discussion.category.name}</span>
                                      </Badge>
                                      {discussion.isAnswered && (
                                        <Badge className="bg-green-600/20 text-green-400 text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Answered
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors line-clamp-2">
                                      {discussion.title}
                                    </h3>
                                  </div>

                                  <div className="text-right text-sm text-gray-400 shrink-0">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(discussion.updatedAt)}
                                    </div>
                                  </div>
                                </div>

                                {/* Content Preview */}
                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                  {discussion.excerpt}
                                </p>

                                {/* Tags */}
                                {discussion.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {discussion.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs text-gray-400 border-gray-600">
                                        #{tag}
                                      </Badge>
                                    ))}
                                    {discussion.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                        +{discussion.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      <span>{discussion.author.name}</span>
                                      <div className="flex gap-1 ml-1">
                                        {discussion.author.badges.slice(0, 2).map((badge) => (
                                          <Badge key={badge} className="bg-purple-600/20 text-purple-400 text-xs px-1 py-0">
                                            {badge}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      <span>{discussion.views}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Reply className="w-4 h-4" />
                                      <span>{discussion.replies}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Heart className={`w-4 h-4 ${discussion.hasUserLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                      <span>{discussion.likes}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                      <Bookmark className={`w-4 h-4 ${discussion.hasUserBookmarked ? 'fill-current text-cyan-400' : ''}`} />
                                    </Button>
                                  </div>
                                </div>

                                {/* Last Reply */}
                                {discussion.lastReply && (
                                  <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border-l-2 border-cyan-600/50">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={discussion.lastReply.author.avatar} />
                                        <AvatarFallback className="bg-gray-600 text-xs">
                                          {discussion.lastReply.author.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-gray-300 font-medium">
                                        {discussion.lastReply.author.name}
                                      </span>
                                      {discussion.lastReply.author.role === 'instructor' && (
                                        <Badge className="bg-blue-600/20 text-blue-400 text-xs">
                                          Instructor
                                        </Badge>
                                      )}
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {formatTimeAgo(discussion.lastReply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                      {discussion.lastReply.content}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                    {filteredDiscussions.length === 0 && (
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-12 text-center">
                          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No discussions found</h3>
                          <p className="text-gray-400 mb-6">
                            Be the first to start a conversation in this category!
                          </p>
                          <Button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Start Discussion
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <button className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all mobile-tap-target">
              <Plus className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
              <DialogDescription className="text-gray-400">
                Start a new conversation with the community
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <Label htmlFor="mobile-title">Title</Label>
                <MobileInput
                  id="mobile-title"
                  placeholder="What would you like to discuss?"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile-category">Category</Label>
                <Select 
                  value={newDiscussion.categoryId} 
                  onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white mobile-input">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category.icon)}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobile-content">Content</Label>
                <MobileTextarea
                  id="mobile-content"
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile-tags">Tags (comma separated)</Label>
                <MobileInput
                  id="mobile-tags"
                  placeholder="e.g., trading, beginner, question"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <MobileButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </MobileButton>
                <MobileButton type="submit" variant="primary">
                  <Send className="w-4 h-4 mr-2" />
                  Create Discussion
                </MobileButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  )
}
