export interface FinancialAccount {
  id: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  subtype: string
  code: string
  description: string
  parentAccount?: string
  isActive: boolean
  balance: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface FinancialTransaction {
  id: string
  date: Date
  description: string
  reference?: string
  type: "debit" | "credit"
  amount: number
  currency: string
  accountId: string
  categoryId?: string
  customerId?: string
  invoiceId?: string
  paymentMethodId?: string
  taxAmount?: number
  taxRate?: number
  exchangeRate?: number
  notes?: string
  attachments: string[]
  tags: string[]
  status: "pending" | "cleared" | "reconciled" | "voided"
  createdBy: string
  createdAt: Date
  updatedAt: Date
  reconciledAt?: Date
  reconciledBy?: string
}

export interface ProfitLossStatement {
  period: {
    start: Date
    end: Date
    type: "monthly" | "quarterly" | "yearly"
  }
  currency: string
  revenue: {
    subscriptionRevenue: number
    tradingCommissions: number
    premiumFeatures: number
    apiAccess: number
    dataServices: number
    otherRevenue: number
    totalRevenue: number
  }
  costOfRevenue: {
    dataFeeds: number
    infrastructure: number
    paymentProcessing: number
    thirdPartyServices: number
    totalCostOfRevenue: number
  }
  grossProfit: number
  grossMargin: number
  operatingExpenses: {
    salariesAndBenefits: number
    marketing: number
    salesExpenses: number
    researchAndDevelopment: number
    generalAndAdministrative: number
    professionalServices: number
    officeExpenses: number
    travelExpenses: number
    softwareLicenses: number
    totalOperatingExpenses: number
  }
  operatingIncome: number
  operatingMargin: number
  otherIncomeExpense: {
    interestIncome: number
    interestExpense: number
    foreignExchangeGain: number
    otherIncome: number
    totalOtherIncomeExpense: number
  }
  incomeBeforeTaxes: number
  incomeTaxExpense: number
  netIncome: number
  netMargin: number
  ebitda: number
  ebitdaMargin: number
}

export interface BalanceSheet {
  asOfDate: Date
  currency: string
  assets: {
    currentAssets: {
      cash: number
      accountsReceivable: number
      prepaidExpenses: number
      otherCurrentAssets: number
      totalCurrentAssets: number
    }
    nonCurrentAssets: {
      propertyPlantEquipment: number
      intangibleAssets: number
      investments: number
      otherNonCurrentAssets: number
      totalNonCurrentAssets: number
    }
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: {
      accountsPayable: number
      accruedExpenses: number
      deferredRevenue: number
      shortTermDebt: number
      otherCurrentLiabilities: number
      totalCurrentLiabilities: number
    }
    nonCurrentLiabilities: {
      longTermDebt: number
      deferredTaxLiabilities: number
      otherNonCurrentLiabilities: number
      totalNonCurrentLiabilities: number
    }
    totalLiabilities: number
  }
  equity: {
    commonStock: number
    retainedEarnings: number
    otherEquity: number
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
}

export interface CashFlowStatement {
  period: {
    start: Date
    end: Date
    type: "monthly" | "quarterly" | "yearly"
  }
  currency: string
  operatingActivities: {
    netIncome: number
    depreciation: number
    amortization: number
    changeInAccountsReceivable: number
    changeInAccountsPayable: number
    changeInAccruedExpenses: number
    changeInDeferredRevenue: number
    otherOperatingChanges: number
    netCashFromOperating: number
  }
  investingActivities: {
    capitalExpenditures: number
    acquisitions: number
    investments: number
    otherInvestingActivities: number
    netCashFromInvesting: number
  }
  financingActivities: {
    debtProceeds: number
    debtRepayments: number
    equityIssuance: number
    dividendsPaid: number
    otherFinancingActivities: number
    netCashFromFinancing: number
  }
  netChangeInCash: number
  beginningCash: number
  endingCash: number
}

export interface TaxReport {
  id: string
  period: {
    start: Date
    end: Date
    type: "monthly" | "quarterly" | "yearly"
  }
  jurisdiction: string
  taxType: "income" | "sales" | "vat" | "payroll" | "property"
  status: "draft" | "filed" | "paid" | "overdue"
  calculations: {
    taxableIncome: number
    taxRate: number
    taxOwed: number
    taxPaid: number
    taxDue: number
    penalties: number
    interest: number
  }
  filingDeadline: Date
  paymentDeadline: Date
  filedAt?: Date
  paidAt?: Date
  attachments: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface FinancialForecast {
  id: string
  name: string
  description: string
  period: {
    start: Date
    end: Date
    intervals: "monthly" | "quarterly"
  }
  scenario: "conservative" | "realistic" | "optimistic"
  assumptions: {
    revenueGrowthRate: number
    customerAcquisitionRate: number
    churnRate: number
    averageRevenuePerUser: number
    costInflationRate: number
    marketingSpendRate: number
    headcountGrowthRate: number
  }
  projections: Array<{
    period: string
    revenue: number
    expenses: number
    netIncome: number
    cashFlow: number
    customers: number
    employees: number
    confidence: number
  }>
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FinancialKPI {
  id: string
  name: string
  description: string
  category: "revenue" | "profitability" | "efficiency" | "liquidity" | "growth"
  formula: string
  currentValue: number
  previousValue: number
  targetValue: number
  unit: "currency" | "percentage" | "ratio" | "count"
  trend: "up" | "down" | "stable"
  status: "good" | "warning" | "critical"
  lastCalculated: Date
  history: Array<{
    date: Date
    value: number
  }>
}

export interface BudgetPlan {
  id: string
  name: string
  description: string
  fiscalYear: number
  status: "draft" | "approved" | "active" | "closed"
  categories: Array<{
    id: string
    name: string
    type: "revenue" | "expense"
    budgetAmount: number
    actualAmount: number
    variance: number
    variancePercentage: number
    subcategories: Array<{
      id: string
      name: string
      budgetAmount: number
      actualAmount: number
      variance: number
    }>
  }>
  totalBudgetRevenue: number
  totalActualRevenue: number
  totalBudgetExpenses: number
  totalActualExpenses: number
  budgetedNetIncome: number
  actualNetIncome: number
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  approvedBy?: string
}

export interface TaxReportingData {
  id: string
  taxYear: number
  jurisdiction: string
  reportType: "income" | "sales" | "vat" | "corporate" | "quarterly" | "annual"
  status: "draft" | "filed" | "approved" | "rejected" | "amended"
  filingDeadline: Date
  filedDate?: Date
  taxableIncome: number
  taxOwed: number
  taxPaid: number
  refundDue: number
  penalties: number
  interest: number
  deductions: TaxDeduction[]
  credits: TaxCredit[]
  attachments: string[]
  auditRisk: "low" | "medium" | "high"
  complianceScore: number
  lastUpdated: Date
}

export interface TaxDeduction {
  id: string
  category: string
  description: string
  amount: number
  supportingDocuments: string[]
  approved: boolean
  auditTrail: string[]
}

export interface TaxCredit {
  id: string
  type: string
  description: string
  amount: number
  eligibilityVerified: boolean
  expirationDate?: Date
}

export interface FinancialForecastOld {
  id: string
  name: string
  period: "monthly" | "quarterly" | "annual"
  startDate: Date
  endDate: Date
  scenario: "conservative" | "realistic" | "optimistic"
  methodology: "linear" | "exponential" | "seasonal" | "ml_based"
  confidence: number
  assumptions: ForecastAssumption[]
  projections: {
    revenue: MonthlyProjection[]
    expenses: MonthlyProjection[]
    profit: MonthlyProjection[]
    cashFlow: MonthlyProjection[]
  }
  risks: RiskFactor[]
  opportunities: OpportunityFactor[]
  sensitivity: SensitivityAnalysis[]
  createdAt: Date
  updatedAt: Date
}

export interface MonthlyProjection {
  month: string
  value: number
  variance: number
  confidence: number
  factors: string[]
}

export interface ForecastAssumption {
  id: string
  category: "market" | "operational" | "financial" | "regulatory"
  description: string
  impact: "high" | "medium" | "low"
  probability: number
  quantifiedImpact: number
}

export interface RiskFactor {
  id: string
  name: string
  description: string
  probability: number
  impact: number
  severity: "critical" | "high" | "medium" | "low"
  mitigation: string[]
  owner: string
  status: "identified" | "assessed" | "mitigated" | "monitored"
}

export interface OpportunityFactor {
  id: string
  name: string
  description: string
  probability: number
  impact: number
  priority: "high" | "medium" | "low"
  requirements: string[]
  timeline: string
  owner: string
}

export interface SensitivityAnalysis {
  variable: string
  baseValue: number
  scenarios: {
    pessimistic: { change: number; impact: number }
    optimistic: { change: number; impact: number }
  }
}

export interface ComprehensivePLStatement {
  id: string
  period: {
    start: Date
    end: Date
    type: "monthly" | "quarterly" | "annual"
  }
  currency: string

  // Revenue Section
  revenue: {
    subscriptionRevenue: {
      basic: number
      premium: number
      enterprise: number
      total: number
    }
    transactionRevenue: {
      tradingFees: number
      withdrawalFees: number
      premiumFeatures: number
      total: number
    }
    otherRevenue: {
      partnerships: number
      dataLicensing: number
      consulting: number
      total: number
    }
    totalRevenue: number
    revenueGrowth: number
  }

  // Cost of Revenue
  costOfRevenue: {
    dataFeeds: number
    infrastructureCosts: number
    paymentProcessing: number
    thirdPartyServices: number
    total: number
  }

  // Gross Profit
  grossProfit: number
  grossMargin: number

  // Operating Expenses
  operatingExpenses: {
    salesAndMarketing: {
      advertising: number
      salesTeam: number
      marketingTools: number
      events: number
      total: number
    }
    researchAndDevelopment: {
      engineeringSalaries: number
      softwareLicenses: number
      cloudServices: number
      testing: number
      total: number
    }
    generalAndAdministrative: {
      executiveSalaries: number
      legal: number
      accounting: number
      insurance: number
      facilities: number
      total: number
    }
    totalOperatingExpenses: number
  }

  // Operating Income
  operatingIncome: number
  operatingMargin: number

  // Other Income/Expenses
  otherIncomeExpenses: {
    interestIncome: number
    interestExpense: number
    foreignExchangeGains: number
    investmentGains: number
    total: number
  }

  // Pre-tax Income
  pretaxIncome: number

  // Tax Provision
  taxProvision: {
    currentTax: number
    deferredTax: number
    total: number
    effectiveRate: number
  }

  // Net Income
  netIncome: number
  netMargin: number

  // Per Share Data
  perShareData: {
    basicEPS: number
    dilutedEPS: number
    weightedAverageShares: number
  }

  // Key Ratios
  keyRatios: {
    grossMargin: number
    operatingMargin: number
    netMargin: number
    returnOnAssets: number
    returnOnEquity: number
    debtToEquity: number
    currentRatio: number
    quickRatio: number
  }

  // Variance Analysis
  varianceAnalysis: {
    revenueVariance: number
    expenseVariance: number
    profitVariance: number
    marginVariance: number
  }

  // Benchmarking
  industryBenchmarks: {
    grossMargin: number
    operatingMargin: number
    netMargin: number
    revenueGrowth: number
  }

  createdAt: Date
  approvedBy?: string
  approvedAt?: Date
  version: number
}

export class AdvancedFinancialSystem {
  private static instance: AdvancedFinancialSystem
  private accounts: Map<string, FinancialAccount> = new Map()
  private transactions: Map<string, FinancialTransaction> = new Map()
  private plStatements: Map<string, ComprehensivePLStatement> = new Map()
  private taxReports: Map<string, TaxReport> = new Map()
  private forecasts: Map<string, FinancialForecast> = new Map()
  private budgets: Map<string, BudgetPlan> = new Map()
  private kpis: Map<string, FinancialKPI> = new Map()

  static getInstance(): AdvancedFinancialSystem {
    if (!AdvancedFinancialSystem.instance) {
      AdvancedFinancialSystem.instance = new AdvancedFinancialSystem()
      AdvancedFinancialSystem.instance.initializeDefaults()
    }
    return AdvancedFinancialSystem.instance
  }

  private initializeDefaults(): void {
    this.initializeChartOfAccounts()
    this.initializeSampleTransactions()
    this.initializeKPIs()
    this.initializeSampleBudget()
  }

  private initializeChartOfAccounts(): void {
    const accounts: FinancialAccount[] = [
      // Assets
      {
        id: "1000",
        name: "Cash",
        type: "asset",
        subtype: "current",
        code: "1000",
        description: "Cash and cash equivalents",
        isActive: true,
        balance: 250000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1100",
        name: "Accounts Receivable",
        type: "asset",
        subtype: "current",
        code: "1100",
        description: "Customer receivables",
        isActive: true,
        balance: 45000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1200",
        name: "Prepaid Expenses",
        type: "asset",
        subtype: "current",
        code: "1200",
        description: "Prepaid expenses",
        isActive: true,
        balance: 12000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "1500",
        name: "Equipment",
        type: "asset",
        subtype: "fixed",
        code: "1500",
        description: "Computer equipment and furniture",
        isActive: true,
        balance: 85000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Liabilities
      {
        id: "2000",
        name: "Accounts Payable",
        type: "liability",
        subtype: "current",
        code: "2000",
        description: "Vendor payables",
        isActive: true,
        balance: 28000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2100",
        name: "Accrued Expenses",
        type: "liability",
        subtype: "current",
        code: "2100",
        description: "Accrued expenses",
        isActive: true,
        balance: 15000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2200",
        name: "Deferred Revenue",
        type: "liability",
        subtype: "current",
        code: "2200",
        description: "Unearned revenue",
        isActive: true,
        balance: 35000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Equity
      {
        id: "3000",
        name: "Common Stock",
        type: "equity",
        subtype: "capital",
        code: "3000",
        description: "Common stock",
        isActive: true,
        balance: 100000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3100",
        name: "Retained Earnings",
        type: "equity",
        subtype: "retained",
        code: "3100",
        description: "Retained earnings",
        isActive: true,
        balance: 214000,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Revenue
      {
        id: "4000",
        name: "Subscription Revenue",
        type: "revenue",
        subtype: "operating",
        code: "4000",
        description: "Monthly and annual subscriptions",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4100",
        name: "Trading Commissions",
        type: "revenue",
        subtype: "operating",
        code: "4100",
        description: "Trading commission revenue",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "4200",
        name: "Premium Features",
        type: "revenue",
        subtype: "operating",
        code: "4200",
        description: "Premium feature revenue",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Expenses
      {
        id: "5000",
        name: "Salaries and Benefits",
        type: "expense",
        subtype: "operating",
        code: "5000",
        description: "Employee compensation",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5100",
        name: "Marketing Expenses",
        type: "expense",
        subtype: "operating",
        code: "5100",
        description: "Marketing and advertising",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5200",
        name: "Infrastructure Costs",
        type: "expense",
        subtype: "operating",
        code: "5200",
        description: "Server and infrastructure costs",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "5300",
        name: "Data Feed Costs",
        type: "expense",
        subtype: "operating",
        code: "5300",
        description: "Market data feed costs",
        isActive: true,
        balance: 0,
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    accounts.forEach((account) => this.accounts.set(account.id, account))
  }

  private initializeSampleTransactions(): void {
    const now = new Date()
    const transactions: FinancialTransaction[] = [
      {
        id: "txn-1",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        description: "Monthly subscription revenue",
        type: "credit",
        amount: 25000,
        currency: "USD",
        accountId: "4000",
        status: "cleared",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
        tags: ["subscription", "recurring"],
      },
      {
        id: "txn-2",
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        description: "Employee salaries",
        type: "debit",
        amount: 45000,
        currency: "USD",
        accountId: "5000",
        status: "cleared",
        createdBy: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
        tags: ["payroll", "monthly"],
      },
      {
        id: "txn-3",
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        description: "AWS infrastructure costs",
        type: "debit",
        amount: 8500,
        currency: "USD",
        accountId: "5200",
        status: "cleared",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
        tags: ["infrastructure", "aws"],
      },
    ]

    transactions.forEach((transaction) => this.transactions.set(transaction.id, transaction))
  }

  private initializeKPIs(): void {
    const kpis: FinancialKPI[] = [
      {
        id: "kpi-1",
        name: "Monthly Recurring Revenue (MRR)",
        description: "Monthly recurring revenue from subscriptions",
        category: "revenue",
        formula: "Sum of monthly subscription revenue",
        currentValue: 285000,
        previousValue: 267000,
        targetValue: 300000,
        unit: "currency",
        trend: "up",
        status: "good",
        lastCalculated: new Date(),
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 267000 },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: 276000 },
          { date: new Date(), value: 285000 },
        ],
      },
      {
        id: "kpi-2",
        name: "Gross Margin",
        description: "Gross profit as percentage of revenue",
        category: "profitability",
        formula: "(Revenue - COGS) / Revenue * 100",
        currentValue: 78.5,
        previousValue: 76.2,
        targetValue: 80.0,
        unit: "percentage",
        trend: "up",
        status: "good",
        lastCalculated: new Date(),
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 76.2 },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: 77.1 },
          { date: new Date(), value: 78.5 },
        ],
      },
      {
        id: "kpi-3",
        name: "Customer Acquisition Cost (CAC)",
        description: "Cost to acquire a new customer",
        category: "efficiency",
        formula: "Marketing Spend / New Customers Acquired",
        currentValue: 125,
        previousValue: 142,
        targetValue: 100,
        unit: "currency",
        trend: "down",
        status: "warning",
        lastCalculated: new Date(),
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 142 },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: 133 },
          { date: new Date(), value: 125 },
        ],
      },
    ]

