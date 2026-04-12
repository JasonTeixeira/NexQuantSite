import { NextRequest, NextResponse } from "next/server"

// SEO Analysis and Optimization Service
interface SEOAnalysis {
  score: number // 0-100
  issues: SEOIssue[]
  recommendations: SEORecommendation[]
  keywordAnalysis: KeywordAnalysis
  readabilityScore: number
  metaAnalysis: MetaAnalysis
}

interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  category: string
  issue: string
  impact: 'high' | 'medium' | 'low'
  fix: string
}

interface SEORecommendation {
  category: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  implementation: string
}

interface KeywordAnalysis {
  primaryKeyword: string | null
  keywordDensity: { [key: string]: number }
  suggestedKeywords: string[]
  longTailKeywords: string[]
  competitorKeywords: string[]
}

interface MetaAnalysis {
  title: {
    length: number
    optimal: boolean
    suggestions: string[]
  }
  description: {
    length: number
    optimal: boolean
    suggestions: string[]
  }
  keywords: string[]
  openGraph: {
    present: boolean
    missing: string[]
  }
  structuredData: {
    present: boolean
    types: string[]
  }
}

interface BlogPost {
  id: number
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  slug: string
  publishedAt?: string
}

class SEOOptimizationService {
  private tradingKeywords = [
    'trading', 'forex', 'stocks', 'cryptocurrency', 'bitcoin', 'ethereum',
    'technical analysis', 'fundamental analysis', 'trading strategy', 'risk management',
    'portfolio', 'investment', 'market analysis', 'trading signals', 'trading bot',
    'algorithmic trading', 'day trading', 'swing trading', 'scalping', 'options trading',
    'futures trading', 'margin trading', 'leverage', 'volatility', 'liquidity',
    'bull market', 'bear market', 'support', 'resistance', 'trend analysis',
    'candlestick patterns', 'moving averages', 'RSI', 'MACD', 'bollinger bands',
    'fibonacci retracement', 'market sentiment', 'trading psychology'
  ]

  analyzeContent(post: BlogPost): SEOAnalysis {
    const content = `${post.title} ${post.content} ${post.excerpt}`.toLowerCase()
    const wordCount = content.split(/\s+/).length
    const issues: SEOIssue[] = []
    const recommendations: SEORecommendation[] = []

    // Title Analysis
    const titleAnalysis = this.analyzeTitle(post.title, post.seoTitle)
    issues.push(...titleAnalysis.issues)
    recommendations.push(...titleAnalysis.recommendations)

    // Content Analysis
    const contentAnalysis = this.analyzeContentStructure(post.content)
    issues.push(...contentAnalysis.issues)
    recommendations.push(...contentAnalysis.recommendations)

    // Meta Description Analysis
    const metaAnalysis = this.analyzeMetaDescription(post.seoDescription, post.excerpt)
    issues.push(...metaAnalysis.issues)
    recommendations.push(...metaAnalysis.recommendations)

    // Keyword Analysis
    const keywordAnalysis = this.analyzeKeywords(content, post.tags)

    // Readability Analysis
    const readabilityScore = this.calculateReadabilityScore(post.content)

    // Calculate overall SEO score
    const score = this.calculateSEOScore(issues, wordCount, keywordAnalysis, readabilityScore)

    return {
      score,
      issues,
      recommendations,
      keywordAnalysis,
      readabilityScore,
      metaAnalysis: {
        title: {
          length: (post.seoTitle || post.title).length,
          optimal: (post.seoTitle || post.title).length >= 30 && (post.seoTitle || post.title).length <= 60,
          suggestions: this.generateTitleSuggestions(post.title, keywordAnalysis.primaryKeyword)
        },
        description: {
          length: (post.seoDescription || post.excerpt).length,
          optimal: (post.seoDescription || post.excerpt).length >= 120 && (post.seoDescription || post.excerpt).length <= 160,
          suggestions: this.generateDescriptionSuggestions(post.content, keywordAnalysis.primaryKeyword)
        },
        keywords: post.tags,
        openGraph: {
          present: false, // Would check for OG tags in production
          missing: ['og:title', 'og:description', 'og:image', 'og:type']
        },
        structuredData: {
          present: false, // Would check for structured data in production
          types: []
        }
      }
    }
  }

  private analyzeTitle(title: string, seoTitle?: string): { issues: SEOIssue[], recommendations: SEORecommendation[] } {
    const issues: SEOIssue[] = []
    const recommendations: SEORecommendation[] = []
    const titleToAnalyze = seoTitle || title
    
    if (titleToAnalyze.length < 30) {
      issues.push({
        type: 'warning',
        category: 'Title',
        issue: 'Title is too short',
        impact: 'medium',
        fix: 'Expand title to 30-60 characters for better SEO'
      })
    }

    if (titleToAnalyze.length > 60) {
      issues.push({
        type: 'error',
        category: 'Title',
        issue: 'Title is too long',
        impact: 'high',
        fix: 'Shorten title to under 60 characters to avoid truncation'
      })
    }

    if (!this.containsKeywords(titleToAnalyze, this.tradingKeywords)) {
      recommendations.push({
        category: 'Title',
        recommendation: 'Include relevant trading keywords in title',
        priority: 'high',
        implementation: 'Add keywords like "trading", "strategy", or "analysis" to improve discoverability'
      })
    }

    return { issues, recommendations }
  }

