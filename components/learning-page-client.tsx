"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  Star,
  Brain,
  Crown,
  Plus,
  X,
  Mail,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  FileText,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Pause,
  Check,
  Bot,
  Send,
  Lightbulb,
  Calendar,
  BarChart3,
  Target,
  Briefcase,
  Shield,
  Share,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { learningModules } from "@/lib/learning-data"
import { progressTracker, type UserProgress } from "@/lib/learning-progress"
import type { LearningModule, LearningPath, Achievement, Chapter } from "@/lib/learning-data"

// Email Collection Modal Component
const EmailCollectionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string) => void
}) => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onSubmit(email)
      setIsLoading(false)
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">🎓 Start Your Learning Journey</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Enter your email to access our world-class trading education platform and track your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Access to all free courses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Progress tracking & certificates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Exclusive trading insights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Community access
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={!email || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating Account...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy. No spam, unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Video Player Component with Real Progress Tracking
const VideoPlayer = ({
  videoId,
  title,
  moduleId,
  chapterId,
  onProgress,
}: {
  videoId: string
  title: string
  moduleId: string
  chapterId: string
  onProgress: (progress: number) => void
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300) // 5 minutes default
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const progress = (currentTime / duration) * 100

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = Math.min(prev + 1, duration)
          const newProgress = (newTime / duration) * 100

          // Update progress in tracker
          progressTracker.updateWatchTime(videoId, 1 / 60) // 1 second in minutes
          progressTracker.updateModuleProgress(moduleId, chapterId, newProgress)
          onProgress(newProgress)

          return newTime
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, duration, onProgress, videoId, moduleId, chapterId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
        <img
          src={`/placeholder.svg?height=400&width=700&query=${title} video`}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-black" />
            ) : (
              <Play className="w-10 h-10 text-black ml-1" fill="black" />
            )}
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
            className="text-white hover:bg-white/20"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(Number(value))}>
              <SelectTrigger className="w-16 h-8 bg-transparent border-gray-600 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Learning Path Card Component
