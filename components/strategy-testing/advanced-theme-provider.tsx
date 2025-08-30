"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Advanced Theme System - Phase 2 Enhancement
export interface Theme {
  id: string
  name: string
  displayName: string
  colors: {
    // Background colors
    primary: string
    secondary: string
    tertiary: string
    
    // Text colors
    text: {
      primary: string
      secondary: string
      accent: string
      muted: string
    }
    
    // Border and accent colors
    border: {
      primary: string
      secondary: string
      accent: string
    }
    
    // Status colors
    success: string
    warning: string
    error: string
    info: string
    
    // Chart colors
    chart: {
      primary: string
      secondary: string
      tertiary: string
      grid: string
      axis: string
      tooltip: string
    }
    
    // AI and interactive colors
    ai: {
      primary: string
      secondary: string
      glow: string
    }
    
    // Gradients
    gradients: {
      primary: string
      secondary: string
      accent: string
    }
  }
  
  // Advanced styling options
  effects: {
    blur: string
    shadow: string
    glow: string
    borderRadius: string
  }
  
  // Animation preferences
  animations: {
    duration: string
    easing: string
    reduced: boolean
  }
}

// Predefined themes
export const themes: Theme[] = [
  {
    id: 'nexus-dark',
    name: 'nexus-dark',
    displayName: 'Nexus Dark',
    colors: {
      primary: '#0f1320',
      secondary: '#1a1a2e',
      tertiary: '#15151f',
      text: {
        primary: '#ffffff',
        secondary: '#a0a0b8',
        accent: '#00bbff',
        muted: '#606078'
      },
      border: {
        primary: '#2a2a3e',
        secondary: '#3a3a4e',
        accent: '#00bbff'
      },
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff6b6b',
      info: '#00bbff',
      chart: {
        primary: '#00bbff',
        secondary: '#4a4aff',
        tertiary: '#00ff88',
        grid: '#2a2a3e',
        axis: '#3a3a4e',
        tooltip: '#1a1a2e'
      },
      ai: {
        primary: '#4ecdc4',
        secondary: '#44a08d',
        glow: 'rgba(78, 205, 196, 0.3)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00bbff 0%, #4a4aff 100%)',
        secondary: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
        accent: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)'
      }
    },
    effects: {
      blur: 'backdrop-blur-sm',
      shadow: 'drop-shadow-lg',
      glow: '0 0 20px rgba(0, 187, 255, 0.3)',
      borderRadius: '0.75rem'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reduced: false
    }
  },
  {
    id: 'nexus-light',
    name: 'nexus-light',
    displayName: 'Nexus Light',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
        accent: '#0ea5e9',
        muted: '#94a3b8'
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        accent: '#0ea5e9'
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      chart: {
        primary: '#0ea5e9',
        secondary: '#3b82f6',
        tertiary: '#10b981',
        grid: '#e2e8f0',
        axis: '#cbd5e1',
        tooltip: '#f8fafc'
      },
      ai: {
        primary: '#06b6d4',
        secondary: '#0891b2',
        glow: 'rgba(6, 182, 212, 0.3)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        secondary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        accent: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)'
      }
    },
    effects: {
      blur: 'backdrop-blur-sm',
      shadow: 'drop-shadow-lg',
      glow: '0 0 20px rgba(14, 165, 233, 0.3)',
      borderRadius: '0.75rem'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reduced: false
    }
  },
  {
    id: 'nexus-pro',
    name: 'nexus-pro',
    displayName: 'Nexus Pro',
    colors: {
      primary: '#000000',
      secondary: '#111111',
      tertiary: '#1a1a1a',
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        accent: '#00ff00',
        muted: '#888888'
      },
      border: {
        primary: '#333333',
        secondary: '#444444',
        accent: '#00ff00'
      },
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0040',
      info: '#00ffff',
      chart: {
        primary: '#00ff00',
        secondary: '#00ffff',
        tertiary: '#ffff00',
        grid: '#333333',
        axis: '#444444',
        tooltip: '#111111'
      },
      ai: {
        primary: '#00ff88',
        secondary: '#00cc66',
        glow: 'rgba(0, 255, 136, 0.4)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00ff00 0%, #00ffff 100%)',
        secondary: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
        accent: 'linear-gradient(135deg, #ff0040 0%, #ffff00 100%)'
      }
    },
    effects: {
      blur: 'backdrop-blur-md',
      shadow: 'drop-shadow-xl',
      glow: '0 0 30px rgba(0, 255, 0, 0.4)',
      borderRadius: '0.5rem'
    },
    animations: {
      duration: '150ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      reduced: false
    }
  }
]

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
  isDarkMode: boolean
  toggleDarkMode: () => void
  customization: {
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
  setCustomization: (customization: Partial<ThemeContextType['customization']>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface AdvancedThemeProviderProps {
  children: React.ReactNode
}

export function AdvancedThemeProvider({ children }: AdvancedThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [customization, setCustomizationState] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const
  })

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('nexus-theme')
    const savedCustomization = localStorage.getItem('nexus-customization')
    
    if (savedThemeId) {
      const theme = themes.find(t => t.id === savedThemeId)
      if (theme) {
        setCurrentTheme(theme)
      }
    }
    
    if (savedCustomization) {
      try {
        const parsed = JSON.parse(savedCustomization)
        setCustomizationState(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Failed to parse saved customization')
      }
    }

    // Check for system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCustomizationState(prev => ({ ...prev, reducedMotion: true }))
    }
  }, [])

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement
    const theme = currentTheme

    // Set CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-tertiary', theme.colors.tertiary)
    
    root.style.setProperty('--text-primary', theme.colors.text.primary)
    root.style.setProperty('--text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--text-accent', theme.colors.text.accent)
    root.style.setProperty('--text-muted', theme.colors.text.muted)
    
    root.style.setProperty('--border-primary', theme.colors.border.primary)
    root.style.setProperty('--border-secondary', theme.colors.border.secondary)
    root.style.setProperty('--border-accent', theme.colors.border.accent)
    
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-error', theme.colors.error)
    root.style.setProperty('--color-info', theme.colors.info)
    
    root.style.setProperty('--chart-primary', theme.colors.chart.primary)
    root.style.setProperty('--chart-secondary', theme.colors.chart.secondary)
    root.style.setProperty('--chart-tertiary', theme.colors.chart.tertiary)
    root.style.setProperty('--chart-grid', theme.colors.chart.grid)
    root.style.setProperty('--chart-axis', theme.colors.chart.axis)
    
    root.style.setProperty('--ai-primary', theme.colors.ai.primary)
    root.style.setProperty('--ai-secondary', theme.colors.ai.secondary)
    root.style.setProperty('--ai-glow', theme.colors.ai.glow)
    
    root.style.setProperty('--gradient-primary', theme.colors.gradients.primary)
    root.style.setProperty('--gradient-secondary', theme.colors.gradients.secondary)
    root.style.setProperty('--gradient-accent', theme.colors.gradients.accent)
    
    root.style.setProperty('--effect-blur', theme.effects.blur)
    root.style.setProperty('--effect-shadow', theme.effects.shadow)
    root.style.setProperty('--effect-glow', theme.effects.glow)
    root.style.setProperty('--border-radius', theme.effects.borderRadius)
    
    root.style.setProperty('--animation-duration', customization.reducedMotion ? '0ms' : theme.animations.duration)
    root.style.setProperty('--animation-easing', theme.animations.easing)

    // Apply customization classes
    root.classList.toggle('reduce-motion', customization.reducedMotion)
    root.classList.toggle('high-contrast', customization.highContrast)
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${customization.fontSize}`)
  }, [currentTheme, customization])

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      localStorage.setItem('nexus-theme', themeId)
    }
  }

  const toggleDarkMode = () => {
    const isDark = currentTheme.id.includes('dark') || currentTheme.id === 'nexus-pro'
    setTheme(isDark ? 'nexus-light' : 'nexus-dark')
  }

  const setCustomization = (updates: Partial<ThemeContextType['customization']>) => {
    const newCustomization = { ...customization, ...updates }
    setCustomizationState(newCustomization)
    localStorage.setItem('nexus-customization', JSON.stringify(newCustomization))
  }

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
    isDarkMode: currentTheme.id.includes('dark') || currentTheme.id === 'nexus-pro',
    toggleDarkMode,
    customization,
    setCustomization
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAdvancedTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider')
  }
  return context
}

// Theme utility functions
export const getThemeColor = (theme: Theme, path: string): string => {
  const keys = path.split('.')
  let current: any = theme.colors
  
  for (const key of keys) {
    current = current[key]
    if (!current) return theme.colors.text.primary
  }
  
  return current
}

export const applyThemeTransition = (element: HTMLElement, property: string, value: string) => {
  element.style.transition = `${property} 200ms cubic-bezier(0.4, 0, 0.2, 1)`
  element.style.setProperty(property, value)
}

