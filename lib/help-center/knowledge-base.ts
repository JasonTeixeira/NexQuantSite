/**
 * Help Center Knowledge Base System - Professional Grade
 * Handles articles, FAQs, categories, and search functionality
 */

export interface KnowledgeBaseArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  subcategory?: string
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'user' | 'premium' | 'admin'
  priority: 'low' | 'medium' | 'high' | 'critical'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  readTime: number // minutes
  views: number
  upvotes: number
  downvotes: number
  helpful: number
  notHelpful: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  featuredImage?: string
  attachments: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]
  relatedArticles: string[]
  translations?: Record<string, string>
  seoTitle?: string
  seoDescription?: string
  searchKeywords: string[]
}

export interface HelpCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order: number
  parentId?: string
  children?: HelpCategory[]
  articleCount: number
  isVisible: boolean
  accessLevel: 'public' | 'user' | 'premium' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  order: number
  isVisible: boolean
  accessLevel: 'public' | 'user' | 'premium' | 'admin'
  views: number
  helpful: number
  notHelpful: number
  createdAt: string
  updatedAt: string
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  type: 'article' | 'faq' | 'category'
  url: string
  category: string
  relevanceScore: number
  highlightedContent?: string
  breadcrumb: string[]
}

export interface HelpCenterStats {
  totalArticles: number
  totalFAQs: number
  totalViews: number
  avgRating: number
  popularArticles: {
    id: string
    title: string
    views: number
    rating: number
  }[]
  categoryStats: {
    category: string
    articleCount: number
    views: number
    avgRating: number
  }[]
  recentActivity: {
    type: 'article_created' | 'article_updated' | 'faq_created' | 'user_feedback'
    title: string
    timestamp: string
    user?: string
  }[]
}

