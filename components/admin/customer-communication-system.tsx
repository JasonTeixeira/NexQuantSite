"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Bell, Send, Target, Eye, Slack, MousePointer } from "lucide-react"
import { toast } from "sonner"

interface CommunicationTemplate {
  id: string
  name: string
  type: "email" | "sms" | "push" | "in-app" | "slack"
  category: "welcome" | "follow-up" | "escalation" | "satisfaction" | "marketing" | "notification"
  subject?: string
  content: string
  variables: string[]
  triggers: {
    event: string
    conditions: Record<string, any>
    delay?: number // in minutes
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
  usage: {
    sent: number
    opened: number
    clicked: number
    replied: number
  }
}

interface CommunicationCampaign {
  id: string
  name: string
  description: string
  type: "one-time" | "recurring" | "triggered"
  status: "draft" | "scheduled" | "active" | "paused" | "completed"
  templates: string[]
  audience: {
    segments: string[]
    filters: Record<string, any>
    totalRecipients: number
  }
  schedule: {
    startDate: Date
    endDate?: Date
    frequency?: "daily" | "weekly" | "monthly"
    timezone: string
  }
  performance: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    unsubscribed: number
  }
  createdAt: Date
  updatedAt: Date
}

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    event: "ticket_created" | "ticket_updated" | "ticket_resolved" | "sla_breach" | "customer_signup" | "inactivity"
    conditions: Record<string, any>
  }
  actions: {
    type: "send_email" | "send_sms" | "create_task" | "assign_agent" | "escalate" | "update_status"
    parameters: Record<string, any>
    delay?: number
  }[]
  active: boolean
  createdAt: Date
  performance: {
    triggered: number
    successful: number
    failed: number
  }
}

interface CommunicationLog {
  id: string
  type: "email" | "sms" | "push" | "in-app" | "slack"
  recipient: {
    id: string
    name: string
    email: string
    phone?: string
  }
  templateId?: string
  campaignId?: string
  subject?: string
  content: string
  status: "sent" | "delivered" | "opened" | "clicked" | "replied" | "failed" | "bounced"
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  repliedAt?: Date
  metadata: Record<string, any>
}

