/**
 * SEO Sitemap Generator - Professional Grade
 * Generates XML sitemaps with proper priorities and change frequencies
 */

export interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: {
    lang: string
    href: string
  }[]
}

export interface SitemapConfig {
  baseUrl: string
  defaultChangefreq: SitemapEntry['changefreq']
  defaultPriority: number
  excludePatterns?: string[]
  includeImages?: boolean
  includeVideos?: boolean
}

// Static pages with SEO priorities
export const STATIC_PAGES: SitemapEntry[] = [
  // Core Platform Pages (Highest Priority)
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/login',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    url: '/register',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    url: '/dashboard',
    changefreq: 'daily',
    priority: 0.9
  },

  // Marketing Pages (High Priority)
  {
    url: '/pricing',
    changefreq: 'weekly',
    priority: 0.9
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.7
  },

  // Trading Platform Pages (High Priority)
  {
    url: '/backtesting',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/backtesting/learn',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/indicators',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/strategy-lab',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/options-flow',
    changefreq: 'daily',
    priority: 0.7
  },

  // Educational Content (Medium-High Priority)
  {
    url: '/learn',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/learning',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/training',
    changefreq: 'monthly',
    priority: 0.6
  },
  {
    url: '/glossary',
    changefreq: 'monthly',
    priority: 0.6
  },

  // Support & Help (Medium Priority)
  {
    url: '/help',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/status',
    changefreq: 'daily',
    priority: 0.6
  },

  // Community & Social (Medium Priority)
  {
    url: '/community',
    changefreq: 'daily',
    priority: 0.7
  },
  {
    url: '/blog',
    changefreq: 'daily',
    priority: 0.8
  },
  {
    url: '/leaderboard',
    changefreq: 'daily',
    priority: 0.6
  },

  // Business Pages (Medium Priority)
  {
    url: '/investors',
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    url: '/jobs',
    changefreq: 'weekly',
    priority: 0.5
  },
  {
    url: '/referrals',
    changefreq: 'monthly',
    priority: 0.6
  },

  // Legal Pages (Lower Priority)
  {
    url: '/legal',
    changefreq: 'monthly',
    priority: 0.4
  },
  {
    url: '/terms',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    url: '/privacy',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    url: '/risk',
    changefreq: 'yearly',
    priority: 0.3
  },

  // Tools & Features (Medium Priority)
  {
    url: '/bots',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/automation',
    changefreq: 'weekly',
    priority: 0.7
  },
  {
    url: '/signals-pro',
    changefreq: 'daily',
    priority: 0.7
  },
  {
    url: '/risk-calculator',
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    url: '/marketplace',
    changefreq: 'weekly',
    priority: 0.6
  },
  {
    url: '/quant',
    changefreq: 'weekly',
    priority: 0.6
  }
]

// Dynamic content generators
export const getDynamicBlogPosts = async (): Promise<SitemapEntry[]> => {
  // In production, this would fetch from your blog API/database
  const mockBlogPosts = [
    {
      slug: 'welcome-to-nexural',
      lastmod: '2024-01-15T10:30:00.000Z',
      priority: 0.7
    },
    {
      slug: 'advanced-trading-strategies',
      lastmod: '2024-01-14T15:20:00.000Z', 
      priority: 0.6
    },
    {
      slug: 'risk-management-guide',
      lastmod: '2024-01-13T09:45:00.000Z',
      priority: 0.6
    }
  ]

  return mockBlogPosts.map(post => ({
    url: `/blog/${post.slug}`,
    lastmod: post.lastmod,
    changefreq: 'monthly' as const,
    priority: post.priority
  }))
}

export const getDynamicHelpArticles = async (): Promise<SitemapEntry[]> => {
  // In production, fetch from knowledge base
  const mockArticles = [
    {
      slug: 'welcome-to-nexural',
      category: 'getting-started',
      lastmod: '2024-01-15T10:30:00.000Z',
      priority: 0.6
    },
    {
      slug: 'account-setup',
      category: 'getting-started', 
      lastmod: '2024-01-14T15:20:00.000Z',
      priority: 0.6
    }
  ]

  return mockArticles.map(article => ({
    url: `/help/article/${article.slug}`,
    lastmod: article.lastmod,
    changefreq: 'monthly' as const,
    priority: article.priority
  }))
}

export const getDynamicAuthors = async (): Promise<SitemapEntry[]> => {
  // In production, fetch from authors database
  const mockAuthors = [
    { slug: 'nexural-team', lastmod: '2024-01-10T00:00:00.000Z' },
    { slug: 'john-smith', lastmod: '2024-01-08T00:00:00.000Z' },
    { slug: 'sarah-johnson', lastmod: '2024-01-05T00:00:00.000Z' }
  ]

  return mockAuthors.map(author => ({
    url: `/author/${author.slug}`,
    lastmod: author.lastmod,
    changefreq: 'weekly' as const,
    priority: 0.4
  }))
}

