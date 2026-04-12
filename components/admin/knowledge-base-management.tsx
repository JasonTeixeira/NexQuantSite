"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  FileText,
  Globe,
  BarChart3,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface KBArticle {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  subcategory?: string
  status: "published" | "draft" | "archived"
  author: {
    name: string
    email: string
  }
  views: number
  likes: number
  dislikes: number
  rating: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  tags: string[]
  featured: boolean
  helpfulVotes: number
  totalVotes: number
}

interface KBCategory {
  id: string
  name: string
  description: string
  articleCount: number
  icon: string
  color: string
}

export default function KnowledgeBaseManagement() {
  const [articles, setArticles] = useState<KBArticle[]>([
    {
      id: "kb-001",
      title: "How to Set Up Your First Trading Signal",
      content: "This comprehensive guide will walk you through setting up your first trading signal...",
      excerpt: "Learn how to create and configure your first trading signal with our step-by-step guide.",
      category: "Getting Started",
      subcategory: "Signals",
      status: "published",
      author: {
        name: "Trading Expert",
        email: "expert@company.com",
      },
      views: 1247,
      likes: 89,
      dislikes: 3,
      rating: 4.8,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ["signals", "setup", "beginner", "tutorial"],
      featured: true,
      helpfulVotes: 156,
      totalVotes: 167,
    },
    {
      id: "kb-002",
      title: "Understanding Risk Management in Trading",
      content: "Risk management is crucial for successful trading. This article covers...",
      excerpt: "Master the fundamentals of risk management to protect your trading capital.",
      category: "Trading Basics",
      subcategory: "Risk Management",
      status: "published",
      author: {
        name: "Risk Analyst",
        email: "analyst@company.com",
      },
      views: 892,
      likes: 67,
      dislikes: 5,
      rating: 4.6,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      tags: ["risk", "management", "trading", "strategy"],
      featured: false,
      helpfulVotes: 98,
      totalVotes: 112,
    },
    {
      id: "kb-003",
      title: "API Integration Guide",
      content: "Learn how to integrate our trading API into your applications...",
      excerpt: "Complete guide for developers to integrate our trading API.",
      category: "Developer",
      subcategory: "API",
      status: "draft",
      author: {
        name: "Dev Team",
        email: "dev@company.com",
      },
      views: 234,
      likes: 12,
      dislikes: 1,
      rating: 4.2,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["api", "integration", "developer", "technical"],
      featured: false,
      helpfulVotes: 23,
      totalVotes: 28,
    },
  ])

  const [categories] = useState<KBCategory[]>([
    {
      id: "getting-started",
      name: "Getting Started",
      description: "Basic guides for new users",
      articleCount: 12,
      icon: "🚀",
      color: "blue",
    },
    {
      id: "trading-basics",
      name: "Trading Basics",
      description: "Fundamental trading concepts",
      articleCount: 18,
      icon: "📈",
      color: "green",
    },
    {
      id: "advanced-strategies",
      name: "Advanced Strategies",
      description: "Complex trading strategies",
      articleCount: 8,
      icon: "🎯",
      color: "purple",
    },
    {
      id: "developer",
      name: "Developer",
      description: "API and technical documentation",
      articleCount: 6,
      icon: "💻",
      color: "orange",
    },
    {
      id: "billing",
      name: "Billing & Account",
      description: "Account and subscription help",
      articleCount: 9,
      icon: "💳",
      color: "yellow",
    },
  ])

  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [editForm, setEditForm] = useState<{
    title: string
    content: string
    excerpt: string
    category: string
    subcategory: string
    status: "draft" | "published" | "archived"
    tags: string[]
    featured: boolean
  }>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    subcategory: "",
    status: "draft",
    tags: [],
    featured: false,
  })

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === "all" || article.category === filterCategory
    const matchesStatus = filterStatus === "all" || article.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "archived":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleEditArticle = (article: KBArticle) => {
    setSelectedArticle(article)
    setEditForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      subcategory: article.subcategory || "",
      status: article.status,
      tags: article.tags,
      featured: article.featured,
    })
    setIsEditing(true)
  }

  const handleSaveArticle = () => {
    if (!selectedArticle) return

    setArticles((prev) =>
      prev.map((article) =>
        article.id === selectedArticle.id
          ? {
              ...article,
              ...editForm,
              updatedAt: new Date(),
              publishedAt:
                editForm.status === "published" && article.status !== "published" ? new Date() : article.publishedAt,
            }
          : article,
      ),
    )

    setIsEditing(false)
    setSelectedArticle(null)
    toast.success("Article updated successfully")
  }

  const handleDeleteArticle = (articleId: string) => {
    setArticles((prev) => prev.filter((article) => article.id !== articleId))
    if (selectedArticle?.id === articleId) {
      setSelectedArticle(null)
      setIsEditing(false)
    }
    toast.success("Article deleted successfully")
  }

  const kbStats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a) => a.status === "published").length,
    draftArticles: articles.filter((a) => a.status === "draft").length,
    totalViews: articles.reduce((sum, article) => sum + article.views, 0),
    avgRating: articles.reduce((sum, article) => sum + article.rating, 0) / articles.length,
    featuredArticles: articles.filter((a) => a.featured).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Knowledge Base Management</h2>
          <p className="text-gray-400">Create and manage help articles for your customers</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/80 text-black">
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* KB Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Articles</p>
                <p className="text-2xl font-bold text-white">{kbStats.totalArticles}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{kbStats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{kbStats.avgRating.toFixed(1)}/5</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Published</p>
                <p className="text-2xl font-bold text-white">{kbStats.publishedArticles}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Categories</CardTitle>
          <CardDescription className="text-gray-400">Knowledge base categories and article counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{category.articleCount} articles</span>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Articles</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800/30 ${
                        selectedArticle?.id === article.id
                          ? "bg-gray-800/50 border-primary/50"
                          : "bg-gray-800/20 border-gray-700"
                      }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-white">{article.title}</h3>
                            {article.featured && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{article.excerpt}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Category: {article.category}</span>
                            <span>•</span>
                            <span>By {article.author.name}</span>
                            <span>•</span>
                            <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center text-gray-400">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center text-gray-400">
                            <Star className="w-4 h-4 mr-1" />
                            {article.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center text-gray-400">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {Math.round((article.helpfulVotes / article.totalVotes) * 100)}% helpful
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditArticle(article)
                            }}
                            className="border-gray-700 text-gray-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteArticle(article.id)
                            }}
                            className="border-red-700 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Article Details/Editor */}
        <div>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {isEditing ? "Edit Article" : "Article Details"}
                {selectedArticle && !isEditing && (
                  <Button
                    onClick={() => handleEditArticle(selectedArticle)}
                    className="bg-primary hover:bg-primary/80 text-black"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Title</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Excerpt</label>
                    <Textarea
                      value={editForm.excerpt}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                      className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Content</label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                      className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                      rows={8}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Category</label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as any }))}
                      >
                        <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Tags (comma separated)</label>
                    <Input
                      value={editForm.tags.join(", ")}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editForm.featured}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-400">
                      Featured article
                    </label>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSaveArticle} className="flex-1 bg-primary hover:bg-primary/80 text-black">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setSelectedArticle(null)
                      }}
                      className="border-gray-700 text-gray-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : selectedArticle ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-white mb-2">{selectedArticle.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{selectedArticle.excerpt}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getStatusColor(selectedArticle.status)}>{selectedArticle.status}</Badge>
                      {selectedArticle.featured && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{selectedArticle.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Author:</span>
                      <span className="text-white">{selectedArticle.author.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white">{selectedArticle.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-white">{selectedArticle.rating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Helpful:</span>
                      <span className="text-white">
                        {Math.round((selectedArticle.helpfulVotes / selectedArticle.totalVotes) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{selectedArticle.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated:</span>
                      <span className="text-white">{selectedArticle.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedArticle.tags.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedArticle.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an article to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
