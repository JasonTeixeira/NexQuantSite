// Real progress tracking system with localStorage persistence
export interface UserProgress {
  userId: string
  email: string
  totalHours: number
  completedModules: string[]
  currentStreak: number
  lastLoginDate: string
  totalPoints: number
  level: number
  achievements: string[]
  moduleProgress: { [moduleId: string]: ModuleProgress }
  pathProgress: { [pathId: string]: PathProgress }
  quizScores: { [quizId: string]: number }
  certificates: string[]
  bookmarks: string[]
  notes: { [moduleId: string]: string[] }
  watchTime: { [videoId: string]: number }
  preferences: UserPreferences
}

export interface ModuleProgress {
  moduleId: string
  progress: number // 0-100
  timeSpent: number // in minutes
  lastAccessed: string
  completed: boolean
  chaptersCompleted: string[]
  quizScore?: number
  certificateEarned: boolean
}

export interface PathProgress {
  pathId: string
  enrolledDate: string
  progress: number // 0-100
  modulesCompleted: string[]
  estimatedCompletion: string
  certificateEarned: boolean
}

export interface UserPreferences {
  playbackSpeed: number
  autoplay: boolean
  subtitles: boolean
  emailNotifications: boolean
  darkMode: boolean
  language: string
}

export class ProgressTracker {
  private static instance: ProgressTracker
  private userProgress: UserProgress | null = null

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker()
    }
    return ProgressTracker.instance
  }

  // Initialize user progress
  initializeUser(email: string): UserProgress {
    const existingProgress = this.loadProgress(email)
    if (existingProgress) {
      this.userProgress = existingProgress
      return existingProgress
    }

    const newProgress: UserProgress = {
      userId: this.generateUserId(),
      email,
      totalHours: 0,
      completedModules: [],
      currentStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalPoints: 0,
      level: 1,
      achievements: [],
      moduleProgress: {},
      pathProgress: {},
      quizScores: {},
      certificates: [],
      bookmarks: [],
      notes: {},
      watchTime: {},
      preferences: {
        playbackSpeed: 1,
        autoplay: true,
        subtitles: false,
        emailNotifications: true,
        darkMode: true,
        language: 'en'
      }
    }

    this.userProgress = newProgress
    this.saveProgress()
    return newProgress
  }

  // Update video watch time
  updateWatchTime(videoId: string, timeWatched: number): void {
    if (!this.userProgress) return

    this.userProgress.watchTime[videoId] = (this.userProgress.watchTime[videoId] || 0) + timeWatched
    this.userProgress.totalHours = Object.values(this.userProgress.watchTime).reduce((sum, time) => sum + time, 0) / 60
    this.saveProgress()
  }

  // Update module progress
  updateModuleProgress(moduleId: string, chapterId: string, progress: number): void {
    if (!this.userProgress) return

    if (!this.userProgress.moduleProgress[moduleId]) {
      this.userProgress.moduleProgress[moduleId] = {
        moduleId,
        progress: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        completed: false,
        chaptersCompleted: [],
        certificateEarned: false
      }
    }

    const moduleProgress = this.userProgress.moduleProgress[moduleId]
    moduleProgress.progress = Math.max(moduleProgress.progress, progress)
    moduleProgress.lastAccessed = new Date().toISOString()

    if (progress >= 100 && !moduleProgress.chaptersCompleted.includes(chapterId)) {
      moduleProgress.chaptersCompleted.push(chapterId)
    }

    // Check if module is completed
    if (moduleProgress.progress >= 100 && !moduleProgress.completed) {
      moduleProgress.completed = true
      this.userProgress.completedModules.push(moduleId)
      this.addPoints(100) // Bonus points for completion
      this.checkAchievements()
    }

    this.saveProgress()
  }

  // Add points and check for level up
  addPoints(points: number): void {
    if (!this.userProgress) return

    this.userProgress.totalPoints += points
    const newLevel = Math.floor(this.userProgress.totalPoints / 500) + 1
    
    if (newLevel > this.userProgress.level) {
      this.userProgress.level = newLevel
      this.unlockAchievement(`level-${newLevel}`)
    }

    this.saveProgress()
  }

  // Unlock achievement
  unlockAchievement(achievementId: string): void {
    if (!this.userProgress || this.userProgress.achievements.includes(achievementId)) return

    this.userProgress.achievements.push(achievementId)
    
    // Award points based on achievement rarity
    const achievementPoints = this.getAchievementPoints(achievementId)
    this.userProgress.totalPoints += achievementPoints

    this.saveProgress()
  }

  // Update streak
  updateStreak(): void {
    if (!this.userProgress) return

    const today = new Date().toDateString()
    const lastLogin = new Date(this.userProgress.lastLoginDate).toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (lastLogin === today) {
      // Already logged in today, no change
      return
    } else if (lastLogin === yesterday) {
      // Consecutive day, increment streak
      this.userProgress.currentStreak += 1
    } else {
      // Streak broken, reset to 1
      this.userProgress.currentStreak = 1
    }

    this.userProgress.lastLoginDate = new Date().toISOString()
    this.checkStreakAchievements()
    this.saveProgress()
  }

  // Check for streak-based achievements
  private checkStreakAchievements(): void {
    if (!this.userProgress) return

    const streak = this.userProgress.currentStreak
    if (streak >= 7 && !this.userProgress.achievements.includes('week-streak')) {
      this.unlockAchievement('week-streak')
    }
    if (streak >= 30 && !this.userProgress.achievements.includes('month-streak')) {
      this.unlockAchievement('month-streak')
    }
    if (streak >= 100 && !this.userProgress.achievements.includes('century-streak')) {
      this.unlockAchievement('century-streak')
    }
  }

  // Check for various achievements
  private checkAchievements(): void {
    if (!this.userProgress) return

    const completedCount = this.userProgress.completedModules.length

    // Module completion achievements
    if (completedCount >= 1 && !this.userProgress.achievements.includes('first-module')) {
      this.unlockAchievement('first-module')
    }
    if (completedCount >= 5 && !this.userProgress.achievements.includes('five-modules')) {
      this.unlockAchievement('five-modules')
    }
    if (completedCount >= 10 && !this.userProgress.achievements.includes('ten-modules')) {
      this.unlockAchievement('ten-modules')
    }

    // Time-based achievements
    if (this.userProgress.totalHours >= 10 && !this.userProgress.achievements.includes('ten-hours')) {
      this.unlockAchievement('ten-hours')
    }
    if (this.userProgress.totalHours >= 50 && !this.userProgress.achievements.includes('fifty-hours')) {
      this.unlockAchievement('fifty-hours')
    }
  }

  // Get achievement points
  private getAchievementPoints(achievementId: string): number {
    const pointsMap: { [key: string]: number } = {
      'first-module': 50,
      'five-modules': 100,
      'ten-modules': 200,
      'week-streak': 75,
      'month-streak': 300,
      'century-streak': 1000,
      'ten-hours': 100,
      'fifty-hours': 500,
    }
    return pointsMap[achievementId] || 25
  }

  // Save progress to localStorage
  private saveProgress(): void {
    if (!this.userProgress) return
    localStorage.setItem(`learning-progress-${this.userProgress.email}`, JSON.stringify(this.userProgress))
  }

  // Load progress from localStorage
  private loadProgress(email: string): UserProgress | null {
    try {
      const saved = localStorage.getItem(`learning-progress-${email}`)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  // Generate unique user ID
  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Get current user progress
  getCurrentProgress(): UserProgress | null {
    return this.userProgress
  }

  // Calculate next level requirements
  getNextLevelInfo(): { currentLevel: number; nextLevel: number; pointsNeeded: number; progress: number } {
    if (!this.userProgress) {
      return { currentLevel: 1, nextLevel: 2, pointsNeeded: 500, progress: 0 }
    }

    const currentLevel = this.userProgress.level
    const nextLevel = currentLevel + 1
    const pointsForNextLevel = nextLevel * 500
    const pointsNeeded = pointsForNextLevel - this.userProgress.totalPoints
    const progress = (this.userProgress.totalPoints % 500) / 500 * 100

    return { currentLevel, nextLevel, pointsNeeded, progress }
  }

  // Get user rank (simulated)
  getUserRank(): { rank: number; totalUsers: number } {
    if (!this.userProgress) return { rank: 0, totalUsers: 50000 }
    
    // Simulate ranking based on points
    const totalUsers = 50000
    const rank = Math.max(1, Math.floor(totalUsers - (this.userProgress.totalPoints / 10)))
    
    return { rank, totalUsers }
  }
}

export const progressTracker = ProgressTracker.getInstance()