const LearningPathCard = ({
  path,
  userProgress,
  onEnroll,
}: {
  path: LearningPath
  userProgress: UserProgress | null
  onEnroll: (pathId: string) => void
}) => {
  const pathProgress = userProgress?.pathProgress[path.id]
  const actualProgress = pathProgress?.progress || 0

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={path.thumbnail || "/placeholder.svg"}
          alt={path.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-20`} />

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium backdrop-blur-sm",
              path.difficulty === "beginner" && "bg-green-500/20 text-green-400 border-green-500/30",
              path.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              path.difficulty === "advanced" && "bg-red-500/20 text-red-400 border-red-500/30",
            )}
          >
            {path.difficulty}
          </Badge>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-black/60 backdrop-blur-sm text-white border-gray-600/30">
            <Clock className="w-3 h-3 mr-1" />
            {path.duration}
          </Badge>
        </div>

        {/* Progress Overlay */}
        {actualProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between text-xs text-white mb-1">
              <span>Progress</span>
              <span>{Math.round(actualProgress)}%</span>
            </div>
            <Progress value={actualProgress} className="h-1" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors duration-200">
            {path.title}
          </h3>
          {path.certification && <Award className="w-5 h-5 text-primary flex-shrink-0" />}
        </div>

        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{path.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{path.enrolledStudents?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{path.rating || "0"}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{path.modules.length} modules</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-6 h-6">
            <AvatarImage src="/placeholder.svg?height=24&width=24" />
            <AvatarFallback className="text-xs">{path.instructor[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-400">{path.instructor}</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onEnroll(path.id)}
          className={cn(
            "w-full font-semibold transition-all duration-300",
            actualProgress > 0
              ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              : "bg-primary hover:bg-primary/90 text-black",
          )}
        >
          {actualProgress > 0 ? "Continue Learning" : "Start Learning"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}

// Module Card Component with Real Progress
const ModuleCard = ({
  module,
  userProgress,
  onStart,
}: {
  module: LearningModule
  userProgress: UserProgress | null
  onStart: (moduleId: string) => void
}) => {
  const moduleProgress = userProgress?.moduleProgress[module.id]
  const actualProgress = moduleProgress?.progress || 0
  const isCompleted = moduleProgress?.completed || false

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={module.thumbnail || "/placeholder.svg"}
          alt={module.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            {isCompleted ? (
              <CheckCircle className="w-8 h-8 text-black" />
            ) : (
              <Play className="w-8 h-8 text-black ml-1" fill="black" />
            )}
          </motion.div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isCompleted && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          {module.isFree && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Free</Badge>}
          {module.isPremium && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          {module.isLocked && (
            <Badge className="bg-gray-700/50 text-gray-400 border-gray-600/30">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>

        {/* Difficulty */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium backdrop-blur-sm",
              module.difficulty === "beginner" && "bg-green-500/20 text-green-400 border-green-500/30",
              module.difficulty === "intermediate" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              module.difficulty === "advanced" && "bg-red-500/20 text-red-400 border-red-500/30",
              module.difficulty === "expert" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
            )}
          >
            {module.difficulty}
          </Badge>
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-black/60 backdrop-blur-sm text-white border-gray-600/30">
            <Clock className="w-3 h-3 mr-1" />
            {module.duration}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-primary transition-colors duration-200">
            {module.title}
          </h3>
          {module.certification && <Award className="w-4 h-4 text-primary flex-shrink-0" />}
        </div>

        <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">{module.description}</p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={module.instructor.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{module.instructor.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-400">{module.instructor.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>{module.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{module.enrolledStudents?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{module.chapters.length} chapters</span>
          </div>
        </div>

        {/* Progress */}
        {actualProgress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(actualProgress)}%</span>
            </div>
            <Progress value={actualProgress} className="h-1" />
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onStart(module.id)}
          disabled={module.isLocked}
          className={cn(
            "w-full text-xs font-semibold transition-all duration-300",
            module.isLocked
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : actualProgress > 0
                ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                : "bg-primary hover:bg-primary/90 text-black",
          )}
        >
          {module.isLocked ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </>
          ) : actualProgress > 0 ? (
            isCompleted ? (
              "Review"
            ) : (
              "Continue"
            )
          ) : module.isFree ? (
            "Start Free"
          ) : (
            "Start Learning"
          )}
        </Button>
      </div>
    </motion.div>
  )
}

// Achievement Card Component with Real Progress
const AchievementCard = ({
  achievement,
  userProgress,
}: {
  achievement: Achievement
  userProgress: UserProgress | null
}) => {
  const Icon = achievement.icon
  const isUnlocked = userProgress?.achievements.includes(achievement.id) || false

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-lg border transition-all duration-300",
        isUnlocked
          ? `border-${achievement.rarity === "legendary" ? "yellow" : achievement.rarity === "epic" ? "purple" : achievement.rarity === "rare" ? "blue" : "green"}-500 bg-${achievement.rarity === "legendary" ? "yellow" : achievement.rarity === "epic" ? "purple" : achievement.rarity === "rare" ? "blue" : "green"}-500/10`
          : "border-gray-700 bg-gray-800/30 opacity-60",
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isUnlocked
              ? `bg-${achievement.rarity === "legendary" ? "yellow" : achievement.rarity === "epic" ? "purple" : achievement.rarity === "rare" ? "blue" : "green"}-500`
              : "bg-gray-700",
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              achievement.rarity === "legendary"
                ? "bg-yellow-500/20 text-yellow-400"
                : achievement.rarity === "epic"
                  ? "bg-purple-500/20 text-purple-400"
                  : achievement.rarity === "rare"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-green-500/20 text-green-400",
            )}
          >
            {achievement.rarity}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-primary">+{achievement.points}</div>
          <div className="text-xs text-gray-400">points</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>

      {isUnlocked ? (
        <div className="text-xs text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Unlocked
        </div>
      ) : achievement.progress !== undefined ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
          <Progress value={(achievement.progress! / achievement.maxProgress!) * 100} className="h-1" />
        </div>
      ) : (
        <div className="text-xs text-gray-500">Not started</div>
      )}
    </motion.div>
  )
}

const personalizedLearningPaths = [
  {
    id: "beginner-complete",
    title: "Complete Beginner to Profitable Trader",
    description: "Comprehensive 12-week program designed specifically for your learning style and goals",
    difficulty: "beginner",
    duration: "12 weeks",
    modules: 24,
    estimatedHours: 48,
    personalizedFor: "Visual Learner, Risk-Averse, Long-term Focus",
    aiRecommendation:
      "Based on your assessment, this path emphasizes visual learning with practical examples and conservative strategies",
    adaptiveFeatures: ["Custom pace adjustment", "Skill gap analysis", "Personalized quizzes", "Progress prediction"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    color: "from-green-500 to-emerald-600",
    instructor: "Sarah Kim",
    rating: 4.9,
    enrolledStudents: 15420,
    certification: true,
    prerequisites: [],
    learningOutcomes: [
      "Master fundamental analysis techniques",
      "Develop risk management skills",
      "Create your first trading strategy",
      "Understand market psychology",
    ],
  },
]

const advancedProgressTracking = {
  overallProgress: 67,
  weeklyGoal: 5, // hours
  weeklyProgress: 3.2,
  learningStreak: 12,
  skillLevels: {
    "Technical Analysis": 78,
    "Risk Management": 65,
    "Strategy Development": 45,
    "Market Psychology": 82,
    "Portfolio Management": 34,
  },
  recentActivity: [
    { date: "2024-01-15", module: "Options Basics", timeSpent: 45, completed: true },
    { date: "2024-01-14", module: "Risk Assessment", timeSpent: 32, completed: false },
    { date: "2024-01-13", module: "Chart Patterns", timeSpent: 67, completed: true },
  ],
  upcomingMilestones: [
    { title: "Complete Technical Analysis Path", progress: 78, dueDate: "2024-02-01" },
    { title: "Pass Risk Management Certification", progress: 45, dueDate: "2024-02-15" },
  ],
  learningInsights: {
    bestLearningTime: "9:00 AM - 11:00 AM",
    preferredContentType: "Video + Interactive",
    averageSessionLength: "42 minutes",
    retentionRate: "89%",
    strongestSkills: ["Chart Reading", "Pattern Recognition"],
    improvementAreas: ["Options Trading", "Advanced Strategies"],
  },
}

const InteractiveQuiz = ({ quiz, onComplete }: { quiz: any; onComplete: (score: number) => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate score and show results
      const correctAnswers = selectedAnswers.reduce((acc, answer, index) => {
        return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0)
      }, 0)
      const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)
      setScore(finalScore)
      setShowResults(true)
      onComplete(finalScore)
    }
  }

  const question = quiz.questions[currentQuestion]

  if (showResults) {
    return (
      <Card className="bg-gray-900/80 border-gray-800">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-green-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{score}%</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quiz Complete!</h3>
            <p className="text-gray-400">
              {score >= 80
                ? "Excellent work! You've mastered this topic."
                : score >= 60
                  ? "Good job! Review the areas you missed."
                  : "Keep studying! You'll get it next time."}
            </p>
          </div>

          {/* AI Feedback */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-primary mb-2">AI Feedback</h4>
            <p className="text-sm text-gray-300">
              Based on your answers, you show strong understanding of basic concepts but could benefit from more
              practice with advanced risk management techniques. I recommend reviewing Module 3.2.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-700 text-gray-300 bg-transparent">
              Review Answers
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-black">Continue Learning</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{quiz.title}</h3>
            <Badge className="bg-primary/20 text-primary">
              {currentQuestion + 1} / {quiz.questions.length}
            </Badge>
          </div>
          <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="h-2" />
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">{question.question}</h4>
          <div className="space-y-3">
            {question.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={cn(
                  "w-full p-4 text-left rounded-lg border transition-all duration-200",
                  selectedAnswers[currentQuestion] === index
                    ? "border-primary bg-primary/10 text-white"
                    : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600",
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      selectedAnswers[currentQuestion] === index ? "border-primary bg-primary" : "border-gray-600",
                    )}
                  >
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="border-gray-700 text-gray-300"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="bg-primary hover:bg-primary/90 text-black"
          >
            {currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const EnhancedVideoPlayer = ({
  videoId,
  title,
  moduleId,
  chapterId,
  onProgress,
}: {
  videoId: string
  title: string
  moduleId: string
  chapterId: string
  onProgress: (progress: number) => void
}) => {
  const [notes, setNotes] = useState<Array<{ id: string; timestamp: number; content: string }>>([])
  const [currentNote, setCurrentNote] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: currentNote.trim(),
      }
      setNotes([...notes, newNote])
      setCurrentNote("")
    }
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <VideoPlayer videoId={videoId} title={title} moduleId={moduleId} chapterId={chapterId} onProgress={onProgress} />

      {/* Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Video Notes</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="border-gray-700 text-gray-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {showNotes ? "Hide" : "Show"} Notes
                </Button>
              </div>
            </CardHeader>
            {showNotes && (
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note at current timestamp..."
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => e.key === "Enter" && addNote()}
                  />
                  <Button
                    onClick={addNote}
                    disabled={!currentNote.trim()}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {formatTimestamp(note.timestamp)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-300">{note.content}</p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No notes yet. Add your first note above!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Chapter Navigation */}
        <div>
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
              <h3 className="font-semibold text-white">Chapter Progress</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Chapter</span>
                  <span className="text-primary">3 of 8</span>
                </div>
                <Progress value={37.5} className="h-2" />
              </div>

              <div className="space-y-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors",
                      i === 2 ? "bg-primary/20 border border-primary/30" : "hover:bg-gray-800/50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        i < 2
                          ? "bg-green-500 text-white"
                          : i === 2
                            ? "bg-primary text-black"
                            : "bg-gray-700 text-gray-400",
                      )}
                    >
                      {i < 2 ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={cn("text-sm", i === 2 ? "text-white font-medium" : "text-gray-400")}>
                      Chapter {i + 1}: {i === 2 ? "Risk Management" : "Trading Basics"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function LearningPageClient() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)

  // Check authentication and load progress on mount
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    if (userEmail) {
      setIsAuthenticated(true)
      const progress = progressTracker.initializeUser(userEmail)
      progressTracker.updateStreak() // Update streak on login
      setUserProgress(progress)
    }
  }, [])

  const handleEmailSubmit = (email: string) => {
    localStorage.setItem("userEmail", email)
    setIsAuthenticated(true)
    const progress = progressTracker.initializeUser(email)
    setUserProgress(progress)
  }

  const handleStartModule = (moduleId: string) => {
    if (!isAuthenticated) {
      setShowEmailModal(true)
      return
    }

    const module = learningModules.find((m) => m.id === moduleId)
    if (module) {
      setSelectedModule(module)
      setCurrentChapter(module.chapters[0])
      setShowVideoPlayer(true)
    }
  }

  const handleEnrollPath = (pathId: string) => {
    if (!isAuthenticated) {
      setShowEmailModal(true)
      return
    }
    // Handle path enrollment
    console.log("Enrolling in path:", pathId)
  }

  const handleVideoProgress = (progress: number) => {
    // Progress is automatically handled in VideoPlayer component
    // Refresh user progress to show updates
    const currentProgress = progressTracker.getCurrentProgress()
    if (currentProgress) {
      setUserProgress({ ...currentProgress })
    }
  }

  const handleCompleteChapter = () => {
    // Logic to mark chapter as complete and move to the next one
    if (selectedModule && currentChapter) {
      // Find the index of the current chapter
      const currentChapterIndex = selectedModule.chapters.findIndex((chapter) => chapter.id === currentChapter.id)

      // If it's not the last chapter, move to the next one
      if (currentChapterIndex < selectedModule.chapters.length - 1) {
        setCurrentChapter(selectedModule.chapters[currentChapterIndex + 1])
      } else {
        // If it's the last chapter, mark the module as complete
        progressTracker.updateModuleProgress(selectedModule.id, currentChapter.id, 100)
        setUserProgress(progressTracker.getCurrentProgress())
        setShowVideoPlayer(false)
        setShowQuiz(true) // Show quiz after completing the module
      }
    }
  }

  const handleQuizComplete = (score: number) => {
    setQuizScore(score)
    setShowQuiz(false)
  }

  const filteredModules = useMemo(() => {
    return learningModules.filter((module) => {
      const matchesSearch =
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || module.category.toLowerCase() === selectedCategory
      const matchesDifficulty = selectedDifficulty === "all" || module.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [searchQuery, selectedCategory, selectedDifficulty])

  const categories = ["all", "fundamentals", "analysis", "strategy", "risk", "psychology"]
  const difficulties = ["all", "beginner", "intermediate", "advanced", "expert"]

  // Get real user stats
  const userStats = userProgress
    ? {
        totalHours: Math.round(userProgress.totalHours * 10) / 10,
        completedModules: userProgress.completedModules.length,
        currentStreak: userProgress.currentStreak,
        totalPoints: userProgress.totalPoints,
        level: userProgress.level,
        nextLevelPoints: (userProgress.level + 1) * 500,
        certificates: userProgress.certificates.length,
        averageScore: 94, // Could be calculated from quiz scores
        ...progressTracker.getUserRank(),
      }
    : {
        totalHours: 0,
        completedModules: 0,
        currentStreak: 0,
        totalPoints: 0,
        level: 1,
        nextLevelPoints: 500,
        certificates: 0,
        averageScore: 0,
        rank: 0,
        totalUsers: 50000,
      }

  const sampleQuiz = {
    title: "Risk Management Quiz",
    questions: [
      {
        question: "What is the primary goal of risk management in trading?",
        options: [
          "Maximizing potential profits",
          "Minimizing potential losses",
          "Predicting market movements",
          "Increasing trading frequency",
        ],
        correctAnswer: 1,
      },
      {
        question: "What does the term 'position sizing' refer to?",
        options: [
          "The size of your trading desk",
          "The amount of capital allocated to a single trade",
          "The number of indicators on a chart",
          "The duration of a trade",
        ],
        correctAnswer: 1,
      },
      {
        question: "What is a stop-loss order?",
        options: [
          "An order to stop trading for the day",
          "An order to automatically close a trade when it reaches a certain profit level",
          "An order to automatically close a trade when it reaches a certain loss level",
          "An order to increase the position size",
        ],
        correctAnswer: 2,
      },
    ],
  }

  const AdaptiveLearningEngine = ({ userId, currentModule }: { userId: string; currentModule?: string }) => {
    const [adaptiveData, setAdaptiveData] = useState({
      learningStyle: "Visual",
      difficultyPreference: "Progressive",
      optimalSessionLength: 45,
      bestLearningTime: "Morning",
      retentionRate: 0.89,
      recommendedPace: "Standard",
      nextOptimalTopic: "Risk Management Fundamentals",
    })

    const [predictions, setPredictions] = useState({
      completionProbability: 0.87,
      estimatedTimeToComplete: "3.2 weeks",
      skillGaps: ["Options Trading", "Advanced Charting"],
      strengthAreas: ["Technical Analysis", "Market Psychology"],
      riskOfDropout: 0.12,
    })

    return (
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">AI Learning Assistant</h3>
            <Badge className="bg-primary/20 text-primary text-xs">Adaptive</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performance Prediction */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-medium text-white text-sm">Success Prediction</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(predictions.completionProbability * 100)}%
            </div>
            <p className="text-xs text-gray-400">Completion probability based on your learning pattern</p>
          </div>

          {/* Skill Gap Analysis */}
          <div>
            <h4 className="font-medium text-white text-sm mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Skill Gap Analysis</span>
            </h4>
            <div className="space-y-2">
              {predictions.skillGaps.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded"
                >
                  <span className="text-sm text-white">{skill}</span>
                  <Badge className="bg-red-500/20 text-red-400 text-xs">Needs Focus</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Schedule */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <h4 className="font-medium text-white text-sm mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Optimized Schedule</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Best Learning Time:</span>
                <span className="text-white">{adaptiveData.bestLearningTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Session Length:</span>
                <span className="text-white">{adaptiveData.optimalSessionLength} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recommended Pace:</span>
                <span className="text-white">{adaptiveData.recommendedPace}</span>
              </div>
            </div>
          </div>

          {/* Next Recommendation */}
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary text-sm">AI Recommendation</span>
            </div>
            <p className="text-sm text-gray-300">
              Focus on "{adaptiveData.nextOptimalTopic}" next to maximize your learning efficiency
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const AITutoringAssistant = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
      {
        id: 1,
        type: "ai",
        content:
          "Hi! I'm your AI trading tutor. I can help explain concepts, answer questions, and provide personalized guidance. What would you like to learn about?",
        timestamp: new Date(),
      },
    ])
    const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)

    const handleSendMessage = async () => {
      if (!inputMessage.trim()) return

      const userMessage = {
        id: messages.length + 1,
        type: "user",
        content: inputMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputMessage("")
      setIsTyping(true)

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: "ai",
          content:
            "Great question! Let me break that down for you with a personalized explanation based on your current learning progress...",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      }, 2000)
    }

    return (
      <>
        {/* Floating AI Assistant Button */}
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg z-50"
        >
          <Bot className="w-6 h-6" />
        </Button>

        {/* AI Chat Interface */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md h-[500px] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>AI Tutor Assistant</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs">Online</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-black"
                        : "bg-gray-800 text-white border border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about trading..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-primary hover:bg-primary/90 text-black">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  const CertificationPrograms = ({ userId }: { userId: string }) => {
    const [certifications, setCertifications] = useState([
      {
        id: 1,
        title: "Certified Trading Professional (CTP)",
        provider: "Nexural Trading Institute",
        level: "Professional",
        duration: "8 weeks",
        price: 499,
        blockchain: true,
        industry_recognized: true,
        modules: [
          "Advanced Technical Analysis",
          "Risk Management Mastery",
          "Portfolio Optimization",
          "Algorithmic Trading Basics",
        ],
        requirements: {
          prerequisites: ["Complete Intermediate Path", "Pass Assessment"],
          practicalHours: 40,
          examScore: 85,
        },
        benefits: [
          "Industry recognition",
          "Blockchain-verified credential",
          "Job placement assistance",
          "Alumni network access",
        ],
        graduates: 2847,
        employmentRate: 94,
        averageSalaryIncrease: "32%",
        nextExamDate: "2024-03-15",
        enrolled: false,
      },
      {
        id: 2,
        title: "Quantitative Analysis Specialist",
        provider: "Nexural Trading Institute",
        level: "Expert",
        duration: "12 weeks",
        price: 799,
        blockchain: true,
        industry_recognized: true,
        modules: [
          "Mathematical Finance",
          "Statistical Modeling",
          "Machine Learning for Trading",
          "High-Frequency Trading",
        ],
        requirements: {
          prerequisites: ["CTP Certification", "Python Proficiency"],
          practicalHours: 60,
          examScore: 90,
        },
        benefits: [
          "Quant role preparation",
          "Advanced algorithm development",
          "Institutional trading access",
          "Research publication opportunities",
        ],
        graduates: 892,
        employmentRate: 97,
        averageSalaryIncrease: "58%",
        nextExamDate: "2024-04-01",
        enrolled: false,
      },
    ])

    const [userProgress, setUserProgress] = useState({
      currentCertification: null,
      completedModules: 0,
      totalModules: 0,
      examEligible: false,
      practicalHoursCompleted: 0,
    })

    return (
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-gold-400" />
            <h3 className="font-semibold text-white">Professional Certifications</h3>
            <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-4 bg-gradient-to-r from-gold-500/10 to-yellow-500/10 border border-gold-500/30 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-white text-lg">{cert.title}</h4>
                  <p className="text-sm text-gray-400">{cert.provider}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className="bg-primary/20 text-primary text-xs">{cert.level}</Badge>
                    <span className="text-xs text-gray-400">{cert.duration}</span>
                    {cert.blockchain && (
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">Blockchain Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gold-400">${cert.price}</div>
                  <p className="text-xs text-gray-400">One-time fee</p>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-800/50 rounded">
                  <div className="text-lg font-bold text-green-400">{cert.employmentRate}%</div>
                  <div className="text-xs text-gray-400">Employment Rate</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded">
                  <div className="text-lg font-bold text-blue-400">{cert.averageSalaryIncrease}</div>
                  <div className="text-xs text-gray-400">Salary Increase</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded">
                  <div className="text-lg font-bold text-purple-400">{cert.graduates?.toLocaleString() || "0"}</div>
                  <div className="text-xs text-gray-400">Graduates</div>
                </div>
              </div>

              {/* Modules */}
              <div className="mb-4">
                <h5 className="font-medium text-white text-sm mb-2">Certification Modules</h5>
                <div className="grid grid-cols-2 gap-2">
                  {cert.modules.map((module, index) => (
                    <div key={index} className="text-xs text-gray-300 p-2 bg-gray-800/30 rounded">
                      {module}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <h5 className="font-medium text-white text-sm mb-2">Requirements</h5>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>• Prerequisites: {cert.requirements.prerequisites.join(", ")}</p>
                  <p>• Practical Hours: {cert.requirements.practicalHours}</p>
                  <p>• Minimum Exam Score: {cert.requirements.examScore}%</p>
                </div>
              </div>

              {/* Next Exam */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Next Exam: {cert.nextExamDate}</p>
                  <p className="text-xs text-gray-400">Registration closes 2 weeks prior</p>
                </div>
                <Button className="bg-gold-500 hover:bg-gold-600 text-black">Enroll Now</Button>
              </div>
            </div>
          ))}

          {/* Certification Progress (if enrolled) */}
          {userProgress.currentCertification && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <h4 className="font-medium text-white text-sm mb-3">Your Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Modules Completed</span>
                    <span className="text-white">
                      {userProgress.completedModules}/{userProgress.totalModules}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(userProgress.completedModules / userProgress.totalModules) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Practical Hours</span>
                    <span className="text-white">{userProgress.practicalHoursCompleted}/40</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(userProgress.practicalHoursCompleted / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {userProgress.examEligible && (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                    Schedule Certification Exam
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const AdvancedPortfolioTools = ({ userId }: { userId: string }) => {
    const [portfolioData, setPortfolioData] = useState({
      strategies: [
        {
          id: 1,
          name: "Momentum Breakout Strategy",
          type: "Technical",
          performance: {
            totalReturn: 23.7,
            sharpeRatio: 1.84,
            maxDrawdown: -8.2,
            winRate: 67.3,
          },
          backtestPeriod: "2 years",
          trades: 156,
          verified: true,
          published: true,
          views: 2847,
          likes: 234,
        },
        {
          id: 2,
          name: "Mean Reversion Algorithm",
          type: "Quantitative",
          performance: {
            totalReturn: 18.9,
            sharpeRatio: 2.12,
            maxDrawdown: -5.4,
            winRate: 72.1,
          },
          backtestPeriod: "3 years",
          trades: 289,
          verified: true,
          published: false,
          views: 0,
          likes: 0,
        },
      ],
      achievements: [
        { title: "Strategy Developer", description: "Created 5+ verified strategies", earned: true },
        { title: "Risk Manager", description: "Maintained <10% max drawdown", earned: true },
        { title: "Consistent Performer", description: "6 months positive returns", earned: false },
      ],
      portfolioValue: 125847.32,
      totalReturn: 21.4,
      riskScore: 6.2,
    })

    return (
      <Card className="bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Portfolio Showcase</h3>
            <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-black text-xs">Premium</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
              <div className="text-xl font-bold text-green-400">
                ${portfolioData.portfolioValue?.toLocaleString() || "0"}
              </div>
              <div className="text-xs text-gray-400">Portfolio Value</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
              <div className="text-xl font-bold text-blue-400">+{portfolioData.totalReturn}%</div>
              <div className="text-xs text-gray-400">Total Return</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <div className="text-xl font-bold text-purple-400">{portfolioData.riskScore}/10</div>
              <div className="text-xs text-gray-400">Risk Score</div>
            </div>
          </div>

          {/* Strategy Showcase */}
          <div>
            <h4 className="font-medium text-white text-sm mb-3">Published Strategies</h4>
            <div className="space-y-3">
              {portfolioData.strategies.map((strategy) => (
                <div key={strategy.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-white text-sm">{strategy.name}</h5>
                        {strategy.verified && <Shield className="w-3 h-3 text-blue-400" />}
                      </div>
                      <p className="text-xs text-gray-400">
                        {strategy.type} • {strategy.backtestPeriod}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {strategy.published ? (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">Published</Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-green-400">+{strategy.performance.totalReturn}%</div>
                      <div className="text-xs text-gray-400">Return</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-blue-400">{strategy.performance.sharpeRatio}</div>
                      <div className="text-xs text-gray-400">Sharpe</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-red-400">{strategy.performance.maxDrawdown}%</div>
                      <div className="text-xs text-gray-400">Max DD</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-purple-400">{strategy.performance.winRate}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                  </div>

                  {strategy.published && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {strategy.views?.toLocaleString() || "0"} views • {strategy.likes || 0} likes
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                        >
                          Edit
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-medium text-white text-sm mb-3">Achievements</h4>
            <div className="space-y-2">
              {portfolioData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    achievement.earned ? "bg-gold-500/10 border border-gold-500/30" : "bg-gray-800/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned ? "bg-gold-500" : "bg-gray-600"
                    }`}
                  >
                    {achievement.earned ? (
                      <Award className="w-4 h-4 text-black" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className={`font-medium text-sm ${achievement.earned ? "text-gold-400" : "text-gray-400"}`}>
                      {achievement.title}
                    </h5>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              New Strategy
            </Button>
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
              <Share className="w-4 h-4 mr-2" />
              Share Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  ;<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Main Content */}
    <div className="lg:col-span-3 space-y-6"></div>

    {/* AI-Powered Sidebar */}
    <div className="space-y-6">
      <AdaptiveLearningEngine userId="current-user" />
      <CertificationPrograms userId="current-user" />
      <AdvancedPortfolioTools userId="current-user" />
    </div>
  </div>
  ;<AITutoringAssistant />

  const learningPaths = [
    {
      id: "path-1",
      title: "Beginner Trading",
      description: "Learn the basics of trading",
      level: "Beginner",
      duration: "4 weeks",
      modules: [1, 2, 3],
      completionRate: 80,
    },
    {
      id: "path-2",
      title: "Advanced Trading",
      description: "Learn advanced trading techniques",
      level: "Advanced",
      duration: "8 weeks",
      modules: [4, 5, 6],
      completionRate: 60,
    },
  ]

  const EmailModal = ({
    isOpen,
    onClose,
    onSubmit,
  }: { isOpen: boolean; onClose: () => void; onSubmit: (email: string) => void }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">🎓 Start Your Learning Journey</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Enter your email to access our world-class trading education platform and track your progress.
            </DialogDescription>
          </DialogHeader>
          <EmailCollectionModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>
    )
  }

  const VideoPlayerModal = ({
    isOpen,
    onClose,
    module,
    chapter,
    onProgress,
    onComplete,
  }: {
    isOpen: boolean
    onClose: () => void
    module: LearningModule | null
    chapter: Chapter | null
    onProgress: (progress: number) => void
    onComplete: () => void
  }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {module?.title} - {chapter?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">{chapter?.title ? `Video for ${chapter.title}` : 'No description available'}</DialogDescription>
          </DialogHeader>
          {module && chapter && (
            <EnhancedVideoPlayer
              videoId={chapter.id} // Use chapter.id as videoId since videoId property doesn't exist
              title={chapter.title}
              moduleId={module.id}
              chapterId={chapter.id}
              onProgress={onProgress}
            />
          )}
          <Button onClick={onComplete} className="bg-primary hover:bg-primary/90 text-black">
            Complete Chapter
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  const QuizModal = ({
    isOpen,
    onClose,
    quiz,
    onComplete,
  }: { isOpen: boolean; onClose: () => void; quiz: any; onComplete: (score: number) => void }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{quiz.title}</DialogTitle>
            <DialogDescription className="text-gray-400">Test your knowledge</DialogDescription>
          </DialogHeader>
          <InteractiveQuiz quiz={quiz} onComplete={onComplete} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/20 to-blue-600/20 py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent leading-tight">
              Master Trading Skills
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              AI-powered personalized learning paths designed to transform you into a professional trader
            </p>
          </div>

          {/* User Stats Dashboard */}
          {isAuthenticated && userProgress && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-primary">{userStats.totalHours}h</div>
                <div className="text-sm text-gray-400">Learning Time</div>
              </div>
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-green-400">{userStats.completedModules}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-blue-400">{userStats.currentStreak}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
              <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                <div className="text-2xl font-bold text-purple-400">#{userStats.rank}</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {["overview", "paths", "modules", "progress", "certifications", "portfolio"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? "bg-primary text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search courses, topics, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-900 border-gray-800 text-white"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Learning Modules Grid */}
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                  {filteredModules.map((module) => (
                    <Card
                      key={module.id}
                      className="bg-gray-900/80 border-gray-800 hover:border-primary/50 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg">{module.title}</h3>
                            <p className="text-gray-400 text-sm">{module.description}</p>
                          </div>
                          <Badge
                            className={`${
                              module.difficulty === "beginner"
                                ? "bg-green-500/20 text-green-400"
                                : module.difficulty === "intermediate"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : module.difficulty === "advanced"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {module.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Duration: {module.duration}</span>
                            <span className="text-gray-400">{module.chapters.length} chapters</span>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-white">{module.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{"1,247"}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleStartModule(module.id)}
                            className="w-full bg-primary hover:bg-primary/90 text-black"
                          >
                            Start Learning
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "paths" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Personalized Learning Paths</h2>
                {learningPaths.map((path) => (
                  <Card key={path.id} className="bg-gray-900/80 border-gray-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-xl">{path.title}</h3>
                          <p className="text-gray-400">{path.description}</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary">{path.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-white">{path.duration}</div>
                            <div className="text-sm text-gray-400">Duration</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{path.modules.length}</div>
                            <div className="text-sm text-gray-400">Modules</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{path.completionRate}%</div>
                            <div className="text-sm text-gray-400">Success Rate</div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleEnrollPath(path.id)}
                          className="w-full bg-primary hover:bg-primary/90 text-black"
                        >
                          Enroll in Path
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "certifications" && <CertificationPrograms userId="current-user" />}

            {activeTab === "portfolio" && <AdvancedPortfolioTools userId="current-user" />}
          </div>

          {/* AI-Powered Sidebar */}
          <div className="space-y-6">
            <AdaptiveLearningEngine userId="current-user" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={handleEmailSubmit} />

      <VideoPlayerModal
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        module={selectedModule}
        chapter={currentChapter}
        onProgress={handleVideoProgress}
        onComplete={handleCompleteChapter}
      />

      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        quiz={sampleQuiz}
        onComplete={handleQuizComplete}
      />

      {/* AI Tutoring Assistant */}
      <AITutoringAssistant />
    </div>
  )
}
