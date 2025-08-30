"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  Share2,
  BookOpen,
  Tag,
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  Award,
  Crown,
  MessageSquare,
  ExternalLink,
  Rss
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import InteractiveCommentSystem from "@/components/blog/InteractiveCommentSystem"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
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
  socialShares?: number
  commentCount?: number
}

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  totalViews: number
  totalLikes: number
  categories: Array<{ name: string; count: number }>
  popularTags: Array<{ name: string; count: number }>
}

export default function EnhancedBlogPageClient() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 9

  // Mock current user - in production, get from authentication context
  const currentUser = {
    id: "user-123",
    name: "Trading Enthusiast",
    type: "user" as const,
    avatar: "/avatars/default-user.jpg"
  }

  useEffect(() => {
    loadBlogData()
  }, [categoryFilter, sortBy])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      
      // Load all published posts
      const postsResponse = await fetch(`/api/blog?status=published&category=${categoryFilter}&sortBy=${sortBy}`)
      const postsData = await postsResponse.json()
      
      if (postsData.success) {
        setPosts(postsData.posts || [])
        setStats(postsData.stats || null)
        
        // Set featured posts (posts with featured flag)
        const featured = (postsData.posts || []).filter((post: BlogPost) => post.featured).slice(0, 3)
        setFeaturedPosts(featured)
      }
    } catch (error) {
      console.error('Failed to load blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle social sharing
  const handleShare = (post: BlogPost, platform: string) => {
    const url = `${window.location.origin}/blog/${post.slug}`
    const text = `Check out this great post: ${post.title}`
    
    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${post.tags.join(',')}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // Filter and paginate posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case 'master':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"><Crown className="h-3 w-3 mr-1" />Master</Badge>
      case 'guest':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"><Award className="h-3 w-3 mr-1" />Guest Author</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400">Loading blog content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative py-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,255,102,0.1)_0%,transparent_50%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Trading Insights
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional trading strategies, market analysis, and educational content from industry experts
            </p>
            
            {/* Blog Stats */}
            {stats && (
              <div className="flex justify-center items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>{stats.publishedPosts} Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span>{stats.totalViews.toLocaleString()} Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-400" />
                  <span>{stats.totalLikes} Likes</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          {getAuthorBadge(post.authorType)}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-primary">{post.authorName}</span>
                            <span className="text-gray-500">
                              {new Date(post.publishedAt!).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{post.commentCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700"
                />
              </div>
              
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
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button variant="outline" className="border-primary/30 text-primary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="border-primary/30 text-primary">
                  <Rss className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Latest Articles ({filteredPosts.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>

          {paginatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-primary/40 transition-all duration-300 cursor-pointer group h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          {getAuthorBadge(post.authorType)}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/20 text-xs">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-primary">{post.authorName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.publishedAt!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{post.commentCount || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Link href={`/blog/${post.slug}`}>
                            <Button size="sm" className="bg-primary text-black hover:bg-primary/90">
                              Read More
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShare(post, 'copy')
                              }}
                              className="text-gray-400 hover:text-primary"
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShare(post, 'twitter')
                              }}
                              className="text-gray-400 hover:text-blue-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/30 border-gray-800">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                <p className="text-gray-400">
                  {searchTerm || categoryFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No blog posts have been published yet"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (pageNum > totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-primary text-black" : ""}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-400/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with Trading Insights
            </h3>
            <p className="text-gray-300 mb-6">
              Get the latest trading strategies, market analysis, and educational content delivered to your inbox.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700"
              />
              <Button className="bg-primary text-black hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


