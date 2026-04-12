"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts"
import {
  MessageSquare, Send, Plus, Edit, Trash2, Eye, Users, Bell, Mail,
  Target, TrendingUp, Clock, CheckCircle, AlertTriangle, Zap, Settings,
  Filter, Download, RefreshCw, Calendar, Globe, Smartphone, Search,
  MessageCircle, UserCheck, Heart, Star, Award
} from "lucide-react"
import { toast } from "sonner"

interface MessageCampaign {
  id: string
  name: string
  type: "in_app" | "push" | "email" | "sms"
  status: "draft" | "scheduled" | "active" | "completed" | "paused"
  targetAudience: string
  message: {
    title: string
    body: string
    cta?: string
    ctaUrl?: string
  }
  schedule?: {
    sendAt: string
    timezone: string
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
  }
  created: string
  author: string
  tags: string[]
}

interface MessageTemplate {
  id: string
  name: string
  type: "welcome" | "promotion" | "alert" | "update" | "reminder"
  category: string
  subject: string
  content: string
  variables: string[]
  usage: number
  created: string
}

interface UserEngagement {
  userId: string
  username: string
  email: string
  totalMessages: number
  openRate: number
  clickRate: number
  lastActivity: string
  preferredChannel: "in_app" | "push" | "email" | "sms"
  engagementScore: number
  status: "active" | "inactive" | "opted_out"
}

interface MessagingMetrics {
  totalCampaigns: number
  activeCampaigns: number
  messagesDelivered: number
  avgOpenRate: number
  avgClickRate: number
  avgConversionRate: number
  topPerformingCampaign: string
}

const CAMPAIGN_STATUS_COLORS = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
}

const MESSAGE_TYPE_COLORS = {
  in_app: "bg-blue-500/20 text-blue-400",
  push: "bg-green-500/20 text-green-400",
  email: "bg-orange-500/20 text-orange-400",
  sms: "bg-purple-500/20 text-purple-400"
}