    kpis.forEach((kpi) => this.kpis.set(kpi.id, kpi))
  }

  private initializeSampleBudget(): void {
    const budget: BudgetPlan = {
      id: "budget-2024",
      name: "2024 Annual Budget",
      description: "Annual budget plan for fiscal year 2024",
      fiscalYear: 2024,
      status: "active",
      categories: [
        {
          id: "revenue",
          name: "Total Revenue",
          type: "revenue",
          budgetAmount: 3600000,
          actualAmount: 2850000,
          variance: -750000,
          variancePercentage: -20.8,
          subcategories: [
            {
              id: "subscription",
              name: "Subscription Revenue",
              budgetAmount: 2400000,
              actualAmount: 2100000,
              variance: -300000,
            },
            {
              id: "commissions",
              name: "Trading Commissions",
              budgetAmount: 800000,
              actualAmount: 550000,
              variance: -250000,
            },
            { id: "premium", name: "Premium Features", budgetAmount: 400000, actualAmount: 200000, variance: -200000 },
          ],
        },
        {
          id: "expenses",
          name: "Total Expenses",
          type: "expense",
          budgetAmount: 2800000,
          actualAmount: 2100000,
          variance: -700000,
          variancePercentage: -25.0,
          subcategories: [
            {
              id: "salaries",
              name: "Salaries & Benefits",
              budgetAmount: 1400000,
              actualAmount: 1050000,
              variance: -350000,
            },
            { id: "marketing", name: "Marketing", budgetAmount: 600000, actualAmount: 420000, variance: -180000 },
            {
              id: "infrastructure",
              name: "Infrastructure",
              budgetAmount: 400000,
              actualAmount: 320000,
              variance: -80000,
            },
            { id: "other", name: "Other Expenses", budgetAmount: 400000, actualAmount: 310000, variance: -90000 },
          ],
        },
      ],
      totalBudgetRevenue: 3600000,
      totalActualRevenue: 2850000,
      totalBudgetExpenses: 2800000,
      totalActualExpenses: 2100000,
      budgetedNetIncome: 800000,
      actualNetIncome: 750000,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
      approvedAt: new Date("2024-01-15"),
      approvedBy: "CFO",
    }

    this.budgets.set(budget.id, budget)
  }

