interface SEOMetrics {
  technicalScore: number
  contentScore: number
  performanceScore: number
  structureScore: number
  socialScore: number
}

interface SEOIssue {
  type: "critical" | "warning" | "info"
  category: string
  message: string
  element?: Element
  recommendation: string
}

export class SEOOptimizer {
  private issues: SEOIssue[] = []

  analyzeTechnicalSEO(): { score: number; issues: SEOIssue[] } {
    const issues: SEOIssue[] = []
    let score = 100

    // Check title tag
    const title = document.querySelector("title")
    if (!title) {
      issues.push({
        type: "critical",
        category: "Technical",
        message: "Missing title tag",
        recommendation: "Add a descriptive title tag to every page",
      })
      score -= 25
    } else {
      const titleLength = title.textContent?.length || 0
      if (titleLength < 30) {
        issues.push({
          type: "warning",
          category: "Technical",
          message: "Title tag too short",
          element: title,
          recommendation: "Title should be 30-60 characters long",
        })
        score -= 10
      } else if (titleLength > 60) {
        issues.push({
          type: "warning",
          category: "Technical",
          message: "Title tag too long",
          element: title,
          recommendation: "Title should be 30-60 characters long",
        })
        score -= 5
      }
    }

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement
    if (!metaDesc) {
      issues.push({
        type: "critical",
        category: "Technical",
        message: "Missing meta description",
        recommendation: "Add a compelling meta description to improve click-through rates",
      })
      score -= 20
    } else {
      const descLength = metaDesc.content?.length || 0
      if (descLength < 120) {
        issues.push({
          type: "warning",
          category: "Technical",
          message: "Meta description too short",
          element: metaDesc,
          recommendation: "Meta description should be 120-160 characters long",
        })
        score -= 10
      } else if (descLength > 160) {
        issues.push({
          type: "warning",
          category: "Technical",
          message: "Meta description too long",
          element: metaDesc,
          recommendation: "Meta description should be 120-160 characters long",
        })
        score -= 5
      }
    }

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      issues.push({
        type: "warning",
        category: "Technical",
        message: "Missing canonical URL",
        recommendation: "Add canonical URL to prevent duplicate content issues",
      })
      score -= 10
    }

    // Check robots meta tag
    const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement
    if (robots && robots.content.includes("noindex")) {
      issues.push({
        type: "critical",
        category: "Technical",
        message: "Page set to noindex",
        element: robots,
        recommendation: "Remove noindex directive if page should be indexed",
      })
      score -= 30
    }

    // Check for HTTPS
    if (location.protocol !== "https:") {
      issues.push({
        type: "critical",
        category: "Technical",
        message: "Site not using HTTPS",
        recommendation: "Implement SSL certificate for security and SEO benefits",
      })
      score -= 25
    }

