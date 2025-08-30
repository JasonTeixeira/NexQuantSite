export interface TicketPriority {
  id: string
  name: string
  level: number
  color: string
  slaHours: number
}

export interface TicketCategory {
  id: string
  name: string
  description: string
  defaultAssignee?: string
  escalationPath: string[]
}

export interface TicketStatus {
  id: string
  name: string
  color: string
  isResolved: boolean
  allowedTransitions: string[]
}

export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    tier: "free" | "premium" | "enterprise"
    timezone: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  tags: string[]
  attachments: TicketAttachment[]
  messages: TicketMessage[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
  sla: {
    responseDeadline: Date
    resolutionDeadline: Date
    firstResponseAt?: Date
    breached: boolean
    breachReason?: string
  }
  satisfaction?: {
    rating: number
    feedback: string
    submittedAt: Date
  }
  internalNotes: InternalNote[]
  escalationHistory: EscalationEvent[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  author: {
    id: string
    name: string
    email: string
    type: "customer" | "agent" | "system"
    avatar?: string
  }
  content: string
  contentType: "text" | "html" | "markdown"
  timestamp: Date
  isInternal: boolean
  attachments: string[]
  readBy: Array<{
    userId: string
    readAt: Date
  }>
}

export interface TicketAttachment {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  uploadedBy: string
  uploadedAt: Date
  isPublic: boolean
}

export interface InternalNote {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  isPrivate: boolean
  mentions: string[]
}

export interface EscalationEvent {
  id: string
  fromAgent?: string
  toAgent: string
  reason: string
  timestamp: Date
  notes?: string
}

export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  author: {
    id: string
    name: string
    email: string
  }
  status: "draft" | "published" | "archived"
  visibility: "public" | "internal" | "premium"
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  views: number
  likes: number
  helpfulVotes: number
  notHelpfulVotes: number
  relatedArticles: string[]
  attachments: string[]
  seoMetadata: {
    metaTitle?: string
    metaDescription?: string
    keywords: string[]
  }
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "busy" | "away"
  skills: string[]
  languages: string[]
  maxConcurrentTickets: number
  currentTicketCount: number
  workingHours: {
    timezone: string
    schedule: Array<{
      day: string
      start: string
      end: string
    }>
  }
  performance: {
    avgResponseTime: number // minutes
    avgResolutionTime: number // hours
    customerSatisfaction: number // 1-5
    ticketsResolved: number
    slaCompliance: number // percentage
    escalationRate: number // percentage
  }
  permissions: string[]
}

export interface HelpDeskMetrics {
  totalTickets: number
  openTickets: number
  pendingTickets: number
  resolvedTickets: number
  closedTickets: number
  avgResponseTime: number
  avgResolutionTime: number
  customerSatisfaction: number
  slaCompliance: number
  firstContactResolution: number
  ticketsByPriority: Record<string, number>
  ticketsByCategory: Record<string, number>
  ticketsByStatus: Record<string, number>
  agentPerformance: SupportAgent[]
  trendsData: Array<{
    date: string
    newTickets: number
    resolvedTickets: number
    avgResponseTime: number
    satisfaction: number
  }>
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  isActive: boolean
  trigger: {
    event: "ticket_created" | "ticket_updated" | "message_received" | "sla_breach"
    conditions: Array<{
      field: string
      operator: "equals" | "contains" | "greater_than" | "less_than"
      value: any
    }>
  }
  actions: Array<{
    type: "assign_agent" | "set_priority" | "add_tag" | "send_email" | "escalate"
    parameters: Record<string, any>
  }>
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
}

export class IntegratedHelpDeskSystem {
  private static instance: IntegratedHelpDeskSystem
  private tickets: Map<string, SupportTicket> = new Map()
  private agents: Map<string, SupportAgent> = new Map()
  private knowledgeBase: Map<string, KnowledgeBaseArticle> = new Map()
  private automationRules: Map<string, AutomationRule> = new Map()
  private priorities: TicketPriority[] = []
  private categories: TicketCategory[] = []
  private statuses: TicketStatus[] = []

  static getInstance(): IntegratedHelpDeskSystem {
    if (!IntegratedHelpDeskSystem.instance) {
      IntegratedHelpDeskSystem.instance = new IntegratedHelpDeskSystem()
      IntegratedHelpDeskSystem.instance.initializeDefaults()
    }
    return IntegratedHelpDeskSystem.instance
  }

