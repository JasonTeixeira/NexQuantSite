/**
 * 🎨 INSTITUTIONAL-GRADE DESIGN SYSTEM
 * 
 * Mathematical precision, perfect proportions, and world-class visual hierarchy
 * Built for 99+ institutional quality that makes people go "Holy shit!"
 */

// 📐 MATHEMATICAL PROPORTIONS (Golden Ratio & Fibonacci)
export const GOLDEN_RATIO = 1.618
export const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

// 🎯 SPACING SYSTEM (Based on 8px grid with golden ratio multipliers)
export const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem  - Base unit
  md: 13,   // 0.8125rem - Fibonacci
  lg: 21,   // 1.3125rem - Fibonacci
  xl: 34,   // 2.125rem - Fibonacci
  '2xl': 55, // 3.4375rem - Fibonacci
  '3xl': 89, // 5.5625rem - Fibonacci
} as const

// 🎨 INSTITUTIONAL COLOR PALETTE
export const colors = {
  // Primary brand colors
  primary: {
    50: '#e6f7ff',
    100: '#bae7ff', 
    200: '#91d5ff',
    300: '#69c0ff',
    400: '#40a9ff',
    500: '#1890ff', // Main brand blue
    600: '#096dd9',
    700: '#0050b3',
    800: '#003a8c',
    900: '#002766',
  },
  
  // Accent gradient (The signature NexusQuant gradient)
  accent: {
    from: '#00bbff',
    via: '#4a4aff', 
    to: '#8b5cf6',
  },
  
  // Dark theme colors (Carefully calibrated for eye comfort)
  dark: {
    bg: {
      primary: '#0a0a0f',    // Main background
      secondary: '#15151f',   // Card backgrounds
      tertiary: '#1a1a25',   // Elevated surfaces
      quaternary: '#2a2a3e', // Interactive elements
    },
    border: {
      primary: '#2a2a3e',
      secondary: '#3a3a52',
      accent: '#00bbff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e8',
      tertiary: '#a0a0b8',
      quaternary: '#6a6a78',
      accent: '#00bbff',
    }
  },
  
  // Semantic colors (Carefully chosen for accessibility)
  semantic: {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#22c55e',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)', 
      text: '#f59e0b',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#ef4444',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: '#3b82f6',
    }
  },
  
  // Financial colors (Industry standard)
  financial: {
    profit: '#22c55e',
    loss: '#ef4444',
    neutral: '#6b7280',
    bid: '#22c55e',
    ask: '#ef4444',
    volume: '#8b5cf6',
  }
} as const

// 📝 TYPOGRAPHY SYSTEM (Perfect hierarchy with mathematical scaling)
export const typography = {
  fontFamily: {
    mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  },
  
  // Font sizes using modular scale (1.25 ratio)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px - Base size
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Line heights for perfect readability
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
} as const

// 🎭 ANIMATION SYSTEM (Buttery smooth 60fps)
export const animations = {
  // Timing functions (Carefully crafted for natural feel)
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Duration scale (Fibonacci-based)
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '650ms',
  },
  
  // Micro-interaction presets
  microInteractions: {
    button: {
      hover: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      press: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    card: {
      hover: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      lift: 'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    modal: {
      enter: 'all 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      exit: 'all 200ms cubic-bezier(0.4, 0, 1, 1)',
    }
  }
} as const

// 🌟 ELEVATION SYSTEM (Material Design inspired, refined for finance)
export const elevation = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Special glow effects for accents
  glow: {
    blue: '0 0 20px rgba(0, 187, 255, 0.3)',
    purple: '0 0 20px rgba(139, 92, 246, 0.3)',
    green: '0 0 20px rgba(34, 197, 94, 0.3)',
    red: '0 0 20px rgba(239, 68, 68, 0.3)',
  }
} as const

