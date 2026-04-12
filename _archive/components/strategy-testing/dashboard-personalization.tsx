"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Layout,
  Grid,
  Settings,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  Move,
  Maximize2,
  Minimize2,
  Copy,
  Star,
  User,
  Palette,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  Clock,
  Bell,
  Zap,
  Target,
  Brain,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Widget types for dashboard personalization
export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'list' | 'news' | 'calendar' | 'watchlist' | 'performance' | 'ai-insights'
  title: string
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
  minimized: boolean
  settings: Record<string, any>
  dataSource?: string
  refreshInterval?: number
  customStyles?: {
    backgroundColor?: string
    borderColor?: string
    textColor?: string
  }
}

export interface DashboardLayout {
  id: string
  name: string
  description?: string
  widgets: DashboardWidget[]
  gridSettings: {
    columns: number
    rowHeight: number
    margin: [number, number]
  }
  backgroundColor?: string
  isDefault?: boolean
  isSystem?: boolean
  createdAt: Date
  lastModified: Date
}

export interface UserPreferences {
  defaultLayout: string
  autoSave: boolean
  notifications: {
    enabled: boolean
    priceAlerts: boolean
    performanceUpdates: boolean
    systemUpdates: boolean
  }
  display: {
    density: 'compact' | 'comfortable' | 'spacious'
    animations: boolean
    sounds: boolean
  }
  dataRefresh: {
    interval: number
    pauseWhenInactive: boolean
  }
}

const defaultWidgets: Omit<DashboardWidget, 'id' | 'position'>[] = [
  {
    type: 'performance',
    title: 'Portfolio Performance',
    visible: true,
    minimized: false,
    settings: { timeframe: '1M', showBenchmark: true },
    refreshInterval: 30000
  },
  {
    type: 'chart',
    title: 'Equity Curve',
    visible: true,
    minimized: false,
    settings: { chartType: 'line', indicators: ['sma20', 'sma50'] },
    refreshInterval: 10000
  },
  {
    type: 'watchlist',
    title: 'Watchlist',
    visible: true,
    minimized: false,
    settings: { symbols: ['TSLA', 'AAPL', 'MSFT', 'GOOGL'], showChangePercent: true },
    refreshInterval: 5000
  },
  {
    type: 'ai-insights',
    title: 'AI Market Insights',
    visible: true,
    minimized: false,
    settings: { insightTypes: ['trend', 'risk', 'opportunity'], maxItems: 5 },
    refreshInterval: 60000
  },
  {
    type: 'news',
    title: 'Market News',
    visible: true,
    minimized: false,
    settings: { sources: ['bloomberg', 'reuters', 'cnbc'], maxItems: 10 },
    refreshInterval: 120000
  },
  {
    type: 'calendar',
    title: 'Economic Calendar',
    visible: false,
    minimized: false,
    settings: { importance: 'high', regions: ['US', 'EU'], upcoming: 7 },
    refreshInterval: 300000
  }
]

const systemLayouts: DashboardLayout[] = [
  {
    id: 'default',
    name: 'Default Layout',
    description: 'Balanced view with key metrics and charts',
    widgets: defaultWidgets.map((widget, index) => ({
      ...widget,
      id: `widget-${index}`,
      position: 
        index === 0 ? { x: 0, y: 0, w: 6, h: 3 } :
        index === 1 ? { x: 6, y: 0, w: 6, h: 3 } :
        index === 2 ? { x: 0, y: 3, w: 4, h: 4 } :
        index === 3 ? { x: 4, y: 3, w: 4, h: 4 } :
        index === 4 ? { x: 8, y: 3, w: 4, h: 4 } :
        { x: 0, y: 7, w: 12, h: 2 }
    })),
    gridSettings: { columns: 12, rowHeight: 60, margin: [10, 10] },
    isDefault: true,
    isSystem: true,
    createdAt: new Date(),
    lastModified: new Date()
  },
  {
    id: 'trader',
    name: 'Active Trader',
    description: 'Optimized for active trading with real-time data',
    widgets: defaultWidgets.filter(w => w.type !== 'calendar' && w.type !== 'news').map((widget, index) => ({
      ...widget,
      id: `trader-widget-${index}`,
      position: 
        index === 0 ? { x: 0, y: 0, w: 8, h: 4 } :
        index === 1 ? { x: 8, y: 0, w: 4, h: 4 } :
        index === 2 ? { x: 0, y: 4, w: 6, h: 3 } :
        { x: 6, y: 4, w: 6, h: 3 }
    })),
    gridSettings: { columns: 12, rowHeight: 60, margin: [8, 8] },
    isSystem: true,
    createdAt: new Date(),
    lastModified: new Date()
  },
  {
    id: 'analyst',
    name: 'Research Analyst',
    description: 'Focus on analysis and research tools',
    widgets: defaultWidgets.map((widget, index) => ({
      ...widget,
      id: `analyst-widget-${index}`,
      visible: widget.type === 'ai-insights' || widget.type === 'news' || widget.type === 'calendar' || widget.type === 'performance',
      position: 
        index === 0 ? { x: 0, y: 0, w: 6, h: 3 } :
        index === 1 ? { x: 6, y: 0, w: 6, h: 3 } :
        index === 2 ? { x: 0, y: 3, w: 12, h: 2 } :
        index === 3 ? { x: 0, y: 5, w: 8, h: 4 } :
        index === 4 ? { x: 8, y: 5, w: 4, h: 4 } :
        { x: 0, y: 9, w: 12, h: 3 }
    })),
    gridSettings: { columns: 12, rowHeight: 55, margin: [12, 12] },
    isSystem: true,
    createdAt: new Date(),
    lastModified: new Date()
  }
]

