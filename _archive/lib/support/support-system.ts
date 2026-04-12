/**
 * Comprehensive Customer Support System
 * Handles tickets, live chat, knowledge base, and support analytics
 */

// Support System Types
export interface SupportTicket {
  id: string
  ticketNumber: string
  userId?: string
  guestInfo?: {
    name: string
    email: string
    phone?: string
  }
  subject: string
  description: string
  category: 'technical' | 'billing' | 'account' | 'trading' | 'general' | 'bug' | 'feature'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed' | 'escalated'
  assignedTo?: string
  assignedBy?: string
  tags: string[]
  attachments: SupportAttachment[]
  messages: SupportMessage[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
  firstResponseTime?: number // minutes
  resolutionTime?: number // minutes
  satisfactionRating?: number // 1-5
  satisfactionFeedback?: string
  escalationLevel: 0 | 1 | 2 | 3 // 0 = normal, 3 = highest escalation
  slaBreached: boolean
  internalNotes: SupportNote[]
  relatedTickets: string[]
  customFields?: Record<string, any>
}

export interface SupportMessage {
  id: string
  ticketId: string
  authorId: string
  authorType: 'user' | 'agent' | 'system'
  message: string
  messageType: 'text' | 'html' | 'system'
  attachments: SupportAttachment[]
  isInternal: boolean
  createdAt: string
  readAt?: string
  editedAt?: string
}

export interface SupportAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedBy: string
  uploadedAt: string
  scanned: boolean
  scanResult?: 'clean' | 'suspicious' | 'malware'
}

export interface SupportNote {
  id: string
  ticketId: string
  agentId: string
  note: string
  noteType: 'general' | 'escalation' | 'resolution' | 'followup'
  createdAt: string
  isPrivate: boolean
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
  role: 'agent' | 'senior_agent' | 'team_lead' | 'manager' | 'admin'
  isActive: boolean
  isOnline: boolean
  lastActiveAt: string
  skills: string[]
  languages: string[]
  maxConcurrentTickets: number
  currentTickets: number
  stats: {
    totalTickets: number
    resolvedTickets: number
    averageResolutionTime: number
    averageRating: number
    totalRatings: number
    firstResponseTime: number
  }
  availability: {
    schedule: Record<string, { start: string; end: string }>
    timezone: string
    breaks: Array<{ start: string; end: string; reason: string }>
  }
}

export interface ChatSession {
  id: string
  userId?: string
  guestInfo?: {
    name: string
    email: string
    sessionId: string
  }
  agentId?: string
  status: 'waiting' | 'active' | 'transferred' | 'ended'
  startedAt: string
  endedAt?: string
  messages: ChatMessage[]
  queuePosition?: number
  waitTime?: number
  department: string
  priority: 'normal' | 'high'
  tags: string[]
  rating?: number
  feedback?: string
  transcript?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  authorId: string
  authorType: 'user' | 'agent' | 'system'
  message: string
  messageType: 'text' | 'file' | 'system' | 'transfer'
  timestamp: string
  readAt?: string
  attachments?: SupportAttachment[]
}

export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  summary: string
  category: string
  subcategory?: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  authorId: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastReviewedAt?: string
  version: number
  isPublic: boolean
  isPinned: boolean
  viewCount: number
  upvotes: number
  downvotes: number
  relatedArticles: string[]
  attachments: SupportAttachment[]
  seoMeta: {
    description: string
    keywords: string[]
    slug: string
  }
}

export interface SupportDepartment {
  id: string
  name: string
  description: string
  email: string
  isActive: boolean
  agents: string[]
  categories: string[]
  autoAssignment: boolean
  businessHours: {
    timezone: string
    schedule: Record<string, { start: string; end: string; isActive: boolean }>
  }
  slaSettings: {
    firstResponseTime: number // minutes
    resolutionTime: Record<string, number> // by priority
  }
  escalationRules: Array<{
    condition: string
    action: string
    delay: number
  }>
}