  private analyzeContentStructure(content: string): { issues: SEOIssue[], recommendations: SEORecommendation[] } {
    const issues: SEOIssue[] = []
    const recommendations: SEORecommendation[] = []
    
    const wordCount = content.split(/\s+/).length
    const headings = (content.match(/#{1,6}\s/g) || []).length
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length
    
    if (wordCount < 300) {
      issues.push({
        type: 'error',
        category: 'Content Length',
        issue: 'Content too short',
        impact: 'high',
        fix: 'Expand content to at least 300 words'
      })
    }

    if (wordCount > 3000) {
      recommendations.push({
        category: 'Content Length',
        recommendation: 'Consider breaking into multiple posts',
        priority: 'low',
        implementation: 'Very long content can be split into a series'
      })
    }

    if (headings === 0) {
      issues.push({
        type: 'warning',
        category: 'Content Structure',
        issue: 'No headings found',
        impact: 'medium',
        fix: 'Add H1, H2, and H3 headings to improve structure'
      })
    }

    if (paragraphs < 3) {
      issues.push({
        type: 'warning',
        category: 'Content Structure',
        issue: 'Too few paragraphs',
        impact: 'low',
        fix: 'Break content into more paragraphs for better readability'
      })
    }

    return { issues, recommendations }
  }

  private analyzeMetaDescription(seoDescription?: string, excerpt?: string): { issues: SEOIssue[], recommendations: SEORecommendation[] } {
    const issues: SEOIssue[] = []
    const recommendations: SEORecommendation[] = []
    const description = seoDescription || excerpt || ''
    
    if (description.length === 0) {
      issues.push({
        type: 'error',
        category: 'Meta Description',
        issue: 'No meta description',
        impact: 'high',
        fix: 'Add a compelling meta description'
      })
    } else if (description.length < 120) {
      issues.push({
        type: 'warning',
        category: 'Meta Description',
        issue: 'Meta description too short',
        impact: 'medium',
        fix: 'Expand to 120-160 characters'
      })
    } else if (description.length > 160) {
      issues.push({
        type: 'error',
        category: 'Meta Description',
        issue: 'Meta description too long',
        impact: 'high',
        fix: 'Shorten to under 160 characters'
      })
    }

    return { issues, recommendations }
  }

  private analyzeKeywords(content: string, tags: string[]): KeywordAnalysis {
    const words = content.split(/\s+/).filter(word => word.length > 3)
    const wordFreq: { [key: string]: number } = {}
    
    // Calculate word frequency
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '').toLowerCase()
      if (cleaned.length > 3) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1
      }
    })

    // Calculate keyword density
    const totalWords = words.length
    const keywordDensity: { [key: string]: number } = {}
    
    Object.entries(wordFreq).forEach(([word, count]) => {
      keywordDensity[word] = (count / totalWords) * 100
    })

    // Find primary keyword (most frequent relevant keyword)
    const tradingWords = Object.keys(keywordDensity)
      .filter(word => this.tradingKeywords.some(tk => tk.includes(word) || word.includes(tk)))
      .sort((a, b) => keywordDensity[b] - keywordDensity[a])

    const primaryKeyword = tradingWords[0] || null

    // Generate suggested keywords
    const suggestedKeywords = this.tradingKeywords
      .filter(keyword => content.includes(keyword))
      .slice(0, 10)

    // Generate long-tail keywords
    const longTailKeywords = this.generateLongTailKeywords(content, tags)

    // Mock competitor keywords (in production, use SEO tools APIs)
    const competitorKeywords = this.tradingKeywords.slice(0, 15)

    return {
      primaryKeyword,
      keywordDensity,
      suggestedKeywords,
      longTailKeywords,
      competitorKeywords
    }
  }

  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = content.split(/\s+/)
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0)
    
    if (sentences.length === 0 || words.length === 0) return 0

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    
    return Math.max(0, Math.min(100, fleschScore))
  }

  private countSyllables(word: string): number {
    const vowels = 'aeiouyAEIOUY'
    let count = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        count++
      }
      previousWasVowel = isVowel
    }

    // Handle silent 'e'
    if (word.endsWith('e') && count > 1) {
      count--
    }

    return Math.max(1, count)
  }

  private calculateSEOScore(issues: SEOIssue[], wordCount: number, keywordAnalysis: KeywordAnalysis, readabilityScore: number): number {
    let score = 100

    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.impact) {
        case 'high':
          score -= 15
          break
        case 'medium':
          score -= 8
          break
        case 'low':
          score -= 3
          break
      }
    })

    // Content length bonus
    if (wordCount >= 300 && wordCount <= 2000) {
      score += 10
    }

    // Primary keyword bonus
    if (keywordAnalysis.primaryKeyword) {
      score += 10
    }

    // Readability bonus
    if (readabilityScore >= 60) {
      score += 5
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  private generateTitleSuggestions(originalTitle: string, primaryKeyword: string | null): string[] {
    const suggestions = []
    const year = new Date().getFullYear()
    
    if (primaryKeyword) {
      suggestions.push(`${originalTitle} - ${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)} Guide ${year}`)
      suggestions.push(`Complete Guide to ${primaryKeyword}: ${originalTitle}`)
      suggestions.push(`${originalTitle}: Expert ${primaryKeyword} Strategies`)
    }
    
    suggestions.push(
      `${originalTitle} - Comprehensive Trading Guide`,
      `${originalTitle}: Professional Trading Insights`,
      `Master ${originalTitle} - Advanced Trading Strategies`
    )

    return suggestions.slice(0, 3)
  }

  private generateDescriptionSuggestions(content: string, primaryKeyword: string | null): string[] {
    const firstSentence = content.split('.')[0]?.trim() || ''
    const suggestions = []

    if (primaryKeyword) {
      suggestions.push(`Learn ${primaryKeyword} with our comprehensive guide. ${firstSentence}. Get expert insights and proven strategies.`)
      suggestions.push(`Discover advanced ${primaryKeyword} techniques and strategies. ${firstSentence}. Perfect for traders of all levels.`)
    }

    suggestions.push(
      `${firstSentence}. Expert trading insights, proven strategies, and comprehensive analysis for modern traders.`,
      `Professional trading guide covering advanced strategies and market analysis. ${firstSentence}. Start improving your trading today.`,
      `Comprehensive trading education and market insights. ${firstSentence}. Learn from experts and enhance your trading skills.`
    )

    return suggestions
      .filter(s => s.length >= 120 && s.length <= 160)
      .slice(0, 3)
  }

  private generateLongTailKeywords(content: string, tags: string[]): string[] {
    const longTail = []
    const year = new Date().getFullYear()

    // Generate from tags
    tags.forEach(tag => {
      longTail.push(
        `${tag} strategy ${year}`,
        `how to ${tag}`,
        `${tag} for beginners`,
        `best ${tag} techniques`,
        `${tag} trading guide`
      )
    })

    // Generate from content keywords
    const contentWords = content.toLowerCase().split(/\s+/)
    this.tradingKeywords.forEach(keyword => {
      if (contentWords.some(word => word.includes(keyword))) {
        longTail.push(
          `${keyword} strategy guide`,
          `learn ${keyword} trading`,
          `${keyword} for beginners ${year}`,
          `advanced ${keyword} techniques`
        )
      }
    })

    return [...new Set(longTail)].slice(0, 10)
  }

  generateSitemap(posts: BlogPost[]): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexural.com'
    const publishedPosts = posts.filter(post => post.publishedAt)

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`

    publishedPosts.forEach(post => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${post.publishedAt}</lastmod>
  </url>`
    })

    sitemap += '\n</urlset>'
    return sitemap
  }

  generateStructuredData(post: BlogPost): object {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.seoTitle || post.title,
      "description": post.seoDescription || post.excerpt,
      "author": {
        "@type": "Organization",
        "name": "Nexural Trading"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nexural Trading",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
        }
      },
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
      },
      "keywords": post.tags.join(", "),
      "articleSection": post.category,
      "inLanguage": "en-US"
    }
  }
}

