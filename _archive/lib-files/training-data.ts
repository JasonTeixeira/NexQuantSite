import { BookOpen, Users, Award, MessageSquare, FileText, Video, Globe } from "lucide-react"

export interface Lesson {
  id: string
  title: string
  duration: string
  status: "completed" | "in-progress" | "not-started"
  level: "beginner" | "intermediate" | "advanced"
  videoId: string
  thumbnailUrl?: string
}

export interface Module {
  id: string
  number: string
  title: string
  description: string
  lessons: Lesson[]
  levels: string[]
}

export const progressData = [
  { label: "Course Progress", value: "67%" },
  { label: "Lessons Completed", value: "24" },
  { label: "Time Invested", value: "12.5h" },
  { label: "Average Score", value: "92%" },
]

export const courseCategories = ["All", "Beginner", "Intermediate", "Advanced", "Quantitative", "Discretionary"]

export const courseModules: Module[] = [
  {
    id: "module-1",
    number: "01",
    title: "Trading Fundamentals",
    description: "Master the core concepts of financial markets and trading principles.",
    levels: ["beginner"],
    lessons: [
      {
        id: "lesson-1-1",
        title: "Introduction to Financial Markets",
        duration: "15:30",
        status: "completed",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-1-2",
        title: "Market Structure and Participants",
        duration: "22:45",
        status: "completed",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-1-3",
        title: "Order Types and Execution",
        duration: "18:20",
        status: "in-progress",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-1-4",
        title: "Risk Management Basics",
        duration: "25:10",
        status: "not-started",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
    ],
  },
  {
    id: "module-2",
    number: "02",
    title: "Technical Analysis",
    description: "Learn to read charts, identify patterns, and use technical indicators effectively.",
    levels: ["beginner", "intermediate"],
    lessons: [
      {
        id: "lesson-2-1",
        title: "Chart Types and Timeframes",
        duration: "20:15",
        status: "completed",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-2-2",
        title: "Support and Resistance",
        duration: "28:30",
        status: "completed",
        level: "beginner",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-2-3",
        title: "Trend Analysis and Patterns",
        duration: "35:45",
        status: "in-progress",
        level: "intermediate",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-2-4",
        title: "Technical Indicators Deep Dive",
        duration: "42:20",
        status: "not-started",
        level: "intermediate",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
    ],
  },
  {
    id: "module-3",
    number: "03",
    title: "Quantitative Analysis",
    description: "Dive into mathematical models, statistical analysis, and algorithmic trading strategies.",
    levels: ["advanced", "quantitative"],
    lessons: [
      {
        id: "lesson-3-1",
        title: "Statistical Foundations",
        duration: "45:30",
        status: "not-started",
        level: "advanced",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-3-2",
        title: "Time Series Analysis",
        duration: "38:15",
        status: "not-started",
        level: "advanced",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-3-3",
        title: "Portfolio Optimization",
        duration: "52:40",
        status: "not-started",
        level: "advanced",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "lesson-3-4",
        title: "Algorithmic Strategy Development",
        duration: "65:25",
        status: "not-started",
        level: "advanced",
        videoId: "dQw4w9WgXcQ",
        thumbnailUrl: "/placeholder.svg?height=200&width=350",
      },
    ],
  },
]

export const specialModules = [
  {
    title: "Live Trading Sessions",
    description: "Join real-time trading sessions with professional traders and learn from live market analysis.",
    icon: Video,
    cta: "Join Live Sessions",
  },
  {
    title: "1-on-1 Mentorship",
    description: "Get personalized guidance from industry experts to accelerate your trading journey.",
    icon: Users,
    cta: "Book Mentorship",
  },
  {
    title: "Certification Program",
    description: "Earn industry-recognized certifications to validate your trading knowledge and skills.",
    icon: Award,
    cta: "Start Certification",
  },
]

export const resources = [
  {
    name: "Trading Library",
    description: "Comprehensive collection of trading books and research papers",
    icon: BookOpen,
  },
  {
    name: "Community Forum",
    description: "Connect with fellow traders and share insights",
    icon: MessageSquare,
  },
  {
    name: "Market Reports",
    description: "Daily and weekly market analysis reports",
    icon: FileText,
  },
  {
    name: "Webinars",
    description: "Regular educational webinars and workshops",
    icon: Globe,
  },
]
