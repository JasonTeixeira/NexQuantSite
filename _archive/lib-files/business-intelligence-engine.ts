export interface KPIMetric {
  id: string
  name: string
  description: string
  category: "financial" | "operational" | "customer" | "product" | "marketing"
  value: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  change: number
  changePercent: number
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  lastUpdated: Date
  status: "good" | "warning" | "critical"
  formula?: string
  dataSource: string
}

export interface BusinessInsight {
  id: string
  title: string
  description: string
  type: "opportunity" | "risk" | "trend" | "anomaly" | "recommendation"
  priority: "low" | "medium" | "high" | "critical"
  confidence: number
  impact: "low" | "medium" | "high"
  effort: "low" | "medium" | "high"
  category: string
  metrics: string[]
  actions: string[]
  createdAt: Date
  expiresAt?: Date
  status: "new" | "acknowledged" | "in-progress" | "completed" | "dismissed"
}

export interface Dashboard {
  id: string
  name: string
  description: string
  category: string
  widgets: DashboardWidget[]
  layout: DashboardLayout
  permissions: {
    view: string[]
    edit: string[]
  }
  refreshInterval: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isDefault: boolean
  isPublic: boolean
}

export interface DashboardWidget {
  id: string
  type: "metric" | "chart" | "table" | "gauge" | "map" | "text"
  title: string
  description?: string
  dataSource: string
  configuration: Record<string, any>
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  refreshInterval?: number
  filters?: Record<string, any>
}

export interface DashboardLayout {
  columns: number
  rows: number
  gap: number
  responsive: boolean
}

export interface AnalyticsReport {
  id: string
  name: string
  description: string
  type: "scheduled" | "ad-hoc" | "automated"
  format: "pdf" | "excel" | "csv" | "json"
  schedule?: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly"
    time: string
    timezone: string
    recipients: string[]
  }
  parameters: Record<string, any>
  lastGenerated?: Date
  nextGeneration?: Date
  status: "active" | "paused" | "error"
}

export interface PredictiveModel {
  id: string
  name: string
  description: string
  type: "regression" | "classification" | "clustering" | "forecasting"
  algorithm: string
  features: string[]
  target: string
  accuracy: number
  lastTrained: Date
  nextTraining: Date
  status: "training" | "ready" | "error" | "deprecated"
  predictions: ModelPrediction[]
}

export interface ModelPrediction {
  id: string
  modelId: string
  input: Record<string, any>
  output: Record<string, any>
  confidence: number
  timestamp: Date
  actual?: Record<string, any>
  accuracy?: number
}

export class BusinessIntelligenceEngine {
  private static instance: BusinessIntelligenceEngine
  private kpis: Map<string, KPIMetric> = new Map()
  private insights: Map<string, BusinessInsight> = new Map()
  private dashboards: Map<string, Dashboard> = new Map()
  private reports: Map<string, AnalyticsReport> = new Map()
  private models: Map<string, PredictiveModel> = new Map()

  static getInstance(): BusinessIntelligenceEngine {
    if (!BusinessIntelligenceEngine.instance) {
      BusinessIntelligenceEngine.instance = new BusinessIntelligenceEngine()
    }
    return BusinessIntelligenceEngine.instance
  }

  constructor() {
    this.initializeKPIs()
    this.initializeInsights()
    this.initializeDashboards()
    this.initializeReports()
    this.initializeModels()
  }