const seoService = new SEOOptimizationService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'analyze':
        const analysis = seoService.analyzeContent(data)
        return NextResponse.json({
          success: true,
          analysis
        })

      case 'generate_sitemap':
        const sitemap = seoService.generateSitemap(data.posts || [])
        return NextResponse.json({
          success: true,
          sitemap
        })

      case 'generate_structured_data':
        const structuredData = seoService.generateStructuredData(data.post)
        return NextResponse.json({
          success: true,
          structuredData
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('SEO analysis failed:', error)
    return NextResponse.json(
      { success: false, error: 'SEO analysis failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'keywords') {
      // Return trading-related keyword suggestions
      return NextResponse.json({
        success: true,
        keywords: {
          primary: seoService['tradingKeywords'].slice(0, 20),
          longTail: [
            'algorithmic trading strategies 2024',
            'cryptocurrency trading for beginners',
            'forex risk management techniques',
            'day trading psychology tips',
            'technical analysis indicators guide',
            'options trading strategies profitable',
            'swing trading setup examples',
            'crypto portfolio diversification'
          ],
          trending: [
            'AI trading bots',
            'DeFi yield farming',
            'NFT trading strategies',
            'ESG investing',
            'quantum computing finance',
            'blockchain trading'
          ]
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    console.error('Failed to process SEO request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}


