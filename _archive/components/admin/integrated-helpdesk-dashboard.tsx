"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Ticket,
  Clock,
  Search,
  Plus,
  Star,
  BarChart3,
  Eye,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Activity,
  Timer,
  UserCheck,
  RefreshCw,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  Send,
  Paperclip,
  Tag,
  Zap,
  Award,
} from "lucide-react"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  helpDeskSystem,
  type SupportTicket,
  type HelpDeskMetrics,
  type KnowledgeBaseArticle,
} from "@/lib/integrated-helpdesk-system"
import { toast } from "sonner"

// Mock data for charts
const ticketVolumeData = [
  { date: "Jan 15", tickets: 45, resolved: 42, satisfaction: 4.2 },
  { date: "Jan 16", tickets: 52, resolved: 48, satisfaction: 4.3 },
  { date: "Jan 17", tickets: 38, resolved: 35, satisfaction: 4.1 },
  { date: "Jan 18", tickets: 61, resolved: 58, satisfaction: 4.4 },
  { date: "Jan 19", tickets: 47, resolved: 44, satisfaction: 4.2 },
  { date: "Jan 20", tickets: 55, resolved: 52, satisfaction: 4.5 },
  { date: "Jan 21", tickets: 43, resolved: 41, satisfaction: 4.3 },
]

const responseTimeData = [
  { hour: "00:00", avgResponse: 15, target: 30 },
  { hour: "04:00", avgResponse: 12, target: 30 },
  { hour: "08:00", avgResponse: 25, target: 30 },
  { hour: "12:00", avgResponse: 35, target: 30 },
  { hour: "16:00", avgResponse: 28, target: 30 },
  { hour: "20:00", avgResponse: 18, target: 30 },
]

const categoryDistribution = [
  { name: "Technical", value: 35, color: "#3B82F6" },
  { name: "Billing", value: 25, color: "#10B981" },
  { name: "General", value: 20, color: "#F59E0B" },
  { name: "Bug Reports", value: 12, color: "#EF4444" },
  { name: "Feature Requests", value: 8, color: "#8B5CF6" },
]

const agentPerformanceData = [
  { name: "Sarah J.", tickets: 156, satisfaction: 4.7, responseTime: 15 },
  { name: "Michael C.", tickets: 203, satisfaction: 4.8, responseTime: 12 },
  { name: "Emma W.", tickets: 134, satisfaction: 4.6, responseTime: 18 },
  { name: "David L.", tickets: 189, satisfaction: 4.5, responseTime: 22 },
]

