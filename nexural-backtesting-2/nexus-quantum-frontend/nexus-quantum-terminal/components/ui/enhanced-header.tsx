"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EnhancedButton } from "./micro-interactions"
import { 
  Settings, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  Palette,
  Bell,
  Search,
  Command,
  User,
  LogOut,
  ChevronDown,
  DollarSign,
  Cloud,
  CloudOff
} from 'lucide-react'
import { NotificationCenter, ThemeSwitcher, HelpSystem, SoundSystem } from './enhanced-ui'
import { useUsageMeter } from '@/hooks/use-usage'

interface EnhancedHeaderProps {
  onSettingsClick: () => void
  showSettings: boolean
  onRunBacktest?: () => void
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  onSettingsClick, 
  showSettings,
  onRunBacktest
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { SoundControls } = SoundSystem()
  const { totals } = useUsageMeter()
  const [budgetDaily, setBudgetDaily] = useState<number>(10)
  const [budgetMonthly, setBudgetMonthly] = useState<number>(200)
  const [serverSyncEnabled, setServerSyncEnabled] = useState<boolean>(false)
  
  useEffect(() => {
    try {
      const bd = Number(typeof window !== 'undefined' ? localStorage.getItem('nexus-budget-daily') : '')
      const bm = Number(typeof window !== 'undefined' ? localStorage.getItem('nexus-budget-monthly') : '')
      // Default from env when not set in localStorage
      const envDefault = (process.env.NEXT_PUBLIC_SERVER_SYNC_DEFAULT === 'true')
      const sync = typeof window !== 'undefined'
        ? (localStorage.getItem('nexus-server-sync') == null ? envDefault : localStorage.getItem('nexus-server-sync') === 'true')
        : envDefault
      if (Number.isFinite(bd)) setBudgetDaily(bd)
      if (Number.isFinite(bm)) setBudgetMonthly(bm)
      setServerSyncEnabled(sync)
    } catch {}
  }, [])

