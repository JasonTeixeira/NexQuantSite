export interface BusinessMetric {
  id: string
  name: string
  description: string
  category: "financial" | "operational" | "customer" | "product" | "marketing" | "sales"
  type: "counter" | "gauge" | "histogram" | "rate" | "percentage"

  // Current Value
  currentValue: number
  previousValue: number
  change: number
  changePercentage: number
  trend: "up" | "down" | "stable"

  // Targets & Thresholds
  target?: number
  targetType?: "minimum" | "maximum" | "exact"
  thresholds: {
    critical: { min?: number; max?: number }
    warning: { min?: number; max?: number }
    good: { min?: number; max?: number }
  }

  // Metadata
  unit: string
  format: "number" | "currency" | "percentage" | "duration" | "bytes"
  precision: number

  // Time Series Data
  historicalData: {
    timestamp: Date
    value: number
    metadata?: Record<string, any>
  }[]

  // Data Source
  dataSource: {
    system: string
    query: string
    refreshInterval: number // seconds
    lastUpdated: Date
  }

  // Visualization
  visualization: {
    chartType: "line" | "bar" | "area" | "gauge" | "number" | "table"
    color: string
    showTrend: boolean
    showTarget: boolean
    aggregation: "sum" | "avg" | "min" | "max" | "count"
  }

  // Alerts
  alerting: {
    enabled: boolean
    conditions: AlertCondition[]
    recipients: string[]
    cooldownPeriod: number // minutes
  }

  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface AlertCondition {
  id: string
  name: string
  condition: "greater_than" | "less_than" | "equals" | "not_equals" | "change_by"
  value: number
  duration: number // minutes - how long condition must persist
  severity: "info" | "warning" | "critical"
  message: string
  enabled: boolean
}

export interface PredictiveModel {
  id: string
  name: string
  description: string
  type: "linear_regression" | "polynomial" | "arima" | "lstm" | "prophet" | "ensemble"
  status: "training" | "ready" | "error" | "deprecated"

  // Model Configuration
  targetMetric: string
  features: string[]
  trainingPeriod: {
    start: Date
    end: Date
  }
  predictionHorizon: number // days

  // Model Performance
  performance: {
    accuracy: number
    mape: number // Mean Absolute Percentage Error
    rmse: number // Root Mean Square Error
    r2Score: number
    lastEvaluated: Date
  }

  // Predictions
  predictions: {
    timestamp: Date
    predictedValue: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    confidence: number
    factors: {
      feature: string
      importance: number
      impact: number
    }[]
  }[]

  // Model Metadata
  hyperparameters: Record<string, any>
  trainingData: {
    recordCount: number
    features: string[]
    dataQuality: number
  }

  // Lifecycle
  version: string
  trainingHistory: {
    version: string
    trainedAt: Date
    performance: Record<string, number>
    notes: string
  }[]

  createdAt: Date
  updatedAt: Date
  lastTrainedAt: Date
  nextTrainingAt: Date
}

export interface CustomReport {
  id: string
  name: string
  description: string
  category: string
  type: "dashboard" | "scheduled" | "ad-hoc" | "alert"

  // Report Configuration
  metrics: string[]
  filters: ReportFilter[]
  groupBy: string[]
  sortBy: {
    field: string
    direction: "asc" | "desc"
  }[]

  // Time Configuration
  timeRange: {
    type: "relative" | "absolute" | "rolling"
    start?: Date
    end?: Date
    period?: "1h" | "24h" | "7d" | "30d" | "90d" | "1y"
    rollingWindow?: number // days
  }

  // Visualization
  layout: {
    type: "grid" | "list" | "single"
    columns: number
    widgets: ReportWidget[]
  }

  // Scheduling (for scheduled reports)
  schedule?: {
    enabled: boolean
    frequency: "hourly" | "daily" | "weekly" | "monthly"
    time: string // HH:MM
    timezone: string
    recipients: string[]
    format: "pdf" | "excel" | "csv" | "json"
  }

  // Access Control
  visibility: "private" | "team" | "organization" | "public"
  permissions: {
    userId: string
    role: "viewer" | "editor" | "owner"
  }[]

  // Usage Analytics
  usage: {
    viewCount: number
    lastViewed: Date
    averageViewDuration: number
    popularFilters: Record<string, number>
  }

  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
}

export interface ReportFilter {
  id: string
  field: string
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in" | "between"
  value: any
  values?: any[] // for 'in' operator
  enabled: boolean
}

export interface ReportWidget {
  id: string
  type: "metric" | "chart" | "table" | "text" | "image"
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  configuration: Record<string, any>
  dataSource?: string
  refreshInterval?: number
}

export interface BusinessInsight {
  id: string
  title: string
  description: string
  type: "anomaly" | "trend" | "correlation" | "forecast" | "recommendation"
  category: string

  // Insight Details
  severity: "info" | "low" | "medium" | "high" | "critical"
  confidence: number // 0-1
  impact: {
    financial: number // estimated dollar impact
    operational: "low" | "medium" | "high"
    strategic: "low" | "medium" | "high"
  }

  // Supporting Data
  metrics: string[]
  evidence: {
    type: "chart" | "table" | "statistic"
    data: any
    description: string
  }[]

  // Recommendations
  recommendations: {
    id: string
    title: string
    description: string
    priority: "low" | "medium" | "high"
    effort: "low" | "medium" | "high"
    expectedImpact: string
    actionItems: string[]
    owner?: string
    dueDate?: Date
  }[]

  // Lifecycle
  status: "new" | "acknowledged" | "in-progress" | "resolved" | "dismissed"
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolvedAt?: Date

  // Auto-generation
  generatedBy: "system" | "user" | "model"
  generationRules?: string[]

  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: "executive" | "operational" | "financial" | "marketing" | "sales" | "product"
  industry?: string

  // Template Configuration
  widgets: ReportWidget[]
  layout: {
    type: "grid" | "masonry" | "fixed"
    columns: number
    gap: number
    responsive: boolean
  }

  // Default Settings
  defaultTimeRange: string
  defaultFilters: ReportFilter[]
  refreshInterval: number

  // Customization
  customizable: boolean
  requiredMetrics: string[]
  optionalMetrics: string[]

  // Usage & Ratings
  usage: {
    installCount: number
    rating: number
    reviews: {
      userId: string
      rating: number
      comment: string
      createdAt: Date
    }[]
  }

  // Metadata
  tags: string[]
  version: string
  author: string

  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export class BusinessIntelligenceDashboard {
  private static instance: BusinessIntelligenceDashboard
  private metrics: Map<string, BusinessMetric> = new Map()
  private models: Map<string, PredictiveModel> = new Map()
  private reports: Map<string, CustomReport> = new Map()
  private insights: Map<string, BusinessInsight> = new Map()
  private templates: Map<string, DashboardTemplate> = new Map()
  private isAnalyzing = false

  static getInstance(): BusinessIntelligenceDashboard {
    if (!BusinessIntelligenceDashboard.instance) {
      BusinessIntelligenceDashboard.instance = new BusinessIntelligenceDashboard()
    }
    return BusinessIntelligenceDashboard.instance
  }

  async createMetric(metricData: Partial<BusinessMetric>): Promise<BusinessMetric> {
    const metric: BusinessMetric = {
      id: `metric-${Date.now()}`,
      name: metricData.name || "Unnamed Metric",
      description: metricData.description || "",
      category: metricData.category || "operational",
      type: metricData.type || "gauge",

      currentValue: metricData.currentValue || 0,
      previousValue: metricData.previousValue || 0,
      change: (metricData.currentValue || 0) - (metricData.previousValue || 0),
      changePercentage: metricData.previousValue
        ? (((metricData.currentValue || 0) - (metricData.previousValue || 0)) / (metricData.previousValue || 1)) * 100
        : 0,
      trend: this.calculateTrend(metricData.currentValue || 0, metricData.previousValue || 0),

      target: metricData.target,
      targetType: metricData.targetType,
      thresholds: metricData.thresholds || {
        critical: {},
        warning: {},
        good: {},
      },

      unit: metricData.unit || "",
      format: metricData.format || "number",
      precision: metricData.precision || 2,

      historicalData: metricData.historicalData || [],

      dataSource: metricData.dataSource || {
        system: "manual",
        query: "",
        refreshInterval: 300,
        lastUpdated: new Date(),
      },

      visualization: metricData.visualization || {
        chartType: "number",
        color: "#3B82F6",
        showTrend: true,
        showTarget: true,
        aggregation: "avg",
      },

      alerting: metricData.alerting || {
        enabled: false,
        conditions: [],
        recipients: [],
        cooldownPeriod: 60,
      },

      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
    }

    this.metrics.set(metric.id, metric)
    return metric
  }

  async updateMetric(metricId: string, value: number, metadata?: Record<string, any>): Promise<BusinessMetric> {
    const metric = this.metrics.get(metricId)
    if (!metric) {
      throw new Error("Metric not found")
    }

    // Update values
    metric.previousValue = metric.currentValue
    metric.currentValue = value
    metric.change = value - metric.previousValue
    metric.changePercentage = metric.previousValue !== 0 ? (metric.change / metric.previousValue) * 100 : 0
    metric.trend = this.calculateTrend(value, metric.previousValue)

    // Add to historical data
    metric.historicalData.push({
      timestamp: new Date(),
      value,
      metadata,
    })

    // Keep only last 1000 data points
    if (metric.historicalData.length > 1000) {
      metric.historicalData = metric.historicalData.slice(-1000)
    }

    // Update metadata
    metric.dataSource.lastUpdated = new Date()
    metric.updatedAt = new Date()

    // Check alert conditions
    await this.checkAlertConditions(metric)

    this.metrics.set(metricId, metric)
    return metric
  }

  async createPredictiveModel(modelData: Partial<PredictiveModel>): Promise<PredictiveModel> {
    const model: PredictiveModel = {
      id: `model-${Date.now()}`,
      name: modelData.name || "Unnamed Model",
      description: modelData.description || "",
      type: modelData.type || "linear_regression",
      status: "training",

      targetMetric: modelData.targetMetric || "",
      features: modelData.features || [],
      trainingPeriod: modelData.trainingPeriod || {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        end: new Date(),
      },
      predictionHorizon: modelData.predictionHorizon || 30,

      performance: {
        accuracy: 0,
        mape: 0,
        rmse: 0,
        r2Score: 0,
        lastEvaluated: new Date(),
      },

      predictions: [],

      hyperparameters: modelData.hyperparameters || {},
      trainingData: {
        recordCount: 0,
        features: modelData.features || [],
        dataQuality: 0,
      },

      version: "1.0",
      trainingHistory: [],

      createdAt: new Date(),
      updatedAt: new Date(),
      lastTrainedAt: new Date(),
      nextTrainingAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    this.models.set(model.id, model)

    // Start training process
    await this.trainModel(model.id)

    return model
  }

  async trainModel(modelId: string): Promise<PredictiveModel> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error("Model not found")
    }

    model.status = "training"
    model.lastTrainedAt = new Date()

    try {
      // Simulate training process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock performance metrics
      model.performance = {
        accuracy: Math.random() * 0.3 + 0.7, // 70-100%
        mape: Math.random() * 15 + 5, // 5-20%
        rmse: Math.random() * 10 + 2, // 2-12
        r2Score: Math.random() * 0.3 + 0.7, // 0.7-1.0
        lastEvaluated: new Date(),
      }

      // Generate predictions
      model.predictions = this.generatePredictions(model)

      // Update training history
      model.trainingHistory.push({
        version: model.version,
        trainedAt: new Date(),
        performance: {
          accuracy: model.performance.accuracy,
          mape: model.performance.mape,
          rmse: model.performance.rmse,
          r2Score: model.performance.r2Score,
        },
        notes: "Automated training completed successfully",
      })

      model.status = "ready"
      model.nextTrainingAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } catch (error) {
      model.status = "error"
      console.error("Model training failed:", error)
    }

    model.updatedAt = new Date()
    this.models.set(modelId, model)
    return model
  }

  async createCustomReport(reportData: Partial<CustomReport>): Promise<CustomReport> {
    const report: CustomReport = {
      id: `report-${Date.now()}`,
      name: reportData.name || "Unnamed Report",
      description: reportData.description || "",
      category: reportData.category || "general",
      type: reportData.type || "dashboard",

      metrics: reportData.metrics || [],
      filters: reportData.filters || [],
      groupBy: reportData.groupBy || [],
      sortBy: reportData.sortBy || [],

      timeRange: reportData.timeRange || {
        type: "relative",
        period: "30d",
      },

      layout: reportData.layout || {
        type: "grid",
        columns: 2,
        widgets: [],
      },

      schedule: reportData.schedule,

      visibility: reportData.visibility || "private",
      permissions: reportData.permissions || [],

      usage: {
        viewCount: 0,
        lastViewed: new Date(),
        averageViewDuration: 0,
        popularFilters: {},
      },

      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      lastModifiedBy: "system",
    }

    this.reports.set(report.id, report)
    return report
  }

  async generateInsights(): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []
    const metrics = Array.from(this.metrics.values())

    // Anomaly Detection
    for (const metric of metrics) {
      if (this.isAnomalous(metric)) {
        insights.push(await this.createAnomalyInsight(metric))
      }
    }

    // Trend Analysis
    const trendInsights = await this.analyzeTrends(metrics)
    insights.push(...trendInsights)

    // Correlation Analysis
    const correlationInsights = await this.analyzeCorrelations(metrics)
    insights.push(...correlationInsights)

    // Forecast Insights
    const forecastInsights = await this.generateForecastInsights()
    insights.push(...forecastInsights)

    // Store insights
    for (const insight of insights) {
      this.insights.set(insight.id, insight)
    }

    return insights
  }

  async getDashboardData(reportId?: string): Promise<{
    metrics: BusinessMetric[]
    insights: BusinessInsight[]
    predictions: any[]
    alerts: any[]
    performance: {
      dataFreshness: number
      queryPerformance: number
      systemHealth: number
    }
  }> {
    const metrics = Array.from(this.metrics.values())
    const insights = Array.from(this.insights.values())
      .filter((i) => i.status === "new" || i.status === "acknowledged")
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)

    const predictions = Array.from(this.models.values())
      .filter((m) => m.status === "ready")
      .flatMap((m) => m.predictions.slice(0, 5))

    const alerts = this.generateActiveAlerts(metrics)

    return {
      metrics: reportId ? this.filterMetricsForReport(metrics, reportId) : metrics,
      insights,
      predictions,
      alerts,
      performance: {
        dataFreshness: this.calculateDataFreshness(metrics),
        queryPerformance: Math.random() * 500 + 100, // 100-600ms
        systemHealth: Math.random() * 20 + 80, // 80-100%
      },
    }
  }

  async startAnalysis(): Promise<void> {
    if (this.isAnalyzing) return

    this.isAnalyzing = true

    // Continuous analysis loop
    setInterval(async () => {
      await this.refreshMetrics()
      await this.generateInsights()
      await this.updatePredictions()
      await this.checkDataQuality()
    }, 60000) // Every minute
  }

  private calculateTrend(current: number, previous: number): "up" | "down" | "stable" {
    const change = current - previous
    const threshold = Math.abs(previous) * 0.05 // 5% threshold

    if (Math.abs(change) <= threshold) return "stable"
    return change > 0 ? "up" : "down"
  }

  private async checkAlertConditions(metric: BusinessMetric): Promise<void> {
    if (!metric.alerting.enabled) return

    for (const condition of metric.alerting.conditions) {
      if (!condition.enabled) continue

      let triggered = false

      switch (condition.condition) {
        case "greater_than":
          triggered = metric.currentValue > condition.value
          break
        case "less_than":
          triggered = metric.currentValue < condition.value
          break
        case "equals":
          triggered = metric.currentValue === condition.value
          break
        case "not_equals":
          triggered = metric.currentValue !== condition.value
          break
        case "change_by":
          triggered = Math.abs(metric.changePercentage) >= condition.value
          break
      }

      if (triggered) {
        await this.sendAlert(metric, condition)
      }
    }
  }

  private async sendAlert(metric: BusinessMetric, condition: AlertCondition): Promise<void> {
    // In a real implementation, this would send notifications
    console.log(`Alert triggered for ${metric.name}: ${condition.message}`)
  }

  private isAnomalous(metric: BusinessMetric): boolean {
    if (metric.historicalData.length < 10) return false

    const recentValues = metric.historicalData.slice(-10).map((d) => d.value)
    const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
    const stdDev = Math.sqrt(recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length)

    const zScore = Math.abs((metric.currentValue - mean) / stdDev)
    return zScore > 2 // More than 2 standard deviations
  }

  private async createAnomalyInsight(metric: BusinessMetric): Promise<BusinessInsight> {
    return {
      id: `insight-${Date.now()}`,
      title: `Anomaly Detected in ${metric.name}`,
      description: `${metric.name} shows unusual behavior with current value ${metric.currentValue}`,
      type: "anomaly",
      category: metric.category,
      severity: "medium",
      confidence: 0.8,
      impact: {
        financial: Math.abs(metric.change) * 100,
        operational: "medium",
        strategic: "low",
      },
      metrics: [metric.id],
      evidence: [
        {
          type: "statistic",
          data: {
            currentValue: metric.currentValue,
            expectedRange: "Normal range exceeded",
            deviation: "2+ standard deviations",
          },
          description: "Statistical analysis shows significant deviation from normal patterns",
        },
      ],
      recommendations: [
        {
          id: `rec-${Date.now()}`,
          title: "Investigate Root Cause",
          description: "Analyze underlying factors causing the anomaly",
          priority: "high",
          effort: "medium",
          expectedImpact: "Prevent potential issues",
          actionItems: ["Review recent system changes", "Check data quality", "Analyze external factors"],
        },
      ],
      status: "new",
      generatedBy: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private async analyzeTrends(metrics: BusinessMetric[]): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []

    for (const metric of metrics) {
      if (metric.historicalData.length < 5) continue

      const recentTrend = this.calculateRecentTrend(metric.historicalData.slice(-5))

      if (Math.abs(recentTrend) > 0.1) {
        // 10% trend threshold
        insights.push({
          id: `trend-${Date.now()}-${metric.id}`,
          title: `${recentTrend > 0 ? "Positive" : "Negative"} Trend in ${metric.name}`,
          description: `${metric.name} shows a ${Math.abs(recentTrend * 100).toFixed(1)}% ${recentTrend > 0 ? "increase" : "decrease"} trend`,
          type: "trend",
          category: metric.category,
          severity: Math.abs(recentTrend) > 0.2 ? "high" : "medium",
          confidence: 0.7,
          impact: {
            financial: Math.abs(recentTrend) * metric.currentValue,
            operational: "medium",
            strategic: "medium",
          },
          metrics: [metric.id],
          evidence: [],
          recommendations: [],
          status: "new",
          generatedBy: "system",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    return insights
  }

  private async analyzeCorrelations(metrics: BusinessMetric[]): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []

    // Simple correlation analysis between metrics
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i]
        const metric2 = metrics[j]

        if (metric1.historicalData.length < 10 || metric2.historicalData.length < 10) continue

        const correlation = this.calculateCorrelation(metric1.historicalData, metric2.historicalData)

        if (Math.abs(correlation) > 0.7) {
          // Strong correlation threshold
          insights.push({
            id: `correlation-${Date.now()}-${metric1.id}-${metric2.id}`,
            title: `Strong Correlation Between ${metric1.name} and ${metric2.name}`,
            description: `${metric1.name} and ${metric2.name} show a ${correlation > 0 ? "positive" : "negative"} correlation of ${Math.abs(correlation).toFixed(2)}`,
            type: "correlation",
            category: "operational",
            severity: "info",
            confidence: Math.abs(correlation),
            impact: {
              financial: 0,
              operational: "medium",
              strategic: "high",
            },
            metrics: [metric1.id, metric2.id],
            evidence: [
              {
                type: "statistic",
                data: {
                  correlation: correlation.toFixed(3),
                  strength: Math.abs(correlation) > 0.9 ? "Very Strong" : "Strong",
                  direction: correlation > 0 ? "Positive" : "Negative",
                },
                description: "Statistical correlation analysis between metrics",
              },
            ],
            recommendations: [
              {
                id: `rec-corr-${Date.now()}`,
                title: "Leverage Correlation for Optimization",
                description: "Use this correlation to optimize business processes",
                priority: "medium",
                effort: "low",
                expectedImpact: "Improved operational efficiency",
                actionItems: [
                  "Monitor both metrics together",
                  "Use leading indicator for predictions",
                  "Optimize processes affecting both metrics",
                ],
              },
            ],
            status: "new",
            generatedBy: "system",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
    }

    return insights
  }

  private async generateForecastInsights(): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = []
    const models = Array.from(this.models.values()).filter((m) => m.status === "ready")

    for (const model of models) {
      const nextPrediction = model.predictions[0]
      if (!nextPrediction) continue

      const currentMetric = this.metrics.get(model.targetMetric)
      if (!currentMetric) continue

      const predictedChange = nextPrediction.predictedValue - currentMetric.currentValue
      const changePercentage = (predictedChange / currentMetric.currentValue) * 100

      if (Math.abs(changePercentage) > 10) {
        // Significant change threshold
        insights.push({
          id: `forecast-${Date.now()}-${model.id}`,
          title: `Significant ${changePercentage > 0 ? "Increase" : "Decrease"} Predicted for ${currentMetric.name}`,
          description: `Model predicts a ${Math.abs(changePercentage).toFixed(1)}% ${changePercentage > 0 ? "increase" : "decrease"} in ${currentMetric.name}`,
          type: "forecast",
          category: currentMetric.category,
          severity: Math.abs(changePercentage) > 25 ? "high" : "medium",
          confidence: nextPrediction.confidence,
          impact: {
            financial: Math.abs(predictedChange) * 100,
            operational: "high",
            strategic: "high",
          },
          metrics: [currentMetric.id],
          evidence: [
            {
              type: "chart",
              data: {
                current: currentMetric.currentValue,
                predicted: nextPrediction.predictedValue,
                confidence: nextPrediction.confidence,
                timeframe: "Next 30 days",
              },
              description: "Predictive model forecast with confidence intervals",
            },
          ],
          recommendations: [
            {
              id: `rec-forecast-${Date.now()}`,
              title: changePercentage > 0 ? "Prepare for Growth" : "Mitigate Decline",
              description:
                changePercentage > 0
                  ? "Prepare resources and processes for expected growth"
                  : "Take proactive measures to prevent or mitigate decline",
              priority: "high",
              effort: "high",
              expectedImpact: "Optimized resource allocation",
              actionItems:
                changePercentage > 0
                  ? ["Scale infrastructure capacity", "Increase staffing levels", "Optimize supply chain"]
                  : ["Identify root causes", "Implement corrective measures", "Develop contingency plans"],
            },
          ],
          status: "new",
          generatedBy: "model",
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
      }
    }

    return insights
  }

  private generatePredictions(model: PredictiveModel): PredictiveModel["predictions"] {
    const predictions: PredictiveModel["predictions"] = []
    const baseValue = 1000 // Mock base value

    for (let i = 1; i <= model.predictionHorizon; i++) {
      const timestamp = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
      const trend = Math.sin(i * 0.1) * 0.1 // Simulate seasonal trend
      const noise = (Math.random() - 0.5) * 0.05 // Random noise
      const predictedValue = baseValue * (1 + trend + noise)

      const confidence = Math.max(0.5, 1 - (i / model.predictionHorizon) * 0.4) // Decreasing confidence
      const margin = predictedValue * (1 - confidence) * 0.5

      predictions.push({
        timestamp,
        predictedValue,
        confidenceInterval: {
          lower: predictedValue - margin,
          upper: predictedValue + margin,
        },
        confidence,
        factors: [
          {
            feature: "historical_trend",
            importance: 0.4,
            impact: trend * baseValue,
          },
          {
            feature: "seasonal_pattern",
            importance: 0.3,
            impact: Math.sin(i * 0.2) * baseValue * 0.05,
          },
          {
            feature: "market_conditions",
            importance: 0.3,
            impact: noise * baseValue,
          },
        ],
      })
    }

    return predictions
  }

  private calculateRecentTrend(data: { timestamp: Date; value: number }[]): number {
    if (data.length < 2) return 0

    const firstValue = data[0].value
    const lastValue = data[data.length - 1].value

    return (lastValue - firstValue) / firstValue
  }

  private calculateCorrelation(data1: { value: number }[], data2: { value: number }[]): number {
    const minLength = Math.min(data1.length, data2.length)
    const values1 = data1.slice(-minLength).map((d) => d.value)
    const values2 = data2.slice(-minLength).map((d) => d.value)

    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length

    let numerator = 0
    let sumSq1 = 0
    let sumSq2 = 0

    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1
      const diff2 = values2[i] - mean2

      numerator += diff1 * diff2
      sumSq1 += diff1 * diff1
      sumSq2 += diff2 * diff2
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2)
    return denominator === 0 ? 0 : numerator / denominator
  }

  private generateActiveAlerts(metrics: BusinessMetric[]): any[] {
    const alerts = []

    for (const metric of metrics) {
      // Check threshold violations
      if (metric.thresholds.critical.max && metric.currentValue > metric.thresholds.critical.max) {
        alerts.push({
          id: `alert-${Date.now()}-${metric.id}`,
          type: "threshold",
          severity: "critical",
          metric: metric.name,
          message: `${metric.name} exceeded critical threshold`,
          value: metric.currentValue,
          threshold: metric.thresholds.critical.max,
          timestamp: new Date(),
        })
      }

      // Check for rapid changes
      if (Math.abs(metric.changePercentage) > 50) {
        alerts.push({
          id: `alert-change-${Date.now()}-${metric.id}`,
          type: "rapid_change",
          severity: "warning",
          metric: metric.name,
          message: `${metric.name} changed by ${metric.changePercentage.toFixed(1)}%`,
          change: metric.changePercentage,
          timestamp: new Date(),
        })
      }
    }

    return alerts
  }

  private filterMetricsForReport(metrics: BusinessMetric[], reportId: string): BusinessMetric[] {
    const report = this.reports.get(reportId)
    if (!report) return metrics

    return metrics.filter((metric) => report.metrics.includes(metric.id))
  }

  private calculateDataFreshness(metrics: BusinessMetric[]): number {
    if (metrics.length === 0) return 100

    const now = Date.now()
    const freshnessScores = metrics.map((metric) => {
      const ageMinutes = (now - metric.dataSource.lastUpdated.getTime()) / (1000 * 60)
      const expectedInterval = metric.dataSource.refreshInterval / 60 // Convert to minutes

      return Math.max(0, 100 - (ageMinutes / expectedInterval) * 100)
    })

    return freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length
  }

  private async refreshMetrics(): Promise<void> {
    // In a real implementation, this would fetch fresh data from various sources
    const metrics = Array.from(this.metrics.values())

    for (const metric of metrics) {
      const now = Date.now()
      const timeSinceUpdate = now - metric.dataSource.lastUpdated.getTime()

      if (timeSinceUpdate >= metric.dataSource.refreshInterval * 1000) {
        // Simulate data refresh with some variation
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        const newValue = metric.currentValue * (1 + variation)

        await this.updateMetric(metric.id, newValue)
      }
    }
  }

  private async updatePredictions(): Promise<void> {
    const models = Array.from(this.models.values()).filter((m) => m.status === "ready")

    for (const model of models) {
      const now = Date.now()
      const timeSinceTraining = now - model.lastTrainedAt.getTime()

      // Retrain model if it's been more than a week
      if (timeSinceTraining >= 7 * 24 * 60 * 60 * 1000) {
        await this.trainModel(model.id)
      }
    }
  }

  private async checkDataQuality(): Promise<void> {
    const metrics = Array.from(this.metrics.values())

    for (const metric of metrics) {
      // Check for missing data
      const expectedDataPoints = Math.floor(
        (Date.now() - metric.createdAt.getTime()) / (metric.dataSource.refreshInterval * 1000),
      )

      const actualDataPoints = metric.historicalData.length
      const completeness = actualDataPoints / expectedDataPoints

      if (completeness < 0.8) {
        // Less than 80% data completeness
        console.warn(`Data quality issue for ${metric.name}: ${(completeness * 100).toFixed(1)}% completeness`)
      }
    }
  }
}

export const businessIntelligenceDashboard = BusinessIntelligenceDashboard.getInstance()
