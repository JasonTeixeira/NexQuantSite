"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  Smartphone,
  Eye,
  Search,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { performanceMonitor } from "@/lib/performance-monitor"
import { securityManager } from "@/lib/security-manager"
import { uxOptimizer } from "@/lib/ux-optimizer"
import { tradingAnalytics } from "@/lib/advanced-trading-analytics"

interface QualityMetrics {
  performance: number
  security: number
  ux: number
  trading: number
  mobile: number
  accessibility: number
  seo: number
  overall: number
}

interface CategoryStatus {
  score: number
  status: "excellent" | "good" | "needs-improvement" | "critical"
  issues: string[]
  recommendations: string[]
}

export default function QualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    performance: 0,
    security: 0,
    ux: 0,
    trading: 0,
    mobile: 0,
    accessibility: 0,
    seo: 0,
    overall: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [categoryDetails, setCategoryDetails] = useState<Record<string, CategoryStatus>>({})

  useEffect(() => {
    runQualityAssessment()
  }, [])

  const runQualityAssessment = async () => {
    setIsLoading(true)

    try {
      // Performance Assessment
      const performanceReport = performanceMonitor.getDetailedReport()
      const performanceScore = performanceReport.score

      // Security Assessment
      const securityMetrics = securityManager.getSecurityScore()
      const securityScore = Math.round(
        (securityMetrics.vulnerabilityScore +
          securityMetrics.complianceScore +
          securityMetrics.authenticationScore +
          securityMetrics.dataProtectionScore) /
          4,
      )

      // UX Assessment
      const uxReport = uxOptimizer.generateUXReport()
      const uxScore = uxReport.overallScore

      // Trading Assessment
      const tradingScore = tradingAnalytics.getPerformanceScore()

      // Mobile Assessment
      const mobileScore = assessMobileQuality()

      // Accessibility Assessment
      const accessibilityResult = uxOptimizer.checkAccessibility()
      const accessibilityScore = accessibilityResult.score

      // SEO Assessment
      const seoScore = assessSEOQuality()

      const overallScore = Math.round(
        (performanceScore + securityScore + uxScore + tradingScore + mobileScore + accessibilityScore + seoScore) / 7,
      )

      setMetrics({
        performance: performanceScore,
        security: securityScore,
        ux: uxScore,
        trading: tradingScore,
        mobile: mobileScore,
        accessibility: accessibilityScore,
        seo: seoScore,
        overall: overallScore,
      })

      // Set category details
      setCategoryDetails({
        performance: {
          score: performanceScore,
          status: getStatus(performanceScore),
          issues: performanceReport.recommendations,
          recommendations: performanceReport.recommendations,
        },
        security: {
          score: securityScore,
          status: getStatus(securityScore),
          issues: [],
          recommendations: ["Enable all security headers", "Implement 2FA", "Regular security audits"],
        },
        ux: {
          score: uxScore,
          status: getStatus(uxScore),
          issues: uxReport.criticalIssues,
          recommendations: uxReport.recommendations,
        },
        trading: {
          score: tradingScore,
          status: getStatus(tradingScore),
          issues: [],
          recommendations: ["Implement advanced risk management", "Add more trading indicators"],
        },
        mobile: {
          score: mobileScore,
          status: getStatus(mobileScore),
          issues: [],
          recommendations: ["Optimize touch targets", "Improve mobile navigation"],
        },
        accessibility: {
          score: accessibilityScore,
          status: getStatus(accessibilityScore),
          issues: accessibilityResult.issues,
          recommendations: accessibilityResult.recommendations,
        },
        seo: {
          score: seoScore,
          status: getStatus(seoScore),
          issues: [],
          recommendations: ["Improve meta descriptions", "Add structured data", "Optimize page speed"],
        },
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Quality assessment failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const assessMobileQuality = (): number => {
    let score = 100

    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (!viewportMeta) score -= 20

    // Check touch target sizes
    const buttons = document.querySelectorAll("button, a")
    let smallTargets = 0
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) smallTargets++
    })

    if (smallTargets > buttons.length * 0.1) score -= 15

    // Check for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) score -= 25

    return Math.max(0, score)
  }

  const assessSEOQuality = (): number => {
    let score = 100

    // Check title tag
    const title = document.querySelector("title")
    if (!title || title.textContent!.length < 30) score -= 15

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) score -= 15

    // Check heading structure
    const h1s = document.querySelectorAll("h1")
    if (h1s.length !== 1) score -= 10

    // Check alt text on images
    const images = document.querySelectorAll("img")
    const imagesWithoutAlt = Array.from(images).filter((img) => !img.alt)
    if (imagesWithoutAlt.length > 0) score -= 10

    return Math.max(0, score)
  }

  const getStatus = (score: number): "excellent" | "good" | "needs-improvement" | "critical" => {
    if (score >= 90) return "excellent"
    if (score >= 75) return "good"
    if (score >= 50) return "needs-improvement"
    return "critical"
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

  const categories = [
    { key: "performance", name: "Performance", icon: Zap, description: "Page speed and loading times" },
    { key: "security", name: "Security", icon: Shield, description: "Data protection and authentication" },
    { key: "ux", name: "User Experience", icon: Users, description: "Usability and interface design" },
    { key: "trading", name: "Trading Features", icon: TrendingUp, description: "Trading tools and analytics" },
    { key: "mobile", name: "Mobile", icon: Smartphone, description: "Mobile responsiveness and usability" },
    { key: "accessibility", name: "Accessibility", icon: Eye, description: "WCAG compliance and inclusivity" },
    { key: "seo", name: "SEO", icon: Search, description: "Search engine optimization" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive quality assessment for Nexural Trading Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            <Button onClick={runQualityAssessment} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Overall Quality Score</CardTitle>
            <CardDescription className="text-blue-100">Aggregate score across all quality categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-6xl font-bold">{isLoading ? "..." : metrics.overall}</div>
              <div className="text-right">
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(getStatus(metrics.overall))} text-white text-lg px-4 py-2`}
                >
                  {getStatus(metrics.overall).toUpperCase()}
                </Badge>
                <div className="mt-2 text-blue-100">Target: 90+ (Excellent)</div>
              </div>
            </div>
            <Progress value={metrics.overall} className="mt-4 h-3" />
          </CardContent>
        </Card>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const score = metrics[category.key as keyof QualityMetrics]
            const status = getStatus(score)
            const Icon = category.icon

            return (
              <Card key={category.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <Badge variant="outline" className={`${getStatusColor(status)} text-white border-0`}>
                      {getStatusIcon(status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{isLoading ? "..." : score}</span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categories.map((category) => {
                const details = categoryDetails[category.key]
                if (!details) return null

                return (
                  <Card key={category.key}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <category.icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="outline" className={`${getStatusColor(details.status)} text-white border-0`}>
                          {details.score}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={details.score} className="mb-4" />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Status: {details.status}</div>
                        {details.issues.length > 0 && (
                          <div className="text-sm text-red-600">{details.issues.length} issue(s) found</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {Object.entries(categoryDetails).map(([key, details]) => {
              if (details.issues.length === 0) return null

              const category = categories.find((c) => c.key === key)
              if (!category) return null

              return (
                <Alert key={key} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">{category.name} Issues:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {details.issues.map((issue, index) => (
                        <li key={index} className="text-sm">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )
            })}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {Object.entries(categoryDetails).map(([key, details]) => {
              if (details.recommendations.length === 0) return null

              const category = categories.find((c) => c.key === key)
              if (!category) return null

              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" />
                      {category.name} Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {details.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Track quality improvements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Historical trend data will be available after multiple assessments
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Priority Action Items
            </CardTitle>
            <CardDescription>Critical improvements needed to reach world-class standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryDetails)
                .filter(([_, details]) => details.status === "critical" || details.status === "needs-improvement")
                .map(([key, details]) => {
                  const category = categories.find((c) => c.key === key)
                  if (!category) return null

                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <category.icon className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-600">Current: {details.score}/100 • Target: 90+</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {90 - details.score} points needed
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