  async generateComprehensivePL(
    startDate: Date,
    endDate: Date,
    type: "monthly" | "quarterly" | "annual",
  ): Promise<ComprehensivePLStatement> {
    const statement: ComprehensivePLStatement = {
      id: `pl-${Date.now()}`,
      period: { start: startDate, end: endDate, type },
      currency: "USD",

      revenue: {
        subscriptionRevenue: {
          basic: 125000,
          premium: 285000,
          enterprise: 450000,
          total: 860000,
        },
        transactionRevenue: {
          tradingFees: 185000,
          withdrawalFees: 45000,
          premiumFeatures: 65000,
          total: 295000,
        },
        otherRevenue: {
          partnerships: 35000,
          dataLicensing: 25000,
          consulting: 15000,
          total: 75000,
        },
        totalRevenue: 1230000,
        revenueGrowth: 18.5,
      },

      costOfRevenue: {
        dataFeeds: 125000,
        infrastructureCosts: 85000,
        paymentProcessing: 35000,
        thirdPartyServices: 45000,
        total: 290000,
      },

      grossProfit: 940000,
      grossMargin: 76.4,

      operatingExpenses: {
        salesAndMarketing: {
          advertising: 125000,
          salesTeam: 185000,
          marketingTools: 35000,
          events: 25000,
          total: 370000,
        },
        researchAndDevelopment: {
          engineeringSalaries: 285000,
          softwareLicenses: 45000,
          cloudServices: 65000,
          testing: 25000,
          total: 420000,
        },
        generalAndAdministrative: {
          executiveSalaries: 125000,
          legal: 35000,
          accounting: 25000,
          insurance: 15000,
          facilities: 45000,
          total: 245000,
        },
        totalOperatingExpenses: 1035000,
      },

      operatingIncome: -95000,
      operatingMargin: -7.7,

      otherIncomeExpenses: {
        interestIncome: 5000,
        interestExpense: -15000,
        foreignExchangeGains: 2500,
        investmentGains: 8500,
        total: 1000,
      },

      pretaxIncome: -94000,

      taxProvision: {
        currentTax: 0,
        deferredTax: 15000,
        total: 15000,
        effectiveRate: 0,
      },

      netIncome: -79000,
      netMargin: -6.4,

      perShareData: {
        basicEPS: -0.15,
        dilutedEPS: -0.15,
        weightedAverageShares: 526667,
      },

      keyRatios: {
        grossMargin: 76.4,
        operatingMargin: -7.7,
        netMargin: -6.4,
        returnOnAssets: -2.1,
        returnOnEquity: -3.8,
        debtToEquity: 0.25,
        currentRatio: 2.4,
        quickRatio: 1.8,
      },

      varianceAnalysis: {
        revenueVariance: 85000,
        expenseVariance: -125000,
        profitVariance: -210000,
        marginVariance: -12.3,
      },

      industryBenchmarks: {
        grossMargin: 78.5,
        operatingMargin: 15.2,
        netMargin: 12.8,
        revenueGrowth: 22.3,
      },

      createdAt: new Date(),
      version: 1,
    }

    this.plStatements.set(statement.id, statement)
    return statement
  }

