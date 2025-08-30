"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Bot,
  Send,
  Activity,
  DollarSign,
  Lightbulb,
  History,
  BarChart3,
  TrendingUp,
  Settings,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualization } from '@/hooks/use-performance'
import { simulateBacktest } from '@/lib/sweep'
import { upsertArtifact } from '@/lib/artifacts'
import ExecutionSettings from './execution-settings'

interface BacktestJob {
  id: string
  name: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  eta?: string
  startTime: Date
  endTime?: Date
  strategy: string
  parameters: Record<string, any>
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  category: 'system' | 'trading' | 'backtest' | 'data'
}

interface UsageEntry {
  id: string
  timestamp: Date
  action: string
  cost: number
  credits: number
  category: 'backtest' | 'data' | 'ai' | 'compute'
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface RightSidebarProps {
  isOpen: boolean
  onToggle: () => void
  width: number
  onWidthChange: (width: number) => void
  className?: string
}

const mockBacktestJobs: BacktestJob[] = [
  {
    id: '1',
    name: 'ML Enhanced Momentum',
    status: 'running',
    progress: 67,
    eta: '2m 15s',
    startTime: new Date(Date.now() - 180000),
    strategy: 'ML_MOMENTUM_V2',
    parameters: { lookback: 20, threshold: 0.02 }
  },
  {
    id: '2',
    name: 'Statistical Arbitrage',
    status: 'queued',
    progress: 0,
    startTime: new Date(),
    strategy: 'STAT_ARB_PAIRS',
    parameters: { pairs: 15, zscore: 2.0 }
  },
  {
    id: '3',
    name: 'Vol Surface Strategy',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 900000),
    endTime: new Date(Date.now() - 300000),
    strategy: 'VOL_SURFACE_ARB',
    parameters: { strikes: 10, expiry: '30d' }
  }
]

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 30000),
    level: 'success',
    message: 'Backtest "ML Enhanced Momentum" started successfully',
    category: 'backtest'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    level: 'info',
    message: 'Market data feed connected - NYSE, NASDAQ',
    category: 'data'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    level: 'warning',
    message: 'High memory usage detected (85%)',
    category: 'system'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    level: 'error',
    message: 'Failed to execute order: insufficient margin',
    category: 'trading'
  }
]

const mockUsage: UsageEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000),
    action: 'ML Enhanced Momentum Backtest',
    cost: 2.45,
    credits: 245,
    category: 'backtest'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000),
    action: 'Alternative Data Query',
    cost: 0.85,
    credits: 85,
    category: 'data'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000),
    action: 'AI Strategy Generation',
    cost: 1.20,
    credits: 120,
    category: 'ai'
  }
]

const tips = [
  {
    id: '1',
    title: 'Optimize Your Backtests',
    content: 'Use smaller date ranges for initial testing, then expand for full validation.',
    category: 'performance'
  },
  {
    id: '2',
    title: 'Risk Management',
    content: 'Always set stop-loss levels at 2-3% of portfolio value for new strategies.',
    category: 'risk'
  },
  {
    id: '3',
    title: 'Data Quality',
    content: 'Check for data gaps and outliers before running backtests to avoid skewed results.',
    category: 'data'
  }
]

