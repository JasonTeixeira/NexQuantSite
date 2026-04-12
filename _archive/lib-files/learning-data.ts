import { BookOpen, Users, Award, MessageSquare, FileText, Video, Globe, Play, Lock, CheckCircle, Clock, Star, Trophy, Target, Brain, Zap, TrendingUp, BarChart3, PieChart, Activity, Calendar, User, Shield, Bookmark, Download, Share2, Eye, Heart, ThumbsUp, MessageCircle, Flag, Gift, Crown, Flame, Sparkles } from 'lucide-react'

export interface LearningModule {
  id: string
  title: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  duration: string
  estimatedHours: number
  instructor: {
    name: string
    avatar: string
    title: string
    rating: number
    students: number
  }
  thumbnail: string
  videoUrl: string
  isLocked: boolean
  isPremium: boolean
  isFree: boolean
  prerequisites: string[]
  learningObjectives: string[]
  resources: {
    type: "pdf" | "code" | "dataset" | "template"
    title: string
    url: string
  }[]
  quiz: {
    questions: number
    passingScore: number
  }
  certification: boolean
  tags: string[]
  rating: number
  reviews: number
  enrolledStudents: number
  completionRate: number
  lastUpdated: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  duration: string
  videoUrl: string
  isCompleted: boolean
  isLocked: boolean
  transcript: string
  notes: string[]
  quiz?: {
    questions: QuizQuestion[]
    passingScore: number
  }
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "fill-blank"
  options?: string[]
  correctAnswer: string | number
  explanation: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  modules: string[]
  prerequisites: string[]
  outcomes: string[]
  certification: boolean
  thumbnail: string
  color: string
  progress: number
  enrolledStudents: number
  rating: number
  instructor: string
}

