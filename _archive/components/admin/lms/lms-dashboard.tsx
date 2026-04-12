"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GraduationCap,
  Users,
  Video,
  FileQuestion,
  BookOpen,
  Trophy,
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Star,
  Eye,
  Download,
  Upload,
  Zap,
  Target,
  Award,
  Brain,
  Activity,
  Calendar,
  Globe,
  PieChart,
  LineChart,
  Plus,
  ArrowRight,
  RefreshCw,
  Settings,
  Database,
  Layers,
  MessageSquare,
  Bell,
  Filter,
  Search,
  MoreVertical,
  TrendingDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Flame,
  Crown,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

// Mock data for demonstration
const mockLMSStats = {
  overview: {
    totalCourses: 127,
    totalStudents: 8459,
    totalInstructors: 23,
    totalRevenue: 847620,
    monthlyGrowth: 12.5,
    completionRate: 78.3,
    averageRating: 4.7,
    totalWatchTime: 125840, // in minutes
  },
  recentActivity: [
    {
      id: '1',
      type: 'course_created',
      title: 'Advanced Options Trading',
      user: 'Sarah Chen',
      timestamp: '2 hours ago',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      id: '2',
      type: 'student_enrolled',
      title: '45 new enrollments today',
      user: 'System',
      timestamp: '3 hours ago',
      icon: Users,
      color: 'text-green-400'
    },
    {
      id: '3',
      type: 'video_uploaded',
      title: 'Technical Analysis Masterclass',
      user: 'Mike Rodriguez',
      timestamp: '5 hours ago',
      icon: Video,
      color: 'text-purple-400'
    },
    {
      id: '4',
      type: 'quiz_completed',
      title: '328 quiz submissions today',
      user: 'System',
      timestamp: '6 hours ago',
      icon: FileQuestion,
      color: 'text-yellow-400'
    },
    {
      id: '5',
      type: 'certificate_issued',
      title: '12 certificates awarded',
      user: 'System',
      timestamp: '8 hours ago',
      icon: Trophy,
      color: 'text-orange-400'
    }
  ],
  topCourses: [
    {
      id: '1',
      title: 'Trading Fundamentals',
      enrollments: 2150,
      rating: 4.8,
      revenue: 127800,
      completion: 85,
      thumbnail: '/api/placeholder/120/80'
    },
    {
      id: '2', 
      title: 'Technical Analysis Mastery',
      enrollments: 1875,
      rating: 4.7,
      revenue: 98750,
      completion: 79,
      thumbnail: '/api/placeholder/120/80'
    },
    {
      id: '3',
      title: 'Risk Management Pro',
      enrollments: 1624,
      rating: 4.9,
      revenue: 156200,
      completion: 88,
      thumbnail: '/api/placeholder/120/80'
    },
    {
      id: '4',
      title: 'Cryptocurrency Trading',
      enrollments: 1456,
      rating: 4.6,
      revenue: 89340,
      completion: 74,
      thumbnail: '/api/placeholder/120/80'
    }
  ],
  quickStats: {
    todayEnrollments: 127,
    todayRevenue: 12450,
    activeStudents: 1248,
    coursesPublished: 4,
    videosUploaded: 12,
    quizzesCreated: 8,
    certificatesIssued: 34,
    supportTickets: 3
  },
  performanceMetrics: {
    studentSatisfaction: 94.2,
    courseCompletion: 78.3,
    instructorRating: 4.7,
    platformUptime: 99.9,
    videoQuality: 97.8,
    loadingSpeed: 2.1 // seconds
  }
}

const quickActions = [
  {
    title: 'Create Course',
    description: 'Build a new course with our visual editor',
    icon: GraduationCap,
    href: '/admin/lms/course-builder',
    color: 'bg-blue-600 hover:bg-blue-700',
    badge: 'Popular'
  },
  {
    title: 'Create Quiz',
    description: 'Design interactive assessments',
    icon: FileQuestion,
    href: '/admin/lms/quiz-builder',
    color: 'bg-purple-600 hover:bg-purple-700',
    badge: null
  },
  {
    title: 'Upload Videos',
    description: 'Add new video content',
    icon: Video,
    href: '/admin/lms/video-manager',
    color: 'bg-green-600 hover:bg-green-700',
    badge: null
  },
  {
    title: 'View Progress',
    description: 'Monitor student performance',
    icon: BarChart3,
    href: '/admin/lms/student-progress',
    color: 'bg-orange-600 hover:bg-orange-700',
    badge: 'Updated'
  },
  {
    title: 'Learning Analytics',
    description: 'Detailed insights and reports',
    icon: PieChart,
    href: '/admin/lms/learning-analytics',
    color: 'bg-pink-600 hover:bg-pink-700',
    badge: null
  },
  {
    title: 'Manage Certificates',
    description: 'Create and award certifications',
    icon: Trophy,
    href: '/admin/lms/badges-certificates',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    badge: 'New'
  }
]