  async generateProfitLossStatement(
    startDate: Date,
    endDate: Date,
    type: "monthly" | "quarterly" | "yearly",
  ): Promise<ProfitLossStatement> {
    const transactions = Array.from(this.transactions.values()).filter(
      (t) => t.date >= startDate && t.date <= endDate && t.status === "cleared",
    )

    // Calculate revenue
    const subscriptionRevenue = this.calculateAccountTotal(transactions, "4000")
    const tradingCommissions = this.calculateAccountTotal(transactions, "4100")
    const premiumFeatures = this.calculateAccountTotal(transactions, "4200")
    const apiAccess = this.calculateAccountTotal(transactions, "4300") || 0
    const dataServices = this.calculateAccountTotal(transactions, "4400") || 0
    const otherRevenue = this.calculateAccountTotal(transactions, "4900") || 0
    const totalRevenue =
      subscriptionRevenue + tradingCommissions + premiumFeatures + apiAccess + dataServices + otherRevenue

    // Calculate cost of revenue
    const dataFeeds = this.calculateAccountTotal(transactions, "5300")
    const infrastructure = this.calculateAccountTotal(transactions, "5200")
    const paymentProcessing = this.calculateAccountTotal(transactions, "5350") || 0
    const thirdPartyServices = this.calculateAccountTotal(transactions, "5360") || 0
    const totalCostOfRevenue = dataFeeds + infrastructure + paymentProcessing + thirdPartyServices

    const grossProfit = totalRevenue - totalCostOfRevenue
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    // Calculate operating expenses
    const salariesAndBenefits = this.calculateAccountTotal(transactions, "5000")
    const marketing = this.calculateAccountTotal(transactions, "5100")
    const salesExpenses = this.calculateAccountTotal(transactions, "5150") || 0
    const researchAndDevelopment = this.calculateAccountTotal(transactions, "5400") || 0
    const generalAndAdministrative = this.calculateAccountTotal(transactions, "5500") || 0
    const professionalServices = this.calculateAccountTotal(transactions, "5600") || 0
    const officeExpenses = this.calculateAccountTotal(transactions, "5700") || 0
    const travelExpenses = this.calculateAccountTotal(transactions, "5800") || 0
    const softwareLicenses = this.calculateAccountTotal(transactions, "5900") || 0
    const totalOperatingExpenses =
      salariesAndBenefits +
      marketing +
      salesExpenses +
      researchAndDevelopment +
      generalAndAdministrative +
      professionalServices +
      officeExpenses +
      travelExpenses +
      softwareLicenses

    const operatingIncome = grossProfit - totalOperatingExpenses
    const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0

    // Calculate other income/expense
    const interestIncome = this.calculateAccountTotal(transactions, "6000") || 0
    const interestExpense = this.calculateAccountTotal(transactions, "6100") || 0
    const foreignExchangeGain = this.calculateAccountTotal(transactions, "6200") || 0
    const otherIncome = this.calculateAccountTotal(transactions, "6900") || 0
    const totalOtherIncomeExpense = interestIncome - interestExpense + foreignExchangeGain + otherIncome

    const incomeBeforeTaxes = operatingIncome + totalOtherIncomeExpense
    const incomeTaxExpense = Math.max(0, incomeBeforeTaxes * 0.25) // Assume 25% tax rate
    const netIncome = incomeBeforeTaxes - incomeTaxExpense
    const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

    // Calculate EBITDA (simplified - would need depreciation and amortization data)
    const ebitda = operatingIncome + 5000 // Assume $5k in depreciation/amortization
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0

    return {
      period: { start: startDate, end: endDate, type },
      currency: "USD",
      revenue: {
        subscriptionRevenue,
        tradingCommissions,
        premiumFeatures,
        apiAccess,
        dataServices,
        otherRevenue,
        totalRevenue,
      },
      costOfRevenue: {
        dataFeeds,
        infrastructure,
        paymentProcessing,
        thirdPartyServices,
        totalCostOfRevenue,
      },
      grossProfit,
      grossMargin,
      operatingExpenses: {
        salariesAndBenefits,
        marketing,
        salesExpenses,
        researchAndDevelopment,
        generalAndAdministrative,
        professionalServices,
        officeExpenses,
        travelExpenses,
        softwareLicenses,
        totalOperatingExpenses,
      },
      operatingIncome,
      operatingMargin,
      otherIncomeExpense: {
        interestIncome,
        interestExpense,
        foreignExchangeGain,
        otherIncome,
        totalOtherIncomeExpense,
      },
      incomeBeforeTaxes,
      incomeTaxExpense,
      netIncome,
      netMargin,
      ebitda,
      ebitdaMargin,
    }
  }

