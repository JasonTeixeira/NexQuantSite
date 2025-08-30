import type { Metadata } from "next"
import { notFound } from "next/navigation"
import AuthorProfileClient from "@/components/AuthorProfileClient"

// Mock author data - in production, fetch from your database
const authors = {
  "dr-evelyn-reed": {
    name: "Dr. Evelyn Reed",
    displayName: "Dr. Evelyn Reed",
    avatar: "/placeholder.svg?height=200&width=200",
    expertise: "Quantitative Analysis",
    bio: "Dr. Evelyn Reed is a leading expert in quantitative finance with over 15 years of experience in algorithmic trading strategies. She holds a PhD in Financial Mathematics from MIT and has worked with top-tier investment firms developing cutting-edge trading systems.",
    credentials: [
      "PhD in Financial Mathematics, MIT",
      "CFA Charter Holder",
      "Former VP of Quantitative Research at Goldman Sachs",
      "Published researcher in Journal of Financial Economics"
    ],
    socialLinks: {
      twitter: "@dr_evelyn_reed",
      linkedin: "linkedin.com/in/dr-evelyn-reed",
      website: "https://evelynreed.com"
    },
    stats: {
      articles: 24,
      followers: 12400,
      totalViews: 287000,
      averageRating: 4.8
    },
    recentArticles: [
      {
        title: "Advanced Risk Metrics for Algorithmic Trading",
        slug: "advanced-risk-metrics-algorithmic-trading",
        publishedAt: "2024-01-18",
        views: 5200,
        excerpt: "Deep dive into sophisticated risk measurement techniques used by professional quant funds."
      },
      {
        title: "Understanding Market Volatility: A Quant's Perspective",
        slug: "understanding-market-volatility-quant-perspective",
        publishedAt: "2024-01-12", 
        views: 8900,
        excerpt: "Comprehensive analysis of volatility patterns and their implications for systematic trading."
      },
      {
        title: "Machine Learning Applications in Options Pricing",
        slug: "machine-learning-options-pricing",
        publishedAt: "2024-01-05",
        views: 6700,
        excerpt: "Exploring how modern ML techniques are revolutionizing derivatives pricing models."
      }
    ]
  },
  "jian-li": {
    name: "Jian Li",
    displayName: "Jian Li",
    avatar: "/placeholder.svg?height=200&width=200", 
    expertise: "Technical Analysis",
    bio: "Jian Li is a seasoned technical analyst specializing in cryptocurrency and forex markets. With 12+ years of trading experience, he combines traditional chart analysis with modern algorithmic approaches to identify high-probability setups.",
    credentials: [
      "Certified Market Technician (CMT)",
      "12+ Years Professional Trading Experience", 
      "Former Head of Technical Analysis at Crypto Capital",
      "Regular contributor to Trading View and Finance magazines"
    ],
    socialLinks: {
      twitter: "@jian_trades",
      linkedin: "linkedin.com/in/jian-li-analyst",
      website: "https://jianli-analysis.com"
    },
    stats: {
      articles: 18,
      followers: 8900,
      totalViews: 156000,
      averageRating: 4.6
    },
    recentArticles: [
      {
        title: "Cryptocurrency Chart Patterns That Actually Work",
        slug: "crypto-chart-patterns-that-work",
        publishedAt: "2024-01-15",
        views: 12300,
        excerpt: "Identifying the most reliable chart patterns in volatile crypto markets."
      },
      {
        title: "Support and Resistance in Modern Markets",
        slug: "support-resistance-modern-markets", 
        publishedAt: "2024-01-08",
        views: 7600,
        excerpt: "How traditional S&R levels adapt to algorithmic trading environments."
      }
    ]
  },
  "the-nexural-team": {
    name: "The Nexural Team",
    displayName: "The Nexural Team",
    avatar: "/placeholder.svg?height=200&width=200",
    expertise: "Platform Development",
    bio: "The Nexural development and research team combines decades of experience in quantitative finance, software engineering, and market analysis. Our mission is to democratize advanced trading tools and education for retail traders worldwide.",
    credentials: [
      "Collective 50+ years in FinTech",
      "Former engineers from top trading firms",
      "Published research in algorithmic trading",
      "Industry-leading platform development"
    ],
    socialLinks: {
      twitter: "@nexural_trading",
      linkedin: "linkedin.com/company/nexural",
      website: "https://nexural.com"
    },
    stats: {
      articles: 32,
      followers: 15600,
      totalViews: 421000,
      averageRating: 4.9
    },
    recentArticles: [
      {
        title: "Building Robust Trading Systems: Best Practices",
        slug: "building-robust-trading-systems",
        publishedAt: "2024-01-20",
        views: 9800,
        excerpt: "Essential principles for creating reliable algorithmic trading infrastructure."
      },
      {
        title: "The Future of Retail Algorithmic Trading",
        slug: "future-retail-algorithmic-trading",
        publishedAt: "2024-01-14",
        views: 11200,
        excerpt: "How technology is leveling the playing field for individual traders."
      }
    ]
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const author = authors[resolvedParams.slug as keyof typeof authors]
  
  if (!author) {
    return {
      title: "Author Not Found | Nexural Trading Blog"
    }
  }

  return {
    title: `${author.name} - Trading Expert | Nexural Trading Blog`,
    description: author.bio,
    keywords: `${author.name}, ${author.expertise}, trading expert, market analysis, financial education`,
    openGraph: {
      title: `${author.name} - Trading Expert`,
      description: author.bio,
      type: "profile",
      siteName: "Nexural Trading",
    },
  }
}

export default async function AuthorProfilePage({ params }: Props) {
  const resolvedParams = await params
  const author = authors[resolvedParams.slug as keyof typeof authors]

  if (!author) {
    notFound()
  }

  return <AuthorProfileClient author={author} />
}
