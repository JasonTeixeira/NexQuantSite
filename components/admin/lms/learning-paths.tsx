"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Target,
  Route,
  Map,
  Compass,
  Navigation,
  Brain,
  Zap,
  Star,
  Trophy,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Save,
  Eye,
  Settings,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Layers,
  Shuffle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Flag,
  Crown,
  Shield,
  Award,
  Flame,
  Sparkles,
  Cpu,
  Database,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Hash,
  Tag,
  Grid3X3,
  List,
  Workflow,
  GitBranch,
  TreePine,
  Network
} from "lucide-react"
import { toast } from "sonner"
import { LearningPath } from "@/lib/lms/models"

interface PathTemplate {
  id: string
  name: string
  description: string
  category: 'beginner' | 'intermediate' | 'advanced' | 'specialized'
  targetRole: string[]
  estimatedDuration: number // weeks
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  prerequisites: string[]
  skills: string[]
  courses: PathCourse[]
  completionRate: number
  enrollmentCount: number
  rating: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PathCourse {
  courseId: string
  courseName: string
  orderIndex: number
  isRequired: boolean
  estimatedHours: number
  prerequisites?: string[]
  skills: string[]
  unlockConditions?: {
    type: 'sequential' | 'score_based' | 'time_based'
    requiredScore?: number
    delayDays?: number
  }
}

interface RecommendationEngine {
  studentId: string
  recommendations: {
    type: 'course' | 'path' | 'skill'
    title: string
    reason: string
    confidence: number
    priority: 'high' | 'medium' | 'low'
    estimatedImpact: string
  }[]
  skillGaps: {
    skill: string
    currentLevel: number
    targetLevel: number
    suggestedCourses: string[]
  }[]
  adaptiveAdjustments: {
    pathId: string
    originalSequence: string[]
    adjustedSequence: string[]
    reason: string
  }[]
}

const MOCK_LEARNING_PATHS: PathTemplate[] = [
  {
    id: '1',
    name: 'Complete Trading Mastery',
    description: 'Comprehensive path from beginner to advanced trader covering all essential trading concepts',
    category: 'beginner',
    targetRole: ['Day Trader', 'Swing Trader', 'Investment Analyst'],
    estimatedDuration: 16,
    difficulty: 'medium',
    prerequisites: ['Basic Math', 'Computer Literacy'],
    skills: ['Technical Analysis', 'Risk Management', 'Portfolio Management', 'Market Psychology'],
    courses: [
      {
        courseId: '1',
        courseName: 'Trading Fundamentals',
        orderIndex: 0,
        isRequired: true,
        estimatedHours: 12,
        skills: ['Market Basics', 'Order Types'],
        unlockConditions: { type: 'sequential' }
      },
      {
        courseId: '2',
        courseName: 'Technical Analysis Mastery',
        orderIndex: 1,
        isRequired: true,
        estimatedHours: 18,
        skills: ['Chart Patterns', 'Indicators'],
        unlockConditions: { type: 'score_based', requiredScore: 80 }
      },
      {
        courseId: '3',
        courseName: 'Risk Management Pro',
        orderIndex: 2,
        isRequired: true,
        estimatedHours: 14,
        skills: ['Position Sizing', 'Stop Losses'],
        unlockConditions: { type: 'score_based', requiredScore: 85 }
      },
      {
        courseId: '4',
        courseName: 'Advanced Trading Psychology',
        orderIndex: 3,
        isRequired: false,
        estimatedHours: 10,
        skills: ['Emotional Control', 'Decision Making'],
        unlockConditions: { type: 'time_based', delayDays: 7 }
      }
    ],
    completionRate: 78.5,
    enrollmentCount: 2456,
    rating: 4.8,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Options Trading Specialist',
    description: 'Advanced path specializing in options strategies and derivatives trading',
    category: 'advanced',
    targetRole: ['Options Trader', 'Derivatives Specialist', 'Portfolio Manager'],
    estimatedDuration: 12,
    difficulty: 'hard',
    prerequisites: ['Trading Fundamentals', '1 Year Trading Experience'],
    skills: ['Options Strategies', 'Greeks Analysis', 'Volatility Trading', 'Risk Management'],
    courses: [
      {
        courseId: '5',
        courseName: 'Options Fundamentals',
        orderIndex: 0,
        isRequired: true,
        estimatedHours: 16,
        skills: ['Call/Put Options', 'Option Pricing'],
        unlockConditions: { type: 'sequential' }
      },
      {
        courseId: '6',
        courseName: 'Advanced Options Strategies',
        orderIndex: 1,
        isRequired: true,
        estimatedHours: 20,
        skills: ['Spreads', 'Straddles', 'Strangles'],
        unlockConditions: { type: 'score_based', requiredScore: 90 }
      },
      {
        courseId: '7',
        courseName: 'Volatility Trading',
        orderIndex: 2,
        isRequired: true,
        estimatedHours: 18,
        skills: ['IV Analysis', 'Vega Trading'],
        unlockConditions: { type: 'score_based', requiredScore: 85 }
      }
    ],
    completionRate: 82.1,
    enrollmentCount: 1247,
    rating: 4.9,
    isActive: true,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '3',
    name: 'Cryptocurrency Trading Expert',
    description: 'Specialized path for digital asset trading and blockchain analysis',
    category: 'specialized',
    targetRole: ['Crypto Trader', 'DeFi Specialist', 'Blockchain Analyst'],
    estimatedDuration: 10,
    difficulty: 'expert',
    prerequisites: ['Advanced Trading', 'Technology Background Preferred'],
    skills: ['Crypto Analysis', 'DeFi Protocols', 'Blockchain Technology', 'Alt Coin Trading'],
    courses: [
      {
        courseId: '8',
        courseName: 'Cryptocurrency Fundamentals',
        orderIndex: 0,
        isRequired: true,
        estimatedHours: 14,
        skills: ['Bitcoin', 'Ethereum', 'Altcoins'],
        unlockConditions: { type: 'sequential' }
      },
      {
        courseId: '9',
        courseName: 'DeFi and Yield Farming',
        orderIndex: 1,
        isRequired: true,
        estimatedHours: 16,
        skills: ['Liquidity Mining', 'Smart Contracts'],
        unlockConditions: { type: 'score_based', requiredScore: 88 }
      }
    ],
    completionRate: 71.3,
    enrollmentCount: 1834,
    rating: 4.6,
    isActive: true,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-18T13:20:00Z'
  }
]

const TARGET_ROLES = [
  'Day Trader',
  'Swing Trader',
  'Investment Analyst',
  'Portfolio Manager',
  'Options Trader',
  'Derivatives Specialist',
  'Crypto Trader',
  'Quantitative Analyst',
  'Risk Manager',
  'Financial Advisor'
]

const SKILLS_DATABASE = [
  'Technical Analysis',
  'Fundamental Analysis',
  'Risk Management',
  'Portfolio Management',
  'Options Strategies',
  'Derivatives Trading',
  'Market Psychology',
  'Quantitative Analysis',
  'Algorithmic Trading',
  'Cryptocurrency',
  'DeFi Protocols',
  'Chart Patterns',
  'Indicators',
  'Position Sizing',
  'Stop Losses',
  'Greeks Analysis',
  'Volatility Trading',
  'Market Microstructure',
  'Order Flow',
  'Sentiment Analysis'
]

export default function LearningPathsManager() {
  const [paths, setPaths] = useState<PathTemplate[]>(MOCK_LEARNING_PATHS)
  const [selectedPath, setSelectedPath] = useState<PathTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('paths')
  const [showPathEditor, setShowPathEditor] = useState(false)
  const [showRecommendationEngine, setShowRecommendationEngine] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // Path Editor State
  const [pathForm, setPathForm] = useState<Partial<PathTemplate>>({
    name: '',
    description: '',
    category: 'beginner',
    targetRole: [],
    estimatedDuration: 8,
    difficulty: 'medium',
    prerequisites: [],
    skills: [],
    courses: [],
    isActive: true
  })

  // ===== COMPUTED VALUES =====
  const filteredPaths = useMemo(() => {
    let filtered = paths

    if (searchQuery) {
      filtered = filtered.filter(path => 
        path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(path => path.category === categoryFilter)
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(path => path.difficulty === difficultyFilter)
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(path => path.targetRole.includes(roleFilter))
    }

    return filtered
  }, [paths, searchQuery, categoryFilter, difficultyFilter, roleFilter])

  const pathStats = useMemo(() => {
    return {
      total: paths.length,
      active: paths.filter(p => p.isActive).length,
      totalEnrollments: paths.reduce((sum, p) => sum + p.enrollmentCount, 0),
      averageCompletion: paths.reduce((sum, p) => sum + p.completionRate, 0) / paths.length,
      averageRating: paths.reduce((sum, p) => sum + p.rating, 0) / paths.length
    }
  }, [paths])

  // ===== EVENT HANDLERS =====
  
  const createPath = () => {
    const newPath: PathTemplate = {
      ...pathForm,
      id: `path-${Date.now()}`,
      completionRate: 0,
      enrollmentCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as PathTemplate

    setPaths(prev => [newPath, ...prev])
    setShowPathEditor(false)
    setPathForm({
      name: '',
      description: '',
      category: 'beginner',
      targetRole: [],
      estimatedDuration: 8,
      difficulty: 'medium',
      prerequisites: [],
      skills: [],
      courses: [],
      isActive: true
    })
    toast.success("Learning path created successfully!")
  }

  const duplicatePath = (path: PathTemplate) => {
    const duplicated: PathTemplate = {
      ...path,
      id: `path-${Date.now()}`,
      name: `${path.name} (Copy)`,
      enrollmentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPaths(prev => [duplicated, ...prev])
    toast.success("Learning path duplicated successfully!")
  }

  const deletePath = (pathId: string) => {
    setPaths(prev => prev.filter(p => p.id !== pathId))
    toast.success("Learning path deleted successfully!")
  }

  const togglePathStatus = (pathId: string) => {
    setPaths(prev => prev.map(p => 
      p.id === pathId 
        ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() }
        : p
    ))
  }

  const reorderCourses = (pathId: string, newOrder: PathCourse[]) => {
    setPaths(prev => prev.map(p => 
      p.id === pathId 
        ? { ...p, courses: newOrder.map((course, index) => ({ ...course, orderIndex: index })) }
        : p
    ))
    toast.success("Course order updated!")
  }

  const formatDuration = (weeks: number) => {
    if (weeks < 4) return `${weeks} weeks`
    const months = Math.round(weeks / 4)
    return `${months} month${months > 1 ? 's' : ''}`
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-400 bg-green-900/30',
      medium: 'text-yellow-400 bg-yellow-900/30',
      hard: 'text-orange-400 bg-orange-900/30',
      expert: 'text-red-400 bg-red-900/30'
    }
    return colors[difficulty as keyof typeof colors] || colors.medium
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      beginner: Flag,
      intermediate: Target,
      advanced: Crown,
      specialized: Star
    }
    return icons[category as keyof typeof icons] || Flag
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Route className="w-8 h-8 mr-3 text-blue-400" />
            Learning Paths & Recommendations
          </h1>
          <p className="text-gray-400">
            AI-powered personalized learning journeys and intelligent course recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={() => setShowRecommendationEngine(true)}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Engine
          </Button>
          <Button 
            onClick={() => setShowPathEditor(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Path
          </Button>
        </div>
      </div>

      {/* ===== STATS OVERVIEW ===== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Route className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pathStats.total}</div>
              <div className="text-blue-300 text-sm">Learning Paths</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pathStats.active}</div>
              <div className="text-green-300 text-sm">Active Paths</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pathStats.totalEnrollments.toLocaleString()}</div>
              <div className="text-purple-300 text-sm">Enrollments</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pathStats.averageCompletion.toFixed(1)}%</div>
              <div className="text-yellow-300 text-sm">Avg Completion</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Star className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pathStats.averageRating.toFixed(1)}</div>
              <div className="text-pink-300 text-sm">Avg Rating</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MAIN TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-900 border border-gray-800">
          <TabsTrigger value="paths" className="data-[state=active]:bg-blue-600">
            🛤️ Paths
          </TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-blue-600">
            🔧 Builder
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600">
            🤖 AI Engine
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        {/* ===== PATHS TAB ===== */}
        <TabsContent value="paths" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search learning paths..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="specialized">Specialized</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-36">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                      <SelectValue placeholder="Target Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      {TARGET_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setShowPathEditor(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Path
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPaths.map((path, index) => {
                const IconComponent = getCategoryIcon(path.category)

                return (
                  <motion.div
                    key={path.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedPath(path)}
                  >
                    <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-all duration-200 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-900/30 rounded-lg">
                              <IconComponent className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors line-clamp-1">
                                {path.name}
                              </h3>
                              <p className="text-gray-400 text-sm line-clamp-2 mt-1">{path.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            <Switch
                              checked={path.isActive}
                              onCheckedChange={() => togglePathStatus(path.id)}
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <Badge className={getDifficultyColor(path.difficulty)}>
                            {path.difficulty}
                          </Badge>
                          <Badge className="bg-gray-700 capitalize">
                            {path.category}
                          </Badge>
                          <Badge className="bg-purple-600">
                            {formatDuration(path.estimatedDuration)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Target Roles */}
                          <div>
                            <div className="text-gray-400 text-sm mb-2">Target Roles:</div>
                            <div className="flex flex-wrap gap-1">
                              {path.targetRole.slice(0, 3).map(role => (
                                <Badge key={role} className="bg-gray-700 text-xs">{role}</Badge>
                              ))}
                              {path.targetRole.length > 3 && (
                                <Badge className="bg-gray-700 text-xs">+{path.targetRole.length - 3}</Badge>
                              )}
                            </div>
                          </div>

                          {/* Course Count */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Courses:</span>
                            <span className="text-white font-medium">{path.courses.length}</span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-green-400">{path.enrollmentCount.toLocaleString()}</div>
                              <div className="text-gray-400 text-xs">Enrolled</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-blue-400">{path.completionRate}%</div>
                              <div className="text-gray-400 text-xs">Completion</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-yellow-400">{path.rating}</div>
                              <div className="text-gray-400 text-xs">Rating</div>
                            </div>
                          </div>

                          {/* Skills Preview */}
                          <div>
                            <div className="text-gray-400 text-sm mb-2">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {path.skills.slice(0, 4).map(skill => (
                                <Badge key={skill} className="bg-blue-700 text-xs">{skill}</Badge>
                              ))}
                              {path.skills.length > 4 && (
                                <Badge className="bg-blue-700 text-xs">+{path.skills.length - 4}</Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPath(path)
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicatePath(path)
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-400"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePath(path.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ===== BUILDER TAB ===== */}
        <TabsContent value="builder" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Workflow className="w-5 h-5 mr-2" />
                Learning Path Builder
              </CardTitle>
              <p className="text-gray-400">Create custom learning journeys with drag-and-drop course sequencing</p>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-700 rounded-lg">
                <div className="text-center">
                  <GitBranch className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Visual Path Builder</h3>
                  <p className="mb-4">Drag-and-drop interface for creating complex learning paths</p>
                  <Button onClick={() => setShowPathEditor(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== RECOMMENDATIONS TAB ===== */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Recommendation Engine
                <Badge className="ml-2 bg-purple-600 animate-pulse">Active</Badge>
              </CardTitle>
              <p className="text-gray-300">Advanced machine learning algorithms for personalized learning recommendations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-purple-900/30 rounded-lg mb-3">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">94.7%</div>
                  </div>
                  <div className="text-purple-300">Recommendation Accuracy</div>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-purple-900/30 rounded-lg mb-3">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">+127%</div>
                  </div>
                  <div className="text-purple-300">Completion Rate Boost</div>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-purple-900/30 rounded-lg mb-3">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">8,459</div>
                  </div>
                  <div className="text-purple-300">Students Analyzed</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-semibold">AI Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Personalized Course Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Adaptive Learning Path Adjustments</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Skill Gap Analysis</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Predictive Success Modeling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">High-Confidence Match</h4>
                        <p className="text-gray-300 text-sm">Advanced Options for Sarah Chen</p>
                        <p className="text-gray-400 text-xs mt-1">98.5% confidence • High impact</p>
                      </div>
                      <Badge className="bg-green-600">Applied</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">Path Adjustment</h4>
                        <p className="text-gray-300 text-sm">Accelerated track for John Doe</p>
                        <p className="text-gray-400 text-xs mt-1">91.2% confidence • Medium impact</p>
                      </div>
                      <Badge className="bg-blue-600">Pending</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">Skill Gap Alert</h4>
                        <p className="text-gray-300 text-sm">Risk Management needed</p>
                        <p className="text-gray-400 text-xs mt-1">87.3% confidence • High impact</p>
                      </div>
                      <Badge className="bg-yellow-600">Review</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Learning Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Path Performance Analytics</h3>
                    <p>Visualize learning path effectiveness and student progression patterns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Path Success Rate</p>
                    <p className="text-2xl font-bold text-white">{pathStats.averageCompletion.toFixed(1)}%</p>
                    <p className="text-green-400 text-sm">+12% vs last month</p>
                  </div>
                  <Trophy className="w-12 h-12 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Avg Path Duration</p>
                    <p className="text-2xl font-bold text-white">12.8w</p>
                    <p className="text-blue-400 text-sm">Optimal range</p>
                  </div>
                  <Clock className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Student Satisfaction</p>
                    <p className="text-2xl font-bold text-white">{pathStats.averageRating.toFixed(1)}</p>
                    <p className="text-purple-400 text-sm">Excellent rating</p>
                  </div>
                  <Star className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">AI Accuracy</p>
                    <p className="text-2xl font-bold text-white">94.7%</p>
                    <p className="text-green-400 text-sm">Recommendation engine</p>
                  </div>
                  <Brain className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Learning Path Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <LineChart className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Path Performance</h3>
                  <p>Comprehensive analytics on path effectiveness, student progression, and optimization opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Path Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Enroll in Paths</Label>
                    <p className="text-gray-400 text-sm">Automatically enroll students in recommended paths</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Adaptive Sequencing</Label>
                    <p className="text-gray-400 text-sm">Adjust course order based on student performance</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Progress Notifications</Label>
                    <p className="text-gray-400 text-sm">Send notifications on path milestones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">AI Engine Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Real-time Recommendations</Label>
                    <p className="text-gray-400 text-sm">Enable live AI recommendations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Predictive Analytics</Label>
                    <p className="text-gray-400 text-sm">Enable success prediction modeling</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto Path Adjustments</Label>
                    <p className="text-gray-400 text-sm">Allow AI to modify learning paths automatically</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== PATH DETAIL MODAL ===== */}
      {selectedPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPath(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPath.name}</h2>
                  <p className="text-gray-400">{selectedPath.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getDifficultyColor(selectedPath.difficulty)}>
                      {selectedPath.difficulty}
                    </Badge>
                    <Badge className="bg-purple-600">{formatDuration(selectedPath.estimatedDuration)}</Badge>
                    <Badge className="bg-gray-700">{selectedPath.category}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedPath(null)}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedPath.enrollmentCount.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Students Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedPath.completionRate}%</div>
                  <div className="text-gray-400 text-sm">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{selectedPath.rating}</div>
                  <div className="text-gray-400 text-sm">Average Rating</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">Learning Path Structure</h3>
                  <div className="space-y-3">
                    {selectedPath.courses.map((course, index) => (
                      <div key={course.courseId} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{course.courseName}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span>{course.estimatedHours}h</span>
                            <span>•</span>
                            <span>{course.isRequired ? 'Required' : 'Optional'}</span>
                            <span>•</span>
                            <span>{course.skills.join(', ')}</span>
                          </div>
                        </div>
                        {course.unlockConditions && (
                          <Badge className="bg-purple-600 text-xs">
                            {course.unlockConditions.type === 'score_based' && `${course.unlockConditions.requiredScore}% required`}
                            {course.unlockConditions.type === 'time_based' && `${course.unlockConditions.delayDays}d delay`}
                            {course.unlockConditions.type === 'sequential' && 'Sequential'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Target Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath.targetRole.map(role => (
                        <Badge key={role} className="bg-gray-700">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Skills Developed</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath.skills.map(skill => (
                        <Badge key={skill} className="bg-blue-700">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedPath.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Prerequisites</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPath.prerequisites.map(prereq => (
                        <Badge key={prereq} className="bg-orange-700">{prereq}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

