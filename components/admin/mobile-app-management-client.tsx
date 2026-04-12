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
} from "lucide-react"
import { toast } from "sonner"

interface AppVersion {
  id: string
  version: string
  buildNumber: number
  platform: "ios" | "android"
  status: "development" | "testing" | "review" | "live" | "deprecated"
  releaseDate: string
  downloads: number
  crashRate: number
  rating: number
  size: number
  features: string[]
  bugFixes: string[]
  isForceUpdate: boolean
  rolloutPercentage: number
}

interface AppMetrics {
  totalDownloads: number
  activeUsers: number
  dailyActiveUsers: number
  monthlyActiveUsers: number
  sessionDuration: number
  retentionRate: number
  crashRate: number
  averageRating: number
  reviewCount: number
}

interface CrashReport {
  id: string
  title: string
  description: string
  platform: "ios" | "android"
  version: string
  occurrences: number
  affectedUsers: number
  severity: "low" | "medium" | "high" | "critical"
  status: "open" | "investigating" | "resolved" | "closed"
  reportedAt: string
  stackTrace: string
}

interface PushNotification {
  id: string
  title: string
  message: string
  platform: "ios" | "android" | "both"
  targetAudience: string
  scheduledAt: string
  sentCount: number
  deliveredCount: number
  openRate: number
  status: "draft" | "scheduled" | "sent" | "failed"
  createdAt: string
}

const platformColors = {
  ios: "#007AFF",
  android: "#3DDC84",
  both: "#8B5CF6",
}

const severityColors = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
}

