"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import {
  Plus, Play, Pause, Square, Archive, Edit, Trash2, Eye, TrendingUp, TrendingDown,
  Users, Target, Zap, Award, AlertTriangle, CheckCircle, Clock, BarChart3,
  Filter, Download, RefreshCw, Settings, FlaskConical, Lightbulb
} from "lucide-react"
import { toast } from "sonner"

interface ABTest {
  id: string
  name: string
  description: string
  status: "draft" | "running" | "paused" | "completed" | "archived"
  type: "page" | "feature" | "email" | "pricing" | "content"
  startDate: string
  endDate?: string
  trafficSplit: number
  significance: number
  confidenceLevel: number
  variants: ABVariant[]
  goals: ABGoal[]
  results?: ABResults
  created: string
  author: string
  tags: string[]
}

interface ABVariant {
  id: string
  name: string
  description: string
  trafficPercentage: number
  isControl: boolean
  conversions: number
  impressions: number
  conversionRate: number
  config?: Record<string, any>
}

interface ABGoal {
  id: string
  name: string
  type: "conversion" | "revenue" | "engagement" | "retention"
  metric: string
  target?: number
  weight: number
}

interface ABResults {
  winner?: string
  confidence: number
  pValue: number
  significance: boolean
  improvement: number
  expectedRevenue?: number
  variantResults: VariantResult[]
}