  private initializeKPIs() {
    const kpis: KPIMetric[] = [
      {
        id: "total_revenue",
        name: "Total Revenue",
        description: "Total revenue generated across all channels",
        category: "financial",
        value: 2450000,
        target: 2500000,
        unit: "USD",
        trend: "up",
        change: 125000,
        changePercent: 5.4,
        period: "monthly",
        lastUpdated: new Date(),
        status: "good",
        formula: "SUM(orders.amount) WHERE status = 'completed'",
        dataSource: "financial_db",
      },
      {
        id: "customer_acquisition_cost",
        name: "Customer Acquisition Cost",
        description: "Average cost to acquire a new customer",
        category: "marketing",
        value: 85,
        target: 75,
        unit: "USD",
        trend: "down",
        change: -5,
        changePercent: -5.6,
        period: "monthly",
        lastUpdated: new Date(),
        status: "warning",
        formula: "marketing_spend / new_customers",
        dataSource: "marketing_db",
      },
      {
        id: "monthly_active_users",
        name: "Monthly Active Users",
        description: "Number of unique users active in the last 30 days",
        category: "customer",
        value: 45600,
        target: 50000,
        unit: "users",
        trend: "up",
        change: 2800,
        changePercent: 6.5,
        period: "monthly",
        lastUpdated: new Date(),
        status: "good",
        dataSource: "user_analytics",
      },
      {
        id: "churn_rate",
        name: "Customer Churn Rate",
        description: "Percentage of customers who stopped using the service",
        category: "customer",
        value: 3.2,
        target: 2.5,
        unit: "percent",
        trend: "up",
        change: 0.3,
        changePercent: 10.3,
        period: "monthly",
        lastUpdated: new Date(),
        status: "critical",
        dataSource: "user_analytics",
      },
      {
        id: "average_order_value",
        name: "Average Order Value",
        description: "Average value of each transaction",
        category: "financial",
        value: 156.5,
        target: 150.0,
        unit: "USD",
        trend: "up",
        change: 8.5,
        changePercent: 5.7,
        period: "monthly",
        lastUpdated: new Date(),
        status: "good",
        dataSource: "financial_db",
      },
      {
        id: "system_uptime",
        name: "System Uptime",
        description: "Percentage of time the system is operational",
        category: "operational",
        value: 99.8,
        target: 99.9,
        unit: "percent",
        trend: "stable",
        change: 0,
        changePercent: 0,
        period: "monthly",
        lastUpdated: new Date(),
        status: "good",
        dataSource: "monitoring_system",
      },
    ]

    kpis.forEach((kpi) => this.kpis.set(kpi.id, kpi))
  }

  private initializeInsights() {
    const insights: BusinessInsight[] = [
      {
        id: "insight_001",
        title: "Revenue Growth Opportunity",
        description:
          "Premium subscription uptake has increased 45% this quarter, suggesting strong market demand for advanced features",
        type: "opportunity",
        priority: "high",
        confidence: 0.87,
        impact: "high",
        effort: "medium",
        category: "financial",
        metrics: ["total_revenue", "subscription_conversion"],
        actions: ["Expand premium feature set", "Launch targeted marketing campaign", "Optimize pricing strategy"],
        createdAt: new Date(),
        status: "new",
      },
      {
        id: "insight_002",
        title: "Customer Churn Risk Alert",
        description: "Churn rate has increased by 10.3% this month, primarily among users with low engagement scores",
        type: "risk",
        priority: "critical",
        confidence: 0.92,
        impact: "high",
        effort: "high",
        category: "customer",
        metrics: ["churn_rate", "engagement_score"],
        actions: ["Implement retention campaign", "Improve onboarding process", "Enhance customer support"],
        createdAt: new Date(),
        status: "new",
      },
      {
        id: "insight_003",
        title: "Mobile Usage Trend",
        description:
          "Mobile app usage has grown 35% while web usage declined 12%, indicating a shift in user preferences",
        type: "trend",
        priority: "medium",
        confidence: 0.78,
        impact: "medium",
        effort: "low",
        category: "product",
        metrics: ["mobile_sessions", "web_sessions"],
        actions: [
          "Prioritize mobile feature development",
          "Optimize mobile user experience",
          "Consider mobile-first design approach",
        ],
        createdAt: new Date(),
        status: "acknowledged",
      },
    ]

    insights.forEach((insight) => this.insights.set(insight.id, insight))
  }

