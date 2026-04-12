"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartContainer } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from "recharts"
import {
  Layout, Grid3x3, Palette, Settings, Plus, Trash2, Edit, Move, 
  MoreVertical, Save, RotateCcw, Download, Upload, Eye, EyeOff,
  Maximize, Minimize, Copy, Layers, Zap, Activity, DollarSign,
  Users, Target, TrendingUp, AlertTriangle, CheckCircle, BarChart3,
  PieChart as PieChartIcon, Calendar, Clock, Globe, Smartphone
} from "lucide-react"
import { toast } from "sonner"

interface Widget {
  id: string
  type: string
  title: string
  description: string
  size: "small" | "medium" | "large" | "wide"
  position: { x: number; y: number }
  isVisible: boolean
  config: Record<string, any>
  data?: any
}

interface DashboardLayout {
  id: string
  name: string
  description: string
  isDefault: boolean
  columns: number
  gap: number
  widgets: Widget[]
  theme: string
  background: string
}

interface UserPreferences {
  defaultLayout: string
  theme: "light" | "dark" | "system"
  animations: boolean
  autoRefresh: boolean
  refreshInterval: number
  notifications: boolean
  compactMode: boolean
}

const WIDGET_TYPES = [
  {
    id: "metric-card",
    name: "Metric Card",
    description: "Display key metrics with trend indicators",
    icon: Target,
    defaultSize: "small" as const,
    configurable: ["title", "metric", "color", "trend"]
  },
  {
    id: "chart-line",
    name: "Line Chart",
    description: "Time series data visualization",
    icon: Activity,
    defaultSize: "medium" as const,
    configurable: ["title", "dataSource", "timeRange", "color"]
  },
  {
    id: "chart-bar",
    name: "Bar Chart", 
    description: "Category comparison charts",
    icon: BarChart3,
    defaultSize: "medium" as const,
    configurable: ["title", "dataSource", "orientation"]
  },
  {
    id: "chart-pie",
    name: "Pie Chart",
    description: "Proportion and percentage displays",
    icon: PieChartIcon,
    defaultSize: "medium" as const,
    configurable: ["title", "dataSource", "showLegend"]
  },
  {
    id: "user-stats",
    name: "User Statistics",
    description: "Active users and engagement metrics",
    icon: Users,
    defaultSize: "large" as const,
    configurable: ["timeRange", "breakdown"]
  },
  {
    id: "financial-overview",
    name: "Financial Overview",
    description: "Revenue and financial health metrics",
    icon: DollarSign,
    defaultSize: "wide" as const,
    configurable: ["currency", "timeRange", "includeForecasts"]
  },
  {
    id: "alert-center",
    name: "Alert Center", 
    description: "System alerts and notifications",
    icon: AlertTriangle,
    defaultSize: "medium" as const,
    configurable: ["severity", "autoRefresh", "maxItems"]
  },
  {
    id: "quick-actions",
    name: "Quick Actions",
    description: "Frequently used action buttons",
    icon: Zap,
    defaultSize: "small" as const,
    configurable: ["actions", "layout"]
  }
]

const MOCK_LAYOUTS: DashboardLayout[] = [
  {
    id: "default",
    name: "Executive Overview",
    description: "High-level metrics and KPIs for executives",
    isDefault: true,
    columns: 4,
    gap: 24,
    theme: "professional",
    background: "gradient",
    widgets: [
      {
        id: "w1",
        type: "metric-card",
        title: "Total Revenue",
        description: "Monthly recurring revenue",
        size: "small",
        position: { x: 0, y: 0 },
        isVisible: true,
        config: { metric: "revenue", color: "blue", showTrend: true }
      },
      {
        id: "w2", 
        type: "metric-card",
        title: "Active Users",
        description: "Currently active users",
        size: "small",
        position: { x: 1, y: 0 },
        isVisible: true,
        config: { metric: "activeUsers", color: "green", showTrend: true }
      },
      {
        id: "w3",
        type: "chart-line",
        title: "Growth Trends",
        description: "Revenue and user growth over time",
        size: "wide",
        position: { x: 0, y: 1 },
        isVisible: true,
        config: { timeRange: "30d", showRevenue: true, showUsers: true }
      }
    ]
  },
  {
    id: "analyst",
    name: "Data Analyst View",
    description: "Detailed analytics and data visualization",
    isDefault: false,
    columns: 3,
    gap: 16,
    theme: "analytical",
    background: "dark",
    widgets: [
      {
        id: "a1",
        type: "chart-bar",
        title: "User Segmentation",
        description: "User breakdown by category",
        size: "medium",
        position: { x: 0, y: 0 },
        isVisible: true,
        config: { dataSource: "userSegments", orientation: "vertical" }
      },
      {
        id: "a2",
        type: "chart-pie",
        title: "Traffic Sources",
        description: "Where users are coming from",
        size: "medium",
        position: { x: 1, y: 0 },
        isVisible: true,
        config: { dataSource: "trafficSources", showLegend: true }
      }
    ]
  },
  {
    id: "operations",
    name: "Operations Dashboard",
    description: "System health and operational metrics",
    isDefault: false,
    columns: 4,
    gap: 20,
    theme: "operational",
    background: "solid",
    widgets: [
      {
        id: "o1",
        type: "alert-center",
        title: "System Alerts",
        description: "Critical system notifications",
        size: "large",
        position: { x: 0, y: 0 },
        isVisible: true,
        config: { severity: "all", maxItems: 10, autoRefresh: true }
      }
    ]
  }
]