interface VariantResult {
  variantId: string
  conversions: number
  impressions: number
  conversionRate: number
  revenue?: number
  confidence: number
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Form state for creating new tests
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    type: "",
    trafficSplit: 50,
    confidenceLevel: 95,
    variants: [
      { name: "Control", description: "Original version", trafficPercentage: 50, isControl: true },
      { name: "Variant A", description: "Test version", trafficPercentage: 50, isControl: false }
    ],
    goals: [
      { name: "Primary Conversion", type: "conversion", metric: "signup_rate", weight: 100 }
    ]
  })

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockTests: ABTest[] = [
        {
          id: "1",
          name: "Landing Page Hero Section",
          description: "Testing new hero section with video vs static image",
          status: "running",
          type: "page",
          startDate: "2024-01-15",
          trafficSplit: 50,
          significance: 85,
          confidenceLevel: 95,
          variants: [
            {
              id: "control",
              name: "Control (Static Image)",
              description: "Current hero with static image",
              trafficPercentage: 50,
              isControl: true,
              conversions: 284,
              impressions: 5240,
              conversionRate: 5.42
            },
            {
              id: "variant-a",
              name: "Video Hero",
              description: "Hero section with background video",
              trafficPercentage: 50,
              isControl: false,
              conversions: 357,
              impressions: 5182,
              conversionRate: 6.89
            }
          ],
          goals: [
            {
              id: "goal-1",
              name: "Sign Up Conversion",
              type: "conversion",
              metric: "signup_rate",
              weight: 100
            }
          ],
          results: {
            winner: "variant-a",
            confidence: 89,
            pValue: 0.02,
            significance: true,
            improvement: 27.1,
            variantResults: [
              { variantId: "control", conversions: 284, impressions: 5240, conversionRate: 5.42, confidence: 95 },
              { variantId: "variant-a", conversions: 357, impressions: 5182, conversionRate: 6.89, confidence: 95 }
            ]
          },
          created: "2024-01-15",
          author: "Marketing Team",
          tags: ["landing-page", "conversion", "video"]
        },
        {
          id: "2",
          name: "Pricing Page Strategy",
          description: "Testing $97 vs $99 psychological pricing",
          status: "completed",
          type: "pricing",
          startDate: "2024-01-10",
          endDate: "2024-01-20",
          trafficSplit: 50,
          significance: 95,
          confidenceLevel: 95,
          variants: [
            {
              id: "control",
              name: "Control ($99)",
              description: "Original pricing at $99",
              trafficPercentage: 50,
              isControl: true,
              conversions: 156,
              impressions: 2890,
              conversionRate: 5.40
            },
            {
              id: "variant-a",
              name: "Variant ($97)",
              description: "Psychological pricing at $97",
              trafficPercentage: 50,
              isControl: false,
              conversions: 189,
              impressions: 2845,
              conversionRate: 6.64
            }
          ],
          goals: [
            {
              id: "goal-1",
              name: "Purchase Conversion",
              type: "conversion",
              metric: "purchase_rate",
              weight: 100
            }
          ],
          results: {
            winner: "variant-a",
            confidence: 95,
            pValue: 0.01,
            significance: true,
            improvement: 22.9,
            expectedRevenue: 15400,
            variantResults: [
              { variantId: "control", conversions: 156, impressions: 2890, conversionRate: 5.40, revenue: 15444, confidence: 95 },
              { variantId: "variant-a", conversions: 189, impressions: 2845, conversionRate: 6.64, revenue: 18333, confidence: 95 }
            ]
          },
          created: "2024-01-10",
          author: "Revenue Team",
          tags: ["pricing", "psychology", "revenue"]
        },
        {
          id: "3",
          name: "Email Subject Line",
          description: "Testing personalized vs generic subject lines",
          status: "draft",
          type: "email",
          startDate: "2024-01-25",
          trafficSplit: 50,
          significance: 0,
          confidenceLevel: 95,
          variants: [
            {
              id: "control",
              name: "Generic Subject",
              description: "Weekly Trading Update",
              trafficPercentage: 50,
              isControl: true,
              conversions: 0,
              impressions: 0,
              conversionRate: 0
            },
            {
              id: "variant-a",
              name: "Personalized Subject",
              description: "John, Your Trading Performance This Week",
              trafficPercentage: 50,
              isControl: false,
              conversions: 0,
              impressions: 0,
              conversionRate: 0
            }
          ],
          goals: [
            {
              id: "goal-1",
              name: "Email Open Rate",
              type: "engagement",
              metric: "open_rate",
              weight: 60
            },
            {
              id: "goal-2",
              name: "Click Through Rate",
              type: "engagement",
              metric: "ctr",
              weight: 40
            }
          ],
          created: "2024-01-22",
          author: "Content Team",
          tags: ["email", "personalization", "engagement"]
        }
      ]

      setTests(mockTests)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading A/B tests:", error)
      toast.error("Failed to load A/B tests")
      setIsLoading(false)
    }
  }

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || test.status === filterStatus
      const matchesType = filterType === "all" || test.type === filterType
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [tests, searchTerm, filterStatus, filterType])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "draft": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "archived": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Play className="w-4 h-4" />
      case "completed": return <CheckCircle className="w-4 h-4" />
      case "paused": return <Pause className="w-4 h-4" />
      case "draft": return <Edit className="w-4 h-4" />
      case "archived": return <Archive className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleCreateTest = async () => {
    try {
      const test: ABTest = {
        id: Date.now().toString(),
        ...newTest,
        status: "draft",
        significance: 0,
        variants: newTest.variants.map((v, i) => ({
          ...v,
          id: `variant-${i}`,
          conversions: 0,
          impressions: 0,
          conversionRate: 0
        })),
        goals: newTest.goals.map((g, i) => ({
          ...g,
          id: `goal-${i}`
        })),
        created: new Date().toISOString(),
        author: "Admin"
      } as ABTest

      setTests(prev => [test, ...prev])
      setIsCreateDialogOpen(false)
      toast.success("A/B test created successfully!")
      
      // Reset form
      setNewTest({
        name: "",
        description: "",
        type: "",
        trafficSplit: 50,
        confidenceLevel: 95,
        variants: [
          { name: "Control", description: "Original version", trafficPercentage: 50, isControl: true },
          { name: "Variant A", description: "Test version", trafficPercentage: 50, isControl: false }
        ],
        goals: [
          { name: "Primary Conversion", type: "conversion", metric: "signup_rate", weight: 100 }
        ]
      })
    } catch (error) {
      toast.error("Failed to create A/B test")
    }
  }

  const handleStartTest = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: "running" as const, startDate: new Date().toISOString() }
        : test
    ))
    toast.success("A/B test started!")
  }

  const handleSquareTest = (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: "completed" as const, endDate: new Date().toISOString() }
        : test
    ))
    toast.success("A/B test stopped and completed!")
  }

  const overallStats = useMemo(() => {
    const totalTests = tests.length
    const runningTests = tests.filter(t => t.status === "running").length
    const completedTests = tests.filter(t => t.status === "completed").length
    const significantResults = tests.filter(t => t.results?.significance).length
    const avgImprovement = tests
      .filter(t => t.results?.improvement)
      .reduce((sum, t) => sum + (t.results?.improvement || 0), 0) / 
      Math.max(1, tests.filter(t => t.results?.improvement).length)

    return {
      totalTests,
      runningTests,
      completedTests,
      significantResults,
      avgImprovement: Math.round(avgImprovement * 10) / 10
    }
  }, [tests])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading A/B testing dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FlaskConical className="w-8 h-8 mr-3 text-blue-400" />
            A/B Testing Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Optimize conversions with data-driven testing
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-white">{overallStats.totalTests}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Running</p>
                <p className="text-2xl font-bold text-white">{overallStats.runningTests}</p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{overallStats.completedTests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Significant</p>
                <p className="text-2xl font-bold text-white">{overallStats.significantResults}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Improvement</p>
                <p className="text-2xl font-bold text-white">{overallStats.avgImprovement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900/50 border-gray-700 text-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="pricing">Pricing</SelectItem>
            <SelectItem value="content">Content</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tests Table */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">A/B Tests</CardTitle>
          <CardDescription>
            Manage and monitor your conversion optimization experiments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Test Name</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Traffic Split</TableHead>
                <TableHead className="text-gray-300">Confidence</TableHead>
                <TableHead className="text-gray-300">Improvement</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((test) => (
                <TableRow key={test.id} className="border-gray-700">
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{test.name}</p>
                      <p className="text-gray-400 text-sm">{test.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(test.status)} flex items-center w-fit`}>
                      {getStatusIcon(test.status)}
                      <span className="ml-1 capitalize">{test.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                      {test.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">{test.trafficSplit}% / {100 - test.trafficSplit}%</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">
                      {test.results?.confidence ? `${test.results.confidence}%` : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${test.results?.improvement && test.results.improvement > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {test.results?.improvement ? `+${test.results.improvement}%` : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {test.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartTest(test.id)}
                          className="border-green-600 text-green-400 hover:bg-green-600/10"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      {test.status === "running" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSquareTest(test.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <Square className="w-3 h-3" />
                        </Button>
                      )}
                      {test.results && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTest(test)
                            setIsResultsDialogOpen(true)
                          }}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Test Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New A/B Test</DialogTitle>
            <DialogDescription>
              Set up a new conversion optimization experiment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Test Name</Label>
                <Input
                  id="name"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Landing Page Hero Test"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-gray-300">Test Type</Label>
                <Select value={newTest.type} onValueChange={(value) => setNewTest(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={newTest.description}
                onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're testing and your hypothesis"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trafficSplit" className="text-gray-300">Traffic Split (%)</Label>
                <Input
                  id="trafficSplit"
                  type="number"
                  min="10"
                  max="90"
                  value={newTest.trafficSplit}
                  onChange={(e) => setNewTest(prev => ({ ...prev, trafficSplit: parseInt(e.target.value) }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="confidence" className="text-gray-300">Confidence Level (%)</Label>
                <Select 
                  value={newTest.confidenceLevel.toString()} 
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, confidenceLevel: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedTest?.name} - Results</DialogTitle>
            <DialogDescription>
              Statistical analysis and performance comparison
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest?.results && (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${selectedTest.results.significance ? 'text-green-400' : 'text-gray-400'}`}>
                        {selectedTest.results.significance ? '✓' : '✗'}
                      </div>
                      <p className="text-gray-400 text-sm">Statistical Significance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{selectedTest.results.confidence}%</div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">+{selectedTest.results.improvement}%</div>
                      <p className="text-gray-400 text-sm">Improvement</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedTest.results.pValue.toFixed(3)}</div>
                      <p className="text-gray-400 text-sm">P-Value</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Variant Comparison */}
              <div>
                <h4 className="text-white font-semibold mb-4">Variant Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTest.variants.map((variant, index) => {
                    const result = selectedTest.results?.variantResults.find(r => r.variantId === variant.id)
                    const isWinner = selectedTest.results?.winner === variant.id
                    
                    return (
                      <Card key={variant.id} className={`bg-gray-800/50 border-gray-600 ${isWinner ? 'ring-2 ring-green-500' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-white font-medium">{variant.name}</h5>
                            {isWinner && <Badge className="bg-green-500/20 text-green-400">Winner</Badge>}
                            {variant.isControl && <Badge className="bg-blue-500/20 text-blue-400">Control</Badge>}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Conversions:</span>
                              <span className="text-white">{result?.conversions.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Impressions:</span>
                              <span className="text-white">{result?.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Conversion Rate:</span>
                              <span className="text-white">{result?.conversionRate.toFixed(2)}%</span>
                            </div>
                            {result?.revenue && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Revenue:</span>
                                <span className="text-white">${result.revenue.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResultsDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
