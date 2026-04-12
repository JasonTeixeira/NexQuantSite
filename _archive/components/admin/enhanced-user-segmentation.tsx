"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts"
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
  Brain,
  Zap,
  Activity,
  AlertTriangle,
  Star,
  Layers,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface EnhancedUserSegment {
  id: string
  name: string
  description: string
  criteria: AdvancedCriteria[]
  userCount: number
  growthRate: number
  avgRevenue: number
  conversionRate: number
  engagementScore: number
  churnRisk: number
  lifetimeValue: number
  lastUpdated: string
  isActive: boolean
  color: string
  campaigns: Campaign[]
  automationRules: AutomationRule[]
  predictiveInsights: PredictiveInsight[]
  segments: SubSegment[]
  tags: string[]
}

interface AdvancedCriteria {
  id: string
  field: string
  operator: string
  value: any
  type: "demographic" | "behavioral" | "transactional" | "engagement" | "predictive"
  weight: number
  logicOperator?: "AND" | "OR"
  nested?: AdvancedCriteria[]
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  conditions: AdvancedCriteria[]
  actions: {
    type: string
    parameters: Record<string, any>
    delay?: number
  }[]
  isActive: boolean
  performance: {
    triggered: number
    successful: number
    failed: number
  }
}

interface PredictiveInsight {
  type: "churn_risk" | "conversion_probability" | "ltv_prediction" | "next_best_action"
  value: number
  confidence: number
  recommendation: string
  impact: "high" | "medium" | "low"
}

interface SubSegment {
  id: string
  name: string
  parentId: string
  userCount: number
  criteria: AdvancedCriteria[]
}

interface Campaign {
  id: string
  name: string
  type: "email" | "push" | "sms" | "in-app" | "retargeting"
  status: "draft" | "active" | "paused" | "completed"
  sentCount: number
  openRate: number
  clickRate: number
  conversionRate: number
  roi: number
  createdAt: string
  segmentPerformance: {
    [segmentId: string]: {
      sent: number
      opened: number
      clicked: number
      converted: number
    }
  }
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

const advancedCriteriaFields = [
  {
    category: "Behavioral Intelligence",
    fields: [
      { key: "session_frequency", label: "Session Frequency", type: "number", description: "Sessions per day" },
      {
        key: "feature_stickiness",
        label: "Feature Stickiness",
        type: "number",
        description: "Feature usage consistency",
      },
      {
        key: "user_journey_stage",
        label: "User Journey Stage",
        type: "select",
        options: ["Awareness", "Interest", "Consideration", "Purchase", "Retention", "Advocacy"],
      },
      {
        key: "engagement_velocity",
        label: "Engagement Velocity",
        type: "number",
        description: "Rate of engagement increase",
      },
      {
        key: "content_affinity",
        label: "Content Affinity",
        type: "select",
        options: ["Educational", "News", "Analysis", "Community", "Tools"],
      },
    ],
  },
  {
    category: "Predictive Attributes",
    fields: [
      {
        key: "churn_probability",
        label: "Churn Probability",
        type: "number",
        description: "AI-predicted churn risk %",
      },
      {
        key: "conversion_likelihood",
        label: "Conversion Likelihood",
        type: "number",
        description: "Likelihood to convert %",
      },
      { key: "ltv_prediction", label: "Predicted LTV", type: "number", description: "AI-predicted lifetime value" },
      {
        key: "next_action_propensity",
        label: "Next Action Propensity",
        type: "select",
        options: ["Upgrade", "Engage", "Refer", "Churn"],
      },
      { key: "growth_potential", label: "Growth Potential", type: "select", options: ["High", "Medium", "Low"] },
    ],
  },
  {
    category: "Advanced Demographics",
    fields: [
      {
        key: "psychographic_profile",
        label: "Psychographic Profile",
        type: "select",
        options: ["Conservative", "Aggressive", "Balanced", "Explorer"],
      },
      {
        key: "technology_adoption",
        label: "Technology Adoption",
        type: "select",
        options: ["Early Adopter", "Mainstream", "Laggard"],
      },
      { key: "risk_tolerance", label: "Risk Tolerance", type: "select", options: ["High", "Medium", "Low"] },
      {
        key: "time_zone_activity",
        label: "Time Zone Activity",
        type: "select",
        options: ["Morning", "Afternoon", "Evening", "Night"],
      },
      {
        key: "device_preference",
        label: "Device Preference",
        type: "select",
        options: ["Desktop", "Mobile", "Tablet", "Cross-platform"],
      },
    ],
  },
  {
    category: "Engagement Metrics",
    fields: [
      {
        key: "virality_coefficient",
        label: "Virality Coefficient",
        type: "number",
        description: "Referral generation rate",
      },
      {
        key: "support_interaction",
        label: "Support Interaction",
        type: "select",
        options: ["High", "Medium", "Low", "None"],
      },
      {
        key: "community_participation",
        label: "Community Participation",
        type: "number",
        description: "Community engagement score",
      },
      {
        key: "feedback_sentiment",
        label: "Feedback Sentiment",
        type: "select",
        options: ["Positive", "Neutral", "Negative"],
      },
      { key: "advocacy_score", label: "Advocacy Score", type: "number", description: "Net Promoter Score" },
    ],
  },
]

export default function EnhancedUserSegmentation() {
  const [segments, setSegments] = useState<EnhancedUserSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<EnhancedUserSegment | null>(null)
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false)
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("userCount")
  const [filterBy, setFilterBy] = useState("all")
  const [viewMode, setViewMode] = useState<"cards" | "table" | "analytics">("cards")