export interface UserProgress {
  userId: string
  moduleId: string
  chapterId?: string
  progress: number
  timeSpent: number
  lastAccessed: string
  completed: boolean
  quizScores: { [key: string]: number }
  notes: string[]
  bookmarks: string[]
  certificates: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export interface Instructor {
  id: string
  name: string
  title: string
  bio: string
  avatar: string
  rating: number
  students: number
  courses: number
  experience: string
  specialties: string[]
  social: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

// Mock Data
export const learningPaths: LearningPath[] = [
  {
    id: "path-1",
    title: "Complete Trading Mastery",
    description: "Master quantitative trading from fundamentals to advanced algorithmic strategies",
    difficulty: "beginner",
    duration: "12 weeks",
    modules: ["module-1", "module-2", "module-3", "module-4", "module-5"],
    prerequisites: [],
    outcomes: [
      "Build and deploy trading algorithms",
      "Understand market microstructure",
      "Master risk management techniques",
      "Develop quantitative strategies"
    ],
    certification: true,
    thumbnail: "/placeholder.svg?height=300&width=400",
    color: "from-primary to-green-400",
    progress: 34,
    enrolledStudents: 15420,
    rating: 4.9,
    instructor: "Dr. Sarah Chen"
  },
  {
    id: "path-2",
    title: "Algorithmic Trading Specialist",
    description: "Deep dive into algorithmic trading systems and automated strategies",
    difficulty: "advanced",
    duration: "8 weeks",
    modules: ["module-6", "module-7", "module-8"],
    prerequisites: ["Complete Trading Mastery"],
    outcomes: [
      "Build high-frequency trading systems",
      "Implement machine learning models",
      "Master backtesting frameworks",
      "Deploy production algorithms"
    ],
    certification: true,
    thumbnail: "/placeholder.svg?height=300&width=400",
    color: "from-purple-500 to-blue-500",
    progress: 0,
    enrolledStudents: 8750,
    rating: 4.8,
    instructor: "Prof. Michael Rodriguez"
  },
  {
    id: "path-3",
    title: "Risk Management Expert",
    description: "Comprehensive risk management and portfolio optimization strategies",
    difficulty: "intermediate",
    duration: "6 weeks",
    modules: ["module-9", "module-10", "module-11"],
    prerequisites: [],
    outcomes: [
      "Master portfolio theory",
      "Implement risk models",
      "Understand derivatives pricing",
      "Build hedging strategies"
    ],
    certification: true,
    thumbnail: "/placeholder.svg?height=300&width=400",
    color: "from-red-500 to-orange-500",
    progress: 67,
    enrolledStudents: 12300,
    rating: 4.7,
    instructor: "Dr. Emily Watson"
  }
]

export const learningModules: LearningModule[] = [
  {
    id: "module-1",
    title: "Trading Fundamentals & Market Structure",
    description: "Master the core concepts of financial markets, trading principles, and market microstructure",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: "2.5 hours",
    estimatedHours: 3,
    instructor: {
      name: "Dr. Sarah Chen",
      avatar: "/placeholder.svg?height=60&width=60",
      title: "Quantitative Trading Expert",
      rating: 4.9,
      students: 25000
    },
    thumbnail: "/placeholder.svg?height=200&width=350",
    videoUrl: "dQw4w9WgXcQ",
    isLocked: false,
    isPremium: false,
    isFree: true,
    prerequisites: [],
    learningObjectives: [
      "Understand market structure and participants",
      "Learn order types and execution mechanisms",
      "Master bid-ask spreads and market depth",
      "Analyze market microstructure effects"
    ],
    resources: [
      {
        type: "pdf",
        title: "Market Structure Guide",
        url: "/resources/market-structure.pdf"
      },
      {
        type: "code",
        title: "Order Book Analysis",
        url: "/code/orderbook.py"
      }
    ],
    quiz: {
      questions: 15,
      passingScore: 80
    },
    certification: true,
    tags: ["fundamentals", "market-structure", "trading-basics"],
    rating: 4.8,
    reviews: 1247,
    enrolledStudents: 15420,
    completionRate: 89,
    lastUpdated: "2024-01-15",
    chapters: [
      {
        id: "ch-1-1",
        title: "Introduction to Financial Markets",
        duration: "18:30",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: true,
        isLocked: false,
        transcript: "Welcome to the world of financial markets...",
        notes: ["Key concept: Market efficiency", "Remember: Liquidity vs Volume"]
      },
      {
        id: "ch-1-2",
        title: "Market Participants & Their Roles",
        duration: "22:15",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: true,
        isLocked: false,
        transcript: "Understanding who trades and why...",
        notes: ["Institutional vs Retail", "Market makers provide liquidity"]
      },
      {
        id: "ch-1-3",
        title: "Order Types & Execution",
        duration: "25:45",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: false,
        isLocked: false,
        transcript: "Different ways to enter the market...",
        notes: []
      },
      {
        id: "ch-1-4",
        title: "Market Microstructure Deep Dive",
        duration: "32:20",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: false,
        isLocked: true,
        transcript: "Advanced concepts in market structure...",
        notes: []
      }
    ]
  },
  {
    id: "module-2",
    title: "Technical Analysis Mastery",
    description: "Comprehensive guide to technical analysis, chart patterns, and indicator strategies",
    category: "Analysis",
    difficulty: "intermediate",
    duration: "3.2 hours",
    estimatedHours: 4,
    instructor: {
      name: "Prof. Michael Rodriguez",
      avatar: "/placeholder.svg?height=60&width=60",
      title: "Technical Analysis Expert",
      rating: 4.7,
      students: 18500
    },
    thumbnail: "/placeholder.svg?height=200&width=350",
    videoUrl: "dQw4w9WgXcQ",
    isLocked: false,
    isPremium: true,
    isFree: false,
    prerequisites: ["module-1"],
    learningObjectives: [
      "Master chart pattern recognition",
      "Understand technical indicators",
      "Learn trend analysis techniques",
      "Develop trading strategies"
    ],
    resources: [
      {
        type: "template",
        title: "Technical Analysis Toolkit",
        url: "/templates/ta-toolkit.xlsx"
      },
      {
        type: "code",
        title: "Indicator Library",
        url: "/code/indicators.py"
      }
    ],
    quiz: {
      questions: 20,
      passingScore: 85
    },
    certification: true,
    tags: ["technical-analysis", "charts", "indicators", "patterns"],
    rating: 4.6,
    reviews: 892,
    enrolledStudents: 12300,
    completionRate: 76,
    lastUpdated: "2024-01-10",
    chapters: [
      {
        id: "ch-2-1",
        title: "Chart Types & Timeframes",
        duration: "20:15",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: false,
        isLocked: false,
        transcript: "Understanding different chart representations...",
        notes: []
      },
      {
        id: "ch-2-2",
        title: "Support & Resistance Levels",
        duration: "28:30",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: false,
        isLocked: false,
        transcript: "Identifying key price levels...",
        notes: []
      },
      {
        id: "ch-2-3",
        title: "Chart Patterns & Recognition",
        duration: "35:45",
        videoUrl: "dQw4w9WgXcQ",
        isCompleted: false,
        isLocked: true,
        transcript: "Classic patterns and their implications...",
        notes: []
      }
    ]
  }
]

export const achievements: Achievement[] = [
  {
    id: "first-lesson",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: Play,
    rarity: "common",
    points: 10,
    unlocked: true,
    unlockedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score 100% on 5 quizzes",
    icon: Brain,
    rarity: "rare",
    points: 50,
    unlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: "speed-learner",
    title: "Speed Learner",
    description: "Complete a module in under 2 hours",
    icon: Zap,
    rarity: "epic",
    points: 100,
    unlocked: true,
    unlockedAt: "2024-01-20T14:15:00Z"
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Complete 10 modules",
    icon: BookOpen,
    rarity: "legendary",
    points: 500,
    unlocked: false,
    progress: 3,
    maxProgress: 10
  }
]

export const instructors: Instructor[] = [
  {
    id: "sarah-chen",
    name: "Dr. Sarah Chen",
    title: "Quantitative Trading Expert",
    bio: "Former Goldman Sachs quantitative analyst with 15+ years of experience in algorithmic trading and risk management.",
    avatar: "/placeholder.svg?height=120&width=120",
    rating: 4.9,
    students: 25000,
    courses: 8,
    experience: "15+ years",
    specialties: ["Quantitative Analysis", "Risk Management", "Algorithmic Trading"],
    social: {
      linkedin: "https://linkedin.com/in/sarahchen",
      twitter: "https://twitter.com/sarahchen_quant"
    }
  },
  {
    id: "michael-rodriguez",
    name: "Prof. Michael Rodriguez",
    title: "Technical Analysis Expert",
    bio: "Professor of Finance at MIT with expertise in market microstructure and technical analysis methodologies.",
    avatar: "/placeholder.svg?height=120&width=120",
    rating: 4.7,
    students: 18500,
    courses: 6,
    experience: "12+ years",
    specialties: ["Technical Analysis", "Market Structure", "Trading Psychology"],
    social: {
      linkedin: "https://linkedin.com/in/mrodriguez",
      website: "https://michaelrodriguez.com"
    }
  }
]

export const userStats = {
  totalHours: 47.5,
  completedModules: 8,
  currentStreak: 12,
  totalPoints: 2450,
  level: 7,
  nextLevelPoints: 3000,
  certificates: 3,
  averageScore: 94,
  rank: 156,
  totalUsers: 50000
}

export const recentActivity = [
  {
    type: "completed",
    title: "Completed 'Market Structure Deep Dive'",
    time: "2 hours ago",
    points: 25
  },
  {
    type: "achievement",
    title: "Earned 'Speed Learner' badge",
    time: "1 day ago",
    points: 100
  },
  {
    type: "quiz",
    title: "Scored 98% on Technical Analysis Quiz",
    time: "2 days ago",
    points: 50
  },
  {
    type: "milestone",
    title: "Reached Level 7",
    time: "3 days ago",
    points: 200
  }
]