export default function LMSDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours > 0) {
      return `${formatNumber(hours)}h ${remainingMinutes}m`
    }
    return `${formatNumber(minutes)}m`
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <GraduationCap className="w-10 h-10 mr-4 text-gradient bg-gradient-to-r from-blue-400 to-purple-400" />
            Learning Management System
          </h1>
          <p className="text-gray-400 text-lg">
            World-class education platform with professional analytics and management tools
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </Button>
          <Button variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* ===== KEY METRICS BANNER ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Courses</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(mockLMSStats.overview.totalCourses)}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-400" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Students</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(mockLMSStats.overview.totalStudents)}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockLMSStats.overview.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium">Completion</p>
                  <p className="text-2xl font-bold text-white">{mockLMSStats.overview.completionRate}%</p>
                </div>
                <Target className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Rating</p>
                  <p className="text-2xl font-bold text-white">{mockLMSStats.overview.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-300 text-sm font-medium">Watch Time</p>
                  <p className="text-2xl font-bold text-white">{formatDuration(mockLMSStats.overview.totalWatchTime)}</p>
                </div>
                <Clock className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 border-indigo-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-sm font-medium">Growth</p>
                  <p className="text-2xl font-bold text-white">+{mockLMSStats.overview.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-teal-900/50 to-teal-800/30 border-teal-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-300 text-sm font-medium">Instructors</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(mockLMSStats.overview.totalInstructors)}</p>
                </div>
                <Brain className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="group bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                        {action.badge && (
                          <Badge className={`text-xs ${
                            action.badge === 'Popular' ? 'bg-blue-600' :
                            action.badge === 'New' ? 'bg-green-600' :
                            'bg-orange-600'
                          }`}>
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== MAIN DASHBOARD TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">
            📚 Content
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-blue-600">
            👥 Students
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            📈 Analytics
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockLMSStats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                        <div className={`p-2 rounded-lg bg-gray-700`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-gray-400 text-sm">by {activity.user} • {activity.timestamp}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">New Enrollments</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600">{formatNumber(mockLMSStats.quickStats.todayEnrollments)}</Badge>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Revenue</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-purple-600">{formatCurrency(mockLMSStats.quickStats.todayRevenue)}</Badge>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Students</span>
                    <Badge className="bg-blue-600">{formatNumber(mockLMSStats.quickStats.activeStudents)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Videos Uploaded</span>
                    <Badge className="bg-orange-600">{formatNumber(mockLMSStats.quickStats.videosUploaded)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Certificates Issued</span>
                    <Badge className="bg-yellow-600">{formatNumber(mockLMSStats.quickStats.certificatesIssued)}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Support Tickets</span>
                    <Badge className={`${mockLMSStats.quickStats.supportTickets > 5 ? 'bg-red-600' : 'bg-gray-600'}`}>
                      {formatNumber(mockLMSStats.quickStats.supportTickets)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Platform Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={`${mockLMSStats.performanceMetrics.studentSatisfaction * 1.759} 175.9`}
                        className="text-green-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{mockLMSStats.performanceMetrics.studentSatisfaction}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Student Satisfaction</p>
                </div>

                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={`${mockLMSStats.performanceMetrics.courseCompletion * 1.759} 175.9`}
                        className="text-blue-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{mockLMSStats.performanceMetrics.courseCompletion}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Course Completion</p>
                </div>

                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={`${(mockLMSStats.performanceMetrics.instructorRating / 5) * 100 * 1.759} 175.9`}
                        className="text-yellow-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{mockLMSStats.performanceMetrics.instructorRating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Instructor Rating</p>
                </div>

                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={`${mockLMSStats.performanceMetrics.platformUptime * 1.759} 175.9`}
                        className="text-purple-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{mockLMSStats.performanceMetrics.platformUptime}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Platform Uptime</p>
                </div>

                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={`${mockLMSStats.performanceMetrics.videoQuality * 1.759} 175.9`}
                        className="text-orange-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{mockLMSStats.performanceMetrics.videoQuality}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Video Quality</p>
                </div>

                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-white">{mockLMSStats.performanceMetrics.loadingSpeed}s</div>
                  <p className="text-gray-400 text-sm">Avg Loading Speed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CONTENT TAB ===== */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Courses */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                      Top Performing Courses
                    </CardTitle>
                    <Link href="/admin/lms/course-builder">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockLMSStats.topCourses.map((course, index) => (
                      <div key={course.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="w-16 h-10 bg-gray-700 rounded overflow-hidden">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{course.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{formatNumber(course.enrollments)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span>{course.rating}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3 text-green-400" />
                              <span>{formatCurrency(course.revenue)}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-lg font-bold ${course.completion >= 85 ? 'text-green-400' : course.completion >= 75 ? 'text-yellow-400' : 'text-orange-400'}`}>
                            {course.completion}%
                          </div>
                          <div className="text-gray-400 text-xs">completion</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Statistics */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Content Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Courses</span>
                    </div>
                    <Badge className="bg-blue-600">{formatNumber(mockLMSStats.overview.totalCourses)}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Videos</span>
                    </div>
                    <Badge className="bg-purple-600">1,247</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileQuestion className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">Quizzes</span>
                    </div>
                    <Badge className="bg-yellow-600">342</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-orange-400" />
                      <span className="text-white">Certificates</span>
                    </div>
                    <Badge className="bg-orange-600">89</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Layers className="w-5 h-5 text-green-400" />
                      <span className="text-white">Resources</span>
                    </div>
                    <Badge className="bg-green-600">2,156</Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Storage Used</span>
                    <span className="text-white">847 GB / 1 TB</span>
                  </div>
                  <Progress value={84.7} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== STUDENTS TAB ===== */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">{formatNumber(mockLMSStats.overview.totalStudents)}</div>
                <div className="text-blue-300">Total Students</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">{formatNumber(mockLMSStats.quickStats.activeStudents)}</div>
                <div className="text-green-300">Active Today</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">{mockLMSStats.overview.completionRate}%</div>
                <div className="text-purple-300">Avg Completion</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">{formatNumber(mockLMSStats.quickStats.certificatesIssued)}</div>
                <div className="text-orange-300">Certificates Today</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Student Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Student Analytics Dashboard</h3>
                  <p>Comprehensive student progress tracking, engagement metrics, and performance insights</p>
                  <Link href="/admin/lms/student-progress">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Student Progress
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(mockLMSStats.overview.totalRevenue)}</p>
                    <p className="text-green-400 text-sm flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{mockLMSStats.overview.monthlyGrowth}%
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Course Completion</p>
                    <p className="text-2xl font-bold text-white">{mockLMSStats.overview.completionRate}%</p>
                    <p className="text-blue-400 text-sm">Industry leading</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Student Satisfaction</p>
                    <p className="text-2xl font-bold text-white">{mockLMSStats.performanceMetrics.studentSatisfaction}%</p>
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
                    <p className="text-gray-400">Total Watch Time</p>
                    <p className="text-2xl font-bold text-white">{Math.round(mockLMSStats.overview.totalWatchTime / 60)}h</p>
                    <p className="text-orange-400 text-sm">This month</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <LineChart className="w-5 h-5 mr-2" />
                  Advanced Learning Analytics
                </CardTitle>
                <Link href="/admin/lms/learning-analytics">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-20 h-20 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-white mb-3">Advanced Analytics Dashboard</h3>
                  <p className="text-lg mb-4">Deep insights into learning patterns, engagement metrics, and performance analytics</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-white">Learning Paths</strong>
                      <br />Progress tracking & optimization
                    </div>
                    <div>
                      <strong className="text-white">Engagement Analysis</strong>
                      <br />Video analytics & interaction data
                    </div>
                    <div>
                      <strong className="text-white">Performance Insights</strong>
                      <br />Quiz results & completion trends
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