  // Enhanced form state
  const [segmentForm, setSegmentForm] = useState({
    name: "",
    description: "",
    criteria: [] as AdvancedCriteria[],
    isActive: true,
    tags: [] as string[],
    automationRules: [] as AutomationRule[],
  })

  const [advancedFilters, setAdvancedFilters] = useState({
    engagementRange: [0, 100],
    revenueRange: [0, 10000],
    churnRiskRange: [0, 100],
    userCountRange: [0, 50000],
    tags: [] as string[],
    createdDateRange: {
      start: "",
      end: "",
    },
  })

  useEffect(() => {
    loadEnhancedSegments()
  }, [])

  const loadEnhancedSegments = () => {
    // Enhanced mock data with AI-powered insights
    const mockSegments: EnhancedUserSegment[] = [
      {
        id: "1",
        name: "AI-Identified Power Users",
        description: "Machine learning identified high-value users with exceptional engagement patterns",
        criteria: [
          {
            id: "c1",
            field: "engagement_velocity",
            operator: "greater_than",
            value: 85,
            type: "behavioral",
            weight: 0.4,
          },
          {
            id: "c2",
            field: "feature_stickiness",
            operator: "greater_than",
            value: 75,
            type: "behavioral",
            weight: 0.3,
          },
          {
            id: "c3",
            field: "ltv_prediction",
            operator: "greater_than",
            value: 3000,
            type: "predictive",
            weight: 0.3,
          },
        ],
        userCount: 847,
        growthRate: 23.5,
        avgRevenue: 4250,
        conversionRate: 18.7,
        engagementScore: 92.3,
        churnRisk: 8.2,
        lifetimeValue: 4850,
        lastUpdated: "2024-01-20",
        isActive: true,
        color: segmentColors[0],
        campaigns: [],
        automationRules: [
          {
            id: "ar1",
            name: "VIP Treatment Automation",
            trigger: "segment_entry",
            conditions: [],
            actions: [
              {
                type: "assign_vip_status",
                parameters: { tier: "platinum" },
              },
              {
                type: "send_email",
                parameters: { template: "vip_welcome" },
                delay: 60,
              },
            ],
            isActive: true,
            performance: {
              triggered: 847,
              successful: 832,
              failed: 15,
            },
          },
        ],
        predictiveInsights: [
          {
            type: "churn_risk",
            value: 8.2,
            confidence: 94.5,
            recommendation: "Maintain high engagement with exclusive content",
            impact: "low",
          },
          {
            type: "ltv_prediction",
            value: 4850,
            confidence: 91.2,
            recommendation: "Focus on retention and expansion opportunities",
            impact: "high",
          },
        ],
        segments: [],
        tags: ["AI-Generated", "High-Value", "VIP"],
      },
      {
        id: "2",
        name: "Conversion-Ready Prospects",
        description: "Users showing strong conversion signals based on behavioral analysis",
        criteria: [
          {
            id: "c4",
            field: "conversion_likelihood",
            operator: "greater_than",
            value: 70,
            type: "predictive",
            weight: 0.5,
          },
          {
            id: "c5",
            field: "user_journey_stage",
            operator: "equals",
            value: "Consideration",
            type: "behavioral",
            weight: 0.3,
          },
          {
            id: "c6",
            field: "engagement_score",
            operator: "greater_than",
            value: 60,
            type: "engagement",
            weight: 0.2,
          },
        ],
        userCount: 1234,
        growthRate: 31.2,
        avgRevenue: 0,
        conversionRate: 0,
        engagementScore: 68.7,
        churnRisk: 25.3,
        lifetimeValue: 2100,
        lastUpdated: "2024-01-20",
        isActive: true,
        color: segmentColors[1],
        campaigns: [],
        automationRules: [],
        predictiveInsights: [
          {
            type: "conversion_probability",
            value: 76.8,
            confidence: 88.3,
            recommendation: "Deploy targeted conversion campaign within 48 hours",
            impact: "high",
          },
          {
            type: "next_best_action",
            value: 85.2,
            confidence: 82.1,
            recommendation: "Offer limited-time trial with premium features",
            impact: "high",
          },
        ],
        segments: [],
        tags: ["High-Intent", "Conversion-Ready", "Prospects"],
      },
      {
        id: "3",
        name: "At-Risk Champions",
        description: "Previously high-value users showing early churn signals",
        criteria: [
          {
            id: "c7",
            field: "churn_probability",
            operator: "greater_than",
            value: 60,
            type: "predictive",
            weight: 0.4,
          },
          {
            id: "c8",
            field: "ltv_prediction",
            operator: "greater_than",
            value: 2000,
            type: "predictive",
            weight: 0.3,
          },
          {
            id: "c9",
            field: "engagement_velocity",
            operator: "less_than",
            value: -15,
            type: "behavioral",
            weight: 0.3,
          },
        ],
        userCount: 432,
        growthRate: -12.8,
        avgRevenue: 3200,
        conversionRate: 0,
        engagementScore: 34.2,
        churnRisk: 72.5,
        lifetimeValue: 2850,
        lastUpdated: "2024-01-19",
        isActive: true,
        color: segmentColors[2],
        campaigns: [],
        automationRules: [],
        predictiveInsights: [
          {
            type: "churn_risk",
            value: 72.5,
            confidence: 91.7,
            recommendation: "Immediate intervention required - deploy win-back campaign",
            impact: "high",
          },
          {
            type: "next_best_action",
            value: 78.3,
            confidence: 86.4,
            recommendation: "Personal outreach from success team",
            impact: "high",
          },
        ],
        segments: [],
        tags: ["High-Risk", "Win-Back", "Previously-Valuable"],
      },
    ]

    setSegments(mockSegments)
  }

