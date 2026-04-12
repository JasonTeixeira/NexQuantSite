/**
 * 🎓 WORLD-CLASS LMS DATABASE MODELS
 * Comprehensive learning management system models for enterprise-grade education platform
 */

// ===== CORE LEARNING ENTITIES =====

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  
  // Content & Structure
  thumbnail: string
  trailerVideo?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category: string
  subcategory?: string
  tags: string[]
  
  // Instructor Information
  instructor: {
    id: string
    name: string
    avatar: string
    title: string
    bio: string
    rating: number
    totalStudents: number
    socialLinks?: {
      linkedin?: string
      twitter?: string
      website?: string
    }
  }
  
  // Course Settings
  isPublished: boolean
  isDraft: boolean
  isPrivate: boolean
  isPremium: boolean
  isFeatured: boolean
  
  // Pricing & Access
  pricing: {
    type: 'free' | 'paid' | 'subscription'
    price?: number
    originalPrice?: number
    currency: string
    discountPercentage?: number
    validUntil?: string
  }
  
  // Learning Objectives & Prerequisites  
  learningObjectives: string[]
  prerequisites: string[]
  targetAudience: string[]
  
  // Structure
  modules: CourseModule[]
  totalDuration: number // in minutes
  totalLessons: number
  totalQuizzes: number
  
  // Analytics & Engagement
  enrollmentCount: number
  completionRate: number
  averageRating: number
  totalRatings: number
  totalReviews: number
  
  // SEO & Marketing
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastModified: string
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description: string
  orderIndex: number
  
  // Structure
  lessons: Lesson[]
  quiz?: Quiz
  
  // Settings
  isLocked: boolean
  unlockConditions?: {
    type: 'sequential' | 'score_based' | 'time_based'
    requiredScore?: number
    requiredModules?: string[]
    delayDays?: number
  }
  
  // Analytics
  estimatedDuration: number
  completionRate: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  orderIndex: number
  
  // Content
  type: 'video' | 'text' | 'interactive' | 'download' | 'assignment'
  content: {
    video?: VideoContent
    text?: TextContent
    interactive?: InteractiveContent
    download?: DownloadContent
    assignment?: AssignmentContent
  }
  
  // Settings
  isPreview: boolean
  isPremium: boolean
  duration: number // in minutes
  
  // Resources
  resources: Resource[]
  notes: string[]
  
  // Analytics
  viewCount: number
  averageWatchTime: number
  completionRate: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

// ===== CONTENT TYPES =====

export interface VideoContent {
  url: string
  provider: 'youtube' | 'vimeo' | 'wistia' | 'self_hosted'
  duration: number
  quality: ('360p' | '720p' | '1080p' | '4k')[]
  hasTranscript: boolean
  transcript?: string
  captions: {
    language: string
    url: string
  }[]
  thumbnails: {
    quality: string
    url: string
  }[]
  playbackSettings: {
    autoplay: boolean
    allowSeek: boolean
    allowSpeedChange: boolean
    showControls: boolean
  }
}

export interface TextContent {
  content: string // Rich HTML or Markdown
  estimatedReadTime: number
  wordCount: number
  hasImages: boolean
  hasCodeBlocks: boolean
}

export interface InteractiveContent {
  type: 'simulation' | 'calculator' | 'quiz_inline' | 'drag_drop' | 'coding'
  config: Record<string, any>
  embedUrl?: string
}

export interface DownloadContent {
  files: {
    name: string
    url: string
    type: string
    size: number // in bytes
  }[]
}

export interface AssignmentContent {
  instructions: string
  submissionType: 'text' | 'file' | 'url'
  maxSubmissions: number
  dueDate?: string
  grading: {
    type: 'auto' | 'manual' | 'peer'
    rubric?: GradingRubric[]
    passingScore?: number
  }
}

// ===== QUIZ SYSTEM =====

export interface Quiz {
  id: string
  moduleId?: string
  courseId?: string
  title: string
  description: string
  
  // Configuration
  questions: QuizQuestion[]
  settings: {
    timeLimit?: number // in minutes
    maxAttempts: number
    passingScore: number
    shuffleQuestions: boolean
    shuffleAnswers: boolean
    showCorrectAnswers: boolean
    allowReview: boolean
    instantFeedback: boolean
  }
  
  // Grading
  totalPoints: number
  weightedGrading: boolean
  
  // Analytics
  attemptCount: number
  averageScore: number
  completionRate: number
  averageTime: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  quizId: string
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering'
  orderIndex: number
  
  // Content
  question: string
  explanation?: string
  points: number
  
  // Answers/Options
  options?: QuizOption[]
  correctAnswer?: string | string[] | number
  caseSensitive?: boolean
  
  // Media
  image?: string
  video?: string
  audio?: string
  
  // Analytics
  difficulty: number // 0-1 based on success rate
  discriminationIndex: number
  responseDistribution: Record<string, number>
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
  orderIndex: number
}

// ===== STUDENT PROGRESS & ANALYTICS =====

export interface StudentProgress {
  id: string
  userId: string
  courseId: string
  
  // Overall Progress
  enrollmentDate: string
  lastAccessedDate: string
  completionDate?: string
  progressPercentage: number
  
