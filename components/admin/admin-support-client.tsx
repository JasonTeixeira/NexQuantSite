"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  Ticket,
  BookOpen,
  Clock,
  Search,
  Plus,
  Send,
  Phone,
  Mail,
  Star,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Shield,
  Bell,
  Activity,
  Award,
  Timer,
  UserCheck,
  Headphones,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  subject: string
  customer: {
    name: string
    email: string
    avatar?: string
    tier: "free" | "premium" | "enterprise"
    timezone: string
    language: string
  }
  status: "open" | "in-progress" | "resolved" | "closed" | "escalated"
  priority: "low" | "medium" | "high" | "urgent" | "critical"
  category: "technical" | "billing" | "general" | "feature-request" | "bug-report" | "account"
  assignedTo?: {
    name: string
    email: string
    avatar?: string
    status: "online" | "offline" | "busy"
  }
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  firstResponseAt?: Date
  sla: {
    responseTime: number // in minutes
    resolutionTime: number // in hours
    responseDeadline: Date
    resolutionDeadline: Date
    breached: boolean
    escalated: boolean
  }
  messages: number
  tags: string[]
  satisfaction?: {
    rating: number
    feedback: string
    submittedAt: Date
  }
  escalationHistory: {
    escalatedAt: Date
    escalatedBy: string
    reason: string
    level: number
  }[]
}

interface LiveChatSession {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
    tier: "free" | "premium" | "enterprise"
    location: string
    browser: string
    currentPage: string
  }
  agent?: {
    name: string
    email: string
    avatar?: string
    status: "online" | "offline" | "busy"
  }
  status: "waiting" | "active" | "ended" | "transferred"
  startTime: Date
  endTime?: Date
  duration?: number
  messages: number
  satisfaction?: {
    rating: number
    feedback: string
  }
  queuePosition?: number
  waitTime: number
  responseTime: number
  tags: string[]
}

