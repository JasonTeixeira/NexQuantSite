import type { Metadata } from "next"

interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  canonicalUrl?: string
  ogImage?: string
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  structuredData?: any
  noIndex?: boolean
  noFollow?: boolean
}

interface PageSEOData {
  path: string
  title: string
  description: string
  keywords: string[]
  lastModified: Date
  priority: number
  changeFreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
}

export class SEOOptimizationEngine {
  private readonly baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexural.com"
  private readonly siteName = "NEXURAL Trading Platform"
  private readonly defaultImage = "/images/og-default.jpg"

  // Core trading keywords for the platform
  private readonly coreKeywords = [
    "trading platform",
    "algorithmic trading",
    "trading bots",
    "crypto trading",
    "forex trading",
    "automated trading",
    "trading signals",
    "technical analysis",
    "quantitative trading",
    "portfolio management",
    "risk management",
    "backtesting",
    "trading strategies",
    "market analysis",
    "financial technology",
    "fintech",
  ]

  generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage = this.defaultImage,
      twitterCard = "summary_large_image",
      noIndex = false,
      noFollow = false,
    } = config

    const fullTitle = title.includes("NEXURAL") ? title : `${title} | ${this.siteName}`
    const url = canonicalUrl || this.baseUrl

    return {
      title: fullTitle,
      description,
      keywords: [...keywords, ...this.coreKeywords].join(", "),

      // Basic meta tags
      robots: {
        index: !noIndex,
        follow: !noFollow,
        googleBot: {
          index: !noIndex,
          follow: !noFollow,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      // Canonical URL
      alternates: {
        canonical: url,
      },

      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        url,
        siteName: this.siteName,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: "en_US",
        type: "website",
      },

      // Twitter Card
      twitter: {
        card: twitterCard,
        title: fullTitle,
        description,
        images: [ogImage],
        creator: "@nexural",
        site: "@nexural",
      },

      // Additional meta tags
      other: {
        "theme-color": "#000000",
        "msapplication-TileColor": "#000000",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
      },
    }
  }

  generateStructuredData(type: string, data: any): string {
    const baseStructure = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    }

    // Add organization data for all structured data
    if (type !== "Organization") {
      baseStructure.publisher = {
        "@type": "Organization",
        name: this.siteName,
        url: this.baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${this.baseUrl}/images/logo.png`,
        },
      }
    }

    return JSON.stringify(baseStructure, null, 2)
  }

  generateOrganizationSchema(): string {
    return this.generateStructuredData("Organization", {
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description:
        "Advanced AI-powered trading platform with automated bots, signals, and comprehensive analytics for professional traders.",
      foundingDate: "2024",
      industry: "Financial Technology",
      numberOfEmployees: "50-100",
      address: {
        "@type": "PostalAddress",
        addressCountry: "US",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-NEXURAL",
        contactType: "customer service",
        availableLanguage: "English",
      },
      sameAs: ["https://twitter.com/nexural", "https://linkedin.com/company/nexural", "https://github.com/nexural"],
    })
  }

  generateWebsiteSchema(): string {
    return this.generateStructuredData("WebSite", {
      name: this.siteName,
      url: this.baseUrl,
      description: "Professional trading platform with AI-powered bots, real-time signals, and advanced analytics.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    })
  }

  generateArticleSchema(article: {
    title: string
    description: string
    content: string
    author: string
    publishDate: Date
    modifiedDate?: Date
    image?: string
    url: string
  }): string {
    return this.generateStructuredData("Article", {
      headline: article.title,
      description: article.description,
      image: article.image || this.defaultImage,
      author: {
        "@type": "Person",
        name: article.author,
      },
      datePublished: article.publishDate.toISOString(),
      dateModified: (article.modifiedDate || article.publishDate).toISOString(),
      url: article.url,
      wordCount: article.content.split(" ").length,
      articleSection: "Trading Education",
      inLanguage: "en-US",
    })
  }

  generateProductSchema(product: {
    name: string
    description: string
    price?: number
    currency?: string
    availability?: string
    rating?: number
    reviewCount?: number
  }): string {
    const productData: any = {
      name: product.name,
      description: product.description,
      brand: {
        "@type": "Brand",
        name: this.siteName,
      },
      category: "Trading Software",
    }

    if (product.price) {
      productData.offers = {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency || "USD",
        availability: `https://schema.org/${product.availability || "InStock"}`,
      }
    }

    if (product.rating && product.reviewCount) {
      productData.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
    }

    return this.generateStructuredData("Product", productData)
  }

  generateSitemap(pages: PageSEOData[]): string {
    const urlEntries = pages
      .map(
        (page) => `
  <url>
    <loc>${this.baseUrl}${page.path}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
      )
      .join("")

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/blog-sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/private/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /
Allow: /about
Allow: /pricing
Allow: /blog/
Allow: /indicators/
Allow: /bots/

# Crawl delay
Crawl-delay: 1`
  }

  optimizeContentForSEO(
    content: string,
    targetKeywords: string[],
  ): {
    optimizedContent: string
    keywordDensity: Record<string, number>
    recommendations: string[]
  } {
    const words = content.toLowerCase().split(/\s+/)
    const totalWords = words.length
    const recommendations: string[] = []

    // Calculate keyword density
    const keywordDensity: Record<string, number> = {}
    targetKeywords.forEach((keyword) => {
      const keywordWords = keyword.toLowerCase().split(" ")
      let count = 0

      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const phrase = words.slice(i, i + keywordWords.length).join(" ")
        if (phrase === keyword.toLowerCase()) {
          count++
        }
      }

      keywordDensity[keyword] = (count / totalWords) * 100
    })

    // Generate recommendations
    targetKeywords.forEach((keyword) => {
      const density = keywordDensity[keyword]
      if (density < 0.5) {
        recommendations.push(`Increase usage of "${keyword}" (current density: ${density.toFixed(2)}%)`)
      } else if (density > 3) {
        recommendations.push(
          `Reduce usage of "${keyword}" to avoid keyword stuffing (current density: ${density.toFixed(2)}%)`,
        )
      }
    })

    if (totalWords < 300) {
      recommendations.push("Content is too short. Aim for at least 300 words for better SEO.")
    }

    if (totalWords > 2000) {
      recommendations.push("Content is very long. Consider breaking it into multiple pages or sections.")
    }

    return {
      optimizedContent: content, // In a real implementation, this would apply optimizations
      keywordDensity,
      recommendations,
    }
  }

  generateMetaDescription(content: string, maxLength = 160): string {
    // Extract first meaningful paragraph
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    let description = sentences[0]?.trim() || ""

    // If too long, truncate at word boundary
    if (description.length > maxLength) {
      const words = description.split(" ")
      let truncated = ""

      for (const word of words) {
        if ((truncated + " " + word).length > maxLength - 3) {
          break
        }
        truncated += (truncated ? " " : "") + word
      }

      description = truncated + "..."
    }

    return description
  }

  analyzePageSEO(
    html: string,
    url: string,
  ): {
    score: number
    issues: Array<{ type: "error" | "warning" | "info"; message: string }>
    recommendations: string[]
  } {
    const issues: Array<{ type: "error" | "warning" | "info"; message: string }> = []
    const recommendations: string[] = []
    let score = 100

    // Check title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (!titleMatch) {
      issues.push({ type: "error", message: "Missing title tag" })
      score -= 20
    } else {
      const title = titleMatch[1]
      if (title.length < 30) {
        issues.push({ type: "warning", message: "Title too short (< 30 characters)" })
        score -= 10
      } else if (title.length > 60) {
        issues.push({ type: "warning", message: "Title too long (> 60 characters)" })
        score -= 5
      }
    }

    // Check meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (!descMatch) {
      issues.push({ type: "error", message: "Missing meta description" })
      score -= 15
    } else {
      const desc = descMatch[1]
      if (desc.length < 120) {
        issues.push({ type: "warning", message: "Meta description too short (< 120 characters)" })
        score -= 8
      } else if (desc.length > 160) {
        issues.push({ type: "warning", message: "Meta description too long (> 160 characters)" })
        score -= 5
      }
    }

    // Check H1 tags
    const h1Matches = html.match(/<h1[^>]*>/gi)
    if (!h1Matches) {
      issues.push({ type: "error", message: "Missing H1 tag" })
      score -= 15
    } else if (h1Matches.length > 1) {
      issues.push({ type: "warning", message: "Multiple H1 tags found" })
      score -= 10
    }

    // Check images without alt text
    const imgMatches = html.match(/<img[^>]*>/gi) || []
    const imagesWithoutAlt = imgMatches.filter((img: string) => !img.includes("alt=")).length
    if (imagesWithoutAlt > 0) {
      issues.push({ type: "warning", message: `${imagesWithoutAlt} images missing alt text` })
      score -= Math.min(15, imagesWithoutAlt * 2)
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push("Address critical SEO issues to improve search visibility")
    }
    if (issues.some((issue) => issue.message.includes("title"))) {
      recommendations.push("Optimize title tag length and include target keywords")
    }
    if (issues.some((issue) => issue.message.includes("description"))) {
      recommendations.push("Write compelling meta descriptions that encourage clicks")
    }

    return { score: Math.max(0, score), issues, recommendations }
  }
}

export const seoEngine = new SEOOptimizationEngine()