  // Usage / Spend tracking (Today + Month-To-Date)
  const { events } = useUsageMeter()
  const { todayCost, monthCost } = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    let t = 0
    let m = 0
    for (const ev of events) {
      if (ev.createdAt >= startOfDay) t += ev.cost
      if (ev.createdAt >= startOfMonth) m += ev.cost
    }
    return { todayCost: Number(t.toFixed(2)), monthCost: Number(m.toFixed(2)) }
  }, [events])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Server sync toggle
  const toggleServerSync = () => {
    const newValue = !serverSyncEnabled
    setServerSyncEnabled(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus-server-sync', newValue.toString())
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case 'F':
            e.preventDefault()
            toggleFullscreen()
            break
          case 'H':
            e.preventDefault()
            setShowHelpPanel(true)
            break
          case 'T':
            e.preventDefault()
            setShowThemePanel(true)
            break
          case 'K':
            e.preventDefault()
            setShowSearch(true)
            break
        }
      }
      
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowHelpPanel(false)
        setShowThemePanel(false)
        setShowUserMenu(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 🧠 Enhanced Smart Navigation Commands
  const searchCommands = [
    // 🏠 Overview Section - Portfolio Management
    { name: '🏠 Show Portfolio Performance', keywords: 'portfolio performance overview how am i doing', action: () => console.log('Navigate to overview/performance-overview') },
    { name: '📊 Portfolio Dashboard', keywords: 'portfolio dashboard positions holdings', action: () => console.log('Navigate to overview/portfolio-dashboard') },
    { name: '📡 Live Portfolio Monitoring', keywords: 'live monitoring real-time tracking', action: () => console.log('Navigate to overview/live-monitoring') },
    { name: '⚡ Live Trading Interface', keywords: 'live trading trade execute orders', action: () => console.log('Navigate to overview/live-trading') },
    { name: '📋 Order Management', keywords: 'orders order management execution', action: () => console.log('Navigate to overview/order-management') },
    { name: '⚠️ Risk Management & Analysis', keywords: 'risk management var exposure drawdown', action: () => console.log('Navigate to overview/risk-management') },
    
    // 🧪 Strategy Workbench - Strategy Development
    { name: '🔬 Strategy Lab & Builder', keywords: 'strategy lab builder create develop', action: () => console.log('Navigate to strategy-workbench/strategy-lab') },
    { name: '🤖 AI Strategy Generator', keywords: 'ai strategy generator create code generate build', action: () => console.log('Navigate to strategy-workbench/ai-strategy-generator') },
    { name: '🎛️ Interactive Strategy Optimizer', keywords: 'optimize strategy parameters tune test interactive', action: () => console.log('Navigate to strategy-workbench/interactive-optimizer') },
    { name: '📊 Advanced Technical Indicators', keywords: 'indicators technical analysis custom ta', action: () => console.log('Navigate to strategy-workbench/advanced-indicators') },
    { name: '🧠 ML Factory & Models', keywords: 'machine learning ml models ai factory prediction', action: () => console.log('Navigate to strategy-workbench/ml-factory') },
    { name: '🧪 Backtesting Engine', keywords: 'backtest testing historical test strategy', action: () => console.log('Navigate to strategy-workbench/backtesting-engine') },
    { name: '🎯 Backtest Wizard', keywords: 'backtest wizard guided testing', action: () => console.log('Navigate to strategy-workbench/backtest-wizard') },
    { name: '📊 Strategy Results Comparison', keywords: 'results comparison compare strategies', action: () => console.log('Navigate to strategy-workbench/results-comparison') },
    { name: '🎲 Monte Carlo Analysis', keywords: 'monte carlo simulation risk scenarios', action: () => console.log('Navigate to strategy-workbench/monte-carlo') },
    
    // 📈 Market Intelligence - Market Analysis
    { name: '📡 Live Market Data Feed', keywords: 'market data live feed real-time', action: () => console.log('Navigate to market-intelligence/market-data-feed') },
    { name: '🔬 Market Microstructure', keywords: 'microstructure order flow dark pools', action: () => console.log('Navigate to market-intelligence/market-microstructure') },
    { name: '🏭 Sector Analysis & Rotation', keywords: 'sector analysis rotation sectors', action: () => console.log('Navigate to market-intelligence/sector-analysis') },
    { name: '📊 Options Analytics & Greeks', keywords: 'options analytics greeks volatility surface', action: () => console.log('Navigate to market-intelligence/options-analytics') },
    { name: '🌊 Volatility Trading Tools', keywords: 'volatility trading vol vix', action: () => console.log('Navigate to market-intelligence/vol-trading') },
    { name: '🛰️ Alternative Data Sources', keywords: 'alternative data satellite social sentiment', action: () => console.log('Navigate to market-intelligence/alternative-data') },
    
    // 🔬 Research Lab - Advanced Research
    { name: '📓 Research Notebooks', keywords: 'research notebooks jupyter analysis', action: () => console.log('Navigate to research-lab/research-notebooks') },
    { name: '📊 Statistical Analysis Tools', keywords: 'statistical analysis hypothesis testing', action: () => console.log('Navigate to research-lab/statistical-analysis') },
    { name: '🔗 Correlation & Factor Analysis', keywords: 'correlation factor analysis attribution', action: () => console.log('Navigate to research-lab/correlation-analysis') },
    { name: '⚙️ System Settings & Configuration', keywords: 'settings system admin configuration', action: () => console.log('Navigate to research-lab/system-settings') },
    { name: '🔌 API Management & Integrations', keywords: 'api management integrations external', action: () => console.log('Navigate to research-lab/api-management') },
    
    // Quick Actions
    { name: '📤 Export Data & Reports', keywords: 'export data csv png pdf reports', action: () => console.log('Export data') },
    { name: '🔄 Toggle Terminal Panel', keywords: 'terminal toggle show hide', action: () => console.log('Toggle terminal') },
    { name: '💡 Show Help & Documentation', keywords: 'help documentation guide tutorial', action: () => setShowHelpPanel(true) },
  ]

  // 🧠 Smart Search with Natural Language Understanding
  const getSmartFilteredCommands = () => {
    if (!searchQuery.trim()) return searchCommands.slice(0, 8) // Show top 8 by default
    
    const query = searchQuery.toLowerCase()
    
    // Natural language matching
    return searchCommands.filter(cmd => {
      const nameMatch = cmd.name.toLowerCase().includes(query)
      const keywordMatch = cmd.keywords.toLowerCase().includes(query)
      
      // Smart synonym matching
      const synonyms = {
        'portfolio': 'performance overview holdings positions',
        'strategy': 'backtest test optimize tune create',
        'chart': 'graph visualization plot analysis',
        'risk': 'exposure var drawdown volatility',
        'market': 'data feed live real-time intelligence',
        'ai': 'artificial intelligence ml machine learning',
        'options': 'derivatives greeks volatility surface'
      }
      
      let synonymMatch = false
      Object.entries(synonyms).forEach(([key, values]) => {
        if (query.includes(key) && values.includes(cmd.keywords.toLowerCase())) {
          synonymMatch = true
        }
      })
      
      return nameMatch || keywordMatch || synonymMatch
    }).slice(0, 10)
  }

  const filteredCommands = getSmartFilteredCommands()

  return (
    <>
      <div className="h-14 bg-[#15151f] border-b border-[#2a2a3e] flex items-center justify-between px-6 relative" data-testid="enhanced-header">
        {/* Left side - Logo and branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#00bbff] to-[#4a4aff] bg-clip-text text-transparent">
                NexusQuant
              </span>
              <div className="text-xs text-[#a0a0b8]">Institutional Trading Terminal</div>
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30 animate-pulse">
            Live
          </Badge>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-2 md:mx-8">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowSearch(true)}
              className="w-full justify-start text-[#a0a0b8] border-[#2a2a3e] hover:border-[#00bbff]/50 overflow-hidden"
            >
              <Search className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate min-w-0">
                {/* Responsive text - shorter on mobile */}
                <span className="hidden sm:inline">🧠 Smart Navigation: 'Show portfolio' | 'Test strategy' | 'Create code'</span>
                <span className="sm:hidden">🧠 Smart Navigation</span>
              </span>
              <Badge variant="outline" className="ml-auto text-xs flex-shrink-0 hidden sm:inline-flex">
                Ctrl+Shift+K
              </Badge>
            </Button>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          <SoundControls />

          {/* Persistent Spend/Usage Meter */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg border border-[#2a2a3e] bg-[#0e111a] shadow-sm cursor-pointer"
            title={`Spend Today: $${todayCost.toFixed(2)} • Month-to-Date: $${monthCost.toFixed(2)}`}
            onClick={() => {
              const d = prompt('Daily budget ($)', String(budgetDaily))
              const m = prompt('Monthly budget ($)', String(budgetMonthly))
              const nd = Number(d); const nm = Number(m)
              if (Number.isFinite(nd)) { setBudgetDaily(nd); try { localStorage.setItem('nexus-budget-daily', String(nd)) } catch {} }
              if (Number.isFinite(nm)) { setBudgetMonthly(nm); try { localStorage.setItem('nexus-budget-monthly', String(nm)) } catch {} }
            }}
          >
            <DollarSign className="w-3 h-3 text-[#00bbff]" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white">${todayCost.toFixed(2)}</span>
              <span className="text-[#a0a0b8]">today</span>
              <span className="text-[#2a2a3e]">|</span>
              <span className="text-white">${monthCost.toFixed(2)}</span>
              <span className="text-[#a0a0b8]">MTD</span>
              {(todayCost >= budgetDaily || monthCost >= budgetMonthly) && (
                <span className="ml-2 px-1 rounded bg-red-500/20 text-red-400">Budget!</span>
              )}
            </div>
          </div>

          {/* Server Sync Toggle */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-[#2a2a3e] bg-[#0e111a] shadow-sm" role="group" aria-label="Server synchronization">
            {serverSyncEnabled ? <Cloud className="w-3 h-3 text-green-400" /> : <CloudOff className="w-3 h-3 text-[#a0a0b8]" />}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#a0a0b8]">Server Sync</span>
              <button
                onClick={toggleServerSync}
                className={`w-8 h-4 rounded-full transition-colors ${
                  serverSyncEnabled ? 'bg-[#00bbff]' : 'bg-[#2a2a3e]'
                } relative`}
                role="switch"
                aria-checked={serverSyncEnabled}
                aria-label="Toggle server synchronization"
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                    serverSyncEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
          {/* Sync toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const cur = typeof window !== 'undefined' ? localStorage.getItem('nexus-sync-server') === 'true' : false
              const next = !cur
              localStorage.setItem('nexus-sync-server', String(next))
              alert(`Server sync ${next ? 'enabled' : 'disabled'}`)
            }}
            title="Toggle server artifact sync"
          >
            Sync
          </Button>
          
          {/* Global Run Backtest CTA */}
          <Button
            size="sm"
            onClick={onRunBacktest}
            className="bg-[#00bbff] hover:bg-[#0099dd] text-white"
            title="Run Backtest"
          >
            <Command className="w-4 h-4 mr-1" /> Run Backtest
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThemePanel(!showThemePanel)}
            title="Theme Settings"
          >
            <Palette className="w-4 h-4" />
          </Button>

          <NotificationCenter />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelpPanel(!showHelpPanel)}
            title="Help (Ctrl+Shift+H)"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (Ctrl+Shift+F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className={showSettings ? "bg-[#2a2a3e]" : ""}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-[#00bbff] to-[#4a4aff] rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0e111a] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
                <div className="p-3 border-b border-[#2a2a3e]">
                  <div className="text-sm font-medium text-white">Trading User</div>
                  <div className="text-xs text-[#a0a0b8]">trader@nexusquant.com</div>
                </div>
                <div className="p-2">
                  <Button 
                    onClick={() => {
                      console.log('Profile clicked')
                      alert('Opening user profile...')
                    }}
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Preferences clicked')
                      alert('Opening user preferences...')
                    }}
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Sign Out clicked')
                      alert('Signing out...')
                    }}
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Panel */}
        {showThemePanel && (
          <div className="absolute right-6 top-full mt-2 w-80 bg-[#0e111a] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
            <div className="p-3 border-b border-[#2a2a3e]">
              <h3 className="text-sm font-semibold text-white">Appearance</h3>
            </div>
            <ThemeSwitcher />
          </div>
        )}

        {/* Help Panel */}
        {showHelpPanel && (
          <div className="absolute right-6 top-full mt-2 w-96 bg-[#0e111a] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
            <div className="p-3 border-b border-[#2a2a3e] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Help & Documentation</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpPanel(false)}
              >
                ×
              </Button>
            </div>
            <HelpSystem />
          </div>
        )}
      </div>

      {/* Command Palette */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50">
          <div className="w-full max-w-lg bg-[#0e111a] border border-[#2a2a3e] rounded-lg shadow-2xl">
            <div className="p-4 border-b border-[#2a2a3e]">
              <div className="flex items-center gap-3">
                <Command className="w-4 h-4 text-[#a0a0b8]" />
                <input
                  type="text"
                  placeholder="🧠 Smart Search: 'Show portfolio' | 'Test RSI strategy' | 'Options analytics' | 'ML models'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-[#a0a0b8] outline-none"
                  autoFocus
                />
                <Badge variant="outline" className="text-xs">
                  ESC
                </Badge>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-4 text-center text-[#a0a0b8] text-sm">
                  <div className="mb-2">💡 Try these examples:</div>
                  <div className="space-y-1 text-xs">
                    <div>"Show portfolio" → Portfolio performance overview</div>
                    <div>"Test strategy" → Strategy optimization tools</div>
                    <div>"Options analytics" → Advanced options analysis</div>
                    <div>"Machine learning" → ML model training</div>
                  </div>
                </div>
              ) : (
                <>
                  {searchQuery.trim() && (
                    <div className="p-3 bg-[#1a1a25] border-b border-[#2a2a3e]">
                      <div className="text-xs text-[#a0a0b8] mb-1">🧠 Smart Search Results for "{searchQuery}"</div>
                      <div className="text-xs text-blue-400">{filteredCommands.length} feature{filteredCommands.length !== 1 ? 's' : ''} found</div>
                    </div>
                  )}
                  {filteredCommands.map((command, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        command.action()
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="w-full p-3 text-left hover:bg-[#2a2a3e] transition-colors border-b border-[#2a2a3e]/50 last:border-b-0"
                    >
                      <div className="text-sm text-white">{command.name}</div>
                      <div className="text-xs text-[#a0a0b8] mt-1">{command.keywords.split(' ').slice(0, 4).join(' • ')}</div>
                    </button>
                  ))}
                  {!searchQuery.trim() && (
                    <div className="p-3 border-t border-[#2a2a3e] bg-[#0f1320]">
                      <div className="text-xs text-[#a0a0b8] text-center">
                        💡 Type naturally: "Show my portfolio" or "Test RSI strategy"
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EnhancedHeader
