"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Settings, 
  Palette, 
  TrendingUp, 
  BarChart3, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Move,
  Maximize2,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Layers,
  Grid,
  Type,
  Circle,
  Square,
  Triangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Chart customization types
export interface ChartTheme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    background: string
    grid: string
    text: string
    axis: string
  }
  gradients: {
    bullish: [string, string]
    bearish: [string, string]
    neutral: [string, string]
  }
}

export interface ChartIndicator {
  id: string
  name: string
  type: 'overlay' | 'oscillator' | 'volume'
  visible: boolean
  color: string
  settings: Record<string, any>
  zIndex: number
}

export interface ChartAnnotation {
  id: string
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'fibonacci' | 'trendline'
  coordinates: { x: number; y: number; x2?: number; y2?: number }
  style: {
    color: string
    thickness: number
    opacity: number
    fillColor?: string
    fontSize?: number
  }
  text?: string
  visible: boolean
}

export interface ChartLayout {
  id: string
  name: string
  charts: Array<{
    id: string
    type: 'price' | 'volume' | 'indicator'
    height: number
    indicators: string[]
    timeframe: string
  }>
  splitterSizes: number[]
}

const defaultThemes: ChartTheme[] = [
  {
    id: 'dark',
    name: 'Professional Dark',
    colors: {
      primary: '#00bbff',
      secondary: '#4a4aff',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      background: '#0f1320',
      grid: '#1a1a2e',
      text: '#e2e8f0',
      axis: '#64748b'
    },
    gradients: {
      bullish: ['#22c55e', '#16a34a'],
      bearish: ['#ef4444', '#dc2626'],
      neutral: ['#64748b', '#475569']
    }
  },
  {
    id: 'light',
    name: 'Clean Light',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      background: '#ffffff',
      grid: '#f1f5f9',
      text: '#1e293b',
      axis: '#64748b'
    },
    gradients: {
      bullish: ['#10b981', '#059669'],
      bearish: ['#ef4444', '#dc2626'],
      neutral: ['#64748b', '#475569']
    }
  },
  {
    id: 'matrix',
    name: 'Matrix Green',
    colors: {
      primary: '#00ff41',
      secondary: '#00d4aa',
      success: '#00ff41',
      warning: '#ffff00',
      danger: '#ff073a',
      background: '#0d1117',
      grid: '#21262d',
      text: '#00ff41',
      axis: '#30363d'
    },
    gradients: {
      bullish: ['#00ff41', '#00d4aa'],
      bearish: ['#ff073a', '#dc143c'],
      neutral: ['#30363d', '#21262d']
    }
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Terminal',
    colors: {
      primary: '#ff6600',
      secondary: '#0066cc',
      success: '#00cc66',
      warning: '#ffcc00',
      danger: '#cc0066',
      background: '#000000',
      grid: '#333333',
      text: '#ffffff',
      axis: '#666666'
    },
    gradients: {
      bullish: ['#00cc66', '#009944'],
      bearish: ['#cc0066', '#990044'],
      neutral: ['#666666', '#333333']
    }
  }
]

const defaultIndicators: ChartIndicator[] = [
  {
    id: 'sma20',
    name: 'SMA (20)',
    type: 'overlay',
    visible: true,
    color: '#00bbff',
    settings: { period: 20 },
    zIndex: 1
  },
  {
    id: 'sma50',
    name: 'SMA (50)',
    type: 'overlay',
    visible: true,
    color: '#f59e0b',
    settings: { period: 50 },
    zIndex: 2
  },
  {
    id: 'ema12',
    name: 'EMA (12)',
    type: 'overlay',
    visible: false,
    color: '#22c55e',
    settings: { period: 12 },
    zIndex: 3
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    type: 'overlay',
    visible: false,
    color: '#8b5cf6',
    settings: { period: 20, stdDev: 2 },
    zIndex: 4
  },
  {
    id: 'rsi',
    name: 'RSI (14)',
    type: 'oscillator',
    visible: false,
    color: '#ef4444',
    settings: { period: 14, overbought: 70, oversold: 30 },
    zIndex: 5
  },
  {
    id: 'macd',
    name: 'MACD',
    type: 'oscillator',
    visible: false,
    color: '#06b6d4',
    settings: { fast: 12, slow: 26, signal: 9 },
    zIndex: 6
  },
  {
    id: 'volume',
    name: 'Volume',
    type: 'volume',
    visible: true,
    color: '#64748b',
    settings: { showMA: false, maPeriod: 20 },
    zIndex: 0
  }
]

interface AdvancedChartCustomizationProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange?: (theme: ChartTheme) => void
  onIndicatorToggle?: (indicator: ChartIndicator) => void
  onAnnotationAdd?: (annotation: ChartAnnotation) => void
  onLayoutSave?: (layout: ChartLayout) => void
}