export default function CustomerCommunicationSystem() {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)

  const [newTemplate, setNewTemplate] = useState<Partial<CommunicationTemplate>>({
    name: "",
    type: "email",
    category: "notification",
    subject: "",
    content: "",
    variables: [],
    triggers: [],
    active: true,
  })

  const [newCampaign, setNewCampaign] = useState<Partial<CommunicationCampaign>>({
    name: "",
    description: "",
    type: "one-time",
    status: "draft",
    templates: [],
    audience: {
      segments: [],
      filters: {},
      totalRecipients: 0,
    },
    schedule: {
      startDate: new Date(),
      timezone: "EST",
    },
  })

  // Initialize mock data
  useEffect(() => {
    const mockTemplates: CommunicationTemplate[] = [
      {
        id: "tpl-001",
        name: "Ticket Created Confirmation",
        type: "email",
        category: "notification",
        subject: "Your support ticket #{ticketId} has been created",
        content: `Dear {customerName},

Thank you for contacting our support team. Your ticket #{ticketId} has been created and assigned to our support team.

Ticket Details:
- Subject: {ticketSubject}
- Priority: {ticketPriority}
- Expected Response Time: {expectedResponseTime}

You can track the progress of your ticket at: {ticketUrl}

Best regards,
Support Team`,
        variables: ["customerName", "ticketId", "ticketSubject", "ticketPriority", "expectedResponseTime", "ticketUrl"],
        triggers: [
          {
            event: "ticket_created",
            conditions: { status: "open" },
            delay: 0,
          },
        ],
        active: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        usage: {
          sent: 1247,
          opened: 1089,
          clicked: 234,
          replied: 45,
        },
      },
      {
        id: "tpl-002",
        name: "SLA Breach Alert",
        type: "email",
        category: "escalation",
        subject: "URGENT: SLA Breach for Ticket #{ticketId}",
        content: `URGENT NOTIFICATION

Ticket #{ticketId} has breached its SLA requirements.

Details:
- Customer: {customerName} ({customerTier})
- Subject: {ticketSubject}
- Priority: {ticketPriority}
- Expected Response: {expectedResponseTime}
- Time Elapsed: {timeElapsed}
- Assigned Agent: {assignedAgent}

Immediate action required.

Management Team`,
        variables: ["ticketId", "customerName", "customerTier", "ticketSubject", "ticketPriority", "expectedResponseTime", "timeElapsed", "assignedAgent"],
        triggers: [
          {
            event: "sla_breach",
            conditions: { severity: "critical" },
            delay: 0,
          },
        ],
        active: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        usage: {
          sent: 23,
          opened: 23,
          clicked: 18,
          replied: 12,
        },
      },
      {
        id: "tpl-003",
        name: "Customer Satisfaction Survey",
        type: "email",
        category: "satisfaction",
        subject: "How was your support experience? - Ticket #{ticketId}",
        content: `Hi {customerName},

Your support ticket #{ticketId} has been resolved. We hope we were able to help you effectively.

We'd love to hear about your experience. Please take a moment to rate our service:

{surveyLink}

Your feedback helps us improve our support quality.

Thank you,
Support Team`,
        variables: ["customerName", "ticketId", "surveyLink"],
        triggers: [
          {
            event: "ticket_resolved",
            conditions: { status: "resolved" },
            delay: 60, // 1 hour after resolution
          },
        ],
        active: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        usage: {
          sent: 892,
          opened: 634,
          clicked: 287,
          replied: 156,
        },
      },
    ]

    const mockCampaigns: CommunicationCampaign[] = [
      {
        id: "camp-001",
        name: "Q4 Feature Updates",
        description: "Inform customers about new features released in Q4",
        type: "one-time",
        status: "completed",
        templates: ["tpl-004"],
        audience: {
          segments: ["premium", "enterprise"],
          filters: { active: true, lastLogin: "30days" },
          totalRecipients: 2847,
        },
        schedule: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          timezone: "EST",
        },
        performance: {
          sent: 2847,
          delivered: 2834,
          opened: 1923,
          clicked: 456,
          replied: 89,
          unsubscribed: 12,
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "camp-002",
        name: "Weekly Support Digest",
        description: "Weekly summary of support improvements and tips",
        type: "recurring",
        status: "active",
        templates: ["tpl-005"],
        audience: {
          segments: ["all"],
          filters: { subscribed: true },
          totalRecipients: 5234,
        },
        schedule: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          frequency: "weekly",
          timezone: "EST",
        },
        performance: {
          sent: 20936, // 4 weeks
          delivered: 20845,
          opened: 12507,
          clicked: 2089,
          replied: 234,
          unsubscribed: 45,
        },
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]

    const mockAutomationRules: AutomationRule[] = [
      {
        id: "rule-001",
        name: "High Priority Ticket Auto-Assignment",
        description: "Automatically assign high priority tickets to senior agents",
        trigger: {
          event: "ticket_created",
          conditions: { priority: ["high", "urgent", "critical"] },
        },
        actions: [
          {
            type: "assign_agent",
            parameters: { agentPool: "senior-agents", method: "round-robin" },
            delay: 0,
          },
          {
            type: "send_email",
            parameters: { templateId: "tpl-006", recipient: "assigned-agent" },
            delay: 5,
          },
        ],
        active: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        performance: {
          triggered: 234,
          successful: 231,
          failed: 3,
        },
      },
      {
        id: "rule-002",
        name: "SLA Breach Escalation",
        description: "Escalate tickets when SLA is breached",
        trigger: {
          event: "sla_breach",
          conditions: { breachType: "response" },
        },
        actions: [
          {
            type: "escalate",
            parameters: { level: 1, notifyManagement: true },
            delay: 0,
          },
          {
            type: "send_email",
            parameters: { templateId: "tpl-002", recipient: "management" },
            delay: 0,
          },
        ],
        active: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        performance: {
          triggered: 23,
          successful: 23,
          failed: 0,
        },
      },
    ]

    const mockCommunicationLogs: CommunicationLog[] = [
      {
        id: "log-001",
        type: "email",
        recipient: {
          id: "cust-001",
          name: "John Smith",
          email: "john.smith@email.com",
        },
        templateId: "tpl-001",
        subject: "Your support ticket #TK-001 has been created",
        content: "Dear John Smith, Thank you for contacting our support team...",
        status: "opened",
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        metadata: { ticketId: "TK-001", priority: "high" },
      },
      {
        id: "log-002",
        type: "email",
        recipient: {
          id: "mgmt-001",
          name: "Sarah Manager",
          email: "sarah.manager@company.com",
        },
        templateId: "tpl-002",
        subject: "URGENT: SLA Breach for Ticket #TK-001",
        content: "URGENT NOTIFICATION - Ticket #TK-001 has breached its SLA...",
        status: "clicked",
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15000),
        openedAt: new Date(Date.now() - 45 * 60 * 1000),
        clickedAt: new Date(Date.now() - 40 * 60 * 1000),
        metadata: { ticketId: "TK-001", breachType: "response" },
      },
    ]

    setTemplates(mockTemplates)
    setCampaigns(mockCampaigns)
    setAutomationRules(mockAutomationRules)
    setCommunicationLogs(mockCommunicationLogs)
  }, [])

  const handleCreateTemplate = () => {
    const template: CommunicationTemplate = {
      ...newTemplate,
      id: `tpl-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
      },
    } as CommunicationTemplate

    setTemplates([...templates, template])
    setIsCreateTemplateOpen(false)
    setNewTemplate({
      name: "",
      type: "email",
      category: "notification",
      subject: "",
      content: "",
      variables: [],
      triggers: [],
      active: true,
    })
    toast.success("Communication template created successfully")
  }

  const handleCreateCampaign = () => {
    const campaign: CommunicationCampaign = {
      ...newCampaign,
      id: `camp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        unsubscribed: 0,
      },
    } as CommunicationCampaign

    setCampaigns([...campaigns, campaign])
    setIsCreateCampaignOpen(false)
    setNewCampaign({
      name: "",
      description: "",
      type: "one-time",
      status: "draft",
      templates: [],
      audience: {
        segments: [],
        filters: {},
        totalRecipients: 0,
      },
      schedule: {
        startDate: new Date(),
        timezone: "EST",
      },
    })
    toast.success("Communication campaign created successfully")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "sent":
      case "delivered":
      case "opened":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "scheduled":
      case "clicked":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "paused":
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
      case "bounced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "completed":
      case "replied":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <MessageSquare className="w-4 h-4" />
      case "push":
        return <Bell className="w-4 h-4" />
      case "slack":
        return <Slack className="w-4 h-4" />
      case "in-app":
        return <Bell className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  // Calculate overall statistics
  const totalTemplates = templates.length
  const activeTemplates = templates.filter(t => t.active).length
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === "active").length
  const totalSent = templates.reduce((sum, t) => sum + t.usage.sent, 0)
  const totalOpened = templates.reduce((sum, t) => sum + t.usage.opened, 0)
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
  const totalClicked = templates.reduce((sum, t) => sum + t.usage.clicked, 0)
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Communication Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Communication Center</h1>
          <p className="text-gray-400 mt-1">Automated communication templates, campaigns, and customer engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Send className="w-3 h-3 mr-1" />
            {totalSent.toLocaleString()} sent
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Eye className="w-3 h-3 mr-1" />
            {openRate.toFixed(1)}% open rate
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Target className="w-3 h-3 mr-1" />
            {clickRate.toFixed(1)}% click rate
          </Badge>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Templates</CardTitle>
            <Mail className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeTemplates}</div>
            <p className="text-xs text-gray-400 mt-1">{totalTemplates} total</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Campaigns</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeCampaigns}</div>
            <p className="text-xs text-gray-400 mt-1">{totalCampaigns} total</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-green-400 mt-1">+12% this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{openRate.toFixed(1)}%</div>
            <p className="text-xs text-green-400 mt-1">+2.3% vs avg</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">18.5%</div>
            <p className="text-xs text-green-400 mt-1">+1.8% vs avg</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
