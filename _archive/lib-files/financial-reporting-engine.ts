export interface FinancialMetrics {
  revenue: {
    total: number
    recurring: number
    oneTime: number
    growth: number
    forecast: number
  }
  expenses: {
    total: number
    operational: number
    marketing: number
    personnel: number
    infrastructure: number
  }
  profitability: {
    grossProfit: number
    netProfit: number
    ebitda: number
    margins: {
      gross: number
      net: number
      operating: number
    }
  }
  cashFlow: {
    operating: number
    investing: number
    financing: number
    free: number
  }
  kpis: {
    arr: number // Annual Recurring Revenue
    mrr: number // Monthly Recurring Revenue
    cac: number // Customer Acquisition Cost
    ltv: number // Lifetime Value
    churnRate: number
    burnRate: number
  }
}

export interface ProfitLossStatement {
  period: {
    start: Date
    end: Date
    type: "monthly" | "quarterly" | "yearly"
  }
  revenue: {
    subscriptions: number
    trading: number
    premium: number
    enterprise: number
    other: number
    total: number
  }
  costOfRevenue: {
    dataFeeds: number
    infrastructure: number
    processing: number
    total: number
  }
  grossProfit: number
  operatingExpenses: {
    sales: number
    marketing: number
    research: number
    general: number
    total: number
  }
  operatingIncome: number
  otherIncome: number
  netIncome: number
  margins: {
    gross: number
    operating: number
    net: number
  }
}

export interface FinancialForecast {
  period: string
  scenario: "conservative" | "realistic" | "optimistic"
  revenue: number
  expenses: number
  profit: number
  confidence: number
  assumptions: string[]
  risks: string[]
}

export class FinancialReportingEngine {
  private static instance: FinancialReportingEngine
  private cache: Map<string, any> = new Map()

  static getInstance(): FinancialReportingEngine {
    if (!FinancialReportingEngine.instance) {
      FinancialReportingEngine.instance = new FinancialReportingEngine()
    }
    return FinancialReportingEngine.instance
  }

