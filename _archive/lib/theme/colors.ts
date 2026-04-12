/**
 * Professional Trading Platform Color System
 * World-Class Color Palette for Financial Applications
 */

export const tradingColors = {
  // Primary Brand Colors
  primary: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6',  // Main brand color
    600: '#005cb3',
    700: '#004480',
    800: '#002d4d',
    900: '#00151a'
  },

  // Market Data Colors (Professional Trading)
  market: {
    bullish: '#00D2AA',      // Bright teal for gains
    bearish: '#FF4444',      // Professional red for losses
    neutral: '#6B7280',      // Neutral gray
    warning: '#F59E0B',      // Amber for warnings
    volume: '#8B5CF6',       // Purple for volume
    vix: '#EF4444',         // Red for volatility
    flow: '#10B981',        // Green for flow
    gamma: '#3B82F6',       // Blue for gamma
    theta: '#F97316',       // Orange for theta
    delta: '#06B6D4'        // Cyan for delta
  },

  // Background System (Dark Theme Optimized)
  background: {
    primary: '#000000',      // Pure black base
    secondary: '#0a0a0a',    // Slightly lighter black
    tertiary: '#1a1a1a',    // Card backgrounds
    elevated: '#2a2a2a',    // Elevated elements
    overlay: '#000000cc',    // Semi-transparent overlays
    glass: '#ffffff08',      // Glass morphism
  },

  // Text Colors
  text: {
    primary: '#ffffff',      // Pure white
    secondary: '#e5e5e5',    // Light gray
    tertiary: '#a3a3a3',     // Medium gray
    quaternary: '#737373',   // Darker gray
    muted: '#525252',        // Muted text
    accent: '#0073e6',       // Accent text (brand)
  },

  // Border System
  border: {
    primary: '#404040',      // Primary borders
    secondary: '#2a2a2a',    // Secondary borders
    accent: '#0073e6',       // Accent borders
    success: '#00D2AA',      // Success borders
    error: '#FF4444',        // Error borders
    warning: '#F59E0B',      // Warning borders
  },

  // State Colors
  state: {
    success: '#00D2AA',      // Success state
    error: '#FF4444',        // Error state
    warning: '#F59E0B',      // Warning state
    info: '#0073e6',         // Info state
    loading: '#6B7280',      // Loading state
  },

  // Financial Status Colors
  financial: {
    profit: '#00D2AA',       // Green for profits
    loss: '#FF4444',         // Red for losses
    breakeven: '#6B7280',    // Gray for breakeven
    pending: '#F59E0B',      // Amber for pending
    executed: '#00D2AA',     // Green for executed
    cancelled: '#6B7280',    // Gray for cancelled
  },

  // Heatmap Colors (for options flow visualization)
  heatmap: {
    cold: '#1e3a8a',         // Deep blue (low activity)
    cool: '#3b82f6',         // Blue
    neutral: '#6b7280',      // Gray
    warm: '#f97316',         // Orange
    hot: '#dc2626',          // Red (high activity)
    extreme: '#7c2d12',      // Dark red (extreme activity)
  },

  // Chart Colors (for trading charts)
  chart: {
    candlestick: {
      bullish: '#00D2AA',    // Green candles
      bearish: '#FF4444',    // Red candles
      wick: '#ffffff',       // White wicks
    },
    volume: {
      bullish: '#00D2AA66',  // Semi-transparent green
      bearish: '#FF444466',  // Semi-transparent red
    },
    indicators: {
      ma: '#FFD700',         // Gold for moving averages
      rsi: '#9333EA',        // Purple for RSI
      macd: '#06B6D4',       // Cyan for MACD
      bb: '#F59E0B',         // Amber for Bollinger Bands
    }
  }
} as const

export const semanticColors = {
  // Semantic color mappings for components
  button: {
    primary: tradingColors.primary[500],
    secondary: tradingColors.background.elevated,
    success: tradingColors.state.success,
    error: tradingColors.state.error,
    warning: tradingColors.state.warning,
  },
  
  card: {
    background: tradingColors.background.tertiary,
    border: tradingColors.border.secondary,
    elevated: tradingColors.background.elevated,
  },

  input: {
    background: tradingColors.background.secondary,
    border: tradingColors.border.primary,
    focus: tradingColors.primary[500],
    error: tradingColors.state.error,
  },

  badge: {
    bullish: tradingColors.market.bullish,
    bearish: tradingColors.market.bearish,
    neutral: tradingColors.market.neutral,
    warning: tradingColors.market.warning,
  }
} as const

// Color utility functions
export const colorUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  },

  // Get market color based on value
  getMarketColor: (value: number, neutral: number = 0): string => {
    if (value > neutral) return tradingColors.market.bullish
    if (value < neutral) return tradingColors.market.bearish
    return tradingColors.market.neutral
  },

  // Get intensity color for heatmaps
  getHeatmapColor: (intensity: number): string => {
    if (intensity >= 0.8) return tradingColors.heatmap.extreme
    if (intensity >= 0.6) return tradingColors.heatmap.hot
    if (intensity >= 0.4) return tradingColors.heatmap.warm
    if (intensity >= 0.2) return tradingColors.heatmap.neutral
    if (intensity >= 0.1) return tradingColors.heatmap.cool
    return tradingColors.heatmap.cold
  }
}

export type TradingColors = typeof tradingColors
export type SemanticColors = typeof semanticColors
