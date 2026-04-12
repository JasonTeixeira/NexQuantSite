"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Layout,
  Palette,
  Grid,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Calendar,
  Bell,
  MessageSquare,
  ImageIcon,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react"
import { toast } from "sonner"

interface Widget {
  id: string
  type: string
  title: string
  size: "small" | "medium" | "large" | "full"
  position: { x: number; y: number }
  visible: boolean
  config: Record<string, any>
  icon: any
  category: string
}

interface DashboardLayout {
  id: string
  name: string
  description: string
  widgets: Widget[]
  theme: string
  gridSize: number
  isDefault: boolean
  createdAt: string
  lastModified: string
}

const widgetTypes = [
  {
    category: "Analytics",
    widgets: [
      { type: "revenue-chart", title: "Revenue Chart", icon: DollarSign, defaultSize: "large" },
      { type: "user-growth", title: "User Growth", icon: Users, defaultSize: "medium" },
      { type: "conversion-funnel", title: "Conversion Funnel", icon: TrendingUp, defaultSize: "large" },
      { type: "performance-metrics", title: "Performance Metrics", icon: BarChart3, defaultSize: "medium" },
    ],
  },
  {
    category: "System",
    widgets: [
      { type: "system-health", title: "System Health", icon: Server, defaultSize: "medium" },
      { type: "cpu-usage", title: "CPU Usage", icon: Cpu, defaultSize: "small" },
      { type: "memory-usage", title: "Memory Usage", icon: HardDrive, defaultSize: "small" },
      { type: "network-status", title: "Network Status", icon: Wifi, defaultSize: "small" },
    ],
  },
  {
    category: "Content",
    widgets: [
      { type: "recent-posts", title: "Recent Posts", icon: ImageIcon, defaultSize: "medium" },
      { type: "media-library", title: "Media Library", icon: ImageIcon, defaultSize: "medium" },
      { type: "content-calendar", title: "Content Calendar", icon: Calendar, defaultSize: "large" },
    ],
  },
  {
    category: "Communication",
    widgets: [
      { type: "notifications", title: "Notifications", icon: Bell, defaultSize: "small" },
      { type: "messages", title: "Messages", icon: MessageSquare, defaultSize: "medium" },
      { type: "activity-feed", title: "Activity Feed", icon: Activity, defaultSize: "medium" },
    ],
  },
]

const themes = [
  { id: "dark", name: "Dark", primary: "#000000", secondary: "#1a1a1a", accent: "#00ff44" },
  { id: "light", name: "Light", primary: "#ffffff", secondary: "#f5f5f5", accent: "#0066cc" },
  { id: "purple", name: "Purple", primary: "#1a0d2e", secondary: "#16213e", accent: "#8b5cf6" },
  { id: "blue", name: "Ocean Blue", primary: "#0f172a", secondary: "#1e293b", accent: "#3b82f6" },
  { id: "green", name: "Forest", primary: "#0f1419", secondary: "#1a2332", accent: "#10b981" },
]

