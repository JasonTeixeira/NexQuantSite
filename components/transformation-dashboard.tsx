"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Settings,
  Download,
} from "lucide-react"
import { transformationTracker, type TransformationPhase } from "@/lib/transformation-tracker"

const phaseColors = {
  planned: "#6b7280",
  "in-progress": "#3b82f6",
  completed: "#10b981",
  delayed: "#ef4444",
}

const riskColors = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
}

export default function TransformationDashboard() {
  const [phases, setPhases] = useState<TransformationPhase[]>([])
  const [selectedPhase, setSelectedPhase] = useState<TransformationPhase | null>(null)
  const [dashboardData, setDashboardData] = useState({
    totalBudget: 0,
    usedBudget: 0,
    completedPhases: 0,
    totalPhases: 0,
    criticalRisks: 0,
    upcomingMilestones: 0,
  })

  useEffect(() => {
    loadTransformationData()
  }, [])

  const loadTransformationData = () => {
    const allPhases = transformationTracker.getAllPhases()
    const progress = transformationTracker.getPhaseProgress()
    const budget = transformationTracker.getTotalBudget()
    const criticalRisks = transformationTracker.getCriticalRisks()
    const upcomingMilestones = transformationTracker.getUpcomingMilestones()

    setPhases(allPhases)
    setSelectedPhase(allPhases[0])
    setDashboardData({
      totalBudget: budget.allocated,
      usedBudget: budget.used,
      completedPhases: progress.completed,
      totalPhases: allPhases.length,
      criticalRisks: criticalRisks.length,
      upcomingMilestones: upcomingMilestones.length,
    })
  }

  const getStatusColor = (status: string) => {
    return phaseColors[status as keyof typeof phaseColors] || "#6b7280"
  }

  const getRiskColor = (risk: string) => {
    return riskColors[risk as keyof typeof riskColors] || "#6b7280"
  }

  const phaseDistributionData = phases.map((phase) => ({
    name: phase.name,
    value: 1,
    status: phase.status,
    color: getStatusColor(phase.status),
  }))

  const budgetData = phases.map((phase) => ({
    name: phase.name.substring(0, 10) + "...",
    allocated: phase.budget / 1000, // Convert to thousands
    used: phase.budgetUsed / 1000,
  }))

  const timelineData = phases.map((phase, index) => ({
    name: `Phase ${index + 1}`,
    progress: phase.progress,
    target: 100,
  }))

  const exportReport = () => {
    const report = transformationTracker.generateProgressReport()
    const blob = new Blob([report], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transformation-report-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ENTERPRISE <span className="text-primary">TRANSFORMATION</span>
            </h1>
            <p className="text-gray-400">24-Month transformation roadmap to world-class admin dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={exportReport}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/40 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Budget</p>
                  <p className="text-2xl font-bold text-white">${(dashboardData.totalBudget / 1000000).toFixed(1)}M</p>
                  <p className="text-green-400 text-sm">${(dashboardData.usedBudget / 1000).toLocaleString()}K used</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Phase Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.completedPhases}/{dashboardData.totalPhases}
                  </p>
                  <p className="text-blue-400 text-sm">
                    {Math.round((dashboardData.completedPhases / dashboardData.totalPhases) * 100)}% complete
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Critical Risks</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.criticalRisks}</p>
                  <p className={`text-sm ${dashboardData.criticalRisks > 0 ? "text-red-400" : "text-green-400"}`}>
                    {dashboardData.criticalRisks > 0 ? "Requires attention" : "All clear"}
                  </p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Milestones</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.upcomingMilestones}</p>
                  <p className="text-yellow-400 text-sm">Next 30 days</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Allocation */}
          <Card className="bg-black/40 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Budget Allocation by Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="allocated" fill="#3b82f6" name="Allocated ($K)" />
                  <Bar dataKey="used" fill="#10b981" name="Used ($K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Phase Distribution */}
          <Card className="bg-black/40 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Phase Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={phaseDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, status }) => `${name}: ${status}`}
                  >
                    {phaseDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Progress */}
        <Card className="bg-black/40 border-primary/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Phase Progress Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="progress" stroke="#00ff44" strokeWidth={3} />
                <Line type="monotone" dataKey="target" stroke="#6b7280" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Phase Information */}
        <Tabs defaultValue="phases" className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-xl border-primary/20">
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="risks">Risk Management</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="phases" className="space-y-4">
            <div className="grid gap-4">
              {phases.map((phase) => (
                <Card key={phase.id} className="bg-black/40 border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{phase.name}</h3>
                          <Badge
                            style={{
                              backgroundColor: `${getStatusColor(phase.status)}20`,
                              color: getStatusColor(phase.status),
                              borderColor: `${getStatusColor(phase.status)}40`,
                            }}
                          >
                            {phase.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-2">{phase.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Budget:</span>
                            <span className="text-white ml-2">${(phase.budget / 1000).toLocaleString()}K</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Start:</span>
                            <span className="text-white ml-2">{phase.startDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">End:</span>
                            <span className="text-white ml-2">{phase.endDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-1">{phase.progress}%</div>
                        <Progress value={phase.progress} className="w-24" />
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Key Milestones</h4>
                      <div className="grid gap-2">
                        {phase.milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <div className="flex items-center gap-2">
                              {milestone.status === "completed" ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : milestone.status === "in-progress" ? (
                                <Clock className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-gray-300 text-sm">{milestone.name}</span>
                            </div>
                            <span className="text-gray-400 text-xs">{milestone.dueDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {phase.risks.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-white font-medium">Identified Risks</h4>
                        <div className="grid gap-2">
                          {phase.risks.map((risk) => (
                            <Alert key={risk.id} className="border-yellow-500/30 bg-yellow-900/20">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <span className="text-yellow-200">{risk.name}</span>
                                  <Badge
                                    style={{
                                      backgroundColor: `${getRiskColor(risk.impact)}20`,
                                      color: getRiskColor(risk.impact),
                                      borderColor: `${getRiskColor(risk.impact)}40`,
                                    }}
                                  >
                                    {risk.impact}
                                  </Badge>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transformationTracker.getUpcomingMilestones(60).map((milestone) => (
                    <div key={milestone.id} className="p-4 bg-black/20 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{milestone.name}</h3>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Due: {milestone.dueDate}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{milestone.description}</p>
                      <div className="space-y-1">
                        <p className="text-gray-300 text-sm font-medium">Deliverables:</p>
                        <ul className="list-disc list-inside text-gray-400 text-sm">
                          {milestone.deliverables.map((deliverable, index) => (
                            <li key={index}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Assignee: {milestone.assignee}</span>
                        <Badge
                          className={
                            milestone.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : milestone.status === "in-progress"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {milestone.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transformationTracker.getCriticalRisks().map((risk) => (
                    <Alert key={risk.id} className="border-red-500/30 bg-red-900/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-red-200 font-medium">{risk.name}</h3>
                            <div className="flex gap-2">
                              <Badge
                                style={{
                                  backgroundColor: `${getRiskColor(risk.impact)}20`,
                                  color: getRiskColor(risk.impact),
                                  borderColor: `${getRiskColor(risk.impact)}40`,
                                }}
                              >
                                {risk.impact} impact
                              </Badge>
                              <Badge
                                style={{
                                  backgroundColor: `${getRiskColor(risk.probability)}20`,
                                  color: getRiskColor(risk.probability),
                                  borderColor: `${getRiskColor(risk.probability)}40`,
                                }}
                              >
                                {risk.probability} probability
                              </Badge>
                            </div>
                          </div>
                          <p className="text-red-300 text-sm">{risk.description}</p>
                          <div className="space-y-1">
                            <p className="text-red-200 text-sm font-medium">Mitigation Strategy:</p>
                            <p className="text-red-300 text-sm">{risk.mitigation}</p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}

                  {transformationTracker.getCriticalRisks().length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <p className="text-white text-lg">No Critical Risks</p>
                      <p className="text-gray-400">All identified risks are being managed appropriately</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { role: "Technical Lead", count: 1, rate: "$150k/year" },
                      { role: "Backend Developers", count: 4, rate: "$120k/year" },
                      { role: "Frontend Developers", count: 3, rate: "$110k/year" },
                      { role: "DevOps Engineers", count: 2, rate: "$130k/year" },
                      { role: "QA Engineers", count: 2, rate: "$100k/year" },
                      { role: "Security Engineer", count: 1, rate: "$140k/year" },
                      { role: "UX/UI Designer", count: 1, rate: "$105k/year" },
                      { role: "Project Manager", count: 1, rate: "$120k/year" },
                    ].map((member) => (
                      <div key={member.role} className="flex items-center justify-between p-2 bg-black/20 rounded">
                        <div>
                          <span className="text-white font-medium">{member.role}</span>
                          <span className="text-gray-400 text-sm ml-2">({member.count})</span>
                        </div>
                        <span className="text-green-400 text-sm">{member.rate}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: "Cloud Infrastructure", tech: "AWS/Azure Enterprise" },
                      { category: "Database", tech: "PostgreSQL Cluster" },
                      { category: "Caching", tech: "Redis Cluster" },
                      { category: "Monitoring", tech: "DataDog/New Relic" },
                      { category: "Security", tech: "Okta Enterprise" },
                      { category: "CDN", tech: "CloudFlare Enterprise" },
                      { category: "CI/CD", tech: "GitHub Actions" },
                      { category: "Container Orchestration", tech: "Kubernetes" },
                    ].map((item) => (
                      <div key={item.category} className="flex items-center justify-between p-2 bg-black/20 rounded">
                        <span className="text-white font-medium">{item.category}</span>
                        <span className="text-primary text-sm">{item.tech}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
