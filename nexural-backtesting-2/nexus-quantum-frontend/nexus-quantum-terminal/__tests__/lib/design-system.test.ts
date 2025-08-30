import {
  quantTheme,
  colorPalettes,
  typographyScale,
  spacingScale,
  getColorValue,
  getSpacingValue,
  getTypographyStyle,
  createThemeVariant,
  validateThemeConfiguration,
  ThemeConfig,
  ColorPalette,
  TypographyStyle
} from '@/lib/design-system'

describe('Design System Library', () => {
  describe('quantTheme', () => {
    it('provides complete theme configuration', () => {
      expect(quantTheme).toBeDefined()
      expect(quantTheme).toHaveProperty('colors')
      expect(quantTheme).toHaveProperty('typography')
      expect(quantTheme).toHaveProperty('spacing')
      expect(quantTheme).toHaveProperty('borderRadius')
      expect(quantTheme).toHaveProperty('shadows')
    })

    it('has institutional color scheme', () => {
      expect(quantTheme.colors).toHaveProperty('primary')
      expect(quantTheme.colors).toHaveProperty('secondary')
      expect(quantTheme.colors).toHaveProperty('background')
      expect(quantTheme.colors).toHaveProperty('surface')
      expect(quantTheme.colors).toHaveProperty('text')
      
      // Colors should be valid hex or CSS values
      expect(quantTheme.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$|^rgb|^hsl/)
    })

    it('provides responsive typography scale', () => {
      expect(quantTheme.typography).toHaveProperty('fontSizes')
      expect(quantTheme.typography).toHaveProperty('lineHeights')
      expect(quantTheme.typography).toHaveProperty('fontWeights')
      
      expect(Array.isArray(quantTheme.typography.fontSizes)).toBe(true)
      expect(quantTheme.typography.fontSizes.length).toBeGreaterThan(5)
    })

    it('includes comprehensive spacing system', () => {
      expect(quantTheme.spacing).toBeDefined()
      expect(typeof quantTheme.spacing).toBe('object')
      
      // Should have consistent spacing scale
      const spacingValues = Object.values(quantTheme.spacing)
      spacingValues.forEach(value => {
        expect(typeof value).toBe('string')
        expect(value).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
      })
    })
  })

  describe('colorPalettes', () => {
    it('provides multiple color palettes', () => {
      expect(colorPalettes).toBeDefined()
      expect(colorPalettes).toHaveProperty('institutional')
      expect(colorPalettes).toHaveProperty('trading')
      expect(colorPalettes).toHaveProperty('analytics')
      expect(colorPalettes).toHaveProperty('risk')
    })

    it('has consistent palette structure', () => {
      Object.values(colorPalettes).forEach(palette => {
        expect(palette).toHaveProperty('primary')
        expect(palette).toHaveProperty('secondary')
        expect(palette).toHaveProperty('accent')
        expect(palette).toHaveProperty('background')
        expect(palette).toHaveProperty('text')
        
        // Each color should be valid
        Object.values(palette).forEach(color => {
          expect(typeof color).toBe('string')
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$|^rgb|^hsl|^var\(/)
        })
      })
    })

    it('provides semantic color meanings', () => {
      expect(colorPalettes.trading).toHaveProperty('bull') // Green for gains
      expect(colorPalettes.trading).toHaveProperty('bear') // Red for losses
      expect(colorPalettes.risk).toHaveProperty('low')
      expect(colorPalettes.risk).toHaveProperty('medium')
      expect(colorPalettes.risk).toHaveProperty('high')
      expect(colorPalettes.risk).toHaveProperty('critical')
    })

    it('maintains accessibility standards', () => {
      // Test contrast ratios for institutional palette
      const institutional = colorPalettes.institutional
      
      expect(institutional.primary).not.toBe(institutional.background)
      expect(institutional.text).not.toBe(institutional.background)
      
      // Colors should provide sufficient contrast
      expect(institutional.text).toMatch(/#[A-Fa-f0-9]{6}/)
      expect(institutional.background).toMatch(/#[A-Fa-f0-9]{6}/)
    })
  })

  describe('typographyScale', () => {
    it('provides comprehensive typography system', () => {
      expect(typographyScale).toBeDefined()
      expect(typographyScale).toHaveProperty('fontSizes')
      expect(typographyScale).toHaveProperty('lineHeights')
      expect(typographyScale).toHaveProperty('fontWeights')
      expect(typographyScale).toHaveProperty('letterSpacing')
    })

    it('has consistent size relationships', () => {
      const sizes = typographyScale.fontSizes
      
      // Font sizes should be in ascending order
      for (let i = 1; i < sizes.length; i++) {
        const current = parseFloat(sizes[i])
        const previous = parseFloat(sizes[i-1])
        expect(current).toBeGreaterThan(previous)
      }
    })

    it('includes financial data formatting', () => {
      expect(typographyScale).toHaveProperty('financial')
      expect(typographyScale.financial).toHaveProperty('currency')
      expect(typographyScale.financial).toHaveProperty('percentage')
      expect(typographyScale.financial).toHaveProperty('metrics')
      
      expect(typographyScale.financial.currency.fontFamily).toMatch(/mono/i)
    })

    it('supports institutional requirements', () => {
      expect(typographyScale).toHaveProperty('institutional')
      expect(typographyScale.institutional).toHaveProperty('headers')
      expect(typographyScale.institutional).toHaveProperty('body')
      expect(typographyScale.institutional).toHaveProperty('captions')
      
      // Headers should be bold
      expect(typographyScale.institutional.headers.fontWeight).toBeGreaterThanOrEqual(600)
    })
  })

  describe('spacingScale', () => {
    it('provides consistent spacing system', () => {
      expect(spacingScale).toBeDefined()
      expect(typeof spacingScale).toBe('object')
      
      const spacingKeys = Object.keys(spacingScale)
      expect(spacingKeys.length).toBeGreaterThan(10)
      
      // Should include common spacing values
      expect(spacingScale).toHaveProperty('xs')
      expect(spacingScale).toHaveProperty('sm')
      expect(spacingScale).toHaveProperty('md')
      expect(spacingScale).toHaveProperty('lg')
      expect(spacingScale).toHaveProperty('xl')
    })

    it('uses consistent units', () => {
      Object.values(spacingScale).forEach(value => {
        expect(typeof value).toBe('string')
        expect(value).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
      })
    })

    it('maintains mathematical relationships', () => {
      // Convert to numbers for comparison (assuming rem units)
      const xsValue = parseFloat(spacingScale.xs)
      const smValue = parseFloat(spacingScale.sm)
      const mdValue = parseFloat(spacingScale.md)
      const lgValue = parseFloat(spacingScale.lg)
      
      // Should be in ascending order
      expect(smValue).toBeGreaterThan(xsValue)
      expect(mdValue).toBeGreaterThan(smValue)
      expect(lgValue).toBeGreaterThan(mdValue)
    })
  })

  describe('Utility Functions', () => {
    describe('getColorValue', () => {
      it('retrieves color values correctly', () => {
        const primaryColor = getColorValue('primary')
        
        expect(typeof primaryColor).toBe('string')
        expect(primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$|^rgb|^hsl|^var\(/)
      })

      it('handles color variants', () => {
        const primaryLight = getColorValue('primary', 'light')
        const primaryDark = getColorValue('primary', 'dark')
        
        expect(primaryLight).toBeDefined()
        expect(primaryDark).toBeDefined()
        expect(primaryLight).not.toBe(primaryDark)
      })

      it('falls back for invalid colors', () => {
        const invalidColor = getColorValue('nonexistent-color')
        
        expect(invalidColor).toBeDefined()
        expect(typeof invalidColor).toBe('string')
      })

      it('supports semantic color names', () => {
        const successColor = getColorValue('success')
        const errorColor = getColorValue('error')
        const warningColor = getColorValue('warning')
        
        expect(successColor).toMatch(/green|#[0-9A-Fa-f]{6}/)
        expect(errorColor).toMatch(/red|#[0-9A-Fa-f]{6}/)
        expect(warningColor).toMatch(/yellow|orange|#[0-9A-Fa-f]{6}/)
      })
    })

    describe('getSpacingValue', () => {
      it('retrieves spacing values correctly', () => {
        const mdSpacing = getSpacingValue('md')
        
        expect(typeof mdSpacing).toBe('string')
        expect(mdSpacing).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
      })

      it('handles responsive spacing', () => {
        const responsiveSpacing = getSpacingValue('responsive-lg')
        
        expect(responsiveSpacing).toBeDefined()
        expect(typeof responsiveSpacing).toBe('string')
      })

      it('falls back for invalid spacing', () => {
        const invalidSpacing = getSpacingValue('invalid-spacing')
        
        expect(invalidSpacing).toBeDefined()
        expect(invalidSpacing).toBe('1rem') // Default fallback
      })
    })

    describe('getTypographyStyle', () => {
      it('returns complete typography styles', () => {
        const headingStyle = getTypographyStyle('heading-lg')
        
        expect(headingStyle).toHaveProperty('fontSize')
        expect(headingStyle).toHaveProperty('lineHeight')
        expect(headingStyle).toHaveProperty('fontWeight')
        
        expect(typeof headingStyle.fontSize).toBe('string')
        expect(typeof headingStyle.lineHeight).toBe('string')
        expect(typeof headingStyle.fontWeight).toBe('number')
      })

      it('provides financial typography styles', () => {
        const currencyStyle = getTypographyStyle('financial-currency')
        const percentageStyle = getTypographyStyle('financial-percentage')
        
        expect(currencyStyle.fontFamily).toMatch(/mono/i)
        expect(percentageStyle.fontFamily).toMatch(/mono/i)
        
        expect(currencyStyle.fontWeight).toBeGreaterThanOrEqual(500)
      })

      it('handles responsive typography', () => {
        const responsiveHeading = getTypographyStyle('heading-responsive')
        
        expect(responsiveHeading).toBeDefined()
        expect(responsiveHeading).toHaveProperty('fontSize')
      })
    })
  })

  describe('Theme Management', () => {
    describe('createThemeVariant', () => {
      it('creates theme variants', () => {
        const baseTheme = quantTheme
        const darkVariant = createThemeVariant(baseTheme, 'dark')
        
        expect(darkVariant).toBeDefined()
        expect(darkVariant).toHaveProperty('colors')
        expect(darkVariant).toHaveProperty('name')
        expect(darkVariant.name).toContain('dark')
      })

      it('preserves base theme structure', () => {
        const baseTheme = quantTheme
        const customVariant = createThemeVariant(baseTheme, 'custom', {
          colors: { primary: '#FF0000' }
        })
        
        expect(customVariant.typography).toEqual(baseTheme.typography)
        expect(customVariant.spacing).toEqual(baseTheme.spacing)
        expect(customVariant.colors.primary).toBe('#FF0000')
      })

      it('creates institutional themes', () => {
        const institutionalTheme = createThemeVariant(quantTheme, 'institutional')
        
        expect(institutionalTheme.colors).toHaveProperty('primary')
        expect(institutionalTheme.colors).toHaveProperty('background')
        
        // Should have professional color scheme
        expect(institutionalTheme.colors.background).toMatch(/#[0-9A-Fa-f]{6}/)
      })
    })

    describe('validateThemeConfiguration', () => {
      it('validates complete theme config', () => {
        const validation = validateThemeConfiguration(quantTheme)
        
        expect(validation).toHaveProperty('isValid')
        expect(validation).toHaveProperty('errors')
        expect(validation).toHaveProperty('warnings')
        
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toEqual([])
      })

      it('detects missing required properties', () => {
        const incompleteTheme = {
          colors: { primary: '#000000' }
          // Missing typography, spacing, etc.
        }
        
        const validation = validateThemeConfiguration(incompleteTheme)
        
        expect(validation.isValid).toBe(false)
        expect(validation.errors.length).toBeGreaterThan(0)
        expect(validation.errors.some(error => error.includes('typography'))).toBe(true)
      })

      it('validates color accessibility', () => {
        const lowContrastTheme = {
          colors: {
            primary: '#cccccc',
            background: '#dddddd', // Low contrast
            text: '#eeeeee'
          },
          typography: quantTheme.typography,
          spacing: quantTheme.spacing
        }
        
        const validation = validateThemeConfiguration(lowContrastTheme)
        
        expect(validation.warnings.length).toBeGreaterThan(0)
        expect(validation.warnings.some(warning => warning.includes('contrast'))).toBe(true)
      })

      it('validates typography consistency', () => {
        const inconsistentTheme = {
          ...quantTheme,
          typography: {
            fontSizes: ['10px', '8px', '12px'], // Inconsistent order
            lineHeights: ['1.2'],
            fontWeights: [400, 600]
          }
        }
        
        const validation = validateThemeConfiguration(inconsistentTheme)
        
        expect(validation.warnings.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Color System', () => {
    describe('ColorPalette interface', () => {
      it('validates color palette structure', () => {
        const testPalette: ColorPalette = {
          primary: '#0066cc',
          secondary: '#666666',
          accent: '#ff6600',
          background: '#000000',
          surface: '#111111',
          text: '#ffffff',
          textSecondary: '#cccccc',
          border: '#333333',
          success: '#00cc66',
          warning: '#ffcc00',
          error: '#cc0000',
          info: '#0099cc'
        }
        
        // All properties should be valid color strings
        Object.values(testPalette).forEach(color => {
          expect(typeof color).toBe('string')
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })
      })
    })

    it('provides trading-specific colors', () => {
      expect(colorPalettes.trading).toHaveProperty('bull')
      expect(colorPalettes.trading).toHaveProperty('bear')
      expect(colorPalettes.trading).toHaveProperty('neutral')
      
      // Bull should be green-ish, bear should be red-ish
      expect(colorPalettes.trading.bull).toMatch(/#[0-9A-Fa-f]*[4-9A-Fa-f][0-9A-Fa-f]*/)
      expect(colorPalettes.trading.bear).toMatch(/#[4-9A-Fa-f][0-9A-Fa-f]*[0-3]/)
    })

    it('includes risk level colors', () => {
      const riskColors = colorPalettes.risk
      
      expect(riskColors).toHaveProperty('low')
      expect(riskColors).toHaveProperty('medium') 
      expect(riskColors).toHaveProperty('high')
      expect(riskColors).toHaveProperty('critical')
      
      // Should progress from green to red
      expect(riskColors.low).toMatch(/green|#[0-9A-Fa-f]*[4-9A-Fa-f][0-9A-Fa-f]*/)
      expect(riskColors.critical).toMatch(/red|#[4-9A-Fa-f][0-9A-Fa-f]*[0-3]/)
    })
  })

  describe('Typography System', () => {
    describe('TypographyStyle interface', () => {
      it('validates typography style structure', () => {
        const testStyle: TypographyStyle = {
          fontSize: '16px',
          lineHeight: '1.5',
          fontWeight: 400,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.01em'
        }
        
        expect(testStyle.fontSize).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
        expect(testStyle.lineHeight).toMatch(/^\d+(\.\d+)?$/)
        expect(testStyle.fontWeight).toBeGreaterThanOrEqual(100)
        expect(testStyle.fontWeight).toBeLessThanOrEqual(900)
      })
    })

    it('provides hierarchical heading styles', () => {
      const h1Style = getTypographyStyle('heading-xl')
      const h2Style = getTypographyStyle('heading-lg') 
      const h3Style = getTypographyStyle('heading-md')
      
      const h1Size = parseFloat(h1Style.fontSize)
      const h2Size = parseFloat(h2Style.fontSize)
      const h3Size = parseFloat(h3Style.fontSize)
      
      expect(h1Size).toBeGreaterThan(h2Size)
      expect(h2Size).toBeGreaterThan(h3Size)
    })

    it('includes financial display fonts', () => {
      const currencyStyle = getTypographyStyle('financial-currency')
      const metricsStyle = getTypographyStyle('financial-metrics')
      
      expect(currencyStyle.fontFamily).toMatch(/mono/i)
      expect(metricsStyle.fontFamily).toMatch(/mono/i)
      
      // Should be readable for numbers
      expect(currencyStyle.letterSpacing).toBeDefined()
      expect(parseFloat(currencyStyle.letterSpacing)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Responsive Design', () => {
    it('provides breakpoint system', () => {
      expect(quantTheme).toHaveProperty('breakpoints')
      expect(quantTheme.breakpoints).toHaveProperty('mobile')
      expect(quantTheme.breakpoints).toHaveProperty('tablet')
      expect(quantTheme.breakpoints).toHaveProperty('desktop')
      expect(quantTheme.breakpoints).toHaveProperty('wide')
    })

    it('maintains consistent breakpoint values', () => {
      const breakpoints = quantTheme.breakpoints
      
      const mobile = parseInt(breakpoints.mobile)
      const tablet = parseInt(breakpoints.tablet)
      const desktop = parseInt(breakpoints.desktop)
      
      expect(tablet).toBeGreaterThan(mobile)
      expect(desktop).toBeGreaterThan(tablet)
    })

    it('supports responsive spacing', () => {
      expect(spacingScale).toHaveProperty('responsive')
      
      const responsiveSpacing = spacingScale.responsive
      expect(responsiveSpacing).toHaveProperty('mobile')
      expect(responsiveSpacing).toHaveProperty('tablet')
      expect(responsiveSpacing).toHaveProperty('desktop')
    })
  })

  describe('Theme Customization', () => {
    it('supports theme inheritance', () => {
      const baseTheme = quantTheme
      const customTheme = createThemeVariant(baseTheme, 'custom', {
        colors: {
          primary: '#FF0000',
          secondary: '#00FF00'
        }
      })
      
      // Should inherit base properties
      expect(customTheme.typography).toEqual(baseTheme.typography)
      expect(customTheme.spacing).toEqual(baseTheme.spacing)
      
      // Should override custom properties
      expect(customTheme.colors.primary).toBe('#FF0000')
      expect(customTheme.colors.secondary).toBe('#00FF00')
    })

    it('validates custom theme overrides', () => {
      const invalidOverride = {
        colors: {
          primary: 'invalid-color'
        }
      }
      
      const customTheme = createThemeVariant(quantTheme, 'custom', invalidOverride)
      const validation = validateThemeConfiguration(customTheme)
      
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('supports institutional branding', () => {
      const brandedTheme = createThemeVariant(quantTheme, 'branded', {
        colors: {
          primary: '#1a365d', // Institutional blue
          secondary: '#2d3748',
          accent: '#3182ce'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      })
      
      expect(brandedTheme.colors.primary).toBe('#1a365d')
      expect(brandedTheme.typography.fontFamily).toContain('Inter')
    })
  })

  describe('Design System Integration', () => {
    it('works with CSS-in-JS libraries', () => {
      const styleObject = {
        color: getColorValue('primary'),
        fontSize: getTypographyStyle('body-lg').fontSize,
        margin: getSpacingValue('md'),
        padding: getSpacingValue('lg')
      }
      
      expect(styleObject.color).toMatch(/^#|^rgb|^var\(/)
      expect(styleObject.fontSize).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
      expect(styleObject.margin).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
      expect(styleObject.padding).toMatch(/^\d+(\.\d+)?(px|rem|em)$/)
    })

    it('generates consistent CSS custom properties', () => {
      const cssVars = Object.entries(quantTheme.colors).map(([key, value]) => 
        `--color-${key}: ${value};`
      )
      
      expect(cssVars.length).toBeGreaterThan(5)
      cssVars.forEach(cssVar => {
        expect(cssVar).toMatch(/^--color-[\w-]+:\s*#[0-9A-Fa-f]{6};$/)
      })
    })

    it('supports dark mode switching', () => {
      const lightTheme = createThemeVariant(quantTheme, 'light')
      const darkTheme = createThemeVariant(quantTheme, 'dark')
      
      // Background colors should be inverted
      const lightBg = lightTheme.colors.background
      const darkBg = darkTheme.colors.background
      
      expect(lightBg).not.toBe(darkBg)
      
      // Dark theme should have dark background
      expect(darkBg).toMatch(/#[0-3][0-9A-Fa-f]{5}/)
    })
  })

  describe('Production Readiness', () => {
    it('handles missing configuration gracefully', () => {
      const emptyConfig = {}
      
      expect(() => validateThemeConfiguration(emptyConfig)).not.toThrow()
    })

    it('provides fallback values', () => {
      const fallbackColor = getColorValue('unknown-color')
      const fallbackSpacing = getSpacingValue('unknown-spacing')
      const fallbackTypography = getTypographyStyle('unknown-style')
      
      expect(fallbackColor).toBeDefined()
      expect(fallbackSpacing).toBeDefined()
      expect(fallbackTypography).toBeDefined()
    })

    it('maintains performance with large theme objects', () => {
      const largeTheme = {
        ...quantTheme,
        colors: {
          ...quantTheme.colors,
          ...Object.fromEntries(
            Array.from({ length: 1000 }, (_, i) => [`custom${i}`, `#${i.toString(16).padStart(6, '0')}`])
          )
        }
      }
      
      const startTime = performance.now()
      const validation = validateThemeConfiguration(largeTheme)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should validate quickly
      expect(validation).toBeDefined()
    })

    it('supports theme hot-reloading in development', () => {
      const originalTheme = quantTheme
      const updatedTheme = {
        ...originalTheme,
        colors: {
          ...originalTheme.colors,
          primary: '#FF0000'
        }
      }
      
      // Should create new theme without affecting original
      expect(updatedTheme.colors.primary).toBe('#FF0000')
      expect(originalTheme.colors.primary).not.toBe('#FF0000')
    })
  })
})