// Mock Knowledge Base Data
export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Everything you need to know to get started with Nexural Trading',
    icon: 'Play',
    color: 'green',
    order: 1,
    articleCount: 12,
    isVisible: true,
    accessLevel: 'public',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'trading-basics',
    name: 'Trading Basics',
    slug: 'trading-basics',
    description: 'Fundamental trading concepts and strategies',
    icon: 'TrendingUp',
    color: 'blue',
    order: 2,
    articleCount: 25,
    isVisible: true,
    accessLevel: 'public',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'platform-features',
    name: 'Platform Features',
    slug: 'platform-features',
    description: 'Learn how to use all platform features and tools',
    icon: 'Settings',
    color: 'purple',
    order: 3,
    articleCount: 18,
    isVisible: true,
    accessLevel: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'advanced-strategies',
    name: 'Advanced Strategies',
    slug: 'advanced-strategies',
    description: 'Advanced trading strategies and techniques',
    icon: 'Brain',
    color: 'red',
    order: 4,
    articleCount: 15,
    isVisible: true,
    accessLevel: 'premium',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    slug: 'api-documentation',
    description: 'Developer resources and API documentation',
    icon: 'Code',
    color: 'orange',
    order: 5,
    articleCount: 8,
    isVisible: true,
    accessLevel: 'premium',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'account-billing',
    name: 'Account & Billing',
    slug: 'account-billing',
    description: 'Account management, billing, and subscription help',
    icon: 'CreditCard',
    color: 'yellow',
    order: 6,
    articleCount: 10,
    isVisible: true,
    accessLevel: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    slug: 'troubleshooting',
    description: 'Common issues and how to resolve them',
    icon: 'AlertCircle',
    color: 'gray',
    order: 7,
    articleCount: 20,
    isVisible: true,
    accessLevel: 'public',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    slug: 'security-compliance',
    description: 'Security features, compliance, and best practices',
    icon: 'Shield',
    color: 'indigo',
    order: 8,
    articleCount: 6,
    isVisible: true,
    accessLevel: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: 'welcome-to-nexural',
    title: 'Welcome to Nexural Trading Platform',
    slug: 'welcome-to-nexural',
    content: `# Welcome to Nexural Trading Platform

Welcome to the future of AI-powered trading! This comprehensive guide will help you get started with the Nexural Trading platform.

## What is Nexural Trading?

Nexural Trading is an advanced AI-powered trading platform that democratizes institutional-grade trading strategies for retail traders worldwide. Our platform combines cutting-edge neural network technology with intuitive design to provide you with the tools you need to succeed in today's markets.

### Key Features:

- **AI-Powered Trading Bots**: Automated trading systems powered by advanced machine learning
- **Real-Time Market Analysis**: Live data feeds and comprehensive market insights  
- **Educational Resources**: Extensive learning materials and expert insights
- **Risk Management Tools**: Advanced risk assessment and portfolio optimization
- **Community Features**: Connect with other traders and share strategies

## Getting Started

1. **Create Your Account**: Sign up for free and verify your email
2. **Complete Your Profile**: Add your trading experience and risk preferences
3. **Explore the Platform**: Take our interactive tour to familiarize yourself
4. **Start Learning**: Access our educational resources and tutorials
5. **Begin Trading**: Start with paper trading to practice your strategies

## Support

If you need help at any time, our support team is here to assist you:
- Browse our Help Center for instant answers
- Chat with our AI assistant for quick help
- Submit a support ticket for personalized assistance
- Join our community forums for peer support

Ready to begin your trading journey? Let's get started!`,
    excerpt: 'Get started with Nexural Trading platform - your comprehensive guide to AI-powered trading success.',
    category: 'getting-started',
    tags: ['welcome', 'getting-started', 'platform', 'introduction'],
    author: {
      id: 'nexural-team',
      name: 'Nexural Team',
      avatar: '/team-avatar.jpg',
      role: 'Platform Team'
    },
    status: 'published',
    visibility: 'public',
    priority: 'high',
    difficulty: 'beginner',
    readTime: 5,
    views: 15420,
    upvotes: 1245,
    downvotes: 23,
    helpful: 1398,
    notHelpful: 52,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    publishedAt: '2024-01-01T00:00:00.000Z',
    featuredImage: '/help-welcome-banner.jpg',
    attachments: [],
    relatedArticles: ['account-setup', 'platform-tour', 'first-trade'],
    searchKeywords: ['welcome', 'getting started', 'introduction', 'platform overview', 'nexural trading']
  },
  {
    id: 'account-setup',
    title: 'Setting Up Your Trading Account',
    slug: 'account-setup',
    content: `# Setting Up Your Trading Account

This guide will walk you through setting up your Nexural Trading account for optimal performance and security.

## Account Creation

### Step 1: Registration
1. Visit the registration page
2. Enter your email and create a strong password
3. Accept the terms of service and privacy policy
4. Click "Create Account"

### Step 2: Email Verification
1. Check your email for a verification link
2. Click the link to verify your account
3. Your account is now active

## Profile Completion

### Personal Information
- Add your first and last name
- Upload a profile picture (optional)
- Set your timezone and language preferences

### Trading Experience
- Select your trading experience level
- Choose your risk tolerance
- Set your investment goals

### Security Settings
- Enable two-factor authentication (recommended)
- Set up security questions
- Review login notification settings

## Account Verification

For enhanced features and higher limits, complete account verification:

1. **Identity Verification**: Upload a government-issued ID
2. **Address Verification**: Provide proof of address
3. **Phone Verification**: Verify your phone number

## Next Steps

Once your account is set up:
- Fund your account or start with paper trading
- Take the platform tour
- Explore educational resources
- Join the community

Your account setup is complete! You're ready to start trading.`,
    excerpt: 'Complete step-by-step guide to setting up your Nexural Trading account for maximum security and functionality.',
    category: 'getting-started',
    tags: ['account', 'setup', 'verification', 'security'],
    author: {
      id: 'nexural-team',
      name: 'Nexural Team',
      role: 'Platform Team'
    },
    status: 'published',
    visibility: 'public',
    priority: 'high',
    difficulty: 'beginner',
    readTime: 8,
    views: 12340,
    upvotes: 987,
    downvotes: 15,
    helpful: 1124,
    notHelpful: 34,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    publishedAt: '2024-01-02T00:00:00.000Z',
    attachments: [
      {
        id: 'setup-guide-pdf',
        name: 'Account Setup Guide.pdf',
        url: '/downloads/account-setup-guide.pdf',
        type: 'application/pdf',
        size: 2048000
      }
    ],
    relatedArticles: ['welcome-to-nexural', 'security-best-practices', 'platform-tour'],
    searchKeywords: ['account setup', 'registration', 'verification', 'profile', 'security']
  },
  // Add more articles...
]