export interface SupportSLA {
  id: string
  name: string
  description: string
  isActive: boolean
  conditions: Array<{
    field: string
    operator: string
    value: any
  }>
  targets: {
    firstResponseTime: number // minutes
    resolutionTime: number // minutes
    satisfactionScore: number // minimum score
  }
  escalationRules: Array<{
    stage: number
    delay: number // minutes
    action: 'notify' | 'escalate' | 'reassign'
    targetAgents: string[]
  }>
  businessHours?: {
    timezone: string
    schedule: Record<string, { start: string; end: string }>
    holidays: string[]
  }
}

// Support System Configuration
export const SUPPORT_CONFIG = {
  ticketNumberPrefix: 'TKT',
  defaultPriorities: {
    low: { name: 'Low', color: '#10B981', sla: 1440 }, // 24 hours
    medium: { name: 'Medium', color: '#F59E0B', sla: 480 }, // 8 hours
    high: { name: 'High', color: '#EF4444', sla: 120 }, // 2 hours
    urgent: { name: 'Urgent', color: '#DC2626', sla: 60 }, // 1 hour
    critical: { name: 'Critical', color: '#7C2D12', sla: 30 } // 30 minutes
  },
  defaultCategories: [
    { id: 'technical', name: 'Technical Support', description: 'Platform issues, bugs, performance' },
    { id: 'billing', name: 'Billing & Payments', description: 'Subscription, payments, refunds' },
    { id: 'account', name: 'Account Management', description: 'Login, profile, security' },
    { id: 'trading', name: 'Trading Support', description: 'Trading issues, strategies, signals' },
    { id: 'general', name: 'General Inquiry', description: 'General questions and information' },
    { id: 'bug', name: 'Bug Report', description: 'Report software bugs and issues' },
    { id: 'feature', name: 'Feature Request', description: 'Suggest new features and improvements' }
  ],
  chatConfig: {
    maxWaitTime: 30, // minutes
    maxConcurrentChats: 5,
    autoTransferThreshold: 10, // minutes of inactivity
    queueingEnabled: true,
    offlineFormEnabled: true
  },
  notificationSettings: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    slackEnabled: true
  }
}

