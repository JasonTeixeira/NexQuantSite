"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play,
  Pause,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Star,
  Brain,
  Crown,
  Trophy,
  Award,
  Flame,
  Target,
  Users,
  BookOpen,
  Video,
  FileQuestion,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Share2,
  Download,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Heart,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Route,
  Map,
  Navigation,
  Compass,
  Flag,
  Sparkles,
  Shield,
  Zap,
  Lightbulb,
  Settings,
  Menu,
  Search,
  Filter,
  Grid3X3,
  List,
  Bell,
  Mail,
  Phone,
  Globe,
  Cpu,
  Database,
  Activity,
  RefreshCw,
  Send,
  Bot,
  Mic,
  Camera,
  Image,
  FileText,
  Layers,
  Network,
  GitBranch
} from "lucide-react"
import { toast } from "sonner"
import { useLearningStore } from "@/lib/stores/learning-store"
import DiscussionForums from "@/components/learning/discussion-forums"

// Enhanced interfaces for the new system
interface EnhancedCourse {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: {
    name: string
    avatar: string
    title: string
    rating: number
  }
  progress: number
  isEnrolled: boolean
  isPremium: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
  rating: number
  enrolledStudents: number
  duration: string
  lastAccessed?: string
  completedLessons: number
  totalLessons: number
  nextLesson?: {
    id: string
    title: string
    type: 'video' | 'quiz' | 'reading' | 'interactive'
  }
  learningPath?: {
    id: string
    name: string
    position: number
    totalCourses: number
  }
  badges: Array<{
    id: string
    name: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
}

interface StudentDashboard {
  currentStreak: number
  longestStreak: number
  totalWatchTime: number
  totalCourses: number
  completedCourses: number
  currentLevel: number
  totalXP: number
  nextLevelXP: number
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedAt: string
    rarity: string
  }>
  recentActivity: Array<{
    id: string
    type: 'course_completed' | 'lesson_completed' | 'quiz_passed' | 'badge_earned' | 'certificate_earned'
    title: string
    timestamp: string
    xp?: number
  }>
  recommendedCourses: string[]
  learningPaths: Array<{
    id: string
    name: string
    progress: number
    coursesCompleted: number
    totalCourses: number
    estimatedCompletion: string
  }>
}

interface VideoLesson {
  id: string
  title: string
  duration: number
  videoUrl: string
  transcript?: string
  hasQuiz: boolean
  resources: Array<{
    title: string
    type: string
    url: string
  }>
  watchedDuration: number
  isCompleted: boolean
  notes: string[]
  bookmarks: Array<{
    time: number
    note: string
  }>
}

const MOCK_STUDENT_DASHBOARD: StudentDashboard = {
  currentStreak: 15,
  longestStreak: 28,
  totalWatchTime: 2847, // minutes
  totalCourses: 8,
  completedCourses: 5,
  currentLevel: 12,
  totalXP: 2450,
  nextLevelXP: 2800,
  achievements: [
    {
      id: '1',
      name: 'First Steps',
      description: 'Completed your first course',
      icon: 'trophy',
      earnedAt: '2024-01-15T10:30:00Z',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Quiz Master',
      description: 'Scored 90% or higher on 5 quizzes',
      icon: 'star',
      earnedAt: '2024-01-18T14:20:00Z',
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Streak Legend',
      description: 'Maintained a 15-day learning streak',
      icon: 'flame',
      earnedAt: '2024-01-20T09:15:00Z',
      rarity: 'epic'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'badge_earned',
      title: 'Earned "Streak Legend" badge',
      timestamp: '2024-01-20T09:15:00Z',
      xp: 100
    },
    {
      id: '2',
      type: 'lesson_completed',
      title: 'Completed "Advanced Chart Patterns"',
      timestamp: '2024-01-20T08:45:00Z',
      xp: 25
    },
    {
      id: '3',
      type: 'quiz_passed',
      title: 'Passed "Risk Management Quiz" with 94%',
      timestamp: '2024-01-19T16:30:00Z',
      xp: 50
    }
  ],
  recommendedCourses: ['course-4', 'course-5', 'course-6'],
  learningPaths: [
    {
      id: '1',
      name: 'Complete Trading Mastery',
      progress: 78,
      coursesCompleted: 3,
      totalCourses: 5,
      estimatedCompletion: '2 weeks'
    },
    {
      id: '2',
      name: 'Options Trading Specialist',
      progress: 12,
      coursesCompleted: 0,
      totalCourses: 4,
      estimatedCompletion: '8 weeks'
    }
  ]
}

