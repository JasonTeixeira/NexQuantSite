"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  CalendarIcon,
  Users,
  Archive,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Bell,
  Target,
  TrendingUp,
  Activity,
  Settings,
} from "lucide-react"

// Mock compliance data
const complianceFrameworks = [
  {
    id: "gdpr",
    name: "GDPR",
    description: "General Data Protection Regulation",
    status: "compliant",
    lastAudit: "2024-01-10T00:00:00Z",
    nextAudit: "2024-07-10T00:00:00Z",
    completionRate: 95,
    requirements: 42,
    completed: 40,
    inProgress: 2,
    overdue: 0,
  },
  {
    id: "sox",
    name: "SOX",
    description: "Sarbanes-Oxley Act",
    status: "in_progress",
    lastAudit: "2023-12-15T00:00:00Z",
    nextAudit: "2024-06-15T00:00:00Z",
    completionRate: 78,
    requirements: 35,
    completed: 27,
    inProgress: 6,
    overdue: 2,
  },
  {
    id: "pci_dss",
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard",
    status: "needs_attention",
    lastAudit: "2024-01-05T00:00:00Z",
    nextAudit: "2024-04-05T00:00:00Z",
    completionRate: 65,
    requirements: 28,
    completed: 18,
    inProgress: 5,
    overdue: 5,
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    description: "Information Security Management",
    status: "compliant",
    lastAudit: "2023-11-20T00:00:00Z",
    nextAudit: "2024-05-20T00:00:00Z",
    completionRate: 92,
    requirements: 50,
    completed: 46,
    inProgress: 3,
    overdue: 1,
  },
]

const legalDocuments = [
  {
    id: "doc-001",
    title: "Privacy Policy",
    type: "policy",
    status: "active",
    version: "v3.2",
    lastUpdated: "2024-01-15T10:30:00Z",
    nextReview: "2024-04-15T00:00:00Z",
    approvedBy: "Legal Team",
    category: "privacy",
    language: "en",
    wordCount: 2450,
  },
  {
    id: "doc-002",
    title: "Terms of Service",
    type: "agreement",
    status: "active",
    version: "v2.8",
    lastUpdated: "2024-01-12T14:20:00Z",
    nextReview: "2024-03-12T00:00:00Z",
    approvedBy: "Legal Team",
    category: "terms",
    language: "en",
    wordCount: 3200,
  },
  {
    id: "doc-003",
    title: "Data Processing Agreement",
    type: "contract",
    status: "draft",
    version: "v1.0",
    lastUpdated: "2024-01-14T09:15:00Z",
    nextReview: "2024-02-14T00:00:00Z",
    approvedBy: "Pending",
    category: "data",
    language: "en",
    wordCount: 1800,
  },
  {
    id: "doc-004",
    title: "Cookie Policy",
    type: "policy",
    status: "needs_review",
    version: "v1.5",
    lastUpdated: "2023-12-20T16:45:00Z",
    nextReview: "2024-01-20T00:00:00Z",
    approvedBy: "Legal Team",
    category: "privacy",
    language: "en",
    wordCount: 950,
  },
]

const auditTrail = [
  {
    id: "audit-001",
    action: "Document Updated",
    resource: "Privacy Policy v3.2",
    user: "Sarah Johnson",
    timestamp: "2024-01-15T10:30:00Z",
    details: "Updated data retention section",
    severity: "medium",
  },
  {
    id: "audit-002",
    action: "Compliance Check",
    resource: "GDPR Framework",
    user: "System",
    timestamp: "2024-01-15T08:00:00Z",
    details: "Automated compliance verification completed",
    severity: "low",
  },
  {
    id: "audit-003",
    action: "Risk Assessment",
    resource: "PCI DSS Requirements",
    user: "Mike Davis",
    timestamp: "2024-01-14T15:20:00Z",
    details: "Identified 5 high-risk areas requiring immediate attention",
    severity: "high",
  },
  {
    id: "audit-004",
    action: "Document Approval",
    resource: "Terms of Service v2.8",
    user: "Legal Team",
    timestamp: "2024-01-12T14:20:00Z",
    details: "Document approved and published",
    severity: "low",
  },
  {
    id: "audit-005",
    action: "Access Granted",
    resource: "Compliance Dashboard",
    user: "Alex Chen",
    timestamp: "2024-01-12T11:45:00Z",
    details: "Admin access granted to compliance module",
    severity: "medium",
  },
]