export default function IntegratedHelpDeskDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [metrics, setMetrics] = useState<HelpDeskMetrics | null>(null)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Form states
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent" | "critical",
    category: "general" as "technical" | "billing" | "general" | "feature-request" | "bug-report",
    customerName: "",
    customerEmail: "",
    customerTier: "free" as "free" | "premium" | "enterprise",
  })

  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    summary: "",
    category: "general",
    tags: "",
    visibility: "public" as "public" | "internal" | "premium",
  })

  const [messageText, setMessageText] = useState("")

  useEffect(() => {
    loadHelpDeskData()
  }, [])

  const loadHelpDeskData = async () => {
    setIsLoading(true)
    try {
      const [ticketsData, metricsData, kbData] = await Promise.all([
        helpDeskSystem.getTickets(),
        helpDeskSystem.getMetrics(),
        helpDeskSystem.searchKnowledgeBase("", { visibility: "public" }),
      ])

      setTickets(ticketsData)
      setMetrics(metricsData)
      setKnowledgeBase(kbData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to load help desk data:", error)
      toast.error("Failed to load help desk data")
    } finally {
      setIsLoading(false)
    }
  }

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.customerEmail.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const ticket = await helpDeskSystem.createTicket({
        subject: newTicket.subject,
        description: newTicket.description,
        priority: helpDeskSystem.getPriorities().find((p) => p.id === newTicket.priority),
        category: helpDeskSystem.getCategories().find((c) => c.id === newTicket.category),
        customer: {
          id: `customer-${Date.now()}`,
          name: newTicket.customerName || newTicket.customerEmail,
          email: newTicket.customerEmail,
          tier: newTicket.customerTier,
          timezone: "UTC",
        },
      })

      setTickets((prev) => [ticket, ...prev])
      setNewTicket({
        subject: "",
        description: "",
        priority: "medium",
        category: "general",
        customerName: "",
        customerEmail: "",
        customerTier: "free",
      })
      setIsCreateTicketOpen(false)
      toast.success("Ticket created successfully")
    } catch (error) {
      console.error("Failed to create ticket:", error)
      toast.error("Failed to create ticket")
    }
  }

  const createKnowledgeBaseArticle = async () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    try {
      const article = await helpDeskSystem.createKnowledgeBaseArticle({
        title: newArticle.title,
        content: newArticle.content,
        summary: newArticle.summary,
        category: newArticle.category,
        tags: newArticle.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        visibility: newArticle.visibility,
        status: "published",
        author: {
          id: "admin-1",
          name: "Admin User",
          email: "admin@nexural.com",
        },
      })

      setKnowledgeBase((prev) => [article, ...prev])
      setNewArticle({
        title: "",
        content: "",
        summary: "",
        category: "general",
        tags: "",
        visibility: "public",
      })
      setIsCreateArticleOpen(false)
      toast.success("Knowledge base article created successfully")
    } catch (error) {
      console.error("Failed to create article:", error)
      toast.error("Failed to create article")
    }
  }

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const statusObj = helpDeskSystem.getStatuses().find((s) => s.id === status)
      if (!statusObj) return

      const updatedTicket = await helpDeskSystem.updateTicket(ticketId, { status: statusObj })
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updatedTicket : t)))

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket)
      }

      toast.success(`Ticket ${status}`)
    } catch (error) {
      console.error("Failed to update ticket:", error)
      toast.error("Failed to update ticket")
    }
  }

  const sendMessage = async () => {
    if (!selectedTicket || !messageText.trim()) return

    try {
      await helpDeskSystem.addMessage(selectedTicket.id, {
        author: {
          id: "agent-1",
          name: "Support Agent",
          email: "support@nexural.com",
          type: "agent",
        },
        content: messageText,
        isInternal: false,
      })

      // Refresh ticket data
      const updatedTickets = await helpDeskSystem.getTickets()
      const updatedTicket = updatedTickets.find((t) => t.id === selectedTicket.id)

      setTickets(updatedTickets)
      if (updatedTicket) {
        setSelectedTicket(updatedTicket)
      }

      setMessageText("")
      toast.success("Message sent")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "open":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "assigned":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "in-progress":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "escalated":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "closed":
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.status.id === filterStatus
    const matchesPriority = filterPriority === "all" || ticket.priority.id === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              INTEGRATED <span className="text-primary">HELP DESK</span>
            </h1>
            <p className="text-gray-400">Comprehensive customer support and ticket management system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              onClick={loadHelpDeskData}
              disabled={isLoading}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={isCreateArticleOpen} onOpenChange={setIsCreateArticleOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Help Desk Overview Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Open Tickets</p>
                      <p className="text-2xl font-bold text-white">{metrics.openTickets}</p>
                      <p className="text-red-400 text-sm">Needs attention</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Ticket className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Response</p>
                      <p className="text-2xl font-bold text-white">{Math.round(metrics.avgResponseTime)}m</p>
                      <p className="text-green-400 text-sm">Under target</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Timer className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">SLA Compliance</p>
                      <p className="text-2xl font-bold text-white">{metrics.slaCompliance.toFixed(1)}%</p>
                      <p className="text-yellow-400 text-sm">Needs improvement</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Target className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Satisfaction</p>
                      <p className="text-2xl font-bold text-white">{metrics.customerSatisfaction.toFixed(1)}/5</p>
                      <p className="text-green-400 text-sm">Excellent</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Star className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Resolved Today</p>
                      <p className="text-2xl font-bold text-white">{metrics.resolvedTickets}</p>
                      <p className="text-blue-400 text-sm">+15% vs yesterday</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Agents</p>
                      <p className="text-2xl font-bold text-white">
                        {metrics.agentPerformance.filter((a) => a.status === "online").length}
                      </p>
                      <p className="text-purple-400 text-sm">Online now</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <UserCheck className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Main Help Desk Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-xl border-primary/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Ticket className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="knowledge-base"
              className="data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ticket Volume Trends */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                    Ticket Volume & Resolution
                  </CardTitle>
                  <CardDescription className="text-gray-400">Daily ticket trends and resolution rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      tickets: { label: "New Tickets", color: "#3B82F6" },
                      resolved: { label: "Resolved", color: "#10B981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ticketVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tickets" fill="#3B82F6" name="New Tickets" />
                        <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Response Time Analysis */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    Response Time Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">Average response times vs SLA targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      avgResponse: { label: "Avg Response", color: "#F59E0B" },
                      target: { label: "SLA Target", color: "#EF4444" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="hour" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="avgResponse"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="target"
                          stroke="#EF4444"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "#EF4444", strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution & Agent Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Ticket Categories
                  </CardTitle>
                  <CardDescription className="text-gray-400">Distribution by support category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary" />
                    Agent Performance
                  </CardTitle>
                  <CardDescription className="text-gray-400">Top performing support agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentPerformanceData.map((agent, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-primary/20"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-black text-sm">
                              {agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-white">{agent.name}</h4>
                            <p className="text-sm text-gray-400">{agent.tickets} tickets resolved</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-medium">{agent.satisfaction}</span>
                          </div>
                          <p className="text-sm text-gray-400">{agent.responseTime}m avg response</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {/* Ticket Filters */}
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tickets by subject, customer, or email..."
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
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-black/40 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white">Support Tickets</CardTitle>
                    <CardDescription className="text-gray-400">{filteredTickets.length} tickets found</CardDescription>
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
                                  <Badge className={getStatusColor(ticket.status.id)}>{ticket.status.name}</Badge>
                                  <Badge className={getPriorityColor(ticket.priority.id)}>{ticket.priority.name}</Badge>
                                </div>
                                {ticket.sla.breached && (
                                  <Badge className="bg-red-600/20 text-red-300 border-red-600/30">
                                    <Clock className="w-3 h-3 mr-1" />
                                    SLA Breached
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-400">#{ticket.id}</span>
                                <span className="flex items-center text-gray-400">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {ticket.messages.length}
                                </span>
                                <span className="text-gray-400">
                                  Assigned: {ticket.assignedTo?.name || "Unassigned"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span>{formatTimeAgo(ticket.updatedAt)}</span>
                              </div>
                            </div>

                            {ticket.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {ticket.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                    <Tag className="w-3 h-3 mr-1" />
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

              {/* Ticket Details Panel */}
              <div>
                <Card className="bg-black/40 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTicket ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-white mb-2">{selectedTicket.subject}</h3>
                          <div className="flex items-center space-x-2 mb-4">
                            <Badge className={getStatusColor(selectedTicket.status.id)}>
                              {selectedTicket.status.name}
                            </Badge>
                            <Badge className={getPriorityColor(selectedTicket.priority.id)}>
                              {selectedTicket.priority.name}
                            </Badge>
                            {selectedTicket.sla.breached && (
                              <Badge className="bg-red-600/20 text-red-300 border-red-600/30">SLA Breached</Badge>
                            )}
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
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-green-500 text-white text-xs">
                                      {selectedTicket.assignedTo.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm text-white">{selectedTicket.assignedTo.name}</p>
                                    <p className="text-xs text-gray-400">{selectedTicket.assignedTo.email}</p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-gray-400">Unassigned</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-400">Category</label>
                            <p className="text-sm text-white mt-1 capitalize">{selectedTicket.category.name}</p>
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

                        {/* Messages */}
                        <div className="space-y-3">
                          <label className="text-sm text-gray-400">Conversation</label>
                          <ScrollArea className="h-[200px] border border-gray-700 rounded-lg p-3">
                            <div className="space-y-3">
                              {selectedTicket.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`p-3 rounded-lg ${
                                    message.author.type === "customer"
                                      ? "bg-blue-500/10 border-l-4 border-blue-500"
                                      : "bg-green-500/10 border-l-4 border-green-500"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">{message.author.name}</span>
                                    <span className="text-xs text-gray-400">{formatTimeAgo(message.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-gray-300">{message.content}</p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Type your response..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white"
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700 text-gray-300 bg-transparent"
                            >
                              <Paperclip className="w-4 h-4 mr-1" />
                              Attach
                            </Button>
                            <Button onClick={sendMessage} disabled={!messageText.trim()} size="sm">
                              <Send className="w-4 h-4 mr-1" />
                              Send
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-700">
                          <Button
                            className="w-full bg-primary hover:bg-primary/80 text-black"
                            onClick={() => updateTicketStatus(selectedTicket.id, "in-progress")}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Conversation
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent"
                              onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              className="border-yellow-700 text-yellow-400 hover:bg-yellow-900/20 bg-transparent"
                              onClick={() => updateTicketStatus(selectedTicket.id, "escalated")}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                          </div>
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

          <TabsContent value="knowledge-base" className="space-y-6">
            {/* Knowledge Base Articles */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Knowledge Base Articles</CardTitle>
                <CardDescription className="text-gray-400">{knowledgeBase.length} articles available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {knowledgeBase.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 rounded-lg border border-gray-700 bg-gray-800/20 hover:bg-gray-800/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-white text-sm">{article.title}</h3>
                        <Badge
                          className={
                            article.visibility === "public"
                              ? "bg-green-500/20 text-green-400"
                              : article.visibility === "premium"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                          }
                        >
                          {article.visibility}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {article.views}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {article.likes}
                          </span>
                        </div>
                        <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Customer Satisfaction Trends
                  </CardTitle>
                  <CardDescription className="text-gray-400">Satisfaction ratings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      satisfaction: { label: "Satisfaction", color: "#10B981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ticketVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="satisfaction"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-primary" />
                    Resolution Time Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-400">Time to resolve tickets by priority</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { priority: "Critical", time: "2.5h", color: "bg-red-500", percentage: 95 },
                      { priority: "Urgent", time: "4.2h", color: "bg-orange-500", percentage: 88 },
                      { priority: "High", time: "8.1h", color: "bg-yellow-500", percentage: 92 },
                      { priority: "Medium", time: "24h", color: "bg-blue-500", percentage: 85 },
                      { priority: "Low", time: "72h", color: "bg-green-500", percentage: 78 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{item.priority}</span>
                          <span className="text-gray-400">Avg: {item.time}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 text-right">{item.percentage}% within SLA</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {/* Agent Management */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Support Agents</CardTitle>
                <CardDescription className="text-gray-400">Manage support team and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics?.agentPerformance.map((agent, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-700 bg-gray-800/20 hover:bg-gray-800/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-black">
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-400">{agent.email}</p>
                          <Badge
                            className={
                              agent.status === "online"
                                ? "bg-green-500/20 text-green-400"
                                : agent.status === "busy"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {agent.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Tickets Resolved</span>
                          <span className="text-sm text-white">{agent.performance.ticketsResolved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Avg Response</span>
                          <span className="text-sm text-white">{agent.performance.avgResponseTime}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Satisfaction</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-sm text-white">{agent.performance.customerSatisfaction}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">SLA Compliance</span>
                          <span className="text-sm text-white">{agent.performance.slaCompliance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Current Load</span>
                          <span className="text-sm text-white">
                            {agent.currentTicketCount}/{agent.maxConcurrentTickets}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {agent.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-700 text-gray-300 bg-transparent"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 bg-transparent">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Ticket Dialog */}
        <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new support ticket for a customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName" className="text-gray-300">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    value={newTicket.customerName}
                    onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="text-gray-300">
                    Customer Email *
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newTicket.customerEmail}
                    onChange={(e) => setNewTicket({ ...newTicket, customerEmail: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="text-gray-300">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Detailed description of the issue..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-gray-300">
                    Priority
                  </Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value: any) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="bug-report">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerTier" className="text-gray-300">
                    Customer Tier
                  </Label>
                  <Select
                    value={newTicket.customerTier}
                    onValueChange={(value: any) => setNewTicket({ ...newTicket, customerTier: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateTicketOpen(false)}
                className="border-gray-700 text-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={createTicket} className="bg-primary hover:bg-primary/80 text-black">
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Knowledge Base Article Dialog */}
        <Dialog open={isCreateArticleOpen} onOpenChange={setIsCreateArticleOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Knowledge Base Article</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new article for the knowledge base
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="articleTitle" className="text-gray-300">
                  Title *
                </Label>
                <Input
                  id="articleTitle"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Article title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="articleSummary" className="text-gray-300">
                  Summary
                </Label>
                <Input
                  id="articleSummary"
                  value={newArticle.summary}
                  onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief summary of the article"
                />
              </div>
              <div>
                <Label htmlFor="articleContent" className="text-gray-300">
                  Content *
                </Label>
                <Textarea
                  id="articleContent"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Article content in Markdown format..."
                  rows={8}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="articleCategory" className="text-gray-300">
                    Category
                  </Label>
                  <Select
                    value={newArticle.category}
                    onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="trading">Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="articleVisibility" className="text-gray-300">
                    Visibility
                  </Label>
                  <Select
                    value={newArticle.visibility}
                    onValueChange={(value: any) => setNewArticle({ ...newArticle, visibility: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="articleTags" className="text-gray-300">
                    Tags
                  </Label>
                  <Input
                    id="articleTags"
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateArticleOpen(false)}
                className="border-gray-700 text-gray-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={createKnowledgeBaseArticle} className="bg-primary hover:bg-primary/80 text-black">
                Create Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