interface KnowledgeBaseArticle {
  id: string
  title: string
  category: string
  subcategory?: string
  views: number
  likes: number
  dislikes: number
  status: "published" | "draft" | "archived" | "under-review"
  author: {
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  tags: string[]
  featured: boolean
  helpfulVotes: number
  totalVotes: number
  searchRanking: number
  lastModifiedBy: string
  version: number
}

interface SupportAgent {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "busy" | "away"
  activeTickets: number
  maxTickets: number
  activeChatSessions: number
  maxChatSessions: number
  skills: string[]
  languages: string[]
  performance: {
    avgResponseTime: number
    avgResolutionTime: number
    customerSatisfaction: number
    ticketsResolved: number
    slaCompliance: number
  }
  workingHours: {
    start: string
    end: string
    timezone: string
  }
  lastActivity: Date
}

interface SLAPolicy {
  id: string
  name: string
  description: string
  customerTier: "free" | "premium" | "enterprise" | "all"
  priority: "low" | "medium" | "high" | "urgent" | "critical"
  responseTime: number // in minutes
  resolutionTime: number // in hours
  escalationRules: {
    level: number
    triggerAfter: number // in minutes
    assignTo: string[]
    notifyManagement: boolean
  }[]
  businessHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
    excludeWeekends: boolean
  }
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminSupportClient() {
  const [activeTab, setActiveTab] = useState("overview")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [chatSessions, setChatSessions] = useState<LiveChatSession[]>([])
  const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>([])
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [slaPolices, setSlaPolices] = useState<SLAPolicy[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterAgent, setFilterAgent] = useState("all")

  // Initialize comprehensive mock data
  useEffect(() => {
    // Initialize mock agents
    const mockAgents: SupportAgent[] = [
      {
        id: "agent-001",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        status: "online",
        activeTickets: 8,
        maxTickets: 15,
        activeChatSessions: 2,
        maxChatSessions: 5,
        skills: ["technical", "billing", "api"],
        languages: ["en", "es"],
        performance: {
          avgResponseTime: 12, // minutes
          avgResolutionTime: 4.2, // hours
          customerSatisfaction: 4.8,
          ticketsResolved: 156,
          slaCompliance: 94.5,
        },
        workingHours: {
          start: "09:00",
          end: "17:00",
          timezone: "EST",
        },
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: "agent-002",
        name: "Mike Wilson",
        email: "mike.wilson@company.com",
        status: "busy",
        activeTickets: 12,
        maxTickets: 15,
        activeChatSessions: 4,
        maxChatSessions: 5,
        skills: ["billing", "account", "general"],
        languages: ["en", "fr"],
        performance: {
          avgResponseTime: 18,
          avgResolutionTime: 6.1,
          customerSatisfaction: 4.6,
          ticketsResolved: 203,
          slaCompliance: 89.2,
        },
        workingHours: {
          start: "08:00",
          end: "16:00",
          timezone: "EST",
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: "agent-003",
        name: "Lisa Brown",
        email: "lisa.brown@company.com",
        status: "online",
        activeTickets: 5,
        maxTickets: 15,
        activeChatSessions: 1,
        maxChatSessions: 5,
        skills: ["technical", "feature-request", "bug-report"],
        languages: ["en", "de"],
        performance: {
          avgResponseTime: 8,
          avgResolutionTime: 3.8,
          customerSatisfaction: 4.9,
          ticketsResolved: 98,
          slaCompliance: 97.1,
        },
        workingHours: {
          start: "10:00",
          end: "18:00",
          timezone: "EST",
        },
        lastActivity: new Date(Date.now() - 1 * 60 * 1000),
      },
    ]

    // Initialize mock SLA policies
    const mockSlaPolices: SLAPolicy[] = [
      {
        id: "sla-001",
        name: "Enterprise Critical",
        description: "Critical issues for enterprise customers",
        customerTier: "enterprise",
        priority: "critical",
        responseTime: 15, // 15 minutes
        resolutionTime: 4, // 4 hours
        escalationRules: [
          {
            level: 1,
            triggerAfter: 10,
            assignTo: ["senior-agent-001", "senior-agent-002"],
            notifyManagement: false,
          },
          {
            level: 2,
            triggerAfter: 30,
            assignTo: ["manager-001"],
            notifyManagement: true,
          },
        ],
        businessHours: {
          enabled: false, // 24/7 for critical
          start: "00:00",
          end: "23:59",
          timezone: "UTC",
          excludeWeekends: false,
        },
        active: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "sla-002",
        name: "Premium Standard",
        description: "Standard response times for premium customers",
        customerTier: "premium",
        priority: "high",
        responseTime: 60, // 1 hour
        resolutionTime: 24, // 24 hours
        escalationRules: [
          {
            level: 1,
            triggerAfter: 120,
            assignTo: ["senior-agent-001"],
            notifyManagement: false,
          },
        ],
        businessHours: {
          enabled: true,
          start: "08:00",
          end: "18:00",
          timezone: "EST",
          excludeWeekends: true,
        },
        active: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]

    // Initialize mock tickets with comprehensive SLA data
    const mockTickets: SupportTicket[] = [
      {
        id: "TK-001",
        subject: "Critical API outage affecting trading signals",
        customer: {
          name: "John Smith",
          email: "john.smith@email.com",
          tier: "enterprise",
          timezone: "EST",
          language: "en",
        },
        status: "escalated",
        priority: "critical",
        category: "technical",
        assignedTo: {
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          status: "online",
        },
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 40 * 60 * 1000),
        sla: {
          responseTime: 15,
          resolutionTime: 4,
          responseDeadline: new Date(Date.now() - 30 * 60 * 1000),
          resolutionDeadline: new Date(Date.now() + 3.25 * 60 * 60 * 1000),
          breached: true,
          escalated: true,
        },
        messages: 8,
        tags: ["api", "critical", "enterprise", "escalated"],
        escalationHistory: [
          {
            escalatedAt: new Date(Date.now() - 20 * 60 * 1000),
            escalatedBy: "system",
            reason: "SLA response time breached",
            level: 1,
          },
        ],
      },
      {
        id: "TK-002",
        subject: "Billing inquiry about subscription upgrade",
        customer: {
          name: "Emma Davis",
          email: "emma.davis@email.com",
          tier: "premium",
          timezone: "PST",
          language: "en",
        },
        status: "in-progress",
        priority: "medium",
        category: "billing",
        assignedTo: {
          name: "Mike Wilson",
          email: "mike.wilson@company.com",
          status: "busy",
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        sla: {
          responseTime: 60,
          resolutionTime: 24,
          responseDeadline: new Date(Date.now() - 3 * 60 * 60 * 1000),
          resolutionDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
          breached: false,
          escalated: false,
        },
        messages: 5,
        tags: ["billing", "subscription", "premium"],
        escalationHistory: [],
      },
      {
        id: "TK-003",
        subject: "Feature request: Advanced charting tools",
        customer: {
          name: "Alex Chen",
          email: "alex.chen@email.com",
          tier: "free",
          timezone: "GMT",
          language: "en",
        },
        status: "resolved",
        priority: "low",
        category: "feature-request",
        assignedTo: {
          name: "Lisa Brown",
          email: "lisa.brown@company.com",
          status: "online",
        },
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
        sla: {
          responseTime: 240, // 4 hours for free tier
          resolutionTime: 72, // 72 hours
          responseDeadline: new Date(Date.now() - 44 * 60 * 60 * 1000),
          resolutionDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
          breached: false,
          escalated: false,
        },
        messages: 12,
        tags: ["feature", "charting", "enhancement"],
        satisfaction: {
          rating: 5,
          feedback: "Great response time and helpful solution!",
          submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        escalationHistory: [],
      },
    ]

    // Initialize mock chat sessions
    const mockChatSessions: LiveChatSession[] = [
      {
        id: "CH-001",
        customer: {
          name: "Robert Johnson",
          email: "robert.j@email.com",
          tier: "premium",
          location: "New York, US",
          browser: "Chrome 118",
          currentPage: "/dashboard/signals",
        },
        agent: {
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          status: "online",
        },
        status: "active",
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        messages: 12,
        waitTime: 45, // seconds
        responseTime: 32, // seconds average
        tags: ["signals", "premium", "technical"],
      },
      {
        id: "CH-002",
        customer: {
          name: "Maria Garcia",
          email: "maria.g@email.com",
          tier: "free",
          location: "Madrid, ES",
          browser: "Firefox 119",
          currentPage: "/pricing",
        },
        status: "waiting",
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        messages: 2,
        queuePosition: 1,
        waitTime: 300, // 5 minutes
        responseTime: 0,
        tags: ["sales", "pricing"],
      },
    ]

    // Initialize mock KB articles
    const mockKbArticles: KnowledgeBaseArticle[] = [
      {
        id: "KB-001",
        title: "How to Set Up Your First Trading Signal",
        category: "Getting Started",
        subcategory: "Signals",
        views: 1247,
        likes: 89,
        dislikes: 3,
        status: "published",
        author: {
          name: "Trading Expert",
          email: "expert@company.com",
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ["signals", "setup", "beginner", "tutorial"],
        featured: true,
        helpfulVotes: 156,
        totalVotes: 167,
        searchRanking: 95,
        lastModifiedBy: "admin@company.com",
        version: 3,
      },
      {
        id: "KB-002",
        title: "Understanding Risk Management",
        category: "Trading Basics",
        subcategory: "Risk Management",
        views: 892,
        likes: 67,
        dislikes: 5,
        status: "published",
        author: {
          name: "Risk Analyst",
          email: "analyst@company.com",
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        tags: ["risk", "management", "trading", "strategy"],
        featured: false,
        helpfulVotes: 98,
        totalVotes: 112,
        searchRanking: 87,
        lastModifiedBy: "editor@company.com",
        version: 2,
      },
    ]

    setTickets(mockTickets)
    setChatSessions(mockChatSessions)
    setKbArticles(mockKbArticles)
    setAgents(mockAgents)
    setSlaPolices(mockSlaPolices)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "escalated":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "waiting":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "ended":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600/20 text-red-300 border-red-600/30"
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "premium":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "free":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "away":
        return "bg-orange-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority
    const matchesAgent = filterAgent === "all" || ticket.assignedTo?.name === filterAgent
    return matchesSearch && matchesStatus && matchesPriority && matchesAgent
  })

  // Calculate comprehensive support statistics
  const supportStats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === "open").length,
    inProgressTickets: tickets.filter((t) => t.status === "in-progress").length,
    escalatedTickets: tickets.filter((t) => t.status === "escalated").length,
    resolvedToday: tickets.filter(
      (t) =>
        t.status === "resolved" && t.resolvedAt && new Date(t.resolvedAt).toDateString() === new Date().toDateString(),
    ).length,
    avgResponseTime:
      tickets
        .filter((t) => t.firstResponseAt)
        .reduce((sum, t) => {
          const responseTime = (t.firstResponseAt!.getTime() - t.createdAt.getTime()) / (1000 * 60)
          return sum + responseTime
        }, 0) / tickets.filter((t) => t.firstResponseAt).length,
    avgResolutionTime:
      tickets
        .filter((t) => t.resolvedAt)
        .reduce((sum, t) => {
          const resolutionTime = (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
          return sum + resolutionTime
        }, 0) / tickets.filter((t) => t.resolvedAt).length,
    customerSatisfaction:
      tickets.filter((t) => t.satisfaction).reduce((sum, t) => sum + t.satisfaction!.rating, 0) /
      tickets.filter((t) => t.satisfaction).length,
    slaCompliance: (tickets.filter((t) => !t.sla.breached).length / tickets.length) * 100,
    activeChatSessions: chatSessions.filter((s) => s.status === "active").length,
    waitingChatSessions: chatSessions.filter((s) => s.status === "waiting").length,
    avgChatWaitTime: chatSessions.reduce((sum, s) => sum + s.waitTime, 0) / chatSessions.length,
    avgChatResponseTime:
      chatSessions.filter((s) => s.responseTime > 0).reduce((sum, s) => sum + s.responseTime, 0) /
      chatSessions.filter((s) => s.responseTime > 0).length,
    kbArticles: kbArticles.length,
    kbViews: kbArticles.reduce((sum, article) => sum + article.views, 0),
    kbHelpfulRatio:
      kbArticles.reduce((sum, article) => sum + article.helpfulVotes / article.totalVotes, 0) / kbArticles.length,
    onlineAgents: agents.filter((a) => a.status === "online").length,
    totalAgents: agents.length,
    avgAgentLoad: agents.reduce((sum, a) => sum + a.activeTickets / a.maxTickets, 0) / agents.length,
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Support Center</h1>
          <p className="text-gray-400 mt-1">Comprehensive support management with SLA tracking and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
            {supportStats.activeChatSessions} Active Chats
          </Badge>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Clock className="w-3 h-3 mr-1" />
            {supportStats.waitingChatSessions} Waiting
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {supportStats.escalatedTickets} Escalated
          </Badge>
          <Badge
            className={`${supportStats.slaCompliance >= 95 ? "bg-green-500/20 text-green-400" : supportStats.slaCompliance >= 90 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"} border-current/30`}
          >
            <Target className="w-3 h-3 mr-1" />
            {supportStats.slaCompliance.toFixed(1)}% SLA
          </Badge>
        </div>
      </div>

      {/* Comprehensive Support Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{supportStats.openTickets}</div>
            <p className="text-xs text-gray-400 mt-1">{supportStats.escalatedTickets} escalated</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Response</CardTitle>
            <Timer className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{supportStats.avgResponseTime.toFixed(0)}m</div>
            <p className="text-xs text-green-400 mt-1">-15% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{supportStats.slaCompliance.toFixed(1)}%</div>
            <Progress value={supportStats.slaCompliance} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{supportStats.customerSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-green-400 mt-1">+0.2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {supportStats.onlineAgents}/{supportStats.totalAgents}
            </div>
            <p className="text-xs text-gray-400 mt-1">{(supportStats.avgAgentLoad * 100).toFixed(0)}% avg load</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">KB Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{supportStats.kbArticles}</div>
            <p className="text-xs text-green-400 mt-1">{(supportStats.kbHelpfulRatio * 100).toFixed(0)}% helpful</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Support Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Ticket className="w-4 h-4 mr-2" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="live-chat" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <MessageSquare className="w-4 h-4 mr-2" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="knowledge-base" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <BookOpen className="w-4 h-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Users className="w-4 h-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="sla" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Shield className="w-4 h-4 mr-2" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Activity className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* SLA Performance Dashboard */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-400" />
                  SLA Performance
                </CardTitle>
                <CardDescription className="text-gray-400">Service level agreement compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Overall Compliance</span>
                    <span className="text-lg font-bold text-white">{supportStats.slaCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={supportStats.slaCompliance} className="h-2" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Response Time SLA</span>
                      <span className="text-green-400">96.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Resolution Time SLA</span>
                      <span className="text-yellow-400">89.7%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Escalation Rate</span>
                      <span className="text-red-400">4.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Performance Overview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Agent Performance
                </CardTitle>
                <CardDescription className="text-gray-400">Current agent status and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-black text-xs">
                              {agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getAgentStatusColor(agent.status)}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{agent.name}</p>
                          <p className="text-xs text-gray-400">
                            {agent.activeTickets}/{agent.maxTickets} tickets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {agent.performance.customerSatisfaction.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-400">satisfaction</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Critical Tickets */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Critical Tickets
                </CardTitle>
                <CardDescription className="text-gray-400">High priority and escalated tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets
                    .filter((t) => t.priority === "critical" || t.priority === "urgent" || t.status === "escalated")
                    .slice(0, 3)
                    .map((ticket) => (
                      <div key={ticket.id} className="p-3 rounded-lg bg-gray-800/50 border border-red-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-1">{ticket.subject}</h4>
                            <p className="text-xs text-gray-400">{ticket.customer.name}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            {ticket.sla.breached && (
                              <Badge className="bg-red-600/20 text-red-300 border-red-600/30">
                                <Clock className="w-3 h-3 mr-1" />
                                SLA
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>#{ticket.id}</span>
                          <span>{Math.floor((Date.now() - ticket.createdAt.getTime()) / (1000 * 60))}m ago</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Real-time Activity Feed
              </CardTitle>
              <CardDescription className="text-gray-400">Live updates from support operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Ticket TK-003 resolved by Lisa Brown</p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">SLA breach detected for TK-001</p>
                      <p className="text-xs text-gray-400">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-500/10">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">New chat session started with Maria Garcia</p>
                      <p className="text-xs text-gray-400">8 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-500/10">
                    <Award className="w-4 h-4 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Sarah Johnson achieved 98% SLA compliance this week</p>
                      <p className="text-xs text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-yellow-500/10">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white">Queue alert: 3 customers waiting for chat</p>
                      <p className="text-xs text-gray-400">18 minutes ago</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Tickets Tab with SLA Tracking */}
        <TabsContent value="tickets" className="space-y-6">
          {/* Advanced Ticket Filters */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets by subject, customer, email, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-36 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterAgent} onValueChange={setFilterAgent}>
                    <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Agents</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-primary hover:bg-primary/80 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tickets List with SLA Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Support Tickets</CardTitle>
                  <CardDescription className="text-gray-400">
                    {filteredTickets.length} tickets found • {filteredTickets.filter((t) => t.sla.breached).length} SLA
                    breached
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800/30 ${
                            selectedTicket?.id === ticket.id
                              ? "bg-gray-800/50 border-primary/50"
                              : ticket.sla.breached
                                ? "bg-red-900/10 border-red-500/30"
                                : "bg-gray-800/20 border-gray-700"
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary text-black text-sm">
                                  {ticket.customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-white">{ticket.subject}</h3>
                                <p className="text-sm text-gray-400">
                                  {ticket.customer.name} • {ticket.customer.email}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getTierColor(ticket.customer.tier)}>{ticket.customer.tier}</Badge>
                                  <span className="text-xs text-gray-400">{ticket.customer.timezone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                              </div>
                              {ticket.sla.breached && (
                                <Badge className="bg-red-600/20 text-red-300 border-red-600/30">
                                  <Clock className="w-3 h-3 mr-1" />
                                  SLA Breached
                                </Badge>
                              )}
                              {ticket.status === "escalated" && (
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Level {ticket.escalationHistory[ticket.escalationHistory.length - 1]?.level || 1}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-400">#{ticket.id}</span>
                              <span className="flex items-center text-gray-400">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {ticket.messages}
                              </span>
                              <span className="text-gray-400">Assigned: {ticket.assignedTo?.name || "Unassigned"}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>
                                {Math.floor((Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60))}h ago
                              </span>
                            </div>
                          </div>

                          {/* SLA Progress Indicators */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Response SLA</span>
                              <span
                                className={
                                  ticket.firstResponseAt
                                    ? "text-green-400"
                                    : ticket.sla.breached
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                }
                              >
                                {ticket.firstResponseAt
                                  ? `${Math.floor((ticket.firstResponseAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60))}m`
                                  : `${Math.floor((Date.now() - ticket.createdAt.getTime()) / (1000 * 60))}m / ${ticket.sla.responseTime}m`}
                              </span>
                            </div>
                            {!ticket.firstResponseAt && (
                              <Progress
                                value={Math.min(
                                  100,
                                  ((Date.now() - ticket.createdAt.getTime()) / (1000 * 60) / ticket.sla.responseTime) *
                                    100,
                                )}
                                className="h-1"
                              />
                            )}
                          </div>

                          {ticket.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {ticket.satisfaction && (
                            <div className="flex items-center space-x-2 mt-2 p-2 bg-green-500/10 rounded">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-green-400">
                                {ticket.satisfaction.rating}/5 - "{ticket.satisfaction.feedback}"
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Ticket Details Panel with SLA Information */}
            <div>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Ticket Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTicket ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-white mb-2">{selectedTicket.subject}</h3>
                        <div className="flex items-center space-x-2 mb-4">
                          <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                          <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                          {selectedTicket.sla.breached && (
                            <Badge className="bg-red-600/20 text-red-300 border-red-600/30">SLA Breached</Badge>
                          )}
                        </div>
                      </div>

                      {/* SLA Information */}
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <h4 className="text-sm font-medium text-white mb-2">SLA Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Response Time:</span>
                            <span
                              className={
                                selectedTicket.firstResponseAt
                                  ? "text-green-400"
                                  : selectedTicket.sla.breached
                                    ? "text-red-400"
                                    : "text-yellow-400"
                              }
                            >
                              {selectedTicket.firstResponseAt
                                ? `${Math.floor((selectedTicket.firstResponseAt.getTime() - selectedTicket.createdAt.getTime()) / (1000 * 60))}m`
                                : `${Math.floor((Date.now() - selectedTicket.createdAt.getTime()) / (1000 * 60))}m / ${selectedTicket.sla.responseTime}m`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Resolution Deadline:</span>
                            <span className="text-white">{selectedTicket.sla.resolutionDeadline.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time Remaining:</span>
                            <span
                              className={
                                selectedTicket.sla.resolutionDeadline.getTime() > Date.now()
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {Math.floor(
                                (selectedTicket.sla.resolutionDeadline.getTime() - Date.now()) / (1000 * 60 * 60),
                              )}
                              h
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">Customer</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-black text-xs">
                                {selectedTicket.customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{selectedTicket.customer.name}</p>
                              <p className="text-xs text-gray-400">{selectedTicket.customer.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getTierColor(selectedTicket.customer.tier)}>
                                  {selectedTicket.customer.tier}
                                </Badge>
                                <span className="text-xs text-gray-400">{selectedTicket.customer.timezone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400">Assigned To</label>
                          <div className="flex items-center space-x-2 mt-1">
                            {selectedTicket.assignedTo ? (
                              <>
                                <div className="relative">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-green-500 text-white text-xs">
                                      {selectedTicket.assignedTo.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-gray-800 ${getAgentStatusColor(selectedTicket.assignedTo.status)}`}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm text-white">{selectedTicket.assignedTo.name}</p>
                                  <p className="text-xs text-gray-400">{selectedTicket.assignedTo.status}</p>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">Unassigned</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400">Category</label>
                          <p className="text-sm text-white mt-1 capitalize">
                            {selectedTicket.category.replace("-", " ")}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400">Created</label>
                          <p className="text-sm text-white mt-1">{selectedTicket.createdAt.toLocaleString()}</p>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400">Last Updated</label>
                          <p className="text-sm text-white mt-1">{selectedTicket.updatedAt.toLocaleString()}</p>
                        </div>

                        {selectedTicket.resolvedAt && (
                          <div>
                            <label className="text-sm text-gray-400">Resolved</label>
                            <p className="text-sm text-white mt-1">{selectedTicket.resolvedAt.toLocaleString()}</p>
                          </div>
                        )}
                      </div>

                      {/* Escalation History */}
                      {selectedTicket.escalationHistory.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Escalation History</label>
                          <div className="space-y-2">
                            {selectedTicket.escalationHistory.map((escalation, index) => (
                              <div key={index} className="p-2 bg-purple-500/10 rounded text-xs">
                                <p className="text-purple-400">
                                  Level {escalation.level} - {escalation.reason}
                                </p>
                                <p className="text-gray-400">
                                  {escalation.escalatedAt.toLocaleString()} by {escalation.escalatedBy}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-4 border-t border-gray-700">
                        <Button className="w-full bg-primary hover:bg-primary/80 text-black">
                          <Eye className="w-4 h-4 mr-2" />
                          View Conversation
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Ticket
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-yellow-700 text-yellow-400 hover:bg-yellow-900/20 bg-transparent"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Escalate
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Close Ticket
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a ticket to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Live Chat Tab - Enhanced with Queue Management */}
        <TabsContent value="live-chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Enhanced Chat Queue Management */}
            <div className="space-y-6">
              {/* Chat Statistics */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Headphones className="w-5 h-5 mr-2" />
                    Live Chat Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Chats</span>
                    <Badge className="bg-green-500/20 text-green-400">{supportStats.activeChatSessions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">In Queue</span>
                    <Badge className="bg-orange-500/20 text-orange-400">{supportStats.waitingChatSessions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Wait Time</span>
                    <span className="text-sm text-white">
                      {Math.floor(supportStats.avgChatWaitTime / 60)}m {supportStats.avgChatWaitTime % 60}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Response</span>
                    <span className="text-sm text-white">{supportStats.avgChatResponseTime.toFixed(0)}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Available Agents</span>
                    <span className="text-sm text-white">
                      {agents.filter((a) => a.status === "online" && a.activeChatSessions < a.maxChatSessions).length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Waiting Queue */}
              {chatSessions.filter((s) => s.status === "waiting").length > 0 && (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-400" />
                      Waiting Queue
                      <Badge className="ml-2 bg-orange-500/20 text-orange-400">
                        {chatSessions.filter((s) => s.status === "waiting").length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {chatSessions
                          .filter((s) => s.status === "waiting")
                          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                          .map((session, index) => (
                            <div
                              key={session.id}
                              className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-primary text-black text-xs">
                                      {session.customer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-white">{session.customer.name}</p>
                                    <div className="flex items-center space-x-2">
                                      <Badge className={getTierColor(session.customer.tier)}>
                                        {session.customer.tier}
                                      </Badge>
                                      <Badge className="bg-orange-500/20 text-orange-400">#{index + 1}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1 text-xs text-gray-400">
                                <p>
                                  Waiting: {Math.floor(session.waitTime / 60)}m {session.waitTime % 60}s
                                </p>
                                <p>Page: {session.customer.currentPage}</p>
                                <p>Location: {session.customer.location}</p>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-2 bg-primary hover:bg-primary/80 text-black"
                                onClick={() => toast.success(`Joined chat with ${session.customer.name}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Join Chat
                              </Button>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Active Sessions */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-400" />
                    Active Sessions
                    <Badge className="ml-2 bg-green-500/20 text-green-400">
                      {chatSessions.filter((s) => s.status === "active").length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {chatSessions
                        .filter((s) => s.status === "active")
                        .map((session) => (
                          <div
                            key={session.id}
                            className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary text-black text-xs">
                                    {session.customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-white">{session.customer.name}</p>
                                  <Badge className={getTierColor(session.customer.tier)}>{session.customer.tier}</Badge>
                                </div>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                            </div>
                            <div className="space-y-1 text-xs text-gray-400">
                              <p>Agent: {session.agent?.name}</p>
                              <p>Duration: {Math.floor((Date.now() - session.startTime.getTime()) / (1000 * 60))}m</p>
                              <p>Messages: {session.messages}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-900/50 border-gray-800 h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-black">RJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-lg">Robert Johnson</CardTitle>
                        <CardDescription className="text-gray-400 flex items-center space-x-2">
                          <span>robert.j@email.com</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Premium</Badge>
                        </CardDescription>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>New York, US</span>
                          <span>•</span>
                          <span>Chrome 118</span>
                          <span>•</span>
                          <span>Duration: 15m</span>
                          <span>•</span>
                          <span className="text-green-400">Page: /dashboard/signals</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Chat messages would go here */}
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">RJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-white">
                              Hi, I'm having trouble accessing my premium signals. Can you help?
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">2:34 PM</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-primary rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-black">
                              Hello Robert! I'd be happy to help you with that. Let me check your account status first.
                            </p>
                          </div>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-500 text-white text-xs">SJ</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex justify-center">
                        <div className="bg-gray-700/50 rounded-lg px-3 py-1">
                          <p className="text-xs text-gray-400">Sarah Johnson joined the chat</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800/50 border-gray-700 text-white"
                      />
                      <Button className="bg-primary hover:bg-primary/80 text-black">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>Agent: Sarah Johnson</span>
                        <span>•</span>
                        <span>Avg response: 32s</span>
                        <span>•</span>
                        <span className="text-green-400">Customer typing...</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                          Transfer
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-700 text-red-400 bg-transparent">
                          End Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab - Enhanced with Analytics */}
        <TabsContent value="knowledge-base" className="space-y-6">
          {/* KB Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Articles</p>
                    <p className="text-2xl font-bold text-white">{supportStats.kbArticles}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-white">{supportStats.kbViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Helpful Ratio</p>
                    <p className="text-2xl font-bold text-white">{(supportStats.kbHelpfulRatio * 100).toFixed(0)}%</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Deflection Rate</p>
                    <p className="text-2xl font-bold text-white">73%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KB Articles Management */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Knowledge Base Articles</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search articles..." className="w-64 bg-gray-800/50 border-gray-700 text-white" />
                  <Button className="bg-primary hover:bg-primary/80 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kbArticles.map((article) => (
                  <div key={article.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-white">{article.title}</h3>
                          {article.featured && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge
                            className={
                              article.status === "published"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {article.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <span>Category: {article.category}</span>
                          <span>•</span>
                          <span>By {article.author.name}</span>
                          <span>•</span>
                          <span>v{article.version}</span>
                          <span>•</span>
                          <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="flex items-center text-gray-400">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center text-gray-400">
                            <Star className="w-4 h-4 mr-1" />
                            {article.likes} likes
                          </span>
                          <span className="flex items-center text-gray-400">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {Math.round((article.helpfulVotes / article.totalVotes) * 100)}% helpful
                          </span>
                          <span className="flex items-center text-gray-400">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Rank: {article.searchRanking}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab - Team Management */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Performance Overview */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Support Agents</CardTitle>
                  <CardDescription className="text-gray-400">Team performance and workload management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-primary text-black">
                                  {agent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getAgentStatusColor(agent.status)}`}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{agent.name}</h3>
                              <p className="text-sm text-gray-400">{agent.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${getAgentStatusColor(agent.status)} text-white border-0`}>
                                  {agent.status}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {agent.workingHours.start} - {agent.workingHours.end} {agent.workingHours.timezone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <p className="text-white font-medium">
                                  {agent.performance.customerSatisfaction.toFixed(1)}
                                </p>
                                <p className="text-xs text-gray-400">Satisfaction</p>
                              </div>
                              <div className="text-center">
                                <p className="text-white font-medium">{agent.performance.slaCompliance.toFixed(1)}%</p>
                                <p className="text-xs text-gray-400">SLA</p>
                              </div>
                              <div className="text-center">
                                <p className="text-white font-medium">{agent.performance.ticketsResolved}</p>
                                <p className="text-xs text-gray-400">Resolved</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Current Workload</span>
                            <span className="text-white">
                              {agent.activeTickets}/{agent.maxTickets} tickets • {agent.activeChatSessions}/
                              {agent.maxChatSessions} chats
                            </span>
                          </div>
                          <Progress value={(agent.activeTickets / agent.maxTickets) * 100} className="h-2" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Avg Response Time</span>
                            <span className="text-white">{agent.performance.avgResponseTime}m</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Avg Resolution Time</span>
                            <span className="text-white">{agent.performance.avgResolutionTime.toFixed(1)}h</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-400 mr-2">Skills:</span>
                            {agent.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs text-gray-400 mr-2">Languages:</span>
                            {agent.languages.map((lang) => (
                              <Badge key={lang} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                {lang.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Statistics */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Team Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Online Agents</span>
                    <span className="text-lg font-bold text-green-400">
                      {supportStats.onlineAgents}/{supportStats.totalAgents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Average Load</span>
                    <span className="text-lg font-bold text-white">
                      {(supportStats.avgAgentLoad * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Team Satisfaction</span>
                    <span className="text-lg font-bold text-white">
                      {(agents.reduce((sum, a) => sum + a.performance.customerSatisfaction, 0) / agents.length).toFixed(
                        1,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Team SLA</span>
                    <span className="text-lg font-bold text-white">
                      {(agents.reduce((sum, a) => sum + a.performance.slaCompliance, 0) / agents.length).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Shift Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                          <span className="text-sm text-white">{agent.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {agent.workingHours.start} - {agent.workingHours.end}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SLA Management Tab */}
        <TabsContent value="sla" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLA Policies */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    SLA Policies
                  </span>
                  <Button className="bg-primary hover:bg-primary/80 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Policy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slaPolices.map((policy) => (
                    <div key={policy.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">{policy.name}</h3>
                          <p className="text-sm text-gray-400">{policy.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              policy.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {policy.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Customer Tier:</span>
                          <p className="text-white capitalize">{policy.customerTier}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Priority:</span>
                          <p className="text-white capitalize">{policy.priority}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Response Time:</span>
                          <p className="text-white">{policy.responseTime}m</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Resolution Time:</span>
                          <p className="text-white">{policy.resolutionTime}h</p>
                        </div>
                      </div>

                      {policy.escalationRules.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-400">Escalation Rules:</span>
                          <div className="mt-1 space-y-1">
                            {policy.escalationRules.map((rule, index) => (
                              <div key={index} className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded">
                                Level {rule.level}: After {rule.triggerAfter}m → {rule.assignTo.join(", ")}
                                {rule.notifyManagement && " (Notify Management)"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                        <span className="text-xs text-gray-400">
                          Updated {new Date(policy.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA Performance Dashboard */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  SLA Performance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall SLA Compliance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall SLA Compliance</span>
                    <span className="text-2xl font-bold text-white">{supportStats.slaCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={supportStats.slaCompliance} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Target: 95%</span>
                    <span className={supportStats.slaCompliance >= 95 ? "text-green-400" : "text-red-400"}>
                      {supportStats.slaCompliance >= 95 ? "✓ Meeting Target" : "⚠ Below Target"}
                    </span>
                  </div>
                </div>

                {/* Response Time SLA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Response Time SLA</span>
                    <span className="text-lg font-bold text-white">96.2%</span>
                  </div>
                  <Progress value={96.2} className="h-2" />
                  <div className="text-xs text-gray-400 mt-1">
                    Avg: {supportStats.avgResponseTime.toFixed(0)}m (Target: varies by tier)
                  </div>
                </div>

                {/* Resolution Time SLA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Resolution Time SLA</span>
                    <span className="text-lg font-bold text-white">89.7%</span>
                  </div>
                  <Progress value={89.7} className="h-2" />
                  <div className="text-xs text-gray-400 mt-1">
                    Avg: {supportStats.avgResolutionTime.toFixed(1)}h (Target: varies by tier)
                  </div>
                </div>

                {/* SLA Breaches by Priority */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">SLA Breaches by Priority</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-300">Critical</span>
                      <span className="text-white">1 breach</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-400">Urgent</span>
                      <span className="text-white">0 breaches</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-400">High</span>
                      <span className="text-white">2 breaches</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">Medium/Low</span>
                      <span className="text-white">1 breach</span>
                    </div>
                  </div>
                </div>

                {/* Escalation Statistics */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Escalation Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Escalations</span>
                      <span className="text-white">{supportStats.escalatedTickets}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Escalation Rate</span>
                      <span className="text-white">
                        {((supportStats.escalatedTickets / supportStats.totalTickets) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Avg Escalation Time</span>
                      <span className="text-white">2.3h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab - Comprehensive Reporting */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Support Volume Trends */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Support Volume Trends</CardTitle>
                <CardDescription className="text-gray-400">Ticket volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <BarChart3 className="w-16 h-16 opacity-50" />
                  <span className="ml-4">Chart visualization would go here</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction Trends */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Customer Satisfaction</CardTitle>
                <CardDescription className="text-gray-400">Satisfaction ratings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <Star className="w-16 h-16 opacity-50" />
                  <span className="ml-4">Satisfaction chart would go here</span>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Analytics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Response Time Analytics</CardTitle>
                <CardDescription className="text-gray-400">Response time distribution and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Average Response Time</span>
                    <span className="text-lg font-bold text-white">{supportStats.avgResponseTime.toFixed(0)}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Median Response Time</span>
                    <span className="text-lg font-bold text-white">8m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">90th Percentile</span>
                    <span className="text-lg font-bold text-white">25m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">First Response SLA</span>
                    <span className="text-lg font-bold text-green-400">96.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Channel Performance</CardTitle>
                <CardDescription className="text-gray-400">Performance across support channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                    <div className="flex items-center space-x-3">
                      <Ticket className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Tickets</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{supportStats.totalTickets}</p>
                      <p className="text-xs text-gray-400">4.2/5 satisfaction</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      <span className="text-white">Live Chat</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{chatSessions.length}</p>
                      <p className="text-xs text-gray-400">4.6/5 satisfaction</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Knowledge Base</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{supportStats.kbViews}</p>
                      <p className="text-xs text-gray-400">73% deflection rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Table */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Detailed Support Metrics</CardTitle>
              <CardDescription className="text-gray-400">Comprehensive support performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-2">Metric</th>
                      <th className="text-left text-gray-400 pb-2">Current</th>
                      <th className="text-left text-gray-400 pb-2">Target</th>
                      <th className="text-left text-gray-400 pb-2">Trend</th>
                      <th className="text-left text-gray-400 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-white">First Response Time</td>
                      <td className="py-2 text-white">{supportStats.avgResponseTime.toFixed(0)}m</td>
                      <td className="py-2 text-gray-400">15m</td>
                      <td className="py-2 text-green-400">↓ -12%</td>
                      <td className="py-2">
                        <Badge className="bg-green-500/20 text-green-400">Good</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-white">Resolution Time</td>
                      <td className="py-2 text-white">{supportStats.avgResolutionTime.toFixed(1)}h</td>
                      <td className="py-2 text-gray-400">24h</td>
                      <td className="py-2 text-green-400">↓ -8%</td>
                      <td className="py-2">
                        <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-white">Customer Satisfaction</td>
                      <td className="py-2 text-white">{supportStats.customerSatisfaction.toFixed(1)}/5</td>
                      <td className="py-2 text-gray-400">4.5/5</td>
                      <td className="py-2 text-green-400">↑ +0.2</td>
                      <td className="py-2">
                        <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-white">SLA Compliance</td>
                      <td className="py-2 text-white">{supportStats.slaCompliance.toFixed(1)}%</td>
                      <td className="py-2 text-gray-400">95%</td>
                      <td className="py-2 text-red-400">↓ -2%</td>
                      <td className="py-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400">Needs Attention</Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2 text-white">Ticket Volume</td>
                      <td className="py-2 text-white">{supportStats.totalTickets}</td>
                      <td className="py-2 text-gray-400">-</td>
                      <td className="py-2 text-yellow-400">↑ +15%</td>
                      <td className="py-2">
                        <Badge className="bg-blue-500/20 text-blue-400">Monitoring</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white">Knowledge Base Deflection</td>
                      <td className="py-2 text-white">73%</td>
                      <td className="py-2 text-gray-400">70%</td>
                      <td className="py-2 text-green-400">↑ +5%</td>
                      <td className="py-2">
                        <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
