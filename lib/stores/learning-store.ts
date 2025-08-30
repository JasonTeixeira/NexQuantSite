import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: string
  duration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  modules: Module[]
  progress: number
  isEnrolled: boolean
  completedAt?: string
  rating: number
  reviewCount: number
  price: number
  isPremium: boolean
}

export interface Module {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "exercise"
  duration: number
  content: string
  videoUrl?: string
  isCompleted: boolean
  completedAt?: string
  quiz?: Quiz
}

export interface Quiz {
  id: string
  questions: Question[]
  passingScore: number
  attempts: QuizAttempt[]
  maxAttempts: number
}

export interface Question {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "fill_blank"
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
}

export interface QuizAttempt {
  id: string
  score: number
  answers: Record<string, string>
  completedAt: string
  passed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: string
  progress: number
  maxProgress: number
}

export interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  estimatedDuration: number
  difficulty: "beginner" | "intermediate" | "advanced"
  progress: number
  isEnrolled: boolean
}

interface LearningState {
  courses: Course[]
  enrolledCourses: string[]
  currentCourse: Course | null
  currentModule: Module | null
  achievements: Achievement[]
  learningPaths: LearningPath[]
  progress: {
    totalCoursesCompleted: number
    totalHoursLearned: number
    currentStreak: number
    longestStreak: number
  }
  isLoading: boolean
  error: string | null
}

interface LearningActions {
  setCourses: (courses: Course[]) => void
  enrollInCourse: (courseId: string) => void
  setCurrentCourse: (course: Course | null) => void
  setCurrentModule: (module: Module | null) => void
  completeModule: (courseId: string, moduleId: string) => void
  updateModuleProgress: (courseId: string, moduleId: string, progress: number) => void
  submitQuizAttempt: (moduleId: string, attempt: QuizAttempt) => void
  unlockAchievement: (achievement: Achievement) => void
  setLearningPaths: (paths: LearningPath[]) => void
  enrollInLearningPath: (pathId: string) => void
  updateProgress: (progress: Partial<LearningState["progress"]>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    (set, get) => ({
      // State
      courses: [],
      enrolledCourses: [],
      currentCourse: null,
      currentModule: null,
      achievements: [],
      learningPaths: [],
      progress: {
        totalCoursesCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      isLoading: false,
      error: null,

      // Actions
      setCourses: (courses) => set({ courses }),

      enrollInCourse: (courseId) =>
        set((state) => ({
          enrolledCourses: state.enrolledCourses.includes(courseId)
            ? state.enrolledCourses
            : [...state.enrolledCourses, courseId],
          courses: state.courses.map((course) => (course.id === courseId ? { ...course, isEnrolled: true } : course)),
        })),

      setCurrentCourse: (currentCourse) => set({ currentCourse }),
      setCurrentModule: (currentModule) => set({ currentModule }),

      completeModule: (courseId, moduleId) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((module) =>
                    module.id === moduleId
                      ? { ...module, isCompleted: true, completedAt: new Date().toISOString() }
                      : module,
                  ),
                }
              : course,
          ),
        })),

      updateModuleProgress: (courseId, moduleId, progress) => {
        // Implementation for tracking module progress
      },

      submitQuizAttempt: (moduleId, attempt) => {
        // Implementation for quiz attempts
      },

      unlockAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, { ...achievement, unlockedAt: new Date().toISOString() }],
        })),

      setLearningPaths: (learningPaths) => set({ learningPaths }),

      enrollInLearningPath: (pathId) =>
        set((state) => ({
          learningPaths: state.learningPaths.map((path) => (path.id === pathId ? { ...path, isEnrolled: true } : path)),
        })),

      updateProgress: (progress) =>
        set((state) => ({
          progress: { ...state.progress, ...progress },
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "learning-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enrolledCourses: state.enrolledCourses,
        achievements: state.achievements,
        progress: state.progress,
      }),
    },
  ),
)
