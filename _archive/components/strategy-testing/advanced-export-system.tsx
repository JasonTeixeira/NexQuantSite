"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Download,
  FileText,
  Image,
  File,
  BarChart3,
  TrendingUp,
  Calendar,
  Settings,
  X,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Share2,
  Mail,
  Link,
  Copy,
  Zap,
  Filter,
  Layers,
  Grid,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Target,
  Briefcase,
  Save,
  Upload,
  Star,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Export types and configurations
export interface ExportFormat {
  id: string
  name: string
  extension: string
  mimeType: string
  description: string
  icon: React.ComponentType<any>
  supportsCustomization: boolean
  maxFileSize?: number
}

export interface ExportData {
  id: string
  name: string
  type: 'chart' | 'table' | 'report' | 'portfolio' | 'strategy' | 'performance' | 'analysis'
  description: string
  size?: number
  lastUpdated: Date
  icon: React.ComponentType<any>
  available: boolean
  premium?: boolean
}

export interface ExportJob {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  format: string
  dataType: string
  progress: number
  startTime: Date
  endTime?: Date
  downloadUrl?: string
  errorMessage?: string
  fileSize?: number
}

export interface ExportTemplate {
  id: string
  name: string
  description: string
  dataTypes: string[]
  formats: string[]
  settings: Record<string, any>
  isDefault?: boolean
  isSystem?: boolean
}