interface DashboardPersonalizationProps {
  isOpen: boolean
  onClose: () => void
  currentLayout?: DashboardLayout
  onLayoutChange?: (layout: DashboardLayout) => void
  onPreferencesChange?: (preferences: UserPreferences) => void
}

export default function DashboardPersonalization({
  isOpen,
  onClose,
  currentLayout,
  onLayoutChange,
  onPreferencesChange
}: DashboardPersonalizationProps) {
  const [activeTab, setActiveTab] = useState<'layouts' | 'widgets' | 'preferences' | 'themes'>('layouts')
  const [layouts, setLayouts] = useState<DashboardLayout[]>(systemLayouts)
  const [selectedLayout, setSelectedLayout] = useState<DashboardLayout>(systemLayouts[0])
  const [editingLayout, setEditingLayout] = useState<DashboardLayout | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultLayout: 'default',
    autoSave: true,
    notifications: {
      enabled: true,
      priceAlerts: true,
      performanceUpdates: true,
      systemUpdates: false
    },
    display: {
      density: 'comfortable',
      animations: true,
      sounds: false
    },
    dataRefresh: {
      interval: 30000,
      pauseWhenInactive: true
    }
  })
  
  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('nexus-dashboard-preferences')
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs))
      } catch (e) {
        console.warn('Failed to load dashboard preferences')
      }
    }
    
    const savedLayouts = localStorage.getItem('nexus-custom-layouts')
    if (savedLayouts) {
      try {
        const customLayouts = JSON.parse(savedLayouts)
        setLayouts([...systemLayouts, ...customLayouts])
      } catch (e) {
        console.warn('Failed to load custom layouts')
      }
    }
  }, [])
  
  const handleLayoutSelect = useCallback((layout: DashboardLayout) => {
    setSelectedLayout(layout)
    onLayoutChange?.(layout)
  }, [onLayoutChange])
  
  const handleLayoutSave = useCallback((layout: DashboardLayout) => {
    const updatedLayouts = layouts.map(l => l.id === layout.id ? layout : l)
    if (!layouts.find(l => l.id === layout.id)) {
      updatedLayouts.push(layout)
    }
    
    setLayouts(updatedLayouts)
    
    // Save custom layouts to localStorage
    const customLayouts = updatedLayouts.filter(l => !l.isSystem)
    localStorage.setItem('nexus-custom-layouts', JSON.stringify(customLayouts))
  }, [layouts])
  
  const handlePreferenceChange = useCallback((key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    localStorage.setItem('nexus-dashboard-preferences', JSON.stringify(newPreferences))
    onPreferencesChange?.(newPreferences)
  }, [preferences, onPreferencesChange])
  
  const handleWidgetToggle = useCallback((widgetId: string) => {
    if (!editingLayout) return
    
    const updatedWidgets = editingLayout.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    )
    
    setEditingLayout({ ...editingLayout, widgets: updatedWidgets })
  }, [editingLayout])
  
  const createNewLayout = useCallback(() => {
    const newLayout: DashboardLayout = {
      id: `custom-${Date.now()}`,
      name: 'Custom Layout',
      description: 'My personalized dashboard',
      widgets: defaultWidgets.map((widget, index) => ({
        ...widget,
        id: `custom-widget-${index}`,
        position: { x: index % 3 * 4, y: Math.floor(index / 3) * 3, w: 4, h: 3 }
      })),
      gridSettings: { columns: 12, rowHeight: 60, margin: [10, 10] },
      createdAt: new Date(),
      lastModified: new Date()
    }
    
    setEditingLayout(newLayout)
  }, [])
  
  const tabs = [
    { id: 'layouts', label: 'Layouts', icon: Layout },
    { id: 'widgets', label: 'Widgets', icon: Grid },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'themes', label: 'Themes', icon: Palette }
  ] as const
  
  const widgetTypes = [
    { type: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-green-400' },
    { type: 'chart', label: 'Charts', icon: BarChart3, color: 'text-blue-400' },
    { type: 'watchlist', label: 'Watchlist', icon: Star, color: 'text-yellow-400' },
    { type: 'ai-insights', label: 'AI Insights', icon: Brain, color: 'text-purple-400' },
    { type: 'news', label: 'News', icon: Bell, color: 'text-orange-400' },
    { type: 'calendar', label: 'Calendar', icon: Clock, color: 'text-red-400' },
    { type: 'metric', label: 'Metrics', icon: Target, color: 'text-cyan-400' }
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex justify-end">
      <Card className="w-full max-w-lg h-full bg-[#0f1320] border-[#2a2a3e] shadow-2xl flex flex-col m-0 rounded-none border-r-0">
        <CardHeader className="border-b border-[#2a2a3e] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
                <Layout className="w-4 h-4 text-white" />
              </div>
              Dashboard Personalization
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#00bbff] text-white'
                    : 'bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'layouts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Dashboard Layouts</h3>
                <Button onClick={createNewLayout} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Layout
                </Button>
              </div>
              
              <div className="space-y-4">
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedLayout.id === layout.id
                        ? 'border-[#00bbff] bg-[#00bbff]/10'
                        : 'border-[#2a2a3e] bg-[#1a1a2e] hover:border-[#3a3a4e]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div onClick={() => handleLayoutSelect(layout)} className="flex-1">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          {layout.name}
                          {layout.isSystem && <span className="px-1.5 py-0.5 text-xs bg-[#2a2a3e] rounded">System</span>}
                          {layout.isDefault && <Star className="w-4 h-4 text-yellow-400" />}
                        </h4>
                        <p className="text-sm text-[#a0a0b8] mt-1">{layout.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#606078]">
                          <span>{layout.widgets.filter(w => w.visible).length} widgets visible</span>
                          <span>{layout.widgets.length} total widgets</span>
                          <span>Modified {layout.lastModified.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingLayout(layout)}
                          variant="ghost"
                          size="sm"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        {!layout.isSystem && (
                          <Button variant="ghost" size="sm">
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Layout Preview */}
                    <div className="h-20 bg-[#0a0a0f] rounded border border-[#2a2a3e] p-2">
                      <div className="grid grid-cols-6 gap-1 h-full">
                        {layout.widgets.filter(w => w.visible).slice(0, 6).map((widget, index) => (
                          <div
                            key={widget.id}
                            className="bg-[#1a1a2e] rounded border border-[#3a3a4e] flex items-center justify-center"
                            style={{ gridColumn: `span ${Math.max(1, Math.min(2, widget.position.w / 2))}` }}
                          >
                            <div className="w-2 h-2 bg-[#00bbff] rounded-sm"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Available Widgets</h3>
                {editingLayout && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleLayoutSave(editingLayout)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingLayout(null)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {!editingLayout ? (
                <div className="text-center py-12">
                  <Grid className="w-16 h-16 text-[#3a3a4e] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Layout to Edit</h3>
                  <p className="text-[#a0a0b8] mb-4">Choose a layout from the Layouts tab to customize its widgets</p>
                  <Button onClick={() => setActiveTab('layouts')}>
                    Go to Layouts
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e]">
                    <h4 className="font-medium text-white mb-1">Editing: {editingLayout.name}</h4>
                    <p className="text-sm text-[#a0a0b8]">Toggle widgets on/off or configure their settings</p>
                  </div>

                  {widgetTypes.map((widgetType) => {
                    const widgets = editingLayout.widgets.filter(w => w.type === widgetType.type)
                    
                    return (
                      <div key={widgetType.type}>
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <widgetType.icon className={`w-4 h-4 ${widgetType.color}`} />
                          {widgetType.label}
                          <span className="text-xs text-[#606078]">({widgets.length})</span>
                        </h4>
                        
                        <div className="space-y-2 ml-6">
                          {widgets.map((widget) => (
                            <div
                              key={widget.id}
                              className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e]"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleWidgetToggle(widget.id)}
                                  className="text-[#a0a0b8] hover:text-white"
                                >
                                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <div>
                                  <span className="text-sm font-medium text-white">{widget.title}</span>
                                  {widget.refreshInterval && (
                                    <div className="text-xs text-[#606078] flex items-center gap-1 mt-1">
                                      <RefreshCw className="w-3 h-3" />
                                      Refreshes every {widget.refreshInterval / 1000}s
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded ${
                                  widget.minimized ? 'bg-[#2a2a3e] text-[#a0a0b8]' : 'bg-[#00bbff]/20 text-[#00bbff]'
                                }`}>
                                  {widget.minimized ? 'Minimized' : 'Normal'}
                                </span>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">User Preferences</h3>
              
              {/* General Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00bbff]" />
                  General
                </h4>
                
                <div className="space-y-3 ml-6">
                  <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-white">Auto Save</span>
                      <p className="text-xs text-[#a0a0b8]">Automatically save layout changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2a2a3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bbff]"></div>
                    </label>
                  </div>

                  <div className="p-3 bg-[#1a1a2e] rounded-lg">
                    <label className="text-sm font-medium text-white mb-2 block">Default Layout</label>
                    <select
                      value={preferences.defaultLayout}
                      onChange={(e) => handlePreferenceChange('defaultLayout', e.target.value)}
                      className="w-full p-2 bg-[#2a2a3e] border border-[#3a3a4e] rounded text-white text-sm focus:outline-none focus:border-[#00bbff]"
                    >
                      {layouts.map((layout) => (
                        <option key={layout.id} value={layout.id}>
                          {layout.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00bbff]" />
                  Notifications
                </h4>
                
                <div className="space-y-3 ml-6">
                  {[
                    { key: 'enabled', label: 'Enable Notifications', desc: 'Receive dashboard notifications' },
                    { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified of price changes' },
                    { key: 'performanceUpdates', label: 'Performance Updates', desc: 'Portfolio performance notifications' },
                    { key: 'systemUpdates', label: 'System Updates', desc: 'Platform update notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-white">{item.label}</span>
                        <p className="text-xs text-[#a0a0b8]">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notifications[item.key as keyof typeof preferences.notifications]}
                          onChange={(e) => handlePreferenceChange('notifications', {
                            ...preferences.notifications,
                            [item.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2a2a3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bbff]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#00bbff]" />
                  Display
                </h4>
                
                <div className="space-y-3 ml-6">
                  <div className="p-3 bg-[#1a1a2e] rounded-lg">
                    <label className="text-sm font-medium text-white mb-2 block">Density</label>
                    <div className="flex gap-2">
                      {['compact', 'comfortable', 'spacious'].map((density) => (
                        <button
                          key={density}
                          onClick={() => handlePreferenceChange('display', {
                            ...preferences.display,
                            density
                          })}
                          className={`flex-1 p-2 rounded text-sm capitalize transition-all duration-200 ${
                            preferences.display.density === density
                              ? 'bg-[#00bbff] text-white'
                              : 'bg-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:bg-[#3a3a4e]'
                          }`}
                        >
                          {density}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-white">Animations</span>
                      <p className="text-xs text-[#a0a0b8]">Enable smooth transitions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.display.animations}
                        onChange={(e) => handlePreferenceChange('display', {
                          ...preferences.display,
                          animations: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2a2a3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bbff]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Dashboard Themes</h3>
              
              <div className="text-center py-8">
                <Palette className="w-16 h-16 text-[#3a3a4e] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Theme Customization</h3>
                <p className="text-[#a0a0b8] mb-4">
                  Advanced theming is available through the main theme panel
                </p>
                <Button
                  onClick={() => {
                    // This would trigger the main theme panel
                    onClose()
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('openThemePanel'))
                    }, 100)
                  }}
                >
                  Open Theme Panel
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-[#2a2a3e] p-4">
          <div className="flex items-center justify-between text-sm text-[#606078]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${preferences.autoSave ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{preferences.autoSave ? 'Auto Save On' : 'Manual Save'}</span>
            </div>
            <div className="text-[#00bbff]">
              {selectedLayout.widgets.filter(w => w.visible).length} widgets active
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