  async generateBalanceSheet(asOfDate: Date): Promise<BalanceSheet> {
    const accounts = Array.from(this.accounts.values())

    // Calculate current assets
    const cash = this.getAccountBalance("1000")
    const accountsReceivable = this.getAccountBalance("1100")
    const prepaidExpenses = this.getAccountBalance("1200")
    const otherCurrentAssets = this.getAccountBalance("1300") || 0
    const totalCurrentAssets = cash + accountsReceivable + prepaidExpenses + otherCurrentAssets

    // Calculate non-current assets
    const propertyPlantEquipment = this.getAccountBalance("1500")
    const intangibleAssets = this.getAccountBalance("1600") || 0
    const investments = this.getAccountBalance("1700") || 0
    const otherNonCurrentAssets = this.getAccountBalance("1800") || 0
    const totalNonCurrentAssets = propertyPlantEquipment + intangibleAssets + investments + otherNonCurrentAssets

    const totalAssets = totalCurrentAssets + totalNonCurrentAssets

    // Calculate current liabilities
    const accountsPayable = this.getAccountBalance("2000")
    const accruedExpenses = this.getAccountBalance("2100")
    const deferredRevenue = this.getAccountBalance("2200")
    const shortTermDebt = this.getAccountBalance("2300") || 0
    const otherCurrentLiabilities = this.getAccountBalance("2400") || 0
    const totalCurrentLiabilities =
      accountsPayable + accruedExpenses + deferredRevenue + shortTermDebt + otherCurrentLiabilities

    // Calculate non-current liabilities
    const longTermDebt = this.getAccountBalance("2500") || 0
    const deferredTaxLiabilities = this.getAccountBalance("2600") || 0
    const otherNonCurrentLiabilities = this.getAccountBalance("2700") || 0
    const totalNonCurrentLiabilities = longTermDebt + deferredTaxLiabilities + otherNonCurrentLiabilities

    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities

    // Calculate equity
    const commonStock = this.getAccountBalance("3000")
    const retainedEarnings = this.getAccountBalance("3100")
    const otherEquity = this.getAccountBalance("3200") || 0
    const totalEquity = commonStock + retainedEarnings + otherEquity

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

    return {
      asOfDate,
      currency: "USD",
      assets: {
        currentAssets: {
          cash,
          accountsReceivable,
          prepaidExpenses,
          otherCurrentAssets,
          totalCurrentAssets,
        },
        nonCurrentAssets: {
          propertyPlantEquipment,
          intangibleAssets,
          investments,
          otherNonCurrentAssets,
          totalNonCurrentAssets,
        },
        totalAssets,
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable,
          accruedExpenses,
          deferredRevenue,
          shortTermDebt,
          otherCurrentLiabilities,
          totalCurrentLiabilities,
        },
        nonCurrentLiabilities: {
          longTermDebt,
          deferredTaxLiabilities,
          otherNonCurrentLiabilities,
          totalNonCurrentLiabilities,
        },
        totalLiabilities,
      },
      equity: {
        commonStock,
        retainedEarnings,
        otherEquity,
        totalEquity,
      },
      totalLiabilitiesAndEquity,
    }
  }

