"use client"

import React, { useState } from 'react'
import { useAdvancedTheme } from './advanced-theme-provider'
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Settings2, 
  Eye, 
  Type, 
  Zap,
  Check,
  Sparkles,
  Brush,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ThemeCustomizationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemeCustomizationPanel({ isOpen, onClose }: ThemeCustomizationPanelProps) {
  const { 
    currentTheme, 
    setTheme, 
    themes, 
    isDarkMode, 
    toggleDarkMode,
    customization, 
    setCustomization 
  } = useAdvancedTheme()
  
  const [activeTab, setActiveTab] = useState<'themes' | 'customization' | 'presets'>('themes')

  if (!isOpen) return null

  const tabs = [
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'customization', label: 'Customization', icon: Settings2 },
    { id: 'presets', label: 'Presets', icon: Sparkles }
  ]

  const renderThemeSelector = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#00bbff]" />
          Choose Your Theme
        </h3>
        <div className="grid gap-4">
          {themes.map((theme) => (
            <div 
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                hover:scale-105 hover:shadow-lg group
                ${currentTheme.id === theme.id 
                  ? 'border-[#00bbff] shadow-lg shadow-[#00bbff]/20' 
                  : 'border-[#2a2a3e] hover:border-[#3a3a4e]'
                }
              `}
              style={{ backgroundColor: theme.colors.secondary }}
            >
              {currentTheme.id === theme.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00bbff] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: theme.colors.chart.primary, borderColor: theme.colors.border.accent }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: theme.colors.ai.primary, borderColor: theme.colors.border.accent }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: theme.colors.success, borderColor: theme.colors.border.accent }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                    {theme.displayName}
                  </h4>
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {theme.id === 'nexus-dark' && 'Professional dark theme with blue accents'}
                    {theme.id === 'nexus-light' && 'Clean light theme for daytime use'}
                    {theme.id === 'nexus-pro' && 'High-contrast terminal-style theme'}
                  </p>
                </div>
              </div>
              
              {/* Theme preview */}
              <div className="grid grid-cols-3 gap-2 h-20 rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.primary }}>
                <div className="space-y-1 p-2">
                  <div className="h-2 rounded" style={{ backgroundColor: theme.colors.chart.primary }} />
                  <div className="h-2 rounded w-3/4" style={{ backgroundColor: theme.colors.text.secondary }} />
                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: theme.colors.text.muted }} />
                </div>
                <div className="space-y-1 p-2">
                  <div className="h-2 rounded" style={{ backgroundColor: theme.colors.ai.primary }} />
                  <div className="h-2 rounded w-2/3" style={{ backgroundColor: theme.colors.success }} />
                  <div className="h-2 rounded w-3/4" style={{ backgroundColor: theme.colors.text.secondary }} />
                </div>
                <div className="space-y-1 p-2">
                  <div className="h-2 rounded" style={{ backgroundColor: theme.colors.warning }} />
                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: theme.colors.chart.tertiary }} />
                  <div className="h-2 rounded w-3/4" style={{ backgroundColor: theme.colors.text.secondary }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-[#00bbff]" />
          Quick Theme Switch
        </h3>
        <div className="flex gap-3">
          <Button 
            onClick={toggleDarkMode}
            variant={isDarkMode ? "default" : "outline"}
            className="flex-1 flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Dark Mode
          </Button>
          <Button 
            onClick={toggleDarkMode}
            variant={!isDarkMode ? "default" : "outline"}
            className="flex-1 flex items-center gap-2"
          >
            <Sun className="w-4 h-4" />
            Light Mode
          </Button>
        </div>
      </div>
    </div>
  )

  const renderCustomization = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#00bbff]" />
          Accessibility & Performance
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Reduced Motion</p>
                <p className="text-sm text-[#a0a0b8]">Minimize animations for better performance</p>
              </div>
            </div>
            <button
              onClick={() => setCustomization({ reducedMotion: !customization.reducedMotion })}
              className={`
                w-12 h-6 rounded-full transition-all duration-200 relative
                ${customization.reducedMotion ? 'bg-[#00bbff]' : 'bg-[#2a2a3e]'}
              `}
            >
              <div className={`
                w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200
                ${customization.reducedMotion ? 'left-6' : 'left-0.5'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">High Contrast</p>
                <p className="text-sm text-[#a0a0b8]">Enhanced contrast for better visibility</p>
              </div>
            </div>
            <button
              onClick={() => setCustomization({ highContrast: !customization.highContrast })}
              className={`
                w-12 h-6 rounded-full transition-all duration-200 relative
                ${customization.highContrast ? 'bg-[#00bbff]' : 'bg-[#2a2a3e]'}
              `}
            >
              <div className={`
                w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200
                ${customization.highContrast ? 'left-6' : 'left-0.5'}
              `} />
            </button>
          </div>

          <div className="p-3 bg-[#1a1a2e] rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Type className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">Font Size</p>
                <p className="text-sm text-[#a0a0b8]">Adjust text size for better readability</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setCustomization({ fontSize: size as any })}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${customization.fontSize === size 
                      ? 'bg-[#00bbff] text-white' 
                      : 'bg-[#2a2a3e] text-[#a0a0b8] hover:bg-[#3a3a4e]'
                    }
                  `}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPresets = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00bbff]" />
          Theme Presets
        </h3>
        
        <div className="grid gap-4">
          <div 
            onClick={() => {
              setTheme('nexus-dark')
              setCustomization({ reducedMotion: false, highContrast: false, fontSize: 'medium' })
            }}
            className="p-4 bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] hover:border-[#00bbff] cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-3 mb-2">
              <Brush className="w-5 h-5 text-[#00bbff]" />
              <h4 className="font-semibold text-white">Designer Mode</h4>
            </div>
            <p className="text-sm text-[#a0a0b8] mb-3">
              Optimized for visual design work with enhanced contrast and smooth animations
            </p>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-[#00bbff] rounded" />
              <div className="w-4 h-4 bg-[#4a4aff] rounded" />
              <div className="w-4 h-4 bg-[#00ff88] rounded" />
            </div>
          </div>

          <div 
            onClick={() => {
              setTheme('nexus-pro')
              setCustomization({ reducedMotion: true, highContrast: true, fontSize: 'medium' })
            }}
            className="p-4 bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] hover:border-[#00ff88] cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-3 mb-2">
              <Monitor className="w-5 h-5 text-[#00ff88]" />
              <h4 className="font-semibold text-white">Terminal Mode</h4>
            </div>
            <p className="text-sm text-[#a0a0b8] mb-3">
              High-contrast terminal-style theme for focused trading analysis
            </p>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-[#00ff88] rounded" />
              <div className="w-4 h-4 bg-[#00ffff] rounded" />
              <div className="w-4 h-4 bg-[#ffff00] rounded" />
            </div>
          </div>

          <div 
            onClick={() => {
              setTheme('nexus-light')
              setCustomization({ reducedMotion: false, highContrast: false, fontSize: 'large' })
            }}
            className="p-4 bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] hover:border-[#0ea5e9] cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#0ea5e9]" />
              <h4 className="font-semibold text-white">Presentation Mode</h4>
            </div>
            <p className="text-sm text-[#a0a0b8] mb-3">
              Light theme with larger fonts, perfect for presentations and demos
            </p>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-[#0ea5e9] rounded" />
              <div className="w-4 h-4 bg-[#3b82f6] rounded" />
              <div className="w-4 h-4 bg-[#10b981] rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-[#0f1320] border-[#2a2a3e] shadow-2xl">
        <CardHeader className="border-b border-[#2a2a3e] pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00bbff] to-[#4a4aff] rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              Theme Customization
            </CardTitle>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="text-[#a0a0b8] hover:text-white"
            >
              ✕
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 bg-[#1a1a2e] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-[#00bbff] text-white' 
                    : 'text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e]'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'themes' && renderThemeSelector()}
          {activeTab === 'customization' && renderCustomization()}
          {activeTab === 'presets' && renderPresets()}
        </CardContent>
      </Card>
    </div>
  )
}

