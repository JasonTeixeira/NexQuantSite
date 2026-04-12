"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { tradingColors, semanticColors, colorUtils } from "@/lib/theme/colors"

interface ThemeContextType {
  theme: 'dark' | 'light'
  colors: typeof tradingColors
  semantic: typeof semanticColors
  utils: typeof colorUtils
  setTheme: (theme: 'dark' | 'light') => void
  isProfessionalMode: boolean
  setProfessionalMode: (enabled: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const useProfessionalTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useProfessionalTheme must be used within ProfessionalThemeProvider')
  }
  return context
}

interface ProfessionalThemeProviderProps {
  children: React.ReactNode
}

export function ProfessionalThemeProvider({ children }: ProfessionalThemeProviderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isProfessionalMode, setProfessionalMode] = useState(true)

  useEffect(() => {
    // Apply CSS custom properties for dynamic theming
    const root = document.documentElement

    if (isProfessionalMode) {
      // Professional Trading Theme
      root.style.setProperty('--color-primary', tradingColors.primary[500])
      root.style.setProperty('--color-primary-foreground', '#ffffff')
      
      // Background colors
      root.style.setProperty('--color-background', tradingColors.background.primary)
      root.style.setProperty('--color-card', tradingColors.background.tertiary)
      root.style.setProperty('--color-elevated', tradingColors.background.elevated)
      
      // Market colors
      root.style.setProperty('--color-bullish', tradingColors.market.bullish)
      root.style.setProperty('--color-bearish', tradingColors.market.bearish)
      root.style.setProperty('--color-neutral', tradingColors.market.neutral)
      
      // Text colors
      root.style.setProperty('--color-text-primary', tradingColors.text.primary)
      root.style.setProperty('--color-text-secondary', tradingColors.text.secondary)
      root.style.setProperty('--color-text-muted', tradingColors.text.muted)
      
      // Border colors
      root.style.setProperty('--color-border', tradingColors.border.primary)
      root.style.setProperty('--color-border-accent', tradingColors.border.accent)
      
      // Add glass morphism effect
      root.style.setProperty('--glass-bg', tradingColors.background.glass)
      root.style.setProperty('--glass-border', colorUtils.hexToRgba('#ffffff', 0.1))
      
      // Professional shadows
      root.style.setProperty('--shadow-professional', '0 8px 32px rgba(0, 0, 0, 0.4)')
      root.style.setProperty('--shadow-elevated', '0 4px 16px rgba(0, 0, 0, 0.3)')
      root.style.setProperty('--shadow-subtle', '0 2px 8px rgba(0, 0, 0, 0.2)')
    }
    
    // Add body class for global styles
    document.body.classList.toggle('professional-theme', isProfessionalMode)
    document.body.classList.toggle('dark-theme', theme === 'dark')
    
  }, [theme, isProfessionalMode])

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    colors: tradingColors,
    semantic: semanticColors,
    utils: colorUtils,
    isProfessionalMode,
    setProfessionalMode,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="professional-trading-theme">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Professional Theme CSS Classes
export const professionalClasses = {
  // Layout
  container: "min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]",
  
  // Cards
  card: "bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-elevated)]",
  cardElevated: "bg-[var(--color-elevated)] border border-[var(--color-border-accent)] rounded-xl shadow-[var(--shadow-professional)]",
  
  // Glass morphism
  glass: "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md",
  
  // Buttons
  buttonPrimary: "bg-[var(--color-primary)] text-white hover:opacity-90 transition-all duration-200",
  buttonSecondary: "bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-accent)]",
  
  // Market states
  bullish: "text-[var(--color-bullish)]",
  bearish: "text-[var(--color-bearish)]",
  neutral: "text-[var(--color-neutral)]",
  
  // Text variants
  textPrimary: "text-[var(--color-text-primary)]",
  textSecondary: "text-[var(--color-text-secondary)]",
  textMuted: "text-[var(--color-text-muted)]",
  
  // Animations
  fadeIn: "animate-in fade-in duration-300",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-90 duration-200",
  
  // Professional gradients
  gradientPrimary: "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
  gradientSuccess: "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600",
  gradientDanger: "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
  
  // Trading specific
  candlestickBullish: "fill-[var(--color-bullish)] stroke-[var(--color-bullish)]",
  candlestickBearish: "fill-[var(--color-bearish)] stroke-[var(--color-bearish)]",
  
  // Responsive design
  mobileOptimized: "touch-manipulation select-none",
  desktopOnly: "hidden lg:block",
  mobileOnly: "lg:hidden",
  
} as const

// Professional component variants
export const professionalVariants = {
  card: {
    default: "bg-black/40 border border-primary/20 backdrop-blur-sm",
    elevated: "bg-black/60 border border-primary/30 shadow-2xl",
    glass: "bg-white/5 border border-white/10 backdrop-blur-md",
    success: "bg-green-500/10 border border-green-500/30",
    error: "bg-red-500/10 border border-red-500/30",
  },
  
  button: {
    primary: "bg-primary hover:bg-primary/90 text-white shadow-lg",
    secondary: "bg-black/40 border border-primary/20 hover:border-primary/40",
    ghost: "hover:bg-white/10 text-gray-300 hover:text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  },
  
  badge: {
    bullish: "bg-green-500/20 text-green-400 border border-green-500/30",
    bearish: "bg-red-500/20 text-red-400 border border-red-500/30",
    neutral: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
    primary: "bg-primary/20 text-primary border border-primary/30",
  }
} as const
