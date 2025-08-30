interface LifecycleStage {
  id: string
  name: string
  description: string
  criteria: LifecycleCriteria[]
  triggers: LifecycleTrigger[]
  actions: LifecycleAction[]
  duration?: number // in days
  exitConditions: LifecycleCriteria[]
}

interface LifecycleCriteria {
  id: string
  field: string
  operator: "equals" | "greater_than" | "less_than" | "contains" | "between"
  value: any
  weight?: number
}

interface LifecycleTrigger {
  id: string
  type: "time_based" | "event_based" | "behavior_based" | "condition_based"
  condition: string
  delay?: number
  isActive: boolean
}

interface LifecycleAction {
  id: string
  type: "email" | "sms" | "push" | "in_app" | "webhook" | "tag" | "segment_move"
  template?: string
  content?: string
  delay?: number
  conditions?: LifecycleCriteria[]
}

interface UserJourney {
  userId: string
  currentStage: string
  stageHistory: {
    stage: string
    enteredAt: Date
    exitedAt?: Date
    completedActions: string[]
  }[]
  nextActions: {
    actionId: string
    scheduledFor: Date
    status: "pending" | "completed" | "failed"
  }[]
  metrics: {
    totalEngagementScore: number
    conversionProbability: number
    churnRisk: number
    lifetimeValue: number
  }
}

export class UserLifecycleAutomation {
  private stages: Map<string, LifecycleStage> = new Map()
  private userJourneys: Map<string, UserJourney> = new Map()

  constructor() {
    this.initializeDefaultStages()
  }