  private initializeDashboards() {
    const dashboards: Dashboard[] = [
      {
        id: "executive_dashboard",
        name: "Executive Dashboard",
        description: "High-level KPIs and business metrics for executive team",
        category: "executive",
        widgets: [
          {
            id: "revenue_widget",
            type: "metric",
            title: "Total Revenue",
            dataSource: "financial_db",
            configuration: { metric: "total_revenue", format: "currency" },
            position: { x: 0, y: 0, width: 3, height: 2 },
          },
          {
            id: "users_widget",
            type: "metric",
            title: "Active Users",
            dataSource: "user_analytics",
            configuration: { metric: "monthly_active_users", format: "number" },
            position: { x: 3, y: 0, width: 3, height: 2 },
          },
          {
            id: "revenue_chart",
            type: "chart",
            title: "Revenue Trend",
            dataSource: "financial_db",
            configuration: {
              chartType: "line",
              timeRange: "6m",
              metrics: ["total_revenue", "recurring_revenue"],
            },
            position: { x: 0, y: 2, width: 6, height: 4 },
          },
        ],
        layout: { columns: 12, rows: 8, gap: 16, responsive: true },
        permissions: { view: ["executive", "admin"], edit: ["admin"] },
        refreshInterval: 300000,
        createdBy: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
        isPublic: false,
      },
    ]

    dashboards.forEach((dashboard) => this.dashboards.set(dashboard.id, dashboard))
  }

