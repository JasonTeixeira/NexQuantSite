"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Circle,
  CircleDotDashed,
  Play,
  Search,
  BookOpen,
  Clock,
  Trophy,
  Star,
  ChevronRight,
  Bookmark,
  Download,
  Share2,
  MoreVertical,
  User,
  Award,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { courseModules, progressData, courseCategories, specialModules, resources } from "@/lib/training-data"
import type { Lesson, Module } from "@/lib/training-data"
import VideoModal from "@/components/VideoModal"

const DataStream = ({ text, duration }: { text: string; duration: number }) => (
  <div
    className="absolute font-mono text-[10px] text-primary/10 whitespace-nowrap user-select-none animate-stream-move"
    style={{ animationDuration: `${duration}s` }}
  >
    {text}
  </div>
)

const LessonCard = ({
  lesson,
  moduleNumber,
  onPlay,
  isActive,
}: {
  lesson: Lesson
  moduleNumber: string
  onPlay: (lesson: Lesson) => void
  isActive?: boolean
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
        isActive && "ring-2 ring-primary/50 border-primary/30",
        "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
      )}
      onClick={() => onPlay(lesson)}
    >
      {/* Thumbnail with Play Overlay */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        <img
          src={lesson.thumbnailUrl || "/placeholder.svg?height=200&width=350&query=training video thumbnail"}
          alt={lesson.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <Play className="w-8 h-8 text-black ml-1" fill="black" />
          </motion.div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={
              lesson.status === "completed" ? "default" : lesson.status === "in-progress" ? "secondary" : "outline"
            }
            className={cn(
              "text-xs font-medium",
              lesson.status === "completed" && "bg-primary/20 text-primary border-primary/30",
              lesson.status === "in-progress" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
              lesson.status === "not-started" && "bg-gray-700/50 text-gray-400 border-gray-600/30",
            )}
          >
            {lesson.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
            {lesson.status === "in-progress" && <CircleDotDashed className="w-3 h-3 mr-1 animate-spin" />}
            {lesson.status === "not-started" && <Circle className="w-3 h-3 mr-1" />}
            {lesson.status.replace("-", " ")}
          </Badge>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-black/60 backdrop-blur-sm text-white border-gray-600/30">
            <Clock className="w-3 h-3 mr-1" />
            {lesson.duration}
          </Badge>
        </div>

        {/* Module Number */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center text-primary font-mono text-sm font-bold">
            {moduleNumber}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-primary transition-colors duration-200">
            {lesson.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setIsBookmarked(!isBookmarked)
                }}
              >
                <Bookmark className={cn("w-4 h-4 mr-2", isBookmarked && "fill-current")} />
                {isBookmarked ? "Remove Bookmark" : "Bookmark"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <Badge variant="outline" className="text-xs">
            {lesson.level}
          </Badge>

          {lesson.status === "in-progress" && (
            <div className="flex items-center gap-2">
              <Progress value={65} className="w-12 h-1" />
              <span>65%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ModuleSection = ({
  module,
  onPlayLesson,
}: {
  module: Module
  onPlayLesson: (lesson: Lesson) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const completedLessons = module.lessons.filter((l) => l.status === "completed").length
  const totalLessons = module.lessons.length
  const progressPercentage = (completedLessons / totalLessons) * 100

  return (
    <motion.section layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
      {/* Module Header */}
      <motion.div
        className="flex items-center gap-6 mb-10 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ x: 4 }}
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20">
            <span className="font-mono text-3xl font-bold text-primary">{module.number}</span>
          </div>
          {progressPercentage === 100 && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-black" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-primary transition-colors">
              {module.title}
            </h2>
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </motion.div>
          </div>

          <p className="text-gray-400 mb-4 leading-relaxed">{module.description}</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>{totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Trophy className="w-4 h-4" />
              <span>{completedLessons} completed</span>
            </div>
            <div className="flex-1 max-w-xs">
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {module.lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LessonCard lesson={lesson} moduleNumber={module.number} onPlay={onPlayLesson} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

export default function TrainingPageClient() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [modalState, setModalState] = useState({
    isOpen: false,
    videoId: "",
    title: "",
  })

  const filteredModules = useMemo(() => {
    let modules = courseModules

    // Filter by category
    if (activeCategory !== "All") {
      modules = modules.filter((module) => module.levels.includes(activeCategory.toLowerCase()))
    }

    // Filter by search query
    if (searchQuery) {
      modules = modules.filter(
        (module) =>
          module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.lessons.some((lesson) => lesson.title.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return modules
  }, [activeCategory, searchQuery])

  const handleOpenModal = (lesson: Lesson) => {
    setModalState({
      isOpen: true,
      videoId: lesson.videoId,
      title: lesson.title,
    })
  }

  const handleCloseModal = () => {
    setModalState({ isOpen: false, videoId: "", title: "" })
  }

  const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0)
  const completedLessons = courseModules.reduce(
    (acc, module) => acc + module.lessons.filter((l) => l.status === "completed").length,
    0,
  )
  const overallProgress = (completedLessons / totalLessons) * 100

  return (
    <>
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
          <div className="absolute top-[20%] w-full overflow-hidden">
            <DataStream
              text="LEARNING_PROGRESS: 67% | ACTIVE_MODULE: QUANTITATIVE_ANALYSIS | NEXT_MILESTONE: ADVANCED_STRATEGIES"
              duration={35}
            />
          </div>
          <div className="absolute top-[40%] w-full overflow-hidden">
            <DataStream
              text=">>> SKILL_DEVELOPMENT >>> KNOWLEDGE_ACQUISITION >>> PRACTICAL_APPLICATION >>>"
              duration={40}
            />
          </div>
          <div className="absolute top-[60%] w-full overflow-hidden">
            <DataStream
              text="CERTIFICATION_STATUS: IN_PROGRESS | QUIZ_AVERAGE: 94% | STUDY_STREAK: 12_DAYS"
              duration={45}
            />
          </div>
        </div>

        {/* Main Content with Proper Spacing */}
        <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section with Enhanced Spacing */}
            <motion.section
              className="text-center mb-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 mb-10 text-sm font-semibold tracking-widest text-primary uppercase border border-primary/30 bg-primary/10 rounded-full backdrop-blur-sm"
              >
                <Brain className="w-4 h-4" />
                Professional Trading Education
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 font-display leading-tight"
              >
                NEXURAL <span className="text-primary text-glow">ACADEMY</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Master quantitative trading through our comprehensive curriculum designed by industry professionals.
              </motion.p>

              {/* Quick Stats with Better Spacing */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4 text-primary" />
                  <span>15,000+ Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-primary" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Industry Certified</span>
                </div>
              </motion.div>
            </motion.section>

            {/* Progress Dashboard with Enhanced Spacing */}
            <motion.section
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {progressData.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <div className="relative mb-4">
                          <div className="text-4xl md:text-5xl font-bold font-mono text-primary mb-2">{stat.value}</div>
                          {index === 0 && <TrendingUp className="w-5 h-5 text-green-400 absolute -top-2 -right-6" />}
                        </div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                      <span className="text-sm font-mono text-primary">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3 bg-gray-800" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {completedLessons} of {totalLessons} lessons completed
                      </span>
                      <span>Next milestone at 75%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Search and Filter Section with Better Spacing */}
            <motion.section
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search courses, lessons, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-gray-900/50 border-gray-700 focus:border-primary/50 h-12 text-white"
                  />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3">
                  {courseCategories.map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-gray-700 bg-gray-900/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300 rounded-full px-4 py-2",
                        activeCategory === category && "bg-primary/10 text-primary border-primary/50",
                      )}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Course Modules with Enhanced Spacing */}
            <motion.div
              className="space-y-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <AnimatePresence mode="wait">
                {filteredModules.length > 0 ? (
                  filteredModules.map((module) => (
                    <ModuleSection key={module.id} module={module} onPlayLesson={handleOpenModal} />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Search className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-3">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Special Modules with Enhanced Spacing */}
            <motion.section
              className="mt-24 mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Specialized <span className="text-primary">Training</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Advanced modules designed to give you the competitive edge in professional trading.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {specialModules.map((mod, index) => {
                  const Icon = mod.icon
                  return (
                    <motion.div
                      key={mod.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 + index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <Card className="bg-gradient-to-br from-primary/10 via-gray-900/80 to-gray-800/80 border-primary/20 text-center p-8 h-full flex flex-col group hover:border-primary/40 transition-all duration-300 cursor-pointer">
                        <div className="relative mb-8">
                          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors duration-300">
                            <Icon className="w-10 h-10 text-primary" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-gray-400 mb-8 flex-grow leading-relaxed">{mod.description}</p>

                        <Button
                          variant="outline"
                          className="border-primary/30 text-primary hover:bg-primary/10 group-hover:border-primary/50 bg-transparent"
                        >
                          {mod.cta}
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

            {/* Resources Section with Enhanced Spacing */}
            <motion.section
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Card className="bg-gray-900/60 border-gray-700/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-10">
                  <CardTitle className="text-2xl md:text-3xl text-white mb-4">
                    Learning <span className="text-primary">Resources</span>
                  </CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    Additional tools and communities to accelerate your trading education.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {resources.map((res, index) => {
                      const Icon = res.icon
                      return (
                        <motion.div
                          key={res.name}
                          className="text-center group cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2 + index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <div className="relative mb-6">
                            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                              <Icon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors duration-300" />
                            </div>
                          </div>
                          <h4 className="font-semibold text-white mb-3 group-hover:text-primary transition-colors">
                            {res.name}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed">{res.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        videoId={modalState.videoId}
      />
    </>
  )
}