export const generateSitemap = async (config: SitemapConfig): Promise<string> => {
  const allEntries: SitemapEntry[] = []

  // Add static pages
  allEntries.push(...STATIC_PAGES)

  // Add dynamic content
  try {
    const [blogPosts, helpArticles, authors] = await Promise.all([
      getDynamicBlogPosts(),
      getDynamicHelpArticles(), 
      getDynamicAuthors()
    ])

    allEntries.push(...blogPosts, ...helpArticles, ...authors)
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error)
  }

  // Filter out excluded patterns
  const filteredEntries = allEntries.filter(entry => {
    if (!config.excludePatterns) return true
    return !config.excludePatterns.some(pattern => 
      new RegExp(pattern).test(entry.url)
    )
  })

  // Generate XML
  const urlElements = filteredEntries.map(entry => {
    const url = entry.url.startsWith('http') ? entry.url : `${config.baseUrl}${entry.url}`
    const lastmod = entry.lastmod || new Date().toISOString()
    const changefreq = entry.changefreq || config.defaultChangefreq
    const priority = entry.priority !== undefined ? entry.priority : config.defaultPriority

    let urlXml = `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>`

    // Add alternate language links if available
    if (entry.alternates && entry.alternates.length > 0) {
      entry.alternates.forEach(alternate => {
        urlXml += `
    <xhtml:link rel="alternate" hreflang="${alternate.lang}" href="${escapeXml(alternate.href)}" />`
      })
    }

    urlXml += `
  </url>`

    return urlXml
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlElements}
</urlset>`
}

export const generateSitemapIndex = async (sitemaps: { name: string, url: string, lastmod?: string }[]): Promise<string> => {
  const sitemapElements = sitemaps.map(sitemap => `  <sitemap>
    <loc>${escapeXml(sitemap.url)}</loc>
    <lastmod>${sitemap.lastmod || new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`
}

export const generateRobotsTxt = (config: {
  baseUrl: string
  sitemapUrl: string
  disallowPaths?: string[]
  allowPaths?: string[]
  crawlDelay?: number
}): string => {
  const disallows = config.disallowPaths || [
    '/admin/*',
    '/api/*',
    '/dashboard/*',
    '/profile/*',
    '/_next/*',
    '/static/*'
  ]

  const allows = config.allowPaths || []

  let robotsContent = `User-agent: *\n`

  // Add disallow rules
  disallows.forEach(path => {
    robotsContent += `Disallow: ${path}\n`
  })

  // Add allow rules (overrides disallows)
  allows.forEach(path => {
    robotsContent += `Allow: ${path}\n`
  })

  // Add crawl delay if specified
  if (config.crawlDelay) {
    robotsContent += `Crawl-delay: ${config.crawlDelay}\n`
  }

  // Add sitemap reference
  robotsContent += `\nSitemap: ${config.sitemapUrl}\n`

  return robotsContent
}

// Utility functions
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const validateSitemap = (xmlContent: string): { valid: boolean, errors: string[] } => {
  const errors: string[] = []

  // Basic XML structure validation
  if (!xmlContent.includes('<?xml version="1.0"')) {
    errors.push('Missing XML declaration')
  }

  if (!xmlContent.includes('<urlset')) {
    errors.push('Missing urlset element')
  }

  // Check for required elements
  const urlMatches = xmlContent.match(/<url>/g)
  const locMatches = xmlContent.match(/<loc>/g)

  if (urlMatches && locMatches && urlMatches.length !== locMatches.length) {
    errors.push('Mismatch between url and loc elements')
  }

  // Validate URLs (basic check)
  const urlPattern = /<loc>(.*?)<\/loc>/g
  let urlMatch
  while ((urlMatch = urlPattern.exec(xmlContent)) !== null) {
    const url = urlMatch[1]
    try {
      new URL(url)
    } catch {
      errors.push(`Invalid URL: ${url}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Pre-configured sitemap generators for common use cases
export const generateMainSitemap = async (baseUrl: string = 'https://nexuraltrading.com'): Promise<string> => {
  return generateSitemap({
    baseUrl,
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5,
    excludePatterns: [
      '^/admin',
      '^/api',
      '^/_next',
      '\\.(json|xml|txt)$'
    ]
  })
}

export const generateBlogSitemap = async (baseUrl: string = 'https://nexuraltrading.com'): Promise<string> => {
  const blogPosts = await getDynamicBlogPosts()
  
  return generateSitemap({
    baseUrl,
    defaultChangefreq: 'monthly',
    defaultPriority: 0.6,
    excludePatterns: []
  })
}

// Export configuration for easy customization
export const DEFAULT_CONFIG: SitemapConfig = {
  baseUrl: 'https://nexuraltrading.com',
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5,
  excludePatterns: [
    '^/admin',
    '^/api', 
    '^/_next',
    '^/dashboard',
    '^/profile'
  ],
  includeImages: true,
  includeVideos: false
}

// Export for testing
export const __testing__ = {
  escapeXml,
  validateSitemap
}


