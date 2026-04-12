/**
 * Community React Hooks
 * Custom hooks for managing community data with proper state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import communityApi, { 
  Post, 
  Comment, 
  User, 
  Conversation, 
  Message, 
  Group, 
  Notification,
  PostFilters,
  PaginationParams 
} from '@/lib/api/community-client'
import { toast } from 'sonner'

// Common hook types
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseApiListState<T> {
  data: T[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
  pagination: {
    page: number
    total: number
    pages: number
  }
}

// Posts Hooks
export function usePosts(filters: PostFilters & PaginationParams = {}) {
  const [state, setState] = useState<UseApiListState<Post>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadPosts = useCallback(async (isLoadMore = false) => {
    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getPosts({ 
        ...filters, 
        page: currentPage,
        limit: filters.limit || 10
      })

      if (response.success && response.data) {
        const { posts, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...posts] : posts,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load posts' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [filters, state.pagination.page])

  const loadMore = useCallback(() => loadPosts(true), [loadPosts])
  const refetch = useCallback(() => loadPosts(false), [loadPosts])

  useEffect(() => {
    loadPosts()
  }, [filters.type, filters.sortBy, filters.search]) // Only reload on filter changes

  return {
    ...state,
    loadMore,
    refetch
  }
}

export function usePost(postId: string) {
  const [state, setState] = useState<UseApiState<Post>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const loadPost = useCallback(async () => {
    if (!postId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await communityApi.getPost(postId)
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data!.post, 
          loading: false 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load post' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [postId])

  const refetch = useCallback(() => loadPost(), [loadPost])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  return {
    ...state,
    refetch
  }
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = useCallback(async (postData: {
    type: string
    title: string
    content: string
    tags?: string[]
    visibility?: string
    tradingData?: any
    media?: any
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await communityApi.createPost(postData)
      
      if (response.success && response.data) {
        toast.success('Post created successfully!')
        return response.data.post
      } else {
        setError(response.error || 'Failed to create post')
        toast.error(response.error || 'Failed to create post')
        return null
      }
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { createPost, loading, error }
}

// Comments Hooks
export function useComments(postId: string, params: PaginationParams = {}) {
  const [state, setState] = useState<UseApiListState<Comment>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadComments = useCallback(async (isLoadMore = false) => {
    if (!postId) return

    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getComments(postId, {
        ...params,
        page: currentPage,
        limit: params.limit || 20
      })

      if (response.success && response.data) {
        const { comments, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...comments] : comments,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load comments' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [postId, params, state.pagination.page])

  const loadMore = useCallback(() => loadComments(true), [loadComments])
  const refetch = useCallback(() => loadComments(false), [loadComments])

  useEffect(() => {
    loadComments()
  }, [postId])

  return {
    ...state,
    loadMore,
    refetch
  }
}

export function useCreateComment(postId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createComment = useCallback(async (commentData: {
    content: string
    parentCommentId?: string
    mentions?: string[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await communityApi.createComment(postId, commentData)
      
      if (response.success && response.data) {
        toast.success('Comment posted successfully!')
        return response.data.comment
      } else {
        setError(response.error || 'Failed to post comment')
        toast.error(response.error || 'Failed to post comment')
        return null
      }
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [postId])

  return { createComment, loading, error }
}

// Reactions Hook
export function useReactions(postId: string) {
  const [loading, setLoading] = useState(false)

  const toggleReaction = useCallback(async (reactionType: string) => {
    try {
      setLoading(true)
      
      const response = await communityApi.toggleReaction(postId, reactionType)
      
      if (response.success) {
        // Reaction toggled successfully - the parent component should refetch post data
        return response.data
      } else {
        toast.error(response.error || 'Failed to toggle reaction')
        return null
      }
    } catch (error: any) {
      toast.error(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [postId])

  return { toggleReaction, loading }
}

// Users Hooks
export function useUsers(params: {
  search?: string
  filter?: string
  level?: string
  sortBy?: string
} & PaginationParams = {}) {
  const [state, setState] = useState<UseApiListState<User>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadUsers = useCallback(async (isLoadMore = false) => {
    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getUsers({
        ...params,
        page: currentPage,
        limit: params.limit || 20
      })

      if (response.success && response.data) {
        const { users, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...users] : users,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load users' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [params, state.pagination.page])

  const loadMore = useCallback(() => loadUsers(true), [loadUsers])
  const refetch = useCallback(() => loadUsers(false), [loadUsers])

  useEffect(() => {
    loadUsers()
  }, [params.search, params.filter, params.level])

  return {
    ...state,
    loadMore,
    refetch
  }
}

export function useUser(userId: string, includeStats = true) {
  const [state, setState] = useState<UseApiState<User>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const loadUser = useCallback(async () => {
    if (!userId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await communityApi.getUser(userId, { 
        includeStats,
        includePosts: true,
        postsLimit: 5 
      })
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data!.user, 
          loading: false 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load user' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [userId, includeStats])

  const refetch = useCallback(() => loadUser(), [loadUser])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return {
    ...state,
    refetch
  }
}

export function useFollow() {
  const [loading, setLoading] = useState(false)

  const followUser = useCallback(async (userId: string, action: 'follow' | 'unfollow') => {
    try {
      setLoading(true)
      
      const response = await communityApi.followUser(userId, action)
      
      if (response.success) {
        toast.success(`Successfully ${action === 'follow' ? 'followed' : 'unfollowed'} user`)
        return response.data
      } else {
        toast.error(response.error || `Failed to ${action} user`)
        return null
      }
    } catch (error: any) {
      toast.error(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { followUser, loading }
}

// Messages Hooks
export function useConversations(params: {
  type?: string
  search?: string
} = {}) {
  const [state, setState] = useState<UseApiListState<Conversation>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadConversations = useCallback(async (isLoadMore = false) => {
    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getConversations({
        ...params,
        page: currentPage,
        limit: 20
      })

      if (response.success && response.data) {
        const { conversations, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...conversations] : conversations,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load conversations' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [params, state.pagination.page])

  const loadMore = useCallback(() => loadConversations(true), [loadConversations])
  const refetch = useCallback(() => loadConversations(false), [loadConversations])

  useEffect(() => {
    loadConversations()
  }, [params.type, params.search])

  return {
    ...state,
    loadMore,
    refetch
  }
}

export function useConversation(conversationId: string) {
  const [state, setState] = useState<UseApiState<Conversation & { messages: Message[] }>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  })

  const loadConversation = useCallback(async () => {
    if (!conversationId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await communityApi.getConversation(conversationId)
      
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data!.conversation, 
          loading: false 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load conversation' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [conversationId])

  const refetch = useCallback(() => loadConversation(), [loadConversation])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  return {
    ...state,
    refetch
  }
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (messageData: {
    recipientId?: string
    conversationId?: string
    content: string
    messageType?: string
    attachments?: any[]
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await communityApi.sendMessage(messageData)
      
      if (response.success && response.data) {
        return response.data.message
      } else {
        setError(response.error || 'Failed to send message')
        toast.error(response.error || 'Failed to send message')
        return null
      }
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { sendMessage, loading, error }
}

// Groups Hooks
export function useGroups(params: {
  search?: string
  category?: string
  privacy?: string
  sortBy?: string
  userGroups?: boolean
} = {}) {
  const [state, setState] = useState<UseApiListState<Group>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadGroups = useCallback(async (isLoadMore = false) => {
    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getGroups({
        ...params,
        page: currentPage,
        limit: 20
      })

      if (response.success && response.data) {
        const { groups, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...groups] : groups,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load groups' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [params, state.pagination.page])

  const loadMore = useCallback(() => loadGroups(true), [loadGroups])
  const refetch = useCallback(() => loadGroups(false), [loadGroups])

  useEffect(() => {
    loadGroups()
  }, [params.search, params.category, params.userGroups])

  return {
    ...state,
    loadMore,
    refetch
  }
}

// Notifications Hook
export function useNotifications(params: {
  type?: string
  status?: string
  priority?: string
} = {}) {
  const [state, setState] = useState<UseApiListState<Notification>>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    loadMore: async () => {},
    refetch: async () => {},
    pagination: { page: 1, total: 0, pages: 0 }
  })

  const loadNotifications = useCallback(async (isLoadMore = false) => {
    try {
      setState(prev => ({ ...prev, loading: !isLoadMore, error: null }))
      
      const currentPage = isLoadMore ? state.pagination.page + 1 : 1
      const response = await communityApi.getNotifications({
        ...params,
        page: currentPage,
        limit: 20,
        markAsRead: false // Don't auto-mark as read when just loading
      })

      if (response.success && response.data) {
        const { notifications, pagination } = response.data
        
        setState(prev => ({
          ...prev,
          data: isLoadMore ? [...prev.data, ...notifications] : notifications,
          loading: false,
          hasMore: pagination.page < pagination.pages,
          pagination
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Failed to load notifications' 
        }))
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }))
    }
  }, [params, state.pagination.page])

  const loadMore = useCallback(() => loadNotifications(true), [loadNotifications])
  const refetch = useCallback(() => loadNotifications(false), [loadNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      await communityApi.getNotifications({ markAsRead: true })
      // Update local state to mark all as read
      setState(prev => ({
        ...prev,
        data: prev.data.map(notif => ({ ...notif, isRead: true }))
      }))
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error('Failed to mark notifications as read')
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [params.type, params.status])

  const unreadCount = useMemo(() => {
    return state.data.filter(notification => !notification.isRead).length
  }, [state.data])

  return {
    ...state,
    loadMore,
    refetch,
    markAllAsRead,
    unreadCount
  }
}

