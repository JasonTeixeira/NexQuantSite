"use client"

import React, { useState, useEffect } from 'react'
import { 
  Keyboard, 
  Command, 
  X, 
  Search, 
  Settings, 
  TrendingUp, 
  BarChart3, 
  Brain,
  Zap,
  Filter,
  Copy,
  Download,
  RefreshCw,
  ChevronRight,
  Star,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  category: 'navigation' | 'actions' | 'editing' | 'system' | 'ai'
  icon?: React.ComponentType<any>
  available?: boolean
}

const keyboardShortcuts: KeyboardShortcut[] = [
  // Navigation shortcuts
  {
    id: 'nav-dashboard',
    keys: ['⌘', '1'],
    description: 'Go to Dashboard',
    category: 'navigation',
    icon: BarChart3,
    available: true
  },
  {
    id: 'nav-testing',
    keys: ['⌘', '2'],
    description: 'Go to Testing Lab',
    category: 'navigation',
    icon: Zap,
    available: true
  },
  {
    id: 'nav-analytics',
    keys: ['⌘', '3'],
    description: 'Go to Analytics',
    category: 'navigation',
    icon: TrendingUp,
    available: true
  },
  {
    id: 'nav-ai',
    keys: ['⌘', '4'],
    description: 'Go to AI Assistant',
    category: 'navigation',
    icon: Brain,
    available: true
  },
  {
    id: 'nav-settings',
    keys: ['⌘', '5'],
    description: 'Go to Settings',
    category: 'navigation',
    icon: Settings,
    available: true
  },
  
  // Action shortcuts
  {
    id: 'search',
    keys: ['⌘', 'K'],
    description: 'Open Advanced Search',
    category: 'actions',
    icon: Search,
    available: true
  },
  {
    id: 'ai-assistant',
    keys: ['⌘', 'J'],
    description: 'Toggle AI Assistant',
    category: 'ai',
    icon: Brain,
    available: true
  },
  {
    id: 'chart-customization',
    keys: ['⌘', 'H'],
    description: 'Open Chart Customization',
    category: 'actions',
    icon: BarChart3,
    available: true
  },
  {
    id: 'dashboard-personalization',
    keys: ['⌘', 'D'],
    description: 'Personalize Dashboard',
    category: 'actions',
    icon: Settings,
    available: true
  },
  {
    id: 'advanced-export',
    keys: ['⌘', 'E'],
    description: 'Advanced Export System',
    category: 'actions',
    icon: Download,
    available: true
  },
  {
    id: 'shortcuts',
    keys: ['⌘', '/'],
    description: 'Show Keyboard Shortcuts',
    category: 'system',
    icon: Keyboard,
    available: true
  },
  {
    id: 'theme-toggle',
    keys: ['⌘', 'T'],
    description: 'Toggle Theme Panel',
    category: 'system',
    icon: Settings,
    available: true
  },
  
  // Quick actions
  {
    id: 'quick-backtest',
    keys: ['⌘', 'B'],
    description: 'Run Quick Backtest',
    category: 'actions',
    icon: Zap,
    available: true
  },
  {
    id: 'performance',
    keys: ['⌘', 'P'],
    description: 'View Performance',
    category: 'actions',
    icon: TrendingUp,
    available: true
  },
  {
    id: 'risk-monitor',
    keys: ['⌘', 'R'],
    description: 'Open Risk Monitor',
    category: 'actions',
    icon: Filter,
    available: true
  },
  
  // System shortcuts
  {
    id: 'refresh',
    keys: ['⌘', 'R'],
    description: 'Refresh Data',
    category: 'system',
    icon: RefreshCw,
    available: true
  },
  {
    id: 'copy',
    keys: ['⌘', 'C'],
    description: 'Copy Current View',
    category: 'editing',
    icon: Copy,
    available: true
  },
  {
    id: 'export',
    keys: ['⌘', 'E'],
    description: 'Export Current Data',
    category: 'actions',
    icon: Download,
    available: true
  },
  {
    id: 'save',
    keys: ['⌘', 'S'],
    description: 'Save Current Settings',
    category: 'editing',
    icon: Star,
    available: true
  },
  
  // AI shortcuts
  {
    id: 'ai-analyze',
    keys: ['⌘', 'A'],
    description: 'AI Quick Analysis',
    category: 'ai',
    icon: Brain,
    available: true
  },
  {
    id: 'ai-suggest',
    keys: ['⌘', 'I'],
    description: 'AI Suggestions',
    category: 'ai',
    icon: Brain,
    available: true
  },
  
  // Editing shortcuts
  {
    id: 'undo',
    keys: ['⌘', 'Z'],
    description: 'Undo Last Action',
    category: 'editing',
    icon: RefreshCw,
    available: true
  },
  {
    id: 'redo',
    keys: ['⌘', 'Y'],
    description: 'Redo Last Action',
    category: 'editing',
    icon: RefreshCw,
    available: true
  }
]

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])
  
  const categories = [
    { id: 'all', label: 'All Shortcuts', icon: Keyboard },
    { id: 'navigation', label: 'Navigation', icon: ChevronRight },
    { id: 'actions', label: 'Quick Actions', icon: Zap },
    { id: 'ai', label: 'AI Features', icon: Brain },
    { id: 'editing', label: 'Editing', icon: Copy },
    { id: 'system', label: 'System', icon: Settings }
  ]
  
  const filteredShortcuts = keyboardShortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.keys.join('').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory
    return matchesSearch && matchesCategory && shortcut.available
  })
  
  const groupedShortcuts = categories.reduce((acc, category) => {
    if (category.id === 'all') return acc
    
    const categoryShortcuts = filteredShortcuts.filter(s => s.category === category.id)
    if (categoryShortcuts.length > 0) {
      acc[category.id] = {
        label: category.label,
        icon: category.icon,
        shortcuts: categoryShortcuts
      }
    }
    return acc
  }, {} as Record<string, { label: string; icon: React.ComponentType<any>; shortcuts: KeyboardShortcut[] }>)
  
  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index} className="inline-flex items-center">
        <kbd className="px-2 py-1 bg-[#2a2a3e] border border-[#3a3a4e] rounded text-xs font-mono text-white min-w-[24px] text-center">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1 text-[#606078]">+</span>}
      </span>
    ))
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-[#0f1320] border-[#2a2a3e] shadow-2xl">
        <CardHeader className="border-b border-[#2a2a3e] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              Keyboard Shortcuts
              <span className="text-sm font-normal text-[#a0a0b8]">
                ({filteredShortcuts.length} shortcuts)
              </span>
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-[#a0a0b8] hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#606078]" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-white placeholder-[#606078] focus:outline-none focus:border-[#00bbff] focus:ring-1 focus:ring-[#00bbff]"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-[#00bbff] text-white'
                      : 'bg-[#1a1a2e] text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e]'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedCategory === 'all' ? (
            // Show all shortcuts grouped by category
            <div className="space-y-8">
              {Object.entries(groupedShortcuts).map(([categoryId, categoryData]) => (
                <div key={categoryId}>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <categoryData.icon className="w-5 h-5 text-[#00bbff]" />
                    {categoryData.label}
                  </h3>
                  <div className="grid gap-3">
                    {categoryData.shortcuts.map((shortcut) => {
                      const IconComponent = shortcut.icon || Info
                      return (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2a2a3e] rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-[#00bbff]" />
                            </div>
                            <span className="text-white font-medium">{shortcut.description}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {formatKeys(shortcut.keys)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show shortcuts for selected category
            <div className="grid gap-3">
              {filteredShortcuts.map((shortcut) => {
                const IconComponent = shortcut.icon || Info
                return (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2a2a3e] rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-[#00bbff]" />
                      </div>
                      <div>
                        <span className="text-white font-medium block">{shortcut.description}</span>
                        <span className="text-xs text-[#a0a0b8] capitalize">{shortcut.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {formatKeys(shortcut.keys)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12">
              <Keyboard className="w-16 h-16 text-[#3a3a4e] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No shortcuts found</h3>
              <p className="text-[#a0a0b8]">
                {searchQuery 
                  ? `No shortcuts match "${searchQuery}"`
                  : `No shortcuts available in ${categories.find(c => c.id === selectedCategory)?.label}`
                }
              </p>
            </div>
          )}
        </CardContent>
        
        {/* Footer */}
        <div className="border-t border-[#2a2a3e] p-4">
          <div className="flex items-center justify-between text-sm text-[#606078]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                Command key shortcuts
              </span>
              <span>Press ESC to close</span>
            </div>
            <div className="text-right">
              <span className="text-[#00bbff]">Tip:</span> Hold ⌘ and try any number key!
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
