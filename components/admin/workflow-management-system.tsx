"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Workflow, Play, Pause, Square, Plus, Trash2, Edit, Copy, Download,
  Upload, Settings, MoreVertical, GitBranch, Zap, Clock, Target,
  Filter, AlertTriangle, CheckCircle, XCircle, Eye, BarChart3,
  Users, Mail, Database, Calendar, Code, MessageSquare, Bell,
  ArrowRight, ArrowDown, RotateCcw, Save, RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface WorkflowNode {
  id: string
  type: "trigger" | "condition" | "action" | "delay"
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
  connections: string[]
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  category: string
  status: "active" | "inactive" | "draft"
  trigger: WorkflowNode
  nodes: WorkflowNode[]
  created: string
  lastRun: string | null
  runCount: number
  successRate: number
  avgExecutionTime: number
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  logs: Array<{
    timestamp: string
    level: "info" | "warning" | "error"
    message: string
    nodeId?: string
  }>
}

const TRIGGER_TYPES = [
  {
    id: "schedule",
    name: "Schedule",
    description: "Run on a schedule (cron-based)",
    icon: Clock,
    config: ["cron", "timezone"]
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Triggered by HTTP requests",
    icon: Zap,
    config: ["url", "method", "authentication"]
  },
  {
    id: "user_action",
    name: "User Action",
    description: "When user performs specific action",
    icon: Users,
    config: ["action", "conditions"]
  },
  {
    id: "data_change",
    name: "Data Change",
    description: "When data meets certain criteria",
    icon: Database,
    config: ["table", "operation", "filters"]
  },
  {
    id: "system_event",
    name: "System Event",
    description: "System-generated events",
    icon: Bell,
    config: ["event_type", "severity"]
  }
]

const ACTION_TYPES = [
  {
    id: "send_email",
    name: "Send Email",
    description: "Send email notifications",
    icon: Mail,
    config: ["to", "subject", "template"]
  },
  {
    id: "api_call",
    name: "API Call",
    description: "Make HTTP API requests",
    icon: Code,
    config: ["url", "method", "headers", "body"]
  },
  {
    id: "database_update",
    name: "Database Update",
    description: "Update database records",
    icon: Database,
    config: ["table", "operation", "data"]
  },
  {
    id: "slack_message",
    name: "Slack Message",
    description: "Send Slack notifications",
    icon: MessageSquare,
    config: ["channel", "message", "mentions"]
  },
  {
    id: "create_task",
    name: "Create Task",
    description: "Create follow-up tasks",
    icon: Target,
    config: ["assignee", "priority", "due_date"]
  }
]

const CONDITION_TYPES = [
  {
    id: "if_then",
    name: "If/Then",
    description: "Simple conditional logic",
    config: ["condition", "operator", "value"]
  },
  {
    id: "filter",
    name: "Filter",
    description: "Filter data based on criteria",
    config: ["field", "operator", "value"]
  },
  {
    id: "branch",
    name: "Branch",
    description: "Split workflow into multiple paths",
    config: ["conditions", "paths"]
  }
]