export default function MessagingSystemDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [campaigns, setCampaigns] = useState<MessageCampaign[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([])
  const [metrics, setMetrics] = useState<MessagingMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    messagesDelivered: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    avgConversionRate: 0,
    topPerformingCampaign: ""
  })
  
  const [selectedCampaign, setSelectedCampaign] = useState<MessageCampaign | null>(null)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "in_app" as const,
    targetAudience: "all",
    title: "",
    body: "",
    cta: "",
    ctaUrl: "",
    scheduleType: "now" as "now" | "scheduled",
    sendAt: "",
    tags: []
  })

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "welcome" as const,
    category: "general",
    subject: "",
    content: "",
    variables: [] as string[]
  })

  useEffect(() => {
    loadMessagingData()
  }, [])

  const loadMessagingData = async () => {
    setIsLoading(true)
    try {
      // Mock campaign data
      const mockCampaigns: MessageCampaign[] = [
        {
          id: "1",
          name: "Welcome New Users",
          type: "in_app",
          status: "active",
          targetAudience: "new_users",
          message: {
            title: "Welcome to our Trading Platform!",
            body: "Start your trading journey with $10,000 in virtual funds to practice.",
            cta: "Start Trading",
            ctaUrl: "/dashboard"
          },
          metrics: {
            sent: 1250,
            delivered: 1248,
            opened: 892,
            clicked: 445,
            converted: 156
          },
          created: "2024-01-20",
          author: "Marketing Team",
          tags: ["welcome", "onboarding", "new_users"]
        },
        {
          id: "2", 
          name: "Premium Upgrade Promotion",
          type: "email",
          status: "completed",
          targetAudience: "free_users",
          message: {
            title: "Upgrade to Premium - 50% Off!",
            body: "Limited time offer: Get Premium features at 50% discount. Access advanced analytics, real-time signals, and priority support.",
            cta: "Upgrade Now",
            ctaUrl: "/pricing"
          },
          metrics: {
            sent: 8920,
            delivered: 8756,
            opened: 3102,
            clicked: 892,
            converted: 234
          },
          created: "2024-01-18",
          author: "Growth Team",
          tags: ["promotion", "upgrade", "premium"]
        },
        {
          id: "3",
          name: "Weekly Market Update",
          type: "push",
          status: "scheduled",
          targetAudience: "active_traders",
          message: {
            title: "Market Alert: Major Movement Expected",
            body: "Our AI predicts significant market movement in the next 24h. Check your portfolio.",
            cta: "View Analysis",
            ctaUrl: "/market-analysis"
          },
          schedule: {
            sendAt: "2024-01-22T09:00:00Z",
            timezone: "UTC"
          },
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0
          },
          created: "2024-01-19",
          author: "Content Team",
          tags: ["market", "alert", "weekly"]
        },
        {
          id: "4",
          name: "Account Security Alert",
          type: "in_app",
          status: "active",
          targetAudience: "all_users",
          message: {
            title: "Enable 2FA for Better Security",
            body: "Protect your account with two-factor authentication. It takes just 2 minutes to setup.",
            cta: "Enable 2FA",
            ctaUrl: "/security/2fa"
          },
          metrics: {
            sent: 12450,
            delivered: 12389,
            opened: 4567,
            clicked: 1234,
            converted: 678
          },
          created: "2024-01-15",
          author: "Security Team", 
          tags: ["security", "2fa", "important"]
        }
      ]

      // Mock templates
      const mockTemplates: MessageTemplate[] = [
        {
          id: "1",
          name: "Welcome Series - Day 1",
          type: "welcome",
          category: "onboarding",
          subject: "Welcome to {{platform_name}}!",
          content: "Hi {{user_name}}, welcome to our trading platform! Here's how to get started...",
          variables: ["platform_name", "user_name"],
          usage: 45,
          created: "2024-01-10"
        },
        {
          id: "2",
          name: "Price Alert Notification",
          type: "alert",
          category: "trading",
          subject: "Price Alert: {{symbol}} reached {{price}}",
          content: "Your watchlisted asset {{symbol}} has reached your target price of {{price}}.",
          variables: ["symbol", "price", "direction"],
          usage: 892,
          created: "2024-01-05"
        },
        {
          id: "3",
          name: "Monthly Performance Summary",
          type: "update",
          category: "reports",
          subject: "Your {{month}} Trading Performance",
          content: "Here's your trading performance for {{month}}: Total PnL: {{pnl}}, Win Rate: {{win_rate}}%",
          variables: ["month", "pnl", "win_rate", "trades_count"],
          usage: 156,
          created: "2023-12-28"
        }
      ]

      // Mock user engagement
      const mockEngagement: UserEngagement[] = [
        {
          userId: "user_001",
          username: "active_trader_1",
          email: "trader1@example.com",
          totalMessages: 45,
          openRate: 89.2,
          clickRate: 34.5,
          lastActivity: "2024-01-20T10:30:00Z",
          preferredChannel: "in_app",
          engagementScore: 92,
          status: "active"
        },
        {
          userId: "user_002",
          username: "premium_user",
          email: "premium@example.com",
          totalMessages: 67,
          openRate: 76.1,
          clickRate: 28.9,
          lastActivity: "2024-01-19T14:22:00Z",
          preferredChannel: "email",
          engagementScore: 78,
          status: "active"
        },
        {
          userId: "user_003",
          username: "casual_trader",
          email: "casual@example.com",
          totalMessages: 23,
          openRate: 45.6,
          clickRate: 12.3,
          lastActivity: "2024-01-15T09:15:00Z",
          preferredChannel: "push",
          engagementScore: 56,
          status: "inactive"
        }
      ]

      // Mock metrics
      const mockMetrics: MessagingMetrics = {
        totalCampaigns: 24,
        activeCampaigns: 8,
        messagesDelivered: 45890,
        avgOpenRate: 34.7,
        avgClickRate: 12.3,
        avgConversionRate: 4.8,
        topPerformingCampaign: "Welcome New Users"
      }

      setCampaigns(mockCampaigns)
      setTemplates(mockTemplates) 
      setUserEngagement(mockEngagement)
      setMetrics(mockMetrics)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading messaging data:", error)
      toast.error("Failed to load messaging data")
      setIsLoading(false)
    }
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.message.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesType = typeFilter === "all" || campaign.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [campaigns, searchTerm, statusFilter, typeFilter])

  const engagementTrendData = [
    { date: "Jan 15", opens: 1250, clicks: 445, conversions: 156 },
    { date: "Jan 16", opens: 1430, clicks: 523, conversions: 189 },
    { date: "Jan 17", opens: 1680, clicks: 612, conversions: 234 },
    { date: "Jan 18", opens: 1890, clicks: 735, conversions: 278 },
    { date: "Jan 19", opens: 2100, clicks: 856, conversions: 312 },
    { date: "Jan 20", opens: 2340, clicks: 945, conversions: 367 }
  ]

  const channelPerformanceData = [
    { name: "In-App", messages: 15420, openRate: 78.5, clickRate: 34.2, color: "#3B82F6" },
    { name: "Push", messages: 12890, openRate: 45.2, clickRate: 18.7, color: "#10B981" },
    { name: "Email", messages: 9870, openRate: 32.1, clickRate: 12.4, color: "#F59E0B" },
    { name: "SMS", messages: 7530, openRate: 89.3, clickRate: 45.1, color: "#8B5CF6" }
  ]

  const handleCreateCampaign = async () => {
    try {
      const campaign: MessageCampaign = {
        id: Date.now().toString(),
        name: newCampaign.name,
        type: newCampaign.type,
        status: newCampaign.scheduleType === "now" ? "active" : "scheduled",
        targetAudience: newCampaign.targetAudience,
        message: {
          title: newCampaign.title,
          body: newCampaign.body,
          cta: newCampaign.cta,
          ctaUrl: newCampaign.ctaUrl
        },
        ...(newCampaign.scheduleType === "scheduled" && {
          schedule: {
            sendAt: newCampaign.sendAt,
            timezone: "UTC"
          }
        }),
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        },
        created: new Date().toISOString(),
        author: "Admin",
        tags: newCampaign.tags
      }

      setCampaigns(prev => [campaign, ...prev])
      setIsCreateCampaignOpen(false)
      toast.success("Campaign created successfully!")
      
      // Reset form
      setNewCampaign({
        name: "",
        type: "in_app",
        targetAudience: "all",
        title: "",
        body: "",
        cta: "",
        ctaUrl: "",
        scheduleType: "now",
        sendAt: "",
        tags: []
      })
    } catch (error) {
      toast.error("Failed to create campaign")
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const template: MessageTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        type: newTemplate.type,
        category: newTemplate.category,
        subject: newTemplate.subject,
        content: newTemplate.content,
        variables: newTemplate.variables,
        usage: 0,
        created: new Date().toISOString()
      }

      setTemplates(prev => [template, ...prev])
      setIsCreateTemplateOpen(false)
      toast.success("Template created successfully!")
      
      // Reset form
      setNewTemplate({
        name: "",
        type: "welcome",
        category: "general",
        subject: "",
        content: "",
        variables: []
      })
    } catch (error) {
      toast.error("Failed to create template")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4" />
      case "scheduled": return <Clock className="w-4 h-4" />
      case "completed": return <Award className="w-4 h-4" />
      case "paused": return <AlertTriangle className="w-4 h-4" />
      default: return <Edit className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in_app": return <MessageSquare className="w-4 h-4" />
      case "push": return <Bell className="w-4 h-4" />
      case "email": return <Mail className="w-4 h-4" />
      case "sms": return <MessageCircle className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading messaging system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-400" />
            Messaging System
          </h1>
          <p className="text-gray-400 mt-1">
            Communicate with users through multiple channels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsCreateTemplateOpen(true)}
            variant="outline"
            className="border-gray-600 text-gray-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button 
            onClick={() => setIsCreateCampaignOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Campaign
          </Button>
        </div>
      </div>

      {/* Messaging Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{metrics.totalCampaigns}</p>
                <p className="text-blue-400 text-xs">{metrics.activeCampaigns} active</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Messages Delivered</p>
                <p className="text-2xl font-bold text-white">{metrics.messagesDelivered.toLocaleString()}</p>
                <p className="text-green-400 text-xs">Last 30 days</p>
              </div>
              <Send className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Open Rate</p>
                <p className="text-2xl font-bold text-white">{metrics.avgOpenRate}%</p>
                <p className="text-yellow-400 text-xs">Industry: 28%</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">{metrics.avgConversionRate}%</p>
                <p className="text-purple-400 text-xs">Click to convert</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messaging Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="engagement" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            User Engagement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Engagement Trends</CardTitle>
                <CardDescription>
                  User interaction metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <AreaChart data={engagementTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Area type="monotone" dataKey="opens" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="clicks" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="conversions" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Channel Performance</CardTitle>
                <CardDescription>
                  Performance comparison across message channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelPerformanceData.map((channel) => (
                    <div key={channel.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(channel.name.toLowerCase().replace('-', '_'))}
                          <span className="text-white font-medium">{channel.name}</span>
                        </div>
                        <Badge className={MESSAGE_TYPE_COLORS[channel.name.toLowerCase().replace('-', '_') as keyof typeof MESSAGE_TYPE_COLORS]}>
                          {channel.messages.toLocaleString()} sent
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Open Rate</span>
                            <span className="text-white">{channel.openRate}%</span>
                          </div>
                          <Progress value={channel.openRate} className="h-2 mt-1" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Click Rate</span>
                            <span className="text-white">{channel.clickRate}%</span>
                          </div>
                          <Progress value={channel.clickRate} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Campaigns */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Campaigns</CardTitle>
              <CardDescription>
                Best performing campaigns by conversion rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((campaign) => {
                  const conversionRate = campaign.metrics.sent > 0 
                    ? (campaign.metrics.converted / campaign.metrics.sent) * 100 
                    : 0
                  
                  return (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(campaign.type)}
                        <div>
                          <p className="text-white font-medium">{campaign.name}</p>
                          <p className="text-gray-400 text-sm">{campaign.targetAudience}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-medium">{conversionRate.toFixed(1)}%</p>
                          <p className="text-gray-400 text-sm">conversion</p>
                        </div>
                        <Badge className={MESSAGE_TYPE_COLORS[campaign.type]}>
                          {campaign.type}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Table */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Message Campaigns</CardTitle>
              <CardDescription>
                Manage and monitor your messaging campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Campaign</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Audience</TableHead>
                    <TableHead className="text-gray-300">Sent</TableHead>
                    <TableHead className="text-gray-300">Open Rate</TableHead>
                    <TableHead className="text-gray-300">Conversions</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const openRate = campaign.metrics.sent > 0 
                      ? (campaign.metrics.opened / campaign.metrics.sent) * 100 
                      : 0
                    const conversionRate = campaign.metrics.sent > 0 
                      ? (campaign.metrics.converted / campaign.metrics.sent) * 100 
                      : 0
                    
                    return (
                      <TableRow key={campaign.id} className="border-gray-700">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{campaign.name}</p>
                            <p className="text-gray-400 text-sm">{campaign.message.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${MESSAGE_TYPE_COLORS[campaign.type]} flex items-center w-fit`}>
                            {getTypeIcon(campaign.type)}
                            <span className="ml-1 capitalize">{campaign.type.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${CAMPAIGN_STATUS_COLORS[campaign.status]} flex items-center w-fit`}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-white capitalize">{campaign.targetAudience.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-white">{campaign.metrics.sent.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-white">{openRate.toFixed(1)}%</span>
                            <div className="w-12">
                              <Progress value={openRate} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-white font-medium">{campaign.metrics.converted}</div>
                            <div className="text-gray-400 text-xs">({conversionRate.toFixed(1)}%)</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-400 hover:bg-gray-600/10"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Message Templates</CardTitle>
              <CardDescription>
                Reusable templates for consistent messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="bg-gray-800/50 border-gray-600 hover:border-gray-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                          {template.type}
                        </Badge>
                        <span className="text-gray-400 text-sm">{template.usage} uses</span>
                      </div>
                      <h4 className="text-white font-medium mb-2">{template.name}</h4>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{template.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{template.category}</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/10 h-6 w-6 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-400 hover:bg-gray-600/10 h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Engagement Profiles</CardTitle>
              <CardDescription>
                Individual user messaging engagement and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Total Messages</TableHead>
                    <TableHead className="text-gray-300">Open Rate</TableHead>
                    <TableHead className="text-gray-300">Click Rate</TableHead>
                    <TableHead className="text-gray-300">Preferred Channel</TableHead>
                    <TableHead className="text-gray-300">Engagement Score</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userEngagement.map((user) => (
                    <TableRow key={user.userId} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{user.totalMessages}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-white">{user.openRate.toFixed(1)}%</span>
                          <div className="w-12">
                            <Progress value={user.openRate} className="h-2" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-white">{user.clickRate.toFixed(1)}%</span>
                          <div className="w-12">
                            <Progress value={user.clickRate} className="h-2" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={MESSAGE_TYPE_COLORS[user.preferredChannel]}>
                          {user.preferredChannel.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${user.engagementScore >= 80 ? 'text-green-400' : user.engagementScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {user.engagementScore}
                          </span>
                          <div className="w-12">
                            <Progress value={user.engagementScore} className="h-2" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.status === "active" ? "bg-green-500/20 text-green-400" : user.status === "inactive" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new messaging campaign for your users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome New Users"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-gray-300">Message Type</Label>
                <Select value={newCampaign.type} onValueChange={(value: any) => setNewCampaign(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="in_app">In-App Message</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="audience" className="text-gray-300">Target Audience</Label>
              <Select value={newCampaign.targetAudience} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="new_users">New Users</SelectItem>
                  <SelectItem value="active_traders">Active Traders</SelectItem>
                  <SelectItem value="premium_users">Premium Users</SelectItem>
                  <SelectItem value="inactive_users">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title" className="text-gray-300">Message Title</Label>
              <Input
                id="title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Welcome to our platform!"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="body" className="text-gray-300">Message Body</Label>
              <Textarea
                id="body"
                value={newCampaign.body}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Start your trading journey with us..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cta" className="text-gray-300">Call to Action</Label>
                <Input
                  id="cta"
                  value={newCampaign.cta}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, cta: e.target.value }))}
                  placeholder="Get Started"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="ctaUrl" className="text-gray-300">CTA URL</Label>
                <Input
                  id="ctaUrl"
                  value={newCampaign.ctaUrl}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, ctaUrl: e.target.value }))}
                  placeholder="/dashboard"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Schedule</Label>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="now"
                    checked={newCampaign.scheduleType === "now"}
                    onChange={() => setNewCampaign(prev => ({ ...prev, scheduleType: "now" }))}
                  />
                  <Label htmlFor="now" className="text-gray-300">Send Now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scheduled"
                    checked={newCampaign.scheduleType === "scheduled"}
                    onChange={() => setNewCampaign(prev => ({ ...prev, scheduleType: "scheduled" }))}
                  />
                  <Label htmlFor="scheduled" className="text-gray-300">Schedule</Label>
                </div>
              </div>
              {newCampaign.scheduleType === "scheduled" && (
                <Input
                  type="datetime-local"
                  value={newCampaign.sendAt}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, sendAt: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white mt-2"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateCampaignOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Message Template</DialogTitle>
            <DialogDescription>
              Create a reusable template for consistent messaging
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName" className="text-gray-300">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome Series - Day 1"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="templateType" className="text-gray-300">Template Type</Label>
                <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="templateSubject" className="text-gray-300">Subject/Title</Label>
              <Input
                id="templateSubject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Welcome to {{platform_name}}!"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="templateContent" className="text-gray-300">Content</Label>
              <Textarea
                id="templateContent"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Hi {{user_name}}, welcome to our platform..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="templateCategory" className="text-gray-300">Category</Label>
              <Input
                id="templateCategory"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                placeholder="onboarding"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateTemplateOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
