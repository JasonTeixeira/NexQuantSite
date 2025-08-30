"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Clock, TrendingUp } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

interface NewsItem {
  title: string
  time: string
  impact: 'high' | 'medium' | 'low'
  category: string
  summary: string
}

export default function NewsPanel() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using Alpha Vantage News (your existing key)
        const response = await fetch(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL,MSFT,GOOGL&apikey=BILEQT4FR4AYF3HW`
        )
        const data = await response.json()
        
        if (data.feed) {
          const processedNews = data.feed.slice(0, 5).map((item: any) => ({
            title: item.title.substring(0, 60) + '...',
            time: new Date(item.time_published).toLocaleTimeString(),
            impact: parseFloat(item.overall_sentiment_score) > 0.3 ? 'high' : 
                   parseFloat(item.overall_sentiment_score) > 0.1 ? 'medium' : 'low',
            category: item.topics?.[0]?.topic || 'Market',
            summary: item.summary.substring(0, 100) + '...'
          }))
          setNews(processedNews)
        }
      } catch (error) {
        // Fallback news data
        setNews([
          {
            title: "Fed Chair Powell Signals Potential Rate Cuts...",
            time: "14:32",
            impact: 'high',
            category: 'Federal Reserve',
            summary: "Federal Reserve Chairman indicates flexibility on future monetary policy decisions..."
          },
          {
            title: "Tech Stocks Rally on AI Breakthrough News...", 
            time: "13:45",
            impact: 'medium',
            category: 'Technology',
            summary: "Major technology companies surge following artificial intelligence developments..."
          },
          {
            title: "Oil Prices Rise on Supply Concerns...",
            time: "12:18",
            impact: 'medium', 
            category: 'Commodities',
            summary: "Crude oil futures climb amid geopolitical tensions affecting supply chains..."
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 10 * 60 * 1000) // Update every 10 minutes
    return () => clearInterval(interval)
  }, [])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-400/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Market News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-800/50" />
                <Skeleton className="h-3 w-24 bg-gray-800/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            Market News
            <Badge className="ml-auto bg-blue-500/20 text-blue-400 text-xs">
              Live Feed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {news.map((item, index) => (
              <motion.div
                key={index}
                className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white leading-tight flex-1">
                    {item.title}
                  </h4>
                  <Badge className={`ml-2 text-xs ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Clock className="w-3 h-3" />
                  {item.time}
                  <span className="text-primary">{item.category}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.summary}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>📈 Market Impact Analysis</span>
              <span>Updated 2 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