    return { score: Math.max(0, score), issues }
  }

  analyzeContentSEO(): { score: number; issues: SEOIssue[] } {
    const issues: SEOIssue[] = []
    let score = 100

    // Check heading structure
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const h1s = document.querySelectorAll("h1")

    if (h1s.length === 0) {
      issues.push({
        type: "critical",
        category: "Content",
        message: "Missing H1 tag",
        recommendation: "Add exactly one H1 tag per page with primary keyword",
      })
      score -= 25
    } else if (h1s.length > 1) {
      issues.push({
        type: "warning",
        category: "Content",
        message: "Multiple H1 tags found",
        recommendation: "Use only one H1 tag per page",
      })
      score -= 15
    }

    // Check heading hierarchy
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
      issues.push({
        type: "warning",
        category: "Content",
        message: "Heading hierarchy issues",
        recommendation: "Maintain proper heading hierarchy (H1 → H2 → H3, etc.)",
      })
      score -= 10
    }

    // Check images alt text
    const images = document.querySelectorAll("img")
    let imagesWithoutAlt = 0

    images.forEach((img) => {
      if (!img.alt || img.alt.trim() === "") {
        imagesWithoutAlt++
      }
    })

    if (imagesWithoutAlt > 0) {
      issues.push({
        type: "warning",
        category: "Content",
        message: `${imagesWithoutAlt} images missing alt text`,
        recommendation: "Add descriptive alt text to all images",
      })
      score -= Math.min(20, imagesWithoutAlt * 2)
    }

    // Check content length
    const textContent = document.body.textContent || ""
    const wordCount = textContent.trim().split(/\s+/).length

    if (wordCount < 300) {
      issues.push({
        type: "warning",
        category: "Content",
        message: "Content too short",
        recommendation: "Add more valuable content (aim for 300+ words)",
      })
      score -= 15
    }

    // Check for internal links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href*="' + location.hostname + '"]')
    if (internalLinks.length < 3) {
      issues.push({
        type: "info",
        category: "Content",
        message: "Few internal links found",
        recommendation: "Add more internal links to improve site navigation and SEO",
      })
      score -= 5
    }

    return { score: Math.max(0, score), issues }
  }

  analyzeStructuredData(): { score: number; issues: SEOIssue[] } {
    const issues: SEOIssue[] = []
    let score = 100

    // Check for JSON-LD structured data
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    if (jsonLdScripts.length === 0) {
      issues.push({
        type: "warning",
        category: "Structure",
        message: "No structured data found",
        recommendation: "Add JSON-LD structured data for better search results",
      })
      score -= 20
    } else {
      // Validate JSON-LD
      jsonLdScripts.forEach((script) => {
        try {
          JSON.parse(script.textContent || "")
        } catch (e) {
          issues.push({
            type: "critical",
            category: "Structure",
            message: "Invalid JSON-LD structured data",
            element: script,
            recommendation: "Fix JSON syntax errors in structured data",
          })
          score -= 15
        }
      })
    }

    // Check for Open Graph tags
    const ogTags = document.querySelectorAll('meta[property^="og:"]')
    if (ogTags.length < 4) {
      // title, description, image, url
      issues.push({
        type: "warning",
        category: "Structure",
        message: "Incomplete Open Graph tags",
        recommendation: "Add og:title, og:description, og:image, and og:url tags",
      })
      score -= 15
    }

    // Check for Twitter Card tags
    const twitterTags = document.querySelectorAll('meta[name^="twitter:"]')
    if (twitterTags.length < 2) {
      issues.push({
        type: "info",
        category: "Structure",
        message: "Missing Twitter Card tags",
        recommendation: "Add Twitter Card meta tags for better social sharing",
      })
      score -= 10
    }

    return { score: Math.max(0, score), issues }
  }

  analyzePerformanceSEO(): { score: number; issues: SEOIssue[] } {
    const issues: SEOIssue[] = []
    let score = 100

    // Check page load speed (simplified)
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      if (loadTime > 3000) {
        issues.push({
          type: "critical",
          category: "Performance",
          message: "Slow page load time",
          recommendation: "Optimize images, minify CSS/JS, and improve server response time",
        })
        score -= 25
      } else if (loadTime > 2000) {
        issues.push({
          type: "warning",
          category: "Performance",
          message: "Page load time could be improved",
          recommendation: "Consider optimizing resources for faster loading",
        })
        score -= 10
      }
    }

    // Check for mobile-friendliness
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      issues.push({
        type: "critical",
        category: "Performance",
        message: "Not mobile-friendly",
        recommendation: "Add viewport meta tag and ensure responsive design",
      })
      score -= 30
    }

    // Check for lazy loading
    const images = document.querySelectorAll("img")
    let lazyImages = 0

    images.forEach((img) => {
      if (img.hasAttribute("loading") && img.getAttribute("loading") === "lazy") {
        lazyImages++
      }
    })

    if (images.length > 5 && lazyImages / images.length < 0.5) {
      issues.push({
        type: "info",
        category: "Performance",
        message: "Consider implementing lazy loading for images",
        recommendation: 'Add loading="lazy" attribute to images below the fold',
      })
      score -= 5
    }

    return { score: Math.max(0, score), issues }
  }

  getSEOScore(): SEOMetrics {
    const technicalResult = this.analyzeTechnicalSEO()
    const contentResult = this.analyzeContentSEO()
    const structureResult = this.analyzeStructuredData()
    const performanceResult = this.analyzePerformanceSEO()

    // Social score is based on Open Graph and Twitter Card implementation
    const socialScore = Math.max(
      0,
      100 -
        structureResult.issues.filter(
          (issue) => issue.message.includes("Open Graph") || issue.message.includes("Twitter"),
        ).length *
          15,
    )

    return {
      technicalScore: technicalResult.score,
      contentScore: contentResult.score,
      performanceScore: performanceResult.score,
      structureScore: structureResult.score,
      socialScore,
    }
  }

  generateSEOReport(): {
    overallScore: number
    categoryScores: SEOMetrics
    allIssues: SEOIssue[]
    criticalIssues: SEOIssue[]
    recommendations: string[]
  } {
    const technicalResult = this.analyzeTechnicalSEO()
    const contentResult = this.analyzeContentSEO()
    const structureResult = this.analyzeStructuredData()
    const performanceResult = this.analyzePerformanceSEO()

    const categoryScores = this.getSEOScore()

    const overallScore = Math.round(
      (categoryScores.technicalScore +
        categoryScores.contentScore +
        categoryScores.performanceScore +
        categoryScores.structureScore +
        categoryScores.socialScore) /
        5,
    )

    const allIssues = [
      ...technicalResult.issues,
      ...contentResult.issues,
      ...structureResult.issues,
      ...performanceResult.issues,
    ]

    const criticalIssues = allIssues.filter((issue) => issue.type === "critical")

    const recommendations = Array.from(new Set(allIssues.map((issue) => issue.recommendation)))

    return {
      overallScore,
      categoryScores,
      allIssues,
      criticalIssues,
      recommendations,
    }
  }

  optimizePage(): void {
    // Add missing meta tags
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement("meta")
      viewport.name = "viewport"
      viewport.content = "width=device-width, initial-scale=1"
      document.head.appendChild(viewport)
    }

    // Add lazy loading to images
    const images = document.querySelectorAll("img")
    images.forEach((img, index) => {
      if (index > 2 && !img.hasAttribute("loading")) {
        // Skip first 3 images
        img.setAttribute("loading", "lazy")
      }
    })

    // Add alt text to images without it
    images.forEach((img) => {
      if (!img.alt) {
        img.alt = "Image" // Basic alt text - should be customized
      }
    })
  }

  generateStructuredData(type: "Organization" | "WebSite" | "Article", data: any): string {
    const baseStructure = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    }

    return JSON.stringify(baseStructure, null, 2)
  }

  addStructuredData(structuredData: string): void {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.textContent = structuredData
    document.head.appendChild(script)
  }
}

export const seoOptimizer = new SEOOptimizer()
