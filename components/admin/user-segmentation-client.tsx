"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Users,
  Target,
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  EyeOff,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChartIcon,
} from "lucide-react"
import { toast } from "sonner"

interface UserSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria[]
  userCount: number
  growthRate: number
  avgRevenue: number
  conversionRate: number
  lastUpdated: string
  isActive: boolean
  color: string
  campaigns: Campaign[]
}

interface SegmentCriteria {
  id: string
  field: string
  operator: string
  value: string | number
  type: "demographic" | "behavioral" | "geographic" | "psychographic" | "transactional"
}

interface Campaign {
  id: string
  name: string
  type: "email" | "push" | "sms" | "in-app"
  status: "draft" | "active" | "paused" | "completed"
  sentCount: number
  openRate: number
  clickRate: number
  conversionRate: number
  createdAt: string
}

const segmentColors = [
  "#00ff44",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#f97316",
  "#ec4899",
  "#6366f1",
  "#84cc16",
]

const criteriaFields = [
  {
    category: "Demographic",
    fields: [
      { key: "age", label: "Age", type: "number" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
      { key: "location", label: "Location", type: "text" },
      { key: "occupation", label: "Occupation", type: "text" },
      { key: "income", label: "Income", type: "number" },
    ],
  },
  {
    category: "Behavioral",
    fields: [
      { key: "last_login", label: "Last Login", type: "date" },
      { key: "session_count", label: "Session Count", type: "number" },
      { key: "avg_session_duration", label: "Avg Session Duration", type: "number" },
      { key: "page_views", label: "Page Views", type: "number" },
      { key: "feature_usage", label: "Feature Usage", type: "select", options: ["High", "Medium", "Low"] },
    ],
  },
  {
    category: "Transactional",
    fields: [
      { key: "total_spent", label: "Total Spent", type: "number" },
      { key: "order_count", label: "Order Count", type: "number" },
      { key: "avg_order_value", label: "Average Order Value", type: "number" },
      {
        key: "subscription_tier",
        label: "Subscription Tier",
        type: "select",
        options: ["Free", "Pro", "Elite", "Enterprise"],
      },
      {
        key: "payment_method",
        label: "Payment Method",
        type: "select",
        options: ["Credit Card", "PayPal", "Bank Transfer", "Crypto"],
      },
    ],
  },
  {
    category: "Geographic",
    fields: [
      { key: "country", label: "Country", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "timezone", label: "Timezone", type: "text" },
      {
        key: "language",
        label: "Language",
        type: "select",
        options: ["English", "Spanish", "French", "German", "Chinese"],
      },
    ],
  },
]

const operators = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "in", label: "In List" },
  { value: "not_in", label: "Not In List" },
]