const riskAssessments = [
  {
    id: "risk-001",
    title: "Data Breach Risk",
    category: "security",
    severity: "high",
    probability: 25,
    impact: 90,
    riskScore: 22.5,
    status: "active",
    owner: "Security Team",
    dueDate: "2024-02-15T00:00:00Z",
    mitigationPlan: "Implement additional encryption and access controls",
  },
  {
    id: "risk-002",
    title: "Regulatory Non-Compliance",
    category: "compliance",
    severity: "medium",
    probability: 40,
    impact: 70,
    riskScore: 28,
    status: "in_progress",
    owner: "Compliance Team",
    dueDate: "2024-03-01T00:00:00Z",
    mitigationPlan: "Update policies and conduct staff training",
  },
  {
    id: "risk-003",
    title: "Third-Party Vendor Risk",
    category: "operational",
    severity: "medium",
    probability: 30,
    impact: 60,
    riskScore: 18,
    status: "monitoring",
    owner: "Operations Team",
    dueDate: "2024-04-01T00:00:00Z",
    mitigationPlan: "Enhanced vendor due diligence process",
  },
]

const complianceMetrics = [
  { month: "Aug", score: 78, incidents: 3, audits: 2 },
  { month: "Sep", score: 82, incidents: 2, audits: 3 },
  { month: "Oct", score: 85, incidents: 1, audits: 2 },
  { month: "Nov", score: 88, incidents: 2, audits: 4 },
  { month: "Dec", score: 91, incidents: 1, audits: 3 },
  { month: "Jan", score: 94, incidents: 0, audits: 2 },
]

