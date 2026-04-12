"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  Send,
  User,
  Crown,
  Award,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  SortAsc,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Comment {
  id: number
  postId: number
  parentId: number | null
  authorId: string
  authorName: string
  authorType: 'user' | 'guest_author' | 'admin'
  authorAvatar: string | null
  content: string
  likes: number
  dislikes: number
  reported: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
  edited: boolean
  replies: number
  children?: Comment[]
}

interface CommentStats {
  totalComments: number
  approvedComments: number
  pendingComments: number
  reportedComments: number
  totalLikes: number
  uniqueCommenters: number
}

interface InteractiveCommentSystemProps {
  postId: number
  currentUser?: {
    id: string
    name: string
    type: 'user' | 'guest_author' | 'admin'
    avatar?: string
  } | null
  isAdmin?: boolean
}

export default function InteractiveCommentSystem({ 
  postId, 
  currentUser, 
  isAdmin = false 
}: InteractiveCommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [showPending, setShowPending] = useState(isAdmin)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [showReportDialog, setShowReportDialog] = useState<number | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())

  // Load comments
  useEffect(() => {
    loadComments()
  }, [postId, sortBy, showPending])

  const loadComments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        postId: postId.toString(),
        sortBy,
        includeReplies: 'true'
      })
      
      if (isAdmin && showPending) {
        params.append('status', 'all')
      } else {
        params.append('status', 'approved')
      }

      const response = await fetch(`/api/blog/comments?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments || [])
        setStats(data.stats || null)
        
        // Auto-expand comments with replies
        const commentsWithReplies = data.comments.filter((c: Comment) => c.children && c.children.length > 0)
        setExpandedComments(new Set(commentsWithReplies.map((c: Comment) => c.id)))
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!currentUser || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorType: currentUser.type,
          authorAvatar: currentUser.avatar
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewComment('')
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Submit reply
  const handleSubmitReply = async (parentId: number) => {
    if (!currentUser || !replyText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId,
          content: replyText,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorType: currentUser.type,
          authorAvatar: currentUser.avatar
        })
      })

      const data = await response.json()
      if (data.success) {
        setReplyText('')
        setReplyTo(null)
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle comment actions (like, dislike, approve, etc.)
  const handleCommentAction = async (commentId: number, action: string) => {
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action })
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to perform comment action:', error)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment and all its replies?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/comments?commentId=${commentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  // Toggle comment expansion
  const toggleCommentExpansion = (commentId: number) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  // Get author badge
  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case 'admin':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
      case 'guest_author':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"><Award className="h-3 w-3 mr-1" />Author</Badge>
      default:
        return null
    }
  }

  // Render individual comment
  const renderComment = (comment: Comment, depth: number = 0) => {
    const isExpanded = expandedComments.has(comment.id)
    const canModerate = isAdmin || (currentUser?.type === 'admin')
    const isOwner = currentUser?.id === comment.authorId

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-800 pl-4' : ''}`}
      >
        <Card className={`bg-gray-900/30 border-gray-800 ${!comment.approved ? 'border-yellow-500/30' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.authorAvatar || undefined} />
                <AvatarFallback className="bg-primary/20">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                {/* Author info and badges */}
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white">{comment.authorName}</span>
                  {getAuthorBadge(comment.authorType)}
                  {!comment.approved && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      <Clock className="h-3 w-3 mr-1" />Pending
                    </Badge>
                  )}
                  {comment.edited && (
                    <span className="text-xs text-gray-500">(edited)</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Comment content */}
                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleCommentAction(comment.id, 'edit')
                          setEditingComment(null)
                        }}
                        disabled={submitting}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null)
                          setEditText('')
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">{comment.content}</p>
                )}

                {/* Comment actions */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCommentAction(comment.id, 'like')}
                      className="text-gray-400 hover:text-green-400"
                      disabled={!currentUser}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCommentAction(comment.id, 'dislike')}
                      className="text-gray-400 hover:text-red-400"
                      disabled={!currentUser}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {comment.dislikes}
                    </Button>
                    {currentUser && depth < 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>

                  {/* More options */}
                  {(canModerate || isOwner) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-gray-400">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        {canModerate && !comment.approved && (
                          <DropdownMenuItem onClick={() => handleCommentAction(comment.id, 'approve')}>
                            <Check className="mr-2 h-4 w-4 text-green-400" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {isOwner && (
                          <DropdownMenuItem onClick={() => {
                            setEditingComment(comment.id)
                            setEditText(comment.content)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {!isOwner && currentUser && (
                          <DropdownMenuItem onClick={() => setShowReportDialog(comment.id)}>
                            <Flag className="mr-2 h-4 w-4 text-yellow-400" />
                            Report
                          </DropdownMenuItem>
                        )}
                        {(canModerate || isOwner) && (
                          <>
                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Reply form */}
                {replyTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-2 border-t border-gray-700"
                  >
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="bg-gray-800 border-gray-700"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={submitting || !replyText.trim()}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyTo(null)
                          setReplyText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render nested replies */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-4">
            {comment.children.length > 3 && !isExpanded ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCommentExpansion(comment.id)}
                className="text-primary hover:text-primary/80 mb-2"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {comment.children.length} replies
              </Button>
            ) : (
              comment.children.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCommentExpansion(comment.id)}
                  className="text-primary hover:text-primary/80 mb-2"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide replies
                </Button>
              )
            )}
            
            <AnimatePresence>
              {(isExpanded || comment.children.length <= 3) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {comment.children.map(child => renderComment(child, depth + 1))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    )
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-400">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Discussion ({stats?.totalComments || 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="controversial">Controversial</SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPending(!showPending)}
                  className={showPending ? 'border-yellow-500 text-yellow-400' : ''}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {showPending ? 'All' : 'Approved'}
                </Button>
              )}
            </div>
          </div>
          
          {stats && (
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{stats.uniqueCommenters} contributors</span>
              <span>{stats.totalLikes} likes</span>
              {isAdmin && stats.pendingComments > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {stats.pendingComments} pending
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* New Comment Form */}
      {currentUser ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary/20">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the discussion..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Comments are moderated and will appear after approval
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Join the discussion</p>
            <Button className="bg-primary text-black hover:bg-primary/90">
              Sign In to Comment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Card className="bg-gray-900/30 border-gray-800">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No comments yet. Be the first to start the discussion!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog !== null} onOpenChange={() => setShowReportDialog(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-yellow-400" />
              Report Comment
            </DialogTitle>
            <DialogDescription>
              This comment will be flagged for moderator review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (showReportDialog) {
                  handleCommentAction(showReportDialog, 'report')
                  setShowReportDialog(null)
                }
              }}
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