const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: 'pdf',
    mimeType: 'application/pdf',
    description: 'Professional reports and charts',
    icon: FileText,
    supportsCustomization: true,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    id: 'excel',
    name: 'Excel Spreadsheet',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Data tables and analysis',
    icon: Grid,
    supportsCustomization: true,
    maxFileSize: 25 * 1024 * 1024 // 25MB
  },
  {
    id: 'csv',
    name: 'CSV Data',
    extension: 'csv',
    mimeType: 'text/csv',
    description: 'Raw data for analysis',
    icon: File,
    supportsCustomization: false,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  {
    id: 'json',
    name: 'JSON Data',
    extension: 'json',
    mimeType: 'application/json',
    description: 'Structured data format',
    icon: File,
    supportsCustomization: false,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  {
    id: 'png',
    name: 'PNG Image',
    extension: 'png',
    mimeType: 'image/png',
    description: 'High-quality chart images',
    icon: Image,
    supportsCustomization: true,
    maxFileSize: 20 * 1024 * 1024 // 20MB
  },
  {
    id: 'svg',
    name: 'SVG Vector',
    extension: 'svg',
    mimeType: 'image/svg+xml',
    description: 'Scalable vector graphics',
    icon: Image,
    supportsCustomization: true,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  }
]

const availableData: ExportData[] = [
  {
    id: 'portfolio-performance',
    name: 'Portfolio Performance',
    type: 'performance',
    description: 'Complete portfolio performance metrics and analysis',
    size: 2.4 * 1024 * 1024, // 2.4MB
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    icon: TrendingUp,
    available: true
  },
  {
    id: 'equity-curve',
    name: 'Equity Curve Chart',
    type: 'chart',
    description: 'Interactive equity curve with annotations',
    size: 1.2 * 1024 * 1024, // 1.2MB
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    icon: LineChartIcon,
    available: true
  },
  {
    id: 'trade-history',
    name: 'Trade History',
    type: 'table',
    description: 'Detailed trade execution history',
    size: 3.8 * 1024 * 1024, // 3.8MB
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    icon: Activity,
    available: true
  },
  {
    id: 'risk-analysis',
    name: 'Risk Analysis Report',
    type: 'report',
    description: 'Comprehensive risk metrics and analysis',
    size: 1.8 * 1024 * 1024, // 1.8MB
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    icon: AlertCircle,
    available: true
  },
  {
    id: 'strategy-backtest',
    name: 'Strategy Backtest Results',
    type: 'strategy',
    description: 'Backtest results with detailed metrics',
    size: 4.2 * 1024 * 1024, // 4.2MB
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    icon: Target,
    available: true
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis Dashboard',
    type: 'analysis',
    description: 'Complete market analysis with charts',
    size: 5.1 * 1024 * 1024, // 5.1MB
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    icon: BarChart3,
    available: true,
    premium: true
  },
  {
    id: 'portfolio-allocation',
    name: 'Portfolio Allocation',
    type: 'portfolio',
    description: 'Asset allocation breakdown and analysis',
    size: 0.8 * 1024 * 1024, // 0.8MB
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    icon: PieChartIcon,
    available: true
  }
]

const exportTemplates: ExportTemplate[] = [
  {
    id: 'monthly-report',
    name: 'Monthly Performance Report',
    description: 'Comprehensive monthly portfolio review',
    dataTypes: ['portfolio-performance', 'risk-analysis', 'trade-history'],
    formats: ['pdf', 'excel'],
    settings: {
      includecharts: true,
      includeRisk: true,
      timeframe: '1M',
      format: 'professional'
    },
    isDefault: true,
    isSystem: true
  },
  {
    id: 'trade-summary',
    name: 'Trading Summary',
    description: 'Quick trading activity overview',
    dataTypes: ['trade-history', 'equity-curve'],
    formats: ['pdf', 'excel', 'csv'],
    settings: {
      includeCharts: true,
      timeframe: '1W',
      format: 'summary'
    },
    isSystem: true
  },
  {
    id: 'risk-compliance',
    name: 'Risk & Compliance Report',
    description: 'Regulatory compliance and risk assessment',
    dataTypes: ['risk-analysis', 'portfolio-performance'],
    formats: ['pdf'],
    settings: {
      includeCompliance: true,
      includeSignatures: true,
      format: 'regulatory'
    },
    isSystem: true
  }
]

interface AdvancedExportSystemProps {
  isOpen: boolean
  onClose: () => void
  onExport?: (dataIds: string[], format: string, settings?: any) => Promise<ExportJob>
  onTemplateUse?: (template: ExportTemplate) => void
}

export default function AdvancedExportSystem({
  isOpen,
  onClose,
  onExport,
  onTemplateUse
}: AdvancedExportSystemProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'templates' | 'jobs' | 'settings'>('data')
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0])
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'job-1',
      name: 'Portfolio Report Q4',
      status: 'completed',
      format: 'pdf',
      dataType: 'portfolio-performance',
      progress: 100,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000), // 45s processing
      downloadUrl: '/exports/portfolio-report-q4.pdf',
      fileSize: 2.4 * 1024 * 1024
    },
    {
      id: 'job-2',
      name: 'Trade History Export',
      status: 'processing',
      format: 'excel',
      dataType: 'trade-history',
      progress: 67,
      startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    },
    {
      id: 'job-3',
      name: 'Risk Analysis Failed',
      status: 'failed',
      format: 'pdf',
      dataType: 'risk-analysis',
      progress: 0,
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      errorMessage: 'Insufficient data for selected time period'
    }
  ])
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    charts: true,
    tables: false,
    reports: false,
    analysis: false
  })
  
  const [exportSettings, setExportSettings] = useState({
    quality: 'high',
    includeMetadata: true,
    includeWatermark: false,
    compression: 'balanced',
    timeframe: '1M',
    timezone: 'UTC'
  })

  const handleDataToggle = useCallback((dataId: string) => {
    setSelectedData(prev => 
      prev.includes(dataId) 
        ? prev.filter(id => id !== dataId)
        : [...prev, dataId]
    )
  }, [])

  const handleExportStart = useCallback(async () => {
    if (selectedData.length === 0) {
      alert('Please select at least one data source to export')
      return
    }

    if (onExport) {
      try {
        const job = await onExport(selectedData, selectedFormat.id, exportSettings)
        setExportJobs(prev => [job, ...prev])
        alert(`Export started! Job ID: ${job.id}`)
      } catch (error) {
        console.error('Export failed:', error)
        alert('Export failed. Please try again.')
      }
    } else {
      // Simulate export
      const mockJob: ExportJob = {
        id: `job-${Date.now()}`,
        name: `Export ${selectedData.length} items`,
        status: 'pending',
        format: selectedFormat.id,
        dataType: selectedData[0],
        progress: 0,
        startTime: new Date()
      }
      
      setExportJobs(prev => [mockJob, ...prev])
      
      // Simulate processing
      setTimeout(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === mockJob.id 
            ? { ...job, status: 'processing' as const, progress: 20 }
            : job
        ))
      }, 1000)
      
      setTimeout(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === mockJob.id 
            ? { 
                ...job, 
                status: 'completed' as const, 
                progress: 100,
                endTime: new Date(),
                downloadUrl: `/exports/${mockJob.name.toLowerCase().replace(/\s+/g, '-')}.${selectedFormat.extension}`,
                fileSize: 2.1 * 1024 * 1024
              }
            : job
        ))
      }, 5000)
      
      alert('Export started successfully!')
    }
  }, [selectedData, selectedFormat, exportSettings, onExport])

  const handleTemplateUse = useCallback((template: ExportTemplate) => {
    setSelectedData(template.dataTypes)
    setSelectedFormat(exportFormats.find(f => template.formats.includes(f.id)) || exportFormats[0])
    setExportSettings(prev => ({ ...prev, ...template.settings }))
    onTemplateUse?.(template)
    setActiveTab('data')
  }, [onTemplateUse])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTimeAgo = (date: Date) => {
    const now = Date.now()
    const diff = now - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const tabs = [
    { id: 'data', label: 'Data Sources', icon: Layers },
    { id: 'templates', label: 'Templates', icon: Star },
    { id: 'jobs', label: 'Export Jobs', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const

  const dataGroups = useMemo(() => {
    return availableData.reduce((groups, data) => {
      const type = data.type
      if (!groups[type]) groups[type] = []
      groups[type].push(data)
      return groups
    }, {} as Record<string, ExportData[]>)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[130] flex justify-end">
      <Card className="w-full max-w-2xl h-full bg-[#0f1320] border-[#2a2a3e] shadow-2xl flex flex-col m-0 rounded-none border-r-0">
        <CardHeader className="border-b border-[#2a2a3e] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              Advanced Export System
            </CardTitle>
            <div className="flex gap-2">
              {selectedData.length > 0 && (
                <Button 
                  onClick={handleExportStart}
                  className="bg-[#22c55e] hover:bg-[#16a34a] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export ({selectedData.length})
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
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
                {tab.id === 'jobs' && exportJobs.filter(j => j.status === 'processing').length > 0 && (
                  <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Data Summary */}
          {selectedData.length > 0 && (
            <div className="mt-4 p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">{selectedData.length} items selected</span>
                  <div className="text-xs text-[#a0a0b8] mt-1">
                    Format: {selectedFormat.name} ({selectedFormat.extension})
                  </div>
                </div>
                <div className="flex gap-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format)}
                      className={`p-2 rounded border transition-all duration-200 ${
                        selectedFormat.id === format.id
                          ? 'border-[#00bbff] bg-[#00bbff]/20 text-[#00bbff]'
                          : 'border-[#3a3a4e] bg-[#2a2a3e] text-[#a0a0b8] hover:border-[#4a4a5e] hover:text-white'
                      }`}
                      title={format.name}
                    >
                      <format.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Available Data Sources</h3>
                <div className="text-sm text-[#a0a0b8]">
                  {availableData.filter(d => d.available).length} of {availableData.length} available
                </div>
              </div>

              {Object.entries(dataGroups).map(([type, dataItems]) => (
                <div key={type}>
                  <button
                    onClick={() => toggleSection(type)}
                    className="flex items-center justify-between w-full p-2 text-left hover:bg-[#1a1a2e] rounded mb-3"
                  >
                    <div className="flex items-center gap-2">
                      {type === 'chart' && <LineChartIcon className="w-4 h-4 text-[#00bbff]" />}
                      {type === 'table' && <Grid className="w-4 h-4 text-[#22c55e]" />}
                      {type === 'report' && <FileText className="w-4 h-4 text-[#f59e0b]" />}
                      {type === 'performance' && <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />}
                      {type === 'portfolio' && <Briefcase className="w-4 h-4 text-[#06b6d4]" />}
                      {type === 'strategy' && <Target className="w-4 h-4 text-[#ef4444]" />}
                      {type === 'analysis' && <BarChart3 className="w-4 h-4 text-[#f97316]" />}
                      <span className="text-sm font-medium text-white capitalize">{type}s ({dataItems.length})</span>
                    </div>
                    {expandedSections[type] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {expandedSections[type] && (
                    <div className="space-y-3 ml-6">
                      {dataItems.map((data) => (
                        <div
                          key={data.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedData.includes(data.id)
                              ? 'border-[#00bbff] bg-[#00bbff]/10'
                              : data.available
                                ? 'border-[#2a2a3e] bg-[#1a1a2e] hover:border-[#3a3a4e]'
                                : 'border-[#2a2a3e] bg-[#1a1a2e] opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => data.available && handleDataToggle(data.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex items-center gap-2 mt-1">
                                {selectedData.includes(data.id) ? (
                                  <div className="w-5 h-5 bg-[#00bbff] rounded flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-[#3a3a4e] rounded"></div>
                                )}
                                <data.icon className="w-5 h-5 text-[#00bbff]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white flex items-center gap-2">
                                  {data.name}
                                  {data.premium && (
                                    <span className="px-2 py-1 bg-gradient-to-r from-[#f59e0b] to-[#eab308] text-xs font-bold text-white rounded">
                                      PRO
                                    </span>
                                  )}
                                  {!data.available && (
                                    <span className="px-2 py-1 bg-[#ef4444] text-xs text-white rounded">
                                      Unavailable
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-[#a0a0b8] mt-1">{data.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-[#606078]">
                                  {data.size && <span>Size: {formatFileSize(data.size)}</span>}
                                  <span>Updated: {formatTimeAgo(data.lastUpdated)}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Export Templates</h3>
                <Button size="sm" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Create Template
                </Button>
              </div>

              <div className="space-y-4">
                {exportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          {template.name}
                          {template.isSystem && (
                            <span className="px-2 py-1 bg-[#2a2a3e] text-xs text-[#a0a0b8] rounded">
                              System
                            </span>
                          )}
                          {template.isDefault && <Star className="w-4 h-4 text-yellow-400" />}
                        </h4>
                        <p className="text-sm text-[#a0a0b8] mt-1">{template.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#606078]">
                          <span>{template.dataTypes.length} data sources</span>
                          <span>{template.formats.length} formats supported</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTemplateUse(template)}
                          size="sm"
                          variant="outline"
                        >
                          Use Template
                        </Button>
                        {!template.isSystem && (
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Template Preview */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#2a2a3e]">
                      <div>
                        <div className="text-xs font-medium text-[#a0a0b8] mb-2">Data Types</div>
                        <div className="flex flex-wrap gap-1">
                          {template.dataTypes.slice(0, 3).map((type) => (
                            <span key={type} className="px-2 py-1 bg-[#2a2a3e] text-xs text-[#a0a0b8] rounded">
                              {type.replace('-', ' ')}
                            </span>
                          ))}
                          {template.dataTypes.length > 3 && (
                            <span className="px-2 py-1 bg-[#2a2a3e] text-xs text-[#a0a0b8] rounded">
                              +{template.dataTypes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#a0a0b8] mb-2">Formats</div>
                        <div className="flex gap-1">
                          {template.formats.map((formatId) => {
                            const format = exportFormats.find(f => f.id === formatId)
                            return format ? (
                              <div key={formatId} className="w-6 h-6 bg-[#2a2a3e] rounded flex items-center justify-center">
                                <format.icon className="w-3 h-3 text-[#a0a0b8]" />
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Export Jobs</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    Clear Completed
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {exportJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="w-16 h-16 text-[#3a3a4e] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Export Jobs</h3>
                    <p className="text-[#a0a0b8]">Start an export to see jobs here</p>
                  </div>
                ) : (
                  exportJobs.map((job) => (
                    <div key={job.id} className="p-4 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white flex items-center gap-2">
                            {job.name}
                            <span className={`px-2 py-1 text-xs rounded font-medium ${
                              job.status === 'completed' ? 'bg-green-900 text-green-300' :
                              job.status === 'processing' ? 'bg-blue-900 text-blue-300' :
                              job.status === 'failed' ? 'bg-red-900 text-red-300' :
                              'bg-gray-900 text-gray-300'
                            }`}>
                              {job.status.toUpperCase()}
                            </span>
                          </h4>
                          <div className="text-sm text-[#a0a0b8] mt-1">
                            {job.format.toUpperCase()} • {job.dataType.replace('-', ' ')}
                          </div>
                          {job.errorMessage && (
                            <div className="text-sm text-red-400 mt-1 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {job.errorMessage}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {job.downloadUrl && (
                            <Button size="sm" className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {job.status === 'processing' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#a0a0b8]">Progress</span>
                            <span className="text-xs text-[#a0a0b8]">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-[#2a2a3e] rounded-full h-2">
                            <div 
                              className="bg-[#00bbff] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#606078] pt-3 border-t border-[#2a2a3e]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Started {formatTimeAgo(job.startTime)}
                          </span>
                          {job.endTime && (
                            <span>
                              Completed in {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s
                            </span>
                          )}
                        </div>
                        {job.fileSize && (
                          <span>Size: {formatFileSize(job.fileSize)}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Export Settings</h3>

              <div className="space-y-6">
                {/* Quality Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Output Quality</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setExportSettings(prev => ({ ...prev, quality }))}
                        className={`p-3 rounded-lg border text-sm transition-all duration-200 capitalize ${
                          exportSettings.quality === quality
                            ? 'border-[#00bbff] bg-[#00bbff]/20 text-[#00bbff]'
                            : 'border-[#2a2a3e] bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:border-[#3a3a4e]'
                        }`}
                      >
                        {quality}
                        <div className="text-xs mt-1 opacity-70">
                          {quality === 'low' ? 'Fast, smaller files' :
                           quality === 'medium' ? 'Balanced' :
                           'Best quality'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metadata Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Content Options</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'includeMetadata', label: 'Include Metadata', desc: 'Add creation date, user info, etc.' },
                      { key: 'includeWatermark', label: 'Add Watermark', desc: 'Brand exports with your logo' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-white">{option.label}</span>
                          <p className="text-xs text-[#a0a0b8]">{option.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportSettings[option.key as keyof typeof exportSettings] as boolean}
                            onChange={(e) => setExportSettings(prev => ({
                              ...prev,
                              [option.key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#2a2a3e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bbff]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compression Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Compression</h4>
                  <select
                    value={exportSettings.compression}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, compression: e.target.value }))}
                    className="w-full p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#00bbff]"
                  >
                    <option value="none">No Compression</option>
                    <option value="balanced">Balanced</option>
                    <option value="maximum">Maximum Compression</option>
                  </select>
                </div>

                {/* Timeframe Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Default Timeframe</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['1W', '1M', '3M', '1Y'].map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setExportSettings(prev => ({ ...prev, timeframe }))}
                        className={`p-2 rounded border text-sm transition-all duration-200 ${
                          exportSettings.timeframe === timeframe
                            ? 'border-[#00bbff] bg-[#00bbff]/20 text-[#00bbff]'
                            : 'border-[#2a2a3e] bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:border-[#3a3a4e]'
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-[#2a2a3e] p-4">
          <div className="flex items-center justify-between text-sm text-[#606078]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {exportJobs.filter(j => j.status === 'processing').length} active jobs
              </span>
              <span>{exportJobs.filter(j => j.status === 'completed').length} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00bbff]">
                {selectedData.length > 0 ? `${selectedData.length} selected` : 'Select data to export'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

