"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
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
  Smartphone,
  Download,
  Upload,
  Users,
  Star,
  Bug,
  Zap,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
  Target,
} from "lucide-react"
import { toast } from "sonner"
import { mobileAppManagementSystem } from "@/lib/mobile-app-management-system"

const platformColors = {
  ios: "#007AFF",
  android: "#3DDC84",
  web: "#FF6B35",
}

const severityColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
}

export default function MobileAppManagementConsole() {
  const [appMetrics, setAppMetrics] = useState(mobileAppManagementSystem.getAppMetrics())
  const [appVersions, setAppVersions] = useState(mobileAppManagementSystem.getAppVersions())
  const [pushNotifications, setPushNotifications] = useState(mobileAppManagementSystem.getPushNotifications())
  const [crashReports, setCrashReports] = useState(mobileAppManagementSystem.getCrashReports())
  const [userEngagement, setUserEngagement] = useState(mobileAppManagementSystem.getUserEngagement())
  const [engagementInsights, setEngagementInsights] = useState(mobileAppManagementSystem.getEngagementInsights())
  const [performanceMetrics, setPerformanceMetrics] = useState(mobileAppManagementSystem.getPerformanceMetrics())

  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false)
  const [isCrashDetailOpen, setIsCrashDetailOpen] = useState(false)
  const [selectedCrash, setSelectedCrash] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [updateForm, setUpdateForm] = useState({
    version: "",
    platform: "ios" as "ios" | "android" | "web",
    features: "",
    bugFixes: "",
    isForceUpdate: false,
    rolloutPercentage: 100,
  })

  const [pushForm, setPushForm] = useState({
    title: "",
    message: "",
    platform: "all" as "ios" | "android" | "web" | "all",
    targetAudience: "all",
    scheduledAt: "",
    personalization: false,
    abTest: false,
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setAppMetrics(mobileAppManagementSystem.getAppMetrics())
      setUserEngagement(mobileAppManagementSystem.getUserEngagement())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const createAppUpdate = () => {
    if (!updateForm.version.trim()) {
      toast.error("Please enter a version number")
      return
    }

    // Simulate creating update
    toast.success("App update created successfully")
    setUpdateForm({
      version: "",
      platform: "ios",
      features: "",
      bugFixes: "",
      isForceUpdate: false,
      rolloutPercentage: 100,
    })
    setIsUpdateDialogOpen(false)
  }

  const sendPushNotification = () => {
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const notificationData = {
      ...pushForm,
      sentCount: 0,
      deliveredCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      status: pushForm.scheduledAt ? "scheduled" : ("sent" as any),
      segmentIds: [],
      personalization: {
        enabled: pushForm.personalization,
        variables: {},
      },
      abTest: {
        enabled: pushForm.abTest,
        variants: [],
      },
    }

    mobileAppManagementSystem.createPushNotification(notificationData)
    setPushNotifications(mobileAppManagementSystem.getPushNotifications())

    setPushForm({
      title: "",
      message: "",
      platform: "all",
      targetAudience: "all",
      scheduledAt: "",
      personalization: false,
      abTest: false,
    })
    setIsPushDialogOpen(false)
    toast.success("Push notification created successfully")
  }

  const updateVersionStatus = (versionId: string, newStatus: any) => {
    mobileAppManagementSystem.updateAppVersion(versionId, { status: newStatus })
    setAppVersions(mobileAppManagementSystem.getAppVersions())
    toast.success(`Version status updated to ${newStatus}`)
  }

  const resolveCrash = (crashId: string) => {
    mobileAppManagementSystem.resolveCrashReport(crashId, {
      fixedInVersion: "2.1.1",
      notes: "Issue resolved in latest update",
    })
    setCrashReports(mobileAppManagementSystem.getCrashReports())
    toast.success("Crash report resolved")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "testing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "review":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "development":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "deprecated":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "ios":
        return "🍎"
      case "android":
        return "🤖"
      case "web":
        return "🌐"
      default:
        return "📱"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Smartphone className="w-10 h-10 mr-4 text-primary" />
              MOBILE APP <span className="text-primary ml-2">MANAGEMENT</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Comprehensive mobile application monitoring, analytics, and management console
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isPushDialogOpen} onOpenChange={setIsPushDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Push
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                  <Upload className="h-4 w-4 mr-2" />
                  Create Update
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Downloads</p>
                    <p className="text-2xl font-bold text-white">{appMetrics.totalDownloads.toLocaleString()}</p>
                    <p className="text-green-400 text-sm flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-black/40 border-blue-500/30 hover:border-blue-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{appMetrics.activeUsers.toLocaleString()}</p>
                    <p className="text-blue-400 text-sm">Daily: {appMetrics.dailyActiveUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/40 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">App Rating</p>
                    <p className="text-2xl font-bold text-white">{appMetrics.averageRating.toFixed(1)}</p>
                    <p className="text-yellow-400 text-sm">{appMetrics.reviewCount.toLocaleString()} reviews</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/40 border-red-500/30 hover:border-red-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Crash Rate</p>
                    <p className="text-2xl font-bold text-white">{(appMetrics.crashRate * 100).toFixed(2)}%</p>
                    <p className={`text-sm ${appMetrics.crashRate < 0.05 ? "text-green-400" : "text-red-400"}`}>
                      {appMetrics.crashRate < 0.05 ? "Excellent" : "Needs attention"}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <Bug className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 backdrop-blur-xl border-primary/20 grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="versions" className="data-[state=active]:bg-primary">
              App Versions
            </TabsTrigger>
            <TabsTrigger value="crashes" className="data-[state=active]:bg-primary">
              Crash Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary">
              Push Notifications
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-primary">
              User Engagement
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Download Trends */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Download Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ios: { label: "iOS", color: platformColors.ios },
                      android: { label: "Android", color: platformColors.android },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceMetrics.crashTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="crashes" stroke={platformColors.ios} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Platform Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceMetrics.platformComparison.slice(0, 2).map((item, index) => ({
                            name: item.platform,
                            value: item.value * 10,
                            color: index === 0 ? platformColors.ios : platformColors.android,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {performanceMetrics.platformComparison.slice(0, 2).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? platformColors.ios : platformColors.android}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-black/20 border border-primary/20">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Version 2.1.0 deployed successfully</p>
                      <p className="text-gray-400 text-sm">Both iOS and Android versions are now live</p>
                      <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-black/20 border border-primary/20">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">High crash rate detected</p>
                      <p className="text-gray-400 text-sm">Android version experiencing crashes in portfolio section</p>
                      <p className="text-gray-500 text-xs mt-1">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-black/20 border border-primary/20">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Push notification sent</p>
                      <p className="text-gray-400 text-sm">Trading signal notification delivered to 15,600 users</p>
                      <p className="text-gray-500 text-xs mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">App Versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appVersions.map((version) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getPlatformIcon(version.platform)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium">
                                Version {version.version} ({version.buildNumber})
                              </h3>
                              <Badge className={getStatusColor(version.status)}>{version.status}</Badge>
                              {version.isForceUpdate && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Force Update</Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm capitalize">
                              {version.platform} • {version.size} MB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {version.status === "live" && (
                            <div className="text-right">
                              <p className="text-white font-medium">{version.downloads.toLocaleString()}</p>
                              <p className="text-gray-400 text-sm">downloads</p>
                            </div>
                          )}
                          <Select
                            value={version.status}
                            onValueChange={(value) => updateVersionStatus(version.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-white/10 border-primary/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-primary/30">
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="live">Live</SelectItem>
                              <SelectItem value="deprecated">Deprecated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Rollout Progress */}
                      {version.status === "live" && version.rolloutPercentage < 100 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Rollout Progress</span>
                            <span className="text-white text-sm">{version.rolloutPercentage}%</span>
                          </div>
                          <Progress value={version.rolloutPercentage} className="h-2" />
                        </div>
                      )}

                      {/* Performance Metrics */}
                      {version.status === "live" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-black/40 rounded-lg">
                            <p className="text-white font-medium">{version.rating.toFixed(1)}</p>
                            <p className="text-gray-400 text-xs">Rating</p>
                          </div>
                          <div className="text-center p-3 bg-black/40 rounded-lg">
                            <p className="text-white font-medium">{(version.crashRate * 100).toFixed(2)}%</p>
                            <p className="text-gray-400 text-xs">Crash Rate</p>
                          </div>
                          <div className="text-center p-3 bg-black/40 rounded-lg">
                            <p className="text-white font-medium">{version.performanceMetrics.loadTime}s</p>
                            <p className="text-gray-400 text-xs">Load Time</p>
                          </div>
                          <div className="text-center p-3 bg-black/40 rounded-lg">
                            <p className="text-white font-medium">{version.performanceMetrics.memoryUsage}MB</p>
                            <p className="text-gray-400 text-xs">Memory Usage</p>
                          </div>
                        </div>
                      )}

                      {/* Features and Bug Fixes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {version.features.length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">New Features</h4>
                            <ul className="space-y-1">
                              {version.features.map((feature, index) => (
                                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                                  <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {version.bugFixes.length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Bug Fixes</h4>
                            <ul className="space-y-1">
                              {version.bugFixes.map((fix, index) => (
                                <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                                  <Bug className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  {fix}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crashes" className="space-y-6">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Crash Reports</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {crashReports.filter((c) => c.status === "open").length} Open
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {crashReports.filter((c) => c.status === "investigating").length} Investigating
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crashReports.map((crash) => (
                    <motion.div
                      key={crash.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCrash(crash)
                        setIsCrashDetailOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              crash.severity === "critical"
                                ? "bg-red-500/20"
                                : crash.severity === "high"
                                  ? "bg-orange-500/20"
                                  : crash.severity === "medium"
                                    ? "bg-yellow-500/20"
                                    : "bg-blue-500/20"
                            }`}
                          >
                            <Bug
                              className={`w-5 h-5 ${
                                crash.severity === "critical"
                                  ? "text-red-400"
                                  : crash.severity === "high"
                                    ? "text-orange-400"
                                    : crash.severity === "medium"
                                      ? "text-yellow-400"
                                      : "text-blue-400"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{crash.title}</h3>
                            <p className="text-gray-400 text-sm">{crash.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-300">
                                {getPlatformIcon(crash.platform)} {crash.platform} • v{crash.version}
                              </span>
                              <span className="text-gray-300">
                                {crash.occurrences} occurrences • {crash.affectedUsers} users
                              </span>
                              <span className="text-gray-500">{crash.reportedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${severityColors[crash.severity]}/20 text-${severityColors[crash.severity]} border-${severityColors[crash.severity]}/30`}
                          >
                            {crash.severity}
                          </Badge>
                          <Badge
                            className={
                              crash.status === "resolved"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : crash.status === "investigating"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {crash.status}
                          </Badge>
                          {crash.status !== "resolved" && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                resolveCrash(crash.id)
                              }}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white">Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pushNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{notification.title}</h3>
                            <p className="text-gray-400 text-sm">{notification.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-300">
                                {getPlatformIcon(notification.platform)} {notification.platform}
                              </span>
                              <span className="text-gray-300">Target: {notification.targetAudience}</span>
                              <span className="text-gray-500">{notification.scheduledAt}</span>
                            </div>
                          </div>
                        </div>

                        <Badge
                          className={
                            notification.status === "sent"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : notification.status === "scheduled"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : notification.status === "failed"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {notification.status}
                        </Badge>
                      </div>

                      {/* Metrics */}
                      {notification.status === "sent" && (
                        <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-primary/20">
                          <div className="text-center">
                            <p className="text-white font-medium">{notification.sentCount.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">Sent</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{notification.deliveredCount.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">Delivered</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{notification.openRate.toFixed(1)}%</p>
                            <p className="text-gray-400 text-xs">Open Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{notification.clickRate.toFixed(1)}%</p>
                            <p className="text-gray-400 text-xs">Click Rate</p>
                          </div>
                        </div>
                      )}

                      {/* A/B Test Results */}
                      {notification.abTest.enabled && notification.abTest.variants.length > 0 && (
                        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">A/B Test Results</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {notification.abTest.variants.map((variant) => (
                              <div key={variant.id} className="p-2 bg-black/40 rounded">
                                <p className="text-white text-sm font-medium">{variant.title}</p>
                                <p className="text-gray-400 text-xs">{variant.message}</p>
                                <div className="flex justify-between mt-2 text-xs">
                                  <span className="text-gray-300">
                                    Open: {((variant.performance.opened / variant.performance.sent) * 100).toFixed(1)}%
                                  </span>
                                  <span className="text-gray-300">
                                    Click: {((variant.performance.clicked / variant.performance.sent) * 100).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* Top Features */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Top Features by Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementInsights.topFeatures.map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium capitalize">{feature.feature.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={feature.usage * 100} className="h-2" />
                        </div>
                        <span className="text-white font-medium w-12 text-right">
                          {(feature.usage * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    High Churn Risk Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {engagementInsights.churnRiskUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{user.userId}</p>
                          <p className="text-gray-400 text-sm">LTV: ${user.lifetimeValue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-medium">{user.churnProbability.toFixed(1)}%</p>
                          <p className="text-gray-400 text-xs">Churn Risk</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-400" />
                    High Value Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {engagementInsights.highValueUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{user.userId}</p>
                          <p className="text-gray-400 text-sm">Engagement: {user.engagementScore.toFixed(1)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-medium">${user.lifetimeValue.toLocaleString()}</p>
                          <p className="text-gray-400 text-xs">LTV</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Trends */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Engagement Trends (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: { label: "Engagement Score", color: "#00ff44" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementInsights.engagementTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="score" stroke="#00ff44" fill="#00ff44" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Session Duration</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.sessionDuration.toFixed(1)}m</p>
                      <p className="text-green-400 text-sm">+5% vs last month</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Clock className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Retention Rate</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.retentionRate.toFixed(1)}%</p>
                      <p className="text-blue-400 text-sm">7-day retention</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Churn Rate</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.churnRate.toFixed(1)}%</p>
                      <p className="text-purple-400 text-sm">Monthly churn</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Version Adoption Chart */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Version Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    percentage: { label: "Adoption %", color: "#3b82f6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceMetrics.versionAdoption}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="version" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="percentage" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create App Update</DialogTitle>
              <DialogDescription className="text-gray-400">Create a new version of your mobile app</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-white">
                    Version Number
                  </Label>
                  <Input
                    id="version"
                    value={updateForm.version}
                    onChange={(e) => setUpdateForm({ ...updateForm, version: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                    placeholder="e.g., 2.2.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Platform</Label>
                  <Select
                    value={updateForm.platform}
                    onValueChange={(value) => setUpdateForm({ ...updateForm, platform: value as any })}
                  >
                    <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-primary/30">
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features" className="text-white">
                  New Features (one per line)
                </Label>
                <Textarea
                  id="features"
                  value={updateForm.features}
                  onChange={(e) => setUpdateForm({ ...updateForm, features: e.target.value })}
                  className="bg-white/10 border-primary/30 text-white"
                  placeholder="Enhanced trading interface&#10;AI-powered insights&#10;Social trading features"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bugFixes" className="text-white">
                  Bug Fixes (one per line)
                </Label>
                <Textarea
                  id="bugFixes"
                  value={updateForm.bugFixes}
                  onChange={(e) => setUpdateForm({ ...updateForm, bugFixes: e.target.value })}
                  className="bg-white/10 border-primary/30 text-white"
                  placeholder="Fixed login issue&#10;Resolved crash on startup&#10;Performance improvements"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Force Update</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={updateForm.isForceUpdate}
                      onCheckedChange={(checked) => setUpdateForm({ ...updateForm, isForceUpdate: checked })}
                    />
                    <Label className="text-white">{updateForm.isForceUpdate ? "Required" : "Optional"}</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Rollout Percentage</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[updateForm.rolloutPercentage]}
                      onValueChange={(value) => setUpdateForm({ ...updateForm, rolloutPercentage: value[0] })}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-white text-sm">{updateForm.rolloutPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAppUpdate}>Create Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Push Notification Dialog */}
        <Dialog open={isPushDialogOpen} onOpenChange={setIsPushDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Send Push Notification</DialogTitle>
              <DialogDescription className="text-gray-400">
                Send a push notification to your mobile app users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pushTitle" className="text-white">
                    Title
                  </Label>
                  <Input
                    id="pushTitle"
                    value={pushForm.title}
                    onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                    placeholder="Notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Platform</Label>
                  <Select
                    value={pushForm.platform}
                    onValueChange={(value) => setPushForm({ ...pushForm, platform: value as any })}
                  >
                    <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-primary/30">
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="ios">iOS Only</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
                      <SelectItem value="web">Web Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pushMessage" className="text-white">
                  Message
                </Label>
                <Textarea
                  id="pushMessage"
                  value={pushForm.message}
                  onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })}
                  className="bg-white/10 border-primary/30 text-white"
                  placeholder="Your notification message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Target Audience</Label>
                  <Select
                    value={pushForm.targetAudience}
                    onValueChange={(value) => setPushForm({ ...pushForm, targetAudience: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-primary/30">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="new">New Users</SelectItem>
                      <SelectItem value="inactive">Inactive Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt" className="text-white">
                    Schedule (Optional)
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={pushForm.scheduledAt}
                    onChange={(e) => setPushForm({ ...pushForm, scheduledAt: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={pushForm.personalization}
                    onCheckedChange={(checked) => setPushForm({ ...pushForm, personalization: checked })}
                  />
                  <Label className="text-white">Enable Personalization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={pushForm.abTest}
                    onCheckedChange={(checked) => setPushForm({ ...pushForm, abTest: checked })}
                  />
                  <Label className="text-white">A/B Test</Label>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-black/40 border border-primary/20">
                <h4 className="text-white font-medium mb-2">Preview</h4>
                <div className="bg-gray-800 rounded-lg p-3 max-w-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{pushForm.title || "Notification Title"}</p>
                      <p className="text-gray-300 text-xs">
                        {pushForm.message || "Your notification message will appear here"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPushDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendPushNotification}>{pushForm.scheduledAt ? "Schedule" : "Send Now"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Crash Detail Dialog */}
        <Dialog open={isCrashDetailOpen} onOpenChange={setIsCrashDetailOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Crash Report Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Detailed information about the crash report
              </DialogDescription>
            </DialogHeader>
            {selectedCrash && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Title</Label>
                      <p className="text-white font-medium">{selectedCrash.title}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <p className="text-gray-400">{selectedCrash.description}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Platform & Version</Label>
                      <p className="text-white">
                        {selectedCrash.platform} v{selectedCrash.version}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Severity</Label>
                      <Badge
                        className={`${severityColors[selectedCrash.severity as keyof typeof severityColors]}/20 text-${severityColors[selectedCrash.severity as keyof typeof severityColors]} border-${severityColors[selectedCrash.severity as keyof typeof severityColors]}/30`}
                      >
                        {selectedCrash.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-gray-300">Status</Label>
                      <Badge
                        className={
                          selectedCrash.status === "resolved"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : selectedCrash.status === "investigating"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {selectedCrash.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-gray-300">Impact</Label>
                      <p className="text-white">
                        {selectedCrash.occurrences} occurrences, {selectedCrash.affectedUsers} users affected
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device Info */}
                <div>
                  <Label className="text-gray-300">Device Information</Label>
                  <div className="mt-2 p-4 bg-black/40 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white ml-2">{selectedCrash.deviceInfo.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">OS Version:</span>
                        <span className="text-white ml-2">{selectedCrash.deviceInfo.osVersion}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">App Version:</span>
                        <span className="text-white ml-2">{selectedCrash.deviceInfo.appVersion}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Memory Available:</span>
                        <span className="text-white ml-2">{selectedCrash.deviceInfo.memoryAvailable}MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reproduction Steps */}
                <div>
                  <Label className="text-gray-300">Reproduction Steps</Label>
                  <div className="mt-2 p-4 bg-black/40 rounded-lg">
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedCrash.reproductionSteps.map((step: string, index: number) => (
                        <li key={index} className="text-gray-300">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Stack Trace */}
                <div>
                  <Label className="text-gray-300">Stack Trace</Label>
                  <div className="mt-2 p-4 bg-black/40 rounded-lg border border-gray-700">
                    <code className="text-gray-400 text-xs font-mono whitespace-pre-wrap">
                      {selectedCrash.stackTrace}
                    </code>
                  </div>
                </div>

                {/* Resolution */}
                {selectedCrash.resolution && (
                  <div>
                    <Label className="text-gray-300">Resolution</Label>
                    <div className="mt-2 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      {selectedCrash.resolution.fixedInVersion && (
                        <p className="text-green-400 text-sm">
                          Fixed in version: {selectedCrash.resolution.fixedInVersion}
                        </p>
                      )}
                      {selectedCrash.resolution.workaround && (
                        <p className="text-yellow-400 text-sm">Workaround: {selectedCrash.resolution.workaround}</p>
                      )}
                      {selectedCrash.resolution.notes && (
                        <p className="text-gray-300 text-sm mt-2">{selectedCrash.resolution.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCrashDetailOpen(false)}>
                Close
              </Button>
              {selectedCrash && selectedCrash.status !== "resolved" && (
                <Button
                  onClick={() => {
                    resolveCrash(selectedCrash.id)
                    setIsCrashDetailOpen(false)
                  }}
                >
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