  async generateCashFlowStatement(
    startDate: Date,
    endDate: Date,
    type: "monthly" | "quarterly" | "yearly",
  ): Promise<CashFlowStatement> {
    const transactions = Array.from(this.transactions.values()).filter(
      (t) => t.date >= startDate && t.date <= endDate && t.status === "cleared",
    )

    // Get net income from P&L
    const pnl = await this.generateProfitLossStatement(startDate, endDate, type)
    const netIncome = pnl.netIncome

    // Operating activities (simplified calculations)
    const depreciation = 5000 // Assume monthly depreciation
    const amortization = 2000 // Assume monthly amortization
    const changeInAccountsReceivable = -5000 // Assume increase in AR
    const changeInAccountsPayable = 3000 // Assume increase in AP
    const changeInAccruedExpenses = 2000 // Assume increase in accrued expenses
    const changeInDeferredRevenue = 8000 // Assume increase in deferred revenue
    const otherOperatingChanges = 0

    const netCashFromOperating =
      netIncome +
      depreciation +
      amortization +
      changeInAccountsReceivable +
      changeInAccountsPayable +
      changeInAccruedExpenses +
      changeInDeferredRevenue +
      otherOperatingChanges

    // Investing activities
    const capitalExpenditures = -15000 // Equipment purchases
    const acquisitions = 0
    const investments = -5000 // Investment in securities
    const otherInvestingActivities = 0
    const netCashFromInvesting = capitalExpenditures + acquisitions + investments + otherInvestingActivities

    // Financing activities
    const debtProceeds = 0
    const debtRepayments = 0
    const equityIssuance = 0
    const dividendsPaid = 0
    const otherFinancingActivities = 0
    const netCashFromFinancing =
      debtProceeds - debtRepayments + equityIssuance - dividendsPaid + otherFinancingActivities

    const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing
    const beginningCash = 230000 // Previous period ending cash
    const endingCash = beginningCash + netChangeInCash

    return {
      period: { start: startDate, end: endDate, type },
      currency: "USD",
      operatingActivities: {
        netIncome,
        depreciation,
        amortization,
        changeInAccountsReceivable,
        changeInAccountsPayable,
        changeInAccruedExpenses,
        changeInDeferredRevenue,
        otherOperatingChanges,
        netCashFromOperating,
      },
      investingActivities: {
        capitalExpenditures,
        acquisitions,
        investments,
        otherInvestingActivities,
        netCashFromInvesting,
      },
      financingActivities: {
        debtProceeds,
        debtRepayments,
        equityIssuance,
        dividendsPaid,
        otherFinancingActivities,
        netCashFromFinancing,
      },
      netChangeInCash,
      beginningCash,
      endingCash,
    }
  }

  async createFinancialForecast(forecastData: Partial<FinancialForecast>): Promise<FinancialForecast> {
    const forecast: FinancialForecast = {
      id: `forecast-${Date.now()}`,
      name: forecastData.name || "Untitled Forecast",
      description: forecastData.description || "",
      period: forecastData.period!,
      scenario: forecastData.scenario || "realistic",
      assumptions: forecastData.assumptions!,
      projections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: forecastData.createdBy || "system",
    }

    // Generate projections based on assumptions
    const startDate = new Date(forecast.period.start)
    const endDate = new Date(forecast.period.end)
    const intervalMonths = forecast.period.intervals === "monthly" ? 1 : 3

    const currentDate = new Date(startDate)
    const currentCustomers = 1000 // Starting customer base
    const currentEmployees = 25 // Starting employee count
    const baseRevenue = 250000 // Starting monthly revenue

    while (currentDate <= endDate) {
      const monthsFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))

      // Apply growth assumptions
      const revenueGrowth = Math.pow(1 + forecast.assumptions.revenueGrowthRate / 100, monthsFromStart / 12)
      const customerGrowth = Math.pow(1 + forecast.assumptions.customerAcquisitionRate / 100, monthsFromStart / 12)
      const employeeGrowth = Math.pow(1 + forecast.assumptions.headcountGrowthRate / 100, monthsFromStart / 12)

      const projectedRevenue = baseRevenue * revenueGrowth
      const projectedCustomers = Math.floor(currentCustomers * customerGrowth)
      const projectedEmployees = Math.floor(currentEmployees * employeeGrowth)

      // Calculate expenses based on revenue and employee growth
      const projectedExpenses = projectedRevenue * 0.7 + projectedEmployees * 5000 // Base expense ratio + employee costs

      const projectedNetIncome = projectedRevenue - projectedExpenses
      const projectedCashFlow = projectedNetIncome + 10000 // Add back depreciation/amortization

      // Calculate confidence based on how far out the projection is
      const confidence = Math.max(50, 95 - monthsFromStart * 2)

      forecast.projections.push({
        period: currentDate.toISOString().slice(0, 7), // YYYY-MM format
        revenue: Math.round(projectedRevenue),
        expenses: Math.round(projectedExpenses),
        netIncome: Math.round(projectedNetIncome),
        cashFlow: Math.round(projectedCashFlow),
        customers: projectedCustomers,
        employees: projectedEmployees,
        confidence,
      })

