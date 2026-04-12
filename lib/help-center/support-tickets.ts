/**
 * Support Ticket System - Professional Grade
 * Handles ticket creation, management, and customer support workflows
 */

export interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  userId: string
  userInfo: {
    name: string
    email: string
    avatar?: string
    subscription: string
    joinDate: string
  }
  assignedTo?: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  tags: string[]
  attachments: {
    id: string
    name: string
    url: string
    type: string
    size: number
    uploadedBy: string
    uploadedAt: string
  }[]
  messages: TicketMessage[]
  resolution?: {
    solution: string
    resolvedBy: string
    resolvedAt: string
    satisfaction?: number // 1-5 rating
    feedback?: string
  }
  metadata: {
    userAgent?: string
    ipAddress?: string
    sessionId?: string
    errorLogs?: string[]
    reproductionSteps?: string[]
  }
  createdAt: string
  updatedAt: string
  lastResponseAt?: string
  firstResponseTime?: number // minutes
  resolutionTime?: number // minutes
  slaDeadline?: string
  escalated: boolean
  escalatedAt?: string
  escalatedReason?: string
  relatedTickets: string[]
  internalNotes: {
    id: string
    note: string
    author: string
    createdAt: string
    isPrivate: boolean
  }[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  content: string
  author: {
    id: string
    name: string
    role: 'user' | 'agent' | 'system'
    avatar?: string
  }
  type: 'message' | 'status_change' | 'assignment' | 'escalation' | 'resolution'
  isInternal: boolean
  attachments: string[]
  createdAt: string
  updatedAt?: string
  readBy: {
    userId: string
    readAt: string
  }[]
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'agent' | 'senior_agent' | 'supervisor' | 'admin'
  specializations: TicketCategory[]
  isOnline: boolean
  currentTickets: number
  maxTickets: number
  avgResponseTime: number // minutes
  avgResolutionTime: number // hours
  satisfactionRating: number // 1-5
  totalTicketsResolved: number
  createdAt: string
  lastActiveAt: string
  workingHours: {
    timezone: string
    schedule: {
      day: string
      start: string
      end: string
      isWorking: boolean
    }[]
  }
  autoAssignment: boolean
  notifications: {
    email: boolean
    browser: boolean
    mobile: boolean
  }
}

export type TicketCategory = 
  | 'account_access'
  | 'billing_payment'
  | 'trading_platform'
  | 'technical_issue'
  | 'feature_request'
  | 'api_integration'
  | 'security_concern'
  | 'general_inquiry'
  | 'bug_report'
  | 'compliance_legal'

export type TicketPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical'

export type TicketStatus = 
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting_user'
  | 'waiting_internal'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'cancelled'

export interface TicketTemplate {
  id: string
  name: string
  category: TicketCategory
  subject: string
  content: string
  priority: TicketPriority
  tags: string[]
  isActive: boolean
  usage: number
  createdAt: string
  updatedAt: string
}

export interface SupportMetrics {
  totalTickets: number
  openTickets: number
  avgFirstResponseTime: number // minutes
  avgResolutionTime: number // hours
  satisfactionScore: number // 1-5
  ticketsByStatus: Record<TicketStatus, number>
  ticketsByCategory: Record<TicketCategory, number>
  ticketsByPriority: Record<TicketPriority, number>
  agentPerformance: {
    agentId: string
    name: string
    ticketsHandled: number
    avgResponseTime: number
    avgResolutionTime: number
    satisfactionScore: number
  }[]
  slaCompliance: {
    firstResponse: number // percentage
    resolution: number // percentage
  }
  trendsLastWeek: {
    newTickets: number
    resolvedTickets: number
    avgResponseTime: number
    satisfactionScore: number
  }
}