export default function DashboardCustomizationClient() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([])
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [isCreateLayoutOpen, setIsCreateLayoutOpen] = useState(false)
  const [newLayoutName, setNewLayoutName] = useState("")
  const [newLayoutDescription, setNewLayoutDescription] = useState("")
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null)

  useEffect(() => {
    loadLayouts()
  }, [])

  const loadLayouts = () => {
    // Mock data - replace with real API
    const mockLayouts: DashboardLayout[] = [
      {
        id: "1",
        name: "Executive Dashboard",
        description: "High-level overview for executives",
        theme: "dark",
        gridSize: 12,
        isDefault: true,
        createdAt: "2024-01-15",
        lastModified: "2024-01-20",
        widgets: [
          {
            id: "w1",
            type: "revenue-chart",
            title: "Revenue Overview",
            size: "large",
            position: { x: 0, y: 0 },
            visible: true,
            config: { timeRange: "30d", showComparison: true },
            icon: DollarSign,
            category: "Analytics",
          },
          {
            id: "w2",
            type: "user-growth",
            title: "User Growth",
            size: "medium",
            position: { x: 8, y: 0 },
            visible: true,
            config: { metric: "active_users" },
            icon: Users,
            category: "Analytics",
          },
          {
            id: "w3",
            type: "system-health",
            title: "System Status",
            size: "medium",
            position: { x: 0, y: 4 },
            visible: true,
            config: { showDetails: true },
            icon: Server,
            category: "System",
          },
          {
            id: "w4",
            type: "notifications",
            title: "Recent Alerts",
            size: "small",
            position: { x: 8, y: 4 },
            visible: true,
            config: { limit: 5 },
            icon: Bell,
            category: "Communication",
          },
        ],
      },
      {
        id: "2",
        name: "Analytics Focus",
        description: "Detailed analytics and reporting",
        theme: "blue",
        gridSize: 12,
        isDefault: false,
        createdAt: "2024-01-18",
        lastModified: "2024-01-19",
        widgets: [
          {
            id: "w5",
            type: "conversion-funnel",
            title: "Conversion Analysis",
            size: "large",
            position: { x: 0, y: 0 },
            visible: true,
            config: { period: "7d" },
            icon: TrendingUp,
            category: "Analytics",
          },
          {
            id: "w6",
            type: "performance-metrics",
            title: "KPI Dashboard",
            size: "medium",
            position: { x: 8, y: 0 },
            visible: true,
            config: { metrics: ["cac", "ltv", "churn"] },
            icon: BarChart3,
            category: "Analytics",
          },
        ],
      },
    ]

    setLayouts(mockLayouts)
    setCurrentLayout(mockLayouts[0])
  }

  const createNewLayout = () => {
    if (!newLayoutName.trim()) return

    const newLayout: DashboardLayout = {
      id: Date.now().toString(),
      name: newLayoutName,
      description: newLayoutDescription,
      theme: "dark",
      gridSize: 12,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      widgets: [],
    }

    setLayouts([...layouts, newLayout])
    setCurrentLayout(newLayout)
    setNewLayoutName("")
    setNewLayoutDescription("")
    setIsCreateLayoutOpen(false)
    toast.success("New layout created successfully")
  }

  const addWidget = (widgetType: any) => {
    if (!currentLayout) return

    const newWidget: Widget = {
      id: `w${Date.now()}`,
      type: widgetType.type,
      title: widgetType.title,
      size: widgetType.defaultSize,
      position: { x: 0, y: 0 },
      visible: true,
      config: {},
      icon: widgetType.icon,
      category: widgetType.category || "General",
    }

    const updatedLayout = {
      ...currentLayout,
      widgets: [...currentLayout.widgets, newWidget],
      lastModified: new Date().toISOString().split("T")[0],
    }

    setCurrentLayout(updatedLayout)
    setLayouts(layouts.map((l) => (l.id === currentLayout.id ? updatedLayout : l)))
    setIsAddWidgetOpen(false)
    toast.success("Widget added successfully")
  }

  const removeWidget = (widgetId: string) => {
    if (!currentLayout) return

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.filter((w) => w.id !== widgetId),
      lastModified: new Date().toISOString().split("T")[0],
    }

    setCurrentLayout(updatedLayout)
    setLayouts(layouts.map((l) => (l.id === currentLayout.id ? updatedLayout : l)))
    toast.success("Widget removed successfully")
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    if (!currentLayout) return

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w)),
      lastModified: new Date().toISOString().split("T")[0],
    }

    setCurrentLayout(updatedLayout)
    setLayouts(layouts.map((l) => (l.id === currentLayout.id ? updatedLayout : l)))
  }

  const updateWidgetSize = (widgetId: string, newSize: Widget["size"]) => {
    if (!currentLayout) return

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.map((w) => (w.id === widgetId ? { ...w, size: newSize } : w)),
      lastModified: new Date().toISOString().split("T")[0],
    }

    setCurrentLayout(updatedLayout)
    setLayouts(layouts.map((l) => (l.id === currentLayout.id ? updatedLayout : l)))
  }

  const updateLayoutTheme = (themeId: string) => {
    if (!currentLayout) return

    const updatedLayout = {
      ...currentLayout,
      theme: themeId,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setCurrentLayout(updatedLayout)
    setLayouts(layouts.map((l) => (l.id === currentLayout.id ? updatedLayout : l)))
    toast.success("Theme updated successfully")
  }

  const saveLayout = () => {
    if (!currentLayout) return

    // Simulate API save
    toast.success("Layout saved successfully")
  }

  const resetLayout = () => {
    if (!currentLayout) return

    const originalLayout = layouts.find((l) => l.id === currentLayout.id)
    if (originalLayout) {
      setCurrentLayout({ ...originalLayout })
      toast.success("Layout reset to last saved state")
    }
  }

  const exportLayout = () => {
    if (!currentLayout) return

    const dataStr = JSON.stringify(currentLayout, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${currentLayout.name.replace(/\s+/g, "_")}_layout.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Layout exported successfully")
  }

  const getWidgetSizeClass = (size: Widget["size"]) => {
    switch (size) {
      case "small":
        return "col-span-3 row-span-2"
      case "medium":
        return "col-span-4 row-span-3"
      case "large":
        return "col-span-8 row-span-4"
      case "full":
        return "col-span-12 row-span-6"
      default:
        return "col-span-4 row-span-3"
    }
  }

  const getPreviewClass = () => {
    switch (previewMode) {
      case "tablet":
        return "max-w-4xl mx-auto"
      case "mobile":
        return "max-w-sm mx-auto"
      default:
        return "w-full"
    }
  }

  const currentTheme = themes.find((t) => t.id === currentLayout?.theme) || themes[0]

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              DASHBOARD <span className="text-primary">CUSTOMIZATION</span>
            </h1>
            <p className="text-gray-400">Personalize your dashboard layout and widgets</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
                className="p-2"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
                className="p-2"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
                className="p-2"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditMode ? "Exit Edit" : "Edit Mode"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Layout Selector */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Layouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentLayout?.id === layout.id
                        ? "border-primary bg-primary/10"
                        : "border-primary/20 hover:border-primary/40"
                    }`}
                    onClick={() => setCurrentLayout(layout)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{layout.name}</h3>
                      {layout.isDefault && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">Default</Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{layout.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{layout.widgets.length} widgets</span>
                      <span>Modified {layout.lastModified}</span>
                    </div>
                  </div>
                ))}

                <Dialog open={isCreateLayoutOpen} onOpenChange={setIsCreateLayoutOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Layout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Layout</DialogTitle>
                      <DialogDescription className="text-gray-400">Create a custom dashboard layout</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="layoutName" className="text-white">
                          Layout Name
                        </Label>
                        <Input
                          id="layoutName"
                          value={newLayoutName}
                          onChange={(e) => setNewLayoutName(e.target.value)}
                          className="bg-white/10 border-primary/30 text-white"
                          placeholder="Enter layout name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="layoutDescription" className="text-white">
                          Description
                        </Label>
                        <Input
                          id="layoutDescription"
                          value={newLayoutDescription}
                          onChange={(e) => setNewLayoutDescription(e.target.value)}
                          className="bg-white/10 border-primary/30 text-white"
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateLayoutOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewLayout}>Create Layout</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Theme Selector */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentLayout?.theme === theme.id
                        ? "border-primary bg-primary/10"
                        : "border-primary/20 hover:border-primary/40"
                    }`}
                    onClick={() => updateLayoutTheme(theme.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="text-white font-medium">{theme.name}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Widget Library */}
            {isEditMode && (
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Grid className="h-5 w-5 text-primary" />
                    Widget Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Widget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 backdrop-blur-xl border-primary/20 max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Widget</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Choose a widget to add to your dashboard
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue={widgetTypes[0].category} className="w-full">
                        <TabsList className="bg-black/40 backdrop-blur-xl border-primary/20">
                          {widgetTypes.map((category) => (
                            <TabsTrigger key={category.category} value={category.category}>
                              {category.category}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {widgetTypes.map((category) => (
                          <TabsContent key={category.category} value={category.category}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {category.widgets.map((widget) => {
                                const Icon = widget.icon
                                return (
                                  <div
                                    key={widget.type}
                                    className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 cursor-pointer transition-colors group"
                                    onClick={() => addWidget(widget)}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                      <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                        <Icon className="w-6 h-6 text-primary" />
                                      </div>
                                      <h3 className="text-white font-medium">{widget.title}</h3>
                                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                        {widget.defaultSize}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="bg-black/40 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={saveLayout}
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Layout
                </Button>
                <Button
                  onClick={resetLayout}
                  variant="outline"
                  className="w-full border-gray-500/30 text-gray-400 hover:bg-gray-500/10 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button
                  onClick={exportLayout}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Layout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 border-primary/30 min-h-[800px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{currentLayout?.name || "Dashboard Preview"}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">{previewMode}</Badge>
                    {isEditMode && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Edit Mode</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${getPreviewClass()} transition-all duration-300`}>
                  <div
                    className="grid gap-4 min-h-[600px]"
                    style={{
                      gridTemplateColumns: `repeat(${currentLayout?.gridSize || 12}, minmax(0, 1fr))`,
                      gridTemplateRows: "repeat(auto-fit, minmax(100px, 1fr))",
                    }}
                  >
                    <AnimatePresence>
                      {currentLayout?.widgets
                        .filter((widget) => widget.visible)
                        .map((widget) => {
                          const Icon = widget.icon
                          return (
                            <motion.div
                              key={widget.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`${getWidgetSizeClass(widget.size)} relative group`}
                            >
                              <div
                                className="h-full p-4 rounded-lg border border-primary/20 bg-black/20 hover:border-primary/40 transition-colors"
                                style={{
                                  backgroundColor: `${currentTheme.secondary}20`,
                                  borderColor: `${currentTheme.accent}30`,
                                }}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" style={{ color: currentTheme.accent }} />
                                    <h3 className="text-white font-medium">{widget.title}</h3>
                                  </div>
                                  {isEditMode && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => toggleWidgetVisibility(widget.id)}
                                        className="w-8 h-8 p-0"
                                      >
                                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                      </Button>
                                      <Select
                                        value={widget.size}
                                        onValueChange={(value) => updateWidgetSize(widget.id, value as Widget["size"])}
                                      >
                                        <SelectTrigger className="w-20 h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="small">Small</SelectItem>
                                          <SelectItem value="medium">Medium</SelectItem>
                                          <SelectItem value="large">Large</SelectItem>
                                          <SelectItem value="full">Full</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeWidget(widget.id)}
                                        className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Widget Content Preview */}
                                <div className="h-full flex items-center justify-center text-gray-400">
                                  <div className="text-center">
                                    <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Widget Preview</p>
                                    <p className="text-xs opacity-75">{widget.category}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                    </AnimatePresence>

                    {/* Empty State */}
                    {(!currentLayout?.widgets.length || currentLayout.widgets.every((w) => !w.visible)) && (
                      <div className="col-span-full flex items-center justify-center h-64">
                        <div className="text-center">
                          <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-white text-lg font-medium mb-2">No Widgets Added</h3>
                          <p className="text-gray-400 mb-4">
                            {isEditMode
                              ? "Click 'Add Widget' to start customizing your dashboard"
                              : "Enable edit mode to add widgets"}
                          </p>
                          {!isEditMode && (
                            <Button
                              onClick={() => setIsEditMode(true)}
                              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Enable Edit Mode
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
