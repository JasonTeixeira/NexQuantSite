"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
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
  Area,
} from "recharts"
import { Mail, TrendingUp, Target, Play, Pause, Edit, Plus, Search, Activity, CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  marketingAutomationEngine,
  type Campaign,
  type EmailTemplate,
  type CustomerSegment,
  type LeadScore,
} from "@/lib/marketing-automation-engine"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function MarketingAutomationDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [leadScores, setLeadScores] = useState<LeadScore[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [segmentAnalytics, setSegmentAnalytics] = useState<any>(null)
  const [leadAnalytics, setLeadAnalytics] = useState<any>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setCampaigns(marketingAutomationEngine.getCampaigns())
    setTemplates(marketingAutomationEngine.getTemplates())
    setSegments(marketingAutomationEngine.getSegments())
    setLeadScores(marketingAutomationEngine.getLeadScores())
    setAnalytics(marketingAutomationEngine.getCampaignAnalytics())
    setSegmentAnalytics(marketingAutomationEngine.getSegmentAnalytics())
    setLeadAnalytics(marketingAutomationEngine.getLeadScoringAnalytics())
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || campaign.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Edit className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "qualified":
        return "bg-green-500"
      case "hot":
        return "bg-red-500"
      case "warm":
        return "bg-yellow-500"
      case "cold":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <p className="text-muted-foreground">Manage campaigns, segments, and lead scoring</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>Set up a new marketing campaign with templates and segments</DialogDescription>
              </DialogHeader>
              <CreateCampaignForm
                templates={templates}
                segments={segments}
                onSuccess={() => {
                  setIsCreateCampaignOpen(false)
                  loadData()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">{analytics.activeCampaigns} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.rates.openRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{analytics.metrics.opened.toLocaleString()} opens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.rates.clickRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">{analytics.metrics.clicked.toLocaleString()} clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.metrics.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{analytics.rates.conversionRate.toFixed(1)}% conversion</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {campaign.name}
                        <Badge variant="outline" className={`${getStatusColor(campaign.status)} text-white`}>
                          {getStatusIcon(campaign.status)}
                          {campaign.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {campaign.type.toUpperCase()} • Created {campaign.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{campaign.metrics.sent.toLocaleString()} sent</div>
                      <div className="text-xs text-muted-foreground">
                        {((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1)}% opened
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Delivered</div>
                      <div className="text-muted-foreground">{campaign.metrics.delivered.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Clicked</div>
                      <div className="text-muted-foreground">{campaign.metrics.clicked.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Converted</div>
                      <div className="text-muted-foreground">{campaign.metrics.converted.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Revenue</div>
                      <div className="text-muted-foreground">${campaign.metrics.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Performance</span>
                      <span>{((campaign.metrics.converted / campaign.metrics.sent) * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={(campaign.metrics.converted / campaign.metrics.sent) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>Design a reusable email template for your campaigns</DialogDescription>
                </DialogHeader>
                <CreateTemplateForm
                  onSuccess={() => {
                    setIsCreateTemplateOpen(false)
                    loadData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{template.type}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium">Subject</div>
                      <div className="text-sm text-muted-foreground">{template.subject}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Variables</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {template.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Segments</h3>
            <Dialog open={isCreateSegmentOpen} onOpenChange={setIsCreateSegmentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Segment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Customer Segment</DialogTitle>
                  <DialogDescription>Define criteria to group customers for targeted campaigns</DialogDescription>
                </DialogHeader>
                <CreateSegmentForm
                  onSuccess={() => {
                    setIsCreateSegmentOpen(false)
                    loadData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{segment.name}</CardTitle>
                      <CardDescription>{segment.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{segment.userCount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">users</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Criteria</div>
                    {segment.criteria.map((criteria, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{criteria.field}</Badge>
                        <span className="text-muted-foreground">{criteria.operator}</span>
                        <span>{criteria.value.toString()}</span>
                        {index < segment.criteria.length - 1 && <Badge variant="secondary">{criteria.logic}</Badge>}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-4">
                    Created {segment.createdAt.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {leadAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadAnalytics.totalLeads}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadAnalytics.averageScore}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadAnalytics.distribution.qualified}</div>
                  <p className="text-xs text-muted-foreground">
                    {((leadAnalytics.distribution.qualified / leadAnalytics.totalLeads) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadAnalytics.distribution.hot}</div>
                  <p className="text-xs text-muted-foreground">
                    {((leadAnalytics.distribution.hot / leadAnalytics.totalLeads) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Distribution */}
            {leadAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Lead Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(leadAnalytics.distribution).map(([tier, count]) => ({
                          name: tier,
                          value: count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(leadAnalytics.distribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Scoring Factors */}
            {leadAnalytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Scoring Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadAnalytics.topFactors.map((factor: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{factor.factor}</span>
                          <span>{factor.impact}%</span>
                        </div>
                        <Progress value={factor.impact} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lead Scores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Lead Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadScores.slice(0, 10).map((lead) => (
                  <div key={lead.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{lead.userId}</div>
                        <div className="text-sm text-muted-foreground">
                          Updated {lead.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{lead.score}</div>
                        <Badge className={`${getTierColor(lead.tier)} text-white`}>{lead.tier}</Badge>
                      </div>
                      <div className="w-32">
                        <Progress value={lead.score} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && segmentAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "Sent", value: analytics.metrics.sent },
                        { name: "Delivered", value: analytics.metrics.delivered },
                        { name: "Opened", value: analytics.metrics.opened },
                        { name: "Clicked", value: analytics.metrics.clicked },
                        { name: "Converted", value: analytics.metrics.converted },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Segment Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Segment Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={segmentAnalytics.segmentGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: "Sent", count: analytics.metrics.sent, rate: 100 },
                      { stage: "Delivered", count: analytics.metrics.delivered, rate: analytics.rates.deliveryRate },
                      { stage: "Opened", count: analytics.metrics.opened, rate: analytics.rates.openRate },
                      { stage: "Clicked", count: analytics.metrics.clicked, rate: analytics.rates.clickRate },
                      { stage: "Converted", count: analytics.metrics.converted, rate: analytics.rates.conversionRate },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.stage}</span>
                          <span>
                            {item.count.toLocaleString()} ({item.rate.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={item.rate} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">${analytics.metrics.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold">
                          ${(analytics.metrics.revenue / analytics.metrics.converted).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue per Conversion</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">
                          ${(analytics.metrics.revenue / analytics.metrics.sent).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue per Email</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCampaign.name}
                <Badge className={`${getStatusColor(selectedCampaign.status)} text-white`}>
                  {selectedCampaign.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>Campaign details and performance metrics</DialogDescription>
            </DialogHeader>
            <CampaignDetailView campaign={selectedCampaign} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Create Campaign Form Component
function CreateCampaignForm({
  templates,
  segments,
  onSuccess,
}: {
  templates: EmailTemplate[]
  segments: CustomerSegment[]
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "email" as const,
    templateId: "",
    segmentId: "",
    scheduledAt: "",
    settings: {
      sendTime: "09:00",
      timezone: "UTC",
      frequency: "once" as const,
      abTestEnabled: false,
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    marketingAutomationEngine.createCampaign({
      ...formData,
      status: "draft",
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
    })

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Campaign Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template">Email Template</Label>
          <Select
            value={formData.templateId}
            onValueChange={(value) => setFormData({ ...formData, templateId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment">Target Segment</Label>
          <Select value={formData.segmentId} onValueChange={(value) => setFormData({ ...formData, segmentId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name} ({segment.userCount} users)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="abTest"
          checked={formData.settings.abTestEnabled}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              settings: { ...formData.settings, abTestEnabled: checked },
            })
          }
        />
        <Label htmlFor="abTest">Enable A/B Testing</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Campaign</Button>
      </div>
    </form>
  )
}

// Create Template Form Component
function CreateTemplateForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    type: "promotional" as const,
    variables: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    marketingAutomationEngine.createTemplate(formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Template Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Email Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          placeholder="Use {{variableName}} for dynamic content"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Template</Button>
      </div>
    </form>
  )
}

// Create Segment Form Component
function CreateSegmentForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    criteria: [{ field: "", operator: "equals" as const, value: "", logic: "and" as const }],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    marketingAutomationEngine.createSegment(formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Segment Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Criteria</Label>
        {formData.criteria.map((criteria, index) => (
          <div key={index} className="grid grid-cols-4 gap-2">
            <Input
              placeholder="Field"
              value={criteria.field}
              onChange={(e) => {
                const newCriteria = [...formData.criteria]
                newCriteria[index].field = e.target.value
                setFormData({ ...formData, criteria: newCriteria })
              }}
            />
            <Select
              value={criteria.operator}
              onValueChange={(value: any) => {
                const newCriteria = [...formData.criteria]
                newCriteria[index].operator = value
                setFormData({ ...formData, criteria: newCriteria })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Value"
              value={criteria.value}
              onChange={(e) => {
                const newCriteria = [...formData.criteria]
                newCriteria[index].value = e.target.value
                setFormData({ ...formData, criteria: newCriteria })
              }}
            />
            <Select
              value={criteria.logic}
              onValueChange={(value: any) => {
                const newCriteria = [...formData.criteria]
                newCriteria[index].logic = value
                setFormData({ ...formData, criteria: newCriteria })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Segment</Button>
      </div>
    </form>
  )
}

// Campaign Detail View Component
function CampaignDetailView({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{campaign.metrics.sent.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{campaign.metrics.delivered.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{campaign.metrics.opened.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Opened</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{campaign.metrics.clicked.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Clicked</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Delivery Rate</span>
                  <span>{((campaign.metrics.delivered / campaign.metrics.sent) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(campaign.metrics.delivered / campaign.metrics.sent) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Open Rate</span>
                  <span>{((campaign.metrics.opened / campaign.metrics.delivered) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(campaign.metrics.opened / campaign.metrics.delivered) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Click Rate</span>
                  <span>{((campaign.metrics.clicked / campaign.metrics.opened) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(campaign.metrics.clicked / campaign.metrics.opened) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conversion Rate</span>
                  <span>{((campaign.metrics.converted / campaign.metrics.clicked) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(campaign.metrics.converted / campaign.metrics.clicked) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">{campaign.type.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Send Time</span>
                <span className="text-sm">
                  {campaign.settings.sendTime} {campaign.settings.timezone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Frequency</span>
                <span className="text-sm">{campaign.settings.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">A/B Testing</span>
                <Badge variant={campaign.settings.abTestEnabled ? "default" : "secondary"}>
                  {campaign.settings.abTestEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{campaign.createdAt.toLocaleDateString()}</span>
              </div>
              {campaign.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Scheduled</span>
                  <span className="text-sm">{campaign.scheduledAt.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
