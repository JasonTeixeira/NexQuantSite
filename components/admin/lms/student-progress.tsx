"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UserCheck,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  BookOpen,
  Video,
  FileQuestion,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Calendar,
  Mail,
  MessageSquare,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Brain,
  Flame,
  Trophy,
  Sparkles,
  Crown,
  Shield,
  Lightbulb,
  PlayCircle,
  PauseCircle,
  FastForward,
  RotateCcw,
  Map,
  Route,
  Flag,
  Compass,
  Navigation,
  TrendingFlat
} from "lucide-react"
import { toast } from "sonner"
import { StudentProgress } from "@/lib/lms/models"

interface StudentData {
  id: string
  name: string
  email: string
  avatar: string
  enrolledCourses: number
  completedCourses: number
  totalProgressPercentage: number
  currentStreak: number
  longestStreak: number
  totalWatchTime: number // minutes
  averageQuizScore: number
  certificatesEarned: number
  badgesEarned: number
  lastActive: string
  joinDate: string
  status: 'active' | 'inactive' | 'at_risk' | 'excelling'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  engagementScore: number
  courseProgress: {
    courseId: string
    courseName: string
    progress: number
    status: 'not_started' | 'in_progress' | 'completed' | 'dropped'
    lastAccessed: string
    timeSpent: number
    quizScore: number
  }[]
  recentActivity: {
    id: string
    type: 'course_started' | 'lesson_completed' | 'quiz_passed' | 'quiz_failed' | 'certificate_earned' | 'badge_earned'
    title: string
    timestamp: string
    details?: string
  }[]
}

const MOCK_STUDENTS: StudentData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: '/api/placeholder/40/40',
    enrolledCourses: 8,
    completedCourses: 5,
    totalProgressPercentage: 78.5,
    currentStreak: 15,
    longestStreak: 23,
    totalWatchTime: 1247, // ~20 hours
    averageQuizScore: 87.3,
    certificatesEarned: 3,
    badgesEarned: 12,
    lastActive: '2024-01-20T14:30:00Z',
    joinDate: '2023-08-15T09:00:00Z',
    status: 'excelling',
    tier: 'gold',
    engagementScore: 94.2,
    courseProgress: [
      {
        courseId: '1',
        courseName: 'Advanced Trading Strategies',
        progress: 95,
        status: 'in_progress',
        lastAccessed: '2024-01-20T14:30:00Z',
        timeSpent: 340,
        quizScore: 92
      },
      {
        courseId: '2',
        courseName: 'Risk Management',
        progress: 100,
        status: 'completed',
        lastAccessed: '2024-01-19T16:45:00Z',
        timeSpent: 280,
        quizScore: 89
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'quiz_passed',
        title: 'Options Trading Assessment',
        timestamp: '2024-01-20T14:15:00Z',
        details: 'Score: 92%'
      },
      {
        id: '2',
        type: 'lesson_completed',
        title: 'Advanced Chart Patterns',
        timestamp: '2024-01-20T13:45:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: '/api/placeholder/40/40',
    enrolledCourses: 5,
    completedCourses: 1,
    totalProgressPercentage: 34.8,
    currentStreak: 3,
    longestStreak: 8,
    totalWatchTime: 456,
    averageQuizScore: 71.2,
    certificatesEarned: 1,
    badgesEarned: 4,
    lastActive: '2024-01-18T10:20:00Z',
    joinDate: '2023-11-10T14:00:00Z',
    status: 'at_risk',
    tier: 'bronze',
    engagementScore: 45.7,
    courseProgress: [
      {
        courseId: '1',
        courseName: 'Trading Fundamentals',
        progress: 45,
        status: 'in_progress',
        lastAccessed: '2024-01-18T10:20:00Z',
        timeSpent: 180,
        quizScore: 68
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'quiz_failed',
        title: 'Basic Trading Quiz',
        timestamp: '2024-01-18T10:00:00Z',
        details: 'Score: 55% (Failed - 70% required)'
      }
    ]
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    avatar: '/api/placeholder/40/40',
    enrolledCourses: 12,
    completedCourses: 8,
    totalProgressPercentage: 89.3,
    currentStreak: 28,
    longestStreak: 35,
    totalWatchTime: 2156,
    averageQuizScore: 94.7,
    certificatesEarned: 6,
    badgesEarned: 24,
    lastActive: '2024-01-20T16:45:00Z',
    joinDate: '2023-05-20T11:30:00Z',
    status: 'excelling',
    tier: 'diamond',
    engagementScore: 98.1,
    courseProgress: [
      {
        courseId: '3',
        courseName: 'Algorithmic Trading',
        progress: 87,
        status: 'in_progress',
        lastAccessed: '2024-01-20T16:45:00Z',
        timeSpent: 520,
        quizScore: 96
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'certificate_earned',
        title: 'Advanced Options Specialist',
        timestamp: '2024-01-20T15:30:00Z'
      }
    ]
  }
]

