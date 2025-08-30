"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Send, 
  Eye, 
  MousePointer, 
  UserX, 
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Calendar,
  BarChart3,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

interface EmailMetrics {
  totalSubscribers: number
  activeSubscribers: number
  recentSignups: number
  openRate: number
  clickRate: number
  unsubscribeRate: number
  bounceRate: number
  growthRate: number
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  source: string
  tags: string[]
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
  subscribedAt: Date
  lastActivity?: Date
  customFields?: Record<string, any>
}

interface Campaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  scheduledAt?: Date
  sentAt?: Date
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
    bounced: number
    complained: number
  }
}

export default function NewsletterManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - in production this would come from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics({
        totalSubscribers: 12547,
        activeSubscribers: 11923,
        recentSignups: 234,
        openRate: 68.4,
        clickRate: 12.7,
        unsubscribeRate: 1.2,
        bounceRate: 2.1,
        growthRate: 15.3
      })

      setCampaigns([
        {
          id: '1',
          name: 'Weekly Trading Insights #47',
          subject: 'AI Predicts 20% Bull Run in Tech Stocks',
          status: 'sent',
          sentAt: new Date('2024-01-15'),
          metrics: {
            sent: 11823,
            delivered: 11567,
            opened: 7918,
            clicked: 1502,
            unsubscribed: 23,
            bounced: 256,
            complained: 5
          }
        },
        {
          id: '2', 
          name: 'Market Alert: Crypto Surge',
          subject: 'Emergency Alert: Bitcoin Breaking Resistance',
          status: 'scheduled',
          scheduledAt: new Date('2024-01-22'),
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            bounced: 0,
            complained: 0
          }
        }
      ])

      setSubscribers([
        {
          id: '1',
          email: 'sarah.chen@example.com',
          firstName: 'Sarah',
          lastName: 'Chen',
          source: 'homepage-hero',
          tags: ['premium', 'active'],
          status: 'active',
          subscribedAt: new Date('2024-01-10'),
          lastActivity: new Date('2024-01-15')
        },
        {
          id: '2',
          email: 'michael.r@example.com', 
          firstName: 'Michael',
          lastName: 'Rodriguez',
          source: 'exit-intent',
          tags: ['new'],
          status: 'active',
          subscribedAt: new Date('2024-01-14'),
          lastActivity: new Date('2024-01-14')
        }
      ])

      setIsLoading(false)
    }

    loadData()
  }, [])

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'unsubscribed': return 'bg-yellow-500'
      case 'bounced': return 'bg-red-500'
      case 'complained': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-400 bg-green-400/10'
      case 'scheduled': return 'text-blue-400 bg-blue-400/10'
      case 'sending': return 'text-yellow-400 bg-yellow-400/10'
      case 'draft': return 'text-gray-400 bg-gray-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Mail className="w-8 h-8 text-cyan-400" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Newsletter Management</h2>
          <p className="text-gray-400">Manage subscribers, campaigns, and analytics</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Campaign</DialogTitle>
              </DialogHeader>
              <CampaignEditor />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-cyan-500/20">
            <Users className="w-4 h-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-cyan-500/20">
            <Send className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-cyan-500/20">
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-cyan-500/20">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Subscribers"
              value={metrics?.totalSubscribers.toLocaleString() || '0'}
              change="+15.3%"
              icon={Users}
              positive={true}
            />
            <MetricCard
              title="Open Rate"
              value={`${metrics?.openRate}%`}
              change="+2.4%"
              icon={Eye}
              positive={true}
            />
            <MetricCard
              title="Click Rate"
              value={`${metrics?.clickRate}%`}
              change="+1.8%"
              icon={MousePointer}
              positive={true}
            />
            <MetricCard
              title="Growth Rate"
              value={`+${metrics?.growthRate}%`}
              change="This month"
              icon={TrendingUp}
              positive={true}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map(campaign => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-400">{campaign.subject}</p>
                      </div>
                      <Badge className={getCampaignStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Subscriber Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Homepage Hero</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm text-gray-400">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Exit Intent</span>
                    <div className="flex items-center gap-2">
                      <Progress value={28} className="w-20" />
                      <span className="text-sm text-gray-400">28%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Blog Posts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={18} className="w-20" />
                      <span className="text-sm text-gray-400">18%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Social Media</span>
                    <div className="flex items-center gap-2">
                      <Progress value={9} className="w-20" />
                      <span className="text-sm text-gray-400">9%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6 mt-6">
          {/* Subscriber Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Subscribers ({filteredSubscribers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredSubscribers.map(subscriber => (
                    <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(subscriber.status)}`} />
                        <div>
                          <p className="text-white font-medium">
                            {subscriber.firstName} {subscriber.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{subscriber.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {subscriber.source}
                        </Badge>
                        <div className="text-sm text-gray-400">
                          {subscriber.subscribedAt.toLocaleDateString()}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <CampaignsList campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 mt-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6 mt-6">
          <EmailAutomation />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  positive 
}: {
  title: string
  value: string
  change: string
  icon: any
  positive: boolean
}) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
              {change}
            </p>
          </div>
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Icon className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Campaign Editor Component
function CampaignEditor() {
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    content: '',
    scheduledAt: ''
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Campaign Name
          </label>
          <Input
            placeholder="Weekly Trading Insights #48"
            value={campaignData.name}
            onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Subject Line
          </label>
          <Input
            placeholder="Your Weekly AI Trading Analysis"
            value={campaignData.subject}
            onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Email Content
          </label>
          <Textarea
            placeholder="Your email content here..."
            value={campaignData.content}
            onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
            className="bg-gray-900 border-gray-600 text-white h-32"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Schedule (Optional)
          </label>
          <Input
            type="datetime-local"
            value={campaignData.scheduledAt}
            onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledAt: e.target.value }))}
            className="bg-gray-900 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" className="border-gray-600 text-gray-300">
          Save Draft
        </Button>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          Send Campaign
        </Button>
      </div>
    </div>
  )
}

// Campaigns List Component
function CampaignsList({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Email Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{campaign.name}</h4>
                  <p className="text-sm text-gray-400">{campaign.subject}</p>
                </div>
                <Badge className={getCampaignStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              
              {campaign.status === 'sent' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Sent</p>
                    <p className="text-white font-medium">{campaign.metrics.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Opened</p>
                    <p className="text-white font-medium">
                      {campaign.metrics.opened.toLocaleString()} 
                      <span className="text-green-400 ml-1">
                        ({((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Clicked</p>
                    <p className="text-white font-medium">
                      {campaign.metrics.clicked.toLocaleString()}
                      <span className="text-blue-400 ml-1">
                        ({((campaign.metrics.clicked / campaign.metrics.sent) * 100).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Unsubscribed</p>
                    <p className="text-white font-medium">
                      {campaign.metrics.unsubscribed}
                      <span className="text-red-400 ml-1">
                        ({((campaign.metrics.unsubscribed / campaign.metrics.sent) * 100).toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Email Templates Component
function EmailTemplates() {
  const templates = [
    {
      id: '1',
      name: 'Welcome Series',
      description: 'New subscriber welcome sequence',
      type: 'automation',
      lastModified: new Date('2024-01-10')
    },
    {
      id: '2', 
      name: 'Weekly Newsletter',
      description: 'Standard weekly trading insights',
      type: 'newsletter',
      lastModified: new Date('2024-01-15')
    }
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Email Templates</CardTitle>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-2">{template.name}</h4>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <Badge variant="outline">{template.type}</Badge>
                <span>Modified {template.lastModified.toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Email Automation Component
function EmailAutomation() {
  const automations = [
    {
      id: '1',
      name: 'Welcome Sequence',
      trigger: 'New Subscription',
      status: 'active',
      emails: 3,
      subscribers: 1247
    },
    {
      id: '2',
      name: 'Re-engagement Campaign',
      trigger: 'Inactive for 30 days',
      status: 'active',
      emails: 2,
      subscribers: 89
    }
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Email Automation</CardTitle>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {automations.map(automation => (
            <div key={automation.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{automation.name}</h4>
                  <p className="text-sm text-gray-400">Trigger: {automation.trigger}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  {automation.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Emails in sequence</p>
                  <p className="text-white font-medium">{automation.emails}</p>
                </div>
                <div>
                  <p className="text-gray-400">Active subscribers</p>
                  <p className="text-white font-medium">{automation.subscribers.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getCampaignStatusColor(status: string) {
  switch (status) {
    case 'sent': return 'text-green-400 bg-green-400/10'
    case 'scheduled': return 'text-blue-400 bg-blue-400/10' 
    case 'sending': return 'text-yellow-400 bg-yellow-400/10'
    case 'draft': return 'text-gray-400 bg-gray-400/10'
    case 'cancelled': return 'text-red-400 bg-red-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}


