"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TicketIcon,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Edit,
  Filter,
  Search,
  Plus,
  Download,
  Mail,
  Phone,
  HeadphonesIcon,
  UserCheck,
  Activity,
  Target,
  Award,
  Zap,
  Calendar,
  Settings,
  BookOpen,
  HelpCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Send,
  Paperclip,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from "lucide-react"
import { SupportManager, mockSupportTickets, SUPPORT_CONFIG } from "@/lib/support/support-system"

// Mock data for support dashboard
const mockSupportStats = {
  tickets: {
    total: 1247,
    open: 89,
    pending: 23,
    resolved: 1135,
    slaBreached: 12,
    avgResolutionTime: 4.2, // hours
    avgFirstResponseTime: 18, // minutes
    satisfactionScore: 4.6
  },
  chat: {
    activeSessions: 7,
    queuedChats: 2,
    avgWaitTime: 2.5, // minutes
    avgChatDuration: 8.7, // minutes
    totalChatsToday: 45,
    satisfactionScore: 4.7
  },
  agents: {
    online: 8,
    away: 2,
    offline: 3,
    totalActive: 13,
    avgPerformance: 4.5
  },
  knowledgeBase: {
    totalArticles: 156,
    publishedArticles: 134,
    totalViews: 12847,
    avgRating: 4.4
  }
}

const mockTickets = [
  {
    id: 'TKT-2024-001',
    subject: 'Unable to place trades',
    customer: { name: 'John Smith', email: 'john@example.com', avatar: '/avatar1.jpg' },
    priority: 'high',
    status: 'open',
    category: 'trading',
    assignedTo: 'Sarah Johnson',
    created: '2024-01-15T10:30:00Z',
    updated: '2024-01-15T14:22:00Z',
    slaStatus: 'onTrack'
  },
  {
    id: 'TKT-2024-002',
    subject: 'Payment processing error',
    customer: { name: 'Alice Brown', email: 'alice@example.com', avatar: '/avatar2.jpg' },
    priority: 'urgent',
    status: 'pending',
    category: 'billing',
    assignedTo: 'Mike Wilson',
    created: '2024-01-15T09:15:00Z',
    updated: '2024-01-15T13:45:00Z',
    slaStatus: 'atRisk'
  },
  {
    id: 'TKT-2024-003',
    subject: 'Account verification issue',
    customer: { name: 'Bob Johnson', email: 'bob@example.com', avatar: '/avatar3.jpg' },
    priority: 'medium',
    status: 'resolved',
    category: 'account',
    assignedTo: 'Lisa Chen',
    created: '2024-01-14T16:20:00Z',
    updated: '2024-01-15T09:30:00Z',
    slaStatus: 'met'
  }
]

const mockAgents = [
  {
    id: 'agent_001',
    name: 'Sarah Johnson',
    email: 'sarah@nexural.com',
    avatar: '/agent1.jpg',
    status: 'online',
    role: 'Senior Agent',
    department: 'Technical Support',
    activeTickets: 5,
    activeChats: 2,
    performance: {
      avgResolution: 3.2,
      avgRating: 4.8,
      totalResolved: 234,
      satisfactionScore: 96
    },
    lastActivity: '2 minutes ago'
  },
  {
    id: 'agent_002',
    name: 'Mike Wilson',
    email: 'mike@nexural.com',
    avatar: '/agent2.jpg',
    status: 'busy',
    role: 'Agent',
    department: 'Billing Support',
    activeTickets: 8,
    activeChats: 3,
    performance: {
      avgResolution: 4.1,
      avgRating: 4.6,
      totalResolved: 187,
      satisfactionScore: 92
    },
    lastActivity: 'Active now'
  }
]

const mockAnalyticsData = [
  { date: '2024-01-08', tickets: 45, resolved: 38, satisfaction: 4.6 },
  { date: '2024-01-09', tickets: 52, resolved: 47, satisfaction: 4.5 },
  { date: '2024-01-10', tickets: 38, resolved: 41, satisfaction: 4.7 },
  { date: '2024-01-11', tickets: 61, resolved: 55, satisfaction: 4.4 },
  { date: '2024-01-12', tickets: 49, resolved: 52, satisfaction: 4.8 },
  { date: '2024-01-13', tickets: 44, resolved: 46, satisfaction: 4.6 },
  { date: '2024-01-14', tickets: 53, resolved: 49, satisfaction: 4.7 },
  { date: '2024-01-15', tickets: 41, resolved: 43, satisfaction: 4.5 }
]

