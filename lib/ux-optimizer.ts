interface UXMetrics {
  usabilityScore: number
  accessibilityScore: number
  visualDesignScore: number
  interactionScore: number
  contentScore: number
}

interface UserBehaviorData {
  clickHeatmap: { x: number; y: number; count: number }[]
  scrollDepth: number[]
  timeOnPage: number[]
  bounceRate: number
  conversionRate: number
}

export class UXOptimizer {
  private behaviorData: UserBehaviorData = {
    clickHeatmap: [],
    scrollDepth: [],
    timeOnPage: [],
    bounceRate: 0,
    conversionRate: 0,
  }

  private observers: IntersectionObserver[] = []

  constructor() {
    this.initializeTracking()
  }

  private initializeTracking(): void {
    if (typeof window === "undefined") return

    // Track clicks for heatmap
    document.addEventListener("click", (event) => {
      this.behaviorData.clickHeatmap.push({
        x: event.clientX,
        y: event.clientY,
        count: 1,
      })
    })

    // Track scroll depth
    let maxScroll = 0
    window.addEventListener("scroll", () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      maxScroll = Math.max(maxScroll, scrollPercent)
    })

    window.addEventListener("beforeunload", () => {
      this.behaviorData.scrollDepth.push(maxScroll)
    })

    // Track time on page
    const startTime = Date.now()
    window.addEventListener("beforeunload", () => {
      this.behaviorData.timeOnPage.push(Date.now() - startTime)
    })
  }

  checkAccessibility(): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check for alt text on images
    const images = document.querySelectorAll("img")
    const imagesWithoutAlt = Array.from(images).filter((img) => !img.alt)
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`)
      recommendations.push("Add descriptive alt text to all images")
      score -= 15
    }

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    let previousLevel = 0
    let hierarchyIssues = 0

    headings.forEach((heading) => {
      const currentLevel = Number.parseInt(heading.tagName.charAt(1))
      if (currentLevel > previousLevel + 1) {
        hierarchyIssues++
      }
      previousLevel = currentLevel
    })

    if (hierarchyIssues > 0) {
      issues.push("Heading hierarchy issues detected")
      recommendations.push("Ensure proper heading hierarchy (h1 → h2 → h3, etc.)")
      score -= 10
    }

    // Check for form labels
    const inputs = document.querySelectorAll("input, select, textarea")
    const inputsWithoutLabels = Array.from(inputs).filter((input) => {
      const id = input.getAttribute("id")
      return !id || !document.querySelector(`label[for="${id}"]`)
    })

    if (inputsWithoutLabels.length > 0) {
      issues.push(`${inputsWithoutLabels.length} form inputs missing labels`)
      recommendations.push("Associate all form inputs with descriptive labels")
      score -= 20
    }

    // Check color contrast (simplified check)
    const elements = document.querySelectorAll("*")
    let contrastIssues = 0

    Array.from(elements)
      .slice(0, 100)
      .forEach((element) => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor

        // Simplified contrast check - in reality, you'd use a proper contrast calculation
        if (color && backgroundColor && color !== "rgba(0, 0, 0, 0)" && backgroundColor !== "rgba(0, 0, 0, 0)") {
          // This is a simplified check - real implementation would calculate actual contrast ratios
          if (color === backgroundColor) {
            contrastIssues++
          }
        }
      })

    if (contrastIssues > 0) {
      issues.push("Potential color contrast issues detected")
      recommendations.push("Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)")
      score -= 15
    }

    return { score: Math.max(0, score), issues, recommendations }
  }

  analyzeUsability(): { score: number; insights: string[]; improvements: string[] } {
    const insights: string[] = []
    const improvements: string[] = []
    let score = 100

    // Analyze click patterns
    if (this.behaviorData.clickHeatmap.length > 0) {
      const clickClusters = this.analyzeClickClusters()
      if (clickClusters.dispersed) {
        insights.push("Users are clicking in many different areas - interface may be confusing")
        improvements.push("Simplify navigation and make primary actions more prominent")
        score -= 15
      }
    }

    // Analyze scroll behavior
    const avgScrollDepth =
      this.behaviorData.scrollDepth.reduce((a, b) => a + b, 0) / this.behaviorData.scrollDepth.length
    if (avgScrollDepth < 50) {
      insights.push("Users are not scrolling far down the page")
      improvements.push("Move important content higher up or improve content engagement")
      score -= 10
    }

    // Analyze time on page
    const avgTimeOnPage = this.behaviorData.timeOnPage.reduce((a, b) => a + b, 0) / this.behaviorData.timeOnPage.length
    if (avgTimeOnPage < 30000) {
      // Less than 30 seconds
      insights.push("Users are spending very little time on the page")
      improvements.push("Improve content quality and page loading speed")
      score -= 20
    }

    // Check for mobile responsiveness
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      const mobileIssues = this.checkMobileUsability()
      if (mobileIssues.length > 0) {
        insights.push("Mobile usability issues detected")
        improvements.push("Optimize for mobile devices with larger touch targets and better spacing")
        score -= 25
      }
    }

    return { score: Math.max(0, score), insights, improvements }
  }

  private analyzeClickClusters(): { dispersed: boolean; clusters: number } {
    // Simplified clustering analysis
    const clusters = new Map<string, number>()

    this.behaviorData.clickHeatmap.forEach((click) => {
      const gridX = Math.floor(click.x / 100) * 100
      const gridY = Math.floor(click.y / 100) * 100
      const key = `${gridX},${gridY}`
      clusters.set(key, (clusters.get(key) || 0) + 1)
    })

    return {
      dispersed: clusters.size > 10,
      clusters: clusters.size,
    }
  }

  private checkMobileUsability(): string[] {
    const issues: string[] = []

    // Check touch target sizes
    const clickableElements = document.querySelectorAll("button, a, input, select")
    Array.from(clickableElements).forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.width < 44 || rect.height < 44) {
        issues.push("Touch targets too small")
      }
    })

    // Check for horizontal scrolling
    if (document.body.scrollWidth > window.innerWidth) {
      issues.push("Horizontal scrolling detected")
    }

    return issues
  }

  getUXScore(): UXMetrics {
    const accessibilityResult = this.checkAccessibility()
    const usabilityResult = this.analyzeUsability()

    return {
      usabilityScore: usabilityResult.score,
      accessibilityScore: accessibilityResult.score,
      visualDesignScore: this.calculateVisualDesignScore(),
      interactionScore: this.calculateInteractionScore(),
      contentScore: this.calculateContentScore(),
    }
  }

  private calculateVisualDesignScore(): number {
    let score = 100

    // Check for consistent spacing
    const elements = document.querySelectorAll("*")
    const margins = new Set<string>()
    const paddings = new Set<string>()

    Array.from(elements)
      .slice(0, 50)
      .forEach((element) => {
        const styles = window.getComputedStyle(element)
        margins.add(styles.margin)
        paddings.add(styles.padding)
      })

    if (margins.size > 10) score -= 10 // Too many different margin values
    if (paddings.size > 10) score -= 10 // Too many different padding values

    return Math.max(0, score)
  }

  private calculateInteractionScore(): number {
    let score = 100

    // Check for loading states
    const buttons = document.querySelectorAll("button")
    const buttonsWithLoadingStates = Array.from(buttons).filter(
      (button) => button.hasAttribute("data-loading") || button.querySelector(".loading"),
    )

    if (buttonsWithLoadingStates.length / buttons.length < 0.5) {
      score -= 15 // Less than 50% of buttons have loading states
    }

    return Math.max(0, score)
  }

  private calculateContentScore(): number {
    let score = 100

    // Check for empty states
    const containers = document.querySelectorAll("[data-empty-state]")
    if (containers.length === 0) {
      score -= 20 // No empty states defined
    }

    // Check for error handling
    const errorElements = document.querySelectorAll("[data-error], .error-message")
    if (errorElements.length === 0) {
      score -= 15 // No error handling visible
    }

    return Math.max(0, score)
  }

  generateUXReport(): {
    overallScore: number
    categoryScores: UXMetrics
    recommendations: string[]
    criticalIssues: string[]
  } {
    const categoryScores = this.getUXScore()
    const accessibilityCheck = this.checkAccessibility()
    const usabilityCheck = this.analyzeUsability()

    const overallScore = Math.round(
      (categoryScores.usabilityScore +
        categoryScores.accessibilityScore +
        categoryScores.visualDesignScore +
        categoryScores.interactionScore +
        categoryScores.contentScore) /
        5,
    )

    const recommendations = [...accessibilityCheck.recommendations, ...usabilityCheck.improvements]

    const criticalIssues = [
      ...accessibilityCheck.issues.filter((issue) => issue.includes("missing")),
      ...usabilityCheck.insights.filter((insight) => insight.includes("confusing")),
    ]

    return {
      overallScore,
      categoryScores,
      recommendations,
      criticalIssues,
    }
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

export const uxOptimizer = new UXOptimizer()
