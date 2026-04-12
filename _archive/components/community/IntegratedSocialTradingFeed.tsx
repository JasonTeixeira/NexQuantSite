"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
  ImageIcon,
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
  Percent,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

// Import our API hooks
import { 
  usePosts, 
  useCreatePost, 
  useReactions, 
  useComments,
  useCreateComment,
  useUsers,
  useFollow 
} from '@/lib/hooks/use-community'
import type { Post } from '@/lib/api/community-client'

interface IntegratedSocialTradingFeedProps {
  className?: string
}

export default function IntegratedSocialTradingFeed({ className }: IntegratedSocialTradingFeedProps) {
  // UI State
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [filter, setFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Post creation state
  const [newPost, setNewPost] = useState({
    type: 'insight' as const,
    title: '',
    content: '',
    tags: '',
    tradingData: {
      symbol: '',
      action: 'buy' as const,
      entryPrice: '',
      targetPrice: '',
      stopLoss: '',
      timeframe: '',
      analysis: '',
      confidence: 70
    }
  })

  // API Hooks
  const { 
    data: posts, 
    loading: postsLoading, 
    error: postsError,
    hasMore,
    loadMore,
    refetch: refetchPosts 
  } = usePosts({
    type: filter !== 'all' ? filter as any : undefined,
    sortBy: sortBy as any,
    sortOrder: 'desc',
    limit: 10
  })

  const { createPost, loading: createLoading } = useCreatePost()
  const { followUser, loading: followLoading } = useFollow()

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    if (!posts) return []
    
    switch (activeTab) {
      case 'following':
        // In a real app, this would filter by followed users
        return posts.filter(post => post.author.verified) // Placeholder: show verified users
      case 'trending':
        return posts.filter(post => post.views > 1000)
      case 'recent':
        return posts.slice().sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      default:
        return posts
    }
  }, [posts, activeTab])

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const postData = {
      type: newPost.type,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      tradingData: newPost.type === 'trade' && newPost.tradingData.symbol ? {
        symbol: newPost.tradingData.symbol.toUpperCase(),
        action: newPost.tradingData.action,
        entryPrice: parseFloat(newPost.tradingData.entryPrice) || undefined,
        targetPrice: parseFloat(newPost.tradingData.targetPrice) || undefined,
        stopLoss: parseFloat(newPost.tradingData.stopLoss) || undefined,
        timeframe: newPost.tradingData.timeframe,
        analysis: newPost.tradingData.analysis,
        confidence: newPost.tradingData.confidence
      } : undefined
    }

    const createdPost = await createPost(postData)
    
    if (createdPost) {
      setShowCreateModal(false)
      setNewPost({
        type: 'insight',
        title: '',
        content: '',
        tags: '',
        tradingData: {
          symbol: '',
          action: 'buy',
          entryPrice: '',
          targetPrice: '',
          stopLoss: '',
          timeframe: '',
          analysis: '',
          confidence: 70
        }
      })
      refetchPosts()
    }
  }

  // Handle follow user
  const handleFollowUser = async (userId: string, isFollowing: boolean) => {
    await followUser(userId, isFollowing ? 'unfollow' : 'follow')
    // The parent should refetch user data, but for now we'll just show a success message
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  // Get post type icon and color
  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case 'trade': return { icon: BarChart3, color: 'text-green-400', bgColor: 'bg-green-900/20' }
      case 'strategy': return { icon: Target, color: 'text-blue-400', bgColor: 'bg-blue-900/20' }
      case 'insight': return { icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-900/20' }
      case 'question': return { icon: MessageSquare, color: 'text-amber-400', bgColor: 'bg-amber-900/20' }
      case 'news': return { icon: ExternalLink, color: 'text-cyan-400', bgColor: 'bg-cyan-900/20' }
      default: return { icon: MessageSquare, color: 'text-gray-400', bgColor: 'bg-gray-900/20' }
    }
  }

  // Post component with reactions
  const PostCard = ({ post }: { post: Post }) => {
    const { toggleReaction, loading: reactionLoading } = useReactions(post.id)
    const [showComments, setShowComments] = useState(false)
    
    const typeInfo = getPostTypeInfo(post.type)
    const TypeIcon = typeInfo.icon

    const handleReaction = async (reactionType: string) => {
      await toggleReaction(reactionType)
      refetchPosts() // Refresh to get updated reaction counts
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-blue-500/50">
                  <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                  <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/community/users/${post.author.id}`}
                      className="font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {post.author.displayName}
                    </Link>
                    {post.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {post.author.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>@{post.author.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    <span>•</span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${typeInfo.bgColor}`}>
                      <TypeIcon className={`w-3 h-3 ${typeInfo.color}`} />
                      <span className={`text-xs capitalize ${typeInfo.color}`}>
                        {post.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Post Title */}
            <h3 className="text-lg font-semibold text-white mb-3">
              {post.title}
            </h3>

            {/* Post Content */}
            <div className="text-gray-300 mb-4 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Trading Data */}
            {post.tradingData && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {post.tradingData.symbol}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${
                        post.tradingData.action === 'buy' 
                          ? 'border-green-500 text-green-400' 
                          : 'border-red-500 text-red-400'
                      }`}
                    >
                      {post.tradingData.action.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {post.tradingData.entryPrice && (
                    <div className="text-sm text-gray-400">
                      Entry: <span className="text-white">${post.tradingData.entryPrice}</span>
                    </div>
                  )}
                  
                  {post.tradingData.targetPrice && (
                    <div className="text-sm text-gray-400">
                      Target: <span className="text-green-400">${post.tradingData.targetPrice}</span>
                    </div>
                  )}
                  
                  {post.tradingData.stopLoss && (
                    <div className="text-sm text-gray-400">
                      Stop: <span className="text-red-400">${post.tradingData.stopLoss}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-400">
                    Confidence: <span className="text-cyan-400">{post.tradingData.confidence}%</span>
                  </div>
                </div>
                
                {post.tradingData.analysis && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-300">{post.tradingData.analysis}</p>
                  </div>
                )}
              </div>
            )}

            {/* Media */}
            {post.media && (
              <div className="mb-4">
                <img 
                  src={post.media.url} 
                  alt="Post media"
                  className="rounded-lg w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.comments}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                {post.shares}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                {/* Reactions */}
                {post.reactions.map((reaction) => (
                  <Button
                    key={reaction.type}
                    variant={reaction.hasUserReacted ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleReaction(reaction.type)}
                    disabled={reactionLoading}
                    className="flex items-center gap-2"
                  >
                    {reaction.type === 'like' && <Heart className={`w-4 h-4 ${reaction.hasUserReacted ? 'fill-current text-red-500' : ''}`} />}
                    {reaction.type === 'bullish' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {reaction.type === 'bearish' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {reaction.type === 'fire' && <Flame className="w-4 h-4 text-orange-500" />}
                    {reaction.type === 'genius' && <Star className="w-4 h-4 text-yellow-500" />}
                    <span>{reaction.count}</span>
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <PostComments postId={post.id} />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Comments component
  const PostComments = ({ postId }: { postId: string }) => {
    const { data: comments, loading: commentsLoading, refetch: refetchComments } = useComments(postId)
    const { createComment, loading: createCommentLoading } = useCreateComment(postId)
    const [newComment, setNewComment] = useState('')

    const handleSubmitComment = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newComment.trim()) return

      const comment = await createComment({
        content: newComment.trim()
      })

      if (comment) {
        setNewComment('')
        refetchComments()
      }
    }

    return (
      <div className="space-y-4">
        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            disabled={createCommentLoading || !newComment.trim()}
          >
            {createCommentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{comment.author.displayName}</span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      <Heart className="w-3 h-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Trading Community</h1>
              <p className="text-gray-400">Connect, share strategies, and learn from traders worldwide</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
              
              <Button variant="outline" onClick={() => refetchPosts()} disabled={postsLoading}>
                <RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Tabs and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-gray-800">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trade">Trades</SelectItem>
                  <SelectItem value="strategy">Strategies</SelectItem>
                  <SelectItem value="insight">Insights</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="createdAt">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="comments">Most Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Loading State */}
          {postsLoading && filteredPosts.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading posts...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {postsError && (
            <div className="text-center py-12">
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-red-400 font-semibold mb-2">Error Loading Posts</h3>
                <p className="text-red-300 mb-4">{postsError}</p>
                <Button onClick={() => refetchPosts()} variant="outline" className="border-red-600">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-6">
              <Button onClick={loadMore} disabled={postsLoading} variant="outline">
                {postsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!postsLoading && filteredPosts.length === 0 && !postsError && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
              <p className="text-gray-400 mb-6">Be the first to share your trading insights!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your trading insights with the community
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postType">Post Type</Label>
                <Select value={newPost.type} onValueChange={(value: any) => setNewPost(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="trade">Trade Idea</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="insight">Market Insight</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., TSLA, options, earnings"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a compelling title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border-gray-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your analysis, insights, or questions..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="bg-gray-800 border-gray-600 min-h-32"
                required
              />
            </div>

            {/* Trading Data (only for trade posts) */}
            {newPost.type === 'trade' && (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-white mb-3">Trading Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., AAPL"
                      value={newPost.tradingData.symbol}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, symbol: e.target.value }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="action">Action</Label>
                    <Select 
                      value={newPost.tradingData.action} 
                      onValueChange={(value: any) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, action: value }
                      }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      placeholder="150.00"
                      type="number"
                      step="0.01"
                      value={newPost.tradingData.entryPrice}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, entryPrice: e.target.value }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetPrice">Target Price</Label>
                    <Input
                      id="targetPrice"
                      placeholder="180.00"
                      type="number"
                      step="0.01"
                      value={newPost.tradingData.targetPrice}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, targetPrice: e.target.value }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      placeholder="140.00"
                      type="number"
                      step="0.01"
                      value={newPost.tradingData.stopLoss}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, stopLoss: e.target.value }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Input
                      id="timeframe"
                      placeholder="1-2 weeks"
                      value={newPost.tradingData.timeframe}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, timeframe: e.target.value }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confidence">Confidence (%)</Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="0"
                      max="100"
                      value={newPost.tradingData.confidence}
                      onChange={(e) => setNewPost(prev => ({
                        ...prev,
                        tradingData: { ...prev.tradingData, confidence: parseInt(e.target.value) }
                      }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="analysis">Analysis</Label>
                  <Textarea
                    id="analysis"
                    placeholder="Explain your technical or fundamental analysis..."
                    value={newPost.tradingData.analysis}
                    onChange={(e) => setNewPost(prev => ({
                      ...prev,
                      tradingData: { ...prev.tradingData, analysis: e.target.value }
                    }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLoading || !newPost.title.trim() || !newPost.content.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