const MOCK_COURSES: EnhancedCourse[] = [
  {
    id: '1',
    title: 'Trading Fundamentals',
    description: 'Master the basics of financial market trading',
    thumbnail: '/api/placeholder/300/200',
    instructor: {
      name: 'Sarah Chen',
      avatar: '/api/placeholder/50/50',
      title: 'Senior Trading Strategist',
      rating: 4.9
    },
    progress: 85,
    isEnrolled: true,
    isPremium: false,
    difficulty: 'beginner',
    category: 'Fundamentals',
    rating: 4.8,
    enrolledStudents: 15420,
    duration: '8h 30m',
    lastAccessed: '2024-01-20T10:30:00Z',
    completedLessons: 17,
    totalLessons: 20,
    nextLesson: {
      id: 'lesson-18',
      title: 'Advanced Order Types',
      type: 'video'
    },
    learningPath: {
      id: '1',
      name: 'Complete Trading Mastery',
      position: 1,
      totalCourses: 5
    },
    badges: [
      { id: '1', name: 'Course Started', icon: 'flag', rarity: 'common' },
      { id: '2', name: 'Half Complete', icon: 'target', rarity: 'common' }
    ]
  },
  {
    id: '2',
    title: 'Technical Analysis Mastery',
    description: 'Advanced charting techniques and pattern recognition',
    thumbnail: '/api/placeholder/300/200',
    instructor: {
      name: 'Mike Rodriguez',
      avatar: '/api/placeholder/50/50',
      title: 'Technical Analysis Expert',
      rating: 4.7
    },
    progress: 42,
    isEnrolled: true,
    isPremium: true,
    difficulty: 'intermediate',
    category: 'Technical Analysis',
    rating: 4.9,
    enrolledStudents: 12350,
    duration: '12h 15m',
    lastAccessed: '2024-01-18T14:20:00Z',
    completedLessons: 8,
    totalLessons: 19,
    nextLesson: {
      id: 'lesson-9',
      title: 'Candlestick Patterns Quiz',
      type: 'quiz'
    },
    learningPath: {
      id: '1',
      name: 'Complete Trading Mastery',
      position: 2,
      totalCourses: 5
    },
    badges: [
      { id: '3', name: 'Technical Analyst', icon: 'chart', rarity: 'rare' }
    ]
  }
]