export default function MobileAppManagementClient() {
  const [appVersions, setAppVersions] = useState<AppVersion[]>([])
  const [appMetrics, setAppMetrics] = useState<AppMetrics | null>(null)
  const [crashReports, setCrashReports] = useState<CrashReport[]>([])
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([])
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Form states
  const [updateForm, setUpdateForm] = useState({
    version: "",
    platform: "both" as "ios" | "android" | "both",
    features: "",
    bugFixes: "",
    isForceUpdate: false,
    rolloutPercentage: 100,
  })

  const [pushForm, setPushForm] = useState({
    title: "",
    message: "",
    platform: "both" as "ios" | "android" | "both",
    targetAudience: "all",
    scheduledAt: "",
  })

  useEffect(() => {
    loadAppData()
  }, [])

  const loadAppData = () => {
    // Mock data - replace with real API
    const mockVersions: AppVersion[] = [
      {
        id: "1",
        version: "2.1.0",
        buildNumber: 210,
        platform: "ios",
        status: "live",
        releaseDate: "2024-01-20",
        downloads: 45000,
        crashRate: 0.02,
        rating: 4.8,
        size: 85.2,
        features: ["Dark mode support", "Enhanced security", "Performance improvements"],
        bugFixes: ["Fixed login issue", "Resolved crash on startup", "Fixed notification display"],
        isForceUpdate: false,
        rolloutPercentage: 100,
      },
      {
        id: "2",
        version: "2.1.0",
        buildNumber: 210,
        platform: "android",
        status: "live",
        releaseDate: "2024-01-20",
        downloads: 67000,
        crashRate: 0.03,
        rating: 4.6,
        size: 92.1,
        features: ["Dark mode support", "Enhanced security", "Performance improvements"],
        bugFixes: ["Fixed login issue", "Resolved crash on startup", "Fixed notification display"],
        isForceUpdate: false,
        rolloutPercentage: 100,
      },
      {
        id: "3",
        version: "2.2.0",
        buildNumber: 220,
        platform: "ios",
        status: "testing",
        releaseDate: "2024-01-25",
        downloads: 0,
        crashRate: 0.01,
        rating: 0,
        size: 87.5,
        features: ["New trading interface", "AI-powered insights", "Social trading features"],
        bugFixes: ["Performance optimizations", "Memory leak fixes"],
        isForceUpdate: false,
        rolloutPercentage: 25,
      },
    ]

    const mockMetrics: AppMetrics = {
      totalDownloads: 112000,
      activeUsers: 45600,
      dailyActiveUsers: 12400,
      monthlyActiveUsers: 38900,
      sessionDuration: 18.5,
      retentionRate: 68.2,
      crashRate: 0.025,
      averageRating: 4.7,
      reviewCount: 8950,
    }

    const mockCrashReports: CrashReport[] = [
      {
        id: "1",
        title: "App crashes on portfolio view",
        description: "Users experiencing crashes when accessing portfolio section",
        platform: "android",
        version: "2.1.0",
        occurrences: 156,
        affectedUsers: 89,
        severity: "high",
        status: "investigating",
        reportedAt: "2024-01-20 14:30",
        stackTrace: "java.lang.NullPointerException at com.nexural.portfolio.PortfolioFragment.onCreate",
      },
      {
        id: "2",
        title: "Memory leak in chart rendering",
        description: "Memory usage increases over time when viewing charts",
        platform: "ios",
        version: "2.1.0",
        occurrences: 45,
        affectedUsers: 32,
        severity: "medium",
        status: "open",
        reportedAt: "2024-01-19 09:15",
        stackTrace: "EXC_BAD_ACCESS at ChartViewController.viewDidLoad",
      },
    ]

    const mockPushNotifications: PushNotification[] = [
      {
        id: "1",
        title: "New Trading Signal Available",
        message: "BTC/USD signal with 85% confidence - Check it out now!",
        platform: "both",
        targetAudience: "Premium Users",
        scheduledAt: "2024-01-21 09:00",
        sentCount: 15600,
        deliveredCount: 14890,
        openRate: 23.5,
        status: "sent",
        createdAt: "2024-01-20",
      },
      {
        id: "2",
        title: "App Update Available",
        message: "Version 2.1.0 is now available with exciting new features!",
        platform: "both",
        targetAudience: "All Users",
        scheduledAt: "2024-01-20 12:00",
        sentCount: 45600,
        deliveredCount: 43200,
        openRate: 18.7,
        status: "sent",
        createdAt: "2024-01-20",
      },
    ]

    setAppVersions(mockVersions)
    setAppMetrics(mockMetrics)
    setCrashReports(mockCrashReports)
    setPushNotifications(mockPushNotifications)
  }

  const createAppUpdate = () => {
    if (!updateForm.version.trim()) {
      toast.error("Please enter a version number")
      return
    }

    const platforms = updateForm.platform === "both" ? ["ios", "android"] : [updateForm.platform]

    platforms.forEach((platform) => {
      const newVersion: AppVersion = {
        id: Date.now().toString() + platform,
        version: updateForm.version,
        buildNumber: Math.floor(Math.random() * 1000) + 200,
        platform: platform as "ios" | "android",
        status: "development",
        releaseDate: new Date().toISOString().split("T")[0],
        downloads: 0,
        crashRate: 0,
        rating: 0,
        size: Math.floor(Math.random() * 50) + 70,
        features: updateForm.features.split("\n").filter((f) => f.trim()),
        bugFixes: updateForm.bugFixes.split("\n").filter((f) => f.trim()),
        isForceUpdate: updateForm.isForceUpdate,
        rolloutPercentage: updateForm.rolloutPercentage,
      }

      setAppVersions((prev) => [...prev, newVersion])
    })

    setUpdateForm({
      version: "",
      platform: "both",
      features: "",
      bugFixes: "",
      isForceUpdate: false,
      rolloutPercentage: 100,
    })
    setIsUpdateDialogOpen(false)
    toast.success("App update created successfully")
  }

  const sendPushNotification = () => {
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const newNotification: PushNotification = {
      id: Date.now().toString(),
      title: pushForm.title,
      message: pushForm.message,
      platform: pushForm.platform,
      targetAudience: pushForm.targetAudience,
      scheduledAt: pushForm.scheduledAt || new Date().toISOString(),
      sentCount: 0,
      deliveredCount: 0,
      openRate: 0,
      status: pushForm.scheduledAt ? "scheduled" : "sent",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setPushNotifications((prev) => [...prev, newNotification])
    setPushForm({
      title: "",
      message: "",
      platform: "both",
      targetAudience: "all",
      scheduledAt: "",
    })
    setIsPushDialogOpen(false)
    toast.success("Push notification created successfully")
  }

  const updateVersionStatus = (versionId: string, newStatus: AppVersion["status"]) => {
    setAppVersions((prev) => prev.map((v) => (v.id === versionId ? { ...v, status: newStatus } : v)))
    toast.success(`Version status updated to ${newStatus}`)
  }

  const updateRolloutPercentage = (versionId: string, percentage: number) => {
    setAppVersions((prev) => prev.map((v) => (v.id === versionId ? { ...v, rolloutPercentage: percentage } : v)))
    toast.success(`Rollout percentage updated to ${percentage}%`)
  }

  const getStatusColor = (status: AppVersion["status"]) => {
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
      default:
        return "📱"
    }
  }

  // Chart data
  const downloadData = [
    { date: "Jan 15", ios: 1200, android: 1800 },
    { date: "Jan 16", ios: 1350, android: 1950 },
    { date: "Jan 17", ios: 1100, android: 1700 },
    { date: "Jan 18", ios: 1450, android: 2100 },
    { date: "Jan 19", ios: 1600, android: 2300 },
    { date: "Jan 20", ios: 1800, android: 2500 },
  ]

  const crashData = [
    { version: "2.0.0", crashes: 45 },
    { version: "2.0.1", crashes: 32 },
    { version: "2.0.2", crashes: 28 },
    { version: "2.1.0", crashes: 15 },
  ]

  const platformDistribution = [
    { name: "iOS", value: 45, color: platformColors.ios },
    { name: "Android", value: 55, color: platformColors.android },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              MOBILE APP <span className="text-primary">MANAGEMENT</span>
            </h1>
            <p className="text-gray-400">Comprehensive mobile app monitoring and management</p>
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
        {appMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Downloads</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.totalDownloads.toLocaleString()}</p>
                      <p className="text-green-400 text-sm">+12% this month</p>
                    </div>
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.activeUsers.toLocaleString()}</p>
                      <p className="text-blue-400 text-sm">Daily: {appMetrics.dailyActiveUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">App Rating</p>
                      <p className="text-2xl font-bold text-white">{appMetrics.averageRating.toFixed(1)}</p>
                      <p className="text-yellow-400 text-sm">{appMetrics.reviewCount.toLocaleString()} reviews</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Crash Rate</p>
                      <p className="text-2xl font-bold text-white">{(appMetrics.crashRate * 100).toFixed(2)}%</p>
                      <p className={`text-sm ${appMetrics.crashRate < 0.05 ? "text-green-400" : "text-red-400"}`}>
                        {appMetrics.crashRate < 0.05 ? "Excellent" : "Needs attention"}
                      </p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Bug className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 backdrop-blur-xl border-primary/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">App Versions</TabsTrigger>
            <TabsTrigger value="crashes">Crash Reports</TabsTrigger>
            <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts */}
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
                      <LineChart data={downloadData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="ios" stroke={platformColors.ios} strokeWidth={2} />
                        <Line type="monotone" dataKey="android" stroke={platformColors.android} strokeWidth={2} />
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
                          data={platformDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {platformDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-black/20 border border-primary/20">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Version 2.1.0 deployed successfully</p>
                      <p className="text-gray-400 text-sm">Both iOS and Android versions are now live</p>
                      <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-black/20 border border-primary/20">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">High crash rate detected</p>
                      <p className="text-gray-400 text-sm">Android version experiencing crashes in portfolio section</p>
                      <p className="text-gray-500 text-xs mt-1">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-black/20 border border-primary/20">
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
                    <div
                      key={version.id}
                      className="p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
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
                            onValueChange={(value) => updateVersionStatus(version.id, value as AppVersion["status"])}
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

                      {/* Metrics */}
                      {version.status === "live" && (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-white font-medium">{version.rating.toFixed(1)}</p>
                            <p className="text-gray-400 text-xs">Rating</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{(version.crashRate * 100).toFixed(2)}%</p>
                            <p className="text-gray-400 text-xs">Crash Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{version.downloads.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">Downloads</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-medium">{version.size} MB</p>
                            <p className="text-gray-400 text-xs">Size</p>
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
                    </div>
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
                    <div
                      key={crash.id}
                      className="p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
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
                        </div>
                      </div>

                      {/* Stack Trace Preview */}
                      <div className="mt-3 p-3 bg-black/40 rounded-lg border border-gray-700">
                        <h4 className="text-white text-sm font-medium mb-2">Stack Trace</h4>
                        <code className="text-gray-400 text-xs font-mono">{crash.stackTrace}</code>
                      </div>
                    </div>
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
                    <div
                      key={notification.id}
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
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-primary/20">
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Crash Analytics */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Crash Analytics by Version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    crashes: { label: "Crashes", color: "#ef4444" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crashData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="version" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="crashes" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Session Duration</p>
                      <p className="text-2xl font-bold text-white">{appMetrics?.sessionDuration.toFixed(1)}m</p>
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
                      <p className="text-2xl font-bold text-white">{appMetrics?.retentionRate.toFixed(1)}%</p>
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
                      <p className="text-gray-400 text-sm">MAU Growth</p>
                      <p className="text-2xl font-bold text-white">+18.5%</p>
                      <p className="text-purple-400 text-sm">Monthly active users</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                      <SelectItem value="both">Both Platforms</SelectItem>
                      <SelectItem value="ios">iOS Only</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
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
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={updateForm.rolloutPercentage}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, rolloutPercentage: Number.parseInt(e.target.value) || 100 })
                      }
                      className="bg-white/10 border-primary/30 text-white"
                    />
                    <Progress value={updateForm.rolloutPercentage} className="h-2" />
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
                      <SelectItem value="both">Both Platforms</SelectItem>
                      <SelectItem value="ios">iOS Only</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
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
      </div>
    </div>
  )
}
