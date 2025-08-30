"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Lock,
  Edit,
  Save,
  Upload,
  Image,
  FileText,
  Code,
  Tag,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Settings,
  LogOut,
  Award,
  Globe,
  Camera,
  Link,
  Briefcase,
  GraduationCap,
  Star,
  BarChart3,
  ThumbsUp,
  MessageSquare,
  Send,
  ArrowLeft,
  Zap,
  Shield,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"

interface GuestAuthor {
  id: string
  name: string
  email: string
  displayName: string
  bio: string
  avatar: string | null
  expertise: string[]
  socialLinks: {
    twitter?: string
    linkedin?: string
    website?: string
    github?: string
  }
  credentials: string[]
  status: 'pending' | 'approved' | 'suspended' | 'banned'
  stats: {
    totalPosts: number
    publishedPosts: number
    pendingPosts: number
    totalViews: number
    totalLikes: number
    totalRevenue: number
    averageRating: number
  }
  settings: {
    emailNotifications: boolean
    publicProfile: boolean
    allowComments: boolean
    showRevenue: boolean
  }
  permissions: {
    canCreateTags: boolean
    canUploadFiles: boolean
    canPublishDirectly: boolean
    maxPostsPerDay: number
  }
}

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: 'draft' | 'pending' | 'published' | 'archived'
  views: number
  likes: number
  revenue: number
  createdAt: string
  publishedAt: string | null
}

type AuthMode = 'login' | 'register' | 'dashboard'