export default function EnhancedLearningInterface() {
  // ===== STATE MANAGEMENT =====
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'learning-paths' | 'achievements' | 'profile' | 'discussions'>('dashboard')
  const [selectedCourse, setSelectedCourse] = useState<EnhancedCourse | null>(null)
  const [currentLesson, setCurrentLesson] = useState<VideoLesson | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [studentDashboard, setStudentDashboard] = useState<StudentDashboard>(MOCK_STUDENT_DASHBOARD)
  const [courses, setCourses] = useState<EnhancedCourse[]>(MOCK_COURSES)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')

  // Video player refs
  const videoRef = useRef<HTMLVideoElement>(null)

  // ===== COMPUTED VALUES =====
  const filteredCourses = useMemo(() => {
    let filtered = courses

    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => course.difficulty === difficultyFilter)
    }

    if (progressFilter !== 'all') {
      if (progressFilter === 'not-started') {
        filtered = filtered.filter(course => !course.isEnrolled)
      } else if (progressFilter === 'in-progress') {
        filtered = filtered.filter(course => course.isEnrolled && course.progress > 0 && course.progress < 100)
      } else if (progressFilter === 'completed') {
        filtered = filtered.filter(course => course.progress === 100)
      }
    }

    return filtered
  }, [courses, searchQuery, categoryFilter, difficultyFilter, progressFilter])

  const dashboardStats = useMemo(() => {
    const xpProgress = ((studentDashboard.totalXP - (studentDashboard.currentLevel - 1) * 250) / 250) * 100
    const streakColor = studentDashboard.currentStreak >= 30 ? 'text-purple-400' :
                       studentDashboard.currentStreak >= 15 ? 'text-orange-400' :
                       studentDashboard.currentStreak >= 7 ? 'text-yellow-400' : 'text-green-400'

    return {
      xpProgress: Math.max(0, Math.min(100, xpProgress)),
      streakColor,
      completionRate: (studentDashboard.completedCourses / studentDashboard.totalCourses) * 100,
      avgWatchTimePerDay: studentDashboard.totalWatchTime / 30 // assuming last 30 days
    }
  }, [studentDashboard])

  // ===== EVENT HANDLERS =====
  
  const handleCourseSelect = (course: EnhancedCourse) => {
    setSelectedCourse(course)
    if (course.nextLesson) {
      // Load the next lesson
      const mockLesson: VideoLesson = {
        id: course.nextLesson.id,
        title: course.nextLesson.title,
        duration: 1245, // 20:45
        videoUrl: '/api/placeholder/video',
        hasQuiz: course.nextLesson.type === 'quiz',
        watchedDuration: 0,
        isCompleted: false,
        resources: [
          { title: 'Lesson Notes.pdf', type: 'pdf', url: '/api/placeholder/document' },
          { title: 'Practice Exercise', type: 'interactive', url: '/api/placeholder/exercise' }
        ],
        notes: [],
        bookmarks: []
      }
      setCurrentLesson(mockLesson)
    }
  }

  const handleVideoPlay = () => {
    setIsVideoPlaying(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleVideoPause = () => {
    setIsVideoPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const handleLessonComplete = () => {
    if (!selectedCourse || !currentLesson) return

    // Update course progress
    const updatedCourses = courses.map(course => 
      course.id === selectedCourse.id 
        ? { 
            ...course, 
            progress: Math.min(100, course.progress + 5),
            completedLessons: course.completedLessons + 1
          }
        : course
    )
    setCourses(updatedCourses)

    // Add XP and update dashboard
    setStudentDashboard(prev => ({
      ...prev,
      totalXP: prev.totalXP + 25,
      recentActivity: [
        {
          id: Date.now().toString(),
          type: 'lesson_completed',
          title: `Completed "${currentLesson.title}"`,
          timestamp: new Date().toISOString(),
          xp: 25
        },
        ...prev.recentActivity.slice(0, 9) // Keep last 10 activities
      ]
    }))

    toast.success(`Lesson completed! +25 XP earned`)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 bg-gray-700',
      rare: 'text-blue-400 bg-blue-900/30',
      epic: 'text-purple-400 bg-purple-900/30',
      legendary: 'text-yellow-400 bg-yellow-900/30'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'text-green-400 bg-green-900/30',
      intermediate: 'text-yellow-400 bg-yellow-900/30',
      advanced: 'text-orange-400 bg-orange-900/30',
      expert: 'text-red-400 bg-red-900/30'
    }
    return colors[difficulty as keyof typeof colors] || colors.beginner
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ===== HEADER ===== */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Learning Hub</h1>
              </div>

              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('courses')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveView('learning-paths')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'learning-paths' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Learning Paths
                </button>
                <button
                  onClick={() => setActiveView('discussions')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'discussions' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Discussions
                </button>
                <button
                  onClick={() => setActiveView('achievements')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === 'achievements' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Achievements
                </button>
              </nav>
            </div>

            {/* User Profile & Stats */}
            <div className="flex items-center space-x-4">
              {/* XP & Level */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">Level {studentDashboard.currentLevel}</div>
                  <div className="text-gray-400 text-xs">{studentDashboard.totalXP} XP</div>
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${dashboardStats.xpProgress}%` }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center space-x-2">
                <Flame className={`w-5 h-5 ${dashboardStats.streakColor}`} />
                <span className={`font-bold ${dashboardStats.streakColor}`}>{studentDashboard.currentStreak}</span>
              </div>

              {/* Notifications */}
              <Button size="sm" variant="outline" className="relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </Button>

              {/* Profile */}
              <Avatar>
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome back! 👋</h2>
                    <p className="text-gray-300">
                      You're on a {studentDashboard.currentStreak}-day learning streak. Keep it up!
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Current Streak</p>
                        <p className="text-2xl font-bold text-white">{studentDashboard.currentStreak} days</p>
                        <p className={`text-sm ${dashboardStats.streakColor}`}>
                          🔥 {studentDashboard.currentStreak >= studentDashboard.longestStreak ? 'Personal record!' : `${studentDashboard.longestStreak - studentDashboard.currentStreak} to beat record`}
                        </p>
                      </div>
                      <Flame className={`w-12 h-12 ${dashboardStats.streakColor}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Courses Progress</p>
                        <p className="text-2xl font-bold text-white">
                          {studentDashboard.completedCourses}/{studentDashboard.totalCourses}
                        </p>
                        <p className="text-green-400 text-sm">
                          {dashboardStats.completionRate.toFixed(1)}% complete
                        </p>
                      </div>
                      <BookOpen className="w-12 h-12 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Watch Time</p>
                        <p className="text-2xl font-bold text-white">{formatDuration(studentDashboard.totalWatchTime)}</p>
                        <p className="text-blue-400 text-sm">
                          {Math.round(dashboardStats.avgWatchTimePerDay)}m/day avg
                        </p>
                      </div>
                      <Clock className="w-12 h-12 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Level & XP</p>
                        <p className="text-2xl font-bold text-white">Level {studentDashboard.currentLevel}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                              style={{ width: `${dashboardStats.xpProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-purple-400">
                            {studentDashboard.nextLevelXP - studentDashboard.totalXP} XP
                          </span>
                        </div>
                      </div>
                      <Star className="w-12 h-12 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Learning */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-white">Continue Learning</h3>
                  <div className="space-y-4">
                    {courses.filter(c => c.isEnrolled && c.progress > 0 && c.progress < 100).map(course => (
                      <Card key={course.id} className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-20 h-14 rounded-lg object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>

                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{course.title}</h4>
                              <p className="text-gray-400 text-sm">{course.instructor.name}</p>
                              
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="text-white">{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                </div>

                                <Badge className={getDifficultyColor(course.difficulty)}>
                                  {course.difficulty}
                                </Badge>
                              </div>

                              {course.nextLesson && (
                                <div className="mt-2 flex items-center text-sm text-blue-400">
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  Next: {course.nextLesson.title}
                                </div>
                              )}
                            </div>

                            <Button 
                              onClick={() => handleCourseSelect(course)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Continue
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Learning Paths Progress */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Learning Paths</h3>
                    {studentDashboard.learningPaths.map(path => (
                      <Card key={path.id} className="bg-gray-900 border-gray-800">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Route className="w-5 h-5 text-blue-400" />
                                <h4 className="text-white font-semibold">{path.name}</h4>
                              </div>
                              
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-400">
                                    {path.coursesCompleted} of {path.totalCourses} courses
                                  </span>
                                  <span className="text-white">{path.progress}%</span>
                                </div>
                                <Progress value={path.progress} className="h-2" />
                              </div>

                              <p className="text-gray-400 text-sm mt-1">
                                Estimated completion: {path.estimatedCompletion}
                              </p>
                            </div>

                            <Button size="sm" variant="outline">
                              View Path
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Recent Achievements */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studentDashboard.achievements.slice(0, 3).map(achievement => (
                          <div key={achievement.id} className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                              {achievement.icon === 'trophy' && <Trophy className="w-4 h-4" />}
                              {achievement.icon === 'star' && <Star className="w-4 h-4" />}
                              {achievement.icon === 'flame' && <Flame className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {achievement.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(achievement.earnedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => setActiveView('achievements')}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-400" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studentDashboard.recentActivity.slice(0, 5).map(activity => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="p-1 bg-gray-800 rounded">
                              {activity.type === 'lesson_completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                              {activity.type === 'quiz_passed' && <FileQuestion className="w-4 h-4 text-blue-400" />}
                              {activity.type === 'badge_earned' && <Trophy className="w-4 h-4 text-yellow-400" />}
                              {activity.type === 'course_completed' && <Award className="w-4 h-4 text-purple-400" />}
                              {activity.type === 'certificate_earned' && <Crown className="w-4 h-4 text-orange-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm">{activity.title}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-400 text-xs">
                                  {new Date(activity.timestamp).toLocaleDateString()}
                                </p>
                                {activity.xp && (
                                  <Badge className="bg-purple-600 text-xs">+{activity.xp} XP</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-400" />
                        AI Recommendations
                        <Badge className="ml-2 bg-purple-600 text-xs animate-pulse">Smart</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                          <p className="text-white font-medium text-sm">Options Trading Course</p>
                          <p className="text-gray-300 text-xs">Based on your progress in Technical Analysis</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className="bg-purple-600 text-xs">98% match</Badge>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              Enroll
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <p className="text-white font-medium text-sm">Practice Quiz Suggested</p>
                          <p className="text-gray-300 text-xs">Reinforce your Technical Analysis skills</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className="bg-blue-600 text-xs">Recommended</Badge>
                            <Button size="sm" variant="outline">
                              Take Quiz
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== COURSES VIEW ===== */}
          {activeView === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search & Filters */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="Fundamentals">Fundamentals</option>
                        <option value="Technical Analysis">Technical Analysis</option>
                        <option value="Options">Options</option>
                        <option value="Cryptocurrency">Cryptocurrency</option>
                      </select>

                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>

                      <select
                        value={progressFilter}
                        onChange={(e) => setProgressFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Progress</option>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group"
                  >
                    <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-all duration-200 cursor-pointer h-full">
                      <div className="relative">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        
                        {/* Course Status Overlay */}
                        <div className="absolute top-3 left-3 flex items-center space-x-2">
                          {course.isPremium && (
                            <Badge className="bg-yellow-600">Premium</Badge>
                          )}
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        </div>

                        {/* Play Button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-t-lg">
                          <Button 
                            onClick={() => handleCourseSelect(course)}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                          >
                            <Play className="w-6 h-6 mr-2" />
                            {course.isEnrolled ? 'Continue' : 'Start Course'}
                          </Button>
                        </div>

                        {/* Progress Bar */}
                        {course.isEnrolled && course.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                              {course.description}
                            </p>
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={course.instructor.avatar} />
                              <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white text-sm font-medium">{course.instructor.name}</p>
                              <p className="text-gray-400 text-xs">{course.instructor.title}</p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">{course.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">{course.enrolledStudents.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-medium">{course.rating}</span>
                            </div>
                          </div>

                          {/* Learning Path Info */}
                          {course.learningPath && (
                            <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
                              <Route className="w-4 h-4 text-blue-400" />
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">{course.learningPath.name}</p>
                                <p className="text-gray-400 text-xs">
                                  Course {course.learningPath.position} of {course.learningPath.totalCourses}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Badges */}
                          {course.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {course.badges.map(badge => (
                                <Badge key={badge.id} className={`text-xs ${getRarityColor(badge.rarity)}`}>
                                  {badge.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Action */}
                          <Button 
                            onClick={() => handleCourseSelect(course)}
                            className={`w-full ${
                              course.isEnrolled 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {course.isEnrolled 
                              ? course.progress === 100 
                                ? 'Review Course'
                                : 'Continue Learning'
                              : 'Enroll Now'
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ===== DISCUSSIONS VIEW ===== */}
          {activeView === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <DiscussionForums />
            </motion.div>
          )}

          {/* Other views can be implemented similarly... */}
        </AnimatePresence>
      </main>

      {/* ===== VIDEO PLAYER MODAL ===== */}
      {selectedCourse && currentLesson && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-6xl w-full max-h-[90vh] bg-gray-900 border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Video Player */}
              <div className="lg:col-span-3 space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">{currentLesson.title}</h3>
                      <p className="text-gray-400">Video Player Placeholder</p>
                      <Button 
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        {isVideoPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isVideoPlaying ? 'Pause' : 'Play'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Video Controls & Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{formatDuration(currentLesson.duration)}</span>
                    <span>•</span>
                    <span>{selectedCourse.instructor.name}</span>
                    <span>•</span>
                    <span>{selectedCourse.category}</span>
                  </div>

                  {/* Lesson Completion */}
                  {!currentLesson.isCompleted && (
                    <Button 
                      onClick={handleLessonComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}

                  {/* Tabs for additional content */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="transcript">Transcript</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="text-gray-300">
                        <p>{selectedCourse.description}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="transcript">
                      <div className="bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-gray-300">
                          {currentLesson.transcript || "Transcript not available for this lesson."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="resources">
                      <div className="space-y-2">
                        {currentLesson.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-400" />
                              <span className="text-white">{resource.title}</span>
                            </div>
                            <Button size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="notes">
                      <div className="space-y-4">
                        <Input 
                          placeholder="Add a note..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {currentLesson.notes.map((note, index) => (
                            <div key={index} className="p-3 bg-gray-800 rounded-lg">
                              <p className="text-gray-300">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Course Navigation Sidebar */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h3 className="text-white font-semibold">Course Content</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{selectedCourse.progress}%</span>
                  </div>
                  <Progress value={selectedCourse.progress} className="h-2" />
                </div>

                <div className="text-sm text-gray-400">
                  {selectedCourse.completedLessons} of {selectedCourse.totalLessons} lessons complete
                </div>

                {/* Lesson List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {/* This would be populated with actual lesson data */}
                  {Array.from({ length: selectedCourse.totalLessons }, (_, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        index < selectedCourse.completedLessons 
                          ? 'bg-green-900/30 hover:bg-green-900/50' 
                          : index === selectedCourse.completedLessons
                          ? 'bg-blue-900/30 hover:bg-blue-900/50'
                          : 'bg-gray-700/30 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {index < selectedCourse.completedLessons ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : index === selectedCourse.completedLessons ? (
                          <Play className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">
                          Lesson {index + 1}: Sample Lesson Title
                        </p>
                        <p className="text-gray-400 text-xs">5:30</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