export default function AdvancedChartCustomization({
  isOpen,
  onClose,
  onThemeChange,
  onIndicatorToggle,
  onAnnotationAdd,
  onLayoutSave
}: AdvancedChartCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'indicators' | 'annotations' | 'layouts'>('themes')
  const [selectedTheme, setSelectedTheme] = useState<ChartTheme>(defaultThemes[0])
  const [indicators, setIndicators] = useState<ChartIndicator[]>(defaultIndicators)
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([])
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'line' | 'rectangle' | 'circle' | 'text'>('line')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overlay: true,
    oscillator: false,
    volume: false,
    drawing: false
  })

  const handleThemeSelect = useCallback((theme: ChartTheme) => {
    setSelectedTheme(theme)
    onThemeChange?.(theme)
  }, [onThemeChange])

  const handleIndicatorToggle = useCallback((indicatorId: string) => {
    setIndicators(prev => prev.map(indicator => 
      indicator.id === indicatorId 
        ? { ...indicator, visible: !indicator.visible }
        : indicator
    ))
    
    const indicator = indicators.find(i => i.id === indicatorId)
    if (indicator) {
      onIndicatorToggle?.({ ...indicator, visible: !indicator.visible })
    }
  }, [indicators, onIndicatorToggle])

  const handleIndicatorColorChange = useCallback((indicatorId: string, color: string) => {
    setIndicators(prev => prev.map(indicator => 
      indicator.id === indicatorId 
        ? { ...indicator, color }
        : indicator
    ))
  }, [])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const handleExportSettings = useCallback(() => {
    const settings = {
      theme: selectedTheme,
      indicators,
      annotations,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chart-settings-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedTheme, indicators, annotations])

  const tabs = [
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'indicators', label: 'Indicators', icon: TrendingUp },
    { id: 'annotations', label: 'Drawing', icon: Target },
    { id: 'layouts', label: 'Layouts', icon: Grid }
  ] as const

  const drawingTools = [
    { id: 'line', label: 'Trend Line', icon: Activity },
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'text', label: 'Text', icon: Type }
  ] as const

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex justify-end">
      <Card className="w-full max-w-md h-full bg-[#0f1320] border-[#2a2a3e] shadow-2xl flex flex-col m-0 rounded-none border-r-0">
        <CardHeader className="border-b border-[#2a2a3e] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              Chart Customization
            </CardTitle>
            <div className="flex gap-1">
              <Button onClick={handleExportSettings} variant="ghost" size="sm" title="Export Settings">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#00bbff] text-white'
                    : 'bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#00bbff]" />
                  Chart Themes
                </h3>
                <div className="space-y-3">
                  {defaultThemes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTheme.id === theme.id
                          ? 'border-[#00bbff] bg-[#00bbff]/10'
                          : 'border-[#2a2a3e] bg-[#1a1a2e] hover:border-[#3a3a4e]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{theme.name}</h4>
                        {selectedTheme.id === theme.id && (
                          <div className="w-2 h-2 bg-[#00bbff] rounded-full"></div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(theme.colors).slice(0, 6).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-6 h-6 rounded border border-[#3a3a4e]"
                            style={{ backgroundColor: color }}
                            title={key}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-4">Custom Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedTheme.colors).map(([key, color]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-xs text-[#a0a0b8] capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newTheme = {
                              ...selectedTheme,
                              colors: {
                                ...selectedTheme.colors,
                                [key]: e.target.value
                              }
                            }
                            setSelectedTheme(newTheme)
                            onThemeChange?.(newTheme)
                          }}
                          className="w-8 h-8 rounded border border-[#3a3a4e] bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newTheme = {
                              ...selectedTheme,
                              colors: {
                                ...selectedTheme.colors,
                                [key]: e.target.value
                              }
                            }
                            setSelectedTheme(newTheme)
                            onThemeChange?.(newTheme)
                          }}
                          className="flex-1 px-2 py-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'indicators' && (
            <div className="space-y-4">
              {/* Overlay Indicators */}
              <div>
                <button
                  onClick={() => toggleSection('overlay')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-[#1a1a2e] rounded"
                >
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-[#00bbff]" />
                    <span className="text-sm font-medium text-white">Overlay Indicators</span>
                  </div>
                  {expandedSections.overlay ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.overlay && (
                  <div className="ml-6 mt-2 space-y-3">
                    {indicators.filter(i => i.type === 'overlay').map((indicator) => (
                      <div key={indicator.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleIndicatorToggle(indicator.id)}
                            className="text-[#a0a0b8] hover:text-white"
                          >
                            {indicator.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="text-sm font-medium text-white">{indicator.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={indicator.color}
                            onChange={(e) => handleIndicatorColorChange(indicator.id, e.target.value)}
                            className="w-6 h-6 rounded border border-[#3a3a4e] bg-transparent cursor-pointer"
                          />
                          <Button variant="ghost" size="sm">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Oscillator Indicators */}
              <div>
                <button
                  onClick={() => toggleSection('oscillator')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-[#1a1a2e] rounded"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-sm font-medium text-white">Oscillators</span>
                  </div>
                  {expandedSections.oscillator ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.oscillator && (
                  <div className="ml-6 mt-2 space-y-3">
                    {indicators.filter(i => i.type === 'oscillator').map((indicator) => (
                      <div key={indicator.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleIndicatorToggle(indicator.id)}
                            className="text-[#a0a0b8] hover:text-white"
                          >
                            {indicator.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="text-sm font-medium text-white">{indicator.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={indicator.color}
                            onChange={(e) => handleIndicatorColorChange(indicator.id, e.target.value)}
                            className="w-6 h-6 rounded border border-[#3a3a4e] bg-transparent cursor-pointer"
                          />
                          <Button variant="ghost" size="sm">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume Indicators */}
              <div>
                <button
                  onClick={() => toggleSection('volume')}
                  className="flex items-center justify-between w-full p-2 text-left hover:bg-[#1a1a2e] rounded"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-sm font-medium text-white">Volume</span>
                  </div>
                  {expandedSections.volume ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {expandedSections.volume && (
                  <div className="ml-6 mt-2 space-y-3">
                    {indicators.filter(i => i.type === 'volume').map((indicator) => (
                      <div key={indicator.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleIndicatorToggle(indicator.id)}
                            className="text-[#a0a0b8] hover:text-white"
                          >
                            {indicator.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="text-sm font-medium text-white">{indicator.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={indicator.color}
                            onChange={(e) => handleIndicatorColorChange(indicator.id, e.target.value)}
                            className="w-6 h-6 rounded border border-[#3a3a4e] bg-transparent cursor-pointer"
                          />
                          <Button variant="ghost" size="sm">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'annotations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#00bbff]" />
                  Drawing Tools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {drawingTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setSelectedDrawingTool(tool.id)
                        setIsDrawingMode(true)
                      }}
                      className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-all duration-200 ${
                        selectedDrawingTool === tool.id && isDrawingMode
                          ? 'bg-[#00bbff] text-white'
                          : 'bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e]'
                      }`}
                    >
                      <tool.icon className="w-4 h-4" />
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Active Annotations</h3>
                  <Button
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    variant={isDrawingMode ? "default" : "outline"}
                    size="sm"
                  >
                    {isDrawingMode ? 'Exit Drawing' : 'Start Drawing'}
                  </Button>
                </div>
                
                {annotations.length === 0 ? (
                  <div className="text-center py-8 text-[#a0a0b8]">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No annotations yet</p>
                    <p className="text-xs">Select a drawing tool and click on the chart</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {annotations.map((annotation, index) => (
                      <div key={annotation.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const newAnnotations = annotations.map(a => 
                                a.id === annotation.id ? { ...a, visible: !a.visible } : a
                              )
                              setAnnotations(newAnnotations)
                            }}
                          >
                            {annotation.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <span className="text-sm text-white capitalize">{annotation.type} {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={annotation.style.color}
                            onChange={(e) => {
                              const newAnnotations = annotations.map(a => 
                                a.id === annotation.id 
                                  ? { ...a, style: { ...a.style, color: e.target.value } }
                                  : a
                              )
                              setAnnotations(newAnnotations)
                            }}
                            className="w-6 h-6 rounded border border-[#3a3a4e] bg-transparent cursor-pointer"
                          />
                          <Button 
                            onClick={() => {
                              const newAnnotations = annotations.filter(a => a.id !== annotation.id)
                              setAnnotations(newAnnotations)
                            }}
                            variant="ghost" 
                            size="sm"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'layouts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-[#00bbff]" />
                  Chart Layouts
                </h3>
                <div className="space-y-3">
                  {['Single Chart', 'Split View', 'Triple Stack', 'Quad Grid'].map((layout, index) => (
                    <div key={layout} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg hover:bg-[#2a2a3e] cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Grid className="w-4 h-4 text-[#00bbff]" />
                        <span className="text-sm text-white">{layout}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="flex items-center gap-2" variant="outline">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Upload className="w-4 h-4" />
                    Import
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-[#2a2a3e] p-4">
          <div className="flex items-center justify-between text-sm text-[#606078]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div className="text-[#00bbff]">
              {indicators.filter(i => i.visible).length} indicators active
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