  const filteredAndSortedSegments = useMemo(() => {
    const filtered = segments.filter((segment) => {
      const matchesSearch =
        segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "active" && segment.isActive) ||
        (filterBy === "inactive" && !segment.isActive) ||
        (filterBy === "high-value" && segment.avgRevenue > 2000) ||
        (filterBy === "at-risk" && segment.churnRisk > 50)

      const matchesAdvancedFilters =
        segment.engagementScore >= advancedFilters.engagementRange[0] &&
        segment.engagementScore <= advancedFilters.engagementRange[1] &&
        segment.avgRevenue >= advancedFilters.revenueRange[0] &&
        segment.avgRevenue <= advancedFilters.revenueRange[1] &&
        segment.churnRisk >= advancedFilters.churnRiskRange[0] &&
        segment.churnRisk <= advancedFilters.churnRiskRange[1] &&
        segment.userCount >= advancedFilters.userCountRange[0] &&
        segment.userCount <= advancedFilters.userCountRange[1]

      return matchesSearch && matchesFilter && matchesAdvancedFilters
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "userCount":
          return b.userCount - a.userCount
        case "growthRate":
          return b.growthRate - a.growthRate
        case "avgRevenue":
          return b.avgRevenue - a.avgRevenue
        case "engagementScore":
          return b.engagementScore - a.engagementScore
        case "churnRisk":
          return b.churnRisk - a.churnRisk
        case "lifetimeValue":
          return b.lifetimeValue - a.lifetimeValue
        default:
          return 0
      }
    })
  }, [segments, searchTerm, filterBy, sortBy, advancedFilters])

  const segmentOverview = useMemo(() => {
    const totalUsers = segments.reduce((sum, s) => sum + s.userCount, 0)
    const activeSegments = segments.filter((s) => s.isActive).length
    const avgEngagement = segments.reduce((sum, s) => sum + s.engagementScore, 0) / segments.length
    const avgChurnRisk = segments.reduce((sum, s) => sum + s.churnRisk, 0) / segments.length
    const totalRevenue = segments.reduce((sum, s) => sum + s.avgRevenue * s.userCount, 0)
    const totalAutomationRules = segments.reduce((sum, s) => sum + s.automationRules.length, 0)

    return {
      totalUsers,
      activeSegments,
      avgEngagement,
      avgChurnRisk,
      totalRevenue,
      totalAutomationRules,
    }
  }, [segments])

  const addAdvancedCriteria = () => {
    const newCriteria: AdvancedCriteria = {
      id: `c${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
      type: "behavioral",
      weight: 1,
      logicOperator: "AND",
    }
    setSegmentForm({
      ...segmentForm,
      criteria: [...segmentForm.criteria, newCriteria],
    })
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

    const newSegment: EnhancedUserSegment = {
      id: Date.now().toString(),
      name: segmentForm.name,
      description: segmentForm.description,
      criteria: segmentForm.criteria,
      userCount: Math.floor(Math.random() * 5000) + 100,
      growthRate: (Math.random() - 0.5) * 50,
      avgRevenue: Math.floor(Math.random() * 3000) + 100,
      conversionRate: Math.random() * 15,
      engagementScore: Math.random() * 100,
      churnRisk: Math.random() * 100,
      lifetimeValue: Math.random() * 5000 + 1000,
      lastUpdated: new Date().toISOString().split("T")[0],
      isActive: segmentForm.isActive,
      color: segmentColors[segments.length % segmentColors.length],
      campaigns: [],
      automationRules: segmentForm.automationRules,
      predictiveInsights: [
        {
          type: "churn_risk",
          value: Math.random() * 50,
          confidence: Math.random() * 30 + 70,
          recommendation: "Monitor engagement patterns closely",
          impact: "medium",
        },
      ],
      segments: [],
      tags: segmentForm.tags,
    }

    setSegments([...segments, newSegment])
    setSegmentForm({
      name: "",
      description: "",
      criteria: [],
      isActive: true,
      tags: [],
      automationRules: [],
    })
    setIsCreateSegmentOpen(false)
    toast.success("Enhanced segment created successfully")
  }

  const generateAIInsights = () => {
    const insights = [
      "AI detected a new micro-segment of 'Weekend Warriors' with 89% accuracy",
      "Engagement patterns suggest opportunity for 'Mobile-First' segment targeting",
      "Churn prediction model identifies 234 users requiring immediate attention",
      "Cross-segment analysis reveals untapped revenue potential of $145K",
      "Behavioral clustering suggests 3 new automation opportunities",
    ]

    return insights
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="w-10 h-10 mr-4 text-primary" />
              INTELLIGENT <span className="text-primary ml-2">SEGMENTATION</span>
            </h1>
            <p className="text-gray-400 text-lg">
              AI-powered user segmentation with predictive analytics and automated lifecycle management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsAIInsightsOpen(true)}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
            <Button
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button
              onClick={() => setIsCreateSegmentOpen(true)}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>

        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-black/40 border-primary/30 hover:border-primary/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Total Users</p>
                    <p className="text-xl font-bold text-white">{segmentOverview.totalUsers.toLocaleString()}</p>
                    <p className="text-green-400 text-xs">Segmented</p>
                  </div>
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-black/40 border-blue-500/30 hover:border-blue-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Active Segments</p>
                    <p className="text-xl font-bold text-white">{segmentOverview.activeSegments}</p>
                    <p className="text-blue-400 text-xs">Intelligent</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/40 border-green-500/30 hover:border-green-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Avg Engagement</p>
                    <p className="text-xl font-bold text-white">{segmentOverview.avgEngagement.toFixed(1)}</p>
                    <p className="text-green-400 text-xs">Score</p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-black/40 border-red-500/30 hover:border-red-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Avg Churn Risk</p>
                    <p className="text-xl font-bold text-white">{segmentOverview.avgChurnRisk.toFixed(1)}%</p>
                    <p className="text-red-400 text-xs">Monitored</p>
                  </div>
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-black/40 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Total Revenue</p>
                    <p className="text-xl font-bold text-white">
                      ${(segmentOverview.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-yellow-400 text-xs">Attributed</p>
                  </div>
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-black/40 border-purple-500/30 hover:border-purple-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Automation Rules</p>
                    <p className="text-xl font-bold text-white">{segmentOverview.totalAutomationRules}</p>
                    <p className="text-purple-400 text-xs">Active</p>
                  </div>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* View Mode Selector and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "cards" ? "default" : "ghost"}
                onClick={() => setViewMode("cards")}
                className="text-white"
              >
                <Layers className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                className="text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                size="sm"
                variant={viewMode === "analytics" ? "default" : "ghost"}
                onClick={() => setViewMode("analytics")}
                className="text-white"
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search segments, tags, insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-primary/30 text-white placeholder:text-gray-400 w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] bg-white/10 border-primary/30 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-primary/30">
                <SelectItem value="userCount">User Count</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="growthRate">Growth Rate</SelectItem>
                <SelectItem value="avgRevenue">Avg Revenue</SelectItem>
                <SelectItem value="engagementScore">Engagement Score</SelectItem>
                <SelectItem value="churnRisk">Churn Risk</SelectItem>
                <SelectItem value="lifetimeValue">Lifetime Value</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px] bg-white/10 border-primary/30 text-white">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-primary/30">
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
                <SelectItem value="high-value">High Value</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => loadEnhancedSegments()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "cards" && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAndSortedSegments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-xl border border-primary/20 bg-black/20 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 rounded-full mt-1" style={{ backgroundColor: segment.color }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{segment.name}</h3>
                          <Badge
                            className={
                              segment.isActive
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }
                          >
                            {segment.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {segment.tags.map((tag) => (
                            <Badge key={tag} className="bg-primary/20 text-primary border-primary/30 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-400 mb-3">{segment.description}</p>

                        {/* Enhanced Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Users</div>
                            <div className="text-lg font-bold text-white flex items-center justify-center">
                              <Users className="w-4 h-4 mr-1" />
                              {segment.userCount.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Growth</div>
                            <div
                              className={`text-lg font-bold flex items-center justify-center ${
                                segment.growthRate > 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {segment.growthRate > 0 ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                              )}
                              {segment.growthRate > 0 ? "+" : ""}
                              {segment.growthRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Revenue</div>
                            <div className="text-lg font-bold text-blue-400 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {segment.avgRevenue.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Engagement</div>
                            <div className="text-lg font-bold text-purple-400">
                              {segment.engagementScore.toFixed(1)}
                            </div>
                            <Progress value={segment.engagementScore} className="h-1 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Churn Risk</div>
                            <div
                              className={`text-lg font-bold ${
                                segment.churnRisk > 70
                                  ? "text-red-400"
                                  : segment.churnRisk > 40
                                    ? "text-yellow-400"
                                    : "text-green-400"
                              }`}
                            >
                              {segment.churnRisk.toFixed(1)}%
                            </div>
                            <Progress value={segment.churnRisk} className="h-1 mt-1" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">LTV</div>
                            <div className="text-lg font-bold text-yellow-400 flex items-center justify-center">
                              <Star className="w-4 h-4 mr-1" />${(segment.lifetimeValue / 1000).toFixed(1)}K
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-400">Conversion</div>
                            <div className="text-lg font-bold text-green-400 flex items-center justify-center">
                              <Target className="w-4 h-4 mr-1" />
                              {segment.conversionRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Predictive Insights */}
                        {segment.predictiveInsights.length > 0 && (
                          <div className="mb-4 p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                            <h4 className="text-white font-medium mb-2 flex items-center">
                              <Brain className="w-4 h-4 mr-2 text-purple-400" />
                              AI Insights
                            </h4>
                            <div className="space-y-2">
                              {segment.predictiveInsights.map((insight, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-purple-300">{insight.recommendation}</span>
                                  <Badge
                                    className={`${
                                      insight.impact === "high"
                                        ? "bg-red-500/20 text-red-400"
                                        : insight.impact === "medium"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-green-500/20 text-green-400"
                                    }`}
                                  >
                                    {insight.confidence.toFixed(1)}% confident
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Automation Rules */}
                        {segment.automationRules.length > 0 && (
                          <div className="mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                            <h4 className="text-white font-medium mb-2 flex items-center">
                              <Zap className="w-4 h-4 mr-2 text-blue-400" />
                              Active Automations
                            </h4>
                            <div className="space-y-2">
                              {segment.automationRules.map((rule) => (
                                <div key={rule.id} className="flex items-center justify-between text-sm">
                                  <span className="text-blue-300">{rule.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-500/20 text-green-400">
                                      {((rule.performance.successful / rule.performance.triggered) * 100).toFixed(1)}%
                                      success
                                    </Badge>
                                    <Badge
                                      className={
                                        rule.isActive
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-gray-500/20 text-gray-400"
                                      }
                                    >
                                      {rule.isActive ? "Active" : "Paused"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedSegment(segment)
                          // Open campaign dialog
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
                          // Open edit dialog
                        }}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Toggle visibility
                        }}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                      >
                        {segment.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Delete segment
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAndSortedSegments.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No segments match your criteria</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or create a new segment</p>
              </div>
            )}
          </div>
        )}

        {viewMode === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segment Distribution Chart */}
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
                        data={segments.map((s) => ({ name: s.name, value: s.userCount, color: s.color }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name?.substring(0, 10)}...: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {segments.map((segment, index) => (
                          <Cell key={`cell-${index}`} fill={segment.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Engagement vs Churn Risk Scatter */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Engagement vs Churn Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      data={segments.map((s) => ({
                        engagement: s.engagementScore,
                        churn: s.churnRisk,
                        name: s.name.substring(0, 15) + "...",
                        users: s.userCount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="engagement"
                        stroke="#9CA3AF"
                        label={{ value: "Engagement Score", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis
                        dataKey="churn"
                        stroke="#9CA3AF"
                        label={{ value: "Churn Risk %", angle: -90, position: "insideLeft" }}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Scatter dataKey="users" fill="#00ff44" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Segment Dialog - Enhanced */}
        <Dialog open={isCreateSegmentOpen} onOpenChange={setIsCreateSegmentOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 w-5 text-primary" />
                Create Intelligent Segment
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Build advanced user segments with AI-powered criteria and automation rules
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="criteria">Advanced Criteria</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
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
                    placeholder="Describe this segment and its purpose"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Tags</Label>
                  <Input
                    placeholder="Add tags (comma separated)"
                    className="bg-white/10 border-primary/30 text-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          const newTags = value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                          setSegmentForm({
                            ...segmentForm,
                            tags: [...new Set([...segmentForm.tags, ...newTags])],
                          })
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {segmentForm.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-primary/20 text-primary border-primary/30 cursor-pointer"
                        onClick={() => {
                          setSegmentForm({
                            ...segmentForm,
                            tags: segmentForm.tags.filter((_, i) => i !== index),
                          })
                        }}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="criteria" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Advanced Criteria</Label>
                  <Button
                    onClick={addAdvancedCriteria}
                    size="sm"
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criteria
                  </Button>
                </div>

                {segmentForm.criteria.map((criteria, index) => (
                  <div key={criteria.id} className="p-4 rounded-lg border border-primary/20 bg-black/20">
                    <div className="grid grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Field</Label>
                        <Select
                          value={criteria.field}
                          onValueChange={(value) => {
                            const updatedCriteria = [...segmentForm.criteria]
                            updatedCriteria[index] = { ...updatedCriteria[index], field: value }
                            setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
                          }}
                        >
                          <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-primary/30 max-h-60">
                            {advancedCriteriaFields.map((category) => (
                              <div key={category.category}>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                                  {category.category}
                                </div>
                                {category.fields.map((field) => (
                                  <SelectItem key={field.key} value={field.key}>
                                    <div>
                                      <div className="font-medium">{field.label}</div>
                                      {field.description && (
                                        <div className="text-xs text-gray-400">{field.description}</div>
                                      )}
                                    </div>
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
                          onValueChange={(value) => {
                            const updatedCriteria = [...segmentForm.criteria]
                            updatedCriteria[index] = { ...updatedCriteria[index], operator: value }
                            setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
                          }}
                        >
                          <SelectTrigger className="bg-white/10 border-primary/30 text-white">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-primary/30">
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Value</Label>
                        <Input
                          value={criteria.value}
                          onChange={(e) => {
                            const updatedCriteria = [...segmentForm.criteria]
                            updatedCriteria[index] = { ...updatedCriteria[index], value: e.target.value }
                            setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
                          }}
                          className="bg-white/10 border-primary/30 text-white"
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Weight</Label>
                        <Slider
                          value={[criteria.weight]}
                          onValueChange={(value) => {
                            const updatedCriteria = [...segmentForm.criteria]
                            updatedCriteria[index] = { ...updatedCriteria[index], weight: value[0] }
                            setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
                          }}
                          max={1}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-400">{criteria.weight.toFixed(1)}</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Action</Label>
                        <Button
                          onClick={() => {
                            const updatedCriteria = segmentForm.criteria.filter((_, i) => i !== index)
                            setSegmentForm({ ...segmentForm, criteria: updatedCriteria })
                          }}
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
                    <p className="text-gray-500 text-sm">Click "Add Criteria" to define intelligent segment rules</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Automation rules coming soon</p>
                  <p className="text-gray-500 text-sm">
                    Set up automated actions when users enter or exit this segment
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="text-white font-medium mb-4">Segment Preview</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-gray-300 font-medium mb-2">Configuration</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Name:</span>{" "}
                          <span className="text-white">{segmentForm.name || "Untitled Segment"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>{" "}
                          <span className="text-white">{segmentForm.isActive ? "Active" : "Inactive"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Criteria:</span>{" "}
                          <span className="text-white">{segmentForm.criteria.length} rules</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Tags:</span>{" "}
                          <span className="text-white">{segmentForm.tags.join(", ") || "None"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-gray-300 font-medium mb-2">Estimated Impact</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Est. Users:</span>{" "}
                          <span className="text-white">{Math.floor(Math.random() * 5000) + 100}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Confidence:</span>{" "}
                          <span className="text-white">{(Math.random() * 30 + 70).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Complexity:</span>{" "}
                          <span className="text-white">
                            {segmentForm.criteria.length > 3
                              ? "High"
                              : segmentForm.criteria.length > 1
                                ? "Medium"
                                : "Low"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateSegmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSegment} className="bg-primary hover:bg-primary/80">
                Create Intelligent Segment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Insights Dialog */}
        <Dialog open={isAIInsightsOpen} onOpenChange={setIsAIInsightsOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI-Generated Insights
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Machine learning insights and recommendations for your user segments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generateAIInsights().map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">{insight}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {(Math.random() * 20 + 80).toFixed(1)}% confidence
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">High impact</Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsAIInsightsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Advanced Filters Dialog */}
        <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Advanced Filters
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Fine-tune your segment view with advanced filtering options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Engagement Score Range</Label>
                  <Slider
                    value={advancedFilters.engagementRange}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        engagementRange: value as [number, number],
                      })
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{advancedFilters.engagementRange[0]}</span>
                    <span>{advancedFilters.engagementRange[1]}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Revenue Range ($)</Label>
                  <Slider
                    value={advancedFilters.revenueRange}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        revenueRange: value as [number, number],
                      })
                    }
                    max={10000}
                    min={0}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>${advancedFilters.revenueRange[0]}</span>
                    <span>${advancedFilters.revenueRange[1]}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Churn Risk Range (%)</Label>
                  <Slider
                    value={advancedFilters.churnRiskRange}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        churnRiskRange: value as [number, number],
                      })
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{advancedFilters.churnRiskRange[0]}%</span>
                    <span>{advancedFilters.churnRiskRange[1]}%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">User Count Range</Label>
                  <Slider
                    value={advancedFilters.userCountRange}
                    onValueChange={(value) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        userCountRange: value as [number, number],
                      })
                    }
                    max={50000}
                    min={0}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{advancedFilters.userCountRange[0].toLocaleString()}</span>
                    <span>{advancedFilters.userCountRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdvancedFilters({
                    engagementRange: [0, 100],
                    revenueRange: [0, 10000],
                    churnRiskRange: [0, 100],
                    userCountRange: [0, 50000],
                    tags: [],
                    createdDateRange: { start: "", end: "" },
                  })
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setIsAdvancedFiltersOpen(false)}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