  private initializeReports() {
    const reports: AnalyticsReport[] = [
      {
        id: "monthly_financial",
        name: "Monthly Financial Report",
        description: "Comprehensive monthly financial performance report",
        type: "scheduled",
        format: "pdf",
        schedule: {
          frequency: "monthly",
          time: "09:00",
          timezone: "UTC",
          recipients: ["cfo@nexural.com", "ceo@nexural.com"],
        },
        parameters: { includeForecasts: true, detailLevel: "high" },
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextGeneration: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        id: "user_engagement",
        name: "User Engagement Analysis",
        description: "Weekly analysis of user engagement patterns and trends",
        type: "scheduled",
        format: "excel",
        schedule: {
          frequency: "weekly",
          time: "08:00",
          timezone: "UTC",
          recipients: ["product@nexural.com", "marketing@nexural.com"],
        },
        parameters: { segmentByPlan: true, includeChurnAnalysis: true },
        lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextGeneration: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    ]

    reports.forEach((report) => this.reports.set(report.id, report))
  }

  private initializeModels() {
    const models: PredictiveModel[] = [
      {
        id: "churn_prediction",
        name: "Customer Churn Prediction",
        description: "Predicts likelihood of customer churn based on usage patterns",
        type: "classification",
        algorithm: "Random Forest",
        features: ["session_frequency", "feature_usage", "support_tickets", "payment_history"],
        target: "will_churn",
        accuracy: 0.87,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "ready",
        predictions: [],
      },
      {
        id: "revenue_forecast",
        name: "Revenue Forecasting",
        description: "Forecasts monthly revenue based on historical data and trends",
        type: "forecasting",
        algorithm: "ARIMA",
        features: ["historical_revenue", "user_growth", "market_trends", "seasonality"],
        target: "monthly_revenue",
        accuracy: 0.92,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextTraining: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: "ready",
        predictions: [],
      },
    ]

    models.forEach((model) => this.models.set(model.id, model))
  }

  async getKPIs(category?: string): Promise<KPIMetric[]> {
    let kpis = Array.from(this.kpis.values())

    if (category) {
      kpis = kpis.filter((kpi) => kpi.category === category)
    }

    return kpis.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
  }

  async getInsights(type?: string, priority?: string): Promise<BusinessInsight[]> {
    let insights = Array.from(this.insights.values())

    if (type) {
      insights = insights.filter((insight) => insight.type === type)
    }

    if (priority) {
      insights = insights.filter((insight) => insight.priority === priority)
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values())
  }

  async getReports(): Promise<AnalyticsReport[]> {
    return Array.from(this.reports.values())
  }

  async getModels(): Promise<PredictiveModel[]> {
    return Array.from(this.models.values())
  }

  async generatePrediction(modelId: string, input: Record<string, any>): Promise<ModelPrediction> {
    const model = this.models.get(modelId)
    if (!model || model.status !== "ready") {
      throw new Error("Model not available for predictions")
    }

    const prediction: ModelPrediction = {
      id: `pred_${Date.now()}`,
      modelId,
      input,
      output: this.simulatePrediction(model, input),
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      timestamp: new Date(),
    }

    model.predictions.push(prediction)
    return prediction
  }

  private simulatePrediction(model: PredictiveModel, input: Record<string, any>): Record<string, any> {
    switch (model.type) {
      case "classification":
        return {
          prediction: Math.random() > 0.5 ? "positive" : "negative",
          probability: Math.random(),
        }
      case "forecasting":
        return {
          forecast: Math.random() * 1000000 + 2000000, // Revenue forecast
          confidence_interval: [1800000, 2800000],
        }
      case "regression":
        return {
          value: Math.random() * 100 + 50,
        }
      default:
        return { result: "unknown" }
    }
  }

  async createCustomReport(reportConfig: Omit<AnalyticsReport, "id">): Promise<string> {
    const id = `report_${Date.now()}`
    const report: AnalyticsReport = {
      ...reportConfig,
      id,
    }

    this.reports.set(id, report)
    return id
  }

  async updateKPI(id: string, value: number): Promise<KPIMetric> {
    const kpi = this.kpis.get(id)
    if (!kpi) {
      throw new Error("KPI not found")
    }

    const previousValue = kpi.value
    const change = value - previousValue
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0

    const updatedKPI: KPIMetric = {
      ...kpi,
      value,
      change,
      changePercent,
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      lastUpdated: new Date(),
      status: this.calculateKPIStatus(value, kpi.target),
    }

    this.kpis.set(id, updatedKPI)
    return updatedKPI
  }

  private calculateKPIStatus(value: number, target: number): "good" | "warning" | "critical" {
    const ratio = value / target
    if (ratio >= 0.9) return "good"
    if (ratio >= 0.7) return "warning"
    return "critical"
  }

  async getExecutiveSummary(): Promise<{
    overview: {
      totalRevenue: number
      totalUsers: number
      growthRate: number
      profitMargin: number
    }
    keyMetrics: KPIMetric[]
    criticalInsights: BusinessInsight[]
    topRisks: BusinessInsight[]
    opportunities: BusinessInsight[]
    predictions: {
      revenueNext30Days: number
      userGrowthNext30Days: number
      churnRiskUsers: number
    }
  }> {
    const kpis = await this.getKPIs()
    const insights = await this.getInsights()

    const overview = {
      totalRevenue: kpis.find((k) => k.name === "Total Revenue")?.value || 0,
      totalUsers: kpis.find((k) => k.name === "Monthly Active Users")?.value || 0,
      growthRate: kpis.find((k) => k.name === "Growth Rate")?.value || 0,
      profitMargin: kpis.find((k) => k.name === "Profit Margin")?.value || 0,
    }

    const keyMetrics = kpis
      .filter((k) =>
        ["Total Revenue", "Monthly Active Users", "Customer Churn Rate", "Average Order Value"].includes(k.name),
      )
      .slice(0, 6)

    const criticalInsights = insights.filter((i) => i.priority === "critical" && i.status === "new").slice(0, 3)
    const topRisks = insights.filter((i) => i.type === "risk" && i.priority === "high").slice(0, 3)
    const opportunities = insights.filter((i) => i.type === "opportunity").slice(0, 3)

    // Generate predictions using models
    const predictions = {
      revenueNext30Days: overview.totalRevenue * 1.05,
      userGrowthNext30Days: overview.totalUsers * 0.08,
      churnRiskUsers: overview.totalUsers * 0.03,
    }

    return {
      overview,
      keyMetrics,
      criticalInsights,
      topRisks,
      opportunities,
      predictions,
    }
  }
}

export const biEngine = BusinessIntelligenceEngine.getInstance()
