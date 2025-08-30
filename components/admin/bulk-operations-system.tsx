"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Database,
  FileText,
  Settings,
} from "lucide-react"
import { toast } from "sonner"

interface BulkOperation {
  id: string
  name: string
  type: "user_update" | "email_campaign" | "data_migration" | "report_generation" | "system_maintenance"
  status: "pending" | "running" | "paused" | "completed" | "failed" | "cancelled"
  progress: number
  totalItems: number
  processedItems: number
  failedItems: number
  startTime?: number
  endTime?: number
  parameters: Record<string, any>
  results?: any[]
  errors?: string[]
}

interface OperationTemplate {
  id: string
  name: string
  type: string
  description: string
  parameters: {
    name: string
    type: "text" | "number" | "select" | "textarea" | "file"
    label: string
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
}

const operationTemplates: OperationTemplate[] = [
  {
    id: "user_bulk_update",
    name: "Bulk User Update",
    type: "user_update",
    description: "Update multiple user accounts with new information",
    parameters: [
      {
        name: "userIds",
        type: "textarea",
        label: "User IDs (comma separated)",
        required: true,
        placeholder: "1,2,3,4,5",
      },
      {
        name: "field",
        type: "select",
        label: "Field to Update",
        required: true,
        options: ["email", "status", "role", "subscription"],
      },
      { name: "value", type: "text", label: "New Value", required: true, placeholder: "Enter new value" },
      { name: "notifyUsers", type: "select", label: "Notify Users", required: false, options: ["yes", "no"] },
    ],
  },
  {
    id: "email_campaign",
    name: "Email Campaign",
    type: "email_campaign",
    description: "Send bulk emails to selected user segments",
    parameters: [
      {
        name: "segment",
        type: "select",
        label: "User Segment",
        required: true,
        options: ["all", "premium", "free", "inactive"],
      },
      { name: "subject", type: "text", label: "Email Subject", required: true, placeholder: "Enter email subject" },
      {
        name: "template",
        type: "select",
        label: "Email Template",
        required: true,
        options: ["newsletter", "promotion", "announcement", "welcome"],
      },
      {
        name: "scheduleTime",
        type: "text",
        label: "Schedule Time (optional)",
        required: false,
        placeholder: "YYYY-MM-DD HH:MM",
      },
    ],
  },
  {
    id: "data_migration",
    name: "Data Migration",
    type: "data_migration",
    description: "Migrate data between systems or update data structures",
    parameters: [
      { name: "sourceTable", type: "text", label: "Source Table", required: true, placeholder: "source_table_name" },
      { name: "targetTable", type: "text", label: "Target Table", required: true, placeholder: "target_table_name" },
      { name: "batchSize", type: "number", label: "Batch Size", required: false, placeholder: "1000" },
      {
        name: "transformRules",
        type: "textarea",
        label: "Transform Rules (JSON)",
        required: false,
        placeholder: '{"field1": "new_field1"}',
      },
    ],
  },
  {
    id: "report_generation",
    name: "Report Generation",
    type: "report_generation",
    description: "Generate comprehensive reports for analysis",
    parameters: [
      {
        name: "reportType",
        type: "select",
        label: "Report Type",
        required: true,
        options: ["user_activity", "financial", "performance", "security"],
      },
      {
        name: "dateRange",
        type: "select",
        label: "Date Range",
        required: true,
        options: ["last_7_days", "last_30_days", "last_90_days", "custom"],
      },
      {
        name: "format",
        type: "select",
        label: "Output Format",
        required: true,
        options: ["pdf", "excel", "csv", "json"],
      },
      { name: "includeCharts", type: "select", label: "Include Charts", required: false, options: ["yes", "no"] },
    ],
  },
]

export default function BulkOperationsSystem() {
  const [operations, setOperations] = useState<BulkOperation[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<OperationTemplate | null>(null)
  const [operationName, setOperationName] = useState("")
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockOperations: BulkOperation[] = [
      {
        id: "op_001",
        name: "Monthly User Status Update",
        type: "user_update",
        status: "completed",
        progress: 100,
        totalItems: 1500,
        processedItems: 1500,
        failedItems: 0,
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 3000000,
        parameters: { field: "status", value: "active", userIds: "1,2,3..." },
        results: ["Updated 1500 users successfully"],
      },
      {
        id: "op_002",
        name: "Weekly Newsletter Campaign",
        type: "email_campaign",
        status: "running",
        progress: 65,
        totalItems: 5000,
        processedItems: 3250,
        failedItems: 15,
        startTime: Date.now() - 1800000,
        parameters: { segment: "premium", subject: "Weekly Market Update", template: "newsletter" },
      },
      {
        id: "op_003",
        name: "Database Schema Migration",
        type: "data_migration",
        status: "paused",
        progress: 30,
        totalItems: 10000,
        processedItems: 3000,
        failedItems: 50,
        startTime: Date.now() - 7200000,
        parameters: { sourceTable: "old_users", targetTable: "users_v2", batchSize: "500" },
      },
    ]
    setOperations(mockOperations)
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = operationTemplates.find((t) => t.id === templateId)
    setSelectedTemplate(template || null)
    setParameters({})
    setOperationName(template?.name || "")
  }

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }))
  }

  const handleCreateOperation = async () => {
    if (!selectedTemplate || !operationName) {
      toast.error("Please select a template and provide a name")
      return
    }

    // Validate required parameters
    const missingParams = selectedTemplate.parameters
      .filter((param) => param.required && !parameters[param.name])
      .map((param) => param.label)

    if (missingParams.length > 0) {
      toast.error(`Missing required parameters: ${missingParams.join(", ")}`)
      return
    }

    setIsCreating(true)

    try {
      // Simulate operation creation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newOperation: BulkOperation = {
        id: `op_${Date.now()}`,
        name: operationName,
        type: selectedTemplate.type as any,
        status: "pending",
        progress: 0,
        totalItems: Math.floor(Math.random() * 5000) + 100,
        processedItems: 0,
        failedItems: 0,
        parameters,
      }

      setOperations((prev) => [newOperation, ...prev])

      // Reset form
      setSelectedTemplate(null)
      setOperationName("")
      setParameters({})

      toast.success("Bulk operation created successfully")

      // Simulate starting the operation
      setTimeout(() => {
        setOperations((prev) =>
          prev.map((op) => (op.id === newOperation.id ? { ...op, status: "running", startTime: Date.now() } : op)),
        )
        simulateProgress(newOperation.id)
      }, 2000)
    } catch (error) {
      toast.error("Failed to create bulk operation")
    } finally {
      setIsCreating(false)
    }
  }

  const simulateProgress = (operationId: string) => {
    const interval = setInterval(() => {
      setOperations((prev) =>
        prev.map((op) => {
          if (op.id === operationId && op.status === "running") {
            const newProgress = Math.min(100, op.progress + Math.random() * 10)
            const newProcessed = Math.floor((newProgress / 100) * op.totalItems)
            const newFailed = Math.floor(Math.random() * 5)

            if (newProgress >= 100) {
              clearInterval(interval)
              return {
                ...op,
                progress: 100,
                processedItems: op.totalItems,
                failedItems: newFailed,
                status: "completed",
                endTime: Date.now(),
                results: [`Successfully processed ${op.totalItems - newFailed} items`],
              }
            }

            return {
              ...op,
              progress: newProgress,
              processedItems: newProcessed,
              failedItems: newFailed,
            }
          }
          return op
        }),
      )
    }, 2000)
  }

  const handleOperationAction = (operationId: string, action: "pause" | "resume" | "cancel") => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id === operationId) {
          switch (action) {
            case "pause":
              return { ...op, status: "paused" }
            case "resume":
              return { ...op, status: "running" }
            case "cancel":
              return { ...op, status: "cancelled", endTime: Date.now() }
            default:
              return op
          }
        }
        return op
      }),
    )

    toast.success(`Operation ${action}d successfully`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <Square className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "running":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user_update":
        return <Users className="h-4 w-4" />
      case "email_campaign":
        return <Mail className="h-4 w-4" />
      case "data_migration":
        return <Database className="h-4 w-4" />
      case "report_generation":
        return <FileText className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime) return "Not started"
    const end = endTime || Date.now()
    const duration = Math.floor((end - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">Manage and monitor large-scale operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            {operations.filter((op) => op.status === "running").length} Running
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            {operations.filter((op) => op.status === "completed").length} Completed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Operation</TabsTrigger>
          <TabsTrigger value="monitor">Monitor Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Bulk Operation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Operation Template</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an operation template" />
                  </SelectTrigger>
                  <SelectContent>
                    {operationTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(template.type)}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>

                  <div>
                    <Label>Operation Name</Label>
                    <Input
                      value={operationName}
                      onChange={(e) => setOperationName(e.target.value)}
                      placeholder="Enter a descriptive name for this operation"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Parameters</h3>
                    {selectedTemplate.parameters.map((param) => (
                      <div key={param.name}>
                        <Label>
                          {param.label}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {param.type === "select" ? (
                          <Select onValueChange={(value) => handleParameterChange(param.name, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : param.type === "textarea" ? (
                          <Textarea
                            value={parameters[param.name] || ""}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            placeholder={param.placeholder}
                            rows={3}
                          />
                        ) : (
                          <Input
                            type={param.type === "number" ? "number" : "text"}
                            value={parameters[param.name] || ""}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            placeholder={param.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleCreateOperation} disabled={isCreating || !operationName} className="w-full">
                    {isCreating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating Operation...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Create and Start Operation
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid gap-4">
            {operations
              .filter((op) => ["running", "paused", "pending"].includes(op.status))
              .map((operation) => (
                <Card key={operation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(operation.type)}
                        <div>
                          <h3 className="font-semibold">{operation.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {operation.processedItems.toLocaleString()} / {operation.totalItems.toLocaleString()} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1 capitalize">{operation.status}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{operation.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={operation.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Processed</p>
                        <p className="font-semibold text-green-600">{operation.processedItems.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="font-semibold text-red-600">{operation.failedItems.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold">{formatDuration(operation.startTime, operation.endTime)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {operation.status === "running" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOperationAction(operation.id, "pause")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {operation.status === "paused" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOperationAction(operation.id, "resume")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {["running", "paused", "pending"].includes(operation.status) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleOperationAction(operation.id, "cancel")}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {operations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(operation.type)}
                        <div>
                          <h4 className="font-medium">{operation.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {operation.processedItems.toLocaleString()} / {operation.totalItems.toLocaleString()} items
                            {operation.failedItems > 0 && (
                              <span className="text-red-500 ml-2">({operation.failedItems} failed)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(operation.status)}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1 capitalize">{operation.status}</span>
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDuration(operation.startTime, operation.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