// Mock Data
const MOCK_AGENTS: SupportAgent[] = [
  {
    id: 'agent_1',
    name: 'Sarah Johnson',
    email: 'sarah@nexural.com',
    avatar: '/avatars/agent-sarah.jpg',
    role: 'senior_agent',
    specializations: ['trading_platform', 'technical_issue', 'api_integration'],
    isOnline: true,
    currentTickets: 8,
    maxTickets: 15,
    avgResponseTime: 12,
    avgResolutionTime: 4.2,
    satisfactionRating: 4.8,
    totalTicketsResolved: 1247,
    createdAt: '2023-06-01T00:00:00.000Z',
    lastActiveAt: '2024-01-15T10:30:00.000Z',
    workingHours: {
      timezone: 'America/New_York',
      schedule: [
        { day: 'monday', start: '09:00', end: '17:00', isWorking: true },
        { day: 'tuesday', start: '09:00', end: '17:00', isWorking: true },
        { day: 'wednesday', start: '09:00', end: '17:00', isWorking: true },
        { day: 'thursday', start: '09:00', end: '17:00', isWorking: true },
        { day: 'friday', start: '09:00', end: '17:00', isWorking: true },
        { day: 'saturday', start: '00:00', end: '00:00', isWorking: false },
        { day: 'sunday', start: '00:00', end: '00:00', isWorking: false }
      ]
    },
    autoAssignment: true,
    notifications: {
      email: true,
      browser: true,
      mobile: false
    }
  },
  {
    id: 'agent_2',
    name: 'Michael Chen',
    email: 'michael@nexural.com',
    role: 'agent',
    specializations: ['account_access', 'billing_payment', 'general_inquiry'],
    isOnline: true,
    currentTickets: 6,
    maxTickets: 12,
    avgResponseTime: 15,
    avgResolutionTime: 3.8,
    satisfactionRating: 4.6,
    totalTicketsResolved: 892,
    createdAt: '2023-08-15T00:00:00.000Z',
    lastActiveAt: '2024-01-15T10:25:00.000Z',
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: [
        { day: 'monday', start: '10:00', end: '18:00', isWorking: true },
        { day: 'tuesday', start: '10:00', end: '18:00', isWorking: true },
        { day: 'wednesday', start: '10:00', end: '18:00', isWorking: true },
        { day: 'thursday', start: '10:00', end: '18:00', isWorking: true },
        { day: 'friday', start: '10:00', end: '18:00', isWorking: true },
        { day: 'saturday', start: '00:00', end: '00:00', isWorking: false },
        { day: 'sunday', start: '00:00', end: '00:00', isWorking: false }
      ]
    },
    autoAssignment: true,
    notifications: {
      email: true,
      browser: true,
      mobile: true
    }
  }
]

let mockTickets: SupportTicket[] = [
  {
    id: 'ticket_1',
    ticketNumber: 'NEX-2024-001247',
    subject: 'Unable to connect to live trading',
    description: 'Hi, I\'m having issues connecting my account to live trading. The platform keeps showing "Connection Error" and I can\'t execute any trades. This started yesterday evening after the platform update.',
    category: 'trading_platform',
    priority: 'high',
    status: 'assigned',
    userId: 'user_1',
    userInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/avatars/user-john.jpg',
      subscription: 'Premium',
      joinDate: '2023-12-01T00:00:00.000Z'
    },
    assignedTo: {
      id: 'agent_1',
      name: 'Sarah Johnson',
      role: 'senior_agent'
    },
    tags: ['connection', 'live-trading', 'platform-update'],
    attachments: [
      {
        id: 'att_1',
        name: 'error-screenshot.png',
        url: '/attachments/error-screenshot.png',
        type: 'image/png',
        size: 245760,
        uploadedBy: 'user_1',
        uploadedAt: '2024-01-15T09:30:00.000Z'
      }
    ],
    messages: [
      {
        id: 'msg_1',
        ticketId: 'ticket_1',
        content: 'Hi, I\'m having issues connecting my account to live trading. The platform keeps showing "Connection Error" and I can\'t execute any trades. This started yesterday evening after the platform update.',
        author: {
          id: 'user_1',
          name: 'John Doe',
          role: 'user'
        },
        type: 'message',
        isInternal: false,
        attachments: ['att_1'],
        createdAt: '2024-01-15T09:30:00.000Z',
        readBy: [
          { userId: 'agent_1', readAt: '2024-01-15T09:45:00.000Z' }
        ]
      },
      {
        id: 'msg_2',
        ticketId: 'ticket_1',
        content: 'Thank you for contacting support. I see you\'re experiencing connection issues after our latest update. Let me investigate this for you. Could you please try clearing your browser cache and cookies, then restart the application?',
        author: {
          id: 'agent_1',
          name: 'Sarah Johnson',
          role: 'agent'
        },
        type: 'message',
        isInternal: false,
        attachments: [],
        createdAt: '2024-01-15T09:45:00.000Z',
        readBy: [
          { userId: 'user_1', readAt: '2024-01-15T10:15:00.000Z' }
        ]
      }
    ],
    metadata: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.100',
      sessionId: 'sess_abc123',
      errorLogs: ['Connection timeout after 30s', 'WebSocket closed with code 1006'],
      reproductionSteps: [
        'Login to platform',
        'Navigate to live trading',
        'Click "Connect" button',
        'Error appears after 30 seconds'
      ]
    },
    createdAt: '2024-01-15T09:30:00.000Z',
    updatedAt: '2024-01-15T10:15:00.000Z',
    lastResponseAt: '2024-01-15T09:45:00.000Z',
    firstResponseTime: 15,
    slaDeadline: '2024-01-15T17:30:00.000Z',
    escalated: false,
    relatedTickets: [],
    internalNotes: [
      {
        id: 'note_1',
        note: 'User is on Premium plan, high priority. Platform update yesterday may have caused WebSocket connection issues.',
        author: 'agent_1',
        createdAt: '2024-01-15T09:45:00.000Z',
        isPrivate: true
      }
    ]
  }
]