  private initializeDefaults(): void {
    // Initialize default priorities
    this.priorities = [
      { id: "low", name: "Low", level: 1, color: "#10B981", slaHours: 48 },
      { id: "medium", name: "Medium", level: 2, color: "#F59E0B", slaHours: 24 },
      { id: "high", name: "High", level: 3, color: "#EF4444", slaHours: 8 },
      { id: "urgent", name: "Urgent", level: 4, color: "#DC2626", slaHours: 4 },
      { id: "critical", name: "Critical", level: 5, color: "#991B1B", slaHours: 1 },
    ]

    // Initialize default categories
    this.categories = [
      {
        id: "technical",
        name: "Technical Support",
        description: "Technical issues and bugs",
        escalationPath: ["tech-lead", "engineering"],
      },
      {
        id: "billing",
        name: "Billing & Payments",
        description: "Payment and subscription issues",
        escalationPath: ["billing-manager", "finance"],
      },
      {
        id: "account",
        name: "Account Management",
        description: "Account access and settings",
        escalationPath: ["account-manager"],
      },
      {
        id: "feature",
        name: "Feature Request",
        description: "New feature suggestions",
        escalationPath: ["product-manager"],
      },
      {
        id: "general",
        name: "General Inquiry",
        description: "General questions and support",
        escalationPath: ["supervisor"],
      },
    ]

    // Initialize default statuses
    this.statuses = [
      { id: "new", name: "New", color: "#3B82F6", isResolved: false, allowedTransitions: ["open", "assigned"] },
      {
        id: "open",
        name: "Open",
        color: "#F59E0B",
        isResolved: false,
        allowedTransitions: ["assigned", "pending", "resolved"],
      },
      {
        id: "assigned",
        name: "Assigned",
        color: "#8B5CF6",
        isResolved: false,
        allowedTransitions: ["in-progress", "pending", "resolved"],
      },
      {
        id: "in-progress",
        name: "In Progress",
        color: "#06B6D4",
        isResolved: false,
        allowedTransitions: ["pending", "resolved", "escalated"],
      },
      {
        id: "pending",
        name: "Pending Customer",
        color: "#F97316",
        isResolved: false,
        allowedTransitions: ["in-progress", "resolved", "closed"],
      },
      {
        id: "escalated",
        name: "Escalated",
        color: "#DC2626",
        isResolved: false,
        allowedTransitions: ["assigned", "resolved"],
      },
      { id: "resolved", name: "Resolved", color: "#10B981", isResolved: true, allowedTransitions: ["closed", "open"] },
      { id: "closed", name: "Closed", color: "#6B7280", isResolved: true, allowedTransitions: ["open"] },
    ]

    // Initialize sample agents
    this.initializeSampleAgents()
    this.initializeSampleKnowledgeBase()
    this.initializeSampleTickets()
  }

  private initializeSampleAgents(): void {
    const sampleAgents: SupportAgent[] = [
      {
        id: "agent-1",
        name: "Sarah Johnson",
        email: "sarah.johnson@nexural.com",
        status: "online",
        skills: ["technical", "billing"],
        languages: ["en", "es"],
        maxConcurrentTickets: 10,
        currentTicketCount: 7,
        workingHours: {
          timezone: "UTC-5",
          schedule: [
            { day: "monday", start: "09:00", end: "17:00" },
            { day: "tuesday", start: "09:00", end: "17:00" },
            { day: "wednesday", start: "09:00", end: "17:00" },
            { day: "thursday", start: "09:00", end: "17:00" },
            { day: "friday", start: "09:00", end: "17:00" },
          ],
        },
        performance: {
          avgResponseTime: 15,
          avgResolutionTime: 4.5,
          customerSatisfaction: 4.7,
          ticketsResolved: 156,
          slaCompliance: 94.2,
          escalationRate: 8.3,
        },
        permissions: ["view_tickets", "update_tickets", "assign_tickets"],
      },
      {
        id: "agent-2",
        name: "Michael Chen",
        email: "michael.chen@nexural.com",
        status: "online",
        skills: ["technical", "account"],
        languages: ["en", "zh"],
        maxConcurrentTickets: 8,
        currentTicketCount: 5,
        workingHours: {
          timezone: "UTC+8",
          schedule: [
            { day: "monday", start: "08:00", end: "16:00" },
            { day: "tuesday", start: "08:00", end: "16:00" },
            { day: "wednesday", start: "08:00", end: "16:00" },
            { day: "thursday", start: "08:00", end: "16:00" },
            { day: "friday", start: "08:00", end: "16:00" },
          ],
        },
        performance: {
          avgResponseTime: 12,
          avgResolutionTime: 3.8,
          customerSatisfaction: 4.8,
          ticketsResolved: 203,
          slaCompliance: 96.7,
          escalationRate: 5.1,
        },
        permissions: ["view_tickets", "update_tickets", "assign_tickets", "escalate_tickets"],
      },
    ]

    sampleAgents.forEach((agent) => this.agents.set(agent.id, agent))
  }

