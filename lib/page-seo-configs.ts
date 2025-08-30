import { seoEngine } from "./seo-optimization-engine"

export const pageSEOConfigs = {
  home: {
    title: "NEXURAL - Advanced AI Trading Platform | Automated Trading Bots & Signals",
    description:
      "Professional AI-powered trading platform with automated bots, real-time signals, and advanced analytics. Start algorithmic trading with NEXURAL's cutting-edge technology.",
    keywords: [
      "AI trading platform",
      "automated trading bots",
      "algorithmic trading",
      "trading signals",
      "crypto trading",
      "forex trading",
      "quantitative trading",
      "portfolio management",
      "technical analysis",
      "backtesting",
      "risk management",
      "fintech platform",
    ],
    structuredData: seoEngine.generateOrganizationSchema(),
  },

  about: {
    title: "About NEXURAL - Leading AI Trading Technology Company",
    description:
      "Learn about NEXURAL's mission to democratize professional trading through AI-powered automation, advanced analytics, and cutting-edge financial technology.",
    keywords: [
      "about NEXURAL",
      "trading technology company",
      "AI trading innovation",
      "financial technology",
      "algorithmic trading company",
      "fintech startup",
    ],
  },

  pricing: {
    title: "NEXURAL Pricing Plans - Choose Your Trading Package",
    description:
      "Flexible pricing plans for every trader. From basic signals to advanced AI bots. Start free or choose professional plans with premium features and priority support.",
    keywords: [
      "trading platform pricing",
      "algorithmic trading costs",
      "trading bot subscription",
      "professional trading plans",
      "AI trading pricing",
      "trading signals cost",
    ],
  },

  dashboard: {
    title: "Trading Dashboard - NEXURAL Platform",
    description:
      "Access your personalized trading dashboard with real-time portfolio analytics, bot performance, trading signals, and comprehensive market insights.",
    keywords: [
      "trading dashboard",
      "portfolio analytics",
      "trading performance",
      "real-time trading data",
      "trading bot management",
      "market insights",
    ],
    noIndex: true, // Private user area
  },

  bots: {
    title: "AI Trading Bots - Automated Trading Strategies | NEXURAL",
    description:
      "Discover powerful AI trading bots with proven strategies. Automated crypto, forex, and stock trading with advanced risk management and backtesting.",
    keywords: [
      "AI trading bots",
      "automated trading strategies",
      "crypto trading bots",
      "forex trading automation",
      "algorithmic trading bots",
      "trading bot marketplace",
    ],
  },

  indicators: {
    title: "Technical Indicators & Analysis Tools - NEXURAL Platform",
    description:
      "Comprehensive library of technical indicators and analysis tools. RSI, MACD, Bollinger Bands, and custom indicators for professional trading.",
    keywords: [
      "technical indicators",
      "trading analysis tools",
      "RSI indicator",
      "MACD analysis",
      "Bollinger Bands",
      "custom trading indicators",
    ],
  },

  signals: {
    title: "Trading Signals - Real-Time Market Alerts | NEXURAL",
    description:
      "Get real-time trading signals powered by AI analysis. Crypto, forex, and stock signals with entry/exit points and risk management.",
    keywords: [
      "trading signals",
      "real-time market alerts",
      "AI trading signals",
      "crypto signals",
      "forex signals",
      "stock trading alerts",
    ],
  },

  blog: {
    title: "Trading Education & Market Analysis Blog | NEXURAL",
    description:
      "Expert trading insights, market analysis, and educational content. Learn algorithmic trading, technical analysis, and advanced trading strategies.",
    keywords: [
      "trading education",
      "market analysis blog",
      "algorithmic trading guide",
      "technical analysis tutorials",
      "trading strategies",
      "financial education",
    ],
  },

  contact: {
    title: "Contact NEXURAL - Get Trading Platform Support",
    description:
      "Contact NEXURAL support team for trading platform assistance, technical support, or partnership inquiries. 24/7 customer service available.",
    keywords: [
      "NEXURAL contact",
      "trading platform support",
      "customer service",
      "technical support",
      "trading help",
      "platform assistance",
    ],
  },

  legal: {
    title: "Legal Information - Terms, Privacy & Compliance | NEXURAL",
    description:
      "NEXURAL legal information including terms of service, privacy policy, risk disclosure, and regulatory compliance for our trading platform.",
    keywords: [
      "NEXURAL legal",
      "terms of service",
      "privacy policy",
      "trading platform compliance",
      "risk disclosure",
      "regulatory information",
    ],
  },
}

// Generate sitemap data
export const sitemapPages = [
  {
    path: "/",
    title: "Home",
    description: pageSEOConfigs.home.description,
    keywords: pageSEOConfigs.home.keywords,
    lastModified: new Date(),
    priority: 1.0,
    changeFreq: "daily" as const,
  },
  {
    path: "/about",
    title: "About",
    description: pageSEOConfigs.about.description,
    keywords: pageSEOConfigs.about.keywords,
    lastModified: new Date(),
    priority: 0.8,
    changeFreq: "monthly" as const,
  },
  {
    path: "/pricing",
    title: "Pricing",
    description: pageSEOConfigs.pricing.description,
    keywords: pageSEOConfigs.pricing.keywords,
    lastModified: new Date(),
    priority: 0.9,
    changeFreq: "weekly" as const,
  },
  {
    path: "/bots",
    title: "Trading Bots",
    description: pageSEOConfigs.bots.description,
    keywords: pageSEOConfigs.bots.keywords,
    lastModified: new Date(),
    priority: 0.9,
    changeFreq: "daily" as const,
  },
  {
    path: "/indicators",
    title: "Indicators",
    description: pageSEOConfigs.indicators.description,
    keywords: pageSEOConfigs.indicators.keywords,
    lastModified: new Date(),
    priority: 0.8,
    changeFreq: "weekly" as const,
  },
  {
    path: "/signals-pro",
    title: "Signals",
    description: pageSEOConfigs.signals.description,
    keywords: pageSEOConfigs.signals.keywords,
    lastModified: new Date(),
    priority: 0.9,
    changeFreq: "daily" as const,
  },
  {
    path: "/blog",
    title: "Blog",
    description: pageSEOConfigs.blog.description,
    keywords: pageSEOConfigs.blog.keywords,
    lastModified: new Date(),
    priority: 0.8,
    changeFreq: "daily" as const,
  },
  {
    path: "/contact",
    title: "Contact",
    description: pageSEOConfigs.contact.description,
    keywords: pageSEOConfigs.contact.keywords,
    lastModified: new Date(),
    priority: 0.7,
    changeFreq: "monthly" as const,
  },
  {
    path: "/legal",
    title: "Legal",
    description: pageSEOConfigs.legal.description,
    keywords: pageSEOConfigs.legal.keywords,
    lastModified: new Date(),
    priority: 0.5,
    changeFreq: "yearly" as const,
  },
]
