interface MobileMetrics {
  touchTargetScore: number
  viewportScore: number
  navigationScore: number
  performanceScore: number
  contentScore: number
}

interface TouchTarget {
  element: Element
  width: number
  height: number
  isAccessible: boolean
}

export class MobileOptimizer {
  private readonly MIN_TOUCH_TARGET_SIZE = 44 // 44px minimum for accessibility
  private readonly RECOMMENDED_TOUCH_TARGET_SIZE = 48 // 48px recommended

  analyzeTouchTargets(): { score: number; issues: string[]; targets: TouchTarget[] } {
    const clickableElements = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], input[type="reset"], [role="button"], [onclick]',
    )

    const targets: TouchTarget[] = []
    const issues: string[] = []
    let accessibleTargets = 0

    clickableElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const isAccessible = rect.width >= this.MIN_TOUCH_TARGET_SIZE && rect.height >= this.MIN_TOUCH_TARGET_SIZE

      if (isAccessible) accessibleTargets++
      else {
        issues.push(
          `Touch target too small: ${element.tagName.toLowerCase()} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
        )
      }

      targets.push({
        element,
        width: rect.width,
        height: rect.height,
        isAccessible,
      })
    })

    const score = clickableElements.length > 0 ? (accessibleTargets / clickableElements.length) * 100 : 100

    return { score, issues, targets }
  }

  analyzeViewport(): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    if (!viewportMeta) {
      issues.push("Missing viewport meta tag")
      recommendations.push('Add <meta name="viewport" content="width=device-width, initial-scale=1">')
      score -= 30
    } else {
      const content = viewportMeta.content
      if (!content.includes("width=device-width")) {
        issues.push("Viewport not set to device width")
        recommendations.push("Set viewport width to device-width")
        score -= 15
      }
      if (!content.includes("initial-scale=1")) {
        issues.push("Initial scale not set to 1")
        recommendations.push("Set initial-scale to 1")
        score -= 10
      }
    }

    // Check for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      issues.push("Horizontal scrolling detected")
      recommendations.push("Ensure content fits within viewport width")
      score -= 25
    }

    // Check for fixed positioning issues
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]')
    fixedElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
        issues.push("Fixed positioned element extends beyond viewport")
        recommendations.push("Adjust fixed positioned elements for mobile screens")
        score -= 10
      }
    })

    return { score: Math.max(0, score), issues, recommendations }
  }

  analyzeNavigation(): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check for mobile navigation
    const hamburgerMenu = document.querySelector("[data-mobile-menu], .mobile-menu, .hamburger")
    if (!hamburgerMenu && window.innerWidth < 768) {
      issues.push("No mobile navigation menu detected")
      recommendations.push("Implement a mobile-friendly navigation menu")
      score -= 30
    }

    // Check navigation item spacing
    const navItems = document.querySelectorAll("nav a, nav button")
    let tooCloseItems = 0

    navItems.forEach((item, index) => {
      if (index > 0) {
        const currentRect = item.getBoundingClientRect()
        const prevRect = navItems[index - 1].getBoundingClientRect()

        const distance = Math.abs(currentRect.top - prevRect.bottom)
        if (distance < 8) {
          // Less than 8px spacing
          tooCloseItems++
        }
      }
    })

    if (tooCloseItems > 0) {
      issues.push(`${tooCloseItems} navigation items too close together`)
      recommendations.push("Increase spacing between navigation items")
      score -= 15
    }

    // Check for breadcrumbs on mobile
    const breadcrumbs = document.querySelector(".breadcrumb, [data-breadcrumb]")
    if (breadcrumbs && window.innerWidth < 768) {
      const breadcrumbItems = breadcrumbs.querySelectorAll("a, span")
      if (breadcrumbItems.length > 3) {
        issues.push("Too many breadcrumb items for mobile")
        recommendations.push("Collapse breadcrumbs on mobile or show only essential items")
        score -= 10
      }
    }

    return { score: Math.max(0, score), issues, recommendations }
  }

  analyzePerformance(): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check image optimization
    const images = document.querySelectorAll("img")
    let unoptimizedImages = 0

    images.forEach((img) => {
      // Check for missing loading attribute
      if (!img.hasAttribute("loading")) {
        unoptimizedImages++
      }

      // Check for missing srcset for responsive images
      if (!img.hasAttribute("srcset") && img.width > 300) {
        unoptimizedImages++
      }
    })

    if (unoptimizedImages > 0) {
      issues.push(`${unoptimizedImages} images not optimized for mobile`)
      recommendations.push('Add loading="lazy" and srcset attributes to images')
      score -= 20
    }

    // Check for large bundle sizes (simplified check)
    const scripts = document.querySelectorAll("script[src]")
    if (scripts.length > 10) {
      issues.push("Too many script files loaded")
      recommendations.push("Bundle and minify JavaScript files")
      score -= 15
    }

    return { score: Math.max(0, score), issues, recommendations }
  }

  analyzeContent(): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check font sizes
    const textElements = document.querySelectorAll("p, span, div, a, button")
    let smallTextElements = 0

    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element)
      const fontSize = Number.parseFloat(styles.fontSize)

      if (fontSize < 16) {
        // Less than 16px
        smallTextElements++
      }
    })

    if (smallTextElements > textElements.length * 0.1) {
      // More than 10% of text is small
      issues.push("Text too small for mobile reading")
      recommendations.push("Increase font sizes to at least 16px for mobile")
      score -= 20
    }

    // Check for tables on mobile
    const tables = document.querySelectorAll("table")
    if (tables.length > 0 && window.innerWidth < 768) {
      let responsiveTables = 0
      tables.forEach((table) => {
        if (table.classList.contains("responsive") || table.hasAttribute("data-responsive")) {
          responsiveTables++
        }
      })

      if (responsiveTables < tables.length) {
        issues.push("Tables not optimized for mobile")
        recommendations.push("Make tables responsive or convert to mobile-friendly layouts")
        score -= 15
      }
    }

    return { score: Math.max(0, score), issues, recommendations }
  }

  getMobileScore(): MobileMetrics {
    const touchTargetResult = this.analyzeTouchTargets()
    const viewportResult = this.analyzeViewport()
    const navigationResult = this.analyzeNavigation()
    const performanceResult = this.analyzePerformance()
    const contentResult = this.analyzeContent()

    return {
      touchTargetScore: touchTargetResult.score,
      viewportScore: viewportResult.score,
      navigationScore: navigationResult.score,
      performanceScore: performanceResult.score,
      contentScore: contentResult.score,
    }
  }

  generateMobileReport(): {
    overallScore: number
    categoryScores: MobileMetrics
    allIssues: string[]
    allRecommendations: string[]
    criticalIssues: string[]
  } {
    const touchTargetResult = this.analyzeTouchTargets()
    const viewportResult = this.analyzeViewport()
    const navigationResult = this.analyzeNavigation()
    const performanceResult = this.analyzePerformance()
    const contentResult = this.analyzeContent()

    const categoryScores = {
      touchTargetScore: touchTargetResult.score,
      viewportScore: viewportResult.score,
      navigationScore: navigationResult.score,
      performanceScore: performanceResult.score,
      contentScore: contentResult.score,
    }

    const overallScore = Math.round(
      (categoryScores.touchTargetScore +
        categoryScores.viewportScore +
        categoryScores.navigationScore +
        categoryScores.performanceScore +
        categoryScores.contentScore) /
        5,
    )

    const allIssues = [
      ...touchTargetResult.issues,
      ...viewportResult.issues,
      ...navigationResult.issues,
      ...performanceResult.issues,
      ...contentResult.issues,
    ]

    const allRecommendations = [
      ...viewportResult.recommendations,
      ...navigationResult.recommendations,
      ...performanceResult.recommendations,
      ...contentResult.recommendations,
    ]

    const criticalIssues = allIssues.filter(
      (issue) =>
        issue.includes("Missing viewport") ||
        issue.includes("Horizontal scrolling") ||
        issue.includes("No mobile navigation"),
    )

    return {
      overallScore,
      categoryScores,
      allIssues,
      allRecommendations,
      criticalIssues,
    }
  }

  optimizeTouchTargets(): void {
    const { targets } = this.analyzeTouchTargets()

    targets.forEach((target) => {
      if (!target.isAccessible) {
        const element = target.element as HTMLElement

        // Add minimum touch target size
        element.style.minWidth = `${this.MIN_TOUCH_TARGET_SIZE}px`
        element.style.minHeight = `${this.MIN_TOUCH_TARGET_SIZE}px`

        // Add padding if element is too small
        if (target.width < this.MIN_TOUCH_TARGET_SIZE || target.height < this.MIN_TOUCH_TARGET_SIZE) {
          const paddingX = Math.max(0, (this.MIN_TOUCH_TARGET_SIZE - target.width) / 2)
          const paddingY = Math.max(0, (this.MIN_TOUCH_TARGET_SIZE - target.height) / 2)

          element.style.paddingLeft = `${paddingX}px`
          element.style.paddingRight = `${paddingX}px`
          element.style.paddingTop = `${paddingY}px`
          element.style.paddingBottom = `${paddingY}px`
        }
      }
    })
  }

  addMobileOptimizations(): void {
    // Add viewport meta tag if missing
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement("meta")
      viewport.name = "viewport"
      viewport.content = "width=device-width, initial-scale=1"
      document.head.appendChild(viewport)
    }

    // Optimize touch targets
    this.optimizeTouchTargets()

    // Add mobile-specific CSS
    const mobileCSS = `
      @media (max-width: 768px) {
        body {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        
        button, a, input[type="button"], input[type="submit"] {
          min-width: 44px !important;
          min-height: 44px !important;
          padding: 12px 16px !important;
        }
        
        table {
          display: block !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
        }
        
        .mobile-hidden {
          display: none !important;
        }
        
        .mobile-full-width {
          width: 100% !important;
        }
      }
    `

    const style = document.createElement("style")
    style.textContent = mobileCSS
    document.head.appendChild(style)
  }
}

export const mobileOptimizer = new MobileOptimizer()
