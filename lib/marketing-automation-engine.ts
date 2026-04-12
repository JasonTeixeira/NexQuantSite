export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: "welcome" | "promotional" | "newsletter" | "transactional"
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  name: string
  type: "email" | "sms" | "push" | "social"
  status: "draft" | "scheduled" | "active" | "paused" | "completed"
  templateId: string
  segmentId: string
  scheduledAt?: Date
  metrics: CampaignMetrics
  settings: CampaignSettings
  createdAt: Date
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
  bounced: number
  revenue: number
}

export interface CampaignSettings {
  sendTime: string
  timezone: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  abTestEnabled: boolean
  abTestVariants?: string[]
}

export interface LeadScore {
  userId: string
  score: number
  factors: ScoreFactor[]
  lastUpdated: Date
  tier: "cold" | "warm" | "hot" | "qualified"
}

export interface ScoreFactor {
  factor: string
  weight: number
  value: number
  contribution: number
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria[]
  userCount: number
  createdAt: Date
  updatedAt: Date
}

export interface SegmentCriteria {
  field: string
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in"
  value: any
  logic: "and" | "or"
}

export class MarketingAutomationEngine {
  private campaigns: Campaign[] = []
  private templates: EmailTemplate[] = []
  private segments: CustomerSegment[] = []
  private leadScores: LeadScore[] = []

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Initialize with sample data
    this.templates = [
      {
        id: "1",
        name: "Welcome Email",
        subject: "Welcome to NEXURAL - Get Started Today!",
        content: `
          <h1>Welcome {{firstName}}!</h1>
          <p>Thank you for joining NEXURAL. We're excited to help you succeed in trading.</p>
          <a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Access Your Dashboard
          </a>
        `,
        type: "welcome",
        variables: ["firstName", "dashboardUrl"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        name: "Weekly Market Update",
        subject: "Weekly Market Insights - {{weekOf}}",
        content: `
          <h1>Market Update for {{weekOf}}</h1>
          <p>Here are the key market movements this week:</p>
          <ul>
            <li>{{topGainer}} gained {{topGainerPercent}}%</li>
            <li>{{topLoser}} lost {{topLoserPercent}}%</li>
          </ul>
          <p>Check your portfolio performance in the dashboard.</p>
        `,
        type: "newsletter",
        variables: ["weekOf", "topGainer", "topGainerPercent", "topLoser", "topLoserPercent"],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ]

    this.segments = [
      {
        id: "1",
        name: "High Value Users",
        description: "Users with portfolio value > $10,000",
        criteria: [{ field: "portfolioValue", operator: "greater_than", value: 10000, logic: "and" }],
        userCount: 1250,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        name: "New Users (Last 30 Days)",
        description: "Users who joined in the last 30 days",
        criteria: [
          {
            field: "createdAt",
            operator: "greater_than",
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            logic: "and",
          },
        ],
        userCount: 450,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ]

    this.campaigns = [
      {
        id: "1",
        name: "Q1 Welcome Campaign",
        type: "email",
        status: "active",
        templateId: "1",
        segmentId: "2",
        scheduledAt: new Date("2024-01-01"),
        metrics: {
          sent: 450,
          delivered: 445,
          opened: 267,
          clicked: 89,
          converted: 23,
          unsubscribed: 3,
          bounced: 5,
          revenue: 12500,
        },
        settings: {
          sendTime: "09:00",
          timezone: "UTC",
          frequency: "once",
          abTestEnabled: false,
        },
        createdAt: new Date("2024-01-01"),
      },
    ]

    this.leadScores = this.generateLeadScores()
  }

  private generateLeadScores(): LeadScore[] {
    const scores: LeadScore[] = []
    for (let i = 1; i <= 100; i++) {
      const score = Math.floor(Math.random() * 100)
      scores.push({
        userId: `user_${i}`,
        score,
        factors: [
          { factor: "Email Engagement", weight: 0.3, value: Math.random(), contribution: Math.random() * 30 },
          { factor: "Platform Usage", weight: 0.25, value: Math.random(), contribution: Math.random() * 25 },
          { factor: "Trading Activity", weight: 0.2, value: Math.random(), contribution: Math.random() * 20 },
          { factor: "Profile Completeness", weight: 0.15, value: Math.random(), contribution: Math.random() * 15 },
          { factor: "Social Engagement", weight: 0.1, value: Math.random(), contribution: Math.random() * 10 },
        ],
        lastUpdated: new Date(),
        tier: score > 80 ? "qualified" : score > 60 ? "hot" : score > 40 ? "warm" : "cold",
      })
    }
    return scores
  }

  // Campaign Management
  getCampaigns(): Campaign[] {
    return this.campaigns
  }

  createCampaign(campaign: Omit<Campaign, "id" | "createdAt" | "metrics">): Campaign {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date(),
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        unsubscribed: 0,
        bounced: 0,
        revenue: 0,
      },
    }
    this.campaigns.push(newCampaign)
    return newCampaign
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
    const index = this.campaigns.findIndex((c) => c.id === id)
    if (index === -1) return null

    this.campaigns[index] = { ...this.campaigns[index], ...updates }
    return this.campaigns[index]
  }