export default function ComplianceClient() {
  const [selectedFramework, setSelectedFramework] = useState("all")
  const [selectedDocumentType, setSelectedDocumentType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/20 text-green-400"
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400"
      case "needs_attention":
        return "bg-red-500/20 text-red-400"
      case "active":
        return "bg-blue-500/20 text-blue-400"
      case "draft":
        return "bg-gray-500/20 text-gray-400"
      case "needs_review":
        return "bg-orange-500/20 text-orange-400"
      case "monitoring":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "low":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateRiskScore = (probability: number, impact: number) => {
    return (probability * impact) / 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-primary" />
            Compliance & Legal Management
          </h1>
          <p className="text-gray-400 mt-1">Comprehensive compliance tracking and legal document management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Legal Document</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new legal document to the compliance system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="docTitle" className="text-gray-300">
                      Document Title
                    </Label>
                    <Input
                      id="docTitle"
                      placeholder="Enter document title"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="docType" className="text-gray-300">
                      Document Type
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="agreement">Agreement</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="privacy">Privacy</SelectItem>
                        <SelectItem value="terms">Terms & Conditions</SelectItem>
                        <SelectItem value="data">Data Protection</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-gray-300">
                      Language
                    </Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the document"
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary/80">Create Document</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Overall Compliance</p>
                <p className="text-2xl font-bold text-white">87%</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">+5%</span>
              <span className="text-gray-400 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Documents</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Plus className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-blue-400">3 new</span>
              <span className="text-gray-400 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Risk Score</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Target className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-yellow-400">Medium</span>
              <span className="text-gray-400 ml-1">risk level</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">7</p>
              </div>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Bell className="w-4 h-4 text-orange-400 mr-1" />
              <span className="text-orange-400">2 overdue</span>
              <span className="text-gray-400 ml-1">items</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Compliance Tabs */}
      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
          <TabsTrigger value="frameworks" className="data-[state=active]:bg-primary">
            Frameworks
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary">
            Documents
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-primary">
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-primary">
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-primary">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          <div className="grid gap-6">
            {complianceFrameworks.map((framework) => (
              <Card
                key={framework.id}
                className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-white">{framework.name}</h3>
                        <Badge className={getStatusColor(framework.status)}>{framework.status.replace("_", " ")}</Badge>
                      </div>

                      <p className="text-gray-400 mb-4">{framework.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{framework.completed}</div>
                          <div className="text-xs text-gray-400">Completed</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">{framework.inProgress}</div>
                          <div className="text-xs text-gray-400">In Progress</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">{framework.overdue}</div>
                          <div className="text-xs text-gray-400">Overdue</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-white">{framework.requirements}</div>
                          <div className="text-xs text-gray-400">Total</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Completion Rate</span>
                          <span className="text-white font-medium">{framework.completionRate}%</span>
                        </div>
                        <Progress value={framework.completionRate} className="h-3" />
                      </div>

                      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Last audit: {formatDate(framework.lastAudit)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Next audit: {formatDate(framework.nextAudit)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Run Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="policy">Policies</SelectItem>
                      <SelectItem value="agreement">Agreements</SelectItem>
                      <SelectItem value="contract">Contracts</SelectItem>
                      <SelectItem value="procedure">Procedures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Document</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Version</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Updated</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Next Review</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-white">{doc.title}</div>
                            <div className="text-sm text-gray-400">{doc.wordCount} words</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-gray-300 border-gray-600">
                            {doc.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(doc.status)}>{doc.status.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{doc.version}</td>
                        <td className="py-3 px-4 text-gray-300">{formatDate(doc.lastUpdated)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`${
                              getDaysUntilDue(doc.nextReview) < 7
                                ? "text-red-400"
                                : getDaysUntilDue(doc.nextReview) < 30
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                            }`}
                          >
                            {formatDate(doc.nextReview)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid gap-6">
            {riskAssessments.map((risk) => (
              <Card key={risk.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                        <Badge className={getSeverityColor(risk.severity)}>{risk.severity} risk</Badge>
                        <Badge className={getStatusColor(risk.status)}>{risk.status.replace("_", " ")}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Probability</span>
                            <span className="text-white">{risk.probability}%</span>
                          </div>
                          <Progress value={risk.probability} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Impact</span>
                            <span className="text-white">{risk.impact}%</span>
                          </div>
                          <Progress value={risk.impact} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Risk Score</span>
                            <span className="text-white font-bold">{risk.riskScore}</span>
                          </div>
                          <Progress value={risk.riskScore} className="h-2" />
                        </div>
                      </div>

                      <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                        <h4 className="text-sm font-medium text-white mb-1">Mitigation Plan</h4>
                        <p className="text-sm text-gray-300">{risk.mitigationPlan}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>Owner: {risk.owner}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Due: {formatDate(risk.dueDate)}</span>
                          {getDaysUntilDue(risk.dueDate) < 7 && <AlertTriangle className="w-4 h-4 text-red-400 ml-1" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Update Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Risk
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Audit Trail
              </CardTitle>
              <CardDescription className="text-gray-400">
                Complete log of all compliance and legal activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          entry.severity === "high"
                            ? "bg-red-500/20"
                            : entry.severity === "medium"
                              ? "bg-yellow-500/20"
                              : "bg-green-500/20"
                        }`}
                      >
                        <Activity
                          className={`w-4 h-4 ${
                            entry.severity === "high"
                              ? "text-red-400"
                              : entry.severity === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-white">{entry.action}</h4>
                          <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{entry.resource}</p>
                        <p className="text-sm text-gray-400 mb-2">{entry.details}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>By: {entry.user}</span>
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Compliance Calendar
                </CardTitle>
                <CardDescription className="text-gray-400">Important dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-gray-700"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Upcoming Deadlines</CardTitle>
                <CardDescription className="text-gray-400">Critical dates requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Cookie Policy Review</h4>
                      <p className="text-sm text-gray-400">Overdue by 5 days</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">Overdue</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">PCI DSS Assessment</h4>
                      <p className="text-sm text-gray-400">Due in 3 days</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Urgent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">GDPR Audit</h4>
                      <p className="text-sm text-gray-400">Due in 2 weeks</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">Scheduled</Badge>
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