export default function RightSidebar({ isOpen, onToggle, width, onWidthChange, className }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('queue')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Copilot. I can help you generate strategies, set parameters, and run batch tests. What would you like to work on?',
      timestamp: new Date(),
      suggestions: ['Generate Strategy', 'Set Parameters', 'Run Batch Test']
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [suggestions, setSuggestions] = useState<{ summary?: any; recommend?: Record<string, number> } | null>(null)
  const [isQuickRun, setIsQuickRun] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  // Virtualization for large lists
  const logsV = useVirtualization(mockLogs, 360, 64, 6)
  const usageV = useVirtualization(mockUsage, 360, 56, 6)

  // Load recommendations from latest validation summary
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexus-validation-suggestions')
      if (raw) setSuggestions(JSON.parse(raw))
    } catch {}
  }, [activeTab])

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      onWidthChange(Math.max(300, Math.min(800, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onWidthChange])

  const handleChatSubmit = (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you want to ${message.toLowerCase()}. Let me help you with that. Here are some options:`,
        timestamp: new Date(),
        suggestions: ['Apply to Wizard', 'Save as Template', 'Run Now']
      }
      setChatMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const getStatusIcon = (status: BacktestJob['status']) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3 text-blue-400" />
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'failed': return <XCircle className="w-3 h-3 text-red-400" />
      case 'cancelled': return <Square className="w-3 h-3 text-gray-400" />
      default: return <Clock className="w-3 h-3 text-yellow-400" />
    }
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'warning': return <AlertCircle className="w-3 h-3 text-yellow-400" />
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />
      default: return <Activity className="w-3 h-3 text-blue-400" />
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="rounded-l-lg rounded-r-none border-r-0 bg-[#15151f] border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#1a1a25] hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div 
      ref={sidebarRef}
      className={cn(
        "fixed right-0 top-0 h-full bg-[#15151f] border-l border-[#2a2a3e] z-30 flex",
        className
      )}
      style={{ width }}
      data-testid="right-sidebar"
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="w-1 bg-[#2a2a3e] hover:bg-[#00bbff] cursor-col-resize transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#2a2a3e]">
          <h3 className="text-sm font-semibold text-white">Control Panel</h3>
          <Button
            onClick={onToggle}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-[#a0a0b8] hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-[#1a1a25] border-b border-[#2a2a3e] rounded-none">
            <TabsTrigger value="queue" className="text-xs">Queue</TabsTrigger>
            <TabsTrigger value="copilot" className="text-xs">AI</TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
            <TabsTrigger value="usage" className="text-xs">Usage</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs">Tips</TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="flex-1 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Backtest Queue</h4>
              <Badge variant="secondary" className="text-xs">
                {mockBacktestJobs.filter(j => j.status === 'running').length} Running
              </Badge>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {mockBacktestJobs.map((job) => (
                  <Card key={job.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="text-xs font-medium text-white">{job.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {job.status === 'running' && (
                            <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="space-y-1">
                          <Progress value={job.progress} className="h-1" />
                          <div className="flex justify-between text-xs text-[#a0a0b8]">
                            <span>{job.progress}%</span>
                            <span>ETA: {job.eta}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-[#a0a0b8]">
                        <div>Strategy: {job.strategy}</div>
                        <div>Started: {job.startTime.toLocaleTimeString()}</div>
                      </div>
                      
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline" className="w-full mt-2 h-6 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Results
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* AI Copilot Tab */}
          <TabsContent value="copilot" className="flex-1 flex flex-col p-3">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-[#00bbff]" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">AI Copilot</h4>
            </div>
            <ExecutionSettings onApply={(p) => {
              try { localStorage.setItem('nexus-exec-preset', JSON.stringify(p)) } catch {}
              alert(`Applied ${p.venue} execution profile to next runs`)
            }} />
            {suggestions && (
              <div className="mb-3 p-2 rounded border border-[#2a2a3e] bg-[#0e111a] text-xs">
                <div className="text-white mb-1">Latest Validation Summary</div>
                <div className="text-[#a0a0b8]">Sharpe {suggestions.summary?.s?.toFixed?.(2)} · Deflated {suggestions.summary?.ds?.toFixed?.(2)} · SPA p {suggestions.summary?.spa?.toFixed?.(3)} · OOS {suggestions.summary?.avgOOSSharpe?.toFixed?.(2)}</div>
                {suggestions.recommend && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" onClick={() => {
                      try { localStorage.setItem('nexus-apply-wizard-params', JSON.stringify(suggestions.recommend)) } catch {}
                      alert('Recommendations queued. Open the Wizard to apply automatically.')
                    }}>Apply to Wizard</Button>
                    <Button size="sm" variant="outline" disabled={isQuickRun} onClick={async () => {
                      setIsQuickRun(true)
                      try {
                        const baseConfig: any = {
                          name: 'Quick Run (AI)',
                          universe: 'US-Top500',
                          startDate: '2022-01-01',
                          endDate: '2024-12-31',
                          strategy: 'ML-Enhanced Momentum',
                          params: { lookback: 60, rebalanceDays: 5, topN: 50, ...(suggestions.recommend || {}) },
                          capital: 1000000,
                          costsBps: 2,
                          slippageBps: 5,
                          riskModel: 'Risk Parity',
                        }
                        const execPresetRaw = localStorage.getItem('nexus-exec-preset')
                        const execPreset = execPresetRaw ? JSON.parse(execPresetRaw) : null
                        const sim = simulateBacktest(execPreset ? { ...baseConfig, ...execPreset } : baseConfig)
                        upsertArtifact(baseConfig, sim, { dataset: baseConfig.universe, seed: 42, tags: ['AI-Recommended'] })
                        alert('Quick run complete. Check Results & Comparisons for output.')
                      } catch (e) {
                        console.error(e)
                        alert('Quick run failed')
                      } finally {
                        setIsQuickRun(false)
                      }
                    }}>Run with Recommendations</Button>
                    <div className="text-[#a0a0b8]">{Object.entries(suggestions.recommend).map(([k,v])=>`${k}=${v}`).join(', ')}</div>
                  </div>
                )}
              </div>
            )}
            
            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={cn(
                    "p-2 rounded-lg text-xs",
                    message.type === 'user' 
                      ? "bg-[#00bbff]/20 border border-[#00bbff]/30 ml-4" 
                      : "bg-[#1a1a25] border border-[#2a2a3e] mr-4"
                  )}>
                    <div className="text-white mb-1">{message.content}</div>
                    <div className="text-[#a0a0b8] text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="h-5 px-2 text-xs"
                            onClick={() => handleChatSubmit(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit(chatInput)}
                placeholder="Ask AI for help..."
                className="flex-1 px-2 py-1 text-xs bg-[#1a1a25] border border-[#2a2a3e] rounded text-white placeholder-[#a0a0b8] focus:border-[#00bbff] focus:outline-none"
              />
              <Button
                size="sm"
                onClick={() => handleChatSubmit(chatInput)}
                className="h-7 w-7 p-0"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="flex-1 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">System Logs</h4>
              <Button size="sm" variant="ghost" className="h-5 px-2 text-xs">
                Clear
              </Button>
            </div>

            <div
              className="flex-1 overflow-y-auto rounded border border-[#2a2a3e]"
              style={{ height: 360 }}
              onScroll={(e) => logsV.setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
              aria-label="System logs list"
            >
              <div style={{ position: 'relative', height: logsV.totalHeight }}>
                {logsV.visibleItems.map((log: any) => (
                  <div key={log.id} style={log.style} className="p-2">
                    <div className="p-2 rounded bg-[#1a1a25] border border-[#2a2a3e]">
                      <div className="flex items-start gap-2">
                        {getLogIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white">{log.message}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#a0a0b8]">
                            <span>{log.timestamp.toLocaleTimeString()}</span>
                            <Badge variant="outline" className="h-4 px-1 text-xs">
                              {log.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="flex-1 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Usage Tracking</h4>
              <div className="text-xs text-[#00bbff] font-mono">
                $12.50 today
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto rounded border border-[#2a2a3e]"
              style={{ height: 360 }}
              onScroll={(e) => usageV.setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
              aria-label="Usage entries list"
            >
              <div style={{ position: 'relative', height: usageV.totalHeight }}>
                {usageV.visibleItems.map((usage: any) => (
                  <div key={usage.id} style={usage.style} className="p-2">
                    <div className="p-2 rounded bg-[#1a1a25] border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white">{usage.action}</span>
                        <span className="text-xs text-[#00bbff] font-mono">${usage.cost}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
                        <span>{usage.timestamp.toLocaleTimeString()}</span>
                        <Badge variant="outline" className="h-4 px-1 text-xs">
                          {usage.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="flex-1 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wide">Pro Tips</h4>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {tips.map((tip) => (
                  <Card key={tip.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-white mb-1">{tip.title}</div>
                          <div className="text-xs text-[#a0a0b8]">{tip.content}</div>
                          <Badge variant="outline" className="h-4 px-1 text-xs mt-2">
                            {tip.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