  private initializeSampleKnowledgeBase(): void {
    const sampleArticles: KnowledgeBaseArticle[] = [
      {
        id: "kb-1",
        title: "How to Reset Your Password",
        content:
          '# Password Reset Guide\n\nTo reset your password:\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for reset instructions',
        summary: "Step-by-step guide for resetting your account password",
        category: "account",
        tags: ["password", "login", "account"],
        author: { id: "admin-1", name: "Admin User", email: "admin@nexural.com" },
        status: "published",
        visibility: "public",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        publishedAt: new Date("2024-01-15"),
        views: 1247,
        likes: 89,
        helpfulVotes: 156,
        notHelpfulVotes: 12,
        relatedArticles: ["kb-2", "kb-3"],
        attachments: [],
        seoMetadata: {
          metaTitle: "Password Reset Guide - NEXURAL Help",
          metaDescription: "Learn how to reset your NEXURAL account password in simple steps",
          keywords: ["password reset", "login help", "account recovery"],
        },
      },
      {
        id: "kb-2",
        title: "Understanding Trading Signals",
        content:
          "# Trading Signals Explained\n\nTrading signals are automated recommendations based on technical analysis...",
        summary: "Comprehensive guide to understanding and using trading signals",
        category: "trading",
        tags: ["signals", "trading", "analysis"],
        author: { id: "admin-1", name: "Admin User", email: "admin@nexural.com" },
        status: "published",
        visibility: "premium",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-20"),
        publishedAt: new Date("2024-01-10"),
        views: 892,
        likes: 67,
        helpfulVotes: 134,
        notHelpfulVotes: 8,
        relatedArticles: ["kb-4", "kb-5"],
        attachments: [],
        seoMetadata: {
          metaTitle: "Trading Signals Guide - NEXURAL Help",
          metaDescription: "Learn how to interpret and use trading signals effectively",
          keywords: ["trading signals", "technical analysis", "trading guide"],
        },
      },
    ]

    sampleArticles.forEach((article) => this.knowledgeBase.set(article.id, article))
  }

  private initializeSampleTickets(): void {
    const now = new Date()
    const sampleTickets: SupportTicket[] = [
      {
        id: "TK-001",
        subject: "Unable to access premium features",
        description: "I upgraded to premium but still cannot access the advanced trading signals.",
        status: this.statuses.find((s) => s.id === "open")!,
        priority: this.priorities.find((p) => p.id === "high")!,
        category: this.categories.find((c) => c.id === "technical")!,
        customer: {
          id: "customer-1",
          name: "John Smith",
          email: "john.smith@example.com",
          tier: "premium",
          timezone: "UTC-5",
        },
        assignedTo: {
          id: "agent-1",
          name: "Sarah Johnson",
          email: "sarah.johnson@nexural.com",
        },
        tags: ["premium", "access", "signals"],
        attachments: [],
        messages: [
          {
            id: "msg-1",
            ticketId: "TK-001",
            author: {
              id: "customer-1",
              name: "John Smith",
              email: "john.smith@example.com",
              type: "customer",
            },
            content: "I upgraded to premium but still cannot access the advanced trading signals.",
            contentType: "text",
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            isInternal: false,
            attachments: [],
            readBy: [{ userId: "agent-1", readAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) }],
          },
        ],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        sla: {
          responseDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          resolutionDeadline: new Date(now.getTime() + 8 * 60 * 60 * 1000),
          breached: false,
        },
        internalNotes: [],
        escalationHistory: [],
      },
    ]