export const FAQ_ITEMS: FAQ[] = [
  {
    id: 'what-is-nexural',
    question: 'What is Nexural Trading and how does it work?',
    answer: 'Nexural Trading is an AI-powered trading platform that uses advanced neural networks to analyze markets and execute trades. Our algorithms process vast amounts of market data to identify trading opportunities and manage risk automatically.',
    category: 'getting-started',
    tags: ['platform', 'ai', 'trading', 'basics'],
    order: 1,
    isVisible: true,
    accessLevel: 'public',
    views: 8945,
    helpful: 756,
    notHelpful: 23,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'is-it-safe',
    question: 'Is my money safe with Nexural Trading?',
    answer: 'Yes, your funds are secure. We use bank-level encryption, segregated accounts, and comply with financial regulations. We are also insured and regularly audited by third-party security firms.',
    category: 'security-compliance',
    tags: ['security', 'safety', 'funds', 'compliance'],
    order: 1,
    isVisible: true,
    accessLevel: 'public',
    views: 7234,
    helpful: 689,
    notHelpful: 12,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'minimum-deposit',
    question: 'What is the minimum deposit required?',
    answer: 'You can start with as little as $100. However, we recommend starting with at least $500 to take advantage of our diversified trading strategies effectively.',
    category: 'account-billing',
    tags: ['deposit', 'minimum', 'funding', 'account'],
    order: 1,
    isVisible: true,
    accessLevel: 'public',
    views: 6789,
    helpful: 594,
    notHelpful: 18,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'trading-hours',
    question: 'What are the trading hours?',
    answer: 'Our AI bots trade 24/7 across global markets including forex, crypto, and futures. Stock trading follows regular market hours (9:30 AM - 4:00 PM ET for US markets).',
    category: 'trading-basics',
    tags: ['hours', 'schedule', 'markets', 'availability'],
    order: 1,
    isVisible: true,
    accessLevel: 'public',
    views: 5432,
    helpful: 478,
    notHelpful: 9,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'fees-charges',
    question: 'What fees do you charge?',
    answer: 'We charge a performance fee of 20% on profits only. There are no management fees, deposit fees, or hidden charges. You only pay when you make money.',
    category: 'account-billing',
    tags: ['fees', 'charges', 'performance', 'pricing'],
    order: 2,
    isVisible: true,
    accessLevel: 'public',
    views: 5123,
    helpful: 445,
    notHelpful: 15,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// Knowledge Base Utility Functions
export const getArticlesByCategory = (categoryId: string, accessLevel: string = 'public'): KnowledgeBaseArticle[] => {
  return KNOWLEDGE_BASE_ARTICLES.filter(article => 
    article.category === categoryId && 
    article.status === 'published' &&
    canAccessArticle(article, accessLevel)
  )
}

export const getFAQsByCategory = (categoryId: string, accessLevel: string = 'public'): FAQ[] => {
  return FAQ_ITEMS.filter(faq => 
    faq.category === categoryId && 
    faq.isVisible &&
    canAccessFAQ(faq, accessLevel)
  ).sort((a, b) => a.order - b.order)
}

export const searchKnowledgeBase = (query: string, accessLevel: string = 'public'): SearchResult[] => {
  const results: SearchResult[] = []
  const searchTerms = query.toLowerCase().split(' ')
  
  // Search articles
  KNOWLEDGE_BASE_ARTICLES.forEach(article => {
    if (!canAccessArticle(article, accessLevel)) return
    
    let relevanceScore = 0
    const content = (article.title + ' ' + article.excerpt + ' ' + article.content + ' ' + article.searchKeywords.join(' ')).toLowerCase()
    
    searchTerms.forEach(term => {
      const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length
      const contentMatches = (content.match(new RegExp(term, 'g')) || []).length
      
      relevanceScore += titleMatches * 10 + contentMatches
    })
    
    if (relevanceScore > 0) {
      const category = HELP_CATEGORIES.find(cat => cat.id === article.category)
      results.push({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        type: 'article',
        url: `/help/article/${article.slug}`,
        category: category?.name || 'Uncategorized',
        relevanceScore,
        breadcrumb: [category?.name || 'Help', article.title]
      })
    }
  })
  
  // Search FAQs
  FAQ_ITEMS.forEach(faq => {
    if (!canAccessFAQ(faq, accessLevel)) return
    
    let relevanceScore = 0
    const content = (faq.question + ' ' + faq.answer).toLowerCase()
    
    searchTerms.forEach(term => {
      const matches = (content.match(new RegExp(term, 'g')) || []).length
      relevanceScore += matches * 5
    })
    
    if (relevanceScore > 0) {
      const category = HELP_CATEGORIES.find(cat => cat.id === faq.category)
      results.push({
        id: faq.id,
        title: faq.question,
        excerpt: faq.answer.substring(0, 150) + '...',
        type: 'faq',
        url: `/help/faq/${faq.id}`,
        category: category?.name || 'FAQ',
        relevanceScore,
        breadcrumb: ['FAQ', faq.question]
      })
    }
  })
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export const getPopularArticles = (limit: number = 5, accessLevel: string = 'public'): KnowledgeBaseArticle[] => {
  return KNOWLEDGE_BASE_ARTICLES
    .filter(article => canAccessArticle(article, accessLevel))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export const getRecentArticles = (limit: number = 5, accessLevel: string = 'public'): KnowledgeBaseArticle[] => {
  return KNOWLEDGE_BASE_ARTICLES
    .filter(article => canAccessArticle(article, accessLevel))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

export const getHelpCenterStats = (): HelpCenterStats => {
  return {
    totalArticles: KNOWLEDGE_BASE_ARTICLES.filter(a => a.status === 'published').length,
    totalFAQs: FAQ_ITEMS.filter(f => f.isVisible).length,
    totalViews: KNOWLEDGE_BASE_ARTICLES.reduce((sum, a) => sum + a.views, 0) + 
                FAQ_ITEMS.reduce((sum, f) => sum + f.views, 0),
    avgRating: 4.6,
    popularArticles: getPopularArticles(5).map(a => ({
      id: a.id,
      title: a.title,
      views: a.views,
      rating: (a.upvotes / (a.upvotes + a.downvotes)) * 5
    })),
    categoryStats: HELP_CATEGORIES.map(cat => ({
      category: cat.name,
      articleCount: getArticlesByCategory(cat.id).length,
      views: getArticlesByCategory(cat.id).reduce((sum, a) => sum + a.views, 0),
      avgRating: 4.5
    })),
    recentActivity: [
      { type: 'article_created', title: 'New Trading Strategy Guide', timestamp: '2024-01-15T10:30:00.000Z' },
      { type: 'faq_created', title: 'How to set stop losses?', timestamp: '2024-01-14T15:20:00.000Z' },
      { type: 'article_updated', title: 'Platform Security Update', timestamp: '2024-01-13T09:45:00.000Z' }
    ]
  }
}

// Access Control Helpers
const canAccessArticle = (article: KnowledgeBaseArticle, userLevel: string): boolean => {
  const accessHierarchy = { 'public': 0, 'user': 1, 'premium': 2, 'admin': 3 }
  return accessHierarchy[userLevel as keyof typeof accessHierarchy] >= accessHierarchy[article.visibility as keyof typeof accessHierarchy]
}

const canAccessFAQ = (faq: FAQ, userLevel: string): boolean => {
  const accessHierarchy = { 'public': 0, 'user': 1, 'premium': 2, 'admin': 3 }
  return accessHierarchy[userLevel as keyof typeof accessHierarchy] >= accessHierarchy[faq.accessLevel as keyof typeof accessHierarchy]
}

// Export functions for testing
export const __testing__ = {
  canAccessArticle,
  canAccessFAQ
}


