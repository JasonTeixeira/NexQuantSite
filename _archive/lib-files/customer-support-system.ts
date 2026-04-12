export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated"
  priority: "low" | "medium" | "high" | "urgent" | "critical"
  category: "technical" | "billing" | "general" | "feature-request" | "bug-report"
  customer: {
    id: string
    name: string
    email: string
    tier: "free" | "premium" | "enterprise"
    timezone: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  tags: string[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  sla: {
    responseDeadline: Date
    resolutionDeadline: Date
    breached: boolean
  }
  messages: SupportMessage[]
  attachments: SupportAttachment[]
  satisfaction?: {
    rating: number
    feedback: string
    submittedAt: Date
  }
}

export interface SupportMessage {
  id: string
  ticketId: string
  author: {
    id: string
    name: string
    email: string
    type: "customer" | "agent" | "system"
  }
  content: string
  timestamp: Date
  isInternal: boolean
  attachments: string[]
}

export interface SupportAttachment {
  id: string
  filename: string
  size: number
  type: string
  url: string
  uploadedBy: string
  uploadedAt: Date
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  status: "online" | "offline" | "busy" | "away"
  skills: string[]
  languages: string[]
  activeTickets: number
  maxTickets: number
  performance: {
    avgResponseTime: number
    avgResolutionTime: number
    customerSatisfaction: number
    ticketsResolved: number
    slaCompliance: number
  }
}

export interface SupportMetrics {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResponseTime: number
  avgResolutionTime: number
  customerSatisfaction: number
  slaCompliance: number
  ticketsByPriority: Record<string, number>
  ticketsByCategory: Record<string, number>
  agentPerformance: SupportAgent[]
}

export class CustomerSupportSystem {
  private static instance: CustomerSupportSystem
  private tickets: Map<string, SupportTicket> = new Map()
  private agents: Map<string, SupportAgent> = new Map()
  private metrics: SupportMetrics | null = null

  static getInstance(): CustomerSupportSystem {
    if (!CustomerSupportSystem.instance) {
      CustomerSupportSystem.instance = new CustomerSupportSystem()
    }
    return CustomerSupportSystem.instance
  }

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: `TK-${Date.now()}`,
      subject: ticketData.subject || "",
      description: ticketData.description || "",
      status: "open",
      priority: ticketData.priority || "medium",
      category: ticketData.category || "general",
      customer: ticketData.customer!,
      tags: ticketData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      sla: this.calculateSLA(ticketData.priority || "medium", ticketData.customer?.tier || "free"),
      messages: [],
      attachments: [],
    }

    this.tickets.set(ticket.id, ticket)
    await this.autoAssignTicket(ticket)
    await this.sendNotifications(ticket, "created")

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

    if (updates.status === "resolved" && !ticket.resolvedAt) {
      updatedTicket.resolvedAt = new Date()
    }

    this.tickets.set(ticketId, updatedTicket)
    await this.sendNotifications(updatedTicket, "updated")

    return updatedTicket
  }

  async addMessage(ticketId: string, messageData: Partial<SupportMessage>): Promise<SupportMessage> {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) {
      throw new Error("Ticket not found")
    }

    const message: SupportMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      author: messageData.author!,
      content: messageData.content || "",
      timestamp: new Date(),
      isInternal: messageData.isInternal || false,
      attachments: messageData.attachments || [],
    }

    ticket.messages.push(message)
    ticket.updatedAt = new Date()

    this.tickets.set(ticketId, ticket)
    await this.sendNotifications(ticket, "message_added")

    return message
  }

  async getTickets(filters?: {
    status?: string
    priority?: string
    assignedTo?: string
    category?: string
    search?: string
  }): Promise<SupportTicket[]> {
    let tickets = Array.from(this.tickets.values())

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter((t) => t.status === filters.status)
      }
      if (filters.priority) {
        tickets = tickets.filter((t) => t.priority === filters.priority)
      }
      if (filters.assignedTo) {
        tickets = tickets.filter((t) => t.assignedTo?.id === filters.assignedTo)
      }
      if (filters.category) {
        tickets = tickets.filter((t) => t.category === filters.category)
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
    }

    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getMetrics(): Promise<SupportMetrics> {
    if (this.metrics) {
      return this.metrics
    }

    const tickets = Array.from(this.tickets.values())
    const agents = Array.from(this.agents.values())

    const totalTickets = tickets.length
    const openTickets = tickets.filter((t) => ["open", "in-progress"].includes(t.status)).length
    const resolvedTickets = tickets.filter((t) => t.status === "resolved").length

    const resolvedWithTime = tickets.filter((t) => t.resolvedAt)
    const avgResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, t) => {
            const time = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
            return sum + time
          }, 0) / resolvedWithTime.length
        : 0

    const ticketsWithMessages = tickets.filter((t) => t.messages.length > 0)
    const avgResponseTime =
      ticketsWithMessages.length > 0
        ? ticketsWithMessages.reduce((sum, t) => {
            const firstResponse = t.messages.find((m) => m.author.type === "agent")
            if (firstResponse) {
              const time = (firstResponse.timestamp.getTime() - t.createdAt.getTime()) / (1000 * 60)
              return sum + time
            }
            return sum
          }, 0) / ticketsWithMessages.length
        : 0

    const satisfactionRatings = tickets.filter((t) => t.satisfaction)
    const customerSatisfaction =
      satisfactionRatings.length > 0
        ? satisfactionRatings.reduce((sum, t) => sum + t.satisfaction!.rating, 0) / satisfactionRatings.length
        : 0

    const slaCompliant = tickets.filter((t) => !t.sla.breached).length
    const slaCompliance = totalTickets > 0 ? (slaCompliant / totalTickets) * 100 : 0

    const ticketsByPriority = tickets.reduce(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const ticketsByCategory = tickets.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    this.metrics = {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResponseTime,
      avgResolutionTime,
      customerSatisfaction,
      slaCompliance,
      ticketsByPriority,
      ticketsByCategory,
      agentPerformance: agents,
    }

    return this.metrics
  }

  private calculateSLA(priority: string, tier: string) {
    const slaMatrix = {
      critical: { enterprise: 15, premium: 30, free: 60 },
      urgent: { enterprise: 30, premium: 60, free: 120 },
      high: { enterprise: 60, premium: 120, free: 240 },
      medium: { enterprise: 120, premium: 240, free: 480 },
      low: { enterprise: 240, premium: 480, free: 960 },
    }

    const responseMinutes = slaMatrix[priority as keyof typeof slaMatrix][tier as keyof typeof slaMatrix.critical]
    const resolutionHours = (responseMinutes / 60) * 8 // 8x response time for resolution

    const now = new Date()
    const responseDeadline = new Date(now.getTime() + responseMinutes * 60 * 1000)
    const resolutionDeadline = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000)

    return {
      responseDeadline,
      resolutionDeadline,
      breached: false,
    }
  }

  private async autoAssignTicket(ticket: SupportTicket): Promise<void> {
    const availableAgents = Array.from(this.agents.values())
      .filter(
        (agent) =>
          agent.status === "online" && agent.activeTickets < agent.maxTickets && agent.skills.includes(ticket.category),
      )
      .sort((a, b) => a.activeTickets - b.activeTickets)

    if (availableAgents.length > 0) {
      const assignedAgent = availableAgents[0]
      ticket.assignedTo = {
        id: assignedAgent.id,
        name: assignedAgent.name,
        email: assignedAgent.email,
      }
      assignedAgent.activeTickets++
    }
  }

  private async sendNotifications(ticket: SupportTicket, event: string): Promise<void> {
    // Implement notification logic (email, SMS, push, etc.)
    console.log(`Notification sent for ticket ${ticket.id}: ${event}`)
  }
}

export const supportSystem = CustomerSupportSystem.getInstance()