export default function GuestAuthorPortalClient() {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [currentUser, setCurrentUser] = useState<GuestAuthor | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    expertise: '',
    socialLinks: { twitter: '', linkedin: '', website: '', github: '' },
    credentials: ''
  })
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft'
  })
  const [showPostEditor, setShowPostEditor] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  // Handle authentication
  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginForm.email,
          password: loginForm.password
        })
      })

      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.author)
        setAuthMode('dashboard')
        localStorage.setItem('guestAuthorToken', data.authToken)
        loadUserPosts(data.author.id)
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/blog/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          bio: registerForm.bio,
          expertise: registerForm.expertise.split(',').map(e => e.trim()).filter(e => e),
          socialLinks: Object.fromEntries(
            Object.entries(registerForm.socialLinks).filter(([_, v]) => v.trim())
          ),
          credentials: registerForm.credentials.split(',').map(c => c.trim()).filter(c => c)
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Registration successful! Please check your email and wait for admin approval.')
        setAuthMode('login')
      } else {
        alert(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Load user's posts
  const loadUserPosts = async (authorId: string) => {
    try {
      const response = await fetch(`/api/blog?author=${authorId}`)
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
    }
  }

  // Handle post creation/editing
  const handleSavePost = async () => {
    if (!currentUser || !currentPost.title || !currentPost.content) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPost,
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          authorType: 'guest'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowPostEditor(false)
        setCurrentPost({ title: '', excerpt: '', content: '', category: '', tags: [], status: 'draft' })
        loadUserPosts(currentUser.id)
        alert(data.message)
      } else {
        alert(data.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Save post error:', error)
      alert('Failed to save post')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('authorId', currentUser.id)
      formData.append('authorType', 'guest')

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setUploadedFiles(prev => [...prev, data.file])
        alert(data.message)
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Add tag to current post
  const addTag = () => {
    if (newTag && !currentPost.tags?.includes(newTag)) {
      setCurrentPost(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }))
      setNewTag('')
    }
  }

  // Remove tag from current post
  const removeTag = (tagToRemove: string) => {
    setCurrentPost(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Login/Register UI
  if (authMode === 'login' || authMode === 'register') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,255,102,0.1)_0%,transparent_50%)]" />
        
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold">
                {authMode === 'login' ? 'Author Sign In' : 'Join Our Authors'}
              </h1>
              <p className="text-gray-400">
                {authMode === 'login' 
                  ? 'Access your author dashboard to create and manage blog posts'
                  : 'Become a guest author and share your trading expertise'
                }
              </p>
            </div>

            {/* Auth Form */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 space-y-6">
                {authMode === 'login' ? (
                  // Login Form
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                          className="pl-10 bg-gray-800 border-gray-700"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          className="pl-10 bg-gray-800 border-gray-700"
                          placeholder="Your password"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full bg-primary text-black hover:bg-primary/90"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                ) : (
                  // Registration Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email Address *</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password *</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          placeholder="Strong password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password *</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                          className="bg-gray-800 border-gray-700"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Textarea
                        id="bio"
                        value={registerForm.bio}
                        onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Tell us about your trading background and expertise..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expertise">Areas of Expertise</Label>
                      <Input
                        id="expertise"
                        value={registerForm.expertise}
                        onChange={(e) => setRegisterForm({...registerForm, expertise: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g. Algorithmic Trading, Risk Management, Options"
                      />
                      <p className="text-xs text-gray-500">Separate multiple areas with commas</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Social Links (Optional)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          value={registerForm.socialLinks.twitter}
                          onChange={(e) => setRegisterForm({
                            ...registerForm, 
                            socialLinks: {...registerForm.socialLinks, twitter: e.target.value}
                          })}
                          className="bg-gray-800 border-gray-700 text-sm"
                          placeholder="Twitter @username"
                        />
                        <Input
                          value={registerForm.socialLinks.linkedin}
                          onChange={(e) => setRegisterForm({
                            ...registerForm, 
                            socialLinks: {...registerForm.socialLinks, linkedin: e.target.value}
                          })}
                          className="bg-gray-800 border-gray-700 text-sm"
                          placeholder="LinkedIn profile URL"
                        />
                        <Input
                          value={registerForm.socialLinks.website}
                          onChange={(e) => setRegisterForm({
                            ...registerForm, 
                            socialLinks: {...registerForm.socialLinks, website: e.target.value}
                          })}
                          className="bg-gray-800 border-gray-700 text-sm"
                          placeholder="Website URL"
                        />
                        <Input
                          value={registerForm.socialLinks.github}
                          onChange={(e) => setRegisterForm({
                            ...registerForm, 
                            socialLinks: {...registerForm.socialLinks, github: e.target.value}
                          })}
                          className="bg-gray-800 border-gray-700 text-sm"
                          placeholder="GitHub profile"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credentials">Credentials</Label>
                      <Input
                        id="credentials"
                        value={registerForm.credentials}
                        onChange={(e) => setRegisterForm({...registerForm, credentials: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                        placeholder="e.g. CFA, PhD Finance, 10+ years trading"
                      />
                      <p className="text-xs text-gray-500">Separate multiple credentials with commas</p>
                    </div>

                    <Button 
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="w-full bg-primary text-black hover:bg-primary/90"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Author Account'}
                    </Button>
                  </div>
                )}

                {/* Switch between login/register */}
                <div className="text-center pt-4 border-t border-gray-700">
                  {authMode === 'login' ? (
                    <p className="text-sm text-gray-400">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setAuthMode('register')}
                        className="text-primary hover:text-primary/80"
                      >
                        Apply to become an author
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => setAuthMode('login')}
                        className="text-primary hover:text-primary/80"
                      >
                        Sign in here
                      </button>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Author Dashboard UI
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Author Portal</h1>
                  <p className="text-sm text-gray-400">Welcome back, {currentUser?.displayName}</p>
                </div>
              </div>
              
              <Badge className={
                currentUser?.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                currentUser?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }>
                {currentUser?.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowPostEditor(true)}
                className="bg-primary text-black hover:bg-primary/90"
                disabled={currentUser?.status !== 'approved'}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('guestAuthorToken')
                  setCurrentUser(null)
                  setAuthMode('login')
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentUser?.status !== 'approved' && (
          <Card className="mb-8 bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-yellow-400">Account Pending Approval</h3>
                  <p className="text-sm text-gray-300">
                    Your author account is pending admin approval. You can create drafts, but cannot publish posts until approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="posts">My Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Total Posts</p>
                      <p className="text-2xl font-bold">{currentUser?.stats.totalPosts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Published</p>
                      <p className="text-2xl font-bold text-green-400">{currentUser?.stats.publishedPosts || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold">{currentUser?.stats.totalViews?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Earnings</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${currentUser?.stats.totalRevenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.slice(0, 5).map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{post.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{post.excerpt}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            {post.status === 'published' && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Eye className="h-3 w-3" />
                                {post.views}
                                <ThumbsUp className="h-3 w-3" />
                                {post.likes}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No posts yet. Create your first post to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Posts</CardTitle>
                  <Button 
                    onClick={() => setShowPostEditor(true)}
                    className="bg-primary text-black hover:bg-primary/90"
                    disabled={currentUser?.status !== 'approved'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{post.title}</p>
                            <p className="text-sm text-gray-400">{post.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.views?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-green-400">
                          ${post.revenue?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {post.status === 'published' && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={currentUser?.displayName || ''}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={currentUser?.bio || ''}
                        className="bg-gray-800 border-gray-700"
                        rows={4}
                        placeholder="Tell readers about yourself..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Expertise Areas</Label>
                      <div className="flex flex-wrap gap-2">
                        {currentUser?.expertise.map(skill => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Social Links</Label>
                      <div className="space-y-2">
                        {Object.entries(currentUser?.socialLinks || {}).map(([platform, url]) => (
                          url && (
                            <div key={platform} className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm capitalize">{platform}:</span>
                              <a href={url} target="_blank" rel="noopener noreferrer" 
                                 className="text-primary hover:text-primary/80 text-sm">
                                {url}
                              </a>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>File Uploads</CardTitle>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.js,.py,.cpp,.html,.css"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach(handleFileUpload)
                      }}
                    />
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-primary text-black hover:bg-primary/90"
                      disabled={!currentUser?.permissions.canUploadFiles}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {file.fileType.match(/^(jpg|jpeg|png|gif)$/i) ? (
                            <Image className="h-8 w-8 text-blue-400" />
                          ) : file.fileType.match(/^(js|ts|py|cpp|html|css)$/i) ? (
                            <Code className="h-8 w-8 text-green-400" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{file.originalName}</p>
                            <p className="text-xs text-gray-400">
                              {(file.fileSize / 1024).toFixed(1)} KB
                            </p>
                            <Badge className={
                              file.approved 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs'
                            }>
                              {file.approved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No files uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Editor Dialog */}
      <Dialog open={showPostEditor} onOpenChange={setShowPostEditor}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Create New Post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={currentPost.title || ''}
                onChange={(e) => setCurrentPost({...currentPost, title: e.target.value})}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter your post title..."
              />
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={currentPost.excerpt || ''}
                onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                className="bg-gray-800 border-gray-700"
                rows={2}
                placeholder="Brief description of your post..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={currentPost.category || ''}
                  onValueChange={(value) => setCurrentPost({...currentPost, category: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trading Strategies">Trading Strategies</SelectItem>
                    <SelectItem value="Market Analysis">Market Analysis</SelectItem>
                    <SelectItem value="Bot Development">Bot Development</SelectItem>
                    <SelectItem value="Risk Management">Risk Management</SelectItem>
                    <SelectItem value="Options Trading">Options Trading</SelectItem>
                    <SelectItem value="Technical Analysis">Technical Analysis</SelectItem>
                    <SelectItem value="Crypto Trading">Crypto Trading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentPost.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" 
                           onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={currentPost.content || ''}
                onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                className="bg-gray-800 border-gray-700"
                rows={12}
                placeholder="Write your post content here... You can use Markdown formatting."
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={currentPost.status || 'draft'}
                onValueChange={(value) => setCurrentPost({...currentPost, status: value as any})}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  {currentUser?.permissions.canPublishDirectly ? (
                    <SelectItem value="published">Publish Now</SelectItem>
                  ) : (
                    <SelectItem value="pending">Submit for Review</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPostEditor(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePost}
              disabled={isLoading || !currentPost.title || !currentPost.content}
              className="bg-primary text-black hover:bg-primary/90"
            >
              {isLoading ? 'Saving...' : 'Save Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


