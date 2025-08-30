"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Hash,
  ExternalLink,
  CheckCircle,
  User,
  FileText,
  BarChart3,
  Target,
  Loader2,
  Calendar,
  Eye,
  Heart,
  Star,
  Flame,
  ArrowRight,
  Grid,
  List
} from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'
import { useDebounce } from 'use-debounce'

// Import our API hooks
import { usePosts, useUsers, useGroups } from '@/lib/hooks/use-community'
import type { Post, User as UserType, Group } from '@/lib/api/community-client'

interface UniversalSearchProps {
  isOpen?: boolean
  onClose?: () => void
  defaultQuery?: string
  defaultTab?: string
}

type SearchCategory = 'all' | 'posts' | 'users' | 'groups' | 'tags'

interface SearchFilters {
  category: SearchCategory
  postType?: string
  dateRange?: string
  sortBy?: string
  userLevel?: string
  groupCategory?: string
}

export default function UniversalSearch({ 
  isOpen = true, 
  onClose,
  defaultQuery = '',
  defaultTab = 'all'
}: UniversalSearchProps) {
  const [query, setQuery] = useState(defaultQuery)
  const [debouncedQuery] = useDebounce(query, 300)
  const [filters, setFilters] = useState<SearchFilters>({
    category: defaultTab as SearchCategory,
    sortBy: 'relevance'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // API hooks with search functionality
  const {
    data: posts,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = usePosts({
    search: debouncedQuery,
    type: filters.postType as any,
    sortBy: filters.sortBy as any,
    limit: 20
  })

  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useUsers({
    search: debouncedQuery,
    level: filters.userLevel,
    sortBy: filters.sortBy,
    limit: 20
  })

  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useGroups({
    search: debouncedQuery,
    category: filters.groupCategory,
    sortBy: filters.sortBy,
    limit: 20
  })

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexural_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Save search query
  const saveSearchQuery = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('nexural_recent_searches', JSON.stringify(updated))
  }, [recentSearches])

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery.trim())
    }
  }, [saveSearchQuery])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  // Update filters
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Get search results based on category
  const searchResults = useMemo(() => {
    switch (filters.category) {
      case 'posts':
        return { data: posts || [], loading: postsLoading, error: postsError }
      case 'users':
        return { data: users || [], loading: usersLoading, error: usersError }
      case 'groups':
        return { data: groups || [], loading: groupsLoading, error: groupsError }
      case 'all':
        return {
          data: {
            posts: posts?.slice(0, 5) || [],
            users: users?.slice(0, 5) || [],
            groups: groups?.slice(0, 5) || []
          },
          loading: postsLoading || usersLoading || groupsLoading,
          error: postsError || usersError || groupsError
        }
      default:
        return { data: [], loading: false, error: null }
    }
  }, [filters.category, posts, users, groups, postsLoading, usersLoading, groupsLoading, postsError, usersError, groupsError])

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

  // Post result card
  const PostResult = ({ post }: { post: Post }) => {
    const getPostTypeInfo = (type: string) => {
      switch (type) {
        case 'trade': return { icon: BarChart3, color: 'text-green-400', label: 'Trade' }
        case 'strategy': return { icon: Target, color: 'text-blue-400', label: 'Strategy' }
        case 'insight': return { icon: MessageSquare, color: 'text-purple-400', label: 'Insight' }
        case 'question': return { icon: MessageSquare, color: 'text-amber-400', label: 'Question' }
        case 'news': return { icon: ExternalLink, color: 'text-cyan-400', label: 'News' }
        default: return { icon: MessageSquare, color: 'text-gray-400', label: 'Post' }
      }
    }

    const typeInfo = getPostTypeInfo(post.type)
    const TypeIcon = typeInfo.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
        onClick={() => window.open(`/community/posts/${post.id}`, '_blank')}
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white text-sm">{post.author.displayName}</span>
              {post.author.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${typeInfo.color}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{typeInfo.label}</span>
              </div>
            </div>
            
            <h4 className="font-semibold text-white mb-1 text-sm line-clamp-1">{post.title}</h4>
            <p className="text-gray-400 text-xs line-clamp-2 mb-2">{post.content}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.reactions.reduce((sum, r) => sum + r.count, 0)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {post.comments}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // User result card
  const UserResult = ({ user }: { user: UserType }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
      onClick={() => window.open(`/community/users/${user.id}`, '_blank')}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{user.displayName}</span>
            {user.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
            <Badge variant="outline" className="text-xs">{user.level}</Badge>
          </div>
          
          <p className="text-sm text-gray-400 mb-1">@{user.username}</p>
          
          {user.bio && (
            <p className="text-xs text-gray-500 line-clamp-1 mb-2">{user.bio}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{user.followers} followers</span>
            <span>{user.totalPosts} posts</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {user.reputation}
            </span>
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-500" />
      </div>
    </motion.div>
  )

  // Group result card
  const GroupResult = ({ group }: { group: Group }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
      onClick={() => window.open(`/community/groups/${group.id}`, '_blank')}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          {group.avatar ? (
            <img src={group.avatar} alt={group.name} className="w-full h-full rounded-lg object-cover" />
          ) : (
            <Users className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{group.name}</span>
            {group.isVerified && <CheckCircle className="w-4 h-4 text-blue-400" />}
            <Badge variant="outline" className="text-xs capitalize">{group.privacy}</Badge>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{group.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{group.memberCount} members</span>
            <span>{group.postCount} posts</span>
            <Badge variant="secondary" className="text-xs capitalize">{group.category}</Badge>
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-500" />
      </div>
    </motion.div>
  )

  const content = (
    <div className="bg-gray-950 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Search</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search posts, users, groups, and more..."
            className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-lg h-12"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <Tabs value={filters.category} onValueChange={(value: any) => updateFilter('category', value)}>
            <TabsList className="bg-gray-800">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <div className="flex items-center border border-gray-600 rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="createdAt">Latest</SelectItem>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.category === 'posts' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Post Type</label>
                    <Select value={filters.postType} onValueChange={(value) => updateFilter('postType', value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="trade">Trades</SelectItem>
                        <SelectItem value="strategy">Strategies</SelectItem>
                        <SelectItem value="insight">Insights</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filters.category === 'users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">User Level</label>
                    <Select value={filters.userLevel} onValueChange={(value) => updateFilter('userLevel', value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="Novice">Novice</SelectItem>
                        <SelectItem value="Trader">Trader</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                        <SelectItem value="Pro">Professional</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filters.category === 'groups' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <Select value={filters.groupCategory} onValueChange={(value) => updateFilter('groupCategory', value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Recent Searches */}
            {!debouncedQuery && recentSearches.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(search)}
                      className="border-gray-600 text-gray-300 hover:text-white"
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {debouncedQuery && (
              <>
                {/* Loading State */}
                {searchResults.loading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}

                {/* Error State */}
                {searchResults.error && (
                  <div className="text-center py-12">
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
                      <h3 className="text-red-400 font-semibold mb-2">Search Error</h3>
                      <p className="text-red-300">{searchResults.error}</p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {!searchResults.loading && !searchResults.error && (
                  <div className="space-y-6">
                    {filters.category === 'all' ? (
                      // All results view
                      <div className="space-y-8">
                        {/* Posts */}
                        {(searchResults.data as any).posts?.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Posts
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateFilter('category', 'posts')}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                View All
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {(searchResults.data as any).posts.map((post: Post) => (
                                <PostResult key={post.id} post={post} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Users */}
                        {(searchResults.data as any).users?.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Users
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateFilter('category', 'users')}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                View All
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {(searchResults.data as any).users.map((user: UserType) => (
                                <UserResult key={user.id} user={user} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Groups */}
                        {(searchResults.data as any).groups?.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Groups
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateFilter('category', 'groups')}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                View All
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {(searchResults.data as any).groups.map((group: Group) => (
                                <GroupResult key={group.id} group={group} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Results */}
                        {!(searchResults.data as any).posts?.length && 
                         !(searchResults.data as any).users?.length && 
                         !(searchResults.data as any).groups?.length && (
                          <div className="text-center py-12">
                            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                            <p className="text-gray-400">
                              Try different keywords or adjust your filters
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Category-specific results
                      <div>
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                          {filters.category === 'posts' && (searchResults.data as Post[]).map((post) => (
                            <PostResult key={post.id} post={post} />
                          ))}
                          {filters.category === 'users' && (searchResults.data as UserType[]).map((user) => (
                            <UserResult key={user.id} user={user} />
                          ))}
                          {filters.category === 'groups' && (searchResults.data as Group[]).map((group) => (
                            <GroupResult key={group.id} group={group} />
                          ))}
                        </div>

                        {/* No Results */}
                        {(searchResults.data as any[]).length === 0 && (
                          <div className="text-center py-12">
                            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                              No {filters.category} found
                            </h3>
                            <p className="text-gray-400">
                              Try different keywords or adjust your filters
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Popular Searches */}
            {!debouncedQuery && recentSearches.length === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Popular Searches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { term: 'TSLA trading strategy', icon: TrendingUp, category: 'posts' },
                    { term: 'Options trading', icon: BarChart3, category: 'posts' },
                    { term: 'Crypto signals', icon: Hash, category: 'groups' },
                    { term: 'Day trading tips', icon: MessageSquare, category: 'posts' },
                    { term: 'Expert traders', icon: Star, category: 'users' },
                    { term: 'Technical analysis', icon: Target, category: 'posts' }
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start border-gray-600 text-gray-300 hover:text-white h-12"
                      onClick={() => {
                        updateFilter('category', item.category as SearchCategory)
                        handleSearch(item.term)
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span>{item.term}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.category}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  if (isOpen && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-950 border-gray-800 max-w-6xl h-[90vh] p-0">
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}

// Search trigger component
export function SearchTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full md:w-64 justify-start text-gray-400 border-gray-600 bg-gray-800/50 hover:bg-gray-800"
      onClick={onClick}
    >
      <Search className="w-4 h-4 mr-2" />
      <span>Search everything...</span>
    </Button>
  )
}