  // Template Management
  getTemplates(): EmailTemplate[] {
    return this.templates
  }

  createTemplate(template: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): EmailTemplate {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.templates.push(newTemplate)
    return newTemplate
  }

  // Segment Management
  getSegments(): CustomerSegment[] {
    return this.segments
  }

  createSegment(segment: Omit<CustomerSegment, "id" | "createdAt" | "updatedAt" | "userCount">): CustomerSegment {
    const newSegment: CustomerSegment = {
      ...segment,
      id: Date.now().toString(),
      userCount: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.segments.push(newSegment)
    return newSegment
  }

  // Lead Scoring
  getLeadScores(): LeadScore[] {
    return this.leadScores
  }

  updateLeadScore(userId: string, factors: ScoreFactor[]): LeadScore | null {
    const index = this.leadScores.findIndex((ls) => ls.userId === userId)
    if (index === -1) return null

    const totalScore = factors.reduce((sum, factor) => sum + factor.contribution, 0)
    const tier = totalScore > 80 ? "qualified" : totalScore > 60 ? "hot" : totalScore > 40 ? "warm" : "cold"

    this.leadScores[index] = {
      ...this.leadScores[index],
      score: totalScore,
      factors,
      tier,
      lastUpdated: new Date(),
    }

    return this.leadScores[index]
  }

  // Analytics
  getCampaignAnalytics(campaignId?: string) {
    const campaigns = campaignId ? this.campaigns.filter((c) => c.id === campaignId) : this.campaigns

    const totalMetrics = campaigns.reduce(
      (acc, campaign) => ({
        sent: acc.sent + campaign.metrics.sent,
        delivered: acc.delivered + campaign.metrics.delivered,
        opened: acc.opened + campaign.metrics.opened,
        clicked: acc.clicked + campaign.metrics.clicked,
        converted: acc.converted + campaign.metrics.converted,
        unsubscribed: acc.unsubscribed + campaign.metrics.unsubscribed,
        bounced: acc.bounced + campaign.metrics.bounced,
        revenue: acc.revenue + campaign.metrics.revenue,
      }),
      {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        unsubscribed: 0,
        bounced: 0,
        revenue: 0,
      },
    )

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      metrics: totalMetrics,
      rates: {
        deliveryRate: totalMetrics.sent > 0 ? (totalMetrics.delivered / totalMetrics.sent) * 100 : 0,
        openRate: totalMetrics.delivered > 0 ? (totalMetrics.opened / totalMetrics.delivered) * 100 : 0,
        clickRate: totalMetrics.opened > 0 ? (totalMetrics.clicked / totalMetrics.opened) * 100 : 0,
        conversionRate: totalMetrics.clicked > 0 ? (totalMetrics.converted / totalMetrics.clicked) * 100 : 0,
        unsubscribeRate: totalMetrics.delivered > 0 ? (totalMetrics.unsubscribed / totalMetrics.delivered) * 100 : 0,
      },
    }
  }

  getSegmentAnalytics() {
    return {
      totalSegments: this.segments.length,
      totalUsers: this.segments.reduce((sum, segment) => sum + segment.userCount, 0),
      averageSegmentSize:
        this.segments.length > 0
          ? this.segments.reduce((sum, segment) => sum + segment.userCount, 0) / this.segments.length
          : 0,
      largestSegment: this.segments.reduce(
        (max, segment) => (segment.userCount > max.userCount ? segment : max),
        this.segments[0] || { userCount: 0 },
      ),
      segmentGrowth: this.generateSegmentGrowthData(),
    }
  }

  private generateSegmentGrowthData() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
      users: Math.floor(Math.random() * 500) + 100,
    }))
  }

  getLeadScoringAnalytics() {
    const scoreDistribution = {
      qualified: this.leadScores.filter((ls) => ls.tier === "qualified").length,
      hot: this.leadScores.filter((ls) => ls.tier === "hot").length,
      warm: this.leadScores.filter((ls) => ls.tier === "warm").length,
      cold: this.leadScores.filter((ls) => ls.tier === "cold").length,
    }

    const averageScore = this.leadScores.reduce((sum, ls) => sum + ls.score, 0) / this.leadScores.length

    return {
      totalLeads: this.leadScores.length,
      averageScore: Math.round(averageScore),
      distribution: scoreDistribution,
      topFactors: [
        { factor: "Email Engagement", impact: 85 },
        { factor: "Platform Usage", impact: 78 },
        { factor: "Trading Activity", impact: 72 },
        { factor: "Profile Completeness", impact: 65 },
        { factor: "Social Engagement", impact: 58 },
      ],
    }
  }
}

export const marketingAutomationEngine = new MarketingAutomationEngine()