const STATUS_CONFIG = {
  excelling: { 
    label: '🚀 Excelling', 
    color: 'bg-green-600', 
    textColor: 'text-green-400',
    description: 'High performance, consistent engagement' 
  },
  active: { 
    label: '✅ Active', 
    color: 'bg-blue-600', 
    textColor: 'text-blue-400',
    description: 'Regular participation, good progress' 
  },
  at_risk: { 
    label: '⚠️ At Risk', 
    color: 'bg-orange-600', 
    textColor: 'text-orange-400',
    description: 'Low engagement, may need intervention' 
  },
  inactive: { 
    label: '😴 Inactive', 
    color: 'bg-red-600', 
    textColor: 'text-red-400',
    description: 'No recent activity, requires attention' 
  }
}

const TIER_CONFIG = {
  diamond: { label: '💎 Diamond', color: 'text-cyan-400', bgColor: 'bg-cyan-900/30' },
  platinum: { label: '🏆 Platinum', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
  gold: { label: '🥇 Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' },
  silver: { label: '🥈 Silver', color: 'text-gray-400', bgColor: 'bg-gray-900/30' },
  bronze: { label: '🥉 Bronze', color: 'text-orange-400', bgColor: 'bg-orange-900/30' }
}

export default function StudentProgressDashboard() {
  const [students, setStudents] = useState<StudentData[]>(MOCK_STUDENTS)
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('engagement')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // ===== COMPUTED VALUES =====
  const filteredStudents = useMemo(() => {
    let filtered = students

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    // Tier filter  
    if (tierFilter !== 'all') {
      filtered = filtered.filter(student => student.tier === tierFilter)
    }

    // Sort
    switch (sortBy) {
      case 'engagement':
        filtered.sort((a, b) => b.engagementScore - a.engagementScore)
        break
      case 'progress':
        filtered.sort((a, b) => b.totalProgressPercentage - a.totalProgressPercentage)
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'courses':
        filtered.sort((a, b) => b.enrolledCourses - a.enrolledCourses)
        break
    }

    return filtered
  }, [students, searchQuery, statusFilter, tierFilter, sortBy])

  const overallStats = useMemo(() => {
    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active' || s.status === 'excelling').length,
      atRiskStudents: students.filter(s => s.status === 'at_risk').length,
      inactiveStudents: students.filter(s => s.status === 'inactive').length,
      averageProgress: students.reduce((sum, s) => sum + s.totalProgressPercentage, 0) / students.length,
      averageEngagement: students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length,
      totalCertificates: students.reduce((sum, s) => sum + s.certificatesEarned, 0),
      totalWatchTime: students.reduce((sum, s) => sum + s.totalWatchTime, 0)
    }
  }, [students])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-600'
  }

  const sendMessage = (studentId: string, type: 'email' | 'notification') => {
    const student = students.find(s => s.id === studentId)
    if (student) {
      toast.success(`${type === 'email' ? 'Email' : 'Notification'} sent to ${student.name}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <UserCheck className="w-8 h-8 mr-3 text-blue-400" />
            Student Progress Dashboard
          </h1>
          <p className="text-gray-400">
            Advanced analytics and insights into student performance and engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* ===== OVERVIEW STATS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{overallStats.totalStudents}</div>
                <div className="text-blue-300 text-sm">Total Students</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{overallStats.activeStudents}</div>
                <div className="text-green-300 text-sm">Active</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{overallStats.atRiskStudents}</div>
                <div className="text-orange-300 text-sm">At Risk</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <PauseCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{overallStats.inactiveStudents}</div>
                <div className="text-red-300 text-sm">Inactive</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(overallStats.averageProgress)}%</div>
                <div className="text-purple-300 text-sm">Avg Progress</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Flame className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(overallStats.averageEngagement)}%</div>
                <div className="text-yellow-300 text-sm">Engagement</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-teal-900/50 to-teal-800/30 border-teal-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{overallStats.totalCertificates}</div>
                <div className="text-teal-300 text-sm">Certificates</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(overallStats.totalWatchTime / 60)}h</div>
                <div className="text-pink-300 text-sm">Watch Time</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== FILTERS & CONTROLS ===== */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="excelling">🚀 Excelling</SelectItem>
                  <SelectItem value="active">✅ Active</SelectItem>
                  <SelectItem value="at_risk">⚠️ At Risk</SelectItem>
                  <SelectItem value="inactive">😴 Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="diamond">💎 Diamond</SelectItem>
                  <SelectItem value="platinum">🏆 Platinum</SelectItem>
                  <SelectItem value="gold">🥇 Gold</SelectItem>
                  <SelectItem value="silver">🥈 Silver</SelectItem>
                  <SelectItem value="bronze">🥉 Bronze</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="engagement">Engagement Score</SelectItem>
                  <SelectItem value="progress">Progress %</SelectItem>
                  <SelectItem value="recent">Last Active</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="courses">Course Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="bg-gray-800"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="bg-gray-800"
              >
                Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== STUDENT LIST ===== */}
      <div className={`grid gap-6 ${viewMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <AnimatePresence>
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-all duration-200 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getStatusColor(student.status)}>
                        {STATUS_CONFIG[student.status].label}
                      </Badge>
                      <Badge className={`${TIER_CONFIG[student.tier].bgColor} ${TIER_CONFIG[student.tier].color} border-0`}>
                        {TIER_CONFIG[student.tier].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Progress Overview */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Overall Progress</span>
                        <span className="text-white font-medium">{student.totalProgressPercentage}%</span>
                      </div>
                      <Progress value={student.totalProgressPercentage} className="h-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{student.enrolledCourses}</div>
                        <div className="text-gray-400 text-xs">Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{student.completedCourses}</div>
                        <div className="text-gray-400 text-xs">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{student.currentStreak}</div>
                        <div className="text-gray-400 text-xs">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{student.averageQuizScore}%</div>
                        <div className="text-gray-400 text-xs">Quiz Avg</div>
                      </div>
                    </div>

                    {/* Engagement Score */}
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-white text-sm font-medium">Engagement Score</span>
                      </div>
                      <div className={`text-lg font-bold ${
                        student.engagementScore >= 80 ? 'text-green-400' :
                        student.engagementScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {student.engagementScore}%
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          sendMessage(student.id, 'email')
                        }}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          sendMessage(student.id, 'notification')
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStudent(student)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Last Active */}
                    <div className="text-center text-gray-500 text-xs">
                      Last active: {formatDate(student.lastActive)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ===== STUDENT DETAIL MODAL ===== */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 ring-2 ring-gray-600">
                    <AvatarImage src={selectedStudent.avatar} />
                    <AvatarFallback className="bg-gray-700 text-white text-lg">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                    <p className="text-gray-400">{selectedStudent.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(selectedStudent.status)}>
                        {STATUS_CONFIG[selectedStudent.status].label}
                      </Badge>
                      <Badge className={`${TIER_CONFIG[selectedStudent.tier].bgColor} ${TIER_CONFIG[selectedStudent.tier].color} border-0`}>
                        {TIER_CONFIG[selectedStudent.tier].label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => sendMessage(selectedStudent.id, 'email')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                    ✕
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{selectedStudent.enrolledCourses}</div>
                        <div className="text-gray-400 text-sm">Courses Enrolled</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{selectedStudent.completedCourses}</div>
                        <div className="text-gray-400 text-sm">Completed</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{formatTime(selectedStudent.totalWatchTime)}</div>
                        <div className="text-gray-400 text-sm">Watch Time</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{selectedStudent.certificatesEarned}</div>
                        <div className="text-gray-400 text-sm">Certificates</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className="text-white font-medium">{selectedStudent.totalProgressPercentage}%</span>
                        </div>
                        <Progress value={selectedStudent.totalProgressPercentage} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Quiz Average</span>
                          <span className="text-white font-medium">{selectedStudent.averageQuizScore}%</span>
                        </div>
                        <Progress value={selectedStudent.averageQuizScore} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Engagement Score</span>
                          <span className="text-white font-medium">{selectedStudent.engagementScore}%</span>
                        </div>
                        <Progress value={selectedStudent.engagementScore} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Learning Streaks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-white">Current Streak</span>
                          </div>
                          <Badge className="bg-orange-600">{selectedStudent.currentStreak} days</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="text-white">Longest Streak</span>
                          </div>
                          <Badge className="bg-yellow-600">{selectedStudent.longestStreak} days</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-blue-400" />
                            <span className="text-white">Badges Earned</span>
                          </div>
                          <Badge className="bg-blue-600">{selectedStudent.badgesEarned}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="space-y-4">
                  {selectedStudent.courseProgress.map((course) => (
                    <Card key={course.courseId} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold">{course.courseName}</h3>
                          <Badge className={
                            course.status === 'completed' ? 'bg-green-600' :
                            course.status === 'in_progress' ? 'bg-blue-600' :
                            course.status === 'dropped' ? 'bg-red-600' : 'bg-gray-600'
                          }>
                            {course.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-400 text-sm">Progress</span>
                              <span className="text-white text-sm">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-blue-400">{formatTime(course.timeSpent)}</div>
                              <div className="text-gray-400 text-xs">Time Spent</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-yellow-400">{course.quizScore}%</div>
                              <div className="text-gray-400 text-xs">Quiz Score</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-400">{formatDate(course.lastAccessed)}</div>
                              <div className="text-gray-400 text-xs">Last Accessed</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  {selectedStudent.recentActivity.map((activity) => (
                    <Card key={activity.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'quiz_passed' ? 'bg-green-900/30' :
                            activity.type === 'quiz_failed' ? 'bg-red-900/30' :
                            activity.type === 'certificate_earned' ? 'bg-yellow-900/30' :
                            'bg-blue-900/30'
                          }`}>
                            {activity.type === 'quiz_passed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                            {activity.type === 'quiz_failed' && <XCircle className="w-5 h-5 text-red-400" />}
                            {activity.type === 'certificate_earned' && <Trophy className="w-5 h-5 text-yellow-400" />}
                            {activity.type === 'lesson_completed' && <PlayCircle className="w-5 h-5 text-blue-400" />}
                            {activity.type === 'course_started' && <BookOpen className="w-5 h-5 text-purple-400" />}
                            {activity.type === 'badge_earned' && <Award className="w-5 h-5 text-orange-400" />}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{activity.title}</h4>
                            <p className="text-gray-400 text-sm">{formatDate(activity.timestamp)}</p>
                            {activity.details && (
                              <p className="text-gray-300 text-sm mt-1">{activity.details}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Learning Pattern</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                            <p>Learning activity chart</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Progress Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <LineChart className="w-12 h-12 mx-auto mb-2" />
                            <p>Progress trend chart</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Detailed Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <PieChart className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">Advanced Student Analytics</h3>
                          <p>Comprehensive insights into learning behavior, performance patterns, and engagement metrics</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