let ticketCounter = 1247

// Support Ticket Functions
export const createSupportTicket = (ticketData: {
  subject: string
  description: string
  category: TicketCategory
  priority?: TicketPriority
  userId: string
  userInfo: SupportTicket['userInfo']
  attachments?: File[]
  metadata?: Partial<SupportTicket['metadata']>
}): { success: boolean, message: string, ticket?: SupportTicket } => {
  try {
    ticketCounter++
    
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber: `NEX-2024-${ticketCounter.toString().padStart(6, '0')}`,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || determinePriority(ticketData.category, ticketData.description),
      status: 'open',
      userId: ticketData.userId,
      userInfo: ticketData.userInfo,
      tags: generateTags(ticketData.category, ticketData.description),
      attachments: [], // Would process files in real implementation
      messages: [
        {
          id: `msg_${Date.now()}`,
          ticketId: `ticket_${Date.now()}`,
          content: ticketData.description,
          author: {
            id: ticketData.userId,
            name: ticketData.userInfo.name,
            role: 'user'
          },
          type: 'message',
          isInternal: false,
          attachments: [],
          createdAt: new Date().toISOString(),
          readBy: []
        }
      ],
      metadata: {
        ...ticketData.metadata,
        ipAddress: '192.168.1.100', // Would get real IP
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escalated: false,
      relatedTickets: [],
      internalNotes: []
    }

    // Auto-assign based on category and agent availability
    const assignedAgent = autoAssignTicket(newTicket)
    if (assignedAgent) {
      newTicket.assignedTo = assignedAgent
      newTicket.status = 'assigned'
    }

    mockTickets.push(newTicket)
    
    return { 
      success: true, 
      message: `Support ticket ${newTicket.ticketNumber} created successfully`,
      ticket: newTicket
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to create support ticket' 
    }
  }
}