  // Module/Lesson Progress
  moduleProgress: {
    moduleId: string
    progressPercentage: number
    completedLessons: string[]
    currentLesson?: string
    timeSpent: number // in minutes
    lastAccessed: string
  }[]
  
  // Quiz Performance
  quizAttempts: QuizAttempt[]
  overallQuizScore: number
  
  // Learning Analytics
  totalTimeSpent: number
  averageSessionTime: number
  sessionCount: number
  streakDays: number
  longestStreak: number
  
  // Engagement Metrics
  notesCount: number
  bookmarksCount: number
  questionsAsked: number
  forumParticipation: number
  
  // Certificates & Achievements
  certificatesEarned: string[]
  badgesEarned: string[]
  achievements: Achievement[]
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  
  // Attempt Data
  attemptNumber: number
  startTime: string
  endTime?: string
  timeSpent: number // in minutes
  
  // Scoring
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  
  // Detailed Responses
  responses: {
    questionId: string
    answer: string | string[]
    isCorrect: boolean
    points: number
    timeSpent: number
  }[]
  
  // Status
  status: 'in_progress' | 'completed' | 'abandoned' | 'expired'
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

// ===== GAMIFICATION SYSTEM =====

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'completion' | 'streak' | 'performance' | 'engagement' | 'special'
  
  // Criteria
  criteria: {
    type: 'course_completion' | 'quiz_score' | 'streak_days' | 'time_spent' | 'custom'
    value: number
    courses?: string[]
    operator: 'gte' | 'lte' | 'eq'
  }
  
  // Rarity & Value
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  
  // Analytics
  earnedCount: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface Certificate {
  id: string
  courseId: string
  studentId: string
  templateId: string
  
  // Certificate Data
  certificateNumber: string
  studentName: string
  courseName: string
  instructorName: string
  completionDate: string
  finalScore: number
  totalHours: number
  
  // Verification
  verificationCode: string
  isVerified: boolean
  verificationUrl: string
  
  // Template Data
  template: {
    design: string
    layout: 'landscape' | 'portrait'
    colorScheme: string
    logoUrl?: string
    signatureUrl?: string
  }
  
  // Timestamps
  issuedAt: string
  expiresAt?: string
}

export interface Achievement {
  id: string
  badgeId: string
  studentId: string
  earnedAt: string
  description: string
  value: number
}

// ===== LEARNING PATHS & RECOMMENDATIONS =====

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  
  // Structure
  courses: {
    courseId: string
    orderIndex: number
    isRequired: boolean
    prerequisites?: string[]
  }[]
  
  // Metadata
  estimatedDuration: number
  targetRoles: string[]
  skills: string[]
  
  // Analytics
  enrollmentCount: number
  completionRate: number
  averageRating: number
  
  // Settings
  isPublished: boolean
  isPremium: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

// ===== CONTENT MANAGEMENT =====

export interface Resource {
  id: string
  name: string
  type: 'pdf' | 'code' | 'dataset' | 'template' | 'link' | 'image' | 'document'
  url: string
  size?: number
  downloadCount: number
  description?: string
  createdAt: string
}

export interface GradingRubric {
  criteria: string
  weight: number
  levels: {
    score: number
    description: string
  }[]
}

// ===== API RESPONSE TYPES =====

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LearningAnalytics {
  overview: {
    totalStudents: number
    totalCourses: number
    totalHours: number
    averageCompletion: number
    averageRating: number
  }
  
  coursePerformance: {
    courseId: string
    title: string
    enrollments: number
    completions: number
    averageRating: number
    revenue: number
  }[]
  
  studentEngagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionTime: number
    retentionRate: {
      day7: number
      day30: number
      day90: number
    }
  }
  
  revenueMetrics: {
    totalRevenue: number
    monthlyRecurringRevenue: number
    averageRevenuePerUser: number
    conversionRate: number
  }
}

// ===== FORM TYPES FOR ADMIN INTERFACE =====

export interface CourseFormData {
  title: string
  description: string
  shortDescription: string
  difficulty: string
  category: string
  subcategory?: string
  tags: string[]
  thumbnail?: File
  trailerVideo?: string
  pricing: {
    type: string
    price?: number
    currency: string
  }
  learningObjectives: string[]
  prerequisites: string[]
  targetAudience: string[]
  isPublished: boolean
  isPremium: boolean
  isFeatured: boolean
}

export interface ModuleFormData {
  title: string
  description: string
  orderIndex: number
  isLocked: boolean
}

export interface LessonFormData {
  title: string
  description: string
  type: string
  orderIndex: number
  isPreview: boolean
  isPremium: boolean
  duration: number
  content: any
}

export interface QuizFormData {
  title: string
  description: string
  timeLimit?: number
  maxAttempts: number
  passingScore: number
  shuffleQuestions: boolean
  shuffleAnswers: boolean
  showCorrectAnswers: boolean
  allowReview: boolean
  instantFeedback: boolean
}

// ===== EXPORT TYPES =====

export type {
  Course,
  CourseModule,
  Lesson,
  Quiz,
  QuizQuestion,
  StudentProgress,
  Badge,
  Certificate,
  LearningPath,
  LearningAnalytics
}

