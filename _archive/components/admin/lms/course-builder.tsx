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
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Save,
  Eye,
  Upload,
  Play,
  FileText,
  Video,
  Settings,
  Users,
  Star,
  Clock,
  Target,
  BookOpen,
  Award,
  DollarSign,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Drag,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Zap,
  Camera,
  Mic,
  Image,
  Link2,
  Code,
  Calculator,
  PieChart,
  BarChart3,
  TrendingUp,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { Course, CourseModule, Lesson, CourseFormData, ModuleFormData, LessonFormData } from "@/lib/lms/models"

interface CourseBuilderProps {
  courseId?: string
  onSave?: (course: Course) => void
  onPublish?: (course: Course) => void
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '🟢 Beginner', color: 'bg-green-500' },
  { value: 'intermediate', label: '🟡 Intermediate', color: 'bg-yellow-500' },
  { value: 'advanced', label: '🟠 Advanced', color: 'bg-orange-500' },
  { value: 'expert', label: '🔴 Expert', color: 'bg-red-500' }
]

const CATEGORY_OPTIONS = [
  'Trading Fundamentals',
  'Technical Analysis', 
  'Risk Management',
  'Options Trading',
  'Cryptocurrency',
  'Portfolio Management',
  'Market Psychology',
  'Advanced Strategies'
]

const LESSON_TYPES = [
  { value: 'video', label: '🎬 Video Lesson', icon: Video },
  { value: 'text', label: '📝 Text Content', icon: FileText },
  { value: 'interactive', label: '⚡ Interactive', icon: Zap },
  { value: 'download', label: '📁 Download', icon: Upload },
  { value: 'assignment', label: '📋 Assignment', icon: Target }
]

