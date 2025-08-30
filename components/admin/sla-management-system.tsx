"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  BarChart3,
  Activity,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

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
    autoEscalate: boolean
  }[]
  businessHours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
    excludeWeekends: boolean
    holidays: string[]
  }
  notifications: {
    warningThreshold: number // percentage of time elapsed
    criticalThreshold: number // percentage of time elapsed
    channels: ("email" | "slack" | "sms" | "webhook")[]
  }
  active: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  performance: {
    compliance: number
    breaches: number
    avgResponseTime: number
    avgResolutionTime: number
  }
}

interface SLABreach {
  id: string
  ticketId: string
  policyId: string
  breachType: "response" | "resolution"
  breachTime: Date
  expectedTime: Date
  actualTime?: Date
  severity: "minor" | "major" | "critical"
  impact: string
  rootCause?: string
  resolution?: string
  preventionMeasures?: string[]
  status: "open" | "investigating" | "resolved" | "closed"
}

interface SLAAlert {
  id: string
  ticketId: string
  policyId: string
  alertType: "warning" | "critical" | "breach"
  message: string
  createdAt: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export default function SLAManagementSystem() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([])
  const [breaches, setBreaches] = useState<SLABreach[]>([])
  const [alerts, setAlerts] = useState<SLAAlert[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<SLAPolicy | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("policies")

  const [newPolicy, setNewPolicy] = useState<Partial<SLAPolicy>>({
    name: "",
    description: "",
    customerTier: "all",
    priority: "medium",
    responseTime: 60,
    resolutionTime: 24,
    escalationRules: [],
    businessHours: {
      enabled: true,
      start: "09:00",
      end: "17:00",
      timezone: "EST",
      excludeWeekends: true,
      holidays: [],
    },
    notifications: {
      warningThreshold: 75,
      criticalThreshold: 90,
      channels: ["email"],
    },
    active: true,
  })

  // Initialize mock data
  useEffect(() => {
    const mockPolicies: SLAPolicy[] = [
      {
        id: "sla-001",
        name: "Enterprise Critical",
        description: "Critical issues for enterprise customers requiring immediate attention",
        customerTier: "enterprise",
        priority: "critical",
        responseTime: 15,
        resolutionTime: 4,
        escalationRules: [
          {
            level: 1,
            triggerAfter: 10,
            assignTo: ["senior-agent-001", "senior-agent-002"],
            notifyManagement: false,
            autoEscalate: true,
          },
          {
            level: 2,
            triggerAfter: 30,
            assignTo: ["manager-001"],
            notifyManagement: true,
            autoEscalate: true,
          },
          {
            level: 3,
            triggerAfter: 60,
            assignTo: ["director-001"],
            notifyManagement: true,
            autoEscalate: false,
          },
        ],
        businessHours: {
          enabled: false,
          start: "00:00",
          end: "23:59",
          timezone: "UTC",
          excludeWeekends: false,
          holidays: [],
        },
        notifications: {
          warningThreshold: 50,
          criticalThreshold: 75,
          channels: ["email", "slack", "sms"],
        },
        active: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: "admin@company.com",
        performance: {
          compliance: 94.5,
          breaches: 3,
          avgResponseTime: 12,
          avgResolutionTime: 3.2,
        },
      },
      {
        id: "sla-002",
        name: "Premium Standard",
        description: "Standard response times for premium customers",
        customerTier: "premium",
        priority: "high",
        responseTime: 60,
        resolutionTime: 24,
        escalationRules: [
          {
            level: 1,
            triggerAfter: 120,
            assignTo: ["senior-agent-001"],
            notifyManagement: false,
            autoEscalate: true,
          },
          {
            level: 2,
            triggerAfter: 240,
            assignTo: ["manager-001"],
            notifyManagement: true,
            autoEscalate: false,
          },
        ],
        businessHours: {
          enabled: true,
          start: "08:00",
          end: "18:00",
          timezone: "EST",
          excludeWeekends: true,
          holidays: ["2024-12-25", "2024-01-01"],
        },
        notifications: {
          warningThreshold: 75,
          criticalThreshold: 90,
          channels: ["email", "slack"],
        },
        active: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: "admin@company.com",
        performance: {
          compliance: 89.2,
          breaches: 8,
          avgResponseTime: 45,
          avgResolutionTime: 18.5,
        },
      },
      {
        id: "sla-003",
        name: "Free Tier Basic",
        description: "Basic support for free tier customers",
        customerTier: "free",
        priority: "low",
        responseTime: 240,
        resolutionTime: 72,
        escalationRules: [
          {
            level: 1,
            triggerAfter: 480,
            assignTo: ["agent-001"],
            notifyManagement: false,
            autoEscalate: false,
          },
        ],
        businessHours: {
          enabled: true,
          start: "09:00",
          end: "17:00",
          timezone: "EST",
          excludeWeekends: true,
          holidays: ["2024-12-25", "2024-01-01"],
        },
        notifications: {
          warningThreshold: 80,
          criticalThreshold: 95,
          channels: ["email"],
        },
        active: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        createdBy: "admin@company.com",
        performance: {
          compliance: 96.8,
          breaches: 2,
          avgResponseTime: 180,
          avgResolutionTime: 48.3,
        },
      },
    ]

    const mockBreaches: SLABreach[] = [
      {
        id: "breach-001",
        ticketId: "TK-001",
        policyId: "sla-001",
        breachType: "response",
        breachTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expectedTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        actualTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        severity: "critical",
        impact: "Enterprise customer API outage affecting trading operations",
        rootCause: "High ticket volume during system maintenance",
        resolution: "Additional senior agents assigned, escalated to Level 2",
        preventionMeasures: ["Increase staffing during maintenance", "Implement auto-escalation"],
        status: "resolved",
      },
      {
        id: "breach-002",
        ticketId: "TK-005",
        policyId: "sla-002",
        breachType: "resolution",
        breachTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        expectedTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        severity: "major",
        impact: "Premium customer billing issue delayed resolution",
        rootCause: "Complex billing system integration issue",
        status: "investigating",
      },
    ]

    const mockAlerts: SLAAlert[] = [
      {
        id: "alert-001",
        ticketId: "TK-003",
        policyId: "sla-002",
        alertType: "warning",
        message: "Ticket TK-003 approaching response time SLA (75% elapsed)",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
      },
      {
        id: "alert-002",
        ticketId: "TK-007",
        policyId: "sla-001",
        alertType: "critical",
        message: "Critical ticket TK-007 approaching SLA breach (90% elapsed)",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        acknowledged: true,
        acknowledgedBy: "sarah.johnson@company.com",
        acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ]

    setPolicies(mockPolicies)
    setBreaches(mockBreaches)
    setAlerts(mockAlerts)
  }, [])

  const handleCreatePolicy = () => {
    const policy: SLAPolicy = {
      ...newPolicy,
      id: `sla-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "current-user@company.com",
      performance: {
        compliance: 100,
        breaches: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
      },
    } as SLAPolicy

    setPolicies([...policies, policy])
    setIsCreateDialogOpen(false)
    setNewPolicy({
      name: "",
      description: "",
      customerTier: "all",
      priority: "medium",
      responseTime: 60,
      resolutionTime: 24,
      escalationRules: [],
      businessHours: {
        enabled: true,
        start: "09:00",
        end: "17:00",
        timezone: "EST",
        excludeWeekends: true,
        holidays: [],
      },
      notifications: {
        warningThreshold: 75,
        criticalThreshold: 90,
        channels: ["email"],
      },
      active: true,
    })
    toast.success("SLA policy created successfully")
  }

  const handleDeletePolicy = (policyId: string) => {
    setPolicies(policies.filter((p) => p.id !== policyId))
    toast.success("SLA policy deleted successfully")
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: "current-user@company.com",
              acknowledgedAt: new Date(),
            }
          : alert,
      ),
    )
    toast.success("Alert acknowledged")
  }

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return "text-green-400"
    if (compliance >= 90) return "text-yellow-400"
    return "text-red-400"
  }

  const getComplianceStatus = (compliance: number) => {
    if (compliance >= 95) return "Excellent"
    if (compliance >= 90) return "Good"
    if (compliance >= 80) return "Needs Improvement"
    return "Critical"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600/20 text-red-300 border-red-600/30"
      case "major":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "minor":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "breach":
        return "bg-red-600/20 text-red-300 border-red-600/30"
      case "critical":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const overallCompliance = policies.reduce((sum, p) => sum + p.performance.compliance, 0) / policies.length
  const totalBreaches = breaches.length
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-6">
      {/* SLA Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Overall Compliance</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(overallCompliance)}`}>
              {overallCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-400 mt-1">{getComplianceStatus(overallCompliance)}</p>
            <Progress value={overallCompliance} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{policies.filter((p) => p.active).length}</div>
            <p className="text-xs text-gray-400 mt-1">{policies.length} total policies</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">SLA Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalBreaches}</div>
            <p className="text-xs text-red-400 mt-1">{breaches.filter((b) => b.status === "open").length} open</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{unacknowledgedAlerts}</div>
            <p className="text-xs text-yellow-400 mt-1">require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main SLA Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="policies" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Shield className="w-4 h-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="breaches" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Breaches
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">SLA Policies</h2>
              <p className="text-gray-400">Manage service level agreements and escalation rules</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New SLA Policy</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Define service level agreements and escalation procedures
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Policy Name</label>
                      <Input
                        value={newPolicy.name}
                        onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                        className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                        placeholder="e.g., Enterprise Critical"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Customer Tier</label>
                      <Select
                        value={newPolicy.customerTier}
                        onValueChange={(value) => setNewPolicy({ ...newPolicy, customerTier: value as any })}
                      >
                        <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">All Tiers</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="free">Free</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <Textarea
                      value={newPolicy.description}
                      onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                      className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                      placeholder="Describe when this policy applies..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Priority Level</label>
                      <Select
                        value={newPolicy.priority}
                        onValueChange={(value) => setNewPolicy({ ...newPolicy, priority: value as any })}
                      >
                        <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Response Time (minutes)</label>
                      <Input
                        type="number"
                        value={newPolicy.responseTime}
                        onChange={(e) => setNewPolicy({ ...newPolicy, responseTime: Number(e.target.value) })}
                        className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Resolution Time (hours)</label>
                      <Input
                        type="number"
                        value={newPolicy.resolutionTime}
                        onChange={(e) => setNewPolicy({ ...newPolicy, resolutionTime: Number(e.target.value) })}
                        className="mt-1 bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Business Hours</label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPolicy.businessHours?.enabled}
                        onCheckedChange={(checked) =>
                          setNewPolicy({
                            ...newPolicy,
                            businessHours: { ...newPolicy.businessHours!, enabled: checked },
                          })
                        }
                      />
                      <span className="text-sm text-white">Apply only during business hours</span>
                    </div>
                    {newPolicy.businessHours?.enabled && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          type="time"
                          value={newPolicy.businessHours.start}
                          onChange={(e) =>
                            setNewPolicy({
                              ...newPolicy,
                              businessHours: { ...newPolicy.businessHours!, start: e.target.value },
                            })
                          }
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Input
                          type="time"
                          value={newPolicy.businessHours.end}
                          onChange={(e) =>
                            setNewPolicy({
                              ...newPolicy,
                              businessHours: { ...newPolicy.businessHours!, end: e.target.value },
                            })
                          }
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Select
                          value={newPolicy.businessHours.timezone}
                          onValueChange={(value) =>
                            setNewPolicy({
                              ...newPolicy,
                              businessHours: { ...newPolicy.businessHours!, timezone: value },
                            })
                          }
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="EST">EST</SelectItem>
                            <SelectItem value="PST">PST</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPolicy.active}
                      onCheckedChange={(checked) => setNewPolicy({ ...newPolicy, active: checked })}
                    />
                    <span className="text-sm text-white">Active Policy</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePolicy} className="bg-primary hover:bg-primary/80 text-black">
                    Create Policy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id} className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        {policy.name}
                        {!policy.active && <Badge className="ml-2 bg-gray-500/20 text-gray-400">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">{policy.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPolicy(policy)
                          setIsEditDialogOpen(true)
                        }}
                        className="border-gray-700 text-gray-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="border-red-700 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">SLA Compliance</span>
                      <span className={`text-lg font-bold ${getComplianceColor(policy.performance.compliance)}`}>
                        {policy.performance.compliance.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={policy.performance.compliance} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{policy.performance.breaches} breaches</span>
                      <span>{getComplianceStatus(policy.performance.compliance)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Avg Response:</span>
                      <p className="text-white">{policy.performance.avgResponseTime}m</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Resolution:</span>
                      <p className="text-white">{policy.performance.avgResolutionTime.toFixed(1)}h</p>
                    </div>
                  </div>

                  {policy.escalationRules.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-400 mb-2 block">Escalation Rules:</span>
                      <div className="space-y-1">
                        {policy.escalationRules.map((rule, index) => (
                          <div key={index} className="text-xs text-gray-300 bg-gray-700/50 p-2 rounded">
                            Level {rule.level}: After {rule.triggerAfter}m
                            {rule.autoEscalate && (
                              <Badge className="ml-2 bg-blue-500/20 text-blue-400 text-xs">Auto</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-xs text-gray-400">
                      Created {new Date(policy.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                        <Activity className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Breaches Tab */}
        <TabsContent value="breaches" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">SLA Breaches</h2>
            <p className="text-gray-400">Track and analyze service level agreement violations</p>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent SLA Breaches</CardTitle>
              <CardDescription className="text-gray-400">
                {breaches.length} total breaches • {breaches.filter((b) => b.status === "open").length} open
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breaches.map((breach) => (
                  <div key={breach.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-white">Ticket {breach.ticketId}</h3>
                          <Badge className={getSeverityColor(breach.severity)}>{breach.severity}</Badge>
                          <Badge
                            className={
                              breach.status === "resolved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {breach.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{breach.impact}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Type: {breach.breachType}</span>
                          <span>•</span>
                          <span>Breached: {new Date(breach.breachTime).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-400">
                          {Math.floor((breach.breachTime.getTime() - breach.expectedTime.getTime()) / (1000 * 60))}m
                          late
                        </p>
                        {breach.actualTime && (
                          <p className="text-xs text-gray-400">
                            Resolved: {new Date(breach.actualTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {breach.rootCause && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Root Cause:</span>
                        <p className="text-sm text-white">{breach.rootCause}</p>
                      </div>
                    )}

                    {breach.resolution && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Resolution:</span>
                        <p className="text-sm text-white">{breach.resolution}</p>
                      </div>
                    )}

                    {breach.preventionMeasures && breach.preventionMeasures.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-400">Prevention Measures:</span>
                        <ul className="text-sm text-white mt-1 space-y-1">
                          {breach.preventionMeasures.map((measure, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">SLA Alerts</h2>
              <p className="text-gray-400">Monitor and respond to SLA warnings and critical alerts</p>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {unacknowledgedAlerts} unacknowledged
            </Badge>
          </div>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Alerts</CardTitle>
              <CardDescription className="text-gray-400">Real-time SLA monitoring and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.acknowledged ? "bg-gray-800/30 border-gray-700" : "bg-gray-800/50 border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getAlertTypeColor(alert.alertType)}>{alert.alertType}</Badge>
                          <span className="text-sm text-gray-400">Ticket {alert.ticketId}</span>
                          {alert.acknowledged && <Badge className="bg-green-500/20 text-green-400">Acknowledged</Badge>}
                        </div>
                        <p className="text-sm text-white mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                          {alert.acknowledgedBy && (
                            <>
                              <span>•</span>
                              <span>Acked by {alert.acknowledgedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="bg-primary hover:bg-primary/80 text-black"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">SLA Analytics</h2>
            <p className="text-gray-400">Comprehensive SLA performance analysis and trends</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trends */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Compliance Trends</CardTitle>
                <CardDescription className="text-gray-400">SLA compliance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <TrendingUp className="w-16 h-16 opacity-50" />
                  <span className="ml-4">Compliance trend chart would go here</span>
                </div>
              </CardContent>
            </Card>

            {/* Breach Analysis */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Breach Analysis</CardTitle>
                <CardDescription className="text-gray-400">Breach patterns and root causes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Response Time Breaches</span>
                    <span className="text-lg font-bold text-red-400">
                      {breaches.filter((b) => b.breachType === "response").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Resolution Time Breaches</span>
                    <span className="text-lg font-bold text-red-400">
                      {breaches.filter((b) => b.breachType === "resolution").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Critical Severity</span>
                    <span className="text-lg font-bold text-red-400">
                      {breaches.filter((b) => b.severity === "critical").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Breach Duration</span>
                    <span className="text-lg font-bold text-white">2.3h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Performance */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Policy Performance</CardTitle>
                <CardDescription className="text-gray-400">Individual policy compliance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{policy.name}</p>
                        <p className="text-xs text-gray-400">
                          {policy.customerTier} • {policy.priority}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${getComplianceColor(policy.performance.compliance)}`}>
                          {policy.performance.compliance.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-400">{policy.performance.breaches} breaches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
                <CardDescription className="text-gray-400">Key SLA performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Overall Compliance</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getComplianceColor(overallCompliance)}`}>
                        {overallCompliance.toFixed(1)}%
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Response Time</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">18m</span>
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Resolution Time</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">23.3h</span>
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Escalation Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">4.2%</span>
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