// 📐 BORDER RADIUS SYSTEM (Consistent rounding)
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// 🎯 COMPONENT VARIANTS (Systematic approach to variants)
export const componentVariants = {
  button: {
    size: {
      xs: {
        padding: `${spacing.xs}px ${spacing.sm}px`,
        fontSize: typography.fontSize.xs,
        borderRadius: borderRadius.sm,
      },
      sm: {
        padding: `${spacing.sm}px ${spacing.md}px`,
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.base,
      },
      md: {
        padding: `${spacing.md}px ${spacing.lg}px`,
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.md,
      },
      lg: {
        padding: `${spacing.lg}px ${spacing.xl}px`,
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.lg,
      },
    },
    variant: {
      primary: {
        background: `linear-gradient(135deg, ${colors.accent.from}, ${colors.accent.to})`,
        color: colors.dark.text.primary,
        border: 'none',
        boxShadow: elevation.md,
      },
      secondary: {
        background: colors.dark.bg.quaternary,
        color: colors.dark.text.primary,
        border: `1px solid ${colors.dark.border.secondary}`,
        boxShadow: elevation.sm,
      },
      ghost: {
        background: 'transparent',
        color: colors.dark.text.tertiary,
        border: 'none',
        boxShadow: 'none',
      },
    }
  },
  
  card: {
    variant: {
      default: {
        background: colors.dark.bg.secondary,
        border: `1px solid ${colors.dark.border.primary}`,
        borderRadius: borderRadius.lg,
        boxShadow: elevation.sm,
      },
      elevated: {
        background: colors.dark.bg.tertiary,
        border: `1px solid ${colors.dark.border.secondary}`,
        borderRadius: borderRadius.xl,
        boxShadow: elevation.md,
      },
      glass: {
        background: 'rgba(26, 26, 37, 0.8)',
        border: `1px solid ${colors.dark.border.primary}`,
        borderRadius: borderRadius.xl,
        backdropFilter: 'blur(20px)',
        boxShadow: elevation.lg,
      }
    }
  }
} as const

// 🎨 GRADIENT SYSTEM (Beautiful, consistent gradients)
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.accent.from} 0%, ${colors.accent.via} 50%, ${colors.accent.to} 100%)`,
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  neutral: `linear-gradient(135deg, ${colors.dark.bg.tertiary} 0%, ${colors.dark.bg.quaternary} 100%)`,
  
  // Special financial gradients
  profit: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  loss: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
  
  // Subtle background gradients
  background: `linear-gradient(135deg, ${colors.dark.bg.primary} 0%, #0f0f1a 100%)`,
  surface: `linear-gradient(135deg, ${colors.dark.bg.secondary} 0%, ${colors.dark.bg.tertiary} 100%)`,
} as const

// 📊 CHART COLORS (Optimized for data visualization)
export const chartColors = {
  // Primary data series
  series: [
    '#00bbff', // Primary blue
    '#4a4aff', // Secondary blue
    '#8b5cf6', // Purple
    '#22c55e', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
  ],
  
  // Semantic chart colors
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  
  // Heatmap colors
  heatmap: {
    cold: '#1e40af',
    neutral: '#6b7280', 
    warm: '#dc2626',
  },
  
  // Volume colors
  volume: {
    up: 'rgba(34, 197, 94, 0.6)',
    down: 'rgba(239, 68, 68, 0.6)',
  }
} as const

// 🎯 BREAKPOINTS (Mobile-first responsive design)
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// 🔧 UTILITY FUNCTIONS
export const designUtils = {
  // Generate consistent spacing
  spacing: (multiplier: number) => `${spacing.sm * multiplier}px`,
  
  // Generate alpha colors
  alpha: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  
  // Generate hover states
  hover: (color: string, amount = 0.1) => {
    // This would need a color manipulation library in real implementation
    return color
  },
  
  // Generate focus states
  focus: (color: string = colors.accent.from) => ({
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
  }),
  
  // Generate responsive values
  responsive: (values: Record<string, any>) => {
    return Object.entries(values).map(([breakpoint, value]) => 
      breakpoint === 'base' ? value : `@media (min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]}) { ${value} }`
    ).join(' ')
  }
} as const

// 🎨 CSS CUSTOM PROPERTIES (For dynamic theming)
export const cssVariables = {
  '--color-primary': colors.accent.from,
  '--color-primary-hover': colors.accent.via,
  '--color-background': colors.dark.bg.primary,
  '--color-surface': colors.dark.bg.secondary,
  '--color-border': colors.dark.border.primary,
  '--color-text': colors.dark.text.primary,
  '--color-text-muted': colors.dark.text.tertiary,
  '--spacing-unit': `${spacing.sm}px`,
  '--border-radius': borderRadius.md,
  '--font-family-mono': typography.fontFamily.mono.join(', '),
  '--animation-duration': animations.duration.normal,
  '--animation-easing': animations.easing.ease,
} as const

// Export everything as a cohesive design system
export const designSystem = {
  colors,
  typography,
  spacing,
  animations,
  elevation,
  borderRadius,
  componentVariants,
  gradients,
  chartColors,
  breakpoints,
  cssVariables,
  utils: designUtils,
} as const

export default designSystem
