// 📰 LEARNING ARTICLES API
import { NextRequest, NextResponse } from 'next/server'

const mockArticles = [
  {
    id: 'article-1',
    title: 'Understanding Market Volatility in 2024',
    excerpt: 'Learn how to navigate and profit from market volatility using proven strategies',
    author: 'James Thompson',
    publishedAt: '2024-01-15T10:00:00Z',
    readTime: '8 min',
    category: 'Market Analysis',
    tags: ['volatility', 'risk management', 'trading strategies'],
    views: 12453,
    likes: 892
  },
  {
    id: 'article-2',
    title: 'The Complete Guide to Stop Loss Strategies',
    excerpt: 'Master the art of protecting your capital with effective stop loss techniques',
    author: 'Emily Rodriguez',
    publishedAt: '2024-01-10T14:30:00Z',
    readTime: '12 min',
    category: 'Risk Management',
    tags: ['stop loss', 'risk management', 'position sizing'],
    views: 8932,
    likes: 654
  },
  {
    id: 'article-3',
    title: 'AI and Machine Learning in Trading: 2024 Trends',
    excerpt: 'Discover how artificial intelligence is revolutionizing trading strategies',
    author: 'Dr. Alex Kumar',
    publishedAt: '2024-01-05T09:15:00Z',
    readTime: '15 min',
    category: 'Technology',
    tags: ['AI', 'machine learning', 'algorithmic trading'],
    views: 15678,
    likes: 1234
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let filteredArticles = [...mockArticles]
    if (category) {
      filteredArticles = filteredArticles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    return NextResponse.json({
      success: true,
      articles: filteredArticles,
      total: filteredArticles.length,
      categories: ['Market Analysis', 'Risk Management', 'Technology', 'Trading Psychology', 'Strategies']
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