  private initializeDefaultStages() {
    // Onboarding Stage
    this.stages.set("onboarding", {
      id: "onboarding",
      name: "New User Onboarding",
      description: "Welcome and educate new users",
      criteria: [
        {
          id: "c1",
          field: "registration_date",
          operator: "greater_than",
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      ],
      triggers: [
        {
          id: "t1",
          type: "event_based",
          condition: "user_registered",
          isActive: true,
        },
      ],
      actions: [
        {
          id: "a1",
          type: "email",
          template: "welcome_email",
          delay: 0,
        },
        {
          id: "a2",
          type: "email",
          template: "onboarding_guide",
          delay: 24 * 60, // 24 hours
        },
        {
          id: "a3",
          type: "in_app",
          content: "Complete your profile setup",
          delay: 48 * 60, // 48 hours
        },
      ],
      duration: 7,
      exitConditions: [
        {
          id: "ec1",
          field: "profile_completed",
          operator: "equals",
          value: true,
        },
      ],
    })

    // Activation Stage
    this.stages.set("activation", {
      id: "activation",
      name: "User Activation",
      description: "Guide users to first value experience",
      criteria: [
        {
          id: "c2",
          field: "profile_completed",
          operator: "equals",
          value: true,
        },
        {
          id: "c3",
          field: "first_trade",
          operator: "equals",
          value: false,
        },
      ],
      triggers: [
        {
          id: "t2",
          type: "condition_based",
          condition: "profile_completed_and_no_trades",
          isActive: true,
        },
      ],
      actions: [
        {
          id: "a4",
          type: "email",
          template: "first_trade_guide",
          delay: 0,
        },
        {
          id: "a5",
          type: "push",
          content: "Ready to make your first trade?",
          delay: 12 * 60,
        },
      ],
      duration: 14,
      exitConditions: [
        {
          id: "ec2",
          field: "trades_count",
          operator: "greater_than",
          value: 0,
        },
      ],
    })

    // Engagement Stage
    this.stages.set("engaged", {
      id: "engaged",
      name: "Active User",
      description: "Maintain engagement and encourage growth",
      criteria: [
        {
          id: "c4",
          field: "trades_count",
          operator: "greater_than",
          value: 0,
        },
        {
          id: "c5",
          field: "last_login",
          operator: "greater_than",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
      triggers: [
        {
          id: "t3",
          type: "behavior_based",
          condition: "regular_activity",
          isActive: true,
        },
      ],
      actions: [
        {
          id: "a6",
          type: "email",
          template: "weekly_market_insights",
          delay: 0,
        },
        {
          id: "a7",
          type: "in_app",
          content: "New trading opportunities available",
          delay: 24 * 60,
        },
      ],
      exitConditions: [
        {
          id: "ec3",
          field: "last_login",
          operator: "less_than",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
    })

    // At-Risk Stage
    this.stages.set("at_risk", {
      id: "at_risk",
      name: "At-Risk User",
      description: "Re-engage users showing signs of churn",
      criteria: [
        {
          id: "c6",
          field: "last_login",
          operator: "less_than",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "c7",
          field: "last_login",
          operator: "greater_than",
          value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      ],
      triggers: [
        {
          id: "t4",
          type: "time_based",
          condition: "inactive_30_days",
          isActive: true,
        },
      ],
      actions: [
        {
          id: "a8",
          type: "email",
          template: "we_miss_you",
          delay: 0,
        },
        {
          id: "a9",
          type: "email",
          template: "special_offer",
          delay: 3 * 24 * 60, // 3 days
        },
      ],
      duration: 30,
      exitConditions: [
        {
          id: "ec4",
          field: "last_login",
          operator: "greater_than",
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
    })

    // Churned Stage
    this.stages.set("churned", {
      id: "churned",
      name: "Churned User",
      description: "Users who have stopped using the platform",
      criteria: [
        {
          id: "c8",
          field: "last_login",
          operator: "less_than",
          value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      ],
      triggers: [
        {
          id: "t5",
          type: "time_based",
          condition: "inactive_90_days",
          isActive: true,
        },
      ],
      actions: [
        {
          id: "a10",
          type: "email",
          template: "final_goodbye",
          delay: 0,
        },
      ],
      exitConditions: [
        {
          id: "ec5",
          field: "last_login",
          operator: "greater_than",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
    })
  }

  calculateEngagementScore(userId: string): number {
    // Mock calculation - in real implementation, this would analyze user behavior
    const mockFactors = {
      loginFrequency: Math.random() * 40,
      tradeFrequency: Math.random() * 30,
      platformUsage: Math.random() * 20,
      communityEngagement: Math.random() * 10,
    }

    return Object.values(mockFactors).reduce((sum, score) => sum + score, 0)
  }

  calculateChurnRisk(userId: string): number {
    // Mock calculation based on various risk factors
    const engagementScore = this.calculateEngagementScore(userId)
    const baseRisk = Math.max(0, 100 - engagementScore)

    // Add additional risk factors
    const riskFactors = {
      inactivityDays: Math.random() * 30,
      supportTickets: Math.random() * 10,
      paymentIssues: Math.random() * 20,
    }

    const additionalRisk = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / 3
    return Math.min(100, baseRisk + additionalRisk)
  }

  getLifecycleStages(): LifecycleStage[] {
    return Array.from(this.stages.values())
  }

  getUserJourney(userId: string): UserJourney | undefined {
    return this.userJourneys.get(userId)
  }

  updateUserStage(userId: string, newStage: string): void {
    const journey = this.userJourneys.get(userId)
    if (journey) {
      // Complete current stage
      const currentHistory = journey.stageHistory.find((h) => h.stage === journey.currentStage && !h.exitedAt)
      if (currentHistory) {
        currentHistory.exitedAt = new Date()
      }

      // Start new stage
      journey.currentStage = newStage
      journey.stageHistory.push({
        stage: newStage,
        enteredAt: new Date(),
        completedActions: [],
      })

      // Update metrics
      journey.metrics = {
        totalEngagementScore: this.calculateEngagementScore(userId),
        conversionProbability: Math.random() * 100,
        churnRisk: this.calculateChurnRisk(userId),
        lifetimeValue: Math.random() * 5000,
      }
    }
  }

  processAutomationRules(): void {
    // This would run periodically to process all automation rules
    console.log("Processing lifecycle automation rules...")
  }
}

export const userLifecycleAutomation = new UserLifecycleAutomation()
