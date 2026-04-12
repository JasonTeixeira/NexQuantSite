"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
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
  Zap,
  Globe,
  Database,
  MessageSquare,
  CreditCard,
  Cloud,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  advancedIntegrationHub,
  type Integration,
  type DataFlow,
  type WebhookEndpoint,
  type APIEndpoint,
} from "@/lib/advanced-integration-hub"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdvancedIntegrationHubDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([])
  const [integrationAnalytics, setIntegrationAnalytics] = useState<any>(null)
  const [dataFlowAnalytics, setDataFlowAnalytics] = useState<any>(null)
  const [apiAnalytics, setApiAnalytics] = useState<any>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isCreateIntegrationOpen, setIsCreateIntegrationOpen] = useState(false)
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false)
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false)
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null)
  const [executingFlow, setExecutingFlow] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setIntegrations(advancedIntegrationHub.getIntegrations())
    setDataFlows(advancedIntegrationHub.getDataFlows())
    setWebhooks(advancedIntegrationHub.getWebhookEndpoints())
    setApiEndpoints(advancedIntegrationHub.getAPIEndpoints())
    setIntegrationAnalytics(advancedIntegrationHub.getIntegrationAnalytics())
    setDataFlowAnalytics(advancedIntegrationHub.getDataFlowAnalytics())
    setApiAnalytics(advancedIntegrationHub.getAPIAnalytics())
  }

  const handleTestIntegration = async (integrationId: string) => {
    setTestingIntegration(integrationId)
    try {
      const result = await advancedIntegrationHub.testIntegration(integrationId)
      // Handle test result (show notification, etc.)
      console.log("Test result:", result)
    } finally {
      setTestingIntegration(null)
    }
  }

  const handleExecuteFlow = async (flowId: string) => {
    setExecutingFlow(flowId)
    try {
      const result = await advancedIntegrationHub.executeDataFlow(flowId)
      console.log("Flow execution result:", result)
      loadData() // Refresh data to show updated metrics
    } finally {
      setExecutingFlow(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      case "paused":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <Pause className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "trading":
        return <TrendingUp className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "communication":
        return <MessageSquare className="h-4 w-4" />
      case "storage":
        return <Cloud className="h-4 w-4" />
      case "analytics":
        return <BarChart className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "api":
        return <Globe className="h-4 w-4" />
      case "webhook":
        return <Zap className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "file":
        return <Cloud className="h-4 w-4" />
      case "messaging":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Integration Hub</h1>
          <p className="text-muted-foreground">Manage integrations, data flows, and API endpoints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateIntegrationOpen} onOpenChange={setIsCreateIntegrationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Integration</DialogTitle>
                <DialogDescription>Connect to a new third-party service or API</DialogDescription>
              </DialogHeader>
              <CreateIntegrationForm
                onSuccess={() => {
                  setIsCreateIntegrationOpen(false)
                  loadData()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      {integrationAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationAnalytics.totalIntegrations}</div>
              <p className="text-xs text-muted-foreground">{integrationAnalytics.activeIntegrations} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationAnalytics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{integrationAnalytics.errorRate.toFixed(2)}% error rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationAnalytics.averageUptime.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all integrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Flows</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataFlowAnalytics?.totalFlows || 0}</div>
              <p className="text-xs text-muted-foreground">{dataFlowAnalytics?.activeFlows || 0} active</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="dataflows">Data Flows</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedIntegration(integration)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(integration.category)}
                        {integration.name}
                        <Badge variant="outline" className={`${getStatusColor(integration.status)} text-white`}>
                          {getStatusIcon(integration.status)}
                          {integration.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {integration.provider} • {integration.type.toUpperCase()} • {integration.category}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTestIntegration(integration.id)
                        }}
                        disabled={testingIntegration === integration.id}
                      >
                        {testingIntegration === integration.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Requests</div>
                      <div className="text-muted-foreground">{integration.metrics.totalRequests.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Success Rate</div>
                      <div className="text-muted-foreground">
                        {((integration.metrics.successfulRequests / integration.metrics.totalRequests) * 100).toFixed(
                          1,
                        )}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Avg Response</div>
                      <div className="text-muted-foreground">{integration.metrics.averageResponseTime}ms</div>
                    </div>
                    <div>
                      <div className="font-medium">Uptime</div>
                      <div className="text-muted-foreground">{integration.metrics.uptime.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Health Score</span>
                      <span>{integration.metrics.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={integration.metrics.uptime} className="h-2" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last sync: {integration.lastSync.toLocaleString()} • Data transferred:{" "}
                    {(integration.metrics.dataTransferred / 1e9).toFixed(2)}GB
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dataflows" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Data Flows</h3>
            <Dialog open={isCreateFlowOpen} onOpenChange={setIsCreateFlowOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Flow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Data Flow</DialogTitle>
                  <DialogDescription>Set up automated data synchronization between integrations</DialogDescription>
                </DialogHeader>
                <CreateDataFlowForm
                  integrations={integrations}
                  onSuccess={() => {
                    setIsCreateFlowOpen(false)
                    loadData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {dataFlows.map((flow) => (
              <Card key={flow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {flow.name}
                        <Badge variant="outline" className={`${getStatusColor(flow.status)} text-white`}>
                          {getStatusIcon(flow.status)}
                          {flow.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {integrations.find((i) => i.id === flow.sourceIntegrationId)?.name} →
                        {integrations.find((i) => i.id === flow.targetIntegrationId)?.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteFlow(flow.id)}
                        disabled={executingFlow === flow.id}
                      >
                        {executingFlow === flow.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Total Runs</div>
                      <div className="text-muted-foreground">{flow.metrics.totalRuns.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Success Rate</div>
                      <div className="text-muted-foreground">
                        {flow.metrics.totalRuns > 0
                          ? ((flow.metrics.successfulRuns / flow.metrics.totalRuns) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Records Processed</div>
                      <div className="text-muted-foreground">{flow.metrics.recordsProcessed.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Avg Runtime</div>
                      <div className="text-muted-foreground">{flow.metrics.averageRunTime.toFixed(1)}s</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Success Rate</span>
                      <span>
                        {flow.metrics.totalRuns > 0
                          ? ((flow.metrics.successfulRuns / flow.metrics.totalRuns) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        flow.metrics.totalRuns > 0 ? (flow.metrics.successfulRuns / flow.metrics.totalRuns) * 100 : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Schedule: {flow.schedule.type} • Last run: {flow.lastRun.toLocaleString()}
                    {flow.metrics.lastError && <span className="text-red-500"> • Error: {flow.metrics.lastError}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
            <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                  <DialogDescription>Set up a new webhook endpoint for receiving events</DialogDescription>
                </DialogHeader>
                <CreateWebhookForm
                  onSuccess={() => {
                    setIsCreateWebhookOpen(false)
                    loadData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {webhook.name}
                        <Badge variant="outline" className={`${getStatusColor(webhook.status)} text-white`}>
                          {getStatusIcon(webhook.status)}
                          {webhook.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {webhook.method} {webhook.url}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Total Deliveries</div>
                      <div className="text-muted-foreground">{webhook.metrics.totalDeliveries.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Success Rate</div>
                      <div className="text-muted-foreground">
                        {((webhook.metrics.successfulDeliveries / webhook.metrics.totalDeliveries) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Avg Response</div>
                      <div className="text-muted-foreground">{webhook.metrics.averageResponseTime}ms</div>
                    </div>
                    <div>
                      <div className="font-medium">Events</div>
                      <div className="text-muted-foreground">{webhook.events.length} types</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-medium mb-2">Subscribed Events</div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Auth: {webhook.authentication.type} • Last delivery: {webhook.metrics.lastDelivery.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Endpoints</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Endpoint
            </Button>
          </div>

          <div className="grid gap-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {endpoint.method} {endpoint.path}
                        <Badge variant="outline">{endpoint.authentication ? "Auth Required" : "Public"}</Badge>
                      </CardTitle>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Total Requests</div>
                      <div className="text-muted-foreground">{endpoint.metrics.totalRequests.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Error Rate</div>
                      <div className="text-muted-foreground">{endpoint.metrics.errorRate.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Avg Response</div>
                      <div className="text-muted-foreground">{endpoint.metrics.averageResponseTime}ms</div>
                    </div>
                    <div>
                      <div className="font-medium">P99 Response</div>
                      <div className="text-muted-foreground">{endpoint.metrics.p99ResponseTime}ms</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-medium mb-2">Rate Limits</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Per minute:</span>{" "}
                        {endpoint.rateLimit.requestsPerMinute}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Per hour:</span> {endpoint.rateLimit.requestsPerHour}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Per day:</span> {endpoint.rateLimit.requestsPerDay}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Parameters: {endpoint.parameters.length} • Responses: {endpoint.responses.length} types
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {integrationAnalytics && dataFlowAnalytics && apiAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Integration Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Integrations by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={integrationAnalytics.integrationsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {integrationAnalytics.integrationsByCategory.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Request Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>24-Hour Request Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={integrationAnalytics.recentActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="requests" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="errors" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationAnalytics.topIntegrations.map((integration: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">{integration.provider}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{integration.requests.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{integration.uptime.toFixed(1)}% uptime</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Flow Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Flow Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataFlowAnalytics.flowPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="successRate" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* API Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle>API Response Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={apiAnalytics.responseTimeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="path" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#8884d8" name="Average" />
                      <Bar dataKey="p95" fill="#82ca9d" name="P95" />
                      <Bar dataKey="p99" fill="#ffc658" name="P99" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* API Methods Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>API Requests by Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={apiAnalytics.requestsByMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) => `${method} ${percentage.toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {apiAnalytics.requestsByMethod.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedIntegration.category)}
                {selectedIntegration.name}
                <Badge className={`${getStatusColor(selectedIntegration.status)} text-white`}>
                  {selectedIntegration.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>Integration details and configuration</DialogDescription>
            </DialogHeader>
            <IntegrationDetailView integration={selectedIntegration} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Create Integration Form Component
function CreateIntegrationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    type: "api" as const,
    category: "other" as const,
    status: "inactive" as const,
    config: {
      endpoint: "",
      authentication: "api_key" as const,
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 6000,
        requestsPerDay: 144000,
        burstLimit: 25,
      },
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    advancedIntegrationHub.createIntegration(formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Integration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="messaging">Messaging</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trading">Trading</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endpoint">API Endpoint</Label>
        <Input
          id="endpoint"
          value={formData.config.endpoint}
          onChange={(e) =>
            setFormData({
              ...formData,
              config: { ...formData.config, endpoint: e.target.value },
            })
          }
          placeholder="https://api.example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="auth">Authentication Type</Label>
        <Select
          value={formData.config.authentication}
          onValueChange={(value: any) =>
            setFormData({
              ...formData,
              config: { ...formData.config, authentication: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api_key">API Key</SelectItem>
            <SelectItem value="oauth">OAuth</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Integration</Button>
      </div>
    </form>
  )
}

// Create Data Flow Form Component
function CreateDataFlowForm({
  integrations,
  onSuccess,
}: {
  integrations: Integration[]
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    sourceIntegrationId: "",
    targetIntegrationId: "",
    status: "active" as const,
    schedule: {
      type: "interval" as const,
      interval: 60,
      timezone: "UTC",
    },
    transformations: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    advancedIntegrationHub.createDataFlow(formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Flow Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source Integration</Label>
          <Select
            value={formData.sourceIntegrationId}
            onValueChange={(value) => setFormData({ ...formData, sourceIntegrationId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {integrations.map((integration) => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target">Target Integration</Label>
          <Select
            value={formData.targetIntegrationId}
            onValueChange={(value) => setFormData({ ...formData, targetIntegrationId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              {integrations.map((integration) => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduleType">Schedule Type</Label>
          <Select
            value={formData.schedule.type}
            onValueChange={(value: any) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule, type: value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="interval">Interval</SelectItem>
              <SelectItem value="cron">Cron</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interval">Interval (minutes)</Label>
          <Input
            id="interval"
            type="number"
            value={formData.schedule.interval}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: { ...formData.schedule, interval: Number.parseInt(e.target.value) },
              })
            }
            min="1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Flow</Button>
      </div>
    </form>
  )
}

// Create Webhook Form Component
function CreateWebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "POST" as const,
    headers: {
      "Content-Type": "application/json",
    },
    authentication: {
      type: "none" as const,
    },
    events: [""],
    status: "active" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    advancedIntegrationHub.createWebhookEndpoint(formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Webhook Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select value={formData.method} onValueChange={(value: any) => setFormData({ ...formData, method: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://api.example.com/webhook"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="events">Events (comma-separated)</Label>
        <Input
          id="events"
          value={formData.events.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              events: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="user.created, payment.completed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authType">Authentication Type</Label>
        <Select
          value={formData.authentication.type}
          onValueChange={(value: any) =>
            setFormData({
              ...formData,
              authentication: { ...formData.authentication, type: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="signature">Signature</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Webhook</Button>
      </div>
    </form>
  )
}

// Integration Detail View Component
function IntegrationDetailView({ integration }: { integration: Integration }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{integration.metrics.totalRequests.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Requests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {((integration.metrics.successfulRequests / integration.metrics.totalRequests) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{integration.metrics.averageResponseTime}ms</div>
          <div className="text-sm text-muted-foreground">Avg Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{integration.metrics.uptime.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Uptime</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Provider</span>
                <span className="text-sm">{integration.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">{integration.type.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline">{integration.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Authentication</span>
                <Badge variant="outline">{integration.config.authentication}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{integration.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <span className="text-sm">{integration.lastSync.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            {integration.config.rateLimits && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Per Minute</span>
                  <span className="text-sm">{integration.config.rateLimits.requestsPerMinute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Per Hour</span>
                  <span className="text-sm">{integration.config.rateLimits.requestsPerHour}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Per Day</span>
                  <span className="text-sm">{integration.config.rateLimits.requestsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Burst Limit</span>
                  <span className="text-sm">{integration.config.rateLimits.burstLimit}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Success Rate</span>
                <span>
                  {((integration.metrics.successfulRequests / integration.metrics.totalRequests) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(integration.metrics.successfulRequests / integration.metrics.totalRequests) * 100} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uptime</span>
                <span>{integration.metrics.uptime.toFixed(1)}%</span>
              </div>
              <Progress value={integration.metrics.uptime} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Data Transferred:</span>{" "}
                {(integration.metrics.dataTransferred / 1e9).toFixed(2)}GB
              </div>
              <div>
                <span className="font-medium">Failed Requests:</span>{" "}
                {integration.metrics.failedRequests.toLocaleString()}
              </div>
            </div>
            {integration.metrics.lastError && (
              <div className="text-sm">
                <span className="font-medium text-red-500">Last Error:</span> {integration.metrics.lastError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
