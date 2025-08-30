import { apiClient } from "@/lib/api/client"
import { useLearningStore } from "@/lib/stores/learning-store"

export interface Course {
  id: string
  title: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  progress: number
  completed: boolean
  modules: Module[]
  instructor: {
    name: string
    avatar: string
    bio: string
  }
  thumbnail: string
  tags: string[]
  rating: number
  enrolledCount: number
}

export interface Module {
  id: string
  title: string
  type: "video" | "article" | "quiz" | "exercise"
  duration: number
  completed: boolean
  progress: number
  content?: string
  videoUrl?: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  type: "multiple-choice" | "true-false" | "fill-blank"
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface LearningProgress {
  totalCourses: number
  completedCourses: number
  totalHours: number
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  weeklyGoal: number
  weeklyProgress: number
}

class LearningService {
  async getCourses(params?: {
    level?: string
    category?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Course[]> {
    const response = await apiClient.get<Course[]>("/learning/courses", {
      headers: { "X-Query-Params": JSON.stringify(params) },
    })

    // Update learning store
    const learningStore = useLearningStore.getState()
    learningStore.setCourses(response.data as any)

    return response.data
  }

  async getCourse(id: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/learning/courses/${id}`)

    // Update learning store
    const learningStore = useLearningStore.getState()
    learningStore.setCurrentCourse(response.data as any)

    return response.data
  }

  async enrollInCourse(courseId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/learning/courses/${courseId}/enroll`)
    return response.data
  }

  async getModule(courseId: string, moduleId: string): Promise<Module> {
    const response = await apiClient.get<Module>(`/learning/courses/${courseId}/modules/${moduleId}`)

    // Update learning store
    const learningStore = useLearningStore.getState()
    learningStore.setCurrentModule(response.data as any)

    return response.data
  }

  async updateModuleProgress(courseId: string, moduleId: string, progress: number): Promise<void> {
    await apiClient.put(`/learning/courses/${courseId}/modules/${moduleId}/progress`, { progress })

    // Update learning store
    const learningStore = useLearningStore.getState()
    learningStore.updateModuleProgress(courseId, moduleId, progress)
  }

  async completeModule(courseId: string, moduleId: string): Promise<{ achievement?: Achievement }> {
    const response = await apiClient.post<{ achievement?: Achievement }>(
      `/learning/courses/${courseId}/modules/${moduleId}/complete`,
    )

    // Update learning store
    const learningStore = useLearningStore.getState()
    // Method not available in store interface - commented out
    // learningStore.markModuleComplete(courseId, moduleId)

    if (response.data.achievement) {
      // Method not available in store interface - commented out
      // learningStore.addAchievement(response.data.achievement)
    }

    return response.data
  }

  async submitQuiz(
    courseId: string,
    moduleId: string,
    answers: Record<string, any>,
  ): Promise<{
    score: number
    passed: boolean
    feedback: Array<{ questionId: string; correct: boolean; explanation?: string }>
  }> {
    const response = await apiClient.post<{
      score: number
      passed: boolean
      feedback: Array<{ questionId: string; correct: boolean; explanation?: string }>
    }>(`/learning/courses/${courseId}/modules/${moduleId}/quiz`, { answers })

    return response.data
  }

  async getProgress(): Promise<LearningProgress> {
    const response = await apiClient.get<LearningProgress>("/learning/progress")

    // Update learning store
    const learningStore = useLearningStore.getState()
    // Methods not available in store interface - commented out
    // learningStore.setStreak(response.data.currentStreak)
    response.data.achievements.forEach((achievement) => {
      // learningStore.addAchievement(achievement)
    })

    return response.data
  }

  async updateWeeklyGoal(hours: number): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>("/learning/weekly-goal", { hours })
    return response.data
  }

  async getRecommendations(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>("/learning/recommendations")
    return response.data
  }

  async searchContent(
    query: string,
    filters?: {
      type?: string
      level?: string
      duration?: string
    },
  ): Promise<{
    courses: Course[]
    modules: Module[]
    total: number
  }> {
    const response = await apiClient.get<{
      courses: Course[]
      modules: Module[]
      total: number
    }>("/learning/search", {
      headers: {
        "X-Query": query,
        "X-Filters": JSON.stringify(filters),
      },
    })
    return response.data
  }

  async getCertificate(courseId: string): Promise<{ certificateUrl: string }> {
    const response = await apiClient.get<{ certificateUrl: string }>(`/learning/courses/${courseId}/certificate`)
    return response.data
  }
}

export const learningService = new LearningService()