const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "wf1",
    name: "New User Onboarding",
    description: "Automated onboarding sequence for new users",
    category: "User Management",
    status: "active",
    created: "2024-01-15",
    lastRun: "2024-01-20",
    runCount: 247,
    successRate: 96.8,
    avgExecutionTime: 1.2,
    trigger: {
      id: "t1",
      type: "trigger",
      name: "New User Registration",
      description: "Triggered when user completes registration",
      position: { x: 100, y: 100 },
      connections: ["a1"],
      config: { event: "user.registered" }
    },
    nodes: [
      {
        id: "a1",
        type: "action",
        name: "Send Welcome Email",
        description: "Send personalized welcome email",
        position: { x: 300, y: 100 },
        connections: ["d1"],
        config: { template: "welcome_email", delay: 0 }
      },
      {
        id: "d1", 
        type: "delay",
        name: "Wait 1 Day",
        description: "Wait before next action",
        position: { x: 500, y: 100 },
        connections: ["a2"],
        config: { duration: "1d" }
      },
      {
        id: "a2",
        type: "action", 
        name: "Send Getting Started Guide",
        description: "Send educational content",
        position: { x: 700, y: 100 },
        connections: [],
        config: { template: "getting_started", delay: 0 }
      }
    ]
  },
  {
    id: "wf2",
    name: "Alert Management",
    description: "Escalation workflow for critical alerts",
    category: "Operations",
    status: "active",
    created: "2024-01-10",
    lastRun: "2024-01-20",
    runCount: 89,
    successRate: 100,
    avgExecutionTime: 0.5,
    trigger: {
      id: "t2",
      type: "trigger",
      name: "Critical Alert",
      description: "When critical system alert is triggered",
      position: { x: 100, y: 100 },
      connections: ["c1"],
      config: { event: "alert.critical" }
    },
    nodes: [
      {
        id: "c1",
        type: "condition",
        name: "Check Business Hours",
        description: "Different actions based on time",
        position: { x: 300, y: 100 },
        connections: ["a3", "a4"],
        config: { condition: "business_hours" }
      },
      {
        id: "a3",
        type: "action",
        name: "Slack Alert",
        description: "Send to #alerts channel",
        position: { x: 500, y: 50 },
        connections: [],
        config: { channel: "#alerts", urgent: false }
      },
      {
        id: "a4",
        type: "action",
        name: "Page On-Call Engineer",
        description: "Send urgent page",
        position: { x: 500, y: 150 },
        connections: [],
        config: { service: "pagerduty", escalate: true }
      }
    ]
  },
  {
    id: "wf3",
    name: "Monthly Reports",
    description: "Generate and distribute monthly business reports",
    category: "Analytics",
    status: "active",
    created: "2024-01-01",
    lastRun: "2024-01-01",
    runCount: 12,
    successRate: 100,
    avgExecutionTime: 5.2,
    trigger: {
      id: "t3",
      type: "trigger",
      name: "Monthly Schedule",
      description: "First day of each month",
      position: { x: 100, y: 100 },
      connections: ["a5"],
      config: { cron: "0 8 1 * *" }
    },
    nodes: [
      {
        id: "a5",
        type: "action",
        name: "Generate Report",
        description: "Compile monthly metrics",
        position: { x: 300, y: 100 },
        connections: ["a6"],
        config: { report_type: "monthly_business", format: "pdf" }
      },
      {
        id: "a6",
        type: "action",
        name: "Email to Stakeholders",
        description: "Send to leadership team",
        position: { x: 500, y: 100 },
        connections: [],
        config: { recipients: ["leadership"], attach_report: true }
      }
    ]
  }
]

const MOCK_EXECUTIONS: WorkflowExecution[] = [
  {
    id: "ex1",
    workflowId: "wf1",
    status: "completed",
    startTime: "2024-01-20T10:30:00Z",
    endTime: "2024-01-20T10:31:15Z",
    duration: 75,
    logs: [
      { timestamp: "2024-01-20T10:30:00Z", level: "info", message: "Workflow started", nodeId: "t1" },
      { timestamp: "2024-01-20T10:30:05Z", level: "info", message: "Welcome email sent successfully", nodeId: "a1" },
      { timestamp: "2024-01-20T10:31:15Z", level: "info", message: "Workflow completed successfully" }
    ]
  },
  {
    id: "ex2",
    workflowId: "wf2",
    status: "failed",
    startTime: "2024-01-20T15:45:00Z",
    endTime: "2024-01-20T15:45:30Z",
    duration: 30,
    logs: [
      { timestamp: "2024-01-20T15:45:00Z", level: "info", message: "Alert workflow triggered", nodeId: "t2" },
      { timestamp: "2024-01-20T15:45:15Z", level: "error", message: "Slack API connection failed", nodeId: "a3" },
      { timestamp: "2024-01-20T15:45:30Z", level: "error", message: "Workflow execution failed" }
    ]
  }
]