export default function UserSegmentationClient() {
  const [segments, setSegments] = useState<UserSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(null)
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false)
  const [isEditSegmentOpen, setIsEditSegmentOpen] = useState(false)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("userCount")
  const [filterBy, setFilterBy] = useState("all")

  // Form states
  const [segmentForm, setSegmentForm] = useState({
    name: "",
    description: "",
    criteria: [] as SegmentCriteria[],
    isActive: true,
  })

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    type: "email" as Campaign["type"],
    subject: "",
    content: "",
  })

  useEffect(() => {
    loadSegments()
  }, [])

  const loadSegments = () => {
    // Mock data - replace with real API
    const mockSegments: UserSegment[] = [
      {
        id: "1",
        name: "High-Value Customers",
        description: "Users with high lifetime value and frequent transactions",
        criteria: [
          { id: "c1", field: "total_spent", operator: "greater_than", value: 1000, type: "transactional" },
          { id: "c2", field: "order_count", operator: "greater_than", value: 5, type: "transactional" },
        ],
        userCount: 1250,
        growthRate: 15.2,
        avgRevenue: 2450,
        conversionRate: 8.7,
        lastUpdated: "2024-01-20",
        isActive: true,
        color: segmentColors[0],
        campaigns: [
          {
            id: "camp1",
            name: "VIP Exclusive Offers",
            type: "email",
            status: "active",
            sentCount: 1250,
            openRate: 45.2,
            clickRate: 12.8,
            conversionRate: 8.7,
            createdAt: "2024-01-18",
          },
        ],
      },
      {
        id: "2",
        name: "New Users (30 Days)",
        description: "Recently registered users within the last 30 days",
        criteria: [
          { id: "c3", field: "registration_date", operator: "greater_than", value: "2023-12-20", type: "behavioral" },
        ],
        userCount: 890,
        growthRate: 23.5,
        avgRevenue: 150,
        conversionRate: 3.2,
        lastUpdated: "2024-01-20",
        isActive: true,
        color: segmentColors[1],
        campaigns: [
          {
            id: "camp2",
            name: "Welcome Series",
            type: "email",
            status: "active",
            sentCount: 890,
            openRate: 62.1,
            clickRate: 18.4,
            conversionRate: 3.2,
            createdAt: "2024-01-15",
          },
        ],
      },
      {
        id: "3",
        name: "Inactive Users",
        description: "Users who haven't logged in for more than 60 days",
        criteria: [{ id: "c4", field: "last_login", operator: "less_than", value: "2023-11-20", type: "behavioral" }],
        userCount: 2340,
        growthRate: -8.3,
        avgRevenue: 0,
        conversionRate: 0.8,
        lastUpdated: "2024-01-19",
        isActive: true,
        color: segmentColors[2],
        campaigns: [
          {
            id: "camp3",
            name: "Win-Back Campaign",
            type: "email",
            status: "active",
            sentCount: 2340,
            openRate: 28.5,
            clickRate: 6.2,
            conversionRate: 0.8,
            createdAt: "2024-01-10",
          },
        ],
      },
      {
        id: "4",
        name: "Mobile-First Users",
        description: "Users who primarily access the platform via mobile devices",
        criteria: [{ id: "c5", field: "primary_device", operator: "equals", value: "mobile", type: "behavioral" }],
        userCount: 3200,
        growthRate: 18.7,
        avgRevenue: 890,
        conversionRate: 5.4,
        lastUpdated: "2024-01-20",
        isActive: true,
        color: segmentColors[3],
        campaigns: [],
      },
      {
        id: "5",
        name: "Enterprise Prospects",
        description: "Users showing enterprise-level usage patterns",
        criteria: [
          { id: "c6", field: "team_size", operator: "greater_than", value: 10, type: "demographic" },
          { id: "c7", field: "feature_usage", operator: "equals", value: "High", type: "behavioral" },
        ],
        userCount: 156,
        growthRate: 45.2,
        avgRevenue: 5600,
        conversionRate: 15.8,
        lastUpdated: "2024-01-19",
        isActive: true,
        color: segmentColors[4],
        campaigns: [],
      },
    ]

    setSegments(mockSegments)
  }

  const filteredSegments = segments.filter((segment) => {
    const matchesSearch =
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "active" && segment.isActive) ||
      (filterBy === "inactive" && !segment.isActive)
    return matchesSearch && matchesFilter
  })

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "userCount":
        return b.userCount - a.userCount
      case "growthRate":
        return b.growthRate - a.growthRate
      case "avgRevenue":
        return b.avgRevenue - a.avgRevenue
      default:
        return 0
    }
  })

  const addCriteria = () => {
    const newCriteria: SegmentCriteria = {
      id: `c${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
      type: "demographic",
    }
    setSegmentForm({
      ...segmentForm,
      criteria: [...segmentForm.criteria, newCriteria],
    })
  }

  const updateCriteria = (index: number, field: keyof SegmentCriteria, value: any) => {
    const updatedCriteria = [...segmentForm.criteria]
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value }
    setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
  }

  const removeCriteria = (index: number) => {
    const updatedCriteria = segmentForm.criteria.filter((_, i) => i !== index)
    setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
  }

  const createSegment = () => {
    if (!segmentForm.name.trim()) {
      toast.error("Please enter a segment name")
      return
    }

    if (segmentForm.criteria.length === 0) {
      toast.error("Please add at least one criteria")
      return
    }

    const newSegment: UserSegment = {
      id: Date.now().toString(),
      name: segmentForm.name,
      description: segmentForm.description,
      criteria: segmentForm.criteria,
      userCount: Math.floor(Math.random() * 5000) + 100,
      growthRate: (Math.random() - 0.5) * 50,
      avgRevenue: Math.floor(Math.random() * 3000) + 100,
      conversionRate: Math.random() * 15,
      lastUpdated: new Date().toISOString().split("T")[0],
      isActive: segmentForm.isActive,
      color: segmentColors[segments.length % segmentColors.length],
      campaigns: [],
    }

    setSegments([...segments, newSegment])
    setSegmentForm({ name: "", description: "", criteria: [], isActive: true })
    setIsCreateSegmentOpen(false)
    toast.success("Segment created successfully")
  }

  const deleteSegment = (segmentId: string) => {
    setSegments(segments.filter((s) => s.id !== segmentId))
    toast.success("Segment deleted successfully")
  }

  const toggleSegmentStatus = (segmentId: string) => {
    setSegments(segments.map((s) => (s.id === segmentId ? { ...s, isActive: !s.isActive } : s)))
    toast.success("Segment status updated")
  }

  const createCampaign = () => {
    if (!selectedSegment || !campaignForm.name.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const newCampaign: Campaign = {
      id: `camp${Date.now()}`,
      name: campaignForm.name,
      type: campaignForm.type,
      status: "draft",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedSegments = segments.map((s) =>
      s.id === selectedSegment.id ? { ...s, campaigns: [...s.campaigns, newCampaign] } : s,
    )

    setSegments(updatedSegments)
    setCampaignForm({ name: "", type: "email", subject: "", content: "" })
    setIsCampaignDialogOpen(false)
    toast.success("Campaign created successfully")
  }

  const getSegmentOverview = () => {
    const totalUsers = segments.reduce((sum, s) => sum + s.userCount, 0)
    const activeSegments = segments.filter((s) => s.isActive).length
    const avgGrowthRate = segments.reduce((sum, s) => sum + s.growthRate, 0) / segments.length
    const totalCampaigns = segments.reduce((sum, s) => sum + s.campaigns.length, 0)

    return { totalUsers, activeSegments, avgGrowthRate, totalCampaigns }
  }

  const overview = getSegmentOverview()

  const segmentDistributionData = segments.map((segment) => ({
    name: segment.name,
    value: segment.userCount,
    color: segment.color,
  }))

  const performanceData = segments.map((segment) => ({
    name: segment.name.substring(0, 10) + "...",
    users: segment.userCount,
    revenue: segment.avgRevenue,
    conversion: segment.conversionRate,
  }))

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              USER <span className="text-primary">SEGMENTATION</span>
            </h1>
            <p className="text-gray-400">Advanced user segmentation and targeting capabilities</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsCreateSegmentOpen(true)}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-black/40 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{overview.totalUsers.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">Across all segments</p>
                  </div>
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
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
                    <p className="text-gray-400 text-sm">Active Segments</p>
                    <p className="text-2xl font-bold text-white">{overview.activeSegments}</p>
                    <p className="text-blue-400 text-sm">of {segments.length} total</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="h-6 w-6 text-blue-400" />
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
                    <p className="text-gray-400 text-sm">Avg Growth Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {overview.avgGrowthRate > 0 ? "+" : ""}
                      {overview.avgGrowthRate.toFixed(1)}%
                    </p>
                    <p className={`text-sm ${overview.avgGrowthRate > 0 ? "text-green-400" : "text-red-400"}`}>
                      {overview.avgGrowthRate > 0 ? "Growing" : "Declining"}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    {overview.avgGrowthRate > 0 ? (
                      <TrendingUp className="h-6 w-6 text-yellow-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-yellow-400" />
                    )}
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
                    <p className="text-gray-400 text-sm">Active Campaigns</p>
                    <p className="text-2xl font-bold text-white">{overview.totalCampaigns}</p>
                    <p className="text-blue-400 text-sm">Running campaigns</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Send className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Distribution */}
          <Card className="bg-black/40 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Segment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {segmentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <Card className="bg-black/40 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: "Users", color: "#00ff44" },
                  revenue: { label: "Avg Revenue", color: "#3b82f6" },
                  conversion: { label: "Conversion %", color: "#8b5cf6" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="#00ff44" />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="conversion" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Segments List */}
        <Card className="bg-black/40 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Segments</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-primary/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-white/10 border-primary/30 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-primary/30">
                    <SelectItem value="userCount">User Count</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="growthRate">Growth Rate</SelectItem>
                    <SelectItem value="avgRevenue">Avg Revenue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[150px] bg-white/10 border-primary/30 text-white">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-primary/30">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {sortedSegments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium">{segment.name}</h3>
                            <Badge
                              className={
                                segment.isActive
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }
                            >
                              {segment.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{segment.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-300">
                              <Users className="w-4 h-4 inline mr-1" />
                              {segment.userCount.toLocaleString()} users
                            </span>
                            <span className={segment.growthRate > 0 ? "text-green-400" : "text-red-400"}>
                              {segment.growthRate > 0 ? (
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 inline mr-1" />
                              )}
                              {segment.growthRate > 0 ? "+" : ""}
                              {segment.growthRate.toFixed(1)}%
                            </span>
                            <span className="text-blue-400">
                              <DollarSign className="w-4 h-4 inline mr-1" />${segment.avgRevenue}
                            </span>
                            <span className="text-blue-400">
                              <Target className="w-4 h-4 inline mr-1" />
                              {segment.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSegment(segment)
                            setIsCampaignDialogOpen(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSegment(segment)
                            setSegmentForm({
                              name: segment.name,
                              description: segment.description,
                              criteria: segment.criteria,
                              isActive: segment.isActive,
                            })
                            setIsEditSegmentOpen(true)
                          }}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSegmentStatus(segment.id)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                        >
                          {segment.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSegment(segment.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Campaigns */}
                    {segment.campaigns.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <h4 className="text-white font-medium mb-2">Active Campaigns</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {segment.campaigns.map((campaign) => (
                            <div key={campaign.id} className="p-3 rounded-lg bg-black/40 border border-primary/20">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-white text-sm font-medium">{campaign.name}</h5>
                                <Badge
                                  className={
                                    campaign.status === "active"
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : campaign.status === "paused"
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                  }
                                >
                                  {campaign.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-400">Open Rate:</span>
                                  <span className="text-white ml-1">{campaign.openRate.toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Click Rate:</span>
                                  <span className="text-white ml-1">{campaign.clickRate.toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Sent:</span>
                                  <span className="text-white ml-1">{campaign.sentCount.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Conversion:</span>
                                  <span className="text-white ml-1">{campaign.conversionRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedSegments.length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No segments found</p>
                  <p className="text-gray-500 text-sm">Create your first segment to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Segment Dialog */}
        <Dialog open={isCreateSegmentOpen} onOpenChange={setIsCreateSegmentOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Segment</DialogTitle>
              <DialogDescription className="text-gray-400">
                Define criteria to segment your users for targeted campaigns
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segmentName" className="text-white">
                    Segment Name
                  </Label>
                  <Input
                    id="segmentName"
                    value={segmentForm.name}
                    onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                    placeholder="Enter segment name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={segmentForm.isActive}
                      onCheckedChange={(checked) => setSegmentForm({ ...segmentForm, isActive: checked })}
                    />
                    <Label className="text-white">{segmentForm.isActive ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segmentDescription" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="segmentDescription"
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                  className="bg-white/10 border-primary/30 text-white"
                  placeholder="Describe this segment"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Criteria</Label>
                  <Button
                    onClick={addCriteria}
                    size="sm"
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criteria
                  </Button>
                </div>

                {segmentForm.criteria.map((criteria, index) => (
                  <div key={criteria.id} className="p-4 rounded-lg border border-primary/20 bg-black/20">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Field</Label>
                        <Select value={criteria.field} onValueChange={(value) => updateCriteria(index, "field", value)}>
                          <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-primary/30">
                            {criteriaFields.map((category) => (
                              <div key={category.category}>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                                  {category.category}
                                </div>
                                {category.fields.map((field) => (
                                  <SelectItem key={field.key} value={field.key}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Operator</Label>
                        <Select
                          value={criteria.operator}
                          onValueChange={(value) => updateCriteria(index, "operator", value)}
                        >
                          <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-primary/30">
                            {operators.map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Value</Label>
                        <Input
                          value={criteria.value}
                          onChange={(e) => updateCriteria(index, "value", e.target.value)}
                          className="bg-white/10 border-primary/30 text-white"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Action</Label>
                        <Button
                          onClick={() => removeCriteria(index)}
                          size="sm"
                          variant="outline"
                          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {segmentForm.criteria.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
                    <Filter className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No criteria added yet</p>
                    <p className="text-gray-500 text-sm">Click "Add Criteria" to define segment rules</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateSegmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSegment}>Create Segment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Campaign Dialog */}
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Campaign</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a targeted campaign for {selectedSegment?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName" className="text-white">
                    Campaign Name
                  </Label>
                  <Input
                    id="campaignName"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Campaign Type</Label>
                  <Select
                    value={campaignForm.type}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, type: value as Campaign["type"] })}
                  >
                    <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-primary/30">
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in-app">In-App Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {campaignForm.type === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white">
                    Subject Line
                  </Label>
                  <Input
                    id="subject"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    className="bg-white/10 border-primary/30 text-white"
                    placeholder="Enter email subject"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  className="bg-white/10 border-primary/30 text-white"
                  placeholder="Enter campaign content"
                  rows={6}
                />
              </div>

              {selectedSegment && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="text-white font-medium mb-2">Target Audience</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Segment:</span>
                      <span className="text-white ml-2">{selectedSegment.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Users:</span>
                      <span className="text-white ml-2">{selectedSegment.userCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Revenue:</span>
                      <span className="text-white ml-2">${selectedSegment.avgRevenue}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Conversion Rate:</span>
                      <span className="text-white ml-2">{selectedSegment.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCampaign}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
