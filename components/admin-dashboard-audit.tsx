"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  Smartphone,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Navigation,
  FileText,
  Bell,
  Palette,
  Plug,
  BookOpen,
  Database,
  Loader,
  Filter,
  Activity,
} from "lucide-react"
import { adminDashboardAuditor, type AdminDashboardAuditResult } from "@/lib/admin-dashboard-auditor"

export default function AdminDashboardAuditComponent() {
  const [audit, setAudit] = useState<AdminDashboardAuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    runAudit()
  }, [])

  const runAudit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate audit process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const auditResult = adminDashboardAuditor.generateComprehensiveAudit()
      setAudit(auditResult)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Audit failed:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")

      // Set fallback audit data
      setAudit({
        overallScore: 85,
        categories: {
          uiux: {
            name: "UI/UX Design",
            score: 85,
            status: "good",
            issues: ["Unable to complete full analysis"],
            criticalIssues: [],
            recommendations: ["Fix audit system", "Implement proper error handling"],
          },
        },
        summary: { excellent: 0, good: 1, needsImprovement: 0, critical: 0 },
        priorityActions: ["Fix audit system errors"],
        estimatedImprovementTime: "2-4 weeks",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "needs-improvement":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-4 w-4" />
      case "good":
        return <CheckCircle className="h-4 w-4" />
      case "needs-improvement":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const categoryIcons = {
    uiux: Palette,
    functionality: Settings,
    performance: Zap,
    security: Shield,
    accessibility: Eye,
    mobile: Smartphone,
    dataVisualization: BarChart3,
    navigation: Navigation,
    contentManagement: FileText,
    userManagement: Users,
    analytics: TrendingUp,
    systemMonitoring: Activity,
    errorHandling: AlertTriangle,
    loadingStates: Loader,
    searchFiltering: Filter,
    notifications: Bell,
    customization: Settings,
    integration: Plug,
    documentation: BookOpen,
    scalability: Database,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Running Comprehensive Audit</h2>
          <p className="text-gray-300">Analyzing all aspects of the admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Audit Failed</h2>
          <p className="text-gray-300 mb-4">Error: {error}</p>
          <Button onClick={runAudit}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Audit Data</h2>
          <p className="text-gray-300 mb-4">Unable to load audit results</p>
          <Button onClick={runAudit}>Run Audit</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-display">Admin Dashboard Audit</h1>
            <p className="text-gray-300 mt-2">Comprehensive quality assessment across 20 categories</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            <Button onClick={runAudit} disabled={isLoading} className="bg-primary hover:bg-primary/80">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Re-audit
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-yellow-500/30 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium text-yellow-300 mb-2">⚠️ Audit Warning</div>
              <div className="text-yellow-200 text-sm">
                Some analysis features encountered errors: {error}. Results may be incomplete.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-display">Overall Quality Score</CardTitle>
            <CardDescription className="text-blue-100">Aggregate score across all quality categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-8xl font-bold font-display">{audit.overallScore}</div>
              <div className="text-right">
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(audit.overallScore >= 90 ? "excellent" : audit.overallScore >= 75 ? "good" : audit.overallScore >= 50 ? "needs-improvement" : "critical")} text-white text-xl px-6 py-3`}
                >
                  {audit.overallScore >= 90
                    ? "EXCELLENT"
                    : audit.overallScore >= 75
                      ? "GOOD"
                      : audit.overallScore >= 50
                        ? "NEEDS IMPROVEMENT"
                        : "CRITICAL"}
                </Badge>
                <div className="mt-3 text-blue-100 text-lg">Target: 90+ (World-Class)</div>
                <div className="mt-2 text-blue-200 text-sm">
                  Estimated improvement time: {audit.estimatedImprovementTime}
                </div>
              </div>
            </div>
            <Progress value={audit.overallScore} className="mt-6 h-4" />
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-900/50 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{audit.summary.excellent}</div>
              <div className="text-green-300">Excellent (90+)</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/50 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{audit.summary.good}</div>
              <div className="text-blue-300">Good (75-89)</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-900/50 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{audit.summary.needsImprovement}</div>
              <div className="text-yellow-300">Needs Work (50-74)</div>
            </CardContent>
          </Card>
          <Card className="bg-red-900/50 border-red-500/30">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{audit.summary.critical}</div>
              <div className="text-red-300">Critical (0-49)</div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Actions */}
        {audit.priorityActions.length > 0 && (
          <Alert className="border-red-500/30 bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium text-red-300 mb-3">🚨 Priority Actions</div>
              <div className="space-y-2">
                {audit.priorityActions.slice(0, 5).map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-red-200">
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Category Analysis */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="critical" className="data-[state=active]:bg-red-500">
              Critical Issues
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-500">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="detailed" className="data-[state=active]:bg-purple-500">
              Detailed Scores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(audit.categories).map(([key, category]) => {
                const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Settings
                return (
                  <Card key={key} className="bg-gray-800/50 border-gray-700/50 hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                          <CardTitle className="text-lg text-white">{category.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(category.status)} text-white border-0`}>
                          {getStatusIcon(category.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl font-bold text-white">{category.score}</span>
                        <span className="text-gray-400">/100</span>
                      </div>
                      <Progress value={category.score} className="h-2 mb-3" />
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-300">Status: {category.status.replace("-", " ")}</div>
                        {category.issues.length > 0 && (
                          <div className="text-yellow-400">{category.issues.length} issue(s) found</div>
                        )}
                        {category.criticalIssues.length > 0 && (
                          <div className="text-red-400">{category.criticalIssues.length} critical issue(s)</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(audit.categories)
                .filter(([_, category]) => category.criticalIssues.length > 0)
                .map(([key, category]) => {
                  const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Settings
                  return (
                    <Card key={key} className="bg-red-900/20 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-red-300">
                          <IconComponent className="h-5 w-5" />
                          {category.name} - Critical Issues
                          <Badge className="bg-red-500 text-white">{category.score}/100</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.criticalIssues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-red-800/20 rounded-lg">
                              <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-red-200 font-medium">{issue}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

              {Object.entries(audit.categories).filter(([_, category]) => category.criticalIssues.length > 0).length ===
                0 && (
                <Card className="bg-green-900/20 border-green-500/30">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <div className="text-xl font-bold text-green-300">No Critical Issues Found!</div>
                    <div className="text-green-200 mt-2">
                      Your dashboard is performing well with no critical problems.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(audit.categories)
                .filter(([_, category]) => category.recommendations.length > 0)
                .map(([key, category]) => {
                  const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Settings
                  return (
                    <Card key={key} className="bg-gray-800/50 border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                          <IconComponent className="h-5 w-5 text-primary" />
                          {category.name} Recommendations
                          <Badge variant="outline" className="text-gray-300">
                            {category.recommendations.length} items
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Detailed Category Breakdown</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete scoring breakdown for all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {Object.entries(audit.categories)
                      .sort(([, a], [, b]) => b.score - a.score)
                      .map(([key, category], index) => {
                        const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Settings
                        return (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                              <IconComponent className="h-6 w-6 text-primary" />
                              <div>
                                <div className="font-medium text-white">{category.name}</div>
                                <div className="text-sm text-gray-400">
                                  {category.issues.length} issues, {category.recommendations.length} recommendations
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white">{category.score}</div>
                                <div className="text-sm text-gray-400">/100</div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(category.status)} text-white border-0 w-20 justify-center`}
                              >
                                {category.status === "needs-improvement" ? "NEEDS WORK" : category.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Plan */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-display">
              🎯 Action Plan to Reach World-Class (90+)
            </CardTitle>
            <CardDescription className="text-purple-200">
              Prioritized roadmap to achieve excellence across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-red-300">🚨 Immediate (Week 1-2)</h3>
                <div className="space-y-2">
                  {Object.entries(audit.categories)
                    .filter(([_, cat]) => cat.status === "critical")
                    .slice(0, 3)
                    .map(([key, cat]) => (
                      <div key={key} className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                        <div className="font-medium text-red-200">{cat.name}</div>
                        <div className="text-sm text-red-300">Score: {cat.score}/100</div>
                      </div>
                    ))}
                  {Object.entries(audit.categories).filter(([_, cat]) => cat.status === "critical").length === 0 && (
                    <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <div className="font-medium text-green-200">No Critical Issues</div>
                      <div className="text-sm text-green-300">All systems performing well</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-yellow-300">⚡ Short-term (Week 3-6)</h3>
                <div className="space-y-2">
                  {Object.entries(audit.categories)
                    .filter(([_, cat]) => cat.status === "needs-improvement")
                    .slice(0, 3)
                    .map(([key, cat]) => (
                      <div key={key} className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                        <div className="font-medium text-yellow-200">{cat.name}</div>
                        <div className="text-sm text-yellow-300">Score: {cat.score}/100</div>
                      </div>
                    ))}
                  {Object.entries(audit.categories).filter(([_, cat]) => cat.status === "needs-improvement").length ===
                    0 && (
                    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                      <div className="font-medium text-blue-200">Focus on Good Categories</div>
                      <div className="text-sm text-blue-300">Enhance existing strengths</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-300">🔧 Enhancement (Week 7+)</h3>
                <div className="space-y-2">
                  {Object.entries(audit.categories)
                    .filter(([_, cat]) => cat.status === "good")
                    .slice(0, 3)
                    .map(([key, cat]) => (
                      <div key={key} className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <div className="font-medium text-blue-200">{cat.name}</div>
                        <div className="text-sm text-blue-300">Score: {cat.score}/100 → 90+</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