    sampleTickets.forEach((ticket) => this.tickets.set(ticket.id, ticket))
  }

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticketId = `TK-${Date.now().toString().slice(-6)}`
    const now = new Date()

    const priority = this.priorities.find((p) => p.id === ticketData.priority?.id) || this.priorities[1]
    const category = this.categories.find((c) => c.id === ticketData.category?.id) || this.categories[4]
    const status = this.statuses.find((s) => s.id === "new")!

    const ticket: SupportTicket = {
      id: ticketId,
      subject: ticketData.subject || "No Subject",
      description: ticketData.description || "",
      status,
      priority,
      category,
      customer: ticketData.customer!,
      tags: ticketData.tags || [],
      attachments: [],
      messages: [],
      createdAt: now,
      updatedAt: now,
      sla: {
        responseDeadline: new Date(now.getTime() + priority.slaHours * 60 * 60 * 1000),
        resolutionDeadline: new Date(now.getTime() + priority.slaHours * 2 * 60 * 60 * 1000),
        breached: false,
      },
      internalNotes: [],
      escalationHistory: [],
    }

    // Auto-assign if possible
    await this.autoAssignTicket(ticket)

    this.tickets.set(ticketId, ticket)
    await this.processAutomationRules(ticket, "ticket_created")

    return ticket
  }

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) {
      throw new Error("Ticket not found")
    }

    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
    }

    if (updates.status?.isResolved && !ticket.resolvedAt) {
      updatedTicket.resolvedAt = new Date()
    }

    this.tickets.set(ticketId, updatedTicket)
    await this.processAutomationRules(updatedTicket, "ticket_updated")

    return updatedTicket
  }

  async addMessage(ticketId: string, messageData: Partial<TicketMessage>): Promise<TicketMessage> {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) {
      throw new Error("Ticket not found")
    }

    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      author: messageData.author!,
      content: messageData.content || "",
      contentType: messageData.contentType || "text",
      timestamp: new Date(),
      isInternal: messageData.isInternal || false,
      attachments: messageData.attachments || [],
      readBy: [],
    }

    ticket.messages.push(message)
    ticket.updatedAt = new Date()

    // Mark first response time
    if (!ticket.sla.firstResponseAt && message.author.type === "agent") {
      ticket.sla.firstResponseAt = message.timestamp
    }

    this.tickets.set(ticketId, ticket)
    await this.processAutomationRules(ticket, "message_received")

    return message
  }

  async getTickets(filters?: {
    status?: string
    priority?: string
    category?: string
    assignedTo?: string
    customer?: string
    search?: string
    dateRange?: { start: Date; end: Date }
  }): Promise<SupportTicket[]> {
    let tickets = Array.from(this.tickets.values())

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter((t) => t.status.id === filters.status)
      }
      if (filters.priority) {
        tickets = tickets.filter((t) => t.priority.id === filters.priority)
      }
      if (filters.category) {
        tickets = tickets.filter((t) => t.category.id === filters.category)
      }
      if (filters.assignedTo) {
        tickets = tickets.filter((t) => t.assignedTo?.id === filters.assignedTo)
      }
      if (filters.customer) {
        tickets = tickets.filter(
          (t) =>
            t.customer.name.toLowerCase().includes(filters.customer!.toLowerCase()) ||
            t.customer.email.toLowerCase().includes(filters.customer!.toLowerCase()),
        )
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        tickets = tickets.filter(
          (t) =>
            t.subject.toLowerCase().includes(search) ||
            t.description.toLowerCase().includes(search) ||
            t.customer.name.toLowerCase().includes(search) ||
            t.customer.email.toLowerCase().includes(search),
        )
      }
      if (filters.dateRange) {
        tickets = tickets.filter(
          (t) => t.createdAt >= filters.dateRange!.start && t.createdAt <= filters.dateRange!.end,
        )
      }
    }

    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getMetrics(): Promise<HelpDeskMetrics> {
    const tickets = Array.from(this.tickets.values())
    const agents = Array.from(this.agents.values())

    const totalTickets = tickets.length
    const openTickets = tickets.filter((t) => !t.status.isResolved).length
    const pendingTickets = tickets.filter((t) => t.status.id === "pending").length
    const resolvedTickets = tickets.filter((t) => t.status.isResolved && !t.closedAt).length
    const closedTickets = tickets.filter((t) => t.closedAt).length

    // Calculate average response time
    const ticketsWithResponse = tickets.filter((t) => t.sla.firstResponseAt)
    const avgResponseTime =
      ticketsWithResponse.length > 0
        ? ticketsWithResponse.reduce((sum, t) => {
            const responseTime = (t.sla.firstResponseAt!.getTime() - t.createdAt.getTime()) / (1000 * 60)
            return sum + responseTime
          }, 0) / ticketsWithResponse.length
        : 0

    // Calculate average resolution time
    const resolvedWithTime = tickets.filter((t) => t.resolvedAt)
    const avgResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, t) => {
            const resolutionTime = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
            return sum + resolutionTime
          }, 0) / resolvedWithTime.length
        : 0

    // Calculate customer satisfaction
    const ticketsWithSatisfaction = tickets.filter((t) => t.satisfaction)
    const customerSatisfaction =
      ticketsWithSatisfaction.length > 0
        ? ticketsWithSatisfaction.reduce((sum, t) => sum + t.satisfaction!.rating, 0) / ticketsWithSatisfaction.length
        : 0

    // Calculate SLA compliance
    const slaCompliant = tickets.filter((t) => !t.sla.breached).length
    const slaCompliance = totalTickets > 0 ? (slaCompliant / totalTickets) * 100 : 0

    // Calculate first contact resolution
    const firstContactResolved = tickets.filter((t) => t.status.isResolved && t.messages.length <= 2).length
    const firstContactResolution = totalTickets > 0 ? (firstContactResolved / totalTickets) * 100 : 0

    // Group tickets by various dimensions
    const ticketsByPriority = tickets.reduce(
      (acc, t) => {
        acc[t.priority.name] = (acc[t.priority.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const ticketsByCategory = tickets.reduce(
      (acc, t) => {
        acc[t.category.name] = (acc[t.category.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const ticketsByStatus = tickets.reduce(
      (acc, t) => {
        acc[t.status.name] = (acc[t.status.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Generate trends data (last 7 days)
    const trendsData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayTickets = tickets.filter((t) => t.createdAt.toISOString().split("T")[0] === dateStr)
      const dayResolved = tickets.filter((t) => t.resolvedAt && t.resolvedAt.toISOString().split("T")[0] === dateStr)

      trendsData.push({
        date: dateStr,
        newTickets: dayTickets.length,
        resolvedTickets: dayResolved.length,
        avgResponseTime: dayTickets.length > 0 ? avgResponseTime : 0,
        satisfaction: dayResolved.length > 0 ? customerSatisfaction : 0,
      })
    }

    return {
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedTickets,
      closedTickets,
      avgResponseTime,
      avgResolutionTime,
      customerSatisfaction,
      slaCompliance,
      firstContactResolution,
      ticketsByPriority,
      ticketsByCategory,
      ticketsByStatus,
      agentPerformance: agents,
      trendsData,
    }
  }

  async createKnowledgeBaseArticle(articleData: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    const article: KnowledgeBaseArticle = {
      id: `kb-${Date.now()}`,
      title: articleData.title || "Untitled Article",
      content: articleData.content || "",
      summary: articleData.summary || "",
      category: articleData.category || "general",
      tags: articleData.tags || [],
      author: articleData.author!,
      status: articleData.status || "draft",
      visibility: articleData.visibility || "public",
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      relatedArticles: [],
      attachments: [],
      seoMetadata: {
        keywords: articleData.seoMetadata?.keywords || [],
      },
    }

    if (article.status === "published") {
      article.publishedAt = new Date()
    }

    this.knowledgeBase.set(article.id, article)
    return article
  }

  async searchKnowledgeBase(
    query: string,
    filters?: {
      category?: string
      visibility?: string
      tags?: string[]
    },
  ): Promise<KnowledgeBaseArticle[]> {
    let articles = Array.from(this.knowledgeBase.values()).filter((a) => a.status === "published")

    if (filters) {
      if (filters.category) {
        articles = articles.filter((a) => a.category === filters.category)
      }
      if (filters.visibility) {
        articles = articles.filter((a) => a.visibility === filters.visibility)
      }
      if (filters.tags && filters.tags.length > 0) {
        articles = articles.filter((a) => filters.tags!.some((tag) => a.tags.includes(tag)))
      }
    }

    if (query) {
      const searchTerm = query.toLowerCase()
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm) ||
          a.content.toLowerCase().includes(searchTerm) ||
          a.summary.toLowerCase().includes(searchTerm) ||
          a.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    return articles.sort((a, b) => b.views - a.views)
  }

  private async autoAssignTicket(ticket: SupportTicket): Promise<void> {
    const availableAgents = Array.from(this.agents.values())
      .filter(
        (agent) =>
          agent.status === "online" &&
          agent.currentTicketCount < agent.maxConcurrentTickets &&
          agent.skills.includes(ticket.category.id),
      )
      .sort((a, b) => a.currentTicketCount - b.currentTicketCount)

    if (availableAgents.length > 0) {
      const assignedAgent = availableAgents[0]
      ticket.assignedTo = {
        id: assignedAgent.id,
        name: assignedAgent.name,
        email: assignedAgent.email,
        avatar: assignedAgent.avatar,
      }
      ticket.status = this.statuses.find((s) => s.id === "assigned")!
      assignedAgent.currentTicketCount++
    }
  }

  private async processAutomationRules(ticket: SupportTicket, event: string): Promise<void> {
    const rules = Array.from(this.automationRules.values()).filter(
      (rule) => rule.isActive && rule.trigger.event === event,
    )

    for (const rule of rules) {
      const conditionsMet = rule.trigger.conditions.every((condition) => {
        const fieldValue = this.getTicketFieldValue(ticket, condition.field)
        return this.evaluateCondition(fieldValue, condition.operator, condition.value)
      })

      if (conditionsMet) {
        await this.executeRuleActions(ticket, rule.actions)
        rule.lastTriggered = new Date()
        rule.triggerCount++
      }
    }
  }

  private getTicketFieldValue(ticket: SupportTicket, field: string): any {
    switch (field) {
      case "priority":
        return ticket.priority.id
      case "category":
        return ticket.category.id
      case "status":
        return ticket.status.id
      case "customer_tier":
        return ticket.customer.tier
      case "subject":
        return ticket.subject
      case "description":
        return ticket.description
      default:
        return null
    }
  }

  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case "equals":
        return fieldValue === value
      case "contains":
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
      case "greater_than":
        return Number(fieldValue) > Number(value)
      case "less_than":
        return Number(fieldValue) < Number(value)
      default:
        return false
    }
  }

  private async executeRuleActions(ticket: SupportTicket, actions: AutomationRule["actions"]): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case "assign_agent":
          const agent = this.agents.get(action.parameters.agentId)
          if (agent && agent.currentTicketCount < agent.maxConcurrentTickets) {
            ticket.assignedTo = {
              id: agent.id,
              name: agent.name,
              email: agent.email,
              avatar: agent.avatar,
            }
            agent.currentTicketCount++
          }
          break
        case "set_priority":
          const priority = this.priorities.find((p) => p.id === action.parameters.priorityId)
          if (priority) {
            ticket.priority = priority
          }
          break
        case "add_tag":
          if (!ticket.tags.includes(action.parameters.tag)) {
            ticket.tags.push(action.parameters.tag)
          }
          break
        case "escalate":
          ticket.status = this.statuses.find((s) => s.id === "escalated")!
          ticket.escalationHistory.push({
            id: `esc-${Date.now()}`,
            fromAgent: ticket.assignedTo?.id,
            toAgent: action.parameters.toAgent,
            reason: action.parameters.reason || "Automated escalation",
            timestamp: new Date(),
          })
          break
      }
    }
  }

  // Getters for configuration data
  getPriorities(): TicketPriority[] {
    return this.priorities
  }

  getCategories(): TicketCategory[] {
    return this.categories
  }

  getStatuses(): TicketStatus[] {
    return this.statuses
  }

  getAgents(): SupportAgent[] {
    return Array.from(this.agents.values())
  }
}

export const helpDeskSystem = IntegratedHelpDeskSystem.getInstance()