const THEMES = [
  { id: "professional", name: "Professional", colors: ["#3B82F6", "#10B981", "#F59E0B"] },
  { id: "analytical", name: "Analytical", colors: ["#6366F1", "#8B5CF6", "#EC4899"] },
  { id: "operational", name: "Operational", colors: ["#EF4444", "#F97316", "#84CC16"] },
  { id: "minimal", name: "Minimal", colors: ["#6B7280", "#9CA3AF", "#D1D5DB"] }
]

export default function DashboardPersonalization() {
  const [activeTab, setActiveTab] = useState("layouts")
  const [selectedLayout, setSelectedLayout] = useState<DashboardLayout>(MOCK_LAYOUTS[0])
  const [isEditMode, setIsEditMode] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null)
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    defaultLayout: "default",
    theme: "dark",
    animations: true,
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    compactMode: false
  })

  const gridRef = useRef<HTMLDivElement>(null)

  // Mock data for widgets
  const mockData = {
    revenue: { value: 485620, trend: 12.5, change: "up" },
    activeUsers: { value: 8934, trend: 5.2, change: "up" },
    lineChartData: [
      { name: "Jan", revenue: 420000, users: 8200 },
      { name: "Feb", revenue: 485000, users: 8900 },
      { name: "Mar", revenue: 520000, users: 9400 }
    ],
    pieChartData: [
      { name: "Direct", value: 45 },
      { name: "Search", value: 30 },
      { name: "Social", value: 15 },
      { name: "Referral", value: 10 }
    ],
    alerts: [
      { id: 1, type: "warning", message: "High CPU usage detected", time: "5 min ago" },
      { id: 2, type: "info", message: "Backup completed successfully", time: "1 hour ago" }
    ]
  }

  const handleLayoutSelect = (layout: DashboardLayout) => {
    setSelectedLayout(layout)
    setIsEditMode(false)
    toast.success(`Switched to ${layout.name} layout`)
  }

  const handleAddWidget = (widgetType: any) => {
    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type: widgetType.id,
      title: widgetType.name,
      description: widgetType.description,
      size: widgetType.defaultSize,
      position: { x: 0, y: selectedLayout.widgets.length },
      isVisible: true,
      config: {}
    }

    setSelectedLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }))
    
    toast.success(`Added ${widgetType.name} widget`)
  }

  const handleWidgetEdit = (widget: Widget) => {
    setSelectedWidget(widget)
    setWidgetDialogOpen(true)
  }

  const handleWidgetDelete = (widgetId: string) => {
    setSelectedLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }))
    toast.success("Widget removed")
  }

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
      )
    }))
  }

  const handleSaveLayout = () => {
    // In real app, save to backend
    toast.success("Layout saved successfully!")
    setIsEditMode(false)
  }

  const handleResetLayout = () => {
    const originalLayout = MOCK_LAYOUTS.find(l => l.id === selectedLayout.id)
    if (originalLayout) {
      setSelectedLayout({ ...originalLayout })
      toast.success("Layout reset to defaults")
    }
  }

  const renderWidget = (widget: Widget) => {
    if (!widget.isVisible && !isEditMode) return null

    const widgetClass = `
      ${widget.size === 'small' ? 'col-span-1' : ''}
      ${widget.size === 'medium' ? 'col-span-2' : ''}
      ${widget.size === 'large' ? 'col-span-3' : ''}
      ${widget.size === 'wide' ? 'col-span-full' : ''}
      ${!widget.isVisible ? 'opacity-50' : ''}
      ${isEditMode ? 'cursor-move hover:ring-2 hover:ring-blue-400' : ''}
      transition-all duration-200
    `

    return (
      <Card key={widget.id} className={`bg-gray-900/50 border-gray-700 ${widgetClass}`}>
        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleWidgetToggle(widget.id)}
              className="h-6 w-6 p-1"
            >
              {widget.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-1">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={() => handleWidgetEdit(widget)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleWidgetDelete(widget.id)}>
                  <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">{widget.title}</CardTitle>
          {widget.description && (
            <CardDescription className="text-xs">{widget.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          {widget.type === 'metric-card' && (
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {widget.id === 'w1' ? `$${mockData.revenue.value.toLocaleString()}` :
                 widget.id === 'w2' ? mockData.activeUsers.value.toLocaleString() : '1,234'}
              </div>
              <div className="flex items-center justify-center text-green-400 text-sm">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{widget.id === 'w1' ? mockData.revenue.trend : 
                   widget.id === 'w2' ? mockData.activeUsers.trend : 8.2}%
              </div>
            </div>
          )}
          
          {widget.type === 'chart-line' && (
            <div className="h-32">
              <ChartContainer config={{}} className="h-full">
                <LineChart data={mockData.lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </div>
          )}
          
          {widget.type === 'chart-pie' && (
            <div className="h-32">
              <ChartContainer config={{}} className="h-full">
                <PieChart>
                  <Pie
                    data={mockData.pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    dataKey="value"
                  >
                    {mockData.pieChartData.map((entry, index) => (
                      <Cell key={index} fill={`hsl(${index * 90}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartContainer>
            </div>
          )}

          {widget.type === 'alert-center' && (
            <div className="space-y-2">
              {mockData.alerts.map(alert => (
                <div key={alert.id} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1">
                    <div className="text-white text-sm">{alert.message}</div>
                    <div className="text-gray-400 text-xs">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Layout className="w-8 h-8 mr-3 text-blue-400" />
            Dashboard Personalization
          </h1>
          <p className="text-gray-400 mt-1">
            Customize your dashboard with drag-and-drop widgets and personal layouts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="border-gray-600 text-gray-400"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="border-gray-600 text-gray-400"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditMode ? "Exit Edit" : "Edit Mode"}
          </Button>
          {isEditMode && (
            <>
              <Button onClick={handleSaveLayout} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleResetLayout} className="border-gray-600 text-gray-400">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {!previewMode ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="layouts" 
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              Layouts
            </TabsTrigger>
            <TabsTrigger 
              value="widgets" 
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              Widgets
            </TabsTrigger>
            <TabsTrigger 
              value="themes" 
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              Themes
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_LAYOUTS.map((layout) => (
                <Card 
                  key={layout.id} 
                  className={`bg-gray-900/50 border-gray-700 cursor-pointer transition-all hover:border-blue-400 ${
                    selectedLayout.id === layout.id ? 'border-blue-400 ring-1 ring-blue-400' : ''
                  }`}
                  onClick={() => handleLayoutSelect(layout)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{layout.name}</CardTitle>
                      {layout.isDefault && (
                        <Badge className="bg-blue-500/20 text-blue-400">Default</Badge>
                      )}
                    </div>
                    <CardDescription>{layout.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Columns:</span>
                        <span className="text-white">{layout.columns}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Widgets:</span>
                        <span className="text-white">{layout.widgets.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Theme:</span>
                        <span className="text-white capitalize">{layout.theme}</span>
                      </div>
                    </div>
                    
                    {/* Mini preview */}
                    <div className="mt-4 p-2 bg-gray-800/50 rounded">
                      <div className={`grid grid-cols-${Math.min(layout.columns, 4)} gap-1`}>
                        {layout.widgets.slice(0, 8).map((widget, index) => (
                          <div
                            key={index}
                            className={`
                              bg-blue-500/20 rounded h-4
                              ${widget.size === 'small' ? 'col-span-1' : ''}
                              ${widget.size === 'medium' ? 'col-span-2' : ''}
                              ${widget.size === 'large' ? 'col-span-3' : ''}
                              ${widget.size === 'wide' ? 'col-span-full' : ''}
                            `}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Available Widgets</CardTitle>
                <CardDescription>
                  Add new widgets to your dashboard by clicking on them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {WIDGET_TYPES.map((widgetType) => (
                    <Card 
                      key={widgetType.id}
                      className="bg-gray-800/50 border-gray-600 cursor-pointer transition-all hover:border-blue-400 hover:bg-gray-800/70"
                      onClick={() => handleAddWidget(widgetType)}
                    >
                      <CardContent className="p-4 text-center">
                        <widgetType.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <div className="text-white font-medium text-sm">{widgetType.name}</div>
                        <div className="text-gray-400 text-xs mt-1">{widgetType.description}</div>
                        <Badge className="mt-2 bg-blue-500/20 text-blue-400 text-xs">
                          {widgetType.defaultSize}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {THEMES.map((theme) => (
                <Card 
                  key={theme.id}
                  className={`bg-gray-900/50 border-gray-700 cursor-pointer transition-all hover:border-blue-400 ${
                    selectedLayout.theme === theme.id ? 'border-blue-400 ring-1 ring-blue-400' : ''
                  }`}
                  onClick={() => setSelectedLayout(prev => ({ ...prev, theme: theme.id }))}
                >
                  <CardContent className="p-4">
                    <div className="text-white font-medium mb-2">{theme.name}</div>
                    <div className="flex space-x-2 mb-3">
                      {theme.colors.map((color, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {selectedLayout.theme === theme.id && (
                      <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Preferences</CardTitle>
                <CardDescription>
                  Customize your dashboard behavior and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Display Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Theme</Label>
                      <Select value={userPreferences.theme} onValueChange={(value: any) => 
                        setUserPreferences(prev => ({ ...prev, theme: value }))
                      }>
                        <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Animations</Label>
                      <Switch 
                        checked={userPreferences.animations}
                        onCheckedChange={(checked) => 
                          setUserPreferences(prev => ({ ...prev, animations: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Compact Mode</Label>
                      <Switch 
                        checked={userPreferences.compactMode}
                        onCheckedChange={(checked) => 
                          setUserPreferences(prev => ({ ...prev, compactMode: checked }))
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Data & Updates</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Auto Refresh</Label>
                      <Switch 
                        checked={userPreferences.autoRefresh}
                        onCheckedChange={(checked) => 
                          setUserPreferences(prev => ({ ...prev, autoRefresh: checked }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Refresh Interval (seconds)</Label>
                      <Slider
                        value={[userPreferences.refreshInterval]}
                        onValueChange={([value]) => 
                          setUserPreferences(prev => ({ ...prev, refreshInterval: value }))
                        }
                        min={5}
                        max={300}
                        step={5}
                        className="w-full"
                        disabled={!userPreferences.autoRefresh}
                      />
                      <div className="text-gray-400 text-sm text-center">
                        {userPreferences.refreshInterval} seconds
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Notifications</Label>
                      <Switch 
                        checked={userPreferences.notifications}
                        onCheckedChange={(checked) => 
                          setUserPreferences(prev => ({ ...prev, notifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <div className="flex items-center space-x-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-400">
                      <Download className="w-4 h-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-400">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        // Preview Mode - Full Dashboard View
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{selectedLayout.name}</h2>
            <Badge className="bg-blue-500/20 text-blue-400">Preview Mode</Badge>
          </div>
          
          <div 
            ref={gridRef}
            className={`grid gap-${selectedLayout.gap / 4} transition-all duration-300`}
            style={{ 
              gridTemplateColumns: `repeat(${selectedLayout.columns}, minmax(0, 1fr))`,
              gap: `${selectedLayout.gap}px`
            }}
          >
            {selectedLayout.widgets.map(renderWidget)}
          </div>
        </div>
      )}

      {/* Regular Dashboard View (when not in preview) */}
      {!previewMode && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{selectedLayout.name}</CardTitle>
                <CardDescription>{selectedLayout.description}</CardDescription>
              </div>
              {isEditMode && (
                <Button
                  onClick={() => setWidgetDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={gridRef}
              className={`grid gap-4 transition-all duration-300 ${
                selectedLayout.columns === 2 ? 'grid-cols-2' :
                selectedLayout.columns === 3 ? 'grid-cols-3' : 
                selectedLayout.columns === 4 ? 'grid-cols-4' : 'grid-cols-1'
              }`}
            >
              {selectedLayout.widgets.map(renderWidget)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget Configuration Dialog */}
      <Dialog open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedWidget ? 'Edit Widget' : 'Add Widget'}
            </DialogTitle>
            <DialogDescription>
              Configure the widget settings and appearance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Widget Title</Label>
              <Input 
                defaultValue={selectedWidget?.title}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Enter widget title"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Size</Label>
              <Select defaultValue={selectedWidget?.size || "medium"}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea 
                defaultValue={selectedWidget?.description}
                className="bg-gray-800 border-gray-600 text-white mt-1"
                placeholder="Widget description"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setWidgetDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setWidgetDialogOpen(false)
                toast.success("Widget updated successfully!")
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