      // Move to next interval
      currentDate.setMonth(currentDate.getMonth() + intervalMonths)
    }

    this.forecasts.set(forecast.id, forecast)
    return forecast
  }

  async generateTaxReport(
    period: { start: Date; end: Date; type: "monthly" | "quarterly" | "yearly" },
    jurisdiction: string,
    taxType: "income" | "sales" | "vat" | "payroll" | "property",
  ): Promise<TaxReport> {
    const pnl = await this.generateProfitLossStatement(period.start, period.end, period.type)

    let taxableIncome = 0
    let taxRate = 0

    switch (taxType) {
      case "income":
        taxableIncome = pnl.incomeBeforeTaxes
        taxRate = jurisdiction === "US-Federal" ? 21 : 25 // Corporate tax rates
        break
      case "sales":
        taxableIncome = pnl.revenue.totalRevenue
        taxRate = 8.5 // Average sales tax rate
        break
      case "vat":
        taxableIncome = pnl.revenue.totalRevenue
        taxRate = 20 // Standard VAT rate
        break
      case "payroll":
        taxableIncome = pnl.operatingExpenses.salariesAndBenefits
        taxRate = 15.3 // FICA + unemployment taxes
        break
      case "property":
        taxableIncome = 85000 // Property value
        taxRate = 1.2 // Property tax rate
        break
    }

    const taxOwed = (taxableIncome * taxRate) / 100
    const taxPaid = 0 // Would be calculated from payment records
    const taxDue = taxOwed - taxPaid

    // Calculate filing and payment deadlines
    const filingDeadline = new Date(period.end)
    filingDeadline.setMonth(filingDeadline.getMonth() + 1)
    filingDeadline.setDate(15) // Assume 15th of following month

    const paymentDeadline = new Date(filingDeadline)
    paymentDeadline.setDate(filingDeadline.getDate() + 15) // 15 days after filing

    const report: TaxReport = {
      id: `tax-${Date.now()}`,
      period,
      jurisdiction,
      taxType,
      status: "draft",
      calculations: {
        taxableIncome,
        taxRate,
        taxOwed,
        taxPaid,
        taxDue,
        penalties: 0,
        interest: 0,
      },
      filingDeadline,
      paymentDeadline,
      attachments: [],
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.taxReports.set(report.id, report)
    return report
  }

  async generateTaxReportOld(
    taxYear: number,
    jurisdiction: string,
    reportType: TaxReportingData["reportType"],
  ): Promise<TaxReportingData> {
    const report: TaxReportingData = {
      id: `tax-${taxYear}-${jurisdiction}-${Date.now()}`,
      taxYear,
      jurisdiction,
      reportType,
      status: "draft",
      filingDeadline: new Date(taxYear + 1, 3, 15), // April 15th
      taxableIncome: 1150000,
      taxOwed: 287500,
      taxPaid: 275000,
      refundDue: 0,
      penalties: 0,
      interest: 0,
      deductions: [
        {
          id: "ded-1",
          category: "Business Expenses",
          description: "Software licenses and subscriptions",
          amount: 125000,
          supportingDocuments: ["receipts-software.pdf"],
          approved: true,
          auditTrail: ["Created by system", "Approved by CFO"],
        },
        {
          id: "ded-2",
          category: "R&D Expenses",
          description: "Research and development costs",
          amount: 420000,
          supportingDocuments: ["rd-expenses.pdf"],
          approved: true,
          auditTrail: ["Created by system", "Approved by CFO"],
        },
      ],
      credits: [
        {
          id: "cred-1",
          type: "R&D Tax Credit",
          description: "Research and development tax credit",
          amount: 42000,
          eligibilityVerified: true,
          expirationDate: new Date(taxYear + 5, 11, 31),
        },
      ],
      attachments: ["pl-statement.pdf", "supporting-docs.zip"],
      auditRisk: "low",
      complianceScore: 95,
      lastUpdated: new Date(),
    }

    this.taxReports.set(report.id, report as any)
    return report
  }

  async createFinancialForecastOld(
    name: string,
    period: FinancialForecastOld["period"],
    scenario: FinancialForecastOld["scenario"],
    months: number,
  ): Promise<FinancialForecastOld> {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    const forecast: FinancialForecastOld = {
      id: `forecast-${Date.now()}`,
      name,
      period,
      startDate,
      endDate,
      scenario,
      methodology: "ml_based",
      confidence: this.calculateForecastConfidence(scenario),
      assumptions: [
        {
          id: "ass-1",
          category: "market",
          description: "Cryptocurrency market growth continues",
          impact: "high",
          probability: 0.75,
          quantifiedImpact: 150000,
        },
        {
          id: "ass-2",
          category: "operational",
          description: "New product features increase retention",
          impact: "medium",
          probability: 0.85,
          quantifiedImpact: 85000,
        },
      ],
      projections: {
        revenue: this.generateRevenueProjections(months, scenario),
        expenses: this.generateExpenseProjections(months, scenario),
        profit: this.generateProfitProjections(months, scenario),
        cashFlow: this.generateCashFlowProjections(months, scenario),
      },
      risks: [
        {
          id: "risk-1",
          name: "Market Volatility",
          description: "Cryptocurrency market downturn affecting user activity",
          probability: 0.3,
          impact: 8,
          severity: "high",
          mitigation: ["Diversify revenue streams", "Build cash reserves"],
          owner: "CFO",
          status: "identified",
        },
      ],
      opportunities: [
        {
          id: "opp-1",
          name: "Enterprise Expansion",
          description: "Growing demand for institutional trading solutions",
          probability: 0.7,
          impact: 9,
          priority: "high",
          requirements: ["Enhanced security features", "Dedicated support"],
          timeline: "Q2 2024",
          owner: "VP Sales",
        },
      ],
      sensitivity: [
        {
          variable: "User Growth Rate",
          baseValue: 15,
          scenarios: {
            pessimistic: { change: -5, impact: -125000 },
            optimistic: { change: 10, impact: 285000 },
          },
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.forecasts.set(forecast.id, forecast as any)
    return forecast
  }

  async getFinancialKPIs(): Promise<FinancialKPI[]> {
    // Recalculate KPIs with current data
    const kpis = Array.from(this.kpis.values())

    for (const kpi of kpis) {
      // Update KPI values based on current financial data
      await this.updateKPI(kpi)
    }

    return kpis
  }

  private async updateKPI(kpi: FinancialKPI): Promise<void> {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (kpi.id) {
      case "kpi-1": // MRR
        const currentMRR = this.calculateAccountTotal(
          Array.from(this.transactions.values()).filter((t) => t.date >= thisMonth && t.accountId === "4000"),
          "4000",
        )
        const previousMRR = this.calculateAccountTotal(
          Array.from(this.transactions.values()).filter(
            (t) => t.date >= lastMonth && t.date < thisMonth && t.accountId === "4000",
          ),
          "4000",
        )

        kpi.previousValue = kpi.currentValue
        kpi.currentValue = currentMRR
        kpi.trend = currentMRR > previousMRR ? "up" : currentMRR < previousMRR ? "down" : "stable"
        kpi.status =
          currentMRR >= kpi.targetValue ? "good" : currentMRR >= kpi.targetValue * 0.9 ? "warning" : "critical"
        break

      case "kpi-2": // Gross Margin
        const pnl = await this.generateProfitLossStatement(thisMonth, now, "monthly")
        kpi.previousValue = kpi.currentValue
        kpi.currentValue = pnl.grossMargin
        kpi.trend = pnl.grossMargin > kpi.previousValue ? "up" : pnl.grossMargin < kpi.previousValue ? "down" : "stable"
        kpi.status =
          pnl.grossMargin >= kpi.targetValue
            ? "good"
            : pnl.grossMargin >= kpi.targetValue * 0.9
              ? "warning"
              : "critical"
        break
    }

    kpi.lastCalculated = now
    kpi.history.push({ date: now, value: kpi.currentValue })

    // Keep only last 12 data points
    if (kpi.history.length > 12) {
      kpi.history = kpi.history.slice(-12)
    }
  }

  async getFinancialDashboard(): Promise<{
    currentPeriodPL: ComprehensivePLStatement | null
    taxCompliance: {
      upcomingDeadlines: TaxReportingData[]
      complianceScore: number
      outstandingIssues: number
    }
    forecastSummary: {
      nextQuarterRevenue: number
      nextQuarterProfit: number
      confidenceLevel: number
      keyRisks: string[]
    }
    keyMetrics: {
      monthlyRecurringRevenue: number
      customerAcquisitionCost: number
      lifetimeValue: number
      churnRate: number
      burnRate: number
      cashRunway: number
    }
  }> {
    const currentPL = Array.from(this.plStatements.values())[0] || null
    const taxReports = Array.from(this.taxReports.values())
    const forecasts = Array.from(this.forecasts.values())

    const currentPeriodPL = currentPL // Declare the variable before using it

    return {
      currentPeriodPL,
      taxCompliance: {
        upcomingDeadlines: taxReports.filter((r) => r.filingDeadline > new Date() && r.status === "draft").slice(0, 5) as any,
        complianceScore: 94,
        outstandingIssues: 2,
      },
      forecastSummary: {
        nextQuarterRevenue: 1450000,
        nextQuarterProfit: 185000,
        confidenceLevel: 82,
        keyRisks: ["Market volatility", "Increased competition", "Regulatory changes"],
      },
      keyMetrics: {
        monthlyRecurringRevenue: 410000,
        customerAcquisitionCost: 125,
        lifetimeValue: 2850,
        churnRate: 4.2,
        burnRate: 285000,
        cashRunway: 18,
      },
    }
  }

  private calculateForecastConfidence(scenario: string): number {
    const baseConfidence = { conservative: 85, realistic: 75, optimistic: 60 }
    return baseConfidence[scenario as keyof typeof baseConfidence]
  }

  private generateRevenueProjections(months: number, scenario: string): MonthlyProjection[] {
    const baseRevenue = 1230000
    const growthRates = { conservative: 0.02, realistic: 0.05, optimistic: 0.08 }
    const growth = growthRates[scenario as keyof typeof growthRates]

    return Array.from({ length: months }, (_, i) => ({
      month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      value: Math.round(baseRevenue * Math.pow(1 + growth, i)),
      variance: Math.round(baseRevenue * 0.1),
      confidence: Math.max(60, 90 - i * 2),
      factors: ["User growth", "Feature adoption", "Market conditions"],
    }))
  }

  private generateExpenseProjections(months: number, scenario: string): MonthlyProjection[] {
    const baseExpenses = 1035000
    const growthRates = { conservative: 0.01, realistic: 0.03, optimistic: 0.02 }
    const growth = growthRates[scenario as keyof typeof growthRates]

    return Array.from({ length: months }, (_, i) => ({
      month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      value: Math.round(baseExpenses * Math.pow(1 + growth, i)),
      variance: Math.round(baseExpenses * 0.05),
      confidence: Math.max(70, 95 - i * 1.5),
      factors: ["Headcount growth", "Infrastructure scaling", "Marketing spend"],
    }))
  }

  private generateProfitProjections(months: number, scenario: string): MonthlyProjection[] {
    const revenue = this.generateRevenueProjections(months, scenario)
    const expenses = this.generateExpenseProjections(months, scenario)

    return revenue.map((rev, i) => ({
      month: rev.month,
      value: rev.value - expenses[i].value,
      variance: Math.round((rev.variance + expenses[i].variance) * 1.2),
      confidence: Math.min(rev.confidence, expenses[i].confidence),
      factors: ["Revenue performance", "Cost control", "Market dynamics"],
    }))
  }

  private generateCashFlowProjections(months: number, scenario: string): MonthlyProjection[] {
    const profit = this.generateProfitProjections(months, scenario)

    return profit.map((p) => ({
      month: p.month,
      value: Math.round(p.value * 0.85), // Adjust for working capital changes
      variance: Math.round(p.variance * 1.1),
      confidence: p.confidence - 5,
      factors: ["Profit generation", "Working capital", "Investment activities"],
    }))
  }

  private calculateAccountTotal(transactions: FinancialTransaction[], accountId: string): number {
    return transactions
      .filter((t) => t.accountId === accountId)
      .reduce((total, t) => {
        const account = this.accounts.get(accountId)
        if (!account) return total

        // For revenue accounts, credits increase the balance
        // For expense accounts, debits increase the balance
        if (account.type === "revenue") {
          return total + (t.type === "credit" ? t.amount : -t.amount)
        } else if (account.type === "expense") {
          return total + (t.type === "debit" ? t.amount : -t.amount)
        }

        return total
      }, 0)
  }

  private getAccountBalance(accountId: string): number {
    const account = this.accounts.get(accountId)
    return account ? account.balance : 0
  }

  // Public getters
  getAccounts(): FinancialAccount[] {
    return Array.from(this.accounts.values())
  }

  getTransactions(filters?: {
    accountId?: string
    dateRange?: { start: Date; end: Date }
    status?: string
  }): FinancialTransaction[] {
    let transactions = Array.from(this.transactions.values())

    if (filters) {
      if (filters.accountId) {
        transactions = transactions.filter((t) => t.accountId === filters.accountId)
      }
      if (filters.dateRange) {
        transactions = transactions.filter(
          (t) => t.date >= filters.dateRange!.start && t.date <= filters.dateRange!.end,
        )
      }
      if (filters.status) {
        transactions = transactions.filter((t) => t.status === filters.status)
      }
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  getTaxReports(): TaxReport[] {
    return Array.from(this.taxReports.values())
  }

  getForecasts(): FinancialForecast[] {
    return Array.from(this.forecasts.values())
  }

  getBudgets(): BudgetPlan[] {
    return Array.from(this.budgets.values())
  }
}

export const financialSystem = AdvancedFinancialSystem.getInstance()
export const advancedFinancialSystem = AdvancedFinancialSystem.getInstance()