// Support Management Class
export class SupportManager {
  // Generate unique ticket number
  static generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${SUPPORT_CONFIG.ticketNumberPrefix}-${timestamp}-${random}`
  }

  // Create new support ticket
  static async createTicket(
    ticketData: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber: this.generateTicketNumber(),
      subject: ticketData.subject || 'No Subject',
      description: ticketData.description || '',
      category: ticketData.category || 'general',
      priority: ticketData.priority || 'medium',
      status: 'new',
      tags: ticketData.tags || [],
      attachments: ticketData.attachments || [],
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escalationLevel: 0,
      slaBreached: false,
      internalNotes: [],
      relatedTickets: [],
      ...ticketData
    }

    // Auto-assign based on category and load balancing
    ticket.assignedTo = await this.autoAssignTicket(ticket)

    // Create initial system message
    const systemMessage = this.createSystemMessage(
      ticket.id,
      `Ticket created with priority ${ticket.priority} in ${ticket.category} category`
    )
    ticket.messages.push(systemMessage)

    return ticket
  }

  // Auto-assign ticket to best available agent
  static async autoAssignTicket(ticket: SupportTicket): Promise<string | undefined> {
    // In production, this would query available agents
    const mockAgents = this.getMockAgents()
    
    // Filter agents by category skills and availability
    const availableAgents = mockAgents.filter(agent => 
      agent.isActive && 
      agent.isOnline &&
      agent.currentTickets < agent.maxConcurrentTickets &&
      (agent.skills.includes(ticket.category) || agent.skills.includes('general'))
    )

    if (availableAgents.length === 0) {
      return undefined // Will be assigned manually or queued
    }

    // Load balancing: choose agent with least current tickets
    const bestAgent = availableAgents.reduce((prev, curr) => 
      curr.currentTickets < prev.currentTickets ? curr : prev
    )

    return bestAgent.id
  }

  // Calculate SLA breach status
  static calculateSLAStatus(ticket: SupportTicket): {
    isBreached: boolean
    timeRemaining: number
    breachTime?: number
  } {
    const priorityConfig = SUPPORT_CONFIG.defaultPriorities[ticket.priority]
    const slaMinutes = priorityConfig.sla
    const createdTime = new Date(ticket.createdAt).getTime()
    const currentTime = Date.now()
    const elapsedMinutes = (currentTime - createdTime) / (1000 * 60)

    const isBreached = elapsedMinutes > slaMinutes
    const timeRemaining = slaMinutes - elapsedMinutes
    const breachTime = isBreached ? elapsedMinutes - slaMinutes : undefined

    return { isBreached, timeRemaining, breachTime }
  }

  // Update ticket status and handle workflow
  static async updateTicketStatus(
    ticketId: string,
    newStatus: SupportTicket['status'],
    agentId: string,
    note?: string
  ): Promise<void> {
    // In production, this would update the database
    console.log(`Updating ticket ${ticketId} to status ${newStatus} by agent ${agentId}`)

    if (note) {
      // Add system message for status change
      // const systemMessage = this.createSystemMessage(ticketId, `Status changed to ${newStatus}. ${note}`)
    }

    // Handle workflow automation
    switch (newStatus) {
      case 'resolved':
        // Send satisfaction survey
        await this.sendSatisfactionSurvey(ticketId)
        break
      case 'closed':
        // Archive ticket and update stats
        await this.archiveTicket(ticketId)
        break
      case 'escalated':
        // Notify escalation team
        await this.handleEscalation(ticketId)
        break
    }
  }

  // Create chat session
  static async createChatSession(
    userData: Partial<ChatSession>
  ): Promise<ChatSession> {
    const session: ChatSession = {
      id: `chat_${Date.now()}`,
      status: 'waiting',
      startedAt: new Date().toISOString(),
      messages: [],
      department: userData.department || 'general',
      priority: userData.priority || 'normal',
      tags: userData.tags || [],
      ...userData
    }

    // Try to assign available agent
    const availableAgent = await this.findAvailableChatAgent(session.department)
    if (availableAgent) {
      session.agentId = availableAgent.id
      session.status = 'active'
    } else {
      // Add to queue
      session.queuePosition = await this.getChatQueuePosition(session.department)
    }

    return session
  }

  // Find available chat agent
  static async findAvailableChatAgent(department: string): Promise<SupportAgent | null> {
    const mockAgents = this.getMockAgents()
    const availableAgents = mockAgents.filter(agent =>
      agent.isActive &&
      agent.isOnline &&
      agent.department === department &&
      agent.currentTickets < agent.maxConcurrentTickets
    )

    return availableAgents.length > 0 ? availableAgents[0] : null
  }

  // Create knowledge base article
  static async createKBArticle(
    articleData: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle> {
    const article: KnowledgeBaseArticle = {
      id: `article_${Date.now()}`,
      title: articleData.title || 'Untitled Article',
      content: articleData.content || '',
      summary: articleData.summary || '',
      category: articleData.category || 'general',
      tags: articleData.tags || [],
      status: 'draft',
      authorId: articleData.authorId || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isPublic: false,
      isPinned: false,
      viewCount: 0,
      upvotes: 0,
      downvotes: 0,
      relatedArticles: [],
      attachments: [],
      seoMeta: {
        description: articleData.summary || '',
        keywords: articleData.tags || [],
        slug: this.generateSlug(articleData.title || 'untitled')
      },
      ...articleData
    }

    return article
  }

  // Search knowledge base
  static async searchKnowledgeBase(
    query: string,
    filters?: {
      category?: string
      tags?: string[]
      status?: string
    }
  ): Promise<KnowledgeBaseArticle[]> {
    const mockArticles = this.getMockKBArticles()
    
    // Simple search implementation
    const searchTerms = query.toLowerCase().split(' ')
    
    return mockArticles
      .filter(article => {
        // Text search
        const content = `${article.title} ${article.summary} ${article.content}`.toLowerCase()
        const matchesSearch = searchTerms.some(term => content.includes(term))
        
        // Apply filters
        let matchesFilters = true
        if (filters?.category && article.category !== filters.category) {
          matchesFilters = false
        }
        if (filters?.tags && !filters.tags.some(tag => article.tags.includes(tag))) {
          matchesFilters = false
        }
        if (filters?.status && article.status !== filters.status) {
          matchesFilters = false
        }
        
        return matchesSearch && matchesFilters
      })
      .sort((a, b) => b.viewCount - a.viewCount) // Sort by popularity
  }

  // Generate support analytics
  static generateSupportAnalytics(
    tickets: SupportTicket[],
    period: 'day' | 'week' | 'month' = 'month'
  ) {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }
    
    const periodTickets = tickets.filter(
      ticket => new Date(ticket.createdAt) >= startDate
    )

    const totalTickets = periodTickets.length
    const resolvedTickets = periodTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
    const openTickets = periodTickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length
    const slaBreachedTickets = periodTickets.filter(t => t.slaBreached).length

    const averageResolutionTime = this.calculateAverageResolutionTime(
      periodTickets.filter(t => t.resolutionTime)
    )
    const averageFirstResponseTime = this.calculateAverageFirstResponseTime(
      periodTickets.filter(t => t.firstResponseTime)
    )

    const categoryBreakdown = this.groupTicketsByField(periodTickets, 'category')
    const priorityBreakdown = this.groupTicketsByField(periodTickets, 'priority')
    const statusBreakdown = this.groupTicketsByField(periodTickets, 'status')

    const satisfactionStats = this.calculateSatisfactionStats(
      periodTickets.filter(t => t.satisfactionRating)
    )

    return {
      overview: {
        totalTickets,
        resolvedTickets,
        openTickets,
        resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0,
        slaBreachedTickets,
        slaBreachRate: totalTickets > 0 ? (slaBreachedTickets / totalTickets) * 100 : 0
      },
      performance: {
        averageResolutionTime,
        averageFirstResponseTime,
        ...satisfactionStats
      },
      breakdowns: {
        category: categoryBreakdown,
        priority: priorityBreakdown,
        status: statusBreakdown
      },
      trends: this.generateTicketTrends(periodTickets, startDate, now),
      topIssues: this.identifyTopIssues(periodTickets),
      agentPerformance: this.calculateAgentPerformance(periodTickets)
    }
  }

  // Utility methods
  private static createSystemMessage(ticketId: string, message: string): SupportMessage {
    return {
      id: `msg_${Date.now()}`,
      ticketId,
      authorId: 'system',
      authorType: 'system',
      message,
      messageType: 'system',
      attachments: [],
      isInternal: false,
      createdAt: new Date().toISOString()
    }
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private static calculateAverageResolutionTime(tickets: SupportTicket[]): number {
    if (tickets.length === 0) return 0
    const totalTime = tickets.reduce((sum, ticket) => sum + (ticket.resolutionTime || 0), 0)
    return totalTime / tickets.length
  }

  private static calculateAverageFirstResponseTime(tickets: SupportTicket[]): number {
    if (tickets.length === 0) return 0
    const totalTime = tickets.reduce((sum, ticket) => sum + (ticket.firstResponseTime || 0), 0)
    return totalTime / tickets.length
  }

  private static calculateSatisfactionStats(tickets: SupportTicket[]) {
    if (tickets.length === 0) return { averageRating: 0, totalRatings: 0, satisfactionRate: 0 }
    
    const totalRating = tickets.reduce((sum, ticket) => sum + (ticket.satisfactionRating || 0), 0)
    const averageRating = totalRating / tickets.length
    const satisfiedTickets = tickets.filter(t => (t.satisfactionRating || 0) >= 4).length
    const satisfactionRate = (satisfiedTickets / tickets.length) * 100

    return {
      averageRating,
      totalRatings: tickets.length,
      satisfactionRate
    }
  }

  private static groupTicketsByField(tickets: SupportTicket[], field: keyof SupportTicket): Record<string, number> {
    return tickets.reduce((groups, ticket) => {
      const value = String(ticket[field])
      groups[value] = (groups[value] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }

  private static generateTicketTrends(tickets: SupportTicket[], startDate: Date, endDate: Date) {
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayStart = new Date(current)
      const dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000)
      
      const dayTickets = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt)
        return ticketDate >= dayStart && ticketDate < dayEnd
      })
      
      days.push({
        date: current.toISOString().split('T')[0],
        created: dayTickets.length,
        resolved: dayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  private static identifyTopIssues(tickets: SupportTicket[]) {
    const issueMap = new Map()
    
    tickets.forEach(ticket => {
      const key = `${ticket.category}-${ticket.subject.toLowerCase()}`
      const existing = issueMap.get(key) || { count: 0, category: ticket.category, subject: ticket.subject }
      issueMap.set(key, { ...existing, count: existing.count + 1 })
    })
    
    return Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private static calculateAgentPerformance(tickets: SupportTicket[]) {
    const agentStats = new Map()
    
    tickets.forEach(ticket => {
      if (!ticket.assignedTo) return
      
      const existing = agentStats.get(ticket.assignedTo) || {
        agentId: ticket.assignedTo,
        ticketsHandled: 0,
        resolvedTickets: 0,
        averageResolutionTime: 0,
        satisfactionRating: 0,
        ratingCount: 0
      }
      
      existing.ticketsHandled++
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        existing.resolvedTickets++
      }
      if (ticket.resolutionTime) {
        existing.averageResolutionTime = (existing.averageResolutionTime + ticket.resolutionTime) / 2
      }
      if (ticket.satisfactionRating) {
        existing.satisfactionRating = (existing.satisfactionRating * existing.ratingCount + ticket.satisfactionRating) / (existing.ratingCount + 1)
        existing.ratingCount++
      }
      
      agentStats.set(ticket.assignedTo, existing)
    })
    
    return Array.from(agentStats.values())
  }

  // Mock data methods
  private static getMockAgents(): SupportAgent[] {
    return [
      {
        id: 'agent_001',
        name: 'Sarah Johnson',
        email: 'sarah@nexural.com',
        department: 'technical',
        role: 'senior_agent',
        isActive: true,
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
        skills: ['technical', 'trading', 'general'],
        languages: ['en', 'es'],
        maxConcurrentTickets: 8,
        currentTickets: 3,
        stats: {
          totalTickets: 1247,
          resolvedTickets: 1156,
          averageResolutionTime: 45.6,
          averageRating: 4.7,
          totalRatings: 892,
          firstResponseTime: 12.3
        },
        availability: {
          schedule: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' }
          },
          timezone: 'America/New_York',
          breaks: []
        }
      }
    ]
  }

  private static getMockKBArticles(): KnowledgeBaseArticle[] {
    return [
      {
        id: 'kb_001',
        title: 'How to Set Up Two-Factor Authentication',
        content: 'Detailed guide on setting up 2FA...',
        summary: 'Learn how to secure your account with 2FA',
        category: 'account',
        tags: ['security', '2fa', 'authentication'],
        status: 'published',
        authorId: 'admin_001',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        publishedAt: '2024-01-01T10:00:00Z',
        version: 2,
        isPublic: true,
        isPinned: true,
        viewCount: 1547,
        upvotes: 87,
        downvotes: 3,
        relatedArticles: ['kb_002'],
        attachments: [],
        seoMeta: {
          description: 'Step-by-step guide to enable two-factor authentication',
          keywords: ['2FA', 'security', 'authentication', 'setup'],
          slug: 'how-to-set-up-two-factor-authentication'
        }
      }
    ]
  }

  // Additional methods for specific operations
  private static async sendSatisfactionSurvey(ticketId: string): Promise<void> {
    // Implementation for sending satisfaction surveys
    console.log(`Sending satisfaction survey for ticket ${ticketId}`)
  }

  private static async archiveTicket(ticketId: string): Promise<void> {
    // Implementation for archiving resolved tickets
    console.log(`Archiving ticket ${ticketId}`)
  }

  private static async handleEscalation(ticketId: string): Promise<void> {
    // Implementation for handling ticket escalations
    console.log(`Handling escalation for ticket ${ticketId}`)
  }

  private static async getChatQueuePosition(department: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 5) + 1
  }
}

// Mock data for testing
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket_001',
    ticketNumber: 'TKT-2024-001',
    userId: 'user_001',
    subject: 'Login Issues',
    description: 'Unable to log into my account',
    category: 'account',
    priority: 'high',
    status: 'open',
    assignedTo: 'agent_001',
    tags: ['login', 'urgent'],
    attachments: [],
    messages: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    escalationLevel: 0,
    slaBreached: false,
    internalNotes: [],
    relatedTickets: []
  }
]

export default SupportManager


