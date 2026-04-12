"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  MessageSquare, 
  Flag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  TrendingUp,
  AlertTriangle,
  Shield,
  Archive,
  Reply,
  Heart,
  Bookmark,
  MoreVertical,
  RefreshCw,
  Download,
  Settings,
  Users,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Discussion {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    email: string
    avatar: string
    role: string
    reputation: number
  }
  courseId: string
  course: {
    id: string
    title: string
  }
  categoryId: string
  category: {
    id: string
    name: string
    color: string
  }
  tags: string[]
  status: 'active' | 'hidden' | 'locked' | 'archived'
  isPinned: boolean
  isLocked: boolean
  views: number
  likes: number
  replies: number
  lastReply?: {
    id: string
    authorName: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
  moderationStatus: 'approved' | 'pending' | 'rejected' | 'flagged'
  reportCount: number
  moderatedAt?: string
  moderatedBy?: string
  flaggedContent: string[]
  engagement: {
    totalInteractions: number
    uniqueParticipants: number
    averageResponseTime: number
    helpfulnessScore: number
  }
}

interface ModerationStats {
  totalDiscussions: number
  pendingModeration: number
  flaggedDiscussions: number
  hiddenDiscussions: number
  averageResponseTime: number
  totalReports: number
}

interface Category {
  id: string
  name: string
  color: string
  count: number
}