export const getUserTickets = (userId: string, status?: TicketStatus): SupportTicket[] => {
  return mockTickets
    .filter(ticket => ticket.userId === userId && (!status || ticket.status === status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const getTicketById = (ticketId: string): SupportTicket | null => {
  return mockTickets.find(ticket => ticket.id === ticketId) || null
}

export const addTicketMessage = (
  ticketId: string, 
  content: string, 
  authorId: string, 
  isInternal: boolean = false
): { success: boolean, message: string } => {
  try {
    const ticketIndex = mockTickets.findIndex(ticket => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return { success: false, message: 'Ticket not found' }
    }

    const ticket = mockTickets[ticketIndex]
    const author = ticket.userId === authorId 
      ? { id: authorId, name: ticket.userInfo.name, role: 'user' as const }
      : MOCK_AGENTS.find(agent => agent.id === authorId)
      ? { 
          id: authorId, 
          name: MOCK_AGENTS.find(agent => agent.id === authorId)!.name, 
          role: 'agent' as const 
        }
      : { id: authorId, name: 'System', role: 'system' as const }

    const newMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      content,
      author,
      type: 'message',
      isInternal,
      attachments: [],
      createdAt: new Date().toISOString(),
      readBy: []
    }

    ticket.messages.push(newMessage)
    ticket.updatedAt = new Date().toISOString()
    ticket.lastResponseAt = new Date().toISOString()

    return { success: true, message: 'Message added successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to add message' }
  }
}

export const updateTicketStatus = (
  ticketId: string, 
  status: TicketStatus,
  updatedBy: string,
  reason?: string
): { success: boolean, message: string } => {
  try {
    const ticketIndex = mockTickets.findIndex(ticket => ticket.id === ticketId)
    if (ticketIndex === -1) {
      return { success: false, message: 'Ticket not found' }
    }

    const ticket = mockTickets[ticketIndex]
    const oldStatus = ticket.status
    
    ticket.status = status
    ticket.updatedAt = new Date().toISOString()

    // Add status change message
    const statusMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      content: `Status changed from ${oldStatus} to ${status}${reason ? ': ' + reason : ''}`,
      author: {
        id: updatedBy,
        name: MOCK_AGENTS.find(a => a.id === updatedBy)?.name || 'System',
        role: 'system'
      },
      type: 'status_change',
      isInternal: false,
      attachments: [],
      createdAt: new Date().toISOString(),
      readBy: []
    }

    ticket.messages.push(statusMessage)

    // Handle resolution
    if (status === 'resolved') {
      ticket.resolution = {
        solution: 'Ticket resolved',
        resolvedBy: updatedBy,
        resolvedAt: new Date().toISOString()
      }
      
      if (ticket.createdAt) {
        const resolutionTime = Math.round(
          (new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60)
        )
        ticket.resolutionTime = resolutionTime
      }
    }

    return { success: true, message: 'Ticket status updated successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to update ticket status' }
  }
}

export const getSupportMetrics = (): SupportMetrics => {
  const now = new Date().getTime()
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000)

  const totalTickets = mockTickets.length
  const openTickets = mockTickets.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length
  
  const resolvedTickets = mockTickets.filter(t => t.status === 'resolved')
  const avgResolutionTime = resolvedTickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / resolvedTickets.length / 60 // hours
  
  const ticketsWithFirstResponse = mockTickets.filter(t => t.firstResponseTime)
  const avgFirstResponseTime = ticketsWithFirstResponse.reduce((sum, t) => sum + (t.firstResponseTime || 0), 0) / ticketsWithFirstResponse.length

  return {
    totalTickets,
    openTickets,
    avgFirstResponseTime,
    avgResolutionTime,
    satisfactionScore: 4.6,
    ticketsByStatus: {
      open: mockTickets.filter(t => t.status === 'open').length,
      assigned: mockTickets.filter(t => t.status === 'assigned').length,
      in_progress: mockTickets.filter(t => t.status === 'in_progress').length,
      waiting_user: mockTickets.filter(t => t.status === 'waiting_user').length,
      waiting_internal: mockTickets.filter(t => t.status === 'waiting_internal').length,
      escalated: mockTickets.filter(t => t.status === 'escalated').length,
      resolved: mockTickets.filter(t => t.status === 'resolved').length,
      closed: mockTickets.filter(t => t.status === 'closed').length,
      cancelled: mockTickets.filter(t => t.status === 'cancelled').length
    },
    ticketsByCategory: {
      account_access: mockTickets.filter(t => t.category === 'account_access').length,
      billing_payment: mockTickets.filter(t => t.category === 'billing_payment').length,
      trading_platform: mockTickets.filter(t => t.category === 'trading_platform').length,
      technical_issue: mockTickets.filter(t => t.category === 'technical_issue').length,
      feature_request: mockTickets.filter(t => t.category === 'feature_request').length,
      api_integration: mockTickets.filter(t => t.category === 'api_integration').length,
      security_concern: mockTickets.filter(t => t.category === 'security_concern').length,
      general_inquiry: mockTickets.filter(t => t.category === 'general_inquiry').length,
      bug_report: mockTickets.filter(t => t.category === 'bug_report').length,
      compliance_legal: mockTickets.filter(t => t.category === 'compliance_legal').length
    },
    ticketsByPriority: {
      low: mockTickets.filter(t => t.priority === 'low').length,
      medium: mockTickets.filter(t => t.priority === 'medium').length,
      high: mockTickets.filter(t => t.priority === 'high').length,
      urgent: mockTickets.filter(t => t.priority === 'urgent').length,
      critical: mockTickets.filter(t => t.priority === 'critical').length
    },
    agentPerformance: MOCK_AGENTS.map(agent => ({
      agentId: agent.id,
      name: agent.name,
      ticketsHandled: agent.totalTicketsResolved,
      avgResponseTime: agent.avgResponseTime,
      avgResolutionTime: agent.avgResolutionTime,
      satisfactionScore: agent.satisfactionRating
    })),
    slaCompliance: {
      firstResponse: 94,
      resolution: 87
    },
    trendsLastWeek: {
      newTickets: mockTickets.filter(t => new Date(t.createdAt).getTime() > weekAgo).length,
      resolvedTickets: mockTickets.filter(t => t.resolution && new Date(t.resolution.resolvedAt).getTime() > weekAgo).length,
      avgResponseTime: 14,
      satisfactionScore: 4.7
    }
  }
}