  async generatePLStatement(
    startDate: Date,
    endDate: Date,
    type: "monthly" | "quarterly" | "yearly",
  ): Promise<ProfitLossStatement> {
    const cacheKey = `pl_${startDate.getTime()}_${endDate.getTime()}_${type}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Simulate complex P&L calculation
    const revenue = await this.calculateRevenue(startDate, endDate)
    const expenses = await this.calculateExpenses(startDate, endDate)

    const statement: ProfitLossStatement = {
      period: { start: startDate, end: endDate, type },
      revenue: {
        subscriptions: revenue.subscriptions,
        trading: revenue.trading,
        premium: revenue.premium,
        enterprise: revenue.enterprise,
        other: revenue.other,
        total: revenue.total,
      },
      costOfRevenue: {
        dataFeeds: expenses.dataFeeds,
        infrastructure: expenses.infrastructure,
        processing: expenses.processing,
        total: expenses.costOfRevenue,
      },
      grossProfit: revenue.total - expenses.costOfRevenue,
      operatingExpenses: {
        sales: expenses.sales,
        marketing: expenses.marketing,
        research: expenses.research,
        general: expenses.general,
        total: expenses.operating,
      },
      operatingIncome: revenue.total - expenses.costOfRevenue - expenses.operating,
      otherIncome: revenue.other,
      netIncome: revenue.total - expenses.total,
      margins: {
        gross: ((revenue.total - expenses.costOfRevenue) / revenue.total) * 100,
        operating: ((revenue.total - expenses.costOfRevenue - expenses.operating) / revenue.total) * 100,
        net: ((revenue.total - expenses.total) / revenue.total) * 100,
      },
    }

    this.cache.set(cacheKey, statement)
    return statement
  }

  async generateFinancialForecast(
    months: number,
    scenario: "conservative" | "realistic" | "optimistic",
  ): Promise<FinancialForecast[]> {
    const forecasts: FinancialForecast[] = []
    const baseMetrics = await this.getCurrentMetrics()

    for (let i = 1; i <= months; i++) {
      const multiplier = this.getScenarioMultiplier(scenario, i)

      forecasts.push({
        period: `Month ${i}`,
        scenario,
        revenue: baseMetrics.revenue.total * multiplier.revenue,
        expenses: baseMetrics.expenses.total * multiplier.expenses,
        profit: baseMetrics.revenue.total * multiplier.revenue - baseMetrics.expenses.total * multiplier.expenses,
        confidence: this.calculateConfidence(scenario, i),
        assumptions: this.getAssumptions(scenario),
        risks: this.getRisks(scenario),
      })
    }

    return forecasts
  }

  async calculateKPIs(): Promise<FinancialMetrics["kpis"]> {
    // Simulate KPI calculations
    return {
      arr: 2400000, // $2.4M ARR
      mrr: 200000, // $200K MRR
      cac: 150, // $150 CAC
      ltv: 1800, // $1,800 LTV
      churnRate: 5.2, // 5.2% monthly churn
      burnRate: 85000, // $85K monthly burn
    }
  }

  private async calculateRevenue(startDate: Date, endDate: Date) {
    // Simulate revenue calculation from various sources
    return {
      subscriptions: 180000,
      trading: 45000,
      premium: 32000,
      enterprise: 28000,
      other: 5000,
      total: 290000,
    }
  }

  private async calculateExpenses(startDate: Date, endDate: Date) {
    return {
      dataFeeds: 25000,
      infrastructure: 18000,
      processing: 12000,
      costOfRevenue: 55000,
      sales: 35000,
      marketing: 28000,
      research: 45000,
      general: 22000,
      operating: 130000,
      total: 185000,
    }
  }

  private async getCurrentMetrics(): Promise<FinancialMetrics> {
    return {
      revenue: {
        total: 290000,
        recurring: 240000,
        oneTime: 50000,
        growth: 12.5,
        forecast: 325000,
      },
      expenses: {
        total: 185000,
        operational: 130000,
        marketing: 28000,
        personnel: 95000,
        infrastructure: 18000,
      },
      profitability: {
        grossProfit: 235000,
        netProfit: 105000,
        ebitda: 125000,
        margins: {
          gross: 81.0,
          net: 36.2,
          operating: 43.1,
        },
      },
      cashFlow: {
        operating: 95000,
        investing: -15000,
        financing: 25000,
        free: 80000,
      },
      kpis: await this.calculateKPIs(),
    }
  }

  private getScenarioMultiplier(scenario: string, month: number) {
    const base = {
      conservative: { revenue: 1.02, expenses: 1.01 },
      realistic: { revenue: 1.05, expenses: 1.03 },
      optimistic: { revenue: 1.08, expenses: 1.02 },
    }

    const growth = Math.pow(base[scenario as keyof typeof base].revenue, month)
    const expenseGrowth = Math.pow(base[scenario as keyof typeof base].expenses, month)

    return { revenue: growth, expenses: expenseGrowth }
  }

  private calculateConfidence(scenario: string, month: number): number {
    const baseConfidence = { conservative: 85, realistic: 75, optimistic: 60 }
    const decay = Math.max(0, 1 - month * 0.05)
    return Math.round(baseConfidence[scenario as keyof typeof baseConfidence] * decay)
  }

  private getAssumptions(scenario: string): string[] {
    const assumptions = {
      conservative: [
        "Market growth remains stable",
        "No major competitive threats",
        "Current pricing strategy maintained",
      ],
      realistic: ["Moderate market expansion", "Successful product launches", "Improved conversion rates"],
      optimistic: ["Aggressive market expansion", "Premium feature adoption", "Strategic partnerships"],
    }
    return assumptions[scenario as keyof typeof assumptions]
  }

  private getRisks(scenario: string): string[] {
    const risks = {
      conservative: ["Economic downturn impact", "Increased competition"],
      realistic: ["Market volatility", "Technology disruption", "Regulatory changes"],
      optimistic: ["Execution challenges", "Market saturation", "Resource constraints"],
    }
    return risks[scenario as keyof typeof risks]
  }
}

export const financialEngine = FinancialReportingEngine.getInstance()