export default function DiscussionModeration() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDiscussions, setSelectedDiscussions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [authorEmailFilter, setAuthorEmailFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Moderation actions
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationAction, setModerationAction] = useState('')
  const [moderationReason, setModerationReason] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load discussions
  useEffect(() => {
    loadDiscussions()
  }, [activeTab, searchQuery, statusFilter, categoryFilter, authorEmailFilter, sortBy, sortOrder, currentPage])

  const loadDiscussions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder
      })

      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('categoryId', categoryFilter)
      if (authorEmailFilter) params.set('authorEmail', authorEmailFilter)

      const response = await fetch(`/api/admin/lms/discussions?${params}`)
      const data = await response.json()

      if (data.success) {
        setDiscussions(data.discussions)
        setModerationStats(data.moderationStats)
        setCategories(data.categories)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDiscussion = (discussionId: string) => {
    setSelectedDiscussions(prev => 
      prev.includes(discussionId)
        ? prev.filter(id => id !== discussionId)
        : [...prev, discussionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDiscussions.length === discussions.length) {
      setSelectedDiscussions([])
    } else {
      setSelectedDiscussions(discussions.map(d => d.id))
    }
  }

  const handleBulkModeration = async (operation: string) => {
    if (selectedDiscussions.length === 0) return

    try {
      const response = await fetch('/api/admin/lms/discussions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation,
          discussionIds: selectedDiscussions,
          reason: moderationReason,
          moderationNote: `Bulk ${operation} operation`
        })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedDiscussions([])
        setModerationReason('')
        setShowModerationModal(false)
        loadDiscussions()
      }
    } catch (error) {
      console.error('Error performing bulk moderation:', error)
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

  const getStatusBadge = (discussion: Discussion) => {
    if (discussion.reportCount > 0) {
      return <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
        <Flag className="w-3 h-3 mr-1" />
        {discussion.reportCount} Reports
      </Badge>
    }

    switch (discussion.moderationStatus) {
      case 'pending':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50">Pending Review</Badge>
      case 'approved':
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/50">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/50">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/50">Flagged</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (discussion: Discussion) => {
    if (discussion.status === 'hidden') return <EyeOff className="w-4 h-4 text-gray-400" />
    if (discussion.isLocked) return <Lock className="w-4 h-4 text-gray-400" />
    if (discussion.isPinned) return <Pin className="w-4 h-4 text-yellow-500" />
    return <Eye className="w-4 h-4 text-gray-400" />
  }

  const filteredDiscussions = discussions.filter(discussion => {
    switch (activeTab) {
      case 'pending':
        return discussion.moderationStatus === 'pending'
      case 'flagged':
        return discussion.reportCount > 0 || discussion.moderationStatus === 'flagged'
      case 'hidden':
        return discussion.status === 'hidden'
      case 'approved':
        return discussion.moderationStatus === 'approved'
      default:
        return true
    }
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discussion Moderation</h1>
          <p className="text-gray-400">Manage community discussions and maintain content quality</p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={loadDiscussions}
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={showModerationModal} onOpenChange={setShowModerationModal}>
            <DialogTrigger asChild>
              <Button 
                disabled={selectedDiscussions.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Bulk Actions ({selectedDiscussions.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Bulk Moderation Actions</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Perform actions on {selectedDiscussions.length} selected discussions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Action</Label>
                  <Select value={moderationAction} onValueChange={setModerationAction}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="hide">Hide</SelectItem>
                      <SelectItem value="lock">Lock</SelectItem>
                      <SelectItem value="unlock">Unlock</SelectItem>
                      <SelectItem value="pin">Pin</SelectItem>
                      <SelectItem value="unpin">Unpin</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(moderationAction === 'hide' || moderationAction === 'delete') && (
                  <div>
                    <Label>Reason (Required)</Label>
                    <Textarea
                      placeholder="Provide a reason for this action..."
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowModerationModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleBulkModeration(moderationAction)}
                    disabled={!moderationAction || ((moderationAction === 'hide' || moderationAction === 'delete') && !moderationReason)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {moderationStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Discussions</p>
                  <p className="text-2xl font-bold text-white">{moderationStats.totalDiscussions}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">{moderationStats.pendingModeration}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Flagged</p>
                  <p className="text-2xl font-bold text-red-400">{moderationStats.flaggedDiscussions}</p>
                </div>
                <Flag className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Hidden</p>
                  <p className="text-2xl font-bold text-gray-400">{moderationStats.hiddenDiscussions}</p>
                </div>
                <EyeOff className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-cyan-400">{moderationStats.averageResponseTime}h</p>
                </div>
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold text-orange-400">{moderationStats.totalReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by author email..."
              value={authorEmailFilter}
              onChange={(e) => setAuthorEmailFilter(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white"
            />

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [sort, order] = value.split('-')
              setSortBy(sort)
              setSortOrder(order)
            }}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="views-desc">Most Viewed</SelectItem>
                <SelectItem value="replies-desc">Most Replies</SelectItem>
                <SelectItem value="reports-desc">Most Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50 border-gray-700">
          <TabsTrigger value="all" className="text-gray-300 data-[state=active]:text-white">
            All ({discussions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-gray-300 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-1" />
            Pending ({discussions.filter(d => d.moderationStatus === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="text-gray-300 data-[state=active]:text-white">
            <Flag className="w-4 h-4 mr-1" />
            Flagged ({discussions.filter(d => d.reportCount > 0).length})
          </TabsTrigger>
          <TabsTrigger value="hidden" className="text-gray-300 data-[state=active]:text-white">
            <EyeOff className="w-4 h-4 mr-1" />
            Hidden ({discussions.filter(d => d.status === 'hidden').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-gray-300 data-[state=active]:text-white">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved ({discussions.filter(d => d.moderationStatus === 'approved').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Bulk Actions Bar */}
          {selectedDiscussions.length > 0 && (
            <Card className="bg-blue-900/20 border-blue-700 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300">
                    {selectedDiscussions.length} discussions selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedDiscussions([])}>
                      Clear Selection
                    </Button>
                    <Button size="sm" onClick={() => setShowModerationModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      Bulk Actions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select All */}
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={selectedDiscussions.length === discussions.length && discussions.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm text-gray-300">
              Select all discussions on this page
            </Label>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
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
                {filteredDiscussions.map((discussion) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedDiscussions.includes(discussion.id)}
                            onCheckedChange={() => handleSelectDiscussion(discussion.id)}
                          />

                          <Avatar className="w-12 h-12">
                            <AvatarImage src={discussion.author.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                              {discussion.author.name[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusIcon(discussion)}
                                  <Badge style={{ backgroundColor: discussion.category.color + '20', color: discussion.category.color }}>
                                    {discussion.category.name}
                                  </Badge>
                                  {getStatusBadge(discussion)}
                                  {discussion.flaggedContent.length > 0 && (
                                    <Badge className="bg-red-600/20 text-red-400">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Flagged Content
                                    </Badge>
                                  )}
                                </div>

                                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
                                  {discussion.title}
                                </h3>

                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                  {discussion.content}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      <span>{discussion.author.name}</span>
                                      <span className="text-xs">({discussion.author.email})</span>
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
                                      <Heart className="w-4 h-4" />
                                      <span>{discussion.likes}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{formatTimeAgo(discussion.createdAt)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      Engagement: {discussion.engagement.helpfulnessScore}/10
                                    </span>
                                  </div>
                                </div>

                                {discussion.flaggedContent.length > 0 && (
                                  <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                                    <p className="text-red-300 text-sm font-medium mb-1">Flagged Content:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {discussion.flaggedContent.map((flag) => (
                                        <Badge key={flag} className="bg-red-600/20 text-red-400 text-xs">
                                          {flag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {filteredDiscussions.length === 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No discussions found</h3>
                      <p className="text-gray-400">
                        No discussions match the current filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