// Helper Functions
const determinePriority = (category: TicketCategory, description: string): TicketPriority => {
  const criticalKeywords = ['down', 'crash', 'critical', 'urgent', 'emergency', 'security']
  const highKeywords = ['error', 'problem', 'issue', 'bug', 'broken']
  
  const text = description.toLowerCase()
  
  if (category === 'security_concern' || criticalKeywords.some(keyword => text.includes(keyword))) {
    return 'critical'
  }
  
  if (['trading_platform', 'technical_issue'].includes(category) || highKeywords.some(keyword => text.includes(keyword))) {
    return 'high'
  }
  
  if (['billing_payment', 'account_access'].includes(category)) {
    return 'medium'
  }
  
  return 'low'
}

const generateTags = (category: TicketCategory, description: string): string[] => {
  const tags = [category]
  
  const text = description.toLowerCase()
  
  // Common issue keywords
  const tagMap = {
    'login': 'authentication',
    'password': 'authentication', 
    'connection': 'connectivity',
    'slow': 'performance',
    'error': 'error',
    'bug': 'bug',
    'feature': 'feature-request',
    'api': 'api',
    'mobile': 'mobile',
    'payment': 'billing',
    'trading': 'trading',
    'bot': 'automation'
  }
  
  Object.entries(tagMap).forEach(([keyword, tag]) => {
    if (text.includes(keyword) && !tags.includes(tag as TicketCategory)) {
      tags.push(tag as TicketCategory)
    }
  })
  
  return tags
}

const autoAssignTicket = (ticket: SupportTicket): SupportAgent | null => {
  // Find available agents with relevant specialization
  const availableAgents = MOCK_AGENTS.filter(agent => 
    agent.isOnline &&
    agent.autoAssignment &&
    agent.currentTickets < agent.maxTickets &&
    agent.specializations.includes(ticket.category)
  )
  
  if (availableAgents.length === 0) {
    return null
  }
  
  // Assign to agent with lowest current ticket load
  const selectedAgent = availableAgents.sort((a, b) => a.currentTickets - b.currentTickets)[0]
  
  // Update agent's current ticket count
  selectedAgent.currentTickets++
  
  return selectedAgent
}

// Export for testing
export const __testing__ = {
  mockTickets,
  MOCK_AGENTS,
  determinePriority,
  generateTags,
  autoAssignTicket
}