const getPriorityColor = (priority: string) => {
  const colors = SUPPORT_CONFIG.defaultPriorities
  return colors[priority as keyof typeof colors]?.color || '#6B7280'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'open': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'pending': return 'text-amber-400 bg-amber-900/20 border-amber-700'
    case 'resolved': return 'text-purple-400 bg-purple-900/20 border-purple-700'
    case 'closed': return 'text-gray-400 bg-gray-900/20 border-gray-700'
    case 'escalated': return 'text-red-400 bg-red-900/20 border-red-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

const getSLAStatusColor = (status: string) => {
  switch (status) {
    case 'met': return 'text-green-400'
    case 'onTrack': return 'text-blue-400'
    case 'atRisk': return 'text-amber-400'
    case 'breached': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export default function CustomerSupportAdmin() {
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0])
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [ticketFilter, setTicketFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Customer Support Management
          </h1>
          <p className="text-gray-400">
            Manage tickets, live chat, knowledge base, and support operations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Open Tickets</p>
                <p className="text-xl font-bold text-blue-400">{mockSupportStats.tickets.open}</p>
                <p className="text-xs text-blue-400 flex items-center mt-1">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -5 from yesterday
                </p>
              </div>
              <TicketIcon className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Resolved Today</p>
                <p className="text-xl font-bold text-green-400">43</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +8 from yesterday
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Response</p>
                <p className="text-xl font-bold text-amber-400">{mockSupportStats.tickets.avgFirstResponseTime}m</p>
                <p className="text-xs text-amber-400 flex items-center mt-1">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  -3m improvement
                </p>
              </div>
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Satisfaction</p>
                <p className="text-xl font-bold text-purple-400">{mockSupportStats.tickets.satisfactionScore}</p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +0.2 this week
                </p>
              </div>
              <Star className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Chats</p>
                <p className="text-xl font-bold text-cyan-400">{mockSupportStats.chat.activeSessions}</p>
                <p className="text-xs text-cyan-400 flex items-center mt-1">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {mockSupportStats.chat.queuedChats} in queue
                </p>
              </div>
              <HeadphonesIcon className="w-6 h-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">SLA Breached</p>
                <p className="text-xl font-bold text-red-400">{mockSupportStats.tickets.slaBreached}</p>
                <p className="text-xs text-red-400 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Support Tabs */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Support Tickets</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={ticketFilter} onValueChange={setTicketFilter}>
                      <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>Manage and track support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {mockTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-cyan-900/20 border-cyan-700'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={ticket.customer.avatar} />
                              <AvatarFallback>{ticket.customer.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm">{ticket.id}</div>
                              <div className="text-xs text-gray-400">{ticket.customer.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: getPriorityColor(ticket.priority) + '20',
                                color: getPriorityColor(ticket.priority),
                                borderColor: getPriorityColor(ticket.priority)
                              }}
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="font-medium text-sm truncate">{ticket.subject}</div>
                          <div className="text-xs text-gray-500">
                            {ticket.category} • {ticket.assignedTo}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className={getSLAStatusColor(ticket.slaStatus)}>
                              SLA: {ticket.slaStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Ticket Detail */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket?.id}</CardTitle>
                    <CardDescription>{selectedTicket?.subject}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedTicket?.customer.avatar} />
                      <AvatarFallback>{selectedTicket?.customer.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{selectedTicket?.customer.name}</div>
                      <div className="text-sm text-gray-400">{selectedTicket?.customer.email}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Priority</div>
                      <Badge
                        style={{
                          backgroundColor: getPriorityColor(selectedTicket?.priority || 'medium') + '20',
                          color: getPriorityColor(selectedTicket?.priority || 'medium'),
                          borderColor: getPriorityColor(selectedTicket?.priority || 'medium')
                        }}
                      >
                        {selectedTicket?.priority}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <Badge className={getStatusColor(selectedTicket?.status || 'new')}>
                        {selectedTicket?.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-gray-400">Category</div>
                      <div className="font-semibold">{selectedTicket?.category}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Assigned To</div>
                      <div className="font-semibold">{selectedTicket?.assignedTo}</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Assign Agent" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {mockAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="space-y-2">
                    <Label>Add Response</Label>
                    <Textarea
                      placeholder="Type your response..."
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <Button size="sm" variant="outline">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach
                      </Button>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Internal Note
                        </Button>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Chat Tab */}
        <TabsContent value="live-chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Chats */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Active Chat Sessions</CardTitle>
                <CardDescription>Monitor ongoing customer conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat session items would go here */}
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Live chat interface will be implemented here</p>
                    <p className="text-sm">Real-time chat monitoring and management</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Queue & Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Chat Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{mockSupportStats.chat.activeSessions}</div>
                      <div className="text-sm text-gray-400">Active Chats</div>
                    </div>
                    <div className="p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400">{mockSupportStats.chat.queuedChats}</div>
                      <div className="text-sm text-gray-400">In Queue</div>
                    </div>
                    <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{mockSupportStats.chat.avgWaitTime}m</div>
                      <div className="text-sm text-gray-400">Avg Wait</div>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{mockSupportStats.chat.satisfactionScore}</div>
                      <div className="text-sm text-gray-400">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent List */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Support Agents</CardTitle>
                  <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Manage agent availability and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAgents.map((agent) => (
                    <div key={agent.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={agent.avatar} alt={agent.name} />
                              <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              agent.status === 'online' ? 'bg-green-400' :
                              agent.status === 'busy' ? 'bg-amber-400' :
                              agent.status === 'away' ? 'bg-gray-400' : 'bg-red-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold">{agent.name}</div>
                            <div className="text-sm text-gray-400">{agent.role} • {agent.department}</div>
                            <div className="text-xs text-gray-500">{agent.lastActivity}</div>
                          </div>
                        </div>
                        <Badge className={
                          agent.status === 'online' ? 'text-green-400 bg-green-900/20 border-green-700' :
                          agent.status === 'busy' ? 'text-amber-400 bg-amber-900/20 border-amber-700' :
                          agent.status === 'away' ? 'text-gray-400 bg-gray-900/20 border-gray-700' :
                          'text-red-400 bg-red-900/20 border-red-700'
                        }>
                          {agent.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{agent.activeTickets}</div>
                          <div className="text-xs text-gray-400">Active Tickets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-400">{agent.activeChats}</div>
                          <div className="text-xs text-gray-400">Active Chats</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{agent.performance.totalResolved}</div>
                          <div className="text-xs text-gray-400">Resolved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-400">{agent.performance.avgRating}</div>
                          <div className="text-xs text-gray-400">Rating</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                          Avg Resolution: {formatDuration(agent.performance.avgResolution * 60)}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agent Performance Summary */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Overall agent statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Online Agents</div>
                        <UserCheck className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-green-400">{mockSupportStats.agents.online}</div>
                    </div>
                    
                    <div className="p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Away</div>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-amber-400">{mockSupportStats.agents.away}</div>
                    </div>
                    
                    <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Offline</div>
                        <XCircle className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-400">{mockSupportStats.agents.offline}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Team Performance</span>
                      <span className="text-lg font-bold text-cyan-400">{mockSupportStats.agents.avgPerformance}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= mockSupportStats.agents.avgPerformance
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Support Trends */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Support Trends</CardTitle>
                <CardDescription>Ticket volume and resolution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tickets" 
                        stackId="1"
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.6}
                        name="Tickets Created"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="resolved" 
                        stackId="2"
                        stroke="#10B981" 
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Tickets Resolved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Trend */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Satisfaction scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        domain={['dataMin - 0.1', 'dataMax + 0.1']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [`${value}/5`, 'Satisfaction']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="satisfaction" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        name="Satisfaction Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Support Categories</CardTitle>
                <CardDescription>Ticket distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {SUPPORT_CONFIG.defaultCategories.map((category) => (
                    <div key={category.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">
                        {Math.floor(Math.random() * 50) + 10}
                      </div>
                      <div className="text-sm font-semibold">{category.name}</div>
                      <div className="text-xs text-gray-400">{category.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge">
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Knowledge Base Management</h3>
            <p>Article creation, categorization, and analytics will be implemented here</p>
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="text-center py-12 text-gray-400">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Support Settings</h3>
            <p>SLA configuration, escalation rules, and system settings will be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