export default function WorkflowManagementSystem() {
  const [activeTab, setActiveTab] = useState("workflows")
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(MOCK_WORKFLOWS)
  const [executions, setExecutions] = useState<WorkflowExecution[]>(MOCK_EXECUTIONS)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null)
  const [isDesignerMode, setIsDesignerMode] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"create" | "edit" | "run" | "logs">("create")

  const canvasRef = useRef<HTMLDivElement>(null)

  const handleWorkflowToggle = (workflowId: string) => {
    setWorkflows(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' }
        : wf
    ))
  }

  const handleWorkflowRun = (workflowId: string) => {
    const workflow = workflows.find(wf => wf.id === workflowId)
    if (!workflow) return

    const execution: WorkflowExecution = {
      id: `ex_${Date.now()}`,
      workflowId,
      status: "running",
      startTime: new Date().toISOString(),
      logs: [
        { timestamp: new Date().toISOString(), level: "info", message: "Manual workflow execution started" }
      ]
    }

    setExecutions(prev => [execution, ...prev])
    toast.success(`Started workflow: ${workflow.name}`)

    // Simulate workflow completion
    setTimeout(() => {
      setExecutions(prev => prev.map(ex => 
        ex.id === execution.id 
          ? { 
              ...ex, 
              status: "completed", 
              endTime: new Date().toISOString(),
              duration: 45,
              logs: [
                ...ex.logs,
                { timestamp: new Date().toISOString(), level: "info", message: "Workflow completed successfully" }
              ]
            }
          : ex
      ))
    }, 3000)
  }

  const handleWorkflowDelete = (workflowId: string) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== workflowId))
    toast.success("Workflow deleted")
  }

  const handleWorkflowDuplicate = (workflowId: string) => {
    const original = workflows.find(wf => wf.id === workflowId)
    if (!original) return

    const duplicate: WorkflowDefinition = {
      ...original,
      id: `${original.id}_copy_${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: "draft",
      created: new Date().toISOString().split('T')[0],
      lastRun: null,
      runCount: 0,
      successRate: 0,
      avgExecutionTime: 0
    }

    setWorkflows(prev => [duplicate, ...prev])
    toast.success("Workflow duplicated")
  }

  const renderWorkflowDesigner = (workflow: WorkflowDefinition) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Workflow Designer</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-gray-600 text-gray-400">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setIsDesignerMode(false)} className="bg-blue-600 hover:bg-blue-700">
              Exit Designer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Toolbox */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white text-xs font-medium mb-2">Triggers</h4>
                <div className="space-y-2">
                  {TRIGGER_TYPES.map(trigger => (
                    <div key={trigger.id} className="p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <trigger.icon className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-xs">{trigger.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white text-xs font-medium mb-2">Actions</h4>
                <div className="space-y-2">
                  {ACTION_TYPES.slice(0, 3).map(action => (
                    <div key={action.id} className="p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <action.icon className="w-4 h-4 text-green-400" />
                        <span className="text-white text-xs">{action.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white text-xs font-medium mb-2">Logic</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-xs">Condition</span>
                    </div>
                  </div>
                  <div className="p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-xs">Delay</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <div className="col-span-3">
            <Card className="bg-gray-900/50 border-gray-700 h-96">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Workflow className="w-4 h-4 mr-2" />
                  {workflow.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={canvasRef}
                  className="h-64 bg-gray-800/30 rounded border border-gray-600 relative overflow-auto"
                  style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  {/* Render workflow nodes */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 min-w-32">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{workflow.trigger.name}</span>
                      </div>
                    </div>
                  </div>

                  {workflow.nodes.map((node, index) => (
                    <div 
                      key={node.id}
                      className="absolute"
                      style={{ 
                        left: `${150 + (index * 200)}px`, 
                        top: node.type === 'condition' ? '60px' : '20px'
                      }}
                    >
                      <div className={`
                        border rounded-lg p-3 min-w-32
                        ${node.type === 'action' ? 'bg-green-500/20 border-green-400' : ''}
                        ${node.type === 'condition' ? 'bg-yellow-500/20 border-yellow-400' : ''}
                        ${node.type === 'delay' ? 'bg-purple-500/20 border-purple-400' : ''}
                      `}>
                        <div className="flex items-center space-x-2">
                          {node.type === 'action' && <Target className="w-4 h-4 text-green-400" />}
                          {node.type === 'condition' && <GitBranch className="w-4 h-4 text-yellow-400" />}
                          {node.type === 'delay' && <Clock className="w-4 h-4 text-purple-400" />}
                          <span className="text-white text-sm">{node.name}</span>
                        </div>
                      </div>
                      
                      {/* Connection arrow */}
                      {index < workflow.nodes.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 absolute top-6 -right-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "inactive": return <XCircle className="w-4 h-4 text-red-400" />
      case "draft": return <Edit className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-400" />
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />
      case "running": return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      case "cancelled": return <Square className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (isDesignerMode && selectedWorkflow) {
    return (
      <div className="space-y-6 p-6">
        {renderWorkflowDesigner(selectedWorkflow)}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Workflow className="w-8 h-8 mr-3 text-blue-400" />
            Workflow Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, manage, and monitor automated workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => { setDialogType("create"); setDialogOpen(true) }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Workflows</p>
                <p className="text-2xl font-bold text-white">{workflows.length}</p>
              </div>
              <Workflow className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Workflows</p>
                <p className="text-2xl font-bold text-white">
                  {workflows.filter(wf => wf.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Executions</p>
                <p className="text-2xl font-bold text-white">
                  {workflows.reduce((sum, wf) => sum + wf.runCount, 0)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(workflows.reduce((sum, wf) => sum + wf.successRate, 0) / workflows.length).toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="workflows" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Workflows
          </TabsTrigger>
          <TabsTrigger 
            value="executions" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Executions
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Workflow Definitions</CardTitle>
              <CardDescription>
                Manage your automated workflows and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Runs</TableHead>
                    <TableHead className="text-gray-300">Success Rate</TableHead>
                    <TableHead className="text-gray-300">Last Run</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => (
                    <TableRow key={workflow.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{workflow.name}</div>
                          <div className="text-gray-400 text-sm">{workflow.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {workflow.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(workflow.status)}
                          <span className="text-white capitalize">{workflow.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{workflow.runCount}</TableCell>
                      <TableCell className="text-white">{workflow.successRate}%</TableCell>
                      <TableCell className="text-gray-400">
                        {workflow.lastRun || 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWorkflowRun(workflow.id)}
                            disabled={workflow.status !== 'active'}
                            className="h-8 w-8 p-1"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedWorkflow(workflow)
                              setIsDesignerMode(true)
                            }}
                            className="h-8 w-8 p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Switch
                            checked={workflow.status === 'active'}
                            onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-1">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem onClick={() => handleWorkflowDuplicate(workflow.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem 
                                onClick={() => handleWorkflowDelete(workflow.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Workflow Executions</CardTitle>
              <CardDescription>
                Monitor workflow execution history and logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Execution ID</TableHead>
                    <TableHead className="text-gray-300">Workflow</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Start Time</TableHead>
                    <TableHead className="text-gray-300">Duration</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => {
                    const workflow = workflows.find(wf => wf.id === execution.workflowId)
                    return (
                      <TableRow key={execution.id} className="border-gray-700">
                        <TableCell className="text-white font-mono text-sm">
                          {execution.id}
                        </TableCell>
                        <TableCell className="text-white">
                          {workflow?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getExecutionStatusIcon(execution.status)}
                            <span className="text-white capitalize">{execution.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(execution.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {execution.duration ? `${execution.duration}s` : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDialogType("logs")
                              setDialogOpen(true)
                            }}
                            className="h-8 px-2"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Logs
                          </Button>
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
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "User Onboarding",
                description: "Complete user registration and welcome sequence",
                category: "User Management",
                steps: 5
              },
              {
                name: "Alert Management", 
                description: "Escalation workflow for system alerts",
                category: "Operations",
                steps: 3
              },
              {
                name: "Content Publishing",
                description: "Review and publish content workflow",
                category: "Content",
                steps: 4
              },
              {
                name: "Payment Processing",
                description: "Handle payment failures and retries",
                category: "Finance",
                steps: 6
              },
              {
                name: "Data Backup",
                description: "Automated backup and verification",
                category: "Operations",
                steps: 3
              },
              {
                name: "User Engagement",
                description: "Re-engage inactive users",
                category: "Marketing",
                steps: 4
              }
            ].map((template, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700 cursor-pointer hover:border-blue-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Category:</span>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Steps:</span>
                      <span className="text-white">{template.steps}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {dialogType === 'create' ? 'Create New Workflow' : 
               dialogType === 'edit' ? 'Edit Workflow' : 
               dialogType === 'logs' ? 'Execution Logs' : 'Run Workflow'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'create' && "Set up a new automated workflow"}
              {dialogType === 'edit' && "Modify workflow settings"}
              {dialogType === 'logs' && "View execution logs and debug information"}
              {dialogType === 'run' && "Execute workflow with custom parameters"}
            </DialogDescription>
          </DialogHeader>

          {dialogType === 'create' && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Workflow Name</Label>
                <Input 
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <Textarea 
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-gray-300">Category</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Trigger Type</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {TRIGGER_TYPES.map(trigger => (
                      <SelectItem key={trigger.id} value={trigger.id}>
                        {trigger.name} - {trigger.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {dialogType === 'logs' && (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto bg-gray-800/50 rounded p-4 border border-gray-700">
                {executions[0]?.logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 py-1">
                    <span className="text-gray-400 text-xs font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge className={`
                      text-xs
                      ${log.level === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                      ${log.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${log.level === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                    `}>
                      {log.level}
                    </Badge>
                    <span className="text-white text-sm">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setDialogOpen(false)
                if (dialogType === 'create') {
                  toast.success("Workflow created successfully!")
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {dialogType === 'create' ? 'Create Workflow' : 
               dialogType === 'edit' ? 'Save Changes' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