export default function CourseBuilder({ courseId, onSave, onPublish }: CourseBuilderProps) {
  // ===== STATE MANAGEMENT =====
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form states
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDescription: '',
    difficulty: 'beginner',
    category: '',
    subcategory: '',
    tags: [],
    learningObjectives: [''],
    prerequisites: [''],
    targetAudience: [''],
    pricing: {
      type: 'free',
      currency: 'USD'
    },
    isPublished: false,
    isPremium: false,
    isFeatured: false
  })

  // ===== MOCK DATA FOR DEMONSTRATION =====
  const mockCourse: Course = {
    id: courseId || 'new-course',
    title: 'Advanced Trading Strategies',
    slug: 'advanced-trading-strategies',
    description: 'Master sophisticated trading techniques used by institutional investors.',
    shortDescription: 'Learn advanced trading strategies and risk management.',
    thumbnail: '/api/placeholder/400/300',
    difficulty: 'advanced',
    category: 'Advanced Strategies',
    tags: ['trading', 'strategies', 'advanced', 'institutional'],
    
    instructor: {
      id: 'instructor-1',
      name: 'Sarah Chen',
      avatar: '/api/placeholder/100/100',
      title: 'Senior Trading Strategist',
      bio: 'Former Goldman Sachs trader with 15+ years experience',
      rating: 4.8,
      totalStudents: 15420,
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen'
      }
    },
    
    isPublished: false,
    isDraft: true,
    isPrivate: false,
    isPremium: true,
    isFeatured: false,
    
    pricing: {
      type: 'paid',
      price: 299,
      originalPrice: 399,
      currency: 'USD',
      discountPercentage: 25
    },
    
    learningObjectives: [
      'Master institutional-level trading strategies',
      'Implement advanced risk management techniques',
      'Understand market microstructure',
      'Develop systematic trading approaches'
    ],
    prerequisites: [
      'Basic understanding of financial markets',
      'Experience with technical analysis',
      'Completed "Trading Fundamentals" course'
    ],
    targetAudience: [
      'Experienced traders seeking advanced techniques',
      'Finance professionals',
      'Quantitative analysts'
    ],
    
    modules: [
      {
        id: 'module-1',
        courseId: 'course-1',
        title: 'Market Microstructure Analysis',
        description: 'Deep dive into how markets actually work',
        orderIndex: 0,
        lessons: [
          {
            id: 'lesson-1-1',
            moduleId: 'module-1',
            title: 'Order Flow Basics',
            description: 'Understanding order flow and market depth',
            orderIndex: 0,
            type: 'video',
            content: {
              video: {
                url: 'https://example.com/video1',
                provider: 'vimeo',
                duration: 18,
                quality: ['720p', '1080p'],
                hasTranscript: true,
                captions: [],
                thumbnails: [],
                playbackSettings: {
                  autoplay: false,
                  allowSeek: true,
                  allowSpeedChange: true,
                  showControls: true
                }
              }
            },
            isPreview: true,
            isPremium: false,
            duration: 18,
            resources: [],
            notes: [],
            viewCount: 1250,
            averageWatchTime: 15.2,
            completionRate: 87.3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        isLocked: false,
        estimatedDuration: 45,
        completionRate: 78.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    
    totalDuration: 480,
    totalLessons: 24,
    totalQuizzes: 6,
    enrollmentCount: 1250,
    completionRate: 73.5,
    averageRating: 4.7,
    totalRatings: 890,
    totalReviews: 245,
    
    seo: {
      metaTitle: 'Advanced Trading Strategies Course',
      metaDescription: 'Learn institutional-level trading techniques',
      keywords: ['trading', 'strategies', 'advanced', 'course']
    },
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }

  useEffect(() => {
    if (courseId) {
      // Load existing course data
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setCourse(mockCourse)
        setCourseForm({
          title: mockCourse.title,
          description: mockCourse.description,
          shortDescription: mockCourse.shortDescription,
          difficulty: mockCourse.difficulty,
          category: mockCourse.category,
          tags: mockCourse.tags,
          learningObjectives: mockCourse.learningObjectives,
          prerequisites: mockCourse.prerequisites,
          targetAudience: mockCourse.targetAudience,
          pricing: mockCourse.pricing,
          isPublished: mockCourse.isPublished,
          isPremium: mockCourse.isPremium,
          isFeatured: mockCourse.isFeatured
        })
        setIsLoading(false)
      }, 1000)
    } else {
      // New course
      setCourse(mockCourse)
    }
  }, [courseId])

  // ===== EVENT HANDLERS =====
  
  const handleSaveCourse = async () => {
    setIsSaving(true)
    try {
      // Simulate save API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Course saved successfully!")
      onSave?.(course!)
    } catch (error) {
      toast.error("Failed to save course")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishCourse = async () => {
    if (!course) return
    
    setIsSaving(true)
    try {
      const updatedCourse = { ...course, isPublished: true, isDraft: false, publishedAt: new Date().toISOString() }
      setCourse(updatedCourse)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Course published successfully!")
      onPublish?.(updatedCourse)
    } catch (error) {
      toast.error("Failed to publish course")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const addModule = () => {
    if (!course) return
    
    const newModule: CourseModule = {
      id: `module-${Date.now()}`,
      courseId: course.id,
      title: `Module ${course.modules.length + 1}`,
      description: 'New module description',
      orderIndex: course.modules.length,
      lessons: [],
      isLocked: false,
      estimatedDuration: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCourse(prev => prev ? {
      ...prev,
      modules: [...prev.modules, newModule]
    } : prev)
    
    toast.success("New module added!")
  }

  const addLesson = (moduleId: string) => {
    if (!course) return
    
    const module = course.modules.find(m => m.id === moduleId)
    if (!module) return

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      moduleId: moduleId,
      title: `Lesson ${module.lessons.length + 1}`,
      description: 'New lesson description',
      orderIndex: module.lessons.length,
      type: 'video',
      content: {},
      isPreview: false,
      isPremium: false,
      duration: 10,
      resources: [],
      notes: [],
      viewCount: 0,
      averageWatchTime: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setCourse(prev => prev ? {
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      )
    } : prev)

    toast.success("New lesson added!")
  }

  const reorderModules = (newOrder: CourseModule[]) => {
    const reorderedModules = newOrder.map((module, index) => ({
      ...module,
      orderIndex: index
    }))
    
    setCourse(prev => prev ? {
      ...prev,
      modules: reorderedModules
    } : prev)
  }

  // ===== COMPUTED VALUES =====
  const courseStats = useMemo(() => {
    if (!course) return { totalDuration: 0, totalLessons: 0, totalModules: 0 }
    
    return {
      totalDuration: course.modules.reduce((total, module) => total + module.estimatedDuration, 0),
      totalLessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
      totalModules: course.modules.length
    }
  }, [course])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Loading course builder...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-blue-400" />
            {courseId ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-400">
            Build engaging learning experiences with our professional course builder
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            onClick={handleSaveCourse} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button 
            onClick={handlePublishCourse} 
            disabled={isSaving || !course?.title}
            className="bg-green-600 hover:bg-green-700"
          >
            <Globe className="w-4 h-4 mr-2" />
            {course?.isPublished ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* ===== COURSE STATUS BANNER ===== */}
      {course && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-800/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {course.isPublished ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-white font-medium">
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{course.enrollmentCount.toLocaleString()} enrolled</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">{course.averageRating} ({course.totalRatings})</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{courseStats.totalDuration}m total</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Progress value={course.completionRate} className="w-24 h-2" />
              <span className="text-sm text-gray-300">{course.completionRate}% completion</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== MAIN TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            📋 Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-blue-600">
            📚 Content
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600">
            💰 Pricing
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            ⚙️ Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-blue-600">
            👁️ Preview
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Course Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Course Title *</Label>
                    <Input
                      id="title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter course title..."
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="short-desc" className="text-white">Short Description</Label>
                    <Input
                      id="short-desc"
                      value={courseForm.shortDescription}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="Brief course description for cards..."
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Full Description</Label>
                    <Textarea
                      id="description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed course description..."
                      rows={4}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Difficulty Level</Label>
                      <Select
                        value={courseForm.difficulty}
                        onValueChange={(value) => setCourseForm(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {DIFFICULTY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white">Category</Label>
                      <Select
                        value={courseForm.category}
                        onValueChange={(value) => setCourseForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {CATEGORY_OPTIONS.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Objectives */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseForm.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...courseForm.learningObjectives]
                            newObjectives[index] = e.target.value
                            setCourseForm(prev => ({ ...prev, learningObjectives: newObjectives }))
                          }}
                          placeholder="What will students learn?"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newObjectives = courseForm.learningObjectives.filter((_, i) => i !== index)
                            setCourseForm(prev => ({ ...prev, learningObjectives: newObjectives }))
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCourseForm(prev => ({ 
                        ...prev, 
                        learningObjectives: [...prev.learningObjectives, ''] 
                      }))}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Thumbnail */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Course Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Upload thumbnail</p>
                        <p className="text-gray-500 text-xs">16:9 aspect ratio recommended</p>
                      </div>
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Course Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modules:</span>
                      <Badge className="bg-blue-600">{courseStats.totalModules}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lessons:</span>
                      <Badge className="bg-green-600">{courseStats.totalLessons}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <Badge className="bg-purple-600">{courseStats.totalDuration}m</Badge>
                    </div>
                    {course?.enrollmentCount && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Enrolled:</span>
                        <Badge className="bg-orange-600">{course.enrollmentCount.toLocaleString()}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Course
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Content
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Export to PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===== CONTENT TAB ===== */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Course Content Structure</h2>
            <Button onClick={addModule} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Module List */}
          <div className="space-y-4">
            {course?.modules && (
              <Reorder.Group values={course.modules} onReorder={reorderModules}>
                {course.modules.map((module, moduleIndex) => (
                  <Reorder.Item key={module.id} value={module}>
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleModuleExpanded(module.id)}
                            >
                              {expandedModules.includes(module.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <div>
                              <h3 className="text-white font-semibold">
                                Module {moduleIndex + 1}: {module.title}
                              </h3>
                              <p className="text-gray-400 text-sm">{module.lessons.length} lessons • {module.estimatedDuration}m</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addLesson(module.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {expandedModules.includes(module.id) && (
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center justify-center w-6 h-6 bg-gray-700 rounded text-xs text-gray-300">
                                    {lessonIndex + 1}
                                  </div>
                                  
                                  {LESSON_TYPES.find(type => type.value === lesson.type)?.icon && (
                                    React.createElement(
                                      LESSON_TYPES.find(type => type.value === lesson.type)!.icon,
                                      { className: "w-4 h-4 text-blue-400" }
                                    )
                                  )}
                                  
                                  <div>
                                    <p className="text-white font-medium">{lesson.title}</p>
                                    <p className="text-gray-400 text-sm">
                                      {lesson.duration}m • {lesson.type}
                                      {lesson.isPreview && <Badge className="ml-2 bg-green-600 text-xs">Preview</Badge>}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {lesson.isPreview ? (
                                    <Unlock className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                  )}
                                  <Button size="sm" variant="outline">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
        </TabsContent>

        {/* ===== PRICING TAB ===== */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Type */}
              <div>
                <Label className="text-white">Pricing Model</Label>
                <Select
                  value={courseForm.pricing.type}
                  onValueChange={(value) => setCourseForm(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, type: value }
                  }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="free">🆓 Free Course</SelectItem>
                    <SelectItem value="paid">💰 One-time Payment</SelectItem>
                    <SelectItem value="subscription">🔄 Subscription Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {courseForm.pricing.type === 'paid' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-white">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseForm.pricing.price || ''}
                      onChange={(e) => setCourseForm(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing, price: Number(e.target.value) }
                      }))}
                      placeholder="299"
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Currency</Label>
                    <Select
                      value={courseForm.pricing.currency}
                      onValueChange={(value) => setCourseForm(prev => ({ 
                        ...prev, 
                        pricing: { ...prev.pricing, currency: value }
                      }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="USD">🇺🇸 USD</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                        <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Course Flags */}
              <div className="space-y-4">
                <Separator className="bg-gray-700" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Premium Course</Label>
                      <p className="text-gray-400 text-sm">Requires subscription</p>
                    </div>
                    <Switch
                      checked={courseForm.isPremium}
                      onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isPremium: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Featured Course</Label>
                      <p className="text-gray-400 text-sm">Show in featured section</p>
                    </div>
                    <Switch
                      checked={courseForm.isFeatured}
                      onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isFeatured: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-white">Published</Label>
                      <p className="text-gray-400 text-sm">Visible to students</p>
                    </div>
                    <Switch
                      checked={courseForm.isPublished}
                      onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isPublished: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          {course && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Enrollments</p>
                      <p className="text-2xl font-bold text-white">{course.enrollmentCount.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold text-white">{course.completionRate}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Average Rating</p>
                      <p className="text-2xl font-bold text-white">{course.averageRating}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-2xl font-bold text-white">$42.3k</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Engagement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Analytics charts will be implemented here</p>
                  <p className="text-sm">Real-time engagement data, completion trends, and performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PREVIEW TAB ===== */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Course Preview</CardTitle>
              <p className="text-gray-400">See how your course will appear to students</p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">{courseForm.title || 'Course Title'}</h1>
                  <p className="text-gray-300 text-lg mb-6">{courseForm.shortDescription || 'Course short description'}</p>
                  <div className="flex items-center justify-center space-x-6">
                    <Badge className={DIFFICULTY_OPTIONS.find(d => d.value === courseForm.difficulty)?.color || 'bg-gray-600'}>
                      {DIFFICULTY_OPTIONS.find(d => d.value === courseForm.difficulty)?.label || 'Difficulty'}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{courseStats.totalDuration}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{courseStats.totalLessons} lessons</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-white font-semibold mb-3">What you'll learn</h3>
                    <ul className="space-y-2">
                      {courseForm.learningObjectives.filter(obj => obj.trim()).map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold mb-3">Course Content</h3>
                    <div className="space-y-2">
                      {course?.modules.map((module, index) => (
                        <div key={module.id} className="p-3 bg-gray-700 rounded-lg">
                          <h4 className="text-white text-sm font-medium">Module {index + 1}: {module.title}</h4>
                          <p className="text-gray-400 text-sm">{module.lessons.length} lessons • {module.estimatedDuration}m</p>
                        </div>
                      ))}
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

